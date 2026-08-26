(function mathUniversalAdapterModule(global) {
  'use strict';

  const RELEASE = 'L7-B5-MATH-UNIVERSAL-ADAPTER-V1';
  const CONTRACT_VERSION = '2.0.0';
  const ADAPTER_ID = 'math-universal-adapter-v1';
  const LEGACY_SOURCE_PATH = 'subjects/math/data/lessons.json';
  const OVERLAY_SOURCE_PATH = 'subjects/math/data/theory_lecture_content.json';
  const PREREQUISITE_GRAPH_PATH = 'assets/data/lesson/math-prerequisite-graph-v1.generated.json';
  const PROGRAM_IDENTITY = Object.freeze({
    department: 'ИУ-5',
    officialPublishedDirectionCode: '09.04.01',
    personalizedDisplayCode: '09.04.01/11'
  });
  const ROLE_PROFILE = Object.freeze({
    problem_framing: ['orientation', 'derivation', 'math-rich-theory-reader'],
    deep_essence: ['theory', 'derivation', 'math-rich-theory-reader'],
    counter_intuition: ['misconception', 'result-verification', 'math-step-solution'],
    real_bridge: ['project-nir-evidence', 'result-verification', 'math-step-solution'],
    notation: ['theory', 'derivation', 'math-formula-typesetter'],
    core_formula: ['theory', 'derivation', 'math-formula-typesetter'],
    assumption_gate: ['visual-check', 'result-verification', 'math-step-solution'],
    mini_case: ['worked-example', 'mathematical-solution', 'math-step-solution'],
    interpretation: ['review', 'result-verification', 'math-rich-theory-reader'],
    simulation: ['lab-simulation', 'simulation-result', 'math-parameter-simulation'],
    common_mistakes: ['misconception', 'result-verification', 'math-step-solution'],
    application: ['project-nir-evidence', 'result-verification', 'math-rich-theory-reader'],
    practice: ['exercise', 'mathematical-solution', 'math-step-solution'],
    professor_qa: ['oral', 'oral-response', 'math-professor-oral'],
    bridge: ['concept-map', 'derivation', 'math-concept-map'],
    takeaway: ['mastery', 'retention-check', 'math-rich-theory-reader'],
    basis_order_sign: ['visual-check', 'result-verification', 'math-formula-typesetter'],
    contract_failure_analysis: ['misconception', 'result-verification', 'math-step-solution'],
    redundancy_analysis: ['worked-example', 'mathematical-solution', 'math-step-solution'],
    sensitivity_analysis: ['lab-simulation', 'simulation-result', 'math-parameter-simulation'],
    engineering_transfer: ['concept-map', 'result-verification', 'math-concept-map'],
    mastery_close: ['mastery', 'retention-check', 'math-rich-theory-reader'],
    derivation: ['worked-example', 'derivation', 'math-step-solution'],
    verification: ['visual-check', 'result-verification', 'math-step-solution'],
    diagnostic_limits: ['misconception', 'result-verification', 'math-step-solution'],
    numerical_rank: ['worked-example', 'mathematical-solution', 'math-step-solution'],
    rank_tolerance: ['visual-check', 'result-verification', 'math-formula-typesetter'],
    code_audit: ['review', 'result-verification', 'math-step-solution']
  });
  const BANK_DEFINITIONS = Object.freeze([
    ['formulas', 'formula-bank', 'embedded-notation-and-core-formula'],
    ['exercises', 'exercise-bank', 'embedded-mini-case-and-practice'],
    ['simulations', 'simulation-bank', 'embedded-simulation-role'],
    ['applications', 'application-bank', 'embedded-application-role'],
    ['professorQa', 'professor-qa-bank', 'embedded-professor-qa-role'],
    ['tests', 'assessment-bank', 'none-external-bank-unavailable'],
    ['questionBank', 'question-bank', 'none-external-bank-unavailable']
  ]);

  function array(value) {
    return Array.isArray(value) ? value : [];
  }

  function identifier(value, fallback) {
    const normalized = String(value || fallback || '')
      .trim()
      .replace(/[^A-Za-z0-9._:-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return normalized || 'unknown';
  }

  function unique(values) {
    return Array.from(new Set(array(values).filter(Boolean)));
  }

  function cloneJson(value) {
    return value === undefined ? null : JSON.parse(JSON.stringify(value));
  }

  function countRecords(value) {
    if (Array.isArray(value)) return value.length;
    if (!value || typeof value !== 'object') return null;
    for (const key of ['records', 'items', 'questions', 'lessons']) {
      if (Array.isArray(value[key])) return value[key].length;
    }
    return null;
  }

  function externalBankStatus(banks) {
    const source = banks || {};
    const output = {};
    BANK_DEFINITIONS.forEach(function mapBank(definition) {
      const count = countRecords(source[definition[0]]);
      output[definition[0]] = {
        sourceFamily: definition[1],
        recordCount: count,
        availability: count === null ? 'not-inspected' : (count > 0 ? 'available' : 'unavailable'),
        fallback: definition[2],
        completionClaimed: false
      };
    });
    return output;
  }

  function sourceIdentity(config) {
    return {
      sourceArtifactId: identifier(config.artifactId),
      sourceArtifactKind: config.artifactKind,
      sourceVersion: String(config.sourceVersion || RELEASE),
      locator: {
        sourcePath: config.sourcePath,
        lessonId: String(config.lessonId),
        sourceAnchors: array(config.sourceAnchors)
      },
      origin: config.origin,
      adapterId: ADAPTER_ID,
      precedence: config.precedence
    };
  }

  function roleProfile(slide) {
    const role = String(slide && slide.role || '').trim();
    return ROLE_PROFILE[role] || ['theory', 'derivation', 'math-rich-theory-reader'];
  }

  function slideBlock(record, slide, index, sourceConfig, offlineId) {
    const profile = roleProfile(slide);
    return {
      id: identifier((slide && slide.id) || sourceConfig.lessonId + '-slide-' + String(index + 1).padStart(2, '0')),
      kind: profile[0],
      sourceBindings: [sourceIdentity({
        artifactId: (slide && slide.id) || sourceConfig.lessonId + '-slide-' + (index + 1),
        artifactKind: 'slide-deck',
        sourceVersion: sourceConfig.sourceVersion,
        sourcePath: sourceConfig.sourcePath,
        lessonId: sourceConfig.lessonId,
        sourceAnchors: [(sourceConfig.recordPointerPrefix || '') + '/' + sourceConfig.sourceIndex + '/slides/' + index],
        origin: sourceConfig.origin,
        precedence: sourceConfig.precedence
      })],
      payload: {
        title: String(slide && slide.title || record.title || sourceConfig.lessonId),
        sourceRole: String(slide && slide.role || 'unspecified'),
        sourceLayout: slide && slide.layout ? String(slide.layout) : null,
        sourceBlocks: cloneJson(array(slide && slide.blocks))
      },
      presentationHint: {
        strategy: 'preserve-source-order',
        sourceIndex: index,
        specialistOwned: true
      },
      evidenceRefs: [profile[1]],
      offlineRef: offlineId,
      specialistCapabilityRef: profile[2]
    };
  }

  function masteryEvidence(lessonId) {
    return [
      ['understand', 'derivation'],
      ['solve', 'mathematical-solution'],
      ['build-apply', 'simulation-result'],
      ['explain', 'oral-response'],
      ['retain', 'retention-check']
    ].map(function evidence(entry, index) {
      return {
        id: identifier(lessonId + '-evidence-' + (index + 1)),
        stage: entry[0],
        evidenceKind: entry[1],
        status: 'missing',
        artifactRefs: []
      };
    });
  }

  function graphNode(lessonId, prerequisiteGraph) {
    const node = array(prerequisiteGraph && prerequisiteGraph.nodes).find(function match(candidate) {
      return candidate && candidate.lessonId === lessonId;
    }) || null;
    if (node && array(node.prerequisiteRefs).some(function invalid(edge) {
      return !edge
        || edge.assessmentBlocking !== false
        || edge.manualReviewRequired !== true
        || edge.provenance !== 'system-derived-source-order';
    })) {
      throw new TypeError('Math prerequisite candidates must remain non-blocking and manual-review-only.');
    }
    return node;
  }

  function graphPrerequisiteCandidates(node) {
    return array(node && node.prerequisiteRefs).map(function project(edge) {
      return {
        targetLessonId: String(edge.targetLessonId),
        relation: String(edge.relation),
        requiredState: String(edge.requiredState),
        runtimeActive: false,
        assessmentBlocking: false,
        manualReviewRequired: true,
        provenance: String(edge.provenance || 'system-derived-source-order')
      };
    });
  }

  function downstreamSupport(node) {
    return array(node && node.downstreamRefs).map(function project(ref) {
      return {
        targetRef: String(ref),
        relation: 'supports',
        masteryEffect: 'none-until-reviewed-objective-binding',
        learnerStateMutation: false,
        aiMayPromote: false
      };
    });
  }

  function contextRefs(lessonId, sourceFamily, specialist) {
    return {
      currentLesson: lessonId,
      prerequisiteGraph: PREREQUISITE_GRAPH_PATH + '#' + lessonId,
      learnerProgress: 'learning-state:math:' + lessonId,
      assessmentErrors: 'assessment-errors:math:' + lessonId,
      weakTopics: 'weak-topics:math',
      schedule: 'roadmap-v3:schedule',
      currentSubject: 'math',
      languageState: 'language-state:math-terminology',
      nirVkrContext: 'research-state:nir-vkr',
      sourceFamily,
      specialist
    };
  }

  function offlineContract(lessonId) {
    const offlineId = identifier(lessonId + '-math-pack');
    return {
      offlineId,
      value: {
        policyId: 'math-rich-explicit',
        resources: [{
          id: offlineId,
          availability: 'subject-pack',
          bytesPolicy: 'reuse-existing-math-assets-and-explicit-pack-limits',
          freshnessPolicy: 'content-version-and-integrity-check',
          rollbackRef: 'subjects/math/index.html'
        }],
        deterministicFallbackRef: offlineId,
        legacyRuntimeEntry: 'subjects/math/index.html',
        serviceWorkerOwner: 'site-root'
      }
    };
  }

  function projectLegacyLesson(lesson, options) {
    if (!lesson || typeof lesson !== 'object' || Array.isArray(lesson)) {
      throw new TypeError('Math legacy lesson must be an object.');
    }
    if (!lesson.id || !lesson.stage || !lesson.title || !array(lesson.slides).length) {
      throw new TypeError('Math legacy lesson requires stable id, stage, title and slides.');
    }
    const config = options || {};
    const sourceIndex = Number.isInteger(config.sourceIndex) ? config.sourceIndex : 0;
    const sourceVersion = String(lesson.contentDepth || lesson.sourceAnchors && lesson.sourceAnchors.version || RELEASE);
    const node = config.prerequisiteNode || graphNode(lesson.id, config.prerequisiteGraph);
    const candidates = graphPrerequisiteCandidates(node);
    const support = downstreamSupport(node);
    const offline = offlineContract(lesson.id);
    const sourceConfig = {
      sourceIndex,
      sourcePath: LEGACY_SOURCE_PATH,
      lessonId: lesson.id,
      sourceVersion,
      origin: 'legacy-runtime',
      precedence: 100,
      recordPointerPrefix: ''
    };
    const specialist = {
      theoryReader: 'math-rich-theory-reader',
      formulaTypesetter: 'math-formula-typesetter',
      stepSolution: 'math-step-solution',
      parameterSimulation: 'math-parameter-simulation',
      professorOral: 'math-professor-oral',
      embeddedRoleCount: lesson.slides.length,
      externalBanksStatus: 'planned-empty'
    };
    return {
      metadata: {
        contractVersion: CONTRACT_VERSION,
        lessonId: lesson.id,
        subjectId: 'math',
        lessonType: 'mathematics',
        titles: { primary: lesson.title, vi: lesson.title },
        stageId: lesson.stage,
        estimatedMinutes: Math.max(45, lesson.slides.length * 5),
        difficulty: String(lesson.contentDepth || lesson.stage),
        programIdentity: PROGRAM_IDENTITY,
        sourceIdentity: sourceIdentity({
          artifactId: lesson.id,
          artifactKind: 'lesson-record',
          sourceVersion,
          sourcePath: LEGACY_SOURCE_PATH,
          lessonId: lesson.id,
          sourceAnchors: ['/' + sourceIndex],
          origin: 'legacy-runtime',
          precedence: 100
        }),
        contentVersion: sourceVersion,
        tags: unique(array(lesson.conceptIds).concat(array(lesson.skillIds), ['universal-adapter', 'math', 'legacy-fallback']))
      },
      prerequisites: [],
      objectives: [{
        id: identifier(lesson.id + '-objective-1'),
        statement: String(lesson.sourceAnchors && lesson.sourceAnchors.targetOutcome || lesson.title),
        evidenceKinds: [
          'derivation',
          'mathematical-solution',
          'result-verification',
          'simulation-result',
          'oral-response',
          'retention-check'
        ],
        language: 'vi',
        skillRefs: unique(array(lesson.skillIds).concat(array(lesson.conceptIds))),
        rubricRefs: ['L6-B5#mathematics']
      }],
      blocks: lesson.slides.map(function projectSlide(slide, index) {
        return slideBlock(lesson, slide, index, sourceConfig, offline.offlineId);
      }),
      masteryEvidence: masteryEvidence(lesson.id),
      contextRefs: contextRefs(lesson.id, 'math.lesson.legacy.v1', specialist),
      offline: offline.value,
      provenance: {
        sourceRefs: [LEGACY_SOURCE_PATH + '#/' + sourceIndex],
        userEvidenceRefs: [],
        systemDerivedRefs: candidates.length
          ? [ADAPTER_ID, PREREQUISITE_GRAPH_PATH + '#' + lesson.id]
          : [ADAPTER_ID],
        aiInferenceRefs: []
      },
      extensions: {
        mathematics: {
          sourceNamespace: 'math.lesson.legacy.v1',
          sourceChapterId: lesson.chapterId,
          canonicalChapterAnchor: lesson.sourceAnchors && lesson.sourceAnchors.chapterId || null,
          sourceSlideCount: lesson.slides.length,
          specialist,
          fallbackPolicy: 'preserve-all-347-legacy-lessons',
          sourceSelection: {
            exactIdOnly: true,
            globalOverlayPromotion: false,
            overlayPrecedenceAppliesOnlyToExactId: true,
            legacyFallbackPreserved: true
          },
          formulaStepSimulation: {
            payloadMode: 'lossless-json-clone',
            formulaCapabilityRef: 'math-formula-typesetter',
            stepSolutionCapabilityRef: 'math-step-solution',
            simulationCapabilityRef: 'math-parameter-simulation'
          },
          externalBanks: externalBankStatus(config.banks),
          prerequisiteCandidates: {
            status: 'review-candidate-not-runtime-active',
            runtimeActive: false,
            assessmentBlocking: false,
            records: candidates
          },
          downstreamSupport: {
            masteryEffect: 'none-until-reviewed-objective-binding',
            records: support
          },
          masterReady: {
            claimed: false,
            evidenceState: 'missing',
            verifierRef: 'assets/data/lesson/master-ready-policy-v1.json#profiles/mathematics'
          },
          runtimeBoundary: {
            readOnlyAdapter: true,
            directFactoryRender: false,
            sourceMutation: false,
            learnerStateMutation: false,
            legacyRuntimeEntry: 'subjects/math/index.html'
          }
        }
      }
    };
  }

  function projectOverlayLesson(overlay, options) {
    if (!overlay || typeof overlay !== 'object' || Array.isArray(overlay)) {
      throw new TypeError('Math theory overlay must be an object.');
    }
    if (!overlay.lessonId || !overlay.chapterId || !overlay.title || !array(overlay.slides).length) {
      throw new TypeError('Math theory overlay requires lessonId, chapterId, title and slides.');
    }
    const config = options || {};
    const sourceIndex = Number.isInteger(config.sourceIndex) ? config.sourceIndex : 0;
    const offline = offlineContract(overlay.lessonId);
    const sourceConfig = {
      sourceIndex,
      sourcePath: OVERLAY_SOURCE_PATH,
      lessonId: overlay.lessonId,
      sourceVersion: RELEASE,
      origin: 'provided-source',
      precedence: 200,
      recordPointerPrefix: '/records'
    };
    const specialist = {
      theoryReader: 'math-rich-theory-reader',
      formulaTypesetter: 'math-formula-typesetter',
      stepSolution: 'math-step-solution',
      parameterSimulation: 'math-parameter-simulation',
      professorOral: 'math-professor-oral',
      embeddedRoleCount: overlay.slides.length,
      externalBanksStatus: 'planned-empty'
    };
    return {
      metadata: {
        contractVersion: CONTRACT_VERSION,
        lessonId: overlay.lessonId,
        subjectId: 'math',
        lessonType: 'mathematics',
        titles: { primary: overlay.title, vi: overlay.title },
        stageId: String(overlay.sourceAnchors && overlay.sourceAnchors.stageId || overlay.roadmapRole || 'vn'),
        estimatedMinutes: Math.max(45, overlay.slides.length * 5),
        difficulty: 'reviewed-overlay',
        programIdentity: PROGRAM_IDENTITY,
        sourceIdentity: sourceIdentity({
          artifactId: overlay.lessonId,
          artifactKind: 'lecture-record',
          sourceVersion: RELEASE,
          sourcePath: OVERLAY_SOURCE_PATH,
          lessonId: overlay.lessonId,
          sourceAnchors: ['/records/' + sourceIndex],
          origin: 'provided-source',
          precedence: 200
        }),
        contentVersion: RELEASE,
        tags: unique(array(overlay.tags).concat(['universal-adapter', 'math', 'reviewed-overlay']))
      },
      prerequisites: [],
      objectives: [{
        id: identifier(overlay.lessonId + '-objective-1'),
        statement: String(overlay.baumanFocus || overlay.title),
        evidenceKinds: [
          'derivation',
          'mathematical-solution',
          'result-verification',
          'simulation-result',
          'oral-response',
          'retention-check'
        ],
        language: 'vi',
        skillRefs: unique(array(overlay.tags)),
        rubricRefs: ['L6-B5#mathematics']
      }],
      blocks: overlay.slides.map(function projectSlide(slide, index) {
        return slideBlock(overlay, slide, index, sourceConfig, offline.offlineId);
      }),
      masteryEvidence: masteryEvidence(overlay.lessonId),
      contextRefs: contextRefs(overlay.lessonId, 'math.lesson.overlay.v1', specialist),
      offline: offline.value,
      provenance: {
        sourceRefs: [OVERLAY_SOURCE_PATH + '#/records/' + sourceIndex],
        userEvidenceRefs: [],
        systemDerivedRefs: [ADAPTER_ID],
        aiInferenceRefs: []
      },
      extensions: {
        mathematics: {
          sourceNamespace: 'math.lesson.overlay.v1',
          canonicalChapterId: overlay.chapterId,
          programLectureIds: unique(array(overlay.programLectureIds).concat(overlay.programLectureId || [])),
          sourceSlideCount: overlay.slides.length,
          specialist,
          precedencePolicy: 'reviewed-overlay-before-explicit-legacy-fallback',
          sourceSelection: {
            exactIdOnly: true,
            globalOverlayPromotion: false,
            overlayPrecedenceAppliesOnlyToExactId: true,
            legacyFallbackPreserved: true
          },
          formulaStepSimulation: {
            payloadMode: 'lossless-json-clone',
            formulaCapabilityRef: 'math-formula-typesetter',
            stepSolutionCapabilityRef: 'math-step-solution',
            simulationCapabilityRef: 'math-parameter-simulation'
          },
          externalBanks: externalBankStatus(config.banks),
          prerequisiteCandidates: {
            status: 'unavailable-no-reviewed-equivalence',
            runtimeActive: false,
            assessmentBlocking: false,
            records: []
          },
          downstreamSupport: {
            masteryEffect: 'none-until-reviewed-objective-binding',
            records: []
          },
          masterReady: {
            claimed: false,
            evidenceState: 'missing',
            verifierRef: 'assets/data/lesson/master-ready-policy-v1.json#profiles/mathematics'
          },
          runtimeBoundary: {
            readOnlyAdapter: true,
            directFactoryRender: false,
            sourceMutation: false,
            learnerStateMutation: false,
            legacyRuntimeEntry: 'subjects/math/index.html'
          }
        }
      }
    };
  }

  function projectLegacyLessons(lessons, prerequisiteGraph, banks) {
    return array(lessons).map(function project(lesson, index) {
      return projectLegacyLesson(lesson, { sourceIndex: index, prerequisiteGraph, banks });
    });
  }

  function projectOverlayLessons(overlays, banks) {
    return array(overlays).map(function project(overlay, index) {
      return projectOverlayLesson(overlay, { sourceIndex: index, banks });
    });
  }

  function overlayRecords(value) {
    if (Array.isArray(value)) return value;
    return array(value && value.records);
  }

  function assertUniqueIds(records, getter, label) {
    const ids = records.map(getter);
    if (ids.some(function empty(id) { return !id; }) || new Set(ids).size !== ids.length) {
      throw new TypeError(label + ' requires non-empty unique lesson ids.');
    }
  }

  function resolveSource(lessonId, sources) {
    const id = String(lessonId || '');
    const legacyLessons = array(sources && sources.legacyLessons);
    const overlays = overlayRecords(sources && (sources.theoryOverlay || sources.theoryOverlays));
    const overlayMatches = overlays.map(function indexed(record, sourceIndex) {
      return { record, sourceIndex };
    }).filter(function exact(entry) { return entry.record && entry.record.lessonId === id; });
    const legacyMatches = legacyLessons.map(function indexed(record, sourceIndex) {
      return { record, sourceIndex };
    }).filter(function exact(entry) {
      return entry.record && (entry.record.id === id || entry.record.lessonId === id);
    });
    if (overlayMatches.length > 1 || legacyMatches.length > 1) {
      throw new TypeError('Math source resolution found duplicate exact ids.');
    }
    if (overlayMatches.length === 1) {
      return {
        status: 'FOUND',
        sourceFamily: 'reviewed-theory-overlay',
        sourceIndex: overlayMatches[0].sourceIndex,
        record: overlayMatches[0].record,
        exactId: true,
        shadowedLegacyExactMatch: legacyMatches.length === 1
      };
    }
    if (legacyMatches.length === 1) {
      return {
        status: 'FOUND',
        sourceFamily: 'legacy-lessons',
        sourceIndex: legacyMatches[0].sourceIndex,
        record: legacyMatches[0].record,
        exactId: true,
        shadowedLegacyExactMatch: false
      };
    }
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_EXACT_SOURCE_MATCH',
      exactId: false,
      fuzzyMatchingAttempted: false
    };
  }

  function projectResolvedLesson(lessonId, sources) {
    const resolved = resolveSource(lessonId, sources);
    if (resolved.status !== 'FOUND') return resolved;
    if (resolved.sourceFamily === 'reviewed-theory-overlay') {
      return {
        status: 'PROJECTED',
        sourceFamily: resolved.sourceFamily,
        lesson: projectOverlayLesson(resolved.record, {
          sourceIndex: resolved.sourceIndex,
          banks: sources && sources.banks
        })
      };
    }
    return {
      status: 'PROJECTED',
      sourceFamily: resolved.sourceFamily,
      lesson: projectLegacyLesson(resolved.record, {
        sourceIndex: resolved.sourceIndex,
        prerequisiteGraph: sources && sources.prerequisiteGraph,
        banks: sources && sources.banks
      })
    };
  }

  function projectCatalog(sources) {
    const config = sources || {};
    const legacyLessons = array(config.legacyLessons);
    const overlays = overlayRecords(config.theoryOverlay || config.theoryOverlays);
    const nodes = array(config.prerequisiteGraph && config.prerequisiteGraph.nodes);
    const nodeByLesson = new Map(nodes.map(function indexNode(node) { return [node.lessonId, node]; }));
    assertUniqueIds(legacyLessons, function legacyId(lesson) { return lesson && (lesson.id || lesson.lessonId); }, 'Math legacy source');
    assertUniqueIds(overlays, function overlayId(record) { return record && record.lessonId; }, 'Math overlay source');
    return {
      legacy: legacyLessons.map(function project(lesson, sourceIndex) {
        return projectLegacyLesson(lesson, {
          sourceIndex,
          prerequisiteNode: nodeByLesson.get(lesson.id || lesson.lessonId) || null,
          banks: config.banks
        });
      }),
      overlays: overlays.map(function project(overlay, sourceIndex) {
        return projectOverlayLesson(overlay, { sourceIndex, banks: config.banks });
      })
    };
  }

  function projectAll(sources) {
    const config = sources || {};
    const catalog = projectCatalog(config);
    const legacy = catalog.legacy;
    const overlays = catalog.overlays;
    return {
      legacy,
      overlays,
      all: overlays.concat(legacy),
      resolution: {
        sourceOrder: ['math.lesson.overlay.v1', 'math.lesson.legacy.v1'],
        overlayCount: overlays.length,
        legacyFallbackCount: legacy.length,
        sourceMutation: false,
        learnerStateMutation: false
      }
    };
  }

  global.BaumanMathUniversalAdapter = Object.freeze({
    release: RELEASE,
    adapterId: ADAPTER_ID,
    contractVersion: CONTRACT_VERSION,
    projectLegacyLesson,
    projectOverlayLesson,
    projectLegacyLessons,
    projectOverlayLessons,
    resolveSource,
    projectResolvedLesson,
    projectCatalog,
    projectAll
  });
})(typeof window !== 'undefined' ? window : globalThis);
