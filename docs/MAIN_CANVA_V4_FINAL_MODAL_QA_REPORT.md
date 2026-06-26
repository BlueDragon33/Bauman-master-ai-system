# MAIN CANVA V4 · FINAL MODAL QA

## Phạm vi lượt cuối
- Làm lại modal/popup/panel phụ theo giao diện Canva-style.
- Đồng bộ các vùng: modal chung, AI panel, study viewer, profile menu, appearance menu, toast.
- Giữ nguyên logic JS/ID quan trọng để không phá PlanningBridge.

## Thay đổi chính
1. Thêm class `canva-main-v4` vào body.
2. Nâng `openModal()` sang cấu trúc `canva-dialog`, có header, eyebrow, body scroll riêng.
3. Thêm lớp Canva cho AI panel và study viewer.
4. Thêm CSS V4 cho:
   - modal backdrop glass/blur
   - dialog bo lớn
   - profile/appearance menu
   - toast
   - AI mentor panel
   - study viewer iframe shell
   - responsive mobile
   - night theme compatibility

## QA
- Kiểm tra cú pháp JS: main.js, planning-main.js, data.js.
- Kiểm tra HTML có đủ class canva-main-v1/v2/v3/v4.
- Kiểm tra CSS có đủ khối V1/V2/V3/V4.
- Không đổi ID các control chính.


## Lượt cuối bổ sung trong QA
- Phát hiện `research()` còn dính một đoạn render cũ nằm ngoài hàm, gây `SyntaxError: Unexpected identifier 'id'`.
- Đã xóa block render cũ bị sót.
- `node --check` sau sửa: OK cho `main.js`, `planning-main.js`, `data.js`.

## Kết quả cuối
- Main giữ đủ class: `canva-main-v1 canva-main-v2 canva-main-v3 canva-main-v4`.
- Report này là bản chốt cho file MAIN CANVA V4 FINAL.
