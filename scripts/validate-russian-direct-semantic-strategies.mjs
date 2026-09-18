import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {buildDirectSemanticDescriptor,summarizeDirectSemanticCoverage} from '../subjects/russian/lib/direct-semantic-strategies.mjs';

const fail=m=>{throw new Error(`RUSSIAN_DIRECT_SEMANTIC_GATE=FAIL\n${m}`)};
const assert=(v,m)=>{if(!v)fail(m)};

export function validateContract(c){
  assert(c?.schema==='RUSSIAN_DIRECT_SEMANTIC_STRATEGY_CONTRACT_V1','Unexpected direct semantic contract schema');
  assert(c.authority?.runtimeAuthoritySwitch===false&&c.authority?.authoritySwitchTurn===13,'Turn 12 must remain non-authoritative');
  const strategies=new Set(c.strategies||[]);
  for(const s of ['visual_scene','gesture','contrast','category_examples','analogy','simple_russian_definition','audio_context']){
    assert(strategies.has(s),`Missing direct-semantic strategy: ${s}`);
  }
  const prohibited=new Set(c.prohibitedEvidenceFields||[]);
  for(const f of ['meaning_vi','vi','clue_en','en'])assert(prohibited.has(f),`Translation field not prohibited: ${f}`);
  assert(c.selection?.deterministic===true&&c.selection?.preserveAllSupportedStrategies===true,'Strategy selection must be deterministic and preserve evidence');
  assert(c.selection?.failClosedIfNoEvidence===true,'No-evidence strategy selection must fail closed');
  assert(c.invariants?.noTranslationFallback===true&&c.invariants?.noSyntheticMeaning===true,'Translation/synthetic fallback invariant missing');
  assert(c.invariants?.sourceEvidenceTraceable===true,'Source evidence must remain traceable');
  assert(c.invariants?.learnerStateAuthority===false&&c.invariants?.masteryMutation===false,'Direct semantic layer may not own mastery');
  return true;
}

export function validateStrategyBehavior(c){
  const translated={ru:'смысл',meaning_vi:'ý nghĩa',en:'meaning'};
  const a=buildDirectSemanticDescriptor(translated,c);
  assert(a.status==='missing_direct_semantics'&&a.strategies.length===0,'Translation-only row must fail closed');

  const rich={
    ru:'быстро',
    gesture_ru:'быстрое движение рукой',
    contrast_ru:'быстро ↔ медленно',
    category_ru:'наречие',
    analogy_ru:'как быстрый поезд',
    meaning_ru:'с большой скоростью',
    example_ru:'Он быстро читает.',
    emoji:'⚡',
    meaning_vi:'nhanh'
  };
  const b=buildDirectSemanticDescriptor(rich,c);
  assert(b.status==='ready','Source-backed row must be ready');
  assert(b.primary_strategy==='gesture','Primary strategy order drifted');
  assert(b.strategies.includes('contrast')&&b.strategies.includes('analogy'),'Supported strategies were dropped');
  assert(!b.source_fields.some(x=>['meaning_vi','vi','clue_en','en'].includes(x)),'Translation field leaked into descriptor');
  return true;
}

export function auditCorpus(vocab,c){
  const summary=summarizeDirectSemanticCoverage(vocab,c);
  assert(summary.total===8000,`Vocabulary corpus size drifted: ${summary.total}`);
  assert(summary.ready===summary.total,`Direct semantic coverage incomplete: ready=${summary.ready}, missing=${summary.missing}`);
  assert(summary.byStrategy.visual_scene===summary.total,`Visual scene evidence must cover all items: ${summary.byStrategy.visual_scene}/${summary.total}`);
  return summary;
}

export function loadAndValidate(){
  const c=JSON.parse(fs.readFileSync('subjects/russian/contracts/direct-semantic-strategy-contract.v1.json','utf8'));
  validateContract(c);
  validateStrategyBehavior(c);
  const summary=auditCorpus(JSON.parse(fs.readFileSync('subjects/russian/data/vocab.json','utf8')),c);
  return {contract:c,summary};
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const {summary}=loadAndValidate();
  console.log('RUSSIAN_DIRECT_SEMANTIC_GATE=PASS');
  console.log('RUSSIAN_DIRECT_SEMANTIC_AUDIT='+JSON.stringify(summary));
}
