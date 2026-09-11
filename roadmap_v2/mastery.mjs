import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRoadmapConsumer } from "./consumer.mjs";
import { loadRoadmapDiagnostic } from "./diagnostic.mjs";

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
  assert(typeof descriptor?.path === "string" && !path.isAbsolute(descriptor.path), `Invalid mastery path for ${id}`);
  const file = path.resolve(baseDir, descriptor.path);
  assert(file.startsWith(`${baseDir}${path.sep}`), `Mastery path escapes package: ${descriptor.path}`);
  assert(fs.existsSync(file), `Missing Roadmap mastery file: ${descriptor.path}`);
  const bytes = fs.readFileSync(file);
  assert(bytes.length === descriptor.bytes, `Roadmap mastery byte count mismatch: ${descriptor.path}`);
  assert(sha256(bytes) === descriptor.sha256, `Roadmap mastery hash mismatch: ${descriptor.path}`);
  return { file, bytes };
}

function pinnedJson(baseDir, descriptor, id) {
  return JSON.parse(resolvePinned(baseDir, descriptor, id).bytes.toString("utf8"));
}

function percent(value, label) {
  assert(Number.isFinite(value) && value >= 0 && value <= 100, `${label} must be between 0 and 100`);
  return value;
}

function integer(value, label, minimum = 0) {
  assert(Number.isInteger(value) && value >= minimum, `${label} must be an integer >= ${minimum}`);
  return value;
}

