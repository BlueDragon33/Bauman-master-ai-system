# E132 · Theory UI + Slideshow Contract

Status: Round 1 contract for standardizing the Math Theory tab UI and slideshow experience.

E132 starts after E130 is complete. It must preserve E129/E130 source-of-truth rules while upgrading the visual system and slideshow layer.

## 1. Purpose

E132 standardizes the dedicated UI for the Math Theory tab, especially the slide presentation mode.

The goal is to make Theory feel like a professional learning page and an academic slide deck, not a long stacked list of raw slide articles.

## 2. Non-negotiable source rules

Do not change the Theory content source-of-truth:

- Frame: `subjects/math/data/theory_lecture_frame.json`
- Content: `subjects/math/data/theory_lecture_content.json`
- Legacy fallback only: `subjects/math/data/lessons.json`

Do not:

- make `lessons.json` primary again;
- rewrite `chapter_spine.json`;
- rewrite `subject-manifest.json`;
- hard-code lesson content into JS;
- move slide content into UI/CSS files;
- break E130 program frame route.

## 3. Current E129 condition

E129 already provides:

- frame/content loading;
- safe slide normalization;
- 16 preferred slide roles;
- runtime overlay/importer for `theory_lecture_content`;
- a basic presenting mode.

However, the current presentation mode is not yet a true deck experience. It mostly hides sidebar/topbar and still renders slides as a vertical list.

E132 should add a new visual/presentation layer without replacing E129 importer logic.

## 4. Canva role

Canva is used as a visual reference and design-system companion, not as the source of runtime truth.

Canva should guide:

- color palette;
- layout rhythm;
- slide hierarchy;
- academic-tech moodboard;
- cover/concept/formula/lab/QA/takeaway templates.

Runtime implementation remains in repo files so the module works locally/offline.

## 5. Canva-style design tokens

Recommended visual identity:

- Background: deep navy / near black.
- Accent cyan: engineering/AI/data highlight.
- Accent violet/blue: theorem/formula/structure highlight.
- Accent emerald: Lab Work/application highlight.
- Warning amber/red: mistakes/assumption gates.
- Text: warm white and blue-gray.

Recommended CSS token names for Round 2:

```css
--e132-bg-deep
--e132-bg-panel
--e132-line-soft
--e132-text-main
--e132-text-muted
--e132-accent-cyan
--e132-accent-violet
--e132-accent-emerald
--e132-accent-amber
--e132-radius-xl
--e132-shadow-deck
```

## 6. Slide role layout mapping

E132 must map slide roles to distinct layouts:

1. `problem_framing` -> cover/problem layout.
2. `deep_essence` -> big idea layout.
3. `counter_intuition` -> contrast/warning layout.
4. `real_bridge` -> engineering bridge layout.
5. `notation` -> notation card layout.
6. `core_formula` -> formula hero layout.
7. `assumption_gate` -> assumptions/checklist layout.
8. `mini_case` -> case study layout.
9. `interpretation` -> explanation/meaning layout.
10. `simulation` -> lab/simulation preview layout.
11. `common_mistakes` -> mistake warning layout.
12. `application` -> application/lab layout.
13. `practice` -> exercise/task layout.
14. `professor_qa` -> Q&A dialogue layout.
15. `bridge` -> next concept bridge layout.
16. `takeaway` -> summary/takeaway layout.

## 7. Slideshow UX requirements

The slideshow should include:

- one active slide at a time;
- previous/next controls;
- slide index and progress bar;
- keyboard navigation: ArrowLeft/ArrowRight/Escape;
- fullscreen/presentation mode;
- readable formula/code cards;
- role label and chapter/lesson metadata;
- clean empty state when no slides exist;
- graceful fallback to E129 reader.

## 8. Reader UX requirements

The non-presentation Theory reader should be polished too:

- stronger chapter header;
- clearer lesson chips;
- cards for pure/applied/bridge/outcome;
- compact slide preview grid;
- obvious `Trình chiếu` entry point;
- avoid repeating noisy metadata everywhere;
- keep search/stage/chapter tree useful.

## 9. Implementation strategy

Prefer adding E132 assets rather than rewriting the large E129 renderer directly.

Recommended files:

- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- optional `subjects/math/assets/theory_skin/theory-ui-tokens-E132.css`

Patch `index.html` only to load the E132 CSS/JS after E129 assets.

Patch E129 only if strictly needed to expose stable hooks. Do not rewrite E129.

## 10. Runtime contract

E132 may decorate and enhance E129 output, but must not change:

- import target;
- storage route;
- DataVault source names;
- chapter IDs;
- lesson IDs;
- E130 program-frame source files.

E132 should expose:

```js
BAUMAN_MATH_THEORY_E132.selfCheck()
```

Expected fields:

```js
{
  ok: true,
  release: "E132_THEORY_UI_SLIDESHOW",
  e129Detected: true,
  importTargetUnchanged: "theory_lecture_content",
  slideshowEnhancer: true,
  canvaReference: true
}
```

## 11. Regression gates

Before declaring E132 complete:

- E129 Theory route still opens.
- E129 storage/importer still targets `theory_lecture_content`.
- E130 program route still opens.
- E130 chapter pills still return to the correct E129 chapter.
- Legacy E126 remains suppressed by E129.
- Existing content bundle still validates/imports.
- Presentation mode can open, navigate, and close without freezing the page.

## 12. Suggested 7-round plan

Round 1: Inspect + create this contract.
Round 2: Create E132 design tokens and Canva style guide file.
Round 3: Add slideshow enhancer shell.
Round 4: Polish Theory reader layout.
Round 5: Add Canva-ready template notes and optional Canva design link/reference.
Round 6: Verify regression and patch narrow issues.
Round 7: Final E132 handoff.

## 13. Rollback rule

If E132 breaks UI, remove E132 CSS/JS links from `index.html`.

E129/E130 should continue working because E132 is only an enhancer layer.

End of contract.
