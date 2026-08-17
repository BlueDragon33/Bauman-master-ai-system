'use strict';
(function(){
  const VERSION='Technical Russian Layer 1.0.0';
  const URL='assets/data/russian-technical-lexicon.json';
  let lexicon=[];
  const skipTags=new Set(['SCRIPT','STYLE','CODE','PRE','TEXTAREA','INPUT','SELECT','OPTION','MATH','SVG']);
  const escapeRegex=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  function adaptive(){return window.BaumanAdaptiveLearning||null}
  async function load(){
    try{const r=await fetch(URL,{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);const j=await r.json();lexicon=(j.terms||[]).sort((a,b)=>b.vi.length-a.vi.length);return true}catch(err){console.warn('[TechnicalRussian] lexicon load failed',err);return false}
  }
  function eligibleTextNode(n){
    const p=n.parentElement;if(!p||skipTags.has(p.tagName))return false;
    if(p.closest('.adaptive-ru-tooltip,.ru-term,[data-no-russian],button,input,textarea,select,option,code,pre,script,style'))return false;
    const t=n.nodeValue||'';return t.trim().length>=3;
  }
  function annotateTextNode(node){
    if(!eligibleTextNode(node))return 0;let text=node.nodeValue;let matches=[];
    lexicon.forEach(term=>{
      const re=new RegExp(`(^|[^\\p{L}])(${escapeRegex(term.vi)})(?=$|[^\\p{L}])`,'giu');let m;
      while((m=re.exec(text))){const start=m.index+m[1].length;matches.push({start,end:start+m[2].length,term});if(re.lastIndex===m.index)re.lastIndex++;}
    });
    if(!matches.length)return 0;
    matches.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start));
    const chosen=[];let end=-1;matches.forEach(m=>{if(m.start>=end){chosen.push(m);end=m.end}});if(!chosen.length)return 0;
    const frag=document.createDocumentFragment();let pos=0;
    chosen.forEach(m=>{
      if(m.start>pos)frag.appendChild(document.createTextNode(text.slice(pos,m.start)));
      const span=document.createElement('span');span.className='ru-term';span.textContent=text.slice(m.start,m.end);span.dataset.termId=m.term.id;span.dataset.vi=m.term.vi;span.dataset.ru=m.term.ru;if(m.term.ipa)span.dataset.ipa=m.term.ipa;if(m.term.phonetic)span.dataset.phonetic=m.term.phonetic;frag.appendChild(span);pos=m.end;
    });
    if(pos<text.length)frag.appendChild(document.createTextNode(text.slice(pos)));node.replaceWith(frag);return chosen.length;
  }
  function annotate(root=document.body){
    if(!root||!lexicon.length)return 0;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];let n;while((n=w.nextNode()))if(eligibleTextNode(n))nodes.push(n);let count=0;nodes.forEach(x=>count+=annotateTextNode(x));return count;
  }
  function currentStage(){return adaptive()?.recommendedLanguageStage?.()||'L0'}
  function applyStageClass(){document.documentElement.dataset.russianStage=currentStage()}
  function installObserver(){
    let timer=0;const obs=new MutationObserver(muts=>{
      if(muts.every(m=>m.target.closest?.('.adaptive-ru-tooltip')))return;
      clearTimeout(timer);timer=setTimeout(()=>{annotate(document.querySelector('.page.active')||document.body);applyStageClass()},120);
    });obs.observe(document.body,{subtree:true,childList:true});
  }
  function installContextActions(){
    document.addEventListener('dblclick',e=>{
      const el=e.target.closest?.('.ru-term');if(!el)return;const a=adaptive();if(!a)return;
      a.recordTerm?.(el.dataset.termId,true,true);el.title='Đã ghi nhận sử dụng chủ động thuật ngữ Nga';
    });
  }
  async function init(){if(!await load())return;annotate();applyStageClass();installObserver();installContextActions();window.BaumanTechnicalRussian={VERSION,annotate,get lexicon(){return lexicon},currentStage};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
