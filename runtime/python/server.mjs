import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { runPython, POLICY } from './provider.mjs';

const origins = new Set(['http://127.0.0.1:3005','http://localhost:3005']);
export function createPythonServer({acceptance=false}={}) {
  const server = createServer(async (req,res) => {
    const origin = req.headers.origin;
    const headers = {'content-type':'application/json','cache-control':'no-store',
      'x-content-type-options':'nosniff','access-control-allow-methods':'GET, POST, OPTIONS',
      'access-control-allow-headers':'content-type',vary:'Origin'};
    if (origins.has(origin)) headers['access-control-allow-origin'] = origin;
    const send = (status,body) => { if (!res.destroyed) { res.writeHead(status,headers); res.end(JSON.stringify(body)); } };
    const host = req.headers.host || '';
    if (!['127.0.0.1','localhost'].some(h=>host === h + ':' + server.address().port)) return send(403,{status:'untrusted_host'});
    if (origin && !origins.has(origin)) return send(403,{status:'untrusted_origin'});
    if (req.method==='OPTIONS' && origins.has(origin)) return send(204,{});
    if (req.url === '/health' && req.method === 'GET') return send(200,{provider:'local-docker-chroot-seccomp', policy:POLICY, learnerExecutionEnabled:false, acceptanceHarness:acceptance, officialAssessment:false, offlineExecution:false});
    if (req.url !== '/api/python/run' || req.method !== 'POST') return send(404,{status:'not_found'});
    if (!origins.has(origin)) return send(403,{status:'untrusted_origin'});
    if (!acceptance) return send(403,{status:'acceptance_pending',officialEvidence:false});
    if (!req.headers['content-type']?.startsWith('application/json')) return send(415,{status:'json_required'});
    const controller = new AbortController();
    res.on('close',()=>{if (!res.writableFinished) controller.abort();});
    let size=0,parts=[],ended=false;
    const bodyTimer = setTimeout(()=>{ended=true;controller.abort();send(408,{status:'request_timeout'});},3000);
    req.on('data', chunk=>{
      if (ended) return;
      size += chunk.length;
      if (size > 65536) { ended=true; clearTimeout(bodyTimer); parts=[]; send(413,{status:'request_too_large'}); }
      else parts.push(chunk);
    });
    req.on('error',()=>{clearTimeout(bodyTimer);controller.abort();});
    req.on('end',async()=>{
      clearTimeout(bodyTimer);
      if (ended) return;
      try {
        const input=JSON.parse(Buffer.concat(parts).toString());
        const result=await runPython(input,{signal:controller.signal});
        send(200,result);
      } catch { send(400,{status:'invalid_request'}); }
    });
  });
  server.requestTimeout=10000;
  server.headersTimeout=10000;
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server=createPythonServer({acceptance:process.argv.includes('--acceptance')});
  server.listen(4414,'127.0.0.1',()=>console.log('PYTHON04 loopback companion; learner execution disabled; acceptance harness='+process.argv.includes('--acceptance')));
  const shutdown=()=>{server.closeAllConnections();server.close();};
  process.once('SIGTERM',shutdown);
  process.once('SIGINT',shutdown);
}
