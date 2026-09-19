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
assert.throws(
 ()=>validateCore(core.replace("window.RussianDialogueScaffold?.describe?.","window.OtherDialogueAuthority?.describe?.")),
 /canonical dialogue authority/
);
assert.throws(
 ()=>validateCore(core.replaceAll('dialogue-direct-scaffold','dialogue-scaffold-missing')),
 /UI helper missing direct scaffold class/
);
assert.throws(()=>validateAdapter(adapter.replace("dialogueTitle(item){ return item?.title_ru","dialogueTitle(item){ return item?.context_title_vi || item?.title_ru")),/prohibited translation field/);
assert.throws(()=>validateCore(core.replace("unit?.unit_title_ru","unit?.unit_title_vi||unit?.unit_title_ru")),/translation scaffold/);
assert.throws(()=>validateCore(core.replace("return [];}", "return [JSON.stringify(v)];}")),/fail closed|serializing unknown semantic fields/);
assert.throws(()=>validateCore(core.replace("p.question_ru||p.q_ru||p.ru||'Как вы ответите?'", "p.question_ru||p.q_ru||p.ru||p.question||'Как вы ответите?'")),/generic-language question\/answer/);
assert.throws(()=>validateCore(core.replace("unit.scenario_ru||''","unit.scenario_ru||unit.domain||''")),/generic-language domain/);
console.log('RUSSIAN_DIALOGUE_SCAFFOLD_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:8},null,2));
