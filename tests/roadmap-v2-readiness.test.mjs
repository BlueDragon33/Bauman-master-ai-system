import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadRoadmapReadiness } from "../roadmap_v2/readiness.mjs";

const packageRoot = path.resolve("roadmap_v2");

function snapshot(targetId, knowledgeState, phaseId = "GD2", options = {}) {
  return {
    schema: "BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1",
    targetId,
    phaseId,
    knowledgeState,
    existingCompetencyVerified: options.existingCompetencyVerified || false,
    dimensions: options.dimensions || {},
    persisted: options.persisted || false,
    ...(options.masterReadyGate ? { masterReadyGate: options.masterReadyGate } : {})
  };
}

function event(sequence, evidenceType, payload, targetId, phaseId = "GD2") {
  return {
    schema: "BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1",
    eventId: `${targetId}-EV-${sequence}`,
    streamId: `STREAM::${targetId}::${phaseId}`,
    sequence,
    targetId,
    phaseId,
    evidenceType,
    occurredAt: "2026-08-11T00:00:00Z",
    source: { kind: "test_fixture", ref: `${targetId}-${sequence}` },
    payload
  };
}

function fullEvidence(targetId, phaseId = "GD2") {
  const events = [
    event(1, "chapter_assessment", { percent: 85, criticalPercent: 75 }, targetId, phaseId),
    event(2, "exercise_set", { percent: 90, completedItems: 20, totalItems: 20 }, targetId, phaseId),
    event(3, "lab_or_simulation", { passed: true, explanationAccepted: true }, targetId, phaseId),
    event(4, "project_rubric", { rubric: { correctness: 3, clarity: 3, verification: 3, reproducibility: 3 } }, targetId, phaseId),
    event(5, "retention_check", { percent: 80, daysAfterLearning: 14 }, targetId, phaseId)
  ];
  if (["GD2", "GD3"].includes(phaseId) && !targetId.startsWith("RU-")) {
    events.push(event(6, "russian_technical_terms", { verifiedTermCount: 5 }, targetId, phaseId));
  }
  return events;
}

function item(targetId, masterySnapshot, options = {}) {
  const technicalTrack = options.technicalTrack === undefined ? "math" : options.technicalTrack;
  return {
    scheduleItemId: options.scheduleItemId || `ITEM::${targetId}`,
    priorityCandidate: {
      schema: "BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1",
      candidateId: options.candidateId || `PRIORITY::${targetId}`,
      targetId,
      phaseId: masterySnapshot.phaseId,
      masterRelevance: options.masterRelevance ?? 0.8,
      masterRelevanceSource: "L27 deterministic test fixture",
      weeksUntilNeeded: options.weeksUntilNeeded ?? 8,
      snapshot: masterySnapshot
    },
    activityKind: options.activityKind || "technical_core",
    estimatedMinutes: options.estimatedMinutes || 60,
    technicalTrack,
    russianTwinMinutes: options.russianTwinMinutes === undefined ? (technicalTrack === null ? null : 30) : options.russianTwinMinutes,
    dueDate: null,
    reviewRequested: options.reviewRequested || false,
    source: {
      kind: "registry_static",
      ref: `registry://${targetId}`,
      verified: true,
      masterModeRelation: options.masterModeRelation || "not_applicable"
    }
  };
}

function scheduleRequest(phaseId, items, options = {}) {
  return {
    schema: "BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1",
    requestId: options.requestId || `SCHEDULE::${phaseId}::READINESS`,
    phaseId,
    weekStart: "2026-08-17",
    weeklyCapacityMinutes: options.weeklyCapacityMinutes || 600,
    items
  };
}

function request(phaseId, focusTargetIds, items, options = {}) {
  return {
    schema: "BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1",
    reportId: options.reportId || `READINESS::${phaseId}`,
    phaseId,
    focusTargetIds,
    scheduleRequest: options.scheduleRequest || scheduleRequest(phaseId, items, options),
    externalGates: options.externalGates || []
  };
}

