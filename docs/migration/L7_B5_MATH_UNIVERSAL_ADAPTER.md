# L7-B5 · Math Universal Adapter and Web App Consolidation

Status: implementation gate. A local PASS is not a remote CI PASS.

## Pinned source and destination

- Imported selectively from `BlueDragon33/Math_Bauman` commit
  `361d597334eb2511f68abb5df41d3236e137d457`.
- Source CI evidence: Math Bauman Web App Quality run `32837654327` succeeded.
- Destination remains `BlueDragon33/Bauman-master-ai-system`, branch
  `migration/webapp-l1-audit-storage`.
- `main` is unchanged. The integration policy is
  `controlled-overlay-no-blind-merge`.

## Source preservation boundary

- `subjects/math/data/lessons.json`: 347 legacy lessons, 5,552 ordered slides,
  byte SHA-256
  `4a77e812ac13bdd3076bf34ff47362c2bbd0157c5210d466f63df1d9fd8e324d`.
- `subjects/math/data/theory_lecture_content.json`: 18 reviewed overlays,
  300 ordered slides, byte SHA-256
  `d0cd18601b1ede84f58072b3c47cfcc176b4d21d3fa71b23762b908485391447`.
- Legacy and overlay lesson IDs remain separate namespaces. The adapter does
  not rewrite either source, learner progress or assessment state.
- The 341 sequence edges from B4 remain non-blocking, system-derived review
  candidates. They are not displayed as reviewed official prerequisites.

## Universal projection

`math-universal-adapter-v1.js` projects both source families read-only into
Universal Lesson Contract v2:

- 347 legacy fallback lessons at precedence 100;
- 18 reviewed theory overlays at precedence 200;
- one Universal block per source slide, in unchanged source order;
- formula, ordered solution, parameter simulation and professor oral work stay
  owned by the registered Math specialist capabilities;
- understand → solve → build/apply → explain → retain evidence starts in
  `missing`; page views never create mastery evidence;
- offline fallback remains the existing Math runtime under the site-root PWA.

An overlay is not silently substituted for a legacy lesson by array position.
The two namespaces remain explicit until a reviewed mapping exists.

## Web App correction added by audit

The destination manifest referenced `assets/core.js`, but the file was absent
and `subjects/math/index.html` did not load the core, manifest, planning bridge
or learner layer. This made the consolidated Math work invisible.

The controlled integration now:

1. restores the pinned legacy core and exposes all 347 lessons;
2. loads the existing 18-overlay theory route after the core;
3. adds resume, bookmark, notes and a three-item lesson checklist;
4. reads/writes state only through `BaumanSubjectStorage`;
5. preserves malformed or oversized legacy payloads instead of deleting them;
6. leaves Service Worker ownership at the site root—no nested Math worker;
7. labels missing reviewed prerequisites truthfully;
8. corrects active catalog paths and measured counts, including zero-record
   external banks.

Official-source identity remains `09.04.01`; the personalized learner display
remains `Bauman ИУ-5 · 09.04.01/11`.

## Gate

```sh
node --check assets/js/platform/universal-lesson/math-universal-adapter-v1.js
node --check scripts/academic/l7-b5-math-universal-adapter-regression.cjs
node scripts/academic/l7-b5-math-universal-adapter-regression.cjs
git diff --exit-code -- docs/migration/L7_B5_MATH_UNIVERSAL_ADAPTER.generated.json
```

Browser, responsive, persistence and site-root offline checks run separately;
the static adapter gate cannot replace observed browser evidence.
