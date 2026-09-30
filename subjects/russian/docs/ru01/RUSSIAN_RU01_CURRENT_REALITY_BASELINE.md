# RU01 — Russian Current-Reality Baseline

State: **PASS**
Baseline: `main@1c722fd7dd7525e960f2d8bb0fb36312705448be`
Date: 2026-09-30
Execution model: RU00 → RU01 under the constitution-routed Russian prompt system.

## 1. Method

RU01 reuses the still-valid P1 forensic artifacts and revalidates only the delta from P1 validated head `1252f7c46694cb40466ff0d483ccad92439cde7b` to current main. The delta is 152 commits. This avoids a full repository rescan while respecting current-main truth.

Authoritative reused evidence:
- `subjects/russian/docs/p1/*`;
- P2–P11 phase/evidence records already merged to main;
- current Russian source tree;
- current push CI at the exact baseline SHA.

The former P0–P17 sequence is evidence/history only. It is not the active execution plan after this RU01 record.

## 2. Current inventory

Current tree contains:
- 435 Russian files;
- 32 `subjects/russian/data/*` files;
- 33 Russian asset files;
- 51 Russian scripts;
- 242 Russian documentation files.

The core preserved learning corpus remains R01–R26. Large preserved datasets include:
- `vocab.json`;
- `speaking.json`;
- `dialogue-bauman-az.json`;
- `deep-speaking-bauman.json`;
- `speaking-link-index.json`;
- `lessons.json`;
- `grammar.json` / `grammar-path.json`;
- `writing.json`;
- `handwriting.json`;
- `tests.json`;
- `videos.json`;
- `mindmap.json`;
- `simulations.json`.

Post-P1 canonical/additive owners now present:
- `assessment-mastery.js`;
- `adaptive-planner.js`;
- `speech-interaction-engine.js`;
- `provenance.json`;
- `technical-concepts.json`;
- `academic-functions.json`;
- `reading.json`;
- `performance-tasks.json`;
- `ai-mentor-policy.json`;
- `scenario-registry.json`.

## 3. Runtime/bootstrap map

Russian enters through `subjects/russian/index.html` and still uses the shared Bauman host/foundation bridge before Russian-specific runtime modules.

Relevant current load order includes:
1. shared host/foundation identity infrastructure;
2. `planning-bridge.js`;
3. optional data/listen-write support;
4. `speech-interaction-engine.js`;
5. legacy compatibility/orchestration `core.js`;
6. `assessment-mastery.js`;
7. `adaptive-planner.js`;
8. `learning-state.js` / `learning-flow.js`;
9. handwriting engines;
10. `vocab-srs.js`;
11. `speaking-coach.js`;
12. `academic-language.js`;
13. capability progression;
14. `ai-mentor-guard.js`;
15. runtime optimizer;
16. Future UI;
17. shared Bauman UI.

No Russian-only platform kernel is introduced.

## 4. Owner matrix — current reality

| Responsibility | Current canonical/runtime owner | Compatibility/touching owner | RU01 classification |
|---|---|---|---|
| App shell / shared platform | shared Bauman shell/foundation | Russian index bootstrap | KEEP |
| Russian presentation | Future UI + Russian CSS | legacy `core.css/core.js` presentation hooks | REFACTOR incrementally |
| Lessons/curriculum content | Russian data + P2/P3 contracts | `core.js` loaders | MIGRATE_TO_CONTENT / RETAIN_COMPATIBILITY |
| Attempts/evidence/mastery | `assessment-mastery.js` | legacy `core.js` projections | KEEP canonical; RETAIN_COMPATIBILITY |
| Adaptive daily planning | `adaptive-planner.js` | learning-state UI projection | KEEP |
| General learning state/resume/review | `learning-state.js` + `learning-flow.js` | `core.js` | REFACTOR boundary only |
| Vocabulary SRS | `vocab-srs.js` | legacy UI/core reads | KEEP |
| Audio/TTS/ASR/recording adapter | `speech-interaction-engine.js` | speaking coach/core consumers | KEEP |
| Speaking workflow/UI | `speaking-coach.js` | core dialogue orchestration | KEEP / REFACTOR composition |
| Dialogue/scenario composition | core dialogue orchestration + `scenario-registry.json` | P11 composition contracts | MIGRATE_TO_EXTENSION/CONTENT in RU05 |
| Handwriting | dedicated handwriting runtimes | core integration | KEEP |
| Linguistic truth/provenance | canonical datasets + `provenance.json` + P7 rules | UI renderers | KEEP; validate in RU03 |
| Academic/technical Russian | `technical-concepts.json`, `academic-functions.json` | academic renderer | KEEP |
| Research production | `reading.json`, `performance-tasks.json`, `writing.json` | learning UI | KEEP |
| AI coaching | `ai-mentor-guard.js` + `ai-mentor-policy.json` | core entry UI | KEEP bounded capability |
| Offline/package | service worker + shared packaging workflows | Russian asset manifests | KEEP shared capability |
| Hub bridge | `planning-bridge.js`, `subject-adapter.js`, shared host bridge | Russian route receipt | KEEP contract split |