function diagnosticGate(satisfied = true, options = {}) {
  return {
    gateId: options.gateId || "EXT-DIAGNOSTIC-ENTRY",
    satisfied,
    sourceRef: options.sourceRef || "verified-diagnostic://entry/2026-08-11",
    verified: options.verified ?? true
  };
}

test("loads the pinned B107 disconnected Readiness harness", () => {
  const readiness = loadRoadmapReadiness();
  assert.equal(readiness.manifest.status, "PASS_B107_FAIL_CLOSED_READINESS_PROJECTION_HARNESS");
  assert.equal(readiness.manifest.counts.colors, 3);
  assert.equal(readiness.manifest.counts.readinessDimensions, 5);
  assert.equal(readiness.manifest.counts.persistentStores, 0);
  assert.equal(readiness.manifest.counts.dashboardUiRenders, 0);
  assert.equal(readiness.manifest.counts.runtimeWrites, 0);
});

test("fails closed red when focus mastery evidence is missing", () => {
  const readiness = loadRoadmapReadiness();
  const result = readiness.projectReadiness(request("GD2", ["MATH-L0-C01"], [], {
    externalGates: [diagnosticGate(true)]
  }));
  assert.equal(result.overallColor, "red");
  assert.equal(result.targets[0].masterySnapshotPresent, false);
  assert.equal(result.targets[0].reasonCodes.includes("FOCUS_MASTERY_EVIDENCE_MISSING"), true);
});

test("projects red for a blocking or unresolved external prerequisite", () => {
  const readiness = loadRoadmapReadiness();
  const progress = snapshot("MATH-L0-C01", "dang_hoc");
  const blocked = readiness.projectReadiness(request("GD2", ["MATH-L0-C01"], [item("MATH-L0-C01", progress)], {
    externalGates: [diagnosticGate(false)]
  }));
  assert.equal(blocked.targets[0].color, "red");
  assert.equal(blocked.targets[0].reasonCodes.includes("BLOCKING_PREREQUISITE_UNSATISFIED"), true);

  const missing = readiness.projectReadiness(request("GD2", ["MATH-L0-C01"], [item("MATH-L0-C01", progress)]));
  assert.equal(missing.targets[0].color, "red");
  assert.deepEqual(missing.targets[0].unresolvedExternalGateIds, ["EXT-DIAGNOSTIC-ENTRY"]);
});

test("projects yellow when prerequisites pass but mastery is incomplete", () => {
  const readiness = loadRoadmapReadiness();
  const progress = snapshot("MATH-L0-C01", "dang_hoc");
  const result = readiness.projectReadiness(request("GD2", ["MATH-L0-C01"], [item("MATH-L0-C01", progress)], {
    externalGates: [diagnosticGate(true)]
  }));
  assert.equal(result.overallColor, "yellow");
  assert.equal(result.targets[0].prerequisiteReady, true);
  assert.equal(result.targets[0].masterReady, false);
  assert.equal(result.targets[0].status, "prerequisite_ready_not_master_ready");
});

test("projects green only from a reducer-produced passed Master-ready gate", () => {
  const readiness = loadRoadmapReadiness();
  const complete = readiness.mastery.reduceEvidenceStream(fullEvidence("MATH-L0-C01"));
  const result = readiness.projectReadiness(request("GD2", ["MATH-L0-C01"], [item("MATH-L0-C01", complete)], {
    externalGates: [diagnosticGate(true)]
  }));
  assert.equal(result.overallColor, "green");
  assert.equal(result.targets[0].masterReady, true);
  assert.equal(result.targets[0].status, "master_ready");
});

test("rejects a bare master_ready claim by projecting red", () => {
  const readiness = loadRoadmapReadiness();
  const forged = snapshot("MATH-L0-C01", "master_ready");
  const result = readiness.projectReadiness(request("GD2", ["MATH-L0-C01"], [item("MATH-L0-C01", forged)], {
    externalGates: [diagnosticGate(true)]
  }));
  assert.equal(result.overallColor, "red");
  assert.equal(result.targets[0].masterReady, false);
  assert.equal(result.targets[0].reasonCodes.includes("MASTER_READY_GATE_UNVERIFIED"), true);
});

