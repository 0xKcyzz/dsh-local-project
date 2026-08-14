<p align="center">
  <strong>简体中文</strong> | <a href="README_EN.md">English</a>
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-0B7285?style=flat-square">
  <img alt="DSH: Web" src="https://img.shields.io/badge/DeepSeek%20Harness-Web-5B4CF0?style=flat-square">
  <img alt="Topics" src="https://img.shields.io/badge/topic-dsh--plugin-5B4CF0?style=flat-square">
</p>

# DSH Local Project · 本地项目

> 把本地文件夹导入为服务器 DSH 的工作区（服务器保留一份镜像副本）。**只有当 DSH 修改了文件时才同步回本地**（服务器 `fs.watch` 检测 + 浏览器拉取），不做持续的双向同步。删除项目只删服务器副本，不影响本地。类似 Grok 网页版的「新建项目」。

**安装：**

```bash
dsh plugin --profile web add github:w769721503/dsh-local-project
```

安装后**重启 DSH**，侧边栏底部出现「本地项目」按钮。

## 工作方式（Grok 模型）

1. 浏览器里点「本地项目」→ 选择本地文件夹（File System Access API 授权，浏览器拿到读写句柄）。
2. 文件夹内容**上传到服务器**，创建为真实工作区目录（DSH 原生 `read/write/edit/glob/bash` 工具直接可用，无需自定义工具）。
3. **拉取同步（仅 DSH → 本地）**：服务器用 `fs.watch` 监听项目目录，DSH 一改文件就记下变更；浏览器每 2 秒轻量检查一次变更号，有变更就把那些文件**下载回本地**。本地改动不会自动上传，也不会持续扫描本地文件。
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
- **变更轮询约 2 秒**：DSH 修改后最长约 2 秒同步到本地；轮询只查一个变更号，不扫描本地文件。
- **桌面端 Electron 窗口**：若 API 不可用，请用系统浏览器打开 DSH 的 Web 地址。

## 工作原理（架构）

- **Host 半侧**（`src/index.ts` → `lib/index.js`）：
  - `POST /local-project/create`：创建服务器目录 + 工作区记录。
  - `POST /local-project/upload`：写入/覆盖服务器文件（base64，二进制安全；用于首次导入）。
  - `GET /local-project/rev`：返回项目变更号（供浏览器轻量轮询）。
  - `GET /local-project/pull`：返回自上次拉取以来被 DSH 改动的文件路径。
  - `GET /local-project/manifest` / `download`：全量校准 / 下载文件（base64）。
  - `POST /local-project/delete`：删除服务器目录 + 工作区记录。
- **Client 半侧**（`src/client/index.tsx` → `lib/client.js`）：
  - `sidebar.footer.action` 注册「本地项目」按钮 + 导入弹窗。
  - 持有本地文件夹读写句柄（仅存于浏览器内存）。
  - 首次导入时上传全部本地文件；之后每 2 秒轮询 `rev`，DSH 有改动就把对应文件拉取回本地（`fs.watch` 驱动，不扫描本地、不持续双向同步）。
  - 「删除项目」调用服务器删除接口，本地句柄随之释放。

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
