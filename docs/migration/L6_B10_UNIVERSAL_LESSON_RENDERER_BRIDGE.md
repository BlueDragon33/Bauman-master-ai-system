# L6-B10 · Universal Lesson Renderer and legacy bridge

Status in this record is **implementation pending remote CI** until the B10
commit status is successful. This document does not by itself declare PASS or
activate a learner runtime.

## 1. Decision

L6-B10 implements a dependency-free, pure Universal Lesson Renderer and a
read-only legacy routing bridge. The renderer accepts only a canonical lesson
that passes the B8 schema/semantic validator, resolves the exact B3 policy and
builds a safe presentation model plus escaped semantic HTML. The bridge either
plans that canonical path, produces a non-authoritative review preview for a
light eLearning candidate, or delegates to the unchanged specialist engine.

| Artifact | Role |
| --- | --- |
| `assets/data/lesson/universal-lesson-renderer-contract-v1.json` | Renderer, capability, safety and bridge boundary |
| `assets/js/platform/universal-lesson/universal-lesson-renderer-v1.js` | Policy resolution, render model and safe HTML |
| `assets/js/platform/universal-lesson/legacy-lesson-bridge-v1.js` | Subject-aware read-only route/projection planner and rollback |
| `scripts/academic/l6-b10-renderer-bridge-regression.cjs` | Deterministic contract, policy, security, legacy and mutation gate |
| `docs/migration/L6_B10_RENDERER_BRIDGE_REGRESSION.generated.json` | Machine-readable evidence |

B10 deliberately performs no DOM write, network request, cache write, source
mutation, learner-state write or runtime activation. B11 owns the first
reviewed light-subject runtime path and browser/offline rollback evidence.

## 2. Policy before presentation

The renderer resolves blocks in the locked B3 order:

1. load the base rule for each of the 13 B2 semantic kinds;
2. apply the current primary lesson-type overrides;
3. apply at most one registered lesson-mode overlay;
4. evaluate the named condition against canonical metadata and supplied
   learner-state evidence;
5. resolve inline content or a truthfully available specialist capability;
6. fail missing required/external content and quarantine forbidden content;
7. omit absent optional content without creating a tab or placeholder;
8. pass only the populated semantic set to presentation.

A false condition makes a block optional, not forbidden. If source-backed
content is already present it may still be shown and is recorded as a warning;
the condition only decides whether absence is an error. Unknown conditions,
requirements, fulfillment modes and lesson modes fail closed.

The generic presenter retains the seven B2 strategy names but uses one
accessible semantic article. Strategy hints affect styling/arrangement only.
They never create a fixed set of tabs, empty routes or duplicate source blocks.

## 3. Specialist capability truthfulness

B3 external fulfillment is satisfied only by a capability exposed through a
B9 widget whose availability is `existing` or `existing-lazy`. A capability
map binds those widget IDs to their current domain functions. `declared` and
`planned-L8/L9/L10` widgets remain fallbacks and cannot satisfy an external
requirement or produce Master-ready evidence.

When an external block is valid, the render model emits a data-only action
descriptor. HTML uses `data-universal-action`, `data-capability-ref` and an
optional registered widget ID; it contains no inline handler. The owning
subject engine remains responsible for executing the interaction.

## 4. Legacy bridge routes

The bridge first validates all dependencies and the B9 registry. It resolves a
subject by stable ID and never by array index.

| Source/engine | B10 result | Runtime effect |
| --- | --- | --- |
| Russian rich specialist | `DELEGATE_SPECIALIST_ENGINE` | unchanged Russian route/adapter/state |
| Mathematics rich specialist | `DELEGATE_SPECIALIST_ENGINE` | unchanged authoritative reader/route/state |
| Programming rich specialist | `DELEGATE_SPECIALIST_ENGINE` | unchanged Programming route/adapter/state |
| canonical V2 light lesson | validate → policy → render plan | no activation before B11 |
| eLearning V1.1 light lesson | B8 dry-run candidate → `REVIEW_REQUIRED` | unchanged light runtime |
| explicit review preview | render only if policy complete | no progress/Master-ready authority |
| unknown or unclassified source | fail closed | unchanged subject runtime |

