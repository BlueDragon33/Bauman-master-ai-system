# CODEX_STATE

Current task: `BAUMAN_RUSSIAN_UX_REFACTOR_POST_MERGE_RECONCILIATION_FX`

Status: `ROADMAP_V2_COMPLETE · RUSSIAN_LISTEN_WRITE_PROMOTED · ACADEMIC_PHASE2_A1_A6_PROMOTED · DEVICE_CONTRACT_V6_PROMOTED · CONTENT_REVIEW_V1_PROMOTED · DEEP_STUDY_JOURNAL_V1_PROMOTED · DSJ_PACKAGED_READINESS_FX_PROMOTED · CURRENT_MAIN_CONTROL_STATE_GATE_V1_PROMOTED · CURRENT_MAIN_CONTROL_STATE_GATE_V1_1_PROMOTED · RUSSIAN_FUTURE_REFERENCE_UI_PROMOTED · RUSSIAN_FUTURE_UI_IDEMPOTENCE_FX_PROMOTED · RUSSIAN_FUTURE_UI_PACKAGE_READINESS_FX_PROMOTED · RUSSIAN_VOCAB_VISUAL_IMMERSION_V1_PROMOTED · PRODUCTION_PUBLISH_GATE_V1_PROMOTED · RUSSIAN_UX_REFACTOR_PASS_1_10_PROMOTED · POST_MERGE_RECONCILIATION_FX_ACTIVE`

Date: 2026-09-24
Branch: `main`
Base: `main`

## Authoritative progress

The single authoritative Roadmap progress marker remains:

`docs/roadmap_v2/CURRENT_EXECUTION_STATE.md`

That marker records Roadmap V2 complete through **L35** with no L36 required by the accepted architecture. Production execution/deployment remains outside the Roadmap V2 authority boundary.

Promoted current-main capabilities:

- Russian Handwriting Listen+Write — PR #72 merged as `4c2e9c7c85edaabbea036b2953f670710f2fe67b`.
- Academic Phase2 A1→A6 — PR #76 merged as `30092c01cf8ce41cf612823299195aaff240b3f0`.
- Device Contract v6 — PR #79 merged as `0d603a979a7952697d5d612fd9de5f8106a0e609`.
- Content Review API v1 — PR #82 merged as `eac09a5005bda44371ee26aed784bccfc50877a8`.
- Deep Study Journal v1 — Issue #84 promoted as `a2e642867ba99ea34c1b49eb378f78f927e563bb`.
- Deep Study Journal packaged-readiness Fx — PR #88 merged as `9b32c56dd10dff379231da201fd1970e781ed2f0`.
- Current-Main Control-State Gate v1 — PR #90 merged as `56db4ba323e2380d861277d71bf488f0012544ce`.
- Current-Main Control-State Gate v1.1 — PR #93 merged as `804cb00b306d18247fba00453864783754de4cf0`.
- Russian Future Reference UI — PR #92 merged as `530649914820d54e992c5d840621e1ff0631f836`.
- Russian Future UI idempotence Fx — PR #95 merged as `06e3c56308d71ff3ce8f8b3cedf12242c2b0c1f9`.
- Russian Future UI package-readiness Fx — PR #97 merged as `00605feb7dbdfbb9c6f1e5399d75c1af96211af4`.
- Russian Vocabulary Visual Immersion v1 — PR #99 merged as `e8108f25d6e3dd686116c6f13589ddc913c95e68`.
- Production Publish Gate v1 — PR #102 merged as `51138b9e9f9a60c47d91a354446532e8064a545f`.
- Russian UX/UI learner-first refactor PASS 2→10 — PR #108 merged as `59d4bc3bad24c20eac09376fe27f564d9dc9a87e`; PASS 1 was already promoted before this merge.

## Device Contract v6

Preserve the promoted Issue #28 behavior:

- Bauman-owned isolated device registry;
- P-256 challenge/proof and revocable sessions;
- device type/platform/browser metadata;
- approve/block/unblock/edit-permission commands with audit;
- `BM-xxxx-xxxx-xxxx-xxxx` display code;
- Runtime Worker server-side protected learning-data gate;
- fail-closed access for pending/blocked/revoked sessions.

