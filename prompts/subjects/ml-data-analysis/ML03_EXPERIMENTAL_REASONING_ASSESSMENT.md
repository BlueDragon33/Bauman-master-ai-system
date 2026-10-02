# ML03 — EXPERIMENTAL REASONING · MODEL EVALUATION · ASSESSMENT

Mode:
`EXPERIMENT-FIRST · LEAKAGE-AWARE · MULTIPLE-VALID-SOLUTION-AWARE`

# 0. ENTRY
Requires ML02.

# 1. REASONING LOOP
Problem → Data audit → Split → Preprocess → Baseline → Model → Train → Evaluate → Diagnose → Compare → Interpret → Generalize.

# 2. PROBLEM FORMULATION
Assess:
- target;
- unit of prediction;
- success criterion;
- constraints;
- leakage risks.

# 3. DATA AUDIT
Evidence:
- shape;
- missing values;
- class distribution;
- feature types;
- duplicates;
- temporal/group structure.

# 4. SPLIT ASSESSMENT
Learner selects correct split strategy.

# 5. TEMPORAL DATA
Random split may be invalid.

# 6. GROUPED DATA
Same entity must not leak across split where inappropriate.

# 7. PREPROCESSING
Fit transforms on training scope.

# 8. PIPELINE
Assessment should catch preprocessing leakage.

# 9. BASELINE
Learner should compare to baseline.

# 10. MODEL CHOICE
Multiple models can be valid.
Grade reasoning + constraints, not one favorite algorithm.

# 11. METRIC CHOICE
Context matters.
Accuracy may fail on imbalance.

# 12. THRESHOLD
Classification decisions may depend on threshold.

# 13. CONFUSION MATRIX
Interpret TP/FP/FN/TN in domain context.

# 14. ROC VS PR
Teach trade-offs/context, not one universal superiority claim.

# 15. REGRESSION ERROR
Residual/error analysis.

# 16. CROSS-VALIDATION
Assess fold setup and preprocessing isolation.

# 17. HYPERPARAMETER TUNING
Do not tune on test.

# 18. TEST SET
Final-ish unbiased evaluation; repeated test peeking contaminates.

# 19. OVERFIT
Detect training/validation gap.

# 20. UNDERFIT
Detect both poor.

# 21. LEARNING CURVE
Interpret cautiously.

# 22. FEATURE IMPORTANCE
Model-dependent, not causality.

# 23. PCA ASSESSMENT
Scaling/variance/projection interpretation.

# 24. CLUSTERING ASSESSMENT
Distance/scale/number-cluster reasoning.

# 25. MULTIVARIATE ASSESSMENT
Covariance/correlation/PCA and dimensional structure as in scope.

# 26. MULTIPLE VALID PIPELINES
Accept different sound pipelines if task permits.

# 27. REPRODUCIBILITY
Record config/version/seed.

# 28. ERROR TAXONOMY
DATA_QUALITY_ERROR
SPLIT_ERROR
TARGET_LEAKAGE
PREPROCESSING_LEAKAGE
METRIC_ERROR
BASELINE_ERROR
OVERFIT_ERROR
UNDERFIT_ERROR
IMBALANCE_ERROR
MODEL_SELECTION_ERROR
INTERPRETATION_ERROR
REPRODUCIBILITY_ERROR
CAUSALITY_OVERCLAIM.

# 29. HINT LADDER
H1 clarify target
H2 inspect data/split
H3 inspect leakage
H4 choose baseline/metric
H5 suggest model family
H6 point to error analysis
H7 full walkthrough only when allowed.

# 30. GRADING
Separate:
problem framing, data protocol, preprocessing, model reasoning, evaluation, interpretation, reproducibility.

# 31. CODE GRADING
Code can be correct but experiment invalid.
Keep separate evidence.

# 32. HIDDEN TEST/DATA
Protected.

# 33. TEST-OF-TESTS
Known flawed pipelines must fail:
- scale before split;
- tune on test;
- leakage feature;
- wrong metric;
- non-stratified severe imbalance where inappropriate;
- temporal shuffle.

# 34. DELIVERABLES
Create:
`ML_EXPERIMENT_REASONING_CONTRACT.md`
`ML_ASSESSMENT_GRADER_CONTRACT.md`
`ML_LEAKAGE_TEST_MATRIX.md`
`ML_METRIC_SELECTION_CONTRACT.md`
`ML_ERROR_TAXONOMY.json`
`ML_GOLDEN_VALID_EXPERIMENTS.json`
`ML_GOLDEN_INVALID_EXPERIMENTS.json`
`ML04_INPUT_CONTRACT.md`.

# 35. PASS
PASS when experiment validity can be assessed independently of one specific code/model implementation.

# 36. FINAL PRINCIPLE
**A HIGH SCORE FROM A LEAKY EXPERIMENT IS A FAILED EXPERIMENT.**
