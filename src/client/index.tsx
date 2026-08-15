import { useEffect, useState } from 'react'
import css from './store.css'

const NS = 'sidebar.localProject'
const STORAGE_KEY = 'dsh-local-project.projects'

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
  resume: '重新选择文件夹并恢复同步',
  resuming: '正在恢复同步…',
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
  resume: 'Choose folder & resume sync',
  resuming: 'Resuming sync…',
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

interface DirectoryFlowOwnerProps {
  open: boolean
  busy: boolean
  onPicked: (path: string) => void
  onCancel: () => void
  onError: (message: string) => void
}

interface LocalProjectFlowProps extends DirectoryFlowOwnerProps {
  t: (key: string, ...args: any[]) => string
}

export const inject = ['slots', 'locale']

export function apply(ctx: Ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'local-project: dictionaries')
  const t = ctx.locale.bind(NS)
  ctx.effect(() => injectCss(), 'local-project: css')

  const injected = () => ({ t })

  // Fill ui-workspace's directory-flow holes. Occupying these holes makes the
  // native "添加工作区" button appear in the sidebar and empty-state picker, and
  // clicking it opens this plugin's local-folder import dialog.
  ctx.slots.inject('conversation.hero.workspace.directoryFlow', () =>
    ctx.slots.inject('sidebar.workspaces.directoryFlow', function* () {
      yield ctx.slots.register(
        {
          name: 'conversation.hero.workspace.directoryFlow',
          inject: injected,
        },
        LocalProjectFlow,
      )
      yield ctx.slots.register(
        {
          name: 'sidebar.workspaces.directoryFlow',
          inject: injected,
        },
        LocalProjectFlow,
      )
    }),
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

interface ProjectMeta {
  name: string
  dir?: string
}

interface SyncState {
  handle: FileSystemDirectoryHandle
  lastRev: number
  ws: WebSocket | null
  queue: Promise<void>
  closed: boolean
  reconnectTimer: number | null
}

// Module-level registries keep sync alive even if the directory-flow component
// is mounted by both sidebar and hero surfaces, or remounts while the modal is
// closed.
const activeSyncs = new Map<string, SyncState>()

let projectMetas: ProjectMeta[] = []
try {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) projectMetas = parsed.filter((x) => x && typeof x.name === 'string')
    }
  }
} catch {
  // ignore storage errors
}

const projectListeners = new Set<() => void>()

function emitProjects(): void {
  for (const listener of [...projectListeners]) listener()
}

function saveProjects(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projectMetas))
    }
  } catch {
    // ignore storage errors
  }
  emitProjects()
}

function addProjectMeta(meta: ProjectMeta): void {
  if (projectMetas.some((p) => p.name === meta.name)) return
  projectMetas = [...projectMetas, meta]
  saveProjects()
}

function removeProjectMeta(name: string): void {
  projectMetas = projectMetas.filter((p) => p.name !== name)
  saveProjects()
}

function useProjects(): ProjectMeta[] {
  const [projects, setProjects] = useState<ProjectMeta[]>(projectMetas)
  useEffect(() => {
    const listener = () => setProjects(projectMetas)
    projectListeners.add(listener)
    return () => {
      projectListeners.delete(listener)
    }
  }, [])
  useEffect(() => {
    let alive = true
    // Make server-side projects visible even if this browser's localStorage was
    // cleared, so the delete-server-project action remains available.
    getJson('/local-project/list')
      .then((data) => {
        if (!alive || !data || !Array.isArray(data.projects)) return
        let changed = false
        for (const item of data.projects) {
          if (item && typeof item.name === 'string' && !projectMetas.some((p) => p.name === item.name)) {
            projectMetas = [...projectMetas, { name: item.name }]
            changed = true
          }
        }
        if (changed) saveProjects()
      })
      .catch(() => {
        // The host may be starting; localStorage still lists known projects.
      })
    return () => {
      alive = false
    }
  }, [])
  return projects
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
  let payload: any
  try {
    payload = await res.json()
  } catch {
    throw new Error(`HTTP ${res.status}`)
  }
  if (!res.ok || !payload || payload.ok !== true) {
    throw new Error(payload?.error || `HTTP ${res.status}`)
  }
  return payload
}