test("keeps Existing Competency prerequisite-ready distinct from green", () => {
  const readiness = loadRoadmapReadiness();
  const retained = snapshot("PY-L0-C01", "dat_prerequisite", "GD2", {
    existingCompetencyVerified: true,
    dimensions: {
      diagnostic: { scorePercent: 90, criticalPercent: 80 },
      retention: { percent: 80, daysAfterLearning: 14 }
    }
  });
  const result = readiness.projectReadiness(request("GD2", ["PY-L0-C01"], [item("PY-L0-C01", retained, {
    activityKind: "retention_review",
    reviewRequested: true
  })]));
  assert.equal(result.overallColor, "yellow");
  assert.equal(result.targets[0].masterReady, false);
});

test("keeps recommended prerequisites advisory and non-blocking", () => {
  const readiness = loadRoadmapReadiness();
  const complete = readiness.mastery.reduceEvidenceStream(fullEvidence("DB-L0-C01"));
  const result = readiness.projectReadiness(request("GD2", ["DB-L0-C01"], [item("DB-L0-C01", complete)]));
  assert.equal(result.overallColor, "green");
  assert.equal(result.targets[0].blockerCount, 0);
  assert.equal(result.targets[0].advisoryCount, 1);
  assert.equal(result.targets[0].reasonCodes.includes("ADVISORY_PREREQUISITES_PRESENT"), true);
});

test("projects an unscheduled Critical focus target red", () => {
  const readiness = loadRoadmapReadiness();
  const gap = snapshot("MATH-L2-C07", "gap");
  const result = readiness.projectReadiness(request("GD2", ["MATH-L2-C07"], [item("MATH-L2-C07", gap, {
    weeksUntilNeeded: 4
  })], { weeklyCapacityMinutes: 89 }));
  assert.equal(result.overallColor, "red");
  assert.equal(result.targets[0].critical, true);
  assert.equal(result.targets[0].criticalScheduled, false);
  assert.equal(result.targets[0].reasonCodes.includes("CRITICAL_TARGET_NOT_SCHEDULED"), true);
  assert.equal(result.counts.unscheduledCriticalTargets, 1);
});

test("aggregates target colors in red-yellow-green precedence", () => {
  const readiness = loadRoadmapReadiness();
  const greenSnapshot = readiness.mastery.reduceEvidenceStream(fullEvidence("PY-L0-C01"));
  const yellowSnapshot = snapshot("SYS-L0-C01", "dang_hoc");
  const items = [item("PY-L0-C01", greenSnapshot), item("SYS-L0-C01", yellowSnapshot, { technicalTrack: "other" })];
  const yellow = readiness.projectReadiness(request("GD2", ["PY-L0-C01", "SYS-L0-C01"], items));
  assert.equal(yellow.overallColor, "yellow");
  assert.deepEqual(yellow.counts, {
    targets: 2,
    red: 0,
    yellow: 1,
    green: 1,
    unresolvedExternalGates: 0,
    unscheduledCriticalTargets: 0
  });

  const red = readiness.projectReadiness(request("GD2", ["PY-L0-C01", "SYS-L0-C01", "RU-R0-C01"], items));
  assert.equal(red.overallColor, "red");
  assert.equal(red.counts.red, 1);
});

test("rejects unverified, unknown and duplicate external gates", () => {
  const readiness = loadRoadmapReadiness();
  const progress = snapshot("MATH-L0-C01", "dang_hoc");
  const baseItems = [item("MATH-L0-C01", progress)];
  assert.throws(() => readiness.projectReadiness(request("GD2", ["MATH-L0-C01"], baseItems, {
    externalGates: [diagnosticGate(true, { verified: false })]
  })), /Unverified Readiness external gate/);
  assert.throws(() => readiness.projectReadiness(request("GD2", ["MATH-L0-C01"], baseItems, {
    externalGates: [diagnosticGate(true, { gateId: "EXT-DOES-NOT-EXIST" })]
  })), /Unknown Readiness external gate/);
  assert.throws(() => readiness.projectReadiness(request("GD2", ["MATH-L0-C01"], baseItems, {
    externalGates: [diagnosticGate(true), diagnosticGate(false)]
  })), /Duplicate Readiness external gate/);
});

