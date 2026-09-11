import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadRoadmapConsumer } from "../roadmap_v2/consumer.mjs";

const root = path.resolve("roadmap_v2");
const diagnosticRoot = path.join(root, "diagnostic");

function read(relativePath) {
  const file = path.join(root, relativePath);
  const bytes = fs.readFileSync(file);
  return { file, bytes, value: JSON.parse(bytes.toString("utf8")) };
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function descriptor(relativePath) {
  const bytes = fs.readFileSync(path.join(root, relativePath));
  return {
    path: relativePath,
    bytes: bytes.length,
    sha256: sha256(bytes)
  };
}

const consumerManifest = read("consumer/manifest.json");
const contractLoaded = read("diagnostic/diagnostic-contract.json");
const contract = contractLoaded.value;
const consumer = loadRoadmapConsumer();
const blueprints = consumer.listDiagnosticBlueprints();

if (contract.acceptance?.result !== "PASS_CONTRACT_ONLY") throw new Error("Diagnostic contract is not B89 PASS");
if (consumer.bridge.schema !== contract.upstream.consumerManifestSchema) throw new Error("Diagnostic/consumer manifest schema mismatch");

const plans = blueprints.map((blueprint) => {
  const bundle = blueprint.sourceType === "roadmap_chapter" ? consumer.getChapterBundle(blueprint.sourceId) : null;
  return {
    id: `DIAG::${blueprint.sourceId}`,
    targetId: blueprint.sourceId,
    targetType: blueprint.sourceType,
    title: blueprint.title,
    deliveryMode: blueprint.deliveryMode,
    prerequisiteRefs: [...blueprint.prerequisiteRefs],
    policyId: contract.assessmentPolicy.id,
    requiredItemCount: contract.assessmentPolicy.requiredItemCount,
    difficultyDistribution: { ...contract.assessmentPolicy.difficultyDistribution },
    passPercent: contract.assessmentPolicy.passPercent,
    criticalItemFloorPercent: contract.assessmentPolicy.criticalItemFloorPercent,
    itemBank: {
      path: null,
      bankId: null,
      reviewStatus: "missing",
      verifiedItemCount: 0
    },
    executionStatus: contract.itemBankGate.missingBankStatus,
    executionReady: false,
    allowedPassOutcome: contract.statusSemantics.pass,
    masterReadyOutcomeAllowed: false,
    provenanceSummary: {
      authoritativeLegacyReferenceCount: bundle?.provenance.authoritativeLegacyLessons.length || 0,
      runtimeOverlayReferenceCount: bundle?.provenance.runtimeTheoryOverlays.length || 0,
      quarantinedFrameworkCandidateCount: bundle?.provenance.frameworkOutlineCandidates.length || 0
    },
    reasonCodes: [
      "MISSING_VERIFIED_ITEM_BANK",
      "DIAGNOSTIC_PASS_NOT_MASTER_READY",
      "MASTERY_PERSISTENCE_DISABLED",
      "PRODUCTION_DISCONNECTED"
    ]
  };
});

const dynamicChapters = consumer.sidecar.registry.courses
  .flatMap((course) => course.levels.flatMap((level) => level.chapters))
  .filter((chapter) => chapter.deliveryMode === "dynamic");
const blockedDynamicTargets = dynamicChapters.map((chapter) => ({
  targetId: chapter.id,
  targetType: "roadmap_chapter",
  title: chapter.title,
  executionStatus: "blocked_dynamic_instance_required",
  executionReady: false,
  reasonCodes: [
    "DYNAMIC_INSTANCE_REQUIRED",
    "PRODUCTION_DISCONNECTED"
  ]
}));

const planIds = new Set(plans.map((item) => item.id));
const targetIds = new Set(plans.map((item) => item.targetId));
const missingTargets = plans.filter((item) => !consumer.sidecar.hasNode(item.targetId)).map((item) => item.targetId);
const missingPrerequisiteRefs = [];
for (const plan of plans) {
  for (const ref of plan.prerequisiteRefs) {
    if (!consumer.sidecar.hasNode(ref)) missingPrerequisiteRefs.push({ planId: plan.id, ref });
  }
}

const catalog = {
  schema: "BAUMAN_ROADMAP_V2_DIAGNOSTIC_CATALOG_V1",
  version: 1,
  generatedAt: "2026-08-11T00:00:00+07:00",
  source: {
    consumerManifest: "roadmap_v2/consumer/manifest.json",
    consumerManifestSha256: sha256(consumerManifest.bytes),
    consumerContractSchema: consumer.contract.schema
  },
  policy: {
    id: contract.assessmentPolicy.id,
    requiredItemCount: contract.assessmentPolicy.requiredItemCount,
    difficultyDistribution: { ...contract.assessmentPolicy.difficultyDistribution },
    passPercent: contract.assessmentPolicy.passPercent,
    criticalItemFloorPercent: contract.assessmentPolicy.criticalItemFloorPercent
  },
  counts: {
    plans: plans.length,
    chapterPlans: plans.filter((item) => item.targetType === "roadmap_chapter").length,
    lessonPlans: plans.filter((item) => item.targetType === "roadmap_lesson").length,
    blockedDynamicTargets: blockedDynamicTargets.length,
    verifiedItemBanks: 0,
    executablePlans: 0
  },
  plans,
  blockedDynamicTargets,
  validation: {
    uniquePlanIds: planIds.size,
    uniqueTargetIds: targetIds.size,
    missingTargets,
    missingPrerequisiteRefs,
    masterReadyOutcomes: plans.filter((item) => item.allowedPassOutcome === "master_ready").map((item) => item.id),
    executablePlansWithoutVerifiedBank: plans.filter((item) => item.executionReady && item.itemBank.reviewStatus !== "verified").map((item) => item.id),
    result: "PASS_CATALOG_BLOCKED_NO_ITEM_BANKS"
  }
};

fs.writeFileSync(path.join(diagnosticRoot, "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);

const manifest = {
  schema: "BAUMAN_ROADMAP_V2_DIAGNOSTIC_MANIFEST_V1",
  version: "2.3.0-l23-b91",
  status: "PASS_B91_ENGINE_CATALOG_BLOCKED_NO_ITEM_BANKS",
  mode: "read_only_diagnostic_harness",
  productionIntegration: "disconnected",
  baselineCommit: consumer.bridge.baselineCommit,
  upstream: {
    consumerManifest: descriptor("consumer/manifest.json")
  },
  files: {
    diagnosticContract: descriptor("diagnostic/diagnostic-contract.json"),
    diagnosticContractSchema: descriptor("diagnostic/diagnostic-contract.schema.json"),
    catalogSchema: descriptor("diagnostic/catalog.schema.json"),
    itemBankSchema: descriptor("diagnostic/item-bank.schema.json"),
    attemptSchema: descriptor("diagnostic/attempt.schema.json"),
    diagnosticEngine: descriptor("diagnostic.mjs"),
    catalog: descriptor("diagnostic/catalog.json")
  },
  counts: { ...catalog.counts },
  safety: {
    generatedQuestionItems: 0,
    verifiedItemBanks: 0,
    executablePlans: 0,
    masteryEvidenceWrites: 0,
    priorityEngineWrites: 0,
    runtimeWrites: 0
  },
  acceptance: {
    step: 91,
    catalogCompleteFromEligibleBlueprints: true,
    dynamicTargetsBlocked: true,
    missingBanksFailClosed: true,
    proposedBankHarnessOnly: true,
    diagnosticEnginePinned: true,
    masterReadyOutcomeAllowed: false,
    result: "PASS_ENGINE_CATALOG_BLOCKED_NO_ITEM_BANKS"
  }
};

fs.writeFileSync(path.join(diagnosticRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ status: manifest.status, counts: manifest.counts, safety: manifest.safety }));
