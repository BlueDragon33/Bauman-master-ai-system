# Russian Learning Tab Deep Fix · V13.01

## Đã sửa

1. Khôi phục hằng số `REVIEW_PAGE_SIZE = 20` và `EXAM_PAGE_SIZE = 20`.
2. Sửa lỗi tab Học tập bị vỡ khi bấm Ôn tập/Kiểm tra do thiếu hằng số phân trang.
3. Thêm lớp bảo vệ trong `renderLearning()` để lỗi cục bộ không làm trắng toàn bộ tab học tập.
4. Giữ nguyên yêu cầu 20 câu/lượt và đáp án dạng list.
5. Không thay đổi nội dung JSON học liệu.

## Kiểm tra

- `node --check assets/core.js`: đạt.
- `node --check assets/subject-adapter.js`: đạt.
- `node --check subject-manifest.js`: đạt.
- Parse JSON trong `data/`: đạt.
- Render mô phỏng: Lý thuyết, Bài tập, Nghe/Nói, Ôn tập, Kiểm tra, Lưu trữ, Đối thoại đều chạy.

## Ghi chú

Cần kiểm tra lại bằng Live Server trên máy thật để xác nhận UX/UI nhìn đúng ở trình duyệt.
