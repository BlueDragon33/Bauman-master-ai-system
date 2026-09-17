import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const capabilityPath=path.join(root,'foundation/learning-content/component-capabilities.v1.json');
const lessonPath=path.join(root,'foundation/learning-content/examples/russian-lesson-01.template.v1.json');
const read=p=>fs.readFileSync(p,'utf8');
const fail=message=>{throw new Error(`LEARNING_COMPONENT_CAPABILITIES_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};

assert(fs.existsSync(capabilityPath),'Missing learning component capability contract');
assert(fs.existsSync(lessonPath),'Missing Russian Lesson 1 golden template');

const contract=JSON.parse(read(capabilityPath));
const lesson=JSON.parse(read(lessonPath));

assert(contract.schema==='BAUMAN_LEARNING_COMPONENT_CAPABILITIES_V1','Unexpected capability contract schema');
assert(contract.contractVersion===1,'Capability contract version must be 1');
assert(contract.designRule.includes('do not prescribe'),'Capability contract must remain renderer/framework agnostic');

const ids=new Set((contract.coreCapabilities||[]).map(x=>x.id));
assert(ids.size===contract.coreCapabilities.length,'Capability IDs must be unique');

const minimum=[
  'content.example',
  'content.meaningfulVisual',
  'media.audioModel',
  'interaction.dragDrop',
  'interaction.pairMatch',
  'interaction.classify',
  'interaction.hotspotScene',
  'interaction.textInput',
  'interaction.speechPrompt',
  'language.stressDisplay',
  'dialogue.player',
  'feedback.actionable',
  'evidence.capture',
  'learning.reviewBridge',
  'learning.exactResume',
  'provenance.inspect'
];
for(const id of minimum){
  assert(ids.has(id),`Missing required capability: ${id}`);
  assert(contract.goldenLesson1MinimumSet.includes(id),`Golden Lesson 1 minimum set missing: ${id}`);
}

for(const id of ['technical.diagram','technical.plot','technical.simulationHost'])assert(ids.has(id),`Missing future Bauman technical capability: ${id}`);

assert(contract.rendererInvariants?.desktop16x9===true,'Desktop 16:9 invariant missing');
assert(contract.rendererInvariants?.tablet3x2===true,'Tablet 3:2 invariant missing');
assert(contract.rendererInvariants?.phone19_5x9===true,'Phone 19.5:9 invariant missing');
assert(contract.rendererInvariants?.noHorizontalOverflow===true,'No-horizontal-overflow invariant missing');
assert(contract.rendererInvariants?.touchKeyboardPointerParity===true,'Touch/keyboard/pointer parity missing');
assert(contract.rendererInvariants?.noColorOnlyCorrectnessSignal===true,'Correctness cannot depend on color alone');

assert(contract.architectureInvariants?.capabilityIndependentFromContent===true,'Capabilities must be independent from content');
assert(contract.architectureInvariants?.capabilityIndependentFromSubject===true,'Capabilities must be reusable across subjects');
assert(contract.architectureInvariants?.capabilityIndependentFromFramework===true,'Capabilities must be framework-agnostic');
assert(contract.architectureInvariants?.taskIdentityLivesOutsideRenderer===true,'Task identity must live outside renderer');
assert(contract.architectureInvariants?.evidenceLivesOutsideRenderer===true,'Evidence must live outside renderer');
assert(contract.architectureInvariants?.simulatorsConnectedThroughAdapters===true,'Simulators must connect through adapters');
assert(contract.architectureInvariants?.aiConnectedThroughCapabilityLayer===true,'AI must connect through capability layer');

const proposed=new Set();
for(const activity of lesson.activities||[]){
  for(const type of activity.allowedVariants||[])proposed.add(type);
  for(const type of activity.followUp||[])proposed.add(type);
  for(const type of activity.scene?.interactionCandidates||[])proposed.add(type);
}

const interactionCoverage=new Set([
  'drag_drop','pair_match','sort','image_to_word','word_to_image','hotspot','spot_missing','picture_speak','dialogue_match','gap_fill','hidden_text_role_play'
]);
for(const type of proposed){
  assert(interactionCoverage.has(type),`Golden lesson proposes interaction without capability mapping: ${type}`);
}

console.log('LEARNING_COMPONENT_CAPABILITIES_GATE=PASS');
console.log(JSON.stringify({
  schema:contract.schema,
  capabilities:contract.coreCapabilities.length,
  goldenMinimum:contract.goldenLesson1MinimumSet.length,
  futureTechnical:contract.platformExtensionSet.length
},null,2));
