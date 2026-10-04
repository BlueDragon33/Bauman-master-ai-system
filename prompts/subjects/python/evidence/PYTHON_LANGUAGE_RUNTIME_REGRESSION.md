# PYTHON LANGUAGE / RUNTIME REGRESSION
Runtime truth: **CPython 3.14.8 · cpython-3.14.8-stdlib-v1**.

P6 live acceptance covers representative semantics for division/modulo, precedence, truthiness/None, equality-vs-identity, Unicode/slicing, collections, aliasing/shallow-copy, mutable defaults, zero/one loop boundaries, iterator exhaustion, targeted exceptions, UTF-8 file IO, missing import failure and basic object state.

Version/package rule: release profile is standard-library only. NumPy/Pandas/notebook are not silently claimed by this RC.
