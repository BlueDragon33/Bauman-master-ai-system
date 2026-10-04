# ALG01 RUNTIME / VISUALIZATION AUDIT

## Execution provider

No Algorithms-specific code runner exists.

The repository now has an accepted shared Python execution capability under Programming:
- provider: `cloudflare-container-durable-object-v1`
- runtime profile: `cpython-3.14.8-stdlib-v1`
- sandbox/hidden-test boundaries are owned by the Python capability.

ALG04 should reuse this capability for Python implementation evidence instead of building a second generic Python runtime.

## Trace provider

No canonical algorithm trace provider was found for:
- array indices/state;
- queue/frontier;
- recursion stack;
- heap state;
- tree traversal;
- visited/discovery state;
- DP tables;
- union-find state.

No golden trace schema currently binds a visualization to canonical algorithm state.

## Existing “Algorithm Complexity Lab”

`subjects/programming/simulations/sim_algorithm_complexity_lab.html` exposes two sliders:
- “Quy mô dữ liệu/code”
- “Chất lượng test/tài liệu”

Its result formula is a generic demo-risk/reproducibility computation:
- risk increases with size and low quality;
- reproducibility is derived from that risk and quality.

It does **not** model:
- operation counts;
- input-size variable semantics;
- O/Ω/Θ;
- best/average/worst/amortized cases;
- algorithm/representation selection;
- asymptotic growth comparison.

Therefore it is **not valid evidence for algorithmic complexity** and must not become canonical visualization truth.

## Simulation mapping risks

- PR02 maps both theory/application simulations to the generic complexity lab.
- PR10 pseudocode also maps to the same complexity lab.
- PR11 data-structures lesson maps to `sim_dataframe_cleaning_lab.html`.

This proves the current simulation layer is template-driven rather than algorithm-state-driven.

## Security/runtime conclusion

No new security defect is introduced by ALG01 because no execution behavior changes. Future ALG execution should route through accepted capabilities and must add algorithm-specific traces/invariants without bypassing Python sandbox governance.