Issue #28 is closed as completed. Production activation/deploy remains separate and explicit.

## Content Review API v1

Issue #81 was opened as a separate current-main capability track because `contentReviewApi` was the remaining explicit `missing` contract capability.

PR #82 implemented:

- D1 `bm_content_reviews` metadata queue;
- D1 `bm_content_review_commands` idempotent command ledger;
- `GET/POST /api/control/content-reviews`;
- `POST /api/control/content-review-commands`;
- reviewer/publisher/owner role boundaries;
- compare-and-set `expectedStatus` mutation protection;
- audit for submit/approve/reject/publish;
- machine-readable contract v7;
- no learning-content body stored in the control database;
- Application Management remains an orchestration/control plane, not a content owner/editor.

Validated PR #82 gates:

- Bauman Control Service CI — SUCCESS;
- Bauman Runtime Device Gate CI — SUCCESS;
- Bauman Cloudflare Preview CI — SUCCESS;
- Windows checkout safety — SUCCESS.

## Deep Study Journal v1

Preserve the promoted Issue #84 behavior:

- learner reflection only: Feynman checkpoint, Error Notebook, Closed-AI session and Oral-defense note;
- stored inside Hub learner state and inherited backup/restore;
- no separate storage owner;
- no authoritative mastery evidence;
- no mastery, diagnostic, prerequisite, scheduler or progress mutation;
- surfaced from Progress/Academic flow without adding a new sidebar/page navigation item;
- direct and packaged Whole System regression coverage remains required.

Issue #84 is promoted current-main behavior. Any future change must preserve the non-authoritative reflection boundary unless a separately approved evidence architecture track is opened.

## Deep Study Journal packaged-readiness Fx

PR #88 closed the concrete post-promotion integration defect observed in Whole System run `35601172574`: direct Deep Study Journal acceptance passed, while the packaged ChatGPT Site acceptance timed out waiting for `[data-dsj-open]`.

Root cause and hardening:

- the Progress action is owned by the asynchronously bootstrapped Academic Phase2 course runtime;
- packaged acceptance could open Progress before the existing `app.__course14bPatched` readiness marker was true;
- browser acceptance now waits for that deterministic marker before asserting the Progress action;
- Cloudflare preview and owner-private ChatGPT Site packaging now require the Deep Study Journal CSS/JS assets and HTML references;
- the Deep Study Journal static validator locks both readiness and packaging invariants;
- no mastery, diagnostic, prerequisite, scheduler, progress or content-ownership authority changed.

Validated after merge on current `main`:

- Whole System Integration Gate run `35619956810` — SUCCESS, including packaged Deep Study Journal, Russian offline shell and Listen+Write;
- Bauman Cloudflare Preview CI run `35619956696` — SUCCESS;
- Windows checkout safety run `35619956691` — SUCCESS.

## Current-Main Control-State Gate v1

PR #90 adds a dedicated fail-closed governance gate for the project control-state records.

It validates:

- `CODEX_STATE.md` and `CODEX_TASK.md` point to the same current task;
- current-main and fail-closed markers remain intact;
- the authoritative Roadmap remains complete at L35 and does not silently become L36;
- Roadmap production/runtime activation remains disconnected;
- Application Management contract readiness contains no explicit `missing` capability;
- production deploy still requires explicit promotion after preview;
- Content Review remains metadata-only and does not store learning-content bodies;
- Deep Study Journal remains reflection-only and non-authoritative.

Validated on current `main` after merge:

- Current-Main Control-State Gate run `35621426865` — SUCCESS;
- Windows checkout safety run `35621426949` — SUCCESS.

This is a governance/CI hardening track only. It does not extend Roadmap V2 and does not enable production execution.

## Current-Main Control-State Gate v1.1

