# MAIN CANVA CONTRAST R4 · FINAL QA REPORT

## Mục tiêu
Khóa lại hệ tương phản nền/chữ cho Main sau khi đổi giao diện Canva-style. Mọi theme phải giữ cặp màu đủ nổi bật cho nội dung chính, nội dung phụ, nút, card, sidebar, modal và lịch học.

## Phạm vi sửa
- Thêm body class: `canva-contrast-r2 canva-contrast-r3 canva-contrast-r4`.
- Thêm hệ token trung tâm `--cc-*` cho 4 theme: `academic`, `paper`, `night`, `mint`.
- Ánh xạ token mới vào token cũ: `--bg`, `--surface`, `--surface2`, `--text`, `--muted`, `--primary`, `--primary2`, `--nav`, `--nav2`.
- Khóa tương phản cho:
  - Login / Auth card
  - Sidebar / nav active / nav hover
  - Topbar / appearance menu / profile menu
  - Dashboard / KPI / hero / action card
  - Lộ trình / môn học / lịch học / НИР
  - Modal / AI panel / study viewer / toast
  - Table / calendar / schedule slot / warning card

## Kiểm tra tương phản token
Các cặp nền/chữ chính đều đạt >= 4.5:1:

| Theme | Surface/Text | Surface/Muted | Primary/Text | Sidebar/Text | Modal/Text |
|---|---:|---:|---:|---:|---:|
| Sáng học thuật | 16.45 | 7.53 | 6.70 | 16.47 | 16.45 |
| Giấy ấm | 16.64 | 8.03 | 7.31 | 16.94 | 16.64 |
| Tối tập trung | 15.85 | 10.91 | 10.50 | 19.20 | 15.85 |
| Xanh dịu | 15.17 | 6.65 | 5.48 | 17.09 | 15.17 |

## QA kỹ thuật
- `assets/js/main.js`: OK
- `assets/js/planning-main.js`: OK
- `assets/js/data.js`: OK
- Toàn bộ JSON: OK
- ZIP nén và test giải nén: OK

## Ghi chú
Không thay đổi logic JS. Đây là lớp khóa màu cuối cùng, nằm cuối `main.css`, có scope `body.canva-contrast-r4` để ưu tiên thắng các lớp Canva V1/V2/V3/V4 cũ.
