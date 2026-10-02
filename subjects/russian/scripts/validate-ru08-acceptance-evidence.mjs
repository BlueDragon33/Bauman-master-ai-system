import fs from 'node:fs';
import assert from 'node:assert/strict';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const matrix=j('subjects/russian/docs/ru08/RUSSIAN_RU08_ACCEPTANCE_MATRIX.json');
const evidence=j('subjects/russian/docs/ru08/RUSSIAN_RU08_ACCEPTANCE_EVIDENCE.json');
assert.equal(evidence.kind,'RUSSIAN_RU08_ACCEPTANCE_EVIDENCE');
function checkGroup(group,expected,label){
  for(const id of expected){
    const rows=group[id];
    assert(Array.isArray(rows)&&rows.length, label+' missing evidence: '+id);
    for(const row of rows){
      assert(row.path&&fs.existsSync(row.path),label+' evidence path missing '+id+': '+row.path);
      assert(['browser','runtime','validator','audit'].includes(row.type),label+' invalid evidence type '+id);
      assert(row.execution,label+' missing execution mode '+id);
    }
  }
  const unexpected=Object.keys(group).filter(x=>!expected.includes(x));
  assert.deepEqual(unexpected,[],label+' evidence has stale entries: '+unexpected.join(','));
}
const journeyIds=Object.keys(matrix.journeys||{});
const failureIds=matrix.failureMatrix||[];
checkGroup(evidence.journeys,journeyIds,'journey');
checkGroup(evidence.failures,failureIds,'failure');
for(const id of journeyIds){
  assert(evidence.journeys[id].some(x=>x.type==='browser'),'journey requires browser evidence: '+id);
}
for(const id of ['beginner','survival','university','technical','research','author']){
  assert(journeyIds.includes(id),'required journey absent from matrix: '+id);
}
assert.equal(evidence.releaseBoundary.liveProductionNotProvenByRu08,true);
assert.equal(evidence.releaseBoundary.releaseAnnex,'prompts/constitution/C3_RELEASE_ANNEX_SHARED.md');
assert(fs.existsSync(evidence.releaseBoundary.releaseAnnex),'canonical shared Release Annex path missing');
assert.equal(evidence.releaseBoundary.stableRequiresObservationPass,true);
console.log(JSON.stringify({ok:true,journeys:journeyIds.length,failures:failureIds.length,browserBoundJourneys:journeyIds.length}));