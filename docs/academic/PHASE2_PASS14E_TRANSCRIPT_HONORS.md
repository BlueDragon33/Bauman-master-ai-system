# Phase 2 · Pass 14E — Diploma Supplement / Honors Evidence Registry

Status: `TRANSCRIPT_HONORS_REGISTRY_VALIDATED_BROWSER_PASS`

Branch: `phase2/official-course-learning-architecture`

## Purpose

Pass14E separates two concepts that must not be conflated:

1. Pass14D records a confirmed result for a concrete assessment event such as `Экз`, `ДЗчт`, or `Зчт`.
2. Pass14E records a verified row/value that belongs to the diploma supplement or an equivalent authoritative academic record.

An assessment event result is never automatically promoted into a diploma-supplement row. This prevents a course with multiple assessment events from being counted multiple times in the honors-diploma denominator without evidence.

## Federal source locked by Pass14E

Primary legal reference:

- `Приказ Минобрнауки России от 27.07.2021 N 670`, revision 22.02.2023.
- State registration: `25.08.2021 N 64759`.
- Effective from `01.09.2022`.
- Stated validity through `01.09.2028`.
- Reference: `https://www.consultant.ru/document/cons_doc_LAW_393664/`.

Relevant federal supplement structure recorded in `assets/data/diploma-supplement-honors-policy-rf-2021.json`:

- each studied discipline/module is represented by a separate row with one intermediate-attestation grade;
- each practice is represented separately with its grade, while the aggregate Practices row is not another grade;
- each state-final-attestation test is represented separately with its grade, while the aggregate GIA row is not another grade;
- each course work/project, when present, is represented separately with its grade;
- grades are written as `отлично`, `хорошо`, `удовлетворительно`, `зачтено`;
- facultatives may enter the supplement subject to the applicable rules/consent and organization policy.

## Federal honors-diploma conditions modeled

Pass14E locks these conditions from paragraph 27:

- all non-`зачтено` grades for disciplines/modules, course works/projects and practices must be only `5` or `4`;
- all GIA grades must be `5`;
- `5` grades, including GIA, must constitute at least 75% of all counted supplement grades, excluding `зачтено`;
- facultative/elective-physical-education treatment is organization-policy dependent and therefore is not silently included in the baseline projection.

## IU5 2026 baseline projection

Using only the currently locked official IU5 2026 curriculum mirror:

- 19 fixed disciplines;
- 2 elective groups, each representing the one option actually chosen;
- 5 practices;
- 1 GIA item;
- total baseline projected rows: `27`.

Under the assessment types in the current curriculum mirror:

- projected grade-bearing rows: `22`;
- pure `Зчт` rows: `5`;
- projected minimum grade-5 rows for the 75% rule: `17`;
- projected maximum grade-4 rows: `5`.

These numbers are explicitly a **projection**, not a claim that the final BMSTU/IU5 diploma supplement for the 2026 cohort will contain exactly 22 counted grades. The current curriculum mirror contains no explicit course-work/project assessment row. If a verified local academic record later shows additional separately graded course works/projects or another organization-specific counted row, the denominator must change.

The current two facultatives in the locked curriculum are pure `Зчт`; Pass14E excludes them from the baseline projection until organization policy is verified.

## Evidence model

Dedicated store:

`bauman_academic_2026_transcript_evidence_v1`

An entry is stored only when:

- the user explicitly confirms that the row/value was verified from a diploma supplement, registrar draft, ведомость, or equivalent authoritative academic source;
- a source is recorded;
- an elective group records the actual chosen option;
- a pure-credit row records `зачтено` or `незачтено`;
- a grade-bearing row records 2/3/4/5.

Every stored row carries:

- `sourceClass: explicit_verified_diploma_supplement_entry`;
- `autoPromotedFromAssessmentEvent: false`.

Pass14D remains a separate assessment-result store. A score such as d04 `Экз = 92` does not create or fill the d04 supplement row automatically.

## Honors states

The runtime exposes:

