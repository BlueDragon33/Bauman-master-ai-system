import fs from "node:fs";
import path from "node:path";
import { buildStaticAuditSummary, validateUiAuditManifest } from "../roadmap_v2/ui-audit.mjs";

const directory = path.resolve("roadmap_v2/ui-audit");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
const actual = readJson("static-summary.json");
const expected = buildStaticAuditSummary({
  contract: readJson("ui-audit-contract.json"),
  inventory: readJson("source-inventory.json"),
  findings: readJson("findings.json")
});
if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error("Static UI audit summary drift");
validateUiAuditManifest(readJson("manifest.json"), (name) => fs.readFileSync(path.join(directory, name)));
console.log(JSON.stringify({ status: "PASS_B122_STATIC_UI_AUDIT_VALIDATED", findings: actual.counts.findings, open: actual.counts.open, resolved: actual.counts.resolved }));
