import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const coverage = JSON.parse(fs.readFileSync('control/study-plan-coverage.json','utf8'));
const contract = JSON.parse(fs.readFileSync('control/application-management.contract.json','utf8'));

const mappings = [];
for (const subclient of contract.subclients ?? []) {
  const manifestPath = path.join('subjects', subclient.id, 'subject-manifest.json');
  if (!fs.existsSync(manifestPath)) continue;
  const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const studyPlan = manifest.studyPlan;
  if (!studyPlan) continue;
  if (studyPlan.version !== coverage.policy.requireStudyPlanVersion) continue;
  if (studyPlan.relation !== coverage.policy.requireRelation) continue;
  if (!Array.isArray(studyPlan.courseIds)) continue;
  for (const courseId of studyPlan.courseIds) {
    mappings.push({courseId, subjectId: subclient.id, manifestPath});
  }
}

const expected = new Set(coverage.expectedCourseIds);
const byCourse = new Map();
for (const mapping of mappings) {
  const list = byCourse.get(mapping.courseId) ?? [];
  list.push(mapping);
  byCourse.set(mapping.courseId, list);
}

const missing = [...expected].filter(id => !byCourse.has(id));
const duplicates = [...expected]
  .map(id => ({id, mappings: byCourse.get(id) ?? []}))
  .filter(item => item.mappings.length > 1);
const unknown = mappings.filter(item => !expected.has(item.courseId));

assert.deepEqual(missing, [], 'Missing study-plan mappings: ' + missing.join(', '));
if (coverage.policy.requireExactlyOnce) {
  assert.deepEqual(
    duplicates.map(item => ({id:item.id, subjects:item.mappings.map(m=>m.subjectId)})),
    [],
    'Duplicate study-plan mappings detected'
  );
}
if (!coverage.policy.allowUnknownExtraIds) {
  assert.deepEqual(
    unknown.map(item => ({courseId:item.courseId, subjectId:item.subjectId})),
    [],
    'Unknown study-plan course IDs detected in manifests'
  );
}

const bySemester = {};
for (const [semester, ids] of Object.entries(coverage.semesterGroups ?? {})) {
  const covered = ids.filter(id => byCourse.has(id)).length;
  bySemester[semester] = {covered, total: ids.length};
}

console.log(JSON.stringify({
  gate:'STUDY_PLAN_COVERAGE',
  status:'PASS',
  covered:[...expected].filter(id => byCourse.has(id)).length,
  total:expected.size,
  modules:new Set(mappings.map(m=>m.subjectId)).size,
  bySemester
},null,2));
