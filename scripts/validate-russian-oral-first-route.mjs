import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const fail=message=>{throw new Error(`RUSSIAN_ORAL_FIRST_ROUTE_GATE=FAIL\n${message}`)};
const assert=(value,message)=>{if(!value)fail(message)};

export function validateContract(contract){
  assert(contract?.schema==='RUSSIAN_ORAL_FIRST_ROUTE_CONTRACT_V1','Unexpected oral-first route schema');
  assert(contract.stage==='vn','Oral-first route contract must target Vietnam stage');
  assert(contract.freshLearner?.initialView==='overview','Fresh learner must keep overview entry');
  assert(contract.freshLearner?.learningTabDefault==='practice','Fresh learner learning tab must default to practice');
  assert(contract.freshLearner?.firstSuggestedLessonStep==='speaking','First suggested lesson step must be speaking');
  assert(contract.freshLearner?.continueFallback?.view==='learning'&&contract.freshLearner?.continueFallback?.learnTab==='practice','Continue fallback must lead to listening/speaking practice');
  const priority=contract.dashboardPriority||[];
  assert(priority[0]==='listening'&&priority[1]==='speaking','Dashboard must start with listening then speaking');
  assert(priority.indexOf('cyrillic_literacy')<priority.indexOf('visual_vocabulary'),'Cyrillic literacy must appear before vocabulary');
  assert(priority.indexOf('grammar')>priority.indexOf('visual_vocabulary'),'Grammar must remain after vocabulary support');
  for(const [key,value] of Object.entries(contract.preservation||{}))assert(value===true,`Preservation invariant changed: ${key}`);
  assert(contract.planning?.existingListeningSpeakingPriorityPreserved===true,'Existing oral-first planning weights must be preserved');
  return true;
}

export function validateRuntime(core,adapter,referenceUi,learningFlow,planning){
  assert(/DEFAULT=\{stage:'vn',view:'overview',learnTab:'practice'/.test(core),'Core fresh default is not practice');
  assert(/defaultState:\s*\{[\s\S]*?stage:\s*'vn',[\s\S]*?view:\s*'overview',[\s\S]*?learnTab:\s*'practice'/.test(adapter),'Adapter fresh default is not practice');
  assert(core.includes("if(!tabs.includes(state.learnTab))state.learnTab='practice'"),'Invalid-tab fallback is not oral-first');
  assert(referenceUi.includes("return {view:'learning',learnTab:'practice'}"),'Reference UI continue fallback is not oral-first');
  assert(learningFlow.includes("const STEP_ORDER=['speaking','theory','vocab','grammar','exercises','check']"),'Learning flow does not suggest speaking first');
  const skillStart=referenceUi.indexOf('const SKILLS=[');
  const skillEnd=referenceUi.indexOf('];',skillStart);
  const skills=referenceUi.slice(skillStart,skillEnd);
  const listen=skills.indexOf("'Nghe hiểu'");
  const speak=skills.indexOf("'Nói & shadowing'");
  const alphabet=skills.indexOf("'Bảng chữ Cyrillic'");
  const vocab=skills.indexOf("'Từ vựng trực quan'");
  const grammar=skills.indexOf("'Ngữ pháp'");
  assert(listen>=0&&speak>listen&&alphabet>speak&&vocab>alphabet&&grammar>vocab,'Reference UI skill priority order drifted');
  assert(/language:\s*\{listening:0\.32,\s*speaking:0\.30/.test(planning),'Existing planning listening/speaking weights changed unexpectedly');
  const loadState=core.match(/function loadState\(\)\{([^]*?)\}\nfunction sanitize/);
  assert(loadState&&loadState[1].includes('{...DEFAULT,...stored'),'Stored core state is not layered over defaults');
  return true;
}

export function loadAndValidate(){
  const contract=JSON.parse(fs.readFileSync('subjects/russian/contracts/oral-first-route-contract.v1.json','utf8'));
  validateContract(contract);
  validateRuntime(
    fs.readFileSync('subjects/russian/assets/core.js','utf8'),
    fs.readFileSync('subjects/russian/assets/subject-adapter.js','utf8'),
    fs.readFileSync('subjects/russian/assets/russian-reference-ui.js','utf8'),
    fs.readFileSync('subjects/russian/assets/learning-flow.js','utf8'),
    fs.readFileSync('subjects/russian/assets/planning-bridge.js','utf8')
  );
  return contract;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const c=loadAndValidate();
  console.log('RUSSIAN_ORAL_FIRST_ROUTE_GATE=PASS');
  console.log(JSON.stringify({initialView:c.freshLearner.initialView,defaultTab:c.freshLearner.learningTabDefault,firstSuggested:c.freshLearner.firstSuggestedLessonStep,storedStatePreserved:true},null,2));
}
