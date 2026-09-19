import fs from 'node:fs';

const recognition=fs.readFileSync('subjects/russian/assets/handwriting-recognition.js','utf8');
const flow=fs.readFileSync('subjects/russian/assets/learning-flow.js','utf8');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const sw=fs.readFileSync('subjects/russian/sw.js','utf8');
const css=fs.readFileSync('subjects/russian/assets/core.css','utf8');
const preview=fs.readFileSync('scripts/prepare-cloudflare-preview.mjs','utf8');
const site=fs.readFileSync('scripts/prepare-chatgpt-site.mjs','utf8');

const checks=[
  ['schema exists', recognition.includes("RUSSIAN_HANDWRITING_RECOGNITION_V1")],
  ['capability fail-closed', recognition.includes("mode:available?'local-script-font':'reference-only'") && recognition.includes("if(!cap.canScore||!alphabet.length)return false")],
  ['Cyrillic metric probe exists', recognition.includes("PROBE='ДдЖжФфЯяШш'") && recognition.includes('Math.abs(candidate-baseline)>0.5')],
  ['no remote font/runtime dependency', !/https?:\/\//i.test(recognition)],
  ['local handwriting source only', recognition.includes("fetch('data/handwriting.json')")],
  ['no translation answer fields', !recognition.includes('.vi') && !recognition.includes('meaning')],
  ['no mastery/completed write', !recognition.includes('mastery') && !recognition.includes('completed')],
  ['wrong recognition enters review queue', recognition.includes("'handwriting_recognition_miss'") && recognition.includes("addReview?.('handwriting:'")],
  ['exact writing resume route retained', recognition.includes("view:'writing',handwritingIndex:Number(q.item.__sourceIndex??q.index)||0,handwritingStep:0")],
  ['recognition evidence cannot replace handwriting stroke evidence', flow.includes("if(step==='alphabet')return Number(s.strokeActions||0)>0")],
  ['runtime loaded after learning flow', index.indexOf('assets/handwriting-recognition.js')>index.indexOf('assets/learning-flow.js')],
  ['offline shell contains runtime', sw.includes("'./assets/handwriting-recognition.js'")],
  ['Cloudflare package requires runtime', preview.includes("'subjects/russian/assets/handwriting-recognition.js'") && preview.includes('handwriting recognition script reference')],
  ['ChatGPT Site package requires runtime', site.includes("'subjects/russian/assets/handwriting-recognition.js'") && site.includes('handwriting recognition script reference')],
  ['responsive recognition layout exists', css.includes('.ru-handwriting-recognition') && css.includes('@media(max-width:720px)')],
  ['idempotent MutationObserver render guard exists', recognition.includes('dataset.renderSig') && recognition.includes('banner.dataset.renderSig!==capSig') && recognition.includes('box.dataset.renderSig!==drillSig')],
  ['weak-letter recovery requires two consecutive correct confirmations', recognition.includes('profile.correctStreak>=2') && recognition.includes('REVIEW_DELAY_MS=10*60*1000')],
  ['first recovery confirmation remains scheduled in Review Queue', recognition.includes("correct?'handwriting_recognition_confirm':'handwriting_recognition_miss'") && recognition.includes('profile.dueAt||stamp')],
  ['due weak letters are prioritized over sequential questions', recognition.includes("source:dueIndex>=0?'review_due':'sequence'") && recognition.includes('dueWeakIds(state)[0]')],
  ['resolved weak letters are removed without mastery writes', recognition.includes('delete state.weak[letterId]') && recognition.includes('removeReview?.(reviewId)') && !recognition.includes('mastery') && !recognition.includes('completed')]
];

const failed=checks.filter(([,ok])=>!ok);
for(const [name,ok] of checks)console.log(`${ok?'PASS':'FAIL'} · ${name}`);
if(failed.length){console.error(`R-HW1 audit failed: ${failed.length} check(s)`);process.exit(1);}
console.log('RUSSIAN_HANDWRITING_RECOGNITION_AUDIT=PASS');