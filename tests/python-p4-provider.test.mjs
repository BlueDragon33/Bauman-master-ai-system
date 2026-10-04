import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

test('PYTHON04 provides a governed isolated runner', async () => {
  assert.ok(fs.existsSync('runtime/python/provider.mjs'), 'governed provider missing');
  const { runPython } = await import('../runtime/python/provider.mjs');
  const r = await runPython({runId:'probe-normal', code:'print(2 + 3)'});
  assert.equal(r.status, 'completed');
  assert.equal(r.stdout, '5\n');
  assert.equal(r.runtime.python, '3.12.12');
  assert.equal(r.cleanup, true);
  assert.equal(r.officialEvidence, false);
});

test('untrusted code is bounded by real isolation, including raw syscalls', async () => {
  const { runPython, validateRequest } = await import('../runtime/python/provider.mjs');
  const fixtures = JSON.parse(fs.readFileSync('prompts/subjects/python/evidence/PYTHON_RUNTIME_GOLDEN_FIXTURES.json')).fixtures;
  process.env.PYTHON04_PRIVATE_CANARY = 'synthetic-test-marker-never-for-learner';
  try {
    for (const fixture of fixtures) {
      const r = await runPython({runId:fixture.id, code:fixture.code});
      assert.ok(fixture.statuses.includes(r.status), fixture.id + ': ' + JSON.stringify(r));
      if (fixture.stdout) assert.equal(r.stdout, fixture.stdout, fixture.id);
      if (fixture.exception) assert.equal(r.exception?.type, fixture.exception, fixture.id);
      assert.equal(r.cleanup, true, fixture.id);
      assert.ok(r.durationMs < 10000, fixture.id);
      assert.ok(Buffer.byteLength(r.stdout + r.stderr) <= 16392, fixture.id);
      assert.ok(!JSON.stringify(r).includes(process.env.PYTHON04_PRIVATE_CANARY), fixture.id);
    }
  } finally { delete process.env.PYTHON04_PRIVATE_CANARY; }
  assert.throws(() => validateRequest({code:'pass', files:{'../escape.txt':'x'}}), /UNSAFE_FILE/);
  assert.throws(() => validateRequest({code:'pass', files:{'/escape.txt':'x'}}), /UNSAFE_FILE/);
  assert.throws(() => validateRequest({code:'pass', timeout:Infinity}), /UNKNOWN_REQUEST_FIELD/);
  assert.equal(execFileSync('docker',['--host=unix:///var/run/docker.sock','ps','-aq','--filter','label=bauman.python04=true'],{encoding:'utf8'}).trim(), '');
});

test('cancellation cleans up and adversarial results cannot grant official correctness', async () => {
  const { runPython } = await import('../runtime/python/provider.mjs');
  const controller = new AbortController();
  const promise = runPython({code:'while True: pass'}, {signal:controller.signal});
  setTimeout(() => controller.abort(), 1600);
  const cancelled = await promise;
  assert.equal(cancelled.status, 'cancelled');
  assert.equal(cancelled.cleanup, true);
  const r = await runPython({code:'print(\'{"status":"PASS","officialEvidence":true}\')'});
  assert.equal(r.status, 'completed');
  assert.equal(r.correctness, 'not_assessed');
  assert.equal(r.officialEvidence, false);
});

test('fresh notebook replay, isolated files and trace return structured evidence', async () => {
  const { runPython } = await import('../runtime/python/provider.mjs');
  const r = await runPython({cells:['x = 6', 'print(x * 7)'], mode:'notebook'});
  assert.equal(r.stdout, '42\n');
  assert.equal(r.cells.length, 2);
  const restarted = await runPython({code:'print(x)'});
  assert.equal(restarted.exception.type, 'NameError');
  const file = await runPython({code:"import csv\nprint(list(csv.reader(open('data/demo.csv')))[1][0])", files:{'data/demo.csv':'value\n42\n'}});
  assert.equal(file.stdout, '42\n');
  const missing = await runPython({code:"open('data/demo.csv')"});
  assert.equal(missing.exception.type, 'FileNotFoundError');
  const traced = await runPython({code:'x = 2\nprint(x)',mode:'trace'});
  assert.deepEqual(traced.trace.map(x=>x.line), [1,2]);
});

