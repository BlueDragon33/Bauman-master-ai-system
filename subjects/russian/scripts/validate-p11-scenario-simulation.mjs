import fs from 'node:fs';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const need=(v,msg)=>{if(!v)throw new Error(msg)};
const registry=j('subjects/russian/data/scenario-registry.json');
const links=j('subjects/russian/data/speaking-link-index.json');
need(registry.schema==='RUSSIAN_SCENARIO_REGISTRY_V1','scenario registry schema');
if(registry.phase==='RU05'){
  need(registry.engine.dialogueRuntimeOwner==='RU05','RU05 must own dialogue runtime');
  need(registry.engine.speechRecognitionOwner==='RU05','RU05 must own speech recognition');
  need(registry.engine.recordingOwner==='RU05','RU05 must own recording');
  need(registry.engine.masteryOwner==='RU04','RU04 must own mastery');
  need(registry.engine.plannerOwner==='RU04','RU04 must own planning/review truth');
  need(registry.engine.linguisticTruthOwner==='RU03','RU03 must own linguistic truth');
  need(registry.engine.aiCoachOwner==='RU07','RU07 must own AI coaching');
}else{
  need(registry.engine.dialogueRuntimeOwner==='P6','Historical P11 snapshot must use P6 dialogue runtime');
  need(registry.engine.speechRecognitionOwner==='P6','Historical P11 snapshot must use P6 speech recognition');
  need(registry.engine.recordingOwner==='P6','Historical P11 snapshot must use P6 recording');
}
need(registry.engine.duplicateSpeechEngineAllowed===false,'duplicate speech engine forbidden');
for(const k of ['writesMastery','writesSrs','writesPlanner','officialAssessment']) need(registry.statePolicy[k]===false,'forbidden scenario authority: '+k);
const required=new Set(registry.progression.requiredScenarioFamilies||[]);
const seen=new Set(); const refs=[];
for(const s of registry.scenarios||[]){
  need(s.id&&s.family&&s.stage&&s.contextRef&&s.goal,'scenario identity incomplete');
  seen.add(s.family);
  need(links[s.contextRef],`missing root speaking context: ${s.id} -> ${s.contextRef}`);
  need(Array.isArray(s.roles)&&s.roles.length>=2,'scenario roles incomplete: '+s.id);
  need(s.startNode&&s.nodes?.[s.startNode],'scenario start node missing: '+s.id);
  const nodes=Object.values(s.nodes||{});
  need(nodes.some(n=>n.unexpectedTurn),'scenario unexpected turn missing: '+s.id);
  need(nodes.some(n=>Array.isArray(n.repairPath)&&n.repairPath.length),'scenario repair path missing: '+s.id);
  need(nodes.some(n=>n.completion==='practice'),'scenario practice completion missing: '+s.id);
  for(const n of nodes){
    if(n.contextRef){refs.push(n.contextRef);need(links[n.contextRef],`missing node context: ${s.id} -> ${n.contextRef}`);}
    for(const next of n.next||[]) need(s.nodes[next],`missing next node ${next} in ${s.id}`);
  }
}
for(const family of required) need(seen.has(family),'required scenario family missing: '+family);
need(new Set((registry.scenarios||[]).map(s=>s.stage)).size>=5,'scenario stage coverage too narrow');
const p6=fs.readFileSync('subjects/russian/docs/p6/RUSSIAN_LISTENING_SPEAKING_ENGINE_CONSTITUTION.md','utf8');
need(p6.includes('RussianSpeechRecognitionAdapter'),'P6 recognition owner evidence missing');
need(p6.includes('RussianRecordingEngine'),'P6 recording owner evidence missing');
console.log('RUSSIAN_P11_SCENARIO_SIMULATION_GATE=PASS',JSON.stringify({scenarios:registry.scenarios.length,families:[...seen],stages:[...new Set(registry.scenarios.map(s=>s.stage))],contextRefs:[...new Set(refs)].length}));
