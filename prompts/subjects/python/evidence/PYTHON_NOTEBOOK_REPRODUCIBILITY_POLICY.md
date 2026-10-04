# PYTHON04 NOTEBOOK REPRODUCIBILITY POLICY
Status: POLICY — notebook provider pending.

Notebook/REPL state is exploratory state, not automatically official evidence.

A compliant notebook surface must expose execution order, restart, run-all, kernel/session identity and reproducibility status. Official evidence must be reproducible from a fresh state with declared inputs, runtime profile and package profile.

Hidden or stale state, out-of-order cells and undeclared files invalidate reproducibility. A failed restart/run-all check must surface as a distinct state rather than being accepted as mastery.

Until such a provider exists, the product must not claim executable notebook support.