import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const must=(cond,msg)=>{if(!cond)throw new Error(msg)};
const index=read('index.html');
const js=read('assets/learning-flow.js');
const state=read('assets/learning-state.js');
const css=read('assets/learning-flow.css');
const stateCss=read('assets/learning-state.css');

for(const ref of ['assets/learning-state.css','assets/learning-flow.css','assets/learning-state.js','assets/learning-flow.js'])must(index.includes(ref),`Missing learning runtime asset: ${ref}`);
must(index.indexOf('assets/learning-state.js')<index.indexOf('assets/learning-flow.js'),'Learning flow must load after canonical learning state');
must(index.indexOf('assets/learning-flow.js')<index.indexOf('assets/russian-future-ui.js'),'Learning flow must load before canonical Future UI enhancer');
new Function(js);
new Function(state);

for(const token of ['RUSSIAN_LEARNING_FLOW_V2','CORE_STEPS','hasMeaningfulEvidence','data-ru-flow-step','reviewLesson','check-review',"provenance:'stage_support'",'RussianLearningState?.recordReviewResult','knowledge-index.json'])must(js.includes(token),`Learning flow missing V2 contract: ${token}`);
for(const token of ['RUSSIAN_LEARNING_STATE_V2','reviewHistory','capturePosition','restoreResumePosition','recordReviewResult','resolveReview','snoozeReview','data-ru-review-snooze'])must(state.includes(token),`Learning state missing V2 contract: ${token}`);
for(const step of ['theory','speaking','vocab','grammar','exercises','check'])must(js.includes(`${step}:`),`Learning flow missing step: ${step}`);
for(const step of ['theory','speaking','exercises','check'])must(js.includes(`'${step}'`),`Learning flow missing core evidence step: ${step}`);

must(!/status\s*:\s*['"]mastered['"]/.test(js),'Learning flow must not synthesize mastered status');
must(!/status\s*:\s*['"]completed['"]/.test(js),'Learning flow must not synthesize completed status');
must(!js.includes('masteryPercent'),'Learning flow must not invent mastery percentage');
must(js.includes("scope:'lesson'")&&js.includes("scope:'stage'"),'Learning flow must distinguish lesson-bound from stage-support sources');
must(js.includes("if(step==='speaking')return Number(s.ok||0)>0"),'Speaking evidence must require an explicit OK signal, not an open/attempt alone');
must(js.includes("if(step==='check')return Number(s.correct||0)>0&&!latestCheckNeedsReview(s)"),'Check evidence must reject unresolved later wrong answers');
must(!js.includes('RussianLearningState?.addReview'),'V2 review lifecycle must go through recordReviewResult');
must(state.includes("resolveReview(key,'corrected'"),'Correct review result must resolve the queued item');
must(state.includes('const resumePosition=isResume?state.resume?.position:null'),'Resume navigation must snapshot saved position before route state changes');
must(state.includes('restoreResumePosition(resumePosition)'),'Resume navigation must restore the saved position snapshot');

for(const token of ['.ru-lesson-flow','.ru-flow-steps','.ru-flow-step.review','@media (max-width:760px)','@media (max-width:430px)','prefers-reduced-motion'])must(css.includes(token),`Learning flow CSS missing: ${token}`);
for(const token of ['.ru-review-queue-preview','.ru-review-row','.ru-review-row-actions','.ru-review-empty'])must(stateCss.includes(token),`Learning state CSS missing: ${token}`);
must((css.match(/{/g)||[]).length===(css.match(/}/g)||[]).length,'Learning flow CSS brace imbalance');
must((stateCss.match(/{/g)||[]).length===(stateCss.match(/}/g)||[]).length,'Learning state CSS brace imbalance');

console.log('RUSSIAN_LEARNING_FLOW_RUNTIME_GATE=PASS');
console.log('Checks: V2 resume position, review lifecycle, evidence-only progress, stage-support provenance, lesson-filtered review, responsive layout, no synthetic mastery.');
