/**
 * RE54 preview-only TTS adapter.
 * A successful browser TTS start is not linguistic or pronunciation authority.
 * Serializes calls while a provider promise settles and ignores rapid identical taps.
 */
export function createPreviewSpeechGate({
  playStimulus,
  now=()=>Date.now(),
  cooldownMs=350
}={}){
  let pending=false,disposed=false,revision=0,lastSignature='',lastAt=-Infinity;

  async function play({audioText,rate=1}={}){
    if(disposed)return {started:false,reason:'disposed'};
    if(pending)return {started:false,reason:'busy'};
    const text=String(audioText??'').trim();
    if(!text||typeof playStimulus!=='function')return {started:false,reason:'unavailable'};
    const speed=Number(rate);
    if(!Number.isFinite(speed)||speed<=0)return {started:false,reason:'invalid-rate'};
    const signature=text+'\u0000'+speed;
    const moment=Number(now());
    if(signature===lastSignature&&Number.isFinite(moment)&&moment-lastAt<cooldownMs){
      return {started:false,reason:'duplicate'};
    }
    const current=revision;
    pending=true;
    lastSignature=signature;
    lastAt=moment;
    try{
      const response=await playStimulus({audioText:text,sourceType:'TTS_FALLBACK',rate:speed});
      if(disposed||current!==revision)return {started:false,reason:'stale'};
      if(response?.started===true)return {started:true,reason:'started'};
      lastSignature='';
      return {started:false,reason:'unavailable'};
    }catch(_){
      lastSignature='';
      return {started:false,reason:disposed||current!==revision?'stale':'error'};
    }finally{
      pending=false;
    }
  }

  return Object.freeze({
    play,
    invalidate(){revision++;lastSignature='';lastAt=-Infinity;},
    dispose(){disposed=true;revision++;lastSignature='';},
    status:()=>Object.freeze({pending,disposed,previewOnly:true,pronunciationVerified:false})
  });
}
