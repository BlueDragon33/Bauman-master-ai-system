'use strict';
const fs=require('fs');
const vm=require('node:vm');
const check=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const main=read('assets/js/main.js');
const runtime=read('assets/js/deep-study-journal-v1.js');
const course=read('assets/js/academic-course-runtime.js');
const index=read('index.html');
const css=read('assets/css/deep-study-journal-v1.css');
const browser=read('tests/deep-study-journal-browser.mjs');
const previewPrep=read('scripts/prepare-cloudflare-preview.mjs');
const sitePrep=read('scripts/prepare-chatgpt-site.mjs');
const personalStore=read('assets/js/platform/hub-personal-store.js');
const errors=[];const assert=(c,m)=>{if(!c)errors.push(m)};

for(const token of ["deepStudyJournal:{version:1,entries:[]}","out.deepStudyJournal={version:1,entries:"] )assert(main.includes(token),`Hub learner-state schema missing ${token}`);

for(const token of [
  'DEEP_STUDY_JOURNAL_V1','Feynman checkpoint','Error Notebook','Closed-AI session','Oral-defense note',
  'authoritativeMasteryEvidence:false','masteryMutation:false','diagnosticMutation:false',
  'prerequisiteMutation:false','schedulerMutation:false','progressMutation:false',
  "storage:'hub-learner-state'","backupRestore:'inherited-from-hub-state'",
  'noSeparateStorage:true','noRoadmapMasteryWrites:true'
])assert(runtime.includes(token),`DSJ boundary/runtime missing ${token}`);

