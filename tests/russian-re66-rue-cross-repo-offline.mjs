// Explicit opt-in integration gate. Requires two existing local checkouts.
// No Work/Codex, network requests, GitHub Actions, microphone, runtime edits or publishes.
// Never claims an advisory is a qualified human RU03 linguistic/audio verdict.
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {buildRe66RueRequest,verifyRe66RueAdvisoryBundle}
 from '../subjects/russian/engine/review/re66-rue-content-first-bridge.mjs';

const bauman=resolve(process.cwd());
const rue=process.env.BAUMAN_RUE_OFFLINE_CHECKOUT;
const expectedBauman=process.env.BAUMAN_RE66_EXACT_BAUMAN_HEAD;
const expectedRue=process.env.BAUMAN_RE66_EXACT_RUE_HEAD;
const Sha=/^[a-f0-9]{40}$/;
const actual=dir=>String(execFileSync('git',['rev-parse','HEAD'],{
 cwd:dir,encoding:'utf8',timeout:5000,windowsHide:true
})).trim();
if(!rue||!Sha.test(expectedBauman||'')||!Sha.test(expectedRue||'')||
   !existsSync(join(rue,'src/pilots/ru03-bauman-r02-r04.mjs'))){
 console.log('RUSSIAN_RE66_CROSS_REPO_BLOCKED_NOT_CONFIGURED');
 process.exitCode=2;
}else{
 assert.equal(actual(bauman),expectedBauman,'Bauman actual checkout SHA mismatch');
 assert.equal(actual(rue),expectedRue,'RUE actual checkout SHA mismatch');
 const dirty=dir=>String(execFileSync('git',
   ['status','--porcelain=v1','--untracked-files=all'],
   {cwd:dir,encoding:'utf8',timeout:5000,windowsHide:true})).trim();
 assert.equal(dirty(bauman),'','Bauman checkout contains uncommitted/untracked changes');
 assert.equal(dirty(rue),'','RUE checkout contains uncommitted/untracked changes');
 const plugin=await import(pathToFileURL(join(resolve(rue),'src/pilots/ru03-bauman-r02-r04.mjs')).href);
 const request=buildRe66RueRequest();
 assert.equal(plugin.validateRueRe66Request(request).ok,true);
 const result=plugin.buildRueRe66AdvisoryBundle(request);
 const check=verifyRe66RueAdvisoryBundle(request,result);
 assert.equal(check.ok,true,'Cross-owner advisory checksum/revision contract rejected');
 assert.equal(result.advisories.length,6);
 assert.ok(result.advisories.every(x=>
   x.grammarEvidence?.sourceItemId===x.sourceItemId&&
   x.grammarEvidence.exactCanonicalText===true&&
   x.grammarEvidence.grammarScore===null&&
   x.grammarEvidence.acceptedAsCorrect===false&&
   x.grammarEvidence.humanRu03Approved===false),
  'Every RE67 text-pattern report must remain advisory and source-bound');
 assert.equal(result.humanApproval,false);
 assert.equal(result.audioApproved,false);
 assert.equal(result.independentBenchmark,'NO_HUMAN_LABELED_GOLD_SET');
 assert.equal(result.canonicalPublicationReady,false);
 assert.ok(result.advisories.every(x=>x.preflight.audioQa==='BLOCKED_NO_IMMUTABLE_LICENSED_RECORDING'));
 const forged=structuredClone(result);
 forged.advisories[0].advisory.humanApproval=true;
 assert.equal(verifyRe66RueAdvisoryBundle(request,forged).ok,false);
 console.log('RUSSIAN_RE66_CROSS_REPO_OFFLINE_NODE_PASS',JSON.stringify({
  baumanHead:expectedBauman,rueHead:expectedRue,items:6,
  sourceBound:true,advisoryOnly:true,realNodeSha256:true,
  grammarApproved:false,audioApproved:false,
  independentBenchmark:'PENDING_HUMAN_LABELS',
  canonicalPublicationReady:false
 }));
}
