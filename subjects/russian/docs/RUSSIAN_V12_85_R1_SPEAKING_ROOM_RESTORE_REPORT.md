# V12.85 R1 · Speaking Room Restore

## Scope
Lượt 1 chỉ xử lý tab Học tập → Nghe/Nói, không sửa dữ liệu JSON và chưa đóng gói bản cuối.

## Steps
1. So sánh trạng thái hiện tại: phòng luyện đầy đủ vẫn tồn tại ở view Đối thoại, nhưng tab Học tập → Nghe/Nói bị rút quá gọn.
2. Khôi phục cấu trúc phòng ôn luyện ngay trong tab Học tập: thêm chọn vai, tiến độ chung/tiến độ vai, nút ẩn/hiện nghĩa, nút mở phòng đầy đủ.
3. Sửa vùng Bản đồ câu nói để không khuyết nội dung: hiển thị đủ câu, cho cuộn nội bộ sạch, không cắt câu B/C/D.

## Files touched
- assets/core.js
- assets/core.css

## Checks
- node --check assets/core.js: OK
- data/*.json parse: OK
- lessons: 26
- speaking: 1220
- speaking_orphans: 0
- speaking_no_turns: 0
- CSS brace balance: OK
