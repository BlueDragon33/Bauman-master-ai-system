import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const modelPath = path.join(root, 'prompts/subjects/math/evidence/MATH_P2_CANONICAL_MODEL.json');
const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));

const fail = (msg) => { throw new Error('[MATH02] ' + msg); };
if (model.schemaVersion !== '1.0.0') fail('unexpected schemaVersion');
if (model.status !== 'VALIDATING') fail('contract must remain VALIDATING until repository evidence passes');
if (model.owner?.curriculumTruth !== 'prompts/subjects/math/evidence/MATH_P2_CANONICAL_MODEL.json') fail('canonical curriculum owner mismatch');

const tiers = Object.keys(model.evidenceSemantics || {});
for (const tier of ['exposure','progress','performance','mastery']) {
  if (!tiers.includes(tier)) fail('missing evidence tier ' + tier);
}
if (!/never granted from self-report/i.test(model.evidenceSemantics.mastery || '')) {
  fail('mastery truthfulness guard missing');
}

for (const [name, def] of Object.entries(model.entityFamilies || {})) {
  if (!def.prefix || !Array.isArray(def.required) || !def.required.includes('provenance')) {
    fail('entity family lacks prefix/required provenance: ' + name);
  }
}

const counts = new Set(model.countSemantics || []);
for (const key of ['actualRecordCount','plannedTargetCount','coverageCount','derivedIndexCount','legacyCompatibilityCount']) {
  if (!counts.has(key)) fail('missing count semantic ' + key);
}

if (!model.migration?.preserveLearnerState) fail('learner-state preservation must be explicit');
if (!model.migration?.rollbackRequired) fail('rollback requirement missing');
if (model.mathematicalTruth?.generatedCandidateCanonicalByDefault !== false) fail('generated candidate authority unsafe');

const topo = model.topology?.order || [];
if (topo.join('>') !== 'stage>discipline>chapter>lesson') fail('non-deterministic topology');

console.log('PASS MATH02 canonical contract');
