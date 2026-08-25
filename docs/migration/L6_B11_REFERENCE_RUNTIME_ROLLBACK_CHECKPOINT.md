# L6-B11 · Reference runtime, capability and rollback checkpoint

Status: implementation complete; deterministic, browser/offline and remote CI
gates must pass before B11 is marked PASS.

Branch: `migration/webapp-l1-audit-storage` only. `main` is unchanged.

## Decision

B11 activates exactly one reviewed light-subject reference path:
`foundation:f_s01_l1`. The B9 Subject Factory classifies this lesson as
`language` through rule `foundation-classroom-and-study`. No other Foundation,
AI, Signal, Systems or Research lesson is activated by this checkpoint.

This choice keeps the planned L8-L10 specialist work in its own rounds. It also
closes the B10 `LIGHT-POLICY-CAPABILITY-GAP` with a real capability rather than
renaming a generic simulation or using the `orientation-only` overlay.

The reference lesson resolves the full default B3 language policy to ten
meaningful sections. The required oral section is external and binds to only
one provider:

- capability: `speech-recording`;
- widget: `foundation-oral-rehearsal`;
- implementation: browser `MediaRecorder` with a same-device microphone;
- lifetime: current modal memory only;
- upload and persistence: forbidden.

If `MediaRecorder`, `getUserMedia`, a reviewed dependency, the source digest or
the exact projection/render digest is unavailable, the Universal path fails
closed and the unchanged Foundation eLearning modal opens instead.

## Source and review boundary

`subjects/foundation/data/lessons.json` is neither edited nor rewritten. The
B8 migrator creates a deterministic in-memory candidate from the exact
`f_s01_l1` source record. B11 accepts it only when all of these pins match:

- source record SHA-256 stable JSON;
- migration context SHA-256;
- canonical output SHA-256;
- render-model SHA-256;
- safe semantic HTML SHA-256;
- locked B8 schema, B3 block policy and B9 Factory registry SHA-256.

The review record covers source-preserving mapping, policy completeness,
capability truth and runtime behavior. It explicitly claims neither academic
approval nor Master-ready approval. Opening the lesson, recording audio or
marking the old completion flag cannot independently verify B5 evidence.

## Runtime integration

The Foundation entry keeps `foundation.js` unchanged and loads the B11
bootstrap after it. The entry does not directly load the B10 renderer. The
bootstrap loads the locked B8-B10 modules in order and then starts the exact
allowlist runtime. This preserves the historical B10 no-entry-wiring gate while
making B11 the explicit activation owner.

The Universal modal provides:

- semantic objectives, prerequisites and source-backed learning blocks;
- personalized learner display `ИУ-5 · 09.04.01/11`;
- a local oral-rehearsal recorder and self-check rubric;
- an explicit “Mở giao diện bài cũ” fallback;
- an explicit completion action that reuses the existing Foundation state
  function rather than migrating learner state;
- no automatic Master-ready claim.

The official published direction code remains `09.04.01`; the personalized
learner display remains `09.04.01/11`. Learner surfaces contain no comparison-
school label.

## Offline and responsive behavior

The B11 bootstrap, runtime, stylesheet, activation manifest, schema, policy,
Factory registry and Foundation lesson source are all observed startup
resources. The existing explicit Foundation subject-pack manager therefore
captures them without adding subject JSON to the broad Service Worker shell.
After that explicit pack is created, the reference lesson and oral UI must open
offline. Audio recording remains a local browser capability and never depends
on an upload endpoint.

The reference stylesheet has desktop two-column support/oral layouts and a
single-column mobile modal at `760px`. B11 browser regression owns desktop,
tablet and mobile overflow checks for the opened Universal modal, not just the
closed Foundation shell.

## Russian and Mathematics guard

Russian and Mathematics are reference specialist engines, not B11 pilot
subjects. Their entries load no B11 bootstrap or runtime. Their routes remain:

- Russian: `subjects/russian/index.html`;
- Mathematics: `subjects/math/index.html`.

The deterministic gate compares the Russian core/adapter/lesson hashes and the
Mathematics adapter/theory hashes with the locked B10 checkpoint. Browser and
offline regression must also prove that both routes still initialize normally.

## Rollback

Rollback has three layers:

1. Any bootstrap, dependency, capability or digest failure automatically calls
   the original `openLesson` function.
2. The learner can explicitly open the old Foundation lesson from the
   Universal modal.
3. Feature rollback removes the B11 bootstrap tag (or disables the single
   allowlist record), then refreshes the explicit Foundation offline pack.

`rollback()` verifies the current source digest before returning
`subjects/foundation/index.html`. It writes no learner state and no cache.
Closing the modal stops every media track and revokes the temporary object URL.

## Gate evidence required

Before PASS, B11 requires all of the following real evidence:

- deterministic activation, source-preservation, B3 policy and rollback gate;
- all protection mutations failing in the expected direction;
- B1-B10 reports remaining stable;
- browser activation plus real fake-device MediaRecorder exercise;
- desktop/tablet/mobile modal overflow regression;
- explicit-pack offline Foundation activation;
- Russian and Mathematics online/offline initialization;
- GitHub Actions context `migration/l6-b11-reference-runtime` = `success`;
- L5 runtime regression contexts still successful on the same feature commit.

No additional L6 step is needed: the discovered capability gap was already
owned by B11. Full reviewed Foundation coverage remains L7 work.