function validDate(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

export function loadRoadmapMastery(options = {}) {
  const baseDir = path.resolve(options.baseDir || defaultBaseDir);
  const manifest = readJson(path.join(baseDir, "mastery", "manifest.json")).value;
  assert(manifest.schema === "BAUMAN_ROADMAP_V2_MASTERY_MANIFEST_V1", "Unsupported Roadmap mastery manifest schema");
  assert(manifest.status === "PASS_B95_MASTERY_PREREQUISITE_HARNESS", "Roadmap mastery manifest is not B95 PASS");
  assert(manifest.mode === "in_memory_append_only_evidence_harness", "Roadmap mastery is not an in-memory append-only harness");
  assert(manifest.productionIntegration === "disconnected", "Roadmap mastery production boundary is not locked");

  resolvePinned(baseDir, manifest.upstream.consumerManifest, "consumerManifest");
  resolvePinned(baseDir, manifest.upstream.diagnosticManifest, "diagnosticManifest");
  const contract = pinnedJson(baseDir, manifest.files.masteryContract, "masteryContract");
  const contractSchema = pinnedJson(baseDir, manifest.files.masteryContractSchema, "masteryContractSchema");
  const eventSchema = pinnedJson(baseDir, manifest.files.evidenceEventSchema, "evidenceEventSchema");
  const snapshotSchema = pinnedJson(baseDir, manifest.files.masterySnapshotSchema, "masterySnapshotSchema");
  resolvePinned(baseDir, manifest.files.masteryEngine, "masteryEngine");

  const consumer = loadRoadmapConsumer({ baseDir });
  const diagnostic = loadRoadmapDiagnostic({ baseDir });
  assert(contractSchema.$id === contract.schema, "Mastery contract/schema identity mismatch");
  assert(eventSchema.$id === "BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1", "Mastery event schema identity mismatch");
  assert(snapshotSchema.$id === "BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1", "Mastery snapshot schema identity mismatch");
  assert(consumer.bridge.schema === contract.upstreamSchemas.consumerManifest, "Mastery/consumer schema mismatch");
  assert(diagnostic.manifest.schema === contract.upstreamSchemas.diagnosticManifest, "Mastery/diagnostic schema mismatch");
  assert(contract.mode.appendOnlyEvents === true && contract.mode.persistentStoreEnabled === false, "Mastery persistence boundary is unsafe");
  assert(contract.capabilities.persistentStoreWrite === false && contract.capabilities.runtimeActivation === false, "Mastery enables unsafe writes");

  const courseByTargetId = new Map();
  const targetTypeById = new Map();
  for (const course of consumer.sidecar.registry.courses) {
    for (const level of course.levels) {
      for (const chapter of level.chapters) {
        courseByTargetId.set(chapter.id, course.id);
        targetTypeById.set(chapter.id, "roadmap_chapter");
        for (const lesson of chapter.lessons) {
          courseByTargetId.set(lesson.id, course.id);
          targetTypeById.set(lesson.id, "roadmap_lesson");
        }
      }
    }
  }
  const phaseIds = new Set(consumer.sidecar.registry.program.phases.map((phase) => phase.id));
  const evidenceTypes = new Set(contract.evidenceTypes);

  const validatePayload = (event) => {
    const payload = event.payload;
    assert(payload && typeof payload === "object" && !Array.isArray(payload), `Invalid payload: ${event.eventId}`);
    switch (event.evidenceType) {
      case "diagnostic_result": {
        const allowed = new Set([contract.diagnosticBoundary.passingStatus, ...contract.diagnosticBoundary.gapStatuses]);
        assert(allowed.has(payload.status), `Invalid diagnostic status: ${event.eventId}`);
        percent(payload.scorePercent, `diagnostic score ${event.eventId}`);
        percent(payload.criticalPercent, `diagnostic critical score ${event.eventId}`);
        assert(payload.masterReady === false, `Diagnostic event grants Master-ready: ${event.eventId}`);
        assert(payload.persistable === false, `Diagnostic event is marked persistable: ${event.eventId}`);
        break;
      }
      case "chapter_assessment":
        percent(payload.percent, `assessment score ${event.eventId}`);
        percent(payload.criticalPercent, `assessment critical score ${event.eventId}`);
        break;
      case "exercise_set":
        percent(payload.percent, `exercise score ${event.eventId}`);
        integer(payload.completedItems, `completed exercise items ${event.eventId}`);
        integer(payload.totalItems, `total exercise items ${event.eventId}`, 1);
        assert(payload.completedItems <= payload.totalItems, `Completed exercise count exceeds total: ${event.eventId}`);
        break;
      case "lab_or_simulation":
        assert(typeof payload.passed === "boolean", `Invalid lab pass flag: ${event.eventId}`);
        assert(typeof payload.explanationAccepted === "boolean", `Invalid lab explanation flag: ${event.eventId}`);
        break;
      case "project_rubric":
        assert(payload.rubric && typeof payload.rubric === "object", `Missing project rubric: ${event.eventId}`);
        for (const dimension of contract.thresholds.projectRubricDimensions) {
          assert(Number.isFinite(payload.rubric[dimension]) && payload.rubric[dimension] >= 0 && payload.rubric[dimension] <= 4, `Invalid project rubric ${dimension}: ${event.eventId}`);
        }
        break;
      case "retention_check":
        percent(payload.percent, `retention score ${event.eventId}`);
        integer(payload.daysAfterLearning, `retention days ${event.eventId}`);
        break;
      case "russian_technical_terms":
        integer(payload.verifiedTermCount, `Russian term count ${event.eventId}`);
        break;
      case "gap_override":
        assert(typeof payload.active === "boolean", `Invalid gap override flag: ${event.eventId}`);
        assert(typeof payload.reason === "string" && payload.reason.trim(), `Missing gap override reason: ${event.eventId}`);
        break;
      default:
        throw new Error(`Unknown evidence type: ${event.evidenceType}`);
    }
  };

  const validateEvent = (event) => {
    assert(event && typeof event === "object" && !Array.isArray(event), "Invalid evidence event");
    assert(event.schema === eventSchema.$id, `Evidence event schema mismatch: ${event.eventId || "unknown"}`);
    assert(typeof event.eventId === "string" && event.eventId, "Missing evidence event ID");
    assert(typeof event.streamId === "string" && event.streamId, `Missing stream ID: ${event.eventId}`);
    integer(event.sequence, `sequence ${event.eventId}`, 1);
    assert(targetTypeById.has(event.targetId), `Unknown mastery target: ${event.targetId}`);
    assert(diagnostic.getPlan(event.targetId), `Target has no diagnostic contract: ${event.targetId}`);
    assert(phaseIds.has(event.phaseId), `Unknown Roadmap phase: ${event.phaseId}`);
    assert(evidenceTypes.has(event.evidenceType), `Unknown evidence type: ${event.evidenceType}`);
    assert(validDate(event.occurredAt), `Invalid event date: ${event.eventId}`);
    assert(event.source && typeof event.source.kind === "string" && event.source.kind && typeof event.source.ref === "string" && event.source.ref, `Invalid event source: ${event.eventId}`);
    validatePayload(event);
    return cloneFrozen(event);
  };

  const computeGate = (dimensions, targetId, phaseId, gapOverrideActive) => {
    const thresholds = contract.thresholds;
    const assessment = dimensions.chapterAssessment;
    const exercise = dimensions.exercise;
    const lab = dimensions.labOrSimulation;
    const project = dimensions.projectRubric;
    const retention = dimensions.retention;
    const russianTermsRequired = ["GD2", "GD3"].includes(phaseId)
      && thresholds.russianTechnicalTermsInGD2GD3.appliesToNonRussianTargets
      && courseByTargetId.get(targetId) !== "01-russian";

    const checks = {
      chapterAssessment: Boolean(assessment && assessment.percent >= thresholds.chapterAssessmentPercent && assessment.criticalPercent >= thresholds.criticalPrerequisiteFloorPercent),
      exercise: Boolean(exercise && exercise.percent >= thresholds.exercisePercent && exercise.completedItems === exercise.totalItems),
      labOrSimulation: Boolean(lab && lab.passed && (!thresholds.labExplanationRequired || lab.explanationAccepted)),
      projectRubric: Boolean(project && thresholds.projectRubricDimensions.every((dimension) => project.rubric[dimension] >= thresholds.projectRubricMinimumPerDimension)),
      retention: Boolean(retention
        && retention.percent >= thresholds.retentionPercent
        && retention.daysAfterLearning >= thresholds.retentionWindowDays.minimum
        && retention.daysAfterLearning <= thresholds.retentionWindowDays.maximum),
      russianTechnicalTerms: !russianTermsRequired || Boolean(dimensions.russianTechnicalTerms
        && dimensions.russianTechnicalTerms.verifiedTermCount >= thresholds.russianTechnicalTermsInGD2GD3.minimum),
      noGapOverride: !gapOverrideActive
    };
    const required = [...contract.masterReadyGate.requiredDimensions, ...(russianTermsRequired ? ["russianTechnicalTerms"] : []), "noGapOverride"];
    return deepFreeze({
      required,
      checks,
      russianTermsRequired,
      passed: required.every((id) => checks[id])
    });
  };

  const reduceEvidenceStream = (events) => {
    assert(Array.isArray(events) && events.length > 0, "Evidence stream must contain at least one event");
    const validated = events.map(validateEvent);
    const first = validated[0];
    const eventIds = new Set();
    for (let index = 0; index < validated.length; index += 1) {
      const event = validated[index];
      assert(!eventIds.has(event.eventId), `Duplicate evidence event ID: ${event.eventId}`);
      eventIds.add(event.eventId);
      assert(event.streamId === first.streamId, `Evidence stream ID changed: ${event.eventId}`);
      assert(event.targetId === first.targetId, `Evidence target changed: ${event.eventId}`);
      assert(event.phaseId === first.phaseId, `Evidence phase changed: ${event.eventId}`);
      const expectedSequence = index === 0 ? 1 : validated[index - 1].sequence + 1;
      assert(event.sequence === expectedSequence, `Non-monotonic evidence sequence: ${event.eventId}`);
    }

    const dimensions = {
      diagnostic: null,
      chapterAssessment: null,
      exercise: null,
      labOrSimulation: null,
      projectRubric: null,
      retention: null,
      russianTechnicalTerms: null,
      gapOverride: null
    };
    let existingCompetencyVerified = false;
    let knowledgeState = "chua_hoc";
    let diagnosticGapSequence = 0;
    let learningEvidenceSequence = 0;
    let gapOverrideActive = false;
    let everMasterReady = false;
    const transitions = [];

    const deriveState = (sequence) => {
      const gate = computeGate(dimensions, first.targetId, first.phaseId, gapOverrideActive);
      if (gapOverrideActive) return { state: "gap", reason: "gap_override", gate };
      if (gate.passed) return { state: "master_ready", reason: "master_ready_gate_passed", gate };
      const diagnosticGapActive = diagnosticGapSequence > learningEvidenceSequence;
      if (diagnosticGapActive) return { state: "gap", reason: "diagnostic_gap", gate };
      const retention = dimensions.retention;
      const retentionFailed = Boolean(retention && !gate.checks.retention);
      if ((everMasterReady || gate.checks.chapterAssessment) && retentionFailed) return { state: "can_on", reason: "retention_due", gate };
      if (existingCompetencyVerified || gate.checks.chapterAssessment) return { state: "dat_prerequisite", reason: "prerequisite_evidence_passed", gate };
      if (sequence > 0) return { state: "dang_hoc", reason: "evidence_in_progress", gate };
      return { state: "chua_hoc", reason: "no_evidence", gate };
    };

    let gate = computeGate(dimensions, first.targetId, first.phaseId, false);
    for (const event of validated) {
      switch (event.evidenceType) {
        case "diagnostic_result":
          dimensions.diagnostic = { ...event.payload, sequence: event.sequence };
          if (event.payload.status === contract.diagnosticBoundary.passingStatus) existingCompetencyVerified = true;
          else diagnosticGapSequence = event.sequence;
          break;
        case "chapter_assessment":
          dimensions.chapterAssessment = { ...event.payload, sequence: event.sequence };
          learningEvidenceSequence = event.sequence;
          break;
        case "exercise_set":
          dimensions.exercise = { ...event.payload, sequence: event.sequence };
          learningEvidenceSequence = event.sequence;
          break;
        case "lab_or_simulation":
          dimensions.labOrSimulation = { ...event.payload, sequence: event.sequence };
          learningEvidenceSequence = event.sequence;
          break;
        case "project_rubric":
          dimensions.projectRubric = { rubric: { ...event.payload.rubric }, sequence: event.sequence };
          learningEvidenceSequence = event.sequence;
          break;
        case "retention_check":
          dimensions.retention = { ...event.payload, sequence: event.sequence };
          learningEvidenceSequence = event.sequence;
          break;
        case "russian_technical_terms":
          dimensions.russianTechnicalTerms = { ...event.payload, sequence: event.sequence };
          break;
        case "gap_override":
          dimensions.gapOverride = { ...event.payload, sequence: event.sequence };
          gapOverrideActive = event.payload.active;
          break;
        default:
          throw new Error(`Unhandled evidence type: ${event.evidenceType}`);
      }
      const derived = deriveState(event.sequence);
      gate = derived.gate;
      if (derived.state !== knowledgeState) {
        transitions.push({ sequence: event.sequence, from: knowledgeState, to: derived.state, reason: derived.reason });
        knowledgeState = derived.state;
      }
      if (knowledgeState === "master_ready") everMasterReady = true;
    }

    assert(contract.knowledgeStates.includes(knowledgeState), `Reducer emitted unknown knowledge state: ${knowledgeState}`);
    assert(!(existingCompetencyVerified && validated.length === 1 && knowledgeState === "master_ready"), "Diagnostic pass granted Master-ready");
    assert(knowledgeState !== "master_ready" || gate.passed, "Reducer emitted Master-ready without passing gate");
    return deepFreeze({
      schema: snapshotSchema.$id,
      streamId: first.streamId,
      targetId: first.targetId,
      targetType: targetTypeById.get(first.targetId),
      courseId: courseByTargetId.get(first.targetId),
      phaseId: first.phaseId,
      eventCount: validated.length,
      lastSequence: validated.at(-1).sequence,
      knowledgeState,
      existingCompetencyVerified,
      dimensions,
      masterReadyGate: gate,
      prerequisiteEligible: contract.prerequisiteGate.satisfyingStates.includes(knowledgeState),
      persisted: false,
      transitions
    });
  };

  const evaluatePrerequisiteGate = (targetId, snapshots = [], externalGateStates = {}) => {
    assert(consumer.sidecar.hasNode(targetId), `Unknown prerequisite target: ${targetId}`);
    assert(Array.isArray(snapshots), "Mastery snapshots must be an array");
    assert(externalGateStates && typeof externalGateStates === "object" && !Array.isArray(externalGateStates), "External gate states must be an object");
    const snapshotByTargetId = new Map();
    for (const snapshot of snapshots) {
      assert(snapshot && typeof snapshot === "object", "Invalid mastery snapshot");
      assert(snapshot.schema === snapshotSchema.$id, `Mastery snapshot schema mismatch: ${snapshot.targetId || "unknown"}`);
      assert(consumer.sidecar.hasNode(snapshot.targetId), `Unknown mastery snapshot target: ${snapshot.targetId}`);
      assert(contract.knowledgeStates.includes(snapshot.knowledgeState), `Unknown snapshot knowledge state: ${snapshot.knowledgeState}`);
      assert(snapshot.persisted === false, `Persisted snapshot admitted before store gate: ${snapshot.targetId}`);
      assert(!snapshotByTargetId.has(snapshot.targetId), `Duplicate mastery snapshot target: ${snapshot.targetId}`);
      snapshotByTargetId.set(snapshot.targetId, snapshot);
    }

    const nodeById = new Map(consumer.sidecar.graph.nodes.map((node) => [node.id, node]));
    const edges = consumer.sidecar.getPrerequisites(targetId);
    const satisfying = new Set(contract.prerequisiteGate.satisfyingStates);
    const concurrentSatisfying = new Set(["dang_hoc", ...contract.prerequisiteGate.satisfyingStates]);
    const inspectEdge = (edge) => {
      const sourceNode = nodeById.get(edge.from);
      assert(sourceNode, `Prerequisite source node missing: ${edge.from}`);
      const external = sourceNode.type === "external_gate";
      const snapshot = external ? null : snapshotByTargetId.get(edge.from) || null;
      const supplied = external ? Object.hasOwn(externalGateStates, edge.from) : Boolean(snapshot);
      const sourceSatisfied = external
        ? externalGateStates[edge.from] === true
        : edge.type === "concurrent"
          ? concurrentSatisfying.has(snapshot?.knowledgeState)
          : satisfying.has(snapshot?.knowledgeState);
      return {
        edge,
        sourceType: sourceNode.type,
        external,
        supplied,
        sourceSatisfied,
        knowledgeState: snapshot?.knowledgeState || null,
        externalState: external && supplied ? externalGateStates[edge.from] : null
      };
    };

    const inspected = edges.map(inspectEdge);
    const anyOfGroups = new Map();
    const individual = [];
    for (const item of inspected) {
      if (item.edge.logic === "any_of") {
        const key = item.edge.sourceRaw || `ANY_OF::${targetId}`;
        if (!anyOfGroups.has(key)) anyOfGroups.set(key, []);
        anyOfGroups.get(key).push(item);
      } else {
        individual.push(item);
      }
    }

    const blockers = [];
    const advisory = [];
    const satisfied = [];
    const external = [];

    const summarize = (item) => ({
      from: item.edge.from,
      to: item.edge.to,
      type: item.edge.type,
      logic: item.edge.logic,
      sourceRaw: item.edge.sourceRaw,
      sourceType: item.sourceType,
      supplied: item.supplied,
      sourceSatisfied: item.sourceSatisfied,
      knowledgeState: item.knowledgeState,
      externalState: item.externalState
    });

    for (const item of individual) {
      const summary = summarize(item);
      if (item.external) external.push(summary);
      if (["recommended", "contextual"].includes(item.edge.type)) {
        advisory.push(summary);
      } else if (item.sourceSatisfied) {
        satisfied.push(summary);
      } else {
        blockers.push(summary);
      }
    }

    for (const [groupId, group] of anyOfGroups) {
      const summaries = group.map(summarize);
      for (let index = 0; index < group.length; index += 1) if (group[index].external) external.push(summaries[index]);
      const groupSatisfied = group.some((item) => item.sourceSatisfied);
      const groupSummary = {
        groupId,
        logic: "any_of",
        satisfied: groupSatisfied,
        alternatives: summaries
      };
      if (groupSatisfied) satisfied.push(groupSummary);
      else blockers.push(groupSummary);
    }

    return deepFreeze({
      targetId,
      ready: blockers.length === 0,
      edgeCount: edges.length,
      blockers,
      satisfied,
      advisory,
      external,
      unresolvedExternalGateIds: [...new Set(external.filter((item) => !item.supplied || item.externalState !== true).map((item) => item.from))].sort(),
      recommendedEdgesBlock: false,
      persisted: false
    });
  };

  const api = {
    manifest: cloneFrozen(manifest),
    contract: cloneFrozen(contract),
    consumer,
    diagnostic,
    validateEvent,
    reduceEvidenceStream,
    evaluatePrerequisiteGate
  };
  return Object.freeze(api);
}
