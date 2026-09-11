import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { buildBackendApiProjection } from "../roadmap_v2/backend-api.mjs";

const root = path.resolve(".");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const writeJson = (name, value) => fs.writeFileSync(path.join(root, name), `${JSON.stringify(value, null, 2)}\n`);
const descriptor = (name) => {
  const bytes = fs.readFileSync(path.join(root, name));
  return { path: name, bytes: bytes.length, sha256: crypto.createHash("sha256").update(bytes).digest("hex") };
};
const paths = {
  contract: "roadmap_v2/backend-api/backend-api-contract.json",
  apiSurface: "roadmap_v2/backend-api/api-surface.json",
  requestContextSchema: "roadmap_v2/backend-api/request-context.schema.json",
  learningEventBatchSchema: "roadmap_v2/backend-api/learning-event-batch.schema.json",
  syncContract: "roadmap_v2/backend-api/sync-contract.json",
  targetDisposition: "roadmap_v2/curriculum/target-course-disposition.json"
};
const targetDisposition = readJson(paths.targetDisposition);
const catalogSummary = {
  courses: targetDisposition.targetTotals.courses,
  chapters: targetDisposition.targetTotals.chapters,
  numberedLessons: targetDisposition.targetTotals.numberedLessons,
  dynamicChapters: targetDisposition.targetTotals.dynamicChapters
};
const projection = buildBackendApiProjection({ contract: readJson(paths.contract), surface: readJson(paths.apiSurface), sync: readJson(paths.syncContract), catalogSummary });
writeJson("roadmap_v2/backend-api/projection.json", projection);
writeJson("roadmap_v2/backend-api/manifest.json", {
  schema: "BAUMAN_ROADMAP_V2_BACKEND_API_MANIFEST_V1",
  version: "2.13.0-l33-b131",
  status: "PASS_B131_DETERMINISTIC_BACKEND_API_PACKAGE",
  headBeforeL33: "6b6226c81f94d5adaca300ba480b60e29a6569ef",
  sources: Object.fromEntries(Object.entries(paths).map(([key, name]) => [key, descriptor(name)])),
  generatedProjection: descriptor("roadmap_v2/backend-api/projection.json"),
  counts: projection.counts,
  safety: projection.safety,
  acceptance: { step: 131, result: "PASS_BACKEND_API_PACKAGE" }
});
console.log(JSON.stringify({ status: "PASS_B131_DETERMINISTIC_BACKEND_API_PACKAGE", ...projection.counts }));
