# CODEX_STATE

Current task: E238_FORMULA_REGISTRY_COVERAGE_AUDIT

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-07
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-formula-academic-E237.js`
- `subjects/math/assets/theory_skin/theory-formula-coverage-audit-E238.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Scope:
- Audit and instrumentation only.
- No canonical theory JSON rewrite.
- No formula-content registry rewrite in this pass.
- No change to E202 slideshow logic.
- No change to E224 parser/content fallback.
- No change to E234/E235 typography.
- No change to E236 layout.

E237 instrumentation changes:
- Release changed to `E238_C01_C02_C03_ACADEMIC_AUDIT_INSTRUMENTED`.
- Matching now returns every candidate profile, not only the first match.
- Candidate ordering is deterministic:
  1. higher priority
  2. more specific/longer match keys
  3. profile id
- Registry chapter id and specificity are attached to every loaded profile.
- Formula modal now records:
  - `data-e237-match-count`
  - `data-e237-candidates`
  - `data-e237-profile`
  - `data-e237-registry`
- Unmatched formulas keep the E224 fallback content and receive:
  - `data-e237-academic="0"`
  - `data-e237-match-count="0"`
- Public diagnostic API now exposes:
  - `normalize(raw)`
  - `match(raw)`
  - `profiles()`
  - `registries()`
  - `isReady()`

E238 hidden audit tool:
- File: `theory-formula-coverage-audit-E238.js`.
- It does not render any audit panel into the learning UI.
- It loads the canonical theory JSON and the C01/C02/C03 registries only when run.
- It groups formula blocks by slide, matching the Reader Pro formula-modal behavior.
- It reports:
  - total lessons
  - total formula slides and formula blocks
  - matched, single-match, ambiguous, and unmatched slides
  - cross-chapter selected profiles
  - unused profiles
  - duplicate profile ids
  - duplicate match signatures
  - profile usage
  - per-chapter coverage
- Report is available at:
  - `window.BAUMAN_MATH_E238_AUDIT_REPORT`
- Audit API:
  - `window.BAUMAN_MATH_E238_AUDIT.run()`
  - `window.BAUMAN_MATH_E238_AUDIT.save()`

How to run locally:
1. `git pull origin main`
2. Open the math page with `?formulaAudit=1` appended to the URL.
3. Hard refresh or disable cache.
4. Open DevTools Console.
5. Read the `[E238] Formula academic coverage audit` tables.
6. Or run manually:
   `await BAUMAN_MATH_E238_AUDIT.run()`
7. Inspect:
   `BAUMAN_MATH_E238_AUDIT_REPORT.summary`
   `BAUMAN_MATH_E238_AUDIT_REPORT.unmatched`
   `BAUMAN_MATH_E238_AUDIT_REPORT.ambiguous`
   `BAUMAN_MATH_E238_AUDIT_REPORT.crossChapter`

Cache:
- `theory-formula-academic-E237.js?v=240`
- `theory-formula-coverage-audit-E238.js?v=238`

Pass criteria for the next focused-fix pass:
- zero duplicate profile ids
- zero duplicate match signatures unless explicitly documented
- zero cross-chapter selected profiles
- every important formula slide has a registry match
- ambiguous matches are intentional and highest-priority selection is correct
- unmatched low-value notation may remain on E224 fallback only if documented

Status remains `PATCHED_NEEDS_LOCAL_BROWSER_SMOKE` because the audit requires the local browser to fetch the canonical JSON and registries. No PASS is claimed yet.

Next planned batch:
- E238B: use the generated report to patch only unmatched, ambiguous, cross-chapter, or unused registry keys.
