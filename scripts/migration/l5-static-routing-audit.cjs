'use strict';

const fs=require('fs');
const path=require('path');

const ROOT=path.resolve('.');
const failures=[];
const warnings=[];
const entries=['index.html'];
const subjectsRoot=path.join(ROOT,'subjects');

if(fs.existsSync(subjectsRoot)){
  for(const dir of fs.readdirSync(subjectsRoot,{withFileTypes:true}).filter((x)=>x.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name))){
    const entry=path.join('subjects',dir.name,'index.html');
    if(fs.existsSync(entry))entries.push(entry);
  }
}

function cleanRef(raw){
  return String(raw||'').trim().replace(/&amp;/g,'&');
}
function localRef(raw){
  const value=cleanRef(raw);
  if(!value||value.startsWith('#')||/^(?:https?:|data:|mailto:|tel:|javascript:|\/\/)/i.test(value))return null;
  return value.split('#')[0].split('?')[0];
}
function resolveEntryRef(entry,ref){
  const local=localRef(ref);
  if(!local)return null;
  const base=path.dirname(path.resolve(entry));
  const target=path.resolve(base,local);
  if(target!==ROOT&&!target.startsWith(ROOT+path.sep)){
    failures.push(`${entry}: local path escapes repository root: ${ref}`);
    return null;
  }
  return target;
}
function refsFromHtml(html){
  const refs=[];
  for(const match of html.matchAll(/<(?:script|link)\b[^>]*?\b(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi))refs.push(match[1]);
  return refs;
}

const entryReport=[];
for(const entry of entries){
  const html=fs.readFileSync(entry,'utf8');
  const refs=refsFromHtml(html);
  const missing=[];
  for(const ref of refs){
    const target=resolveEntryRef(entry,ref);
    if(!target)continue;
    if(!fs.existsSync(target)){
      const rel=path.relative(ROOT,target).split(path.sep).join('/');
      missing.push(rel);
      failures.push(`${entry}: missing local asset ${ref} -> ${rel}`);
    }
  }
  entryReport.push({entry,refs:refs.length,missing});
}

const rootHtml=fs.readFileSync('index.html','utf8');
const requiredMainScripts=[
  'assets/js/platform/runtime-config.js',
  'assets/js/platform/site-runtime.js',
  'assets/js/platform/storage-adapter.js',
  'assets/js/main.js',
  'assets/js/platform/site-routing-bridge.js'
];
let previous=-1;
for(const script of requiredMainScripts){
  const index=rootHtml.indexOf(`src="${script}"`);
  if(index<0)failures.push(`index.html: required runtime script not wired: ${script}`);
  if(index>=0&&index<=previous)failures.push(`index.html: runtime script order invalid around ${script}`);
  if(index>=0)previous=index;
}

const runtime=fs.readFileSync('assets/js/platform/site-runtime.js','utf8');
const worker=fs.readFileSync('service-worker.js','utf8');
const runtimeVersion=(runtime.match(/const VERSION='([^']+)'/)||[])[1]||'';
const workerVersion=(worker.match(/const VERSION='([^']+)'/)||[])[1]||'';
if(!runtimeVersion||!workerVersion)failures.push('Cannot read L5 runtime/cache version markers.');
if(runtimeVersion!==workerVersion)failures.push(`Runtime/service-worker version mismatch: ${runtimeVersion} vs ${workerVersion}`);
if(!worker.includes("'./assets/js/platform/site-routing-bridge.js'"))failures.push('service-worker.js: routing bridge missing from versioned shell cache.');
if(!/path\.includes\('\/data\/'\)/.test(worker)||!/path\.endsWith\('\.json'\)/.test(worker))failures.push('service-worker.js: JSON/data exclusion policy is missing.');

const config=fs.readFileSync('assets/js/platform/runtime-config.js','utf8');
if(!/siteRuntime:\s*true/.test(config))failures.push('runtime-config.js: siteRuntime must be enabled for L5 runtime gate.');
if(!/serviceWorkerCache:\s*false/.test(config))warnings.push('serviceWorkerCache is not OFF during migration/staging gate; verify explicit rollout decision.');

const main=fs.readFileSync('assets/js/main.js','utf8');
for(const id of ['russian','math','programming','ai','systems','signal','research','foundation']){
  const mainPath=`subjects/${id}/index.html`;
  const editorPath=`subjects/${id}/editor.html`;
  if(!main.includes(mainPath))failures.push(`main.js: configured subject entry missing for ${id}`);
  if(!fs.existsSync(mainPath))failures.push(`Configured subject entry does not exist: ${mainPath}`);
  if(main.includes(editorPath)&&!fs.existsSync(editorPath))failures.push(`Configured subject editor does not exist: ${editorPath}`);
}

const report={runtimeVersion,workerVersion,entries:entryReport,warnings,failures};
fs.mkdirSync('docs/migration',{recursive:true});
fs.writeFileSync('docs/migration/L5_STATIC_ROUTING_AUDIT.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(`L5 static routing audit: ${entries.length} entries, ${failures.length} failure(s), ${warnings.length} warning(s).`);
if(warnings.length)console.warn(warnings.join('\n'));
if(failures.length){console.error(failures.join('\n'));process.exit(2);}
console.log('L5 static path/cache/routing audit PASS.');
