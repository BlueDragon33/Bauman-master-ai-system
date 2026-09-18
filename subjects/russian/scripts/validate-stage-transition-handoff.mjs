import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const core=fs.readFileSync(path.join(root,'assets','core.js'),'utf8');
const state=fs.readFileSync(path.join(root,'assets','learning-state.js'),'utf8');
new Function(core);
new Function(state);

const need=(text,token,msg)=>{if(!text.includes(token))throw new Error(msg||`Missing token: ${token}`);};
const forbid=(text,token,msg)=>{if(text.includes(token))throw new Error(msg||`Forbidden token: ${token}`);};

need(core,"stageTransitions:[],lastStageTransition:null",'Transition ledger defaults missing');
need(core,"state.stageTransitions=arr(state.stageTransitions).filter(x=>x&&x.schema==='RUSSIAN_STAGE_TRANSITION_V1').slice(-30)",'Transition ledger must sanitize and cap history');
need(core,'function stageTransitionSnapshot','Transition snapshot builder missing');
need(core,"schema:'RUSSIAN_STAGE_TRANSITION_V1'",'Transition schema missing');
need(core,"reviewDue:arr(unlock.dueReviews).length",'Transition must snapshot due-review count');
need(core,'examComplete:!!unlock.examComplete','Transition must snapshot exam gate state');
need(core,'readinessComplete:!!unlock.readiness?.ok','Transition must snapshot readiness gate state');
need(core,'exams,','Transition must include exam requirements');
need(core,'lessons:readiness','Transition must include per-lesson evidence readiness');
need(core,"if(!unlock?.allowed)return null",'Transition snapshot must only exist after validated gate');
need(core,'function recordStageTransition','Transition ledger writer missing');
need(core,'slice(-30)','Transition history must remain bounded');
need(core,'function handoffStageTransition','Host handoff missing');
need(core,"type:'BAUMAN_SUBJECT_STAGE_TRANSITION'",'Host transition envelope missing');
need(core,"subjectId:A.id||'russian'",'Host transition subject identity missing');
need(core,"window.BaumanSubjectHost?.send?.(payload)",'Host handoff must be optional/offline-safe');
need(core,"new CustomEvent('russian:stage-transition'",'Local transition event missing');

const partSnapshot=core.indexOf("stageTransitionSnapshot('part_unlock'");
const partMutation=core.indexOf('g.currentPart=nextPart');
if(partSnapshot<0||partMutation<0||partSnapshot>partMutation)throw new Error('Part transition snapshot must be captured before part mutation');
const stageSnapshot=core.indexOf("stageTransitionSnapshot('stage_unlock'");
const stageMutation=core.indexOf('state.stage=nextStage');
if(stageSnapshot<0||stageMutation<0||stageSnapshot>stageMutation)throw new Error('Stage transition snapshot must be captured before stage mutation');
need(core,'recordStageTransition(transition); save(); handoffStageTransition(transition)','Transition must persist before host handoff');

need(state,"core.lastStageTransition?.schema==='RUSSIAN_STAGE_TRANSITION_V1'",'Learning-state progress must read validated latest transition');
need(state,'stageTransition:transition','Host progress must expose latest transition');
need(state,'stageTransitionCount:Array.isArray(core.stageTransitions)?core.stageTransitions.length:0','Host progress must expose bounded history count');
need(state,"window.addEventListener('russian:stage-transition',publish)",'Transition event must refresh host progress');

forbid(core,'transitionScore','Do not create synthetic transition score');
forbid(core,'readinessScore','Do not collapse readiness into synthetic score');
forbid(core,"status:'mastered'",'Transition handoff must not synthesize mastery');
forbid(core,'mastered:true','Transition handoff must not synthesize mastery');

console.log('RUSSIAN_STAGE_TRANSITION_HANDOFF_GATE=PASS');
console.log('Checks: pre-mutation evidence snapshot, bounded local ledger, exam/readiness/review provenance, optional host handoff, host progress refresh, no synthetic mastery score.');
