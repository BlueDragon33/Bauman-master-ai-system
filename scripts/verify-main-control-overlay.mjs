// Blueprint OS 1.3.0: audit main + Draft control-service patch in a
// disposable detached git worktree; NEVER merge, rebase, push or publish.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo=resolve(fileURLToPath(new URL("..",import.meta.url)));
function git(args,{cwd=repo,input,quiet=false}={}) {
  const p=spawnSync("git",args,{cwd,input,encoding:input?null:"utf8",
    maxBuffer:16*1024*1024,windowsHide:true});
  if(p.error||p.status!==0)throw Error("OVERLAY_GIT_FAILED "+args.slice(0,3).join(" ")+" "+String(p.stderr??p.error).slice(-900));
  if(!quiet&&p.stderr?.length)process.stderr.write(p.stderr);
  return p.stdout;
}
function run(command,cwd){
  // Only fixed literal CI commands (no untrusted shell interpolation).
  const result=spawnSync(command,{cwd,shell:true,stdio:"inherit",windowsHide:true,
    env:{...process.env,CI:"1",WRANGLER_SEND_METRICS:"false"}});
  if(result.error||result.status!==0)throw Error("OVERLAY_COMMAND_FAILED "+command+" exit="+result.status);
}
function names(base,head) {
  return new Set(git(["diff","--name-only",base,head]).trim().split(/\r?\n/).filter(Boolean));
}
const head=git(["rev-parse","HEAD"]).trim();
const expected=process.env.EXPECTED_PR_HEAD;
if(expected&&head!==expected)throw Error("OVERLAY_HEAD_NOT_EXPECTED");
const branchMain=git(["rev-parse","origin/main"]).trim();
const mergeBase=git(["merge-base",head,branchMain]).trim();
const draftPaths=names(mergeBase,head),mainPaths=names(mergeBase,branchMain);
const overlap=[...draftPaths].filter(x=>mainPaths.has(x));
if(overlap.length)throw Error("OVERLAY_SOURCE_PATH_CONFLICT "+overlap.join(","));
assert.ok(draftPaths.has("control-service/src/automation-contract.ts"),"wrong Draft patch source");
assert.ok(mainPaths.has("subjects/russian/assets/core.js"),"unexpected main change inventory");
const patch=git(["diff","--binary",mergeBase,head],{quiet:true});
const directory=mkdtempSync(join(tmpdir(),"bauman-main-control-overlay-"));
let checkedOut=false;
try {
  git(["worktree","add","--detach",directory,branchMain],{quiet:true});
  checkedOut=true;
  git(["-C",directory,"apply","--check","--index","-"],{input:patch,quiet:true});
  git(["-C",directory,"apply","--index","-"],{input:patch,quiet:true});
  // Compare each old-main-only artifact against the real remote-main blob.
  for(const path of mainPaths) {
    if(draftPaths.has(path))throw Error("MAIN_FILE_CONFLICT "+path);
    const expectedBlob=git(["rev-parse",branchMain+":"+path]).trim();
    const currentBlob=git(["-C",directory,"hash-object",path]).trim();
    if(expectedBlob!==currentBlob)throw Error("MAIN_FILE_NOT_PRESERVED "+path);
  }
  const cwd=join(directory,"control-service");
  run("npm ci --no-audit --no-fund",cwd);
  run("npm run gate",cwd);
  run("node scripts/real-worker-wrangler-gate-smoke.mjs",cwd);
  console.log(JSON.stringify({result:"BAUMAN_MAIN_DRAFT_OVERLAY_REAL_WORKER_PASS",
    sourceHead:head,baseMain:branchMain,mergeBase,
    mainChangedFiles:mainPaths.size,draftChangedFiles:draftPaths.size,overlap:0,
    exactMainBlobsPreserved:true,realControlWorkerD1Gate:true,
    mergePerformed:false,mainModified:false,publishPerformed:false,
    authorizedSourceAdmission:false,globalD1DrainVerified:false}));
} finally {
  if(checkedOut)git(["worktree","remove","--force",directory],{quiet:true});
  rmSync(directory,{force:true,recursive:true,maxRetries:5,retryDelay:250});
}
