/* E165C · Math Theory Slideshow · Compact Curated C01 Deck
 * E129 Reader remains the full lecture source.
 * E132 Slideshow is compact-only: no Full lecture mode, no Reader auto-slicing fallback.
 */
(function(){
  'use strict';
  var RELEASE='E165C_COMPACT_ONLY_C01_CURATED_DECK';
  var idx=0;
  var deck=null;
  var model=[];
  var currentLessonKey='';

  var CARD_LABEL={
    concept:'Khái niệm',formula:'Công thức',meaning:'Ý nghĩa',application:'Ứng dụng',warning:'Bẫy',question:'Câu hỏi',check:'Kiểm tra',decision:'Quyết định',lab:'Lab',practice:'Luyện tập',rubric:'Tiêu chí',bridge:'Cầu nối',takeaway:'Chốt nhớ',memory:'Mẹo nhớ',example:'Ví dụ',fix:'Cách sửa',useWhen:'Khi dùng',avoid:'Tránh'
  };

  var C01_DECKS={
    '§1.1 · Vector như dữ liệu kỹ thuật':[
      slide('Vector là hộp dữ liệu có trật tự',
        card('bridge','Vào bài','Từ hiện tượng thật sang vector','Thuật toán không nhìn robot, ảnh hay tín hiệu trực tiếp. Nó nhận các số đã được đặt vào đúng thứ tự và đúng ý nghĩa.'),
        card('concept','Định nghĩa','Vector là danh sách thành phần có quy ước','Mỗi chiều là một đại lượng đo hoặc đặc trưng. Đổi thứ tự, đổi đơn vị hoặc đổi ý nghĩa chiều là đổi dữ liệu.'),
        card('application','Kỹ thuật','Trạng thái hệ thống là vector','Robot có thể được mô tả bằng vị trí, vận tốc, góc quay; ảnh có thể thành vector pixel; tín hiệu có thể thành vector mẫu.')
      ),
      slide('Hai cách nhìn phải đi cùng nhau',
        card('meaning','Hình học','Vector có hướng, độ lớn và quan hệ góc','Cách nhìn hình học giúp hiểu khoảng cách, norm, phép chiếu và cosine.'),
        card('meaning','Dữ liệu','Vector là bản ghi đo lường','Cách nhìn dữ liệu giúp kiểm soát từng chiều, đơn vị, nhiễu và chuẩn hóa.'),
        card('formula','Ký hiệu','x = (x_1, x_2, ..., x_n)','x_i là giá trị đặc trưng thứ i; n là số chiều của không gian dữ liệu.')
      ),
      slide('Không vẽ được vẫn tính được',
        card('warning','Phá trực giác','Vector không chỉ là mũi tên 2D/3D','Ảnh 28×28 có 784 chiều; embedding văn bản có thể có hàng trăm chiều.'),
        card('formula','Phép toán','Cộng, nhân vô hướng, norm, dot product vẫn theo thành phần','Số chiều tăng không làm bản chất đại số thay đổi.'),
        card('check','Tự kiểm','Nếu không vẽ được vector 1000 chiều thì so sánh thế nào?','Dùng cosine, khoảng cách, phép chiếu hoặc tương quan thay cho mắt nhìn.')
      ),
      slide('Vector trạng thái',
        card('concept','State vector','Một thời điểm của hệ được đóng gói thành x','x có thể chứa vị trí, vận tốc, gia tốc, nhiệt độ, dòng điện hoặc trạng thái cảm biến.'),
        card('application','Điều khiển','Dự đoán bước tiếp theo','Mô hình điều khiển cần biết trạng thái hiện tại để tính điều khiển hoặc dự báo trạng thái sau.'),
        card('warning','Bẫy đơn vị','Trộn đơn vị làm metric bị lệch','Một chiều tính bằng mét và một chiều tính bằng milimét có thể phá khoảng cách nếu không chuẩn hóa.')
      ),
      slide('Vector đặc trưng trong AI',
        card('concept','Feature vector','Mẫu dữ liệu được biến thành vector đặc trưng','Mỗi chiều giữ một dấu hiệu mà mô hình có thể học.'),
        card('application','AI','Embedding, pixel, thống kê tín hiệu','Tất cả đều là cách đưa dữ liệu thật vào không gian vector.'),
        card('warning','Bẫy rác đặc trưng','Nhiều chiều không đồng nghĩa tốt hơn','Feature dư, nhiễu hoặc trùng lặp có thể làm mô hình học kém.')
      ),
      slide('So sánh vector',
        card('formula','Khoảng cách','d(x,y) đo độ xa giữa hai trạng thái','Khoảng cách phù hợp khi độ lớn tuyệt đối có ý nghĩa.'),
        card('formula','Cosine','cosθ = (x·y)/(||x|| ||y||)','Cosine phù hợp khi hướng quan trọng hơn độ lớn.'),
        card('decision','Chọn metric','Hỏi: cần so độ lớn hay so hướng?','Nếu quy mô quan trọng, dùng distance; nếu mẫu hình/hướng quan trọng, dùng cosine.')
      ),
      slide('Chuẩn hóa không phải trang trí',
        card('concept','Normalization','Đưa các chiều về thang đo hợp lý','Chuẩn hóa giúp chiều có đơn vị lớn không nuốt mất chiều còn lại.'),
        card('application','Dữ liệu cảm biến','Cảm biến khác thang đo cần xử lý trước','Nhiệt độ, vận tốc, áp suất không nên ném thẳng vào cùng metric khi chưa cân chỉnh.'),
        card('warning','Bẫy','Khoảng cách có thể phản ánh đơn vị thay vì bản chất','Metric sai khiến mô hình tối ưu nhầm mục tiêu.')
      ),
      slide('Vector và code',
        card('lab','Python/NumPy','Vector thường là array một chiều','Code phải giữ đúng shape, dtype, thứ tự chiều và quy ước đơn vị.'),
        card('warning','Shape bug','Hàng/cột sai có thể làm phép toán sai âm thầm','Vector dạng (n,), (n,1), (1,n) có hành vi khác nhau khi nhân ma trận.'),
        card('check','Tự kiểm','Trước khi tính, biết từng chiều là gì chưa?','Nếu chưa biết ý nghĩa từng chiều, kết quả toán chỉ là số vô hồn.')
      ),
      slide('Vector không tự có nghĩa',
        card('meaning','Ngữ cảnh','Ý nghĩa nằm ở mapping từ đời thật sang thành phần','Cùng một vector số có thể đại diện cho nhiều thứ nếu không có metadata.'),
        card('warning','Bẫy','Đẹp về toán nhưng sai về đo lường','Mô hình có thể đúng công thức nhưng sai vì đầu vào bị mã hóa kém.'),
        card('takeaway','Chốt','Vector = số + thứ tự + ý nghĩa chiều','Thiếu một trong ba thứ, dữ liệu mất khả năng giải thích.')
      ),
      slide('Mini case ảnh',
        card('example','Ảnh xám','Ảnh 28×28 → vector 784 chiều','Mỗi pixel là một thành phần; thứ tự pixel phải cố định.'),
        card('application','Học máy','Mô hình nhận vector thay vì ảnh nguyên nghĩa','Mạng học từ quan hệ giữa các chiều pixel hoặc đặc trưng sau khi trích xuất.'),
        card('warning','Bẫy','Hoán vị pixel phá cấu trúc','Cùng giá trị nhưng sai vị trí làm thông tin thị giác biến dạng.')
      ),
      slide('Mini case tín hiệu',
        card('example','Cửa sổ tín hiệu','Một đoạn âm thanh ngắn là vector mẫu','Mỗi chiều là biên độ tại một thời điểm lấy mẫu.'),
        card('application','Xử lý tín hiệu','So sánh, lọc, phân loại','Vector hóa giúp dùng đại số tuyến tính cho tín hiệu.'),
        card('warning','Bẫy thời gian','Lệch pha hoặc lệch cửa sổ làm so sánh khó','Không phải mọi khác biệt vector đều là khác biệt nội dung.')
      ),
      slide('Hỏi trước khi tính',
        card('question','Câu hỏi 1','Vector này biểu diễn đối tượng nào?','Không biết đối tượng thì không thể chọn phép đo phù hợp.'),
        card('question','Câu hỏi 2','Mỗi chiều có cùng đơn vị và thang đo không?','Nếu không, cần chuẩn hóa hoặc đổi metric.'),
        card('question','Câu hỏi 3','So sánh cần hướng, độ lớn hay cả hai?','Câu trả lời quyết định dùng cosine, norm hay distance.')
      ),
      slide('Lỗi thường gặp',
        card('warning','Lỗi 1','Xem vector như danh sách số vô danh','Không có ý nghĩa chiều thì không phân tích được lỗi.'),
        card('warning','Lỗi 2','Dùng Euclidean cho mọi bài toán','Không phải bài nào cũng cần đo độ xa tuyệt đối.'),
        card('warning','Lỗi 3','Quên chuẩn hóa','Chiều có scale lớn sẽ điều khiển kết quả.')
      ),
      slide('Kiểm tra nhanh',
        card('check','Câu hỏi','Hai vector cùng hướng nhưng độ lớn khác xa có thể rất giống nhau không?','Có, nếu bài toán quan tâm hướng/mẫu hình. Khi đó cosine có thể cao.'),
        card('hint','Gợi ý','Đừng nhìn riêng độ dài','Hỏi đại lượng cần so là pattern hay magnitude.'),
        card('answer','Kết luận','Metric phải phục vụ ý nghĩa kỹ thuật','Không có metric vạn năng.')
      ),
      slide('Cầu sang §1.2',
        card('bridge','Tiếp theo','Muốn so vector cần đo độ lớn và khoảng cách','Norm cho biết vector lớn bao nhiêu; distance cho biết hai vector xa nhau thế nào.'),
        card('memory','Nhớ','Vector là dữ liệu có hình học','Norm, distance, dot product là cách hỏi dữ liệu bằng ngôn ngữ hình học.'),
        card('takeaway','Chốt bài','Mã hóa tốt trước, tính toán sau','Dữ liệu vector sai thì công thức đúng cũng không cứu được mô hình.')
      )
    ],
    '§1.2 · Chuẩn vector và khoảng cách':[
      slide('Norm trả lời câu hỏi độ lớn',
        card('concept','Norm','Norm đo độ lớn của vector','Nó biến một vector nhiều chiều thành một số không âm để so sánh cường độ hoặc quy mô.'),
        card('formula','Euclidean','||x||_2 = sqrt(x_1^2 + ... + x_n^2)','Đây là độ dài hình học quen thuộc, mở rộng cho n chiều.'),
        card('application','Kỹ thuật','Độ lớn trạng thái hoặc sai số','Norm dùng để đo độ lệch, năng lượng, cường độ tín hiệu hoặc mức lỗi.')
      ),
      slide('Khoảng cách là norm của hiệu',
        card('formula','Distance','d(x,y) = ||x - y||','Muốn biết hai điểm xa nhau bao nhiêu, lấy vector chênh lệch rồi đo norm.'),
        card('meaning','Ý nghĩa','Khoảng cách đo độ khác biệt tổng hợp','Mỗi chiều đóng góp vào độ xa chung.'),
        card('warning','Bẫy','Scale lớn nuốt scale nhỏ','Một chiều có đơn vị lớn có thể thống trị distance.')
      ),
      slide('Không phải chỉ có một norm',
        card('formula','L1','||x||_1 = Σ |x_i|','Hợp với đo tổng độ lệch, thường bền hơn với vài giá trị lớn.'),
        card('formula','L2','||x||_2 = sqrt(Σ x_i^2)','Phạt mạnh sai số lớn, mượt và phổ biến trong tối ưu.'),
        card('formula','L∞','||x||_∞ = max |x_i|','Đo thành phần xấu nhất, hữu ích khi cần giới hạn biên.')
      ),
      slide('Chọn norm là chọn cách nhìn lỗi',
        card('decision','Lựa chọn','L1, L2, L∞ không thay thế tùy tiện','Mỗi norm nhấn mạnh một kiểu sai khác.'),
        card('useWhen','Dùng L2','Khi sai số lớn cần bị phạt mạnh','Phù hợp bình phương sai số, hình học Euclidean, tối ưu trơn.'),
        card('useWhen','Dùng L∞','Khi thành phần tệ nhất là quan trọng','Phù hợp ràng buộc an toàn hoặc sai số biên.')
      ),
      slide('Metric cần có luật',
        card('concept','Metric','Khoảng cách hợp lệ phải có cấu trúc','Không âm, bằng 0 khi trùng, đối xứng và thỏa bất đẳng thức tam giác.'),
        card('meaning','Tam giác','Đi đường vòng không thể ngắn hơn đường trực tiếp','Tính chất này giúp thuật toán tìm kiếm và phân cụm ổn định.'),
        card('warning','Bẫy','Hàm giống khoảng cách chưa chắc là metric','Đừng gọi mọi điểm số khác biệt là distance nếu chưa kiểm tính chất.')
      ),
      slide('Chuẩn hóa trước khi đo',
        card('concept','Scaling','Đưa chiều dữ liệu về thang đo hợp lý','Chuẩn hóa giúp distance phản ánh bản chất thay vì phản ánh đơn vị đo.'),
        card('application','AI','KNN, clustering, retrieval','Các thuật toán dựa trên distance rất nhạy với scale.'),
        card('warning','Bẫy','Dữ liệu chưa chuẩn hóa làm cụm bị méo','Mô hình có thể phân cụm theo đơn vị đo chứ không theo hiện tượng.')
      ),
      slide('Sai số là vector',
        card('concept','Error vector','e = x_hat - x','Sai số nhiều chiều không phải một con số cho đến khi chọn norm.'),
        card('formula','Loss','||e|| hoặc ||e||^2','Loss biến sai số thành mục tiêu tối ưu.'),
        card('application','Điều khiển','Đo lệch trạng thái','Robot lệch vị trí và vận tốc cần một thước đo tổng hợp để hiệu chỉnh.')
      ),
      slide('Năng lượng tín hiệu',
        card('meaning','Tín hiệu','Norm L2 liên hệ với năng lượng','Tổng bình phương mẫu phản ánh cường độ tổng thể của tín hiệu.'),
        card('application','Signal processing','Lọc nhiễu và so sánh mẫu','Norm giúp đánh giá mức nhiễu, mức sai khác hoặc độ mạnh tín hiệu.'),
        card('warning','Bẫy','Năng lượng lớn chưa chắc thông tin nhiều','Tín hiệu to có thể chỉ là nhiễu mạnh.')
      ),
      slide('Khoảng cách cao chiều có vấn đề',
        card('warning','Curse of dimensionality','Ở số chiều cao, khoảng cách có thể kém phân biệt','Nhiều điểm đều trở nên gần như xa nhau.'),
        card('fix','Cách xử lý','Chuẩn hóa, chọn metric, giảm chiều','PCA/SVD hoặc embedding tốt giúp distance có ý nghĩa hơn.'),
        card('bridge','Cầu nối','Cần góc và phép chiếu','Khi độ lớn gây nhiễu, hướng vector có thể quan trọng hơn.')
      ),
      slide('Bài toán chọn metric',
        card('question','Hỏi 1','Sai số lớn đơn lẻ có nguy hiểm không?','Nếu có, L2 hoặc L∞ đáng cân nhắc.'),
        card('question','Hỏi 2','Tổng sai lệch nhỏ lẻ có quan trọng không?','Nếu có, L1 có thể hợp hơn.'),
        card('decision','Kết luận','Metric là quyết định mô hình hóa','Chọn metric sai là đặt mục tiêu sai.')
      ),
      slide('Mini case robot',
        card('example','Trạng thái','x = [vị trí, vận tốc, góc]','Các chiều có đơn vị khác nhau nên cần cân trọng số hoặc chuẩn hóa.'),
        card('application','Điều khiển','Sai số trạng thái dùng để điều khiển','Controller cần biết lệch bao nhiêu để tạo tác động điều chỉnh.'),
        card('warning','Bẫy','Gộp thẳng mọi chiều có thể nguy hiểm','1 radian và 1 mét không nên luôn được xem như ngang nhau.')
      ),
      slide('Mini case retrieval',
        card('example','Embedding','Tìm mẫu gần nhất trong không gian vector','Khoảng cách hoặc cosine quyết định kết quả truy hồi.'),
        card('warning','Bẫy','Embedding chưa normalize làm độ lớn chen vào','Nếu hướng mới là ý nghĩa chính, nên cân nhắc cosine hoặc normalization.'),
        card('check','Tự kiểm','Hai vector cùng hướng khác độ dài nên gần hay xa?','Tùy bài toán: distance thấy xa, cosine thấy giống.')
      ),
      slide('Lỗi thường gặp',
        card('warning','Lỗi 1','Dùng L2 mặc định không suy nghĩ','L2 phổ biến nhưng không luôn đúng.'),
        card('warning','Lỗi 2','Quên chuẩn hóa đặc trưng','Scale phá distance rất nhanh.'),
        card('warning','Lỗi 3','Nhầm norm với từng thành phần','Norm là số tổng hợp, không thay thế phân tích từng chiều.')
      ),
      slide('Kiểm tra nhanh',
        card('check','Câu hỏi','Nếu nhân vector x với 10, hướng không đổi nhưng norm đổi thế nào?','Norm L2 tăng 10 lần.'),
        card('hint','Gợi ý','Norm chịu ảnh hưởng độ lớn','Cosine giữa x và 10x vẫn bằng 1 nếu x khác 0.'),
        card('answer','Kết luận','Norm đo magnitude, cosine đo hướng','Đừng trộn hai câu hỏi này.')
      ),
      slide('Cầu sang §1.3',
        card('bridge','Tiếp theo','Khoảng cách chưa đủ để hiểu quan hệ hướng','Dot product cho biết hai vector cùng hướng, vuông góc hay ngược hướng.'),
        card('memory','Nhớ','Distance = norm của khác biệt','Muốn so độ xa, dùng x-y; muốn so hướng, sang dot product.'),
        card('takeaway','Chốt bài','Chọn norm là chọn thước đo thực tế','Không có thước đo vô tội trong dữ liệu kỹ thuật.')
      )
    ],
    '§1.3 · Tích vô hướng, góc và phép chiếu':[
      slide('Dot product đo mức cùng hướng',
        card('concept','Dot product','Tích vô hướng gom quan hệ hai vector thành một số','Số này phản ánh cả độ dài và góc giữa hai vector.'),
        card('formula','Công thức','x · y = Σ x_i y_i','Nhân từng chiều tương ứng rồi cộng lại.'),
        card('meaning','Dấu','Dương: cùng hướng; 0: vuông góc; âm: ngược hướng','Đây là radar hướng của đại số tuyến tính.')
      ),
      slide('Góc nằm trong dot product',
        card('formula','Góc','x · y = ||x|| ||y|| cosθ','Dot product nối đại số thành hình học.'),
        card('meaning','Cosine','cosθ đo độ giống hướng','Không cần vẽ hình vẫn biết hai vector lệch hướng thế nào.'),
        card('warning','Điều kiện','Cần vector khác 0 để tính cosine','Vector 0 không có hướng xác định.')
      ),
      slide('Cosine similarity',
        card('formula','Cosine','cos_sim(x,y)= (x·y)/(||x|| ||y||)','Đưa độ giống hướng về khoảng quen thuộc từ -1 đến 1.'),
        card('application','AI','Search, embedding, recommendation','Khi độ lớn ít quan trọng, cosine thường hợp hơn distance.'),
        card('warning','Bẫy','Cosine bỏ qua magnitude','Hai vector cùng hướng nhưng độ lớn rất khác vẫn cosine cao.')
      ),
      slide('Vuông góc nghĩa là độc lập thông tin theo hướng',
        card('concept','Orthogonal','x · y = 0','Hai hướng không đóng góp vào nhau theo phép chiếu tuyến tính.'),
        card('meaning','Trực giác','Một vector không có bóng lên vector kia','Đây là nền cho cơ sở trực chuẩn, QR, PCA.'),
        card('application','Kỹ thuật','Tách thành phần tín hiệu','Vuông góc giúp phân rã dữ liệu thành các phần ít lẫn nhau.')
      ),
      slide('Phép chiếu',
        card('concept','Projection','Chiếu x lên hướng u để lấy phần của x theo hướng đó','Phần chiếu cho biết x chứa bao nhiêu thành phần dọc theo u.'),
        card('formula','Công thức','proj_u(x) = ((x·u)/(u·u)) u','Nếu u là unit vector thì proj_u(x) = (x·u)u.'),
        card('warning','Điều kiện','u không được là vector 0','Không thể chiếu lên hướng không tồn tại.')
      ),
      slide('Phần dư sau chiếu',
        card('formula','Residual','r = x - proj_u(x)','Phần dư là phần của x không giải thích được bằng hướng u.'),
        card('meaning','Ý nghĩa','Chiếu = giải thích; dư = chưa giải thích','Tư duy này đi thẳng đến least squares.'),
        card('application','Dữ liệu','Tách tín hiệu chính và nhiễu','Nếu hướng u là mẫu chính, residual chứa phần lệch hoặc nhiễu.')
      ),
      slide('Dot product là bộ lọc hướng',
        card('meaning','Filter','x·u lớn khi x có nhiều thành phần theo u','Dot product đo phản ứng của dữ liệu với một hướng/mẫu.'),
        card('application','Signal/template','So khớp mẫu','Mẫu càng cùng hướng với tín hiệu, dot product càng lớn.'),
        card('warning','Bẫy scale','Vector dài làm dot product lớn','Muốn so hướng công bằng, normalize trước.')
      ),
      slide('Từ chiếu đến least squares',
        card('bridge','Cầu nối','Xấp xỉ tốt nhất là chiếu lên không gian phù hợp','Least squares tìm vector trong không gian mô hình gần dữ liệu nhất.'),
        card('meaning','Hình học','Sai số tối ưu thường vuông góc với không gian mô hình','Đây là lõi trực giác của hồi quy tuyến tính.'),
        card('application','AI','Fit mô hình','Huấn luyện tuyến tính có thể hiểu bằng chiếu và residual.')
      ),
      slide('Cơ sở trực chuẩn',
        card('concept','Orthonormal','Các vector vừa vuông góc vừa có norm 1','Tọa độ trong cơ sở này rất sạch: hệ số là dot product.'),
        card('formula','Hệ số','c_i = x · q_i','Khi q_i trực chuẩn, chiếu lên từng hướng rất gọn.'),
        card('application','PCA/SVD','Tách dữ liệu theo hướng chính','Các hướng trực chuẩn giúp biểu diễn không chồng lấn.')
      ),
      slide('Mini case embedding search',
        card('example','Truy hồi','Câu hỏi và tài liệu thành embedding','Cosine đo mức cùng hướng về ngữ nghĩa.'),
        card('warning','Bẫy','Embedding dài hơn chưa chắc liên quan hơn','Độ dài có thể là artifact của mô hình.'),
        card('decision','Chọn','Normalize rồi dùng cosine khi so ý nghĩa','Phù hợp với nhiều hệ retrieval.')
      ),
      slide('Mini case cảm biến',
        card('example','Tín hiệu','Chiếu tín hiệu lên mẫu dao động','Hệ số chiếu cho biết tín hiệu chứa mẫu đó mạnh hay yếu.'),
        card('application','Lọc','Giữ thành phần mong muốn','Dùng projection để tách thành phần theo hướng đã biết.'),
        card('warning','Bẫy','Mẫu không chuẩn hóa làm hệ số khó so','Unit vector giúp hệ số có ý nghĩa rõ hơn.')
      ),
      slide('Lỗi thường gặp',
        card('warning','Lỗi 1','Nhầm dot product với cosine','Dot product bị ảnh hưởng bởi độ dài, cosine thì đã chuẩn hóa.'),
        card('warning','Lỗi 2','Chiếu lên vector 0','Không hợp lệ vì không có hướng.'),
        card('warning','Lỗi 3','Tưởng vuông góc nghĩa là không liên quan tuyệt đối','Nó là không liên quan theo cấu trúc tuyến tính đã chọn.')
      ),
      slide('Quy trình kiểm hướng',
        card('decision','Bước 1','Kiểm vector khác 0','Không có hướng thì không có cosine/projection.'),
        card('decision','Bước 2','Tính dot product','Dấu và độ lớn cho tín hiệu ban đầu.'),
        card('decision','Bước 3','Normalize nếu cần so hướng','Dùng cosine để loại ảnh hưởng độ dài.')
      ),
      slide('Kiểm tra nhanh',
        card('check','Câu hỏi','x·y = 0 thì hai vector có khoảng cách bằng 0 không?','Không. x·y=0 nói về vuông góc, không phải trùng nhau.'),
        card('hint','Gợi ý','Khoảng cách dùng x-y','Dot product hỏi quan hệ hướng.'),
        card('answer','Kết luận','Hai khái niệm khác nhau','Vuông góc không đồng nghĩa giống nhau.')
      ),
      slide('Cầu sang §1.4',
        card('bridge','Tiếp theo','Muốn biểu diễn vector cần hệ hướng chuẩn','Cơ sở cho ta bộ hướng để viết mọi vector bằng tọa độ.'),
        card('memory','Nhớ','Dot product hỏi: có bao nhiêu phần theo hướng kia?','Projection biến câu hỏi đó thành một vector cụ thể.'),
        card('takeaway','Chốt bài','Góc và chiếu là ngôn ngữ giải thích dữ liệu','Chúng biến so sánh vector thành phân tích thành phần.')
      )
    ],
    '§1.4 · Cơ sở, span và tọa độ':[
      slide('Vì sao cần cơ sở?',
        card('bridge','Vào bài','Muốn mô tả vector cần hệ quy chiếu','Cơ sở là bộ hướng dùng để viết mọi vector trong không gian.'),
        card('concept','Basis','Cơ sở vừa sinh được không gian vừa không thừa','Đủ để biểu diễn, gọn để không rối.'),
        card('application','Dữ liệu','Tọa độ là mã hóa theo cơ sở','Đổi cơ sở là đổi cách nhìn cùng một dữ liệu.')
      ),
      slide('Span là vùng có thể tạo ra',
        card('concept','Span','span(v1,...,vk) là tập mọi tổ hợp tuyến tính','Nó cho biết các vector sinh có thể tạo ra những điểm nào.'),
        card('formula','Tổ hợp','x = c1v1 + ... + ckvk','Các hệ số c_i là tọa độ theo bộ sinh nếu biểu diễn hợp lệ.'),
        card('meaning','Trực giác','Vector sinh là nguyên liệu; span là toàn bộ sản phẩm có thể lắp','Không có đủ hướng thì không sinh được toàn bộ không gian.')
      ),
      slide('Tọa độ phụ thuộc cơ sở',
        card('concept','Coordinate','Tọa độ là hệ số của vector trong một cơ sở','Cùng một vector có tọa độ khác nhau khi đổi cơ sở.'),
        card('warning','Bẫy','Đừng nhầm vector với tọa độ','Vector là đối tượng; tọa độ là cách ghi nó trong hệ đã chọn.'),
        card('application','Engineering','Đổi hệ tọa độ robot/camera','Cùng điểm vật lý có số tọa độ khác nhau trong các frame khác nhau.')
      ),
      slide('Bộ sinh có thể dư',
        card('warning','Dư thừa','Nhiều vector sinh chưa chắc tốt','Nếu có vector tạo được từ vector khác, biểu diễn có thể không duy nhất.'),
        card('meaning','Hậu quả','Một dữ liệu có nhiều mã tọa độ','Điều này làm phân tích và tối ưu dễ rối.'),
        card('bridge','Cầu nối','Cần độc lập tuyến tính','§1.6 sẽ xử lý câu hỏi vector nào bị thừa.')
      ),
      slide('Cơ sở chuẩn của Rn',
        card('example','Standard basis','e1=(1,0,...,0), e2=(0,1,...,0), ...','Mỗi vector chuẩn bật đúng một chiều.'),
        card('formula','Biểu diễn','x = x1e1 + x2e2 + ... + xnen','Tọa độ trùng với thành phần quen thuộc.'),
        card('meaning','Ý nghĩa','Đây là hệ quy chiếu mặc định','Nhưng không phải lúc nào cũng là hệ tốt nhất cho dữ liệu.')
      ),
      slide('Đổi cơ sở',
        card('concept','Change of basis','Đổi cơ sở là đổi hệ mô tả vector','Đối tượng không đổi, tọa độ đổi.'),
        card('application','Robot/camera','Chuyển giữa frame cảm biến và frame thế giới','Đây là thao tác sống còn trong điều khiển và thị giác máy.'),
        card('warning','Bẫy','Nhầm frame làm kết quả sai dù công thức đúng','Luôn ghi rõ tọa độ đang thuộc cơ sở nào.')
      ),
      slide('Cơ sở tốt làm dữ liệu đơn giản hơn',
        card('meaning','Tư duy','Chọn cơ sở hợp lý có thể làm cấu trúc lộ ra','Dữ liệu phức tạp trong hệ này có thể gọn trong hệ khác.'),
        card('application','PCA','Hướng chính của dữ liệu là một cơ sở mới','PCA chọn hướng có phương sai lớn để biểu diễn hiệu quả.'),
        card('takeaway','Chốt nhỏ','Không chỉ tính vector, hãy chọn hệ nhìn vector','Cơ sở là ống kính toán học.')
      ),
      slide('Biểu diễn duy nhất',
        card('concept','Uniqueness','Trong một cơ sở, mỗi vector có đúng một bộ tọa độ','Điều này cần bộ vector độc lập và sinh đủ không gian.'),
        card('warning','Bẫy','Bộ sinh dư làm mất duy nhất','Một vector có thể có nhiều cách ghép.'),
        card('check','Tự kiểm','Nếu tọa độ không duy nhất, bộ vector có phải cơ sở không?','Không, vì cơ sở không được thừa.')
      ),
      slide('Span trong R2',
        card('example','Một vector khác 0','Sinh ra một đường thẳng qua gốc','Tất cả bội số của vector đó nằm trên cùng hướng.'),
        card('example','Hai vector không cùng phương','Sinh ra toàn bộ R2','Có đủ hai hướng độc lập.'),
        card('warning','Hai vector cùng phương','Vẫn chỉ sinh một đường','Số vector là 2 nhưng số hướng thật chỉ là 1.')
      ),
      slide('Span trong R3',
        card('example','Một hướng','Đường qua gốc','Chỉ mô tả được một chiều biến thiên.'),
        card('example','Hai hướng độc lập','Mặt phẳng qua gốc','Mô tả được hai chiều biến thiên.'),
        card('example','Ba hướng độc lập','Toàn bộ R3','Mô tả được mọi vector 3D.')
      ),
      slide('Tọa độ như mã nén',
        card('application','Compression','Nếu dữ liệu nằm trong span nhỏ, chỉ cần vài hệ số','Thay vì lưu vector lớn, lưu tọa độ theo hướng sinh.'),
        card('meaning','Ý nghĩa','Tọa độ là phần điều khiển cách ghép vector','Các vector cơ sở là thư viện mẫu.'),
        card('warning','Bẫy','Cơ sở xấu làm mã dài hoặc khó hiểu','Chọn basis kém khiến cấu trúc dữ liệu bị che.')
      ),
      slide('Khi nào một bộ là cơ sở?',
        card('decision','Bước 1','Kiểm sinh được không gian cần xét','Span phải phủ đúng không gian.'),
        card('decision','Bước 2','Kiểm không thừa','Không vector nào tạo được từ các vector còn lại.'),
        card('decision','Kết luận','Đủ + không thừa = cơ sở','Thiếu một trong hai thì không phải basis.')
      ),
      slide('Lỗi thường gặp',
        card('warning','Lỗi 1','Đếm số vector mà quên hướng độc lập','Nhiều vector cùng phương vẫn nghèo thông tin.'),
        card('warning','Lỗi 2','Nhầm span với basis','Span là tập tạo ra; basis là bộ tạo ra một cách gọn và duy nhất.'),
        card('warning','Lỗi 3','Quên cơ sở khi đọc tọa độ','Tọa độ không có cơ sở là địa chỉ không có bản đồ.')
      ),
      slide('Mini check',
        card('check','Câu hỏi','Hai vector (1,0) và (2,0) có là cơ sở của R2 không?','Không.'),
        card('hint','Gợi ý','Chúng cùng phương','Span chỉ là trục x, không phủ R2.'),
        card('answer','Kết luận','Cần hai hướng độc lập để làm cơ sở R2','Số lượng đúng chưa đủ, hướng phải đúng.')
      ),
      slide('Cầu sang §1.5',
        card('bridge','Tiếp theo','Span tạo ra không gian con','Khi một vùng được sinh bởi các vector, ta cần biết nó có phải subspace và dữ liệu nằm trong đó thế nào.'),
        card('memory','Nhớ','Basis = span đủ + độc lập','Tọa độ là hệ số theo cơ sở.'),
        card('takeaway','Chốt bài','Cơ sở là cách tổ chức không gian để dữ liệu có tọa độ rõ ràng','Chọn cơ sở tốt là nửa trận đánh.')
      )
    ],
    '§1.5 · Không gian con và biểu diễn dữ liệu':[
      slide('Dữ liệu thường sống trong vùng có cấu trúc',
        card('bridge','Vào bài','Không gian con là sân chơi hợp lệ của vector','Nhiều dữ liệu kỹ thuật không phân bố lung tung mà gần một đường, mặt phẳng hoặc vùng tuyến tính.'),
        card('concept','Subspace','Không gian con là tập con vẫn giữ luật vector','Nó chứa vector 0 và đóng dưới cộng, nhân vô hướng.'),
        card('application','AI/kỹ thuật','Feature space, tín hiệu, PCA','Tư duy subspace nằm dưới nén dữ liệu, lọc nhiễu và giảm chiều.')
      ),
      slide('Ba điều kiện kiểm tra',
        card('decision','Bước 1','Có vector 0 không?','Không có 0 thì loại ngay.'),
        card('decision','Bước 2','Cộng hai vector trong tập có còn trong tập không?','Nếu thoát ra ngoài, tập không đóng dưới cộng.'),
        card('decision','Bước 3','Nhân vô hướng có còn trong tập không?','Nếu kéo dài/đảo hướng mà rơi ra ngoài, không phải subspace.')
      ),
      slide('Vì sao phải chứa 0?',
        card('meaning','Gốc','Không gian con phải đi qua gốc','Vì nhân vector bất kỳ với 0 phải ra vector 0 và vẫn nằm trong tập.'),
        card('warning','Bẫy','Đường thẳng lệch khỏi gốc không phải subspace','Nhìn giống đường nhưng thiếu vector 0.'),
        card('check','Tự kiểm','Mặt phẳng ax+by+cz=d với d≠0 có phải subspace không?','Không, vì thường không đi qua gốc.')
      ),
      slide('Span luôn tạo subspace',
        card('concept','Span','Span của một tập vector là mọi tổ hợp tuyến tính của chúng','Tập này tự nhiên đóng dưới cộng và nhân vô hướng.'),
        card('formula','Dạng','span(v1,...,vk) = {c1v1 + ... + ckvk}','Các hệ số c_i chạy qua mọi số thực.'),
        card('meaning','Ý nghĩa','Vector sinh tạo ra vùng hợp lệ','Subspace có thể được mô tả bằng bộ sinh.')
      ),
      slide('Biểu diễn dữ liệu bằng tổ hợp tuyến tính',
        card('formula','Biểu diễn','x = c1v1 + c2v2 + ... + ckvk','Dữ liệu x được lắp từ các vector mẫu/hướng cơ sở.'),
        card('meaning','Hệ số','c_i cho biết mức đóng góp của từng hướng','Đây là tọa độ hoặc mã biểu diễn của dữ liệu.'),
        card('application','Nén','Nếu k nhỏ hơn n, biểu diễn có thể gọn hơn dữ liệu gốc','Ý tưởng này mở đường cho giảm chiều.')
      ),
      slide('Vector sinh tốt và vector sinh dư',
        card('concept','Generator','Vector sinh là nguyên liệu tạo subspace','Chúng quyết định vùng dữ liệu có thể biểu diễn.'),
        card('warning','Dư thừa','Vector sinh dư làm biểu diễn nặng','Có thể nhiều vector nhưng hướng thật sự ít.'),
        card('useWhen','Dùng','Chọn bộ sinh khi cần mô tả vùng dữ liệu hợp lệ','Sau đó kiểm độc lập để tinh gọn.')
      ),
      slide('Ví dụ trong R2',
        card('example','Đường qua gốc','{t(1,2)} là subspace','Có 0, cộng hai điểm vẫn trên đường, nhân vô hướng vẫn trên đường.'),
        card('warning','Đường lệch','{(1,0)+t(1,2)} không phải subspace','Không chứa vector 0 và bị dịch khỏi gốc.'),
        card('check','Tự kiểm','Nhìn đường phải hỏi: có đi qua gốc không?','Đây là bộ lọc nhanh nhất.')
      ),
      slide('Ví dụ trong R3',
        card('example','Mặt phẳng qua gốc','ax+by+cz=0 là subspace','Nó là tập nghiệm của phương trình tuyến tính thuần nhất.'),
        card('warning','Mặt phẳng lệch','ax+by+cz=d, d≠0 không phải subspace','Vế phải khác 0 làm tập nghiệm bị dịch khỏi gốc.'),
        card('meaning','Từ khóa','Thuần nhất thường giữ gốc','Không thuần nhất thường mất subspace.')
      ),
      slide('Dữ liệu thật thường chỉ gần subspace',
        card('warning','Thực tế','Dữ liệu hiếm khi nằm hoàn hảo trong subspace','Nhiễu đo, sai số và biến động phụ làm điểm lệch khỏi vùng lý tưởng.'),
        card('meaning','Mô hình hóa','Ta tìm subspace giải thích phần chính','Phần lệch còn lại có thể là nhiễu hoặc thông tin phụ.'),
        card('fix','Cách xử lý','Xấp xỉ bằng subspace tốt nhất','PCA/SVD là công cụ sau này để làm việc này.')
      ),
      slide('Subspace và giảm chiều',
        card('application','Dimensionality reduction','Dữ liệu n chiều có thể nằm gần k chiều','Nếu k nhỏ, ta giữ cấu trúc chính bằng ít hệ số hơn.'),
        card('bridge','PCA/SVD','Tìm không gian con giữ nhiều thông tin','Đây là lõi của nén ảnh, lọc nhiễu và feature extraction.'),
        card('warning','Bẫy','Giảm chiều quá mạnh làm mất thông tin','Không phải mọi phần lệch đều là nhiễu.')
      ),
      slide('Tập nghiệm hệ tuyến tính',
        card('concept','Null space','Tập nghiệm Ax=0 là subspace','Vì hệ thuần nhất luôn chứa x=0 và đóng dưới tổ hợp tuyến tính.'),
        card('application','Kỹ thuật','Các trạng thái không làm đổi đầu ra','Null space mô tả hướng biến đổi bị hệ không quan sát được.'),
        card('warning','Bẫy','Ax=b với b≠0 thường không phải subspace','Đó là tập affine, không phải không gian con.')
      ),
      slide('Khi nào dùng tư duy subspace?',
        card('useWhen','Dùng khi','Cần nén, lọc, tìm cấu trúc ẩn','Subspace giúp tách phần chính khỏi phần rối.'),
        card('useWhen','Dùng khi','Nhiều feature nhưng thông tin thật ít chiều','Hạng thấp hoặc gần hạng thấp là tín hiệu có cấu trúc.'),
        card('avoid','Tránh','Ép mọi dữ liệu vào tuyến tính','Có dữ liệu cần mô hình phi tuyến hoặc manifold.')
      ),
      slide('Lỗi thường gặp',
        card('warning','Lỗi 1','Thấy đường/mặt phẳng là gọi subspace','Phải kiểm đi qua gốc và đóng phép toán.'),
        card('warning','Lỗi 2','Nhầm span với một vector','Span là cả tập mọi tổ hợp, không phải riêng vector sinh.'),
        card('warning','Lỗi 3','Quên dữ liệu thật có nhiễu','Gần subspace khác với nằm đúng trong subspace.')
      ),
      slide('Quy trình quyết định',
        card('decision','Bước 1','Kiểm vector 0','Fail thì không phải subspace.'),
        card('decision','Bước 2','Kiểm đóng dưới cộng','Lấy u,v trong tập, xem u+v còn trong tập không.'),
        card('decision','Bước 3','Kiểm đóng dưới nhân vô hướng','Lấy c bất kỳ, xem cu còn trong tập không.')
      ),
      slide('Mini check',
        card('check','Câu hỏi','Tập nghiệm Ax=0 có phải subspace không?','Có.'),
        card('hint','Gợi ý','Tuyến tính thuần nhất giữ 0 và tổ hợp tuyến tính','Nếu Au=0 và Av=0 thì A(u+v)=0, A(cu)=0.'),
        card('answer','Kết luận','Null space là subspace','Đây là ví dụ quan trọng nhất trong đại số tuyến tính ứng dụng.')
      ),
      slide('Cầu sang §1.6',
        card('bridge','Tiếp theo','Subspace có thể có bộ sinh dư','Ta cần biết số hướng độc lập thật sự.'),
        card('memory','Nhớ','Subspace = chứa 0 + đóng cộng + đóng nhân vô hướng','Span luôn là subspace.'),
        card('takeaway','Chốt bài','Biểu diễn dữ liệu là đưa dữ liệu vào vùng tuyến tính có cấu trúc','Subspace là khung để hiểu giảm chiều và hạng.')
      )
    ],
    '§1.6 · Độc lập tuyến tính, chiều và hạng dữ liệu':[
      slide('Vector nào thật sự cần?',
        card('bridge','Vào bài','Span cho biết tạo được vùng nào; độc lập cho biết có thừa không','Bộ sinh dư làm biểu diễn nặng và mất rõ ràng.'),
        card('concept','Độc lập tuyến tính','Không vector nào bị tạo lại từ các vector còn lại','Mỗi vector mang một hướng thông tin mới.'),
        card('application','Dữ liệu','Feature dư làm mô hình cồng kềnh','Nhiều cột dữ liệu có thể chỉ lặp lại cùng một thông tin.')
      ),
      slide('Định nghĩa bằng phương trình 0',
        card('formula','Kiểm độc lập','c1v1 + c2v2 + ... + ckvk = 0','Nếu chỉ có nghiệm c1=...=ck=0 thì nhóm độc lập tuyến tính.'),
        card('meaning','Ý nghĩa','Không thể triệt tiêu nhau bằng hệ số không tầm thường','Không vector nào là hàng giả trong đội hình.'),
        card('warning','Bẫy','Có nghiệm không tầm thường là phụ thuộc','Khi đó ít nhất một vector bị tạo từ các vector còn lại.')
      ),
      slide('Phụ thuộc tuyến tính',
        card('concept','Dependent','Có vector dư trong nhóm','Một hướng thông tin đã được các vector khác sinh ra.'),
        card('example','Ví dụ','v2 = 2v1 thì v1, v2 phụ thuộc','Hai vector cùng phương chỉ có một hướng thật sự.'),
        card('warning','Hậu quả','Biểu diễn có thể không duy nhất','Dư vector làm tọa độ rối và tính toán kém ổn định.')
      ),
      slide('Trực giác trong R2',
        card('example','Hai vector cùng phương','Phụ thuộc tuyến tính','Chúng chỉ sinh một đường qua gốc.'),
        card('example','Hai vector không cùng phương','Độc lập tuyến tính','Chúng sinh toàn bộ mặt phẳng R2.'),
        card('check','Tự kiểm','Hỏi: vector thứ hai có đem hướng mới không?','Nếu không, nó là dư.')
      ),
      slide('Trực giác trong R3',
        card('example','Ba vector cùng mặt phẳng qua gốc','Phụ thuộc trong R3','Chúng chỉ sinh một mặt phẳng, chưa phủ toàn bộ không gian.'),
        card('example','Ba hướng không đồng phẳng','Độc lập','Có thể sinh toàn bộ R3.'),
        card('warning','Bẫy','Ba vector không tự động là cơ sở R3','Phải kiểm hướng thật sự.')
      ),
      slide('Cơ sở là vừa đủ',
        card('concept','Basis','Cơ sở = sinh được không gian + độc lập tuyến tính','Đủ để phủ, không thừa để rối.'),
        card('meaning','Thiếu','Không biểu diễn được mọi vector cần xét','Span quá nhỏ.'),
        card('meaning','Thừa','Biểu diễn mất gọn hoặc không duy nhất','Bộ sinh có phụ thuộc tuyến tính.')
      ),
      slide('Tọa độ đẹp cần cơ sở không thừa',
        card('bridge','Nối §1.4','Tọa độ là hệ số theo cơ sở','Nếu bộ vector không độc lập, cùng một vector có thể có nhiều bộ hệ số.'),
        card('warning','Bẫy','Nhiều cách biểu diễn làm mô hình khó giải thích','Feature dư làm hệ số không ổn định.'),
        card('application','AI','Collinearity trong dữ liệu','Các feature gần phụ thuộc khiến hồi quy và tối ưu nhạy nhiễu.')
      ),
      slide('Chiều là số hướng độc lập',
        card('concept','Dimension','Chiều của subspace là số vector trong một cơ sở','Nó đo số bậc tự do thật sự.'),
        card('meaning','Không phải số vector đang có','Có 100 vector nhưng chỉ 3 hướng độc lập thì chiều vẫn là 3.'),
        card('memory','Nhớ','Dim = số hướng mới không thừa','Đếm thông tin, không đếm đồ vật.')
      ),
      slide('Hạng là số chiều thông tin',
        card('concept','Rank','Hạng ma trận là số hàng/cột độc lập tuyến tính','Trong dữ liệu, rank cho biết số hướng biến thiên thật.'),
        card('formula','Ý tưởng','rank(A) = số pivot sau khử Gauss','Pivot là dấu vết của hướng độc lập.'),
        card('application','Dữ liệu','Rank thấp nghĩa là dữ liệu có cấu trúc','Đây là lõi của nén, PCA và SVD.')
      ),
      slide('Rank thấp không phải xấu',
        card('meaning','Cấu trúc','Rank thấp có thể là tín hiệu dữ liệu có quy luật','Không phải mọi chiều đều mang thông tin mới.'),
        card('application','Nén ảnh','Ảnh có thể xấp xỉ bằng ma trận hạng thấp','Giữ hướng chính, bỏ chi tiết ít quan trọng.'),
        card('warning','Bẫy','Rank thấp do lỗi đo cũng có thể nguy hiểm','Cần phân biệt cấu trúc thật và dữ liệu nghèo.')
      ),
      slide('Gần phụ thuộc tuyến tính',
        card('warning','Thực tế','Dữ liệu thật thường gần phụ thuộc, không phụ thuộc hoàn hảo','Các feature đo gần cùng một hiện tượng tạo ra collinearity.'),
        card('meaning','Hậu quả','Bài toán số trở nên nhạy','Nhiễu nhỏ có thể làm hệ số thay đổi lớn.'),
        card('fix','Cách xử lý','Chuẩn hóa, chọn feature, PCA/SVD hoặc regularization','Mục tiêu là giảm dư thừa và tăng ổn định.')
      ),
      slide('Dữ liệu cảm biến',
        card('lab','Case','Nhiều cảm biến đo gần cùng đại lượng','Các cột dữ liệu có thể gần phụ thuộc.'),
        card('application','Feature engineering','Loại hoặc gộp feature dư','Giúp mô hình nhẹ hơn và dễ giải thích hơn.'),
        card('warning','Bẫy','Cảm biến nhiều chưa chắc thông tin nhiều','Nhiều kênh giống nhau chỉ làm hệ phình ra.')
      ),
      slide('Cách kiểm nhanh',
        card('decision','Bước 1','Đặt vector thành cột của ma trận A','Mỗi vector là một cột để kiểm độc lập.'),
        card('decision','Bước 2','Khử Gauss và đếm pivot','Pivot cho biết số hướng độc lập.'),
        card('decision','Bước 3','So pivot với số vector','Pivot bằng số vector thì độc lập; ít hơn thì phụ thuộc.')
      ),
      slide('Lỗi thường gặp',
        card('warning','Lỗi 1','Đếm số vector thay vì số hướng độc lập','Số lượng không thay thế chất lượng hướng.'),
        card('warning','Lỗi 2','Tưởng nhiều feature luôn tốt','Feature dư làm mô hình chậm, nhiễu và khó giải thích.'),
        card('warning','Lỗi 3','Nhầm rank với kích thước ma trận','Ma trận lớn vẫn có thể rank thấp.')
      ),
      slide('Mini check',
        card('check','Câu hỏi','Nếu v3 = v1 + v2 thì v1,v2,v3 độc lập không?','Không.'),
        card('hint','Gợi ý','Có quan hệ v1 + v2 - v3 = 0','Hệ số không phải toàn 0.'),
        card('answer','Kết luận','Nhóm phụ thuộc tuyến tính','v3 không thêm hướng mới.')
      ),
      slide('Chốt C01',
        card('takeaway','Tổng kết','Vector là dữ liệu; norm/distance đo độ lớn; dot/projection đo hướng','Basis và subspace tổ chức không gian; rank đo thông tin thật.'),
        card('memory','Nhớ','Span tạo vùng, độc lập bỏ dư, rank đếm hướng thật','Đây là xương sống cho ma trận, PCA, SVD và machine learning.'),
        card('bridge','Đi tiếp','Sau C01, ma trận sẽ trở thành máy biến đổi vector','Không gian vector là sân khấu; ma trận là động cơ chuyển cảnh.')
      )
    ]
  };

  function slide(title){return {title:title,cards:Array.prototype.slice.call(arguments,1)};}
  function card(type,label,headline,body,formula){return {cardType:type,label:label||CARD_LABEL[type]||type,headline:headline||'',explain:body||'',formula:formula||''};}
  function api(){return window.__BAUMAN_CORE_API||{};}
  function state(){try{return api().state||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function save(){try{api().save&&api().save();}catch(_){} }
  function css(name){return !!document.querySelector('link[href*="'+name+'"]');}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function isPresenting(){return document.body.classList.contains('e129-presenting')||!!document.querySelector('.e129-theory-shell.presenting');}
  function sourceSlides(){return Array.prototype.slice.call(document.querySelectorAll('.e129-theory-shell.presenting .e129-slide-list .e129-slide'));}
  function normalizeTitle(s){return String(s||'').replace(/\s+/g,' ').trim();}
  function lessonTitleFromDom(){
    var shell=document.querySelector('.e129-theory-shell.presenting')||document.querySelector('.e129-theory-shell');
    var title='';
    if(shell){
      var active=shell.querySelector('.e129-chip-btn.active,.e129-chip-btn[aria-pressed="true"],.e129-lesson-title,.e129-reader-title');
      title=text(active);
    }
    if(!title){
      var first=sourceSlides()[0];
      var h=first&&first.querySelector(':scope > h3');
      title=text(h).replace(/^\d+\.\s*/,'');
    }
    var keys=Object.keys(C01_DECKS);
    for(var i=0;i<keys.length;i++){
      if(title.indexOf(keys[i])>=0||keys[i].indexOf(title)>=0) return keys[i];
    }
    var allText=text(shell||document.body);
    for(var j=0;j<keys.length;j++){
      if(allText.indexOf(keys[j])>=0) return keys[j];
    }
    return '';
  }
  function clamp(n){return Math.max(0,Math.min(Math.max(model.length-1,0),n));}
  function readModel(){
    currentLessonKey=lessonTitleFromDom();
    model=currentLessonKey&&C01_DECKS[currentLessonKey]?C01_DECKS[currentLessonKey]:[];
    if(idx>=model.length) idx=0;
    return model.length;
  }
  function ensureDeck(){
    if(deck) return deck;
    deck=document.createElement('section');
    deck.className='e132-overlay-deck e132-compact-only-deck';
    deck.setAttribute('role','dialog');
    deck.setAttribute('aria-label','E165C Math Theory Compact Slideshow');
    deck.innerHTML='<div class="e132-deck-bg"></div><header class="e132-cleanbar"><div><b>E165C Compact Deck</b><span data-e132-clean-count>Slide</span><span data-e132-mode-label>Compact only</span></div><nav><button data-e132-prev type="button">‹</button><button data-e132-next type="button">›</button><button data-e132-exit type="button">Thoát</button></nav></header><div class="e132-clean-progress"><span></span></div><main class="e132-clean-stage" data-e132-stage></main><footer class="e132-clean-hint">← → / Space để chuyển slide · Esc để thoát · E129 Reader vẫn giữ full lecture</footer>';
    document.body.appendChild(deck);
    deck.addEventListener('click',function(e){
      var t=e.target.closest('[data-e132-prev],[data-e132-next],[data-e132-exit]');
      if(!t) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      if(t.hasAttribute('data-e132-prev')) move(-1);
      if(t.hasAttribute('data-e132-next')) move(1);
      if(t.hasAttribute('data-e132-exit')) closeDeck();
    },true);
    return deck;
  }
  function cardHtml(c){
    var tone=esc(c.cardType||'concept');
    var formula=c.formula?'<pre>'+esc(c.formula)+'</pre>':'';
    return '<article class="e132-clean-card '+tone+'" data-card-type="'+tone+'"><span class="e132-card-kicker">'+esc(c.label||CARD_LABEL[c.cardType]||c.cardType||'Card')+'</span><h3>'+esc(c.headline||'Ý chính')+'</h3>'+(formula||'')+'<p class="e132-full-body">'+esc(c.explain||c.why||c.answer||'')+'</p></article>';
  }
  function emptyHtml(){
    return '<section class="e132-clean-slide"><aside class="e132-clean-side"><span class="e132-clean-role">Empty</span><strong>00</strong><small>compact-only</small></aside><article class="e132-clean-main"><h1>Chưa có compact deck curated cho bài này</h1><div class="e132-clean-grid"><article class="e132-clean-card warning"><span class="e132-card-kicker">Không auto slice</span><h3>E132 không tự cắt Reader thành slide</h3><p class="e132-full-body">Reader vẫn giữ full content. Slideshow chỉ render khi có curated compact deck.</p></article></div></article></section>';
  }
  function render(){
    if(!deck) return;
    idx=clamp(idx);
    if(!model.length){deck.querySelector('[data-e132-stage]').innerHTML=emptyHtml();return;}
    var s=model[idx];
    var cards=(s.cards||[]).slice(0,4);
    deck.setAttribute('data-tone','compact');
    deck.setAttribute('data-mode','compact');
    deck.setAttribute('data-release',RELEASE);
    deck.querySelector('[data-e132-clean-count]').textContent=String(idx+1).padStart(2,'0')+' / '+String(model.length).padStart(2,'0')+' · '+cards.length+' cards';
    deck.querySelector('[data-e132-mode-label]').textContent='Compact only';
    deck.querySelector('.e132-clean-progress span').style.width=((idx+1)/model.length*100)+'%';
    deck.querySelector('[data-e132-stage]').innerHTML='<section class="e132-clean-slide"><aside class="e132-clean-side"><span class="e132-clean-role">Curated</span><strong>'+String(idx+1).padStart(2,'0')+'</strong><small>'+esc(currentLessonKey||'C01')+'</small></aside><article class="e132-clean-main"><h1>'+esc(s.title||'Compact slide')+'</h1><div class="e132-clean-grid">'+cards.map(cardHtml).join('')+'</div></article></section>';
  }
  function openDeck(){
    readModel();
    ensureDeck();
    document.body.classList.add('e132-overlay-open');
    deck.classList.add('open');
    render();
    return true;
  }
  function closeDeck(){
    var st=state();
    st.e129Present=false; save();
    document.body.classList.remove('e132-overlay-open','e129-presenting');
    if(deck) deck.classList.remove('open');
    try{ if(window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_THEORY_E129.render) window.BAUMAN_MATH_THEORY_E129.render(); }catch(_){}
  }
  function move(delta){idx=clamp(idx+delta); render();}
  function enhance(){
    if(isPresenting()){
      if(deck&&deck.classList.contains('open')&&document.body.classList.contains('e132-overlay-open')) return true;
      return openDeck();
    }
    if(deck) deck.classList.remove('open');
    document.body.classList.remove('e132-overlay-open');
    return false;
  }
  document.addEventListener('keydown',function(e){
    if(!document.body.classList.contains('e132-overlay-open')) return;
    if(['ArrowRight','PageDown',' ','Enter','ArrowLeft','PageUp','Escape','c','C','f','F'].indexOf(e.key)<0) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '||e.key==='Enter') move(1);
    if(e.key==='ArrowLeft'||e.key==='PageUp') move(-1);
    if(e.key==='Escape') closeDeck();
    if(e.key==='c'||e.key==='C'||e.key==='f'||e.key==='F') render();
  },true);
  var obs=new MutationObserver(function(){setTimeout(enhance,0);});
  function boot(){try{obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(_){} enhance();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
  window.BAUMAN_MATH_THEORY_E132={release:RELEASE,enhance:enhance,openDeck:openDeck,closeDeck:closeDeck,setMode:function(){render();return 'compact';},selfCheck:function(){var open=document.body.classList.contains('e132-overlay-open');return {ok:!!window.BAUMAN_MATH_THEORY_E129&&css('theory-slideshow-E132.css'),release:RELEASE,e129Detected:!!window.BAUMAN_MATH_THEORY_E129,compactOnly:true,fullLecture:false,autoSlice:false,lesson:currentLessonKey,slides:model.length,open:open,currentIndex:idx,cardCount:model[idx]&&model[idx].cards?model[idx].cards.length:0};}};
})();
