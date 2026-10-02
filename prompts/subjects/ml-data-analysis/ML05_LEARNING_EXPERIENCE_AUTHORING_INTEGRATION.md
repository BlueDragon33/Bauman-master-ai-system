# ML05 — LEARNING EXPERIENCE · AUTHORING · PRODUCT INTEGRATION

Mode:
`SHARED-DESIGN-SYSTEM · EXPERIMENT-CENTERED · NO-CODE-FIRST · ACCESSIBLE`

# 0. ENTRY
Requires ML02–ML04.

# 1. PRIMARY SURFACES
- concept lesson;
- dataset explorer;
- experiment workspace;
- code/notebook lab;
- pipeline view;
- metric dashboard;
- model comparison;
- error analysis;
- visualization explorer;
- project/report.

# 2. DATASET EXPLORER
Show:
schema, feature types, missingness, target, distributions, split metadata.

# 3. SPLIT VIEW
Visualize train/validation/test without exposing protected test labels inappropriately.

# 4. PIPELINE VIEW
Order and fit scope visible.

# 5. EXPERIMENT WORKSPACE
Problem → data → split → pipeline → model → metric → run → diagnosis.

# 6. MODEL COMPARISON
Comparable protocol visible.

# 7. METRIC UX
No single “score” badge without context.

# 8. CONFUSION MATRIX ACCESSIBILITY
Table/text alternative.

# 9. CHART ACCESSIBILITY
Provide summaries/data table where practical.

# 10. PCA/CLUSTER PLOT
Clearly labeled as projection.

# 11. MOBILE
Do not squeeze desktop notebook+plots.
Use stacked/tabs/sheets.

# 12. CODE LAB
Reuse Python editor/runtime.

# 13. AI TUTOR UX
Contextual and clearly advisory.

# 14. ERROR NOTEBOOK
Track recurring:
leakage, metric, imbalance, overfit, split, interpretation.

# 15. AUTHORING
Shared lifecycle.
ML-specific authoring creates:
- dataset manifest;
- split policy;
- preprocessing pipeline;
- experiment task;
- model comparison task;
- metric task;
- visualization;
- hidden test protocol.

# 16. DATASET AUTHORING
Validate provenance/license/privacy.

# 17. TASK AUTHORING
Specify:
problem, dataset version, target, split rules, allowed models, metric, baseline, hidden evaluation.

# 18. LEAKAGE VALIDATOR
Reject invalid preprocessing/split setup.

# 19. PREVIEW
Author runs task end-to-end before review.

# 20. SUBJECT PACK
Canonical content + safe datasets + configs, not duplicate Python runtime.

# 21. OFFLINE
Cached lessons/data/sample experiments as supported.

# 22. DELIVERABLES
Create:
`ML_SUBJECT_MANIFEST.md`
`ML_LEARNING_BLOCK_REGISTRY.json`
`ML_DATASET_EXPLORER_UX_CONTRACT.md`
`ML_EXPERIMENT_WORKSPACE_UX_CONTRACT.md`
`ML_VISUALIZATION_ACCESSIBILITY_CONTRACT.md`
`ML_AUTHORING_SCHEMA_CONTRACT.md`
`ML_DATASET_GOVERNANCE_CONTRACT.md`
`ML_RESPONSIVE_MATRIX.md`
`ML_SUBJECT_PACK_CONTRACT.md`
`ML06_INPUT_CONTRACT.md`.

# 23. PASS
PASS when ordinary ML/data-analysis tasks can be authored and learned without app-code edits and without hiding experimental protocol.

# 24. FINAL PRINCIPLE
**MAKE THE EXPERIMENT VISIBLE, NOT JUST THE SCORE.**
