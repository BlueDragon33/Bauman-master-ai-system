import fs from 'node:fs';
import assert from 'node:assert/strict';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const reg=j('subjects/russian/data/scenario-registry.json');
const oral=j('subjects/russian/docs/ru05/RUSSIAN_RU05_ORAL_INTERACTION_CONTRACT.json');
const sm=j('subjects/russian/docs/ru05/RUSSIAN_RU05_SCENARIO_STATE_MACHINE.json');
const ev=j('subjects/russian/docs/ru05/RUSSIAN_RU05_EVIDENCE_EMISSION_CONTRACT.json');
assert.equal(oral.owners.speechAdapter,'subjects/russian/assets/speech-interaction-engine.js');
assert.equal(oral.masteryWrite,false);
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

const index=fs.readFileSync('subjects/russian/index.html','utf8');
const scenarioRuntime=fs.readFileSync('subjects/russian/assets/scenario-runtime.js','utf8');
assert.match(index,/assets\/scenario-runtime\.js/,'RU05 scenario runtime is not loaded');
assert.match(scenarioRuntime,/PRACTICE_ONLY/,'scenario runtime must remain practice-only');
assert.match(scenarioRuntime,/writesMastery:false/,'scenario runtime must not write mastery');
assert.equal(reg.phase,'RU05','scenario registry still points to legacy phase');
assert.equal(reg.runtime?.authorityWrites,false,'scenario registry runtime authority boundary missing');
