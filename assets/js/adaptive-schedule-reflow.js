'use strict';
(function(){
  const KEY='baumanAdaptiveScheduleAnchorsV1';
  const parse=s=>{const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3]):null};
  const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const shiftDate=(s,days)=>{const d=parse(s);if(!d)return s;d.setDate(d.getDate()+days);return iso(d)};
  const diffDays=(a,b)=>{const x=parse(a),y=parse(b);return x&&y?Math.round((y-x)/86400000):0};
  const completed=e=>!!(e?.completedAt||e?.done||['done','completed','pass'].includes(String(e?.status||'').toLowerCase()));
  function anchors(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(_){return{}}}
  function save(a){try{localStorage.setItem(KEY,JSON.stringify(a))}catch(_){}}
  function inRange(date,start,end){return (!start||date>=start)&&(!end||date<end)}
  function moveEntries(delta,start,end){const s=window.state;if(!s?.schedule?.entries||!delta)return 0;const next={};let moved=0;Object.entries(s.schedule.entries).forEach(([key,e])=>{const [date,slot]=key.split('|');if(!completed(e)&&inRange(date,start,end)){const nd=shiftDate(date,delta),nk=`${nd}|${slot}`;next[nk]={...e,date:nd};moved++}else next[key]=e});s.schedule.entries=next;return moved}
  function movePlans(delta,start,end){const plans=window.state?.planningPlans;if(!plans||!delta)return 0;let moved=0;Object.values(plans).forEach(p=>{if(!Array.isArray(p?.sessions))return;p.sessions=p.sessions.map(s=>{if(!s?.date||!inRange(s.date,start,end))return s;moved++;return{...s,date:shiftDate(s.date,delta)}});if(p.startDate&&inRange(p.startDate,start,end))p.startDate=shiftDate(p.startDate,delta);if(p.deadline&&inRange(p.deadline,start,end))p.deadline=shiftDate(p.deadline,delta)});return moved}
  function reflow(key,oldValue,newValue){if(!oldValue||!newValue||oldValue===newValue)return{entries:0,sessions:0};const delta=diffDays(oldValue,newValue);if(!delta)return{entries:0,sessions:0};const a=window.BaumanAdaptiveLearning?.effectiveDates?.()||{};let start=oldValue,end='';if(key==='selfStudyStart')end=a.preparatoryStart||'';if(key==='preparatoryStart')end=a.baumanStart||'';if(key==='baumanStart')end='';const entries=moveEntries(delta,start,end),sessions=movePlans(delta,start,end);try{window.save?.()}catch(_){};window.dispatchEvent(new CustomEvent('bauman-adaptive:schedule-reflow',{detail:{key,oldValue,newValue,delta,entries,sessions}}));return{entries,sessions}}
  function init(){const snap=anchors();document.addEventListener('change',e=>{const el=e.target.closest?.('[data-adaptive-date]');if(!el)return;const key=el.dataset.adaptiveDate,newValue=el.value,oldValue=snap[key]||window.BaumanAdaptiveLearning?.effectiveDates?.()?.[key]||'';setTimeout(()=>{const r=reflow(key,oldValue,newValue);snap[key]=newValue;save(snap);if(r.entries||r.sessions)window.toast?.(`Đã dời ${r.entries} lịch học và ${r.sessions} phiên theo mốc mới.`)},0)},true);const current=window.BaumanAdaptiveLearning?.effectiveDates?.()||{};['selfStudyStart','preparatoryStart','baumanStart'].forEach(k=>{if(!snap[k]&&current[k])snap[k]=current[k]});save(snap)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
