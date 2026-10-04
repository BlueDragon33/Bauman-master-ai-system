// Read-only infrastructure diagnostics. Never persist provider result objects:
// account/container results can contain registry authentication material.
import fs from 'node:fs';
const token=process.env.CLOUDFLARE_API_TOKEN,account=process.env.CLOUDFLARE_ACCOUNT_ID;
if(!token||!account)throw Error('Configured Cloudflare bindings required');
const redact=text=>String(text).replaceAll(token,'[REDACTED]').replaceAll(account,'[REDACTED]').slice(0,1000);
const checks=[];
for(const [name,path] of [['token','/user/tokens/verify'],['containers','/accounts/'+encodeURIComponent(account)+'/containers/me']]) {
  try {
    const response=await fetch('https://api.cloudflare.com/client/v4'+path,{headers:{authorization:'Bearer '+token},signal:AbortSignal.timeout(15000)});
    const body=await response.json();
    checks.push({name,http:response.status,success:response.ok&&body.success!==false,
      ...(name==='token'?{tokenStatus:body.result?.status||null}:{}),
      errors:Array.isArray(body.errors)?body.errors.slice(0,8).map(e=>({code:e.code,message:redact(e.message)})):[]});
  }catch(error){checks.push({name,success:false,error:redact(error.message)});}
}
const result={exactTestedSha:process.env.BAUMAN_BUILD_REVISION,status:checks.every(c=>c.success)?'ACCESS_CONFIRMED':'PROVIDER_ACCESS_BLOCKED',checks};
fs.writeFileSync('/tmp/python04-provider-access.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,checks:checks.map(c=>({name:c.name,http:c.http,success:c.success}))}));
if(result.status!=='ACCESS_CONFIRMED')process.exitCode=1;
