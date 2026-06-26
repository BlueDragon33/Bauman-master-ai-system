# V13.20 · Speaking/Dialog OK Fused

## Đã chỉnh
1. Nút **Đã nói ổn/Tôi nói ổn** không còn tạo cảm giác thành một dòng riêng tách khỏi bảng nội dung.
2. Nút được đặt như badge thao tác ngay trong mặt bảng, góc dưới phải, có nền gọn và bóng nhẹ.
3. Nội dung tiếng Nga và nghĩa tiếng Việt trong bảng được căn đều bằng `text-align: justify`, có `text-justify: inter-word` và `hyphens:auto`.
4. Phần chữ tự chừa lề phải trên desktop để không va vào nút, giữ bố cục sạch khi câu dài.
5. Responsive nhỏ vẫn giữ nút trong bảng, tránh tràn và không ảnh hưởng các nút nghe/ghi âm bên dưới.

## Không thay đổi
- Không đổi dữ liệu JSON.
- Không đổi logic nghe mẫu, nghe chậm, ghi âm, đánh dấu nói ổn, đổi vai, chuyển câu.
