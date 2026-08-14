<p align="center">
  <strong>简体中文</strong> | <a href="README_EN.md">English</a>
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-0B7285?style=flat-square">
  <img alt="DSH: Web" src="https://img.shields.io/badge/DeepSeek%20Harness-Web-5B4CF0?style=flat-square">
  <img alt="Topics" src="https://img.shields.io/badge/topic-dsh--plugin-5B4CF0?style=flat-square">
</p>

# DSH Local Project · 本地项目

> 把本地文件夹导入为服务器 DSH 的工作区（服务器保留一份镜像副本），并在网页与本地之间**双向同步**——在 DSH 里改文件会同步回本地，本地改文件也会同步到服务器。删除项目只删服务器副本，不影响本地。类似 Grok 网页版的「新建项目」。

**安装：**

```bash
dsh plugin --profile web add github:w769721503/dsh-local-project
```

安装后**重启 DSH**，侧边栏底部出现「本地项目」按钮。

## 工作方式（Grok 模型）

1. 浏览器里点「本地项目」→ 选择本地文件夹（File System Access API 授权，浏览器拿到读写句柄）。
2. 文件夹内容**上传到服务器**，创建为真实工作区目录（DSH 原生 `read/write/edit/glob/bash` 工具直接可用，无需自定义工具）。
3. **双向同步**（浏览器每 5 秒驱动一次）：
   - 服务器（DSH 修改）有变化 → 下载回本地；
   - 本地有变化 → 上传到服务器；
   - 两侧同时改同一文件 → 以较新的修改时间为准。
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
- **同步间隔 5 秒**：改动最长 5 秒后同步；项目文件过多时每次全量扫描会较慢。
- **桌面端 Electron 窗口**：若 API 不可用，请用系统浏览器打开 DSH 的 Web 地址。

## 工作原理（架构）

- **Host 半侧**（`src/index.ts` → `lib/index.js`）：
  - `POST /local-project/create`：创建服务器目录 + 工作区记录。
  - `POST /local-project/upload`：写入/覆盖服务器文件（base64，二进制安全）。
  - `GET /local-project/manifest`：返回服务器文件的 `{ size, mtimeMs }` 清单（用于同步比对）。
  - `GET /local-project/download`：读取服务器文件（base64）。
  - `POST /local-project/delete`：删除服务器目录 + 工作区记录。
- **Client 半侧**（`src/client/index.tsx` → `lib/client.js`）：
  - `sidebar.footer.action` 注册「本地项目」按钮 + 导入弹窗。
  - 持有本地文件夹读写句柄（仅存于浏览器内存）。
  - 每 5 秒构建本地清单、拉取服务器清单、双向差异同步（按 size+mtime 签名，避免循环）。
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
