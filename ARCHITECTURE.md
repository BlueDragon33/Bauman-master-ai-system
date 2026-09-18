# Bauman Hub — Architecture Map

This file is the primary map for understanding, maintaining, extending, and reviewing the Bauman Hub codebase.

The architecture is named by **responsibility**, not by vague generation labels such as V2, V3, New, Latest, Final, or Next.

Technical version numbers remain allowed only where compatibility requires them, for example schema names, stored-data contracts, migration formats, or public API protocols.

## 1. Naming rules

### Architecture names

Use a descriptive responsibility name:

- `Foundation — Identity & Domain Model`
- `Foundation — Content, Asset & Provenance Registry`
- `Foundation — Learning Content Standard`
- `Hub Application Shell`
- `Shared Subject Platform`
- `Subject Web Apps`
- `Learning State & Academic Planning`
- `Access & Device Boundary`
- `Packaging & Deployment`
- `Verification & Quality Gates`

Do not use `V2`, `V3`, `new`, `latest`, `final`, or similar labels as the primary architecture name.

### Technical versions

Technical versions are still required when persisted data or external contracts must remain compatible.

Examples:

- `BAUMAN_DOMAIN_CONTRACT_V1`
- `BAUMAN_SUBJECT_BRIDGE_V1`
- `RUSSIAN_LEARNING_STATE_V1`
- `registry-contract.v1.json`

A technical version answers: **which contract format is this?**

An architecture name answers: **what responsibility does this layer own?**

These are different concepts and must not be mixed.

### Historical checkpoint codes

Codes such as L9 and L10 are retained only as historical checkpoint references.

- L9 → **Foundation — Identity & Domain Model**
- L10 → **Foundation — Content, Asset & Provenance Registry**

When writing new documents, put the responsibility name first. A checkpoint code may appear secondarily in parentheses when traceability is useful.

## 2. Architecture layers

### A. Hub Application Shell

**Responsibility:** top-level navigation, route orchestration, dashboard composition, responsive presentation, and entry into subject apps.

**Primary locations:**

- `index.html`
- `assets/js/main.js`
- `assets/js/hub-safe-shell.js`
- `assets/js/hub-safe-ux.js`
- `assets/js/hub-learning-cluster.js`
- `assets/css/`

**Must not own:**

- subject academic truth;
- mastery decisions;
- canonical identity definitions;
- content provenance authority.

### B. Access & Device Boundary

**Responsibility:** device authorization, managed access, runtime access boundary, and owner/private package access behavior.

**Primary locations:**

- `assets/js/platform/`
- `assets/js/app-manager-managed-access.js`
- related access CSS and tests.

**Change risk:** security and deployment boundary.

### C. Shared Subject Platform

**Responsibility:** common host↔subject communication and additive shared adapters.

**Primary locations:**

- `subjects/shared/host-bridge.js`
- `subjects/shared/foundation-identity-bootstrap.js`
- `subjects/shared/foundation-identity-persistence.js`
- `subjects/shared/foundation-identity-projection.js`
- `subjects/shared/foundation-canonical-context.js`

**Protected contract:** `BAUMAN_SUBJECT_BRIDGE_V1`.

### D. Foundation — Identity & Domain Model

**Responsibility:** stable canonical identity, shared domain entities, legacy-to-canonical mapping, overlay persistence, and canonical read projection.

**Primary location:**

- `foundation/domain-model/`

**Historical checkpoint:** L9.

**Authority rule:** additive compatibility layer. Existing learning state remains authoritative until a separately gated migration explicitly changes that rule.

### E. Foundation — Content, Asset & Provenance Registry

**Responsibility:** content/asset registry identity, SHA-256 asset integrity, provenance lineage, access metadata, deterministic snapshots, transactional snapshot transport, and snapshot integrity.

**Primary location:**

- `foundation/content-registry/`

**Historical checkpoint:** L10.

**Depends on:**

- Foundation — Identity & Domain Model.

**Authority rule:** runtime-neutral metadata and lineage foundation. It must not silently become learner-state authority, browser-storage authority, or a second academic database.

