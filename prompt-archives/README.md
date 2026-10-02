# Prompt ZIP Archives

This directory stores subject prompt ZIP packages for provenance and recovery.

Shared authority remains:

1. `.blueprint/constitution-adoption.json`
2. `prompts/CONSTITUTION.md`
3. canonical subject `README.md` + Master Prompt + `PROJECT_STATE.json`
4. ZIP archive as source snapshot / recovery package

## Execution rule

ZIP files are archives, not simultaneous execution units.

Execute one subject at a time:

`README → PROJECT_STATE / SOURCE_STATUS → active module → router → PASS gate → next module`

The normalization pipeline extracts/repackages subject systems into `prompts/subjects/<slug>/` and removes duplicated per-ZIP Constitution copies from canonical execution.

## Packages

- `russian-pack.zip` — Russian — SHA-256 `5ae5f6ff40d7ca2604659c2903d17dba18f9a22cb1c47235929888e921343ffa` — `prompts/subjects/russian/` — CANONICAL_EXTRACTED
- `math.zip` — Mathematics — SHA-256 `d698ac11eb1bf854d2f0612573f2015c0649e5003336ac626ea927a0da0dc3c1` — `prompts/subjects/math/` — CANONICAL_EXTRACTED
- `python-pack.zip` — Python — SHA-256 `60b2d250fb58208ffb13a0326232d42937a04b7a87a8c9328984655bdb72bd7f` — `prompts/subjects/python/` — CANONICAL_EXTRACTED
- `algorithms-pack.zip` — Algorithms & Data Structures — SHA-256 `9b82634a0016d8d7e505daeb137f1168039f770e855a612ac397d4d674a425bf` — `prompts/subjects/algorithms/` — CANONICAL_EXTRACTED
- `database.zip` — Database Systems & SQL — SHA-256 `be7e516dea84209ccfea29f71e5ede4fc8330049504e81a85a350a4768a0a903` — `prompts/subjects/database/` — CANONICAL_EXTRACTED
- `ml-data-analysis.zip` — Multivariate Data Analysis & Machine Learning — SHA-256 `c9ea3473095aadec7f2f5f1514dc9cb277d4b03297b3b2b8f0c532052f487d5e` — `prompts/subjects/ml-data-analysis/` — CANONICAL_EXTRACTED
- `analytical-models.zip` — Analytical Models of ASOIU — SHA-256 `b8dca8796c89f6ea298b9dd04b508e1a6fca2da614afeda57fdd90453516d12b` — `prompts/subjects/analytical-models/` — CANONICAL_EXTRACTED
- `oop-software-engineering.zip` — OOP Design & Software Engineering — SHA-256 `ef0d21b6a85ba25be36d675c474f772adf493f2878e631b3b54ba2bc951bda07` — `prompts/subjects/oop-software-engineering/` — CANONICAL_EXTRACTED
- `advanced-database.zip` — Advanced Database Systems — SHA-256 `05b596d8b6729556180af6b495030bbe04c89f9f6143d97eb4354242db0650d3` — `prompts/subjects/advanced-database/` — CANONICAL_EXTRACTED
- `reliability-models.zip` — Reliability Models of ASOIU — SHA-256 `64b1b20b941d6660f4e1cd3130e95d29c53c4b1f2b0412af4bccb114ecc8f1b6` — `prompts/subjects/reliability-models/` — CANONICAL_EXTRACTED
- `neural-networks.zip` — Neural Network Systems — SHA-256 `2144a6f54390115d747f24aa2221370b9a3ac203f34d2aad8037aa730f7292dc` — `prompts/subjects/neural-networks/` — CANONICAL_EXTRACTED
- `time-series.zip` — Time Series Analysis — SHA-256 `7d002319e5da4ba57386bcd187a8638e4b83147e496cd0de54ee407fe0bcae5e` — `prompts/subjects/time-series/` — CANONICAL_EXTRACTED
- `research-methodology.zip` — Research Methodology & Scientific Work — SHA-256 `310c01ae04760f5fa2772e1df9da80a02eaf34e35cb1e29b8b39836c5672c410` — `prompts/subjects/research-methodology/` — CANONICAL_EXTRACTED
- `ai-business-analytics.zip` — AI in Business Analytics — SHA-256 `9ed770191463787175cf6dc67a4cff55773dbe728b316feaee57d12b9cc2380d` — `prompts/subjects/ai-business-analytics/` — CANONICAL_EXTRACTED
- `mivar-logical-ai.zip` — Mivar / Logical AI — SHA-256 `5344d3ef38d34d5beb4e1163650ded35e7698a8257817ac8a4b09b3a7d80d2e0` — `prompts/subjects/mivar-logical-ai/` — CANONICAL_EXTRACTED
- `ergonomics-hci.zip` — Ergonomics / HCI — SHA-256 `d3af304bf261ed93721f40e069f4e8ae39074dc9b865eddd83bf9e6dc9326d69` — `prompts/subjects/ergonomics-hci/` — CANONICAL_EXTRACTED
- `lifecycle-systems-engineering.zip` — Lifecycle & Systems Engineering — SHA-256 `556c7b8f55f85f011fd1f1f419c48e5485718fed4fc860213e2f1aabb2a506f4` — `prompts/subjects/lifecycle-systems-engineering/` — CANONICAL_EXTRACTED
- `information-security.zip` — Information Security for ASOIU — SHA-256 `6a0d56eff7b37885170a1be6ff2c33f91fb7b378604dc262df48a3945e78e04b` — `prompts/subjects/information-security/` — CANONICAL_EXTRACTED
- `big-data-processing.zip` — Big Data Processing Technologies — SHA-256 `9e7c8553f7695293baec3cb1bb5d9833a48ac68d0b1e95523ccef04d275df54d` — `prompts/subjects/big-data-processing/` — CANONICAL_EXTRACTED
- `project-design-management.zip` — Project Design Management — SHA-256 `03473397f0d383bfea67183a21f7bf872aceed22833575c6e7c46a33c0e8cfb8` — `prompts/subjects/project-design-management/` — CANONICAL_EXTRACTED
- `entrepreneurship.zip` — Entrepreneurship — SHA-256 `8e40543ac7568f72ebd31606fcf46a8d5f97ebe74cdbc146ee4a8ad651111491` — `prompts/subjects/entrepreneurship/` — CANONICAL_EXTRACTED
- `nir-vkr-integration.zip` — Research Practice / NIR / VKR Integration — SHA-256 `2e8ad9bc50d3b6f1e13bee07b05d7e9d5b4c35c5dfeb025f9f5165507694b8c4` — `prompts/subjects/nir-vkr-integration/` — CANONICAL_EXTRACTED

## Constitution rule

Do not execute ZIP-embedded duplicate constitutions as a second authority.
The canonical shared Constitution is `prompts/CONSTITUTION.md` plus `prompts/constitution/`.

## Source preservation

Archive hashes above preserve provenance. Canonical readable prompt files live under `prompts/subjects/`.
