import { useEffect, useRef, useState } from 'react'
import css from './store.css'

const NS = 'sidebar.localProject'

const zh = {
  label: '本地项目',
  modalTitle: '连接本地文件夹',
  hint: '选择本地电脑上的文件夹，服务器上的 DSH 就能通过浏览器读写它（文件操作由当前页面中继）。',
  nameLabel: '项目名称',
  connect: '选择文件夹并连接',
  cancel: '取消',
  connected: '已连接',
  disconnect: '断开',
  success: (n: string) => `本地项目「${n}」已连接。在对应工作区中对话即可操作本地文件。`,
  error: '失败：',
  noApi: '当前环境不支持文件系统访问 API（需要 Chrome/Edge 浏览器）。',
  close: '关闭',
  empty: '尚未连接任何本地项目',
}

const en = {
  label: 'Local project',
  modalTitle: 'Connect local folder',
  hint: 'Pick a folder on this computer; the server-side DSH can then read/write it through this browser page.',
  nameLabel: 'Project name',
  connect: 'Choose folder & connect',
  cancel: 'Cancel',
  connected: 'Connected',
  disconnect: 'Disconnect',
  success: (n: string) => `Local project "${n}" connected. Chat in its workspace to operate on local files.`,
  error: 'Failed: ',
  noApi: 'File System Access API is unavailable (needs Chrome/Edge).',
  close: 'Close',
  empty: 'No local projects connected',
}

interface Ctx {
  slots: {
    inject(slot: string, cb: () => void): void
    register(options: Record<string, unknown>, component: unknown): unknown
  }
  locale: {
    register(ns: string, dict: Record<string, unknown>): () => void
    bind(ns: string): (key: string) => string
  }
  effect(disposer: () => () => void, label?: string): void
}

export const inject = ['slots', 'locale']

export function apply(ctx: Ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'local-project: dictionaries')
  const t = ctx.locale.bind(NS)
  ctx.effect(() => injectCss(), 'local-project: css')

  ctx.slots.inject('sidebar.footer.action', () =>
    ctx.slots.register(
      {
        name: 'sidebar.footer.action',
        id: 'local-project',
        order: 20,
        label: () => t('label'),
        locale: NS,
        inject: () => ({ t }),
      },
      LocalProjectAction,
    ),
  )
}

function injectCss(): () => void {
  if (typeof document === 'undefined') return () => {}
  const id = 'dsh-local-project-css'
  if (document.getElementById(id)) return () => {}
  const el = document.createElement('style')
  el.id = id
  el.dataset.plugin = 'dsh-local-project'
  el.textContent = css
  document.head.appendChild(el)
  return () => el.remove()
}

interface LocalProjectEntry {
  projectId: string
  name: string
}

async function resolveDir(root: FileSystemDirectoryHandle, parts: string[], create: boolean): Promise<FileSystemDirectoryHandle> {
  let dir = root
  for (const p of parts) {
    dir = await dir.getDirectoryHandle(p, { create })
  }
  return dir
}

