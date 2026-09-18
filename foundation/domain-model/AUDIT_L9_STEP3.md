# Bauman Foundation — Identity & Domain Model — Step 3 — Identity Overlay Persistence + Transaction Safety

## Goal

Persist canonical identity mappings without risking any existing Russian/Hub learner state.

## Storage isolation

The identity overlay uses two **new** keys only:

- final: `bauman_identity_overlay_v1`
- staging: `bauman_identity_overlay_v1_staging`

Existing Russian storage keys are never valid write targets for the overlay store.

## Transaction model

1. Normalize the additive overlay.
2. Seal it in `BAUMAN_IDENTITY_OVERLAY_STORE_V1` with a deterministic checksum.
3. Write the staging key.
4. Read back and verify exact staging bytes.
5. Write the final key.
6. Read back and verify exact final bytes.
7. Remove staging only after final verification succeeds.

If the final write fails after staging was verified, staging remains available for recovery.

## Recovery model

- Valid final → use final; stale staging may be removed.
- Invalid/missing final + valid staging → recovery may promote staging to final and verify it.
- Invalid final + invalid staging → report `corrupt`; do not guess or silently overwrite.

## Safety invariants

- The store receives a storage adapter; it does not hard-code `localStorage` or `sessionStorage`.
- The store source embeds none of the legacy Russian storage keys.
- Only the final/staging overlay keys may be written or removed.
- Mapping planning remains deterministic/idempotent.
- Unknown overlay extensions/root fields survive planning and persistence.
- Checksum tampering fails closed.
- Interrupted writes leave all legacy stores byte-for-byte unchanged.

## Non-goals

- No Russian page loads the identity runtime/store yet.
- No legacy state is copied, deleted, renamed, or rewritten.
- No semantic aliasing across Russian modules yet.
- No browser migration is automatically executed.

## Gate

Step 3 passes only when `FOUNDATION_IDENTITY_OVERLAY_STORE_GATE=PASS` plus all earlier L9 foundation gates.
