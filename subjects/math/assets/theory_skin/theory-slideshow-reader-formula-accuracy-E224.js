/* E229 Reader Pro formula modal accuracy bridge. Parser fix only, not a slideshow engine. */
(function(){
  'use strict';
  var RELEASE='E229_READER_PRO_FORMULA_SPLIT_AUDIT_AND_FIX';
  var patching=false;
  var NOTE_STARTERS=[
    'neu','hoac','voi','trong do','khi','day la','moi','dieu kien','chi co nghiem','co nghiem',
    'a va','b va','c va','nhan xet','luu y'
  ];

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');}
  function compact(s){return String(s||'').replace(/\s+/g,' ').trim();}
  function clean(s){return String(s||'').replace(/\r/g,'\n').replace(/[ \t]+/g,' ').replace(/\n{2,}/g,'\n').trim();}
  function isBoundaryBefore(text,i){return i<=0 || /[\s([{;:]/.test(text.charAt(i-1));}
  function prevNonSpace(text,i){for(var j=i-1;j>=0;j--)if(!/\s/.test(text.charAt(j)))return text.charAt(j);return '';}
  function prevWord(text,i){
    var left=text.slice(0,i).replace(/\s+$/,'');
    var m=left.match(/([A-Za-zÀ-ỹ]+)$/);
    return m?norm(m[1]):'';
  }
  function noteStarterAt(text,i){
    if(!isBoundaryBefore(text,i))return '';
    var t=norm(text.slice(i,i+28));
    for(var k=0;k<NOTE_STARTERS.length;k++)if(t.indexOf(NOTE_STARTERS[k])===0)return NOTE_STARTERS[k];
    return '';
  }
  function depthAt(text,idx){
    var round=0, square=0, brace=0, normOpen=false;
    for(var i=0;i<idx;i++){
      var c=text.charAt(i), two=text.slice(i,i+2);
      if(two==='||'){normOpen=!normOpen;i++;continue;}
      if(normOpen)continue;
      if(c==='(')round++;
      else if(c===')'&&round>0)round--;
      else if(c==='[')square++;
      else if(c===']'&&square>0)square--;
      else if(c==='{')brace++;
      else if(c==='}'&&brace>0)brace--;
    }
    return round+square+brace+(normOpen?1:0);
  }
  function topLevelEqualsIndex(text,limit){
    var round=0, square=0, brace=0, normOpen=false, max=Math.min(text.length,limit||120);
    for(var i=0;i<max;i++){
      var c=text.charAt(i), two=text.slice(i,i+2);
      if(two==='||'){normOpen=!normOpen;i++;continue;}
      if(normOpen)continue;
      if(c==='=' && round===0 && square===0 && brace===0)return i;
      if(c==='(')round++;
      else if(c===')'&&round>0)round--;
      else if(c==='[')square++;
      else if(c===']'&&square>0)square--;
      else if(c==='{')brace++;
      else if(c==='}'&&brace>0)brace--;
    }
    return -1;
  }
  function topLevelRelation(text,limit){
    var round=0, square=0, brace=0, normOpen=false, max=Math.min(text.length,limit||120);
    for(var i=0;i<max;i++){
      var c=text.charAt(i), two=text.slice(i,i+2);
      if(two==='||'){normOpen=!normOpen;i++;continue;}
      if(normOpen)continue;
      if(round===0 && square===0 && brace===0){
        if(two==='>='||two==='<=')return {idx:i,op:two};
        if(c==='=')return {idx:i,op:'='};
        if(c==='>'||c==='<')return {idx:i,op:c};
      }
      if(c==='(')round++;
      else if(c===')'&&round>0)round--;
      else if(c==='[')square++;
      else if(c===']'&&square>0)square--;
      else if(c==='{')brace++;
      else if(c==='}'&&brace>0)brace--;
    }
    return {idx:-1,op:''};
  }
  function formulaHeadLike(head){
    return /^\|\|.{1,80}\|\|[^\s=<>]{0,16}\s*(?:=|>=|<=|>|<)$/.test(head) ||
      /^[A-Za-z](?:[\w{}_^'*-]|\s*[·⋅]\s*|\([^)]{0,80}\)|\[[^\]]{0,80}\]){0,90}\s*(?:=|>=|<=|>|<)$/.test(head) ||
      /^(?:D_[A-Za-z0-9]+\s+f\([^)]{0,80}\)|grad\s+[A-Za-z]\([^)]{0,80}\)|d[A-Za-z0-9]+\/d[A-Za-z0-9]+)\s*(?:=|>=|<=|>|<)$/.test(head) ||
      (/^[A-Za-z][A-Za-z0-9_{}^'()\s+\-*.]{0,120}\s*(?:=|>=|<=|>|<)$/.test(head) && /[+]|\.\.\./.test(head)) ||
      /^\([A-Za-z0-9_{}+\-*/\s]+\)(?:_\{?[A-Za-z0-9]+\}?)?\s*(?:=|>=|<=|>|<)$/.test(head);
  }
  function formulaStartAt(text,i){
    if(!isBoundaryBefore(text,i) || depthAt(text,i)>0)return false;
    if(/[·⋅]/.test(prevNonSpace(text,i)))return false;
    if(prevWord(text,i)==='dim')return false;
    if(prevWord(text,i)==='iff')return false;
    if(prevWord(text,i)==='nghiem')return false;
    if(prevNonSpace(text,i)==='=')return false;
    if(prevNonSpace(text,i)==='>'||prevNonSpace(text,i)==='<')return false;
    var tail=text.slice(i), rel=topLevelRelation(tail,120), head=rel.idx>=0?tail.slice(0,rel.idx+rel.op.length):'';
    return (rel.idx>=0 && formulaHeadLike(head)) || /^[A-Za-z][\w{}_^']*\s+in\s+R(?:\^\{[^}]+\}|\^[A-Za-z0-9]+)?/.test(tail);
  }
  function nextFormulaStart(text,start){
    for(var i=start;i<text.length;i++)if(formulaStartAt(text,i))return i;
    return -1;
  }
  function nextBoundary(text,start){
    for(var i=start+1;i<text.length;i++){
      if(depthAt(text,i)>0)continue;
      if(noteStarterAt(text,i))return i;
      if(formulaStartAt(text,i)){
        if(formulaStartAt(text,start) && topLevelRelation(text.slice(start,i),200).idx<0)continue;
        return i;
      }
    }
    return text.length;
  }
  function findBalancedEnd(s,open,close){
    var depth=0;
    for(var i=0;i<s.length;i++){
      var c=s.charAt(i);
      if(c===open)depth++;
      else if(c===close){depth--;if(depth===0)return i+1;}
    }
    return -1;
  }
  function splitTrailing(segment){
    var s=segment.trim(), bracket=s.indexOf('[');
    if(bracket>=0){
      var end=findBalancedEnd(s.slice(bracket),'[',']');
      if(end>0){
        var cut=bracket+end, tail=s.slice(cut).trim();
        if(/^in\s+R/i.test(tail)){
          var m=tail.match(/^in\s+R(?:\^\{[^}]+\}|\^[A-Za-z0-9]+)?/);
          if(m){cut+=m[0].length+1;tail=s.slice(cut).trim();}
        }
        if(tail && /[A-Za-zÀ-ỹ]\s+[A-Za-zÀ-ỹ]/.test(tail))return {formula:s.slice(0,cut).trim(), note:tail};
      }
    }
    var noteIdx=-1;
    var originalStrong=s.search(/\s+ch\u1ec9\s+c\u00f3\s+nghi\u1ec7m\b/i);
    if(originalStrong>0)noteIdx=originalStrong;
    var strongNote=norm(' '+s).search(/\schi\s+co\s+nghiem\b/);
    if(noteIdx<0 && strongNote>0)noteIdx=strongNote-1;
    [' trong do ',' neu ',' khi ',' voi ',' day la ',' moi ',' dieu kien', ' chi co nghiem ', ' co nghiem ', ' la '].forEach(function(mark){
      if(noteIdx>=0)return;
      var idx=norm(' '+s).indexOf(mark);
      if(idx>0)noteIdx=idx-1;
    });
    if(noteIdx>0){
      var formula=s.slice(0,noteIdx).trim(), note=s.slice(noteIdx).trim();
      if(/chi\s*$/.test(norm(formula))){
        var last=formula.match(/\s+(\S+)$/);
        if(last){formula=formula.replace(/\s+\S+\s*$/,'').trim();note=last[1]+' '+note;}
      }
      return {formula:formula,note:note};
    }
    return {formula:s,note:''};
  }
  function noteTitle(s){
    var n=norm(s);
    if(/neu|khi|dieu kien|mau so|khong dung/.test(n))return 'Điều kiện sử dụng';
    if(/co nghiem/.test(n))return 'Điều kiện sử dụng';
    if(/pattern|gan nhau|nhan xet|a va|b va|c va/.test(n))return 'Nhận xét';
    if(/in\s+r|trong do|moi|la|so|dac trung|feature|thanh phan/.test(n))return 'Ý nghĩa ký hiệu';
    return 'Ghi chú';
  }
  function isDefinitionNote(s){
    var n=norm(s);
    if(/^(?:[a-z]|mu|μ)(?:_\{?i\}?|_\{?j\}?|_i|_j)?\s+in\s+R/.test(s))return true;
    return /^[a-z](?:_\{?i\}?|_\{?j\}?|_i|_j)?\s*(?:=|in\s+r)/.test(s) &&
      /(la|so|mau|dac trung|feature|thanh phan|trung binh|don vi)/.test(n);
  }
  function formulaLabel(line,i){
    var raw=String(line||''), n=norm(raw);
    if(/^A\s*=\s*\[/.test(raw))return 'Vector A';
    if(/^B\s*=\s*\[/.test(raw))return 'Vector B';
    if(/^C\s*=\s*\[/.test(raw))return 'Vector C';
    if(/^X\s*=/.test(raw)||/^X\s+in\s+R/i.test(raw))return 'Ma trận dữ liệu X';
    if(/^mu\s*=|^μ\s*=/.test(n))return 'Vector trung bình';
    if(/^cos/.test(n))return 'Cosine similarity';
    if(/^d\s*\(/i.test(raw)||/distance|khoang cach|x-y/.test(n))return 'Khoảng cách Euclid';
    if(/^proj/.test(raw)||/projection|phep chieu/.test(n))return 'Phép chiếu';
    if(/perp/.test(n))return 'Thành phần vuông góc';
    if(/[·⋅]/.test(raw)||/dot|tich vo huong/.test(n))return 'Tích vô hướng';
    if(/^\|\|/.test(raw)||/norm|chuan/.test(n))return 'Chuẩn vector';
    if(/rank|dim|col\(/.test(n))return 'Hạng và không gian con';
    if(/a\^\{-1\}|inverse|nghich dao/.test(n))return 'Nghịch đảo / giải hệ';
    if(/grad|gradient|dj\/d|hessian/.test(n))return 'Gradient / tối ưu';
    if(/sqrt|sum|max|min/.test(n))return 'Biểu thức tính toán';
    if(/matrix|ma tran|ax/.test(n))return 'Công thức ma trận';
    return 'Công thức '+(i+1);
  }
  function pushFormula(items,s,i){
    s=clean(s);
    if(!s)return;
    var parts=splitTrailing(s);
    if(parts.formula){
      parts.formula=stripDanglingFormulaTail(parts.formula);
      if(isDefinitionNote(parts.formula))items.push({title:noteTitle(parts.formula),body:parts.formula,math:false});
      else items.push({title:formulaLabel(parts.formula,i),body:parts.formula,math:true});
    }
    if(parts.note)items.push({title:noteTitle(parts.note),body:parts.note,math:false});
  }
  function pushNote(items,s){
    s=clean(s);
    if(s)items.push({title:noteTitle(s),body:s,math:false});
  }
  function stripDanglingFormulaTail(s){
    s=String(s||'').trim();
    return /\b(?:va|chi)\s*$/.test(norm(s))?s.replace(/\s+\S+\s*$/,'').trim():s;
  }
  function formulaItems(f){
    var text=clean(f).replace(/\n/g,' '), items=[], i=0;
    while(i<text.length){
      while(/\s/.test(text.charAt(i)))i++;
      if(i>=text.length)break;
      if(noteStarterAt(text,i)){
        var fs=nextFormulaStart(text,i+1);
        if(fs>i && fs-i<54){i=fs;continue;}
        if(fs>i){pushNote(items,text.slice(i,fs));i=fs;continue;}
        pushNote(items,text.slice(i));break;
      }
      if(formulaStartAt(text,i)){
        var end=nextBoundary(text,i);
        pushFormula(items,text.slice(i,end),items.length);
        i=end;
        continue;
      }
      var j=i+1;
      while(j<text.length && !formulaStartAt(text,j) && !noteStarterAt(text,j))j++;
      pushNote(items,text.slice(i,j));
      i=j;
    }
    return mergeNotes(items).slice(0,12);
  }
  function mergeNotes(items){
    var out=[];
    items.forEach(function(item){
      var prev=out[out.length-1];
      if(!item.math && prev && !prev.math && prev.title===item.title)prev.body=clean(prev.body+' '+item.body);
      else out.push(item);
    });
    return out.length?out:[{title:'Công thức chính',body:'',math:true}];
  }
  function kind(f){
    var raw=String(f||''), n=norm(raw);
    return {
      norm:/norm|chuan/.test(n)||raw.indexOf('||')>=0,
      dot:/dot|tich vo huong|inner|projection/.test(n)||raw.indexOf('·')>=0||raw.indexOf('⋅')>=0,
      distance:/distance|khoang cach|d x y|x-y/.test(n)||raw.indexOf('x-y')>=0||raw.indexOf('x - y')>=0,
      cosine:/cos|cosine/.test(n),
      gradient:/gradient|grad|nabla|theta|dj\/d|hessian/.test(n)||raw.indexOf('∇')>=0,
      matrix:/matrix|ma tran|ax|linear|tuyen tinh|rank|col\(|x_1\^t|x_c|pca/.test(n),
      vectorExample:/\b[A-Z][A-Za-z0-9]*\s*=\s*\[[^\]]+\]\s+\b[A-Z][A-Za-z0-9]*\s*=\s*\[[^\]]+\]/.test(raw)
    };
  }
  function formatMath(raw){
    var s=esc(String(raw||'').trim());
    s=s.replace(/\\cdot/g,'·').replace(/\\times/g,'×').replace(/\\nabla/g,'∇').replace(/\s\*\s/g,' × ');
    s=s.replace(/sqrt\s*\(([^()]+)\)/g,'√($1)');
    s=s.replace(/\bsum\b/g,'∑').replace(/-&gt;/g,'→').replace(/&gt;=/g,'≥').replace(/&lt;=/g,'≤').replace(/!=/g,'≠').replace(/\biff\b/g,'⇔').replace(/\bin\b/g,'∈');
    s=s.replace(/alpha(?![A-Za-z])/g,'α').replace(/theta(?![A-Za-z])/g,'θ').replace(/Delta(?![A-Za-z])/g,'Δ').replace(/eta(?![A-Za-z])/g,'η').replace(/mu(?![A-Za-z])/g,'μ').replace(/grad(?![A-Za-z])/g,'∇');
    s=s.replace(/\^\{([^}]+)\}/g,'<sup>$1</sup>').replace(/_\{([^}]+)\}/g,'<sub>$1</sub>');
    s=s.replace(/\^([A-Za-z0-9+\-]+)/g,'<sup>$1</sup>').replace(/_([A-Za-z0-9]+)/g,'<sub>$1</sub>');
    return s;
  }
  function box(title,body,pre,extraClass){
    var cls='e211-lesson-box '+(extraClass||'');
    if(pre)return '<article class="'+esc(cls)+'"><h4>'+esc(title)+'</h4><div class="e226-math" data-e226-raw-formula="'+esc(body)+'">'+formatMath(body)+'</div></article>';
    return '<article class="'+esc(cls)+'"><h4>'+esc(title)+'</h4><p>'+esc(body)+'</p></article>';
  }
  function stack(html,extraClass){return '<div class="e211-lesson-stack '+esc(extraClass||'')+'">'+html.join('')+'</div>';}
  function formulaBoxes(f){
    return stack(formulaItems(f).map(function(item){
      return box(item.title,item.body,item.math!==false,'e225-formula-box e226-formula-box '+(item.math===false?'e227-note-box':''));
    }),'e225-formula-stack e226-formula-stack e227-formula-stack e229-formula-stack');
  }
  function analysisBoxes(f){
    var k=kind(f), out=[];
    if(k.vectorExample)out.push(box('Ví dụ vector','Các vector A, B, C là các mẫu dữ liệu nhiều chiều. Mỗi tọa độ biểu diễn một đặc trưng; hai vector gần nhau khi các thành phần tương ứng có xu hướng gần nhau sau cùng thang đo.',false));
    if(k.norm)out.push(box('Chuẩn vector','‖x‖₂ là độ dài Euclid của vector x. Nó gom toàn bộ các thành phần xᵢ thành một độ lớn duy nhất, dùng để đo biên độ hoặc chuẩn hóa vector.',false));
    if(k.dot)out.push(box('Tích vô hướng','x · y = ∑ xᵢyᵢ. Nó đo mức hai vector cùng hướng có xét độ lớn; kết quả bằng 0 khi hai vector trực giao trong không gian Euclid.',false));
    if(k.distance)out.push(box('Khoảng cách','d(x,y) = ‖x-y‖₂ đo độ lệch giữa hai vector cùng chiều. Không dùng được nếu hai vector khác thứ tự thành phần, khác đơn vị hoặc chưa chuẩn hóa cùng kiểu.',false));
    if(k.cosine)out.push(box('Cosine','cos(x,y) = (x · y)/(‖x‖₂‖y‖₂). Đại lượng này tập trung vào hướng tương đồng, ít phụ thuộc vào độ lớn tuyệt đối của vector.',false));
    if(k.gradient)out.push(box('Gradient','Gradient là vector các đạo hàm riêng. Nó chỉ hướng tăng nhanh nhất của hàm; khi tối ưu lỗi, thường cập nhật ngược hướng gradient.',false));
    if(k.matrix)out.push(box('Ma trận','Dạng ma trận gom nhiều phép tính tuyến tính hoặc nhiều mẫu dữ liệu. Điều kiện bắt buộc là kích thước, hàng/cột và quy ước feature phải khớp.',false));
    if(!out.length)out.push(box('Cách đọc','Xác định biến, miền giá trị, đơn vị và giả thiết trước khi thay số. Công thức chỉ có ý nghĩa khi dữ liệu dùng đúng quy ước.',false));
    return stack(out.slice(0,4));
  }
  function applicationBoxes(f){
    var k=kind(f), out=[];
    if(k.vectorExample)out.push(box('Nhận dạng pattern','Ví dụ vector dùng để minh họa so sánh mẫu: A và B có các tọa độ gần nhau hơn C nên có thể cùng nhóm hoặc cùng pattern sau khi chuẩn hóa.',false));
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
    if(k.vectorExample)return 'import numpy as np\n\nA = np.array([100, 40, 0.01], dtype=float)\nB = np.array([110, 44, 0.012], dtype=float)\nC = np.array([20, 300, 0.20], dtype=float)\n\ndef dist(u, v):\n    return np.linalg.norm(u - v)\n\nprint(dist(A, B), dist(A, C))';
    if((k.norm&&k.dot)||k.cosine||k.distance)return 'import numpy as np\n\nx = np.array([1.0, 2.0, 3.0])\ny = np.array([2.0, 0.0, 4.0])\n\nnorm_x = np.linalg.norm(x)\nnorm_y = np.linalg.norm(y)\ndot_xy = float(x @ y)\ndistance_xy = np.linalg.norm(x - y)\ncos_xy = dot_xy / (norm_x * norm_y)';
    if(k.gradient)return 'import numpy as np\n\nx = np.array([1.0, 2.0])\ngrad = np.array([0.4, -0.2])\neta = 0.05\n\nx_next = x - eta * grad';
    if(k.matrix)return 'import numpy as np\n\nA = np.array([[1.0, 2.0], [3.0, 4.0]])\nx = np.array([0.5, 1.5])\n\ny = A @ x';
    return 'import sympy as sp\n\nx = sp.symbols("x")\nexpr = x**2 + 2*x + 1\nresult = sp.simplify(expr)';
  }
  function currentRawFormula(){
    var code=document.querySelector('.e211-reader-pro .e202-formula-strip code') || document.querySelector('.e202-formula-strip code');
    return code ? code.textContent || '' : '';
  }
  function formulaText(modal){
    var fromStrip=currentRawFormula();
    if(fromStrip)return compact(fromStrip);
    var formulaSection=Array.prototype.slice.call(modal.querySelectorAll('section')).filter(function(sec){return /công thức đầy đủ/i.test(sec.textContent||'');})[0];
    var holders=formulaSection?Array.prototype.slice.call(formulaSection.querySelectorAll('[data-e226-raw-formula], pre')):[];
    var txt=holders.map(function(p){return compact(p.getAttribute('data-e226-raw-formula')||p.textContent);}).filter(Boolean).join('\n');
    return txt||compact(formulaSection&&formulaSection.textContent||'');
  }
  function ensureStyle(){
    if(document.getElementById('e229-formula-accuracy-style'))return;
    var css=''
      +'.e211-formula-modal .e225-formula-stack{display:grid!important;gap:14px!important}'
      +'.e211-formula-modal .e225-formula-box{display:block!important;padding:12px 14px 14px!important;border-left:3px solid rgba(251,191,36,.55)!important}'
      +'.e211-formula-modal .e225-formula-box h4{display:block!important;margin:0 0 9px!important;padding-bottom:7px!important;border-bottom:1px solid rgba(251,191,36,.2)!important;color:#fde68a!important;line-height:1.25!important}'
      +'.e211-formula-modal .e225-formula-box + .e225-formula-box{margin-top:2px!important}'
      +'.e211-formula-modal .e226-math{display:block!important;margin:0!important;padding:11px 12px!important;border-radius:10px!important;background:rgba(3,7,18,.42)!important;white-space:normal!important;word-break:normal!important;overflow-wrap:anywhere!important;line-height:1.62!important;color:#fffaf0!important;font-family:Cambria Math,STIX Two Math,Times New Roman,serif!important;font-size:clamp(17px,1.25vw,22px)!important;letter-spacing:.01em!important}'
      +'.e211-formula-modal .e226-math sup{font-size:.7em!important;vertical-align:super!important;line-height:0!important;margin-left:1px!important}'
      +'.e211-formula-modal .e226-math sub{font-size:.7em!important;vertical-align:sub!important;line-height:0!important;margin-left:1px!important}'
      +'.e211-formula-modal .e227-note-box p{display:block!important;margin:0!important;padding:10px 11px!important;border-radius:10px!important;background:rgba(251,191,36,.08)!important;color:#fff7ed!important;line-height:1.55!important}';
    var s=document.createElement('style');
    s.id='e229-formula-accuracy-style';
    s.textContent=css;
    document.head.appendChild(s);
  }
  function patchModal(modal){
    if(!modal || patching)return;
    var f=formulaText(modal);
    if(!f)return;
    if(modal.getAttribute('data-e229-source-formula')===f)return;
    patching=true;
    ensureStyle();
    Array.prototype.slice.call(modal.querySelectorAll('section')).forEach(function(sec){
      var h=compact(sec.querySelector('h3')&&sec.querySelector('h3').textContent);
      if(/công thức đầy đủ/i.test(h))sec.innerHTML='<h3>Công thức đầy đủ</h3>'+formulaBoxes(f);
      else if(/phân tích/i.test(h))sec.innerHTML='<h3>Phân tích công thức</h3>'+analysisBoxes(f);
      else if(/ứng dụng/i.test(h))sec.innerHTML='<h3>Ứng dụng</h3>'+applicationBoxes(f);
      else if(/python/i.test(h))sec.innerHTML='<h3>Cách dùng trong code Python</h3><pre>'+esc(pythonCode(f))+'</pre>';
    });
    modal.setAttribute('data-e224-accuracy','1');
    modal.setAttribute('data-e225-stack','1');
    modal.setAttribute('data-e226-typography','1');
    modal.setAttribute('data-e227-example-split','1');
    modal.setAttribute('data-e229-source-formula',f);
    patching=false;
  }
  function scan(){Array.prototype.slice.call(document.querySelectorAll('.e211-formula-modal')).forEach(patchModal);}
  function boot(){
    scan();
    try{new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});}catch(_){}
    document.addEventListener('click',function(){setTimeout(scan,0);},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E224_FORMULA_ACCURACY={release:RELEASE,apply:scan,split:formulaItems};
})();
