# Math Learning Application Rebuild — LƯỢT 17 Search + Resource Drawer Gate

## Result
**PASS — STATIC SOURCE GATE**

## Navigation cleanup
Study Library previously injected a sixth persistent navigation item.
That source injection has been retired.
Primary navigation remains exactly:
1. Tổng quan
2. Lộ trình
3. Học
4. Luyện tập
5. Ôn tập

## Resource Drawer
The existing Study Library overlay was refactored into the contextual Resource Drawer.
It includes:
- current-lesson Formula action when available;
- mapped lesson Simulation action when available;
- Notes;
- Review;
- bookmarks;
- notes;
- recent lessons.

Advanced resources no longer compete with the main learning path.

## Global search
Topbar search now opens Resource Drawer search instead of current-screen filtering.

Search groups:
- Bài học
- Khái niệm
- Công thức
- Bài tập
- Mô phỏng

Search results show academic context:
`Stage → Discipline/Module → Chapter → Lesson`

The index uses currently loaded authoritative theory data and stable source metadata. It does not invent missing companion records.

## Gate
- primary nav count remains 5: PASS
- sixth Study Library nav injection removed: PASS
- contextual Resource Drawer: PASS
- global grouped search: PASS
- hierarchy context in results: PASS
- search result opens owning lesson: PASS
- no second route engine: PASS

Full browser/CI syntax and journey verification remains part of later regression/release gates.
