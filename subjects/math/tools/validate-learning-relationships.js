#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

const report={
  validator:'MATH_LEARNING_RELATIONSHIPS_V1',
  checkedAt:new Date().toISOString(),
  counts:{},
  errors:[],
  warnings:[]
};
const fail=msg=>report.errors.push(msg);
const warn=msg=>report.warnings.push(msg);
function readJson(rel){
  const file=path.join(root,rel);
  if(!fs.existsSync(file)){fail('Missing file: '+rel);return null}
  try{return JSON.parse(fs.readFileSync(file,'utf8'))}
  catch(error){fail('Invalid JSON '+rel+': '+error.message);return null}
}
function recordsOf(raw){
  if(Array.isArray(raw))return raw;
  for(const key of ['records','items','lessons','chapters','disciplines','stages']){
    if(Array.isArray(raw?.[key]))return raw[key];
  }
  return[];
}
function idOf(item,keys){
  for(const key of keys){if(item?.[key]!=null&&String(item[key]).trim())return String(item[key]).trim()}
  return'';
}
function duplicateIds(list,keys,label){
  const seen=new Set();
  for(const item of list){
    const id=idOf(item,keys);
    if(!id){fail(label+' record missing stable id');continue}
    if(seen.has(id))fail(label+' duplicate id: '+id);
    seen.add(id);
  }
  return seen;
}

const theoryRaw=readJson('data/theory_lecture_content.json');
const chapterRaw=readJson('data/chapter_spine.json');
const disciplineRaw=readJson('data/discipline_spine.json');
const curriculum=readJson('data/curriculum.json');
const exerciseRaw=readJson('data/exercise_content.json');
const simulationRaw=readJson('data/simulation_content.json');
const applicationRaw=readJson('data/application_content.json');
const reviewRaw=readJson('data/review_pack_content.json');
const questionRaw=readJson('data/question_bank_content.json');

const theory=recordsOf(theoryRaw);
const chapters=recordsOf(chapterRaw);
const disciplines=recordsOf(disciplineRaw?.disciplines||disciplineRaw);
const stages=Array.isArray(curriculum?.stages)?curriculum.stages:[];

const lessonIds=duplicateIds(theory,['lessonId','id'],'theory lesson');
const chapterIds=duplicateIds(chapters,['chapterId','id'],'chapter');
const disciplineIds=duplicateIds(disciplines,['id','disciplineId'],'discipline');
const stageIds=duplicateIds(stages,['id','stageId'],'stage');

report.counts={
  theoryLessons:theory.length,
  chapters:chapters.length,
  disciplines:disciplines.length,
  stages:stages.length,
  exercises:recordsOf(exerciseRaw).length,
  simulations:recordsOf(simulationRaw).length,
  applications:recordsOf(applicationRaw).length,
  reviewPacks:recordsOf(reviewRaw).length,
  questions:recordsOf(questionRaw).length
};

for(const lesson of theory){
  const id=idOf(lesson,['lessonId','id']);
  const chapterId=String(lesson.chapterId||lesson.sourceAnchors?.chapterId||'');
  const stageId=String(lesson.sourceAnchors?.stageId||'');
  const disciplineId=String(lesson.sourceAnchors?.disciplineId||'');
  if(!chapterId)fail('Lesson '+id+' missing chapterId');
  else if(!chapterIds.has(chapterId))fail('Lesson '+id+' points to missing chapter '+chapterId);
  if(stageId&&!stageIds.has(stageId))fail('Lesson '+id+' points to missing stage '+stageId);
  if(disciplineId&&!disciplineIds.has(disciplineId))fail('Lesson '+id+' points to missing discipline '+disciplineId);
  if(lesson.sourceAnchors?.chapterId&&String(lesson.sourceAnchors.chapterId)!==String(lesson.chapterId||'')){
    fail('Lesson '+id+' chapterId/sourceAnchors.chapterId mismatch');
  }
  const slides=Array.isArray(lesson.slides)?lesson.slides:[];
  if(!slides.length)fail('Lesson '+id+' has no slides');
  const roles=new Set(slides.map(x=>String(x?.role||'').toLowerCase()).filter(Boolean));
  if(!roles.has('practice'))warn('Lesson '+id+' has no embedded practice role');
  if(!roles.has('simulation'))warn('Lesson '+id+' has no embedded simulation role');
}

