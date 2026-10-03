# MATH04 · SIMULATION / NUMERICAL METHODS CONTRACT

Status: ACTIVE

The pilot `math.simulation.run` implements bounded fixed-point iteration only.

Every result returns initial condition, iteration history, iteration count, exactness class and either convergence or `NON_CONVERGED`. Invalid/non-finite iterations fail explicitly.

No convergence is never presented as a valid converged answer. General ODE/PDE/Monte-Carlo capability is not claimed until a validated provider exists.

Simulation frequency/visual behavior is evidence about a model execution, not proof of a mathematical law.
