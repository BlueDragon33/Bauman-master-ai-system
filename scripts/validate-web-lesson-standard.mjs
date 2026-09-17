import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const standardPath=path.join(root,'foundation/learning-content/web-lesson-standard.v1.json');
const domainPath=path.join(root,'foundation/domain-model/domain-contract.v1.json');
const read=p=>fs.readFileSync(p,'utf8');
const fail=message=>{throw new Error(`WEB_LESSON_STANDARD_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};

assert(fs.existsSync(standardPath),'Missing web lesson standard');
assert(fs.existsSync(domainPath),'Missing universal domain contract');

const standard=JSON.parse(read(standardPath));
const domain=JSON.parse(read(domainPath));

assert(standard.schema==='BAUMAN_WEB_LESSON_STANDARD_V1','Unexpected lesson standard schema');
assert(standard.contractVersion===1,'Lesson standard version must be 1');
assert(domain.schema==='BAUMAN_DOMAIN_CONTRACT_V1','Lesson standard must sit on BAUMAN_DOMAIN_CONTRACT_V1');

const requiredPrinciples=[
  'knowledgeIndependentFromPresentation',
  'exampleFirstWhereHelpful',
  'visualizeWhenPedagogicallyMeaningful',
  'interactionMustServeLearning',
  'sourceProvenanceRequired',
  'accessibilityRequired',
  'aiGeneratedMaterialMustBeMarked'
];
for(const key of requiredPrinciples)assert(standard.principles?.[key]===true,`Missing lesson principle: ${key}`);

const rhythm=['orient','observe','example','interact','retrieve','apply','reflect','review'];
assert(JSON.stringify(standard.lessonRhythm)===JSON.stringify(rhythm),'Lesson rhythm changed unexpectedly');

assert(Number.isInteger(standard.representationPolicy?.minimumChannelsPerCoreConcept),'Missing minimum representation channel policy');
assert(standard.representationPolicy.minimumChannelsPerCoreConcept>=2,'Core concepts need at least two representation channels');
assert(standard.representationPolicy.preferredChannelsPerCoreConcept>=3,'Preferred multimodal target must be at least three channels');
assert(standard.representationPolicy.channels.includes('image'),'Image representation missing');
assert(standard.representationPolicy.channels.includes('diagram'),'Diagram representation missing');
assert(standard.representationPolicy.channels.includes('worked_example'),'Worked-example representation missing');
assert(standard.representationPolicy.channels.includes('simulation'),'Simulation representation missing');

assert(standard.examplePolicy?.coreConceptRequiresExample===true,'Core concepts must have examples');
for(const level of ['simple','contextual','transfer'])assert(standard.examplePolicy.exampleLevels.includes(level),`Missing example level: ${level}`);

const interactionFamilies=['sort','drag_drop','pair_match','image_to_word','word_to_image','audio_to_word','audio_to_image','listen_discriminate','gap_fill','sentence_order','stress_place','hotspot','spot_missing','picture_speak','dialogue_match','diagram_build','parameter_explore','simulation_task'];
for(const type of interactionFamilies)assert(standard.interactionFamilies.includes(type),`Missing reusable interaction family: ${type}`);

assert(standard.interactionRules?.wrongAnswerMustProduceLearningSignal===true,'Wrong answers must produce learning evidence');
assert(standard.interactionRules?.firstAttemptEvidencePreserved===true,'First-attempt evidence must be preserved');
assert(standard.interactionRules?.masteryCannotBeInferredFromSingleOpenOrClick===true,'Single click/open must never infer mastery');
assert(standard.interactionRules?.reviewQueueOnlyFromRealEvidence===true,'Review Queue must remain evidence-based');
assert(standard.interactionRules?.touchKeyboardPointerParityRequired===true,'Interaction accessibility parity missing');

for(const profile of ['language_vocabulary','language_grammar','language_listening_speaking','mathematics_technical','research']){
  assert(standard.contentTypeProfiles?.[profile],`Missing content type profile: ${profile}`);
}

assert(standard.russianLesson1ReferencePattern?.source==='17_9_Урок 1 - РЯ сегодня.pptx','Russian Lesson 1 reference source changed');
for(const step of ['read_words','game','listen_and_write','dialogue_with_people_and_objects','build_word_combinations','contextual_reading_room_of_ivan']){
  assert(standard.russianLesson1ReferencePattern.observedSequence.includes(step),`Missing observed Lesson 1 pattern: ${step}`);
}

assert(standard.accessibility?.meaningfulImagesNeedAltText===true,'Meaningful images need alt text');
assert(standard.accessibility?.colorCannotBeOnlySignal===true,'Color cannot be the only signal');
assert(standard.provenance?.sourceRequiredForImportedMaterial===true,'Imported material must retain source');
assert(standard.provenance?.generatedContentCannotSilentlyReplaceCanonicalSource===true,'Generated content must not replace canonical source silently');
assert(standard.qualityGate?.forbidDecorativeVisualSubstitutionForExplanation===true,'Decorative visuals must not substitute for explanation');
assert(standard.qualityGate?.forbidFakeProgress===true,'Fake progress must be forbidden');
assert(standard.qualityGate?.forbidFakeMastery===true,'Fake mastery must be forbidden');

const requiredDomainKinds=['source','knowledge','competency','task','evidence','artifact','workflow'];
for(const kind of requiredDomainKinds)assert(domain.entities?.[kind],`Lesson standard depends on missing domain entity: ${kind}`);

console.log('WEB_LESSON_STANDARD_GATE=PASS');
console.log(JSON.stringify({
  schema:standard.schema,
  version:standard.contractVersion,
  lessonRhythm:standard.lessonRhythm.length,
  interactions:standard.interactionFamilies.length,
  profiles:Object.keys(standard.contentTypeProfiles).length
},null,2));
