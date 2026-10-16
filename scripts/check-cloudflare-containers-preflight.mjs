// Blueprint OS: fail closed before Preview migrations/deployments when
// Cloudflare Containers is unavailable to the configured CI API token.
// Do not log credentials, account IDs, response bodies or token-bearing URLs.
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

export function diagnoseContainersAccess(status,payload){
  if(status>=200&&status<300&&payload?.success===true)return {ok:true,reason:'READY'};
  const errors=Array.isArray(payload?.errors)?payload.errors:[];
  const codes=errors.map(e=>String(e?.code??'')).filter(code=>/^\d{1,8}$/.test(code)).slice(0,4);
  const type=status===401||status===403?'ACCESS_OR_ENTITLEMENT'
    :status===404?'CONTAINERS_UNAVAILABLE'
    :status===429?'RATE_LIMIT'
    :status>=500?'CLOUDFLARE_TRANSIENT':'API_REJECTED';
  return {ok:false,reason:type,httpStatus:status,codes};
}

export async function checkContainersAccess({token,accountId,request=fetch}){
  if(!token||!accountId)return {ok:false,reason:'MISSING_CREDENTIALS'};
  const url='https://api.cloudflare.com/client/v4/accounts/'+encodeURIComponent(accountId)+'/containers/me';
  try{
    const response=await request(url,{
      method:'GET',
      headers:{Authorization:'Bearer '+token,Accept:'application/json'},
      signal:AbortSignal.timeout(20000)
    });
    const payload=await response.json().catch(()=>null);
    return diagnoseContainersAccess(response.status,payload);
  }catch(_){
    return {ok:false,reason:'NETWORK_OR_RESPONSE_ERROR'};
  }
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const result=await checkContainersAccess({
    token:process.env.CLOUDFLARE_API_TOKEN,
    accountId:process.env.CLOUDFLARE_ACCOUNT_ID
  });
  if(result.ok){
    console.log('BAUMAN_CLOUDFLARE_CONTAINERS_PREFLIGHT=PASS');
  }else{
    console.error('BAUMAN_CLOUDFLARE_CONTAINERS_PREFLIGHT=BLOCKED');
    console.error('Reason: '+result.reason+
      (result.httpStatus?' (HTTP '+result.httpStatus+')':'')+
      (result.codes?.length?' (Cloudflare codes: '+result.codes.join(',')+')':''));
    console.error('Verify Workers Paid / Containers availability and that the account-scoped Cloudflare API token has Containers Edit (or Write) along with required Workers/D1 permissions.');
    console.error('Preview Control and D1 deployment have not been started by this workflow run.');
    process.exitCode=1;
  }
}
