# Báo cáo chuẩn hóa tên lộ trình và bài học
## Nguyên tắc sửa
- Giữ nguyên toàn bộ `id`, `stage`, `moduleId`, danh sách `lessons`, đường dẫn file và cấu trúc JSON/JS.
- Chỉ chuẩn hóa các trường hiển thị: tên môn, tên course, tên module, tên bài học và các mô tả văn bản liên quan.
- Không đổi logic khóa học, tiến độ, route, filter, dữ liệu bài tập hoặc mô phỏng.

## Tên môn sau chuẩn hóa
- `Tiếng Nga Bauman ИУ-5` → `Tiếng Nga học thuật, dự bị và chuyên ngành АСОИУ`
- `Toán thống kê & phân tích dữ liệu` → `Toán cho AI, dữ liệu đa chiều và chuỗi thời gian`
- `Lập trình, CSDL & kỹ nghệ phần mềm` → `Python, CSDL và kỹ nghệ phần mềm cho hệ thống AI`
- `Machine Learning & Neural Systems` → `Machine Learning, Neural Systems và đánh giá mô hình`
- `АСОИУ, robot tự hành & độ tin cậy` → `АСОИУ/ASOIU, hệ tự hành và độ tin cậy hệ thống`
- `Chuỗi thời gian, telemetry & cảm biến` → `Xử lý tín hiệu, chuỗi thời gian, telemetry và cảm biến`
- `Nghiên cứu, НИР & luận văn` → `Phương pháp nghiên cứu, НИР và luận văn ВКР`
- `Dự bị STANKIN & khoa học nền` → `Dự bị STANKIN, khoa học nền và kỹ năng học đại học Nga`

## Mẫu tên bài học mới
- `Khái niệm cốt lõi · [Tên module chuẩn]`
- `Bài tập và mô phỏng · [Tên module chuẩn]`
- `Ứng dụng Bauman, НИР/ВКР · [Tên module chuẩn]`

## Số lượng chuẩn hóa
- Tên module chuẩn hóa: 113
- Tên bài học chuẩn hóa/đồng bộ: 338
- File văn bản có thay đổi: 93

## Ghi chú an toàn logic
Nếu giao diện dùng `id` để lọc, mở bài, lưu tiến độ hoặc đồng bộ Main/Subject thì bản này không phá logic vì các định danh đó được giữ nguyên.
