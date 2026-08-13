import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildStaticAuditSummary,
  validateBrowserAudit,
  validateSourceInventory,
  validateUiAuditContract,
  validateUiAuditFindings,
  validateUiAuditManifest
} from "../roadmap_v2/ui-audit.mjs";

const directory = path.resolve("roadmap_v2/ui-audit");
const json = (name) => JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
const fresh = () => ({ contract: json("ui-audit-contract.json"), inventory: json("source-inventory.json"), findings: json("findings.json") });
const browserFixture = () => {
  const observations = [];
  const shared = new Set(["ai", "foundation", "research", "signal", "systems"]);
  for (const target of ["main", "ai", "foundation", "math", "programming", "research", "russian", "signal", "systems"]) {
    for (const viewport of ["desktop", "mobile"]) observations.push({
      target,
      viewport,
      httpStatus: 200,
      title: target,
      pageErrors: [],
      requestFailures: [],
      horizontalOverflow: false,
      keyboardFocusTag: "button",
      headingCount: 1,
      unlabeledControlCount: 0,
      progressMessages: shared.has(target) && viewport === "desktop" ? ["SUBJECT_FEEDBACK"] : [],
      loginPrefill: target === "main" ? { email: true, password: true } : null
    });
  }
  return {
    schema: "BAUMAN_ROADMAP_V2_BROWSER_UI_AUDIT_V1",
    status: "PASS_B123_REAL_CHROMIUM_AUDIT_WITH_FINDINGS",
    auditHead: "a1eece596c198f48cdd84f77c59986f59eb2eb3d",
    browser: { name: "chromium" },
    observations,
    safety: { domMutationsPersisted: 0, storageWritesByAudit: 0, productionFilesChanged: 0 },
    acceptance: { step: 123, result: "PASS_REAL_BROWSER_AUDIT_WITH_FINDINGS" }
  };
};

test("valid L31 static package builds a deep-frozen summary", () => {
  const summary = buildStaticAuditSummary(fresh());
  assert.equal(summary.counts.findings, 16);
  assert.equal(summary.counts.resolved, 0);
  assert.equal(Object.isFrozen(summary.priorities[0]), true);
});

test("production write capability fails closed", () => {
  const { contract } = fresh();
  contract.capabilities.productionJavaScriptWrite = true;
  assert.throws(() => validateUiAuditContract(contract), /zero write\/activation/);
});

test("audit mode cannot become write-enabled", () => {
  const { contract } = fresh();
  contract.auditMode = "READ_WRITE";
  assert.throws(() => validateUiAuditContract(contract), /read-only/);
});

test("subject target omission fails closed", () => {
  const { contract } = fresh();
  contract.targets.subjects.pop();
  assert.throws(() => validateUiAuditContract(contract), /count drift/);
});

test("viewport drift fails closed", () => {
  const { contract } = fresh();
  contract.viewports[1].width = 430;
  assert.throws(() => validateUiAuditContract(contract), /mobile viewport drift/);
});

test("physical module omission fails closed", () => {
  const { inventory } = fresh();
  inventory.modules.pop();
  assert.throws(() => validateSourceInventory(inventory), /module count drift/);
});

test("invalid entrypoint SHA fails closed", () => {
  const { inventory } = fresh();
  inventory.modules[0].entrypoint.gitBlobSha = "forged";
  assert.throws(() => validateSourceInventory(inventory), /Invalid Git blob SHA/);
});

test("shared runtime SHA divergence fails closed", () => {
  const { inventory } = fresh();
  inventory.modules.find((item) => item.id === "research").runtimeGitBlobSha = "0".repeat(40);
  assert.throws(() => validateSourceInventory(inventory), /Shared runtime JavaScript SHA drift/);
});

test("progress mismatch cannot disappear without production evidence", () => {
  const { inventory } = fresh();
  inventory.main.acceptedProgressMessageTypes.push("SUBJECT_FEEDBACK");
  assert.throws(() => validateSourceInventory(inventory), /membership drift|Progress mismatch disappeared/);
});

