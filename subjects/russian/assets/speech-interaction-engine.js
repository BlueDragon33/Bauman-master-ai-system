'use strict';
(function(){
  const SUPPORT=Object.freeze({SUPPORTED:'SUPPORTED',PARTIAL:'PARTIAL',UNSUPPORTED:'UNSUPPORTED',PERMISSION_BLOCKED:'PERMISSION_BLOCKED',RUNTIME_ERROR:'RUNTIME_ERROR'});
  const MIC=Object.freeze({UNKNOWN:'UNKNOWN',REQUESTING:'REQUESTING',GRANTED:'GRANTED',DENIED:'DENIED',UNAVAILABLE:'UNAVAILABLE',ERROR:'ERROR'});
  const clean=v=>String(v??'').trim();
  const copy=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null}};
  let recognition=null, recognitionTimer=0, recognitionState=SUPPORT.UNSUPPORTED;
  let mediaStream=null, recorder=null, recorderChunks=[], recorderTimer=0, recorderSession=null, lastRecording=null, micState=MIC.UNKNOWN;

  function RecognitionCtor(){return window.SpeechRecognition||window.webkitSpeechRecognition||null}
  function recognitionSupport(){
    const Ctor=RecognitionCtor();
    recognitionState=Ctor?SUPPORT.SUPPORTED:SUPPORT.UNSUPPORTED;
    return recognitionState;
  }
  function finishRecognition(current){
    if(current&&recognition!==current)return false;
    clearTimeout(recognitionTimer);recognitionTimer=0;
    recognition=null;return true;
  }
  function stopRecognition(){
    const current=recognition;
    if(!current)return false;
    try{current.stop();return true}catch(_){finishRecognition(current);return false}
  }
  function cancelRecognition(){
    const current=recognition;
    if(!current)return false;
    // Retire the old session before abort: browsers may dispatch synchronous
    // or delayed result/error/end events for an already-cancelled recognizer.
    finishRecognition(current);
    current.onresult=null;current.onerror=null;current.onend=null;
    try{current.abort?.()}catch(_){}
    return true;
  }
  function startRecognition(options={}){
    const Ctor=RecognitionCtor();
    if(!Ctor){recognitionState=SUPPORT.UNSUPPORTED;options.onUnsupported?.({support:recognitionState});return {started:false,support:recognitionState}}
    cancelRecognition();
    try{
      const rec=new Ctor();recognition=rec;recognitionState=SUPPORT.SUPPORTED;
      let lastFinalTranscript='';
      rec.lang=clean(options.lang)||'ru-RU';
      rec.interimResults=options.interim===true;
      rec.maxAlternatives=Math.max(1,Math.min(5,Number(options.maxAlternatives)||1));
      rec.continuous=options.continuous===true;
      rec.onresult=event=>{
        if(recognition!==rec)return;
        const results=Array.from(event?.results||[]);
        // Web Speech interim hypotheses are NOT a completed spoken answer.
        const finals=results.filter(row=>row?.isFinal===true&&clean(row?.[0]?.transcript));
        const finalText=finals.map(row=>clean(row[0].transcript)).join(' ').trim();
        if(finalText&&finalText!==lastFinalTranscript){
          lastFinalTranscript=finalText;
          const reported=finals.at(-1)?.[0]?.confidence;
          const rawConfidence=reported==null?null:Number(reported);
          options.onResult?.({
            transcript:finalText,final:true,support:recognitionState,
            rawConfidence:Number.isFinite(rawConfidence)&&rawConfidence>=0&&rawConfidence<=1?rawConfidence:null,
            pronunciationAuthority:false,stressAuthority:false
          });
          return;
        }
        if(rec.interimResults){
          const interim=results.filter(row=>row?.isFinal!==true).map(row=>clean(row?.[0]?.transcript)).filter(Boolean).join(' ');
          if(interim)options.onResult?.({
            transcript:[finalText,interim].filter(Boolean).join(' ').trim(),
            final:false,support:recognitionState,rawConfidence:null,
            pronunciationAuthority:false,stressAuthority:false
          });
        }
      };
      rec.onerror=event=>{
        if(recognition!==rec)return;
        const code=clean(event?.error)||'runtime-error';
        recognitionState=(code==='not-allowed'||code==='service-not-allowed')?SUPPORT.PERMISSION_BLOCKED:SUPPORT.RUNTIME_ERROR;
        options.onError?.({code,message:clean(event?.message),support:recognitionState});
      };
      rec.onend=()=>{if(finishRecognition(rec))options.onEnd?.({support:recognitionState})};
      rec.start();
      if(recognition===rec){
        const timeout=Math.max(3000,Math.min(120000,Number(options.timeoutMs)||30000));
        recognitionTimer=setTimeout(()=>{if(recognition===rec)try{rec.stop()}catch(_){finishRecognition(rec)}},timeout);
      }
      return {started:true,support:recognitionState};
    }catch(error){
      finishRecognition(recognition);recognitionState=SUPPORT.RUNTIME_ERROR;
      options.onError?.({code:'start-failed',message:clean(error?.message),support:recognitionState});
      return {started:false,support:recognitionState};
    }
  }

  function audioSupport(){return {tts:'speechSynthesis' in window&&typeof window.SpeechSynthesisUtterance!=='undefined',htmlAudio:typeof window.Audio==='function'}}
  function speak(text,options={}){
    const value=clean(text);if(!value)return {started:false,sourceType:'TTS',reason:'empty'};
    if(!audioSupport().tts){options.onUnavailable?.();return {started:false,sourceType:'TTS',reason:'unsupported'}}
    try{
      const u=new window.SpeechSynthesisUtterance(value);
      u.lang=clean(options.lang)||'ru-RU';u.rate=Math.max(.5,Math.min(1.5,Number(options.rate)||.85));
      if(options.onStart)u.onstart=options.onStart;if(options.onEnd)u.onend=options.onEnd;if(options.onError)u.onerror=options.onError;
      window.speechSynthesis.cancel();window.speechSynthesis.speak(u);
      return {started:true,sourceType:'TTS'};
    }catch(error){options.onError?.(error);return {started:false,sourceType:'TTS',reason:'runtime-error'}}
  }
  function playSource(src,options={}){
    const source=clean(src);if(!source||!audioSupport().htmlAudio)return {started:false,sourceType:options.sourceType||'UNKNOWN'};
    try{
      const player=new window.Audio(source);player.playbackRate=Math.max(.5,Math.min(2,Number(options.rate)||1));
      player.addEventListener('error',()=>options.onError?.(),{once:true});
      player.addEventListener('ended',()=>options.onEnd?.(),{once:true});
      const promise=player.play();promise?.catch?.(e=>options.onError?.(e));
      return {started:true,sourceType:options.sourceType||'UNKNOWN',player};
    }catch(error){options.onError?.(error);return {started:false,sourceType:options.sourceType||'UNKNOWN'}}
  }

  function recorderSupport(){
    if(!navigator?.mediaDevices?.getUserMedia||typeof window.MediaRecorder==='undefined')return SUPPORT.UNSUPPORTED;
    return SUPPORT.SUPPORTED;
  }
  function releaseStream(){for(const t of mediaStream?.getTracks?.()||[])try{t.stop()}catch(_){};mediaStream=null}
  function revokeLastRecording(){if(lastRecording?.url)try{URL.revokeObjectURL(lastRecording.url)}catch(_){};lastRecording=null}
  function recorderStatus(){return {support:recorderSupport(),micState,active:!!recorder&&recorder.state!=='inactive',session:copy(recorderSession),last:lastRecording?{...lastRecording,blob:undefined}:null}}
  async function startRecording(options={}){
    if(recorderSupport()===SUPPORT.UNSUPPORTED){micState=MIC.UNAVAILABLE;options.onStatus?.(recorderStatus());return {started:false,status:recorderStatus()}}
    if(recorder&&recorder.state!=='inactive')return {started:false,status:recorderStatus(),reason:'already-active'};
    micState=MIC.REQUESTING;options.onStatus?.(recorderStatus());
    try{
      mediaStream=await navigator.mediaDevices.getUserMedia({audio:true});
      micState=MIC.GRANTED;recorderChunks=[];
      recorder=new window.MediaRecorder(mediaStream);
      recorderSession={id:'REC-'+Date.now(),startedAt:new Date().toISOString(),maxDurationMs:Math.max(5000,Math.min(180000,Number(options.maxDurationMs)||90000)),retention:'TRANSIENT_LOCAL'};
      recorder.ondataavailable=e=>{if(e.data?.size)recorderChunks.push(e.data)};
      recorder.onerror=e=>{micState=MIC.ERROR;options.onError?.(e);options.onStatus?.(recorderStatus())};
      recorder.onstop=()=>{
        clearTimeout(recorderTimer);recorderTimer=0;
        const mime=recorder?.mimeType||'audio/webm';
        const blob=new Blob(recorderChunks,{type:mime});
        revokeLastRecording();
        const url=blob.size?URL.createObjectURL(blob):'';
        lastRecording={sessionId:recorderSession?.id||'',createdAt:new Date().toISOString(),durationMs:Date.now()-Date.parse(recorderSession?.startedAt||new Date().toISOString()),mimeType:mime,size:blob.size,url,retention:'TRANSIENT_LOCAL',blob};
        recorderChunks=[];releaseStream();recorder=null;
        options.onStop?.(lastRecording);options.onStatus?.(recorderStatus());
      };
      recorder.start();
      recorderTimer=setTimeout(()=>{try{if(recorder?.state!=='inactive')recorder.stop()}catch(_){}},recorderSession.maxDurationMs);
      options.onStatus?.(recorderStatus());return {started:true,status:recorderStatus()};
    }catch(error){
      releaseStream();recorder=null;
      const name=clean(error?.name);
      micState=(name==='NotAllowedError'||name==='SecurityError')?MIC.DENIED:MIC.ERROR;
      options.onError?.(error);options.onStatus?.(recorderStatus());
      return {started:false,status:recorderStatus(),reason:name||'get-user-media-failed'};
    }
  }
  function stopRecording(){if(!recorder||recorder.state==='inactive')return false;try{recorder.stop();return true}catch(_){return false}}
  function cancelRecording(){
    clearTimeout(recorderTimer);recorderTimer=0;
    if(recorder&&recorder.state!=='inactive'){recorder.ondataavailable=null;recorder.onstop=null;try{recorder.stop()}catch(_){}}
    recorder=null;recorderChunks=[];releaseStream();recorderSession=null;return true;
  }
  function getLastRecording(){return lastRecording}
  function clearRecording(){cancelRecording();revokeLastRecording();return true}

  document.addEventListener('click',event=>{
    const nav=event.target?.closest?.('[data-view],[data-route],a[href]');
    if(nav){cancelRecognition();if(recorder&&recorder.state!=='inactive')cancelRecording();}
  },true);
  window.addEventListener('pagehide',()=>{cancelRecognition();cancelRecording()});

  window.RussianAudioEngine={schema:'RUSSIAN_AUDIO_ENGINE_V1',support:audioSupport,speak,playSource};
  window.RussianSpeechRecognitionAdapter={schema:'RUSSIAN_SPEECH_RECOGNITION_ADAPTER_V1',states:SUPPORT,support:recognitionSupport,start:startRecognition,stop:stopRecognition,cancel:cancelRecognition,status:()=>recognitionState};
  window.RussianRecordingEngine={schema:'RUSSIAN_RECORDING_ENGINE_V1',micStates:MIC,support:recorderSupport,start:startRecording,stop:stopRecording,cancel:cancelRecording,status:recorderStatus,getLastRecording,clear:clearRecording};
})();