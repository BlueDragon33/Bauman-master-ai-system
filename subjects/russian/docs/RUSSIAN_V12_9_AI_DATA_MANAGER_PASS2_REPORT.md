# RUSSIAN V12.9 · AI DATA MANAGER PASS 2

## Mục tiêu lượt 2
Khôi phục AI Mentor, làm nút Giao diện có chức năng thật, chuyển Lưu trữ thành Data Manager không phơi code dài.

## Đã sửa
1. AI Mentor
- Nút AI mở modal Mentor thay vì chỉ toast.
- AI nhận ngữ cảnh: giai đoạn, mục tiêu hôm nay, tab hiện tại, bài học, từ vựng, hội thoại, nhiệm vụ viết.
- Có quick actions: Giải thích bài, Giải thích từ, Tạo đóng vai, Gợi ý viết, Ôn hôm nay.
- Có vùng hỏi theo ngữ cảnh và vùng trả lời gọn.

2. Giao diện
- Nút Giao diện mở bảng điều khiển.
- Có lựa chọn theme: Sạch sáng, Ấm mắt, Tập trung.
- Có mật độ: Chuẩn, Gọn, Rộng.
- Lưu trạng thái vào localStorage.

3. Data Manager
- Không còn textarea JSON lớn ở màn hình chính.
- Preview giới hạn 20 mục, có nút xem thêm.
- Quản lý theo nguồn: curriculum, lessons, grammar, vocab, speaking, writing, tests, videos, knowledge-index...
- Có nút Nhập/Thay file, Thêm mục, Xuất nguồn, Khôi phục nguồn, Dán JSON mới.
- Vùng dán JSON mới để trống, không tự phơi dữ liệu lớn.

## Kiểm tra tĩnh
- core.js: cần chạy node --check sau khi patch.
- JSON data: cần parse lại toàn bộ.
- ZIP integrity: cần test sau đóng gói.
