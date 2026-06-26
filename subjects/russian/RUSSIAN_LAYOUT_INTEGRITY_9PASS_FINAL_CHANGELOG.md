# Russian Bauman Layout Integrity 9-Pass FINAL

## Mục tiêu
Sửa các lỗi bố cục và logic sau đợt tích hợp Đối thoại Bauman A-Z + Deep Speaking: Bài tập bị vỡ layout, Kiểm tra cần mở khóa tạm để soi UI, Dữ liệu bị khuyết bảng trái, nội dung tràn/mất chữ, Đối thoại bị phá bố cục.

## Thay đổi chính
1. Dựng lại tab Bài tập bằng `exercise-nine-shell`, `exercise-nine-card`, giảm xung đột với các lớp cũ V12.xx.
2. Bật `EXAM_LAYOUT_TEST_UNLOCK=true` để tạm mở khóa Kiểm tra cho kiểm tra bố cục.
3. Chuẩn hóa Kiểm tra/Ôn tập thành một khung chính, answer-grid tự co, câu dài cuộn trong vùng chính.
4. Cải thiện Dữ liệu/Lưu trữ: cây trái hiển thị đủ nguồn, có scroll ổn định và thanh thao tác không bị mất.
5. Thêm chống tràn toàn hệ thống: `min-width:0`, `overflow-wrap:anywhere`, giới hạn chiều cao vùng câu hỏi/dữ liệu.
6. Khôi phục Đối thoại theo phong cách Nghe/Nói sau update: thẻ câu chính, thanh tiến độ, bản đồ câu, bộ lọc hội thoại.
7. Deep Speaking chuyển thành accordion gọn trong tab Đối thoại, không phá layout hội thoại chính.
8. Giữ nguyên lazy-load: không tải `dialogue-bauman-az`, `deep-speaking-bauman`, `speaking-link-index` ngay khi mở app.

## Kiểm tra
- `node --check` cho `core.js`, `subject-adapter.js`, `subject-manifest.js`: đạt.
- Parse toàn bộ JSON trong `data/`: đạt.
- Render mô phỏng bằng Node VM: Bài tập, Kiểm tra, Ôn tập, Dữ liệu lazy, Đối thoại full + Deep đều render được.

## Ghi chú thật
Bản này đã kiểm thử logic/render trong sandbox. Cần mở bằng Live Server trên máy thật để nhìn UI thực tế, đặc biệt sau khi tải các file lớn trong tab Đối thoại/Dữ liệu.
