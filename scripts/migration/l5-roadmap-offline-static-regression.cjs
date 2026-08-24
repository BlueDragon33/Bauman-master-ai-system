'use strict';

const fs=require('fs');

const failures=[];
const checks=[];
function read(file){return fs.readFileSync(file,'utf8');}
function requireFile(file){if(!fs.existsSync(file)){failures.push(`Missing ${file}`);return false;}return true;}
function check(name,ok,detail=''){checks.push({name,ok:!!ok,detail});if(!ok)failures.push(`${name}${detail?': '+detail:''}`);}

const manifestPath='assets/data/roadmap/iu5-090401-11-v3.json';
const roadmapDocPath='docs/roadmap/BAUMAN_IU5_090401_11_ROADMAP_V3.md';
const blueprintPath='docs/roadmap/WEBAPP_OFFLINE_FIRST_BLUEPRINT.md';
const libraryPath='assets/js/platform/offline-content-library.js';
const roadmapBridgePath='assets/js/platform/academic-roadmap-v3-bridge.js';
const offlineUiPath='assets/js/platform/offline-library-ui.js';
const sandboxGuardPath='assets/js/platform/offline-html-sandbox-guard.js';
const quotaGuardPath='assets/js/platform/offline-import-quota-guard.js';
const packManagerPath='assets/js/platform/offline-subject-pack-manager.js';
const refcountGuardPath='assets/js/platform/offline-subject-pack-refcount-guard.js';
const indexPath='index.html';
const configPath='assets/js/platform/runtime-config.js';
const workerPath='service-worker.js';

for(const file of [manifestPath,roadmapDocPath,blueprintPath,libraryPath,roadmapBridgePath,offlineUiPath,sandboxGuardPath,quotaGuardPath,packManagerPath,refcountGuardPath,indexPath,configPath,workerPath])requireFile(file);

let manifest=null;
try{manifest=JSON.parse(read(manifestPath));}catch(error){failures.push(`Manifest JSON invalid: ${error.message}`);}
if(manifest){
  check('roadmap id',manifest.id==='bauman-iu5-090401-11',String(manifest.id));
  check('display code',manifest.displayCode==='09.04.01/11',String(manifest.displayCode));
  check('department',manifest.department==='ИУ-5',String(manifest.department));
  check('cohort 2026',Number(manifest.cohortYear)===2026,String(manifest.cohortYear));
  check('duration 2 years',Number(manifest.durationYears)===2,String(manifest.durationYears));
  check('credits 120',Number(manifest.credits)===120,String(manifest.credits));
  check('five roadmap phases',Array.isArray(manifest.phases)&&manifest.phases.length===5,String(manifest.phases?.length));
  check('four master semesters',Array.isArray(manifest.semesters)&&manifest.semesters.length===4,String(manifest.semesters?.length));
  check('offline-first policy',manifest.policy?.offlineFirst===true);
  check('master-ready contract',JSON.stringify(manifest.policy?.masterReady||[])===JSON.stringify(['understand','solve','build','retain']));
  check('support-on-demand exists',Array.isArray(manifest.supportOnDemand)&&manifest.supportOnDemand.length>0);
  check('NIR present all semesters',manifest.semesters.every(sem=>(sem.subjects||[]).some(subject=>/НИР|исследовательская работа/i.test(subject))),JSON.stringify(manifest.semesters.map(s=>s.semester)));
}

const uiScope=[read(manifestPath),read(roadmapDocPath),read(roadmapBridgePath),read(indexPath)].join('\n');
check('roadmap UI contains no comparison-school label',!/hutech/i.test(uiScope),'forbidden comparison label found in Roadmap V3/UI source');
check('roadmap UI displays 09.04.01/11',/09\.04\.01\/11/.test(read(indexPath))&&/09\.04\.01\/11/.test(read(roadmapBridgePath)));

const index=read(indexPath);
const requiredEntryAssets=[
  'assets/css/academic-roadmap-v3.css',
  'assets/css/offline-library.css',
  'assets/css/offline-subject-pack.css',
  'assets/js/platform/offline-content-library.js',
  'assets/js/platform/academic-roadmap-v3-bridge.js',
  'assets/js/platform/offline-library-ui.js',
  'assets/js/platform/offline-html-sandbox-guard.js',
  'assets/js/platform/offline-import-quota-guard.js',
  'assets/js/platform/offline-subject-pack-refcount-guard.js',
  'assets/js/platform/offline-subject-pack-manager.js'
];
for(const asset of requiredEntryAssets)check(`main entry wires ${asset}`,index.includes(asset));

const order=[
  'assets/js/platform/site-runtime.js',
  'assets/js/platform/offline-content-library.js',
  'assets/js/main.js',
  'assets/js/platform/academic-roadmap-v3-bridge.js',
  'assets/js/platform/site-routing-bridge.js',
  'assets/js/platform/offline-library-ui.js',
  'assets/js/platform/offline-html-sandbox-guard.js',
  'assets/js/platform/offline-import-quota-guard.js',
  'assets/js/platform/offline-subject-pack-refcount-guard.js',
  'assets/js/platform/offline-subject-pack-manager.js',
  'assets/js/planning-main.js'
];
let last=-1;
for(const asset of order){const at=index.indexOf(asset);check(`entry order ${asset}`,at>last,`index=${at}, previous=${last}`);if(at>=0)last=at;}

