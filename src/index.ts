// Host half of dsh-local-project (Grok-style model): the user's local folder is
// mirrored into a real server workspace directory, and the browser keeps the
// two sides in two-way sync. DSH's native file tools operate on the server
// copy as a normal workspace. Deleting a project removes only the server copy.

import type { IncomingMessage, ServerResponse } from 'node:http'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, normalize, relative, sep } from 'node:path'
import { homedir } from 'node:os'

export const name = 'dsh-local-project'
export const inject = ['webServer', 'workspaceRegistry']

interface Ctx {
  webServer: {
    register(route: { kind: string; path: string; handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void> }): () => void
  }
  workspaceRegistry: {
    create(path: string, title?: string): Promise<{ id: string; path: string; title: string }>
    resolveByPath(path: string): Promise<{ id: string; path: string; title: string } | undefined>
    delete(id: string): Promise<boolean>
  }
  effect(disposer: () => () => void, label?: string): void
  logger?: { warn(msg: unknown): void; error(msg: unknown): void }
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

/** Sanitize a relative path and confirm it stays inside the project dir. */
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

/** Recursively collect `{ relPath: { size, mtimeMs } }` for every file in dir. */
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

function sigOf(size: number, mtimeMs: number): string {
  return `${size}:${Math.floor(mtimeMs)}`
}

export function apply(ctx: Ctx) {
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
              const st = statSync(target)
              sendJson(res, 200, { ok: true, sig: sigOf(st.size, st.mtimeMs) })
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
              const st = statSync(target)
              sendJson(res, 200, {
                ok: true,
                content: buf.toString('base64'),
                sig: sigOf(st.size, st.mtimeMs),
              })
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