### F. Foundation — Content Resolution & Runtime Delivery

**Responsibility:** convert registry-backed content/asset locators into safe, deterministic runtime resource descriptors without owning academic state or transport authority.

**Primary location:**

- `foundation/content-resolution/`

**Depends on:**

- Foundation — Content, Asset & Provenance Registry;
- indirectly, Foundation — Identity & Domain Model.

**Owns:**

- locator selection rules;
- runtime resource descriptor contract;
- asset-state eligibility;
- access/integrity preconditions;
- provider requirements for content-addressed resources.

**Must not own:**

- learner state, mastery, Review Queue, SRS, schedules;
- Hub or subject routes;
- authentication or network credentials;
- registry mutation;
- implicit browser/network fetching in the core resolver.

**Current state:** Step 5 package-relative adapter active. Contract + resolver + delivery plan + injected executor are green; existing Hub, Academic, subject, and packaging loaders remain unchanged.

### G. Foundation — Learning Content Standard

**Responsibility:** reusable authoring and lesson-quality rules independent from a specific renderer.

**Primary location:**

- `foundation/learning-content/`

**Owns:** lesson authoring constraints and reusable content-component expectations.

**Does not own:** route state, mastery state, or subject-specific runtime behavior.

### H. Subject Web Apps

**Responsibility:** subject-specific learning experiences, content rendering, exercises, simulations, review behavior, and subject-local academic logic.

**Primary locations:**

- `subjects/russian/`
- `subjects/math/`
- `subjects/programming/`
- `subjects/foundation/`
- other `subjects/<subject>/` directories.

Each subject app must remain independently understandable and must communicate with the Hub through explicit shared contracts.

### I. Learning State & Academic Planning

**Responsibility:** current learner state, planning, prerequisite diagnostics, scheduling, progress, and academic roadmap behavior.

**Primary locations include:**

- `assets/js/academic-main.js`
- `assets/js/academic-scheduler-preview.js`
- `assets/js/academic-scheduler-apply.js`
- `assets/js/planning-main.js`
- subject-local state modules.

**Current authority rule:** existing learning-state contracts remain authoritative unless a dedicated migration gate explicitly promotes another model.

### J. AI Read Context & Assistance

**Responsibility:** provide AI features with explicit, policy-constrained context.

**Examples:**

- Russian AI mentor context;
- canonical read-only identity context;
- future subject assistants.

**Rule:** AI may explain, suggest, critique, draft, or simulate within policy. AI does not silently become authoritative for mastery, provenance acceptance, publication approval, or protected academic decisions.

### K. Packaging & Deployment

**Responsibility:** materialize accepted source runtime into deployable/packageable forms without changing application authority.

**Primary locations:**

- `scripts/prepare-cloudflare-preview.mjs`
- `scripts/prepare-chatgpt-site.mjs`
- deployment/configuration scripts.

Packaging must preserve the dependency chain proven in source runtime.

### L. Verification & Quality Gates

**Responsibility:** prevent architectural drift and regression.

**Primary locations:**

- `.github/workflows/`
- `tests/`
- `scripts/validate-*.mjs`

A gate must expose a real defect rather than be weakened merely to become green.

## 3. Dependency direction

Preferred dependency direction:

```text
Identity & Domain Model
        ↓
Content, Asset & Provenance Registry
        ↓
Content Resolution & Runtime Delivery
        ↓
Learning Content Standard / adapters
        ↓
Shared Subject Platform
        ↓
Subject Web Apps
        ↓
Hub Application Shell

Learning State & Academic Planning remains an explicit authority beside the subject runtimes.
AI consumes explicit read context.
Packaging copies accepted runtime.
Quality Gates verify every boundary.
```

Cross-layer dependencies must be explicit. Do not create hidden dependencies through DOM labels, filename assumptions, mutable display text, or implicit array positions.

## 4. Where to make common changes

