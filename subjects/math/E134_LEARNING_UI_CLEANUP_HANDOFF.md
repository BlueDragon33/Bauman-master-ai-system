# E134 · Learning UI Cleanup Handoff

Status: applied after user reported learner-facing UI had too many technical notes, duplicated stage controls, and missing learning tab switching.

## User-facing goals

1. Remove technical note text from the visible learning UI.
2. Restore a compact learning tab bar: Lý thuyết, Bài tập, Mô phỏng, Kiểm tra.
3. Keep one global stage selector in the sidebar.
4. Remove duplicated stage tabs inside Theory.
5. Keep DataVault and content files untouched.

## Files added

- `subjects/math/assets/learning_clean/learning-clean-E134.css`
- `subjects/math/assets/learning_clean/learning-clean-E134.js`
- `subjects/math/E134_LEARNING_UI_CLEANUP_HANDOFF.md`

## File patched

- `subjects/math/index.html`

## Runtime behavior

`learning-clean-E134.css` hides learner-facing technical noise:

- brand subtitle;
- topbar kicker/subtitle/status;
- E129 side-head description;
- E129 internal stage tabs;
- E129 status counters in the learner view.

`learning-clean-E134.js` adds/maintains a compact learning tab bar:

- Lý thuyết;
- Bài tập;
- Mô phỏng;
- Kiểm tra.

The tab bar is inserted below the topbar. It uses the existing global sidebar stage selector and does not create a second stage selector inside tabs.

For non-Theory tabs, it renders simple cards from the matching dataset filtered by the current global stage:

- exercises from `DB.exercises`;
- simulations from `DB.simulations` or `DB.simulation_content`;
- tests from `DB.tests.questions` or `DB.question_bank`.

Theory still uses E129.

## Current self-check

In browser console:

```js
BAUMAN_MATH_E134_CLEAN_LEARNING.selfCheck()
```

Expected:

```js
{
  ok: true,
  release: "E134_CLEAN_LEARNING_RUNTIME",
  tabBar: true,
  internalStageTabs: 0
}
```

## Manual test

1. Pull origin.
2. Hard refresh browser.
3. Open `subjects/math/index.html` with Live Server.
4. Confirm the sidebar title only shows `Toán Bauman` without technical subtitle.
5. Confirm the topbar has no technical subtitle/kicker clutter.
6. Confirm the learning tab bar is visible.
7. Click Lý thuyết, Bài tập, Mô phỏng, Kiểm tra.
8. Confirm no duplicate stage selector appears inside the tab body.
9. Change global stage in the sidebar and confirm Bài tập/Mô phỏng/Kiểm tra filter by that stage.

## Rollback

Remove these lines from `subjects/math/index.html`:

- `assets/learning_clean/learning-clean-E134.css`
- `assets/learning_clean/learning-clean-E134.js`

Do not remove or modify E129/E130/E133 files for this rollback.

## Do not do next

- Do not re-add technical version labels to the learner UI.
- Do not add internal stage selectors inside tabs.
- Do not remove the learning tab bar.
- Do not move content to `lessons.json`.
- Do not rewrite `subject-manifest.json` casually.

End of E134 handoff.
