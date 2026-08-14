// Host half of dsh-local-project (Grok-style model, pull-only sync): the user's
// local folder is mirrored into a real server workspace directory at import.
// Afterwards the server watches that directory with fs.watch; when DSH modifies
// files there, the browser pulls those changes down to the local folder. There
// is no continuous two-way sync — local edits are not auto-uploaded.

import type { IncomingMessage, ServerResponse } from 'node:http'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, watch } from 'node:fs'
import type { FSWatcher } from 'node:fs'
import { dirname, join, normalize, relative, sep } from 'node:path'
import { homedir } from 'node:os'
import { WebSocketServer } from 'ws'
import type { WebSocket } from 'ws'

export const name = 'dsh-local-project'
export const inject = ['webServer', 'workspaceRegistry']

interface Ctx {
  webServer: {
    register(route: { kind: string; path: string; handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void> }): () => void
    registerUpgrade(route: {
      path: string
      handler: (req: IncomingMessage, socket: import('node:stream').Duplex, head: Buffer) => void | Promise<void>
    }): () => void
  }
  workspaceRegistry: {
    create(path: string, title?: string): Promise<{ id: string; path: string; title: string }>
    resolveByPath(path: string): Promise<{ id: string; path: string; title: string } | undefined>
    delete(id: string): Promise<boolean>
  }
  effect(disposer: () => () => void, label?: string): void
  logger?: { warn(msg: unknown): void; error(msg: unknown): void }
}

interface ProjectWatcher {
  rev: number
  pathRev: Map<string, number>
  fullDirtyRev: number
  watcher: FSWatcher | null
}

function dshHome(): string {
  return process.env.DSH_HOME || join(homedir(), '.dsh')
}

function rootDir(): string {
  return process.env.DSH_LOCAL_PROJECT_ROOT || join(dshHome(), 'workspaces')
}

function sanitizeName(name: unknown): string {
  const s = typeof name === 'string' ? name.trim() : ''
  if (!s || s.length > 64 || /[\\/]|\.\./.test(s)) return ''
  return s
}

function safeTarget(dir: string, rel: unknown): string | null {
  if (typeof rel !== 'string') return null
  const s = rel.replace(/\\/g, '/')
  if (!s || s.includes('..') || s.includes('\0')) return null
  const target = normalize(join(dir, s))
  if (target !== dir && !target.startsWith(dir + sep)) return null
  return target
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(body)
}

function readJson(req: IncomingMessage, maxBytes: number): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk: string) => {
      body += chunk
      if (body.length > maxBytes) {
        reject(new Error('请求体过大'))
        req.destroy()
      }
    })
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {}
        resolve(typeof parsed === 'object' && parsed !== null ? parsed : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function walkFiles(dir: string, base: string, out: Record<string, { size: number; mtimeMs: number }>): void {
  let entries: import('node:fs').Dirent[]
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const abs = join(dir, entry.name)
    const rel = relative(base, abs).replace(/\\/g, '/')
    if (entry.isDirectory()) {
      walkFiles(abs, base, out)
    } else if (entry.isFile()) {
      try {
        const st = statSync(abs)
        out[rel] = { size: st.size, mtimeMs: st.mtimeMs }
      } catch {
        // skip unreadable files
      }
    }
  }
}

