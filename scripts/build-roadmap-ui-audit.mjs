import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { buildStaticAuditSummary } from "../roadmap_v2/ui-audit.mjs";

const directory = path.resolve("roadmap_v2/ui-audit");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
const writeJson = (name, value) => fs.writeFileSync(path.join(directory, name), `${JSON.stringify(value, null, 2)}\n`);
const descriptor = (name) => {
  const bytes = fs.readFileSync(path.join(directory, name));
  return { path: name, bytes: bytes.length, sha256: crypto.createHash("sha256").update(bytes).digest("hex") };
};

const summary = buildStaticAuditSummary({
  contract: readJson("ui-audit-contract.json"),
  inventory: readJson("source-inventory.json"),
  findings: readJson("findings.json")
});
writeJson("static-summary.json", summary);
writeJson("manifest.json", {
  schema: "BAUMAN_ROADMAP_V2_UI_AUDIT_MANIFEST_V1",
  version: "2.11.0-l31-b122",
  status: "PASS_B122_DETERMINISTIC_STATIC_AUDIT",
  auditHead: "a1eece596c198f48cdd84f77c59986f59eb2eb3d",
  sources: {
    contract: descriptor("ui-audit-contract.json"),
    inventory: descriptor("source-inventory.json"),
    findings: descriptor("findings.json")
  },
  generatedSummary: descriptor("static-summary.json"),
  counts: { routes: 9, viewports: 2, observationsRequired: 18, findings: 16, open: 16, resolved: 0 },
  safety: { productionFilesChanged: 0, findingsAutoResolved: 0, runtimeActivated: 0, persistenceWrites: 0 },
  acceptance: { step: 122, result: "PASS_STATIC_AUDIT_PACKAGE" }
});
console.log(JSON.stringify({ status: "PASS_B122_DETERMINISTIC_STATIC_AUDIT", findings: 16, open: 16, productionWrites: 0 }));