## 5. Speaking separation check

The four required dataset roles remain separate:
- `speaking.json`: basic listening/speaking inventory;
- `dialogue-bauman-az.json`: advanced contextual dialogue;
- `deep-speaking-bauman.json`: advanced productive/pressure speaking;
- `speaking-link-index.json`: bridge/index.

P6 established one speech interaction adapter and P11 did not create a second recorder/ASR/audio engine. P11 scenario composition consumes the P6 runtime boundary.

Result: **PASS — separation preserved; no duplicate speech engine found in the P1→P11 delta.**

## 6. State truth / writer map

Authoritative or bounded writers now map as follows:
- attempts/evidence/mastery/stage-gate evidence: `assessment-mastery.js`;
- adaptive preference/manual override state: `adaptive-planner.js`;
- learning resume/review state: `learning-state.js` / `learning-flow.js`;
- vocab SRS: `vocab-srs.js`;
- speaking practice state: `speaking-coach.js`, with ASR treated as non-authoritative signal;
- handwriting evidence: dedicated handwriting runtimes/contracts;
- AI mentor: read-only to canonical mastery/state;
- scenario registry: composition/practice only; no mastery/SRS/planner write authority.

Protected truth invariant:
`exposure != progress != performance != mastery`.

P4 evidence records may update mastery only when explicitly marked authoritative. Page open, watch time, click count, AI duration or generic online time are not mastery evidence.

No current delta evidence shows presentation-only open/render mutating authoritative mastery.

## 7. Routes and deep links

The nine manifest-declared top-level Russian routes remain:
`overview`, `learning`, `dialogue`, `writing`, `media`, `vocab`, `grammar`, `mindmap`, `storage`.

P1 source/package browser acceptance covered standalone Russian, Hub↔Russian, deep-link/route receipt, reload and responsive paths. Later P4–P11 acceptance repeatedly preserved Russian source/package and whole-system browser regressions.

No route deletion is authorized by RU01.

## 8. UI/UX baseline

P1 geometry/accessibility evidence remains the baseline because the P1→current delta does not replace the accepted Future UI CSS/layout owner. The delta adds learning engines/contracts and small compatibility integrations.

Current exact-main push evidence:
- Universal Constitution Compliance run `36732090235`: SUCCESS;
- Development Fast CI run `36732088811`: SUCCESS;
- Russian Reference UI Gate run `36732088730`: SUCCESS.

P11's validated branch additionally passed Russian source + packaged browser acceptance and whole-system source + packaged acceptance before merge.

RU01 therefore treats UI layout as **stable enough for RU02** but not globally immutable. RU08 remains responsible for final integrated UI/accessibility acceptance.

## 9. Test-trust audit

| Evidence family | Trust |
|---|---|
| Russian Reference UI Gate | TRUSTED for static/reference/UI contract; not full learner journey |
| P1 browser forensic acceptance | TRUSTED for P1 current-reality/browser baseline |
| P4 assessment/mastery browser | TRUSTED for attempt/evidence/mastery truth and package parity |
| P5 planner runtime test | TRUSTED for deterministic adaptive plan rules |
| P6 speech runtime test | TRUSTED for adapter ownership/fallback behavior, not speech quality |
| P7–P11 validators | USEFUL/TRUSTED for contract and reference integrity within each phase |
| Whole-system source/package browser gate | TRUSTED for integration regression |
| Historical V12/V13 reports | WEAK/HISTORICAL unless reconfirmed by current runtime |
| CI PASS alone | insufficient for full RU module PASS without runtime/user-path evidence |

