import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  validateContract,
  validateRuntime,
  validateFocusedApis,
  validateCore,
  validateIndex,
  validateBehavior
} from '../scripts/validate-russian-weakness-repair-routing.mjs';

const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/weakness-repair-routing-contract.v1.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/weakness-repair-router.js','utf8');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const cyr=fs.readFileSync('subjects/russian/assets/cyrillic-literacy.js','utf8');
const reading=fs.readFileSync('subjects/russian/assets/reading-bridge.js','utf8');
const dictation=fs.readFileSync('subjects/russian/assets/dictation-listen-write.js','utf8');
const multimodal=fs.readFileSync('subjects/russian/assets/multimodal-review.js','utf8');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const copy=()=>structuredClone(c);

assert.equal(validateContract(copy()),true);
assert.equal(validateRuntime(js),true);
assert.equal(validateFocusedApis(cyr,reading,dictation,multimodal),true);
assert.equal(validateCore(core),true);
assert.equal(validateIndex(index),true);
assert.equal(validateBehavior(js),true);

{const x=copy();x.resolution.openDoesNotResolve=false;assert.throws(()=>validateContract(x),/Evidence-gated resolution weakened/)}
{const x=copy();x.authority.sourceEvidenceReadOnly=false;assert.throws(()=>validateContract(x),/additive\/read-only/)}
{const x=copy();x.invariants.noCanonicalReviewQueueMutation=false;assert.throws(()=>validateContract(x),/Scheduler\/Review Queue mutation forbidden/)}
assert.throws(()=>validateRuntime(js+"\nconst x='bauman_russian_learning_state_v1';"),/must not access canonical Learning State storage/);
assert.throws(()=>validateIndex(index.replace(/\n/g,'\\n')),/Literal newline escape remains/);
assert.throws(()=>validateCore(core.replace("if(doneAt>createdAt)plan.completed[card.id]=doneAt","plan.completed[card.id]=Date.now()")),/later correct review evidence/);
assert.throws(()=>validateCore(core.replace("toast('Đã mở thẻ phụ đạo; chưa tính hoàn thành cho tới khi có kết quả ôn đúng mới')","state.remedialPlan.completed[id]=Date.now()")),/marks completion immediately/);
assert.throws(()=>validateFocusedApis(cyr.replace('function openRepair(section,letter)','function openLegacy(section,letter)'),reading,dictation,multimodal),/Cyrillic focused repair API missing/);

console.log('RUSSIAN_WEAKNESS_REPAIR_ROUTING_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:8},null,2));
