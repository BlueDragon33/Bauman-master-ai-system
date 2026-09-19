# Lượt 31 — Current Plan · Bước 121–124

Status: `B121_ACTIVE · B122_BLOCKED · B123_BLOCKED · B124_BLOCKED`

Prerequisite: L30 final marker head `d17f690b25c7b8e05f8183fe2223b1c9622cc38d` passed the complete six-gate set.

## Why L31 exists

L30 can produce a deterministic Human Review receipt and distinguish `review_accepted_shadow_only` from rejection, revision and upstream blocking. The canonical Roadmap tree still lacked a boundary that determines whether such a reviewed candidate is merely eligible to enter a **separate release-review stage**.

Without this layer, a future integration could incorrectly treat a Human Review acceptance as production authorization.

L31 adds a data-only Promotion Eligibility layer. It does **not** authorize release review, production promotion, persistence, runtime activation or any production consumer.

## B121 — Promotion Eligibility contract and canonical request/result schemas

**ACTIVE.** Pin a fail-closed contract for:

- candidate references in the `CANDIDATE::...` namespace;
- recomputation of the L30 Human Review receipt from its canonical request;
- no caller-supplied Human Review result or eligibility state;
- mapping negative review states to non-eligible states;
- mapping `review_accepted_shadow_only` only to `eligible_for_release_review`;
- explicit `releaseReviewAuthorized=false` and `productionPromotionAuthorized=false`.

## B122 — Deterministic in-memory Promotion Eligibility projector

Build a scripts-only, side-effect-free projector that revalidates the B121 request, recomputes L30 Human Review and returns a deeply frozen eligibility projection.

## B123 — Adversarial Promotion Eligibility validation

Attack forged candidate identity, forged Human Review result/state, upstream authority injection, manual override, mutation escalation, persistence, release authorization, production promotion and runtime wiring leaks.

## B124 — Full-system closeout

Compose B121–B123 and rerun the complete six-gate set.

Any defect creates `L31-Fx`; any newly discovered missing architecture creates `L31-Hx`. Later steps remain blocked until the repair/hardening head passes the complete six-gate set.
