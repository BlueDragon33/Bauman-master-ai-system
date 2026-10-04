# PYTHON05 RESPONSIVE & ACCESSIBILITY MATRIX
Status: TESTABLE

| Surface/stress | Desktop | Tablet | Small mobile | Keyboard/nonvisual |
|---|---|---|---|---|
| Instructions + editor + results | 3 columns | 2 columns/results below | stacked | semantic headings/regions |
| Code editor | large pane | bounded pane | >=320px high | label, Tab=4 spaces, Ctrl/Cmd+Enter Run |
| stdin | inline below editor | same | full width | explicit label |
| Run/Test/Submit | row | wraps | large wrapped controls | native buttons |
| stdout/stderr | distinct streams | distinct | stacked | text, not canvas |
| Tests | structured rows | structured | stacked | pass/fail text + symbol |
| Hints | incremental | same | same | button + ordered list |
| Author tests | 3-column rows | reflow | single-column | labeled fields |
| Offline/conflict | banner | banner | banner | role=status/alert |

Representative acceptance viewports: 1440×900, 1024×768, 390×844. Page-level horizontal overflow is a failure.
