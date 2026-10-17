import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildRussianWidgetDeck, sha256, widgetLexicalPayload } from '../mobile/widget-deck.mjs';

const at = '2026-10-16T12:00:00.000Z';
const currentReviewers = JSON.parse(readFileSync(new URL('../content/review/ru03-reviewers.v1.json', import.meta.url), 'utf8'));
const provenance = JSON.parse(readFileSync(new URL('../../data/provenance.json', import.meta.url), 'utf8'));
const sourceRef = 'https://example.org/fictional-reviewed-reference';
const item = () => ({
  contentId: 'TEST-RU-001', revision: 'r1', senseId: 'test-sense',
  state: 'PUBLISHED_REFERENCE', provenance: {status:'VERIFIED'},
  validationResult: 'VERIFIED', textRu: 'привет',
  stressMarked: 'приве́т', meaningVi: 'lời chào thân mật',
  stage: 'A1', sourceRefs:[sourceRef]
});
function syntheticCase() {
  const candidate = item();
  const digest = sha256({...widgetLexicalPayload(candidate), sourceRefs:candidate.sourceRefs});
  return {
    candidates:[candidate], generatedAt:at, expiresAt:'2026-10-23T12:00:00.000Z',
    // ALL of these are synthetic in-memory fixtures, NOT actual RU03 approvals.
    publications:{schema:'RUSSIAN_WIDGET_PUBLICATION_REGISTRY_V1',entries:[
      {contentId:candidate.contentId,revision:candidate.revision,state:'PUBLISHED_REFERENCE',contentSha256:digest}
    ]},
    reviewers:{schema:'RUSSIAN_ENGINE_RU03_REVIEWERS_V1',state:'VERIFIED_HUMAN_REVIEWERS',reviewers:[
      {id:'TEST-HUMAN',type:'HUMAN',authority:'RU03',status:'ACTIVE',
       credentialsVerified:true,verificationEvidenceId:'TEST-FIXTURE-NOT-REAL'}
    ]},
    decisions:{schemaVersion:'RUSSIAN_ENGINE_HUMAN_REVIEW_DECISIONS_V1',decisions:[
      {decisionId:'TEST-DECISION',reviewerId:'TEST-HUMAN',reviewerType:'HUMAN',authority:'RU03',
       decision:'APPROVE',decidedAt:at,contentId:candidate.contentId,
       revision:candidate.revision,senseId:candidate.senseId,contentSha256:digest,
       scopes:['RU_TEXT','RU_STRESS','VI_MEANING','SENSE']}
    ]},
    rights:{schema:'RUSSIAN_WIDGET_RIGHTS_V1',entries:[
      {contentId:candidate.contentId,revision:candidate.revision,senseId:candidate.senseId,
       contentSha256:digest,displayAllowed:true,offlineCacheAllowed:true,
       licenseUrl:'https://example.org/test-license',sourceRefs:[sourceRef]}
    ]}
  };
}
function rejected(mutator) {
  const x=syntheticCase();mutator(x);
  return buildRussianWidgetDeck(x);
}
test('current canonical reviewer registry and legacy vocabulary do not grant any export',()=>{
  assert.equal(provenance.datasets.find(x=>x.id==='vocab').status,'UNVERIFIED');
  assert.equal(currentReviewers.reviewers.length,0);
  const deck = buildRussianWidgetDeck({...syntheticCase(),reviewers:currentReviewers});
  assert.equal(deck.items.length,0);
  assert.equal(deck.status,'NO_AUTHORIZED_CONTENT');
  assert.equal(deck.productionReleaseAuthorized,false);
});
test('even synthetic approval fixture needs all independent gates',()=>{
  const deck=buildRussianWidgetDeck(syntheticCase());
  assert.equal(deck.items.length,1); // fixture-only mechanics, never a live approval
  assert.equal(deck.items[0].audio,null);
  assert.equal(deck.learnerMasteryAuthority,false);
});
test('candidate status alone cannot export',()=>{
  assert.equal(rejected(x=>{x.publications=null;}).items.length,0);
  assert.equal(rejected(x=>{x.decisions=null;}).items.length,0);
  assert.equal(rejected(x=>{x.rights=null;}).items.length,0);
  assert.equal(rejected(x=>{x.reviewers=null;}).items.length,0);
});
test('AI or unverified human cannot authorize export',()=>{
  assert.equal(rejected(x=>{x.decisions.decisions[0].reviewerType='AI';}).items.length,0);
  assert.equal(rejected(x=>{x.reviewers.reviewers[0].credentialsVerified=false;}).items.length,0);
});
test('stale digest, changed meaning, incomplete scopes are refused',()=>{
  assert.equal(rejected(x=>{x.candidates[0].meaningVi='changed';}).items.length,0);
  assert.equal(rejected(x=>{x.decisions.decisions[0].scopes.pop();}).items.length,0);
  assert.equal(rejected(x=>{x.publications.entries[0].contentSha256='0'.repeat(64);}).items.length,0);
});
test('invalid provenance, rights, stress, supersession and source links refuse',()=>{
  assert.equal(rejected(x=>{x.candidates[0].provenance.status='UNVERIFIED';}).items.length,0);
  assert.equal(rejected(x=>{x.rights.entries[0].offlineCacheAllowed=false;}).items.length,0);
  assert.equal(rejected(x=>{x.candidates[0].stressMarked='привет';}).items.length,0);
  assert.equal(rejected(x=>{x.candidates[0].supersededByRevision='r2';}).items.length,0);
  assert.equal(rejected(x=>{x.rights.entries[0].sourceRefs=[];}).items.length,0);
});
test('audio remains null without separate rights and matching audio approval',()=>{
  const deck=rejected(x=>{x.candidates[0].audio={url:'https://example.org/a.mp3',sha256:'a'.repeat(64)};});
  assert.equal(deck.items.length,1);
  assert.equal(deck.items[0].audio,null);
});
test('duplicates and malformed time fail closed',()=>{
  const x=syntheticCase();x.candidates.push(structuredClone(x.candidates[0]));
  assert.throws(()=>buildRussianWidgetDeck(x),/duplicate/);
  assert.throws(()=>buildRussianWidgetDeck({...syntheticCase(),generatedAt:'tomorrow'}),/explicit ISO/);
  assert.throws(()=>buildRussianWidgetDeck({...syntheticCase(),expiresAt:at}),/expiry/);
  assert.throws(()=>buildRussianWidgetDeck({...syntheticCase(),expiresAt:'2026-12-31T12:00:00.000Z'}),/expiry/);
  assert.throws(()=>buildRussianWidgetDeck({...syntheticCase(),expiresAt:'invalid'}),/explicit ISO/);
});
test('deterministic revisions for identical reviewed fixtures',()=>{
  assert.equal(buildRussianWidgetDeck(syntheticCase()).contentRevision,
               buildRussianWidgetDeck(syntheticCase()).contentRevision);
});

