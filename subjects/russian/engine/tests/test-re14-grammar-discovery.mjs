import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createGrammarDiscoverySession,validateGrammarDiscoveryUnit} from '../grammar/grammar-discovery.mjs';

const fixture=JSON.parse(fs.readFileSync(new URL('../content/fixtures/grammar-discovery.v1.json',import.meta.url),'utf8'));
const unit=fixture.units[0];
assert.equal(validateGrammarDiscoveryUnit(unit).ok,true);

const session=createGrammarDiscoverySession(unit);
assert.equal(session.currentExposure().surface,'Я вижу Машу.');
session.nextExposure();
assert.equal(session.currentExposure().surface,'Я знаю Анну.');

const early=session.markDiscovered();
assert.equal(early.discovered,false);

assert.equal(session.submitPrediction({prediction:'Машу',expected:'Машу'}).success,true);
assert.equal(session.submitPrediction({prediction:'Анну',expected:'Анну'}).success,true);
const discovered=session.markDiscovered();
assert.equal(discovered.discovered,true);

const explanation=session.revealExplanation();
assert.equal(explanation.authoritativeSourceRequired,true);
assert.equal(explanation.canonicalGrammarRef,unit.canonicalGrammarRef);

const transfer=session.transferProbe();
assert.equal(transfer.base,'Нина');
assert.equal(transfer.expectedPattern,'Нину');

const snapshot=session.snapshot();
assert.equal(snapshot.discovered,true);
assert.equal(snapshot.observations.every(x=>x.authoritative===false),true);
assert.equal(snapshot.observations.every(x=>x.masteryMutation===false),true);

console.log(JSON.stringify({
 ok:true,
 exposureBeforeRule:true,
 discoveryRequiresPatternEvidence:true,
 explanationUsesCanonicalRef:true,
 transferProbe:true,
 masteryMutation:false
}));
