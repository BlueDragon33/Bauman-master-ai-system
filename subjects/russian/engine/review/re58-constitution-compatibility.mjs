/**
 * RE58: constitution 1.3 compatibility observation, NOT a law-publication verifier.
 *
 * The canonical publisher resides in Software-Blueprint-Hub, not Bauman.
 * This module never promotes consumer adoption, authenticates a remote artifact,
 * grants central device authority, validates Russian audio, or publishes Production.
 */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {localRe57Sources,buildRe57Readiness} from './re57-continuation-readiness.mjs';

const SHA=/^[0-9a-f]{40}$/;
const SRC='BlueDragon33/Software-Blueprint-Hub';
const CURRENT='BlueDragon33/Bauman-master-ai-system';
const STATUS='RATIFIED_IN_CANONICAL_GIT_MAIN';
function hardStop(m){throw new Error('RE58 authority preflight: '+m)}
export function buildRe58ConstitutionPreflight(sources=localRe57Sources()){
  const {state,adoption}=sources;
  const authority=state?.continuation?.constitution13Migration;
  if(state?.track!=='russian-engine'||state?.activeWorkPackage!=='RE58')
    hardStop('incorrect active work package');
  if(adoption?.policyId!=='blueprint-os:universal-century-grade'||
     adoption?.policyVersion!=='1.3.0'||adoption?.enforcementMode!=='enforced')
    hardStop('consumer adoption source drift; do not auto-publish a policy');
  if(authority?.schema!=='RUSSIAN_ENGINE_CONSTITUTION13_MIGRATION_OBSERVATION_V1'||
     authority?.observedCanonicalSourceRepo!==SRC||
     authority?.sourceStatus!==STATUS||
     authority?.observedPolicyVersion!=='1.3.0'||
     authority?.currentlyAdoptedVersion!==adoption.policyVersion||
     !SHA.test(authority?.observedCanonicalSourceMain||'')){
    hardStop('constitutional observation mismatch');
  }
  // Do not accept caller-declared "PUBLISHED" or "VERIFIED" as remote authority.
  if(authority.backendPublicationEvidence!=='NOT_VERIFIED'||
     authority.productionAuthority!=='SEPARATE_EXPLICIT_RELEASE_GATE'||
     state.continuation?.authoritativeConstitution?.consumerMigrationStatus!=='ADOPTION_MANIFEST_UPDATED_AWAITING_EXACT_HEAD_CI')
    hardStop('unverified publication/migration authority claim');
  const ru=buildRe57Readiness(sources);
  if(ru.linguisticReview.totalItems!==43||ru.canonicalPublicationReady!==false)
    hardStop('RE58 expected blocked 43-item Russian review boundary');
  const blockers=[
    'CONSUMER_1_3_ADOPTION_MANIFEST_MUST_PASS_EXACT_HEAD_CI',
    'BACKEND_PUBLICATION_EVIDENCE_UNVERIFIED',
    'NO_EXACT_R1_R32_AND_R200_PROJECT_MIGRATION_EVIDENCE',
    'NO_CP01_CP13_TRUSTED_CENTRAL_DEVICE_ACCEPTANCE',
    'NO_MEASURED_DESKTOP_MOBILE_WCAG_AA_CONTRAST_FOR_NEW_UI',
    'WORK_W0_W3_LIVE_PREVIEW_UNVERIFIED',
    ...ru.linguisticReview.blockers,
    'PRODUCTION_SEPARATE_RELEASE_REQUIRED'
  ];
  return Object.freeze({
    schema:'RUSSIAN_ENGINE_RE58_CONSTITUTION_COMPATIBILITY_V1',
    project:CURRENT,
    currentMainObserved:state.continuation.lastMainObservation?.sha||null,
    governingSource:Object.freeze({
      repository:SRC,
      sourceMainObserved:authority.observedCanonicalSourceMain,
      sourceVersion:'1.3.0',
      status:STATUS,
      verification:'REPO_SNAPSHOT_NOT_AUTHENTICATED_LIVE_ARTIFACT'
    }),
    applicationAdoption:Object.freeze({
      version:adoption.policyVersion,
      enforcement:adoption.enforcementMode,
      releaseAuthority:adoption.productionAuthority,
      manifestUpdated:true,
      migrationAcceptanceComplete:false
    }),
    subjectProfile:Object.freeze({
      platform:'B4_STRUCTURED',
      russianReference:'S100_PLUS_R101_200_R200',
      actualVerifiedMaturity:'UNVERIFIED_NOT_A_FEATURE_COUNT',
      professionalReview:'REQUIRED'
    }),
    work:Object.freeze({
      execution:'NOT_EXECUTED_FROM_THIS_CLI',
      handoffFile:state.continuation.workHandoff,
      qaAcceptance:'PENDING_LOGGED_IN_WORK_BROWSER_EVIDENCE'
    }),
    russianReview:Object.freeze({
      packets:ru.linguisticReview.totalItems,
      authorizedReviewers:ru.linguisticReview.authorizedReviewers,
      textApprovals:ru.linguisticReview.verifiedTextItems,
      audioApprovals:ru.linguisticReview.verifiedAudioItems,
      ready:false
    }),
    qualityMetrics:'NOT_MEASURED_FROM_TRUSTED_LIVE_COHORT',
    blockers:Object.freeze(blockers),
    compatibilityReady:false,
    mayDeclareConsumerMigrationComplete:false,
    mayGrantCentralDeviceAccess:false,
    canonicalPublicationReady:false,
    productionPublished:false
  });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  console.log(JSON.stringify(buildRe58ConstitutionPreflight(),null,2));
}
