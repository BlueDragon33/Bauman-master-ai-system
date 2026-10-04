import assert from 'node:assert/strict';
import fs from 'node:fs';

const src=fs.readFileSync('subjects/math/assets/theory_skin/theory-tab-E129.js','utf8');

for(const [activity,source] of Object.entries({
  exercises:'exercise_content',
  practice:'simulation_content',
  application:'application_content',
  review:'review_pack_content',
  exam:'question_bank_content'
})){
  assert.match(src,new RegExp(activity+"\\s*:\\s*'"+source+"'"),activity+' must route to '+source);
}
assert.match(src,/if\(lessonId\)\{[\s\S]*?exact=xs\.filter[\s\S]*?if\(exact\.length\) return exact;/,'E170 must prefer exact lessonId records');
assert.match(src,/var chapterId=S\(frame&&frame\.chapterId\|\|''\);[\s\S]*?if\(chapterId\) return xs\.filter\(function\(r\)\{return S\(r&&r\.chapterId\)===chapterId;\}\);[\s\S]*?return \[\];/,'E170 must fall back only to current chapter and then empty');
assert.doesNotMatch(src,/chapterId\)[\s\S]{0,240}return xs\s*;/,'E170 must not fall back to records from another chapter');
assert.match(src,/data-e170-activity=/,'E170 rendered activity shell marker missing');
assert.match(src,/Không tìm thấy record trong/,'E170 truthful empty state missing');
console.log('MATH_E170_ACTIVITY_ROUTER_CONTRACT_PASS');
