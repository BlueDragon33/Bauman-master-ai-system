import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadRoadmapScheduler } from "../roadmap_v2/scheduler.mjs";

const packageRoot = path.resolve("roadmap_v2");

function snapshot(targetId, knowledgeState, phaseId, options = {}) {
  return {
    schema: "BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1",
    targetId,
    phaseId,
    knowledgeState,
    existingCompetencyVerified: options.existingCompetencyVerified || false,
    dimensions: options.dimensions || {},
    persisted: options.persisted || false
  };
}

function candidate(targetId, knowledgeState, phaseId, options = {}) {
  return {
    schema: "BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1",
    candidateId: options.candidateId || `PRIORITY::${phaseId}::${targetId}`,
    targetId,
    phaseId,
    masterRelevance: options.masterRelevance ?? 0.8,
    masterRelevanceSource: options.masterRelevanceSource || "L26 deterministic test fixture",
    weeksUntilNeeded: options.weeksUntilNeeded ?? 8,
    snapshot: options.snapshot || snapshot(targetId, knowledgeState, phaseId)
  };
}

function item(id, priorityCandidate, options = {}) {
  const technicalTrack = options.technicalTrack === undefined ? "math" : options.technicalTrack;
  const russianTwinMinutes = options.russianTwinMinutes === undefined
    ? (technicalTrack === null ? null : 30)
    : options.russianTwinMinutes;
  return {
    scheduleItemId: id,
    priorityCandidate,
    activityKind: options.activityKind || "technical_core",
    estimatedMinutes: options.estimatedMinutes || 60,
    technicalTrack,
    russianTwinMinutes,
    dueDate: options.dueDate ?? null,
    reviewRequested: options.reviewRequested || false,
    source: {
      kind: options.sourceKind || "registry_static",
      ref: options.sourceRef || `registry://${priorityCandidate.targetId}`,
      verified: options.verified ?? true,
      masterModeRelation: options.masterModeRelation || "not_applicable"
    }
  };
}

function request(phaseId, items, options = {}) {
  return {
    schema: "BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1",
    requestId: options.requestId || `SCHEDULE::${phaseId}::2026-08-17`,
    phaseId,
    weekStart: options.weekStart || "2026-08-17",
    weeklyCapacityMinutes: options.weeklyCapacityMinutes || 600,
    items
  };
}

test("loads the pinned B103 disconnected Scheduler harness", () => {
  const scheduler = loadRoadmapScheduler();
  assert.equal(scheduler.manifest.status, "PASS_B103_DETERMINISTIC_WEEKLY_PROJECTION_HARNESS");
  assert.equal(scheduler.manifest.counts.phasePolicies, 4);
  assert.equal(scheduler.manifest.counts.productionCalendarConnections, 0);
  assert.equal(scheduler.manifest.counts.persistentStores, 0);
  assert.equal(scheduler.manifest.counts.calendarWrites, 0);
  assert.equal(scheduler.manifest.counts.runtimeWrites, 0);
  assert.equal(scheduler.manifest.counts.generatedDynamicContent, 0);
});

test("recomputes Priority and places a Critical gap first", () => {
  const scheduler = loadRoadmapScheduler();
  const result = scheduler.projectWeek(request("GD2", [
    item("ITEM::NORMAL", candidate("MATH-L1-C03", "dang_hoc", "GD2", { masterRelevance: 1, weeksUntilNeeded: 8 })),
    item("ITEM::CRITICAL", candidate("MATH-L2-C07", "gap", "GD2", { masterRelevance: 0.1, weeksUntilNeeded: 4 }))
  ]));
  const primary = result.sessions.filter((session) => session.companionOf === null);
  assert.equal(primary[0].scheduleItemId, "ITEM::CRITICAL");
  assert.equal(primary[0].disposition, "critical");
  assert.equal(primary[0].reasonCodes.includes("CRITICAL_GAP_FIRST"), true);
});

test("applies verified Current Bauman override after Critical and before weighted Priority", () => {
  const scheduler = loadRoadmapScheduler();
  const result = scheduler.projectWeek(request("GD3", [
    item("ITEM::STATIC", candidate("MATH-L1-C03", "dang_hoc", "GD3", { masterRelevance: 1, weeksUntilNeeded: 8 }), {
      masterModeRelation: "current_subject_prerequisite"
    }),
    item("ITEM::CURRENT", candidate("CUR-L4-C03", "chua_hoc", "GD3", { masterRelevance: 0.1, weeksUntilNeeded: 3 }), {
      activityKind: "current_subject_preview",
      technicalTrack: "other",
      sourceKind: "current_bauman_official",
      sourceRef: "official-syllabus://current/week-3"
    })
  ]));
  const primary = result.sessions.filter((session) => session.companionOf === null);
  assert.equal(primary[0].scheduleItemId, "ITEM::CURRENT");
  assert.equal(primary[0].reasonCodes.includes("VERIFIED_CURRENT_BAUMAN_OVERRIDE"), true);
});

