# Russian Bauman V12.41 · Writing Bugfix Stable

## Mục tiêu
Vá lỗi runtime khiến tab Viết bị bug sau các lượt Canva UI.

## Nguyên nhân chính
Trong `core.js`, tab Viết gọi các helper mới nhưng chưa có định nghĩa đầy đủ:
- `handwritingPrintSample`
- `handwritingCursiveSample`
- `strokeMiniSvg`
- `handwritingVisualPanel`

Khi mở tab Viết, JS có thể dừng render vì `ReferenceError`.

## Đã sửa
1. Bổ sung đầy đủ các helper bị thiếu.
2. Giữ nguyên thiết kế Canva phương án 3, Flashcard lớn và Media Hub.
3. Giữ tab Viết theo hướng chữ viết tay là chính, chữ in chỉ để nhận mặt.
4. Kiểm tra JS/JSON/ZIP sau khi đóng gói.

## Kết quả
Tab Viết có thể render lại, popup mẫu chữ viết tay hoạt động, canvas luyện viết có mẫu mờ và hình nét.
