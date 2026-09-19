'use strict';
(function(root){
  const SCHEMA='RUSSIAN_WEAKNESS_REPAIR_ROUTER_V1';
  const STORAGE_KEY='bauman_russian_weakness_repair_v1';
  const CORE_KEY=(root.SUBJECT_ADAPTER&&root.SUBJECT_ADAPTER.storageKey)||'bauman_russian_survival_master_v11_clean_skeleton';
  const KEYS={
    listening:'bauman_russian_listening_ladder_v1',
    speaking:'bauman_russian_speaking_coach_v1',
    cyrillic:'bauman_russian_cyrillic_literacy_v1',
    dictation:'bauman_russian_dictation_v1',
    multimodal:'bauman_russian_multimodal_review_v1'
  };
  const SOURCE_LABELS={
    exam_wrong:'Câu sai kiểm tra',
    listening_detail:'Nghe chi tiết',
    speaking_pronunciation:'Phát âm',
    speaking_abandoned:'Lượt nói bỏ dở',
    deep_speaking:'Nói sâu',
    cyrillic_print:'Nhận diện chữ in',
    cyrillic_cursive:'Nhận diện chữ viết tay',
    cyrillic_sound:'Âm ↔ chữ',
    dictation:'Nghe → viết',
    multimodal_review:'Ôn đa phương thức',
    skill_gate:'Gate kỹ năng'
  };
  const SKILL_LABELS={
    listening:'Nghe',
    speaking:'Nói',
    print_recognition:'Chữ in',
    cursive_recognition:'Chữ viết tay',
    reading:'Đọc',
    writing:'Viết'
  };
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch{return fallback}};
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const now=()=>Date.now();
  const num=v=>Math.max(0,Number(v)||0);
  const ts=v=>{
    if(typeof v==='number'&&Number.isFinite(v))return v;
    const n=Date.parse(String(v||''));return Number.isFinite(n)?n:0;
  };
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const empty=()=>({schema:SCHEMA,items:{},updatedAt:null});
  let state={...empty(),...parse(localStorage.getItem(STORAGE_KEY),{})};
  if(!state.items||typeof state.items!=='object')state.items={};

  function save(){
    state.updatedAt=new Date().toISOString();
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}
    root.dispatchEvent?.(new CustomEvent('russian:repair-state',{detail:{schema:SCHEMA}}));
  }

  function readSources(){
    return {
      core:parse(localStorage.getItem(CORE_KEY),{}),
      listening:parse(localStorage.getItem(KEYS.listening),{}),
      speaking:parse(localStorage.getItem(KEYS.speaking),{}),
      cyrillic:parse(localStorage.getItem(KEYS.cyrillic),{}),
      dictation:parse(localStorage.getItem(KEYS.dictation),{}),
      multimodal:parse(localStorage.getItem(KEYS.multimodal),{}),
      skillGate:root.RussianSkillGatedAssessment?.snapshot?.()||null
    };
  }

  function routeForSkill(skill){
    if(skill==='listening'||skill==='speaking')return {view:'learning',learnTab:'practice'};
    if(skill==='print_recognition'||skill==='cursive_recognition')return {view:'writing',writingMode:'handwriting'};
    if(skill==='reading')return {view:'writing',writingMode:'handwriting',repairTarget:{kind:'reading',stage:'word_to_short_text'}};
    if(skill==='writing')return {view:'writing',writingMode:'handwriting',repairTarget:{kind:'dictation-stage',stage:'short_dictation'}};
    return {view:'learning',learnTab:'review'};
  }

  function signal(id,source,detectedAt,label,route,target={},advisory=false){
    return {id,source,detectedAt:num(detectedAt)||now(),label,route,target,advisory:Boolean(advisory)};
  }

  function latestDictationKey(d){
    const stage=String(d?.stage||'');
    const rows=Object.entries(d?.items||{}).filter(([key])=>key.startsWith(stage+':'));
    rows.sort((a,b)=>ts(b[1]?.lastAt)-ts(a[1]?.lastAt));
    return rows[0]?.[0]||'';
  }

  function deriveSignals(sources=readSources()){
    const out=[];
    const core=sources.core||{};

    Object.entries(core.reviewProgress?.wrong||{}).forEach(([key,row])=>{
      const wrongAt=ts(row?.at);
      const doneAt=ts(core.reviewProgress?.done?.[key]?.at);
      if(wrongAt>0&&wrongAt>=doneAt){
        out.push(signal(
          'exam:'+key,'exam_wrong',wrongAt,
          'Ôn lại câu sai'+(row?.skill?' · '+row.skill:''),
          {view:'learning',learnTab:'review',reviewFilter:'wrong',reviewLesson:row?.lessonId||'all'},
          {reviewKey:key}
        ));
      }
    });

    Object.entries(sources.listening?.lines||{}).forEach(([key,row])=>{
      const last=row?.lastDetail;
      if(last&&last.ok===false&&ts(last.at)>0){
        const split=key.lastIndexOf('__');
        const dialogue=split>=0?key.slice(0,split):key;
        const line=split>=0?num(key.slice(split+2)):0;
        out.push(signal(
          'listen:'+key,'listening_detail',ts(last.at),
          'Nghe lại chi tiết · '+dialogue+' · câu '+(line+1),
          {view:'learning',learnTab:'practice',practiceDialogueId:dialogue,practiceLineIndex:line},
          {lineKey:key}
        ));
      }
    });

    Object.entries(sources.speaking?.lines||{}).forEach(([key,row])=>{
      const flagAt=ts(row?.lastFlagAt);
      const selfOkAt=ts(row?.lastSelfOkAt);
      if(flagAt>0&&flagAt>selfOkAt){
        out.push(signal(
          'pron:'+key,'speaking_pronunciation',flagAt,
          'Sửa phát âm · '+(row?.lessonId||'')+' · câu '+(num(row?.lineIndex)+1),
          {view:'learning',learnTab:'practice',lessonId:row?.lessonId||'',practiceDialogueId:row?.dialogueId||'',practiceLineIndex:num(row?.lineIndex)},
          {lineKey:key,kind:'speaking_repair'}
        ));
      }
      const abandonedAt=ts(row?.lastAbandonedAt);
      const attemptAt=ts(row?.lastAt);
      if(abandonedAt>0&&abandonedAt>attemptAt){
        out.push(signal(
          'abandoned:'+key,'speaking_abandoned',abandonedAt,
          'Làm lại lượt nói bỏ dở · '+(row?.lessonId||'')+' · câu '+(num(row?.lineIndex)+1),
          {view:'learning',learnTab:'practice',lessonId:row?.lessonId||'',practiceDialogueId:row?.dialogueId||'',practiceLineIndex:num(row?.lineIndex)},
          {lineKey:key}
        ));
      }
    });

    Object.entries(core.deepSpeakingProgress?.weak||{}).forEach(([key,weakAtRaw])=>{
      const weakAt=ts(weakAtRaw),doneAt=ts(core.deepSpeakingProgress?.done?.[key]);
      if(weakAt>0&&weakAt>doneAt){
        out.push(signal(
          'deep:'+key,'deep_speaking',weakAt,
          'Sửa lượt nói sâu · '+key,
          {view:'dialogue',deepSpeakingId:key},
          {deepKey:key}
        ));
      }
    });

    const last=sources.cyrillic?.lastResult;
    if(last&&last.ok===false&&ts(last.at)>0){
      const source=last.section==='cursive'?'cyrillic_cursive':last.section==='sound'?'cyrillic_sound':'cyrillic_print';
      out.push(signal(
        'cyr:'+last.section+':'+last.letter,source,ts(last.at),
        'Sửa chữ '+last.letter+' · '+SOURCE_LABELS[source],
        {view:'writing',writingMode:'handwriting',repairTarget:{kind:'cyrillic',section:last.section,letter:last.letter}},
        {section:last.section,letter:last.letter}
      ));
    }

    const d=sources.dictation||{};
    if(d.feedback&&d.feedback.ok===false&&ts(d.feedback.at)>0){
      const key=latestDictationKey(d);
      if(key){
        out.push(signal(
          'dictation:'+key,'dictation',ts(d.feedback.at),
          'Sửa dictation · '+key,
          {view:'writing',writingMode:'handwriting',repairTarget:{kind:'dictation',stage:d.stage,key}},
          {stage:d.stage,key}
        ));
      }
    }

    Object.values(sources.multimodal?.cards||{}).forEach(card=>{
      Object.entries(card?.modalities||{}).forEach(([modality,row])=>{
        if(['forgot','unsure'].includes(row?.lastRating)&&ts(row?.lastAt)>0){
          out.push(signal(
            'mm:'+card.key+':'+modality,'multimodal_review',ts(row.lastAt),
            'Ôn lại '+modality+' · '+card.key,
            {view:'vocab',vocabIndex:num(card.index),repairTarget:{kind:'multimodal',modality}},
            {cardKey:card.key,modality,index:num(card.index)}
          ));
        }
      });
    });

    const gate=sources.skillGate;
    Object.entries(gate?.skills||{}).forEach(([skill,row])=>{
      if(row?.meetsGate===false){
        out.push(signal(
          'skill:'+skill,'skill_gate',now(),
          'Củng cố kỹ năng '+(SKILL_LABELS[skill]||skill),
          routeForSkill(skill),
          {skill},
          true
        ));
      }
    });

    return out;
  }

  function probe(item,sources=readSources()){
    const t=item.target||{};
    if(item.source==='exam_wrong'){
      return {doneAt:ts(sources.core?.reviewProgress?.done?.[t.reviewKey]?.at)};
    }
    if(item.source==='listening_detail'){
      const row=sources.listening?.lines?.[t.lineKey]||{};
      return {
        attempts:num(row.detailAttempts),
        correct:num(row.detailCorrect),
        lastDetailAt:ts(row.lastDetail?.at),
        lastDetailOk:row.lastDetail?.ok===true
      };
    }
    if(item.source==='speaking_pronunciation'){
      const row=sources.speaking?.lines?.[t.lineKey]||{};
      return {
        repairAttempts:num(row.repairAttempts),
        selfOk:num(row.selfOk),
        lastSelfOkAt:ts(row.lastSelfOkAt),
        lastAt:ts(row.lastAt)
      };
    }
    if(item.source==='speaking_abandoned'){
      const row=sources.speaking?.lines?.[t.lineKey]||{};
      return {
        attempts:num(row.imitationAttempts)+num(row.shadowAttempts)+num(row.memoryAttempts)+num(row.roleplayAttempts)+num(row.repairAttempts),
        lastAt:ts(row.lastAt)
      };
    }
    if(item.source==='deep_speaking'){
      return {doneAt:ts(sources.core?.deepSpeakingProgress?.done?.[t.deepKey])};
    }
    if(item.source.startsWith('cyrillic_')){
      const c=sources.cyrillic||{};
      const bucket=t.section==='cursive'?c.cursiveSeen:t.section==='sound'?c.soundSeen:c.seen;
      const row=bucket?.[t.letter]||{};
      return {attempts:num(row.attempts),correct:num(row.correct),lastAt:ts(row.lastAt)};
    }
    if(item.source==='dictation'){
      const row=sources.dictation?.items?.[t.key]||{};
      return {attempts:num(row.attempts),correct:num(row.correct),lastAt:ts(row.lastAt)};
    }
    if(item.source==='multimodal_review'){
      const row=sources.multimodal?.cards?.[t.cardKey]?.modalities?.[t.modality]||{};
      return {
        attempts:num(row.attempts),
        recalled:num(row.ratings?.recalled),
        lastRating:row.lastRating||'',
        lastAt:ts(row.lastAt)
      };
    }
    if(item.source==='skill_gate'){
      const row=sources.skillGate?.skills?.[t.skill];
      return {meetsGate:row?.meetsGate===true};
    }
    return {};
  }

  function progress(item,current){
    const b=item.baseline||{};
    const opened=num(item.openedAt);
    if(!opened)return {attempted:false,evidence:false,evidenceAt:0};

    if(item.source==='exam_wrong'){
      const evidence=current.doneAt>opened&&current.doneAt>num(item.detectedAt);
      return {attempted:evidence,evidence,evidenceAt:current.doneAt};
    }
    if(item.source==='listening_detail'){
      const attempted=current.attempts>num(b.attempts)&&current.lastDetailAt>opened;
      const evidence=attempted&&current.correct>num(b.correct)&&current.lastDetailOk===true;
      return {attempted,evidence,evidenceAt:current.lastDetailAt};
    }
    if(item.source==='speaking_pronunciation'){
      const attempted=current.repairAttempts>num(b.repairAttempts)&&current.lastAt>opened;
      const evidence=attempted&&current.selfOk>num(b.selfOk)&&current.lastSelfOkAt>opened;
      return {attempted,evidence,evidenceAt:Math.max(current.lastAt,current.lastSelfOkAt)};
    }
    if(item.source==='speaking_abandoned'){
      const attempted=current.attempts>num(b.attempts)&&current.lastAt>opened;
      return {attempted,evidence:attempted,evidenceAt:current.lastAt};
    }
    if(item.source==='deep_speaking'){
      const evidence=current.doneAt>opened&&current.doneAt>num(item.detectedAt);
      return {attempted:evidence,evidence,evidenceAt:current.doneAt};
    }
    if(item.source.startsWith('cyrillic_')||item.source==='dictation'){
      const attempted=current.attempts>num(b.attempts)&&current.lastAt>opened;
      const evidence=attempted&&current.correct>num(b.correct);
      return {attempted,evidence,evidenceAt:current.lastAt};
    }
    if(item.source==='multimodal_review'){
      const attempted=current.attempts>num(b.attempts)&&current.lastAt>opened;
      const evidence=attempted&&current.recalled>num(b.recalled)&&current.lastRating==='recalled';
      return {attempted,evidence,evidenceAt:current.lastAt};
    }
    if(item.source==='skill_gate'){
      return {attempted:false,evidence:current.meetsGate===true,evidenceAt:current.meetsGate?now():0};
    }
    return {attempted:false,evidence:false,evidenceAt:0};
  }

  function mergeSignal(sig){
    const old=state.items[sig.id]||null;
    if(!old){
      state.items[sig.id]={
        ...sig,
        status:'detected',
        openedAt:null,
        attemptedAt:null,
        repairEvidenceAt:null,
        resolvedAt:null,
        resolvedSourceAt:null,
        baseline:null,
        lastSeenAt:now()
      };
      return true;
    }
    const newer=num(sig.detectedAt)>num(old.resolvedSourceAt||old.detectedAt);
    if(old.resolvedAt&&newer&&!sig.advisory){
      state.items[sig.id]={
        ...sig,
        status:'detected',
        openedAt:null,
        attemptedAt:null,
        repairEvidenceAt:null,
        resolvedAt:null,
        resolvedSourceAt:null,
        baseline:null,
        lastSeenAt:now()
      };
      return true;
    }
    state.items[sig.id]={...old,...sig,lastSeenAt:now()};
    return false;
  }

  function refresh(persist=true){
    const sources=readSources();
    const signals=deriveSignals(sources);
    let changed=false;
    const activeSignalIds=new Set(signals.map(s=>s.id));
    signals.forEach(sig=>{if(mergeSignal(sig))changed=true;});

    Object.values(state.items).forEach(item=>{
      if(item.resolvedAt)return;
      const current=probe(item,sources);
      const p=progress(item,current);
      if(item.openedAt&&p.attempted&&!item.attemptedAt){item.attemptedAt=p.evidenceAt||now();item.status='attempted';changed=true;}
      if(item.openedAt&&p.evidence&&!item.repairEvidenceAt){
        item.repairEvidenceAt=p.evidenceAt||now();
        item.status='repair_evidence_present';
        changed=true;
      }
      if(item.openedAt&&p.evidence&&!item.advisory){
        item.resolvedAt=p.evidenceAt||now();
        item.resolvedSourceAt=Math.max(num(item.detectedAt),num(p.evidenceAt));
        item.status='resolved';
        changed=true;
      }
      if(item.advisory&&item.source==='skill_gate'&&!activeSignalIds.has(item.id)){
        item.repairEvidenceAt=now();
        item.resolvedAt=item.repairEvidenceAt;
        item.resolvedSourceAt=item.resolvedAt;
        item.status='resolved';
        changed=true;
      }
    });

    if(persist&&changed)save();
    return {
      schema:SCHEMA,
      items:clone(state.items),
      active:Object.values(state.items).filter(x=>!x.resolvedAt),
      resolved:Object.values(state.items).filter(x=>!!x.resolvedAt)
    };
  }

  function open(id){
    refresh(true);
    const item=state.items[id];
    if(!item||item.resolvedAt)return false;
    const sources=readSources();
    item.openedAt=now();
    item.attemptedAt=null;
    item.repairEvidenceAt=null;
    item.baseline=probe(item,sources);
    item.status='opened';
    save();
    root.dispatchEvent?.(new CustomEvent('russian:repair-route',{detail:{id:item.id,source:item.source,route:clone(item.route),target:clone(item.target)}}));
    return true;
  }

  function activeItems(){return refresh(false).active.sort((a,b)=>num(b.detectedAt)-num(a.detectedAt));}

  function statusLabel(item){
    return item.status==='opened'?'Đã mở sửa':item.status==='attempted'?'Đã thử sửa':item.status==='repair_evidence_present'?'Đã có evidence':item.status==='resolved'?'Đã xử lý':'Cần sửa';
  }

  function html(){
    const items=activeItems().slice(0,8);
    if(!items.length)return '';
    return '<section id="ruWeaknessRepair" class="ru-weakness-repair" data-weakness-repair="1">'+
      '<header><div><span>WEAKNESS REPAIR · TURN 21</span><h3>Vá đúng điểm yếu, không đánh dấu xong khi chỉ mới mở</h3><p>Mỗi thẻ đi tới đúng bài sửa lỗi. Chỉ evidence mới sau thời điểm mở mới được tính là xử lý.</p></div><b>'+items.length+' mục</b></header>'+
      '<div class="ru-repair-grid">'+items.map(item=>
        '<button class="ru-repair-card '+(item.advisory?'advisory':'')+'" data-repair-open="'+esc(item.id)+'">'+
          '<span>'+esc(SOURCE_LABELS[item.source]||item.source)+'</span>'+
          '<b>'+esc(item.label)+'</b>'+
          '<small>'+esc(statusLabel(item))+(item.advisory?' · gợi ý theo gate kỹ năng':' · cần evidence mới')+'</small>'+
        '</button>'
      ).join('')+'</div>'+
      '<footer><span>Repair store riêng</span><span>Không đổi mastery/completion · không đổi SRS/Review Queue</span></footer>'+
    '</section>';
  }

  let queued=false;
  function render(){
    const core=parse(localStorage.getItem(CORE_KEY),{});
    const visible=core.view==='overview'||(core.view==='learning'&&core.learnTab==='review');
    const existing=document.getElementById('ruWeaknessRepair');
    if(!visible){existing?.remove();return;}
    const markup=html();
    if(!markup){existing?.remove();return;}
    if(existing){existing.outerHTML=markup;return;}
    const host=document.getElementById('view');
    if(host)host.insertAdjacentHTML('afterbegin',markup);
  }
  function schedule(){
    if(queued)return;
    queued=true;
    const run=()=>{queued=false;refresh(true);render();};
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(run);else setTimeout(run,0);
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-repair-open]');
    if(!button)return;
    event.preventDefault();
    if(open(button.dataset.repairOpen))setTimeout(schedule,30);
  },true);

  document.addEventListener('DOMContentLoaded',()=>{
    schedule();
    const view=document.getElementById('view');
    if(view&&typeof MutationObserver==='function')new MutationObserver(schedule).observe(view,{childList:true,subtree:true});
  });

  root.addEventListener?.('russian:multimodal-review',schedule);
  root.addEventListener?.('russian:learning-state',schedule);
  root.addEventListener?.('russian:repair-source-changed',schedule);

  root.RussianWeaknessRepairRouter=Object.freeze({
    schema:SCHEMA,
    deriveSignals,
    probe,
    progress,
    refresh,
    get:()=>clone(state),
    active:activeItems,
    open,
    render
  });
})(window);
