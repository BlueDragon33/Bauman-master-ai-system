import fs from 'node:fs';
const token=process.env.CLOUDFLARE_API_TOKEN, account=process.env.CLOUDFLARE_ACCOUNT_ID;
if(!token||!account)throw Error('Required Cloudflare credential is absent; no API request sent.');
const expectedAccount='f88a42260814230aa4a151abbfe5659d';
const expectedToken='0ee33ceb134c7ade3bc08ba7134edf63';
const safe=value=>String(value??'').replaceAll(token,'[REDACTED]').replaceAll(account,'[ACCOUNT]').slice(0,1200);
const checks=[];
for(const [name,suffix] of [['accountTokenVerify','tokens/verify'],['containersIdentity','containers/me'],['workersRead','workers/scripts'],['d1Read','d1/database']]){
 try{
  const response=await fetch('https://api.cloudflare.com/client/v4/accounts/'+encodeURIComponent(account)+'/'+suffix,{method:'GET',headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(20000)});
  const raw=await response.text();let body;try{body=JSON.parse(raw)}catch{body=null}
  const row={name,method:'GET',endpoint:'/accounts/[ACCOUNT]/'+suffix,httpStatus:response.status,success:response.ok&&body?.success!==false,errors:(body?.errors??[]).map(e=>({code:e.code,message:safe(e.message)})),resultShape:body?.result==null?'absent':Array.isArray(body.result)?'array':typeof body.result};
  if(name==='accountTokenVerify'){row.tokenMatchesNamedDashboardToken=body?.result?.id===expectedToken;row.tokenStatus=body?.result?.status??null;}
  if(!body)row.nonJsonResponsePreview=safe(raw.replace(/<[^>]*>/g,' '));
  checks.push(row);
 }catch(e){checks.push({name,method:'GET',error:safe(e.message),success:false})}
}
const evidence={checkedAt:new Date().toISOString(),sourceSha:process.env.GITHUB_SHA??null,environment:process.env.BAUMAN_DIAGNOSTIC_ENVIRONMENT??null,accountMatchesDashboard:account===expectedAccount,credentialValueLogged:false,remoteMutations:false,checks};
fs.mkdirSync('artifacts/cloudflare-token-diagnostic',{recursive:true});
fs.writeFileSync('artifacts/cloudflare-token-diagnostic/result.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence,null,2));
if(!evidence.accountMatchesDashboard||checks.some(c=>!c.success)||checks[0].tokenMatchesNamedDashboardToken!==true)process.exitCode=1;
