import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildContentFirstRu03Handoff} from '../review/re61-r02-r04-source-review-handoff.mjs';
import {buildRe66RueRequest,verifyRe66RueAdvisoryBundle}
 from '../review/re66-rue-content-first-bridge.mjs';

// Validates REAL RE61 fingerprints and Git blobs in Bauman checkout.
// For cross-repo response, use the actual RUE code in separate checkout, not this fabricated fixture.
const independentBaumanReferencePins=Object.freeze({
 LW_ITEM_R02_NAME:{sourceRevision:'db585035814ca2a8732c1bf71c3838a44a182602b0d23d41c8e709bfb1a6971a',textFingerprint:'bbd6b0197ccbb590c80d11f3fee36abf69ef85b1f5700dfc7527291eee12c7b1',reviewFingerprint:'569c4782103b03c59d079b441bbbf1b12b0ccc1f0f56a057374dd09d14d7932e'},
 LW_ITEM_R02_INTRO:{sourceRevision:'5216cf9d67000aafda433d09bd89438a9ba3316d141cadf576d4199c62ad310b',textFingerprint:'9f357a59324e2a8e30d26105e84910901ba1e85a5bdab3d14a7effd724f37a7c',reviewFingerprint:'b668f9d9de6c5c8a1850bf7d8cf8cb6d7c63b3a5043eadc42b4c0ff6817c3c7b'},
 LW_ITEM_R03_REG:{sourceRevision:'76bff4af0162be6cbc67aa309e5206582131ab6f05c5878fc01bfe49e59314af',textFingerprint:'c30916b1a128decf6efae2384fe2c4c995004b4be3e6420918e07c93dd24f709',reviewFingerprint:'70120c0ea6d213656f94be4bab25d2d1a3f4405a9f74b2263c4995131e472572'},
 LW_ITEM_R03_DOCS:{sourceRevision:'e972d95cfe7205e06d0421cbed1471be57612ce21ee915de0d7a747684e899c4',textFingerprint:'864dfe6748c5d5a51d8e22d2b54e3e496706ce713a281f3df3a5b708944d9200',reviewFingerprint:'ff74787eb67eba7b3e317af770f3144bc12699b5c5a0cac7b63ad92c57f7aaab'},
 LW_ITEM_R04_METRO:{sourceRevision:'380013cc4fae85990eeef12cb831674479915631b094788e98591a322130744c',textFingerprint:'5cc74f995a7b15794cbd602b7b44968d52d790a240daea8aed84c6cfcd80357e',reviewFingerprint:'6d8a8f6669983378740656600c02659d35bf08f451da9fdaf05cb4f05a69b277'},
 LW_ITEM_R04_DOCTOR:{sourceRevision:'a32b7950ae3526c9f2a0e7d62646e5cc6dd2f958e766aef90b4a672bc738da7b',textFingerprint:'7413128e9c46c6937a8105526203c67a196781d661cd38d024b462bfdc7c2700',reviewFingerprint:'53c3935cbca9e54fe553f8beea61cc744321f2f0273860c9245bc13c986f653a'}
});
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
 // Immutable source-owner RE45 fingerprint truth; candidate sync must fail closed
 // if RUE's baseline hashes no longer correspond to Bauman's canonical owner.
 for(const field of ['sourceRevision','textFingerprint','reviewFingerprint'])
   assert.equal(a[field],independentBaumanReferencePins[a.sourceItemId][field],
     'RE61 fingerprint drift: '+a.sourceItemId+'/'+field);
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
const grammarFixtures=Object.freeze({
 LW_ITEM_R02_NAME:{code:'NAMING_CONSTRUCTION_ATTESTED',status:'ATTESTED_PATTERN_ONLY',
   source:'GRAMOTA_NAMING_CASE_VARIANTS',scope:'NOMINATIVE_OR_INSTRUMENTAL_NAMING_PATTERN_ONLY',
   url:'https://gramota.ru/poisk?mode=spravka&query=%D0%BC%D0%B5%D0%BD%D1%8F%20%D0%B7%D0%BE%D0%B2%D1%83%D1%82%20%D0%90%D0%BD%D0%B4%D1%80%D0%B5%D0%B9'},
 LW_ITEM_R02_INTRO:{code:'INTRODUCTION_FORMULA_RECOGNIZED',status:'ATTESTED_PATTERN_ONLY',
   source:'GRAMOTA_NAMING_CASE_VARIANTS',scope:'NOMINATIVE_OR_INSTRUMENTAL_NAMING_PATTERN_ONLY',
   url:'https://gramota.ru/poisk?mode=spravka&query=%D0%BC%D0%B5%D0%BD%D1%8F%20%D0%B7%D0%BE%D0%B2%D1%83%D1%82%20%D0%90%D0%BD%D0%B4%D1%80%D0%B5%D0%B9'},
 LW_ITEM_R03_REG:{code:'IMPERSONAL_NEED_PLUS_INFINITIVE',status:'ATTESTED_PATTERN_ONLY',
   source:'GRAMOTA_MODAL_NUZHNO_INFINITIVE',scope:'NEUTER_PREDICATIVE_PLUS_INFINITIVE_ONLY',
   url:'https://gramota.ru/poisk?mode=spravka&query=%D0%94%D0%BE%D0%BB%D0%B6%D0%BD%D0%BE'},
 LW_ITEM_R03_DOCS:{code:'DOCUMENTS_REQUEST_FORMULA_RECOGNIZED',status:'ATTESTED_PATTERN_ONLY',
   source:'GRAMOTA_PLEASE_PUNCTUATION_CONTEXT',scope:'CONTEXT_SENSITIVE_PLEASE_COMMA_NO_GLOBAL_RULE',
   url:'https://gramota.ru/poisk?mode=spravka&query=%D0%BD%D0%B5%D0%B4%D0%BE%D1%83%D0%BC%D0%B5%D0%BD%D0%B8%D0%B5'},
 LW_ITEM_R04_METRO:{code:'METRO_DO_ATTESTED',status:'ATTESTED_PATTERN_ONLY',
   source:'GRAMOTA_METRO_DIRECTION_COLLOCATIONS',scope:'DIRECTION_TO_METRO_DO_OR_K_ONLY',
   url:'https://gramota.ru/poisk?dicts%5B0%5D=48&mode=slovari&query=%D0%BC%D0%B5%D0%BB%D0%BA%D0%BE&simple=0'},
 LW_ITEM_R04_DOCTOR:{code:'MEDICAL_REQUEST_FIXED_PHRASE',status:'CANONICAL_EXAMPLE_MATCH_ONLY',
   source:null,url:null,scope:null}
});
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
 const grammarFixture=grammarFixtures[item.sourceItemId];
 const gramBody={
   schema:'RUE_RE67_SCOPED_RUSSIAN_GRAMMAR_ADVISORY_V1',
   sourceItemId:item.sourceItemId,lessonId:item.lessonId,
   category:'FIXTURE_CORRESPONDING_CATEGORY',
   candidateText:item.textRu,
   canonicalTextSha256:sha(item.textRu),
   candidateTextSha256:sha(item.textRu),
   exactCanonicalText:true,patternId:grammarFixture.code,
   patternStatus:grammarFixture.status,
   sourceLocator:grammarFixture.source?{
     id:grammarFixture.source,url:grammarFixture.url,scope:grammarFixture.scope
   }:null,
   note:'Developer test only, not source validated.',
   detectedConcern:false,acceptedAsCorrect:false,errorProven:false,
   grammarScore:null,phoneticsScore:null,stressApproved:false,
   humanRu03Approved:false,readyForLearning:false,
   authority:'AI_ADVISORY_PATTERN_ONLY_NO_AUTOMATIC_QUALITY_GATE',
   noLearnerData:true
 };
 return {sourceItemId:item.sourceItemId,itemId:item.itemId,advisory,
  grammarEvidence:{...gramBody,advisorySha256:sha(JSON.stringify(gramBody))},
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
assert.equal(tamper(x=>{x.advisories[0].grammarEvidence.acceptedAsCorrect=true},{rehash:true}),false);
assert.equal(tamper(x=>{x.advisories[2].grammarEvidence.grammarScore=100},{rehash:true}),false);
assert.equal(tamper(x=>{x.advisories[4].grammarEvidence.patternId='AUTOMATIC_APPROVED'},{rehash:true}),false);
assert.equal(tamper(x=>{x.advisories[1].grammarEvidence.sourceLocator.url='https://fake.example/grammar'},{rehash:true}),false);
assert.equal(tamper(x=>{x.advisories[3].grammarEvidence.sourceLocator.url='https://gramota.ru/poisk?query=unrelated'},{rehash:true}),false);
assert.equal(tamper(x=>{x.advisories[4].grammarEvidence.sourceLocator.scope='ALL_RUSSIAN_GRAMMAR_APPROVED'},{rehash:true}),false);
// Independently recomputed hashes are NOT canonical-source authentication.
// This used to pass if the verifier trusted caller-chosen requestSha256.
const fakeRequest=structuredClone(request);
fakeRequest.sourceItems[0].textRu='Меня зовут Сара.';
const {requestSha256:discardRequestHash,...fakeReqBody}=fakeRequest;
fakeRequest.requestSha256=sha(JSON.stringify(fakeReqBody));
const forgedBundle=structuredClone(mock);
forgedBundle.requestSha256=fakeRequest.requestSha256;
forgedBundle.advisories[0].advisory.textRu=fakeRequest.sourceItems[0].textRu;
for(const row of forgedBundle.advisories){
 const {advisorySha256:discardAdvisoryHash,...advisoryBody}=row.advisory;
 row.advisory.advisorySha256=sha(JSON.stringify(advisoryBody));
}
const {bundleSha256:discardBundleHash,...forgedBody}=forgedBundle;
forgedBundle.bundleSha256=sha(JSON.stringify(forgedBody));
assert.equal(verifyRe66RueAdvisoryBundle(fakeRequest,forgedBundle).ok,false,
  'A forged R02 name and fully rehashed advisory cannot pass the canonical source gate');
assert.equal(verifyRe66RueAdvisoryBundle(request,forgedBundle).ok,false,
  'An advisory for a different request cannot be replayed to current RE61');
assert.equal(verifyRe66RueAdvisoryBundle(null,mock).ok,false,
  'A null request must reject rather than throw');
assert.equal(verifyRe66RueAdvisoryBundle({schema:'BAUMAN_RUE_RE66_REQUEST_V1',sourceItems:{length:6}},mock).ok,false,
  'A malformed sourceItems collection must reject rather than throw');
const malformedSource=structuredClone(request);
malformedSource.sourceItems[0]=null;
assert.equal(verifyRe66RueAdvisoryBundle(malformedSource,mock).ok,false,
  'A null item must reject rather than throw');


console.log('RUSSIAN_RE66_BAUMAN_RUE_BRIDGE_PASS',JSON.stringify({
 realSourceItems:6,realGitBlobPins:3,syntheticRUEOutputGuard:true,
 forgedApprovalsRejected:true,realRUEExecution:'NOT_TESTED',
 independentLinguisticAccuracy:'NOT_MEASURED',ru03Approved:false
}));
