import assert from "node:assert/strict";
import fs from "node:fs";

const read = p => fs.readFileSync(p, "utf8");
const json = p => JSON.parse(read(p));

const adoption = json(".blueprint/constitution-adoption.json");
const constitution = read("prompts/CONSTITUTION.md");
const dependency = read("prompts/constitution/DEPENDENCY_INDEPENDENCE_POLICY.md");
const dependencyBudget = json("prompts/constitution/DEPENDENCY_BUDGET.json");
const execution = read("prompts/EXECUTION_PROTOCOL.md");
const registry = json("prompts/PROMPT_REGISTRY.json");
const subjectIndex = json("prompts/subjects/SUBJECT_PROMPT_INDEX.json");
const releaseAnnex = read("prompts/constitution/C3_RELEASE_ANNEX_SHARED.md");
const workSplit = read("prompts/hub/WORK_SPLIT_CHAT_CODEX.md");
const pyMaster = read("prompts/subjects/python/PYTHON_MASTER_PROMPT.md");
const py04 = read("prompts/subjects/python/PYTHON04_RUNTIME_TOOLCHAIN_DATA_AI_INTELLIGENCE.md");
const pyProviderDecision = read("prompts/subjects/python/evidence/PYTHON04_LOCAL_FIRST_PROVIDER_DECISION.md");
const pyProviderDecisionLegacy = read("prompts/subjects/python/evidence/PYTHON04_RUNTIME_PROVIDER_DECISION.md");
const pyState = json("prompts/subjects/python/PROJECT_STATE.json");
const pyPacket = json("prompts/subjects/python/CURRENT_WORK_PACKET.json");
const algState = json("prompts/subjects/algorithms/PROJECT_STATE.json");

assert.match(constitution,/DEPENDENCY_INDEPENDENCE_POLICY\.md/);

assert.equal(adoption.policyVersion,"1.2.0");
assert.ok(
  adoption.inheritedPillars.includes("operational-sovereignty-dependency-minimization"),
  "Constitution 1.2 sovereignty pillar must be inherited"
);
assert.deepEqual(adoption.disabledPillars,[]);
assert.deepEqual(adoption.constitutionalWaivers,[]);

assert.equal(registry.dependencyBudget,"prompts/constitution/DEPENDENCY_BUDGET.json");
assert.equal(dependencyBudget.constitutionPolicy,"blueprint-os:universal-century-grade@1.2.0");
assert.equal(dependencyBudget.defaultPrinciple,"LOCAL_FIRST_OFFLINE_FIRST_FREE_FIRST_PROVIDER_REPLACEABLE");

const byId = new Map(dependencyBudget.dependencies.map(item => [item.id,item]));
assert.equal(byId.get("browser-local-runtime")?.runtimeClass,"LOCAL_CORE");
assert.equal(byId.get("chatgpt")?.runtimeClass,"OPTIONAL_INTELLIGENCE");
assert.equal(byId.get("cloudflare-containers")?.costClass,"paid-optional");
assert.equal(byId.get("cloudflare-containers")?.canonicalState,"forbidden; execution provider only");
assert.equal(byId.get("google-drive-sync")?.runtimeClass,"OPTIONAL_SYNC");
assert.equal(byId.get("google-apps-script")?.runtimeClass,"OPTIONAL_SYNC");
assert.equal(dependencyBudget.acceptance.productionAuthority,"separate-explicit-release-gate");

assert.match(pyProviderDecision,/CANONICAL DEFAULT FOR CONSTITUTION 1\.2/);
assert.match(pyProviderDecision,/browser\/WASM runtime/);
assert.match(pyProviderDecision,/local desktop CPython/);
assert.match(pyProviderDecision,/optional managed sandbox\/container/);
assert.match(pyProviderDecision,/No paid managed provider is required for `LOCAL_STABLE`/);
assert.match(pyProviderDecisionLegacy,/SUPERSEDED AS CANONICAL DEFAULT/);
assert.match(pyProviderDecisionLegacy,/optional managed-sandbox provider/);

assert.match(constitution,/LOCAL-FIRST/);
assert.match(constitution,/OFFLINE-FIRST/);
assert.match(constitution,/FREE-FIRST/);

