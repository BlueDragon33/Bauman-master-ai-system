import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

const root=process.cwd();
const relative='subjects/russian/assets/handwriting-glyph-authority.js';
const source=fs.readFileSync(relative,'utf8');
const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:relative,timeout:1000});
const authority=sandbox.window.RUSSIAN_HANDWRITING_GLYPH_AUTHORITY;
const handwriting=JSON.parse(fs.readFileSync('subjects/russian/data/handwriting.json','utf8'));
const serviceWorker=fs.readFileSync('subjects/russian/sw.js','utf8');
const previewBuild=fs.readFileSync('scripts/prepare-cloudflare-preview.mjs','utf8');
const siteBuild=fs.readFileSync('scripts/prepare-chatgpt-site.mjs','utf8');
const alphabetIds=handwriting.filter(x=>x?.mode==='alphabet'&&x?.id).map(x=>String(x.id));

function fail(message){console.error('HANDWRITING_GLYPH_AUTHORITY_AUDIT=FAIL · '+message);process.exit(1);}
function localRelative(value){
  const v=String(value||'').trim();
  return !!v&&!/^[a-z]+:/i.test(v)&&!v.startsWith('/')&&!v.includes('..')&&!v.includes('\\');
}
function existingAsset(value){
  if(!localRelative(value))return false;
  const full=path.resolve(root,value);
  const allowed=path.resolve(root,'subjects/russian/assets');
  return full.startsWith(allowed+path.sep)&&fs.statSync(full,{throwIfNoEntry:false})?.isFile()===true;
}
function uniqueStrings(values){
  return Array.isArray(values)&&values.length>0&&values.every(v=>typeof v==='string'&&v.trim())&&new Set(values.map(v=>v.trim())).size===values.length;
}
function sha256(relativePath){
  return crypto.createHash('sha256').update(fs.readFileSync(path.resolve(root,relativePath))).digest('hex');
}
function validSha(value){return /^[a-f0-9]{64}$/i.test(String(value||''));}
function sameSet(a,b){
  if(a.length!==b.length)return false;
  const left=[...a].sort(),right=[...b].sort();
  return left.every((v,i)=>v===right[i]);
}
function russianRuntimePath(repoPath){
  const prefix='subjects/russian/';
  const value=String(repoPath||'');
  if(!value.startsWith(prefix))fail('authority runtime asset must live under subjects/russian');
  return './'+value.slice(prefix.length);
}
function shellContains(repoPath){
  const runtime=russianRuntimePath(repoPath);
  return serviceWorker.includes("'"+runtime+"'")||serviceWorker.includes('"'+runtime+'"');
}

if(!authority||authority.schema!=='RUSSIAN_HANDWRITING_GLYPH_AUTHORITY_V1')fail('missing or invalid schema');
if(!['blocked','ready'].includes(authority.status))fail('status must be blocked or ready');

if(authority.status==='blocked'){
  if(authority.source!=='none')fail('blocked authority source must be none');
  if(!Array.isArray(authority.trustedFamilies)||authority.trustedFamilies.length!==0)fail('blocked authority must not trust any font family');
  if(
    authority.asset!==null||authority.assetSha256!==null||
    authority.license!==null||authority.licenseSha256!==null||
    authority.coverageManifest!==null||authority.coverageSha256!==null||
    authority.verifiedAt!==null
  )fail('blocked authority must not carry promotion metadata');
  console.log('PASS · authority remains blocked by default');
  console.log('HANDWRITING_GLYPH_AUTHORITY_AUDIT=PASS');
  process.exit(0);
}

if(authority.source!=='bundled-vetted')fail('ready authority source must be bundled-vetted');
if(!uniqueStrings(authority.trustedFamilies))fail('ready authority requires unique trusted font families');
if(!localRelative(authority.asset))fail('ready authority asset must be a local relative repo path');
if(!/\.(?:woff2?|ttf|otf)$/i.test(authority.asset))fail('ready authority asset must be a supported local font file');
if(!existingAsset(authority.asset))fail('ready authority asset file does not exist under subjects/russian/assets');
if(!validSha(authority.assetSha256))fail('ready authority assetSha256 must be a SHA-256 digest');
if(sha256(authority.asset)!==String(authority.assetSha256).toLowerCase())fail('ready authority assetSha256 does not match the bundled asset');
if(!localRelative(authority.license))fail('ready authority license must be a local relative repo path');
if(!existingAsset(authority.license))fail('ready authority license file does not exist under subjects/russian/assets');
if(!validSha(authority.licenseSha256))fail('ready authority licenseSha256 must be a SHA-256 digest');
if(sha256(authority.license)!==String(authority.licenseSha256).toLowerCase())fail('ready authority licenseSha256 does not match the bundled license');
if(!localRelative(authority.coverageManifest))fail('ready authority coverageManifest must be a local relative repo path');
if(!existingAsset(authority.coverageManifest))fail('ready authority coverage manifest does not exist under subjects/russian/assets');
if(!validSha(authority.coverageSha256))fail('ready authority coverageSha256 must be a SHA-256 digest');
if(sha256(authority.coverageManifest)!==String(authority.coverageSha256).toLowerCase())fail('ready authority coverageSha256 does not match the coverage manifest');
let coverage;
try{coverage=JSON.parse(fs.readFileSync(path.resolve(root,authority.coverageManifest),'utf8'));}catch{fail('ready authority coverage manifest is not valid JSON');}
if(coverage?.schema!=='RUSSIAN_HANDWRITING_GLYPH_COVERAGE_V1')fail('coverage manifest schema is invalid');
if(!uniqueStrings(coverage.alphabetIds)||coverage.alphabetIds.length!==33)fail('coverage manifest must enumerate exactly 33 alphabet IDs');
if(!sameSet(coverage.alphabetIds.map(String),alphabetIds))fail('coverage manifest alphabet IDs do not match the Russian handwriting dataset');
if(!uniqueStrings(coverage.fontFamilies)||!sameSet(coverage.fontFamilies.map(String),authority.trustedFamilies.map(String)))fail('coverage manifest fontFamilies must exactly match trustedFamilies');
if(!Number.isFinite(Date.parse(String(coverage.reviewedAt||''))))fail('coverage manifest reviewedAt must be a valid date');
if(!String(coverage.reviewedBy||'').trim())fail('coverage manifest reviewedBy is required');
for(const requiredOffline of [authority.asset,authority.license,authority.coverageManifest]){
  if(!shellContains(requiredOffline))fail('ready authority asset must be precached by Russian Service Worker: '+requiredOffline);
}
if(!previewBuild.includes("fs.cpSync(path.join(root, 'subjects'), path.join(runtimeDist, 'subjects'), { recursive: true })"))fail('Cloudflare runtime build must copy the complete subjects tree for authority assets');
if(!siteBuild.includes("fs.cpSync(source,output,{recursive:true})"))fail('ChatGPT Site build must preserve the complete accepted runtime tree');
if(!Number.isFinite(Date.parse(String(authority.verifiedAt||''))))fail('ready authority verifiedAt must be a valid date');
if(Date.parse(authority.verifiedAt)>Date.now()+300000)fail('ready authority verifiedAt cannot be materially in the future');
if(/https?:\/\//i.test(source))fail('authority source must not depend on remote assets');
console.log('PASS · ready authority is hashed, covers all 33 letters, is precached offline, and survives both runtime package builders');
console.log('HANDWRITING_GLYPH_AUTHORITY_AUDIT=PASS');
