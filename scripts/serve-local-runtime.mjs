import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");

function argument(name, fallback) {
  const inline = process.argv.find((value) => value.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const host = argument("--host", "127.0.0.1");
const port = Number(argument("--port", "3005"));
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Port Bauman runtime không hợp lệ.");

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".woff2", "font/woff2"],
]);

function responseHeaders(contentType) {
  return {
    "content-type": contentType,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "cross-origin-opener-policy": "same-origin",
  };
}

function safePath(pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); }
  catch { return null; }
  if (decoded.includes("\0")) return null;
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  if (!relative || relative.split(/[\\/]/).some((segment) => segment === ".." || segment === ".git")) return null;
  const target = resolve(root, relative);
  if (target !== root && !target.startsWith(`${root}${sep}`)) return null;
  return target;
}

const server = createServer(async (request, response) => {
  if (request.url === "/_local/health") {
    response.writeHead(200, responseHeaders("application/json; charset=utf-8"));
    response.end(JSON.stringify({ ok: true, application: "bauman-master-ai", runtime: "local-static", port }));
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { ...responseHeaders("text/plain; charset=utf-8"), allow: "GET, HEAD" });
    response.end("Method Not Allowed");
    return;
  }

  const url = new URL(request.url || "/", `http://${host}:${port}`);
  let target = safePath(url.pathname);
  if (!target) {
    response.writeHead(400, responseHeaders("text/plain; charset=utf-8"));
    response.end("Bad Request");
    return;
  }

  try {
    const info = await stat(target);
    if (info.isDirectory()) target = resolve(target, "index.html");
    const file = await readFile(target);
    const contentType = mime.get(extname(target).toLowerCase()) || "application/octet-stream";
    response.writeHead(200, responseHeaders(contentType));
    if (request.method === "HEAD") response.end();
    else response.end(file);
  } catch {
    response.writeHead(404, responseHeaders("text/plain; charset=utf-8"));
    response.end("Not Found");
  }
});

server.listen(port, host, () => {
  console.log(`[bauman-runtime] http://${host}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
