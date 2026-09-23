import fs from 'node:fs';

const flow=fs.readFileSync('subjects/russian/assets/learning-flow.js','utf8');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const handwriting=JSON.parse(fs.readFileSync('subjects/russian/data/handwriting.json','utf8'));
const alphabet=handwriting.filter(x=>x?.mode==='alphabet');
const glyphAuthority=fs.readFileSync('subjects/russian/assets/handwriting-glyph-authority.js','utf8');
const recognition=fs.readFileSync('subjects/russian/assets/handwriting-recognition.js','utf8');
const russianIndex=fs.readFileSync('subjects/russian/index.html','utf8');
const serviceWorker=fs.readFileSync('subjects/russian/sw.js','utf8');

const checks=[
  ['V2 adaptive flow schema is preserved', flow.includes("const SCHEMA='RUSSIAN_LEARNING_FLOW_V2';") && flow.includes("const LEGACY_SCHEMA='RUSSIAN_LEARNING_FLOW_V1';")],
  ['listening/speaking is first learning step', flow.includes("const STEP_ORDER=['speaking','alphabet','theory','vocab','grammar','exercises','check'];")],
  ['alphabet handwriting follows listening/speaking', flow.includes("alphabet:{icon:'✍️',label:'Chữ cái & viết tay'")],
  ['alphabet route opens writing surface', flow.includes("else if(step==='alphabet')click('[data-view=\"writing\"]');")],
  ['seven-step learning surface remains explicit', flow.includes("const STEP_ORDER=['speaking','alphabet','theory','vocab','grammar','exercises','check'];")],
  ['five-step core progression excludes support-only vocab and grammar', flow.includes("const CORE_STEPS=['speaking','alphabet','theory','exercises','check'];")],
  ['flow evidence denominator follows five-step core progression', flow.includes('${evidence}/${CORE_STEPS.length}')],
  ['writing evidence is limited to writing interactions', flow.includes("core.view==='writing'&&(['next-hand','prev-hand','open-hand-grid'") && !flow.includes("||target.closest?.('#writingCanvas')||")],
  ['canvas evidence requires an actual stroke gesture', flow.includes("writingStrokeActive=true;writingStrokeMoved=false") && flow.includes("provenance:'print_to_cursive_stroke'")],
  ['next-step suggestion requires meaningful evidence rather than navigation-only state', flow.includes("function hasMeaningfulEvidence(step,s)") && flow.includes("if(!hasMeaningfulEvidence(step,ls?.steps?.[step]))return step")],
  ['alphabet progression requires real canvas stroke evidence', flow.includes("if(step==='alphabet')return Number(s.strokeActions||0)>0") && flow.includes("practiceActions") && flow.includes("chưa có nét viết thật")],
  ['flow progress counter uses the same meaningful-evidence rule on core steps', flow.includes("CORE_STEPS.filter(x=>hasMeaningfulEvidence(x,ls.steps[x])).length")],
  ['support status requires real vocabulary or grammar interaction', flow.includes("(step==='vocab'||step==='grammar')&&Number(s.supportActions||0)>0")],
  ['visual-first vocab ignores direct English/Vietnamese gloss in visible learning projection', core.includes('function makeImmersiveVocabDisplay') && core.includes('const display=makeImmersiveVocabDisplay(v,base)') && !core.includes('displayMeaning:meaningVi||english||meaningRu')],
  ['vocab UI uses contextual hint wording', core.includes("Lật gợi ý") && core.includes("Hiểu qua hình và ngữ cảnh Nga")],
  ['vocab detail labels Russian explanation', core.includes("Giải thích tiếng Nga")],
  ['listening transcript is hidden by default in practice and dialogue', core.includes('practiceShowTranscript:false') && core.includes('dialogueShowTranscript:false')],
  ['learner explicitly reveals transcript after listening', core.includes('data-act="toggle-transcript"') && core.includes("act==='toggle-transcript'")],
  ['translation is gated behind transcript disclosure', core.includes("const currentVi=showTranscript&&!hideVi?dialogueVi(line):'';")],
  ['listening-first placeholder replaces eager transcript', core.includes('Nghe câu mẫu trước · mở transcript khi thật sự cần')],
  ['AI vocab helper does not expose English equivalent', !core.includes('English equivalent:')],
  ['legacy direct flip label removed', !core.includes('Lật nghĩa')],
  ['Russian alphabet dataset has all 33 letters', alphabet.length===33],
  ['font-rendered handwriting preview is explicitly non-canonical when Unicode matches print', core.includes("kind:encodedDistinct?'encoded-cursive':'font-rendered-preview'") && core.includes('Chuỗi Unicode hiện trùng chữ in; hình dáng chữ tay phụ thuộc font/asset hiển thị và không được coi là dữ liệu nét chính xác.')],
  ['generic stroke family is labeled as reference rather than exact stroke truth', core.includes('Khung nét tham khảo') && !core.includes('<span class="chip">Hình nét đang luyện</span>')],
  ['handwriting recognition scoring fails closed without vetted glyph authority', glyphAuthority.includes("status:'blocked'") && glyphAuthority.includes("trustedFamilies:Object.freeze([])") && glyphAuthority.includes('assetSha256:null') && glyphAuthority.includes('coverageManifest:null') && recognition.includes("const mode=trusted?'approved-handwriting-authority'") && recognition.includes("metadataReady&&authorityRuntime.status==='verifying'?'authority-verifying'") && recognition.includes("metadataReady&&authorityRuntime.status==='failed'?'authority-invalid'") && recognition.includes("DIGEST.test(authority.assetSha256||'')") && recognition.includes("DIGEST.test(authority.licenseSha256||'')") && recognition.includes("DIGEST.test(authority.coverageSha256||'')") && recognition.includes("authorityRuntime.status==='verified'") && recognition.includes("window.crypto.subtle.digest('SHA-256',buffer)") && recognition.includes("canScore:trusted")],
  ['handwriting capability probe checks Cyrillic glyph metrics against fallbacks', recognition.includes("PROBE='ДдЖжФфЯяШш'") && recognition.includes("Math.abs(candidate-baseline)>0.5")],
  ['handwriting authority and capability runtimes are ordered and offline-cached', russianIndex.indexOf('assets/handwriting-glyph-authority.js')>russianIndex.indexOf('assets/learning-flow.js') && russianIndex.indexOf('assets/handwriting-glyph-authority.js')<russianIndex.indexOf('assets/handwriting-recognition.js') && serviceWorker.includes('./assets/handwriting-glyph-authority.js') && serviceWorker.includes('./assets/handwriting-recognition.js')],
  ['recognition drill is Russian-only and does not use translation answers', recognition.includes('NHẬN DIỆN CHỮ IN → CHỮ TAY') && recognition.includes('Không dùng bản dịch nghĩa') && !recognition.includes('.vi') && !recognition.includes('meaning')],
  ['recognition scoring is capability-gated and fail-closed', recognition.includes("if(!cap.canScore||!alphabet.length)return false")],
  ['recognition evidence never advances alphabet without handwriting strokes', recognition.includes("RussianLearningFlow?.touch?.('alphabet'") && flow.includes("if(step==='alphabet')return Number(s.strokeActions||0)>0")],
  ['recognition state records attempts/correct without mastery writes', recognition.includes('recognitionAttempts:state.attempts') && recognition.includes('recognitionCorrect:state.correct') && !recognition.includes('mastery')],
  ['recognition render is idempotent under MutationObserver', recognition.includes('dataset.renderSig') && recognition.includes('if(banner.dataset.renderSig!==capSig)') && recognition.includes('if(box.dataset.renderSig!==drillSig)')],
  ['handwriting misses enter Review Queue with exact writing resume route', recognition.includes("setResume?.(route,'handwriting_recognition')") && recognition.includes("addReview?.(reviewId") && recognition.includes("'handwriting_recognition_miss'") && recognition.includes("handwritingIndex:Number(q.item.__sourceIndex??q.index)||0")],
  ['correct recognition clears only its exact handwriting review item after two confirmations', recognition.includes("profile.correctStreak>=2") && recognition.includes("removeReview?.(reviewId)")],
  ['Review Queue integration still has no mastery write', !recognition.includes('mastery')]
];

const failed=checks.filter(([,ok])=>!ok);
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} · ${name}`);
if(failed.length){
  console.error(`Russian listening/visual-first contract failed: ${failed.length} check(s)`);
  process.exit(1);
}
console.log('Russian listening/visual-first contract PASS');
