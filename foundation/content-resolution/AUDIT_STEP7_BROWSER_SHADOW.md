# Bauman Foundation — Content Resolution & Runtime Delivery — Step 7 Browser Shadow Acceptance Audit

## Goal

Prove the complete content-resolution chain in real Chromium without changing the Bauman Hub runtime or current Academic loader.

## Test-only browser harness

`browser-shadow-harness.html` is a script-free same-origin page used only by acceptance tests.

The browser test injects the required Foundation scripts explicitly with Playwright.

Neither root `index.html` nor `academic-main.js` loads the new architecture in normal operation.

## Real browser chain

For the three Academic core JSON resources the browser test:

1. fetches the current real resource directly to establish shadow diagnostic bytes;
2. computes SHA-256 with browser WebCrypto;
3. creates an in-memory diagnostic registry;
4. resolves the registry asset;
5. builds a delivery plan;
6. uses the real package-relative fetch adapter;
7. verifies fetched bytes in the delivery executor;
8. parses only the verified payload;
9. compares verified JSON with direct JSON.

## Safety boundary

This step is acceptance-only.

It introduces no:

- runtime authority switch;
- root script tag;
- Academic loader edit;
- persistent registry;
- learner-state change;
- route change;
- production debug UI.

## Gate

Step 7 requires all three resources to:

- resolve;
- produce ready delivery plans;
- verify successfully in Chromium;
- match directly parsed JSON;
- preserve the diagnostic registry;
- produce no console/page/request/HTTP errors.

A later step may test the same shadow chain against the packaged runtime before any source runtime integration is considered.
