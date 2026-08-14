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
    var store_default = ".lp-root {\n  position: relative;\n}\n\n.lp-trigger {\n  border: 1px solid var(--dsw-alias-border-l2, #333);\n  background: var(--dsw-alias-bg-layer-3, #222);\n  color: var(--dsw-alias-label-primary, #eee);\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  cursor: pointer;\n  border-radius: 6px;\n  padding: 4px 10px;\n  white-space: nowrap;\n}\n.lp-trigger:hover {\n  border-color: var(--dsw-alias-state-business-primary, #4b6fff);\n  color: var(--dsw-alias-state-business-primary, #4b6fff);\n}\n\n.lp-backdrop {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.4);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 120;\n}\n.lp-modal {\n  background: var(--dsw-alias-bg-layer-1, #1c1c1c);\n  border: 1px solid var(--dsw-alias-border-l2, #333);\n  border-radius: 10px;\n  padding: 16px;\n  width: min(440px, calc(100vw - 32px));\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  color: var(--dsw-alias-label-primary, #eee);\n}\n.lp-modal h4 {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n}\n.lp-hint {\n  margin: 0;\n  color: var(--dsw-alias-label-tertiary, #999);\n  font-size: 12px;\n  line-height: 18px;\n}\n.lp-field {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  font-size: 12px;\n  color: var(--dsw-alias-label-secondary, #bbb);\n}\n.lp-field input {\n  border: 1px solid var(--dsw-alias-border-l2, #333);\n  background: var(--dsw-alias-bg-layer-1, #1c1c1c);\n  height: 34px;\n  color: var(--dsw-alias-label-primary, #eee);\n  font: inherit;\n  border-radius: 8px;\n  padding: 0 12px;\n  font-size: 13px;\n}\n.lp-error {\n  margin: 0;\n  color: var(--dsw-alias-state-error-primary, #e5534b);\n  font-size: 12px;\n  line-height: 18px;\n  word-break: break-all;\n}\n.lp-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n}\n.lp-actions button {\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  border-radius: 6px;\n  padding: 5px 12px;\n  cursor: pointer;\n}\n.lp-primary {\n  border: 1px solid var(--dsw-alias-state-business-primary, #4b6fff);\n  background: var(--dsw-alias-state-business-primary, #4b6fff);\n  color: #fff;\n}\n.lp-secondary {\n  border: 1px solid var(--dsw-alias-border-l2, #333);\n  background: transparent;\n  color: var(--dsw-alias-label-primary, #eee);\n}\n.lp-danger {\n  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary, #e5534b) 50%, transparent);\n  background: transparent;\n  color: var(--dsw-alias-state-error-primary, #e5534b);\n}\n.lp-projects {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.lp-project {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  border: 1px solid var(--dsw-alias-border-l2, #333);\n  border-radius: 8px;\n  padding: 6px 10px;\n}\n.lp-project-name {\n  font-size: 12px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.lp-empty {\n  margin: 0;\n  color: var(--dsw-alias-label-tertiary, #999);\n  font-size: 12px;\n}\n";

    // src/client/index.tsx
    var import_jsx_runtime = require("react/jsx-runtime");
    var NS = "sidebar.localProject";
    var zh = {
      label: "\u672C\u5730\u9879\u76EE",
      modalTitle: "\u5BFC\u5165\u672C\u5730\u9879\u76EE",
      hint: "\u9009\u62E9\u672C\u5730\u6587\u4EF6\u5939\uFF0C\u4E0A\u4F20\u5230\u670D\u52A1\u5668\u521B\u5EFA\u4E3A\u5DE5\u4F5C\u533A\uFF1B\u7F51\u9875\u91CC\uFF08DSH\uFF09\u7684\u4FEE\u6539\u4F1A\u540C\u6B65\u56DE\u672C\u5730\uFF0C\u672C\u5730\u4FEE\u6539\u4E5F\u4F1A\u540C\u6B65\u5230\u670D\u52A1\u5668\u3002\u5220\u9664\u9879\u76EE\u53EA\u5220\u670D\u52A1\u5668\u526F\u672C\uFF0C\u4E0D\u78B0\u672C\u5730\u6587\u4EF6\u3002",
      nameLabel: "\u9879\u76EE\u540D\u79F0",
      create: "\u9009\u62E9\u6587\u4EF6\u5939\u5E76\u5BFC\u5165",
      cancel: "\u53D6\u6D88",
      success: (n) => `\u672C\u5730\u9879\u76EE\u300C${n}\u300D\u5DF2\u521B\u5EFA\u4E3A\u670D\u52A1\u5668\u5DE5\u4F5C\u533A\uFF0C\u6B63\u5728\u540C\u6B65\u2026`,
      error: "\u5931\u8D25\uFF1A",
      noApi: "\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301\u6587\u4EF6\u7CFB\u7EDF\u8BBF\u95EE API\uFF08\u9700\u8981 Chrome/Edge \u6D4F\u89C8\u5668\uFF09\u3002",
      deleteProject: "\u5220\u9664\u670D\u52A1\u5668\u9879\u76EE",
      deleteConfirm: (n) => `\u786E\u5B9A\u5220\u9664\u670D\u52A1\u5668\u4E0A\u7684\u672C\u5730\u9879\u76EE\u300C${n}\u300D\uFF1F\u670D\u52A1\u5668\u526F\u672C\u4F1A\u88AB\u5220\u9664\uFF0C\u672C\u5730\u6587\u4EF6\u4E0D\u53D7\u5F71\u54CD\u3002`,
      connected: "\u5DF2\u8FDE\u63A5",
      empty: "\u5C1A\u672A\u5BFC\u5165\u4EFB\u4F55\u672C\u5730\u9879\u76EE",
      syncing: "\u540C\u6B65\u4E2D"
    };
    var en = {
      label: "Local project",
      modalTitle: "Import local project",
      hint: "Pick a local folder; it is uploaded to the server as a workspace. Changes made in DSH sync back to your local folder, and local edits sync up. Deleting a project removes only the server copy.",
      nameLabel: "Project name",
      create: "Choose folder & import",
      cancel: "Cancel",
      success: (n) => `Local project "${n}" created as a server workspace; syncing\u2026`,
      error: "Failed: ",
      noApi: "File System Access API is unavailable (needs Chrome/Edge).",
      deleteProject: "Delete server project",
      deleteConfirm: (n) => `Delete the server copy of "${n}"? Local files are not affected.`,
      connected: "Connected",
      empty: "No local projects imported",
      syncing: "Syncing"
    };
    var inject = ["slots", "locale"];
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), "local-project: dictionaries");
      const t = ctx.locale.bind(NS);
      ctx.effect(() => injectCss(), "local-project: css");
      ctx.slots.inject(
        "sidebar.footer.action",
        () => ctx.slots.register(
          {
            name: "sidebar.footer.action",
            id: "local-project",
            order: 20,
            label: () => t("label"),
            locale: NS,
            inject: () => ({ t })
          },
          LocalProjectAction
        )
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
    function sig(v) {
      return `${v.size}:${Math.floor(v.mtimeMs)}`;
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
            const fh = entry.getFile ? await entry.getFile() : await entry.getFile();
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
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      const chunk = 32768;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
      }
      return btoa(binary);
    }
    async function getLocalSig(handle, path) {
      const { dir, name } = await resolveFile(handle, path, false);
      const fileHandle = await dir.getFileHandle(name);
      const file = await fileHandle.getFile();
      return `${file.size}:${Math.floor(file.lastModified)}`;
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
      return res.json();
    }
    async function postJson(url, data) {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data)
      });
      return res.json();
    }
    async function syncProject(name, state) {
      const local = {};
      await walkLocal(state.handle, "", local);
      const man = await getJson(`/local-project/manifest?name=${encodeURIComponent(name)}`);
      const server = man && man.files || {};
      const paths = /* @__PURE__ */ new Set([...Object.keys(local), ...Object.keys(server)]);
      for (const p of paths) {
        const l = local[p] ? sig(local[p]) : void 0;
        const s = server[p] ? sig(server[p]) : void 0;
        if (l === s) {
          state.syncedLocal[p] = l ?? "";
          state.syncedServer[p] = s ?? "";
          continue;
        }
        const lc = l !== void 0 && l !== state.syncedLocal[p];
        const sc = s !== void 0 && s !== state.syncedServer[p];
        if (lc && !sc) {
          const content = await readLocalFile(state.handle, p);
          const up = await postJson("/local-project/upload", { name, path: p, content });
          state.syncedLocal[p] = l ?? "";
          state.syncedServer[p] = up && up.sig ? up.sig : s ?? "";
        } else if (sc && !lc) {
          const dl = await getJson(
            `/local-project/download?name=${encodeURIComponent(name)}&path=${encodeURIComponent(p)}`
          );
          if (dl && dl.ok) {
            await writeLocalFile(state.handle, p, dl.content);
            state.syncedLocal[p] = await getLocalSig(state.handle, p);
            state.syncedServer[p] = s ?? "";
          }
        } else if (lc && sc) {
          const lm = l ? Number(l.split(":")[1]) : 0;
          const sm = s ? Number(s.split(":")[1]) : 0;
          if (lm >= sm) {
            const content = await readLocalFile(state.handle, p);
            const up = await postJson("/local-project/upload", { name, path: p, content });
            state.syncedLocal[p] = l ?? "";
            state.syncedServer[p] = up && up.sig ? up.sig : s ?? "";
          } else {
            const dl = await getJson(
              `/local-project/download?name=${encodeURIComponent(name)}&path=${encodeURIComponent(p)}`
            );
            if (dl && dl.ok) {
              await writeLocalFile(state.handle, p, dl.content);
              state.syncedLocal[p] = await getLocalSig(state.handle, p);
              state.syncedServer[p] = s ?? "";
            }
          }
        }
      }
      const alive = /* @__PURE__ */ new Set([...Object.keys(local), ...Object.keys(server)]);
      for (const p of Object.keys(state.syncedLocal)) if (!alive.has(p)) delete state.syncedLocal[p];
      for (const p of Object.keys(state.syncedServer)) if (!alive.has(p)) delete state.syncedServer[p];
    }
    function LocalProjectAction(props) {
      const { wide, t } = props;
      const [open, setOpen] = (0, import_react.useState)(false);
      const [name, setName] = (0, import_react.useState)("");
      const [error, setError] = (0, import_react.useState)(null);
      const [projects, setProjects] = (0, import_react.useState)({});
      const projectsRef = (0, import_react.useRef)({});
      (0, import_react.useEffect)(() => {
        const timer = setInterval(() => {
          const entries = Object.entries(projectsRef.current);
          for (const [pName, state] of entries) {
            syncProject(pName, state).catch(() => {
            });
          }
        }, 5e3);
        return () => clearInterval(timer);
      }, []);
      const createProject = async () => {
        const wsName = name.trim();
        if (!wsName) {
          setError(t("nameLabel") + " \u4E0D\u80FD\u4E3A\u7A7A");
          return;
        }
        setError(null);
        const picker = window.showDirectoryPicker;
        if (typeof picker !== "function") {
          setError(t("noApi"));
          return;
        }
        let handle;
        try {
          handle = await picker.call(window, { mode: "readwrite" });
        } catch (e) {
          setError(t("error") + (e instanceof Error ? e.message : String(e)));
          return;
        }
        try {
          const res = await postJson("/local-project/create", { name: wsName });
          if (!res || res.ok !== true) throw new Error(res?.error || "create failed");
          projectsRef.current[wsName] = { handle, syncedLocal: {}, syncedServer: {} };
          setProjects((prev) => ({ ...prev, [wsName]: { name: wsName } }));
          setOpen(false);
          setName("");
          window.alert(t("success", wsName));
          syncProject(wsName, projectsRef.current[wsName]).catch(() => {
          });
        } catch (e) {
          setError(t("error") + (e instanceof Error ? e.message : String(e)));
        }
      };
      const removeProject = async (wsName) => {
        if (!window.confirm(t("deleteConfirm", wsName))) return;
        try {
          await postJson("/local-project/delete", { name: wsName });
        } catch {
        }
        delete projectsRef.current[wsName];
        setProjects((prev) => {
          const next = { ...prev };
          delete next[wsName];
          return next;
        });
      };
      const projectList = Object.values(projects);
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "lp-root", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "lp-trigger", title: t("label"), onClick: () => setOpen(true), children: wide ? t("label") : "\u{1F4C1}" }),
        open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lp-backdrop", onClick: () => setOpen(false), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "lp-modal", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: t("modalTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "lp-hint", children: t("hint") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "lp-field", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("nameLabel") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { value: name, onChange: (e) => setName(e.currentTarget.value) })
          ] }),
          error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "lp-error", children: error }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "lp-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "lp-primary", onClick: createProject, children: t("create") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "lp-secondary", onClick: () => setOpen(false), children: t("cancel") })
          ] }),
          projectList.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "lp-projects", children: projectList.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "lp-project", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "lp-project-name", children: [
              "\u{1F4C1} ",
              p.name
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "lp-danger", onClick: () => removeProject(p.name), children: t("deleteProject") })
          ] }, p.name)) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "lp-empty", children: t("empty") })
        ] }) }) : null
      ] });
    }

    return module.exports;
  },
});
