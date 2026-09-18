# Bauman Foundation — Content Resolution & Runtime Delivery — Step 14 Failure Injection / No-Fallback Audit

## Goal

Prove the opt-in verified loader trial stops safely when content integrity or registry bootstrap fails.

## Scenario A — Modified core bytes

The browser test serves the curriculum with a harmless byte-level change while keeping valid JSON.

Expected:

- pinned SHA-256 verification fails;
- Academic core loader reports unverified;
- Academic globals are not published;
- prerequisite pack status reports failure;
- no legacy core fallback occurs;
- no second core request occurs.

## Scenario B — Missing registry candidate

The browser returns HTTP 404 for the pinned registry candidate.

Expected:

- verified loading stops before any core JSON request;
- Academic globals are not published;
- prerequisite pack status reports failure;
- no legacy core fallback occurs.

## Why this gate is required

An integrity/bootstrap failure must remain visible. The verified path must not silently convert that failure into ordinary success by switching back to an unverified core loader.
