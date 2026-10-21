// RE66: offline, pull-only RUE advisory adapter for six existing RE61 items.
// Never sends learner records, uploads files, changes canonical lessons, awards mastery,
// or imports RUE's reviewer authority. RUE is advisory; RE45/RE50 remain sole gates.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildContentFirstRu03Handoff} from './re61-r02-r04-source-review-handoff.mjs';

const pinned=Object.freeze({
 baumanBaseline:'3c2f5072fe55a6ec20c9c7792c7dbe2899988b43',
 rueContractBaseline:'2cd2be269e3ca1a32f436d373f372d45e28ca352',
 sourceOwner:'subjects/russian/data/listen-write-lessons.json',
 sourceOwnerBlob:'f041ceebc32245438f93142014f347440ebe2599',
 sourceMapBlob:'7a71e138dc4972816dae79df1adc73ffc12e8422',
 re61Blob:'a4eda4e8bcc075fd0b29c82102536698a1325e4a'
});
const sha256=s=>createHash('sha256').update(s,'utf8').digest('hex');
const gitBlob=s=>{const bytes=Buffer.from(s,'utf8');return createHash('sha1').update(
  Buffer.concat([Buffer.from('blob '+bytes.length+'\0','utf8'),bytes])).digest('hex')};
// RE66 candidate contract pins against accidental or forged lexical cue swaps.
// These are dictionary pointers, NOT an independently licensed or approved lexicon.
// A changed cue requires a coordinated reviewed RUE/Bauman revision.
const lexicalPins=Object.freeze({
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
});
// RE67 is a narrow text-pattern supplement only. These IDs identify recognized
// canonical examples, not language correctness or RU03 approval.
const re67PatternPins=Object.freeze({
 LW_ITEM_R02_NAME:{code:'NAMING_CONSTRUCTION_ATTESTED',sourceId:'GRAMOTA_NAMING_CASE_VARIANTS',
   url:'https://gramota.ru/poisk?mode=spravka&query=%D0%BC%D0%B5%D0%BD%D1%8F%20%D0%B7%D0%BE%D0%B2%D1%83%D1%82%20%D0%90%D0%BD%D0%B4%D1%80%D0%B5%D0%B9',
   scope:'NOMINATIVE_OR_INSTRUMENTAL_NAMING_PATTERN_ONLY'},
 LW_ITEM_R02_INTRO:{code:'INTRODUCTION_FORMULA_RECOGNIZED',sourceId:'GRAMOTA_NAMING_CASE_VARIANTS',
   url:'https://gramota.ru/poisk?mode=spravka&query=%D0%BC%D0%B5%D0%BD%D1%8F%20%D0%B7%D0%BE%D0%B2%D1%83%D1%82%20%D0%90%D0%BD%D0%B4%D1%80%D0%B5%D0%B9',
   scope:'NOMINATIVE_OR_INSTRUMENTAL_NAMING_PATTERN_ONLY'},
 LW_ITEM_R03_REG:{code:'IMPERSONAL_NEED_PLUS_INFINITIVE',sourceId:'GRAMOTA_MODAL_NUZHNO_INFINITIVE',
   url:'https://gramota.ru/poisk?mode=spravka&query=%D0%94%D0%BE%D0%BB%D0%B6%D0%BD%D0%BE',
   scope:'NEUTER_PREDICATIVE_PLUS_INFINITIVE_ONLY'},
 LW_ITEM_R03_DOCS:{code:'DOCUMENTS_REQUEST_FORMULA_RECOGNIZED',sourceId:'GRAMOTA_PLEASE_PUNCTUATION_CONTEXT',
   url:'https://gramota.ru/poisk?mode=spravka&query=%D0%BD%D0%B5%D0%B4%D0%BE%D1%83%D0%BC%D0%B5%D0%BD%D0%B8%D0%B5',
   scope:'CONTEXT_SENSITIVE_PLEASE_COMMA_NO_GLOBAL_RULE'},
 LW_ITEM_R04_METRO:{code:'METRO_DO_ATTESTED',sourceId:'GRAMOTA_METRO_DIRECTION_COLLOCATIONS',
   url:'https://gramota.ru/poisk?dicts%5B0%5D=48&mode=slovari&query=%D0%BC%D0%B5%D0%BB%D0%BA%D0%BE&simple=0',
   scope:'DIRECTION_TO_METRO_DO_OR_K_ONLY'},
 LW_ITEM_R04_DOCTOR:{code:'MEDICAL_REQUEST_FIXED_PHRASE',sourceId:null,url:null,scope:null}
});
// RE68 recognizes four *canonical intent examples* only, not grammatical truth.
// R02 has no RE68 dialogue observation, which is an explicit reviewed boundary.
const re68IntentPins=Object.freeze({
 LW_ITEM_R03_REG:{code:'R03_REGISTER_ACTION_NEED',context:'DORM_REGISTRATION',
   source:'GRAMOTA_323868_NUZHNO_VS_NUZHNA',
   url:'https://gramota.ru/poisk?mode=spravka&query=%D0%BD%D1%83%D0%B6%D0%BD%D0%BE',
   scope:'IMPERSONAL_PREDICATIVE_NEED_VS_SHORT_ADJECTIVE_NOUN'},
 LW_ITEM_R03_DOCS:{code:'R03_DOCUMENTS_INFORMATION_REQUEST',context:'ASK_REQUIRED_DOCUMENTS',
   source:'GRAMOTA_319473_PLEASE_PUNCTUATION',
   url:'https://gramota.ru/spravka/vopros/319473',
   scope:'PLEASE_INTERJECTION_VS_POLITE_INFORMATION_REQUEST'},
 LW_ITEM_R04_METRO:{code:'R04_WALKING_DIRECTION_METRO',context:'ASK_WALKING_ROUTE_TO_METRO',
   source:'GRAMOTA_DIRECTION_TO_METRO',
   url:'https://gramota.ru/poisk?mode=slovari&query=%D0%98%D1%89%D0%B8&simple=0',
   scope:'WALKING_TOWARD_METRO_K_VS_DO_COLLOCATIONS'},
 LW_ITEM_R04_DOCTOR:{code:'R04_DOCTOR_REQUEST',context:'REQUEST_A_DOCTOR',
   source:'GRAMOTA_323868_NUZHNO_VS_NUZHNA',
   url:'https://gramota.ru/poisk?mode=spravka&query=%D0%BD%D1%83%D0%B6%D0%BD%D0%BE',
   scope:'IMPERSONAL_PREDICATIVE_NEED_VS_SHORT_ADJECTIVE_NOUN'}
});
const refs=Object.freeze([
 ['../../data/listen-write-lessons.json','sourceOwnerBlob'],
 ['../content/fixtures/r01-r06-source-bound-practice-map.candidate.json','sourceMapBlob'],
 ['./re61-r02-r04-source-review-handoff.mjs','re61Blob']
]);

