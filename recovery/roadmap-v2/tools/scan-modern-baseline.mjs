import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const args=process.argv.slice(2);
function arg(name, fallback=''){
  const i=args.indexOf(name);
  return i>=0&&args[i+1]?args[i+1]:fallback;
}
const profilePath=arg('--profile','recovery/roadmap-v2/toolchain-profile-r2c2a.v1.json');
const outputPath=arg('--output');
if(!outputPath)throw new Error('R2C2A_OUTPUT_REQUIRED');

function cleanRelative(value,label){
  const raw=String(value||'').trim().replace(/\\/g,'/');
  if(!raw||path.isAbsolute(raw)||raw.startsWith('/')||raw.split('/').includes('..'))throw new Error(`R2C2A_INVALID_${label}`);
  return raw;
}
function sha256(bytes){return crypto.createHash('sha256').update(bytes).digest('hex');}
function gitBlobSha(bytes){return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');}
function stable(value){
  if(Array.isArray(value))return value.map(stable);
  if(value&&typeof value==='object'){
    const out={};
    for(const key of Object.keys(value).sort())out[key]=stable(value[key]);
    return out;
  }
  return value;
}
function stringify(value){return JSON.stringify(stable(value),null,2)+'\n';}
function parseJson(bytes,label){
  try{return JSON.parse(bytes.toString('utf8'));}catch{throw new Error(`R2C2A_INVALID_JSON:${label}`);}
}
function arrayOf(value,...keys){
  if(Array.isArray(value))return value;
  for(const key of keys)if(Array.isArray(value?.[key]))return value[key];
  return [];
}
function stats(source,bytes){
  if(source.id==='roadmapSpec')return {characters:bytes.toString('utf8').length};
  const doc=parseJson(bytes,source.id);
  if(source.id==='legacyLessons'){
    const rows=arrayOf(doc,'lessons','records','items');
    return {lessons:rows.length,slides:rows.reduce((n,row)=>n+arrayOf(row,'slides').length,0)};
  }
  if(source.id==='theoryOverlay'){
    const rows=arrayOf(doc,'records','lessons','items');
    return {records:rows.length,slides:rows.reduce((n,row)=>n+arrayOf(row,'slides').length,0)};
  }
  if(source.id==='theoryFramework'){
    const chapters=[];
    for(const faculty of arrayOf(doc,'faculties')){
      for(const department of arrayOf(faculty,'departments')){
        chapters.push(...arrayOf(department,'chapters'));
      }
    }
    const subLessons=chapters.reduce((n,ch)=>n+arrayOf(ch,'lessons','subLessons','smallLessons','items').length,0);
    return {chapters:chapters.length,subLessons};
  }
  if(source.id==='chapterSpine')return {records:arrayOf(doc,'records','chapters','items').length};
  return {};
}
const profileRel=cleanRelative(profilePath,'PROFILE_PATH');
const outputRel=cleanRelative(outputPath,'OUTPUT_PATH');
const profile=JSON.parse(fs.readFileSync(path.join(root,profileRel),'utf8'));
if(profile.schema!=='BAUMAN_ROADMAP_V2_RECOVERY_TOOLCHAIN_PROFILE_V1')throw new Error('R2C2A_PROFILE_SCHEMA_MISMATCH');
if(profile.outputPolicy?.canonicalWriteAllowed!==false)throw new Error('R2C2A_CANONICAL_WRITE_POLICY_REQUIRED');
const allowedRoot=cleanRelative(profile.outputPolicy.allowedRoot,'ALLOWED_ROOT').replace(/\/$/,'');
if(!(outputRel===allowedRoot||outputRel.startsWith(allowedRoot+'/')))throw new Error('R2C2A_OUTPUT_OUTSIDE_RECOVERY_SANDBOX');
if(outputRel==='roadmap_v2'||outputRel.startsWith('roadmap_v2/'))throw new Error('R2C2A_CANONICAL_WRITE_FORBIDDEN');

const sources=[];
for(const source of profile.sources||[]){
  const relative=cleanRelative(source.path,'SOURCE_PATH');
  const absolute=path.join(root,relative);
  const bytes=fs.readFileSync(absolute);
  const blob=gitBlobSha(bytes);
  if(source.expectedGitBlobSha&&blob!==source.expectedGitBlobSha)throw new Error(`R2C2A_SOURCE_BLOB_DRIFT:${source.id}:${blob}`);
  const observed=stats(source,bytes);
  for(const [key,value] of Object.entries(source.expected||{})){
    if(observed[key]!==value)throw new Error(`R2C2A_SOURCE_COUNT_DRIFT:${source.id}:${key}:${observed[key]}:${value}`);
  }
  sources.push({id:source.id,role:source.role,path:relative,gitBlobSha:blob,sha256:sha256(bytes),byteLength:bytes.length,stats:observed});
}
const report={
  schema:'BAUMAN_ROADMAP_V2_MODERN_BASELINE_SCAN_V1',
  phase:'L27R2C2A_PARAMETERIZED_RECOVERY_TOOLCHAIN',
  profile:{path:profileRel,schema:profile.schema},
  runtimeAnchor:profile.runtimeAnchor,
  outputPolicy:{scope:'recovery_only',canonicalWriteAllowed:false},
  sources,
  summary:{
    sourceCount:sources.length,
    legacyLessons:sources.find(x=>x.id==='legacyLessons')?.stats.lessons||0,
    legacySlides:sources.find(x=>x.id==='legacyLessons')?.stats.slides||0,
    overlayRecords:sources.find(x=>x.id==='theoryOverlay')?.stats.records||0,
    overlaySlides:sources.find(x=>x.id==='theoryOverlay')?.stats.slides||0,
    frameworkChapters:sources.find(x=>x.id==='theoryFramework')?.stats.chapters||0,
    frameworkSubLessons:sources.find(x=>x.id==='theoryFramework')?.stats.subLessons||0,
    chapterSpineRecords:sources.find(x=>x.id==='chapterSpine')?.stats.records||0
  },
  result:'PASS_RECOVERY_SCAN'
};
fs.mkdirSync(path.dirname(path.join(root,outputRel)),{recursive:true});
fs.writeFileSync(path.join(root,outputRel),stringify(report),'utf8');
process.stdout.write(stringify({status:'ROADMAP_V2_R2C2A_SCAN_PASS',output:outputRel,summary:report.summary}));
