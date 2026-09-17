import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const SUBJECTS=path.join(ROOT,'subjects');
const MAX_JSON_BYTES=16*1024*1024;
const CANONICAL=/^bauman:(source|knowledge|competency|task|evidence|artifact|research):([a-z0-9][a-z0-9._-]{0,63}):([a-z0-9][a-z0-9._-]{0,127})$/;
const DOMAIN_DIR=path.join(SUBJECTS,'shared','domain');

const report={
  schema:'BAUMAN_DOMAIN_FOUNDATION_AUDIT_V1',
  scannedFiles:0,
  skippedLargeFiles:[],
  parseErrors:[],
  identity:{recordsWithId:0,canonicalIds:0,legacyIds:0,duplicateIdsWithinFile:[],canonicalCollisions:[],numericOrIndexLikeIds:0},
  subjects:{},
  foundationFiles:[],
  notes:[]
};

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    return entry.isDirectory()?walk(full):[full];
  });
}
function rel(file){return path.relative(ROOT,file).replaceAll('\\','/');}
function visit(value,callback,seen=new Set()){
  if(value==null||typeof value!=='object'||seen.has(value))return;
  seen.add(value);
  if(!Array.isArray(value)&&typeof value.id==='string')callback(value);
  if(Array.isArray(value))value.forEach(x=>visit(x,callback,seen));
  else Object.values(value).forEach(x=>visit(x,callback,seen));
}

const globalCanonical=new Map();
const subjectDirs=fs.existsSync(SUBJECTS)?fs.readdirSync(SUBJECTS,{withFileTypes:true}).filter(x=>x.isDirectory()&&x.name!=='shared'):[];
for(const subject of subjectDirs){
  const dataDir=path.join(SUBJECTS,subject.name,'data');
  const summary={files:0,recordsWithId:0,canonicalIds:0,legacyIds:0};
  if(!fs.existsSync(dataDir)){report.subjects[subject.name]=summary;continue;}
  const files=walk(dataDir).filter(file=>file.endsWith('.json'));
  for(const file of files){
    const stat=fs.statSync(file);
    if(stat.size>MAX_JSON_BYTES){report.skippedLargeFiles.push({path:rel(file),bytes:stat.size});continue;}
    let parsed;
    try{parsed=JSON.parse(fs.readFileSync(file,'utf8'));}
    catch(error){report.parseErrors.push({path:rel(file),error:error.message});continue;}
    report.scannedFiles++;summary.files++;
    const ids=[];
    visit(parsed,entity=>{
      const id=entity.id;
      ids.push(id);
      report.identity.recordsWithId++;summary.recordsWithId++;
      if(CANONICAL.test(id)){
        report.identity.canonicalIds++;summary.canonicalIds++;
        const previous=globalCanonical.get(id);
        if(previous&&previous!==rel(file))report.identity.canonicalCollisions.push({id,first:previous,second:rel(file)});
        else globalCanonical.set(id,rel(file));
      }else{
        report.identity.legacyIds++;summary.legacyIds++;
        if(/^\d+$/.test(id)||/^(?:item|row|lesson|task|q|question)[_-]?\d+$/i.test(id))report.identity.numericOrIndexLikeIds++;
      }
    });
    const counts=new Map();
    ids.forEach(id=>counts.set(id,(counts.get(id)||0)+1));
    const duplicates=[...counts.entries()].filter(([,count])=>count>1).map(([id,count])=>({id,count}));
    if(duplicates.length)report.identity.duplicateIdsWithinFile.push({path:rel(file),duplicates:duplicates.slice(0,20)});
  }
  report.subjects[subject.name]=summary;
}

if(fs.existsSync(DOMAIN_DIR))report.foundationFiles=walk(DOMAIN_DIR).map(rel).sort();
report.notes.push('Legacy IDs are inventory only in L9; they are not rewritten in place.');
report.notes.push('Canonical identity is introduced additively through explicit mappings and future adapters.');
report.notes.push(`JSON files above ${MAX_JSON_BYTES} bytes are skipped to keep the audit bounded; their existing source IDs remain untouched.`);

console.log('BAUMAN_DOMAIN_FOUNDATION_AUDIT='+JSON.stringify(report));
if(report.parseErrors.length)throw new Error('Domain audit found JSON parse errors: '+JSON.stringify(report.parseErrors));
if(report.identity.canonicalCollisions.length)throw new Error('Canonical ID collisions found: '+JSON.stringify(report.identity.canonicalCollisions));
if(!report.foundationFiles.some(x=>x.endsWith('domain-contract-v1.json')))throw new Error('Missing domain contract');
if(!report.foundationFiles.some(x=>x.endsWith('domain-model.js')))throw new Error('Missing domain model runtime');
if(!report.foundationFiles.some(x=>x.endsWith('migrations.js')))throw new Error('Missing migration runtime');
console.log('BAUMAN_DOMAIN_FOUNDATION_AUDIT=PASS');
