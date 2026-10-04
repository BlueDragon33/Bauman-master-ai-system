import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const templatePath='prompts/subjects/python/evidence/PYTHON_RC_MANIFEST.json';
const outDir=process.env.PYTHON_RC_EVIDENCE_DIR||'artifacts/python-p6-rc';
const sha=String(process.env.GITHUB_SHA||'').trim()||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const manifest=JSON.parse(fs.readFileSync(templatePath,'utf8'));
const digest=(file)=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const identities={};
for(const file of manifest.identityFiles||[])identities[file]=digest(file);
const exact={...manifest,status:'EXACT_RC',sourceSha:sha,identitySha256:identities};
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'PYTHON_RC_EXACT.json'),JSON.stringify(exact,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',sourceSha:sha,runtimeProfile:manifest.runtime?.runtimeProfileId,identityFiles:Object.keys(identities).length}));
