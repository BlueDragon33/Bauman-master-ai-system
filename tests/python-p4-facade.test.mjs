import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

test('Programming owns the facade and stale results are quarantined', async()=>{
  assert.ok(fs.existsSync('subjects/programming/assets/python-runtime.js'), 'Programming execution facade missing');
  let resolveFirst;
  const sandbox={window:{SUBJECT_ADAPTER:{id:'programming'}},location:{hostname:'127.0.0.1'},
    AbortController,setTimeout,clearTimeout,crypto:globalThis.crypto,
    fetch:async(_url,options)=>{
      const input=JSON.parse(options.body);
      if(input.code==='old')return new Promise(resolve=>{resolveFirst=()=>resolve({ok:true,json:async()=>({...input,status:'completed',officialEvidence:false})});});
      return {ok:true,json:async()=>({...input,status:'completed',officialEvidence:false})};
    }};
  vm.runInNewContext(fs.readFileSync('subjects/programming/assets/python-runtime.js','utf8'),sandbox);
  const facade=sandbox.window.SUBJECT_ADAPTER.pythonRuntime;
  const first=facade.run({code:'old',taskId:'practice'});
  const second=await facade.run({code:'new',taskId:'practice'});
  resolveFirst();
  assert.equal((await first).status,'stale_result');
  assert.equal(second.status,'completed');
  sandbox.location.hostname='learn.example.test';
  assert.equal((await facade.run({code:'pass'})).status,'provider_unavailable');
});

test('older UI response cannot replace the newer hint evidence', async()=>{
  const elements=new Map();
  for(const id of ['pythonRun','pythonCode','pythonMode','pythonFiles','pythonStdin','pythonCancel','pythonRestart','pythonDownload','pythonStatus','pythonOutput','pythonException','pythonIdentity','pythonTests','pythonAdvice','pythonHint']) {
    elements.set(id,{value:id==='pythonFiles'?'{}':id==='pythonMode'?'run':'',dataset:{},textContent:'',handlers:{},addEventListener(name,fn){this.handlers[name]=fn;}});
  }
  const sandbox={window:{SUBJECT_ADAPTER:{id:'programming'}},document:{getElementById:id=>elements.get(id)},location:{hostname:'127.0.0.1'},AbortController,setTimeout,clearTimeout,crypto:globalThis.crypto};
  vm.runInNewContext(fs.readFileSync('subjects/programming/assets/python-runtime.js','utf8'),sandbox);
  const real=sandbox.window.SUBJECT_ADAPTER.pythonRuntime;
  const pending=[];
  sandbox.window.SUBJECT_ADAPTER.pythonRuntime={...real,run:()=>new Promise(resolve=>pending.push(resolve))};
  vm.runInNewContext(fs.readFileSync('subjects/programming/assets/python-lab.js','utf8'),sandbox);
  const first=elements.get('pythonRun').handlers.click();
  const second=elements.get('pythonRun').handlers.click();
  pending[1]({status:'runtime_error',exception:{type:'NameError'}});
  await second;
  pending[0]({status:'stale_result'});
  await first;
  elements.get('pythonHint').handlers.click();
  assert.match(elements.get('pythonAdvice').textContent,/tên biến/);
});
