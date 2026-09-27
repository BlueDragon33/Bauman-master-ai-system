import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read=p=>fs.readFileSync(p,'utf8');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  const p=path.join(dir,e.name);
  return e.isDirectory()?walk(p):[p.replaceAll('\\','/')];
});

const subjectIds=['ai','foundation','math','programming','research','russian','signal','systems'];
const platformRequired=[
  'tokens.css','foundation.css','components.css','layouts.css','patterns.css','compat.css','index.css',
  'runtime.js','app-shell.css','subject-adapter.css','subject-adapter.js','editor.css',
  'resource-viewer.css','resource-viewer.js','micro-app.css','micro-app.js',
  'data.css','ai.css','import-center.css','import-center.js','performance.js','README.md'
];
for(const f of platformRequired) assert.ok(fs.existsSync('platform/ui/'+f),'missing platform UI file: '+f);

const index=read('index.html');
assert.ok(index.includes('platform/ui/index.css?v=bfis-e10'),'Master Hub does not load BFIS');
assert.ok(index.lastIndexOf('platform/ui/index.css?v=bfis-e10')>index.lastIndexOf('assets/css/hub-readable-typography-v1.css'),'BFIS CSS must be final canonical layer');
assert.ok(index.includes('platform/ui/runtime.js?v=bfis-e10'),'BFIS runtime missing from Hub');
assert.ok(index.includes('platform/ui/resource-viewer.js?v=bfis-e10'),'ResourceViewer runtime missing from Hub');
assert.ok(index.includes('platform/ui/import-center.js?v=bfis-e10'),'Import Center runtime missing from Hub');
assert.ok(index.includes('platform/ui/performance.js?v=bfis-e10'),'performance runtime missing from Hub');
assert.ok(!index.includes('\\n  <link'),'literal newline text leaked into HTML');

for(const id of subjectIds){
  const subject=read('subjects/'+id+'/index.html');
  assert.ok(subject.includes('../../platform/ui/index.css?v=bfis-e10'),id+' subject missing shared CSS');
  assert.ok(subject.includes('data-bui-subject="'+id+'"'),id+' subject body missing contract');
  assert.ok(subject.includes('../../platform/ui/runtime.js?v=bfis-e10'),id+' subject missing runtime');
  assert.ok(subject.includes('../../platform/ui/subject-adapter.js?v=bfis-e10'),id+' subject missing shared adapter');
  assert.ok(subject.includes('../../platform/ui/resource-viewer.js?v=bfis-e10'),id+' subject missing resource viewer');

  const editor=read('subjects/'+id+'/editor.html');
  assert.ok(editor.includes('../../platform/ui/index.css?v=bfis-e10'),id+' editor missing BFIS');
  assert.ok(editor.includes('data-bui-editor="'+id+'"'),id+' editor missing BFIS editor contract');
  assert.ok(!/<style[\s>]/i.test(editor),id+' editor still contains inline style patchwork');
}

const simulationFiles=walk('subjects').filter(p=>/\/simulations\/.*\.html$/i.test(p));
assert.equal(simulationFiles.length,29,'unexpected standalone simulation HTML count; update BFIS coverage intentionally');
for(const p of simulationFiles){
  const html=read(p);
  assert.ok(html.includes('../../../platform/ui/index.css?v=bfis-e10'),p+' missing BFIS');
  assert.ok(html.includes('../../../platform/ui/micro-app.css?v=bfis-e10'),p+' missing micro-app shell CSS');
  assert.ok(html.includes('../../../platform/ui/runtime.js?v=bfis-e10'),p+' missing BFIS runtime');
  assert.ok(html.includes('../../../platform/ui/micro-app.js?v=bfis-e10'),p+' missing micro-app shell runtime');
  assert.ok(html.includes('data-bui-micro-app="1"'),p+' missing micro-app contract');
}

