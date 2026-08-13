import fs from "node:fs";
import path from "node:path";
import { reconcileCurriculum, validateCurriculumManifest } from "../roadmap_v2/curriculum.mjs";

const directory = path.resolve("roadmap_v2/curriculum");
const read = (name) => fs.readFileSync(path.join(directory, name));
const json = (name) => JSON.parse(read(name).toString("utf8"));
const expected = reconcileCurriculum({
  contract: json("curriculum-reconciliation-contract.json"),
  mainInventory: json("main-module-inventory.json"),
  competencyMatrix: json("existing-competency-matrix.json"),
  targetDisposition: json("target-course-disposition.json")
});
const actual = json("roadmap-v2.1-matrix.json");
if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error("Generated curriculum matrix drift");
const manifest = json("manifest.json");
validateCurriculumManifest(manifest, read);
console.log(JSON.stringify({ status: "PASS_B118_VALIDATED", counts: manifest.counts, matrixSha256: manifest.generatedMatrix.sha256 }));
