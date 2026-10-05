// Hub acceptance server: subject internals are unavailable even accidentally.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  let pathname;
  try{pathname=decodeURIComponent(url.pathname)}catch{res.writeHead(400);return res.end()}
  if(/^\/(?:subjects|prompts\/subjects)(?:\/|$)/.test(pathname)){res.writeHead(403);return res.end('SUBJECT_INTERNALS_BLOCKED')}
  const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!target.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  if(!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);return res.end()}
  res.writeHead(200,{'content-type':mime[path.extname(target)]||'application/octet-stream','cache-control':'no-store'});
  fs.createReadStream(target).pipe(res);
}).listen(4173,'127.0.0.1',()=>console.log('HUB_SCOPE_SERVER_READY subjects/** denied'));
