'use strict';
(function(){
  const VERSION='Learning Studio 1.0.0';
  const $=s=>document.querySelector(s);
  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function A(){return window.BaumanAdaptiveLearning||null}
  function ensurePage(){
    const nav=$('#nav');const main=$('.main');if(!nav||!main)return null;
    let btn=nav.querySelector('[data-page="learning-studio"]');
    if(!btn){btn=document.createElement('button');btn.dataset.page='learning-studio';btn.title='Học sâu';btn.innerHTML='<i>🧠</i><span>Học sâu</span>';nav.appendChild(btn);btn.addEventListener('click',openPage);}
    let page=$('#page-learning-studio');
    if(!page){page=document.createElement('section');page.id='page-learning-studio';page.className='page';main.appendChild(page);}
    return page;
  }
  function openPage(){
    document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.querySelectorAll('#nav button').forEach(x=>x.classList.remove('active'));
    const page=ensurePage();page?.classList.add('active');$('#nav [data-page="learning-studio"]')?.classList.add('active');
    const title=$('#pageTitle'),sub=$('#pageSubtitle');if(title)title.textContent='Học sâu';if(sub)sub.textContent='Diagnostic · Feynman · Error Notebook · Russian · Project · Oral defense';render();
  }
  function state(){return A()?.state||{competencies:{},language:{},errorNotebook:[]}}
  function options(){return Object.keys(state().competencies||{}).sort().map(id=>`<option value="${h(id)}">${h(id)}</option>`).join('')}
  function errorRows(){const rows=(state().errorNotebook||[]).slice(-20).reverse();return rows.length?rows.map(x=>`<tr><td>${new Date(x.date).toLocaleDateString('vi-VN')}</td><td>${h(x.type)}</td><td>${h(x.competencyId||x.subjectId||'')}</td><td>${h(x.message||'')}</td></tr>`).join(''):'<tr><td colspan="4">Chưa có lỗi được ghi nhận.</td></tr>'}
  function russianSkills(){const s=state().language?.skills||{};return ['general','technicalReading','lectureListening','technicalWriting','technicalSpeaking'].map(k=>`<label>${h(k)}<input type="range" min="0" max="100" value="${Number(s[k]||0)}" data-ruskill="${k}"><span data-ruskill-value="${k}">${Number(s[k]||0)}%</span></label>`).join('')}
  function projectSteps(){
    const steps=['Python/OpenCV','OOP architecture','MQTT/IoT','SQL/Database','Statistics','Machine Learning','Neural Networks','Optimization','Russian documentation','Mini NIR','Oral defense'];
    const done=JSON.parse(localStorage.getItem('baumanProjectSpineV1')||'{}');return steps.map((x,i)=>`<label class="studio-project-step"><input type="checkbox" data-project-step="${i}" ${done[i]?'checked':''}><span>${h(x)}</span></label>`).join('')
  }
  function render(){
    const page=ensurePage();if(!page||!A())return;
    page.innerHTML=`<div class="studio-hero panel"><div><small>${VERSION}</small><h2>Phòng học sâu</h2><p>Mục tiêu là phát hiện lỗ hổng thật, buộc não tự truy xuất và biến kiến thức thành khả năng làm việc/bảo vệ bằng tiếng Nga.</p></div><span class="studio-stage">Russian: ${h(A().recommendedLanguageStage())}</span></div>
    <div class="studio-grid">
      <section class="panel"><h3>1 · Diagnostic nhanh</h3><label>Năng lực<select id="studioDiagCompetency" class="field">${options()}</select></label><label>Điểm diagnostic<input id="studioDiagScore" class="field" type="number" min="0" max="100" value="60"></label><button class="btn primary" id="studioDiagSave">Ghi kết quả</button><div id="studioDiagResult" class="studio-result"></div></section>
      <section class="panel"><h3>2 · Feynman checkpoint</h3><label>Chủ đề<input id="studioFeynmanTopic" class="field" placeholder="Ví dụ: Eigenvalue và ổn định hệ"></label><label>Giải thích bằng lời của bạn<textarea id="studioFeynmanText" class="field" rows="7" placeholder="Không nhìn tài liệu. Viết điều bạn thực sự hiểu..."></textarea></label><button class="btn" id="studioFeynmanSave">Lưu checkpoint</button><small>Checkpoint này chưa tự chấm nội dung; nó tạo evidence để AI Mentor/giảng viên phản biện dùng tiếp.</small></section>
      <section class="panel"><h3>3 · Mastery evidence</h3><label>Năng lực<select id="studioMasteryCompetency" class="field">${options()}</select></label><div class="studio-evidence">${['independent','problemSolving','application','explanation','retention'].map(k=>`<label>${k}<input type="number" min="0" max="100" value="70" data-evidence="${k}"></label>`).join('')}<label>Hints used<input type="number" min="0" max="10" value="0" data-evidence="hintsUsed"></label></div><button class="btn primary" id="studioMasterySave">Cập nhật Mastery</button><div id="studioMasteryResult" class="studio-result"></div></section>
      <section class="panel"><h3>4 · Russian skill radar</h3><div class="studio-russian-skills">${russianSkills()}</div><button class="btn" id="studioRussianSave">Lưu năng lực Nga</button><p>Không dùng một mức A1/A2 duy nhất. Đọc kỹ thuật, nghe lecture, viết và nói được theo dõi riêng.</p></section>
      <section class="panel studio-wide"><h3>5 · Error Notebook</h3><div class="studio-error-entry"><select id="studioErrorType" class="field"><option>concept</option><option>calculation</option><option>prerequisite</option><option>language</option><option>careless</option><option>programming</option><option>reasoning</option></select><select id="studioErrorCompetency" class="field">${options()}</select><input id="studioErrorMessage" class="field" placeholder="Mô tả lỗi cụ thể"><button class="btn" id="studioErrorSave">Ghi lỗi</button></div><div class="table-wrap"><table><thead><tr><th>Ngày</th><th>Loại</th><th>Năng lực</th><th>Lỗi</th></tr></thead><tbody>${errorRows()}</tbody></table></div></section>
      <section class="panel"><h3>6 · Project spine</h3><p><b>Intelligent IoT Vision System</b></p><div class="studio-project">${projectSteps()}</div><small>Project phát triển từ nền LabVIEW/IoT/xử lý ảnh để nối sang Python, Data, AI và Russian research.</small></section>
      <section class="panel"><h3>7 · Oral defense simulator</h3><p id="studioDefenseQuestion">Нажмите «Следующий вопрос».</p><button class="btn primary" id="studioDefenseNext">Câu hỏi tiếp</button><textarea id="studioDefenseAnswer" class="field" rows="5" placeholder="Trả lời bằng tiếng Nga; nếu chưa đủ trình độ có thể trả lời ngắn và dùng thuật ngữ đã học."></textarea><button class="btn" id="studioDefenseSave">Lưu câu trả lời</button></section>
      <section class="panel studio-wide"><h3>8 · Closed-AI checkpoint</h3><p>Khi bật checkpoint này, người học tự làm trước. Không hint, không đáp án, không tra cứu từ hệ thống. Sau khi nộp mới mở phân tích.</p><button class="btn danger" id="studioClosedStart">Bắt đầu 25 phút</button><strong id="studioClosedStatus">Chưa bắt đầu</strong></section>
    </div>`;
    bind();
  }
  function bind(){
    $('#studioDiagSave')?.addEventListener('click',()=>{const id=$('#studioDiagCompetency').value,score=Number($('#studioDiagScore').value);const r=A().recordDiagnostic(id,score,{source:'learning-studio'});$('#studioDiagResult').textContent=`${r.state} · ${r.action}`;});
    $('#studioMasterySave')?.addEventListener('click',()=>{const ev={};document.querySelectorAll('[data-evidence]').forEach(x=>ev[x.dataset.evidence]=Number(x.value));const r=A().recordMasteryEvidence($('#studioMasteryCompetency').value,ev);$('#studioMasteryResult').textContent=`${r.state} · ${Math.round(r.score)}%`;});
    $('#studioFeynmanSave')?.addEventListener('click',()=>{const topic=$('#studioFeynmanTopic').value.trim(),text=$('#studioFeynmanText').value.trim();if(!topic||!text)return;const arr=JSON.parse(localStorage.getItem('baumanFeynmanV1')||'[]');arr.push({date:new Date().toISOString(),topic,text});localStorage.setItem('baumanFeynmanV1',JSON.stringify(arr.slice(-200)));$('#studioFeynmanText').value='';});
    document.querySelectorAll('[data-ruskill]').forEach(x=>x.addEventListener('input',()=>{const o=document.querySelector(`[data-ruskill-value="${x.dataset.ruskill}"]`);if(o)o.textContent=`${x.value}%`}));
    $('#studioRussianSave')?.addEventListener('click',()=>{const s={};document.querySelectorAll('[data-ruskill]').forEach(x=>s[x.dataset.ruskill]=Number(x.value));A().setLanguageSkills(s);render();});
    $('#studioErrorSave')?.addEventListener('click',()=>{A().addError({type:$('#studioErrorType').value,competencyId:$('#studioErrorCompetency').value,message:$('#studioErrorMessage').value});render();});
    document.querySelectorAll('[data-project-step]').forEach(x=>x.addEventListener('change',()=>{const d=JSON.parse(localStorage.getItem('baumanProjectSpineV1')||'{}');d[x.dataset.projectStep]=x.checked;localStorage.setItem('baumanProjectSpineV1',JSON.stringify(d));}));
    const questions=['Почему вы выбрали этот метод?','Какие исходные данные используются?','Как вы проверили правильность результата?','Какие ограничения есть у вашей модели?','Почему не был выбран другой алгоритм?','Что изменится при увеличении объёма данных?','Какова практическая ценность этой системы?','Какие результаты эксперимента являются наиболее важными?'];
    $('#studioDefenseNext')?.addEventListener('click',()=>{$('#studioDefenseQuestion').textContent=questions[Math.floor(Math.random()*questions.length)]});
    $('#studioDefenseSave')?.addEventListener('click',()=>{const q=$('#studioDefenseQuestion').textContent,a=$('#studioDefenseAnswer').value.trim();if(!a)return;const arr=JSON.parse(localStorage.getItem('baumanDefenseV1')||'[]');arr.push({date:new Date().toISOString(),q,a});localStorage.setItem('baumanDefenseV1',JSON.stringify(arr.slice(-100)));$('#studioDefenseAnswer').value='';});
    $('#studioClosedStart')?.addEventListener('click',()=>startClosedCheckpoint());
  }
  function startClosedCheckpoint(){
    const end=Date.now()+25*60000;localStorage.setItem('baumanClosedAiUntil',String(end));tickClosed();
  }
  function tickClosed(){
    const el=$('#studioClosedStatus');if(!el)return;const end=Number(localStorage.getItem('baumanClosedAiUntil')||0),left=end-Date.now();
    if(left<=0){el.textContent=end?'Đã hết 25 phút · nộp bài rồi mới mở phân tích':'Chưa bắt đầu';return}
    const m=Math.floor(left/60000),s=Math.floor(left%60000/1000);el.textContent=`Closed-AI: ${m}:${String(s).padStart(2,'0')}`;setTimeout(tickClosed,1000);
  }
  function injectStyle(){if($('#learningStudioStyle'))return;const s=document.createElement('style');s.id='learningStudioStyle';s.textContent=`.studio-hero{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.studio-stage{padding:6px 10px;border-radius:999px;background:rgba(43,92,160,.12)}.studio-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.studio-grid>.panel{margin:0}.studio-wide{grid-column:1/-1}.studio-evidence,.studio-russian-skills{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.studio-evidence label,.studio-russian-skills label{display:grid;gap:4px}.studio-error-entry{display:grid;grid-template-columns:160px 1fr 2fr auto;gap:8px}.studio-project{display:grid;gap:6px}.studio-project-step{display:flex;gap:8px;align-items:center}.studio-result{margin-top:8px;font-weight:700}.studio-grid textarea{width:100%}@media(max-width:850px){.studio-grid{grid-template-columns:1fr}.studio-wide{grid-column:auto}.studio-error-entry{grid-template-columns:1fr}.studio-evidence,.studio-russian-skills{grid-template-columns:1fr}}`;document.head.appendChild(s)}
  function init(){injectStyle();ensurePage();if(location.hash==='#learning-studio')openPage()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