assert(!/localStorage\.(?:setItem|removeItem)/.test(runtime),'DSJ must not own a separate localStorage store');
assert(!/\.progress\s*=|progress\[[^\]]+\]\s*=/.test(runtime),'DSJ must not write Hub progress');
assert(!/schedule\.entries\s*\[[^\]]+\]\s*=/.test(runtime),'DSJ must not write scheduler entries');
assert(!/recordDiagnostic\s*\(|recordEvidence\s*\(|recordResult\s*\(/.test(runtime),'DSJ must not call academic evidence writers');
assert(!/mastery\s*=|mastery\[[^\]]+\]\s*=/.test(runtime),'DSJ must not write mastery');

assert(course.includes('data-dsj-open')&&course.includes('openDeepStudyJournalV1()'),'Progress surface must expose DSJ action');
assert(index.includes('assets/js/deep-study-journal-v1.js')&&index.includes('assets/css/deep-study-journal-v1.css'),'Hub must load DSJ assets');
assert(!index.includes('data-page="journal"'),'DSJ must not add a sidebar/page navigation item');
assert(css.includes('@media(max-width:800px)')&&css.includes('@media(max-width:480px)'),'DSJ responsive CSS gates missing');
assert(browser.includes('__course14bPatched===true'),'DSJ browser acceptance must wait for the async Progress integration readiness marker');
for(const prep of [previewPrep,sitePrep])for(const resource of ['assets/css/deep-study-journal-v1.css','assets/js/deep-study-journal-v1.js'])assert(prep.includes(resource),`DSJ packaging invariant missing ${resource}`);

async function validateBackupContract(){
  // Execute the actual Hub functions and facade APIs, with only the durable
  // provider replaced. IndexedDB transactions are covered by browser acceptance.
  const copy=value=>JSON.parse(JSON.stringify(value));
  const forbidden=()=>{throw new Error('DSJ accessed a separate store or academic evidence writer')};
  const context=vm.createContext({structuredClone,Blob,DOMException,atob,btoa,
    CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},
    document:{querySelector:()=>null,createElement:()=>({click(){}})},
    URL:{createObjectURL:()=> 'blob:dsj-contract',revokeObjectURL(){}},
    location:{reload(){}},toast(){},closeProfileMenu(){},
    localStorage:new Proxy({},{get:forbidden}),indexedDB:new Proxy({},{get:forbidden}),
    sessionStorage:new Proxy({},{get:forbidden}),recordDiagnostic:forbidden,recordEvidence:forbidden,recordResult:forbidden,
    DATA:{subjects:[{id:'russian',name:'Russian'}]},FINAL_TARGET_QUESTIONS:100,DEFAULT_TARGET_SCORE:80});
  context.window=context;context.dispatchEvent=()=>{};
  const schemaStart=main.indexOf('function defaultState('),schemaEnd=main.indexOf('function readState(',schemaStart);
  check.ok(schemaStart>=0&&schemaEnd>schemaStart,'Hub canonical schema/normalizer must be available');
  vm.runInContext(main.slice(schemaStart,schemaEnd),context);
  context.state=context.defaultState();
  check.deepEqual(copy(context.state.deepStudyJournal),{version:1,entries:[]},'DSJ must belong to default learner state');
  context.state.progress={russian:0};context.state.schedule.entries={keep:{source:'learner'}};
  context.state.mastery={keep:0};context.state.diagnostic={keep:0};context.state.evidence=[{keep:true}];
  context.state.academic={gateDiagnostics:{keep:0},evidence:[{keep:true}]};
  const protectedState=copy(context.state);delete protectedState.deepStudyJournal;
  let saves=0;context.save=async()=>{saves++};
  vm.runInContext(runtime,context);
  const journal=context.BAUMAN_DEEP_STUDY_JOURNAL_V1;
  const entry=journal.add({type:'error',title:'Reflection',body:'Check assumptions'});
  journal.update(entry.id,{body:'Check assumptions before solving'});
  const removed=journal.add({type:'feynman',title:'Temporary'});journal.remove(removed.id);
  check.ok(saves>=4,'DSJ mutations must use the canonical Hub save boundary');
  const actualState=copy(context.state);delete actualState.deepStudyJournal;
  check.deepEqual(actualState,protectedState,'DSJ must not mutate progress, mastery, schedule or academic diagnostic/evidence');
  check.equal(context.state.deepStudyJournal.entries.length,1,'DSJ canonical entry lifecycle failed');

  // Unwrap the closure only in this isolated VM so the test can substitute the
  // persistence adapter without replacing export/import/commit/normalization.
  check.ok(personalStore.includes('(()=>{')&&personalStore.trim().endsWith('})();'),'Personal facade closure is unavailable');
  vm.runInContext(personalStore.slice(personalStore.indexOf('(()=>{')+6,personalStore.lastIndexOf('})();')),context);
  const key='bauman_main_all_phases_subjects_v1';
  context.fixture=copy(context.state);
  context.fixture.nested={passwordHash:'must-not-export',passwordSalt:'must-not-export',passwordIterations:1,password:'must-not-export'};
  context.writes=[];
  vm.runInContext(`ready=true;scopeId='local@bauman.dev';profile={email:scopeId,name:'Learner',role:'admin'};
    cache={[MAIN]:fixture};committedCache=structuredClone(cache);
    accounts=[{email:scopeId,passwordHash:'must-not-export',passwordSalt:'must-not-export',passwordIterations:1,password:'must-not-export'}];
    writeAtomic=async(scope,values)=>{writes.push(structuredClone(values))};`,context);
  const facade=context.BAUMAN_HUB_PERSONAL_STORE;
  let exports=0,imports=0,normalizations=0;
  const normalize=context.normalizeState;
  context.normalizeState=raw=>{normalizations++;return normalize(raw)};
  context.BAUMAN_HUB_PERSONAL_STORE={...facade,
    exportBundle:async()=>{exports++;return facade.exportBundle()},
    importBundle:async(bundle,options)=>{
      imports++;check.equal(options?.normalizeState,context.normalizeState,'Hub restore must supply canonical normalization');
      return facade.importBundle(bundle,options);
    }};
  const backupStart=main.search(/async\s+exportBackup\s*\(/),backupEnd=main.indexOf('\n};',backupStart);
  check.ok(backupStart>=0&&backupEnd>backupStart,'Hub backup/restore actions must be available');
  vm.runInContext('globalThis.backupActions={'+main.slice(backupStart,backupEnd)+'};',context);
  const bundle=await context.backupActions.exportBackup();
  check.equal(exports,1,'Hub backup must call the personal facade exportBundle API');
  check.equal(bundle.schema,'bauman-hub-personal-backup');check.equal(bundle.version,facade.schemaVersion);
  check.deepEqual(copy(bundle.records[key].deepStudyJournal),copy(context.state.deepStudyJournal),'Versioned backup must contain canonical DSJ entries');
  const credentialKeys=value=>value&&typeof value==='object'?Object.entries(value).flatMap(([name,item])=>[/^password(?:Hash|Salt|Iterations)?$/i.test(name)?name:null,...credentialKeys(item)].filter(Boolean)):[];
  check.deepEqual(credentialKeys(bundle),[],'Ordinary backup must exclude credential verifiers recursively');
  check.ok(!JSON.stringify(bundle).includes('must-not-export'),'Ordinary backup leaked credential values');
  check.ok(!Object.hasOwn(bundle,'users'),'Ordinary backup must not export account records');
  bundle.records[key].deepStudyJournal.version=99;
  bundle.records[key].deepStudyJournal.entries[0].type='invalid';
  bundle.records[key].deepStudyJournal.entries[0].title='x'.repeat(200);
  bundle.records[key].deepStudyJournal.entries[0].privateField='discard';
  bundle.records[key].deepStudyJournal.entries.push(null);
  await context.backupActions.importBackup({text:async()=>JSON.stringify(bundle)});
  check.equal(imports,1,'Hub restore must call the personal facade importBundle API');
  check.equal(normalizations,1,'Restore must normalize before committing canonical state');
  check.equal(context.writes.length,1,'Restore must commit the normalized canonical state');
  const restored=copy(facade.get(key));
  check.deepEqual(copy(context.writes[0][key]),restored,'Durable and runtime projections must agree');
  check.equal(restored.deepStudyJournal.version,1);check.equal(restored.deepStudyJournal.entries.length,1);
  check.equal(restored.deepStudyJournal.entries[0].type,'feynman');check.equal(restored.deepStudyJournal.entries[0].title.length,160);
  check.ok(!Object.hasOwn(restored.deepStudyJournal.entries[0],'privateField'),'Restore bypassed canonical DSJ normalization');
  check.deepEqual(credentialKeys(restored),[],'Restore must not reintroduce credential verifier fields');
  context.normalizeState=()=>{throw new Error('Normalization rejected fixture')};
  await context.backupActions.importBackup({text:async()=>JSON.stringify(bundle)});
  check.equal(context.writes.length,1,'Rejected normalization must not commit');
  check.deepEqual(copy(facade.get(key)),restored,'Rejected normalization must preserve canonical runtime state');
  context.normalizeState=normalize;
  await context.backupActions.importBackup({text:async()=>JSON.stringify({state:restored,users:[{passwordHash:'must-not-export'}]})});
  check.equal(context.writes.length,2,'Legacy learner-state restore must remain supported');
  check.deepEqual(copy(facade.get(key).deepStudyJournal),restored.deepStudyJournal,'Legacy restore must preserve DSJ');
  check.equal(facade.getAccounts()[0].passwordHash,'must-not-export','Learner restore must preserve separate credential authority');
}

validateBackupContract().catch(error=>errors.push('DSJ backup/restore contract: '+error.message)).then(()=>{
if(errors.length){console.error(`DEEP_STUDY_JOURNAL_V1_FAIL (${errors.length})`);for(const e of errors)console.error('- '+e);process.exit(1)}
console.log('DEEP_STUDY_JOURNAL_V1_VALID');
console.log(JSON.stringify({types:4,storage:'hub-learner-state',backupRestore:true,versionedCanonicalDSJ:true,credentialRedaction:true,normalizationBeforeCommit:true,rejectedNormalizationPreservesState:true,legacyRestore:true,authoritativeMasteryEvidence:false,masteryMutation:false,diagnosticMutation:false,schedulerMutation:false,progressMutation:false,sidebarAdded:false},null,2));
});
