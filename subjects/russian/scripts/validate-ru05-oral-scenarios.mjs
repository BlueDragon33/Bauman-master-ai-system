import fs from 'node:fs';
import assert from 'node:assert/strict';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const reg=j('subjects/russian/data/scenario-registry.json');
const oral=j('subjects/russian/docs/ru05/RUSSIAN_RU05_ORAL_INTERACTION_CONTRACT.json');
const sm=j('subjects/russian/docs/ru05/RUSSIAN_RU05_SCENARIO_STATE_MACHINE.json');
const ev=j('subjects/russian/docs/ru05/RUSSIAN_RU05_EVIDENCE_EMISSION_CONTRACT.json');
assert.equal(oral.owners.speechAdapter,'subjects/russian/assets/speech-interaction-engine.js');
assert.equal(oral.masteryWrite,false);
assert.equal(reg.activeOwner,'RU05');
assert.equal(reg.engine.dialogueRuntimeOwner,'RU05');
assert.equal(reg.engine.speechRecognitionOwner,'RU05');
assert.equal(reg.engine.recordingOwner,'RU05');
assert.equal(reg.engine.masteryOwner,'RU04');
assert.equal(reg.engine.plannerOwner,'RU04');
assert.equal(reg.engine.linguisticTruthOwner,'RU03');
assert.equal(reg.engine.aiCoachOwner,'RU07');
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
for(const f of ['language-failure','stt-failure','network-failure','engine-failure','world-task-failure']) assert(ev.separatesFailures.includes(f));
assert(sm.repairStrategies.includes('clarify'));
console.log(JSON.stringify({ok:true,scenarios:ids.size,datasetRoles:Object.keys(oral.datasetRoles).length}));
