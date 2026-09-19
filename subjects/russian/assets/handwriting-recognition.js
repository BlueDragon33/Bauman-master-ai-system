'use strict';
(function(){
  const SCHEMA='RUSSIAN_HANDWRITING_RECOGNITION_V1';
  const STORE_KEY='bauman_russian_handwriting_recognition_v1';
  const PROBE='ДдЖжФфЯяШш';
  const CANDIDATES=['Segoe Script','Segoe Print','Comic Sans MS'];
  const FALLBACKS=['monospace','serif','sans-serif'];
  const clean=v=>String(v??'').trim();
  const esc=v=>clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function measure(ctx,font){ctx.font='64px '+font;return ctx.measureText(PROBE).width;}
  function supportsCyrillicScriptFont(family){
    try{
      const canvas=document.createElement('canvas');
      const ctx=canvas.getContext('2d');
      if(!ctx)return false;
      return FALLBACKS.every(fallback=>{
        const baseline=measure(ctx,fallback);
        const candidate=measure(ctx,'"'+family+'",'+fallback);
        return Math.abs(candidate-baseline)>0.5;
      });
    }catch(_){return false;}
  }
  function detect(){
    const font=CANDIDATES.find(supportsCyrillicScriptFont)||'';
    const available=!!font;
    return {schema:SCHEMA,available,canScore:available,font:font||null,mode:available?'local-script-font':'reference-only',reason:available
      ?'Thiết bị có font chữ tay Cyrillic đủ khác fallback để dùng cho bài nhận diện.'
      :'Không xác nhận được font chữ tay Cyrillic tin cậy. Chỉ dùng khung nét tham khảo; không chấm nhận diện.'};
  }

  function emptyState(){return {schema:SCHEMA,attempts:0,correct:0,questionIndex:0,lastAnswerId:'',lastCorrect:null,lastLetterId:'',weak:{},updatedAt:null};}
  function readState(){try{const x=JSON.parse(localStorage.getItem(STORE_KEY)||'{}');return {...emptyState(),...x,weak:x&&typeof x.weak==='object'?x.weak:{}};}catch(_){return emptyState();}}
  function writeState(s){s.updatedAt=new Date().toISOString();try{localStorage.setItem(STORE_KEY,JSON.stringify(s));}catch(_){}return s;}

  let capability=null,alphabet=[],renderQueued=false;
  function getCapability(){if(!capability)capability=detect();return {...capability};}
  function currentQuestion(state=readState()){if(!alphabet.length)return null;const i=Math.max(0,Number(state.questionIndex)||0)%alphabet.length;return {item:alphabet[i],index:i};}
  function choiceIndexes(index,attempts){
    if(!alphabet.length)return [];
    const base=[index,(index+7)%alphabet.length,(index+14)%alphabet.length,(index+21)%alphabet.length];
    const unique=[...new Set(base)];
    const shift=Math.max(0,Number(attempts)||0)%Math.max(1,unique.length);
    return unique.slice(shift).concat(unique.slice(0,shift));
  }
  function bannerHtml(cap){
    const state=cap.canScore?'Sẵn sàng nhận diện':'Chế độ tham khảo';
    const cls=cap.canScore?'ready':'reference';
    const small=cap.font?('Font cục bộ: '+clean(cap.font)):'Không chấm đúng/sai theo hình chữ tay trên thiết bị này.';
    return '<section class="ru-handwriting-capability '+cls+'" data-ru-handwriting-capability="'+esc(cap.mode)+'"><div><span>HANDWRITING AUTHORITY</span><b>'+esc(state)+'</b><p>'+esc(cap.reason)+'</p></div><small>'+esc(small)+'</small></section>';
  }
  function drillHtml(cap,state){
    if(!cap.canScore)return '<section class="ru-handwriting-recognition disabled" data-ru-recognition-state="disabled"><div><span>NHẬN DIỆN CHỮ TAY</span><b>Chưa chấm trên thiết bị này</b><p>Tiếp tục nhìn chữ in, khung nét tham khảo và luyện viết. Bài chọn đúng/sai chỉ mở khi capability probe xác nhận font chữ tay Cyrillic.</p></div></section>';
    const q=currentQuestion(state);
    if(!q)return '<section class="ru-handwriting-recognition disabled" data-ru-recognition-state="loading"><b>Đang nạp bảng chữ cái…</b></section>';
    const choices=choiceIndexes(q.index,state.attempts).map(i=>{const x=alphabet[i];return '<button type="button" data-ru-handwriting-choice="'+esc(x.id)+'" lang="ru"><span>'+esc(x.cursive||x.text||x.print||'')+'</span></button>';}).join('');
    const score=state.attempts?Math.round((Number(state.correct||0)/Number(state.attempts||1))*100):0;
    const feedback=state.lastCorrect===true?'<em class="ok">Đúng · tiếp tục chữ kế tiếp</em>':state.lastCorrect===false?'<em class="retry">Chưa đúng · thử lại cùng chữ</em>':'';
    return '<section class="ru-handwriting-recognition ready" data-ru-recognition-state="ready"><header><div><span>NHẬN DIỆN CHỮ IN → CHỮ TAY</span><b>Chọn cùng một chữ</b><p>Không dùng bản dịch nghĩa; chỉ đối chiếu hình dạng chữ Nga.</p></div><small>'+Number(state.correct||0)+'/'+Number(state.attempts||0)+' · '+score+'%</small></header><div class="ru-handwriting-question"><strong lang="ru">'+esc(q.item.print||q.item.text||'')+'</strong><div class="ru-handwriting-choices">'+choices+'</div></div>'+feedback+'</section>';
  }
  function render(){
    const host=document.querySelector('.writing-studio');
    if(!host){document.querySelector('.ru-handwriting-capability')?.remove();document.querySelector('.ru-handwriting-recognition')?.remove();return;}
    const cap=getCapability(),state=readState();
    document.documentElement.dataset.ruHandwritingRecognition=cap.mode;
    if(cap.font)document.documentElement.style.setProperty('--ru-hand-font','"'+cap.font+'",cursive');
    else document.documentElement.style.removeProperty('--ru-hand-font');
    const capHtml=bannerHtml(cap),capSig=cap.mode+'|'+(cap.font||'');
    let banner=document.querySelector('.ru-handwriting-capability');
    if(!banner){const hero=host.querySelector('.writing-hero');if(hero)hero.insertAdjacentHTML('afterend',capHtml);else host.insertAdjacentHTML('afterbegin',capHtml);banner=document.querySelector('.ru-handwriting-capability');if(banner)banner.dataset.renderSig=capSig;}
    else if(banner.dataset.renderSig!==capSig){banner.outerHTML=capHtml;banner=document.querySelector('.ru-handwriting-capability');if(banner)banner.dataset.renderSig=capSig;}
    const drill=drillHtml(cap,state),drillSig=[cap.mode,state.attempts,state.correct,state.questionIndex,state.lastCorrect,alphabet.length].join('|');
    let box=document.querySelector('.ru-handwriting-recognition');
    if(!box){banner?.insertAdjacentHTML('afterend',drill);box=document.querySelector('.ru-handwriting-recognition');if(box)box.dataset.renderSig=drillSig;}
    else if(box.dataset.renderSig!==drillSig){box.outerHTML=drill;box=document.querySelector('.ru-handwriting-recognition');if(box)box.dataset.renderSig=drillSig;}
  }
  function schedule(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render();});}
  async function loadAlphabet(){
    try{const data=await fetch('data/handwriting.json').then(r=>r.ok?r.json():[]);alphabet=Array.isArray(data)?data.filter(x=>x&&x.mode==='alphabet'&&x.id):[];}catch(_){alphabet=[];}
    schedule();
  }
  function answer(id){
    const cap=getCapability();if(!cap.canScore||!alphabet.length)return false;
    const state=readState(),q=currentQuestion(state);if(!q)return false;
    const correct=clean(id)===clean(q.item.id);
    state.attempts=Number(state.attempts||0)+1;state.lastAnswerId=clean(id);state.lastCorrect=correct;state.lastLetterId=clean(q.item.id);
    if(correct){state.correct=Number(state.correct||0)+1;state.questionIndex=(q.index+1)%alphabet.length;}
    else state.weak[q.item.id]=Number(state.weak[q.item.id]||0)+1;
    writeState(state);
    window.RussianLearningFlow?.touch?.('alphabet',{recognitionAttempts:state.attempts,recognitionCorrect:state.correct,recognitionLastLetterId:state.lastLetterId,recognitionLastCorrect:correct,recognitionAuthority:cap.mode});
    schedule();return correct;
  }

  document.addEventListener('click',event=>{const choice=event.target.closest?.('[data-ru-handwriting-choice]');if(choice){event.preventDefault();answer(choice.dataset.ruHandwritingChoice);}},true);
  document.addEventListener('DOMContentLoaded',()=>{capability=detect();loadAlphabet();schedule();const view=document.getElementById('view');if(view)new MutationObserver(schedule).observe(view,{childList:true,subtree:true});});
  window.addEventListener('russian:learning-state',schedule);
  window.RussianHandwritingRecognition={schema:SCHEMA,detect,getCapability,canScore:()=>getCapability().canScore===true,getState:()=>JSON.parse(JSON.stringify(readState())),answer,refresh:()=>{capability=detect();schedule();return getCapability();}};
})();