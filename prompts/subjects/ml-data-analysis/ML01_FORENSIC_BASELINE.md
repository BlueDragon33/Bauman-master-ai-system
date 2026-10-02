# ML01 — FORENSIC BASELINE
## Audit current data-analysis/ML reality before redesign

Mode:
`AUDIT-ONLY · NO-REDESIGN · REPOSITORY-TRUTH-FIRST`

# 0. MISSION
Map current content, datasets, notebooks, Python runtime, models, metrics, assessments, visualizations, learner state and AI usage.

# 1. DISCOVERY
Search actual repo for:
- math/data-analysis lessons;
- ML lessons;
- sklearn/numpy/pandas;
- notebooks;
- CSV/JSON datasets;
- preprocessing;
- training;
- evaluation;
- model artifacts;
- visualizations;
- AI tutor;
- legacy modules.

# 2. CONTENT INVENTORY
Classify present/partial/duplicate/legacy/unknown:
- descriptive statistics;
- covariance/correlation;
- multivariate data;
- regression;
- classification;
- clustering;
- PCA/dimensionality reduction;
- model selection;
- evaluation;
- preprocessing;
- feature engineering;
- validation;
- imbalance;
- interpretability.

# 3. DATASET INVENTORY
For each dataset record:
- source;
- license/provenance;
- target;
- features;
- size;
- missingness;
- split;
- sensitivity/privacy;
- synthetic/real;
- version.

# 4. SPLIT AUDIT
Find train/validation/test logic.
Flag:
- fit-before-split;
- test tuning;
- duplicate leakage;
- temporal leakage;
- group leakage;
- target leakage.

# 5. PREPROCESSING AUDIT
Inspect:
- scaling;
- encoding;
- imputation;
- feature selection;
- normalization;
- pipeline fit scope.

# 6. MODEL INVENTORY
Record actual algorithms/models in repo.
Do not assume future curriculum.

# 7. METRIC AUDIT
Inventory:
- accuracy;
- precision;
- recall;
- F1;
- ROC-AUC;
- PR-AUC;
- MSE/RMSE/MAE/R2;
- clustering metrics;
- others.

Flag metric misuse.

# 8. MULTIVARIATE ANALYSIS AUDIT
Inspect:
- covariance;
- correlation matrix;
- PCA;
- factor/discriminant/other methods if present;
- assumptions.

# 9. VISUALIZATION AUDIT
Find:
- scatter;
- pair plots;
- distributions;
- correlation heatmap;
- confusion matrix;
- ROC/PR;
- residuals;
- learning curves;
- PCA projection;
- clusters.

# 10. EXPERIMENT TRACKING AUDIT
Check:
- random seed;
- config;
- model params;
- dataset version;
- metric results;
- reproducibility.

# 11. NOTEBOOK AUDIT
Flag:
- out-of-order state;
- hidden variables;
- stale output;
- untracked dependencies.

# 12. ASSESSMENT AUDIT
Find:
- quiz;
- code task;
- metric interpretation;
- experiment design;
- leakage diagnosis;
- model comparison;
- report.

# 13. AI AUDIT
Check if AI:
- chooses model blindly;
- leaks answers;
- fabricates metric interpretation;
- writes mastery;
- sees hidden test data.

# 14. RUNTIME AUDIT
Map Python provider, packages, resource limits, network/file access.

# 15. DUPLICATE OWNER AUDIT
Find duplicate:
- dataset loaders;
- split logic;
- metric calculators;
- preprocessing pipelines;
- experiment stores;
- model runners.

# 16. SECURITY/PRIVACY AUDIT
Check real personal/sensitive data handling and secret leakage.

# 17. DELIVERABLES
Create:
`subjects/ml-data-analysis/docs/ml01/ML01_EXECUTIVE_SUMMARY.md`
`ML01_REPOSITORY_MAP.md`
`ML01_CONTENT_INVENTORY.json`
`ML01_DATASET_INVENTORY.json`
`ML01_MODEL_METRIC_INVENTORY.json`
`ML01_LEAKAGE_RISK_AUDIT.md`
`ML01_RUNTIME_NOTEBOOK_AUDIT.md`
`ML01_DUPLICATE_OWNER_MAP.md`
`ML01_RISK_REGISTER.json`
`ML02_INPUT_CONTRACT.md`.

# 18. PASS
PASS only when current content/data/runtime/evaluation/leakage/ownership are evidenced.

# 19. FINAL PRINCIPLE
**AUDIT THE DATA PIPELINE, NOT JUST THE MODEL LIST.**
