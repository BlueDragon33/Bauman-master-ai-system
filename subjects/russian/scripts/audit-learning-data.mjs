import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'subject-manifest.json'),'utf8'));
const rows=[];
const duplicateSummary=[];

function arraysNamed(value,key,out=[]){
  if(Array.isArray(value)){for(const item of value)arraysNamed(item,key,out);return out;}
  if(!value||typeof value!=='object')return out;
  for(const [k,v] of Object.entries(value)){
    if(k===key&&Array.isArray(v))out.push(v);
    arraysNamed(v,key,out);
  }
  return out;
}
function logicalItems(id,data){
  if(Array.isArray(data))return data;
  if(!data||typeof data!=='object')return [];
  if(id==='tests')return arraysNamed(data,'questions').flat();
  if(id==='speaking-link-index')return Object.entries(data).map(([key,value])=>({key,value}));
  if(id==='curriculum')return Array.isArray(data.modules)?data.modules:[];
  for(const key of ['items','lessons','modules','entries','data','units','cards','questions','tasks','videos','nodes']){
    if(Array.isArray(data[key]))return data[key];
  }
  return Object.values(data);
}
function identity(x){
  if(!x||typeof x!=='object')return '';
  return String(x.id??x.term??x.ru??x.word??x.title??x.lessonId??x.key??'').trim();
}
for(const meta of manifest.dataFiles||[]){
  const file=path.join(root,meta.path);
  if(!fs.existsSync(file)){
    rows.push({id:meta.id,path:meta.path,required:!!meta.required,exists:false,actualCount:null,plannedCount:meta.plannedCount??null,shape:'missing',duplicates:null});
    continue;
  }
  const raw=fs.readFileSync(file,'utf8');
  const data=JSON.parse(raw);
  const items=logicalItems(meta.id,data);
  const seen=new Set();let duplicates=0,identified=0;
  for(const item of items){const id=identity(item);if(!id)continue;identified++;if(seen.has(id))duplicates++;else seen.add(id);}
  const shape=Array.isArray(data)?'array':(data&&typeof data==='object'?`object:${Object.keys(data).slice(0,10).join(',')}`:typeof data);
  const extra=meta.id==='curriculum'?{stageCount:Array.isArray(data.stages)?data.stages.length:0,moduleCount:Array.isArray(data.modules)?data.modules.length:0}:meta.id==='tests'?{questionArrays:arraysNamed(data,'questions').length}:{};
  rows.push({id:meta.id,path:meta.path,required:!!meta.required,exists:true,actualCount:items.length,plannedCount:meta.plannedCount??null,shape,identified,duplicates,bytes:Buffer.byteLength(raw),...extra});
  if(duplicates)duplicateSummary.push({id:meta.id,duplicates});
}
const missingRequired=rows.filter(x=>x.required&&!x.exists);
console.log('RUSSIAN_DATA_AUDIT='+JSON.stringify({rows,missingRequired:missingRequired.map(x=>x.id),duplicateSummary}));
for(const r of rows)console.log(`${r.id}: actual=${r.actualCount} planned=${r.plannedCount??'-'} shape=${r.shape} duplicates=${r.duplicates??'-'}`);
if(missingRequired.length)throw new Error(`Missing required Russian datasets: ${missingRequired.map(x=>x.id).join(', ')}`);
console.log('RUSSIAN_DATA_PARSE_GATE=PASS');
