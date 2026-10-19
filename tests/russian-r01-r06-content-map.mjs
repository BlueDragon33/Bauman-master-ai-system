import assert from 'node:assert/strict';
import fs from 'node:fs';

const base='subjects/russian/';
const load=path=>JSON.parse(fs.readFileSync(base+path,'utf8'));
const manifest=load('engine/content/fixtures/r01-r06-source-bound-practice-map.candidate.json');
const curriculum=load('data/curriculum.json');
const lessons=load('data/listen-write-lessons.json');
const rules=load('data/listen-write-level-rules.json');
const provenance=load('data/provenance.json');
const reviewer=load('engine/content/review/ru03-reviewers.v1.json');
const order=['listen_without_transcript','imitate_without_scoring','ground_in_scene',
  'recognize_print','optional_trace_or_write','respond_or_dictate','self_review'];
const planned=['R01','R02','R03','R04','R05','R06'];
assert.equal(manifest.schemaVersion,'RUSSIAN_R01_R06_SOURCE_BOUND_PRACTICE_MAP_V1');
assert.equal(manifest.status,'CANDIDATE_NONCANONICAL_UNVERIFIED');
assert.equal(manifest.canonicalMutation,false);
assert.equal(manifest.published,false);
assert.equal(manifest.ru03Reviewer,null);
assert.equal(manifest.translationPolicy.defaultVisible,false);
assert.match(manifest.audioPolicy,/unverified/);
assert.match(manifest.exposurePolicy,/mastery/);
assert.equal(reviewer.reviewers.length,0,'Independent RU03 registry must not be invented');
assert.ok(!provenance.datasets.some(r=>r.status==='VERIFIED'),
  'Media review must be reconsidered when canonical datasets gain verified authority');
assert.deepEqual(curriculum.modules.find(x=>x.stage==='vn')?.lessonIds,planned);
assert.deepEqual(manifest.lessonPlans.map(p=>p.lessonId),planned);

let total=0,drills=0,blocked=[];
const ids=new Set();
for(const plan of manifest.lessonPlans){
  const source=lessons.find(x=>x.lessonId===plan.lessonId);
  const band=rules.bands.find(x=>x.lessonIds.includes(plan.lessonId));
  assert.ok(source&&band,'Missing known owner or level for '+plan.lessonId);
  assert.equal(plan.sourceLessonId,source.id);
  assert.equal(plan.sourceOwner,'subjects/russian/data/listen-write-lessons.json');
  assert.equal(plan.sourceLevel,source.level);
  assert.equal(plan.sourceBand,band.level);
  assert.equal(plan.scenarioCue.authority,'SYMBOL_PREVIEW_ONLY');
  assert.equal(plan.scenarioCue.licensedIllustration,null);
  assert.equal(plan.microPractices.length,source.items.length);
  for(let i=0;i<source.items.length;i++){
    const item=source.items[i],entry=plan.microPractices[i];
    assert.ok(!ids.has(entry.practiceId),'Repeated practice identity '+entry.practiceId);
    ids.add(entry.practiceId);
    assert.equal(entry.sourceItemId,item.id);
    assert.deepEqual(entry.sourceDrillKinds,item.drills.map(d=>d.kind));
    assert.deepEqual(entry.stages,order);
    assert.equal(entry.promptsFromSourceOnly,true);
    assert.equal(entry.semanticAuthority,'UNVERIFIED');
    assert.equal(entry.sampleAudioAuthority,'BLOCKED_NO_RU03_AUDIO_HASH');
    assert.equal(entry.handwritingAuthority,'BLOCKED_NO_LICENSED_CYRILLIC_GLYPH');
    assert.equal(entry.screenshotImageAuthority,'UNVERIFIED_SYMBOL_ONLY');
    for(const gate of ['RUSSIAN_NATIVE_REGISTER','PHONETICS_STRESS','ANSWER_KEY','AUDIO_SHA256','MEDIA_LICENSE'])
      assert.ok(entry.reviewRequired.includes(gate),'Missing RU03 review gate '+gate);
    const equal=item.drills[0].audioText===item.drills[0].answer;
    assert.equal(entry.sourceAudioEqualsWrittenAnswer,equal);
    assert.equal(entry.textMatchEligibility,equal?'PROVISIONAL_TEXT_ONLY':'BLOCKED_AUDIO_TEXT_DIFFERS_FROM_WRITTEN_ANSWER');
    if(!equal)blocked.push(entry.sourceItemId);
    total++;drills+=item.drills.length;
  }
}
assert.equal(total,12);
assert.equal(drills,13);
assert.deepEqual(blocked,['LW_ITEM_R05_VECTOR']);
assert.equal(manifest.scope.lessons,6);
assert.equal(manifest.scope.sourceItems,total);
assert.equal(manifest.scope.totalDrills,drills);
const data=JSON.stringify(manifest);
for(const danger of ['"canonical": true','"mediaAssetStatus": "VERIFIED"','"textScore": 100','"ttsApproved": true'])
  assert.ok(!data.includes(danger),'False canonical media authority: '+danger);
console.log('RUSSIAN_R01_R06_SOURCE_MAP_PASS',JSON.stringify({
  lessons:6,sourceItems:total,drills,sourceAudioAndAnswerMismatch:blocked,
  candidateOnly:true,defaultTranslationsHidden:true,mediaAndRU03FailClosed:true,
  canonicalWrites:false
}));
