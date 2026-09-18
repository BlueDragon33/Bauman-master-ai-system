import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const fail=m=>{throw new Error(`RUSSIAN_HANDWRITING_MOTOR_GATE=FAIL\n${m}`)};
const assert=(v,m)=>{if(!v)fail(m)};

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_HANDWRITING_MOTOR_PRACTICE_CONTRACT_V1','Unexpected handwriting motor schema');
  assert(JSON.stringify(c.stages)===JSON.stringify(['trace','copy','connect','free']),'Motor stage sequence drifted');
  assert(c.existingRuntime?.reuseWritingCanvas===true&&c.existingRuntime?.createSecondCanvas===false,'Motor practice must reuse the core canvas');
  assert(c.existingRuntime?.preserveCoreStrokeGuidance===true,'Core stroke guidance must be preserved');
  assert(c.connection?.useAdjacentCyrillicLetters===true&&c.connection?.renderAsCursive===true,'Connection practice contract incomplete');
  assert(c.evidence?.pointerStrokeCount===true&&c.evidence?.perLetter===true&&c.evidence?.perStage===true,'Motor evidence requirements incomplete');
  assert(c.evidence?.learnerStateAuthority===false&&c.evidence?.masteryMutation===false,'Motor coach may not own mastery');
  return true;
}

export function validateRuntime(js,core,index){
  assert(js.includes("const STAGES=['trace','copy','connect','free']"),'Runtime motor stage sequence missing');
  assert(js.includes("event.target?.id==='writingCanvas'"),'Runtime does not observe the existing writing canvas');
  assert(!js.includes('<canvas'),'Motor coach must not create a second canvas');
  assert(js.includes("data-hand-practice=\"trace\"")&&js.includes("data-hand-practice=\"free\""),'Motor coach does not reuse core practice modes');
  assert(js.includes("function connectionPair()"),'Letter connection practice missing');
  assert(js.includes("strokes:Number(old.strokes||0)"),'Per-stage stroke evidence missing');
  assert(!js.includes('mastered'),'Motor runtime must not promote mastery');
  assert(core.includes('function handwritingStrokeSteps(item)'),'Existing stroke guidance function missing');
  assert(core.includes('strokeMiniSvg'),'Existing stroke visualization missing');
  assert(core.includes('id="writingCanvas"'),'Existing writing canvas missing');
  assert(index.includes('<script src="assets/handwriting-motor-coach.js"></script>'),'Motor coach is not loaded');
  assert(index.includes('<link rel="stylesheet" href="assets/handwriting-motor-coach.css">'),'Motor coach CSS is not loaded');
  return true;
}

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/handwriting-motor-practice-contract.v1.json','utf8'));
  validateContract(c);
  validateRuntime(
    fs.readFileSync('subjects/russian/assets/handwriting-motor-coach.js','utf8'),
    fs.readFileSync('subjects/russian/assets/core.js','utf8'),
    fs.readFileSync('subjects/russian/index.html','utf8')
  );
  return c;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_HANDWRITING_MOTOR_GATE=PASS');
  console.log(JSON.stringify({stages:4,reusesCanvas:true,separateEvidence:true,masteryAuthority:false},null,2));
}
