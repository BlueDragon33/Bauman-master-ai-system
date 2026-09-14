import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SUBJECTS=['ai','foundation','math','programming','research','russian','signal','systems'];
const SIMPLE_SUBJECTS=['ai','foundation','research','signal','systems'];
const failures=[];
const checks=[];
const check=(condition,message)=>{if(condition)checks.push(message);else failures.push(message)};
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8');
const exists=relative=>fs.existsSync(path.join(ROOT,relative));
const gitBlobSha1=relative=>{const body=Buffer.from(fs.readFileSync(path.join(ROOT,relative),'utf8').replaceAll('\r\n','\n'));return crypto.createHash('sha1').update(`blob ${body.length}\0`).update(body).digest('hex')};

function evaluateWindowScript(relative){
  const sandbox={window:{},console:{log(){},warn(){},error(){}}};
  vm.runInNewContext(read(relative),sandbox,{filename:relative,timeout:5000});
  return sandbox.window;
}

function manifestPath(subject,value){
  const normalized=String(value||'').replaceAll('\\','/').replace(/^\.\//,'');
  return normalized.startsWith('subjects/')?normalized:`subjects/${subject}/${normalized}`;
}

function validateEntryAssets(relative){
  const html=read(relative);
  const base=path.posix.dirname(relative.replaceAll('\\','/'));
  const refs=[...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi)].map(match=>match[1]);
  for(const raw of refs){
    if(/^(?:https?:|data:|mailto:|tel:|#)/i.test(raw))continue;
    if(/^javascript:/i.test(raw)){failures.push(`${relative}: unsafe javascript URL`);continue}
    const clean=raw.split(/[?#]/,1)[0];
    if(!clean)continue;
    const resolved=clean.startsWith('/')?clean.slice(1):path.posix.normalize(path.posix.join(base,clean));
    check(!resolved.startsWith('../')&&exists(resolved),`${relative}: local asset exists (${raw})`);
  }
}

const dataWindow=evaluateWindowScript('assets/js/data.js');
const hubSubjectIds=(dataWindow.BAUMAN_DATA?.subjects||[]).map(subject=>subject.id).sort();
assert.equal(JSON.stringify(hubSubjectIds),JSON.stringify([...SUBJECTS].sort()),'Hub subject registry must contain the eight canonical subjects exactly once');
checks.push('Hub subject registry contains eight canonical subjects');

validateEntryAssets('index.html');
for(const subject of SUBJECTS){
  const jsonPath=`subjects/${subject}/subject-manifest.json`;
  const jsPath=`subjects/${subject}/subject-manifest.js`;
  check(exists(jsonPath),`${subject}: JSON manifest exists`);
  check(exists(jsPath),`${subject}: JavaScript manifest exists`);
  if(!exists(jsonPath)||!exists(jsPath))continue;
  const manifest=JSON.parse(read(jsonPath));
  check(manifest.id===subject,`${subject}: JSON manifest identity matches directory`);
  const entry=manifestPath(subject,manifest.entry||'index.html');
  const editor=manifestPath(subject,manifest.editor||'editor.html');
  check(exists(entry),`${subject}: entry point exists`);
  check(exists(editor),`${subject}: editor point exists`);
  if(exists(entry))validateEntryAssets(entry);
  if(exists(editor))validateEntryAssets(editor);
  const jsWindow=evaluateWindowScript(jsPath);
  const jsManifest=jsWindow.SUBJECT_CONFIG||jsWindow.SUBJECT_MANIFEST||jsWindow.BAUMAN_SUBJECT_MANIFEST;
  check(jsManifest?.id===subject,`${subject}: JavaScript manifest identity matches directory`);
  if(Array.isArray(manifest.data)){
    for(const file of manifest.data){const name=/\.json$/i.test(file)?file:`${file}.json`;check(exists(`subjects/${subject}/data/${name}`),`${subject}: declared data file exists (${file})`)}
  }
}

const main=read('assets/js/main.js');
const planning=read('assets/js/planning-main.js');
const hostBridge=read('subjects/shared/host-bridge.js');
check(!main.includes('dinhnam3391@gmail.com')&&!main.includes("const ADMIN_PASS"),'Hub ships no default administrator credential');
check(!read('index.html').includes('dinhnam3391@gmail.com'),'Login form contains no prefilled account');
check(main.includes("name:'PBKDF2'")&&main.includes("hash:'SHA-256'")&&main.includes('PASSWORD_ITERATIONS=120000'),'Local profile passwords use salted PBKDF2-SHA-256 records');
check(main.includes('event.source!==frame.contentWindow')&&main.includes('event.origin===url.origin'),'Hub validates subject window and origin');
check(!main.includes("postMessage(task,'*')")&&!planning.includes("postMessage(task,'*')"),'Hub does not use wildcard task messaging');
check(hostBridge.includes('event.source===window.parent')&&hostBridge.includes('event.origin===hostOrigin'),'Subject bridge validates parent window and origin');
check(hostBridge.includes("type:'BAUMAN_SUBJECT_PROGRESS'")&&hostBridge.includes("type:'BAUMAN_SUBJECT_READY'"),'Subject bridge emits canonical ready/progress messages');
check(main.includes("'BAUMAN_CHILD_READY'")&&main.includes("'SUBJECT_FEEDBACK'"),'Hub keeps explicit legacy alias compatibility');
for(const subject of SIMPLE_SUBJECTS){
  const source=read(`subjects/${subject}/assets/${subject}.js`);
  check(source.includes("script.src='../shared/host-bridge.js'")&&source.includes('BaumanSubjectHost?.onTask'),'simple subjects load the shared task bridge'.replace('simple',subject));
  check(source.includes('BaumanSubjectHost?.progress?.')&&!source.includes('SUBJECT_FEEDBACK'),`${subject}: progress uses canonical bridge`);
}
for(const subject of ['russian','programming','math']){
  check(read(`subjects/${subject}/index.html`).includes('../shared/host-bridge.js'),`${subject}: entry loads shared host bridge`);
}
for(const subject of ['russian','programming']){
  const source=read(`subjects/${subject}/assets/core.js`);
  check(source.includes('BaumanSubjectHost?.trusted?.(e)')&&source.includes('BaumanSubjectHost?.onTask?.(acceptTask)'),`${subject}: core receives only trusted tasks including query hydration`);
  check(!source.includes("window.parent.postMessage(payload,'*')"),`${subject}: loaded core has no wildcard parent send`);
}
check(read('.github/workflows/russian-ui-reference-gate.yml').includes('- "main"'),'Russian UI gate runs on pushes to main');

const pass19=JSON.parse(read('subjects/math/THEORY_C01_L06_RUNTIME_PASS19.json'));
check(pass19.status==='PASS'&&pass19.acceptance?.l04Regression==='PASS'&&pass19.acceptance?.l05Regression==='PASS'&&pass19.acceptance?.l06Runtime==='PASS','Math §1.4-§1.6 browser acceptance remains PASS');
check(pass19.lessons?.l06?.sourceSlides===22&&pass19.lessons?.l06?.readerSlides===22&&pass19.lessons?.l06?.oneToOne===true&&pass19.lessons?.l06?.compression===false,'Math §1.6 remains 22→22 with compression false');
check(pass19.lockedBoundaries?.lockedCasePreserved===true&&pass19.lockedBoundaries?.case==='UGV_TELEMETRY_8X6 / CASE_C01_L06_V1_LOCKED','Math locked UGV case remains accepted');
check(gitBlobSha1('subjects/math/assets/theory_skin/theory-formula-fraction-align-E235.js')==='0a041b808473309f2bf58091ae690a7298b7c9eb','E235 blob remains unchanged');
const mathIndex=read('subjects/math/index.html');
check(!/theory-formula-mini-lesson-E236|theory-formula-academic-E237|theory-formula-coverage-audit-E238/.test(mathIndex),'E236/E237/E238 remain disabled');
check(!mathIndex.includes('assets/core-subject.js')&&!mathIndex.includes('assets/planning-bridge.js'),'Legacy Math core and planning bridge remain outside the active Reader runtime');
check(exists('subjects/math/LEGACY_QUARANTINE.md'),'Inactive Math compatibility runtime is explicitly quarantined');
for(const candidate of ['math-activity-studio','math-formula-library','math-integration-sync','math-regression-gate','math-simulation-source']){
  check(!mathIndex.includes(`assets/${candidate}.js`)&&!mathIndex.includes(`assets/${candidate}.css`),`Unverified Math enhancement ${candidate} remains outside the accepted runtime`);
}

if(failures.length){
  console.error('SYSTEM_INTEGRATION_VALIDATION_FAIL');
  failures.forEach(failure=>console.error(`- ${failure}`));
  process.exit(1);
}
console.log('SYSTEM_INTEGRATION_VALIDATION_PASS');
console.log(JSON.stringify({subjects:SUBJECTS.length,checks:checks.length,bridge:'BAUMAN_SUBJECT_BRIDGE_V1',mathRuntime:'§1.4/§1.5/§1.6 preserved'},null,2));
