# W0 · GitHub reconciliation checkpoint

Status: **PASS**  
Audited GitHub `main`: `b69e5f7b6cbf1ac97e974887957a354fbb778080`  
Academic acceptance commit: `6adcb923a3c9e48e40f1007989051c767901c59a`  
Date: 2026-09-13

## Actual GitHub state

- `main` and `origin/main` resolve to the same commit and the working tree was clean before this report was added.
- The four commits after §1.6 academic acceptance change only `CODEX_STATE.md` and `CODEX_TASK.md`; no runtime source changed after acceptance.
- `CODEX_STATE.md` and `CODEX_TASK.md` agree with committed artifacts: §1.6 academic acceptance is complete and runtime progress is `0/5`, with Pass 15 next.
- `subjects/math/THEORY_C01_L06_ACADEMIC_ACCEPTANCE.json` is `PASS`, `14/14`, and approves `22` source slides mapped one-to-one to `22` runtime slides with `compression: false`.
- Durable `subjects/math/data/theory_lecture_content.json` contains `18` records. The §1.6 lesson occurs exactly once at zero-based index `5`, still has the pre-runtime `16`-slide record, and therefore has not been durably merged.
- There is no committed §1.6 runtime Pass 15–19 report and no §1.6 runtime working branch. Accepted §1.4/§1.5 behavior remains present; §1.5 reports Pass 15–19 all PASS and its final Chromium report includes §1.4 regression evidence.
- The latest code-relevant `main` run for academic acceptance (`6adcb923...`) completed `Bauman Cloudflare Preview CI` successfully. The current documentation-only HEAD has no check run. The latest runtime/control baseline checks after PR #42 are successful.

## PR and branch reconciliation

- Open PRs are six draft PRs: #18, #19, #21, #26, #27 and #38. None targets §1.6 runtime. PR #38 explicitly remains `DO NOT MERGE YET`.
- Recently merged PRs #39, #40, #41 and #42 are already represented on `main`; their remote branches remain because GitHub used squash merges and must not be re-merged by ancestry alone.
- The repository exposes `64` remote branch refs including `main`; `50` non-main refs are not ancestors of `main`. This includes open draft work, closed-unmerged experiments, superseded runtime attempts, staged Phase 2 work and squash-merged branch histories.
- Stale/duplicate candidates detected but intentionally not changed in W0 include legacy one-off Lesson 1.5 workflows, multiple Pass 19 repair branches, duplicate Phase 2 `pass14f` refs, merged `temp/russian-ui-*` refs, and older §1.6 E146/E155 staged files. They are evidence/history, not authority for the current pass. Cleanup or quarantine is deferred to W2 and only if contract-safe.

## Reconciled discrepancy

The immutable Pass 13 import candidate still records `academicStatus: pending_pass14_acceptance` and `runtimeMergeAllowed: false`. The later committed acceptance artifact explicitly approves that exact path/version and assigns Pass 15 as the next task. This is a historical pre-gate flag inside the immutable candidate, not evidence of a second candidate. Resolution: preserve the candidate bytes and use the Pass 14 acceptance as the merge authorization, as required by `CODEX_TASK.md`.

## Checks run

- Remote refs and `main` HEAD reconciliation.
- GitHub REST audit of open/merged PRs, workflows, runs and HEAD checks.
- Commit/file diff from academic acceptance to current `main`.
- JSON parse and contract inspection of §1.6 acceptance, the approved import candidate, durable theory content, and §1.5 Pass 15–19 precedent reports.
- Durable target occurrence, index, record count and current slide-count verification.

Files changed by this checkpoint: `W0_GITHUB_RECONCILIATION_2026-09-13.md` only.  
Next step: **W1 Pass 15 · durable merge + static verification**.
