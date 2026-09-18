import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const contract=read('roadmap_v2/priority/priority-contract.json');
const contractSchema=read('roadmap_v2/priority/priority-contract.schema.json');
const candidateSchema=read('roadmap_v2/priority/priority-candidate.schema.json');
const resultSchema=read('roadmap_v2/priority/priority-result.schema.json');

assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_PRIORITY_CONTRACT_V2');
assert.equal(contractSchema.$id,contract.schema);
assert.equal(candidateSchema.$id,'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1');
assert.equal(resultSchema.$id,'BAUMAN_ROADMAP_V2_PRIORITY_RESULT_V2');
assert.equal(contract.upstream.priorityCandidateSchema,candidateSchema.$id);
assert.equal(contract.upstream.priorityResultSchema,resultSchema.$id);

const required=new Set(resultSchema.required);
for(const field of [
  'schema','candidateId','targetId','phaseId','knowledgeState','weeksUntilNeeded',
  'features','weights','contributions','weightedScore','criticalOverride',
  'reviewOnDemand','disposition','masterReady','schedulerWriteAllowed','persisted','reasonCodes'
]){
  assert(required.has(field),`Priority result V2 missing required field: ${field}`);
}
assert.equal(resultSchema.properties.schema.const,resultSchema.$id);
assert.deepEqual(resultSchema.properties.weights.const,contract.formula.weights);
assert.deepEqual(
  Object.keys(resultSchema.properties.features.properties),
  ['masterRelevance','knowledgeGap','prerequisiteUrgency','forgettingRisk']
);
assert.deepEqual(
  Object.keys(resultSchema.properties.contributions.properties),
  ['masterRelevance','knowledgeGap','prerequisiteUrgency','forgettingRisk']
);
assert.equal(resultSchema.properties.weeksUntilNeeded.type.includes('null'),true);
assert.equal(resultSchema.properties.rank.minimum,1);
assert.equal(resultSchema.properties.schedulerWriteAllowed.const,false);
assert.equal(resultSchema.properties.persisted.const,false);
assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.capabilities.persistentStoreWrite,false);
assert.equal(contract.capabilities.schedulerWrite,false);
assert.equal(contract.capabilities.runtimeActivation,false);

const historicalMismatch={
  historicalEngineFields:['weeksUntilNeeded','weights'],
  historicalSchemaAllowedFields:Object.keys(read('recovery/roadmap-v2/historical-l27/roadmap_v2/priority/priority-result.schema.json')?.properties||{})
};
for(const field of historicalMismatch.historicalEngineFields){
  assert.equal(historicalMismatch.historicalSchemaAllowedFields.includes(field),false,`historical mismatch evidence unexpectedly changed: ${field}`);
  assert.equal(Object.hasOwn(resultSchema.properties,field),true,`current result schema did not repair historical mismatch: ${field}`);
}

assert.equal(fs.existsSync('roadmap_v2/priority/manifest.json'),false,'historical Priority manifest must remain quarantined');
assert.equal(fs.existsSync('roadmap_v2/priority.mjs'),false,'canonical historical Priority engine must remain absent');

console.log('ROADMAP_V2_L25_H1_PRIORITY_RESULT_SCHEMA=PASS');
console.log(JSON.stringify({
  contract:contract.schema,
  candidateSchema:candidateSchema.$id,
  resultSchema:resultSchema.$id,
  explainabilityFields:['features','weights','contributions'],
  rankingTieBreakField:'weeksUntilNeeded',
  historicalMismatchRepaired:true,
  persistence:false,
  scheduler:false,
  runtimeActivation:false
},null,2));
