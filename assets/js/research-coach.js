'use strict';
(function(){
  const KEY='baumanMiniNIRV1';
  const $=s=>document.querySelector(s);
  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(_){return{}}}
  function save(x){localStorage.setItem(KEY,JSON.stringify(x));try{if(window.state){window.state.miniNIR=x;window.save?.()}}catch(_){}}
  const fields=[
    ['title','Tên đề tài / Тема исследования'],
    ['question','Câu hỏi nghiên cứu / Исследовательский вопрос'],
    ['hypothesis','Giả thuyết / Гипотеза'],
    ['method','Phương pháp / Методика'],
    ['data','Dữ liệu và schema / Данные'],
    ['metrics','Chỉ số đánh giá / Метрики'],
    ['experiment','Kế hoạch thực nghiệm / План эксперимента'],
    ['results','Kết quả / Результаты'],
    ['limitations','Giới hạn / Ограничения'],
    ['conclusion','Kết luận / Выводы'],
    ['ruAbstract','Tóm tắt tiếng Nga / Аннотация']
  ];
  function defaultData(){return{title:'Intelligent IoT Vision System',question:'',hypothesis:'',method:'',data:'',metrics:'',experiment:'',results:'',limitations:'',conclusion:'',ruAbstract:'',logs:[],updatedAt:null}}
  function ensure(){const root=$('#page-research');if(!root)return null;let box=$('#miniNirCoach');if(!box){box=document.createElement('section');box.id='miniNirCoach';box.className='panel mini-nir';root.prepend(box)}return box}
  function completeness(d){const required=['question','hypothesis','method','data','metrics','experiment','results','limitations','conclusion'];const done=required.filter(k=>String(d[k]||'').trim().length>=20).length;return Math.round(done*100/required.length)}
  function render(){const box=ensure();if(!box)return;const d={...defaultData(),...load()},pct=completeness(d);box.innerHTML=`<div class="nir-head"><div><small>Mini-НИР · Research Coach</small><h2>Từ project kỹ thuật thành nghiên cứu có thể bảo vệ</h2><p>Không cần đợi tới luận văn mới học nghiên cứu. Mỗi vòng phải có câu hỏi, dữ liệu, metric, thực nghiệm, giới hạn và kết luận.</p></div><strong>${pct}% cấu trúc</strong></div><div class="nir-fields">${fields.map(([k,label])=>`<label><span>${h(label)}</span>${k==='title'?`<input class="field" data-nir="${k}" value="${h(d[k])}">`:`<textarea class="field" rows="4" data-nir="${k}" placeholder="Viết ngắn nhưng có thể kiểm chứng...">${h(d[k])}</textarea>`}</label>`).join('')}</div><div class="nir-actions"><button class="btn primary" id="nirSave">Lưu Mini-НИР</button><button class="btn" id="nirAddLog">+ Nhật ký thực nghiệm</button><button class="btn" id="nirCopyMd">Sao chép Markdown</button></div><div id="nirLogBox"><h3>Nhật ký thực nghiệm</h3>${(d.logs||[]).slice().reverse().map(x=>`<article><b>${h(new Date(x.date).toLocaleString('vi-VN'))}</b><p>${h(x.text)}</p></article>`).join('')||'<p>Chưa có nhật ký.</p>'}</div><details><summary>Checklist trước oral defense</summary><p>1) Tại sao chọn bài toán này? 2) Baseline là gì? 3) Dữ liệu đến từ đâu? 4) Metric có phù hợp không? 5) Kết quả có lặp lại được không? 6) Hạn chế lớn nhất? 7) Nếu làm lại sẽ đổi gì?</p></details>`;bind()}
  function collect(){const d={...defaultData(),...load()};document.querySelectorAll('[data-nir]').forEach(x=>d[x.dataset.nir]=x.value.trim());d.updatedAt=new Date().toISOString();return d}
  function markdown(d){return `# ${d.title||'Mini-NIR'}\n\n## Research question\n${d.question}\n\n## Hypothesis\n${d.hypothesis}\n\n## Method\n${d.method}\n\n## Data\n${d.data}\n\n## Metrics\n${d.metrics}\n\n## Experiment plan\n${d.experiment}\n\n## Results\n${d.results}\n\n## Limitations\n${d.limitations}\n\n## Conclusion\n${d.conclusion}\n\n## Аннотация\n${d.ruAbstract}\n`}
  function bind(){
    $('#nirSave')?.addEventListener('click',()=>{save(collect());window.toast?.('Đã lưu Mini-НИР.');render()});
    $('#nirAddLog')?.addEventListener('click',()=>{const text=prompt('Ghi ngắn: đã thử gì, thay đổi gì, kết quả ra sao?');if(!text)return;const d=collect();d.logs=d.logs||[];d.logs.push({date:new Date().toISOString(),text});save(d);render()});
    $('#nirCopyMd')?.addEventListener('click',async()=>{const d=collect();save(d);try{await navigator.clipboard.writeText(markdown(d));window.toast?.('Đã sao chép Markdown Mini-НИР.')}catch(_){window.toast?.('Không thể truy cập clipboard trên trình duyệt này.')}});
  }
  function style(){const s=document.createElement('style');s.textContent='.mini-nir{margin-bottom:16px}.nir-head{display:flex;justify-content:space-between;gap:16px}.nir-head strong{white-space:nowrap}.nir-fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}.nir-fields label{display:grid;gap:5px}.nir-fields label:has([data-nir="title"]),.nir-fields label:has([data-nir="ruAbstract"]){grid-column:1/-1}.nir-actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}#nirLogBox article{border-left:3px solid rgba(50,90,160,.25);padding-left:10px;margin:8px 0}@media(max-width:800px){.nir-fields{grid-template-columns:1fr}.nir-fields label{grid-column:auto!important}.nir-head{display:block}}';document.head.appendChild(s)}
  function init(){style();document.querySelector('[data-page="research"]')?.addEventListener('click',()=>setTimeout(render,0));new MutationObserver(()=>{if($('#page-research')?.classList.contains('active'))render()}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});setTimeout(render,250)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
