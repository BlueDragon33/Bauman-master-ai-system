'use strict';

const fs=require('fs');
const path=require('path');
const vm=require('vm');

const SUBJECT_ROOT='subjects';
const LARGE_BYTES=5*1024*1024;
const VERY_LARGE_BYTES=20*1024*1024;
const failures=[];
const warnings=[];
const rows=[];

function adapterFor(subjectDir){
  const file=path.join(subjectDir,'assets','subject-adapter.js');
  if(!fs.existsSync(file))return null;
  const window={};
  const noop=()=>{};
  const sandbox={
    window,console,Math,Number,String,Array,Object,Set,Map,JSON,Date,RegExp,Boolean,
    parseInt,parseFloat,isFinite,encodeURIComponent,decodeURIComponent,
    URL:function(){},URLSearchParams:function(){},
    setTimeout:noop,clearTimeout:noop,setInterval:()=>0,clearInterval:noop
  };
  window.window=window;
  try{
    vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file,timeout:2000});
    return window.SUBJECT_ADAPTER||null;
  }catch(error){
    failures.push(`${file}: cannot evaluate adapter metadata: ${error.message}`);
    return null;
  }
}

function jsonFiles(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true})
    .filter((entry)=>entry.isFile()&&entry.name.endsWith('.json'))
    .map((entry)=>({name:entry.name,base:entry.name.slice(0,-5),bytes:fs.statSync(path.join(dir,entry.name)).size}))
    .sort((a,b)=>b.bytes-a.bytes);
}

