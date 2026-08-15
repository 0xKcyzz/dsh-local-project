// src/index.ts
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, watch } from "node:fs";
import { dirname, join, normalize, relative, sep } from "node:path";
import { homedir } from "node:os";
import { WebSocketServer } from "ws";
var name = "dsh-local-project";
var inject = ["webServer", "workspaceRegistry"];
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
function safeTarget(dir, rel) {
  if (typeof rel !== "string") return null;
  const s = rel.replace(/\\/g, "/");
  if (!s || s.includes("..") || s.includes("\0")) return null;
  const target = normalize(join(dir, s));
  if (target !== dir && !target.startsWith(dir + sep)) return null;
  return target;
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
function walkFiles(dir, base, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const abs = join(dir, entry.name);
    const rel = relative(base, abs).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      walkFiles(abs, base, out);
    } else if (entry.isFile()) {
      try {
        const st = statSync(abs);
        out[rel] = { size: st.size, mtimeMs: st.mtimeMs };
      } catch {
      }
    }
  }
}
function apply(ctx) {
  const watchers = /* @__PURE__ */ new Map();
  const sockets = /* @__PURE__ */ new Map();
  const wss = new WebSocketServer({ noServer: true });
  function broadcast(name2, msg) {
    const set = sockets.get(name2);
    if (!set || set.size === 0) return;
    const data = JSON.stringify(msg);
    for (const ws of set) {
      if (ws.readyState === 1) {
        try {
          ws.send(data);
        } catch {
        }
      }
    }
  }
  function ensureWatcher(name2, dir) {
    if (watchers.has(name2)) return;
    const w = { rev: 0, pathRev: /* @__PURE__ */ new Map(), fullDirtyRev: 0, watcher: null };
    try {
      w.watcher = watch(dir, { recursive: true }, (event, filename) => {
        w.rev++;
        const paths = [];
        if (filename) {
          const rel = String(filename).replace(/\\/g, "/");
          w.pathRev.set(rel, w.rev);
          paths.push(rel);
        } else {
          w.fullDirtyRev = w.rev;
        }
        broadcast(name2, { type: "changes", rev: w.rev, paths, full: w.fullDirtyRev === w.rev });
      });
    } catch {
      w.watcher = null;
    }
    watchers.set(name2, w);
  }
  function stopWatcher(name2) {
    const w = watchers.get(name2);
    if (w) {
      try {
        w.watcher?.close();
      } catch {
      }
      watchers.delete(name2);
    }
  }
  ctx.effect(
    () => () => {
      for (const w of watchers.values()) {
        try {
          w.watcher?.close();
        } catch {
        }
      }
      watchers.clear();
      for (const set of sockets.values()) {
        for (const ws of set) {
          try {
            ws.close();
          } catch {
          }
        }
      }
      sockets.clear();
      try {
        wss.close();
      } catch {
      }
    },
    "local-project: watchers cleanup"
  );
  ctx.effect(
    () => ctx.webServer.registerUpgrade({
      path: "/local-project/ws",
      handler: (req, socket, head) => {
        const url = new URL(req.url ?? "/", "http://x");
        const name2 = sanitizeName(url.searchParams.get("name"));
        if (!name2) {
          socket.destroy();
          return;
        }
        try {
          wss.handleUpgrade(req, socket, head, (ws) => {
            let set = sockets.get(name2);
            if (!set) {
              set = /* @__PURE__ */ new Set();
              sockets.set(name2, set);
            }
            set.add(ws);
            ws.on("close", () => {
              set?.delete(ws);
              if (set && set.size === 0) sockets.delete(name2);
            });
            ws.on("error", () => {
              try {
                ws.close();
              } catch {
              }
            });
          });
        } catch (err) {
          ctx.logger?.error(err);
          try {
            socket.destroy();
          } catch {
          }
        }
      }
    }),
    "local-project: websocket"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "prefix",
      path: "/local-project",
      handler: async (req, res) => {
        const url = new URL(req.url ?? "/", "http://x");
        const pathname = url.pathname;
        try {
          if (pathname === "/local-project/create" && req.method === "POST") {
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
            if (!existing) {
              await ctx.workspaceRegistry.create(dir, `\u672C\u5730\u9879\u76EE: ${name2}`);
            }
            ensureWatcher(name2, dir);
            sendJson(res, 200, { ok: true, name: name2, dir });
            return;
          }
          if (pathname === "/local-project/upload" && req.method === "POST") {
            const body = await readJson(req, 25e6);
            const name2 = sanitizeName(body?.name);
            const dir = join(rootDir(), name2);
            const target = name2 ? safeTarget(dir, body?.path) : null;
            const content = typeof body?.content === "string" ? body.content : "";
            if (!name2 || !target) {
              sendJson(res, 400, { ok: false, error: "\u53C2\u6570\u65E0\u6548" });
              return;
            }
            mkdirSync(dirname(target), { recursive: true });
            writeFileSync(target, Buffer.from(content, "base64"));
            sendJson(res, 200, { ok: true });
            return;
          }
          if (pathname === "/local-project/rev" && req.method === "GET") {
            const name2 = sanitizeName(url.searchParams.get("name"));
            if (!name2) {
              sendJson(res, 400, { ok: false, error: "\u53C2\u6570\u65E0\u6548" });
              return;
            }
            const rev = watchers.get(name2)?.rev ?? 0;
            sendJson(res, 200, { ok: true, rev });
            return;
          }
          if (pathname === "/local-project/pull" && req.method === "GET") {
            const name2 = sanitizeName(url.searchParams.get("name"));
            if (!name2) {
              sendJson(res, 400, { ok: false, error: "\u53C2\u6570\u65E0\u6548" });
              return;
            }
            const since = Number(url.searchParams.get("since") ?? 0) || 0;
            const w = watchers.get(name2);
            const rev = w?.rev ?? 0;
            const paths = [];
            if (w) {
              for (const [p, r] of w.pathRev) if (r > since) paths.push(p);
            }
            const full = (w?.fullDirtyRev ?? 0) > since;
            sendJson(res, 200, { ok: true, rev, paths, full });
            return;
          }
          if (pathname === "/local-project/list" && req.method === "GET") {
            const root = rootDir();
            const projects = [];
            if (existsSync(root)) {
              for (const entry of readdirSync(root, { withFileTypes: true })) {
                if (entry.isDirectory()) {
                  const name2 = sanitizeName(entry.name);
                  if (name2) projects.push({ name: name2 });
                }
              }
            }
            sendJson(res, 200, { ok: true, projects });
            return;
          }
          if (pathname === "/local-project/manifest" && req.method === "GET") {
            const name2 = sanitizeName(url.searchParams.get("name"));
            if (!name2) {
              sendJson(res, 400, { ok: false, error: "\u53C2\u6570\u65E0\u6548" });
              return;
            }
            const dir = join(rootDir(), name2);
            const files = {};
            if (existsSync(dir)) walkFiles(dir, dir, files);
            sendJson(res, 200, { ok: true, files });
            return;
          }
          if (pathname === "/local-project/download" && req.method === "GET") {
            const name2 = sanitizeName(url.searchParams.get("name"));
            const dir = join(rootDir(), name2);
            const target = name2 ? safeTarget(dir, url.searchParams.get("path")) : null;
            if (!name2 || !target || !existsSync(target) || !statSync(target).isFile()) {
              sendJson(res, 404, { ok: false, error: "\u6587\u4EF6\u4E0D\u5B58\u5728" });
              return;
            }
            const buf = readFileSync(target);
            sendJson(res, 200, { ok: true, content: buf.toString("base64") });
            return;
          }
          if (pathname === "/local-project/delete" && req.method === "POST") {
            const body = await readJson(req, 1e6);
            const name2 = sanitizeName(body?.name);
            if (!name2) {
              sendJson(res, 400, { ok: false, error: "\u53C2\u6570\u65E0\u6548" });
              return;
            }
            const dir = join(rootDir(), name2);
            stopWatcher(name2);
            const set = sockets.get(name2);
            if (set) {
              for (const ws of set) {
                try {
                  ws.close();
                } catch {
                }
              }
              set.clear();
              sockets.delete(name2);
            }
            try {
              const ws = await ctx.workspaceRegistry.resolveByPath(dir);
              if (ws) await ctx.workspaceRegistry.delete(ws.id);
            } catch (err) {
              if (!existsSync(dir)) {
                ctx.logger?.warn(err);
              } else {
                throw err;
              }
            }
            rmSync(dir, { recursive: true, force: true });
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
}
export {
  apply,
  inject,
  name
};
