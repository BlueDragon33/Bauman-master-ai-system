(function (global) {
  'use strict';

  const validator = global.BaumanUniversalLessonValidator;
  if (!validator) throw new Error('BaumanUniversalLessonMigrator requires BaumanUniversalLessonValidator');

  const RELEASE = 'L6-B8-LESSON-VERSION-MIGRATOR-V1';
  const TARGET_VERSION = '2.0.0';
  const SOURCE_FAMILIES = Object.freeze([
    'canonical-v2',
    'universal-v1',
    'elearning-v1.1',
    'russian-rich-v13',
    'math-rich-legacy'
  ]);
  const ADAPTER_ONLY_FAMILIES = new Set(['russian-rich-v13', 'math-rich-legacy']);
  const MIGRATABLE_VERSIONS = Object.freeze({
    'universal-v1': '1.0.0',
    'elearning-v1.1': 'elearning-v1.1'
  });
  const REQUIRED_CONTEXT_FIELDS = Object.freeze([
    'subjectId',
    'lessonId',
    'lessonType',
    'stageId',
    'sourcePath',
    'sourceArtifactId',
    'sourceVersion',
    'adapterId',
    'contentVersion'
  ]);
  const BLOCK_KIND_ALIASES = Object.freeze({
    hook: 'orientation',
    'why-it-matters': 'orientation',
    'prerequisite-map': 'concept-map',
    concept: 'theory',
    explanation: 'theory',
    example: 'worked-example',
    practice: 'exercise',
    'graded-practice': 'exercise',
    lab: 'lab-simulation',
    simulation: 'lab-simulation',
    interactive: 'lab-simulation',
    'common-mistakes': 'misconception',
    'error-intercept': 'misconception',
    'correct-wrong': 'visual-check',
    'step-state': 'visual-check',
    'oral-defense': 'oral',
    speaking: 'oral',
    retrieval: 'review',
    'spaced-review': 'review',
    test: 'assessment',
    exam: 'assessment',
    'mastery-gate': 'mastery',
    project: 'project-nir-evidence',
    'nir-evidence': 'project-nir-evidence',
    'vkr-evidence': 'project-nir-evidence'
  });
  const BLOCK_KINDS = new Set([
    'orientation',
    'concept-map',
    'theory',
    'worked-example',
    'exercise',
    'lab-simulation',
    'misconception',
    'visual-check',
    'oral',
    'review',
    'assessment',
    'mastery',
    'project-nir-evidence'
  ]);

  function isObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function clone(value, fallback) {
    try {
      if (value === undefined) return fallback;
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      return fallback;
    }
  }

  function stableId(prefix, value) {
    return String(prefix || 'record') + '_' + validator.hash32(value);
  }

  function sourceVersionOf(source) {
    if (!isObject(source)) return null;
    return source.metadata?.contractVersion
      || source.contractVersion
      || source.schemaVersion
      || source.lessonContractVersion
      || source.eLearning?.lessonContractVersion
      || null;
  }

  function inspectSource(source, context) {
    const ctx = isObject(context) ? context : {};
    if (isObject(source?.metadata) && source.metadata.contractVersion === TARGET_VERSION) {
      return { family: 'canonical-v2', version: TARGET_VERSION, confidence: 'exact' };
    }
    if (source?.contractVersion === '1.0.0' || source?.schemaVersion === '1.0.0') {
      return { family: 'universal-v1', version: '1.0.0', confidence: 'signature' };
    }
    if (source?.lessonContractVersion === 'elearning-v1.1'
      || source?.eLearning?.lessonContractVersion === 'elearning-v1.1') {
      return { family: 'elearning-v1.1', version: 'elearning-v1.1', confidence: 'exact' };
    }
    if (ctx.subjectId === 'russian'
      || (source?.ruTitle && Array.isArray(source?.slides))) {
      return { family: 'russian-rich-v13', version: sourceVersionOf(source) || 'legacy-rich', confidence: 'candidate' };
    }
    if (ctx.subjectId === 'math'
      || Array.isArray(source?.theoryBlocks)
      || Array.isArray(source?.formulaIds)) {
      return { family: 'math-rich-legacy', version: sourceVersionOf(source) || 'legacy-rich', confidence: 'candidate' };
    }
    return { family: 'unknown', version: sourceVersionOf(source), confidence: 'none' };
  }

  function blocked(code, message, source, sourceFamily, details) {
    const snapshot = clone(source, null);
    return {
      ok: false,
      blocked: true,
      code,
      message,
      mode: 'dry-run',
      sourceFamily: sourceFamily || null,
      sourceVersion: sourceVersionOf(source),
      targetVersion: TARGET_VERSION,
      digestAlgorithm: 'sha256-stable-json-v1',
      inputDigest: snapshot === null ? null : validator.hash256(snapshot),
      outputDigest: null,
      sourceUnchanged: true,
      manualReviewRequired: true,
      warnings: [],
      losses: [],
      details: details || null,
      validation: null,
      sourceSnapshot: snapshot,
      output: null
    };
  }

  function requiredContextErrors(context) {
    const ctx = isObject(context) ? context : {};
    return REQUIRED_CONTEXT_FIELDS.filter(function (field) {
      return typeof ctx[field] !== 'string' || !ctx[field].trim();
    });
  }

  function programIdentity() {
    return {
      department: 'ИУ-5',
      officialPublishedDirectionCode: '09.04.01',
      personalizedDisplayCode: '09.04.01/11'
    };
  }

  function sourceBinding(context) {
    return {
      sourceArtifactId: context.sourceArtifactId,
      sourceArtifactKind: context.sourceArtifactKind || 'lesson-record',
      sourceVersion: context.sourceVersion,
      locator: {
        sourcePath: context.sourcePath,
        recordId: context.recordId || context.lessonId,
        lessonId: context.lessonId,
        sourceAnchors: Array.isArray(context.sourceAnchors) ? clone(context.sourceAnchors, []) : []
      },
      origin: context.sourceOrigin || 'provided-source',
      adapterId: context.adapterId,
      precedence: Number.isInteger(context.precedence) && context.precedence >= 0
        ? context.precedence
        : 0
    };
  }

  function contextReferences(context) {
    const lessonId = context.lessonId;
    const subjectId = context.subjectId;
    return {
      currentLesson: 'lesson:' + lessonId,
      prerequisiteGraph: 'prerequisite-graph:' + lessonId,
      learnerProgress: 'personal-learning:progress:' + subjectId,
      assessmentErrors: 'personal-learning:assessment-errors:' + lessonId,
      weakTopics: 'personal-learning:weak-topics:' + subjectId,
      schedule: 'personal-learning:schedule',
      currentSubject: 'subject:' + subjectId,
      languageState: 'personal-learning:language-state',
      nirVkrContext: 'personal-learning:nir-vkr-context',
      offlineAvailability: 'offline-availability:' + subjectId
    };
  }

  function offlineContract() {
    return {
      policyId: 'lesson-core-offline',
      resources: [
        {
          id: 'lesson-core',
          availability: 'bundled',
          bytesPolicy: 'metadata-and-small-content',
          freshnessPolicy: 'content-version-authoritative',
          rollbackRef: 'source-snapshot'
        }
      ],
      deterministicFallbackRef: 'lesson-core'
    };
  }

  function provenance(context) {
    return {
      sourceRefs: [context.sourceArtifactId],
      userEvidenceRefs: [],
      systemDerivedRefs: [],
      aiInferenceRefs: []
    };
  }

  function evidenceKinds(context) {
    const registered = validator.typeEvidenceOutputs[context.lessonType] || [];
    const requested = Array.isArray(context.objectiveEvidenceKinds)
      ? context.objectiveEvidenceKinds.filter(function (value) { return registered.includes(value); })
      : [];
    return requested.length ? requested : registered.slice(0, 1);
  }

  function normalizePrerequisites(values, context) {
    return (Array.isArray(values) ? values : []).map(function (value, index) {
      if (isObject(value)) {
        return {
          id: value.id || stableId('prerequisite', [context.lessonId, index, value]),
          relation: ['requires', 'recommended', 'diagnostic', 'co-requisite'].includes(value.relation)
            ? value.relation
            : 'recommended',
          targetRef: String(value.targetRef || value.lessonId || value.title || value.id || 'legacy:' + index),
          requiredState: ['introduced', 'practised', 'assessment-pass', 'master-ready'].includes(value.requiredState)
            ? value.requiredState
            : 'introduced',
          legacy: clone(value, {})
        };
      }
      return {
        id: stableId('prerequisite', [context.lessonId, index, value]),
        relation: 'recommended',
        targetRef: 'legacy-prerequisite:' + stableId('ref', value),
        requiredState: 'introduced',
        legacyStatement: String(value || '')
      };
    });
  }

  function normalizeObjectives(values, context) {
    const kinds = evidenceKinds(context);
    return (Array.isArray(values) ? values : []).map(function (value, index) {
      const source = isObject(value) ? value : { statement: value };
      const registered = validator.typeEvidenceOutputs[context.lessonType] || [];
      const requested = Array.isArray(source.evidenceKinds)
        ? source.evidenceKinds.filter(function (kind) { return registered.includes(kind); })
        : [];
      return {
        id: source.id || stableId('objective', [context.lessonId, index, source.statement || value]),
        statement: String(source.statement || source.text || source.title || value || ''),
        evidenceKinds: requested.length ? requested : kinds,
        language: ['vi', 'ru', 'en'].includes(source.language) ? source.language : undefined,
        legacy: isObject(value) ? clone(value, {}) : undefined
      };
    }).map(function (objective) {
      Object.keys(objective).forEach(function (key) {
        if (objective[key] === undefined) delete objective[key];
      });
      return objective;
    });
  }

  function normalizeBlockKind(rawKind) {
    const value = String(rawKind || '').trim();
    if (BLOCK_KINDS.has(value)) return value;
    return BLOCK_KIND_ALIASES[value] || null;
  }

  function makeBlock(context, source, index, rawKind, rawPayload, evidenceRefs, specialistCapabilityRef) {
    const kind = normalizeBlockKind(rawKind);
    if (!kind) return { error: 'Unsupported block kind: ' + String(rawKind || '') };
    return {
      value: {
        id: source.id || stableId('block', [context.lessonId, index, kind, rawPayload]),
        kind,
        sourceBindings: [sourceBinding(context)],
        payload: isObject(rawPayload) ? clone(rawPayload, {}) : { value: clone(rawPayload, rawPayload) },
        presentationHint: isObject(source.presentationHint)
          ? clone(source.presentationHint, {})
          : { preferredStrategy: 'inline-flow' },
        evidenceRefs: Array.isArray(evidenceRefs) ? clone(evidenceRefs, []) : [],
        offlineRef: 'lesson-core',
        specialistCapabilityRef: typeof specialistCapabilityRef === 'string'
          ? specialistCapabilityRef
          : null,
        legacySource: clone(source, {})
      }
    };
  }

  function normalizeUniversalV1Blocks(source, context) {
    const values = Array.isArray(source.blocks)
      ? source.blocks
      : Array.isArray(source.sections) ? source.sections : [];
    const blocks = [];
    const errors = [];
    values.forEach(function (item, index) {
      const blockSource = isObject(item) ? item : { payload: item };
      const rawKind = blockSource.kind || blockSource.type || blockSource.sectionType;
      const payload = isObject(blockSource.payload)
        ? blockSource.payload
        : isObject(blockSource.content) ? blockSource.content : clone(blockSource, {});
      const result = makeBlock(
        context,
        blockSource,
        index,
        rawKind,
        payload,
        blockSource.evidenceRefs,
        blockSource.specialistCapabilityRef
      );
      if (result.error) errors.push({ index, message: result.error });
      else blocks.push(result.value);
    });
    return { blocks, errors };
  }

  function addElearningBlock(target, context, index, kind, legacyField, value, evidenceRefs, specialistCapabilityRef) {
    if (value === undefined || value === null || value === ''
      || (Array.isArray(value) && value.length === 0)) return;
    const payload = {
      legacyField,
      value: clone(value, value)
    };
    const result = makeBlock(
      context,
      { id: stableId('block', [context.lessonId, legacyField]) },
      index,
      kind,
      payload,
      evidenceRefs,
      specialistCapabilityRef
    );
    if (!result.error) target.push(result.value);
  }

  function normalizeElearningBlocks(wrapper, context) {
    const source = isObject(wrapper.eLearning) ? wrapper.eLearning : wrapper;
    const blocks = [];
    const objectiveRefs = normalizeObjectives(source.objectives, context).map(function (item) { return item.id; });
    addElearningBlock(blocks, context, blocks.length, 'orientation', 'whyItMatters', source.whyItMatters, objectiveRefs);
    const theoryPayload = {};
    if (source.coreTheory !== undefined) theoryPayload.coreTheory = clone(source.coreTheory, source.coreTheory);
    if (source.coreFormulas !== undefined) theoryPayload.coreFormulas = clone(source.coreFormulas, source.coreFormulas);
    if (Object.keys(theoryPayload).length) {
      addElearningBlock(blocks, context, blocks.length, 'theory', 'coreTheory+coreFormulas', theoryPayload, objectiveRefs);
    }
    addElearningBlock(blocks, context, blocks.length, 'worked-example', 'workedExample', source.workedExample, objectiveRefs);
    addElearningBlock(blocks, context, blocks.length, 'exercise', 'guidedPractice', source.guidedPractice, objectiveRefs);
    addElearningBlock(blocks, context, blocks.length, 'lab-simulation', 'simulationLink', source.simulationLink, objectiveRefs);
    addElearningBlock(blocks, context, blocks.length, 'misconception', 'commonMistakes', source.commonMistakes, objectiveRefs);
    addElearningBlock(blocks, context, blocks.length, 'review', 'checkpointQuestions', source.checkpointQuestions, objectiveRefs);
    const masteryPayload = {};
    if (Array.isArray(source.masteryCriteria) && source.masteryCriteria.length) {
      masteryPayload.masteryCriteria = clone(source.masteryCriteria, []);
    }
    if (Array.isArray(source.rubric) && source.rubric.length) {
      masteryPayload.rubric = clone(source.rubric, []);
    }
    if (Object.keys(masteryPayload).length) {
      addElearningBlock(
        blocks,
        context,
        blocks.length,
        'mastery',
        'masteryCriteria+rubric',
        masteryPayload,
        objectiveRefs
      );
    }
    addElearningBlock(blocks, context, blocks.length, 'project-nir-evidence', 'baumanConnection', source.baumanConnection, objectiveRefs);
    return blocks;
  }

  function baseLesson(context, titles, prerequisites, objectives, blocks, migrationExtension) {
    return {
      metadata: {
        contractVersion: TARGET_VERSION,
        lessonId: context.lessonId,
        subjectId: context.subjectId,
        lessonType: context.lessonType,
        titles,
        stageId: context.stageId,
        estimatedMinutes: Number.isInteger(context.estimatedMinutes) && context.estimatedMinutes > 0
          ? context.estimatedMinutes
          : undefined,
        difficulty: typeof context.difficulty === 'string' ? context.difficulty : undefined,
        programIdentity: programIdentity(),
        sourceIdentity: sourceBinding(context),
        contentVersion: context.contentVersion,
        tags: Array.isArray(context.tags) ? clone(context.tags, []) : []
      },
      prerequisites,
      objectives,
      blocks,
      masteryEvidence: [],
      contextRefs: contextReferences(context),
      offline: offlineContract(),
      provenance: provenance(context),
      extensions: {
        migration: migrationExtension
      }
    };
  }

  function cleanUndefined(value) {
    if (Array.isArray(value)) return value.map(cleanUndefined);
    if (!isObject(value)) return value;
    Object.keys(value).forEach(function (key) {
      if (value[key] === undefined) delete value[key];
      else value[key] = cleanUndefined(value[key]);
    });
    return value;
  }

  function migrateUniversalV1(source, context) {
    const blockResult = normalizeUniversalV1Blocks(source, context);
    if (blockResult.errors.length) {
      return { errors: blockResult.errors, output: null, warnings: [], manualReviewRequired: true };
    }
    const titles = isObject(source.titles)
      ? clone(source.titles, {})
      : { primary: String(source.title || context.title || context.lessonId) };
    if (!titles.primary) titles.primary = String(source.title || context.title || context.lessonId);
    const objectives = normalizeObjectives(source.objectives, context);
    const warnings = [];
    if (!Array.isArray(context.objectiveEvidenceKinds) || !context.objectiveEvidenceKinds.length) {
      warnings.push('Objective evidence kinds were selected from the registered lesson-type defaults and require review.');
    }
    const mappedFields = new Set([
      'contractVersion', 'schemaVersion', 'title', 'titles', 'prerequisites',
      'objectives', 'blocks', 'sections', 'masteryEvidence'
    ]);
    const unmapped = {};
    Object.keys(source).sort().forEach(function (key) {
      if (!mappedFields.has(key)) unmapped[key] = clone(source[key], null);
    });
    const output = baseLesson(
      context,
      titles,
      normalizePrerequisites(source.prerequisites, context),
      objectives,
      blockResult.blocks,
      {
        strategyId: 'universal-v1-to-v2',
        sourceFamily: 'universal-v1',
        sourceVersion: sourceVersionOf(source) || '1.0.0',
        targetVersion: TARGET_VERSION,
        dryRunOnly: true,
        manualReviewRequired: true,
        mappedTopLevelFields: Array.from(mappedFields).filter(function (field) {
          return Object.prototype.hasOwnProperty.call(source, field);
        }),
        unmappedFields: unmapped
      }
    );
    if (Array.isArray(source.masteryEvidence)) output.masteryEvidence = clone(source.masteryEvidence, []);
    return { output: cleanUndefined(output), errors: [], warnings, manualReviewRequired: true };
  }

  function migrateElearning(source, context) {
    const payload = isObject(source.eLearning) ? source.eLearning : source;
    const title = source.title || payload.moduleTitle || context.title || context.lessonId;
    const titles = isObject(context.titles) ? clone(context.titles, {}) : { primary: String(title) };
    if (!titles.primary) titles.primary = String(title);
    const objectives = normalizeObjectives(payload.objectives, context);
    const warnings = [
      'eLearning-v1.1 projection is a dry-run compatibility migration; block and evidence mappings require subject review.'
    ];
    if (!Array.isArray(context.objectiveEvidenceKinds) || !context.objectiveEvidenceKinds.length) {
      warnings.push('Objective evidence kinds were selected from the registered lesson-type defaults and require review.');
    }
    const wrapperMapped = new Set(['title', 'eLearning']);
    const payloadMapped = new Set([
      'lessonContractVersion', 'stage', 'moduleTitle', 'estimatedMinutes', 'sourceBasis',
      'objectives', 'prerequisites', 'whyItMatters', 'coreTheory', 'coreFormulas',
      'workedExample', 'guidedPractice', 'simulationLink', 'commonMistakes',
      'checkpointQuestions', 'masteryCriteria', 'rubric', 'attachmentsAllowed',
      'baumanConnection', 'reviewIfWrong'
    ]);
    const wrapperUnmapped = {};
    if (payload !== source) {
      Object.keys(source).sort().forEach(function (key) {
        if (!wrapperMapped.has(key)) wrapperUnmapped[key] = clone(source[key], null);
      });
    }
    const payloadUnmapped = {};
    Object.keys(payload).sort().forEach(function (key) {
      if (!payloadMapped.has(key)) payloadUnmapped[key] = clone(payload[key], null);
    });
    const migratedContext = Object.assign({}, context, {
      estimatedMinutes: context.estimatedMinutes || Number(payload.estimatedMinutes) || undefined
    });
    const output = baseLesson(
      migratedContext,
      titles,
      normalizePrerequisites(payload.prerequisites, context),
      objectives,
      normalizeElearningBlocks(source, context),
      {
        strategyId: 'elearning-v1.1-to-v2',
        sourceFamily: 'elearning-v1.1',
        sourceVersion: payload.lessonContractVersion,
        targetVersion: TARGET_VERSION,
        dryRunOnly: true,
        manualReviewRequired: true,
        legacyMetadata: {
          stage: clone(payload.stage, null),
          moduleTitle: clone(payload.moduleTitle, null),
          estimatedMinutes: clone(payload.estimatedMinutes, null)
        },
        sourceBasis: payload.sourceBasis || null,
        reviewIfWrong: payload.reviewIfWrong || null,
        attachmentsAllowed: clone(payload.attachmentsAllowed, []),
        wrapperUnmappedFields: wrapperUnmapped,
        payloadUnmappedFields: payloadUnmapped
      }
    );
    return { output: cleanUndefined(output), errors: [], warnings, manualReviewRequired: true };
  }

  function buildResult(source, sourceFamily, context, strategyResult, schema) {
    const sourceSnapshot = clone(source, null);
    const inputDigest = sourceSnapshot === null ? null : validator.hash256(sourceSnapshot);
    const sourceDigestAfter = validator.hash256(source);
    if (strategyResult.errors.length) {
      return blocked(
        'MIGRATION_MAPPING_ERROR',
        'Source contains values that cannot be mapped safely.',
        source,
        sourceFamily,
        strategyResult.errors
      );
    }
    const validation = validator.validateLesson(strategyResult.output, schema);
    if (!validation.valid) {
      const result = blocked(
        'OUTPUT_SCHEMA_INVALID',
        'Migrated candidate does not satisfy Universal Lesson V2.',
        source,
        sourceFamily,
        validation.errors
      );
      result.validation = validation;
      return result;
    }
    const outputDigest = validator.hash256(strategyResult.output);
    const migrationId = stableId('migration', [
      sourceFamily,
      sourceVersionOf(source),
      TARGET_VERSION,
      inputDigest,
      validator.hash256(context),
      outputDigest
    ]);
    return {
      ok: true,
      blocked: false,
      code: 'DRY_RUN_CANDIDATE',
      message: 'A validated canonical candidate was produced without writing source or learner state.',
      mode: 'dry-run',
      strategyId: strategyResult.output.extensions?.migration?.strategyId || 'canonical-v2-validate-clone',
      migrationId,
      sourceFamily,
      sourceVersion: sourceVersionOf(source),
      targetVersion: TARGET_VERSION,
      digestAlgorithm: 'sha256-stable-json-v1',
      inputDigest,
      outputDigest,
      sourceUnchanged: inputDigest === sourceDigestAfter,
      manualReviewRequired: strategyResult.manualReviewRequired === true,
      warnings: strategyResult.warnings || [],
      losses: [],
      details: null,
      validation,
      sourceSnapshot,
      output: strategyResult.output
    };
  }

  function migrate(source, context, schema, inputOptions) {
    const options = isObject(inputOptions) ? inputOptions : {};
    const rawContext = isObject(context) ? context : {};
    const ctx = clone(rawContext, {});
    if (options.apply === true || options.commit === true || options.write === true) {
      return blocked(
        'B8_DRY_RUN_ONLY',
        'B8 migration is pure dry-run only; persistence and source cutover are not available.',
        source,
        options.sourceFamily || null
      );
    }
    if (!isObject(source)) {
      return blocked('INVALID_SOURCE', 'Migration source must be a JSON object.', source, null);
    }
    const sourceJsonInspection = validator.inspectJsonValue(source, validator.defaultLimits);
    if (sourceJsonInspection.errors.length) {
      return blocked(
        'INVALID_SOURCE_JSON',
        'Migration source must be finite, acyclic, credential-free plain JSON within the B8 limits.',
        source,
        null,
        sourceJsonInspection.errors
      );
    }
    const contextJsonInspection = validator.inspectJsonValue(rawContext, validator.defaultLimits);
    if (contextJsonInspection.errors.length) {
      return blocked(
        'INVALID_MIGRATION_CONTEXT',
        'Migration context must be finite, acyclic, credential-free plain JSON within the B8 limits.',
        source,
        options.sourceFamily || null,
        contextJsonInspection.errors
      );
    }
    const inspection = inspectSource(source, ctx);
    const explicitFamily = options.sourceFamily;
    if (inspection.family === 'canonical-v2' && (!explicitFamily || explicitFamily === 'canonical-v2')) {
      const output = clone(source, null);
      const validation = validator.validateLesson(output, schema);
      if (!validation.valid) {
        const result = blocked('CANONICAL_SCHEMA_INVALID', 'Canonical V2 source failed validation.', source, 'canonical-v2', validation.errors);
        result.validation = validation;
        return result;
      }
      return buildResult(source, 'canonical-v2', ctx, {
        output,
        errors: [],
        warnings: [],
        manualReviewRequired: false
      }, schema);
    }
    if (typeof explicitFamily !== 'string' || !explicitFamily) {
      return blocked(
        'SOURCE_FAMILY_REQUIRED',
        'Non-canonical migration requires an explicit sourceFamily; detected signatures are advisory only.',
        source,
        inspection.family,
        inspection
      );
    }
    if (!SOURCE_FAMILIES.includes(explicitFamily)) {
      return blocked('UNKNOWN_SOURCE_FAMILY', 'Unknown migration source family.', source, explicitFamily, SOURCE_FAMILIES);
    }
    if (explicitFamily === 'canonical-v2') {
      return blocked('SOURCE_FAMILY_MISMATCH', 'Source is not a canonical V2 lesson.', source, explicitFamily, inspection);
    }
    if (ADAPTER_ONLY_FAMILIES.has(explicitFamily)) {
      return blocked(
        'ADAPTER_REQUIRED',
        'Russian and Mathematics rich sources require a read-only adapter projection and cannot be directly migrated in B8.',
        source,
        explicitFamily,
        { rollback: 'route-to-unchanged-subject-engine', detected: inspection }
      );
    }
    const expectedVersion = MIGRATABLE_VERSIONS[explicitFamily];
    if (inspection.family !== explicitFamily || inspection.version !== expectedVersion) {
      return blocked(
        'SOURCE_FAMILY_VERSION_MISMATCH',
        'Source signature and version do not match the explicit migration family.',
        source,
        explicitFamily,
        { detected: inspection, expectedVersion }
      );
    }
    const missingContext = requiredContextErrors(ctx);
    if (missingContext.length) {
      return blocked(
        'MIGRATION_CONTEXT_REQUIRED',
        'Projection context is incomplete.',
        source,
        explicitFamily,
        { missingFields: missingContext }
      );
    }
    if (!validator.typeEvidenceOutputs[ctx.lessonType]) {
      return blocked('UNKNOWN_LESSON_TYPE', 'Projection context lessonType is not registered.', source, explicitFamily, ctx.lessonType);
    }
    if (ctx.sourceVersion !== expectedVersion) {
      return blocked(
        'CONTEXT_SOURCE_VERSION_MISMATCH',
        'Projection context sourceVersion must match the registered source version.',
        source,
        explicitFamily,
        { actual: ctx.sourceVersion, expected: expectedVersion }
      );
    }
    let strategyResult = null;
    if (explicitFamily === 'universal-v1') strategyResult = migrateUniversalV1(source, ctx);
    if (explicitFamily === 'elearning-v1.1') strategyResult = migrateElearning(source, ctx);
    if (!strategyResult) {
      return blocked('NO_MIGRATION_PATH', 'No deterministic migration path is registered.', source, explicitFamily);
    }
    return buildResult(source, explicitFamily, ctx, strategyResult, schema);
  }

  function rollback(result) {
    if (!isObject(result) || !Object.prototype.hasOwnProperty.call(result, 'sourceSnapshot')) {
      return { ok: false, code: 'INVALID_MIGRATION_RESULT', source: null };
    }
    const source = clone(result.sourceSnapshot, null);
    if (source === null
      || result.digestAlgorithm !== 'sha256-stable-json-v1'
      || validator.hash256(source) !== result.inputDigest) {
      return { ok: false, code: 'SOURCE_SNAPSHOT_INTEGRITY_FAILED', source: null };
    }
    return {
      ok: true,
      code: 'SOURCE_SNAPSHOT_RESTORED',
      source,
      digest: result.inputDigest
    };
  }

  global.BaumanUniversalLessonMigrator = Object.freeze({
    release: RELEASE,
    targetVersion: TARGET_VERSION,
    sourceFamilies: SOURCE_FAMILIES,
    adapterOnlyFamilies: Object.freeze(Array.from(ADAPTER_ONLY_FAMILIES)),
    migratableVersions: MIGRATABLE_VERSIONS,
    requiredContextFields: REQUIRED_CONTEXT_FIELDS,
    inspectSource,
    migrate,
    rollback
  });
})(typeof window !== 'undefined' ? window : globalThis);
