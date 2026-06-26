# Russian Bauman V12.87 · Route Settings Compact

## Phạm vi sửa

1. Gom 4 nút trong modal Lịch hôm nay thành một nút `⚙ Cài đặt` đặt ở góc trên bên phải.
2. Các hành động cũ vẫn giữ nguyên trong menu: Chỉnh sửa, Xuất lịch, Reset, Học bù thêm.
3. Chuyển nhãn `Lịch hôm nay` xuống đầu vùng nội dung chính, ngay trước tiêu đề buổi học.
4. Không sửa dữ liệu JSON, không đụng logic học liệu.

## File đã sửa

- `assets/core.js`
- `assets/core.css`

## Kiểm tra

- `node --check assets/core.js`: OK
- CSS brace balance: OK
- JSON parse: OK
- ZIP test: OK
