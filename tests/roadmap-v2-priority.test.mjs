import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadRoadmapPriority } from "../roadmap_v2/priority.mjs";

const packageRoot = path.resolve("roadmap_v2");

function snapshot(targetId, knowledgeState, options = {}) {
  return {
    schema: "BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1",
    targetId,
    phaseId: options.phaseId || "GD2",
    knowledgeState,
    existingCompetencyVerified: options.existingCompetencyVerified || false,
    dimensions: options.dimensions || {},
    persisted: options.persisted || false
  };
}

function candidate(targetId, state, options = {}) {
  const masterySnapshot = options.snapshot || snapshot(targetId, state, { phaseId: options.phaseId || "GD2" });
  return {
    schema: "BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1",
    candidateId: options.candidateId || `PRIORITY::${targetId}`,
    targetId,
    phaseId: options.phaseId || masterySnapshot.phaseId,
    masterRelevance: options.masterRelevance ?? 0.8,
    masterRelevanceSource: options.masterRelevanceSource || "L25 deterministic test fixture",
    weeksUntilNeeded: options.weeksUntilNeeded ?? 8,
    snapshot: masterySnapshot
  };
}

test("loads the pinned B99 in-memory Priority harness", () => {
  const priority = loadRoadmapPriority();
  assert.equal(priority.manifest.status, "PASS_B99_EXPLAINABLE_PRIORITY_RANKING_HARNESS");
  assert.equal(priority.manifest.counts.weights, 4);
  assert.equal(priority.manifest.counts.knowledgeStates, 6);
  assert.equal(priority.manifest.counts.persistentStores, 0);
  assert.equal(priority.manifest.counts.schedulerWrites, 0);
  assert.equal(priority.manifest.counts.runtimeWrites, 0);
});

test("computes the exact 35/30/20/15 weighted formula and contributions", () => {
  const priority = loadRoadmapPriority();
  const result = priority.scoreCandidate(candidate("MATH-L2-C07", "gap", {
    masterRelevance: 0.9,
    weeksUntilNeeded: 4
  }));
  const expected = (0.35 * 0.9 + 0.30 * 1 + 0.20 * 1 + 0.15 * 0.25) * 100;
  assert.ok(Math.abs(result.weightedScore - expected) < 1e-9);
  assert.ok(Math.abs(Object.values(result.contributions).reduce((sum, value) => sum + value, 0) - result.weightedScore) < 1e-9);
  assert.deepEqual(result.weights, {
    masterRelevance: 0.35,
    knowledgeGap: 0.3,
    prerequisiteUrgency: 0.2,
    forgettingRisk: 0.15
  });
});

test("normalizes every knowledge state exactly from the contract", () => {
  const priority = loadRoadmapPriority();
  const expected = {
    gap: 1,
    chua_hoc: 0.85,
    dang_hoc: 0.6,
    can_on: 0.45,
    dat_prerequisite: 0.2,
    master_ready: 0
  };
  for (const [state, value] of Object.entries(expected)) {
    assert.equal(priority.scoreCandidate(candidate("MATH-L1-C03", state)).features.knowledgeGap, value);
  }
});

test("normalizes prerequisite urgency at every week boundary", () => {
  const priority = loadRoadmapPriority();
  const cases = [
    [0, 1],
    [4, 1],
    [5, 0.75],
    [8, 0.75],
    [9, 0.5],
    [12, 0.5],
    [13, 0.25],
    [24, 0.25],
    [25, 0.1],
    [null, 0]
  ];
  for (const [weeksUntilNeeded, expected] of cases) {
    const input = candidate("MATH-L1-C03", "dang_hoc", { weeksUntilNeeded });
    if (weeksUntilNeeded === null) input.weeksUntilNeeded = null;
    assert.equal(priority.scoreCandidate(input).features.prerequisiteUrgency, expected);
  }
});

