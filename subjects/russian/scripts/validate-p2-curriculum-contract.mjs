import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const readJson=(p)=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));

const target=readJson('subjects/russian/docs/p2/RUSSIAN_R01_R26_TARGET_CURRICULUM.json');
const migration=readJson('subjects/russian/docs/p2/RUSSIAN_P2_CURRENT_TO_TARGET_MIGRATION_MAP.json');
const skills=readJson('subjects/russian/docs/p2/RUSSIAN_P2_SKILL_ARCHITECTURE.json');
const curriculum=readJson('subjects/russian/data/curriculum.json');
const lessons=readJson('subjects/russian/data/lessons.json');
const manifest=readJson('subjects/russian/subject-manifest.json');

const expectedIds=Array.from({length:26},(_,i)=>`R${String(i+1).padStart(2,'0')}`);
const expectedStages=['vn','prep','hk1','hk2','hk3','hk4'];
const sortIds=(xs)=>[...xs].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));

assert.equal(target.schema,'RUSSIAN_P2_TARGET_CURRICULUM_V1');
assert.equal(target.phase,'P2');
assert.equal(target.runtimeCanonical,false,'P2 design artifacts must not become runtime canonical schema');
assert.equal(target.identityModel?.versionInIdentity,false);
assert.deepEqual(sortIds(target.modules.map(x=>x.id)),expectedIds);
assert.equal(new Set(target.modules.map(x=>x.id)).size,26);
assert.deepEqual(target.stages.map(x=>x.id),expectedStages);

const stageIds=new Set(target.stages.map(x=>x.id));
const gateIds=new Set(target.stages.map(x=>x.gate?.id).filter(Boolean));
for(const mod of target.modules){
  assert.equal(mod.legacyIdentity,mod.id,`${mod.id}: legacy identity changed`);
  assert.equal(mod.identityPolicy,'PRESERVE',`${mod.id}: identity must be preserved`);
  assert.ok(stageIds.has(mod.stage),`${mod.id}: unknown stage ${mod.stage}`);
  assert.ok(Array.isArray(mod.units)&&mod.units.length>0,`${mod.id}: target units missing`);
  const unitIds=new Set();
  for(let i=0;i<mod.units.length;i++){
    const unit=mod.units[i];
    const expectedUnit=`${mod.id}-U${String(i+1).padStart(2,'0')}`;
    assert.equal(unit.id,expectedUnit,`${mod.id}: unstable unit identity`);
    assert.ok(!unitIds.has(unit.id),`${mod.id}: duplicate unit ${unit.id}`);
    unitIds.add(unit.id);
    assert.equal(unit.microLessons?.length,3,`${unit.id}: expected three P2 learning-cycle micro-lessons`);
    const expectedPhases=['exposure-understanding','retrieval-controlled-production','transfer-real-world-performance'];
    unit.microLessons.forEach((micro,j)=>{
      assert.equal(micro.id,`${unit.id}-M0${j+1}`,`${unit.id}: unstable micro-lesson identity`);
      assert.equal(micro.phase,expectedPhases[j],`${micro.id}: learning cycle phase drift`);
      assert.ok(String(micro.objective||'').trim(),`${micro.id}: objective missing`);
    });
  }
  if(mod.stageGate) assert.ok(gateIds.has(mod.stageGate),`${mod.id}: unknown stage gate ${mod.stageGate}`);
}
for(const id of ['R01','R02','R03','R04']){
  assert.ok(target.modules.find(x=>x.id===id)?.exitGate?.performance,`${id}: Master Prompt module exit gate missing`);
}

const currentLessonIds=sortIds(lessons.map(x=>x.id));
assert.deepEqual(currentLessonIds,expectedIds,'Current lessons must retain exactly R01-R26');
assert.equal(new Set(lessons.map(x=>x.id)).size,26,'Current lesson IDs must be unique');
const curriculumIds=sortIds(curriculum.modules.flatMap(x=>x.lessonIds||[]));
assert.deepEqual(curriculumIds,expectedIds,'Current curriculum grouping must retain exactly R01-R26');

assert.equal(migration.schema,'RUSSIAN_P2_CURRENT_TO_TARGET_MIGRATION_V1');
assert.equal(migration.phase,'P2');
assert.deepEqual(sortIds(migration.entries.map(x=>x.id)),expectedIds);
for(const item of migration.entries){
  assert.equal(item.identityDecision,'PRESERVE_ID',`${item.id}: P2 may not rename IDs`);
  assert.equal(item.runtimeMutationInP2,false,`${item.id}: P2 may not mutate runtime schema/state`);
  assert.equal(item.deletionAllowed,false,`${item.id}: P2 may not delete useful content from title mismatch`);
  assert.ok(item.currentTitle&&item.targetTitle,`${item.id}: migration endpoints missing`);
}

assert.equal(skills.schema,'RUSSIAN_P2_SKILL_ARCHITECTURE_V1');
assert.equal(skills.phase,'P2');
assert.equal(skills.runtimeCanonical,false);
assert.equal(skills.phonetics?.progression?.length,14,'Phonetics progression must preserve the 14-step P2 ladder');
assert.equal(skills.listening?.ladder?.length,11,'Listening ladder must preserve L0-L10');
assert.match(skills.listening.ladder[0],/^L0\b/);
assert.match(skills.listening.ladder.at(-1),/^L10\b/);
assert.equal(skills.speaking?.progression?.at(-1),'PRESSURE Q&A');
assert.equal(skills.vocabulary?.noFabrication,true,'Unverified lexical fields must never be fabricated');
assert.equal(skills.writing?.handwritingNotWrittenProduction,true);
assert.equal(skills.speaking?.speechRecognitionRole,'signal-only-not-mastery-authority');
assert.deepEqual(skills.speaking?.owners,{
  basic:'speaking.json',
  contextualDialogue:'dialogue-bauman-az.json',
  advancedProductive:'deep-speaking-bauman.json',
  bridgeIndex:'speaking-link-index.json'
});

const runtimeDataIds=new Set([...(manifest.data||[]),...(manifest.dataFiles||[]).map(x=>x.id)]);
for(const forbidden of [
  'RUSSIAN_R01_R26_TARGET_CURRICULUM',
  'RUSSIAN_P2_CURRENT_TO_TARGET_MIGRATION_MAP',
  'RUSSIAN_P2_SKILL_ARCHITECTURE'
]){
  assert.ok(!runtimeDataIds.has(forbidden),`P2 design artifact leaked into runtime manifest: ${forbidden}`);
}

console.log(JSON.stringify({
  phase:'P2',
  status:'PASS',
  preservedMacroIds:expectedIds.length,
  stages:expectedStages.length,
  targetUnits:target.modules.reduce((n,x)=>n+x.units.length,0),
  targetMicroLessons:target.modules.reduce((n,x)=>n+x.units.reduce((m,u)=>m+u.microLessons.length,0),0),
  migrationEntries:migration.entries.length,
  runtimeCanonical:false
},null,2));
