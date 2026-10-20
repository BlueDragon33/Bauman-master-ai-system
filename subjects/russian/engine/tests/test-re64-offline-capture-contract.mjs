import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildContentFirstRu03Handoff} from '../review/re61-r02-r04-source-review-handoff.mjs';

const page=readFileSync(new URL('../review/re64-r02-speaker-capture.offline.html',import.meta.url),'utf8');
const handoff=buildContentFirstRu03Handoff();
const phrases=[...page.matchAll(/<blockquote lang="ru" class="phrase">([^<]*)<\/blockquote>/g)]
  .map(x=>x[1]);
const expected=['LW_ITEM_R02_NAME','LW_ITEM_R02_INTRO'].map(id=>
  handoff.reviewItems.find(x=>x.sourceItemId===id)?.textRu);
assert.deepEqual(phrases,expected,'Offline recording kit must preserve verbatim canonical sentences');
assert.equal((page.match(/<article id="slot-/g)||[]).length,2);
assert.ok(page.includes('LW_ITEM_R02_NAME')&&page.includes('LW_ITEM_R02_INTRO'));
assert.ok(page.includes("crypto.subtle.digest('SHA-256'"));
assert.ok(page.includes('navigator.mediaDevices.getUserMedia'));
assert.ok(page.includes('new MediaRecorder('));
assert.ok(page.includes("download(new Blob([JSON.stringify(payload"));
assert.ok(page.includes("autoUploaded:false"));
assert.ok(page.includes('independentRightsVerified:false'));
assert.ok(page.includes('humanRu03Approved:false'));
assert.ok(page.includes('canonicalPublicationReady:false'));
assert.ok(page.includes('SPEAKER_SELF_DECLARATION_ONLY'));
for(const banned of ['XMLHttpRequest','fetch(','sendBeacon(','WebSocket(',
  'https://fonts.','https://cdn.','<iframe','navigator.serviceWorker.register']){
 assert.ok(!page.includes(banned),'Recorder must not upload or depend on external network: '+banned);
}
const section=page.split('<script>')[1]?.split('</script>')[0];
assert.ok(section?.length>2000,'No inline offline recorder logic');
new Function(section);
console.log('RUSSIAN_RE64_OFFLINE_SPEAKER_RECORDER_STATIC_PASS',JSON.stringify({
  sourceSlots:2,exactSentences:true,offlineOnly:true,
  browserCryptoSha256:true,humanConsentRequired:true,noUpload:true,
  micCaptureRuntime:'NOT_TESTED_ON_EXTERNAL_SPEAKER_DEVICE',
  realHumanAudioBytes:0,ru03Approved:false
}));
