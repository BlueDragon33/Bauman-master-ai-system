import fs from 'node:fs';

const text = value => typeof value === 'string' ? value.trim() : '';
const SOURCE_KINDS = new Set(['NORMATIVE_DICTIONARY','DESCRIPTIVE_MEDIA_CORPUS','TEACHING_FRAMEWORK','ASR_DATASET']);
const USES = new Set(['WORD_STRESS','ORTHOEPY_REFERENCE','NATURAL_SPEECH_CONTEXT','PROSODY_COMPARISON','RKI_CURRICULUM','PHONETICS_PEDAGOGY','ASR_EVALUATION','ACCENT_VARIATION']);
const KINDS_TO_USES = Object.freeze({
  NORMATIVE_DICTIONARY: ['WORD_STRESS','ORTHOEPY_REFERENCE'],
  DESCRIPTIVE_MEDIA_CORPUS: ['NATURAL_SPEECH_CONTEXT','PROSODY_COMPARISON'],
  TEACHING_FRAMEWORK: ['RKI_CURRICULUM','PHONETICS_PEDAGOGY'],
  ASR_DATASET: ['ASR_EVALUATION','ACCENT_VARIATION']
});

export function loadRu03ReferenceLibrary() {
  return JSON.parse(fs.readFileSync(new URL('../content/review/ru03-reference-library.v1.json', import.meta.url),'utf8'));
}

export function validateRu03ReferenceLibrary(library) {
  const errors = [];
  if(library?.schema !== 'RUSSIAN_ENGINE_RU03_REFERENCE_LIBRARY_V1')errors.push('invalid reference library schema');
  if(library?.status !== 'ADVISORY_ONLY' || library?.reviewAuthority !== 'NONE' || library?.humanApproval !== false)errors.push('library must not claim review authority');
  if(!Array.isArray(library?.sources) || !library.sources.length)errors.push('sources required');
  const ids = new Set();
  for(const source of Array.isArray(library?.sources) ? library.sources : []) {
    const id = text(source?.sourceId);
    if(!id || ids.has(id))errors.push('missing or duplicate sourceId: ' + id);
    ids.add(id);
    if(!text(source?.title))errors.push(id + ': title required');
    try {
      const u = new URL(source?.url);
      if(u.protocol !== 'https:' || u.username || u.password)errors.push(id + ': safe https URL required');
    } catch { errors.push(id + ': invalid URL'); }
    if(!SOURCE_KINDS.has(source?.kind))errors.push(id + ': unsupported kind');
    if(!Array.isArray(source?.uses) || !source.uses.length || source.uses.some(use => !USES.has(use) || !KINDS_TO_USES[source.kind]?.includes(use)))errors.push(id + ': unsupported evidence use');
    if(!['LINK_ONLY','PROVIDER_DOWNLOAD_ONLY'].includes(source?.access))errors.push(id + ': access mode required');
    if(!text(source?.license) || source?.redistribution !== 'PROHIBITED')errors.push(id + ': licensing/rehosting safeguard required');
    if(source?.reviewed !== 'SOURCE_METADATA_CHECKED')errors.push(id + ': source metadata status required');
    if(!text(source?.notes))errors.push(id + ': usage notes required');
    if(source?.kind === 'ASR_DATASET' && source?.access !== 'PROVIDER_DOWNLOAD_ONLY')errors.push(id + ': ASR source must use provider download');
    if(source?.textAuthority || source?.audioAuthority || source?.humanApproval)errors.push(id + ': source cannot issue RU03 approval');
  }
  return Object.freeze({ok: errors.length === 0, errors, sourceCount: ids.size, textApproved: false, audioApproved: false, canonicalPublicationReady: false});
}

export function buildRu03ReferenceGuide({library = loadRu03ReferenceLibrary()} = {}) {
  const valid = validateRu03ReferenceLibrary(library);
  if(!valid.ok)throw new Error('RU03 reference library invalid: ' + valid.errors.join('; '));
  const pointers = library.sources.map(source => Object.freeze({
    sourceId: source.sourceId, title: source.title, url: source.url,
    kind: source.kind, uses: Object.freeze([...source.uses]),
    access: source.access, redistribution: source.redistribution,
    evidenceStatus: 'DISCOVERY_POINTER_ONLY'
  }));
  return Object.freeze({
    schema:'RUSSIAN_ENGINE_RU03_REFERENCE_GUIDE_V1',
    status:'ADVISORY_ONLY', authority:'NONE',
    scope:'GENERAL_REFERENCE_NOT_ITEM_SPECIFIC_EVIDENCE',
    sources:Object.freeze(pointers),
    humanReviewRequired:true, audioInspectionRequired:true,
    canonicalPublicationReady:false
  });
}


