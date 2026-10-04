import { spawn } from 'node:child_process';
import { randomUUID, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const IMAGE = 'bauman-python04:3.12.12';
export const POLICY = Object.freeze({ memoryBytes: 134217728, addressSpaceBytes: 100663296,
  cpuSoftSeconds: 2, cpuHardSeconds: 3, wallMs: 5000, outputBytes: 16384, filesBytes: 16384, concurrency: 1 });
const dockerArgs = ['--host=unix:///var/run/docker.sock'];
const dockerEnv = { ...process.env };
for (const name of ['DOCKER_HOST','DOCKER_CONTEXT','DOCKER_TLS','DOCKER_TLS_VERIFY','DOCKER_CERT_PATH']) delete dockerEnv[name];

export function validateRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('INVALID_REQUEST');
  const allowed = new Set(['runId','taskId','sessionId','code','cells','stdin','files','mode']);
  if (Object.keys(input).some(k => !allowed.has(k))) throw new Error('UNKNOWN_REQUEST_FIELD');
  for (const key of ['runId','taskId','sessionId']) {
    if (input[key] !== undefined && (typeof input[key] !== 'string' || !/^[\w.-]{1,80}$/.test(input[key]))) throw new Error('INVALID_ID');
  }
  const cells = input.cells === undefined ? [input.code] : input.cells;
  if (!Array.isArray(cells) || cells.length < 1 || cells.length > 12 || cells.some(c => typeof c !== 'string') || Buffer.byteLength(cells.join('')) > 16384) throw new Error('INVALID_CODE');
  if (input.stdin !== undefined && (typeof input.stdin !== 'string' || Buffer.byteLength(input.stdin) > 8192)) throw new Error('INVALID_STDIN');
  if (input.mode !== undefined && !['run','trace','notebook','test'].includes(input.mode)) throw new Error('INVALID_MODE');
  if (input.mode === 'test' && input.taskId !== 'sum-integers') throw new Error('UNKNOWN_PUBLIC_TASK');
  const files = input.files ?? {};
  if (typeof files !== 'object' || Array.isArray(files) || files === null || Object.keys(files).length > 8) throw new Error('INVALID_FILES');
  let size = 0;
  for (const [name, content] of Object.entries(files)) {
    if (!/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\.[A-Za-z0-9]{1,8}$/.test(name) || name.length > 120 || name.startsWith('cell-') || typeof content !== 'string') throw new Error('UNSAFE_FILE');
    size += Buffer.byteLength(content);
  }
  if (size > POLICY.filesBytes) throw new Error('FILES_TOO_LARGE');
  return { runId: input.runId || randomUUID(), taskId: input.taskId || 'practice',
    sessionId: input.sessionId || 'local', cells, stdin: input.stdin || '', files,
    mode: input.mode || 'run' };
}

function command(args, { input, signal, onChunk, onErrorChunk } = {}) {
  return new Promise(resolve => {
    const p = spawn('docker', [...dockerArgs, ...args], { env: dockerEnv, stdio: ['pipe','pipe','pipe'] });
    let stdout = '', stderr = '';
    p.on('error', e => resolve({ code: -1, stdout, stderr: e.message }));
    p.stdout.on('data', data => { if (onChunk) onChunk(data); else stdout += data.toString(); });
    p.stderr.on('data', data => { onErrorChunk?.(data); stderr = (stderr + data.toString()).slice(0, 2048); });
    p.stdin.on('error', () => {});
    const abort = () => p.kill('SIGTERM');
    signal?.addEventListener('abort', abort, { once: true });
    const timeout = setTimeout(() => p.kill('SIGKILL'), 15000);
    p.on('close', code => { clearTimeout(timeout); signal?.removeEventListener('abort', abort); resolve({ code, stdout, stderr }); });
    p.stdin.end(input);
  });
}