export function buildRe66RueRequest({handoff=buildContentFirstRu03Handoff(),
  sourceFiles=null}={}){
 const actual=refs.map(([relative,key])=>{
   const value=sourceFiles?sourceFiles[key]:readFileSync(new URL(relative,import.meta.url),'utf8');
   if(typeof value!=='string'||gitBlob(value)!==pinned[key])
     throw Error('RE66 canonical source blob mismatch '+key);
   return {key,gitBlobSha:pinned[key]};
 });
 if(handoff.schema!=='RUSSIAN_CONTENT_FIRST_RE61_HANDOFF_V1'||
    handoff.itemCount!==6||handoff.canonicalPublicationReady!==false||
    handoff.audioReady!==false||handoff.reviewerCount!==0)throw Error('RE66 invalid RE61 human gate');
 const ids=['LW_ITEM_R02_NAME','LW_ITEM_R02_INTRO',
   'LW_ITEM_R03_REG','LW_ITEM_R03_DOCS','LW_ITEM_R04_METRO','LW_ITEM_R04_DOCTOR'];
 const source=handoff.reviewItems.map((item,i)=>{
   if(item.sourceItemId!==ids[i]||!item.textRu||
      item.humanApproval!==false||item.audioFingerprint!==null||
      item.audio?.authority!=='NONE')throw Error('RE66 source must be ordered and unapproved');
   for(const key of ['textFingerprint','reviewFingerprint','sourceRevision']){
     if(!/^[a-f0-9]{64}$/.test(item[key]||''))throw Error('RE66 invalid RE61 '+key);
   }
   return {
     itemId:item.itemId,sourceItemId:item.sourceItemId,
     lessonId:item.lessonId,sourceRevision:item.sourceRevision,
     sourceCatalog:item.sourceCatalog,textRu:item.textRu,
     textFingerprint:item.textFingerprint,reviewFingerprint:item.reviewFingerprint,
     audioFingerprint:null,status:'PENDING_EXTERNAL_RU03',
     humanApproval:false,canonicalPublicationReady:false
   };
 });
 if(new Set(source.map(x=>x.itemId)).size!==6)throw Error('RE66 duplicate review item');
 const payload={
   schema:'BAUMAN_RUE_RE66_REQUEST_V1',
   status:'OFFLINE_CANDIDATE_AI_ADVISORY_ONLY',
   targetProjectId:'project:blueprint-russian-expert-engine',
   sourceRepo:'BlueDragon33/Bauman-master-ai-system',
   sourceBaselineCommit:pinned.baumanBaseline,
   expectedRueContractBaseline:pinned.rueContractBaseline,
   sourceBlobPins:actual,
   reviewOwner:'RE61_RE45_RE50_HUMAN_RU03',
   dataPolicy:'SIX_CANONICAL_TEXTS_ONLY_NO_LEARNER_DATA',
   sourceItems:source,
   humanApproval:false,canonicalPublicationReady:false
 };
 return Object.freeze({...payload,requestSha256:sha256(JSON.stringify(payload))});
}

