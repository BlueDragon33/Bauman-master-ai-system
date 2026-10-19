# CONTENT-FIRST · nguồn audio có thể thẩm tra (19/10/2026)

**Phạm vi:** R02–R04 · chỉ ghi nhận đầu mối nguồn thực, chưa nhập tệp âm thanh và chưa phê duyệt RU03.

## Mẫu lời chào R02 — chỉ một từ, không phải toàn bộ câu nguồn

- **Mục tiêu:** `Здравствуйте.` trong phần mở đầu của `LW_ITEM_R02_INTRO`.
- **Nguồn A (Wikimedia Commons):** https://commons.wikimedia.org/wiki/File:Ru-%D0%B7%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5.ogg
- **Tác giả ghi trên trang:** 1640max; xuất xứ Forvo; trang Commons ghi giấy phép CC BY-SA 4.0 và có VRTS xác nhận quyền.
- **Nguồn B (Wikimedia Commons):** https://commons.wikimedia.org/wiki/File:CPIDL_Russian_-_Zdravstvujte.ogg
- **Tác giả ghi trên trang:** Timwi/Romanski; trang Commons mô tả đã được đưa vào public domain bởi người tạo.
- **Scope:** hai nguồn là clip cho **lời chào riêng lẻ**; **không** bao gồm `Меня зовут Нам. Я из Вьетнама.`. Không tự gán tệp cho toàn bộ `LW_ITEM_R02_INTRO`.
- **Trạng thái:** `SOURCE_DISCOVERED_LICENSE_PAGE_VISIBLE`, `AUDIO_QA_NOT_RUN`, `HUMAN_RU03_REQUIRED`.
- **Không copy/scrape/mirror** bất cứ file nào vào repo chỉ vì tìm thấy giấy phép trên trang mô tả. Khi muốn đóng gói offline: lấy từ trang nguồn gốc, kiểm chứng quyền & điều kiện ghi công/chia sẻ, ghi SHA-256 của bytes, kiểm tra codec/âm lượng/đầu-cuối, và chuyên gia tiếng Nga nghe thực tế (trọng âm, phụ âm mềm, nhịp/âm điệu). Chỉ khi đó mới xét ứng dụng clip vào một *đơn vị từ/cụm chính xác*.

## R02 / R03 / R04 — sáu câu đang phục vụ người học

`subjects/russian/engine/review/re61-r02-r04-source-review-handoff.mjs` trích trực tiếp sáu mục `LW_ITEM_R02_NAME`, `LW_ITEM_R02_INTRO`, `LW_ITEM_R03_REG`, `LW_ITEM_R03_DOCS`, `LW_ITEM_R04_METRO`, `LW_ITEM_R04_DOCTOR` từ owner `data/listen-write-lessons.json`, sinh fingerprint RE45 với ngữ cảnh chuẩn bị cho RU03 TEXT và AUDIO. Handoff sử dụng validator/hệ thống reviewer RE50 hiện có, **không** mở một quyền phê duyệt song song.

- Không có nguồn audio bất biến đầy đủ cho năm câu còn lại.
- **Tất cả sáu** vẫn `PENDING_EXTERNAL_RU03`; không có reviewer được tự điền, không có APPROVE, không có audio SHA tự tạo.
- Link tới nguồn từ điển/corpus hoặc giấy phép Commons không tự chứng minh một âm thanh tốt để dạy người mới bắt đầu.
- Không áp dụng clip chưa được duyệt cho runtime/offline shell hoặc RU04 mastery.

## Đường găng chất lượng

1. Giao sáu packet fingerprint cho chuyên gia HUMAN_RU03 đủ năng lực đánh giá ngữ cảnh, cách dùng từ, trọng âm và giọng chuẩn.
2. Thu âm hoặc lựa chọn tệp ghi âm có phép rõ ràng **đúng từng mục nguồn**, hash file thật và thẩm định chất lượng âm thanh.
3. Nghiệm thu riêng phát lại offline và thiết bị sau khi audio đã có bằng chứng; **không** lặp gate UI/Offline-First đã PASS nếu runtime không đổi.

**Kết luận:** nguồn tham khảo đã được phát hiện cho **một lời chào**, không được diễn giải thành sáu câu đã có audio đạt chuẩn.


## RE62 — kết quả kỹ thuật mới, fail-closed

- Manifest duy nhất: `engine/content/review/re62-audio-source-candidates.v1.json`. Trang Commons mô tả **11.875 bytes**, **SHA-1 nguồn** `6dc217b5eda1192da86824f449782a932d4e7c55`, Ogg Vorbis khoảng **1,007 giây**. Chưa được kiểm chứng bằng bytes thực. **SHA-1 này không phải SHA-256 của bản tải.**
- Công cụ read-only: `engine/review/re62-audio-candidate-preflight.mjs`. Khi có tệp gốc ở đường dẫn do môi trường QA cung cấp, kiểm SHA-1, byte-count và magic OggS, tính SHA-256 từ bytes thật, dùng `ffprobe` kiểm Ogg/Vorbis, duration, sample-rate, channels. Không có tệp hoặc sai một điều kiện thì fail-closed; không tạo output đánh lừa.
- `buildRe62AudioReviewAddendum()` nối **một** clip chỉ chứa `Здравствуйте` vào **một** trong sáu packet RE61, bằng source ID và fingerprint; năm packet kia không có nguồn âm. **6/6 audio nguyên câu còn thiếu**.
- Công cụ không tự tải tệp, không thay runtime, SW hay cache, không gắn âm mẫu vào câu dài, không tạo reviewer, không APPROVE, không merge/publish.
- Nghi vấn quyền: trang Commons vừa có dòng “recorded myself”, vừa có dòng “recorded by a friend of mine”; cần xác nhận chính xác quyền của người nói/ghi trước khi rehost. Tuyên bố public domain ở metadata không giải quyết hoàn toàn mâu thuẫn.
- Kết quả đánh giá trong phiên này: **source metadata VERIFIED_AS_PAGE_CONTENT; V8 logic simulated PASS; original audio bytes NOT_OBTAINED; ffprobe on original NOT_RUN; SHA-256 original UNKNOWN; RU03 HUMAN REVIEW BLOCKED**.
- Kiểm thử Node có sẵn `engine/tests/test-re62-audio-candidate-preflight.mjs`; Windows/local Chromium không được giả định PASS trên SHA mới. Bài kiểm thử kỹ thuật âm không đánh giá phát âm, trọng âm hay ngữ điệu.

Đường găng tiếp theo là lấy được **bytes bản ghi gốc** qua một môi trường có kết nối hợp lệ, qua cổng RE62 để có báo cáo SHA-256/codec thật, rồi chuyên gia kiểm định độc lập quyền sử dụng + chất lượng âm. Người học không phải người xác thực tiếng Nga.
