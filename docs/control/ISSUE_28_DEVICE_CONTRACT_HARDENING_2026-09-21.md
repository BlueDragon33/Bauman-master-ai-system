# Issue #28 · Site Device Contract hardening

Date: 2026-09-21
Branch: `hardening/issue-28-device-contract-current-main`
Base: `main`

## Why this round exists

Roadmap V2 remains terminally closed at L35. This is a separate defect/capability round created from current `main` because Issue #28 still had concrete acceptance gaps.

## Gaps found on current main

1. Remote device mutation supported only `approve | block`; Issue #28 also requires unblock and edit-permission control with audit.
2. Device registry stored only device type, not separate platform/browser metadata.
3. New display codes used only three 4-character groups instead of the requested `BM-xxxx-xxxx-xxxx-xxxx` shape.
4. The learning runtime UI was gated client-side, but Cloudflare Runtime Worker still served protected learning data files without validating an approved server session.

## Changes in this round

- Added `unblock` and `set_edit_permission` idempotent commands with optimistic-concurrency checks.
- Added audit actions `device_unblocked` and `device_edit_permission_changed`.
- Added D1 migration `0003_device_metadata_contract.sql` for `platform`, `browser`, and 16-character BM display-code backfill.
- Browser device registration now reports device type, platform and browser.
- Runtime Worker now exposes `POST/DELETE /api/runtime/session`.
- Approved `bm1.*` device sessions are bound to an HttpOnly, Secure, SameSite=Strict same-origin cookie.
- Protected learning data under `/subjects/`, `/roadmap_v2/` and `/foundation/` is validated server-side through the Bauman Control heartbeat endpoint before delivery.
- Blocked/revoked/pending sessions fail closed and clear the runtime cookie.
- Contract upgraded to version 6 and CI regression coverage extended.

## Safety preserved

- Private P-256 key remains endpoint-only.
- Application Management remains control plane only and does not own Bauman registry/data.
- Bauman D1 remains isolated from Swim/Health/RU Life databases.
- Block preserves registry and revokes device sessions.
- No production deployment or automatic promotion is introduced.

## Gate policy

Do not merge until current PR gates pass, especially:

- Control Service CI
- Bauman Runtime Device Gate CI
- Cloudflare Preview CI
- Whole System Integration Gate
- Windows checkout safety

If a gate fails, repair this branch and rerun; do not create another parallel candidate.
