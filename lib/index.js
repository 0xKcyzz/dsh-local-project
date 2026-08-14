// src/index.ts
import { defineTool } from "@deepseek-ai/dsh-tools";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
var name = "dsh-local-project";
var inject = ["webServer", "workspaceRegistry", "tools", "systemPrompt"];
function dshHome() {
  return process.env.DSH_HOME || join(homedir(), ".dsh");
}
function rootDir() {
  return process.env.DSH_LOCAL_PROJECT_ROOT || join(dshHome(), "workspaces");
}
function sanitizeName(name2) {
  const s = typeof name2 === "string" ? name2.trim() : "";
  if (!s || s.length > 64 || /[\\/]|\.\./.test(s)) return "";
  return s;
}
function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(body);
}
function readJson(req, maxBytes) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > maxBytes) {
        reject(new Error("\u8BF7\u6C42\u4F53\u8FC7\u5927"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(typeof parsed === "object" && parsed !== null ? parsed : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}
function apply(ctx) {
  const projects = /* @__PURE__ */ new Map();
  const byName = /* @__PURE__ */ new Map();
  const opQueue = [];
  const pending = /* @__PURE__ */ new Map();
  function enqueue(projectId, kind, path, content) {
    return new Promise((resolve, reject) => {
      const op = { opId: randomUUID(), projectId, kind, path, content };
      opQueue.push(op);
      pending.set(op.opId, {
        resolve,
        reject,
        timer: setTimeout(() => {
          pending.delete(op.opId);
          reject(new Error("\u672C\u5730\u4EE3\u7406\u65E0\u54CD\u5E94\uFF08\u6D4F\u89C8\u5668\u6807\u7B7E\u9875\u53EF\u80FD\u5DF2\u5173\u95ED\uFF09"));
        }, 3e4)
      });
    });
  }
  async function run(kind, args) {
    const name2 = sanitizeName(args?.project);
    const projectId = name2 ? byName.get(name2) : void 0;
    if (!projectId) {
      return { error: `\u672C\u5730\u9879\u76EE\u300C${name2 ?? ""}\u300D\u672A\u8FDE\u63A5\u3002\u8BF7\u5148\u5728\u4FA7\u8FB9\u680F\u70B9\u51FB\u300C\u672C\u5730\u9879\u76EE\u300D\u9009\u62E9\u672C\u5730\u6587\u4EF6\u5939\u3002` };
    }
    const path = typeof args?.path === "string" ? args.path : "";
    try {
      const result = await enqueue(projectId, kind, path, kind === "write" ? String(args?.content ?? "") : void 0);
      return result ?? { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }
  const toolDefs = [
    {
      name: "local_list",
      description: "List files and folders inside the user's LOCAL project (relayed through the browser to the folder the user picked). Use this instead of the server-side file tools when working on a local project. `path` is relative to the project root; empty or \"/\" lists the root. Triggers: local project, user's computer, local files.",
      parameters: {
        project: { type: "string", required: true, description: "The local project name (as shown in the workspace title)." },
        path: { type: "string", required: false, description: "Relative path to list; empty lists the project root." }
      },
      execute: (args) => run("list", args)
    },
    {
      name: "local_read",
      description: "Read a UTF-8 text file from the user's LOCAL project (relayed through the browser). `path` is relative to the project root. Use for local-project work instead of the server-side `read` tool.",
      parameters: {
        project: { type: "string", required: true, description: "The local project name." },
        path: { type: "string", required: true, description: "Relative path to the file to read." }
      },
      execute: (args) => run("read", args)
    },
    {
      name: "local_write",
      description: "Write (create or overwrite) a UTF-8 text file in the user's LOCAL project (relayed through the browser). `path` is relative to the project root; missing directories are created. Use for local-project work instead of the server-side `write` tool.",
      parameters: {
        project: { type: "string", required: true, description: "The local project name." },
        path: { type: "string", required: true, description: "Relative path to the file to write." },
        content: { type: "string", required: true, description: "The full text content to write." }
      },
      execute: (args) => run("write", args)
    },
    {
      name: "local_delete",
      description: "Delete a file (or recursively a folder) inside the user's LOCAL project (relayed through the browser). `path` is relative to the project root. Use for local-project work instead of the server-side file tools.",
      parameters: {
        project: { type: "string", required: true, description: "The local project name." },
        path: { type: "string", required: true, description: "Relative path of the file/folder to delete." }
      },
      execute: (args) => run("delete", args)
    }
  ];
  for (const def of toolDefs) {
    ctx.effect(() => ctx.tools.register(defineTool(def)), `local-project: tool ${def.name}`);
  }
  ctx.effect(
    () => ctx.systemPrompt.section({
      name: "local-project",
      order: 200,
      text: "\u672C\u5730\u9879\u76EE\uFF1A\u5F53\u4F60\u5DE5\u4F5C\u4E8E\u6807\u9898\u4EE5\u300C\u672C\u5730\u9879\u76EE: \u300D\u5F00\u5934\u7684\u5DE5\u4F5C\u533A\u65F6\uFF0C\u7528\u6237\u5E0C\u671B\u64CD\u4F5C\u7684\u662F\u5176\u672C\u5730\u7535\u8111\u4E0A\u7684\u771F\u5B9E\u6587\u4EF6\u3002\u8BF7\u4F7F\u7528 local_list / local_read / local_write / local_delete \u5DE5\u5177\uFF08\u8FD9\u4E9B\u64CD\u4F5C\u7ECF\u6D4F\u89C8\u5668\u4E2D\u7EE7\u5230\u7528\u6237\u9009\u62E9\u7684\u672C\u5730\u6587\u4EF6\u5939\uFF09\u3002\u6807\u51C6\u7684\u670D\u52A1\u5668\u7AEF\u6587\u4EF6\u5DE5\u5177\uFF08read/write/edit/glob \u7B49\uFF09\u64CD\u4F5C\u7684\u662F\u670D\u52A1\u5668\u8DEF\u5F84\uFF0C\u65E0\u6CD5\u8BBF\u95EE\u672C\u5730\u6587\u4EF6\uFF0C\u4E0D\u8981\u6DF7\u7528\u3002"
    }),
    "local-project: prompt section"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "prefix",
      path: "/local-project",
      handler: async (req, res) => {
        const url = new URL(req.url ?? "/", "http://x");
        const pathname = url.pathname;
        try {
          if (pathname === "/local-project/register" && req.method === "POST") {
            const body = await readJson(req, 1e6);
            const name2 = sanitizeName(body?.name);
            if (!name2) {
              sendJson(res, 400, { ok: false, error: "\u9879\u76EE\u540D\u79F0\u65E0\u6548\uFF08\u4E0D\u80FD\u5305\u542B / \\ ..\uFF09" });
              return;
            }
            const dir = join(rootDir(), name2);
            mkdirSync(dir, { recursive: true });
            let existing;
            try {
              existing = await ctx.workspaceRegistry.resolveByPath(dir);
            } catch {
              existing = void 0;
            }
            let ws = existing;
            if (!ws) {
              ws = await ctx.workspaceRegistry.create(dir, `\u672C\u5730\u9879\u76EE: ${name2}`);
            }
            const id = randomUUID();
            projects.set(id, { id, name: name2, dir });
            byName.set(name2, id);
            sendJson(res, 200, {
              ok: true,
              projectId: id,
              workspace: ws ? { id: ws.id, path: ws.path, title: ws.title } : void 0
            });
            return;
          }
          if (pathname === "/local-project/ops" && req.method === "GET") {
            const projectId = url.searchParams.get("project") ?? "";
            const idx = opQueue.findIndex((op2) => !projectId || op2.projectId === projectId);
            if (idx === -1) {
              sendJson(res, 200, { pending: false });
              return;
            }
            const [op] = opQueue.splice(idx, 1);
            sendJson(res, 200, { pending: true, op });
            return;
          }
          if (pathname === "/local-project/result" && req.method === "POST") {
            const body = await readJson(req, 2e7);
            const opId = typeof body?.opId === "string" ? body.opId : "";
            const entry = pending.get(opId);
            if (!entry) {
              sendJson(res, 200, { ok: true });
              return;
            }
            pending.delete(opId);
            clearTimeout(entry.timer);
            if (body?.ok) entry.resolve(body?.result ?? {});
            else entry.reject(new Error(typeof body?.error === "string" ? body.error : "\u672C\u5730\u64CD\u4F5C\u5931\u8D25"));
            sendJson(res, 200, { ok: true });
            return;
          }
          sendJson(res, 404, { ok: false, error: "\u672A\u77E5\u8DEF\u7531" });
        } catch (err) {
          ctx.logger?.error(err);
          sendJson(res, 500, { ok: false, error: err instanceof Error ? err.message : String(err) });
        }
      }
    }),
    "local-project: routes"
  );
  ctx.effect(
    () => () => {
      for (const entry of pending.values()) {
        clearTimeout(entry.timer);
        entry.reject(new Error("\u672C\u5730\u9879\u76EE\u63D2\u4EF6\u5DF2\u505C\u6B62"));
      }
    },
    "local-project: cleanup"
  );
}
export {
  apply,
  inject,
  name
};
