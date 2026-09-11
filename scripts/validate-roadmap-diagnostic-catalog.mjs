import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadRoadmapConsumer } from "../roadmap_v2/consumer.mjs";

function read(file) {
  const bytes = fs.readFileSync(file);
  return { bytes, value: JSON.parse(bytes.toString("utf8")) };
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const root = path.resolve("roadmap_v2");
const manifest = read(path.join(root, "diagnostic/manifest.json"));
const catalog = read(path.join(root, "diagnostic/catalog.json"));
const contract = read(path.join(root, "diagnostic/diagnostic-contract.json")).value;
const consumer = loadRoadmapConsumer();

assert(manifest.value.schema === "BAUMAN_ROADMAP_V2_DIAGNOSTIC_MANIFEST_V1", "Invalid diagnostic manifest schema");
assert(manifest.value.status === "PASS_B91_ENGINE_CATALOG_BLOCKED_NO_ITEM_BANKS", "Diagnostic manifest is not B91 PASS");
assert(manifest.value.files.catalog.sha256 === sha256(catalog.bytes), "Diagnostic catalog hash mismatch");
assert(catalog.value.schema === "BAUMAN_ROADMAP_V2_DIAGNOSTIC_CATALOG_V1", "Invalid diagnostic catalog schema");
assert(catalog.value.source.consumerManifestSha256 === manifest.value.upstream.consumerManifest.sha256, "Catalog/manifest consumer hash mismatch");

assert(catalog.value.counts.plans === 381, "Diagnostic plan count drift");
assert(catalog.value.counts.chapterPlans === 77, "Diagnostic chapter plan count drift");
assert(catalog.value.counts.lessonPlans === 304, "Diagnostic lesson plan count drift");
assert(catalog.value.counts.blockedDynamicTargets === 8, "Dynamic target blocker count drift");
assert(catalog.value.counts.verifiedItemBanks === 0, "Unexpected verified item bank");
assert(catalog.value.counts.executablePlans === 0, "A diagnostic plan is prematurely executable");

const planIds = new Set(catalog.value.plans.map((item) => item.id));
const targetIds = new Set(catalog.value.plans.map((item) => item.targetId));
assert(planIds.size === catalog.value.plans.length, "Duplicate diagnostic plan ID");
assert(targetIds.size === catalog.value.plans.length, "Duplicate diagnostic target ID");
assert(catalog.value.validation.missingTargets.length === 0, "Diagnostic catalog has missing targets");
assert(catalog.value.validation.missingPrerequisiteRefs.length === 0, "Diagnostic catalog has missing prerequisite refs");
assert(catalog.value.validation.masterReadyOutcomes.length === 0, "Diagnostic catalog emits Master-ready");
assert(catalog.value.validation.executablePlansWithoutVerifiedBank.length === 0, "Executable plan has no verified bank");

for (const plan of catalog.value.plans) {
  assert(consumer.sidecar.hasNode(plan.targetId), `Missing diagnostic target: ${plan.targetId}`);
  assert(plan.requiredItemCount === contract.assessmentPolicy.requiredItemCount, `Item count policy drift: ${plan.id}`);
  assert(JSON.stringify(plan.difficultyDistribution) === JSON.stringify(contract.assessmentPolicy.difficultyDistribution), `Difficulty policy drift: ${plan.id}`);
  assert(plan.executionStatus === contract.itemBankGate.missingBankStatus, `Unexpected plan execution status: ${plan.id}`);
  assert(plan.executionReady === false, `Plan is prematurely executable: ${plan.id}`);
  assert(plan.itemBank.reviewStatus === "missing" && plan.itemBank.verifiedItemCount === 0, `Plan fabricates an item bank: ${plan.id}`);
  assert(plan.allowedPassOutcome === "existing_competency_verified", `Diagnostic pass semantic drift: ${plan.id}`);
  assert(plan.masterReadyOutcomeAllowed === false, `Diagnostic plan allows Master-ready: ${plan.id}`);
  for (const ref of plan.prerequisiteRefs) assert(consumer.sidecar.hasNode(ref), `Missing prerequisite ref: ${ref}`);
}

for (const target of catalog.value.blockedDynamicTargets) {
  assert(consumer.sidecar.hasNode(target.targetId), `Missing dynamic target: ${target.targetId}`);
  assert(target.executionReady === false, `Dynamic target is prematurely executable: ${target.targetId}`);
  assert(target.reasonCodes.includes("DYNAMIC_INSTANCE_REQUIRED"), `Dynamic target blocker reason missing: ${target.targetId}`);
}

const c07 = catalog.value.plans.find((item) => item.targetId === "MATH-L2-C07");
assert(c07.provenanceSummary.authoritativeLegacyReferenceCount === 5, "MATH-L2-C07 provenance count drift");
assert(c07.provenanceSummary.quarantinedFrameworkCandidateCount >= 1, "MATH-L2-C07 framework quarantine evidence missing");

console.log(JSON.stringify({
  status: "PASS_B90_DIAGNOSTIC_CATALOG",
  plans: catalog.value.counts.plans,
  chapterPlans: catalog.value.counts.chapterPlans,
  lessonPlans: catalog.value.counts.lessonPlans,
  blockedDynamicTargets: catalog.value.counts.blockedDynamicTargets,
  verifiedItemBanks: 0,
  executablePlans: 0,
  generatedQuestionItems: 0
}));
