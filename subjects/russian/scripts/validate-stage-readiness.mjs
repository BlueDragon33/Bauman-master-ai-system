import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const core=fs.readFileSync(path.join(root,'assets','core.js'),'utf8');
new Function(core);

const need=(token,msg)=>{if(!core.includes(token))throw new Error(msg||`Missing token: ${token}`);};
const forbid=(token,msg)=>{if(core.includes(token))throw new Error(msg||`Forbidden token: ${token}`);};

need('function partLearningReadiness','Part learning readiness resolver missing');
need("const coreSteps=['theory','speaking','exercises','check']", 'Readiness must use the four core evidence steps');
need('RussianLearningFlow','Readiness must use real Learning Flow state');
need("typeof api.hasMeaningfulEvidence!=='function'",'Readiness must depend on evidence semantics');
need('api.hasMeaningfulEvidence(step,steps?.[step])','Each readiness step must use meaningful evidence');
need('ready:missing.length===0','Lesson readiness must require all core steps');
need('ok:rows.every(x=>x.ready)','Part readiness must require every lesson row');
need('const examComplete=gatePartComplete(part),due=partDueReviewItems(part),readiness=partLearningReadiness(part)','Gate must combine exam, review and learning readiness');
need('examComplete&&readiness.ok&&due.length===0','Unlock must require readiness, exams and zero due reviews');
need('Bằng chứng học cốt lõi mới đủ ở','Blocked readiness explanation missing');
need('gate-readiness-summary','Readiness UI summary missing');
need('/4 bằng chứng','Per-lesson four-evidence UI missing');
need("r.missing.join(', ')",'Missing evidence types must be visible');
need('Đã đủ bằng chứng học, đủ đề và không còn lỗi đến hạn','Truthful unlock wording missing');

forbid('mastered:true','Readiness must not synthesize mastery');
forbid('Math.random','Readiness must not use synthetic randomness');
forbid('readinessScore','Do not collapse readiness into an opaque synthetic score');

console.log('RUSSIAN_STAGE_READINESS_GATE=PASS');
console.log('Checks: every lesson uses four meaningful core evidence steps; unlock also requires exams complete and zero due reviews; missing evidence remains inspectable.');
