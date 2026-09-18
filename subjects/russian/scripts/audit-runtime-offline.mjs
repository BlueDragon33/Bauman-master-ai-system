import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('subjects/russian');
const required=['curriculum','lessons','grammar','grammar-path','vocab','mindmap','exercises','tests','simulations','speaking','handwriting','writing','videos','knowledge-index'];
const optional=['dialogue-bauman-az','deep-speaking-bauman','speaking-link-index'];
const stat=name=>{const p=path.join(root,'data',`${name}.json`);return {name,bytes:fs.statSync(p).size};};
const req=required.map(stat), opt=optional.map(stat);
const sum=xs=>xs.reduce((a,x)=>a+x.bytes,0);
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const optimizer=fs.readFileSync(path.join(root,'assets','runtime-optimizer.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const shellMatch=sw.match(/const SHELL=\[([\s\S]*?)\];/);
if(!shellMatch)throw new Error('Offline shell declaration missing');
const shellRefs=[...shellMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(m=>m[1]);
const shellSet=new Set(shellRefs);
const normalizeRef=ref=>{
  const value=String(ref||'').split('#')[0].split('?')[0];
  if(!value||/^(?:https?:|data:|blob:|#)/i.test(value))return '';
  if(value.startsWith('../')||value.startsWith('./'))return value;
  return './'+value;
};
const indexRefs=[
  ...[...index.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(m=>m[1]),
  ...[...index.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["']/gi)].map(m=>m[1])
].map(normalizeRef).filter(Boolean);
const missingShellRefs=[...new Set(indexRefs.filter(ref=>!shellSet.has(ref)))];
const requiredFoundationRefs=[
 '../../foundation/domain-model/canonical-identity-runtime.js',
 '../../foundation/domain-model/identity-overlay-store.js',
 '../../foundation/domain-model/legacy-snapshot-extractor.js',
 '../../foundation/domain-model/canonical-read-projection.js',
 '../../foundation/domain-model/legacy-mapping-registry.v1.json',
 '../shared/foundation-identity-bootstrap.js',
 '../shared/foundation-identity-persistence.js',
 '../shared/foundation-identity-projection.js',
 '../shared/foundation-canonical-context.js'
];
const missingFoundationRefs=requiredFoundationRefs.filter(ref=>!shellSet.has(ref));
const report={schema:'RUSSIAN_RUNTIME_OFFLINE_AUDIT_V2',required:{count:req.length,bytes:sum(req),largest:[...req].sort((a,b)=>b.bytes-a.bytes).slice(0,6)},optional:{count:opt.length,bytes:sum(opt),largest:[...opt].sort((a,b)=>b.bytes-a.bytes)},shell:{indexRefs,missingShellRefs,missingFoundationRefs},policy:{optionalPrecached:optional.filter(x=>sw.includes(`'./data/${x}.json'`)||sw.includes(`"./data/${x}.json"`)),userInitiatedFullCore:optimizer.includes('prepareOfflineCore'),explicitRefresh:optimizer.includes('{refresh:true}'),verifiedReadiness:optimizer.includes('reconcileOfflineCore')&&optimizer.includes('countCached'),saveDataGuard:optimizer.includes('navigator.connection?.saveData'),optionalNetworkOnly:sw.includes('isOptionalLarge')&&sw.includes('Optional source unavailable offline'),navigationOnlyHtmlFallback:sw.includes("req.mode==='navigate'")&&!sw.includes("catch(()=>caches.match('./index.html'))"),foundationFetchCoverage:sw.includes('isFoundationIdentity')&&sw.includes('isSharedRuntime'),cacheVersionBumped:sw.includes("russian-app-shell-v2-foundation")}};
if(report.policy.optionalPrecached.length)throw new Error(`Large optional sources must not be precached: ${report.policy.optionalPrecached.join(', ')}`);
if(report.shell.missingShellRefs.length)throw new Error(`Index runtime refs missing from offline shell: ${report.shell.missingShellRefs.join(', ')}`);
if(report.shell.missingFoundationRefs.length)throw new Error(`Foundation identity refs missing from offline shell: ${report.shell.missingFoundationRefs.join(', ')}`);
for(const [key,value] of Object.entries(report.policy)){if(key!=='optionalPrecached'&&!value)throw new Error(`Offline policy missing: ${key}`);}
console.log('RUSSIAN_RUNTIME_OFFLINE_AUDIT='+JSON.stringify(report));
console.log('RUSSIAN_RUNTIME_OFFLINE_AUDIT=PASS');
