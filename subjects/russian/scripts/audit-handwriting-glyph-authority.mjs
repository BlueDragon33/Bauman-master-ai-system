import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const relative='subjects/russian/assets/handwriting-glyph-authority.js';
const source=fs.readFileSync(relative,'utf8');
const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:relative,timeout:1000});
const authority=sandbox.window.RUSSIAN_HANDWRITING_GLYPH_AUTHORITY;

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

if(!authority||authority.schema!=='RUSSIAN_HANDWRITING_GLYPH_AUTHORITY_V1')fail('missing or invalid schema');
if(!['blocked','ready'].includes(authority.status))fail('status must be blocked or ready');

if(authority.status==='blocked'){
  if(authority.source!=='none')fail('blocked authority source must be none');
  if(!Array.isArray(authority.trustedFamilies)||authority.trustedFamilies.length!==0)fail('blocked authority must not trust any font family');
  if(authority.asset!==null||authority.license!==null||authority.verifiedAt!==null)fail('blocked authority must not carry promotion metadata');
  console.log('PASS · authority remains blocked by default');
  console.log('HANDWRITING_GLYPH_AUTHORITY_AUDIT=PASS');
  process.exit(0);
}

if(authority.source!=='bundled-vetted')fail('ready authority source must be bundled-vetted');
if(!uniqueStrings(authority.trustedFamilies))fail('ready authority requires unique trusted font families');
if(!localRelative(authority.asset))fail('ready authority asset must be a local relative repo path');
if(!/\.(?:woff2?|ttf|otf)$/i.test(authority.asset))fail('ready authority asset must be a supported local font file');
if(!existingAsset(authority.asset))fail('ready authority asset file does not exist under subjects/russian/assets');
if(!localRelative(authority.license))fail('ready authority license must be a local relative repo path');
if(!existingAsset(authority.license))fail('ready authority license file does not exist under subjects/russian/assets');
if(!Number.isFinite(Date.parse(String(authority.verifiedAt||''))))fail('ready authority verifiedAt must be a valid date');
if(Date.parse(authority.verifiedAt)>Date.now()+300000)fail('ready authority verifiedAt cannot be materially in the future');
if(/https?:\/\//i.test(source))fail('authority source must not depend on remote assets');
console.log('PASS · ready authority has local vetted asset, license, font family and verification date');
console.log('HANDWRITING_GLYPH_AUTHORITY_AUDIT=PASS');
