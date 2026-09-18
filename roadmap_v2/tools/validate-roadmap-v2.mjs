import fs from "node:fs";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const validators = [
  { step: 73, script: "roadmap_v2/tools/validate-baseline-inventory.mjs" },
  { step: 74, script: "roadmap_v2/tools/validate-registry.mjs" },
  { step: 75, script: "roadmap_v2/tools/validate-prerequisite-graph.mjs" },
  { step: 76, script: "roadmap_v2/tools/validate-migration-contract.mjs" }
];
const results = [];
let failed = false;

for (const validator of validators) {
  const run = spawnSync(process.execPath, [validator.script], { encoding: "utf8" });
  let parsed = null;
  try { parsed = JSON.parse(run.stdout || "null"); } catch { /* captured below */ }
  const pass = run.status === 0 && parsed && String(parsed.result).startsWith("PASS");
  results.push({
    step: validator.step,
    script: validator.script,
    pass,
    result: parsed,
    stderr: run.stderr.trim() || null
  });
  if (!pass) failed = true;
}

const files = {
  spec: "roadmap_v2/spec/Bauman_Roadmap_V2_Syllabus_Luot18.md",
  baseline: "roadmap_v2/baseline/math-main-e383912-inventory.json",
  legacyLessons: "roadmap_v2/baseline/math-legacy-lessons-inventory.json",
  theoryFramework: "roadmap_v2/baseline/math-theory-framework-inventory.json",
  physical: "roadmap_v2/baseline/math-physical-source-inventory.json",
  registry: "roadmap_v2/registry/roadmap-v2.registry.json",
  graph: "roadmap_v2/graph/prerequisite-graph.json",
  mapping: "roadmap_v2/migration/legacy-to-roadmap-v2.mapping.json",
  migrationContract: "roadmap_v2/migration/migration-contract.json",
  acceptance: "roadmap_v2/reports/LUOT_19_ACCEPTANCE.md"
};
const fileFingerprints = Object.fromEntries(Object.entries(files).map(([id, file]) => [id, {
  path: file,
  sha256: sha256(file)
}]));
const acceptanceText = fs.readFileSync(files.acceptance, "utf8");
const acceptancePass = acceptanceText.includes("PASS (CONTRACT ONLY; RUNTIME ACTIVATION BLOCKED)") &&
  acceptanceText.includes("Priority Engine eligible records: 0") &&
  acceptanceText.includes("Legacy/runtime source mutations: 0");
if (!acceptancePass) failed = true;

const report = {
  schema: "BAUMAN_ROADMAP_V2_VALIDATION_REPORT_L19_V2",
  generatedAt: "2026-08-10T21:00:00+07:00",
  scope: "Lượt 19 / Bước 73-76",
  files: fileFingerprints,
  steps: results,
  acceptanceDocument: {
    path: files.acceptance,
    pass: acceptancePass
  },
  safetyBoundary: {
    runtimeModified: false,
    sourceMutations: 0,
    priorityEngineActivated: false
  },
  summary: {
    totalSteps: results.length,
    passedSteps: results.filter((item) => item.pass).length,
    failedSteps: results.filter((item) => !item.pass).length,
    result: failed ? "FAIL" : "PASS_CONTRACT_ONLY"
  }
};
fs.writeFileSync("roadmap_v2/reports/validation-l19.json", JSON.stringify(report, null, 2) + "\n", "utf8");
console.log(JSON.stringify(report.summary, null, 2));
if (failed) {
  console.error(JSON.stringify(results.filter((item) => !item.pass), null, 2));
  process.exit(1);
}
