import fs from 'node:fs';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';

const fail=m=>{throw new Error(`RUSSIAN_DIALOGUE_SCAFFOLD_GATE=FAIL\n${m}`)};
const assert=(v,m)=>{if(!v)fail(m)};

function functionSlice(src,name,nextName){
  const start=src.indexOf('function '+name+'(');
  assert(start>=0,`Missing function ${name}`);
  const end=src.indexOf('function '+nextName+'(',start+1);
  assert(end>start,`Missing end anchor for ${name}`);
  return src.slice(start,end);
}
export function validateContract(c){
  assert(c?.schema==='RUSSIAN_DIALOGUE_SCAFFOLD_CONTRACT_V1','Unexpected dialogue scaffold schema');
  assert(c.authority?.learnerFacingScaffold==='RUSSIAN_DIALOGUE_SCAFFOLD_V1','Unexpected scaffold authority');
  assert(c.authority?.masteryAuthorityUnchanged===true&&c.authority?.speakingEvidenceAuthorityUnchanged===true,'Dialogue scaffold must not take mastery/speaking evidence authority');
  assert(c.missingContext?.translationFallback===false,'Missing dialogue context must fail closed');
  assert(c.practice?.preserveHearBeforeSee===true&&c.practice?.russianContextHiddenBeforeFirstListen===true,'Hear-before-see invariant weakened');
  assert(c.invariants?.noVietnameseSemanticGloss===true&&c.invariants?.noEnglishSemanticGloss===true,'Translation gloss still permitted');
  return true;
}
export function loadHelper(js){
  const sandbox={globalThis:{}};sandbox.window=sandbox.globalThis;vm.createContext(sandbox);vm.runInContext(js,sandbox);return sandbox.globalThis.RussianDialogueScaffold;
}
export function validateHelper(js){
  for(const token of ['context_title_vi','communicative_functions_vi','meaning_vi','clue_en'])assert(!js.includes(token),`Helper references prohibited translation field: ${token}`);
  const api=loadHelper(js);assert(api?.schema==='RUSSIAN_DIALOGUE_SCAFFOLD_V1','Dialogue scaffold API missing');
  const d=api.describe({context_title_ru:'В метро',purpose_ru:'Спросить дорогу',vocabulary_seed_ru:['метро','станция']},{ru:'Где метро?',vi:'Metro ở đâu?'},0,'A');
  const payload=JSON.stringify(d);
  assert(d.status==='ready'&&d.context_ru==='В метро'&&d.line_ru==='Где метро?','Russian scaffold descriptor failed');
  assert(!payload.includes('Metro ở đâu'),'Vietnamese line leaked into scaffold');
  const missing=api.describe({context_title_vi:'Ở ga'},{ru:'Здравствуйте.'},0,'all');
  assert(missing.status==='missing_dialogue_context','Translation-only context must fail closed');
  return true;
}
export function validateAdapter(adapter){
  const start=adapter.indexOf('dialogueTitle(item){');
  const end=adapter.indexOf('mediaTitle(item){',start);
  assert(start>=0&&end>start,'Adapter dialogue helper block missing');
  const block=adapter.slice(start,end);
  for(const token of ['context_title_vi','communicative_functions_vi','vi_turns'])assert(!block.includes(token),`Adapter dialogue helper references prohibited translation field: ${token}`);
  assert(block.includes('const {vi,vi_text,translation_vi,gloss_vi,...safe}=turn||{};'),'Adapter dialogue turns must explicitly sanitize legacy translation fields');
  assert(block.includes('title_ru')&&block.includes('context_title_ru'),'Adapter dialogue title is not Russian/direct-context first');
  return true;
}
export function validateCore(core){
  const bridge=functionSlice(core,'dialogueScaffold','dialogueDirectTitle');
  const ui=functionSlice(core,'dialogueScaffoldHtml','dialogueMeta');
  const meta=functionSlice(core,'dialogueMeta','roleInstruction');
  const deep=functionSlice(core,'deepUnitTitle','renderDialogue');
  const dialogue=functionSlice(core,'renderDialogue','handwritingText');
  const practice=functionSlice(core,'renderPractice','speechMapLineButton');
  assert(bridge.includes('window.RussianDialogueScaffold?.describe?.'),'Core scaffold bridge does not point to canonical dialogue authority');
  assert(ui.includes('dialogue-direct-scaffold'),'Dialogue scaffold UI helper missing direct scaffold class');
  assert(meta.includes('dialogueScaffold('),'dialogueMeta does not use scaffold bridge');
  for(const token of ['context_title_vi','communicative_functions_vi','dialogueVi('])assert(!meta.includes(token),`dialogueMeta still uses legacy gloss: ${token}`);
  for(const token of ['context_title_vi','communicative_functions_vi','vi_turns','prompt_vi','unit_title_vi','scenario_vi','title_vi'])assert(!deep.includes(token),`Deep speaking still exposes translation scaffold: ${token}`);
  assert(!deep.includes('JSON.stringify(x)')&&!deep.includes('Object.values(v).flatMap(deepLines)'),'Deep speaking must fail closed instead of serializing unknown semantic fields');
  assert(!deep.includes('p.question||')&&!deep.includes('p.answer||'),'Deep speaking Q&A must not fall back to generic-language question/answer fields');
  assert(!deep.includes("unit.scenario_ru||unit.domain"),'Deep speaking overview must not fall back to generic-language domain text');
  assert(!deep.includes("unit.domain||unit.scenario_ru")&&!deep.includes("u.domain||''"),'Deep speaking learner metadata must not read generic-language domain fields');
  for(const [name,src] of [['renderDialogue',dialogue],['renderPractice',practice]]){
    assert(src.includes('dialogueScaffold('),`${name} does not use direct scaffold bridge`);
    for(const token of ['dialogueVi(','currentVi','toggle-vi','context_title_vi','communicative_functions_vi','vi_turns','prompt_vi','unit_title_vi','scenario_vi','title_vi'])assert(!src.includes(token),`${name} still exposes translation scaffold: ${token}`);
    assert(src.includes('dialogueScaffoldHtml(scaffold)'),`${name} does not render direct scaffold helper`);
  }
  assert(practice.includes("heard?dialogueScaffoldHtml(scaffold):''"),'Practice Russian scaffold is not hear-before-see gated');
  return true;
}
export function validateIndex(index){
  const helper=index.indexOf('assets/dialogue-scaffold.js'),core=index.indexOf('assets/core.js');
  assert(helper>=0&&helper<core,'Dialogue scaffold must load before core');
  assert(index.includes('assets/dialogue-scaffold.css'),'Dialogue scaffold CSS missing');
  return true;
}
export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/dialogue-scaffold-contract.v1.json','utf8'));
  validateContract(c);validateHelper(fs.readFileSync('subjects/russian/assets/dialogue-scaffold.js','utf8'));
  validateAdapter(fs.readFileSync('subjects/russian/assets/subject-adapter.js','utf8'));
  validateCore(fs.readFileSync('subjects/russian/assets/core.js','utf8'));
  validateIndex(fs.readFileSync('subjects/russian/index.html','utf8'));return c;
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_DIALOGUE_SCAFFOLD_GATE=PASS');
  console.log(JSON.stringify({authority:'scene_role_russian_context',translationGloss:false,hearBeforeSee:true},null,2));
}
