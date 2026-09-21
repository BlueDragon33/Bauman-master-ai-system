import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const scanner='recovery/roadmap-v2/tools/scan-modern-baseline.mjs';
const profile='recovery/roadmap-v2/toolchain-profile-r2c2a.v1.json';
const outA='recovery/roadmap-v2/artifacts/r2c2a/scan-a.json';
const outB='recovery/roadmap-v2/artifacts/r2c2a/scan-b.json';

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.posix.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}
function canonicalSnapshot(){
  const out={};
  for(const p of walk('roadmap_v2').sort())out[p]=crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  return out;
}
function run(output){
  const r=spawnSync(process.execPath,[scanner,'--profile',profile,'--output',output],{encoding:'utf8'});
  if(r.status!==0)throw new Error(`R2C2A_SCAN_FAILED:${output}\n${r.stdout}\n${r.stderr}`);
  return r;
}
const canonicalBefore=canonicalSnapshot();
fs.rmSync('recovery/roadmap-v2/artifacts/r2c2a',{recursive:true,force:true});
run(outA);
run(outB);
const a=fs.readFileSync(outA);
const b=fs.readFileSync(outB);
assert.deepEqual(a,b,'R2C2A scan is not deterministic');

const report=JSON.parse(a.toString('utf8'));
assert.equal(report.schema,'BAUMAN_ROADMAP_V2_MODERN_BASELINE_SCAN_V1');
assert.equal(report.phase,'L27R2C2A_PARAMETERIZED_RECOVERY_TOOLCHAIN');
assert.equal(report.outputPolicy.scope,'recovery_only');
assert.equal(report.outputPolicy.canonicalWriteAllowed,false);
assert.deepEqual(report.summary,{
  sourceCount:5,
  legacyLessons:347,
  legacySlides:5552,
  overlayRecords:18,
  overlaySlides:306,
  frameworkChapters:21,
  frameworkSubLessons:172,
  chapterSpineRecords:56
});
const blobs=Object.fromEntries(report.sources.map(x=>[x.id,x.gitBlobSha]));
assert.deepEqual(blobs,{
  legacyLessons:'caacdf2b0813c1300af215608c4222ca61669184',
  theoryOverlay:'b4a7007af01118369a5da37927269f5138ee4b7f',
  theoryFramework:'fb3a9a052e6c467c03bea5204dae10303ba73766',
  chapterSpine:'db067682cce0389939048d5aabcaef38c6bad0e6',
  roadmapSpec:'fd1c3f179d66922faf6ac9363772f3d072851d00'
});

for(const bad of ['roadmap_v2/forbidden.json','../outside.json','/tmp/absolute.json']){
  const r=spawnSync(process.execPath,[scanner,'--profile',profile,'--output',bad],{encoding:'utf8'});
  assert.notEqual(r.status,0,`unsafe output accepted: ${bad}`);
}

const canonicalAfter=canonicalSnapshot();
assert.deepEqual(canonicalAfter,canonicalBefore,'recovery scanner modified canonical Roadmap tree');

console.log('ROADMAP_V2_L27R2C2A_PARAMETERIZED_TOOLCHAIN=PASS');
console.log(JSON.stringify({deterministic:true,sources:5,canonicalWrites:0,unsafeOutputCases:3,summary:report.summary},null,2));
