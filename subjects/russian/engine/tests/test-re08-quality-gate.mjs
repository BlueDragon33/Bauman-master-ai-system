import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {validateEngineQuality} from '../quality/engine-quality-gate.mjs';

const root=new URL('..',import.meta.url);
const readJson=rel=>JSON.parse(fs.readFileSync(new URL(rel,root),'utf8'));

function walk(dir){
  const out={};
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()){
      if(entry.name==='tests')continue;
      Object.assign(out,walk(full));
    }else if(/\.(mjs|js)$/.test(entry.name)){
      out[path.relative(process.cwd(),full)]=fs.readFileSync(full,'utf8');
    }
  }
  return out;
}

const levels=readJson('./content/levels/levels.v1.json');
const graph=readJson('./content/graph/reference-graph.v1.json');
const commercial=readJson('./product/commercial-contract.v1.json');
const failures=readJson('./quality/failure-matrix.v1.json');
const sourceFiles=walk(path.resolve('subjects/russian/engine'));

const result=validateEngineQuality({
  levelCatalog:levels,
  referenceGraph:graph,
  commercialContract:commercial,
  failureMatrix:failures,
  sourceFiles
});

assert.equal(result.ok,true,result.errors.join('; '));
assert.equal(result.summary.levels,100);
assert.equal(result.summary.bands,10);
assert(result.summary.graphNodes>=11);
assert(result.summary.failureCases>=18);
assert(result.summary.sourceFilesScanned>=8);
assert.equal(result.warnings.length,0);

const badCommercial=structuredClone(commercial);
badCommercial.analytics.rawVoiceDefault='COLLECT';
assert.equal(validateEngineQuality({levelCatalog:levels,referenceGraph:graph,commercialContract:badCommercial,failureMatrix:failures,sourceFiles}).ok,false);

const badSource={...sourceFiles,'bad.mjs':'eval("x")'};
const badSecurity=validateEngineQuality({levelCatalog:levels,referenceGraph:graph,commercialContract:commercial,failureMatrix:failures,sourceFiles:badSource});
assert.equal(badSecurity.ok,false);
assert(badSecurity.errors.some(x=>x.includes('eval(')));

console.log(JSON.stringify({
  ok:true,
  levels:result.summary.levels,
  bands:result.summary.bands,
  graphNodes:result.summary.graphNodes,
  failureCases:result.summary.failureCases,
  sourceFilesScanned:result.summary.sourceFilesScanned,
  securityNegativeTest:true,
  privacyNegativeTest:true
}));
