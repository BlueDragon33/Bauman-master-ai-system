import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadRoadmapMastery } from "../roadmap_v2/mastery.mjs";

const packageRoot = path.resolve("roadmap_v2");

function event(sequence, evidenceType, payload, overrides = {}) {
  const targetId = overrides.targetId || "MATH-L2-C07";
  const phaseId = overrides.phaseId || "GD0";
  return {
    schema: "BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1",
    eventId: overrides.eventId || `EV-${sequence}`,
    streamId: overrides.streamId || `STREAM::${targetId}::${phaseId}`,
    sequence,
    targetId,
    phaseId,
    evidenceType,
    occurredAt: "2026-08-11T00:00:00Z",
    source: { kind: "test_fixture", ref: `FIXTURE-${sequence}` },
    payload
  };
}

function fullEvidence(phaseId = "GD0", targetId = "MATH-L2-C07") {
  const overrides = { phaseId, targetId };
  const events = [
    event(1, "chapter_assessment", { percent: 85, criticalPercent: 75 }, overrides),
    event(2, "exercise_set", { percent: 90, completedItems: 20, totalItems: 20 }, overrides),
    event(3, "lab_or_simulation", { passed: true, explanationAccepted: true }, overrides),
    event(4, "project_rubric", { rubric: { correctness: 3, clarity: 3, verification: 3, reproducibility: 3 } }, overrides),
    event(5, "retention_check", { percent: 80, daysAfterLearning: 14 }, overrides)
  ];
  if (["GD2", "GD3"].includes(phaseId) && !targetId.startsWith("RU-")) {
    events.push(event(6, "russian_technical_terms", { verifiedTermCount: 5 }, overrides));
  }
  return events;
}

function snapshot(targetId, knowledgeState) {
  return {
    schema: "BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1",
    targetId,
    knowledgeState,
    persisted: false
  };
}

test("loads the pinned B95 in-memory mastery harness", () => {
  const mastery = loadRoadmapMastery();
  assert.equal(mastery.manifest.status, "PASS_B95_MASTERY_PREREQUISITE_HARNESS");
  assert.equal(mastery.manifest.counts.catalogTargets, 381);
  assert.equal(mastery.manifest.counts.persistentStores, 0);
  assert.equal(mastery.manifest.safety.persistentStoreWrites, 0);
  assert.equal(mastery.manifest.safety.priorityEngineWrites, 0);
  assert.equal(mastery.manifest.safety.runtimeWrites, 0);
});

test("diagnostic pass verifies prerequisite competency but never Master-ready", () => {
  const mastery = loadRoadmapMastery();
  const result = mastery.reduceEvidenceStream([
    event(1, "diagnostic_result", {
      status: "existing_competency_verified",
      scorePercent: 100,
      criticalPercent: 100,
      masterReady: false,
      persistable: false
    })
  ]);
  assert.equal(result.knowledgeState, "dat_prerequisite");
  assert.equal(result.existingCompetencyVerified, true);
  assert.equal(result.prerequisiteEligible, true);
  assert.equal(result.masterReadyGate.passed, false);
  assert.equal(result.persisted, false);
});

test("diagnostic gap blocks prerequisite readiness until later learning evidence", () => {
  const mastery = loadRoadmapMastery();
  const result = mastery.reduceEvidenceStream([
    event(1, "diagnostic_result", {
      status: "critical_gap",
      scorePercent: 80,
      criticalPercent: 60,
      masterReady: false,
      persistable: false
    })
  ]);
  assert.equal(result.knowledgeState, "gap");
  assert.equal(result.prerequisiteEligible, false);

  const progressed = mastery.reduceEvidenceStream([
    event(1, "diagnostic_result", {
      status: "gap",
      scorePercent: 60,
      criticalPercent: 50,
      masterReady: false,
      persistable: false
    }),
    event(2, "chapter_assessment", { percent: 85, criticalPercent: 75 })
  ]);
  assert.equal(progressed.knowledgeState, "dat_prerequisite");
});

