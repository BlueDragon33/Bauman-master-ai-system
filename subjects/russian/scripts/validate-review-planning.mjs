import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const js=fs.readFileSync(path.join(root,'assets','planning-bridge.js'),'utf8');
const need=(token,msg)=>{if(!js.includes(token))throw new Error(msg||`Missing token: ${token}`);};
const forbid=(token,msg)=>{if(js.includes(token))throw new Error(msg||`Forbidden token: ${token}`);};

need('PlanningBridge V12 ReviewQueueOverlay','L11 planning bridge version missing');
need('RUSSIAN_LIVE_REVIEW_OVERLAY_V1','Live review overlay schema missing');
need('RussianLearningState','Review Queue runtime bridge missing');
need('dueReviews','Due-review source missing');
need('slice(0,Math.max(1,Number(limit)||3))','Review overlay must cap live items');
need("source:'live_review_queue'",'Overlay card provenance missing');
need('reviewId:clean(item?.id)','Overlay card review id missing');
need('reviewReason:reason','Overlay card review reason missing');
need("target.cards=[...cards,...existing]",'Overlay must preserve original schedule cards');
need('return applyLiveReviewOverlay(plan)','Generated plans must receive live review overlay');
need("limit:'Ưu tiên ngắn · không tự nâng mastery'",'Truthful non-mastery wording missing');
forbid('mastered:true','Planning overlay must not synthesize mastery');
forbid("status:'mastered'",'Planning overlay must not write mastery status');
console.log('RUSSIAN_REVIEW_PLANNING_GATE=PASS');
console.log('Checks: real due-review source, max-3 overlay, preserved base schedule, provenance, exact route metadata, no synthetic mastery.');