The default eLearning path returns candidate identity/digests and warnings, not
HTML. A caller must explicitly request review-preview mode. Even then the
candidate remains `manualReviewRequired`, `masterReadyClaimed=false` and cannot
write progress.

## 5. Audit finding: light capability gap

All five current light subjects use eLearning V1.1 sources and three generic
runtime widgets. Those widgets support the current legacy lesson/simulation/
assessment UI, but they do not truthfully implement every external capability
required by the strict B3 profiles. Examples include language oral evidence,
Mathematics professor defense, Programming code lab, ML metric visual and
ASOIU architecture defense.

B10 therefore does not relabel generic buttons as specialist tools. Current
light sources return `REVIEW_REQUIRED`; review previews with an unmet external
requirement return `REVIEW_PREVIEW_BLOCKED` and the unchanged legacy engine is
the fallback. B11 must add one reviewed reference projection/capability route,
then prove its runtime, responsive, offline and rollback behavior. This is an
implementation requirement already inside B11, not a reason to weaken B3.

Foundation remains additionally fail-closed for `f_m201` and `f_m202` through
the B9 `UNCLASSIFIED_LESSON` result.

## 6. HTML and assessment safety

All source text is escaped. Raw source HTML, scripts, inline event handlers,
source URLs and executable attributes are never emitted. Recursive payloads
become structured lists/definition lists with bounded JSON input inherited
from B8. Navigation anchors are generated only from safe block IDs.

During an active official attempt, answer/solution/correct-state keys are
replaced recursively by `[protected-until-submit]`. Submission state is an
explicit input; a source field cannot disable protection. Review-preview HTML
has a visible status banner and states that it neither writes progress nor
creates Master-ready evidence.

The renderer never decides Master-ready. Every model sets
`masterReadyClaimed=false` and records `external-b5-policy-only` as authority.
Orientation-only mode suppresses top-level mastery evidence from its view.

## 7. Program, source and offline identity

Canonical validation retains the distinct Bauman fields:

- official source direction: `09.04.01`;
- personalized learner display: `09.04.01/11`;
- department: `ИУ-5`.

The learner header displays the personalized identity. Source binding and
content version remain in the model, while array position is never treated as
identity. Offline refs must already resolve under the B8 schema; the renderer
does not fetch or cache them and does not add large resources to the shell.

## 8. Rollback

Every bridge plan stores a SHA-256 source digest and direct legacy route.
Rollback verifies the current source against that digest, returns the unchanged
subject route and confirms that no learner/cache write occurred. A modified
source cannot be rolled back through a stale plan.

Repository rollback removes B10-only contract/code/docs/report/workflow
changes and restores progress markers to the B9 checkpoint. Because B10 is not
loaded by learner entry points, existing engines continue to work throughout.

## 9. Gate evidence required before PASS

B10 may be marked PASS only after all of the following are observed on the
same source checkpoint:

- all B2-B9 references and the renderer contract validate;
- all eight B4 types resolve a schema-valid, policy-complete canonical fixture;
- required, optional, conditional, forbidden and external behavior fail or
  render exactly as specified;
- safe HTML is deterministic, escaped, accessible and answer-protected;
- Russian, Mathematics and Programming return unchanged specialist routes;
- all current light representatives remain review-only and capability gaps
  fail closed;
- source digests, rollback and no-write/no-runtime-wiring boundaries pass;
- mutations prove that escaping, disclosure, policy, specialist delegation,
  planned-capability, write and rollback guards are effective;
- B1 through B10 gates and L5 clean-baseline regression remain green;
- GitHub Actions publishes successful context
  `migration/l6-b10-renderer-bridge`.

Until that remote context succeeds, the plan/state must call B10 pending
remote CI, not PASS.

## 10. Forward ownership

- B11 wires and validates one reviewed light reference path and performs
  Russian/Mathematics runtime/offline/rollback regression.
- L7 reviews full Russian, Mathematics and Foundation projections.
- L8-L10 implement planned specialist widgets before capability activation.
- L12 activates reviewed Russian Twin and English Research learner surfaces.
- L13 attaches grounded AI context without changing evidence authority.

No item above is claimed complete by B10.
