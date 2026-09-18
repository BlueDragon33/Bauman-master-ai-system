import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const cap=fs.readFileSync(path.join(root,'assets','capability-progression.js'),'utf8');
const core=fs.readFileSync(path.join(root,'assets','core.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');

new Function(cap);

const need=(text,token,msg)=>{if(!text.includes(token))throw new Error(msg||`Missing token: ${token}`);};
const forbid=(text,token,msg)=>{if(text.includes(token))throw new Error(msg||`Forbidden token: ${token}`);};

['R0','R1','R2','R3','R4'].forEach(id=>need(cap,`id:'${id}'`,`Missing capability band ${id}`));
need(cap,"lessonIds:['R01','R02','R03','R04']",'R0 lesson scope missing');
need(cap,"lessonIds:['R05','R06','R07','R08','R09','R10']",'R1 cross-stage scope missing');
need(cap,"lessonIds:['R11','R12','R13','R14']",'R2 Bauman coursework scope missing');
need(cap,"lessonIds:['R15','R16','R17','R18','R19','R20','R21','R22']",'R3 research scope missing');
need(cap,"lessonIds:['R23','R24','R25','R26']",'R4 thesis scope missing');

need(cap,'function lessonEvidence','Lesson evidence resolver missing');
need(cap,'function routeForStep','Capability step route resolver missing');
need(cap,"step==='speaking'?'practice':step==='check'?'review':'theory'",'Capability step must map speaking→practice and check→review');
need(cap,"missingStep=missing?.step||''",'Capability band must expose exact missing evidence step');
need(cap,'missingRoute:missing?routeForStep','Capability band must expose exact missing evidence route');
need(cap,'RussianLearningFlow?.hasMeaningfulEvidence','Capability bands must use real Learning Flow evidence');
need(cap,'function dueForLessons','Review Queue blocker missing');
need(cap,'RussianLearningState?.dueReviews','Capability progression must read real due reviews');
need(cap,'function writingStatsForStages','Academic writing evidence missing');
need(cap,'RussianAcademicLanguage?.get','Writing evidence must come from academic language runtime');
need(cap,'function stageExitStatus','Stage-exit evidence contract missing');
need(cap,'lesson.ready===lesson.total&&due.length===0&&writingOk','Stage-exit must require lessons, zero due review, and writing rule');
need(cap,'function currentBand','Current capability resolver missing');
need(cap,'index===0||!!previous?.complete','Higher capability must remain locked until previous band completes');
need(cap,'không phải nhãn CEFR','UI must disclose R0-R4 is not a CEFR label');

need(core,'finalPart=Number(part)>=Number(gateTotalParts())','Capability stage-exit must apply only at final part');
need(core,'RussianCapabilityProgression?.stageExitStatus?.(currentStageId())','Core final-stage gate must consult capability runtime');
need(core,'(!stageExit||stageExit.allowed)','Stage unlock must enforce capability exit when available');
need(core,'capabilityStageExit:unlock.stageExit?','Stage transition audit must preserve capability evidence snapshot');

need(index,'assets/capability-progression.css','Capability CSS not loaded');
need(index,'assets/capability-progression.js','Capability runtime not loaded');
need(sw,'./assets/capability-progression.css','Capability CSS missing from offline shell');
need(sw,'./assets/capability-progression.js','Capability runtime missing from offline shell');

forbid(cap,'Math.random','Capability progression must not synthesize evidence');
forbid(cap,'mastered:true','Capability progression must not synthesize mastery');
forbid(cap,"score>=70",'Capability progression must not infer speaking mastery from a score threshold');

console.log('RUSSIAN_R0_R4_CAPABILITY_GATE=PASS');
console.log('Checks: R0-R4 scope, cross-stage model, real lesson/review/writing evidence, sequential unlock, final-stage exit binding, transition audit, offline shell, no synthetic mastery.');
