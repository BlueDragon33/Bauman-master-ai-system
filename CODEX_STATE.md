# CODEX_STATE

Current task: E237B_C02_FORMULA_ACADEMIC_STANDARDIZATION

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-07
Branch: `main`

Files changed:
- `subjects/math/data/theory_formula_academic_c02.json`
- `subjects/math/assets/theory_skin/theory-formula-academic-E237.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Architecture:
- Canonical `theory_lecture_content.json` was not rewritten.
- Chapter 1 and Chapter 2 academic content are stored in separate sidecar registries.
- E237 is now a multi-registry content bridge.
- Each registry is fetched independently; if one registry fails, the other can still load.
- E202 remains the only slideshow engine.
- E224 remains the parser/content fallback.
- E234/E235 remain the math typography layer.
- E236 remains the mini-lesson layout layer.

Registries loaded:
1. `data/theory_formula_academic_c01.json`
2. `data/theory_formula_academic_c02.json`

Chapter 2 profiles added:
1. Matrix shape and element notation `A in R^{m x n}`, `a_ij`
2. Matrix-vector map `y = A x`
3. Row-dot interpretation `y_i = a_i · x`
4. Matrix product shape `A(m x n) B(n x p) -> AB(m x p)`
5. Matrix product element `(AB)_{ij}`
6. Column space and rank
7. System consistency `Ax=b`, `b in Col(A)`
8. Inverse identities and solution `A^{-1}`, `x=A^{-1}b`
9. Linearity axioms
10. Scale matrix
11. Rotation matrix
12. Projection matrix
13. Basis change `x=Bc`
14. PCA projection `Z=X_c W_k`
15. Linear model `y=Xw+b`
16. State transition `x_{t+1}=Ax_t`

Academic content rules:
- Each matched profile provides formula-specific analysis, assumptions/failure conditions, engineering application, and concise Python.
- Inverse/system profiles explicitly prefer `np.linalg.solve` or `lstsq` over manual inverse.
- Rank profiles distinguish algebraic rank from effective numerical rank.
- PCA profiles require centering and discuss scaling and explained variance.
- Projection and scale profiles explicitly describe information loss and rank change.
- Rotation profile checks orthogonality.
- Matrix multiplication profiles preserve order and shape semantics.

Bridge changes:
- Release: `E237B_C01_C02_FORMULA_ACADEMIC_BRIDGE`.
- Uses `REGISTRY_URLS` and loads both registries with independent error handling.
- Merges and sorts all profiles by priority.
- Adds `data-e237-registry` to the modal for auditability.
- Replaces only Analysis, Application, and Python sections.
- Formula rendering and E236 layout remain untouched.
- Falls back to E224 whenever no profile matches.

Cache:
- `subjects/math/index.html` loads `theory-formula-academic-E237.js?v=238`.

Required local smoke:
1. `git pull origin main`
2. Hard refresh or disable browser cache.
3. Test representative Chapter 2 formulas:
   - §2.1 `A in R^{m x n}` and `y=Ax`
   - §2.2 matrix multiplication shape and `(AB)_{ij}`
   - §2.3 `Col(A)`, rank, and `Ax=b`
   - §2.4 inverse and system solution
   - §2.5 scale, rotation, projection, and `x=Bc`
   - §2.6 `Z=X_c W_k` and `y=Xw+b`
4. Confirm:
   - analysis is formula-specific
   - assumptions are mathematically correct
   - Python matches the current formula family
   - Chapter 1 profiles still work
   - E234/E235 typography and E236 layout remain unchanged
   - no new console errors
5. Optional DOM checks:
   - `data-e237-academic="1"`
   - `data-e237-profile="c02_..."`
   - `data-e237-registry="data/theory_formula_academic_c02.json"`

Remaining risks:
- Matching is profile-based, not a complete symbolic parser.
- A substantially changed source formula may fall back to E224 until match keys are extended.
- Browser smoke was not available from this chat environment, so status is not PASS.

Next planned batch:
- E237C: Chapter 3 functions, derivatives, partial derivatives, gradient, Jacobian, Hessian, optimization, and loss functions.