let active = false;
export async function runPython(input, { signal } = {}) {
  const request = validateRequest(input);
  const name = 'bauman-python04-' + randomUUID();
  const base = { runId: request.runId, taskId: request.taskId, sessionId: request.sessionId,
    provider: 'local-docker-chroot-seccomp', runtime: { python:'3.12.12', environment:'python04-stdlib-v1' },
    policy: POLICY, stdout:'', stderr:'', exception:null, trace:[], cells:[],
    officialEvidence:false, correctness:'not_assessed', truncated:false, cleanup:false };
  if (active) return { ...base, status:'busy', cleanup:true };
  if (signal?.aborted) return { ...base, status:'cancelled', cleanup:true };
  active = true;
  let status = '', text = '', bytes = 0, errorBytes = 0;
  let result, createAttempted = false;
  const started = Date.now();
  const kill = async reason => { if (status) return; status = reason; await command(['kill', name]); };
  const abort = () => { void kill('cancelled'); };
  signal?.addEventListener('abort', abort, { once:true });
  let timer;
  try {
    const imageResult = await command(['image','inspect',IMAGE]);
    const image = JSON.parse(imageResult.stdout || '[]')[0];
    const hash = name => createHash('sha256').update(readFileSync(new URL(name,import.meta.url))).digest('hex');
    if (!image || image.Config?.Labels?.['bauman.python04.source'] !== hash('sandbox.py') || image.Config?.Labels?.['bauman.python04.recipe'] !== hash('Dockerfile')) {
      return result = {...base,status:'provider_unavailable',cleanup:true};
    }
    base.runtime.imageId = image.Id;
    createAttempted = true;
    const created = await command(['create', '--name', name, '--label', 'bauman.python04=true',
      '--network', 'none', '--read-only', '--cap-drop', 'ALL', '--cap-add', 'SYS_CHROOT',
      '--cap-add', 'SETUID', '--cap-add', 'SETGID', '--security-opt', 'no-new-privileges',
      '--memory', '128m', '--memory-swap', '128m', '--cpus', '0.5', '--pids-limit', '1',
      '--tmpfs', '/workspace:rw,noexec,nosuid,nodev,size=8m,mode=755,uid=65534,gid=65534',
      '--log-driver', 'none', '-i', image.Id]);
    if (created.code !== 0) return result = { ...base, status:'provider_unavailable', durationMs:Date.now()-started };
    if (signal?.aborted) status = 'cancelled';
    if (!status) {
      timer = setTimeout(() => { void kill('timeout'); }, POLICY.wallMs);
      const publicInputs = request.mode === 'test' ? [[],[1,2],[-3,3],[4,5,6]] : undefined;
      await command(['start', '-a', '-i', name], { input:JSON.stringify({...request,publicInputs}), onChunk:data => {
        bytes += data.length;
        if (bytes > 131072) { void kill('output_limit'); return; }
        text += data.toString();
      }, onErrorChunk:data=>{
        errorBytes += data.length;
        if (errorBytes > POLICY.outputBytes) void kill('output_limit');
      }});
      clearTimeout(timer);
    }
    const inspected = await command(['inspect','--format','{{json .State}}',name]);
    const state = JSON.parse(inspected.stdout || '{}');
    if (!status && state.OOMKilled) status = 'memory_limit';
    if (!status && [137,152].includes(state.ExitCode)) status = 'timeout';
    let payload = {};
    if (!status) {
      try {
        payload = JSON.parse(text);
        if (!['completed','runtime_error','memory_limit','output_limit'].includes(payload.status) || typeof payload.stdout !== 'string' || typeof payload.stderr !== 'string' || Buffer.byteLength(payload.stdout + payload.stderr) > POLICY.outputBytes + 8) throw new Error();
        status = payload.status;
      } catch { status = 'invalid_result'; payload = {}; }
    }
    // The learner process is adversarial. Never accept runtime identity,
    // policy, official evidence, correctness, or mastery claims from it.
    const location = value => ({file:typeof value?.file==='string' && /^cell-\d+\.py$/.test(value.file)?value.file:'untrusted',line:Number.isSafeInteger(value?.line) && value.line > 0?value.line:null});
    const exception = payload.exception && typeof payload.exception==='object' ? {
      type:String(payload.exception.type || 'Exception').slice(0,80),
      message:String(payload.exception.message || '').slice(0,1000),
      offset:Number.isSafeInteger(payload.exception.offset) && payload.exception.offset > 0?payload.exception.offset:null,
      frames:Array.isArray(payload.exception.frames)?payload.exception.frames.slice(0,20).map(location):[]
    } : null;
    const tests = request.mode === 'test' ? [0,3,0,15].map((expected,i)=>({id:'public-' + (i+1),visibility:'public',status:status==='completed' && payload.values?.[i]===expected?'passed':'failed'})) : null;
    return result = { ...base, status, stdout:payload.stdout || '', stderr:payload.stderr || '',
      exception, trace:Array.isArray(payload.trace)?payload.trace.slice(0,100).map(location):[],
      cells:Array.isArray(payload.cells)?payload.cells.slice(0,12).map((_c,i)=>({index:i,status:'reported_completed'})):[],
      truncated:status==='output_limit' || payload.truncated===true, durationMs:Date.now()-started,
      ...(tests ? {tests:{passed:tests.filter(t=>t.status==='passed').length,failed:tests.filter(t=>t.status==='failed').length,cases:tests},correctness:tests.every(t=>t.status==='passed')?'public_tests_passed':'public_tests_failed'} : {}) };
  } catch {
    return result = {...base,status:'provider_error',durationMs:Date.now()-started};
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
    const removed = createAttempted ? await command(['rm','-f',name]) : {code:0};
    if (result) {
      result.cleanup = removed.code === 0;
      if (!result.cleanup) {
        const absent = await command(['inspect',name]);
        result.cleanup = absent.code !== 0 && /No such (object|container)/.test(absent.stderr);
      }
      if (!result.cleanup) result.status = 'cleanup_failed';
    }
    active = result?.cleanup !== true;
  }
}
