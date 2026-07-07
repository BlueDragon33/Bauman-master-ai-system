# CODEX_STATE

Current task: E237A_C01_FORMULA_ACADEMIC_STANDARDIZATION

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-07
Branch: `main`

Files changed:
- `subjects/math/data/theory_formula_academic_c01.json`
- `subjects/math/assets/theory_skin/theory-formula-academic-E237.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Architecture:
- The canonical `theory_lecture_content.json` and its schema were not rewritten.
- E237A introduces a sidecar academic registry for Chapter 1 formula families.
- E237A is a content-only bridge loaded after E236.
- E202 remains the only slideshow engine.
- E224 remains the formula parser/content fallback.
- E234/E235 remain the math typography layer.
- E236 remains the mini-lesson layout layer.

Why a registry was used:
- Avoid rewriting a 5,000+ line canonical JSON file for popup-only enrichment.
- Keep formula-specific academic content independent from parser and layout code.
- Allow Chapter 2 and Chapter 3 to be added as separate reviewable registries.
- Make each formula family easy to audit, replace, and test.

Chapter 1 profiles added:
1. Core norm / dot / distance / cosine metrics
2. Cosine zero-vector guard
3. Vector schema and `R^n`
4. Robot/server state vectors
5. Vector addition and scalar multiplication
6. A/B/C engineering-data example
7. L1 / L2 / Linf norm family
8. Weighted distance
9. Dot product / cosine / projection / perpendicular residual
10. Basis and span
11. Linear independence
12. Subspace closure conditions
13. Rank and dimension
14. Data matrix and shape `(m,n)`

Each profile contains:
- two focused mathematical analysis cards where appropriate
- one or two concrete engineering/application cards
- a concise executable Python snippet
- explicit assumptions or failure conditions

Bridge behavior:
- Reads the raw formula from the active Reader Pro formula strip or formula modal.
- Normalizes accents, Greek symbols, Unicode superscripts/subscripts, and spacing for matching.
- Selects the highest-priority matching Chapter 1 profile.
- Replaces only:
  - `Phân tích công thức`
  - `Ứng dụng`
  - `Cách dùng trong code Python`
- Does not modify the rendered formula section.
- Does not modify E236 section classes or layout.
- Falls back to E224 content when no Chapter 1 profile matches.

Index load order:
- E224 formula parser/content fallback
- E234 balanced fraction/radical typesetter
- E235 fraction alignment
- E212 fit bridge
- E236 mini-lesson layout
- E237 Chapter 1 academic content bridge

Required local smoke:
1. `git pull origin main`
2. Hard refresh or disable browser cache.
3. Open `Xem đầy đủ` for representative Chapter 1 formulas:
   - §1.1 core norm/dot/distance/cosine
   - §1.1 zero-vector cosine condition
   - §1.2 L1/L2/Linf or weighted distance
   - §1.3 projection and perpendicular residual
   - basis/span/linear-independence formula
   - subspace closure formula
   - rank/dimension formula
   - data matrix `X` and shape `(m,n)`
4. Confirm:
   - analysis is formula-specific and not generic
   - assumptions are mathematically correct
   - application is concrete
   - Python snippet matches the current formula family
   - formula typography and E236 layout remain unchanged
   - no new console errors
5. Optional DOM check:
   - modal has `data-e237-academic="1"`
   - modal `data-e237-profile` matches the expected profile id

Remaining risks:
- This is profile matching, not a complete symbolic classifier.
- A formula whose source wording changes substantially may fall back to E224 until its registry match keys are extended.
- Browser smoke was not available from this chat environment, so status is not PASS.

Next planned batch:
- E237B: Chapter 2 matrix, rank, inverse, linear systems, transformations, PCA/SVD/covariance.
