# V12.91 R1 · Stage Card Settings Fix

## Scope
- Fix only the current-stage card and the Settings placement.
- Do not touch learning data JSON.
- Do not redesign Speaking room in this round.

## Changes
1. Removed the visually floating Settings position from the card edge.
2. Moved Settings into the card header as a compact icon control.
3. Rebuilt the current-stage card into four clean zones:
   - header: current-stage label + settings icon
   - identity: stage name + description
   - actions: Vào học / Luyện nói / Luyện viết
   - review: ôn tập/remedial summary

## QA
- JS syntax: OK
- CSS brace balance: OK
- JSON parse: OK