export function apply(ctx: Ctx) {
  const watchers = new Map<string, ProjectWatcher>()
  const sockets = new Map<string, Set<WebSocket>>()
  const wss = new WebSocketServer({ noServer: true })

  function broadcast(name: string, msg: unknown): void {
    const set = sockets.get(name)
    if (!set || set.size === 0) return
    const data = JSON.stringify(msg)
    for (const ws of set) {
      if (ws.readyState === 1 /* OPEN */) {
        try {
          ws.send(data)
        } catch {
          // ignore a dead socket; its close handler cleans up
        }
      }
    }
  }

  function ensureWatcher(name: string, dir: string): void {
    if (watchers.has(name)) return
    const w: ProjectWatcher = { rev: 0, pathRev: new Map(), fullDirtyRev: 0, watcher: null }
    try {
      w.watcher = watch(dir, { recursive: true }, (event, filename) => {
        w.rev++
        const paths: string[] = []
        if (filename) {
          const rel = String(filename).replace(/\\/g, '/')
          w.pathRev.set(rel, w.rev)
          paths.push(rel)
        } else {
          w.fullDirtyRev = w.rev
        }
        // Push the change set straight to connected browsers — no polling.
        broadcast(name, { type: 'changes', rev: w.rev, paths, full: w.fullDirtyRev === w.rev })
      })
    } catch {
      w.watcher = null
    }
    watchers.set(name, w)
  }

  function stopWatcher(name: string): void {
    const w = watchers.get(name)
    if (w) {
      try {
        w.watcher?.close()
      } catch {
        // ignore
      }
      watchers.delete(name)
    }
  }

  ctx.effect(
    () => () => {
      for (const w of watchers.values()) {
        try {
          w.watcher?.close()
        } catch {
          // ignore
        }
      }
      watchers.clear()
      for (const set of sockets.values()) {
        for (const ws of set) {
          try {
            ws.close()
          } catch {
            // ignore
          }
        }
      }
      sockets.clear()
      try {
        wss.close()
      } catch {
        // ignore
      }
    },
    'local-project: watchers cleanup',
  )

  ctx.effect(
    () =>
      ctx.webServer.registerUpgrade({
        path: '/local-project/ws',
        handler: (req, socket, head) => {
          const url = new URL(req.url ?? '/', 'http://x')
          const name = sanitizeName(url.searchParams.get('name'))
          if (!name) {
            socket.destroy()
            return
          }
          try {
            wss.handleUpgrade(req, socket, head, (ws) => {
              let set = sockets.get(name)
              if (!set) {
                set = new Set()
                sockets.set(name, set)
              }
              set.add(ws)
              ws.on('close', () => {
                set?.delete(ws)
                if (set && set.size === 0) sockets.delete(name)
              })
              ws.on('error', () => {
                try {
                  ws.close()
                } catch {
                  // ignore
                }
              })
            })
          } catch (err) {
            ctx.logger?.error(err)
            try {
              socket.destroy()
            } catch {
              // ignore
            }
          }
        },
      }),
    'local-project: websocket',
  )

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'prefix',
        path: '/local-project',
        handler: async (req, res) => {
          const url = new URL(req.url ?? '/', 'http://x')
          const pathname = url.pathname
          try {
            if (pathname === '/local-project/create' && req.method === 'POST') {
              const body = await readJson(req, 1_000_000)
              const name = sanitizeName(body?.name)
              if (!name) {
                sendJson(res, 400, { ok: false, error: '项目名称无效（不能包含 / \\ ..）' })
                return
              }
              const dir = join(rootDir(), name)
              mkdirSync(dir, { recursive: true })
              let existing: { id: string; path: string; title: string } | undefined
              try {
                existing = await ctx.workspaceRegistry.resolveByPath(dir)
              } catch {
                existing = undefined
              }
              if (!existing) {
                await ctx.workspaceRegistry.create(dir, `本地项目: ${name}`)
              }
              ensureWatcher(name, dir)
              sendJson(res, 200, { ok: true, name })
              return
            }

            if (pathname === '/local-project/upload' && req.method === 'POST') {
              const body = await readJson(req, 25_000_000)
              const name = sanitizeName(body?.name)
              const dir = join(rootDir(), name)
              const target = name ? safeTarget(dir, body?.path) : null
              const content = typeof body?.content === 'string' ? body.content : ''
              if (!name || !target) {
                sendJson(res, 400, { ok: false, error: '参数无效' })
                return
              }
              mkdirSync(dirname(target), { recursive: true })
              writeFileSync(target, Buffer.from(content, 'base64'))
              sendJson(res, 200, { ok: true })
              return
            }

            if (pathname === '/local-project/rev' && req.method === 'GET') {
              const name = sanitizeName(url.searchParams.get('name'))
              if (!name) {
                sendJson(res, 400, { ok: false, error: '参数无效' })
                return
              }
              const rev = watchers.get(name)?.rev ?? 0
              sendJson(res, 200, { ok: true, rev })
              return
            }

            if (pathname === '/local-project/pull' && req.method === 'GET') {
              const name = sanitizeName(url.searchParams.get('name'))
              if (!name) {
                sendJson(res, 400, { ok: false, error: '参数无效' })
                return
              }
              const since = Number(url.searchParams.get('since') ?? 0) || 0
              const w = watchers.get(name)
              const rev = w?.rev ?? 0
              const paths: string[] = []
              if (w) {
                for (const [p, r] of w.pathRev) if (r > since) paths.push(p)
              }
              const full = (w?.fullDirtyRev ?? 0) > since
              sendJson(res, 200, { ok: true, rev, paths, full })
              return
            }

            if (pathname === '/local-project/manifest' && req.method === 'GET') {
              const name = sanitizeName(url.searchParams.get('name'))
              if (!name) {
                sendJson(res, 400, { ok: false, error: '参数无效' })
                return
              }
              const dir = join(rootDir(), name)
              const files: Record<string, { size: number; mtimeMs: number }> = {}
              if (existsSync(dir)) walkFiles(dir, dir, files)
              sendJson(res, 200, { ok: true, files })
              return
            }

            if (pathname === '/local-project/download' && req.method === 'GET') {
              const name = sanitizeName(url.searchParams.get('name'))
              const dir = join(rootDir(), name)
              const target = name ? safeTarget(dir, url.searchParams.get('path')) : null
              if (!name || !target || !existsSync(target) || !statSync(target).isFile()) {
                sendJson(res, 404, { ok: false, error: '文件不存在' })
                return
              }
              const buf = readFileSync(target)
              sendJson(res, 200, { ok: true, content: buf.toString('base64') })
              return
            }

            if (pathname === '/local-project/delete' && req.method === 'POST') {
              const body = await readJson(req, 1_000_000)
              const name = sanitizeName(body?.name)
              if (!name) {
                sendJson(res, 400, { ok: false, error: '参数无效' })
                return
              }
              const dir = join(rootDir(), name)
              stopWatcher(name)
              const set = sockets.get(name)
              if (set) {
                for (const ws of set) {
                  try {
                    ws.close()
                  } catch {
                    // ignore
                  }
                }
                set.clear()
                sockets.delete(name)
              }
              try {
                const ws = await ctx.workspaceRegistry.resolveByPath(dir)
                if (ws) await ctx.workspaceRegistry.delete(ws.id)
              } catch {
                // workspace may already be gone
              }
              rmSync(dir, { recursive: true, force: true })
              sendJson(res, 200, { ok: true })
              return
            }

            sendJson(res, 404, { ok: false, error: '未知路由' })
          } catch (err) {
            ctx.logger?.error(err)
            sendJson(res, 500, { ok: false, error: err instanceof Error ? err.message : String(err) })
          }
        },
      }),
    'local-project: routes',
  )
}
