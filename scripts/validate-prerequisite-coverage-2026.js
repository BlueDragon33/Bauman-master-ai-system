'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const prereqPath = path.join(root, 'assets/data/prerequisite-registry-iu5-2026.json');
const coveragePath = path.join(root, 'assets/data/prerequisite-content-coverage-2026.json');
const prereq = JSON.parse(fs.readFileSync(prereqPath, 'utf8'));
const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const unique = values => new Set(values).size === values.length;

const expectedGateIds = [...prereq.coreGates, ...prereq.jitBridgeGates].map(x => x.id);
const expectedGateSet = new Set(expectedGateIds);
const auditedGateIds = (coverage.gates || []).map(x => x.gateId);
const auditedGateSet = new Set(auditedGateIds);
const allowedStatuses = new Set(coverage.allowedStatuses || []);

assert(coverage.schema === 'bauman_prerequisite_content_coverage_v1', 'unexpected coverage schema');
assert(coverage.policy?.noFabricatedCoveragePercent === true, 'coverage audit must forbid fabricated coverage percentages');
assert(coverage.policy?.statusIsQualitative === true, 'coverage audit statuses must remain qualitative');
assert(unique(auditedGateIds), 'coverage gate IDs must be unique');
assert(auditedGateIds.length === expectedGateIds.length, `coverage must audit all ${expectedGateIds.length} gates; got ${auditedGateIds.length}`);

for (const gateId of expectedGateIds) {
  assert(auditedGateSet.has(gateId), `missing gate audit ${gateId}`);
}
for (const gate of coverage.gates || []) {
  assert(expectedGateSet.has(gate.gateId), `coverage references unknown gate ${gate.gateId}`);
  assert(allowedStatuses.has(gate.status), `${gate.gateId} has invalid status ${gate.status}`);
  assert(typeof gate.homeSubject === 'string' && gate.homeSubject.length > 0, `${gate.gateId} missing homeSubject`);
  assert(Array.isArray(gate.evidence) && gate.evidence.length > 0, `${gate.gateId} must have evidence records`);
  assert(Array.isArray(gate.verifiedExisting), `${gate.gateId} verifiedExisting must be an array`);
  assert(Array.isArray(gate.missingOrUnverified), `${gate.gateId} missingOrUnverified must be an array`);
  assert(typeof gate.action === 'string' && gate.action.length > 0, `${gate.gateId} missing action`);
  for (const evidence of gate.evidence || []) {
    assert(typeof evidence.path === 'string' && evidence.path.length > 0, `${gate.gateId} has evidence without path`);
    if (evidence.path) {
      const localPath = path.join(root, evidence.path);
      assert(fs.existsSync(localPath), `${gate.gateId} evidence path does not exist: ${evidence.path}`);
    }
  }
}

function assertKnownRefs(label, refs) {
  for (const ref of refs || []) {
    const gateId = String(ref).split(':')[0].trim();
    assert(expectedGateSet.has(gateId), `${label} references unknown gate ${gateId}`);
  }
}

const findings = coverage.criticalPathFindings || {};
assertKnownRefs('reuseWithoutBroadRebuild', findings.reuseWithoutBroadRebuild);
assertKnownRefs('repairOrExtend', findings.repairOrExtend);
assertKnownRefs('newCriticalContent', findings.newCriticalContent);
assertKnownRefs('deferUntilJIT', findings.deferUntilJIT);
assertKnownRefs('languagePassPending', findings.languagePassPending);
assertKnownRefs('highestPriority', findings.highestPriority);

const jsonText = JSON.stringify(coverage);
assert(!/coveragePercent|percentCovered|estimatedCoverage/i.test(jsonText), 'coverage audit must not invent numeric coverage percentages');
assert(!/official administrative prerequisite/i.test(jsonText) || prereq.notOfficialAdministrativePrerequisites === true, 'competency prerequisites must not be presented as official administrative prerequisites');

if (errors.length) {
  console.error(`PREREQ_COVERAGE_2026_VALIDATION_FAIL (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const statusCounts = {};
for (const gate of coverage.gates) statusCounts[gate.status] = (statusCounts[gate.status] || 0) + 1;
console.log('PREREQ_COVERAGE_2026_VALIDATION_PASS');
console.log(JSON.stringify({
  auditedGates: auditedGateIds.length,
  statusCounts,
  highestPriority: findings.highestPriority || []
}, null, 2));