| Change needed | Primary area | Required review focus |
| --- | --- | --- |
| Hub layout/navigation/responsive UI | `assets/js/`, `assets/css/`, root `index.html` | routes, responsive, subject access, packaged UI |
| Device/access behavior | `assets/js/platform/`, managed-access modules | authorization, owner-private boundary, regression |
| Canonical IDs/domain entities | `foundation/domain-model/` | stable IDs, compatibility, legacy preservation |
| Asset metadata/checksum/provenance | `foundation/content-registry/` | lineage, integrity, access, deterministic snapshots |
| Registry locator → runtime resource resolution | `foundation/content-resolution/` | access/integrity preconditions, locator policy, no hidden transport authority |
| Lesson-authoring standard | `foundation/learning-content/` | pedagogy, accessibility, renderer independence |
| Russian learning behavior | `subjects/russian/` | Russian contracts, SRS/review/mastery preservation |
| Math learning behavior | `subjects/math/` | accepted lesson/runtime gates, academic content |
| Host↔subject protocol | `subjects/shared/` | `BAUMAN_SUBJECT_BRIDGE_V1` compatibility |
| Planning/prerequisites/scheduling | academic/planning modules | learner-state authority, scheduler safety |
| Deployment/package content | `scripts/prepare-*.mjs` | dependency completeness, source/package parity |
| Regression or architecture gate | `.github/workflows/`, `tests/`, validators | fail-closed behavior, no weakened assertions |

## 5. Upgrade procedure

Every architecture upgrade should follow this order:

1. Identify the owning layer by responsibility.
2. Verify which lower layers it depends on.
3. Create a branch named by area and capability, not by generation number.
4. Make the smallest additive change possible.
5. Add or update the local contract, validator, negative tests, and audit when architecture behavior changes.
6. Run the layer-specific gate.
7. Run cross-system and packaged-runtime gates.
8. Update this architecture map if ownership or dependency direction changed.
9. Freeze/promote only after the same head is green.
10. Merge to `main` only through an explicit promotion decision.

## 6. Branch naming

Preferred:

- `work/foundation-content-provenance`
- `work/foundation-identity-projection`
- `work/hub-responsive-shell`
- `work/russian-review-queue`
- `work/math-theory-reader`

Avoid:

- `work/v2`
- `work/v3-final`
- `work/new-system`
- `work/latest`
- `work/final-final`

The current historical branch `work/foundation-v2-l10-content-asset-provenance` predates this rule. Do not copy that naming pattern for future branches.

## 7. Legacy names still present in the repository

Some historical files still contain version-style names. They are not the primary architecture vocabulary.

### Dormant Hub legacy files

- `assets/js/hub-premium-v2.js`
- `assets/css/hub-premium-v2.css`

The root `index.html` does not load these files. Treat them as dormant historical artifacts, not the authoritative Hub architecture.

Do not build new work on top of the `hub-premium-v2` name. If these files are later removed, renamed, or consolidated, do it as a dedicated cleanup change with responsive and packaged-runtime gates.

### Historical reports

Files such as `*_V2_REPORT.md`, `MATH_V2x_*.json`, and archived checkpoint reports are historical evidence. Their filenames may remain unchanged so old references stay traceable.

Do not copy their version naming into new architecture documents.

### Versioned datasets and contracts

Files such as `*_v2.json`, `*.v1.json`, and schema constants ending in `_V1` may legitimately retain versions when the version identifies a data/contract format.

The rule is:

- **architecture responsibility:** descriptive name, no generation number;
- **data/API/schema compatibility:** explicit technical version is allowed and often required.

## 8. Current frozen foundation checkpoints

### Foundation — Identity & Domain Model

Historical checkpoint: L9.

State: additive identity/domain layer with verified overlay persistence, canonical projection, and read-only consumer context.

### Foundation — Content, Asset & Provenance Registry

Historical checkpoint: L10.

State: promotion candidate with registry contract, immutable runtime, SHA-256 asset integrity, provenance, access policy, deterministic snapshot, transactional transport, snapshot integrity, and promotion freeze.

### Foundation — Content Resolution & Runtime Delivery

State: Step 1 contract active on `work/foundation-content-resolution-delivery`.

Current rule: contract-only; no existing loader migration yet.

Future work must preserve the explicit authority boundary before any runtime consumer is migrated.
