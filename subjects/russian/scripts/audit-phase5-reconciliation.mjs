import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const PARENT='676fe08d05e6d92ff4479620ad9bf00abe5f8da6';
const run=(args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const rows=run(['diff','--name-status',PARENT+'...HEAD']).split(/\r?\n/).filter(Boolean).map(line=>{
  const [status,...rest]=line.split('\t');
  return {status,path:rest.at(-1)};
});
const exact=new Set([
  '.github/workflows/russian-ui-reference-gate.yml',
  '.github/workflows/system-integration-ci.yml',
  'CODEX_STATE.md',
  'CODEX_TASK.md',
  'scripts/prepare-chatgpt-site.mjs',
  'scripts/prepare-cloudflare-preview.mjs',
  'tests/hub-premium-responsive-browser.mjs',
  'tests/russian-handwriting-recognition-browser.mjs',
  'tests/russian-handwriting-offline-authority-browser.mjs',
  'tests/system-browser-acceptance.mjs'
]);
const allowed=({path})=>path.startsWith('subjects/russian/')||exact.has(path);
const forbidden=({path})=>path.startsWith('foundation/')||path.startsWith('assets/js/academic')||path.startsWith('foundation/content-registry/')||path.startsWith('foundation/content-resolution/');
const badForbidden=rows.filter(forbidden);
const unexpected=rows.filter(x=>!allowed(x));
const deletions=rows.filter(x=>x.status.startsWith('D'));
if(badForbidden.length)throw new Error('Forbidden authority paths in Russian reconciliation slice: '+badForbidden.map(x=>x.path).join(', '));
if(unexpected.length)throw new Error('Unexpected paths in Russian reconciliation slice: '+unexpected.map(x=>x.path).join(', '));
if(deletions.length)throw new Error('Promotion slice must not delete files: '+deletions.map(x=>x.path).join(', '));

try{run(['merge-base','--is-ancestor','origin/main','HEAD']);}
catch{throw new Error('origin/main is not an ancestor of the reconciliation branch; explicit rebase review required');}
const ahead=Number(run(['rev-list','--count','origin/main..HEAD']));
if(!Number.isInteger(ahead)||ahead<1)throw new Error('Expected reconciliation branch to be ahead of origin/main');
if(ahead<100)throw new Error('History contamination sentinel unexpectedly low; review reconciliation assumptions before promotion');

const files=rows.map(x=>x.path).sort().map(path=>{
  const bytes=fs.readFileSync(path);
  return {path,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};
});
const authority=fs.readFileSync('subjects/russian/assets/handwriting-glyph-authority.js','utf8');
if(!authority.includes("status:'blocked'")||!authority.includes("source:'none'"))throw new Error('Production handwriting authority must remain blocked during reconciliation');

const manifest={
  schema:'RUSSIAN_PROMOTION_RECONCILIATION_MANIFEST_V1',
  parentCheckpoint:PARENT,
  sourceCommit:run(['rev-parse','HEAD']),
  mainCommit:run(['rev-parse','origin/main']),
  branchAheadBy:ahead,
  wholesaleMergeAllowed:false,
  fileCount:files.length,
  files
};
console.log('RUSSIAN_PROMOTION_RECONCILIATION_MANIFEST='+JSON.stringify(manifest));
console.log('RUSSIAN_PHASE5_RECONCILIATION_AUDIT=PASS');