test("rejects diagnostic events that claim persistence or Master-ready", () => {
  const mastery = loadRoadmapMastery();
  assert.throws(() => mastery.reduceEvidenceStream([
    event(1, "diagnostic_result", {
      status: "existing_competency_verified",
      scorePercent: 100,
      criticalPercent: 100,
      masterReady: true,
      persistable: false
    })
  ]), /grants Master-ready/);
  assert.throws(() => mastery.reduceEvidenceStream([
    event(1, "diagnostic_result", {
      status: "existing_competency_verified",
      scorePercent: 100,
      criticalPercent: 100,
      masterReady: false,
      persistable: true
    })
  ]), /marked persistable/);
});

test("grants Master-ready only when every GD0 evidence gate passes", () => {
  const mastery = loadRoadmapMastery();
  const result = mastery.reduceEvidenceStream(fullEvidence());
  assert.equal(result.knowledgeState, "master_ready");
  assert.equal(result.masterReadyGate.passed, true);
  assert.equal(result.masterReadyGate.russianTermsRequired, false);
  assert.equal(Object.values(result.masterReadyGate.checks).every(Boolean), true);
});

test("requires Russian technical terms for non-Russian GD2/GD3 targets", () => {
  const mastery = loadRoadmapMastery();
  const withoutTerms = mastery.reduceEvidenceStream(fullEvidence("GD2").slice(0, 5));
  assert.equal(withoutTerms.knowledgeState, "dat_prerequisite");
  assert.equal(withoutTerms.masterReadyGate.russianTermsRequired, true);
  assert.equal(withoutTerms.masterReadyGate.checks.russianTechnicalTerms, false);

  const withTerms = mastery.reduceEvidenceStream(fullEvidence("GD2"));
  assert.equal(withTerms.knowledgeState, "master_ready");
  assert.equal(withTerms.masterReadyGate.checks.russianTechnicalTerms, true);

  const russianTarget = mastery.reduceEvidenceStream(fullEvidence("GD3", "RU-R3-C07"));
  assert.equal(russianTarget.masterReadyGate.russianTermsRequired, false);
  assert.equal(russianTarget.knowledgeState, "master_ready");
});

test("moves previously complete evidence to can_on when retention fails", () => {
  const mastery = loadRoadmapMastery();
  const events = fullEvidence();
  events.push(event(6, "retention_check", { percent: 70, daysAfterLearning: 21 }));
  const result = mastery.reduceEvidenceStream(events);
  assert.equal(result.knowledgeState, "can_on");
  assert.equal(result.masterReadyGate.checks.retention, false);
  assert.equal(result.prerequisiteEligible, false);
  assert.equal(result.transitions.some((item) => item.from === "master_ready" && item.to === "can_on"), true);
});

test("blocks Master-ready on incomplete exercise, lab explanation or project rubric", () => {
  const mastery = loadRoadmapMastery();

  const exercise = fullEvidence();
  exercise[1] = event(2, "exercise_set", { percent: 90, completedItems: 19, totalItems: 20 });
  assert.equal(mastery.reduceEvidenceStream(exercise).masterReadyGate.checks.exercise, false);

  const lab = fullEvidence();
  lab[2] = event(3, "lab_or_simulation", { passed: true, explanationAccepted: false });
  assert.equal(mastery.reduceEvidenceStream(lab).masterReadyGate.checks.labOrSimulation, false);

  const project = fullEvidence();
  project[3] = event(4, "project_rubric", { rubric: { correctness: 3, clarity: 2, verification: 3, reproducibility: 3 } });
  assert.equal(mastery.reduceEvidenceStream(project).masterReadyGate.checks.projectRubric, false);
});

