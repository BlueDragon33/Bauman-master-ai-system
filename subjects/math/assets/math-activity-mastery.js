/* Bauman Math Activity Mastery V1
 * Local-only confidence/mastery state for Activity Studio cards.
 * Does not modify canonical content or infer correctness.
 */
(function mathActivityMastery(global){
  'use strict';
  const RELEASE='MATH_ACTIVITY_MASTERY_V1_SYNC_DECORATION';
  const KEY='bauman_math_activity_mastery_v1';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let timer=0;

  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return{}}}
  function save(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(_){}}
  function core(){return global.__BAUMAN_CORE_API?.state||global.__MATH_STATE||{}}
  function lessonId(){return String(core().e169Path?.lessonId||core().e129LessonId||'')}
  function activity(){return String(core().e169Path?.activityId||core().learnTab||'')}
  function hash(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
  function cardKey(card,index){
    const role=card.querySelector('.role')?.textContent?.trim()||'item';
    const title=card.querySelector('h4')?.textContent?.trim()||'';
    const body=card.querySelector('p')?.textContent?.trim()||'';
    return `${lessonId()}::${activity()}::${hash(`${role}|${title}|${body.slice(0,180)}|${index}`)}`;
  }
  function stateOf(key){return load()[key]||{state:'learning',updatedAt:0}}
  function setState(key,state){const all=load();all[key]={state,updatedAt:Date.now()};save(all);refresh()}
  function resetLesson(){const id=`${lessonId()}::`;const all=load();Object.keys(all).forEach(k=>{if(k.startsWith(id))delete all[k]});save(all);refresh()}

  function decorateCard(card,index){
    if(card.dataset.mathMasteryKey)return;
    const key=cardKey(card,index);card.dataset.mathMasteryKey=key;
    const current=stateOf(key);
    const controls=document.createElement('div');controls.className='math-am-controls';
    controls.innerHTML=`<small>Tự đánh giá · không phải điểm số</small><button class="math-am-btn ${current.state==='review'?'active':''}" data-am-state="review" data-am-key="${esc(key)}">Cần ôn</button><button class="math-am-btn ${current.state==='learning'?'active':''}" data-am-state="learning" data-am-key="${esc(key)}">Đang học</button><button class="math-am-btn ${current.state==='mastered'?'active':''}" data-am-state="mastered" data-am-key="${esc(key)}">Đã nắm</button>`;
    const badge=document.createElement('span');badge.className=`math-am-card-state ${current.state}`;badge.innerHTML=`<i></i>${current.state==='mastered'?'Đã nắm':current.state==='review'?'Cần ôn':'Đang học'}`;
    card.appendChild(badge);card.appendChild(controls);
  }
  function summary(cards){
    const counts={review:0,learning:0,mastered:0};cards.forEach((card,i)=>{const key=card.dataset.mathMasteryKey||cardKey(card,i);const st=stateOf(key).state;if(counts[st]!=null)counts[st]++});
    const total=cards.length,pct=total?Math.round(counts.mastered/total*100):0;return{...counts,total,pct};
  }
  function ensureSummary(host,cards){
    let box=$('#mathActivityMastery',host);if(!box){box=document.createElement('section');box.id='mathActivityMastery';box.className='math-activity-mastery';const strip=$('.math-activity-source-strip',host);strip?.insertAdjacentElement('afterend',box)}
    if(!box)return;
    const s=summary(cards);box.innerHTML=`<div class="math-am-top"><b>Mastery cá nhân · ${esc(lessonId()||'chưa có lesson')}</b><span>${esc(activity()||'activity')} · local only</span></div><div class="math-am-track"><i style="width:${s.pct}%"></i></div><div class="math-am-stats"><span class="math-am-stat"><strong>${s.mastered}</strong> đã nắm</span><span class="math-am-stat"><strong>${s.learning}</strong> đang học</span><span class="math-am-stat"><strong>${s.review}</strong> cần ôn</span><span class="math-am-stat"><strong>${s.pct}%</strong> mastery</span><button class="math-am-reset" data-am-reset>Đặt lại hoạt động</button></div>`;
  }
  function apply(){
    const host=$('#mathActivityStudio');if(!host||!document.body.classList.contains('math-activity-studio-active'))return false;
    const cards=$$('.math-activity-card',host);cards.forEach(decorateCard);ensureSummary(host,cards);return true;
  }
  function refresh(){
    clearTimeout(timer);
    apply();
    timer=setTimeout(apply,70);
  }
  function bind(){document.addEventListener('click',e=>{const state=e.target.closest('[data-am-state]')?.dataset.amState,key=e.target.closest('[data-am-key]')?.dataset.amKey;if(state&&key){e.preventDefault();setState(key,state);return}if(e.target.closest('[data-am-reset]')){e.preventDefault();resetLesson()}if(e.target.closest('[data-e169-pick-activity],[data-activity-action],[data-math-nav],[data-e129-lesson]'))refresh()},true)}
  function selfCheck(){const host=$('#mathActivityStudio'),cards=host?$$('.math-activity-card',host):[];const s=summary(cards);return{release:RELEASE,ready:!!host,lessonId:lessonId()||null,activity:activity()||null,cards:s.total,mastered:s.mastered,localOnly:true,academicWrites:false,gradingAuthority:false,mutationObserver:false,synchronousDecoration:true}}
  function init(){if(!document.body||document.body.dataset.mathActivityMastery==='1')return;document.body.dataset.mathActivityMastery='1';bind();[600,1400,2800].forEach(ms=>setTimeout(refresh,ms));global.BAUMAN_MATH_ACTIVITY_MASTERY={release:RELEASE,refresh,apply,selfCheck,resetLesson}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
