import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';

const root=path.resolve('subjects/russian');
const fail=m=>{throw new Error('RUSSIAN_BROWSER_PACKAGE_QA_GATE=FAIL\n'+m)};
const assert=(v,m)=>{if(!v)fail(m)};
const read=p=>fs.readFileSync(path.resolve(p),'utf8');
const ORDER=['23.1','23.2','23.3','23.4','23.5','23.6','23.7'];
const LETTERS='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_BROWSER_PACKAGE_QA_CONTRACT_V1','Unexpected browser/package QA contract');
  assert(JSON.stringify(Object.keys(c.substeps||{}))===JSON.stringify(ORDER),'Turn 23 substep set/order drifted');
  assert(c.targets?.desktop?.aspectRatio==='16:9'&&c.targets?.tablet?.aspectRatio==='3:2'&&c.targets?.phone?.aspectRatio==='19.5:9','Responsive target ratios drifted');
  assert(c.accessibility?.criticalInteractiveElementsNamed===true&&c.accessibility?.modalSemanticsRequired===true&&c.accessibility?.statusLiveRegionsRequired===true&&c.accessibility?.focusVisibilityRequired===true&&c.accessibility?.modalAriaLifecycleRequired===true&&c.accessibility?.modalFocusLifecycleRequired===true,'Accessibility contract weakened');
  assert(c.performance?.largeOptionalDataLazy===true&&c.performance?.storageSizeGuardRequired===true&&c.performance?.renderMutationGuardRequired===true&&c.performance?.pagedLargeCollectionsRequired===true,'Performance contract weakened');
  assert(c.browserCapabilities?.speechFallbackExplicit===true&&c.browserCapabilities?.externalMediaOfflineStateExplicit===true&&c.browserCapabilities?.missingVisualStateExplicit===true,'Browser capability fallback contract weakened');
  assert(c.cursive?.obligationId==='RUS-CURSIVE-VISUAL-001'&&c.cursive?.mustDifferFromPrint===true&&c.cursive?.fontOnlyProofAllowed===false&&c.cursive?.explicitShapeFallbackAllowed===true,'Cursive proof contract weakened');
  assert(c.authority?.noMasteryMutation===true&&c.authority?.noCompletionMutation===true&&c.authority?.noReviewQueueMutation===true&&c.authority?.noSchedulerMutation===true,'Turn 23 must remain QA-only authority');
  return true;
}

function localEntryRefs(index){
  const refs=[];
  for(const m of index.matchAll(/(?:src|href)="([^"]+)"/g)){
    const value=m[1];
    if(!value||value.startsWith('http:')||value.startsWith('https:')||value.startsWith('data:')||value.startsWith('#'))continue;
    if(value==='manifest.webmanifest'||value.startsWith('assets/')||value.startsWith('../'))refs.push(value);
  }
  return [...new Set(refs)];
}
function resolveEntryRef(ref){
  return path.resolve(root,ref);
}
function quotedArray(src,name){
  const match=src.match(new RegExp('const\\s+'+name+'\\s*=\\s*\\[([\\s\\S]*?)\\];'));
  if(!match)return [];
  return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map(x=>x[1]);
}
function jsonArray(src,name){
  const match=src.match(new RegExp('const\\s+'+name+'\\s*=\\s*(\\[[^;]+\\]);'));
  return match?JSON.parse(match[1]):[];
}
function shellValue(ref){
  if(ref==='manifest.webmanifest')return './manifest.webmanifest';
  if(ref.startsWith('assets/'))return './'+ref;
  return ref;
}

export function validatePackage({index,sw,runtime}){
  const refs=localEntryRefs(index);
  assert(refs.length>=40,'Russian entry dependency inventory unexpectedly small');
  for(const ref of refs)assert(fs.existsSync(resolveEntryRef(ref)),'Missing packaged entry dependency: '+ref);
  const expected=['./','./index.html',...refs.map(shellValue)];
  const shell=quotedArray(sw,'SHELL');
  const runtimeShell=jsonArray(runtime,'SHELL_REQUIRED');
  assert(JSON.stringify(shell)===JSON.stringify(expected),'Service-worker shell must exactly match current entry dependencies');
  assert(JSON.stringify(runtimeShell)===JSON.stringify(expected),'Runtime offline shell inventory must exactly match current entry dependencies');

  const cap=index.indexOf('assets/browser-capabilities.js');
  const core=index.indexOf('assets/core.js');
  const cursive=index.indexOf('assets/cursive-glyphs.js');
  const literacy=index.indexOf('assets/cyrillic-literacy.js');
  assert(cap>=0&&cap<core,'Browser capability runtime must load before core.js');
  assert(cursive>=0&&cursive<literacy,'Explicit cursive glyph runtime must load before Cyrillic literacy');
  assert(!index.includes('\\n'),'Entry markup contains literal newline escape');
  return {entryRefs:refs.length,shellEntries:expected.length};
}

