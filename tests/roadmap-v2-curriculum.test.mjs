import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  reconcileCurriculum,
  validateCurriculumContract,
  validateCurriculumManifest,
  validateExistingCompetencyMatrix,
  validateMainModuleInventory,
  validateTargetCourseDisposition
} from "../roadmap_v2/curriculum.mjs";

const directory = path.resolve("roadmap_v2/curriculum");
const json = (name) => JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
const fresh = () => ({
  contract: json("curriculum-reconciliation-contract.json"),
  mainInventory: json("main-module-inventory.json"),
  competencyMatrix: json("existing-competency-matrix.json"),
  targetDisposition: json("target-course-disposition.json")
});

test("valid curriculum package reconciles and is deep-frozen", () => {
  const matrix = reconcileCurriculum(fresh());
  assert.equal(matrix.counts.targetCourses, 10);
  assert.equal(matrix.counts.mainModules, 8);
  assert.equal(Object.isFrozen(matrix), true);
  assert.equal(Object.isFrozen(matrix.courses[0]), true);
});

test("write capability fails closed", () => {
  const { contract } = fresh();
  contract.capabilities.persistence = true;
  assert.throws(() => validateCurriculumContract(contract), /zero write\/activation/);
});

test("persistence deferral cannot drift", () => {
  const { contract } = fresh();
  contract.planAmendment.persistenceDeferredTo = "L30/B117";
  assert.throws(() => validateCurriculumContract(contract), /Persistence was not deferred/);
});

test("entrance-score inference must stay prohibited", () => {
  const { contract } = fresh();
  contract.prohibitedInferences = contract.prohibitedInferences.filter((item) => item !== "entrance_score_implies_curriculum_depth");
  assert.throws(() => validateCurriculumContract(contract), /Entrance-score inference/);
});

test("duplicate main module fails closed", () => {
  const { mainInventory } = fresh();
  mainInventory.modules[1].id = mainInventory.modules[0].id;
  assert.throws(() => validateMainModuleInventory(mainInventory), /duplicates|membership/);
});

test("invalid main Git blob SHA fails closed", () => {
  const { mainInventory } = fresh();
  mainInventory.modules[0].gitBlobSha = "forged";
  assert.throws(() => validateMainModuleInventory(mainInventory), /Invalid Git blob SHA/);
});

test("destructive legacy disposition fails closed", () => {
  const { mainInventory } = fresh();
  mainInventory.modules[0].disposition = "delete";
  assert.throws(() => validateMainModuleInventory(mainInventory), /Destructive or unknown/);
});

test("unknown target mapping fails closed", () => {
  const { mainInventory } = fresh();
  mainInventory.modules[0].targetCourseIds = ["99"];
  assert.throws(() => validateMainModuleInventory(mainInventory), /unknown target course/);
});

test("HUTECH/Bauman equivalence claim fails closed", () => {
  const { competencyMatrix } = fresh();
  competencyMatrix.equivalenceClaim = true;
  assert.throws(() => validateExistingCompetencyMatrix(competencyMatrix), /equivalence claim/);
});

test("Existing Competency cannot grant Master-ready", () => {
  const { competencyMatrix } = fresh();
  competencyMatrix.masterReadyEligibleFromThisMatrix = true;
  assert.throws(() => validateExistingCompetencyMatrix(competencyMatrix), /cannot grant Master-ready/);
});

test("Master-ready cannot enter post-Diagnostic states", () => {
  const { competencyMatrix } = fresh();
  competencyMatrix.allowedPostDiagnosticStates.push("master_ready");
  assert.throws(() => validateExistingCompetencyMatrix(competencyMatrix), /Master-ready shortcut/);
});

test("gap cluster cannot be relabeled as existing", () => {
  const { competencyMatrix } = fresh();
  competencyMatrix.gapClusters[0].disposition = "diagnostic_review_only";
  assert.throws(() => validateExistingCompetencyMatrix(competencyMatrix), /must remain build_new/);
});

test("target syllabus totals fail closed", () => {
  const { mainInventory, targetDisposition } = fresh();
  targetDisposition.courses[0].numberedLessons += 1;
  assert.throws(() => validateTargetCourseDisposition(targetDisposition, mainInventory), /syllabus totals drift/);
});

test("Current Bauman Subjects cannot receive static lessons", () => {
  const { mainInventory, targetDisposition } = fresh();
  targetDisposition.courses.find((course) => course.id === "09").numberedLessons = 1;
  assert.throws(() => validateTargetCourseDisposition(targetDisposition, mainInventory), /static content overclaim|syllabus totals drift/);
});

test("Current Bauman Subjects authority cannot be forged", () => {
  const { mainInventory, targetDisposition } = fresh();
  targetDisposition.courses.find((course) => course.id === "09").requiredAuthority = "caller_claim";
  assert.throws(() => validateTargetCourseDisposition(targetDisposition, mainInventory), /authority drift/);
});

test("strategy totals fail closed", () => {
  const { mainInventory, targetDisposition } = fresh();
  targetDisposition.courses[0].strategy = "build_new_with_legacy_support";
  assert.throws(() => validateTargetCourseDisposition(targetDisposition, mainInventory), /strategy totals drift/);
});

test("unknown legacy module in a target course fails closed", () => {
  const { mainInventory, targetDisposition } = fresh();
  targetDisposition.courses[0].legacyModuleIds = ["forged"];
  assert.throws(() => validateTargetCourseDisposition(targetDisposition, mainInventory), /Unknown legacy module/);
});

test("manifest source tamper fails closed", () => {
  const manifest = json("manifest.json");
  const readBytes = (name) => {
    const bytes = fs.readFileSync(path.join(directory, name));
    return name === "main-module-inventory.json" ? Buffer.concat([bytes, Buffer.from("tamper")]) : bytes;
  };
  assert.throws(() => validateCurriculumManifest(manifest, readBytes), /fingerprint drift/);
});

test("manifest missing source fails closed", () => {
  const manifest = json("manifest.json");
  const readBytes = (name) => {
    if (name === "existing-competency-matrix.json") throw new Error("ENOENT");
    return fs.readFileSync(path.join(directory, name));
  };
  assert.throws(() => validateCurriculumManifest(manifest, readBytes), /file missing/);
});

test("manifest mutation counters fail closed", () => {
  const manifest = json("manifest.json");
  manifest.safety.runtimeWrites = 1;
  assert.throws(() => validateCurriculumManifest(manifest, (name) => fs.readFileSync(path.join(directory, name))), /mutation\/write count/);
});
