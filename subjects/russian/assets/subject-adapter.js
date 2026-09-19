'use strict';

window.SUBJECT_ADAPTER = {
  id: 'russian',
  subjectKind: 'language',
  version: 'RussianPack R16 · Route Bound Exam',
  storageKey: 'bauman_russian_survival_master_v11_clean_skeleton',
  packageRoot: 'subjects/russian/',
  localRoot: './',
  dataRoot: 'data/',
  externalDataRoot: 'external-data/',
  manifestPath: 'subject-manifest.json',
  oldStorageKeys: ['bauman_universal_core_v1_russian','bauman_subject_core_v5_russian','ru_clean_controller_v4','ru_clean_controller_v3','ru_clean_controller_v2','ru_clean_controller_v1'],
  dataFiles: ['curriculum','lessons','grammar','grammar-path','vocab','mindmap','exercises','tests','simulations','speaking','handwriting','writing','videos','knowledge-index'],
  optionalDataFiles: ['dialogue-bauman-az','deep-speaking-bauman','speaking-link-index'],
  dataSourceMeta: {
    curriculum:{label:'Lộ trình & giai đoạn',path:'data/curriculum.json',group:'Lõi môn học',required:true,plannedCount:2,description:'Cây giai đoạn và module học'},
    lessons:{label:'Bài học',path:'data/lessons.json',group:'Lõi môn học',required:true,plannedCount:26,description:'Bài học chính của môn Tiếng Nga'},
    grammar:{label:'Ngữ pháp gốc',path:'data/grammar.json',group:'Lõi môn học',required:true,plannedCount:20,description:'Mẫu ngữ pháp và ví dụ luyện tập'},
    'grammar-path':{label:'Ngữ pháp chuyên sâu',path:'data/grammar-path.json',group:'Ngữ pháp',required:true,plannedCount:19,description:'Lộ trình ngữ pháp độc lập từ A0 đến C1, có ví dụ, lỗi sai và bài tập'},
    vocab:{label:'Từ vựng',path:'data/vocab.json',group:'Từ vựng',required:true,plannedCount:8000,description:'Bộ từ vựng theo lộ trình Bauman'},
    mindmap:{label:'Mind map ôn tập',path:'data/mindmap.json',group:'Mind map',required:true,plannedCount:6,description:'Bộ sơ đồ ôn tập từ vựng, ngữ pháp, biến âm, thể động từ và lộ trình'},
    exercises:{label:'Bài tập',path:'data/exercises.json',group:'Bài tập',required:true,plannedCount:312,description:'Bài tập luyện kiến thức'},
    tests:{label:'Kiểm tra',path:'data/tests.json',group:'Kiểm tra',required:true,plannedCount:1320,description:'Ngân hàng câu hỏi ôn tập/kiểm tra'},
    simulations:{label:'Mô phỏng / nghe nói',path:'data/simulations.json',group:'Mô phỏng',required:true,plannedCount:18,description:'Mô phỏng và lab nhỏ'},
    speaking:{label:'Nghe/Nói cơ bản',path:'data/speaking.json',group:'Nghe nói cơ bản',required:true,plannedCount:1220,description:'Bộ luyện nghe chậm và nhại chuẩn, giữ riêng cho tab Nghe/Nói'},
    'dialogue-bauman-az':{label:'Đối thoại Bauman A-Z',path:'data/dialogue-bauman-az.json',group:'Đối thoại & Deep Bauman',required:false,lazy:true,plannedCount:4164,kind:'Hội thoại đối đáp A-Z',description:'Bộ hội thoại đầy đủ phục vụ tab Đối thoại, tách khỏi Nghe/Nói cơ bản'},
    'deep-speaking-bauman':{label:'Luyện nói sâu Bauman',path:'data/deep-speaking-bauman.json',group:'Đối thoại & Deep Bauman',required:false,lazy:true,plannedCount:1140,kind:'Deep drill / monologue / Q&A',description:'Bộ luyện phản xạ, shadowing, monologue và Q&A áp lực'},
    'speaking-link-index':{label:'Cầu nối Đối thoại - Deep Speaking',path:'data/speaking-link-index.json',group:'Đối thoại & Deep Bauman',required:false,lazy:true,plannedCount:1058,kind:'Bản đồ liên kết',description:'Cầu nối từ hội thoại Bauman A-Z sang unit Deep Speaking'},
    handwriting:{label:'Mẫu chữ',path:'data/handwriting.json',group:'Luyện viết',required:true,plannedCount:48,description:'Mẫu chữ in/viết tay'},
    writing:{label:'Nhiệm vụ viết',path:'data/writing.json',group:'Luyện viết',required:true,plannedCount:42,description:'Nhiệm vụ viết câu/đoạn'},
    videos:{label:'Video / Audio',path:'data/videos.json',group:'Video/Audio',required:true,plannedCount:24,description:'Nguồn video/audio học tiếng Nga'},
    'knowledge-index':{label:'Chỉ mục kiến thức',path:'data/knowledge-index.json',group:'Lõi môn học',required:true,plannedCount:26,description:'Chỉ mục tra cứu kiến thức'}
  },
  integration: {
    selfContained: true,
    standaloneMode: true,
    iframeMode: true,
    newTabMode: true,
    liveServerRecommended: true,
    mainEntry: 'subjects/russian/index.html',
    mainEditor: 'subjects/russian/editor.html',
    packageProtocol: 'RUSSIAN_PACK_SELF_CONTAINED_V1_FINAL'
  },
  getLocalDataPath(name){ return `${this.dataRoot || 'data/'}${name}.json`; },
  getDataSourceMeta(name){ return (this.dataSourceMeta && this.dataSourceMeta[name]) || {label:name,path:`data/${name}.json`,group:'Khác',required:false}; },
  exportSubjectStatus(){
    return {
      subjectId:this.id,
      version:this.version,
      packageRoot:this.packageRoot,
      entry:this.integration?.mainEntry,
      editor:this.integration?.mainEditor,
      dataFiles:this.dataFiles,
      capabilities:['overview','learning','dialogue','deep-dialogue','deep-speaking','speaking-link-index','writing','media','vocab','grammar','mindmap','storage','review','exam','json-import-export','lazy-data'],
      bridgeProtocol:this.bridge?.protocol,
      selfContained:true
    };
  },
  bridge: { protocol: 'BAUMAN_PLANNING_BRIDGE_V3_ROUTE_CARDS', targetQuestions: 100, targetScore: 80, completionRule: 'answered >= targetQuestions && percent >= targetScore plus repair flow when weak' },
  planningPolicy: {
    routeCardLimits: { maxLessons: 1, maxConcepts: 1, maxVocabCards: 15, maxDialogues: 4, maxWritingTasks: 1, quickCheckQuestions: 6, orientationQuestions: 0, consolidationReviewCards: 20, repairErrorGroups: 3 },
    minMinutesByLevel: { A0: 600, A1: 1500, A2: 2400, B1: 4200, B2: 6000, C1: 8400 },
    minDaysByLevel: { A0: 7, A1: 18, A2: 30, B1: 55, B2: 85, C1: 130 },
    maxNewVocabPerDay: 15,
    maxNormalMinutesPerDay: 120,
    maxIntensiveMinutesPerDay: 180,
    reviewGaps: [1,3,7,14],
    targetQuestions: 100,
    targetScore: 80,
    weakScore: 70
  },
  skillWeights: {listening:0.32, speaking:0.30, video:0.18, vocab:0.10, grammar:0.04, reading:0.02, writing:0.03, test:0.01},
  estimateLearningDemand(mission){
    const order = ['zero','A0','A1','A2','B1','B2','C1','C2'];
    const idx = level => Math.max(1, order.indexOf(String(level || 'A0')));
    const from = idx(mission.startLevel), to = idx(mission.targetLevel);
    const levels = order.slice(Math.max(1, from + 1), Math.max(from + 2, to + 1)).filter(level => this.planningPolicy.minMinutesByLevel[level]);
    const targetLevels = levels.length ? levels : [mission.targetLevel || 'A1'];
    const requiredMinutes = targetLevels.reduce((sum, level) => sum + Number(this.planningPolicy.minMinutesByLevel[level] || 0), 0) || 1500;
    const recommendedDays = Math.max(...targetLevels.map(level => Number(this.planningPolicy.minDaysByLevel[level] || 1)), Math.ceil(requiredMinutes / 120));
    return { requiredMinutes, recommendedDays, levels: targetLevels, weights: this.skillWeights, source: 'russian-adapter-russianpack-r4-final-main-qa' };
  },
  pageSize: { vocab: 30, practice: 48, dialogue: 60, handwriting: 60, writing: 60, exercises: 80 },
  defaultState: {
    stage: 'vn',
    view: 'overview',
    learnTab: 'practice',
    lessonQuery: '',
    conceptQuery: '',
    grammarQuery: '',
    lessonId: null,
    slide: 0,
    present: false,
    exerciseLevel: 'all',
    testLevel: 'easy',
    testIndex: 0,
    testAnswer: null,
    reviewLevel: 'easy',
    reviewIndex: 0,
    reviewPage: 0,
    reviewAnswer: null,
    reviewProgress: { done: {}, flagged: {}, wrong: {} },
    examLevel: 'easy',
    examCycle: 'auto',
    examIndex: 0,
    examPage: 0,
    examProgress: { answers: {}, marked: {}, submitted: false, submittedAt: null, result: null, wrong: {} },
    examHistory: [],
    remedialPlan: { active: false, cards: [], completed: {} },
    practiceQuery: '',
    practiceGroup: 'all',
    practiceDifficulty: 'all',
    dialogueQuery: '',
    dialogueGroup: 'all',
    dialogueDifficulty: 'all',
    dialoguePage: 0,
    handwritingQuery: '',
    handwritingMode: 'alphabet',
    handwritingIndex: 0,
    writingQuery: '',
    writingMode: 'all',
    writingIndex: 0,
    writingDraft: '',
    mediaCat: 'all',
    mediaQuery: '',
    mediaId: '',
    mediaView: 'grid',
    vocabQuery: '',
    vocabPage: 0,
    vocabIndex: 0,
    hostTask: null,
    testSession: { answered: 0, correct: 0, targetQuestions: 100, targetScore: 80, seen: {} }
  },
  ui: {
    lang: 'vi',
    logo: 'Я',
    title: 'Tiếng Nga Bauman',
    fullTitle: 'Tiếng Nga học thuật, dự bị và chuyên ngành Bauman',
    subtitle: 'A0/A2 → STANKIN → Bauman → НИР/ВКР',
    coreLabel: 'TIẾNG NGA BAUMAN',
    heroBadge: 'LỘ TRÌNH TIẾNG NGA BAUMAN',
    heroTitle: 'Tiếng Nga Bauman · 2 tháng đầu nghe-nói-video',
    heroText: 'Lịch trình 2 tháng đầu ở Việt Nam: nghe, nói và xem video tiếng Nga là chủ lực; từ vựng/ngữ pháp học ít để dùng ngay.',
    assistantToast: 'AI trợ lý Tiếng Nga Bauman đã sẵn sàng: từ giao tiếp sống còn đến bảo vệ ВКР.',
    stageLabel: 'Giai đoạn',
    overviewSubtitle: 'Tổng quan gọn: lịch trình 2 tháng đầu ưu tiên nghe, nói, video; từ vựng/ngữ pháp là phụ trợ.',
    learningSubtitle: '2 tháng đầu: Nghe/Nói và Video/Audio là trục chính; Ngữ pháp và Mind map dùng để ôn sâu mà không làm loãng nhịp học.',
    academicTitle: 'Học thuật',
    academicSubtitle: 'Học thuật vẫn có đủ Lý thuyết, Bài tập, Ôn tập, Kiểm tra; nhưng giai đoạn Việt Nam ưu tiên nghe-nói-video trước.',
    mediaSubtitle: 'Nguồn nghe nhìn là mũi nhọn 2 tháng đầu: phát âm, nhịp nói, hội thoại đời thường, lớp học và ký túc.',
    vocabSubtitle: '8000 thẻ từ vựng, nhưng 2 tháng đầu chỉ lấy cụm cần nói ngay, không học danh sách dài.',
    grammarSubtitle: 'Ngữ pháp độc lập từ A0 đến C1: học theo bản đồ, ví dụ, lỗi sai và bài tập nhỏ, không học bảng khô.',
    mindmapSubtitle: 'Sơ đồ nhớ lâu: biến cách, phát âm, thể động từ, động từ chuyển động, từ vựng theo mạng và lộ trình.',
    storageSubtitle: 'Data Manager: quản lý file JSON nguồn, preview giới hạn, thêm mục, nhập/thay thế và xuất dữ liệu, không hiện code dài.',
    dialogueSubtitle: 'Tab chủ lực 2 tháng đầu: nghe, nhại, shadowing, đổi vai và phản xạ tình huống thật với bố cục mới sang, thoáng và ít rối.',
    writingSubtitle: 'Xưởng viết từ chữ Cyrillic, câu ngắn, email, báo cáo lab đến НИР/ВКР và kịch bản bảo vệ.',
    grammarInlineSubtitle: 'Ngữ pháp được cấy vào bài học, hội thoại và nhiệm vụ viết thay vì đứng cô lập.',
    handwritingSubtitle: 'Luyện chữ nằm trong tab Viết như tầng nền của kỹ năng viết.',
    routes: {
      overview: 'Tổng quan',
      learning: 'Học tập',
      dialogue: 'Đối thoại',
      writing: 'Viết',
      media: 'Video/Audio',
      vocab: 'Từ vựng',
      grammar: 'Ngữ pháp',
      mindmap: 'Mind map',
      storage: 'Lưu trữ'
    },
    learningTabs: {
      theory: 'Lý thuyết',
      exercises: 'Bài tập',
      practice: 'Nghe/Nói',
      review: 'Ôn tập',
      exam: 'Kiểm tra'
    },
    conceptsTitle: 'Ngữ pháp theo bài · dùng được ngay',
    conceptsNote: 'Ngữ pháp không đứng riêng: mỗi mục phải nối với câu nói, bài viết, email hoặc báo cáo thật.',
    practiceTitle: 'Nghe/Nói giao tiếp',
    practiceDialogueTitle: 'Kho hội thoại luyện nói',
    vocabLabels: {
      term: 'Cụm từ',
      pron: 'Phát âm',
      meaning: 'Nghĩa',
      example: 'Ví dụ',
      usage: 'Ứng dụng'
    }
  },
  stageLabels: {
    all: 'Tất cả giai đoạn',
    vn: 'Giai đoạn Việt Nam',
    prep: 'Giai đoạn dự bị',
    hk1: 'Bauman · HK1',
    hk2: 'Bauman · HK2',
    hk3: 'Bauman · HK3',
    hk4: 'Bauman · HK4'
  },
  nav: [
    ['overview','🧭','Tổng quan'],
    ['learning','🎓','Học tập'],
    ['dialogue','💬','Đối thoại'],
    ['writing','✍️','Viết'],
    ['media','🎬','Video/Audio'],
    ['vocab','🗂️','Từ vựng'],
    ['grammar','🧩','Ngữ pháp'],
    ['mindmap','🧠','Mind map'],
    ['storage','🗄️','Lưu trữ']
  ],
  learningTabs: [
    ['theory','📘','Lý thuyết'],
    ['exercises','📝','Bài tập'],
    ['practice','🎙️','Nghe/Nói'],
    ['review','🔁','Ôn tập'],
    ['exam','🧪','Kiểm tra']
  ],
  getStages(db){
    return Array.isArray(db.curriculum?.stages) ? db.curriculum.stages : [];
  },
  getModules(db){
    return Array.isArray(db.curriculum?.modules) ? db.curriculum.modules : [];
  },
  getLessons(db){ return Array.isArray(db.lessons) ? db.lessons : []; },
  getConcepts(db){ return Array.isArray(db.grammar) ? db.grammar : []; },
  getVocabulary(db){ return Array.isArray(db.vocab) ? db.vocab : []; },
  getExercises(db){ return Array.isArray(db.exercises) ? db.exercises : []; },
  getTests(db){ return Array.isArray(db.tests?.questions) ? db.tests.questions : []; },
  getTestLevels(db){ return Array.isArray(db.tests?.levels) ? db.tests.levels : []; },
  getPractice(db){ return Array.isArray(db.simulations) ? db.simulations : []; },
  getDialogues(db){ return Array.isArray(db.speaking) ? db.speaking : []; },
  getBasicDialogues(db){ return Array.isArray(db.speaking) ? db.speaking : []; },
  getBaumanDialogues(db){ return Array.isArray(db['dialogue-bauman-az']) ? db['dialogue-bauman-az'] : []; },
  getDeepSpeaking(db){ return Array.isArray(db['deep-speaking-bauman']) ? db['deep-speaking-bauman'] : []; },
  getSpeakingLinkIndex(db){ return db['speaking-link-index'] && typeof db['speaking-link-index']==='object' ? db['speaking-link-index'] : {}; },
  getHandwriting(db){ return Array.isArray(db.handwriting) ? db.handwriting : []; },
  getWriting(db){ return Array.isArray(db.writing) ? db.writing : []; },
  getMedia(db){ return Array.isArray(db.videos) ? db.videos : []; },
  stageOf(item){ return item?.stage || ''; },
  itemText(item){
    return [
      item?.id, item?.title, item?.ruTitle, item?.summary, item?.rule, item?.focus,
      item?.prompt, item?.answer, item?.question, item?.purpose, item?.title_ru,
      item?.context_title_ru,
      Array.isArray(item?.tags) ? item.tags.join(' ') : '',
      Array.isArray(item?.turns) ? item.turns.join(' ') : ''
    ].filter(Boolean).join(' ');
  },
  lessonTitle(item){ return item?.title || item?.ruTitle || item?.id || 'Bài học'; },
  lessonSubtitle(item){ return item?.summary || item?.ruTitle || ''; },
  conceptTitle(item){ return item?.title || item?.focus || item?.id || 'Mục kiến thức'; },
  conceptBody(item){ return item?.rule || item?.focus || item?.professor_note || ''; },
  exerciseTitle(item){ return item?.title || item?.taskType || item?.id || 'Bài tập'; },
  exercisePrompt(item){ return item?.prompt || ''; },
  exerciseAnswer(item){ return item?.answer || item?.rubric || ''; },
  exerciseLevel(item){ return item?.level || item?.difficulty || 'all'; },
  testQuestion(item){ return item?.question || item?.prompt || ''; },
  testChoices(item){ return Array.isArray(item?.choices) && item.choices.length ? item.choices : (Array.isArray(item?.options) ? item.options : []); },
  testAnswerIndex(item){
    if(Number.isFinite(Number(item?.answerIndex))) return Number(item.answerIndex);
    if(Number.isFinite(Number(item?.answer))) return Number(item.answer);
    const choices = this.testChoices(item).map(x => String(x ?? '').trim());
    return choices.indexOf(String(item?.answer ?? '').trim());
  },
  testExplanation(item){ return item?.explanation || item?.reasoningExplanation || item?.review || ''; },
  testLevel(item){ return item?.difficulty || item?.level || item?.subLevel || 'easy'; },
  practiceTitle(item){ return item?.title || item?.purpose || item?.id || 'Nghe/Nói'; },
  practiceSubtitle(item){ return item?.purpose || item?.assistantRole || ''; },
  practiceGroup(item){ return item?.group || item?.group_id || item?.type || 'general'; },
  practiceDifficulty(item){ return item?.difficulty_id || item?.difficulty || item?.level || 'all'; },
  dialogueTitle(item){ return item?.title_ru || item?.context_title_ru || item?.ruTitle || item?.id || 'Диалог'; },
  dialogueSubtitle(item){ return item?.purpose_ru || item?.context_title_ru || ''; },
  dialogueGroup(item){ return item?.group || item?.group_ru || 'general'; },
  dialogueDifficulty(item){ return item?.difficulty_id || item?.difficulty || item?.level || 'all'; },
  dialogueTurns(item){
    const speakers = Array.isArray(item?.speakers) ? item.speakers : [];
    if(Array.isArray(item?.utterances) && item.utterances.length) return item.utterances.map((turn,i)=>{
      if(typeof turn==='string') return {speaker:speakers[i]||(i%2?'B':'A'),ru:turn};
      const {vi,vi_text,translation_vi,gloss_vi,...safe}=turn||{};
      return {...safe,speaker:safe.speaker||speakers[i]||(i%2?'B':'A'),ru:safe.ru||safe.text_ru||safe.text||''};
    });
    const turns = Array.isArray(item?.turns) ? item.turns : [];
    return turns.map((ru,i)=>({speaker: speakers[i] || (i % 2 ? 'B' : 'A'), ru}));
  },
  mediaTitle(item){ return item?.title || item?.id || 'Media'; },
  mediaCategory(item){ return item?.category || item?.genre || item?.sourceType || 'general'; },
  mediaPurpose(item){ return item?.purpose || item?.sourceStatus || ''; },
  mediaUrl(item){ return item?.iframe || item?.url || ''; },
  vocabTerm(item){ return item?.ru || item?.phrase_ru || item?.front || item?.word || item?.term || ''; },
  vocabMeaning(item){ return item?.meaning_ru || item?.definition_ru || item?.context_ru || item?.illustration_label_ru || item?.scene_ru || ''; },
  vocabPron(item){ return item?.pronunciation || item?.pron || item?.transcription || ''; },
  vocabExample(item){ return item?.example || item?.voice_text || item?.usage || this.vocabTerm(item); },
  vocabUsage(item){ return item?.stage_method || item?.illustration_label_ru || ''; },
  vocabSearchText(item){
    return [this.vocabTerm(item), this.vocabMeaning(item), this.vocabPron(item), this.vocabExample(item), this.vocabUsage(item), Array.isArray(item?.tags) ? item.tags.join(' ') : ''].filter(Boolean).join(' ');
  },
  handwritingPrint(item){ return item?.print || item?.text || item?.letter || ''; },
  handwritingCursive(item){ return item?.cursive || item?.text || item?.letter || ''; },
  handwritingNote(item){ return item?.note || item?.vi || item?.purpose || ''; },
  handwritingText(item){ return [item?.print,item?.cursive,item?.text,item?.copy,item?.note,item?.mode,item?.stage].filter(Boolean).join(' '); },
  writingTitle(item){ return item?.title || item?.prompt_vi || item?.id || 'Nhiệm vụ viết'; },
  writingMode(item){ return item?.mode || item?.type || 'sentence'; },
  writingPurpose(item){ return item?.purpose || item?.prompt_vi || ''; },
  writingText(item){ return [item?.id,item?.title,item?.purpose,item?.prompt_vi,item?.prompt_ru,item?.model_ru,item?.model_vi,item?.mode,Array.isArray(item?.required_patterns)?item.required_patterns.join(' '):'',Array.isArray(item?.vocab_suggestions_ru)?item.vocab_suggestions_ru.join(' '):'',Array.isArray(item?.grammar_focus)?item.grammar_focus.join(' '):''].filter(Boolean).join(' '); },
  speech: {
    lang: 'ru-RU',
    textForVocab(item){ return window.SUBJECT_ADAPTER.vocabTerm(item); },
    textForDialogue(item){ return (Array.isArray(item?.turns) ? item.turns : []).join('. '); }
  }
};
