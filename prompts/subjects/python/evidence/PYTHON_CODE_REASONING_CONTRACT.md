# PYTHON CODE REASONING CONTRACT

Status: **PYTHON03 candidate**. Runtime execution remains owned by PYTHON04.

## Evidence dimensions

Python evidence is separated into reading, tracing, predicting, constructing, decomposing, debugging, testing, explaining, refactoring and transferring. A learner may be strong in one dimension and weak in another; no single click, route-open or quiz score collapses them into mastery.

## Construction chain

`PROBLEM → INPUT/STATE → DECOMPOSITION → ALGORITHM/PLAN → CODE → TRACE/EXECUTION → TEST → DEBUG → RESULT → EXPLANATION → TRANSFER`.

Tiny tasks need not perform ceremonial pseudocode. Nontrivial tasks must make requirements, cases, decomposition and verification visible enough to assess.

## Trace truth

Trace evidence may record current line/expression, name bindings, mutable object state, call stack when level-appropriate, side effects/output and exceptions. Explanations must respect Python binding/reference semantics; fake “memory box” stories that contradict them are not canonical.

## High-risk reasoning areas

Assessment must explicitly cover aliasing, shallow copies, nested mutation, argument binding, mutable defaults, scope, return/side effects, zero-iteration paths, break/continue, off-by-one boundaries, iterator exhaustion and exception propagation.

## Debugging workflow

`REPRODUCE → MINIMIZE → OBSERVE → HYPOTHESIZE → TEST HYPOTHESIS → FIX ROOT CAUSE → REGRESSION TEST`.

Random-edit-until-green behavior is not accepted as the canonical debugging method.

## Evidence boundary

A final output is only one signal. Trustworthy programming evidence may require behavior across cases, tests, trace/state reasoning, debugging diagnosis, explanation and a reproducible artifact. PYTHON03 emits evidence; C4/global mastery policy decides mastery.