// AI-transcribed source-specific pilot norms; independent of the editable evidence claims.
// These are NOT a human certification. Broader coverage must come from a reviewed, versioned gold set.
const PILOT_SHOP_WATER_NORMS = Object.freeze({
  'Можно':'Мо́жно',
  'бутылку':'буты́лку',
  'воды':'воды́',
  'пожалуйста':'пожа́луйста'
});
const withoutStress = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('ru');
export function loadRu03SourceAnchoredPilot() {
  return JSON.parse(fs.readFileSync(new URL('../content/review/ru03-shop-water-pilot.v1.json',import.meta.url),'utf8'));
}
export function validateRu03SourceAnchoredPilot(pilot,item,{library=loadRu03ReferenceLibrary()}={}) {
  const errors=[];
  const lib=validateRu03ReferenceLibrary(library);
  if(!lib.ok)errors.push('reference library invalid');
  if(pilot?.schema!=='RUSSIAN_ENGINE_RU03_SOURCE_ANCHORED_PILOT_V1')errors.push('pilot schema');
  if(pilot?.status!=='AI_EVIDENCE_CANDIDATE'||pilot?.humanApproval!==false||pilot?.textAuthority!=='NONE'||pilot?.audioAuthority!=='NONE'||pilot?.canonicalPublicationReady!==false)errors.push('pilot must remain unapproved');
  if(!item||pilot?.itemId!==item.itemId||pilot?.sourceRevision!==item.sourceRevision||pilot?.textRu!==item.textRu)errors.push('pilot item/revision/text drift');
  if(pilot?.audio?.status!=='NOT_AUDITED'||pilot?.audio?.immutableSha256!==null)errors.push('audio may not be approved or fingerprinted without recording');
  if(!Array.isArray(pilot?.claims)||pilot.claims.length<3)errors.push('insufficient lexical claims');
  const sources=new Set(library?.sources?.filter(x=>x.kind==='NORMATIVE_DICTIONARY' && x.uses.includes('WORD_STRESS')).map(x=>x.sourceId));
  for(const claim of Array.isArray(pilot?.claims)?pilot.claims:[]) {
    if(!sources.has(claim?.sourceId))errors.push('non-normative source for word stress');
    if(!['DICTIONARY_ATTESTED','LEMMA_STRESS_WITH_MORPHOLOGICAL_INFERENCE'].includes(claim?.method))errors.push('claim evidence method');
    if(!String(item?.textRu??'').toLocaleLowerCase('ru').includes(String(claim?.surface??'').toLocaleLowerCase('ru')))errors.push('surface not present in reviewed item');
    if(withoutStress(claim?.stressMarked)!==withoutStress(claim?.surface))errors.push('stress annotation changes lexical surface');
    if(pilot?.itemId==='spatial:rl-05-shop:instruction' && PILOT_SHOP_WATER_NORMS[claim?.surface]!==claim?.stressMarked)errors.push('pilot lexical stress differs from curated reference');
    try {
      const url=new URL(claim?.sourceUrl);
      if(url.protocol!=='https:'||url.hostname!=='gramota.ru')errors.push('untrusted lexical citation URL');
    } catch {errors.push('unparseable lexical citation URL');}
  }
  return Object.freeze({ok:errors.length===0,errors,canonicalPublicationReady:false});
}
export function buildRu03SourceAnchoredPilot(item,{pilot=loadRu03SourceAnchoredPilot(),library=loadRu03ReferenceLibrary()}={}) {
  if(item?.itemId!==pilot.itemId)return null;
  const check=validateRu03SourceAnchoredPilot(pilot,item,{library});
  if(!check.ok)throw new Error('RU03 pilot invalid: '+check.errors.join('; '));
  return Object.freeze({
    status:'AI_EVIDENCE_CANDIDATE', itemId:item.itemId,
    boundReviewFingerprint:item.reviewFingerprint,
    lexicalClaims:structuredClone(pilot.claims),
    unresolved:structuredClone(pilot.unknowns),
    audioStatus:'NOT_AUDITED', reviewerAuthority:'NONE', canonicalPublicationReady:false
  });
}
