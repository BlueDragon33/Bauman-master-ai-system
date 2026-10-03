/* Bauman Math Capability Runtime V1 · MATH04
 * Provider-abstracted math tools. No mastery/academic writes; no arbitrary eval.
 */
(function mathCapabilityRuntime(root){
  'use strict';
  const RELEASE='MATH_CAPABILITY_RUNTIME_V1';
  const PROVIDER='bauman-local-deterministic';
  const VERSION='1.0.0';
  const registry=new Map();
  const now=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
  const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return null}};
  function result(capability,status,data,meta={}){
    return Object.freeze({
      capability,status,data:data===undefined?null:clone(data),
      provenance:{provider:meta.provider||PROVIDER,providerVersion:meta.providerVersion||VERSION,operation:capability,exactness:meta.exactness||'unknown',assumptions:clone(meta.assumptions||[]),mode:meta.mode||'local',offline:meta.offline!==false},
      error:meta.error||null,warning:meta.warning||null,latencyMs:Number(meta.latencyMs||0),
      masteryWrite:false,academicWrite:false
    });
  }
  function register(id,descriptor,handler){
    if(!id||registry.has(id))return false;
    registry.set(id,Object.freeze({id,...clone(descriptor||{}),handler}));
    return true;
  }
  function describe(id){const x=registry.get(id);if(!x)return null;const {handler,...d}=x;return clone(d)}
  function list(){return [...registry.values()].map(({handler,...d})=>clone(d))}
  async function invoke(id,input={},context={}){
    const entry=registry.get(id);
    if(!entry)return result(id,'UNAVAILABLE',null,{error:'CAPABILITY_NOT_REGISTERED'});
    if(entry.available===false)return result(id,'UNAVAILABLE',null,{provider:entry.provider,error:entry.unavailableReason||'CAPABILITY_UNAVAILABLE'});
    const started=now(),timeoutMs=Math.max(20,Math.min(5000,Number(context.timeoutMs||entry.timeoutMs||1000)));
    try{
      const work=Promise.resolve(entry.handler(clone(input),clone(context)));
      const timeout=new Promise(resolve=>setTimeout(()=>resolve({__timeout:true}),timeoutMs));
      const raw=await Promise.race([work,timeout]);
      if(raw&&raw.__timeout)return result(id,'ERROR',null,{provider:entry.provider,error:'PROVIDER_TIMEOUT',latencyMs:now()-started});
      if(raw&&raw.status&&['OK','UNAVAILABLE','ERROR'].includes(raw.status)){
        return result(id,raw.status,raw.data,{provider:entry.provider,providerVersion:entry.providerVersion,exactness:raw.exactness,assumptions:raw.assumptions,error:raw.error,warning:raw.warning,mode:raw.mode,offline:raw.offline,latencyMs:now()-started});
      }
      return result(id,'OK',raw,{provider:entry.provider,providerVersion:entry.providerVersion,exactness:entry.exactness,assumptions:context.assumptions||[],latencyMs:now()-started});
    }catch(error){
      return result(id,'ERROR',null,{provider:entry.provider,error:String(error?.message||error),latencyMs:now()-started});
    }
  }

  const MAX_EXPR=240,MAX_TOKENS=160;
  const funcs=new Set(['sin','cos','tan','sqrt','abs','exp','log']);
  const consts={pi:Math.PI,e:Math.E};
  function tokenize(raw){
    const s=String(raw??'').trim();
    if(!s||s.length>MAX_EXPR)throw new Error(!s?'EMPTY_EXPRESSION':'EXPRESSION_TOO_LONG');
    const re=/\s*([A-Za-z_][A-Za-z0-9_]*|(?:\d+(?:\.\d*)?|\.\d+)|\^|[()+\-*/,])\s*/gy;
    const out=[];let at=0,m;
    while(at<s.length){re.lastIndex=at;m=re.exec(s);if(!m||m.index!==at)throw new Error('UNSUPPORTED_TOKEN');out.push(m[1]);at=re.lastIndex;if(out.length>MAX_TOKENS)throw new Error('TOO_MANY_TOKENS')}
    return out;
  }
  function parser(tokens,vars={}){
    let i=0;
    const peek=()=>tokens[i],take=()=>tokens[i++];
    function primary(){
      const t=peek();
      if(t==='('){take();const v=expression();if(take()!==')')throw new Error('MISSING_PAREN');return v}
      if(/^(?:\d|\.)/.test(t||'')){take();const n=Number(t);if(!Number.isFinite(n))throw new Error('NON_FINITE');return n}
      if(/^[A-Za-z_]/.test(t||'')){
        const name=take();
        if(peek()==='('){
          if(!funcs.has(name))throw new Error('FUNCTION_NOT_ALLOWED');
          take();const arg=expression();if(take()!==')')throw new Error('MISSING_PAREN');
          const fn={sin:Math.sin,cos:Math.cos,tan:Math.tan,sqrt:Math.sqrt,abs:Math.abs,exp:Math.exp,log:Math.log}[name];
          const v=fn(arg);if(!Number.isFinite(v))throw new Error('DOMAIN_OR_NON_FINITE');return v;
        }
        if(Object.prototype.hasOwnProperty.call(vars,name)){const v=Number(vars[name]);if(!Number.isFinite(v))throw new Error('VARIABLE_NON_FINITE');return v}
        if(Object.prototype.hasOwnProperty.call(consts,name))return consts[name];
        throw new Error('UNKNOWN_IDENTIFIER');
      }
      throw new Error('EXPECTED_PRIMARY');
    }
    function unary(){if(peek()==='+'){take();return unary()}if(peek()==='-'){take();return -unary()}return primary()}
    function power(){let v=unary();if(peek()==='^'){take();const rhs=power();v=Math.pow(v,rhs);if(!Number.isFinite(v))throw new Error('DOMAIN_OR_NON_FINITE')}return v}
    function term(){let v=power();while(peek()==='*'||peek()==='/'){const op=take(),r=power();if(op==='/'&&r===0)throw new Error('DIVISION_BY_ZERO');v=op==='*'?v*r:v/r;if(!Number.isFinite(v))throw new Error('NON_FINITE')}return v}
    function expression(){let v=term();while(peek()==='+'||peek()==='-'){const op=take(),r=term();v=op==='+'?v+r:v-r;if(!Number.isFinite(v))throw new Error('NON_FINITE')}return v}
    const value=expression();if(i!==tokens.length)throw new Error('UNSUPPORTED_SYNTAX');return value;
  }
  function numericEvaluate(input){
    const tokens=tokenize(input.expression),value=parser(tokens,input.variables||{});
    return {status:'OK',data:{value,tokens:tokens.length},exactness:'numerical_approximation',assumptions:input.assumptions||[]};
  }
  function parseExpression(input){
    try{const tokens=tokenize(input.expression);return{status:'OK',data:{tokens,grammar:'safe-arithmetic-v1',functions:[...funcs],maxLength:MAX_EXPR,maxTokens:MAX_TOKENS},exactness:'representation_only'}}catch(e){return{status:'ERROR',error:String(e.message||e),data:null,exactness:'representation_only'}}
  }
  function graphSample(input){
    const expr=String(input.expression||''),min=Number(input.min??-10),max=Number(input.max??10),count=Math.max(8,Math.min(600,Math.round(Number(input.samples||121))));
    if(!Number.isFinite(min)||!Number.isFinite(max)||!(max>min))return{status:'ERROR',error:'INVALID_BOUNDS'};
    const rows=[],gaps=[];let previous=null;
    for(let k=0;k<count;k++){
      const x=min+(max-min)*k/(count-1);let y=null,error=null;
      try{y=parser(tokenize(expr),{x});if(!Number.isFinite(y)){y=null;error='NON_FINITE'}}catch(e){error=String(e.message||e)}
      const row={x,y,error};rows.push(row);
      if(previous&&previous.y!==null&&y!==null){
        const dx=Math.abs(x-previous.x),dy=Math.abs(y-previous.y),scale=Math.max(1,Math.abs(previous.y),Math.abs(y));
        if(dy/scale>1.5&&dy>20*dx)gaps.push(k-1);
      }else if(previous&&(previous.y===null||y===null))gaps.push(k-1);
      previous=row;
    }
    const finite=rows.filter(r=>r.y!==null);
    return{status:'OK',data:{samples:rows,gaps:[...new Set(gaps.filter(i=>i>=0))],bounds:{min,max},accessibleSummary:finite.length?`${finite.length}/${rows.length} mẫu hữu hạn; ${gaps.length} vị trí ngắt/gián đoạn được đánh dấu.`:'Không có mẫu hữu hạn trong miền đã chọn.'},exactness:'numerical_approximation',assumptions:input.assumptions||[]};
  }
  function matrixCompute(input){
    const op=String(input.operation||''),A=input.A,B=input.B;
    const matrix=M=>Array.isArray(M)&&M.length&&M.every(r=>Array.isArray(r)&&r.length===M[0].length&&r.every(v=>Number.isFinite(Number(v))));
    if(!matrix(A))return{status:'ERROR',error:'INVALID_MATRIX_A'};
    if(op==='determinant'){
      if(A.length!==A[0].length)return{status:'ERROR',error:'MATRIX_NOT_SQUARE'};
      if(A.length===1)return{status:'OK',data:{value:Number(A[0][0])},exactness:'numerical_approximation'};
      if(A.length===2)return{status:'OK',data:{value:Number(A[0][0])*Number(A[1][1])-Number(A[0][1])*Number(A[1][0])},exactness:'numerical_approximation'};
      return{status:'UNAVAILABLE',error:'DETERMINANT_SIZE_UNSUPPORTED'};
    }
    if(op==='multiply'){
      if(!matrix(B))return{status:'ERROR',error:'INVALID_MATRIX_B'};
      if(A[0].length!==B.length)return{status:'ERROR',error:'MATRIX_DIMENSION_MISMATCH'};
      const out=A.map((r,i)=>B[0].map((_,j)=>r.reduce((s,v,k)=>s+Number(v)*Number(B[k][j]),0)));
      return{status:'OK',data:{value:out},exactness:'numerical_approximation'};
    }
    return{status:'UNAVAILABLE',error:'MATRIX_OPERATION_UNSUPPORTED'};
  }
  function simulationRun(input){
    const kind=String(input.kind||'fixed_point');
    if(kind!=='fixed_point')return{status:'UNAVAILABLE',error:'SIMULATION_KIND_UNSUPPORTED'};
    const expr=String(input.expression||''),maxIter=Math.max(1,Math.min(500,Math.round(Number(input.maxIterations||50)))),tol=Math.max(0,Number(input.tolerance??1e-8));
    let x=Number(input.initial);if(!Number.isFinite(x))return{status:'ERROR',error:'INVALID_INITIAL_CONDITION'};
    const history=[x];
    for(let i=0;i<maxIter;i++){
      let next;try{next=parser(tokenize(expr),{x})}catch(e){return{status:'ERROR',error:String(e.message||e),data:{iterations:i,history}}}
      if(!Number.isFinite(next))return{status:'ERROR',error:'NON_FINITE_ITERATE',data:{iterations:i,history}};
      history.push(next);
      if(Math.abs(next-x)<=tol)return{status:'OK',data:{converged:true,value:next,iterations:i+1,history},exactness:'numerical_approximation'};
      x=next;
    }
    return{status:'OK',data:{converged:false,value:x,iterations:maxIter,history},exactness:'numerical_approximation',warning:'NON_CONVERGED'};
  }
  function aiCoach(input,context){
    if(!context.approvedProvider)return{status:'UNAVAILABLE',error:'AI_PROVIDER_UNAVAILABLE',data:{fallback:'canonical_hint_or_local_evaluator'}};
    if(context.mode==='exam'&&input.request==='reveal_final')return{status:'ERROR',error:'ANSWER_REVEAL_BLOCKED_BY_POLICY'};
    return{status:'UNAVAILABLE',error:'REMOTE_AI_NOT_BOUND_IN_MATH04_LOCAL_RUNTIME',data:{fallback:'canonical_hint_or_local_evaluator'}};
  }

  register('math.parse.expression',{provider:PROVIDER,providerVersion:VERSION,exactness:'representation_only',offline:true},parseExpression);
  register('math.numeric.evaluate',{provider:PROVIDER,providerVersion:VERSION,exactness:'numerical_approximation',offline:true},numericEvaluate);
  register('math.graph.sample',{provider:PROVIDER,providerVersion:VERSION,exactness:'numerical_approximation',offline:true},graphSample);
  register('math.matrix.compute',{provider:PROVIDER,providerVersion:VERSION,exactness:'numerical_approximation',offline:true},matrixCompute);
  register('math.simulation.run',{provider:PROVIDER,providerVersion:VERSION,exactness:'numerical_approximation',offline:true},simulationRun);
  register('math.symbolic.simplify',{provider:'unbound-symbolic-provider',available:false,unavailableReason:'GENERAL_CAS_NOT_BOUND',exactness:'exact',offline:false},()=>null);
  register('math.symbolic.solve',{provider:'unbound-symbolic-provider',available:false,unavailableReason:'GENERAL_CAS_NOT_BOUND',exactness:'exact',offline:false},()=>null);
  register('math.geometry.render',{provider:'unbound-geometry-provider',available:false,unavailableReason:'GEOMETRY_PROVIDER_NOT_BOUND',exactness:'representation_only',offline:false},()=>null);
  register('math.vector.visualize',{provider:'unbound-vector-provider',available:false,unavailableReason:'VECTOR_VISUAL_PROVIDER_NOT_BOUND',exactness:'representation_only',offline:false},()=>null);
  register('math.ai.coach',{provider:'policy-gated-ai-provider',providerVersion:'unbound',exactness:'advisory',offline:false},aiCoach);

  function selfCheck(){return{release:RELEASE,capabilities:list().length,arbitraryEval:false,generalCAS:false,formalProofVerifier:false,aiMasteryAuthority:false,academicWrites:false,masteryWrites:false,offlineCore:['math.parse.expression','math.numeric.evaluate','math.graph.sample','math.matrix.compute','math.simulation.run'].every(id=>describe(id)?.offline===true)}}
  const api=Object.freeze({release:RELEASE,register,describe,list,invoke,selfCheck,_test:Object.freeze({tokenize,parser})});
  root.BAUMAN_MATH_CAPABILITIES=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
