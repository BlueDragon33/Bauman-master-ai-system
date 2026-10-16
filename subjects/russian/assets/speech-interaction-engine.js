'use strict';
(function(){
  const SUPPORT=Object.freeze({SUPPORTED:'SUPPORTED',PARTIAL:'PARTIAL',UNSUPPORTED:'UNSUPPORTED',PERMISSION_BLOCKED:'PERMISSION_BLOCKED',RUNTIME_ERROR:'RUNTIME_ERROR'});
  const MIC=Object.freeze({UNKNOWN:'UNKNOWN',REQUESTING:'REQUESTING',GRANTED:'GRANTED',DENIED:'DENIED',UNAVAILABLE:'UNAVAILABLE',ERROR:'ERROR'});
  const clean=v=>String(v??'').trim();
  const copy=v=>{try{return JSON.parse(JSON.stringify(v));}catch(_){return null}};
  let recognition=null, recognitionTimer=0, recognitionState=SUPPORT.UNSUPPORTED;
  let mediaStream=null, recorder=null, recorderChunks=[], recorderTimer=0, recorderSession=null, lastRecording=null, micState=MIC.UNKNOWN;
  let recordingEpoch=0, permissionPending=false;

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

  let playbackEpoch=0, activeUtterance=null, activePlayer=null;
  function audioSupport(){return {tts:'speechSynthesis' in window&&typeof window.SpeechSynthesisUtterance!=='undefined',htmlAudio:typeof window.Audio==='function'}}
  function cancelPlayback(){
    // Retire callbacks before stopping: cancel(), pause() and pending play()
    // promises may all dispatch late events on older media sessions.
    playbackEpoch++;
    const player=activePlayer,utterance=activeUtterance;
    activePlayer=null;activeUtterance=null;
    if(player){try{player.pause?.()}catch(_){}}
    if(utterance){try{window.speechSynthesis?.cancel?.()}catch(_){}}
    return !!(player||utterance);
  }
  function speak(text,options={}){
    const value=clean(text);if(!value)return {started:false,sourceType:'TTS',reason:'empty'};
    if(!audioSupport().tts){options.onUnavailable?.();return {started:false,sourceType:'TTS',reason:'unsupported'}}
    cancelPlayback();
    const epoch=playbackEpoch;
    try{
      const u=new window.SpeechSynthesisUtterance(value);
      u.lang=clean(options.lang)||'ru-RU';
      const rate=Number(options.rate);
      u.rate=Math.max(.5,Math.min(1.5,Number.isFinite(rate)&&rate>0?rate:.85));
      activeUtterance=u;
      u.onstart=()=>{if(epoch===playbackEpoch&&activeUtterance===u)options.onStart?.()};
      u.onend=()=>{
        if(epoch!==playbackEpoch||activeUtterance!==u)return;
        activeUtterance=null;options.onEnd?.();
      };
      u.onerror=error=>{
        if(epoch!==playbackEpoch||activeUtterance!==u)return;
        activeUtterance=null;options.onError?.(error);
      };
      window.speechSynthesis.speak(u);
      return {started:true,sourceType:'TTS'};
    }catch(error){
      if(epoch===playbackEpoch)cancelPlayback();
      options.onError?.(error);
      return {started:false,sourceType:'TTS',reason:'runtime-error'};
    }
  }
  function playSource(src,options={}){
    const source=clean(src);
    if(!source)return {started:false,sourceType:options.sourceType||'UNKNOWN',reason:'empty'};
    if(!audioSupport().htmlAudio){
      options.onUnavailable?.();
      return {started:false,sourceType:options.sourceType||'UNKNOWN',reason:'unsupported'};
    }
    cancelPlayback();
    const epoch=playbackEpoch;
    let player=null;
    try{
      player=new window.Audio(source);activePlayer=player;
      const rate=Number(options.rate);
      player.playbackRate=Math.max(.5,Math.min(2,Number.isFinite(rate)&&rate>0?rate:1));
      const onError=error=>{
        if(epoch!==playbackEpoch||activePlayer!==player)return;
        cancelPlayback();options.onError?.(error);
      };
      player.addEventListener('error',onError,{once:true});
      player.addEventListener('ended',()=>{
        if(epoch!==playbackEpoch||activePlayer!==player)return;
        activePlayer=null;options.onEnd?.();
      },{once:true});
      const promise=player.play();
      promise?.catch?.(onError);
      return {started:true,sourceType:options.sourceType||'UNKNOWN',player};
    }catch(error){
      if(epoch===playbackEpoch)cancelPlayback();
      options.onError?.(error);
      return {started:false,sourceType:options.sourceType||'UNKNOWN',reason:'runtime-error'};
    }
  }

  function recorderSupport(){
    if(!navigator?.mediaDevices?.getUserMedia||typeof window.MediaRecorder==='undefined')return SUPPORT.UNSUPPORTED;
    return SUPPORT.SUPPORTED;
  }
  function stopTracks(stream){for(const track of stream?.getTracks?.()||[])try{track.stop()}catch(_){}}
  function releaseStream(){stopTracks(mediaStream);mediaStream=null}
  function revokeLastRecording(){if(lastRecording?.url)try{URL.revokeObjectURL(lastRecording.url)}catch(_){};lastRecording=null}
  function recorderStatus(){return {support:recorderSupport(),micState,pending:permissionPending,active:!!recorder&&recorder.state!=='inactive',session:copy(recorderSession),last:lastRecording?{...lastRecording,blob:undefined}:null}}
  async function startRecording(options={}){
    if(recorderSupport()===SUPPORT.UNSUPPORTED){micState=MIC.UNAVAILABLE;options.onStatus?.(recorderStatus());return {started:false,status:recorderStatus()}}
    if(permissionPending||recorder)return {started:false,status:recorderStatus(),reason:'already-active'};
    // Permission prompts are asynchronous. A cancelled or superseded request
    // must never reactivate the microphone when getUserMedia resolves later.
    const epoch=++recordingEpoch;
    permissionPending=true;micState=MIC.REQUESTING;options.onStatus?.(recorderStatus());
    if(epoch!==recordingEpoch)return {started:false,reason:'cancelled',status:recorderStatus()};
    try{
      const grantedStream=await navigator.mediaDevices.getUserMedia({audio:true});
      if(epoch!==recordingEpoch){
        stopTracks(grantedStream);
        return {started:false,reason:'cancelled',status:recorderStatus()};
      }
      permissionPending=false;
      mediaStream=grantedStream;micState=MIC.GRANTED;recorderChunks=[];
      const current=new window.MediaRecorder(grantedStream);recorder=current;
      recorderSession={id:'REC-'+Date.now(),startedAt:new Date().toISOString(),maxDurationMs:Math.max(5000,Math.min(180000,Number(options.maxDurationMs)||90000)),retention:'TRANSIENT_LOCAL'};
      current.ondataavailable=event=>{if(epoch===recordingEpoch&&recorder===current&&event.data?.size)recorderChunks.push(event.data)};
      current.onerror=event=>{
        if(epoch!==recordingEpoch||recorder!==current)return;
        micState=MIC.ERROR;options.onError?.(event);options.onStatus?.(recorderStatus());
      };
      current.onstop=()=>{
        if(epoch!==recordingEpoch||recorder!==current)return;
        clearTimeout(recorderTimer);recorderTimer=0;
        const mime=current.mimeType||'audio/webm';
        const blob=new Blob(recorderChunks,{type:mime});
        revokeLastRecording();
        const url=blob.size?URL.createObjectURL(blob):'';
        lastRecording={sessionId:recorderSession?.id||'',createdAt:new Date().toISOString(),durationMs:Date.now()-Date.parse(recorderSession?.startedAt||new Date().toISOString()),mimeType:mime,size:blob.size,url,retention:'TRANSIENT_LOCAL',blob};
        recorderChunks=[];releaseStream();recorder=null;
        options.onStop?.(lastRecording);options.onStatus?.(recorderStatus());
      };
      current.start();
      recorderTimer=setTimeout(()=>{if(epoch===recordingEpoch&&recorder===current)try{if(current.state!=='inactive')current.stop()}catch(_){}},recorderSession.maxDurationMs);
      options.onStatus?.(recorderStatus());return {started:true,status:recorderStatus()};
    }catch(error){
      if(epoch!==recordingEpoch)return {started:false,reason:'cancelled',status:recorderStatus()};
      permissionPending=false;
      clearTimeout(recorderTimer);recorderTimer=0;
      if(recorder){recorder.ondataavailable=null;recorder.onstop=null;recorder.onerror=null;}
      recorder=null;recorderChunks=[];recorderSession=null;releaseStream();
      const name=clean(error?.name);
      micState=(name==='NotAllowedError'||name==='SecurityError')?MIC.DENIED:MIC.ERROR;
      options.onError?.(error);options.onStatus?.(recorderStatus());
      return {started:false,status:recorderStatus(),reason:name||'get-user-media-failed'};
    }
  }
  function stopRecording(){if(!recorder||recorder.state==='inactive')return false;try{recorder.stop();return true}catch(_){return false}}
  function cancelRecording(){
    // Invalidating the epoch covers active recorders AND pending permission UI.
    recordingEpoch++;permissionPending=false;
    clearTimeout(recorderTimer);recorderTimer=0;
    const current=recorder;recorder=null;
    if(current){
      current.ondataavailable=null;current.onstop=null;current.onerror=null;
      if(current.state!=='inactive')try{current.stop()}catch(_){}
    }
    recorderChunks=[];releaseStream();recorderSession=null;micState=MIC.UNKNOWN;return true;
  }
  function getLastRecording(){return lastRecording}
  function clearRecording(){cancelRecording();revokeLastRecording();return true}

  document.addEventListener('click',event=>{
    const nav=event.target?.closest?.('[data-view],[data-route],a[href]');
    if(nav){cancelPlayback();cancelRecognition();if(permissionPending||recorder)cancelRecording();}
  },true);
  window.addEventListener('pagehide',()=>{cancelPlayback();cancelRecognition();cancelRecording()});

  window.RussianAudioEngine={schema:'RUSSIAN_AUDIO_ENGINE_V1',support:audioSupport,speak,playSource,cancel:cancelPlayback};
  window.RussianSpeechRecognitionAdapter={schema:'RUSSIAN_SPEECH_RECOGNITION_ADAPTER_V1',states:SUPPORT,support:recognitionSupport,start:startRecognition,stop:stopRecognition,cancel:cancelRecognition,status:()=>recognitionState};
  window.RussianRecordingEngine={schema:'RUSSIAN_RECORDING_ENGINE_V1',micStates:MIC,support:recorderSupport,start:startRecording,stop:stopRecording,cancel:cancelRecording,status:recorderStatus,getLastRecording,clear:clearRecording};
})();