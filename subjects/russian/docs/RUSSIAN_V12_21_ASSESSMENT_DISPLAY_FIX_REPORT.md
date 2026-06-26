# RUSSIAN V12.21 · Assessment Display Fix

## Mục tiêu
Sửa lỗi bố cục Ôn tập/Kiểm tra bị khuyết: bảng flag có thanh cuộn ngang/trống dưới, vùng câu hỏi/đáp án bị cắt do shell học tập dùng `height:100vh` và `overflow:hidden`.

## Đã sửa
- Bỏ khóa chiều cao cố định của `assessment-focus-shell` và `learn-main` trong chế độ Ôn tập/Kiểm tra.
- Bảng flag không còn kéo giãn tạo vùng trống lớn; flag rail tự cao theo nội dung.
- Ôn tập: flag 20 câu/khung hiển thị đủ, không cuộn ngang.
- Kiểm tra: flag đề con hiển thị gọn, không bị khuyết.
- Câu hỏi và đáp án không bị ẩn dưới mép màn hình; vùng assessment cho phép trang cuộn tự nhiên khi nội dung dài.
- Panel kết quả kiểm tra được nén lại để không nuốt không gian câu hỏi.

## Kiểm tra kỹ thuật
- `core.js`: kiểm tra cú pháp bằng Node.
- `subject-manifest.js`: kiểm tra cú pháp bằng Node.
- `subject-manifest.json` và toàn bộ JSON dữ liệu: parse hợp lệ.
- ZIP integrity OK.
