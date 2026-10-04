# PYTHON VERSION AUTHORITY POLICY

PYTHON02 does **not** select a Python minor version.

Authority order:
1. supported interpreter/runtime contract proven by PYTHON04;
2. official Python language/library documentation for that supported version;
3. deterministic execution evidence in the controlled runtime;
4. reviewed project examples;
5. pedagogical explanation / AI guidance.

Version-sensitive syntax or behavior must include explicit `versionContext`. Content that is stable across the supported boundary may omit a minor-version note, but may not claim universality beyond evidence.

Third-party packages (NumPy, Pandas, pytest, FastAPI, etc.) require their own package/version context. Their behavior cannot redefine Python language semantics.

Changing the supported interpreter minor version invalidates PYTHON02–PYTHON06 evidence that depends on version-sensitive behavior.
