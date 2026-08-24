'use strict';

const fs=require('fs');
const path=require('path');

const ROOT=process.cwd();
const contractPath='assets/data/lesson/universal-lesson-contract-v1.json';
const subjects=['ai','foundation','research','signal','systems'];
const expectedFlow=[
  'hook','concept-map','theory','worked-example','try-it-yourself','graded-practice',
  'interactive-lab','simulation','common-mistakes','visual-check','russian-twin',
  'english-research','ai-tutor','oral-defense','review','assessment','master-ready',
  'project-nir-checkpoint'
];
const requiredProfiles=['language','math','programming','database','data-ml','systems','time-series','research','foundation'];
const failures=[];
const warnings=[];
const checks=[];
const check=(name,ok,detail='')=>{checks.push({name,ok:!!ok,detail});if(!ok)failures.push(`${name}${detail?': '+detail:''}`);};

function readJson(file){return JSON.parse(fs.readFileSync(path.join(ROOT,file),'utf8'));}
function has(value){
  if(value===null||value===undefined)return false;
  if(typeof value==='string')return value.trim().length>0;
  if(Array.isArray(value))return value.length>0;
  if(typeof value==='object')return Object.keys(value).length>0;
  return true;
}
function get(obj,pathString){return String(pathString||'').split('.').reduce((acc,key)=>acc==null?undefined:acc[key],obj);}

let contract=null;
try{contract=readJson(contractPath);}catch(error){failures.push(`contract JSON invalid: ${error.message}`);}

if(contract){
  check('contract schema',contract.schema==='bauman-universal-lesson-contract-v1',String(contract.schema));
  check('Bauman learner identity',contract.program?.department==='ИУ-5'&&contract.program?.displayCode==='09.04.01/11',JSON.stringify(contract.program));
  check('Bauman-only policy',contract.program?.policy==='bauman-only',String(contract.program?.policy));
  check('canonical flow has exactly 18 sections',Array.isArray(contract.canonicalFlow)&&contract.canonicalFlow.length===18,String(contract.canonicalFlow?.length));
  check('canonical flow order',JSON.stringify(contract.canonicalFlow)===JSON.stringify(expectedFlow));
  check('section registry matches canonical flow',expectedFlow.every(id=>contract.sections?.[id])&&Object.keys(contract.sections||{}).length===18,Object.keys(contract.sections||{}).join(','));
  check('all sections render only when populated',Object.values(contract.sections||{}).every(section=>section.renderWhenPopulated===true));
  check('required lesson profiles exist',requiredProfiles.every(id=>contract.lessonProfiles?.[id]),Object.keys(contract.lessonProfiles||{}).join(','));
  check('reference subjects preserved',contract.lessonProfiles?.language?.referenceSubject==='russian'&&contract.lessonProfiles?.math?.referenceSubject==='math'&&contract.lessonProfiles?.programming?.referenceSubject==='programming');
  check('AI is optional offline augmentation',contract.offlinePolicy?.generativeAiRequiredOffline===false&&contract.offlinePolicy?.appShellSeparateFromContent===true);
  check('zero-copy local files preserved',contract.offlinePolicy?.localFileZeroCopySupported===true);
  check('mastery assessment threshold',Number(contract.masteryPolicy?.minimumAssessmentPercent)===80,String(contract.masteryPolicy?.minimumAssessmentPercent));
  check('retention target',Number(contract.masteryPolicy?.retentionTargetPercent)===75,String(contract.masteryPolicy?.retentionTargetPercent));
  check('mastery requires four evidence classes',Array.isArray(contract.masteryPolicy?.requiredEvidence)&&contract.masteryPolicy.requiredEvidence.length>=4,JSON.stringify(contract.masteryPolicy?.requiredEvidence));
  check('AI source policy forbids invented citations',/never invent citations/i.test(contract.aiContract?.sourcePolicy||''));
  check('AI active-exercise anti-shortcut policy',/hint|socratic/i.test(contract.aiContract?.antiShortcut||''));
  check('language immersion modes complete',['VI_PRIMARY','RU_GROWING','RU_FIRST','MASTER_RU_EN','ADAPTIVE'].every(mode=>contract.languageImmersion?.modes?.includes(mode)),JSON.stringify(contract.languageImmersion?.modes));
  for(const [stage,ratio] of Object.entries(contract.languageImmersion?.stageDefaults||{})){
    const sum=Number(ratio.vi||0)+Number(ratio.ru||0)+Number(ratio.en||0);
    check(`language ratio ${stage} sums to 1`,Math.abs(sum-1)<1e-9,String(sum));
  }
  const source=fs.readFileSync(path.join(ROOT,contractPath),'utf8');
  check('contract contains no comparison-school label',!/hutech/i.test(source));
}

const coverage=[];
if(contract){
  for(const subjectId of subjects){
    const lessonPath=`subjects/${subjectId}/data/lessons.json`;
    if(!fs.existsSync(path.join(ROOT,lessonPath))){
      failures.push(`${subjectId}: missing lessons.json`);
      continue;
    }
    let lessons=[];
    try{lessons=readJson(lessonPath);}catch(error){failures.push(`${subjectId}: lessons JSON invalid: ${error.message}`);continue;}
    if(!Array.isArray(lessons)){failures.push(`${subjectId}: lessons.json is not an array`);continue;}
    const perSection=Object.fromEntries(expectedFlow.map(id=>[id,0]));
    let eLearningCount=0;
    let fullCoreCount=0;
    for(const lesson of lessons){
      if(lesson?.eLearning&&typeof lesson.eLearning==='object')eLearningCount++;
      let core=0;
      for(const sectionId of expectedFlow){
        const section=contract.sections[sectionId];
        const populated=(section.sourcePaths||[]).some(p=>has(get(lesson,p)));
        if(populated){perSection[sectionId]++;if(['hook','theory','worked-example','graded-practice','common-mistakes','assessment','master-ready'].includes(sectionId))core++;}
      }
      if(core===7)fullCoreCount++;
    }
    const item={subjectId,lessons:lessons.length,eLearningCount,fullCoreCount,coverage:perSection};
    coverage.push(item);
    check(`${subjectId}: has lesson content`,lessons.length>0,String(lessons.length));
    check(`${subjectId}: eLearning envelope exists`,eLearningCount>0,`${eLearningCount}/${lessons.length}`);
    if(fullCoreCount<lessons.length)warnings.push(`${subjectId}: ${fullCoreCount}/${lessons.length} lessons currently cover the seven core pedagogical sections; content upgrade remains required.`);
    const newLayerCoverage=['visual-check','russian-twin','english-research','ai-tutor','oral-defense','review','project-nir-checkpoint'].map(id=>`${id}:${perSection[id]}/${lessons.length}`).join(', ');
    warnings.push(`${subjectId} extension coverage → ${newLayerCoverage}`);
  }
}

const report={
  generatedAt:new Date().toISOString(),
  contract:contract?{schema:contract.schema,version:contract.version,sections:contract.canonicalFlow.length}:null,
  checks,
  coverage,
  warnings,
  failures
};
fs.mkdirSync(path.join(ROOT,'docs','academic'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'docs','academic','UNIVERSAL_LESSON_CONTRACT_AUDIT.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(`Universal Lesson Contract audit: ${checks.length} checks, ${coverage.length} subjects, ${failures.length} failure(s), ${warnings.length} warning(s).`);
if(failures.length){console.error(failures.join('\n'));process.exit(2);}
console.log('Universal Lesson Contract V1 structural gate PASS.');
if(warnings.length)console.warn(warnings.join('\n'));
