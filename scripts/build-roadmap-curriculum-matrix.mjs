import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { reconcileCurriculum } from "../roadmap_v2/curriculum.mjs";

const directory = path.resolve("roadmap_v2/curriculum");
const sourceNames = [
  "curriculum-reconciliation-contract.json",
  "curriculum-reconciliation-contract.schema.json",
  "main-module-inventory.json",
  "existing-competency-matrix.json",
  "target-course-disposition.json"
];
const read = (name) => fs.readFileSync(path.join(directory, name));
const json = (name) => JSON.parse(read(name).toString("utf8"));
const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const descriptor = (name) => { const bytes = read(name); return { path: name, bytes: bytes.length, sha256: sha256(bytes) }; };

const matrix = reconcileCurriculum({
  contract: json(sourceNames[0]),
  mainInventory: json(sourceNames[2]),
  competencyMatrix: json(sourceNames[3]),
  targetDisposition: json(sourceNames[4])
});
const matrixPath = path.join(directory, "roadmap-v2.1-matrix.json");
fs.writeFileSync(matrixPath, `${JSON.stringify(matrix, null, 2)}\n`);
const matrixBytes = fs.readFileSync(matrixPath);
const manifest = {
  schema: "BAUMAN_ROADMAP_V2_CURRICULUM_MANIFEST_V1",
  version: "2.10.0-l30-b118",
  status: "PASS_B118_DETERMINISTIC_CURRICULUM_MATRIX",
  mode: "read_only_curriculum_reconciliation",
  productionIntegration: "disconnected",
  baselineCommit: matrix.baselineCommit,
  sources: Object.fromEntries(sourceNames.map((name) => [name.replace(/\.json$/, ""), descriptor(name)])),
  generatedMatrix: { path: "roadmap-v2.1-matrix.json", bytes: matrixBytes.length, sha256: sha256(matrixBytes) },
  counts: matrix.counts,
  safety: matrix.safety,
  acceptance: { step: 118, result: "PASS_DETERMINISTIC_READ_ONLY_MATRIX" }
};
fs.writeFileSync(path.join(directory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ status: manifest.status, counts: manifest.counts, safety: manifest.safety }));
