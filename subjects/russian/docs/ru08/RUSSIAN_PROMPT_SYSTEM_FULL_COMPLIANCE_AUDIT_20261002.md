# Russian Prompt System — Full Compliance Audit 2026-10-02

State: **CORRECTIVE IMPLEMENTATION IN VALIDATION**

Audit baseline: `main@2b0b540edc381c4ea6268e080b0444d0c78b7277`  
Previously released Russian RC: `7697a3f05362c111fb481ebd6043738c12dbcb8c`

## Scope

The attached `RUSSIAN_PROMPT_SYSTEM` package was re-read as the authority, including:
- `00_README.md`;
- `RUSSIAN_MASTER_PROMPT.md`;
- RU01 through RU08;
- C1 Core-Stable, C2 Interface/Experience, C3 Development/Testing, C4 Learning-Intelligence;
- `C3_RELEASE_ANNEX_PRODUCTION.md`;
- router, manifest and old-to-new map;
- archived P1–P17 only as evidence/history, not as active execution topology.

The audit deliberately did not treat prior PASS labels as proof.

## Disposition by active module

| Module | Audit result | Disposition |
|---|---|---|
| RU01 forensic baseline | Substantively compliant | Keep. Consolidated baseline already covers inventory, owners, routes, state/storage, risk, performance/accessibility, root causes and handoff without report spam. |
| RU02 canonical model | Compliant with explicit planned-owner debt | Keep. Planned owners are allowed to remain absent rather than fabricating Russian facts. Stable R01–R26 identity and graph/owner validation remain authoritative. |
| RU03 linguistic authority | Compliant with explicit review debt | Keep. Large legacy areas may remain UNVERIFIED only because authority-sensitive use fails closed; do not relabel them VERIFIED to make a gate green. |
| RU04 learning judgment | Compliant | Keep. Mastery, scheduler, planner and provider ownership remain separated; malformed/oversize state and duplicate attempts are regression-tested. |
| RU05 oral/scenarios | Core design compliant; acceptance evidence was under-bound | Keep runtime; bind representative journey evidence through RU08 executable acceptance. |
| RU06 academic/technical/research | Core design compliant; journey evidence was under-bound | Keep owners/contracts; bind browser journey evidence through RU08. |
| RU07 AI coach | Compliant | Keep. AI stays non-authoritative, generated material noncanonical, assessment leakage/injection/fallback policies remain gated. |
| RU08 integration/authoring | **Material gap found** | Corrected: placeholder editor replaced with structured staging workspace; acceptance matrix now evidence-bound; release handoff semantics corrected. |
| C3 Release Annex | **Material gap found** | Corrected workflow: exact preflight identity, backup, migration evidence, production verification, offline/PWA check, observation, incident register and closure evidence are required before STABLE. |

## Confirmed defects in the previous execution

### F1 — Premature production-complete claim — CRITICAL

The prior production workflow reached deploy + smoke and the assistant stated that publish was complete. The attached Release Annex explicitly forbids a shortcut from deployment/smoke to STABLE.

Required missing closure evidence included observation, final production-state record and release closure evidence.

Correction:
- production workflow now runs the exact-RC preflight evidence helper;
- production D1 is exported before migrations;
- migration outcome is recorded;
- production identity/content drift/security/auth/offline contracts are verified;
- an actual production offline browser test is required;
- IMMEDIATE / SHORT_TERM / SUSTAINED synthetic observation is required;
- incident register must be empty;
- only then may the closure helper emit STABLE and the P17 closure report.

### F2 — RU08 author journey was not genuinely implemented — HIGH

`subjects/russian/editor.html` was only a placeholder link back to the learner app. The learner Storage tab still offers raw-JSON editing, which does not satisfy RU08's ordinary-author requirement.