const tokens=read('platform/ui/tokens.css');
for(const token of [
  '--bui-type-body','--bui-space-4','--bui-radius-md','--bui-canvas','--bui-surface',
  '--bui-primary','--bui-on-primary','--bui-success','--bui-warning','--bui-danger',
  '--bui-shadow-raised','--bui-motion-base','--bui-z-modal','--bui-touch'
]) assert.ok(tokens.includes(token),'missing design token: '+token);
assert.ok(tokens.includes('body[data-theme="night"]'),'dark token scale missing');
assert.ok(tokens.includes('body[data-theme="paper"]'),'paper token scale missing');
assert.ok(tokens.includes('body[data-theme="mint"]'),'mint token scale missing');

const runtime=read('platform/ui/runtime.js');
for(const marker of [
  'BaumanUI','commands:{','search:{','slots:{','icons:{','installAccessibility',
  'installPrimaryMobileNav','e.ctrlKey||e.metaKey','dataSearch','bauman-ui-ready'
]) assert.ok(runtime.includes(marker),'runtime capability missing: '+marker);

const subjectAdapter=read('platform/ui/subject-adapter.js');
assert.ok(subjectAdapter.includes('installMobileNav'),'subject mobile navigation missing');
assert.ok(subjectAdapter.includes('normalizeNav'),'subject icon normalization missing');

const coreNoPatchwork=[
  'components.css','layouts.css','patterns.css','app-shell.css','editor.css','micro-app.css',
  'resource-viewer.css','ai.css','data.css','import-center.css','compat.css','subject-adapter.css'
];
for(const f of coreNoPatchwork){
  const css=read('platform/ui/'+f);
  assert.equal((css.match(/!important/g)||[]).length,0,f+' introduced !important patchwork');
  if(f!=='app-shell.css'&&f!=='subject-adapter.css'&&f!=='ai.css') assert.equal((css.match(/#[0-9a-fA-F]{3,8}\b/g)||[]).length,0,f+' hard-codes visual color outside tokens');
}

const foundation=read('platform/ui/foundation.css');
const accessibilityImportant=(foundation.match(/!important/g)||[]).length;
assert.ok(accessibilityImportant<=14,'foundation !important budget exceeded; only accessibility utilities may use it');

const appShell=read('platform/ui/app-shell.css');
assert.ok(appShell.includes('data-bui-shell="1"'),'canonical app shell contract missing');
assert.ok(appShell.includes('@media(max-width:820px)'),'mobile shell architecture missing');
assert.ok(appShell.includes('data-bui-focus="1"'),'Hub Focus Mode missing');

const resource=read('platform/ui/resource-viewer.js');
for(const type of ['image','video','audio','pdf','url','html','simulation']) assert.ok(resource.includes(type),'ResourceViewer type missing: '+type);
assert.ok(resource.includes('register(type,renderer)'),'ResourceViewer adapter contract missing');

const importer=read('platform/ui/import-center.js');
for(const step of ['Upload','Detect','Classify','Preview','Validate','Publish']) assert.ok(importer.includes("'"+step+"'")||importer.includes('"'+step+'"'),'Import Center step missing: '+step);

const legacy=read('assets/js/hub-reference-precision-v5.js');
assert.ok(legacy.includes("dataset.buiShell='1'"),'legacy shell does not hand off to BFIS');
assert.ok(legacy.includes("delete document.body.dataset.hubReferenceV5"),'legacy precision UI remains authoritative');

const doc=read('docs/BAUMAN_FUTURE_INTERFACE_SYSTEM.md');
assert.ok(doc.includes('UI-E28'),'BFIS roadmap documentation incomplete');
assert.ok(doc.includes('Legacy debt policy'),'legacy migration policy missing');

console.log(JSON.stringify({
  result:'BFIS_STATIC_PASS',
  subjects:subjectIds.length,
  simulations:simulationFiles.length,
  platformFiles:platformRequired.length,
  accessibilityImportant
},null,2));
