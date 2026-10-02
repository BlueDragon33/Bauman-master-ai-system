# HCI04 — EVALUATION · INSTRUMENTATION · ACCESSIBILITY · SIMULATION · AI
Mode: `EVIDENCE-CAPTURED · ACCESSIBILITY-MULTIMETHOD · PRIVACY-AWARE · AI-BOUNDED`

# CAPABILITIES
Potential: `hci.task.inspect`, `hci.interaction.log`, `hci.usability.study`, `hci.heuristic.review`, `hci.walkthrough.run`, `hci.accessibility.check`, `hci.focus.inspect`, `hci.contrast.check`, `hci.display.simulate`, `hci.alert.simulate`, `hci.compare.interfaces`, `hci.humanai.scenario`, `hci.ai.tutor`.

# RULES
- Interaction logs minimize data and respect privacy.
- Timing defines start/end/pause/failure/retry.
- Study data stores participant code, task, observations/measures/environment without unnecessary identity.
- Heuristic set/version/source is explicit.
- Automated accessibility checks never certify full accessibility.
- Keyboard/focus covers order, visible focus, activation, restoration and traps.
- Contrast/target criteria are configured; do not invent standards.
- Screen-reader semantics need manual/assistive verification where available.
- Standardized workload instruments require legitimate scoring/license conditions.
- Human-AI scenarios include correct/wrong/uncertain suggestions plus override/recovery.
- Evaluation evidence binds exact interface revision.
- AI cannot fabricate participants, observations, times, error counts or questionnaire scores.

# DELIVERABLES
`HCI_EVALUATION_PROVIDER_CONTRACT.md`, `HCI_INTERACTION_LOG_SCHEMA.json`, `HCI_USABILITY_STUDY_CONTRACT.md`, `HCI_HEURISTIC_WALKTHROUGH_CONTRACT.md`, `HCI_ACCESSIBILITY_CHECKER_CONTRACT.md`, `HCI_HUMAN_AI_SCENARIO_CONTRACT.md`, `HCI_AI_TUTOR_CONTRACT.md`, `HCI_SECURITY_PRIVACY_BOUNDARY.md`, `HCI05_INPUT_CONTRACT.md`.

# GOLDEN FIXTURES
Keyboard path failure; ambiguous label; missing feedback; destructive recovery issue; automated-accessibility false confidence; timing-vs-error trade-off; small-sample overclaim; automation bias.

# PASS
PASS when tools capture evidence without overclaiming and accessibility uses complementary methods.
