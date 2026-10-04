# PYTHON OFFLINE / PERFORMANCE REPORT
- Offline Python execution: **UNSUPPORTED BY DESIGN**; UI disables Run/Test/Submit and shows an explicit unavailable state.
- Draft editing/autosave: local browser state remains available while the loaded page is open.
- Server runtime has no browser interpreter/package download cost.
- Run policy: 100–5000 ms request timeout, 192 MiB address-space limit, 64 KiB stdout/stderr bounds, 32 file descriptors.
- Large output is truncated/flagged and rendered as bounded text.
- Notebook execution and scientific-package cold-start are not part of this RC.
- No learner-state migration is activated by P6.
