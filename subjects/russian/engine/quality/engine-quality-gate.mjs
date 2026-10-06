const clean=value=>String(value??'').trim();
const arr=value=>Array.isArray(value)?value:[];

function fail(name,errors,message){
  errors.push(`${name}: ${message}`);
}

export function validateEngineQuality({
  levelCatalog,
  referenceGraph,
  commercialContract,
  failureMatrix,
  sourceFiles={}
}={}) {
  const errors=[];
  const warnings=[];

  if(levelCatalog?.schemaVersion!=='RUSSIAN_ENGINE_LEVEL_CATALOG_V1')fail('levels',errors,'invalid schemaVersion');
  if(arr(levelCatalog?.levels).length!==100)fail('levels',errors,'must contain exactly 100 levels');
  if(Number(levelCatalog?.bandCount)!==10)fail('levels',errors,'must contain exactly 10 bands');
  if(!arr(levelCatalog?.levels).every(x=>x?.promotion?.authority==='RU04/C4'))fail('levels',errors,'promotion authority drift');
  if(!arr(levelCatalog?.levels).every(x=>x?.officialMapping?.certified===false))fail('levels',errors,'official certification claim detected');

  if(referenceGraph?.schemaVersion!=='RUSSIAN_ENGINE_KNOWLEDGE_GRAPH_V1')fail('graph',errors,'invalid schemaVersion');
  const canonicalRefs=arr(referenceGraph?.nodes).filter(x=>x?.kind==='canonical-ref');
  if(canonicalRefs.some(x=>Object.hasOwn(x,'russian')||Object.hasOwn(x,'text')))fail('graph',errors,'canonical Russian text copied into reference node');

  if(commercialContract?.schemaVersion!=='RUSSIAN_ENGINE_COMMERCIAL_CONTRACT_V1')fail('commercial',errors,'invalid schemaVersion');
  if(commercialContract?.backend?.mandatoryNow!==false)fail('commercial',errors,'backend must not be mandatory now');
  if(commercialContract?.backend?.paymentProviderMandatoryNow!==false)fail('commercial',errors,'payment provider must not be mandatory now');
  if(commercialContract?.analytics?.rawVoiceDefault!=='DO_NOT_COLLECT')fail('privacy',errors,'raw voice default must be DO_NOT_COLLECT');
  if(commercialContract?.dataRights?.subscriptionChangeMayDeleteLearningEvidence!==false)fail('privacy',errors,'subscription change cannot delete learning evidence');

  const requiredFailures=new Set(arr(failureMatrix?.requiredCases));
  for(const id of [
    'provider-asr-unavailable',
    'microphone-denied',
    'profile-isolation-violation',
    'sync-conflict',
    'engine-mastery-mutation-attempt',
    'scenario-mastery-mutation-attempt',
    'offline-no-ai-path'
  ]){
    if(!requiredFailures.has(id))fail('failure-matrix',errors,`missing ${id}`);
  }

  const forbidden=[
    {pattern:/\beval\s*\(/,label:'eval('},
    {pattern:/new\s+Function\s*\(/,label:'new Function('},
    {pattern:/document\.cookie/,label:'document.cookie'},
    {pattern:/localStorage\s*\.\s*clear\s*\(/,label:'localStorage.clear('}
  ];
  for(const [path,source] of Object.entries(sourceFiles||{})){
    const text=String(source??'');
    for(const rule of forbidden){
      if(rule.pattern.test(text))fail('security',errors,`${rule.label} detected in ${path}`);
    }
  }

  const levelBranchPattern=/if\s*\([^)]*RL(?:0\d\d|100)[^)]*\)/;
  for(const [path,source] of Object.entries(sourceFiles||{})){
    if(levelBranchPattern.test(String(source??'')))fail('scale',errors,`manual RLxxx branch detected in ${path}`);
  }

  const eagerCorpusPattern=/(dialogue-bauman-az|deep-speaking-bauman|vocab\.json).*import/i;
  for(const [path,source] of Object.entries(sourceFiles||{})){
    if(eagerCorpusPattern.test(String(source??'')))warnings.push(`possible eager large-corpus import in ${path}`);
  }

  return {
    ok:errors.length===0,
    errors,
    warnings,
    summary:{
      levels:arr(levelCatalog?.levels).length,
      bands:Number(levelCatalog?.bandCount)||0,
      graphNodes:arr(referenceGraph?.nodes).length,
      canonicalRefs:canonicalRefs.length,
      failureCases:requiredFailures.size,
      sourceFilesScanned:Object.keys(sourceFiles||{}).length
    }
  };
}
