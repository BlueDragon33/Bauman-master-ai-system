/* Math Reader Role Map V1
 * Adds semantic DOM metadata from the already-loaded theory_lecture_content record.
 * Does not rewrite source JSON and does not render lesson content itself.
 */
(function mathReaderRoleMap(global){
  'use strict';
  const RELEASE='MATH_READER_ROLE_MAP_V1';
  let timer=0;
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const TYPE_BY_ROLE={
    notation:'formula',core_formula:'formula',assumption_gate:'formula',
    mini_case:'example',worked_example:'example',example:'example',derivation:'example',
    simulation:'simulation',application:'application',real_bridge:'application',
    professor_qa:'assessment',practice:'assessment',assessment:'assessment',exam:'assessment',retrieval:'assessment',
    common_mistakes:'warning',warning:'warning'
  };
  const LABEL={
    problem_framing:'Vấn đề',deep_essence:'Bản chất',counter_intuition:'Phản trực giác',real_bridge:'Cầu nối thực tế',
    notation:'Ký hiệu',core_formula:'Công thức',assumption_gate:'Điều kiện',mini_case:'Ví dụ',interpretation:'Diễn giải',
    simulation:'Mô phỏng',common_mistakes:'Lỗi thường gặp',application:'Ứng dụng',practice:'Luyện tập',professor_qa:'Vấn đáp',bridge:'Kết nối',takeaway:'Ghi nhớ'
  };
  function records(){const x=global.DB?.theory_lecture_content;if(Array.isArray(x))return x;if(Array.isArray(x?.records))return x.records;if(Array.isArray(x?.lessons))return x.lessons;if(Array.isArray(x?.items))return x.items;return[]}
  function current(){const host=$('[data-current-lesson]');const id=host?.getAttribute('data-current-lesson')||global.__MATH_STATE?.e129LessonId||'';return{id,host,record:records().find(r=>(r.lessonId||r.id)===id)||null}}
  function map(){
    const cur=current();if(!cur.id||!cur.record)return{mapped:0,lessonId:cur.id||null};
    const dom=$$('.e129-slide').filter(x=>x.offsetParent!==null),slides=Array.isArray(cur.record.slides)?cur.record.slides:[];
    let mapped=0;
    dom.forEach((el,i)=>{
      const src=slides[i];if(!src)return;const role=String(src.role||'').trim().toLowerCase();
      if(role)el.dataset.slideRole=role; if(src.id)el.dataset.slideId=String(src.id); el.dataset.slideIndex=String(i);
      el.dataset.roleLabel=LABEL[role]||role.replace(/_/g,' ');
      const type=TYPE_BY_ROLE[role];
      if(type){const set=new Set((el.dataset.mathWsType||'').split(/\s+/).filter(Boolean));set.add(type);el.dataset.mathWsType=Array.from(set).join(' ');el.dataset.mathWsLabel=(el.dataset.mathWsLabel?el.dataset.mathWsLabel+' · ':'')+(LABEL[role]||type);}
      mapped++;
    });
    return{mapped,lessonId:cur.id,sourceSlides:slides.length,domSlides:dom.length};
  }
  function schedule(ms=120){clearTimeout(timer);timer=setTimeout(()=>{map();global.BAUMAN_MATH_WORKSPACE?.refresh?.();global.BAUMAN_MATH_LEARNING_FLOW?.refresh?.();},ms)}
  document.addEventListener('click',e=>{if(e.target.closest('[data-e129-chapter],[data-e129-lesson],[data-e129-stage],[data-e129-refresh],[data-e169-pick-activity],[data-e129-back-theory]'))schedule(220)},true);
  function init(){map();[450,950,1800,3000].forEach(ms=>setTimeout(map,ms));global.BAUMAN_MATH_READER_ROLE_MAP={release:RELEASE,map,selfCheck:()=>({release:RELEASE,...map(),academicWrites:false,mutationObserver:false})}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
