import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract} from '../scripts/validate-academic-loader-failure-injection.mjs';
const original=JSON.parse(fs.readFileSync('foundation/content-resolution/academic-loader-failure-injection-contract.v1.json','utf8'));
const copy=()=>structuredClone(original);
assert.equal(validateContract(copy()),true);
{
  const x=copy();x.scenarios[0].expected.legacyCoreFallback=true;
  assert.throws(()=>validateContract(x),/Tampered-byte fail-closed/);
}
{
  const x=copy();x.scenarios[1].expected.coreRequestCount=1;
  assert.throws(()=>validateContract(x),/Missing-registry request/);
}
{
  const x=copy();x.scenarios[1].expected.academicGlobalsPublished=true;
  assert.throws(()=>validateContract(x),/Missing-registry fail-closed/);
}
{
  const x=copy();x.safety.schedulerMutationUntouched=false;
  assert.throws(()=>validateContract(x),/safety invariant/);
}
console.log('ACADEMIC_VERIFIED_LOADER_FAILURE_INJECTION_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:4,failClosed:true},null,2));
