# PYTHON VERSION & AUTHORITY POLICY

## Binding status

`supportedPythonMinor = UNBOUND` in PYTHON02. A minor version may be bound only by PYTHON04 when an actual execution/runtime contract exists, or by an authoritative target requirement. Content must not silently assume “latest Python”.

## Language authority order

1. Official Python language reference/documentation for the supported version.
2. Deterministic execution in the supported runtime under a controlled environment.
3. Validated project canonical examples/tests.
4. Curated explanations.
5. AI/tool suggestions.

Formatters, linters and type checkers provide signals; none is universal language truth.

## Version-sensitive content

Any materially version-sensitive syntax/behavior carries `versionScope` and, when needed, a fallback/compatibility note. Examples include newer syntax forms, typing syntax, dictionary/order guarantees and standard-library changes.

## Third-party packages

Package semantics require package name, version/range and authoritative official package documentation. NumPy/Pandas/scikit-learn/FastAPI behavior must never be promoted to universal Python language semantics.

## Reproducibility

A Python artifact is reproducible only from a known interpreter/runtime contract plus declared dependencies and inputs. Hidden notebook state is not accepted as the sole execution contract.

