'use strict';
const fs=require('fs');
const read=p=>fs.readFileSync(p,'utf8');
const main=read('assets/js/main.js');
const runtime=read('assets/js/deep-study-journal-v1.js');
const course=read('assets/js/academic-course-runtime.js');
const index=read('index.html');
const css=read('assets/css/deep-study-journal-v1.css');
const browser=read('tests/deep-study-journal-browser.mjs');
const previewPrep=read('scripts/prepare-cloudflare-preview.mjs');
const sitePrep=read('scripts/prepare-chatgpt-site.mjs');
const errors=[];const assert=(c,m)=>{if(!c)errors.push(m)};

for(const token of ["deepStudyJournal:{version:1,entries:[]}","out.deepStudyJournal={version:1,entries:"] )assert(main.includes(token),`Hub learner-state schema missing ${token}`);
assert(main.includes("JSON.stringify({state,users:readUsers()}"),'Backup must continue serializing whole learner state');
assert(main.includes("state=normalizeState(data.state)"),'Restore must continue normalizing imported learner state');

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

if(errors.length){console.error(`DEEP_STUDY_JOURNAL_V1_FAIL (${errors.length})`);for(const e of errors)console.error('- '+e);process.exit(1)}
console.log('DEEP_STUDY_JOURNAL_V1_VALID');
console.log(JSON.stringify({types:4,storage:'hub-learner-state',backupRestore:true,authoritativeMasteryEvidence:false,masteryMutation:false,diagnosticMutation:false,schedulerMutation:false,progressMutation:false,sidebarAdded:false},null,2));