async function postJson(url: string, data: unknown): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  })
  let payload: any
  try {
    payload = await res.json()
  } catch {
    throw new Error(`HTTP ${res.status}`)
  }
  if (!res.ok || !payload || payload.ok !== true) {
    throw new Error(payload?.error || `HTTP ${res.status}`)
  }
  return payload
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
  state.lastRev = r && r.rev ? r.rev : 0
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

/** Serialize every sync step for a project so rev/lastRev updates stay ordered. */
function enqueue(state: SyncState, fn: () => Promise<void>): void {
  state.queue = state.queue.then(fn).catch(() => {
    // transient errors are ignored; the next push or reconnect retries
  })
}

/** Apply a change set ({rev, paths, full}) to the local folder, then advance lastRev. */
async function applySync(
  name: string,
  state: SyncState,
  msg: { rev: number; paths?: string[]; full?: boolean },
): Promise<void> {
  if (!msg || typeof msg.rev !== 'number' || msg.rev <= state.lastRev) return
  if (msg.full) {
    await fullReconcile(name, state)
  } else {
    for (const p of msg.paths || []) {
      const dl = await getJson(
        `/local-project/download?name=${encodeURIComponent(name)}&path=${encodeURIComponent(p)}`,
      )
      if (dl && dl.ok) await writeLocalFile(state.handle, p, dl.content)
    }
  }
  state.lastRev = msg.rev
}

/** Pull everything changed since lastRev — used on (re)connect to catch missed pushes. */
async function catchUp(name: string, state: SyncState): Promise<void> {
  const pull = await getJson(
    `/local-project/pull?name=${encodeURIComponent(name)}&since=${state.lastRev}`,
  )
  if (pull && pull.ok) await applySync(name, state, pull)
}

/**
 * Open a WebSocket to the server for one project. The server pushes change
 * notifications the moment DSH modifies a file — no polling at all. Reconnects
 * with backoff and catches up on anything missed while disconnected.
 */
function attachSync(name: string, state: SyncState): void {
  let attempt = 0
  const connect = () => {
    if (state.closed) return
    let ws: WebSocket
    try {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws'
      ws = new WebSocket(
        `${proto}://${location.host}/local-project/ws?name=${encodeURIComponent(name)}`,
      )
    } catch {
      schedule()
      return
    }
    state.ws = ws
    ws.onopen = () => {
      attempt = 0
      enqueue(state, () => catchUp(name, state))
    }
    ws.onmessage = (ev) => {
      let msg: any
      try {
        msg = JSON.parse(ev.data as string)
      } catch {
        return
      }
      if (msg && msg.type === 'changes') {
        enqueue(state, () => applySync(name, state, msg))
      }
    }
    ws.onclose = () => {
      if (state.ws === ws) state.ws = null
      if (!state.closed) schedule()
    }
    ws.onerror = () => {
      try {
        ws.close()
      } catch {
        // ignore
      }
    }
  }
  const schedule = () => {
    const delay = Math.min(30000, 2000 * Math.pow(2, attempt))
    attempt++
    state.reconnectTimer = window.setTimeout(connect, delay)
  }
  connect()
}

function closeSync(name: string): void {
  const state = activeSyncs.get(name)
  if (!state) return
  state.closed = true
  if (state.reconnectTimer != null) window.clearTimeout(state.reconnectTimer)
  try {
    state.ws?.close()
  } catch {
    // ignore
  }
  activeSyncs.delete(name)
}

function pickDirectory(): Promise<FileSystemDirectoryHandle> {
  const picker = (window as any).showDirectoryPicker
  if (typeof picker !== 'function') {
    return Promise.reject(new Error('noApi'))
  }
  return picker.call(window, { mode: 'readwrite' }) as Promise<FileSystemDirectoryHandle>
}

