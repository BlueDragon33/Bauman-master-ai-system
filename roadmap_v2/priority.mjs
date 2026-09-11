import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRoadmapConsumer } from "./consumer.mjs";
import { loadRoadmapMastery } from "./mastery.mjs";

const defaultBaseDir = path.dirname(fileURLToPath(import.meta.url));

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

function cloneFrozen(value) {
  if (value === null || value === undefined) return value;
  return deepFreeze(structuredClone(value));
}

function readJson(file) {
  const bytes = fs.readFileSync(file);
  return { bytes, value: JSON.parse(bytes.toString("utf8")) };
}

function resolvePinned(baseDir, descriptor, id) {
  assert(typeof descriptor?.path === "string" && !path.isAbsolute(descriptor.path), `Invalid Priority path for ${id}`);
  const file = path.resolve(baseDir, descriptor.path);
  assert(file.startsWith(`${baseDir}${path.sep}`), `Priority path escapes package: ${descriptor.path}`);
  assert(fs.existsSync(file), `Missing Roadmap Priority file: ${descriptor.path}`);
  const bytes = fs.readFileSync(file);
  assert(bytes.length === descriptor.bytes, `Roadmap Priority byte count mismatch: ${descriptor.path}`);
  assert(sha256(bytes) === descriptor.sha256, `Roadmap Priority hash mismatch: ${descriptor.path}`);
  return { file, bytes };
}

function pinnedJson(baseDir, descriptor, id) {
  return JSON.parse(resolvePinned(baseDir, descriptor, id).bytes.toString("utf8"));
}

