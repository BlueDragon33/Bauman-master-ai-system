import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const contractPath=path.join(root,'foundation/domain-model/domain-contract.v1.json');
const read=p=>fs.readFileSync(p,'utf8');
const fail=message=>{throw new Error(`FOUNDATION_DOMAIN_MODEL_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};

assert(fs.existsSync(contractPath),'Missing foundation/domain-model/domain-contract.v1.json');
const contract=JSON.parse(read(contractPath));

assert(contract.schema==='BAUMAN_DOMAIN_CONTRACT_V1','Unexpected domain contract schema');
assert(contract.contractVersion===1,'Domain contract version must be 1');
assert(contract.compatibility?.strategy==='additive','Foundation compatibility must be additive');
assert(contract.compatibility?.breakingChangesForbidden===true,'Breaking changes must be forbidden at foundation level');
assert(contract.compatibility?.legacyIdsPreserved===true,'Legacy IDs must be preserved');
assert(contract.compatibility?.legacyStoragePreserved===true,'Legacy storage must be preserved');
assert(contract.identity?.canonicalPattern==='bd:<kind>:<namespace>:<localId>','Canonical ID pattern changed');
assert(contract.identity?.rules?.neverDerivedFromDisplayName===true,'IDs must never derive from display names');
assert(contract.identity?.rules?.immutableAfterPublication===true,'Published canonical IDs must be immutable');

const requiredKinds=['source','knowledge','competency','task','evidence','artifact','workflow','research'];
for(const kind of requiredKinds){
  assert(contract.identity.allowedKinds.includes(kind),`Missing canonical kind: ${kind}`);
  assert(contract.entities[kind],`Missing entity contract: ${kind}`);
}

assert(contract.evidencePolicy?.appendOnly===true,'Evidence must be append-only');
assert(contract.evidencePolicy?.aiMayModifyCanonicalMastery===false,'AI must not modify canonical mastery');
assert(contract.evidencePolicy?.aiMayAcceptResearchClaim===false,'AI must not accept research claims autonomously');
assert(contract.extensionPolicy?.extensionsNamespaced===true,'Extensions must be namespaced');
assert(contract.extensionPolicy?.unknownExtensionsMustBePreserved===true,'Unknown extensions must survive round-trips');
assert(contract.extensionPolicy?.adaptersPreferredOverCoreChanges===true,'Adapters must be preferred over core changes');
assert(contract.migration?.mode==='additive','Migration mode must be additive');
assert(contract.migration?.mustBeIdempotent===true,'Migrations must be idempotent');
assert(contract.migration?.mustNeverClearUserStorage===true,'Migrations must never clear user storage');

const readIfExists=p=>fs.existsSync(path.join(root,p))?read(path.join(root,p)):'';
const learningState=readIfExists('subjects/russian/assets/learning-state.js');
const contentContract=readIfExists('subjects/russian/assets/content-contract.js');
const hostBridge=readIfExists('subjects/shared/host-bridge.js');

assert(learningState.includes("bauman_russian_learning_state_v1"),'Legacy Russian learning storage key missing');
assert(learningState.includes("RUSSIAN_LEARNING_STATE_V1"),'Legacy Russian learning schema missing');
assert(contentContract.includes("RUSSIAN_CONTENT_CONTRACT_V1"),'Russian content contract missing');
assert(hostBridge.includes("BAUMAN_SUBJECT_BRIDGE_V1"),'Subject bridge contract missing');

const destructivePatterns=[/localStorage\.clear\s*\(/, /sessionStorage\.clear\s*\(/];
const foundationFiles=[contractPath,path.join(root,'foundation/domain-model/README.md')].filter(fs.existsSync);
for(const file of foundationFiles){
  const text=read(file);
  for(const pattern of destructivePatterns)assert(!pattern.test(text),`Destructive storage reset referenced in ${path.relative(root,file)}`);
}

console.log('FOUNDATION_DOMAIN_MODEL_GATE=PASS');
console.log(JSON.stringify({schema:contract.schema,version:contract.contractVersion,kinds:requiredKinds.length,compatibility:contract.compatibility.strategy},null,2));
