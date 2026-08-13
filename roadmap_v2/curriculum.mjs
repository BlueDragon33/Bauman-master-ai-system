import crypto from "node:crypto";

const TARGET_COURSE_IDS = Object.freeze(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]);
const MAIN_MODULE_IDS = Object.freeze(["ai", "foundation", "math", "programming", "research", "russian", "signal", "systems"]);
const STRATEGY_TOTALS = Object.freeze({
  adapt_and_extend: 2,
  rebuild_from_legacy_shell: 3,
  build_new_with_legacy_support: 4,
  dynamic_import_only: 1
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function unique(values, label) {
  assert(new Set(values).size === values.length, `${label} contains duplicates`);
}

function sameMembers(actual, expected, label) {
  unique(actual, label);
  assert(actual.length === expected.length, `${label} count drift`);
  assert([...actual].sort().every((value, index) => value === [...expected].sort()[index]), `${label} membership drift`);
}

function validTargetIds(ids, label) {
  assert(Array.isArray(ids) && ids.length > 0, `${label} must map to at least one target course`);
  unique(ids, label);
  assert(ids.every((id) => TARGET_COURSE_IDS.includes(id)), `${label} contains unknown target course`);
}

export function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

export function validateCurriculumContract(contract) {
  assert(contract?.schema === "BAUMAN_ROADMAP_V2_CURRICULUM_RECONCILIATION_CONTRACT_V1", "Curriculum contract schema drift");
  assert(contract.version === "2.10.0-l30-b117", "Curriculum contract version drift");
  assert(contract.status === "PASS_B117_CONTRACT_ONLY", "Curriculum contract status drift");
  assert(contract.baselineCommit === "e383912354673bdce7a0059d6b9a23799d74e689", "Curriculum baseline drift");
  assert(/^[0-9a-f]{40}$/.test(contract.headBeforeL30), "Invalid pre-L30 head");
  assert(contract.planAmendment?.approvedAt === "2026-08-13", "Plan amendment date drift");
  assert(contract.planAmendment?.approvedNextAction === "L30/B117 curriculum reconciliation V2.1", "L30 plan amendment missing");
  assert(contract.planAmendment?.persistenceDeferredTo === "L34/B133", "Persistence was not deferred to the approved step");
  assert(contract.planAmendment?.totalPlan === "58 lượt / 232 bước", "Expanded plan total drift");
  assert(contract.planAmendment?.renumberCompletedSteps === false, "Completed steps must not be renumbered");
  sameMembers(contract.evidenceClasses, [
    "physical_repository_baseline",
    "prior_curriculum_reconciliation",
    "diagnostic_evidence",
    "verified_bauman_syllabus_import"
  ], "evidence classes");
  sameMembers(contract.dispositions, [
    "retain_and_adapt",
    "redistribute_as_support",
    "diagnostic_review_only",
    "build_new",
    "dynamic_import_only",
    "quarantine_unverified"
  ], "curriculum dispositions");
  assert(Array.isArray(contract.prohibitedInferences), "Prohibited inference boundary missing");
  assert(contract.prohibitedInferences.includes("entrance_score_implies_curriculum_depth"), "Entrance-score inference not prohibited");
  assert(contract.prohibitedInferences.includes("diagnostic_pass_grants_master_ready"), "Master-ready shortcut not prohibited");
  assert(contract.prohibitedInferences.length >= 6, "Prohibited inference boundary incomplete");
  assert(Object.values(contract.capabilities || {}).every((value) => value === false), "B117 must have zero write/activation capability");
  assert(contract.acceptance?.step === 117 && contract.acceptance?.result === "PASS_CONTRACT_ONLY", "B117 acceptance drift");
  return true;
}

export function validateMainModuleInventory(inventory) {
  assert(inventory?.schema === "BAUMAN_ROADMAP_V2_MAIN_MODULE_INVENTORY_V1", "Main inventory schema drift");
  assert(inventory.baselineRef === "main@e383912354673bdce7a0059d6b9a23799d74e689", "Main inventory baseline drift");
  assert(inventory.sourceAuthority === "physical_repository_baseline", "Main inventory source is not authoritative");
  assert(inventory.moduleCount === 8 && inventory.modules?.length === 8, "Main module count drift");
  assert(inventory.noDeletionAuthorized === true, "Legacy module deletion was authorized");
  sameMembers(inventory.modules.map((module) => module.id), MAIN_MODULE_IDS, "main module IDs");
  unique(inventory.modules.map((module) => module.path), "main module paths");
  for (const module of inventory.modules) {
    assert(module.path === `subjects/${module.id}/index.html`, `Unexpected path for ${module.id}`);
    assert(/^[0-9a-f]{40}$/.test(module.gitBlobSha), `Invalid Git blob SHA for ${module.id}`);
    assert(["retain_and_adapt", "redistribute_as_support"].includes(module.disposition), `Destructive or unknown disposition for ${module.id}`);
    validTargetIds(module.targetCourseIds, `main module ${module.id}`);
  }
  return true;
}

export function validateExistingCompetencyMatrix(matrix) {
  assert(matrix?.schema === "BAUMAN_ROADMAP_V2_EXISTING_COMPETENCY_MATRIX_V1", "Existing Competency schema drift");
  assert(matrix.sourceAuthority === "prior_curriculum_reconciliation", "Existing Competency source drift");
  assert(matrix.claimStatus === "declared_existing_not_yet_diagnostic_verified", "Existing Competency overclaim");
  assert(matrix.equivalenceClaim === false, "HUTECH/Bauman equivalence claim is forbidden");
  assert(matrix.defaultDisposition === "diagnostic_review_only", "Existing Competency must be diagnostic-only");
  assert(matrix.diagnosticRequiredBeforePrerequisiteCredit === true, "Diagnostic prerequisite gate missing");
  assert(matrix.masterReadyEligibleFromThisMatrix === false, "Existing Competency cannot grant Master-ready");
  assert(matrix.forbiddenDirectState === "master_ready", "Forbidden direct state drift");
  assert(matrix.existingCompetencies?.length === 8, "Existing Competency group count drift");
  assert(matrix.gapClusters?.length === 6, "Gap cluster count drift");
  unique(matrix.existingCompetencies.map((item) => item.id), "Existing Competency IDs");
  unique(matrix.gapClusters.map((item) => item.id), "gap IDs");
  for (const item of matrix.existingCompetencies) validTargetIds(item.targetCourseIds, item.id);
  for (const gap of matrix.gapClusters) {
    assert(gap.disposition === "build_new", `${gap.id} must remain build_new`);
    validTargetIds(gap.targetCourseIds, gap.id);
  }
  assert(!matrix.allowedPostDiagnosticStates.includes("master_ready"), "Post-diagnostic states contain Master-ready shortcut");
  return true;
}

export function validateTargetCourseDisposition(target, inventory) {
  assert(target?.schema === "BAUMAN_ROADMAP_V2_TARGET_COURSE_DISPOSITION_V1", "Target disposition schema drift");
  assert(target.version === "2.1.0-l30-b118", "Roadmap V2.1 target version drift");
  assert(target.courses?.length === 10, "Target course count drift");
  sameMembers(target.courses.map((course) => course.id), TARGET_COURSE_IDS, "target course IDs");
  const sums = target.courses.reduce((total, course) => ({
    chapters: total.chapters + course.chapters,
    numberedLessons: total.numberedLessons + course.numberedLessons,
    dynamicChapters: total.dynamicChapters + course.dynamicChapters
  }), { chapters: 0, numberedLessons: 0, dynamicChapters: 0 });
  assert(target.targetTotals.courses === 10, "Declared target course total drift");
  assert(sums.chapters === 85 && sums.numberedLessons === 304 && sums.dynamicChapters === 8, "Roadmap V2 syllabus totals drift");
  assert(sums.chapters === target.targetTotals.chapters && sums.numberedLessons === target.targetTotals.numberedLessons && sums.dynamicChapters === target.targetTotals.dynamicChapters, "Target totals do not match course rows");
  const moduleIds = new Set(inventory.modules.map((module) => module.id));
  const actualStrategies = {};
  for (const course of target.courses) {
    actualStrategies[course.strategy] = (actualStrategies[course.strategy] || 0) + 1;
    assert(course.legacyModuleIds.length > 0 && course.legacyModuleIds.every((id) => moduleIds.has(id)), `Unknown legacy module in course ${course.id}`);
  }
  assert(JSON.stringify(actualStrategies) === JSON.stringify(STRATEGY_TOTALS), "Course strategy totals drift");
  assert(JSON.stringify(target.strategyTotals) === JSON.stringify(STRATEGY_TOTALS), "Declared strategy totals drift");
  const bauman = target.courses.find((course) => course.id === "09");
  assert(bauman.strategy === "dynamic_import_only", "Current Bauman Subjects must remain dynamic-import-only");
  assert(bauman.numberedLessons === 0 && bauman.dynamicChapters === 6, "Current Bauman Subjects static content overclaim");
  assert(bauman.activation === "blocked_pending_verified_syllabus", "Current Bauman Subjects activation must fail closed");
  assert(bauman.requiredAuthority === "verified_bauman_syllabus_import", "Current Bauman Subjects authority drift");
  assert(Object.values(target.legacyPolicy).every((value) => value === 0), "L30 target matrix mutated legacy/runtime/UI");
  return true;
}

export function reconcileCurriculum({ contract, mainInventory, competencyMatrix, targetDisposition }) {
  validateCurriculumContract(contract);
  validateMainModuleInventory(mainInventory);
  validateExistingCompetencyMatrix(competencyMatrix);
  validateTargetCourseDisposition(targetDisposition, mainInventory);
  const courses = targetDisposition.courses.map((course) => ({
    id: course.id,
    title: course.title,
    strategy: course.strategy,
    activation: course.activation,
    legacyModuleIds: [...course.legacyModuleIds],
    existingCompetencyIds: competencyMatrix.existingCompetencies.filter((item) => item.targetCourseIds.includes(course.id)).map((item) => item.id),
    gapClusterIds: competencyMatrix.gapClusters.filter((item) => item.targetCourseIds.includes(course.id)).map((item) => item.id),
    chapters: course.chapters,
    numberedLessons: course.numberedLessons,
    dynamicChapters: course.dynamicChapters
  }));
  return deepFreeze({
    schema: "BAUMAN_ROADMAP_V2_CURRICULUM_MATRIX_V1",
    version: "2.1.0-l30-b118",
    baselineCommit: contract.baselineCommit,
    safety: {
      declaredExistingRequiresDiagnostic: true,
      diagnosticCannotGrantMasterReady: true,
      baumanSubjectsRequireVerifiedImport: true,
      legacyModulesDeleted: 0,
      runtimeWrites: 0,
      uiChanges: 0,
      persistenceWrites: 0
    },
    counts: {
      mainModules: mainInventory.modules.length,
      existingCompetencyGroups: competencyMatrix.existingCompetencies.length,
      gapClusters: competencyMatrix.gapClusters.length,
      targetCourses: courses.length,
      chapters: targetDisposition.targetTotals.chapters,
      numberedLessons: targetDisposition.targetTotals.numberedLessons,
      dynamicChapters: targetDisposition.targetTotals.dynamicChapters
    },
    courses
  });
}

export function validateCurriculumManifest(manifest, readBytes) {
  assert(manifest?.schema === "BAUMAN_ROADMAP_V2_CURRICULUM_MANIFEST_V1", "Curriculum manifest schema drift");
  assert(manifest.status === "PASS_B118_DETERMINISTIC_CURRICULUM_MATRIX", "Curriculum manifest status drift");
  assert(typeof readBytes === "function", "Curriculum manifest reader missing");
  const descriptors = [...Object.values(manifest.sources || {}), manifest.generatedMatrix].filter(Boolean);
  assert(descriptors.length === 6, "Curriculum manifest descriptor count drift");
  for (const descriptor of descriptors) {
    let bytes;
    try { bytes = readBytes(descriptor.path); } catch { throw new Error(`Curriculum manifest file missing: ${descriptor.path}`); }
    assert(Buffer.isBuffer(bytes), `Curriculum manifest reader did not return bytes: ${descriptor.path}`);
    const digest = crypto.createHash("sha256").update(bytes).digest("hex");
    assert(bytes.length === descriptor.bytes && digest === descriptor.sha256, `Curriculum manifest fingerprint drift: ${descriptor.path}`);
  }
  assert(manifest.counts?.mainModules === 8 && manifest.counts?.targetCourses === 10, "Curriculum manifest primary count drift");
  assert(manifest.counts?.chapters === 85 && manifest.counts?.numberedLessons === 304 && manifest.counts?.dynamicChapters === 8, "Curriculum manifest syllabus count drift");
  assert(manifest.safety?.declaredExistingRequiresDiagnostic === true, "Curriculum manifest Diagnostic gate drift");
  assert(manifest.safety?.diagnosticCannotGrantMasterReady === true, "Curriculum manifest Master-ready gate drift");
  assert(manifest.safety?.baumanSubjectsRequireVerifiedImport === true, "Curriculum manifest Bauman import gate drift");
  assert(["legacyModulesDeleted", "runtimeWrites", "uiChanges", "persistenceWrites"].every((key) => manifest.safety?.[key] === 0), "Curriculum manifest mutation/write count drift");
  assert(manifest.acceptance?.step === 118 && manifest.acceptance?.result === "PASS_DETERMINISTIC_READ_ONLY_MATRIX", "B118 manifest acceptance drift");
  return true;
}

export const curriculumConstants = deepFreeze({ TARGET_COURSE_IDS, MAIN_MODULE_IDS, STRATEGY_TOTALS });
