import fs from 'node:fs';
import assert from 'node:assert/strict';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const reg=j('subjects/russian/data/scenario-registry.json');
const oral=j('subjects/russian/docs/ru05/RUSSIAN_RU05_ORAL_INTERACTION_CONTRACT.json');
const sm=j('subjects/russian/docs/ru05/RUSSIAN_RU05_SCENARIO_STATE_MACHINE.json');
const ev=j('subjects/russian/docs/ru05/RUSSIAN_RU05_EVIDENCE_EMISSION_CONTRACT.json');
const handoff=j('subjects/russian/docs/ru05/RU06_RU07_RU08_INPUT_CONTRACT.json');
const engine=fs.readFileSync('subjects/russian/assets/scenario-engine.js','utf8');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const adapter=fs.readFileSync('subjects/russian/assets/subject-adapter.js','utf8');

assert.equal(reg.phase,'RU05');
assert.equal(reg.legacySourceResponsibility,'P11');
assert.deepEqual(reg.engine,{
 dialogueRuntimeOwner:'RU05',
 speechRecognitionOwner:'RU05',
 recordingOwner:'RU05',
 masteryOwner:'RU04',
 plannerOwner:'RU04',
 linguisticTruthOwner:'RU03',
 aiCoachOwner:'RU07',
 duplicateSpeechEngineAllowed:false
});
assert.equal(oral.owners.speechAdapter,'subjects/russian/assets/speech-interaction-engine.js');
assert.equal(oral.masteryWrite,false);
for(const family of ['real-life','administration','classroom','lab','seminar','research','defense']) assert(reg.progression.requiredScenarioFamilies.includes(family),'missing scenario family '+family);

const ids=new Set();
for(const s of reg.scenarios||[]){
 assert(!ids.has(s.id),'duplicate scenario '+s.id); ids.add(s.id);
 assert(s.startNode && s.nodes?.[s.startNode],'invalid start node '+s.id);
 const nodeIds=new Set(Object.keys(s.nodes||{}));
 const seen=new Set(), stack=[s.startNode];
 let hasCompletion=false, hasRepair=false, hasUnexpected=false;
 while(stack.length){
  const n=stack.pop(); if(seen.has(n)) continue; seen.add(n);
  const node=s.nodes[n]; assert(node,'missing node '+s.id+':'+n);
  if(node.completion) hasCompletion=true;
  if(Array.isArray(node.repairPath)&&node.repairPath.length) hasRepair=true;
  if(node.unexpectedTurn) hasUnexpected=true;
  for(const next of node.next||[]){assert(nodeIds.has(next),'dangling next '+s.id+':'+next); stack.push(next);}
 }
 assert.equal(seen.size,nodeIds.size,'unreachable node in '+s.id);
 assert(hasCompletion,'missing completion '+s.id);
 assert(hasRepair,'missing repair path '+s.id);
 assert(hasUnexpected,'missing unexpected turn '+s.id);
}
for(const x of ['language-failure','stt-failure','network-failure','engine-failure','world-task-failure']) assert(ev.separatesFailures.includes(x));
assert(sm.repairStrategies.includes('clarify'));

assert.match(engine,/RUSSIAN_SCENARIO_SESSION_V1/);
assert.match(engine,/RUSSIAN_ORAL_EVIDENCE_EVENT_V1/);
assert.match(engine,/authoritative:false/);
assert.match(engine,/masteryWrite:false/);
assert.match(engine,/sessionStorage/);
assert.match(engine,/replay/);
assert.match(index,/assets\/scenario-engine\.js/);
assert.match(index,/assets\/scenario-engine\.css/);
assert.match(adapter,/['"]scenario-registry['"]/);
assert(fs.existsSync('tests/russian-scenario-journey-browser.mjs'),'RU05 browser/mobile/offline journey missing');
assert.equal(handoff.state,'PASS');
assert.equal(handoff.scenarioRuntime.masteryWrite,false);
assert.equal(handoff.scenarioRuntime.replayCreatesNewRunIdentity,true);
assert.equal(handoff.ru07Boundary.mayChangeWorldState,false);
assert.equal(handoff.ru07Boundary.mayChangeCompletionSemantics,false);
assert.equal(handoff.ru07Boundary.mayWriteMastery,false);

for(const p of [
 'subjects/russian/docs/p6/RUSSIAN_AUDIO_OWNER_MAP.md',
 'subjects/russian/docs/p6/RUSSIAN_SPEAKING_BROWSER_MATRIX.md',
 'subjects/russian/docs/p6/RUSSIAN_AUDIO_OFFLINE_POLICY.md',
 'subjects/russian/scripts/test-p6-speech-interaction-runtime.mjs'
]) assert(fs.existsSync(p),'required oral interaction evidence missing '+p);

console.log(JSON.stringify({ok:true,phase:reg.phase,scenarios:ids.size,datasetRoles:Object.keys(oral.datasetRoles).length,browserJourney:true,downstreamHandoff:true}));
