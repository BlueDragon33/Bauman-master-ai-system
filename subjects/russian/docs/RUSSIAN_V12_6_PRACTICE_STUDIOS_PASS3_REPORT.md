# Russian Bauman Survival Master V12.6 · Practice Studios Pass 3

## Mục tiêu lượt 3

Lượt 3 xử lý các khoang thực hành, không động sâu vào lõi trình chiếu đã sửa ở V12.5:

1. Từ vựng: biến bảng Deck thành Desk nghĩa học thuật.
2. Đối thoại: chuyển từ nghe từng câu sang đóng vai hội thoại A/B.
3. Viết: thu gọn bố cục, giảm phình, giữ canvas và nhiệm vụ viết.
4. Video/Audio: dọn hướng dẫn thừa, làm trình phát và danh sách gọn hơn.

## File đã sửa

- `assets/core.js`
- `assets/core.css`
- `assets/subject-adapter.js`
- `subject-manifest.json`
- `subject-manifest.js`

## Thay đổi chính

### 1. Từ vựng · Desk nghĩa

- Đổi khu vực từ vựng thành layout `vocab-desk v126`.
- Flashcard vẫn giữ trọng tâm nghe/nhớ.
- Bổ sung Desk nghĩa cho thẻ đang chọn gồm:
  - Nghĩa mô tả.
  - English equivalent.
  - Dùng khi nào.
  - Ứng dụng ở đâu.
  - Tags.
- Bảng từ vựng mở rộng các cột:
  - Từ/cụm.
  - Nghĩa mô tả.
  - English.
  - Dùng khi.
  - Ứng dụng.
- Dữ liệu khai thác trực tiếp từ các trường sẵn có: `meaning_ru`, `vi`, `clue_en`, `example`, `voice_text`, `stage_title_vi`, `illustration_label_ru`, `tags`, `stage_method`.

### 2. Đối thoại · đóng vai học thật

- Thêm state:
  - `dialogueRole: 'all' | 'A' | 'B'`
  - `dialogueHideVi: boolean`
- Bổ sung nút:
  - Nghe.
  - Vai A.
  - Vai B.
  - Ẩn/hiện nghĩa.
  - Nghe cả đoạn.
- Bổ sung meta cho hội thoại:
  - Ngữ cảnh.
  - Mức.
  - Mục tiêu nói.
  - Từ khóa.
- Khi chọn vai A/B, phần câu của người học được che thành “Bạn tự nói trước…” để luyện phản xạ.
- Danh sách câu đánh dấu câu thuộc vai người học.
- Giữ các nút nghe từng câu, nghe chậm, câu trước/câu sau.

### 3. Viết · gọn hơn

- Đổi sang layout `writing-studio v126`.
- Header ngắn lại.
- Giảm chiều cao canvas thừa.
- Bỏ checklist cố định gây phình.
- Điều khiển bút gọn lại.
- Academic writing giữ nhiệm vụ viết, mẫu Nga và yêu cầu, nhưng giảm chiều cao không cần thiết.
- Bổ sung strip loại nhiệm vụ viết dựa trên mode/type có trong dữ liệu.

### 4. Video/Audio · sạch hướng dẫn thừa

- Đổi sang layout `media-studio v126`.
- Danh sách media chỉ giữ tiêu đề, loại nguồn và nút sửa.
- Không hiện mô tả dài trong tile.
- Nếu có iframe YouTube thì phát trực tiếp.
- Nếu chưa có iframe thì hiện nút mở nguồn trực tiếp, không đổ hướng dẫn dài.
- Thanh thông tin chỉ giữ tiêu đề, chip loại nguồn và nút thao tác.

## Kiểm tra đã chạy

- `node --check assets/core.js`: OK.
- `node --check assets/subject-adapter.js`: OK.
- `node --check assets/planning-bridge.js`: OK.
- `node --check subject-manifest.js`: OK.
- Parse toàn bộ JSON trong `data/`: OK.
- Cập nhật manifest JSON/JS sang V12.6: OK.

## Ghi chú kiểm thử thực tế

Cần mở bằng Live Server và kiểm nhanh các luồng:

1. Từ vựng → tìm từ → chọn dòng trong Desk → flashcard và Desk đổi theo.
2. Đối thoại → chọn hội thoại → Vai A/Vai B → Ẩn nghĩa → Nghe cả đoạn.
3. Viết → đổi Chữ Cyrillic/Học thuật → vẽ thử canvas → tải ảnh.
4. Video/Audio → List/Grid → chọn media → mở trực tiếp hoặc sửa nguồn.

## Trạng thái

Lượt 3 đã hoàn tất phần thực hành. Lượt 4 nên tập trung kiểm thử tổng thể: logic nút, responsive, localStorage, dữ liệu nhập/xuất và đóng gói bản cuối.
