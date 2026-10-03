import fs from 'node:fs';
import path from 'node:path';

const contract = JSON.parse(fs.readFileSync('control/application-management.contract.json','utf8'));
const routes = [];

for (const subclient of contract.subclients ?? []) {
  const contractRoot = subclient.sourcePath ? String(subclient.sourcePath).replace(/^\/+|\/+$/g,'') : null;
  const conventionalRoot = `subjects/${subclient.id}`;
  const root = contractRoot || conventionalRoot;
  const manifestPath = path.join(root,'subject-manifest.json');

  if (!fs.existsSync(manifestPath)) continue;
  const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const studyPlan = manifest.studyPlan;
  if (!studyPlan || studyPlan.version !== 1 || studyPlan.relation !== 'related') continue;
  if (!Array.isArray(studyPlan.courseIds) || studyPlan.courseIds.length === 0) continue;

  const runtimePath = String(studyPlan.runtimePath || root)
    .replace(/^\/+|\/+$/g,'');
  const entryValue = String(manifest.entry || 'index.html').replace(/^\/+/, '');
  const entryPath = entryValue.includes('/') ? entryValue : path.join(runtimePath, entryValue);
  if (!fs.existsSync(entryPath)) {
    throw new Error(`Study-plan runtime entry missing for ${subclient.id}: ${entryPath}`);
  }

  routes.push({
    id: subclient.id,
    runtimePath: runtimePath + '/',
    courseIds: studyPlan.courseIds,
  });
}

routes.sort((a,b)=>a.id.localeCompare(b.id));
const seen = new Set();
for (const item of routes) {
  if (seen.has(item.runtimePath)) throw new Error(`Duplicate study-plan runtime path: ${item.runtimePath}`);
  seen.add(item.runtimePath);
  process.stdout.write(item.runtimePath + '\n');
}
