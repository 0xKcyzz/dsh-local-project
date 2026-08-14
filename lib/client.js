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
    var store_default = ".lp-root {\n  position: relative;\n}\n\n.lp-trigger {\n  border: 1px solid var(--dsw-alias-border-l2, #333);\n  background: var(--dsw-alias-bg-layer-3, #222);\n  color: var(--dsw-alias-label-primary, #eee);\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  cursor: pointer;\n  border-radius: 6px;\n  padding: 4px 10px;\n  white-space: nowrap;\n}\n.lp-trigger:hover {\n  border-color: var(--dsw-alias-state-business-primary, #4b6fff);\n  color: var(--dsw-alias-state-business-primary, #4b6fff);\n}\n\n.lp-backdrop {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.4);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 120;\n}\n.lp-modal {\n  background: var(--dsw-alias-bg-layer-1, #1c1c1c);\n  border: 1px solid var(--dsw-alias-border-l2, #333);\n  border-radius: 10px;\n  padding: 16px;\n  width: min(440px, calc(100vw - 32px));\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  color: var(--dsw-alias-label-primary, #eee);\n}\n.lp-modal h4 {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n}\n.lp-hint {\n  margin: 0;\n  color: var(--dsw-alias-label-tertiary, #999);\n  font-size: 12px;\n  line-height: 18px;\n}\n.lp-field {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  font-size: 12px;\n  color: var(--dsw-alias-label-secondary, #bbb);\n}\n.lp-field input {\n  border: 1px solid var(--dsw-alias-border-l2, #333);\n  background: var(--dsw-alias-bg-layer-1, #1c1c1c);\n  height: 34px;\n  color: var(--dsw-alias-label-primary, #eee);\n  font: inherit;\n  border-radius: 8px;\n  padding: 0 12px;\n  font-size: 13px;\n}\n.lp-error {\n  margin: 0;\n  color: var(--dsw-alias-state-error-primary, #e5534b);\n  font-size: 12px;\n  line-height: 18px;\n  word-break: break-all;\n}\n.lp-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n}\n.lp-actions button {\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  border-radius: 6px;\n  padding: 5px 12px;\n  cursor: pointer;\n}\n.lp-primary {\n  border: 1px solid var(--dsw-alias-state-business-primary, #4b6fff);\n  background: var(--dsw-alias-state-business-primary, #4b6fff);\n  color: #fff;\n}\n.lp-secondary {\n  border: 1px solid var(--dsw-alias-border-l2, #333);\n  background: transparent;\n  color: var(--dsw-alias-label-primary, #eee);\n}\n.lp-projects {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.lp-project {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  border: 1px solid var(--dsw-alias-border-l2, #333);\n  border-radius: 8px;\n  padding: 6px 10px;\n}\n.lp-project-name {\n  font-size: 12px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.lp-empty {\n  margin: 0;\n  color: var(--dsw-alias-label-tertiary, #999);\n  font-size: 12px;\n}\n";

    // src/client/index.tsx
    var import_jsx_runtime = require("react/jsx-runtime");
    var NS = "sidebar.localProject";
    var zh = {
      label: "\u672C\u5730\u9879\u76EE",
      modalTitle: "\u8FDE\u63A5\u672C\u5730\u6587\u4EF6\u5939",
      hint: "\u9009\u62E9\u672C\u5730\u7535\u8111\u4E0A\u7684\u6587\u4EF6\u5939\uFF0C\u670D\u52A1\u5668\u4E0A\u7684 DSH \u5C31\u80FD\u901A\u8FC7\u6D4F\u89C8\u5668\u8BFB\u5199\u5B83\uFF08\u6587\u4EF6\u64CD\u4F5C\u7531\u5F53\u524D\u9875\u9762\u4E2D\u7EE7\uFF09\u3002",
      nameLabel: "\u9879\u76EE\u540D\u79F0",
      connect: "\u9009\u62E9\u6587\u4EF6\u5939\u5E76\u8FDE\u63A5",
      cancel: "\u53D6\u6D88",
      connected: "\u5DF2\u8FDE\u63A5",
      disconnect: "\u65AD\u5F00",
      success: (n) => `\u672C\u5730\u9879\u76EE\u300C${n}\u300D\u5DF2\u8FDE\u63A5\u3002\u5728\u5BF9\u5E94\u5DE5\u4F5C\u533A\u4E2D\u5BF9\u8BDD\u5373\u53EF\u64CD\u4F5C\u672C\u5730\u6587\u4EF6\u3002`,
      error: "\u5931\u8D25\uFF1A",
      noApi: "\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301\u6587\u4EF6\u7CFB\u7EDF\u8BBF\u95EE API\uFF08\u9700\u8981 Chrome/Edge \u6D4F\u89C8\u5668\uFF09\u3002",
      close: "\u5173\u95ED",
      empty: "\u5C1A\u672A\u8FDE\u63A5\u4EFB\u4F55\u672C\u5730\u9879\u76EE"
    };
    var en = {
      label: "Local project",
      modalTitle: "Connect local folder",
      hint: "Pick a folder on this computer; the server-side DSH can then read/write it through this browser page.",
      nameLabel: "Project name",
      connect: "Choose folder & connect",
      cancel: "Cancel",
      connected: "Connected",
      disconnect: "Disconnect",
      success: (n) => `Local project "${n}" connected. Chat in its workspace to operate on local files.`,
      error: "Failed: ",
      noApi: "File System Access API is unavailable (needs Chrome/Edge).",
      close: "Close",
      empty: "No local projects connected"
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
    async function resolveDir(root, parts, create) {
      let dir = root;
      for (const p of parts) {
        dir = await dir.getDirectoryHandle(p, { create });
      }
      return dir;
    }
    async function executeOp(op, handles) {
      const handle = handles[op.projectId];
      if (!handle) return { ok: false, error: "\u672C\u5730\u9879\u76EE\u672A\u8FDE\u63A5\uFF08\u9875\u9762\u5DF2\u5237\u65B0\uFF1F\u8BF7\u91CD\u65B0\u9009\u62E9\u6587\u4EF6\u5939\uFF09" };
      const parts = (op.path || "").split("/").filter(Boolean);
      try {
        if (op.kind === "list") {
          const dir = parts.length ? await resolveDir(handle, parts, false) : handle;
          const entries = [];
          for await (const [name, entry] of dir.entries()) {
            entries.push({ name, type: entry.kind === "file" ? "file" : "dir" });
          }
          return { ok: true, result: { entries } };
        }
        if (op.kind === "read") {
          const fileName = parts.pop() ?? "";
          const dir = parts.length ? await resolveDir(handle, parts, false) : handle;
          const fileHandle = await dir.getFileHandle(fileName);
          const file = await fileHandle.getFile();
          return { ok: true, result: { content: await file.text() } };
        }
        if (op.kind === "write") {
          const fileName = parts.pop() ?? "";
          const dir = parts.length ? await resolveDir(handle, parts, true) : handle;
          const fileHandle = await dir.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(op.content ?? "");
          await writable.close();
          return { ok: true, result: {} };
        }
        if (op.kind === "delete") {
          const fileName = parts.pop() ?? "";
          const dir = parts.length ? await resolveDir(handle, parts, false) : handle;
          await dir.removeEntry(fileName, { recursive: true });
          return { ok: true, result: {} };
        }
        return { ok: false, error: `\u672A\u77E5\u64CD\u4F5C ${op.kind}` };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    }
    function LocalProjectAction(props) {
      const { wide, t } = props;
      const [open, setOpen] = (0, import_react.useState)(false);
      const [name, setName] = (0, import_react.useState)("");
      const [error, setError] = (0, import_react.useState)(null);
      const [projects, setProjects] = (0, import_react.useState)({});
      const handlesRef = (0, import_react.useRef)({});
      (0, import_react.useEffect)(() => {
        const tick = async () => {
          if (Object.keys(handlesRef.current).length === 0) return;
          try {
            const res = await fetch("/local-project/ops");
            const data = await res.json();
            if (data && data.pending) {
              const outcome = await executeOp(data.op, handlesRef.current);
              await fetch("/local-project/result", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ opId: data.op.opId, ...outcome })
              });
            }
          } catch {
          }
        };
        const timer = setInterval(tick, 400);
        return () => clearInterval(timer);
      }, []);
      const connect = async () => {
        const wsName = name.trim();
        if (!wsName) {
          setError(t("nameLabel") + " \u4E0D\u80FD\u4E3A\u7A7A");
          return;
        }
        setError(null);
        let handle = null;
        const picker = window.showDirectoryPicker;
        if (typeof picker === "function") {
          try {
            handle = await picker.call(window, { mode: "readwrite" });
          } catch (e) {
            setError(t("error") + (e instanceof Error ? e.message : String(e)));
            return;
          }
        }
        if (!handle) {
          setError(t("noApi"));
          return;
        }
        try {
          const res = await fetch("/local-project/register", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: wsName })
          });
          const data = await res.json();
          if (!data || data.ok !== true) {
            setError(t("error") + (data?.error || "register failed"));
            return;
          }
          handlesRef.current[data.projectId] = handle;
          setProjects((prev) => ({ ...prev, [data.projectId]: { projectId: data.projectId, name: wsName } }));
          setOpen(false);
          setName("");
          window.alert(t("success", wsName));
        } catch (e) {
          setError(t("error") + (e instanceof Error ? e.message : String(e)));
        }
      };
      const disconnect = (projectId) => {
        delete handlesRef.current[projectId];
        setProjects((prev) => {
          const next = { ...prev };
          delete next[projectId];
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
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "lp-primary", onClick: connect, children: t("connect") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "lp-secondary", onClick: () => setOpen(false), children: t("cancel") })
          ] }),
          projectList.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "lp-projects", children: projectList.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "lp-project", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "lp-project-name", children: [
              "\u{1F4C1} ",
              p.name
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "lp-secondary", onClick: () => disconnect(p.projectId), children: t("disconnect") })
          ] }, p.projectId)) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "lp-empty", children: t("empty") })
        ] }) }) : null
      ] });
    }

    return module.exports;
  },
});
