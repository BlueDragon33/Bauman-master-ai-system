import {SCHEMAS,validateLearnerSnapshot} from '../public/contracts.mjs';

const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
const arr=v=>Array.isArray(v)?v:[];
const clean=v=>String(v??'').trim();

const DIMENSION_MAP=Object.freeze({
  'grounded-semantic-comprehension':'semanticComprehension',
  'speech-recognition-observation':'speakingSignal',
  'speech-recording-captured':'speakingPractice',
  'listening-comprehension':'listening',
  'repair-success':'repair',
  'transfer-success':'transfer',
  'retention-success':'retention'
});

export function deriveLearnerSnapshot({profileId='local-default',evidence=[],reviewDue=[],internalLevel=1}={}){
  const buckets={};
  for(const item of arr(evidence)){
    const dimension=DIMENSION_MAP[item?.observationType]||clean(item?.dimension)||'general';
    const bucket=buckets[dimension]||(buckets[dimension]={success:0,total:0,supportTotal:0,independent:0});
    const success=item?.result?.success===true||item?.result?.recognized===true||item?.result?.captured===true;
    bucket.total++;
    if(success)bucket.success++;
    const support=Math.max(0,Math.min(10,Number(item?.supportLevel)||0));
    bucket.supportTotal+=support;
    if(success&&support===0)bucket.independent++;
  }
  const capabilities={};
  for(const [dimension,b] of Object.entries(buckets)){
    const raw=b.total?b.success/b.total:0;
    const independence=b.success?b.independent/b.success:0;
    const supportDependency=b.total?b.supportTotal/(b.total*10):0;
    capabilities[dimension]={
      estimate:clamp(raw*(0.7+0.3*independence)*(1-0.35*supportDependency)),
      evidenceCount:b.total,
      successRate:clamp(raw),
      independentSuccessRate:clamp(independence),
      supportDependency:clamp(supportDependency)
    };
  }
  return validateLearnerSnapshot({
    schemaVersion:SCHEMAS.learnerSnapshot,
    profileId,
    capabilities,
    reviewDue:arr(reviewDue),
    progression:{internalLevel:Number(internalLevel)||1}
  });
}

export function explainWeakDimensions(snapshot,{threshold=.6}={}){
  return Object.entries(snapshot?.capabilities||{})
    .filter(([,value])=>Number(value?.estimate)<threshold)
    .sort((a,b)=>Number(a[1].estimate)-Number(b[1].estimate))
    .map(([dimension,value])=>({
      dimension,
      estimate:Number(value.estimate),
      evidenceCount:Number(value.evidenceCount)||0,
      supportDependency:Number(value.supportDependency)||0,
      reason:Number(value.supportDependency)>.4?'high-support-dependency':'low-observed-success'
    }));
}
