import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {loadRe62CandidateManifest} from '../review/re62-audio-candidate-preflight.mjs';
import {
  validateRe62DownloadTarget,downloadRe62CandidateBytes,stageRe62QaCandidate
} from '../review/re62-stage-original-audio.mjs';

// Not an internet test. The only positive 'PASS' is for preventing untrusted or wrong bytes.
const manifest=loadRe62CandidateManifest();
const target=validateRe62DownloadTarget(manifest);
assert.equal(target.declaredBytes,11875);
assert.match(target.originalMediaUrl,/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//);

function getStub({status=200,type='application/ogg',data=Buffer.from('OggS-FAKE') }={}){
  return function get(url,options,onResponse){
    assert.equal(url,target.originalMediaUrl);
    assert.equal(options.headers.Accept,'audio/ogg, application/ogg;q=0.9');
    const request=new EventEmitter();
    request.setTimeout=()=>request;
    request.destroy=error=>request.emit('error',error);
    queueMicrotask(()=>{
      const response=new EventEmitter();
      response.statusCode=status;
      response.headers={'content-type':type};
      response.resume=()=>{};
      onResponse(response);
      if(status===200 && (type==='application/ogg'||type==='audio/ogg')){
        response.emit('data',data);response.emit('end');
      }
    });
    return request;
  };
}
await assert.rejects(
  downloadRe62CandidateBytes({manifest,get:getStub()}),
  /do not match Commons metadata/
);
await assert.rejects(
  stageRe62QaCandidate({manifest,get:getStub()}),
  /do not match Commons metadata/,
  'Fake bytes must never be written to temporary media staging'
);
await assert.rejects(
  downloadRe62CandidateBytes({manifest,get:getStub({status:404})}),
  /HTTP_404/
);
await assert.rejects(
  downloadRe62CandidateBytes({manifest,get:getStub({type:'text\/html'})}),
  /Unexpected content type/
);
await assert.rejects(
  downloadRe62CandidateBytes({manifest,get:getStub({data:Buffer.alloc(100001,0)})}),
  /response exceeds byte safety limit/
);
const forged=structuredClone(manifest);
forged.candidates[0].originalMediaUrl='https://example.org/audio.ogg';
assert.throws(()=>validateRe62DownloadTarget(forged),/manifest invalid|not allowlisted/);
assert.equal(manifest.humanApproval,false);
assert.equal(manifest.candidates[0].packagingAllowed,false);
console.log('RUSSIAN_RE62_QA_DOWNLOAD_GUARDS_PASS',JSON.stringify({
  allowlistedSource:true,wrongBytesBlocked:true,httpFailureBlocked:true,
  untrustedMimeBlocked:true,oversizedBlocked:true,foreignHostBlocked:true,
  realMediaDownload:'NOT_TESTED_NETWORK_UNAVAILABLE',localRU03:'BLOCKED',
  canonicalPublicationReady:false
}));
