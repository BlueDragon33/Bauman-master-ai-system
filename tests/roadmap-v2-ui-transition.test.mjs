import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildUiTransitionPlan,
  validateCanonicalCourseRoutePlan,
  validateLegacyCompatibilityPlan,
  validateRemediationBacklog,
  validateUiTransitionContract,
  validateUiTransitionManifest
} from "../roadmap_v2/ui-transition.mjs";

const root = path.resolve(".");
const json = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const fresh = () => ({
  contract: json("roadmap_v2/ui-transition/ui-transition-contract.json"),
  targetDisposition: json("roadmap_v2/curriculum/target-course-disposition.json"),
  findings: json("roadmap_v2/ui-audit/findings.json"),
  courseRoutePlan: json("roadmap_v2/ui-transition/course-route-plan.json"),
  legacyCompatibilityPlan: json("roadmap_v2/ui-transition/legacy-compatibility-plan.json"),
  remediationBacklog: json("roadmap_v2/ui-transition/remediation-backlog.json")
});

test("valid L32 package builds a deeply frozen additive design", () => {
  const plan = buildUiTransitionPlan(fresh());
  assert.equal(plan.counts.canonicalCourses, 10);
  assert.equal(plan.counts.legacyRoutesPreserved, 8);
  assert.equal(plan.counts.physicalCanonicalRoutesCreated, 0);
  assert.equal(Object.isFrozen(plan.canonicalDestinations[0]), true);
});

test("production capability fails closed", () => {
  const { contract } = fresh();
  contract.capabilities.productionHtmlWrite = true;
  assert.throws(() => validateUiTransitionContract(contract), /zero mutation\/activation/);
});

test("design-only mode cannot drift", () => {
  const { contract } = fresh();
  contract.mode = "IMPLEMENTATION";
  assert.throws(() => validateUiTransitionContract(contract), /design-only/);
});

test("pre-L32 head cannot drift", () => {
  const { contract } = fresh();
  contract.headBeforeL32 = "0".repeat(40);
  assert.throws(() => validateUiTransitionContract(contract), /Pre-L32 head drift/);
});

test("transition stage cannot authorize mutation", () => {
  const { contract } = fresh();
  contract.transitionStages[1].productionMutationAllowed = true;
  assert.throws(() => validateUiTransitionContract(contract), /authorized production mutation/);
});

test("destructive invariant fails closed", () => {
  const { contract } = fresh();
  contract.invariants.legacyModulesDeleted = 1;
  assert.throws(() => validateUiTransitionContract(contract), /invariants drift/);
});

test("physical canonical route creation fails closed", () => {
  const { courseRoutePlan, targetDisposition } = fresh();
  courseRoutePlan.physicalRoutesCreated = 1;
  assert.throws(() => validateCanonicalCourseRoutePlan(courseRoutePlan, targetDisposition), /created physical canonical routes/);
});

test("canonical course omission fails closed", () => {
  const { courseRoutePlan, targetDisposition } = fresh();
  courseRoutePlan.courses.pop();
  assert.throws(() => validateCanonicalCourseRoutePlan(courseRoutePlan, targetDisposition), /course count drift/);
});

test("duplicate planned route fails closed", () => {
  const { courseRoutePlan, targetDisposition } = fresh();
  courseRoutePlan.courses[1].plannedRoute = courseRoutePlan.courses[0].plannedRoute;
  assert.throws(() => validateCanonicalCourseRoutePlan(courseRoutePlan, targetDisposition), /planned routes contains duplicates|planned route drift/);
});

test("created route status overclaim fails closed", () => {
  const { courseRoutePlan, targetDisposition } = fresh();
  courseRoutePlan.courses[0].routeStatus = "created";
  assert.throws(() => validateCanonicalCourseRoutePlan(courseRoutePlan, targetDisposition), /overclaimed as created/);
});

test("L30 title drift fails closed", () => {
  const { courseRoutePlan, targetDisposition } = fresh();
  courseRoutePlan.courses[0].title = "Invented";
  assert.throws(() => validateCanonicalCourseRoutePlan(courseRoutePlan, targetDisposition), /course title drift/);
});

test("L30 support mapping drift fails closed", () => {
  const { courseRoutePlan, targetDisposition } = fresh();
  courseRoutePlan.courses[0].legacyModuleIds.reverse();
  assert.throws(() => validateCanonicalCourseRoutePlan(courseRoutePlan, targetDisposition), /legacy support order/);
});

test("Current Bauman static lesson overclaim fails closed", () => {
  const { courseRoutePlan, targetDisposition } = fresh();
  courseRoutePlan.courses.find((course) => course.id === "09").numberedLessons = 1;
  assert.throws(() => validateCanonicalCourseRoutePlan(courseRoutePlan, targetDisposition), /numberedLessons drift|static-content overclaim/);
});

