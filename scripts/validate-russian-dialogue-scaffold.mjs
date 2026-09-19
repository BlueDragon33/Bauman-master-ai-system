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
  assert(c.invariants?.turnProjectionAllShapesSanitized===true&&c.invariants?.genericTextFallbackRequiresCyrillic===true,'Dialogue turn projection must sanitize every shape and require Cyrillic text');
  assert(c.semanticRouting?.dialogueSearchAuthority==='russian_direct_context_only','Dialogue search authority must remain Russian/direct-context only');
  assert(c.semanticRouting?.deepLinkNaturalLanguageTags==='cyrillic_only','Deep-link natural-language routing must remain Cyrillic-only');
  assert(c.semanticRouting?.dialogueGroupDisplayAuthority==='russian_label_or_inert_id','Dialogue group display authority must remain Russian-label or inert-id only');
  assert(c.semanticRouting?.dialogueDifficultyDisplayAuthority==='russian_label_or_inert_id','Dialogue difficulty display authority must remain Russian-label or inert-id only');
  assert(c.semanticRouting?.legacyGenericDifficultyFieldsMayInfluenceRouting===false,'Legacy generic difficulty fields must not influence dialogue routing');
  assert(c.semanticRouting?.sceneVisualAuthority==='russian_direct_context_only','Scene visual authority must remain Russian/direct-context only');
  assert(c.semanticRouting?.legacyGenericVietnameseFieldsMayInfluenceRouting===false,'Legacy generic Vietnamese fields must not influence dialogue routing');
  return true;
}
export function loadHelper(js){
  const sandbox={globalThis:{}};sandbox.window=sandbox.globalThis;vm.createContext(sandbox);vm.runInContext(js,sandbox);return sandbox.globalThis.RussianDialogueScaffold;
}
export function validateHelper(js){
  for(const token of ['context_title_vi','communicative_functions_vi','meaning_vi','clue_en'])assert(!js.includes(token),`Helper references prohibited translation field: ${token}`);
  const sceneStart=js.indexOf('function sceneIcon(dialogue){');
  const sceneEnd=js.indexOf('function lineText(line){',sceneStart);
  assert(sceneStart>=0&&sceneEnd>sceneStart,'Scene icon helper missing');
  const scene=js.slice(sceneStart,sceneEnd);
  assert(scene.includes('dialogue?.group_ru')&&scene.includes('dialogue?.context_title_ru'),'Scene icon does not use Russian semantic context');
  for(const token of ['dialogue?.group,','dialogue?.domain','dialogue?.category','dialogue?.tags'])assert(!scene.includes(token),`Scene icon reads generic semantic metadata: ${token}`);
  assert(scene.indexOf('/еда|столов|кафе|ресторан|обед|завтрак|ужин/')<scene.indexOf('/универс|бауман|заняти|урок|лекци|семинар|экзамен|учеб/'),'Concrete food scene matching must precede broad academic matching');
  const api=loadHelper(js);assert(api?.schema==='RUSSIAN_DIALOGUE_SCAFFOLD_V1','Dialogue scaffold API missing');
  const d=api.describe({context_title_ru:'В метро',purpose_ru:'Спросить дорогу',vocabulary_seed_ru:['метро','станция']},{ru:'Где метро?',vi:'Metro ở đâu?'},0,'A');
  const payload=JSON.stringify(d);
  assert(d.status==='ready'&&d.context_ru==='В метро'&&d.line_ru==='Где метро?','Russian scaffold descriptor failed');
  assert(!payload.includes('Metro ở đâu'),'Vietnamese line leaked into scaffold');
  const food=api.describe({group_ru:'Еда и столовая',context_title_ru:'Заказ в университетской столовой'},{ru:'Я хочу обед.'},0,'all');
  assert(food.scene_icon==='🍽️','Russian scene semantics did not select the concrete food icon before academic context');
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
  assert(block.includes('const {vi,vi_text,translation_vi,gloss_vi,meaning_vi,purpose_vi,clue_en,meaning_en,translation_en,en,...safe}=turn||{};'),'Adapter dialogue turns must explicitly sanitize all prohibited translation fields');
  assert(block.includes('return turns.map(project);'),'Adapter fallback turns must use the same sanitizer projector');
  assert(block.includes('/[А-Яа-яЁё]/.test(text)?text:\'\''),'Adapter dialogue line projection must reject non-Cyrillic generic text');
  assert(block.includes('title_ru')&&block.includes('context_title_ru'),'Adapter dialogue title is not Russian/direct-context first');
  assert(block.includes("dialogueGroup(item){ return item?.group_ru || item?.group_id || item?.source_group_id || 'general'; }"),'Adapter dialogue group must prefer Russian label and fail closed to inert IDs');
  assert(!block.includes("dialogueGroup(item){ return item?.group ||"),'Adapter dialogue group reintroduced generic-language group display');
  assert(block.includes("dialogueDifficulty(item){ return item?.difficulty_id || item?.difficulty_ru || 'all'; }"),'Adapter dialogue difficulty must use inert ID or Russian label only');
  assert(!block.includes("item?.difficulty ||")&&!block.includes("item?.level ||"),'Adapter dialogue difficulty reintroduced generic-language fallback');
  const searchStart=adapter.indexOf('dialogueSearchText(item){',start);
  const searchEnd=adapter.indexOf('dialogueTurns(item){',searchStart);
  assert(searchStart>=0&&searchEnd>searchStart,'Adapter dialogueSearchText helper missing');
  const search=adapter.slice(searchStart,searchEnd);
  assert(search.includes('title_ru')&&search.includes('context_title_ru')&&search.includes('group_ru'),'Dialogue search is not Russian/direct-context first');
  assert(search.includes('/[А-Яа-яЁё]/'),'Dialogue search must Cyrillic-filter natural-language semantic tags');
  assert(!/item\?\.(title|summary|prompt|answer|question|purpose|group)(?!_ru)\b/.test(search),'Dialogue search reintroduced generic-language semantic fields');
  for(const token of ['context_title_vi','communicative_functions_vi','vi_turns','translation_vi','gloss_vi','meaning_vi','clue_en'])assert(!search.includes(token),`Dialogue search references prohibited semantic field: ${token}`);
  return true;
}
export function validateCore(core){
  const bridge=functionSlice(core,'dialogueScaffold','dialogueDirectTitle');
  const ui=functionSlice(core,'dialogueScaffoldHtml','dialogueMeta');
  const meta=functionSlice(core,'dialogueMeta','roleInstruction');
  const deep=functionSlice(core,'deepUnitTitle','renderDialogue');
  const dialogue=functionSlice(core,'renderDialogue','handwritingText');
  const practice=functionSlice(core,'renderPractice','speechMapLineButton');
  const practiceSearch=functionSlice(core,'getPracticeDialogues','getTests');
  const dialogueSearch=functionSlice(core,'getDialogues','getMedia');
  assert(bridge.includes('window.RussianDialogueScaffold?.describe?.'),'Core scaffold bridge does not point to canonical dialogue authority');
  assert(ui.includes('dialogue-direct-scaffold'),'Dialogue scaffold UI helper missing direct scaffold class');
  assert(meta.includes('dialogueScaffold('),'dialogueMeta does not use scaffold bridge');
  assert(practiceSearch.includes("lower(A.dialogueSearchText?.(x)||'')"),'Practice dialogue search does not use fail-closed Russian/direct-context authority');
  assert(dialogueSearch.includes("lower(A.dialogueSearchText?.(x)||'')"),'Dialogue search does not use fail-closed Russian/direct-context authority');
  assert(dialogueSearch.includes("if(state.dialogueGroup!=='all'&&!groups.includes(state.dialogueGroup))state.dialogueGroup='all';"),'Dialogue group state is not recovered when legacy filter labels become invalid');
  assert(dialogueSearch.includes("if(state.dialogueDifficulty!=='all'&&!diffs.includes(state.dialogueDifficulty))state.dialogueDifficulty='all';"),'Dialogue difficulty state is not recovered when stored filters become invalid');
  assert(!practiceSearch.includes('lower(textOf(x))')&&!dialogueSearch.includes('lower(textOf(x))'),'Dialogue search may still fall back to generic-language itemText');
  assert(!core.includes("A.dialogueGroup?.(x)||x.group||'general'"),'Core reintroduced generic-language dialogue group fallback');
  assert(!core.includes("A.dialogueDifficulty?.(x)||x.difficulty||x.level||'all'")&&!core.includes("A.dialogueDifficulty?.(d)||d.difficulty||d.level||'all'"),'Core reintroduced generic-language dialogue difficulty fallback');
  assert(!/A\.dialogueGroup\?\.\([^)]+\)\|\|[^;\n]*?\.group(?!_ru|_id)\b/.test(core),'Core dialogue surfaces must not fall back to generic-language group labels');
  assert(deep.includes('function russianSemanticTags('),'Deep speaking Russian semantic-tag filter missing');
  assert(deep.includes('dialogue.group_ru')&&!/dialogue\.group(?!_ru|_id)/.test(deep),'Deep link routing reads generic dialogue.group instead of group_ru');
  assert(deep.includes('const unitTags=russianSemanticTags('),'Deep link unit tags are not Cyrillic-filtered');
  assert(deep.includes('unit.linked_speaking?.group_ru')&&deep.includes('unit.linked_speaking?.context_title_ru'),'Deep link routing is missing Russian linked-speaking context fields');
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
