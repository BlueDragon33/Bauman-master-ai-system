(function (global) {
  'use strict';

  const RELEASE = 'L6-B8-LESSON-SCHEMA-VALIDATOR-V1';
  const SUPPORTED_SCHEMA_VERSION = '2.0.0';
  const DEFAULT_LIMITS = Object.freeze({
    maxDepth: 40,
    maxNodes: 100000,
    maxErrors: 100,
    maxSerializedBytes: 8 * 1024 * 1024,
    maxStringLength: 2 * 1024 * 1024
  });
  const FORBIDDEN_OBJECT_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
  const FORBIDDEN_CREDENTIAL_KEYS = new Set([
    'password',
    'passwd',
    'secret',
    'apikey',
    'accesstoken',
    'refreshtoken',
    'privatekey'
  ]);
  const TYPE_EVIDENCE_OUTPUTS = Object.freeze({
    language: Object.freeze([
      'comprehension-response',
      'dialogue-turn',
      'shadowing-attempt',
      'oral-response',
      'written-response',
      'retention-check'
    ]),
    mathematics: Object.freeze([
      'mathematical-solution',
      'derivation',
      'result-verification',
      'simulation-result',
      'oral-response',
      'retention-check'
    ]),
    programming: Object.freeze([
      'code',
      'passing-tests',
      'debug-trace',
      'complexity-explanation',
      'repository-artifact',
      'oral-response'
    ]),
    database: Object.freeze([
      'schema-artifact',
      'query-result',
      'normalization-proof',
      'transaction-analysis',
      'query-plan-analysis',
      'oral-response'
    ]),
    'software-design': Object.freeze([
      'requirements-artifact',
      'uml-artifact',
      'architecture-artifact',
      'tradeoff-record',
      'traceability-matrix',
      'oral-defense'
    ]),
    'ml-data': Object.freeze([
      'dataset-artifact',
      'experiment-log',
      'model-result',
      'metric-analysis',
      'error-analysis',
      'reproducibility-record',
      'oral-response'
    ]),
    'asoiu-system': Object.freeze([
      'system-model',
      'architecture-artifact',
      'information-flow-analysis',
      'reliability-analysis',
      'lifecycle-analysis',
      'oral-defense'
    ]),
    research: Object.freeze([
      'research-question',
      'literature-matrix',
      'experiment-protocol',
      'research-note',
      'result-analysis',
      'scientific-section',
      'nir-milestone',
      'vkr-milestone',
      'oral-defense'
    ])
  });

  function isObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function jsonType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (Number.isInteger(value)) return 'integer';
    return typeof value;
  }

  function stableStringify(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    return '{' + Object.keys(value).sort().map(function (key) {
      return JSON.stringify(key) + ':' + stableStringify(value[key]);
    }).join(',') + '}';
  }

  function hash32(value) {
    const text = typeof value === 'string' ? value : stableStringify(value);
    let hash = 0x811c9dc5;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
  }

  function utf8Bytes(value) {
    if (typeof TextEncoder === 'function') return Array.from(new TextEncoder().encode(value));
    const encoded = unescape(encodeURIComponent(value));
    return Array.from(encoded, function (character) { return character.charCodeAt(0); });
  }

  function rotateRight(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  function hash256(value) {
    const text = typeof value === 'string' ? value : stableStringify(value);
    if (typeof text !== 'string') throw new TypeError('Hash input must be a stable JSON value or string.');
    const bytes = utf8Bytes(text);
    const bitLength = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    const high = Math.floor(bitLength / 0x100000000);
    const low = bitLength >>> 0;
    for (let shift = 24; shift >= 0; shift -= 8) bytes.push((high >>> shift) & 0xff);
    for (let shift = 24; shift >= 0; shift -= 8) bytes.push((low >>> shift) & 0xff);

    const constants = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    const state = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];

    for (let offset = 0; offset < bytes.length; offset += 64) {
      const words = new Uint32Array(64);
      for (let index = 0; index < 16; index += 1) {
        const start = offset + index * 4;
        words[index] = (
          (bytes[start] << 24)
          | (bytes[start + 1] << 16)
          | (bytes[start + 2] << 8)
          | bytes[start + 3]
        ) >>> 0;
      }
      for (let index = 16; index < 64; index += 1) {
        const sigma0 = rotateRight(words[index - 15], 7)
          ^ rotateRight(words[index - 15], 18)
          ^ (words[index - 15] >>> 3);
        const sigma1 = rotateRight(words[index - 2], 17)
          ^ rotateRight(words[index - 2], 19)
          ^ (words[index - 2] >>> 10);
        words[index] = (words[index - 16] + sigma0 + words[index - 7] + sigma1) >>> 0;
      }

      let a = state[0];
      let b = state[1];
      let c = state[2];
      let d = state[3];
      let e = state[4];
      let f = state[5];
      let g = state[6];
      let h = state[7];
      for (let index = 0; index < 64; index += 1) {
        const sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
        const choose = (e & f) ^ (~e & g);
        const temp1 = (h + sum1 + choose + constants[index] + words[index]) >>> 0;
        const sum0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
        const majority = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (sum0 + majority) >>> 0;
        h = g;
        g = f;
        f = e;
        e = (d + temp1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) >>> 0;
      }
      state[0] = (state[0] + a) >>> 0;
      state[1] = (state[1] + b) >>> 0;
      state[2] = (state[2] + c) >>> 0;
      state[3] = (state[3] + d) >>> 0;
      state[4] = (state[4] + e) >>> 0;
      state[5] = (state[5] + f) >>> 0;
      state[6] = (state[6] + g) >>> 0;
      state[7] = (state[7] + h) >>> 0;
    }
    return state.map(function (word) { return word.toString(16).padStart(8, '0'); }).join('');
  }

  function pointerSegment(value) {
    return String(value).replace(/~/g, '~0').replace(/\//g, '~1');
  }

  function childPath(parent, key) {
    return parent + '/' + pointerSegment(key);
  }

  function sameValue(left, right) {
    try {
      return stableStringify(left) === stableStringify(right);
    } catch (_) {
      return left === right;
    }
  }

  function normalizeLimits(input) {
    const source = isObject(input) ? input : {};
    const limits = {};
    Object.keys(DEFAULT_LIMITS).forEach(function (key) {
      const value = Number(source[key]);
      limits[key] = Number.isFinite(value) && value > 0
        ? Math.floor(value)
        : DEFAULT_LIMITS[key];
    });
    return limits;
  }

  function errorItem(path, keyword, message, details) {
    return {
      path: path || '/',
      keyword,
      message,
      details: details === undefined ? null : details
    };
  }

  function inspectJsonValue(value, limits) {
    const errors = [];
    const warnings = [];
    const seen = new Set();
    let nodes = 0;
    let maximumDepth = 0;
    let serializedBytes = 0;

    try {
      const encoded = JSON.stringify(value);
      if (encoded === undefined) {
        errors.push(errorItem('/', 'json-value', 'Value is not JSON serializable.'));
      } else {
        serializedBytes = typeof TextEncoder === 'function'
          ? new TextEncoder().encode(encoded).length
          : unescape(encodeURIComponent(encoded)).length;
        if (serializedBytes > limits.maxSerializedBytes) {
          errors.push(errorItem('/', 'maxSerializedBytes', 'Serialized lesson exceeds the configured byte limit.', {
            actual: serializedBytes,
            maximum: limits.maxSerializedBytes
          }));
        }
      }
    } catch (error) {
      errors.push(errorItem('/', 'json-value', 'Lesson cannot be serialized as acyclic JSON.', String(error && error.message || error)));
    }

    function visit(node, path, depth) {
      if (errors.length >= limits.maxErrors) return;
      nodes += 1;
      maximumDepth = Math.max(maximumDepth, depth);
      if (nodes > limits.maxNodes) {
        errors.push(errorItem(path, 'maxNodes', 'Lesson exceeds the configured node limit.', {
          actual: nodes,
          maximum: limits.maxNodes
        }));
        return;
      }
      if (depth > limits.maxDepth) {
        errors.push(errorItem(path, 'maxDepth', 'Lesson exceeds the configured nesting depth.', {
          actual: depth,
          maximum: limits.maxDepth
        }));
        return;
      }
      if (typeof node === 'string') {
        if (node.length > limits.maxStringLength) {
          errors.push(errorItem(path, 'maxStringLength', 'String exceeds the configured character limit.', {
            actual: node.length,
            maximum: limits.maxStringLength
          }));
        }
        return;
      }
      if (typeof node === 'number') {
        if (!Number.isFinite(node)) {
          errors.push(errorItem(path, 'finite-number', 'NaN and infinite values are not valid JSON numbers.'));
        }
        return;
      }
      if (node === null || typeof node === 'boolean') return;
      if (typeof node === 'undefined' || typeof node === 'function' || typeof node === 'symbol' || typeof node === 'bigint') {
        errors.push(errorItem(path, 'json-value', 'Unsupported non-JSON value type: ' + typeof node + '.'));
        return;
      }
      if (typeof node !== 'object') return;
      if (seen.has(node)) {
        errors.push(errorItem(path, 'cycle', 'Cyclic object references are not valid lesson JSON.'));
        return;
      }
      seen.add(node);
      if (Array.isArray(node)) {
        node.forEach(function (item, index) {
          visit(item, childPath(path, index), depth + 1);
        });
      } else {
        const prototype = Object.getPrototypeOf(node);
        const isPlainAcrossRealms = prototype === null || Object.getPrototypeOf(prototype) === null;
        if (!isPlainAcrossRealms || Object.prototype.toString.call(node) !== '[object Object]') {
          errors.push(errorItem(path, 'plain-object', 'Lesson objects must be plain JSON objects.'));
        }
        Object.keys(node).forEach(function (key) {
          const lowerKey = key.replace(/[-_]/g, '').toLowerCase();
          if (FORBIDDEN_OBJECT_KEYS.has(key)) {
            errors.push(errorItem(childPath(path, key), 'forbidden-key', 'Prototype-control key is forbidden.'));
          }
          if (FORBIDDEN_CREDENTIAL_KEYS.has(lowerKey)) {
            errors.push(errorItem(childPath(path, key), 'credential-key', 'Credential-like fields do not belong in lesson content.'));
          }
          visit(node[key], childPath(path, key), depth + 1);
        });
      }
      seen.delete(node);
    }

    visit(value, '', 0);
    if (errors.length >= limits.maxErrors) {
      warnings.push({ code: 'MAX_ERRORS_REACHED', message: 'Validation stopped at the configured error limit.' });
    }
    return {
      errors: errors.slice(0, limits.maxErrors),
      warnings,
      metrics: {
        nodes,
        maximumDepth,
        serializedBytes
      }
    };
  }

  function decodeRefSegment(value) {
    return value.replace(/~1/g, '/').replace(/~0/g, '~');
  }

  function resolveLocalRef(rootSchema, reference) {
    if (typeof reference !== 'string' || !reference.startsWith('#/')) return null;
    const parts = reference.slice(2).split('/').map(decodeRefSegment);
    let current = rootSchema;
    for (const part of parts) {
      if (!isObject(current) || !Object.prototype.hasOwnProperty.call(current, part)) return null;
      current = current[part];
    }
    return current;
  }

  function typeMatches(value, expected) {
    const actual = jsonType(value);
    if (expected === 'number') return actual === 'number' || actual === 'integer';
    if (expected === 'object') return isObject(value);
    return actual === expected;
  }

  function validateAgainstSchema(value, rootSchema, limits) {
    const errors = [];

    function push(path, keyword, message, details) {
      if (errors.length < limits.maxErrors) errors.push(errorItem(path, keyword, message, details));
    }

    function run(node, schema, path, refStack) {
      if (errors.length >= limits.maxErrors || !isObject(schema)) return;
      if (schema.$ref) {
        const target = resolveLocalRef(rootSchema, schema.$ref);
        if (!target) {
          push(path, '$ref', 'Only resolvable local schema references are allowed.', schema.$ref);
          return;
        }
        if (refStack.includes(schema.$ref)) {
          push(path, '$ref-cycle', 'Schema reference cycle is not supported by the compact validator.', schema.$ref);
          return;
        }
        run(node, target, path, refStack.concat(schema.$ref));
        return;
      }

      if (Array.isArray(schema.anyOf)) {
        let matches = 0;
        for (const candidate of schema.anyOf) {
          const checkpoint = errors.length;
          run(node, candidate, path, refStack);
          if (errors.length === checkpoint) matches += 1;
          else errors.splice(checkpoint);
        }
        if (matches === 0) push(path, 'anyOf', 'Value does not satisfy any allowed schema branch.');
      }
      if (Array.isArray(schema.oneOf)) {
        let matches = 0;
        for (const candidate of schema.oneOf) {
          const checkpoint = errors.length;
          run(node, candidate, path, refStack);
          if (errors.length === checkpoint) matches += 1;
          else errors.splice(checkpoint);
        }
        if (matches !== 1) push(path, 'oneOf', 'Value must satisfy exactly one schema branch.', { matches });
      }

      if (schema.type !== undefined) {
        const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
        if (!expectedTypes.some(function (expected) { return typeMatches(node, expected); })) {
          push(path, 'type', 'Expected ' + expectedTypes.join('|') + ' but received ' + jsonType(node) + '.', {
            expected: expectedTypes,
            actual: jsonType(node)
          });
          return;
        }
      }
      if (Object.prototype.hasOwnProperty.call(schema, 'const') && !sameValue(node, schema.const)) {
        push(path, 'const', 'Value must equal the schema constant.', schema.const);
      }
      if (Array.isArray(schema.enum) && !schema.enum.some(function (candidate) { return sameValue(node, candidate); })) {
        push(path, 'enum', 'Value is not in the allowed vocabulary.', schema.enum);
      }

      if (typeof node === 'string') {
        if (Number.isFinite(schema.minLength) && node.length < schema.minLength) {
          push(path, 'minLength', 'String is shorter than the minimum length.', schema.minLength);
        }
        if (Number.isFinite(schema.maxLength) && node.length > schema.maxLength) {
          push(path, 'maxLength', 'String is longer than the maximum length.', schema.maxLength);
        }
        if (typeof schema.pattern === 'string') {
          let expression = null;
          try { expression = new RegExp(schema.pattern); } catch (_) {}
          if (!expression || !expression.test(node)) {
            push(path, 'pattern', 'String does not match the required pattern.', schema.pattern);
          }
        }
      }
      if (typeof node === 'number' && Number.isFinite(node)) {
        if (Number.isFinite(schema.minimum) && node < schema.minimum) {
          push(path, 'minimum', 'Number is below the minimum.', schema.minimum);
        }
        if (Number.isFinite(schema.maximum) && node > schema.maximum) {
          push(path, 'maximum', 'Number is above the maximum.', schema.maximum);
        }
      }
      if (Array.isArray(node)) {
        if (Number.isFinite(schema.minItems) && node.length < schema.minItems) {
          push(path, 'minItems', 'Array contains too few items.', schema.minItems);
        }
        if (Number.isFinite(schema.maxItems) && node.length > schema.maxItems) {
          push(path, 'maxItems', 'Array contains too many items.', schema.maxItems);
        }
        if (schema.uniqueItems === true) {
          const seen = new Set();
          node.forEach(function (item, index) {
            const key = stableStringify(item);
            if (seen.has(key)) push(childPath(path, index), 'uniqueItems', 'Array item is duplicated.');
            seen.add(key);
          });
        }
        if (isObject(schema.items)) {
          node.forEach(function (item, index) {
            run(item, schema.items, childPath(path, index), refStack);
          });
        }
      }
      if (isObject(node)) {
        const keys = Object.keys(node);
        if (Number.isFinite(schema.minProperties) && keys.length < schema.minProperties) {
          push(path, 'minProperties', 'Object contains too few properties.', schema.minProperties);
        }
        if (Array.isArray(schema.required)) {
          schema.required.forEach(function (key) {
            if (!Object.prototype.hasOwnProperty.call(node, key)) {
              push(childPath(path, key), 'required', 'Required property is missing.');
            }
          });
        }
        const properties = isObject(schema.properties) ? schema.properties : {};
        keys.forEach(function (key) {
          if (Object.prototype.hasOwnProperty.call(properties, key)) {
            run(node[key], properties[key], childPath(path, key), refStack);
          } else if (schema.additionalProperties === false) {
            push(childPath(path, key), 'additionalProperties', 'Unknown property is not allowed.');
          } else if (isObject(schema.additionalProperties)) {
            run(node[key], schema.additionalProperties, childPath(path, key), refStack);
          }
        });
      }
    }

    run(value, rootSchema, '', []);
    return errors.slice(0, limits.maxErrors);
  }

  function duplicateIdErrors(list, path) {
    const errors = [];
    const seen = new Set();
    (Array.isArray(list) ? list : []).forEach(function (item, index) {
      const id = isObject(item) ? item.id : null;
      if (typeof id !== 'string' || !id) return;
      if (seen.has(id)) {
        errors.push(errorItem(childPath(childPath('', path), index) + '/id', 'unique-id', 'Identifier is duplicated within ' + path + '.', id));
      }
      seen.add(id);
    });
    return errors;
  }

  function semanticErrors(lesson, options) {
    if (!isObject(lesson)) return [];
    const errors = [];
    const metadata = isObject(lesson.metadata) ? lesson.metadata : {};
    const typeId = metadata.lessonType;
    const evidenceMap = isObject(options.typeEvidenceOutputs)
      ? options.typeEvidenceOutputs
      : TYPE_EVIDENCE_OUTPUTS;
    const allowedEvidence = new Set(evidenceMap[typeId] || []);

    errors.push.apply(errors, duplicateIdErrors(lesson.prerequisites, 'prerequisites'));
    errors.push.apply(errors, duplicateIdErrors(lesson.objectives, 'objectives'));
    errors.push.apply(errors, duplicateIdErrors(lesson.blocks, 'blocks'));
    errors.push.apply(errors, duplicateIdErrors(lesson.masteryEvidence, 'masteryEvidence'));
    errors.push.apply(errors, duplicateIdErrors(isObject(lesson.offline) ? lesson.offline.resources : [], 'offline/resources'));

    if (allowedEvidence.size) {
      (Array.isArray(lesson.objectives) ? lesson.objectives : []).forEach(function (objective, index) {
        (Array.isArray(objective && objective.evidenceKinds) ? objective.evidenceKinds : []).forEach(function (kind, kindIndex) {
          if (!allowedEvidence.has(kind)) {
            errors.push(errorItem(
              '/objectives/' + index + '/evidenceKinds/' + kindIndex,
              'type-evidence-output',
              'Objective evidence kind is not registered for lesson type ' + typeId + '.',
              kind
            ));
          }
        });
      });
      (Array.isArray(lesson.masteryEvidence) ? lesson.masteryEvidence : []).forEach(function (item, index) {
        if (item && typeof item.evidenceKind === 'string' && !allowedEvidence.has(item.evidenceKind)) {
          errors.push(errorItem(
            '/masteryEvidence/' + index + '/evidenceKind',
            'type-evidence-output',
            'Mastery evidence kind is not registered for lesson type ' + typeId + '.',
            item.evidenceKind
          ));
        }
      });
    }

    const resourceIds = new Set(
      (Array.isArray(lesson.offline && lesson.offline.resources) ? lesson.offline.resources : [])
        .map(function (item) { return item && item.id; })
        .filter(Boolean)
    );
    if (lesson.offline
      && typeof lesson.offline.deterministicFallbackRef === 'string'
      && !resourceIds.has(lesson.offline.deterministicFallbackRef)) {
      errors.push(errorItem(
        '/offline/deterministicFallbackRef',
        'offline-ref',
        'Offline deterministicFallbackRef does not resolve to lesson.offline.resources.',
        lesson.offline.deterministicFallbackRef
      ));
    }
    (Array.isArray(lesson.blocks) ? lesson.blocks : []).forEach(function (block, index) {
      if (block && typeof block.offlineRef === 'string' && !resourceIds.has(block.offlineRef)) {
        errors.push(errorItem(
          '/blocks/' + index + '/offlineRef',
          'offline-ref',
          'Block offlineRef does not resolve to lesson.offline.resources.',
          block.offlineRef
        ));
      }
    });

    if (metadata.contractVersion && metadata.contractVersion !== SUPPORTED_SCHEMA_VERSION) {
      errors.push(errorItem('/metadata/contractVersion', 'supported-version', 'Lesson contract version is not supported by this validator.', {
        expected: SUPPORTED_SCHEMA_VERSION,
        actual: metadata.contractVersion
      }));
    }
    return errors;
  }

  function validateSchemaDefinition(schema) {
    const errors = [];
    if (!isObject(schema)) {
      errors.push(errorItem('/', 'schema-object', 'Schema must be a JSON object.'));
      return { valid: false, errors };
    }
    if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
      errors.push(errorItem('/$schema', '$schema', 'Schema draft must be JSON Schema 2020-12.'));
    }
    if (typeof schema.$id !== 'string' || !schema.$id) {
      errors.push(errorItem('/$id', '$id', 'Schema has no stable identifier.'));
    }
    const stack = [{ value: schema, path: '' }];
    while (stack.length) {
      const current = stack.pop();
      if (current.value === null || typeof current.value !== 'object') continue;
      if (isObject(current.value) && typeof current.value.$ref === 'string') {
        if (!current.value.$ref.startsWith('#/') || !resolveLocalRef(schema, current.value.$ref)) {
          errors.push(errorItem(childPath(current.path, '$ref'), '$ref', 'Schema references must resolve locally.', current.value.$ref));
        }
      }
      Object.keys(current.value).forEach(function (key) {
        stack.push({ value: current.value[key], path: childPath(current.path, key) });
      });
    }
    return { valid: errors.length === 0, errors };
  }

  function validateLesson(lesson, schema, inputOptions) {
    const options = isObject(inputOptions) ? inputOptions : {};
    const limits = normalizeLimits(options.limits);
    const schemaResult = validateSchemaDefinition(schema);
    const inspection = inspectJsonValue(lesson, limits);
    let errors = schemaResult.errors.concat(inspection.errors);
    if (!errors.length) errors = errors.concat(validateAgainstSchema(lesson, schema, limits));
    if (!errors.length) errors = errors.concat(semanticErrors(lesson, options));
    errors = errors.slice(0, limits.maxErrors);
    return {
      valid: errors.length === 0,
      schemaId: isObject(schema) ? schema.$id || null : null,
      supportedContractVersion: SUPPORTED_SCHEMA_VERSION,
      lessonId: isObject(lesson) && isObject(lesson.metadata) ? lesson.metadata.lessonId || null : null,
      lessonType: isObject(lesson) && isObject(lesson.metadata) ? lesson.metadata.lessonType || null : null,
      digestAlgorithm: 'sha256-stable-json-v1',
      digest: inspection.errors.length ? null : hash256(lesson),
      errors,
      warnings: inspection.warnings,
      metrics: inspection.metrics
    };
  }

  global.BaumanUniversalLessonValidator = Object.freeze({
    release: RELEASE,
    supportedSchemaVersion: SUPPORTED_SCHEMA_VERSION,
    defaultLimits: DEFAULT_LIMITS,
    typeEvidenceOutputs: TYPE_EVIDENCE_OUTPUTS,
    stableStringify,
    hash32,
    hash256,
    inspectJsonValue,
    validateSchemaDefinition,
    validateLesson
  });
})(typeof window !== 'undefined' ? window : globalThis);
