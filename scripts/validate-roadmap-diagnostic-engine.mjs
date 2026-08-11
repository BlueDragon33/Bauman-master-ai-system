import { loadRoadmapDiagnostic } from "../roadmap_v2/diagnostic.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function buildBank(targetId = "MATH-L2-C07") {
  const difficulties = [
    ...Array(8).fill("easy"),
    ...Array(6).fill("medium"),
    ...Array(4).fill("hard"),
    ...Array(2).fill("expert")
  ];
  return {
    schema: "BAUMAN_ROADMAP_V2_DIAGNOSTIC_ITEM_BANK_V1",
    version: 1,
    bankId: `BANK::${targetId}::FIXTURE`,
    targetId,
    policyId: "DIAG-20-V1",
    reviewStatus: "verified",
    reviewedBy: "L23 deterministic validator fixture",
    sourceProvenance: ["synthetic validator fixture; never written to the production catalog"],
    items: difficulties.map((difficulty, index) => ({
      id: `ITEM-${String(index + 1).padStart(2, "0")}`,
      targetId,
      difficulty,
      critical: index < 10,
      prompt: `Deterministic validation item ${index + 1}`,
      options: [
        { id: "A", text: "Correct fixture option" },
        { id: "B", text: "Incorrect fixture option" }
      ],
      correctOptionId: "A",
      rationale: "Deterministic fixture rationale.",
      prerequisiteRefs: ["MATH-L2-C05"],
      evidenceTags: ["validator_fixture"],
      reviewStatus: "verified"
    }))
  };
}

function buildAttempt(planId, bank, wrongItemIds = []) {
  const wrong = new Set(wrongItemIds);
  return {
    schema: "BAUMAN_ROADMAP_V2_DIAGNOSTIC_ATTEMPT_V1",
    attemptId: "ATTEMPT::FIXTURE",
    planId,
    bankId: bank.bankId,
    responses: bank.items.map((item) => ({
      itemId: item.id,
      selectedOptionId: wrong.has(item.id) ? "B" : "A"
    }))
  };
}

const diagnostic = loadRoadmapDiagnostic();
const plan = diagnostic.getPlan("MATH-L2-C07");
const bank = buildBank();
const validation = diagnostic.validateProposedItemBank(plan.id, bank);
assert(validation.valid, `Verified fixture bank rejected: ${validation.errors.join(", ")}`);
assert(validation.proposedBankHarnessOnly === true, "Proposed bank escaped harness-only boundary");
assert(validation.catalogExecutionReady === false, "Catalog became executable through proposed-bank validation");

const session = diagnostic.projectProposedSession(plan.id, bank);
assert(session.items.length === 20, "Session projection item count drift");
assert(session.exposesAnswerKey === false, "Session projection exposes answer key");
assert(session.items.every((item) => item.correctOptionId === undefined && item.rationale === undefined), "Session projection leaks answer data");
assert(session.productionExecutable === false && session.persistenceAllowed === false, "Session projection escaped harness boundary");

const pass = diagnostic.evaluateProposedAttempt(plan.id, bank, buildAttempt(plan.id, bank));
assert(pass.status === "existing_competency_verified", "Passing diagnostic semantic drift");
assert(pass.score.percent === 100 && pass.score.criticalPercent === 100, "Passing score drift");
assert(pass.masterReady === false && pass.persistable === false, "Diagnostic pass grants forbidden evidence");

const criticalFail = diagnostic.evaluateProposedAttempt(
  plan.id,
  bank,
  buildAttempt(plan.id, bank, ["ITEM-01", "ITEM-02", "ITEM-03", "ITEM-04"])
);
assert(criticalFail.score.percent === 80, "Critical-floor fixture overall score drift");
assert(criticalFail.score.criticalPercent === 60, "Critical-floor fixture critical score drift");
assert(criticalFail.status === "critical_gap", "Critical floor failure classification drift");

const gap = diagnostic.evaluateProposedAttempt(
  plan.id,
  bank,
  buildAttempt(plan.id, bank, ["ITEM-01", "ITEM-02", "ITEM-03", "ITEM-04", "ITEM-11"])
);
assert(gap.score.percent === 75, "Gap fixture score drift");
assert(gap.status === "gap", "Gap classification drift");
assert(gap.gapPrerequisiteRefs.includes("MATH-L2-C05"), "Gap prerequisite evidence missing");

assert(diagnostic.getReadiness(plan.id).executionReady === false, "Proposed bank mutated catalog readiness");
assert(diagnostic.catalog.counts.verifiedItemBanks === 0 && diagnostic.catalog.counts.executablePlans === 0, "Proposed bank mutated catalog counts");

console.log(JSON.stringify({
  status: "PASS_B91_DIAGNOSTIC_ENGINE_HARNESS",
  catalogPlans: diagnostic.catalog.counts.plans,
  catalogExecutablePlans: 0,
  proposedBankValid: true,
  projectedItems: session.items.length,
  passOutcome: pass.status,
  criticalFloorOutcome: criticalFail.status,
  gapOutcome: gap.status,
  masterReadyOutcomes: 0,
  persistedResults: 0
}));