test("rejects unverified, missing and misplaced dynamic provenance", () => {
  const scheduler = loadRoadmapScheduler();
  const current = item("ITEM::CURRENT", candidate("CUR-L4-C03", "chua_hoc", "GD3", { weeksUntilNeeded: 3 }), {
    activityKind: "current_subject_preview",
    technicalTrack: "other",
    sourceKind: "current_bauman_official",
    sourceRef: "official-syllabus://current/week-3",
    verified: false
  });
  assert.throws(() => scheduler.projectWeek(request("GD3", [current])), /Unverified Scheduler source/);

  const wrongKind = structuredClone(current);
  wrongKind.source.verified = true;
  wrongKind.source.kind = "registry_static";
  assert.throws(() => scheduler.projectWeek(request("GD3", [wrongKind])), /lacks official source/);

  const outside = item("ITEM::OUTSIDE", candidate("CUR-L4-C03", "chua_hoc", "GD2", { weeksUntilNeeded: 3 }), {
    activityKind: "current_subject_preview",
    technicalTrack: "other",
    sourceKind: "current_bauman_official",
    sourceRef: "official-syllabus://current/week-3"
  });
  assert.throws(() => scheduler.projectWeek(request("GD2", [outside])), /outside GD3/);
});

test("enforces the exact 2-4 week Master Mode preview window", () => {
  const scheduler = loadRoadmapScheduler();
  for (const weeksUntilNeeded of [2, 3, 4]) {
    const preview = item(`ITEM::PREVIEW-${weeksUntilNeeded}`, candidate("CUR-L4-C03", "chua_hoc", "GD3", { weeksUntilNeeded, candidateId: `PREVIEW-${weeksUntilNeeded}` }), {
      activityKind: "current_subject_preview",
      technicalTrack: "other",
      sourceKind: "current_bauman_official",
      sourceRef: `official-syllabus://current/week-${weeksUntilNeeded}`
    });
    assert.doesNotThrow(() => scheduler.projectWeek(request("GD3", [preview], { requestId: `REQUEST-${weeksUntilNeeded}` })));
  }
  for (const weeksUntilNeeded of [1, 5]) {
    const preview = item(`ITEM::BAD-${weeksUntilNeeded}`, candidate("CUR-L4-C03", "chua_hoc", "GD3", { weeksUntilNeeded, candidateId: `BAD-${weeksUntilNeeded}` }), {
      activityKind: "current_subject_preview",
      technicalTrack: "other",
      sourceKind: "current_bauman_official",
      sourceRef: `official-syllabus://current/week-${weeksUntilNeeded}`
    });
    assert.throws(() => scheduler.projectWeek(request("GD3", [preview])), /outside 2-4 week window/);
  }
});

test("defers unrelated static syllabus in GD3 but keeps related bridge work", () => {
  const scheduler = loadRoadmapScheduler();
  const result = scheduler.projectWeek(request("GD3", [
    item("ITEM::RELATED", candidate("MATH-L1-C03", "dang_hoc", "GD3"), {
      activityKind: "bridge",
      masterModeRelation: "current_subject_prerequisite"
    }),
    item("ITEM::UNRELATED", candidate("MATH-L1-C04", "dang_hoc", "GD3"), {
      masterModeRelation: "unrelated_static"
    })
  ]));
  assert.equal(result.sessions.some((session) => session.scheduleItemId === "ITEM::RELATED"), true);
  assert.equal(result.sessions.some((session) => session.scheduleItemId === "ITEM::UNRELATED"), false);
  assert.equal(result.deferred.some((entry) => entry.reason === "GD3_UNRELATED_STATIC_DEFERRED"), true);
});

