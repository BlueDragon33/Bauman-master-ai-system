/* Bauman Hub · Search + Home Summary V2
 * User-facing information architecture layer.
 * Keeps canonical routes/data ownership in main.js and only improves navigation/presentation.
 */
(()=>{
'use strict';
const RELEASE='HUB_SEARCH_HOME_SUMMARY_V2_2026_09';
const q=(s,r=document)=>r.querySelector(s);
const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const S=()=>typeof state!=='undefined'&&state?state:{};
const D=()=>typeof DATA!=='undefined'&&DATA?DATA:(window.BAUMAN_DATA||{});
const A=()=>typeof app!=='undefined'?app:null;
const saveState=()=>{try{if(typeof save==='function')save()}catch{}};
const closeSearch=()=>{try{if(typeof closeModal==='function')closeModal()}catch{}};
const normalize=text=>String(text??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9\u0400-\u04ff]+/g,' ').trim();
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};

function overallProgress(){
  const ids=Object.keys(S().subjects||{});
  return ids.length?Math.round(ids.reduce((sum,id)=>sum+Math.max(0,Math.min(100,Number(S().progress?.[id])||0)),0)/ids.length):0;
}
function routeItem(){
  const id=S().roadmapStage||S().schedule?.autoStage||'prepare';
  const all=[...(D().stages||[]),...(D().semesters||[])];
  return all.find(x=>x.id===id)||D().stages?.[0]||{id:'prepare',name:'Lộ trình Bauman',period:'',goal:'Mở Lộ trình để xem giai đoạn hiện tại.'};
}
function resumeSubject(){
  const s=S(),id=s.lastStudy?.subjectId||s.subject;
  return s.subjects?.[id]||s.subjects?.[s.subject]||Object.values(s.subjects||{})[0]||{};
}
function nextSchedule(){
  const rows=[];
  for(const [key,val] of Object.entries(S().schedule?.entries||{})){
    const parts=key.split('|'),date=parts[0],slotId=parts[1];
    if(!date||date<today())continue;
    rows.push({date,slotId,...val});
  }
  return rows.sort((a,b)=>(a.date+'|'+a.slotId).localeCompare(b.date+'|'+b.slotId))[0]||null;
}
function researchFocus(){
  try{
    const topics=typeof RESEARCH_TOPICS!=='undefined'?RESEARCH_TOPICS:{};
    const item=topics[S().researchTopic||'ugv'];
    return item?.title?.split('·')[0]?.trim()||'НИР / ВКР';
  }catch{return 'НИР / ВКР'}
}
function homeHTML(){
  const route=routeItem(),resume=resumeSubject(),pct=Math.max(0,Math.min(100,Number(S().progress?.[resume.id])||0));
  const next=nextSchedule(),reviews=(S().reviewQueue||[]).length,overall=overallProgress();
  const routeGoal=route.goal||route.focus||'Theo dõi mục tiêu và học phần của giai đoạn hiện tại.';
  const nextText=next?(next.learningItem||next.label||S().subjects?.[next.subjectId]?.name||'Học theo lịch'):'Chưa có ca học sắp tới';
  const nextWhen=next?(next.date+(next.slotId?' · '+next.slotId:'')):'Mở Lịch học để sắp xếp';
  return '<div class="hub-v2-home">'
    +'<section class="hub-v2-overview-hero">'
      +'<div class="hub-v2-overview-copy"><span class="hub-v2-eyebrow">GIAI ĐOẠN HIỆN TẠI</span><h1>'+safe(route.name||'Lộ trình Bauman')+'</h1><p>'+safe(routeGoal)+'</p><small>'+safe(route.period||'')+'</small>'
      +'<div class="hub-v2-home-actions"><button class="btn hub-safe-gold" data-hub-v2-action="continue">Tiếp tục học →</button><button class="btn hub-safe-outline" data-hub-v2-action="roadmap">Xem lộ trình</button></div></div>'
      +'<div class="hub-v2-route-mark"><b>'+safe(String(route.id||'').toUpperCase())+'</b><span>Bauman Master Hub</span></div>'
    +'</section>'
    +'<section class="hub-v2-resume-card">'
      +'<div class="hub-v2-resume-main"><span class="hub-v2-eyebrow">TIẾP TỤC TỪ NƠI GẦN NHẤT</span><h2>'+safe(resume.name||'Môn học')+'</h2><p>'+safe(nextText)+'</p><small>'+safe(nextWhen)+'</small></div>'
      +'<div class="hub-v2-resume-progress"><div class="hub-v2-progress-ring" style="--pct:'+pct+'"><b>'+pct+'%</b></div><span>Tiến độ môn</span></div>'
      +'<button class="btn hub-safe-gold" data-hub-v2-action="continue">Mở lại</button>'
    +'</section>'
    +'<section class="hub-v2-system-strip" aria-label="Tổng quan hệ thống">'
      +'<button data-hub-v2-action="progress"><small>Tiến độ chung</small><b>'+overall+'%</b><span>Xem chi tiết</span></button>'
      +'<button data-hub-v2-action="review"><small>Cần ôn</small><b>'+reviews+'</b><span>'+(reviews?'Ưu tiên xử lý':'Không có tồn đọng')+'</span></button>'
      +'<button data-hub-v2-action="schedule"><small>Ca kế tiếp</small><b>'+safe(next?.date||'—')+'</b><span>'+safe(nextText)+'</span></button>'
      +'<button data-hub-v2-action="research"><small>НИР / ВКР</small><b>'+safe(researchFocus())+'</b><span>Mở hướng nghiên cứu</span></button>'
    +'</section>'
  +'</div>';
}
function compactHome(){
  const host=q('#page-home');
  if(!host||!host.classList.contains('active'))return false;
  const dashboard=q('.hub-safe-dashboard',host),original=q('.canva-dashboard-page',host),label=q('.hub-safe-preserved-label',host);
  if(!dashboard||!original)return false;
  dashboard.innerHTML=homeHTML();
  dashboard.dataset.homeSummaryV2=RELEASE;
  original.classList.add('hub-safe-preserved-collapsed','hub-v2-canonical-hidden');
  if(label)label.classList.add('hub-v2-canonical-hidden');
  host.dataset.homeMode='summary-v2';
  return true;
}

