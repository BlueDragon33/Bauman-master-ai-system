import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';

test('unverifiable cleanup blocks subsequent runs instead of reusing a workspace',()=>{
  const dir=mkdtempSync(join(tmpdir(),'python04-cleanup-'));
  const marker=join(dir,'container-name');
  // Trusted CLI fault injection only; actual code still runs in the real Docker
  // sandbox. The wrapper never substitutes a host interpreter for a learner.
  writeFileSync(join(dir,'docker'),`#!/bin/sh
if [ "$2" = rm ]; then
  printf '%s' "$4" > "$PYTHON04_TEST_MARKER"
  printf 'injected cleanup transport failure' >&2
  exit 1
fi
if [ "$2" = inspect ] && [ "$3" != --format ]; then
  printf 'injected inability to verify container removal' >&2
  exit 1
fi
exec /usr/local/bin/docker "$@"
`,{mode:0o700});
  try {
    const child=spawnSync(process.execPath,['--input-type=module','-e',`
      import {runPython} from './runtime/python/provider.mjs';
      const first=await runPython({code:'print(42)'});
      const next=await runPython({code:'pass'});
      console.log(JSON.stringify({first: first.status,cleanup:first.cleanup,next:next.status}));
    `],{encoding:'utf8',timeout:30000,env:{...process.env,PATH:dir+':'+process.env.PATH,PYTHON04_TEST_MARKER:marker}});
    assert.equal(child.status,0,child.stderr);
    assert.deepEqual(JSON.parse(child.stdout),{first:'cleanup_failed',cleanup:false,next:'busy'});
  } finally {
    try {
      const name=readFileSync(marker,'utf8');
      assert.match(name,/^bauman-python04-[a-f0-9-]+$/);
      execFileSync('/usr/local/bin/docker',['--host=unix:///var/run/docker.sock','rm','-f',name],{stdio:'pipe'});
    } finally {rmSync(dir,{recursive:true,force:true});}
  }
});
