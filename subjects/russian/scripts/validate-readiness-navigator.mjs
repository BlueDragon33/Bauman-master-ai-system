import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const core=fs.readFileSync(path.join(root,'assets','core.js'),'utf8');
const css=fs.readFileSync(path.join(root,'assets','core.css'),'utf8');
new Function(core);

const need=(text,token,msg)=>{if(!text.includes(token))throw new Error(msg||`Missing token: ${token}`);};
const forbid=(text,token,msg)=>{if(text.includes(token))throw new Error(msg||`Forbidden token: ${token}`);};

need(core,'function readinessStepRoute','Readiness step router missing');
need(core,"theory:{view:'learning',learnTab:'theory',lessonId:id}",'Theory route must preserve lesson id');
need(core,"speaking:{view:'learning',learnTab:'practice',lessonId:id}",'Speaking route must preserve lesson id');
need(core,"exercises:{view:'learning',learnTab:'exercises',lessonId:id}",'Exercise route must preserve lesson id');
need(core,"check:{view:'learning',learnTab:'review',lessonId:id,reviewLesson:id,reviewFilter:'all'}",'Check route must bind review to exact lesson');
need(core,'function stageReadinessNextTarget','Readiness target resolver missing');

const fnStart=core.indexOf('function stageReadinessNextTarget');
const fnEnd=core.indexOf('\n}',fnStart)+2;
const fn=core.slice(fnStart,fnEnd);
const evidencePos=fn.indexOf("kind:'evidence'");
const reviewPos=fn.indexOf("kind:'review'");
const examPos=fn.indexOf("kind:'exam'");
const unlockPos=fn.indexOf("kind:'unlock'");
if([evidencePos,reviewPos,examPos,unlockPos].some(x=>x<0))throw new Error('Readiness target branches incomplete');
if(!(evidencePos<reviewPos&&reviewPos<examPos&&examPos<unlockPos))throw new Error('Readiness priority must be evidence > review > exam > unlock');

need(core,'row.missing[0]','Navigator must choose the first concrete missing evidence step');
need(core,'route:readinessStepRoute(row.id,step)','Evidence target must use exact lesson route');
need(core,'const due=arr(unlock.dueReviews)[0]','Review fallback must use real due Review Queue');
need(core,'const next=gateNextNeededType(part)','Exam fallback must use real gate requirement');
need(core,'function renderStageReadinessNavigator','Overview readiness navigator missing');
need(core,'READINESS NAVIGATOR','Navigator UI marker missing');
need(core,'renderStageReadinessNavigator()','Overview must render readiness navigator');
need(core,'if(r.reviewLesson)state.reviewLesson=r.reviewLesson','Route navigation must preserve exact review lesson');
need(core,'Đi đúng mục cần xử lý','Academic gate must expose exact repair navigation');

need(css,'.stage-readiness-navigator','Navigator styling missing');
need(css,'@media(max-width:760px)','Navigator responsive rule missing');

forbid(core,'readinessScore','Navigator must not invent readiness score');
forbid(core,'Math.random','Navigator must not choose blockers randomly');
forbid(core,'mastered:true','Navigator must not synthesize mastery');

console.log('RUSSIAN_STAGE_READINESS_NAVIGATOR_GATE=PASS');
console.log('Checks: deterministic evidence > review > exam > unlock priority, exact lesson routes, lesson-bound review, overview navigator, responsive UI, no synthetic score/mastery.');
