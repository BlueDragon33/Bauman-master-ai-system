# Lượt 6 · B5 · Master-ready Evidence Gates

Status: **IMPLEMENTED · acceptance is controlled by the deterministic gate**

Policy:
assets/data/lesson/master-ready-policy-v1.json

Gate:
scripts/academic/l6-b5-master-ready-regression.cjs

Master-ready means verified competence retained over time. It is not page
completion, elapsed time, a chat interaction or merely a passing course grade.

## 1. Five shared evidence stages

The common progression is:

understand → solve → build-apply → explain → retain

| Stage | Shared meaning |
|---|---|
| understand | Identify concepts, assumptions, vocabulary, boundaries and applicability |
| solve | Produce a correct constrained response, solution or method |
| build-apply | Create or apply a domain artifact and verify it |
| explain | Defend choices, errors, limits and evidence |
| retain | Reproduce competence after delay with a varied prompt |

The meaning is shared; evidence is type-specific. “Solve” may be a derivation,
language response, program, query, design decision, ML method, system analysis
or research-method choice.

## 2. Master-ready state machine

The state machine distinguishes provisional readiness from retained mastery:

1. not-started;
2. learning;
3. ready-for-retention;
4. master-ready;
5. retention-due;
6. needs-repair.

Passing understand, solve, build-apply and explain creates only
ready-for-retention. Master-ready requires delayed retention evidence. A later
due window can move a lesson to retention-due; failure moves it to
needs-repair, not silently back to complete.

If required evidence or its versioned source is invalidated, both
ready-for-retention and master-ready move explicitly to needs-repair.
Unresolved required prerequisites block both states while orientation and
recovery remain accessible.

## 3. Evidence envelope

Every evidence event carries:

- stable evidence, lesson, type and attempt identity;
- one of the five stages and a type evidence kind;
- artifact and source references;
- a Personal Learning State reference rather than embedded private history;
- creation time, verification and provenance;
- an append-only repair/supersession link when corrected.

Source, learner artifact, system-derived state and AI inference remain
separate. Zero-copy local files may be referenced without copying their bytes
into the lesson contract.

## 4. Verification authority

| Actor | Can set verified? | Role |
|---|---:|---|
| Deterministic evaluator | Yes | Answer key, unit test, query result, numeric tolerance, invariant or artifact validator |
| Instructor review | Yes | Rubric, oral defense or artifact review |
| Learner self-check | No | Reflection and retrieval log |
| Peer review | No | Rubric/artifact comments |
| AI advisory | No | Hint, diagnosis, rubric suggestion, oral feedback and recovery route |

AI can help a verifier but cannot be the final authority, fabricate evidence or
promote an inference into a source.

## 5. Scoring and critical failures

Criteria use a 0–4 scale and normalize by weight. Weights sum to 1 within each
type.

Master-ready requires all of the following:

- every stage meets its type minimum;
- the weighted total meets the type threshold;
- every critical criterion meets its own minimum;
- required delayed retention windows pass;
- no unresolved prerequisite or evidence-integrity blocker remains.

A high total cannot hide a critical failure. For example, polished prose
cannot compensate for invalid research sources; a high ML metric cannot
compensate for leakage; a polished math answer cannot compensate for invalid
assumptions or dimensions.

## 6. Type-specific defaults

These are Master-ready safety defaults, not official course-grade cutoffs.
Official course policy may add evidence or raise a gate but does not silently
lower these defaults.

| Type | Total threshold | Required retention windows | Critical emphasis |
|---|---:|---|---|
| language | 0.80 | day 7 and 14 | Comprehension, production, fluency/repair, retention |
| mathematics | 0.82 | day 7 and 21 | Concepts/assumptions, method, notation/dimensions, verification, retention |
| programming | 0.84 | day 7 and 21 | Passing behavior, debugging, repository reproducibility, delayed tests |
| database | 0.83 | day 7 and 21 | Query correctness, integrity, transactions, artifact and retention |
| software-design | 0.82 | day 14 and 30 | Traceability, architecture, tradeoffs, diagram consistency, transfer |
| ml-data | 0.84 | day 14 and 30 | Data integrity, evaluation validity, reproducibility, delayed experiment |
| asoiu-system | 0.83 | day 14 and 30 | Boundaries/flow, analytical model, reliability, architecture, transfer |
| research | 0.85 | day 21 and 45 | Question, sources, method, evidence, reproducibility, defense |

Thresholds and retention windows differ by type; there is no hidden global
80/75 rule.

## 7. Type evidence examples

- Language: comprehension response, dialogue/shadowing, oral or written
  production, delayed retrieval.
- Mathematics: derivation, solution, simulation/result verification, professor
  oral, varied delayed problem.
- Programming: code, deterministic tests, debug trace, repository artifact,
  varied delayed implementation.
- Database: schema/query, normalization/transaction analysis, query plan,
  varied delayed data state.
- Software design: requirements/UML/architecture, traceability, tradeoff record
  and defense on a new scenario.
- ML/Data: dataset, experiment log, model/metric/error analysis and
  reproducibility record.
- ASOIU/System: system/flow/reliability/lifecycle artifacts and oral defense.
- Research: question, literature matrix, protocol, evidence/analysis,
  scientific section, НИР/ВКР milestone and defense.

## 8. Repair behavior

A failed stage or critical criterion creates a source-linked repair route from
assessment errors, weak topics, rubric scores, prerequisites and schedule.
Repair focuses one diagnosed error group at a time.

Attempts remain append-only. A corrected attempt links the failed evidence.
Only invalid criteria and dependencies repeat. AI may recommend the route but
cannot mark repair verified.

## 9. Offline behavior

Evidence capture and deterministic verification remain available offline.
Offline evidence reconciles by stable IDs. No queued AI verification is
allowed, and later network/AI availability cannot silently alter an existing
verified result.

The policy references the L5 Direct Local Reader and Offline Content Library
for local artifacts without changing their zero-copy or sandbox rules.

## 10. Compatibility and forward ownership

Russian and Mathematics sources/runtimes remain unchanged. B5 supplies
type-level policy only; B10 adapters and B11 regressions will decide how legacy
events project into this envelope.

B6 owns visual feedback, B7 language hooks, B8 formal schema/instance
validation, B9 Subject Factory mapping and B10 runtime bridge. This policy is
machine-readable input to those steps, not a claim that they are complete.

## 11. Rollback

Rollback removes the B5 policy, document, report and gate and restores
workflow/progress markers to B4. No learner state migration has run, so no
evidence record needs rewriting.

## 12. Acceptance

B5 passes only when:

1. All five stages and state transitions are explicit.
2. Page activity and AI advisory cannot satisfy verification.
3. Exactly eight type profiles exist.
4. Every profile maps all stages to registered evidence outputs.
5. Every rubric weight sum is 1, critical minima exist, and thresholds are
   type-specific rather than global.
6. Retention windows are delayed, ordered and profile-specific.
7. B1-B4 stay green, B5 is deterministic, Russian/Math has no source/runtime
   diff and relevant L5 gates do not regress.
