import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const core=fs.readFileSync(path.join(root,'assets','core.js'),'utf8');
const need=(token,msg)=>{if(!core.includes(token))throw new Error(msg||`Missing token: ${token}`);};
const forbid=(token,msg)=>{if(core.includes(token))throw new Error(msg||`Forbidden token: ${token}`);};

need('function markScheduleTaskOpened','Schedule open state must be distinct from completion');
need("completed:prev.completed===true",'Opening a route must preserve, not synthesize, completion');
need("function markScheduleTask(step,s=planSession(),source='evidence_confirmation')",'Evidence-bound completion function missing');
need('if(!prev?.openedAt)return false','Schedule completion must require prior opening');
need("completionSource:source",'Completion provenance missing');
need('const evidence=scheduleTaskEvidence(step,s);if(!evidence.ok)return false','Completion must require post-open learning evidence');
need('function isScheduleTaskOpened','Opened-state query missing');
need("scheduleTaskRecord(step,s)?.completed===true",'Done state must require explicit completed=true');
need("markScheduleTaskOpened(Number(r.scheduleStep),planSession(),r)",'Today route click must record open only');
forbid("r.scheduleStep)markScheduleTask(Number(r.scheduleStep)",'Opening a route must not immediately complete it');
need('data-act="complete-schedule-step"','Explicit schedule completion control missing');
need("act==='complete-schedule-step'",'Explicit schedule completion handler missing');

need('function partDueReviewItems','Stage gate must inspect due Review Queue items');
need('RussianLearningState','Stage gate must use real Review Queue state');
need('.dueReviews()','Stage gate must use due-review lifecycle');
need('function gateUnlockStatus','Unified stage unlock status missing');
need('examComplete&&readiness.ok&&due.length===0','Stage unlock must require exams complete, lesson readiness and zero due reviews');
need('const g=gateState(),unlock=gateUnlockStatus()','Unlock action must enforce unified gate status');
need('data-learn="review"','Stage gate UI must preserve review navigation');
need("Bổ sung bằng chứng / xử lý ôn tập",'Stage gate UI must direct learner to repair evidence/review blockers');

forbid('mastered:true','Stage progression guard must not synthesize mastery');
console.log('RUSSIAN_STAGE_PROGRESSION_EVIDENCE_GATE=PASS');
console.log('Checks: open != complete, evidence-bound completion provenance, legacy open not trusted, lesson-readiness + due-review stage blockers, no synthetic mastery.');
