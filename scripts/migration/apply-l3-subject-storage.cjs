'use strict';

const fs = require('fs');

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, text) { fs.writeFileSync(file, text); }

function replaceOnce(source, before, after, label, file) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`${file}: missing expected source for ${label}`);
  const second = source.indexOf(before, first + before.length);
  if (second >= 0) throw new Error(`${file}: multiple matches for ${label}`);
  console.log('PATCH:', file, label);
  return source.slice(0, first) + after + source.slice(first + before.length);
}

function patchFile(file, operations) {
  let source = read(file);
  for (const op of operations) source = replaceOnce(source, op.before, op.after, op.label, file);
  write(file, source);
}

const platformTags = '<script src="../../assets/js/platform/storage-adapter.js"></script><script src="../../assets/js/platform/subject-storage.js"></script>';

function wireIndex(file, anchor) {
  let source = read(file);
  if (source.includes('assets/js/platform/subject-storage.js')) {
    console.log('SKIP:', file, 'already wired');
    return;
  }
  source = replaceOnce(source, anchor, platformTags + anchor, 'subject storage script wiring', file);
  write(file, source);
}

wireIndex('subjects/math/index.html', '<script src="assets/theory_skin/theory-presenter-route-lock-E243.js?v=243"></script>');
wireIndex('subjects/russian/index.html', '<script src="assets/subject-adapter.js"></script>');
wireIndex('subjects/programming/index.html', '<script src="assets/subject-adapter.js"></script>');

for (const id of ['ai', 'foundation', 'research', 'signal', 'systems']) {
  wireIndex(`subjects/${id}/index.html`, `<script src="./assets/${id}.js"></script>`);
}

for (const id of ['ai', 'foundation', 'research', 'signal', 'systems']) {
  const file = `subjects/${id}/assets/${id}.js`;
  let source = read(file);
  if (!source.includes('const SUBJECT_STORAGE=window.BaumanSubjectStorage.forSubject(CONFIG.id);')) {
    source = replaceOnce(
      source,
      "const KEY='bauman_subject_'+CONFIG.id+'_all_phases_v1';",
      "const KEY='bauman_subject_'+CONFIG.id+'_all_phases_v1';\nconst SUBJECT_STORAGE=window.BaumanSubjectStorage.forSubject(CONFIG.id);",
      'bind subject storage',
      file
    );
    source = replaceOnce(
      source,
      "function readState(){try{return {...defaultState(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return defaultState()}}",
      "function readState(){try{return {...defaultState(),...(SUBJECT_STORAGE.getJSON(KEY,{})||{})}}catch{return defaultState()}}",
      'read state through subject storage',
      file
    );
    source = replaceOnce(
      source,
      "function save(){localStorage.setItem(KEY,JSON.stringify(state));reportProgress()}",
      "function save(){SUBJECT_STORAGE.setJSON(KEY,state,{kind:'subject-state'});reportProgress()}",
      'save state through subject storage',
      file
    );
    write(file, source);
  } else {
    console.log('SKIP:', file, 'already migrated');
  }
}

for (const id of ['russian', 'programming']) {
  const file = `subjects/${id}/assets/core.js`;
  let source = read(file);
  if (!source.includes("const SUBJECT_STORAGE=window.BaumanSubjectStorage.forSubject(A.id||'")) {
    const fallback = id === 'russian' ? 'russian' : 'programming';
    source = replaceOnce(
      source,
      "const uniq=a=>Array.from(new Set(arr(a).filter(Boolean))); const key=A.storageKey||'bauman_russian_v11_clean_skeleton';",
      `const uniq=a=>Array.from(new Set(arr(a).filter(Boolean))); const key=A.storageKey||'bauman_russian_v11_clean_skeleton';\nconst SUBJECT_STORAGE=window.BaumanSubjectStorage.forSubject(A.id||'${fallback}');`,
      'bind subject storage',
      file
    );

    const oldSafe = `function safeLocalJson(keyName,fallback={},maxChars=3500000){\n try{\n  const raw=localStorage.getItem(keyName);\n  if(!raw)return fallback;\n  if(raw.length>maxChars){\n   console.warn('LocalStorage payload quá lớn, bỏ qua để tránh treo giao diện',keyName,raw.length);\n   localStorage.removeItem(keyName);\n   return fallback;\n  }\n  return safeParseJson(raw,fallback);\n }catch(e){console.warn('Không đọc được localStorage',keyName,e);return fallback;}\n}`;
    const newSafe = `function safeLocalJson(keyName,fallback={},maxChars=3500000){\n try{\n  const result=SUBJECT_STORAGE.readJSONWithLimit(keyName,fallback,maxChars);\n  if(result.status==='oversize-preserved')console.warn('Storage payload quá lớn, bỏ qua nhưng giữ nguyên dữ liệu',keyName,result.chars);\n  if(result.status==='invalid-json-preserved')console.warn('Storage JSON không hợp lệ, bỏ qua nhưng giữ nguyên dữ liệu',keyName,result.error||'');\n  return result.value;\n }catch(e){console.warn('Không đọc được subject storage',keyName,e);return fallback;}\n}`;
    source = replaceOnce(source, oldSafe, newSafe, 'safe JSON read without destructive oversize deletion', file);
    source = replaceOnce(
      source,
      "function save(){try{localStorage.setItem(key,JSON.stringify(state)); const s=$('#saveState'); if(s)s.textContent='Đã đồng bộ'}catch(e){}}",
      "function save(){try{SUBJECT_STORAGE.setJSON(key,state,{kind:'subject-state'}); const s=$('#saveState'); if(s)s.textContent='Đã đồng bộ'}catch(e){}}",
      'save state through subject storage',
      file
    );
    source = replaceOnce(
      source,
      "function saveDB(){try{localStorage.setItem(key+'_db',JSON.stringify(dbForLocalStorage()));}catch(e){toast('Trình duyệt không cho lưu DB lớn')}}",
      "function saveDB(){try{SUBJECT_STORAGE.setJSON(key+'_db',dbForLocalStorage(),{kind:'subject-db-overlay'});}catch(e){toast('Trình duyệt không cho lưu DB lớn')}}",
      'save DB overlay through subject storage',
      file
    );
    source = replaceOnce(
      source,
      "if(action==='reset-db-do'){localStorage.removeItem(key+'_db'); closeModal(); toast('Đã khôi phục dữ liệu gốc, đang tải lại'); setTimeout(()=>location.reload(),300); return;}",
      "if(action==='reset-db-do'){SUBJECT_STORAGE.removeItem(key+'_db',{kind:'subject-db-overlay-reset'}); closeModal(); toast('Đã khôi phục dữ liệu gốc, đang tải lại'); setTimeout(()=>location.reload(),300); return;}",
      'reset DB overlay through subject storage',
      file
    );
    write(file, source);
  } else {
    console.log('SKIP:', file, 'already migrated');
  }
}

