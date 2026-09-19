import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateSource} from '../scripts/validate-academic-verified-content-loader.mjs';

const original=JSON.parse(fs.readFileSync('foundation/content-resolution/academic-verified-loader-contract.v1.json','utf8'));
const source=fs.readFileSync('assets/js/academic-content-resolution-loader.js','utf8');
const indexHtml=fs.readFileSync('index.html','utf8');
const copy=()=>structuredClone(original);

assert.equal(validateContract(copy()),true);
assert.equal(validateSource(source,indexHtml),true);

{
  const x=copy(); x.behavior.autoRun=true;
  assert.throws(()=>validateContract(x),/auto-run/);
}
{
  const x=copy(); x.behavior.writesAcademicGlobals=true;
  assert.throws(()=>validateContract(x),/Forbidden loader behavior/);
}
{
  const x=copy(); x.behavior.loaderAuthority='authoritative';
  assert.throws(()=>validateContract(x),/gained authority/);
}
{
  const x=copy(); x.behavior.pinnedRegistryRequired=false;
  assert.throws(()=>validateContract(x),/Pinned registry is optional/);
}
{
  const x=copy(); x.resources=x.resources.slice(0,2);
  assert.throws(()=>validateContract(x),/resource count drifted/);
}
assert.throws(()=>validateSource(source+'\nwindow.BAUMAN_CURRICULUM_2026={};',indexHtml),/write Academic globals/);
assert.throws(()=>validateSource(source+'\nlocalStorage.setItem("x","1");',indexHtml),/persist browser storage/);
assert.throws(()=>validateSource(source,indexHtml.replace('<script src="assets/js/academic-content-resolution-loader.js"></script>','')),/missing verified loader candidate/);

console.log('ACADEMIC_VERIFIED_CONTENT_LOADER_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:8,autoRun:false,authority:'candidate_only'},null,2));
