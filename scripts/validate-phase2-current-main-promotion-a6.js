'use strict';
const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/data/phase2-current-main-promotion-manifest-2026.json'),'utf8'));
const errors=[];const assert=(c,m)=>{if(!c)errors.push(m)};
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const git=args=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();

assert(manifest.version==='PHASE2_CURRENT_MAIN_A6_PROMOTION_CANDIDATE_V1','Unexpected A6 manifest version');
assert(manifest.baseBranch==='main','A6 promotion base must remain main');
assert(manifest.candidateBranch==='academic/phase2-current-main-rebuild','Unexpected A6 candidate branch');
assert(manifest.promotionPolicy?.autoMerge===false,'A6 must not auto-merge');
assert(manifest.promotionPolicy?.autoDeploy===false,'A6 must not auto-deploy');
assert(manifest.promotionPolicy?.productionMutationAllowed===false,'A6 must forbid production mutation');
assert(manifest.decision?.state==='CANDIDATE_ONLY','A6 decision must remain CANDIDATE_ONLY');
assert(manifest.decision?.mergeToMainAuthorized===false&&manifest.decision?.deployAuthorized===false,'A6 manifest must not authorize merge/deploy');

for(const p of manifest.requiredValidationScripts||[])assert(fs.existsSync(path.join(root,p)),`Missing required validator ${p}`);
for(const p of manifest.requiredBrowserTests||[])assert(fs.existsSync(path.join(root,p)),`Missing required browser test ${p}`);
for(const p of manifest.approvedChangedPaths||[])assert(fs.existsSync(path.join(root,p)),`Approved path missing from candidate ${p}`);

const approved=manifest.approvedChangedPaths||[];
assert(new Set(approved).size===approved.length,'approvedChangedPaths contains duplicates');
const approvedSet=new Set(approved);
let actual=[],statusRows=[];
try{
  actual=git(['diff','--name-only','origin/main...HEAD']).split(/\r?\n/).filter(Boolean);
  statusRows=git(['diff','--name-status','origin/main...HEAD']).split(/\r?\n/).filter(Boolean);
}catch(e){errors.push(`Unable to compute A6 diff against origin/main: ${e.message}`)}
const actualSet=new Set(actual);
for(const p of actual)assert(approvedSet.has(p),`UNAPPROVED changed path: ${p}`);
for(const p of approved)assert(actualSet.has(p),`Manifest path not changed vs main: ${p}`);
assert(actualSet.size===approvedSet.size,`A6 diff count mismatch actual=${actualSet.size} approved=${approvedSet.size}`);
for(const row of statusRows)assert(!/^D\s/.test(row),`A6 must not delete tracked main files: ${row}`);

for(const p of manifest.highRiskBoundaries?.mustRemainUnchanged||[])assert(!actualSet.has(p),`High-risk boundary changed: ${p}`);
for(const prefix of manifest.highRiskBoundaries?.forbiddenChangedPrefixes||[])for(const p of actual)assert(!p.startsWith(prefix),`Forbidden prefix changed: ${p}`);
for(const base of manifest.highRiskBoundaries?.forbiddenChangedBasenames||[])for(const p of actual)assert(path.basename(p)!==base,`Forbidden deployment/config file changed: ${p}`);

for(const wf of actual.filter(p=>p.startsWith('.github/workflows/'))){
  const t=read(wf);
  assert(!/\bwrangler\s+deploy\b/.test(t),`Changed workflow must not deploy: ${wf}`);
  assert(!/CLOUDFLARE_API_TOKEN/.test(t),`Changed workflow must not consume deploy credentials: ${wf}`);
  assert(!/environment:\s*(production|prod)\b/i.test(t),`Changed workflow must not target production: ${wf}`);
}

const preview=read('.github/workflows/deploy-bauman-preview.yml');
assert(preview.includes('workflow_dispatch:'),'Preview deploy must remain manually dispatched');
assert(preview.includes('DEPLOY_PREVIEW'),'Preview deploy explicit confirmation token missing');
assert(preview.includes('No production Worker or production D1 is changed by this workflow.'),'Preview production boundary marker missing');

try{cp.execFileSync('git',['merge-base','--is-ancestor','origin/main','HEAD'],{cwd:root,stdio:'ignore'})}
catch{errors.push('A6 candidate is behind/diverged from current origin/main')}

if(errors.length){console.error(`A6_CURRENT_MAIN_PROMOTION_FAIL (${errors.length})`);for(const e of errors)console.error('- '+e);process.exit(1)}
console.log('A6_CURRENT_MAIN_PROMOTION_PASS');
console.log(JSON.stringify({state:manifest.decision.state,changedPaths:actualSet.size,base:'origin/main',mainIsAncestor:true,autoMerge:false,autoDeploy:false,productionMutation:false},null,2));
