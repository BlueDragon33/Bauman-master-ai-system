/* E129 · Theory Tab Contract Bridge
 * Purpose: make the E129 Theory source-of-truth available at runtime without replacing the old E126 visual renderer yet.
 * This file must stay lightweight until the dedicated E129 renderer is implemented.
 */
(function(){
  'use strict';
  var RELEASE = 'E129_THEORY_UNIFIED_CONTRACT_BRIDGE';
  var CONTRACT = {
    release: RELEASE,
    contractDoc: 'subjects/math/THEORY_TAB_CONTRACT_E129.md',
    status: 'contract_bridge_only',
    runtimeBehavior: 'no_direct_render_replace_yet',
    primaryFrameSource: 'theory_lecture_frame',
    primaryFramePath: 'data/theory_lecture_frame.json',
    primaryContentSource: 'theory_lecture_content',
    primaryContentPath: 'data/theory_lecture_content.json',
    legacySource: 'lessons',
    legacyPath: 'data/lessons.json',
    legacyRole: 'compatibility_fallback_only',
    activeStages: ['vn','prep','hk1','hk2','hk3','hk4'],
    activeStageNos: [0,1,2,3,4,5],
    activeChapterRange: { min: 1, max: 40 },
    frameworkOnlyStages: ['phd_bridge','phd_y1','phd_y2','phd_thesis'],
    frameworkOnlyChapterRange: { min: 41, max: 56 },
    storageRoute: {
      view: 'storage',
      domain: 'theory',
      group: 'Bài giảng lý thuyết',
      defaultFrameFile: 'theory_lecture_frame',
      defaultContentFile: 'theory_lecture_content',
      legacyFile: 'lessons'
    },
    renderStates: {
      frameOnly: 'show_clean_placeholder_from_frame',
      frameAndContent: 'show_full_theory_reader',
      legacyFallback: 'show_lessons_with_compatibility_badge'
    },
    requiredContentFields: ['lessonId','chapterId','lessonTitle|title','slides'],
    preferredSlideRoles: [
      'problem_framing','deep_essence','counter_intuition','real_bridge',
      'notation','core_formula','assumption_gate','mini_case',
      'interpretation','simulation','common_mistakes','application',
      'practice','professor_qa','bridge','takeaway'
    ],
    forbidden: [
      'hard_code_academic_tree_into_ui',
      'make_lessons_json_primary_again',
      'merge_frame_and_content_into_one_giant_json',
      'break_storage_overview_planning_mindmap_other_tabs'
    ]
  };

  function arr(v){ return Array.isArray(v) ? v : []; }
  function db(){ return window.DB || {}; }
  function countSource(name){
    var value = db()[name];
    if(Array.isArray(value)) return value.length;
    if(value && Array.isArray(value.records)) return value.records.length;
    if(value && Array.isArray(value.lessons)) return value.lessons.length;
    if(value && Array.isArray(value.items)) return value.items.length;
    return value ? 1 : 0;
  }
  function sourceStatus(){
    return {
      frame: countSource(CONTRACT.primaryFrameSource),
      content: countSource(CONTRACT.primaryContentSource),
      legacy: countSource(CONTRACT.legacySource),
      frameSource: CONTRACT.primaryFrameSource,
      contentSource: CONTRACT.primaryContentSource,
      legacySource: CONTRACT.legacySource
    };
  }
  function applyAdapterMetadata(){
    var A = window.SUBJECT_ADAPTER;
    if(!A) return false;
    A.version = RELEASE;
    A.release = RELEASE;
    A.latestPatch = RELEASE;
    A.theoryContract = CONTRACT;
    A.dataSourceMeta = A.dataSourceMeta || {};
    A.dataSourceMeta.theory_lecture_frame = Object.assign({}, A.dataSourceMeta.theory_lecture_frame || {}, {
      label: 'Bài giảng lý thuyết · Khung',
      path: CONTRACT.primaryFramePath,
      group: 'Bài giảng lý thuyết',
      required: true,
      plannedCount: 56,
      description: 'E129 primary frame source: stage/discipline/chapter shell, not long lecture content.'
    });
    A.dataSourceMeta.theory_lecture_content = Object.assign({}, A.dataSourceMeta.theory_lecture_content || {}, {
      label: 'Bài giảng lý thuyết · Nội dung',
      path: CONTRACT.primaryContentPath,
      group: 'Bài giảng lý thuyết',
      required: true,
      plannedCount: 0,
      description: 'E129 primary content source: lesson records/slides keyed by lessonId and chapterId.'
    });
    A.dataSourceMeta.lessons = Object.assign({}, A.dataSourceMeta.lessons || {}, {
      label: 'Bài giảng cũ / tương thích',
      path: CONTRACT.legacyPath,
      group: 'Tương thích',
      required: false,
      description: 'E129 compatibility fallback only. New Theory imports must target theory_lecture_content.'
    });
    A.ui = A.ui || {};
    A.ui.coreLabel = 'MATH · E129 Theory Contract';
    A.ui.heroBadge = 'Math Bauman · E129';
    A.ui.heroTitle = 'Toán Bauman · Theory Unified Contract';
    A.ui.subtitle = 'Lý thuyết thống nhất theo DataVault frame/content';
    A.ui.overviewSubtitle = 'E129 khóa luật Lý thuyết: khung đọc từ theory_lecture_frame, nội dung đọc từ theory_lecture_content, lessons chỉ là tương thích.';
    A.ui.learningSubtitle = 'Tab Lý thuyết sẽ hiển thị được cả khi mới có khung, sau đó đọc bài giảng thật từ Dữ liệu môn học.';
    A.ui.storageSubtitle = 'Kho môn học ưu tiên cặp Lý thuyết: Khung môn học và Dữ liệu môn học; lessons chỉ dùng khi cần tương thích.';
    A.ui.assistantToast = 'E129: đã khóa contract Lý thuyết frame/content; E126/E128 vẫn giữ làm compatibility.';
    return true;
  }
  function markDom(){
    try{
      var html = document.documentElement;
      if(html) html.setAttribute('data-theory-contract', RELEASE);
      var core = document.getElementById('coreLabel');
      if(core && /E12[68]|E11[234]|E10[689]/.test(core.textContent || '')) core.textContent = 'MATH · E129 Theory Contract';
      var sub = document.getElementById('pageSub');
      if(sub && /E12[68]|347\+|lessons/i.test(sub.textContent || '')) sub.textContent = 'E129 · Lý thuyết dùng DataVault frame/content; E126/E128 giữ làm compatibility';
    }catch(_){ }
  }
  function openTheoryVault(){
    var api = window.__BAUMAN_CORE_API || {};
    var state = api.state || window.__MATH_STATE || {};
    state.view = 'storage';
    state.storageDomain = 'theory';
    state.storageFile = CONTRACT.storageRoute.defaultContentFile;
    state.storageFrameFile = CONTRACT.storageRoute.defaultFrameFile;
    state.storageContentFile = CONTRACT.storageRoute.defaultContentFile;
    state.storageLegacyFile = CONTRACT.storageRoute.legacyFile;
    try{ api.save && api.save(); api.render && api.render(); }catch(_){ }
    return state;
  }
  function selfCheck(){
    var status = sourceStatus();
    return {
      ok: true,
      release: RELEASE,
      contractDoc: CONTRACT.contractDoc,
      adapterMarked: !!(window.SUBJECT_ADAPTER && window.SUBJECT_ADAPTER.theoryContract),
      sources: status,
      primaryFrameSource: CONTRACT.primaryFrameSource,
      primaryContentSource: CONTRACT.primaryContentSource,
      legacySource: CONTRACT.legacySource,
      renderReplacement: false,
      note: 'E129 bridge is active. E126 visual renderer is still compatibility until a later patch round.'
    };
  }

  window.BAUMAN_MATH_THEORY_E129_CONTRACT = CONTRACT;
  window.BAUMAN_MATH_THEORY_E129 = {
    release: RELEASE,
    contract: CONTRACT,
    applyAdapterMetadata: applyAdapterMetadata,
    sourceStatus: sourceStatus,
    openTheoryVault: openTheoryVault,
    selfCheck: selfCheck
  };

  applyAdapterMetadata();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ applyAdapterMetadata(); markDom(); });
  else markDom();
})();
