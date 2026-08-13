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
  try{
    vm.runInNewContext(fs.readFileSync(file,'utf8'),{window,console,Math,Number,String,Array,Object,Set,Map,JSON},{filename:file});
    return window.SUBJECT_ADAPTER||null;
  }catch(error){
    failures.push(`${file}: cannot evaluate adapter: ${error.message}`);
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

for(const entry of fs.readdirSync(SUBJECT_ROOT,{withFileTypes:true}).filter((e)=>e.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name))){
  const id=entry.name;
  const subjectDir=path.join(SUBJECT_ROOT,id);
  const files=jsonFiles(path.join(subjectDir,'data'));
  if(!files.length)continue;
  const adapter=adapterFor(subjectDir);
  const startup=new Set(adapter?.dataFiles||[]);
  const optional=new Set(adapter?.optionalDataFiles||[]);
  const meta=adapter?.dataSourceMeta||{};
  const startupBytes=files.filter((f)=>startup.has(f.base)).reduce((sum,f)=>sum+f.bytes,0);
  const large=files.filter((f)=>f.bytes>=LARGE_BYTES);

  for(const file of large){
    const isStartup=startup.has(file.base);
    const isOptional=optional.has(file.base);
    const lazy=meta[file.base]?.lazy===true;
    if(!adapter){
      failures.push(`${id}/${file.name}: ${(file.bytes/1024/1024).toFixed(2)} MB but subject has no adapter declaring lazy policy`);
    }else if(isStartup){
      failures.push(`${id}/${file.name}: ${(file.bytes/1024/1024).toFixed(2)} MB is in startup dataFiles`);
    }else if(!isOptional&&!lazy){
      failures.push(`${id}/${file.name}: ${(file.bytes/1024/1024).toFixed(2)} MB is not declared optional/lazy`);
    }
    if(file.bytes>=VERY_LARGE_BYTES&&!lazy){
      failures.push(`${id}/${file.name}: very large JSON must explicitly set dataSourceMeta.lazy=true`);
    }
  }

  for(const name of optional){
    if(meta[name]&&meta[name].lazy!==true){
      warnings.push(`${id}/${name}: optional source does not explicitly set lazy=true`);
    }
  }

  rows.push({id,adapter:!!adapter,jsonCount:files.length,startupCount:startup.size,optionalCount:optional.size,startupBytes,large});
}

const lines=[];
lines.push('# Lượt 5 · Data Loading Audit · Generated','');
lines.push(`Large-file gate: **${LARGE_BYTES/1024/1024} MB**.`);
lines.push(`Very-large explicit-lazy gate: **${VERY_LARGE_BYTES/1024/1024} MB**.`,'');
lines.push('| Môn | JSON | Startup files | Optional files | Startup declared MB | JSON >=5 MB |');
lines.push('|---|---:|---:|---:|---:|---|');
for(const row of rows){
  const large=row.large.map((f)=>`${f.name} (${(f.bytes/1024/1024).toFixed(2)} MB)`).join('<br>')||'—';
  lines.push(`| ${row.id} | ${row.jsonCount} | ${row.startupCount} | ${row.optionalCount} | ${(row.startupBytes/1024/1024).toFixed(2)} | ${large} |`);
}
lines.push('','## Warnings','');
if(warnings.length)warnings.forEach((x)=>lines.push(`- ${x}`));else lines.push('- None.');
lines.push('','## Failures','');
if(failures.length)failures.forEach((x)=>lines.push(`- ${x}`));else lines.push('- None. Large JSON lazy-loading gate PASS.');
lines.push('');

fs.mkdirSync('docs/migration',{recursive:true});
fs.writeFileSync('docs/migration/L5_DATA_LOADING_AUDIT.generated.md',lines.join('\n'));
console.log(`L5 data audit: ${rows.length} subjects, ${failures.length} failure(s), ${warnings.length} warning(s).`);
if(failures.length){console.error(failures.join('\n'));process.exit(2);}
