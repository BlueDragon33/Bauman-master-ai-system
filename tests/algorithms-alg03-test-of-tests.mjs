import assert from "node:assert/strict";
import fs from "node:fs";
import {spawnSync} from "node:child_process";

const base="subjects/algorithms/docs/alg03/";
const correct=JSON.parse(fs.readFileSync(base+"ALG_GOLDEN_CORRECT_SOLUTIONS.json","utf8"));
const wrong=JSON.parse(fs.readFileSync(base+"ALG_GOLDEN_WRONG_SOLUTIONS.json","utf8"));

function py(fixture,args){
 const call="solve("+args.map(x=>JSON.stringify(x)).join(",")+")";
 const src="import json\n"+fixture.pythonSource+"\nprint(json.dumps("+call+", sort_keys=True))\n";
 const r=spawnSync("python3",["-I","-c",src],{encoding:"utf8",timeout:3000});
 if(r.error)return {ok:false,error:String(r.error)};
 if(r.status!==0)return {ok:false,error:(r.stderr||"").trim(),status:r.status};
 try{return {ok:true,value:JSON.parse(r.stdout.trim())};}catch(e){return {ok:false,error:"bad json "+r.stdout};}
}
function validBinary(result,a,target){
 if(!result.ok)return false;
 const i=result.value;
 if(i===-1)return !a.includes(target);
 return Number.isInteger(i)&&i>=0&&i<a.length&&a[i]===target;
}
function stableSorted(result,input){
 if(!result.ok||!Array.isArray(result.value))return false;
 const out=result.value;
 if(out.length!==input.length)return false;
 const canon=x=>JSON.stringify(x);
 const a=[...input].map(canon).sort(),b=[...out].map(canon).sort();
 if(JSON.stringify(a)!==JSON.stringify(b))return false;
 for(let i=1;i<out.length;i++)if(out[i-1][0]>out[i][0])return false;
 const positions=new Map();
 for(const x of input){const k=String(x[0]);if(!positions.has(k))positions.set(k,[]);positions.get(k).push(x[1]);}
 const seen=new Map();
 for(const x of out){const k=String(x[0]);if(!seen.has(k))seen.set(k,[]);seen.get(k).push(x[1]);}
 for(const [k,v] of positions)if(JSON.stringify(v)!==JSON.stringify(seen.get(k)))return false;
 return true;
}
function bfsValid(result,expected){
 if(!result.ok||typeof result.value!=="object")return false;
 return JSON.stringify(result.value)===JSON.stringify(expected);
}
function reachableValid(result,expected){
 if(!result.ok||!Array.isArray(result.value))return false;
 return JSON.stringify([...result.value].sort())===JSON.stringify([...expected].sort());
}

const correctImpl=correct.fixtures.filter(x=>x.kind==="implementation");
const wrongImpl=wrong.fixtures.filter(x=>x.kind==="implementation");
const outcomes=[];

for(const f of correctImpl){
 let pass=false;
 if(f.algorithmId==="alg.algorithm.binary-search"){
  const cases=[
   [[],5],[[7],7],[[7],6],[[1,3,5,7],1],[[1,3,5,7],7],[[1,3,5,7],9],[[1,2,2,2,5],2]
  ];
  pass=cases.every(([a,t])=>validBinary(py(f,[a,t]),a,t));
 }else if(["alg.algorithm.insertion-sort","alg.algorithm.merge-sort"].includes(f.algorithmId)){
  const cases=[[],[[2,"a"]],[[2,"a"],[1,"x"],[2,"b"],[1,"y"]],[[1,"a"],[1,"b"],[1,"c"]],[[3,"a"],[2,"b"],[1,"c"]]];
  pass=cases.every(items=>stableSorted(py(f,[items]),items));
 }else if(f.algorithmId==="alg.algorithm.bfs"){
  pass=
   bfsValid(py(f,[{A:["B"],B:[],C:["D"],D:[]},"A"]),{A:0,B:1}) &&
   bfsValid(py(f,[{A:["B"],B:["C"],C:["A"]},"A"]),{A:0,B:1,C:2}) &&
   bfsValid(py(f,[{A:["B","C"],B:["D"],C:["D"],D:[]},"A"]),{A:0,B:1,C:1,D:2});
 }else if(f.algorithmId==="alg.algorithm.dfs"){
  pass=
   reachableValid(py(f,[{A:["B","C"],B:["D"],C:[],D:[]},"A"]),["A","B","C","D"]) &&
   reachableValid(py(f,[{A:["B"],B:["C"],C:["A"],Z:[]},"A"]),["A","B","C"]);
 }
 assert.equal(pass,true,"known-correct implementation rejected: "+f.id);
 outcomes.push({id:f.id,expected:"PASS",observed:"PASS"});
}

for(const f of wrongImpl){
 let improperlyAccepted=false;
 if(f.algorithmId==="alg.algorithm.binary-search"){
  const cases=[
   [[1,3,5,7],9],
   [[1,3,5,7],4],
   [[],5]
  ];
  improperlyAccepted=cases.every(([a,t])=>validBinary(py(f,[a,t]),a,t));
 }else if(f.algorithmId==="alg.algorithm.insertion-sort"&&f.id.includes("deduplicates")){
  const items=[[1,"a"],[1,"a"],[0,"z"]];
  improperlyAccepted=stableSorted(py(f,[items]),items);
 }else if(f.algorithmId==="alg.algorithm.insertion-sort"&&f.id.includes("unstable")){
  const items=[[2,"a"],[1,"x"],[2,"b"],[1,"y"]];
  improperlyAccepted=stableSorted(py(f,[items]),items);
 }else if(f.algorithmId==="alg.algorithm.dfs"){
  improperlyAccepted=reachableValid(py(f,[{A:["B","C"],B:["D"],C:[],D:[]},"A"]),["A","B","C","D"]);
 }
 assert.equal(improperlyAccepted,false,"known-wrong implementation accepted: "+f.id);
 outcomes.push({id:f.id,expected:"FAIL",observed:"FAIL"});
}

const bsCorrect=correctImpl.filter(x=>x.algorithmId==="alg.algorithm.binary-search");
assert.ok(bsCorrect.length>=2,"need alternate correct binary-search implementations");
assert.ok(bsCorrect.some(x=>x.alternate===true),"alternate-valid solution fixture missing");

assert.ok(correct.fixtures.some(x=>x.kind==="reasoning"&&x.id.includes("bst-complexity")));
assert.ok(wrong.fixtures.some(x=>x.kind==="reasoning"&&x.id.includes("bst-always-logn")));
assert.ok(wrong.fixtures.some(x=>x.kind==="reasoning"&&x.id.includes("bigo-from-stopwatch")));

console.log(JSON.stringify({schema:"ALG03_TEST_OF_TESTS_V1",status:"PASS",executedImplementationFixtures:outcomes.length,knownCorrectAccepted:correctImpl.length,knownWrongRejected:wrongImpl.length,alternateCorrectAccepted:true,outcomes},null,2));
