import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCurrentPrerequisitePolicy} from './roadmap-v2-prerequisite-policy.mjs';

const before=fs.readFileSync('roadmap_v2/consumer/blueprint.json');
const first=buildCurrentPrerequisitePolicy();
const second=buildCurrentPrerequisitePolicy();
assert.deepEqual(first,second,'prerequisite policy projection is not deterministic');

assert.equal(first.schema,'BAUMAN_ROADMAP_V2_CURRENT_PREREQUISITE_POLICY_V1');
assert.equal(first.version,1);
assert.equal(first.source.consumerBlueprintSchema,'BAUMAN_ROADMAP_V2_CONSUMER_BLUEPRINT_V1');
assert.equal(first.mode.access,'read_only_projection');
assert.equal(first.mode.productionIntegration,'disconnected');
assert.equal(first.mode.persistenceEnabled,false);
assert.equal(first.mode.runtimeActivation,false);
assert.equal(first.counts.chapters,85);
assert(first.counts.prerequisiteEdges>0);
for(const type of ['blocking','just_in_time','alternative','concurrent','recommended','contextual']){
  assert(first.counts.edgeTypes[type]>0,`missing current prerequisite edge type: ${type}`);
}
assert(first.counts.anyOfGroups>0);

for(const key of ['missingAssignedRefs','missingAssignedGates','unknownRefs','unknownGates','selfRefs','duplicateEdgeKeys','cycleNodes']){
  assert.deepEqual(first.validation[key],[],`prerequisite policy validation failed: ${key}`);
}
assert.equal(first.validation.topologicalChapterCount,85);
assert.equal(first.validation.result,'PASS');

function edgesTo(target){return first.edges.filter(e=>e.to===target);}
const mathAlt=edgesTo('MATH-L0-C02');
assert(mathAlt.some(e=>e.from==='MATH-L0-C01'&&e.type==='blocking'&&e.logic==='any_of'));
assert(mathAlt.some(e=>e.from==='EXT-EXISTING-COMPETENCY-CONFIRMED'&&e.type==='alternative'&&e.logic==='any_of'));
assert.equal(new Set(mathAlt.filter(e=>e.logic==='any_of').map(e=>e.groupId)).size,1,'MATH-L0-C02 alternatives must share one any-of group');

const pyRecommended=edgesTo('PY-L2-C05');
assert(pyRecommended.some(e=>e.from==='PY-L2-C04'&&e.type==='blocking'),'required PY-L2-C04 incorrectly weakened');
assert(pyRecommended.some(e=>e.from==='DB-L1-C02'&&e.type==='recommended'),'recommended DB-L1-C02 not isolated');
assert.equal(pyRecommended.find(e=>e.from==='PY-L2-C04').type,'blocking');

const concurrent=edgesTo('ML-L3-C08');
assert(concurrent.some(e=>e.from==='ML-L1-C01'&&e.type==='blocking'),'ML-L1-C01 must remain blocking');
assert(concurrent.some(e=>e.from==='RU-R3-C07'&&e.type==='concurrent'),'RU-R3-C07 must be concurrent');

const justInTime=edgesTo('ML-L1-C02');
assert(justInTime.some(e=>e.from==='ML-L1-C01'&&e.type==='blocking'));
assert(justInTime.some(e=>e.from==='MATH-L1-C03'&&e.type==='blocking'));
assert(justInTime.some(e=>e.from==='MATH-L1-C04'&&e.type==='blocking'));
assert(justInTime.some(e=>e.from==='MATH-L3-C09-L02'&&e.type==='just_in_time'));
assert(justInTime.some(e=>e.from==='MATH-L3-C09-L03'&&e.type==='just_in_time'));

const contextual=edgesTo('RU-R2-C06');
assert(contextual.some(e=>e.from==='RU-R2-C05'&&e.type==='blocking'));
assert(contextual.some(e=>e.from==='EXT-TECH-CHAPTER-IN-PROGRESS'&&e.type==='contextual'));

const externalBlocking=edgesTo('RU-R3-C08');
assert(externalBlocking.some(e=>e.from==='RU-R3-C07'&&e.type==='blocking'));
assert(externalBlocking.some(e=>e.from==='EXT-COMPLETE-TECHNICAL-PROJECT'&&e.type==='blocking'));

const serialized=JSON.stringify(first);
assert.equal(serialized.includes('e383912354673bdce7a0059d6b9a23799d74e689'),false);
assert.equal(serialized.includes('generatedAt'),false);
assert.deepEqual(fs.readFileSync('roadmap_v2/consumer/blueprint.json'),before,'H1 projection mutated current Consumer Blueprint');
assert.equal(fs.existsSync('roadmap_v2/graph/prerequisite-graph.json'),false,'historical graph must remain quarantined');

console.log('ROADMAP_V2_L24_H1_PREREQUISITE_POLICY=PASS');
console.log(JSON.stringify({
  chapters:first.counts.chapters,
  prerequisiteEdges:first.counts.prerequisiteEdges,
  anyOfGroups:first.counts.anyOfGroups,
  edgeTypes:first.counts.edgeTypes,
  deterministic:true,
  sourceMutation:false,
  historicalGraphAdmitted:false
},null,2));