export function validateAccessibility({index,css,capability,core}){
  assert(index.includes('role="dialog"')&&index.includes('aria-modal="true"')&&index.includes('aria-hidden="true"'),'Modal semantics incomplete');
  assert(index.includes('id="toast"')&&index.includes('role="status"')&&index.includes('aria-live="polite"'),'Toast live-status semantics missing');
  assert(index.includes('id="saveState"')&&index.includes('aria-live="polite"'),'Save status live region missing');
  assert(index.includes('id="russianGlobalSearch"')&&index.includes('aria-label="Tìm nhanh trong Tiếng Nga Bauman"'),'Global search accessible name missing');
  assert(index.includes('id="themeBtn"')&&index.includes('aria-label="Đổi giao diện"'),'Theme icon button accessible name missing');
  assert(index.includes('id="aiBtn"')&&index.includes('aria-label="Mở AI Mentor"'),'AI icon button accessible name missing');
  assert(index.includes('id="modalClose"')&&index.includes('aria-label="Đóng hộp thoại"'),'Modal close accessible name missing');
  assert(css.includes(':focus-visible'),'Keyboard focus-visible styling missing');
  assert(capability.includes("el.setAttribute('role','status')")&&capability.includes("el.setAttribute('aria-live','polite')"),'Browser capability status is not announced accessibly');
  assert(core.includes("modal.setAttribute('aria-hidden','false')"),'Opening modal must expose dialog to assistive technology');
  assert(core.includes("modal.setAttribute('aria-hidden','true')"),'Closing modal must hide dialog from assistive technology');
  assert(core.includes('modalReturnFocus=document.activeElement'),'Opening modal must remember prior focus');
  assert(core.includes('if(back&&back.isConnected)'),'Closing modal must restore prior focus when available');
  assert(core.includes("first?.focus?.({preventScroll:true})"),'Opening non-presentation modal must move focus into dialog');
  return true;
}

