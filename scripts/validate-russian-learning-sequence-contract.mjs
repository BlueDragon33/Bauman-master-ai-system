import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const CONTRACT='subjects/russian/contracts/listen-speak-literacy-visual-contract.v1.json';
const fail=message=>{throw new Error(`RUSSIAN_LEARNING_CONTRACT_GATE=FAIL\n${message}`)};
const assert=(value,message)=>{if(!value)fail(message)};

export function validateContract(contract){
  assert(contract?.schema==='RUSSIAN_LISTEN_SPEAK_LITERACY_VISUAL_CONTRACT_V1','Unexpected contract schema');
  const p=contract.priorities||{};
  const total=Object.values(p).reduce((a,b)=>a+Number(b||0),0);
  assert(Math.abs(total-1)<1e-9,'Priority weights must total 1');
  assert(Number(p.listening)>Number(p.visualVocabulary),'Listening must outrank vocabulary');
  assert(Number(p.speaking)>Number(p.visualVocabulary),'Speaking must outrank vocabulary');
  assert(Number(p.grammar)<=Number(contract.beginnerGrammar?.maxPriorityWeight),'Beginner grammar weight exceeds cap');
  assert(contract.sequencing?.oralBeforeTranslation===true,'Oral-first rule missing');
  assert(contract.sequencing?.listeningBeforeReadingPrompt===true,'Listening-before-reading rule missing');
  assert(contract.sequencing?.speakingBeforeGrammarExplanation===true,'Speaking-before-grammar rule missing');
  assert(contract.alphabet?.requiredLetterCount===33,'Cyrillic letter count must be 33');
  assert(Array.isArray(contract.alphabet?.requiredRepresentations)&&contract.alphabet.requiredRepresentations.length===4,'Print/cursive representation requirement incomplete');
  assert(contract.alphabet?.requireSoundAssociation===true,'Sound-letter association is required');
  assert(contract.vocabulary?.learnerFacingVietnameseTranslation===false,'Vietnamese vocabulary meaning must be forbidden');
  assert(contract.vocabulary?.learnerFacingEnglishTranslationDefault===false,'English must not become the default translation bridge');
  assert(contract.vocabulary?.translationFallbackForMissingVisual===false,'Missing visuals must not fall back to translation');
  assert(Array.isArray(contract.vocabulary?.requiredSemanticChannels)&&contract.vocabulary.requiredSemanticChannels.includes('visual')&&contract.vocabulary.requiredSemanticChannels.includes('audio')&&contract.vocabulary.requiredSemanticChannels.includes('context'),'Visual/audio/context semantic channels are required');
  assert(contract.uiLanguage?.vietnameseNavigationAllowed===true,'Vietnamese navigation may remain');
  assert(contract.uiLanguage?.vietnameseVocabularyMeaningAllowed===false,'Vietnamese vocabulary meaning must remain forbidden');
  return true;
}

export function loadAndValidate(){
  const contract=JSON.parse(fs.readFileSync(CONTRACT,'utf8'));
  validateContract(contract);
  return contract;
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const c=loadAndValidate();
  console.log('RUSSIAN_LEARNING_CONTRACT_GATE=PASS');
  console.log(JSON.stringify({schema:c.schema,letterCount:c.alphabet.requiredLetterCount,oralFirst:true,vietnameseVocabMeaning:false,priorityTotal:Object.values(c.priorities).reduce((a,b)=>a+b,0)},null,2));
}