function scoreItem(item,query){
  const nq=normalize(query),tokens=nq.split(/\s+/).filter(Boolean);
  if(!tokens.length)return 0;
  const title=normalize(item.title),id=normalize(item.id),keywords=normalize(item.keywords),hay=(title+' '+id+' '+keywords).trim();
  if(!tokens.every(t=>hay.includes(t)))return 0;
  let score=10;
  if(id===nq)score+=900;
  if(title===nq)score+=850;
  else if(title.startsWith(nq))score+=500;
  else if(title.includes(nq))score+=320;
  for(const t of tokens){
    if(title.split(' ').includes(t))score+=110;
    else if(title.includes(t))score+=70;
    if(id.includes(t))score+=80;
    if(keywords.includes(t))score+=25;
  }
  score+=Number(item.weight||0);
  return score;
}
function searchIndex(){
  const s=S(),d=D(),items=[];
  const pages=[
    {id:'home',title:'Trang chủ',keywords:'tong quan dashboard bat dau',weight:10},
    {id:'roadmap',title:'Lộ trình',keywords:'lo trinh roadmap giai doan hoc ky bauman',weight:40},
    {id:'subjects',title:'Môn học',keywords:'mon hoc khoa hoc module',weight:30},
    {id:'schedule',title:'Lịch học',keywords:'lich thoi khoa bieu schedule ca hoc tu dong',weight:30},
    {id:'research',title:'НИР & Luận văn',keywords:'nir vkr luan van nghien cuu thesis research',weight:30}
  ];
  pages.forEach(x=>items.push({kind:'page',category:'Trang',...x}));
  Object.values(s.subjects||{}).forEach(x=>items.push({kind:'subject',category:'Môn học',id:x.id,title:x.name,subtitle:x.main||x.desc||'',keywords:[x.id,x.desc,x.main,...(x.eq||[]),...(x.stages||[])].join(' '),subjectId:x.id,weight:90}));
  (d.courses||[]).forEach(x=>{
    const sub=s.subjects?.[x.subject];
    items.push({kind:'course',category:'Học phần',id:x.id,title:x.name||x.vi||x.id,subtitle:(sub?.name||x.subject||'')+' · '+String(x.stage||'').toUpperCase(),keywords:[x.id,x.name,x.vi,x.ru,x.note,x.subject,x.stage,x.routeRole,x.projectUse,x.deliverable,...(x.competencies||[])].join(' '),courseId:x.id,subjectId:x.subject,stage:x.stage,weight:70});
  });
  [...(d.stages||[]),...(d.semesters||[])].forEach((x,i)=>items.push({kind:'stage',category:x.id?.startsWith('m')?'Học kỳ':'Giai đoạn',id:x.id,title:x.name,subtitle:x.period||'',keywords:[x.id,x.group,x.name,x.period,x.goal,x.focus,'gd'+(i+1),'hk'+String(x.id||'').replace('m','')].join(' '),stageId:x.id,weight:55}));
  try{
    const topics=typeof RESEARCH_TOPICS!=='undefined'?RESEARCH_TOPICS:{};
    Object.entries(topics).forEach(([id,x])=>items.push({kind:'research',category:'НИР / ВКР',id,title:x.title,subtitle:x.short||'',keywords:[id,x.title,x.short,...(x.questions||[]),...(x.data||[]),...(x.hardware||[]),...(x.outputs||[]),...(x.risks||[]),...(x.tasks||[])].join(' '),researchId:id,weight:60}));
  }catch{}
  return items;
}
function searchCatalog(query,limit=20){
  return searchIndex().map(item=>({...item,score:scoreItem(item,query)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,'vi')).slice(0,limit);
}
function resultAttrs(x){
  let attrs=' data-hub-search-kind="'+safe(x.kind)+'"';
  if(x.subjectId)attrs+=' data-hub-search-subject="'+safe(x.subjectId)+'"';
  if(x.courseId)attrs+=' data-hub-search-course="'+safe(x.courseId)+'"';
  if(x.stage)attrs+=' data-hub-search-course-stage="'+safe(x.stage)+'"';
  if(x.stageId)attrs+=' data-hub-search-stage="'+safe(x.stageId)+'"';
  if(x.researchId)attrs+=' data-hub-search-research="'+safe(x.researchId)+'"';
  if(x.kind==='page')attrs+=' data-hub-search-page="'+safe(x.id)+'"';
  return attrs;
}
function showSearch(query){
  const text=String(query||'').trim(),results=searchCatalog(text);
  const body=!text
    ?'<div class="hub-v2-search-empty"><b>Tìm trong toàn bộ Bauman Hub</b><p>Thử: <strong>toan</strong>, <strong>Python</strong>, <strong>M1</strong>, <strong>UGV</strong>, <strong>lịch</strong>, <strong>НИР</strong>.</p></div>'
    :'<div class="hub-v2-search-head"><b>'+results.length+' kết quả</b><span>'+safe(text)+'</span></div><div class="hub-v2-search-results">'
      +(results.map(x=>'<button class="hub-v2-search-result"'+resultAttrs(x)+'><span class="hub-v2-search-kind">'+safe(x.category)+'</span><b>'+safe(x.title)+'</b><small>'+safe(x.subtitle||'Mở nội dung')+'</small></button>').join('')||'<div class="hub-v2-search-empty"><b>Không tìm thấy kết quả phù hợp</b><p>Thử từ khóa ngắn hơn, không dấu, mã học kỳ hoặc tên môn/học phần.</p></div>')
      +'</div>';
  try{if(typeof openModal==='function')openModal('Tìm kiếm toàn hệ thống',body,true)}catch{}
  return results;
}
function openSearchResult(el){
  const kind=el?.dataset?.hubSearchKind,a=A(),s=S();
  if(!kind||!a)return false;
  if(kind==='page'){closeSearch();a.page?.(el.dataset.hubSearchPage);return true}
  if(kind==='subject'){
    const id=el.dataset.hubSearchSubject,sub=s.subjects?.[id];if(!sub)return false;
    s.subject=id;s.searchFocusCourseId='';
    const allowed=sub.stages||[];
    if(allowed.length&&!allowed.includes(s.subjectStage))s.subjectStage=allowed[0];
    saveState();closeSearch();a.page?.('subjects');a.subjects?.();return true;
  }
  if(kind==='course'){
    const id=el.dataset.hubSearchSubject,stage=el.dataset.hubSearchCourseStage,courseId=el.dataset.hubSearchCourse;
    if(!s.subjects?.[id])return false;
    s.subject=id;s.searchFocusCourseId=courseId;if(stage)s.subjectStage=stage;saveState();closeSearch();a.page?.('subjects');a.subjects?.();
    setTimeout(()=>{const card=q('[data-course-id="'+CSS.escape(courseId)+'"]');if(card){card.classList.add('hub-v2-search-hit');card.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>card.classList.remove('hub-v2-search-hit'),1800)}},30);
    return true;
  }
  if(kind==='stage'){
    s.roadmapStage=el.dataset.hubSearchStage;saveState();closeSearch();a.page?.('roadmap');a.roadmap?.();return true;
  }
  if(kind==='research'){
    s.researchTopic=el.dataset.hubSearchResearch;saveState();closeSearch();a.page?.('research');a.research?.();return true;
  }
  return false;
}
function installSearch(){
  const input=q('#hubSafeSearch');if(!input||input.dataset.searchV2==='1')return false;
  input.dataset.searchV2='1';
  input.placeholder='Tìm môn, học phần, GĐ/HK, НИР...';
  input.setAttribute('aria-label','Tìm kiếm toàn Bauman Hub');
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();showSearch(input.value)}},true);
  const label=input.closest('.hub-safe-search');
  if(label&&!q('[data-hub-search-submit]',label)){
    const button=document.createElement('button');button.type='button';button.className='hub-v2-search-submit';button.dataset.hubSearchSubmit='1';button.title='Tìm kiếm';button.setAttribute('aria-label','Tìm kiếm');button.textContent='⌕';label.appendChild(button);
  }
  return true;
}
function handleHomeAction(id){
  const a=A();if(!a)return;
  if(id==='continue')return a.continueStudy?.();
  if(id==='roadmap')return a.page?.('roadmap');
  if(id==='schedule')return a.page?.('schedule');
  if(id==='research')return a.page?.('research');
  if(id==='review'){
    const item=(S().reviewQueue||[])[0];
    if(item?.subjectId&&S().subjects?.[item.subjectId])return a.openSubjectInPage?.(item.subjectId);
    return a.page?.('subjects');
  }
  if(id==='progress')return a.openHomeFrame?.('progress');
}
function bind(){
  document.addEventListener('click',e=>{
    const result=e.target.closest('[data-hub-search-kind]');if(result){e.preventDefault();e.stopImmediatePropagation();openSearchResult(result);return}
    const submit=e.target.closest('[data-hub-search-submit]');if(submit){e.preventDefault();e.stopImmediatePropagation();showSearch(q('#hubSafeSearch')?.value||'');return}
    const action=e.target.closest('[data-hub-v2-action]');if(action){e.preventDefault();e.stopImmediatePropagation();handleHomeAction(action.dataset.hubV2Action);return}
  },true);
}
let observer=null;
function install(){
  installSearch();
  compactHome();
  const host=q('#page-home');
  if(host&&!observer){
    observer=new MutationObserver(()=>{if(host.classList.contains('active'))setTimeout(compactHome,0)});
    observer.observe(host,{childList:true,subtree:false});
  }
}
function selfCheck(){
  const results=searchCatalog('toan');
  return{release:RELEASE,homeSummary:q('#page-home .hub-safe-dashboard')?.dataset.homeSummaryV2===RELEASE,canonicalHomeHidden:!!q('#page-home .hub-v2-canonical-hidden'),searchInstalled:q('#hubSafeSearch')?.dataset.searchV2==='1',accentInsensitive:results.some(x=>x.subjectId==='math'),legacyHomePanelsVisible:!!q('#page-home .hub-safe-assistant,#page-home .hub-safe-schedule,#page-home .hub-safe-achievements,#page-home .hub-safe-overall,#page-home .hub-safe-subjects')};
}
bind();
setTimeout(install,0);setTimeout(install,350);setTimeout(install,1200);
const oldRefresh=window.BAUMAN_HUB_SAFE?.refresh;
if(typeof oldRefresh==='function')window.BAUMAN_HUB_SAFE.refresh=()=>{const result=oldRefresh();install();return result};
window.BAUMAN_HUB_OVERVIEW_SEARCH_V2={release:RELEASE,install,compactHome,search:searchCatalog,openSearch:showSearch,selfCheck};
})();