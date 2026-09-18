'use strict';
(function(root){
  const SCHEMA='RUSSIAN_SKILL_GATED_ASSESSMENT_V1';
  const REQUIRED=['listening','speaking','print_recognition','cursive_recognition','reading','writing'];
  const LABELS={
    listening:'Nghe',
    speaking:'Nói',
    print_recognition:'Nhận diện chữ in',
    cursive_recognition:'Nhận diện chữ viết tay',
    reading:'Đọc',
    writing:'Viết'
  };
  const KEYS={
    core:(root.SUBJECT_ADAPTER&&root.SUBJECT_ADAPTER.storageKey)||'bauman_russian_survival_master_v11_clean_skeleton',
    listening:'bauman_russian_listening_ladder_v1',
    speaking:'bauman_russian_speaking_coach_v1',
    cyrillic:'bauman_russian_cyrillic_literacy_v1',
    reading:'bauman_russian_reading_bridge_v1',
    writing:'bauman_russian_dictation_v1'
  };
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch{return fallback}};
  const num=v=>Math.max(0,Number(v)||0);
  const values=v=>v&&typeof v==='object'?Object.values(v):[];
  const ratio=(a,b)=>b>0?a/b:0;
  const pct=v=>Math.round(Math.max(0,Math.min(1,Number(v)||0))*100);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const sum=(rows,key)=>rows.reduce((total,row)=>total+num(row?.[key]),0);

  function skillResult(skill,meetsGate,evidence,criterion){
    const started=Object.values(evidence||{}).some(v=>typeof v==='number'&&v>0);
    return {
      skill,
      label:LABELS[skill],
      status:meetsGate?'meets_gate':started?'in_progress':'not_started',
      meetsGate:Boolean(meetsGate),
      evidence,
      criterion
    };
  }

  function evaluate(source={}){
    const listeningRows=values(source.listening?.lines);
    const listeningAssessed=listeningRows.filter(row=>num(row?.detailAttempts)>0);
    const listeningQualified=listeningRows.filter(row=>num(row?.gistChecks)>0&&num(row?.detailAttempts)>0);
    const listeningAttempts=sum(listeningAssessed,'detailAttempts');
    const listeningCorrect=sum(listeningAssessed,'detailCorrect');
    const listeningAccuracy=ratio(listeningCorrect,listeningAttempts);

    const speakingRows=values(source.speaking?.lines);
    const speakingRecorder=speakingRows.filter(row=>num(row?.memoryAttempts)+num(row?.roleplayAttempts)>0);
    const speakingQualified=speakingRecorder.filter(row=>num(row?.selfOk)>0);

    const cyr=source.cyrillic||{};
    const printSeen=Object.keys(cyr.seen||{}).length;
    const printAttempts=num(cyr.attempts);
    const printCorrect=num(cyr.correct);
    const printScore=ratio(printCorrect,printAttempts);
    const cursiveSeen=Object.keys(cyr.cursiveSeen||{}).length;
    const cursiveAttempts=num(cyr.cursiveAttempts);
    const cursiveCorrect=num(cyr.cursiveCorrect);
    const cursiveScore=ratio(cursiveCorrect,cursiveAttempts);

    const readingRows=values(source.reading?.items);
    const readingAttempted=readingRows.filter(row=>num(row?.attempts)>0);
    const readingQualified=readingAttempted.filter(row=>num(row?.audioChecks)>0);

    const writingEntries=Object.entries(source.writing?.items||{}).filter(([key])=>/^(sound_to_letter|sound_to_word|short_dictation):/.test(key));
    const writingAttempted=writingEntries.filter(([,row])=>num(row?.attempts)>0);
    const writingAttempts=writingAttempted.reduce((total,[,row])=>total+num(row?.attempts),0);
    const writingCorrect=writingAttempted.reduce((total,[,row])=>total+num(row?.correct),0);
    const writingAccuracy=ratio(writingCorrect,writingAttempts);
    const shortDictationItems=writingAttempted.filter(([key])=>key.startsWith('short_dictation:')).length;

    const skills={
      listening:skillResult(
        'listening',
        listeningQualified.length>=5&&listeningAccuracy>=0.8,
        {qualifiedItems:listeningQualified.length,assessedItems:listeningAssessed.length,attempts:listeningAttempts,accuracy:listeningAccuracy},
        '≥5 mục có gist + kiểm chi tiết, độ chính xác chi tiết ≥80%'
      ),
      speaking:skillResult(
        'speaking',
        speakingQualified.length>=5,
        {qualifiedItems:speakingQualified.length,recorderItems:speakingRecorder.length,selfOkItems:speakingQualified.length},
        '≥5 câu có ghi âm ở memory/role-play và xác nhận tự nghe lại ổn'
      ),
      print_recognition:skillResult(
        'print_recognition',
        printSeen===33&&printScore>=0.8,
        {seenLetters:printSeen,attempts:printAttempts,accuracy:printScore},
        'Đủ 33 chữ in và độ chính xác ≥80%'
      ),
      cursive_recognition:skillResult(
        'cursive_recognition',
        cursiveSeen===33&&cursiveScore>=0.8,
        {seenLetters:cursiveSeen,attempts:cursiveAttempts,accuracy:cursiveScore},
        'Đủ 33 chữ viết tay và độ chính xác ≥80%'
      ),
      reading:skillResult(
        'reading',
        readingQualified.length>=8,
        {qualifiedItems:readingQualified.length,attemptedItems:readingAttempted.length},
        '≥8 mục đã tự đọc trước và đối chiếu audio sau'
      ),
      writing:skillResult(
        'writing',
        writingAttempted.length>=8&&shortDictationItems>=2&&writingAccuracy>=0.8,
        {qualifiedItems:writingAttempted.length,shortDictationItems,attempts:writingAttempts,accuracy:writingAccuracy},
        '≥8 mục viết, gồm ≥2 câu dictation ngắn, độ chính xác ≥80%'
      )
    };
    const aggregateReady=REQUIRED.every(skill=>skills[skill].meetsGate===true);
    const blockers=REQUIRED.filter(skill=>!skills[skill].meetsGate);
    return {
      schema:SCHEMA,
      skills,
      aggregate:{
        ready:aggregateReady,
        status:aggregateReady?'ready':'blocked',
        blockers,
        crossSkillInference:false,
        advisoryOnly:true
      }
    };
  }

  function readSources(){
    return {
      listening:parse(localStorage.getItem(KEYS.listening),{}),
      speaking:parse(localStorage.getItem(KEYS.speaking),{}),
      cyrillic:parse(localStorage.getItem(KEYS.cyrillic),{}),
      reading:parse(localStorage.getItem(KEYS.reading),{}),
      writing:parse(localStorage.getItem(KEYS.writing),{})
    };
  }

  function snapshot(){return evaluate(readSources())}
  function coreState(){return parse(localStorage.getItem(KEYS.core),{})}

  function metricText(skill,row){
    const e=row.evidence||{};
    if(skill==='listening')return e.qualifiedItems+' mục · '+pct(e.accuracy)+'% chi tiết';
    if(skill==='speaking')return e.qualifiedItems+' câu recorder + tự kiểm';
    if(skill==='print_recognition'||skill==='cursive_recognition')return e.seenLetters+'/33 chữ · '+pct(e.accuracy)+'%';
    if(skill==='reading')return e.qualifiedItems+' mục đọc + audio';
    if(skill==='writing')return e.qualifiedItems+' mục · '+e.shortDictationItems+' câu ngắn · '+pct(e.accuracy)+'%';
    return '';
  }

  function html(report){
    const cards=REQUIRED.map(skill=>{
      const row=report.skills[skill];
      return '<article class="ru-skill-gate-card '+(row.meetsGate?'ready':'blocked')+'">'+
        '<div><span>'+(row.meetsGate?'✓':'○')+'</span><b>'+esc(row.label)+'</b></div>'+
        '<strong>'+esc(metricText(skill,row))+'</strong>'+
        '<small>'+esc(row.criterion)+'</small>'+
      '</article>';
    }).join('');
    const blockers=report.aggregate.blockers.map(skill=>LABELS[skill]).join(' · ');
    return '<section id="ruSkillGate" class="ru-skill-gate" data-skill-gated-assessment="1">'+
      '<header><div><span>SKILL-GATED ASSESSMENT · TURN 19</span><h3>Đủ bằng chứng theo từng kỹ năng trước khi tổng hợp</h3><p>Mỗi kỹ năng được xét riêng. Kết quả này chỉ là readiness advisory, không phải mastery và không thay đổi lịch ôn.</p></div>'+
      '<div class="ru-skill-gate-total '+(report.aggregate.ready?'ready':'blocked')+'"><b>'+(report.aggregate.ready?'READY':'CHƯA READY')+'</b><small>'+REQUIRED.filter(skill=>report.skills[skill].meetsGate).length+'/6 gate</small></div></header>'+
      '<div class="ru-skill-gate-grid">'+cards+'</div>'+
      '<footer><span>'+(report.aggregate.ready?'Đã đủ evidence ở cả 6 kỹ năng.':'Còn chặn: '+esc(blockers||'chưa có evidence'))+'</span><span>Không suy diễn chéo kỹ năng · không đổi mastery/completion</span></footer>'+
    '</section>';
  }

  let queued=false;
  let lastSignature='';
  function render(){
    const core=coreState();
    const active=(core.view||'')==='learning'&&['review','exam'].includes(core.learnTab);
    const existing=document.getElementById('ruSkillGate');
    if(!active){if(existing)existing.remove();lastSignature='';return;}
    const report=snapshot();
    const signature=JSON.stringify(report);
    if(existing&&signature===lastSignature)return;
    lastSignature=signature;
    const markup=html(report);
    if(existing){existing.outerHTML=markup;return;}
    const host=document.querySelector('.assessment-single-main')||document.getElementById('view');
    if(host)host.insertAdjacentHTML('afterbegin',markup);
  }
  function schedule(){
    if(queued)return;
    queued=true;
    const run=()=>{queued=false;render();};
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(run);else setTimeout(run,0);
  }

  document.addEventListener('DOMContentLoaded',()=>{
    schedule();
    const view=document.getElementById('view');
    if(view&&typeof MutationObserver==='function')new MutationObserver(schedule).observe(view,{childList:true,subtree:true});
  });
  root.addEventListener?.('storage',schedule);
  root.addEventListener?.('russian:multimodal-review',schedule);
  root.addEventListener?.('russian:learning-state',schedule);

  root.RussianSkillGatedAssessment=Object.freeze({
    schema:SCHEMA,
    requiredSkills:Object.freeze([...REQUIRED]),
    evaluate,
    snapshot,
    render
  });
})(window);