function LocalProjectFlow(props: LocalProjectFlowProps) {
  const { open, busy, onPicked, onCancel, t } = props
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [resuming, setResuming] = useState<string | null>(null)
  const projects = useProjects()

  const createProject = async () => {
    const wsName = name.trim()
    if (!wsName) {
      setError(t('nameLabel') + ' 不能为空')
      return
    }
    if (importing || busy) return
    setError(null)
    let handle: FileSystemDirectoryHandle
    try {
      handle = await pickDirectory()
    } catch (e) {
      const message = e instanceof Error && e.message === 'noApi' ? t('noApi') : e instanceof Error ? e.message : String(e)
      setError(message)
      return
    }
    setImporting(true)
    try {
      const res = await postJson('/local-project/create', { name: wsName })
      const state: SyncState = {
        handle,
        lastRev: 0,
        ws: null,
        queue: Promise.resolve(),
        closed: false,
        reconnectTimer: null,
      }
      activeSyncs.set(wsName, state)
      await importLocal(wsName, state)
      attachSync(wsName, state)
      addProjectMeta({ name: wsName, dir: res.dir || '' })
      setImporting(false)
      setName('')
      onPicked(res.dir || '')
    } catch (e) {
      // Roll back the server-side mirror if we created it but failed to upload.
      try {
        await postJson('/local-project/delete', { name: wsName })
      } catch {
        // best-effort cleanup
      }
      closeSync(wsName)
      setImporting(false)
      setError(t('error') + (e instanceof Error ? e.message : String(e)))
    }
  }

  const resumeProject = async (meta: ProjectMeta) => {
    if (activeSyncs.has(meta.name) || resuming) return
    setError(null)
    let handle: FileSystemDirectoryHandle
    try {
      handle = await pickDirectory()
    } catch (e) {
      const message = e instanceof Error && e.message === 'noApi' ? t('noApi') : e instanceof Error ? e.message : String(e)
      setError(message)
      return
    }
    setResuming(meta.name)
    try {
      const state: SyncState = {
        handle,
        lastRev: 0,
        ws: null,
        queue: Promise.resolve(),
        closed: false,
        reconnectTimer: null,
      }
      activeSyncs.set(meta.name, state)
      const rev = await getJson(`/local-project/rev?name=${encodeURIComponent(meta.name)}`)
      state.lastRev = rev && rev.rev ? rev.rev : 0
      await fullReconcile(meta.name, state)
      attachSync(meta.name, state)
      setResuming(null)
    } catch (e) {
      closeSync(meta.name)
      setResuming(null)
      setError(t('error') + (e instanceof Error ? e.message : String(e)))
    }
  }

  const removeProject = async (wsName: string) => {
    if (!window.confirm(t('deleteConfirm', wsName))) return
    setError(null)
    try {
      await postJson('/local-project/delete', { name: wsName })
      closeSync(wsName)
      removeProjectMeta(wsName)
    } catch (e) {
      setError(t('error') + (e instanceof Error ? e.message : String(e)))
    }
  }

  if (!open) return null

  return (
    <div className="lp-root">
      <div className="lp-backdrop" onClick={() => {
        if (!importing && !resuming && !busy) onCancel()
      }}>
        <div className="lp-modal" onClick={(e) => e.stopPropagation()}>
          <h4>{t('modalTitle')}</h4>
          <p className="lp-hint">{t('hint')}</p>

          <label className="lp-field">
            <span>{t('nameLabel')}</span>
            <input
              value={name}
              disabled={importing || busy}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </label>

          {error ? <p className="lp-error">{error}</p> : null}

          <div className="lp-actions">
            <button
              type="button"
              className="lp-primary"
              disabled={importing || resuming !== null || busy}
              onClick={createProject}
            >
              {importing ? t('importing') : t('create')}
            </button>
            <button
              type="button"
              className="lp-secondary"
              disabled={importing || resuming !== null || busy}
              onClick={() => onCancel()}
            >
              {t('cancel')}
            </button>
          </div>

          {projects.length > 0 ? (
            <ul className="lp-projects">
              {projects.map((p) => {
                const synced = activeSyncs.has(p.name)
                return (
                  <li key={p.name} className="lp-project">
                    <span className="lp-project-name">📁 {p.name}</span>
                    <div className="lp-project-actions">
                      {!synced ? (
                        <button
                          type="button"
                          className="lp-secondary"
                          disabled={importing || resuming === p.name || busy}
                          onClick={() => resumeProject(p)}
                        >
                          {resuming === p.name ? t('resuming') : t('resume')}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="lp-danger"
                        disabled={importing || resuming === p.name || busy}
                        onClick={() => removeProject(p.name)}
                      >
                        {t('deleteProject')}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="lp-empty">{t('empty')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