Correction:
- editor is now a dedicated structured candidate workspace;
- canonical owner registry and authoring governance are loaded directly;
- candidate gets a stable content hash, source refs, rollback note and diff summary;
- generated/AI source cannot be treated as authority;
- browser can create VALIDATED and REVIEW_REQUESTED candidate/envelope only;
- no direct canonical-write control exists;
- canonical patch/publish/rollback remain repository-governed.

### F3 — RU08 acceptance matrix could PASS on declarations — HIGH

The existing validator checked that journeys/failures were listed but did not require every entry to resolve to executable evidence.

Correction:
- `RUSSIAN_RU08_ACCEPTANCE_EVIDENCE.json` maps every journey and failure to concrete executable tests;
- `validate-ru08-acceptance-evidence.mjs` rejects missing/stale paths and requires browser evidence for every journey;
- new learner and author browser journeys run for source and packaged runtime.

### F4 — Shared Hub changes could bypass Russian whole-system revalidation — HIGH

After Russian RC, shared `assets/js/main.js`, `assets/js/data.js` and `assets/js/subjects-reference-v1.js` changed, while Whole System Integration did not trigger on the full shared Hub path family.

Correction:
- integration trigger now includes `assets/js/**`, `assets/css/**`, root `index.html`, `platform/ui/**`, and the application-management contract.

### F5 — RU08 rollback target mixed source baseline with production rollback identity — HIGH

The prior readiness file used the RU08 source baseline as `rollbackTarget`. That is not necessarily the previous live production revision.

Correction:
- source rollback baseline is retained separately;
- production rollback target is resolved from the live pre-deploy `/__deployment` identity during release preflight;
- “latest/main” is never accepted as production identity.

### F6 — Exact artifact/content identity was descriptive rather than hashed — HIGH

The readiness record described the artifact/content snapshot but did not contain a release-time immutable hash.

Correction:
- release preflight calculates source SHA, dependency lock aggregate SHA-256, migration manifest SHA-256 and canonical Russian content snapshot aggregate SHA-256;
- these identities are persisted in release evidence.

### F7 — Production subject smoke was incomplete — HIGH

The Release Annex requires the subject-specific smoke profile emitted by RU08, but the production workflow only executed static HTTP checks plus the offline browser journey.

That was insufficient to prove the accepted Russian learner and author paths still worked after production activation.

Correction:
- production now runs the representative RU08 learner journeys directly against the live production runtime;
- production runs the governed author workspace journey directly against the live production runtime;
- the offline reload browser journey remains required;
- all three browser summaries are copied into Release Annex evidence and are required by closure before STABLE.

### F8 — Production Permissions-Policy disabled Russian microphone — CRITICAL

`cloudflare/runtime-worker.mjs` still emitted `microphone=()`, which disables microphone capture at the browser policy layer even though Russian speaking/recording is a required capability.

This is a runtime-owner regression and cannot be waived by source/package tests.

Correction:
- production runtime policy is `microphone=(self)`;
- camera and geolocation remain denied;
- release verification rejects a production header that does not allow same-origin microphone;
- the release-workflow validator statically rejects a regression back to `microphone=()`.

### F9 — Production config identity lacked live fingerprint readback — HIGH

The Release Annex requires the actual production config/profile identity to be read back after activation. Revision equality and boolean readiness alone did not prove both deployed workers were using the same intended production profile.

Correction:
- production packaging derives a SHA-256 fingerprint from the exact revision and non-secret production profile inputs;
- the fingerprint is embedded into both production worker configs;
- both `/__deployment` endpoints expose the fingerprint;
- release verification compares both live fingerprints to the immutable release evidence;
- STABLE closure requires the config identity and readback evidence.

### F10 — Protected production content was verified anonymously — HIGH

The release helper attempted to fetch the Russian subject manifest without a production device session even though server-side runtime policy protects Russian JSON assets. That could either fail the release for the wrong reason or tempt a future bypass of the access gate.

Correction:
- anonymous protected-content access is now explicitly required to fail closed with HTTP 401/403;
- a dedicated release-only smoke device session must be supplied through the protected production environment;
- the authenticated request must read the exact manifest used for drift verification;
- the same session exercises the normal heartbeat/persistence path rather than a release-only bypass;
- missing, malformed, expired or unauthorized smoke identity blocks release before STABLE.

