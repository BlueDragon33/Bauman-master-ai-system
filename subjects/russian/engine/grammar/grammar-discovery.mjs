const clean=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};

export function validateGrammarDiscoveryUnit(unit){
  const errors=[];
  if(!clean(unit?.unitId))errors.push('unitId required');
  if(!clean(unit?.canonicalGrammarRef))errors.push('canonicalGrammarRef required');
  if(!arr(unit?.exposures).length)errors.push('exposures required');
  if(!arr(unit?.contrasts).length)errors.push('contrasts required');
  if(!clean(unit?.discoveryPrompt))errors.push('discoveryPrompt required');
  if(!clean(unit?.explanationRef))errors.push('explanationRef required');
  if(unit?.authorityStatus!=='FIXTURE_NONCANONICAL'&&unit?.authorityStatus!=='VERIFIED'&&unit?.authorityStatus!=='CURATED')errors.push('authorityStatus invalid');
  return {ok:errors.length===0,errors};
}

export function createGrammarDiscoverySession(unit){
  const valid=validateGrammarDiscoveryUnit(unit);
  if(!valid.ok)throw new Error('Grammar discovery unit invalid: '+valid.errors.join('; '));
  let exposureIndex=0;
  let contrastIndex=0;
  let discovered=false;
  let explanationRevealed=false;
  const observations=[];

  function currentExposure(){return copy(unit.exposures[exposureIndex]||null);}
  function nextExposure(){
    if(exposureIndex<unit.exposures.length-1)exposureIndex++;
    return currentExposure();
  }
  function currentContrast(){return copy(unit.contrasts[contrastIndex]||null);}
  function nextContrast(){
    if(contrastIndex<unit.contrasts.length-1)contrastIndex++;
    return currentContrast();
  }
  function submitPrediction({prediction,expected}={}){
    const success=clean(prediction)===clean(expected);
    observations.push({
      observationType:'grammar-pattern-prediction',
      result:{success},
      authoritative:false,
      masteryMutation:false
    });
    return {success,attempts:observations.length};
  }
  function markDiscovered(){
    const successful=observations.filter(x=>x.result.success).length;
    if(successful<2)return {discovered:false,reason:'insufficient-pattern-evidence'};
    discovered=true;
    return {discovered:true,discoveryPrompt:unit.discoveryPrompt};
  }
  function revealExplanation(){
    explanationRevealed=true;
    return {
      explanationRef:unit.explanationRef,
      canonicalGrammarRef:unit.canonicalGrammarRef,
      authoritativeSourceRequired:true
    };
  }
  function transferProbe(){
    return copy(unit.transfer||null);
  }
  function snapshot(){
    return {
      unitId:unit.unitId,
      exposureIndex,
      contrastIndex,
      observations:copy(observations),
      discovered,
      explanationRevealed,
      canonicalGrammarRef:unit.canonicalGrammarRef
    };
  }
  return Object.freeze({
    schema:'RUSSIAN_ENGINE_GRAMMAR_DISCOVERY_SESSION_V1',
    currentExposure,nextExposure,currentContrast,nextContrast,
    submitPrediction,markDiscovered,revealExplanation,transferProbe,snapshot
  });
}
