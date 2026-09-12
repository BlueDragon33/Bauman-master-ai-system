# Russian Premium Reference UI · 2026-09-12

## Phạm vi
Redesign giao diện Web App Tiếng Nga theo ảnh tham chiếu dark premium Bauman/Russia. Không tạo ảnh mới, không thay learning engine, không thay dữ liệu học.

## RU-UI.1 · App Shell
- Sidebar trái dark navy/gold, logo/chữ hiệu được dựng bằng CSS và phần tử có sẵn, không phụ thuộc asset ảnh mới.
- Top search + page context + theme/AI/sync.
- Desktop chuyển sang bố cục 3 cột: sidebar / learning workspace / AI rail.

## RU-UI.2 · Dashboard
- Hero dùng lớp gradient/aurora tự chứa để tái hiện tinh thần ảnh tham chiếu mà không thêm ảnh minh họa vào repo.
- 8 lối tắt: Cyrillic, phát âm, từ vựng, ngữ pháp, giao tiếp, nghe hiểu, bài học, mind map.
- Thêm Tiếp tục học và Bài học tiếp theo, dùng routing hiện hữu.

## RU-UI.3 · AI Assistant
- AI rail dùng `data-ai-quick` và nút AI hiện hữu; không dựng AI engine thứ hai.
- Ô nhập nhanh chuyển câu hỏi sang AI Mentor hiện tại và dùng action `ai-run` của core.
- Card luyện phát âm đi thẳng sang Đối thoại.

## RU-UI.4 · Progress
- Đọc state từ `SUBJECT_ADAPTER.storageKey`.
- Hiển thị hoạt động ôn tập, câu đã làm, đề đạt, câu cần sửa, CEFR và lịch hôm nay.
- Không ghi số liệu minh họa cố định vào dữ liệu học.

## RU-UI.5 · Legacy tabs
- Học tập, Đối thoại, Viết, Video/Audio, Từ vựng, Ngữ pháp, Mind map, Lưu trữ được phủ theme mới qua CSS.
- `core.js`, `subject-adapter.js` và JSON học tập giữ nguyên.

## RU-UI.6 · Responsive + QA
- >= 1320px: 3 cột đầy đủ.
- 1080–1319px: 2 cột chính, giảm mật độ dashboard.
- <= 760px: sidebar thành điều hướng ngang, dashboard 1–2 cột.
- <= 480px: tối ưu nút, thẻ và nội dung tiếp tục học.
- Có validator `scripts/validate-reference-ui.mjs` và workflow `Russian Reference UI Gate`.

## File mới/chỉnh
- `subjects/russian/index.html`
- `subjects/russian/assets/russian-reference-ui.css`
- `subjects/russian/assets/russian-reference-ui.js`
- `subjects/russian/scripts/validate-reference-ui.mjs`
- `.github/workflows/russian-ui-reference-gate.yml`
- `subjects/russian/README.md`

## Nguyên tắc promotion
Chỉ merge `temp/russian-ui-reference-redesign` vào `main` sau khi gate CI PASS. Kiểm tra trực quan trên site thật vẫn là bước xác nhận cuối sau deploy/publish.
