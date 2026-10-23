import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync('assets/js/subjects-reference-v1.js','utf8');
const declarations=[...source.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(match=>match[1]);
const duplicates=[...new Set(declarations)].filter(name=>declarations.filter(other=>other===name).length>1);
assert.deepEqual(duplicates,[],'Subject renderer must never shadow old implementations with duplicate function declarations');

for(const artifact of [
  'var COURSE_REF=','var AI_ITEMS=','var DEADLINES=',
  'fallbackProgress:70','new Date(2025,2,1)',
  'Học kỳ 2, 2025','14/03/2025'
]){
  assert.ok(!source.includes(artifact),'Retired sample data/UI crept back into the live Subjects module: '+artifact);
}
for(const required of [
  'function truthProgress(id)',
  'function courseRows()',
  'return canonical.concat(readCustom()',
  'DEFAULT_NOTES.map',
  '!legacy.has(x.id)',
  'function readNotes()',
  'function editTeacher(key)',
  'function render()',
  "document.getElementById('page-subjects')",
  'data-truth-status',
  'LOCAL_HUB'
]){
  assert.ok(source.includes(required),'Preserved learner-data/renderer contract missing: '+required);
}
assert.equal((source.match(/function render\(\)/g)||[]).length,1,'One canonical Subjects renderer only');
assert.equal((source.match(/function courseCard\(c\)/g)||[]).length,1,'One canonical course-card implementation only');
console.log('HUB_SUBJECTS_DEBT_REGRESSION_PASS');