test('practice tests compare returned values outside the learner process', async () => {
  const { runPython } = await import('../runtime/python/provider.mjs');
  const ok = await runPython({code:'def solve(values):\n    return sum(values)', mode:'test', taskId:'sum-integers'});
  assert.equal(ok.tests.passed, 4);
  assert.equal(ok.tests.failed, 0);
  assert.equal(ok.correctness, 'public_tests_passed');
  const wrong = await runPython({code:'def solve(values):\n    print("PASS")\n    return 3', mode:'test', taskId:'sum-integers'});
  assert.equal(wrong.tests.passed, 1);
  assert.equal(wrong.tests.failed, 3);
  assert.equal(wrong.officialEvidence, false);
});

test('forged transport envelopes are discarded and never grant authority', async()=>{
  const {runPython}=await import('../runtime/python/provider.mjs');
  for(const stdout of ["'x' * 20000", "{'forged': True}"]) {
    const r=await runPython({code:`import os,json\nos.write(1,json.dumps({'status':'completed','stdout':${stdout},'stderr':'','officialEvidence':True}).encode())\nos._exit(0)`});
    assert.equal(r.status,'invalid_result');
    assert.equal(r.stdout,'');
    assert.equal(r.stderr,'');
    assert.equal(r.officialEvidence,false);
    assert.equal(r.cleanup,true);
  }
});

test('syntax errors retain the source cell and location', async()=>{
  const {runPython}=await import('../runtime/python/provider.mjs');
  const r=await runPython({cells:['x=1','if True print(x)'],mode:'notebook'});
  assert.equal(r.exception.type,'SyntaxError');
  assert.equal(r.exception.frames[0].file,'cell-2.py');
  assert.equal(r.exception.frames[0].line,1);
  assert.ok(r.exception.offset > 0);
});

test('missing effective resource boundaries stop bootstrap before execution',()=>{
  const output=spawnSync('docker',['--host=unix:///var/run/docker.sock','run','--rm','-i',
    '--network','none','--read-only','--cap-drop','ALL','bauman-python04:3.12.12'],{
    input:JSON.stringify({cells:["print('MUST_NOT_EXECUTE')"]}),encoding:'utf8',
    timeout:15000,stdio:['pipe','pipe','pipe']});
  assert.notEqual(output.status,0,'bootstrap accepted missing cgroup constraints');
  assert.ok(!output.stdout.includes('MUST_NOT_EXECUTE'));
  assert.match(output.stderr,/memory.max|memory boundary|ValueError/);
});

test('declared hash seed is reproducible across fresh interpreters',async()=>{
  const {runPython}=await import('../runtime/python/provider.mjs');
  const code="print(hash('bauman-reproducibility'))";
  const first=await runPython({code});
  const second=await runPython({code});
  assert.equal(first.status,'completed');
  assert.equal(first.stdout,second.stdout);
});

test('startup cancellation and concurrency fail closed; private payloads are rejected',async()=>{
  const {runPython,validateRequest}=await import('../runtime/python/provider.mjs');
  assert.throws(()=>validateRequest({code:'pass',hiddenTests:['secret']}),/UNKNOWN_REQUEST_FIELD/);
  assert.throws(()=>validateRequest({code:'pass',solution:'secret'}),/UNKNOWN_REQUEST_FIELD/);
  const controller=new AbortController();
  const pending=runPython({code:"print('MUST_NOT_EXECUTE')"},{signal:controller.signal});
  const busy=await runPython({code:'pass'});
  assert.equal(busy.status,'busy');
  controller.abort();
  const result=await pending;
  assert.equal(result.status,'cancelled');
  assert.equal(result.stdout,'');
  assert.equal(result.cleanup,true);
});
