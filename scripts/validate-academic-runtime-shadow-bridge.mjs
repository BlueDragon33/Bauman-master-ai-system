import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const root=process.cwd();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const fail=message=>{throw new Error(`ACADEMIC_RUNTIME_SHADOW_BRIDGE_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};

export function validateContract(contract){
  assert(contract?.schema==='BAUMAN_ACADEMIC_RUNTIME_SHADOW_BRIDGE_CONTRACT_V1','Unexpected bridge contract schema');
  assert(contract.activation?.queryParameter==='contentResolutionShadow','Activation parameter drifted');
  assert(contract.activation?.enabledValue==='1','Activation value drifted');
  assert(contract.activation?.defaultEnabled===false,'Shadow bridge became enabled by default');
  assert(contract.activation?.dependenciesLoadedOnlyWhenEnabled===true,'Dependencies may load while shadow is disabled');
  for(const [key,value] of Object.entries(contract.authority||{}))assert(value===true||value===false,`Invalid authority rule: ${key}`);
  assert(contract.authority?.existingAcademicLoaderRemainsAuthoritative===true,'Academic loader authority changed');
  for(const key of ['shadowMayReplaceFetch','shadowMayWriteAcademicGlobals','shadowMayWriteLearnerState','shadowMayChangeRoutes','shadowMayPersistRegistry'])assert(contract.authority?.[key]===false,`Forbidden shadow authority enabled: ${key}`);
  assert(Array.isArray(contract.resources)&&contract.resources.length===3,'Shadow bridge must track exactly three Academic core resources');
  assert(Array.isArray(contract.dependencies)&&contract.dependencies.length===8,'Shadow transitive dependency contract drifted');
  assert(contract.verification?.failOpenForApplicationAvailability===true,'Shadow failure may block application');
  assert(contract.verification?.registryCandidatePath==='foundation/content-resolution/registry-candidates/academic-core-2026.v1.json','Pinned registry path drifted');
  assert(contract.verification?.registryCandidateStatus==='promotion_candidate','Pinned registry status drifted');
  assert(contract.verification?.registryCandidateAuthority==='candidate_only','Pinned registry authority drifted');
  assert(contract.verification?.selfDerivedChecksums===false,'Shadow bridge may derive its own expected checksums');
  assert(contract.verification?.directDiagnosticChecksumDerivation===false,'Direct checksum derivation became enabled');
  assert(contract.verification?.pinnedRegistryChecksumVerification===true,'Pinned registry verification disappeared');
  assert(contract.verification?.delegatedLoader==='assets/js/academic-content-resolution-loader.js','Shadow verified-loader delegation drifted');
  assert(contract.verification?.shadowOwnsResolutionImplementation===false,'Shadow regained resolution implementation');
  assert(contract.verification?.shadowOwnsRegistryLoading===false,'Shadow regained registry loading');
  assert(contract.verification?.shadowOwnsTransportAdapter===false,'Shadow regained transport adapter ownership');
  return true;
}

export function validateSource(source,indexHtml){
  assert(indexHtml.includes('<script src="assets/js/academic-content-resolution-shadow.js"></script>'),'Root index is missing Academic content shadow bridge');
  const academicPos=indexHtml.indexOf('<script src="assets/js/academic-main.js"></script>');
  const shadowPos=indexHtml.indexOf('<script src="assets/js/academic-content-resolution-shadow.js"></script>');
  assert(academicPos>=0&&shadowPos>academicPos,'Shadow bridge must load after academic-main.js');
  assert(source.includes("const ENABLE_PARAM='contentResolutionShadow'"),'Shadow activation parameter missing from runtime');
  assert(source.includes("const ENABLE_VALUE='1'"),'Shadow activation value missing from runtime');
  assert(source.includes("if(!enabled())"),'Default-disabled fast path missing');
  assert(!/localStorage|sessionStorage|indexedDB/.test(source),'Shadow bridge may persist browser storage');
  assert(!/history\.|location\.(?:assign|replace)|location\.href\s*=/.test(source),'Shadow bridge may change routes');
  assert(!/BAUMAN_CURRICULUM_2026\s*=|BAUMAN_PREREQ_2026\s*=|BAUMAN_PREREQ_PACKS_2026_STATUS\s*=/.test(source),'Shadow bridge may write Academic authoritative globals');
  assert(source.includes("root.BaumanAcademicVerifiedContentLoader"),'Shadow does not delegate to verified loader');
  assert(source.includes("loader.loadCore({baseUrl:root.document.baseURI})"),'Shadow does not call verified loader with explicit base URL');
  assert(!source.includes('BaumanRuntimeDeliveryExecutor.execute'),'Shadow must not own executor calls');
  assert(!source.includes('BaumanPackageRelativeFetchAdapter.create'),'Shadow must not own transport adapter calls');
  assert(!source.includes('BaumanContentAssetRegistry.assertIntegrity'),'Shadow must not own registry validation');
  assert(!source.includes('REGISTRY_CANDIDATE_PATH'),'Shadow must not own registry path');
  assert(!source.includes("root.crypto.subtle.digest('SHA-256'"),'Shadow bridge must not derive expected checksums from fetched bytes');
  assert(!source.includes('appendDiagnosticAsset'),'Dynamic diagnostic asset construction must be removed');
  assert(!source.includes('directResource('),'Direct diagnostic resource hashing path must be removed');
  return true;
}

export function loadAndValidate(){
  const contract=JSON.parse(read('foundation/content-resolution/academic-runtime-shadow-contract.v1.json'));
  validateContract(contract);
  validateSource(read('assets/js/academic-content-resolution-shadow.js'),read('index.html'));
  return contract;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const contract=loadAndValidate();
  console.log('ACADEMIC_RUNTIME_SHADOW_BRIDGE_GATE=PASS');
  console.log(JSON.stringify({schema:contract.schema,defaultEnabled:contract.activation.defaultEnabled,resources:contract.resources.length,dependencies:contract.dependencies.length,authoritySwitch:false},null,2));
}
