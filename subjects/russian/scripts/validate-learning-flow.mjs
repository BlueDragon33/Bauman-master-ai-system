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
for(const token of ["{step:'speaking',icon:'🎧',label:'Nghe'}","{step:'theory',icon:'👁️',label:'Nhận diện'}","{step:'alphabet',icon:'✍️',label:'Viết'}","{step:'exercises',icon:'📝',label:'Thực hành'}","{step:'check',icon:'✅',label:'Kiểm tra'}"])must(js.includes(token),`Lesson five-step presentation missing: ${token}`);
must(js.includes('LESSON_STEPPER.map(item=>'),'Lesson detail must render the learner-facing five-step presentation, not the seven-step evidence registry');
must(!js.includes('const rows=STEP_ORDER.map(step=>'),'Lesson detail must not expose support-only vocab/grammar as mandatory stepper gates');

must(!/status\s*:\s*['"]mastered['"]/.test(js),'Learning flow must not synthesize mastered status');
must(!/status\s*:\s*['"]completed['"]/.test(js),'Learning flow must not synthesize completed status');
must(!js.includes('masteryPercent'),'Learning flow must not invent mastery percentage');
must(js.includes("scope:'lesson'")&&js.includes("scope:'stage'"),'Learning flow must distinguish lesson-bound from stage-support sources');
must(js.includes("if(step==='speaking')return Number(s.ok||0)>0"),'Speaking evidence must require an explicit OK signal, not an open/attempt alone');
must(js.includes("if(step==='check')return Number(s.correct||0)>0&&!latestCheckNeedsReview(s)"),'Check evidence must reject unresolved later wrong answers');
must(!js.includes('RussianLearningState?.addReview'),'V2 review lifecycle must go through recordReviewResult');
must(js.includes("new CustomEvent('russian:mini-check',{detail:{lessonId}})"),'Lesson Check step must enter lesson-scoped Mini Check mode');
must(state.includes("resolveReview(key,'corrected'"),'Correct review result must resolve the queued item');
must(state.includes('const resumePosition=isResume?state.resume?.position:null'),'Resume navigation must snapshot saved position before route state changes');
must(state.includes('restoreResumePosition(resumePosition)'),'Resume navigation must restore the saved position snapshot');

must(js.includes("if((core.view||'overview')!=='learning')"),'Large lesson flow must be scoped to the canonical lesson view only');
must(!js.includes("['overview','storage','mindmap'].includes(core.view||'overview')"),'Broad cross-tab learning-flow renderer must not return');
must(!js.includes('ru-flow-foot'),'Lesson flow must not restore the legacy dashboard-like footer CTA');
must(js.includes('aria-current=')&&js.includes('aria-label="Tiến trình bài'),'Compact lesson stepper must expose accessible current-step/navigation semantics');
const compactHeight=css.match(/--ru-flow-compact-height:(\d+)px/);
must(compactHeight&&Number(compactHeight[1])>=56&&Number(compactHeight[1])<=80,'Lesson stepper target height must remain within 56–80px');
must(css.includes('max-height:80px')&&css.includes('box-sizing:border-box'),'Compact lesson stepper must remain physically bounded to 80px');

for(const token of ['.ru-lesson-flow','.ru-flow-steps','.ru-flow-step.review','@media (max-width:760px)','@media (max-width:430px)','prefers-reduced-motion'])must(css.includes(token),`Learning flow CSS missing: ${token}`);
for(const token of ['.ru-review-queue-preview','.ru-review-row','.ru-review-row-actions','.ru-review-empty'])must(stateCss.includes(token),`Learning state CSS missing: ${token}`);
must((css.match(/{/g)||[]).length===(css.match(/}/g)||[]).length,'Learning flow CSS brace imbalance');
must((stateCss.match(/{/g)||[]).length===(stateCss.match(/}/g)||[]).length,'Learning state CSS brace imbalance');

console.log('RUSSIAN_LEARNING_FLOW_RUNTIME_GATE=PASS');
console.log('Checks: V2 resume position, review lifecycle, evidence-only progress, lesson-only compact stepper (56–80px), responsive layout, no cross-tab flow duplication, no synthetic mastery.');
