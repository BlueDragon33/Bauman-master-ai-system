// Optional RE62 QA-only acquisition. Never runs in browser, runtime, GitHub Actions or on import.
// Writes to a fresh temporary folder (outside the product tree), no publication, no reviewer decision.
import https from 'node:https';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {
  loadRe62CandidateManifest,validateRe62Manifest,inspectRe62Candidate
} from './re62-audio-candidate-preflight.mjs';

const hash=(data,kind)=>createHash(kind).update(data).digest('hex');

// Exact locked source, no redirects or caller-supplied arbitrary URL.
export function validateRe62DownloadTarget(manifest=loadRe62CandidateManifest()){
  const chk=validateRe62Manifest(manifest);
  if(!chk.ok)throw Error('RE62 manifest invalid: '+chk.errors.join('; '));
  const source=manifest.candidates[0];
  const uri=new URL(source.originalMediaUrl);
  if(uri.protocol!=='https:'||uri.hostname!=='upload.wikimedia.org'||
     uri.pathname!=='/wikipedia/commons/c/ca/CPIDL_Russian_-_Zdravstvujte.ogg'||
     uri.search||uri.hash||source.declaredBytes!==11875)
    throw Error('RE62 source URL/size not allowlisted');
  return source;
}

export async function downloadRe62CandidateBytes({manifest=loadRe62CandidateManifest(),
  get=https.get,timeoutMs=12000}={}){
  const source=validateRe62DownloadTarget(manifest),url=source.originalMediaUrl;
  const body=await new Promise((resolve,reject)=>{
    const req=get(url,{
      headers:{'User-Agent':'Bauman-RU03-Content-Audit/1.0 (open educational licensing verification)',
        Accept:'audio/ogg, application/ogg;q=0.9'}
    },res=>{
      if(res.statusCode!==200){res.resume?.();reject(Error('HTTP_'+res.statusCode));return}
      const type=String(res.headers?.['content-type']||'').split(';')[0].toLowerCase();
      if(type&& !['audio/ogg','application/ogg','application/octet-stream'].includes(type)){
        res.resume?.();reject(Error('Unexpected content type '+type));return
      }
      let bytes=0,chunks=[];
      res.on('data',chunk=>{
        bytes+=chunk.length;
        if(bytes>100000){
          req.destroy(Error('RE62 response exceeds byte safety limit'));return
        }
        chunks.push(chunk);
      });
      res.on('end',()=>resolve(Buffer.concat(chunks)));
      res.on('error',reject);
    });
    req.on('error',reject);
    req.setTimeout?.(timeoutMs,()=>req.destroy(Error('RE62 download timeout')));
  });
  const actualSha1=hash(body,'sha1');
  if(body.length!==source.declaredBytes||
     actualSha1!==source.declaredSha1||
     body.subarray(0,4).toString('ascii')!=='OggS')
    throw Error('RE62 source bytes do not match Commons metadata; refuse to stage');
  return body;
}

export async function stageRe62QaCandidate(options={}){
  // Downloading source bytes alone grants no semantic, copyright or RU03 approval.
  const manifest=options.manifest||loadRe62CandidateManifest();
  const bytes=await downloadRe62CandidateBytes({manifest,get:options.get,timeoutMs:options.timeoutMs});
  const dir=mkdtempSync(path.join(tmpdir(),'bauman-re62-unapproved-'));
  const file=path.join(dir,'source-original.ogg');
  try{
    writeFileSync(file,bytes,{flag:'wx'});
    const evaluation=inspectRe62Candidate({
      manifest,audioPath:file,ffprobe:options.ffprobe||'ffprobe'
    });
    return Object.freeze({
      stagingDir:dir,stagedFile:file,
      status:evaluation.status,
      declaredLicense:'PUBLIC_DOMAIN_DECLARED_BUT_AUTHOR_CHAIN_REVIEW_PENDING',
      immutableSha256MeasuredFromBytes:evaluation.actualSha256,
      technicalEvaluation:evaluation,
      textAudioRu03:'PENDING_EXTERNAL_REVIEW',
      rightsClearance:'PENDING_INDEPENDENT_REVIEW',
      packagingAllowed:false,canonicalPublicationReady:false
    });
  }catch(e){rmSync(dir,{recursive:true,force:true});throw e}
}

if(process.argv[1]&&process.argv[1]===fileURLToPath(import.meta.url)){
  try{
    const result=await stageRe62QaCandidate();
    console.log(JSON.stringify(result,null,2));
    if(!result.technicalEvaluation.technicalAudioPassed)process.exitCode=2;
  }catch(e){
    // No fake hash, no silent fallback to machine-generated speech.
    console.error(JSON.stringify({status:'BLOCKED_SOURCE_DOWNLOAD_OR_VALIDATION',
      reason:String(e?.message||e),sourceAudioReady:false,RU03:'PENDING_EXTERNAL_REVIEW',
      canonicalPublicationReady:false}));
    process.exitCode=2;
  }
}
