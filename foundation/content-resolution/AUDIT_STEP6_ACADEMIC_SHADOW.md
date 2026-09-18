# Bauman Foundation — Content Resolution & Runtime Delivery — Step 6 Academic Core Shadow Resolution Audit

## Goal

Exercise the new resolution/delivery chain against real resources already loaded by `assets/js/academic-main.js` without changing runtime authority.

## Shadow scope

The profile tracks exactly three existing Academic 2026 loader constants:

- `CURRICULUM_URL`;
- `PREREQ_URL`;
- `PACK_MANIFEST_URL`.

Their current paths remain owned by the existing Academic loader.

## Validation method

CI:

1. reads the real `academic-main.js` constants;
2. requires exact parity with the shadow profile;
3. reads the real JSON files;
4. computes diagnostic SHA-256 checksums in memory;
5. builds a temporary registry in memory;
6. resolves each resource through the pure resolver;
7. builds a delivery plan;
8. uses an injected filesystem adapter only inside CI;
9. verifies bytes through the delivery executor;
10. parses the verified bytes and compares them with direct file parsing.

## Authority boundary

This step does not:

- modify `academic-main.js`;
- add Foundation scripts to the browser entry point;
- replace any fetch call;
- persist the diagnostic registry;
- promote dynamically computed checksums to canonical metadata;
- change scheduler, prerequisite, learner-state, route, or packaging behavior.

The in-memory registry is diagnostic only.

## Why this matters

Step 6 proves that the architecture can represent and verify real loader resources before any browser integration occurs.

A future runtime shadow mode can therefore be introduced with a known parity baseline rather than replacing working loaders speculatively.

## Gate

Step 6 requires:

- Steps 1–5 PASS;
- exact loader constant/profile parity;
- all three real files exist and parse;
- all three resolve package-relative;
- all three delivery plans require integrity verification;
- all three executor runs verify successfully;
- verified parsed JSON equals direct parsed JSON;
- zero runtime authority switch or mutation.

A later step may add browser shadow diagnostics, but existing Academic fetches remain authoritative until separately promoted.
