import fs from 'node:fs';
import vm from 'node:vm';
import {validateHandwritingGlyphAuthorityPolicy} from './handwriting-glyph-authority-policy.mjs';

const relative='subjects/russian/assets/handwriting-glyph-authority.js';
const source=fs.readFileSync(relative,'utf8');
const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:relative,timeout:1000});
const authority=sandbox.window.RUSSIAN_HANDWRITING_GLYPH_AUTHORITY;
const handwriting=JSON.parse(fs.readFileSync('subjects/russian/data/handwriting.json','utf8'));
const alphabetIds=handwriting.filter(x=>x?.mode==='alphabet'&&x?.id).map(x=>String(x.id));
const serviceWorker=fs.readFileSync('subjects/russian/sw.js','utf8');
const previewBuild=fs.readFileSync('scripts/prepare-cloudflare-preview.mjs','utf8');
const siteBuild=fs.readFileSync('scripts/prepare-chatgpt-site.mjs','utf8');

try{
  const result=validateHandwritingGlyphAuthorityPolicy({
    authority,
    root:process.cwd(),
    alphabetIds,
    serviceWorker,
    previewBuild,
    siteBuild
  });
  if(/https?:\/\//i.test(source))throw new Error('authority source must not depend on remote assets');
  if(result.ready)console.log('PASS · ready authority is hashed, covers all 33 letters, is precached offline, and survives both runtime package builders');
  else console.log('PASS · authority remains blocked by default');
  console.log('HANDWRITING_GLYPH_AUTHORITY_AUDIT=PASS');
}catch(error){
  console.error('HANDWRITING_GLYPH_AUTHORITY_AUDIT=FAIL · '+String(error?.message||error));
  process.exit(1);
}
