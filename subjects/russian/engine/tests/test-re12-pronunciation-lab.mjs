import fs from 'node:fs';
import assert from 'node:assert/strict';
import {validatePronunciationTarget,evaluatePronunciationSignals,compareSelfRecording} from '../pronunciation/pronunciation-lab.mjs';

const fixture=JSON.parse(fs.readFileSync(new URL('../content/fixtures/pronunciation-targets.v1.json',import.meta.url),'utf8'));
const target=fixture.targets[0];
assert.equal(validatePronunciationTarget(target).ok,true);

const browserAsr=evaluatePronunciationSignals({
 target,
 provider:{id:'browser-asr',capabilities:['TRANSCRIPT_RECOGNITION'],confidenceMeaning:'RECOGNITION_CONFIDENCE_ONLY'},
 signals:[
  {capability:'TRANSCRIPT_RECOGNITION',transcript:'жар',confidence:.8},
  {capability:'PHONEME_SIGNAL',phoneme:'ж',score:.9}
 ]
});
assert.equal(browserAsr.acceptedSignals.length,1);
assert.equal(browserAsr.rejectedSignals.length,1);
assert.equal(browserAsr.claims.transcriptOnly,true);
assert.equal(browserAsr.claims.phonemeEvidenceAvailable,false);
assert.equal(browserAsr.authoritative,false);

const acoustic=evaluatePronunciationSignals({
 target,
 provider:{id:'approved-acoustic-test',capabilities:['PHONEME_SIGNAL','WORD_STRESS_SIGNAL'],confidenceMeaning:'TEST_PROVIDER_SIGNAL'},
 signals:[
  {capability:'PHONEME_SIGNAL',phoneme:'ж',score:.72},
  {capability:'WORD_STRESS_SIGNAL',syllable:1,score:.7}
 ]
});
assert.equal(acoustic.claims.phonemeEvidenceAvailable,true);
assert.equal(acoustic.claims.stressEvidenceAvailable,true);

const comparison=compareSelfRecording({modelDurationMs:1000,learnerDurationMs:1200,modelPauses:[400],learnerPauses:[350,700]});
assert.equal(comparison.durationRatio,1.2);
assert.equal(comparison.pauseCountDifference,1);
assert.equal(comparison.authoritative,false);

console.log(JSON.stringify({
 ok:true,
 browserAsrPhonemeClaimBlocked:true,
 providerCapabilityRequired:true,
 selfComparisonAuthority:false,
 masteryMutation:false
}));
