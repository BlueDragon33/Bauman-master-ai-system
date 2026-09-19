import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const read=path=>fs.readFileSync(path,'utf8');
const fail=message=>{throw new Error(`ACADEMIC_VERIFIED_LOADER_FAILURE_INJECTION_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};

export function validateContract(contract){
  assert(contract?.schema==='BAUMAN_ACADEMIC_VERIFIED_LOADER_FAILURE_INJECTION_CONTRACT_V1','Unexpected failure injection contract schema');
  assert(contract.mode==='opt_in_verified_trial','Failure injection mode drifted');
  assert(Array.isArray(contract.scenarios)&&contract.scenarios.length===2,'Failure injection scenario count drifted');
  const tampered=contract.scenarios.find(x=>x.id==='tampered_core_bytes');
  const missing=contract.scenarios.find(x=>x.id==='registry_candidate_missing');
  assert(tampered?.expected?.coreLoaderVerified===false&&tampered.expected.legacyCoreFallback===false&&tampered.expected.academicGlobalsPublished===false,'Tampered-byte fail-closed contract drifted');
  assert(tampered?.expected?.coreRequestCount===1,'Tampered-byte request count drifted');
  assert(missing?.expected?.coreLoaderVerified===false&&missing.expected.legacyCoreFallback===false&&missing.expected.academicGlobalsPublished===false,'Missing-registry fail-closed contract drifted');
  assert(missing?.expected?.registryRequestCount===1&&missing?.expected?.coreRequestCount===0,'Missing-registry request contract drifted');
  for(const [key,value] of Object.entries(contract.safety||{}))assert(value===true,`Failure-injection safety invariant changed: ${key}`);
  return true;
}
export function loadAndValidate(){
  const contract=JSON.parse(read('foundation/content-resolution/academic-loader-failure-injection-contract.v1.json'));
  validateContract(contract);
  return contract;
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const contract=loadAndValidate();
  console.log('ACADEMIC_VERIFIED_LOADER_FAILURE_INJECTION_GATE=PASS');
  console.log(JSON.stringify({scenarios:contract.scenarios.length,legacyFallback:false,academicGlobalsOnFailure:false},null,2));
}
