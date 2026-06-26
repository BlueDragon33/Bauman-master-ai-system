# RUSSIAN V12.91 R2 - Speaking structure reset

## Scope
Lượt 2 / 5: gỡ cấu trúc cũ của phòng Nghe/Nói trong tab Học tập để chuẩn bị dựng phòng luyện mới chuẩn SGK.

## Changes
1. Thay `renderPractice()` cũ bằng khung sạch `v1291-speaking-reset`.
2. Giữ dữ liệu `speaking.json` nguyên trạng, không sửa hội thoại.
3. Giữ các hành động lõi: chọn vai, ẩn/hiện nghĩa, nghe mẫu, nghe chậm, câu trước, câu tiếp, mở bản đồ câu nói.
4. Tách khung mới thành 3 vùng rõ: header, toolbar, stage câu chính.
5. Gỡ hiệu ứng layout cũ chồng chéo bằng CSS scoped cho V12.91 R2.

## Files touched
- assets/core.js
- assets/core.css

## Integrity
- No data JSON changed.
- Speaking dataset remains intact.
