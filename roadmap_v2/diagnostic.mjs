import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRoadmapConsumer } from "./consumer.mjs";

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

function readBytes(file) {
  return fs.readFileSync(file);
}

function readJson(file) {
  const bytes = readBytes(file);
  return { bytes, value: JSON.parse(bytes.toString("utf8")) };
}

function resolvePinned(baseDir, descriptor, id) {
  assert(typeof descriptor?.path === "string" && !path.isAbsolute(descriptor.path), `Invalid diagnostic path for ${id}`);
  const file = path.resolve(baseDir, descriptor.path);
  assert(file.startsWith(`${baseDir}${path.sep}`), `Diagnostic path escapes package: ${descriptor.path}`);
  assert(fs.existsSync(file), `Missing Roadmap diagnostic file: ${descriptor.path}`);
  const bytes = readBytes(file);
  assert(bytes.length === descriptor.bytes, `Roadmap diagnostic byte count mismatch: ${descriptor.path}`);
  assert(sha256(bytes) === descriptor.sha256, `Roadmap diagnostic hash mismatch: ${descriptor.path}`);
  return { file, bytes };
}

function pinnedJson(baseDir, descriptor, id) {
  const loaded = resolvePinned(baseDir, descriptor, id);
  return JSON.parse(loaded.bytes.toString("utf8"));
}

function cloneFrozen(value) {
  return deepFreeze(structuredClone(value));
}

function countBy(items, key) {
  const counts = {};
  for (const item of items) counts[item[key]] = (counts[item[key]] || 0) + 1;
  return counts;
}

function sameCounts(actual, expected) {
  const keys = new Set([...Object.keys(actual), ...Object.keys(expected)]);
  return [...keys].every((key) => (actual[key] || 0) === (expected[key] || 0));
}

