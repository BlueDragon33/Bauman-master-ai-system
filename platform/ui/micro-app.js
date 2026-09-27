/* UI-E14 · Native-feeling shell for standalone HTML simulations */
(function(){
  'use strict';
  function safe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function boot(){
    document.body.setAttribute('data-bui','1');
    document.body.setAttribute('data-bui-micro-app','1');
    const title=(document.title||document.querySelector('h1')?.textContent||'Mô phỏng').trim();
    const main=document.querySelector('main');if(main)main.dataset.buiResourceViewer='simulation';
    const header=document.createElement('header');header.className='bui-micro-header';header.dataset.buiFocusHide='';
    header.innerHTML='<button type="button" data-micro-back aria-label="Quay lại">← <span>Quay lại</span></button>'+
      '<div class="bui-micro-header__copy"><b>'+safe(title)+'</b><small>Mô phỏng tương tác · Sẵn sàng</small></div>'+
      '<div class="bui-micro-header__actions">'+
        '<button type="button" data-micro-focus><span>Focus</span> ◉</button>'+
        '<button type="button" data-micro-reload><span>Tải lại</span> ↻</button>'+
        '<button type="button" data-micro-fullscreen><span>Toàn màn hình</span> ⛶</button>'+
        '<button type="button" data-micro-help aria-expanded="false"><span>Trợ giúp</span> ?</button>'+
      '</div>';
    document.body.insertBefore(header,document.body.firstChild);
    const help=document.createElement('aside');help.className='bui-micro-help';help.hidden=true;help.innerHTML='<h2>Cách sử dụng</h2><p>Thay đổi tham số, quan sát kết quả, ghi lại biến nhạy nhất và liên hệ hiện tượng với công thức hoặc workflow đang học.</p>';document.body.appendChild(help);
    header.addEventListener('click',e=>{
      if(e.target.closest('[data-micro-back]')){if(history.length>1)history.back();else location.href='../index.html'}
      if(e.target.closest('[data-micro-reload]'))location.reload();
      if(e.target.closest('[data-micro-focus]'))window.BaumanUI?.focus?.toggle();
      if(e.target.closest('[data-micro-fullscreen]')){if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.()}
      const hb=e.target.closest('[data-micro-help]');if(hb){help.hidden=!help.hidden;hb.setAttribute('aria-expanded',help.hidden?'false':'true')}
    });
    window.BaumanUI?.commands?.register({id:'micro.reload',label:'Tải lại mô phỏng',group:'Mô phỏng',icon:'↻',run:()=>location.reload()});
    window.BaumanUI?.commands?.register({id:'micro.fullscreen',label:'Toàn màn hình mô phỏng',group:'Mô phỏng',icon:'□',run:()=>document.fullscreenElement?document.exitFullscreen?.():document.documentElement.requestFullscreen?.()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
