# CODEX_STATE

Current task: E237C_C03_FORMULA_ACADEMIC_STANDARDIZATION

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-07
Branch: `main`

Files changed:
- `subjects/math/data/theory_formula_academic_c03.json`
- `subjects/math/assets/theory_skin/theory-formula-academic-E237.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Architecture:
- Canonical `theory_lecture_content.json` was not rewritten.
- Formula academic content is split into three sidecar registries: C01, C02, C03.
- E237 is a content-only multi-registry bridge loaded after E236.
- E202 remains the only slideshow engine.
- E224 remains the parser/content fallback.
- E234/E235 remain the math typography layer.
- E236 remains the mini-lesson layout layer.

Registries loaded:
1. `data/theory_formula_academic_c01.json`
2. `data/theory_formula_academic_c02.json`
3. `data/theory_formula_academic_c03.json`

Chapter 3 profiles added:
1. Scalar function `y=f(x)`
2. Multivariable function `y=f(x_1,...,x_n)`
3. Vector function `f: R^n -> R^m`
4. Parameterized model `y=f(x;theta)`
5. Derivative limit definition
6. Derivative notation and physical units
7. Local linearization
8. Gradient vector
9. Partial derivative
10. Directional derivative
11. Gradient descent state update
12. Parameter update with learning rate
13. MSE loss
14. Stationary-point condition
15. Second-order/Hessian test
16. Composite functions
17. Chain rule
18. Forward/backward flow
19. Weight update

Academic content rules:
- Each matched profile supplies formula-specific analysis, assumptions/failure conditions, engineering application, and concise Python.
- Numerical differentiation uses central difference and explains truncation versus roundoff error.
- Gradient profiles distinguish direction, scale sensitivity, and zero/vanishing/exploding gradients.
- Gradient-descent profiles explain learning-rate stability and monitored training loops.
- MSE profile explains outlier sensitivity and validation requirements.
- Stationary/Hessian profiles distinguish local minimum, maximum, saddle, and inconclusive curvature.
- Chain-rule/backprop profiles separate gradient computation from optimizer updates.

Bridge changes:
- Release: `E237C_C01_C02_C03_FORMULA_ACADEMIC_BRIDGE`.
- Adds `data/theory_formula_academic_c03.json` to `REGISTRY_URLS`.
- All registries load independently and are merged by priority.
- Replaces only Analysis, Application, and Python sections.
- Formula rendering, E234/E235 typography, and E236 layout remain untouched.
- Falls back to E224 whenever no profile matches.

Cache:
- `subjects/math/index.html` loads `theory-formula-academic-E237.js?v=239`.

Required local smoke:
1. `git pull origin main`
2. Hard refresh or disable browser cache.
3. Test representative Chapter 3 formulas:
   - §3.1 `y=f(x)`, vector function, and `y=f(x;theta)`
   - §3.2 derivative limit, `dy/dx`, and local linearization
   - §3.3 gradient, partial derivative, directional derivative
   - §3.4 gradient-descent updates and learning rate
   - §3.5 MSE, `grad J=0`, and Hessian test
   - §3.6 composite function, chain rule, backward flow, and weight update
4. Confirm:
   - analysis is formula-specific
   - assumptions and failure cases are correct
   - Python matches the current formula family
   - C01 and C02 profiles still work
   - formula typography and E236 layout remain unchanged
   - no new console errors
5. Optional DOM checks:
   - `data-e237-academic="1"`
   - `data-e237-profile="c03_..."`
   - `data-e237-registry="data/theory_formula_academic_c03.json"`

Remaining risks:
- Matching is profile-based, not a full symbolic parser.
- A substantially changed formula source may fall back to E224 until match keys are extended.
- Browser smoke was not available from this chat environment, so status is not PASS.

Next planned batch:
- E238: coverage audit across C01-C03, unmatched-formula inventory, duplicate-profile detection, and focused registry-key fixes only.
