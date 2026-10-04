# PYTHON CANONICAL ENTITY MODEL

Status: **PYTHON02 candidate**. This file defines Python-specific academic entities; it does not create a new platform kernel or runtime.

## Stable namespaces

- `py.outcome.*` — program/subject outcomes.
- `py.comp.*` — competencies.
- `py.concept.*` — language/tooling concepts.
- `py.construct.*` — syntax-bearing language constructs.
- `py.semantic.*` — semantic rules.
- `py.runtime-behavior.*` — observable behavior under a declared runtime/version.
- `py.example.*` / `py.counterexample.*` — curated examples and anti-examples.
- `py.misconception.*` — known misconception/bug patterns.
- `py.task.*` / `py.testcase.*` / `py.project.*` — assessable work.
- `py.tool.*` / `py.package.*` — tooling/package concepts; never language truth by themselves.

## Required common fields

Every canonical entity carries: stable `id`, `title`, `status`, `provenance`, `versionScope` and owner. Entities that affect learning order also carry `competencyIds` and `prerequisiteIds`.

## Language construct contract

A significant construct records purpose, syntax form, semantic meaning, runtime behavior, type behavior where relevant, prerequisites, common errors, examples, counterexamples, assessment hooks, version notes and provenance. Assignment/name binding must not be described as mere textual replacement; `is` and `==`, mutability, truthiness, slicing/iteration and default-argument behavior receive explicit semantic treatment when in scope.

## Example / counterexample contract

Examples declare purpose, code, expected behavior/output, explanation, version/runtime scope and hidden dependencies (which should normally be none). Counterexamples identify the misconception and corrected rule. Mandatory misconception families include mutable defaults, identity-vs-equality misuse, mutation during iteration, catch-all exceptions, built-in shadowing and stale notebook state.

## Coding task contract

A coding task declares competency IDs, prompt, inputs, required behavior/output, constraints, allowed support, public examples, hidden-edge-case policy, assessment mode, runtime/version scope and deterministic seed/environment where relevant. Final stdout alone is never sufficient evidence if hard-coding or partial-case success remains possible.

## Project contract

Projects integrate multiple competencies and produce a real artifact such as a CLI utility, data/file processor, modular package, testing/debugging project, reproducible data-analysis mini-project or research utility. They must include execution/reproduction notes and observable evidence.

## Compatibility

Current `PR01..PR48` are legacy delivery identities, not canonical concept/competency IDs. They are preserved via `PYTHON_LEGACY_LESSON_OWNERSHIP_MAP.json` until a versioned migration/projection is activated outside PYTHON02.

