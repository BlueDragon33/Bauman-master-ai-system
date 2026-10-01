import fs from 'node:fs';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const txt=p=>fs.readFileSync(p,'utf8');
const policy=j('subjects/russian/data/ai-mentor-policy.json');
const guard=txt('subjects/russian/assets/ai-mentor-guard.js');
const need=(v,msg)=>{if(!v)throw new Error(msg)};
need(policy.schema==='RUSSIAN_AI_MENTOR_POLICY_V1','policy schema');
need(policy.authority.aiRole==='NON_AUTHORITATIVE_COACH','AI role must be non-authoritative coach');
for(const k of ['writeMastery','writeAttemptHistory','writeSrs','writePlanner','unlockStage','generateCanonicalContent','silentlyPersistGeneratedPractice']) need(policy.permissions[k]===false,'Forbidden permission enabled: '+k);
need(policy.permissions.readCanonicalContext===true,'AI must be allowed read-only context');
need(policy.permissions.generateTemporaryPractice===true,'Temporary practice support missing');
need(policy.generatedPractice.lifecycle==='EPHEMERAL_UNTIL_REVIEWED','Generated practice must be ephemeral');
if(policy.phase==='RU07'){
  need(policy.generatedPractice.promotionPath==='RU08_REVIEWED_REPOSITORY_PATCH','Active RU07 policy must route generated promotion to RU08');
  need(policy.authority.authoringPromotionOwner==='RU08','Active RU07 authoring promotion owner must be RU08');
}else{
  need(policy.generatedPractice.promotionPath==='P12_REVIEW_WORKFLOW','Historical P10 snapshot must route generated promotion to P12');
}
need(policy.sourceBoundary.noFabricatedCitations===true,'Fabricated citations must be forbidden');
need(policy.sourceBoundary.noImplicitAuthorityFromModelOutput===true,'Model output must not become authority');
need(policy.languagePolicy.supported.includes('ru')&&policy.languagePolicy.supported.includes('vi-ru'),'Language policy incomplete');
for(const token of ['canonicalStateReadOnly:true','masteryReadOnly:true','aiMayModifyMastery:false','RussianLearningState?.get','RussianLearningFlow?.get']) need(guard.includes(token),'Existing guard missing '+token);
for(const token of ['RussianLearningState?.set','.addReview',"status:'mastered'"]) need(!guard.includes(token),'AI runtime forbidden mutation token '+token);
console.log('RUSSIAN_P10_AI_MENTOR_GUARDRAIL_GATE=PASS',JSON.stringify({coachingModes:policy.coachingModes.length,languages:policy.languagePolicy.supported.length,temporaryPractice:policy.permissions.generateTemporaryPractice}));
