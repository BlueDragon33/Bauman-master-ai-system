# PYTHON04 notebook / REPL reproducibility

The initial lab offers independent runs and restart + ordered run-all replay.
`# %%` separates up to 12 cells; every request starts a fresh container/root
and shared namespace only for those cells in that request. Cell order and
completed cells are structured results. A cell error ends that replay.

There is no long-lived REPL kernel and no out-of-order execution mode. REPL-like
exploration uses fresh independent runs or an explicit replay of all preceding
cells. Nothing from a previous Run can satisfy an undeclared variable dependency.
Restart invalidates results and drops pending work; Reload resets the lab's
in-memory workspace. Source can be downloaded as `practice.py` by the learner.

Official notebook evidence would require declared cells/files/seed and fixed
runtime/environment, plus restart/run-all validation under PYTHON03. A trace,
old output, saved UI state or public sample pass does not satisfy that evidence.
The lab has no new mastery/attempt-history store and writes no localStorage.

Browser tests exercise ordered replay producing 42, restart causing NameError,
cancelled/stale result quarantine, offline-unavailable, reload and preservation
of the pre-existing Programming storage key. Offline execution/cache/queue is
not provided; an already loaded editor can remain editable without execution.

Notebook output is not automatically official evidence.
