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

const mastery = loadRoadmapMastery();

const diagnosticPass = mastery.reduceEvidenceStream([
  event(1, "diagnostic_result", {
    status: "existing_competency_verified",
    scorePercent: 100,
    criticalPercent: 100,
    masterReady: false,
    persistable: false
  })
]);
assert(diagnosticPass.knowledgeState === "dat_prerequisite", "Diagnostic pass state drift");
assert(diagnosticPass.existingCompetencyVerified === true, "Existing competency flag missing");
assert(diagnosticPass.prerequisiteEligible === true, "Diagnostic pass should satisfy prerequisite gate");
assert(diagnosticPass.masterReadyGate.passed === false, "Diagnostic pass granted Master-ready");

const diagnosticGap = mastery.reduceEvidenceStream([
  event(1, "diagnostic_result", {
    status: "critical_gap",
    scorePercent: 80,
    criticalPercent: 60,
    masterReady: false,
    persistable: false
  })
]);
assert(diagnosticGap.knowledgeState === "gap", "Diagnostic gap state drift");
assert(diagnosticGap.prerequisiteEligible === false, "Diagnostic gap satisfies prerequisite gate");

const stream = [
  event(1, "chapter_assessment", { percent: 88, criticalPercent: 80 }),
  event(2, "exercise_set", { percent: 90, completedItems: 20, totalItems: 20 }),
  event(3, "lab_or_simulation", { passed: true, explanationAccepted: true }),
  event(4, "project_rubric", { rubric: { correctness: 3, clarity: 3, verification: 4, reproducibility: 3 } }),
  event(5, "retention_check", { percent: 80, daysAfterLearning: 14 })
];
const masterReady = mastery.reduceEvidenceStream(stream);
assert(masterReady.knowledgeState === "master_ready", "Complete evidence did not grant Master-ready");
assert(masterReady.masterReadyGate.passed === true, "Master-ready gate did not pass");
assert(masterReady.prerequisiteEligible === true, "Master-ready target is not prerequisite eligible");
assert(masterReady.persisted === false, "Reducer persisted a snapshot");

const replay = mastery.reduceEvidenceStream(structuredClone(stream));
assert(JSON.stringify(masterReady) === JSON.stringify(replay), "Mastery reducer replay is not deterministic");

console.log(JSON.stringify({
  status: "PASS_B94_APPEND_ONLY_REDUCER",
  diagnosticPassState: diagnosticPass.knowledgeState,
  diagnosticPassMasterReady: diagnosticPass.masterReadyGate.passed,
  diagnosticGapState: diagnosticGap.knowledgeState,
  completeEvidenceState: masterReady.knowledgeState,
  completeEvidenceGatePassed: masterReady.masterReadyGate.passed,
  deterministicReplay: true,
  persistedSnapshots: 0
}));