test('conflicting release or rights history refuses stale approvals',()=>{
  assert.equal(rejected(x=>{
    x.publications.entries.push({...x.publications.entries[0],state:'SUPERSEDED'});
  }).items.length,0);
  assert.equal(rejected(x=>{
    x.rights.entries.push({...x.rights.entries[0],revoked:true});
  }).items.length,0);
  assert.equal(rejected(x=>{
    x.decisions.decisions.push({...x.decisions.decisions[0],decision:'REJECT'});
  }).items.length,0);
});
test('duplicate reviewer identity and competing revisions fail closed',()=>{
  assert.equal(rejected(x=>{
    x.reviewers.reviewers.push({...x.reviewers.reviewers[0],status:'REVOKED'});
  }).items.length,0);
  const competing=syntheticCase();
  competing.candidates.push({...competing.candidates[0],revision:'r2'});
  assert.throws(()=>buildRussianWidgetDeck(competing),/competing revisions/);
});

test('Russian accent markup must match text and stress a vowel', () => {
  assert.equal(rejected(x => {x.candidates[0].stressMarked='приве́та';}).items.length,0);
  assert.equal(rejected(x => {x.candidates[0].stressMarked='привет́';}).items.length,0);
  assert.equal(rejected(x => {x.candidates[0].stressMarked='при́ве́т';}).items.length,0);
  assert.equal(rejected(x => {x.candidates[0].stressMarked='привет';}).items.length,0);
});
test('finite offline lifetime is explicit, not an endlessly cached review decision', () => {
  const deck = buildRussianWidgetDeck(syntheticCase());
  assert.equal(deck.expiresAt,'2026-10-23T12:00:00.000Z');
  assert(Date.parse(deck.expiresAt)>Date.parse(deck.generatedAt));
});

test('Bauman-owned versioned JSON schema declares the consumer surface', () => {
  const schema = JSON.parse(readFileSync(new URL('../mobile/widget-deck.schema.json',import.meta.url),'utf8'));
  const deck = buildRussianWidgetDeck(syntheticCase());
  assert.equal(schema.$id,'bauman:russian:widget-deck:v1');
  assert.equal(schema.properties.schemaVersion.const,deck.schemaVersion);
  assert.deepEqual(schema.required.filter(key=>!(key in deck)),[]);
  assert.deepEqual(Object.keys(deck).filter(key=>!(key in schema.properties)),[]);
  assert.equal(schema.properties.expiresAt.format,'date-time');
  assert.equal(schema.properties.productionReleaseAuthorized.const,false);
  assert.equal(schema.properties.learnerMasteryAuthority.const,false);
  assert.deepEqual(schema.properties.items.items.required.filter(key=>!(key in deck.items[0])),[]);
});
