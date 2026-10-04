# PYTHON CODING ASSESSMENT CONTRACT

## Task contract

Every coding task declares competency IDs, prompt, inputs/state, required behavior/output, constraints, allowed support, public examples/tests, hidden-edge-case policy, assessment mode, version/runtime scope and deterministic conditions when relevant.

## Grading

Primary grading is behavior/contract/test/rubric based. Source-code string equality is forbidden as the primary grader. Equivalent valid implementations must pass unless the task explicitly assesses use of a named construct.

Passing one public sample is insufficient. Hidden tests may check documented edge cases, generalization and robustness, but may not assert undocumented arbitrary behavior.

## Evidence states

An assessment result distinguishes syntax/runtime failure, failed tests, partial behavior, correct behavior, test/quality feedback, support used and official-evidence status. Style and type-checker signals are contextual evidence unless the task explicitly assesses them.

## Attempt history

The first official attempt is immutable evidence. Retries append; a later pass does not erase the first attempt. Starter code, hints and AI assistance are recorded as support context when they affect evidence interpretation.

## AI policy

Each official task declares one of: independent, AI allowed, AI hint-only, AI prohibited or post-submit solution. AI cannot invisibly solve the task while the evidence claims independent mastery.

## Notebook assessment

Notebook evidence must survive restart + defined-order execution with declared dependencies/data. Stale interactive state cannot count as successful reproducibility.

## Security boundary

Learner code is untrusted. This contract defines what must be evaluated; PYTHON04/PYTHON06 own safe execution and hardening.

