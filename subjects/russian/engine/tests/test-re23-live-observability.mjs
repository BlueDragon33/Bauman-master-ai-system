import assert from 'node:assert/strict';
import {createLiveOwnerIntegration} from '../integration/live-owner-integration.js';

const transcript='СЕКРЕТНЫЙ ТЕКСТ НЕ ДОЛЖЕН БЫТЬ В ДИАГНОСТИКЕ';
const observation={
  evidenceId:'OBS-PRIVATE-1',
  attemptId:'ATT-PRIVATE-1',
  experienceId:'EXP-PRIVATE-1',
  competencyIds:['COMP-RU-LISTEN'],
  observationType:'listening-comprehension',
  result:{success:false,transcript},
  supportLevel:2,
  authoritative:false
};

const missing=createLiveOwnerIntegration({});
missing.applyObservation({observation});
missing.plannerStatus();
const status=missing.status();
const serialized=JSON.stringify(status);
assert.equal(serialized.includes(transcript),false);
assert.equal(status.ownerUnavailable,1);
assert.equal(status.plannerCompatible,false);
assert(status.plannerChecks>=1);
assert.equal(typeof status.lastErrorCode,'string');

const keys=Object.keys(status);
assert(keys.length<20);
assert.equal('audio' in status,false);
assert.equal('transcript' in status,false);
assert.equal('profile' in status,false);

console.log(JSON.stringify({
  ok:true,
  boundedDiagnostics:true,
  transcriptExcluded:true,
  rawAudioExcluded:true,
  ownerFailureContained:true
}));
