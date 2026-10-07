const arr=v=>Array.isArray(v)?v:[];
const num=v=>Number.isFinite(Number(v))?Number(v):null;
const round=v=>Math.round(v*1000)/1000;

export function deriveLearnerMetrics(evidence=[]){
  const rows=arr(evidence);
  const usable=rows.filter(x=>x?.provider?.infrastructureFailure!==true&&x?.result?.providerFailure!==true);
  const success=usable.filter(x=>x?.result?.success===true);
  const comprehension=usable.filter(x=>String(x?.observationType||'').includes('comprehension'));
  const independent=comprehension.filter(x=>x?.result?.success===true&&(Number(x?.supportLevel)||0)===0);
  const translationSuccess=success.filter(x=>(Number(x?.supportLevel)||0)>=10);
  const native=usable.filter(x=>(num(x?.difficulty?.rate)||0)>=1);
  const nativeIndependent=native.filter(x=>x?.result?.success===true&&(Number(x?.supportLevel)||0)===0);
  const transfers=usable.filter(x=>x?.transfer===true||String(x?.observationType||'').includes('transfer'));
  const transferSuccess=transfers.filter(x=>x?.result?.success===true);
  const latencies=usable.map(x=>num(x?.responseLatencyMs)).filter(v=>v!=null&&v>=0).sort((a,b)=>a-b);
  const medianLatency=latencies.length?latencies[Math.floor((latencies.length-1)/2)]:null;
  const supportLevels=usable.map(x=>Math.max(0,Math.min(10,Number(x?.supportLevel)||0)));
  const infra=rows.length-usable.length;
  const repair=usable.filter(x=>String(x?.observationType||'').includes('repair'));
  const repairSuccess=repair.filter(x=>x?.result?.success===true);
  const pronunciation=usable.filter(x=>String(x?.observationType||'').includes('pronunciation'));
  return {
    schema:'RUSSIAN_ENGINE_LEARNER_METRICS_V1',
    observations:rows.length,
    usableObservations:usable.length,
    independentSemanticComprehension:comprehension.length?round(independent.length/comprehension.length):null,
    supportDependence:supportLevels.length?round(supportLevels.reduce((a,b)=>a+b,0)/(supportLevels.length*10)):null,
    translationDependence:success.length?round(translationSuccess.length/success.length):null,
    nativeSpeedIndependent:native.length?round(nativeIndependent.length/native.length):null,
    transferSuccess:transfers.length?round(transferSuccess.length/transfers.length):null,
    medianResponseLatencyMs:medianLatency,
    repairSuccess:repair.length?round(repairSuccess.length/repair.length):null,
    pronunciationSignalCoverage:pronunciation.length?round(pronunciation.filter(x=>x?.claims?.phonemeEvidenceAvailable||x?.claims?.stressEvidenceAvailable).length/pronunciation.length):null,
    infrastructureFailureRate:rows.length?round(infra/rows.length):0,
    authoritative:false
  };
}
