# V12.64 Hotfix Learning Hero Contrast

## Lỗi đã sửa
- Header tab Học tập dùng nền trắng nhưng vẫn kế thừa `color:#fff` từ hero cũ.
- Các nút chế độ Lý thuyết / Bài tập / Nghe-Nói / Ôn tập / Kiểm tra bị trắng chữ trên nền sáng.

## Cách xử lý
- Ghi đè màu chữ của `.v1261-learn-final .learn-canva-hero` sang mực tối.
- Chip chuyển sang xanh nhạt.
- Nút chế độ chuyển sang trắng viền xanh nhạt, chữ xám đậm; nút active chữ đen rõ.
- Không đổi logic render, chỉ sửa lớp tương phản giao diện.
