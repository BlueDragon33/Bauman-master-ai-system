import assert from 'node:assert/strict';
import packageAdapter from '../foundation/content-resolution/adapters/package-relative-fetch-adapter.js';

const basePlan={
  schema:'BAUMAN_RUNTIME_DELIVERY_PLAN_V1',
  status:'ready',
  adapterId:'package-relative-resource',
  transport:'package_relative',
  resource:{kind:'repository_relative',value:'assets/data/test.json'}
};
const okFetch=async()=>({ok:true,status:200,arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer});

assert.throws(()=>packageAdapter.create({baseUrl:'file:///tmp/index.html',fetchFn:okFetch}),/INVALID_BASE_PROTOCOL/);
assert.throws(()=>packageAdapter.create({baseUrl:'https://user:pass@example.test/index.html',fetchFn:okFetch}),/BASE_CREDENTIALS_FORBIDDEN/);
assert.throws(()=>packageAdapter.create({baseUrl:'https://example.test/index.html',fetchFn:null}),/FETCH_UNAVAILABLE/);

const adapter=packageAdapter.create({baseUrl:'https://example.test/app/index.html',fetchFn:okFetch});
await assert.rejects(()=>adapter.load({...basePlan,resource:{kind:'repository_relative',value:'../secret.txt'}}),/NON_PORTABLE_PATH/);
await assert.rejects(()=>adapter.load({...basePlan,resource:{kind:'repository_relative',value:'/root.txt'}}),/NON_PORTABLE_PATH/);
await assert.rejects(()=>adapter.load({...basePlan,resource:{kind:'repository_relative',value:'a.txt?x=1'}}),/QUERY_FRAGMENT_FORBIDDEN/);
await assert.rejects(()=>adapter.load({...basePlan,resource:{kind:'repository_relative',value:'a.txt#x'}}),/QUERY_FRAGMENT_FORBIDDEN/);
await assert.rejects(()=>adapter.load({...basePlan,adapterId:'https-resource'}),/PLAN_ADAPTER_MISMATCH/);
await assert.rejects(()=>adapter.load({...basePlan,resource:{kind:'https_url',value:'https://example.test/a'}}),/RESOURCE_KIND_MISMATCH/);

const notFound=packageAdapter.create({baseUrl:'https://example.test/app/index.html',fetchFn:async()=>({ok:false,status:404,arrayBuffer:async()=>new ArrayBuffer(0)})});
await assert.rejects(()=>notFound.load(basePlan),/HTTP_404/);

const badBuffer=packageAdapter.create({baseUrl:'https://example.test/app/index.html',fetchFn:async()=>({ok:true,status:200,arrayBuffer:async()=>'bad'})});
await assert.rejects(()=>badBuffer.load(basePlan),/INVALID_ARRAY_BUFFER/);

console.log('PACKAGE_RELATIVE_FETCH_ADAPTER_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:11,crossOriginSurface:0,redirectPolicy:'error'},null,2));
