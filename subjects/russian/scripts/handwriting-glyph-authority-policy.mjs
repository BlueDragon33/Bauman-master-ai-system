import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function fail(message){throw new Error(message);}
function text(value){return String(value??'').trim();}
function validSha(value){return /^[a-f0-9]{64}$/i.test(text(value));}
function localRelative(value){
  const v=text(value);
  return !!v&&!/^[a-z]+:/i.test(v)&&!v.startsWith('/')&&!v.includes('..')&&!v.includes('\\');
}
function uniqueStrings(values){
  return Array.isArray(values)&&values.length>0&&values.every(v=>typeof v==='string'&&v.trim())&&new Set(values.map(v=>v.trim())).size===values.length;
}
function sameSet(a,b){
  if(a.length!==b.length)return false;
  const left=[...a].map(String).sort(),right=[...b].map(String).sort();
  return left.every((v,i)=>v===right[i]);
}
function sha256(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}
function runtimePath(repoPath){
  const prefix='subjects/russian/';
  const value=text(repoPath);
  if(!value.startsWith(prefix))fail('authority runtime asset must live under subjects/russian');
  return './'+value.slice(prefix.length);
}
function shellContains(serviceWorker,repoPath){
  const runtime=runtimePath(repoPath);
  return serviceWorker.includes("'"+runtime+"'")||serviceWorker.includes('"'+runtime+'"');
}

export function validateHandwritingGlyphAuthorityPolicy({
  authority,
  root=process.cwd(),
  alphabetIds,
  serviceWorker,
  previewBuild,
  siteBuild
}){
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
    return {status:'blocked',ready:false};
  }

  if(authority.source!=='bundled-vetted')fail('ready authority source must be bundled-vetted');
  if(!uniqueStrings(authority.trustedFamilies))fail('ready authority requires unique trusted font families');
  const authorityPrefix='subjects/russian/assets/handwriting-authority/';
  const assetRoot=path.resolve(root,'subjects/russian/assets/handwriting-authority');
  const requireAsset=(repoPath,label)=>{
    if(!localRelative(repoPath))fail('ready authority '+label+' must be a local relative repo path');
    if(!String(repoPath).startsWith(authorityPrefix))fail('ready authority '+label+' must live under subjects/russian/assets/handwriting-authority');
    const full=path.resolve(root,repoPath);
    if(!full.startsWith(assetRoot+path.sep))fail('ready authority '+label+' must live under subjects/russian/assets/handwriting-authority');
    if(!fs.statSync(full,{throwIfNoEntry:false})?.isFile())fail('ready authority '+label+' file does not exist under subjects/russian/assets');
    return full;
  };

  const asset=requireAsset(authority.asset,'asset');
  if(!/\.(?:woff2?|ttf|otf)$/i.test(authority.asset))fail('ready authority asset must be a supported local font file');
  if(!validSha(authority.assetSha256))fail('ready authority assetSha256 must be a SHA-256 digest');
  if(sha256(asset)!==text(authority.assetSha256).toLowerCase())fail('ready authority assetSha256 does not match the bundled asset');

  const license=requireAsset(authority.license,'license');
  if(!validSha(authority.licenseSha256))fail('ready authority licenseSha256 must be a SHA-256 digest');
  if(sha256(license)!==text(authority.licenseSha256).toLowerCase())fail('ready authority licenseSha256 does not match the bundled license');

  const coverageFile=requireAsset(authority.coverageManifest,'coverage manifest');
  if(!validSha(authority.coverageSha256))fail('ready authority coverageSha256 must be a SHA-256 digest');
  if(sha256(coverageFile)!==text(authority.coverageSha256).toLowerCase())fail('ready authority coverageSha256 does not match the coverage manifest');

  let coverage;
  try{coverage=JSON.parse(fs.readFileSync(coverageFile,'utf8'));}catch{fail('ready authority coverage manifest is not valid JSON');}
  if(coverage?.schema!=='RUSSIAN_HANDWRITING_GLYPH_COVERAGE_V1')fail('coverage manifest schema is invalid');
  if(!uniqueStrings(coverage.alphabetIds)||coverage.alphabetIds.length!==33)fail('coverage manifest must enumerate exactly 33 alphabet IDs');
  if(!sameSet(coverage.alphabetIds,alphabetIds))fail('coverage manifest alphabet IDs do not match the Russian handwriting dataset');
  if(!uniqueStrings(coverage.fontFamilies)||!sameSet(coverage.fontFamilies,authority.trustedFamilies))fail('coverage manifest fontFamilies must exactly match trustedFamilies');
  if(!Number.isFinite(Date.parse(text(coverage.reviewedAt))))fail('coverage manifest reviewedAt must be a valid date');
  if(!text(coverage.reviewedBy))fail('coverage manifest reviewedBy is required');

  for(const requiredOffline of [authority.asset,authority.license,authority.coverageManifest]){
    if(!shellContains(serviceWorker,requiredOffline))fail('ready authority asset must be precached by Russian Service Worker: '+requiredOffline);
  }
  if(!serviceWorker.includes("const isAuthorityAsset=url.pathname.includes('/subjects/russian/assets/handwriting-authority/')"))fail('Russian Service Worker must detect the dedicated handwriting authority asset namespace');
  if(!serviceWorker.includes('if(isAuthority||isAuthorityAsset)')||!serviceWorker.includes("fetch(req,{cache:'no-store'})"))fail('handwriting authority assets must refresh network-first with offline cache fallback');
  if(!previewBuild.includes("fs.cpSync(path.join(root, 'subjects'), path.join(runtimeDist, 'subjects'), { recursive: true })"))fail('Cloudflare runtime build must copy the complete subjects tree for authority assets');
  if(!siteBuild.includes("fs.cpSync(source,output,{recursive:true})"))fail('ChatGPT Site build must preserve the complete accepted runtime tree');

  if(!Number.isFinite(Date.parse(text(authority.verifiedAt))))fail('ready authority verifiedAt must be a valid date');
  if(Date.parse(authority.verifiedAt)>Date.now()+300000)fail('ready authority verifiedAt cannot be materially in the future');
  return {status:'ready',ready:true,asset:authority.asset,coverageCount:coverage.alphabetIds.length};
}
