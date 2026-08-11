import { loadRoadmapReadiness } from "../roadmap_v2/readiness.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function snapshot(targetId, knowledgeState) {
  return {
    schema: "BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1",
    targetId,
    phaseId: "GD2",
    knowledgeState,
    existingCompetencyVerified: false,
    dimensions: {},
    persisted: false
  };
}

function event(sequence, evidenceType, payload, targetId = "MATH-L0-C01") {
  return {
    schema: "BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1",
    eventId: `${targetId}-EV-${sequence}`,
    streamId: `STREAM::${targetId}::GD2`,
    sequence,
    targetId,
    phaseId: "GD2",
    evidenceType,
    occurredAt: "2026-08-11T00:00:00Z",
    source: { kind: "validator_fixture", ref: `${targetId}-${sequence}` },
    payload
  };
}

function fullEvidence(targetId = "MATH-L0-C01") {
  return [
    event(1, "chapter_assessment", { percent: 85, criticalPercent: 75 }, targetId),
    event(2, "exercise_set", { percent: 90, completedItems: 20, totalItems: 20 }, targetId),
    event(3, "lab_or_simulation", { passed: true, explanationAccepted: true }, targetId),
    event(4, "project_rubric", { rubric: { correctness: 3, clarity: 3, verification: 3, reproducibility: 3 } }, targetId),
    event(5, "retention_check", { percent: 80, daysAfterLearning: 14 }, targetId),
    event(6, "russian_technical_terms", { verifiedTermCount: 5 }, targetId)
  ];
}

function scheduleRequest(masterySnapshot) {
  const targetId = "MATH-L0-C01";
  return {
    schema: "BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1",
    requestId: `SCHEDULE::READINESS::${masterySnapshot.knowledgeState}`,
    phaseId: "GD2",
    weekStart: "2026-08-17",
    weeklyCapacityMinutes: 90,
    items: [{
      scheduleItemId: `ITEM::${targetId}`,
      priorityCandidate: {
        schema: "BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1",
        candidateId: `PRIORITY::${targetId}::${masterySnapshot.knowledgeState}`,
        targetId,
        phaseId: "GD2",
        masterRelevance: 0.8,
        masterRelevanceSource: "L27 deterministic validator fixture",
        weeksUntilNeeded: 8,
        snapshot: masterySnapshot
      },
      activityKind: "technical_core",
      estimatedMinutes: 60,
      technicalTrack: "math",
      russianTwinMinutes: 30,
      dueDate: null,
      reviewRequested: false,
      source: {
        kind: "registry_static",
        ref: `registry://${targetId}`,
        verified: true,
        masterModeRelation: "not_applicable"
      }
    }]
  };
}

function readinessRequest(masterySnapshot, gateSatisfied) {
  return {
    schema: "BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1",
    reportId: `READINESS::${masterySnapshot.knowledgeState}::${gateSatisfied}`,
    phaseId: "GD2",
    focusTargetIds: ["MATH-L0-C01"],
    scheduleRequest: scheduleRequest(masterySnapshot),
    externalGates: [{
      gateId: "EXT-DIAGNOSTIC-ENTRY",
      satisfied: gateSatisfied,
      sourceRef: "verified-diagnostic://entry/2026-08-11",
      verified: true
    }]
  };
}

const readiness = loadRoadmapReadiness();
const inProgress = snapshot("MATH-L0-C01", "dang_hoc");
const complete = readiness.mastery.reduceEvidenceStream(fullEvidence());
const red = readiness.projectReadiness(readinessRequest(inProgress, false));
const yellow = readiness.projectReadiness(readinessRequest(inProgress, true));
const green = readiness.projectReadiness(readinessRequest(complete, true));

assert(red.overallColor === "red" && red.targets[0].prerequisiteReady === false, "Blocked prerequisite did not project red");
assert(yellow.overallColor === "yellow" && yellow.targets[0].status === "prerequisite_ready_not_master_ready", "Prerequisite-ready target did not project yellow");
assert(green.overallColor === "green" && green.targets[0].masterReady === true, "Master-ready target did not project green");
assert(JSON.stringify(green) === JSON.stringify(readiness.projectReadiness(readinessRequest(complete, true))), "Readiness projection is not deterministic");
assert(Object.isFrozen(green) && Object.isFrozen(green.targets) && Object.isFrozen(green.targets[0]), "Readiness projection is mutable");
assert(green.persisted === false && green.dashboardUiRendered === false && green.runtimeWriteAllowed === false && green.notificationWriteAllowed === false, "Readiness projection escaped the disconnected harness");

console.log(JSON.stringify({
  status: "PASS_B106_READ_ONLY_READINESS_PROJECTOR",
  colors: [red.overallColor, yellow.overallColor, green.overallColor],
  missingGateFailsClosed: true,
  deterministic: true,
  persistentSnapshots: 0,
  dashboardUiRenders: 0,
  runtimeWrites: 0,
  notificationWrites: 0
}));
