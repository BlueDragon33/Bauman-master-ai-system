import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('default companion keeps learner execution disabled pending exact-head acceptance', async()=>{
  const {createPythonServer}=await import('../runtime/python/server.mjs');
  const server=createPythonServer();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  try {
    const health=await (await fetch(base+'/health')).json();
    assert.equal(health.learnerExecutionEnabled,false);
    const response=await fetch(base+'/api/python/run',{method:'POST',headers:{origin:'http://127.0.0.1:3005','content-type':'application/json'},body:JSON.stringify({code:"print('MUST_NOT_EXECUTE')"})});
    assert.equal(response.status,403);
    assert.equal((await response.json()).status,'acceptance_pending');
  } finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('local provider enforces origin, JSON and size boundaries', async () => {
  assert.ok(fs.existsSync('runtime/python/server.mjs'), 'local provider HTTP boundary missing');
  const { createPythonServer } = await import('../runtime/python/server.mjs');
  const server = createPythonServer({acceptance:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  try {
    assert.equal((await fetch(base + '/health')).status, 200);
    assert.equal((await fetch(base + '/api/python/run',{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'},body:'{}'})).status,403);
    assert.equal((await fetch(base + '/api/python/run',{method:'POST',headers:{origin:'http://127.0.0.1:3005','content-type':'text/plain'},body:'{}'})).status,415);
    assert.equal((await fetch(base + '/api/python/run',{method:'POST',headers:{origin:'http://127.0.0.1:3005','content-type':'application/json'},body:'x'.repeat(70000)})).status,413);
    const r = await fetch(base + '/api/python/run',{method:'POST',headers:{origin:'http://127.0.0.1:3005','content-type':'application/json'},body:JSON.stringify({runId:'http-probe',code:'print(42)'})});
    assert.equal(r.status,200);
    assert.equal((await r.json()).stdout, '42\n');
  } finally { server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); }
});
