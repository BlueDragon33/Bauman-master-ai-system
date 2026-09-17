import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',name+'.json'),'utf8'));
const arr=v=>Array.isArray(v)?v:[];
const str=v=>String(v??'').trim();
const cyr=/[А-Яа-яЁё]/;
const stages=new Set(['vn','prep','hk1','hk2','hk3','hk4']);
const grammar=read('grammar');
const grammarPath=read('grammar-path');
const writing=read('writing');
const knowledge=read('knowledge-index');
const lessons=read('lessons');

function countFields(list,keys){
 const out={};
 for(const k of keys)out[k]=arr(list).filter(x=>{
  const v=x?.[k];return Array.isArray(v)?v.length>0:!!str(v);
 }).length;
 return out;
}
function stageCounts(list){const out={};for(const x of arr(list)){const s=str(x?.stage)||'none';out[s]=(out[s]||0)+1;}return out;}
function invalidStages(list){return arr(list).filter(x=>str(x?.stage)&&!stages.has(str(x.stage))).map(x=>str(x.id||x.title)).filter(Boolean);}
function walkStrings(value,pathName='',out=[]){
 if(typeof value==='string'){if(str(value))out.push({path:pathName,text:value});return out;}
 if(Array.isArray(value)){value.forEach((v,i)=>walkStrings(v,`${pathName}[${i}]`,out));return out;}
 if(value&&typeof value==='object'){for(const [k,v] of Object.entries(value))walkStrings(v,pathName?`${pathName}.${k}`:k,out);}
 return out;
}
const grammarFields=countFields(grammar,['stage','title','rule','focus','practice','examples','mistakes','tags']);
const pathFields=countFields(grammarPath,['level','track','title','why','core','pattern','examples','practice','mistakes','bauman','mastery','mapLinks']);
const writingFields=countFields(writing,['stage','mode','title','purpose','prompt_vi','prompt_ru','target_words','time_minutes','required_patterns','vocab_suggestions_ru','grammar_focus','model_ru','rubric','rewrite_cycle']);
const writingModes={};for(const w of writing){const m=str(w.mode)||'none';writingModes[m]=(writingModes[m]||0)+1;}
let lessonCyrStrings=0,lessonCyrChars=0,lessonWithCyr=0;
const lessonRows=[];
for(const lesson of arr(lessons)){
 const strings=walkStrings(lesson);const russian=strings.filter(x=>cyr.test(x.text));
 if(russian.length)lessonWithCyr++;
 const chars=russian.reduce((n,x)=>n+(x.text.match(/[А-Яа-яЁё]/g)||[]).length,0);
 lessonCyrStrings+=russian.length;lessonCyrChars+=chars;
 lessonRows.push({id:str(lesson.id||lesson.lessonId||lesson.title),stage:str(lesson.stage),cyrStrings:russian.length,cyrChars:chars,topPaths:[...new Set(russian.map(x=>x.path.split('.').slice(0,3).join('.')))].slice(0,12)});
}
const knowledgeRows=knowledge.map(x=>({id:str(x.id),stage:str(x.stage),title:str(x.title),keywordCount:arr(x.keywords).length,russianKeywords:arr(x.keywords).filter(k=>cyr.test(str(k))).length,hasSummary:!!str(x.summary)}));
const report={
 schema:'RUSSIAN_ACADEMIC_LANGUAGE_AUDIT_V1',
 counts:{grammar:grammar.length,grammarPath:grammarPath.length,writing:writing.length,knowledge:knowledge.length,lessons:lessons.length},
 grammar:{fields:grammarFields,stageCounts:stageCounts(grammar),invalidStages:invalidStages(grammar)},
 grammarPath:{fields:pathFields},
 writing:{fields:writingFields,modes:writingModes,stageCounts:stageCounts(writing),invalidStages:invalidStages(writing)},
 reading:{lessonWithCyr,lessonCyrStrings,lessonCyrChars,lessonRows},
 knowledge:{stageCounts:stageCounts(knowledge),invalidStages:invalidStages(knowledge),rows:knowledgeRows},
 provenance:{note:'Academic/technical labels come from repository curriculum/data only; audit makes no external BMSTU curriculum claim.'}
};
console.log('RUSSIAN_ACADEMIC_LANGUAGE_AUDIT='+JSON.stringify(report));
if(grammar.length!==20)throw new Error(`Expected 20 grammar items, got ${grammar.length}`);
if(grammarPath.length!==19)throw new Error(`Expected 19 grammar-path items, got ${grammarPath.length}`);
if(writing.length!==42)throw new Error(`Expected 42 writing tasks, got ${writing.length}`);
if(knowledge.length!==26||lessons.length!==26)throw new Error('Expected 26 knowledge and 26 lesson items');
if(report.grammar.invalidStages.length||report.writing.invalidStages.length||report.knowledge.invalidStages.length)throw new Error('Unknown stage ids in L6 sources');
if(lessonWithCyr!==lessons.length)throw new Error(`Every lesson should retain Cyrillic reading material; found ${lessonWithCyr}/${lessons.length}`);
console.log('RUSSIAN_ACADEMIC_LANGUAGE_AUDIT=PASS');