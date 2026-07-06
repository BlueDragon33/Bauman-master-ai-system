/* E226 Reader Pro formula modal accuracy bridge. Formula typography patch, not a slideshow engine. */
(function(){
  'use strict';
  var RELEASE='E226_READER_PRO_FORMULA_TYPOGRAPHY';

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/§/g,'').replace(/[^a-z0-9.]+/g,' ').trim();}
  function compact(s){return String(s||'').replace(/\s+/g,' ').trim();}

  function formulaText(modal){
    var formulaSection=Array.prototype.slice.call(modal.querySelectorAll('section')).filter(function(sec){return /công thức đầy đủ/i.test(sec.textContent||'');})[0];
    var holders=formulaSection?Array.prototype.slice.call(formulaSection.querySelectorAll('[data-e226-raw-formula], pre')):[];
    var txt=holders.map(function(p){return compact(p.getAttribute('data-e226-raw-formula')||p.textContent);}).filter(Boolean).join('\n');
    return txt||compact(formulaSection&&formulaSection.textContent||'');
  }
  function formulaLines(f){
    var raw=String(f||'').replace(/\r/g,'\n');
    var lines=raw.split(/\n+/).map(compact).filter(Boolean);
    if(lines.length<=1&&/[;，]/.test(raw))lines=raw.split(/[;，]/).map(compact).filter(Boolean);
    return lines.length?lines:[compact(raw)].filter(Boolean);
  }
  function kind(f){
    var raw=String(f||''), n=norm(raw);
    return {
      norm:/norm|chuan/.test(n)||raw.indexOf('||')>=0,
      dot:/dot|tich vo huong|inner|projection/.test(n)||raw.indexOf('·')>=0||raw.indexOf('⋅')>=0,
      distance:/distance|khoang cach|d x y|x-y/.test(n)||raw.indexOf('x-y')>=0||raw.indexOf('x - y')>=0,
      cosine:/cos|cosine/.test(n),
      gradient:/gradient|grad|nabla/.test(n)||raw.indexOf('∇')>=0,
      matrix:/matrix|ma tran|ax|linear|tuyen tinh/.test(n)
    };
  }
  function formulaLabel(line,i){
    var raw=String(line||''), n=norm(raw);
    if(/cos|cosine/.test(n))return 'Cosine similarity';
    if(/distance|khoang cach|d x y|x-y/.test(n)||raw.indexOf('x-y')>=0||raw.indexOf('x - y')>=0)return 'Khoảng cách Euclid';
    if(/dot|sum_i x_i y_i|tich vo huong/.test(n)||raw.indexOf('·')>=0||raw.indexOf('⋅')>=0)return 'Tích vô hướng';
    if(/norm|chuan/.test(n)||raw.indexOf('||')>=0)return 'Chuẩn vector';
    if(/gradient|grad|nabla/.test(n)||raw.indexOf('∇')>=0)return 'Gradient';
    if(/matrix|ma tran|ax/.test(n))return 'Công thức ma trận';
    return 'Công thức '+(i+1);
  }
  function formatMath(raw){
    var s=esc(String(raw||'').trim());
    s=s.replace(/\\cdot/g,'·').replace(/\\times/g,'×').replace(/\\nabla/g,'∇').replace(/\\sqrt/g,'sqrt').replace(/\*/g,'×');
    s=s.replace(/\bcos\s*\(/g,'cos(').replace(/\bnorm\s*\(/g,'‖').replace(/\bdot\s*\(/g,'dot(');
    s=s.replace(/sqrt\s*\(([^()]+)\)/g,'√($1)');
    s=s.replace(/sum_\{([^}]+)\}\^\{([^}]+)\}/g,'∑<sub>$1</sub><sup>$2</sup>');
    s=s.replace(/sum_\{([^}]+)\}/g,'∑<sub>$1</sub>');
    s=s.replace(/sum_([A-Za-z0-9=]+)\^([A-Za-z0-9]+)/g,'∑<sub>$1</sub><sup>$2</sup>');
    s=s.replace(/sum_([A-Za-z0-9=]+)/g,'∑<sub>$1</sub>');
    s=s.replace(/\^\{([^}]+)\}/g,'<sup>$1</sup>');
    s=s.replace(/_\{([^}]+)\}/g,'<sub>$1</sub>');
    s=s.replace(/\^([A-Za-z0-9+\-]+)/g,'<sup>$1</sup>');
    s=s.replace(/_([A-Za-z0-9]+)/g,'<sub>$1</sub>');
    s=s.replace(/\|\|([^|]+)\|\|/g,'‖$1‖');
    s=s.replace(/\bpi\b/g,'π').replace(/\balpha\b/g,'α').replace(/\bbeta\b/g,'β').replace(/\bgamma\b/g,'γ').replace(/\blambda\b/g,'λ').replace(/\bsigma\b/g,'σ');
    return s;
  }
  function box(title,body,pre,extraClass){
    var cls='e211-lesson-box '+(extraClass||'');
    if(pre)return '<article class="'+esc(cls)+'"><h4>'+esc(title)+'</h4><div class="e226-math" data-e226-raw-formula="'+esc(body)+'">'+formatMath(body)+'</div></article>';
    return '<article class="'+esc(cls)+'"><h4>'+esc(title)+'</h4><p>'+esc(body)+'</p></article>';
  }
  function stack(html,extraClass){return '<div class="e211-lesson-stack '+esc(extraClass||'')+'">'+html.join('')+'</div>';}

  function formulaBoxes(f){
    return stack(formulaLines(f).map(function(line,i){
      return box(formulaLabel(line,i),line,true,'e225-formula-box e226-formula-box');
    }),'e225-formula-stack e226-formula-stack');
  }
  function analysisBoxes(f){
    var k=kind(f), out=[];
    if(k.norm)out.push(box('Chuẩn vector','‖x‖₂ là độ dài Euclid của vector x. Nó gom toàn bộ các thành phần xᵢ thành một độ lớn duy nhất, dùng để đo biên độ hoặc chuẩn hóa vector.',false));
    if(k.dot)out.push(box('Tích vô hướng','x · y = ∑ xᵢyᵢ. Nó đo mức hai vector cùng hướng có xét độ lớn; kết quả bằng 0 khi hai vector trực giao trong không gian Euclid.',false));
    if(k.distance)out.push(box('Khoảng cách','d(x,y) = ‖x-y‖₂ đo độ lệch giữa hai vector cùng chiều. Không dùng được nếu hai vector khác thứ tự thành phần, khác đơn vị hoặc chưa chuẩn hóa cùng kiểu.',false));
    if(k.cosine)out.push(box('Cosine','cos(x,y) = (x · y)/(‖x‖₂‖y‖₂). Đại lượng này tập trung vào hướng tương đồng, ít phụ thuộc vào độ lớn tuyệt đối của vector.',false));
    if(k.gradient)out.push(box('Gradient','Gradient là vector các đạo hàm riêng. Nó chỉ hướng tăng nhanh nhất của hàm; khi tối ưu lỗi, thường cập nhật ngược hướng gradient.',false));
    if(k.matrix)out.push(box('Ma trận','Dạng ma trận gom nhiều phép tính tuyến tính. Điều kiện bắt buộc là kích thước ma trận và vector phải khớp.',false));
    if(!out.length)out.push(box('Cách đọc','Xác định biến, miền giá trị, đơn vị và giả thiết trước khi thay số. Công thức chỉ có ý nghĩa khi dữ liệu dùng đúng quy ước.',false));
    return stack(out.slice(0,4));
  }
  function applicationBoxes(f){
    var k=kind(f), out=[];
    if(k.distance)out.push(box('So sánh mẫu','Distance dùng để tìm mẫu gần nhất, phát hiện sai lệch cảm biến hoặc đo độ khác nhau giữa hai trạng thái kỹ thuật.',false));
    if(k.cosine||k.dot)out.push(box('Tìm tương đồng','Dot product và cosine dùng trong embedding, tìm kiếm vector, phân loại tín hiệu và kiểm tra hai mẫu có cùng xu hướng hay không.',false));
    if(k.norm)out.push(box('Chuẩn hóa dữ liệu','Norm dùng để đưa vector về cùng thang đo, kiểm soát biên độ và phát hiện vector bất thường.',false));
    if(k.gradient)out.push(box('Tối ưu','Gradient dùng để cập nhật tham số trong học máy, điều khiển tối ưu và bài toán cực trị.',false));
    if(k.matrix)out.push(box('Tính batch','Ma trận giúp xử lý nhiều biến hoặc nhiều mẫu cùng lúc, giảm code lặp và giữ cấu trúc tuyến tính rõ ràng.',false));
    if(!out.length)out.push(box('Ứng dụng','Dùng công thức như phép kiểm tra giữa mô hình toán và dữ liệu thật: đúng chiều, đúng đơn vị và đúng ý nghĩa kỹ thuật.',false));
    return stack(out.slice(0,4));
  }
  function pythonCode(f){
    var k=kind(f);
    if((k.norm&&k.dot)||k.cosine||k.distance){
      return 'import numpy as np\n\nx = np.array([1.0, 2.0, 3.0])\ny = np.array([2.0, 0.0, 4.0])\n\nnorm_x = np.linalg.norm(x)\nnorm_y = np.linalg.norm(y)\ndot_xy = float(x @ y)\ndistance_xy = np.linalg.norm(x - y)\ncos_xy = dot_xy / (norm_x * norm_y)';
    }
    if(k.gradient){
      return 'import numpy as np\n\nx = np.array([1.0, 2.0])\ngrad = np.array([0.4, -0.2])\neta = 0.05\n\nx_next = x - eta * grad';
    }
    if(k.norm){
      return 'import numpy as np\n\nx = np.array([1.0, 2.0, 3.0])\ny = np.array([2.0, 0.0, 4.0])\n\nnorm_x = np.linalg.norm(x)\ndistance_xy = np.linalg.norm(x - y)';
    }
    if(k.dot){
      return 'import numpy as np\n\nu = np.array([1.0, 2.0, 3.0])\nv = np.array([2.0, 0.0, 4.0])\n\ndot_uv = float(u @ v)';
    }
    if(k.matrix){
      return 'import numpy as np\n\nA = np.array([[1.0, 2.0], [3.0, 4.0]])\nx = np.array([0.5, 1.5])\n\ny = A @ x';
    }
    return 'import sympy as sp\n\nx = sp.symbols("x")\nexpr = x**2 + 2*x + 1\nresult = sp.simplify(expr)';
  }
  function ensureStyle(){
    if(document.getElementById('e226-formula-typography-style'))return;
    var css=''
      +'.e211-formula-modal .e225-formula-stack{display:grid!important;gap:14px!important}'
      +'.e211-formula-modal .e225-formula-box{display:block!important;padding:12px 14px 14px!important;border-left:3px solid rgba(251,191,36,.55)!important}'
      +'.e211-formula-modal .e225-formula-box h4{display:block!important;margin:0 0 9px!important;padding-bottom:7px!important;border-bottom:1px solid rgba(251,191,36,.2)!important;color:#fde68a!important;line-height:1.25!important}'
      +'.e211-formula-modal .e225-formula-box + .e225-formula-box{margin-top:2px!important}'
      +'.e211-formula-modal .e226-math{display:block!important;margin:0!important;padding:11px 12px!important;border-radius:10px!important;background:rgba(3,7,18,.42)!important;white-space:normal!important;word-break:normal!important;overflow-wrap:anywhere!important;line-height:1.62!important;color:#fffaf0!important;font-family:Cambria Math,STIX Two Math,Times New Roman,serif!important;font-size:clamp(17px,1.25vw,22px)!important;letter-spacing:.01em!important}'
      +'.e211-formula-modal .e226-math sup{font-size:.7em!important;vertical-align:super!important;line-height:0!important;margin-left:1px!important}'
      +'.e211-formula-modal .e226-math sub{font-size:.7em!important;vertical-align:sub!important;line-height:0!important;margin-left:1px!important}'
      +'.e211-formula-modal .e226-math .frac{display:inline-grid!important;grid-template-rows:auto auto!important;text-align:center!important;vertical-align:middle!important;margin:0 4px!important}'
      +'.e211-formula-modal .e226-math .frac>span:first-child{border-bottom:1px solid currentColor!important;padding:0 4px 2px!important}'
      +'.e211-formula-modal .e226-math .frac>span:last-child{padding:2px 4px 0!important}';
    var s=document.createElement('style');
    s.id='e226-formula-typography-style';
    s.textContent=css;
    document.head.appendChild(s);
  }
  function patchModal(modal){
    if(!modal)return;
    var prev=modal.getAttribute('data-e224-source-formula')||'';
    var f=formulaText(modal);
    if(!f)return;
    if(modal.getAttribute('data-e226-typography')==='1'&&prev===f)return;
    ensureStyle();
    var sections=Array.prototype.slice.call(modal.querySelectorAll('section'));
    sections.forEach(function(sec){
      var h=compact(sec.querySelector('h3')&&sec.querySelector('h3').textContent);
      if(/công thức đầy đủ/i.test(h))sec.innerHTML='<h3>Công thức đầy đủ</h3>'+formulaBoxes(f);
      else if(/phân tích/i.test(h))sec.innerHTML='<h3>Phân tích công thức</h3>'+analysisBoxes(f);
      else if(/ứng dụng/i.test(h))sec.innerHTML='<h3>Ứng dụng</h3>'+applicationBoxes(f);
      else if(/python/i.test(h))sec.innerHTML='<h3>Cách dùng trong code Python</h3><pre>'+esc(pythonCode(f))+'</pre>';
    });
    modal.setAttribute('data-e224-source-formula',f);
    modal.setAttribute('data-e224-accuracy','1');
    modal.setAttribute('data-e225-stack','1');
    modal.setAttribute('data-e226-typography','1');
  }
  function scan(){
    Array.prototype.slice.call(document.querySelectorAll('.e211-formula-modal')).forEach(patchModal);
  }
  function boot(){
    scan();
    try{new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});}catch(_){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E224_FORMULA_ACCURACY={release:RELEASE,apply:scan};
})();