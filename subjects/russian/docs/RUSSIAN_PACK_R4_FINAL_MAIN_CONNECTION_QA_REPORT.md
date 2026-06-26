# RUSSIAN PACK R4 · FINAL MAIN CONNECTION QA

## Mục tiêu
Đóng gói môn Tiếng Nga thành module tự chứa trong `subjects/russian/` để Main mở được bằng:

- `subjects/russian/index.html`
- `subjects/russian/editor.html`

## Đã hoàn tất

1. Thay gói Russian cũ trong Main bằng Russian V12.73 đã sửa giao diện/logic.
2. Giữ toàn bộ runtime trong `subjects/russian/`: HTML, CSS, JS, manifest, data, external-data, docs.
3. Chuẩn hóa manifest R4 với `package`, `paths`, `dataFiles`, `externalDataFiles`, `capabilities`, `routeMapping`, `bridge`, `qa`.
4. Chuẩn hóa adapter để xuất trạng thái môn cho Main qua `exportSubjectStatus()`.
5. Bridge gửi manifest và data source status cho Main.
6. Tab Dữ liệu nhận rõ nguồn lõi: `subjects/russian/data/` và nguồn mở rộng: `subjects/russian/external-data/`.

## Phiên bản

- Final package: `V12.75 RussianPack R4 Final Main Connection QA`
- Base Russian: `V12.73 Bonus Total QA Polish`
- Main base: `Main Route R4 Final Logic UI QA`

## QA tĩnh

- JS syntax: OK
- Manifest JSON/JS: OK
- JSON trong `subjects/russian/data/`: OK
- JSON trong `subjects/russian/external-data/`: OK
- Main pathMap/editorMap: OK
- Không phát hiện runtime path gọi ra ngoài `subjects/russian/` trong file lõi.
