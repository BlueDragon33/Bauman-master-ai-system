import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRoadmapConsumer } from "./consumer.mjs";
import { loadRoadmapMastery } from "./mastery.mjs";
import { loadRoadmapScheduler } from "./scheduler.mjs";

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
  assert(typeof descriptor?.path === "string" && !path.isAbsolute(descriptor.path), `Invalid Readiness path for ${id}`);
  const file = path.resolve(baseDir, descriptor.path);
  assert(file.startsWith(`${baseDir}${path.sep}`), `Readiness path escapes package: ${descriptor.path}`);
  assert(fs.existsSync(file), `Missing Roadmap Readiness file: ${descriptor.path}`);
  const bytes = fs.readFileSync(file);
  assert(bytes.length === descriptor.bytes, `Roadmap Readiness byte count mismatch: ${descriptor.path}`);
  assert(sha256(bytes) === descriptor.sha256, `Roadmap Readiness hash mismatch: ${descriptor.path}`);
  return { file, bytes };
}

function pinnedJson(baseDir, descriptor, id) {
  return JSON.parse(resolvePinned(baseDir, descriptor, id).bytes.toString("utf8"));
}

function assertKeys(value, allowed, label) {
  const unexpected = Object.keys(value).filter((key) => !allowed.has(key));
  assert(unexpected.length === 0, `${label} contains unsupported fields: ${unexpected.join(", ")}`);
}

