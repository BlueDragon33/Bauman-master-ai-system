# RUSSIAN V12.82 · FINAL LEARNING INTEGRITY REPORT

## Mục tiêu
Sửa chậm theo 7 lượt / 21 bước, không vá chồng: kéo dãn khung tab chính, khóa toàn vẹn nội dung trong ba nút Lý thuyết, Bài tập, Nghe/Nói, sau đó kiểm tra kỹ thuật + dữ liệu + UX/UI trước khi đóng gói.

## Lượt 0 · Audit lạnh
1. Bung gói gốc, xác định dữ liệu lõi còn nguyên.
2. Khoanh vùng lỗi nằm ở CSS khung học tập và logic render Học tập.
3. Chốt không sửa tiếp trên bản vá hỏng, sửa từ bản gốc A1_Russian_Bauman_Elearning_VIP.zip.

## Lượt 1 · Phục hồi khung UX/UI
4. Thêm lớp CSS kéo sidebar và main theo 100svh/100dvh.
5. Không khóa overflow toàn app, chỉ cho vùng con tự cuộn.
6. Bảo toàn responsive: mobile <760px chuyển về block, desktop giữ sidebar full-height.

## Lượt 2 · Khóa bài học hiện tại
7. Thêm activeLessonContext() làm context trung tâm.
8. Bài học hiện tại được dùng chung cho Lý thuyết, Bài tập, Nghe/Nói.
9. Gỡ logic fallback âm thầm lấy kho chung trong Bài tập/Nghe-Nói.

## Lượt 3 · Làm sạch Lý thuyết
10. Lý thuyết lấy slide từ đúng bài đang chọn.
11. currentLesson() đồng bộ với activeLessonContext().
12. Ngữ pháp liên quan được lọc theo bài/giai đoạn thay vì rải bừa toàn bộ stage.

## Lượt 4 · Làm sạch Bài tập
13. getExercises() chỉ lấy bài tập có lessonId khớp bài hiện tại.
14. Gỡ hàm sinh đáp án/gợi ý mở rộng; render chỉ dùng answer và rubric gốc.
15. Chọn bài mới reset exerciseIndex để không giữ câu cũ.

## Lượt 5 · Làm sạch Nghe/Nói
16. Gắn lessonId trực tiếp cho 1220 hội thoại trong speaking.json.
17. getPracticeDialogues() chỉ lấy hội thoại đúng lessonId, rồi mới lọc group/difficulty/query.
18. Chọn bài mới reset dialogueId, dialogueLineIndex, group và difficulty về all.

## Lượt 6 · Kiểm thử cuối
19. JSON parse OK cho toàn bộ data/*.json và subject-manifest.json.
20. node --check OK cho assets/core.js, assets/subject-adapter.js, subject-manifest.js.
21. Kiểm tra toàn vẹn: 26 bài, 312 bài tập, 1220 hội thoại, 1320 câu kiểm tra, 8000 từ vựng; bài tập mồ côi 0; hội thoại mồ côi 0; mismatch stage 0; hội thoại thiếu lượt nói 0.

## Kết quả dữ liệu
- lessons.json: 26 bài.
- exercises.json: 312 bài, mỗi bài đúng 12 bài.
- speaking.json: 1220 hội thoại, mỗi hội thoại có lessonId hợp lệ.
- tests.json: 1320 câu.
- vocab.json: 8000 thẻ.
- speaking tối thiểu theo bài: 18 hội thoại.
- speaking tối đa theo bài: 90 hội thoại.

## Thay đổi chính
- assets/core.css: thêm lớp final safe frame stretch.
- assets/core.js: thêm context bài học, lọc lessonId cho Bài tập/Nghe-Nói, bỏ sinh đáp án bằng code.
- data/speaking.json: thêm lessonId, lessonTitle và lessonBinding cho toàn bộ hội thoại.
- subject-manifest.json/js và core version: nâng nhãn lên V12.82 Learning Integrity Final.

## Nguyên tắc sau sửa
Trong tab Học tập:
- Lý thuyết hiển thị bài đang chọn.
- Bài tập chỉ hiển thị exercise.lessonId == bài đang chọn.
- Nghe/Nói chỉ hiển thị speaking.lessonId == bài đang chọn.
- Không có dữ liệu thì báo trống, không tự kéo lẫn kho bài khác.
