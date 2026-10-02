# ML04 — RUNTIME · VISUALIZATION · EXPERIMENT TRACKING · AI INTELLIGENCE

Mode:
`REUSE-PYTHON-RUNTIME · REPRODUCIBLE · RESOURCE-BOUNDED · AI-BOUNDED`

# 0. ENTRY
Requires ML02/ML03.

# 1. CAPABILITIES
ml.dataset.load
ml.pipeline.run
ml.model.train
ml.model.evaluate
ml.experiment.record
ml.visual.metrics
ml.visual.pca
ml.visual.cluster
ml.visual.residual
ml.ai.tutor.

# 2. PYTHON RUNTIME
Reuse Python system provider.

No second unrestricted interpreter.

# 3. PACKAGE PROFILE
Record versions for:
numpy, pandas, scikit-learn and others actually used.

# 4. DATASET LOADER
Versioned, checksum/provenance where practical.

# 5. SPLIT ENGINE
Deterministic given policy/seed.

# 6. PIPELINE ENGINE
Fit/transform scopes enforced.

# 7. TRAINING RUN
Record:
dataset version, split, pipeline, model, params, random seed, metrics.

# 8. EXPERIMENT REGISTRY
One run = immutable-ish evidence record.
Retries/new configs create new run.

# 9. CONFUSION MATRIX
Correct axes/labels.

# 10. ROC/PR
Correct positive class/threshold semantics.

# 11. RESIDUAL PLOT
Correct target/prediction relationship.

# 12. PCA VIEW
Explain projection, components, variance.
2D plot is not proof of true cluster structure.

# 13. CLUSTER VIEW
Projection/layout not equal original-space geometry.

# 14. FEATURE IMPORTANCE
Label method/limitations.

# 15. LEARNING CURVE
Train/validation sizes and scores explicit.

# 16. MODEL COMPARISON
Only comparable under same compatible evaluation protocol.

# 17. BENCHMARK
Hardware/runtime effects recorded.
No universal performance claim.

# 18. RESOURCE LIMITS
Timeout, memory, process count, output.

# 19. LARGE DATA
Sampling/streaming/limits where appropriate.

# 20. NOTEBOOK
If notebooks used:
- restart-and-run test;
- hidden-state detection;
- execution order.

# 21. AI MODES
DATA_AUDIT_COACH
SPLIT_COACH
LEAKAGE_COACH
MODEL_SELECTION_COACH
METRIC_COACH
ERROR_ANALYSIS_COACH
INTERPRETATION_COACH.

# 22. AI GROUNDING
Canonical concept + current experiment record + task + learner attempt.

# 23. AI MODEL CLAIM
Must not invent score.
Use actual run evidence.

# 24. AI CAUSALITY
Must resist causal overclaim from correlation/predictive importance.

# 25. AI HIDDEN DATA
No access to protected test labels/fixtures.

# 26. AI OFFICIAL GRADING
Forbidden by default.

# 27. FAILURE FALLBACK
Static canonical lessons + deterministic experiment history remain.

# 28. OFFLINE
Local datasets/precomputed examples where feasible.
Server training degrades honestly.

# 29. SECURITY
No arbitrary network/file/secret access from learner runtime.

# 30. DELIVERABLES
Create:
`ML_RUNTIME_PROVIDER_CONTRACT.md`
`ML_PACKAGE_PROFILE.json`
`ML_EXPERIMENT_REGISTRY_CONTRACT.md`
`ML_VISUALIZATION_CONTRACT.md`
`ML_NOTEBOOK_REPRODUCIBILITY_CONTRACT.md`
`ML_AI_TUTOR_CONTRACT.md`
`ML_SECURITY_RESOURCE_BOUNDARY.md`
`ML05_INPUT_CONTRACT.md`.

# 31. PASS
PASS when experiment execution is reproducible enough, resource-bounded, correctly visualized, and AI consumes evidence rather than inventing it.

# 32. FINAL PRINCIPLE
**THE RUNTIME EXECUTES THE EXPERIMENT; IT DOES NOT REDEFINE THE SCIENCE.**
