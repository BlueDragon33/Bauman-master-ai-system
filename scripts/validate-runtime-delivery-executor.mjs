import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import resolver from '../foundation/content-resolution/runtime-resource-resolver.js';
import deliveryPlan from '../foundation/content-resolution/runtime-delivery-plan.js';
import executor from '../foundation/content-resolution/runtime-delivery-executor.js';

const body='verified payload';
const digest=crypto.createHash('sha256').update(body).digest('hex');
let registry=registryApi.emptyRegistry();
registry=registryApi.appendRecord(registry,{registryId:'bdr:checksum:test:exec-001',algorithm:'sha256',digest,byteLength:Buffer.byteLength(body),recordVersion:1});
registry=registryApi.appendRecord(registry,{registryId:'bdr:asset:test:exec-001',canonicalEntityId:'bd:artifact:test:exec-001',assetType:'document',mediaType:'text/plain',checksumId:'bdr:checksum:test:exec-001',locators:[{kind:'repository_relative',value:'subjects/test/exec.txt'}],state:'active',recordVersion:1});

const descriptor=resolver.resolve(registry,{targetRegistryId:'bdr:asset:test:exec-001',mode:'learner_runtime',accessContext:{private:true},runtimePolicy:{allowRepositoryRelative:true,allowHttps:false,allowedHttpsOrigins:[],availableProviders:[]}});
const plan=deliveryPlan.buildPlan(registry,descriptor);
const beforePlan=JSON.stringify(plan);
let received='';
const result=await executor.execute(plan,{'package-relative-resource':async()=>body},async payload=>{received=payload});
assert.equal(result.status,'verified');
assert.equal(result.consumed,true);
assert.equal(received,body);
assert.equal(result.integrity.digest,digest);
assert.equal(result.integrity.byteLength,Buffer.byteLength(body));
assert.equal(JSON.stringify(plan),beforePlan,'executor must not mutate plan');

const source=fs.readFileSync('foundation/content-resolution/runtime-delivery-executor.js','utf8');
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB/.test(source),'Executor core contains direct network/storage API');

console.log('RUNTIME_DELIVERY_EXECUTOR_GATE=PASS');
console.log(JSON.stringify({schema:executor.schema,status:result.status,consumed:result.consumed,directNetworkStorageApis:0,planImmutable:true},null,2));
