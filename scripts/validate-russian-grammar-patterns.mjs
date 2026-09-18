import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const fail=m=>{throw new Error('RUSSIAN_GRAMMAR_PATTERN_GATE=FAIL\n'+m)};
const assert=(v,m)=>{if(!v)fail(m)};
const CYR=/[А-Яа-яЁё]/;

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_GRAMMAR_PATTERN_CONTRACT_V1','Unexpected grammar pattern contract');
  assert(JSON.stringify(c.stages)===JSON.stringify(['hear_pattern','speak_pattern','notice_contrast','tiny_rule','immediate_reuse']),'Grammar pattern stage order drifted');
  assert(c.policy?.hearBeforeSpeak===true&&c.policy?.speakBeforeContrast===true&&c.policy?.contrastBeforeRule===true&&c.policy?.ruleBeforeReuse===true,'Pattern sequence weakened');
  assert(c.policy?.detailedLegacyTheoryLockedUntilTinyRule===true,'Detailed theory must stay locked until tiny rule');
  assert(c.policy?.translationAnswerForbidden===true,'Translation answers must remain forbidden');
  assert(c.evidence?.learnerStateAuthority===false&&c.evidence?.masteryMutation===false,'Grammar pattern coach may not own mastery');
  return true;
}

export function validateBridge(data,c,sourceIds){
  assert(data?.schema==='RUSSIAN_GRAMMAR_PATTERN_BRIDGE_DATA_V1','Unexpected grammar bridge schema');
  const entries=Array.isArray(data.entries)?data.entries:[];
  assert(entries.length>=8,'Grammar bridge must cover at least eight high-frequency patterns');
  const ids=new Set();
  for(const e of entries){
    for(const field of c.bridgeFields?.required||[]){
      const value=e?.[field];
      assert(value!==undefined&&value!==null&&(Array.isArray(value)?value.length>0:String(value).trim()!==''),'Missing '+field+' in '+e.id);
    }
    assert(!ids.has(e.id),'Duplicate bridge id: '+e.id);ids.add(e.id);
    assert(sourceIds.has(e.grammar_id),'Orphan grammar mapping: '+e.grammar_id);
    assert(CYR.test(e.heard_pattern)&&CYR.test(e.tiny_rule_ru)&&CYR.test(e.reuse_prompt_ru),'Russian pattern fields missing Cyrillic: '+e.id);
    assert(Array.isArray(e.contrast)&&e.contrast.length===2&&e.contrast.every(x=>CYR.test(String(x))),'Contrast pair invalid: '+e.id);
    for(const f of c.bridgeFields?.prohibited||[])assert(!(f in e),'Translation field leaked into bridge: '+e.id+'.'+f);
  }
  return true;
}

export function validateRuntime(js,css,core,index){
  assert(js.includes("const STAGES=['hear_pattern','speak_pattern','notice_contrast','tiny_rule','immediate_reuse']"),'Runtime stage sequence missing');
  assert(js.includes("u.lang='ru-RU'"),'Pattern audio must use ru-RU');
  assert(js.includes("if(row?.heard<1)return"),'Speak stage is not hear-gated');
  assert(js.includes("if(row?.spoken<1)return"),'Contrast stage is not speak-gated');
  assert(js.includes("if(row?.contrast<1)return"),'Rule stage is not contrast-gated');
  assert(js.includes("row.ruleOpened<1"),'Reuse/theory unlock does not depend on tiny rule');
  assert(js.includes("/[А-Яа-яЁё]/.test(row.reuseDraft||'')"),'Reuse attempt lacks Cyrillic guard');
  assert(!js.includes('meaning_vi')&&!js.includes('clue_en'),'Translation field referenced by pattern runtime');
  assert(!js.includes('mastered'),'Pattern runtime must not synthesize mastery');
  assert(css.includes('.ru-grammar-pattern-locked .grammar-core-grid'),'Legacy theory lock CSS missing');
  assert(core.includes('data-grammar-pattern-id='),'Grammar render does not expose current grammar id');
  assert(core.includes('esc(g.id||'),'Grammar pattern id is not sourced from current grammar module');
  const hostPos=core.indexOf('data-grammar-pattern-id=');
  const gridPos=core.indexOf('grammar-core-grid',hostPos);
  assert(hostPos>=0&&gridPos>hostPos,'Pattern host must precede legacy grammar details');
  assert(index.includes('<script src="assets/grammar-pattern-coach.js"></script>'),'Grammar pattern coach JS not loaded');
  assert(index.includes('<link rel="stylesheet" href="assets/grammar-pattern-coach.css">'),'Grammar pattern coach CSS not loaded');
  return true;
}

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/grammar-pattern-contract.v1.json','utf8'));
  const data=JSON.parse(fs.readFileSync('subjects/russian/data/grammar-pattern-bridge.json','utf8'));
  const gp=JSON.parse(fs.readFileSync('subjects/russian/data/grammar-path.json','utf8'));
  const legacy=JSON.parse(fs.readFileSync('subjects/russian/data/grammar.json','utf8'));
  const ids=new Set([...gp,...legacy].map(x=>x.id).filter(Boolean));
  validateContract(c);validateBridge(data,c,ids);
  validateRuntime(
    fs.readFileSync('subjects/russian/assets/grammar-pattern-coach.js','utf8'),
    fs.readFileSync('subjects/russian/assets/grammar-pattern-coach.css','utf8'),
    fs.readFileSync('subjects/russian/assets/core.js','utf8'),
    fs.readFileSync('subjects/russian/index.html','utf8')
  );
  return c;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  loadAndValidate();
  console.log('RUSSIAN_GRAMMAR_PATTERN_GATE=PASS');
  console.log(JSON.stringify({sequence:'hear→speak→contrast→tiny-rule→reuse',translationAnswers:false,masteryAuthority:false},null,2));
}
