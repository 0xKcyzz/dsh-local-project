<p align="center">
  <a href="README.md">简体中文</a> | <strong>English</strong>
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-0B7285?style=flat-square">
  <img alt="DSH: Web" src="https://img.shields.io/badge/DeepSeek%20Harness-Web-5B4CF0?style=flat-square">
  <img alt="Topics" src="https://img.shields.io/badge/topic-dsh--plugin-5B4CF0?style=flat-square">
</p>

# DSH Local Project

> Import a local folder as a server-DSH workspace (the server keeps a mirror copy). **Files sync back to your local folder only when DSH modifies them** (server `fs.watch` + browser pull) — no continuous two-way sync. Deleting a project removes only the server copy. Modeled after Grok's web "New project".

**Install:**

```bash
dsh plugin --profile web add github:w769721503/dsh-local-project
```

Restart DSH, then use the "Local project" button at the sidebar bottom.

## How it works (Grok model)

1. In the browser, click "Local project" → pick a local folder (File System Access API grants a read/write handle).
2. The folder is **uploaded to the server** as a real workspace directory, so DSH's native `read/write/edit/glob/bash` tools work directly — no custom tools needed.
3. **Pull-only sync (DSH → local)**: the server watches the project directory with `fs.watch`; whenever DSH changes a file it records the change, and the browser does a lightweight poll (every 2 s) and downloads those files to local. Local edits are not auto-uploaded, and local files are not scanned continuously.
4. **Deleting a project** removes only the server copy and workspace record; local files are untouched (individual file deletions are not propagated, to avoid accidental data loss).

## Usage

1. After restart, click "📁 Local project" at the sidebar bottom.
2. Enter a project name → "Choose folder & import" → select a local folder (Chrome/Edge grants access).
3. The initial upload starts; a "Local project: <name>" workspace appears in the sidebar.
4. Open that workspace and chat — DSH operates on the server mirror, and changes sync back to your local folder.

## Limitations

- **Requires the File System Access API**: Chrome / Edge (Chromium-based). Firefox / Safari are not supported.
- **~15 MB per-file cap** (upload uses base64 JSON); keep very large files out of the project.
- **No single-file delete propagation**: only "delete project" removes the whole server copy.
- **Local edits are not auto-uploaded**: only the initial import uploads; afterwards the server mirror follows DSH's changes.
- **~2 s change poll**: DSH changes reach your local folder within ~2 s; the poll only checks a change number, it does not scan local files.
- **Electron desktop window**: if the API is unavailable, open DSH's web address in a system browser.

## Architecture

- **Host half** (`src/index.ts` → `lib/index.js`):
  - `POST /local-project/create`: creates the server directory + workspace record.
  - `POST /local-project/upload`: writes/overwrites a server file (base64, binary-safe; used by the initial import).
  - `GET /local-project/rev`: returns the project change number (for the browser's lightweight poll).
  - `GET /local-project/pull`: returns the paths DSH changed since the last pull.
  - `GET /local-project/manifest` / `download`: full reconcile / download a file (base64).
  - `POST /local-project/delete`: removes the server directory + workspace record.
- **Client half** (`src/client/index.tsx` → `lib/client.js`):
  - Registers the "Local project" button + import dialog in `sidebar.footer.action`.
  - Holds the local folder read/write handles (browser memory only).
  - Uploads all files on the initial import, then polls `rev` every 2 s and pulls any DSH-changed files back to local (driven by `fs.watch`; no local scanning, no continuous two-way sync).
  - "Delete project" calls the server delete endpoint and drops the local handle.

## Configuration (environment variables)

| Variable | Default | Description |
| --- | --- | --- |
| `DSH_LOCAL_PROJECT_ROOT` | `$DSH_HOME/workspaces` | Server mirror directory for local projects. |

## Development / build

```bash
npm install
npm run build   # produces lib/index.js (Host) + lib/client.js (browser)
```

## License

[MIT](LICENSE)
