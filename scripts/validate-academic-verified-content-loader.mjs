import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const read=path=>fs.readFileSync(path,'utf8');
const fail=message=>{throw new Error(`ACADEMIC_VERIFIED_CONTENT_LOADER_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};

export function validateContract(contract){
  assert(contract?.schema==='BAUMAN_ACADEMIC_VERIFIED_CONTENT_LOADER_CONTRACT_V1','Unexpected loader contract schema');
  assert(contract.runtime==='assets/js/academic-content-resolution-loader.js','Loader runtime path drifted');
  assert(contract.behavior?.autoRun===false,'Verified loader may auto-run');
  for(const key of ['writesAcademicGlobals','writesLearnerState','changesRoutes','persistsRegistry'])assert(contract.behavior?.[key]===false,`Forbidden loader behavior enabled: ${key}`);
  assert(contract.behavior?.loaderAuthority==='candidate_only','Verified loader gained authority');
  assert(contract.behavior?.pinnedRegistryRequired===true,'Pinned registry is optional');
  assert(contract.behavior?.integrityVerificationRequired===true,'Integrity verification is optional');
  assert(contract.registryCandidate?.path==='foundation/content-resolution/registry-candidates/academic-core-2026.v1.json','Registry candidate path drifted');
  assert(Array.isArray(contract.resources)&&contract.resources.length===3,'Verified loader resource count drifted');
  assert(contract.output?.status==='verified'&&contract.output?.verificationRequiredForEveryResource===true&&contract.output?.immutable===true,'Verified result contract drifted');
  return true;
}

export function validateSource(source,indexHtml){
  assert(indexHtml.includes('<script src="assets/js/academic-content-resolution-loader.js"></script>'),'Root index is missing verified loader candidate');
  const loaderPos=indexHtml.indexOf('<script src="assets/js/academic-content-resolution-loader.js"></script>');
  const academicPos=indexHtml.indexOf('<script src="assets/js/academic-main.js"></script>');
  assert(loaderPos>=0&&academicPos>loaderPos,'Verified loader candidate must load before academic-main.js');
  assert(source.includes("const REGISTRY_CANDIDATE_PATH='foundation/content-resolution/registry-candidates/academic-core-2026.v1.json'"),'Pinned registry path missing');
  assert(source.includes('root.BaumanRuntimeDeliveryExecutor.execute'),'Verified executor not used');
  assert(source.includes('root.BaumanPackageRelativeFetchAdapter.create'),'Package-relative adapter not used');
  assert(source.includes('root.BaumanContentAssetRegistry.assertIntegrity(registry)'),'Registry integrity validation missing');
  assert(!/BAUMAN_CURRICULUM_2026\s*=|BAUMAN_PREREQ_2026\s*=|BAUMAN_PREREQ_PACKS_2026_STATUS\s*=/.test(source),'Verified loader may write Academic globals');
  assert(!/localStorage|sessionStorage|indexedDB/.test(source),'Verified loader may persist browser storage');
  assert(!/history\.|location\.(?:assign|replace)|location\.href\s*=/.test(source),'Verified loader may change routes');
  assert(!/DOMContentLoaded|setTimeout\(loadCore/.test(source),'Verified loader may auto-run');
  return true;
}

export function loadAndValidate(){
  const contract=JSON.parse(read('foundation/content-resolution/academic-verified-loader-contract.v1.json'));
  validateContract(contract);
  validateSource(read('assets/js/academic-content-resolution-loader.js'),read('index.html'));
  return contract;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const contract=loadAndValidate();
  console.log('ACADEMIC_VERIFIED_CONTENT_LOADER_GATE=PASS');
  console.log(JSON.stringify({schema:contract.schema,autoRun:false,resources:contract.resources.length,authority:'candidate_only'},null,2));
}
