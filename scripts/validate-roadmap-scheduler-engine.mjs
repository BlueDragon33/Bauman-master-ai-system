import { loadRoadmapScheduler } from "../roadmap_v2/scheduler.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function snapshot(targetId, knowledgeState, phaseId) {
  return {
    schema: "BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1",
    targetId,
    phaseId,
    knowledgeState,
    existingCompetencyVerified: false,
    dimensions: {},
    persisted: false
  };
}

function candidate(targetId, knowledgeState, phaseId, masterRelevance, weeksUntilNeeded) {
  return {
    schema: "BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1",
    candidateId: `PRIORITY::${phaseId}::${targetId}`,
    targetId,
    phaseId,
    masterRelevance,
    masterRelevanceSource: "L26 deterministic validator fixture",
    weeksUntilNeeded,
    snapshot: snapshot(targetId, knowledgeState, phaseId)
  };
}

function item(id, priorityCandidate, options = {}) {
  return {
    scheduleItemId: id,
    priorityCandidate,
    activityKind: options.activityKind || "technical_core",
    estimatedMinutes: options.estimatedMinutes || 60,
    technicalTrack: options.technicalTrack ?? "math",
    russianTwinMinutes: options.russianTwinMinutes ?? 30,
    dueDate: options.dueDate ?? null,
    reviewRequested: options.reviewRequested || false,
    source: {
      kind: options.sourceKind || "registry_static",
      ref: options.sourceRef || `registry://${priorityCandidate.targetId}`,
      verified: true,
      masterModeRelation: options.masterModeRelation || "not_applicable"
    }
  };
}

const scheduler = loadRoadmapScheduler();

const gd2Request = {
  schema: "BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1",
  requestId: "SCHEDULE::GD2::2026-08-17",
  phaseId: "GD2",
  weekStart: "2026-08-17",
  weeklyCapacityMinutes: 90,
  items: [item("ITEM::MATH-L2-C07", candidate("MATH-L2-C07", "gap", "GD2", 0.9, 4))]
};
const gd2 = scheduler.projectWeek(gd2Request);
assert(gd2.sessions.length === 2, "GD2 technical/Russian twin bundle was not projected atomically");
assert(gd2.sessions[1].activityKind === "russian_twin_placeholder" && gd2.sessions[1].companionOf === "ITEM::MATH-L2-C07", "GD2 Russian twin placeholder drift");
assert(gd2.usedMinutes === 90 && gd2.remainingMinutes === 0, "GD2 capacity accounting drift");

const gd3Request = {
  schema: "BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1",
  requestId: "SCHEDULE::GD3::2026-08-17",
  phaseId: "GD3",
  weekStart: "2026-08-17",
  weeklyCapacityMinutes: 420,
  items: [
    item("ITEM::CRITICAL-BRIDGE", candidate("MATH-L2-C07", "gap", "GD3", 0.8, 4), {
      activityKind: "bridge",
      masterModeRelation: "current_subject_prerequisite"
    }),
    item("ITEM::CURRENT-PREVIEW", candidate("CUR-L4-C03", "chua_hoc", "GD3", 0.2, 3), {
      activityKind: "current_subject_preview",
      technicalTrack: "other",
      sourceKind: "current_bauman_official",
      sourceRef: "official-syllabus://bauman/current/week-3",
      masterModeRelation: "not_applicable"
    }),
    item("ITEM::STATIC-RELATED", candidate("MATH-L1-C03", "dang_hoc", "GD3", 1, 8), {
      masterModeRelation: "current_subject_prerequisite"
    }),
    item("ITEM::STATIC-UNRELATED", candidate("MATH-L1-C04", "dang_hoc", "GD3", 1, 8), {
      masterModeRelation: "unrelated_static"
    })
  ]
};
const gd3 = scheduler.projectWeek(gd3Request);
const primarySessions = gd3.sessions.filter((session) => session.companionOf === null);
assert(primarySessions[0].scheduleItemId === "ITEM::CRITICAL-BRIDGE", "Critical gap is not first in Master Mode");
assert(primarySessions[1].scheduleItemId === "ITEM::CURRENT-PREVIEW", "Verified Current Bauman override did not precede weighted Priority");
assert(primarySessions[2].scheduleItemId === "ITEM::STATIC-RELATED", "Related static prerequisite was not retained in Master Mode");
assert(gd3.deferred.some((entry) => entry.scheduleItemId === "ITEM::STATIC-UNRELATED" && entry.reason === "GD3_UNRELATED_STATIC_DEFERRED"), "Unrelated static syllabus was not deferred in Master Mode");
assert(JSON.stringify(gd3) === JSON.stringify(scheduler.projectWeek(gd3Request)), "Scheduler weekly projection is not deterministic");
assert(Object.isFrozen(gd3) && Object.isFrozen(gd3.sessions) && Object.isFrozen(gd3.sessions[0]), "Scheduler projection is mutable");
assert(gd3.calendarWriteAllowed === false && gd3.persisted === false && gd3.runtimeWriteAllowed === false, "Scheduler projection escaped the disconnected harness");

console.log(JSON.stringify({
  status: "PASS_B102_IN_MEMORY_SCHEDULER_PROJECTOR",
  gd2Sessions: gd2.sessions.length,
  gd2UsedMinutes: gd2.usedMinutes,
  masterModeOrder: primarySessions.map((session) => session.scheduleItemId),
  unrelatedStaticDeferred: true,
  deterministic: true,
  calendarWrites: 0,
  persistedSchedules: 0,
  runtimeWrites: 0
}));
