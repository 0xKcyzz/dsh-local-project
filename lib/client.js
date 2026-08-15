window.__ModuleLoader__.load({
  id: "dsh-local-project",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

    // src/client/index.tsx
    var index_exports = {};
    __export(index_exports, {
      apply: () => apply,
      inject: () => inject
    });
    module.exports = __toCommonJS(index_exports);
    var import_react = require("react");

    // src/client/store.css
    var store_default = ".lp-root {\n  position: relative;\n}\n\n.lp-trigger {\n  border: 1px solid var(--dsw-alias-border-l2, #333);\n  background: var(--dsw-alias-bg-layer-3, #222);\n  color: var(--dsw-alias-label-primary, #eee);\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  cursor: pointer;\n  border-radius: 6px;\n  padding: 4px 10px;\n  white-space: nowrap;\n}\n.lp-trigger:hover {\n  border-color: var(--dsw-alias-state-business-primary, #4b6fff);\n  color: var(--dsw-alias-state-business-primary, #4b6fff);\n}\n\n.lp-backdrop {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.4);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 120;\n}\n.lp-modal {\n  background: var(--dsw-alias-bg-layer-1, #1c1c1c);\n  border: 1px solid var(--dsw-alias-border-l2, #333);\n  border-radius: 10px;\n  padding: 16px;\n  width: min(440px, calc(100vw - 32px));\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  color: var(--dsw-alias-label-primary, #eee);\n}\n.lp-modal h4 {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n}\n.lp-hint {\n  margin: 0;\n  color: var(--dsw-alias-label-tertiary, #999);\n  font-size: 12px;\n  line-height: 18px;\n}\n.lp-field {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  font-size: 12px;\n  color: var(--dsw-alias-label-secondary, #bbb);\n}\n.lp-field input {\n  border: 1px solid var(--dsw-alias-border-l2, #333);\n  background: var(--dsw-alias-bg-layer-1, #1c1c1c);\n  height: 34px;\n  color: var(--dsw-alias-label-primary, #eee);\n  font: inherit;\n  border-radius: 8px;\n  padding: 0 12px;\n  font-size: 13px;\n}\n.lp-error {\n  margin: 0;\n  color: var(--dsw-alias-state-error-primary, #e5534b);\n  font-size: 12px;\n  line-height: 18px;\n  word-break: break-all;\n}\n.lp-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n}\n.lp-actions button {\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  border-radius: 6px;\n  padding: 5px 12px;\n  cursor: pointer;\n}\n.lp-primary {\n  border: 1px solid var(--dsw-alias-state-business-primary, #4b6fff);\n  background: var(--dsw-alias-state-business-primary, #4b6fff);\n  color: #fff;\n}\n.lp-secondary {\n  border: 1px solid var(--dsw-alias-border-l2, #333);\n  background: transparent;\n  color: var(--dsw-alias-label-primary, #eee);\n}\n.lp-danger {\n  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary, #e5534b) 50%, transparent);\n  background: transparent;\n  color: var(--dsw-alias-state-error-primary, #e5534b);\n}\n.lp-projects {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.lp-project {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  border: 1px solid var(--dsw-alias-border-l2, #333);\n  border-radius: 8px;\n  padding: 6px 10px;\n}\n.lp-project-name {\n  font-size: 12px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.lp-empty {\n  margin: 0;\n  color: var(--dsw-alias-label-tertiary, #999);\n  font-size: 12px;\n}\n\n.lp-project-actions {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex: none;\n}\n\n.lp-actions button:disabled,\n.lp-project-actions button:disabled {\n  opacity: 0.55;\n  cursor: not-allowed;\n}\n";

    // src/client/index.tsx
    var import_jsx_runtime = require("react/jsx-runtime");
    var NS = "sidebar.localProject";
    var STORAGE_KEY = "dsh-local-project.projects";
    var zh = {
      label: "\u672C\u5730\u9879\u76EE",
      modalTitle: "\u5BFC\u5165\u672C\u5730\u9879\u76EE",
      hint: "\u9009\u62E9\u672C\u5730\u6587\u4EF6\u5939\uFF0C\u4E0A\u4F20\u5230\u670D\u52A1\u5668\u521B\u5EFA\u4E3A\u5DE5\u4F5C\u533A\u3002\u4E4B\u540E DSH \u4FEE\u6539\u4E86\u6587\u4EF6\u624D\u4F1A\u540C\u6B65\u56DE\u672C\u5730\uFF0C\u4E0D\u4F1A\u6301\u7EED\u540C\u6B65\u3002\u5220\u9664\u9879\u76EE\u53EA\u5220\u670D\u52A1\u5668\u526F\u672C\uFF0C\u4E0D\u78B0\u672C\u5730\u6587\u4EF6\u3002",
      nameLabel: "\u9879\u76EE\u540D\u79F0",
      create: "\u9009\u62E9\u6587\u4EF6\u5939\u5E76\u5BFC\u5165",
      cancel: "\u53D6\u6D88",
      success: (n) => `\u672C\u5730\u9879\u76EE\u300C${n}\u300D\u5DF2\u5BFC\u5165\uFF0C\u6B63\u5728\u4E0A\u4F20\u6587\u4EF6\u2026`,
      done: (n) => `\u300C${n}\u300D\u5BFC\u5165\u5B8C\u6210\u3002\u4E4B\u540E DSH \u4FEE\u6539\u6587\u4EF6\u4F1A\u81EA\u52A8\u540C\u6B65\u56DE\u672C\u5730\u3002`,
      error: "\u5931\u8D25\uFF1A",
      noApi: "\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301\u6587\u4EF6\u7CFB\u7EDF\u8BBF\u95EE API\uFF08\u9700\u8981 Chrome/Edge \u6D4F\u89C8\u5668\uFF09\u3002",
      deleteProject: "\u5220\u9664\u670D\u52A1\u5668\u9879\u76EE",
      deleteConfirm: (n) => `\u786E\u5B9A\u5220\u9664\u670D\u52A1\u5668\u4E0A\u7684\u672C\u5730\u9879\u76EE\u300C${n}\u300D\uFF1F\u670D\u52A1\u5668\u526F\u672C\u4F1A\u88AB\u5220\u9664\uFF0C\u672C\u5730\u6587\u4EF6\u4E0D\u53D7\u5F71\u54CD\u3002`,
      empty: "\u5C1A\u672A\u5BFC\u5165\u4EFB\u4F55\u672C\u5730\u9879\u76EE",
      importing: "\u6B63\u5728\u4E0A\u4F20\u6587\u4EF6\u2026",
      resume: "\u91CD\u65B0\u9009\u62E9\u6587\u4EF6\u5939\u5E76\u6062\u590D\u540C\u6B65",
      resuming: "\u6B63\u5728\u6062\u590D\u540C\u6B65\u2026"
    };
    var en = {
      label: "Local project",
      modalTitle: "Import local project",
      hint: "Pick a local folder; it is uploaded to the server as a workspace. After that, files sync back to local only when DSH modifies them \u2014 no continuous sync. Deleting a project removes only the server copy.",
      nameLabel: "Project name",
      create: "Choose folder & import",
      cancel: "Cancel",
      success: (n) => `Local project "${n}" imported; uploading files\u2026`,
      done: (n) => `"${n}" imported. DSH changes will sync back automatically.`,
      error: "Failed: ",
      noApi: "File System Access API is unavailable (needs Chrome/Edge).",
      deleteProject: "Delete server project",
      deleteConfirm: (n) => `Delete the server copy of "${n}"? Local files are not affected.`,
      empty: "No local projects imported",
      importing: "Uploading files\u2026",
      resume: "Choose folder & resume sync",
      resuming: "Resuming sync\u2026"
    };
    var inject = ["slots", "locale"];
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), "local-project: dictionaries");
      const t = ctx.locale.bind(NS);
      ctx.effect(() => injectCss(), "local-project: css");
      const injected = () => ({ t });
      ctx.slots.inject(
        "conversation.hero.workspace.directoryFlow",
        () => ctx.slots.inject("sidebar.workspaces.directoryFlow", function* () {
          yield ctx.slots.register(
            {
              name: "conversation.hero.workspace.directoryFlow",
              inject: injected
            },
            LocalProjectFlow
          );
          yield ctx.slots.register(
            {
              name: "sidebar.workspaces.directoryFlow",
              inject: injected
            },
            LocalProjectFlow
          );
        })
      );
    }
    function injectCss() {
      if (typeof document === "undefined") return () => {
      };
      const id = "dsh-local-project-css";
      if (document.getElementById(id)) return () => {
      };
      const el = document.createElement("style");
      el.id = id;
      el.dataset.plugin = "dsh-local-project";
      el.textContent = store_default;
      document.head.appendChild(el);
      return () => el.remove();
    }
    var activeSyncs = /* @__PURE__ */ new Map();
    var projectMetas = [];
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) projectMetas = parsed.filter((x) => x && typeof x.name === "string");
        }
      }
    } catch {
    }
    var projectListeners = /* @__PURE__ */ new Set();
    function emitProjects() {
      for (const listener of [...projectListeners]) listener();
    }
    function saveProjects() {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(projectMetas));
        }
      } catch {
      }
      emitProjects();
    }
    function addProjectMeta(meta) {
      if (projectMetas.some((p) => p.name === meta.name)) return;
      projectMetas = [...projectMetas, meta];
      saveProjects();
    }
    function removeProjectMeta(name) {
      projectMetas = projectMetas.filter((p) => p.name !== name);
      saveProjects();
    }
    function useProjects() {
      const [projects, setProjects] = (0, import_react.useState)(projectMetas);
      (0, import_react.useEffect)(() => {
        const listener = () => setProjects(projectMetas);
        projectListeners.add(listener);
        return () => {
          projectListeners.delete(listener);
        };
      }, []);
      (0, import_react.useEffect)(() => {
        let alive = true;
        getJson("/local-project/list").then((data) => {
          if (!alive || !data || !Array.isArray(data.projects)) return;
          let changed = false;
          for (const item of data.projects) {
            if (item && typeof item.name === "string" && !projectMetas.some((p) => p.name === item.name)) {
              projectMetas = [...projectMetas, { name: item.name }];
              changed = true;
            }
          }
          if (changed) saveProjects();
        }).catch(() => {
        });
        return () => {
          alive = false;
        };
      }, []);
      return projects;
    }
    async function resolveDir(root, parts, create) {
      let dir = root;
      for (const p of parts) {
        dir = await dir.getDirectoryHandle(p, { create });
      }
      return dir;
    }
    async function walkLocal(dir, prefix, out) {
      for await (const [name, entry] of dir.entries()) {
        const rel = prefix ? `${prefix}/${name}` : name;
        if (entry.kind === "directory") {
          await walkLocal(entry, rel, out);
        } else if (entry.kind === "file") {
          try {
            const fh = await entry.getFile();
            out[rel] = { size: fh.size, mtimeMs: fh.lastModified };
          } catch {
          }
        }
      }
    }
    async function resolveFile(handle, path, createDirs) {
      const parts = (path || "").split("/").filter(Boolean);
      const name = parts.pop() ?? "";
      const dir = parts.length ? await resolveDir(handle, parts, createDirs) : handle;
      return { dir, name };
    }
    async function readLocalFile(handle, path) {
      const { dir, name } = await resolveFile(handle, path, false);
      const fileHandle = await dir.getFileHandle(name);
      const file = await fileHandle.getFile();
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      const chunk = 32768;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
      }
      return btoa(binary);
    }
    async function writeLocalFile(handle, path, b64) {
      const { dir, name } = await resolveFile(handle, path, true);
      const fileHandle = await dir.getFileHandle(name, { create: true });
      const writable = await fileHandle.createWritable();
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      await writable.write(bytes);
      await writable.close();
    }
    async function getJson(url) {
      const res = await fetch(url);
      let payload;
      try {
        payload = await res.json();
      } catch {
        throw new Error(`HTTP ${res.status}`);
      }
      if (!res.ok || !payload || payload.ok !== true) {
        throw new Error(payload?.error || `HTTP ${res.status}`);
      }
      return payload;
    }
    async function postJson(url, data) {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data)
      });
      let payload;
      try {
        payload = await res.json();
      } catch {
        throw new Error(`HTTP ${res.status}`);
      }
      if (!res.ok || !payload || payload.ok !== true) {
        throw new Error(payload?.error || `HTTP ${res.status}`);
      }
      return payload;
    }
    async function importLocal(name, state) {
      const local = {};
      await walkLocal(state.handle, "", local);
      for (const p of Object.keys(local)) {
        const content = await readLocalFile(state.handle, p);
        await postJson("/local-project/upload", { name, path: p, content });
      }
      const r = await getJson(`/local-project/rev?name=${encodeURIComponent(name)}`);
      state.lastRev = r && r.rev ? r.rev : 0;
    }
    async function fullReconcile(name, state) {
      const local = {};
      await walkLocal(state.handle, "", local);
      const man = await getJson(`/local-project/manifest?name=${encodeURIComponent(name)}`);
      const server = man && man.files || {};
      for (const [p, sv] of Object.entries(server)) {
        const lv = local[p];
        const same = lv && lv.size === sv.size && Math.floor(lv.mtimeMs) === Math.floor(sv.mtimeMs);
        if (!same) {
          const dl = await getJson(
            `/local-project/download?name=${encodeURIComponent(name)}&path=${encodeURIComponent(p)}`
          );
          if (dl && dl.ok) await writeLocalFile(state.handle, p, dl.content);
        }
      }
    }
    function enqueue(state, fn) {
      state.queue = state.queue.then(fn).catch(() => {
      });
    }
    async function applySync(name, state, msg) {
      if (!msg || typeof msg.rev !== "number" || msg.rev <= state.lastRev) return;
      if (msg.full) {
        await fullReconcile(name, state);
      } else {
        for (const p of msg.paths || []) {
          const dl = await getJson(
            `/local-project/download?name=${encodeURIComponent(name)}&path=${encodeURIComponent(p)}`
          );
          if (dl && dl.ok) await writeLocalFile(state.handle, p, dl.content);
        }
      }
      state.lastRev = msg.rev;
    }
    async function catchUp(name, state) {
      const pull = await getJson(
        `/local-project/pull?name=${encodeURIComponent(name)}&since=${state.lastRev}`
      );
      if (pull && pull.ok) await applySync(name, state, pull);
    }
    function attachSync(name, state) {
      let attempt = 0;
      const connect = () => {
        if (state.closed) return;
        let ws;
        try {
          const proto = location.protocol === "https:" ? "wss" : "ws";
          ws = new WebSocket(
            `${proto}://${location.host}/local-project/ws?name=${encodeURIComponent(name)}`
          );
        } catch {
          schedule();
          return;
        }
        state.ws = ws;
        ws.onopen = () => {
          attempt = 0;
          enqueue(state, () => catchUp(name, state));
        };
        ws.onmessage = (ev) => {
          let msg;
          try {
            msg = JSON.parse(ev.data);
          } catch {
            return;
          }
          if (msg && msg.type === "changes") {
            enqueue(state, () => applySync(name, state, msg));
          }
        };
        ws.onclose = () => {
          if (state.ws === ws) state.ws = null;
          if (!state.closed) schedule();
        };
        ws.onerror = () => {
          try {
            ws.close();
          } catch {
          }
        };
      };
      const schedule = () => {
        const delay = Math.min(3e4, 2e3 * Math.pow(2, attempt));
        attempt++;
        state.reconnectTimer = window.setTimeout(connect, delay);
      };
      connect();
    }
    function closeSync(name) {
      const state = activeSyncs.get(name);
      if (!state) return;
      state.closed = true;
      if (state.reconnectTimer != null) window.clearTimeout(state.reconnectTimer);
      try {
        state.ws?.close();
      } catch {
      }
      activeSyncs.delete(name);
    }
    function pickDirectory() {
      const picker = window.showDirectoryPicker;
      if (typeof picker !== "function") {
        return Promise.reject(new Error("noApi"));
      }
      return picker.call(window, { mode: "readwrite" });
    }
    function LocalProjectFlow(props) {
      const { open, busy, onPicked, onCancel, t } = props;
      const [name, setName] = (0, import_react.useState)("");
      const [error, setError] = (0, import_react.useState)(null);
      const [importing, setImporting] = (0, import_react.useState)(false);
      const [resuming, setResuming] = (0, import_react.useState)(null);
      const projects = useProjects();
      const createProject = async () => {
        const wsName = name.trim();
        if (!wsName) {
          setError(t("nameLabel") + " \u4E0D\u80FD\u4E3A\u7A7A");
          return;
        }
        if (importing || busy) return;
        setError(null);
        let handle;
        try {
          handle = await pickDirectory();
        } catch (e) {
          const message = e instanceof Error && e.message === "noApi" ? t("noApi") : e instanceof Error ? e.message : String(e);
          setError(message);
          return;
        }
        setImporting(true);
        try {
          const res = await postJson("/local-project/create", { name: wsName });
          const state = {
            handle,
            lastRev: 0,
            ws: null,
            queue: Promise.resolve(),
            closed: false,
            reconnectTimer: null
          };
          activeSyncs.set(wsName, state);
          await importLocal(wsName, state);
          attachSync(wsName, state);
          addProjectMeta({ name: wsName, dir: res.dir || "" });
          setImporting(false);
          setName("");
          onPicked(res.dir || "");
        } catch (e) {
          try {
            await postJson("/local-project/delete", { name: wsName });
          } catch {
          }
          closeSync(wsName);
          setImporting(false);
          setError(t("error") + (e instanceof Error ? e.message : String(e)));
        }
      };
      const resumeProject = async (meta) => {
        if (activeSyncs.has(meta.name) || resuming) return;
        setError(null);
        let handle;
        try {
          handle = await pickDirectory();
        } catch (e) {
          const message = e instanceof Error && e.message === "noApi" ? t("noApi") : e instanceof Error ? e.message : String(e);
          setError(message);
          return;
        }
        setResuming(meta.name);
        try {
          const state = {
            handle,
            lastRev: 0,
            ws: null,
            queue: Promise.resolve(),
            closed: false,
            reconnectTimer: null
          };
          activeSyncs.set(meta.name, state);
          const rev = await getJson(`/local-project/rev?name=${encodeURIComponent(meta.name)}`);
          state.lastRev = rev && rev.rev ? rev.rev : 0;
          await fullReconcile(meta.name, state);
          attachSync(meta.name, state);
          setResuming(null);
        } catch (e) {
          closeSync(meta.name);
          setResuming(null);
          setError(t("error") + (e instanceof Error ? e.message : String(e)));
        }
      };
      const removeProject = async (wsName) => {
        if (!window.confirm(t("deleteConfirm", wsName))) return;
        setError(null);
        try {
          await postJson("/local-project/delete", { name: wsName });
          closeSync(wsName);
          removeProjectMeta(wsName);
        } catch (e) {
          setError(t("error") + (e instanceof Error ? e.message : String(e)));
        }
      };
      if (!open) return null;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lp-root", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lp-backdrop", onClick: () => {
        if (!importing && !resuming && !busy) onCancel();
      }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "lp-modal", onClick: (e) => e.stopPropagation(), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: t("modalTitle") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "lp-hint", children: t("hint") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "lp-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("nameLabel") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              value: name,
              disabled: importing || busy,
              onChange: (e) => setName(e.currentTarget.value)
            }
          )
        ] }),
        error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "lp-error", children: error }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "lp-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              className: "lp-primary",
              disabled: importing || resuming !== null || busy,
              onClick: createProject,
              children: importing ? t("importing") : t("create")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              className: "lp-secondary",
              disabled: importing || resuming !== null || busy,
              onClick: () => onCancel(),
              children: t("cancel")
            }
          )
        ] }),
        projects.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "lp-projects", children: projects.map((p) => {
          const synced = activeSyncs.has(p.name);
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "lp-project", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "lp-project-name", children: [
              "\u{1F4C1} ",
              p.name
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "lp-project-actions", children: [
              !synced ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  type: "button",
                  className: "lp-secondary",
                  disabled: importing || resuming === p.name || busy,
                  onClick: () => resumeProject(p),
                  children: resuming === p.name ? t("resuming") : t("resume")
                }
              ) : null,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  type: "button",
                  className: "lp-danger",
                  disabled: importing || resuming === p.name || busy,
                  onClick: () => removeProject(p.name),
                  children: t("deleteProject")
                }
              )
            ] })
          ] }, p.name);
        }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "lp-empty", children: t("empty") })
      ] }) }) });
    }

    return module.exports;
  },
});