test("Math planning bridge load cannot be overclaimed", () => {
  const { inventory } = fresh();
  inventory.modules.find((item) => item.id === "math").planningBridge.entrypointLoad = "direct";
  assert.throws(() => validateSourceInventory(inventory), /load status overclaim/);
});

test("premature finding resolution fails closed", () => {
  const { findings, inventory } = fresh();
  findings.findings[0].status = "RESOLVED";
  assert.throws(() => validateUiAuditFindings(findings, inventory), /prematurely resolved/);
});

test("production fix authorization fails closed", () => {
  const { findings, inventory } = fresh();
  findings.productionFixAuthorized = true;
  assert.throws(() => validateUiAuditFindings(findings, inventory), /production fix was authorized/);
});

test("finding omission fails closed", () => {
  const { findings, inventory } = fresh();
  findings.findings.pop();
  assert.throws(() => validateUiAuditFindings(findings, inventory), /finding count drift/);
});

test("duplicate finding ID fails closed", () => {
  const { findings, inventory } = fresh();
  findings.findings[1].id = findings.findings[0].id;
  assert.throws(() => validateUiAuditFindings(findings, inventory), /duplicates|membership drift/);
});

test("finding without source reference fails closed", () => {
  const { findings, inventory } = fresh();
  findings.findings[0].sourceRefs = [];
  assert.throws(() => validateUiAuditFindings(findings, inventory), /source refs missing/);
});

test("unknown affected target fails closed", () => {
  const { findings, inventory } = fresh();
  findings.findings[0].affectedTargets = ["course-99"];
  assert.throws(() => validateUiAuditFindings(findings, inventory), /Unknown finding target/);
});

test("browser-confirmed accessibility finding covers every audited route", () => {
  const { findings, inventory } = fresh();
  const accessibility = findings.findings.find((finding) => finding.id === "L31-F014");
  assert.deepEqual([...accessibility.affectedTargets].sort(), ["main", ...inventory.modules.map((module) => module.id)].sort());
  assert.match(accessibility.evidence, /17 visible unlabeled controls/);
});

test("manifest source tamper fails closed", () => {
  const manifest = json("manifest.json");
  assert.throws(() => validateUiAuditManifest(manifest, (name) => {
    const bytes = fs.readFileSync(path.join(directory, name));
    return name === "findings.json" ? Buffer.concat([bytes, Buffer.from("tamper")]) : bytes;
  }), /fingerprint drift/);
});

test("manifest missing source fails closed", () => {
  const manifest = json("manifest.json");
  assert.throws(() => validateUiAuditManifest(manifest, (name) => {
    if (name === "source-inventory.json") throw new Error("ENOENT");
    return fs.readFileSync(path.join(directory, name));
  }), /file missing/);
});

test("valid B123 browser report covers 18 route/viewport pairs", () => {
  assert.equal(validateBrowserAudit(browserFixture()), true);
});

test("browser route coverage drift fails closed", () => {
  const report = browserFixture();
  report.observations.pop();
  assert.throws(() => validateBrowserAudit(report), /observation count drift/);
});

test("unavailable browser entrypoint fails closed", () => {
  const report = browserFixture();
  report.observations[0].httpStatus = 404;
  assert.throws(() => validateBrowserAudit(report), /entrypoint unavailable/);
});

test("missing shared progress behavior fails closed", () => {
  const report = browserFixture();
  report.observations.find((item) => item.target === "ai" && item.viewport === "desktop").progressMessages = [];
  assert.throws(() => validateBrowserAudit(report), /progress mismatch was not behaviorally observed/);
});

test("missing credential prefill observation fails closed", () => {
  const report = browserFixture();
  report.observations.find((item) => item.target === "main" && item.viewport === "desktop").loginPrefill.password = false;
  assert.throws(() => validateBrowserAudit(report), /credential prefill/);
});

test("browser audit write side effect fails closed", () => {
  const report = browserFixture();
  report.safety.storageWritesByAudit = 1;
  assert.throws(() => validateBrowserAudit(report), /safety boundary drift/);
});
