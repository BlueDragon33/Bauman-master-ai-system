# L31 / B121–B123 — Read-only Main and subject UI audit

## Scope

L31 audits the pinned pre-L31 head `a1eece596c198f48cdd84f77c59986f59eb2eb3d`. It covers Main plus all eight physical subject entrypoints at desktop `1440×900` and mobile `390×844`. It does not authorize production HTML, CSS, JavaScript, runtime, persistence, or user-data writes.

## Pinned source topology

| Family | Targets | Evidence |
|---|---|---|
| Main | `index.html` | Main shell, local client authentication, stages, subject-message receiver |
| Shared Subject Module V2 | AI, Foundation, Research, Signal, Systems | Five JavaScript files share blob `e2d69b…`; five CSS files share blob `d4a25a…` |
| Large core + planning bridge | Programming, Russian | Direct adapter, planning bridge, and large core loads |
| Math patch stack | Math | Patch-stack scripts plus default-OFF Roadmap bridge; planning bridge is present but not directly loaded by the entrypoint |

The physical UI currently has eight subject routes. The accepted L30 curriculum target has ten courses. L31 records that gap; it does not invent or delete routes.

## Static findings

The deterministic audit records 16 findings, all `OPEN`: one critical, eight high, and seven medium.

| Priority | Finding |
|---|---|
| Critical | Default administrator email/password are prefilled and duplicated in client code/localStorage initialization. |
| High | Five shared modules emit `SUBJECT_FEEDBACK`; Main accepts only `BAUMAN_SUBJECT_PROGRESS` or `BAUMAN_PROGRESS_REPORT`. |
| High | Stage semantics conflict: Main `GĐ1–GĐ3`, Roadmap V2 `GĐ0–GĐ3`, and Math contains competing definitions. |
| High | Eight physical modules do not yet express the ten-course target information architecture. |
| High | Shared quiz copy advertises 20/30/40/50 questions while implementation caps selection at 10. |
| High | Shared modules can mark a lesson complete without the accepted evidence-backed mastery gate. |
| High | Diagnostic, six-state mastery, dependency eligibility, readiness, and Master Mode are absent from the legacy UI. |
| High | Cross-frame messages use wildcard delivery and do not validate origin/source. |
| High | Current Bauman Subjects must remain a fail-closed dynamic import, never guessed static content. |

Medium findings cover incomplete JSON import behavior, generic byte-identical subject runtimes, keyword-only assistant behavior, legacy percentage semantics, Math patch-stack maintenance risk, and the need to trace `innerHTML` data flows without overclaiming exploitability. The corrected Chromium heuristic also found 17 visible controls without programmatically associated names across all nine routes (Main 4; shared five 2 each; Math, Programming, and Russian 1 each over two viewports).

## Browser acceptance design

B123 runs real headless Chromium against nine routes and two viewports, producing 18 observations. Each observation records HTTP status, title, page errors, request failures, horizontal overflow, keyboard focus progression, landmarks/headings, and unlabeled form controls. It also behaviorally checks the Main credential prefill and the five shared `SUBJECT_FEEDBACK` messages.

The browser audit may pass **with findings**; it fails closed if coverage, entrypoint availability, required behavior evidence, or read-only safety boundaries drift.

## Current acceptance

- B121: `PASS_B121_UI_AUDIT_CONTRACT_AND_PINNED_INVENTORY`
- B122: `PASS_B122_DETERMINISTIC_STATIC_AUDIT_WITH_FINDINGS`
- B123 unit failure modes: 25/25 pass after one validator-order defect was fixed and the full set rerun
- B123 real Chromium: PASS on run `31679230862` with 18/18 observations, 0 page errors, 0 request failures, and 0 horizontal-overflow observations
- B124: PASS on run `31679453304`; the browser-informed F014 package, full L19–L31 regression and production boundary all passed
