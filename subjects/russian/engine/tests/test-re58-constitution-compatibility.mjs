import assert from 'node:assert/strict';
import {localRe57Sources} from '../review/re57-continuation-readiness.mjs';
import {buildRe58ConstitutionPreflight} from '../review/re58-constitution-compatibility.mjs';

const sources=localRe57Sources(),report=buildRe58ConstitutionPreflight(sources);
assert.equal(report.schema,'RUSSIAN_ENGINE_RE58_CONSTITUTION_COMPATIBILITY_V1');
assert.equal(report.governingSource.sourceVersion,'1.3.0');
assert.equal(report.governingSource.status,'RATIFIED_IN_CANONICAL_GIT_MAIN');
assert.equal(report.governingSource.verification,'REPO_SNAPSHOT_NOT_AUTHENTICATED_LIVE_ARTIFACT');
assert.equal(report.applicationAdoption.version,'1.3.0');
assert.equal(report.applicationAdoption.manifestUpdated,true);
assert.equal(report.applicationAdoption.migrationAcceptanceComplete,false);
assert.equal(report.subjectProfile.actualVerifiedMaturity,'UNVERIFIED_NOT_A_FEATURE_COUNT');
assert.equal(report.russianReview.packets,43);
assert.equal(report.russianReview.authorizedReviewers,0);
assert.equal(report.russianReview.textApprovals,0);
assert.equal(report.russianReview.audioApprovals,0);
assert.equal(report.work.execution,'NOT_EXECUTED_FROM_THIS_CLI');
assert.equal(report.compatibilityReady,false);
assert.equal(report.mayDeclareConsumerMigrationComplete,false);
assert.equal(report.mayGrantCentralDeviceAccess,false);
assert.equal(report.productionPublished,false);
assert.ok(report.blockers.includes('BACKEND_PUBLICATION_EVIDENCE_UNVERIFIED'));

const tamper=fn=>{
  const fixture=structuredClone(sources);
  fn(fixture);
  assert.throws(()=>buildRe58ConstitutionPreflight(fixture),/RE58 authority preflight/);
};
tamper(x=>{x.adoption.policyVersion='1.2.0';});
tamper(x=>{x.state.continuation.constitution13Migration.sourceStatus='DRAFT';});
tamper(x=>{x.state.continuation.constitution13Migration.backendPublicationEvidence='VERIFIED';});
tamper(x=>{x.state.continuation.authoritativeConstitution.consumerMigrationStatus='FULLY_ACCEPTED';});
tamper(x=>{x.state.activeWorkPackage='RE57';});
tamper(x=>{x.state.continuation.constitution13Migration.observedCanonicalSourceMain='not-a-sha';});
const again=buildRe58ConstitutionPreflight(localRe57Sources());
assert.deepEqual(report,again,'read-only compatibility report must be deterministic');
console.log(JSON.stringify({
  ok:true,activeSourceVersion:'1.3.0',consumerManifestVersion:'1.3.0',
  guardCases:6,ru03TextApprovals:0,ru03AudioApprovals:0,
  workExecution:'NOT_VERIFIED',r200ReferenceNotFalseCompletion:true,
  constitutionalMigrationComplete:false,productionPublished:false
}));
