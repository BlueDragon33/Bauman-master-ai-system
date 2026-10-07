import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createLevelCatalog,validateLevelCatalog} from '../progression/level-catalog.mjs';

const levels=JSON.parse(fs.readFileSync(new URL('../content/levels/levels.v1.json',import.meta.url),'utf8'));
const canonical=JSON.parse(fs.readFileSync(new URL('../../docs/ru02/RUSSIAN_RU02_CURRICULUM_CANONICAL_MODEL.json',import.meta.url),'utf8'));
const competencyIds=canonical.competencies.map(x=>x.id);

const validation=validateLevelCatalog(levels,competencyIds);
assert.equal(validation.ok,true,validation.errors.join('; '));
assert.equal(validation.count,100);

const catalog=createLevelCatalog(levels,competencyIds);
assert.equal(catalog.count,100);
assert.equal(catalog.getLevel('RL001').band,1);
assert.equal(catalog.getLevel('RL100').band,10);
assert.equal(catalog.levelsForBand(1).length,10);
assert.equal(catalog.levelsForBand(10).length,10);
assert.equal(catalog.nextLevel('RL001').id,'RL002');
assert.equal(catalog.nextLevel('RL100'),null);
assert.equal(catalog.milestoneLevels().length,10);

for(let i=10;i<=100;i+=10){
 const level=catalog.getLevel(`RL${String(i).padStart(3,'0')}`);
 assert.equal(level.progression.transferGate,true);
 assert.equal(level.progression.retentionGate,true);
 assert(level.promotion.requiredEvidence.includes('unseen-transfer'));
 assert(level.promotion.requiredEvidence.includes('delayed-retention'));
}

for(const level of levels.levels){
 assert.equal(level.promotion.authority,'RU04/C4');
 assert.equal(level.promotion.clickOrTimeCompletionAccepted,false);
 assert.equal(level.officialMapping.certified,false);
 assert.equal(level.officialMapping.cefr,null);
}

assert(catalog.levelsForCompetency('COMP-RU-LISTEN').length>0);
console.log(JSON.stringify({ok:true,levels:catalog.count,bands:10,milestones:catalog.milestoneLevels().length,officialCefrClaims:0,authority:'RU04/C4'}));
