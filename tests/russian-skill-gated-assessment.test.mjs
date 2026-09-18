import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateRuntime,validateBehavior} from '../scripts/validate-russian-skill-gated-assessment.mjs';

const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/skill-gated-assessment-contract.v1.json','utf8'));
const js=fs.readFileSync('subjects/russian/assets/skill-gated-assessment.js','utf8');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const copy=()=>structuredClone(c);

assert.equal(validateContract(copy()),true);
assert.equal(validateRuntime(js,index),true);
assert.equal(validateBehavior(js),true);

{const x=copy();x.aggregate.crossSkillInference=true;assert.throws(()=>validateContract(x),/isolation weakened/)}
{const x=copy();x.authority.runtimeReadOnly=false;assert.throws(()=>validateContract(x),/read-only evidence projection/)}
{const x=copy();x.thresholds.print_recognition.minSeenLetters=32;assert.throws(()=>validateContract(x),/Print recognition threshold weakened/)}
{const x=copy();x.thresholds.writing.minShortDictationItems=0;assert.throws(()=>validateContract(x),/Writing threshold weakened/)}
assert.throws(
  ()=>validateBehavior(js.replace(
    "const aggregateReady=REQUIRED.every(skill=>skills[skill].meetsGate===true);",
    "const aggregateReady=skills.listening.meetsGate===true;"
  )),
  /Aggregate readiness did not expose speaking blocker/
);
assert.throws(
  ()=>validateRuntime(js+"\nlocalStorage.setItem('x','y');",index),
  /forbidden mutation token/
);

console.log('RUSSIAN_SKILL_GATED_ASSESSMENT_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:6},null,2));
