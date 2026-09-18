# Lượt 19 · Bước 73 — Baseline Inventory

Status: `PASS`

Repository: `BlueDragon33/Bauman-master-ai-system`  
Physical baseline: `main@e383912354673bdce7a0059d6b9a23799d74e689`  
Inventory mode: read-only; no runtime, UI, manifest, lesson or assessment file was changed.

## Resolved baseline discrepancy

The Lượt 18 handoff described a physical `E15 / Chapter 7` package for covariance,
correlation and PCA. Repository and Library inspection proved that package does not
exist as a source file, branch or commit. `E15` is therefore retained only as a
historical handoff label and must not be used as a physical version or migration key.

The repository does contain the required academic material, but under stable legacy
IDs in `subjects/math/data/lessons.json`:

- `MATH-VN-PS-C05-L05` — covariance of two random variables;
- `MATH-PREP-LA2-C10-L05` — covariance matrix and maximum-variance direction;
- `MATH-PREP-LA2-C10-L06` — PCA and explained variance;
- `MATH-PREP-LA2-C10-L07` — SVD and its relation to PCA;
- `MATH-PREP-PS2-C15-L06` — covariance, correlation and multidimensional sensor noise.

Roadmap node `MATH-L2-C07` is a new logical node. It maps to the legacy IDs above;
it is not a physical chapter number. In the navigation/curriculum `chapter_spine`,
record 7 is Russian mathematical language. A separate secondary source,
`theory-framework.json`, does contain outline ID `m_p07` with 8 sub-lesson IDs for
covariance/correlation/PCA; all eight are `outline_only_waiting_for_full_content` and
must not be treated as authoritative physical lessons or runtime-ready content.

## Immutable source fingerprints

Git blob SHAs are used as immutable fingerprints for the physical baseline.

| Source | Blob SHA | Verified facts |
|---|---|---|
| `subjects/math/index.html` | `f3f98f53459d4ce46080ffdf7eebb6c32fcda3ef` | Runtime entry; 20 JS and 6 CSS references |
| `subjects/math/subject-manifest.json` | `776827795cb3dbc7f81dfb6cf4f869d9c1dd0029` | Manifest version `E126_THEORY_VISUAL_INTEGRATED` |
| `subjects/math/data/discipline_spine.json` | `2de04bb0c29085254a44d611b6e4ea03223879c6` | 12-discipline frame |
| `subjects/math/data/chapter_spine.json` | `db067682cce0389939048d5aabcaef38c6bad0e6` | 56 chapter-frame records |
| `subjects/math/data/curriculum.json` | `02965e126b1b0661032dcb6a9c91428f6148c24b` | Legacy stage/module curriculum |
| `subjects/math/data/lessons.json` | `caacdf2b0813c1300af215608c4222ca61669184` | 347 unique lessons, 40 source chapters / 41 physical content groups, 5,552 base slides |
| `subjects/math/data/theory_lecture_content.json` | `0a7c49c25c0546411717dc5c39308c0c71d2a2e1` | 18 durable overlay records: C01–C03 |
| `subjects/math/data/theory-framework.json` | `fb3a9a052e6c467c03bea5204dae10303ba73766` | Secondary outline: 21 chapters/172 sub-lessons; `m_p07` has 8 outline-only items |
| `subjects/math/data/formulas.json` | `0637a088a01e8ddab3bf3fa98dbe804cbde1a0dc` | Empty array at baseline |
| `subjects/math/data/exercises.json` | `0637a088a01e8ddab3bf3fa98dbe804cbde1a0dc` | Empty array at baseline |
| `subjects/math/data/simulations.json` | `0637a088a01e8ddab3bf3fa98dbe804cbde1a0dc` | Empty array at baseline |
| `subjects/math/data/tests.json` | `9d048963479d0ea6e77d6b13c5fb555f68eaf2ca` | Assessment contract shell; 4 declared levels; 0 questions |
| `subjects/math/assets/theory_skin/theory-formula-fraction-align-E235.js` | `0a041b808473309f2bf58091ae690a7298b7c9eb` | Protected E235 layer |
| `subjects/math/assets/theory_skin/theory-artifact-authoritative-route-E245.js` | `1a357ca7c5477b4b9d0b2e6e78c45f2febdac062` | Authoritative lesson-artifact route |
| `subjects/math/assets/theory_skin/theory-slideshow-richness-E242.js` | `8d07a9d15db08236ed1db39cc644ec02e5f3c281` | Accepted richness layer |
| `subjects/math/assets/theory_skin/theory-slideshow-reader-fit-E212.js` | `5b04e0bc978b0c90a86e2739301f6e895396e84f` | E215 browser-smoke accepted fit layer |

## Baseline truth table

| Claim | Physical truth at baseline | Migration decision |
|---|---|---|
| “E15 is the current source version” | No such source version found | Keep only as historical label; never use as ref |
| “Chapter 7 is covariance/correlation/PCA” | Layer-dependent: `chapter_spine` record 7 is Russian math language; `theory-framework` has secondary outline `m_p07`; authoritative lesson content is in C05/C10/C15 | Use Roadmap logical ID `MATH-L2-C07`, reference the 5 authoritative lesson IDs, quarantine `m_p07` as outline-only |
| “Math has 347 lessons” | True in `lessons.json` | Preserve all IDs and the file blob until an explicit content migration |
| “Formula/exercise/simulation/test sets are synchronized” | False for standalone legacy files: first three are empty; tests is a shell | Mark as `gap`; create new sidecar data, never pretend it is reusable content |
| “C01–C07 durable overlay is complete” | False: durable overlay has 18 records only for C01–C03 | Preserve completed records; do not advertise later chapters as completed |

## Protected migration boundary

1. Do not rewrite or renumber any legacy math ID.
2. Do not modify `index.html`, E212, E235, E242, E245 or core UI during Roadmap
   registry work.
3. Add Roadmap V2 as a sidecar namespace under `roadmap_v2`.
4. Keep `legacyRefs` as an array because one Roadmap competency can map to multiple
   legacy lessons and one legacy lesson can support more than one competency.
5. A mapped item is reusable only when source content exists; a manifest count or
   planned count is not evidence of content.
6. Any future write to a protected source requires pre/post blob comparison and a
   targeted regression test.

## Bước 73 acceptance

- Repository, branch and commit are unambiguous: PASS.
- Runtime entry and protected layers fingerprinted: PASS.
- Manifest/frame/content counts verified against actual JSON: PASS.
- Covariance/correlation/PCA legacy IDs resolved: PASS.
- `E15 / C07` naming conflict corrected without deleting academic content: PASS.
- Runtime and data source changed: NO.
