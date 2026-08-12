import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const moduleSpecifier = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? pathToFileURL(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "playwright", "index.mjs")).href
  : "playwright";
const { chromium } = await import(moduleSpecifier);
const root = path.resolve(".");
const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"]
]);

const server = http.createServer((request, response) => {
  try {
    const url = new URL(request.url || "/", "http://127.0.0.1");
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    const file = path.resolve(root, relative || "subjects/math/index.html");
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "content-type": mime.get(path.extname(file)) || "application/octet-stream",
      "cache-control": "no-store"
    });
    fs.createReadStream(file).pipe(response);
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end(error.message);
  }
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const address = server.address();
const origin = `http://127.0.0.1:${address.port}`;
const entrypoint = `${origin}/subjects/math/index.html`;
const browser = await chromium.launch({ headless: true });

async function runCase(name, flags) {
  const context = await browser.newContext();
  if (flags !== undefined) await context.addInitScript((value) => { globalThis.__BAUMAN_ROADMAP_V2_FLAGS__ = value; }, flags);
  const page = await context.newPage();
  const roadmapRequests = [];
  const pageErrors = [];
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.startsWith("/roadmap_v2/")) roadmapRequests.push(pathname);
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(entrypoint, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => globalThis.__BAUMAN_ROADMAP_V2_READY__ instanceof Promise, null, { timeout: 15000 });
  const status = await page.evaluate(() => globalThis.__BAUMAN_ROADMAP_V2_READY__);
  const shell = await page.evaluate(() => ({
    title: document.title,
    appPresent: Boolean(document.querySelector("#app")),
    subjectTitle: document.querySelector("#subjectTitle")?.textContent || "",
    roadmapDomNodes: document.querySelectorAll("[data-roadmap-v2]").length
  }));
  await context.close();
  return { name, status, shell, roadmapRequests, pageErrors };
}

try {
  const disabled = await runCase("default_off", undefined);
  assert(disabled.status.status === "disabled_default_off", "Default-OFF browser status drift");
  assert(disabled.roadmapRequests.length === 0, `Default-OFF browser made Roadmap requests: ${disabled.roadmapRequests.join(", ")}`);
  assert(disabled.shell.appPresent && disabled.shell.title === "Toán Bauman" && disabled.shell.roadmapDomNodes === 0, "Default-OFF legacy shell drift");

  const enabled = await runCase("core_projection_on", {
    roadmapCoreProjection: true,
    diagnosticRuntime: false,
    evidencePersistence: false,
    priorityScheduler: false,
    readinessDashboard: false
  });
  assert(enabled.status.status === "ready_read_only_core_projection", `Enabled browser projection failed: ${enabled.status.reasonCode}`);
  assert(enabled.status.projection?.counts?.courses === 10 && enabled.status.projection?.counts?.chapters === 85 && enabled.status.projection?.counts?.numberedLessons === 304, "Enabled browser Registry counts drift");
  assert(enabled.status.projection?.counts?.graphNodes === 450 && enabled.status.projection?.counts?.prerequisiteEdges === 185, "Enabled browser Graph counts drift");
  assert(enabled.status.projection?.persisted === false && enabled.status.projection?.domMutated === false, "Enabled browser projection escaped read-only boundary");
  assert(enabled.roadmapRequests.length === 7, `Enabled browser request count drift: ${enabled.roadmapRequests.length}`);
  assert(enabled.shell.appPresent && enabled.shell.roadmapDomNodes === 0, "Enabled bridge changed the legacy DOM");

  const invalid = await runCase("unsupported_flag", {
    roadmapCoreProjection: true,
    diagnosticRuntime: true,
    evidencePersistence: false,
    priorityScheduler: false,
    readinessDashboard: false
  });
  assert(invalid.status.status === "blocked_fail_closed", "Unsupported browser flag did not fail closed");
  assert(invalid.roadmapRequests.length === 0, "Unsupported browser flag made Roadmap requests");
  assert(Object.values(invalid.status.effectiveFeatureFlags).every((value) => value === false), "Unsupported browser flag remained enabled");

  const rollback = await runCase("kill_switch_all_off", {
    roadmapCoreProjection: false,
    diagnosticRuntime: false,
    evidencePersistence: false,
    priorityScheduler: false,
    readinessDashboard: false
  });
  assert(rollback.status.status === "disabled_default_off", "Kill-switch did not restore default-OFF browser path");
  assert(rollback.roadmapRequests.length === 0, "Kill-switch browser path made Roadmap requests");
  assert(JSON.stringify(rollback.shell) === JSON.stringify(disabled.shell), "Kill-switch legacy shell differs from default-OFF shell");

  console.log(JSON.stringify({
    status: "PASS_BROWSER_SMOKE_B115",
    browser: "chromium",
    cases: [disabled.name, enabled.name, invalid.name, rollback.name],
    defaultRoadmapRequests: disabled.roadmapRequests.length,
    enabledRoadmapRequests: enabled.roadmapRequests.length,
    rollbackRoadmapRequests: rollback.roadmapRequests.length,
    registry: enabled.status.projection.counts,
    legacyDomUnchanged: true,
    pageErrorsObserved: {
      defaultOff: disabled.pageErrors.length,
      enabled: enabled.pageErrors.length,
      invalid: invalid.pageErrors.length,
      rollback: rollback.pageErrors.length
    }
  }));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
