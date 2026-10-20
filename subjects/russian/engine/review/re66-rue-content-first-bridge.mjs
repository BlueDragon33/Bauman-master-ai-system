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
 for(let i=0;i<(request?.sourceItems||[]).length;i++){
   const item=request.sourceItems[i],entry=bundle?.advisories?.[i],adv=entry?.advisory;
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