## 10. Performance baseline

P1 performance artifacts remain reusable for the unchanged shell/layout families. P6 added a scoped speech performance baseline. No P2–P11 phase reports a new blocking Russian performance regression.

Large datasets remain a principal performance risk; startup ownership must stay lazy/optional where already implemented. RU02 must not convert large dialogue/deep-speaking/vocab stores into eager monolithic startup loads.

## 11. Accessibility baseline

Protected current rules remain:
- keyboard navigation;
- visible focus;
- semantic/labelled controls;
- reduced-motion tolerance;
- touch targets appropriate for mobile;
- no horizontal overflow in the accepted Russian Future UI;
- modal focus behavior must remain correct where shared patterns are used.

Final cross-device/accessibility acceptance belongs to RU08/C2, not RU01.

## 12. Security and data safety baseline

Preserve:
- Device Gate/fail-closed protected learning data;
- no destructive learner-state migration;
- no canonical-content body ownership in unrelated control-plane stores;
- malformed canonical assessment state fails closed/recovery-blocks rather than silently resetting;
- voice recordings remain transient in P6;
- AI cannot silently promote generated material or write mastery.

## 13. Root-cause tree — current

1. **Legacy breadth:** `core.js/core.css` still touch many responsibilities.
   - Response: incremental strangler migration; no bulk rewrite.
2. **State multiplicity:** several valid stores exist by domain.
   - Response: preserve one owner per domain; bridge/read projections only.
3. **Large corpus:** dialogue/deep speaking/vocab/tests are large.
   - Response: content-as-data + lazy/package-aware loading.
4. **Historical contract layering:** P1 maps coexist with P2–P11 canonical owner contracts.
   - Response: RU modules become the active owner map; P docs are migration evidence.
5. **Old execution topology drift:** open PR #180 is P12 under the superseded topology.
   - Response: do not merge it as “next phase”; reuse its work only when RU08 is active and after owner review.

## 14. Risk register

- RU01-R001 — **HIGH**: accidental merge of old-topology P12 before RU08. Mitigation: treat PR #180 as reusable evidence/candidate only.
- RU01-R002 — **HIGH**: `core.js` compatibility logic can still blur composition vs canonical ownership. Owner: RU02/RU05/RU08.
- RU01-R003 — **HIGH**: multiple learner stores require explicit migration/backward-compatibility policy. Owner: RU04/RU08.
- RU01-R004 — **MEDIUM**: current-main push did not rerun every historical browser matrix after merge; pre-merge P11 tree evidence plus exact-main static gates are accepted for RU01, with later module revalidation required after changes.
- RU01-R005 — **MEDIUM**: large-data eager-load regression could reappear if RU02 normalizes schemas without loader constraints.
- RU01-R006 — **MEDIUM**: historical reports can create false confidence if treated as current authority.

No RU01 blocker/critical remains.

## 15. Keep / migrate / delete-later decision

KEEP:
- R01–R26 corpus and stable IDs;
- separated speaking/dialogue/deep-speaking datasets;
- P4 mastery owner;
- P5 adaptive owner;
- P6 speech adapter;
- handwriting authority;
- vocab SRS;
- P7 provenance;
- P8/P9 academic/research data owners;
- bounded AI guard;
- Future UI/shared shell;
- offline/package infrastructure.

MIGRATE/REFACTOR incrementally:
- legacy `core.js` responsibilities into content/capability/extension owners where RU02/RU05/RU08 prove safe;
- duplicate projections into compatibility adapters;
- global UI/platform logic out of Russian-only implementations if found.

DELETE_LATER only after replacement + regression proof:
- redundant legacy owner paths;
- obsolete P0–P17 execution-only governance artifacts if and when the new RU tracking is fully adopted.

## 16. RU01 exit

RU01 can answer:
- who owns each major responsibility;
- what is actually loaded;
- what mutates learner state;
- where compatibility/duplicate-touch remains;
- which code remains Russian-specific;
- which concerns belong to shared platform capabilities;
- what must not be touched yet;
- what RU02 may safely normalize.

**RU01 EXIT: PASS.**