### F11 — Migration and schema evidence was too weak — HIGH

The previous migration result recorded only PASS/FAIL plus revision, while deployment readiness checked only part of the control schema.

Correction:
- deployment database readiness now verifies both device-control and Content Review tables;
- migration result is bound to the exact migration-manifest SHA-256 and migration count;
- migration command output is hashed and byte-counted;
- STABLE closure rejects revision, manifest, exit-code, log or backup evidence mismatch.

### F12 — Deployment artifact identity omitted Control Worker output — HIGH

The previous artifact record fingerprinted `runtime-dist` only and was generated before Cloudflare dry-run bundles existed.

Correction:
- both production Worker dry-runs now run before artifact identity is recorded;
- release artifact evidence fingerprints `runtime-dist`, the Control Worker dry-run bundle and the Learning Runtime dry-run bundle;
- the aggregate identity is written back into the RC manifest.

### F13 — Native browser validation bypassed governed RU08 negative-validation evidence — HIGH

The structured author workspace rendered schema-required fields with native HTML `required`. That caused the browser to block form submission before the Russian governed validator could materialize a DRAFT candidate and emit explicit validation evidence.

Correction:
- schema-required fields remain visibly/semantically required through labels and `aria-required=true`;
- the governed validator, not native form blocking, owns candidate validation state;
- the RU08 author browser journey now proves both negative DRAFT and positive VALIDATED/REVIEW_REQUESTED transitions.

### F14 — RU08 project state and RC readiness could contradict each other — HIGH

The durable project state correctly remained `RU08_VALIDATING`, while the RC readiness record could already say `READY_FOR_MERGE`. That allowed a premature readiness label before exact-head CI/browser evidence completed.

Correction:
- RC readiness remains `VALIDATING` while the project is validating;
- `validate-prompt-project-state.mjs` cross-checks project state against RC state;
- RU08 PASS requires the RC record to be `READY_FOR_MERGE`, and that transition must itself be revalidated on the new exact head.

## Previously encountered errors rechecked

1. **Stale P3 planned-owner conflict for reading** — previous correction remains appropriate because current RU02 owner status is the active authority; no old-topology validator may overrule a materialized current owner.
2. **Missing `speech-interaction` required capability** — regression is preserved in RU08 manifest/validator.
3. **RC state validator only allowing CANDIDATE** — corrected state machine remains bounded to accepted pre-merge states; this did not justify a production claim.
4. **Large `tests.json` / `vocab.json`** — no semantic bulk rewrite is authorized. Large corpus remains lazy/deferred where applicable and non-authoritative content remains fail-closed rather than auto-promoted.
5. **Historical P0–P17 topology** — remains evidence/history only; it is not replayed as the active Russian execution chain.

## Invariants preserved during correction

- no learner-state reset;
- no bulk Russian corpus rewrite;
- no second mastery, SRS, audio/STT, router, auth or offline kernel;
- one fact / one owner / many uses;
- exposure != progress != performance != mastery;
- AI cannot write official mastery, score, stage unlock or canonical Russian truth;
- voice capture remains transient by default;
- Content Review remains metadata-only;
- author browser never writes canonical content;
- production promotion remains exact-RC-only.

## Validation required before this audit can close

The corrective branch is not considered PASS until:
1. Russian Reference UI Gate passes;
2. Whole System Integration Gate passes source + packaged learner/author journeys;
3. Universal Constitution and Development Fast CI pass;
4. no blocker/critical remains;
5. the corrected branch is merged using its exact validated head;
6. production is not called STABLE unless the corrected Release Annex workflow itself later emits closure evidence.

Until those conditions are met, the accurate statement is:

**RUSSIAN PROMPT FULL AUDIT — CORRECTIONS IMPLEMENTED, VALIDATION PENDING.**
