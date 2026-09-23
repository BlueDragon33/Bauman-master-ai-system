/* Bauman Math Learner Navigation
 * Canonical learner-first shell: Tổng quan · Lộ trình · Học · Luyện tập · Ôn tập.
 * Advanced resources remain contextual/command-palette tools.
 */
(function mathNavigation(global){
  'use strict';
  const RELEASE='MATH_LEARNER_NAV_IA_V1';
  let active='overview', timer=0;
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const PRIMARY_ITEMS=[
    {id:'overview',group:'Học tập',icon:'⌂',label:'Tổng quan',sub:'Hôm nay học gì?',key:'1'},
    {id:'roadmap',group:'Học tập',icon:'⌁',label:'Lộ trình',sub:'Giai đoạn → Chương',key:'2'},
    {id:'learn',group:'Học tập',icon:'▤',label:'Học',sub:'Bài học hiện tại',key:'3'},
    {id:'practice',group:'Học tập',icon:'✎',label:'Luyện tập',sub:'Bài tập theo nhu cầu',key:'4'},
    {id:'review',group:'Học tập',icon:'↺',label:'Ôn tập',sub:'Ôn đúng điểm yếu',key:'5'}
  ];
  const ADVANCED_ITEMS=[
    {id:'lab',group:'Công cụ',icon:'∿',label:'Mô phỏng',sub:'Công cụ theo ngữ cảnh',key:'L'},
    {id:'formula',group:'Công cụ',icon:'∑',label:'Công thức',sub:'Công thức bài đang học',key:'F'},
    {id:'control',group:'Công cụ',icon:'☷',label:'Công cụ học',sub:'Hiển thị & kiểm soát',key:'C'},
    {id:'vault',group:'Hệ thống',icon:'▣',label:'Kho dữ liệu',sub:'Quản trị nội dung nâng cao',key:'D'}
  ];
  const ITEMS=[...PRIMARY_ITEMS,...ADVANCED_ITEMS];

  function toast(message){
    const existing=$('#mathWsToast');
    if(existing){ existing.textContent=message; existing.style.opacity='1'; clearTimeout(existing._timer); existing._timer=setTimeout(()=>existing.style.opacity='0',1800); return; }
    console.info('[Math Navigation]',message);
  }

  function navHtml(){
    return '<section class="math-unified-group" aria-label="Điều hướng học tập">'+
      PRIMARY_ITEMS.map(x=>`<button type="button" class="math-unified-nav-button ${x.id===active?'active':''}" data-math-unified="1" data-math-nav="${x.id}" aria-current="${x.id===active?'page':'false'}" title="${esc(x.label)} · ${esc(x.sub)}"><i class="math-unified-icon">${x.icon}</i><span class="math-unified-copy"><b>${esc(x.label)}</b><small>${esc(x.sub)}</small></span><span class="math-unified-tail">${esc(x.key)}</span></button>`).join('')+
    '</section>';
  }

  function ensureNav(){
    const nav=$('#nav'); if(!nav) return;
    let root=$('#mathUnifiedNav',nav);
    if(!root){ root=document.createElement('div'); root.id='mathUnifiedNav'; root.className='math-unified-nav'; nav.appendChild(root); }
    $('#mathUnifiedSystem')?.remove();
    root.innerHTML=navHtml();
  }

  let roadmapCache=null;
  async function loadRoadmap(){
    if(roadmapCache) return roadmapCache;
    const [curriculumRes,frameworkRes]=await Promise.all([fetch('data/curriculum.json'),fetch('data/theory-framework.json')]);
    if(!curriculumRes.ok||!frameworkRes.ok) throw new Error('Không tải được dữ liệu lộ trình.');
    roadmapCache={curriculum:await curriculumRes.json(),framework:await frameworkRes.json()};
    return roadmapCache;
  }
  function setPageHeader(title,sub){
    const h=$('#pageTitle'); if(h) h.textContent=title;
    const p=$('#pageSub'); if(p) p.textContent=sub||'';
  }
  function roadmapChapters(framework,stageId){
    const out=[];
    (framework?.faculties||[]).forEach(faculty=>(faculty.departments||[]).forEach(dept=>(dept.chapters||[]).forEach(ch=>{
      if((ch.stageAppId||'')===stageId) out.push({...ch,facultyTitle:faculty.title||'',departmentTitle:dept.title||''});
    })));
    return out.sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0));
  }
  function roadmapHtml(data,stageId){
    const stages=data.curriculum?.stages||[];
    const stage=stages.find(x=>x.id===stageId)||stages[0]||{};
    const chapters=roadmapChapters(data.framework,stage.id);
    const stageTabs=stages.map(x=>`<button type="button" class="math-roadmap-stage ${x.id===stage.id?'active':''}" data-math-roadmap-stage="${esc(x.id)}">${esc(x.title||x.id)}</button>`).join('');
    const groups=[];
    chapters.forEach(ch=>{
      const key=ch.departmentTitle||'Chương';
      let g=groups.find(x=>x.key===key);
      if(!g){g={key,faculty:ch.facultyTitle,items:[]};groups.push(g);}
      g.items.push(ch);
    });
    const body=groups.length?groups.map(g=>`<section class="math-roadmap-department"><header><span>${esc(g.faculty)}</span><h3>${esc(g.key)}</h3></header><div class="math-roadmap-chapters">${g.items.map(ch=>`<article class="math-roadmap-chapter"><div><span>Chương ${esc(ch.chapterNumber||ch.order||'')}</span><h4>${esc(ch.chapterTitle||ch.title||ch.id)}</h4><p>${esc(ch.chapterGoal||'Mục tiêu chương đang được chuẩn hóa.')}</p></div><div class="math-roadmap-meta"><span>${Number(ch.smallLessonCount)||0} bài</span><span>${esc(ch.week||'')}</span><button type="button" data-math-roadmap-chapter="${esc(ch.id)}" data-math-roadmap-stage-id="${esc(ch.stageAppId||stage.id)}">Học chương này →</button></div></article>`).join('')}</div></section>`).join(''):`<div class="math-roadmap-empty"><b>Chưa có chương được ánh xạ cho giai đoạn này.</b><span>Dữ liệu khung vẫn được giữ nguyên; hệ thống không tự bịa nội dung thay thế.</span></div>`;
    return `<section class="math-roadmap-shell"><header class="math-roadmap-head"><div><span>LỘ TRÌNH HỌC TẬP</span><h2>${esc(stage.title||stage.id||'Lộ trình Toán')}</h2><p>${esc(stage.goal||'Theo dõi vị trí học và mở đúng chương cần học tiếp.')}</p></div><aside><b>${chapters.length}</b><span>chương trong giai đoạn</span></aside></header><nav class="math-roadmap-stages" aria-label="Giai đoạn">${stageTabs}</nav>${body}</section>`;
  }
  async function renderRoadmap(stageId){
    setActive('roadmap');
    document.body.classList.add('math-roadmap-active');
    const view=$('#view'); if(!view) return;
    setPageHeader('Lộ trình','Giai đoạn → Bộ môn → Chương. Chỉ mở tài nguyên khi bạn thực sự cần học.');
    view.innerHTML='<section class="math-roadmap-loading">Đang đọc lộ trình Toán…</section>';
    try{
      const data=await loadRoadmap();
      const fallback=$('#stageSelect')?.value||data.curriculum?.stages?.[0]?.id||'vn';
      view.innerHTML=roadmapHtml(data,stageId||fallback);
    }catch(error){
      view.innerHTML='<section class="math-roadmap-empty"><b>Không tải được lộ trình.</b><span>Hãy thử lại từ mục Lộ trình. Bài học hiện tại không bị thay đổi.</span></section>';
      console.error('[Math Roadmap]',error);
    }
  }
  function leaveRoadmap(){document.body.classList.remove('math-roadmap-active');}
  function openRoadmapChapter(chapterId,stageId){
    leaveRoadmap();
    routeTheory(()=>{
      const stageButton=$('[data-e129-stage]').find(x=>x.getAttribute('data-e129-stage')===stageId);
      if(stageButton) stageButton.click();
      setTimeout(()=>{
        const chapterButton=$('[data-e129-chapter]').find(x=>x.getAttribute('data-e129-chapter')===chapterId);
        if(chapterButton){chapterButton.click();setActive('learn');scheduleSync(180);}
        else toast('Chương này chưa có route Reader tương ứng trong dữ liệu hiện tại.');
      },140);
    });
  }

  function setActive(id){
    active=id||'overview';
    $('.math-unified-nav-button').forEach(b=>{
      const on=b.dataset.mathNav===active;
      b.classList.toggle('active',on);
      b.setAttribute('aria-current',on?'page':'false');
    });
  }

  function hiddenTheoryButton(){ return $('[data-e129-nav="theory"]'); }
  function routeTheory(done){
    const btn=hiddenTheoryButton();
    if(btn){ btn.click(); setTimeout(()=>done&&done(),90); return true; }
    try{ global.BAUMAN_MATH_THEORY_E129?.render?.(); setTimeout(()=>done&&done(),120); return true; }catch(_){ return false; }
  }

  function routeActivity(activity,primaryId){
    leaveRoadmap(); setActive(primaryId||activity);
    const e186=global.BAUMAN_MATH_E186_LESSON_FIRST;
    if(e186?.open){
      e186.open('activity');
      setTimeout(()=>{
        const pick=$(`[data-e186-pick="activity"][data-e186-id="${activity}"]`);
        if(pick){pick.click();scheduleSync(180);}
        else toast('Phân mục này chưa có trong route bài học hiện tại.');
      },50);
      return;
    }
    routeTheory(()=>{
      const opener=$('[data-e169-open="activity"]');
      if(!opener){ toast('Chưa tìm thấy Learning Path của bài hiện tại.'); return; }
      opener.click();
      setTimeout(()=>{
        const pick=$(`[data-e169-pick-activity="${activity}"]`);
        if(pick){ pick.click(); scheduleSync(180); }
        else toast('Hoạt động này chưa có route trong chương hiện tại.');
      },70);
    });
  }

  function route(id){
    if(!id) return;
    const alias={theory:'learn',exercises:'practice',application:'practice',exam:'practice'};
    const canonical=alias[id]||id;
    if(canonical==='overview'){
      leaveRoadmap(); setActive('overview'); setPageHeader('Tổng quan','Tiếp tục học, mục tiêu hiện tại và các điểm cần ôn.');
      const view=$('#view'); if(view) view.innerHTML='';
      ($('#mathPremiumDashboard')||$('#mathV2Dashboard')||$('.main'))?.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    if(canonical==='roadmap'){renderRoadmap();return;}
    if(canonical==='learn'){
      leaveRoadmap(); setActive('learn'); routeTheory(()=>{$('#view')?.scrollIntoView({behavior:'smooth',block:'start'});scheduleSync(120);});return;
    }
    if(canonical==='practice'){routeActivity(id==='practice'?'exercises':id,'practice');return;}
    if(canonical==='review'){routeActivity('review','review');return;}
    if(id==='lab'){leaveRoadmap();global.BAUMAN_MATH_WORKSPACE?.openLab?.();return;}
    if(id==='control'){leaveRoadmap();global.BAUMAN_MATH_WORKSPACE?.openControl?.();return;}
    if(id==='formula'){leaveRoadmap();openFormulaFocus();return;}
    if(id==='vault'){
      leaveRoadmap();
      if(global.BAUMAN_MATH_THEORY_E129?.openTheoryVault){global.BAUMAN_MATH_THEORY_E129.openTheoryVault();scheduleSync(150);}
      else toast('Kho dữ liệu chưa sẵn sàng ở màn hiện tại.');
    }
  }

  function collectFormulas(){
    const out=[],seen=new Set();
    const candidates=[...$$('[data-current-lesson] pre'),...$$('.e129-slide pre'),...$$('[data-math-ws-type~="formula"]')];
    candidates.forEach((el,index)=>{
      const text=(el.matches('pre')?el.textContent:(el.querySelector('pre')?.textContent||el.textContent)||'').replace(/\s+$/,'').trim();
      if(!text) return;
      const key=text.replace(/\s+/g,' ').slice(0,220); if(seen.has(key)) return; seen.add(key);
      const host=el.closest('.e129-slide,[data-current-lesson],article,section');
      const title=(host?.querySelector('h2,h3,h4')?.textContent||`Công thức ${out.length+1}`).trim();
      const note=(host?.querySelector('p')?.textContent||'').trim();
      out.push({title,text,note,element:el,index});
    });
    return out.slice(0,60);
  }

  function ensureFormulaFocus(){
    if($('#mathFormulaFocus')) return;
    const layer=document.createElement('section'); layer.id='mathFormulaFocus'; layer.className='math-formula-focus';
    layer.innerHTML='<div class="math-formula-focus-shell"><header class="math-formula-focus-head"><div><span class="math-formula-focus-kicker">Formula Focus</span><h2>Công thức trong bài đang mở</h2><p>Đọc trực tiếp từ Reader hiện tại; không tạo hay sửa công thức nguồn.</p></div><button type="button" class="math-formula-close" data-formula-close>×</button></header><div class="math-formula-focus-body"><nav id="mathFormulaIndex" class="math-formula-index"></nav><main id="mathFormulaStage" class="math-formula-stage"></main></div></div>';
    document.body.appendChild(layer);
    layer.addEventListener('click',e=>{ if(e.target===layer||e.target.closest('[data-formula-close]')) closeFormulaFocus(); });
  }

  function renderFormulaFocus(selected=0){
    ensureFormulaFocus(); const list=collectFormulas(), index=$('#mathFormulaIndex'), stage=$('#mathFormulaStage');
    if(!index||!stage) return;
    if(!list.length){ index.innerHTML='<div class="math-formula-stage-empty">Chưa phát hiện block công thức trong bài đang mở.</div>'; stage.innerHTML='<div class="math-formula-stage-empty">Mở một bài có công thức trong E129 Reader hoặc dùng Math Lab để tiếp tục.</div>'; return; }
    const pick=Math.max(0,Math.min(selected,list.length-1)), item=list[pick];
    index.innerHTML=list.map((x,i)=>`<button type="button" data-formula-index="${i}" class="${i===pick?'active':''}">${esc(x.title.slice(0,95))}</button>`).join('');
    stage.innerHTML=`<article class="math-formula-stage-card"><span>Công thức ${pick+1}/${list.length}</span><pre>${esc(item.text)}</pre>${item.note?`<p>${esc(item.note.slice(0,700))}</p>`:''}</article>`;
    $$('[data-formula-index]',index).forEach(b=>b.addEventListener('click',()=>renderFormulaFocus(Number(b.dataset.formulaIndex)||0)));
  }
  function openFormulaFocus(){ renderFormulaFocus(0); $('#mathFormulaFocus')?.classList.add('open'); }
  function closeFormulaFocus(){ $('#mathFormulaFocus')?.classList.remove('open'); }

  function ensureCommand(){
    if($('#mathCommandPalette')) return;
    const layer=document.createElement('section'); layer.id='mathCommandPalette'; layer.className='math-command-palette';
    layer.innerHTML='<div class="math-command-shell"><input id="mathCommandSearch" class="math-command-search" type="search" autocomplete="off" placeholder="Đi tới: Lý thuyết, Mô phỏng, Công thức, DataVault…"><div id="mathCommandList" class="math-command-list"></div></div>';
    document.body.appendChild(layer);
    layer.addEventListener('click',e=>{ if(e.target===layer) closeCommand(); });
    $('#mathCommandSearch')?.addEventListener('input',renderCommandList);
    $('#mathCommandSearch')?.addEventListener('keydown',e=>{
      const rows=$$('.math-command-item').filter(x=>x.offsetParent!==null); let idx=rows.findIndex(x=>x.classList.contains('active'));
      if(e.key==='ArrowDown'){e.preventDefault();idx=(idx+1+rows.length)%rows.length;rows.forEach((x,i)=>x.classList.toggle('active',i===idx));rows[idx]?.scrollIntoView({block:'nearest'});}
      if(e.key==='ArrowUp'){e.preventDefault();idx=(idx-1+rows.length)%rows.length;rows.forEach((x,i)=>x.classList.toggle('active',i===idx));rows[idx]?.scrollIntoView({block:'nearest'});}
      if(e.key==='Enter'){e.preventDefault();(rows[idx>=0?idx:0])?.click();}
      if(e.key==='Escape'){closeCommand();}
    });
  }
  function renderCommandList(){
    ensureCommand(); const value=($('#mathCommandSearch')?.value||'').toLocaleLowerCase('vi').trim(); const list=ITEMS.filter(x=>!value||`${x.label} ${x.sub} ${x.group}`.toLocaleLowerCase('vi').includes(value));
    const host=$('#mathCommandList'); if(!host)return;
    host.innerHTML=list.map((x,i)=>`<button type="button" class="math-command-item ${i===0?'active':''}" data-command-route="${x.id}"><i>${x.icon}</i><span><b>${esc(x.label)}</b><small>${esc(x.group)} · ${esc(x.sub)}</small></span><kbd>${esc(x.key)}</kbd></button>`).join('')||'<div class="math-formula-stage-empty">Không có chức năng phù hợp.</div>';
    $$('[data-command-route]',host).forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.commandRoute;closeCommand();route(id);}));
  }
  function openCommand(){ ensureCommand(); renderCommandList(); $('#mathCommandPalette')?.classList.add('open'); const s=$('#mathCommandSearch'); if(s){s.value='';s.focus();renderCommandList();} }
  function closeCommand(){ $('#mathCommandPalette')?.classList.remove('open'); }

  function syncFromRuntime(){
    if(document.body.classList.contains('math-roadmap-active')){setActive('roadmap');return;}
    if(document.body.classList.contains('e129-theory-storage')) return;
    const title=($('#pageTitle')?.textContent||'').toLocaleLowerCase('vi');
    if(title.includes('ôn tập')) setActive('review');
    else if(title.includes('bài tập')||title.includes('thực hành')||title.includes('ứng dụng')||title.includes('kiểm tra')) setActive('practice');
    else if(title.includes('lý thuyết')||document.querySelector('[data-current-lesson]')) setActive('learn');
  }
  function scheduleSync(ms=100){clearTimeout(timer);timer=setTimeout(()=>{ensureNav();syncFromRuntime();global.BAUMAN_MATH_PREMIUM?.refresh?.();global.BAUMAN_MATH_DASHBOARD_V2?.refresh?.();},ms);}

  function bind(){
    document.addEventListener('click',e=>{
      const nav=e.target.closest('[data-math-nav]'); if(nav){e.preventDefault();route(nav.dataset.mathNav);return;}
      const stage=e.target.closest('[data-math-roadmap-stage]'); if(stage){e.preventDefault();renderRoadmap(stage.dataset.mathRoadmapStage);return;}
      const chapter=e.target.closest('[data-math-roadmap-chapter]'); if(chapter){e.preventDefault();openRoadmapChapter(chapter.dataset.mathRoadmapChapter,chapter.dataset.mathRoadmapStageId);return;}
      const sys=e.target.closest('[data-math-system]'); if(sys){e.preventDefault();const a=sys.dataset.mathSystem;if(a==='command')openCommand();if(a==='focus')global.BAUMAN_MATH_WORKSPACE?.openControl?.();if(a==='theme')$('#themeBtn')?.click();return;}
      if(e.target.closest('[data-e129-nav],[data-e186-pick],[data-e169-pick-activity],[data-e129-back-theory],[data-e129-open-vault],[data-e129-refresh]')) scheduleSync(160);
    },true);
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommand();return;}
      if(e.key==='Escape'){closeCommand();closeFormulaFocus();}
      if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&document.activeElement===document.body){
        const hit=ITEMS.find(x=>x.key.toLowerCase()===e.key.toLowerCase()); if(hit) route(hit.id);
      }
    });
  }

  function selfCheck(){return{release:RELEASE,ready:document.body.classList.contains('math-nav-ready'),primaryItems:PRIMARY_ITEMS.length,advancedItems:ADVANCED_ITEMS.length,roadmap:!!roadmapCache,e129:!!global.BAUMAN_MATH_THEORY_E129,e186:!!global.BAUMAN_MATH_E186_LESSON_FIRST,workspace:!!global.BAUMAN_MATH_WORKSPACE,mutationObserver:false,academicWrites:false,learnerFirstIA:true};}
  function init(){
    if(!document.body||document.body.dataset.mathUnifiedNav==='1')return;
    document.body.dataset.mathUnifiedNav='1';document.body.classList.add('math-nav-ready');ensureFormulaFocus();ensureCommand();bind();ensureNav();
    [250,700,1400,2400].forEach(ms=>setTimeout(()=>{ensureNav();syncFromRuntime();},ms));
    global.BAUMAN_MATH_NAVIGATION={release:RELEASE,route,openCommand,openFormulaFocus,refresh:()=>{ensureNav();syncFromRuntime();},selfCheck};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
