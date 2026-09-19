import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const must=(cond,msg)=>{if(!cond)throw new Error(msg)};
const index=read('index.html');
const js=read('assets/learning-flow.js');
const css=read('assets/learning-flow.css');

for(const ref of ['assets/learning-flow.css','assets/learning-flow.js'])must(index.includes(ref),`Missing L3 asset: ${ref}`);
must(index.indexOf('assets/learning-state.js')<index.indexOf('assets/learning-flow.js'),'Learning flow must load after canonical learning state');
must(index.indexOf('assets/learning-flow.js')<index.indexOf('assets/russian-reference-ui.js'),'Learning flow must load before reference UI enhancer');
new Function(js);
for(const token of ['RUSSIAN_LEARNING_FLOW_V1','data-ru-flow-step','reviewLesson','check-review',"provenance:'stage_support'",'RussianLearningState?.addReview','knowledge-index.json'])must(js.includes(token),`Learning flow missing contract: ${token}`);
for(const step of ['theory','speaking','vocab','grammar','exercises','check'])must(js.includes(`${step}:`),`Learning flow missing step: ${step}`);
must(!/status\s*:\s*['"]mastered['"]/.test(js),'Learning flow must not synthesize mastered status');
must(!/status\s*:\s*['"]completed['"]/.test(js),'Learning flow must not synthesize completed status');
must(!js.includes('masteryPercent'),'Learning flow must not invent mastery percentage');
must(js.includes("window.addEventListener('russian:speaking-recording-result'"),'Learning flow speaking evidence must come from recognition result');
must(!js.includes("['record-line','speak-line','speak-line-slow','speak-dialogue']"),'Listening/recorder clicks must not count as speaking attempts');
must(!/act==='mark-line-ok'[^\n]*attempts/.test(js),'Manual self-assessment must not count as speaking attempt');
must(js.includes('selfAssessments'),'Manual speaking self-assessment must stay separate from recognition evidence');
must(js.includes("scope:'lesson'")&&js.includes("scope:'stage'"),'Learning flow must distinguish lesson-bound from stage-support sources');
for(const token of ['.ru-lesson-flow','.ru-flow-steps','.ru-flow-step.review','@media (max-width:760px)','@media (max-width:430px)','prefers-reduced-motion'])must(css.includes(token),`Learning flow CSS missing: ${token}`);
must((css.match(/{/g)||[]).length===(css.match(/}/g)||[]).length,'Learning flow CSS brace imbalance');
console.log('RUSSIAN_LEARNING_FLOW_RUNTIME_GATE=PASS');
console.log('Checks: additive orchestration, truthful provenance, real-action evidence, lesson-filtered review, responsive layout, no synthetic mastery.');
