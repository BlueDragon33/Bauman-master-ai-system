'use strict';

const fs=require('fs');
const path=require('path');

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
const indexPath='index.html';
const configPath='assets/js/platform/runtime-config.js';
const workerPath='service-worker.js';

for(const file of [manifestPath,roadmapDocPath,blueprintPath,libraryPath,roadmapBridgePath,offlineUiPath,sandboxGuardPath,indexPath,configPath,workerPath])requireFile(file);

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
  'assets/js/platform/offline-content-library.js',
  'assets/js/platform/academic-roadmap-v3-bridge.js',
  'assets/js/platform/offline-library-ui.js',
  'assets/js/platform/offline-html-sandbox-guard.js'
];
for(const asset of requiredEntryAssets)check(`main entry wires ${asset}`,index.includes(asset));

const library=read(libraryPath);
check('offline library uses IndexedDB',/indexedDB\.open\(/.test(library));
check('offline library supports file picker',/showOpenFilePicker/.test(library));
check('offline library supports directory picker',/showDirectoryPicker/.test(library));
check('offline library has directory fallback',/webkitdirectory/.test(library));
check('offline JSON safety limit',/MAX_JSON_BYTES/.test(library));
check('offline pack remove contract',/removePack/.test(library));

const guard=read(sandboxGuardPath);
check('local HTML capture guard',/captureGuard:true/.test(guard)&&/stopImmediatePropagation/.test(guard));
check('local HTML sandbox has empty sandbox permissions',/sandbox=\\?"\\?"/.test(guard)||/sandbox=\"\"/.test(guard),'sandbox attribute missing');
check('local HTML does not grant allow-scripts',!(/allow-scripts/i.test(guard)));
check('local HTML object URL revoked',/revokeObjectURL/.test(guard));

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

const report={generatedAt:new Date().toISOString(),manifest:{id:manifest?.id||null,displayCode:manifest?.displayCode||null,department:manifest?.department||null},checks,failures};
fs.mkdirSync('docs/migration',{recursive:true});
fs.writeFileSync('docs/migration/L5_ROADMAP_OFFLINE_STATIC_REGRESSION.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(`L5 roadmap/offline static regression: ${checks.length} checks, ${failures.length} failure(s).`);
if(failures.length){console.error(failures.join('\n'));process.exit(2);}
console.log('L5 roadmap/offline static regression PASS.');
