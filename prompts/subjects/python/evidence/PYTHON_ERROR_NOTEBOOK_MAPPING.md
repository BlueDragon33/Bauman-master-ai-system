# PYTHON ERROR NOTEBOOK MAPPING

The Error Notebook stores recurring patterns, not every typo.

| Error family | Canonical competency | Useful remediation |
|---|---|---|
| syntax/indentation | py.comp.syntax-expressions | minimal repair + explain parser location |
| name/scope | py.comp.functions / py.comp.state-mutation | binding/scope trace |
| type/value | py.comp.type-semantics | operand/value contract tasks |
| index/key | py.comp.collections-iteration | boundary/membership tasks |
| mutation/aliasing | py.comp.state-mutation | object-state trace + transfer task |
| control/off-by-one | py.comp.control-flow | zero/one/many path table |
| exceptions | py.comp.exceptions | recoverability + propagation task |
| imports/environment | py.comp.modules-imports / tooling-reproducibility | reproduce environment |
| file/encoding | py.comp.files-data | path/encoding/context-manager practice |
| iterator state | py.comp.iterators-generators | exhaustion trace |
| float/numeric | py.comp.type-semantics | tolerance/approximation task |
| logic/requirement | py.comp.testing-debugging | new hidden-case contract task |
| notebook stale state | py.comp.tooling-reproducibility | restart/run-all + script extraction |

Remediation chain: `pattern → targeted micro-practice → trace/debug task → transfer task → new evidence`. Repeating the same question is not sufficient remediation.
