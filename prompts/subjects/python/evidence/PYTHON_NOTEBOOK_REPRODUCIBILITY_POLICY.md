# PYTHON04 NOTEBOOK REPRODUCIBILITY POLICY
Status: FRESH REPLAY IMPLEMENTED — provider acceptance pending.

Notebook/REPL state is exploratory state, not automatically official evidence.

A compliant notebook surface must expose execution order, restart, run-all, kernel/session identity and reproducibility status. Official evidence must be reproducible from a fresh state with declared inputs, runtime profile and package profile.

Hidden or stale state, out-of-order cells and undeclared files invalidate reproducibility. A failed restart/run-all check must surface as a distinct state rather than being accepted as mastery.

Until such a provider exists, the product must not claim executable notebook support.

## Implemented validation semantics

The lab supports fresh ordered replay: `# %%` splits up to 12 cells, at most
16 KiB combined source. Every run-all starts a new isolated workspace and
executes cells in listed order; exception stops replay. No persistent REPL
kernel or out-of-order execution is advertised. Restart clears displayed
evidence and cancels the previous run; the next replay gets a new runId.

Results carry run/session/runtime/package identity, cells and safe exception
locations. `reported_completed` cells and trace are advisory untrusted runtime
reports, not official reproducibility/mastery evidence. Real-provider notebook
replay, fresh-variable reset and desktop/mobile checks are mandatory gates.
