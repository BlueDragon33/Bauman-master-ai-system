import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateContentResolutionContract} from '../scripts/validate-content-resolution-contract.mjs';

const original=JSON.parse(fs.readFileSync('foundation/content-resolution/resolution-contract.v1.json','utf8'));
const copy=()=>structuredClone(original);

assert.equal(validateContentResolutionContract(copy()),true);

{
  const x=copy(); x.compatibility.runtimeMigration='replace_existing_loaders';
  assert.throws(()=>validateContentResolutionContract(x),/runtime loaders/);
}
{
  const x=copy(); x.compatibility.networkFetchInCore=true;
  assert.throws(()=>validateContentResolutionContract(x),/fetch network/);
}
{
  const x=copy(); x.resolutionModes.learner_runtime.allowedAssetStates.push('quarantined');
  assert.throws(()=>validateContentResolutionContract(x),/unsafe asset states/);
}
{
  const x=copy(); x.resolutionModes.learner_runtime.allowSuperseded=true;
  assert.throws(()=>validateContentResolutionContract(x),/superseded assets/);
}
{
  const x=copy(); x.locatorKinds.repository_relative.rules.parentTraversalForbidden=false;
  assert.throws(()=>validateContentResolutionContract(x),/parent traversal/);
}
{
  const x=copy(); x.locatorKinds.https_url.rules.httpsOnly=false;
  assert.throws(()=>validateContentResolutionContract(x),/non-HTTPS/);
}
{
  const x=copy(); x.locatorKinds.content_hash.directlyResolvable=true;
  assert.throws(()=>validateContentResolutionContract(x),/explicit provider/);
}
{
  const x=copy(); x.runtimePolicy.defaultNetwork='allow';
  assert.throws(()=>validateContentResolutionContract(x),/default must remain deny/);
}
{
  const x=copy(); x.output.rules.noImplicitFallbackToDisplayName=false;
  assert.throws(()=>validateContentResolutionContract(x),/Display-name fallback/);
}
{
  const x=copy(); x.forbiddenAuthority=x.forbiddenAuthority.filter(v=>v!=='mastery');
  assert.throws(()=>validateContentResolutionContract(x),/Forbidden authority missing: mastery/);
}

console.log('CONTENT_RESOLUTION_CONTRACT_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:10,step1RuntimeMigration:'none'},null,2));
