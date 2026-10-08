# Russian Engine RE40 — Human Linguistic Review Queue

State: **HUMAN_REVIEW_REQUIRED**

This queue is generated from the Phase 6 real-life fixture catalog. No item below is canonical or approved.

For each scene an RU03-authorized HUMAN reviewer must decide: APPROVE, CHANGES_REQUESTED, or REJECT. The decision must match the exact revision and fingerprint.

| # | Scene | Setting | Russian stimulus | Semantic target | Expected object | Revision | Fingerprint |
|---:|---|---|---|---|---|---|---|
| 1 | `rl-01-room` | room | **Дай мяч.** | request-object | `ball` | `real-life-v1-r1` | `fnv1a32-e005c18e` |
| 2 | `rl-02-room` | room | **Дай книгу.** | request-object | `book` | `real-life-v1-r1` | `fnv1a32-6c1ad0b8` |
| 3 | `rl-03-room` | room | **Где чашка?** | locate-object | `cup` | `real-life-v1-r1` | `fnv1a32-d5055953` |
| 4 | `rl-04-shop` | shop | **Где хлеб?** | locate-object | `bread` | `real-life-v1-r1` | `fnv1a32-f38b7b81` |
| 5 | `rl-05-shop` | shop | **Дай воду.** | request-object | `water` | `real-life-v1-r1` | `fnv1a32-72375cb9` |
| 6 | `rl-06-shop` | shop | **Где молоко?** | locate-object | `milk` | `real-life-v1-r1` | `fnv1a32-13656e46` |
| 7 | `rl-07-metro` | metro | **Где билет?** | locate-object | `ticket` | `real-life-v1-r1` | `fnv1a32-69b16b08` |
| 8 | `rl-08-metro` | metro | **Где карта?** | locate-object | `map` | `real-life-v1-r1` | `fnv1a32-7f63153c` |
| 9 | `rl-09-metro` | metro | **Где метро?** | locate-object | `metro` | `real-life-v1-r1` | `fnv1a32-52333be0` |
| 10 | `rl-10-dorm` | dorm | **Где ключ?** | locate-object | `key` | `real-life-v1-r1` | `fnv1a32-1a2e5372` |
| 11 | `rl-11-dorm` | dorm | **Где комната?** | locate-object | `door` | `real-life-v1-r1` | `fnv1a32-c784dfb4` |
| 12 | `rl-12-dorm` | dorm | **Где душ?** | locate-object | `shower` | `real-life-v1-r1` | `fnv1a32-bdb5ec0b` |
| 13 | `rl-13-university` | university | **Где аудитория?** | locate-object | `classroom` | `real-life-v1-r1` | `fnv1a32-a501bbf6` |
| 14 | `rl-14-university` | university | **Где библиотека?** | locate-object | `library` | `real-life-v1-r1` | `fnv1a32-dd06be39` |
| 15 | `rl-15-university` | university | **Дай тетрадь.** | request-object | `notebook` | `real-life-v1-r1` | `fnv1a32-85a21296` |

## Reviewer checklist

For every row, verify grammar, naturalness/register, semantic match, spelling/punctuation, stress-sensitive wording, and accepted variants. Do not approve by inference from this generated queue alone.

## Current result

- Engineering packet generation: ready
- Structural preflight: pending CI validation
- Human approvals: **0 / 15**
- Canonical publication: **BLOCKED**
