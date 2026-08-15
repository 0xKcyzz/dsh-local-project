<p align="center">
  <a href="README.md">简体中文</a> | <strong>English</strong>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-0B7285?style=flat-square">
  <img alt="DSH Plugin" src="https://img.shields.io/badge/DSH-Plugin-5B4CF0?style=flat-square">
  <img alt="Platform" src="https://img.shields.io/badge/platform-Web-4B6FFF?style=flat-square">
  <img alt="Sync" src="https://img.shields.io/badge/sync-WebSocket-00B8A9?style=flat-square">
  <img alt="File System Access" src="https://img.shields.io/badge/API-File%20System%20Access-4B6FFF?style=flat-square">
</p>

# DSH Local Project

> Import a local folder as a server-DSH workspace and automatically sync DSH changes back to your local folder.
> Ideal for letting a remote DSH read/write local code or assets from the browser while keeping a local copy.

## Features

- Use "Add workspace" to pick a local folder; it is uploaded and mirrored as a server workspace automatically.
- DSH uses its native `read/write/edit/glob/bash` tools directly on the server mirror — no custom tools needed.
- DSH file changes are pushed back to local in real time over WebSocket; disconnects auto-reconnect and catch up missed changes.
- Deleting a project removes only the server copy and workspace record; local files are not affected.
- After a page refresh, the project list is restored from the server, and you can re-select the local folder to resume sync.

## Install

```bash
dsh plugin --profile web add github:0xKcyzz/dsh-local-project
```

Restart DSH, then use "Add workspace" to open the local project import dialog.

## Usage

1. Click "Add workspace" in the DSH sidebar or empty state.
2. Enter a project name and click "Choose folder & import".
3. Select a local folder in the system dialog (requires Chrome/Edge authorization).
4. The initial import uploads your files; a "Local project: <name>" workspace appears in the sidebar.
5. Open that workspace and chat — DSH operates on the server mirror, and file changes sync back to local automatically.

## Limitations

- Requires the File System Access API: Chrome / Edge (Chromium-based). Firefox / Safari are not supported.
- Per-file cap is about 15 MB (upload uses base64 JSON); keep very large files out of the project.
- Single-file deletions are not propagated: only "delete project" removes the whole server copy.
- Local edits are not auto-uploaded: only the initial import uploads; later local changes are not synced to the server.
- Real-time push requires an active WebSocket connection; it auto-reconnects and catches up on missed changes.
- If the Electron desktop window does not support the API, open the DSH web address in a system browser.

## How it works

- **Host side**: provides `/local-project/*` HTTP endpoints and WebSocket push; creates/uploads/deletes the server mirror and watches file changes with `fs.watch`.
- **Client side**: fills DSH's "Add workspace" directory flow; picks the local folder, uploads files, receives WebSocket changes, and writes them back locally.
- Sync direction is **DSH → local**: server changes are pushed over WebSocket, and the browser downloads only changed files; there is no continuous two-way sync.

### Host endpoints

| Endpoint | Description |
| --- | --- |
| `POST /local-project/create` | Create server directory + workspace record |
| `POST /local-project/upload` | Upload/overwrite a server file (base64) |
| `GET /local-project/rev` | Get project change revision |
| `GET /local-project/pull` | Get changes missed while disconnected |
| `GET /local-project/list` | List server mirror projects |
| `GET /local-project/manifest` | Get server file manifest |
| `GET /local-project/download` | Download a server file (base64) |
| `POST /local-project/delete` | Delete server directory + workspace record |
| `GET /local-project/ws` | WebSocket real-time change push |

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
