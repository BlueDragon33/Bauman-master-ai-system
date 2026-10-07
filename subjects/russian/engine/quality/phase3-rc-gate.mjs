const clean=v=>String(v??'').trim();

export const ROLLOUT_STATES=Object.freeze([
  'OFF',
  'OPT_IN_FLAG',
  'INTERNAL_BETA',
  'DEFAULT_ON_CANDIDATE',
  'DEFAULT_ON'
]);

const REQUIRED_PACKAGES=['RE16','RE17','RE18','RE19'];
const REQUIRED_WORKFLOWS=[
  'developmentFastCi',
  'russianReferenceUi',
  'futureInterface',
  'promptControlCenter',
  'universalConstitution',
  'wholeSystemIntegration'
];
const REQUIRED_BROWSER=[
  'groundedSource',
  'groundedPackaged',
  'offlineShell',
  'wholeSystem'
];

export function evaluatePhase3Rc({packages={},workflows={},browser={},rollout={}}={}){
  const errors=[];
  for(const id of REQUIRED_PACKAGES){
    if(packages?.[id]!=='PASS')errors.push(id+' not PASS');
  }
  for(const id of REQUIRED_WORKFLOWS){
    if(workflows?.[id]!=='PASS')errors.push('workflow '+id+' not PASS');
  }
  for(const id of REQUIRED_BROWSER){
    if(browser?.[id]!=='PASS')errors.push('browser '+id+' not PASS');
  }

  const state=clean(rollout?.state)||'OFF';
  if(!ROLLOUT_STATES.includes(state))errors.push('invalid rollout state');
  const index=ROLLOUT_STATES.indexOf(state);
  const optInIndex=ROLLOUT_STATES.indexOf('OPT_IN_FLAG');

  if(index>optInIndex&&rollout?.productAuthorization!==true){
    errors.push('explicit product authorization required beyond OPT_IN_FLAG');
  }
  if(state==='DEFAULT_ON'&&rollout?.releaseAnnexPass!==true){
    errors.push('C3 Release Annex PASS required for DEFAULT_ON');
  }

  return {
    ok:errors.length===0,
    errors,
    rcReady:errors.length===0,
    rolloutState:state,
    productionClaim:false,
    defaultOnClaim:state==='DEFAULT_ON'&&errors.length===0
  };
}

export function requestRolloutTransition({from='OFF',to='OPT_IN_FLAG',productAuthorization=false,releaseAnnexPass=false}={}){
  const a=ROLLOUT_STATES.indexOf(clean(from));
  const b=ROLLOUT_STATES.indexOf(clean(to));
  if(a<0||b<0)throw new Error('invalid rollout state');
  if(b<a) return {allowed:true,from,to,reason:'rollback'};
  if(b>a+1)throw new Error('rollout states must advance one step at a time');
  if(b>ROLLOUT_STATES.indexOf('OPT_IN_FLAG')&&productAuthorization!==true){
    return {allowed:false,from,to,reason:'product-authorization-required'};
  }
  if(to==='DEFAULT_ON'&&releaseAnnexPass!==true){
    return {allowed:false,from,to,reason:'release-annex-pass-required'};
  }
  return {allowed:true,from,to,reason:b===a?'no-op':'authorized-transition'};
}

export const PHASE3_REQUIRED=Object.freeze({
  packages:[...REQUIRED_PACKAGES],
  workflows:[...REQUIRED_WORKFLOWS],
  browser:[...REQUIRED_BROWSER]
});
