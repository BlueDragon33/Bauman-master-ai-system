# Bauman Foundation — Content Resolution & Runtime Delivery — Step 10 Academic Core Registry Promotion Candidate Audit

## Goal

Replace self-derived shadow checksums with repository-pinned SHA-256 metadata before any loader authority migration.

## Candidate scope

The candidate contains exactly three Academic 2026 core resources:

- official curriculum;
- prerequisite registry;
- prerequisite pack manifest.

Each resource has explicit:

- repository source record;
- SHA-256 checksum record;
- verified JSON asset record;
- content record;
- verified provenance event;
- private access policy for both asset and content.

## Pinned integrity

Pinned values are generated from exact repository bytes by Node/CI and then committed.

The gate re-reads the real repository files on every run and fails if either SHA-256 or byte length changes without a corresponding registry update.

This is materially stronger than diagnostic shadow mode, where the expected checksum was derived from the bytes being tested.

## Authority boundary

The candidate is still marked:

- `status: promotion_candidate`;
- `authority: candidate_only`;
- `runtimeAuthoritySwitch: false`.

The existing Academic loader remains authoritative.

## Verification

The gate also resolves each content record through the Content Resolution runtime, builds its delivery plan, and executes verification against the repository bytes.

Any drift in identity, linkage, provenance, access, locator, checksum, byte length, or execution verification fails closed.

## Next step

Only after this candidate is green in source and package should the runtime shadow bridge stop creating dynamic checksums and instead consume the pinned registry candidate.
