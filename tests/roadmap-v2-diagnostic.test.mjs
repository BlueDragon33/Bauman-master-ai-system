import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadRoadmapDiagnostic } from "../roadmap_v2/diagnostic.mjs";

const packageRoot = path.resolve("roadmap_v2");

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
    bankId: `BANK::${targetId}::TEST`,
    targetId,
    policyId: "DIAG-20-V1",
    reviewStatus: "verified",
    reviewedBy: "L23 deterministic test fixture",
    sourceProvenance: ["synthetic test fixture; never written to the production catalog"],
    items: difficulties.map((difficulty, index) => ({
      id: `ITEM-${String(index + 1).padStart(2, "0")}`,
      targetId,
      difficulty,
      critical: index < 10,
      prompt: `Deterministic test item ${index + 1}`,
      options: [
        { id: "A", text: "Correct fixture option" },
        { id: "B", text: "Incorrect fixture option" }
      ],
      correctOptionId: "A",
      rationale: "Deterministic fixture rationale.",
      prerequisiteRefs: ["MATH-L2-C05"],
      evidenceTags: ["test_fixture"],
      reviewStatus: "verified"
    }))
  };
}

function buildAttempt(planId, bank, wrongItemIds = []) {
  const wrong = new Set(wrongItemIds);
  return {
    schema: "BAUMAN_ROADMAP_V2_DIAGNOSTIC_ATTEMPT_V1",
    attemptId: "ATTEMPT::TEST",
    planId,
    bankId: bank.bankId,
    responses: bank.items.map((item) => ({
      itemId: item.id,
      selectedOptionId: wrong.has(item.id) ? "B" : "A"
    }))
  };
}

test("loads a pinned B91 diagnostic harness with every catalog plan blocked", () => {
  const diagnostic = loadRoadmapDiagnostic();
  assert.equal(diagnostic.manifest.status, "PASS_B91_ENGINE_CATALOG_BLOCKED_NO_ITEM_BANKS");
  assert.equal(diagnostic.catalog.counts.plans, 381);
  assert.equal(diagnostic.catalog.counts.verifiedItemBanks, 0);
  assert.equal(diagnostic.catalog.counts.executablePlans, 0);
  assert.equal(diagnostic.catalog.plans.every((plan) => plan.executionReady === false), true);
});

test("explains missing-bank readiness without fabricating content", () => {
  const diagnostic = loadRoadmapDiagnostic();
  const readiness = diagnostic.getReadiness("MATH-L2-C07");
  assert.equal(readiness.executionReady, false);
  assert.equal(readiness.executionStatus, "blocked_missing_verified_item_bank");
  assert.equal(readiness.itemBank.path, null);
  assert.equal(readiness.itemBank.verifiedItemCount, 0);
  assert.equal(readiness.reasonCodes.includes("MISSING_VERIFIED_ITEM_BANK"), true);
  assert.equal(diagnostic.getReadiness("DOES-NOT-EXIST"), null);
});

test("validates a reviewed 20-item proposed bank without mutating catalog readiness", () => {
  const diagnostic = loadRoadmapDiagnostic();
  const bank = buildBank();
  const validation = diagnostic.validateProposedItemBank("MATH-L2-C07", bank);
  assert.equal(validation.valid, true);
  assert.equal(validation.itemCount, 20);
  assert.deepEqual(validation.difficultyDistribution, { easy: 8, medium: 6, hard: 4, expert: 2 });
  assert.equal(validation.criticalItems, 10);
  assert.equal(validation.proposedBankHarnessOnly, true);
  assert.equal(validation.catalogExecutionReady, false);
  assert.equal(diagnostic.getReadiness("MATH-L2-C07").executionReady, false);
});

test("projects a proposed session without answer keys or rationales", () => {
  const diagnostic = loadRoadmapDiagnostic();
  const session = diagnostic.projectProposedSession("MATH-L2-C07", buildBank());
  assert.equal(session.items.length, 20);
  assert.equal(session.exposesAnswerKey, false);
  assert.equal(session.productionExecutable, false);
  assert.equal(session.persistenceAllowed, false);
  assert.equal(session.items.every((item) => item.correctOptionId === undefined), true);
  assert.equal(session.items.every((item) => item.rationale === undefined), true);
});

test("classifies a passing diagnostic as existing competency, never Master-ready", () => {
  const diagnostic = loadRoadmapDiagnostic();
  const plan = diagnostic.getPlan("MATH-L2-C07");
  const bank = buildBank();
  const result = diagnostic.evaluateProposedAttempt(plan.id, bank, buildAttempt(plan.id, bank));
  assert.equal(result.status, "existing_competency_verified");
  assert.equal(result.score.percent, 100);
  assert.equal(result.score.criticalPercent, 100);
  assert.equal(result.masterReady, false);
  assert.equal(result.persistable, false);
  assert.equal(result.reasonCodes.includes("DIAGNOSTIC_PASS_NOT_MASTER_READY"), true);
});

