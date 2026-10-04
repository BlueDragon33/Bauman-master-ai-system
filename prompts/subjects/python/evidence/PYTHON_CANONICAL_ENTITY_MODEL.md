# PYTHON CANONICAL ENTITY MODEL

Owner: PYTHON02  
Runtime implementation: deferred to PYTHON04/PYTHON05.

## Stable ID namespaces

- `py.concept.<slug>`
- `py.construct.<slug>`
- `py.syntax.<slug>`
- `py.semantic.<slug>`
- `py.runtime-behavior.<slug>`
- `py.type-behavior.<slug>`
- `py.exception-pattern.<slug>`
- `py.example.<slug>`
- `py.counterexample.<slug>`
- `py.bug-pattern.<slug>`
- `py.task.<slug>`
- `py.test-case.<slug>`
- `py.project.<slug>`
- `py.tool-concept.<slug>`
- `py.package-concept.<slug>`

IDs are durable identities; labels/titles may change without changing identity.

## Language construct contract

Each significant construct carries: `id`, `name`, `purpose`, `syntaxForms[]`, `semanticRules[]`, `runtimeBehaviors[]`, `prerequisiteIds[]`, `commonErrorIds[]`, `exampleIds[]`, `counterexampleIds[]`, `assessmentHooks[]`, `versionContext`, and `provenance[]`.

## Separation rules

`SYNTAX_FORM` describes accepted written form.  
`SEMANTIC_RULE` describes meaning.  
`RUNTIME_BEHAVIOR` describes observable execution under a supported runtime.  
`TOOL_CONCEPT` describes signals from formatter/linter/type checker/test runner.  
Tool output never becomes language truth automatically.

## Compatibility

Legacy `PR01..PR48` remain compatibility IDs. Canonical entities may be projected into those lessons before any lesson record is retired. Learner state keyed to legacy IDs must remain readable until an explicit migration is authorized and tested.