PR #93 hardens the governance gate by validating that every promoted 40-character SHA recorded in the promoted-capabilities section is unique and is an actual ancestor of the current HEAD. It keeps full git history available to the validator and preserves all existing L35, production-disconnected, Content Review and Deep Study Journal invariants.

Promoted on current `main` as merge commit `804cb00b306d18247fba00453864783754de4cf0`.

## Russian Future Reference UI

PR #92 promotes the redesigned dedicated Russian-learning interface while preserving existing routes, data ownership, learner state and offline/package contracts.

The promoted UI includes:

- reference-proportioned 220px desktop sidebar with responsive 190px/mobile behavior;
- wide main learning canvas with the old fixed right rail removed from layout;
- modern hero, progress strip, five-module overview and lower dashboard grid;
- consistent presentation treatment for existing Russian tabs;
- direct and packaged browser acceptance for 16:9 geometry, responsive behavior and horizontal-overflow protection.

Two concrete integration defects were found and fixed before promotion:

- legacy core CSS forced the sidebar to 286px instead of the 220px reference width;
- inherited main-canvas sizing prevented the learning canvas from using the space released by the removed right rail.

Validated before merge on PR #92 head `5687e47bc5cf0f84f268bf561b726c40e4c61000`:

- Whole System Integration Gate run `35624915374` — SUCCESS, including direct and packaged Russian Future UI acceptance;
- Russian Reference UI Gate — SUCCESS;
- Bauman Cloudflare Preview CI — SUCCESS;
- Foundation Domain Model Gate — SUCCESS;
- Windows checkout safety — SUCCESS.

Validated again after merge on current `main` merge commit `530649914820d54e992c5d840621e1ff0631f836`:

- Whole System Integration Gate run `35625361323` — SUCCESS, including packaged Russian Future UI acceptance;
- Russian Reference UI Gate — SUCCESS;
- Bauman Cloudflare Preview CI — SUCCESS;
- Foundation Domain Model Gate — SUCCESS;
- Windows checkout safety — SUCCESS.

This is a UI/runtime presentation promotion only. It does not create L36 and does not authorize production deployment.

## Russian Future UI idempotence Fx

PR #95 closes a concrete presentation-runtime defect found during current-main audit after Russian Future Reference UI promotion.

Root cause and fix:

- `russian-future-ui.js` observes subtree child/class mutations so it can re-apply the presentation layer after core rerenders;
- `upgradeBrand()` previously rewrote visible text and quote HTML on every upgrade even when values were unchanged;
- those writes could create new `childList` mutations and schedule another `requestAnimationFrame` upgrade, causing avoidable self-churn/CPU work;
- brand/nav/search writes are now idempotent, and the sidebar quote is rendered once per Future UI activation;
- browser acceptance now proves a repeated settled `RUSSIAN_FUTURE_UI.upgrade()` produces zero child/class mutations;
- the static Russian UI validator now checks the semantic brand/idempotence contract instead of requiring one exact source-code spelling.

Validated on PR #95 final head `896d04030dc25459ef40988f5fd0dad91c0027c6`:

- Russian Reference UI Gate run `35670598805` — SUCCESS;
- Windows checkout safety run `35670598873` — SUCCESS;
- Bauman Cloudflare Preview CI run `35670598842` — SUCCESS;
- Whole System Integration Gate run `35670598844` — SUCCESS, including direct Russian Future UI acceptance and packaged Russian Future UI acceptance.

Promoted as current-main commit `06e3c56308d71ff3ce8f8b3cedf12242c2b0c1f9`.

This is a scoped Fx hardening step only. It does not create L36, change route/data/state authority, or authorize production deployment.

## Russian Future UI package-readiness Fx

PR #97 hardens the promoted Russian Future UI package boundary so accepted runtime packages fail fast instead of relying only on later browser discovery.

Hardening:

- ChatGPT Site materialization now requires `subjects/russian/assets/russian-future-ui.css` and `subjects/russian/assets/russian-future-ui.js`;
- Cloudflare preview materialization requires the same two assets;
- both package paths verify that packaged Russian HTML still references the Future UI CSS/JS;
- the Russian Reference UI validator locks those package-readiness assertions so they cannot silently disappear.

