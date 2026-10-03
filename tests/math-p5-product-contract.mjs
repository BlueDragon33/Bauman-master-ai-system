import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);

const required=[
 'MATH_SUBJECT_MANIFEST_CONTRACT.md','MATH_LEARNER_SURFACE_MAP.md','MATH_COMPONENT_CAPABILITY_MAP.md',
 'MATH_MATH_INPUT_CONTRACT.md','MATH_AUTHORING_SCHEMA_CONTRACT.md','MATH_CONTENT_LIFECYCLE_REVIEW_POLICY.md',
 'MATH_RESPONSIVE_ACCESSIBILITY_MATRIX.md','MATH_OFFLINE_PACKAGING_PROFILE.md','MATH_LEGACY_INTEGRATION_PLAN.md',
 'MATH_P6_INPUT_CONTRACT.md'
];
for(const name of required)assert.ok(fs.existsSync('prompts/subjects/math/evidence/'+name),'Missing MATH05 output '+name);
const html=fs.readFileSync('subjects/math/index.html','utf8');
assert.ok(html.includes('assets/math-product-integration.js?v=1'),'MATH05 product integration runtime not loaded');
const product=require('../subjects/math/assets/math-product-integration.js');
const self=product.selfCheck();
assert.equal(self.platformFork,false);
assert.equal(self.ownsGlobalNavigation,false);
assert.equal(self.ownsTheme,false);
assert.equal(self.ownsNotifications,false);
assert.equal(self.ownsPlanner,false);
assert.equal(self.ownsGenericProgress,false);
assert.equal(self.masteryAuthority,false);
assert.equal(self.assessmentAuthority,false);
assert.equal(self.mathematicalTruthAuthority,false);
assert.equal(self.keyboardCriticalInputs,true);
assert.equal(self.providerSpecificCalls,false);
for(const s of ['overview','roadmap','lesson','problem','proof','graph','review','assessment','application','resources','ai'])assert.ok(self.surfaces.includes(s),'Missing surface '+s);
for(const t of ['numeric','algebraic_expression_with_domain','unit_quantity','long_text','text'])assert.ok(self.inputTypes.includes(t),'Missing input type '+t);
const unavailable=await product.invoke('math.graph.sample',{expression:'x'});
assert.equal(unavailable.status,'UNAVAILABLE','Product adapter must fail honest without MATH04 facade');
assert.equal(unavailable.masteryWrite,false);
assert.equal(unavailable.academicWrite,false);
const input=product.inputDescriptor('algebraic_expression_with_domain');
assert.equal(input.keyboard,true);
assert.equal(input.authority,'problem.responseSchema');
console.log('MATH05_PRODUCT_CONTRACT_PASS');