patchFile('subjects/math/assets/theory_skin/theory-tab-E129.js', [
  {
    label: 'bind math subject storage',
    before: "  var CONTENT_REPORT_KEY = 'bauman_math_e129_theory_content_report_v1';",
    after: "  var CONTENT_REPORT_KEY = 'bauman_math_e129_theory_content_report_v1';\n  var SUBJECT_STORAGE = window.BaumanSubjectStorage.forSubject('math');"
  },
  {
    label: 'math E129 local helpers through subject storage',
    before: "  function localGet(k,fallback){ try{ var raw=localStorage.getItem(k); return raw?JSON.parse(raw):fallback; }catch(_){ return fallback; } }\n  function localSet(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(_){ return false; } }\n  function localDel(k){ try{ localStorage.removeItem(k); }catch(_){ } }",
    after: "  function localGet(k,fallback){ try{ return SUBJECT_STORAGE.getJSON(k,fallback); }catch(_){ return fallback; } }\n  function localSet(k,v){ try{ SUBJECT_STORAGE.setJSON(k,v,{kind:'math-e129-overlay'}); return true; }catch(_){ return false; } }\n  function localDel(k){ try{ SUBJECT_STORAGE.removeItem(k,{kind:'math-e129-overlay'}); }catch(_){ } }"
  }
]);

patchFile('subjects/math/assets/theory_skin/theory-content-source-E240.js', [
  {
    label: 'bind math subject storage E240',
    before: "  var OVERLAY_KEY='bauman_math_e129_theory_content_overlay_v1';",
    after: "  var OVERLAY_KEY='bauman_math_e129_theory_content_overlay_v1';\n  var SUBJECT_STORAGE=window.BaumanSubjectStorage.forSubject('math');"
  },
  {
    label: 'read E129 overlay through subject storage E240',
    before: "      var raw=localStorage.getItem(OVERLAY_KEY);",
    after: "      var raw=SUBJECT_STORAGE.getItem(OVERLAY_KEY);"
  }
]);

patchFile('subjects/math/assets/theory_skin/theory-min-slide-contract-E239.js', [
  {
    label: 'bind math subject storage E239',
    before: "  var REPORT_KEY='bauman_math_e129_theory_content_report_v1';",
    after: "  var REPORT_KEY='bauman_math_e129_theory_content_report_v1';\n  var SUBJECT_STORAGE=window.BaumanSubjectStorage.forSubject('math');"
  },
  {
    label: 'save normalized report through subject storage E239',
    before: "        try{localStorage.setItem(REPORT_KEY,JSON.stringify(normalized));}catch(_){ }",
    after: "        try{SUBJECT_STORAGE.setJSON(REPORT_KEY,normalized,{kind:'math-e129-report'});}catch(_){ }"
  },
  {
    label: 'read stored report through subject storage E239',
    before: "      var raw=localStorage.getItem(REPORT_KEY);",
    after: "      var raw=SUBJECT_STORAGE.getItem(REPORT_KEY);"
  },
  {
    label: 'sanitize stored report through subject storage E239',
    before: "      originalStorageSet.call(localStorage,REPORT_KEY,JSON.stringify(normalizeReport(parsed)));",
    after: "      SUBJECT_STORAGE.setJSON(REPORT_KEY,normalizeReport(parsed),{kind:'math-e129-report-sanitize'});"
  }
]);

const runtimeFiles = [
  'subjects/russian/assets/core.js',
  'subjects/programming/assets/core.js',
  ...['ai','foundation','research','signal','systems'].map((id) => `subjects/${id}/assets/${id}.js`),
  'subjects/math/assets/theory_skin/theory-tab-E129.js',
  'subjects/math/assets/theory_skin/theory-content-source-E240.js',
  'subjects/math/assets/theory_skin/theory-min-slide-contract-E239.js'
];

for (const file of runtimeFiles) {
  const source = read(file);
  if (!source.includes('BaumanSubjectStorage')) throw new Error(`${file}: BaumanSubjectStorage binding missing after patch`);
}

console.log('L3 subject storage codemod applied successfully.');
