const copy=value=>{if(typeof structuredClone==='function')return structuredClone(value);return JSON.parse(JSON.stringify(value));};
const clean=value=>String(value??'').trim();

export function createExistingRussianSpeechAdapter(runtime){
  const audio=runtime?.RussianAudioEngine;
  const asr=runtime?.RussianSpeechRecognitionAdapter;
  const recording=runtime?.RussianRecordingEngine;
  const missing=[];
  if(!audio)missing.push('RussianAudioEngine');
  if(!asr)missing.push('RussianSpeechRecognitionAdapter');
  if(!recording)missing.push('RussianRecordingEngine');
  if(missing.length)throw new Error('Missing existing Russian speech owners: '+missing.join(', '));

  function capabilities(){
    return {
      schema:'RUSSIAN_ENGINE_SPEECH_CAPABILITIES_V1',
      source:'existing-russian-runtime',
      audio:copy(audio.support?.()||{}),
      speechRecognition:{support:asr.support?.()||'UNKNOWN',schema:asr.schema||null},
      recording:{support:recording.support?.()||'UNKNOWN',schema:recording.schema||null},
      privacy:{
        voiceUploadByAdapter:false,
        recordingRetention:'TRANSIENT_LOCAL',
        remoteProcessing:'UNKNOWN_PROVIDER_DEPENDENT_FOR_BROWSER_ASR'
      },
      limitations:[
        'ASR transcript/confidence is not pronunciation mastery evidence',
        'TTS is a listening aid unless source audio provenance says otherwise',
        'browser speech providers may vary by browser/device/network'
      ]
    };
  }

  function playRussian(text,options={}){
    const result=audio.speak?.(clean(text),{...options,lang:'ru-RU'});
    return {
      capability:'audio.playback',
      provider:'existing-russian-audio-engine',
      result:copy(result),
      authoritative:false
    };
  }

  function recognizeRussian(options={}){
    let lastResult=null,lastError=null;
    const start=asr.start?.({
      ...options,
      lang:'ru-RU',
      onResult:value=>{lastResult=value;options.onResult?.(value);},
      onError:value=>{lastError=value;options.onError?.(value);},
      onUnsupported:value=>{lastError={code:'unsupported',...value};options.onUnsupported?.(value);}
    });
    return {
      capability:'speech.recognition',
      provider:'existing-russian-speech-recognition-adapter',
      start:copy(start),
      getLastResult:()=>copy(lastResult),
      getLastError:()=>copy(lastError),
      stop:()=>asr.stop?.(),
      cancel:()=>asr.cancel?.()
    };
  }

  async function startLocalRecording(options={}){
    const result=await recording.start?.(options);
    return {
      capability:'audio.record',
      provider:'existing-russian-recording-engine',
      result:copy(result),
      retention:'TRANSIENT_LOCAL',
      remoteUpload:false
    };
  }

  return Object.freeze({
    schema:'RUSSIAN_ENGINE_EXISTING_SPEECH_ADAPTER_V1',
    ownerPolicy:'ADAPT_EXISTING_DO_NOT_DUPLICATE',
    capabilities,
    playRussian,
    recognizeRussian,
    startLocalRecording,
    stopLocalRecording:()=>recording.stop?.(),
    cancelLocalRecording:()=>recording.cancel?.(),
    recordingStatus:()=>copy(recording.status?.()||{}),
    getLastRecording:()=>copy(recording.getLastRecording?.()||null),
    clearRecording:()=>recording.clear?.()
  });
}
