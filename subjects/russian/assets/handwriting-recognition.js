'use strict';
(function(){
  const SCHEMA='RUSSIAN_HANDWRITING_RECOGNITION_V1';
  const STORE_KEY='bauman_russian_handwriting_recognition_v1';
  const PROBE='ДдЖжФфЯяШш';
  const PREVIEW_CANDIDATES=['Segoe Script','Segoe Print','Comic Sans MS'];
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
  function authoritySnapshot(){
    const raw=window.RUSSIAN_HANDWRITING_GLYPH_AUTHORITY||{};
    return {
      schema:clean(raw.schema),
      status:clean(raw.status)||'blocked',
      source:clean(raw.source)||'none',
      trustedFamilies:Array.isArray(raw.trustedFamilies)?raw.trustedFamilies.map(clean).filter(Boolean):[],
      asset:clean(raw.asset)||null,
      assetSha256:clean(raw.assetSha256)||null,
      license:clean(raw.license)||null,
      licenseSha256:clean(raw.licenseSha256)||null,
      coverageManifest:clean(raw.coverageManifest)||null,
      coverageSha256:clean(raw.coverageSha256)||null,
      verifiedAt:clean(raw.verifiedAt)||null,
      note:clean(raw.note)
    };
  }
  const DIGEST=/^[a-f0-9]{64}$/i;
  let authorityRuntime={status:'idle',family:null,error:null,verifiedAt:null},authorityPromise=null;
  function authorityMetadataReady(authority){
    return authority.status==='ready'
      &&authority.source==='bundled-vetted'
      &&authority.trustedFamilies.length>0
      &&!!authority.asset&&DIGEST.test(authority.assetSha256||'')
      &&!!authority.license&&DIGEST.test(authority.licenseSha256||'')
      &&!!authority.coverageManifest&&DIGEST.test(authority.coverageSha256||'')
      &&!!authority.verifiedAt;
  }
  function runtimeUrl(value){
    const v=clean(value),prefix='subjects/russian/';
    return v.startsWith(prefix)?'./'+v.slice(prefix.length):v;
  }
  function bytesHex(buffer){return [...new Uint8Array(buffer)].map(x=>x.toString(16).padStart(2,'0')).join('');}
  async function sha256Hex(buffer){
    if(!window.crypto?.subtle)throw new Error('Web Crypto SHA-256 unavailable');
    return bytesHex(await window.crypto.subtle.digest('SHA-256',buffer));
  }
  async function fetchBytes(value){
    const res=await fetch(runtimeUrl(value),{cache:'no-store'});
    if(!res.ok)throw new Error('Authority asset fetch failed: '+res.status);
    return res.arrayBuffer();
  }
  function sameSet(a,b){
    if(a.length!==b.length)return false;
    const left=[...a].map(clean).sort(),right=[...b].map(clean).sort();
    return left.every((v,i)=>v===right[i]);
  }
  async function verifyAuthority(){
    const authority=authoritySnapshot();
    if(!authorityMetadataReady(authority)){
      authorityRuntime={status:authority.status==='ready'?'invalid':'blocked',family:null,error:authority.status==='ready'?'Authority metadata incomplete':null,verifiedAt:null};
      capability=null;schedule();return false;
    }
    if(authorityPromise)return authorityPromise;
    authorityRuntime={status:'verifying',family:null,error:null,verifiedAt:null};capability=null;schedule();
    authorityPromise=(async()=>{
      if(typeof window.FontFace!=='function'||!document.fonts)throw new Error('FontFace API unavailable');
      if(alphabet.length!==33)throw new Error('Alphabet dataset must contain exactly 33 letters before authority verification');
      const [fontBytes,licenseBytes,coverageBytes]=await Promise.all([
        fetchBytes(authority.asset),fetchBytes(authority.license),fetchBytes(authority.coverageManifest)
      ]);
      const [fontHash,licenseHash,coverageHash]=await Promise.all([
        sha256Hex(fontBytes),sha256Hex(licenseBytes),sha256Hex(coverageBytes)
      ]);
      if(fontHash!==authority.assetSha256.toLowerCase())throw new Error('Bundled font SHA-256 mismatch');
      if(licenseHash!==authority.licenseSha256.toLowerCase())throw new Error('Bundled license SHA-256 mismatch');
      if(coverageHash!==authority.coverageSha256.toLowerCase())throw new Error('Coverage manifest SHA-256 mismatch');
      let coverage;
      try{coverage=JSON.parse(new TextDecoder().decode(coverageBytes));}catch(_){throw new Error('Coverage manifest is invalid JSON');}
      const alphabetIds=alphabet.map(x=>clean(x.id));
      if(coverage?.schema!=='RUSSIAN_HANDWRITING_GLYPH_COVERAGE_V1')throw new Error('Coverage schema mismatch');
      if(!Array.isArray(coverage.alphabetIds)||coverage.alphabetIds.length!==33||!sameSet(coverage.alphabetIds,alphabetIds))throw new Error('Coverage does not match all 33 alphabet IDs');
      if(!Array.isArray(coverage.fontFamilies)||!sameSet(coverage.fontFamilies,authority.trustedFamilies))throw new Error('Coverage font families do not match authority');
      let verifiedFamily='';
      for(const family of authority.trustedFamilies){
        const face=new FontFace(family,fontBytes.slice(0));
        const loaded=await face.load();
        document.fonts.add(loaded);
        if(document.fonts.check('64px "'+family+'"',PROBE)&&supportsCyrillicScriptFont(family)){verifiedFamily=family;break;}
      }
      if(!verifiedFamily)throw new Error('Bundled Cyrillic handwriting font failed runtime probe');
      authorityRuntime={status:'verified',family:verifiedFamily,error:null,verifiedAt:new Date().toISOString()};
      return true;
    })().catch(error=>{
      authorityRuntime={status:'failed',family:null,error:clean(error?.message||error),verifiedAt:null};
      return false;
    }).finally(()=>{authorityPromise=null;capability=null;schedule();});
    return authorityPromise;
  }
  function detect(){
    const authority=authoritySnapshot();
    const previewFont=PREVIEW_CANDIDATES.find(supportsCyrillicScriptFont)||'';
    const metadataReady=authorityMetadataReady(authority);
    const verifiedFamily=authorityRuntime.status==='verified'?clean(authorityRuntime.family):'';
    const trusted=metadataReady&&!!verifiedFamily&&authority.trustedFamilies.includes(verifiedFamily)&&supportsCyrillicScriptFont(verifiedFamily);
    const font=trusted?verifiedFamily:previewFont;
    const available=!!font;
    const mode=trusted?'approved-handwriting-authority'
      :metadataReady&&authorityRuntime.status==='verifying'?'authority-verifying'
      :metadataReady&&authorityRuntime.status==='failed'?'authority-invalid'
      :available?'local-script-preview':'reference-only';
    const reason=trusted
      ?'Bundled font, license và coverage 33 chữ đã được xác minh SHA-256 tại runtime; bài nhận diện có thể chấm.'
      :mode==='authority-verifying'
        ?'Đang xác minh bundled handwriting authority trước khi mở chấm nhận diện.'
        :mode==='authority-invalid'
          ?'Handwriting authority không qua xác minh runtime; hệ thống khóa chấm và chỉ giữ chế độ tham khảo.'
          :available
            ?'Thiết bị có font script cục bộ nhưng chưa có bundled authority đã xác minh. Font này chỉ dùng làm preview, không chấm đúng/sai.'
            :'Không có handwriting authority đã xác minh. Chỉ dùng khung nét tham khảo; không chấm nhận diện.';
    return {schema:SCHEMA,available,canScore:trusted,font:font||null,mode,reason,authority:{...authority,trusted,runtimeStatus:authorityRuntime.status,runtimeVerifiedAt:authorityRuntime.verifiedAt,runtimeError:authorityRuntime.error}};
  }

  const REVIEW_DELAY_MS=10*60*1000;
  function emptyState(){return {schema:SCHEMA,attempts:0,correct:0,questionIndex:0,lastAnswerId:'',lastCorrect:null,lastLetterId:'',weak:{},profiles:{},updatedAt:null};}
  function normalizeProfile(value={}){
    return {
      attempts:Number(value.attempts||0),
      correct:Number(value.correct||0),
      wrong:Number(value.wrong||0),
      correctStreak:Number(value.correctStreak||0),
      lastCorrect:value.lastCorrect===true?true:value.lastCorrect===false?false:null,
      lastAt:value.lastAt||null,
      dueAt:value.dueAt||null,
      resolvedAt:value.resolvedAt||null
    };
  }
  function readState(){
    try{
      const x=JSON.parse(localStorage.getItem(STORE_KEY)||'{}');
      const weak=x&&typeof x.weak==='object'?x.weak:{};
      const profiles={};
      if(x&&typeof x.profiles==='object')for(const [id,value] of Object.entries(x.profiles))profiles[id]=normalizeProfile(value);
      for(const [id,count] of Object.entries(weak)){
        if(profiles[id]||Number(count||0)<=0)continue;
        profiles[id]=normalizeProfile({attempts:Number(count||0),wrong:Number(count||0),lastCorrect:false,lastAt:x?.updatedAt||null,dueAt:x?.updatedAt||'1970-01-01T00:00:00.000Z'});
      }
      return {...emptyState(),...x,weak,profiles};
    }catch(_){return emptyState();}
  }
  function writeState(s){s.updatedAt=new Date().toISOString();try{localStorage.setItem(STORE_KEY,JSON.stringify(s));}catch(_){}return s;}
  function openWeakIds(state){
    return Object.entries(state?.profiles||{}).filter(([,p])=>Number(p?.wrong||0)>0&&!p?.resolvedAt).map(([id])=>id);
  }
  function dueWeakIds(state,at=Date.now()){
    return openWeakIds(state).filter(id=>{
      const due=state.profiles[id]?.dueAt;
      return !due||!Number.isFinite(Date.parse(due))||Date.parse(due)<=at;
    }).sort((a,b)=>{
      const pa=state.profiles[a],pb=state.profiles[b];
      const debtA=Number(pa?.wrong||0)-Number(pa?.correct||0);
      const debtB=Number(pb?.wrong||0)-Number(pb?.correct||0);
      if(debtA!==debtB)return debtB-debtA;
      return Date.parse(pa?.lastAt||0)-Date.parse(pb?.lastAt||0);
    });
  }
  function nextReviewAt(state){
    const times=openWeakIds(state).map(id=>Date.parse(state.profiles[id]?.dueAt||'')).filter(Number.isFinite);
    return times.length?new Date(Math.min(...times)).toISOString():null;
  }

  let capability=null,alphabet=[],renderQueued=false,reviewTimer=null;
  function getCapability(){if(!capability)capability=detect();return {...capability};}
  function currentQuestion(state=readState()){
    if(!alphabet.length)return null;
    const dueId=dueWeakIds(state)[0];
    const dueIndex=dueId?alphabet.findIndex(x=>clean(x.id)===clean(dueId)):-1;
    const i=dueIndex>=0?dueIndex:Math.max(0,Number(state.questionIndex)||0)%alphabet.length;
    return {item:alphabet[i],index:i,source:dueIndex>=0?'review_due':'sequence'};
  }
  function choiceIndexes(index,attempts){
    if(!alphabet.length)return [];
    const base=[index,(index+7)%alphabet.length,(index+14)%alphabet.length,(index+21)%alphabet.length];
    const unique=[...new Set(base)];
    const shift=Math.max(0,Number(attempts)||0)%Math.max(1,unique.length);
    return unique.slice(shift).concat(unique.slice(0,shift));
  }
  function bannerHtml(cap){
    const state=cap.canScore?'Sẵn sàng nhận diện':cap.mode==='authority-verifying'?'Đang xác minh authority':cap.mode==='authority-invalid'?'Authority không hợp lệ':'Chế độ tham khảo';
    const cls=cap.canScore?'ready':'reference';
    const small=cap.canScore
      ?('Authority: '+clean(cap.font)+' · '+clean(cap.authority?.asset||'asset chưa rõ'))
      :cap.font
        ?('Font preview cục bộ: '+clean(cap.font)+' · không dùng để chấm')
        :'Không chấm đúng/sai theo hình chữ tay trên thiết bị này.';
    return '<section class="ru-handwriting-capability '+cls+'" data-ru-handwriting-capability="'+esc(cap.mode)+'"><div><span>HANDWRITING AUTHORITY</span><b>'+esc(state)+'</b><p>'+esc(cap.reason)+'</p></div><small>'+esc(small)+'</small></section>';
  }
  function drillHtml(cap,state){
    if(!cap.canScore)return '<section class="ru-handwriting-recognition disabled" data-ru-recognition-state="disabled"><div><span>NHẬN DIỆN CHỮ TAY</span><b>Chưa chấm trên thiết bị này</b><p>Tiếp tục nhìn chữ in, khung nét tham khảo và luyện viết. Bài chọn đúng/sai chỉ mở sau khi bundled font, license và coverage 33 chữ đều qua xác minh authority.</p></div></section>';
    const q=currentQuestion(state);
    if(!q)return '<section class="ru-handwriting-recognition disabled" data-ru-recognition-state="loading"><b>Đang nạp bảng chữ cái…</b></section>';
    const choices=choiceIndexes(q.index,state.attempts).map(i=>{const x=alphabet[i];return '<button type="button" data-ru-handwriting-choice="'+esc(x.id)+'" lang="ru"><span>'+esc(x.cursive||x.text||x.print||'')+'</span></button>';}).join('');
    const score=state.attempts?Math.round((Number(state.correct||0)/Number(state.attempts||1))*100):0;
    const weakOpen=openWeakIds(state).length;
    const lastProfile=state.lastLetterId?normalizeProfile(state.profiles?.[state.lastLetterId]):null;
    let feedback='';
    if(state.lastCorrect===false)feedback='<em class="retry">Chưa đúng · thử lại cùng chữ</em>';
    else if(state.lastCorrect===true&&lastProfile?.wrong>0&&!lastProfile?.resolvedAt)feedback='<em class="scheduled">Đúng 1 lần · đã hẹn ôn lại để xác nhận lần 2</em>';
    else if(state.lastCorrect===true&&lastProfile?.resolvedAt)feedback='<em class="ok">Đúng ổn định · đã gỡ chữ này khỏi hàng ôn</em>';
    else if(state.lastCorrect===true)feedback='<em class="ok">Đúng · tiếp tục chữ kế tiếp</em>';
    const reviewTag=q.source==='review_due'?'<i class="ru-recognition-review-tag">Ôn chữ yếu</i>':'';
    return '<section class="ru-handwriting-recognition ready" data-ru-recognition-state="ready" data-ru-question-source="'+esc(q.source)+'"><header><div><span>NHẬN DIỆN CHỮ IN → CHỮ TAY</span><b>Chọn cùng một chữ '+reviewTag+'</b><p>Không dùng bản dịch nghĩa; chỉ đối chiếu hình dạng chữ Nga. Chữ từng sai cần 2 lần đúng liên tiếp qua lịch ôn mới được gỡ khỏi hàng ôn.</p></div><small>'+Number(state.correct||0)+'/'+Number(state.attempts||0)+' · '+score+'%'+(weakOpen?' · '+weakOpen+' chữ cần ôn':'')+'</small></header><div class="ru-handwriting-question"><strong lang="ru">'+esc(q.item.print||q.item.text||'')+'</strong><div class="ru-handwriting-choices">'+choices+'</div></div>'+feedback+'</section>';
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
    const lastProfile=state.lastLetterId?state.profiles?.[state.lastLetterId]:null;
    const drill=drillHtml(cap,state),drillSig=[cap.mode,state.attempts,state.correct,state.questionIndex,state.lastCorrect,state.lastLetterId,lastProfile?.correctStreak||0,lastProfile?.dueAt||'',lastProfile?.resolvedAt||'',openWeakIds(state).length,alphabet.length].join('|');
    let box=document.querySelector('.ru-handwriting-recognition');
    if(!box){banner?.insertAdjacentHTML('afterend',drill);box=document.querySelector('.ru-handwriting-recognition');if(box)box.dataset.renderSig=drillSig;}
    else if(box.dataset.renderSig!==drillSig){box.outerHTML=drill;box=document.querySelector('.ru-handwriting-recognition');if(box)box.dataset.renderSig=drillSig;}
    armReviewWake(state);
  }
  function armReviewWake(state){
    if(reviewTimer){clearTimeout(reviewTimer);reviewTimer=null;}
    const at=nextReviewAt(state),when=at?Date.parse(at):NaN,delay=when-Date.now();
    if(Number.isFinite(delay)&&delay>0)reviewTimer=setTimeout(()=>{reviewTimer=null;schedule();},Math.min(delay+75,2147483000));
  }
  function schedule(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render();});}
  async function loadAlphabet(){
    try{const data=await fetch('data/handwriting.json').then(r=>r.ok?r.json():[]);alphabet=Array.isArray(data)?data.map((x,sourceIndex)=>({...x,__sourceIndex:sourceIndex})).filter(x=>x&&x.mode==='alphabet'&&x.id):[];}catch(_){alphabet=[];}
    schedule();
  }
  function answer(id){
    const cap=getCapability();if(!cap.canScore||!alphabet.length)return false;
    const state=readState(),q=currentQuestion(state);if(!q)return false;
    const letterId=clean(q.item.id),correct=clean(id)===letterId,stamp=new Date().toISOString();
    const profile=normalizeProfile(state.profiles?.[letterId]);
    state.attempts=Number(state.attempts||0)+1;state.lastAnswerId=clean(id);state.lastCorrect=correct;state.lastLetterId=letterId;
    profile.attempts+=1;profile.lastCorrect=correct;profile.lastAt=stamp;
    if(correct){
      state.correct=Number(state.correct||0)+1;
      profile.correct+=1;profile.correctStreak+=1;
      if(profile.wrong>0&&profile.correctStreak>=2){
        profile.resolvedAt=stamp;profile.dueAt=null;delete state.weak[letterId];
      }else if(profile.wrong>0){
        profile.resolvedAt=null;profile.dueAt=new Date(Date.now()+REVIEW_DELAY_MS).toISOString();
      }else{
        profile.resolvedAt=null;profile.dueAt=null;
      }
      state.questionIndex=(q.index+1)%alphabet.length;
    }else{
      profile.wrong+=1;profile.correctStreak=0;profile.resolvedAt=null;profile.dueAt=stamp;
      state.weak[letterId]=Number(state.weak[letterId]||0)+1;
    }
    state.profiles[letterId]=profile;
    writeState(state);
    const route={view:'writing',handwritingIndex:Number(q.item.__sourceIndex??q.index)||0,handwritingStep:0};
    const reviewId='handwriting:'+letterId,label='Nhận diện chữ tay · '+clean(q.item.print||q.item.text||q.item.id);
    window.RussianLearningState?.setResume?.(route,'handwriting_recognition');
    if(correct&&profile.wrong>0&&profile.resolvedAt)window.RussianLearningState?.removeReview?.(reviewId);
    else if(profile.wrong>0)window.RussianLearningState?.addReview?.(reviewId,correct?'handwriting_recognition_confirm':'handwriting_recognition_miss',route,label,profile.dueAt||stamp);
    window.RussianLearningFlow?.touch?.('alphabet',{
      recognitionAttempts:state.attempts,
      recognitionCorrect:state.correct,
      recognitionLastLetterId:state.lastLetterId,
      recognitionLastCorrect:correct,
      recognitionAuthority:cap.mode,
      recognitionWeakOpen:openWeakIds(state).length,
      recognitionRecoveryStreak:profile.correctStreak,
      recognitionDueAt:profile.dueAt||'',
      recognitionQuestionSource:q.source
    });
    schedule();return correct;
  }

  document.addEventListener('click',event=>{const choice=event.target.closest?.('[data-ru-handwriting-choice]');if(choice){event.preventDefault();answer(choice.dataset.ruHandwritingChoice);}},true);
  document.addEventListener('DOMContentLoaded',()=>{capability=detect();schedule();loadAlphabet().then(()=>verifyAuthority());const view=document.getElementById('view');if(view)new MutationObserver(schedule).observe(view,{childList:true,subtree:true});});
  window.addEventListener('russian:learning-state',schedule);
  window.RussianHandwritingRecognition={schema:SCHEMA,detect,getCapability,canScore:()=>getCapability().canScore===true,getAuthorityVerification:()=>({...authorityRuntime}),verifyAuthority,getState:()=>JSON.parse(JSON.stringify(readState())),dueReviewIds:()=>dueWeakIds(readState()),nextReviewAt:()=>nextReviewAt(readState()),answer,refresh:()=>{capability=detect();verifyAuthority();schedule();return getCapability();}};
})();
