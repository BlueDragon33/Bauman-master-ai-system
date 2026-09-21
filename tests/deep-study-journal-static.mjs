import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('assets/js/main.js','utf8');
const journal=fs.readFileSync('assets/js/deep-study-journal-v1.js','utf8');
const index=fs.readFileSync('index.html','utf8');

assert.match(main,/deepStudyJournal:\{version:1,feynman:\[\],errors:\[\],closedAi:\[\],oralDefense:\[\]\}/);
assert.match(main,/journal\.feynman\.slice\(-200\)/);
assert.match(main,/journal\.errors\.slice\(-500\)/);
assert.match(main,/BAUMAN_DEEP_STUDY_JOURNAL\?\.open/);

assert.match(index,/deep-study-journal-v1\.css\?v=1/);
assert.match(index,/deep-study-journal-v1\.js\?v=1/);
assert.doesNotMatch(index,/data-page="deep-study-journal"/);

assert.match(journal,/learnerReflectionOnly:true/);
assert.match(journal,/authoritativeMasteryWrites:false/);
assert.match(journal,/diagnosticWrites:false/);
assert.match(journal,/prerequisiteWrites:false/);
assert.match(journal,/priorityWrites:false/);
assert.match(journal,/schedulerWrites:false/);
assert.match(journal,/subjectProgressWrites:false/);
assert.match(journal,/s\.deepStudyJournal=normalized/);
assert.doesNotMatch(journal,/state\.progress\s*=/);
assert.doesNotMatch(journal,/state\.schedule\s*=/);
assert.doesNotMatch(journal,/state\.reviewQueue\s*=/);
assert.doesNotMatch(journal,/state\.subjectCapabilities\s*=/);
assert.doesNotMatch(journal,/BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1/);

console.log('Deep Study Journal static boundary PASS');