test("Current Bauman authority drift fails closed", () => {
  const { courseRoutePlan, targetDisposition } = fresh();
  courseRoutePlan.courses.find((course) => course.id === "09").requiredAuthority = "caller_claim";
  assert.throws(() => validateCanonicalCourseRoutePlan(courseRoutePlan, targetDisposition), /verification gate drift/);
});

test("legacy deletion fails closed", () => {
  const { legacyCompatibilityPlan, courseRoutePlan } = fresh();
  legacyCompatibilityPlan.modules[0].deleted = true;
  assert.throws(() => validateLegacyCompatibilityPlan(legacyCompatibilityPlan, courseRoutePlan), /Destructive legacy transition/);
});

test("automatic redirect policy fails closed", () => {
  const { legacyCompatibilityPlan, courseRoutePlan } = fresh();
  legacyCompatibilityPlan.redirectPolicy = "redirect_to_first_course";
  assert.throws(() => validateLegacyCompatibilityPlan(legacyCompatibilityPlan, courseRoutePlan), /redirect policy drift/);
});

test("reverse legacy-to-course mapping drift fails closed", () => {
  const { legacyCompatibilityPlan, courseRoutePlan } = fresh();
  legacyCompatibilityPlan.modules.find((module) => module.id === "signal").canonicalCourseIds.pop();
  assert.throws(() => validateLegacyCompatibilityPlan(legacyCompatibilityPlan, courseRoutePlan), /reverse course mapping/);
});

test("legacy module omission fails closed", () => {
  const { legacyCompatibilityPlan, courseRoutePlan } = fresh();
  legacyCompatibilityPlan.modules.pop();
  assert.throws(() => validateLegacyCompatibilityPlan(legacyCompatibilityPlan, courseRoutePlan), /module count drift/);
});

test("valid remediation backlog assigns all 16 open findings once", () => {
  const { remediationBacklog, findings } = fresh();
  assert.equal(validateRemediationBacklog(remediationBacklog, findings), true);
});

test("finding resolution authorization fails closed", () => {
  const { remediationBacklog, findings } = fresh();
  remediationBacklog.findingResolutionAuthorized = true;
  assert.throws(() => validateRemediationBacklog(remediationBacklog, findings), /resolution was authorized/);
});

test("closed L31 finding fails closed", () => {
  const { remediationBacklog, findings } = fresh();
  findings.findings[0].status = "RESOLVED";
  assert.throws(() => validateRemediationBacklog(remediationBacklog, findings), /resolved\/closed finding/);
});

test("duplicate remediation assignment fails closed", () => {
  const { remediationBacklog, findings } = fresh();
  remediationBacklog.phases[3].findingIds[0] = remediationBacklog.phases[0].findingIds[0];
  assert.throws(() => validateRemediationBacklog(remediationBacklog, findings), /contains duplicates|membership drift/);
});

test("remediation phase order drift fails closed", () => {
  const { remediationBacklog, findings } = fresh();
  remediationBacklog.phases.reverse();
  assert.throws(() => validateRemediationBacklog(remediationBacklog, findings), /phase order drift/);
});

test("credential finding must remain P0", () => {
  const { remediationBacklog, findings } = fresh();
  remediationBacklog.phases[0].findingIds = remediationBacklog.phases[0].findingIds.filter((id) => id !== "L31-F001");
  remediationBacklog.phases[1].findingIds.push("L31-F001");
  assert.throws(() => validateRemediationBacklog(remediationBacklog, findings), /Credential finding is not P0/);
});

test("Current Bauman boundary must remain P1", () => {
  const { remediationBacklog, findings } = fresh();
  remediationBacklog.phases[1].findingIds = remediationBacklog.phases[1].findingIds.filter((id) => id !== "L31-F016");
  remediationBacklog.phases[2].findingIds.push("L31-F016");
  assert.throws(() => validateRemediationBacklog(remediationBacklog, findings), /Dynamic Bauman boundary is not P1/);
});

test("manifest source tamper fails closed", () => {
  const manifest = json("roadmap_v2/ui-transition/manifest.json");
  assert.throws(() => validateUiTransitionManifest(manifest, (name) => {
    const bytes = fs.readFileSync(path.join(root, name));
    return name === "roadmap_v2/ui-audit/findings.json" ? Buffer.concat([bytes, Buffer.from("tamper")]) : bytes;
  }), /fingerprint drift/);
});

test("manifest missing source fails closed", () => {
  const manifest = json("roadmap_v2/ui-transition/manifest.json");
  assert.throws(() => validateUiTransitionManifest(manifest, (name) => {
    if (name === "roadmap_v2/ui-transition/course-route-plan.json") throw new Error("ENOENT");
    return fs.readFileSync(path.join(root, name));
  }), /file missing/);
});

test("manifest write counter fails closed", () => {
  const manifest = json("roadmap_v2/ui-transition/manifest.json");
  manifest.safety.routesCreated = 1;
  assert.throws(() => validateUiTransitionManifest(manifest, (name) => fs.readFileSync(path.join(root, name))), /mutation\/write count drift/);
});
