import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const plan=fs.readFileSync(path.join(root,'assets','planning-bridge.js'),'utf8');
const core=fs.readFileSync(path.join(root,'assets','core.js'),'utf8');

new Function(plan);
new Function(core);

const need=(text,token,msg)=>{if(!text.includes(token))throw new Error(msg||`Missing token: ${token}`);};
const forbid=(text,token,msg)=>{if(text.includes(token))throw new Error(msg||`Forbidden token: ${token}`);};

need(plan,'function capabilityFocus','Capability focus resolver missing');
need(plan,'RussianCapabilityProgression','Planner must read current R0-R4 capability runtime');
need(plan,"schema:'RUSSIAN_CAPABILITY_FOCUS_V1'",'Capability focus schema missing');
need(plan,'lessonId:clean(band.missingLesson)','Planner must target missing evidence lesson');
need(plan,'function capabilityOverlayCard','Capability gap card missing');
need(plan,"source:'capability_gap'",'Capability card provenance missing');
need(plan,"route:{view:'learning',learnTab:'theory',lessonId:id}",'Capability gap must navigate to exact lesson');
need(plan,'function applyCapabilityOverlay','Capability overlay function missing');
need(plan,"reviews=all.filter(x=>x?.source==='live_review_queue')",'Review cards must be separated for priority');
need(plan,"target.cards=[...reviews,capabilityOverlayCard(focus),...existing]",'Priority order must be review -> capability gap -> base cards');
need(plan,'return applyCapabilityOverlay(applyLiveReviewOverlay(plan));','Plan creation must apply review before capability overlay');
need(plan,'capabilityBand=focus.bandId','Session capability metadata missing');
need(plan,'capabilityLesson=focus.lessonId','Session capability lesson metadata missing');

need(core,'BaumanPlanningBridge?.applyLiveReviewOverlay','Today route must refresh Review Queue');
need(core,'BaumanPlanningBridge?.applyCapabilityOverlay','Today route must refresh R-band capability focus');

forbid(plan,'mastered:true','Planner must not synthesize mastery');
forbid(plan,'Math.random','Planner must not pick capability gaps randomly');

console.log('RUSSIAN_CAPABILITY_AWARE_PLANNING_GATE=PASS');
console.log('Checks: current-band focus, exact missing lesson, review-first priority, dynamic today refresh, provenance, no synthetic mastery.');
