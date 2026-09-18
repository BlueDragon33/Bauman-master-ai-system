import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateSource} from '../scripts/validate-academic-loader-authority-trial.mjs';

const original=JSON.parse(fs.readFileSync('foundation/content-resolution/academic-loader-authority-trial-contract.v1.json','utf8'));
const source=fs.readFileSync('assets/js/academic-main.js','utf8');
const copy=()=>structuredClone(original);

assert.equal(validateContract(copy()),true);
assert.equal(validateSource(source),true);

{
  const x=copy(); x.activation.defaultEnabled=true;
  assert.throws(()=>validateContract(x),/became default/);
}
{
  const x=copy(); x.defaultMode.existingFetchJsonAuthoritative=false;
  assert.throws(()=>validateContract(x),/Legacy default authority drifted/);
}
{
  const x=copy(); x.trialMode.legacyCoreFallbackOnFailure=true;
  assert.throws(()=>validateContract(x),/silently fall back/);
}
{
  const x=copy(); x.trialMode.coreResourceCount=4;
  assert.throws(()=>validateContract(x),/scope expanded/);
}
{
  const x=copy(); x.trialMode.prerequisitePackFilesRemainExistingLoader=false;
  assert.throws(()=>validateContract(x),/pack file authority changed/);
}
{
  const x=copy(); x.safety.schedulerAuthorityUnchanged=false;
  assert.throws(()=>validateContract(x),/Safety invariant changed/);
}
assert.throws(()=>validateSource(source.replace("const VERIFIED_LOADER_TRIAL_VALUE='1'","const VERIFIED_LOADER_TRIAL_VALUE='on'")),/query value missing/);
assert.throws(()=>validateSource(source.replace("const {curriculum,prereq,manifest}=await loadCoreData();","const [curriculum,prereq,manifest]=await Promise.all([]);")),/does not use arbitration/);

console.log('ACADEMIC_VERIFIED_LOADER_AUTHORITY_TRIAL_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:8,defaultMode:'legacy_fetch',trialFallback:false},null,2));
