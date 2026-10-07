import {buildRu04EvidenceBundle,applyRu04EvidenceBundle} from './ru04-evidence-bridge.mjs';
import {buildPlannerCandidates} from './planner-candidate-bridge.mjs';

const clean=v=>String(v??'').trim();
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

export function createIntegrationTransactionHub({assessmentOwner=null}={}){
  const applied=new Map();
  function transactionId(observation){return 'RTX::'+clean(observation?.evidenceId);}
  function dryRun({observation,contentRevision='',mode='practice',snapshot={},recommendation=null,experiences=[],capabilities={}}={}){
    const id=transactionId(observation);
    if(id==='RTX::')throw new Error('observation.evidenceId required');
    const bundle=buildRu04EvidenceBundle({observation,contentRevision,mode});
    const plannerCandidates=buildPlannerCandidates({snapshot,recommendation,experiences,capabilities,revision:contentRevision||'r1'});
    return Object.freeze({schema:'RUSSIAN_ENGINE_INTEGRATION_TRANSACTION_V1',transactionId:id,bundle,plannerCandidates,applied:false});
  }
  function apply(input={}){
    if(!assessmentOwner)throw new Error('assessment owner required');
    const preview=dryRun(input);
    if(applied.has(preview.transactionId))return copy(applied.get(preview.transactionId));
    const ownerResult=applyRu04EvidenceBundle(assessmentOwner,preview.bundle);
    const result={...preview,applied:true,ownerResult};
    applied.set(preview.transactionId,result);
    return copy(result);
  }
  return Object.freeze({schema:'RUSSIAN_ENGINE_INTEGRATION_HUB_V1',dryRun,apply,hasApplied:id=>applied.has(clean(id))});
}
