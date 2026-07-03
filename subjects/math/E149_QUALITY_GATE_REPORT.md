# E149 Quality Gate Report

Status: BLOCKED.

Date: 2026-07-03

Branch: `codex/e149-c01-l01-content-depth`

Base branch: `codex/e146-merge-c03-l04-l06`

Main sync status: `stacked_branch`

## Scope

Quality gate only. No lesson content was patched.

Inspected files:

- `CODEX_STATE.md`
- `subjects/math/data/theory_lecture_content.json`
- `subjects/math/E149_C01_L01_CONTENT_DEPTH_REPORT.md`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`

## Finding 1: mojibake exists

Result: FAIL.

The upgraded §1.1 content contains literal question-mark mojibake/encoding corruption. The local JSON parse succeeds, but Vietnamese characters were already replaced in the content.

Detected examples from the target lesson:

- `V?n ?? h?c t?p`
- `Trong k? thu?t, hi?n t??ng th?t kh?ng t? ?i v?o thu?t to?n`
- `Di?n gi?i k? thu?t`
- `C?u h?i t? ki?m`

Suspicious block count: 62.

Decision: do not merge this branch to `main` while this corruption exists.

## Finding 2: E129 rendering support

Result: PASS.

`subjects/math/assets/theory_skin/theory-tab-E129.js` can render these supported fields:

- `block.body`
- `block.content`
- `block.text`

Relevant behavior:

- `normalizeSlide` converts slide-level `body/content/text` into a block body if `blocks` is missing.
- `blockHtml` reads `b.body || b.content || b.text || ''`.

So E129 can render the current block field style.

## Finding 3: E132 slideshow compression

Result: PASS, compression confirmed.

`subjects/math/assets/theory_skin/theory-slideshow-E132.js` compresses rich content:

- `compact()` truncates long text.
- `sentenceBits()` splits text and keeps only a small number of sentence bits.
- `compressBlocks()` keeps only `LIMIT[role]` blocks, usually 2 or 3.
- Text blocks are reduced to up to 2 sentence bullets.
- Formula blocks are compacted to about 260 characters.

Conclusion: even after encoding is fixed, E132 slideshow mode may still display shortened content compared with the E129 reader.

## Verification summary

- JSON parse: PASS
- Mojibake check for target §1.1: FAIL
- E129 supports `text/body/content`: PASS
- E132 compresses blocks/sentences: PASS
- Runtime/UI/boot files changed: none

## Next required action

ChatGPT must prepare clean UTF-8 replacement content for §1.1 first.

Codex is not required for drafting that content. Codex is required later only to apply the replacement locally and rerun JSON/target-lesson verification.
