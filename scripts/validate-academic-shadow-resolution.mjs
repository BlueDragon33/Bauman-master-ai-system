import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import resolver from '../foundation/content-resolution/runtime-resource-resolver.js';
import deliveryPlan from '../foundation/content-resolution/runtime-delivery-plan.js';
import executor from '../foundation/content-resolution/runtime-delivery-executor.js';

const root=process.cwd();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const fail=message=>{throw new Error(`ACADEMIC_SHADOW_RESOLUTION_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};

export function validateProfile(profile){
  assert(profile?.schema==='BAUMAN_CONTENT_RESOLUTION_SHADOW_PROFILE_V1','Unexpected shadow profile schema');
  assert(profile.profileId==='academic-core-2026','Unexpected shadow profile ID');
  assert(profile.loaderSource==='assets/js/academic-main.js','Academic loader source drifted');
  assert(profile.mode==='shadow_only','Profile is not shadow-only');
  assert(profile.authoritySwitch===false,'Shadow profile may switch loader authority');
  assert(profile.runtimeMutation===false,'Shadow profile may mutate runtime');
  assert(profile.promotedRegistryAuthority===false,'Diagnostic registry became promoted authority');
  assert(Array.isArray(profile.resources)&&profile.resources.length===3,'Academic core shadow profile must contain exactly three resources');
  for(const row of profile.resources){
    assert(/^[a-z0-9][a-z0-9-]*$/.test(row.id),'Invalid shadow resource ID');
    assert(/^[A-Z][A-Z0-9_]*$/.test(row.constant),'Invalid loader constant name');
    assert(typeof row.path==='string'&&row.path.length>0,'Resource path required');
    assert(!row.path.startsWith('/')&&!/^[A-Za-z]:[\\/]/.test(row.path)&&!row.path.includes('\\')&&!row.path.split('/').includes('..'),'Non-portable shadow resource path');
  }
  assert(profile.acceptance?.existingLoaderRemainsAuthoritative===true,'Existing loader authority is not preserved');
  return true;
}

export function extractLoaderPaths(source,profile){
  const out={};
  for(const row of profile.resources){
    const pattern=new RegExp(`const\\s+${row.constant}\\s*=\\s*['"]([^'"]+)['"]`);
    const match=source.match(pattern);
    assert(match,`Loader constant missing: ${row.constant}`);
    out[row.constant]=match[1];
    assert(match[1]===row.path,`Loader/profile path mismatch for ${row.constant}: ${match[1]} != ${row.path}`);
  }
  return out;
}

function slug(value){return String(value).replace(/[^a-zA-Z0-9._-]+/g,'-')}

export async function runShadow(profile){
  validateProfile(profile);
  const loader=read(profile.loaderSource);
  const loaderPaths=extractLoaderPaths(loader,profile);
  let registry=registryApi.emptyRegistry();
  const directJson={};
  for(const row of profile.resources){
    const abs=path.join(root,row.path);
    assert(fs.statSync(abs,{throwIfNoEntry:false})?.isFile()===true,`Real loader resource missing: ${row.path}`);
    const bytes=fs.readFileSync(abs);
    directJson[row.id]=JSON.parse(bytes.toString('utf8'));
    const digest=crypto.createHash('sha256').update(bytes).digest('hex');
    const local=slug(row.id);
    const checksumId=`bdr:checksum:academic-shadow:${local}`;
    const assetId=`bdr:asset:academic-shadow:${local}`;
    registry=registryApi.appendRecord(registry,{registryId:checksumId,algorithm:'sha256',digest,byteLength:bytes.byteLength,recordVersion:1});
    registry=registryApi.appendRecord(registry,{registryId:assetId,canonicalEntityId:`bd:artifact:academic-shadow:${local}`,assetType:'document',mediaType:'application/json',checksumId,locators:[{kind:'repository_relative',value:row.path}],state:'verified',recordVersion:1});
  }
  const before=JSON.stringify(registry);
  const results=[];
  for(const row of profile.resources){
    const assetId=`bdr:asset:academic-shadow:${slug(row.id)}`;
    const descriptor=resolver.resolve(registry,{targetRegistryId:assetId,mode:'learner_runtime',accessContext:{private:true},runtimePolicy:{allowRepositoryRelative:true,allowHttps:false,allowedHttpsOrigins:[],availableProviders:[]}});
    assert(descriptor.status==='resolved',`Shadow resolution failed: ${row.id}`);
    assert(descriptor.locator.value===loaderPaths[row.constant],`Resolved path diverged from loader: ${row.id}`);
    const plan=deliveryPlan.buildPlan(registry,descriptor);
    assert(plan.integrity.verificationRequired===true,`Integrity requirement missing: ${row.id}`);
    let parsed=null;
    const execution=await executor.execute(plan,{
      'package-relative-resource':async activePlan=>fs.readFileSync(path.join(root,activePlan.resource.value))
    },async payload=>{parsed=JSON.parse(Buffer.from(payload).toString('utf8'))});
    assert(execution.status==='verified',`Shadow execution not verified: ${row.id}`);
    assert(JSON.stringify(parsed)===JSON.stringify(directJson[row.id]),`Shadow/direct JSON mismatch: ${row.id}`);
    results.push({id:row.id,path:row.path,status:execution.status,digest:execution.integrity.digest});
  }
  assert(JSON.stringify(registry)===before,'Shadow resolution mutated diagnostic registry');
  return {profileId:profile.profileId,resources:results};
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const profile=JSON.parse(read('foundation/content-resolution/shadow/academic-core-2026.v1.json'));
  const result=await runShadow(profile);
  console.log('ACADEMIC_SHADOW_RESOLUTION_GATE=PASS');
  console.log(JSON.stringify({profileId:result.profileId,resources:result.resources.length,allVerified:result.resources.every(x=>x.status==='verified'),authoritySwitch:false,runtimeMutation:false},null,2));
}
