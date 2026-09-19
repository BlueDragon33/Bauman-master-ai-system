import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateRuntime} from '../scripts/validate-russian-oral-first-route.mjs';

const contract=JSON.parse(fs.readFileSync('subjects/russian/contracts/oral-first-route-contract.v1.json','utf8'));
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const adapter=fs.readFileSync('subjects/russian/assets/subject-adapter.js','utf8');
const ui=fs.readFileSync('subjects/russian/assets/russian-reference-ui.js','utf8');
const flow=fs.readFileSync('subjects/russian/assets/learning-flow.js','utf8');
const planning=fs.readFileSync('subjects/russian/assets/planning-bridge.js','utf8');
const copy=()=>structuredClone(contract);

assert.equal(validateContract(copy()),true);
assert.equal(validateRuntime(core,adapter,ui,flow,planning),true);

{
  const x=copy();x.freshLearner.learningTabDefault='theory';
  assert.throws(()=>validateContract(x),/default to practice/);
}
{
  const x=copy();x.freshLearner.visibleLearningTabOrder=['theory','practice','exercises','review','exam'];
  assert.throws(()=>validateContract(x),/Visible learning tabs/);
}
{
  const x=copy();x.freshLearner.primaryLearningCta='theory';
  assert.throws(()=>validateContract(x),/Primary learning CTAs/);
}
{
  const x=copy();x.dashboardPriority=['visual_vocabulary','listening','speaking','cyrillic_literacy','reading','handwriting','grammar'];
  assert.throws(()=>validateContract(x),/start with listening then speaking/);
}
{
  const x=copy();x.preservation.existingStoredLearningTab=false;
  assert.throws(()=>validateContract(x),/Preservation invariant/);
}
assert.throws(()=>validateRuntime(core.replace("learnTab:'practice'","learnTab:'theory'"),adapter,ui,flow,planning),/Core fresh default/);
assert.throws(()=>validateRuntime(core,adapter.replace("['practice','🎙️','Nghe/Nói']","['theory','📘','Lý thuyết']"),ui,flow,planning),/Adapter visible learning-tab order/);
assert.throws(()=>validateRuntime(core.replace("state.learnTab=allowed.includes(tab)?tab:'practice'","state.learnTab=allowed.includes(tab)?tab:'theory'"),adapter,ui,flow,planning),/action fallback/);
assert.throws(()=>validateRuntime(core.replace("['Mở Nghe/Nói chính'","['Mở bài học chính'"),adapter,ui,flow,planning),/Overview primary CTAs/);
assert.throws(()=>validateRuntime(core.replace("'>Bắt đầu Nghe/Nói</button>","'>Bắt đầu học</button>"),adapter,ui,flow,planning),/Route-focus primary CTA/);
assert.throws(()=>validateRuntime(core,adapter,ui,flow.replace("['speaking','theory'","['theory','speaking'"),planning),/suggest speaking first/);
assert.throws(()=>validateRuntime(core,adapter,ui,flow,planning.replace('listening:0.32, speaking:0.30','listening:0.20, speaking:0.20')),/planning listening\/speaking weights/);

console.log('RUSSIAN_ORAL_FIRST_ROUTE_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:12},null,2));
