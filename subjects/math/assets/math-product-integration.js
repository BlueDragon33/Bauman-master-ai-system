/* Bauman Math Product Integration V1 · MATH05
 * Shared-platform product descriptor. It does not own navigation, theme, auth,
 * planner, generic progress, mathematical truth, assessment verdicts or mastery.
 */
(function mathProductIntegration(root){
  'use strict';
  const RELEASE='MATH_PRODUCT_INTEGRATION_V1';
  const SURFACES=Object.freeze({
    overview:{owner:'shared-math-shell',capabilities:[]},
    roadmap:{owner:'math-navigation',capabilities:[]},
    lesson:{owner:'E186/E169/E129',capabilities:['math.parse.expression']},
    problem:{owner:'math-activity-studio',capabilities:['math.parse.expression','math.numeric.evaluate']},
    proof:{owner:'math-activity-studio+MATH03',capabilities:[]},
    graph:{owner:'math-lab',capabilities:['math.graph.sample']},
    review:{owner:'math-activity-mastery+study-command-center',capabilities:[]},
    assessment:{owner:'math-activity-studio+MATH03',capabilities:[]},
    application:{owner:'canonical-application-content',capabilities:['math.simulation.run']},
    resources:{owner:'math-study-library',capabilities:[]},
    ai:{owner:'policy-gated-ai-surface',capabilities:['math.ai.coach']}
  });
  const INPUTS=Object.freeze({
    numeric:{control:'number',keyboard:true,authority:'problem.responseSchema'},
    algebraic_expression_with_domain:{control:'expression+domain',keyboard:true,authority:'problem.responseSchema'},
    unit_quantity:{control:'number+unit',keyboard:true,authority:'problem.responseSchema'},
    long_text:{control:'textarea',keyboard:true,authority:'problem.responseSchema'},
    text:{control:'text',keyboard:true,authority:'problem.responseSchema'}
  });
  function capabilityApi(){return root.BAUMAN_MATH_CAPABILITIES||null}
  function surface(id){const x=SURFACES[id];return x?JSON.parse(JSON.stringify(x)):null}
  function inputDescriptor(type){const x=INPUTS[type]||INPUTS.text;return JSON.parse(JSON.stringify(x))}
  async function invoke(capability,input={},context={}){
    const api=capabilityApi();
    if(!api?.invoke)return {capability,status:'UNAVAILABLE',data:null,provenance:null,error:'MATH04_CAPABILITY_FACADE_UNAVAILABLE',masteryWrite:false,academicWrite:false};
    return api.invoke(capability,input,context);
  }
  function state(){
    return {
      release:RELEASE,
      platformFork:false,
      ownsGlobalNavigation:false,
      ownsTheme:false,
      ownsNotifications:false,
      ownsPlanner:false,
      ownsGenericProgress:false,
      masteryAuthority:false,
      assessmentAuthority:false,
      mathematicalTruthAuthority:false,
      capabilityFacade:Boolean(capabilityApi()),
      surfaces:Object.keys(SURFACES),
      inputTypes:Object.keys(INPUTS)
    };
  }
  function selfCheck(){
    const s=state();
    return {...s,keyboardCriticalInputs:Object.values(INPUTS).every(x=>x.keyboard===true),providerSpecificCalls:false};
  }
  root.BAUMAN_MATH_PRODUCT=Object.freeze({release:RELEASE,surface,inputDescriptor,invoke,state,selfCheck});
  if(typeof module!=='undefined'&&module.exports)module.exports=root.BAUMAN_MATH_PRODUCT;
})(typeof window!=='undefined'?window:globalThis);