- `EVIDENCE_INCOMPLETE` — not all baseline supplement rows have verified evidence;
- `CURRENT_EVIDENCE_BLOCKS_HONORS` — current verified evidence contains a 2/3, non-excellent GIA grade, or failed credit;
- `EXCELLENT_SHARE_BELOW_75` — complete verified baseline but fewer than the required 5s;
- `HONORS_RULES_MET_ON_VERIFIED_LEDGER` — the complete verified ledger satisfies the modeled federal conditions.

The UI reports the 22/17 values as `GRADED PROJECTION` and `5s NEEDED*` with a visible projection caveat.

## Hard safety boundaries

- No assessment-event auto-promotion.
- No scheduler mutation.
- No automatic course completion.
- No inference from credits/ECTS weighting; the federal percentage is modeled by counted supplement grade rows.
- No silent counting of multiple `Экз`/`ДЗчт` events from one discipline as multiple supplement rows.
- No invented course-work/project rows where the locked curriculum does not expose them.
- BMSTU/IU5 local 2026 supplement mapping remains marked `not_yet_verified` until authoritative local evidence is obtained.

## Validation and Browser acceptance

Static validation locks:

- 27 baseline projected supplement rows;
- 22 projected grade-bearing rows;
- 5 pure-credit rows;
- `ceil(22 × 0.75) = 17` required grade-5 rows;
- at most 5 grade-4 rows under the current projection;
- 17/22 with the rest 4 and GIA=5 satisfies the modeled rule;
- 16/22 is below 75%;
- any grade 3 blocks honors conditions;
- a GIA grade below 5 blocks honors conditions;
- missing row evidence prevents final conclusion;
- a failed verified `Зчт` blocks current eligibility.

Browser acceptance verifies:

- Pass14D assessment result does not auto-fill Pass14E;
- explicit transcript verification and source are mandatory;
- elective row requires the chosen option;
- exactly 17/22 grade 5 produces `HONORS_RULES_MET_ON_VERIFIED_LEDGER`;
- 16/22 produces `EXCELLENT_SHARE_BELOW_75`;
- a 3 produces `CURRENT_EVIDENCE_BLOCKS_HONORS`;
- evidence is isolated by current user;
- scheduler stays unchanged;
- evidence persists across reload;
- mobile layout has no horizontal overflow;
- Pass14B/14C/14D Browser suites remain green.

## Stop-on-error history

Pass14E was not closed on its first attempt.

1. Run `34670895454` stopped at the new static validator because the boundary-test fixture accidentally produced 18 grade-5 rows after changing GIA to 5. The fixture was corrected to construct exactly 17/22 and 16/22 cases.
2. Run `34670934426` passed the semantic Pass14E validator but stopped at `node --check` because the first compact runtime draft had a JavaScript syntax error before `function form(...)`. Browser was therefore not allowed to run.
3. The runtime was reformatted/repaired and independently syntax-checked before being committed.

Final validated run:

- Run: `34671073923`
- Validated head: `7825eafc397355cf70d92ef0d4e6e9cb24d42d58`
- Pass14A architecture: SUCCESS
- Academic registry: SUCCESS
- P0 integrity: SUCCESS
- semester-safe risk engine: SUCCESS
- Phase2 source boundaries: SUCCESS
- Pass14B validator: SUCCESS
- Pass14C validator: SUCCESS
- Pass14D validator: SUCCESS
- Pass14E transcript/honors validator: SUCCESS
- JavaScript/test syntax: SUCCESS
- Pass14B Browser regression: SUCCESS
- Pass14C Browser regression: SUCCESS
- Pass14D Browser regression: SUCCESS
- Pass14E Browser acceptance: SUCCESS
- Browser artifact upload: SUCCESS

Browser artifact:

- `academic-phase2-browser-14bcde-34671073923`
- artifact id `10290482850`
- SHA-256 digest `7aabb4ec137e08385ac56e6f4ef516d8da67428601fc5fa9fd86c67cea71d46a`

The final workflow concluded `success`.

## Main synchronization

Pass14E is implemented only on `phase2/official-course-learning-architecture`. `main` is not merged by this pass. A final compare against `main` must remain clean (`behind_by: 0`) before the phase is promoted.