async function executeOp(
  op: { opId: string; projectId: string; kind: string; path: string; content?: string },
  handles: Record<string, FileSystemDirectoryHandle>,
): Promise<{ ok: boolean; result?: unknown; error?: string }> {
  const handle = handles[op.projectId]
  if (!handle) return { ok: false, error: '本地项目未连接（页面已刷新？请重新选择文件夹）' }
  const parts = (op.path || '').split('/').filter(Boolean)
  try {
    if (op.kind === 'list') {
      const dir = parts.length ? await resolveDir(handle, parts, false) : handle
      const entries: Array<{ name: string; type: string }> = []
      for await (const [name, entry] of (dir as any).entries()) {
        entries.push({ name, type: entry.kind === 'file' ? 'file' : 'dir' })
      }
      return { ok: true, result: { entries } }
    }
    if (op.kind === 'read') {
      const fileName = parts.pop() ?? ''
      const dir = parts.length ? await resolveDir(handle, parts, false) : handle
      const fileHandle = await dir.getFileHandle(fileName)
      const file = await fileHandle.getFile()
      return { ok: true, result: { content: await file.text() } }
    }
    if (op.kind === 'write') {
      const fileName = parts.pop() ?? ''
      const dir = parts.length ? await resolveDir(handle, parts, true) : handle
      const fileHandle = await dir.getFileHandle(fileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(op.content ?? '')
      await writable.close()
      return { ok: true, result: {} }
    }
    if (op.kind === 'delete') {
      const fileName = parts.pop() ?? ''
      const dir = parts.length ? await resolveDir(handle, parts, false) : handle
      await dir.removeEntry(fileName, { recursive: true })
      return { ok: true, result: {} }
    }
    return { ok: false, error: `未知操作 ${op.kind}` }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

function LocalProjectAction(props: { wide: boolean; t: (key: string, ...args: any[]) => string }) {
  const { wide, t } = props
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Record<string, LocalProjectEntry>>({})
  const handlesRef = useRef<Record<string, FileSystemDirectoryHandle>>({})

  // Poll the server for local file operations and execute them on the local
  // folder handles. Runs whenever at least one project is connected.
  useEffect(() => {
    const tick = async () => {
      if (Object.keys(handlesRef.current).length === 0) return
      try {
        const res = await fetch('/local-project/ops')
        const data = await res.json()
        if (data && data.pending) {
          const outcome = await executeOp(data.op, handlesRef.current)
          await fetch('/local-project/result', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ opId: data.op.opId, ...outcome }),
          })
        }
      } catch {
        // transient network error — keep polling
      }
    }
    const timer = setInterval(tick, 400)
    return () => clearInterval(timer)
  }, [])

  const connect = async () => {
    const wsName = name.trim()
    if (!wsName) {
      setError(t('nameLabel') + ' 不能为空')
      return
    }
    setError(null)
    let handle: FileSystemDirectoryHandle | null = null
    const picker = (window as any).showDirectoryPicker
    if (typeof picker === 'function') {
      try {
        handle = await picker.call(window, { mode: 'readwrite' })
      } catch (e) {
        setError(t('error') + (e instanceof Error ? e.message : String(e)))
        return
      }
    }
    if (!handle) {
      setError(t('noApi'))
      return
    }
    try {
      const res = await fetch('/local-project/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: wsName }),
      })
      const data = await res.json()
      if (!data || data.ok !== true) {
        setError(t('error') + (data?.error || 'register failed'))
        return
      }
      handlesRef.current[data.projectId] = handle
      setProjects((prev) => ({ ...prev, [data.projectId]: { projectId: data.projectId, name: wsName } }))
      setOpen(false)
      setName('')
      window.alert(t('success', wsName))
    } catch (e) {
      setError(t('error') + (e instanceof Error ? e.message : String(e)))
    }
  }

  const disconnect = (projectId: string) => {
    delete handlesRef.current[projectId]
    setProjects((prev) => {
      const next = { ...prev }
      delete next[projectId]
      return next
    })
  }

  const projectList = Object.values(projects)

  return (
    <div className="lp-root">
      <button type="button" className="lp-trigger" title={t('label')} onClick={() => setOpen(true)}>
        {wide ? t('label') : '📁'}
      </button>

      {open ? (
        <div className="lp-backdrop" onClick={() => setOpen(false)}>
          <div className="lp-modal" onClick={(e) => e.stopPropagation()}>
            <h4>{t('modalTitle')}</h4>
            <p className="lp-hint">{t('hint')}</p>

            <label className="lp-field">
              <span>{t('nameLabel')}</span>
              <input value={name} onChange={(e) => setName(e.currentTarget.value)} />
            </label>

            {error ? <p className="lp-error">{error}</p> : null}

            <div className="lp-actions">
              <button type="button" className="lp-primary" onClick={connect}>
                {t('connect')}
              </button>
              <button type="button" className="lp-secondary" onClick={() => setOpen(false)}>
                {t('cancel')}
              </button>
            </div>

            {projectList.length > 0 ? (
              <ul className="lp-projects">
                {projectList.map((p) => (
                  <li key={p.projectId} className="lp-project">
                    <span className="lp-project-name">📁 {p.name}</span>
                    <button type="button" className="lp-secondary" onClick={() => disconnect(p.projectId)}>
                      {t('disconnect')}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="lp-empty">{t('empty')}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