test("requires Russian twin budgets in GD1-GD3 and projects placeholders only", () => {
  const scheduler = loadRoadmapScheduler();
  for (const phaseId of ["GD1", "GD2", "GD3"]) {
    const relation = phaseId === "GD3" ? "current_subject_prerequisite" : "not_applicable";
    const missing = item(`ITEM::${phaseId}`, candidate("MATH-L1-C03", "dang_hoc", phaseId), {
      russianTwinMinutes: null,
      masterModeRelation: relation
    });
    assert.throws(() => scheduler.projectWeek(request(phaseId, [missing])), /Required Russian twin budget missing/);
  }
  const projected = scheduler.projectWeek(request("GD2", [item("ITEM::TWIN", candidate("MATH-L1-C03", "dang_hoc", "GD2"))]));
  assert.equal(projected.sessions[1].activityKind, "russian_twin_placeholder");
  assert.equal(projected.sessions[1].reasonCodes.includes("CONTENT_GENERATION_DISABLED"), true);
});

test("keeps technical and Russian twin sessions atomic under capacity", () => {
  const scheduler = loadRoadmapScheduler();
  const result = scheduler.projectWeek(request("GD2", [
    item("ITEM::ATOMIC", candidate("MATH-L2-C07", "gap", "GD2", { weeksUntilNeeded: 4 }))
  ], { weeklyCapacityMinutes: 89 }));
  assert.equal(result.sessions.length, 0);
  assert.equal(result.usedMinutes, 0);
  assert.equal(result.deferred[0].reason, "WEEKLY_CAPACITY_ATOMIC_BUNDLE");
  assert.deepEqual(result.readiness.unscheduledCriticalTargets, ["MATH-L2-C07"]);
  assert.equal(result.readiness.ready, false);
});

test("schedules Existing Competency only when review-on-demand is explicit", () => {
  const scheduler = loadRoadmapScheduler();
  const retained = snapshot("MATH-L1-C03", "dat_prerequisite", "GD2", {
    existingCompetencyVerified: true,
    dimensions: {
      diagnostic: { scorePercent: 90, criticalPercent: 80 },
      retention: { percent: 80, daysAfterLearning: 14 }
    }
  });
  const priorityCandidate = candidate("MATH-L1-C03", "dat_prerequisite", "GD2", { snapshot: retained });
  const omitted = scheduler.projectWeek(request("GD2", [item("ITEM::REVIEW", priorityCandidate, {
    activityKind: "retention_review"
  })]));
  assert.equal(omitted.sessions.length, 0);
  assert.equal(omitted.deferred[0].reason, "REVIEW_ON_DEMAND_NOT_REQUESTED");

  const explicit = scheduler.projectWeek(request("GD2", [item("ITEM::REVIEW", priorityCandidate, {
    activityKind: "retention_review",
    reviewRequested: true
  })]));
  assert.equal(explicit.sessions.length, 2);
  assert.equal(scheduler.priority.scoreCandidate(priorityCandidate).masterReady, false);
});

test("limits GD1 to distinct Python, Database and Math technical sessions", () => {
  const scheduler = loadRoadmapScheduler();
  const result = scheduler.projectWeek(request("GD1", [
    item("ITEM::PYTHON", candidate("PY-L1-C02", "dang_hoc", "GD1"), { technicalTrack: "python" }),
    item("ITEM::DATABASE", candidate("DB-L1-C02", "dang_hoc", "GD1"), { technicalTrack: "database" }),
    item("ITEM::MATH", candidate("MATH-L1-C03", "dang_hoc", "GD1"), { technicalTrack: "math" }),
    item("ITEM::PYTHON-REPEAT", candidate("PY-L1-C03", "dang_hoc", "GD1"), { technicalTrack: "python" }),
    item("ITEM::OTHER", candidate("MATH-L1-C04", "dang_hoc", "GD1"), { technicalTrack: "other" })
  ]));
  assert.equal(result.readiness.gd1TechnicalSessionCount, 3);
  assert.equal(result.readiness.gd1MinimumAdvisoryMet, true);
  assert.equal(result.deferred.some((entry) => entry.reason === "GD1_TRACK_ALREADY_SELECTED"), true);
  assert.equal(result.deferred.some((entry) => entry.reason === "GD1_NON_ROTATION_TRACK_DEFERRED"), true);
});

test("reports when the GD1 two-session advisory is not met", () => {
  const scheduler = loadRoadmapScheduler();
  const result = scheduler.projectWeek(request("GD1", [
    item("ITEM::PYTHON", candidate("PY-L1-C02", "dang_hoc", "GD1"), { technicalTrack: "python" })
  ]));
  assert.equal(result.readiness.gd1TechnicalSessionCount, 1);
  assert.equal(result.readiness.gd1MinimumAdvisoryMet, false);
  assert.equal(result.readiness.ready, false);
});

