# Math Learning Application Rebuild — LƯỢT 5 Navigation Shell Gate

## Goal
Implement the learner-first IA frozen in LƯỢT 3.

## Primary navigation
The visible primary navigation now contains exactly:
1. Tổng quan
2. Lộ trình
3. Học
4. Luyện tập
5. Ôn tập

Advanced tools are not peer navigation:
- Mô phỏng
- Công thức
- Công cụ học
- Kho dữ liệu

They remain available through the command/context system.

## Roadmap route
`Lộ trình` is now a real rendered route that reads:
- `data/curriculum.json`
- `data/theory-framework.json`

It renders:
- stage selector;
- current stage goal;
- faculty/department context;
- chapter list;
- lesson count per chapter;
- CTA to enter the mapped E129 chapter.

The route does not duplicate academic content.

## Compatibility
Legacy E129 buttons remain in the DOM only for runtime compatibility and are hidden from the learner navigation.
Existing route aliases still work:
- theory → Học
- exercises/application/exam → Luyện tập
- review → Ôn tập

This prevents existing lesson-flow modules from breaking while the new shell becomes canonical.

## Accessibility
- active primary route uses `aria-current="page"`;
- roadmap stage/chapter controls are real buttons;
- the visible nav no longer requires resource-type understanding.

## Gate
- Exactly five visible primary items: PASS
- Advanced tools removed from primary nav: PASS
- Roadmap route implemented from real data: PASS
- E129 chapter handoff preserved: PASS
- Navigation JS syntax: PASS
- No academic data writes: PASS

## Result
**PASS**

Next: LƯỢT 6 must rebuild Home/Tổng quan around Continue Learning, Current Goal, Roadmap Position, compact Progress and Weak Points.
