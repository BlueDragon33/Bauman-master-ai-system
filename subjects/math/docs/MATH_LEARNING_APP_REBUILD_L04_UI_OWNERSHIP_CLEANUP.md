# Math Learning Application Rebuild — LƯỢT 4 Design-System / Ownership Cleanup

## Goal
Remove competing UI ownership before deeper visual work. This pass intentionally avoids adding another CSS generation.

## Findings
1. `math-navigation.js` already defines the learner-first five-item primary navigation.
2. `math-dashboard.js` already defines a decision-first learner home.
3. `math-premium.js` was still creating:
   - a second dashboard (`#mathPremiumDashboard`);
   - a second Overview navigation entry;
   - a persistent Control navigation entry.
4. `math-workspace.js` was also able to append Lab/Control navigation/topbar actions.

This is the exact composition debt described in L01: multiple modules owned the same visible role.

## Changes
- Workspace no longer appends persistent Lab/Control primary navigation or topbar buttons.
- Premium UI no longer creates a second dashboard.
- Premium UI no longer creates persistent navigation entries.
- Premium is reduced to visual/search enhancement behavior.
- Canonical ownership is now:
  - primary learner nav → `math-navigation.js`
  - learner overview → `math-dashboard.js`
  - advanced workspace → contextual/launcher behavior only

## CSS decision
No V-next override stylesheet was added.

Existing historical CSS remains to be retired incrementally only after its runtime owner is removed. This avoids deleting selectors that legacy renderer code still depends on before replacement components are proven.

## Gate
- duplicate dashboard creator removed: PASS
- workspace persistent nav injection removed: PASS
- premium persistent nav injection removed: PASS
- no new V6/V7 override layer introduced: PASS
- learner navigation has a single JS owner: PASS
- learner overview has a single JS owner: PASS

## LƯỢT 4 result
**PASS**

Remaining CSS debt is now retirement debt, not competing ownership debt. It will be deleted together with retired runtime modules rather than covered by more overrides.
