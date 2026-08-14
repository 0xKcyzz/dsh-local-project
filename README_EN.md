<p align="center">
  <a href="README.md">简体中文</a> | <strong>English</strong>
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-0B7285?style=flat-square">
  <img alt="DSH: Web" src="https://img.shields.io/badge/DeepSeek%20Harness-Web-5B4CF0?style=flat-square">
  <img alt="Topics" src="https://img.shields.io/badge/topic-dsh--plugin-5B4CF0?style=flat-square">
</p>

# DSH Local Project

> Import a local folder as a server-DSH workspace (the server keeps a mirror copy) with **two-way sync** — edits in DSH sync back to your local folder, and local edits sync up. Deleting a project removes only the server copy. Modeled after Grok's web "New project".

**Install:**

```bash
dsh plugin --profile web add github:w769721503/dsh-local-project
```

Restart DSH, then use the "Local project" button at the sidebar bottom.

## How it works (Grok model)

1. In the browser, click "Local project" → pick a local folder (File System Access API grants a read/write handle).
2. The folder is **uploaded to the server** as a real workspace directory, so DSH's native `read/write/edit/glob/bash` tools work directly — no custom tools needed.
3. **Two-way sync** (driven by the browser every 5 s):
   - Server (DSH) changes → downloaded to local.
   - Local changes → uploaded to server.
   - Same file changed on both sides → the newer modification time wins.
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
- **5-second sync interval**: changes sync within 5 s; very large projects make the full scan slower.
- **Electron desktop window**: if the API is unavailable, open DSH's web address in a system browser.

## Architecture

- **Host half** (`src/index.ts` → `lib/index.js`):
  - `POST /local-project/create`: creates the server directory + workspace record.
  - `POST /local-project/upload`: writes/overwrites a server file (base64, binary-safe).
  - `GET /local-project/manifest`: returns `{ size, mtimeMs }` for every server file (for sync diffing).
  - `GET /local-project/download`: reads a server file (base64).
  - `POST /local-project/delete`: removes the server directory + workspace record.
- **Client half** (`src/client/index.tsx` → `lib/client.js`):
  - Registers the "Local project" button + import dialog in `sidebar.footer.action`.
  - Holds the local folder read/write handles (browser memory only).
  - Every 5 s builds a local manifest, fetches the server manifest, and applies two-way diffs (signed by size+mtime to avoid loops).
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
