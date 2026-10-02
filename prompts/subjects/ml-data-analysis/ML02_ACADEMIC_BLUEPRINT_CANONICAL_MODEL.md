# ML02 — ACADEMIC BLUEPRINT & CANONICAL ML/DATA MODEL
## Data · Features · Targets · Statistical assumptions · Models · Metrics · Provenance

Mode:
`CANONICAL-OWNER · EXPERIMENT-AWARE · STATISTICALLY-CAUTIOUS`

# 0. ENTRY
Requires ML01.

# 1. OUTCOMES
Learner can:
- formulate ML problem;
- inspect data;
- select features/target;
- split correctly;
- preprocess safely;
- establish baseline;
- choose model family;
- train/tune;
- evaluate;
- diagnose errors;
- interpret;
- compare;
- communicate limitations;
- reproduce experiment.

# 2. CANONICAL ENTITIES
Dataset
DatasetVersion
Feature
Target
SplitPolicy
PreprocessingStep
Pipeline
ModelFamily
ModelConfig
TrainingRun
Metric
Evaluation
CrossValidationPlan
Baseline
ErrorSlice
Visualization
Experiment
Claim
Misconception
Remediation.

# 3. DATA MODEL
Represent:
- row/sample;
- feature;
- target;
- feature type;
- missingness;
- grouping;
- temporal ordering;
- provenance.

# 4. TASK TYPES
Regression
Classification
Clustering
DimensionalityReduction
possibly anomaly detection or other scope after audit.

# 5. SUPERVISED VS UNSUPERVISED
Explicit.

# 6. SPLIT POLICY
Represent:
- random;
- stratified;
- group;
- temporal;
- cross-validation.

# 7. LEAKAGE TYPES
Target leakage
Train-test contamination
Temporal leakage
Group leakage
Preprocessing leakage
Duplicate leakage.

# 8. PREPROCESSING
Imputation
Scaling
Encoding
Transformation
Feature selection
Dimensionality reduction
Pipeline scope.

# 9. MULTIVARIATE FOUNDATIONS
Means/variances/covariance/correlation.
Matrix representation references Math owner.

# 10. CORRELATION
Not causation.
Assumptions/context explicit.

# 11. PCA
Represent:
- centering/scaling context;
- components;
- explained variance;
- projection;
- reconstruction limits;
- interpretation caution.

# 12. REGRESSION
Canonical model covers:
- objective;
- assumptions as appropriate;
- loss;
- fit;
- residuals;
- metrics.

# 13. CLASSIFICATION
Classes, probabilities/scores, thresholds, confusion matrix, metrics.

# 14. IMBALANCE
Accuracy limitations.
Class weighting/resampling only as techniques, not automatic fixes.

# 15. CLUSTERING
No ground-truth accuracy assumption.
Distance/scale/cluster assumptions explicit.

# 16. MODEL FAMILIES
Actual course/repo evidence decides exact families.
Potential:
linear models, kNN, trees, ensembles, SVM, clustering.
Neural networks remain separate advanced subject if needed.

# 17. BIAS/VARIANCE
Conceptual.

# 18. OVERFIT/UNDERFIT
Separate training vs generalization behavior.

# 19. BASELINE
Define simple comparison point.

# 20. METRIC MODEL
Metric includes:
task, formula/meaning, direction, threshold dependence, class balance sensitivity, assumptions.

# 21. CLASSIFICATION METRICS
Accuracy/precision/recall/F1/ROC-AUC/PR-AUC as in scope.

# 22. REGRESSION METRICS
MSE/RMSE/MAE/R2 as in scope.

# 23. CROSS-VALIDATION
Fold semantics and preprocessing scope explicit.

# 24. HYPERPARAMETER TUNING
Validation/CV only, not test-set optimization.

# 25. RANDOMNESS
Seed/context recorded, but seed ≠ universal reproducibility across environments.

# 26. PROVENANCE
Dataset/model/config/metric claim traceable.

# 27. CLAIM CONTRACT
Every performance claim binds:
dataset version + split + preprocessing + model config + metric + evaluation protocol.

# 28. DELIVERABLES
Create:
`ML_ACADEMIC_BLUEPRINT.md`
`ML_COMPETENCY_GRAPH.json`
`ML_PREREQUISITE_GRAPH.json`
`ML_CANONICAL_ENTITY_SCHEMA.json`
`ML_DATASET_SPLIT_CONTRACT.md`
`ML_PREPROCESSING_PIPELINE_CONTRACT.md`
`ML_MODEL_METRIC_CONTRACT.md`
`ML_EXPERIMENT_CLAIM_CONTRACT.md`
`ML_MULTIVARIATE_ANALYSIS_CONTRACT.md`
`ML03_INPUT_CONTRACT.md`.

# 29. PASS
PASS when one canonical model can support lessons, runtime, assessment, AI and experiments without duplicated truth.

# 30. FINAL PRINCIPLE
**A MODEL SCORE WITHOUT DATA/SPLIT/PROTOCOL CONTEXT IS NOT A COMPLETE FACT.**
