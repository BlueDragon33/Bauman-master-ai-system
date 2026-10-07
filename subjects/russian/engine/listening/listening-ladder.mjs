const clean=v=>String(v??'').trim();
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};
const arr=v=>Array.isArray(v)?v:[];

const TIERS=Object.freeze([
  {id:'L0',rate:.7,speakerVariation:false,noise:'none',transcript:'hidden',label:'careful'},
  {id:'L1',rate:.85,speakerVariation:false,noise:'none',transcript:'hidden',label:'clear-native'},
  {id:'L2',rate:1,speakerVariation:false,noise:'none',transcript:'hidden',label:'normal-native'},
  {id:'L3',rate:1,speakerVariation:true,noise:'none',transcript:'hidden',label:'alternate-speaker'},
  {id:'L4',rate:1,speakerVariation:true,noise:'mild',transcript:'hidden',label:'connected-context'}
]);

export function createListeningLadder(target,{provider='TTS_OR_SOURCE_AUDIO'}={}){
  if(!clean(target?.targetId))throw new Error('targetId required');
  if(!clean(target?.semanticRef))throw new Error('semanticRef required');
  if(!clean(target?.audioText))throw new Error('audioText required');
  return TIERS.map((tier,index)=>({
    schemaVersion:'RUSSIAN_ENGINE_LISTENING_VARIANT_V1',
    variantId:`${target.targetId}-${tier.id}`,
    targetId:target.targetId,
    semanticRef:target.semanticRef,
    language:'ru',
    audioText:target.audioText,
    provider,
    tier:index,
    rate:tier.rate,
    speakerVariation:tier.speakerVariation,
    noise:tier.noise,
    transcriptPolicy:tier.transcript,
    speechLabel:tier.label
  }));
}

export function evaluateListeningAttempt({variant,success,supportLevel=0,details={}}={}){
  if(!variant?.variantId)throw new Error('variant required');
  const support=Math.max(0,Math.min(10,Number(supportLevel)||0));
  return {
    schemaVersion:'RUSSIAN_ENGINE_LISTENING_OBSERVATION_V1',
    observationType:'listening-comprehension',
    targetId:variant.targetId,
    semanticRef:variant.semanticRef,
    variantId:variant.variantId,
    result:{success:success===true,details:copy(details)},
    difficulty:{
      tier:Number(variant.tier)||0,
      rate:Number(variant.rate)||1,
      speakerVariation:variant.speakerVariation===true,
      noise:clean(variant.noise)||'none',
      transcriptPolicy:clean(variant.transcriptPolicy)||'hidden'
    },
    supportLevel:support,
    independent:success===true&&support===0&&variant.transcriptPolicy==='hidden',
    authoritative:false,
    masteryMutation:false
  };
}

export function recommendListeningVariant({variants=[],recentEvidence=[]}={}){
  const rows=arr(variants).sort((a,b)=>Number(a.tier)-Number(b.tier));
  if(!rows.length)return null;
  const evidence=arr(recentEvidence).filter(x=>x?.observationType==='listening-comprehension');
  if(!evidence.length)return copy(rows[0]);
  const successes=evidence.filter(x=>x?.result?.success===true);
  const bestIndependent=successes.filter(x=>x.independent===true).reduce((m,x)=>Math.max(m,Number(x?.difficulty?.tier)||0),-1);
  const nextTier=Math.min(rows.length-1,bestIndependent+1);
  const candidate=rows.find(x=>Number(x.tier)===nextTier)||rows[0];
  return copy(candidate);
}

export const LISTENING_TIERS=TIERS;