function directScripts(subjectDir){
  const indexPath=path.join(subjectDir,'index.html');
  if(!fs.existsSync(indexPath))return [];
  const html=fs.readFileSync(indexPath,'utf8');
  const out=[];
  const re=/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi;
  let m;
  while((m=re.exec(html))){
    const src=m[1].split(/[?#]/)[0];
    if(/^(?:https?:)?\/\//i.test(src))continue;
    const resolved=path.normalize(path.resolve(subjectDir,src));
    const root=path.resolve(subjectDir)+path.sep;
    if((resolved+path.sep).startsWith(root)||resolved.startsWith(root))out.push(resolved);
  }
  return out.filter((file)=>fs.existsSync(file)&&fs.statSync(file).isFile());
}

function literalFetches(scriptFiles,subjectDir){
  const refs=new Set();
  const subjectAbs=path.resolve(subjectDir);
  for(const file of scriptFiles){
    const text=fs.readFileSync(file,'utf8');
    const re=/\bfetch\s*\(\s*["'`]([^"'`]+)["'`]/g;
    let m;
    while((m=re.exec(text))){
      const raw=m[1].split(/[?#]/)[0];
      if(!raw.endsWith('.json'))continue;
      const resolved=path.normalize(path.resolve(path.dirname(file),raw));
      if(resolved.startsWith(subjectAbs+path.sep))refs.add(resolved);
    }
  }
  return refs;
}

function metadataSets(adapter){
  return {
    catalog:new Set(adapter?.dataFiles||[]),
    declaredInitial:new Set(adapter?.initialDataFiles||[]),
    optional:new Set(adapter?.optionalDataFiles||adapter?.backgroundDataFiles||[]),
    meta:adapter?.dataSourceMeta||{}
  };
}

for(const entry of fs.readdirSync(SUBJECT_ROOT,{withFileTypes:true}).filter((e)=>e.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name))){
  const id=entry.name;
  const subjectDir=path.join(SUBJECT_ROOT,id);
  const dataDir=path.join(subjectDir,'data');
  const files=jsonFiles(dataDir);
  if(!files.length)continue;

  const adapter=adapterFor(subjectDir);
  const {catalog,declaredInitial,optional,meta}=metadataSets(adapter);
  const scripts=directScripts(subjectDir);
  const literalRefs=literalFetches(scripts,subjectDir);
  const literalBootData=new Set(files.filter((f)=>literalRefs.has(path.resolve(dataDir,f.name))).map((f)=>f.base));
  const large=files.filter((f)=>f.bytes>=LARGE_BYTES);
  const declaredInitialBytes=files.filter((f)=>declaredInitial.has(f.base)).reduce((sum,f)=>sum+f.bytes,0);
  const literalBootBytes=files.filter((f)=>literalBootData.has(f.base)).reduce((sum,f)=>sum+f.bytes,0);

  for(const file of large){
    const isOptional=optional.has(file.base);
    const lazy=meta[file.base]?.lazy===true;
    const explicitNonLazy=meta[file.base]?.lazy===false;
    const literalBoot=literalBootData.has(file.base);

    if(literalBoot&&(isOptional||lazy)){
      failures.push(`${id}/${file.name}: ${(file.bytes/1024/1024).toFixed(2)} MB is declared lazy/optional but is referenced by a literal fetch in an entry-loaded script`);
    }
    if(file.bytes>=VERY_LARGE_BYTES&&explicitNonLazy&&literalBoot){
      failures.push(`${id}/${file.name}: very large JSON is explicitly non-lazy and referenced by entry-loaded code`);
    }
    if(declaredInitial.has(file.base)&&!literalBoot){
      warnings.push(`${id}/${file.name}: large file is present in legacy initialDataFiles metadata, but no literal startup fetch was found in the current entry graph; treat metadata as catalog until runtime network regression proves otherwise`);
    }
    if(!adapter&&!literalBoot){
      warnings.push(`${id}/${file.name}: large JSON has no subject adapter metadata; current static entry graph does not prove it is startup-loaded`);
    }
  }

  for(const name of optional){
    if(meta[name]&&meta[name].lazy===false){
      warnings.push(`${id}/${name}: optional/background source explicitly says lazy=false`);
    }
  }

  for(const name of declaredInitial){
    if(optional.has(name))failures.push(`${id}/${name}: source is declared both initial and optional/background`);
  }

  rows.push({
    id,adapter:!!adapter,jsonCount:files.length,catalogCount:catalog.size,
    declaredInitialCount:declaredInitial.size,optionalCount:optional.size,
    directScriptCount:scripts.length,literalBootCount:literalBootData.size,
    declaredInitialBytes,literalBootBytes,large
  });
}

const lines=[];
lines.push('# Lượt 5 · Data Loading Audit · Generated','');
lines.push('This is a static entry-graph policy audit. It does not equate adapter catalog metadata with observed browser startup requests.');
lines.push('A browser/network regression remains the authoritative gate for actual startup payloads.','');
lines.push(`Large-file gate: **${LARGE_BYTES/1024/1024} MB**.`);
lines.push(`Very-large gate: **${VERY_LARGE_BYTES/1024/1024} MB**.`,'');
lines.push('| Môn | JSON | Catalog | Declared initial | Optional | Entry scripts | Literal JSON fetches | Declared initial MB | Literal fetch MB | JSON >=5 MB |');
lines.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|---|');
for(const row of rows){
  const large=row.large.map((f)=>`${f.name} (${(f.bytes/1024/1024).toFixed(2)} MB)`).join('<br>')||'—';
  lines.push(`| ${row.id} | ${row.jsonCount} | ${row.catalogCount} | ${row.declaredInitialCount} | ${row.optionalCount} | ${row.directScriptCount} | ${row.literalBootCount} | ${(row.declaredInitialBytes/1024/1024).toFixed(2)} | ${(row.literalBootBytes/1024/1024).toFixed(2)} | ${large} |`);
}
lines.push('','## Warnings','');
if(warnings.length)warnings.forEach((x)=>lines.push(`- ${x}`));else lines.push('- None.');
lines.push('','## Failures','');
if(failures.length)failures.forEach((x)=>lines.push(`- ${x}`));else lines.push('- None. Static entry-graph loading policy PASS.');
lines.push('');

fs.mkdirSync('docs/migration',{recursive:true});
fs.writeFileSync('docs/migration/L5_DATA_LOADING_AUDIT.generated.md',lines.join('\n'));
console.log(`L5 data audit: ${rows.length} subjects, ${failures.length} failure(s), ${warnings.length} warning(s).`);
if(failures.length){console.error(failures.join('\n'));process.exit(2);}
