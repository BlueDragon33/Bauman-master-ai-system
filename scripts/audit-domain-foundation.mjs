import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const SUBJECTS=path.join(ROOT,'subjects');
const CANONICAL=/^bauman:(source|knowledge|competency|task|evidence|artifact|research):([a-z0-9][a-z0-9._-]{0,63}):([a-z0-9][a-z0-9._-]{0,127})$/;
const DOMAIN_DIR=path.join(SUBJECTS,'shared','domain');

const report={
  schema:'BAUMAN_DOMAIN_FOUNDATION_AUDIT_V1',
  scannedFiles:0,
  bytesScanned:0,
  largestFiles:[],
  parseErrors:[],
  identity:{recordsWithId:0,canonicalIds:0,legacyIds:0,duplicateIdsWithinFile:[],ambiguousLegacyFiles:0,canonicalCollisions:[],numericOrIndexLikeIds:0},
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
const sizeRows=[];
const subjectDirs=fs.existsSync(SUBJECTS)?fs.readdirSync(SUBJECTS,{withFileTypes:true}).filter(x=>x.isDirectory()&&x.name!=='shared'):[];
for(const subject of subjectDirs){
  const dataDir=path.join(SUBJECTS,subject.name,'data');
  const summary={files:0,bytes:0,recordsWithId:0,canonicalIds:0,legacyIds:0,filesWithDuplicateIds:0};
  if(!fs.existsSync(dataDir)){report.subjects[subject.name]=summary;continue;}
  const files=walk(dataDir).filter(file=>file.endsWith('.json'));
  for(const file of files){
    const stat=fs.statSync(file);
    const filePath=rel(file);
    sizeRows.push({path:filePath,bytes:stat.size});
    let parsed;
    try{parsed=JSON.parse(fs.readFileSync(file,'utf8'));}
    catch(error){report.parseErrors.push({path:filePath,error:error.message});continue;}
    report.scannedFiles++;report.bytesScanned+=stat.size;summary.files++;summary.bytes+=stat.size;
    const ids=[];
    visit(parsed,entity=>{
      const id=entity.id;
      ids.push(id);
      report.identity.recordsWithId++;summary.recordsWithId++;
      if(CANONICAL.test(id)){
        report.identity.canonicalIds++;summary.canonicalIds++;
        const previous=globalCanonical.get(id);
        if(previous&&previous!==filePath)report.identity.canonicalCollisions.push({id,first:previous,second:filePath});
        else globalCanonical.set(id,filePath);
      }else{
        report.identity.legacyIds++;summary.legacyIds++;
        if(/^\d+$/.test(id)||/^(?:item|row|lesson|task|q|question)[_-]?\d+$/i.test(id))report.identity.numericOrIndexLikeIds++;
      }
    });
    const counts=new Map();
    ids.forEach(id=>counts.set(id,(counts.get(id)||0)+1));
    const duplicates=[...counts.entries()].filter(([,count])=>count>1).map(([id,count])=>({id,count}));
    if(duplicates.length){
      summary.filesWithDuplicateIds++;
      report.identity.duplicateIdsWithinFile.push({path:filePath,duplicates:duplicates.slice(0,20)});
    }
  }
  report.subjects[subject.name]=summary;
}

report.identity.ambiguousLegacyFiles=report.identity.duplicateIdsWithinFile.length;
report.largestFiles=sizeRows.sort((a,b)=>b.bytes-a.bytes).slice(0,8);
if(fs.existsSync(DOMAIN_DIR))report.foundationFiles=walk(DOMAIN_DIR).map(rel).sort();
report.notes.push('L9 audits every JSON file under subjects/*/data, including the large Russian dialogue sources.');
report.notes.push('Legacy IDs are inventory only in L9; they are not rewritten in place.');
report.notes.push('Duplicate legacy IDs prove that legacyId alone is not a safe migration key; mappings require legacyId + legacyLocator.');
report.notes.push('Canonical identity is introduced additively through explicit mappings and future adapters.');

console.log('BAUMAN_DOMAIN_FOUNDATION_AUDIT='+JSON.stringify(report));
if(report.parseErrors.length)throw new Error('Domain audit found JSON parse errors: '+JSON.stringify(report.parseErrors));
if(report.identity.canonicalCollisions.length)throw new Error('Canonical ID collisions found: '+JSON.stringify(report.identity.canonicalCollisions));
if(!report.foundationFiles.some(x=>x.endsWith('domain-contract-v1.json')))throw new Error('Missing domain contract');
if(!report.foundationFiles.some(x=>x.endsWith('domain-model.js')))throw new Error('Missing domain model runtime');
if(!report.foundationFiles.some(x=>x.endsWith('migrations.js')))throw new Error('Missing migration runtime');
console.log('BAUMAN_DOMAIN_FOUNDATION_AUDIT=PASS');
