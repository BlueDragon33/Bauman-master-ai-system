'use strict';

const fs = require('fs');

function read(file){return fs.readFileSync(file,'utf8');}
function write(file,text){fs.writeFileSync(file,text);}
function replaceOnce(source,before,after,label,file){
  const first=source.indexOf(before);
  if(first<0)throw new Error(`${file}: missing ${label}`);
  const second=source.indexOf(before,first+before.length);
  if(second>=0)throw new Error(`${file}: multiple matches for ${label}`);
  console.log('PATCH:',file,label);
  return source.slice(0,first)+after+source.slice(first+before.length);
}

{
  const file='subjects/math/assets/core-subject.js';
  let source=read(file);
  if(!source.includes("BaumanSubjectStorage.forSubject(manifest.id||'math')")){
    source=replaceOnce(
      source,
      "let data = {}, activeTab='overview', todayContext=null, examGateSource=null, activeLessonId=null, activeModuleId=null, activeExamPage=1;\nlet state = loadState();\nfunction loadState(){try{return JSON.parse(localStorage.getItem('bauman_subject_state_'+(manifest.id||'_template'))||'{}')}catch(e){return {}}}\nfunction save(){try{localStorage.setItem('bauman_subject_state_'+(manifest.id||'_template'), JSON.stringify(state));}catch(e){}}",
      "let data = {}, activeTab='overview', todayContext=null, examGateSource=null, activeLessonId=null, activeModuleId=null, activeExamPage=1;\nconst SUBJECT_STORAGE=window.BaumanSubjectStorage.forSubject(manifest.id||'math');\nconst SUBJECT_STATE_KEY='bauman_subject_state_'+(manifest.id||'_template');\nlet state = loadState();\nfunction loadState(){try{return SUBJECT_STORAGE.getJSON(SUBJECT_STATE_KEY,{})||{}}catch(e){return {}}}\nfunction save(){try{SUBJECT_STORAGE.setJSON(SUBJECT_STATE_KEY,state,{kind:'math-core-subject-state'});}catch(e){}}",
      'core subject state storage abstraction',
      file
    );
    write(file,source);
  }else console.log('SKIP:',file,'already migrated');
}

{
  const file='subjects/math/assets/datavault_importer/datavault-importer-E127.js';
  let source=read(file);
  if(!source.includes("BaumanSubjectStorage.forSubject('math')")){
    source=replaceOnce(
      source,
      "  var REPORT_KEY='bauman_math_e127_last_report_v1';",
      "  var REPORT_KEY='bauman_math_e127_last_report_v1';\n  var SUBJECT_STORAGE=window.BaumanSubjectStorage.forSubject('math');",
      'bind Math subject storage E127',
      file
    );
    source=replaceOnce(
      source,
      "  function localGet(k,fallback){try{return safeJson(localStorage.getItem(k)||'',fallback)}catch(_){return fallback}}\n  function localSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}\n  function localDel(k){try{localStorage.removeItem(k)}catch(_){}}",
      "  function localGet(k,fallback){try{return SUBJECT_STORAGE.getJSON(k,fallback)}catch(_){return fallback}}\n  function localSet(k,v){try{SUBJECT_STORAGE.setJSON(k,v,{kind:'math-e127-datavault'});return true}catch(e){return false}}\n  function localDel(k){try{SUBJECT_STORAGE.removeItem(k,{kind:'math-e127-datavault'})}catch(_){}}",
      'E127 local helpers through subject storage',
      file
    );
    write(file,source);
  }else console.log('SKIP:',file,'already migrated');
}

for(const file of [
  'subjects/math/assets/core-subject.js',
  'subjects/math/assets/datavault_importer/datavault-importer-E127.js'
]){
  const source=read(file);
  if(/localStorage\.(getItem|setItem|removeItem)/.test(source))throw new Error(`${file}: direct localStorage API remains`);
  if(!source.includes('BaumanSubjectStorage'))throw new Error(`${file}: subject storage binding missing`);
}

console.log('L3 Math legacy storage cleanup applied successfully.');
