# L6-B8 · Universal Lesson schema, validator and version migration

Status in this record is **implementation pending remote CI** until the B8
commit status is successful. This document does not by itself declare PASS.

## 1. Decision

L6-B8 formalizes the B2 semantic contract as a machine-readable Universal
Lesson V2 instance schema and supplies a browser-native validator plus a pure,
deterministic migration planner. It does not register subjects, render lessons,
replace an existing engine, persist a candidate, or write learner state.

The target contract is `2.0.0`. The schema uses JSON Schema Draft 2020-12 and
resolves local references only. Runtime code remains dependency-free and is
published through the existing browser UMD pattern:

| Artifact | Role |
| --- | --- |
| `assets/data/lesson/schema/universal-lesson-v2.schema.json` | Canonical V2 instance shape |
| `assets/js/platform/universal-lesson/lesson-schema-validator-v1.js` | Compact schema, security and semantic validator |
| `assets/js/platform/universal-lesson/lesson-version-migrator-v1.js` | Pure dry-run candidate migration and rollback snapshot |
| `assets/data/lesson/schema/lesson-migration-registry-v1.json` | Version graph, source-family policy and invariants |
| `scripts/academic/fixtures/l6-b8/` | Valid, legacy and negative mutation fixtures |

## 2. Identity boundary

Every canonical lesson carries both codes with distinct meanings:

- official Bauman publication code: `09.04.01`;
- personalized learner display code: `09.04.01/11`;
- department: `ИУ-5`.

The schema fixes those values independently. A validator mutation that puts the
personalized code in the official field must fail.

## 3. Canonical instance envelope

The required top-level fields are metadata, prerequisites, objectives, blocks,
Master-ready evidence, contextual references, offline policy and provenance.
Unknown fields pass through so registered specialist engines can retain richer
content without weakening the common envelope.

The block vocabulary is exactly the 13 B2 semantic kinds. B3 remains the owner
of required/optional/conditional block selection per lesson type; therefore the
schema does not create placeholder blocks or require every kind. B4 remains the
owner of the eight lesson types and their evidence-output vocabularies. B5 owns
verification authority and Master-ready thresholds. B6 owns visual feedback
semantics. B7 owns latent Russian Twin and English Research hooks.

The schema validates an instance. It does not decide layout, tabs, renderer
composition, subject data resolution or whether a specialist widget exists.
Those responsibilities remain in B9 and B10.

## 4. Validator layers

Validation is fail-closed and runs in this order:

1. verify the schema definition and require resolvable local `$ref` values;
2. inspect input complexity and JSON safety;
3. evaluate the supported JSON Schema 2020-12 keywords;
4. evaluate cross-field semantic constraints.

The compact validator supports the keywords used by the committed schema:
local `$ref`, type, required, properties, additionalProperties, anyOf, oneOf,
const, enum, string/number/array/object limits and uniqueItems.

Security and resource guards reject cycles, non-plain values, unsupported JSON
types, non-finite numbers, prototype-control keys, credential-like keys,
excessive depth, excessive nodes, oversized serialization and oversized
strings. Cross-realm plain JSON remains valid so an iframe or sandbox can pass
a structured lesson without being mistaken for a class instance.

Semantic validation additionally enforces:

- unique IDs within prerequisite, objective, block, evidence and offline
  resource collections;
- evidence kinds registered for the lesson's B4 primary type;
- block `offlineRef` resolution;
- deterministic fallback resolution;
- contract version `2.0.0`.

Validation digests use SHA-256 over stable UTF-8 JSON with recursively sorted
object keys and preserved array order. The compact 32-bit hash is reserved for
non-integrity record IDs and is never accepted for rollback verification.

## 5. Migration source families

| Family | Accepted version | B8 behavior | Review |
| --- | --- | --- | --- |
| `canonical-v2` | `2.0.0` | validate and clone | no transformation review |
| `universal-v1` | `1.0.0` | produce a validated dry-run candidate | mandatory |
| `elearning-v1.1` | `elearning-v1.1` | produce a validated dry-run candidate | mandatory |
| `russian-rich-v13` | legacy rich | block with `ADAPTER_REQUIRED` | adapter work belongs to L7 |
| `math-rich-legacy` | legacy rich | block with `ADAPTER_REQUIRED` | adapter work belongs to L7 |

Source-family detection is advisory. Every non-canonical projection requires
an explicit family and the exact registered source version. Required context
binds stable subject, lesson, type, stage, source path, artifact, adapter and
content versions. Guessing from an array index is not allowed.

Russian and Mathematics content engines remain read-only reference systems in
B8. Their rich dialogue, speech, handwriting, formula, step-solution,
simulation and assessment interactions are not flattened into generic blocks.
The migrator returns the unchanged-engine fallback before any direct mapping.

Research eLearning V1.1 is exercised both with a compact fixture and against
all 45 current source lessons, but the result is still only a review candidate.
This does not activate a new Research renderer.

## 6. Pure migration and preservation

`migrate(source, context, schema, options)` never mutates `source`. Requests to
apply, commit or write are rejected with `B8_DRY_RUN_ONLY`. A successful result
contains:

- explicit source and target family/version;
- stable migration ID;
- source and output SHA-256 digests;
- schema/semantic validation evidence;
- manual-review state and warnings;
- exact source snapshot;
- preserved legacy and unmapped fields;
- canonical candidate.

The Universal V1 mapper recognizes only registered semantic kinds and aliases;
an unknown kind blocks the candidate instead of silently dropping content. The
eLearning mapper emits a block only when the corresponding legacy field has
content. It preserves wrapper metadata and unmapped payload fields inside the
versioned migration extension. Empty placeholder views are not generated.

## 7. Rollback

Rollback is local and deterministic: clone the stored source snapshot, verify
its SHA-256 against the original input digest, then return it. A modified
snapshot, modified digest algorithm or missing migration result is rejected.
No database, storage key, service worker, subject file or learner state is
changed, so B8 repository rollback is removal of the B8-only artifacts and
restoration of workflow/progress markers to the B7 checkpoint.

## 8. Gate evidence required before PASS

B8 may be marked PASS only after all of the following are observed on the same
source checkpoint:

- schema, validator, registry and fixture invariants pass;
- canonical fixture and all 45 current Research lessons validate as expected;
- negative fixtures fail for the intended reason;
- migrations are deterministic, source-preserving and rollbackable;
- write requests, ambiguous families and incomplete contexts are blocked;
- Russian and Mathematics real sources return `ADAPTER_REQUIRED` unchanged;
- mutation tests demonstrate that identity, duplicate-ID, direct-write,
  adapter and rollback protections are effective;
- B1 through B8 deterministic gates and L5 regression remain green;
- GitHub Actions publishes successful context
  `migration/l6-b8-schema-migration`.

Until that remote context succeeds, the plan and state must say B8 is pending
remote CI, not PASS.

## 9. Forward ownership

- B9 registers subject engines, lesson types, source resolvers, special widgets
  and offline policies.
- B10 implements the Universal Lesson Renderer and legacy bridges.
- B11 performs reference-subject runtime, responsive, offline and rollback
  regression.
- L7 performs reviewed Russian and Mathematics adapter projections.
- L12 owns full multilingual learner UI.
- L13 owns grounded contextual AI behavior.

No item above is claimed complete by B8.
