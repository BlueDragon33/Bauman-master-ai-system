(function (global) {
  'use strict';

  const validator = global.BaumanUniversalLessonValidator;
  const migrator = global.BaumanUniversalLessonMigrator;
  const factory = global.BaumanSubjectFactoryRegistry;
  const renderer = global.BaumanUniversalLessonRenderer;
  if (!validator || !migrator || !factory || !renderer) {
    throw new Error('BaumanLegacyLessonBridge requires B8 validator/migrator, B9 Factory and B10 renderer');
  }

  const RELEASE = 'L6-B10-LEGACY-LESSON-BRIDGE-V1';
  const SPECIALIST_ENGINE_MODES = Object.freeze([
    'rich-legacy-specialist',
    'rich-specialist'
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

  function safeId(value) {
    return typeof value === 'string'
      && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)
      && !value.includes('..');
  }

  function blocked(code, message, details) {
    return {
      ok: false,
      blocked: true,
      code,
      message,
      details: details === undefined ? null : details
    };
  }

  function dependencyAudit(dependencies) {
    const deps = isObject(dependencies) ? dependencies : {};
    const errors = [];
    if (deps.rendererContract?.contractId !== 'bauman-universal-lesson-renderer-contract'
      || deps.rendererContract?.contractVersion !== '1.0.0') {
      errors.push({ code: 'INVALID_RENDERER_CONTRACT' });
    }
    if (deps.rendererContract?.runtimeBoundary?.runtimeWiringInB10 !== false
      || deps.rendererContract?.runtimeBoundary?.sourceMutationAllowed !== false
      || deps.rendererContract?.runtimeBoundary?.learnerStateWriteAllowed !== false) {
      errors.push({ code: 'B10_RUNTIME_BOUNDARY_BROKEN' });
    }
    if (deps.schema?.$id !== 'https://bauman-master-ai.local/schema/universal-lesson-v2.schema.json') {
      errors.push({ code: 'INVALID_LESSON_SCHEMA' });
    }
    if (deps.blockPolicy?.policyId !== 'bauman-universal-lesson-block-policy'
      || deps.blockPolicy?.policyVersion !== '1.0.0') {
      errors.push({ code: 'INVALID_BLOCK_POLICY' });
    }
    const registryValidation = factory.validateRegistry(deps.registry);
    if (!registryValidation.valid) {
      errors.push({ code: 'INVALID_SUBJECT_FACTORY', details: registryValidation.errors });
    }
    return {
      ok: errors.length === 0,
      code: errors.length ? 'DEPENDENCY_AUDIT_FAILED' : 'DEPENDENCIES_READY',
      errors,
      registryDigest: registryValidation.digest || null
    };
  }

  function capabilityProviders(registry, rendererContract, subjectId) {
    const resolved = factory.resolveSubject(registry, subjectId);
    if (!resolved.ok) return {};
    const providers = {};
    resolved.subject.widgetRefs.forEach(function (widgetId) {
      const widget = registry.widgetCatalog?.[widgetId];
      if (!isObject(widget) || !['existing', 'existing-lazy'].includes(widget.availability)) return;
      const capabilities = rendererContract.capabilityProviderCatalog?.[widgetId];
      (Array.isArray(capabilities) ? capabilities : []).forEach(function (capabilityRef) {
        if (!safeId(capabilityRef) || providers[capabilityRef]) return;
        providers[capabilityRef] = {
          capabilityRef,
          widgetId,
          availability: widget.availability
        };
      });
    });
    return providers;
  }

  function sourceDigest(source) {
    const inspection = validator.inspectJsonValue(source, validator.defaultLimits);
    return {
      inspection,
      digest: inspection.errors.length ? null : validator.hash256(source)
    };
  }

  function basePlan(code, source, subjectId, resolved, digest) {
    return {
      ok: true,
      blocked: false,
      code,
      mode: 'read-only-plan',
      subjectId,
      engineRef: resolved.subject.engineRef,
      sourceDigest: digest,
      digestAlgorithm: 'sha256-stable-json-v1',
      sourceUnchanged: true,
      sourceMutationAllowed: false,
      learnerStateWriteAllowed: false,
      masterReadyClaimed: false,
      route: clone(resolved.subject.routes, {}),
      rollback: {
        behavior: 'route-directly-to-unchanged-subject-engine',
        route: resolved.subject.routes.main,
        sourceDigest: digest
      }
    };
  }

  function projectionContext(source, request, subject, typeResolution, sourcePath) {
    const lessonId = source.id || source.lessonId;
    return {
      subjectId: subject.id,
      lessonId,
      lessonType: typeResolution.lessonType,
      stageId: source.stage || source.eLearning?.stage || request.stageId || 'unknown-stage',
      sourcePath,
      sourceArtifactId: subject.id + ':' + lessonId,
      sourceArtifactKind: 'lesson-record',
      sourceVersion: 'elearning-v1.1',
      adapterId: 'b10-elearning-v1.1-readonly-bridge',
      contentVersion: request.contentVersion || 'elearning-v1.1',
      estimatedMinutes: Number(source.eLearning?.estimatedMinutes) || undefined,
      tags: Array.isArray(request.tags) ? clone(request.tags, []) : []
    };
  }

  function specialistPlan(source, request, resolved, digest) {
    const plan = basePlan('DELEGATE_SPECIALIST_ENGINE', source, request.subjectId, resolved, digest);
    plan.delegate = {
      rendererOwner: resolved.engine.rendererOwner,
      adapterGlobal: resolved.engine.adapterGlobal || null,
      route: resolved.subject.routes.main,
      editorRoute: resolved.subject.routes.editor || null,
      reason: 'Specialist engine retains interaction, source and learner-state ownership.'
    };
    plan.projection = null;
    plan.render = null;
    return plan;
  }

  function canonicalPlan(source, request, dependencies, resolved, digest, typeResolution) {
    if (source.metadata.subjectId !== request.subjectId) {
      return blocked('SUBJECT_SOURCE_MISMATCH', 'Canonical source subject does not match the requested Factory subject.', {
        requested: request.subjectId,
        source: source.metadata.subjectId
      });
    }
    if (!typeResolution.ok || typeResolution.lessonType !== source.metadata.lessonType) {
      return blocked('LESSON_TYPE_SOURCE_MISMATCH', 'Canonical source type is not allowed by the Factory subject profile.', typeResolution);
    }
    const providers = capabilityProviders(
      dependencies.registry,
      dependencies.rendererContract,
      request.subjectId
    );
    const renderResult = renderer.buildRenderModel(
      source,
      dependencies.schema,
      dependencies.blockPolicy,
      {
        lessonMode: request.lessonMode || null,
        strategy: request.strategy,
        preferSpecialist: request.preferSpecialist === true,
        capabilityProviders: providers,
        assessmentErrors: clone(request.assessmentErrors, []),
        weakTopics: clone(request.weakTopics, [])
      }
    );
    if (!renderResult.ok) {
      return {
        ok: false,
        blocked: true,
        code: 'POLICY_BLOCKED',
        message: 'Canonical light source is valid but does not satisfy its resolved B3 runtime policy.',
        subjectId: request.subjectId,
        sourceDigest: digest,
        typeResolution,
        render: renderResult,
        rollback: {
          behavior: 'route-directly-to-unchanged-subject-engine',
          route: resolved.subject.routes.main,
          sourceDigest: digest
        }
      };
    }
    const html = renderer.renderToHtml(renderResult.model, {
      activeOfficialAttempt: request.activeOfficialAttempt === true,
      attemptSubmitted: request.attemptSubmitted === true
    });
    if (!html.ok) return html;
    const plan = basePlan('CANONICAL_RENDER_READY', source, request.subjectId, resolved, digest);
    plan.lessonType = typeResolution.lessonType;
    plan.typeAuthority = typeResolution.authority;
    plan.capabilityProviders = providers;
    plan.projection = {
      sourceFamily: 'canonical-v2',
      sourceVersion: '2.0.0',
      manualReviewRequired: false,
      outputDigest: renderResult.validation.digest
    };
    plan.render = {
      model: renderResult.model,
      modelDigest: renderResult.modelDigest,
      html: html.html,
      htmlDigest: html.htmlDigest
    };
    return plan;
  }

  function elearningPlan(source, request, dependencies, resolved, digest, typeResolution) {
    if (!typeResolution.ok) {
      return blocked(typeResolution.code, typeResolution.message, typeResolution.details);
    }
    const sourceLookup = factory.resolveDataSource(
      dependencies.registry,
      request.subjectId,
      'lessons'
    );
    if (!sourceLookup.ok) {
      return blocked(sourceLookup.code, sourceLookup.message, sourceLookup.details);
    }
    const context = projectionContext(
      source,
      request,
      resolved.subject,
      typeResolution,
      sourceLookup.relativePath
    );
    if (!safeId(context.lessonId)) {
      return blocked('INVALID_LESSON_ID', 'Light lesson requires a stable safe ID.', context.lessonId);
    }
    const migration = migrator.migrate(
      source,
      context,
      dependencies.schema,
      { sourceFamily: 'elearning-v1.1' }
    );
    if (!migration.ok) {
      return blocked(migration.code, migration.message, migration.details);
    }
    if (request.reviewPreview !== true) {
      const plan = basePlan('REVIEW_REQUIRED', source, request.subjectId, resolved, digest);
      plan.lessonType = typeResolution.lessonType;
      plan.typeAuthority = typeResolution.authority;
      plan.projection = {
        sourceFamily: migration.sourceFamily,
        sourceVersion: migration.sourceVersion,
        migrationId: migration.migrationId,
        inputDigest: migration.inputDigest,
        outputDigest: migration.outputDigest,
        manualReviewRequired: true,
        sourceUnchanged: migration.sourceUnchanged,
        warnings: clone(migration.warnings, [])
      };
      plan.render = null;
      return plan;
    }
    const providers = capabilityProviders(
      dependencies.registry,
      dependencies.rendererContract,
      request.subjectId
    );
    const renderResult = renderer.buildRenderModel(
      migration.output,
      dependencies.schema,
      dependencies.blockPolicy,
      {
        reviewPreview: true,
        lessonMode: request.lessonMode || null,
        strategy: request.strategy,
        preferSpecialist: request.preferSpecialist === true,
        capabilityProviders: providers,
        assessmentErrors: clone(request.assessmentErrors, []),
        weakTopics: clone(request.weakTopics, [])
      }
    );
    const plan = basePlan(
      renderResult.ok ? 'REVIEW_PREVIEW_READY' : 'REVIEW_PREVIEW_BLOCKED',
      source,
      request.subjectId,
      resolved,
      digest
    );
    plan.ok = renderResult.ok;
    plan.blocked = !renderResult.ok;
    plan.lessonType = typeResolution.lessonType;
    plan.typeAuthority = typeResolution.authority;
    plan.masterReadyClaimed = false;
    plan.capabilityProviders = providers;
    plan.projection = {
      sourceFamily: migration.sourceFamily,
      sourceVersion: migration.sourceVersion,
      migrationId: migration.migrationId,
      inputDigest: migration.inputDigest,
      outputDigest: migration.outputDigest,
      manualReviewRequired: true,
      sourceUnchanged: migration.sourceUnchanged,
      warnings: clone(migration.warnings, [])
    };
    if (!renderResult.ok) {
      plan.message = 'Review candidate remains policy-blocked; the unchanged light engine is the runtime fallback.';
      plan.render = {
        model: null,
        policy: renderResult.policy,
        validation: renderResult.validation
      };
      return plan;
    }
    const html = renderer.renderToHtml(renderResult.model, {
      activeOfficialAttempt: request.activeOfficialAttempt === true,
      attemptSubmitted: request.attemptSubmitted === true
    });
    if (!html.ok) return html;
    plan.render = {
      model: renderResult.model,
      modelDigest: renderResult.modelDigest,
      html: html.html,
      htmlDigest: html.htmlDigest
    };
    return plan;
  }

  function plan(source, inputRequest, dependencies) {
    const request = isObject(inputRequest) ? clone(inputRequest, {}) : {};
    if (request.apply === true || request.write === true || request.commit === true
      || request.persist === true || request.activate === true) {
      return blocked('B10_PLAN_ONLY', 'B10 bridge cannot activate, write, commit or persist.', null);
    }
    const requestInspection = validator.inspectJsonValue(request, validator.defaultLimits);
    if (requestInspection.errors.length) {
      return blocked('INVALID_BRIDGE_REQUEST', 'Bridge request must be safe finite credential-free JSON.', requestInspection.errors);
    }
    if (!safeId(request.subjectId)) {
      return blocked('INVALID_SUBJECT_ID', 'Bridge request requires a safe subjectId.', request.subjectId);
    }
    const audit = dependencyAudit(dependencies);
    if (!audit.ok) return blocked(audit.code, 'B10 bridge dependency audit failed.', audit.errors);
    const sourceEvidence = sourceDigest(source);
    if (sourceEvidence.inspection.errors.length || !isObject(source)) {
      return blocked('INVALID_SOURCE', 'Bridge source must be safe finite credential-free plain JSON.', sourceEvidence.inspection.errors);
    }
    const resolved = factory.resolveSubject(dependencies.registry, request.subjectId);
    if (!resolved.ok) return resolved;
    const engineIsSpecialist = SPECIALIST_ENGINE_MODES.includes(resolved.engine.mode)
      || resolved.subject.compatibility.mode === 'read-only-adapter-bridge';
    if (engineIsSpecialist) {
      return specialistPlan(source, request, resolved, sourceEvidence.digest);
    }
    const inspected = migrator.inspectSource(source, { subjectId: request.subjectId });
    if (inspected.family === 'canonical-v2') {
      const typeResolution = factory.resolveLessonType(
        dependencies.registry,
        request.subjectId,
        source,
        { explicitLessonType: source.metadata?.lessonType }
      );
      return canonicalPlan(
        source,
        request,
        dependencies,
        resolved,
        sourceEvidence.digest,
        typeResolution
      );
    }
    if (inspected.family === 'elearning-v1.1') {
      const typeResolution = factory.resolveLessonType(
        dependencies.registry,
        request.subjectId,
        source,
        { explicitLessonType: request.explicitLessonType }
      );
      return elearningPlan(
        source,
        request,
        dependencies,
        resolved,
        sourceEvidence.digest,
        typeResolution
      );
    }
    return blocked('INVALID_SOURCE', 'No safe B10 bridge route exists for this light source family.', inspected);
  }

  function rollback(planResult, currentSource) {
    if (!isObject(planResult)
      || planResult.digestAlgorithm !== 'sha256-stable-json-v1'
      || typeof planResult.sourceDigest !== 'string'
      || !isObject(planResult.rollback)) {
      return blocked('INVALID_BRIDGE_PLAN', 'Rollback requires a B10 plan with integrity evidence.', null);
    }
    const evidence = sourceDigest(currentSource);
    if (evidence.inspection.errors.length || evidence.digest !== planResult.sourceDigest) {
      return blocked('SOURCE_INTEGRITY_FAILED', 'Current source differs from the read-only plan snapshot.', {
        expected: planResult.sourceDigest,
        actual: evidence.digest
      });
    }
    return {
      ok: true,
      blocked: false,
      code: 'UNCHANGED_ENGINE_ROUTE_RESTORED',
      route: planResult.rollback.route,
      sourceDigest: evidence.digest,
      sourceUnchanged: true,
      learnerStateWritePerformed: false,
      cacheWritePerformed: false
    };
  }

  global.BaumanLegacyLessonBridge = Object.freeze({
    release: RELEASE,
    specialistEngineModes: SPECIALIST_ENGINE_MODES,
    dependencyAudit,
    capabilityProviders,
    plan,
    rollback
  });
})(typeof window !== 'undefined' ? window : globalThis);
