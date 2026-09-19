import fs from 'node:fs';

const authority=fs.readFileSync('subjects/russian/assets/handwriting-glyph-authority.js','utf8');
const recognition=fs.readFileSync('subjects/russian/assets/handwriting-recognition.js','utf8');
const flow=fs.readFileSync('subjects/russian/assets/learning-flow.js','utf8');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const sw=fs.readFileSync('subjects/russian/sw.js','utf8');
const css=fs.readFileSync('subjects/russian/assets/core.css','utf8');
const preview=fs.readFileSync('scripts/prepare-cloudflare-preview.mjs','utf8');
const site=fs.readFileSync('scripts/prepare-chatgpt-site.mjs','utf8');

const checks=[
  ['schema exists', recognition.includes("RUSSIAN_HANDWRITING_RECOGNITION_V1")],
  ['capability fail-closed', recognition.includes("trusted?'approved-handwriting-authority':available?'local-script-preview':'reference-only'") && recognition.includes("if(!cap.canScore||!alphabet.length)return false")],
  ['Cyrillic metric probe exists', recognition.includes("PROBE='ДдЖжФфЯяШш'") && recognition.includes('Math.abs(candidate-baseline)>0.5')],
  ['no remote font/runtime dependency', !/https?:\/\//i.test(recognition+authority)],
  ['local handwriting source only', recognition.includes("fetch('data/handwriting.json')")],
  ['no translation answer fields', !recognition.includes('.vi') && !recognition.includes('meaning')],
  ['no mastery/completed write', !recognition.includes('mastery') && !recognition.includes('completed')],
  ['wrong recognition enters review queue', recognition.includes("'handwriting_recognition_miss'") && recognition.includes("addReview?.(reviewId")],
  ['exact writing resume route retained', recognition.includes("view:'writing',handwritingIndex:Number(q.item.__sourceIndex??q.index)||0,handwritingStep:0")],
  ['recognition evidence cannot replace handwriting stroke evidence', flow.includes("if(step==='alphabet')return Number(s.strokeActions||0)>0")],
  ['blocked authority is explicit by default', authority.includes("status:'blocked'") && authority.includes("source:'none'") && authority.includes('trustedFamilies:Object.freeze([])') && authority.includes('assetSha256:null') && authority.includes('licenseSha256:null') && authority.includes('coverageManifest:null') && authority.includes('coverageSha256:null')],
  ['scoring requires vetted bundled authority integrity metadata', recognition.includes("authority.status==='ready'") && recognition.includes("authority.source==='bundled-vetted'") && recognition.includes('!!authority.asset') && recognition.includes("DIGEST.test(authority.assetSha256||'')") && recognition.includes('!!authority.license') && recognition.includes("DIGEST.test(authority.licenseSha256||'')") && recognition.includes('!!authority.coverageManifest') && recognition.includes("DIGEST.test(authority.coverageSha256||'')") && recognition.includes('!!authority.verifiedAt')],
  ['runtime authority hashes actual font license and coverage bytes', recognition.includes("window.crypto.subtle.digest('SHA-256',buffer)") && recognition.includes("fontHash!==authority.assetSha256.toLowerCase()") && recognition.includes("licenseHash!==authority.licenseSha256.toLowerCase()") && recognition.includes("coverageHash!==authority.coverageSha256.toLowerCase()")],
  ['runtime authority coverage must match all 33 current alphabet IDs', recognition.includes("alphabet.length!==33") && recognition.includes("coverage.alphabetIds.length!==33") && recognition.includes("sameSet(coverage.alphabetIds,alphabetIds)")],
  ['bundled authority font is loaded before Cyrillic runtime probe', recognition.includes("new FontFace(family,fontBytes.slice(0))") && recognition.includes("document.fonts.add(loaded)") && recognition.includes("document.fonts.check('64px") && recognition.includes("supportsCyrillicScriptFont(family)")],
  ['recognition trusts only runtime-verified authority family', recognition.includes("authorityRuntime.status==='verified'") && recognition.includes("authority.trustedFamilies.includes(verifiedFamily)") && recognition.includes("canScore:trusted")],
  ['authority loads after flow and before recognition', index.indexOf('assets/handwriting-glyph-authority.js')>index.indexOf('assets/learning-flow.js') && index.indexOf('assets/handwriting-glyph-authority.js')<index.indexOf('assets/handwriting-recognition.js')],
  ['offline shell contains authority and runtime', sw.includes("'./assets/handwriting-glyph-authority.js'") && sw.includes("'./assets/handwriting-recognition.js'")],
  ['glyph authority refreshes network-first with offline fallback', sw.includes("const isAuthority=url.pathname.endsWith('/subjects/russian/assets/handwriting-glyph-authority.js')") && sw.includes("fetch(req,{cache:'no-store'})") && sw.includes("const hit=await cache.match(req)") && sw.indexOf('if(isAuthority)')<sw.indexOf('if(isDataPath)')],
  ['Cloudflare package requires authority and runtime', preview.includes("'subjects/russian/assets/handwriting-glyph-authority.js'") && preview.includes("'subjects/russian/assets/handwriting-recognition.js'") && preview.includes('handwriting glyph authority script reference') && preview.includes('handwriting recognition script reference')],
  ['ChatGPT Site package requires authority and runtime', site.includes("'subjects/russian/assets/handwriting-glyph-authority.js'") && site.includes("'subjects/russian/assets/handwriting-recognition.js'") && site.includes('handwriting glyph authority script reference') && site.includes('handwriting recognition script reference')],
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