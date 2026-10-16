import test from 'node:test';
import assert from 'node:assert/strict';
import {checkContainersAccess,diagnoseContainersAccess} from '../scripts/check-cloudflare-containers-preflight.mjs';

test('Containers access accepts only explicit Cloudflare success',()=>{
  assert.equal(diagnoseContainersAccess(200,{success:true}).ok,true);
  assert.equal(diagnoseContainersAccess(200,{success:false}).ok,false);
  assert.equal(diagnoseContainersAccess(403,{success:false,errors:[{code:10000,message:'Sensitive internal message'}]}).reason,'ACCESS_OR_ENTITLEMENT');
  assert.deepEqual(diagnoseContainersAccess(403,{errors:[{code:10000,message:'Sensitive internal message'}]}).codes,['10000']);
  assert.equal(diagnoseContainersAccess(404,{success:false}).reason,'CONTAINERS_UNAVAILABLE');
});

test('preflight makes no network request without GitHub secrets',async()=>{
  let calls=0;
  const result=await checkContainersAccess({token:'',accountId:'',request:async()=>{calls++}});
  assert.equal(result.reason,'MISSING_CREDENTIALS');
  assert.equal(calls,0);
});

test('preflight checks account endpoint but never discloses account or token',async()=>{
  const seen={};
  const result=await checkContainersAccess({token:'dummy-secret',accountId:'dummy-account',request:async(url,options)=>{
    seen.url=url;seen.method=options.method;seen.auth=options.headers.Authorization;
    return {status:403,json:async()=>({success:false,errors:[{code:10000,message:'contains dummy-secret dummy-account'}]})};
  }});
  assert.equal(seen.url,'https://api.cloudflare.com/client/v4/accounts/dummy-account/containers/me');
  assert.equal(seen.method,'GET');
  assert.equal(seen.auth,'Bearer dummy-secret');
  assert.equal(result.reason,'ACCESS_OR_ENTITLEMENT');
  assert.equal(JSON.stringify(result).includes('dummy-secret'),false);
  assert.equal(JSON.stringify(result).includes('dummy-account'),false);
});

test('unexpected network failure is a blocker, never a pass',async()=>{
  const result=await checkContainersAccess({token:'token',accountId:'account',request:async()=>{throw Error('offline')}});
  assert.equal(result.reason,'NETWORK_OR_RESPONSE_ERROR');
});
