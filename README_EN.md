<p align="center">
  <a href="README.md">简体中文</a> | <strong>English</strong>
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-0B7285?style=flat-square">
  <img alt="DSH: Web" src="https://img.shields.io/badge/DeepSeek%20Harness-Web-5B4CF0?style=flat-square">
  <img alt="Topics" src="https://img.shields.io/badge/topic-dsh--plugin-5B4CF0?style=flat-square">
</p>

# DSH Local Project

> Let a **server-deployed DSH** read and write files on your **local computer** directly: click "Local project" at the bottom of the sidebar, pick a local folder, and the DSH uses the `local_*` tools to operate on your real local files — relayed through the browser, with **no upload and no server-side copy**.

**Install:**

```bash
dsh plugin --profile web add github:w769721503/dsh-local-project
```

Restart DSH, then use the "Local project" button at the bottom of the sidebar.

## How it works

DSH's built-in file tools (`fs`/`bash`) operate on **server paths** and cannot reach your local disk. This plugin uses the **browser as a local file agent**:

1. In the browser, click "Local project" → pick a local folder (File System Access API grants a **read/write handle** that lives only in your browser).
2. The server registers a "Local project: <name>" workspace and 4 `local_*` tools.
3. Chat in that workspace; the model calls `local_read / local_write / local_list / local_delete`.
4. The server **enqueues** each file operation; the browser polls every 400 ms, executes it against the local folder, and reports the result back.

No file content is uploaded; no server-side copy is kept — the server only receives "file name + operation", and the actual read/write happens on your local disk.

## Operations

| Tool | Purpose |
|---|---|
| `local_list(project, path)` | List files/folders inside the local project |
| `local_read(project, path)` | Read a local UTF-8 text file |
| `local_write(project, path, content)` | Write/overwrite a local text file (creates missing directories) |
| `local_delete(project, path)` | Delete a local file or folder |

## Usage

1. After restart, click "📁 Local project" at the sidebar bottom.
2. Enter a project name → "Choose folder & connect" → select a local folder (Chrome/Edge asks for access permission).
3. A "Local project: <name>" workspace appears in the sidebar.
4. Open that workspace and chat — the model automatically uses the `local_*` tools on your local files.

## Limitations

- **Requires the File System Access API**: Chrome / Edge (Chromium-based). Firefox / Safari are not supported.
- **Text files only**: `local_read`/`local_write` treat content as UTF-8 text; binary files (images, archives) will be corrupted — do not use for binaries.
- **No local shell**: browser sandbox cannot run local commands; a local helper program would be needed for that.
- **Keep the browser tab open**: file operations are relayed by the page; closing it makes `local_*` return "local agent unresponsive".
- **Electron desktop window**: if the API is unavailable, open DSH's web address in a system browser instead.

## Architecture

- **Host half** (`src/index.ts` → `lib/index.js`):
  - Registers the 4 `local_*` model tools (via `defineTool` from `@deepseek-ai/dsh-tools`).
  - `/local-project/register`: creates a placeholder workspace and registers the project.
  - `/local-project/ops`: the browser polls for the next pending operation.
  - `/local-project/result`: the browser reports the result, waking the waiting tool call.
  - `systemPrompt.section`: instructs the model to use `local_*` tools in "Local project" workspaces.
- **Client half** (`src/client/index.tsx` → `lib/client.js`):
  - Registers the "Local project" button + connect dialog in `sidebar.footer.action`.
  - Holds the local folder read/write handles (browser memory only).
  - Polls `/local-project/ops` and executes operations via the File System Access API.

## Configuration (environment variables)

| Variable | Default | Description |
| --- | --- | --- |
| `DSH_LOCAL_PROJECT_ROOT` | `$DSH_HOME/workspaces` | Directory for placeholder workspaces (real files never live here). |

## Development / build

```bash
npm install
npm run build   # produces lib/index.js (Host) + lib/client.js (browser)
```

## License

[MIT](LICENSE)