test("derives forgetting risk from state and retention evidence", () => {
  const priority = loadRoadmapPriority();
  assert.equal(priority.scoreCandidate(candidate("MATH-L1-C03", "can_on")).features.forgettingRisk, 1);
  assert.equal(priority.scoreCandidate(candidate("MATH-L1-C03", "dat_prerequisite")).features.forgettingRisk, 0.6);
  assert.equal(priority.scoreCandidate(candidate("MATH-L1-C03", "dang_hoc")).features.forgettingRisk, 0.45);
  assert.equal(priority.scoreCandidate(candidate("MATH-L1-C03", "gap", { weeksUntilNeeded: 8 })).features.forgettingRisk, 0.25);
  assert.equal(priority.scoreCandidate(candidate("MATH-L1-C03", "chua_hoc")).features.forgettingRisk, 0);

  const passedRetention = snapshot("MATH-L1-C03", "dat_prerequisite", {
    dimensions: { retention: { percent: 80, daysAfterLearning: 14 } }
  });
  assert.equal(priority.scoreCandidate(candidate("MATH-L1-C03", "dat_prerequisite", { snapshot: passedRetention })).features.forgettingRisk, 0.15);

  const failedRetention = snapshot("MATH-L1-C03", "dat_prerequisite", {
    dimensions: { retention: { percent: 70, daysAfterLearning: 14 } }
  });
  assert.equal(priority.scoreCandidate(candidate("MATH-L1-C03", "dat_prerequisite", { snapshot: failedRetention })).features.forgettingRisk, 1);
});

test("applies Critical override only to a gap needed within four weeks", () => {
  const priority = loadRoadmapPriority();
  const atFour = priority.scoreCandidate(candidate("MATH-L2-C07", "gap", { weeksUntilNeeded: 4 }));
  assert.equal(atFour.criticalOverride, true);
  assert.equal(atFour.disposition, "critical");
  assert.equal(atFour.reasonCodes.includes("CRITICAL_GAP_NEEDED_WITHIN_4_WEEKS"), true);

  const atFive = priority.scoreCandidate(candidate("MATH-L2-C07", "gap", { weeksUntilNeeded: 5 }));
  assert.equal(atFive.criticalOverride, false);

  const notGap = priority.scoreCandidate(candidate("MATH-L2-C07", "dang_hoc", { weeksUntilNeeded: 4 }));
  assert.equal(notGap.criticalOverride, false);
});

test("requires diagnostic and retention evidence for review_on_demand", () => {
  const priority = loadRoadmapPriority();
  const retained = snapshot("MATH-L1-C03", "dat_prerequisite", {
    existingCompetencyVerified: true,
    dimensions: {
      diagnostic: { scorePercent: 90, criticalPercent: 80 },
      retention: { percent: 80, daysAfterLearning: 14 }
    }
  });
  const review = priority.scoreCandidate(candidate("MATH-L1-C03", "dat_prerequisite", { snapshot: retained }));
  assert.equal(review.reviewOnDemand, true);
  assert.equal(review.disposition, "review_on_demand");
  assert.equal(review.masterReady, false);

  const noRetention = snapshot("MATH-L1-C03", "dat_prerequisite", {
    existingCompetencyVerified: true,
    dimensions: { diagnostic: { scorePercent: 90, criticalPercent: 80 } }
  });
  assert.equal(priority.scoreCandidate(candidate("MATH-L1-C03", "dat_prerequisite", { snapshot: noRetention })).reviewOnDemand, false);

  const staleRetention = snapshot("MATH-L1-C03", "dat_prerequisite", {
    existingCompetencyVerified: true,
    dimensions: {
      diagnostic: { scorePercent: 90, criticalPercent: 80 },
      retention: { percent: 80, daysAfterLearning: 22 }
    }
  });
  assert.equal(priority.scoreCandidate(candidate("MATH-L1-C03", "dat_prerequisite", { snapshot: staleRetention })).reviewOnDemand, false);
});

test("assigns high, medium and low weighted bands", () => {
  const priority = loadRoadmapPriority();
  const high = priority.scoreCandidate(candidate("MATH-L2-C07", "gap", { masterRelevance: 1, weeksUntilNeeded: 8 }));
  assert.equal(high.disposition, "high");

  const medium = priority.scoreCandidate(candidate("MATH-L1-C03", "dang_hoc", { masterRelevance: 0.4, weeksUntilNeeded: 12 }));
  assert.equal(medium.disposition, "medium");

  const low = priority.scoreCandidate(candidate("MATH-L1-C03", "master_ready", { masterRelevance: 0.1, weeksUntilNeeded: null }));
  assert.equal(low.disposition, "low");
});

