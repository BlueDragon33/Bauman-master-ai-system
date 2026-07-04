/* E191 · C03 E132 compact deck pack
 * Mức B coverage for C03 §3.1-§3.6 without rewriting E132 core.
 * Loaded after E190 and takes over only when the active lesson is one of these C03 decks.
 */
(function(){
  'use strict';
  var RELEASE='E191_C03_L01_L06_COMPACT_DECK_PACK_B';
  var idx=0, deck=null, model=[], currentLessonKey='';
  var original=window.BAUMAN_MATH_THEORY_E132||null;

  function S(title,formula,core,meaning,use,check){return {title:title,formula:formula,core:core,meaning:meaning,use:use,check:check};}

  var ALIASES={
    '3.1':'§3.1 · Hàm số như mô hình đầu vào–đầu ra','l31':'§3.1 · Hàm số như mô hình đầu vào–đầu ra','c03l01':'§3.1 · Hàm số như mô hình đầu vào–đầu ra','hàm số':'§3.1 · Hàm số như mô hình đầu vào–đầu ra','function':'§3.1 · Hàm số như mô hình đầu vào–đầu ra','input output':'§3.1 · Hàm số như mô hình đầu vào–đầu ra','mô hình đầu vào':'§3.1 · Hàm số như mô hình đầu vào–đầu ra',
    '3.2':'§3.2 · Đạo hàm và độ nhạy của hệ thống','l32':'§3.2 · Đạo hàm và độ nhạy của hệ thống','c03l02':'§3.2 · Đạo hàm và độ nhạy của hệ thống','đạo hàm':'§3.2 · Đạo hàm và độ nhạy của hệ thống','derivative':'§3.2 · Đạo hàm và độ nhạy của hệ thống','sensitivity':'§3.2 · Đạo hàm và độ nhạy của hệ thống','độ nhạy':'§3.2 · Đạo hàm và độ nhạy của hệ thống',
    '3.3':'§3.3 · Gradient như hướng thay đổi nhanh nhất','l33':'§3.3 · Gradient như hướng thay đổi nhanh nhất','c03l03':'§3.3 · Gradient như hướng thay đổi nhanh nhất','gradient':'§3.3 · Gradient như hướng thay đổi nhanh nhất','hướng thay đổi nhanh nhất':'§3.3 · Gradient như hướng thay đổi nhanh nhất','partial derivative':'§3.3 · Gradient như hướng thay đổi nhanh nhất',
    '3.4':'§3.4 · Gradient descent và learning rate','l34':'§3.4 · Gradient descent và learning rate','c03l04':'§3.4 · Gradient descent và learning rate','gradient descent':'§3.4 · Gradient descent và learning rate','learning rate':'§3.4 · Gradient descent và learning rate','tối ưu':'§3.4 · Gradient descent và learning rate','convergence':'§3.4 · Gradient descent và learning rate',
    '3.5':'§3.5 · Hàm mất mát, cực trị và điều kiện tối ưu','l35':'§3.5 · Hàm mất mát, cực trị và điều kiện tối ưu','c03l05':'§3.5 · Hàm mất mát, cực trị và điều kiện tối ưu','loss':'§3.5 · Hàm mất mát, cực trị và điều kiện tối ưu','hàm mất mát':'§3.5 · Hàm mất mát, cực trị và điều kiện tối ưu','cực trị':'§3.5 · Hàm mất mát, cực trị và điều kiện tối ưu','optimality':'§3.5 · Hàm mất mát, cực trị và điều kiện tối ưu','hessian':'§3.5 · Hàm mất mát, cực trị và điều kiện tối ưu',
    '3.6':'§3.6 · Từ gradient sang backpropagation và tối ưu ML','l36':'§3.6 · Từ gradient sang backpropagation và tối ưu ML','c03l06':'§3.6 · Từ gradient sang backpropagation và tối ưu ML','backprop':'§3.6 · Từ gradient sang backpropagation và tối ưu ML','backpropagation':'§3.6 · Từ gradient sang backpropagation và tối ưu ML','chain rule':'§3.6 · Từ gradient sang backpropagation và tối ưu ML','autograd':'§3.6 · Từ gradient sang backpropagation và tối ưu ML','optimizer':'§3.6 · Từ gradient sang backpropagation và tối ưu ML'
  };

  var DECKS={
    '§3.1 · Hàm số như mô hình đầu vào–đầu ra':[
      S('Hàm số là hộp biến đổi','y=f(x)','Hàm nhận đầu vào x và trả đầu ra y theo một quy luật.','Trong kỹ thuật, hàm là mô hình liên hệ giữa dữ liệu, trạng thái, tham số và đầu ra.','Dùng trong AI, điều khiển, lọc tín hiệu, dự đoán trạng thái.','Đầu vào, đầu ra và đơn vị của hàm này là gì?'),
      S('Domain là vùng an toàn','x∈Domain(f)','Hàm chỉ có nghĩa trong miền đầu vào hợp lệ.','Mô hình tốt trong miền huấn luyện có thể nguy hiểm khi ngoại suy.','Dùng để tránh dùng model ngoài vùng dữ liệu đã kiểm chứng.','Dữ liệu hiện tại có nằm trong domain đã học không?'),
      S('Hàm vector','f:R^n→R^m','Đầu vào và đầu ra có thể là vector nhiều chiều.','Một robot state, ảnh, tín hiệu hoặc feature vector đều có thể đi qua hàm vector.','Dùng trong mô hình đa đầu ra, hệ động lực, neural network.','Shape đầu vào và shape đầu ra đã rõ chưa?'),
      S('Tham số mô hình','y=f(x;θ)','θ điều khiển hình dạng của hàm và được học hoặc hiệu chỉnh.','Học máy chính là tìm θ để hàm trả kết quả đúng hơn trên dữ liệu.','Dùng trong hồi quy, mạng neural, nhận dạng hệ thống.','Đâu là biến đầu vào, đâu là tham số?'),
      S('Sai số mô hình','e=f(x;θ)-y_true','Không thể đánh giá hàm chỉ bằng công thức; phải đo sai số so với thực tế.','Sai số cho biết mô hình thiếu gì hoặc dữ liệu có nhiễu ở đâu.','Dùng làm cầu sang loss và tối ưu.','Sai số đến từ mô hình, cảm biến hay domain sai?'),
      S('Hàm tuyến tính là nền','f(x)=Ax+b','Hàm tuyến tính/affine là viên gạch đầu cho mô hình phức tạp hơn.','Nó dễ phân tích, dễ đạo hàm và là baseline quan trọng.','Dùng trước khi dùng mô hình phi tuyến hoặc neural network.','Baseline tuyến tính đã đủ tốt chưa?'),
      S('Hàm phi tuyến','f(x)=sin(x), exp(x), sigmoid(x)','Phi tuyến giúp mô tả bão hòa, ngưỡng, dao động và quan hệ cong.','Nhưng phi tuyến cũng làm tối ưu khó hơn và dễ có vùng nhạy mạnh.','Dùng trong cảm biến, activation, dynamics, xác suất.','Phi tuyến này có ý nghĩa vật lý hay chỉ thêm cho phức tạp?'),
      S('Mini case nhiệt thiết bị','T=f(I,v,T_env;θ)','Nhiệt độ lõi phụ thuộc dòng điện, tốc độ quay và môi trường.','Hàm tốt phải ghi rõ domain vận hành, đơn vị, sai số và rủi ro ngoại suy.','Dùng trong cảnh báo quá nhiệt và predictive maintenance.','Nếu dòng điện vượt vùng train, có còn tin f không?'),
      S('Lỗi thường gặp','formula ≠ usable model','Có công thức chưa đủ; mô hình cần domain, giả định, dữ liệu kiểm chứng và sai số.','Thiếu metadata làm hàm trở thành hộp đen số học.','Dùng làm checklist trước khi đem model vào pipeline.','Có thể viết một dòng mô tả domain và assumption không?'),
      S('Chốt §3.1','model = input + rule + parameter + error','Hàm số là mô hình đầu vào–đầu ra có điều kiện sử dụng.','Bài sau hỏi: đầu ra thay đổi bao nhiêu khi đầu vào thay đổi một chút.','Dùng làm cửa vào cho đạo hàm và gradient.','Điều gì xảy ra nếu x tăng rất nhỏ?')
    ],
    '§3.2 · Đạo hàm và độ nhạy của hệ thống':[
      S('Đạo hàm đo độ nhạy','f′(x)=lim_{h→0}(f(x+h)-f(x))/h','Đạo hàm trả lời đầu ra đổi bao nhiêu khi đầu vào đổi rất nhỏ.','Nó là kính hiển vi cục bộ của hàm.','Dùng trong tối ưu, điều khiển, phân tích sai số.','Tại điểm này hệ nhạy hay lì?'),
      S('Tuyến tính hóa cục bộ','f(x+h)≈f(x)+f′(x)h','Quanh một điểm nhỏ, hàm phi tuyến giống một đường thẳng tiếp tuyến.','Xấp xỉ này mạnh nhưng chỉ đúng gần điểm đang xét.','Dùng trong EKF, điều khiển tuyến tính hóa, Newton, sai số đo.','h có đủ nhỏ để tin tuyến tính hóa không?'),
      S('Dấu của đạo hàm','f′(x)>0, f′(x)<0, f′(x)=0','Dấu cho biết hàm tăng, giảm hoặc gần phẳng tại điểm đó.','Độ lớn cho biết đầu ra phản ứng mạnh hay yếu.','Dùng khi đọc xu hướng và vùng bão hòa.','Đạo hàm gần 0 là ổn định hay mắc kẹt?'),
      S('Đơn vị của đạo hàm','unit(dy/dx)=unit(y)/unit(x)','Đạo hàm có đơn vị, không phải chỉ là con số trần.','Quên đơn vị làm sai diễn giải độ nhạy kỹ thuật.','Dùng khi phân tích sensor, nhiệt, dòng điện, vận tốc.','Một tăng 1 đơn vị của x làm y đổi bao nhiêu đơn vị?'),
      S('Đạo hàm số','f′(x)≈(f(x+h)-f(x))/h','Khi không có công thức giải tích, có thể xấp xỉ bằng sai phân.','h quá lớn gây sai xấp xỉ, h quá nhỏ gặp lỗi làm tròn.','Dùng trong kiểm gradient và mô phỏng.','h đã được thử nhiều giá trị chưa?'),
      S('Đạo hàm và nhiễu','noise có thể làm f′(x) nhảy mạnh','Đạo hàm nhạy với nhiễu vì nó nhìn thay đổi nhỏ.','Dữ liệu nhiễu cần smoothing hoặc mô hình hóa trước khi lấy đạo hàm.','Dùng trong tín hiệu cảm biến và điều khiển.','Độ nhạy đo được là hệ thật hay nhiễu?'),
      S('Mini case cảm biến nhiệt','dT/dI','Đạo hàm nhiệt theo dòng cho biết rủi ro quá nhiệt khi tăng công suất.','Độ nhạy lớn báo vùng cần giới hạn hoặc làm mát tốt hơn.','Dùng trong thiết kế an toàn thiết bị.','Dòng tăng nhỏ có làm nhiệt tăng vượt ngưỡng không?'),
      S('Lỗi thường gặp','global behavior ≠ local derivative','Đạo hàm tại một điểm không mô tả toàn bộ hàm.','Tuyến tính hóa xa điểm xét có thể tạo dự đoán sai nghiêm trọng.','Dùng làm cảnh báo khi ngoại suy mô hình.','Bạn đang dùng đạo hàm ở đúng vùng hay kéo nó quá xa?'),
      S('Checklist đạo hàm','point + scale + smoothness + noise','Muốn tin đạo hàm cần biết điểm xét, thang đo, độ trơn và nhiễu.','Thiếu một trong bốn thứ này, độ nhạy có thể đánh lừa.','Dùng trước khi tối ưu hoặc thiết kế controller.','Điểm xét có đại diện cho vùng vận hành thật không?'),
      S('Chốt §3.2','derivative = local sensitivity','Đạo hàm là độ nhạy cục bộ và nền cho mọi thuật toán bước nhỏ.','Bài sau mở rộng đạo hàm sang nhiều biến bằng gradient.','Dùng làm cầu sang tối ưu đa chiều.','Nếu có nhiều biến, gom các độ nhạy thế nào?')
    ],
    '§3.3 · Gradient như hướng thay đổi nhanh nhất':[
      S('Gradient gom nhiều độ nhạy','∇f=[∂f/∂x_1,...,∂f/∂x_n]^T','Gradient là vector các đạo hàm riêng theo từng biến.','Mỗi thành phần nói biến đó làm đầu ra thay đổi ra sao.','Dùng trong ML, tối ưu, sensitivity analysis.','Thành phần gradient nào lớn nhất và vì sao?'),
      S('Hướng tăng nhanh nhất','D_u f=∇f·u','Gradient chỉ hướng tăng nhanh nhất của hàm trong metric Euclidean.','Muốn giảm loss, đi theo hướng âm gradient.','Dùng trong gradient descent và thiết kế cập nhật tham số.','Bạn muốn tăng objective hay giảm loss?'),
      S('Đạo hàm theo hướng','D_u f(x)=∇f(x)·u, ||u||=1','Đạo hàm theo hướng đo tốc độ thay đổi khi đi theo u.','Nó nối dot product ở C01 với gradient trong tối ưu.','Dùng để kiểm hướng di chuyển có làm loss giảm không.','Hướng u có cùng hay ngược gradient?'),
      S('Scale ảnh hưởng gradient','x_i scale lớn ⇒ gradient khó cân','Gradient phụ thuộc thang đo biến và feature.','Feature chưa chuẩn hóa có thể làm descent zigzag hoặc chậm.','Dùng để giải thích vì sao cần normalize trước training.','Feature nào đang làm gradient lệch scale?'),
      S('Gradient của loss tuyến tính','∇_w MSE = (2/m)X^T(Xw-y)','Gradient nói mỗi trọng số w cần sửa thế nào để giảm lỗi.','Công thức này là trái tim của hồi quy tuyến tính bằng gradient descent.','Dùng trong ML baseline và kiểm đạo hàm.','Dấu gradient đang yêu cầu tăng hay giảm trọng số?'),
      S('Gradient bằng 0','∇f=0','Điểm dừng có thể là cực tiểu, cực đại hoặc điểm yên ngựa.','Không được thấy gradient 0 là vội kết luận tối ưu tốt.','Dùng trong kiểm hội tụ và phân tích loss landscape.','Điểm dừng này là loại gì?'),
      S('Mini case linear model','ŷ=Xw, J=mean((ŷ-y)^2)','Gradient theo w cho biết trọng số nào đang chịu trách nhiệm nhiều nhất cho sai số.','Khi feature tương quan mạnh, gradient có thể trộn tín hiệu giữa các trọng số.','Dùng trong hồi quy và sensor feature.','Có đa cộng tuyến làm gradient khó đọc không?'),
      S('Lỗi thường gặp','gradient direction depends on metric','Gradient là hướng tăng nhanh nhất theo metric mặc định.','Nếu biến có đơn vị khác nhau, hướng gradient có thể không phải hướng tốt thực tế.','Dùng khi cần preconditioning hoặc chuẩn hóa.','Metric của không gian tham số đã hợp lý chưa?'),
      S('Checklist gradient','value + norm + direction + scale','Không chỉ xem gradient có tồn tại; cần xem độ lớn, hướng và scale.','Gradient quá lớn, quá nhỏ hoặc lệch scale đều là tín hiệu cần xử lý.','Dùng trong debug training loop.','Gradient norm có đang nổ hoặc biến mất không?'),
      S('Chốt §3.3','negative gradient = hướng giảm nhanh','Gradient biến đạo hàm thành vector điều hướng trong không gian nhiều chiều.','Bài sau dùng hướng này để tạo vòng lặp gradient descent.','Dùng làm la bàn cho tối ưu.','Bước đi dài bao nhiêu là vừa?')
    ],
    '§3.4 · Gradient descent và learning rate':[
      S('Gradient descent là vòng lặp sửa sai','θ_{k+1}=θ_k-α∇J(θ_k)','Ta đo loss, tính gradient, rồi đi ngược hướng tăng loss.','Mỗi bước nhỏ là một chỉnh sửa tham số có hướng.','Dùng trong hồi quy, neural network, nhận dạng hệ thống.','Dấu trừ trong cập nhật có đúng không?'),
      S('Learning rate là độ dài bước','α > 0','α quyết định mỗi lần đi bao xa trên bề mặt loss.','Quá nhỏ thì chậm, quá lớn thì dao động hoặc diverge.','Dùng trong mọi optimizer gradient-based.','Loss đang giảm đều hay nhảy loạn?'),
      S('Loss history là đồng hồ đo','J_0,J_1,...','Không theo dõi loss thì không biết thuật toán học hay tự đốt nhiên liệu.','Đường loss cho thấy chậm, ổn, dao động hoặc kẹt.','Dùng để debug training trước khi đổi model.','Bạn có plot loss theo epoch chưa?'),
      S('Chuẩn hóa giúp hội tụ','x_scaled=(x-μ)/σ','Feature scale lệch làm bề mặt loss méo và gradient descent zigzag.','Normalize giúp bước gradient cân hơn giữa các chiều.','Dùng trước training tuyến tính và neural network.','Feature nào chưa được chuẩn hóa?'),
      S('Batch và mini-batch','g≈(1/B)Σ∇J_i','Mini-batch dùng xấp xỉ gradient từ một phần dữ liệu.','Nó giảm chi phí nhưng thêm nhiễu, đôi khi giúp thoát vùng xấu.','Dùng trong training ML thực tế.','Batch size đang làm gradient quá nhiễu hay quá tốn?'),
      S('Hội tụ không chỉ là loss thấp','|J_k-J_{k-1}|<ε','Dừng khi loss ít đổi, gradient nhỏ hoặc hết ngân sách tính toán.','Cần kiểm validation để tránh học thuộc train.','Dùng trong early stopping và kiểm soát overfit.','Loss train giảm nhưng validation có tăng không?'),
      S('Mini case fit đường thẳng','ŷ=ax+b','Gradient descent chỉnh a,b để đường dự đoán ôm dữ liệu tốt hơn.','Learning rate phù hợp làm đường tiến dần; quá lớn làm đường nhảy loạn.','Dùng để học tối ưu trước neural network.','Nếu a dao động đổi dấu liên tục thì α có quá lớn không?'),
      S('Lỗi thường gặp','wrong sign, bad α, no normalization','Nhầm dấu cập nhật, chọn α theo cảm tính, không chuẩn hóa và không log loss là combo cháy bếp.','Nhiều lỗi tưởng do model nhưng thật ra do optimizer.','Dùng làm checklist debug training.','Trước khi đổi model, đã kiểm optimizer chưa?'),
      S('Checklist training loop','forward → loss → backward → step → log','Một training loop tối thiểu phải có dự đoán, loss, gradient, cập nhật và ghi log.','Thiếu một mắt xích là học mù trong sương số học.','Dùng trong mọi mô hình từ tuyến tính đến deep learning.','Bạn có reset gradient đúng lúc không?'),
      S('Chốt §3.4','descent = direction + step + feedback','Gradient cho hướng, learning rate cho bước, loss history cho phản hồi.','Bài sau hỏi loss và cực trị nói gì về mục tiêu tối ưu.','Dùng làm nền cho optimizer hiện đại.','Loss nhỏ có thật sự là hệ tốt không?')
    ],
    '§3.5 · Hàm mất mát, cực trị và điều kiện tối ưu':[
      S('Loss biến mục tiêu thành số','J(θ)=loss(f(x;θ),y)','Loss đo mô hình sai bao nhiêu và cho optimizer thứ để giảm.','Loss tốt phải phản ánh đúng mục tiêu kỹ thuật, không chỉ đẹp trên giấy.','Dùng trong training, calibration, điều khiển tối ưu.','Loss này có khớp yêu cầu thật không?'),
      S('MSE và MAE','MSE=(1/m)Σe_i^2, MAE=(1/m)Σ|e_i|','MSE phạt lỗi lớn mạnh, MAE bền hơn với outlier.','Chọn loss là chọn đạo đức phạt lỗi của mô hình.','Dùng trong hồi quy và dữ liệu cảm biến nhiễu.','Outlier là lỗi đo hay tình huống quan trọng?'),
      S('Cross entropy','CE=-Σ y log p','Cross entropy phạt dự đoán xác suất sai một cách mạnh.','Nó phù hợp khi đầu ra là xác suất lớp.','Dùng trong classification và anomaly labels.','Xác suất model có được calibration không?'),
      S('Điểm dừng','∇J(θ*)=0','Gradient bằng 0 chỉ nói không có hướng giảm tuyến tính ngay tại điểm đó.','Điểm dừng có thể là cực tiểu, cực đại hoặc saddle.','Dùng trong phân tích tối ưu.','Đây là cực tiểu hay điểm yên ngựa?'),
      S('Hessian đọc độ cong','H=∇²J','Hessian cho biết bề mặt cong lên, cong xuống hoặc cong hỗn hợp.','Độ cong ảnh hưởng mạnh đến learning rate và hội tụ.','Dùng trong Newton, second-order methods, phân tích saddle.','H có positive definite không?'),
      S('Local và global minimum','J(θ_local)≤nearby, J(θ_global)≤all','Cực tiểu cục bộ tốt quanh nó nhưng chưa chắc tốt nhất toàn cục.','Deep learning thường sống với nghiệm đủ tốt hơn là nghiệm hoàn hảo.','Dùng để đặt kỳ vọng tối ưu thực tế.','Nghiệm đủ tốt trên validation chưa?'),
      S('Validation loss','train loss ↓, val loss ↑','Loss train thấp nhưng validation tăng là dấu hiệu overfitting.','Mục tiêu không phải học thuộc dữ liệu cũ mà dự đoán tốt dữ liệu mới.','Dùng trong early stopping và model selection.','Bạn đang tối ưu train hay tối ưu khả năng tổng quát?'),
      S('Mini case loss cảm biến','MSE vs Huber vs MAE','Dữ liệu cảm biến có outlier cần loss bền hơn MSE thuần.','Huber có thể cân bằng giữa mượt và robust.','Dùng trong predictive maintenance và tracking.','Loss nào phản ánh cái giá kỹ thuật của sai số?'),
      S('Lỗi thường gặp','low loss ≠ safe system','Loss nhỏ có thể che lỗi hiếm nhưng nguy hiểm.','Cần thêm metric về an toàn, trễ, năng lượng, ràng buộc và worst-case.','Dùng khi đưa mô hình vào hệ thật.','Metric nào không được loss hiện tại nhìn thấy?'),
      S('Chốt §3.5','loss = objective + assumptions + risk','Loss là la bàn tối ưu, nhưng la bàn sai vẫn dẫn đi sai rất tự tin.','Bài sau dùng chain rule/backprop để tính gradient cho loss trong mô hình nhiều tầng.','Dùng làm chuẩn trước khi train.','Bạn đang tối ưu điều cần tối ưu hay điều dễ đo?')
    ],
    '§3.6 · Từ gradient sang backpropagation và tối ưu ML':[
      S('Backprop là chain rule có tổ chức','dJ/dw = dJ/da · da/dz · dz/dw','Backprop tính gradient của loss theo tham số sâu trong mô hình nhiều tầng.','Nó không phải phép màu; chỉ là quy tắc dây chuyền được tự động hóa.','Dùng trong neural network và autograd.','Gradient cần đi qua những phép toán nào?'),
      S('Forward lưu dấu vết','x → z1 → a1 → z2 → ŷ → J','Forward pass tạo dự đoán và lưu intermediate values.','Backward cần các giá trị này để tính đạo hàm đúng.','Dùng trong PyTorch, TensorFlow, autograd engine.','Bạn có vô tình detach hoặc xóa graph không?'),
      S('Backward truyền gradient','dJ/dŷ → dJ/dz2 → dJ/dW2 → dJ/da1 → dJ/dW1','Sai số không đi ngược; gradient của sai số đi ngược.','Mỗi layer nhận trách nhiệm của nó đối với loss.','Dùng để hiểu training mạng nhiều lớp.','Layer nào có gradient gần 0?'),
      S('Optimizer dùng gradient','w ← w - α dJ/dw','Backprop chỉ tính gradient; optimizer quyết định bước cập nhật.','SGD, Momentum, RMSProp, Adam khác nhau ở cách dùng lịch sử gradient.','Dùng trong training loop ML.','Bạn đang debug gradient hay debug optimizer?'),
      S('Vanishing gradient','||∂J/∂W_early||≈0','Gradient lớp đầu quá nhỏ làm các lớp đầu học rất chậm.','Activation bão hòa, mạng sâu và khởi tạo kém có thể gây lỗi này.','Dùng khi mô hình không học dù loss có vẻ chạy.','Gradient norm từng lớp có được log không?'),
      S('Exploding gradient','||grad|| rất lớn','Gradient quá lớn làm cập nhật nhảy loạn hoặc NaN.','Cần giảm learning rate, chuẩn hóa, clipping hoặc đổi kiến trúc.','Dùng khi loss thành NaN hoặc dao động dữ dội.','Có cần gradient clipping không?'),
      S('Mini case sensor fault net','x → hidden → fault probability','Vector cảm biến đi qua lớp ẩn để dự đoán xác suất lỗi.','Backprop sửa cả feature extractor và classifier cùng lúc.','Dùng trong predictive maintenance và anomaly detection.','Layer đầu có học đặc trưng hữu ích không?'),
      S('Training loop chuẩn','zero_grad → forward → loss → backward → step','Quên zero_grad hoặc sai thứ tự là lỗi phổ biến.','Loop đúng giúp gradient không bị cộng dồn ngoài ý muốn.','Dùng trong PyTorch và các framework tương tự.','Bạn gọi zero_grad ở đúng vị trí chưa?'),
      S('Log để không học mù','loss + val_metric + grad_norm + lr','Không log gradient và learning rate thì khó biết mô hình hỏng ở đâu.','Quan sát đúng biến giúp sửa nhanh hơn đổi model bừa.','Dùng trong mọi project train nghiêm túc.','Log nào sẽ báo lỗi sớm nhất?'),
      S('Chốt §3.6','backprop computes gradients, optimizer uses them','Backprop tính gradient hiệu quả, optimizer dùng gradient để bước trên loss landscape.','C03 khép lại cầu từ hàm, đạo hàm, gradient đến training ML thực tế.','Dùng làm nền cho tối ưu nâng cao và học sâu.','Khi train lỗi, bạn kiểm data, loss, gradient hay optimizer trước?')
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
  function hideOtherDecks(){Array.prototype.slice.call(document.querySelectorAll('.e132-overlay-deck:not(.e191-c03-deck)')).forEach(function(n){n.classList.remove('open');});}
  function ensureDeck(){
    if(deck)return deck;
    deck=document.createElement('section');
    deck.className='e132-overlay-deck e132-compact-only-deck e191-c03-deck';
    deck.setAttribute('role','dialog');
    deck.setAttribute('aria-label','E191 C03 Compact Slideshow');
    deck.innerHTML='<div class="e132-deck-bg"></div><header class="e132-cleanbar"><div><b>E191 C03 Compact Deck</b><span data-e191-count>Slide</span><span data-e191-mode-label>Mức B · compact</span></div><nav><button data-e191-prev type="button">‹</button><button data-e191-next type="button">›</button><button data-e191-exit type="button">Thoát</button></nav></header><div class="e132-clean-progress"><span></span></div><main class="e132-clean-stage" data-e191-stage></main><footer class="e132-clean-hint">← → / Space để chuyển slide · Esc để thoát · C03 deck pack mức B</footer>';
    document.body.appendChild(deck);
    deck.addEventListener('click',function(e){var t=e.target.closest('[data-e191-prev],[data-e191-next],[data-e191-exit]');if(!t)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(t.hasAttribute('data-e191-prev'))move(-1);if(t.hasAttribute('data-e191-next'))move(1);if(t.hasAttribute('data-e191-exit'))closeDeck();},true);
    return deck;
  }
  function render(){
    if(!deck)return;idx=clamp(idx);deck.setAttribute('data-mode','compact');deck.setAttribute('data-tone','compact');deck.setAttribute('data-release',RELEASE);
    var s=model[idx], cards=s?cardsFor(s):[];
    deck.querySelector('[data-e191-count]').textContent=String(idx+1).padStart(2,'0')+' / '+String(model.length).padStart(2,'0')+' · 4 cards';
    deck.querySelector('[data-e191-mode-label]').textContent='Mức B · compact';
    deck.querySelector('.e132-clean-progress span').style.width=((idx+1)/model.length*100)+'%';
    deck.querySelector('[data-e191-stage]').innerHTML='<section class="e132-clean-slide"><aside class="e132-clean-side"><span class="e132-clean-role">C03</span><strong>'+String(idx+1).padStart(2,'0')+'</strong><small>'+esc(currentLessonKey||'C03')+'</small></aside><article class="e132-clean-main"><h1>'+esc(s.title)+'</h1><div class="e132-clean-grid">'+cards.map(cardHtml).join('')+'</div><div class="e132-formula-rail"><b>Công thức slide</b><code>'+esc(s.formula)+'</code></div></article></section>';
  }
  function openDeck(){readModel();if(!model.length){return original&&original.openDeck?original.openDeck():false;}ensureDeck();hideOtherDecks();document.body.classList.add('e132-overlay-open');deck.classList.add('open');render();return true;}
  function closeDeck(){var st=state();st.e129Present=false;save();document.body.classList.remove('e132-overlay-open','e129-presenting');if(deck)deck.classList.remove('open');try{if(window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_THEORY_E129.render)window.BAUMAN_MATH_THEORY_E129.render();}catch(_){} }
  function move(delta){idx=clamp(idx+delta);render();}
  function enhance(){if(isPresenting()){readModel();if(model.length){openDeck();return true;}}if(deck)deck.classList.remove('open');return false;}
  document.addEventListener('keydown',function(e){if(!deck||!deck.classList.contains('open'))return;if(['ArrowRight','PageDown',' ','Enter','ArrowLeft','PageUp','Escape','c','C','f','F'].indexOf(e.key)<0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '||e.key==='Enter')move(1);if(e.key==='ArrowLeft'||e.key==='PageUp')move(-1);if(e.key==='Escape')closeDeck();if(e.key==='c'||e.key==='C'||e.key==='f'||e.key==='F')render();},true);
  var obs=new MutationObserver(function(){setTimeout(enhance,0);});
  function boot(){try{obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(_){}enhance();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E191_C03_DECK_PACK={release:RELEASE,enhance:enhance,openDeck:openDeck,closeDeck:closeDeck,decks:Object.keys(DECKS),selfCheck:function(){return {ok:true,release:RELEASE,decks:Object.keys(DECKS).length,lesson:currentLessonKey,slides:model.length,currentIndex:idx};}};
  window.BAUMAN_MATH_THEORY_E132=Object.assign({},original||{}, {release:(original&&original.release)||'E132_WITH_E191_C03_PACK',enhance:function(){var handled=enhance();if(handled)return true;return original&&original.enhance?original.enhance():false;},openDeck:function(){var handled=openDeck();if(handled)return true;return original&&original.openDeck?original.openDeck():false;},closeDeck:closeDeck,setMode:function(){render();return 'compact';}});
})();
