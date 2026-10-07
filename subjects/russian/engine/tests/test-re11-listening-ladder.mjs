import assert from 'node:assert/strict';
import {createListeningLadder,evaluateListeningAttempt,recommendListeningVariant,LISTENING_TIERS} from '../listening/listening-ladder.mjs';

const target={targetId:'T-GIVE-BALL',semanticRef:'SEM-REQUEST-OBJECT',audioText:'Дай мяч.'};
const variants=createListeningLadder(target);
assert.equal(variants.length,5);
assert.equal(LISTENING_TIERS.length,5);
assert.equal(variants[0].rate,.7);
assert.equal(variants[2].rate,1);
assert.equal(variants.every(x=>x.transcriptPolicy==='hidden'),true);
assert.equal(variants[4].noise,'mild');

const supported=evaluateListeningAttempt({variant:variants[0],success:true,supportLevel:3});
assert.equal(supported.independent,false);
assert.equal(supported.authoritative,false);

const independent=evaluateListeningAttempt({variant:variants[0],success:true,supportLevel:0});
assert.equal(independent.independent,true);

assert.equal(recommendListeningVariant({variants,recentEvidence:[]}).tier,0);
assert.equal(recommendListeningVariant({variants,recentEvidence:[independent]}).tier,1);

const tier1=evaluateListeningAttempt({variant:variants[1],success:true,supportLevel:0});
assert.equal(recommendListeningVariant({variants,recentEvidence:[independent,tier1]}).tier,2);

const failedNormal=evaluateListeningAttempt({variant:variants[2],success:false,supportLevel:0});
assert.equal(recommendListeningVariant({variants,recentEvidence:[independent,tier1,failedNormal]}).tier,2);

console.log(JSON.stringify({
 ok:true,
 variants:variants.length,
 normalNativeTier:2,
 transcriptDefault:'hidden',
 supportedSuccessIsIndependent:false,
 masteryMutation:false
}));
