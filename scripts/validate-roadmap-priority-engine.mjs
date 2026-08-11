import { loadRoadmapMastery } from "../roadmap_v2/mastery.mjs";
import { loadRoadmapPriority } from "../roadmap_v2/priority.mjs";

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
    source: { kind: "validator_fixture", ref: `${targetId}-${sequence}` },
    payload
  };
}

function candidate(targetId, snapshot, masterRelevance, weeksUntilNeeded) {
  return {
    schema: "BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1",
    candidateId: `PRIORITY::${targetId}`,
    targetId,
    phaseId: snapshot.phaseId,
    masterRelevance,
    masterRelevanceSource: "L25 deterministic validator fixture",
    weeksUntilNeeded,
    snapshot
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const mastery = loadRoadmapMastery();
const priority = loadRoadmapPriority();

const gapSnapshot = mastery.reduceEvidenceStream([
  event(1, "diagnostic_result", {
    status: "gap",
    scorePercent: 50,
    criticalPercent: 40,
    masterReady: false,
    persistable: false
  }, "MATH-L2-C07")
]);
const critical = priority.scoreCandidate(candidate("MATH-L2-C07", gapSnapshot, 0.9, 4));
assert(critical.features.knowledgeGap === 1, "Gap normalization drift");
assert(critical.features.prerequisiteUrgency === 1, "Urgency normalization drift");
assert(critical.criticalOverride === true && critical.disposition === "critical", "Critical override did not apply");
assert(critical.schedulerWriteAllowed === false && critical.persisted === false, "Priority result escaped harness boundary");

const expected = (0.35 * 0.9 + 0.30 * 1 + 0.20 * 1 + 0.15 * 0.25) * 100;
assert(Math.abs(critical.weightedScore - expected) < 1e-9, "Weighted Priority formula drift");
assert(Math.abs(Object.values(critical.contributions).reduce((sum, value) => sum + value, 0) - critical.weightedScore) < 1e-9, "Priority contribution sum drift");

const retained = mastery.reduceEvidenceStream([
  event(1, "diagnostic_result", {
    status: "existing_competency_verified",
    scorePercent: 90,
    criticalPercent: 80,
    masterReady: false,
    persistable: false
  }, "MATH-L1-C03"),
  event(2, "retention_check", { percent: 80, daysAfterLearning: 14 }, "MATH-L1-C03")
]);
const review = priority.scoreCandidate(candidate("MATH-L1-C03", retained, 0.8, 10));
assert(review.reviewOnDemand === true && review.disposition === "review_on_demand", "Existing Competency review-on-demand rule drift");
assert(review.masterReady === false, "Existing Competency Priority result grants Master-ready");

const ranking = priority.rankCandidates([
  candidate("MATH-L1-C03", retained, 0.8, 10),
  candidate("MATH-L2-C07", gapSnapshot, 0.9, 4)
]);
assert(ranking[0].targetId === "MATH-L2-C07" && ranking[0].rank === 1, "Critical candidate is not ranked first");
assert(Object.isFrozen(ranking) && Object.isFrozen(ranking[0]), "Priority ranking is mutable");

console.log(JSON.stringify({
  status: "PASS_B98_B99_PRIORITY_ENGINE",
  criticalScore: critical.weightedScore,
  criticalDisposition: critical.disposition,
  reviewDisposition: review.disposition,
  existingCompetencyMasterReady: review.masterReady,
  rankedFirst: ranking[0].targetId,
  schedulerWrites: 0,
  persistedResults: 0
}));