export function verifyRe66RueAdvisoryBundle(request,bundle){
 const errors=[];
 if(!request||typeof request!=='object'||Array.isArray(request))
   return Object.freeze({ok:false,errors:['RE66 request must be an object'],
     itemCount:0,humanApproval:false,canonicalPublicationReady:false});
 // This public verifier must establish the authoritative RE61 request itself.
 // A syntactically valid recomputed SHA over a caller-chosen request proves
 // data integrity only; it never proves provenance from canonical Bauman.
 // Rebuilding also checks source-owner, map and RE61 Git blob pins before trust.
 const canonicalRequest=buildRe66RueRequest();
 if(request?.requestSha256!==canonicalRequest.requestSha256)
   errors.push('RE66 inbound request is not the canonical RE61 packet for the pinned source');
 if(!Array.isArray(request?.sourceItems)||request.sourceItems.length!==6)
   errors.push('RE66 inbound request must contain six canonical items');
 if(request?.schema!=='BAUMAN_RUE_RE66_REQUEST_V1'||
    request?.requestSha256!==sha256(JSON.stringify(((r)=>{const {requestSha256,...body}=r;return body})(request))))
   errors.push('request hash invalid');
 if(bundle?.schema!=='RUE_RE66_ADVISORY_BUNDLE_V1'||
    bundle?.requestSha256!==request?.requestSha256||
    bundle?.sourceBaselineCommit!==pinned.baumanBaseline||
    bundle?.rueContractBaseline!==pinned.rueContractBaseline||
    bundle?.status!=='AI_ADVISORY_PENDING_INDEPENDENT_REVIEW')
   errors.push('wrong RUE advisory binding/authority');
 if(bundle?.humanApproval!==false||bundle?.textApproved!==false||
    bundle?.audioApproved!==false||bundle?.canonicalPublicationReady!==false||
    bundle?.productionReleaseReady!==false||bundle?.reviewAuthority!=='NONE'||
    bundle?.schemaForDownstream!=='RUE_RU03_ADVISORY_V1'||
    bundle?.independentBenchmark!=='NO_HUMAN_LABELED_GOLD_SET'||
    bundle?.voiceAssetCount!==0||bundle?.verifiedGrammarClaims!==0||
    bundle?.verifiedStressClaims!==0)
   errors.push('forged approval, audio or benchmark');
 if(!Array.isArray(bundle?.advisories)||bundle.advisories.length!==6)
   errors.push('missing six advisory rows');
 const sourceItems=Array.isArray(request.sourceItems)?request.sourceItems:[];
 for(let i=0;i<Math.min(sourceItems.length,6);i++){
   const item=sourceItems[i],entry=bundle?.advisories?.[i],adv=entry?.advisory;
   if(!item||typeof item!=='object'){
     errors.push('invalid or missing source item at index '+i);
     continue;
   }
   if(entry?.sourceItemId!==item.sourceItemId||
      entry?.itemId!==item.itemId||
      adv?.textRu!==item.textRu||
      adv?.boundItem?.itemId!==item.itemId||
      adv?.boundItem?.sourceRevision!==item.sourceRevision||
      adv?.boundItem?.reviewFingerprint!==item.reviewFingerprint||
      adv?.boundItem?.textFingerprint!==item.textFingerprint||
      adv?.boundItem?.audioFingerprint!==null)
      errors.push('stale or misrouted RE61 packet '+item.sourceItemId);
   if(!adv||adv.schema!=='RUE_RU03_ADVISORY_V1'||
      adv.reviewAuthority!=='NONE'||adv.humanApproval!==false||
      adv.textApproved!==false||adv.audioApproved!==false||
      adv.canonicalPublicationReady!==false||
      adv.productionReleaseReady!==false||adv.status!=='AI_ADVISORY_PENDING_INDEPENDENT_REVIEW')
      errors.push('RUE claim may not grant authority '+item.sourceItemId);
   if(adv){
     if(adv.projectId!=='project:blueprint-russian-expert-engine'||
        adv.targetProjectId!=='project:bauman-master-ai-system'||
        !Array.isArray(adv.claims)||adv.claims.length!==1||
        adv.claims.some(claim=>
          claim.sourceId!=='gramota'||
          claim.sourceUrl!=='https://gramota.ru/'||
          claim.use!==(item.sourceItemId==='LW_ITEM_R02_INTRO'?'ORTHOEPY':'WORD_STRESS')||
          claim.evidenceStatus!=='UNVERIFIED_SOURCE_POINTER'||
          typeof claim.note!=='string'||!claim.note.includes('Dictionary lookup target only')))
       errors.push('unsupported external lexical claim scope '+item.sourceItemId);
     const {advisorySha256,...body}=adv;
     if(!/^[a-f0-9]{64}$/.test(advisorySha256||'')||
       sha256(JSON.stringify(body))!==advisorySha256)
       errors.push('RUE advisory hash mismatch '+item.sourceItemId);
     if(!Array.isArray(adv.claims)||adv.claims.some(claim=>
       !['UNVERIFIED_SOURCE_POINTER','SOURCE_ANCHORED_AI_CANDIDATE'].includes(claim.evidenceStatus)||
       typeof claim.surface!=='string'||
       !item.textRu.toLowerCase().includes(claim.surface.toLowerCase())))
       errors.push('unbound/unauthorized lexical source claim '+item.sourceItemId);
   }
   const lex=entry?.lexicalEvidence, expectedLex=lexicalPins[item.sourceItemId];
   if(!lex||!expectedLex||
      lex.surface!==expectedLex.surface||
      lex.headwordWithStress!==expectedLex.headwordWithStress||
      lex.scope!==expectedLex.scope||lex.url!==expectedLex.url||
      adv?.claims?.[0]?.surface!==expectedLex.surface||
      lex.sourceId!=='gramota'||
      lex.status!=='PUBLIC_DICTIONARY_PAGE_OBSERVED_LEXEME_ONLY'||
      lex.rights!=='LINK_ONLY_NO_COPY'||
      lex.sentenceMeaningApproved!==false||lex.prosodyApproved!==false||
      lex.humanRu03Approved!==false||
      typeof lex.surface!=='string'||!item.textRu.toLowerCase().includes(lex.surface.toLowerCase())||
      typeof lex.headwordWithStress!=='string'||!lex.headwordWithStress||
      typeof lex.scope!=='string'||!lex.scope||
      typeof lex.url!=='string'||!lex.url.startsWith('https://gramota.ru/poisk?'))
     errors.push('RUE lexical note must remain source-located and non-authoritative '+item.sourceItemId);
   const grammar=entry?.grammarEvidence, expectedGrammar=re67PatternPins[item.sourceItemId];
   if(!grammar||!expectedGrammar||
      grammar.schema!=='RUE_RE67_SCOPED_RUSSIAN_GRAMMAR_ADVISORY_V1'||
      grammar.sourceItemId!==item.sourceItemId||
      grammar.lessonId!==item.lessonId||
      grammar.candidateText!==item.textRu||
      grammar.canonicalTextSha256!==sha256(item.textRu)||
      grammar.candidateTextSha256!==sha256(item.textRu)||
      grammar.exactCanonicalText!==true||
      grammar.patternId!==expectedGrammar.code||
      !['ATTESTED_PATTERN_ONLY','CANONICAL_EXAMPLE_MATCH_ONLY'].includes(grammar.patternStatus)||
      (expectedGrammar.sourceId===null
        ? grammar.sourceLocator!==null
        : (grammar.sourceLocator?.id!==expectedGrammar.sourceId||
           grammar.sourceLocator?.url!==expectedGrammar.url||
           grammar.sourceLocator?.scope!==expectedGrammar.scope))||
      grammar.detectedConcern!==false||
      grammar.acceptedAsCorrect!==false||
      grammar.errorProven!==false||
      grammar.grammarScore!==null||
      grammar.phoneticsScore!==null||
      grammar.stressApproved!==false||
      grammar.humanRu03Approved!==false||
      grammar.readyForLearning!==false||
      grammar.noLearnerData!==true||
      grammar.authority!=='AI_ADVISORY_PATTERN_ONLY_NO_AUTOMATIC_QUALITY_GATE'||
      typeof grammar.note!=='string'||grammar.note.length>800)
      errors.push('RE67 text-pattern evidence cannot certify any sentence '+item.sourceItemId);
   if(grammar){
     const {advisorySha256,...body}=grammar;
     if(!/^[a-f0-9]{64}$/.test(advisorySha256||'')||
        advisorySha256!==sha256(JSON.stringify(body)))
       errors.push('RE67 grammar evidence hash mismatch '+item.sourceItemId);
   }
   const dialog=entry?.dialogueEvidence, expectedDialog=re68IntentPins[item.sourceItemId];
   if(item.lessonId==='R02'){
     if(dialog!==null)errors.push('RE68 R02 must not invent a dialogue review');
   }else{
     if(!dialog||!expectedDialog||
        dialog.schema!=='RUE_RE68_DIALOGUE_VARIANT_ADVISORY_V1'||
        dialog.sourceItemId!==item.sourceItemId||
        dialog.lessonId!==item.lessonId||
        dialog.communicativeContext!==expectedDialog.context||
        dialog.sourceLocator?.id!==expectedDialog.source||
        dialog.sourceLocator?.url!==expectedDialog.url||
        dialog.sourceLocator?.scope!==expectedDialog.scope||
        dialog.candidateTextSha256!==sha256(item.textRu)||
        dialog.canonicalTextSha256!==sha256(item.textRu)||
        dialog.exactCanonicalText!==true||
        dialog.variantStatus!=='SAME_LOCAL_COMMUNICATIVE_INTENT'||
        dialog.variantId!==expectedDialog.code||
        typeof dialog.explanation!=='string'||dialog.explanation.length>900||
        dialog.grade!==null||dialog.grammarCorrectness!==null||
        dialog.errorProven!==false||
        dialog.pronunciationScore!==null||
        dialog.phraseAudioVerified!==false||
        dialog.sourceAuthority!=='PUBLIC_SOURCE_SUPPORTS_LIMITED_FORM_OR_FUNCTION_ONLY'||
        dialog.independentGoldAvailable!==false||
        dialog.humanRu03Approved!==false||dialog.readyForLearning!==false||
        dialog.learnerMasteryWrite!==false||dialog.advisoryOnly!==true)
       errors.push('RE68 intent cannot confer linguistic authority '+item.sourceItemId);
     if(dialog){
       const {evidenceSha256,...body}=dialog;
       if(!/^[a-f0-9]{64}$/.test(evidenceSha256||'')||
          evidenceSha256!==sha256(JSON.stringify(body)))
         errors.push('RE68 variant evidence SHA mismatch '+item.sourceItemId);
     }
   }
   const x=entry?.preflight;
   if(!x||x.grammar!=='UNVERIFIED_NEEDS_SOURCE_AND_RKI_REVIEW'||
      x.stress!=='UNVERIFIED_NEEDS_LEXICAL_SOURCE_REVIEW'||
      x.phonetics!=='UNVERIFIED_NO_HUMAN_VOICE'||
      x.audioQa!=='BLOCKED_NO_IMMUTABLE_LICENSED_RECORDING'||
      x.pronunciationScore!==null||x.readyForLearning!==false)
     errors.push('AI preflight cannot pronounce a human verdict '+item.sourceItemId);
 }
 if(!/^[a-f0-9]{64}$/.test(bundle?.bundleSha256||''))errors.push('missing bundle SHA');
 else {
   const {bundleSha256,...payload}=bundle;
   if(bundleSha256!==sha256(JSON.stringify(payload)))errors.push('forged bundle SHA');
 }
 return Object.freeze({ok:errors.length===0,errors,itemCount:request?.sourceItems?.length||0,
   humanApproval:false,canonicalPublicationReady:false});
}