export function loadRoadmapDiagnostic(options = {}) {
  const baseDir = path.resolve(options.baseDir || defaultBaseDir);
  const manifestLoaded = readJson(path.join(baseDir, "diagnostic", "manifest.json"));
  const manifest = manifestLoaded.value;

  assert(manifest.schema === "BAUMAN_ROADMAP_V2_DIAGNOSTIC_MANIFEST_V1", "Unsupported Roadmap diagnostic manifest schema");
  assert(manifest.status === "PASS_B91_ENGINE_CATALOG_BLOCKED_NO_ITEM_BANKS", "Roadmap diagnostic manifest is not B91 PASS");
  assert(manifest.mode === "read_only_diagnostic_harness", "Roadmap diagnostic is not a read-only harness");
  assert(manifest.productionIntegration === "disconnected", "Roadmap diagnostic production boundary is not locked");

  const consumerManifest = resolvePinned(baseDir, manifest.upstream.consumerManifest, "consumerManifest");
  const contract = pinnedJson(baseDir, manifest.files.diagnosticContract, "diagnosticContract");
  const contractSchema = pinnedJson(baseDir, manifest.files.diagnosticContractSchema, "diagnosticContractSchema");
  const catalogSchema = pinnedJson(baseDir, manifest.files.catalogSchema, "catalogSchema");
  const itemBankSchema = pinnedJson(baseDir, manifest.files.itemBankSchema, "itemBankSchema");
  const attemptSchema = pinnedJson(baseDir, manifest.files.attemptSchema, "attemptSchema");
  resolvePinned(baseDir, manifest.files.diagnosticEngine, "diagnosticEngine");
  const catalog = pinnedJson(baseDir, manifest.files.catalog, "catalog");
  const consumer = loadRoadmapConsumer({ baseDir });

  assert(sha256(consumerManifest.bytes) === catalog.source.consumerManifestSha256, "Diagnostic catalog/consumer hash mismatch");
  assert(contractSchema.$id === contract.schema, "Diagnostic contract/schema identity mismatch");
  assert(catalogSchema.$id === catalog.schema, "Diagnostic catalog/schema identity mismatch");
  assert(itemBankSchema.$id === contract.itemBankGate.schema, "Diagnostic item bank schema identity mismatch");
  assert(attemptSchema.$id === contract.attemptGate.schema, "Diagnostic attempt schema identity mismatch");
  assert(contract.mode.access === "read_only" && contract.mode.failClosed === true, "Diagnostic contract is not fail-closed read-only");
  assert(contract.capabilities.masteryEvidenceWrite === false && contract.capabilities.runtimeActivation === false, "Diagnostic enables unsafe writes");
  assert(catalog.counts.plans === manifest.counts.plans && catalog.plans.length === manifest.counts.plans, "Diagnostic plan count drift");
  assert(catalog.counts.executablePlans === 0 && manifest.safety.executablePlans === 0, "Diagnostic catalog is prematurely executable");
  assert(manifest.safety.generatedQuestionItems === 0 && manifest.safety.verifiedItemBanks === 0, "Diagnostic manifest fabricates question content");

  const planById = new Map(catalog.plans.map((item) => [item.id, item]));
  const planByTargetId = new Map(catalog.plans.map((item) => [item.targetId, item]));
  assert(planById.size === catalog.plans.length && planByTargetId.size === catalog.plans.length, "Duplicate diagnostic plan or target ID");

  const resolvePlan = (ref) => planById.get(ref) || planByTargetId.get(ref) || null;

  const validateProposedItemBank = (planRef, bank) => {
    const plan = resolvePlan(planRef);
    const errors = [];
    if (!plan) errors.push("UNKNOWN_PLAN");
    if (!bank || typeof bank !== "object") errors.push("INVALID_BANK_OBJECT");
    if (errors.length) return deepFreeze({ valid: false, errors, planId: plan?.id || null, bankId: bank?.bankId || null });

    if (bank.schema !== contract.itemBankGate.schema) errors.push("SCHEMA_MISMATCH");
    if (!Number.isInteger(bank.version) || bank.version < 1) errors.push("INVALID_VERSION");
    if (typeof bank.bankId !== "string" || !bank.bankId) errors.push("MISSING_BANK_ID");
    if (bank.targetId !== plan.targetId) errors.push("TARGET_MISMATCH");
    if (bank.policyId !== contract.assessmentPolicy.id) errors.push("POLICY_MISMATCH");
    if (bank.reviewStatus !== contract.itemBankGate.reviewStatusRequired) errors.push("BANK_NOT_VERIFIED");
    if (typeof bank.reviewedBy !== "string" || !bank.reviewedBy.trim()) errors.push("MISSING_REVIEWER");
    if (!Array.isArray(bank.sourceProvenance) || bank.sourceProvenance.length === 0 || bank.sourceProvenance.some((item) => typeof item !== "string" || !item.trim())) errors.push("MISSING_SOURCE_PROVENANCE");
    if (!Array.isArray(bank.items) || bank.items.length !== contract.assessmentPolicy.requiredItemCount) errors.push("ITEM_COUNT_MISMATCH");

    const items = Array.isArray(bank.items) ? bank.items : [];
    const itemIds = new Set();
    let criticalItems = 0;
    for (const item of items) {
      if (!item || typeof item !== "object") {
        errors.push("INVALID_ITEM_OBJECT");
        continue;
      }
      if (typeof item.id !== "string" || !item.id) errors.push("MISSING_ITEM_ID");
      else if (itemIds.has(item.id)) errors.push(`DUPLICATE_ITEM_ID:${item.id}`);
      else itemIds.add(item.id);
      if (item.targetId !== plan.targetId) errors.push(`ITEM_TARGET_MISMATCH:${item.id || "unknown"}`);
      if (!Object.hasOwn(contract.assessmentPolicy.difficultyDistribution, item.difficulty)) errors.push(`UNKNOWN_DIFFICULTY:${item.id || "unknown"}`);
      if (item.reviewStatus !== "verified") errors.push(`ITEM_NOT_VERIFIED:${item.id || "unknown"}`);
      if (item.critical === true) criticalItems += 1;
      if (typeof item.prompt !== "string" || !item.prompt.trim()) errors.push(`MISSING_PROMPT:${item.id || "unknown"}`);
      if (typeof item.rationale !== "string" || !item.rationale.trim()) errors.push(`MISSING_RATIONALE:${item.id || "unknown"}`);
      if (!Array.isArray(item.options) || item.options.length < 2) errors.push(`INVALID_OPTIONS:${item.id || "unknown"}`);
      const optionIds = new Set((item.options || []).map((option) => option?.id));
      if (optionIds.size !== (item.options || []).length || optionIds.has(undefined) || optionIds.has("")) errors.push(`DUPLICATE_OR_MISSING_OPTION_ID:${item.id || "unknown"}`);
      if (!optionIds.has(item.correctOptionId)) errors.push(`CORRECT_OPTION_MISSING:${item.id || "unknown"}`);
      if (!Array.isArray(item.prerequisiteRefs)) errors.push(`INVALID_PREREQUISITE_REFS:${item.id || "unknown"}`);
      else for (const ref of item.prerequisiteRefs) if (!consumer.sidecar.hasNode(ref)) errors.push(`UNKNOWN_PREREQUISITE_REF:${ref}`);
      if (!Array.isArray(item.evidenceTags) || item.evidenceTags.length === 0) errors.push(`MISSING_EVIDENCE_TAGS:${item.id || "unknown"}`);
    }

    if (contract.assessmentPolicy.requiresCriticalItems && criticalItems === 0) errors.push("NO_CRITICAL_ITEMS");
    const actualDistribution = countBy(items, "difficulty");
    if (!sameCounts(actualDistribution, contract.assessmentPolicy.difficultyDistribution)) errors.push("DIFFICULTY_DISTRIBUTION_MISMATCH");

    return deepFreeze({
      valid: errors.length === 0,
      errors: [...new Set(errors)],
      planId: plan.id,
      targetId: plan.targetId,
      bankId: bank.bankId || null,
      itemCount: items.length,
      criticalItems,
      difficultyDistribution: actualDistribution,
      catalogAttachmentStatus: plan.executionStatus,
      catalogExecutionReady: plan.executionReady,
      proposedBankHarnessOnly: true
    });
  };

  const projectProposedSession = (planRef, bank) => {
    const validation = validateProposedItemBank(planRef, bank);
    assert(validation.valid, `Diagnostic item bank rejected: ${validation.errors.join(", ")}`);
    const plan = resolvePlan(planRef);
    return deepFreeze({
      schema: "BAUMAN_ROADMAP_V2_DIAGNOSTIC_SESSION_PROJECTION_V1",
      planId: plan.id,
      targetId: plan.targetId,
      bankId: bank.bankId,
      policyId: plan.policyId,
      items: bank.items.map((item) => ({
        id: item.id,
        difficulty: item.difficulty,
        critical: item.critical,
        prompt: item.prompt,
        options: item.options.map((option) => ({ id: option.id, text: option.text })),
        prerequisiteRefs: [...item.prerequisiteRefs],
        evidenceTags: [...item.evidenceTags]
      })),
      exposesAnswerKey: false,
      proposedBankHarnessOnly: true,
      productionExecutable: false,
      persistenceAllowed: false
    });
  };

  const evaluateProposedAttempt = (planRef, bank, attempt) => {
    const validation = validateProposedItemBank(planRef, bank);
    assert(validation.valid, `Diagnostic item bank rejected: ${validation.errors.join(", ")}`);
    const plan = resolvePlan(planRef);
    assert(attempt && typeof attempt === "object", "Invalid diagnostic attempt");
    assert(attempt.schema === contract.attemptGate.schema, "Diagnostic attempt schema mismatch");
    assert(typeof attempt.attemptId === "string" && attempt.attemptId, "Missing diagnostic attempt ID");
    assert(attempt.planId === plan.id, "Diagnostic attempt plan mismatch");
    assert(attempt.bankId === bank.bankId, "Diagnostic attempt bank mismatch");
    assert(Array.isArray(attempt.responses), "Diagnostic responses must be an array");
    assert(attempt.responses.length === bank.items.length, contract.reasonCodes.INCOMPLETE_ATTEMPT);

    const itemById = new Map(bank.items.map((item) => [item.id, item]));
    const responseByItemId = new Map();
    for (const response of attempt.responses) {
      assert(response && typeof response === "object", "Invalid diagnostic response");
      assert(!responseByItemId.has(response.itemId), `Duplicate diagnostic response: ${response.itemId}`);
      const item = itemById.get(response.itemId);
      assert(item, `Unknown diagnostic response item: ${response.itemId}`);
      assert(item.options.some((option) => option.id === response.selectedOptionId), `Unknown diagnostic option: ${response.itemId}/${response.selectedOptionId}`);
      responseByItemId.set(response.itemId, response);
    }
    assert(responseByItemId.size === itemById.size, contract.reasonCodes.INCOMPLETE_ATTEMPT);

    let correct = 0;
    let criticalCorrect = 0;
    let criticalTotal = 0;
    const incorrectItemIds = [];
    const gapPrerequisiteRefs = new Set();
    for (const item of bank.items) {
      const isCorrect = responseByItemId.get(item.id).selectedOptionId === item.correctOptionId;
      if (isCorrect) correct += 1;
      else {
        incorrectItemIds.push(item.id);
        for (const ref of item.prerequisiteRefs) gapPrerequisiteRefs.add(ref);
      }
      if (item.critical) {
        criticalTotal += 1;
        if (isCorrect) criticalCorrect += 1;
      }
    }

    const scorePercent = (correct / bank.items.length) * 100;
    const criticalPercent = criticalTotal ? (criticalCorrect / criticalTotal) * 100 : 0;
    const overallPass = scorePercent >= contract.assessmentPolicy.passPercent;
    const criticalPass = criticalPercent >= contract.assessmentPolicy.criticalItemFloorPercent;
    const status = overallPass && criticalPass
      ? contract.statusSemantics.pass
      : overallPass && !criticalPass
        ? contract.statusSemantics.criticalFloorFail
        : contract.statusSemantics.fail;
    assert(status !== contract.statusSemantics.forbiddenOutcome, "Diagnostic emitted forbidden Master-ready outcome");

    return deepFreeze({
      schema: "BAUMAN_ROADMAP_V2_DIAGNOSTIC_RESULT_V1",
      attemptId: attempt.attemptId,
      planId: plan.id,
      targetId: plan.targetId,
      bankId: bank.bankId,
      status,
      score: {
        correct,
        total: bank.items.length,
        percent: scorePercent,
        criticalCorrect,
        criticalTotal,
        criticalPercent
      },
      incorrectItemIds,
      gapPrerequisiteRefs: [...gapPrerequisiteRefs].sort(),
      masterReady: false,
      persistable: false,
      proposedBankHarnessOnly: true,
      reasonCodes: [
        ...(overallPass && !criticalPass ? ["CRITICAL_ITEM_FLOOR_NOT_MET"] : []),
        "DIAGNOSTIC_PASS_NOT_MASTER_READY",
        "MASTERY_PERSISTENCE_DISABLED",
        "PRODUCTION_DISCONNECTED"
      ]
    });
  };

  const api = {
    manifest: cloneFrozen(manifest),
    contract: cloneFrozen(contract),
    catalog: cloneFrozen(catalog),
    consumer,
    getPlan: (ref) => cloneFrozen(resolvePlan(ref)),
    getReadiness: (ref) => {
      const plan = resolvePlan(ref);
      if (!plan) return null;
      return deepFreeze({
        planId: plan.id,
        targetId: plan.targetId,
        executionReady: plan.executionReady,
        executionStatus: plan.executionStatus,
        itemBank: cloneFrozen(plan.itemBank),
        reasonCodes: cloneFrozen(plan.reasonCodes)
      });
    },
    validateProposedItemBank,
    projectProposedSession,
    evaluateProposedAttempt
  };
  return Object.freeze(api);
}
