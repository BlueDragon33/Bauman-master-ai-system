import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateBridge,validateRuntime} from '../scripts/validate-russian-grammar-patterns.mjs';

const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/grammar-pattern-contract.v1.json','utf8'));
const data=JSON.parse(fs.readFileSync('subjects/russian/data/grammar-pattern-bridge.json','utf8'));
const gp=JSON.parse(fs.readFileSync('subjects/russian/data/grammar-path.json','utf8'));
const legacy=JSON.parse(fs.readFileSync('subjects/russian/data/grammar.json','utf8'));
const ids=new Set([...gp,...legacy].map(x=>x.id).filter(Boolean));
const js=fs.readFileSync('subjects/russian/assets/grammar-pattern-coach.js','utf8');
const css=fs.readFileSync('subjects/russian/assets/grammar-pattern-coach.css','utf8');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const copy=()=>structuredClone(c);

assert.equal(validateContract(copy()),true);
assert.equal(validateBridge(data,c,ids),true);
assert.equal(validateRuntime(js,css,core,index),true);

{const x=copy();x.policy.contrastBeforeRule=false;assert.throws(()=>validateContract(x),/sequence weakened/)}
{const x=structuredClone(data);x.entries[0].meaning_vi='x';assert.throws(()=>validateBridge(x,c,ids),/Translation field leaked/)}
{const x=structuredClone(data);x.entries[0].grammar_id='NO_SUCH_ID';assert.throws(()=>validateBridge(x,c,ids),/Orphan grammar mapping/)}
assert.throws(()=>validateRuntime(js.replace("if(row?.spoken<1)return","if(false)return"),css,core,index),/Contrast stage is not speak-gated/);

console.log('RUSSIAN_GRAMMAR_PATTERN_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:4},null,2));
