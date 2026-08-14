import { useEffect, useRef, useState } from 'react'
import css from './store.css'

const NS = 'sidebar.localProject'

const zh = {
  label: '本地项目',
  modalTitle: '导入本地项目',
  hint: '选择本地文件夹，上传到服务器创建为工作区；网页里（DSH）的修改会同步回本地，本地修改也会同步到服务器。删除项目只删服务器副本，不碰本地文件。',
  nameLabel: '项目名称',
  create: '选择文件夹并导入',
  cancel: '取消',
  success: (n: string) => `本地项目「${n}」已创建为服务器工作区，正在同步…`,
  error: '失败：',
  noApi: '当前环境不支持文件系统访问 API（需要 Chrome/Edge 浏览器）。',
  deleteProject: '删除服务器项目',
  deleteConfirm: (n: string) => `确定删除服务器上的本地项目「${n}」？服务器副本会被删除，本地文件不受影响。`,
  connected: '已连接',
  empty: '尚未导入任何本地项目',
  syncing: '同步中',
}

const en = {
  label: 'Local project',
  modalTitle: 'Import local project',
  hint: 'Pick a local folder; it is uploaded to the server as a workspace. Changes made in DSH sync back to your local folder, and local edits sync up. Deleting a project removes only the server copy.',
  nameLabel: 'Project name',
  create: 'Choose folder & import',
  cancel: 'Cancel',
  success: (n: string) => `Local project "${n}" created as a server workspace; syncing…`,
  error: 'Failed: ',
  noApi: 'File System Access API is unavailable (needs Chrome/Edge).',
  deleteProject: 'Delete server project',
  deleteConfirm: (n: string) => `Delete the server copy of "${n}"? Local files are not affected.`,
  connected: 'Connected',
  empty: 'No local projects imported',
  syncing: 'Syncing',
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

interface ManifestEntry {
  size: number
  mtimeMs: number
}

interface SyncState {
  handle: FileSystemDirectoryHandle
  syncedLocal: Record<string, string>
  syncedServer: Record<string, string>
}

function sig(v: ManifestEntry): string {
  return `${v.size}:${Math.floor(v.mtimeMs)}`
}

async function resolveDir(root: FileSystemDirectoryHandle, parts: string[], create: boolean): Promise<FileSystemDirectoryHandle> {
  let dir = root
  for (const p of parts) {
    dir = await dir.getDirectoryHandle(p, { create })
  }
  return dir
}

async function walkLocal(dir: FileSystemDirectoryHandle, prefix: string, out: Record<string, ManifestEntry>): Promise<void> {
  for await (const [name, entry] of (dir as any).entries()) {
    const rel = prefix ? `${prefix}/${name}` : name
    if (entry.kind === 'directory') {
      await walkLocal(entry as FileSystemDirectoryHandle, rel, out)
    } else if (entry.kind === 'file') {
      try {
        const fh = (entry as FileSystemFileHandle).getFile
          ? await (entry as FileSystemFileHandle).getFile()
          : await (entry as any).getFile()
        out[rel] = { size: fh.size, mtimeMs: fh.lastModified }
      } catch {
        // skip unreadable files
      }
    }
  }
}

async function resolveFile(handle: FileSystemDirectoryHandle, path: string, createDirs: boolean): Promise<{ dir: FileSystemDirectoryHandle; name: string }> {
  const parts = (path || '').split('/').filter(Boolean)
  const name = parts.pop() ?? ''
  const dir = parts.length ? await resolveDir(handle, parts, createDirs) : handle
  return { dir, name }
}

async function readLocalFile(handle: FileSystemDirectoryHandle, path: string): Promise<string> {
  const { dir, name } = await resolveFile(handle, path, false)
  const fileHandle = await dir.getFileHandle(name)
  const file = await fileHandle.getFile()
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)))
  }
  return btoa(binary)
}

async function getLocalSig(handle: FileSystemDirectoryHandle, path: string): Promise<string> {
  const { dir, name } = await resolveFile(handle, path, false)
  const fileHandle = await dir.getFileHandle(name)
  const file = await fileHandle.getFile()
  return `${file.size}:${Math.floor(file.lastModified)}`
}

async function writeLocalFile(handle: FileSystemDirectoryHandle, path: string, b64: string): Promise<void> {
  const { dir, name } = await resolveFile(handle, path, true)
  const fileHandle = await dir.getFileHandle(name, { create: true })
  const writable = await fileHandle.createWritable()
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  await writable.write(bytes)
  await writable.close()
}

async function getJson(url: string): Promise<any> {
  const res = await fetch(url)
  return res.json()
}

async function postJson(url: string, data: unknown): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

