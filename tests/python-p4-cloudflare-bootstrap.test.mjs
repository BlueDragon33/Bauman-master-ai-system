import assert from 'node:assert/strict';
import test from 'node:test';
import {spawnSync} from 'node:child_process';

test('Python 3.14 bootstrap closes inherited descriptors above 1024 before code',()=>{
  // Public OS metadata is a synthetic outside-root sentinel, never a secret.
  // This launcher is trusted test scaffolding; learner code runs only in jail.
  const launcher="import os; fd=os.open('/etc/os-release',os.O_RDONLY); os.dup2(fd,2048,inheritable=True); os.execv('/usr/local/bin/python',['python','-s','-P','/runner.py'])";
  const code="import os\ntry: os.read(2048,64)\nexcept OSError as e: assert e.errno == 9; print('closed')\nelse: raise Exception('inherited descriptor escaped jail')";
  const args=['--host=unix:///var/run/docker.sock','run','--rm','-i','--network','none','--read-only',
    '--cap-drop','ALL','--cap-add','SYS_CHROOT','--cap-add','SETUID','--cap-add','SETGID',
    '--security-opt','no-new-privileges','--memory','256m','--memory-swap','256m','--cpus','0.25','--pids-limit','2',
    '--tmpfs','/workspace:rw,noexec,nosuid,nodev,size=8m,mode=755,uid=65534,gid=65534',
    '--entrypoint','/usr/bin/env','bauman-python04-cf-spike:3.14.8','-i','PATH=/usr/local/bin:/usr/bin:/bin','PYTHONHASHSEED=0','/usr/local/bin/python','-s','-P','-c',launcher];
  const output=spawnSync('docker',args,{input:JSON.stringify({cells:[code]}),encoding:'utf8',timeout:15000,maxBuffer:150000});
  assert.equal(output.status,0,output.stderr);
  const result=JSON.parse(output.stdout);
  assert.equal(result.status,'completed',JSON.stringify(result));
  assert.equal(result.stdout,'closed\n');
});
