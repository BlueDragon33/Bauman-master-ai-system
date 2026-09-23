# Math Learning Application Rebuild — LƯỢT 14 Lesson Check + Completion Gate

## Result
**PASS — WITH SOURCE-COVERAGE NOTE**

## Implementation
Lesson Check is integrated into the canonical Lesson Player state owner.
It does not create a second progress engine.

Completion requires:
1. every source-backed lesson step to be visited;
2. every available Lesson Check item to be assessed;
3. a successful persistence write;
4. only then is `completedAt` stored and completion UI rendered.

If persistence fails, completion is not shown.

## Lesson Check source
- semantic QA blocks are preferred from the lesson source;
- existing `theory_assessment` sources for C01 L05/L06 are adapted when needed;
- no check question is invented.

Learner outcomes use:
- Đã đạt
- Cần ôn nhẹ
- Cần học lại N mục

No single numeric score is used as the mastery verdict.

## Propagation
Real lesson completion now feeds:
- lesson snapshot;
- chapter completion count;
- roadmap completion state;
- Home/Overview CTA and progress.

## Source coverage note
Current theory content has uneven check density. Some lessons have fewer than the target 3–6 source-backed items. The runtime does not duplicate or invent questions to satisfy a count.

## Regression fixed during gate
Progressive-reveal selectors incorrectly used the single-element helper `$()` with collection methods. They now use `$$()`.
