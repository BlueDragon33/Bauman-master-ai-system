'use strict';
(function(){
const A=window.SUBJECT_ADAPTER||{};
const VERSION='Russian Survival Master V13.33 · Route Grammar Mind Check';
const DATA_FILES=A.dataFiles||['curriculum','lessons','grammar','grammar-path','vocab','mindmap','exercises','tests','simulations','speaking','handwriting','writing','videos','knowledge-index'];
const OPTIONAL_DATA_FILES=A.optionalDataFiles||['dialogue-bauman-az','deep-speaking-bauman','speaking-link-index'];
const ALL_STORAGE_FILES=Array.from(new Set([...DATA_FILES,...OPTIONAL_DATA_FILES]));
const DATA_ROOT=A.dataRoot||'data/';
const EXTERNAL_DATA_ROOT=A.externalDataRoot||'external-data/';
const PACKAGE_ROOT=A.packageRoot||'subjects/russian/';
const NAV=A.nav||[['overview','🧭','Tổng quan'],['learning','🎓','Học tập'],['dialogue','💬','Đối thoại'],['writing','✍️','Viết'],['media','🎬','Video/Audio'],['vocab','🗂️','Từ vựng'],['grammar','🧩','Ngữ pháp'],['mindmap','🧠','Mind map'],['storage','🗄️','Lưu trữ']];
const LEARN_TABS=A.learningTabs||[['theory','📘','Lý thuyết'],['exercises','📝','Bài tập'],['practice','🎙️','Nghe/Nói'],['review','🔁','Ôn tập'],['exam','🧪','Kiểm tra']];
const DEFAULT={stage:'vn',view:'overview',learnTab:'theory',lessonId:'',slide:0,lessonQuery:'',conceptQuery:'',exerciseLevel:'all',exerciseIndex:0,testLevel:'easy',testIndex:0,testAnswer:null,reviewLevel:'easy',reviewFilter:'all',reviewLesson:'all',reviewIndex:0,reviewPage:0,reviewAnswer:null,reviewProgress:{done:{},flagged:{},wrong:{}},examLevel:'easy',examCycle:'auto',examPaperLevel:'easy',examPaperType:'standard',examIndex:0,examPage:0,examAnswer:null,examProgress:{answers:{},marked:{},submitted:false,submittedAt:null,result:null,wrong:{},paperResults:{}},examHistory:[],remedialPlan:{active:false,cards:[],completed:{},createdAt:null,lastExamAt:null,lastScore:null},dialogueId:'',dialogueGroup:'all',dialogueDifficulty:'all',dialogueQuery:'',dialogueLineIndex:0,dialogueRole:'all',dialogueHideVi:false,dialoguePeople:'2',dialogueMinutes:'10',dialogueMode:'shadow_roleplay',dialogueScenario:'classroom',practiceDialogueId:'',practiceGroup:'all',practiceDifficulty:'all',practiceQuery:'',practiceLineIndex:0,practiceRole:'all',practiceHideVi:false,practiceSpeechResults:{},dialogueSpeechResults:{},deepSpeakingId:'',deepSpeakingMode:'overview',deepSpeakingStep:0,deepSpeakingProgress:{done:{},weak:{},attempts:{},lastMode:{}},optionalDataLoading:{},optionalDataError:{},speechResults:{},speechRecording:false,speechAutoNext:false,mediaCat:'all',mediaQuery:'',mediaView:'list',mediaId:'',vocabQuery:'',vocabIndex:0,vocabPage:0,vocabFlipped:false,grammarLevel:'all',grammarTrack:'all',grammarQuery:'',grammarIndex:0,mindmapId:'roadmap-map',mindmapNode:'',mindmapFontScale:14,mindmapDrag:{},mindmapLayoutVersion:'v13_32_clean',writingMode:'handwriting',handwritingIndex:0,handwritingQuery:'',handwritingStep:0,handwritingPractice:'trace',handwritingShowGuide:true,handwritingShowLines:true,writingIndex:0,writingQuery:'',writingDraft:'',storageFile:'curriculum',storageGroup:'all',storageText:'',storagePreviewLimit:0,storagePreviewAutoCollapsedV1322:false,storageQuery:'',storageTreeOpen:{},aiDraft:'',aiOutput:'',interfaceTheme:'clean',interfaceDensity:'normal',hostTask:null,planningBundle:null,routeEdit:false,routeManual:null,routeFocus:'today',testSession:{answered:0,correct:0,targetQuestions:100,targetScore:80,seen:{}},recentAccess:[],stageGate:null,examGateSource:null,stageTransitions:[],lastStageTransition:null};
let DB={},state={...DEFAULT},canvas=null,ctx=null,drawing=false,strokes=[],currentStroke=null,penColor='#111827',penSize=6,speechRecognizer=null;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const arr=v=>Array.isArray(v)?v:[], str=v=>String(v??''), esc=v=>str(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])), lower=v=>str(v).toLowerCase();
const uniq=a=>Array.from(new Set(arr(a).filter(Boolean))); const key=A.storageKey||'bauman_russian_v11_clean_skeleton';
function safeParseJson(raw,fallback){try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}}
function safeLocalJson(keyName,fallback={},maxChars=3500000){
 try{
  const raw=localStorage.getItem(keyName);
  if(!raw)return fallback;
  if(raw.length>maxChars){
   console.warn('LocalStorage payload quá lớn, bỏ qua để tránh treo giao diện',keyName,raw.length);
   localStorage.removeItem(keyName);
   return fallback;
  }
  return safeParseJson(raw,fallback);
 }catch(e){console.warn('Không đọc được localStorage',keyName,e);return fallback;}
}
function cleanDbOverlay(overlay){
 const out={};
 Object.keys(overlay||{}).forEach(k=>{if(!OPTIONAL_DATA_FILES.includes(k))out[k]=overlay[k];});
 return out;
}
function byId(list,id){return arr(list).find(x=>(x?.id||x?.title)===id)}
function call(name,fallback,...args){return typeof A[name]==='function'?A[name](...args):fallback}
function save(){try{localStorage.setItem(key,JSON.stringify(state)); const s=$('#saveState'); if(s)s.textContent='Đã đồng bộ'}catch(e){}}
function loadState(){const stored=safeLocalJson(key,{},1600000); state={...DEFAULT,...stored,testSession:{...DEFAULT.testSession,...(stored.testSession||{})},speechResults:{...(stored.speechResults||{})},practiceSpeechResults:{...(stored.practiceSpeechResults||{})},dialogueSpeechResults:{...(stored.dialogueSpeechResults||{})},deepSpeakingProgress:{done:{},weak:{},attempts:{},lastMode:{},...(stored.deepSpeakingProgress||{})},optionalDataLoading:{},optionalDataError:{...(stored.optionalDataError||{})},reviewProgress:{done:{},flagged:{},wrong:{},...(stored.reviewProgress||{})},examProgress:{answers:{},marked:{},submitted:false,submittedAt:null,result:null,wrong:{},paperResults:{},...(stored.examProgress||{})},examHistory:arr(stored.examHistory).slice(0,20),remedialPlan:{active:false,cards:[],completed:{},createdAt:null,lastExamAt:null,lastScore:null,...(stored.remedialPlan||{})},recentAccess:arr(stored.recentAccess)}; sanitize()}
function sanitize(){const views=NAV.map(x=>x[0]); const tabs=LEARN_TABS.map(x=>x[0]); if(!views.includes(state.view))state.view='overview'; if(!tabs.includes(state.learnTab))state.learnTab='theory'; ['vocabIndex','vocabPage','grammarIndex','slide','exerciseIndex','testIndex','reviewIndex','reviewPage','examIndex','examPage','dialogueLineIndex','practiceLineIndex','deepSpeakingStep','handwritingIndex','handwritingStep','writingIndex'].forEach(k=>state[k]=Math.max(0,Number(state[k])||0)); if(state.learnTab==='tests')state.learnTab='review'; state.reviewProgress={done:{},flagged:{},wrong:{},...(state.reviewProgress||{})}; state.examProgress={answers:{},marked:{},submitted:false,submittedAt:null,result:null,wrong:{},paperResults:{},...(state.examProgress||{})}; if(!EXAM_PAPER_ORDER.includes(state.examPaperType))state.examPaperType=EXAM_PAPER_ORDER.includes(state.examPaperLevel)?state.examPaperLevel:'standard'; state.examPaperLevel=state.examPaperType; state.examCycle='auto'; state.examHistory=arr(state.examHistory).slice(0,20); state.remedialPlan={active:false,cards:[],completed:{},createdAt:null,lastExamAt:null,lastScore:null,...(state.remedialPlan||{})}; normalizeRemedialPlan(); state.testSession={...DEFAULT.testSession,...(state.testSession||{})}; state.speechResults={...(state.speechResults||{})}; state.practiceSpeechResults={...(state.practiceSpeechResults||{}),...(state.speechResults||{})}; state.dialogueSpeechResults={...(state.dialogueSpeechResults||{})}; state.deepSpeakingProgress={done:{},weak:{},attempts:{},lastMode:{},...(state.deepSpeakingProgress||{})}; state.optionalDataLoading={}; state.optionalDataError={...(state.optionalDataError||{})}; state.speechRecording=false; state.recentAccess=arr(state.recentAccess).slice(0,6); if(!state.storagePreviewAutoCollapsedV1322){state.storagePreviewLimit=0;state.storagePreviewAutoCollapsedV1322=true;} state.mindmapFontScale=normalizeMindFontSize(state.mindmapFontScale); state.mindmapDrag=state.mindmapDrag&&typeof state.mindmapDrag==='object'?state.mindmapDrag:{}; if(state.mindmapLayoutVersion!=='v13_32_clean'){state.mindmapDrag={};state.mindmapLayoutVersion='v13_32_clean';} state.stageGate=state.stageGate&&typeof state.stageGate==='object'?state.stageGate:null; state.examGateSource=state.examGateSource&&typeof state.examGateSource==='object'?state.examGateSource:null; state.stageTransitions=arr(state.stageTransitions).filter(x=>x&&x.schema==='RUSSIAN_STAGE_TRANSITION_V1').slice(-30); state.lastStageTransition=state.stageTransitions[state.stageTransitions.length-1]||null;}
async function loadData(){const overlay=cleanDbOverlay(safeLocalJson(key+'_db',{},3500000)); for(const f of DATA_FILES){try{DB[f]=await fetch(`${DATA_ROOT}${f}.json`).then(r=>r.ok?r.json():null)}catch(e){DB[f]=null}} DB={...DB,...overlay};}
function dbForLocalStorage(){const out={}; Object.keys(DB||{}).forEach(k=>{if(!OPTIONAL_DATA_FILES.includes(k))out[k]=DB[k]}); return out;}
function saveDB(){try{localStorage.setItem(key+'_db',JSON.stringify(dbForLocalStorage()));}catch(e){toast('Trình duyệt không cho lưu DB lớn')}}
function isOptionalFile(name){return OPTIONAL_DATA_FILES.includes(name)}
function optionalSourcePath(name){return A.dataSourceMeta?.[name]?.path||`${DATA_ROOT}${name}.json`}
async function loadOptionalData(name,quiet=false){
 if(!isOptionalFile(name))return DB[name];
 if(DB[name])return DB[name];
 state.optionalDataLoading=state.optionalDataLoading||{}; state.optionalDataError=state.optionalDataError||{}; state.optionalDataLoading[name]=true; delete state.optionalDataError[name]; if(!quiet)render();
 try{const data=await fetch(optionalSourcePath(name)).then(r=>r.ok?r.json():Promise.reject(new Error('HTTP '+r.status))); DB[name]=data; delete state.optionalDataError[name]; if(!quiet)toast('Đã tải '+sourceLabel(name)); return data;}
 catch(e){DB[name]=null; state.optionalDataError[name]=String(e?.message||e); if(!quiet)toast('Không tải được '+sourceLabel(name)); return null;}
 finally{state.optionalDataLoading[name]=false; save(); if(!quiet)render();}
}
function optionalReady(name){return !!DB[name]}
function renderOptionalDataGate(name,title,detail){const loading=state.optionalDataLoading?.[name]; const err=state.optionalDataError?.[name]; return `<section class="panel optional-data-gate"><span class="chip">Nguồn tùy chọn · lazy load</span><h3>${esc(title||sourceLabel(name))}</h3><p>${esc(detail||'Nguồn dữ liệu này khá lớn, chỉ tải khi bạn thật sự dùng để giữ app nhẹ và ổn định.')}</p>${err?`<p class="danger-text">${esc(err)}</p>`:''}<button class="btn primary" data-load-optional="${esc(name)}" ${loading?'disabled':''}>${loading?'Đang tải...':'Tải nguồn này'}</button></section>`}

function stages(){return [{id:'all',title:A.stageLabels?.all||'Tất cả'},...arr(call('getStages',[],DB))]}
function stageTitle(id=state.stage){return A.stageLabels?.[id]||stages().find(x=>x.id===id)?.title||id}
function stageOf(x){return A.stageOf?A.stageOf(x):(x?.stage||'')}
function byStage(list){return arr(list).filter(x=>state.stage==='all'||!stageOf(x)||stageOf(x)===state.stage)}
function textOf(x){return A.itemText?A.itemText(x):JSON.stringify(x)}
function getLessons(){return byStage(call('getLessons',[],DB)).filter(x=>!state.lessonQuery||lower(textOf(x)).includes(lower(state.lessonQuery)))}
function getConcepts(){return byStage(call('getConcepts',[],DB)).filter(x=>!state.conceptQuery||lower(textOf(x)).includes(lower(state.conceptQuery)))}
function lessonKey(x){return str(x?.id||x?.lessonId||x?.title||'').trim()}
function activeLessonContext(){
 const visible=getLessons();
 const all=byStage(call('getLessons',[],DB));
 const lesson=visible.find(l=>lessonKey(l)===state.lessonId)||(state.lessonQuery?visible[0]:all.find(l=>lessonKey(l)===state.lessonId))||visible[0]||all[0]||{};
 const id=lessonKey(lesson);
 return {lesson,id,stage:stageOf(lesson)||state.stage,title:A.lessonTitle?.(lesson)||lesson?.title||id||'Bài học hiện tại'};
}
function sameLesson(x,id){return str(x?.lessonId||x?.routeId||x?.chapterId||'').trim()===str(id).trim()}
function getExercises(){
 const ctx=activeLessonContext();
 let xs=byStage(call('getExercises',[],DB)).filter(x=>ctx.id&&sameLesson(x,ctx.id));
 const open=learningUnlockedLevels();
 if(state.exerciseLevel!=='all'&&!isLearningLevelUnlocked(state.exerciseLevel))state.exerciseLevel='all';
 xs=xs.filter(x=>open.includes(canonicalLevel(A.exerciseLevel?.(x)||x.level||x.difficulty||'easy')));
 if(state.exerciseLevel!=='all')xs=xs.filter(x=>canonicalLevel(A.exerciseLevel?.(x)||x.level||x.difficulty||'easy')===state.exerciseLevel);
 return xs;
}
function getBasicSpeakingDialogues(){return Array.isArray(DB.speaking)?DB.speaking:[]}
function getBaumanDialogueAZ(){return Array.isArray(DB['dialogue-bauman-az'])?DB['dialogue-bauman-az']:[]}
function getDeepSpeakingUnits(){return Array.isArray(DB['deep-speaking-bauman'])?DB['deep-speaking-bauman']:[]}
function getSpeakingLinkIndex(){return DB['speaking-link-index']&&typeof DB['speaking-link-index']==='object'?DB['speaking-link-index']:{} }
function getPracticeDialogues(){
 const ctx=activeLessonContext();
 const base=byStage(getBasicSpeakingDialogues()).filter(x=>ctx.id&&sameLesson(x,ctx.id));
 const groups=uniq(base.map(x=>A.dialogueGroup?.(x)||x.group||'general'));
 const diffs=uniq(base.map(x=>A.dialogueDifficulty?.(x)||x.difficulty||x.level||'all'));
 if(state.practiceGroup!=='all'&&!groups.includes(state.practiceGroup))state.practiceGroup='all';
 if(state.practiceDifficulty!=='all'&&!diffs.includes(state.practiceDifficulty))state.practiceDifficulty='all';
 let xs=base;
 if(state.practiceGroup!=='all')xs=xs.filter(x=>(A.dialogueGroup?.(x)||x.group||'general')===state.practiceGroup);
 if(state.practiceDifficulty!=='all')xs=xs.filter(x=>(A.dialogueDifficulty?.(x)||x.difficulty||x.level||'all')===state.practiceDifficulty);
 if(state.practiceQuery)xs=xs.filter(x=>lower(textOf(x)).includes(lower(state.practiceQuery)));
 return xs;
}
function getTests(level=state.reviewLevel||state.testLevel||'easy'){return byStage(call('getTests',[],DB)).filter(x=>(A.testLevel?.(x)||x.difficulty||x.level||'easy')===level)}

function getReviewBaseQuestions(){
 const all=byStage(call('getTests',[],DB));
 // Khi đang xử lý câu sai/cắm cờ sau kiểm tra, cần quét toàn bộ mức để không bỏ rơi câu medium/hard/expert.
 if(['wrong','flagged'].includes(state.reviewFilter||''))return all;
 return all.filter(x=>(A.testLevel?.(x)||x.difficulty||x.level||'easy')===(state.reviewLevel||'easy'));
}
function reviewQuestionKey(q,i=0){return questionId(q,i,'review')}
function reviewQuestionState(q,i=0){const id=reviewQuestionKey(q,i); const done=!!state.reviewProgress.done?.[id]; const flagged=!!state.reviewProgress.flagged?.[id]&&!done; const wrong=!!state.reviewProgress.wrong?.[id]; return {id,done,flagged,wrong,status:done?'done':flagged?'flagged':'new'};}
function reviewLessonKey(q){return str(q?.lessonId||q?.chapterId||q?.lesson||q?.moduleId||'other')}
function reviewLessonTitle(q){return q?.lessonTitle||q?.chapter||q?.moduleTitle||reviewLessonKey(q)}
function getReviewQuestions(){let xs=getReviewBaseQuestions(); if(state.reviewLesson&&state.reviewLesson!=='all')xs=xs.filter(q=>reviewLessonKey(q)===state.reviewLesson); const f=state.reviewFilter||'all'; if(f!=='all')xs=xs.filter((q,i)=>{const s=reviewQuestionState(q,i); if(f==='new')return !s.done&&!s.flagged; if(f==='done')return s.done; if(f==='flagged')return s.flagged; if(f==='wrong')return s.wrong; return true}); return xs}
function reviewCounts(list=getReviewBaseQuestions()){const out={total:0,new:0,done:0,flagged:0,wrong:0,remaining:0}; arr(list).forEach((q,i)=>{const s=reviewQuestionState(q,i); out.total++; if(s.done)out.done++; else if(s.flagged)out.flagged++; else out.new++; if(s.wrong)out.wrong++;}); out.remaining=out.new+out.flagged+out.wrong; return out;}
function reviewLessonOptions(){const base=getReviewBaseQuestions(); const map=new Map(); base.forEach(q=>{const k=reviewLessonKey(q); if(!map.has(k))map.set(k,reviewLessonTitle(q));}); return `<option value="all">Tất cả bài</option>${Array.from(map.entries()).map(([k,v])=>`<option value="${esc(k)}" ${state.reviewLesson===k?'selected':''}>${esc(k+' · '+clip(v,58))}</option>`).join('')}`}
function reviewFilterOptions(){return [['all','Tất cả'],['new','Chưa làm'],['flagged','Cắm cờ'],['done','Đã làm'],['wrong','Câu sai']].map(([k,v])=>`<option value="${k}" ${state.reviewFilter===k?'selected':''}>${v}</option>`).join('')}


const EXAM_LEVEL_ORDER=['easy','medium','hard','expert'];
const EXAM_PAPER_ORDER=['standard','intensive','advanced','deep'];
const EXAM_PAPER_TYPES={
 standard:{label:'Phổ thông',total:20,counts:{easy:6,medium:6,hard:4,expert:4},note:'20 câu · 30% dễ, 30% trung bình, 20% khá, 20% giỏi'},
 intensive:{label:'Tăng cường',total:40,counts:{easy:12,medium:12,hard:8,expert:8},note:'40 câu · 30% dễ, 30% trung bình, 20% khá, 20% giỏi'},
 advanced:{label:'Nâng cao',total:60,counts:{easy:18,medium:18,hard:12,expert:12},note:'60 câu · 30% dễ, 30% trung bình, 20% khá, 20% giỏi'},
 deep:{label:'Chuyên sâu',total:100,counts:{easy:30,medium:30,hard:20,expert:20},note:'100 câu · 30% dễ, 30% trung bình, 20% khá, 20% giỏi'}
};
const EXAM_CYCLE_MILESTONES=[7,14,21,28];
const EXAM_LAYOUT_TEST_UNLOCK=true;
const REVIEW_PAGE_SIZE=20;
const EXAM_PAGE_SIZE=20;
function examPageSize(level=activeExamType()){const cfg=examPaperConfig(level); return Number(cfg.total)===100?25:20;}
function examFlagGridClass(level=activeExamType()){return examPageSize(level)===25?'v1313-flag-5x5':'v1313-flag-4x5';}
function reviewPageSize(qs){const total=Array.isArray(qs)?qs.length:Number(qs||0); return total>=100?25:20;}
function reviewFlagGridClass(qs){return reviewPageSize(qs)===25?'v1313-flag-5x5':'v1313-flag-4x5';}
const VOCAB_PAGE_SIZE=20;
function examLevelLabel(l){return ({easy:'Dễ',medium:'Trung bình',hard:'Khá',expert:'Giỏi',standard:'Phổ thông',intensive:'Tăng cường',advanced:'Nâng cao',deep:'Chuyên sâu'})[l]||l}
function examPaperLabel(t=activeExamType()){return examLevelLabel(t)}
function examPaperConfig(t=activeExamType()){return EXAM_PAPER_TYPES[t]||EXAM_PAPER_TYPES.standard}
function activeExamType(){if(!EXAM_PAPER_ORDER.includes(state.examPaperType))state.examPaperType='standard'; return state.examPaperType||'standard'}
function canonicalLevel(l){return ({beginner:'easy',basic:'easy',dễ:'easy','de':'easy','trung bình':'medium','trung binh':'medium',intermediate:'medium',normal:'medium',khá:'hard','kha':'hard',advanced:'hard',hard:'hard',giỏi:'expert','gioi':'expert',fluent:'expert',expert:'expert'})[lower(l)]||l}
function exerciseLevelLabel(l){const lv=canonicalLevel(l); return lv==='all'?'Tất cả mức đã mở':examLevelLabel(lv)}
function learningUnlockedLevels(day=rawLearningDay()){if(day>=28)return ['easy','medium','hard','expert']; if(day>=21)return ['easy','medium','hard']; if(day>=14)return ['easy','medium']; return ['easy']}
function isLearningLevelUnlocked(level){const lv=canonicalLevel(level); return lv==='all'||learningUnlockedLevels().includes(lv)}
function exerciseLevelOptions(selected=state.exerciseLevel){const levels=['easy','medium','hard','expert']; const opts=[`<option value="all" ${selected==='all'?'selected':''}>Tất cả mức đã mở</option>`]; return opts.concat(levels.map(l=>`<option value="${l}" ${selected===l?'selected':''} ${isLearningLevelUnlocked(l)?'':'disabled'}>${esc(examLevelLabel(l)+(isLearningLevelUnlocked(l)?'':' 🔒'))}</option>`)).join('')}
function cleanExercisePrompt(ex){let text=normalizeSlideValue(A.exercisePrompt?.(ex)||ex?.prompt||''); const lines=text.split(/\n+/).map(x=>x.trim()).filter(Boolean); if(lines.length>1&&!/^nhiệm vụ|^câu|^bài\s*\d+/i.test(lines[0])&&/^nhiệm vụ|^câu|^bài\s*\d+/i.test(lines[1])) lines.shift(); return lines.join('\n')}
function examPlanLevels(){return arr(DB.tests?.levels||DB.tests?.examPlan?.levels)}
function examLevelCount(level){return examPaperConfig(level).total||20}
function rawLearningDay(){
 const bundle=state.planningBundle||{}; let session={};
 try{session=typeof planSession==='function'?planSession():{}}catch(_){session={}}
 const todayKey=new Date().toISOString().slice(0,10);
 const sessions=arr(bundle?.plan?.sessions);
 const todayIndex=sessions.findIndex(x=>str(x?.date||'')===todayKey);
 const candidates=[
  bundle.currentDay,bundle.learningDay,bundle.studyDay,bundle.day,bundle?.today?.day,bundle?.today?.order,
  bundle?.plan?.currentDay,bundle?.plan?.learningDay,state.hostTask?.currentDay,state.hostTask?.learningDay,
  state.hostTask?.studyDay,state.hostTask?.day,state.hostTask?.order,session.order,todayIndex>=0?todayIndex+1:0
 ].map(Number).filter(n=>Number.isFinite(n)&&n>0);
 return candidates.length?Math.max(...candidates):0;
}
function unlockedExamCycleDays(day=rawLearningDay()){return 28;}
function requestedExamCycleDays(){return 28;}
function derivedExamCycleDays(){return 28;}
function examLevelsForCycle(days=derivedExamCycleDays()){return EXAM_PAPER_ORDER;}
function examCycleTitle(days=derivedExamCycleDays()){const cfg=examPaperConfig(); return `${cfg.label} · ${cfg.total} câu`;}
function examUnlockState(){return {day:rawLearningDay(),unlockedCycle:28,activeCycle:28,levels:EXAM_PAPER_ORDER,locked:false,next:null,daysLeft:0};}
function isExamLevelUnlocked(level){return EXAM_PAPER_ORDER.includes(level)||EXAM_LEVEL_ORDER.includes(level)}
function isExamCycleUnlocked(days){return true}
function routeResetLocked(){return false}
function routeResetLockMessage(){return 'Có thể Reset đề kiểm tra khi cần.'}


/* V13.17 Academic stage-gate: kiểm tra chỉ mở từ Lịch hôm nay, mở khóa theo phần. */
const STAGE_GATE_STORAGE_VERSION='v13.17-stage-gate';
function currentStageId(){return state.stage&&state.stage!=='all'?state.stage:'vn'}
function curriculumStages(){return arr(DB.curriculum?.stages)}
function curriculumStage(id=currentStageId()){return curriculumStages().find(x=>x.id===id)||{id,title:stageTitle(id),period:''}}
function parseMonthRangeDays(text=''){
 const m=String(text||'').match(/(\d{1,2})\/(\d{4})\s*[–-]\s*(\d{1,2})\/(\d{4})/);
 if(!m)return 0;
 const a=new Date(Number(m[2]),Number(m[1])-1,1), b=new Date(Number(m[4]),Number(m[3])-1,1);
 const months=Math.max(1,(b.getFullYear()-a.getFullYear())*12+(b.getMonth()-a.getMonth())+1);
 return months*30;
}
function stageDurationDays(stageId=currentStageId()){
 const st=curriculumStage(stageId); const txt=lower([st.period,st.duration,st.title,st.goal].filter(Boolean).join(' '));
 const explicit=Number(st.days||st.durationDays||st.totalDays||0); if(explicit>0)return explicit;
 const d=parseMonthRangeDays(txt); if(d)return d;
 const day=txt.match(/(\d+)\s*(ngày|day)/); if(day)return Number(day[1]);
 const week=txt.match(/(\d+)\s*(tuần|week)/); if(week)return Number(week[1])*7;
 const month=txt.match(/(\d+)\s*(tháng|month)/); if(month)return Number(month[1])*30;
 if(/hk|học kỳ|semester|dự bị|prep|stankin|bauman/.test(txt))return 90;
 return 28;
}
function stagePartCount(stageId=currentStageId()){
 const d=stageDurationDays(stageId);
 if(d>21)return 4;
 if(d>=14)return 3;
 return 2;
}
function stageGateDefaults(stageId=currentStageId()){
 const parts=stagePartCount(stageId);
 return {version:STAGE_GATE_STORAGE_VERSION,currentStage:stageId,currentPart:1,totalParts:parts,unlockedPart:1,completedTasks:{},completedReviews:{},completedExamPapers:{},lastUnlockedAt:null,lastExamSource:null};
}
function ensureStageGate(){
 const stageId=currentStageId(); const parts=stagePartCount(stageId);
 if(!state.stageGate||typeof state.stageGate!=='object')state.stageGate=stageGateDefaults(stageId);
 state.stageGate.version=STAGE_GATE_STORAGE_VERSION;
 state.stageGate.completedTasks=state.stageGate.completedTasks||{};
 state.stageGate.completedReviews=state.stageGate.completedReviews||{};
 state.stageGate.completedExamPapers=state.stageGate.completedExamPapers||{};
 if(state.stageGate.currentStage!==stageId){state.stageGate.currentStage=stageId; state.stageGate.currentPart=1; state.stageGate.unlockedPart=1;}
 state.stageGate.totalParts=parts;
 state.stageGate.currentPart=Math.min(parts,Math.max(1,Number(state.stageGate.currentPart||1)));
 state.stageGate.unlockedPart=Math.min(parts,Math.max(Number(state.stageGate.unlockedPart||1),state.stageGate.currentPart));
 return state.stageGate;
}
function gateState(){return ensureStageGate()}
function gatePart(){return gateState().currentPart||1}
function gateTotalParts(){return gateState().totalParts||stagePartCount()}
function gateKey(part=gatePart(),stageId=currentStageId()){return `${stageId}::part${part}`}
function partRequirements(part=gatePart(),totalParts=gateTotalParts()){
 const p=Math.max(1,Math.min(Number(part)||1,Number(totalParts)||4));
 return {standard:p,intensive:Math.max(0,p-1),advanced:Math.max(0,p-2),deep:Math.max(0,p-3)};
}
function partRequirementRows(part=gatePart(),totalParts=gateTotalParts()){
 const req=partRequirements(part,totalParts);
 return EXAM_PAPER_ORDER.map(type=>({type,label:examPaperLabel(type),need:Number(req[type]||0),done:gateExamCount(type,part)})).filter(x=>x.need>0);
}
function gateRecords(part=gatePart()){const g=gateState(); return arr(g.completedExamPapers?.[gateKey(part)]);}
function gateExamCount(type,part=gatePart()){return gateRecords(part).filter(x=>x.type===type&&x.passed).length}
function gateNeedFor(type,part=gatePart()){return Number(partRequirements(part,gateTotalParts())[type]||0)}
function gateTypeComplete(type,part=gatePart()){return gateExamCount(type,part)>=gateNeedFor(type,part)}
function gateNextNeededType(part=gatePart()){
 return EXAM_PAPER_ORDER.find(type=>gateExamCount(type,part)<gateNeedFor(type,part))||null;
}
function gatePartComplete(part=gatePart()){return !gateNextNeededType(part)}
function strictPartLessonIds(part=gatePart(),stageId=currentStageId()){
 const lessons=call('getLessons',[],DB).filter(l=>(stageOf(l)||stageId)===stageId);
 const total=stagePartCount(stageId),chunk=Math.max(1,Math.ceil(lessons.length/total));
 const base=lessons.slice((part-1)*chunk,part*chunk).map(l=>lessonKey(l)||l.id||l.title).filter(Boolean);
 const extra=[];
 try{
  const s=normalizeRouteSession(planSession());
  [...arr(s.blocks),...arr(s.cards)].forEach(x=>{['lessonId','lesson','chapterId','moduleId'].forEach(k=>{if(x&&x[k])extra.push(String(x[k]));});});
 }catch(_){}
 return uniq([...base,...extra]);
}
function partDueReviewItems(part=gatePart(),stageId=currentStageId()){
 const api=window.RussianLearningState;if(!api||typeof api.dueReviews!=='function')return [];
 const ids=new Set(strictPartLessonIds(part,stageId));
 try{return api.dueReviews().filter(item=>ids.has(str(item?.lessonId||item?.route?.lessonId||'')));}
 catch(_){return [];}
}
function partLearningReadiness(part=gatePart(),stageId=currentStageId()){
 const ids=strictPartLessonIds(part,stageId);
 const api=window.RussianLearningFlow;
 const coreSteps=['theory','speaking','exercises','check'];
 if(!ids.length)return {available:true,ok:true,total:0,ready:0,rows:[],missing:[]};
 if(!api||typeof api.get!=='function'||typeof api.hasMeaningfulEvidence!=='function'){
  return {available:false,ok:false,total:ids.length,ready:0,rows:ids.map(id=>({id,ready:false,done:0,missing:[...coreSteps]})),missing:ids};
 }
 const flow=api.get()||{};
 const rows=ids.map(id=>{
  const steps=flow.lessons?.[id]?.steps||{};
  const missing=coreSteps.filter(step=>!api.hasMeaningfulEvidence(step,steps?.[step]));
  return {id,ready:missing.length===0,done:coreSteps.length-missing.length,missing};
 });
 const ready=rows.filter(x=>x.ready).length;
 return {available:true,ok:rows.every(x=>x.ready),total:rows.length,ready,rows,missing:rows.filter(x=>!x.ready).map(x=>x.id)};
}
function gateUnlockStatus(part=gatePart()){
 const examComplete=gatePartComplete(part),due=partDueReviewItems(part),readiness=partLearningReadiness(part);
 const finalPart=Number(part)>=Number(gateTotalParts());
 const stageExit=finalPart?window.RussianCapabilityProgression?.stageExitStatus?.(currentStageId()):null;
 const blockers=[];
 if(!examComplete)blockers.push('Chưa đủ yêu cầu kiểm tra của phần hiện tại.');
 if(!readiness.ok)blockers.push(`Bằng chứng học cốt lõi mới đủ ở ${readiness.ready}/${readiness.total} bài của phần này.`);
 if(due.length)blockers.push(`Còn ${due.length} mục Review Queue đến hạn trong phần này.`);
 if(stageExit&&!stageExit.allowed)blockers.push(stageExit.blockers?.[0]||'Stage chưa đủ bằng chứng học thật để chuyển tiếp.');
 return {allowed:examComplete&&readiness.ok&&due.length===0&&(!stageExit||stageExit.allowed),examComplete,readiness,dueReviews:due,stageExit,finalPart,blockers};
}
function readinessStepRoute(lessonId,step){
 const id=str(lessonId||'');
 const map={
  theory:{view:'learning',learnTab:'theory',lessonId:id},
  speaking:{view:'learning',learnTab:'practice',lessonId:id},
  exercises:{view:'learning',learnTab:'exercises',lessonId:id},
  check:{view:'learning',learnTab:'review',lessonId:id,reviewLesson:id,reviewFilter:'all'}
 };
 return map[step]||map.theory;
}
function readinessStepLabel(step){
 return ({theory:'Bài học',speaking:'Nghe & nói',exercises:'Bài tập',check:'Kiểm tra theo bài'})[step]||step;
}
function stageReadinessNextTarget(part=gatePart()){
 const unlock=gateUnlockStatus(part);
 const row=arr(unlock.readiness?.rows).find(x=>!x.ready&&arr(x.missing).length);
 if(row){
  const step=row.missing[0];
  return {kind:'evidence',lessonId:row.id,step,label:`${row.id} · ${readinessStepLabel(step)}`,route:readinessStepRoute(row.id,step),unlock};
 }
 const due=arr(unlock.dueReviews)[0];
 if(due)return {kind:'review',label:due.label||'Mục ôn đến hạn',route:{...(due.route||{view:'learning',learnTab:'review'})},reviewId:due.id,unlock};
 const next=gateNextNeededType(part);
 if(next)return {kind:'exam',paperType:next,label:examPaperLabel(next),unlock};
 if(unlock.allowed)return {kind:'unlock',label:'Đủ điều kiện mở khóa',unlock};
 return {kind:'blocked',label:unlock.blockers?.[0]||'Cần bổ sung bằng chứng',unlock};
}
function registerGateExamPass(type,sum){
 const g=gateState(); const keyName=gateKey();
 g.completedExamPapers[keyName]=arr(g.completedExamPapers[keyName]);
 g.completedExamPapers[keyName].push({type,passed:true,score10:Number(sum?.score10||0),correct:Number(sum?.correct||0),total:Number(sum?.total||0),at:Date.now(),stage:g.currentStage,part:g.currentPart});
 g.lastExamSource=state.examGateSource||null;
}
function currentPartLessonIds(part=gatePart(),stageId=currentStageId()){
 const lessons=call('getLessons',[],DB).filter(l=>(stageOf(l)||stageId)===stageId);
 const total=stagePartCount(stageId); const chunk=Math.max(1,Math.ceil(lessons.length/total));
 const base=lessons.slice((part-1)*chunk,part*chunk).map(l=>lessonKey(l)||l.id||l.title).filter(Boolean);
 const extra=[];
 try{const s=normalizeRouteSession(planSession()); [...arr(s.blocks),...arr(s.cards)].forEach(x=>{['lessonId','lesson','chapterId','moduleId'].forEach(k=>{if(x&&x[k])extra.push(String(x[k]));});});}catch(_){ }
 if(state.lessonId)extra.push(state.lessonId);
 return uniq([...base,...extra]);
}
function questionInCurrentPart(q){
 const stageId=currentStageId();
 if(stageOf(q)&&stageOf(q)!==stageId)return false;
 const ids=currentPartLessonIds();
 const lid=str(q?.lessonId||q?.chapterId||q?.lesson||q?.moduleId||'');
 return !ids.length||!lid||ids.includes(lid);
}
function sessionKey(s=planSession()){
 s=normalizeRouteSession(s);
 return [s.date||new Date().toISOString().slice(0,10),currentStageId(),gatePart(),s.phase||'today'].join('::');
}
function taskKey(step,s=planSession()){return `${sessionKey(s)}::step${Number(step)||0}`}
function scheduleTaskRecord(step,s=planSession()){
 const raw=gateState().completedTasks?.[taskKey(step,s)]||null;
 if(!raw)return null;
 return raw.openedAt?raw:{...raw,openedAt:raw.at||null,legacyOpen:!!raw.at,completed:false};
}
function markScheduleTaskOpened(step,s=planSession(),route={}){
 if(!step)return false;
 const g=gateState(),keyName=taskKey(step,s),prev=scheduleTaskRecord(step,s)||{},at=Date.now();
 const routeCopy={...(route||prev.route||{})};
 const evidenceBaseline=prev.evidenceBaseline||scheduleEvidenceSnapshot(routeCopy);
 g.completedTasks[keyName]={...prev,openedAt:prev.openedAt||at,lastOpenedAt:at,route:routeCopy,evidenceBaseline,stage:currentStageId(),part:gatePart(),completed:prev.completed===true,completedAt:prev.completedAt||null,completionSource:prev.completionSource||''};
 return true;
}
function markScheduleTask(step,s=planSession(),source='evidence_confirmation'){
 if(!step)return false;
 const g=gateState(),keyName=taskKey(step,s),prev=scheduleTaskRecord(step,s);
 if(!prev?.openedAt)return false;
 const evidence=scheduleTaskEvidence(step,s);if(!evidence.ok)return false;
 g.completedTasks[keyName]={...prev,completed:true,completedAt:Date.now(),completionSource:source,evidenceResult:evidence,stage:currentStageId(),part:gatePart()};
 return true;
}
function isScheduleTaskOpened(step,s=planSession()){return !!scheduleTaskRecord(step,s)?.openedAt}
function isScheduleTaskDone(step,s=planSession()){return scheduleTaskRecord(step,s)?.completed===true}
function scheduleEvidenceProfile(route={}){
 const view=str(route?.view||''),tab=str(route?.learnTab||'');
 if(view==='media')return 'media_output';
 if(view==='dialogue'||(view==='learning'&&tab==='practice'))return 'speaking';
 if(view==='vocab')return 'vocab';
 if(view==='grammar')return 'grammar';
 if(view==='writing')return 'writing';
 if(view==='mindmap')return 'mindmap';
 if(view==='learning'&&tab==='theory')return 'theory';
 if(view==='learning'&&tab==='exercises')return 'exercises';
 if(view==='learning'&&(tab==='review'||tab==='exam'))return 'check';
 return 'unsupported';
}
function scheduleLessonId(route={}){
 return str(route?.lessonId||state.lessonId||activeLessonContext().id||'');
}
function learningEvidenceState(lessonId=''){
 return window.RussianLearningFlow?.get?.()?.lessons?.[str(lessonId)]?.steps||{};
}
function learningEvidenceValue(profile,lessonId=''){
 const steps=learningEvidenceState(lessonId),row=steps?.[profile]||{};
 if(profile==='theory')return Number(row.slideMoves||0);
 if(profile==='speaking')return Number(row.ok||0);
 if(profile==='vocab'||profile==='grammar')return Number(row.supportActions||0);
 if(profile==='exercises')return Number(row.moves||0);
 if(profile==='check')return Number(row.correct||0);
 return 0;
}
function speechEvidenceTotal(){
 const buckets=[state.practiceSpeechResults,state.dialogueSpeechResults];
 return buckets.reduce((sum,b)=>sum+Object.values(b||{}).filter(x=>x&&x.ok===true).length,0);
}
function scheduleEvidenceSnapshot(route={}){
 const profile=scheduleEvidenceProfile(route),lessonId=scheduleLessonId(route);
 return {
  profile,lessonId,
  learningValue:learningEvidenceValue(profile,lessonId),
  speechOk:speechEvidenceTotal(),
  writingDraftLength:str(state.writingDraft||'').trim().length,
  strokeCount:Array.isArray(strokes)?strokes.length:0,
  mindmapNode:str(state.mindmapNode||''),
  capturedAt:Date.now()
 };
}
function scheduleTaskEvidence(step,s=planSession()){
 const rec=scheduleTaskRecord(step,s);if(!rec?.openedAt)return {ok:false,reason:'Hãy mở nội dung của chặng trước.'};
 const route=rec.route||{},base=rec.evidenceBaseline||scheduleEvidenceSnapshot(route);
 const profile=base.profile||scheduleEvidenceProfile(route),lessonId=base.lessonId||scheduleLessonId(route);
 if(profile==='media_output'){
  const value=speechEvidenceTotal(),ok=value>Number(base.speechOk||0);
  return {ok,profile,value,baseline:Number(base.speechOk||0),reason:ok?'Đã có đầu ra nói sau media.':'Video/audio nhúng không cung cấp bằng chứng xem đáng tin cậy; hãy nghe rồi nói lại ít nhất một câu và xác nhận câu nói ổn.'};
 }
 if(['theory','speaking','vocab','grammar','exercises','check'].includes(profile)){
  const value=learningEvidenceValue(profile,lessonId),baseline=Number(base.learningValue||0);
  const noDue=profile!=='check'||!(window.RussianLearningFlow?.dueReviewsForLesson?.(lessonId)?.length);
  const ok=value>baseline&&noDue;
  return {ok,profile,value,baseline,reason:ok?'Đã có bằng chứng học mới sau khi mở chặng.':(profile==='check'&&!noDue?'Vẫn còn lỗi đến hạn của bài này trong Review Queue.':'Chưa có bằng chứng thao tác phù hợp sau khi mở chặng.')};
 }
 if(profile==='writing'){
  const draft=str(state.writingDraft||'').trim().length,strokeCount=Array.isArray(strokes)?strokes.length:0;
  const ok=draft>Number(base.writingDraftLength||0)||strokeCount>Number(base.strokeCount||0);
  return {ok,profile,value:Math.max(draft,strokeCount),baseline:Math.max(Number(base.writingDraftLength||0),Number(base.strokeCount||0)),reason:ok?'Đã có bằng chứng viết mới.':'Hãy viết/gõ thêm nội dung sau khi mở chặng.'};
 }
 if(profile==='mindmap'){
  const value=str(state.mindmapNode||''),ok=!!value&&value!==str(base.mindmapNode||'');
  return {ok,profile,value,baseline:base.mindmapNode||'',reason:ok?'Đã có thao tác khám phá mind map.':'Hãy mở một nút mind map khác để tạo bằng chứng học.'};
 }
 return {ok:false,profile,reason:'Chặng này chưa có loại bằng chứng học đủ tin cậy để tự xác nhận hoàn thành.'};
}
function scheduleExamStep(s=planSession()){
 s=normalizeRouteSession(s); const details=arr(s.blocks).map(routeBlockDetail); const cards=arr(s.cards);
 for(let i=0;i<details.length;i++){const route=scheduleStepRoute(s,details[i],cards[i]||{},i); if(route?.learnTab==='exam')return {index:i,step:i+1,block:details[i],card:cards[i]||{},route};}
 return null;
}
function schedulePrereqStatus(s=planSession(),examStepInfo=scheduleExamStep(s)){
 if(!examStepInfo)return {allowed:false,missing:[],reason:'Lịch hôm nay chưa có chặng kiểm tra chính thức.'};
 const missing=[];
 for(let step=1;step<examStepInfo.step;step++)if(!isScheduleTaskDone(step,s))missing.push(step);
 return {allowed:missing.length===0,missing,reason:missing.length?`Còn ${missing.length} chặng học/ôn trước kiểm tra chưa hoàn thành.`:'Đã hoàn thành các chặng trước kiểm tra.'};
}
function examGateSourceValid(){
 const src=state.examGateSource||{}; if(src.routeSource!=='today_schedule')return false;
 if(src.stage!==currentStageId()||Number(src.part)!==gatePart())return false;
 if(src.sessionKey&&src.sessionKey!==sessionKey())return false;
 return true;
}
function examGateAccess(type=activeExamType()){
 const next=gateNextNeededType(); const prereq=schedulePrereqStatus(); const hasResult=!!examPaperResult(type);
 const blockers=[];
 if(!examGateSourceValid())blockers.push('Kiểm tra chỉ được mở từ Lịch trình hôm nay, không mở trực tiếp từ tab.');
 if(!prereq.allowed)blockers.push(prereq.reason);
 if(!next&&!hasResult)blockers.push('Phần hiện tại đã đủ bài kiểm tra, hãy mở khóa phần tiếp theo.');
 else if(next&&type!==next&&!hasResult)blockers.push(`Đề kế tiếp phải là ${examPaperLabel(next)}, không phải ${examPaperLabel(type)}.`);
 return {allowed:blockers.length===0,blockers,next,prereq};
}
function routeExamPayloadForToday(raw={},s=planSession(),step=0){
 const next=gateNextNeededType()||scheduleExamPaperType(raw); const payload=examRoutePayload({...raw,paperType:next});
 return {...payload,routeSource:'today_schedule',stage:currentStageId(),part:gatePart(),sessionKey:sessionKey(s),scheduleStep:Number(step)||0,paperType:next,examPaperType:next};
}
function renderExamGateLock(){
 const g=gateState(); const access=examGateAccess(activeExamType()); const reqRows=partRequirementRows().map(r=>`<article class="gate-req ${r.done>=r.need?'done':'pending'}"><b>${esc(r.label)}</b><span>${r.done}/${r.need}</span></article>`).join('');
 const blockers=access.blockers.map(x=>`<li>${esc(x)}</li>`).join('');
 return `<section class="panel exam-gate-lock v1317-gate-lock"><span class="chip warn-chip">🔒 Cổng kiểm tra bị khóa</span><h3>Kiểm tra phải mở từ Lịch trình hôm nay</h3><p>Đang ở giai đoạn <b>${esc(stageTitle(g.currentStage))}</b>, phần <b>${g.currentPart}/${g.totalParts}</b>. Hoàn thành đúng các chặng học/ôn trong lịch, sau đó bấm chặng kiểm tra hôm nay.</p><div class="gate-req-grid">${reqRows}</div><ul>${blockers}</ul><div class="lesson-tools"><button class="btn primary" data-act="open-today-route">Mở Lịch trình hôm nay</button><button class="btn soft" data-learn="review">Ôn tập trước</button></div></section>`;
}
function renderGateProgressPanel(){
 const g=gateState(); const rows=partRequirementRows(); const unlock=gateUnlockStatus(),readiness=unlock.readiness||{ready:0,total:0,rows:[]},target=stageReadinessNextTarget();
 const cards=rows.map(r=>`<article class="gate-req ${r.done>=r.need?'done':'pending'}"><b>${esc(r.label)}</b><span>${r.done}/${r.need}</span></article>`).join('');
 const learningCards=arr(readiness.rows).map(r=>`<article class="gate-req ${r.ready?'done':'pending'}"><b>${esc(r.id)}</b><span>${r.done}/4 bằng chứng</span>${r.missing?.length?`<small>Thiếu: ${esc(r.missing.join(', '))}</small>`:''}</article>`).join('');
 const unlockLabel=g.currentPart>=g.totalParts?'Mở khóa giai đoạn tiếp theo':'Mở khóa phần tiếp theo';
 const gateText=unlock.allowed?(unlock.finalPart?'Đã đủ bằng chứng học, đủ đề, Review Queue và điều kiện rời stage. Có thể chuyển tiếp.':'Đã đủ bằng chứng học, đủ đề và không còn lỗi đến hạn. Có thể mở khóa bước kế tiếp.'):(unlock.blockers.join(' ')||'Cần hoàn thành điều kiện còn thiếu.');
 const action=target.kind==='evidence'||target.kind==='review'
  ?`<button class="btn soft" data-route='${esc(JSON.stringify(target.route))}'>Đi đúng mục cần xử lý · ${esc(target.label)}</button>`
  :(target.kind==='exam'
    ?`<button class="btn soft" data-act="next-gate-paper">Mở lượt kiểm tra kế tiếp · ${esc(target.label)}</button>`
    :(target.kind==='unlock'
      ?`<button class="btn primary gate-unlock-btn" data-act="unlock-stage-part">${esc(unlockLabel)}</button>`
      :`<button class="btn soft" data-learn="review">Bổ sung bằng chứng / xử lý ôn tập</button>`));
 return `<section class="exam-stage-gate-panel v1317-stage-gate ${unlock.allowed?'complete':'pending'}"><div><span class="chip">Cổng học thuật</span><h4>Phần ${g.currentPart}/${g.totalParts} · ${esc(stageTitle(g.currentStage))}</h4><p>${esc(gateText)} Chỉ tính đề đạt từ 8.0/10.</p></div><div class="gate-readiness-summary"><b>${Number(readiness.ready||0)}/${Number(readiness.total||0)}</b><span>bài đủ 4 bằng chứng cốt lõi</span></div><div class="gate-req-grid">${learningCards}${cards}</div><div class="gate-actions">${action}</div></section>`;
}
function stageTransitionSnapshot(kind,toStage,toPart,unlock=gateUnlockStatus()){
 const g=gateState(); if(!unlock?.allowed)return null;
 const exams=partRequirementRows(g.currentPart,g.totalParts).map(x=>({type:x.type,need:Number(x.need||0),done:Number(x.done||0)}));
 const readiness=arr(unlock.readiness?.rows).map(x=>({lessonId:x.id,ready:!!x.ready,done:Number(x.done||0),missing:arr(x.missing)}));
 return {
  schema:'RUSSIAN_STAGE_TRANSITION_V1',
  kind,
  from:{stage:g.currentStage,part:Number(g.currentPart||1),totalParts:Number(g.totalParts||1)},
  to:{stage:toStage,part:Number(toPart||1)},
  gate:{
   allowed:true,
   reviewDue:arr(unlock.dueReviews).length,
   examComplete:!!unlock.examComplete,
   readinessComplete:!!unlock.readiness?.ok,
   capabilityStageExit:unlock.stageExit?{allowed:!!unlock.stageExit.allowed,lessonReady:Number(unlock.stageExit.lessonReady||0),lessonTotal:Number(unlock.stageExit.lessonTotal||0),dueCount:Number(unlock.stageExit.dueCount||0),writing:Number(unlock.stageExit.writing||0),rewrites:Number(unlock.stageExit.rewrites||0)}:null,
   exams,
   lessons:readiness
  },
  createdAt:new Date().toISOString()
 };
}
function recordStageTransition(transition){
 if(!transition||transition.schema!=='RUSSIAN_STAGE_TRANSITION_V1')return false;
 state.stageTransitions=[...arr(state.stageTransitions),transition].slice(-30);
 state.lastStageTransition=transition;
 return true;
}
function handoffStageTransition(transition){
 if(!transition)return;
 const payload={type:'BAUMAN_SUBJECT_STAGE_TRANSITION',subjectId:A.id||'russian',transition};
 try{window.BaumanSubjectHost?.send?.(payload)}catch(_){}
 window.dispatchEvent(new CustomEvent('russian:stage-transition',{detail:payload}));
}
function unlockStagePart(){
 const g=gateState(),unlock=gateUnlockStatus(); if(!unlock.allowed){toast(unlock.blockers[0]||'Chưa đủ điều kiện mở khóa phần hiện tại'); return;}
 const stagesList=curriculumStages().map(x=>x.id).filter(Boolean); const idx=stagesList.indexOf(g.currentStage);
 if(g.currentPart<g.totalParts){
  const nextPart=g.currentPart+1,transition=stageTransitionSnapshot('part_unlock',g.currentStage,nextPart,unlock); if(!transition)return;
  g.currentPart=nextPart; g.unlockedPart=Math.max(g.unlockedPart,g.currentPart); state.examGateSource=null; resetExamProgress(); recordStageTransition(transition); save(); handoffStageTransition(transition); render(); toast('Đã mở khóa phần '+g.currentPart+'/'+g.totalParts); return;
 }
 const nextStage=idx>=0&&idx<stagesList.length-1?stagesList[idx+1]:null;
 if(nextStage){
  const transition=stageTransitionSnapshot('stage_unlock',nextStage,1,unlock); if(!transition)return;
  state.stage=nextStage; state.stageGate=stageGateDefaults(nextStage); state.examGateSource=null; resetExamProgress(); recordStageTransition(transition); save(); handoffStageTransition(transition); render(); toast('Đã mở khóa giai đoạn tiếp theo'); return;
 }
 toast('Đã hoàn thành giai đoạn cuối của môn học');
}
function nextGatePaper(){const next=gateNextNeededType(); if(!next){toast('Phần này đã đủ đề, hãy mở khóa phần tiếp theo');return;} resetExamProgress(next); state.examPaperType=next; state.examPaperLevel=next; save(); render(); toast('Đã mở '+examPaperLabel(next));}
function getExamPoolByLevel(level){return byStage(call('getTests',[],DB)).filter(x=>(A.testLevel?.(x)||x.difficulty||x.level||'easy')===level)}
function getExamPoolWithFallback(level,need=0){
 const all=arr(call('getTests',[],DB)).filter(x=>(A.testLevel?.(x)||x.difficulty||x.level||'easy')===level);
 const stageId=currentStageId();
 const partScoped=all.filter(q=>questionInCurrentPart(q));
 const sameStage=all.filter(q=>(stageOf(q)||stageId)===stageId);
 const seen=new Set();
 const ordered=[];
 [partScoped,sameStage,all].forEach(group=>arr(group).forEach((q,i)=>{const id=questionId(q,i,'exam_pool'); if(!seen.has(id)){seen.add(id); ordered.push(q);}}));
 return ordered.slice(0,need||ordered.length);
}
function activeExamLevel(){return activeExamType()}
function examPaperKey(level=activeExamType()){return EXAM_PAPER_ORDER.includes(level)?level:activeExamType()}
function examQuestionId(q,i,level=activeExamType()){const key=examPaperKey(level); return `${key}::${q?._examPackLevel||q?.difficulty||q?.level||''}::${questionId(q,i,'exam')}::${Number(i)||0}`}
function composeExamPaper(type=activeExamType()){
 const cfg=examPaperConfig(type); const packs={};
 EXAM_LEVEL_ORDER.forEach(lv=>{const need=Number(cfg.counts?.[lv]||0); packs[lv]=getExamPoolWithFallback(lv,need).slice(0,need).map((q,i)=>({...q,_examPackLevel:lv,_examPaperType:type,_examPackLocalOrder:i+1}));});
 const out=[]; const max=Math.max(...EXAM_LEVEL_ORDER.map(lv=>packs[lv].length));
 for(let i=0;i<max;i++)EXAM_LEVEL_ORDER.forEach(lv=>{if(packs[lv][i])out.push(packs[lv][i]);});
 return out.slice(0,cfg.total).map((q,i)=>({...q,_examPackOrder:i+1,_examPaperType:type}));
}
function getExamQuestions(level=activeExamType()){return composeExamPaper(EXAM_PAPER_ORDER.includes(level)?level:activeExamType())}
function getExamQuestionsForLevel(level){return getExamQuestions(level)}
function examPaperResult(level=activeExamType()){return state.examProgress.paperResults?.[examPaperKey(level)]||null}
function examCycleSummary(days=derivedExamCycleDays()){
 const rows=EXAM_PAPER_ORDER.map(type=>({level:type,label:examPaperLabel(type),result:examPaperResult(type),total:examPaperConfig(type).total}));
 const complete=rows.every(x=>!!x.result);
 const passed=complete&&rows.every(x=>x.result?.passed);
 const pending=rows.filter(x=>!x.result).length;
 return {levels:EXAM_PAPER_ORDER,rows,complete,passed,pending,cycleDays:28};
}
function resetExamProgress(level=null){
 const key=level?examPaperKey(level):null;
 if(key){
  const qs=getExamQuestions(key);
  qs.forEach((q,i)=>{const id=examQuestionId(q,i,key); delete state.examProgress.answers[id]; delete state.examProgress.marked[id]; delete state.examProgress.wrong[id];});
  if(state.examProgress.paperResults)delete state.examProgress.paperResults[key];
  state.examIndex=0;state.examPage=0;state.examProgress.submitted=false;state.examProgress.result=null;state.examProgress.submittedAt=null;return;
 }
 state.examIndex=0;state.examPage=0;state.examPaperType='standard';state.examPaperLevel='standard';
 state.examProgress={answers:{},marked:{},submitted:false,submittedAt:null,result:null,wrong:{},paperResults:{}};
}


function finalQaSnapshot(){
 const review=reviewCounts(getReviewBaseQuestions());
 const exam=getExamQuestions();
 const remedial=remedialCounts();
 return {version:VERSION, reviewPageSize:reviewPageSize(getReviewQuestions()), examPageSize:examPageSize(activeExamType()), reviewTotal:review.total, examTotal:exam.length, learningDay:rawLearningDay(), examUnlockedCycle:unlockedExamCycleDays(), examCycleDays:derivedExamCycleDays(), examLevels:examLevelsForCycle(), routeResetLocked:routeResetLocked(), remedialRemaining:remedial.remaining};
}


function getDialogues(){let xs=byStage(getBaumanDialogueAZ()); if(state.dialogueGroup!=='all')xs=xs.filter(x=>(A.dialogueGroup?.(x)||x.group||'general')===state.dialogueGroup); if(state.dialogueDifficulty!=='all')xs=xs.filter(x=>(A.dialogueDifficulty?.(x)||x.difficulty||x.level||'all')===state.dialogueDifficulty); if(state.dialogueQuery)xs=xs.filter(x=>lower(textOf(x)).includes(lower(state.dialogueQuery))); return xs}
function getMedia(){let xs=byStage(call('getMedia',[],DB)); if(state.mediaCat!=='all')xs=xs.filter(x=>mediaCategoryLabel(x)===state.mediaCat); if(state.mediaQuery)xs=xs.filter(x=>lower(JSON.stringify(x)).includes(lower(state.mediaQuery))); return xs}
function getVocab(){let xs=byStage(call('getVocabulary',[],DB)); if(state.vocabQuery)xs=xs.filter(x=>lower(A.vocabSearchText?.(x)||JSON.stringify(x)).includes(lower(state.vocabQuery))); return xs}
function getHandwriting(){return byStage(call('getHandwriting',[],DB))}
function getWriting(){return byStage(call('getWriting',[],DB))}
function title(){const route=NAV.find(n=>n[0]===state.view); $('#pageTitle').textContent=route?route[2]:'Tổng quan'; const ui=A.ui||{}; const subs={overview:ui.overviewSubtitle,learning:ui.learningSubtitle,dialogue:ui.dialogueSubtitle,writing:ui.writingSubtitle,media:ui.mediaSubtitle,vocab:ui.vocabSubtitle,grammar:ui.grammarSubtitle,mindmap:ui.mindmapSubtitle,storage:ui.storageSubtitle}; $('#pageSub').textContent=subs[state.view]||ui.subtitle||''}
function buildShell(){ applyInterface(); $('#subjectLogo').textContent=A.ui?.logo||'Я'; $('#subjectTitle').textContent=A.ui?.title||'Tiếng Nga Bauman'; $('#subjectSubtitle').textContent=A.ui?.subtitle||''; $('#coreLabel').textContent=A.ui?.coreLabel||'V12.82 LEARNING INTEGRITY FINAL'; $('#stageLabel').textContent=A.ui?.stageLabel||'Giai đoạn'; $('#stageSelect').innerHTML=stages().map(s=>`<option value="${esc(s.id)}">${esc(s.title)}</option>`).join(''); $('#stageSelect').value=state.stage; $('#nav').innerHTML=NAV.map(n=>`<button data-view="${esc(n[0])}" class="${state.view===n[0]?'active':''}"><b>${n[1]}</b><span>${esc(n[2])}</span></button>`).join(''); const tb=$('#themeBtn'); if(tb){tb.textContent='☀️ Giao diện';tb.classList.add('theme-light-button');} }
function trackAccess(view,label){state.recentAccess=arr(state.recentAccess); const item={view:view||state.view,label:label||NAV.find(n=>n[0]===view)?.[2]||view||'Mục học',stage:state.stage,at:new Date().toLocaleString('vi-VN')}; state.recentAccess=[item,...state.recentAccess.filter(x=>x.view!==item.view||x.stage!==item.stage)].slice(0,6)}
function setView(v){trackAccess(v);state.view=v; if(v==='learning'&&!LEARN_TABS.map(x=>x[0]).includes(state.learnTab))state.learnTab='theory'; save(); render()}
function render(){
 try{
  sanitize(); buildShell(); title();
  const fn=({overview:renderOverview,learning:renderLearning,dialogue:renderDialogue,writing:renderWriting,media:renderMedia,vocab:renderVocab,grammar:renderGrammar,mindmap:renderMindmap,storage:renderStorage}[state.view]||renderOverview);
  const v=$('#view'); if(!v)throw new Error('Không tìm thấy vùng #view');
  v.innerHTML=fn(); afterRender();
 }catch(e){
  console.error('FULL_RENDER_GUARD',e);
  try{
   state={...DEFAULT,view:'learning',learnTab:'theory',stage:state?.stage||DEFAULT.stage,interfaceTheme:state?.interfaceTheme||DEFAULT.interfaceTheme,interfaceDensity:state?.interfaceDensity||DEFAULT.interfaceDensity};
   buildShell(); title();
   const v=$('#view');
   if(v)v.innerHTML=`<section class="panel learning-recovery-card hard-recovery"><span class="chip danger-chip">KHÔI PHỤC TAB HỌC TẬP</span><h3>Đã chặn lỗi render và mở lại Lý thuyết</h3><p>${esc(e?.message||e)}</p><div class="recovery-actions"><button class="btn primary" data-learn="theory">Mở Lý thuyết</button><button class="btn" data-learn="exercises">Bài tập</button><button class="btn" data-learn="practice">Nghe/Nói</button><button class="btn" data-learn="review">Ôn tập</button><button class="btn" data-learn="exam">Kiểm tra</button></div><p class="note">Nếu lỗi lặp lại sau khi tải lại, hãy xóa cache/localStorage của module hoặc dùng bản này để hệ thống tự bỏ qua dữ liệu lưu cũ quá lớn.</p></section>`;
  }catch(e2){console.error('RECOVERY_RENDER_FAILED',e2)}
 }
}
function afterRender(){clampVisibleState(); if(state.view==='mindmap') requestAnimationFrame(()=>updateMindMapConnectors(document.querySelector('[data-mindmap-canvas=\"1\"]'))); if(state.view==='writing') setTimeout(initCanvas,30); if(state.view==='learning') setTimeout(()=>{const sb=$('.slidebox'); if(sb) sb.focus({preventScroll:true})},30);}
function toast(m){const t=$('#toast'); t.textContent=m; t.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('show'),1800)}
function closeFloatingLearningMenus(){
 try{document.querySelectorAll('.learn-structure-menu[open], .storage-group-menu[open], details[open]').forEach(el=>{
  if(el.classList.contains('learn-structure-menu')||el.classList.contains('storage-group-menu')||el.querySelector?.('.learn-structure-dropdown')) el.removeAttribute('open');
 });}catch(_){}
}
function setPresentationOverlayLock(on=false){
 const body=document.body;
 if(!body)return;
 body.classList.toggle('presentation-overlay-lock',!!on);
 body.classList.toggle('presentation-active',!!on);
 try{document.documentElement.classList.toggle('presentation-overlay-lock',!!on)}catch(_){}
}
function openModal(html,type='generic'){
 const isPresentation=type==='presentation';
 if(isPresentation)closeFloatingLearningMenus();
 state.modalType=type;
 const body=$('#modalBody');
 body.innerHTML=html;
 body.classList.toggle('presentation-body',isPresentation);
 const modal=$('#modal');
 if(modal)modal.classList.toggle('presentation-modal-root',isPresentation);
 const card=$('#modal .modal-card');
 if(card){card.classList.toggle('presentation-card',isPresentation);card.classList.toggle('route-card-modal',type==='route');card.classList.toggle('exam-result-card-modal',type==='exam-result');card.classList.toggle('confirm-card-modal',type==='confirm');card.scrollTop=0;}
 setPresentationOverlayLock(isPresentation);
 $('#modal').classList.remove('hidden');
 if(type==='route')setTimeout(()=>{const card=$('#modal .modal-card'); const body=$('#modalBody'); if(card)card.scrollTop=0; if(body)body.scrollTop=0;},30);
 if(isPresentation)setTimeout(()=>{closeFloatingLearningMenus(); const ps=presentationScroller(); if(ps){ps.scrollTop=0; ps.focus({preventScroll:true});}},40);
}
function closeModal(){ state.modalType=''; setPresentationOverlayLock(false); const modal=$('#modal'); if(modal){modal.classList.add('hidden'); modal.classList.remove('presentation-modal-root');} const body=$('#modalBody'); body.innerHTML=''; body.classList.remove('presentation-body'); const card=$('#modal .modal-card'); if(card){card.classList.remove('presentation-card','route-card-modal','exam-result-card-modal','confirm-card-modal');} }

function confirmAction(action,label='hành động này',detail=''){
 const meta={action,label,detail};
 openModal(`<div class="confirm-action-modal compact-confirm"><div class="confirm-icon">!</div><div class="confirm-copy"><span class="chip warn-chip">Xác nhận</span><h3>Bạn có xác định ấn nút này?</h3><p>${esc(detail||('Hành động: '+label+'. Hãy kiểm tra lại trước khi thực hiện.'))}</p></div><div class="confirm-actions"><button class="btn" data-act="confirm-cancel">Không</button><button class="btn primary danger-confirm" data-confirm-act="${esc(action)}" data-confirm-meta='${esc(JSON.stringify(meta))}'>Đúng</button></div></div>`,'confirm');
}
function resetReviewProgress(){
 state.reviewProgress={done:{},flagged:{},wrong:{}};
 state.reviewAnswer=null; state.reviewIndex=0; state.reviewPage=0; state.reviewFilter='all'; state.reviewLesson='all';
 save(); render(); toast('Đã Reset toàn bộ tiến độ ôn tập');
}
function submitExamNow(){
 const level=activeExamLevel(); const qs=getExamQuestions(level); const sum=examProgressSummary(qs,level);
 if(sum.answered<sum.total){toast(`Còn ${sum.total-sum.answered} câu chưa trả lời trong đề ${examLevelLabel(level)}`); return}
 state.examProgress.paperResults=state.examProgress.paperResults||{}; state.examProgress.paperResults[level]=sum; state.examProgress.submitted=true; state.examProgress.submittedAt=Date.now(); state.examProgress.result=sum; state.examProgress.wrong={};
 arr(sum.wrong).forEach(w=>{state.examProgress.wrong[w.id]={at:Date.now(),index:w.index,answer:w.answer,correct:w.correct,level:w.level,lessonId:w.lessonId,skill:w.skill,topic:w.topic};});
 state.examHistory=[{at:Date.now(),...sum,cycle:examCycleSummary()},...arr(state.examHistory)].slice(0,20);
 if(sum.passed)registerGateExamPass(level,sum); else createRemedialPlan(sum);
 save(); render(); openModal(renderExamResultModal(sum),'exam-result'); const complete=gatePartComplete();
 toast(sum.passed?(complete?'Đạt đủ cổng phần này, có thể mở khóa bước tiếp theo':'Đạt đề này, tiếp tục đề còn lại trong phần'):'Chưa đạt đề này, đã tạo lịch phụ đạo');
}
function runConfirmedAction(action){
 if(action==='submit-exam-do'){submitExamNow(); return;}
 if(action==='reset-exam-do'){if(routeResetLocked()){closeModal(); toast(routeResetLockMessage()); return;} resetExamProgress(); save(); closeModal(); render(); toast('Đã Reset toàn bộ mốc kiểm tra'); return;}
 if(action==='reset-exam-paper-do'){resetExamProgress(activeExamLevel()); save(); closeModal(); render(); toast('Đã Reset đề hiện tại'); return;}
 if(action==='reset-review-do'){closeModal(); resetReviewProgress(); return;}
 if(action==='route-request-regen-do'){if(routeResetLocked()){closeModal(); toast(routeResetLockMessage()); return;} closeModal(); requestMainSchedule('regenerate'); return;}
 if(action==='clear-remedial-do'){state.remedialPlan.active=false; save(); closeModal(); render(); toast('Đã ẩn lịch trình phụ đạo'); return;}
 if(action==='storage-reset-source-do'){resetCurrentSource(); closeModal(); return;}
 if(action==='reset-db-do'){localStorage.removeItem(key+'_db'); closeModal(); toast('Đã khôi phục dữ liệu gốc, đang tải lại'); setTimeout(()=>location.reload(),300); return;}
 if(action==='media-group-delete-do'){const g=state.pendingMediaGroupDelete||''; deleteMediaGroup(g); state.pendingMediaGroupDelete=''; openModal(renderMediaGroupManager(),'media-groups'); toast('Đã xóa nhóm Video/Audio'); return;}
 toast('Không nhận diện được hành động xác nhận');
}

function overviewStats(){return [['Bài học',call('getLessons',[],DB).length],['Từ vựng',call('getVocabulary',[],DB).length],['Hội thoại',call('getDialogues',[],DB).length],['Câu test',call('getTests',[],DB).length]]}
function todayMissionText(){const mission=state.hostTask||{}; const fromBundle=state.planningBundle?.today?.goal||state.planningBundle?.mission?.target||state.planningBundle?.mission?.title||''; return mission.target||mission.title||mission.goal||mission.output||fromBundle||'Chưa đồng bộ được'}
function syncStateLabel(){return (state.hostTask||state.planningBundle)?'Đã nhận từ Main':'Chờ Main'}
function learningProgress(){const answered=Number(state.testSession?.answered||0); const correct=Number(state.testSession?.correct||0); const accuracy=answered?Math.round(correct*100/answered):0; return {answered,accuracy,lesson:state.lessonId||'Chưa chọn',stage:stageTitle()}}
function dataCount(name){const d=DB[name]; return Array.isArray(d)?d.length:(Array.isArray(d?.questions)?d.questions.length:(d&&typeof d==='object'?Object.keys(d).length:0))}
function healthSummary(){const required=['curriculum','lessons','vocab','speaking','tests','videos','handwriting','writing']; const missing=required.filter(f=>!DB[f]||dataCount(f)===0); const warnings=[]; if(!call('getLessons',[],DB).length)warnings.push('chưa có bài học'); if(!call('getVocabulary',[],DB).length)warnings.push('chưa có từ vựng'); if(!call('getDialogues',[],DB).length)warnings.push('chưa có hội thoại'); return {ok:!missing.length&&!warnings.length,missing,warnings};}
function renderHealthStrip(){return ''}
function clampVisibleState(){
 const lessons=getLessons(); if(state.lessonId&&!byId(lessons,state.lessonId))state.lessonId=''; const lesson=currentLesson(); clampSlideIndex(lesson);
 const ex=getExercises(); if(state.exerciseIndex>=ex.length)state.exerciseIndex=Math.max(0,ex.length-1);
 const tests=getTests(); if(state.testIndex>=tests.length){state.testIndex=Math.max(0,tests.length-1); state.testAnswer=null;}
 if(inPracticeMode()){const dg=getPracticeDialogues(); if(state.practiceDialogueId&&!byId(dg,state.practiceDialogueId))state.practiceDialogueId=''; const turns=dialogueTurns(currentDialogue()); if(state.practiceLineIndex>=turns.length)state.practiceLineIndex=Math.max(0,turns.length-1);} else {const dg=getDialogues(); if(state.dialogueId&&!byId(dg,state.dialogueId))state.dialogueId=''; const turns=dialogueTurns(currentDialogue()); if(state.dialogueLineIndex>=turns.length)state.dialogueLineIndex=Math.max(0,turns.length-1);}
 const voc=getVocab(); if(state.vocabIndex>=voc.length)state.vocabIndex=Math.max(0,voc.length-1);
 const hand=getHandwriting(); if(state.handwritingIndex>=hand.length)state.handwritingIndex=Math.max(0,hand.length-1);
 const wr=getWriting(); if(state.writingIndex>=wr.length)state.writingIndex=Math.max(0,wr.length-1);
}
function renderRecentAccess(){const list=arr(state.recentAccess).slice(0,5); if(!list.length)return '<article class="resume-empty"><b>Chưa có lịch sử truy cập</b><span>Hệ thống sẽ tự lưu điểm tiếp tục khi người học mở kỹ năng.</span></article>'; return list.map(x=>`<button class="resume-item" data-view="${esc(x.view)}"><b>${esc(x.label||x.view)}</b><span>${esc(x.stage?stageTitle(x.stage):stageTitle())} · ${esc(x.at||'')}</span></button>`).join('')}
function stageReality(){
 const s=state.stage;
 if(s==='vn')return 'Bối cảnh thực tế: 2 tháng đầu ở Việt Nam ưu tiên nghe, nói và xem video tiếng Nga; từ vựng/ngữ pháp chỉ học phụ trợ để dùng ngay trong câu.';
 if(s==='prep')return 'Bối cảnh thực tế: dùng tiếng Nga trong lớp dự bị, ký túc, phòng giáo vụ; nghe nhiệm vụ, hỏi lại khi chưa hiểu và ghi bài đúng.';
 if(s==='hk1'||s==='hk2')return 'Bối cảnh thực tế: đọc bài giảng, hỏi giảng viên, làm bài tập, thuyết trình ngắn và ghi chú thuật ngữ kỹ thuật.';
 if(s==='hk3')return 'Bối cảnh thực tế: đọc tài liệu НИР, trao đổi với giáo viên hướng dẫn, ghi kết quả thí nghiệm và chuẩn bị báo cáo seminar.';
 if(s==='hk4')return 'Bối cảnh thực tế: viết ВКР, trình bày kết quả, phản biện câu hỏi và hoàn thiện ngôn ngữ bảo vệ luận văn.';
 return 'Bối cảnh thực tế: học theo nhiệm vụ hôm nay, ưu tiên dùng được ngay trong lớp, ký túc và môi trường học thuật.';
}
function scheduleExamPaperType(raw={}){
 const text=lower([raw?.paperType,raw?.examPaperType,raw?.examType,raw?.type,raw?.level,raw?.testLevel,raw?.label,raw?.title,raw?.action,raw?.output,raw?.purpose,raw?.key].filter(Boolean).join(' '));
 const n=Number(raw?.targetQuestions||raw?.questions||raw?.totalQuestions||raw?.total||raw?.count||0);
 if(EXAM_PAPER_ORDER.includes(raw?.paperType))return raw.paperType;
 if(EXAM_PAPER_ORDER.includes(raw?.examPaperType))return raw.examPaperType;
 if(/chuyên sâu|deep|expert|giỏi|100/.test(text)||n>=100)return 'deep';
 if(/nâng cao|advanced|hard|khá|60/.test(text)||n>=60)return 'advanced';
 if(/tăng cường|intensive|medium|trung bình|40/.test(text)||n>=40)return 'intensive';
 return 'standard';
}
function examRoutePayload(raw={}){const paper=scheduleExamPaperType(raw); return {view:'learning',learnTab:'exam',paperType:paper,examPaperType:paper};}
function reviewRoutePayload(raw={}){return {view:'learning',learnTab:'review',reviewFilter:raw?.reviewFilter||undefined};}
function routeBlockRoute(b,i){
 const hay=lower([b?.key,b?.label,b?.title,b?.action,b?.output,b?.purpose].filter(Boolean).join(' '));
 if(/mind\s*map|mindmap|sơ đồ|so do|bản đồ nhớ|ban do nho|check nhớ|check nho|neo nhớ|neo nho|ghi nhớ|ghi nho/.test(hay))return mindmapRouteForStage(currentStageId());
 if(/ngữ pháp|ngu phap|grammar|câu mẫu|cau mau|mẫu câu|mau cau|lý thuyết|ly thuyet/.test(hay))return grammarRouteForStage(currentStageId());
 if(/(^|_|\s)(test|exam|assessment)($|_|\s)|kiểm tra|làm đề|nộp đề|đề chính thức|official/.test(hay))return examRoutePayload(b);
 if(/chữa lỗi|sửa lỗi|correction|repair|phụ đạo|câu sai|ôn tập|ôn |mini-check|tự kiểm|củng cố/.test(hay))return reviewRoutePayload(b);
 if(/video|audio|mở tai|xem|nghe ngắn/.test(hay))return {view:'media'};
 if(/nghe chủ động|nhại|shadow|đóng vai|hội thoại|nói|vai/.test(hay))return {view:'dialogue'};
 if(/viết|cyrillic|chép|gõ/.test(hay))return {view:'writing',mode:'handwriting'};
 if(/từ vựng|cụm|từ\/cụm/.test(hay))return {view:'vocab'};
 return i===0?{view:'media'}:i===1?{view:'dialogue'}:i===2?{view:'dialogue'}:i===3?{view:'dialogue'}:i===4?{view:'vocab'}:i===5?grammarRouteForStage(currentStageId()):{view:'learning',learnTab:'review'};
}
function routeBlockDetail(b,i){
 const key=str(b.key||b.id||'');
 const label=str(b.label||b.title||('Nhiệm vụ '+(i+1)));
 const presets=[
  ['Mở tai bằng video','Xem/nghe 1 đoạn tiếng Nga ngắn, bắt nhịp nói thật trước khi học chữ nghĩa.'],
  ['Nghe chủ động','Nghe 2-3 lượt, đánh dấu âm/từ chưa rõ, không dừng quá lâu để tra ngữ pháp.'],
  ['Nhại và shadowing','Nhại từng câu, sau đó nói chồng theo audio để giữ nhịp tự nhiên.'],
  ['Đóng vai tình huống','Đổi vai A/B, nói thành câu hoàn chỉnh trong bối cảnh lớp học, ký túc hoặc giáo vụ.'],
  ['Từ vựng phụ trợ','Chọn ít cụm dùng ngay trong hội thoại, không học danh sách dài.'],
  ['Ngữ pháp qua câu mẫu','Chỉ rút ra 1-2 mẫu ngữ pháp phục vụ câu vừa nghe/nói.'],
  ['Gắn với thực tế','Nói lại một việc thật: hỏi bài, xin nhắc lại, hỏi đường, nhắn giáo viên hoặc tự giới thiệu.']
 ];
 const p=presets[i%presets.length];
 return {key,minutes:Number(b.minutes||b.duration||0),label,action:b.action||p[0],output:b.output||b.result||p[1],route:b.route||routeBlockRoute({...b,key,label,action:b.action||p[0],output:b.output||b.result||p[1]},i),_autoRouteSupport:!!b._autoRouteSupport};
}

function reviewOverviewSummary(){
 const counts=reviewCounts(getReviewBaseQuestions());
 if(!counts.total)return '';
 const urgent=counts.flagged+counts.wrong;
 const tone=urgent?'warn':counts.new?'wait':'ok';
 return `<article class="overview-review-summary ${tone}"><div><b>Ôn tập còn lại</b><span>${counts.remaining} câu · ${counts.flagged} cắm cờ · ${counts.wrong} câu sai</span></div><button class="btn soft" data-route='${esc(JSON.stringify({view:'learning',learnTab:'review'}))}'>Mở ôn tập</button></article>`;
}


function normalizeRemedialPlan(){
 const plan=state.remedialPlan||{};
 plan.cards=arr(plan.cards);
 plan.completed=plan.completed&&typeof plan.completed==='object'?plan.completed:{};
 const remaining=plan.cards.filter(c=>!plan.completed[c.id]).length;
 plan.active=!!plan.active && plan.cards.length>0 && remaining>0;
 if(plan.cards.length&&remaining===0)plan.active=false;
 state.remedialPlan={active:!!plan.active,cards:plan.cards,completed:plan.completed,createdAt:plan.createdAt||null,lastExamAt:plan.lastExamAt||null,lastScore:plan.lastScore??null};
 return state.remedialPlan;
}
function remedialCounts(){const p=normalizeRemedialPlan(); const total=p.cards.length; const done=p.cards.filter(c=>p.completed[c.id]).length; return {total,done,remaining:Math.max(0,total-done)};}
function remedialTitle(card,i){return card.title||`Câu sai ${Number(card.index||i)+1}`}
function renderRemedialOverview(){
 const plan=normalizeRemedialPlan(); if(!plan.active)return '';
 const c=remedialCounts(); const cards=plan.cards.filter(x=>!plan.completed[x.id]).slice(0,6);
 return `<section class="panel remedial-overview-panel"><div class="remedial-head"><div><span class="chip warn-chip">LỊCH TRÌNH PHỤ ĐẠO</span><h3>Ôn lại trọng điểm từ bài kiểm tra</h3><p>Còn ${c.remaining}/${c.total} thẻ. Bấm vào một thẻ để mở ôn tập; thẻ được xem là đã hoàn thành và tự ẩn khi xong toàn bộ.</p></div><div class="remedial-score"><b>${Number(plan.lastScore||0).toFixed(1)}</b><span>/10</span></div></div><div class="remedial-card-grid">${cards.map((card,i)=>`<button class="remedial-card" data-remedial-card="${esc(card.id)}"><span>Phụ đạo ${i+1}</span><b>${esc(clip(remedialTitle(card,i),78))}</b><small>${esc([card.levelLabel||card.level,card.skill,card.lessonId].filter(Boolean).join(' · ')||'Câu sai trọng điểm')}</small></button>`).join('')}</div><div class="remedial-foot"><button class="btn primary" data-act="open-remedial-review">Mở toàn bộ câu sai</button><button class="btn soft" data-act="clear-remedial">Ẩn phụ đạo</button></div></section>`;
}
function remedialReviewKey(w){return questionId(w.question||{},Number(w.index)||0,'review')}
function createRemedialPlan(sum){
 const wrongs=arr(sum?.wrong).filter(w=>w&&w.question).slice(0,120);
 const cards=wrongs.map((w,i)=>{const q=w.question||{}; const rid=remedialReviewKey(w); return {id:'remedial_'+rid+'_'+i,index:Number(w.index)||i,reviewKey:rid,questionId:q.id||rid,title:'Câu '+(Number(w.index||i)+1)+' · '+clip(questionTitle(q,w.index||i),90),lessonId:w.lessonId||q.lessonId||'',skill:w.skill||q.skill||'',topic:w.topic||q.topic||'',level:w.level||q._examPackLevel||q.level||q.difficulty||'easy',levelLabel:examLevelLabel(w.level||q._examPackLevel||q.level||q.difficulty||'easy'),answer:w.answer,correct:w.correct,createdAt:Date.now()};});
 state.remedialPlan={active:cards.length>0,cards,completed:{},createdAt:Date.now(),lastExamAt:Date.now(),lastScore:sum?.score10??0};
 // Đưa câu sai vào kho Ôn tập để nút "Ôn tập lại" mở ra đúng trọng điểm.
 cards.forEach(card=>{state.reviewProgress.wrong[card.reviewKey]={at:Date.now(),answer:card.answer,correct:card.correct,lessonId:card.lessonId,skill:card.skill,fromExam:true,remedialId:card.id}; if(!state.reviewProgress.done[card.reviewKey])state.reviewProgress.flagged[card.reviewKey]=Date.now();});
 normalizeRemedialPlan();
}
function examAnswerText(q,idx){const choices=questionChoices(q); if(idx==null||Number(idx)<0)return 'Chưa trả lời'; return choices[Number(idx)]??('Đáp án '+(Number(idx)+1));}
function examBreakdown(qs=getExamQuestions(),level=activeExamLevel()){
 const levels={}, skills={};
 qs.forEach((q,i)=>{const id=examQuestionId(q,i,level); const lv=q?._examPackLevel||level||q.level||q.difficulty||'easy'; const sk=q.skill||q.topic||'Tổng hợp'; const has=state.examProgress.answers?.[id]!=null; const ok=has&&Number(state.examProgress.answers[id])===Number(answerIndex(q));
  levels[lv]=levels[lv]||{key:lv,label:examLevelLabel(lv),total:0,correct:0}; levels[lv].total++; if(ok)levels[lv].correct++;
  skills[sk]=skills[sk]||{key:sk,label:sk,total:0,correct:0}; skills[sk].total++; if(ok)skills[sk].correct++;
 });
 const prep=o=>Object.values(o).map(x=>({...x,score:x.total?Math.round((x.correct/x.total)*100):0,score10:x.total?Math.round((x.correct/x.total)*100)/10:0})).sort((a,b)=>b.total-a.total);
 return {levels:prep(levels),skills:prep(skills)};
}


function examSubmitState(qs=getExamQuestions(activeExamLevel()),level=activeExamLevel()){
 const total=arr(qs).length;
 let answered=0;
 arr(qs).forEach((q,i)=>{const id=examQuestionId(q,i,level); if(state.examProgress.answers?.[id]!=null)answered++;});
 const submitted=!!examPaperResult(level);
 return {total,answered,remaining:Math.max(0,total-answered),complete:total>0&&answered>=total,submitted,locked:submitted||!(total>0&&answered>=total)};
}

function scoreBar(row){const pct=Math.max(0,Math.min(100,Number(row.score)||0)); return `<article class="score-row"><div><b>${esc(row.label)}</b><span>${row.correct}/${row.total} đúng · ${row.score10.toFixed(1)}/10</span></div><div class="score-track"><i style="width:${pct}%"></i></div></article>`;}
function renderExam(){
 const type=activeExamType();
 const cfg=examPaperConfig(type);
 const gateAccess=examGateAccess(type);
 if(!gateAccess.allowed)return renderExamGateLock();
 const qs=getExamQuestions(type);
 if(state.examIndex>=qs.length)state.examIndex=Math.max(0,qs.length-1);
 if(state.examPage>Math.max(0,Math.ceil(qs.length/examPageSize(type))-1))state.examPage=Math.max(0,Math.ceil(qs.length/examPageSize(type))-1);
 const q=qs[state.examIndex]||qs[0];
 const id=examQuestionId(q,state.examIndex,type);
 const choices=questionChoices(q);
 const selected=state.examProgress.answers?.[id];
 const st=q?examStatus(q,state.examIndex,type):'new';
 const paperResult=examPaperResult(type);
 const paperSubmitted=!!paperResult;
 const submitState=examSubmitState(qs,type);
 const submitDisabled=paperSubmitted||!submitState.complete;
 const submitHint=paperSubmitted?'Đề đã nộp':(submitState.complete?'Đã làm đủ câu, có thể nộp đề':`Còn ${submitState.remaining}/${submitState.total} câu chưa làm xong`);
 const submitClass=submitDisabled?'locked':'ready';
 const doneLabel=paperSubmitted?'Đã nộp':'Chưa nộp';
 const currentPage=Number(state.examPage)||0;
 const pageStart=qs.length?currentPage*examPageSize(type)+1:0;
 const pageEnd=Math.min(qs.length,(currentPage+1)*examPageSize(type));
 const flagRail=renderExamFlagRail(qs,type);
 const typeOptions=EXAM_PAPER_ORDER.map(t=>{const c=examPaperConfig(t); return `<option value="${esc(t)}" ${type===t?'selected':''}>${esc(c.label+' · '+c.total+' câu')}</option>`}).join('');
 const questionCard=q?`<article class="test-question exam-question ${st} official-exam-question clean-question-card assessment-question-card compact-assessment-question v1219-question-scroll v1266-exam-question v1308-question-card">
   <div class="question-meta clean-question-meta simple-question-meta"><span class="chip">Câu ${state.examIndex+1}/${qs.length}</span><span class="chip muted-chip">${esc(examLevelLabel(q._examPackLevel||q.difficulty||q.level))}</span></div>
   <div class="question-scroll-main v1308-question-scroll">
    <h3>${esc(questionTitle(q,state.examIndex))}</h3>
    <div class="answer-grid exam-answer-grid compact-answer-grid v1308-answer-grid">${choices.map((c,i)=>{const isSelected=Number(selected)===i; const after=paperSubmitted; const isCorrect=Number(answerIndex(q))===i; const cls=[isSelected?'active':'', after&&isCorrect?'correct-choice':'', after&&isSelected&&!isCorrect?'wrong-choice':''].join(' '); return `<button class="answer-card answer-list-item ${cls}" data-exam-answer="${i}" ${after?'disabled':''}><span class="answer-option-label">${String.fromCharCode(65+i)}</span><span class="answer-option-text">${esc(c)}</span></button>`}).join('')}</div>
   </div>
   <div class="lesson-tools assessment-actions compact-actions exam-submit-actions v1308-actions"><button class="btn" data-act="prev-exam">← Trước</button><button class="btn warn" data-act="toggle-exam-mark" ${paperSubmitted?'disabled':''}>⚑ Cắm cờ</button><button class="btn" data-act="next-exam">Sau →</button><button class="btn primary submit-exam-btn ${submitClass}" data-act="submit-exam" ${submitDisabled?'disabled':''} title="${esc(submitHint)}" aria-disabled="${submitDisabled?'true':'false'}">Nộp đề</button></div>
 </article>`:'<div class="note compact-note">Chưa có câu kiểm tra cho dạng này.</div>';
 return `<section class="panel learn-work-card exam-studio official-exam-pass3 clean-exam-layout v1219-assessment assessment-focus-card v1266-exam-compact v1300-exam-flag-left v1308-assessment-stable v1310-assessment-polish v1311-assessment-luxe v1312-assessment-atelier v1308-exam">
   <div class="assessment-compact-head exam-compact-head slim-assessment-head v1266-exam-head v1308-head">
     <div class="assessment-title-line"><span class="chip">🧪 Kiểm tra</span><b>${esc(cfg.label)} · ${cfg.total} câu</b><small>${paperSubmitted?'Đề này đã nộp':`Còn ${submitState.remaining}/${submitState.total} câu chưa làm`} · đang xem ${pageStart}-${pageEnd}/${qs.length} · mục tiêu 8.0/10</small></div>
     <div class="assessment-filter-line exam-filter-line compact-filter-strip v1266-exam-filters v1308-exam-filters">
       <label class="v1266-filter"><span>Dạng kiểm tra</span><select class="input compact-select" data-input="examPaperType" aria-label="Dạng kiểm tra">${typeOptions}</select></label>
       <button class="btn soft v1266-status-btn ${paperSubmitted?'done':'pending'}" type="button" aria-label="Trạng thái đề hiện tại">${doneLabel}</button>
       <button class="btn soft" data-act="reset-exam-paper">Làm lại dạng này</button>
       <button class="btn soft" data-act="reset-exam" title="Reset toàn bộ 4 dạng kiểm tra">Reset tất cả</button>
     </div>
   </div>
   <div class="assessment-body exam-assessment-body compact-assessment-body v1219-assessment-body v1266-exam-body v1300-assessment-two-col v1300-exam-body v1308-body">
     ${flagRail}
     <main class="assessment-question-area focus-question-area v1219-question-area v1266-question-area v1300-question-area-main v1308-question-area">${questionCard}${renderExamResultPanel()}</main>
   </div>
 </section>`
}


function overviewKpiCards(){
 const stats=overviewStats();
 const review=reviewCounts(getReviewBaseQuestions());
 const dialogueTotal=call('getDialogues',[],DB).length;
 const mediaTotal=call('getMedia',[],DB).length;
 const kpis=[
  {label:'Nghe/Nói',value:dialogueTotal,unit:'hội thoại',tone:'blue',route:{view:'dialogue'}},
  {label:'Video/Audio',value:mediaTotal,unit:'nguồn',tone:'rose',route:{view:'media'}},
  {label:'Từ vựng phụ trợ',value:stats.find(x=>x[0]==='Từ vựng')?.[1]||0,unit:'thẻ',tone:'green',route:{view:'vocab'}},
  {label:'Ôn tập còn lại',value:review.remaining||0,unit:'câu',tone:'amber',route:{view:'learning',learnTab:'review'}}
 ];
 return kpis.map(k=>`<button class="canva-kpi ${esc(k.tone)}" data-route='${esc(JSON.stringify(k.route))}'><span>${esc(k.label)}</span><b>${esc(k.value)}</b><small>${esc(k.unit)}</small></button>`).join('');
}
function overviewLearningFlow(){
 const items=[
  ['01','Mở tai','Video/audio ngắn để bắt nhịp tiếng Nga thật.',{view:'media'}],
  ['02','Nhại câu','Nghe chậm, nghe thường, shadowing theo câu.',{view:'dialogue'}],
  ['03','Đóng vai','Đổi vai theo bối cảnh lớp học, ký túc, giáo vụ.',{view:'dialogue'}],
  ['04','Viết/gõ ít','Khóa lại hình chữ Cyrillic bằng vài cụm vừa nói.',{view:'writing',mode:'handwriting'}],
  ['05','Chốt lỗi','Ghi 1 lỗi phát âm/nghe và 1 câu sẽ nói lại ngày mai.',{view:'learning',learnTab:'review'}]
 ];
 const flow=items.map(x=>`<button class="canva-flow-step" data-route='${esc(JSON.stringify(x[3]))}'><i>${x[0]}</i><b>${esc(x[1])}</b><span>${esc(x[2])}</span></button>`).join('');
 const quick=[
  ['Mở bài học chính','Đi thẳng vào bài đang học, không lạc qua bảng phụ.',{view:'learning',learnTab:'theory'},'Vào học'],
  ['Ghép video với nói','Xem/nghe xong chuyển ngay sang nhại và đóng vai.',{view:'media'},'Xem video'],
  ['Sửa lỗi cuối buổi','Gom câu sai/câu yếu để ngày mai luyện lại.',{view:'learning',learnTab:'review'},'Ôn lỗi']
 ];
 return `${flow}<div class="overview-flow-actions">${quick.map(q=>`<button class="overview-flow-action" data-route='${esc(JSON.stringify(q[2]))}'><b>${esc(q[0])}</b><span>${esc(q[1])}</span><em>${esc(q[3])}</em></button>`).join('')}</div>`;
}
function overviewSkillTiles(){
 const tiles=[
  {icon:'🎬',title:'Video là cửa vào',text:'Mỗi buổi bắt đầu bằng âm thật, tránh học chữ nghĩa khô trước khi tai kịp nóng máy.',route:{view:'media'}},
  {icon:'🎙️',title:'Nói bằng câu ngắn',text:'Ưu tiên nói được câu lớp học, ký túc, hỏi lại, xin nhắc lại, tự giới thiệu.',route:{view:'dialogue'}},
  {icon:'🧩',title:'Từ vựng dùng ngay',text:'Chỉ lấy cụm phục vụ cuộc nói hôm nay, không học danh sách dài như bê gạch.',route:{view:'vocab'}},
  {icon:'✍️',title:'Viết để khóa trí nhớ',text:'Gõ/viết lại câu vừa nghe để nối tai, miệng và tay thành một vòng phản xạ.',route:{view:'writing'}},
 ];
 return tiles.map(t=>`<button class="canva-skill-tile" data-route='${esc(JSON.stringify(t.route))}'><em>${t.icon}</em><b>${esc(t.title)}</b><span>${esc(t.text)}</span></button>`).join('');
}
function renderOverviewReminderPanel(){
 const mission=todayMissionText();
 const review=reviewCounts(getReviewBaseQuestions());
 const weak=Number(review.wrong||0)+Number(review.flagged||0);
 const focusText=weak?`Vá ${weak} điểm yếu trước khi tăng tốc.`:'Nền hôm nay sạch, có thể đi tiếp theo nhịp nghe - nói.';
 const priorities=[
  ['01','Mở tai','Video/audio ngắn 5-12 phút để lấy nhịp tiếng Nga thật.',{view:'media'},'Xem video'],
  ['02','Nhại câu','Nghe chậm, nhại từng câu, sau đó shadowing theo tốc độ thường.',{view:'dialogue'},'Luyện nói'],
  ['03','Dùng ngay','Đóng vai trong lớp học/ký túc/phòng giáo vụ, ưu tiên câu ngắn.',{view:'dialogue'},'Đóng vai'],
  ['04','Khóa lại','Viết/gõ vài từ Cyrillic và ghi 1 lỗi cần sửa ngày mai.',{view:'writing',mode:'handwriting'},'Viết/gõ']
 ];
 const status=[
  ['Nghe/Nói',call('getDialogues',[],DB).length,'hội thoại',{view:'dialogue'}],
  ['Video/Audio',call('getMedia',[],DB).length,'nguồn',{view:'media'}],
  ['Từ vựng phụ trợ',overviewStats().find(x=>x[0]==='Từ vựng')?.[1]||0,'thẻ',{view:'vocab'}],
  ['Ôn tập còn lại',review.remaining||0,'câu',{view:'learning',learnTab:'review'}]
 ];
 return `<section class="overview-control-board round1-overview-pro">
   <div class="overview-control-head panel">
     <div><span class="chip">Bảng điều phối học</span><h3>${esc(stageTitle())}</h3><p>${esc(stageReality().replace(/^Bối cảnh thực tế:\s*/,'')).trim()}</p></div>
     <aside><b>${esc(mission)}</b><span>${esc(focusText)}</span><button class="btn primary" data-act="route-modal">Mở lịch trình</button></aside>
   </div>
   <div class="overview-control-grid">
     <article class="panel overview-priority-panel">
       <div class="overview-section-head"><span class="chip">Hôm nay nên ưu tiên</span><h4>4 nhịp học gọn, không trùng thẻ</h4></div>
       <div class="overview-priority-list">${priorities.map(x=>`<button class="overview-priority-item" data-route='${esc(JSON.stringify(x[3]))}'><i>${x[0]}</i><b>${esc(x[1])}</b><span>${esc(x[2])}</span><em>${esc(x[4])}</em></button>`).join('')}</div>
     </article>
     <aside class="panel overview-resume-pro">
       <div class="resume-head"><div><span class="chip">Tiếp tục học</span><h4>Mục vừa mở gần đây</h4></div><button class="btn soft" data-act="route-modal">Lịch hôm nay</button></div>
       <div class="resume-list compact-resume-list pro-resume-list">${renderRecentAccess()}</div>
     </aside>
   </div>
   <div class="overview-status-row">${status.map(x=>`<button class="overview-status-pill" data-route='${esc(JSON.stringify(x[3]))}'><b>${esc(x[1])}</b><span>${esc(x[0])}</span><small>${esc(x[2])}</small></button>`).join('')}</div>
 </section>`
}
function renderStageReadinessNavigator(){
 const g=gateState(),target=stageReadinessNextTarget(),r=target.unlock?.readiness||partLearningReadiness();
 const title=target.kind==='unlock'?'Sẵn sàng mở khóa':(target.kind==='exam'?'Đến lượt kiểm tra':(target.kind==='review'?'Sửa lỗi đến hạn':'Bổ sung bằng chứng tiếp theo'));
 const action=target.kind==='evidence'||target.kind==='review'
  ?`<button class="btn primary" data-route='${esc(JSON.stringify(target.route))}'>${esc(target.label)} →</button>`
  :(target.kind==='exam'
    ?`<button class="btn primary" data-act="next-gate-paper">${esc(target.label)} →</button>`
    :(target.kind==='unlock'
      ?`<button class="btn primary" data-act="unlock-stage-part">Mở khóa bước kế tiếp →</button>`
      :`<button class="btn soft" data-act="route-modal">Mở lịch trình →</button>`));
 return `<section class="panel stage-readiness-navigator"><div><span class="chip">READINESS NAVIGATOR</span><h4>${esc(title)}</h4><p>Phần ${g.currentPart}/${g.totalParts} · ${Number(r.ready||0)}/${Number(r.total||0)} bài đủ 4 bằng chứng cốt lõi.</p></div>${action}</section>`;
}
function renderOverview(){
 const mission=todayMissionText();
 const reality=stageReality().replace(/^Bối cảnh thực tế:\s*/,'').trim();
 const quick=[
  ['Mở bài theo lịch','Bắt đầu đúng bài hoặc hoạt động hôm nay, không mở lan man.',{view:'learning',learnTab:'theory'},'Vào học'],
  ['Xem/nghe trước','Dùng video/audio làm trung tâm mở tai trước khi học chữ.',{view:'media'},'Mở video'],
  ['Nói lại ngay','Chuyển nhanh sang nhại câu và đóng vai ngắn.',{view:'dialogue'},'Luyện nói']
 ];
 return `<div class="overview-v128 overview-v1261-closure">
  <section class="overview-mission-clean panel overview-top-only-hero v1261-hero">
    <div class="mission-copy-clean">
      <span class="sync-state ${state.hostTask||state.planningBundle?'ok':'wait'}">${esc(syncStateLabel())}</span>
      <h3>Mục tiêu hôm nay: ${esc(mission)}</h3>
      <p>${esc(stageTitle())} · ưu tiên nghe, nói và video; từ vựng/ngữ pháp chỉ phụ trợ cho câu vừa dùng.</p>
    </div>
    <button class="schedule-cta final-schedule-cta" data-act="route-modal" aria-label="Mở lịch trình hôm nay">
      <span>📅</span><b>Lịch trình hôm nay</b><small>Mở bảng học đủ chặng, không khuyết nội dung</small>
    </button>
  </section>
  ${renderStageReadinessNavigator()}
  <section class="overview-canva-lower v1261-overview-board">
    <div class="canva-kpi-grid v1261-kpi-row">${overviewKpiCards()}</div>
    <div class="v1261-overview-grid v1262-overview-grid">
      <article class="panel v1261-flow-card">
        <div class="canva-card-head"><span class="chip">LUỒNG HỌC DƯỚI TỔNG QUAN</span><h3>Nghe → nhại → dùng → khóa lỗi</h3><p>${esc(reality)}</p></div>
        <div class="canva-flow v1261-flow">${overviewLearningFlow()}</div>
        <div class="overview-flow-actions v1261-flow-actions">${quick.map(x=>`<button class="overview-flow-action" data-route='${esc(JSON.stringify(x[2]))}'><b>${esc(x[0])}</b><span>${esc(x[1])}</span><em>${esc(x[3])}</em></button>`).join('')}</div>
      </article>
      <aside class="v1262-skill-rail">${overviewSkillTiles()}</aside>
    </div>
  </section>
 </div>`
}


function routeStageSupport(stageId=currentStageId()){
 const map={
  vn:{level:'A0',track:'Phát âm',grammarLabel:'A0/A1 · phát âm, câu tối thiểu, giống danh từ',mindmapId:'phonetics-map',mindLabel:'Phonetics · chữ, âm, trọng âm',check:'Nhìn sơ đồ âm → đọc 3 cặp âm → nhại 2 câu đã học.'},
  prep:{level:'A2',track:'Cách',grammarLabel:'A2 · các cách 2/3/4 và nền dự bị',mindmapId:'cases-map',mindLabel:'6 cách · ý nghĩa → đuôi → ví dụ',check:'Chọn 1 cách → nói ý nghĩa → tạo 1 câu lớp học/ký túc.'},
  hk1:{level:'B1',track:'Câu phức',grammarLabel:'B1 · câu phức, nghe giảng và trình bày bài toán',mindmapId:'aspect-map',mindLabel:'НСВ/СВ · tiến trình hay kết quả',check:'Nhìn 1 nhánh → nói lại bằng câu báo cáo ngắn.'},
  hk2:{level:'B2',track:'Học thuật',grammarLabel:'B2 · phong cách báo cáo, dữ liệu và thuật toán',mindmapId:'vocab-network-map',mindLabel:'Từ vựng học thuật theo mạng ngữ cảnh',check:'Chọn 1 cụm học thuật → nối sang động từ/giới từ → dùng trong câu lab.'},
  hk3:{level:'C1',track:'Chuyên sâu',grammarLabel:'C1 · НИР, seminar, phản biện khoa học',mindmapId:'roadmap-map',mindLabel:'Roadmap НИР · luận điểm, phương pháp, kết quả',check:'Nhìn lộ trình → nói 1 câu về đóng góp hoặc giới hạn nghiên cứu.'},
  hk4:{level:'C1',track:'Chuyên sâu',grammarLabel:'C1/B2+ · ВКР, bảo vệ và trả lời hội đồng',mindmapId:'roadmap-map',mindLabel:'Roadmap bảo vệ · slide, câu hỏi, phản biện',check:'Nhìn 1 nhánh → trả lời miệng 20-30 giây như trước hội đồng.'}
 };
 return map[stageId]||map.vn;
}
function grammarRouteForStage(stageId=currentStageId()){const p=routeStageSupport(stageId); return {view:'grammar',grammarLevel:p.level,grammarTrack:p.track};}
function mindmapRouteForStage(stageId=currentStageId()){const p=routeStageSupport(stageId); return {view:'mindmap',mindmapId:p.mindmapId};}
function routeStageSupportBlock(type='grammar',stageId=currentStageId()){
 const p=routeStageSupport(stageId);
 if(type==='mindmap')return {key:'mindmap_memory_check',_autoRouteSupport:true,minutes:5,label:'Check nhớ bằng Mind map',action:'Mở Mind map check',output:`${p.mindLabel}. ${p.check} Mind map chỉ dùng như neo nhớ nhanh, không biến thành bài học dài.`,route:mindmapRouteForStage(stageId)};
 return {key:'stage_grammar_lane',_autoRouteSupport:true,minutes:10,label:'Ngữ pháp theo giai đoạn',action:'Mở Ngữ pháp đúng cấp',output:`${p.grammarLabel}. Học 1 quy tắc nhỏ qua câu vừa nghe/nói, sau đó tạo 1 câu của chính mình.`,route:grammarRouteForStage(stageId)};
}
function hasRouteSupportKind(blocks,kind){
 const re=kind==='mindmap'?/mind\s*map|mindmap|sơ đồ|check nhớ|neo nhớ|ghi nhớ/:/ngữ pháp|grammar|câu mẫu|mẫu câu/;
 return arr(blocks).some(b=>b?.key===(kind==='mindmap'?'mindmap_memory_check':'stage_grammar_lane')||re.test(lower([b?.key,b?.label,b?.title,b?.action,b?.output,b?.purpose].filter(Boolean).join(' '))));
}
function injectStageRouteSupport(blocks,kind='study'){
 const xs=arr(blocks).map(x=>({...x}));
 const stageId=currentStageId();
 if(!hasRouteSupportKind(xs,'grammar')){
  const beforeReview=xs.findIndex(b=>/ôn tập|review|mini-check|kiểm tra|exam|assessment|tự phản hồi/.test(lower([b.key,b.label,b.action,b.output].filter(Boolean).join(' '))));
  const at=beforeReview>=0?beforeReview:Math.max(1,xs.length-1);
  xs.splice(at,0,routeStageSupportBlock('grammar',stageId));
 }
 if(!hasRouteSupportKind(xs,'mindmap')){
  const beforeExam=xs.findIndex(b=>/(^|_|\s)(test|exam|assessment)($|_|\s)|kiểm tra|làm đề|nộp đề/.test(lower([b.key,b.label,b.action,b.output].filter(Boolean).join(' '))));
  const at=beforeExam>=0?beforeExam:xs.length;
  xs.splice(at,0,routeStageSupportBlock('mindmap',stageId));
 }
 return xs;
}

function baseRouteSession(){return {order:1,date:new Date().toISOString().slice(0,10),minutes:90,sessionKind:'orientation',phase:'Làm quen A0 an toàn',output:'Mục tiêu hôm nay: nghe tiếng Nga thật, nhại được vài câu ngắn, viết/gõ một số ký tự Cyrillic; chưa kiểm tra chính thức.',blocks:[{key:'video_warmup',minutes:10,label:'Làm quen mục tiêu và cách học',action:'Mở tai bằng video',output:'Xem/nghe 1 đoạn tiếng Nga ngắn, bắt nhịp nói thật trước khi học chữ nghĩa.'},{key:'active_listening',minutes:25,label:'Chữ cái, âm khó, cách nghe an toàn',action:'Nghe chủ động',output:'Nghe 2-3 lượt, đánh dấu âm/từ chưa rõ, không dừng quá lâu để tra ngữ pháp.'},{key:'shadowing',minutes:20,label:'Chào hỏi và câu lớp học đầu tiên',action:'Nhại và shadowing',output:'Nhại từng câu, sau đó nói chồng theo audio để giữ nhịp tự nhiên.'},{key:'roleplay',minutes:20,label:'Nghe - nhại từng câu ngắn',action:'Đóng vai tình huống',output:'Đổi vai A/B, nói thành câu hoàn chỉnh trong bối cảnh lớp học, ký túc hoặc giáo vụ.'},{key:'write_or_type',minutes:10,label:'Viết/gõ vài từ Cyrillic',action:'Từ vựng phụ trợ',output:'Chọn ít cụm dùng ngay trong hội thoại, không học danh sách dài.'},{key:'reflection',minutes:5,label:'Tự phản hồi, không tính điểm',action:'Ngữ pháp qua câu mẫu',output:'Chỉ rút ra 1-2 mẫu ngữ pháp phục vụ câu vừa nghe/nói.'}],cards:[{title:'Video/audio mở tai',purpose:'Nghe tiếng Nga thật trước, làm quen âm, nhịp và ngữ điệu. Đây là cửa vào chính trong 2 tháng đầu ở Việt Nam.',limit:'1 video/audio ngắn 5-12 phút',button:'Xem/Nghe ngay',route:{view:'media'}},{title:'Nghe/Nói chủ lực',purpose:'Nghe mẫu, nhại, shadowing và đổi vai. Ưu tiên nói được câu ngắn hơn học thuộc quy tắc dài.',limit:'1-2 hội thoại thực tế',button:'Luyện nói',route:{view:'dialogue'}},{title:'Speaking Lab trong bài',purpose:'Đi từng câu theo bài học, nghe chậm, nhại lại, tự đánh dấu câu đã nói ổn.',limit:'20-30 phút',button:'Mở Nghe/Nói',route:{view:'learning',learnTab:'practice'}},{title:'Viết/gõ Cyrillic',purpose:'Gõ hoặc viết vài từ xuất hiện trong hội thoại để nối tai, miệng và tay, tránh học chữ cái khô.',limit:'5-10 phút',button:'Luyện viết',route:{view:'writing',mode:'handwriting'}},{title:'Từ vựng & ngữ pháp phụ trợ',purpose:'Chỉ lấy 5-8 cụm và 1 mẫu câu phục vụ cuộc nói hôm nay. Không biến từ vựng/ngữ pháp thành trọng tâm.',limit:'5-8 cụm + 1 mẫu',button:'Học phụ trợ',route:{view:'vocab'}},{title:'Ôn tập nhẹ cuối buổi',purpose:'Tự hỏi: nghe lại được chưa, nhại được chưa, viết/gõ lại được chưa. Chưa cần kiểm tra chính thức.',limit:'3 câu tự phản hồi',button:'Mở ôn tập',route:{view:'learning',learnTab:'review'}}],antiCrammingNote:'Giai đoạn đầu không nhồi test; mỗi buổi phải có nghe thật, nhại, nói lại và tự phản hồi.',pedagogyNote:'Học theo vòng: nghe → nhại → đóng vai → viết/gõ ít → tự sửa lỗi.'} }
function routeBlockDefaults(kind='study'){
 const map={
  orientation:[['video_warmup','Làm quen mục tiêu và cách học',10,'Mở tai bằng video','Xem/nghe 1 đoạn tiếng Nga ngắn, bắt nhịp nói thật trước khi học chữ nghĩa.'],['active_listening','Chữ cái, âm khó, cách nghe an toàn',25,'Nghe chủ động','Nghe 2-3 lượt, đánh dấu âm/từ chưa rõ, không dừng quá lâu để tra ngữ pháp.'],['shadowing','Chào hỏi và câu lớp học đầu tiên',20,'Nhại và shadowing','Nhại từng câu, sau đó nói chồng theo audio để giữ nhịp tự nhiên.'],['roleplay','Nghe - nhại từng câu ngắn',20,'Đóng vai tình huống','Đổi vai A/B, nói thành câu hoàn chỉnh trong bối cảnh lớp học, ký túc hoặc giáo vụ.'],['write_or_type','Viết/gõ vài từ Cyrillic',10,'Từ vựng phụ trợ','Chọn ít cụm dùng ngay trong hội thoại, không học danh sách dài.'],['reflection','Tự phản hồi, không tính điểm',5,'Ngữ pháp qua câu mẫu','Chỉ rút ra 1-2 mẫu ngữ pháp phục vụ câu vừa nghe/nói.']],
  foundation:[['video_context','Video/audio theo ngữ cảnh',15,'Nghe mở tai','Nhận diện nhịp nói và cụm lặp lại trong tình huống thật.'],['active_listening','Nghe hiểu ý chính',20,'Nghe chủ động','Bắt ý chính, khoanh âm/từ chưa rõ, chưa sa đà tra cứu.'],['repeat_shadow','Nhại và chỉnh trọng âm',20,'Shadowing','Nói lại từng câu, giữ trọng âm và nhịp câu.'],['guided_dialogue','Đổi vai hội thoại có hướng dẫn',20,'Đóng vai','Dùng câu mẫu trong lớp học, ký túc hoặc phòng giáo vụ.'],['vocab_minimum','Từ/cụm tối thiểu',10,'Học phụ trợ','Chọn cụm cần dùng ngay trong hội thoại.'],['write_spoken_sentence','Gõ/viết câu đã nói',5,'Gắn tai-miệng-tay','Viết/gõ lại câu vừa nhại để nhớ hình chữ.']],
  study:[['listen_again','Nghe lại và bắt nhịp câu',15,'Nghe chủ động','Nghe lấy ý chính, bắt chỗ nối âm và trọng âm.'],['video_context','Video/audio theo chủ đề hôm nay',20,'Mở ngữ cảnh','Xem/nghe nguồn ngắn để đặt câu vào đời sống thật.'],['dialogue','Đối thoại và đóng vai phản xạ',30,'Đổi vai','Nói thành câu hoàn chỉnh, không chỉ đọc chữ.'],['shadowing','Shadowing tốc độ tự nhiên',15,'Nhại theo nhịp','Nói chồng theo audio, giữ nhịp trước khi phân tích.'],['vocab_chunks','Từ/cụm phụ trợ dùng ngay',10,'Chọn cụm sống','Lấy ít cụm để dùng ngay, tránh học danh sách dài.'],['write_or_type','Gõ/viết lại 3-5 câu đã nói',10,'Chốt bằng chữ','Viết/gõ để khóa hình chữ và phát hiện lỗi.']],
  review_consolidation:[['listen_wrong_lines','Nghe lại câu từng sai/chưa rõ',20,'Sửa lỗi nghe','Tập trung vào câu sai, không mở quá nhiều nội dung mới.'],['roleplay','Đóng vai trọng điểm',25,'Nói lại trong ngữ cảnh','Đổi vai A/B với những mẫu câu còn yếu.'],['video_rewatch','Xem/nghe lại video liên quan',15,'Ôn bằng ngữ cảnh','Nghe lại nguồn cũ để củng cố phản xạ.'],['pronunciation_repair','Sửa phát âm và cụm dùng sai',20,'Chữa âm','Tách lỗi phát âm, nói lại chậm rồi tăng tốc.'],['mini_check','Mini-check củng cố',10,'Tự kiểm nhẹ','Tự hỏi nhanh, không thay kiểm tra chính thức.']],
  assessment:[['listen_warmup','Khởi động nghe/nói ngắn',10,'Làm nóng','Nghe-nhại vài câu trước khi vào kiểm tra.'],['test','Kiểm tra đã mở khóa',40,'Làm kiểm tra','Chỉ kiểm tra khi đã đủ nền và có dữ liệu học.'],['correction','Chữa lỗi ngay sau kiểm tra',20,'Sửa lỗi','Xem lỗi, phân loại nguyên nhân và quay lại thẻ học.'],['speaking_repair','Nói lại câu sai trong ngữ cảnh',15,'Luyện lại','Biến câu sai thành câu nói được.'],['repair_plan','Tạo kế hoạch sửa lỗi',5,'Chốt hướng sửa','Ghi 1-3 lỗi chính cho buổi sau.']]
 };
 return map[kind]||map.study;
}
function routeCardsFallback(kind='study'){
 const base=baseRouteSession().cards;
 if(kind==='orientation')return base;
 if(kind==='assessment')return [
  {title:'Khởi động trước kiểm tra',purpose:'Nghe/nói ngắn để vào nhịp, không nhảy thẳng vào đề.',limit:'5-10 phút',button:'Mở nghe nhanh',route:{view:'media'}},
  {title:'Kiểm tra trong lịch hôm nay',purpose:'Làm đúng dạng đề đã gắn với lịch hôm nay; nộp khi đã trả lời đủ câu.',limit:'1 đề theo lịch',button:'Làm kiểm tra',route:{view:'learning',learnTab:'exam'}},
  {title:'Chữa lỗi ngay sau kiểm tra',purpose:'Xem câu sai, phân loại lỗi và chuyển lỗi sang Ôn tập.',limit:'tối đa 3 nhóm lỗi',button:'Mở ôn tập',route:{view:'learning',learnTab:'review',reviewFilter:'wrong'}},
  {title:'Nói/viết lại phần sai',purpose:'Biến lỗi thành bài luyện phản xạ trong ngữ cảnh thật.',limit:'1 nhiệm vụ nói/viết lại',button:'Luyện lại',route:{view:'dialogue'}},
  {title:'Chốt kế hoạch sửa lỗi',purpose:'Ghi 1-3 lỗi chính để buổi sau không lặp lại.',limit:'3 lỗi trọng tâm',button:'Mở câu sai',route:{view:'learning',learnTab:'review',reviewFilter:'wrong'}}
 ];
 if(kind==='review_consolidation')return [{title:'Ôn gián đoạn',purpose:'Nhắc lại đúng khoảng cách để nhớ lâu, ưu tiên câu đã nghe/nói.',limit:'15-25 thẻ/câu',button:'Ôn từ/câu',route:{view:'vocab'}},{title:'Đổi vai trọng điểm',purpose:'Nói lại tình huống còn yếu, sửa câu chưa tròn nghĩa.',limit:'1-2 hội thoại',button:'Luyện nói',route:{view:'dialogue'}},{title:'Mini-check không tính điểm',purpose:'Tự kiểm nhẹ để biết đã sẵn sàng chưa, chưa thay kiểm tra chính thức.',limit:'5-10 câu',button:'Mở ôn tập',route:{view:'learning',learnTab:'review'}}];
 return base;
}
function scaleRouteBlocks(blocks, minutes){
 const total=arr(blocks).reduce((sum,b)=>sum+Number(b.minutes||0),0)||Number(minutes||90)||90;
 const target=Math.max(1,Number(minutes||total)||total);
 let used=0;
 return arr(blocks).map((b,i)=>{const m=i===blocks.length-1?Math.max(1,target-used):Math.max(1,Math.round(Number(b.minutes||1)*target/total)); used+=m; return {...b,minutes:m};});
}
function normalizeRouteBlock(b,i,kind='study'){
 const defaults=routeBlockDefaults(kind); const d=defaults[i%defaults.length]||defaults[0]||[];
 const raw={key:b?.key||d[0]||('step_'+i),label:b?.label||b?.title||d[1]||('Nhiệm vụ '+(i+1)),minutes:Number(b?.minutes||b?.duration||d[2]||0),action:b?.action||d[3]||'',output:b?.output||b?.result||b?.goal||d[4]||'',route:b?.route||null,_autoRouteSupport:!!b?._autoRouteSupport};
 raw.route=raw.route||routeBlockRoute(raw,i);
 return raw;
}
function normalizeRouteSession(raw){
 const base=baseRouteSession();
 const s={...base,...(raw&&typeof raw==='object'?raw:{})};
 const kind=s.sessionKind||s.mode||base.sessionKind||'study';
 s.sessionKind=kind;
 s.date=s.date||base.date;
 s.minutes=Math.max(1,Number(s.minutes||base.minutes||90));
 s.phase=s.phase||base.phase||'Lịch học hôm nay';
 s.output=s.output||s.goal||s.target||base.output;
 let blocks=arr(s.blocks).length?arr(s.blocks):routeBlockDefaults(kind).map(x=>({key:x[0],label:x[1],minutes:x[2],action:x[3],output:x[4]}));
 blocks=injectStageRouteSupport(blocks,kind);
 blocks=scaleRouteBlocks(blocks,s.minutes).map((b,i)=>normalizeRouteBlock(b,i,kind));
 s.blocks=blocks;
 let cards=arr(s.cards).length?arr(s.cards):routeCardsFallback(kind);
 if(cards.length<4 && kind==='orientation') cards=[...cards,...base.cards].slice(0,6);
 if(cards.length!==blocks.length || blocks.some(b=>b._autoRouteSupport)){
  cards=blocks.map((b,i)=>({title:b.action||b.label||('Chặng '+(i+1)),purpose:b.output||'Hoàn thành chặng học này theo đúng giai đoạn.',limit:`${Number(b.minutes||0)} phút`,button:b.action||'Mở nội dung',route:b.route||routeBlockRoute(b,i)}));
 }
 s.cards=cards.map((c,i)=>({title:c?.title||('Thẻ học '+(i+1)),purpose:c?.purpose||c?.summary||c?.output||'Mở đúng kỹ năng để hoàn thành nhiệm vụ trong lịch hôm nay.',limit:c?.limit||c?.timeLimit||'',button:c?.button||'Mở nội dung',route:c?.route||routeBlockRoute({label:c?.title,action:c?.button,output:c?.purpose},i)}));
 s.antiCrammingNote=s.antiCrammingNote||base.antiCrammingNote;
 s.pedagogyNote=s.pedagogyNote||base.pedagogyNote;
 s.blockedTestReason=s.blockedTestReason||'';
 s.weekendDecision=s.weekendDecision||'';
 return s;
}
function planSession(){
 if(state.routeManual&&typeof state.routeManual==='object') return normalizeRouteSession(state.routeManual);
 const bundle=state.planningBundle;
 if(bundle?.plan?.sessions?.length) return normalizeRouteSession(bundle.plan.sessions[0]);
 return normalizeRouteSession(baseRouteSession());
}
function allRouteSessions(){const bundle=state.planningBundle; const list=bundle?.plan?.sessions?.length?bundle.plan.sessions:[planSession()]; return arr(list).map(normalizeRouteSession)}
function routeQualityBadges(s){
 const badges=[];
 if(s.sessionKind==='orientation')badges.push('Không kiểm tra chính thức ngày đầu');
 if(Number(s.reviewMinutes||0)>0)badges.push(`${Number(s.reviewMinutes||0)} phút ôn/sửa lỗi`);
 if(s.blockedTestReason)badges.push('Tự chuyển sang ôn vì chưa đủ nền');
 badges.push('Nghe/Nói/Video là trục chính');
 const p=routeStageSupport(currentStageId());
 badges.push(`Ngữ pháp: ${p.level}`);
 badges.push('Mind map: check nhớ');
 return `<div class="route-quality-badges">${badges.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;
}
function renderRouteLearningContract(s){
 const rows=[['Vào buổi','Mở video/audio ngắn trước, nghe lấy nhịp rồi mới vào thẻ học.'],['Trong buổi','Mỗi chặng phải có sản phẩm nhỏ: nghe được, nhại được, nói được hoặc viết/gõ được.'],['Cuối buổi','Ghi một lỗi âm/câu cần sửa ngày mai; chưa ép kiểm tra chính thức trong giai đoạn làm quen.']];
 return `<section class="panel route-contract-panel"><div><span class="chip">Luật học hôm nay</span><h4>Không để lịch chỉ là danh sách đẹp</h4><p>${esc(s.pedagogyNote||'Học theo vòng nghe, nói, dùng lại và tự sửa lỗi.')}</p></div><div class="route-contract-grid">${rows.map(r=>`<article><b>${esc(r[0])}</b><span>${esc(r[1])}</span></article>`).join('')}</div></section>`;
}
function renderRouteOutputPanel(s){
 const output=s.output||'Có đầu ra nghe-nói-viết rõ ràng.';
 const note=s.antiCrammingNote||'Chống nhồi: có học mới, thực hành, ôn nhẹ và tự phản hồi.';
 return `<section class="panel route-output-panel"><article><span class="chip">Đầu ra bắt buộc</span><p>${esc(output)}</p></article><article><span class="chip">Chống nhồi</span><p>${esc(note)}</p></article>${s.blockedTestReason?`<article class="warn"><span class="chip warn-chip">Chưa kiểm tra</span><p>${esc(s.blockedTestReason)}</p></article>`:''}</section>`;
}
function routeCardHtml(c,i,edit=false){
 if(edit) return `<article class="routeCard edit"><label>Tên nhiệm vụ<input class="input compact-input" data-route-field="title" data-idx="${i}" value="${esc(c.title||'')}"></label><label>Giới hạn<input class="input compact-input" data-route-field="limit" data-idx="${i}" value="${esc(c.limit||'')}"></label><label class="wide">Mục đích<textarea class="textarea compact-textarea" data-route-field="purpose" data-idx="${i}">${esc(c.purpose||'')}</textarea></label></article>`;
 return `<article class="routeCard routeCard-guided"><span class="chip">${esc(c.limit||'')}</span><h4>${esc(c.title||'Nhiệm vụ')}</h4><p>${esc(c.purpose||'')}</p><div class="route-card-actions"><button class="btn soft route-guide-btn" data-route='${esc(JSON.stringify(c.route||{}))}'>Dẫn đường tới mục tiêu</button><button class="btn primary" data-route='${esc(JSON.stringify(c.route||{}))}'>${esc(c.button||'Mở nội dung')}</button></div></article>`
}
function scheduleStepRoute(session,block={},card={},i=0){
 const cardRoute=card?.route||{};
 const hay=lower([block.key,block.label,block.action,card.title,card.button,card.purpose].filter(Boolean).join(' '));
 if(cardRoute.learnTab==='exam'||/(^|_|\s)(test|exam|assessment)($|_|\s)|kiểm tra|làm đề|nộp đề|đề chính thức/.test(hay))return examRoutePayload({...session,...block,...card,...cardRoute});
 if(cardRoute.view)return cardRoute;
 return block.route||routeBlockRoute(block,i);
}
function renderRouteExamBinding(session,details=[],cards=[]){
 const pair=arr(details).map((b,i)=>({b,c:cards[i]||{},i,route:scheduleStepRoute(session,b,cards[i]||{},i)})).find(x=>x.route?.learnTab==='exam');
 if(!pair)return '';
 const next=gateNextNeededType();
 const paper=next||scheduleExamPaperType({...session,...pair.b,...pair.c,...pair.route});
 const cfg=examPaperConfig(paper);
 const result=examPaperResult(paper);
 const route=routeExamPayloadForToday({paperType:paper,...session,...pair.b,...pair.c,...pair.route},session,pair.i+1);
 const prereq=schedulePrereqStatus(session,{index:pair.i,step:pair.i+1,block:pair.b,card:pair.c,route:pair.route});
 const g=gateState();
 const status=result?`${Number(result.score10||0).toFixed(1)}/10 · ${result.passed?'Đạt':'Cần sửa'}`:'Chưa nộp';
 const disabled=!prereq.allowed||!next;
 const msg=!next?'Phần hiện tại đã đủ kiểm tra, hãy mở khóa bước tiếp theo.':(prereq.allowed?'Đã đủ điều kiện mở đề từ lịch.':prereq.reason);
 return `<section class="panel route-exam-binding v1316-route-exam-binding v1317-route-exam-binding ${disabled?'locked':'ready'}"><div><span class="chip">🧪 Kiểm tra hôm nay</span><h4>${esc(cfg.label)} · ${cfg.total} câu · phần ${g.currentPart}/${g.totalParts}</h4><p>${esc(msg)} Đề chỉ lấy nội dung thuộc phần đang học và ưu tiên bài đã phân bổ trong lịch.</p></div><div class="route-exam-binding-actions"><b>${esc(status)}</b><button class="btn primary" data-route='${esc(JSON.stringify(route))}' ${disabled?'disabled':''}>Mở đúng đề hôm nay</button></div></section>`;
}
function renderRouteAcademicGate(s=planSession()){
 s=normalizeRouteSession(s); const g=gateState(); const rows=partRequirementRows(); const reqCards=rows.map(r=>`<article class="gate-req ${r.done>=r.need?'done':'pending'}"><b>${esc(r.label)}</b><span>${r.done}/${r.need}</span></article>`).join('');
 const exam=scheduleExamStep(s); const prereq=schedulePrereqStatus(s,exam); const doneCount=arr(s.blocks).filter((_,i)=>isScheduleTaskDone(i+1,s)).length;
 return `<section class="panel route-academic-gate v1317-academic-gate"><div><span class="chip">Cổng học thuật</span><h4>${esc(stageTitle(g.currentStage))} · phần ${g.currentPart}/${g.totalParts}</h4><p>Hoàn thành chặng học trong lịch hôm nay rồi mới mở kiểm tra. Qua đủ yêu cầu mới mở khóa phần tiếp theo.</p></div><div class="gate-req-grid">${reqCards}</div><aside><b>${doneCount}/${arr(s.blocks).length}</b><span>chặng đã mở-học</span><small>${esc(prereq.reason)}</small></aside></section>`;
}

function renderRouteToday(s){
 s=normalizeRouteSession(s);
 s=window.BaumanPlanningBridge?.applyLiveReviewOverlay?.({sessions:[s]})?.sessions?.[0]||s;
 const details=arr(s.blocks).map(routeBlockDetail);
 const cards=arr(s.cards);
 const total=Number(s.minutes||details.reduce((a,b)=>a+(Number(b.minutes)||0),0)||90);
 const merged=details.map((b,i)=>{
   const c=b._autoRouteSupport?{}:(cards[i]||{});
   const route=scheduleStepRoute(s,b,c,i);
   const routeLessonId=str(route?.lessonId||state.lessonId||activeLessonContext().id||'');
   const routeToday=route?.learnTab==='exam'?routeExamPayloadForToday({...s,...b,...c,...route,lessonId:routeLessonId},s,i+1):{...route,lessonId:routeLessonId,routeSource:'today_schedule',stage:currentStageId(),part:gatePart(),sessionKey:sessionKey(s),scheduleStep:i+1};
   const action=c.button||b.action||'Mở nội dung';
   const support=c.title&&c.title!==b.label?c.title:(b.action||'Hoạt động chính');
   const purpose=c.purpose||b.output||'Hoàn thành chặng học này rồi chuyển sang chặng kế tiếp.';
   const limit=c.limit||`${Number(b.minutes||0)} phút`;
   const isDone=isScheduleTaskDone(i+1,s);
   const isOpened=isScheduleTaskOpened(i+1,s);
   const evidence=isOpened&&!isDone?scheduleTaskEvidence(i+1,s):null;
   const isExam=routeToday.learnTab==='exam';
   const prereq=isExam?schedulePrereqStatus(s,{index:i,step:i+1,block:b,card:c,route:routeToday}):{allowed:true,reason:''};
   return `<article class="route-unified-card v1261-route-step v1317-route-step ${isDone?'done':'pending'} ${isExam?'exam-step':''}" data-step="${i+1}">
     <div class="route-unified-top"><b>${Number(b.minutes||0)}'</b><em>${String(i+1).padStart(2,'0')}</em></div>
     <span class="route-unified-limit">${esc(limit)} · ${isDone?'Đã hoàn thành':(isOpened?(evidence?.ok?'Đủ bằng chứng · chờ xác nhận':'Đã mở · chưa đủ bằng chứng'):'Cần học')}</span>
     <h4>${esc(b.label)}</h4>
     <strong>${esc(support)}</strong>
     <p>${esc(isExam&&!prereq.allowed?prereq.reason:purpose)}</p>
     <button class="btn ${isExam?'primary':'soft'}" data-route='${esc(JSON.stringify(routeToday))}' ${isExam&&!prereq.allowed?'disabled':''}>${esc(action)}</button>
     ${!isExam&&isOpened&&!isDone?`<small class="route-evidence-note">${esc(evidence?.reason||'Cần bằng chứng học sau khi mở chặng.')}</small><button class="btn soft" data-act="complete-schedule-step" data-schedule-step="${i+1}" ${evidence?.ok?'':'disabled'}>Xác nhận bằng chứng & hoàn thành</button>`:''}
   </article>`;
 }).join('');
 return `<section class="route-today route-today-unified v1261-route-today v1286-route-today v1287-route-today">
   <div class="v1287-route-kicker"><span class="chip">Lịch hôm nay</span></div>
   <div class="route-summary route-unified-summary v1261-route-summary v1286-route-summary v1287-route-summary">
     <div><h3>${esc(s.phase||'Lịch học')}</h3><p>${esc(s.output||'Làm một chuỗi học ngắn có đầu ra rõ: nghe được, nói được, viết được và tự kiểm tra được.')}</p>${routeQualityBadges(s)}</div>
     <div class="route-minute"><b>${total}</b><small>phút</small></div>
   </div>
   ${renderRouteAcademicGate(s)}
   ${renderRouteExamBinding(s,details,cards)}
   <div class="route-section-title route-unified-title"><h4>Lộ trình học hôm nay</h4><span>Mỗi chặng có thời lượng, nhiệm vụ, đầu ra và một nút hành động chính.</span></div>
   <div class="route-unified-grid v1261-route-grid">${merged}</div>
 </section>`
}

function renderRouteWeek(){const list=allRouteSessions().slice(0,7); return `<div class="route-week">${list.map((x,i)=>`<article><b>${esc(x.date||('Buổi '+(i+1)))}</b><span>${esc(x.sessionKind||'study')} · ${Number(x.minutes||0)} phút</span><small>${esc(x.phase||x.output||'')}</small></article>`).join('')}</div>`}
function renderRouteFull(){const list=allRouteSessions(); return `<details class="route-full"><summary>Toàn bộ lộ trình (${list.length} buổi)</summary><div>${list.map((x,i)=>`<article><b>${i+1}. ${esc(x.phase||'Buổi học')}</b><small>${esc(x.date||'')} · ${Number(x.minutes||0)} phút · ${esc(x.sessionKind||'study')}</small><span>${esc(x.output||'')}</span></article>`).join('')}</div></details>`}
function renderRouteEditor(s){s=normalizeRouteSession(s); return `<div class="route-edit-form"><div class="form-row"><label>Tiêu đề buổi<input class="input" id="routePhase" value="${esc(s.phase||'')}"></label><label>Thời lượng<input class="input" id="routeMinutes" type="number" min="15" max="240" value="${Number(s.minutes||90)}"></label></div><label>Đầu ra / ghi chú<textarea class="textarea compact-textarea" id="routeOutput">${esc(s.output||'')}</textarea></label><h4>Nhiệm vụ trong buổi</h4><div class="routeCards edit-grid">${arr(s.cards).map((c,i)=>routeCardHtml(c,i,true)).join('')}</div></div>`}
function saveRouteManual(){const s=normalizeRouteSession(JSON.parse(JSON.stringify(planSession()))); s.phase=$('#routePhase')?.value||s.phase; s.minutes=Number($('#routeMinutes')?.value)||s.minutes; s.output=$('#routeOutput')?.value||s.output; $$('.routeCard.edit').forEach(card=>{const i=Number($('[data-route-field="title"]',card)?.dataset.idx); if(!Number.isFinite(i))return; s.cards[i]=s.cards[i]||{}; ['title','limit','purpose'].forEach(f=>{const el=$(`[data-route-field="${f}"]`,card); if(el)s.cards[i][f]=el.value;});}); state.routeManual=normalizeRouteSession(s); state.routeEdit=false; save(); openModal(renderRouteModal(),'route'); toast('Đã lưu chỉnh sửa lịch trình')}
function requestMainSchedule(action){const payload={type:'BAUMAN_SUBJECT_SCHEDULE_REQUEST',subjectId:A.id||'russian',action,session:planSession()};window.BaumanSubjectHost?.send?.(payload);toast(action==='regenerate'?'Đã gửi yêu cầu tạo lại lịch':'Đã gửi yêu cầu học bù thêm giờ')}
function renderRouteFocusPanel(s){
 s=normalizeRouteSession(s);
 return `<section class="panel route-focus-panel"><div class="route-focus-copy"><span class="chip">Trọng tâm buổi học</span><h4>${esc(s.phase||'Buổi học hôm nay')}</h4><p>${esc(stageReality())}</p></div><div class="route-focus-actions"><button class="btn dark" data-route='{"view":"learning","learnTab":"theory"}'>Bắt đầu học</button><button class="btn soft" data-route='{"view":"dialogue"}'>Luyện nói</button><button class="btn soft" data-act="route-edit">Xem / chỉnh</button></div></section>`
}
function renderRouteContinuePanel(){
 return `<section class="panel route-continue-panel"><div class="route-section-title"><h4>Tiếp tục học</h4><span>Quay lại điểm đã mở gần nhất hoặc theo lịch hôm nay.</span></div><div class="resume-list compact-resume-list">${renderRecentAccess()}</div></section>`
}
function renderRoutePracticalStrip(s){
 s=normalizeRouteSession(s);
 const p=routeStageSupport(currentStageId());
 return `<div class="today-practical-strip route-modal-practical"><article><b>Đầu ra cần có</b><span>${esc(s.output||'Làm quen, nghe-nhại, viết/gõ; chưa kiểm tra chính thức.')}</span></article><article><b>Ngữ pháp theo giai đoạn</b><span>${esc(p.grammarLabel)} · chỉ lấy 1 quy tắc nhỏ để dùng ngay trong câu.</span></article><article><b>Check nhớ Mind map</b><span>${esc(p.check)} Đây là nhắc nhớ cuối buổi, không học lan man.</span></article></div>`
}
function renderRouteOutputChecklist(s){
 const p=routeStageSupport(currentStageId());
 const items=[
  ['Nghe','Đã nghe ít nhất 1 nguồn tiếng Nga thật và bắt được nhịp.',{view:'media'}],
  ['Nói','Đã nhại/đóng vai tối thiểu 3-5 câu ngắn.',{view:'dialogue'}],
  ['Ngữ pháp','Đã rút 1 mẫu ngữ pháp đúng cấp và tự tạo 1 câu.',grammarRouteForStage(currentStageId())],
  ['Mind map check',p.check,mindmapRouteForStage(currentStageId())],
  ['Viết/gõ','Đã viết hoặc gõ vài ký tự/cụm Cyrillic xuất hiện trong hội thoại.',{view:'writing',mode:'handwriting'}],
  ['Tự sửa','Đã ghi 1 lỗi cần vá trong buổi sau.',{view:'learning',learnTab:'review'}]
 ];
 return `<section class="panel route-output-check"><div class="route-section-title"><h4>Checklist đầu ra</h4><span>Không tính điểm, chỉ kiểm tra buổi học có thật sự khép vòng chưa.</span></div><div class="route-output-grid">${items.map((x,i)=>`<button data-route='${esc(JSON.stringify(x[2]))}'><i>${String(i+1).padStart(2,'0')}</i><b>${esc(x[0])}</b><span>${esc(x[1])}</span></button>`).join('')}</div></section>`
}
function renderRouteCompletionPlan(s){
 s=normalizeRouteSession(s);
 const blocks=arr(s.blocks); const total=blocks.reduce((a,b)=>a+(Number(b.minutes)||0),0)||Number(s.minutes)||90;
 const rows=[
  ['Trước khi học','Mở đúng chặng 01, chuẩn bị tai nghe/sổ ghi lỗi, không mở quá nhiều tab.',''],
  ['Đang học','Mỗi chặng phải có sản phẩm nhỏ: nghe xong, nhại được, nói vai, viết/gõ lại.',''],
  ['Nếu hụt giờ','Giữ video + nhại câu; giảm từ vựng/ngữ pháp xuống mức phụ trợ.','route-extra-time'],
  ['Kết thúc','Ghi 1 lỗi nghe/nói, 1 câu sẽ nói lại ngày mai, rồi mới ôn nhẹ.','']
 ];
 return `<section class="panel route-completion-plan"><div class="route-section-title"><h4>Kế hoạch hoàn thành</h4><span>${total} phút · đủ đường lui khi không kịp học hết.</span></div><div class="route-completion-grid">${rows.map(r=>`<article><b>${esc(r[0])}</b><span>${esc(r[1])}</span>${r[2]?'<button class="btn soft" data-act="route-extra-time">Học bù thêm</button>':''}</article>`).join('')}</div></section>`
}
function renderRouteClosurePanel(s){
 s=normalizeRouteSession(s);
 const items=[
  ['Nghe','Đã nghe ít nhất 1 nguồn tiếng Nga thật, bắt được nhịp và âm khó.',{view:'media'}],
  ['Nói','Đã nhại/đóng vai tối thiểu 3-5 câu ngắn.',{view:'dialogue'}],
  ['Viết/gõ','Đã viết hoặc gõ lại vài cụm Cyrillic xuất hiện trong hội thoại.',{view:'writing',mode:'handwriting'}],
  ['Tự sửa','Đã ghi 1 lỗi nghe/nói cần vá ở buổi sau.',{view:'learning',learnTab:'review'}]
 ];
 const fallback=[
  ['Còn 30 phút','Giữ video + nhại câu + đóng vai 1 lượt; bỏ học lan man.'],
  ['Còn 15 phút','Chỉ nghe lại 1 đoạn và nói lại 3 câu quan trọng.'],
  ['Kết thúc','Ghi một lỗi phát âm/câu dùng sai, lưu lại để hôm sau sửa.']
 ];
 return `<section class="panel v1261-route-closure"><div class="route-section-title"><h4>Đầu ra và đường lui</h4><span>Đủ việc phải có, không phơi quá nhiều bảng phụ.</span></div><div class="v1261-closure-grid">${items.map((x,i)=>`<button data-route='${esc(JSON.stringify(x[2]))}'><i>${String(i+1).padStart(2,'0')}</i><b>${esc(x[0])}</b><span>${esc(x[1])}</span></button>`).join('')}</div><div class="v1261-fallback-row">${fallback.map(x=>`<article><b>${esc(x[0])}</b><span>${esc(x[1])}</span></article>`).join('')}</div></section>`
}

function renderRouteSettingsMenu(resetLocked=routeResetLocked()){
 return `<details class="route-settings-menu v1287-route-settings v1290-route-settings"><summary class="btn route-settings-btn" aria-label="Mở cài đặt lịch">⚙ <span>Cài đặt</span></summary><div class="route-settings-panel"><button class="btn" data-act="route-edit">${state.routeEdit?'Đang chỉnh':'Chỉnh sửa'}</button><button class="btn" data-act="route-export">Xuất lịch</button><button class="btn dark ${resetLocked?'locked':''}" data-act="route-request-regen" ${resetLocked?'disabled':''} title="${resetLocked?esc(routeResetLockMessage()):'Reset lịch trình'}">Reset</button><button class="btn primary" data-act="route-extra-time">Học bù thêm</button></div></details>`;
}
function renderRouteSidePanel(){
 const progress=learningProgress();
 const resetLocked=routeResetLocked();
 return `<aside class="route-modal-side-card v1290-route-side v1291-route-side">
  <header class="v1291-stage-head"><span>Giai đoạn hiện tại</span>${renderRouteSettingsMenu(resetLocked)}</header>
  <section class="v1291-stage-identity"><h3>${esc(progress.stage)}</h3><p>Nội dung được lọc theo giai đoạn để học đúng việc đang cần.</p></section>
  <nav class="stage-quick-actions v1290-stage-actions v1291-stage-actions"><button class="btn dark" data-view="learning">Vào học</button><button class="btn soft" data-view="dialogue">Luyện nói</button><button class="btn soft" data-view="writing">Luyện viết</button></nav>
  <section class="v1291-stage-review">${reviewOverviewSummary()}${renderRemedialOverview()}</section>
 </aside>`
}
function renderRouteModal(){
 const s=normalizeRouteSession(planSession());
 const resetLocked=routeResetLocked();
 const routeBody = state.routeEdit
  ? `<main class="v1290-route-edit-main">${renderRouteEditor(s)}</main>`
  : `<div class="route-tabs-clean v1261-route-modal-layout v1290-route-modal-layout"><main class="route-modal-main-flow v1261-route-main v1290-route-main">${renderRouteToday(s)}${renderRouteClosurePanel(s)}<details class="route-details-soft v1290-route-details"><summary>Tuần này và toàn bộ lộ trình</summary><section class="route-section"><h4>Tuần này</h4>${renderRouteWeek()}</section>${renderRouteFull()}</details></main>${renderRouteSidePanel()}</div>`;
 return `<div class="route-modal-clean v1261-route-modal v1284-route-polish v1286-route-polish v1287-route-modal v1290-route-modal">${resetLocked?`<div class="route-reset-lock-note">${esc(routeResetLockMessage())}</div>`:''}${routeBody}<footer class="route-modal-foot">${state.routeEdit?'<button class="btn" data-act="route-cancel">Hủy</button><button class="btn primary" data-act="route-save">Lưu chỉnh sửa</button>':''}</footer></div>`
}

function learningListForMode(){
 const mode=state.learnTab;
 const ctx=activeLessonContext();
 if(mode==='theory'){
   const lessons=getLessons();
   const current=ctx.lesson;
   return {title:'Danh sách bài học', hint:'', items:lessons.slice(0,160).map((l,i)=>`<button class="learn-item v1293-lesson-list-item ${lessonKey(current)===lessonKey(l)?'active':''}" data-lesson="${esc(lessonKey(l))}"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(A.lessonTitle?.(l)||l.title||'Bài học')}</b></button>`).join('')||'<div class="note">Chưa có bài học.</div>'};
 }
 if(mode==='exercises'){
   const xs=getExercises().slice(0,160);
   return {title:'Bài tập '+ctx.id, hint:'', items:xs.map((x,i)=>`<button class="learn-item v1293-exercise-list-item clean-left-item ${i===state.exerciseIndex?'active':''}" data-exercise-focus="${i}"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(A.exerciseTitle?.(x)||x.title||('Bài tập '+(i+1)))}</b></button>`).join('')||'<div class="note">Bài này chưa có bài tập đúng lessonId.</div>'};
 }
 if(mode==='practice'){
   const ds=getPracticeDialogues().slice(0,160); const active=ds.find(d=>(d.id||d.title)===state.practiceDialogueId)||ds[0];
   const item=d=>{const turns=dialogueTurns(d).length; const group=A.dialogueGroup?.(d)||d.group||'general'; const diff=A.dialogueDifficulty?.(d)||d.difficulty||d.level||'all'; return {turns,group,diff,title:A.dialogueTitle?.(d)||d.title||'Bài nghe-nhại',sub:A.dialogueSubtitle?.(d)||d.purpose||d.context_title_vi||''};};
   return {title:'Nghe và nhại '+ctx.id, hint:'Chọn tình huống, nghe mẫu rồi nhại từng câu.', items:ds.map((d,i)=>{const it=item(d); return `<button class="learn-item v1293-dialogue-item v1295-dialogue-list-item clean-left-item ${active===d?'active':''}" data-practice-dialogue="${esc(d.id||d.title)}"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(it.title)}</b><em>${it.turns} câu nghe-nhại</em></button>`}).join('')||'<div class="note">Bài này chưa có hội thoại đúng lessonId hoặc bộ lọc đang quá hẹp.</div>'};
 }
 if(mode==='review')return {title:'Ôn tập', hint:'Các bộ lọc và câu hỏi nằm trong khung chính.', items:'<div class="note">Ôn tập hiển thị ở khung bên phải. Hàng nút phía trên giữ cùng bố cục với Lý thuyết, Bài tập và Nghe/Nói.</div>'};
 if(mode==='exam')return {title:'Kiểm tra', hint:'Làm đề và xem kết quả trong khung chính.', items:'<div class="note">Kiểm tra hiển thị ở khung bên phải. Hàng nút phía trên giữ cùng bố cục với các tab học tập khác.</div>'};
 return {title:'Học tập', hint:'', items:''};
}
function renderLearning(){
 const lessons=getLessons(), concepts=getConcepts();
 const ctx=activeLessonContext();
 const current=ctx.lesson;
 const list=learningListForMode();
 let body='';
 try{
  if(state.learnTab==='theory') body=renderTheory(lessons,concepts,current);
  if(state.learnTab==='exercises') body=renderExercises();
  if(state.learnTab==='practice') body=renderPractice();
  if(state.learnTab==='review') body=renderReview();
  if(state.learnTab==='exam') body=renderExam();
 }catch(e){
  console.error('Learning tab render error',state.learnTab,e);
  body=`<section class="panel learn-work-card learning-recovery-card"><span class="chip danger-chip">LỖI TAB HỌC TẬP</span><h3>Không render được mục ${esc(state.learnTab||'học tập')}</h3><p>${esc(e?.message||e)}</p><button class="btn primary" data-learn="theory">Quay lại Lý thuyết</button></section>`;
 }
 const modeMeta={
  theory:{label:'Lý thuyết',kicker:'Đọc gọn, hiểu nhanh',hint:'Danh sách bài học nằm full bảng bên trái; nội dung bài là trung tâm.'},
  exercises:{label:'Bài tập',kicker:'Luyện có kiểm soát',hint:'Làm đúng bài đang chọn.'},
  practice:{label:'Nghe nói',kicker:'Nghe - nhại - đổi vai',hint:'Nghe mẫu, nhại câu và đổi vai.'}
 }[state.learnTab]||{label:list.title||'Học tập',kicker:'Học theo nhịp',hint:'Chọn đúng chế độ ở thanh trên.'};
 const ctxDialogues=byStage(getBasicSpeakingDialogues()).filter(x=>ctx.id&&sameLesson(x,ctx.id));
 const groups=uniq(ctxDialogues.map(x=>A.dialogueGroup?.(x)||x.group||'general'));
 const diffs=uniq(ctxDialogues.map(x=>A.dialogueDifficulty?.(x)||x.difficulty||x.level||'all'));
 const exerciseLevels=uniq(byStage(call('getExercises',[],DB)).map(x=>A.exerciseLevel?.(x)||x.level||x.difficulty||'all'));
 const searchBox=state.learnTab==='theory'
  ? `<input class="input learn-canva-search" data-input="lessonQuery" value="${esc(state.lessonQuery)}" placeholder="Tìm bài học, chủ đề...">`
  : state.learnTab==='practice'
  ? `<div class="learn-filter-stack"><select class="input" data-input="practiceGroup"><option value="all">Tất cả nhóm</option>${groups.map(g=>`<option value="${esc(g)}" ${state.practiceGroup===g?'selected':''}>${esc(g)}</option>`).join('')}</select><select class="input" data-input="practiceDifficulty"><option value="all">Tất cả mức</option>${diffs.map(g=>`<option value="${esc(g)}" ${state.practiceDifficulty===g?'selected':''}>${esc(g)}</option>`).join('')}</select><input class="input learn-canva-search" data-input="practiceQuery" value="${esc(state.practiceQuery)}" placeholder="Tìm bài nghe/nhại cơ bản..."></div>`
  : state.learnTab==='exercises'
  ? `<select class="input learn-canva-search" data-input="exerciseLevel">${exerciseLevelOptions(state.exerciseLevel)}</select>`
  : '';
 const assessmentSingle=['review','exam'].includes(state.learnTab);
 const mainClass=assessmentSingle?'learn-main learn-canva-main v1257-content-focus v1261-content-focus assessment-single-main v1298-assessment-single-main':'learn-main learn-canva-main v1257-content-focus v1261-content-focus';
 const content = assessmentSingle
  ? `<main class="${mainClass}">${body}</main>`
  : `<div class="learn-canva-grid">
     <aside class="panel learn-canva-side v1257-side-full-list v1261-side-full-list">
       <div class="learn-canva-side-head"><span class="chip">${esc(modeMeta.kicker)}</span><h4>${esc(list.title||modeMeta.label)}</h4>${searchBox}</div>
       <div class="learn-list scroll mode-specific-list learn-canva-list v1257-full-list v1261-full-list">${list.items}</div>
     </aside>
     <main class="${mainClass}">${body}</main>
   </div>`;
 const activeLearnTab=LEARN_TABS.find(t=>t[0]===state.learnTab)||LEARN_TABS[0];
 const structureMenu=`<details class="learn-structure-menu"><summary class="learn-structure-trigger"><span>🧭</span><b>Cấu trúc bài học</b><u>▾</u></summary><div class="learn-structure-dropdown" role="menu">${LEARN_TABS.map(t=>`<button class="learn-structure-choice ${state.learnTab===t[0]?'active':''}" data-learn="${t[0]}"><span>${t[1]}</span><b>${esc(t[2])}</b></button>`).join('')}</div></details>`;
 return `<div class="learn-canva-shell v1256-learn-canva v1257-learn-deepfix v1261-learn-final v1283-learn-compact v1286-learn-${esc(state.learnTab||'mode')} ${assessmentSingle?'v1298-assessment-single':''}">
   <section class="panel learn-compact-modebar v1323-learn-structure-bar">
     <div class="learn-structure-left">${structureMenu}<div class="learn-structure-indicator"><span>${activeLearnTab[1]}</span><div><b>${esc(activeLearnTab[2])}</b><small>${esc(modeMeta.kicker||modeMeta.label)}</small></div></div></div>
     <div class="learn-structure-context"><span class="chip">${esc(activeLessonContext().id||'Bài học')}</span><small>${esc(modeMeta.hint)}</small></div>
   </section>
   ${content}
 </div>`
}
function renderTheory(lessons,concepts,currentLessonArg){
 /* V18_RENDERER_CLEAN: metadata/tags/related concepts kept for search/filter but hidden from lesson and presentation slides. */
 const lesson=currentLessonArg||currentLesson();
 const {slides,idx}=clampSlideIndex(lesson);
 const slide=slides[idx]||{};
 return `<section class="panel lesson-reader v1257-theory-main v1261-theory-main v1271-theory-main v1295-theory-tight">
   <div class="lesson-reader-top v1257-reader-top v1271-theory-head v1283-theory-head v1295-theory-head">
     <div><span class="chip">${esc(lesson?.id||'LESSON')} · ${esc(stageTitle(stageOf(lesson)||state.stage))}</span><b>${esc(slide?.title||A.lessonTitle?.(lesson)||lesson?.title||'Bài học')}</b></div>
     <div class="lesson-tools v1271-theory-tools"><button class="btn" data-act="prev-slide">←</button><span class="chip">${idx+1}/${slides.length||1}</span><button class="btn" data-act="next-slide">→</button><button class="btn primary" data-act="open-present">⛶ Trình chiếu</button></div>
   </div>
   <div class="slide-strip v1257-slide-strip v1261-slide-strip v1271-slide-strip" aria-label="Thanh chọn slide">${slides.map((sl,i)=>`<button class="slide-nav compact-slide v1271-slide-pill ${i===idx?'active':''}" data-slide="${i}" title="${esc(sl.title||lesson?.title||'Slide')}"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(sl.title||lesson?.title||'Slide')}</b></button>`).join('')}</div>
   <div class="lesson-content slidebox v1257-lesson-content v1261-lesson-content v1271-lesson-content v1295-theory-scroll" tabindex="0"><article class="slide v1271-slide-page v1295-slide-page">${slideBody(slide,lesson)}</article></div>
 </section>`
}

function renderExerciseSourceAnswer(ex){
 const answer=normalizeSlideValue(A.exerciseAnswer?.(ex)||ex?.answer||'');
 const rubric=arr(ex?.rubric).map(x=>'✓ '+normalizeSlideValue(x)).filter(Boolean).join('\n');
 return [answer?`ĐÁP ÁN/GỢI Ý TỪ DỮ LIỆU GỐC\n${answer}`:'', rubric?`TIÊU CHÍ TỰ KIỂM TỪ DỮ LIỆU GỐC\n${rubric}`:''].filter(Boolean).join('\n\n');
}
function renderExercises(){
 const ctx=activeLessonContext();
 const allForLesson=byStage(call('getExercises',[],DB)).filter(x=>ctx.id&&sameLesson(x,ctx.id));
 let xs=getExercises().slice(0,160);
 if(state.exerciseIndex>=xs.length)state.exerciseIndex=Math.max(0,xs.length-1);
 const active=xs[state.exerciseIndex]||xs[0]||null;
 const level=canonicalLevel(A.exerciseLevel?.(active)||active?.level||active?.difficulty||state.exerciseLevel||'easy');
 const prompt=active?cleanExercisePrompt(active):'';
 const answer=active?renderExerciseSourceAnswer(active):'';
 const taskTitle=active?clip(str(A.exerciseTitle?.(active)||active.title||'Bài tập'),120):'Bài tập';
 const prevDisabled=!active||state.exerciseIndex<=0;
 const nextDisabled=!active||state.exerciseIndex>=xs.length-1;
 const availableLevels=uniq(allForLesson.map(x=>canonicalLevel(A.exerciseLevel?.(x)||x.level||x.difficulty||'easy'))).map(examLevelLabel).join(', ')||'chưa có';
 const progress=xs.length?Math.round(((state.exerciseIndex+1)/xs.length)*100):0;
 const metaLine=active?`${esc(taskTitle)}`:`${allForLesson.length} bài trong lesson`;
 const body=active?`<article class="exercise-nine-card" tabindex="0">
     <header class="exercise-nine-title"><h3>${esc(taskTitle)}</h3></header>
     <div class="exercise-nine-progress" aria-label="Tiến độ bài tập"><i style="width:${progress}%"></i><span>${state.exerciseIndex+1}/${xs.length}</span></div>
     <section class="exercise-nine-prompt"><b>Yêu cầu</b><div>${esc(prompt||'Chưa có yêu cầu bài tập.').replace(/\n/g,'<br>')}</div></section>
     <section class="exercise-nine-workspace"><b>Khu vực tự làm</b><p>Hãy làm ra vở hoặc nói miệng trước. Bấm mở đáp án sau khi đã tự xử lý, tránh học vẹt.</p></section>
     <details class="exercise-nine-answer"><summary>Xem đáp án/rubric gốc</summary><div>${esc(answer||'Chưa có đáp án/rubric trong dữ liệu gốc.').replace(/\n/g,'<br>')}</div></details>
   </article>`:`<div class="note exercise-nine-empty"><b>Không có bài tập phù hợp bộ lọc hiện tại.</b><span>Bài ${esc(ctx.id)} có ${allForLesson.length} bài tập trong dữ liệu; các mức có trong bài: ${esc(availableLevels)}. Hãy đổi mức độ hoặc chọn bài khác ở danh sách bên trái.</span></div>`;
 return `<section class="panel learn-work-card exercise-nine-shell">
   <header class="exercise-nine-head"><div><span class="chip">📝 BÀI TẬP · ${esc(ctx.id)}</span><h3>${active?`Câu ${state.exerciseIndex+1}/${xs.length}`:'Chưa có câu phù hợp'}</h3><p>${metaLine}</p></div><div class="exercise-nine-tools"><select class="input compact-select" data-input="exerciseLevel">${exerciseLevelOptions(state.exerciseLevel)}</select><button class="btn" data-act="prev-exercise" ${prevDisabled?'disabled':''}>← Trước</button><button class="btn primary" data-act="next-exercise" ${nextDisabled?'disabled':''}>Sau →</button></div></header>
   ${body}
 </section>`
}
function renderPractice(){
 const ctx=activeLessonContext();
 const list=getPracticeDialogues();
 const active=list.find(x=>(x.id||x.title)===state.practiceDialogueId)||list[0]||{};
 const turns=dialogueTurns(active);
 const idx=Math.min(state.practiceLineIndex,Math.max(0,turns.length-1));
 const line=turns[idx]||turns[0]||{};
 const role=state.practiceRole||'all';
 const hideVi=!!state.practiceHideVi;
 const result=speakingResultFor(active,idx);
 const prog=dialogueProgress(active);
 const roleStats=dialogueRoleStats(active,role);
 const targetText=dialogueText(line)||'';
 const lineRole=dialogueRoleOf(line,idx);
 const isMine=role!=='all'&&role===lineRole;
 const difficulty=A.dialogueDifficulty?.(active)||active?.difficulty||active?.level||'Dễ';
 const title=A.dialogueTitle?.(active)||active?.title||'Chọn bài nghe-nhại';
 const purpose=A.dialogueSubtitle?.(active)||active?.purpose||active?.context_title_vi||'Nghe mẫu, nhìn câu, hiểu nghĩa và nhại lại theo nội dung cho trước.';
 const currentRu=esc(targetText||'Chọn một tình huống ở cột trái để bắt đầu luyện nghe-nhại.');
 const currentVi=hideVi?'':dialogueVi(line);
 const cueText=role==='all'?'Nghe mẫu rồi nhại câu hiện tại':(isMine?'Đến lượt bạn nhại câu này':'Nghe vai còn lại để giữ mạch');
 const roleName=role==='all'?'Nghe + nhại toàn đoạn':`Nhại vai ${role}`;
 const hints=lineTokenHints(targetText);
 const roleLine=(t,i)=>{const r=dialogueRoleOf(t,i), mine=role!=='all'&&role===r, res=speakingResultFor(active,i); return `<button class="dialogue-line v1294-map-line ${i===idx?'active':''} ${mine?'my-role':''} ${res?.ok?'spoken-ok':res?'spoken-try':''}" data-line="${i}"><span class="speaker">${esc(r)}</span><b>${esc(dialogueText(t))}</b><small>${String(i+1).padStart(2,'0')} · ${mine?'Câu cần nhại':(role==='all'?'Nghe + nhại':'Nghe cue')}</small></button>`};
 return `<section class="panel v1294-speech-room v1295-speech-room">
   <header class="v1294-speech-head v1295-speech-head">
     <div class="v1294-speech-title v1295-speech-title"><span class="chip">🎙️ NGHE/NHẠI · ${esc(ctx.id)} · ${esc(difficulty)}</span><small>${esc(title)}</small></div>
     <div class="v1294-speech-toolbar v1295-speech-toolbar"><button class="btn ${role==='all'?'active':''}" data-act="role-all">Nghe + nhại</button><button class="btn ${role==='A'?'active':''}" data-act="role-a">Vai A</button><button class="btn ${role==='B'?'active':''}" data-act="role-b">Vai B</button><button class="btn" data-act="toggle-vi">${hideVi?'Hiện nghĩa':'Ẩn nghĩa'}</button></div>
   </header>
   <div class="v1294-speech-progress"><article><b>Chế độ</b><span>${esc(roleName)}</span></article><article><b>Tiến độ chung</b><span>${prog.ok}/${prog.total} câu đạt · ${prog.percent}%</span></article><article><b>Tiến độ vai</b><span>${roleStats.ok}/${roleStats.total} câu · ${roleStats.percent}%</span></article></div>
   <article class="v1294-current-line ${isMine?'student-turn':'listener-turn'} speech-content-board">
     <div class="speaker">${esc(lineRole)}</div>
     <div class="v1294-current-body"><label>Câu ${turns.length?idx+1:0}/${turns.length||0} · ${esc(cueText)}</label><div class="russian-line">${currentRu}</div>${currentVi?`<p>${esc(currentVi)}</p>`:''}${hints.length?`<div class="speech-hints">${hints.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}</div>
     <button class="btn green speech-ok-corner" data-act="mark-line-ok">✓ Đã nói ổn</button>
   </article>
   <div class="v1294-speech-actions"><button class="btn" data-act="prev-line">← Câu trước</button><button class="btn green" data-act="speak-line">🔊 Nghe mẫu</button><button class="btn" data-act="speak-line-slow">🐢 Nghe chậm</button><button class="btn" data-act="record-line">🎙️ Nhại lại</button><button class="btn primary" data-act="next-line">Câu tiếp →</button></div>
   <div class="v1294-feedback-line"><b>${result?`Điểm nhại: ${result.score}%`:'Gợi ý luyện'}</b><span>${result?esc(speechFeedback(result.score)):'Nghe mẫu 1 lượt, đọc câu thành tiếng, nhại chậm, sau đó tự nói không nhìn chữ.'}</span></div>
   <details class="v1294-speech-map"><summary>🧭 Bản đồ câu nói <span>${turns.length?idx+1:0}/${turns.length||0}</span></summary><div class="v1294-speech-map-grid">${turns.length?turns.map(roleLine).join(''):'<div class="note">Chưa có câu nói trong hội thoại đúng bài này.</div>'}</div></details>
 </section>`
}

function speechMapLineButton(active,t,i){
 const r=dialogueRoleOf(t,i), role=activeRole(), mine=role!=='all'&&role===r, res=speakingResultFor(active||{},i);
 const label=mine?'Lượt của bạn':(role==='all'?'Nhại':'Nghe cue');
 return `<button class="dialogue-line v1289-map-line ${i===activeLineIndex()?'active':''} ${mine?'my-role':''} ${res?.ok?'spoken-ok':res?'spoken-try':''}" data-line="${i}"><span class="speaker">${esc(r)}</span><b>${esc(dialogueText(t))}</b><small>${String(i+1).padStart(2,'0')} · ${esc(label)}</small></button>`
}
function renderSpeakingMapModal(){
 const active=currentDialogue();
 const turns=dialogueTurns(active);
 const title=A.dialogueTitle?.(active)||active?.title||'Bản đồ câu nói';
 return `<div class="modal-body v1289-speaking-map-modal"><header><span class="chip">🧭 BẢN ĐỒ CÂU NÓI</span><h3>${esc(title)}</h3><p>Chọn một câu để luyện ngay. Bản đồ được đưa vào popup để không lấn phần nói chính.</p></header><div class="dialogue-lines v1289-map-grid">${turns.length?turns.map((t,i)=>speechMapLineButton(active,t,i)).join(''):'<div class="note">Không có câu nói trong hội thoại đúng bài này.</div>'}</div><div class="modal-actions"><button class="btn primary" data-act="modal-close">Đóng</button></div></div>`
}
function normalizeSlideValue(v){
 if(v==null||v==='')return '';
 if(Array.isArray(v))return v.map(normalizeSlideValue).filter(Boolean).join('\n');
 if(typeof v==='object')return Object.entries(v).filter(([k])=>!['id','stage','lessonId','slides','blocks','type','kind'].includes(k)).map(([k,val])=>`${k}: ${normalizeSlideValue(val)}`).filter(x=>!x.endsWith(': ')).join('\n');
 return str(v);
}
function renderSlideList(items){return `<ul>${arr(items).map(x=>`<li>${esc(normalizeSlideValue(x))}</li>`).join('')}</ul>`}
function renderBlocks(blocks){
 return arr(blocks).map(b=>{
   if(typeof b==='string')return `<section class="slide-section"><p>${esc(b)}</p></section>`;
   const type=lower(b.type||b.kind||'section');
   const head=b.heading||b.title||b.label||'Nội dung';
   if(type==='list'||Array.isArray(b.items)) return `<section class="slide-section"><h4>${esc(head)}</h4>${renderSlideList(b.items||b.points||[])}</section>`;
   if(type==='quote') return `<blockquote class="slide-quote">${esc(normalizeSlideValue(b.text||b.content||b.body))}</blockquote>`;
   if(type==='formula'||type==='code') return `<pre class="slide-code">${esc(normalizeSlideValue(b.text||b.content||b.body))}</pre>`;
   const body=normalizeSlideValue(b.text||b.content||b.body||b.summary||b.value||'');
   return `<section class="slide-section"><h4>${esc(head)}</h4>${body.includes('\n')?`<p>${esc(body).replace(/\n/g,'<br>')}</p>`:`<p>${esc(body)}</p>`}</section>`;
 }).join('')
}
function slideExtraSections(slide,lesson){
 const sections=[];
 const pairs=[
  ['Mục tiêu', slide?.objectives||slide?.goals||slide?.outcomes||lesson?.objectives||lesson?.object],
  ['Tóm tắt', slide?.summary||lesson?.summary],
  ['Ví dụ', slide?.examples||slide?.example||lesson?.examples],
  ['Ghi nhớ', slide?.remember||slide?.note||slide?.professor_note||lesson?.note]
 ];
 pairs.forEach(([h,v])=>{const text=normalizeSlideValue(v); if(text)sections.push(`<section class="slide-section slide-extra"><h4>${esc(h)}</h4>${Array.isArray(v)?renderSlideList(v):`<p>${esc(text).replace(/\n/g,'<br>')}</p>`}</section>`)});
 return sections.join('')
}
function slideBody(slide,lesson){
 const blocks=arr(slide?.blocks);
 const rendered=blocks.length?renderBlocks(blocks):'';
 const ownText=normalizeSlideValue(slide?.content||slide?.text||slide?.body||slide?.detail||'');
 const fallback=!rendered&&!ownText?normalizeSlideValue(lesson?.body||lesson?.summary||lesson?.object||'Nội dung bài học hiển thị tại đây.'):'';
 return `${rendered}${ownText?`<section class="slide-section"><p>${esc(ownText).replace(/\n/g,'<br>')}</p></section>`:''}${fallback?`<section class="slide-section"><p>${esc(fallback).replace(/\n/g,'<br>')}</p></section>`:''}${slideExtraSections(slide,lesson)}`
}
function slideSetForLesson(lesson){return arr(lesson?.slides).length?lesson.slides:[lesson||{}]}
function clampSlideIndex(lesson){const slides=slideSetForLesson(lesson); const max=Math.max(0,slides.length-1); state.slide=Math.min(Math.max(0,Number(state.slide)||0),max); return {slides,idx:state.slide,max}}
function currentLesson(){return activeLessonContext().lesson||{};}
function inPracticeMode(){return state.view==='learning'&&state.learnTab==='practice'}
function currentDialogueList(){return inPracticeMode()?getPracticeDialogues():getDialogues()}
function currentDialogueId(){return inPracticeMode()?state.practiceDialogueId:state.dialogueId}
function setCurrentDialogueId(id){if(inPracticeMode()){state.practiceDialogueId=id; state.practiceLineIndex=0;} else {state.dialogueId=id; state.dialogueLineIndex=0;}}
function activeLineIndex(){return inPracticeMode()?Number(state.practiceLineIndex)||0:Number(state.dialogueLineIndex)||0}
function setActiveLineIndex(i){if(inPracticeMode())state.practiceLineIndex=Math.max(0,Number(i)||0); else state.dialogueLineIndex=Math.max(0,Number(i)||0)}
function activeRole(){return inPracticeMode()?(state.practiceRole||'all'):(state.dialogueRole||'all')}
function setActiveRole(role){if(inPracticeMode())state.practiceRole=role; else state.dialogueRole=role}
function activeHideVi(){return inPracticeMode()?!!state.practiceHideVi:!!state.dialogueHideVi}
function toggleActiveHideVi(){if(inPracticeMode())state.practiceHideVi=!state.practiceHideVi; else state.dialogueHideVi=!state.dialogueHideVi}
function activeSpeechResults(){const k=inPracticeMode()?'practiceSpeechResults':'dialogueSpeechResults'; state[k]=state[k]||{}; return state[k]}
function currentDialogue(){const list=currentDialogueList(); return list.find(x=>(x.id||x.title)===currentDialogueId())||list[0]||{};}
function dialogueTurns(d){return arr(A.dialogueTurns?.(d)||d?.utterances||d?.turns)}
function dialogueText(t){return str(t?.ru||t?.text||t?.text_ru||t||'')}
function dialogueVi(t){return str(t?.vi||t?.meaning||t?.meaning_vi||'')}
function dialogueSpeaker(t,i){return str(t?.speaker||((i%2)?'B':'A'))}
function dialogueRoleOf(t,i){return (i%2)?'B':'A'}
function dialogueRoleLabel(t,i){const role=dialogueRoleOf(t,i); return `${role} · ${dialogueSpeaker(t,i)}`}
function dialogueMeta(d,turns){
 const funcs=arr(d?.communicative_functions_vi).join(', ');
 const seed=arr(d?.vocabulary_seed_ru).join(' · ');
 return [
  ['Ngữ cảnh', d?.context_title_vi||d?.context_title_ru||d?.group||''],
  ['Mức', d?.difficulty||d?.difficulty_id||d?.level||''],
  ['Mục tiêu nói', d?.purpose||funcs||''],
  ['Từ khóa', seed]
 ].filter(x=>x[1]);
}
function roleInstruction(role){
 if(role==='A')return 'Bạn đóng vai A: nghe các câu B, tự nói các câu A rồi bấm nghe để đối chiếu.';
 if(role==='B')return 'Bạn đóng vai B: nghe các câu A, tự nói các câu B rồi bấm nghe để đối chiếu.';
 return 'Nghe toàn hội thoại, nhại từng câu, sau đó đổi vai A/B để phản xạ.';
}
function dialogueProgress(d){
 const turns=dialogueTurns(d); let tried=0,ok=0,total=turns.length;
 turns.forEach((_,i)=>{const r=speakingResultFor(d,i); if(r){tried++; if(r.ok)ok++;}});
 return {total,tried,ok,percent:total?Math.round(ok*100/total):0};
}
function dialogueRoundGoal(role){
 if(role==='A')return 'Vòng này: chỉ nói các câu vai A, nghe vai B như bạn học đang trả lời.';
 if(role==='B')return 'Vòng này: chỉ nói các câu vai B, nghe vai A như tình huống thật.';
 return 'Vòng này: nghe toàn bộ, nhại từng câu, sau đó chọn Vai A hoặc Vai B để luyện phản xạ.';
}

function nextRoleLineIndex(d,start=activeLineIndex(),dir=1){
 const turns=dialogueTurns(d), role=activeRole();
 if(!turns.length)return 0;
 if(role==='all')return Math.min(Math.max(0,start+dir),turns.length-1);
 for(let step=1;step<=turns.length;step++){
  const i=(start+dir*step+turns.length)%turns.length;
  if(dialogueRoleOf(turns[i],i)===role)return i;
 }
 return Math.min(Math.max(0,start),turns.length-1);
}
function dialogueRoleStats(d,role=activeRole()){
 const turns=dialogueTurns(d); let total=0,ok=0,tried=0,next=-1;
 turns.forEach((t,i)=>{if(role==='all'||dialogueRoleOf(t,i)===role){total++; const r=speakingResultFor(d,i); if(r)tried++; if(r?.ok)ok++; if(next<0&&!r?.ok)next=i;}});
 return {total,ok,tried,next,percent:total?Math.round(ok*100/total):0};
}
function dialogueCoachChecklist(d,role=state.dialogueRole||'all'){
 const st=dialogueRoleStats(d,role), label=role==='all'?'toàn bộ câu':`vai ${role}`;
 const items=[
  [`Chọn vai`, role==='all'?'Đang nghe/nhại toàn đoạn':'Đang luyện '+label],
  [`Câu đạt`, `${st.ok}/${st.total} câu của ${label}`],
  [`Mục tiêu`, 'Mỗi câu ≥70%, sau đó đổi vai'],
  [`Phím tắt`, 'R ghi âm · L nghe mẫu · N câu của tôi · V ẩn/hiện nghĩa']
 ];
 return `<div class="coach-checklist">${items.map(([k,v])=>`<article><b>${esc(k)}</b><span>${esc(v)}</span></article>`).join('')}</div>`;
}
function speakDialogue(d){return dialogueTurns(d).map((t,i)=>dialogueText(t)).filter(Boolean).join('. ')}
function dialogueLineKey(d,i){return `${str(d?.id||d?.title||'dialogue')}__${Number(i)||0}`}
function normalizeRuSpeech(v){return str(v).toLowerCase().replace(/ё/g,'е').replace(/[.,!?;:()"«»„“”\-–—]/g,' ').replace(/\s+/g,' ').trim()}
function editDistance(a,b){a=normalizeRuSpeech(a);b=normalizeRuSpeech(b); const m=a.length,n=b.length; if(!m&&!n)return 0; const dp=Array.from({length:m+1},(_,i)=>[i]); for(let j=1;j<=n;j++)dp[0][j]=j; for(let i=1;i<=m;i++){for(let j=1;j<=n;j++){dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));}} return dp[m][n]}
function speechSimilarity(said,target){const a=normalizeRuSpeech(said), b=normalizeRuSpeech(target); if(!a||!b)return 0; const charScore=1-(editDistance(a,b)/Math.max(a.length,b.length,1)); const at=new Set(a.split(' ').filter(Boolean)), bt=b.split(' ').filter(Boolean); const hit=bt.filter(x=>at.has(x)).length; const tokenScore=bt.length?hit/bt.length:0; return Math.max(0,Math.min(1,charScore*.55+tokenScore*.45));}
function speakingResultFor(d,i){return activeSpeechResults()?.[dialogueLineKey(d,i)]||null}
function speechSupport(){return !!(window.SpeechRecognition||window.webkitSpeechRecognition)}
function speechFeedback(score){if(score>=86)return 'Rất tốt: nhịp và từ khóa đã khá sát mẫu.'; if(score>=70)return 'Ổn: nói lại một lượt chậm hơn để chắc trọng âm.'; if(score>=45)return 'Chưa vững: nghe chậm, tách từng cụm rồi nhại lại.'; return 'Cần luyện lại: nghe mẫu 2 lần, nói từng nửa câu trước.'}
function lineTokenHints(text){return normalizeRuSpeech(text).split(' ').filter(Boolean).slice(0,7)}
function startLineRecording(){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 const d=currentDialogue(), turns=dialogueTurns(d), idx=Math.min(activeLineIndex(),Math.max(0,turns.length-1));
 const target=dialogueText(turns[idx]||{}); if(!target){toast('Chưa có câu để luyện');return}
 if(!SR){toast('Trình duyệt chưa hỗ trợ nhận diện giọng nói. Hãy dùng Chrome/Edge trên Live Server.');return}
 try{if(speechRecognizer)speechRecognizer.stop()}catch(_){ }
 const rec=new SR(); speechRecognizer=rec; rec.lang='ru-RU'; rec.interimResults=false; rec.maxAlternatives=1; rec.continuous=false;
 state.speechRecording=true; save(); render(); toast('Đang nghe tiếng Nga của bạn...');
 rec.onresult=ev=>{const transcript=ev.results?.[0]?.[0]?.transcript||''; const score=Math.round(speechSimilarity(transcript,target)*100); const store=activeSpeechResults(); store[dialogueLineKey(d,idx)]={score,transcript,target,at:Date.now(),ok:score>=70}; state.speechRecording=false; save(); render(); toast(score>=70?'Đạt câu này, có thể qua câu tiếp':'Chưa đạt, luyện lại câu này'); if(score>=70&&state.speechAutoNext)setTimeout(()=>moveDialogueLine(1),520)};
 rec.onerror=()=>{state.speechRecording=false; save(); render(); toast('Không nghe rõ. Kiểm tra micro rồi thử lại')};
 rec.onend=()=>{if(state.speechRecording){state.speechRecording=false; save(); render();}}
 try{rec.start()}catch(_){state.speechRecording=false; save(); render(); toast('Micro chưa sẵn sàng')}
}

function isVietnamVocab(v){return (stageOf(v)||state.stage)==='vn'||/Việt Nam/i.test(str(v?.stage_title_vi||''))}
function tagViLabel(tags){
 const map={greeting:'chào hỏi',time:'thời gian',academic:'học tập',dorm:'ký túc xá',office:'giấy tờ',transport:'di chuyển',food:'ăn uống',canteen:'nhà ăn',health:'sức khỏe',technology:'công nghệ',research:'nghiên cứu',shopping:'mua sắm'};
 for(const t of arr(tags)){const k=lower(t); if(map[k])return map[k];}
 return arr(tags)[0]||'giao tiếp';
}
function makeVietnamVocabDisplay(v,base){
 const eng=str(base.english||base.meaningVi||v?.vi||v?.clue_en||'').trim();
 const tag=tagViLabel(base.tags);
 const term=str(base.term||'từ này');
 const meaning=eng?`${eng}`:`Cụm/từ thuộc nhóm ${tag}.`;
 const meaningNote=base.tags.includes('greeting')?'Ý nghĩa giao tiếp: mở kênh đối thoại, thể hiện thái độ lịch sự và bắt đầu cuộc nói chuyện đúng nghi thức.'
  :base.tags.includes('time')?'Ý nghĩa: chỉ mốc thời gian hoặc nhịp sinh hoạt để người nghe hiểu khi nào việc học, gặp gỡ hoặc di chuyển diễn ra.'
  :base.tags.includes('academic')?'Ý nghĩa học thuật: gắn với hoạt động trong lớp, hỏi bài, nghe giảng, ghi chú hoặc trao đổi với giáo viên/bạn học.'
  :base.tags.includes('dorm')?'Ý nghĩa sinh hoạt: mô tả nhu cầu ở ký túc xá như phòng, tầng, chìa khóa, bếp, đồ dùng hoặc quy tắc chung.'
  :base.tags.includes('office')?'Ý nghĩa hành chính: dùng để xác định giấy tờ, thủ tục, đăng ký, visa hoặc thông tin cần xác nhận.'
  :base.tags.includes('transport')?'Ý nghĩa định hướng: giúp hỏi đường, xác định điểm đến, phương tiện hoặc vị trí khi di chuyển.'
  :base.tags.includes('food')||base.tags.includes('canteen')?'Ý nghĩa giao dịch: dùng khi chọn món, hỏi giá, thanh toán hoặc diễn đạt nhu cầu ăn uống.'
  :base.tags.includes('health')?'Ý nghĩa chăm sóc sức khỏe: diễn đạt triệu chứng, nhu cầu thuốc, bác sĩ hoặc trợ giúp y tế.'
  :base.tags.includes('technology')?'Ý nghĩa chuyên môn: liên quan máy tính, dữ liệu, lập trình, thiết bị hoặc môi trường học kỹ thuật.'
  :base.tags.includes('research')?'Ý nghĩa nghiên cứu: dùng trong báo cáo, seminar, thí nghiệm, НИР, ВКР hoặc trao đổi học thuật.'
  :`Ý nghĩa: giúp nhận diện ý chính trong tình huống ${tag}, sau đó biến từ/cụm thành một câu nói có mục đích.`;
 const app=base.tags.includes('greeting')?'Ứng dụng: dùng khi vào lớp, gặp giáo viên, nói với bạn ở ký túc xá, phòng giáo vụ hoặc mở đầu tin nhắn.'
  :base.tags.includes('time')?'Ứng dụng: dùng khi hỏi lịch học, hẹn gặp, nói giờ mở cửa, thời hạn nộp bài hoặc kế hoạch trong ngày.'
  :base.tags.includes('academic')?'Ứng dụng: dùng trong lớp dự bị, giờ seminar, khi hỏi bài, xin nhắc lại, trao đổi bài tập hoặc ghi chú bài giảng.'
  :base.tags.includes('dorm')?'Ứng dụng: dùng ở ký túc xá, quầy bảo vệ, phòng ở, bếp chung, khu giặt đồ hoặc khi nói với bạn cùng phòng.'
  :base.tags.includes('office')?'Ứng dụng: dùng tại phòng giáo vụ, nơi đăng ký cư trú, quầy tiếp nhận hồ sơ, khi làm visa/thẻ sinh viên.'
  :base.tags.includes('transport')?'Ứng dụng: dùng ở metro, bến xe, taxi, ngoài đường hoặc khi tìm đường tới trường/ký túc xá.'
  :base.tags.includes('food')||base.tags.includes('canteen')?'Ứng dụng: dùng ở столовая, quán cà phê, siêu thị, cửa hàng tiện lợi hoặc khi gọi món.'
  :base.tags.includes('health')?'Ứng dụng: dùng ở hiệu thuốc, phòng y tế, bệnh viện, khi báo triệu chứng hoặc xin hỗ trợ.'
  :base.tags.includes('technology')?'Ứng dụng: dùng trong phòng máy, bài tập lập trình, nhóm dự án, trao đổi dữ liệu hoặc cấu hình thiết bị.'
  :base.tags.includes('research')?'Ứng dụng: dùng trong phòng lab, seminar, báo cáo НИР/ВКР, viết email học thuật hoặc thảo luận đề tài.'
  :`Ứng dụng: dùng trong môi trường ${tag}, ưu tiên nghe mẫu rồi nói lại trong một câu thực tế với ${term}.`;
 const visual=base.visualLabel&&/[А-Яа-яЁё]/.test(base.visualLabel)?tag:base.visualLabel||tag;
 return {displayMeaning:meaning,displayMeaningNote:meaningNote,displayWhenUse:meaningNote,displayApplication:app,displayVisualLabel:visual};
}
function vocabInfo(v){
 const term=A.vocabTerm?.(v)||v?.ru||v?.phrase_ru||v?.front||v?.word||'';
 const pron=A.vocabPron?.(v)||v?.pronunciation||v?.pron||v?.transcription||'';
 const meaningRu=v?.meaning_ru||v?.meaning||A.vocabMeaning?.(v)||v?.definition||'';
 const meaningVi=v?.meaning_vi||v?.vi_vi||'';
 const english=v?.clue_en||v?.en||(/^[A-Za-z ,;:'"()\-\/]+$/.test(str(v?.vi||''))?v.vi:'');
 const example=A.vocabExample?.(v)||v?.example||v?.voice_text||term;
 const whenUse=v?.usage_note||v?.when_use||meaningRu||v?.illustration_label_ru||'';
 const application=[v?.stage_title_vi||stageTitle(stageOf(v)||state.stage), v?.illustration_label_ru, arr(v?.tags).join(' · ')].filter(Boolean).join(' · ');
 const tags=arr(v?.tags);
 const base={term,pron,meaningRu,meaningVi,english,example,whenUse,application,tags,emoji:v?.image_emoji||v?.emoji||'',image:v?.image||v?.image_url||v?.picture||'',visualLabel:v?.illustration_label_ru||v?.visual_label||v?.semantic_label||''};
 const display=isVietnamVocab(v)?makeVietnamVocabDisplay(v,base):{displayMeaning:meaningVi||english||meaningRu,displayWhenUse:whenUse,displayApplication:application,displayVisualLabel:base.visualLabel};
 return {...base,...display,...inferVocabVisual({...base,...display,visualLabel:display.displayVisualLabel||base.visualLabel})};
}
function inferVocabVisual(info){
 const hay=lower([info.term,info.meaningRu,info.meaningVi,info.english,info.application,arr(info.tags).join(' ')].join(' '));
 const rules=[
  [/привет|здрав|доброе|hello|greeting|поздор/i,['👋','🙂'],'приветствие'],[/утро|вечер|день|ноч|time|время/i,['🌅','⏰'],'thời điểm'],[/спасибо|благодар|thank/i,['🙏','✨'],'cảm ơn'],[/извин|простите|sorry/i,['🙇','💬'],'xin lỗi'],[/да|нет|можно|нельзя|confirm|agree/i,['✅','🚫'],'xác nhận'],[/вопрос|спрос|как|что|где|когда|почему|question/i,['❓','💬'],'câu hỏi'],
  [/университет|бауман|студент|преподав|лекц|семинар|academic|study|class/i,['🎓','🏛️'],'học thuật'],[/книга|тетрад|ручка|доска|писать|читать|урок/i,['📚','✍️'],'đồ học tập'],[/общежит|комнат|ключ|этаж|кровать|душ|кухн|dorm/i,['🏢','🛏️'],'ký túc xá'],[/паспорт|виза|документ|анкета|регистрац|office/i,['📄','🛂'],'giấy tờ'],[/метро|автобус|такси|дорог|улиц|останов|transport|route/i,['🚇','🗺️'],'di chuyển'],[/магазин|купить|стоить|цена|деньги|рубл|shop|price/i,['🛒','₽'],'mua sắm'],[/еда|чай|кофе|хлеб|суп|столов|кафе|food|canteen/i,['🍽️','☕'],'ăn uống'],[/врач|аптек|болит|температур|здоров|doctor|health/i,['🏥','💊'],'sức khỏe'],[/телефон|интернет|почта|сообщ|звон|email|call/i,['📱','✉️'],'liên lạc'],[/компьютер|данн|код|программ|алгоритм|ai|machine|data/i,['💻','🤖'],'công nghệ'],[/работ|лаборатор|нир|вкр|отчет|проект|research/i,['🔬','📊'],'nghiên cứu'],[/число|один|два|три|сколько|номер|math/i,['🔢','➗'],'số lượng']
 ];
 for(const [re,icons,label] of rules){if(re.test(hay))return {emoji:info.emoji||icons[0],symbols:uniq([info.emoji,...icons].filter(Boolean)),visualLabel:info.visualLabel||label};}
 return {emoji:info.emoji||'🧠',symbols:uniq([info.emoji||'🧠','💭'].filter(Boolean)),visualLabel:info.visualLabel||'gợi nhớ trực quan'};
}

function clip(v,n=150){v=str(v); return v.length>n?v.slice(0,n-1)+'…':v}
function tokenSetForMatch(x){return new Set(lower(textOf(x)).split(/[^a-zа-яё0-9À-ỹ]+/i).filter(w=>w.length>=4))}
function relatedConceptsForLesson(lesson,concepts){
 const lt=tokenSetForMatch({title:lesson?.title,ruTitle:lesson?.ruTitle,summary:lesson?.summary,object:lesson?.object,tags:lesson?.tags});
 const sameStage=arr(concepts).filter(c=>!stageOf(c)||!stageOf(lesson)||stageOf(c)===stageOf(lesson));
 const scored=sameStage.map(c=>{const ct=tokenSetForMatch(c); let score=0; lt.forEach(w=>{if(ct.has(w))score++}); return {c,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.c);
 return scored.length?scored:sameStage.slice(0,2);
}
function renderRelatedConcepts(concepts,limit=3){return arr(concepts).slice(0,limit).map(c=>`<div class="note related-note"><b>${esc(A.conceptTitle?.(c)||c.title||'Ngữ pháp liên quan')}</b><br>${esc(A.conceptBody?.(c)||c.rule||c.focus||'')}</div>`).join('')}

function vocabMeaningNoteText(info){
 const raw=str(info.displayMeaningNote||'').trim();
 if(raw)return raw;
 const hay=lower([info.term,info.meaningRu,info.meaningVi,info.english,info.visualLabel,arr(info.tags).join(' ')].join(' '));
 if(/привет|здрав|доброе|hello|greeting|chào/.test(hay))return 'Ý nghĩa giao tiếp: dùng để mở đầu tương tác, tạo thái độ lịch sự và báo hiệu rằng bạn sẵn sàng nói chuyện.';
 if(/спасибо|thank|cảm ơn|благодар/.test(hay))return 'Ý nghĩa giao tiếp: thể hiện sự biết ơn, giữ phép lịch sự và làm cuộc trao đổi mềm hơn.';
 if(/извин|простите|sorry|xin lỗi/.test(hay))return 'Ý nghĩa giao tiếp: nhận lỗi nhẹ, xin phép chen vào hoặc làm dịu tình huống trước khi nói tiếp.';
 if(/где|куда|дорог|метро|автобус|transport|đường/.test(hay))return 'Ý nghĩa: xác định vị trí, hướng đi hoặc phương tiện để người nghe hiểu bạn cần chỉ dẫn.';
 if(/сколько|цена|стоить|магазин|рубл|price|mua/.test(hay))return 'Ý nghĩa: hỏi hoặc xác nhận giá trị, số lượng, chi phí trong một giao dịch đơn giản.';
 if(/университет|бауман|студент|преподав|урок|class|academic/.test(hay))return 'Ý nghĩa học tập: liên quan lớp học, bài giảng, giáo viên, sinh viên hoặc thao tác học thuật.';
 if(/общежит|dorm|ký túc|комнат/.test(hay))return 'Ý nghĩa sinh hoạt: mô tả nhu cầu, đồ vật, vị trí hoặc quy tắc trong không gian ký túc xá.';
 if(/паспорт|виза|документ|регистрац/.test(hay))return 'Ý nghĩa hành chính: dùng để nói về giấy tờ, thủ tục, xác nhận danh tính hoặc đăng ký.';
 if(/еда|чай|кофе|столов|кафе|food/.test(hay))return 'Ý nghĩa giao dịch/sinh hoạt: diễn đạt nhu cầu ăn uống, gọi món, chọn đồ hoặc hỏi thông tin món.';
 return 'Ý nghĩa: giải thích vai trò của từ/cụm trong câu, tức nó giúp truyền đạt ý định gì cho người nghe.';
}
function vocabApplicationText(info){
 const raw=str(info.displayApplication||'').trim();
 if(raw && !/^Giai đoạn/i.test(raw))return raw;
 const hay=lower([info.term,info.meaningRu,info.meaningVi,info.english,info.visualLabel,info.application,arr(info.tags).join(' ')].join(' '));
 if(/общежит|dorm|ký túc|комнат/.test(hay))return 'Ứng dụng: dùng trong ký túc xá, phòng ở, bếp chung, quầy bảo vệ hoặc khi nói với bạn cùng phòng.';
 if(/университет|бауман|студент|преподав|лекц|class|academic/.test(hay))return 'Ứng dụng: dùng trong lớp dự bị, seminar, phòng học, email học thuật hoặc khi trao đổi với giáo viên/bạn học.';
 if(/паспорт|виза|документ|регистрац|office/.test(hay))return 'Ứng dụng: dùng tại phòng giáo vụ, nơi đăng ký cư trú, quầy hồ sơ, thủ tục visa hoặc xác nhận thông tin.';
 if(/магазин|купить|цена|рубл|shop|price/.test(hay))return 'Ứng dụng: dùng ở siêu thị, cửa hàng, quầy thanh toán, khi hỏi giá hoặc cần hỗ trợ mua đồ.';
 if(/метро|автобус|такси|дорог|улиц|transport/.test(hay))return 'Ứng dụng: dùng ở metro, bến xe, taxi, ngoài đường hoặc khi tìm đường tới trường/ký túc xá.';
 if(/еда|чай|кофе|столов|кафе|food|canteen/.test(hay))return 'Ứng dụng: dùng ở столовая, quán cà phê, cửa hàng tiện lợi hoặc khi gọi món và thanh toán.';
 if(/врач|аптек|болит|температур|здоров|doctor|health/.test(hay))return 'Ứng dụng: dùng ở hiệu thuốc, phòng y tế, bệnh viện hoặc khi mô tả triệu chứng để xin hỗ trợ.';
 if(/компьютер|данн|код|программ|алгоритм|ai|machine|data/.test(hay))return 'Ứng dụng: dùng trong phòng máy, giờ lập trình, dự án AI/dữ liệu hoặc khi trao đổi bài kỹ thuật.';
 if(/работ|лаборатор|нир|вкр|отчет|проект|research/.test(hay))return 'Ứng dụng: dùng trong phòng lab, seminar, báo cáo НИР/ВКР hoặc khi thảo luận đề tài nghiên cứu.';
 return 'Ứng dụng: dùng trong hội thoại thực tế; nghe mẫu, nhắc lại đúng ngữ cảnh rồi đặt vào một câu ngắn.';
}
function vocabDialogueExampleLines(info){
 const term=str(info.term||'').trim()||'это слово';
 const hay=lower([info.term,info.meaningRu,info.meaningVi,info.english,info.visualLabel,arr(info.tags).join(' ')].join(' '));
 if(/привет|здрав|доброе|hello|greeting|chào/.test(hay))return [`A: ${term}!`,`B: Здравствуйте. Как дела?`,`A: Хорошо, спасибо. А у вас?`];
 if(/спасибо|thank|cảm ơn|благодар/.test(hay))return [`A: ${term}!`,`B: Пожалуйста. Рад помочь.`,`A: До свидания, спасибо ещё раз.`];
 if(/извин|простите|sorry|xin lỗi/.test(hay))return [`A: ${term}, пожалуйста.`,`B: Ничего страшного.`,`A: Спасибо, я повторю правильно.`];
 if(/повтор|repeat|nhắc lại/.test(hay))return [`A: ${term}, пожалуйста.`,`B: Конечно, я повторю медленно.`,`A: Спасибо, теперь понятно.`];
 if(/где|куда|дорог|метро|автобус|transport|đường/.test(hay))return [`A: Скажите, пожалуйста, ${term}?`,`B: Идите прямо, потом направо.`,`A: Спасибо, я понял.`];
 if(/сколько|цена|стоить|магазин|рубл|price|mua/.test(hay))return [`A: Скажите, пожалуйста, ${term}?`,`B: Это стоит сто рублей.`,`A: Хорошо, беру. Спасибо.`];
 if(/университет|бауман|студент|преподав|урок|class|academic/.test(hay))return [`A: На занятии я использую: ${term}.`,`B: Хорошо, повторите ещё раз.`,`A: ${term}. Теперь понятно.`];
 return [`A: Скажите, пожалуйста: ${term}.`,`B: Да, понятно. Повторите в предложении.`,`A: Хорошо: ${term}. Спасибо.`];
}
function vocabDialogueExampleHtml(info){
 const lines=vocabDialogueExampleLines(info);
 return `<section class="v1313-vocab-dialogue-example" aria-label="Ví dụ hội thoại thực tế"><div><span class="chip">Ví dụ</span><h4>Hội thoại thực tế có dùng từ/cụm này</h4></div><div class="dialogue-example-lines">${lines.map(line=>{const parts=str(line).split(':'); const role=parts.length>1?parts.shift():'A'; const text=parts.join(':').trim()||line; return `<p><b>${esc(role.trim())}</b><span>${esc(text)}</span></p>`}).join('')}</div></section>`;
}

function vocabVisualHtml(info,back=false){
 const tags=arr(info.tags).slice(0,4);
 const symbols=uniq([...(arr(info.symbols)), info.emoji, tags.includes('greeting')?'👋':'', tags.includes('academic')?'🎓':''].filter(Boolean)).slice(0,5);
 const img=info.image?`<img src="${esc(info.image)}" alt="${esc(info.visualLabel||info.term)}">`:symbols.map(x=>`<span>${esc(x)}</span>`).join('');
 const tagHtml=tags.length?`<div class="visual-tags">${tags.map(t=>`<em>${esc(t)}</em>`).join('')}</div>`:'';
 return `<div class="visual-meaning ${back?'back':''}"><div class="visual-symbols">${img||'<span>🧠</span>'}</div><b>${esc(info.displayVisualLabel||info.visualLabel||info.term||'hình dung')}</b>${back?`<small>${esc(info.displayWhenUse||info.whenUse||info.displayMeaning||info.meaningRu||info.meaningVi||'')}</small>${tagHtml}`:''}</div>`
}


function renderPresentation(){
 const concepts=getConcepts(), lesson=currentLesson();
 const {slides,idx}=clampSlideIndex(lesson);
 const slide=slides[idx]||{};
 const titleText=slide.title||lesson?.title||'Bài học';
 return `<div class="presentation-modal fixed-presentation step3-presentation v1271-presentation">
   <aside class="present-sidebar"><div><span class="chip">TRÌNH CHIẾU</span><h3>${esc(A.lessonTitle?.(lesson)||lesson?.title||'Bài học')}</h3><p>${esc(stageTitle(stageOf(lesson)||state.stage))}</p></div><div class="present-slide-list v1271-present-slide-list">${slides.map((sl,i)=>`<button class="slide-nav v1271-present-slide-pill ${i===idx?'active':''}" data-slide="${i}" title="${esc(sl.title||lesson?.title||'Slide')}"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(sl.title||lesson?.title||'Slide')}</b></button>`).join('')}</div></aside>
   <main class="present-main"><header class="present-top v1271-present-top"><div><span class="chip">${idx+1}/${slides.length}</span><h2>${esc(titleText)}</h2><p class="kbd-guide">←/→ qua slide · ↑/↓ cuộn · PgUp/PgDn cuộn xa · Space tiếp · Esc đóng</p></div><div class="lesson-tools"><button class="btn" data-act="pres-scroll-top">Đầu nội dung</button><button class="btn" data-act="pres-prev">← Slide trước</button><button class="btn primary" data-act="pres-next">Slide tiếp →</button><button class="btn" data-act="pres-scroll-bottom">Cuối nội dung</button></div></header><section class="present-slide v1271-present-slide" tabindex="0" aria-label="Vùng nội dung slide có thể cuộn"><article class="present-slide-page v1271-present-page"><h2>${esc(titleText)}</h2>${slideBody(slide,lesson)}<div class="slide-bottom-safe">Đã đọc hết nội dung slide · dùng ←/→ để chuyển slide</div></article></section><footer class="present-footer"><button class="btn" data-act="pres-scroll-up">↑ Cuộn lên</button><span class="chip">Nội dung cuộn độc lập</span><button class="btn" data-act="pres-scroll-down">↓ Cuộn xuống</button></footer></main>
 </div>`
}
/* V12.64: duplicate legacy renderTheory/renderExercises/renderPractice removed and Canva Fit containment applied. */

function questionId(q,i,prefix='q'){return str(q?.id||`${prefix}_${i+1}`)}
function routeShortLabelFromQuestion(q,raw=''){
 const fromLesson=str(q?.lessonId||q?.routeId||'').trim();
 const src=fromLesson||str(raw).trim();
 const m=src.match(/R\s*0*(\d+)/i);
 return m?`R${Number(m[1])}`:'';
}
function stripQuestionPrefix(raw){
 let s=str(raw).trim();
 s=s.replace(/^R\s*0*\d+\s*[·\.\-–—]\s*[^:]{0,90}:\s*/i,'');
 s=s.replace(/^R\s*0*\d+\s*:\s*/i,'');
 return s.trim();
}
function questionTitle(q,i){
 const raw=A.testQuestion?.(q)||q?.question||q?.prompt||('Câu '+(i+1));
 const route=routeShortLabelFromQuestion(q,raw);
 const body=stripQuestionPrefix(raw)||raw;
 return route?`${route}: ${body}`:body;
}
function questionChoices(q){return arr(A.testChoices?.(q)||q?.options||q?.choices)}
function answerIndex(q){const x=A.testAnswerIndex?.(q); return Number.isFinite(Number(x))?Number(x):Number(q?.answerIndex??q?.answer??-1)}
function levelOptions(selected,inputName){return ['easy','medium','hard','expert'].map(x=>`<option value="${x}" ${selected===x?'selected':''}>${esc(examLevelLabel(x))}</option>`).join('')}
function reviewStatus(q,i){return reviewQuestionState(q,i).status}

function examQuestionAnswer(q,i,level=activeExamLevel()){return state.examProgress.answers?.[examQuestionId(q,i,level)]}

function examIsCorrect(q,i,level=activeExamLevel()){const a=examQuestionAnswer(q,i,level); return Number(a)===Number(answerIndex(q))}

function examStatus(q,i,level=activeExamLevel()){
 const id=examQuestionId(q,i,level); const has=state.examProgress.answers?.[id]!=null; const paper=examPaperResult(level); const submitted=!!paper || !!(state.examProgress.submitted&&state.examProgress.result?.level===level);
 if(submitted)return has&&examIsCorrect(q,i,level)?'correct':'wrong';
 if(state.examProgress.marked?.[id])return 'marked';
 if(has)return 'answered';
 return 'new'
}

function reviewMiniList(qs){const per=reviewPageSize(qs); const start=Math.floor((Number(state.reviewPage)||0)*per); return `<div class="mini-flag-grid review-mini-flags">${qs.slice(start,start+per).map((q,j)=>{const i=start+j, st=reviewStatus(q,i); return `<button class="mini-qflag ${st} ${i===state.reviewIndex?'active':''}" title="Câu ${i+1}" aria-label="Câu ${i+1}" data-review-index="${i}">${i+1}</button>`}).join('')}</div>`}

function examMiniLabel(st){return st==='correct'?'đúng':st==='wrong'?'sai/chưa trả lời':st==='answered'?'đã trả lời':st==='marked'?'xem lại':'chưa trả lời'}
function examMiniList(qs){const per=examPageSize(activeExamLevel()); const start=Math.floor((Number(state.examPage)||0)*per); return `<div class="mini-flag-grid exam-mini-flags">${qs.slice(start,start+per).map((q,j)=>{const i=start+j, st=examStatus(q,i); return `<button class="mini-qflag ${st} ${i===state.examIndex?'active':''}" title="Câu ${i+1}" aria-label="Câu ${i+1}" data-exam-index="${i}">${i+1}</button>`}).join('')}</div>`}

function pageTabs(total,per,current,kind){const pages=Math.max(1,Math.ceil(total/per)); if(pages<=1)return ''; return `<div class="question-page-tabs clean-range-tabs">${Array.from({length:pages},(_,p)=>{const a=p*per+1,b=Math.min(total,(p+1)*per); return `<button class="range-tab ${p===current?'active':''}" data-${kind}-page="${p}">${a}-${b}</button>`}).join('')}</div>`}

function flagGridGhosts(count){return ''}
function reviewFlagGrid(qs){const page=Number(state.reviewPage)||0, per=reviewPageSize(qs), start=page*per; const slice=qs.slice(start,start+per); const items=slice.map((q,j)=>{const i=start+j, st=reviewStatus(q,i); return `<button class="qflag ${st} ${i===state.reviewIndex?'active':''}" title="Câu ${i+1}" aria-label="Câu ${i+1}" data-review-index="${i}">${i+1}</button>`}).join(''); return `<div class="question-flag-grid review-grid clean-flag-grid ${reviewFlagGridClass(qs)}">${items}</div>`}

function examFlagIcon(st){return st==='correct'?'✓':st==='wrong'?'×':st==='answered'?'✓':st==='marked'?'⚑':'○'}
function examFlagGrid(qs,level=activeExamLevel()){
 const page=Number(state.examPage)||0, per=examPageSize(level), start=page*per;
 const slice=qs.slice(start,start+per);
 const items=slice.map((q,j)=>{const i=start+j, st=examStatus(q,i,level); return `<button class="qflag ${st} ${i===state.examIndex?'active':''}" title="Câu ${i+1}" aria-label="Câu ${i+1}" data-exam-index="${i}">${i+1}</button>`}).join('');
 return `<div class="question-flag-grid exam-grid official-exam-grid clean-flag-grid ${examFlagGridClass(level)}">${items}</div>`
}
function renderReviewFlagTray(qs,counts){
 const page=Number(state.reviewPage)||0, per=reviewPageSize(qs);
 const start=qs.length?page*per+1:0, end=Math.min(qs.length,(page+1)*per);
 return `<section class="assessment-flag-tray review-flag-tray v1299-flag-tray">
   <div class="flag-tray-head"><div><span class="chip">🧭 Danh sách câu</span><b>${start}-${end}/${qs.length||0}</b><small>${counts.done} đã làm · ${counts.flagged} cắm cờ · ${counts.wrong} câu sai</small></div><div class="flag-legend compact-legend"><span class="legend-new">Mới</span><span class="legend-flagged">Cắm cờ</span><span class="legend-done">Đã làm</span><span class="legend-wrong">Sai</span></div></div>
   ${pageTabs(qs.length,per,page,'review')}
   <div class="flag-tray-scroll">${reviewFlagGrid(qs)}</div>
 </section>`
}
function renderExamFlagTray(qs,level){
 const page=Number(state.examPage)||0, per=examPageSize(level);
 const start=qs.length?page*per+1:0, end=Math.min(qs.length,(page+1)*per);
 const sum=examProgressSummary(qs,level);
 return `<section class="assessment-flag-tray exam-flag-tray v1299-flag-tray">
   <div class="flag-tray-head"><div><span class="chip">🧭 Danh sách câu</span><b>${start}-${end}/${qs.length||0}</b><small>${sum.answered}/${sum.total} đã trả lời · ${sum.correct} đúng tạm tính · mục tiêu 8.0/10</small></div><div class="flag-legend compact-legend"><span class="legend-new">Mới</span><span class="legend-flagged">Cắm cờ</span><span class="legend-done">Đã trả lời</span><span class="legend-wrong">Sai sau nộp</span></div></div>
   ${pageTabs(qs.length,per,page,'exam')}
   <div class="flag-tray-scroll">${examFlagGrid(qs,level)}</div>
 </section>`
}

function renderReviewFlagRail(qs,counts){
 const page=Number(state.reviewPage)||0, per=reviewPageSize(qs);
 const start=qs.length?page*per+1:0, end=Math.min(qs.length,(page+1)*per);
 return `<aside class="flag-rail compact-flag-rail v1219-flag-rail v1300-flag-left review-flag-rail-left" aria-label="Danh sách câu ôn tập">
   <div class="flag-rail-head compact-rail-head"><div><span>Danh sách câu</span><b>${start}-${end}</b><small>/${qs.length||0}</small></div></div>
   <small>${counts.done} đã làm · ${counts.flagged} cắm cờ · ${counts.wrong} câu sai</small>
   ${pageTabs(qs.length,per,page,'review')}
   ${reviewFlagGrid(qs)}
   <div class="flag-legend minimal-legend"><span class="legend-new">Mới</span><span class="legend-flagged">Cờ</span><span class="legend-done">Đã làm</span><span class="legend-wrong">Sai</span></div>
 </aside>`
}
function renderExamFlagRail(qs,level){
 const page=Number(state.examPage)||0, per=examPageSize(level);
 const start=qs.length?page*per+1:0, end=Math.min(qs.length,(page+1)*per);
 const sum=examProgressSummary(qs,level);
 return `<aside class="flag-rail compact-flag-rail v1219-flag-rail v1300-flag-left exam-flag-rail" aria-label="Danh sách câu kiểm tra">
   <div class="flag-rail-head compact-rail-head"><div><span>Danh sách câu</span><b>${start}-${end}</b><small>/${qs.length||0}</small></div></div>
   <small>${sum.answered}/${sum.total} đã trả lời</small>
   ${pageTabs(qs.length,per,page,'exam')}
   ${examFlagGrid(qs,level)}
   <div class="flag-legend minimal-legend"><span class="legend-new">Mới</span><span class="legend-flagged">Cờ</span><span class="legend-done">Đã làm</span><span class="legend-wrong">Sai</span></div>
 </aside>`
}

function examProgressSummary(qs=getExamQuestions(),level=activeExamLevel()){
 const total=qs.length; let answered=0,correct=0; const wrong=[];
 qs.forEach((q,i)=>{const id=examQuestionId(q,i,level); const has=state.examProgress.answers?.[id]!=null; if(has)answered++; const ok=has&&Number(state.examProgress.answers[id])===Number(answerIndex(q)); if(ok)correct++; else wrong.push({id,index:i,question:q,answer:has?state.examProgress.answers[id]:null,correct:answerIndex(q),level:q?._examPackLevel||level||q.level||q.difficulty||'easy',lessonId:q.lessonId||'',skill:q.skill||'',topic:q.topic||''});});
 const score10=total?Math.round((correct/total)*100)/10:0; const passed=score10>=8;
 return {level,label:examLevelLabel(level),total,answered,correct,wrongCount:wrong.length,wrong,score10,passed,levels:[level],cycleDays:derivedExamCycleDays()};
}

function renderPaperStatusPanel(){
 const rows=EXAM_PAPER_ORDER.map(type=>{const r=examPaperResult(type); const cfg=examPaperConfig(type); const cls=r?(r.passed?'passed':'failed'):'pending'; const label=r?`${Number(r.score10||0).toFixed(1)}/10`:'Chưa nộp'; return `<article class="paper-status ${cls}"><b>${esc(cfg.label)}</b><span>${cfg.total} câu</span><i>${esc(label)}</i></article>`}).join('');
 return `<aside class="paper-status-panel v1308-paper-status"><div class="paper-status-list">${rows}</div></aside>`;
}
function renderExamResultPanel(sum){
 const level=activeExamLevel();
 const r=examPaperResult(level);
 const status=renderPaperStatusPanel();
 if(!r)return '';
 const bd=examBreakdown(getExamQuestions(level),level);
 const cycle=examCycleSummary();
 const wrongPreview=arr(r.wrong).slice(0,6).map(w=>`<li><b>Câu ${w.index+1}</b><span>${esc(clip(questionTitle(w.question,w.index),90))}</span></li>`).join('')||'<li><span>Không có câu sai.</span></li>';
 return `${renderGateProgressPanel()}${status}<aside class="exam-result-inline ${r.passed?'passed':'failed'}"><div><span class="chip">KẾT QUẢ · ${esc(examLevelLabel(level))} · ${r.passed?'ĐẠT':'CHƯA ĐẠT'}</span><h3>${Number(r.score10||0).toFixed(1)}/10</h3><p>${r.correct}/${r.total} câu đúng · ${r.wrongCount} câu sai/chưa trả lời. Trạng thái phần: ${gatePartComplete()?'đủ điều kiện mở khóa':'còn đề bắt buộc'}.</p></div><div class="exam-score-meter"><b>${Math.round((Number(r.score10)||0)*10)}%</b><span>Điều kiện mỗi đề: 80%</span></div><div class="mini-score-bars">${bd.levels.slice(0,4).map(row=>`<span><b>${esc(row.label)}</b><i>${row.score10.toFixed(1)}/10</i></span>`).join('')}</div><ul class="wrong-preview">${wrongPreview}</ul><div class="lesson-tools"><button class="btn ${r.passed?'green':'primary'}" data-act="open-exam-result">Xem popup kết quả</button>${r.passed?`<button class="btn soft" data-act="next-gate-paper">Lượt kế tiếp</button>`:`<button class="btn warn" data-act="create-remedial-review">Ôn tập lại</button>`}<button class="btn soft" data-act="reset-exam-paper">${r.passed?'Làm lại đề này':'Làm lại đề rớt'}</button></div></aside>`;
}
function renderExamResultModal(sum){
 const level=sum?.level||activeExamLevel();
 const result=sum||examPaperResult(level)||examProgressSummary(getExamQuestions(level),level);
 const cycle=examCycleSummary();
 const bd=examBreakdown(getExamQuestions(level),level);
 const wrongs=arr(result.wrong);
 const wrongList=wrongs.length?wrongs.slice(0,120).map(w=>`<article class="wrong-card"><b>Câu ${w.index+1}</b><p>${esc(questionTitle(w.question,w.index))}</p><small>Đã chọn: ${esc(examAnswerText(w.question,w.answer))}</small><small>Đúng: ${esc(examAnswerText(w.question,w.correct))}</small>${w.question?.explanation?`<em>${esc(w.question.explanation)}</em>`:''}</article>`).join(''):'<div class="note">Không có câu sai trong đề này.</div>';
 const cycleRows=cycle.rows.map(row=>{const r=row.result; const cls=r?(r.passed?'passed':'failed'):'pending'; return `<article class="paper-status ${cls}"><b>${esc(row.label)}</b><i>${r?`${Number(r.score10||0).toFixed(1)}/10 · ${r.passed?'Đạt':'Chưa đạt'}`:'Chưa nộp'}</i></article>`}).join('');
 return `<div class="exam-result-modal v1220-result-modal"><div class="result-hero ${result.passed?'passed':'failed'}"><div><span class="chip">${esc(examLevelLabel(level))} · ${result.passed?'ĐẠT':'CHƯA ĐẠT'}</span><h2>${Number(result.score10||0).toFixed(1)}/10</h2><p>${result.correct}/${result.total} câu đúng · ${result.wrongCount} câu sai/chưa trả lời. Mỗi lượt kiểm tra cần đạt từ 8.0/10.</p></div><div class="result-ring"><b>${Math.round((Number(result.score10)||0)*10)}%</b><span>điểm đề</span></div></div><section class="result-section"><h3>Trạng thái các đề trong mốc</h3><div class="paper-status-list">${cycleRows}</div></section><section class="result-section"><h3>Phổ điểm theo mức/kỹ năng</h3><div class="score-grid">${bd.levels.map(scoreBar).join('')}${bd.skills.slice(0,8).map(scoreBar).join('')}</div></section><section class="result-section"><h3>Câu sai cần xử lý</h3><div class="wrong-list">${wrongList}</div></section>${renderGateProgressPanel()}<div class="modal-actions"><button class="btn" data-act="modal-close">Đóng</button>${result.passed?`<button class="btn soft" data-act="next-gate-paper">Lượt kế tiếp</button>`:`<button class="btn primary" data-act="create-remedial-review">Ôn tập lại và tạo phụ đạo</button>`}<button class="btn soft" data-act="reset-exam-paper">Làm lại đề hiện tại</button></div></div>`;
}

function reviewMeta(q){return [['Bài', (q?.lessonId||'')+' · '+(q?.lessonTitle||q?.chapter||'')],['Kỹ năng', q?.skill||''],['Chủ điểm', q?.topic||''],['Mức', q?.levelTitle||q?.difficulty||state.reviewLevel]].filter(x=>str(x[1]).trim())}
function reviewStudyTarget(q){
 const lesson=[q?.lessonId,q?.lessonTitle||q?.chapter||q?.moduleTitle].filter(Boolean).join(' · ');
 const topic=[q?.skill,q?.topic].filter(Boolean).join(' · ');
 return lesson||topic||'chủ điểm hiện tại';
}
function reviewAttemptCount(id){return Number(state.reviewProgress.wrong?.[id]?.attempts||0)}

function reviewWrongExplanation(q,wrong){
 const choices=questionChoices(q);
 const chosen=choices[Number(wrong?.answer)]||'chưa rõ đáp án đã chọn';
 const correct=choices[Number(answerIndex(q))]||'đáp án đúng';
 const base=A.testExplanation?.(q)||q?.explanation||q?.feedback||q?.note||'';
 const topic=reviewStudyTarget(q);
 return `Bạn chọn “${chosen}”, nhưng đáp án đúng phải gắn với “${correct}”. ${base||'Lỗi thường gặp là chọn theo nghĩa rời rạc mà chưa bám vào ngữ cảnh giao tiếp, chủ điểm hoặc mẫu câu của bài.'} Nên ôn lại: ${topic}.`;
}
function reviewResultFeedback(q,id){
 const done=state.reviewProgress.done?.[id];
 const wrong=state.reviewProgress.wrong?.[id];
 if(done&&done.ok){
   const exp=A.testExplanation?.(q)||q.explanation||q?.feedback||q?.note||'Dựa vào chức năng giao tiếp, ngữ cảnh và đáp án chuẩn của câu hỏi.';
   return `<div class="review-feedback-box ok v1313-review-feedback"><b>Đúng rồi.</b><span>${esc(exp)}</span><small>Câu này được đánh dấu hoàn thành.</small></div>`;
 }
 if(wrong){
   const attempts=Number(wrong.attempts||1);
   const target=reviewStudyTarget(q);
   const why=reviewWrongExplanation(q,wrong);
   const more=attempts>2?' Câu này đã được đưa vào diện cần ôn tập lại.':'';
   return `<div class="review-feedback-box bad v1313-review-feedback"><b>Sai rồi, cần sửa đúng gốc.</b><span>${esc(why)}${esc(more)}</span><div class="review-feedback-actions"><button class="btn primary" data-act="open-review-target">Ôn lại phần liên quan</button><button class="btn soft" data-act="toggle-review-flag">Cắm cờ câu này</button></div><small>Lần sai: ${attempts}. Hãy mở phần ôn liên quan rồi quay lại làm lại câu này.</small></div>`;
 }
 return `<div class="review-feedback-box idle v1313-review-feedback"><b>Chọn đáp án rồi bấm Kiểm thử.</b><span>Nếu sai, hệ thống sẽ giải thích vì sao sai và mở đường quay lại phần cần ôn.</span></div>`;
}
function renderReview(){
 const base=getReviewBaseQuestions();
 const countBase=state.reviewLesson&&state.reviewLesson!=='all'?base.filter(q=>reviewLessonKey(q)===state.reviewLesson):base;
 const counts=reviewCounts(countBase);
 const qs=getReviewQuestions();
 if(state.reviewIndex>=qs.length)state.reviewIndex=Math.max(0,qs.length-1);
 const reviewPer=reviewPageSize(qs);
 if(state.reviewPage>Math.max(0,Math.ceil(qs.length/reviewPer)-1))state.reviewPage=Math.max(0,Math.ceil(qs.length/reviewPer)-1);
 const q=qs[state.reviewIndex]||qs[0];
 const id=questionId(q,state.reviewIndex,'review');
 const choices=questionChoices(q);
 const st=q?reviewStatus(q,state.reviewIndex):'new';
 const saved=state.reviewProgress.done?.[id];
 const selected=state.reviewAnswer!=null?state.reviewAnswer:(saved?.answer??null);
 const currentPage=Number(state.reviewPage)||0;
 const pageStart=currentPage*reviewPer+1;
 const pageEnd=Math.min(qs.length,(currentPage+1)*reviewPer);
 const wrongState=state.reviewProgress.wrong?.[id];
 const reviewWrong=!!wrongState;
 const answerHtml=choices.map((c,i)=>{const picked=selected!=null&&Number(selected)===i; const correct=Number(answerIndex(q))===i; const checked=!!saved&&!!saved.ok; const cls=[picked?'active':'', checked&&correct?'correct-choice':'', reviewWrong&&picked?'wrong-choice':''].filter(Boolean).join(' '); return `<button class="answer-card answer-list-item ${cls}" data-review-answer="${i}"><span class="answer-option-label">${String.fromCharCode(65+i)}</span><span class="answer-option-text">${esc(c)}</span></button>`}).join('');
 const flagRail=renderReviewFlagRail(qs,counts);
 const questionCard=q?`<article class="test-question review-question ${st} ${reviewWrong?'wrong':''} review-detail-card clean-question-card assessment-question-card compact-assessment-question v1219-question-scroll v1308-question-card">
   <div class="question-meta clean-question-meta simple-question-meta"><span class="chip">Câu ${state.reviewIndex+1}/${qs.length}</span></div>
   <div class="question-scroll-main v1308-question-scroll">
    <h3>${esc(questionTitle(q,state.reviewIndex))}</h3>
    <div class="answer-grid review-answer-grid compact-answer-grid v1308-answer-grid">${answerHtml}</div>
   </div>
   <div class="lesson-tools assessment-actions compact-actions v1308-actions"><button class="btn" data-act="prev-review">← Trước</button><button class="btn warn" data-act="toggle-review-flag">⚑ Cắm cờ</button><button class="btn primary" data-act="check-review">Kiểm thử</button><button class="btn" data-act="next-review">Sau →</button></div>
   ${reviewResultFeedback(q,id)}
 </article>`:'<div class="note compact-note">Không có câu phù hợp bộ lọc hiện tại.</div>';
 return `<section class="panel learn-work-card review-studio pass2-review-studio clean-review-layout v1219-assessment assessment-focus-card v1300-review-flag-left v1308-assessment-stable v1310-assessment-polish v1311-assessment-luxe v1312-assessment-atelier v1308-review">
   <div class="assessment-compact-head slim-assessment-head v1308-head">
     <div class="assessment-title-line"><span class="chip">🔁 Ôn tập</span><b>${qs.length?`Câu ${state.reviewIndex+1}/${qs.length}`:'Không có câu'}</b><small>${counts.done} đã làm · ${counts.flagged} cắm cờ · ${counts.wrong} câu sai · ${qs.length?`${pageStart}-${pageEnd}/${qs.length}`:'0 câu'}</small></div>
     <div class="assessment-filter-line compact-filter-strip">
       <select class="input compact-select" data-input="reviewLevel" aria-label="Mức câu hỏi">${levelOptions(state.reviewLevel,'reviewLevel')}</select>
       <select class="input compact-select lesson-select" data-input="reviewLesson" aria-label="Bài học">${reviewLessonOptions()}</select>
       <select class="input compact-select" data-input="reviewFilter" aria-label="Trạng thái">${reviewFilterOptions()}</select>
       <button class="btn soft review-reset-btn" data-act="reset-review">Reset</button>
     </div>
   </div>
   <div class="assessment-body review-assessment-body compact-assessment-body v1219-assessment-body v1300-assessment-two-col v1300-review-body v1308-body">
     ${flagRail}
     <main class="assessment-question-area focus-question-area v1219-question-area v1300-question-area-main v1308-question-area">${questionCard}${renderDeepSpeakingReviewPanel()}</main>
   </div>
 </section>`
}

function dialogueSetupPeopleLabel(){
 const n=Number(state.dialoguePeople||2); return n===1?'1 người · tự luyện hai vai':n===2?'2 người · vai A/B':n===3?'3 người · thêm người quan sát/sửa lỗi':'4 người · nhóm nhỏ luân phiên';
}
function dialogueSetupModeLabel(){
 const map={listen_repeat:'Nghe rồi nhại',shadow_roleplay:'Shadowing + đóng vai',roleplay_free:'Đóng vai mở rộng',exam_reaction:'Phản xạ hỏi đáp nhanh'};
 return map[state.dialogueMode]||map.shadow_roleplay;
}
function dialogueSetupScenarioLabel(){
 const map={classroom:'Lớp học',dorm:'Ký túc xá',admin:'Phòng giáo vụ',daily:'Đời sống hằng ngày',bauman:'Học thuật Bauman'};
 return map[state.dialogueScenario]||map.classroom;
}
function dialogueSetupBrief(active){
 const min=Number(state.dialogueMinutes||10)||10;
 const people=dialogueSetupPeopleLabel();
 const mode=dialogueSetupModeLabel();
 const sc=dialogueSetupScenarioLabel();
 const title=A.dialogueTitle?.(active)||active?.title||'Hội thoại hiện tại';
 return {title,min,people,mode,sc,text:`${people} · ${min} phút · ${mode} · bối cảnh ${sc}.`};
}
function dialogueSetupMicroPlan(active){
 const min=Number(state.dialogueMinutes||10)||10;
 const warm=Math.max(1,Math.round(min*.18));
 const drill=Math.max(2,Math.round(min*.32));
 const role=Math.max(2,Math.round(min*.34));
 const repair=Math.max(1,min-warm-drill-role);
 return [
  ['Khởi động',warm,'Nghe cả đoạn, đoán mục đích giao tiếp.'],
  ['Nhại câu',drill,'Đi từng câu, nghe chậm rồi nghe thường.'],
  ['Đóng vai',role,`Chạy ${dialogueSetupPeopleLabel().split('·')[0].trim()} theo vai, đổi lượt ít nhất 1 lần.`],
  ['Sửa lỗi',repair,'Nói lại câu vấp, ghi 1 lỗi âm hoặc trọng âm.']
 ];
}
function renderDialogueSetupModal(){
 const all=byStage(optionalReady('dialogue-bauman-az')?getBaumanDialogueAZ():getBasicSpeakingDialogues());
 const groups=uniq(all.map(x=>A.dialogueGroup?.(x)||x.group||'general'));
 const diffs=uniq(all.map(x=>A.dialogueDifficulty?.(x)||x.difficulty||x.level||'all'));
 const filtered=all.filter(d=>{
  const g=A.dialogueGroup?.(d)||d.group||'general'; const df=A.dialogueDifficulty?.(d)||d.difficulty||d.level||'all';
  return (state.dialogueGroup==='all'||g===state.dialogueGroup)&&(state.dialogueDifficulty==='all'||df===state.dialogueDifficulty);
 });
 const active=currentDialogue(); const plan=dialogueSetupMicroPlan(active);
 return `<div class="modal-body dialogue-setup-modal round2-dialogue-setup">
  <header class="dialogue-setup-head"><div><span class="chip">THIẾT LẬP CUỘC NÓI</span><h3>Chọn nhóm, chủ đề, mức độ, số người và thời lượng</h3><p>Nút này chỉ mở khi cần cấu hình, không chen vào luồng luyện nói chính.</p></div><div class="setup-live-badge"><b>${esc(state.dialogueMinutes||10)}'</b><span>${esc(dialogueSetupModeLabel())}</span></div></header>
  <section class="dialogue-setup-grid">
    <label>Nhóm ngữ cảnh<select class="input" id="dsGroup"><option value="all">Tất cả nhóm</option>${groups.map(g=>`<option value="${esc(g)}" ${state.dialogueGroup===g?'selected':''}>${esc(g)}</option>`).join('')}</select></label>
    <label>Mức độ<select class="input" id="dsDiff"><option value="all">Tất cả mức</option>${diffs.map(d=>`<option value="${esc(d)}" ${state.dialogueDifficulty===d?'selected':''}>${esc(d)}</option>`).join('')}</select></label>
    <label>Chủ đề/cuộc nói<select class="input" id="dsDialogue">${filtered.slice(0,180).map(d=>{const id=d.id||d.title; return `<option value="${esc(id)}" ${(active&&(active.id||active.title)===id)?'selected':''}>${esc(A.dialogueTitle?.(d)||d.title||d.context_title_vi||id)}</option>`}).join('')}</select></label>
    <label>Số người<select class="input" id="dsPeople"><option value="1" ${state.dialoguePeople==='1'?'selected':''}>1 người · tự luyện</option><option value="2" ${state.dialoguePeople==='2'?'selected':''}>2 người · A/B</option><option value="3" ${state.dialoguePeople==='3'?'selected':''}>3 người · thêm người sửa lỗi</option><option value="4" ${state.dialoguePeople==='4'?'selected':''}>4 người · nhóm nhỏ luân phiên</option></select></label>
    <label>Thời lượng<select class="input" id="dsMinutes"><option value="5" ${state.dialogueMinutes==='5'?'selected':''}>5 phút · phản xạ nhanh</option><option value="10" ${state.dialogueMinutes==='10'?'selected':''}>10 phút · tiêu chuẩn</option><option value="15" ${state.dialogueMinutes==='15'?'selected':''}>15 phút · nói sâu</option><option value="20" ${state.dialogueMinutes==='20'?'selected':''}>20 phút · đóng vai mở rộng</option></select></label>
    <label>Chế độ<select class="input" id="dsMode"><option value="listen_repeat" ${state.dialogueMode==='listen_repeat'?'selected':''}>Nghe rồi nhại</option><option value="shadow_roleplay" ${state.dialogueMode==='shadow_roleplay'?'selected':''}>Shadowing + đóng vai</option><option value="roleplay_free" ${state.dialogueMode==='roleplay_free'?'selected':''}>Đóng vai mở rộng</option><option value="exam_reaction" ${state.dialogueMode==='exam_reaction'?'selected':''}>Phản xạ hỏi đáp nhanh</option></select></label>
    <label>Bối cảnh<select class="input" id="dsScenario"><option value="classroom" ${state.dialogueScenario==='classroom'?'selected':''}>Lớp học</option><option value="dorm" ${state.dialogueScenario==='dorm'?'selected':''}>Ký túc xá</option><option value="admin" ${state.dialogueScenario==='admin'?'selected':''}>Phòng giáo vụ</option><option value="daily" ${state.dialogueScenario==='daily'?'selected':''}>Đời sống hằng ngày</option><option value="bauman" ${state.dialogueScenario==='bauman'?'selected':''}>Học thuật Bauman</option></select></label>
  </section>
  <section class="dialogue-setup-preview"><h4>Kịch bản sau khi áp dụng</h4><div>${plan.map((p,i)=>`<article><i>0${i+1}</i><b>${esc(p[0])} · ${p[1]}'</b><span>${esc(p[2])}</span></article>`).join('')}</div></section>
  <div class="modal-actions"><button class="btn" data-act="modal-close">Hủy</button><button class="btn primary" data-act="dialogue-setup-apply">Áp dụng cuộc nói</button></div>
 </div>`;
}
function applyDialogueSetup(){
 const group=$('#dsGroup')?.value||'all'; const diff=$('#dsDiff')?.value||'all'; const id=$('#dsDialogue')?.value||'';
 state.dialogueGroup=group; state.dialogueDifficulty=diff; state.dialogueId=id; state.dialoguePeople=$('#dsPeople')?.value||'2'; state.dialogueMinutes=$('#dsMinutes')?.value||'10'; state.dialogueMode=$('#dsMode')?.value||'shadow_roleplay'; state.dialogueScenario=$('#dsScenario')?.value||'classroom'; state.dialogueLineIndex=0;
 save(); closeModal(); render(); toast('Đã thiết lập cuộc nói: '+dialogueSetupPeopleLabel()+', '+state.dialogueMinutes+' phút');
}


function deepUnitKey(unit){return str(unit?.id||unit?.deep_id||unit?.title||'').trim()}
function deepUnitTitle(unit){return unit?.unit_title_vi||unit?.scenario_vi||unit?.title_vi||unit?.title||unit?.unit_title_ru||unit?.scenario_ru||unit?.id||'Deep Speaking'}
function deepUnitsForDialogue(dialogue){
 const units=getDeepSpeakingUnits(); if(!dialogue||!units.length)return [];
 const contextId=dialogue.context_id||dialogue.source_context_id;
 const lessonId=dialogue.lessonId;
 const stage=dialogue.stage;
 const tags=[...(dialogue.az_tags||[]),...(dialogue.communicative_functions_vi||[]),dialogue.group,dialogue.context_title_vi,dialogue.context_title_ru].filter(Boolean).map(x=>lower(x));
 return units.filter(unit=>{const link=unit.linked_speaking||unit.link||{}; const unitTags=arr(unit.integration_tags||unit.az_tags).map(x=>lower(x)); const baseIds=arr(link.base_item_ids||unit.base_item_ids).map(String); const activeId=str(dialogue.id||dialogue.title); return baseIds.includes(activeId)||link.context_id===contextId||link.source_context_id===contextId||link.lessonId===lessonId||unit.linked_speaking_context_id===contextId||unit.linked_speaking_context_key===`${stage}|${dialogue.group_id||dialogue.source_group_id||''}|${contextId}`||(unit.stage===stage&&unitTags.some(tag=>tags.includes(tag)));});
}
function currentDeepUnit(activeDialogue){const direct=getDeepSpeakingUnits().find(u=>deepUnitKey(u)===state.deepSpeakingId); if(direct)return direct; return deepUnitsForDialogue(activeDialogue)[0]||getDeepSpeakingUnits()[0]||null;}
function deepLines(v){if(!v)return []; if(Array.isArray(v))return v.map(x=>typeof x==='string'?x:(x.ru||x.target_ru||x.pattern_ru||x.q_ru||x.a_ru||x.question_ru||x.answer_ru||x.pushback_ru||x.model_answer_ru||x.text||x.prompt_ru||JSON.stringify(x))).filter(Boolean); if(typeof v==='object'){const direct=v.ru||v.target_ru||v.pattern_ru||v.q_ru||v.a_ru||v.question_ru||v.answer_ru||v.pushback_ru||v.model_answer_ru||v.text_ru||v.prompt_ru; if(direct)return [direct]; return Object.values(v).flatMap(deepLines);} return [String(v)];}
function renderDeepMode(unit,mode){
 const step=Number(state.deepSpeakingStep)||0;
 if(mode==='rapid'){const xs=deepLines(unit.rapid_drills||unit.core_phrases).slice(0,24); const line=xs[step%Math.max(1,xs.length)]||'Нет данных.'; return `<section class="panel deep-drill-card"><span class="chip">Rapid drill</span><h3>${esc(line)}</h3><p>Nghe, nói lại ngay, rồi bấm câu tiếp. Mục tiêu là bật câu tự nhiên.</p><div class="lesson-tools"><button class="btn" data-act="deep-prev">← Trước</button><button class="btn green" data-deep-speak="${esc(line)}">🔊 Nghe</button><button class="btn primary" data-act="deep-next">Câu tiếp →</button></div></section>`;}
 if(mode==='substitution'){const xs=deepLines(unit.substitution_drills||unit.substitution_slots).slice(0,24); return `<section class="panel deep-drill-card"><span class="chip">Substitution</span><h3>Thay mẫu câu</h3><ol>${xs.slice(step,step+8).map(x=>`<li>${esc(x)}</li>`).join('')||'<li>Chưa có mẫu thay thế.</li>'}</ol><div class="lesson-tools"><button class="btn" data-act="deep-prev">←</button><button class="btn primary" data-act="deep-next">Tiếp →</button></div></section>`;}
 if(mode==='shadowing'){const xs=deepLines(unit.shadowing_chain||unit.shadowing_sentences).slice(0,18); const line=xs[step%Math.max(1,xs.length)]||'Нет данных.'; return `<section class="panel deep-drill-card"><span class="chip">Shadowing</span><h3>${esc(line)}</h3><p>Nghe chậm, nói đè theo nhịp, sau đó nói lại không nhìn chữ.</p><div class="lesson-tools"><button class="btn" data-deep-speak="${esc(line)}">🔊 Thường</button><button class="btn" data-act="deep-prev">←</button><button class="btn primary" data-act="deep-next">Tiếp →</button></div></section>`;}
 if(mode==='monologue'){const m=unit.model_monologue||unit.monologue||{}; const title=m.prompt_vi||unit.monologue_prompt?.prompt_vi||'Nói độc lập 45–90 giây'; const body=m.ru||m.text_ru||m.answer_ru||deepLines(m).join('\n'); return `<section class="panel deep-drill-card"><span class="chip">Monologue</span><h3>${esc(title)}</h3><pre class="deep-ru-block">${esc(body||'Chuẩn bị bài nói ngắn theo tình huống này.')}</pre><div class="lesson-tools"><button class="btn" data-deep-speak="${esc(body||'')}">🔊 Nghe mẫu</button><button class="btn green" data-act="deep-mark-ok">Đã nói ổn</button><button class="btn warn" data-act="deep-mark-weak">Cần ôn lại</button></div></section>`;}
 if(mode==='qa'){const pairs=arr(unit.qa_pairs||unit.questions||[]); const p=pairs[step%Math.max(1,pairs.length)]||{}; const q=p.question_ru||p.q_ru||p.ru||p.question||'Как вы ответите?'; const a=p.answer_ru||p.a_ru||p.answer||''; return `<section class="panel deep-drill-card"><span class="chip">Q&A áp lực</span><h3>${esc(q)}</h3>${a?`<details><summary>Xem gợi ý trả lời</summary><p>${esc(a)}</p></details>`:''}<div class="lesson-tools"><button class="btn" data-deep-speak="${esc(q)}">🔊 Câu hỏi</button><button class="btn" data-act="deep-prev">←</button><button class="btn primary" data-act="deep-next">Câu tiếp →</button><button class="btn warn" data-act="deep-mark-weak">Cần ôn</button></div></section>`;}
 const phrases=deepLines(unit.core_phrases).slice(0,8); return `<section class="panel deep-drill-card"><span class="chip">Tổng quan luyện sâu</span><h3>${esc(deepUnitTitle(unit))}</h3><p>${esc(unit.scenario_ru||unit.domain||'')}</p><div class="deep-core-grid">${phrases.map(x=>`<span>${esc(x)}</span>`).join('')||'<span>Chọn chế độ drill ở trên.</span>'}</div></section>`;
}
function renderDeepDialoguePanel(active){
 if(!active||!active.id)return '';
 if(!optionalReady('deep-speaking-bauman'))return `<details class="deep-dialogue-panel deep-nine-panel"><summary><span>🎙️ Luyện sâu tình huống này</span><b>Chưa tải Deep Speaking</b></summary><div class="deep-nine-body"><p>Rapid drill, shadowing, monologue và Q&A chỉ tải khi bạn cần.</p><button class="btn primary" data-load-optional="deep-speaking-bauman">Tải Deep Speaking</button></div></details>`;
 if(!optionalReady('speaking-link-index'))return `<details class="deep-dialogue-panel deep-nine-panel"><summary><span>🔗 Cầu nối Deep</span><b>Chưa tải link-index</b></summary><div class="deep-nine-body"><p>Tải link-index để nối hội thoại với bài luyện sâu tương ứng.</p><button class="btn primary" data-load-optional="speaking-link-index">Tải cầu nối</button></div></details>`;
 const units=deepUnitsForDialogue(active);
 if(!units.length)return `<details class="deep-dialogue-panel deep-nine-panel"><summary><span>🎙️ Luyện sâu</span><b>Chưa có unit trực tiếp</b></summary><div class="deep-nine-body"><p>Hội thoại vẫn luyện bình thường. Deep Speaking sẽ hiện khi có unit cùng context/tag.</p></div></details>`;
 const selected=getDeepSpeakingUnits().find(u=>deepUnitKey(u)===state.deepSpeakingId);
 const unit=(selected&&units.some(u=>deepUnitKey(u)===deepUnitKey(selected)))?selected:units[0];
 const mode=state.deepSpeakingMode||'overview';
 return `<details class="deep-dialogue-panel deep-nine-panel"><summary><span>🎙️ Luyện sâu tình huống này</span><b>${esc(deepUnitTitle(unit))}</b><em>${units.length} unit</em></summary><div class="deep-nine-body"><header class="deep-dialogue-head"><div><span class="chip">DEEP SPEAKING · ${esc(unit.stage||active.stage||'')}</span><h3>${esc(deepUnitTitle(unit))}</h3><p>${esc(unit.domain||unit.scenario_ru||'Luyện phản xạ nói sâu theo tình huống đang mở.')}</p></div><select class="input" data-input="deepSpeakingId">${units.slice(0,60).map(u=>`<option value="${esc(deepUnitKey(u))}" ${deepUnitKey(u)===deepUnitKey(unit)?'selected':''}>${esc(deepUnitTitle(u))}</option>`).join('')}</select></header><div class="deep-mode-tabs">${[['overview','Tổng quan'],['rapid','Rapid'],['substitution','Thay mẫu'],['shadowing','Shadowing'],['monologue','Monologue'],['qa','Q&A']].map(([k,v])=>`<button class="btn ${mode===k?'active':''}" data-deep-mode="${k}">${v}</button>`).join('')}</div>${renderDeepMode(unit,mode)}</div></details>`;
}
function getWeakDeepSpeakingUnits(){const weak=state.deepSpeakingProgress?.weak||{}; return getDeepSpeakingUnits().filter(u=>weak[deepUnitKey(u)])}
function renderDeepSpeakingReviewPanel(){const weak=getWeakDeepSpeakingUnits(); if(!weak.length)return ''; return `<details class="deep-review-panel v1298-deep-review-inline"><summary>🎙️ ${weak.length} unit Deep Speaking cần ôn lại</summary><div class="deep-review-list">${weak.slice(0,20).map(u=>`<button class="deep-review-item" data-deep-unit="${esc(deepUnitKey(u))}"><b>${esc(deepUnitTitle(u))}</b><small>${esc(u.stage||'')} · ${esc(u.domain||'')}</small></button>`).join('')}</div></details>`}
function renderDialogue(){
 if(!optionalReady('dialogue-bauman-az'))return renderOptionalDataGate('dialogue-bauman-az','Đối thoại Bauman A-Z','Bộ hội thoại đầy đủ khá lớn nên chỉ tải khi mở tab Đối thoại. Tab Nghe/Nói vẫn dùng bộ cơ bản và không bị ảnh hưởng.');
 const all=byStage(getBaumanDialogueAZ());
 const groups=uniq(all.map(x=>A.dialogueGroup?.(x)||x.group||'general'));
 const diffs=uniq(all.map(x=>A.dialogueDifficulty?.(x)||x.difficulty||x.level||'all'));
 const list=getDialogues();
 const active=list.find(x=>(x.id||x.title)===state.dialogueId)||list[0]||{};
 const turns=dialogueTurns(active);
 const idx=Math.min(state.dialogueLineIndex,Math.max(0,turns.length-1));
 const line=turns[idx]||turns[0]||{};
 const role=state.dialogueRole||'all';
 const hideVi=!!state.dialogueHideVi;
 const result=speakingResultFor(active,idx);
 const prog=dialogueProgress(active);
 const roleStats=dialogueRoleStats(active,role);
 const targetText=dialogueText(line)||'';
 const lineRole=dialogueRoleOf(line,idx);
 const isMine=role!=='all'&&role===lineRole;
 const difficulty=A.dialogueDifficulty?.(active)||active?.difficulty||active?.level||'Dễ';
 const title=A.dialogueTitle?.(active)||active?.title||'Chọn hội thoại';
 const purpose=A.dialogueSubtitle?.(active)||active?.purpose||arr(active?.communicative_functions_vi).join(', ')||'Nghe mẫu, chọn vai và đối đáp trong tình huống thật.';
 const group=A.dialogueGroup?.(active)||active?.group||'Đối thoại';
 const currentVi=hideVi?'':dialogueVi(line);
 const cueText=role==='all'?'Nghe mẫu rồi nhại câu hiện tại':(isMine?'Đến lượt bạn đối đáp':'Nghe vai còn lại, chuẩn bị trả lời');
 const roleName=role==='all'?'Nghe + đối đáp toàn đoạn':`Đối đáp vai ${role}`;
 const hints=arr(active?.vocabulary_seed_ru).slice(0,5).length?arr(active?.vocabulary_seed_ru).slice(0,5):lineTokenHints(targetText);
 const roleLine=(t,i)=>{const r=dialogueRoleOf(t,i), mine=role!=='all'&&role===r, res=speakingResultFor(active,i); return `<button class="dialogue-line v1294-map-line dialogue-nine-map-line ${i===idx?'active':''} ${mine?'my-role':''} ${res?.ok?'spoken-ok':res?'spoken-try':''}" data-line="${i}"><span class="speaker">${esc(r)}</span><b>${esc(dialogueText(t))}</b><small>${String(i+1).padStart(2,'0')} · ${mine?'Câu cần đối đáp':(role==='all'?'Nghe + nhại':'Nghe cue')}</small></button>`};
 return `<div class="dialogue-nine-wrap">
   <section class="panel v1294-speech-room v1295-speech-room dialogue-nine-room">
     <header class="v1294-speech-head v1295-speech-head dialogue-nine-head">
       <div class="v1294-speech-title v1295-speech-title"><span class="chip">💬 ĐỐI THOẠI · ${esc(difficulty)}</span><small>${esc(title)}</small><p>${esc(purpose)}</p></div>
       <div class="v1294-speech-toolbar v1295-speech-toolbar dialogue-nine-toolbar"><button class="btn soft dialogue-setup-btn" data-act="dialogue-setup">⚙️ Thiết lập</button><button class="btn ${role==='all'?'active':''}" data-act="role-all">Nghe + đối đáp</button><button class="btn ${role==='A'?'active':''}" data-act="role-a">Vai A</button><button class="btn ${role==='B'?'active':''}" data-act="role-b">Vai B</button><button class="btn" data-act="toggle-vi">${hideVi?'Hiện nghĩa':'Ẩn nghĩa'}</button></div>
     </header>
     <div class="v1294-speech-progress dialogue-nine-progress"><article><b>Chế độ</b><span>${esc(roleName)}</span></article><article><b>Tiến độ chung</b><span>${prog.ok}/${prog.total} câu đạt · ${prog.percent}%</span></article><article><b>Tiến độ vai</b><span>${roleStats.ok}/${roleStats.total} câu · ${roleStats.percent}%</span></article><article><b>Chủ điểm</b><span>${esc(group)}</span></article></div>
     <article class="v1294-current-line dialogue-nine-current ${isMine?'student-turn':'listener-turn'} speech-content-board">
       <div class="speaker">${esc(lineRole)}</div>
       <div class="v1294-current-body"><label>Câu ${turns.length?idx+1:0}/${turns.length||0} · ${esc(cueText)}</label><div class="russian-line">${esc(targetText||'Chọn một tình huống ở danh sách bên dưới để bắt đầu đối thoại.')}</div>${currentVi?`<p>${esc(currentVi)}</p>`:''}${hints.length?`<div class="speech-hints">${hints.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}</div>
       <button class="btn green speech-ok-corner" data-act="mark-line-ok">✓ Tôi nói ổn</button>
     </article>
     <div class="v1294-speech-actions dialogue-nine-actions"><button class="btn" data-act="prev-line">← Câu trước</button><button class="btn green" data-act="speak-line">🔊 Câu mẫu</button><button class="btn" data-act="speak-line-slow">🐢 Chậm</button><button class="btn blue" data-act="speak-dialogue">Nghe cả đoạn</button><button class="btn" data-act="record-line">🎙️ Đối đáp</button><button class="btn" data-act="next-role-line">Câu của tôi →</button><button class="btn primary" data-act="next-line">Câu tiếp →</button></div>
     <div class="v1294-feedback-line dialogue-nine-feedback"><b>${result?`Điểm nói: ${result.score}%`:'Gợi ý đối đáp'}</b><span>${result?esc(speechFeedback(result.score)):'Nghe câu mẫu, nói lại chậm, sau đó tự đối đáp theo vai. Tab Nghe/Nói vẫn giữ bộ cơ bản; tab này dùng Bauman A-Z.'}</span></div>
     <details class="v1294-speech-map dialogue-nine-map"><summary>🧭 Bản đồ câu đối thoại <span>${turns.length?idx+1:0}/${turns.length||0}</span></summary><div class="v1294-speech-map-grid">${turns.length?turns.map(roleLine).join(''):'<div class="note">Chưa có câu hội thoại.</div>'}</div></details>
     <details class="dialogue-picker compact-picker dialogue-nine-picker"><summary>Đổi tình huống luyện nói <span>${list.length}/${all.length}</span></summary><div class="dialogue-picker-body"><div class="dialogue-picker-tools"><select class="input" data-input="dialogueGroup"><option value="all">Tất cả nhóm</option>${groups.map(g=>`<option value="${esc(g)}" ${state.dialogueGroup===g?'selected':''}>${esc(g)}</option>`).join('')}</select><select class="input" data-input="dialogueDifficulty"><option value="all">Tất cả mức</option>${diffs.map(g=>`<option value="${esc(g)}" ${state.dialogueDifficulty===g?'selected':''}>${esc(g)}</option>`).join('')}</select><input class="input" data-input="dialogueQuery" value="${esc(state.dialogueQuery)}" placeholder="Tìm tình huống..."></div><div class="dialogue-picker-list">${list.slice(0,120).map(d=>`<button class="item-card ${active===d?'active':''}" data-dialogue="${esc(d.id||d.title)}"><b>${esc(A.dialogueTitle?.(d)||d.title||'Hội thoại')}</b><small>${esc((A.dialogueGroup?.(d)||d.group||'')+' · '+(A.dialogueDifficulty?.(d)||d.difficulty||d.level||''))}</small></button>`).join('')||'<div class="note">Chưa có hội thoại.</div>'}</div></div></details>
   </section>
   ${renderDeepDialoguePanel(active)}
 </div>`
}
function handwritingText(item){return A.handwritingPrint?.(item)||item.print||item.text||item.letter||'А а'}
function handwritingModeName(item){const m=item?.mode||'alphabet'; return ({alphabet:'Chữ cái',word:'Từ/cụm từ',sentence:'Câu thực tế',academic:'Học thuật'})[m]||m}
function handwritingReality(item){
 const m=item?.mode||'alphabet';
 if(m==='alphabet')return 'Dùng để nhận mặt chữ khi đọc bảng, chép bài và ghi âm khó trong lớp dự bị.';
 if(m==='word')return 'Dùng ngay khi ghi nhiệm vụ, hỏi bài, điền form hoặc chép từ mới vào vở.';
 if(m==='sentence')return 'Dùng khi giao tiếp thật: xin nhắc lại, giới thiệu bản thân, hỏi yêu cầu bài học.';
 if(m==='academic')return 'Dùng trong seminar, НИР, báo cáo thí nghiệm và phần chuẩn bị ВКР.';
 return 'Dùng để biến mẫu chữ thành thao tác viết thật trong lớp và khi tự học.';
}
function handwritingSteps(item){
 const txt=str(handwritingText(item));
 const compact=txt.replace(/\s+/g,' ').trim();
 const chars=[...compact.replace(/\s+/g,'')].slice(0,10);
 const isWord=compact.length>3;
 return [
  `Quan sát mẫu lớn: ${compact||'А а'}; đọc thành tiếng trước khi viết.`,
  `Tách ký tự: ${chars.join(' · ')||'А · а'}${compact.replace(/\s+/g,'').length>10?' · …':''}.`,
  isWord?'Viết từng chữ từ trái sang phải, giữ khoảng cách giữa các chữ bằng nửa thân chữ.':'Viết nét chính trước, giữ độ cao và độ nghiêng giống mẫu.',
  'Viết chậm một dòng, không tô đè; sai thì gạch nhẹ và viết lại bên cạnh.',
  'Đọc lại, so với mẫu lớn, khoanh chữ/nét lệch để sửa ở lượt tiếp theo.'
 ];
}

function handwritingStrokeSteps(item){
 if(Array.isArray(item?.strokes)&&item.strokes.length)return item.strokes.map((x,i)=>({title:x.title||`Nét ${i+1}`,detail:x.detail||x.text||x.note||''}));
 const txt=str(handwritingText(item)).trim()||'А а';
 const main=[...txt.replace(/\s+/g,'')][0]||'А';
 return [
  {title:'Đặt khung chữ',detail:`Nhìn ${main}: xác định chiều cao, độ nghiêng và khoảng trắng trước khi đặt bút.`},
  {title:'Nét chính',detail:'Viết nét dài hoặc thân chữ trước, đi chậm để không vỡ dáng.'},
  {title:'Nét phụ',detail:'Thêm móc, vòng hoặc gạch ngang; giữ điểm nối mềm, không tô đi tô lại.'},
  {title:'Ghép chữ',detail:`Viết đủ mẫu ${txt}, so khoảng cách giữa chữ hoa, chữ thường và khoảng nghỉ.`},
  {title:'Soát lỗi',detail:'Khoanh nét lệch, xóa giấy luyện bên phải rồi viết lại lượt mới.'}
 ];
}

function primaryHandwritingChar(item){
 return [...str(handwritingText(item)).replace(/\s+/g,'')][0]||'А';
}
function handwritingGuideFamily(item){
 const ch=primaryHandwritingChar(item);
 const map={
  angled:'АЛМ', triple:'ШЩИИЙЫ', bars:'ГПТН', bowl:'БВЬЪЯ', round:'ОСЕЁЭЮФ', special:'ДЖЗКХЛ', tail:'РУЦЧ'
 };
 for(const [key,chars] of Object.entries(map))if(chars.includes(ch))return key;
 return 'angled';
}
function handwritingGuidePaths(item){
 const family=handwritingGuideFamily(item);
 const lib={
  angled:[[[0.20,0.80],[0.36,0.22]],[[0.36,0.22],[0.54,0.80]],[[0.30,0.58],[0.46,0.58]],[[0.54,0.80],[0.68,0.42],[0.82,0.80]]],
  triple:[[[0.18,0.78],[0.18,0.28],[0.32,0.58],[0.46,0.28],[0.46,0.78]],[[0.50,0.78],[0.50,0.28],[0.64,0.58],[0.78,0.28],[0.78,0.78]],[[0.80,0.78],[0.84,0.92]]],
  bars:[[[0.20,0.22],[0.80,0.22]],[[0.26,0.22],[0.26,0.80]],[[0.74,0.22],[0.74,0.80]],[[0.26,0.52],[0.74,0.52]]],
  bowl:[[[0.26,0.20],[0.26,0.80]],[[0.26,0.20],[0.60,0.20],[0.66,0.40],[0.30,0.48]],[[0.30,0.50],[0.70,0.56],[0.66,0.80],[0.30,0.80]],[[0.70,0.80],[0.82,0.58]]],
  round:[[[0.52,0.18],[0.34,0.22],[0.22,0.48],[0.34,0.76],[0.58,0.82],[0.76,0.62]],[[0.76,0.62],[0.82,0.46],[0.76,0.28],[0.60,0.20]],[[0.42,0.50],[0.60,0.50]],[[0.46,0.10],[0.56,0.10]]],
  special:[[[0.24,0.78],[0.24,0.28],[0.40,0.52],[0.56,0.28],[0.56,0.78]],[[0.62,0.28],[0.76,0.50],[0.62,0.78]],[[0.76,0.28],[0.62,0.50],[0.76,0.78]],[[0.58,0.82],[0.76,0.92]]],
  tail:[[[0.22,0.24],[0.22,0.60],[0.40,0.48],[0.58,0.24]],[[0.58,0.24],[0.58,0.80]],[[0.58,0.80],[0.70,0.96]],[[0.40,0.54],[0.74,0.54]]]
 };
 return lib[family]||lib.angled;
}

function handwritingPrintSample(item){
 const raw=str(item?.print||item?.text||item?.letter||item?.uppercase||item?.sample||'А а').trim();
 return raw||'А а';
}
function handwritingCursiveSample(item){
 const raw=str(item?.cursive||item?.handwriting||item?.write||item?.copy||item?.print||item?.text||'А а').trim();
 return raw.replace(/\s{2,}/g,' ')||'А а';
}
function handwritingSafeMarkerId(item,step,kind='s'){
 const ch=primaryHandwritingChar(item); const code=ch?ch.charCodeAt(0):1040;
 return `hw_arr_${code}_${Number(step)||0}_${kind}`;
}
function strokeMiniSvg(item,step=0,kind='small'){
 const guides=handwritingGuidePaths(item); const idx=Math.max(0,Math.min(Number(step)||0,guides.length-1));
 const pts=guides[idx]||guides[0]||[[0.2,0.8],[0.8,0.2]];
 const large=kind==='large'; const w=large?220:150, h=large?128:86;
 const box={x:large?24:16,y:large?16:10,w:large?172:118,h:large?92:62};
 const d=pts.map((p,i)=>`${i?'L':'M'}${(box.x+p[0]*box.w).toFixed(1)},${(box.y+p[1]*box.h).toFixed(1)}`).join(' ');
 const start=pts[0]||[.2,.8]; const sx=(box.x+start[0]*box.w).toFixed(1), sy=(box.y+start[1]*box.h).toFixed(1);
 const id=handwritingSafeMarkerId(item,idx,large?'l':'s');
 const label=esc(`Nét ${idx+1}`);
 return `<svg class="stroke-mini-svg ${large?'large':''}" viewBox="0 0 ${w} ${h}" aria-label="${label}" role="img"><defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb"></path></marker></defs><path class="mini-lines" d="M10 ${Math.round(h*.32)}H${w-10}M10 ${Math.round(h*.60)}H${w-10}"></path><path class="mini-path" d="${d}" marker-end="url(#${id})"></path><circle class="mini-start" cx="${sx}" cy="${sy}" r="${large?6:4}"></circle><text x="${large?18:12}" y="${h-10}" font-size="${large?13:10}" font-weight="800" fill="#475569">${label}</text></svg>`;
}
function handwritingVisualPanel(item,step=0){
 const steps=handwritingStrokeSteps(item); const current=steps[step]||steps[0]||{};
 const print=handwritingPrintSample(item); const cursive=handwritingCursiveSample(item);
 return `<div class="step36-visual-panel"><div class="step36-visual-main"><div>${strokeMiniSvg(item,step,'large')}</div><div><span class="chip">Hình nét đang luyện</span><b>${esc(current.title||'Luyện nét')}</b><p>${esc(current.detail||'Nhìn chấm đặt bút, kéo theo mũi tên, sau đó viết lại xuống vở.')}</p></div></div><small>Nhận mặt chữ in: <b>${esc(print)}</b>. Mẫu viết tay cần luyện: <b>${esc(cursive)}</b>. Hãy nhìn hình, tô theo trên bảng phải rồi chép lại vào vở thật.</small></div>`;
}
function drawGuidePath(points,color,width,dash=[]){
 if(!ctx||!points?.length)return;
 const box={x:230,y:120,w:560,h:290};
 ctx.save();
 ctx.strokeStyle=color;
 ctx.lineWidth=width;
 ctx.setLineDash(dash);
 ctx.beginPath();
 points.forEach((p,i)=>{
  const x=box.x+p[0]*box.w;
  const y=box.y+p[1]*box.h;
  if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y);
 });
 ctx.stroke();
 const [a,b]=points.length>1?[points[points.length-2],points[points.length-1]]:[points[0],points[0]];
 const ax=box.x+a[0]*box.w, ay=box.y+a[1]*box.h, bx=box.x+b[0]*box.w, by=box.y+b[1]*box.h;
 const ang=Math.atan2(by-ay,bx-ax); const len=16;
 ctx.setLineDash([]);
 ctx.beginPath();
 ctx.moveTo(bx,by);
 ctx.lineTo(bx-len*Math.cos(ang-Math.PI/7), by-len*Math.sin(ang-Math.PI/7));
 ctx.moveTo(bx,by);
 ctx.lineTo(bx-len*Math.cos(ang+Math.PI/7), by-len*Math.sin(ang+Math.PI/7));
 ctx.stroke();
 ctx.restore();
}
function drawHandwritingOverlay(item){
 if(!ctx||!canvas)return;
 if(state.handwritingShowGuide===false||state.handwritingPractice==='free')return;
 const steps=handwritingStrokeSteps(item);
 const guides=handwritingGuidePaths(item);
 const active=Math.max(0,Math.min(state.handwritingStep, Math.max(guides.length,steps.length)-1));
 ctx.save();
 ctx.fillStyle='rgba(255,255,255,.78)';
 ctx.strokeStyle='rgba(59,130,246,.18)';
 ctx.lineWidth=2;
 ctx.beginPath();
 if(ctx.roundRect){ctx.roundRect(210,92,650,360,18);ctx.fill();ctx.stroke();}
 else {ctx.fillRect(210,92,650,360);ctx.strokeRect(210,92,650,360);}
 const itemPrint=handwritingPrintSample(item).replace(/\s+/g,' ');
 const itemHand=handwritingCursiveSample(item).replace(/\s+/g,' ');
 ctx.fillStyle='rgba(71,85,105,.55)';
 ctx.font='22px system-ui, -apple-system, Segoe UI, sans-serif';
 ctx.fillText('Chữ in chỉ để nhận mặt:',250,145);
 ctx.fillStyle='rgba(15,23,42,.34)';
 ctx.font='52px Georgia, serif';
 ctx.fillText(itemPrint||'А а',250,205);
 ctx.fillStyle='rgba(29,78,216,.16)';
 ctx.font='98px "Segoe Script", "Comic Sans MS", cursive';
 ctx.fillText(itemHand||'А а',250,305);
 ctx.fillStyle='rgba(29,78,216,.72)';
 ctx.font='24px system-ui, -apple-system, Segoe UI, sans-serif';
 ctx.fillText('Mẫu viết tay mới là phần cần luyện',250,350);
 if(state.handwritingPractice!=='view')guides.forEach((pts,idx)=>drawGuidePath(pts, idx===active?'rgba(37,99,235,.92)':'rgba(148,163,184,.45)', idx===active?7:4, idx===active?[]:[8,10]));
 const current=steps[active]||steps[0];
 ctx.fillStyle='rgba(15,23,42,.70)';
 ctx.font='24px system-ui, -apple-system, Segoe UI, sans-serif';
 ctx.fillText(`Bước ${active+1}/${steps.length}: ${current?.title||'Luyện nét'}`,250,405);
 ctx.font='19px system-ui, -apple-system, Segoe UI, sans-serif';
 const detail=(current?.detail||'Bấm chọn từng nét ở bảng trái rồi luyện ngay trên giấy.').slice(0,130);
 ctx.fillText(detail,250,435);
 ctx.restore();
}

function renderHandGridModal(){
 const all=getHandwriting();
 const hand=all.filter(x=>!state.handwritingQuery||lower(A.handwritingText?.(x)||JSON.stringify(x)).includes(lower(state.handwritingQuery)));
 return `<div class="hand-grid-modal step36-hand-grid"><div class="toolbar"><div><span class="chip">MẪU CHỮ VIẾT TAY</span><h3>Chọn chữ viết tay để luyện</h3><p>Chữ in chỉ để nhận mặt. Mẫu chữ viết tay mới là phần cần luyện xuống vở.</p></div><span class="chip">${hand.length}/${all.length}</span></div><div class="hand-sample-grid step36-hand-sample-grid">${hand.map(x=>{const i=all.indexOf(x); return `<button class="hand-sample-card step36-hand-sample-card ${i===state.handwritingIndex?'active':''}" data-hand-index="${i}"><small>In: ${esc(handwritingPrintSample(x))}</small><b>${esc(handwritingCursiveSample(x))}</b><span>Viết tay thông dụng</span></button>`}).join('')||'<div class="note">Không có mẫu phù hợp.</div>'}</div></div>`
}
function academicWritingSteps(w){
 return [
  'Xác định người đọc: giáo viên, bạn học, phòng giáo vụ hay hội đồng.',
  `Dùng mục tiêu: ${str(w?.purpose||w?.prompt_vi||'viết rõ ý chính và đúng ngữ cảnh')}.`,
  'Viết nháp 3 phần: mở ý → thông tin chính → câu kết lịch sự.',
  'Soát giống, số, cách, động từ và trật tự từ trước khi lưu.',
  'Đọc thành tiếng một lượt để kiểm tra câu có tự nhiên không.'
 ];
}
function writingPracticeName(mode){return ({view:'Nhìn mẫu tay',trace:'Tô theo nét',free:'Viết vào vở'})[mode||'trace']||'Tô theo nét'}
function writingPracticeHelp(mode){
 if(mode==='view')return 'Nhìn chữ viết tay lớn, phân biệt với chữ in và đọc hướng đi nét trước khi viết.';
 if(mode==='free')return 'Tắt mẫu mờ để viết như trong vở. Sau mỗi dòng, so với mẫu bên trái rồi sửa nét lệch.';
 return 'Có chữ viết tay mờ và hình mũi tên. Tô theo để nhớ cơ tay, sau đó chuyển sang viết tự do.';
}
function practicalStrokeCue(item,step){
 const steps=handwritingStrokeSteps(item); const current=steps[step]||steps[0]||{};
 const hand=handwritingCursiveSample(item).replace(/\s+/g,' ');
 return [
  `Đặt bút: xem chấm bắt đầu trong hình nét, đặt bút nhẹ, chưa vội kéo.`,
  `Đi nét: ${current.detail||'kéo theo mũi tên, giữ độ nghiêng và không tô đè.'}`,
  `Chép vở: viết ${hand} thêm 1 dòng trong vở thật, so độ cao, khoảng cách và điểm nối.`
 ];
}
function renderWriting(){
 const hand=getHandwriting();
 const item=hand[state.handwritingIndex%Math.max(1,hand.length)]||{};
 const writes=getWriting();
 const mode=state.writingMode==='academic'?'academic':'handwriting';
 const activeWrite=writes[state.writingIndex%Math.max(1,writes.length)]||{};
 const writeItems=writes.filter(w=>!state.writingQuery||lower(A.writingText?.(w)||JSON.stringify(w)).includes(lower(state.writingQuery))).slice(0,72);
 const writingKinds=uniq(writes.map(w=>A.writingMode?.(w)||w.mode||w.type||'writing'));
 const printSample=handwritingPrintSample(item);
 const handSample=handwritingCursiveSample(item);
 const steps=handwritingStrokeSteps(item);
 const current=steps[state.handwritingStep]||steps[0]||{};
 const practice=state.handwritingPractice||'trace';
 const showGuide=state.handwritingShowGuide===true;
 const showLines=state.handwritingShowLines!==false;
 const cues=practicalStrokeCue(item,state.handwritingStep);
 return `<div class="writing-studio step4-writing-studio step36-handwriting-studio">
   <section class="panel writing-hero compact-hero flat-hero writing-final-head step4-writing-head step36-writing-head">
     <div><span class="chip">HANDWRITING FIRST · SAFE ROUND 2</span><h3>Luyện chữ viết tay Nga thông dụng</h3><p>Chữ in chỉ để nhận mặt trong sách/bảng. Phần luyện chính là chữ viết tay: nhìn mẫu, xem hình nét, tô theo rồi chép xuống vở thật.</p></div>
     <div class="tabs compact-tabs"><button class="btn ${mode==='handwriting'?'active':''}" data-writing="handwriting">✍️ Chữ viết tay</button><button class="btn ${mode==='academic'?'active':''}" data-writing="academic">🧾 Câu, email, НИР/ВКР</button></div>
   </section>
   ${mode==='handwriting'?`<div class="writing-workbench step4-writing-workbench step36-writing-workbench handwriting-mode v1285-writing-compact">
     <aside class="panel writing-control hand-left-board step4-left-board step36-left-board">
       <div class="toolbar compact-toolbar"><div><h3>Bảng trái · Mẫu viết tay</h3><p>Chọn chữ, nhìn mẫu rồi luyện ở bảng phải. Bỏ phần thứ tự nét để màn hình sạch hơn.</p></div><span class="chip">${state.handwritingIndex+1}/${hand.length||0}</span></div>
       <div class="step4-left-actions"><button class="btn primary" data-act="open-hand-grid">🔤 Mẫu chữ viết tay</button><input class="input compact-input" data-input="handwritingQuery" value="${esc(state.handwritingQuery||'')}" placeholder="Tìm chữ/từ/câu..."></div>
       <div class="step36-print-hand-card">
         <div class="print-ref"><span>Chữ in để nhìn</span><b>${esc(printSample)}</b></div>
         <div class="hand-ref"><span>Mẫu viết tay cần luyện</span><strong>${esc(handSample)}</strong></div>
         <p>${esc(A.handwritingNote?.(item)||item.note||'Tập chữ viết tay, chữ in chỉ dùng để nhận diện khi đọc.')}</p>
       </div>
       <div class="step4-mode-card step36-mode-card v1285-mode-card"><h4>Chế độ luyện</h4><div class="step4-mode-grid">
         ${['view','trace','free'].map(m=>`<button class="btn ${practice===m?'active':''}" data-hand-practice="${m}">${esc(writingPracticeName(m))}</button>`).join('')}
       </div><p>${esc(writingPracticeHelp(practice))}</p><div class="step4-toggle-row"><span class="chip ${showGuide?'':'muted-chip'}">Mẫu mờ: ${showGuide?'bật':'tắt'}</span><span class="chip ${showLines?'':'muted-chip'}">Đường kẻ: ${showLines?'bật':'tắt'}</span></div></div>
       <div class="lesson-tools step4-nav-tools"><button class="btn" data-act="prev-hand">← Mẫu trước</button><button class="btn" data-act="next-hand">Mẫu sau →</button></div>
     </aside>
     <main class="panel handwriting-sheet hand-right-practice step4-right-board step36-right-board">
       <div class="practice-head step4-practice-head step36-practice-head v1285-practice-head"><div><span class="chip">Bảng phải · Tập viết</span><h3>${esc(handSample)}</h3><p>Viết theo mẫu chữ tay đã chọn. Tập trung nét sạch, khoảng cách đều, không cần xem thẻ thứ tự nét.</p></div><div class="mini-copy-line"><b>Chép vở:</b><span>${esc(item.copy||handSample)}</span></div></div>
       <div class="writing-tools compact-tools step4-writing-tools step36-writing-tools"><label>Nét <input id="penSize" type="range" min="2" max="18" value="${penSize}"></label><button class="dot active" data-pen-color="#111827" title="Đen"></button><button class="dot red" data-pen-color="#9f1239" title="Đỏ"></button><button class="dot blue-dot" data-pen-color="#1d4ed8" title="Xanh"></button><button class="btn" data-act="undo-canvas">↶ Hoàn tác</button><button class="btn" data-act="clear-line">Xóa dòng luyện</button><button class="btn" data-act="clear-canvas">Xóa bảng</button><button class="btn" data-act="toggle-guide">${showGuide?'Tắt mẫu mờ':'Bật mẫu mờ'}</button><button class="btn" data-act="toggle-lines">${showLines?'Tắt đường kẻ':'Bật đường kẻ'}</button><button class="btn blue" data-act="download-canvas">Tải ảnh</button></div>
       <div class="paper pro-paper step4-paper step36-paper"><canvas id="writingCanvas" class="writingCanvas" width="2048" height="1180"></canvas></div>
       <div class="step4-footnote step36-footnote v1285-writing-footnote"><span>Quy trình gọn: nhìn mẫu → viết trên bảng → chép lại vào vở thật.</span><span>Phím tắt: ←/→ đổi mẫu, Backspace hoàn tác.</span></div>
     </main>
   </div>`:`<div class="writing-workbench compact-writing academic-mode final-academic-layout">
     <aside class="panel writing-control compact-panel slim-control">
       <div class="toolbar compact-toolbar"><div><h3>Nhiệm vụ viết</h3><p>Chọn mẫu gắn với việc thật.</p></div><span class="chip">${writeItems.length}/${writes.length||0}</span></div>
       <input class="input compact-input" data-input="writingQuery" value="${esc(state.writingQuery||'')}" placeholder="Tìm câu, email, báo cáo...">
       <div class="writing-kind-strip">${writingKinds.slice(0,6).map(k=>`<span>${esc(k)}</span>`).join('')}</div>
       <div class="handwriting-list clean-scroll">${writeItems.map(w=>`<button class="source-tile hand-tile ${w===activeWrite?'active':''}" data-write-index="${writes.indexOf(w)}"><span>${esc(A.writingTitle?.(w)||w.title||'Nhiệm vụ viết')}</span><small>${esc(clip(A.writingPurpose?.(w)||w.purpose||w.prompt_vi||'',86))}</small></button>`).join('')||'<div class="note compact-note">Chưa có nhiệm vụ viết học thuật.</div>'}</div>
     </aside>
     <main class="panel academic-editor compact-panel slim-editor final-academic-editor">
       <div class="toolbar compact-toolbar"><div><span class="chip">${esc(A.writingMode?.(activeWrite)||activeWrite.mode||activeWrite.type||'writing')}</span><h3>${esc(A.writingTitle?.(activeWrite)||activeWrite.title||'Chọn nhiệm vụ viết')}</h3><p>${esc(activeWrite.purpose||'Viết ngắn, rõ ý, dùng được trong lớp hoặc môi trường học thuật.')}</p></div><button class="btn primary" data-ai-quick="writing">AI gợi ý viết</button></div>
       <section class="writing-steps-card academic-steps"><h4>Quy trình viết</h4><ol>${academicWritingSteps(activeWrite).map(x=>`<li>${esc(x)}</li>`).join('')}</ol></section>
       <textarea class="textarea academic-draft compact-draft" data-input="writingDraft" placeholder="Viết tiếng Nga tại đây...">${esc(state.writingDraft)}</textarea>
     </main>
   </div>`}
 </div>`
}

function renderVocab(){
 try{
  const list=getVocab();
  if(!list.length){
   return `<section class="panel vocab-empty learning-recovery-card"><span class="chip">🗂️ Từ vựng</span><h3>Chưa có thẻ từ vựng phù hợp</h3><p>Đổi giai đoạn hoặc xóa từ khóa tìm kiếm để xem lại dữ liệu.</p></section>`;
  }
  state.vocabIndex=Math.min(Math.max(0,Number(state.vocabIndex)||0),Math.max(0,list.length-1));
  const pageSize=VOCAB_PAGE_SIZE||20;
  state.vocabPage=Math.floor(state.vocabIndex/pageSize);
  const v=list[state.vocabIndex]||{};
  const info=vocabInfo(v);
  const flipped=!!state.vocabFlipped;
  const pageStart=state.vocabPage*pageSize;
  const rows=list.slice(pageStart,pageStart+pageSize);
  const term=info.term||'—';
  const termLen=[...str(term)].length;
  const termSizeClass=termLen>24?'term-xxlong':termLen>15?'term-xlong':termLen>9?'term-long':'term-normal';
  const meaning=info.displayMeaning||info.meaningVi||info.english||info.meaningRu||'Chưa có nghĩa mô tả.';
  const example=info.example||'';
  const meaningNote=vocabMeaningNoteText(info);
  const application=vocabApplicationText(info);
  const sideRows=rows.map((item,i)=>{const idx=pageStart+i; const vi=vocabInfo(item); const rowMeaning=vi.displayMeaning||vi.meaningVi||vi.english||vi.meaningRu||''; const rowEmoji=vi.emoji||'•'; return `<button class="vocab-mini-row v1310-vocab-row ${idx===state.vocabIndex?'active':''}" data-vocab="${idx}"><span>${String(idx+1).padStart(2,'0')}</span><div><b><i class="v1312-row-emoji">${esc(rowEmoji)}</i>${esc(clip(vi.term||'—',34))}</b><small>${esc(clip(rowMeaning,42))}</small></div></button>`}).join('');
  const visual=vocabVisualHtml(info,false);
  const visualBack=vocabVisualHtml(info,true);
  const dialogueExample=vocabDialogueExampleHtml(info);
  const front=`<div class="v1310-flash-face v1312-flash-face"><div class="v1312-flash-visual">${visual}</div><div class="term ${termSizeClass}">${esc(term)}</div><div class="v1310-pron">${esc(info.pron||'Bấm để lật nghĩa')}</div></div>`;
  const back=`<div class="v1310-flash-face v1312-flash-face flipped"><div class="v1312-flash-visual back">${visualBack}</div><span>Nghĩa</span><div class="meaning">${esc(meaning)}</div>${example?`<small>${esc(example)}</small>`:''}</div>`;
  return `<div class="vocab-studio step37-vocab-safe canva3-vocab canva3-vocab-no-hero v1303-vocab-safe v1310-vocab-polish v1311-vocab-luxe v1312-vocab-chibi">
   <div class="vocab-desk step37-vocab-desk canva3-vocab-desk v1303-vocab-desk v1310-vocab-desk">
     <aside class="panel vocab-page-list v1303-vocab-list v1310-vocab-list" aria-label="Danh sách 20 thẻ từ hiện tại">
       <div class="vocab-list-head v1310-vocab-list-head"><span class="chip">20 thẻ/lượt</span><b>${pageStart+1}-${Math.min(list.length,pageStart+rows.length)}/${list.length}</b></div>
       <div class="vocab-list-scroll clean-scroll v1310-vocab-scroll">${sideRows}</div>
     </aside>
     <main class="panel vocab-card-panel canva3-card-panel canva3-card-panel-actions v1303-vocab-card-panel v1310-vocab-main">
       <header class="v1310-vocab-top v1311-vocab-top"><div><span class="chip">Thẻ ${state.vocabIndex+1}/${list.length}</span><h3>${esc(term)}</h3></div><small>${esc(info.pron||'Bấm thẻ để lật nghĩa')}</small></header>
       <button class="flash visual-flash canva3-flash v1303-flash v1310-flash ${flipped?'flipped':''}" data-act="toggle-vocab-flip"><div class="flash-inner v1303-flash-inner v1310-flash-inner">${flipped?back:front}</div></button>
       <div class="vocab-actions canva3-card-actions v1310-vocab-actions" aria-label="Điều khiển flashcard"><button class="btn" data-act="prev-vocab">← Trước</button><button class="btn green" data-act="speak-vocab">🔊 Nghe</button><button class="btn primary" data-act="toggle-vocab-flip">${flipped?'Mặt từ':'Lật nghĩa'}</button><button class="btn" data-act="next-vocab">Sau →</button></div>
       <section class="v1310-vocab-detail v1313-vocab-detail v1314-vocab-detail" aria-label="Chi tiết thẻ từ"><article><b>Nghĩa</b><p>${esc(meaning)}</p></article><article><b>Ý nghĩa</b><p>${esc(meaningNote)}</p></article><article><b>Ứng dụng</b><p>${esc(application)}</p></article></section>
       ${dialogueExample}
     </main>
   </div>
 </div>`;
 }catch(e){
  console.error('VOCAB_RENDER_GUARD',e);
  return `<section class="panel learning-recovery-card"><span class="chip danger-chip">LỖI TỪ VỰNG</span><h3>Đã chặn lỗi render từ vựng</h3><p>${esc(e?.message||e)}</p><button class="btn primary" data-view="overview">Về Tổng quan</button></section>`;
 }

}

function grammarLevelOrder(v){const order={A0:0,A1:1,A2:2,B1:3,B2:4,C1:5,'Chuyên sâu':6}; return order[str(v)] ?? 99}
function grammarAllModules(){
 const path=arr(DB['grammar-path']).map((x,i)=>({...x,_source:'grammar-path',_idx:i}));
 const legacy=arr(DB.grammar).map((g,i)=>({id:g.id||('GR_LEGACY_'+i),level:g.level||'A1',track:g.track||'Trong bài học',title:g.title||'Mẫu ngữ pháp',why:g.focus||g.rule||'',core:g.rule||g.focus||'',pattern:g.pattern||'',examples:arr(g.examples).map(e=>typeof e==='string'?{ru:e,vi:'',note:''}:e),practice:arr(g.practice),mistakes:arr(g.mistakes),bauman:g.professor_note||'Mẫu gốc đang dùng trong bài học.',mastery:g.focus||'',mapLinks:g.tags||[],_source:'grammar',_idx:i}));
 return [...path,...legacy].sort((a,b)=>grammarLevelOrder(a.level)-grammarLevelOrder(b.level)||str(a.track).localeCompare(str(b.track),'vi')||str(a.id).localeCompare(str(b.id),'vi'));
}
function grammarFilteredModules(){
 let xs=grammarAllModules();
 const q=lower(state.grammarQuery||'');
 if(state.grammarLevel&&state.grammarLevel!=='all')xs=xs.filter(x=>str(x.level||'')===state.grammarLevel);
 if(state.grammarTrack&&state.grammarTrack!=='all')xs=xs.filter(x=>str(x.track||'')===state.grammarTrack);
 if(q)xs=xs.filter(x=>lower([x.id,x.level,x.track,x.title,x.why,x.core,x.pattern,JSON.stringify(x.examples||[]),JSON.stringify(x.practice||[]),JSON.stringify(x.mistakes||[]),x.bauman].join(' ')).includes(q));
 return xs;
}
function grammarExampleHtml(ex){
 if(typeof ex==='string')return `<article><b>${esc(ex)}</b></article>`;
 return `<article><b>${esc(ex.ru||ex.text||'Ví dụ')}</b>${ex.vi?`<span>${esc(ex.vi)}</span>`:''}${ex.note?`<small>${esc(ex.note)}</small>`:''}</article>`;
}
function grammarListHtml(xs){
 return xs.map((g,i)=>`<button class="grammar-nav-card ${i===state.grammarIndex?'active':''}" data-grammar-index="${i}"><span>${esc(g.level||'A1')}</span><div><b>${esc(clip(g.title||'Mục ngữ pháp',58))}</b><small>${esc(g.track||'Ngữ pháp')}</small></div></button>`).join('');
}
function renderGrammar(){
 const all=grammarAllModules();
 const levels=['all',...Array.from(new Set(all.map(x=>x.level).filter(Boolean))).sort((a,b)=>grammarLevelOrder(a)-grammarLevelOrder(b))];
 const levelScoped=state.grammarLevel&&state.grammarLevel!=='all'?all.filter(x=>str(x.level||'')===state.grammarLevel):all;
 const tracks=['all',...Array.from(new Set(levelScoped.map(x=>x.track).filter(Boolean))).sort((a,b)=>str(a).localeCompare(str(b),'vi'))];
 if(state.grammarTrack!=='all'&&!tracks.includes(state.grammarTrack)){state.grammarTrack='all';state.grammarIndex=0;}
 const xs=grammarFilteredModules();
 state.grammarIndex=Math.min(Math.max(0,Number(state.grammarIndex)||0),Math.max(0,xs.length-1));
 const g=xs[state.grammarIndex]||xs[0]||{};
 const examples=arr(g.examples).slice(0,8).map(grammarExampleHtml).join('')||'<article><b>Chưa có ví dụ</b><span>Hãy thêm vào grammar-path.json trong tab Lưu trữ.</span></article>';
 const practice=arr(g.practice).slice(0,8).map(x=>`<li>${esc(x)}</li>`).join('')||'<li>Đọc quy tắc, tạo 3 câu và tự nói thành tiếng.</li>';
 const mistakes=arr(g.mistakes).slice(0,6).map(x=>`<li>${esc(x)}</li>`).join('')||'<li>Học quy tắc rời khỏi câu thật.</li>';
 const mapLinks=arr(g.mapLinks).slice(0,4).map(id=>{const m=arr(DB.mindmap).find(x=>x.id===id); return `<button class="grammar-map-link" data-mindmap-map="${esc(id)}">${esc(m?.title||id)}</button>`}).join('');
 const scopedHint=state.grammarLevel&&state.grammarLevel!=='all'?`Đang lọc ${esc(state.grammarLevel)}: menu mạch chỉ còn các mạch thuộc cấp này.`:'Chọn một cấp độ để menu mạch tự thu gọn theo cấp đó.';
 return `<div class="grammar-luxe-shell">
   <section class="panel grammar-hero"><div><span class="chip">NGỮ PHÁP RIÊNG · A0 → C1</span><h3>Ngữ pháp học để nói, viết và đọc tài liệu Bauman</h3><p>Tab này tách ngữ pháp thành lộ trình riêng: chọn cấp nào thì chỉ hiện mạch của cấp đó, tránh lẫn tầng kiến thức và tìm nhanh hơn.</p></div><div class="grammar-hero-stat"><b>${all.length}</b><span>mục ngữ pháp</span></div></section>
   <section class="panel grammar-filterbar grammar-filterbar-v1325"><select class="input" data-input="grammarLevel">${levels.map(l=>`<option value="${esc(l)}" ${state.grammarLevel===l?'selected':''}>${l==='all'?'Tất cả cấp độ':esc(l)}</option>`).join('')}</select><select class="input" data-input="grammarTrack">${tracks.map(t=>`<option value="${esc(t)}" ${state.grammarTrack===t?'selected':''}>${t==='all'?'Mạch của cấp đang chọn':esc(t)}</option>`).join('')}</select><input class="input" data-input="grammarQuery" value="${esc(state.grammarQuery||'')}" placeholder="Tìm trong cấp/mạch hiện tại: cách 2, НСВ, Bauman..."/><span class="grammar-scope-hint">${scopedHint}</span></section>
   <div class="grammar-workbench"><aside class="panel grammar-sidebar"><div class="grammar-side-head"><b>Lộ trình</b><span>${xs.length}/${all.length} mục</span></div><div class="grammar-nav-scroll">${grammarListHtml(xs)||'<article class="storage-empty"><b>Không có mục phù hợp</b><span>Đổi bộ lọc hoặc xóa từ khóa.</span></article>'}</div></aside>
   <main class="panel grammar-main-card"><header class="grammar-main-head"><div><span class="chip">${esc(g.level||'A1')} · ${esc(g.track||'Ngữ pháp')}</span><h3>${esc(g.title||'Mục ngữ pháp')}</h3><p>${esc(g.why||'Học mục này để nối quy tắc với câu nói, bài viết và tình huống thật.')}</p></div><b class="grammar-index-pill">${xs.length?state.grammarIndex+1:0}/${xs.length}</b></header>
     <section class="grammar-core-grid"><article><b>Quy tắc lõi</b><p>${esc(g.core||g.rule||'Chưa có quy tắc lõi.')}</p></article><article><b>Mẫu nhớ nhanh</b><p>${esc(g.pattern||'Hãy học qua câu mẫu thay vì bảng rời.')}</p></article><article><b>Ứng dụng Bauman</b><p>${esc(g.bauman||'Dùng trong lớp dự bị, ký túc xá, email, báo cáo lab và bảo vệ đề tài.')}</p></article></section>
     <section class="grammar-examples"><h4>Ví dụ sống</h4><div>${examples}</div></section>
     <section class="grammar-drill-grid"><article><h4>Luyện 5-10 phút</h4><ul>${practice}</ul></article><article><h4>Lỗi hay gặp</h4><ul>${mistakes}</ul></article></section>
     <footer class="grammar-footer"><div><b>Chuẩn qua bài</b><span>${esc(g.mastery||'Tự tạo câu mới và dùng được trong hội thoại thật.')}</span></div>${mapLinks?`<div class="grammar-map-links"><b>Mind map liên quan</b>${mapLinks}</div>`:''}</footer>
   </main></div>
 </div>`;
}
function mindMaps(){return arr(DB.mindmap)}
function currentMindMap(){const maps=mindMaps(); return maps.find(m=>m.id===state.mindmapId)||maps[0]||{branches:[]}}
function flattenMindNodes(map){
 const out=[];
 arr(map.branches).forEach(b=>{
  out.push({...b,_kind:'branch',_parent:null});
  arr(b.children).forEach(c=>out.push({...c,_kind:'child',_parent:b}));
 });
 return out;
}
function mindNodeText(n){return [n.title,n.summary,n.detail,arr(n.examples).join(' '),arr(n.practice).join(' ')].filter(Boolean).join(' ')}
function mindMapTypeClass(map){
 const t=lower(map.type||'map');
 if(t.includes('motion'))return 'mind-type-rootflow';
 if(t.includes('vocab'))return 'mind-type-network';
 if(t.includes('case'))return 'mind-type-case';
 if(t.includes('phonetic'))return 'mind-type-phonetic';
 if(t.includes('aspect'))return 'mind-type-aspect';
 if(t.includes('roadmap'))return 'mind-type-roadmap';
 return 'mind-type-radial';
}
function mindLayout(map){
 const n=arr(map.branches).length;
 const type=mindMapTypeClass(map);
 let h=690,hub={x:500,y:102};
 let pts=[];
 if(type==='mind-type-rootflow'){
  h=620; hub={x:118,y:312};
  const base=[{x:390,y:128},{x:640,y:312},{x:390,y:500},{x:790,y:156},{x:790,y:468}];
  pts=base.slice(0,n);
 }else if(type==='mind-type-network'){
  h=680; hub={x:500,y:328};
  const angles=n===5?[-90,-18,54,126,198]:Array.from({length:n},(_,i)=>-90+i*360/Math.max(1,n));
  pts=angles.map(a=>({x:500+330*Math.cos(a*Math.PI/180),y:328+225*Math.sin(a*Math.PI/180)}));
 }else if(type==='mind-type-roadmap'){
  h=720; hub={x:500,y:82};
  const base=[{x:220,y:210},{x:780,y:210},{x:220,y:392},{x:780,y:392},{x:500,y:585},{x:500,y:392}];
  pts=base.slice(0,n);
 }else if(type==='mind-type-case'){
  h=745; hub={x:500,y:86};
  const base=[{x:185,y:230},{x:500,y:230},{x:815,y:230},{x:185,y:520},{x:500,y:520},{x:815,y:520}];
  pts=base.slice(0,n);
 }else if(type==='mind-type-phonetic'){
  h=660; hub={x:500,y:92};
  const base=[{x:205,y:242},{x:795,y:242},{x:275,y:510},{x:725,y:510},{x:500,y:360}];
  pts=base.slice(0,n);
 }else if(type==='mind-type-aspect'){
  h=625; hub={x:500,y:102};
  const base=[{x:215,y:348},{x:785,y:348},{x:500,y:505},{x:500,y:260}];
  pts=base.slice(0,n);
 }else{
  h=690; hub={x:500,y:96};
  pts=Array.from({length:n},(_,i)=>({x:160+(680/(Math.max(1,n)-1||1))*i,y:i%2?430:250}));
 }
 return {type,h,hub,pts};
}
function mindPath(h,p,type){
 if(type==='mind-type-rootflow'){
  const mx=(h.x+p.x)/2;
  return `M ${h.x} ${h.y} C ${mx} ${h.y} ${mx} ${p.y} ${p.x} ${p.y}`;
 }
 if(type==='mind-type-network'){
  const dx=p.x-h.x,dy=p.y-h.y;
  return `M ${h.x} ${h.y} C ${h.x+dx*.35} ${h.y+dy*.08} ${h.x+dx*.74} ${h.y+dy*.92} ${p.x} ${p.y}`;
 }
 if(type==='mind-type-roadmap'){
  return `M ${h.x} ${h.y} C ${h.x} ${h.y+96} ${p.x} ${p.y-130} ${p.x} ${p.y}`;
 }
 return `M ${h.x} ${h.y} C ${h.x} ${h.y+120} ${p.x} ${p.y-120} ${p.x} ${p.y}`;
}
function mindAdamAngles(n){
 if(n<=1)return [0];
 if(n===2)return [0,180];
 if(n===3)return [-44,44,180];
 if(n===4)return [-46,46,134,226];
 if(n===5)return [-56,0,56,145,215];
 if(n===6)return [-58,0,58,122,180,238];
 const right=Math.ceil(n/2),left=n-right;
 const rightAngles=Array.from({length:right},(_,i)=>right===1?0:-58+i*(116/(right-1)));
 const leftAngles=Array.from({length:left},(_,i)=>left===1?180:122+i*(116/(left-1)));
 return [...rightAngles,...leftAngles];
}
function clampMind(v,min,max){return Math.max(min,Math.min(max,v));}
function normalizeMindFontSize(v){
 let n=Number(v);
 if(!Number.isFinite(n)||n<9)n=14;
 n=Math.round(n);
 return clampMind(n,9,40);
}
function mindAdamLayout(map,selected){
 const branches=arr(map.branches);
 const n=branches.length;
 const activeBranchId=(selected?._kind==='child'?selected._parent?.id:selected?.id)||branches[0]?.id||'';
 const activeKids=arr(branches.find(b=>b.id===activeBranchId)?.children);
 const visibleNodes=n+activeKids.length+1;
 const font=normalizeMindFontSize(state.mindmapFontScale);
 const density=visibleNodes<=10?'mind-density-few':(visibleNodes>=18?'mind-density-many':'mind-density-normal');
 const w=1200;
 const fontGrow=clampMind(Math.pow(font/14,.74),.82,2.15);
 const stagePad=44;
 const hubW=Math.round(clampMind(160*fontGrow,142,245));
 const hubH=Math.round(clampMind(118*fontGrow,106,210));
 const maxHalf=(w-hubW)/2-stagePad*2;
 const desiredBranchW=(density==='few'?232:density==='many'?190:212)*Math.pow(font/14,.42);
 const desiredLeafW=(density==='few'?214:density==='many'?174:196)*Math.pow(font/14,.42);
 const minGap=Math.round(clampMind(26+font*.7,34,72));
 let branchW=Math.round(clampMind(desiredBranchW,172,Math.min(310,maxHalf*.58)));
 let leafW=Math.round(clampMind(desiredLeafW,160,Math.min(292,maxHalf*.58)));
 if(branchW+leafW+minGap>maxHalf){
  const scale=clampMind((maxHalf-minGap)/(branchW+leafW),.64,1);
  branchW=Math.round(branchW*scale);
  leafW=Math.round(leafW*scale);
 }
 const charsPerLine=(width,extra=0)=>Math.max(8, Math.floor((width-30-extra)/(font*.56)));
 const nodeBody=(node)=>String(node.memory||node.remember||node.detail||node.summary||node.note||'');
 const textHeight=(node,width,kind)=>{
  const t=String(node.title||'');
  const body=nodeBody(node);
  const cpl=charsPerLine(width,kind==='branch'?42:6);
  const titleLines=Math.max(1,Math.ceil(t.length/cpl));
  const bodyLines=body?Math.max(1,Math.ceil(body.length/(cpl*1.18))):0;
  const hook=(node.memory||node.remember)?1:0;
  const pad=kind==='branch'?38:34;
  return Math.round(pad + titleLines*font*1.18 + bodyLines*Math.max(9,font*.66)*1.32 + hook*Math.max(15,font*.84));
 };
 const branchBase=density==='mind-density-many'?70:(density==='mind-density-few'?88:78);
 const leafBase=density==='mind-density-many'?68:(density==='mind-density-few'?84:76);
 const groupGap=Math.round(clampMind(30+fontGrow*16,38,78));
 const leafGap=Math.round(clampMind(13+font*.45,18,42));
 const left=[],right=[];
 branches.forEach((b,i)=>{
  const side=(n===1||i%2===0)?'right':'left';
  const kids=b.id===activeBranchId?activeKids:[];
  const bH=Math.max(branchBase*fontGrow,textHeight(b,branchW,'branch'));
  const leafHeights=kids.map(c=>Math.max(leafBase*fontGrow,textHeight(c,leafW,'leaf')));
  const kidsH=leafHeights.reduce((a,b)=>a+b,0)+Math.max(0,kids.length-1)*leafGap;
  const gH=Math.max(bH,kidsH)+14;
  (side==='right'?right:left).push({branch:b,index:i,kids,leafHeights,bH,gH,side});
 });
 if(!left.length&&right.length>1){left.push(right.pop());}
 if(!right.length&&left.length>1){right.push(left.pop());}
 const sideNeed=side=>side.reduce((sum,g)=>sum+g.gH,0)+Math.max(0,side.length-1)*groupGap;
 const requiredH=Math.max(sideNeed(left),sideNeed(right),hubH+160)+stagePad*2;
 const h=Math.round(clampMind(requiredH,720,1650));
 const hub={x:w/2,y:h/2};
 const innerGap=Math.round(clampMind(40+font*.9,50,86));
 const outerGap=Math.round(clampMind(24+font*.55,30,56));
 const rightMainX=clampMind(hub.x+hubW/2+innerGap+branchW/2,hub.x+branchW/2+70,w-branchW/2-stagePad);
 const leftMainX=clampMind(hub.x-hubW/2-innerGap-branchW/2,branchW/2+stagePad,hub.x-branchW/2-70);
 const rightLeafX=clampMind(rightMainX+branchW/2+outerGap+leafW/2,rightMainX+leafW/2+60,w-leafW/2-stagePad);
 const leftLeafX=clampMind(leftMainX-branchW/2-outerGap-leafW/2,leafW/2+stagePad,leftMainX-leafW/2-60);
 const pack=(sideItems)=>{
  const total=sideNeed(sideItems);
  let y=Math.max(stagePad,(h-total)/2);
  return sideItems.map(g=>{
   const center=y+g.gH/2;
   y+=g.gH+groupGap;
   const mainX=g.side==='right'?rightMainX:leftMainX;
   const leafX=g.side==='right'?rightLeafX:leftLeafX;
   const mainY=clampMind(center,g.bH/2+stagePad,h-g.bH/2-stagePad);
   let cursor=center-(g.leafHeights.reduce((a,b)=>a+b,0)+Math.max(0,g.leafHeights.length-1)*leafGap)/2;
   const leafs=g.kids.map((c,j)=>{
    const lh=g.leafHeights[j]||leafBase;
    const ly=clampMind(cursor+lh/2,lh/2+stagePad,h-lh/2-stagePad);
    cursor+=lh+leafGap;
    return {node:c,x:leafX,y:ly,index:j,w:leafW,h:lh};
   });
   return {branch:g.branch,index:g.index,angle:g.side==='right'?0:180,rad:g.side==='right'?0:Math.PI,x:mainX,y:mainY,leafs,side:g.side,groupHeight:g.gH,w:branchW,h:g.bH};
  });
 };
 const items=[...pack(right),...pack(left)].sort((a,b)=>a.index-b.index);
 return {w,h,hub,items,type:mindMapTypeClass(map),density,metrics:{branchW,leafW,hubW,hubH,branchH:branchBase,leafH:leafBase,activeBranchId,font}};
}
function mindDragMapId(){return (state.mindmapId||currentMindMap()?.id||'mindmap');}
function mindDragFor(key){
 const mapId=mindDragMapId();
 const d=state.mindmapDrag&&state.mindmapDrag[mapId]&&state.mindmapDrag[mapId][key];
 return d&&Number.isFinite(Number(d.x))&&Number.isFinite(Number(d.y))?{x:Number(d.x)||0,y:Number(d.y)||0}:{x:0,y:0};
}
function mindDragAttrs(key){const d=mindDragFor(key); return `data-drag-x="${Math.round(d.x)}" data-drag-y="${Math.round(d.y)}"`;}
function mindNodeStyle(x,y,layout,delay,key,w,h){
 const xp=(x/layout.w*100).toFixed(3)+'%';
 const yp=(y/layout.h*100).toFixed(3)+'%';
 const d=key?mindDragFor(key):{x:0,y:0};
 const dims=(w?`--node-w:${Math.round(w)}px;`:``)+(h?`--node-min-h:${Math.round(h)}px;`:``);
 return `--x:${Math.round(x)}px;--y:${Math.round(y)}px;--x-pct:${xp};--y-pct:${yp};--drag-x:${Math.round(d.x)}px;--drag-y:${Math.round(d.y)}px;--delay:${delay};${dims}`;
}
function mindCurve(a,b,soft=0.38){
 const dx=b.x-a.x,dy=b.y-a.y;
 return `M ${a.x} ${a.y} C ${a.x+dx*soft} ${a.y+dy*.08} ${b.x-dx*soft} ${b.y-dy*.08} ${b.x} ${b.y}`;
}
function renderMindAdamConnectors(layout,selected){
 const parentId=selected?._kind==='child'?selected._parent?.id:selected?.id;
 const selectedId=selected?.id||'';
 const main=layout.items.map(item=>{
  const active=parentId===item.branch.id;
  const branchId=item.branch.id;
  const leafLines=item.leafs.map(l=>`<path class="mind-adam-leaf-line ${selectedId===l.node.id?'active':''}" data-mind-line="1" data-from="${esc(branchId)}" data-to="${esc(l.node.id)}" data-soft=".44" d="${mindCurve({x:item.x,y:item.y},l,.44)}"></path><circle class="mind-adam-leaf-dot ${selectedId===l.node.id?'active':''}" data-mind-dot="1" data-for="${esc(l.node.id)}" cx="${l.x}" cy="${l.y}" r="4"></circle>`).join('');
  return `<g class="mind-adam-branch-line ${active?'active':''} palette-${item.index%8}"><path data-mind-line="1" data-from="__hub" data-to="${esc(branchId)}" data-soft=".34" d="${mindCurve(layout.hub,{x:item.x,y:item.y},.34)}"></path><circle data-mind-dot="1" data-for="${esc(branchId)}" cx="${item.x}" cy="${item.y}" r="6"></circle>${leafLines}</g>`;
 }).join('');
 return `<svg class="mind-adam-connectors" viewBox="0 0 ${layout.w} ${layout.h}" preserveAspectRatio="none" aria-hidden="true">${main}</svg>`;
}
function mindMemoryCue(node,idx,parent){
 const hay=lower([node.title,node.detail,node.summary,parent?.title].filter(Boolean).join(' '));
 if(/âm|nguyên âm|phụ âm|trọng âm|stress|phon/.test(hay))return 'nghe → nhại → gõ nhịp';
 if(/cách|đuôi|biến cách|род|вин|дат|твор|пред/.test(hay))return 'lọc ý nghĩa → nói ví dụ';
 if(/động từ|tiền tố|идти|ехать|при|вы|пере/.test(hay))return 'kéo tiền tố → nhìn hướng';
 if(/нсв|св|thể|hoàn thành|aspect/.test(hay))return 'so cặp → đổi kết quả';
 if(/từ vựng|ký túc|visa|lab|campus|дом/.test(hay))return 'nối cụm → đặt câu';
 const cues=['nhìn nhánh → đọc to','nối ví dụ → tự nói','vẽ lại 20 giây','đổi màu → nhớ ý','chạm node → kể lại'];
 return cues[idx%cues.length];
}
function renderMindAdamNodeText(node,limit=72){
 return esc(node.memory||node.remember||node.detail||node.summary||node.note||'');
}
function mindMemoryHook(node){
 const hook=node?.memory||node?.remember||node?.mnemonic||'';
 return hook?`<em class="mind-node-memory">${esc(hook)}</em>`:'';
}
function renderMindAdamBranch(item,selected,layout){
 const b=item.branch;
 const active=(selected?._kind==='child'?selected._parent?.id:selected?.id)===b.id;
 return `<button class="mind-adam-main-node ${active?'active':''} palette-${item.index%8}" data-mindmap-drag="1" data-mindmap-node="${esc(b.id)}" data-node-key="${esc(b.id)}" data-base-x="${Math.round(item.x)}" data-base-y="${Math.round(item.y)}" ${mindDragAttrs(b.id)} style="${mindNodeStyle(item.x,item.y,layout,(item.index*.07).toFixed(2)+'s',b.id,item.w,item.h)}">
  <span class="mind-adam-icon">${esc(b.icon||'✦')}</span><b>${esc(b.title||'Nhánh')}</b><small>${esc(b.summary||'')}</small>${mindMemoryHook(b)}
 </button>`;
}
function renderMindAdamLeaf(item,leaf,selected,layout){
 const c=leaf.node;
 const active=selected?.id===c.id;
 return `<button class="mind-adam-child-node ${active?'active':''} palette-${item.index%8}" data-mindmap-drag="1" data-mindmap-node="${esc(c.id)}" data-node-key="${esc(c.id)}" data-base-x="${Math.round(leaf.x)}" data-base-y="${Math.round(leaf.y)}" ${mindDragAttrs(c.id)} style="${mindNodeStyle(leaf.x,leaf.y,layout,((item.index+leaf.index)*.09).toFixed(2)+'s',c.id,leaf.w,leaf.h)}">
   <span class="node-spark" aria-hidden="true">✦</span><b>${esc(c.title||'Node con')}</b><small>${renderMindAdamNodeText(c,66)}</small>${mindMemoryHook(c)}
 </button>`;
}
function renderMindInlineFocus(selected,map){
 if(!selected)return '';
 const examples=arr(selected.examples).slice(0,4).map(x=>typeof x==='string'?x:(x.ru?`${x.ru}${x.vi?' · '+x.vi:''}`:(x.text||''))).filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join('');
 const subpoints=arr(selected.subpoints).slice(0,6).map(x=>`<li>${esc(x)}</li>`).join('');
 const practice=arr(selected.practice).slice(0,4).map(x=>`<li>${esc(x)}</li>`).join('');
 const memory=selected.memory||selected.remember||selected.mnemonic||'';
 const parent=selected._kind==='child'&&selected._parent?`<span>Nhánh mẹ: ${esc(selected._parent.title)}</span>`:'<span>Nhánh chính</span>';
 return `<article class="mind-inline-focus mind-inline-focus-v1332"><div>${parent}<b>${esc(selected.title||map.title)}</b>${memory?`<strong class="mind-memory-focus">Neo nhớ: ${esc(memory)}</strong>`:''}<p>${esc(selected.detail||selected.summary||map.subtitle||'')}</p></div>${examples||subpoints||practice?`<section>${subpoints?`<ul>${subpoints}</ul>`:''}${examples?`<ul>${examples}</ul>`:''}${practice?`<ol>${practice}</ol>`:''}</section>`:''}</article>`;
}
function renderMindmap(){
 const maps=mindMaps();
 if(!maps.length)return `<section class="panel learning-recovery-card"><span class="chip warn-chip">MIND MAP</span><h3>Chưa có dữ liệu mindmap.json</h3><p>Hãy kiểm tra tab Lưu trữ hoặc khôi phục nguồn dữ liệu.</p></section>`;
 const map=currentMindMap();
 const nodes=flattenMindNodes(map);
 if(!state.mindmapNode || !nodes.some(n=>n.id===state.mindmapNode))state.mindmapNode=arr(map.branches)[0]?.id||'';
 const selected=nodes.find(n=>n.id===state.mindmapNode)||nodes[0];
 const layout=mindAdamLayout(map,selected);
 const parentId=selected?._kind==='child'?selected._parent?.id:selected?.id;
 const branchNodes=layout.items.map(item=>renderMindAdamBranch(item,selected,layout)).join('');
 const childNodes=layout.items.flatMap(item=>item.leafs.map(leaf=>renderMindAdamLeaf(item,leaf,selected,layout))).join('');
 const fontSize=normalizeMindFontSize(state.mindmapFontScale);
 const fontVars=`--mind-font-size:${fontSize};--mind-main-title:${fontSize}px;--mind-main-small:${Math.max(9,Math.round(fontSize*.78))}px;--mind-child-title:${Math.max(9,Math.round(fontSize*.9))}px;--mind-child-small:${Math.max(8,Math.round(fontSize*.72))}px;--mind-cue:${Math.max(8,Math.round(fontSize*.68))}px;--mind-branch-w:${layout.metrics.branchW}px;--mind-leaf-w:${layout.metrics.leafW}px;--mind-hub-w:${layout.metrics.hubW}px;--mind-hub-h:${layout.metrics.hubH}px;`;
 return `<div class="mindmap-luxe-shell mindmap-v1326"><section class="panel mindmap-hero mindmap-hero-v1326"><div><span class="chip">MIND MAP LỘ TRÌNH · NHÁNH SÂU</span><h3>${esc(map.title)}</h3><p>${esc(map.subtitle||'')}</p></div><div class="mindmap-switch"><select class="input" data-input="mindmapId">${maps.map(m=>`<option value="${esc(m.id)}" ${m.id===map.id?'selected':''}>${esc(m.title)}</option>`).join('')}</select></div></section>
   <div class="mindmap-smart-toolbar">
    <button class="btn ghost mindmap-refresh-btn" data-mindmap-reset="1">↻ Sắp xếp lại</button>
    <span class="mindmap-tool-label">Cỡ chữ node</span>
    <button class="btn ghost" data-mindmap-font="down" title="Giảm 1 size, tối thiểu 9">A−</button>
    <button class="btn ghost mindmap-font-reset" data-mindmap-font="reset" title="Đưa về size chuẩn 14">A</button>
    <button class="btn ghost" data-mindmap-font="up" title="Tăng 1 size, tối đa 40">A+</button>
    <span class="mindmap-font-value">Size ${fontSize}</span>
   </div>
   <main class="panel mindmap-canvas mindmap-canvas-v1326 mindmap-font-dynamic ${layout.type} ${layout.density}" style="--mind-stage-h:${layout.h}px;--mind-stage-w:${layout.w}px;${fontVars}" data-mindmap-canvas="1">
    <div class="mind-stage mind-stage-v1326">
     ${renderMindAdamConnectors(layout,selected)}
     <button class="mind-adam-hub" data-mindmap-node="${esc(parentId||arr(map.branches)[0]?.id||'')}" data-node-key="__hub" data-base-x="${Math.round(layout.hub.x)}" data-base-y="${Math.round(layout.hub.y)}" style="${mindNodeStyle(layout.hub.x,layout.hub.y,layout,'0s','__hub')}"><span>🧠</span><b>${esc(map.type||'Russian map')}</b><small>${arr(map.branches).length} nhánh chính · ${nodes.length} điểm nhớ</small><i></i></button>
     ${branchNodes}${childNodes}
    </div>
   </main>
   ${renderMindInlineFocus(selected,map)}
 </div>`;
}
function mediaSmartCategory(m){
 const raw=str(A.mediaCategory?.(m)||m?.category||m?.genre||'');
 const hay=lower([raw,m?.title,m?.purpose,m?.stage].filter(Boolean).join(' '));
 if(/алфавит|alphabet|bảng chữ|произношение/.test(hay))return 'Nghe nhập môn';
 if(/shadow|phát âm|pronunciation|trọng âm/.test(hay))return 'Phát âm & Shadowing';
 if(/общежитие|ký túc|lớp|магазин|аптека|sống còn/.test(hay))return 'Tình huống lớp/ký túc';
 if(/stankin|dự bị|подготов/.test(hay))return 'Dự bị/STANKIN';
 if(/лекция|конспект|lecture|ghi chép/.test(hay))return 'Lecture & ghi chép';
 if(/граф|biểu đồ|dữ liệu|описание|chart/.test(hay))return 'Mô tả dữ liệu';
 if(/email|письмо|giáo viên/.test(hay))return 'Email & học thuật';
 if(/нир|вкр|исслед|науч|research/.test(hay))return 'NIR/VKR Bauman';
 if(/защит|диплом|luận văn|thesis/.test(hay))return 'Bảo vệ luận văn';
 if(/b2|c1|повтор/.test(hay))return 'Ôn nghe nâng cao';
 const legacy={'mô phỏng':'Nghe nhập môn','hướng dẫn':'Phát âm & Shadowing','quy luật':'Mẫu câu nghe-nói','ứng dụng':'Tình huống lớp/ký túc'};
 return legacy[lower(raw)]||raw||'Video học tập';
}
function mediaCategoryLabel(m){return mediaSmartCategory(m)}
function mediaTitle(m){return m?.title||m?.name||m?.id||'Nguồn Video/Audio'}
function mediaPurpose(m){return m?.purpose||m?.summary||m?.description||'Xem/nghe để mở tai, ghi lại từ khóa và nói lại một câu ngắn.'}
function mediaUrl(m){return m?.url||m?.link||m?.href||''}
function mediaEmbed(m){
 const raw=str(m?.iframe||m?.embed||'').trim();
 if(raw.includes('<iframe')){const mm=raw.match(/src=["']([^"']+)/i); return mm?mm[1]:'';}
 if(raw)return raw;
 const url=mediaUrl(m);
 const yt=url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
 if(yt)return `https://www.youtube.com/embed/${yt[1]}`;
 return '';
}
function mediaIcon(m){const hay=lower([mediaTitle(m),mediaCategoryLabel(m),mediaPurpose(m)].join(' ')); if(/audio|nghe|pronunciation|phát âm/.test(hay))return '🎧'; if(/phim|movie|film/.test(hay))return '🎬'; if(/hoạt hình|cartoon|мульт/.test(hay))return '🧸'; if(/bài học|lesson|алфавит|grammar|урок/.test(hay))return '📘'; if(/hài|comedy|юмор/.test(hay))return '😄'; return '▶️'}
function defaultMediaGroups(){return ['Nghe nhập môn','Phát âm & Shadowing','Tình huống lớp/ký túc','Dự bị/STANKIN','Hội thoại học thuật','Lecture & ghi chép','Email & học thuật','Mô tả dữ liệu','NIR/VKR Bauman','Bảo vệ luận văn','Ôn nghe nâng cao','Video học tập']}
function getMediaGroups(){
 const all=byStage(call('getMedia',[],DB));
 const custom=arr(DB.videoGroups).map(x=>str(x).trim()).filter(Boolean);
 const fromData=uniq(all.map(mediaCategoryLabel).map(x=>str(x).trim()).filter(Boolean));
 return uniq([...custom,...fromData,...defaultMediaGroups()]);
}
function saveMediaGroups(groups){DB.videoGroups=uniq(arr(groups).map(x=>str(x).trim()).filter(Boolean)); saveDB();}
function addMediaGroup(name){const n=str(name).trim(); if(!n){toast('Nhập tên nhóm trước'); return false} const groups=getMediaGroups(); if(groups.includes(n)){toast('Nhóm đã tồn tại'); return false} saveMediaGroups([n,...arr(DB.videoGroups||[])]); return true;}
function renameMediaGroup(oldName,newName){
 const old=str(oldName).trim(), n=str(newName).trim(); if(!old||!n){toast('Tên nhóm không hợp lệ'); return false} if(old===n)return true;
 const groups=getMediaGroups().map(g=>g===old?n:g); saveMediaGroups(groups);
 arr(DB.videos).forEach(m=>{if(mediaCategoryLabel(m)===old||m.category===old||m.genre===old){m.category=n;m.genre=n;m.editableSource=true;}});
 saveDB(); if(state.mediaCat===old)state.mediaCat=n; save(); return true;
}
function deleteMediaGroup(group){
 const g=str(group).trim(); if(!g)return false; const fallback='Video học tập';
 saveMediaGroups(getMediaGroups().filter(x=>x!==g));
 arr(DB.videos).forEach(m=>{if(mediaCategoryLabel(m)===g||m.category===g||m.genre===g){m.category=fallback;m.genre=fallback;m.editableSource=true;}});
 saveDB(); if(state.mediaCat===g)state.mediaCat='all'; save(); return true;
}
function renderMediaGroupManager(){
 const groups=getMediaGroups();
 return `<div class="modal-body media-group-manager"><div class="toolbar compact-toolbar"><div><span class="chip">NHÓM VIDEO/AUDIO</span><h3>Thêm, sửa, xóa nhóm học</h3><p>Nhóm dùng để lọc Video/Audio. Khi xóa nhóm, các video trong nhóm đó sẽ chuyển về “Video học tập”.</p></div></div><div class="media-group-add"><input class="input" id="mgNew" placeholder="Tên nhóm mới, ví dụ: Podcast luyện tai"><button class="btn primary" data-act="media-group-add">+ Thêm nhóm</button></div><div class="media-group-list">${groups.map((g,i)=>`<article><input class="input" id="mgName${i}" value="${esc(g)}"><div><button class="btn" data-act="media-group-rename" data-group="${esc(g)}" data-idx="${i}">Lưu tên</button><button class="btn danger" data-act="media-group-delete" data-group="${esc(g)}">Xóa</button></div></article>`).join('')}</div><div class="modal-actions"><button class="btn" data-act="modal-close">Đóng</button></div></div>`
}
function renderMedia(){
 const cats=getMediaGroups();
 const list=getMedia();
 if(!state.mediaId&&list[0])state.mediaId=list[0].id||list[0].title;
 let active=list.find(x=>(x.id||x.title)===state.mediaId)||list[0]||{};
 const embed=mediaEmbed(active), url=mediaUrl(active);
 const activeTitle=mediaTitle(active)||'Chọn nguồn video/audio';
 const activePurpose=mediaPurpose(active)||'Nghe ngắn, nhại ngay, rồi chuyển sang đối thoại.';
 const cat=mediaCategoryLabel(active);
 const tasks=[
  ['01','Nghe','Bắt nhịp và âm chính.'],
  ['02','Nhại','Lặp 3-5 câu ngắn.'],
  ['03','Nói lại','Chuyển sang đối thoại.']
 ];
 const openButton=url?`<a class="btn" href="${esc(url)}" target="_blank" rel="noopener">Mở ngoài</a>`:`<button class="btn disabled" disabled>Mở ngoài</button>`;
 const player=embed?`<iframe src="${esc(embed)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`:`<div class="media-empty-player v1256-empty-player"><b>${mediaIcon(active)}</b><h3>${esc(activeTitle)}</h3><p>${esc(url?'Nguồn này nên mở ngoài, sau đó quay lại nói lại.':'Chưa có iframe. Bấm “Sửa nguồn” để thêm link nhúng.')}</p></div>`;
 return `<div class="media-hub step54-media-hub v1256-media-hub">
   <div class="media-layout step54-media-layout v1256-media-layout">
     <aside class="panel media-side step54-media-side v1256-media-side">
       <div class="v1256-side-head"><span class="chip">Phụ lục</span><h3>Video/Audio</h3><p>Chọn nguồn bên trái, xem/nghe ở khung lớn bên phải.</p></div>
       <div class="media-filter-bar step54-media-filter v1256-media-filter"><select class="input" data-input="mediaCat"><option value="all">Tất cả nhóm học</option>${cats.map(c=>`<option value="${esc(c)}" ${state.mediaCat===c?'selected':''}>${esc(c)}</option>`).join('')}</select><input class="input" data-input="mediaQuery" value="${esc(state.mediaQuery||'')}" placeholder="Tìm video/audio..."></div>
       <div class="media-list step54-media-list v1256-media-list">${list.map(m=>`<button class="media-tile step54-media-tile v1256-media-tile ${(active===m)?'active':''}" data-media="${esc(m.id||m.title)}"><div class="thumb media-art"><span>${mediaIcon(m)}</span></div><div><b>${esc(clip(mediaTitle(m),60))}</b><small>${esc(mediaCategoryLabel(m))}</small></div></button>`).join('')||'<div class="note">Chưa có video/audio phù hợp.</div>'}</div>
     </aside>
     <main class="panel media-main step54-media-main v1256-media-main">
       <header class="v1256-media-topbar">
         <div><span class="chip">${esc(cat)}</span><h3>${esc(activeTitle)}</h3><p>${esc(activePurpose)}</p></div>
         <div class="step54-media-actions v1256-media-actions">${openButton}<button class="btn" data-act="media-edit" data-media-edit="${esc(active.id||active.title||'')}">Sửa nguồn</button><button class="btn primary" data-route='${esc(JSON.stringify({view:'dialogue'}))}'>Nghe xong nói lại</button></div>
       </header>
       <section class="step54-player-card v1256-player-card"><div class="step54-player v1256-player">${player}</div></section>
       <section class="step54-listening-plan v1256-listening-plan">${tasks.map(t=>`<article><i>${t[0]}</i><b>${esc(t[1])}</b><span>${esc(t[2])}</span></article>`).join('')}</section>
     </main>
   </div>
 </div>`
}


function storageGroups(){return [
 ['Tổng quan','🧭',['curriculum','knowledge-index']],
 ['Học tập','🎓',['lessons','grammar','exercises','simulations']],
 ['Từ vựng','🗂️',['vocab','mindmap']],
 ['Ngữ pháp','🧩',['grammar','grammar-path','mindmap']],
 ['Mind map','🧠',['mindmap','knowledge-index']],
 ['Đối thoại','💬',['dialogue-bauman-az','deep-speaking-bauman','speaking-link-index']],
 ['Viết','✍️',['handwriting','writing']],
 ['Video/Audio','🎬',['videos']],
 ['Kiểm tra','🧪',['tests','exercises']]
];}
function dataSourceMeta(name){return A.getDataSourceMeta?A.getDataSourceMeta(name):(A.dataSourceMeta&&A.dataSourceMeta[name])||{};}
function sourceLabel(name){return dataSourceMeta(name)?.label||({
 curriculum:'Lộ trình & giai đoạn',lessons:'Bài học',grammar:'Ngữ pháp gốc','grammar-path':'Ngữ pháp chuyên sâu',vocab:'Từ vựng',mindmap:'Mind map ôn tập',exercises:'Bài tập',tests:'Kiểm tra',simulations:'Mô phỏng / nghe nói',speaking:'Nghe/Nói cơ bản','dialogue-bauman-az':'Đối thoại Bauman A-Z','deep-speaking-bauman':'Luyện nói sâu Bauman','speaking-link-index':'Cầu nối Đối thoại - Deep',handwriting:'Mẫu chữ',writing:'Nhiệm vụ viết',videos:'Video / Audio','knowledge-index':'Chỉ mục kiến thức'
})[name]||name;}
function sourceIcon(name){return ({curriculum:'🧭',lessons:'📘',grammar:'🧩','grammar-path':'🧬',vocab:'🗃️',mindmap:'🧠',exercises:'📝',tests:'🧪',simulations:'🎙️',speaking:'🎧','dialogue-bauman-az':'💬','deep-speaking-bauman':'🎙️','speaking-link-index':'🔗',handwriting:'✍️',writing:'📄',videos:'🎬','knowledge-index':'🔎'})[name]||'📦';}
function sourceFilePath(name){const meta=dataSourceMeta(name); return meta?.path||optionalSourcePath(name)||`${DATA_ROOT}${name}.json`; }
function sourceOrigin(name){const meta=dataSourceMeta(name); return meta?.group||'Local data'; }
function sourcePlannedCount(name){const meta=dataSourceMeta(name); return Number(meta?.plannedCount||meta?.count||0)||0;}
function sourceDescription(name){const meta=dataSourceMeta(name); return meta?.description||meta?.role||'';}
function sourceCount(name,data){
 if(Array.isArray(data))return data.length;
 if(name==='tests'&&Array.isArray(data?.questions))return data.questions.length;
 if(name==='curriculum'&&data&&typeof data==='object')return arr(data.stages).length+arr(data.modules).length;
 if(data&&typeof data==='object')return Object.keys(data).length;
 return sourcePlannedCount(name);
}
function sourceLoadedCount(name,data){
 if(Array.isArray(data))return data.length;
 if(name==='tests'&&Array.isArray(data?.questions))return data.questions.length;
 if(name==='curriculum'&&data&&typeof data==='object')return arr(data.stages).length+arr(data.modules).length;
 if(data&&typeof data==='object')return Object.keys(data).length;
 return 0;
}
function sourceKind(name,data){
 const meta=dataSourceMeta(name);
 if(meta?.kind)return meta.kind;
 if(Array.isArray(data))return 'Danh sách bản ghi';
 if(name==='tests'&&Array.isArray(data?.questions))return 'Ngân hàng câu hỏi';
 if(name==='curriculum')return 'Cây giai đoạn và module';
 if(data&&typeof data==='object')return 'Đối tượng JSON';
 if(isOptionalFile(name))return 'Nguồn mở rộng lazy-load';
 return 'Chưa có dữ liệu';
}
function sourceStatus(name,data){
 const c=sourceCount(name,data);
 if(isOptionalFile(name)&&state.optionalDataLoading?.[name])return ['Đang tải · lazy','warn'];
 if(isOptionalFile(name)&&state.optionalDataError?.[name])return ['Lỗi tải nguồn','danger'];
 if(!data&&isOptionalFile(name))return ['Chưa tải · tùy chọn','warn'];
 if(!data)return ['Thiếu nguồn','danger'];
 if(!c)return ['Rỗng','warn'];
 if(name==='tests'&&(!data.questions||!Array.isArray(data.questions)))return ['Cần kiểm tra','warn'];
 return ['Ổn định','ok'];
}
function storageSummary(name,data){return {count:sourceCount(name,data),kind:sourceKind(name,data),status:sourceStatus(name,data)[0]};}
function recordTitle(source,item,i){
 if(item==null)return 'Mục '+(i+1);
 if(typeof item!=='object')return clip(str(item),80)||('Mục '+(i+1));
 return item.title||item.context_title_vi||item.ruTitle||item.title_ru||item.front||item.phrase_ru||item.ru||item.question||item.prompt||item.prompt_vi||item.print||item.cursive||item.id||item._key||('Mục '+(i+1));
}
function recordSub(source,item){
 if(!item||typeof item!=='object')return sourceLabel(source);
 const stage=item.stage?stageTitle(item.stage):'';
 const bits=[item._storagePathLabel||'',stage,item.level||item.difficulty||item.difficulty_id||'',item.group||item.category||item.mode||item.type||'',item.lessonId||''].filter(Boolean);
 return bits.join(' · ')||sourceKind(source,DB[source]);
}
function recordBody(source,item){
 if(!item||typeof item!=='object')return clip(str(item),160);
 return clip(item.summary||item.purpose||item.rule||item.focus||item.meaning_ru||item.clue_en||item.vi||item.prompt||item.prompt_vi||item.model_vi||item.sourceStatus||item.note||item.explanation||'',180);
}
function recordSearchText(source,item){return lower([source,sourceLabel(source),recordTitle(source,item,0),recordSub(source,item),recordBody(source,item),JSON.stringify(item||'')].join(' '));}
function storageRecords(source,data){
 if(Array.isArray(data))return data.map((item,index)=>({item,index,path:'root',pathLabel:sourceLabel(source)}));
 if(source==='tests'&&data&&Array.isArray(data.questions))return data.questions.map((item,index)=>({item,index,path:'questions',pathLabel:'questions[]'}));
 if(source==='curriculum'&&data&&typeof data==='object'){
  const out=[];
  arr(data.stages).forEach((item,index)=>out.push({item:{...item,_storagePath:'stages',_storagePathLabel:'Giai đoạn'},index,path:'stages',pathLabel:'stages[]'}));
  arr(data.modules).forEach((item,index)=>out.push({item:{...item,_storagePath:'modules',_storagePathLabel:'Module'},index,path:'modules',pathLabel:'modules[]'}));
  return out;
 }
 if(data&&typeof data==='object')return Object.entries(data).map(([k,v],index)=>({item:(v&&typeof v==='object')?{_key:k,...v}:{_key:k,value:v},index,path:k,pathLabel:k}));
 return [];
}

function storageSourceCardButton(f,active){
 const data=DB[f];
 const st=sourceStatus(f,data);
 const planned=sourcePlannedCount(f);
 const loaded=sourceLoadedCount(f,data);
 const countText=(!data&&isOptionalFile(f)&&planned)?`dự kiến ${planned} mục`:`${sourceCount(f,data)} mục`;
 const desc=sourceDescription(f)||sourceKind(f,data);
 const lazy=(!data&&isOptionalFile(f));
 return `<button class="storage-source-card ${active?'active':''} ${isOptionalFile(f)?'optional-source':''}" data-storage="${esc(f)}">
   <span class="source-card-icon">${sourceIcon(f)}</span>
   <span class="source-card-body"><b>${esc(sourceLabel(f))}</b><small>${esc(f)}.json · ${esc(sourceFilePath(f))}</small><em>${esc(desc)}</em></span>
   <span class="source-card-status"><i class="${esc(st[1])}">${esc(st[0])}</i><strong>${esc(countText)}</strong>${lazy?'<u>lazy-load</u>':''}</span>
 </button>`;
}
function storageSourceCardScroll(){
 const files=ALL_STORAGE_FILES;
 const q=lower(state.storageQuery||'');
 const groups=storageGroups().map(([label,icon,items])=>{
  const visible=items.filter(f=>files.includes(f)).filter(f=>{
   const metaText=lower([f,sourceLabel(f),sourceKind(f,DB[f]),sourceDescription(f),sourceFilePath(f),sourceOrigin(f)].join(' '));
   return !q||metaText.includes(q)||storageRecords(f,DB[f]).some(r=>recordSearchText(f,r.item).includes(q));
  });
  if(!visible.length)return '';
  const planned=visible.reduce((sum,f)=>sum+sourceCount(f,DB[f]),0);
  return `<section class="storage-source-group-card"><header><span>${icon}</span><b>${esc(label)}</b><em>${planned} mục</em></header><div class="storage-source-grid">${visible.map(f=>storageSourceCardButton(f,state.storageFile===f)).join('')}</div></section>`;
 }).join('');
 return groups||'<article class="storage-empty"><b>Không tìm thấy nguồn dữ liệu</b><span>Xóa từ khóa hoặc tìm bằng tên file, chức năng, stage, nội dung.</span></article>';
}

function storageTreeFileButton(f,active){
 const data=DB[f]; const meta=storageSummary(f,data); const st=sourceStatus(f,data); const planned=sourcePlannedCount(f); const loaded=sourceLoadedCount(f,data);
 const countText=(!data&&isOptionalFile(f)&&planned)?`dự kiến ${planned} mục`:`${meta.count} mục`;
 const desc=sourceDescription(f);
 const lazy=(!data&&isOptionalFile(f))?' · lazy-load':'';
 return `<button class="storage-tree-file ${active?'active':''} ${isOptionalFile(f)?'optional-source':''}" data-storage="${esc(f)}"><span class="file-ico">${sourceIcon(f)}</span><span><b>${esc(sourceLabel(f))}</b><small>${esc(sourceFilePath(f))} · ${countText} · ${esc(st[0])}${lazy}</small>${desc?`<em>${esc(desc)}</em>`:''}</span></button>`;
}
function storageTree(){
 const files=ALL_STORAGE_FILES;
 const q=lower(state.storageQuery||'');
 return storageGroups().map(([label,icon,items],gi)=>{
  const visible=items.filter(f=>files.includes(f)).filter(f=>{
   const metaText=lower([f,sourceLabel(f),sourceKind(f,DB[f]),sourceDescription(f),sourceFilePath(f),sourceOrigin(f)].join(' '));
   return !q||metaText.includes(q)||storageRecords(f,DB[f]).some(r=>recordSearchText(f,r.item).includes(q));
  });
  if(!visible.length)return '';
  const total=visible.reduce((sum,f)=>sum+sourceCount(f,DB[f]),0);
  return `<details class="storage-folder" open><summary><span>${icon}</span><b>${esc(label)}</b><em>${total}</em></summary><div class="storage-folder-files">${visible.map(f=>storageTreeFileButton(f,state.storageFile===f)).join('')}</div></details>`;
 }).join('')||'<article class="storage-empty"><b>Không tìm thấy nguồn</b><span>Thử gõ từ khóa rộng hơn hoặc xóa bộ lọc.</span></article>';
}
function storageQuickStats(){
 const totalFiles=ALL_STORAGE_FILES.length;
 const loadedItems=ALL_STORAGE_FILES.reduce((s,f)=>s+sourceLoadedCount(f,DB[f]),0);
 const plannedItems=ALL_STORAGE_FILES.reduce((s,f)=>s+sourceCount(f,DB[f]),0);
 const missing=ALL_STORAGE_FILES.filter(f=>!DB[f]&&!isOptionalFile(f)).length;
 const lazyCount=OPTIONAL_DATA_FILES.filter(f=>!DB[f]).length;
 return `<div class="storage-vault-stats"><article><b>${totalFiles}</b><span>nguồn</span></article><article><b>${loadedItems}</b><span>đã nạp</span></article><article><b>${plannedItems}</b><span>theo kế hoạch</span></article><article class="${missing?'warn':'ok'}"><b>${missing}</b><span>cần xem</span></article><article class="${lazyCount?'warn':'ok'}"><b>${lazyCount}</b><span>lazy</span></article></div>`;
}
function storagePreview(name,data){
 if(isOptionalFile(name)&&!data){
  const planned=sourcePlannedCount(name); const desc=sourceDescription(name);
  return renderOptionalDataGate(name,sourceLabel(name),`${desc||'Nguồn này là dữ liệu lớn cho tab Đối thoại/Luyện sâu.'}${planned?` Theo kế hoạch có ${planned} mục.`:''} Bấm tải khi cần xem/chỉnh sửa, app không tải sẵn để giữ nhẹ.`);
 }
 const records=storageRecords(name,data);
 const q=lower(state.storageQuery||'');
 const filtered=records.filter(r=>!q||recordSearchText(name,r.item).includes(q));
 const limit=Math.max(0,Number(state.storagePreviewLimit)||0);
 const shown=filtered.slice(0,limit);
 const status=sourceStatus(name,data);
 const cards=shown.map((r,i)=>`<article class="storage-record-card"><div class="record-top"><span>${esc(r.pathLabel||sourceLabel(name))}</span><button class="btn mini" data-storage-edit="${r.index}" data-storage-path="${esc(r.path)}">Sửa</button></div><b>${esc(recordTitle(name,r.item,r.index))}</b><p>${esc(recordBody(name,r.item)||'Bản ghi có dữ liệu cấu trúc, bấm Sửa để xem/chỉnh JSON gọn.')}</p><small>${esc(recordSub(name,r.item))}</small></article>`).join('');
 const emptyCard=limit===0
  ? `<article class="storage-empty storage-preview-collapsed"><b>Đang ẩn bản ghi để bảng gọn hơn</b><span>Bấm Xem thêm để mở danh sách ${esc(sourceLabel(name))}. Khi xem xong, bấm Ẩn bớt để thu lại.</span></article>`
  : '<article class="storage-empty"><b>Chưa có bản ghi phù hợp</b><span>Kiểm tra file JSON hoặc đổi từ khóa tìm kiếm.</span></article>';
 return `<section class="storage-vault-preview v1263-data-preview"><header class="preview-vault-head"><div><span class="chip ${status[1]==='danger'?'warn-chip':''}">${esc(status[0])}</span><h3>${sourceIcon(name)} ${esc(sourceLabel(name))}</h3><p>${esc(sourceKind(name,data))} · nguồn local ${esc(sourceFilePath(name))} · đang hiển thị ${shown.length}/${filtered.length} mục${q?' theo tìm kiếm':''}.</p></div><div class="preview-tools"><input class="input" data-input="storageQuery" value="${esc(state.storageQuery||'')}" placeholder="Tìm trong kho: bài, từ, hội thoại, video..."><div class="preview-toggle-row"><button class="btn" data-act="storage-more">Xem thêm</button><button class="btn soft" data-act="storage-less" ${limit===0?'disabled':''}>Ẩn bớt</button></div></div></header><div class="storage-record-grid clean-scroll v1263-record-grid ${limit===0?'preview-collapsed-grid':''}">${cards||emptyCard}</div></section>`;
}
function storageSkeleton(source){
 const stage=state.stage==='all'?'vn':state.stage;
 const id=source+'_'+Date.now();
 const map={
  lessons:{id,stage,title:'Bài học mới',summary:'Mục tiêu học rõ ràng',slides:[{title:'Ý chính',body:'Nội dung bài học'}],tags:['custom']},
  grammar:{id,stage,title:'Mẫu ngữ pháp mới',rule:'Quy tắc ngắn gọn',examples:['Пример.'],practice:'Tạo 2 câu dùng mẫu này'},
  'grammar-path':{id,level:'A1',track:'Cách',title:'Mục ngữ pháp mới',why:'Vì sao cần học',core:'Quy tắc lõi',pattern:'Mẫu câu',examples:[{ru:'Пример.',vi:'Ví dụ'}],practice:['Tạo 3 câu'],mistakes:['Lỗi thường gặp'],bauman:'Ứng dụng Bauman'},
  mindmap:{id,title:'Mind map mới',subtitle:'Mục tiêu sơ đồ',type:'custom',branches:[{id:'branch_1',icon:'🧩',title:'Nhánh 1',summary:'Tóm tắt',children:[{id:'node_1',title:'Node 1',detail:'Chi tiết'}]}]},
  vocab:{id,stage,phrase_ru:'новая фраза',meaning_ru:'nghĩa/mô tả',clue_en:'English clue',pronunciation:'',tags:['custom']},
  speaking:{id,stage,group:'custom',context_title_vi:'Tình huống mới',difficulty:'Dễ',difficulty_id:'easy',turns:['Здравствуйте.','Здравствуйте.'],vi_turns:['Xin chào.','Xin chào.'],speakers:['A','B']},
  handwriting:{id,stage,mode:'alphabet',print:'А а',cursive:'А а',note:'Mẫu chữ mới',strokes:[{title:'Nét 1',guide:'Quan sát và tô'}]},
  writing:{id,stage,mode:'sentence',title:'Nhiệm vụ viết mới',purpose:'Viết câu ngắn',prompt_vi:'Viết 4 câu',model_ru:'',model_vi:''},
  videos:{id,stage,category:'Video học tập',genre:'Video học tập',title:'Nguồn mới',url:'',iframe:'',purpose:'Mục đích học'},
  exercises:{id,stage,level:'easy',title:'Bài tập mới',prompt:'Đề bài',answer:'Đáp án',rubric:'Tiêu chí'},
  simulations:{id,stage,group:'custom',type:'dialogue_lab',title:'Mô phỏng mới',purpose:'Luyện phản xạ',turns:[''],vi_turns:['']},
  'knowledge-index':{id,stage,title:'Mục kiến thức mới',keywords:['custom'],summary:'Tóm tắt'},
  tests:{id,stage,level:'easy',question:'Câu hỏi mới',choices:['A','B','C','D'],answerIndex:0,explanation:'Giải thích đáp án'},
  curriculum:{_storagePath:'modules',id,stageId:stage,title:'Module mới',goal:'Mục tiêu module',lessons:[]}
 };
 return map[source]||{id,stage,title:'Mục mới'};
}
function storageItemForm(source,index=null,path=''){
 const recs=storageRecords(source,DB[source]);
 let rec=null;
 if(index!==null&&index!==''&&!Number.isNaN(Number(index)))rec=recs.find(r=>Number(r.index)===Number(index)&&(path?String(r.path)===String(path):true));
 const item=rec?rec.item:storageSkeleton(source);
 const title=rec?'Sửa mục trong kho':'Thêm mục mới';
 return `<div class="modal-body storage-item-form"><div><span class="chip">${esc(source)}.json</span><h3>${title}</h3><p class="modal-note">Dữ liệu lưu vào bộ nhớ trình duyệt của môn học. Có thể xuất nguồn để giữ bản JSON sau khi chỉnh.</p></div><textarea id="storageItemJson" class="textarea small-json">${esc(JSON.stringify(item,null,2))}</textarea><div class="modal-actions"><button class="btn" data-act="modal-close">Hủy</button><button class="btn primary" data-act="storage-save-item" data-source="${esc(source)}" data-index="${rec?String(rec.index):''}" data-path="${esc(rec?rec.path:'')}">Lưu mục</button></div></div>`;
}
function stripStorageMeta(obj){
 if(!obj||typeof obj!=='object'||Array.isArray(obj))return obj;
 const out={...obj}; delete out._storagePath; delete out._storagePathLabel; delete out._storageIndex; delete out._key; return out;
}
function saveStorageItem(source){
 const btn=$('[data-act="storage-save-item"]');
 const index=btn?.dataset.index; const path=btn?.dataset.path||'';
 const raw=$('#storageItemJson')?.value||'';
 let item; try{item=JSON.parse(raw)}catch(e){toast('JSON của mục chưa hợp lệ');return;}
 if(source==='tests'){
  DB.tests=DB.tests&&typeof DB.tests==='object'?DB.tests:{questions:[]}; DB.tests.questions=arr(DB.tests.questions);
  const clean=stripStorageMeta(item); if(index!=='')DB.tests.questions[Number(index)]=clean; else DB.tests.questions.push(clean);
 }else if(source==='curriculum'){
  DB.curriculum=DB.curriculum&&typeof DB.curriculum==='object'?DB.curriculum:{stages:[],modules:[]};
  const target=path||item._storagePath||'modules'; const arrName=target==='stages'?'stages':'modules'; DB.curriculum[arrName]=arr(DB.curriculum[arrName]);
  const clean=stripStorageMeta(item); if(index!=='')DB.curriculum[arrName][Number(index)]=clean; else DB.curriculum[arrName].push(clean);
 }else if(Array.isArray(DB[source])){
  const clean=stripStorageMeta(item); if(index!=='')DB[source][Number(index)]=clean; else DB[source].push(clean);
 }else if(DB[source]&&typeof DB[source]==='object'){
  const keyName=item._key||item.id||('item_'+Date.now()); const clean=stripStorageMeta(item); DB[source][keyName]=clean;
 }else DB[source]=[stripStorageMeta(item)];
 state.storagePreviewLimit=0; saveDB(); closeModal(); render(); toast(isOptionalFile(source)?'Đã lưu '+source+'.json trong phiên; hãy Xuất nguồn để lưu vĩnh viễn':'Đã lưu vào '+source+'.json');
}
function storageAdvancedForm(source){
 const data=DB[source];
 return `<div class="modal-body storage-item-form"><div><span class="chip">DÁN JSON</span><h3>Thay toàn bộ ${esc(source)}.json</h3><p class="modal-note">Dùng khi anh muốn thay nguyên nguồn dữ liệu. Nếu chỉ thêm/sửa một mục, dùng nút Thêm mục hoặc Sửa trên từng thẻ.</p></div><textarea id="storageAdvancedJson" class="textarea small-json">${esc(JSON.stringify(data,null,2))}</textarea><div class="modal-actions"><button class="btn" data-act="modal-close">Hủy</button><button class="btn primary danger-confirm" data-act="storage-apply-advanced" data-source="${esc(source)}">Áp dụng JSON mới</button></div></div>`;
}
function applyAdvancedStorage(source){
 const raw=$('#storageAdvancedJson')?.value||'';
 try{DB[source]=JSON.parse(raw)}catch(e){toast('JSON nguồn chưa hợp lệ');return;}
 state.storagePreviewLimit=0; saveDB(); closeModal(); render(); toast(isOptionalFile(source)?'Đã thay '+source+'.json trong phiên; hãy Xuất nguồn để lưu vĩnh viễn':'Đã thay '+source+'.json');
}


function storageGroupFilterTabs(){
 const groups=storageGroups().map(g=>[g[0],g[1],g[0]]);
 if(!groups.some(g=>g[0]===state.storageGroup))state.storageGroup=groups[0]?.[0]||'Tổng quan';
 const active=state.storageGroup;
 const activeMeta=storageGroups().find(g=>g[0]===active)||['Tổng quan','🧭',[]];
 const activeLabel=`Nguồn dữ liệu hiện tại · ${activeMeta[0]}`;
 const activeHint=active==='Tổng quan'?'Lộ trình và chỉ mục':active==='Học tập'?'Bài học, luyện tập':active==='Từ vựng'?'Từ vựng, liên kết nhớ':active==='Ngữ pháp'?'Mạch ngữ pháp':active==='Mind map'?'Sơ đồ ôn tập':active==='Đối thoại'?'Nghe nói, đối thoại':active==='Viết'?'Luyện viết':active==='Video/Audio'?'Học qua media':active==='Kiểm tra'?'Ôn tập, đánh giá':'Nguồn dữ liệu';
 return `<div class="storage-source-control-v1338">
   <details class="storage-group-menu">
     <summary class="storage-group-trigger" data-current="${esc(activeLabel)}"><span class="storage-group-ico">🗄️</span><b>Kho môn học</b><u>▾</u></summary>
     <div class="storage-group-dropdown" role="menu">${groups.map(([id,icon,label])=>`<button class="storage-group-choice ${active===id?'active':''}" data-storage-group="${esc(id)}"><span>${icon}</span><b>${esc(label)}</b></button>`).join('')}</div>
   </details>
   <div class="storage-source-current-card" aria-live="polite" title="${esc(activeLabel)}"><span>${activeMeta[1]}</span><div><b>${esc(activeMeta[0])}</b><small>${esc(activeHint)}</small></div></div>
 </div>`;
}
function storageFilesForActiveGroup(){
 const files=ALL_STORAGE_FILES;
 const groups=storageGroups();
 const groupMeta=groups.find(g=>g[0]===state.storageGroup)||groups[0];
 const groupItems=(groupMeta?.[2]||files).filter(f=>files.includes(f));
 const q=lower(state.storageQuery||'');
 return groupItems.filter(f=>{
   const metaText=lower([f,sourceLabel(f),sourceKind(f,DB[f]),sourceDescription(f),sourceFilePath(f),sourceOrigin(f)].join(' '));
   return !q||metaText.includes(q)||storageRecords(f,DB[f]).some(r=>recordSearchText(f,r.item).includes(q));
 });
}
function storageArsenalFileCard(f){
 const data=DB[f]; const st=sourceStatus(f,data); const planned=sourcePlannedCount(f); const loaded=sourceLoadedCount(f,data);
 const countText=(!data&&isOptionalFile(f)&&planned)?`${planned} dự kiến`:`${sourceCount(f,data)} mục`;
 const active=state.storageFile===f;
 const tabUses=(dataSourceMeta(f)?.tabs||dataSourceMeta(f)?.usedBy||[]);
 const used=Array.isArray(tabUses)&&tabUses.length?tabUses.join(', '):sourceOrigin(f);
 return `<button class="arsenal-file-card ${active?'active':''} ${isOptionalFile(f)?'optional-source':''}" data-storage="${esc(f)}">
   <span class="arsenal-file-icon">${sourceIcon(f)}</span>
   <span class="arsenal-file-main"><b>${esc(sourceLabel(f))}</b><small>${esc(f)}.json</small><em>${esc(used)}</em></span>
   <span class="arsenal-file-side"><i class="${esc(st[1])}">${esc(st[0])}</i><strong>${esc(countText)}</strong>${isOptionalFile(f)&&!data?'<u>lazy</u>':''}</span>
 </button>`;
}
function storageAmmunitionShelf(){
 const visible=storageFilesForActiveGroup();
 const cards=visible.map(storageArsenalFileCard).join('');
 return `<section class="panel storage-ammo-shelf v1339-source-shelf"><header><div class="storage-shelf-top v1339-shelf-top"><div class="storage-shelf-title"><span class="chip">FILE JSON</span><h3>Nguồn dữ liệu</h3><p>Chọn nhóm, lọc nhanh và xem nguồn đang dùng.</p></div>${storageGroupFilterTabs()}</div><div class="storage-search-line"><input class="input" data-input="storageQuery" value="${esc(state.storageQuery||'')}" placeholder="Tìm file, tab, stage, nội dung..."/></div></header><div class="arsenal-file-scroll">${cards||'<article class="storage-empty"><b>Không có file phù hợp</b><span>Xóa từ khóa hoặc chọn Kho môn học.</span></article>'}</div></section>`;
}
function storageSampleSummary(name,data){
 const recs=storageRecords(name,data).slice(0,3);
 if(!recs.length)return 'Chưa tải hoặc chưa có bản ghi xem trước';
 return recs.map(r=>{
  const title=recordTitle(name,r.item,r.index);
  const body=recordBody(name,r.item)||recordSub(name,r.item)||sourceKind(name,data);
  return `<i>• ${esc(clip(title,46))}${body?`: ${esc(clip(body,82))}`:''}</i>`;
 }).join('');
}
function storageFileMission(name,data){
 const using = dataSourceMeta(name)?.group || sourceOrigin(name);
 const desc = sourceDescription(name)||sourceKind(name,data);
 const sample=storageSampleSummary(name,data);
 return `<div class="arsenal-file-mission"><article><b>Vai trò</b><span>${esc(desc||'Nguồn JSON của môn học')}</span></article><article><b>Tab/nhóm dùng</b><span>${esc(using)}</span></article><article><b>Đường dẫn</b><span>${esc(sourceFilePath(name))}</span></article><article class="mission-sample-card"><b>Mẫu nội dung</b><span class="mission-sample-lines">${sample}</span></article></div>`;
}

function renderStorage(){
 const files=ALL_STORAGE_FILES;
 if(!files.includes(state.storageFile))state.storageFile=files[0];
 const groupNames=storageGroups().map(g=>g[0]);
 if(!groupNames.includes(state.storageGroup))state.storageGroup=groupNames[0]||'Tổng quan';
 const visible=storageFilesForActiveGroup();
 if(visible.length&&!visible.includes(state.storageFile))state.storageFile=visible[0];
 const name=state.storageFile||files[0];
 const data=DB[name];
 const status=sourceStatus(name,data); const count=sourceCount(name,data);
 const loaded=sourceLoadedCount(name,data); const planned=sourcePlannedCount(name);
 const lazyUnloaded=isOptionalFile(name)&&!data;
 const storageTools=lazyUnloaded
  ? `<div class="lesson-tools storage-vault-tools"><button class="btn primary" data-load-optional="${esc(name)}">Tải nguồn này</button><button class="btn" data-act="export-source-plan">Xuất mô tả nguồn</button></div>`
  : `<div class="lesson-tools storage-vault-tools"><label class="btn primary">Nhập/Thay file<input id="storageImport" type="file" accept=".json,application/json" hidden></label><button class="btn" data-act="storage-add-item">＋ Thêm mục</button><button class="btn" data-act="export-source">Xuất nguồn</button><button class="btn" data-act="storage-reset-source">Khôi phục nguồn</button><button class="btn dark" data-act="storage-advanced">Dán JSON mới</button></div>`;
 return `<div class="storage-arsenal storage-vault v1300-storage-arsenal v1314-storage-luxe v1339-storage-compact v1340-storage-right-stack">
   <section class="panel storage-arsenal-hero"><div><span class="chip">KHO DỮ LIỆU JSON</span><h3>Trung tâm dữ liệu Tiếng Nga Bauman</h3><p>Quản lý nguồn JSON theo nhóm, tab sử dụng và bản ghi. Bố cục mới gọn hơn, dễ tìm, dễ nhập/thay file, dễ xuất và khôi phục.</p></div>${storageQuickStats()}</section>
   <div class="storage-arsenal-layout">
     ${storageAmmunitionShelf()}
     <main class="panel storage-arsenal-main">
       <header class="storage-arsenal-main-head"><div><span class="chip ${status[1]==='danger'?'warn-chip':''}">${esc(status[0])}</span><h3>${sourceIcon(name)} ${esc(sourceLabel(name))}</h3><p>${esc(name)}.json · ${esc(sourceKind(name,data))} · ${loaded}/${count}${planned?` · kế hoạch ${planned}`:''}</p></div>${storageTools}</header>
       ${storageFileMission(name,data)}
       <div class="storage-arsenal-preview">${storagePreview(name,data)}</div>
     </main>
   </div>
 </div>`
}
function applyInterface(){
 const theme=state.interfaceTheme||'navy'; const density=state.interfaceDensity||'normal'; const main=state.interfaceMain||'balanced';
 document.body.classList.remove('theme-clean','theme-warm','theme-focus','theme-navy','theme-deep','theme-emerald','theme-amber','theme-violet','density-normal','density-compact','density-wide','main-balanced','main-compact','main-focus','warm');
 const safeTheme=['navy','deep','emerald','amber','violet','clean','warm','focus'].includes(theme)?theme:'navy';
 document.body.classList.add('theme-'+safeTheme,'density-'+density,'main-'+main);
 if(safeTheme==='warm')document.body.classList.add('warm');
}
function renderInterfaceModal(){
 const themes=[['clean','Sáng sạch','Nền sáng, thẻ trắng, hợp dùng ban ngày'],['warm','Sáng ấm','Nền sáng ngả kem, dịu mắt khi học lâu'],['focus','Sáng tập trung','Nền sáng xanh nhạt, làm nổi vùng học chính'],['navy','Bauman Navy','Xanh than học thuật, tương phản rõ'],['deep','Deep Blue','Xanh học thuật, nút active nổi mạnh'],['emerald','Emerald Study','Xanh ngọc dịu, dễ nhìn khi ôn tập'],['amber','Amber Focus','Vàng hổ phách, tập trung vào nội dung'],['violet','Violet Lab','Tím phòng lab, nổi rõ vùng đang chọn']];
 const densities=[['compact','Gọn','Ưu tiên nhiều nội dung'],['normal','Cân bằng','Phù hợp màn laptop'],['wide','Rộng','Thoáng cho màn lớn']];
 const mains=[['compact','Main gọn','Thu khung, giảm khoảng trắng'],['balanced','Main cân bằng','Giữ nhịp đọc ổn định'],['focus','Main tập trung','Nới vùng học chính, giảm nhiễu']];
 const theme=themes.find(x=>x[0]===state.interfaceTheme)||themes[0];
 const density=densities.find(x=>x[0]===state.interfaceDensity)||densities[1];
 const main=mains.find(x=>x[0]===state.interfaceMain)||mains[1];
 return `<div class="modal-body v1267-interface-panel v1284-interface-compact v1285-interface-tools v1300-theme-tools">
   <div class="v1267-interface-hero v1284-interface-hero v1285-interface-hero"><span class="chip">🎛️ GIAO DIỆN</span><h3>Bảng chỉnh giao diện nhanh</h3><p>Bổ sung nhóm nền sáng để không bị toàn nền tối. Chọn là áp dụng ngay cho nền, thẻ, nút active, chip, viền và vùng đang chọn.</p></div>
   <section class="theme-swatch-grid">${themes.map(t=>`<button class="theme-swatch theme-swatch-${t[0]} ${state.interfaceTheme===t[0]?'active':''}" data-ui-theme="${t[0]}"><b>${t[1]}</b><span>${t[2]}</span></button>`).join('')}</section>
   <section class="v1267-dropdown-card v1284-dropdown-card v1285-dropdown-card"><label><span>Màu giao diện</span><b>${theme[1]}</b><small>${theme[2]}</small></label><select class="input ui-dropdown" data-input="interfaceTheme">${themes.map(t=>`<option value="${t[0]}" ${state.interfaceTheme===t[0]?'selected':''}>${t[1]} · ${t[2]}</option>`).join('')}</select></section>
   <section class="v1267-dropdown-card v1284-dropdown-card v1285-dropdown-card"><label><span>Mật độ bố cục</span><b>${density[1]}</b><small>${density[2]}</small></label><select class="input ui-dropdown" data-input="interfaceDensity">${densities.map(t=>`<option value="${t[0]}" ${state.interfaceDensity===t[0]?'selected':''}>${t[1]} · ${t[2]}</option>`).join('')}</select></section>
   <section class="v1267-dropdown-card v1284-dropdown-card v1285-dropdown-card main-tool-card"><label><span>Kiểu main</span><b>${main[1]}</b><small>${main[2]}</small></label><select class="input ui-dropdown" data-input="interfaceMain">${mains.map(t=>`<option value="${t[0]}" ${state.interfaceMain===t[0]?'selected':''}>${t[1]} · ${t[2]}</option>`).join('')}</select></section>
   <div class="v1285-interface-summary"><b>Đang dùng</b><span>${theme[1]} · ${density[1]} · ${main[1]}</span></div>
   <div class="modal-actions"><button class="btn primary" data-act="modal-close">Xong</button></div>
 </div>`
}

function aiContext(){
 const lesson=currentLesson(); const vocab=getVocab()[state.vocabIndex]||{}; const dialogue=currentDialogue(); const writing=getWriting()[state.writingIndex]||{};
 return {stage:stageTitle(),goal:todayMissionText(),view:state.view,learnTab:state.learnTab,lessonTitle:A.lessonTitle?.(lesson)||lesson?.title||'',lessonSummary:A.lessonSubtitle?.(lesson)||lesson?.summary||'',vocab:vocabInfo(vocab),dialogueTitle:A.dialogueTitle?.(dialogue)||dialogue?.title||dialogue?.context_title_vi||'',dialoguePurpose:A.dialogueSubtitle?.(dialogue)||dialogue?.purpose||'',writingTitle:A.writingTitle?.(writing)||writing?.title||''};
}
function aiBullets(items){return '<ul>'+items.filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join('')+'</ul>'}
function aiGenerate(mode,prompt=''){
 const c=aiContext();
 if(mode==='lesson')return `<h4>Giải thích bài đang học</h4>${aiBullets([`Giai đoạn: ${c.stage}`,`Bài: ${c.lessonTitle||'Chưa chọn bài'}`,`Ý chính: ${c.lessonSummary||'Chưa có tóm tắt'}`])}<p>Hãy học theo 3 nhịp: đọc ý chính, nói lại bằng tiếng Việt, rồi tạo 2 câu tiếng Nga ngắn dùng từ khóa của bài.</p>`;
 if(mode==='vocab')return `<h4>Giải thích từ vựng đang chọn</h4>${aiBullets([`Từ/cụm: ${c.vocab.term||'Chưa chọn'}`,`Nghĩa: ${c.vocab.displayMeaning||c.vocab.meaningVi||c.vocab.english||c.vocab.meaningRu||'Chưa có'}`,`English equivalent: ${c.vocab.english||'Chưa có'}`,`Ứng dụng: ${c.vocab.displayApplication||c.vocab.application||'Chưa có'}`])}<p>Mẹo nhớ: đặt từ này vào một câu ở ký túc xá, một câu trong lớp dự bị và một câu trong bối cảnh Bauman.</p>`;
 if(mode==='dialogue')return `<h4>Tạo bài đóng vai nhanh</h4><p><b>Bối cảnh:</b> ${esc(c.dialogueTitle||'hội thoại học tập')}</p>${aiBullets(['Vai A: hỏi bằng câu ngắn, rõ mục đích.','Vai B: trả lời, xác nhận lại thông tin.','Lượt 3: đổi vai và nói nhanh hơn 10%.','Ẩn nghĩa tiếng Việt ở vòng cuối để luyện phản xạ.'])}`;
 if(mode==='review')return `<h4>Ôn tập hôm nay</h4>${aiBullets([`Mục tiêu hôm nay: ${c.goal}`,`Tiếp tục từ tab: ${c.view}`,`Bài hiện tại: ${c.lessonTitle||'chưa chọn'}`,'Ôn 10 từ, 1 hội thoại, 5 câu ôn tập, 1 đoạn viết ngắn.'])}`;
 if(mode==='writing')return `<h4>Gợi ý viết</h4>${aiBullets([`Nhiệm vụ: ${c.writingTitle||'Chưa chọn nhiệm vụ'}`,'Viết 4 câu: giới thiệu mục đích, nêu dữ kiện, hỏi/xác nhận, kết luận lịch sự.','Sau khi viết, tự kiểm tra giống, số, cách và động từ.'])}`;
 const p=prompt.trim();
 if(!p)return '<h4>AI Mentor</h4><p>Nhập câu hỏi hoặc chọn một nút gợi ý để AI dùng ngữ cảnh hiện tại của môn học.</p>';
 return `<h4>Gợi ý theo câu hỏi</h4><p><b>Câu hỏi:</b> ${esc(p)}</p>${aiBullets([`Ngữ cảnh: ${c.stage} · ${c.view}`,`Bài hiện tại: ${c.lessonTitle||'chưa chọn'}`,`Mục tiêu hôm nay: ${c.goal}`])}<p>Hướng xử lý: tách vấn đề thành từ vựng cần biết, mẫu câu cần dùng, ngữ pháp liên quan và một nhiệm vụ thực hành 5 phút.</p>`;
}
function renderAiMentor(){
 const c=aiContext(); const out=state.aiOutput||aiGenerate('intro','');
 return `<div class="modal-body ai-mentor"><header class="ai-head"><div><span class="chip">AI MENTOR</span><h3>Trợ lý Tiếng Nga Bauman</h3><p>Dùng ngữ cảnh đang học: bài, từ vựng, hội thoại, viết, lịch hôm nay.</p></div><div class="ai-context-card"><b>${esc(c.stage)}</b><span>${esc(c.goal)}</span></div></header><section class="ai-context-grid"><article><b>Bài học</b><span>${esc(c.lessonTitle||'Chưa chọn')}</span></article><article><b>Từ vựng</b><span>${esc(c.vocab.term||'Chưa chọn')}</span></article><article><b>Đối thoại</b><span>${esc(c.dialogueTitle||'Chưa chọn')}</span></article><article><b>Viết</b><span>${esc(c.writingTitle||'Chưa chọn')}</span></article></section><div class="ai-quickbar"><button class="btn" data-ai-quick="lesson">Giải thích bài</button><button class="btn" data-ai-quick="vocab">Giải thích từ</button><button class="btn" data-ai-quick="dialogue">Tạo đóng vai</button><button class="btn" data-ai-quick="writing">Gợi ý viết</button><button class="btn primary" data-ai-quick="review">Ôn hôm nay</button></div><div class="ai-chat-grid"><textarea id="aiPrompt" class="textarea ai-prompt" placeholder="Hỏi AI theo bài đang học, ví dụ: giải thích cách dùng cụm này trong lớp dự bị...">${esc(state.aiDraft||'')}</textarea><article class="ai-output">${out}</article></div><div class="modal-actions"><button class="btn" data-act="ai-clear">Xóa kết quả</button><button class="btn primary" data-act="ai-run">Hỏi theo ngữ cảnh</button></div></div>`
}
function mediaForm(item={}){
 const groups=getMediaGroups();
 const cat=A.mediaCategory?.(item)||item.category||item.genre||'';
 return `<div class="modal-body media-form"><h3>${item.id||item.title?'Sửa nguồn Video/Audio':'Thêm Video/Audio'}</h3><datalist id="mediaGroupOptions">${groups.map(g=>`<option value="${esc(g)}"></option>`).join('')}</datalist><div class="form-row"><input class="input" id="mfTitle" placeholder="Tên nội dung" value="${esc(item.title||'')}"><input class="input" id="mfCat" list="mediaGroupOptions" placeholder="Chọn hoặc nhập nhóm học" value="${esc(cat)}"></div><textarea class="textarea" id="mfUrl" placeholder="URL gốc / link mở trực tiếp">${esc(item.url||'')}</textarea><textarea class="textarea" id="mfIframe" placeholder="Iframe embed hoặc URL embed">${esc(item.iframe||'')}</textarea><textarea class="textarea" id="mfPurpose" placeholder="Mục đích/mô tả">${esc(item.purpose||item.summary||'')}</textarea><div class="modal-actions"><button class="btn" data-act="modal-close">Hủy</button><button class="btn primary" data-act="media-save" data-id="${esc(item.id||item.title||'')}">Lưu media</button></div></div>`
}
function applyInput(el){const k=el.dataset.input; if(!k)return; let v=el.value; if(k==='interfaceTheme'||k==='interfaceDensity'||k==='interfaceMain'){state[k]=v; applyInterface(); save(); if(state.modalType==='interface')openModal(renderInterfaceModal(),'interface'); else render(); return;} if(['dialogueGroup','dialogueDifficulty','practiceGroup','practiceDifficulty','deepSpeakingId','mediaCat','grammarLevel','grammarTrack','mindmapId','testLevel','reviewLevel','reviewFilter','reviewLesson','examLevel','examCycle','examPaperLevel','examPaperType','exerciseLevel','storageGroup'].includes(k)){
  if(k==='examCycle'){
   if(v!=='auto'&&!isExamCycleUnlocked(Number(v))){toast('Lượt kiểm tra này chưa mở khóa. Hãy học đủ lịch trình trước.'); v='auto';}
   state.examCycle=v; state.examPaperLevel=activeExamLevel(); state.examIndex=0; state.examPage=0;
  }else if(k==='examPaperType'){
   if(!EXAM_PAPER_ORDER.includes(v))v='standard';
   state.examPaperType=v; state.examPaperLevel=v; state.examIndex=0; state.examPage=0;
  }else if(k==='examLevel'||k==='examPaperLevel'){
   if(EXAM_PAPER_ORDER.includes(v)){state.examPaperType=v; state.examPaperLevel=v;}
   else state.examPaperLevel=v;
   state.examIndex=0; state.examPage=0;
  }else if(k==='exerciseLevel'){
   if(!isLearningLevelUnlocked(v)){toast(`Mức ${exerciseLevelLabel(v)} chưa mở khóa theo ngày học hiện tại.`); v='all';}
   state.exerciseLevel=v;
  }else{
   state[k]=v;
  }
  if(k==='testLevel'){state.testIndex=0;state.testAnswer=null;} if(k==='reviewLevel'){state.reviewIndex=0;state.reviewPage=0;state.reviewAnswer=null;state.reviewLesson='all';} if(k==='reviewFilter'||k==='reviewLesson'){state.reviewIndex=0;state.reviewPage=0;state.reviewAnswer=null;} if(k==='exerciseLevel')state.exerciseIndex=0; if(k==='practiceGroup'||k==='practiceDifficulty'){state.practiceDialogueId='';state.practiceLineIndex=0;} if(k==='dialogueGroup'||k==='dialogueDifficulty'){state.dialogueId='';state.dialogueLineIndex=0;} if(k==='deepSpeakingId'){state.deepSpeakingStep=0;} if(k==='grammarLevel'){state.grammarTrack='all';state.grammarIndex=0;} if(k==='grammarTrack'){state.grammarIndex=0;} if(k==='mindmapId'){state.mindmapNode='';}
 } else state[k]=v; save(); render();}
function speak(text,rate=.85){ if(!text||!('speechSynthesis' in window))return; const u=new SpeechSynthesisUtterance(text); u.lang=A.speech?.lang||'ru-RU'; u.rate=rate; speechSynthesis.cancel(); speechSynthesis.speak(u); }
function initCanvas(){canvas=$('#writingCanvas'); if(!canvas||canvas.dataset.ready)return; ctx=canvas.getContext('2d'); ctx.lineCap='round';ctx.lineJoin='round'; canvas.dataset.ready='1'; const pos=e=>{const r=canvas.getBoundingClientRect(); return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}; const start=e=>{e.preventDefault(); drawing=true; currentStroke={color:penColor,size:penSize,points:[pos(e)]}; strokes.push(currentStroke); drawCanvas()}; const move=e=>{if(!drawing)return; e.preventDefault(); currentStroke.points.push(pos(e)); drawCanvas()}; const end=()=>{drawing=false;currentStroke=null}; canvas.addEventListener('pointerdown',start); canvas.addEventListener('pointermove',move); window.addEventListener('pointerup',end); canvas.addEventListener('touchstart',e=>e.preventDefault(),{passive:false}); drawCanvas();}
function drawCanvas(){if(!ctx)return; ctx.clearRect(0,0,canvas.width,canvas.height); drawCanvasGuide(); for(const s of strokes){if(s.points.length<2)continue; ctx.strokeStyle=s.color; ctx.lineWidth=s.size; ctx.beginPath(); ctx.moveTo(s.points[0].x,s.points[0].y); s.points.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.stroke();}}
function drawCanvasGuide(){
 if(!ctx||!canvas)return;
 const w=canvas.width,h=canvas.height;
 const item=getHandwriting()[state.handwritingIndex%Math.max(1,getHandwriting().length)]||{};
 const step=handwritingStrokeSteps(item)[state.handwritingStep];
 ctx.save();
 ctx.fillStyle='rgba(248,250,252,.96)'; ctx.fillRect(0,0,w,h);
 if(state.handwritingShowLines!==false){
   ctx.lineWidth=2; ctx.strokeStyle='rgba(148,163,184,.28)';
   for(let y=145;y<h;y+=135){ctx.beginPath(); ctx.moveTo(40,y); ctx.lineTo(w-40,y); ctx.stroke(); ctx.setLineDash([10,14]); ctx.beginPath(); ctx.moveTo(40,y-66); ctx.lineTo(w-40,y-66); ctx.stroke(); ctx.setLineDash([]);}
   ctx.strokeStyle='rgba(244,63,94,.22)'; ctx.beginPath(); ctx.moveTo(110,40); ctx.lineTo(110,h-40); ctx.stroke();
 }
 ctx.fillStyle='rgba(15,23,42,.45)'; ctx.font='34px system-ui, -apple-system, Segoe UI, sans-serif';
 ctx.fillText(step?`Bước ${Number(state.handwritingStep)+1}: ${step.title}`:'Bảng tập viết',140,70);
 ctx.font='22px system-ui, -apple-system, Segoe UI, sans-serif'; ctx.fillStyle='rgba(71,85,105,.55)';
 ctx.fillText(`Chế độ: ${writingPracticeName(state.handwritingPractice||'trace')}`,140,108);
 drawTraceSamples(item);
 drawHandwritingOverlay(item);
 ctx.restore();
}

function drawTraceSamples(item){
 if(!ctx||state.handwritingShowGuide===false||state.handwritingPractice!=='trace')return;
 const hand=handwritingCursiveSample(item).replace(/\s+/g,' ');
 const print=handwritingPrintSample(item).replace(/\s+/g,' ');
 ctx.save();
 ctx.fillStyle='rgba(71,85,105,.18)';
 ctx.font='30px system-ui, -apple-system, Segoe UI, sans-serif';
 ctx.fillText(`Nhận mặt chữ in: ${print}`,150,500);
 ctx.fillStyle='rgba(37,99,235,.105)';
 ctx.font='106px "Segoe Script", "Comic Sans MS", cursive';
 [590,735,880,1025].forEach(y=>ctx.fillText(hand,150,y));
 ctx.fillStyle='rgba(15,23,42,.11)';
 ctx.font='30px system-ui, -apple-system, Segoe UI, sans-serif';
 ctx.fillText('Tô theo mẫu viết tay mờ, rồi chép lại vào vở thật.',150,545);
 ctx.restore();
}
function practiceBandForStep(){
 const idx=Number(state.handwritingStep)||0;
 const bands=[[520,635],[660,775],[800,915],[930,1065]];
 return bands[idx%bands.length]||bands[0];
}
function clearCurrentPracticeLine(){
 if(!strokes.length){toast('Chưa có nét nào để xóa');return;}
 const band=practiceBandForStep(); const before=strokes.length;
 strokes=strokes.filter(s=>{const pts=s.points||[]; if(!pts.length)return true; const y=pts.reduce((sum,p)=>sum+p.y,0)/pts.length; return y<band[0]||y>band[1];});
 drawCanvas(); toast(before===strokes.length?'Không có nét trong dòng luyện hiện tại':'Đã xóa dòng luyện hiện tại');
}
function downloadCanvas(){if(!canvas)return; const a=document.createElement('a'); a.href=canvas.toDataURL('image/png'); a.download='russian_handwriting.png'; a.click();}
function exportJson(name,data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href);}
function resetCurrentSource(){
 fetch(sourceFilePath(state.storageFile)).then(r=>r.ok?r.json():Promise.reject()).then(data=>{DB[state.storageFile]=data; state.storageText=''; saveDB(); toast('Đã khôi phục '+state.storageFile+'.json'); render();}).catch(()=>toast('Không tìm thấy file gốc để khôi phục'));
}
function setLearnTab(tab){
 const allowed=LEARN_TABS.map(x=>x[0]);
 state.view='learning'; state.learnTab=allowed.includes(tab)?tab:'theory';
 const ctx=activeLessonContext(); if(!state.lessonId&&ctx.id)state.lessonId=ctx.id;
 if(state.learnTab==='theory')state.slide=0;
 if(state.learnTab==='exercises')state.exerciseIndex=0;
 if(state.learnTab==='practice'){state.practiceDialogueId='';state.practiceLineIndex=0;}
 if(state.learnTab==='review'){state.reviewAnswer=null;state.reviewIndex=Math.max(0,Number(state.reviewIndex)||0);}
 if(state.learnTab==='exam'){state.examAnswer=null;state.examIndex=Math.max(0,Number(state.examIndex)||0);state.examGateSource=null;}
 save(); render();
}
function presentationScroller(){return $('.presentation-modal.fixed-presentation .present-slide')||$('.present-slide')||$('.slidebox')}
function rerenderPresentation(){save(); openModal(renderPresentation(),'presentation')}
function moveSlide(delta,modal=false){const lesson=currentLesson(); const info=clampSlideIndex(lesson); state.slide=Math.min(Math.max(0,info.idx+delta),info.max); modal?rerenderPresentation():(save(),render());}
function moveDialogueLine(delta){const d=currentDialogue(); const turns=dialogueTurns(d); const max=Math.max(0,turns.length-1); setActiveLineIndex(Math.min(Math.max(0,activeLineIndex()+delta),max)); save(); render();}

let mindHoverTimer=null;
let mindPreviewCard=null;
function mindFindNode(id){const map=currentMindMap(); return flattenMindNodes(map).find(n=>n.id===id)||null;}
function mindPreviewHtml(node){
 if(!node)return '';
 const parent=node._kind==='child'&&node._parent?`<span class="mind-preview-parent">${esc(node._parent.title||'Nhánh mẹ')}</span>`:'<span class="mind-preview-parent">Nhánh chính</span>';
 const subpoints=arr(node.subpoints).slice(0,8).map(x=>`<li>${esc(x)}</li>`).join('');
 const examples=arr(node.examples).slice(0,4).map(x=>typeof x==='string'?x:(x.ru?`${x.ru}${x.vi?' · '+x.vi:''}`:(x.text||''))).filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join('');
 const practice=arr(node.practice).slice(0,4).map(x=>`<li>${esc(x)}</li>`).join('');
 const memory=node.memory||node.remember||node.mnemonic||'';
 return `${parent}<b>${esc(node.title||'Điểm nhớ')}</b>${memory?`<strong class="mind-preview-memory">Neo nhớ: ${esc(memory)}</strong>`:''}<p>${esc(node.detail||node.summary||node.note||'')}</p>${subpoints||examples||practice?`<section>${subpoints?`<ul>${subpoints}</ul>`:''}${examples?`<ul>${examples}</ul>`:''}${practice?`<ol>${practice}</ol>`:''}</section>`:''}`;
}
function ensureMindPreviewCard(){
 if(!mindPreviewCard){mindPreviewCard=document.createElement('div'); mindPreviewCard.className='mindmap-zoom-preview'; document.body.appendChild(mindPreviewCard);}
 return mindPreviewCard;
}
function placeMindPreview(anchor){
 const card=ensureMindPreviewCard(); const r=anchor.getBoundingClientRect();
 const w=Math.min(560,Math.max(360,window.innerWidth*.38)); card.style.width=w+'px';
 const top=clampMind(r.top-18,16,Math.max(16,window.innerHeight-260));
 const left=r.left+r.width/2<window.innerWidth/2?Math.min(window.innerWidth-w-16,r.right+16):Math.max(16,r.left-w-16);
 card.style.left=left+'px'; card.style.top=top+'px';
}
function showMindPreviewFor(nodeEl,instant=false){
 const id=nodeEl?.dataset?.mindmapNode; const node=id?mindFindNode(id):null; if(!node)return;
 const run=()=>{const card=ensureMindPreviewCard(); card.innerHTML=mindPreviewHtml(node); placeMindPreview(nodeEl); card.classList.add('show');};
 clearTimeout(mindHoverTimer); if(instant)run(); else mindHoverTimer=setTimeout(run,3000);
}
function hideMindPreview(){clearTimeout(mindHoverTimer); if(mindPreviewCard)mindPreviewCard.classList.remove('show');}
function mindCanvasLayoutSize(canvas){
 const svg=canvas?.querySelector('.mind-adam-connectors'); const vb=svg?.getAttribute('viewBox')?.split(/\s+/).map(Number)||[];
 return {w:vb[2]||1200,h:vb[3]||Number(getComputedStyle(canvas).getPropertyValue('--mind-stage-h').replace('px',''))||760};
}
function clampMindNodeDragToCanvas(canvas,node){
 if(!canvas||!node||!node.matches('[data-mindmap-drag="1"]'))return false;
 const cr=canvas.getBoundingClientRect(),nr=node.getBoundingClientRect();
 if(!cr.width||!cr.height||!nr.width||!nr.height)return false;
 const dx=Number(node.dataset.dragX||0),dy=Number(node.dataset.dragY||0);
 const baseCX=nr.left+nr.width/2-cr.left-dx;
 const baseCY=nr.top+nr.height/2-cr.top-dy;
 const pad=12;
 const minX=pad+nr.width/2-baseCX,maxX=cr.width-pad-nr.width/2-baseCX;
 const minY=pad+nr.height/2-baseCY,maxY=cr.height-pad-nr.height/2-baseCY;
 const nx=Math.round(clampMind(dx,Math.min(minX,maxX),Math.max(minX,maxX)));
 const ny=Math.round(clampMind(dy,Math.min(minY,maxY),Math.max(minY,maxY)));
 if(nx!==Math.round(dx)||ny!==Math.round(dy)){
  node.dataset.dragX=String(nx); node.dataset.dragY=String(ny);
  node.style.setProperty('--drag-x',nx+'px'); node.style.setProperty('--drag-y',ny+'px');
  return true;
 }
 return false;
}
function mindNodePoint(canvas,node){
 const size=mindCanvasLayoutSize(canvas); const cr=canvas.getBoundingClientRect(),nr=node?.getBoundingClientRect?.();
 if(!nr||!cr.width||!cr.height)return {x:0,y:0};
 return {x:((nr.left+nr.width/2-cr.left)/cr.width)*size.w,y:((nr.top+nr.height/2-cr.top)/cr.height)*size.h};
}
function updateMindMapConnectors(canvas){
 if(!canvas)return;
 const nodes={};
 canvas.querySelectorAll('[data-node-key]').forEach(el=>{clampMindNodeDragToCanvas(canvas,el);nodes[el.dataset.nodeKey]=mindNodePoint(canvas,el)});
 canvas.querySelectorAll('[data-mind-line="1"]').forEach(path=>{
  const a=nodes[path.dataset.from],b=nodes[path.dataset.to]; if(!a||!b)return;
  path.setAttribute('d',mindCurve(a,b,Number(path.dataset.soft)||.38));
 });
 canvas.querySelectorAll('[data-mind-dot="1"]').forEach(dot=>{const p=nodes[dot.dataset.for]; if(p){dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);}});
}
function resetMindMapLayout(){
 const mapId=mindDragMapId();
 state.mindmapDrag=state.mindmapDrag&&typeof state.mindmapDrag==='object'?state.mindmapDrag:{};
 delete state.mindmapDrag[mapId];
 state.mindmapLayoutVersion='v13_32_clean';
 save(); hideMindPreview(); render();
 toast('Đã sắp xếp lại mind map gọn trong khung');
}
function handleMindMapDrag(e){
 const node=e.target.closest('[data-mindmap-drag="1"]');
 if(!node||e.button!==0)return;
 const canvas=node.closest('[data-mindmap-canvas="1"]');
 if(!canvas)return;
 hideMindPreview();
 const startX=e.clientX,startY=e.clientY;
 const prevX=Number(node.dataset.dragX||0),prevY=Number(node.dataset.dragY||0);
 const cr=canvas.getBoundingClientRect(),nr=node.getBoundingClientRect();
 const baseCX=nr.left+nr.width/2-cr.left-prevX,baseCY=nr.top+nr.height/2-cr.top-prevY;
 const pad=12;
 const minX=pad+nr.width/2-baseCX,maxX=cr.width-pad-nr.width/2-baseCX;
 const minY=pad+nr.height/2-baseCY,maxY=cr.height-pad-nr.height/2-baseCY;
 let moved=false;
 const move=ev=>{
   const dx=ev.clientX-startX,dy=ev.clientY-startY;
   if(Math.abs(dx)+Math.abs(dy)>5)moved=true;
   const nx=clampMind(prevX+dx,Math.min(minX,maxX),Math.max(minX,maxX)),ny=clampMind(prevY+dy,Math.min(minY,maxY),Math.max(minY,maxY));
   node.dataset.dragX=String(Math.round(nx)); node.dataset.dragY=String(Math.round(ny));
   node.style.setProperty('--drag-x',Math.round(nx)+'px');
   node.style.setProperty('--drag-y',Math.round(ny)+'px');
   updateMindMapConnectors(canvas);
   if(mindPreviewCard?.classList.contains('show'))placeMindPreview(node);
 };
 const up=()=>{
   window.removeEventListener('pointermove',move);
   window.removeEventListener('pointerup',up);
   updateMindMapConnectors(canvas);
   if(moved){
    const mapId=mindDragMapId(); const key=node.dataset.nodeKey;
    state.mindmapDrag=state.mindmapDrag&&typeof state.mindmapDrag==='object'?state.mindmapDrag:{};
    state.mindmapDrag[mapId]=state.mindmapDrag[mapId]&&typeof state.mindmapDrag[mapId]==='object'?state.mindmapDrag[mapId]:{};
    state.mindmapDrag[mapId][key]={x:Number(node.dataset.dragX)||0,y:Number(node.dataset.dragY)||0};
    save(); node.dataset.dragged='1';setTimeout(()=>{if(node)node.dataset.dragged='0'},260);
   }
 };
 node.setPointerCapture?.(e.pointerId);
 window.addEventListener('pointermove',move,{passive:true});
 window.addEventListener('pointerup',up,{once:true});
}
function handleMindMapHover(e){const node=e.target.closest('[data-node-key]'); if(!node||!node.closest('[data-mindmap-canvas="1"]'))return; showMindPreviewFor(node,false);}
function handleMindMapHoverOut(e){const node=e.target.closest('[data-node-key]'); if(!node)return; if(e.relatedTarget&&node.contains(e.relatedTarget))return; hideMindPreview();}
function handleMindMapDoubleClick(e){const node=e.target.closest('[data-node-key]'); if(!node||!node.closest('[data-mindmap-canvas="1"]'))return; e.preventDefault(); showMindPreviewFor(node,true);}

function handleClick(e){
 const b=e.target.closest('button,a,[data-view],[data-route],tr[data-vocab],[data-exercise-focus]'); if(!b)return;
 const dragged=b.closest('[data-mindmap-drag="1"]'); if(dragged?.dataset.dragged==='1')return;
 if(b.dataset.confirmAct){const action=b.dataset.confirmAct; closeModal(); runConfirmedAction(action); return}
 if(b.dataset.view){setView(b.dataset.view);return}
 if(b.dataset.learn){setLearnTab(b.dataset.learn);return}
 if(b.dataset.lesson){state.lessonId=b.dataset.lesson;state.slide=0;state.exerciseIndex=0;state.practiceDialogueId='';state.practiceLineIndex=0;state.practiceGroup='all';state.practiceDifficulty='all';save();render();return}
 if('slide' in b.dataset){state.slide=Number(b.dataset.slide)||0; if(state.modalType==='presentation')rerenderPresentation(); else {save();render();} return}
 if('exerciseFocus' in b.dataset){state.exerciseIndex=Number(b.dataset.exerciseFocus)||0;save();render();return}
 if(b.dataset.practiceDialogue){state.practiceDialogueId=b.dataset.practiceDialogue;state.practiceLineIndex=0;save();render();return}
 if(b.dataset.dialogue){state.dialogueId=b.dataset.dialogue;state.dialogueLineIndex=0;save();render();return}
 if('line' in b.dataset){setActiveLineIndex(Number(b.dataset.line)||0);save(); if(state.modalType==='speech-map')closeModal(); render();return}
 if(b.dataset.media){state.mediaId=b.dataset.media;save();render();return}
 if(b.dataset.mediaView){state.mediaView=b.dataset.mediaView;save();render();return}
 if(b.dataset.storage){state.storageFile=b.dataset.storage;state.storageText='';state.storagePreviewLimit=0;save();render();return}
 if(b.dataset.storageGroup){state.storageGroup=b.dataset.storageGroup;state.storagePreviewLimit=0;save();render();return}
 if('storageEdit' in b.dataset){openModal(storageItemForm(state.storageFile,b.dataset.storageEdit,b.dataset.storagePath||''),'storage-item');return}
 if('vocab' in b.dataset){state.vocabIndex=Number(b.dataset.vocab)||0;state.vocabFlipped=false;save();render();return}
 if('grammarIndex' in b.dataset){state.grammarIndex=Number(b.dataset.grammarIndex)||0;save();render();return}
 if(b.dataset.mindmapMap){state.view='mindmap';state.mindmapId=b.dataset.mindmapMap;state.mindmapNode='';save();render();return}
 if(b.dataset.mindmapReset){resetMindMapLayout();return}
 if(b.dataset.mindmapFont){const cur=normalizeMindFontSize(state.mindmapFontScale); state.mindmapFontScale=b.dataset.mindmapFont==='up'?clampMind(cur+1,9,40):(b.dataset.mindmapFont==='down'?clampMind(cur-1,9,40):14); save();render();return}
  if(b.dataset.mindmapNode){state.mindmapNode=b.dataset.mindmapNode;save();render();return}
 if(b.dataset.writing){state.writingMode=b.dataset.writing;save();render();return}
 if(b.dataset.handPractice){state.handwritingPractice=b.dataset.handPractice;save();render();return}
 if('handIndex' in b.dataset){state.handwritingIndex=Number(b.dataset.handIndex)||0;state.handwritingStep=0;strokes=[]; if(state.modalType==='hand-grid')closeModal(); save();render();return}
 if('handStep' in b.dataset){state.handwritingStep=Number(b.dataset.handStep)||0;save();render();return}
 if('writeIndex' in b.dataset){state.writingIndex=Number(b.dataset.writeIndex)||0;save();render();return}
 if(b.dataset.penColor){penColor=b.dataset.penColor;toast('Đã đổi màu bút');return}
 if('answer' in b.dataset){state.testAnswer=Number(b.dataset.answer);save();render();return}
 if('testIndex' in b.dataset){state.testIndex=Number(b.dataset.testIndex)||0;state.testAnswer=null;save();render();return}
 if(b.dataset.reviewFilter){state.reviewFilter=b.dataset.reviewFilter;state.reviewIndex=0;state.reviewPage=0;state.reviewAnswer=null;save();render();return}
 if('reviewIndex' in b.dataset){const qs=getReviewQuestions(); const per=reviewPageSize(qs); state.reviewIndex=Number(b.dataset.reviewIndex)||0;state.reviewPage=Math.floor(state.reviewIndex/per);state.reviewAnswer=null;save();render();return}
 if('reviewPage' in b.dataset){const qs=getReviewQuestions(); const per=reviewPageSize(qs); state.reviewPage=Number(b.dataset.reviewPage)||0;state.reviewIndex=state.reviewPage*per;state.reviewAnswer=null;save();render();return}
 if('reviewAnswer' in b.dataset){state.reviewAnswer=Number(b.dataset.reviewAnswer);save();render();return}
 if('examIndex' in b.dataset){state.examIndex=Number(b.dataset.examIndex)||0;state.examPage=Math.floor(state.examIndex/examPageSize(activeExamLevel()));save();render();return}
 if('examPage' in b.dataset){state.examPage=Number(b.dataset.examPage)||0;state.examIndex=state.examPage*examPageSize(activeExamLevel());save();render();return}
 if('examAnswer' in b.dataset){const level=activeExamLevel(); if(examPaperResult(level))return; const qs=getExamQuestions(level); const q=qs[state.examIndex]||{}; const id=examQuestionId(q,state.examIndex,level); state.examProgress.answers[id]=Number(b.dataset.examAnswer);save();render();return}
 if(b.dataset.examPaper){state.examPaperType=b.dataset.examPaper;state.examPaperLevel=b.dataset.examPaper;state.examIndex=0;state.examPage=0;save();render();return}
 if(b.dataset.route){const r=JSON.parse(b.dataset.route||'{}'); closeModal(); if(r.routeSource==='today_schedule'&&r.scheduleStep)markScheduleTaskOpened(Number(r.scheduleStep),planSession(),r); trackAccess(r.view||'overview'); state.view=r.view||'overview'; if(r.lessonId)state.lessonId=r.lessonId; if(r.learnTab)state.learnTab=r.learnTab; if(r.reviewLesson)state.reviewLesson=r.reviewLesson; if(r.view==='grammar'){if(r.grammarLevel)state.grammarLevel=r.grammarLevel; if(r.grammarTrack)state.grammarTrack=r.grammarTrack; state.grammarIndex=0;} if(r.view==='mindmap'){if(r.mindmapId)state.mindmapId=r.mindmapId; if(r.mindmapNode)state.mindmapNode=r.mindmapNode; else state.mindmapNode='';} if(r.view==='learning'&&r.learnTab==='exam'){const paper=scheduleExamPaperType(r); state.examPaperType=paper; state.examPaperLevel=paper; state.examIndex=0; state.examPage=0; state.examGateSource={routeSource:r.routeSource||'',stage:r.stage||currentStageId(),part:Number(r.part||gatePart()),sessionKey:r.sessionKey||sessionKey(),scheduleStep:Number(r.scheduleStep||0),paperType:paper,at:Date.now()};} if(r.view==='learning'&&r.learnTab==='review'&&r.reviewFilter){state.reviewFilter=r.reviewFilter; state.reviewIndex=0; state.reviewPage=0; state.reviewAnswer=null;} if(r.mode==='handwriting')state.writingMode='handwriting'; save();render();return}
 if(b.dataset.remedialCard){const id=b.dataset.remedialCard; const plan=normalizeRemedialPlan(); const card=plan.cards.find(x=>x.id===id); if(card){state.remedialPlan.completed[id]=Date.now(); state.view='learning'; state.learnTab='review'; state.reviewFilter='wrong'; state.reviewLesson='all'; const remaining=remedialCounts().remaining; if(remaining<=0)state.remedialPlan.active=false; save(); render(); toast(remaining<=0?'Đã hoàn thành toàn bộ lịch phụ đạo':'Đã hoàn thành 1 thẻ phụ đạo'); return}}
 if(b.dataset.uiTheme){state.interfaceTheme=b.dataset.uiTheme; applyInterface(); save(); openModal(renderInterfaceModal(),'interface'); return}
 if(b.dataset.uiDensity){state.interfaceDensity=b.dataset.uiDensity; applyInterface(); save(); openModal(renderInterfaceModal(),'interface'); return}
 if(b.dataset.aiQuick){state.aiOutput=aiGenerate(b.dataset.aiQuick,''); save(); openModal(renderAiMentor(),'ai'); return}

 if(b.dataset.loadOptional){loadOptionalData(b.dataset.loadOptional);return}
 if(b.dataset.deepUnit){state.deepSpeakingId=b.dataset.deepUnit;state.deepSpeakingMode=state.deepSpeakingMode||'overview';state.deepSpeakingStep=0;save();render();return}
 if(b.dataset.deepMode){state.deepSpeakingMode=b.dataset.deepMode;state.deepSpeakingStep=0;save();render();return}
 if(b.dataset.deepSpeak){speak(b.dataset.deepSpeak,.82);return}
 const act=b.dataset.act; if(!act)return;
 if(act==='confirm-cancel'){closeModal(); return;}
 if(act==='ai-run'){state.aiDraft=$('#aiPrompt')?.value||''; state.aiOutput=aiGenerate('custom',state.aiDraft); save(); openModal(renderAiMentor(),'ai')}
 if(act==='ai-clear'){state.aiDraft='';state.aiOutput='';save();openModal(renderAiMentor(),'ai')}
 if(act==='dialogue-setup'){openModal(renderDialogueSetupModal(),'dialogue-setup'); return}
 if(act==='dialogue-setup-apply'){applyDialogueSetup(); return}
 if(act==='storage-add-item')openModal(storageItemForm(state.storageFile),'storage-item')
 if(act==='storage-save-item')saveStorageItem(b.dataset.source||state.storageFile)
 if(act==='storage-advanced')openModal(storageAdvancedForm(state.storageFile),'storage-advanced')
 if(act==='storage-apply-advanced')applyAdvancedStorage(b.dataset.source||state.storageFile)
 if(act==='storage-more'){state.storagePreviewLimit=(Number(state.storagePreviewLimit)||0)+20;save();render()}
 if(act==='storage-less'){state.storagePreviewLimit=0;save();render()}
 if(act==='route-modal'){state.routeEdit=false;openModal(renderRouteModal(),'route')}
 if(act==='route-edit'){state.routeEdit=true;openModal(renderRouteModal(),'route')}
 if(act==='route-cancel'){state.routeEdit=false;openModal(renderRouteModal(),'route')}
 if(act==='route-save')saveRouteManual();
 if(act==='route-export')exportJson('russian_route_plan_v12_15.json',{session:planSession(),allSessions:allRouteSessions(),version:VERSION});
 if(act==='route-request-regen'){if(routeResetLocked()){toast(routeResetLockMessage()); return;} confirmAction('route-request-regen-do','Reset lịch trình','Reset sẽ gửi yêu cầu tạo lại lịch trình hiện tại.'); return}
 if(act==='route-extra-time')requestMainSchedule('extra_time');
 if(act==='open-present'){closeFloatingLearningMenus();openModal(renderPresentation(),'presentation');return;}
 if(act==='pres-prev')moveSlide(-1,true);
 if(act==='pres-next')moveSlide(1,true);
 if(act==='pres-scroll-up'){const ps=presentationScroller(); if(ps)ps.scrollBy({top:-700,behavior:'smooth'});}
 if(act==='pres-scroll-down'){const ps=presentationScroller(); if(ps)ps.scrollBy({top:700,behavior:'smooth'});}
 if(act==='pres-scroll-top'){const ps=presentationScroller(); if(ps)ps.scrollTo({top:0,behavior:'smooth'});}
 if(act==='pres-scroll-bottom'){const ps=presentationScroller(); if(ps)ps.scrollTo({top:ps.scrollHeight,behavior:'smooth'});}
 if(act==='prev-slide')moveSlide(-1,false);
 if(act==='next-slide')moveSlide(1,false);
 if(act==='prev-test'){state.testIndex=Math.max(0,state.testIndex-1);state.testAnswer=null;save();render()}
 if(act==='next-test'){const qs=getTests(); state.testIndex=Math.min(Math.max(0,qs.length-1),state.testIndex+1);state.testAnswer=null;save();render()}
 if(act==='check-test'){const q=getTests()[state.testIndex%Math.max(1,getTests().length)]; const ai=A.testAnswerIndex?.(q); const ok=Number(ai)===Number(state.testAnswer); state.testSession.answered++; if(ok)state.testSession.correct++; toast(ok?'Đúng rồi':'Chưa đúng, xem lại giải thích'); save();render()}
 if(act==='prev-exercise'){const xs=getExercises(); state.exerciseIndex=Math.max(0,(Number(state.exerciseIndex)||0)-1); if(state.exerciseIndex>=xs.length)state.exerciseIndex=Math.max(0,xs.length-1); save();render();return}
 if(act==='next-exercise'){const xs=getExercises(); state.exerciseIndex=Math.min(Math.max(0,xs.length-1),(Number(state.exerciseIndex)||0)+1); save();render();return}
 if(act==='reset-review'){confirmAction('reset-review-do','Reset ôn tập','Reset sẽ xóa trạng thái đã làm, cắm cờ và câu sai trong tab Ôn tập.'); return}
 if(act==='prev-review'){const qs=getReviewQuestions(); const per=reviewPageSize(qs); state.reviewIndex=Math.max(0,state.reviewIndex-1);state.reviewPage=Math.floor(state.reviewIndex/per);state.reviewAnswer=null;save();render()}
 if(act==='next-review'){const qs=getReviewQuestions(); const per=reviewPageSize(qs); state.reviewIndex=Math.min(Math.max(0,qs.length-1),state.reviewIndex+1);state.reviewPage=Math.floor(state.reviewIndex/per);state.reviewAnswer=null;save();render()}
 if(act==='toggle-review-flag'){const q=getReviewQuestions()[state.reviewIndex]||{}; const id=questionId(q,state.reviewIndex,'review'); if(state.reviewProgress.flagged[id])delete state.reviewProgress.flagged[id]; else state.reviewProgress.flagged[id]=Date.now(); save();render()}
 if(act==='check-review'){const q=getReviewQuestions()[state.reviewIndex]||{}; if(state.reviewAnswer==null){toast('Chọn một đáp án trước khi kiểm thử'); return} const id=questionId(q,state.reviewIndex,'review'); const ok=Number(answerIndex(q))===Number(state.reviewAnswer); if(ok){state.reviewProgress.done[id]={at:Date.now(),ok:true,answer:state.reviewAnswer,lessonId:q.lessonId||'',skill:q.skill||'',level:state.reviewLevel,attempts:reviewAttemptCount(id)}; delete state.reviewProgress.wrong[id]; delete state.reviewProgress.flagged[id]; toast('Đúng rồi, đã mở giải thích và đánh dấu xanh');} else {const prev=state.reviewProgress.wrong[id]||{}; const attempts=Number(prev.attempts||0)+1; state.reviewProgress.wrong[id]={at:Date.now(),attempts,answer:state.reviewAnswer,lessonId:q.lessonId||'',skill:q.skill||'',topic:q.topic||'',needsReview:attempts>2}; delete state.reviewProgress.done[id]; if(attempts>2)state.reviewProgress.flagged[id]=Date.now(); toast(attempts>2?'Sai quá 2 lần: đã đưa vào diện cần ôn tập lại':'Sai rồi, làm lại');} const filtered=getReviewQuestions(); const per=reviewPageSize(filtered); if(state.reviewIndex>=filtered.length)state.reviewIndex=Math.max(0,filtered.length-1); state.reviewPage=Math.floor(state.reviewIndex/per); save();render()}
 if(act==='open-review-target'){const q=getReviewQuestions()[state.reviewIndex]||{}; const lessonId=str(q.lessonId||q.chapterId||q.lesson||q.moduleId||''); state.view='learning'; state.learnTab='theory'; if(lessonId)state.lessonId=lessonId; state.slide=0; save(); render(); toast(lessonId?'Đã mở bài học liên quan để ôn lại':'Đã mở Lý thuyết để ôn lại phần liên quan'); return}
 if(act==='open-today-route'){openModal(renderRouteModal(),'route');return}
 if(act==='complete-schedule-step'){const step=Number(b.dataset.scheduleStep)||0; const ev=scheduleTaskEvidence(step); if(markScheduleTask(step)){save();render();toast('Đã xác nhận bằng chứng và hoàn thành chặng '+step);}else toast(ev.reason||'Chưa đủ bằng chứng học để hoàn thành chặng.'); return}
 if(act==='unlock-stage-part'){unlockStagePart();return}
 if(act==='next-gate-paper'){nextGatePaper();return}
 if(act==='prev-exam'){state.examIndex=Math.max(0,state.examIndex-1);state.examPage=Math.floor(state.examIndex/examPageSize(activeExamLevel()));save();render()}
 if(act==='next-exam'){const qs=getExamQuestions(activeExamLevel()); state.examIndex=Math.min(Math.max(0,qs.length-1),state.examIndex+1);state.examPage=Math.floor(state.examIndex/examPageSize(activeExamLevel()));save();render()}
 
 if(act==='toggle-exam-mark'){const level=activeExamLevel(); if(examPaperResult(level))return; const q=getExamQuestions(level)[state.examIndex]||{}; const id=examQuestionId(q,state.examIndex,level); if(state.examProgress.marked[id])delete state.examProgress.marked[id]; else state.examProgress.marked[id]=Date.now(); save();render()}
 if(act==='submit-exam'){confirmAction('submit-exam-do','Nộp đề kiểm tra','Sau khi nộp, đề sẽ được chấm, khóa kết quả và ghi thống kê câu sai.'); return}
 if(act==='reset-exam'){if(routeResetLocked()){toast(routeResetLockMessage()); return;} confirmAction('reset-exam-do','Reset toàn bộ mốc kiểm tra','Reset sẽ xóa tiến độ/đáp án của toàn bộ mốc kiểm tra hiện tại.'); return}
 if(act==='reset-exam-paper'){confirmAction('reset-exam-paper-do','Reset đề hiện tại','Reset sẽ xóa đáp án và kết quả của đề đang mở.'); return}
 if(act==='exam-review-wrong'){state.learnTab='review';state.reviewFilter='wrong';state.reviewIndex=0;state.reviewPage=0;save();render();toast('Đã mở nhóm câu sai trong Ôn tập')}

 if(act==='open-exam-result'){const level=activeExamLevel(); openModal(renderExamResultModal(examPaperResult(level)||examProgressSummary(getExamQuestions(level),level)),'exam-result')}
 if(act==='create-remedial-review'){const sum=examPaperResult(activeExamLevel())||state.examProgress.result||examProgressSummary(); if(!sum||!arr(sum.wrong).length){toast('Không có câu sai để tạo phụ đạo'); return} createRemedialPlan(sum); state.view='overview'; state.learnTab='review'; state.reviewFilter='wrong'; state.reviewLesson='all'; state.reviewPage=0; state.reviewIndex=0; save(); closeModal(); render(); toast('Đã tạo Lịch trình phụ đạo ở Tổng quan')}
 if(act==='open-remedial-review'){state.view='learning'; state.learnTab='review'; state.reviewFilter='wrong'; state.reviewLesson='all'; state.reviewPage=0; state.reviewIndex=0; save(); render(); toast('Đã mở nhóm câu sai cần phụ đạo')}
 if(act==='clear-remedial'){confirmAction('clear-remedial-do','Ẩn phụ đạo','Ẩn lịch trình phụ đạo hiện tại khỏi Tổng quan.'); return}

 if(act==='open-speech-map')openModal(renderSpeakingMapModal(),'speech-map')
 if(act==='speak-line'){const d=currentDialogue(); const line=dialogueTurns(d)[activeLineIndex()]||{}; speak(line.ru||line.text||line.text_ru||line)}
 if(act==='speak-line-slow'){const d=currentDialogue(); const line=dialogueTurns(d)[activeLineIndex()]||{}; speak(line.ru||line.text||line.text_ru||line,.62)}
 if(act==='speak-dialogue'){speak(speakDialogue(currentDialogue()),.82)}
 if(act==='record-line')startLineRecording();
 if(act==='mark-line-ok'){const d=currentDialogue(), idx=activeLineIndex(), line=dialogueTurns(d)[idx]||{}; const store=activeSpeechResults(); store[dialogueLineKey(d,idx)]={score:100,transcript:dialogueText(line),target:dialogueText(line),at:Date.now(),ok:true,manual:true}; save(); render(); if(state.speechAutoNext)setTimeout(()=>moveDialogueLine(1),420);}
 if(act==='retry-line'){const d=currentDialogue(), idx=activeLineIndex(); const store=activeSpeechResults(); if(store)delete store[dialogueLineKey(d,idx)]; save(); render();}
 if(act==='toggle-auto-next'){state.speechAutoNext=!state.speechAutoNext;save();render();}
 if(act==='role-all'){setActiveRole('all');save();render()}
 if(act==='role-a'){setActiveRole('A');save();render()}
 if(act==='role-b'){setActiveRole('B');save();render()}
 if(act==='toggle-vi'){toggleActiveHideVi();save();render()}
 if(act==='prev-line')moveDialogueLine(-1);
 if(act==='next-line')moveDialogueLine(1);
 if(act==='next-role-line'){const d=currentDialogue(); setActiveLineIndex(nextRoleLineIndex(d,activeLineIndex(),1)); save(); render();}
 if(act==='deep-next'){state.deepSpeakingStep=(Number(state.deepSpeakingStep)||0)+1;save();render();return}
 if(act==='deep-prev'){state.deepSpeakingStep=Math.max(0,(Number(state.deepSpeakingStep)||0)-1);save();render();return}
 if(act==='deep-mark-ok'){const unit=currentDeepUnit(currentDialogue()); if(unit){const id=deepUnitKey(unit); state.deepSpeakingProgress.done[id]=Date.now(); delete state.deepSpeakingProgress.weak[id]; save();render();toast('Đã đánh dấu nói ổn');}return}
 if(act==='deep-mark-weak'){const unit=currentDeepUnit(currentDialogue()); if(unit){const id=deepUnitKey(unit); state.deepSpeakingProgress.weak[id]=Date.now(); save();render();toast('Đã đưa vào Ôn luyện nói sâu');}return}
 if(act==='prev-hand'){const h=getHandwriting(); state.handwritingIndex=h.length?(state.handwritingIndex-1+h.length)%h.length:0;state.handwritingStep=0;strokes=[];save();render()}
 if(act==='next-hand'){const h=getHandwriting(); state.handwritingIndex=h.length?(state.handwritingIndex+1)%h.length:0;state.handwritingStep=0;strokes=[];save();render()}
 if(act==='undo-canvas'){strokes.pop();drawCanvas()}
 if(act==='clear-line'){clearCurrentPracticeLine()}
 if(act==='clear-canvas'){strokes=[];drawCanvas()}
 if(act==='toggle-guide'){state.handwritingShowGuide=state.handwritingShowGuide===false;save();drawCanvas();render()}
 if(act==='toggle-lines'){state.handwritingShowLines=state.handwritingShowLines===false;save();drawCanvas();render()}
 if(act==='download-canvas')downloadCanvas();
 if(act==='prev-vocab'){state.vocabIndex=Math.max(0,state.vocabIndex-1);state.vocabPage=Math.floor(state.vocabIndex/(VOCAB_PAGE_SIZE||20));state.vocabFlipped=false;save();render()}
 if(act==='next-vocab'){const voc=getVocab();state.vocabIndex=voc.length?Math.min(voc.length-1,state.vocabIndex+1):0;state.vocabPage=Math.floor(state.vocabIndex/(VOCAB_PAGE_SIZE||20));state.vocabFlipped=false;save();render()}
 if(act==='speak-vocab'){const v=getVocab()[state.vocabIndex]||{}; speak(A.vocabTerm?.(v)||v.ru||v.phrase_ru)}
 if(act==='toggle-vocab-flip'){state.vocabFlipped=!state.vocabFlipped;save();render()}
 if(act==='open-hand-grid')openModal(renderHandGridModal(),'hand-grid');
 if(act==='media-groups')openModal(renderMediaGroupManager(),'media-groups');
 if(act==='media-group-add'){if(addMediaGroup($('#mgNew')?.value||'')){openModal(renderMediaGroupManager(),'media-groups');toast('Đã thêm nhóm Video/Audio')}}
 if(act==='media-group-rename'){const idx=Number(b.dataset.idx); const old=b.dataset.group||''; const val=$('#mgName'+idx)?.value||''; if(renameMediaGroup(old,val)){openModal(renderMediaGroupManager(),'media-groups');toast('Đã sửa tên nhóm')}}
 if(act==='media-group-delete'){state.pendingMediaGroupDelete=b.dataset.group||''; confirmAction('media-group-delete-do','Xóa nhóm Video/Audio','Xóa nhóm sẽ chuyển các video/audio trong nhóm này về “Video học tập”.'); return}
 if(act==='media-new')openModal(mediaForm({}));
 if(act==='media-edit'){const id=b.dataset.mediaEdit; const m=byStage(call('getMedia',[],DB)).find(x=>(x.id||x.title)===id)||{}; openModal(mediaForm(m));}
 if(act==='media-save'){const id=b.dataset.id; const list=Array.isArray(DB.videos)?DB.videos:[]; let m=list.find(x=>(x.id||x.title)===id); if(!m){m={id:'media_'+Date.now(),stage:state.stage==='all'?'vn':state.stage}; list.push(m); DB.videos=list;} Object.assign(m,{title:$('#mfTitle').value,category:$('#mfCat').value,genre:$('#mfCat').value,url:$('#mfUrl').value,iframe:$('#mfIframe').value,purpose:$('#mfPurpose').value,editableSource:true}); addMediaGroup($('#mfCat').value); saveDB(); closeModal(); render(); toast('Đã lưu media');}
 if(act==='export-db')exportJson('russian_db_v12_10.json',DB);
 if(act==='export-source')exportJson(`${state.storageFile}.json`,DB[state.storageFile]);
 if(act==='export-source-plan')exportJson(`${state.storageFile}_plan.json`,{id:state.storageFile,label:sourceLabel(state.storageFile),path:sourceFilePath(state.storageFile),plannedCount:sourcePlannedCount(state.storageFile),description:sourceDescription(state.storageFile),status:sourceStatus(state.storageFile,DB[state.storageFile])[0]});
 if(act==='modal-close')closeModal();
 if(act==='storage-reset-source'){confirmAction('storage-reset-source-do','Khôi phục nguồn dữ liệu','Khôi phục sẽ thay dữ liệu đang sửa bằng file gốc của nguồn '+state.storageFile+'.json.'); return;}
 if(act==='reset-db'){confirmAction('reset-db-do','Khôi phục toàn bộ dữ liệu','Khôi phục toàn bộ sẽ xóa dữ liệu đã lưu trong trình duyệt và tải lại dữ liệu gốc.'); return;}
}
function handleChange(e){
 if(e.target.id==='stageSelect'){state.stage=e.target.value;save();render();return}
 if(e.target.id==='storageImport'){
   const file=e.target.files&&e.target.files[0]; if(!file)return;
   const reader=new FileReader();
   reader.onload=ev=>{try{DB[state.storageFile]=JSON.parse(ev.target.result);state.storageText='';state.storagePreviewLimit=0;saveDB();toast('Đã nhập '+state.storageFile+'.json');render()}catch(err){toast('File JSON chưa hợp lệ')}};
   reader.readAsText(file); e.target.value=''; return;
 }
 if(e.target.dataset.input)applyInput(e.target)
}
function handleInput(e){
 const k=e.target.dataset.input;
 if(e.target.id==='penSize'){penSize=Number(e.target.value)||6;return;} if(!k||['dialogueGroup','dialogueDifficulty','practiceGroup','practiceDifficulty','deepSpeakingId','mediaCat','testLevel','reviewLevel','reviewFilter','reviewLesson','examLevel','examCycle','examPaperType','examPaperLevel'].includes(k))return;
 if(k==='writingDraft'){state[k]=e.target.value; save(); return;}
 clearTimeout(handleInput.t); handleInput.t=setTimeout(()=>applyInput(e.target),180)
}
function handleKeys(e){
 const tag=(e.target?.tagName||'').toLowerCase(); const typing=['input','textarea','select'].includes(tag);
 if(state.modalType==='presentation'){
   if(e.key==='Escape'){closeModal();e.preventDefault();return}
   if(e.key==='ArrowLeft'){moveSlide(-1,true);e.preventDefault();return}
   if(e.key==='ArrowRight'){moveSlide(1,true);e.preventDefault();return}
   if(e.key===' '){moveSlide(e.shiftKey?-1:1,true);e.preventDefault();return}
   if(e.key==='Home'){state.slide=0;rerenderPresentation();e.preventDefault();return}
   if(e.key==='End'){const lesson=currentLesson(); const info=clampSlideIndex(lesson); state.slide=info.max; rerenderPresentation();e.preventDefault();return}
   if(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='PageDown'||e.key==='PageUp'){
     const ps=presentationScroller(); if(ps){const dir=(e.key==='ArrowDown'||e.key==='PageDown')?1:-1; ps.scrollBy({top:dir*(e.key.includes('Page')?720:300),behavior:'smooth'}); e.preventDefault();}
     return
   }
 }
 if(typing)return;
 if(state.view==='learning'&&state.learnTab==='theory'){
   if(e.key==='ArrowLeft'){moveSlide(-1,false);e.preventDefault();return}
   if(e.key==='ArrowRight'){moveSlide(1,false);e.preventDefault();return}
   if(e.key==='ArrowDown'||e.key==='ArrowUp'){const sb=$('.slidebox'); if(sb){sb.scrollBy({top:e.key==='ArrowDown'?240:-240,behavior:'smooth'}); e.preventDefault();}}
 }
 if(state.view==='dialogue'){
   const k=e.key.toLowerCase();
   if(e.key==='ArrowLeft'){moveDialogueLine(-1);e.preventDefault();return}
   if(e.key==='ArrowRight'){moveDialogueLine(1);e.preventDefault();return}
   if(k==='r'||e.key==='Enter'){startLineRecording();e.preventDefault();return}
   if(k==='l'){const d=currentDialogue(); const line=dialogueTurns(d)[activeLineIndex()]||{}; speak(line.ru||line.text||line.text_ru||line);e.preventDefault();return}
   if(k==='s'){const d=currentDialogue(); const line=dialogueTurns(d)[activeLineIndex()]||{}; speak(line.ru||line.text||line.text_ru||line,.62);e.preventDefault();return}
   if(k==='n'){const d=currentDialogue(); setActiveLineIndex(nextRoleLineIndex(d,activeLineIndex(),1)); save(); render();e.preventDefault();return}
   if(k==='v'){toggleActiveHideVi(); save(); render();e.preventDefault();return}
   if(k==='a'){setActiveRole('A'); save(); render();e.preventDefault();return}
   if(k==='b'){setActiveRole('B'); save(); render();e.preventDefault();return}
   if(k==='0'){setActiveRole('all'); save(); render();e.preventDefault();return}
 }
 if(state.view==='writing'&&state.writingMode==='handwriting'){
   const h=getHandwriting(), item=h[state.handwritingIndex]||{}, steps=handwritingStrokeSteps(item);
   if(e.key==='ArrowLeft'){state.handwritingIndex=h.length?(state.handwritingIndex-1+h.length)%h.length:0;state.handwritingStep=0;strokes=[];save();render();e.preventDefault();return}
   if(e.key==='ArrowRight'){state.handwritingIndex=h.length?(state.handwritingIndex+1)%h.length:0;state.handwritingStep=0;strokes=[];save();render();e.preventDefault();return}
   if(e.key==='ArrowUp'){state.handwritingStep=Math.max(0,state.handwritingStep-1);save();render();e.preventDefault();return}
   if(e.key==='ArrowDown'){state.handwritingStep=Math.min(Math.max(0,steps.length-1),state.handwritingStep+1);save();render();e.preventDefault();return}
   if(e.key==='Backspace'){strokes.pop();drawCanvas();e.preventDefault();return}
 }
 if(state.view==='vocab'){
   if(e.key==='ArrowLeft'){state.vocabIndex=Math.max(0,state.vocabIndex-1);save();render();e.preventDefault();return}
   if(e.key==='ArrowRight'){state.vocabIndex++;save();render();e.preventDefault();return}
 }
 if(state.view==='grammar'){
   if(e.key==='ArrowLeft'){state.grammarIndex=Math.max(0,state.grammarIndex-1);save();render();e.preventDefault();return}
   if(e.key==='ArrowRight'){state.grammarIndex++;save();render();e.preventDefault();return}
 }
}
function bridge(){
 const incoming=['BAUMAN_ASSIGN_TASK','BAUMAN_PLANNING_MISSION','BAUMAN_TODAY_TASK','BAUMAN_MAIN_TODAY','BAUMAN_TODAY_GOAL','BAUMAN_SCHEDULE_TODAY'];
 const status=A.exportSubjectStatus?A.exportSubjectStatus():{subjectId:A.id||'russian',version:VERSION,packageRoot:PACKAGE_ROOT,entry:'subjects/russian/index.html',dataFiles:DATA_FILES,selfContained:true};
 const manifest=window.SUBJECT_MANIFEST||{};
 const send=(payload={})=>window.BaumanSubjectHost?.send?.(payload);
 const ready=()=>{
   send({type:'BAUMAN_SUBJECT_READY',subjectId:A.id||'russian',version:VERSION,manifest,packageStatus:status,source:'subjects/russian'});
   send({type:'BAUMAN_SUBJECT_DATA_SOURCES_READY',subjectId:A.id||'russian',dataRoot:DATA_ROOT,externalDataRoot:EXTERNAL_DATA_ROOT,dataFiles:ALL_STORAGE_FILES.map(f=>({id:f,path:sourceFilePath(f),count:sourceCount(f,DB[f]),status:sourceStatus(f,DB[f])[0],optional:isOptionalFile(f)}))});
   send({type:'BAUMAN_SUBJECT_REQUEST_TODAY',subjectId:A.id||'russian'});
 };
 const acceptTask=d=>{
   if(!incoming.includes(d?.type))return;
   state.hostTask=d.task||d.mission||d.today||d;
   if(d.bundle||d.planningBundle)state.planningBundle=d.bundle||d.planningBundle;
   else if(window.BaumanPlanningBridge){try{state.planningBundle=window.BaumanPlanningBridge.acceptMission(state.hostTask,{adapter:A,db:DB})}catch(_){}}
   save();render();toast('Đã nhận mission từ Main');
 };
 window.BaumanSubjectHost?.onTask?.(acceptTask);
 window.addEventListener('message',e=>{
   if(!window.BaumanSubjectHost?.trusted?.(e))return;
   const d=e.data||{};
   if(d.type==='BAUMAN_REQUEST_SUBJECT_MANIFEST'||d.type==='BAUMAN_PING'){
     send({type:'BAUMAN_SUBJECT_MANIFEST',subjectId:A.id||'russian',manifest,packageStatus:status});
     if(d.type==='BAUMAN_PING')send({type:'BAUMAN_PONG',subjectId:A.id||'russian',version:VERSION});
     return;
   }
 });
 ready();
}
async function init(){loadState(); await loadData(); buildShell(); document.addEventListener('pointerdown',handleMindMapDrag,{passive:true}); document.addEventListener('pointerover',handleMindMapHover,{passive:true}); document.addEventListener('pointerout',handleMindMapHoverOut,{passive:true}); document.addEventListener('dblclick',handleMindMapDoubleClick); document.addEventListener('click',handleClick); document.addEventListener('change',handleChange); document.addEventListener('input',handleInput); document.addEventListener('keydown',handleKeys); window.addEventListener('resize',()=>{if(state.view==='mindmap')requestAnimationFrame(()=>updateMindMapConnectors(document.querySelector('[data-mindmap-canvas=\"1\"]')));},{passive:true}); $('#modalClose').addEventListener('click',closeModal); $('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()}); $('#themeBtn').addEventListener('click',()=>openModal(renderInterfaceModal(),'interface')); $('#aiBtn').addEventListener('click',()=>openModal(renderAiMentor(),'ai')); bridge(); render(); }
init();
})();
