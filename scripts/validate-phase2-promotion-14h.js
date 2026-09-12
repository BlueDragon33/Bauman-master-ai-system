'use strict';

const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const root=path.resolve(__dirname,'..');
const manifestPath=path.join(root,'assets/data/phase2-promotion-manifest-2026.json');
const errors=[];
const assert=(condition,message)=>{if(!condition)errors.push(message)};
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const git=(args)=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();

const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
assert(manifest.version==='PHASE2_PASS14H_PROMOTION_CANDIDATE_V1','Unexpected Pass14H manifest version');
assert(manifest.baseBranch==='main','Promotion base must remain main');
assert(manifest.candidateBranch==='phase2/pass14h-promotion-gate','Unexpected promotion candidate branch');
assert(manifest.promotionPolicy?.autoMerge===false,'Pass14H must not auto-merge');
assert(manifest.promotionPolicy?.autoDeploy===false,'Pass14H must not auto-deploy');
assert(manifest.promotionPolicy?.productionMutationAllowed===false,'Pass14H must forbid production mutation');
assert(manifest.decision?.mergeToMainAuthorized===false,'Manifest must not authorize merge to main');
assert(manifest.decision?.deployAuthorized===false,'Manifest must not authorize deployment');
assert(manifest.decision?.state==='CANDIDATE_ONLY','Promotion state must remain CANDIDATE_ONLY');

for(const p of manifest.requiredValidationScripts||[])assert(fs.existsSync(path.join(root,p)),`Missing required validator ${p}`);
for(const p of manifest.requiredBrowserTests||[])assert(fs.existsSync(path.join(root,p)),`Missing required browser test ${p}`);
for(const p of manifest.approvedChangedPaths||[])assert(fs.existsSync(path.join(root,p)),`Approved promotion path missing from candidate ${p}`);

const approved=manifest.approvedChangedPaths||[];
assert(new Set(approved).size===approved.length,'approvedChangedPaths contains duplicate entries');
const approvedSet=new Set(approved);
let actualNames=[];let statusRows=[];
try{
  actualNames=git(['diff','--name-only','origin/main...HEAD']).split(/\r?\n/).filter(Boolean);
  statusRows=git(['diff','--name-status','origin/main...HEAD']).split(/\r?\n/).filter(Boolean);
}catch(err){errors.push(`Unable to compute promotion diff against origin/main: ${err.message}`)}
const actualSet=new Set(actualNames);
for(const p of actualNames)assert(approvedSet.has(p),`UNAPPROVED changed path: ${p}`);
for(const p of approved)assert(actualSet.has(p),`Manifest path is not actually changed vs main: ${p}`);
assert(actualSet.size===approvedSet.size,`Promotion diff count mismatch: actual ${actualSet.size}, approved ${approvedSet.size}`);
for(const row of statusRows)assert(!/^D\s/.test(row),`Promotion candidate must not delete tracked main files: ${row}`);

for(const p of manifest.highRiskBoundaries?.mustRemainUnchanged||[])assert(!actualSet.has(p),`High-risk runtime boundary changed: ${p}`);
for(const prefix of manifest.highRiskBoundaries?.forbiddenChangedPrefixes||[])for(const p of actualNames)assert(!p.startsWith(prefix),`Forbidden promotion prefix changed: ${p}`);
for(const base of manifest.highRiskBoundaries?.forbiddenChangedBasenames||[])for(const p of actualNames)assert(path.basename(p)!==base,`Forbidden deployment/config file changed: ${p}`);

const changedWorkflows=actualNames.filter(p=>p.startsWith('.github/workflows/'));
for(const wf of changedWorkflows){
  const text=read(wf);
  assert(!/\bwrangler\s+deploy\b/.test(text),`Changed Phase2 workflow must not deploy: ${wf}`);
  assert(!/CLOUDFLARE_API_TOKEN/.test(text),`Changed Phase2 workflow must not consume deploy credentials: ${wf}`);
  assert(!/environment:\s*(production|prod)\b/i.test(text),`Changed Phase2 workflow must not target production environment: ${wf}`);
}

const previewDeploy=read('.github/workflows/deploy-bauman-preview.yml');
assert(previewDeploy.includes('workflow_dispatch:'),'Existing preview deploy must remain explicitly dispatched');
assert(!/\n\s*push:\s*(?:\n|$)/.test(previewDeploy),'Existing preview deploy must not become push-triggered');
assert(previewDeploy.includes('DEPLOY_PREVIEW'),'Existing preview deploy must keep explicit confirmation token');
assert(previewDeploy.includes('No production Worker or production D1 is changed by this workflow.'),'Preview deploy production boundary marker missing');

try{cp.execFileSync('git',['cat-file','-e',`${manifest.validatedIntegrationCodeHead}^{commit}`],{cwd:root,stdio:'ignore'})}catch{errors.push('Validated Pass14G code head is not present in candidate history')}
try{cp.execFileSync('git',['merge-base','--is-ancestor','origin/main','HEAD'],{cwd:root,stdio:'ignore'})}catch{errors.push('Candidate is behind/diverged from current origin/main; refresh before promotion')}

const phase2Runtime=read('assets/js/academic-command-center-runtime.js');
const courseRuntime=read('assets/js/academic-course-runtime.js');
const eventRuntime=read('assets/js/academic-event-runtime.js');
const gradeRuntime=read('assets/js/academic-grade-runtime.js');
const transcriptRuntime=read('assets/js/academic-transcript-runtime.js');
assert(phase2Runtime.includes('schedulerMutation:false'),'Command Center scheduler safety marker missing');
assert(gradeRuntime.includes('supplementCounting:false'),'Grade runtime must not count transcript rows');
assert(transcriptRuntime.includes('finalEligibilityClaimed:false'),'Transcript runtime must not claim final honors eligibility from projection/incomplete evidence');
assert(eventRuntime.includes('courseCompletionMutation:false'),'Event runtime must not mutate course completion');
assert(courseRuntime.includes('No scheduler/storage mutation'),'Course runtime read-only boundary missing');

if(errors.length){
  console.error(`PASS14H_PROMOTION_GATE_FAIL (${errors.length})`);
  for(const e of errors)console.error(`- ${e}`);
  process.exit(1);
}
console.log('PASS14H_PROMOTION_GATE_PASS');
console.log(JSON.stringify({
  state:manifest.decision.state,
  changedPaths:actualSet.size,
  changedWorkflows,
  base:'origin/main',
  mainIsAncestor:true,
  autoMerge:false,
  autoDeploy:false,
  productionMutation:false,
  validatedIntegrationRunId:manifest.validatedIntegrationRunId
},null,2));
