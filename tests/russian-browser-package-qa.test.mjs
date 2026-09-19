import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  validateContract,
  validatePackage,
  validateAccessibility,
  validateResponsive,
  validatePerformance,
  validateBrowserCapability,
  validateBrowserCapabilityBehavior,
  validateCursive
} from '../scripts/validate-russian-browser-package-qa.mjs';

const read=p=>fs.readFileSync(p,'utf8');
const contract=JSON.parse(read('subjects/russian/contracts/browser-package-qa-contract.v1.json'));
const bundle={
  index:read('subjects/russian/index.html'),
  sw:read('subjects/russian/sw.js'),
  runtime:read('subjects/russian/assets/runtime-optimizer.js'),
  css:read('subjects/russian/assets/core.css'),
  capability:read('subjects/russian/assets/browser-capabilities.js'),
  core:read('subjects/russian/assets/core.js'),
  cyrillic:read('subjects/russian/assets/cyrillic-literacy.js'),
  reading:read('subjects/russian/assets/reading-bridge.js'),
  dictation:read('subjects/russian/assets/dictation-listen-write.js'),
  skillGate:read('subjects/russian/assets/skill-gated-assessment.js'),
  assetReliability:read('subjects/russian/assets/asset-reliability.js'),
  glyphs:read('subjects/russian/assets/cursive-glyphs.js'),
  motor:read('subjects/russian/assets/handwriting-motor-coach.js'),
  glyphCss:read('subjects/russian/assets/cursive-glyphs.css')
};
const copy=()=>structuredClone(contract);

assert.equal(validateContract(copy()),true);
assert.doesNotThrow(()=>validatePackage(bundle));
assert.equal(validateAccessibility(bundle),true);
assert.equal(validateResponsive(bundle.css),true);
assert.equal(validatePerformance(bundle),true);
assert.equal(validateBrowserCapability(bundle),true);
assert.equal(validateBrowserCapabilityBehavior(bundle.capability),true);
assert.equal(validateCursive({...bundle,css:bundle.glyphCss}),true);

{const x=copy();x.cursive.fontOnlyProofAllowed=true;assert.throws(()=>validateContract(x),/Cursive proof contract weakened/)}
{const x=copy();x.performance.storageSizeGuardRequired=false;assert.throws(()=>validateContract(x),/Performance contract weakened/)}
{const x=copy();x.browserCapabilities.russianVoiceSelectionRequired=false;assert.throws(()=>validateContract(x),/voice selection\/refresh contract weakened/)}
{const x=copy();x.browserCapabilities.playbackStartHookRequired=false;assert.throws(()=>validateContract(x),/Playback evidence contract weakened/)}
assert.throws(()=>validateAccessibility({...bundle,index:bundle.index.replace('aria-label="Mở AI Mentor"','')}),/AI icon button accessible name missing/);
assert.throws(()=>validateAccessibility({...bundle,core:bundle.core.replace("modal.setAttribute('aria-hidden','false')","")}),/Opening modal must expose dialog/);
assert.throws(()=>validateAccessibility({...bundle,core:bundle.core.replace('modalReturnFocus=document.activeElement','modalReturnFocus=null')}),/remember prior focus/);
assert.throws(()=>validateResponsive(bundle.css.replaceAll('@media(max-width:760px)','@media(max-width:761px)')),/Phone responsive breakpoint missing/);
assert.throws(()=>validatePerformance({...bundle,core:bundle.core.replace('safeLocalJson(key,{},1600000)','safeLocalJson(key,{})')}),/Primary learner-state size guard missing/);
assert.throws(()=>validateBrowserCapability({...bundle,capability:bundle.capability.replace('Âm Nga: trình duyệt không hỗ trợ','')}),/Speech-unavailable learner status missing/);
assert.throws(()=>validateBrowserCapability({...bundle,capability:bundle.capability.replace('if(voice)u.voice=voice','')}),/Selected Russian voice is not assigned/);
assert.throws(()=>validateBrowserCapability({...bundle,core:bundle.core.replace("onStart:meta=>{if(inPracticeMode()){markPracticeLineHeard(d,idx);render()}","onStart:meta=>{if(inPracticeMode()){render()}")}),/playback-start confirmed/);
assert.throws(()=>validateCursive({...bundle,glyphs:bundle.glyphs.replace("function glyphCoverage(){return Object.keys(UPPER).length+Object.keys(LOWER).length;}","function glyphCoverage(){return 65;}"),css:bundle.glyphCss}),/exactly 66/);
assert.throws(()=>validateCursive({...bundle,glyphs:bundle.glyphs.replace("function pairDistinct(letter){","function pairDistinct(letter){return false;}\n  function unusedPairDistinct(letter){"),css:bundle.glyphCss}),/must be distinct/);
assert.throws(()=>validatePackage({...bundle,index:bundle.index.replace('<script src="assets/cursive-glyphs.js"></script>','').replace('<script src="assets/cyrillic-literacy.js"></script>','<script src="assets/cyrillic-literacy.js"></script>\n<script src="assets/cursive-glyphs.js"></script>')}),/must load before Cyrillic literacy/);

console.log('RUSSIAN_BROWSER_PACKAGE_QA_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:15},null,2));
