// Host half of dsh-local-project: lets a server-deployed DSH operate on the
// user's LOCAL files. The browser picks a local folder (File System Access
// API) and holds read/write handles; the server's `local_*` tools enqueue
// file operations that the browser polls, executes against the local folder,
// and reports back. No server-side copy is involved.

import { defineTool } from '@deepseek-ai/dsh-tools'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

export const name = 'dsh-local-project'
export const inject = ['webServer', 'workspaceRegistry', 'tools', 'systemPrompt']

interface Project {
  id: string
  name: string
  dir: string
}

interface Op {
  opId: string
  projectId: string
  kind: 'list' | 'read' | 'write' | 'delete'
  path: string
  content?: string
}

interface Ctx {
  webServer: {
    register(route: { kind: string; path: string; handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void> }): () => void
  }
  workspaceRegistry: {
    create(path: string, title?: string): Promise<{ id: string; path: string; title: string }>
    resolveByPath(path: string): Promise<{ id: string; path: string; title: string } | undefined>
  }
  tools: { register(definition: unknown): () => void }
  systemPrompt: {
    section(section: { name: string; order?: number; text: string }): () => void
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

export function apply(ctx: Ctx) {
  const projects = new Map<string, Project>()
  const byName = new Map<string, string>()
  const opQueue: Op[] = []
  const pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: NodeJS.Timeout }>()

  function enqueue(projectId: string, kind: Op['kind'], path: string, content?: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const op: Op = { opId: randomUUID(), projectId, kind, path, content }
      opQueue.push(op)
      pending.set(op.opId, {
        resolve,
        reject,
        timer: setTimeout(() => {
          pending.delete(op.opId)
          reject(new Error('本地代理无响应（浏览器标签页可能已关闭）'))
        }, 30_000),
      })
    })
  }

  async function run(kind: Op['kind'], args: Record<string, unknown>): Promise<unknown> {
    const name = sanitizeName(args?.project)
    const projectId = name ? byName.get(name) : undefined
    if (!projectId) {
      return { error: `本地项目「${name ?? ''}」未连接。请先在侧边栏点击「本地项目」选择本地文件夹。` }
    }
    const path = typeof args?.path === 'string' ? args.path : ''
    try {
      const result = await enqueue(projectId, kind, path, kind === 'write' ? String(args?.content ?? '') : undefined)
      return result ?? { ok: true }
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) }
    }
  }

  const toolDefs: Array<{ name: string; description: string; parameters: Record<string, unknown>; execute: (args: Record<string, unknown>) => Promise<unknown> }> = [
    {
      name: 'local_list',
      description:
        'List files and folders inside the user\'s LOCAL project (relayed through the browser to the folder the user picked). Use this instead of the server-side file tools when working on a local project. `path` is relative to the project root; empty or "/" lists the root. Triggers: local project, user\'s computer, local files.',
      parameters: {
        project: { type: 'string', required: true, description: 'The local project name (as shown in the workspace title).' },
        path: { type: 'string', required: false, description: 'Relative path to list; empty lists the project root.' },
      },
      execute: (args) => run('list', args),
    },
    {
      name: 'local_read',
      description:
        'Read a UTF-8 text file from the user\'s LOCAL project (relayed through the browser). `path` is relative to the project root. Use for local-project work instead of the server-side `read` tool.',
      parameters: {
        project: { type: 'string', required: true, description: 'The local project name.' },
        path: { type: 'string', required: true, description: 'Relative path to the file to read.' },
      },
      execute: (args) => run('read', args),
    },
    {
      name: 'local_write',
      description:
        'Write (create or overwrite) a UTF-8 text file in the user\'s LOCAL project (relayed through the browser). `path` is relative to the project root; missing directories are created. Use for local-project work instead of the server-side `write` tool.',
      parameters: {
        project: { type: 'string', required: true, description: 'The local project name.' },
        path: { type: 'string', required: true, description: 'Relative path to the file to write.' },
        content: { type: 'string', required: true, description: 'The full text content to write.' },
      },
      execute: (args) => run('write', args),
    },
    {
      name: 'local_delete',
      description:
        'Delete a file (or recursively a folder) inside the user\'s LOCAL project (relayed through the browser). `path` is relative to the project root. Use for local-project work instead of the server-side file tools.',
      parameters: {
        project: { type: 'string', required: true, description: 'The local project name.' },
        path: { type: 'string', required: true, description: 'Relative path of the file/folder to delete.' },
      },
      execute: (args) => run('delete', args),
    },
  ]

  for (const def of toolDefs) {
    ctx.effect(() => ctx.tools.register(defineTool(def)), `local-project: tool ${def.name}`)
  }

  ctx.effect(
    () =>
      ctx.systemPrompt.section({
        name: 'local-project',
        order: 200,
        text:
          '本地项目：当你工作于标题以「本地项目: 」开头的工作区时，用户希望操作的是其本地电脑上的真实文件。请使用 local_list / local_read / local_write / local_delete 工具（这些操作经浏览器中继到用户选择的本地文件夹）。标准的服务器端文件工具（read/write/edit/glob 等）操作的是服务器路径，无法访问本地文件，不要混用。',
      }),
    'local-project: prompt section',
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
            if (pathname === '/local-project/register' && req.method === 'POST') {
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
              let ws = existing
              if (!ws) {
                ws = await ctx.workspaceRegistry.create(dir, `本地项目: ${name}`)
              }
              const id = randomUUID()
              projects.set(id, { id, name, dir })
              byName.set(name, id)
              sendJson(res, 200, {
                ok: true,
                projectId: id,
                workspace: ws ? { id: ws.id, path: ws.path, title: ws.title } : undefined,
              })
              return
            }

            if (pathname === '/local-project/ops' && req.method === 'GET') {
              const projectId = url.searchParams.get('project') ?? ''
              const idx = opQueue.findIndex((op) => !projectId || op.projectId === projectId)
              if (idx === -1) {
                sendJson(res, 200, { pending: false })
                return
              }
              const [op] = opQueue.splice(idx, 1)
              sendJson(res, 200, { pending: true, op })
              return
            }

            if (pathname === '/local-project/result' && req.method === 'POST') {
              const body = await readJson(req, 20_000_000)
              const opId = typeof body?.opId === 'string' ? body.opId : ''
              const entry = pending.get(opId)
              if (!entry) {
                sendJson(res, 200, { ok: true })
                return
              }
              pending.delete(opId)
              clearTimeout(entry.timer)
              if (body?.ok) entry.resolve(body?.result ?? {})
              else entry.reject(new Error(typeof body?.error === 'string' ? body.error : '本地操作失败'))
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

  // Cleanup on plugin stop.
  ctx.effect(
    () => () => {
      for (const entry of pending.values()) {
        clearTimeout(entry.timer)
        entry.reject(new Error('本地项目插件已停止'))
      }
    },
    'local-project: cleanup',
  )
}
