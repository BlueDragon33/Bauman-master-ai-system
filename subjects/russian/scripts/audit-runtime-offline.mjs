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
const report={schema:'RUSSIAN_RUNTIME_OFFLINE_AUDIT_V1',required:{count:req.length,bytes:sum(req),largest:[...req].sort((a,b)=>b.bytes-a.bytes).slice(0,6)},optional:{count:opt.length,bytes:sum(opt),largest:[...opt].sort((a,b)=>b.bytes-a.bytes)},policy:{optionalPrecached:optional.filter(x=>sw.includes(`'./data/${x}.json'`)||sw.includes(`"./data/${x}.json"`)),userInitiatedFullCore:optimizer.includes('prepareOfflineCore'),explicitRefresh:optimizer.includes('{refresh:true}'),verifiedReadiness:optimizer.includes('reconcileOfflineCore')&&optimizer.includes('countCached'),saveDataGuard:optimizer.includes('navigator.connection?.saveData'),optionalNetworkOnly:sw.includes('isOptionalLarge')&&sw.includes('Optional source unavailable offline'),navigationOnlyHtmlFallback:sw.includes("req.mode==='navigate'")&&!sw.includes("catch(()=>caches.match('./index.html'))")}};
if(report.policy.optionalPrecached.length)throw new Error(`Large optional sources must not be precached: ${report.policy.optionalPrecached.join(', ')}`);
for(const [key,value] of Object.entries(report.policy)){if(key!=='optionalPrecached'&&!value)throw new Error(`Offline policy missing: ${key}`);}
console.log('RUSSIAN_RUNTIME_OFFLINE_AUDIT='+JSON.stringify(report));
console.log('RUSSIAN_RUNTIME_OFFLINE_AUDIT=PASS');