export function validateResponsive(css){
  assert(css.includes('@media(max-width:1180px)'),'Tablet responsive breakpoint missing');
  assert(css.includes('@media(max-width:760px)'),'Phone responsive breakpoint missing');
  assert(css.includes('.main{min-width:0'),'Main content containment missing');
  assert(css.includes('grid-template-columns:minmax('),'Responsive/minmax grid containment missing');
  assert(!/(^|[;{])\s*width:\s*(?:1920|2048)px/i.test(css),'Fixed desktop canvas width leaked into layout CSS');
  return true;
}

export function validatePerformance({core,cyrillic,reading,dictation,skillGate}){
  assert(core.includes('function safeLocalJson')&&core.includes('maxChars=3500000'),'Large local-storage guard missing');
  assert(core.includes('safeLocalJson(key,{},1600000)'),'Primary learner-state size guard missing');
  assert(core.includes('const OPTIONAL_DATA_FILES=')&&core.includes('loadOptionalData'),'Large optional data is not lazy-loaded');
  assert(core.includes('VOCAB_PAGE_SIZE')&&core.includes('list.slice(pageStart,pageStart+pageSize)'),'Large vocabulary surface is not paged');
  assert(cyrillic.includes(`if(document.querySelector('[data-cyrillic-literacy="print"]'))return`),'Cyrillic MutationObserver mount is not idempotent');
  assert(reading.includes(`if(document.querySelector('[data-reading-bridge="1"]'))return`),'Reading MutationObserver mount is not idempotent');
  assert(dictation.includes(`if(document.querySelector('[data-dictation="1"]'))return`),'Dictation MutationObserver mount is not idempotent');
  assert(skillGate.includes('let queued=false')&&skillGate.includes('if(queued)return'),'Skill-gate mutation/render scheduling lacks queue guard');
  return true;
}

export function validateBrowserCapability({capability,core,cyrillic,reading,dictation,assetReliability}){
  assert(capability.includes("const SCHEMA='RUSSIAN_BROWSER_CAPABILITY_V1'"),'Browser capability schema missing');
  assert(capability.includes('speechReady')&&capability.includes('SpeechSynthesisUtterance'),'Speech capability detection missing');
  assert(capability.includes('Âm Nga: trình duyệt không hỗ trợ'),'Speech-unavailable learner status missing');
  for(const [name,src] of [['core',core],['cyrillic',cyrillic],['reading',reading],['dictation',dictation]]){
    assert(src.includes('RussianBrowserCapabilities'),'Runtime does not delegate browser speech capability: '+name);
  }
  assert(core.includes('Nguồn external chưa dùng được khi offline'),'External media offline state missing');
  assert(assetReliability.includes('missing_visual_asset'),'Explicit missing visual asset state missing');
  return true;
}

export function loadCursiveGlyphs(js){
  const sandbox={console,JSON,Object,String};
  sandbox.globalThis=sandbox;
  vm.createContext(sandbox);
  vm.runInContext(js,sandbox,{filename:'cursive-glyphs.js'});
  return sandbox.RussianCursiveGlyphs;
}

export function validateCursive({glyphs,cyrillic,motor,index,css}){
  const api=loadCursiveGlyphs(glyphs);
  assert(api?.schema==='RUSSIAN_CURSIVE_GLYPH_SHAPES_V2','Explicit cursive glyph API missing');
  assert(api.coverage()===33,'Explicit cursive pair coverage must be exactly 33 letters');
  assert(api.glyphCoverage()===66,'Explicit cursive glyph coverage must be exactly 66 uppercase/lowercase glyphs');
  assert(api.letters===LETTERS,'Explicit cursive glyph alphabet drifted');
  for(const ch of LETTERS){
    const upper=api.pathFor(ch,'upper');
    const lower=api.pathFor(ch,'lower');
    assert(typeof upper==='string'&&upper.startsWith('M')&&upper.length>=20,'Missing/invalid uppercase cursive path for '+ch);
    assert(typeof lower==='string'&&lower.startsWith('M')&&lower.length>=20,'Missing/invalid lowercase cursive path for '+ch);
    assert(upper!==lower&&api.pairDistinct(ch)===true,'Upper/lower cursive outlines must be distinct for '+ch);
    const upperSvg=api.render(ch,{variant:'upper',label:false});
    const lowerSvg=api.render(ch,{variant:'lower',label:false});
    assert(upperSvg.includes('<svg')&&upperSvg.includes('<path')&&!upperSvg.includes('<text'),'Upper cursive glyph must render as explicit SVG path: '+ch);
    assert(lowerSvg.includes('<svg')&&lowerSvg.includes('<path')&&!lowerSvg.includes('<text'),'Lower cursive glyph must render as explicit SVG path: '+ch);
  }
  assert(cyrillic.includes('RussianCursiveGlyphs')&&cyrillic.includes('cursiveHtml'),'Cyrillic recognition does not use explicit cursive shapes');
  assert(motor.includes('RussianCursiveGlyphs')&&motor.includes('explicitSampleHtml'),'Handwriting motor coach does not use explicit cursive shapes');
  assert(index.includes('assets/cursive-glyphs.css')&&index.includes('assets/cursive-glyphs.js'),'Explicit cursive assets not loaded');
  assert(css.includes('.ru-cursive-shape')&&css.includes('font-family:inherit!important'),'Explicit vector layer does not override font-only cursive presentation');
  return true;
}

export function loadAndValidate(){
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
  validateContract(contract);
  const packageResult=validatePackage(bundle);
  validateAccessibility(bundle);
  validateResponsive(bundle.css);
  validatePerformance(bundle);
  validateBrowserCapability(bundle);
  validateCursive({...bundle,css:bundle.glyphCss});
  return {packageResult,cursivePairCoverage:33,cursiveGlyphCoverage:66};
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const result=loadAndValidate();
  console.log('RUSSIAN_BROWSER_PACKAGE_QA_GATE=PASS');
  console.log(JSON.stringify({...result,substeps:ORDER,cursiveObligation:'CLOSED_BY_66_DISTINCT_OFL_VECTOR_OUTLINES'},null,2));
}
