import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fail=m=>{throw new Error(m)};
const must=(cond,m)=>{if(!cond)fail(m)};
const index=read('index.html');
const js=read('assets/vocab-srs.js');
const css=read('assets/vocab-srs.css');
const learningState=read('assets/learning-state.js');
const audit=read('scripts/audit-vocab-srs.mjs');

must(index.includes('assets/vocab-srs.css'),'Missing vocab SRS CSS');
must(index.includes('assets/vocab-srs.js'),'Missing vocab SRS runtime');
must(index.indexOf('assets/learning-state.js')<index.indexOf('assets/vocab-srs.js'),'Vocab SRS must load after canonical learning state');
must(index.indexOf('assets/content-contract.js')<index.indexOf('assets/vocab-srs.js'),'Vocab SRS must load after content contract');
new Function(js);

for(const token of [
  "RUSSIAN_VOCAB_SRS_V1",
  "planningPolicy?.reviewGaps",
  "srs_forgot",
  "srs_unsure",
  "srs_scheduled_recall",
  "source:'vocab.example'",
  "source:'user_sentence'",
  "vocabulary_seed_ru",
  "Không có exact seed match",
  "không phải xác nhận đã thuộc",
  "abandoned",
  "RussianLearningState?.addReview",
  "RussianLearningFlow?.touch",
  "window.RussianVocabSrs",
  "const FLOW=['discover','recognize','listen','speak','recall','write','review']",
  "Nhìn hình → chọn từ",
  "Nghe → chọn từ",
  "Hình → nhớ lại từ",
  "Nghe → viết",
  "exposedAt",
  "Thẻ này chưa được học",
  "data-ru-vocab-mode",
  "data-ru-vocab-check",
  "data-ru-vocab-play-slow"
]) must(js.includes(token),`Missing vocab SRS contract token: ${token}`);

must(!/status\s*:\s*['\"]mastered['\"]/.test(js),'Vocab SRS must never synthesize mastered state');
must(!/status\s*:\s*['\"]completed['\"]/.test(js),'Vocab SRS must never synthesize completed state');
must(!js.includes('Math.random'),'Vocab SRS must not generate random mastery/review evidence');
must(!js.includes('new MutationObserver'),'Vocab learning flow must use the canonical UI observer, not create another observer');
must(js.includes('refresh:scheduleRender'),'Vocab learning flow must expose an idempotent refresh hook');
must(js.includes('if(panel.innerHTML!==html)panel.innerHTML=html'),'Vocab refresh must not rewrite an already-stable panel');
must(js.includes("speak-vocab-slow"),'Vocabulary flow must reuse the canonical slow-audio action');
must(js.includes('aria-current="${mode===x?\'step\':\'false\'}"'),'Vocabulary learning steps must expose aria-current');
must(!js.includes('meaning:clean(n.meaningVi||n.english||n.meaningRu)'),'Sentence Mining must not restore Vietnamese/English glosses into the learning surface');
must(js.includes("meaning:clean(n.meaningRu||'')"),'Source sentence mining may retain Russian-only context');
must(!js.includes('includes(tag)'),'Vocab speaking bridge must not infer links by tag matching');
must(js.includes("lower(x)===term"),'Speaking bridge must use exact vocabulary seed matching');
must(js.includes("lower(sentence)===lower(term)"),'Sentence mining must reject source examples that only repeat the term');
must(js.includes("/[А-Яа-яЁё]/"),'User-mined sentence must retain Cyrillic guard');
must(js.includes("fetch('data/speaking.json'"),'Speaking bridge must be explicit/lazy rather than synthetic');
must(js.indexOf("fetch('data/speaking.json'")>js.indexOf('async function loadSpeaking'),'Speaking data fetch must live in the lazy loader');

must(learningState.includes('function addReview(id,reason,route,label,dueAt)'),'Canonical review queue must accept a due date');
must(learningState.includes('scheduledAt:now()'),'Canonical review queue must retain scheduling evidence');
must(learningState.includes('Date.parse(dueAt)'),'Canonical review queue must validate scheduled due dates');

for(const token of ['.ru-vocab-srs','.ru-vocab-rating','.ru-vocab-mining','.ru-vocab-speaking-bridge','.ru-vocab-flow-nav','.ru-vocab-choice-grid','data-vocab-flow="recognize"','data-vocab-flow="listen"','data-vocab-flow="recall"','data-vocab-flow="write"','@media (max-width:1080px)','@media (max-width:760px)','@media (max-width:480px)'])must(css.includes(token),`Missing vocab SRS CSS contract: ${token}`);
must((css.match(/{/g)||[]).length===(css.match(/}/g)||[]).length,'Vocab SRS CSS brace imbalance');

for(const token of ['exampleDistinct','vocabSeedExact','configuredReviewGaps','duplicateIds'])must(audit.includes(token),`Vocab SRS audit missing evidence: ${token}`);

console.log('RUSSIAN_VOCAB_SRS_RUNTIME_GATE=PASS');
console.log('Checks: explicit recall ratings, scheduled due dates, no synthetic mastery, truthful sentence mining, exact-seed speaking bridge, responsive UI.');
