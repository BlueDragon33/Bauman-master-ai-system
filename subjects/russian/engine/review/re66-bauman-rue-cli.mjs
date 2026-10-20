// RE66 Bauman endpoint for explicitly staged offline cross-repository handoff.
// Nothing is sent to RUE automatically. The browser runtime and learner records are untouched.
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildRe66RueRequest,verifyRe66RueAdvisoryBundle} from './re66-rue-content-first-bridge.mjs';
const sha=/^[a-f0-9]{40}$/;
const here=fileURLToPath(new URL('../../../..',import.meta.url));
export function runBaumanRe66Offline({
 mode='export',expectedHead,expectedRueHead=null,requestFile=null,advisoryFile=null,
 read=readFileSync,git=execFileSync
}={}){
 if(!sha.test(expectedHead||''))throw Error('RE66 requires --expected-head exact SHA');
 const actual=String(git('git',['rev-parse','HEAD'],
  {cwd:here,encoding:'utf8',timeout:5000,windowsHide:true})).trim();
 if(actual!==expectedHead)throw Error('Bauman RE66 HEAD mismatch; do not export stale source');
 const dirty=String(git('git',['status','--porcelain=v1','--untracked-files=all'],
  {cwd:here,encoding:'utf8',timeout:5000,windowsHide:true})).trim();
 if(dirty)throw Error('Bauman RE66 checkout contains uncommitted or untracked changes; STOP');
 const current=buildRe66RueRequest();
 if(mode==='export')return Object.freeze({baumanActualCheckoutHead:actual,
  candidateOnly:true,request:current});
 if(mode!=='verify'||!sha.test(expectedRueHead||'')||!requestFile||!advisoryFile)
  throw Error('RE66 verify requires --request, --advisory, --rue-head');
 const stored=JSON.parse(read(requestFile,'utf8'));
 if(stored?.request?.requestSha256!==current.requestSha256||
    stored?.baumanActualCheckoutHead!==actual)
  throw Error('RE66 stored request stale or not for this Bauman checkout');
 const fromRue=JSON.parse(read(advisoryFile,'utf8'));
 if(fromRue?.rueActualCheckoutHead!==expectedRueHead||
    fromRue?.candidateOnly!==true)
  throw Error('RE66 expert checkout SHA mismatch');
 return Object.freeze({
  schema:'BAUMAN_RE66_EXPERT_ADVISORY_READBACK_V1',
  baumanActualCheckoutHead:actual,rueActualCheckoutHead:fromRue.rueActualCheckoutHead,
  sourceBaselineCommit:current.sourceBaselineCommit,
  requestSha256:current.requestSha256,
  verification:verifyRe66RueAdvisoryBundle(current,fromRue.advisory),
  humanRu03Approval:false,learnerMasteryWrites:false,
  canonicalPublicationReady:false
 });
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 try{
  const arg=name=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null};
  const result=runBaumanRe66Offline({
   mode:arg('--mode')||'export',
   expectedHead:arg('--expected-head'),expectedRueHead:arg('--rue-head'),
   requestFile:arg('--request'),advisoryFile:arg('--advisory')
  });
  process.stdout.write(JSON.stringify(result)+'\n');
  if(result.verification&&!result.verification.ok)process.exitCode=2;
 }catch(e){
  process.stderr.write(JSON.stringify({status:'BLOCKED_RE66_BAUMAN_READBACK',
   reason:String(e?.message||e),humanRu03Approval:false})+'\n');
  process.exitCode=2;
 }
}
