# Russian Engine RE15 — Authoring & Content QA

State: VALIDATING

## Purpose

Allow Russian Engine content to scale without turning every new lesson into feature code or allowing unsafe/unverified content into a commercial product.

## Pack contract

A content pack declares:
- stable pack ID;
- revision;
- commercial flag;
- item IDs;
- level ranges;
- competencies;
- semantic targets;
- linguistic refs;
- translation/support/evidence policies;
- provenance;
- media rights;
- accessibility fallback.

## Hard failures

Validator rejects:
- duplicate IDs;
- unknown competency refs;
- unknown linguistic refs;
- translation visible by default;
- generated-unreviewed content marked canonical;
- commercial pack media without commercial-use permission;
- broken scenario paths.

## Warnings

Accessibility fallback gaps are surfaced as warnings and should become hard failures before sellable release if unresolved.

## Manifest

A pack manifest can be generated without UI code changes.

This is the basis for future downloadable/offline/commercial content packs.

## Exit gate

PASS when valid packs produce manifests and unsafe packs are rejected for translation leakage, provenance, rights or reference failures.