async function syncProject(name: string, state: SyncState): Promise<void> {
  const local: Record<string, ManifestEntry> = {}
  await walkLocal(state.handle, '', local)
  const man = await getJson(`/local-project/manifest?name=${encodeURIComponent(name)}`)
  const server: Record<string, ManifestEntry> = (man && man.files) || {}

  const paths = new Set([...Object.keys(local), ...Object.keys(server)])

  for (const p of paths) {
    const l = local[p] ? sig(local[p]) : undefined
    const s = server[p] ? sig(server[p]) : undefined

    if (l === s) {
      state.syncedLocal[p] = l ?? ''
      state.syncedServer[p] = s ?? ''
      continue
    }

    const lc = l !== undefined && l !== state.syncedLocal[p]
    const sc = s !== undefined && s !== state.syncedServer[p]

    if (lc && !sc) {
      // Local changed → upload.
      const content = await readLocalFile(state.handle, p)
      const up = await postJson('/local-project/upload', { name, path: p, content })
      state.syncedLocal[p] = l ?? ''
      state.syncedServer[p] = up && up.sig ? up.sig : (s ?? '')
    } else if (sc && !lc) {
      // Server changed → download to local.
      const dl = await getJson(
        `/local-project/download?name=${encodeURIComponent(name)}&path=${encodeURIComponent(p)}`,
      )
      if (dl && dl.ok) {
        await writeLocalFile(state.handle, p, dl.content)
        state.syncedLocal[p] = await getLocalSig(state.handle, p)
        state.syncedServer[p] = s ?? ''
      }
    } else if (lc && sc) {
      // Both changed → newer mtime wins.
      const lm = l ? Number(l.split(':')[1]) : 0
      const sm = s ? Number(s.split(':')[1]) : 0
      if (lm >= sm) {
        const content = await readLocalFile(state.handle, p)
        const up = await postJson('/local-project/upload', { name, path: p, content })
        state.syncedLocal[p] = l ?? ''
        state.syncedServer[p] = up && up.sig ? up.sig : (s ?? '')
      } else {
        const dl = await getJson(
          `/local-project/download?name=${encodeURIComponent(name)}&path=${encodeURIComponent(p)}`,
        )
        if (dl && dl.ok) {
          await writeLocalFile(state.handle, p, dl.content)
          state.syncedLocal[p] = await getLocalSig(state.handle, p)
          state.syncedServer[p] = s ?? ''
        }
      }
    }
    // Neither side changed but sigs differ (e.g. one side deleted): no delete propagation.
  }

  const alive = new Set([...Object.keys(local), ...Object.keys(server)])
  for (const p of Object.keys(state.syncedLocal)) if (!alive.has(p)) delete state.syncedLocal[p]
  for (const p of Object.keys(state.syncedServer)) if (!alive.has(p)) delete state.syncedServer[p]
}

function LocalProjectAction(props: { wide: boolean; t: (key: string, ...args: any[]) => string }) {
  const { wide, t } = props
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Record<string, { name: string }>>({})
  const projectsRef = useRef<Record<string, SyncState>>({})

  // Two-way sync loop: every 5 seconds, for each connected project.
  useEffect(() => {
    const timer = setInterval(() => {
      const entries = Object.entries(projectsRef.current)
      for (const [pName, state] of entries) {
        syncProject(pName, state).catch(() => {})
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const createProject = async () => {
    const wsName = name.trim()
    if (!wsName) {
      setError(t('nameLabel') + ' 不能为空')
      return
    }
    setError(null)
    const picker = (window as any).showDirectoryPicker
    if (typeof picker !== 'function') {
      setError(t('noApi'))
      return
    }
    let handle: FileSystemDirectoryHandle
    try {
      handle = await picker.call(window, { mode: 'readwrite' })
    } catch (e) {
      setError(t('error') + (e instanceof Error ? e.message : String(e)))
      return
    }
    try {
      const res = await postJson('/local-project/create', { name: wsName })
      if (!res || res.ok !== true) throw new Error(res?.error || 'create failed')
      projectsRef.current[wsName] = { handle, syncedLocal: {}, syncedServer: {} }
      setProjects((prev) => ({ ...prev, [wsName]: { name: wsName } }))
      setOpen(false)
      setName('')
      window.alert(t('success', wsName))
      // Kick off the first sync immediately (the interval continues from here).
      syncProject(wsName, projectsRef.current[wsName]).catch(() => {})
    } catch (e) {
      setError(t('error') + (e instanceof Error ? e.message : String(e)))
    }
  }

  const removeProject = async (wsName: string) => {
    if (!window.confirm(t('deleteConfirm', wsName))) return
    try {
      await postJson('/local-project/delete', { name: wsName })
    } catch {
      // best-effort
    }
    delete projectsRef.current[wsName]
    setProjects((prev) => {
      const next = { ...prev }
      delete next[wsName]
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
              <button type="button" className="lp-primary" onClick={createProject}>
                {t('create')}
              </button>
              <button type="button" className="lp-secondary" onClick={() => setOpen(false)}>
                {t('cancel')}
              </button>
            </div>

            {projectList.length > 0 ? (
              <ul className="lp-projects">
                {projectList.map((p) => (
                  <li key={p.name} className="lp-project">
                    <span className="lp-project-name">📁 {p.name}</span>
                    <button type="button" className="lp-danger" onClick={() => removeProject(p.name)}>
                      {t('deleteProject')}
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
