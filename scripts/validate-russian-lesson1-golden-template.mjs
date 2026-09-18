import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const lessonPath=path.join(root,'foundation/learning-content/examples/russian-lesson-01.template.v1.json');
const standardPath=path.join(root,'foundation/learning-content/web-lesson-standard.v1.json');
const read=p=>fs.readFileSync(p,'utf8');
const fail=message=>{throw new Error(`RUSSIAN_LESSON1_GOLDEN_TEMPLATE_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};

assert(fs.existsSync(lessonPath),'Missing Russian Lesson 1 golden template');
assert(fs.existsSync(standardPath),'Missing web lesson standard');

const lesson=JSON.parse(read(lessonPath));
const standard=JSON.parse(read(standardPath));

assert(lesson.schema==='BAUMAN_GOLDEN_LESSON_TEMPLATE_V1','Unexpected golden lesson schema');
assert(lesson.templateVersion===1,'Golden lesson template version must be 1');
assert(lesson.lessonId==='bd:workflow:russian:lesson-01-russian-today','Golden lesson canonical workflow ID changed');
assert(lesson.authoringStandard===standard.schema,'Golden lesson must declare current authoring standard');
assert(/^bd:source:russian:/.test(lesson.source?.sourceId||''),'Lesson source must use canonical Russian source ID');
assert(lesson.source?.provenanceRequired===true,'Golden lesson source provenance must be required');

const knowledgeIds=new Set((lesson.knowledgeClusters||[]).map(x=>x.knowledgeId));
assert(knowledgeIds.size>=4,'Golden lesson needs at least four source-supported knowledge clusters');
for(const id of knowledgeIds)assert(/^bd:knowledge:russian:/.test(id),`Invalid Russian knowledge ID: ${id}`);

const activities=lesson.activities||[];
assert(activities.length>=8,'Golden lesson should preserve the source rhythm plus transfer check');
const sourceActivities=activities.map(x=>x.sourceActivity);
for(const name of ['Задание 21. Прочитайте слова','Игра','Задание 21в. Слушайте слова, и пишите','Диалог Иван / Инна','Составьте словосочетания','Комната Ивана']){
  assert(sourceActivities.includes(name),`Missing source-supported activity: ${name}`);
}

for(const activity of activities){
  assert(/^bd:task:russian:/.test(activity.id||''),`Invalid canonical task ID: ${activity.id}`);
  assert(standard.lessonRhythm.includes(activity.phase),`Activity phase is outside lesson rhythm: ${activity.phase}`);
  for(const target of activity.targets||[])assert(knowledgeIds.has(target),`Activity targets unknown knowledge ID: ${target}`);
  for(const variant of activity.allowedVariants||[])assert(standard.interactionFamilies.includes(variant),`Unknown interaction variant: ${variant}`);
}

const dialogue=activities.find(x=>x.id==='bd:task:russian:lesson-01-dialogue-photo');
assert(dialogue?.visualScene?.required===true,'Dialogue must retain a meaningful visual scene requirement');
for(const entity of ['person','photo','house','dog'])assert(dialogue.visualScene.entities.includes(entity),`Dialogue visual scene missing ${entity}`);

const room=activities.find(x=>x.id==='bd:task:russian:lesson-01-room-reading');
assert(room?.scene?.required===true,'Комната Ивана must be represented as a meaningful scene');
for(const entity of ['room','window','cactus','table','lamp','laptop','photo','parrot','dog'])assert(room.scene.entities.includes(entity),`Room scene missing ${entity}`);
for(const interaction of room.scene.interactionCandidates)assert(standard.interactionFamilies.includes(interaction),`Room scene proposes unsupported interaction: ${interaction}`);

assert(lesson.visualAssetRequirements?.decorativeOnlyAssetsDoNotCount===true,'Decorative-only visuals must not count toward lesson quality');
assert(lesson.visualAssetRequirements?.altTextRequired===true,'Lesson visuals require alt text');
assert(lesson.visualAssetRequirements?.sourceOrGeneratedMetadataRequired===true,'Lesson visuals require provenance/generation metadata');

const nonGoals=new Set(lesson.nonGoals||[]);
for(const rule of ['do_not_copy_ppt_layout_slide_by_slide','do_not_mark_mastery_from_viewing','do_not_invent_stress_or_source_audio','do_not_add_decorative_images_that_compete_with_learning','do_not_hardcode_interaction_logic_into_this_template']){
  assert(nonGoals.has(rule),`Missing golden lesson safety rule: ${rule}`);
}

console.log('RUSSIAN_LESSON1_GOLDEN_TEMPLATE_GATE=PASS');
console.log(JSON.stringify({
  schema:lesson.schema,
  knowledgeClusters:knowledgeIds.size,
  activities:activities.length,
  visualTargets:lesson.visualAssetRequirements.meaningfulVisualTargets.length
},null,2));
