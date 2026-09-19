import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const fail=m=>{throw new Error(`RUSSIAN_LISTENING_LADDER_GATE=FAIL\n${m}`)};
const assert=(v,m)=>{if(!v)fail(m)};

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_LISTENING_LADDER_CONTRACT_V1','Unexpected listening ladder schema');
  assert(JSON.stringify(c.stages)===JSON.stringify(['normal_gist','focused_replay','repair_slow','detail_check']),'Listening ladder order drifted');
  assert(c.policy?.minimumNormalPlaysBeforeSlow===2,'Slow repair must require two normal-speed plays');
  assert(c.policy?.slowIsRepairOnly===true&&c.policy?.preserveHearBeforeSee===true,'Listening repair/hear-before-see policy weakened');
  assert(c.policy?.translationAnswerForbidden===true,'Translation answers must remain forbidden');
  assert(c.policy?.playbackCompletionEvidenceRequired===true&&c.policy?.failedPlaybackDoesNotUnlock===true,'Listening evidence must require successful playback start');
  assert(c.runtime?.reuseCoreNormalListen===true&&c.runtime?.reuseCoreSlowListen===true&&c.runtime?.createSecondAudioPlayer===false,'Listening ladder must reuse core audio controls');
  assert(c.runtime?.playbackCompletedEvent==='russian:listening-playback-completed','Listening playback event contract drifted');
  assert(c.evidence?.playbackCompletionConfirmed===true,'Listening evidence must be playback-confirmed');
  assert(c.evidence?.learnerStateAuthority===false&&c.evidence?.masteryMutation===false,'Listening ladder may not own mastery');
  return true;
}

export function validateRuntime(js,core,index){
  assert(js.includes("const SCHEMA='RUSSIAN_LISTENING_LADDER_V1'"),'Listening ladder runtime missing');
  assert(js.includes("clickCore('speak-line')"),'Normal/focused listening does not reuse core normal listen');
  assert(js.includes("clickCore('speak-line-slow')"),'Slow repair does not reuse core slow listen');
  assert(!js.includes('<audio'),'Listening ladder must not create a second audio player');
  assert(js.includes("ctx.heardCount>=2"),'Slow repair is not gated by two normal plays');
  assert(js.includes("russian:listening-playback-completed"),'Listening ladder is not bound to playback-completion evidence');
  assert(!js.includes("setTimeout(()=>{record('normal')"),'Listening normal evidence still uses timer instead of playback-completion confirmation');
  assert(!js.includes("setTimeout(()=>{record('focused')"),'Listening focused evidence still uses timer instead of playback-completion confirmation');
  assert(!js.includes("setTimeout(()=>record('slow')"),'Listening slow evidence still uses timer instead of playback-completion confirmation');
  assert(js.includes("data-listen-detail"),'Detail check missing');
  assert(js.includes(".split(/\\s+/)"),'Listening detail tokenizer must split on whitespace');
  assert(!js.includes(".split(/s+/)"),'Broken literal-s tokenizer returned');
  assert(!js.includes('meaning_vi')&&!js.includes('translation_vi'),'Translation semantic answer leaked into listening ladder');
  assert(!js.includes('mastered'),'Listening ladder must not promote mastery');
  assert(core.includes('practiceLineHeardCount'),'Core heard-count helper missing');
  assert(core.includes("onStart:meta=>{if(inPracticeMode()){markPracticeLineHeard(d,idx);render()}"),'Core still counts listening before playback starts');
  assert(core.includes("notifyListeningPlayback(d,idx,'normal',meta)"),'Core normal playback-completion event missing');
  assert(core.includes("notifyListeningPlayback(d,idx,'slow',meta)"),'Core slow playback-completion event missing');
  assert(core.includes("const slowReady=heardCount>=2;"),'Core slow-listen readiness is not two-listen gated');
  assert(index.includes('<script src="assets/listening-ladder.js"></script>'),'Listening ladder is not loaded');
  return true;
}

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/listening-ladder-contract.v1.json','utf8'));
  validateContract(c);
  validateRuntime(
    fs.readFileSync('subjects/russian/assets/listening-ladder.js','utf8'),
    fs.readFileSync('subjects/russian/assets/core.js','utf8'),
    fs.readFileSync('subjects/russian/index.html','utf8')
  );
  return c;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_LISTENING_LADDER_GATE=PASS');
  console.log(JSON.stringify({normalBeforeSlow:2,gist:true,detail:true,translationAnswers:false,playbackStartEvidence:true},null,2));
}
