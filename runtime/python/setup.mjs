import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const hash = file => createHash('sha256').update(readFileSync(root + file)).digest('hex');
const env = {...process.env, DOCKER_BUILDKIT:'0'};
for (const key of ['DOCKER_HOST','DOCKER_CONTEXT','DOCKER_TLS','DOCKER_TLS_VERIFY','DOCKER_CERT_PATH']) delete env[key];
const r = spawnSync('docker', ['--host=unix:///var/run/docker.sock','build','--network','none',
  '--label','bauman.python04.source=' + hash('sandbox.py'),
  '--label','bauman.python04.recipe=' + hash('Dockerfile'),
  '-t','bauman-python04:3.12.12',root], {env,stdio:'inherit'});
process.exit(r.status ?? 1);
