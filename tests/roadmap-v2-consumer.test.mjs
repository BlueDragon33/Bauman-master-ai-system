import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadRoadmapConsumer } from "../roadmap_v2/consumer.mjs";

const packageRoot = path.resolve("roadmap_v2");

test("loads the pinned L22 consumer bridge with least-privilege capabilities", () => {
  const consumer = loadRoadmapConsumer();
  assert.equal(consumer.bridge.status, "PASS_B85_CONSUMER_CONTRACT");
  assert.equal(consumer.getCapability("registryRead"), true);
  assert.equal(consumer.getCapability("diagnosticBlueprintRead"), true);
  assert.equal(consumer.getCapability("diagnosticExecution"), false);
  assert.equal(consumer.getCapability("masteryEvidenceWrite"), false);
  assert.equal(consumer.getCapability("priorityEngineRead"), false);
  assert.equal(consumer.getCapability("runtimeActivation"), false);
  assert.equal(consumer.getCapability("unknown"), null);
});

test("classifies all legacy lessons without granting content or runtime eligibility", () => {
  const consumer = loadRoadmapConsumer();
  const records = consumer.listLegacyEligibility();
  assert.equal(records.length, 347);
  assert.equal(records.filter((item) => item.state === "VERIFIED_REFERENCE_ONLY").length, 5);
  assert.equal(records.filter((item) => item.state === "QUARANTINED_UNMAPPED").length, 342);
  assert.equal(records.every((item) => item.diagnosticExecutionEligible === false), true);
  assert.equal(records.every((item) => item.masteryEvidenceEligible === false), true);
  assert.equal(records.every((item) => item.priorityEngineEligible === false), true);
  assert.equal(records.every((item) => item.runtimeActivationEligible === false), true);
});

test("keeps overlays reference-only and framework outlines quarantined", () => {
  const consumer = loadRoadmapConsumer();
  const overlays = consumer.listOverlayEligibility();
  const framework = consumer.listFrameworkEligibility();
  assert.equal(overlays.length, 18);
  assert.equal(overlays.every((item) => item.state === "VERIFIED_OVERLAY_REFERENCE_ONLY"), true);
  assert.equal(overlays.every((item) => item.priorityEngineEligible === false), true);
  assert.equal(framework.length, 21);
  assert.equal(framework.every((item) => item.state === "QUARANTINED_OUTLINE"), true);
  assert.equal(framework.every((item) => item.mappingReferenceEligible === false), true);
});

test("exposes blueprint metadata but never claims executable diagnostics", () => {
  const consumer = loadRoadmapConsumer();
  const blueprints = consumer.listDiagnosticBlueprints();
  assert.equal(blueprints.length, 381);
  assert.equal(blueprints.filter((item) => item.sourceType === "roadmap_chapter").length, 77);
  assert.equal(blueprints.filter((item) => item.sourceType === "roadmap_lesson").length, 304);
  assert.equal(blueprints.every((item) => item.executionReady === false), true);
  assert.equal(consumer.getDiagnosticBlueprint("CUR-L4-C01"), null);
});

test("returns a complete immutable MATH-L2-C07 bundle", () => {
  const consumer = loadRoadmapConsumer();
  const bundle = consumer.getChapterBundle("MATH-L2-C07");
  assert.equal(bundle.eligibility.state, "LEGACY_COMPOSITE_BLUEPRINT_ONLY");
  assert.equal(bundle.provenance.authoritativeLegacyLessons.length, 5);
  assert.equal(bundle.provenance.frameworkOutlineCandidates.some((item) => item.legacyId === "m_p07"), true);
  assert.equal(bundle.diagnosticBlueprint.executionReady, false);
  assert.equal(Object.isFrozen(bundle), true);
  assert.equal(Object.isFrozen(bundle.provenance.authoritativeLegacyLessons), true);
  assert.throws(() => bundle.provenance.authoritativeLegacyLessons.push({}), TypeError);
});

test("audits every prerequisite edge across existing graph nodes", () => {
  const consumer = loadRoadmapConsumer();
  for (const edge of consumer.sidecar.graph.prerequisiteEdges) {
    assert.equal(consumer.sidecar.hasNode(edge.from), true, `missing ${edge.from}`);
    assert.equal(consumer.sidecar.hasNode(edge.to), true, `missing ${edge.to}`);
  }
  assert.equal(consumer.sidecar.graph.validation.cycleNodes.length, 0);
});

test("fails closed on unknown record and dynamic pre-instantiation access", () => {
  const consumer = loadRoadmapConsumer();
  assert.equal(consumer.getEligibility("DOES-NOT-EXIST"), null);
  assert.equal(consumer.getChapterBundle("DOES-NOT-EXIST"), null);
  assert.equal(consumer.getDiagnosticBlueprint("DOES-NOT-EXIST"), null);
  const dynamic = consumer.getEligibility("CUR-L4-C01");
  assert.equal(dynamic.state, "DYNAMIC_TEMPLATE_UNINSTANTIATED");
  assert.equal(dynamic.diagnosticBlueprintEligible, false);
  assert.equal(dynamic.reasonCodes.some((item) => item.id === "DYNAMIC_INSTANCE_REQUIRED"), true);
});

test("returns deep-frozen consumer results", () => {
  const consumer = loadRoadmapConsumer();
  const records = consumer.listLegacyEligibility();
  assert.equal(Object.isFrozen(consumer), true);
  assert.equal(Object.isFrozen(consumer.contract), true);
  assert.equal(Object.isFrozen(records), true);
  assert.equal(Object.isFrozen(records[0]), true);
  assert.throws(() => records.push({}), TypeError);
  assert.throws(() => { records[0].state = "UNSAFE"; }, TypeError);
});

test("fails closed when the consumer contract is tampered", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "bauman-consumer-tamper-"));
  try {
    fs.cpSync(packageRoot, temp, { recursive: true });
    fs.appendFileSync(path.join(temp, "consumer", "consumer-contract.json"), "\n");
    assert.throws(() => loadRoadmapConsumer({ baseDir: temp }), /consumer (byte count|hash) mismatch/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test("fails closed when a required consumer file is missing", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "bauman-consumer-missing-"));
  try {
    fs.cpSync(packageRoot, temp, { recursive: true });
    fs.rmSync(path.join(temp, "consumer", "consumer-contract.schema.json"));
    assert.throws(() => loadRoadmapConsumer({ baseDir: temp }), /Missing Roadmap consumer file/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test("fails closed when the pinned upstream sidecar manifest drifts", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "bauman-consumer-upstream-"));
  try {
    fs.cpSync(packageRoot, temp, { recursive: true });
    fs.appendFileSync(path.join(temp, "manifest.json"), "\n");
    assert.throws(() => loadRoadmapConsumer({ baseDir: temp }), /upstream manifest hash mismatch/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
