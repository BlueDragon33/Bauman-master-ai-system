'use strict';
(function(root){
  const SCHEMA='RUSSIAN_LISTEN_WRITE_LESSON_V1';
  const VERSION='RHW6_FACTORY_V1';
  const CONTENT_TYPES=Object.freeze(['letter','syllable','word','phrase','sentence','dictation']);
  const DRILL_KINDS=Object.freeze(['hear_select','hear_trace','hear_write','syllable_write','word_dictation','stress_mark','sound_spelling_discrimination']);
  const STAGES=Object.freeze(['vn','prep','hk1','hk2','hk3','hk4']);
  const LEVELS=Object.freeze(['A0','A1','A2','B1','B2','C1']);
  const LESSON_KEYS=new Set(['schema','id','lessonId','stage','level','title','items']);
  const ITEM_KEYS=new Set(['id','contentType','printSample','handwritingSample','drills']);
  const DRILL_KEYS=new Set(['kind','audioText','answer','choices','hint','stress']);

  const arr=v=>Array.isArray(v)?v:[];
  const str=v=>String(v??'');
  const esc=v=>str(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const unique=a=>new Set(a).size===a.length;
  const ownKeys=o=>o&&typeof o==='object'&&!Array.isArray(o)?Object.keys(o):[];
  function deepFreeze(value){
    if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
    Object.freeze(value);
    for(const key of Object.keys(value))deepFreeze(value[key]);
    return value;
  }
  function strictKeys(obj,allowed,path,errors){
    for(const key of ownKeys(obj))if(!allowed.has(key))errors.push(path+': unsupported field '+key);
  }
  function normalizeAnswer(value){
    return str(value).normalize('NFC').trim().toLocaleLowerCase('ru-RU').replace(/\s+/g,' ');
  }
  function validateDrill(drill,path,errors){
    if(!drill||typeof drill!=='object'||Array.isArray(drill)){errors.push(path+': drill must be object');return}
    strictKeys(drill,DRILL_KEYS,path,errors);
    if(!DRILL_KINDS.includes(drill.kind))errors.push(path+': unsupported drill kind');
    if(!str(drill.audioText).trim())errors.push(path+': audioText required');
    if(!str(drill.answer).trim())errors.push(path+': answer required');
    if(!Array.isArray(drill.choices))errors.push(path+': choices must be array');
    else{
      if(!drill.choices.every(x=>typeof x==='string'&&x.trim()))errors.push(path+': choices must be non-empty strings');
      if(!unique(drill.choices))errors.push(path+': choices must be unique');
    }
    if(!(drill.hint===null||typeof drill.hint==='string'))errors.push(path+': hint must be string|null');
    if(!(drill.stress===null||typeof drill.stress==='string'))errors.push(path+': stress must be string|null');

    const choiceKinds=['hear_select','stress_mark','sound_spelling_discrimination'];
    if(choiceKinds.includes(drill.kind)){
      if(!Array.isArray(drill.choices)||drill.choices.length<2)errors.push(path+': choice drill requires >=2 choices');
      else if(!drill.choices.some(x=>normalizeAnswer(x)===normalizeAnswer(drill.answer)))errors.push(path+': choices must contain answer');
    }
    if(drill.kind==='stress_mark'){
      if(!str(drill.stress).trim())errors.push(path+': stress_mark requires explicit stress');
      if(str(drill.stress).trim()&&normalizeAnswer(drill.stress)!==normalizeAnswer(drill.answer))errors.push(path+': stress must equal expected stressed answer');
      if(!/[\u0301]/u.test(str(drill.answer).normalize('NFD')))errors.push(path+': stress answer must encode stress');
    }
    if(drill.kind!=='stress_mark'&&drill.stress!==null)errors.push(path+': stress only allowed for stress_mark');
  }
  function validateItem(item,path,errors){
    if(!item||typeof item!=='object'||Array.isArray(item)){errors.push(path+': item must be object');return}
    strictKeys(item,ITEM_KEYS,path,errors);
    if(!/^LW_ITEM_[A-Z0-9_:-]+$/.test(str(item.id)))errors.push(path+': invalid item id');
    if(!CONTENT_TYPES.includes(item.contentType))errors.push(path+': unsupported contentType');
    if(!(item.printSample===undefined||item.printSample===null||typeof item.printSample==='string'))errors.push(path+': printSample must be string|null');
    if(!str(item.handwritingSample).trim())errors.push(path+': handwritingSample required');
    if(!Array.isArray(item.drills)||!item.drills.length)errors.push(path+': drills required');
    else item.drills.forEach((drill,i)=>validateDrill(drill,path+'.drills['+i+']',errors));
  }
  function validateLesson(lesson){
    const errors=[];
    if(!lesson||typeof lesson!=='object'||Array.isArray(lesson))return {ok:false,errors:['lesson must be object']};
    strictKeys(lesson,LESSON_KEYS,'lesson',errors);
    if(lesson.schema!==SCHEMA)errors.push('lesson: schema mismatch');
    if(!/^LW_[A-Z0-9_:-]+$/.test(str(lesson.id)))errors.push('lesson: invalid id');
    if(!str(lesson.lessonId).trim())errors.push('lesson: lessonId required');
    if(!STAGES.includes(lesson.stage))errors.push('lesson: invalid stage');
    if(!LEVELS.includes(lesson.level))errors.push('lesson: invalid level');
    if(!str(lesson.title).trim())errors.push('lesson: title required');
    if(!Array.isArray(lesson.items)||!lesson.items.length)errors.push('lesson: items required');
    else{
      lesson.items.forEach((item,i)=>validateItem(item,'lesson.items['+i+']',errors));
      const ids=lesson.items.map(x=>x?.id);
      if(!unique(ids))errors.push('lesson: duplicate item id');
    }
    return {ok:errors.length===0,errors};
  }
  function assertLesson(lesson){
    const result=validateLesson(lesson);
    if(!result.ok)throw new Error('ListenWriteLesson invalid: '+result.errors.join('; '));
    return lesson;
  }
  function modeKinds(mode){
    return ({
      learn:['hear_select','hear_trace','hear_write'],
      practice:['syllable_write','word_dictation','stress_mark','sound_spelling_discrimination'],
      dictation:['hear_write','syllable_write','word_dictation'],
      review:DRILL_KINDS
    })[mode]||DRILL_KINDS;
  }
  function drillsForItem(item,mode='learn'){
    const allowed=modeKinds(mode);
    const filtered=arr(item?.drills).filter(d=>allowed.includes(d.kind));
    return filtered.length?filtered:arr(item?.drills);
  }
  function playbackRequest(drill,{slow=false}={}){
    if(!drill||!str(drill.audioText).trim())throw new Error('ListenWrite playback requires audioText');
    return deepFreeze({text:str(drill.audioText),lang:'ru-RU',rate:slow?0.62:0.85});
  }
  function play(drill,speaker,{slow=false}={}){
    if(typeof speaker!=='function')throw new Error('ListenWrite speaker adapter required');
    const request=playbackRequest(drill,{slow});
    return speaker(request.text,request.rate,{lang:request.lang,slow});
  }
  function score(drill,response){
    if(!drill)throw new Error('ListenWrite score requires drill');
    if(drill.kind==='hear_trace')return deepFreeze({gradable:false,correct:null,expected:str(drill.answer),response:str(response)});
    const normalizedResponse=normalizeAnswer(response);
    const normalizedExpected=normalizeAnswer(drill.answer);
    if(!normalizedResponse)return deepFreeze({gradable:true,correct:false,empty:true,expected:str(drill.answer),response:str(response)});
    return deepFreeze({gradable:true,correct:normalizedResponse===normalizedExpected,empty:false,expected:str(drill.answer),response:str(response)});
  }
  function exerciseModel(lesson,itemIndex=0,drillIndex=0,sessionMode='learn'){
    assertLesson(lesson);
    const item=lesson.items[Math.max(0,Math.min(Number(itemIndex)||0,lesson.items.length-1))];
    const drills=drillsForItem(item,sessionMode);
    const index=Math.max(0,Math.min(Number(drillIndex)||0,Math.max(0,drills.length-1)));
    const drill=drills[index];
    return deepFreeze({
      schema:'RUSSIAN_LISTEN_WRITE_EXERCISE_MODEL_V1',
      lessonId:lesson.lessonId,
      lessonRef:lesson.id,
      stage:lesson.stage,
      level:lesson.level,
      itemId:item.id,
      contentType:item.contentType,
      printSample:item.printSample??null,
      handwritingSample:item.handwritingSample,
      sessionMode,
      drillIndex:index,
      drillCount:drills.length,
      drill
    });
  }
  function renderExercise(model,state={}){
    if(!model||model.schema!=='RUSSIAN_LISTEN_WRITE_EXERCISE_MODEL_V1')throw new Error('ListenWrite exercise model required');
    const drill=model.drill||{};
    const attempted=state.attempted===true;
    const choice=state.choice??'';
    const input=state.input??'';
    const result=state.result??null;
    const choiceMode=arr(drill.choices).length>0;
    const status=result==='correct'?'✓ Đúng':result==='wrong'?'✕ Chưa đúng':result==='self'?'Đã viết · đối chiếu mẫu':'';
    return '<section class="listen-write-factory-exercise" data-lw-kind="'+esc(drill.kind)+'" data-lw-item="'+esc(model.itemId)+'">'+
      '<header><span>'+esc(model.contentType)+' · '+esc(model.sessionMode)+'</span><strong>'+esc(model.handwritingSample)+'</strong></header>'+
      '<div class="listen-write-factory-audio"><button type="button" data-lw-act="play">🔊 Nghe</button><button type="button" data-lw-act="play-slow">🐢 Chậm</button></div>'+
      (choiceMode?'<div class="listen-write-factory-choices">'+arr(drill.choices).map(v=>'<button type="button" data-lw-choice="'+esc(v)+'" class="'+(choice===v?'active':'')+'">'+esc(v)+'</button>').join('')+'</div>':drill.kind==='hear_trace'?'':'<input data-lw-input="1" lang="ru" value="'+esc(input)+'" autocomplete="off" spellcheck="false">')+
      '<button type="button" data-lw-act="check">'+(drill.kind==='hear_trace'?'Đã viết xong → xem đáp án':'Kiểm tra')+'</button>'+
      (attempted?'<div class="listen-write-factory-feedback '+esc(result||'')+'"><b>'+esc(status)+'</b><span>Đáp án: <strong lang="ru">'+esc(drill.answer)+'</strong></span></div>':'<div class="listen-write-factory-hidden">Đáp án được khóa đến sau lần làm đầu tiên.</div>')+
      '</section>';
  }

  root.RussianListenWriteFactory=deepFreeze({
    schema:SCHEMA,
    version:VERSION,
    contentTypes:CONTENT_TYPES,
    drillKinds:DRILL_KINDS,
    normalizeAnswer,
    validateLesson,
    assertLesson,
    drillsForItem,
    playbackRequest,
    play,
    score,
    exerciseModel,
    renderExercise
  });
})(typeof window!=='undefined'?window:globalThis);
