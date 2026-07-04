/* E181 · C01 theory lesson fallback
 * Loaded before E175 so it can intercept the missing content level first.
 * Ensures Chương 1 → Lý thuyết always shows Bài 1.1–1.6.
 */
(function(){
  'use strict';
  var RELEASE='E181_C01_THEORY_LESSON_FALLBACK';
  var C01_CHAPTER_ID='MATH-VN-C01-vector_trong_khong_gian_';
  var C01=[
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L01-vector-as-engineering-data-e130',label:'Bài 1.1 · Vector như dữ liệu kỹ thuật'},
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L02-norm-distance-metric-e139',label:'Bài 1.2 · Chuẩn vector và khoảng cách'},
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L03-dot-angle-projection-e139',label:'Bài 1.3 · Tích vô hướng, góc và phép chiếu'},
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140',label:'Bài 1.4 · Cơ sở, span và tọa độ'},
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140',label:'Bài 1.5 · Không gian con và biểu diễn dữ liệu'},
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140',label:'Bài 1.6 · Từ vector sang ma trận dữ liệu'}
  ];
  function H(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function api(){return window.__BAUMAN_CORE_API||{};}
  function state(){var st=api().state||window.__MATH_STATE;if(!st){st={view:'learning',learnTab:'theory'};window.__MATH_STATE=st;}return st;}
  function path(){var st=state();st.e169Path=st.e169Path||{};var p=st.e169Path;if(!p.moduleId)p.moduleId='pure';if(!p.courseId)p.courseId='pure-algebra';if(!p.chapterId)p.chapterId='c01';if(!p.activityId)p.activityId='theory';return p;}
  function save(){try{api().save&&api().save();}catch(_){}}
  function isC01Theory(){var p=path();return p.chapterId==='c01'&&p.activityId==='theory';}
  function close(){var old=document.querySelector('.e129-modal-backdrop');if(old)old.remove();}
  function modal(html){close();var n=document.createElement('div');n.className='e129-modal-backdrop e181-modal-backdrop';n.innerHTML='<div class="e129-modal e181-modal">'+html+'</div>';document.body.appendChild(n);}
  function option(x,active){return '<button class="e169-choice e181-choice '+(active?'active':'')+'" data-e181-pick="content" data-e181-id="'+H(x.id)+'"><b>'+H(x.label)+'</b><span>Mở đúng bài trong E129 Reader full content.</span></button>';}
  function openContent(){var p=path();modal('<header><div><span class="e129-badge">E181 · C01 Theory</span><h3>Chọn Nội dung cụ thể</h3><p>Chương 1 · Lý thuyết có 6 bài giảng. Chọn một bài để mở Reader đầy đủ.</p></div><button class="e129-close" data-e181-close>×</button></header><div class="e169-choice-grid e181-choice-grid">'+C01.map(function(x){return option(x,(p.lessonId||p.contentId)===x.id);}).join('')+'</div>');}
  function renderLesson(id){var p=path();p.moduleId='pure';p.courseId='pure-algebra';p.chapterId='c01';p.activityId='theory';p.lessonId=id;p.contentId=id;var st=state();st.view='learning';st.learnTab='theory';st.e129ChapterId=C01_CHAPTER_ID;st.e129LessonId=id;save();close();try{window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_THEORY_E129.render&&window.BAUMAN_MATH_THEORY_E129.render();}catch(_){location.reload();}}
  function handle(e){var t=e.target&&e.target.closest&&e.target.closest('[data-e178-open],[data-e178-pick],[data-e181-pick],[data-e181-close]');if(!t)return;
    if(t.hasAttribute('data-e181-close')){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();close();return;}
    if(t.getAttribute('data-e178-open')==='content'&&isC01Theory()){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openContent();return;}
    var kind=t.getAttribute('data-e178-pick'), id=t.getAttribute('data-e178-id');
    if(kind==='activity'&&id==='theory'){var p=path();p.activityId='theory';p.lessonId='';p.contentId='';save();e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openContent();return;}
    if(t.getAttribute('data-e181-pick')==='content'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();renderLesson(t.getAttribute('data-e181-id'));return;}
  }
  function patchCrumb(){var bc=document.querySelector('.e169-breadcrumb');if(!bc||!isC01Theory())return;var p=path(), current=C01.find(function(x){return x.id===(p.lessonId||p.contentId);})||C01[0];var buttons=bc.querySelectorAll('button');if(buttons[4]){buttons[4].textContent=current.label;buttons[4].setAttribute('data-e178-open','content');}}
  window.addEventListener('click',handle,true);
  window.addEventListener('pointerup',handle,true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.querySelector('.e181-modal-backdrop'))close();},true);
  var obs=new MutationObserver(function(){setTimeout(patchCrumb,0);});
  function boot(){try{obs.observe(document.body,{childList:true,subtree:true,characterData:true});}catch(_){ }patchCrumb();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E181_C01_FALLBACK={release:RELEASE,openContent:openContent,lessons:C01,selfCheck:function(){return{release:RELEASE,isC01Theory:isC01Theory(),lessons:C01.length,modalReady:!!document.querySelector('.e181-modal-backdrop')};}};
})();
