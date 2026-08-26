(function referenceSubjectEvidenceReviewModule(global) {
  'use strict';

  const REGISTRY_ID = 'bauman-reference-subject-evidence-review';
  const REGISTRY_VERSION = '1.0.0';
  const RELEASE = 'L7-B7-REFERENCE-EVIDENCE-REVIEW-V1';
  const STAGES = Object.freeze(['understand', 'solve', 'build-apply', 'explain', 'retain']);
  const PRE_RETENTION_STAGES = Object.freeze(['understand', 'solve', 'build-apply', 'explain']);
  const SUBJECT_ORDER = Object.freeze(['russian', 'math', 'foundation']);

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function cloneJson(value) {
    return value === undefined ? null : JSON.parse(JSON.stringify(value));
  }

  function fail(code, message) {
    const error = new TypeError(message);
    error.code = code;
    throw error;
  }

  function object(value, code, message) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail(code, message);
    return value;
  }

  function exactIndex(records, key, code) {
    const index = new Map();
    list(records).forEach(function add(record) {
      const id = String(record && record[key] || '').trim();
      if (!id) fail(code, 'Stable ' + key + ' is required.');
      if (index.has(id)) fail(code, 'Duplicate ' + key + ': ' + id);
      index.set(id, record);
    });
    return index;
  }

  function sameOrdered(actual, expected) {
    return actual.length === expected.length
      && actual.every(function equal(value, index) { return value === expected[index]; });
  }

  function validTimestamp(value, code) {
    const text = String(value || '');
    const milliseconds = Date.parse(text);
    if (!text || !Number.isFinite(milliseconds) || new Date(milliseconds).toISOString() !== text) {
      fail(code, 'An explicit canonical UTC ISO timestamp is required.');
    }
    return milliseconds;
  }

  function actorMayVerify(policy, verification) {
    const actor = policy.verificationActors && policy.verificationActors[verification && verification.actorType];
    return Boolean(actor
      && actor.maySetVerified === true
      && list(actor.allowedMethods).includes(verification.method));
  }

  function validateRegistry(registry, policy, subjectFactory) {
    object(registry, 'EVIDENCE_REVIEW_REGISTRY_INVALID', 'B7 evidence-review registry is required.');
    object(policy, 'MASTER_READY_POLICY_INVALID', 'L6-B5 Master-ready policy is required.');
    object(subjectFactory, 'SUBJECT_FACTORY_INVALID', 'Subject Factory registry is required.');
    if (registry.registryId !== REGISTRY_ID
      || registry.registryVersion !== REGISTRY_VERSION
      || registry.release !== RELEASE) {
      fail('EVIDENCE_REVIEW_IDENTITY_MISMATCH', 'B7 evidence-review identity is not recognized.');
    }
    if (policy.policyId !== 'bauman-master-ready-policy'
      || !sameOrdered(list(policy.stageOrder), STAGES)) {
      fail('MASTER_READY_POLICY_MISMATCH', 'B7 requires the five-stage L6-B5 policy.');
    }
    if (!sameOrdered(list(registry.catalogOrder), SUBJECT_ORDER)) {
      fail('EVIDENCE_REVIEW_SUBJECT_ORDER_INVALID', 'B7 catalog order must remain Russian, Math, Foundation.');
    }
    const boundary = object(registry.runtimeBoundary,
      'EVIDENCE_REVIEW_BOUNDARY_MISSING', 'B7 runtime boundary is required.');
    if (boundary.mode !== 'pure-read-only-hook-projection'
      || boundary.sourceMutationAllowed !== false
      || boundary.learnerStateMutationAllowed !== false
      || boundary.scheduleWriteAllowed !== false
      || boundary.runtimeActivationAllowed !== false
      || boundary.automaticMasterReadyAllowed !== false
      || boundary.aiFinalVerificationAllowed !== false
      || boundary.pageEventEvidenceAllowed !== false
      || boundary.fuzzyLessonMatchAllowed !== false
      || boundary.attemptsAppendOnly !== true) {
      fail('EVIDENCE_REVIEW_BOUNDARY_ESCALATION', 'B7 hooks must remain read-only, exact-ID and non-claiming.');
    }
    SUBJECT_ORDER.forEach(function validateSubject(subjectId) {
      const subject = registry.subjects && registry.subjects[subjectId];
      const factorySubject = subjectFactory.subjects && subjectFactory.subjects[subjectId];
      if (!subject || !factorySubject || factorySubject.routes.main !== subject.runtimeRoute
        || factorySubject.offlinePolicyRef !== subject.offlinePolicyRef) {
        fail('EVIDENCE_REVIEW_SUBJECT_REF_INVALID', 'B7 subject route/offline ref mismatch: ' + subjectId);
      }
    });
    for (const [typeId, stageMap] of Object.entries(registry.evidenceProfiles || {})) {
      const profile = policy.profiles && policy.profiles[typeId];
      if (!profile || !sameOrdered(Object.keys(stageMap), STAGES)) {
        fail('EVIDENCE_REVIEW_PROFILE_INVALID', 'B7 evidence profile must map all five policy stages: ' + typeId);
      }
      STAGES.forEach(function validateStage(stage) {
        const preferred = stageMap[stage] && stageMap[stage].preferredEvidenceKind;
        if (!preferred || !list(profile.stageEvidence && profile.stageEvidence[stage]).includes(preferred)) {
          fail('EVIDENCE_REVIEW_KIND_INVALID', 'Preferred evidence kind is not allowed by L6-B5: ' + typeId + '/' + stage);
        }
      });
    }
    const schedule = registry.reviewSchedule || {};
    if (schedule.timezone !== 'UTC'
      || schedule.dayDurationMilliseconds !== 86400000
      || schedule.anchorSource !== 'ready-for-retention-transition'
      || schedule.variedPromptRequired !== true
      || schedule.protectedAnswerReuseAllowed !== false
      || schedule.explicitAsOfRequired !== true
      || schedule.stateWriteOwner !== 'future-learning-state-runtime-not-B7') {
      fail('EVIDENCE_REVIEW_SCHEDULE_POLICY_INVALID', 'B7 schedule policy is not deterministic or boundary-safe.');
    }
    const finalActors = list(registry.verificationBoundary && registry.verificationBoundary.finalActors);
    if (!sameOrdered(finalActors, ['deterministic-evaluator', 'instructor-review'])
      || finalActors.some(function invalid(actorType) {
        return !policy.verificationActors[actorType] || policy.verificationActors[actorType].maySetVerified !== true;
      })) {
      fail('EVIDENCE_REVIEW_AUTHORITY_INVALID', 'B7 final verification actors must match L6-B5.');
    }
    return registry;
  }

  function flattenFoundationLessons(pack) {
    return list(pack && pack.tracks)
      .flatMap(function modules(track) { return list(track.modules); })
      .flatMap(function lessons(module) { return list(module.lessons); });
  }

  function sourceTargetFor(subjectId, sourceLesson, stage, acceptedKinds) {
    if (subjectId === 'foundation') {
      return {
        status: 'bridge-target-unqualified',
        stageMatch: false,
        sourceEvidenceKind: sourceLesson.evidenceTarget && sourceLesson.evidenceTarget.evidenceKind || null,
        sourceTargetStatus: sourceLesson.evidenceTarget && sourceLesson.evidenceTarget.status || null
      };
    }
    const target = list(sourceLesson && sourceLesson.masteryEvidence).find(function match(item) {
      return item && item.stage === stage && acceptedKinds.includes(item.evidenceKind);
    }) || null;
    return target ? {
      status: 'adapter-target-present-missing',
      stageMatch: true,
      sourceEvidenceKind: target.evidenceKind,
      sourceTargetStatus: target.status
    } : {
      status: 'hook-target-added-missing',
      stageMatch: false,
      sourceEvidenceKind: null,
      sourceTargetStatus: null
    };
  }

  function sourceLocator(subjectId, sourceLesson) {
    if (subjectId === 'foundation') return cloneJson(sourceLesson.source);
    return cloneJson(sourceLesson && sourceLesson.metadata && sourceLesson.metadata.sourceIdentity || null);
  }

  function createLessonHook(subjectId, sourceLesson, typeId, registry, policy) {
    const lessonId = subjectId === 'foundation'
      ? sourceLesson.lessonId
      : sourceLesson.metadata && sourceLesson.metadata.lessonId;
    if (!lessonId) fail('EVIDENCE_REVIEW_LESSON_ID_MISSING', 'Projected lesson requires an exact stable ID.');
    const typeProfile = policy.profiles && policy.profiles[typeId];
    const evidenceProfile = registry.evidenceProfiles && registry.evidenceProfiles[typeId];
    if (!typeProfile || !evidenceProfile) {
      fail('EVIDENCE_REVIEW_TYPE_UNSUPPORTED', 'No B7 evidence profile for lesson type: ' + typeId);
    }
    const evidenceSlots = STAGES.map(function slot(stage) {
      const acceptedKinds = list(typeProfile.stageEvidence[stage]);
      const preferredEvidenceKind = evidenceProfile[stage].preferredEvidenceKind;
      const sourceTarget = sourceTargetFor(subjectId, sourceLesson, stage, acceptedKinds);
      return {
        slotId: 'evidence:' + subjectId + ':' + lessonId + ':' + stage,
        stage,
        preferredEvidenceKind,
        acceptedEvidenceKinds: cloneJson(acceptedKinds),
        stageMinimum: typeProfile.stageMinimums[stage],
        sourceTarget,
        status: registry.evidenceSlotBoundary.initialStatus,
        artifactRefs: [],
        eventRefs: [],
        verificationStatus: registry.evidenceSlotBoundary.verificationStatus,
        masteryEffect: registry.evidenceSlotBoundary.masteryEffect
      };
    });
    const reviewHookTemplates = typeProfile.retentionPolicy.windowsDays.map(function hook(windowDays) {
      return {
        hookId: 'review:' + subjectId + ':' + lessonId + ':d' + windowDays,
        subjectId,
        lessonId,
        typeId,
        windowDays,
        required: typeProfile.retentionPolicy.requiredWindowsDays.includes(windowDays),
        minimumNormalized: typeProfile.retentionPolicy.minimumNormalized,
        variedPromptRequired: typeProfile.retentionPolicy.variedPromptRequired,
        state: 'template',
        dueAt: null,
        attemptRefs: []
      };
    });
    return {
      hookRecordId: 'mastery-hooks:' + subjectId + ':' + lessonId,
      subjectId,
      lessonId,
      typeId,
      title: subjectId === 'foundation' ? sourceLesson.title : sourceLesson.metadata.title,
      sourceLocator: sourceLocator(subjectId, sourceLesson),
      sourceTargetQualification: registry.evidenceSlotBoundary.sourceTargetQualification,
      evidenceSlots,
      reviewHookTemplates,
      policyRef: registry.governingRefs.masterReadyPolicy + '#/profiles/' + typeId,
      runtimeActivatedByB7: false,
      learnerStateImported: false,
      learnerCompletionClaimed: false,
      masterReadyClaimed: false
    };
  }

  function buildCatalog(input) {
    const sources = object(input, 'EVIDENCE_REVIEW_SOURCES_INVALID', 'B7 catalog sources are required.');
    const registry = validateRegistry(sources.registry, sources.masterReadyPolicy, sources.subjectFactory);
    const russian = object(sources.russian, 'EVIDENCE_REVIEW_RUSSIAN_SOURCE_INVALID', 'Russian adapter sources are required.');
    const math = object(sources.math, 'EVIDENCE_REVIEW_MATH_SOURCE_INVALID', 'Math adapter sources are required.');
    const foundation = object(sources.foundation,
      'EVIDENCE_REVIEW_FOUNDATION_SOURCE_INVALID', 'Foundation bridge sources are required.');
    const russianProjected = russian.adapter.projectLessons(russian.lessons, russian.sources);
    const mathProjectedCatalog = math.adapter.projectCatalog(math.sources);
    const mathProjected = mathProjectedCatalog.overlays.concat(mathProjectedCatalog.legacy);
    const foundationPack = foundation.bridge.buildBridgePack(foundation.sources);
    const foundationProjected = flattenFoundationLessons(foundationPack);

    const sourceCatalogs = {
      russian: russianProjected,
      math: mathProjected,
      foundation: foundationProjected
    };
    const subjects = {};
    SUBJECT_ORDER.forEach(function projectSubject(subjectId) {
      const config = registry.subjects[subjectId];
      const projected = sourceCatalogs[subjectId];
      if (projected.length !== config.expectedLessonCount) {
        fail('EVIDENCE_REVIEW_CATALOG_COUNT_MISMATCH', 'B7 catalog count changed for ' + subjectId);
      }
      const lessonIds = projected.map(function lessonId(lesson) {
        return subjectId === 'foundation' ? lesson.lessonId : lesson.metadata && lesson.metadata.lessonId;
      });
      exactIndex(lessonIds.map(function record(id) { return { id }; }), 'id', 'EVIDENCE_REVIEW_LESSON_DUPLICATE');
      const hooks = projected.map(function lessonHook(lesson) {
        const typeId = config.typeResolution.mode === 'fixed'
          ? config.typeResolution.typeId
          : lesson.lessonType;
        if (config.typeResolution.mode === 'source-factory-module-rule'
          && !config.typeResolution.allowedTypeIds.includes(typeId)) {
          fail('EVIDENCE_REVIEW_FOUNDATION_TYPE_INVALID', 'Foundation hook type is outside its Factory allowlist.');
        }
        return createLessonHook(subjectId, lesson, typeId, registry, sources.masterReadyPolicy);
      });
      subjects[subjectId] = {
        subjectId,
        catalogSource: config.catalogSource,
        runtimeRoute: config.runtimeRoute,
        offlinePolicyRef: config.offlinePolicyRef,
        lessonCount: hooks.length,
        lessons: hooks
      };
    });

    const allLessons = SUBJECT_ORDER.flatMap(function hooks(subjectId) { return subjects[subjectId].lessons; });
    const catalog = {
      registryId: registry.registryId,
      registryVersion: registry.registryVersion,
      release: registry.release,
      status: registry.status,
      programIdentity: cloneJson(registry.programIdentity),
      runtimeBoundary: cloneJson(registry.runtimeBoundary),
      subjectOrder: cloneJson(registry.catalogOrder),
      subjects,
      totals: {
        subjectCount: SUBJECT_ORDER.length,
        lessonCount: allLessons.length,
        evidenceSlotCount: allLessons.reduce(function sum(total, lesson) { return total + lesson.evidenceSlots.length; }, 0),
        reviewHookTemplateCount: allLessons.reduce(function sum(total, lesson) { return total + lesson.reviewHookTemplates.length; }, 0),
        requiredReviewHookTemplateCount: allLessons.reduce(function sum(total, lesson) {
          return total + lesson.reviewHookTemplates.filter(function required(hook) { return hook.required; }).length;
        }, 0)
      },
      openFindings: cloneJson(registry.openFindings),
      offline: cloneJson(registry.offline),
      rollback: cloneJson(registry.rollback),
      claims: {
        learnerStateImported: false,
        learnerCompletionClaimed: false,
        masterReadyClaimed: false,
        runtimeActivationClaimed: false
      }
    };
    assertCatalogBoundary(catalog);
    return catalog;
  }

  function assertCatalogBoundary(catalog) {
    object(catalog, 'EVIDENCE_REVIEW_CATALOG_INVALID', 'B7 hook catalog is required.');
    const lessons = list(catalog.subjectOrder).flatMap(function subjectLessons(subjectId) {
      return list(catalog.subjects && catalog.subjects[subjectId] && catalog.subjects[subjectId].lessons);
    });
    if (!catalog.claims
      || Object.values(catalog.claims).some(function claimed(value) { return value !== false; })
      || catalog.runtimeBoundary.learnerStateMutationAllowed !== false
      || catalog.runtimeBoundary.scheduleWriteAllowed !== false
      || catalog.runtimeBoundary.automaticMasterReadyAllowed !== false
      || lessons.some(function invalid(lesson) {
        return lesson.runtimeActivatedByB7 !== false
          || lesson.learnerStateImported !== false
          || lesson.learnerCompletionClaimed !== false
          || lesson.masterReadyClaimed !== false
          || list(lesson.evidenceSlots).length !== STAGES.length
          || list(lesson.evidenceSlots).some(function slotClaim(slot) {
            return slot.status !== 'missing'
              || list(slot.artifactRefs).length !== 0
              || list(slot.eventRefs).length !== 0
              || slot.verificationStatus !== 'not-submitted'
              || slot.masteryEffect !== 'none-until-policy-verification';
          })
          || list(lesson.reviewHookTemplates).some(function scheduled(hook) {
            return hook.state !== 'template' || hook.dueAt !== null || list(hook.attemptRefs).length !== 0;
          });
      })) {
      fail('EVIDENCE_REVIEW_CATALOG_BOUNDARY_ESCALATION', 'B7 catalog cannot import state, schedule reviews or claim mastery.');
    }
    return true;
  }

  function resolveLesson(catalog, subjectId, lessonId) {
    assertCatalogBoundary(catalog);
    const subject = catalog.subjects && catalog.subjects[String(subjectId || '').trim()];
    const id = String(lessonId || '').trim();
    const matches = list(subject && subject.lessons).filter(function exact(lesson) { return lesson.lessonId === id; });
    if (matches.length !== 1) {
      fail('NO_EXACT_EVIDENCE_HOOK_MATCH', 'B7 evidence hooks require exact subject and lesson IDs.');
    }
    return cloneJson(matches[0]);
  }

  function validateStageEvaluations(lesson, policy, evaluations) {
    const index = exactIndex(list(evaluations).map(function normalize(item) {
      return { ...item, id: item && item.stage };
    }), 'id', 'EVIDENCE_REVIEW_STAGE_DUPLICATE');
    for (const stage of index.keys()) {
      if (!PRE_RETENTION_STAGES.includes(stage)) {
        fail('EVIDENCE_REVIEW_STAGE_INVALID', 'Only pre-retention stages may anchor a review schedule.');
      }
    }
    const profile = policy.profiles[lesson.typeId];
    return PRE_RETENTION_STAGES.map(function evaluate(stage) {
      const item = index.get(stage) || null;
      if (!item) return { stage, state: 'missing', pass: false };
      if (!Number.isFinite(item.normalizedScore) || item.normalizedScore < 0 || item.normalizedScore > 1) {
        fail('EVIDENCE_REVIEW_STAGE_SCORE_INVALID', 'Stage score must be normalized between zero and one.');
      }
      if (item.status === 'verified' && !actorMayVerify(policy, item.verification)) {
        fail('EVIDENCE_REVIEW_UNAUTHORIZED_VERIFIER', 'Only an authorized L6-B5 actor may verify a stage.');
      }
      const pass = item.status === 'verified'
        && item.sourceIntegrityValid === true
        && item.normalizedScore >= profile.stageMinimums[stage];
      return {
        stage,
        state: pass ? 'passed' : 'needs-repair',
        pass,
        normalizedScore: item.normalizedScore,
        minimumNormalized: profile.stageMinimums[stage],
        evaluationRef: item.evaluationId || null
      };
    });
  }

  function validateAttempts(lesson, policy, attempts) {
    const templateIds = new Set(lesson.reviewHookTemplates.map(function id(hook) { return hook.hookId; }));
    const index = exactIndex(list(attempts), 'attemptId', 'EVIDENCE_REVIEW_ATTEMPT_DUPLICATE');
    const output = [];
    for (const attempt of index.values()) {
      if (attempt.subjectId !== lesson.subjectId || attempt.lessonId !== lesson.lessonId
        || !templateIds.has(attempt.hookId)) {
        fail('EVIDENCE_REVIEW_ATTEMPT_SCOPE_INVALID', 'Review attempt must bind the exact hook subject and lesson.');
      }
      const createdMilliseconds = validTimestamp(attempt.createdAt, 'EVIDENCE_REVIEW_ATTEMPT_TIME_INVALID');
      if (!Number.isFinite(attempt.normalizedScore) || attempt.normalizedScore < 0 || attempt.normalizedScore > 1) {
        fail('EVIDENCE_REVIEW_ATTEMPT_SCORE_INVALID', 'Review attempt score must be normalized.');
      }
      if (attempt.status === 'verified' && !actorMayVerify(policy, attempt.verification)) {
        fail('EVIDENCE_REVIEW_UNAUTHORIZED_VERIFIER', 'Only an authorized L6-B5 actor may verify retention.');
      }
      output.push({ ...attempt, createdMilliseconds });
    }
    return output;
  }

  function gateEvaluationPass(policy, evaluation) {
    if (!evaluation) return false;
    if (evaluation.status === 'verified' && !actorMayVerify(policy, evaluation.verification)) {
      fail('EVIDENCE_REVIEW_UNAUTHORIZED_VERIFIER', 'Only an authorized actor may verify the final gate.');
    }
    return evaluation.status === 'verified'
      && evaluation.allStageMinimumsPass === true
      && evaluation.totalThresholdPass === true
      && evaluation.criticalCriteriaPass === true
      && evaluation.requiredPrerequisitesResolved === true
      && evaluation.sourceIntegrityValid === true;
  }

  function materializeSchedule(lessonInput, policy, stateInput, registryInput) {
    const lesson = object(cloneJson(lessonInput),
      'EVIDENCE_REVIEW_LESSON_INVALID', 'B7 lesson hook record is required.');
    const policyValue = object(policy, 'MASTER_READY_POLICY_INVALID', 'L6-B5 policy is required.');
    const registry = object(registryInput,
      'EVIDENCE_REVIEW_REGISTRY_INVALID', 'B7 registry is required for scheduling.');
    const state = stateInput && typeof stateInput === 'object' && !Array.isArray(stateInput) ? cloneJson(stateInput) : {};
    if (lesson.masterReadyClaimed !== false || lesson.learnerStateImported !== false
      || !policyValue.profiles[lesson.typeId]) {
      fail('EVIDENCE_REVIEW_LESSON_BOUNDARY_INVALID', 'B7 schedule requires one unclaimed typed hook record.');
    }
    const stageEvaluations = validateStageEvaluations(lesson, policyValue, state.stageEvaluations);
    const missingStage = stageEvaluations.some(function missing(item) { return item.state === 'missing'; });
    const failedStage = stageEvaluations.some(function failed(item) { return item.state === 'needs-repair'; });
    const base = {
      scheduleId: 'schedule:' + lesson.subjectId + ':' + lesson.lessonId,
      subjectId: lesson.subjectId,
      lessonId: lesson.lessonId,
      typeId: lesson.typeId,
      stageEvaluations,
      hooks: cloneJson(lesson.reviewHookTemplates),
      nextReviewAt: null,
      requiredRetentionComplete: false,
      eligibleForMasterReadyVerification: false,
      masterReadyClaimed: false,
      learnerStateWritePerformed: false,
      scheduleWritePerformed: false
    };
    if (missingStage) {
      const result = { ...base, status: 'WAITING_FOR_VERIFIED_EVIDENCE' };
      assertScheduleBoundary(result, registry);
      return result;
    }
    if (failedStage) {
      const result = { ...base, status: 'NEEDS_REPAIR' };
      assertScheduleBoundary(result, registry);
      return result;
    }
    if (!state.retentionAnchorAt) {
      const result = { ...base, status: 'READY_FOR_RETENTION_ANCHOR' };
      assertScheduleBoundary(result, registry);
      return result;
    }

    const anchorMilliseconds = validTimestamp(state.retentionAnchorAt, 'EVIDENCE_REVIEW_ANCHOR_TIME_INVALID');
    if (!state.asOf) fail('EVIDENCE_REVIEW_AS_OF_REQUIRED', 'B7 scheduling requires an explicit asOf timestamp.');
    const asOfMilliseconds = validTimestamp(state.asOf, 'EVIDENCE_REVIEW_AS_OF_INVALID');
    if (asOfMilliseconds < anchorMilliseconds) {
      fail('EVIDENCE_REVIEW_AS_OF_INVALID', 'asOf cannot precede the retention anchor.');
    }
    const attempts = validateAttempts(lesson, policyValue, state.retentionAttempts);
    const profile = policyValue.profiles[lesson.typeId];
    const dayMilliseconds = registry.reviewSchedule.dayDurationMilliseconds;
    const hooks = lesson.reviewHookTemplates.map(function materialize(template) {
      const dueMilliseconds = anchorMilliseconds + template.windowDays * dayMilliseconds;
      const dueAt = new Date(dueMilliseconds).toISOString();
      const relevant = attempts.filter(function match(attempt) { return attempt.hookId === template.hookId; })
        .sort(function chronological(a, b) { return a.createdMilliseconds - b.createdMilliseconds; });
      const latest = relevant.length ? relevant[relevant.length - 1] : null;
      let hookState = asOfMilliseconds >= dueMilliseconds ? 'due' : 'scheduled';
      let failureReason = null;
      if (latest && latest.createdMilliseconds >= dueMilliseconds) {
        const passed = latest.status === 'verified'
          && latest.normalizedScore >= profile.retentionPolicy.minimumNormalized
          && latest.variedPrompt === true
          && latest.protectedAnswerReused === false
          && latest.sourceIntegrityValid === true;
        hookState = passed ? 'passed' : 'needs-repair';
        if (!passed) failureReason = 'latest-due-attempt-did-not-pass-retention-boundary';
      } else if (latest && latest.createdMilliseconds < dueMilliseconds) {
        failureReason = 'attempt-before-due-does-not-satisfy-window';
      }
      return {
        ...template,
        state: hookState,
        dueAt,
        attemptRefs: relevant.map(function ref(attempt) { return attempt.attemptId; }),
        latestAttemptRef: latest ? latest.attemptId : null,
        failureReason
      };
    });
    const requiredHooks = hooks.filter(function required(hook) { return hook.required; });
    const requiredRetentionComplete = requiredHooks.every(function passed(hook) { return hook.state === 'passed'; });
    const fullGatePass = requiredRetentionComplete && gateEvaluationPass(policyValue, state.gateEvaluation);
    const hasRequiredRepair = requiredHooks.some(function repair(hook) { return hook.state === 'needs-repair'; });
    const nextHook = hooks.find(function next(hook) { return hook.state !== 'passed'; }) || null;
    const status = hasRequiredRepair
      ? 'NEEDS_REPAIR'
      : (fullGatePass
        ? 'MASTER_READY_VERIFICATION_CANDIDATE'
        : (requiredRetentionComplete ? 'RETENTION_COMPLETE_GATE_PENDING' : 'RETENTION_SCHEDULE_ACTIVE'));
    const result = {
      ...base,
      status,
      retentionAnchorAt: state.retentionAnchorAt,
      asOf: state.asOf,
      hooks,
      nextReviewAt: nextHook && nextHook.dueAt || null,
      requiredRetentionComplete,
      eligibleForMasterReadyVerification: fullGatePass,
      masterReadyClaimed: false,
      learnerStateWritePerformed: false,
      scheduleWritePerformed: false
    };
    assertScheduleBoundary(result, registry);
    return result;
  }

  function assertScheduleBoundary(schedule, registry) {
    object(schedule, 'EVIDENCE_REVIEW_SCHEDULE_INVALID', 'B7 schedule result is required.');
    const allowedStates = new Set(list(registry.reviewSchedule && registry.reviewSchedule.hookStates));
    if (schedule.masterReadyClaimed !== false
      || schedule.learnerStateWritePerformed !== false
      || schedule.scheduleWritePerformed !== false
      || list(schedule.hooks).some(function invalid(hook) {
        return !allowedStates.has(hook.state) || !Array.isArray(hook.attemptRefs);
      })
      || (schedule.eligibleForMasterReadyVerification === true
        && schedule.status !== 'MASTER_READY_VERIFICATION_CANDIDATE')) {
      fail('EVIDENCE_REVIEW_SCHEDULE_BOUNDARY_ESCALATION', 'B7 schedule cannot write state or claim Master-ready.');
    }
    return true;
  }

  const api = Object.freeze({
    registryId: REGISTRY_ID,
    registryVersion: REGISTRY_VERSION,
    release: RELEASE,
    stageOrder: STAGES,
    subjectOrder: SUBJECT_ORDER,
    buildCatalog,
    resolveLesson,
    materializeSchedule,
    assertCatalogBoundary,
    assertScheduleBoundary
  });

  global.BaumanReferenceSubjectEvidenceReview = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
