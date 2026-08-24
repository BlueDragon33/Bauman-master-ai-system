(function (global) {
  'use strict';

  const validator = global.BaumanUniversalLessonValidator;
  if (!validator) throw new Error('BaumanUniversalLessonRenderer requires BaumanUniversalLessonValidator');

  const RELEASE = 'L6-B10-UNIVERSAL-LESSON-RENDERER-V1';
  const STRATEGIES = Object.freeze([
    'inline-flow',
    'gated-stepper',
    'slide-deck',
    'specialist-workspace',
    'split-view',
    'modal-tool',
    'external-artifact'
  ]);
  const BLOCK_ORDER = Object.freeze([
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
  const BLOCK_LABELS = Object.freeze({
    orientation: 'Bắt đầu và mục tiêu',
    'concept-map': 'Bản đồ khái niệm',
    theory: 'Lý thuyết cốt lõi',
    'worked-example': 'Ví dụ có lời giải',
    exercise: 'Luyện tập',
    'lab-simulation': 'Lab và mô phỏng',
    misconception: 'Sai lầm và sửa lỗi',
    'visual-check': 'Kiểm tra trực quan',
    oral: 'Giải thích và bảo vệ',
    review: 'Ôn tập và phục hồi',
    assessment: 'Đánh giá',
    mastery: 'Bằng chứng Master-ready',
    'project-nir-evidence': 'Liên hệ project · НИР · ВКР'
  });
  const REQUIREMENTS = Object.freeze(['required', 'optional', 'conditional', 'forbidden']);
  const FULFILLMENTS = Object.freeze(['inline', 'external', 'either']);
  const LESSON_MODES = Object.freeze(['orientation-only', 'diagnostic', 'recovery']);
  const PROTECTED_KEYS = new Set([
    'answer',
    'answers',
    'correct',
    'correctanswer',
    'correctstate',
    'solution',
    'solutions',
    'expectedanswer',
    'answerkey'
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

  function safeId(value) {
    return typeof value === 'string'
      && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)
      && !value.includes('..');
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[character];
    });
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

  function payloadHasContent(payload) {
    return isObject(payload) && Object.keys(payload).length > 0;
  }

  function normalizeEntry(entry) {
    const normalized = clone(entry, {});
    if (!Array.isArray(normalized.capabilityRefs)) normalized.capabilityRefs = [];
    normalized.capabilityRefs = unique(normalized.capabilityRefs);
    if (normalized.requirement !== 'conditional') delete normalized.conditionRef;
    return normalized;
  }

  function policyTable(blockPolicy, lessonType, lessonMode) {
    const errors = [];
    if (!isObject(blockPolicy)
      || blockPolicy.policyId !== 'bauman-universal-lesson-block-policy'
      || blockPolicy.policyVersion !== '1.0.0') {
      return blocked('INVALID_BLOCK_POLICY', 'Renderer requires the locked B3 block policy.', null);
    }
    if (!isObject(blockPolicy.policiesByLessonType?.[lessonType])) {
      return blocked('UNKNOWN_LESSON_TYPE_POLICY', 'No B3 block policy exists for the lesson type.', lessonType);
    }
    if (lessonMode !== null && lessonMode !== undefined && !LESSON_MODES.includes(lessonMode)) {
      return blocked('UNKNOWN_LESSON_MODE', 'Lesson mode is not registered by B3.', lessonMode);
    }
    const mode = lessonMode ? blockPolicy.lessonModeOverlays?.[lessonMode] : null;
    if (lessonMode && !isObject(mode)) {
      return blocked('UNKNOWN_LESSON_MODE', 'Lesson mode overlay does not resolve.', lessonMode);
    }
    const resolved = {};
    for (const kind of BLOCK_ORDER) {
      const base = blockPolicy.basePolicy?.[kind];
      if (!isObject(base)) {
        errors.push({ code: 'MISSING_BASE_POLICY', kind });
        continue;
      }
      const typeOverride = blockPolicy.policiesByLessonType[lessonType].overrides?.[kind] || {};
      const modeOverride = mode?.overrides?.[kind] || {};
      const entry = normalizeEntry(Object.assign({}, base, typeOverride, modeOverride));
      if (!REQUIREMENTS.includes(entry.requirement)) {
        errors.push({ code: 'INVALID_REQUIREMENT', kind, value: entry.requirement });
      }
      if (!FULFILLMENTS.includes(entry.fulfillment)) {
        errors.push({ code: 'INVALID_FULFILLMENT', kind, value: entry.fulfillment });
      }
      if (entry.requirement === 'conditional'
        && !isObject(blockPolicy.conditionCatalog?.[entry.conditionRef])) {
        errors.push({ code: 'UNKNOWN_CONDITION', kind, conditionRef: entry.conditionRef });
      }
      if (entry.fulfillment === 'external' && entry.capabilityRefs.length === 0) {
        errors.push({ code: 'EXTERNAL_CAPABILITY_LIST_REQUIRED', kind });
      }
      resolved[kind] = entry;
    }
    const extraKinds = Object.keys(blockPolicy.basePolicy || {}).filter(function (kind) {
      return !BLOCK_ORDER.includes(kind);
    });
    if (extraKinds.length) errors.push({ code: 'UNKNOWN_POLICY_BLOCKS', kinds: extraKinds });
    return {
      ok: errors.length === 0,
      code: errors.length ? 'INVALID_RESOLVED_POLICY' : 'POLICY_TABLE_RESOLVED',
      lessonType,
      lessonMode: lessonMode || null,
      table: resolved,
      errors
    };
  }

  function blocksOf(lesson, kind) {
    return (Array.isArray(lesson?.blocks) ? lesson.blocks : []).filter(function (block) {
      return block.kind === kind && payloadHasContent(block.payload);
    });
  }

  function hasBoundBlock(lesson, kind) {
    return blocksOf(lesson, kind).some(function (block) {
      return Array.isArray(block.sourceBindings) && block.sourceBindings.length > 0;
    });
  }

  function conditionValue(conditionRef, lesson, context) {
    const metadata = isObject(lesson?.metadata) ? lesson.metadata : {};
    const flags = isObject(metadata.flags) ? metadata.flags : {};
    const ctx = isObject(context) ? context : {};
    if (conditionRef === 'teaches-new-concept') return flags.teachesNewConcept === true;
    if (conditionRef === 'has-worked-procedure') {
      return flags.hasWorkedProcedure === true || hasBoundBlock(lesson, 'worked-example');
    }
    if (conditionRef === 'requires-interactive-manipulation') {
      return flags.requiresInteractiveManipulation === true;
    }
    if (conditionRef === 'has-diagnosable-visual-state') {
      return flags.hasDiagnosableVisualState === true;
    }
    if (conditionRef === 'requires-oral-performance') {
      return flags.requiresOralPerformance === true;
    }
    if (conditionRef === 'assessment-blueprint-present') {
      return typeof metadata.assessmentBlueprintRef === 'string' && metadata.assessmentBlueprintRef.length > 0;
    }
    if (conditionRef === 'project-or-nir-link-present') {
      return typeof lesson?.contextRefs?.nirVkrContext === 'string'
        || (typeof metadata.projectRef === 'string' && metadata.projectRef.length > 0);
    }
    if (conditionRef === 'has-concept-relations') {
      return (Array.isArray(lesson?.prerequisites) && lesson.prerequisites.length > 0)
        || (typeof metadata.conceptGraphRef === 'string' && metadata.conceptGraphRef.length > 0);
    }
    if (conditionRef === 'has-source-backed-misconceptions') {
      return hasBoundBlock(lesson, 'misconception');
    }
    if (conditionRef === 'has-experiment-or-dataset') {
      return (typeof metadata.experimentRef === 'string' && metadata.experimentRef.length > 0)
        || (typeof metadata.datasetRef === 'string' && metadata.datasetRef.length > 0);
    }
    if (conditionRef === 'post-diagnostic-repair-needed') {
      return (Array.isArray(ctx.assessmentErrors) && ctx.assessmentErrors.length > 0)
        || (Array.isArray(ctx.weakTopics) && ctx.weakTopics.length > 0);
    }
    return null;
  }

  function capabilityIndex(context) {
    const ctx = isObject(context) ? context : {};
    const index = new Map();
    unique(ctx.availableCapabilities).forEach(function (capabilityRef) {
      if (safeId(capabilityRef)) index.set(capabilityRef, { capabilityRef, widgetId: null });
    });
    if (isObject(ctx.capabilityProviders)) {
      Object.keys(ctx.capabilityProviders).forEach(function (capabilityRef) {
        const provider = ctx.capabilityProviders[capabilityRef];
        if (!safeId(capabilityRef) || !isObject(provider)) return;
        index.set(capabilityRef, {
          capabilityRef,
          widgetId: safeId(provider.widgetId) ? provider.widgetId : null,
          availability: provider.availability || null
        });
      });
    }
    return index;
  }

  function externalProvider(entry, inlineBlocks, capabilities) {
    const blockSpecific = inlineBlocks.map(function (block) {
      return block.specialistCapabilityRef;
    }).filter(function (value) { return typeof value === 'string'; });
    const candidates = unique(blockSpecific.concat(entry.capabilityRefs || []));
    for (const capabilityRef of candidates) {
      if (capabilities.has(capabilityRef)) return capabilities.get(capabilityRef);
    }
    return null;
  }

  function resolvePolicy(lesson, blockPolicy, inputContext) {
    const context = isObject(inputContext) ? inputContext : {};
    const lessonType = lesson?.metadata?.lessonType;
    const tableResult = policyTable(blockPolicy, lessonType, context.lessonMode || null);
    if (!tableResult.ok) return tableResult;
    const capabilities = capabilityIndex(context);
    const errors = [];
    const warnings = [];
    const conditionOutcomes = {};
    const rendered = [];
    const omittedKinds = [];
    const quarantined = [];
    for (const kind of BLOCK_ORDER) {
      const entry = tableResult.table[kind];
      const inlineBlocks = blocksOf(lesson, kind);
      const condition = entry.requirement === 'conditional'
        ? conditionValue(entry.conditionRef, lesson, context)
        : null;
      if (entry.requirement === 'conditional') {
        conditionOutcomes[entry.conditionRef] = condition;
        if (condition === null) {
          errors.push({
            code: 'UNKNOWN_CONDITION',
            kind,
            conditionRef: entry.conditionRef
          });
          continue;
        }
      }
      const effectiveRequirement = entry.requirement === 'conditional'
        ? (condition ? 'required' : 'optional')
        : entry.requirement;
      const provider = externalProvider(entry, inlineBlocks, capabilities);
      const inlineAllowed = entry.fulfillment === 'inline' || entry.fulfillment === 'either';
      const externalAllowed = entry.fulfillment === 'external' || entry.fulfillment === 'either';
      if (effectiveRequirement === 'forbidden') {
        if (inlineBlocks.length || provider) {
          const blockIds = inlineBlocks.map(function (block) { return block.id; });
          quarantined.push.apply(quarantined, blockIds);
          errors.push({
            code: 'FORBIDDEN_BLOCK_PRESENT',
            kind,
            blockIds,
            provider: provider || null
          });
        } else {
          omittedKinds.push(kind);
        }
        continue;
      }
      if (entry.fulfillment === 'external' && inlineBlocks.length && !provider) {
        errors.push({
          code: 'EXTERNAL_CAPABILITY_UNAVAILABLE',
          kind,
          requiredCapabilities: entry.capabilityRefs,
          blockIds: inlineBlocks.map(function (block) { return block.id; })
        });
        continue;
      }
      let mode = null;
      if (entry.fulfillment === 'external' && provider) mode = 'external';
      if (entry.fulfillment === 'inline' && inlineBlocks.length) mode = 'inline';
      if (entry.fulfillment === 'either') {
        if (context.preferSpecialist === true && provider) mode = 'external';
        else if (inlineBlocks.length) mode = 'inline';
        else if (provider) mode = 'external';
      }
      if (!mode && effectiveRequirement === 'required') {
        errors.push({
          code: entry.fulfillment === 'external'
            ? 'MISSING_EXTERNAL_CAPABILITY'
            : 'MISSING_REQUIRED_BLOCK',
          kind,
          fulfillment: entry.fulfillment,
          requiredCapabilities: entry.capabilityRefs
        });
        continue;
      }
      if (!mode) {
        omittedKinds.push(kind);
        continue;
      }
      if (mode === 'inline' && !inlineAllowed) {
        errors.push({ code: 'INLINE_FULFILLMENT_FORBIDDEN', kind });
        continue;
      }
      if (mode === 'external' && !externalAllowed) {
        errors.push({ code: 'EXTERNAL_FULFILLMENT_FORBIDDEN', kind });
        continue;
      }
      if (mode === 'inline') {
        inlineBlocks.forEach(function (block) {
          rendered.push({
            id: block.id,
            kind,
            mode: 'inline',
            label: BLOCK_LABELS[kind],
            payload: clone(block.payload, {}),
            presentationHint: clone(block.presentationHint, {}),
            evidenceRefs: clone(block.evidenceRefs, []),
            offlineRef: block.offlineRef,
            sourceBindingCount: Array.isArray(block.sourceBindings) ? block.sourceBindings.length : 0
          });
        });
      } else {
        rendered.push({
          id: inlineBlocks[0]?.id || 'external-' + kind + '-' + provider.capabilityRef,
          kind,
          mode: 'external',
          label: BLOCK_LABELS[kind],
          capabilityRef: provider.capabilityRef,
          widgetId: provider.widgetId,
          availability: provider.availability || null,
          evidenceRefs: unique(inlineBlocks.flatMap(function (block) { return block.evidenceRefs || []; })),
          offlineRef: inlineBlocks[0]?.offlineRef || lesson?.offline?.deterministicFallbackRef || null
        });
      }
      if (effectiveRequirement === 'optional' && entry.requirement === 'conditional' && condition === false) {
        warnings.push({
          code: 'CONDITIONAL_FALSE_CONTENT_RETAINED',
          kind,
          message: 'Present source content remains visible but was not required by the condition.'
        });
      }
    }
    const kindRank = Object.fromEntries(BLOCK_ORDER.map(function (kind, index) { return [kind, index]; }));
    rendered.sort(function (left, right) {
      const byKind = kindRank[left.kind] - kindRank[right.kind];
      return byKind || String(left.id).localeCompare(String(right.id));
    });
    return {
      ok: errors.length === 0,
      blocked: errors.length > 0,
      code: errors.length ? 'POLICY_BLOCKED' : 'POLICY_RESOLVED',
      lessonType,
      lessonMode: context.lessonMode || null,
      renderedBlocks: rendered,
      omittedKinds,
      quarantinedBlockIds: quarantined,
      conditionOutcomes,
      errors,
      warnings,
      policyTable: tableResult.table
    };
  }

  function chooseStrategy(renderedBlocks, requestedStrategy) {
    if (STRATEGIES.includes(requestedStrategy)) return requestedStrategy;
    for (const block of renderedBlocks) {
      const hint = block.presentationHint?.preferredStrategy;
      if (STRATEGIES.includes(hint)) return hint;
    }
    return 'inline-flow';
  }

  function buildRenderModel(lesson, schema, blockPolicy, inputContext) {
    const context = isObject(inputContext) ? inputContext : {};
    if (context.apply === true || context.write === true || context.commit === true
      || context.persist === true || context.activate === true) {
      return blocked('B10_PLAN_ONLY', 'B10 renderer is pure and cannot activate or write runtime state.', null);
    }
    const validation = validator.validateLesson(lesson, schema);
    if (!validation.valid) {
      return blocked('INVALID_CANONICAL_LESSON', 'Renderer input failed the locked B8 schema and semantic validator.', validation);
    }
    const policy = resolvePolicy(lesson, blockPolicy, context);
    if (!policy.ok) {
      return {
        ok: false,
        blocked: true,
        code: 'POLICY_BLOCKED',
        message: 'Canonical lesson does not satisfy the resolved B3 policy.',
        validation,
        policy,
        model: null
      };
    }
    const reviewPreview = context.reviewPreview === true;
    const metadata = lesson.metadata;
    const titles = clone(metadata.titles, {});
    const strategy = chooseStrategy(policy.renderedBlocks, context.strategy);
    const model = {
      modelVersion: '1.0.0',
      state: reviewPreview ? 'REVIEW_PREVIEW_READY' : 'CANONICAL_RENDER_READY',
      reviewPreview,
      masterReadyClaimed: false,
      masterReadyAuthority: 'external-b5-policy-only',
      lessonDigest: validation.digest,
      lessonId: metadata.lessonId,
      subjectId: metadata.subjectId,
      lessonType: metadata.lessonType,
      title: titles.primary,
      titles,
      stageId: metadata.stageId,
      estimatedMinutes: metadata.estimatedMinutes || null,
      strategy,
      programIdentity: clone(metadata.programIdentity, {}),
      sourceIdentity: clone(metadata.sourceIdentity, {}),
      prerequisites: clone(lesson.prerequisites, []),
      objectives: clone(lesson.objectives, []),
      sections: clone(policy.renderedBlocks, []),
      masteryEvidence: context.lessonMode === 'orientation-only'
        ? []
        : clone(lesson.masteryEvidence, []),
      offline: clone(lesson.offline, {}),
      provenanceSummary: {
        sourceRefs: lesson.provenance.sourceRefs.length,
        userEvidenceRefs: lesson.provenance.userEvidenceRefs.length,
        systemDerivedRefs: lesson.provenance.systemDerivedRefs.length,
        aiInferenceRefs: lesson.provenance.aiInferenceRefs.length
      },
      policyEvidence: {
        lessonMode: policy.lessonMode,
        suppressedMasteryEvidenceCount: context.lessonMode === 'orientation-only'
          ? lesson.masteryEvidence.length
          : 0,
        omittedKinds: policy.omittedKinds,
        conditionOutcomes: policy.conditionOutcomes,
        warnings: policy.warnings
      }
    };
    return {
      ok: true,
      blocked: false,
      code: model.state,
      validation,
      policy,
      model,
      modelDigest: validator.hash256(model)
    };
  }

  function keyLabel(key) {
    return String(key)
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[-_]+/g, ' ')
      .replace(/^./, function (character) { return character.toUpperCase(); });
  }

  function redact(value, protect) {
    if (Array.isArray(value)) return value.map(function (item) { return redact(item, protect); });
    if (!isObject(value)) return value;
    const out = {};
    Object.keys(value).forEach(function (key) {
      const normalized = key.replace(/[-_]/g, '').toLocaleLowerCase();
      out[key] = protect && PROTECTED_KEYS.has(normalized)
        ? '[protected-until-submit]'
        : redact(value[key], protect);
    });
    return out;
  }

  function renderValue(value, depth) {
    const level = Number.isInteger(depth) ? depth : 0;
    if (value === null || value === undefined || value === '') {
      return '<span class="ul-empty">Chưa có giá trị</span>';
    }
    if (Array.isArray(value)) {
      return '<ol class="ul-value-list">' + value.map(function (item) {
        return '<li>' + renderValue(item, level + 1) + '</li>';
      }).join('') + '</ol>';
    }
    if (isObject(value)) {
      return '<dl class="ul-value-map">' + Object.keys(value).sort().map(function (key) {
        return '<div><dt>' + escapeHtml(keyLabel(key)) + '</dt><dd>'
          + renderValue(value[key], level + 1) + '</dd></div>';
      }).join('') + '</dl>';
    }
    if (typeof value === 'boolean') return '<span>' + (value ? 'Có' : 'Không') + '</span>';
    return '<span>' + escapeHtml(value) + '</span>';
  }

  function renderPrerequisites(prerequisites) {
    if (!prerequisites.length) return '';
    return '<section class="ul-support" aria-labelledby="ul-prerequisites"><h2 id="ul-prerequisites">Điều kiện chuẩn bị</h2><ul>'
      + prerequisites.map(function (item) {
        const statement = item.legacyStatement || item.title || item.targetRef;
        return '<li><b>' + escapeHtml(statement) + '</b><span>'
          + escapeHtml(item.relation + ' · ' + item.requiredState) + '</span></li>';
      }).join('') + '</ul></section>';
  }

  function renderObjectives(objectives) {
    return '<section class="ul-support" aria-labelledby="ul-objectives"><h2 id="ul-objectives">Mục tiêu học tập</h2><ol>'
      + objectives.map(function (item) {
        return '<li><b>' + escapeHtml(item.statement) + '</b><span>'
          + escapeHtml((item.evidenceKinds || []).join(' · ')) + '</span></li>';
      }).join('') + '</ol></section>';
  }

  function renderSection(section, options) {
    const id = safeId(section.id) ? section.id : 'block-' + validator.hash32(section.id);
    const anchor = 'ul-block-' + id;
    if (section.mode === 'external') {
      return '<section class="ul-block ul-block-external" id="' + escapeHtml(anchor)
        + '" data-block-kind="' + escapeHtml(section.kind) + '"><header><span>Chuyên biệt</span><h2>'
        + escapeHtml(section.label) + '</h2></header><p>Phần này do engine môn học cung cấp.</p><button type="button"'
        + ' data-universal-action="open-specialist" data-capability-ref="'
        + escapeHtml(section.capabilityRef) + '"'
        + (section.widgetId ? ' data-widget-id="' + escapeHtml(section.widgetId) + '"' : '')
        + '>Mở công cụ môn học</button></section>';
    }
    const activeOfficial = options.activeOfficialAttempt === true
      || (section.kind === 'assessment'
        && section.payload?.disclosureMode === 'official-attempt'
        && options.attemptSubmitted !== true);
    const payload = redact(section.payload, activeOfficial);
    return '<section class="ul-block" id="' + escapeHtml(anchor)
      + '" data-block-kind="' + escapeHtml(section.kind) + '"><header><span>'
      + escapeHtml(section.kind) + '</span><h2>' + escapeHtml(section.label)
      + '</h2></header><div class="ul-block-content">' + renderValue(payload, 0)
      + '</div></section>';
  }

  function renderToHtml(model, inputOptions) {
    const options = isObject(inputOptions) ? inputOptions : {};
    if (!isObject(model)
      || !['CANONICAL_RENDER_READY', 'REVIEW_PREVIEW_READY'].includes(model.state)
      || !Array.isArray(model.sections)) {
      return blocked('INVALID_RENDER_MODEL', 'HTML renderer accepts only a ready B10 render model.', null);
    }
    const inspection = validator.inspectJsonValue(model, validator.defaultLimits);
    if (inspection.errors.length) {
      return blocked('UNSAFE_RENDER_MODEL', 'Render model failed JSON safety inspection.', inspection.errors);
    }
    const navigation = model.sections.map(function (section) {
      const id = safeId(section.id) ? section.id : 'block-' + validator.hash32(section.id);
      return '<li><a href="#ul-block-' + escapeHtml(id) + '">' + escapeHtml(section.label) + '</a></li>';
    }).join('');
    const preview = model.reviewPreview
      ? '<aside class="ul-review-banner" role="status"><b>Bản xem trước cần review</b><span>Không ghi tiến độ và không tạo bằng chứng Master-ready.</span></aside>'
      : '';
    const html = '<article class="universal-lesson ul-strategy-' + escapeHtml(model.strategy)
      + '" data-universal-lesson="' + escapeHtml(model.lessonId)
      + '" data-lesson-type="' + escapeHtml(model.lessonType) + '">' + preview
      + '<header class="ul-hero"><div><span class="ul-program">Bauman · '
      + escapeHtml(model.programIdentity.department) + ' · '
      + escapeHtml(model.programIdentity.personalizedDisplayCode)
      + '</span><h1>' + escapeHtml(model.title) + '</h1><p>'
      + escapeHtml(model.lessonType + ' · ' + model.stageId)
      + (model.estimatedMinutes ? ' · ' + escapeHtml(model.estimatedMinutes) + ' phút' : '')
      + '</p></div></header>'
      + '<div class="ul-support-grid">' + renderObjectives(model.objectives)
      + renderPrerequisites(model.prerequisites) + '</div>'
      + '<nav class="ul-section-nav" aria-label="Các phần bài học"><ol>' + navigation + '</ol></nav>'
      + '<div class="ul-flow">' + model.sections.map(function (section) {
        return renderSection(section, options);
      }).join('') + '</div>'
      + '<footer class="ul-footer"><span>Nguồn: '
      + escapeHtml(model.sourceIdentity.sourceArtifactId || 'registered-source')
      + '</span><span>Master-ready: do policy B5 và verifier bên ngoài quyết định</span></footer></article>';
    return {
      ok: true,
      blocked: false,
      code: 'HTML_RENDERED',
      html,
      htmlDigest: validator.hash256({ html }),
      lessonId: model.lessonId,
      reviewPreview: model.reviewPreview,
      masterReadyClaimed: false
    };
  }

  global.BaumanUniversalLessonRenderer = Object.freeze({
    release: RELEASE,
    strategies: STRATEGIES,
    blockOrder: BLOCK_ORDER,
    blockLabels: BLOCK_LABELS,
    lessonModes: LESSON_MODES,
    escapeHtml,
    policyTable,
    resolvePolicy,
    buildRenderModel,
    renderToHtml
  });
})(typeof window !== 'undefined' ? window : globalThis);
