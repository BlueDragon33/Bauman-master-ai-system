import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const blueprintPath='roadmap_v2/consumer/blueprint.json';
const schemaPath='roadmap_v2/consumer/blueprint.schema.json';
const builder='scripts/build-roadmap-v2-consumer-blueprint.mjs';

const run=spawnSync(process.execPath,[builder],{encoding:'utf8'});
if(run.status!==0)throw new Error(`Consumer blueprint rebuild failed\n${run.stdout}\n${run.stderr}`);
const committed=fs.readFileSync(blueprintPath,'utf8');
assert.equal(run.stdout,committed,'consumer blueprint is not byte-deterministic from current source spec');

const bp=JSON.parse(committed);
const schema=JSON.parse(fs.readFileSync(schemaPath,'utf8'));
const consumer=JSON.parse(fs.readFileSync('roadmap_v2/consumer/consumer-contract.json','utf8'));

assert.equal(bp.schema,'BAUMAN_ROADMAP_V2_CONSUMER_BLUEPRINT_V1');
assert.equal(schema.$id,bp.schema);
assert.equal(bp.version,1);
assert.equal(bp.source.syllabusSpecGitBlobSha,'fd1c3f179d66922faf6ac9363772f3d072851d00');
assert.equal(bp.source.consumerContractSchema,consumer.schema);
assert.equal(consumer.capabilities.diagnosticBlueprintRead,true);
assert.equal(consumer.capabilities.diagnosticExecution,false);
assert.equal(bp.mode.productionIntegration,'disconnected');
assert.equal(bp.mode.diagnosticExecution,false);
assert.equal(bp.mode.runtimeActivation,false);

assert.deepEqual(bp.counts,{
  chapters:85,
  eligibleChapterBlueprints:77,
  staticChapters:76,
  legacyPreserveChapters:1,
  dynamicChapters:8,
  numberedLessons:304,
  diagnosticTargets:381
});
assert.equal(bp.chapters.length,85);
assert.equal(bp.diagnosticTargets.length,381);
assert.equal(bp.blockedDynamicTargets.length,8);

const chapterIds=bp.chapters.map(x=>x.id);
const lessonIds=bp.chapters.flatMap(x=>x.lessons.map(l=>l.id));
const targetIds=bp.diagnosticTargets.map(x=>x.id);
assert.equal(new Set(chapterIds).size,85,'duplicate chapter ID');
assert.equal(new Set(lessonIds).size,304,'duplicate lesson ID');
assert.equal(new Set(targetIds).size,381,'duplicate diagnostic target ID');

const allIds=new Set([...chapterIds,...lessonIds]);
for(const ch of bp.chapters){
  for(const ref of ch.prerequisiteRefs)assert.equal(allIds.has(ref),true,`unknown prerequisite: ${ch.id} -> ${ref}`);
  for(const ext of ch.externalGateIds)assert.match(ext,/^EXT-[A-Z0-9-]+$/,`invalid external gate ID: ${ch.id} -> ${ext}`);
}
for(const t of bp.diagnosticTargets){
  assert.notEqual(t.deliveryMode,'dynamic',`dynamic target leaked into diagnostic blueprint: ${t.id}`);
  for(const ref of t.prerequisiteRefs)assert.equal(allIds.has(ref),true,`unknown target prerequisite: ${t.id} -> ${ref}`);
}

const expectedDynamic=[
 'RU-R4-C09','RU-R4-C10',
 'CUR-L4-C01','CUR-L4-C02','CUR-L4-C03','CUR-L4-C04','CUR-L4-C05','CUR-L4-C06'
].sort();
assert.deepEqual(bp.blockedDynamicTargets.map(x=>x.id).sort(),expectedDynamic);
assert.equal(bp.blockedDynamicTargets.every(x=>x.reasonCode==='DYNAMIC_INSTANCE_REQUIRED'),true);

assert.equal(bp.validation.uniqueChapterIds,true);
assert.equal(bp.validation.uniqueLessonIds,true);
assert.deepEqual(bp.validation.unknownPrerequisiteRefs,[]);
assert.equal(bp.validation.generatedQuestionItems,0);
assert.equal(bp.validation.executableDiagnosticPlans,0);
assert.equal(bp.validation.result,'PASS');

assert.equal(JSON.stringify(bp).includes('consumerManifest'),false,'historical consumer manifest coupling leaked into current blueprint');
assert.equal(JSON.stringify(bp).includes('e383912354673bdce7a0059d6b9a23799d74e689'),false,'historical baseline commit leaked into current blueprint');

console.log('ROADMAP_V2_L23_H1_CONSUMER_BLUEPRINT=PASS');
console.log(JSON.stringify({chapters:85,eligibleChapters:77,dynamicBlocked:8,lessons:304,diagnosticTargets:381,unknownPrerequisites:0,deterministic:true},null,2));