const library=read(libraryPath);
check('offline library uses IndexedDB',/indexedDB\.open\(/.test(library));
check('offline library supports file picker',/showOpenFilePicker/.test(library));
check('offline library supports directory picker',/showDirectoryPicker/.test(library));
check('offline library has directory fallback',/webkitdirectory/.test(library));
check('offline JSON safety limit',/MAX_JSON_BYTES/.test(library));
check('offline pack remove contract',/removePack/.test(library));

const guard=read(sandboxGuardPath);
check('local HTML capture guard',/captureGuard:true/.test(guard)&&/stopImmediatePropagation/.test(guard));
check('local HTML sandbox has empty sandbox permissions',guard.includes('sandbox=\"\"')||guard.includes('sandbox=""'),'sandbox attribute missing');
check('local HTML does not grant allow-scripts',!guard.includes('allow-scripts'));
check('local HTML object URL revoked',/revokeObjectURL/.test(guard));

const quotaGuard=read(quotaGuardPath);
check('local import quota preflight',/capacityCheck/.test(quotaGuard)&&/navigator|estimate/.test(quotaGuard));
check('local import reserves free space',/MIN_RESERVE=2\*1024\*1024/.test(quotaGuard));
check('partial local import rolls back',/await library\.removePack\(packId\)/.test(quotaGuard));
check('quota guard intercepts picker actions before legacy handler',/stopImmediatePropagation/.test(quotaGuard)&&/choose-directory/.test(quotaGuard)&&/choose-files/.test(quotaGuard));

const manager=read(packManagerPath);
check('subject pack uses explicit cache name',manager.includes("CACHE_NAME='bauman-offline-content-v1'"));
check('base pack per-resource limit 5 MB',/BASE_MAX_RESOURCE=5\*1024\*1024/.test(manager));
check('session pack explicit large limit 64 MB',/SESSION_MAX_RESOURCE=64\*1024\*1024/.test(manager));
check('subject pack probes actual browser resources',/performance\.getEntriesByType\('resource'\)/.test(manager));
check('subject pack caches only same-origin',/sameOrigin/.test(manager)&&/Chỉ cache tài nguyên same-origin/.test(manager));
check('subject pack stores metadata not whole state',/source:'service-worker-cache'/.test(manager)&&/metadata:\{mode,urls/.test(manager));

const refguard=read(refcountGuardPath);
check('shared pack reference guard exists',/referencedElsewhere/.test(refguard)&&/preservedShared/.test(refguard));
check('shared pack guard patches manager remove',/manager\.removePack=safeRemovePack/.test(refguard));

const config=read(configPath);
check('offline library feature enabled',/offlineLibrary:\s*true/.test(config));
check('local file library feature enabled',/localFileLibrary:\s*true/.test(config));
check('service worker remains gated OFF',/serviceWorkerCache:\s*false/.test(config));

const worker=read(workerPath);
check('roadmap manifest is shell cached',worker.includes("ROADMAP_MANIFEST='./assets/data/roadmap/iu5-090401-11-v3.json'"));
check('generic subject data remains excluded',/path\.includes\('\/data\/'\)/.test(worker)&&/path\.endsWith\('\.json'\)/.test(worker));
check('no subject academic JSON precache',!/["']\.\/subjects\/[^"']+\/data\/[^"']+\.json["']/.test(worker));
check('offline library shell asset cached',worker.includes("'./assets/js/platform/offline-content-library.js'"));
check('roadmap bridge shell asset cached',worker.includes("'./assets/js/platform/academic-roadmap-v3-bridge.js'"));
check('HTML sandbox guard shell asset cached',worker.includes("'./assets/js/platform/offline-html-sandbox-guard.js'"));
check('quota guard shell asset cached',worker.includes("'./assets/js/platform/offline-import-quota-guard.js'"));
check('subject pack manager shell asset cached',worker.includes("'./assets/js/platform/offline-subject-pack-manager.js'"));
check('subject pack refcount guard shell asset cached',worker.includes("'./assets/js/platform/offline-subject-pack-refcount-guard.js'"));
check('explicit content cache served before generic JSON exclusion',worker.indexOf('explicitOfflineMatch(request)')<worker.indexOf('if(!cacheEligible(url))'));
check('explicit content cache name matches manager',worker.includes("OFFLINE_CONTENT_CACHE='bauman-offline-content-v1'"));
check('shell install iterates every shell asset',/for\(const path of SHELL\)/.test(worker));
check('shell install validates each response before cache put',/if\(!response\.ok\)throw new Error\(`Shell fetch failed/.test(worker)&&/await cache\.put\(path,response\.clone\(\)\)/.test(worker));
check('failed shell install deletes incomplete new cache',/catch\(error\)[\s\S]*await caches\.delete\(CACHE_NAME\)[\s\S]*throw error/.test(worker));
check('old shell caches removed only in activate',worker.indexOf("names.filter((name)=>name.startsWith('bauman-shell-')")>worker.indexOf("self.addEventListener('activate'"));

const report={generatedAt:new Date().toISOString(),manifest:{id:manifest?.id||null,displayCode:manifest?.displayCode||null,department:manifest?.department||null},checks,failures};
fs.mkdirSync('docs/migration',{recursive:true});
fs.writeFileSync('docs/migration/L5_ROADMAP_OFFLINE_STATIC_REGRESSION.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(`L5 roadmap/offline static regression: ${checks.length} checks, ${failures.length} failure(s).`);
if(failures.length){console.error(failures.join('\n'));process.exit(2);}
console.log('L5 roadmap/offline static regression PASS.');
