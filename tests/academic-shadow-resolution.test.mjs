import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateProfile,extractLoaderPaths} from '../scripts/validate-academic-shadow-resolution.mjs';

const original=JSON.parse(fs.readFileSync('foundation/content-resolution/shadow/academic-core-2026.v1.json','utf8'));
const copy=()=>structuredClone(original);
const source=fs.readFileSync('assets/js/academic-main.js','utf8');

assert.equal(validateProfile(copy()),true);
assert.equal(Object.keys(extractLoaderPaths(source,copy())).length,3);

{
  const x=copy(); x.authoritySwitch=true;
  assert.throws(()=>validateProfile(x),/switch loader authority/);
}
{
  const x=copy(); x.runtimeMutation=true;
  assert.throws(()=>validateProfile(x),/mutate runtime/);
}
{
  const x=copy(); x.promotedRegistryAuthority=true;
  assert.throws(()=>validateProfile(x),/promoted authority/);
}
{
  const x=copy(); x.resources=x.resources.slice(0,2);
  assert.throws(()=>validateProfile(x),/exactly three resources/);
}
{
  const x=copy(); x.resources[0].path='../secret.json';
  assert.throws(()=>validateProfile(x),/Non-portable/);
}
{
  const x=copy(); x.resources[0].path='assets/data/not-the-loader-path.json';
  assert.throws(()=>extractLoaderPaths(source,x),/Loader\/profile path mismatch/);
}
{
  const x=copy(); x.resources[0].constant='MISSING_CONST';
  assert.throws(()=>extractLoaderPaths(source,x),/Loader constant missing/);
}

console.log('ACADEMIC_SHADOW_RESOLUTION_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:7,authoritySwitch:false,runtimeMutation:false},null,2));
