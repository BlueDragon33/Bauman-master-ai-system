# CODEX_STATE

Current task: `BAUMAN_PROJECT_STATE_POST_CONTENT_REVIEW_RECONCILIATION`

Status: `ROADMAP_V2_COMPLETE · RUSSIAN_LISTEN_WRITE_PROMOTED · ACADEMIC_PHASE2_A1_A6_PROMOTED · DEVICE_CONTRACT_V6_PROMOTED · CONTENT_REVIEW_V1_PROMOTED · CONTROL_STATE_RECONCILIATION`

Date: 2026-09-21
Branch: `hardening/post-content-review-state-reconcile-20260921`
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

## Intentional capability layering

The base control worker intentionally keeps `learningAccessGate: false` until the deployment/preview wrapper verifies D1 + app-origin readiness. Do not flatten this fail-closed layering.

## Current capability audit

The machine-readable application-management contract is now version **7** and no readiness capability is explicitly marked `missing`.

This does **not** authorize production deployment. Runtime capabilities that require D1/app-origin remain configuration-dependent until the relevant environment is explicitly promoted.

## Safety boundary

- Roadmap V2 remains terminally closed unless a separately approved architecture track is opened.
- Preserve Hub, Math, Russian, Foundation, Device Gate, Academic and Content Review behavior already promoted to current `main`.
- Do not merge stale historical candidate branches.
- No implicit production deploy/publish.
- Any future defect starts as a scoped Fx hardening step from current `main`.
- Any future missing architecture capability starts as a separately named track rather than extending Roadmap V2 by default.

## Execution rule

1. Start all new work from current `main`.
2. Treat `docs/roadmap_v2/CURRENT_EXECUTION_STATE.md` as authoritative for Roadmap history.
3. Treat PRs #72, #76, #79 and #82 as promoted current-main behavior.
4. Do not reconstruct completed Issues #28 or #81 from stale branches.
5. Preserve Content Review metadata-only ownership and role boundaries.
6. Audit open issues/PRs and current contracts before creating new work.
7. Create a new round only for a concrete defect, explicit missing capability or newly requested feature.
