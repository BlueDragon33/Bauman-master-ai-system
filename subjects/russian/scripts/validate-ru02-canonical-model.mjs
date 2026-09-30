import fs from 'node:fs';

const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const uniq = xs => new Set(xs).size === xs.length;
const existsOwnerPath = value => fs.existsSync(String(value).split('#')[0]);

const model = readJson('subjects/russian/data/canonical-model.json');
const owners = readJson('subjects/russian/data/canonical-owner-registry.json');
const graph = readJson('subjects/russian/docs/ru02/RUSSIAN_RU02_CONTENT_GRAPH.json');
const migration = readJson('subjects/russian/docs/ru02/RUSSIAN_RU02_MIGRATION_MAP.json');
const handoff = readJson('subjects/russian/docs/ru02/RU03_RU04_INPUT_CONTRACT.json');
const target = readJson('subjects/russian/docs/p2/RUSSIAN_R01_R26_TARGET_CURRICULUM.json');
const curriculum = readJson('subjects/russian/data/curriculum.json');
const lessons = readJson('subjects/russian/data/lessons.json');

assert(model.schemaVersion === '1.0.0', 'RU02 canonical model schemaVersion mismatch');
assert(model.kind === 'RUSSIAN_CANONICAL_CURRICULUM_MODEL', 'RU02 canonical model kind mismatch');
assert(model.runtimeIntegration === 'ADDITIVE_NOT_YET_CONSUMED', 'RU02 must remain additive until integration acceptance');
assert(model.compatibility?.destructiveResetForbidden === true, 'RU02 must forbid destructive learner-state reset');
assert(model.compatibility?.learnerStateMigrationRequired === false, 'RU02 must not require learner-state migration');

const expectedStages = ['vn','prep','hk1','hk2','hk3','hk4'];
assert(model.stages.length === 6, 'RU02 must expose six stages');
assert(JSON.stringify(model.stages.map(x=>x.id)) === JSON.stringify(expectedStages), 'RU02 stage identity/order drift');
assert(model.macroModules.length === 26, 'RU02 must preserve R01-R26');
assert(model.units.length === 243, 'RU02 unit count drift from P2 target');
assert(model.microLessons.length === 729, 'RU02 micro-lesson count drift from P2 target');

const moduleIds = model.macroModules.map(x=>x.id);
const expectedModules = Array.from({length:26},(_,i)=>'R'+String(i+1).padStart(2,'0'));
assert(uniq(moduleIds), 'RU02 duplicate macro-module ID');
assert(JSON.stringify(moduleIds) === JSON.stringify(expectedModules), 'RU02 R01-R26 identity/order drift');
assert(JSON.stringify(target.modules.map(x=>x.id)) === JSON.stringify(moduleIds), 'RU02 model no longer matches P2 target identity');
assert(JSON.stringify(lessons.map(x=>x.id)) === JSON.stringify(moduleIds), 'Legacy lessons R01-R26 compatibility identity drift');

const stageIds = new Set(model.stages.map(x=>x.id));
const unitIds = new Set(model.units.map(x=>x.id));
const microIds = new Set(model.microLessons.map(x=>x.id));
assert(uniq([...unitIds]), 'RU02 duplicate unit ID');
assert(uniq([...microIds]), 'RU02 duplicate micro-lesson ID');
for (const m of model.macroModules) {
  assert(stageIds.has(m.stageId), 'Unknown stage for '+m.id);
  assert(Array.isArray(m.unitIds) && m.unitIds.length > 0, 'Module without units: '+m.id);
  assert(Array.isArray(m.competencyIds) && m.competencyIds.length > 0, 'Module without competency: '+m.id);
  assert(m.compatibilitySource?.truthAuthority === false, 'Legacy lesson must not become canonical linguistic truth: '+m.id);
  for (const id of m.unitIds) assert(unitIds.has(id), 'Dangling unit ref '+id+' from '+m.id);
}
for (const u of model.units) {
  assert(/^R\d{2}-U\d{2}$/.test(u.id), 'Invalid stable unit ID '+u.id);
  assert(moduleIds.includes(u.moduleId), 'Unknown parent module '+u.moduleId);
  for (const id of u.microLessonIds) assert(microIds.has(id), 'Dangling micro-lesson ref '+id+' from '+u.id);
}
for (const ml of model.microLessons) {
  assert(/^R\d{2}-U\d{2}-M\d{2}$/.test(ml.id), 'Invalid stable micro-lesson ID '+ml.id);
  assert(unitIds.has(ml.unitId), 'Unknown parent unit '+ml.unitId);
}

const compIds = model.competencies.map(x=>x.id);
const compSet = new Set(compIds);
assert(model.competencies.length === 13 && uniq(compIds), 'RU02 competency identity set invalid');
for (const c of model.competencies) {
  assert(Array.isArray(c.requires), 'Competency requires must be array: '+c.id);
  for (const r of c.requires) assert(compSet.has(r), 'Missing competency prerequisite '+r+' for '+c.id);
  assert(Array.isArray(c.targetModules) && c.targetModules.length > 0, 'Unreachable/untaught competency '+c.id);
  for (const m of c.targetModules) assert(moduleIds.includes(m), 'Unknown competency target module '+m);
}
for (const m of model.macroModules) for (const c of m.competencyIds) assert(compSet.has(c), 'Unknown competency '+c+' in '+m.id);