function validateCompanion(label,raw,idKeys){
  const rows=recordsOf(raw);
  const ids=duplicateIds(rows,idKeys,label);
  for(const row of rows){
    const rid=idOf(row,idKeys);
    const lessonId=String(row.lessonId||'');
    const chapterId=String(row.chapterId||'');
    if(!lessonId)fail(label+' '+rid+' missing lessonId');
    else if(!lessonIds.has(lessonId))fail(label+' '+rid+' points to missing lesson '+lessonId);
    if(chapterId&&!chapterIds.has(chapterId))fail(label+' '+rid+' points to missing chapter '+chapterId);
    const lesson=theory.find(x=>idOf(x,['lessonId','id'])===lessonId);
    if(lesson&&chapterId&&String(lesson.chapterId||'')!==chapterId)fail(label+' '+rid+' chapter does not match owning lesson');
  }
  return{rows,ids};
}
const exercises=validateCompanion('exercise',exerciseRaw,['exerciseId','id']).rows;
validateCompanion('simulation',simulationRaw,['simulationId','id']);
validateCompanion('application',applicationRaw,['applicationId','id']);
validateCompanion('review pack',reviewRaw,['reviewPackId','id']);
validateCompanion('question',questionRaw,['questionId','id']);

const supportedAnswers=new Set(['multiple_choice','numeric','exact_text']);
for(const row of exercises){
  const id=idOf(row,['exerciseId','id']);
  const attemptsContract=row.answerType!=null||row.correctAnswer!=null||row.feedback!=null||row.reviewStepId!=null;
  if(!attemptsContract)continue;
  if(!supportedAnswers.has(String(row.answerType||'')))fail('Exercise '+id+' has unsupported answerType');
  if(row.correctAnswer==null)fail('Exercise '+id+' feedback contract missing correctAnswer');
  if(!String(row.feedback?.correct||'').trim())fail('Exercise '+id+' feedback contract missing feedback.correct');
  if(!String(row.feedback?.incorrect||'').trim())fail('Exercise '+id+' feedback contract missing feedback.incorrect');
  if(!String(row.reviewStepId||'').trim())fail('Exercise '+id+' feedback contract missing reviewStepId');
  if(row.answerType==='multiple_choice'&&(!Array.isArray(row.options)||row.options.length<2))fail('Exercise '+id+' multiple_choice missing options');
}

const assessmentDir=path.join(root,'data','theory_assessment');
if(fs.existsSync(assessmentDir)){
  const files=fs.readdirSync(assessmentDir).filter(x=>x.endsWith('.json'));
  report.counts.assessmentFiles=files.length;
  for(const file of files){
    const data=readJson(path.join('data','theory_assessment',file));
    const lessonId=String(data?.lessonId||'');
    if(!lessonId)fail('Assessment '+file+' missing lessonId');
    else if(!lessonIds.has(lessonId))fail('Assessment '+file+' points to missing lesson '+lessonId);
    const questions=[
      ...(Array.isArray(data?.retrievalChecks)?data.retrievalChecks:[]),
      ...(Array.isArray(data?.professorQuestions)?data.professorQuestions:[]),
      ...(Array.isArray(data?.professorQA)?data.professorQA:[])
    ];
    if(!questions.length)warn('Assessment '+file+' has no supported Lesson Check questions');
  }
}

for(const lesson of theory){
  const id=idOf(lesson,['lessonId','id']);
  const semanticQa=(lesson.slides||[]).flatMap(x=>x?.blocks||[]).filter(x=>String(x?.type||'').toLowerCase()==='qa'&&String(x?.title||'').toLowerCase()!=='trace').length;
  const assessmentFile=fs.existsSync(assessmentDir)?fs.readdirSync(assessmentDir).find(file=>{
    if(!file.endsWith('.json'))return false;
    try{return String(JSON.parse(fs.readFileSync(path.join(assessmentDir,file),'utf8')).lessonId||'')===id}catch(_){return false}
  }):null;
  if(!semanticQa&&!assessmentFile)warn('Lesson '+id+' has no source-backed Lesson Check item');
}

for(const [label,raw] of [
  ['exercise_content',exerciseRaw],
  ['simulation_content',simulationRaw],
  ['application_content',applicationRaw],
  ['review_pack_content',reviewRaw],
  ['question_bank_content',questionRaw]
]){
  if(raw?.sampleRecord&&String(raw.sampleRecord.auditStatus||'').toUpperCase()!=='DRAFT'){
    warn(label+' sampleRecord is not marked DRAFT');
  }
}

report.ok=report.errors.length===0;
console.log(JSON.stringify(report,null,2));
process.exit(report.ok?0:1);