Validated on PR #97 final head `b790e356b7171cfdf8093332c9b53a9ae2259636`:

- Russian Reference UI Gate run `35671117245` — SUCCESS;
- Windows checkout safety run `35671117243` — SUCCESS;
- Bauman Cloudflare Preview CI run `35671117362` — SUCCESS;
- Whole System Integration Gate run `35671117241` — SUCCESS, including materialized ChatGPT Site and packaged Russian Future UI acceptance.

Promoted as current-main commit `00605feb7dbdfbb9c6f1e5399d75c1af96211af4`.

This is package/readiness hardening only. It does not create L36, change learning authority, or authorize production deployment.

## Russian Vocabulary Visual Immersion v1

PR #99 closes a concrete learning-surface gap found during current-main audit: the Russian vocabulary runtime still exposed Vietnamese explanatory meaning/application text and could fall back to Vietnamese/English clues, despite the accepted visual-first vocabulary method.

Promoted behavior:

- source vocabulary JSON/data remains preserved; no destructive migration or ownership change;
- visible vocabulary learning uses existing image/emoji/symbol cues plus Russian contextual explanation and practice;
- the visible learning projection no longer prefers Vietnamese or English meaning fields;
- Russian-context and practice blocks remain marked as Russian content;
- hidden visual-card fallback no longer leaks `meaningVi`;
- raw metadata tags are not rendered as translation clues;
- existing Russian routes, learner state, SRS, handwriting, offline and package contracts remain unchanged.

Regression hardening:

- Russian Reference UI/static validation fails if the legacy Vietnamese display helper or translated-meaning preference returns;
- listening/visual-first validation checks the semantic immersion contract instead of one legacy implementation spelling;
- Russian Future UI browser acceptance verifies that visible vocabulary learning paragraphs contain Russian context, do not expose Vietnamese translation/explanation, and retain a visual cue;
- the same browser acceptance runs against both direct runtime and the materialized ChatGPT Site package.

Validated on PR #99 final head `fb0d29e8af4820da1fc5e50268286303db286715`:

- Russian Reference UI Gate run `35673600925` — SUCCESS;
- Windows checkout safety run `35673600932` — SUCCESS;
- Bauman Cloudflare Preview CI run `35673600975` — SUCCESS;
- Whole System Integration Gate run `35673600924` — SUCCESS, including direct and packaged Russian Future UI acceptance.

Promoted as current-main commit `e8108f25d6e3dd686116c6f13589ddc913c95e68`.

This is a separate current-main learning-surface capability track. It does not create L36, change learning/mastery authority, or authorize production deployment.

## Production Publish Gate v1

PR #102 adds the first explicit Cloudflare production execution path as a separate current-main capability track outside Roadmap V2.

Fail-closed promotion boundary:

- production deployment is manual-only through `.github/workflows/deploy-bauman-production.yml`;
- the operator must enter the exact confirmation token `DEPLOY_PRODUCTION`;
- the job runs in GitHub environment `bauman-production`;
- before any production mutation, both Bauman Control preview and Bauman Learning Runtime preview must report `channel=cloudflare-preview` and the exact same full `GITHUB_SHA` being promoted;
- production Control D1 must be a real UUID distinct from preview and local D1;
- Application Management production, Bauman production Control, Bauman production Runtime, preview Control and preview Runtime origins must all be distinct exact HTTPS origins and may not fall back to `*.chatgpt.site`;
- Control and Learning Runtime production artifacts are fully materialized and dry-run before remote D1 migration or Worker deployment;
- post-deploy smoke tests require production channel/revision read-back, production D1 readiness, live learning-access capability and promoted Russian runtime assets.

PR #102 pre-merge verification on head `dfa2f5075d2b348186cb4d23e997ca03887f4b07`:

- Bauman Cloudflare Production Publish Gate CI — SUCCESS;
- Bauman Cloudflare Preview CI — SUCCESS;
- Bauman Control Service CI — SUCCESS;
- Bauman Runtime Device Gate CI — SUCCESS;
- Windows checkout safety — SUCCESS.

