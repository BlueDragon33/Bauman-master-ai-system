# Russian P11 Scenario Runtime Contract

Canonical registry: `data/scenario-registry.json`.

A scenario is an orchestration graph over existing P6 speaking contexts. A node may reference a canonical speaking context, introduce an unexpected turn, provide repair choices, move to another practice node, or terminate as practice completion.

P11 never interprets ASR similarity as pronunciation authority and never writes P4 mastery. Scenario progression may remember a transient node/role choice, but official learner progression remains P4/P5-owned.

Runtime handoff:
`scenario → existing speaking context → P6 dialogue/audio/recording/recognition → learner response → P11 branch decision → next existing context`.

If microphone/ASR is unavailable, the scenario remains usable through the P6 text, transcript, self-comparison or manual-confirmation fallback.
