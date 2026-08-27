# L7-B8 · Reference Visual and Pedagogical QA

Status: implementation gate. A deterministic local PASS is not a browser or
remote CI PASS.

## Purpose

B8 turns the roadmap requirement “visual/pedagogical QA
desktop/tablet/mobile/offline” into a fail-closed audit for the three current
reference subjects. It verifies source truth, representative learning surfaces,
responsive and accessible operation, explicit-pack offline recovery and claim
boundaries. It does not rewrite subject content or replace specialist runtimes.

The governing contract remains L6-B6
`assets/data/lesson/visual-teaching-contract-v1.json`: a visible surface needs a
learning role and source-grounded content; decoration, page activity and AI
output are not evidence.

## Audited scope

| Subject | Source truth | Representative browser surface | Ownership |
|---|---:|---|---|
| Russian | 26 lessons · 1,138 source slides | current `.learn-canva-shell` lesson reader | `russian-v13-specialist` |
| Math | 347 legacy lessons + 18 reviewed overlays · 5,852 source blocks | current E129 theory reader with E246 legacy-route guard | `math-e126-specialist` |
| Foundation | 15 preparatory bridge lessons · one reviewed runtime lesson | exact B11 Universal pilot `foundation:f_s01_l1` | Foundation legacy runtime plus exact pilot only |

The combined B7 evidence catalog remains exactly 406 lessons. Browser sampling
does not mean all 406 lessons received manual academic review. Russian and Math
retain their actual specialist UIs. Foundation retains fourteen unchanged
legacy lessons outside the one reviewed B11 activation.

## Browser matrix

The browser gate requires nine online surfaces: each of the three subjects at
desktop (1440×900), tablet (820×1180) and mobile (390×844). Every observation
checks:

- the actual learning surface and its source/runtime self-check;
- a heading, non-empty source-grounded text and named visible controls;
- a keyboard-focus path and equivalent state with reduced motion;
- no material document overflow, with a stricter one-pixel Foundation dialog
  bound and a 24-pixel minimum mobile target;
- zero page errors and zero console errors;
- no HUTECH identity drift;
- no automatic evidence or Master-ready claim.

Offline QA is separate from responsive sampling. The harness explicitly builds
the existing Foundation, Math and Russian base packs, activates the existing
site-root Service Worker, switches the browser context offline and reopens the
same deterministic learning surfaces. Offline PASS covers those discovered
base-pack dependencies; it is not whole-repository precache and does not include
large optional/session-only assets.

## Pedagogical acceptance boundary

B8 PASS means the audited surfaces preserve source identity, runtime ownership,
operability and the current learning/evidence boundaries. It does not mean
learner completion, Master-ready, whole-subject runtime cutover or academic
approval of unreviewed content.

Page views, route opens, scrolling, elapsed time, reduced-motion execution,
visual activation, self-check output and AI output cannot create an evidence
record. B7 continues to report all 2,030 evidence slots as missing until real
artifacts and authorized verification exist.

## Foundation findings retained

| Finding | B8 disposition | Claim that remains blocked | Next owner |
|---|---|---|---|
| `FOUNDATION_TEMPLATE_CONTENT_REVIEW_REQUIRED` | open, content acceptance blocking | Foundation academic/pedagogical approval | L21 Content Operations and Curriculum Governance |
| `FOUNDATION_ASSESSMENT_NOT_MASTERY_QUALIFIED` | controlled, not qualified | assessment quality and Foundation Master-ready | L21 Content Operations and Curriculum Governance |
| `FOUNDATION_SIMULATION_STAGE_DRIFT` | open, full simulation coverage blocking | full Foundation simulation coverage | L21 Content Operations and Curriculum Governance |
| `FOUNDATION_B11_SINGLE_REFERENCE_SCOPE` | accepted as limited runtime scope | whole-Foundation Universal activation | future reviewed reference expansion |

The first three findings are deliberately not “resolved” by an aggregate B8
PASS. Current measurements remain visible: all fifteen preparatory lessons share
one key-points set, one core-theory set and one mastery-criteria set; 22
preparatory question records reduce to ten unique bodies; only one observation
and one practice simulation exactly match the preparatory stage, while `m1`,
`m3`, `m4` and `prepare` remain drift values.

## Integrity and change boundary

The profile pins SHA-256 baselines for subject HTML/source data, Foundation B11
activation, the B6/B7 governance inputs, offline pack manager and Service Worker.
Any changed byte fails the deterministic audit and requires a new explicit
review. B8 itself may add only the QA profile, deterministic/browser gates,
evidence reports, documentation and CI wiring.

It may not mutate source content, migrate learner state, write review schedules
or evidence, expand Foundation activation, cut over specialist runtimes, alter
offline policy or claim Master-ready.

## Gates

Deterministic gate:

```sh
node --check scripts/academic/l7-b8-reference-visual-pedagogical-regression.cjs
node scripts/academic/l7-b8-reference-visual-pedagogical-regression.cjs
git diff --exit-code -- docs/migration/L7_B8_REFERENCE_VISUAL_PEDAGOGICAL_QA.generated.json
```

Browser gate, after a local HTTP server is ready:

```sh
BAUMAN_TEST_BASE_URL=http://127.0.0.1:4173 \
  node scripts/academic/l7-b8-reference-browser-regression.cjs
```

The browser report is CI runtime evidence and is uploaded as an artifact; it is
not treated as a pre-existing local baseline. L7-B1 through B8, L6-B1 through
B11 and the current L5 progression gates must all remain green before the B8
checkpoint is locked.

## Rollback and handoff

Rollback removes the B8 QA profile, both B8 gates, reports, documentation and CI
wiring. B1–B7 artifacts, subject source/runtime, learner state, Service Worker
and offline packs remain unchanged.

After both deterministic and remote browser gates pass, L7-B9 may designate the
official Russian and Math reference implementations without upgrading the open
Foundation content findings or merging the draft branch to `main`.
