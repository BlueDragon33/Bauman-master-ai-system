'use strict';

const fs=require('fs');

const failures=[];
const checks=[];
const check=(name,ok,detail='')=>{checks.push({name,ok:!!ok,detail});if(!ok)failures.push(`${name}${detail?': '+detail:''}`);};
const read=file=>fs.readFileSync(file,'utf8');

const workerPath='service-worker.js';
const runtimePath='assets/js/platform/site-runtime.js';
const configPath='assets/js/platform/runtime-config.js';
const indexPath='index.html';
const worker=read(workerPath);
const runtime=read(runtimePath);
const config=read(configPath);
const index=read(indexPath);

const workerVersion=(worker.match(/const VERSION='([^']+)'/)||[])[1]||'';
const runtimeVersion=(runtime.match(/const VERSION='([^']+)'/)||[])[1]||'';
check('runtime and worker version match',!!workerVersion&&workerVersion===runtimeVersion,`${workerVersion} vs ${runtimeVersion}`);
check('service worker rollout remains gated off',/serviceWorkerCache:\s*false/.test(config));
check('shell install is atomic',/try\s*\{[\s\S]*for\s*\(const path of SHELL\)[\s\S]*throw new Error\(`Shell fetch failed/.test(worker)&&/catch\s*\(error\)\s*\{\s*await caches\.delete\(CACHE_NAME\);\s*throw error;/.test(worker));
check('old versioned shell caches are cleaned only on activate',/startsWith\('bauman-shell-'\)&&name!==CACHE_NAME/.test(worker));
check('explicit offline cache has canonical query-free key',/canonicalRequestUrl/.test(worker)&&/url\.search='';/.test(worker));
check('generic subject data is not shell-cache eligible',/path\.includes\('\/data\/'\)\|\|path\.includes\('\/external-data\/'\)/.test(worker)&&/path\.endsWith\('\.json'\)/.test(worker));
check('roadmap manifest is explicit shell exception',/iu5-090401-11-v3\.json/.test(worker));
check('direct local reader wired in main',index.includes('assets/js/platform/offline-direct-file-reader.js'));
check('direct local reader cached in shell',worker.includes("'./assets/js/platform/offline-direct-file-reader.js'"));

const fetchBlock=(worker.match(/self\.addEventListener\('fetch',[\s\S]*$/)||[])[0]||'';
check('explicit cache promise created before respondWith',fetchBlock.indexOf('const explicitPromise=')>=0&&fetchBlock.indexOf('const explicitPromise=')<fetchBlock.indexOf('event.respondWith'));
check('shell cache promise created before respondWith',fetchBlock.indexOf('const shellPromise=')>=0&&fetchBlock.indexOf('const shellPromise=')<fetchBlock.indexOf('event.respondWith'));
check('background refresh promise registered before respondWith',fetchBlock.indexOf('event.waitUntil(refreshPromise)')>=0&&fetchBlock.indexOf('event.waitUntil(refreshPromise)')<fetchBlock.indexOf('event.respondWith'));
check('no late waitUntil inside respondWith body',! /event\.respondWith\([\s\S]*event\.waitUntil\(/.test(fetchBlock));
check('explicit pack is served before shell/network fallback',fetchBlock.indexOf('if(explicit)return explicit')>=0&&fetchBlock.indexOf('if(explicit)return explicit')<fetchBlock.indexOf('if(shellCached)return shellCached'));
check('cached explicit resource revalidates in background',/if\(explicit\)return refreshCache\(request,OFFLINE_CONTENT_CACHE/.test(fetchBlock));
check('cached shell resource revalidates in background',/if\(shellCached\)return refreshCache\(request,CACHE_NAME,request\)/.test(fetchBlock));
check('network is final fallback',/try\{return await fetch\(request\);\}catch\(_\)\{return Response\.error\(\);\}/.test(fetchBlock));

const report={generatedAt:new Date().toISOString(),workerVersion,runtimeVersion,checks,failures};
fs.mkdirSync('docs/migration',{recursive:true});
fs.writeFileSync('docs/migration/L5_SERVICE_WORKER_LIFECYCLE_REGRESSION.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(`L5 service worker lifecycle regression: ${checks.length} checks, ${failures.length} failure(s).`);
if(failures.length){console.error(failures.join('\n'));process.exit(2);}
console.log('L5 service worker lifecycle regression PASS.');
