import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const contract = JSON.parse(fs.readFileSync('control/application-management.contract.json','utf8'));
const coverage = JSON.parse(fs.readFileSync('control/study-plan-coverage.json','utf8'));
const expected = new Set(coverage.expectedCourseIds ?? []);

const mapped = [];
const integrity = [];

for (const subclient of contract.subclients ?? []) {
  if (!subclient.sourcePath) continue;
  const root = subclient.sourcePath;
  const manifestPath = path.join(root,'subject-manifest.json');
  assert.ok(fs.existsSync(manifestPath), `Missing manifest for subclient ${subclient.id}: ${manifestPath}`);

  const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  assert.equal(manifest.id, subclient.id, `Manifest id mismatch for ${subclient.id}`);

  const resolveDeclaredPath = (declared, fallback) => {
    const value = String(declared || fallback).replace(/^[/]+/, '');
    if (value.includes('/')) return value;
    return path.join(root, value);
  };

  const indexPath = resolveDeclaredPath(manifest.entry, 'index.html');
  assert.ok(fs.existsSync(indexPath), `Missing runtime entry for ${subclient.id}: ${indexPath}`);

  if (manifest.editor) {
    const editorPath = resolveDeclaredPath(manifest.editor, 'editor.html');
    assert.ok(fs.existsSync(editorPath), `Missing editor for ${subclient.id}: ${editorPath}`);
  }

  const studyPlan = manifest.studyPlan;
  if (!studyPlan) continue;
  assert.equal(studyPlan.version, coverage.policy.requireStudyPlanVersion, `Unexpected studyPlan version for ${subclient.id}`);
  assert.equal(studyPlan.relation, coverage.policy.requireRelation, `Unexpected studyPlan relation for ${subclient.id}`);
  assert.ok(Array.isArray(studyPlan.courseIds) && studyPlan.courseIds.length > 0, `Empty courseIds for ${subclient.id}`);

  const normalizedSource = String(root).replace(/^\/+|\/+$/g,'');
  const normalizedRuntime = String(studyPlan.runtimePath || '').replace(/^\/+|\/+$/g,'');
  assert.equal(normalizedRuntime, normalizedSource, `runtimePath/sourcePath mismatch for ${subclient.id}`);

  const localIds = new Set();
  for (const courseId of studyPlan.courseIds) {
    assert.equal(typeof courseId,'string', `Non-string courseId in ${subclient.id}`);
    assert.ok(courseId.length > 0, `Empty courseId in ${subclient.id}`);
    assert.ok(!localIds.has(courseId), `Duplicate courseId ${courseId} inside ${subclient.id}`);
    localIds.add(courseId);
    mapped.push({courseId,subjectId:subclient.id});
  }

  integrity.push({
    id: subclient.id,
    sourcePath: normalizedSource,
    courseIds: [...localIds],
    entry: manifest.entry || 'index.html',
    editor: manifest.editor || null,
  });
}

const byCourse = new Map();
for (const item of mapped) {
  const list = byCourse.get(item.courseId) ?? [];
  list.push(item.subjectId);
  byCourse.set(item.courseId,list);
}

const missing = [...expected].filter(id => !byCourse.has(id));
const duplicate = [...expected]
  .map(id => ({id,subjects:byCourse.get(id) ?? []}))
  .filter(item => item.subjects.length !== 1);
const unknown = [...byCourse.keys()].filter(id => !expected.has(id));

assert.deepEqual(missing, [], 'Missing mapped runtime modules: ' + missing.join(', '));
assert.deepEqual(duplicate, [], 'Study-plan IDs must map exactly once: ' + JSON.stringify(duplicate));
assert.deepEqual(unknown, [], 'Unknown study-plan IDs in manifests: ' + unknown.join(', '));

console.log(JSON.stringify({
  gate:'STUDY_PLAN_RUNTIME_INTEGRITY',
  status:'PASS',
  mappedCourses:mapped.length,
  expectedCourses:expected.size,
  mappedSubclients:integrity.length,
  integrity,
},null,2));
