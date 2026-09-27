/* UI-E18 · Import Center state machine */
(function(){
  'use strict';
  const STEPS=['Upload','Detect','Classify','Preview','Validate','Publish'];
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function mount(target,options={}){
    const root=typeof target==='string'?document.querySelector(target):target;if(!root)return null;
    const state={step:0,file:null,detected:null,classification:null,valid:false,published:false};
    function render(){
      root.classList.add('bui-import');
      root.innerHTML='<div class="bui-import__steps">'+STEPS.map((x,i)=>'<div class="bui-import__step '+(i===state.step?'is-active ':'')+(i<state.step?'is-complete':'')+'"><b>'+esc(x)+'</b><span>'+(i+1)+'/6</span></div>').join('')+'</div>'+
        '<section class="bui-import__stage">'+stageHTML()+'</section>'+
        '<div class="bui-import__actions"><button type="button" class="bui-button" data-import-back '+(state.step===0?'disabled':'')+'>Quay lại</button><button type="button" class="bui-button bui-button--primary" data-import-next>'+nextLabel()+'</button></div>';
      bind();
    }
    function stageHTML(){
      if(state.step===0)return '<div class="bui-import__drop"><div><h3>Chọn nội dung để nhập</h3><p>Kéo thả hoặc chọn file. Manifest kỹ thuật chỉ hiển thị trong chế độ nâng cao.</p><input class="bui-input" type="file" data-import-file></div></div>';
      if(state.step===1)return '<div class="bui-loading-state"><h3>Nhận diện nội dung</h3><p>'+(state.file?'Đã nhận '+esc(state.file.name)+'. Hệ thống sẽ xác định loại tài nguyên và metadata cần thiết.':'Chưa có file.')+'</p></div>';
      if(state.step===2)return '<div class="bui-card"><h3>Phân loại</h3><p>Chọn loại nội dung để hệ thống dùng đúng ResourceLayout và renderer.</p><label class="bui-field"><span class="bui-label">Loại</span><select class="bui-select" data-import-type><option>Lesson</option><option>PDF</option><option>Video</option><option>Audio</option><option>HTML Micro-App</option><option>Simulation</option><option>Image</option><option>URL</option></select></label></div>';
      if(state.step===3)return '<div class="bui-card"><h3>Xem trước</h3><p><b>File:</b> '+esc(state.file?.name||'—')+'</p><p><b>Loại:</b> '+esc(state.classification||'Chưa chọn')+'</p><p>Kiểm tra tên, loại, khả năng hiển thị và ngữ cảnh trước khi xác thực.</p></div>';
      if(state.step===4)return '<div class="bui-card"><h3>Xác thực</h3><p>Kiểm tra cấu trúc, loại file, metadata tối thiểu và khả năng render an toàn.</p><label><input type="checkbox" data-import-valid '+(state.valid?'checked':'')+'> Nội dung đã qua kiểm tra</label></div>';
      return '<div class="bui-card"><h3>Sẵn sàng xuất bản</h3><p>Nội dung sẽ sử dụng Design Tokens, ResourceLayout và Component API của Bauman.</p><span class="bui-badge '+(state.published?'bui-badge--success':'bui-badge--info')+'">'+(state.published?'Đã xuất bản':'Chờ xác nhận')+'</span></div>';
    }
    function nextLabel(){return state.step===5?(state.published?'Hoàn tất':'Xuất bản'):'Tiếp tục'}
    function bind(){
      root.querySelector('[data-import-file]')?.addEventListener('change',e=>{state.file=e.target.files?.[0]||null});
      root.querySelector('[data-import-type]')?.addEventListener('change',e=>{state.classification=e.target.value});
      root.querySelector('[data-import-valid]')?.addEventListener('change',e=>{state.valid=e.target.checked});
      root.querySelector('[data-import-back]')?.addEventListener('click',()=>{state.step=Math.max(0,state.step-1);render()});
      root.querySelector('[data-import-next]')?.addEventListener('click',()=>{
        if(state.step===0&&!state.file){root.querySelector('[data-import-file]')?.focus();return}
        if(state.step===2&&!state.classification)state.classification=root.querySelector('[data-import-type]')?.value||'Lesson';
        if(state.step===4&&!state.valid){root.querySelector('[data-import-valid]')?.focus();return}
        if(state.step===5){state.published=true;options.onPublish?.({...state});render();return}
        state.step=Math.min(5,state.step+1);render();
      });
    }
    render();return {state,render,destroy:()=>root.replaceChildren()};
  }
  function boot(){if(window.BaumanUI)window.BaumanUI.importCenter={mount,steps:[...STEPS]}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
