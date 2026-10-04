import assert from 'node:assert/strict';
import fs from 'node:fs';

const router=fs.readFileSync('subjects/math/assets/theory_skin/theory-tab-E129.js','utf8');
const studio=fs.readFileSync('subjects/math/assets/math-activity-studio.js','utf8');

for(const [activity,source] of Object.entries({
  exercises:'exercise_content',
  practice:'simulation_content',
  application:'application_content',
  review:'review_pack_content',
  exam:'question_bank_content'
})){
  assert.match(router,new RegExp(activity+"\\s*:\\s*'"+source+"'"),activity+' must route to '+source);
  assert.ok(studio.includes('data/'+source+'.json'),source+' must be fetched by canonical Math Activity Studio');
}
assert.match(router,/data-e170-owner="math-activity-studio"/,'E170 must declare Math Activity Studio as the activity renderer owner');
assert.match(router,/BAUMAN_MATH_ACTIVITY_STUDIO&&window\.BAUMAN_MATH_ACTIVITY_STUDIO\.refresh/,'E170 must refresh canonical Activity Studio after routing');
assert.doesNotMatch(router,/function e170VaultRecords/,'E170 must not keep a second Content Vault renderer');
assert.doesNotMatch(router,/function e170ActivityCard/,'E170 must not duplicate canonical Activity Studio cards');
assert.match(studio,/function matched\(sourceKind,raw\)/,'Activity Studio must own source matching');
assert.match(studio,/\(!!id&&rid===id\)\|\|\(!id&&!!ch&&rch===ch\)/,'Activity Studio must match lesson first or selected chapter');
assert.match(router,/data-e170-activity=/,'E170 rendered activity shell marker missing');
console.log('MATH_E170_ACTIVITY_ROUTER_CONTRACT_PASS');
