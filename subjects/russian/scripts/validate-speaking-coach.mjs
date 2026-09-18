import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const js=fs.readFileSync(path.join(root,'assets','speaking-coach.js'),'utf8');
const css=fs.readFileSync(path.join(root,'assets','speaking-coach.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const need=(text,token,msg)=>{if(!text.includes(token))throw new Error(msg||('Missing token: '+token));};
const forbid=(text,token,msg)=>{if(text.includes(token))throw new Error(msg||('Forbidden token: '+token));};

need(js,'RUSSIAN_SPEAKING_COACH_V1','Missing speaking coach schema');
need(js,"const STAGES=['imitation','shadowing','memory','roleplay','repair']",'Unified speaking stage order missing');
need(js,"'pronunciation_error'",'Pronunciation review reason missing');
need(js,"'abandoned'",'Abandoned speaking review reason missing');
need(js,'function startImitation()','Imitation stage missing');
need(js,'function startShadow()','Shadowing stage missing');
need(js,'function startMemory()','Memory speaking stage missing');
need(js,'function startRoleplay(role)','Role-play stage missing');
need(js,'function startRepair()','Repair stage missing');
need(js,'[data-act="','Core action bridge missing');
need(js,'RussianLearningState?.addReview','Review Queue bridge missing');
need(js,'RussianLearningFlow?.touch','Learning Flow evidence bridge missing');
need(js,"act==='mark-line-ok'",'Explicit learner OK signal missing');
need(js,"if(mode==='roleplay')bump('roleplayAttempts'",'Role-play evidence must come from recorder use');
need(js,'Không thay đổi mastery','Truthful mastery wording missing');
need(css,'.ru-speaking-memory-mode','Memory masking style missing');
need(css,'.russian-line','Memory mode must hide actual Russian line');
need(css,'@media(max-width:760px)','Phone responsive breakpoint missing');
need(html,'assets/speaking-coach.css','Speaking coach CSS not loaded');
need(html,'assets/speaking-coach.js','Speaking coach JS not loaded');
need(html,'assets/listening-ladder.js','Listening ladder JS not loaded');

const flowPos=html.indexOf('assets/learning-flow.js');
const ladderPos=html.indexOf('assets/listening-ladder.js');
const coachPos=html.indexOf('assets/speaking-coach.js');
const uiPos=html.indexOf('assets/russian-reference-ui.js');
if(!(flowPos>=0&&ladderPos>flowPos&&coachPos>ladderPos&&uiPos>coachPos)){
  throw new Error('Load order must be learning flow → listening ladder → speaking coach → reference UI');
}

forbid(js,'Listening ladder','Speaking coach must not duplicate Turn 8 listening ownership');
forbid(js,'startListening(','Speaking coach must not own a second listening flow');
forbid(js,'Math.random','Synthetic random evidence is forbidden');
forbid(js,'score>=','Do not auto-classify pronunciation from similarity score');
forbid(js,'score >','Do not auto-classify pronunciation from similarity score');
forbid(js,'mastered:true','Speaking coach must not write mastery');
forbid(js,"status:'mastered'",'Speaking coach must not write mastery');

console.log('RUSSIAN_SPEAKING_COACH_RUNTIME_GATE=PASS');
console.log('Checks: imitation, shadowing, memory speaking, recorder-backed role-play, explicit repair, abandoned-session review, Turn 8 listening ownership, no synthetic mastery or score threshold.');
