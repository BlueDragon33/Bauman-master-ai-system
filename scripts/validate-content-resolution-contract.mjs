import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const root=process.cwd();
const contractPath='foundation/content-resolution/resolution-contract.v1.json';
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const fail=message=>{throw new Error(`CONTENT_RESOLUTION_CONTRACT_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};

export function validateContentResolutionContract(value){
  assert(value&&typeof value==='object'&&!Array.isArray(value),'Contract must be an object');
  assert(value.schema==='BAUMAN_CONTENT_RESOLUTION_CONTRACT_V1','Unexpected contract schema');
  assert(value.contractVersion===1,'Contract version must be 1');
  assert(value.architectureName==='Foundation — Content Resolution & Runtime Delivery','Architecture name drifted');
  assert(value.status==='foundation_contract','Unexpected contract status');

  assert(value.dependency?.registrySchema==='BAUMAN_CONTENT_ASSET_PROVENANCE_REGISTRY_V1','Registry contract dependency drifted');
  assert(value.dependency?.registryRuntimeSchema==='BAUMAN_CONTENT_ASSET_REGISTRY_RUNTIME_V1','Registry runtime dependency drifted');
  assert(value.dependency?.mustNotMutateRegistry===true,'Resolver may mutate registry');

  assert(value.compatibility?.strategy==='additive','Resolution layer must remain additive');
  assert(value.compatibility?.runtimeMigration==='none','Step 1 must not migrate existing runtime loaders');
  assert(value.compatibility?.legacyLoadersPreserved===true,'Legacy loaders are not preserved');
  assert(value.compatibility?.learnerStateUntouched===true,'Learner state protection disappeared');
  assert(value.compatibility?.subjectRoutesUntouched===true,'Subject route protection disappeared');
  assert(value.compatibility?.browserStorageBinding==='none','Step 1 must remain browser-storage neutral');
  assert(value.compatibility?.networkFetchInCore===false,'Core resolver may fetch network resources');
  assert((value.requiredInput?.fields||[]).includes('accessContext'),'Resolver input must require accessContext');
  assert(!(value.requiredInput?.fields||[]).includes('accessDecision'),'Resolver must not trust an external accessDecision');
  assert(value.accessEvaluation?.source==='BAUMAN_ACCESS_POLICY_V1','Resolver access source drifted');
  assert(value.accessEvaluation?.resolverMustEvaluateTarget===true,'Target access evaluation is optional');
  assert(value.accessEvaluation?.resolverMustEvaluateResolvedAsset===true,'Resolved asset access evaluation is optional');
  assert(value.accessEvaluation?.externalDecisionTrusted===false,'External access decisions became trusted');
  assert(value.accessEvaluation?.failClosed===true,'Access evaluation no longer fails closed');

  const modes=value.resolutionModes||{};
  assert(Array.isArray(modes.learner_runtime?.allowedAssetStates),'learner_runtime asset-state policy missing');
  assert(JSON.stringify(modes.learner_runtime.allowedAssetStates)===JSON.stringify(['verified','active']),'learner_runtime may use unsafe asset states');
  assert(modes.learner_runtime.allowSuperseded===false,'learner_runtime may silently use superseded assets');
  assert(modes.learner_runtime.requireAccessDecision===true,'learner_runtime access decision is optional');
  assert(modes.learner_runtime.requireChecksumReference===true,'learner_runtime checksum reference is optional');
  assert((modes.audit_historical?.allowedAssetStates||[]).includes('superseded'),'audit_historical cannot reproduce superseded assets');

  const locators=value.locatorKinds||{};
  assert(locators.repository_relative?.transport==='package_relative','repository_relative transport drifted');
  assert(locators.repository_relative?.rules?.absolutePathForbidden===true,'absolute repository paths became allowed');
  assert(locators.repository_relative?.rules?.parentTraversalForbidden===true,'parent traversal became allowed');
  assert(locators.repository_relative?.rules?.driveLetterForbidden===true,'drive-letter path became allowed');
  assert(locators.https_url?.rules?.httpsOnly===true,'non-HTTPS external transport became allowed');
  assert(locators.https_url?.rules?.networkPolicyRequired===true,'HTTPS transport no longer requires runtime network policy');
  assert(locators.content_hash?.directlyResolvable===false,'content_hash must require an explicit provider');
  assert(locators.content_hash?.rules?.providerRequired===true,'content_hash provider requirement disappeared');

  const blocked=new Set(value.blockedAssetStates||[]);
  for(const state of ['staged','quarantined','missing'])assert(blocked.has(state),`Blocked asset state missing: ${state}`);

  assert(value.runtimePolicy?.defaultNetwork==='deny','Network default must remain deny');
  const output=value.output||{};
  assert(output.schema==='BAUMAN_RUNTIME_RESOURCE_DESCRIPTOR_V1','Runtime descriptor schema drifted');
  for(const status of ['resolved','blocked','provider_required','not_found','ambiguous'])assert((output.statuses||[]).includes(status),`Missing output status: ${status}`);
  assert(output.rules?.immutable===true,'Runtime descriptor must remain immutable');
  assert(output.rules?.registryReadOnly===true,'Runtime descriptor may mutate registry');
  assert(output.rules?.noImplicitFallbackToDisplayName===true,'Display-name fallback became allowed');
  assert(output.rules?.noImplicitFilesystemGuess===true,'Filesystem guessing became allowed');
  assert(output.rules?.noImplicitNetworkEnable===true,'Network may become enabled implicitly');

  const forbidden=new Set(value.forbiddenAuthority||[]);
  for(const area of ['learner_state','mastery','review_queue','srs','schedule','subject_route','authentication','network_credentials','registry_mutation']){
    assert(forbidden.has(area),`Forbidden authority missing: ${area}`);
  }
  return true;
}

export function loadAndValidate(){
  const value=JSON.parse(read(contractPath));
  validateContentResolutionContract(value);
  return value;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const contract=loadAndValidate();
  console.log('CONTENT_RESOLUTION_CONTRACT_GATE=PASS');
  console.log(JSON.stringify({
    schema:contract.schema,
    architectureName:contract.architectureName,
    modes:Object.keys(contract.resolutionModes).length,
    locatorKinds:Object.keys(contract.locatorKinds).length,
    runtimeMigration:contract.compatibility.runtimeMigration,
    networkFetchInCore:contract.compatibility.networkFetchInCore
  },null,2));
}
