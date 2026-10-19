# R01 — nguồn mẫu chữ in và chữ viết tay Cyrillic (candidate)

**Trạng thái:** `SOURCE_LINKS_DISCOVERED` · `HUMAN_RU03_GLYPH_REVIEW_REQUIRED` · `NOT_OFFLINE_PACKAGED` · `NOT_PUBLISHED`.

Ứng dụng có **33 mục** `RHW_AZ_01–33` (nghe chọn chữ, nghe tô, nghe viết) và `HW_AZ_01–33` cho luyện nét. Nhưng các giá trị `cursive` hiện thường là chuỗi ký tự, không chứng minh glyph thực tế khác chữ in. **Không tự xác nhận font nghiêng là chữ viết tay chuẩn.**

## Ứng viên mẫu thực ngoài repository

1. **Chữ in và chữ viết tay trên cùng bảng:** https://commons.wikimedia.org/wiki/File:Russian_alphabet.svg — Peter Fitzgerald, 2010; trang Commons ghi **public domain** do người tạo công bố. Tệp SVG công bố kích thước danh nghĩa 170 × 1196.
2. **Bảng Cyrillic viết tay:** https://commons.wikimedia.org/wiki/File:Russian_Cursive_Cyrillic.svg — birdy geimfyglið / Spacebirdy, 2008; trang Commons ghi **public domain** của tác giả. Tệp SVG 470 × 150.
3. **Ví dụ theo chữ riêng:** https://commons.wikimedia.org/wiki/File:01-Russian_alphabet-%D0%90_%D0%B0.svg — bảng А/а của cùng tác giả; trang Commons ghi public domain.

**Phạm vi bằng chứng:** chỉ khẳng định nội dung của trang mô tả, tác giả và tuyên bố giấy phép. Chưa tải bytes, chưa kiểm hash/code SVG, chưa kiểm tra nét từng chữ, chữ thường/capital, hướng nối và dấu `Ь/Ъ` với chuyên gia. Không đưa URL phụ thuộc mạng vào màn học offline. Không mở khóa `handwriting-glyph-authority`.

## Đường găng dùng học được

- Tải bản gốc khi được phép và kiểm SHA-256/metadata/kiểm tra SVG an toàn, đối chiếu từng chữ với 33 canonical IDs.
- Kiểm định chất lượng dáng chữ, đường nối, nét, bẫy nhầm in–viết tay bởi chuyên gia tiếng Nga/РКИ. Không suy ra tên chữ hoặc âm phát ra từ ảnh.
- Đóng gói ảnh đã kiểm định thành tệp cục bộ ở bộ offline, gắn source+license hash vào metadata và thêm một kiểm thử thiết bị thực cho nét chữ. **Chỉ lúc đó** mới công nhận mẫu chữ viết tay chuẩn.

Luyện 33 chữ mới trong `learning-flow.js` hiện chỉ kiểm tra *mặt chữ in* và gọi module viết hiện có; giọng TTS đọc *tên chữ* là `UNVERIFIED`, không phải audio phát âm chuẩn, `Ъ/Ь` được ghi rõ là dấu không có âm riêng.
