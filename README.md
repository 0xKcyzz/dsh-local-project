<p align="center">
  <strong>简体中文</strong> | <a href="README_EN.md">English</a>
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-0B7285?style=flat-square">
  <img alt="DSH: Web" src="https://img.shields.io/badge/DeepSeek%20Harness-Web-5B4CF0?style=flat-square">
  <img alt="Topics" src="https://img.shields.io/badge/topic-dsh--plugin-5B4CF0?style=flat-square">
</p>

# DSH Local Project · 本地项目

> 把本地文件夹导入为服务器 DSH 的工作区（服务器保留一份镜像副本）。**只有当 DSH 修改了文件时才同步回本地**（服务器 `fs.watch` 检测 + **WebSocket 实时推送**），不做持续的双向同步。删除项目只删服务器副本，不影响本地。类似 Grok 网页版的「新建项目」。

**安装：**

```bash
dsh plugin --profile web add github:w769721503/dsh-local-project
```

安装后**重启 DSH**，侧边栏底部出现「本地项目」按钮。

## 工作方式（Grok 模型）

1. 浏览器里点「本地项目」→ 选择本地文件夹（File System Access API 授权，浏览器拿到读写句柄）。
2. 文件夹内容**上传到服务器**，创建为真实工作区目录（DSH 原生 `read/write/edit/glob/bash` 工具直接可用，无需自定义工具）。
3. **拉取同步（仅 DSH → 本地，WebSocket 实时推送）**：服务器用 `fs.watch` 监听项目目录，DSH 一改文件就通过 WebSocket 把变更推给浏览器，浏览器只下载这些被改动的文件回本地——**没有轮询**，改动是瞬间的。断线自动重连（指数退避），重连后自动补齐断线期间漏掉的变更。本地改动不会自动上传，也不会持续扫描本地文件。
4. **删除项目**：只删除服务器上的副本与工作区记录，本地文件不受影响（不做单个文件的删除同步，避免误删）。

## 使用

1. 重启 DSH 后，侧边栏底部点「📁 本地项目」。
2. 输入项目名称 → 点「选择文件夹并导入」→ 系统对话框选本地文件夹（Chrome/Edge 授权）。
3. 首次导入开始上传同步；左侧工作区列表出现「本地项目: 名称」。
4. 打开该工作区对话，DSH 用原生工具操作的就是服务器镜像副本，改动会自动同步回本地。

## 限制

- **需要浏览器支持 File System Access API**：Chrome / Edge（含 Chromium）。Firefox / Safari 不支持。
- **单个文件上限约 15MB**（上传走 base64 JSON）；超大文件请勿放入项目。
- **不传播单个文件的删除**：只有「删除项目」会整包删除服务器副本，本地/服务器各自删除的文件不会被对面清除。
- **本地改动不自动上传**：只有首次导入会上传本地文件；之后本地手改的文件不会同步到服务器（服务器镜像以 DSH 的修改为准）。
- **实时推送需保持 WebSocket 连接**：DSH 修改后由服务器 WebSocket 实时推送回本地（无轮询）；断线会自动重连并补齐漏掉的变更。
- **桌面端 Electron 窗口**：若 API 不可用，请用系统浏览器打开 DSH 的 Web 地址。

## 工作原理（架构）

- **Host 半侧**（`src/index.ts` → `lib/index.js`）：
  - `POST /local-project/create`：创建服务器目录 + 工作区记录。
  - `POST /local-project/upload`：写入/覆盖服务器文件（base64，二进制安全；用于首次导入）。
  - `GET /local-project/rev`：返回项目变更号（用于首次导入建立基线）。
  - `GET /local-project/pull`：返回自上次拉取以来被 DSH 改动的文件路径（用于断线重连后补齐）。
  - `GET /local-project/manifest` / `download`：全量校准 / 下载文件（base64）。
  - `POST /local-project/delete`：删除服务器目录 + 工作区记录。
  - **WebSocket 升级路由 `GET /local-project/ws?name=…`**：`fs.watch` 一触发，服务器就把变更集 `{type:'changes', rev, paths, full}` 推给该项目的所有连接（内置 `ws` 库，随插件打包，无额外依赖）。
- **Client 半侧**（`src/client/index.tsx` → `lib/client.js`）：
  - `sidebar.footer.action` 注册「本地项目」按钮 + 导入弹窗。
  - 持有本地文件夹读写句柄（仅存于浏览器内存）。
  - 首次导入时上传全部本地文件并建立变更号基线；之后**由 WebSocket 接收服务器推送的变更**，只把被 DSH 改动的文件写回本地（无轮询；断线按 2s→30s 指数退避重连，重连成功先拉取漏掉的变更）。
  - 「删除项目」调用服务器删除接口并关闭对应 WebSocket。

## 配置（环境变量）

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DSH_LOCAL_PROJECT_ROOT` | `$DSH_HOME/workspaces` | 本地项目的服务器镜像目录。 |

## 开发 / 构建

```bash
npm install
npm run build   # 产出 lib/index.js（Host）+ lib/client.js（浏览器）
```

## License

[MIT](LICENSE)