test("rejects duplicate item, candidate and target identities", () => {
  const scheduler = loadRoadmapScheduler();
  const first = item("DUP", candidate("MATH-L1-C03", "dang_hoc", "GD2"));
  const duplicateItem = item("DUP", candidate("MATH-L1-C04", "dang_hoc", "GD2"));
  assert.throws(() => scheduler.projectWeek(request("GD2", [first, duplicateItem])), /Duplicate Scheduler item ID/);

  const duplicateCandidate = item("OTHER", candidate("MATH-L1-C04", "dang_hoc", "GD2", { candidateId: first.priorityCandidate.candidateId }));
  assert.throws(() => scheduler.projectWeek(request("GD2", [first, duplicateCandidate])), /Duplicate Scheduler Priority candidate ID/);

  const duplicateTarget = item("OTHER", candidate("MATH-L1-C03", "dang_hoc", "GD2", { candidateId: "OTHER" }));
  assert.throws(() => scheduler.projectWeek(request("GD2", [first, duplicateTarget])), /Duplicate Scheduler target ID/);
});

test("rejects caller Priority results, derived overrides and phase mismatches", () => {
  const scheduler = loadRoadmapScheduler();
  const supplied = item("ITEM::SUPPLIED", candidate("MATH-L1-C03", "dang_hoc", "GD2"));
  supplied.priorityResult = { disposition: "critical" };
  assert.throws(() => scheduler.projectWeek(request("GD2", [supplied])), /unsupported fields/);

  const overridden = item("ITEM::OVERRIDE", candidate("MATH-L1-C03", "dang_hoc", "GD2"));
  overridden.priorityCandidate.weightedScore = 100;
  assert.throws(() => scheduler.projectWeek(request("GD2", [overridden])), /override is forbidden/);

  const mismatch = item("ITEM::MISMATCH", candidate("MATH-L1-C03", "dang_hoc", "GD3"));
  assert.throws(() => scheduler.projectWeek(request("GD2", [mismatch])), /phase mismatch/);
});

test("rejects invalid dates, capacity, activity and unknown request fields", () => {
  const scheduler = loadRoadmapScheduler();
  const validItem = item("ITEM::VALID", candidate("MATH-L1-C03", "dang_hoc", "GD2"));
  assert.throws(() => scheduler.projectWeek(request("GD2", [validItem], { weekStart: "2026-02-30" })), /Invalid Scheduler week start/);
  assert.throws(() => scheduler.projectWeek({ ...request("GD2", [validItem]), weeklyCapacityMinutes: 0 }), /Invalid Scheduler weekly capacity/);

  const badActivity = structuredClone(validItem);
  badActivity.activityKind = "invented";
  assert.throws(() => scheduler.projectWeek(request("GD2", [badActivity])), /Unknown Scheduler activity kind/);

  const unknown = request("GD2", [validItem]);
  unknown.calendarId = "production";
  assert.throws(() => scheduler.projectWeek(unknown), /unsupported fields/);
});

test("returns deterministic deeply frozen non-persisted projections", () => {
  const scheduler = loadRoadmapScheduler();
  const input = request("GD2", [item("ITEM::FROZEN", candidate("MATH-L1-C03", "dang_hoc", "GD2"))]);
  const first = scheduler.projectWeek(input);
  const second = scheduler.projectWeek(input);
  assert.deepEqual(first, second);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.sessions), true);
  assert.equal(Object.isFrozen(first.sessions[0]), true);
  assert.equal(first.calendarWriteAllowed, false);
  assert.equal(first.persisted, false);
  assert.equal(first.runtimeWriteAllowed, false);
  assert.throws(() => { first.usedMinutes = 999; }, TypeError);
});

test("fails closed when a pinned Scheduler file is tampered or missing", () => {
  const tampered = fs.mkdtempSync(path.join(os.tmpdir(), "bauman-scheduler-tamper-"));
  try {
    fs.cpSync(packageRoot, tampered, { recursive: true });
    fs.appendFileSync(path.join(tampered, "scheduler", "scheduler-contract.json"), "\n");
    assert.throws(() => loadRoadmapScheduler({ baseDir: tampered }), /Scheduler (byte count|hash) mismatch/);
  } finally {
    fs.rmSync(tampered, { recursive: true, force: true });
  }

  const missing = fs.mkdtempSync(path.join(os.tmpdir(), "bauman-scheduler-missing-"));
  try {
    fs.cpSync(packageRoot, missing, { recursive: true });
    fs.rmSync(path.join(missing, "scheduler", "scheduler-result.schema.json"));
    assert.throws(() => loadRoadmapScheduler({ baseDir: missing }), /Missing Roadmap Scheduler file/);
  } finally {
    fs.rmSync(missing, { recursive: true, force: true });
  }
});