test("enforces the critical-item floor even when overall score reaches 80 percent", () => {
  const diagnostic = loadRoadmapDiagnostic();
  const plan = diagnostic.getPlan("MATH-L2-C07");
  const bank = buildBank();
  const result = diagnostic.evaluateProposedAttempt(
    plan.id,
    bank,
    buildAttempt(plan.id, bank, ["ITEM-01", "ITEM-02", "ITEM-03", "ITEM-04"])
  );
  assert.equal(result.score.percent, 80);
  assert.equal(result.score.criticalPercent, 60);
  assert.equal(result.status, "critical_gap");
  assert.equal(result.reasonCodes.includes("CRITICAL_ITEM_FLOOR_NOT_MET"), true);
  assert.equal(result.masterReady, false);
});

test("classifies scores below threshold as a gap with prerequisite evidence", () => {
  const diagnostic = loadRoadmapDiagnostic();
  const plan = diagnostic.getPlan("MATH-L2-C07");
  const bank = buildBank();
  const result = diagnostic.evaluateProposedAttempt(
    plan.id,
    bank,
    buildAttempt(plan.id, bank, ["ITEM-01", "ITEM-02", "ITEM-03", "ITEM-04", "ITEM-11"])
  );
  assert.equal(result.score.percent, 75);
  assert.equal(result.status, "gap");
  assert.deepEqual(result.gapPrerequisiteRefs, ["MATH-L2-C05"]);
  assert.equal(result.masterReady, false);
});

test("rejects unreviewed, wrongly distributed and non-critical banks", () => {
  const diagnostic = loadRoadmapDiagnostic();

  const unreviewed = buildBank();
  unreviewed.reviewStatus = "draft";
  assert.equal(diagnostic.validateProposedItemBank("MATH-L2-C07", unreviewed).errors.includes("BANK_NOT_VERIFIED"), true);

  const wrongDistribution = buildBank();
  wrongDistribution.items[0].difficulty = "expert";
  assert.equal(diagnostic.validateProposedItemBank("MATH-L2-C07", wrongDistribution).errors.includes("DIFFICULTY_DISTRIBUTION_MISMATCH"), true);

  const noCritical = buildBank();
  for (const item of noCritical.items) item.critical = false;
  assert.equal(diagnostic.validateProposedItemBank("MATH-L2-C07", noCritical).errors.includes("NO_CRITICAL_ITEMS"), true);
});

test("rejects target drift and unknown prerequisite references", () => {
  const diagnostic = loadRoadmapDiagnostic();
  const targetDrift = buildBank("MATH-L2-C06");
  assert.equal(diagnostic.validateProposedItemBank("MATH-L2-C07", targetDrift).errors.includes("TARGET_MISMATCH"), true);

  const badPrerequisite = buildBank();
  badPrerequisite.items[0].prerequisiteRefs = ["DOES-NOT-EXIST"];
  assert.equal(diagnostic.validateProposedItemBank("MATH-L2-C07", badPrerequisite).errors.includes("UNKNOWN_PREREQUISITE_REF:DOES-NOT-EXIST"), true);
});

test("rejects incomplete, duplicate and unknown-option responses", () => {
  const diagnostic = loadRoadmapDiagnostic();
  const plan = diagnostic.getPlan("MATH-L2-C07");
  const bank = buildBank();

  const incomplete = buildAttempt(plan.id, bank);
  incomplete.responses.pop();
  assert.throws(() => diagnostic.evaluateProposedAttempt(plan.id, bank, incomplete), /Every verified diagnostic item/);

  const duplicate = buildAttempt(plan.id, bank);
  duplicate.responses[19] = { ...duplicate.responses[0] };
  assert.throws(() => diagnostic.evaluateProposedAttempt(plan.id, bank, duplicate), /Duplicate diagnostic response/);

  const unknownOption = buildAttempt(plan.id, bank);
  unknownOption.responses[0].selectedOptionId = "UNKNOWN";
  assert.throws(() => diagnostic.evaluateProposedAttempt(plan.id, bank, unknownOption), /Unknown diagnostic option/);
});

test("returns deep-frozen plans, sessions and results", () => {
  const diagnostic = loadRoadmapDiagnostic();
  const plan = diagnostic.getPlan("MATH-L2-C07");
  const bank = buildBank();
  const session = diagnostic.projectProposedSession(plan.id, bank);
  const result = diagnostic.evaluateProposedAttempt(plan.id, bank, buildAttempt(plan.id, bank));
  assert.equal(Object.isFrozen(diagnostic), true);
  assert.equal(Object.isFrozen(plan), true);
  assert.equal(Object.isFrozen(session), true);
  assert.equal(Object.isFrozen(session.items), true);
  assert.equal(Object.isFrozen(result), true);
  assert.throws(() => session.items.push({}), TypeError);
  assert.throws(() => { result.status = "master_ready"; }, TypeError);
});

test("fails closed when the diagnostic catalog is tampered", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "bauman-diagnostic-tamper-"));
  try {
    fs.cpSync(packageRoot, temp, { recursive: true });
    fs.appendFileSync(path.join(temp, "diagnostic", "catalog.json"), "\n");
    assert.throws(() => loadRoadmapDiagnostic({ baseDir: temp }), /diagnostic (byte count|hash) mismatch/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test("fails closed when a required diagnostic file is missing", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "bauman-diagnostic-missing-"));
  try {
    fs.cpSync(packageRoot, temp, { recursive: true });
    fs.rmSync(path.join(temp, "diagnostic", "attempt.schema.json"));
    assert.throws(() => loadRoadmapDiagnostic({ baseDir: temp }), /Missing Roadmap diagnostic file/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
