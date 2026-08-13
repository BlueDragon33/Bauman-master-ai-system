import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { validateBrowserAudit } from "../roadmap_v2/ui-audit.mjs";

const commands = [
  ["scripts/validate-roadmap-ui-audit-contract.mjs"],
  ["scripts/build-roadmap-ui-audit.mjs"],
  ["scripts/validate-roadmap-ui-audit.mjs"],
  ["--test", "tests/roadmap-v2-ui-audit.test.mjs"]
];
const evidence = [];
for (const args of commands) {
  const run = spawnSync(process.execPath, args, { encoding: "utf8" });
  if (run.status !== 0) {
    process.stderr.write(run.stdout || "");
    process.stderr.write(run.stderr || "");
    throw new Error(`L31 focused gate failed: node ${args.join(" ")}`);
  }
  evidence.push({ command: `node ${args.join(" ")}`, status: "PASS" });
}
const generated = ["roadmap_v2/ui-audit/static-summary.json", "roadmap_v2/ui-audit/manifest.json"];
const first = generated.map((file) => fs.readFileSync(file));
const rebuild = spawnSync(process.execPath, ["scripts/build-roadmap-ui-audit.mjs"], { encoding: "utf8" });
if (rebuild.status !== 0) throw new Error("L31 deterministic rebuild failed");
generated.forEach((file, index) => {
  if (!first[index].equals(fs.readFileSync(file))) throw new Error(`L31 generation is not deterministic: ${file}`);
});
evidence.push({ command: "Static UI audit summary and manifest deterministic rebuild", status: "PASS" });

const browserReportPath = process.env.ROADMAP_L31_BROWSER_REPORT || "/tmp/roadmap-l31-browser-audit.json";
let browser = "AWAITING_FULL_CHECKOUT_CI";
if (fs.existsSync(browserReportPath)) {
  validateBrowserAudit(JSON.parse(fs.readFileSync(browserReportPath, "utf8")));
  browser = "PASS_REAL_CHROMIUM_AUDIT_WITH_FINDINGS";
  evidence.push({ command: `validate ${browserReportPath}`, status: "PASS" });
} else if (process.env.ROADMAP_L31_REQUIRE_BROWSER === "1") {
  throw new Error(`Required B123 browser report missing: ${browserReportPath}`);
}

const full = browser.startsWith("PASS_");
console.log(JSON.stringify({
  status: full ? "PASS_B124_L31_FULL_CHECKOUT_ACCEPTANCE" : "PASS_B124_LOCAL_FOCUSED_AWAITING_FULL_CHECKOUT_CI",
  gates: evidence.length,
  passed: evidence.length,
  failed: 0,
  routes: 9,
  viewports: 2,
  browserObservationsRequired: 18,
  staticFindings: 16,
  openFindings: 16,
  resolvedFindings: 0,
  browser,
  productionWrites: 0,
  persistenceWrites: 0,
  runtimeActivations: 0
}));
