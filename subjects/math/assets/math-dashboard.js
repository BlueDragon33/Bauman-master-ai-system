/* Bauman Math Dashboard V2
 * Runtime-derived UI only. No academic data mutation, no MutationObserver.
 */
(function mathDashboardV2(global){
  'use strict';
  const RELEASE='MATH_DASHBOARD_V2';
  const VISIT_KEY='bauman_math_dashboard_visits_v1';
  let timer=0,lastLesson='';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clip=(s,n=140)=>{s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s;};

  function visits(){try{return JSON.parse(localStorage.getItem(VISIT_KEY)||'[]')}catch(_){return []}}
  function saveVisits(list){try{localStorage.setItem(VISIT_KEY,JSON.stringify(list.slice(0,40)))}catch(_){}}
  function currentLesson(){
    const host=$('[data-current-lesson]');
    const id=host?.getAttribute('data-current-lesson')||global.__MATH_STATE?.e129LessonId||'E129';
    const title=(host?.querySelector('.e169-reader-title h2,h2')||$('.e169-reader-title h2')||$('.e129-placeholder h2'))?.textContent?.trim()||'Lý thuyết Toán Bauman';
    return {id,title};
  }
  function recordVisit(){
    const cur=currentLesson(); if(!cur.id||cur.id==='E129'||cur.id===lastLesson) return;
    lastLesson=cur.id;
    let list=visits().filter(x=>x.id!==cur.id);
    list.unshift({id:cur.id,title:cur.title,at:Date.now()}); saveVisits(list);
  }
  function status(){
    try{return global.BAUMAN_MATH_THEORY_E129?.sourceStatus?.()||{}}catch(_){return {}}
  }
  function currentSlides(){return $$('.e129-slide').filter(x=>x.offsetParent!==null)}
  function typeCount(){return $$('[data-math-ws-type]').filter(x=>x.offsetParent!==null).length}

  function simSvg(mode){
    if(mode==='vector') return '<svg viewBox="0 0 220 110"><g stroke="rgba(110,150,185,.22)" stroke-width="1"><path d="M20 55H205M110 8V102"/></g><path d="M110 55L165 25" stroke="#ff8d5f" stroke-width="3"/><path d="M110 55L78 18" stroke="#35b8ff" stroke-width="3"/><circle cx="110" cy="55" r="3" fill="#eaf7ff"/><text x="170" y="24" fill="#ffad89" font-size="9">u</text><text x="68" y="16" fill="#6bd5ff" font-size="9">v</text></svg>';
    if(mode==='matrix') return '<svg viewBox="0 0 220 110"><g stroke="rgba(110,150,185,.20)"><path d="M25 55H195M110 10V100"/></g><rect x="62" y="31" width="40" height="40" fill="rgba(39,169,255,.13)" stroke="#37b8ff"/><polygon points="132,26 176,46 156,84 118,65" fill="rgba(216,91,255,.13)" stroke="#cb65ff"/><path d="M104 51H127" stroke="#ffd36a" stroke-width="2"/><text x="84" y="92" fill="#7898b2" font-size="8">x</text><text x="150" y="96" fill="#7898b2" font-size="8">Ax</text></svg>';
    return '<svg viewBox="0 0 220 110"><g stroke="rgba(110,150,185,.20)"><path d="M20 55H205M110 8V102"/></g><path d="M34 18 C70 20,75 92,110 91 C147 90,151 18,191 16" fill="none" stroke="#35b8ff" stroke-width="3"/><circle cx="110" cy="91" r="3" fill="#ffd36a"/></svg>';
  }

  function ensure(){
    const main=$('.main'), view=$('#view'); if(!main||!view||$('#mathV2Dashboard')) return;
    const wrap=document.createElement('section'); wrap.id='mathV2Dashboard'; wrap.innerHTML=`
      <section class="math-v2-grid">
        <article class="math-v2-card">
          <div class="math-v2-head"><h3>Phòng Mô phỏng Toán học</h3><button type="button" data-math-v2-action="lab">Xem Math Lab →</button></div>
          <div class="math-v2-sims">
            <button type="button" class="math-v2-sim" data-math-v2-lab="function"><h4>Hàm bậc hai</h4><p>y = ax² + bx + c</p><div class="math-v2-sim-preview">${simSvg('function')}</div><div class="math-v2-sim-footer"><span>Thay đổi a, b, c</span><b>Mở mô phỏng ↗</b></div></button>
            <button type="button" class="math-v2-sim" data-math-v2-lab="vector"><h4>Vector trong không gian 2D</h4><p>Cộng vector · tích vô hướng · góc</p><div class="math-v2-sim-preview">${simSvg('vector')}</div><div class="math-v2-sim-footer"><span>Quan sát hình học</span><b>Mở mô phỏng ↗</b></div></button>
            <button type="button" class="math-v2-sim" data-math-v2-lab="matrix"><h4>Ma trận 2 × 2</h4><p>y = Ax · det(A)</p><div class="math-v2-sim-preview">${simSvg('matrix')}</div><div class="math-v2-sim-footer"><span>Biến đổi tuyến tính</span><b>Mở mô phỏng ↗</b></div></button>
          </div>
        </article>
        <article class="math-v2-card math-v2-current">
          <div class="math-v2-current-top"><div><small>Bài học hiện tại</small><h3 id="mathV2LessonTitle">Đang đồng bộ…</h3><p id="mathV2LessonMeta">E129 Reader</p></div><button class="math-v2-continue" type="button" data-math-v2-action="continue">Tiếp tục học →</button></div>
          <div class="math-v2-tabs"><button class="active" data-math-v2-action="continue">Nội dung</button><button data-math-v2-action="control">Kiểm soát</button><button data-math-v2-action="lab">Mô phỏng</button><button data-math-v2-action="vault">Kho dữ liệu</button></div>
          <div class="math-v2-outline"><div id="mathV2Outline" class="math-v2-outline-list"></div><div id="mathV2Preview" class="math-v2-reader-preview"></div></div>
        </article>
      </section>
      <section class="math-v2-bottom">
        <article class="math-v2-card math-v2-small"><h3>Tiến độ học trên thiết bị</h3><div class="math-v2-progress-row"><div id="mathV2Ring" class="math-v2-ring"><b id="mathV2Pct">0%</b></div><div class="math-v2-progress-meta"><div><span>Bài đã mở</span><strong id="mathV2Visited">0</strong></div><div><span>Khung active</span><strong id="mathV2Frames">—</strong></div><div><span>Content active</span><strong id="mathV2Records">—</strong></div></div></div></article>
        <article class="math-v2-card math-v2-small"><h3>Hoạt động gần đây</h3><div id="mathV2Recent" class="math-v2-list"></div></article>
        <article class="math-v2-card math-v2-small"><h3>Nhiệm vụ tiếp theo</h3><div class="math-v2-list"><div class="math-v2-task"><div><b>Tiếp tục bài hiện tại</b><span>Quay về Reader đang mở</span></div><button data-math-v2-action="continue">Mở</button></div><div class="math-v2-task"><div><b>Thử mô phỏng liên quan</b><span>Math Lab chạy trên trình duyệt</span></div><button data-math-v2-action="lab">Lab</button></div><div class="math-v2-task"><div><b>Rà soát cấu trúc bài</b><span>Bật/tắt công thức, ví dụ, cảnh báo</span></div><button data-math-v2-action="control">Kiểm soát</button></div></div></article>
        <article class="math-v2-card math-v2-small"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><h3>Kho dữ liệu Toán</h3><span class="math-v2-vault-status">Runtime</span></div><div class="math-v2-vault-grid"><article><b id="mathV2VaultFrames">— khung</b><span>theory_lecture_frame</span></article><article><b id="mathV2VaultRecords">— records</b><span>theory_lecture_content</span></article></div><div class="math-v2-vault-actions"><button data-math-v2-action="vault">Mở DataVault</button><button data-math-v2-action="export">Export JSON</button></div></article>
      </section>`;
    main.insertBefore(wrap,view);
  }

  function update(){
    recordVisit(); const cur=currentLesson(), st=status(), slides=currentSlides(), list=visits();
    const title=$('#mathV2LessonTitle'); if(title) title.textContent=cur.title;
    const meta=$('#mathV2LessonMeta'); if(meta) meta.textContent=`${cur.id} · ${slides.length||0} slide đang hiển thị`;
    const outline=$('#mathV2Outline');
    if(outline){const heads=slides.slice(0,7).map((s,i)=>({t:(s.querySelector('h3')?.textContent||`Slide ${i+1}`).trim(),el:s}));outline.innerHTML=heads.length?heads.map((x,i)=>`<button data-math-v2-slide="${i}" class="${i===0?'active':''}">${esc(clip(x.t,62))}</button>`).join(''):'<span style="color:#607d94;font-size:9px">Chưa có slide khả dụng trong màn hiện tại.</span>';}
    const first=slides[0]; const preview=$('#mathV2Preview');
    if(preview){
      if(first){const h=first.querySelector('h3')?.textContent||cur.title;const p=first.querySelector('p')?.textContent||'Nội dung đang được Reader E129 hiển thị.';const formula=first.querySelector('pre')?.textContent||'';preview.innerHTML=`<b>${esc(clip(h,100))}</b><p>${esc(clip(p,320))}</p>${formula?`<div class="math-v2-formula">${esc(clip(formula,150))}</div>`:''}`;}
      else preview.innerHTML='<b>Reader E129</b><p>Mở một bài lý thuyết để xem preview trực tiếp ở đây.</p>';
    }
    const frames=Number(st.frame||0), records=Number(st.content||0), visited=list.length; const denom=Math.max(records,visited,1); const pct=Math.min(100,Math.round(visited/denom*100));
    const ring=$('#mathV2Ring'); if(ring) ring.style.setProperty('--p',pct); if($('#mathV2Pct')) $('#mathV2Pct').textContent=`${pct}%`;
    if($('#mathV2Visited')) $('#mathV2Visited').textContent=String(visited); if($('#mathV2Frames')) $('#mathV2Frames').textContent=frames||'—'; if($('#mathV2Records')) $('#mathV2Records').textContent=records||'—';
    if($('#mathV2VaultFrames')) $('#mathV2VaultFrames').textContent=`${frames||0} khung`; if($('#mathV2VaultRecords')) $('#mathV2VaultRecords').textContent=`${records||0} records`;
    const recent=$('#mathV2Recent'); if(recent){recent.innerHTML=list.length?list.slice(0,4).map(x=>`<div class="math-v2-item"><span class="math-v2-dot">✓</span><div><b>${esc(clip(x.title,78))}</b><span>${timeAgo(x.at)}</span></div></div>`).join(''):'<div style="color:#607d94;font-size:9px">Hoạt động sẽ xuất hiện sau khi mở các bài học.</div>';}
  }

  function timeAgo(at){const d=Math.max(0,Date.now()-Number(at||0)),m=Math.floor(d/60000);if(m<1)return'vừa xong';if(m<60)return`${m} phút trước`;const h=Math.floor(m/60);if(h<24)return`${h} giờ trước`;return`${Math.floor(h/24)} ngày trước`;}
  function openLab(mode){global.BAUMAN_MATH_WORKSPACE?.openLab?.();if(mode)global.setTimeout(()=>document.querySelector(`[data-lab-mode="${mode}"]`)?.click(),60);}
  function action(name){
    if(name==='continue'){$('#view')?.scrollIntoView({behavior:'smooth',block:'start'});return;}
    if(name==='control'){global.BAUMAN_MATH_WORKSPACE?.openControl?.();return;}
    if(name==='lab'){openLab();return;}
    if(name==='vault'){global.BAUMAN_MATH_THEORY_E129?.openTheoryVault?.();schedule(180);return;}
    if(name==='export'){global.BAUMAN_MATH_THEORY_E129?.exportContent?.();return;}
  }
  function bind(){
    document.addEventListener('click',e=>{
      const sim=e.target.closest('[data-math-v2-lab]'); if(sim){e.preventDefault();openLab(sim.dataset.mathV2Lab);return;}
      const a=e.target.closest('[data-math-v2-action]'); if(a){e.preventDefault();action(a.dataset.mathV2Action);return;}
      const s=e.target.closest('[data-math-v2-slide]'); if(s){const slides=currentSlides(),el=slides[Number(s.dataset.mathV2Slide)||0];el?.scrollIntoView({behavior:'smooth',block:'center'});$$('[data-math-v2-slide]').forEach(b=>b.classList.toggle('active',b===s));return;}
      if(e.target.closest('[data-e129-chapter],[data-e129-lesson],[data-e129-stage],[data-e169-pick-activity],[data-e129-refresh]'))schedule(180);
    },true);
  }
  function schedule(ms=120){clearTimeout(timer);timer=setTimeout(refresh,ms)}
  function refresh(){ensure();global.BAUMAN_MATH_PREMIUM?.refresh?.();global.BAUMAN_MATH_WORKSPACE?.refresh?.();setTimeout(update,40)}
  function selfCheck(){return{release:RELEASE,ready:!!$('#mathV2Dashboard'),workspace:!!global.BAUMAN_MATH_WORKSPACE,e129:!!global.BAUMAN_MATH_THEORY_E129,mutationObserver:false,academicWrites:false,visitTelemetryLocalOnly:true}}
  function init(){if(!document.body||document.body.dataset.mathDashboardV2==='1')return;document.body.dataset.mathDashboardV2='1';bind();refresh();[450,1100,2200].forEach(ms=>setTimeout(refresh,ms));global.BAUMAN_MATH_DASHBOARD_V2={refresh,selfCheck};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
