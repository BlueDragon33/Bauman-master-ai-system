import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const core=fs.readFileSync(path.join(root,'assets','core.js'),'utf8');
const flow=fs.readFileSync(path.join(root,'assets','learning-flow.js'),'utf8');

new Function(core);
new Function(flow);

const need=(text,token,msg)=>{if(!text.includes(token))throw new Error(msg||`Missing token: ${token}`);};
const forbid=(text,token,msg)=>{if(text.includes(token))throw new Error(msg||`Forbidden token: ${token}`);};

need(core,'function scheduleEvidenceProfile','Route evidence profile missing');
need(core,"if(view==='media')return 'media_output'",'Media must use truthful output evidence');
need(core,"if(view==='dialogue'||(view==='learning'&&tab==='practice'))return 'speaking'",'Dialogue/practice speaking profile missing');
need(core,"if(view==='vocab')return 'vocab'",'Vocab evidence profile missing');
need(core,"if(view==='grammar')return 'grammar'",'Grammar evidence profile missing');
need(core,"if(view==='writing')return 'writing'",'Writing evidence profile missing');
need(core,"if(view==='learning'&&tab==='theory')return 'theory'",'Theory evidence profile missing');
need(core,"if(view==='learning'&&tab==='exercises')return 'exercises'",'Exercise evidence profile missing');
need(core,"if(view==='learning'&&(tab==='review'||tab==='exam'))return 'check'",'Check evidence profile missing');

need(core,'function scheduleEvidenceSnapshot','Evidence baseline snapshot missing');
need(core,'evidenceBaseline=prev.evidenceBaseline||scheduleEvidenceSnapshot(routeCopy)','Baseline must be captured on first schedule open');
need(core,'function scheduleTaskEvidence','Evidence verification function missing');
need(core,"if(profile==='media_output')",'Media evidence branch missing');
need(core,'speechEvidenceTotal()','Media completion must require speaking output evidence');
need(core,"Video/audio nhúng không cung cấp bằng chứng xem đáng tin cậy",'Truthful iframe limitation disclosure missing');
need(core,'value>baseline&&noDue','Learning evidence must exceed open-time baseline');
need(core,'const evidence=scheduleTaskEvidence(step,s);if(!evidence.ok)return false','Completion must reject missing evidence');
need(core,"completionSource:source,evidenceResult:evidence",'Completion provenance/result missing');
need(core,"evidence?.ok?'':'disabled'",'Completion UI must be disabled without evidence');
need(core,'Xác nhận bằng chứng & hoàn thành','Evidence-aware completion wording missing');

need(core,'lessonId:routeLessonId','Schedule route must carry lesson identity');
need(core,'if(r.lessonId)state.lessonId=r.lessonId','Schedule navigation must restore lesson identity');

need(flow,"const speakingSurface=(core.view==='learning'&&core.learnTab==='practice')||core.view==='dialogue';",'Dialogue speaking evidence capture missing');
need(flow,"lastSurface:core.view==='dialogue'?'dialogue':'practice'",'Speaking evidence provenance missing');

forbid(core,'mediaPlayed=true','Do not synthesize media playback');
forbid(core,'iframePlayed','Do not pretend iframe playback is observable');
forbid(core,'mastered:true','Evidence-bound completion must not synthesize mastery');
forbid(flow,'Math.random','Learning evidence must not use synthetic randomness');

console.log('RUSSIAN_EVIDENCE_BOUND_COMPLETION_GATE=PASS');
console.log('Checks: route-specific evidence profiles, open-time baselines, lesson identity, truthful media output, dialogue evidence, disabled completion without evidence, no synthetic mastery.');
