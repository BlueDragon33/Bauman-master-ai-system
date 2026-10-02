# ML06 — ACCEPTANCE · HARDENING · LEGACY CLOSURE · RC READINESS

Mode:
`LEAKAGE-RED-TEAMED · REPRODUCIBILITY-TESTED · NO-KNOWN-BLOCKER`

# 0. MISSION
Prove the integrated ML/Data Analysis subject is academically sound and release-ready.

# 1. CRITICAL GATES
Academic truth
Experimental protocol
Runtime/visualization
AI
UX/accessibility
Security/privacy
Offline/performance
Legacy/RC.

# 2. LEAKAGE MATRIX
Test:
- target leakage;
- scale before split;
- impute before split;
- feature selection before split;
- duplicate rows across split;
- same group across split;
- temporal future leakage;
- tune on test.

# 3. CLASSIFICATION MATRIX
- balanced;
- imbalanced;
- multiclass if supported;
- threshold changes;
- missing class in fold;
- probability vs label metrics.

# 4. REGRESSION MATRIX
- outliers;
- scale;
- heteroscedastic/residual patterns where scope;
- metric differences;
- baseline.

# 5. CROSS-VALIDATION
Pipeline fit per fold.

# 6. PCA
Scaling/centering assumptions and variance interpretation.

# 7. CLUSTERING
Scale/distance/initialization/randomness.

# 8. RANDOMNESS
Reproducible fixture with seeds; acknowledge library/platform variability.

# 9. MULTIPLE VALID MODELS
Grader accepts different sound approaches when task permits.

# 10. WRONG PIPELINE LIBRARY
Known flawed experiments must fail.

# 11. METRIC MISUSE
Known misleading metrics must be caught.

# 12. NOTEBOOK RESTART
Restart-and-run clean.

# 13. RUNTIME SECURITY
No secret/network/file escape.

# 14. RESOURCE LIMITS
Large/infinite jobs contained.

# 15. VISUALIZATION
Axes/labels/class orientation/projection semantics correct.

# 16. AI
Test:
- leakage diagnosis;
- metric choice;
- overfit;
- correlation/causality;
- hidden test refusal;
- no official mastery write.

# 17. DATA PRIVACY
No sensitive real data exposed in fixtures/logs.

# 18. OFFLINE
Supported matrix verified honestly.

# 19. PERFORMANCE
Dataset load, runtime init, training sample tasks, chart rendering, authoring list.

# 20. LEGACY
Remove/resolve duplicate:
split logic, metric calculators, dataset loaders, experiment stores, old model runners, stale notebooks/routes.

# 21. RC
Freeze:
SHA, content snapshot, subject pack, dataset versions, Python/package profile, config, lockfile.

# 22. PRODUCTION SMOKE PROFILE
1. open ML subject;
2. open multivariate-analysis lesson;
3. load safe test dataset;
4. run deterministic train/evaluate task;
5. verify split/pipeline identity;
6. render one metric visualization;
7. verify active subject pack/dataset version;
8. verify Python runtime profile;
9. verify optional AI grounded/fallback;
10. offline cached lesson/sample if supported.

# 23. DELIVERABLES
Create:
`ML_ACCEPTANCE_MATRIX.md`
`ML_LEAKAGE_REGRESSION_REPORT.md`
`ML_REPRODUCIBILITY_REPORT.md`
`ML_METRIC_MODEL_ACCEPTANCE.md`
`ML_VISUALIZATION_ACCEPTANCE.md`
`ML_RUNTIME_SECURITY_REPORT.md`
`ML_AI_ACCEPTANCE_REPORT.md`
`ML_ACCESSIBILITY_RESPONSIVE_REPORT.md`
`ML_OFFLINE_PERFORMANCE_REPORT.md`
`ML_LEGACY_CLOSURE_REPORT.md`
`ML_RC_MANIFEST.json`
`ML_PRODUCTION_SMOKE_PROFILE.md`
`ML06_EVIDENCE_INDEX.md`.

# 24. BLOCKERS
- any systematic leakage accepted;
- hidden test labels exposed;
- metric semantics wrong;
- runtime can access secrets/unrestricted network/files;
- experiment record cannot reproduce required protocol;
- AI fabricates experiment results;
- duplicate canonical owner;
- learner-state corruption.

# 25. PASS
PASS only when valid experiments pass, flawed/leaky experiments fail, runtime/AI/UX/security all agree with canonical truth, and exact RC exists.

# 26. FINAL PRINCIPLE
**A RELEASE-CANDIDATE ML COURSE MUST BE ABLE TO FAIL A LEAKY HIGH-SCORE EXPERIMENT.**