test("ranks Critical first and then uses deterministic score/target tie-breaks", () => {
  const priority = loadRoadmapPriority();
  const results = priority.rankCandidates([
    candidate("MATH-L1-C04", "dang_hoc", { masterRelevance: 0.5, weeksUntilNeeded: 8 }),
    candidate("MATH-L1-C03", "dang_hoc", { masterRelevance: 0.5, weeksUntilNeeded: 8 }),
    candidate("MATH-L2-C07", "gap", { masterRelevance: 0.2, weeksUntilNeeded: 4 })
  ]);
  assert.equal(results[0].targetId, "MATH-L2-C07");
  assert.equal(results[0].rank, 1);
  assert.equal(results[1].targetId, "MATH-L1-C03");
  assert.equal(results[2].targetId, "MATH-L1-C04");
  assert.deepEqual(results, priority.rankCandidates([
    candidate("MATH-L1-C04", "dang_hoc", { masterRelevance: 0.5, weeksUntilNeeded: 8 }),
    candidate("MATH-L1-C03", "dang_hoc", { masterRelevance: 0.5, weeksUntilNeeded: 8 }),
    candidate("MATH-L2-C07", "gap", { masterRelevance: 0.2, weeksUntilNeeded: 4 })
  ]));
});

test("rejects duplicate candidate and target IDs", () => {
  const priority = loadRoadmapPriority();
  const first = candidate("MATH-L1-C03", "dang_hoc", { candidateId: "DUP" });
  const duplicateId = candidate("MATH-L1-C04", "dang_hoc", { candidateId: "DUP" });
  assert.throws(() => priority.rankCandidates([first, duplicateId]), /Duplicate Priority candidate ID/);

  const duplicateTarget = candidate("MATH-L1-C03", "dang_hoc", { candidateId: "OTHER" });
  assert.throws(() => priority.rankCandidates([first, duplicateTarget]), /Duplicate Priority target ID/);
});

test("rejects manual overrides of derived Priority fields", () => {
  const priority = loadRoadmapPriority();
  for (const field of ["knowledgeGap", "prerequisiteUrgency", "forgettingRisk", "weightedScore", "disposition"]) {
    const input = candidate("MATH-L1-C03", "dang_hoc");
    input[field] = 1;
    assert.throws(() => priority.scoreCandidate(input), new RegExp(`override is forbidden: ${field}`));
  }
});

test("rejects invalid relevance, dates, targets, phases and snapshots", () => {
  const priority = loadRoadmapPriority();
  assert.throws(() => priority.scoreCandidate(candidate("MATH-L1-C03", "dang_hoc", { masterRelevance: 1.1 })), /outside \[0,1\]/);
  assert.throws(() => priority.scoreCandidate(candidate("MATH-L1-C03", "dang_hoc", { weeksUntilNeeded: -1 })), /Invalid weeks/);
  assert.throws(() => priority.scoreCandidate(candidate("DOES-NOT-EXIST", "dang_hoc")), /Unknown Priority target/);

  const phaseMismatch = candidate("MATH-L1-C03", "dang_hoc");
  phaseMismatch.phaseId = "GD3";
  assert.throws(() => priority.scoreCandidate(phaseMismatch), /phase mismatch/);

  const persisted = snapshot("MATH-L1-C03", "dang_hoc", { persisted: true });
  assert.throws(() => priority.scoreCandidate(candidate("MATH-L1-C03", "dang_hoc", { snapshot: persisted })), /Persisted mastery snapshot admitted/);
});

test("returns explainable deeply frozen non-persisted results", () => {
  const priority = loadRoadmapPriority();
  const result = priority.scoreCandidate(candidate("MATH-L1-C03", "dang_hoc"));
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.features), true);
  assert.equal(Object.isFrozen(result.contributions), true);
  assert.equal(result.schedulerWriteAllowed, false);
  assert.equal(result.persisted, false);
  assert.throws(() => { result.disposition = "critical"; }, TypeError);
});

test("fails closed when a pinned Priority file is tampered or missing", () => {
  const tampered = fs.mkdtempSync(path.join(os.tmpdir(), "bauman-priority-tamper-"));
  try {
    fs.cpSync(packageRoot, tampered, { recursive: true });
    fs.appendFileSync(path.join(tampered, "priority", "priority-contract.json"), "\n");
    assert.throws(() => loadRoadmapPriority({ baseDir: tampered }), /Priority (byte count|hash) mismatch/);
  } finally {
    fs.rmSync(tampered, { recursive: true, force: true });
  }

  const missing = fs.mkdtempSync(path.join(os.tmpdir(), "bauman-priority-missing-"));
  try {
    fs.cpSync(packageRoot, missing, { recursive: true });
    fs.rmSync(path.join(missing, "priority", "priority-result.schema.json"));
    assert.throws(() => loadRoadmapPriority({ baseDir: missing }), /Missing Roadmap Priority file/);
  } finally {
    fs.rmSync(missing, { recursive: true, force: true });
  }
});