test("gap override blocks and a later explicit clear restores the derived gate", () => {
  const mastery = loadRoadmapMastery();
  const base = fullEvidence();
  const active = mastery.reduceEvidenceStream([
    ...base,
    event(6, "gap_override", { active: true, reason: "manual critical gap" })
  ]);
  assert.equal(active.knowledgeState, "gap");
  assert.equal(active.masterReadyGate.checks.noGapOverride, false);

  const cleared = mastery.reduceEvidenceStream([
    ...base,
    event(6, "gap_override", { active: true, reason: "manual critical gap" }),
    event(7, "gap_override", { active: false, reason: "gap resolved with reviewed evidence" })
  ]);
  assert.equal(cleared.knowledgeState, "master_ready");
  assert.equal(cleared.masterReadyGate.passed, true);
});

test("rejects duplicate IDs, non-monotonic sequence and stream identity drift", () => {
  const mastery = loadRoadmapMastery();
  const duplicate = [
    event(1, "chapter_assessment", { percent: 80, criticalPercent: 70 }),
    event(2, "exercise_set", { percent: 80, completedItems: 20, totalItems: 20 }, { eventId: "EV-1" })
  ];
  assert.throws(() => mastery.reduceEvidenceStream(duplicate), /Duplicate evidence event ID/);

  assert.throws(() => mastery.reduceEvidenceStream([
    event(2, "chapter_assessment", { percent: 80, criticalPercent: 70 })
  ]), /Non-monotonic evidence sequence/);

  assert.throws(() => mastery.reduceEvidenceStream([
    event(1, "chapter_assessment", { percent: 80, criticalPercent: 70 }),
    event(2, "exercise_set", { percent: 80, completedItems: 20, totalItems: 20 }, { targetId: "MATH-L2-C06" })
  ]), /stream ID changed|target changed/);

  assert.throws(() => mastery.reduceEvidenceStream([
    event(1, "chapter_assessment", { percent: 80, criticalPercent: 70 }),
    event(2, "exercise_set", { percent: 80, completedItems: 20, totalItems: 20 }, { phaseId: "GD2" })
  ]), /stream ID changed|phase changed/);
});

test("rejects invalid scores, counts and unknown targets", () => {
  const mastery = loadRoadmapMastery();
  assert.throws(() => mastery.reduceEvidenceStream([
    event(1, "chapter_assessment", { percent: 101, criticalPercent: 70 })
  ]), /between 0 and 100/);
  assert.throws(() => mastery.reduceEvidenceStream([
    event(1, "exercise_set", { percent: 80, completedItems: 21, totalItems: 20 })
  ]), /exceeds total/);
  assert.throws(() => mastery.reduceEvidenceStream([
    event(1, "chapter_assessment", { percent: 80, criticalPercent: 70 }, { targetId: "DOES-NOT-EXIST" })
  ]), /Unknown mastery target/);
});

test("replays deterministically and returns deeply frozen snapshots", () => {
  const mastery = loadRoadmapMastery();
  const events = fullEvidence();
  const first = mastery.reduceEvidenceStream(events);
  const second = mastery.reduceEvidenceStream(structuredClone(events));
  assert.deepEqual(first, second);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.dimensions), true);
  assert.equal(Object.isFrozen(first.transitions), true);
  assert.throws(() => { first.knowledgeState = "gap"; }, TypeError);
});

test("blocks missing required prerequisites and opens when all are satisfied", () => {
  const mastery = loadRoadmapMastery();
  const blocked = mastery.evaluatePrerequisiteGate("ML-L2-C04", [
    snapshot("MATH-L2-C07", "dat_prerequisite"),
    snapshot("PY-L2-C04", "master_ready")
  ]);
  assert.equal(blocked.ready, false);
  assert.equal(blocked.blockers.some((item) => item.from === "PY-L2-C05"), true);

  const ready = mastery.evaluatePrerequisiteGate("ML-L2-C04", [
    snapshot("MATH-L2-C07", "dat_prerequisite"),
    snapshot("PY-L2-C04", "master_ready"),
    snapshot("PY-L2-C05", "dat_prerequisite")
  ]);
  assert.equal(ready.ready, true);
  assert.equal(ready.blockers.length, 0);
});

