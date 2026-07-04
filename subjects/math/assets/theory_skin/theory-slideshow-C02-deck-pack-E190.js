/* E190 · C02 E132 compact deck pack
 * Adds curated compact slideshow decks for C02 §2.2-§2.6 without rewriting E132 core.
 * Loaded after E132/E171 and takes over only when the active lesson is one of these C02 decks.
 */
(function(){
  'use strict';
  var RELEASE='E190_C02_L02_L06_COMPACT_DECK_PACK_B';
  var idx=0, deck=null, model=[], currentLessonKey='';
  var original=window.BAUMAN_MATH_THEORY_E132||null;

  function S(title,formula,core,meaning,use,check){return {title:title,formula:formula,core:core,meaning:meaning,use:use,check:check};}

  var ALIASES={
    '2.2':'§2.2 · Phép nhân ma trận và pipeline tuyến tính','l22':'§2.2 · Phép nhân ma trận và pipeline tuyến tính','c02l02':'§2.2 · Phép nhân ma trận và pipeline tuyến tính','phép nhân ma trận':'§2.2 · Phép nhân ma trận và pipeline tuyến tính','nhân ma trận':'§2.2 · Phép nhân ma trận và pipeline tuyến tính','matrix multiplication':'§2.2 · Phép nhân ma trận và pipeline tuyến tính','pipeline tuyến tính':'§2.2 · Phép nhân ma trận và pipeline tuyến tính','linear pipeline':'§2.2 · Phép nhân ma trận và pipeline tuyến tính','composition':'§2.2 · Phép nhân ma trận và pipeline tuyến tính','compose transforms':'§2.2 · Phép nhân ma trận và pipeline tuyến tính','ghép biến đổi':'§2.2 · Phép nhân ma trận và pipeline tuyến tính',
    '2.3':'§2.3 · Hạng ma trận, không gian cột và thông tin độc lập','l23':'§2.3 · Hạng ma trận, không gian cột và thông tin độc lập','c02l03':'§2.3 · Hạng ma trận, không gian cột và thông tin độc lập','rank':'§2.3 · Hạng ma trận, không gian cột và thông tin độc lập','hạng ma trận':'§2.3 · Hạng ma trận, không gian cột và thông tin độc lập','không gian cột':'§2.3 · Hạng ma trận, không gian cột và thông tin độc lập','column space':'§2.3 · Hạng ma trận, không gian cột và thông tin độc lập','row space':'§2.3 · Hạng ma trận, không gian cột và thông tin độc lập','independent information':'§2.3 · Hạng ma trận, không gian cột và thông tin độc lập',
    '2.4':'§2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm','l24':'§2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm','c02l04':'§2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm','nghịch đảo':'§2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm','inverse':'§2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm','giải hệ':'§2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm','linear system':'§2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm','solve':'§2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm','condition number':'§2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm',
    '2.5':'§2.5 · Phép biến đổi tuyến tính trong hình học và dữ liệu','l25':'§2.5 · Phép biến đổi tuyến tính trong hình học và dữ liệu','c02l05':'§2.5 · Phép biến đổi tuyến tính trong hình học và dữ liệu','phép biến đổi tuyến tính':'§2.5 · Phép biến đổi tuyến tính trong hình học và dữ liệu','linear transform geometry':'§2.5 · Phép biến đổi tuyến tính trong hình học và dữ liệu','rotation':'§2.5 · Phép biến đổi tuyến tính trong hình học và dữ liệu','projection geometry':'§2.5 · Phép biến đổi tuyến tính trong hình học và dữ liệu','đổi cơ sở':'§2.5 · Phép biến đổi tuyến tính trong hình học và dữ liệu',
    '2.6':'§2.6 · Từ ma trận sang PCA và mô hình tuyến tính','l26':'§2.6 · Từ ma trận sang PCA và mô hình tuyến tính','c02l06':'§2.6 · Từ ma trận sang PCA và mô hình tuyến tính','pca':'§2.6 · Từ ma trận sang PCA và mô hình tuyến tính','mô hình tuyến tính':'§2.6 · Từ ma trận sang PCA và mô hình tuyến tính','linear model':'§2.6 · Từ ma trận sang PCA và mô hình tuyến tính','covariance':'§2.6 · Từ ma trận sang PCA và mô hình tuyến tính','svd':'§2.6 · Từ ma trận sang PCA và mô hình tuyến tính'
  };

  var DECKS={
    '§2.2 · Phép nhân ma trận và pipeline tuyến tính':[
      S('Nhân ma trận là ghép biến đổi','z = A(Bx) = (AB)x','Nếu B biến x thành y và A biến y thành z, thì AB là biến đổi tổng hợp.','Thứ tự đọc là B làm trước, A làm sau. Đây là điểm người học rất dễ nhầm.','Dùng trong pipeline xử lý dữ liệu, điều khiển, đồ họa, neural network tuyến tính.','Trong ABx, phép nào chạm vào x đầu tiên?'),
      S('Điều kiện shape','A∈R^{m×n}, B∈R^{n×p} ⇒ AB∈R^{m×p}','Số cột của A phải bằng số hàng của B.','Shape nói đầu ra của B phải là đầu vào hợp lệ của A.','Dùng trước mọi compose layer, feature transform hoặc pipeline tuyến tính.','Kích thước trung gian n đại diện cho không gian nào?'),
      S('AB không phải BA','AB ≠ BA nói chung','Đổi thứ tự ma trận thường đổi ý nghĩa biến đổi.','Xoay rồi chiếu khác chiếu rồi xoay; giảm chiều rồi scoring khác scoring rồi giảm chiều.','Dùng để tránh đảo thứ tự trong NumPy, MATLAB, PyTorch, robot frame.','Nếu đổi AB thành BA, shape còn hợp lệ không?'),
      S('Đọc theo phần tử','(AB)_{ij} = Σ_k A_{ik}B_{kj}','Mỗi ô của AB là dot product giữa hàng i của A và cột j của B.','Cách đọc này giúp debug từng phần tử và hiểu chi phí tính toán.','Dùng khi kiểm công thức tay, tối ưu nhân ma trận, đọc kernel tuyến tính.','Ô (i,j) đang đo tương tác giữa hàng nào và cột nào?'),
      S('Đọc theo cột','AB = [A b_1, A b_2, ..., A b_p]','Mỗi cột của AB là A tác động lên một cột của B.','B chứa nhiều vector đầu vào; A biến đổi từng vector theo cùng quy luật.','Dùng khi đọc batch vector, basis transform, projection nhiều mẫu.','Cột j của B sau khi qua A trở thành cột nào của AB?'),
      S('Pipeline feature','x∈R^{100}, B∈R^{20×100}, A∈R^{5×20}','B giảm 100 feature xuống 20 feature; A biến 20 feature thành 5 score.','AB biến trực tiếp vector 100 chiều thành 5 score nhưng vẫn giữ ý nghĩa hai bước.','Dùng trong feature extraction, linear classifier, layer tuyến tính.','AB có shape gì và chiều trung gian 20 có nghĩa gì?'),
      S('Batch dữ liệu hàng-mẫu','X∈R^{m×n}, Y=XB, Z=YA=X(BA)','Khi mẫu nằm theo hàng, nhân bên phải biến đổi feature của từng mẫu.','Thứ tự ma trận trong batch có thể ngược trực giác vector cột.','Dùng trong ML tabular data, PCA projection, embedding transform.','Pipeline đang dùng vector hàng hay vector cột?'),
      S('Associativity cho phép đổi ngoặc','(AB)C = A(BC)','Nhân ma trận không giao hoán nhưng có tính kết hợp.','Ta được đổi cách đặt ngoặc để tính hiệu quả hơn, không được đổi thứ tự.','Dùng để tối ưu tính toán và giảm bộ nhớ trong pipeline dài.','Nên tính (AB)C hay A(BC) để ít tốn phép nhân hơn?'),
      S('Elementwise khác matmul','A*B ≠ A@B','Nhân từng phần tử và nhân ma trận là hai phép khác nhau.','Elementwise giữ vị trí; matmul trộn hàng-cột bằng dot product.','Dùng khi debug NumPy, MATLAB, PyTorch, lỗi chạy được nhưng sai nghĩa.','Code đang dùng *, @, matmul hay dot?'),
      S('Bottleneck thông tin','rank(AB) ≤ min(rank(A), rank(B))','Tích AB không thể có nhiều hướng độc lập hơn thành phần yếu nhất.','Một bước đã chiếu hoặc giảm rank thì bước sau không khôi phục được thông tin đã mất.','Dùng để hiểu bottleneck layer, PCA, projection, sensor compression.','Bước nào trong pipeline là nút cổ chai thông tin?'),
      S('Ổn định số trong pipeline','||ABx|| có thể khuếch đại lỗi','Ghép nhiều ma trận có thể khuếch đại nhiễu hoặc sai số số học.','Đúng shape chưa đủ; còn phải kiểm điều kiện số và scale.','Dùng trong mô phỏng, deep linear networks, điều khiển.','Sai số đầu vào nhỏ có bị A và B khuếch đại quá mạnh không?'),
      S('Chốt §2.2','composition = order + shape + meaning','Nhân ma trận là ngôn ngữ ghép biến đổi tuyến tính.','Từ đây câu hỏi kế tiếp là pipeline giữ được bao nhiêu hướng thông tin độc lập.','Dùng làm nền cho rank, nghịch đảo, projection, PCA và linear layers.','Pipeline đang biến đổi dữ liệu hay làm mất thông tin?')
    ],
    '§2.3 · Hạng ma trận, không gian cột và thông tin độc lập':[
      S('Rank đo hướng thông tin độc lập','rank(A)=dim Col(A)=dim Row(A)','Rank là số hướng tuyến tính độc lập thật sự mà ma trận mang theo.','Nhiều cột không có nghĩa là nhiều thông tin nếu các cột phụ thuộc nhau.','Dùng để phát hiện feature dư, sensor trùng, hệ thiếu kích thích.','Ma trận có bao nhiêu cột và rank thật sự là bao nhiêu?'),
      S('Không gian cột','Col(A)=span(a_1,...,a_n)','Không gian cột là mọi đầu ra có thể sinh bởi Ax.','Nếu b không nằm trong Col(A), hệ Ax=b không có nghiệm đúng.','Dùng trong giải hệ, least squares, mô hình tuyến tính.','Vector b có nằm trong không gian cột của A không?'),
      S('Không gian hàng','Row(A)=Col(A^T)','Không gian hàng chứa các ràng buộc tuyến tính mà A áp lên x.','Các hàng phụ thuộc nhau nghĩa là có phép đo hoặc phương trình dư.','Dùng khi kiểm constraint, quan sát hệ, feature scoring.','Hàng nào chỉ là tổ hợp của các hàng khác?'),
      S('Rank qua pivot','rank(A)=số pivot sau khử Gauss','Khử Gauss cho biết số phương trình hoặc cột độc lập.','Pivot là dấu vết đại số của hướng thông tin mới.','Dùng khi học tay và debug phụ thuộc tuyến tính.','Có pivot ở mọi cột quan trọng không?'),
      S('Rank qua singular values','A=UΣV^T','Trong dữ liệu nhiễu, singular values cho biết hướng mạnh yếu hơn rank đại số thô.','Rank hiệu dụng cần ngưỡng, không chỉ nhìn số khác 0 tuyệt đối.','Dùng trong PCA, denoising, low-rank approximation.','Ngưỡng nào tách tín hiệu khỏi nhiễu?'),
      S('Rank thấp có thể tốt','X≈UV^T, rank=k<n','Rank thấp có thể cho thấy dữ liệu sống gần cấu trúc chiều thấp.','Đây là nền cho nén, PCA và biểu diễn gọn.','Dùng khi muốn giảm chiều nhưng giữ thông tin chính.','Rank thấp là cấu trúc thật hay do thiếu dữ liệu?'),
      S('Rank thấp có thể xấu','feature_3 = feature_1 + feature_2','Rank thấp cũng có thể báo feature dư, sensor lỗi hoặc thí nghiệm thiếu kích thích.','Không được kết luận tốt/xấu nếu chưa đọc ngữ cảnh kỹ thuật.','Dùng trong audit dữ liệu cảm biến và multicollinearity.','Phụ thuộc tuyến tính này là vật lý thật hay lỗi đo?'),
      S('Full column rank','rank(A)=n với A∈R^{m×n}','Các cột độc lập nên mỗi biến đầu vào có hướng đóng góp riêng.','Điều này quan trọng cho nghiệm least squares ổn định hơn.','Dùng trong hồi quy, nhận dạng hệ, sensor design.','Có biến nào không thể phân biệt bằng dữ liệu đo không?'),
      S('Full row rank','rank(A)=m với A∈R^{m×n}','Các hàng độc lập nên mọi ràng buộc đầu ra đều có thông tin riêng.','Nếu thiếu full row rank, có ràng buộc dư hoặc không quan sát được.','Dùng trong điều khiển, constraint systems, đo lường.','Có phương trình nào chỉ lặp lại phương trình khác không?'),
      S('Rank và mất thông tin','rank(A)<n ⇒ tồn tại x≠0 sao cho Ax=0','Nếu null space khác 0, có hướng đầu vào bị A xóa mất.','Thông tin trong hướng đó không thể phục hồi từ đầu ra.','Dùng để hiểu projection, compression, inverse problem.','Hướng nào bị ma trận làm biến mất?'),
      S('Mini case cảm biến','rank(X)<số feature','Nhiều cảm biến có thể đo cùng hiện tượng dưới hệ số khác nhau.','Mô hình nhận nhiều cột nhưng ít thông tin độc lập, dễ đa cộng tuyến.','Dùng trong predictive maintenance và sensor fusion.','Có nên loại bớt sensor hoặc đổi cách thiết kế feature không?'),
      S('Chốt §2.3','rank = số hướng thông tin độc lập','Rank nối dữ liệu, giải hệ, giảm chiều và ổn định mô hình.','Bài sau dùng rank để quyết định khi nào nghịch đảo và nghiệm duy nhất tồn tại.','Dùng như đèn soi xem ma trận thật sự giữ bao nhiêu thông tin.','Rank đang nói về cấu trúc tốt hay lỗi dữ liệu?')
    ],
    '§2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm':[
      S('Giải hệ là tìm nguyên nhân','Ax=b','Ta biết đầu ra b và muốn tìm x đã tạo ra b qua A.','Đây là bài toán ngược: truy nguyên trạng thái, tham số hoặc tín hiệu nguồn.','Dùng trong sensor fusion, định vị, hồi quy, mô phỏng kỹ thuật.','b có thật sự đến từ một x qua A không?'),
      S('Nghịch đảo hoàn tác biến đổi','A^{-1}A=I, AA^{-1}=I','Nếu A không làm mất thông tin, A^{-1} có thể đưa b trở lại x.','Nghịch đảo chỉ tồn tại cho ma trận vuông full rank.','Dùng trong lý thuyết, nhưng khi code thường dùng solve thay vì inverse.','A có vuông và full rank không?'),
      S('Điều kiện nghiệm duy nhất','rank(A)=n với A∈R^{n×n}','Ma trận vuông full rank cho nghiệm duy nhất x=A^{-1}b.','Nếu rank thiếu, nhiều x có thể cho cùng b hoặc không có nghiệm.','Dùng để kiểm trước khi giải hệ chính xác.','Hệ mất hướng thông tin nào khi rank thiếu?'),
      S('b phải nằm trong Col(A)','Ax=b có nghiệm ⇔ b∈Col(A)','Không gian cột chứa mọi đầu ra A có thể tạo.','Nếu b nằm ngoài Col(A), chỉ có thể tìm nghiệm xấp xỉ.','Dùng trong least squares và kiểm tính nhất quán của dữ liệu.','Dữ liệu đo b có tương thích với mô hình A không?'),
      S('Không nên tính inverse trực tiếp','solve(A,b) tốt hơn inv(A)@b','Tính inverse rồi nhân thường kém ổn định và tốn hơn solve.','Trong lập trình số, lời khuyên là giải hệ bằng solver chuyên dụng.','Dùng trong NumPy, MATLAB, SciPy, kiểm tra hiệu năng.','Bạn đang cần nghiệm x hay thật sự cần toàn bộ A^{-1}?'),
      S('Điều kiện số','κ(A)=||A||·||A^{-1}||','Condition number đo mức khuếch đại sai số của bài toán giải hệ.','κ lớn nghĩa là nhiễu nhỏ trong b hoặc A có thể làm x sai mạnh.','Dùng để cảnh báo hệ gần suy biến và nghiệm không tin cậy.','κ(A) có quá lớn so với độ chính xác dữ liệu không?'),
      S('Singular matrix','det(A)=0 ⇔ rank(A)<n','Ma trận suy biến làm mất ít nhất một hướng thông tin.','Khi thông tin đã bị nén mất, không thể hoàn tác duy nhất.','Dùng để hiểu tại sao inverse không tồn tại.','Có hướng x≠0 nào bị A đưa về 0 không?'),
      S('Hệ quá xác định','A∈R^{m×n}, m>n','Nhiều phương trình hơn ẩn thường không có nghiệm đúng khi dữ liệu nhiễu.','Ta tìm nghiệm gần nhất bằng least squares.','Dùng trong hồi quy, calibration, sensor fusion.','Residual còn lại là nhiễu hay mô hình sai?'),
      S('Hệ thiếu xác định','A∈R^{m×n}, m<n','Ít phương trình hơn ẩn thường có vô số nghiệm nếu nhất quán.','Cần thêm ràng buộc như nghiệm norm nhỏ nhất hoặc regularization.','Dùng trong inverse problem, compressed sensing, estimation.','Ràng buộc phụ nào làm nghiệm có nghĩa kỹ thuật?'),
      S('Regularization','(A^T A+λI)x=A^T b','Thêm λ giúp ổn định nghiệm khi A gần suy biến hoặc dữ liệu nhiễu.','Regularization đánh đổi fit dữ liệu với độ ổn định của nghiệm.','Dùng trong ridge regression, inverse problems, lọc nhiễu.','λ đang chống nhiễu hay đang làm lệch nghiệm quá mạnh?'),
      S('Mini case sensor fusion','b = Hx + noise','H mô tả cách trạng thái x tạo ra đo lường b.','Nếu H thiếu rank, vài trạng thái không quan sát được duy nhất.','Dùng trong định vị, Kalman filter, ước lượng trạng thái.','Trạng thái nào không thể xác định từ cảm biến hiện có?'),
      S('Chốt §2.4','existence + uniqueness + stability','Giải hệ tốt cần có nghiệm, nghiệm duy nhất và tính toán ổn định.','Bài sau nhìn ma trận bằng hình học để thấy biến đổi giữ hay làm mất thông tin.','Dùng như cổng kiểm trước khi tin nghiệm số.','Nghiệm sai do mô hình, dữ liệu hay điều kiện số?')
    ],
    '§2.5 · Phép biến đổi tuyến tính trong hình học và dữ liệu':[
      S('Ma trận biến đổi không gian','y=Ax','Ma trận kéo, xoay, co, giãn, chiếu hoặc đổi cách đọc vector.','Hiểu hình học giúp thấy dữ liệu bị biến dạng thế nào sau biến đổi.','Dùng trong đồ họa, robot frame, PCA, feature transform.','A đang làm gì với lưới tọa độ ban đầu?'),
      S('Tuyến tính giữ cộng và scale','A(u+v)=Au+Av, A(αu)=αAu','Tuyến tính nghĩa là biến đổi tôn trọng cấu trúc vector.','Nhờ đó ta phân tích tác động của A theo basis và theo hướng.','Dùng để kiểm phép xử lý có thể mô tả bằng ma trận hay không.','Phép xử lý này có làm gốc tọa độ đi khỏi 0 không?'),
      S('Scale theo trục','S=[[s_x,0],[0,s_y]]','Scale kéo giãn dữ liệu khác nhau theo từng trục.','Nó thay đổi khoảng cách và có thể làm feature scale lớn thống trị.','Dùng trong chuẩn hóa, đồ họa, feature scaling.','Scale này là tiền xử lý hợp lý hay làm méo metric?'),
      S('Rotation giữ độ dài','R^T R=I','Ma trận trực giao giữ norm và góc.','Rotation đổi hướng nhìn nhưng không làm méo hình học Euclidean.','Dùng trong robot, camera, PCA basis, tọa độ thế giới.','R có thật sự trực giao trong tính toán số không?'),
      S('Projection giảm chiều','P^2=P','Projection giữ phần trong subspace và bỏ phần vuông góc.','Nó hữu ích cho lọc nhiễu nhưng làm mất thông tin ngoài subspace.','Dùng trong least squares, PCA, denoising.','Phần bị bỏ là nhiễu hay tín hiệu quan trọng?'),
      S('Shear trộn trục','H=[[1,k],[0,1]]','Shear giữ một trục nhưng kéo trục khác theo nó.','Dữ liệu có thể bị nghiêng mà diện tích hoặc rank vẫn còn.','Dùng trong đồ họa và trực giác biến đổi tuyến tính.','Feature nào đang kéo lệch feature khác?'),
      S('Đổi cơ sở','x=Bc, c=B^{-1}x','Cùng vector thật có thể có tọa độ khác nhau trong các cơ sở khác nhau.','Đổi cơ sở không nhất thiết đổi đối tượng, chỉ đổi cách ghi nó.','Dùng trong robot frame, PCA coordinates, diagonalization.','Bạn đang đổi vector hay đổi hệ tọa độ của nó?'),
      S('Affine khác tuyến tính','p_world=R p_body + t','Tịnh tiến làm phép biến đổi không còn tuyến tính thuần vì 0 không về 0.','Nhiều hệ kỹ thuật dùng affine, phần tuyến tính vẫn do ma trận R mô tả.','Dùng trong SLAM, camera, đồ họa, robot navigation.','Công thức có thêm tịnh tiến không?'),
      S('Rank nói giữ hay mất chiều','rank(A)<n ⇒ giảm chiều','Nếu rank giảm, ma trận ép dữ liệu vào không gian thấp chiều hơn.','Đây là lý do projection và một số transform không thể đảo ngược.','Dùng khi kiểm thông tin sau biến đổi.','Biến đổi này còn đảo ngược được không?'),
      S('Mini case robot','v_world=R v_body','Vận tốc đo trong thân robot cần quay sang hệ thế giới để dùng trên bản đồ.','Nếu dùng sai chiều quay, hướng chuyển động sẽ bị đọc ngược hoặc lệch.','Dùng trong điều khiển UGV/UAV, SLAM, sensor fusion.','R đang chuyển từ body sang world hay ngược lại?'),
      S('Mini case dữ liệu','Y=X A^T','Transform có thể xoay hoặc chiếu đám mây dữ liệu để pattern hiện rõ hơn.','Trước/sau transform cần kiểm khoảng cách, rank và khả năng diễn giải.','Dùng trong PCA, visualization, anomaly detection.','Pattern rõ hơn nhưng feature mới có còn giải thích được không?'),
      S('Chốt §2.5','geometry = shape of information','Ma trận không chỉ tính số mà còn biến dạng hình học dữ liệu.','Bài cuối C02 dùng trực giác này để hiểu PCA và mô hình tuyến tính.','Dùng để đọc transform bằng mắt toán học trước khi tin model.','Biến đổi này giữ, trộn hay xóa thông tin?')
    ],
    '§2.6 · Từ ma trận sang PCA và mô hình tuyến tính':[
      S('Ma trận là nền của PCA và linear model','X, X_c, UΣV^T, y=Xw','Khi dữ liệu thành ma trận, ta có thể tìm hướng chính, giảm chiều và dự đoán tuyến tính.','PCA và mô hình tuyến tính đều đọc hình học của X nhưng phục vụ mục tiêu khác nhau.','Dùng để nối đại số tuyến tính với ML và xử lý tín hiệu.','Bạn đang tìm cấu trúc dữ liệu hay dự đoán đầu ra?'),
      S('Center trước PCA','X_c = X - 1μ^T','PCA cần nhìn biến thiên quanh trung tâm dữ liệu.','Nếu không center, hướng chính có thể bị kéo bởi vị trí offset thay vì phương sai.','Dùng trước covariance, SVD, PCA.','Mean có bị outlier kéo lệch không?'),
      S('Covariance matrix','C = (1/(m-1)) X_c^T X_c','Covariance đo các feature cùng biến thiên thế nào.','Hướng eigen lớn là hướng dữ liệu thay đổi mạnh.','Dùng để hiểu PCA theo thống kê.','Feature nào đi cùng nhau và feature nào gần độc lập?'),
      S('PCA qua SVD','X_c = UΣV^T','Các vector trong V là hướng principal components trong feature space.','Singular values cho biết năng lượng/phương sai theo từng hướng.','Dùng để giảm chiều, nén dữ liệu, lọc nhiễu.','Bao nhiêu singular values đủ giữ cấu trúc chính?'),
      S('Chiếu dữ liệu','Z = X_c V_k','Z là tọa độ dữ liệu trong k hướng chính.','Giảm chiều nghĩa là giữ hướng quan trọng và bỏ hướng yếu hơn.','Dùng cho visualization, preprocessing, compression.','k chọn theo explained variance hay theo nhiệm vụ sau?'),
      S('Tái tạo và lỗi','X_hat = Z V_k^T + μ','Reconstruction error đo phần dữ liệu bị bỏ khi giảm chiều.','Lỗi nhỏ không luôn nghĩa là mô hình dự đoán tốt, chỉ nghĩa là hình học được giữ tốt.','Dùng để kiểm PCA nén dữ liệu.','Phần mất đi là nhiễu hay tín hiệu hiếm?'),
      S('Mô hình tuyến tính','y = Xw + b','Linear model dùng ma trận dữ liệu X để tạo dự đoán bằng trọng số w.','w nói mỗi feature đóng góp tuyến tính vào đầu ra.','Dùng trong regression, classifier tuyến tính, baseline ML.','Trọng số lớn do feature quan trọng hay do scale chưa chuẩn hóa?'),
      S('Normal equation','X^T X w = X^T y','Least squares tìm w sao cho residual nhỏ nhất theo L2.','Nếu X^T X kém điều kiện, nghiệm có thể nhạy với nhiễu.','Dùng để nối projection với regression.','Có nên dùng solver/regularization thay vì inverse không?'),
      S('PCA khác prediction','PCA tối đa phương sai, model tối thiểu loss','PCA không dùng nhãn y; linear model dùng y để học quan hệ dự đoán.','Hướng biến thiên lớn chưa chắc là hướng hữu ích nhất cho nhiệm vụ.','Dùng để tránh nhầm giảm chiều với học dự đoán.','Feature có variance lớn có thật sự liên quan đến y không?'),
      S('Pipeline ML tuyến tính','clean → center/scale → SVD/PCA → model → residual','Pipeline tốt không bắt đầu từ model mà từ kiểm dữ liệu và hình học X.','Mỗi bước thay đổi shape, scale và ý nghĩa của feature.','Dùng để xây workflow học máy có kiểm soát.','Bạn đã audit X trước khi fit model chưa?'),
      S('Mini case sensor health','X=[vibration,temp,current,speed], y=health_score','PCA phát hiện hướng biến thiên chính; linear model dự đoán điểm sức khỏe.','Hai công cụ dùng cùng ma trận X nhưng trả lời hai câu hỏi khác nhau.','Dùng trong predictive maintenance và anomaly detection.','PCA đang giúp giải thích hay chỉ làm mất feature vật lý?'),
      S('Chốt §2.6','matrix → PCA structure, linear model prediction','C02 kết thúc bằng cầu từ ma trận sang PCA và mô hình tuyến tính.','Sau C02, bước tự nhiên là gradient: loss thay đổi thế nào theo tham số.','Dùng làm bản lề sang giải tích và tối ưu.','Bạn đang tối ưu cấu trúc biểu diễn hay tối ưu sai số dự đoán?')
    ]
  };

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/§/g,'').replace(/[^a-z0-9.]+/g,' ').trim();}
  function api(){return window.__BAUMAN_CORE_API||{};}
  function state(){try{return api().state||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function save(){try{api().save&&api().save();}catch(_){}}
  function isPresenting(){return document.body.classList.contains('e129-presenting')||!!document.querySelector('.e129-theory-shell.presenting');}
  function attrText(n){if(!n)return '';var out=[text(n)];['data-lesson-id','data-id','data-key','data-title','aria-label','title'].forEach(function(a){var v=n.getAttribute&&n.getAttribute(a);if(v)out.push(v);});return out.join(' ');}
  function activeLessonText(){
    var shell=document.querySelector('.e129-theory-shell.presenting')||document.querySelector('.e129-theory-shell');
    var parts=[];
    if(shell){
      ['.e129-chip-btn.active','.e129-chip-btn[aria-pressed="true"]','.e129-chip-btn.selected','.e129-slide-chip.active','[data-current-lesson]','.e129-lesson-title','.e129-reader-title','[data-e129-current-title]'].forEach(function(sel){Array.prototype.slice.call(shell.querySelectorAll(sel)).forEach(function(n){parts.push(attrText(n));});});
      Array.prototype.slice.call(shell.querySelectorAll('.e129-chip-btn,.e129-slide-chip,button')).forEach(function(b){var pressed=b.getAttribute('aria-pressed');var cls=b.className||'';if(pressed==='true'||/active|selected|current/.test(cls))parts.push(attrText(b));});
      parts.push(attrText(shell));
    }
    var st=state();['lessonId','currentLessonId','selectedLessonId','theoryLessonId','lessonTitle','currentLessonTitle','selectedTheoryTitle','e129LessonId'].forEach(function(k){if(st&&st[k])parts.push(st[k]);});
    return parts.join(' ');
  }
  function lessonTitleFromDom(){var raw=activeLessonText(), nraw=norm(raw), keys=Object.keys(DECKS);
    for(var i=0;i<keys.length;i++){if(nraw.indexOf(norm(keys[i]))>=0)return keys[i];}
    var aliases=Object.keys(ALIASES);
    for(var j=0;j<aliases.length;j++){if(nraw.indexOf(norm(aliases[j]))>=0)return ALIASES[aliases[j]];}
    return '';
  }
  function readModel(){currentLessonKey=lessonTitleFromDom();model=currentLessonKey&&DECKS[currentLessonKey]?DECKS[currentLessonKey]:[];if(idx>=model.length)idx=0;return model.length;}
  function clamp(n){return Math.max(0,Math.min(Math.max(model.length-1,0),n));}
  function card(type,label,headline,body,formula){return {type:type,label:label,headline:headline,body:body,formula:formula||''};}
  function cardsFor(s){return [card('concept','Ý chính',s.title,s.core,''),card('formula','Công thức trọng tâm','Công thức của slide',s.meaning,s.formula),card('application','Ứng dụng',s.use,s.use,''),card('check','Tự kiểm',s.check,s.check,'')];}
  function cardHtml(c){var formula=c.formula?'<pre>'+esc(c.formula)+'</pre>':'';return '<article class="e132-clean-card '+esc(c.type)+'" data-card-type="'+esc(c.type)+'"><span class="e132-card-kicker">'+esc(c.label)+'</span><h3>'+esc(c.headline)+'</h3>'+formula+'<p class="e132-full-body">'+esc(c.body)+'</p></article>';}
  function hideOtherDecks(){Array.prototype.slice.call(document.querySelectorAll('.e132-overlay-deck:not(.e190-c02-deck)')).forEach(function(n){n.classList.remove('open');});}
  function ensureDeck(){
    if(deck)return deck;
    deck=document.createElement('section');
    deck.className='e132-overlay-deck e132-compact-only-deck e190-c02-deck';
    deck.setAttribute('role','dialog');
    deck.setAttribute('aria-label','E190 C02 Compact Slideshow');
    deck.innerHTML='<div class="e132-deck-bg"></div><header class="e132-cleanbar"><div><b>E190 C02 Compact Deck</b><span data-e190-count>Slide</span><span data-e190-mode-label>Mức B · compact</span></div><nav><button data-e190-prev type="button">‹</button><button data-e190-next type="button">›</button><button data-e190-exit type="button">Thoát</button></nav></header><div class="e132-clean-progress"><span></span></div><main class="e132-clean-stage" data-e190-stage></main><footer class="e132-clean-hint">← → / Space để chuyển slide · Esc để thoát · C02 deck pack mức B</footer>';
    document.body.appendChild(deck);
    deck.addEventListener('click',function(e){var t=e.target.closest('[data-e190-prev],[data-e190-next],[data-e190-exit]');if(!t)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(t.hasAttribute('data-e190-prev'))move(-1);if(t.hasAttribute('data-e190-next'))move(1);if(t.hasAttribute('data-e190-exit'))closeDeck();},true);
    return deck;
  }
  function render(){
    if(!deck)return;idx=clamp(idx);deck.setAttribute('data-mode','compact');deck.setAttribute('data-tone','compact');deck.setAttribute('data-release',RELEASE);
    var s=model[idx], cards=s?cardsFor(s):[];
    deck.querySelector('[data-e190-count]').textContent=String(idx+1).padStart(2,'0')+' / '+String(model.length).padStart(2,'0')+' · 4 cards';
    deck.querySelector('[data-e190-mode-label]').textContent='Mức B · compact';
    deck.querySelector('.e132-clean-progress span').style.width=((idx+1)/model.length*100)+'%';
    deck.querySelector('[data-e190-stage]').innerHTML='<section class="e132-clean-slide"><aside class="e132-clean-side"><span class="e132-clean-role">C02</span><strong>'+String(idx+1).padStart(2,'0')+'</strong><small>'+esc(currentLessonKey||'C02')+'</small></aside><article class="e132-clean-main"><h1>'+esc(s.title)+'</h1><div class="e132-clean-grid">'+cards.map(cardHtml).join('')+'</div><div class="e132-formula-rail"><b>Công thức slide</b><code>'+esc(s.formula)+'</code></div></article></section>';
  }
  function openDeck(){readModel();if(!model.length){return original&&original.openDeck?original.openDeck():false;}ensureDeck();hideOtherDecks();document.body.classList.add('e132-overlay-open');deck.classList.add('open');render();return true;}
  function closeDeck(){var st=state();st.e129Present=false;save();document.body.classList.remove('e132-overlay-open','e129-presenting');if(deck)deck.classList.remove('open');try{if(window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_THEORY_E129.render)window.BAUMAN_MATH_THEORY_E129.render();}catch(_){} }
  function move(delta){idx=clamp(idx+delta);render();}
  function enhance(){if(isPresenting()){readModel();if(model.length){openDeck();return true;}}if(deck)deck.classList.remove('open');return false;}
  document.addEventListener('keydown',function(e){if(!deck||!deck.classList.contains('open'))return;if(['ArrowRight','PageDown',' ','Enter','ArrowLeft','PageUp','Escape','c','C','f','F'].indexOf(e.key)<0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '||e.key==='Enter')move(1);if(e.key==='ArrowLeft'||e.key==='PageUp')move(-1);if(e.key==='Escape')closeDeck();if(e.key==='c'||e.key==='C'||e.key==='f'||e.key==='F')render();},true);
  var obs=new MutationObserver(function(){setTimeout(enhance,0);});
  function boot(){try{obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(_){}enhance();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E190_C02_DECK_PACK={release:RELEASE,enhance:enhance,openDeck:openDeck,closeDeck:closeDeck,decks:Object.keys(DECKS),selfCheck:function(){return {ok:true,release:RELEASE,decks:Object.keys(DECKS).length,lesson:currentLessonKey,slides:model.length,currentIndex:idx};}};
  window.BAUMAN_MATH_THEORY_E132=Object.assign({},original||{}, {release:(original&&original.release)||'E132_WITH_E190_C02_PACK',enhance:function(){var handled=enhance();if(handled)return true;return original&&original.enhance?original.enhance():false;},openDeck:function(){var handled=openDeck();if(handled)return true;return original&&original.openDeck?original.openDeck():false;},closeDeck:closeDeck,setMode:function(){render();return 'compact';}});
})();