Promoted on current `main` as merge commit `51138b9e9f9a60c47d91a354446532e8064a545f`.

This track does not create L36 and does not turn production into an automatic action. Roadmap V2 remains production-disconnected; live deployment is a separately authorized execution path and remains blocked until exact-revision preview verification plus environment configuration and explicit manual confirmation pass.

## Russian UX/UI refactor PASS 2→10 promotion

PR #108 completed the source-of-truth Russian UX/UI learner-first refactor after PASS 1 had already been promoted.

Promoted behavior includes:

- canonical ~220px desktop learning rail and ~1120px main learning canvas;
- learner-first overview and tab hierarchy;
- grammar information hierarchy hardening;
- handwriting workbench improvements;
- bounded Mini Check and Stage Check diagnosis surfaces;
- personal learner reporting;
- responsive/accessibility hardening across 1280 / 1024 / 768 / 390 widths;
- direct + packaged Russian regression coverage.

Validated on PR #108 final head `86887d287d8922b3d14c0bf636b11b628919972d`:

- Russian Reference UI Gate run `35939339335` — SUCCESS;
- Windows checkout safety run `35939339337` — SUCCESS;
- Bauman Cloudflare Production Publish Gate CI run `35939339341` — SUCCESS;
- Bauman Cloudflare Preview CI run `35939339350` — SUCCESS;
- Whole System Integration Gate run `35939339338` — SUCCESS;
- Foundation Domain Model Gate run `35939339391` — SUCCESS.

Promoted to current `main` as merge commit `59d4bc3bad24c20eac09376fe27f564d9dc9a87e` on 2026-09-24. PR #109 was based on the same pre-refactor baseline and must not be promoted after #108; it is stale duplicate work.

This reconciliation is a scoped control-state Fx only. It does not create L36, alter learning authority, or authorize production deployment.

## Intentional capability layering

The base control worker intentionally keeps `learningAccessGate: false` until the deployment/preview wrapper verifies D1 + app-origin readiness. Do not flatten this fail-closed layering.

## Current capability audit

The machine-readable application-management contract is now version **7** and no readiness capability is explicitly marked `missing`.

Roadmap V2 itself does **not** authorize production deployment. Production Publish Gate v1 is a separate current-main execution track and remains fail-closed until the exact revision is live in preview, required production bindings exist, and the manual production confirmation is supplied.

## Safety boundary

- Roadmap V2 remains terminally closed unless a separately approved architecture track is opened.
- Preserve Hub, Math, Russian, Foundation, Device Gate, Academic, Content Review and Deep Study Journal behavior already promoted to current `main`.
- Do not merge stale historical candidate branches.
- No implicit production deploy/publish.
- Any future defect starts as a scoped Fx hardening step from current `main`.
- Any future missing architecture capability starts as a separately named track rather than extending Roadmap V2 by default.

## Execution rule

1. Start all new work from current `main`.
2. Treat `docs/roadmap_v2/CURRENT_EXECUTION_STATE.md` as authoritative for Roadmap history.
3. Treat PRs #72, #76, #79, #82, #88, #90, #92, #93, #95, #97, #99, #102 and Deep Study Journal v1 commit `a2e642867ba99ea34c1b49eb378f78f927e563bb` as promoted current-main behavior.
4. Do not reconstruct completed Issues #28 or #81 from stale branches.
5. Preserve Content Review metadata-only ownership and role boundaries.
6. Preserve Deep Study Journal as non-authoritative learner reflection; it must not become mastery/diagnostic/scheduler/progress evidence implicitly.
7. Audit open issues/PRs and current contracts before creating new work.
8. Treat Russian UX/UI PASS 2→10 merge commit `59d4bc3bad24c20eac09376fe27f564d9dc9a87e` as promoted current-main behavior; do not reopen or promote stale PR #109.
9. Create a new round only for a concrete defect, explicit missing capability or newly requested feature.