test("keeps recommended and contextual edges non-blocking but explicit", () => {
  const mastery = loadRoadmapMastery();
  const recommended = mastery.evaluatePrerequisiteGate("PY-L2-C05", []);
  assert.equal(recommended.ready, true);
  assert.equal(recommended.advisory.length, 2);
  assert.equal(recommended.recommendedEdgesBlock, false);

  const contextual = mastery.evaluatePrerequisiteGate("RU-R2-C06", [snapshot("RU-R2-C05", "dat_prerequisite")]);
  assert.equal(contextual.ready, true);
  assert.equal(contextual.advisory.some((item) => item.type === "contextual"), true);
  assert.equal(contextual.unresolvedExternalGateIds.includes("EXT-TECH-CHAPTER-IN-PROGRESS"), true);
});

test("supports any-of alternatives, concurrent progress and explicit external gates", () => {
  const mastery = loadRoadmapMastery();
  assert.equal(mastery.evaluatePrerequisiteGate("MATH-L0-C02", []).ready, false);
  assert.equal(mastery.evaluatePrerequisiteGate("MATH-L0-C02", [snapshot("MATH-L0-C01", "dat_prerequisite")]).ready, true);
  assert.equal(mastery.evaluatePrerequisiteGate("MATH-L0-C02", [], { "EXT-EXISTING-COMPETENCY-CONFIRMED": true }).ready, true);

  const concurrent = mastery.evaluatePrerequisiteGate("ML-L3-C08", [
    snapshot("ML-L1-C01", "dang_hoc"),
    snapshot("RU-R3-C07", "dang_hoc")
  ]);
  assert.equal(concurrent.ready, true);

  const externalBlocked = mastery.evaluatePrerequisiteGate("RU-R3-C08", [snapshot("RU-R3-C07", "master_ready")]);
  assert.equal(externalBlocked.ready, false);
  assert.equal(externalBlocked.unresolvedExternalGateIds.includes("EXT-COMPLETE-TECHNICAL-PROJECT"), true);
  const externalReady = mastery.evaluatePrerequisiteGate("RU-R3-C08", [snapshot("RU-R3-C07", "master_ready")], { "EXT-COMPLETE-TECHNICAL-PROJECT": true });
  assert.equal(externalReady.ready, true);
});

test("rejects duplicate, persisted or unknown mastery snapshots", () => {
  const mastery = loadRoadmapMastery();
  assert.throws(() => mastery.evaluatePrerequisiteGate("ML-L2-C04", [
    snapshot("MATH-L2-C07", "dat_prerequisite"),
    snapshot("MATH-L2-C07", "master_ready")
  ]), /Duplicate mastery snapshot target/);
  assert.throws(() => mastery.evaluatePrerequisiteGate("ML-L2-C04", [
    { ...snapshot("MATH-L2-C07", "dat_prerequisite"), persisted: true }
  ]), /Persisted snapshot admitted/);
  assert.throws(() => mastery.evaluatePrerequisiteGate("ML-L2-C04", [
    snapshot("DOES-NOT-EXIST", "dat_prerequisite")
  ]), /Unknown mastery snapshot target/);
});

test("fails closed when a pinned mastery file is tampered or missing", () => {
  const tampered = fs.mkdtempSync(path.join(os.tmpdir(), "bauman-mastery-tamper-"));
  try {
    fs.cpSync(packageRoot, tampered, { recursive: true });
    fs.appendFileSync(path.join(tampered, "mastery", "mastery-contract.json"), "\n");
    assert.throws(() => loadRoadmapMastery({ baseDir: tampered }), /mastery (byte count|hash) mismatch/);
  } finally {
    fs.rmSync(tampered, { recursive: true, force: true });
  }

  const missing = fs.mkdtempSync(path.join(os.tmpdir(), "bauman-mastery-missing-"));
  try {
    fs.cpSync(packageRoot, missing, { recursive: true });
    fs.rmSync(path.join(missing, "mastery", "evidence-event.schema.json"));
    assert.throws(() => loadRoadmapMastery({ baseDir: missing }), /Missing Roadmap mastery file/);
  } finally {
    fs.rmSync(missing, { recursive: true, force: true });
  }
});
