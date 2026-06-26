# Russian Survival Master V7.2 · Writing Framework Report

## Mục tiêu
Tinh chỉnh khung Tiếng Nga sau V7.1: bỏ tab Ngữ pháp riêng, đưa Luyện chữ vào tab Viết và tạo xưởng Viết phục vụ học tập, email, báo cáo, НИР/ВКР.

## Thay đổi chính
- Thanh tab chính còn 6 mục: Tổng quan, Học tập, Đối thoại, Viết, Video/Audio, Từ vựng.
- `grammar.json` vẫn giữ, nhưng hiển thị trong Học tập như ngữ pháp theo bài/kho tra cứu.
- `handwriting.json` vẫn giữ, nhưng hiển thị trong tab Viết như tầng luyện chữ & chính tả.
- Thêm `writing.json` với nhiệm vụ viết theo 7 nhóm: handwriting, sentence, paragraph, email, report, thesis, error-log.
- Thêm renderer `renderWriting()` trong `core.js`.
- Adapter cập nhật lên `Russian Bauman Survival Master V7.2 · Writing Integrated Framework`.

## Lý do thiết kế
Tiếng Nga để sống và học ở Bauman cần hai trục chủ lực: Đối thoại để nói, Viết để học thuật. Ngữ pháp đóng vai trò công cụ trong từng ngữ cảnh, không nên đứng như đảo cô lập.

## QA cần test bằng Live Server
1. Mở đủ 6 tab.
2. Tab Ngữ pháp và Luyện chữ không còn trên sidebar.
3. Học tập vẫn xem được ngữ pháp theo bài.
4. Đối thoại lọc nhóm/mức độ và mở modal.
5. Viết lọc nhiệm vụ, chọn nhiệm vụ, nhập textarea không nhấp nháy.
6. Video/Audio và Từ vựng vẫn chạy như V7.1.
