'use strict';
(function(){
const CORE_KEY=window.SUBJECT_ADAPTER?.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
const BANDS=[
 {id:'R0',title:'Nền âm & sinh tồn',lessonIds:['R01','R02','R03','R04'],stages:['vn'],steps:['theory','speaking','check'],writingNeed:0,rewriteNeed:0,goal:'Nghe âm cơ bản, nói câu sinh tồn và tự sửa lỗi trước khi tăng tải học thuật.'},
 {id:'R1',title:'Dự bị học thuật',lessonIds:['R05','R06','R07','R08','R09','R10'],stages:['vn','prep'],steps:['theory','speaking','check'],writingNeed:1,rewriteNeed:0,goal:'Đọc đề Toán-Tin, theo lớp dự bị, hỏi lại và trình bày ngắn bằng tiếng Nga.'},
 {id:'R2',title:'Bauman coursework',lessonIds:['R11','R12','R13','R14'],stages:['hk1'],steps:['theory','speaking','check'],writingNeed:1,rewriteNeed:0,goal:'Nghe giảng, đọc syllabus, thảo luận nhóm và trình bày bài toán kỹ thuật.'},
 {id:'R3',title:'AI/ML · НИР · seminar',lessonIds:['R15','R16','R17','R18','R19','R20','R21','R22'],stages:['hk2','hk3'],steps:['theory','speaking','check'],writingNeed:2,rewriteNeed:1,goal:'Đọc tài liệu kỹ thuật, viết báo cáo nghiên cứu, seminar và phản biện khoa học.'},
 {id:'R4',title:'ВКР & bảo vệ',lessonIds:['R23','R24','R25','R26'],stages:['hk4'],steps:['theory','speaking','check'],writingNeed:2,rewriteNeed:1,goal:'Hoàn thiện ngôn ngữ luận văn, slide bảo vệ và trả lời hội đồng.'}
];
const STAGE_RULES={
 vn:{steps:['theory','speaking','check'],writingNeed:0,rewriteNeed:0},
 prep:{steps:['theory','speaking','check'],writingNeed:1,rewriteNeed:0},
 hk1:{steps:['theory','speaking','check'],writingNeed:1,rewriteNeed:0},
 hk2:{steps:['theory','speaking','check'],writingNeed:1,rewriteNeed:0},
 hk3:{steps:['theory','speaking','check'],writingNeed:2,rewriteNeed:1},
 hk4:{steps:['theory','speaking','check'],writingNeed:2,rewriteNeed:1}
};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clean=v=>String(v??'').trim();
const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
let curriculum={stages:[],modules:[]},writing=[],ready=false,queued=false,lastSig='';
const core=()=>parse(localStorage.getItem(CORE_KEY),{});
const flow=()=>window.RussianLearningFlow?.get?.()||{lessons:{}};
const reviews=()=>{try{return window.RussianLearningState?.dueReviews?.()||[]}catch(_){return []}};
const academic=()=>window.RussianAcademicLanguage?.get?.()||{writing:{}};
function moduleForStage(stageId){return (curriculum.modules||[]).find(x=>clean(x.stage||x.id)===stageId)||null}
function stageLessonIds(stageId){return (moduleForStage(stageId)?.lessonIds||[]).map(clean).filter(Boolean)}
function rowHas(step,row){return !!window.RussianLearningFlow?.hasMeaningfulEvidence?.(step,row)}
function lessonEvidence(lessonId,steps){
 const ls=flow().lessons?.[lessonId]||{steps:{}};
 const detail=(steps||[]).map(step=>({step,ok:rowHas(step,ls.steps?.[step])}));
 return {lessonId,ready:detail.every(x=>x.ok),detail};
}
function dueForLessons(ids){
 const set=new Set(ids);
 return reviews().filter(item=>set.has(clean(item?.lessonId||item?.route?.lessonId)));
}
function writingStatsForStages(stages){
 const stageSet=new Set(stages||[]),records=academic().writing||{};
 const ids=writing.filter(x=>stageSet.has(clean(x.stage))).map(x=>clean(x.id||x.title)).filter(Boolean);
 let withSnapshot=0,rewrites=0;
 ids.forEach(id=>{
  const row=records[id]||{},shots=Array.isArray(row.snapshots)?row.snapshots:[];
  if(shots.length)withSnapshot++;
  rewrites+=shots.filter(x=>x?.kind==='rewrite').length;
 });
 return {taskIds:ids,withSnapshot,rewrites};
}
function statusForLessons(ids,steps){
 const lessons=ids.map(id=>lessonEvidence(id,steps));
 return {lessons,ready:lessons.filter(x=>x.ready).length,total:lessons.length};
}
function bandStatus(indexOrId){
 const index=typeof indexOrId==='number'?indexOrId:BANDS.findIndex(x=>x.id===indexOrId);
 const band=BANDS[Math.max(0,index)]||BANDS[0],lesson=statusForLessons(band.lessonIds,band.steps),due=dueForLessons(band.lessonIds),w=writingStatsForStages(band.stages);
 const writingOk=w.withSnapshot>=band.writingNeed&&w.rewrites>=band.rewriteNeed;
 const complete=lesson.total>0&&lesson.ready===lesson.total&&due.length===0&&writingOk;
 const previous=index<=0?null:bandStatus(index-1);
 const unlocked=index===0||!!previous?.complete;
 const missingLesson=lesson.lessons.find(x=>!x.ready)?.lessonId||'';
 return {...band,index,unlocked,complete,lessonReady:lesson.ready,lessonTotal:lesson.total,dueCount:due.length,writing:w.withSnapshot,rewrites:w.rewrites,writingOk,missingLesson};
}
function allBands(){return BANDS.map((_,i)=>bandStatus(i))}
function currentBand(){
 const rows=allBands();
 return rows.find(x=>x.unlocked&&!x.complete)||rows[rows.length-1];
}
function stageExitStatus(stageId){
 const id=clean(stageId),rule=STAGE_RULES[id]||{steps:['theory','speaking','check'],writingNeed:0,rewriteNeed:0};
 const ids=stageLessonIds(id),lesson=statusForLessons(ids,rule.steps),due=dueForLessons(ids),w=writingStatsForStages([id]);
 const writingOk=w.withSnapshot>=rule.writingNeed&&w.rewrites>=rule.rewriteNeed;
 const allowed=ids.length>0&&lesson.ready===lesson.total&&due.length===0&&writingOk;
 const blockers=[];
 if(!ids.length)blockers.push('Stage chưa có lessonIds để xác minh.');
 if(lesson.ready<lesson.total)blockers.push(`Còn ${lesson.total-lesson.ready} bài chưa đủ bằng chứng theory + speaking + check.`);
 if(due.length)blockers.push(`Còn ${due.length} mục Review Queue đến hạn trong stage.`);
 if(w.withSnapshot<rule.writingNeed)blockers.push(`Cần thêm ${rule.writingNeed-w.withSnapshot} nhiệm vụ viết có snapshot.`);
 if(w.rewrites<rule.rewriteNeed)blockers.push(`Cần thêm ${rule.rewriteNeed-w.rewrites} lượt viết lại có bằng chứng.`);
 return {stage:id,allowed,lessonReady:lesson.ready,lessonTotal:lesson.total,dueCount:due.length,writing:w.withSnapshot,rewrites:w.rewrites,rule,blockers,lessonIds:ids};
}
function routeAttr(id){return esc(JSON.stringify({view:'learning',learnTab:'theory',lessonId:id}))}
function bandCard(x){
 const state=x.complete?'done':x.unlocked?'active':'locked';
 const writingBits=x.writingNeed?[`viết ${x.writing}/${x.writingNeed}`,x.rewriteNeed?`viết lại ${x.rewrites}/${x.rewriteNeed}`:''].filter(Boolean).join(' · '):'không bắt buộc viết';
 const action=x.complete?'Đã hoàn tất':x.unlocked?(x.missingLesson?`Mở ${x.missingLesson}`:'Tiếp tục củng cố'):'Hoàn tất cấp trước';
 const button=x.unlocked&&!x.complete&&x.missingLesson?`<button class="btn soft" data-route='${routeAttr(x.missingLesson)}'>${esc(action)}</button>`:`<button class="btn soft" disabled>${esc(action)}</button>`;
 return `<article class="ru-cap-band ${state}"><header><span>${esc(x.id)}</span><div><b>${esc(x.title)}</b><small>${esc(x.goal)}</small></div></header><div class="ru-cap-metrics"><span><b>${x.lessonReady}/${x.lessonTotal}</b><small>bài đủ evidence</small></span><span><b>${x.dueCount}</b><small>review đến hạn</small></span><span><b>${esc(writingBits)}</b><small>bằng chứng viết</small></span></div>${button}</article>`;
}
function panelHtml(){
 const bands=allBands(),cur=currentBand(),c=core(),stage=stageExitStatus(clean(c.stage)||'vn');
 return `<section class="panel ru-capability-roadmap"><header class="ru-cap-head"><div><span class="chip">R0 → R4 · NĂNG LỰC THẬT</span><h3>${esc(cur.id)} · ${esc(cur.title)}</h3><p>R0–R4 là trục năng lực xuyên suốt các học kỳ, không thay thế stage thời gian và không phải nhãn CEFR. Chỉ tiến khi có bằng chứng học thật.</p></div><aside><b>${stage.lessonReady}/${stage.lessonTotal}</b><span>bài đủ điều kiện rời stage</span><small>${stage.allowed?'Stage-exit sẵn sàng':esc(stage.blockers[0]||'Còn điều kiện chưa đạt')}</small></aside></header><div class="ru-cap-grid">${bands.map(bandCard).join('')}</div></section>`;
}
function signature(){
 const c=core(),f=flow(),r=window.RussianLearningState?.get?.()||{},a=academic();
 return JSON.stringify([c.view,c.stage,f.updatedAt,r.updatedAt,a.updatedAt,ready]);
}
function render(){
 if(!ready)return;
 const view=document.getElementById('view');if(!view)return;
 const c=core();
 if((c.view||'overview')!=='overview'){document.getElementById('ruCapabilityRoadmap')?.remove();lastSig='';return;}
 const sig=signature();if(sig===lastSig)return;lastSig=sig;
 let panel=document.getElementById('ruCapabilityRoadmap');
 if(!panel){panel=document.createElement('div');panel.id='ruCapabilityRoadmap';view.prepend(panel);}
 panel.innerHTML=panelHtml();
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render()})}
document.addEventListener('DOMContentLoaded',async()=>{
 try{
  const [c,w]=await Promise.all([
   fetch('data/curriculum.json',{cache:'force-cache'}).then(r=>r.ok?r.json():{stages:[],modules:[]}),
   fetch('data/writing.json',{cache:'force-cache'}).then(r=>r.ok?r.json():[])
  ]);
  curriculum=c&&typeof c==='object'?c:{stages:[],modules:[]};writing=Array.isArray(w)?w:[];
 }catch(e){console.warn('Russian capability progression data load failed',e)}
 ready=true;schedule();
 const view=document.getElementById('view');if(view)new MutationObserver(schedule).observe(view,{childList:true,subtree:false});
});
window.addEventListener('russian:learning-state',schedule);
document.addEventListener('click',()=>setTimeout(schedule,30),true);
window.RussianCapabilityProgression={bands:BANDS,stageRules:STAGE_RULES,bandStatus,allBands,currentBand,stageExitStatus,schedule};
})();