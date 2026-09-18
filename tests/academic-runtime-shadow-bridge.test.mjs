import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContract,validateSource} from '../scripts/validate-academic-runtime-shadow-bridge.mjs';

const contract=JSON.parse(fs.readFileSync('foundation/content-resolution/academic-runtime-shadow-contract.v1.json','utf8'));
const source=fs.readFileSync('assets/js/academic-content-resolution-shadow.js','utf8');
const indexHtml=fs.readFileSync('index.html','utf8');
const copy=()=>structuredClone(contract);

assert.equal(validateContract(copy()),true);
assert.equal(validateSource(source,indexHtml),true);

{
  const x=copy(); x.activation.defaultEnabled=true;
  assert.throws(()=>validateContract(x),/enabled by default/);
}
{
  const x=copy(); x.authority.shadowMayReplaceFetch=true;
  assert.throws(()=>validateContract(x),/Forbidden shadow authority/);
}
{
  const x=copy(); x.authority.shadowMayWriteLearnerState=true;
  assert.throws(()=>validateContract(x),/Forbidden shadow authority/);
}
{
  const x=copy(); x.resources=x.resources.slice(0,2);
  assert.throws(()=>validateContract(x),/exactly three/);
}
{
  const x=copy(); x.dependencies=x.dependencies.slice(0,7);
  assert.throws(()=>validateContract(x),/dependency.*drifted/);
}
assert.throws(()=>validateSource(source.replace("if(!enabled())","if(enabled())"),indexHtml),/Default-disabled fast path/);
assert.throws(()=>validateSource(source+"\nlocalStorage.setItem('x','1');",indexHtml),/persist browser storage/);
assert.throws(()=>validateSource(source+"\nwindow.BAUMAN_CURRICULUM_2026={};",indexHtml),/authoritative globals/);
{
  const x=copy(); x.verification.selfDerivedChecksums=true;
  assert.throws(()=>validateContract(x),/derive its own expected checksums/);
}
assert.throws(()=>validateSource(source+"\nroot.crypto.subtle.digest('SHA-256',new Uint8Array());",indexHtml),/must not derive expected checksums/);
assert.throws(()=>validateSource(source+"\nroot.BaumanRuntimeDeliveryExecutor.execute();",indexHtml),/must not own executor calls/);
assert.throws(()=>validateSource(source,indexHtml.replace('<script src="assets/js/academic-content-resolution-shadow.js"></script>','')),/missing Academic content shadow bridge/);

console.log('ACADEMIC_RUNTIME_SHADOW_BRIDGE_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:12,defaultEnabled:false,authoritySwitch:false},null,2));
