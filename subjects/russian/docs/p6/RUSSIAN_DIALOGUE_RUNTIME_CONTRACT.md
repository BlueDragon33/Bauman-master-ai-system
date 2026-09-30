# Russian P6 Dialogue Runtime Contract

Dialogue must preserve role, current turn, transcript reveal state, support language and repair path. Basic speaking uses `speaking.json`; contextual dialogue uses `dialogue-bauman-az.json` lazily.

Acceptance flow: select role → hear/receive turn → respond → variation → repair → preserve role/context → record practice evidence. ASR is optional. Self-confirmation is explicit. Transcript reveal does not silently fail the learner.

Large dialogue data must remain lazy and must not become a duplicate canonical speaking dataset.
