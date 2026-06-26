# Data Tree Plan Fix

## Mục tiêu
Sửa tab Lưu trữ/Dữ liệu để cây thư mục hiển thị đầy đủ cấu trúc dữ liệu mới đã lên kế hoạch, đặc biệt là ba nguồn mở rộng cho Đối thoại/Deep Speaking.

## Thay đổi chính
- Tách nhóm cây dữ liệu thành: Lõi môn học, Nghe/Nói cơ bản, Đối thoại & Deep Bauman, Từ vựng & media, Luyện viết, Đánh giá.
- Hiển thị số lượng theo kế hoạch cho nguồn lazy-load, ví dụ: Đối thoại Bauman A-Z 4.164 mục, Deep Speaking 1.140 unit, speaking-link-index 1.058 khóa nối.
- Bổ sung mô tả vai trò từng nguồn trong cây thư mục.
- Giữ nguyên chính sách lazy-load: không tải file lớn khi mở app.
- Không thay đổi logic Nghe/Nói cơ bản và không trộn Deep vào speaking.json.

## Kiểm tra
- `core.js`: passed
- `subject-adapter.js`: passed
- `subject-manifest.js`: passed
- `subject-manifest.json`: valid
