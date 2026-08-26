(function foundationPreparatoryBridgeModule(global) {
  'use strict';

  const CONTRACT_ID = 'bauman-foundation-preparatory-bridge';
  const CONTRACT_VERSION = '1.0.0';
  const RELEASE = 'L7-B6-FOUNDATION-PREPARATORY-COMPLETION-V1';
  const REQUIRED_TRACK_IDS = Object.freeze([
    'classroom-russian',
    'math-science-transition',
    'study-method-bridge'
  ]);

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
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      fail(code, message);
    }
    return value;
  }

  function uniqueIndex(records, key, code) {
    const index = new Map();
    list(records).forEach(function add(record) {
      const id = String(record && record[key] || '').trim();
      if (!id) fail(code, 'A stable ' + key + ' is required.');
      if (index.has(id)) fail(code, 'Duplicate ' + key + ': ' + id);
      index.set(id, record);
    });
    return index;
  }

  function sameOrderedValues(actual, expected) {
    return actual.length === expected.length
      && actual.every(function equal(value, index) { return value === expected[index]; });
  }

  function sorted(values) {
    return list(values).slice().sort();
  }

  function sameMembers(actual, expected) {
    return sameOrderedValues(sorted(actual), sorted(expected));
  }

  function resolveFactoryRule(factorySubject, moduleId) {
    const rules = list(factorySubject && factorySubject.lessonTypePolicy && factorySubject.lessonTypePolicy.rules)
      .filter(function match(rule) { return list(rule && rule.moduleIds).includes(moduleId); });
    if (rules.length !== 1) {
      fail('FOUNDATION_FACTORY_RULE_UNRESOLVED', 'Foundation module must resolve to exactly one Factory rule: ' + moduleId);
    }
    return rules[0];
  }

  function resolveLessonRole(contract, lessonId) {
    const matches = list(contract.lessonRolePolicy).filter(function match(policy) {
      return lessonId.endsWith(String(policy && policy.suffix || ''));
    });
    if (matches.length !== 1) {
      fail('FOUNDATION_LESSON_ROLE_UNRESOLVED', 'Foundation lesson must resolve to exactly one role: ' + lessonId);
    }
    return matches[0];
  }

  function validateContract(contract) {
    object(contract, 'FOUNDATION_CONTRACT_INVALID', 'Foundation bridge contract must be an object.');
    if (contract.contractId !== CONTRACT_ID
      || contract.contractVersion !== CONTRACT_VERSION
      || contract.release !== RELEASE) {
      fail('FOUNDATION_CONTRACT_IDENTITY_MISMATCH', 'Foundation bridge identity is not recognized.');
    }
    if (!contract.scope || contract.scope.subjectId !== 'foundation' || contract.scope.stageId !== 'preparatory') {
      fail('FOUNDATION_SCOPE_INVALID', 'Foundation bridge is restricted to the preparatory stage.');
    }
    const boundary = object(contract.runtimeBoundary, 'FOUNDATION_BOUNDARY_MISSING', 'Foundation runtime boundary is required.');
    const forbiddenTrue = [
      'sourceMutationAllowed',
      'learnerStateMutationAllowed',
      'routeActivationAllowed',
      'automaticMasterReadyAllowed',
      'specialistCutoverAllowed',
      'fuzzyLessonMatchAllowed'
    ];
    if (forbiddenTrue.some(function enabled(key) { return boundary[key] !== false; })
      || boundary.legacyFallbackRequired !== true
      || boundary.projectionMode !== 'read-only-exact-id') {
      fail('FOUNDATION_BOUNDARY_ESCALATION', 'Foundation bridge must remain read-only, exact-ID and fallback-safe.');
    }

    const tracks = list(contract.tracks);
    const trackIndex = uniqueIndex(tracks, 'id', 'FOUNDATION_TRACK_DUPLICATE');
    if (!sameOrderedValues(tracks.map(function id(track) { return track.id; }), REQUIRED_TRACK_IDS)
      || tracks.some(function required(track) { return track.required !== true; })) {
      fail('FOUNDATION_TRACK_SET_INVALID', 'All three required Foundation bridge tracks must remain ordered and required.');
    }
    const assignedModules = tracks.flatMap(function modules(track) { return list(track.moduleIds); });
    if (new Set(assignedModules).size !== assignedModules.length) {
      fail('FOUNDATION_MODULE_MULTI_ASSIGNMENT', 'Each preparatory module must belong to exactly one bridge track.');
    }
    const checkpointIds = tracks.flatMap(function checkpoints(track) {
      return list(track.capabilityCheckpoints).map(function id(checkpoint) { return checkpoint && checkpoint.id; });
    });
    if (checkpointIds.length !== 9 || new Set(checkpointIds).size !== checkpointIds.length) {
      fail('FOUNDATION_CHECKPOINT_SET_INVALID', 'The bridge requires nine unique capability checkpoints.');
    }
    tracks.forEach(function validateTrack(track) {
      if (!trackIndex.has(track.id) || !list(track.moduleIds).length) {
        fail('FOUNDATION_TRACK_INVALID', 'Foundation track requires stable modules.');
      }
      list(track.capabilityCheckpoints).forEach(function validateCheckpoint(checkpoint) {
        if (!checkpoint || !checkpoint.id || !checkpoint.evidenceKind
          || checkpoint.masteryEffect !== 'none-until-L7-B7') {
          fail('FOUNDATION_CHECKPOINT_MASTERY_ESCALATION', 'B6 checkpoints are targets, not Master-ready evidence.');
        }
      });
      list(track.handoffs).forEach(function validateHandoff(handoff) {
        if (!handoff || handoff.targetLessonId !== null
          || handoff.exactLessonEquivalenceClaimed !== false
          || handoff.masteryEffect !== 'none') {
          fail('FOUNDATION_HANDOFF_PROMOTION', 'Foundation handoffs cannot infer lesson equivalence or mastery.');
        }
      });
      if (track.reviewedRuntimeReference && track.reviewedRuntimeReference.expansionAllowed !== false) {
        fail('FOUNDATION_REFERENCE_EXPANSION', 'The B11 reference cannot be expanded by B6.');
      }
    });

    const roles = list(contract.lessonRolePolicy);
    uniqueIndex(roles, 'suffix', 'FOUNDATION_ROLE_DUPLICATE');
    if (!sameMembers(roles.map(function suffix(role) { return role.suffix; }), ['_l1', '_l2', '_l3'])
      || roles.some(function status(role) { return role.evidenceStatus !== 'target-defined-not-collected'; })) {
      fail('FOUNDATION_ROLE_POLICY_INVALID', 'Foundation lesson roles must remain uncollected evidence targets.');
    }

    const support = object(contract.supportingEvidencePolicy,
      'FOUNDATION_SUPPORT_POLICY_MISSING', 'Foundation supporting-evidence policy is required.');
    if (Object.values(support).some(function qualified(item) { return !item || item.masteryQualified !== false; })) {
      fail('FOUNDATION_SUPPORT_MASTERY_ESCALATION', 'Current Foundation support records are not mastery-qualified.');
    }
    return contract;
  }

  function sourceTemplateSignals(lessons, tests) {
    const prepLessons = list(lessons).filter(function stage(lesson) { return lesson && lesson.stage === 'preparatory'; });
    const prepQuestions = list(tests && tests.questions).filter(function stage(question) {
      return question && question.stage === 'preparatory';
    });
    function distinct(path) {
      return new Set(prepLessons.map(function serialize(lesson) {
        const value = path.reduce(function get(current, key) { return current && current[key]; }, lesson);
        return JSON.stringify(value);
      })).size;
    }
    return {
      uniqueKeyPointSets: distinct(['keyPoints']),
      uniqueCoreTheorySets: distinct(['eLearning', 'coreTheory']),
      uniqueMasteryCriteriaSets: distinct(['eLearning', 'masteryCriteria']),
      preparatoryQuestionRecords: prepQuestions.length,
      uniquePreparatoryQuestionBodies: new Set(prepQuestions.map(function serialize(question) {
        return JSON.stringify({
          prompt: question.prompt,
          options: question.options,
          answerIndex: question.answerIndex,
          reviewLesson: question.reviewLesson
        });
      })).size
    };
  }

  function supportingEvidence(contract, exercises, tests, simulations, curriculumStageIds) {
    const prepExercises = list(exercises).filter(function stage(record) { return record && record.stage === 'preparatory'; });
    const prepQuestions = list(tests && tests.questions).filter(function stage(record) { return record && record.stage === 'preparatory'; });
    const observations = list(simulations && simulations.observation);
    const practices = list(simulations && simulations.practice);
    const prepObservations = observations.filter(function stage(record) { return record && record.stage === 'preparatory'; });
    const prepPractices = practices.filter(function stage(record) { return record && record.stage === 'preparatory'; });
    const simulationStageDrift = Array.from(new Set(observations.concat(practices)
      .map(function stage(record) { return record && record.stage; })
      .filter(function unknown(stageId) { return stageId && !curriculumStageIds.includes(stageId); }))).sort();
    return {
      exercises: {
        recordCount: prepExercises.length,
        status: contract.supportingEvidencePolicy.exercises.status,
        masteryQualified: false
      },
      tests: {
        recordCount: prepQuestions.length,
        status: contract.supportingEvidencePolicy.tests.status,
        masteryQualified: false
      },
      simulations: {
        observationRecordCount: prepObservations.length,
        practiceRecordCount: prepPractices.length,
        stageDrift: simulationStageDrift,
        status: contract.supportingEvidencePolicy.simulations.status,
        masteryQualified: false
      }
    };
  }

  function validateSpecialistsAndHandoffs(track, factorySubjects, contract) {
    list(track.specialistRefs).forEach(function validateSpecialist(ref) {
      const subject = factorySubjects && factorySubjects[ref.subjectId];
      if (!subject || subject.engineRef !== ref.owner || !subject.routes || subject.routes.main !== ref.route) {
        fail('FOUNDATION_SPECIALIST_REF_INVALID', 'Foundation specialist reference does not match Subject Factory: ' + ref.subjectId);
      }
    });
    list(track.handoffs).forEach(function validateHandoff(ref) {
      if (ref.targetSubjectId) {
        const subject = factorySubjects && factorySubjects[ref.targetSubjectId];
        if (!subject || !subject.routes || subject.routes.main !== ref.targetRoute) {
          fail('FOUNDATION_HANDOFF_ROUTE_INVALID', 'Foundation handoff route does not match Subject Factory: ' + ref.targetSubjectId);
        }
      } else if (ref.targetRoute !== contract.sourceAuthority.roadmap) {
        fail('FOUNDATION_HANDOFF_ROUTE_INVALID', 'Non-subject Foundation handoff must resolve to the pinned roadmap.');
      }
    });
  }

  function buildBridgePack(sources) {
    const input = object(sources, 'FOUNDATION_SOURCES_INVALID', 'Foundation bridge sources are required.');
    const contract = validateContract(input.contract);
    const curriculum = object(input.curriculum, 'FOUNDATION_CURRICULUM_INVALID', 'Foundation curriculum is required.');
    const lessons = list(input.lessons);
    const factory = object(input.subjectFactory, 'FOUNDATION_FACTORY_INVALID', 'Subject Factory is required.');
    const referenceActivation = object(input.referenceActivation,
      'FOUNDATION_REFERENCE_INVALID', 'B11 reference activation is required.');
    const curriculumStageIds = list(curriculum.stages).map(function id(stage) { return stage && stage.id; });
    if (!curriculumStageIds.includes(contract.scope.stageId)) {
      fail('FOUNDATION_STAGE_MISSING', 'Preparatory stage is missing from Foundation curriculum.');
    }

    const moduleIndex = uniqueIndex(curriculum.modules, 'id', 'FOUNDATION_MODULE_DUPLICATE');
    const lessonIndex = uniqueIndex(lessons, 'id', 'FOUNDATION_LESSON_DUPLICATE');
    const preparatoryModules = list(curriculum.modules).filter(function stage(module) {
      return module && module.stage === contract.scope.stageId;
    });
    const preparatoryLessons = lessons.filter(function stage(lesson) {
      return lesson && lesson.stage === contract.scope.stageId;
    });
    const assignedModuleIds = contract.tracks.flatMap(function modules(track) { return track.moduleIds; });
    if (!sameMembers(assignedModuleIds, preparatoryModules.map(function id(module) { return module.id; }))) {
      fail('FOUNDATION_MODULE_COVERAGE_MISMATCH', 'Bridge tracks must cover every current preparatory module exactly once.');
    }

    const factorySubject = factory.subjects && factory.subjects.foundation;
    if (!factorySubject || factorySubject.compatibility.sourceMutation !== false
      || factorySubject.compatibility.learnerStateMigration !== false
      || factorySubject.compatibility.directFactoryRender !== false) {
      fail('FOUNDATION_FACTORY_BOUNDARY_INVALID', 'Foundation Factory boundary must remain read-only and non-rendering.');
    }

    const enabledFoundationReferences = list(referenceActivation.referenceLessons).filter(function enabled(reference) {
      return reference && reference.enabled === true && reference.subjectId === 'foundation';
    });
    const b11Policy = contract.supportingEvidencePolicy.b11Reference;
    const b11Reference = enabledFoundationReferences.find(function lesson(reference) {
      return reference.lessonId === b11Policy.expectedLessonId;
    });
    if (enabledFoundationReferences.length !== b11Policy.expectedEnabledRecords
      || !b11Reference
      || b11Reference.activationId !== contract.tracks[0].reviewedRuntimeReference.activationId
      || b11Reference.expectedRender && b11Reference.expectedRender.masterReadyClaimed !== false) {
      fail('FOUNDATION_B11_SCOPE_MISMATCH', 'B6 must preserve the one exact B11 Foundation reference and its non-mastery boundary.');
    }

    const projectedLessonIds = [];
    const roleCounts = {};
    const tracks = contract.tracks.map(function projectTrack(track) {
      validateSpecialistsAndHandoffs(track, factory.subjects, contract);
      const modules = track.moduleIds.map(function projectModule(moduleId) {
        const module = moduleIndex.get(moduleId);
        if (!module || module.stage !== contract.scope.stageId) {
          fail('FOUNDATION_MODULE_SOURCE_MISSING', 'Assigned Foundation module is missing from preparatory source: ' + moduleId);
        }
        const factoryRule = resolveFactoryRule(factorySubject, moduleId);
        const expectedType = track.lessonTypeByModule && track.lessonTypeByModule[moduleId];
        if (!expectedType || factoryRule.type !== expectedType) {
          fail('FOUNDATION_FACTORY_TYPE_MISMATCH', 'Foundation bridge type does not match Subject Factory: ' + moduleId);
        }
        const lessonRefs = list(module.lessons).map(function projectLesson(lessonId) {
          const lesson = lessonIndex.get(lessonId);
          if (!lesson || lesson.stage !== contract.scope.stageId || lesson.moduleId !== moduleId) {
            fail('FOUNDATION_LESSON_SOURCE_MISMATCH', 'Foundation lesson source membership is invalid: ' + lessonId);
          }
          const role = resolveLessonRole(contract, lessonId);
          const sourceIndex = lessons.indexOf(lesson);
          projectedLessonIds.push(lessonId);
          roleCounts[role.role] = (roleCounts[role.role] || 0) + 1;
          return {
            subjectId: 'foundation',
            stageId: contract.scope.stageId,
            trackId: track.id,
            moduleId,
            lessonId,
            lessonType: expectedType,
            title: String(lesson.title),
            kind: String(lesson.kind),
            source: {
              path: contract.sourceAuthority.lessons,
              sourceIndex,
              recordId: lessonId,
              sourceVersion: String(lesson.eLearning && lesson.eLearning.lessonContractVersion || 'unknown')
            },
            role: role.role,
            evidenceTarget: {
              evidenceKind: role.evidenceKind,
              status: role.evidenceStatus,
              artifactRefs: []
            },
            runtimeReference: b11Reference.lessonId === lessonId ? 'existing-b11-exact' : 'unchanged-foundation-legacy',
            activatedByB6: false,
            learnerCompletionClaimed: false,
            masterReadyClaimed: false
          };
        });
        if (!sameOrderedValues(lessonRefs.map(function id(ref) { return ref.lessonId; }), list(module.lessons))) {
          fail('FOUNDATION_LESSON_ORDER_MISMATCH', 'Foundation lesson order must follow curriculum source order.');
        }
        return {
          moduleId,
          title: String(module.title),
          goal: String(module.goal),
          hours: Number(module.hours),
          lessonType: expectedType,
          factoryRuleId: factoryRule.id,
          source: {
            path: contract.sourceAuthority.curriculum,
            sourceIndex: list(curriculum.modules).indexOf(module),
            recordId: moduleId
          },
          lessons: lessonRefs
        };
      });
      return {
        trackId: track.id,
        title: track.title,
        status: 'structural-coverage-complete-review-gates-pending',
        modules,
        capabilityCheckpoints: cloneJson(track.capabilityCheckpoints),
        specialistRefs: cloneJson(track.specialistRefs),
        handoffs: cloneJson(track.handoffs),
        reviewedRuntimeReference: cloneJson(track.reviewedRuntimeReference || null),
        learnerCompletionClaimed: false,
        masterReadyClaimed: false
      };
    });

    const sourcePreparatoryLessonIds = preparatoryLessons.map(function id(lesson) { return lesson.id; });
    if (new Set(projectedLessonIds).size !== projectedLessonIds.length
      || !sameMembers(projectedLessonIds, sourcePreparatoryLessonIds)) {
      fail('FOUNDATION_LESSON_COVERAGE_MISMATCH', 'Bridge pack must cover every current preparatory lesson exactly once.');
    }

    const support = supportingEvidence(contract, input.exercises, input.tests, input.simulations, curriculumStageIds);
    if (support.exercises.recordCount !== contract.supportingEvidencePolicy.exercises.expectedPreparatoryRecords
      || support.tests.recordCount !== contract.supportingEvidencePolicy.tests.expectedPreparatoryRecords
      || support.simulations.observationRecordCount !== contract.supportingEvidencePolicy.simulations.expectedPreparatoryObservationRecords
      || support.simulations.practiceRecordCount !== contract.supportingEvidencePolicy.simulations.expectedPreparatoryPracticeRecords) {
      fail('FOUNDATION_SUPPORT_COUNT_MISMATCH', 'Foundation supporting-source counts changed and require review.');
    }

    const pack = {
      contractId: contract.contractId,
      contractVersion: contract.contractVersion,
      release: contract.release,
      status: contract.status,
      programIdentity: cloneJson(contract.programIdentity),
      scope: {
        subjectId: 'foundation',
        stageId: 'preparatory',
        structuralCoverageComplete: true,
        academicContentApproved: false,
        assessmentQualityApproved: false
      },
      sourceAuthority: cloneJson(contract.sourceAuthority),
      runtimeBoundary: cloneJson(contract.runtimeBoundary),
      coverage: {
        trackIds: tracks.map(function id(track) { return track.trackId; }),
        moduleIds: preparatoryModules.map(function id(module) { return module.id; }),
        lessonIds: projectedLessonIds,
        moduleCount: preparatoryModules.length,
        lessonCount: projectedLessonIds.length,
        roleCounts
      },
      tracks,
      supportingEvidence: support,
      sourceTemplateSignals: sourceTemplateSignals(lessons, input.tests),
      b11Reference: {
        activationId: b11Reference.activationId,
        lessonId: b11Reference.lessonId,
        enabledReferenceCount: enabledFoundationReferences.length,
        expandedByB6: false,
        masterReadyClaimed: false
      },
      claims: {
        learnerCompletionClaimed: false,
        masterReadyClaimed: false,
        runtimeCutoverClaimed: false,
        wholeFoundationActivationClaimed: false
      },
      offline: {
        policyRef: contract.runtimeBoundary.offlinePolicyRef,
        deterministicFallback: contract.runtimeBoundary.legacyRoute,
        serviceWorkerOwner: 'site-root',
        changedByB6: false
      },
      openFindings: cloneJson(contract.openFindings),
      rollback: cloneJson(contract.rollback)
    };
    assertBoundary(pack);
    return pack;
  }

  function assertBoundary(pack) {
    object(pack, 'FOUNDATION_PACK_INVALID', 'Foundation bridge pack is required.');
    if (!pack.claims
      || Object.values(pack.claims).some(function claimed(value) { return value !== false; })
      || !pack.runtimeBoundary
      || pack.runtimeBoundary.routeActivationAllowed !== false
      || pack.runtimeBoundary.automaticMasterReadyAllowed !== false
      || list(pack.tracks).some(function trackClaim(track) {
        return track.learnerCompletionClaimed !== false
          || track.masterReadyClaimed !== false
          || list(track.handoffs).some(function promoted(ref) {
            return ref.targetLessonId !== null || ref.exactLessonEquivalenceClaimed !== false || ref.masteryEffect !== 'none';
          })
          || list(track.modules).some(function moduleClaim(module) {
            return list(module.lessons).some(function lessonClaim(lesson) {
              return lesson.activatedByB6 !== false
                || lesson.learnerCompletionClaimed !== false
                || lesson.masterReadyClaimed !== false
                || !lesson.evidenceTarget
                || lesson.evidenceTarget.status !== 'target-defined-not-collected';
            });
          });
      })
      || Object.values(pack.supportingEvidence || {}).some(function qualified(item) {
        return item && item.masteryQualified !== false;
      })) {
      fail('FOUNDATION_PACK_BOUNDARY_ESCALATION', 'Foundation B6 pack cannot claim runtime activation, completion or mastery.');
    }
    return true;
  }

  function resolveLesson(pack, lessonId) {
    assertBoundary(pack);
    const id = String(lessonId || '').trim();
    const matches = list(pack.tracks).flatMap(function modules(track) { return list(track.modules); })
      .flatMap(function lessons(module) { return list(module.lessons); })
      .filter(function exact(lesson) { return lesson.lessonId === id; });
    if (matches.length !== 1) {
      fail('NO_EXACT_FOUNDATION_LESSON_MATCH', 'Foundation lesson requires one exact bridge ID match.');
    }
    return cloneJson(matches[0]);
  }

  function resolveTrack(pack, trackId) {
    assertBoundary(pack);
    const id = String(trackId || '').trim();
    const matches = list(pack.tracks).filter(function exact(track) { return track.trackId === id; });
    if (matches.length !== 1) {
      fail('NO_EXACT_FOUNDATION_TRACK_MATCH', 'Foundation track requires one exact bridge ID match.');
    }
    return cloneJson(matches[0]);
  }

  const api = Object.freeze({
    contractId: CONTRACT_ID,
    contractVersion: CONTRACT_VERSION,
    release: RELEASE,
    requiredTrackIds: REQUIRED_TRACK_IDS,
    buildBridgePack,
    assertBoundary,
    resolveLesson,
    resolveTrack
  });

  global.BaumanFoundationPreparatoryBridge = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
