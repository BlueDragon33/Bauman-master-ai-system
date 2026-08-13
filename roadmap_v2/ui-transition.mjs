import crypto from "node:crypto";

const COURSE_IDS = Object.freeze(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]);
const LEGACY_IDS = Object.freeze(["ai", "foundation", "math", "programming", "research", "russian", "signal", "systems"]);
const FINDING_IDS = Object.freeze(Array.from({ length: 16 }, (_, index) => `L31-F${String(index + 1).padStart(3, "0")}`));
const PHASE_IDS = Object.freeze(["P0_SECURITY_BOUNDARY", "P1_CANONICAL_SEMANTICS", "P2_EVIDENCE_UX", "P3_ACCESSIBILITY_AND_MAINTAINABILITY"]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function unique(values, label) {
  assert(new Set(values).size === values.length, `${label} contains duplicates`);
}

function sameMembers(actual, expected, label) {
  unique(actual, label);
  assert(actual.length === expected.length, `${label} count drift`);
  const left = [...actual].sort();
  const right = [...expected].sort();
  assert(left.every((value, index) => value === right[index]), `${label} membership drift`);
}

function sameJson(actual, expected, label) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label} drift`);
}

export function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

export function validateUiTransitionContract(contract) {
  assert(contract?.schema === "BAUMAN_ROADMAP_V2_UI_TRANSITION_CONTRACT_V1", "UI transition contract schema drift");
  assert(contract.version === "2.12.0-l32-b125", "UI transition contract version drift");
  assert(contract.status === "PASS_B125_CONTRACT_ONLY", "UI transition contract status drift");
  assert(contract.mode === "DESIGN_ONLY", "L32 must remain design-only");
  assert(contract.baselineCommit === "e383912354673bdce7a0059d6b9a23799d74e689", "UI transition baseline drift");
  assert(contract.headBeforeL32 === "649d98ccfcf06ec8c558e79a80bac9a3560916c7", "Pre-L32 head drift");
  assert(contract.sourceAuthorities?.length === 3, "UI transition source authority count drift");
  sameJson(contract.remediationOrder, PHASE_IDS, "remediation order");
  assert(contract.transitionStages?.length === 3, "UI transition stage count drift");
  assert(contract.transitionStages.every((stage) => stage.productionMutationAllowed === false), "Transition stage authorized production mutation");
  const expectedInvariants = {
    canonicalCourseCount: 10,
    physicalLegacyModuleCount: 8,
    legacyRoutesPreserved: 8,
    legacyModulesDeleted: 0,
    legacyIdsRenamed: 0,
    automaticRedirects: 0,
    physicalCanonicalRoutesCreated: 0,
    currentBaumanStaticLessons: 0,
    currentBaumanActivation: "blocked_pending_verified_syllabus",
    findingsRequiredOpen: 16
  };
  sameJson(contract.invariants, expectedInvariants, "UI transition invariants");
  assert(Object.keys(contract.capabilities || {}).length === 9, "UI transition capability boundary incomplete");
  assert(Object.values(contract.capabilities || {}).every((value) => value === false), "L32 must have zero mutation/activation capability");
  assert(contract.acceptance?.step === 125 && contract.acceptance?.result === "PASS_CONTRACT_ONLY", "B125 acceptance drift");
  return true;
}

export function validateCanonicalCourseRoutePlan(plan, targetDisposition) {
  assert(plan?.schema === "BAUMAN_ROADMAP_V2_CANONICAL_COURSE_ROUTE_PLAN_V1", "Canonical route plan schema drift");
  assert(plan.version === "2.12.0-l32-b126" && plan.status === "PASS_B126_PLANNED_ROUTES_ONLY", "Canonical route plan status drift");
  assert(plan.routeNamespace === "/courses/{courseId}/index.html", "Canonical route namespace drift");
  assert(plan.physicalRoutesCreated === 0, "L32 created physical canonical routes");
  assert(plan.courses?.length === 10 && targetDisposition?.courses?.length === 10, "Canonical course count drift");
  sameMembers(plan.courses.map((course) => course.id), COURSE_IDS, "canonical course IDs");
  unique(plan.courses.map((course) => course.plannedRoute), "canonical planned routes");
  for (const course of plan.courses) {
    const source = targetDisposition.courses.find((item) => item.id === course.id);
    assert(source, `Missing L30 source course: ${course.id}`);
    assert(course.plannedRoute === `/courses/${course.id}/index.html`, `Canonical planned route drift: ${course.id}`);
    assert(course.routeStatus === "planned_not_created", `Canonical route was overclaimed as created: ${course.id}`);
    for (const key of ["title", "strategy", "activation", "chapters", "numberedLessons", "dynamicChapters"]) {
      assert(course[key] === source[key], `L30 course ${key} drift: ${course.id}`);
    }
    sameJson(course.legacyModuleIds, source.legacyModuleIds, `legacy support order for course ${course.id}`);
  }
  sameJson(plan.totals, targetDisposition.targetTotals, "canonical route plan totals");
  const bauman = plan.courses.find((course) => course.id === "09");
  assert(bauman.strategy === "dynamic_import_only" && bauman.numberedLessons === 0 && bauman.dynamicChapters === 6, "Current Bauman route static-content overclaim");
  assert(bauman.activation === "blocked_pending_verified_syllabus" && bauman.requiredAuthority === "verified_bauman_syllabus_import", "Current Bauman route verification gate drift");
  assert(plan.acceptance?.step === 126 && plan.acceptance?.result === "PASS_CANONICAL_ROUTE_DESIGN_ONLY", "B126 canonical route acceptance drift");
  return true;
}

export function validateLegacyCompatibilityPlan(plan, coursePlan) {
  assert(plan?.schema === "BAUMAN_ROADMAP_V2_LEGACY_ROUTE_COMPATIBILITY_PLAN_V1", "Legacy compatibility plan schema drift");
  assert(plan.status === "PASS_B126_ALL_LEGACY_ROUTES_PRESERVED", "Legacy compatibility status drift");
  assert(plan.defaultDisposition === "preserve_as_compatibility_surface", "Legacy compatibility disposition drift");
  assert(plan.redirectPolicy === "no_automatic_redirect", "Legacy redirect policy drift");
  assert(plan.modules?.length === 8, "Legacy compatibility module count drift");
  sameMembers(plan.modules.map((module) => module.id), LEGACY_IDS, "legacy compatibility module IDs");
  unique(plan.modules.map((module) => module.route), "legacy compatibility routes");
  for (const module of plan.modules) {
    assert(module.route === `/subjects/${module.id}/index.html`, `Legacy route drift: ${module.id}`);
    assert(module.deleted === false && module.renamed === false, `Destructive legacy transition: ${module.id}`);
    const expected = coursePlan.courses.filter((course) => course.legacyModuleIds.includes(module.id)).map((course) => course.id);
    sameJson(module.canonicalCourseIds, expected, `reverse course mapping for ${module.id}`);
    assert(module.canonicalCourseIds.length > 0, `Legacy module lost canonical coverage: ${module.id}`);
  }
  sameJson(plan.counts, { legacyRoutes: 8, preserved: 8, deleted: 0, renamed: 0, automaticRedirects: 0 }, "legacy compatibility counts");
  assert(plan.acceptance?.step === 126 && plan.acceptance?.result === "PASS_ADDITIVE_COMPATIBILITY_DESIGN", "B126 compatibility acceptance drift");
  return true;
}

export function validateRemediationBacklog(backlog, findings) {
  assert(backlog?.schema === "BAUMAN_ROADMAP_V2_UI_REMEDIATION_BACKLOG_V1", "UI remediation backlog schema drift");
  assert(backlog.status === "PASS_B126_ORDERED_OPEN_BACKLOG", "UI remediation backlog status drift");
  assert(backlog.findingResolutionAuthorized === false, "L32 finding resolution was authorized");
  assert(backlog.phases?.length === 4, "UI remediation phase count drift");
  sameJson(backlog.phases.map((phase) => phase.id), PHASE_IDS, "UI remediation phase order");
  assert(backlog.phases.every((phase, index) => phase.order === index), "UI remediation numeric order drift");
  const assigned = backlog.phases.flatMap((phase) => phase.findingIds);
  sameMembers(assigned, FINDING_IDS, "remediation finding assignments");
  assert(findings?.findings?.length === 16, "L31 source finding count drift");
  sameMembers(findings.findings.map((finding) => finding.id), FINDING_IDS, "L31 source finding IDs");
  assert(findings.findings.every((finding) => finding.status === "OPEN"), "L32 consumed a resolved/closed finding");
  assert(backlog.phases.find((phase) => phase.id === "P0_SECURITY_BOUNDARY").findingIds.includes("L31-F001"), "Credential finding is not P0");
  assert(backlog.phases.find((phase) => phase.id === "P0_SECURITY_BOUNDARY").findingIds.includes("L31-F012"), "Message-origin finding is not P0");
  assert(backlog.phases.find((phase) => phase.id === "P1_CANONICAL_SEMANTICS").findingIds.includes("L31-F016"), "Dynamic Bauman boundary is not P1");
  sameJson(backlog.counts, { findings: 16, open: 16, resolved: 0, phases: 4 }, "remediation backlog counts");
  assert(backlog.acceptance?.step === 126 && backlog.acceptance?.result === "PASS_ORDERED_BACKLOG_DESIGN_ONLY", "B126 backlog acceptance drift");
  return true;
}

export function buildUiTransitionPlan({ contract, targetDisposition, findings, courseRoutePlan, legacyCompatibilityPlan, remediationBacklog }) {
  validateUiTransitionContract(contract);
  validateCanonicalCourseRoutePlan(courseRoutePlan, targetDisposition);
  validateLegacyCompatibilityPlan(legacyCompatibilityPlan, courseRoutePlan);
  validateRemediationBacklog(remediationBacklog, findings);
  return deepFreeze({
    schema: "BAUMAN_ROADMAP_V2_UI_TRANSITION_PLAN_V1",
    version: "2.12.0-l32-b126",
    status: "PASS_B126_DETERMINISTIC_ADDITIVE_DESIGN",
    headBeforeL32: contract.headBeforeL32,
    counts: {
      canonicalCourses: courseRoutePlan.courses.length,
      plannedCanonicalRoutes: courseRoutePlan.courses.length,
      physicalCanonicalRoutesCreated: 0,
      legacyRoutes: legacyCompatibilityPlan.modules.length,
      legacyRoutesPreserved: legacyCompatibilityPlan.modules.length,
      automaticRedirects: 0,
      openFindings: findings.findings.length,
      remediationPhases: remediationBacklog.phases.length
    },
    stages: contract.transitionStages.map(({ id, description }) => ({ id, description })),
    canonicalDestinations: courseRoutePlan.courses.map(({ id, title, plannedRoute, routeStatus, strategy, activation, legacyModuleIds }) => ({ id, title, plannedRoute, routeStatus, strategy, activation, legacyModuleIds: [...legacyModuleIds] })),
    legacyCompatibility: legacyCompatibilityPlan.modules.map(({ id, route, canonicalCourseIds }) => ({ id, route, disposition: legacyCompatibilityPlan.defaultDisposition, redirectPolicy: legacyCompatibilityPlan.redirectPolicy, canonicalCourseIds: [...canonicalCourseIds] })),
    remediation: remediationBacklog.phases.map(({ id, order, findingIds, exitCriteria }) => ({ id, order, findingIds: [...findingIds], exitCriteria: [...exitCriteria] })),
    safety: { productionFilesChanged: 0, routesCreated: 0, redirectsCreated: 0, legacyModulesDeleted: 0, findingsResolved: 0, runtimeActivations: 0, persistenceWrites: 0 },
    acceptance: { step: 126, result: "PASS_DETERMINISTIC_ADDITIVE_DESIGN_ONLY" }
  });
}

export function validateUiTransitionManifest(manifest, readBytes) {
  assert(manifest?.schema === "BAUMAN_ROADMAP_V2_UI_TRANSITION_MANIFEST_V1", "UI transition manifest schema drift");
  assert(manifest.status === "PASS_B126_DETERMINISTIC_UI_TRANSITION_DESIGN", "UI transition manifest status drift");
  assert(typeof readBytes === "function", "UI transition manifest reader missing");
  const descriptors = [...Object.values(manifest.sources || {}), manifest.generatedPlan].filter(Boolean);
  assert(descriptors.length === 7, "UI transition manifest descriptor count drift");
  for (const descriptor of descriptors) {
    let bytes;
    try { bytes = readBytes(descriptor.path); } catch { throw new Error(`UI transition manifest file missing: ${descriptor.path}`); }
    assert(Buffer.isBuffer(bytes), `UI transition manifest reader did not return bytes: ${descriptor.path}`);
    const digest = crypto.createHash("sha256").update(bytes).digest("hex");
    assert(bytes.length === descriptor.bytes && digest === descriptor.sha256, `UI transition manifest fingerprint drift: ${descriptor.path}`);
  }
  sameJson(manifest.counts, { canonicalCourses: 10, plannedCanonicalRoutes: 10, physicalCanonicalRoutesCreated: 0, legacyRoutesPreserved: 8, automaticRedirects: 0, openFindings: 16, remediationPhases: 4 }, "UI transition manifest counts");
  assert(Object.values(manifest.safety || {}).every((value) => value === 0), "UI transition manifest mutation/write count drift");
  assert(manifest.acceptance?.step === 126 && manifest.acceptance?.result === "PASS_UI_TRANSITION_DESIGN_PACKAGE", "B126 manifest acceptance drift");
  return true;
}

export const uiTransitionConstants = deepFreeze({ COURSE_IDS, LEGACY_IDS, FINDING_IDS, PHASE_IDS });
