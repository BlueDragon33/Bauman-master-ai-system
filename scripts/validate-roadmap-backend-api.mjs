import fs from "node:fs";
import path from "node:path";
import { buildBackendApiProjection, validateBackendApiManifest } from "../roadmap_v2/backend-api.mjs";

const root = path.resolve(".");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const targetDisposition = readJson("roadmap_v2/curriculum/target-course-disposition.json");
const expected = buildBackendApiProjection({
  contract: readJson("roadmap_v2/backend-api/backend-api-contract.json"),
  surface: readJson("roadmap_v2/backend-api/api-surface.json"),
  sync: readJson("roadmap_v2/backend-api/sync-contract.json"),
  catalogSummary: { courses: targetDisposition.targetTotals.courses, chapters: targetDisposition.targetTotals.chapters, numberedLessons: targetDisposition.targetTotals.numberedLessons, dynamicChapters: targetDisposition.targetTotals.dynamicChapters }
});
const actual = readJson("roadmap_v2/backend-api/projection.json");
if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error("Backend API projection drift");
validateBackendApiManifest(readJson("roadmap_v2/backend-api/manifest.json"), (name) => fs.readFileSync(path.join(root, name)));
console.log(JSON.stringify({ status: "PASS_B131_BACKEND_API_HARNESS_VALIDATED", ...actual.counts }));
