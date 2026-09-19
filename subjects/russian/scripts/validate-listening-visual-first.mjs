import fs from 'node:fs';

const flow=fs.readFileSync('subjects/russian/assets/learning-flow.js','utf8');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');

const checks=[
  ['listening/speaking is first learning step', flow.includes("const STEP_ORDER=['speaking','alphabet','theory','vocab','grammar','exercises','check'];")],
  ['alphabet handwriting follows listening/speaking', flow.includes("alphabet:{icon:'✍️',label:'Chữ cái & viết tay'")],
  ['alphabet route opens writing surface', flow.includes("else if(step==='alphabet')click('[data-view=\"writing\"]');")],
  ['flow evidence denominator follows seven-step order', flow.includes('<b>${evidence}/${STEP_ORDER.length}</b>')],
  ['writing evidence is limited to writing interactions', flow.includes("core.view==='writing'&&(['next-hand','prev-hand','open-hand-grid'") && !flow.includes("||target.closest?.('#writingCanvas')||")],
  ['canvas evidence requires an actual stroke gesture', flow.includes("writingStrokeActive=true;writingStrokeMoved=false") && flow.includes("provenance:'print_to_cursive_stroke'")],
  ['Vietnam visual-first vocab ignores direct English/Vietnamese gloss in display meaning', core.includes("const meaning=str(base.meaningRu||v?.meaning_ru||'').trim()||str(base.visualLabel||v?.illustration_label_ru||'').trim()")],
  ['vocab UI uses contextual hint wording', core.includes("Lật gợi ý") && core.includes("Hiểu qua ngữ cảnh")],
  ['vocab detail labels Russian explanation', core.includes("Giải thích tiếng Nga")],
  ['AI vocab helper does not expose English equivalent', !core.includes('English equivalent:')],
  ['legacy direct flip label removed', !core.includes('Lật nghĩa')]
];

const failed=checks.filter(([,ok])=>!ok);
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} · ${name}`);
if(failed.length){
  console.error(`Russian listening/visual-first contract failed: ${failed.length} check(s)`);
  process.exit(1);
}
console.log('Russian listening/visual-first contract PASS');