function round(value, decimals = 6) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function loadRoadmapPriority(options = {}) {
  const baseDir = path.resolve(options.baseDir || defaultBaseDir);
  const manifest = readJson(path.join(baseDir, "priority", "manifest.json")).value;
  assert(manifest.schema === "BAUMAN_ROADMAP_V2_PRIORITY_MANIFEST_V1", "Unsupported Roadmap Priority manifest schema");
  assert(manifest.status === "PASS_B99_EXPLAINABLE_PRIORITY_RANKING_HARNESS", "Roadmap Priority manifest is not B99 PASS");
  assert(manifest.mode === "in_memory_priority_scoring_harness", "Roadmap Priority is not an in-memory scoring harness");
  assert(manifest.productionIntegration === "disconnected", "Roadmap Priority production boundary is not locked");

  resolvePinned(baseDir, manifest.upstream.consumerManifest, "consumerManifest");
  resolvePinned(baseDir, manifest.upstream.masteryManifest, "masteryManifest");
  const contract = pinnedJson(baseDir, manifest.files.priorityContract, "priorityContract");
  const contractSchema = pinnedJson(baseDir, manifest.files.priorityContractSchema, "priorityContractSchema");
  const candidateSchema = pinnedJson(baseDir, manifest.files.priorityCandidateSchema, "priorityCandidateSchema");
  const resultSchema = pinnedJson(baseDir, manifest.files.priorityResultSchema, "priorityResultSchema");
  resolvePinned(baseDir, manifest.files.priorityEngine, "priorityEngine");
  const consumer = loadRoadmapConsumer({ baseDir });
  const mastery = loadRoadmapMastery({ baseDir });

  assert(contractSchema.$id === contract.schema, "Priority contract/schema identity mismatch");
  assert(candidateSchema.$id === "BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1", "Priority candidate schema identity mismatch");
  assert(resultSchema.$id === "BAUMAN_ROADMAP_V2_PRIORITY_RESULT_V1", "Priority result schema identity mismatch");
  assert(consumer.bridge.schema === contract.upstreamSchemas.consumerManifest, "Priority/consumer schema mismatch");
  assert(mastery.manifest.schema === contract.upstreamSchemas.masteryManifest, "Priority/mastery schema mismatch");
  assert(contract.mode.persistentStoreEnabled === false && contract.mode.schedulerWriteAllowed === false && contract.mode.runtimeWriteAllowed === false, "Priority enables unsafe writes");

  const phaseIds = new Set(consumer.sidecar.registry.program.phases.map((phase) => phase.id));
  const knowledgeStates = new Set(consumer.sidecar.registry.knowledgeStates);

  const validateCandidate = (candidate) => {
    assert(candidate && typeof candidate === "object" && !Array.isArray(candidate), "Invalid Priority candidate");
    assert(candidate.schema === candidateSchema.$id, `Priority candidate schema mismatch: ${candidate.candidateId || "unknown"}`);
    assert(typeof candidate.candidateId === "string" && candidate.candidateId, "Missing Priority candidate ID");
    assert(consumer.sidecar.hasNode(candidate.targetId), `Unknown Priority target: ${candidate.targetId}`);
    assert(phaseIds.has(candidate.phaseId), `Unknown Priority phase: ${candidate.phaseId}`);
    assert(Number.isFinite(candidate.masterRelevance) && candidate.masterRelevance >= 0 && candidate.masterRelevance <= 1, `Master relevance outside [0,1]: ${candidate.candidateId}`);
    assert(typeof candidate.masterRelevanceSource === "string" && candidate.masterRelevanceSource.trim(), `Missing master relevance source: ${candidate.candidateId}`);
    assert(candidate.weeksUntilNeeded === null || (Number.isFinite(candidate.weeksUntilNeeded) && candidate.weeksUntilNeeded >= 0), `Invalid weeks until needed: ${candidate.candidateId}`);
    const snapshot = candidate.snapshot;
    assert(snapshot && typeof snapshot === "object", `Missing mastery snapshot: ${candidate.candidateId}`);
    assert(snapshot.schema === contract.upstreamSchemas.masterySnapshot, `Mastery snapshot schema mismatch: ${candidate.candidateId}`);
    assert(snapshot.targetId === candidate.targetId, `Priority candidate/snapshot target mismatch: ${candidate.candidateId}`);
    assert(snapshot.phaseId === candidate.phaseId, `Priority candidate/snapshot phase mismatch: ${candidate.candidateId}`);
    assert(knowledgeStates.has(snapshot.knowledgeState), `Unknown snapshot knowledge state: ${snapshot.knowledgeState}`);
    assert(snapshot.persisted === false, `Persisted mastery snapshot admitted: ${candidate.candidateId}`);
    for (const forbidden of ["knowledgeGap", "prerequisiteUrgency", "forgettingRisk", "weightedScore", "disposition"]) {
      assert(!Object.hasOwn(candidate, forbidden), `Derived Priority field override is forbidden: ${forbidden}`);
    }
    return cloneFrozen(candidate);
  };

  const urgencyFromWeeks = (weeks) => {
    if (weeks === null) return contract.normalization.missingNeededDateUrgency;
    for (const band of contract.normalization.prerequisiteUrgencyByWeeks) {
      if (band.maximumWeeks === null || weeks <= band.maximumWeeks) return band.value;
    }
    throw new Error("Priority urgency normalization has no terminal band");
  };

  const forgettingRisk = (snapshot) => {
    const rules = contract.normalization.forgettingRiskRules;
    if (snapshot.knowledgeState === "can_on") return rules.can_on;
    const retention = snapshot.dimensions?.retention;
    if (retention) {
      if (retention.percent < mastery.contract.thresholds.retentionPercent) return rules.retentionBelowThreshold;
      if (retention.daysAfterLearning < mastery.contract.thresholds.retentionWindowDays.minimum
        || retention.daysAfterLearning > mastery.contract.thresholds.retentionWindowDays.maximum) return rules.retentionOutsideWindow;
      return rules.retentionPassed;
    }
    switch (snapshot.knowledgeState) {
      case "dat_prerequisite": return rules.datPrerequisiteWithoutRetention;
      case "dang_hoc": return rules.dangHocWithoutRetention;
      case "gap": return rules.gapWithoutRetention;
      case "chua_hoc": return rules.chuaHocWithoutRetention;
      case "master_ready": return rules.retentionPassed;
      default: return rules.chuaHocWithoutRetention;
    }
  };

  const reviewOnDemand = (snapshot) => {
    const rule = contract.existingCompetencyRule;
    const diagnosticEvidence = snapshot.dimensions?.diagnostic;
    const retention = snapshot.dimensions?.retention;
    return Boolean(
      snapshot.existingCompetencyVerified === true
      && diagnosticEvidence
      && diagnosticEvidence.scorePercent >= rule.diagnosticPercentMinimum
      && diagnosticEvidence.criticalPercent >= rule.diagnosticCriticalPercentMinimum
      && retention
      && retention.percent >= rule.retentionPercentMinimum
      && retention.daysAfterLearning >= rule.retentionWindowDays.minimum
      && retention.daysAfterLearning <= rule.retentionWindowDays.maximum
    );
  };

  const scoreCandidate = (input) => {
    const candidate = validateCandidate(input);
    const weights = contract.formula.weights;
    const features = {
      masterRelevance: candidate.masterRelevance,
      knowledgeGap: contract.normalization.knowledgeGapByState[candidate.snapshot.knowledgeState],
      prerequisiteUrgency: urgencyFromWeeks(candidate.weeksUntilNeeded),
      forgettingRisk: forgettingRisk(candidate.snapshot)
    };
    for (const [id, value] of Object.entries(features)) assert(Number.isFinite(value) && value >= 0 && value <= 1, `Derived Priority feature outside [0,1]: ${id}`);
    const contributions = Object.fromEntries(Object.keys(weights).map((id) => [id, round(features[id] * weights[id] * 100)]));
    const weightedScore = round(Object.values(contributions).reduce((sum, value) => sum + value, 0));
    assert(weightedScore >= 0 && weightedScore <= 100, "Priority score outside [0,100]");

    const critical = candidate.snapshot.knowledgeState === contract.criticalOverride.requiredKnowledgeState
      && candidate.weeksUntilNeeded !== null
      && candidate.weeksUntilNeeded <= contract.criticalOverride.maximumWeeksUntilNeeded;
    const review = !critical && reviewOnDemand(candidate.snapshot);
    const weightedDisposition = contract.weightedBands.find((band) => weightedScore >= band.minimumScore)?.disposition;
    assert(weightedDisposition, "Priority score does not match a weighted band");
    const disposition = critical
      ? contract.criticalOverride.disposition
      : review
        ? contract.existingCompetencyRule.disposition
        : weightedDisposition;

    const reasonCodes = [
      ...(critical ? ["CRITICAL_GAP_NEEDED_WITHIN_4_WEEKS"] : []),
      ...(review ? ["EXISTING_COMPETENCY_RETENTION_CONFIRMED"] : []),
      `KNOWLEDGE_STATE_${candidate.snapshot.knowledgeState.toUpperCase()}`,
      candidate.weeksUntilNeeded === null ? "NEEDED_DATE_MISSING" : "NEEDED_DATE_SUPPLIED",
      "SCHEDULER_WRITE_DISABLED",
      "PRODUCTION_DISCONNECTED"
    ];

    return deepFreeze({
      schema: resultSchema.$id,
      candidateId: candidate.candidateId,
      targetId: candidate.targetId,
      phaseId: candidate.phaseId,
      knowledgeState: candidate.snapshot.knowledgeState,
      weeksUntilNeeded: candidate.weeksUntilNeeded,
      features,
      weights: cloneFrozen(weights),
      contributions,
      weightedScore,
      criticalOverride: critical,
      reviewOnDemand: review,
      disposition,
      masterReady: candidate.snapshot.knowledgeState === "master_ready",
      schedulerWriteAllowed: false,
      persisted: false,
      reasonCodes
    });
  };

  const rankCandidates = (candidates) => {
    assert(Array.isArray(candidates), "Priority candidates must be an array");
    const candidateIds = new Set();
    const targetIds = new Set();
    const results = candidates.map((candidate) => {
      assert(!candidateIds.has(candidate.candidateId), `Duplicate Priority candidate ID: ${candidate.candidateId}`);
      assert(!targetIds.has(candidate.targetId), `Duplicate Priority target ID: ${candidate.targetId}`);
      candidateIds.add(candidate.candidateId);
      targetIds.add(candidate.targetId);
      return scoreCandidate(candidate);
    });
    results.sort((a, b) => {
      if (a.criticalOverride !== b.criticalOverride) return a.criticalOverride ? -1 : 1;
      if (a.weightedScore !== b.weightedScore) return b.weightedScore - a.weightedScore;
      const aWeeks = a.weeksUntilNeeded ?? Number.POSITIVE_INFINITY;
      const bWeeks = b.weeksUntilNeeded ?? Number.POSITIVE_INFINITY;
      if (aWeeks !== bWeeks) return aWeeks - bWeeks;
      return a.targetId.localeCompare(b.targetId);
    });
    return deepFreeze(results.map((result, index) => ({ rank: index + 1, ...result })));
  };

  const api = {
    manifest: cloneFrozen(manifest),
    contract: cloneFrozen(contract),
    consumer,
    mastery,
    validateCandidate,
    scoreCandidate,
    rankCandidates
  };
  return Object.freeze(api);
}
