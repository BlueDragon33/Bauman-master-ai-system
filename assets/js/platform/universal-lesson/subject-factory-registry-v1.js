(function (global) {
  'use strict';

  const validator = global.BaumanUniversalLessonValidator;
  if (!validator) throw new Error('BaumanSubjectFactoryRegistry requires BaumanUniversalLessonValidator');

  const RELEASE = 'L6-B9-SUBJECT-FACTORY-REGISTRY-V1';
  const EXPECTED_SUBJECTS = Object.freeze([
    'russian',
    'math',
    'programming',
    'ai',
    'systems',
    'signal',
    'research',
    'foundation'
  ]);
  const LOAD_CLASSES = Object.freeze([
    'startup',
    'required-lazy',
    'optional-lazy',
    'runtime-supplemental'
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

  function unique(values) {
    return Array.from(new Set(Array.isArray(values) ? values : []));
  }

  function sameSet(left, right) {
    const a = unique(left);
    const b = unique(right);
    return a.length === b.length && a.every(function (value) { return b.includes(value); });
  }

  function safeId(value) {
    return typeof value === 'string'
      && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)
      && !value.includes('..');
  }

  function safeRelativePath(value) {
    if (typeof value !== 'string' || !value || value.startsWith('/') || value.includes('\\')) return false;
    if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value) || /[?#]/.test(value)) return false;
    const parts = value.split('/');
    return parts.every(function (part) { return part && part !== '.' && part !== '..'; });
  }

  function ok(code, details) {
    return Object.assign({ ok: true, code }, details || {});
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

  function subjectRecord(registry, subjectId) {
    if (!isObject(registry) || !isObject(registry.subjects)) return null;
    return isObject(registry.subjects[subjectId]) ? registry.subjects[subjectId] : null;
  }

  function sourceClassEntries(subject) {
    const sources = isObject(subject?.dataSources) ? subject.dataSources : {};
    return [
      ['startup', sources.startup],
      ['required-lazy', sources.requiredLazy],
      ['optional-lazy', sources.optionalLazy],
      ['runtime-supplemental', sources.runtimeSupplemental]
    ];
  }

  function sourceIndex(subject) {
    const index = new Map();
    const duplicates = [];
    sourceClassEntries(subject).forEach(function (entry) {
      const loadClass = entry[0];
      (Array.isArray(entry[1]) ? entry[1] : []).forEach(function (sourceId) {
        if (index.has(sourceId)) duplicates.push({ sourceId, classes: [index.get(sourceId), loadClass] });
        else index.set(sourceId, loadClass);
      });
    });
    return { index, duplicates };
  }

  function resolveSubject(registry, subjectId) {
    if (!safeId(subjectId)) {
      return blocked('INVALID_SUBJECT_ID', 'subjectId must be a stable safe identifier.', subjectId);
    }
    const subject = subjectRecord(registry, subjectId);
    if (!subject) return blocked('UNKNOWN_SUBJECT', 'Subject is not registered in the B9 factory.', subjectId);
    const engine = registry.engineCatalog?.[subject.engineRef];
    if (!isObject(engine)) {
      return blocked('UNKNOWN_ENGINE', 'Registered subject engineRef does not resolve.', subject.engineRef);
    }
    const offlinePolicy = registry.offlinePolicyCatalog?.[subject.offlinePolicyRef];
    if (!isObject(offlinePolicy)) {
      return blocked('UNKNOWN_OFFLINE_POLICY', 'Registered subject offlinePolicyRef does not resolve.', subject.offlinePolicyRef);
    }
    return ok('SUBJECT_RESOLVED', {
      subject: clone(subject, null),
      engine: clone(engine, null),
      offlinePolicy: clone(offlinePolicy, null)
    });
  }

  function ruleMatches(rule, lesson) {
    const lessonId = String(lesson?.id || lesson?.lessonId || '');
    const moduleId = String(lesson?.moduleId || '');
    const title = String(lesson?.title || lesson?.lessonTitle || '').toLocaleLowerCase();
    const criteria = [];
    if (Array.isArray(rule.lessonIds) && rule.lessonIds.length) criteria.push(rule.lessonIds.includes(lessonId));
    if (Array.isArray(rule.lessonIdPrefixes) && rule.lessonIdPrefixes.length) {
      criteria.push(rule.lessonIdPrefixes.some(function (prefix) { return lessonId.startsWith(prefix); }));
    }
    if (Array.isArray(rule.moduleIds) && rule.moduleIds.length) criteria.push(rule.moduleIds.includes(moduleId));
    if (Array.isArray(rule.moduleIdPrefixes) && rule.moduleIdPrefixes.length) {
      criteria.push(rule.moduleIdPrefixes.some(function (prefix) { return moduleId.startsWith(prefix); }));
    }
    if (Array.isArray(rule.titleIncludesAny) && rule.titleIncludesAny.length) {
      criteria.push(rule.titleIncludesAny.some(function (token) {
        return title.includes(String(token).toLocaleLowerCase());
      }));
    }
    return criteria.length > 0 && criteria.every(Boolean);
  }

  function resolveLessonType(registry, subjectId, lesson, inputContext) {
    const resolved = resolveSubject(registry, subjectId);
    if (!resolved.ok) return resolved;
    const context = isObject(inputContext) ? inputContext : {};
    const policy = resolved.subject.lessonTypePolicy;
    const allowed = Array.isArray(policy?.allowed) ? policy.allowed : [];
    if (typeof context.explicitLessonType === 'string' && context.explicitLessonType) {
      if (!allowed.includes(context.explicitLessonType)) {
        return blocked(
          'LESSON_TYPE_NOT_ALLOWED',
          'Explicit lesson type is not allowed for this subject.',
          { subjectId, lessonType: context.explicitLessonType, allowed }
        );
      }
      return ok('LESSON_TYPE_RESOLVED', {
        subjectId,
        lessonType: context.explicitLessonType,
        authority: 'explicit-context',
        ruleId: null,
        manualReviewRequired: false
      });
    }
    const matches = (Array.isArray(policy?.rules) ? policy.rules : []).filter(function (rule) {
      return ruleMatches(rule, lesson);
    });
    const matchedTypes = unique(matches.map(function (rule) { return rule.type; }));
    if (matchedTypes.length > 1) {
      return blocked(
        'AMBIGUOUS_LESSON_TYPE',
        'More than one classification rule resolved to different primary lesson types.',
        { subjectId, lessonId: lesson?.id || lesson?.lessonId || null, matches: clone(matches, []) }
      );
    }
    if (matchedTypes.length === 1) {
      return ok('LESSON_TYPE_RESOLVED', {
        subjectId,
        lessonType: matchedTypes[0],
        authority: 'subject-classification-rule',
        ruleId: matches[0].id,
        manualReviewRequired: false
      });
    }
    const moduleId = String(lesson?.moduleId || '');
    if (Array.isArray(policy?.manualReviewModules) && policy.manualReviewModules.includes(moduleId)) {
      return blocked(
        'UNCLASSIFIED_LESSON',
        'Lesson module is explicitly held for manual type review.',
        { subjectId, lessonId: lesson?.id || lesson?.lessonId || null, moduleId, manualReviewRequired: true }
      );
    }
    if (typeof policy?.default === 'string' && allowed.includes(policy.default)) {
      return ok('LESSON_TYPE_RESOLVED', {
        subjectId,
        lessonType: policy.default,
        authority: 'subject-default',
        ruleId: null,
        manualReviewRequired: false
      });
    }
    return blocked(
      'UNCLASSIFIED_LESSON',
      'No deterministic primary lesson type is registered for this lesson.',
      { subjectId, lessonId: lesson?.id || lesson?.lessonId || null, moduleId, manualReviewRequired: true }
    );
  }

  function resolveDataSource(registry, subjectId, sourceId) {
    const resolved = resolveSubject(registry, subjectId);
    if (!resolved.ok) return resolved;
    if (!safeId(sourceId)) {
      return blocked('INVALID_SOURCE_ID', 'sourceId must be a stable safe identifier.', sourceId);
    }
    const dataSources = resolved.subject.dataSources;
    const indexed = sourceIndex(resolved.subject);
    if (indexed.duplicates.length) {
      return blocked('AMBIGUOUS_DATA_SOURCE', 'Source is declared in more than one load class.', indexed.duplicates);
    }
    const loadClass = indexed.index.get(sourceId);
    if (!loadClass) {
      return blocked(
        'UNKNOWN_DATA_SOURCE',
        'Data source is not registered; specialist engines retain ownership of unregistered files.',
        { subjectId, sourceId }
      );
    }
    const override = dataSources.pathOverrides?.[sourceId];
    const filename = typeof override === 'string' ? override : sourceId + '.json';
    const relativePath = dataSources.root + '/' + filename;
    if (!safeRelativePath(relativePath)) {
      return blocked('UNSAFE_DATA_SOURCE_PATH', 'Resolved data source path is not repository-relative and safe.', relativePath);
    }
    return ok('DATA_SOURCE_RESOLVED', {
      subjectId,
      sourceId,
      relativePath,
      loadClass,
      required: loadClass === 'startup' || loadClass === 'required-lazy' || loadClass === 'runtime-supplemental',
      offlinePolicyRef: resolved.subject.offlinePolicyRef,
      catalogRefs: clone(dataSources.catalogRefs, []),
      authority: override ? 'registry-path-override' : 'registered-subject-data-root'
    });
  }

  function resolveWidget(registry, subjectId, widgetId, lessonType) {
    const resolved = resolveSubject(registry, subjectId);
    if (!resolved.ok) return resolved;
    if (!resolved.subject.widgetRefs.includes(widgetId)) {
      return blocked('UNREGISTERED_WIDGET', 'Widget is not registered for this subject.', { subjectId, widgetId });
    }
    const widget = registry.widgetCatalog?.[widgetId];
    if (!isObject(widget)) return blocked('UNKNOWN_WIDGET', 'widgetRef does not resolve in the widget catalog.', widgetId);
    if (typeof lessonType === 'string' && !widget.lessonTypes.includes(lessonType)) {
      return blocked(
        'WIDGET_LESSON_TYPE_MISMATCH',
        'Widget is not compatible with the resolved primary lesson type.',
        { subjectId, widgetId, lessonType, allowed: widget.lessonTypes }
      );
    }
    const existing = widget.availability === 'existing' || widget.availability === 'existing-lazy';
    return ok('WIDGET_RESOLVED', {
      subjectId,
      widgetId,
      widget: clone(widget, null),
      useSpecialistWidget: existing,
      useDeterministicFallback: !existing,
      fallback: widget.fallback
    });
  }

  function buildDescriptor(registry, subjectId) {
    const resolved = resolveSubject(registry, subjectId);
    if (!resolved.ok) return resolved;
    const indexed = sourceIndex(resolved.subject);
    if (indexed.duplicates.length) {
      return blocked('AMBIGUOUS_DATA_SOURCE', 'Subject data source classes overlap.', indexed.duplicates);
    }
    const sources = [];
    indexed.index.forEach(function (_, sourceId) {
      const source = resolveDataSource(registry, subjectId, sourceId);
      if (source.ok) sources.push(source);
    });
    return ok('SUBJECT_DESCRIPTOR_BUILT', {
      subjectId,
      engineRef: resolved.subject.engineRef,
      engine: resolved.engine,
      routes: clone(resolved.subject.routes, {}),
      lessonTypePolicy: clone(resolved.subject.lessonTypePolicy, {}),
      widgetRefs: clone(resolved.subject.widgetRefs, []),
      dataSources: sources.sort(function (left, right) { return left.sourceId.localeCompare(right.sourceId); }),
      offlinePolicyRef: resolved.subject.offlinePolicyRef,
      offlinePolicy: resolved.offlinePolicy,
      compatibility: clone(resolved.subject.compatibility, {})
    });
  }

  function validateRegistry(registry) {
    const errors = [];
    const warnings = [];
    function error(path, code, message, details) {
      errors.push({ path, code, message, details: details === undefined ? null : details });
    }
    const inspection = validator.inspectJsonValue(registry, validator.defaultLimits);
    if (inspection.errors.length) {
      inspection.errors.forEach(function (item) {
        error(item.path, 'UNSAFE_REGISTRY_JSON', item.message, item.details);
      });
    }
    if (!isObject(registry)) error('/', 'REGISTRY_OBJECT_REQUIRED', 'Registry must be a JSON object.');
    if (registry?.registryId !== 'bauman-subject-factory-registry') {
      error('/registryId', 'REGISTRY_ID_MISMATCH', 'Unexpected registry identity.', registry?.registryId);
    }
    if (registry?.registryVersion !== '1.0.0') {
      error('/registryVersion', 'REGISTRY_VERSION_MISMATCH', 'Unexpected registry version.', registry?.registryVersion);
    }
    const identity = registry?.programIdentity;
    if (identity?.department !== 'ИУ-5'
      || identity?.officialPublishedDirectionCode !== '09.04.01'
      || identity?.personalizedDisplayCode !== '09.04.01/11') {
      error('/programIdentity', 'PROGRAM_IDENTITY_MISMATCH', 'Bauman official and personalized identities must remain distinct.', identity);
    }
    const subjectIds = Object.keys(isObject(registry?.subjects) ? registry.subjects : {});
    if (!sameSet(subjectIds, EXPECTED_SUBJECTS)) {
      error('/subjects', 'SUBJECT_SET_MISMATCH', 'Factory must register exactly the eight Main subjects.', subjectIds);
    }
    subjectIds.forEach(function (subjectId) {
      const path = '/subjects/' + subjectId;
      const subject = registry.subjects[subjectId];
      if (subject.id !== subjectId) error(path + '/id', 'SUBJECT_ID_MISMATCH', 'Subject key and id differ.', subject.id);
      if (!isObject(registry.engineCatalog?.[subject.engineRef])) {
        error(path + '/engineRef', 'UNKNOWN_ENGINE', 'engineRef does not resolve.', subject.engineRef);
      }
      if (!isObject(registry.offlinePolicyCatalog?.[subject.offlinePolicyRef])) {
        error(path + '/offlinePolicyRef', 'UNKNOWN_OFFLINE_POLICY', 'offlinePolicyRef does not resolve.', subject.offlinePolicyRef);
      }
      Object.keys(subject.routes || {}).forEach(function (routeKey) {
        if (!safeRelativePath(subject.routes[routeKey])) {
          error(path + '/routes/' + routeKey, 'UNSAFE_ROUTE', 'Subject route must be repository-relative.', subject.routes[routeKey]);
        }
      });
      const policy = subject.lessonTypePolicy;
      const allowed = Array.isArray(policy?.allowed) ? policy.allowed : [];
      if (!allowed.length || allowed.some(function (typeId) { return !validator.typeEvidenceOutputs[typeId]; })) {
        error(path + '/lessonTypePolicy/allowed', 'UNKNOWN_LESSON_TYPE', 'Allowed type is empty or not registered in B4.', allowed);
      }
      if (policy?.default !== null && (typeof policy?.default !== 'string' || !allowed.includes(policy.default))) {
        error(path + '/lessonTypePolicy/default', 'INVALID_DEFAULT_TYPE', 'Default type must be null or one of the allowed types.', policy?.default);
      }
      const ruleIds = new Set();
      (Array.isArray(policy?.rules) ? policy.rules : []).forEach(function (rule, index) {
        const rulePath = path + '/lessonTypePolicy/rules/' + index;
        if (!safeId(rule.id) || ruleIds.has(rule.id)) error(rulePath + '/id', 'INVALID_RULE_ID', 'Rule id must be safe and unique.', rule.id);
        ruleIds.add(rule.id);
        if (!allowed.includes(rule.type)) error(rulePath + '/type', 'RULE_TYPE_NOT_ALLOWED', 'Rule type must be allowed for the subject.', rule.type);
        if (!['lessonIds', 'lessonIdPrefixes', 'moduleIds', 'moduleIdPrefixes', 'titleIncludesAny'].some(function (key) {
          return Array.isArray(rule[key]) && rule[key].length;
        })) error(rulePath, 'EMPTY_CLASSIFICATION_RULE', 'Classification rule must declare at least one match criterion.');
      });
      const widgetRefs = Array.isArray(subject.widgetRefs) ? subject.widgetRefs : [];
      if (widgetRefs.length !== unique(widgetRefs).length) error(path + '/widgetRefs', 'DUPLICATE_WIDGET_REF', 'Subject widget refs must be unique.');
      widgetRefs.forEach(function (widgetRef) {
        const widget = registry.widgetCatalog?.[widgetRef];
        if (!isObject(widget)) error(path + '/widgetRefs', 'UNKNOWN_WIDGET', 'widgetRef does not resolve.', widgetRef);
        else if (!widget.lessonTypes.some(function (typeId) { return allowed.includes(typeId); })) {
          error(path + '/widgetRefs', 'WIDGET_TYPE_DISJOINT', 'Widget supports none of the subject lesson types.', widgetRef);
        }
      });
      const indexed = sourceIndex(subject);
      if (indexed.duplicates.length) error(path + '/dataSources', 'AMBIGUOUS_DATA_SOURCE', 'Source load classes overlap.', indexed.duplicates);
      indexed.index.forEach(function (loadClass, sourceId) {
        if (!safeId(sourceId)) error(path + '/dataSources', 'INVALID_SOURCE_ID', 'Registered source id is unsafe.', sourceId);
        if (!LOAD_CLASSES.includes(loadClass)) error(path + '/dataSources', 'INVALID_LOAD_CLASS', 'Unknown data source load class.', loadClass);
        const source = resolveDataSource(registry, subjectId, sourceId);
        if (!source.ok) error(path + '/dataSources', source.code, source.message, source.details);
      });
      const primary = subject.dataSources?.lessonSourcePolicy?.primary;
      if (typeof primary !== 'string' || !indexed.index.has(primary)) {
        error(path + '/dataSources/lessonSourcePolicy/primary', 'PRIMARY_SOURCE_UNREGISTERED', 'Primary lesson source must be registered.', primary);
      }
      const compatibility = subject.compatibility;
      if (compatibility?.directMigration !== false
        || compatibility?.directFactoryRender !== false
        || compatibility?.sourceMutation !== false
        || compatibility?.learnerStateMigration !== false) {
        error(path + '/compatibility', 'B9_RUNTIME_BOUNDARY_BROKEN', 'B9 subjects must remain read-only and renderer-inactive.', compatibility);
      }
    });
    const foundation = registry?.subjects?.foundation;
    if (foundation?.lessonTypePolicy?.default !== null
      || !sameSet(foundation?.lessonTypePolicy?.manualReviewModules, ['f_m201', 'f_m202'])) {
      error(
        '/subjects/foundation/lessonTypePolicy',
        'FOUNDATION_FAIL_CLOSED_POLICY_REQUIRED',
        'Foundation must keep a null default and hold f_m201/f_m202 for manual review.',
        foundation?.lessonTypePolicy
      );
    }
    const russianSources = registry?.subjects?.russian?.dataSources;
    const russianHeavyRequired = ['vocab', 'tests', 'speaking'];
    if (!sameSet(russianSources?.requiredLazy, russianHeavyRequired)
      || russianHeavyRequired.some(function (sourceId) {
        return (russianSources?.optionalLazy || []).includes(sourceId)
          || (russianSources?.startup || []).includes(sourceId);
      })) {
      error(
        '/subjects/russian/dataSources',
        'RUSSIAN_REQUIRED_LAZY_POLICY_REQUIRED',
        'Russian vocab/tests/speaking must remain required-lazy and outside startup/optional persistence exclusions.',
        russianSources
      );
    }
    const mathSources = registry?.subjects?.math?.dataSources;
    const mathPrecedence = mathSources?.lessonSourcePolicy?.precedence;
    if (mathSources?.lessonSourcePolicy?.primary !== 'theory_lecture_content'
      || !Array.isArray(mathPrecedence)
      || mathPrecedence[0] !== 'window.DB.theory_lecture_content'
      || !mathPrecedence.includes('registered-artifact-reader')
      || mathPrecedence[mathPrecedence.length - 1] !== 'explicit-legacy-lessons'
      || !(mathSources?.requiredLazy || []).includes('lessons')
      || !(mathSources?.runtimeSupplemental || []).includes('lessons-deferred')
      || mathSources?.pathOverrides?.['lessons-deferred'] !== 'lessons_deferred.json') {
      error(
        '/subjects/math/dataSources',
        'MATH_AUTHORITATIVE_SOURCE_POLICY_REQUIRED',
        'Math must prefer the authoritative theory reader and keep full legacy lessons deferred.',
        mathSources
      );
    }
    ['ai', 'foundation', 'research', 'signal', 'systems'].forEach(function (subjectId) {
      const lightSources = registry?.subjects?.[subjectId]?.dataSources;
      if (!sameSet(lightSources?.runtimeSupplemental, ['simulations'])) {
        error(
          '/subjects/' + subjectId + '/dataSources/runtimeSupplemental',
          'LIGHT_SIMULATION_SUPPLEMENT_REQUIRED',
          'Light runtime simulations.json must remain registered as the audited runtime supplement.',
          lightSources?.runtimeSupplemental
        );
      }
    });
    Object.keys(isObject(registry?.widgetCatalog) ? registry.widgetCatalog : {}).forEach(function (widgetId) {
      const widget = registry.widgetCatalog[widgetId];
      if (!safeId(widgetId)) error('/widgetCatalog/' + widgetId, 'INVALID_WIDGET_ID', 'Widget id is unsafe.');
      if (!['existing', 'existing-lazy', 'declared', 'planned-L8', 'planned-L9', 'planned-L10'].includes(widget.availability)) {
        error('/widgetCatalog/' + widgetId + '/availability', 'INVALID_WIDGET_AVAILABILITY', 'Widget availability must be a registered B9 lifecycle state.', widget.availability);
      }
      if (typeof widget.fallback !== 'string' || !widget.fallback) {
        error('/widgetCatalog/' + widgetId + '/fallback', 'WIDGET_FALLBACK_REQUIRED', 'Every widget requires a deterministic fallback.');
      }
      if (typeof widget.masterReadyAuthority !== 'string' || !widget.masterReadyAuthority) {
        error('/widgetCatalog/' + widgetId + '/masterReadyAuthority', 'WIDGET_AUTHORITY_REQUIRED', 'Widget evidence authority must be explicit.');
      }
      if (/^planned-/.test(widget.availability) && widget.masterReadyAuthority !== 'none-until-implemented') {
        error('/widgetCatalog/' + widgetId + '/masterReadyAuthority', 'PLANNED_WIDGET_AUTHORITY_FORBIDDEN', 'Planned widgets cannot claim Master-ready authority before implementation.', widget.masterReadyAuthority);
      }
    });
    Object.keys(isObject(registry?.engineCatalog) ? registry.engineCatalog : {}).forEach(function (engineId) {
      const engine = registry.engineCatalog[engineId];
      if (engine.directFactoryRender !== false || engine.sourceRewriteAllowed !== false || engine.stateKeyRewriteAllowed !== false) {
        error('/engineCatalog/' + engineId, 'ENGINE_RUNTIME_BOUNDARY_BROKEN', 'B9 engine registration cannot activate rendering or rewrite source/state.', engine);
      }
    });
    Object.keys(isObject(registry?.offlinePolicyCatalog) ? registry.offlinePolicyCatalog : {}).forEach(function (policyId) {
      const policy = registry.offlinePolicyCatalog[policyId];
      if (policy.baseMaxResourceBytes !== 5 * 1024 * 1024
        || policy.sessionMaxResourceBytes !== 64 * 1024 * 1024
        || policy.silentWholeRepositoryPrecache !== false
        || policy.generativeAiRequired !== false
        || typeof policy.deterministicFallback !== 'string') {
        error('/offlinePolicyCatalog/' + policyId, 'OFFLINE_POLICY_UNSAFE', 'Offline policy must match L5 limits and deterministic fallback boundary.', policy);
      }
    });
    if (registry?.forwardOwnership?.runtimeWiringInB9 !== false) {
      error('/forwardOwnership/runtimeWiringInB9', 'B9_RUNTIME_WIRING_FORBIDDEN', 'Runtime wiring belongs to B10.');
    }
    const manualReviewSubjects = subjectIds.filter(function (subjectId) {
      return (registry.subjects[subjectId].lessonTypePolicy?.manualReviewModules || []).length > 0;
    });
    if (manualReviewSubjects.length) {
      warnings.push({
        code: 'MANUAL_TYPE_REVIEW_HELD',
        subjects: manualReviewSubjects,
        message: 'Factory intentionally holds unclassified modules for manual review.'
      });
    }
    return {
      valid: errors.length === 0,
      registryId: registry?.registryId || null,
      registryVersion: registry?.registryVersion || null,
      digestAlgorithm: 'sha256-stable-json-v1',
      digest: inspection.errors.length ? null : validator.hash256(registry),
      errors,
      warnings,
      summary: {
        subjects: subjectIds.length,
        engines: Object.keys(isObject(registry?.engineCatalog) ? registry.engineCatalog : {}).length,
        widgets: Object.keys(isObject(registry?.widgetCatalog) ? registry.widgetCatalog : {}).length,
        offlinePolicies: Object.keys(isObject(registry?.offlinePolicyCatalog) ? registry.offlinePolicyCatalog : {}).length,
        manualReviewSubjects: manualReviewSubjects.length
      }
    };
  }

  global.BaumanSubjectFactoryRegistry = Object.freeze({
    release: RELEASE,
    expectedSubjects: EXPECTED_SUBJECTS,
    loadClasses: LOAD_CLASSES,
    safeRelativePath,
    validateRegistry,
    resolveSubject,
    resolveLessonType,
    resolveDataSource,
    resolveWidget,
    buildDescriptor
  });
})(typeof window !== 'undefined' ? window : globalThis);