export function loadRoadmapReadiness(options = {}) {
  const baseDir = path.resolve(options.baseDir || defaultBaseDir);
  const manifest = readJson(path.join(baseDir, "readiness", "manifest.json")).value;
  assert(manifest.schema === "BAUMAN_ROADMAP_V2_READINESS_MANIFEST_V1", "Unsupported Roadmap Readiness manifest schema");
  assert(manifest.status === "PASS_B107_FAIL_CLOSED_READINESS_PROJECTION_HARNESS", "Roadmap Readiness manifest is not B107 PASS");
  assert(manifest.mode === "read_only_readiness_projection_harness", "Roadmap Readiness is not a read-only projection harness");
  assert(manifest.productionIntegration === "disconnected", "Roadmap Readiness production boundary is not locked");

  resolvePinned(baseDir, manifest.upstream.consumerManifest, "consumerManifest");
  resolvePinned(baseDir, manifest.upstream.masteryManifest, "masteryManifest");
  resolvePinned(baseDir, manifest.upstream.schedulerManifest, "schedulerManifest");
  const contract = pinnedJson(baseDir, manifest.files.readinessContract, "readinessContract");
  const contractSchema = pinnedJson(baseDir, manifest.files.readinessContractSchema, "readinessContractSchema");
  const requestSchema = pinnedJson(baseDir, manifest.files.readinessRequestSchema, "readinessRequestSchema");
  const resultSchema = pinnedJson(baseDir, manifest.files.readinessResultSchema, "readinessResultSchema");
  resolvePinned(baseDir, manifest.files.readinessEngine, "readinessEngine");

  const consumer = loadRoadmapConsumer({ baseDir });
  const mastery = loadRoadmapMastery({ baseDir });
  const scheduler = loadRoadmapScheduler({ baseDir });
  assert(contractSchema.$id === contract.schema, "Readiness contract/schema identity mismatch");
  assert(requestSchema.$id === "BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1", "Readiness request schema identity mismatch");
  assert(resultSchema.$id === "BAUMAN_ROADMAP_V2_READINESS_RESULT_V1", "Readiness result schema identity mismatch");
  assert(consumer.bridge.schema === contract.upstreamSchemas.consumerManifest, "Readiness/consumer schema mismatch");
  assert(mastery.manifest.schema === contract.upstreamSchemas.masteryManifest, "Readiness/mastery schema mismatch");
  assert(scheduler.manifest.schema === contract.upstreamSchemas.schedulerManifest, "Readiness/Scheduler schema mismatch");
  assert(contract.mode.persistentStoreEnabled === false && contract.mode.dashboardUiEnabled === false && contract.mode.runtimeWriteAllowed === false, "Readiness enables unsafe writes");

  const requestKeys = new Set(["schema", "reportId", "phaseId", "focusTargetIds", "scheduleRequest", "externalGates"]);
  const gateKeys = new Set(["gateId", "satisfied", "sourceRef", "verified"]);
  const nodeById = new Map(consumer.sidecar.graph.nodes.map((node) => [node.id, node]));

  const validateRequest = (input) => {
    assert(input && typeof input === "object" && !Array.isArray(input), "Invalid Readiness request");
    assertKeys(input, requestKeys, "Readiness request");
    assert(input.schema === requestSchema.$id, "Readiness request schema mismatch");
    assert(typeof input.reportId === "string" && input.reportId.trim(), "Missing Readiness report ID");
    assert(Object.hasOwn(scheduler.contract.phasePolicies, input.phaseId), `Unknown Readiness phase: ${input.phaseId}`);
    assert(Array.isArray(input.focusTargetIds) && input.focusTargetIds.length > 0, "Readiness focus targets must be non-empty");
    const focusIds = new Set();
    for (const targetId of input.focusTargetIds) {
      assert(typeof targetId === "string" && targetId, "Invalid Readiness focus target");
      assert(consumer.sidecar.hasNode(targetId), `Unknown Readiness focus target: ${targetId}`);
      assert(!focusIds.has(targetId), `Duplicate Readiness focus target: ${targetId}`);
      focusIds.add(targetId);
    }

    assert(!Object.hasOwn(input, "schedulerResult"), "Caller-supplied Scheduler result is forbidden");
    const scheduleRequest = scheduler.validateRequest(input.scheduleRequest);
    assert(scheduleRequest.phaseId === input.phaseId, "Readiness/Scheduler phase mismatch");
    assert(Array.isArray(input.externalGates), "Readiness external gates must be an array");
    const gateIds = new Set();
    for (const gate of input.externalGates) {
      assert(gate && typeof gate === "object" && !Array.isArray(gate), "Invalid Readiness external gate");
      assertKeys(gate, gateKeys, `Readiness external gate ${gate.gateId || "unknown"}`);
      assert(typeof gate.gateId === "string" && gate.gateId, "Missing Readiness external gate ID");
      const node = nodeById.get(gate.gateId);
      assert(node?.type === "external_gate", `Unknown Readiness external gate: ${gate.gateId}`);
      assert(!gateIds.has(gate.gateId), `Duplicate Readiness external gate: ${gate.gateId}`);
      gateIds.add(gate.gateId);
      assert(typeof gate.satisfied === "boolean", `Invalid external gate state: ${gate.gateId}`);
      assert(typeof gate.sourceRef === "string" && gate.sourceRef.trim(), `Missing external gate source: ${gate.gateId}`);
      assert(gate.verified === true, `Unverified Readiness external gate: ${gate.gateId}`);
    }
    return cloneFrozen(input);
  };

  const projectReadiness = (input) => {
    const request = validateRequest(input);
    const scheduleResult = scheduler.projectWeek(request.scheduleRequest);
    const snapshots = request.scheduleRequest.items.map((item) => item.priorityCandidate.snapshot);
    const snapshotByTargetId = new Map(snapshots.map((snapshot) => [snapshot.targetId, snapshot]));
    const itemByTargetId = new Map(request.scheduleRequest.items.map((item) => [item.priorityCandidate.targetId, item]));
    const externalGateStates = Object.fromEntries(request.externalGates.map((gate) => [gate.gateId, gate.satisfied]));
    const scheduledPrimaryTargets = new Set(scheduleResult.sessions.filter((session) => session.companionOf === null).map((session) => session.targetId));

    const targets = request.focusTargetIds.map((targetId) => {
      const snapshot = snapshotByTargetId.get(targetId) || null;
      const gate = mastery.evaluatePrerequisiteGate(targetId, snapshots, externalGateStates);
      const scheduleItem = itemByTargetId.get(targetId) || null;
      const priorityResult = scheduleItem ? scheduler.priority.scoreCandidate(scheduleItem.priorityCandidate) : null;
      const critical = priorityResult?.criticalOverride === true;
      const criticalScheduled = !critical || scheduledPrimaryTargets.has(targetId);
      const reasons = [];
      if (!snapshot) reasons.push("FOCUS_MASTERY_EVIDENCE_MISSING");
      if (!gate.ready) reasons.push("BLOCKING_PREREQUISITE_UNSATISFIED");
      if (gate.unresolvedExternalGateIds.length > 0) reasons.push("EXTERNAL_GATE_UNRESOLVED");
      if (!criticalScheduled) reasons.push("CRITICAL_TARGET_NOT_SCHEDULED");
      if (gate.advisory.length > 0) reasons.push("ADVISORY_PREREQUISITES_PRESENT");

      const claimedMasterReady = snapshot?.knowledgeState === "master_ready";
      const requiredMasterReadyChecks = mastery.contract.masterReadyGate.requiredDimensions;
      const verifiedMasterReady = claimedMasterReady
        && snapshot?.masterReadyGate?.passed === true
        && requiredMasterReadyChecks.every((dimension) => snapshot.masterReadyGate.checks?.[dimension] === true)
        && (snapshot.masterReadyGate.russianTermsRequired !== true || snapshot.masterReadyGate.checks?.russianTechnicalTerms === true);
      if (claimedMasterReady && !verifiedMasterReady) reasons.push("MASTER_READY_GATE_UNVERIFIED");
      const red = !snapshot || !gate.ready || !criticalScheduled || (claimedMasterReady && !verifiedMasterReady);
      const masterReady = verifiedMasterReady;
      const color = red ? "red" : masterReady ? "green" : "yellow";
      const status = color === "red"
        ? contract.statusPolicy.red.code
        : color === "green"
          ? contract.statusPolicy.green.code
          : contract.statusPolicy.yellow.code;
      if (!red) reasons.push(masterReady ? "MASTER_READY_WITH_PREREQUISITES" : "PREREQUISITE_READY_NOT_MASTER_READY");

      return {
        targetId,
        color,
        status,
        knowledgeState: snapshot?.knowledgeState || null,
        masterySnapshotPresent: Boolean(snapshot),
        prerequisiteReady: gate.ready,
        masterReady,
        critical,
        criticalScheduled,
        scheduledSessionCount: scheduleResult.sessions.filter((session) => session.targetId === targetId).length,
        blockerCount: gate.blockers.length,
        advisoryCount: gate.advisory.length,
        unresolvedExternalGateIds: gate.unresolvedExternalGateIds,
        blockers: gate.blockers,
        reasonCodes: reasons,
        persisted: false
      };
    });

    const counts = {
      targets: targets.length,
      red: targets.filter((target) => target.color === "red").length,
      yellow: targets.filter((target) => target.color === "yellow").length,
      green: targets.filter((target) => target.color === "green").length,
      unresolvedExternalGates: new Set(targets.flatMap((target) => target.unresolvedExternalGateIds)).size,
      unscheduledCriticalTargets: targets.filter((target) => target.critical && !target.criticalScheduled).length
    };
    const overallColor = counts.red > 0 ? "red" : counts.yellow > 0 ? "yellow" : "green";

    return deepFreeze({
      schema: resultSchema.$id,
      reportId: request.reportId,
      phaseId: request.phaseId,
      weekStart: scheduleResult.weekStart,
      overallColor,
      targets,
      counts,
      scheduleReadiness: {
        allCriticalScheduled: scheduleResult.readiness.allCriticalScheduled,
        gd1MinimumAdvisoryMet: scheduleResult.readiness.gd1MinimumAdvisoryMet,
        usedMinutes: scheduleResult.usedMinutes,
        remainingMinutes: scheduleResult.remainingMinutes,
        persisted: false
      },
      persisted: false,
      dashboardUiRendered: false,
      runtimeWriteAllowed: false,
      notificationWriteAllowed: false
    });
  };

  return Object.freeze({
    manifest: cloneFrozen(manifest),
    contract: cloneFrozen(contract),
    consumer,
    mastery,
    scheduler,
    validateRequest,
    projectReadiness
  });
}
