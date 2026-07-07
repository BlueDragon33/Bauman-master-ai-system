# CODEX_STATE

Current task: E238B_CHAPTER_SCOPED_FORMULA_MATCH_FIXES

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-07
Branch: `main`

Files changed:
- `subjects/math/data/theory_formula_match_aliases_e238b.json`
- `subjects/math/assets/theory_skin/theory-formula-academic-E237.js`
- `subjects/math/assets/theory_skin/theory-formula-coverage-audit-E238.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Scope:
- Focused registry-key and matching fixes only.
- No canonical theory JSON rewrite.
- No changes to E202, E224, E234, E235, or E236.
- No visual debug panel was added.

Root problems fixed:
1. Cross-chapter candidates polluted matching because common notation such as `x in R^n` appears in multiple chapters.
2. Equivalent formulas with different whitespace around operators, brackets, matrix entries, and relations failed exact substring matching.
3. Several important Chapter 1 formula slides had no direct registry key even though an existing profile already contained suitable academic content.

E238B runtime changes:
- Academic profile selection is now chapter-scoped when the active lesson chapter can be resolved.
- Chapter is resolved from state, lesson ids, the active E129 shell, E210 lesson identity, and modal context.
- Foreign-chapter candidates are recorded but cannot replace the same-chapter profile.
- Formula/key normalization now canonicalizes:
  - accents and common Greek symbols
  - Unicode membership, gradient, partial derivative, relations, arrows, and minus signs
  - superscript/subscript Unicode digits used by the project
  - spaces around arithmetic and relation operators
  - spaces inside brackets/parentheses
  - common dimension forms such as `m x n`
- Candidate ordering remains deterministic: priority, specificity, then id.

Focused alias file:
- Added `data/theory_formula_match_aliases_e238b.json`.
- It maps alternate source forms to existing profiles without duplicating academic content.
- Covered aliases include:
  - Chapter 1 feature-vector choices
  - linear score and orthonormal coordinate notation
  - basis decomposition and residual `r=v-Bc`
  - Chapter 2 scale/projection matrices and state transition
  - Chapter 3 differential approximation, parameter update, and forward-flow notation

Modal diagnostics:
- `data-e237-chapter`
- `data-e237-match-count`
- `data-e237-candidates`
- `data-e237-foreign-candidates`
- `data-e237-profile`
- `data-e237-registry`

Audit changes:
- E238B audit uses the same canonical normalization, aliases, priority ordering, and chapter scope as runtime.
- Ambiguity is now measured only inside the correct chapter.
- Foreign candidates are reported separately as ignored noise.
- Report remains available through:
  - `BAUMAN_MATH_E238_AUDIT.run()`
  - `BAUMAN_MATH_E238_AUDIT_REPORT`

Cache:
- `theory-formula-academic-E237.js?v=241`
- `theory-formula-coverage-audit-E238.js?v=239`

Required local smoke:
1. `git pull origin main`
2. Hard refresh or disable cache.
3. Open representative formulas from Chapters 1, 2, and 3.
4. Confirm selected profile id begins with the active chapter prefix:
   - Chapter 1 -> `c01_`
   - Chapter 2 -> `c02_`
   - Chapter 3 -> `c03_`
5. Confirm no formula from another chapter replaces the current content.
6. Run:
   `await BAUMAN_MATH_E238_AUDIT.run()`
7. Inspect:
   - `.summary`
   - `.unmatched`
   - `.ambiguous`
   - `.foreignCandidates`
8. Confirm no new console errors.

Status is not PASS because the final audit still requires a local browser fetch of the canonical JSON and registries.

Next planned batch:
- E238C: use the E238B report to patch only the remaining unmatched formulas and intentional ambiguities, then freeze the C01-C03 academic registry layer.