test("rejects empty, duplicate and unknown focus target sets", () => {
  const readiness = loadRoadmapReadiness();
  assert.throws(() => readiness.projectReadiness(request("GD2", [], [])), /focus targets must be non-empty/);
  assert.throws(() => readiness.projectReadiness(request("GD2", ["PY-L0-C01", "PY-L0-C01"], [])), /Duplicate Readiness focus target/);
  assert.throws(() => readiness.projectReadiness(request("GD2", ["DOES-NOT-EXIST"], [])), /Unknown Readiness focus target/);
});

test("rejects phase mismatch, caller Scheduler result and manual readiness fields", () => {
  const readiness = loadRoadmapReadiness();
  const mismatch = request("GD2", ["PY-L0-C01"], []);
  mismatch.scheduleRequest.phaseId = "GD3";
  assert.throws(() => readiness.projectReadiness(mismatch), /phase mismatch/);

  const supplied = request("GD2", ["PY-L0-C01"], []);
  supplied.schedulerResult = { sessions: [] };
  assert.throws(() => readiness.projectReadiness(supplied), /unsupported fields/);

  const colored = request("GD2", ["PY-L0-C01"], []);
  colored.overallColor = "green";
  assert.throws(() => readiness.projectReadiness(colored), /unsupported fields/);
});

test("rejects persisted mastery snapshots", () => {
  const readiness = loadRoadmapReadiness();
  const persisted = snapshot("PY-L0-C01", "dang_hoc", "GD2", { persisted: true });
  assert.throws(() => readiness.projectReadiness(request("GD2", ["PY-L0-C01"], [item("PY-L0-C01", persisted)])), /Persisted mastery snapshot admitted/);
});

test("returns deterministic deeply frozen non-persisted readiness projections", () => {
  const readiness = loadRoadmapReadiness();
  const progress = snapshot("PY-L0-C01", "dang_hoc");
  const input = request("GD2", ["PY-L0-C01"], [item("PY-L0-C01", progress)]);
  const first = readiness.projectReadiness(input);
  const second = readiness.projectReadiness(input);
  assert.deepEqual(first, second);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.targets), true);
  assert.equal(Object.isFrozen(first.targets[0]), true);
  assert.equal(first.persisted, false);
  assert.equal(first.dashboardUiRendered, false);
  assert.equal(first.runtimeWriteAllowed, false);
  assert.equal(first.notificationWriteAllowed, false);
  assert.throws(() => { first.overallColor = "green"; }, TypeError);
});

test("fails closed when a pinned Readiness file is tampered or missing", () => {
  const tampered = fs.mkdtempSync(path.join(os.tmpdir(), "bauman-readiness-tamper-"));
  try {
    fs.cpSync(packageRoot, tampered, { recursive: true });
    fs.appendFileSync(path.join(tampered, "readiness", "readiness-contract.json"), "\n");
    assert.throws(() => loadRoadmapReadiness({ baseDir: tampered }), /Readiness (byte count|hash) mismatch/);
  } finally {
    fs.rmSync(tampered, { recursive: true, force: true });
  }

  const missing = fs.mkdtempSync(path.join(os.tmpdir(), "bauman-readiness-missing-"));
  try {
    fs.cpSync(packageRoot, missing, { recursive: true });
    fs.rmSync(path.join(missing, "readiness", "readiness-result.schema.json"));
    assert.throws(() => loadRoadmapReadiness({ baseDir: missing }), /Missing Roadmap Readiness file/);
  } finally {
    fs.rmSync(missing, { recursive: true, force: true });
  }
});
