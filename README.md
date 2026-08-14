<p align="center">
  <strong>简体中文</strong> | <a href="README_EN.md">English</a>
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-0B7285?style=flat-square">
  <img alt="DSH: Web" src="https://img.shields.io/badge/DeepSeek%20Harness-Web-5B4CF0?style=flat-square">
  <img alt="Topics" src="https://img.shields.io/badge/topic-dsh--plugin-5B4CF0?style=flat-square">
</p>

# DSH Local Project · 本地项目

> 让**部署在服务器上的 DSH** 直接读写你**本地电脑**的文件：在侧边栏底部点击「本地项目」，选择本地文件夹，之后在对应工作区里对话，DSH 用 `local_*` 工具操作的就是你本地磁盘上的真实文件（经浏览器中继，不上传、不复制到服务器）。

**安装：**

```bash
dsh plugin --profile web add github:w769721503/dsh-local-project
```

安装后**重启 DSH**，侧边栏底部会出现「本地项目」按钮。

## 原理

服务器 DSH 的内置文件工具（`fs`/`bash`）操作的是**服务器路径**，无法直接访问你的本地磁盘。本插件用**浏览器作为本地文件代理**：

1. 你在浏览器里点「本地项目」→ 选择本地文件夹（File System Access API 拿到**读写句柄**，句柄只存在你本地的浏览器里）。
2. 服务器注册一个「本地项目: 名称」工作区，并注册 4 个 `local_*` 工具。
3. 你在该工作区对话时，模型调用 `local_read / local_write / local_list / local_delete`。
4. 服务器把这些文件操作**入队**；浏览器每 400ms 轮询一次，取到操作后在本地文件夹上执行（读写删），再把结果回报给服务器。

全程**不上传文件内容到服务器**、不在服务器留副本——服务器只收到"文件名+操作指令"，实际读写发生在你的本地磁盘。

## 支持的操作

| 工具 | 作用 |
|---|---|
| `local_list(project, path)` | 列出本地项目里的文件/文件夹 |
| `local_read(project, path)` | 读取本地 UTF-8 文本文件 |
| `local_write(project, path, content)` | 写入/覆盖本地文本文件（自动创建缺失目录） |
| `local_delete(project, path)` | 删除本地文件或文件夹 |

## 使用

1. 重启 DSH 后，侧边栏底部点「📁 本地项目」。
2. 输入项目名称 → 点「选择文件夹并连接」→ 在系统对话框里选一个本地文件夹（Chrome/Edge 会弹"允许访问"授权）。
3. 左侧工作区列表出现「本地项目: 名称」。
4. 打开该工作区发起对话，模型会自动使用 `local_*` 工具操作你本地文件。

## 限制

- **需要浏览器支持 File System Access API**：Chrome / Edge（含基于 Chromium 的浏览器）。Firefox / Safari 暂不支持，会提示不可用。
- **只能读写文本文件**：`local_read`/`local_write` 按 UTF-8 文本处理；二进制文件（图片、压缩包等）会失真，请勿用于二进制。
- **不能执行本地 shell 命令**：浏览器沙箱限制，无法运行本地命令；如需执行命令，需后续引入本地助手程序。
- **浏览器标签页要保持打开**：文件操作由当前页面中继，关闭页面后 `local_*` 会返回"本地代理无响应"。
- **桌面端 Electron 窗口**：若 File System Access API 不可用，请改用系统浏览器打开 DSH 的 Web 地址。

## 工作原理（架构）

- **Host 半侧**（`src/index.ts` → `lib/index.js`）：
  - 注册 `local_*` 4 个模型工具（经 `@deepseek-ai/dsh-tools` 的 `defineTool`）。
  - `/local-project/register`：创建占位工作区并登记项目。
  - `/local-project/ops`：浏览器轮询取下一个待执行操作。
  - `/local-project/result`：浏览器回报执行结果，唤醒等待中的工具调用。
  - `systemPrompt.section`：提示模型在「本地项目」工作区使用 `local_*` 工具。
- **Client 半侧**（`src/client/index.tsx` → `lib/client.js`）：
  - `sidebar.footer.action` 注册「本地项目」按钮 + 连接弹窗。
  - 持有本地文件夹读写句柄（仅存于浏览器内存）。
  - 轮询 `/local-project/ops`，用 File System Access API 执行操作并回报。

## 配置（环境变量）

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DSH_LOCAL_PROJECT_ROOT` | `$DSH_HOME/workspaces` | 本地项目占位工作区目录（实际文件不存这里）。 |

## 开发 / 构建

```bash
npm install
npm run build   # 产出 lib/index.js（Host）+ lib/client.js（浏览器）
```

## License

[MIT](LICENSE)
