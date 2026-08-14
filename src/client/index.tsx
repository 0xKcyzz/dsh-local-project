import { useEffect, useRef, useState } from 'react'
import css from './store.css'

const NS = 'sidebar.localProject'

const zh = {
  label: '本地项目',
  modalTitle: '导入本地项目',
  hint: '选择本地文件夹，上传到服务器创建为工作区。之后 DSH 修改了文件才会同步回本地，不会持续同步。删除项目只删服务器副本，不碰本地文件。',
  nameLabel: '项目名称',
  create: '选择文件夹并导入',
  cancel: '取消',
  success: (n: string) => `本地项目「${n}」已导入，正在上传文件…`,
  done: (n: string) => `「${n}」导入完成。之后 DSH 修改文件会自动同步回本地。`,
  error: '失败：',
  noApi: '当前环境不支持文件系统访问 API（需要 Chrome/Edge 浏览器）。',
  deleteProject: '删除服务器项目',
  deleteConfirm: (n: string) => `确定删除服务器上的本地项目「${n}」？服务器副本会被删除，本地文件不受影响。`,
  empty: '尚未导入任何本地项目',
  importing: '正在上传文件…',
}

const en = {
  label: 'Local project',
  modalTitle: 'Import local project',
  hint: 'Pick a local folder; it is uploaded to the server as a workspace. After that, files sync back to local only when DSH modifies them — no continuous sync. Deleting a project removes only the server copy.',
  nameLabel: 'Project name',
  create: 'Choose folder & import',
  cancel: 'Cancel',
  success: (n: string) => `Local project "${n}" imported; uploading files…`,
  done: (n: string) => `"${n}" imported. DSH changes will sync back automatically.`,
  error: 'Failed: ',
  noApi: 'File System Access API is unavailable (needs Chrome/Edge).',
  deleteProject: 'Delete server project',
  deleteConfirm: (n: string) => `Delete the server copy of "${n}"? Local files are not affected.`,
  empty: 'No local projects imported',
  importing: 'Uploading files…',
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
  lastRev: number
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
        const fh = await (entry as FileSystemFileHandle).getFile()
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
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)))
  }
  return btoa(binary)
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

/** Initial import: upload every local file, then consume the rev. */
async function importLocal(name: string, state: SyncState): Promise<void> {
  const local: Record<string, ManifestEntry> = {}
  await walkLocal(state.handle, '', local)
  for (const p of Object.keys(local)) {
    const content = await readLocalFile(state.handle, p)
    await postJson('/local-project/upload', { name, path: p, content })
  }
  const r = await getJson(`/local-project/rev?name=${encodeURIComponent(name)}`)
  state.lastRev = r && r.ok ? r.rev : 0
}

/** Full reconcile (fallback when a directory rename/delete event lost filenames): download server files that differ. */
async function fullReconcile(name: string, state: SyncState): Promise<void> {
  const local: Record<string, ManifestEntry> = {}
  await walkLocal(state.handle, '', local)
  const man = await getJson(`/local-project/manifest?name=${encodeURIComponent(name)}`)
  const server: Record<string, ManifestEntry> = (man && man.files) || {}
  for (const [p, sv] of Object.entries(server)) {
    const lv = local[p]
    const same = lv && lv.size === sv.size && Math.floor(lv.mtimeMs) === Math.floor(sv.mtimeMs)
    if (!same) {
      const dl = await getJson(
        `/local-project/download?name=${encodeURIComponent(name)}&path=${encodeURIComponent(p)}`,
      )
      if (dl && dl.ok) await writeLocalFile(state.handle, p, dl.content)
    }
  }
}

function LocalProjectAction(props: { wide: boolean; t: (key: string, ...args: any[]) => string }) {
  const { wide, t } = props
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Record<string, { name: string }>>({})
  const projectsRef = useRef<Record<string, SyncState>>({})

  // Lightweight pull loop: only downloads when the server (DSH) changed files.
  useEffect(() => {
    const tick = async () => {
      const entries = Object.entries(projectsRef.current)
      for (const [pName, state] of entries) {
        try {
          const r = await getJson(`/local-project/rev?name=${encodeURIComponent(pName)}`)
          if (r && r.ok && r.rev > state.lastRev) {
            const pull = await getJson(
              `/local-project/pull?name=${encodeURIComponent(pName)}&since=${state.lastRev}`,
            )
            if (pull && pull.ok) {
              if (pull.full) {
                await fullReconcile(pName, state)
              } else {
                for (const p of pull.paths || []) {
                  const dl = await getJson(
                    `/local-project/download?name=${encodeURIComponent(pName)}&path=${encodeURIComponent(p)}`,
                  )
                  if (dl && dl.ok) await writeLocalFile(state.handle, p, dl.content)
                }
              }
              state.lastRev = pull.rev
            }
          }
        } catch {
          // transient — keep polling
        }
      }
    }
    const timer = setInterval(tick, 2000)
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
    setError(null)
    try {
      const res = await postJson('/local-project/create', { name: wsName })
      if (!res || res.ok !== true) throw new Error(res?.error || 'create failed')
      const state: SyncState = { handle, lastRev: 0 }
      projectsRef.current[wsName] = state
      setProjects((prev) => ({ ...prev, [wsName]: { name: wsName } }))
      setOpen(false)
      setName('')
      window.alert(t('success', wsName))
      await importLocal(wsName, state)
      window.alert(t('done', wsName))
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
