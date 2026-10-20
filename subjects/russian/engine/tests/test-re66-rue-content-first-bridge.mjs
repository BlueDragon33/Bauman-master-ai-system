import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildContentFirstRu03Handoff} from '../review/re61-r02-r04-source-review-handoff.mjs';
import {buildRe66RueRequest,verifyRe66RueAdvisoryBundle}
 from '../review/re66-rue-content-first-bridge.mjs';

// Validates REAL RE61 fingerprints and Git blobs in Bauman checkout.
// For cross-repo response, use the actual RUE code in separate checkout, not this fabricated fixture.
const request=buildRe66RueRequest();
assert.equal(request.sourceItems.length,6);
assert.equal(request.humanApproval,false);
assert.equal(request.canonicalPublicationReady,false);
assert.equal(request.sourceBaselineCommit,'3c2f5072fe55a6ec20c9c7792c7dbe2899988b43');
const h=buildContentFirstRu03Handoff();
for(let i=0;i<6;i++){
 const a=request.sourceItems[i],b=h.reviewItems[i];
 assert.equal(a.textRu,b.textRu);
 assert.equal(a.sourceRevision,b.sourceRevision);
 assert.equal(a.textFingerprint,b.textFingerprint);
 assert.equal(a.reviewFingerprint,b.reviewFingerprint);
 assert.equal(a.audioFingerprint,null);
}
const sha=s=>createHash('sha256').update(s).digest('hex');
const {requestSha256,...payload}=request;
assert.equal(requestSha256,sha(JSON.stringify(payload)));

// A synthetic RUE-shaped report for the Bauman inbound guard; not a real review.
const ad=request.sourceItems.map(item=>{
 const advisoryData={
  schema:'RUE_RU03_ADVISORY_V1',
  projectId:'project:blueprint-russian-expert-engine',
  targetProjectId:'project:bauman-master-ai-system',
  boundItem:{itemId:item.itemId,sourceRevision:item.sourceRevision,
    reviewFingerprint:item.reviewFingerprint,textFingerprint:item.textFingerprint,
    audioFingerprint:null},
  textRu:item.textRu,claims:[{
   sourceId:'gramota',sourceUrl:'https://gramota.ru/',
   use:item.sourceItemId==='LW_ITEM_R02_INTRO'?'ORTHOEPY':'WORD_STRESS',
   surface:item.textRu.match(/[А-ЯЁа-яё]+/u)[0],
   evidenceStatus:'UNVERIFIED_SOURCE_POINTER',
   note:'Dictionary lookup target only: source locator needs actual lexical verification.'
  }],
  status:'AI_ADVISORY_PENDING_INDEPENDENT_REVIEW',
  reviewAuthority:'NONE',humanApproval:false,textApproved:false,audioApproved:false,
  canonicalPublicationReady:false,productionReleaseReady:false
 };
 const advisory={...advisoryData,advisorySha256:sha(JSON.stringify(advisoryData))};
 return {sourceItemId:item.sourceItemId,itemId:item.itemId,advisory,
  lexicalEvidence:{
   sourceId:'gramota',surface:item.textRu.match(/[А-ЯЁа-яё]+/u)[0],
   headwordWithStress:'UNVERIFIED_SYNTHETIC_FIXTURE',
   scope:'FIXTURE_ONLY',url:'https://gramota.ru/poisk?query=fixture',
   status:'PUBLIC_DICTIONARY_PAGE_OBSERVED_LEXEME_ONLY',
   rights:'LINK_ONLY_NO_COPY',
   sentenceMeaningApproved:false,prosodyApproved:false,humanRu03Approved:false
  },
  preflight:{
   grammar:'UNVERIFIED_NEEDS_SOURCE_AND_RKI_REVIEW',
   stress:'UNVERIFIED_NEEDS_LEXICAL_SOURCE_REVIEW',
   phonetics:'UNVERIFIED_NO_HUMAN_VOICE',
   audioQa:'BLOCKED_NO_IMMUTABLE_LICENSED_RECORDING',
   pronunciationScore:null,readyForLearning:false
  }};
});
const body={
 schema:'RUE_RE66_ADVISORY_BUNDLE_V1',
 requestSha256,
 sourceBaselineCommit:request.sourceBaselineCommit,
 rueContractBaseline:request.expectedRueContractBaseline,
 status:'AI_ADVISORY_PENDING_INDEPENDENT_REVIEW',
 schemaForDownstream:'RUE_RU03_ADVISORY_V1',
 independentBenchmark:'NO_HUMAN_LABELED_GOLD_SET',
 voiceAssetCount:0,verifiedGrammarClaims:0,verifiedStressClaims:0,
 advisories:ad,reviewAuthority:'NONE',humanApproval:false,
 textApproved:false,audioApproved:false,canonicalPublicationReady:false,
 productionReleaseReady:false
};
const mock={...body,bundleSha256:sha(JSON.stringify(body))};
assert.equal(verifyRe66RueAdvisoryBundle(request,mock).ok,true);
const tamper=(change)=>{
 const clone=structuredClone(mock);change(clone);
 return verifyRe66RueAdvisoryBundle(request,clone).ok;
};
assert.equal(tamper(x=>{x.humanApproval=true}),false);
assert.equal(tamper(x=>{x.advisories[0].advisory.textApproved=true}),false);
assert.equal(tamper(x=>{x.advisories[1].advisory.boundItem.textFingerprint='f'.repeat(64)}),false);
assert.equal(tamper(x=>{x.advisories[2].advisory.textRu='Изменённый текст.'}),false);
assert.equal(tamper(x=>{x.advisories[3].preflight.readyForLearning=true}),false);
assert.equal(tamper(x=>{x.advisories.reverse()}),false);
assert.equal(tamper(x=>{x.advisories[4].advisory.claims=[{surface:'fake',evidenceStatus:'APPROVED'}]}),false);
assert.equal(tamper(x=>{x.rueContractBaseline='f'.repeat(40)}),false);
assert.equal(tamper(x=>{x.bundleSha256='f'.repeat(64)}),false);
assert.equal(tamper(x=>{x.audioApproved=true}),false);
console.log('RUSSIAN_RE66_BAUMAN_RUE_BRIDGE_PASS',JSON.stringify({
 realSourceItems:6,realGitBlobPins:3,syntheticRUEOutputGuard:true,
 forgedApprovalsRejected:true,realRUEExecution:'NOT_TESTED',
 independentLinguisticAccuracy:'NOT_MEASURED',ru03Approved:false
}));
