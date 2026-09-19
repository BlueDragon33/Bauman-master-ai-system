import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateHelper,loadHelper,validateAdapter,validateCore} from '../scripts/validate-russian-dialogue-scaffold.mjs';
const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/dialogue-scaffold-contract.v1.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/dialogue-scaffold.js','utf8');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const adapter=fs.readFileSync('subjects/russian/assets/subject-adapter.js','utf8');
const copy=()=>structuredClone(c);
assert.equal(validateContract(copy()),true);
assert.equal(validateHelper(js),true);
assert.equal(validateAdapter(adapter),true);
assert.equal(validateCore(core),true);
const api=loadHelper(js);
const x=api.describe({context_title_vi:'Trong lớp',communicative_functions_vi:['hỏi bài']},{ru:'Повторите, пожалуйста.',meaning_vi:'Xin hãy nhắc lại.'},0,'all');
assert.equal(x.status,'missing_dialogue_context');
assert.equal(x.line_ru,'Повторите, пожалуйста.');
assert(!JSON.stringify(x).includes('Trong lớp'));
{const y=copy();y.missingContext.translationFallback=true;assert.throws(()=>validateContract(y),/must fail closed/)}
{const y=copy();y.practice.russianContextHiddenBeforeFirstListen=false;assert.throws(()=>validateContract(y),/Hear-before-see invariant weakened/)}
{const y=copy();y.semanticRouting.legacyGenericVietnameseFieldsMayInfluenceRouting=true;assert.throws(()=>validateContract(y),/must not influence dialogue routing/)}
assert.throws(
 ()=>validateCore(core.replace("window.RussianDialogueScaffold?.describe?.","window.OtherDialogueAuthority?.describe?.")),
 /canonical dialogue authority/
);
assert.throws(
 ()=>validateCore(core.replaceAll('dialogue-direct-scaffold','dialogue-scaffold-missing')),
 /UI helper missing direct scaffold class/
);
assert.throws(()=>validateAdapter(adapter.replace("dialogueTitle(item){ return item?.title_ru","dialogueTitle(item){ return item?.context_title_vi || item?.title_ru")),/prohibited translation field/);
assert.throws(()=>validateAdapter(adapter.replace("item?.id,item?.title_ru,item?.context_title_ru","item?.id,item?.title,item?.title_ru,item?.context_title_ru")),/generic-language semantic fields/);
assert.throws(()=>validateAdapter(adapter.replace("dialogueGroup(item){ return item?.group_ru || item?.group_id || item?.source_group_id || 'general'; }","dialogueGroup(item){ return item?.group || item?.group_ru || 'general'; }")),/group|generic-language/);
assert.throws(()=>validateCore(core.replace("unit?.unit_title_ru","unit?.unit_title_vi||unit?.unit_title_ru")),/translation scaffold/);
assert.throws(()=>validateCore(core.replace("return Object.entries(v).filter(([k,val])=>val&&typeof val==='object'&&(/_ru$|^ru_|russian/i.test(k)||Array.isArray(val))).flatMap(([,val])=>deepLines(val));","return Object.values(v).flatMap(deepLines);")),/fail closed|serializing unknown semantic fields/);
assert.throws(()=>validateCore(core.replace("p.question_ru||p.q_ru||p.ru||'Как вы ответите?'", "p.question_ru||p.q_ru||p.ru||p.question||'Как вы ответите?'")),/generic-language question\/answer/);
assert.throws(()=>validateCore(core.replace("unit.scenario_ru||''","unit.scenario_ru||unit.domain||''")),/generic-language domain/);
assert.throws(()=>validateCore(core.replace("unit.scenario_ru||'Luyện phản xạ nói sâu theo tình huống đang mở.'","unit.domain||unit.scenario_ru||'Luyện phản xạ nói sâu theo tình huống đang mở.'")),/learner metadata|generic-language domain/);
assert.throws(()=>validateCore(core.replace("u.scenario_ru||''","u.domain||''")),/learner metadata/);
assert.throws(()=>validateCore(core.replaceAll("lower(A.dialogueSearchText?.(x)||'')","lower(textOf(x))")),/Dialogue search|Practice dialogue search|generic-language itemText/);
assert.throws(()=>validateCore(core.replace("dialogue.group_ru,dialogue.context_title_ru","dialogue.group,dialogue.context_title_ru")),/generic dialogue\.group|group_ru/);
assert.throws(()=>validateCore(core.replace("const unitTags=russianSemanticTags(","const unitTags=arr(")),/Cyrillic-filtered|semantic-tag filter/);
assert.throws(()=>validateCore(core.replace("A.dialogueGroup?.(x)||x.group_ru||x.group_id||x.source_group_id||'general'","A.dialogueGroup?.(x)||x.group||'general'")),/generic-language dialogue group fallback/);
assert.throws(()=>validateCore(core.replace("A.dialogueGroup?.(d)||d.group_ru||d.group_id||d.source_group_id||'general'","A.dialogueGroup?.(d)||d.group||'general'")),/generic-language group labels/);
assert.throws(()=>validateCore(core.replace("if(state.dialogueGroup!=='all'&&!groups.includes(state.dialogueGroup))state.dialogueGroup='all';","")),/group state is not recovered/);
console.log('RUSSIAN_DIALOGUE_SCAFFOLD_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:20},null,2));
