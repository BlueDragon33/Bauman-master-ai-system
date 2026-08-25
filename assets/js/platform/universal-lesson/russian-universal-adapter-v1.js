(function (global) {
  'use strict';

  const RELEASE = 'L7-B2-RUSSIAN-UNIVERSAL-ADAPTER-V1';
  const CONTRACT_VERSION = '2.0.0';
  const ADAPTER_ID = 'russian-universal-adapter-v1';
  const SOURCE_PATH = 'subjects/russian/data/lessons.json';
  const PROGRAM_IDENTITY = Object.freeze({
    department: 'ИУ-5',
    officialPublishedDirectionCode: '09.04.01',
    personalizedDisplayCode: '09.04.01/11'
  });
  const SLIDE_KIND = Object.freeze({
    opening: 'orientation',
    story: 'orientation',
    theory: 'theory',
    explanation: 'theory',
    example: 'worked-example',
    contrast: 'visual-check',
    cohesion: 'concept-map',
    mistake: 'misconception',
    exercise: 'exercise',
    application: 'project-nir-evidence',
    rubric: 'mastery',
    quiz: 'assessment',
    summary: 'review',
    routine: 'review',
    dialogue: 'oral',
    speaking: 'oral',
    simulation: 'lab-simulation'
  });

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

  function sourceIdentity(lessonId, sourcePath, sourceAnchors, kind, artifactId, precedence) {
    return {
      sourceArtifactId: identifier(artifactId || lessonId),
      sourceArtifactKind: kind || 'lesson-record',
      sourceVersion: RELEASE,
      locator: {
        sourcePath,
        lessonId,
        sourceAnchors: array(sourceAnchors)
      },
      origin: 'provided-source',
      adapterId: ADAPTER_ID,
      precedence: Number.isInteger(precedence) ? precedence : 100
    };
  }

  function slideKind(slide) {
    const type = String(slide && slide.type || '').toLowerCase();
    if (SLIDE_KIND[type]) return SLIDE_KIND[type];
    if (array(slide && slide.tasks).length) return 'exercise';
    return 'theory';
  }

  function evidenceKinds(kind) {
    if (kind === 'oral') return ['oral-response', 'shadowing-attempt'];
    if (kind === 'assessment') return ['comprehension-response'];
    if (kind === 'exercise' || kind === 'project-nir-evidence') return ['written-response'];
    if (kind === 'review' || kind === 'mastery') return ['retention-check'];
    return ['comprehension-response'];
  }

  function slideBlock(lesson, slide, index, sourceIndex, offlineId) {
    const kind = slideKind(slide);
    return {
      id: identifier(lesson.id + '-slide-' + String(index + 1).padStart(2, '0')),
      kind,
      sourceBindings: [sourceIdentity(
        lesson.id,
        SOURCE_PATH,
        ['/' + sourceIndex + '/slides/' + index],
        'slide-deck',
        lesson.id + '-slide-' + (index + 1),
        90
      )],
      payload: {
        title: String(slide && slide.title || lesson.title || lesson.id),
        sourceSlideType: String(slide && slide.type || 'unspecified'),
        blocks: array(slide && slide.blocks),
        tasks: array(slide && slide.tasks)
      },
      presentationHint: {
        strategy: 'preserve-source-order',
        sourceIndex: index
      },
      evidenceRefs: evidenceKinds(kind),
      offlineRef: offlineId,
      specialistCapabilityRef: kind === 'oral' ? 'russian-speech-engine' : null
    };
  }

  function refsForLesson(items, lesson) {
    return array(items).filter(function (item) {
      return item && (item.lessonId === lesson.id || item.lessonBinding === lesson.id || item.stage === lesson.stage);
    }).map(function (item) { return item.id; }).filter(Boolean);
  }

  function specialistRefs(lesson, sources) {
    const db = sources || {};
    return {
      dialogueRefs: refsForLesson(db.dialogues, lesson),
      deepSpeakingRefs: refsForLesson(db.deepSpeaking, lesson),
      speakingRefs: refsForLesson(db.speaking, lesson),
      handwritingRefs: refsForLesson(db.handwriting, lesson),
      writingRefs: refsForLesson(db.writing, lesson),
      assessmentRefs: refsForLesson(db.tests, lesson),
      simulationRefs: refsForLesson(db.simulations, lesson),
      speakingLinkIndexRef: 'subjects/russian/data/speaking-link-index.json'
    };
  }

  function projectLesson(lesson, options) {
    if (!lesson || typeof lesson !== 'object' || Array.isArray(lesson)) {
      throw new TypeError('Russian lesson must be an object.');
    }
    if (!lesson.id || !lesson.stage || !lesson.title || !array(lesson.slides).length) {
      throw new TypeError('Russian lesson requires stable id, stage, title and slides.');
    }
    const config = options || {};
    const sourceIndex = Number.isInteger(config.sourceIndex) ? config.sourceIndex : 0;
    const previousLessonId = config.previousLessonId || null;
    const offlineId = identifier(lesson.id + '-russian-pack');
    const specialist = specialistRefs(lesson, config.sources);
    const blocks = lesson.slides.map(function (slide, index) {
      return slideBlock(lesson, slide, index, sourceIndex, offlineId);
    });
    const firstOpening = lesson.slides.find(function (slide) { return slide && slide.type === 'opening'; });
    const outputBlock = array(firstOpening && firstOpening.blocks).find(function (block) {
      return block && /chuẩn đầu ra/i.test(String(block.heading || ''));
    });
    const objective = String(outputBlock && outputBlock.text || lesson.summary || lesson.title);

    return {
      metadata: {
        contractVersion: CONTRACT_VERSION,
        lessonId: lesson.id,
        subjectId: 'russian',
        lessonType: 'language',
        titles: { primary: lesson.title, vi: lesson.title, ru: String(lesson.ruTitle || '') },
        stageId: lesson.stage,
        estimatedMinutes: Math.max(30, lesson.slides.length * 3),
        difficulty: lesson.stage,
        programIdentity: PROGRAM_IDENTITY,
        sourceIdentity: sourceIdentity(
          lesson.id,
          SOURCE_PATH,
          ['/' + sourceIndex],
          'lesson-record',
          lesson.id,
          100
        ),
        contentVersion: String(lesson.method || RELEASE),
        tags: Array.from(new Set(array(lesson.tags).concat(['universal-adapter', 'russian'])))
      },
      prerequisites: previousLessonId ? [{
        id: identifier(lesson.id + '-previous'),
        relation: 'recommended',
        targetRef: previousLessonId,
        requiredState: 'practised'
      }] : [],
      objectives: [{
        id: identifier(lesson.id + '-objective-1'),
        statement: objective,
        evidenceKinds: ['comprehension-response', 'oral-response', 'written-response'],
        language: 'vi',
        skillRefs: ['reading', 'listening', 'speaking', 'writing']
      }],
      blocks,
      masteryEvidence: [
        ['understand', 'comprehension-response'],
        ['solve', 'written-response'],
        ['explain', 'oral-response'],
        ['retain', 'retention-check']
      ].map(function (entry, index) {
        return {
          id: identifier(lesson.id + '-evidence-' + (index + 1)),
          stage: entry[0],
          evidenceKind: entry[1],
          status: 'missing',
          artifactRefs: []
        };
      }),
      contextRefs: {
        currentLesson: lesson.id,
        prerequisiteGraph: previousLessonId,
        learnerProgress: 'learning-state:russian:' + lesson.id,
        assessmentErrors: 'assessment-errors:russian:' + lesson.id,
        weakTopics: 'weak-topics:russian',
        schedule: 'roadmap-v3:schedule',
        currentSubject: 'russian',
        languageState: 'language-state:russian',
        nirVkrContext: 'research-state:nir-vkr',
        specialist
      },
      offline: {
        policyId: 'russian-subject-pack-v1',
        resources: [{
          id: offlineId,
          availability: 'subject-pack',
          bytesPolicy: 'reuse-existing-russian-pack-assets',
          freshnessPolicy: 'content-version-and-integrity-check',
          rollbackRef: 'russian-legacy-runtime'
        }],
        deterministicFallbackRef: offlineId,
        legacyRuntimeEntry: 'subjects/russian/index.html'
      },
      provenance: {
        sourceRefs: [SOURCE_PATH + '#/' + sourceIndex],
        userEvidenceRefs: [],
        systemDerivedRefs: [ADAPTER_ID],
        aiInferenceRefs: []
      },
      extensions: {
        russian: {
          sourceSlideCount: lesson.slides.length,
          sourceMethod: lesson.method || null,
          specialistRefs: specialist
        }
      }
    };
  }

  function projectLessons(lessons, sources) {
    return array(lessons).map(function (lesson, index, all) {
      return projectLesson(lesson, {
        sourceIndex: index,
        previousLessonId: index > 0 ? all[index - 1].id : null,
        sources
      });
    });
  }

  global.BaumanRussianUniversalAdapter = Object.freeze({
    release: RELEASE,
    adapterId: ADAPTER_ID,
    contractVersion: CONTRACT_VERSION,
    projectLesson,
    projectLessons
  });
})(typeof window !== 'undefined' ? window : globalThis);
