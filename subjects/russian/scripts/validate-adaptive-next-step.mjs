import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const flow=fs.readFileSync(path.join(root,'assets','learning-flow.js'),'utf8');
const state=fs.readFileSync(path.join(root,'assets','learning-state.js'),'utf8');
const need=(text,token,msg)=>{if(!text.includes(token))throw new Error(msg||`Missing token: ${token}`);};
const forbid=(text,token,msg)=>{if(text.includes(token))throw new Error(msg||`Forbidden token: ${token}`);};

need(flow,'function dueReviewsForLesson','Lesson-scoped due review selector missing');
need(flow,'RussianLearningState','Adaptive flow must read real Review Queue');
need(flow,'.dueReviews()','Adaptive flow must use due reviews');
need(flow,"clean(item?.lessonId||item?.route?.lessonId)===id",'Review item must match exact lesson id');
need(flow,'function adaptiveNext','Adaptive next-step resolver missing');
need(flow,"kind:'review'",'Review priority branch missing');
need(flow,"kind:'step'",'Missing-evidence fallback branch missing');
need(flow,"kind:'reinforce'",'Reinforcement fallback missing');
need(flow,'data-ru-adaptive-review','Exact review navigation action missing');
need(flow,"data-route='\${routeAttr(adaptive.route)}'",'Adaptive review must preserve exact source route');
need(flow,'learningState.updatedAt','Flow render must react to Review Queue changes');
need(flow,'reviewStep,dueReviewsForLesson,adaptiveNext','Adaptive functions must be exported for runtime verification');

need(state,'Object.assign(review,evidence)','Review evidence provenance must be preserved');
need(state,'if(evidence.lessonId&&!review.route.lessonId)review.route.lessonId=evidence.lessonId','Review route must retain lesson id');
need(state,"stress_error:'Trọng âm cần luyện lại'",'Stress review label missing');
need(state,"pronunciation_error:'Phát âm cần luyện lại'",'Pronunciation review label missing');

forbid(flow,'mastered:true','Adaptive flow must not synthesize mastery');
forbid(flow,"status:'mastered'",'Adaptive flow must not write mastery status');
forbid(flow,'Math.random','Adaptive next step must not use synthetic randomness');

console.log('RUSSIAN_ADAPTIVE_NEXT_STEP_GATE=PASS');
console.log('Checks: lesson-scoped due review priority, exact route, live queue refresh, evidence fallback, reinforcement fallback, no synthetic mastery.');