const visiting = new Set(), visited = new Set();
const byId = new Map(model.competencies.map(x=>[x.id,x]));
function dfs(id) {
  if (visiting.has(id)) throw new Error('Competency prerequisite cycle at '+id);
  if (visited.has(id)) return;
  visiting.add(id);
  for (const p of byId.get(id).requires) dfs(p);
  visiting.delete(id); visited.add(id);
}
for (const id of compIds) dfs(id);
assert(visited.size === compIds.length, 'Unreachable competency graph');

assert(curriculum.stages.length === 6 && curriculum.modules.length === 6, 'Legacy curriculum compatibility shape drift');
assert(JSON.stringify(curriculum.modules.map(x=>x.id)) === JSON.stringify(expectedStages), 'Legacy curriculum.modules no longer behaves as stage bundles');

const requiredEntityTypes = [
 'Stage','MacroModule','Unit','MicroLesson','Competency','LinguisticFunction','PhoneticConcept','GrammarConcept','LexicalEntry','PhraseCollocation',
 'ListeningItem','SpeakingItem','DialogueScenario','DeepSpeakingTask','ReadingText','WritingTask','TechnicalConcept','AcademicFunction','Exercise',
 'AssessmentItem','PerformanceTask','ErrorPattern','RemediationPath','MediaAsset','ProvenanceRecord'
];
assert(owners.owners.length === requiredEntityTypes.length, 'RU02 owner registry must resolve 25 entity families');
const ownerTypes = owners.owners.map(x=>x.entityType);
assert(uniq(ownerTypes), 'Duplicate entity type in RU02 owner registry');
for (const t of requiredEntityTypes) assert(ownerTypes.includes(t), 'Missing canonical owner for '+t);
for (const o of owners.owners) {
  assert(o.canonicalOwner, 'Canonical owner path missing for '+o.entityType);
  if (o.materialization === 'MATERIALIZED') assert(existsOwnerPath(o.canonicalOwner), 'Materialized owner file missing for '+o.entityType);
  if (o.materialization === 'PLANNED_UNMATERIALIZED') assert(!existsOwnerPath(o.canonicalOwner), 'Owner exists but registry still says unmaterialized: '+o.entityType);
}

const speakingOwners = Object.fromEntries(owners.owners.filter(x=>['SpeakingItem','DialogueScenario','DeepSpeakingTask'].includes(x.entityType)).map(x=>[x.entityType,x.canonicalOwner]));
assert(speakingOwners.SpeakingItem === 'subjects/russian/data/speaking.json', 'Basic speaking owner drift');
assert(speakingOwners.DialogueScenario === 'subjects/russian/data/dialogue-bauman-az.json', 'Dialogue owner drift');
assert(speakingOwners.DeepSpeakingTask === 'subjects/russian/data/deep-speaking-bauman.json', 'Deep speaking owner drift');
assert(owners.derived.some(x=>x.id === 'speaking-link-index' && x.classification === 'DERIVED_REGENERABLE'), 'speaking-link-index must remain derived');

assert(graph.allowedRelations.includes('requires') && graph.allowedRelations.includes('teaches') && graph.allowedRelations.includes('remediates'), 'RU02 content graph relation contract incomplete');
assert(graph.crossDomainBindings.some(x=>x.from === 'AssessmentItem' && x.to === 'Competency' && x.ownerModule === 'RU04'), 'RU04 assessment binding handoff missing');

assert(migration.policy.strategy === 'INCREMENTAL_STRANGLER', 'RU02 migration strategy must be incremental strangler');
assert(migration.policy.idempotent === true, 'RU02 migration must be idempotent');
assert(migration.policy.destructiveResetForbidden === true, 'RU02 migration must forbid destructive reset');
assert(migration.policy.runtimeConsumerSwitchInRU02 === false, 'RU02 must not switch runtime consumers');
assert(migration.migrations.every(x=>x.runtimeSwitch === false), 'RU02 migration entry attempted runtime switch');
assert(migration.aliases['R01-R26'] === 'unchanged', 'R01-R26 alias/identity drift');

assert(handoff.state === 'READY', 'RU03/RU04 handoff must be READY');
assert(handoff.RU03?.forbidden?.includes('fabricate fields to satisfy schema'), 'RU03 no-fabrication boundary missing');
assert(handoff.RU04?.authoritativeStateOwner === 'subjects/russian/assets/assessment-mastery.js', 'RU04 authoritative state owner drift');
assert(handoff.sharedTruth.includes('exposure != progress != performance != mastery'), 'Evidence truth invariant missing');

console.log('RUSSIAN_RU02_CANONICAL_MODEL_GATE=PASS');
console.log(JSON.stringify({
  stages:model.stages.length,
  macroModules:model.macroModules.length,
  units:model.units.length,
  microLessons:model.microLessons.length,
  competencies:model.competencies.length,
  prerequisiteEdges:model.prerequisiteGraph.edges.length,
  ownerFamilies:owners.owners.length
}));
