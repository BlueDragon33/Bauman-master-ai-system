import { loadRoadmapMastery } from "../roadmap_v2/mastery.mjs";

function event(sequence, evidenceType, payload, overrides = {}) {
  return {
    schema: "BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1",
    eventId: `EV-${sequence}`,
    streamId: "STREAM::MATH-L2-C07::GD0",
    sequence,
    targetId: "MATH-L2-C07",
    phaseId: "GD0",
    evidenceType,
    occurredAt: `2026-08-${String(10 + sequence).padStart(2, "0")}T00:00:00Z`,
    source: { kind: "validator_fixture", ref: `FIXTURE-${sequence}` },
    payload,
    ...overrides
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function snapshot(targetId, knowledgeState) {
  return {
    schema: "BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1",
    targetId,
    knowledgeState,
    persisted: false
  };
}

const mastery = loadRoadmapMastery();

const gd2Base = [
  event(1, "chapter_assessment", { percent: 85, criticalPercent: 75 }, { phaseId: "GD2", streamId: "STREAM::MATH-L2-C07::GD2" }),
  event(2, "exercise_set", { percent: 90, completedItems: 20, totalItems: 20 }, { phaseId: "GD2", streamId: "STREAM::MATH-L2-C07::GD2" }),
  event(3, "lab_or_simulation", { passed: true, explanationAccepted: true }, { phaseId: "GD2", streamId: "STREAM::MATH-L2-C07::GD2" }),
  event(4, "project_rubric", { rubric: { correctness: 3, clarity: 3, verification: 3, reproducibility: 3 } }, { phaseId: "GD2", streamId: "STREAM::MATH-L2-C07::GD2" }),
  event(5, "retention_check", { percent: 75, daysAfterLearning: 21 }, { phaseId: "GD2", streamId: "STREAM::MATH-L2-C07::GD2" })
];

const missingRussian = mastery.reduceEvidenceStream(gd2Base);
assert(missingRussian.masterReadyGate.russianTermsRequired === true, "GD2 technical target did not require Russian terms");
assert(missingRussian.masterReadyGate.checks.russianTechnicalTerms === false, "Missing Russian terms passed gate");
assert(missingRussian.knowledgeState === "dat_prerequisite", "Missing Russian terms should remain prerequisite-ready only");

const withRussian = mastery.reduceEvidenceStream([
  ...gd2Base,
  event(6, "russian_technical_terms", { verifiedTermCount: 5 }, { phaseId: "GD2", streamId: "STREAM::MATH-L2-C07::GD2" })
]);
assert(withRussian.knowledgeState === "master_ready", "GD2 complete evidence did not pass Master-ready");
assert(withRussian.masterReadyGate.passed === true, "GD2 Master-ready gate did not pass");

const retentionDue = mastery.reduceEvidenceStream([
  ...gd2Base,
  event(6, "russian_technical_terms", { verifiedTermCount: 5 }, { phaseId: "GD2", streamId: "STREAM::MATH-L2-C07::GD2" }),
  event(7, "retention_check", { percent: 70, daysAfterLearning: 21 }, { phaseId: "GD2", streamId: "STREAM::MATH-L2-C07::GD2" })
]);
assert(retentionDue.knowledgeState === "can_on", "Failed later retention did not move target to can_on");

const mlGateBlocked = mastery.evaluatePrerequisiteGate("ML-L2-C04", [
  snapshot("MATH-L2-C07", "dat_prerequisite"),
  snapshot("PY-L2-C04", "master_ready")
]);
assert(mlGateBlocked.ready === false, "Missing blocking prerequisite did not block target");
assert(mlGateBlocked.blockers.some((item) => item.from === "PY-L2-C05"), "Expected PY-L2-C05 blocker missing");

const mlGateReady = mastery.evaluatePrerequisiteGate("ML-L2-C04", [
  snapshot("MATH-L2-C07", "dat_prerequisite"),
  snapshot("PY-L2-C04", "master_ready"),
  snapshot("PY-L2-C05", "dat_prerequisite")
]);
assert(mlGateReady.ready === true, "Satisfied blocking prerequisites did not open target");

const recommendedOnly = mastery.evaluatePrerequisiteGate("PY-L2-C05", []);
assert(recommendedOnly.ready === true, "Recommended prerequisites blocked target");
assert(recommendedOnly.advisory.length === 2, "Recommended prerequisites were not reported as advisory");

const alternativeBlocked = mastery.evaluatePrerequisiteGate("MATH-L0-C02", []);
assert(alternativeBlocked.ready === false, "Unsatisfied any-of group did not block target");
const alternativeInternal = mastery.evaluatePrerequisiteGate("MATH-L0-C02", [snapshot("MATH-L0-C01", "dat_prerequisite")]);
assert(alternativeInternal.ready === true, "Internal any-of alternative did not open target");
const alternativeExternal = mastery.evaluatePrerequisiteGate("MATH-L0-C02", [], { "EXT-EXISTING-COMPETENCY-CONFIRMED": true });
assert(alternativeExternal.ready === true, "External any-of alternative did not open target");

const externalBlocked = mastery.evaluatePrerequisiteGate("RU-R3-C08", [snapshot("RU-R3-C07", "master_ready")]);
assert(externalBlocked.ready === false, "Missing external blocking gate did not block target");
assert(externalBlocked.unresolvedExternalGateIds.includes("EXT-COMPLETE-TECHNICAL-PROJECT"), "Unresolved external gate was hidden");
const externalReady = mastery.evaluatePrerequisiteGate("RU-R3-C08", [snapshot("RU-R3-C07", "master_ready")], { "EXT-COMPLETE-TECHNICAL-PROJECT": true });
assert(externalReady.ready === true, "Satisfied external gate did not open target");

console.log(JSON.stringify({
  status: "PASS_B95_MASTERY_PREREQUISITE_GATES",
  gd2WithoutRussianState: missingRussian.knowledgeState,
  gd2WithRussianState: withRussian.knowledgeState,
  retentionDueState: retentionDue.knowledgeState,
  blockingPrerequisiteReady: mlGateReady.ready,
  recommendedOnlyReady: recommendedOnly.ready,
  anyOfInternalReady: alternativeInternal.ready,
  anyOfExternalReady: alternativeExternal.ready,
  externalGateExplicit: externalBlocked.unresolvedExternalGateIds.length > 0,
  persistedSnapshots: 0
}));
