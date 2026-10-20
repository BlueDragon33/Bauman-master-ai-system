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
// Contract fixtures mirror RUE lexical locator candidates for verification only.
// These are NOT a second canonical Russian learning-content owner.
const lexicalFixtures={
 LW_ITEM_R02_NAME:{surface:'зовут',headwordWithStress:'зову́т',scope:'ATTESTED_INFLECTED_FORM_ONLY',
  url:'https://gramota.ru/poisk?mode=all&query=%D0%B7%D0%BE%D0%B2%D1%83%D1%82&simple=0'},
 LW_ITEM_R02_INTRO:{surface:'Здравствуйте',headwordWithStress:'здра́вствуйте',scope:'ATTESTED_LEXICAL_FORM_ONLY',
  url:'https://gramota.ru/poisk?mode=all&query=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5'},
 LW_ITEM_R03_REG:{surface:'регистрацию',headwordWithStress:'регистра́ция',scope:'LEMMA_ONLY_INFLECTED_SENTENCE_UNVERIFIED',
  url:'https://gramota.ru/poisk?mode=slovari&query=%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B0%D1%86%D0%B8%D1%8F'},
 LW_ITEM_R03_DOCS:{surface:'пожалуйста',headwordWithStress:'пожа́луйста',scope:'ATTESTED_LEXICAL_FORM_ONLY',
  url:'https://gramota.ru/poisk?query=%D0%9F%D0%BE%D0%B6%D0%B0%D0%BB%D1%83%D0%B9%D1%81%D1%82%D0%B0'},
 LW_ITEM_R04_METRO:{surface:'метро',headwordWithStress:'метро́',scope:'ATTESTED_INDECLINABLE_NOUN_ONLY',
  url:'https://gramota.ru/poisk?mode=all&query=%D0%BC%D0%B5%D1%82%D1%80%D0%BE&simple=0'},
 LW_ITEM_R04_DOCTOR:{surface:'врач',headwordWithStress:'врач',scope:'ATTESTED_MONOSYLLABIC_NOUN_ONLY',
  url:'https://gramota.ru/poisk?mode=slovari&query=%D0%92%D0%A0%D0%90%D0%A7'}
};
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
   surface:lexicalFixtures[item.sourceItemId].surface,
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
   sourceId:'gramota',...lexicalFixtures[item.sourceItemId],
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
const tamper=(change,{rehash=false}={})=>{
 const clone=structuredClone(mock);change(clone);
 if(rehash){
   for(const e of clone.advisories){
     const {advisorySha256,...content}=e.advisory;
     e.advisory.advisorySha256=sha(JSON.stringify(content));
   }
   const {bundleSha256,...body}=clone;
   clone.bundleSha256=sha(JSON.stringify(body));
 }
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
assert.equal(tamper(x=>{x.advisories[0].lexicalEvidence.headwordWithStress='зво́ут'},{rehash:true}),false);
assert.equal(tamper(x=>{x.advisories[1].lexicalEvidence.url='https://gramota.ru/poisk?query=forged'},{rehash:true}),false);
assert.equal(tamper(x=>{x.advisories[2].advisory.claims[0].surface='подмена'},{rehash:true}),false);
console.log('RUSSIAN_RE66_BAUMAN_RUE_BRIDGE_PASS',JSON.stringify({
 realSourceItems:6,realGitBlobPins:3,syntheticRUEOutputGuard:true,
 forgedApprovalsRejected:true,realRUEExecution:'NOT_TESTED',
 independentLinguisticAccuracy:'NOT_MEASURED',ru03Approved:false
}));