for (const marker of [
  "LOCAL-FIRST",
  "OFFLINE-FIRST",
  "FREE-FIRST",
  "Google Drive",
  "Google Sheets",
  "Google Apps Script",
  "LOCAL_STABLE",
  "MANAGED_PRODUCTION_STABLE",
  "THE USER OWNS THE SYSTEM"
]) assert.ok(dependency.includes(marker), "dependency policy missing "+marker);

assert.equal(registry.dependencyPolicy,"prompts/constitution/DEPENDENCY_INDEPENDENCE_POLICY.md");
assert.equal(registry.defaultInfrastructureProfile,"LOCAL_OFFLINE_FREE_FIRST");
assert.equal(registry.workAllocation.chatPercent,"90-95");
assert.equal(registry.workAllocation.codexPercent,"5-10");
assert.deepEqual(registry.releaseProfiles,["LOCAL_STABLE","SYNC_STABLE","PUBLISHED_STABLE","MANAGED_PRODUCTION_STABLE"]);

assert.equal(subjectIndex.globalDependencyPolicy,"prompts/constitution/DEPENDENCY_INDEPENDENCE_POLICY.md");
assert.equal(subjectIndex.infrastructureDefault,"LOCAL_FIRST_OFFLINE_FIRST_FREE_FIRST");

assert.match(execution,/Chat 90–95%/);
assert.match(execution,/Codex 5–10% maximum/);
assert.match(execution,/LOCAL_STABLE/);
assert.match(workSplit,/Chat 90–95%/);
assert.match(workSplit,/Codex 5–10% maximum/);

for (const profile of ["LOCAL_STABLE","SYNC_STABLE","PUBLISHED_STABLE","MANAGED_PRODUCTION_STABLE"]) {
  assert.ok(releaseAnnex.includes(profile), "release annex missing "+profile);
}
for (const legacyClause of ["# 0. ENTRY","# 5. PRODUCTION IDENTITY","# 7. OBSERVE"]) {
  assert.ok(releaseAnnex.includes(legacyClause), "release annex must preserve routed legacy clause anchor "+legacyClause);
}
assert.match(releaseAnnex,/Do not force managed cloud production/);
assert.match(releaseAnnex,/Optional provider failure does not block LOCAL_STABLE/);

assert.match(pyMaster,/browser\/WASM → local desktop CPython → optional managed sandbox/);
assert.match(py04,/browser\/WASM sandbox/);
assert.match(py04,/managed cloud container is an optional provider/);
assert.match(py04,/must not claim hidden-test confidentiality/);

assert.equal(pyState.status,"PYTHON06_PASS_NEEDS_REVALIDATION_LOCAL_FIRST_PROVIDER");
assert.deepEqual(pyState.needsRevalidation,["PYTHON04","PYTHON05","PYTHON06"]);
assert.equal(pyState.requiredReleaseProfile,"LOCAL_STABLE");
assert.deepEqual(pyState.blockers,[]);
assert.equal(pyState.executionGate,"LOCAL_FIRST_PROVIDER_MIGRATION");

assert.equal(pyPacket.packetId,"PYTHON-LOCAL-FIRST-20261006-001");
assert.equal(pyPacket.status,"READY_FOR_CHAT_IMPLEMENTATION");
assert.ok(pyPacket.migrationTargets.some(x=>x.id==="browser-wasm"&&x.priority===1));
assert.ok(pyPacket.migrationTargets.some(x=>x.id==="managed-container"&&x.status==="retain optional"));

assert.equal(algState.executionGate,"BLOCKED");
assert.equal(algState.blockedBySubject,"python");
assert.ok(algState.blockers.every(x=>!x.includes("/containers/me")),"Algorithms must not remain blocked on Cloudflare Containers permission");
assert.match(algState.nextAction,/Python completes local-first/);

console.log(JSON.stringify({
  ok:true,
  policy:"LOCAL_OFFLINE_FREE_FIRST",
  chat:"90-95%",
  codex:"5-10%",
  releaseProfiles:registry.releaseProfiles,
  pythonRevalidation:pyState.needsRevalidation,
  algorithmsGate:algState.executionGate
}));
