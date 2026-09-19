import fs from 'node:fs';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import resolver from '../foundation/content-resolution/runtime-resource-resolver.js';
import deliveryPlan from '../foundation/content-resolution/runtime-delivery-plan.js';
import executor from '../foundation/content-resolution/runtime-delivery-executor.js';

const CANDIDATE_PATH='foundation/content-resolution/registry-candidates/academic-core-2026.v1.json';
const RESOURCES=[
  {key:'official-curriculum',path:'assets/data/official-curriculum-iu5-2026.json',contentType:'reference'},
  {key:'prerequisite-registry',path:'assets/data/prerequisite-registry-iu5-2026.json',contentType:'dataset'},
  {key:'prerequisite-pack-manifest',path:'assets/data/prerequisite-packs/manifest-2026.json',contentType:'dataset'}
];
const fail=message=>{throw new Error(`ACADEMIC_CORE_REGISTRY_CANDIDATE_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');

export async function validateCandidate(registry,readBytes=path=>fs.readFileSync(path)){
  assert(registry?.schema==='BAUMAN_CONTENT_ASSET_REGISTRY_RUNTIME_V1','Unexpected registry schema');
  assert(registry.version===1,'Unexpected registry version');
  registryApi.assertIntegrity(registry);
  const meta=registry.extensions?.academicCore2026;
  assert(meta?.schema==='BAUMAN_ACADEMIC_CORE_REGISTRY_CANDIDATE_V1','Candidate extension schema missing');
  assert(meta.status==='promotion_candidate','Candidate status drifted');
  assert(meta.authority==='candidate_only','Candidate gained runtime authority');
  assert(meta.runtimeAuthoritySwitch===false,'Candidate switched runtime authority');
  assert(meta.resourceCount===3,'Candidate resource count drifted');
  assert(meta.checksumAlgorithm==='sha256','Candidate checksum algorithm drifted');

  assert(Object.keys(registry.records.source||{}).length===3,'Expected exactly three source records');
  assert(Object.keys(registry.records.checksum||{}).length===3,'Expected exactly three checksum records');
  assert(Object.keys(registry.records.asset||{}).length===3,'Expected exactly three asset records');
  assert(Object.keys(registry.records.content||{}).length===3,'Expected exactly three content records');
  assert(Object.keys(registry.records.provenance||{}).length===3,'Expected exactly three provenance records');
  assert(Object.keys(registry.records.access||{}).length===6,'Expected explicit private access for asset and content');

  const results=[];
  const before=JSON.stringify(registry);
  for(const row of RESOURCES){
    const sourceId=`bdr:source:academic-2026:${row.key}`;
    const checksumId=`bdr:checksum:academic-2026:${row.key}-sha256`;
    const assetId=`bdr:asset:academic-2026:${row.key}-json`;
    const contentId=`bdr:content:academic-2026:${row.key}`;
    const provenanceId=`bdr:provenance:academic-2026:${row.key}-verified`;
    const source=registry.records.source[sourceId],checksum=registry.records.checksum[checksumId],asset=registry.records.asset[assetId],content=registry.records.content[contentId],provenance=registry.records.provenance[provenanceId];
    assert(source?.locator?.kind==='repository_relative'&&source.locator.value===row.path,`Source locator drift: ${row.key}`);
    assert(asset?.locators?.length===1&&asset.locators[0].kind==='repository_relative'&&asset.locators[0].value===row.path,`Asset locator drift: ${row.key}`);
    assert(asset?.state==='verified',`Asset state is not verified: ${row.key}`);
    assert(asset?.checksumId===checksumId,`Asset checksum reference drift: ${row.key}`);
    assert(content?.contentType===row.contentType,`Content type drift: ${row.key}`);
    assert(JSON.stringify(content?.assetIds)===JSON.stringify([assetId]),`Content asset linkage drift: ${row.key}`);
    assert(JSON.stringify(content?.sourceIds)===JSON.stringify([sourceId]),`Content source linkage drift: ${row.key}`);
    assert(JSON.stringify(content?.provenanceEventIds)===JSON.stringify([provenanceId]),`Content provenance linkage drift: ${row.key}`);
    assert(provenance?.eventType==='verified'&&provenance.subjectId===assetId&&provenance.checksumId===checksumId,`Verified provenance drift: ${row.key}`);
    const policies=Object.values(registry.records.access).filter(x=>x.scope===assetId||x.scope===contentId);
    assert(policies.length===2&&policies.every(x=>x.visibility==='private'),`Explicit private access drift: ${row.key}`);

    const bytes=readBytes(row.path);
    const actual={digest:hash(bytes),byteLength:bytes.byteLength};
    assert(checksum?.algorithm==='sha256',`Checksum algorithm drift: ${row.key}`);
    assert(checksum?.digest===actual.digest,`Pinned SHA-256 drift: ${row.key} expected ${checksum?.digest} actual ${actual.digest}`);
    assert(checksum?.byteLength===actual.byteLength,`Pinned byte length drift: ${row.key} expected ${checksum?.byteLength} actual ${actual.byteLength}`);
    JSON.parse(Buffer.from(bytes).toString('utf8'));

    const descriptor=resolver.resolve(registry,{targetRegistryId:contentId,mode:'learner_runtime',accessContext:{private:true},runtimePolicy:{allowRepositoryRelative:true,allowHttps:false,allowedHttpsOrigins:[],availableProviders:[]}});
    assert(descriptor.status==='resolved',`Candidate content did not resolve: ${row.key}`);
    assert(descriptor.assetRegistryId===assetId,`Candidate resolved wrong asset: ${row.key}`);
    const plan=deliveryPlan.buildPlan(registry,descriptor);
    let parsed=null;
    const execution=await executor.execute(plan,{'package-relative-resource':async activePlan=>readBytes(activePlan.resource.value)},async payload=>{parsed=JSON.parse(Buffer.from(payload).toString('utf8'))});
    assert(execution.status==='verified',`Pinned candidate failed executor verification: ${row.key}`);
    assert(parsed!==null,`Pinned candidate payload was not consumed: ${row.key}`);
    results.push({key:row.key,digest:actual.digest,byteLength:actual.byteLength,status:execution.status});
  }
  assert(JSON.stringify(registry)===before,'Candidate validation mutated registry');
  return results;
}

export async function loadAndValidate(){
  const registry=JSON.parse(fs.readFileSync(CANDIDATE_PATH,'utf8'));
  return validateCandidate(registry);
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const results=await loadAndValidate();
  console.log('ACADEMIC_CORE_REGISTRY_CANDIDATE_GATE=PASS');
  console.log(JSON.stringify({resources:results.length,allVerified:results.every(x=>x.status==='verified'),pinnedSha256:true,runtimeAuthoritySwitch:false},null,2));
}
