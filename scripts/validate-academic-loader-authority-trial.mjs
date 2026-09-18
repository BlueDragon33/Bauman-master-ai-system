import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const read=path=>fs.readFileSync(path,'utf8');
const fail=message=>{throw new Error(`ACADEMIC_VERIFIED_LOADER_AUTHORITY_TRIAL_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};

export function validateContract(contract){
  assert(contract?.schema==='BAUMAN_ACADEMIC_VERIFIED_LOADER_AUTHORITY_TRIAL_CONTRACT_V1','Unexpected authority trial contract schema');
  assert(contract.consumer==='assets/js/academic-main.js','Authority trial consumer drifted');
  assert(contract.activation?.queryParameter==='academicVerifiedLoader'&&contract.activation?.enabledValue==='1','Authority trial activation drifted');
  assert(contract.activation?.defaultEnabled===false,'Verified loader authority became default');
  assert(contract.defaultMode?.id==='legacy_fetch'&&contract.defaultMode?.existingFetchJsonAuthoritative===true&&contract.defaultMode?.verifiedLoaderCalled===false,'Legacy default authority drifted');
  assert(contract.trialMode?.id==='verified_candidate'&&contract.trialMode?.authority==='opt_in_trial','Opt-in authority label drifted');
  assert(contract.trialMode?.coreResourcesOnly===true&&contract.trialMode?.coreResourceCount===3,'Authority trial scope expanded');
  assert(contract.trialMode?.pinnedRegistryRequired===true&&contract.trialMode?.integrityVerificationRequired===true,'Verified trial lost pinned integrity requirement');
  assert(contract.trialMode?.legacyCoreFallbackOnFailure===false,'Verified trial may silently fall back to legacy core fetch');
  assert(contract.trialMode?.prerequisitePackFilesRemainExistingLoader===true,'Prerequisite pack file authority changed');
  for(const [key,value] of Object.entries(contract.safety||{}))assert(value===true,`Safety invariant changed: ${key}`);
  return true;
}

export function validateSource(source){
  assert(source.includes("const VERIFIED_LOADER_TRIAL_PARAM='academicVerifiedLoader'"),'Authority trial query parameter missing');
  assert(source.includes("const VERIFIED_LOADER_TRIAL_VALUE='1'"),'Authority trial query value missing');
  assert(source.includes("function verifiedLoaderTrialEnabled()"),'Authority trial activation function missing');
  assert(source.includes("async function loadCoreData()"),'Core loader arbitration function missing');
  assert(source.includes("Promise.all([fetchJson(CURRICULUM_URL),fetchJson(PREREQ_URL),fetchJson(PACK_MANIFEST_URL)])"),'Legacy default core fetch path missing');
  assert(source.includes("window.BaumanAcademicVerifiedContentLoader"),'Verified loader candidate is not wired');
  assert(source.includes("loader.loadCore({baseUrl:document.baseURI})"),'Verified loader is not called with explicit base URL');
  assert(source.includes("window.BAUMAN_ACADEMIC_CORE_LOADER_STATUS"),'Core loader status is not published');
  assert(source.includes("const {curriculum,prereq,manifest}=await loadCoreData();"),'Academic load does not use arbitration function');
  assert(!source.includes("catch(err){return Promise.all([fetchJson(CURRICULUM_URL)"),'Verified trial contains silent legacy fallback');
  return true;
}

export function loadAndValidate(){
  const contract=JSON.parse(read('foundation/content-resolution/academic-loader-authority-trial-contract.v1.json'));
  validateContract(contract);
  validateSource(read('assets/js/academic-main.js'));
  return contract;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const contract=loadAndValidate();
  console.log('ACADEMIC_VERIFIED_LOADER_AUTHORITY_TRIAL_GATE=PASS');
  console.log(JSON.stringify({schema:contract.schema,defaultMode:'legacy_fetch',trialMode:'verified_candidate',defaultEnabled:false,coreResources:3},null,2));
}
