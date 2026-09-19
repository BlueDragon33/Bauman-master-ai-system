'use strict';
(function(root){
  const SCHEMA='RUSSIAN_AI_DIRECT_EXPLANATION_V1';
  const ORDER=['visual_or_scene','russian_definition','russian_context','contrast_or_analogy','optional_meta_help'];
  const clean=v=>String(v??'').trim();
  const has=v=>clean(v)!=='';

  function safeVocab(input={}){
    return {
      term:clean(input.term),
      semanticStatus:clean(input.semanticStatus)||'missing_visual_semantics',
      image:clean(input.image),
      emoji:clean(input.emoji),
      scene:clean(input.scene),
      visualLabelRu:clean(input.visualLabelRu),
      definitionRu:clean(input.definitionRu),
      contextRu:clean(input.contextRu),
      audioTextRu:clean(input.audioTextRu)
    };
  }

  function step(kind,text,extra={}){
    return Object.freeze({kind,text:clean(text),...extra});
  }

  function vocabPlan(context={}){
    const v=safeVocab(context.vocab||{});
    const ready=v.semanticStatus!=='missing_visual_semantics'&&(has(v.image)||has(v.emoji)||has(v.scene)||has(v.visualLabelRu)||has(v.definitionRu)||has(v.contextRu));
    if(!ready){
      return {
        title:'Từ vựng · direct semantic',
        status:'missing_visual_semantics',
        media:{image_url:'',visual_symbol:'',scene:''},
        steps:[
          step('visual_or_scene','missing_visual_semantics'),
          step('russian_definition',''),
          step('russian_context',''),
          step('contrast_or_analogy','Không đoán nghĩa và không chuyển sang bản dịch. Hãy mở thẻ khác hoặc bổ sung bằng chứng trực quan/ngữ cảnh Nga.'),
          step('optional_meta_help','Có thể dùng hướng dẫn tiếng Việt để biết thao tác tiếp theo, nhưng không dùng tiếng Việt/Anh làm đáp án nghĩa của từ.')
        ]
      };
    }
    const visualText=[v.emoji,v.visualLabelRu,v.scene].filter(has).join(' · ')||'Xem hình/scene đang gắn với thẻ này.';
    const definition=v.definitionRu||v.visualLabelRu||v.term;
    const russianContext=v.contextRu||v.audioTextRu||v.term;
    const analogy='Сравните «'+(v.term||'это слово')+'» с похожей ситуацией, предметом или действием, которое уже узнаёте без перевода.';
    return {
      title:'Từ vựng · direct semantic',
      status:'ready',
      media:{image_url:v.image,visual_symbol:v.emoji,scene:v.scene},
      steps:[
        step('visual_or_scene',visualText,{lang:'ru'}),
        step('russian_definition',definition,{lang:'ru'}),
        step('russian_context',russianContext,{lang:'ru'}),
        step('contrast_or_analogy',analogy,{lang:'ru'}),
        step('optional_meta_help','Nếu vẫn chưa rõ, chỉ dùng giải thích meta ngắn về cách quan sát/ngữ cảnh; không thay bằng nghĩa Việt/Anh.')
      ]
    };
  }

  function lessonPlan(context={}){
    const title=clean(context.lessonTitle)||'Текущий урок';
    return {
      title:'Bài học · Russian-first',
      status:'ready',
      media:{image_url:'',visual_symbol:'',scene:''},
      steps:[
        step('visual_or_scene','Bắt đầu từ tình huống, hình, âm thanh hoặc mẫu câu Nga đang có trong bài.'),
        step('russian_definition','Сначала найдите ключевые русские слова и короткие фразы в теме «'+title+'».',{lang:'ru'}),
        step('russian_context','Прослушайте или прочитайте русский пример, затем повторите его вслух.',{lang:'ru'}),
        step('contrast_or_analogy','Сравните два русских примера и найдите, что меняется по смыслу или ситуации.',{lang:'ru'}),
        step('optional_meta_help','Sau khi đã thử hiểu bằng tiếng Nga/ngữ cảnh, có thể dùng giải thích meta ngắn để làm rõ quy tắc hoặc cách học.')
      ]
    };
  }

  function dialoguePlan(context={}){
    const title=clean(context.dialogueTitle)||'ситуация общения';
    return {
      title:'Đối thoại · phản xạ không dịch',
      status:'ready',
      media:{image_url:'',visual_symbol:'',scene:''},
      steps:[
        step('visual_or_scene','Xác định vai, nơi chốn và mục đích của tình huống trước khi nhìn bất kỳ giải thích meta nào.'),
        step('russian_definition','Ситуация: '+title+'. Сначала слушайте и отвечайте коротко по-русски.',{lang:'ru'}),
        step('russian_context','A: задайте короткий вопрос. B: ответьте и уточните одну деталь. Затем поменяйтесь ролями.',{lang:'ru'}),
        step('contrast_or_analogy','Повторите ту же ситуацию с другой деталью: время, место, предмет или просьба.',{lang:'ru'}),
        step('optional_meta_help','Không dùng bản dịch Việt/Anh làm đáp án mặc định; meta-help chỉ giải thích cách thực hiện nếu cần.')
      ]
    };
  }

  function writingPlan(context={}){
    const title=clean(context.writingTitle)||'письменная задача';
    return {
      title:'Viết · từ mẫu Nga tới tự viết',
      status:'ready',
      media:{image_url:'',visual_symbol:'',scene:''},
      steps:[
        step('visual_or_scene','Xác định người nhận, mục đích và dữ kiện cần viết.'),
        step('russian_definition','Задача: '+title+'. Сначала выберите 2–3 знакомые русские конструкции.',{lang:'ru'}),
        step('russian_context','Напишите короткий русский черновик: цель → факт/деталь → вопрос или просьба → завершение.',{lang:'ru'}),
        step('contrast_or_analogy','Сравните черновик с mẫu câu Nga cùng chức năng và sửa cấu trúc, không dịch từng từ.'),
        step('optional_meta_help','Có thể dùng meta-help để nhắc quy tắc ngữ pháp sau khi đã có bản nháp Nga.')
      ]
    };
  }

  function reviewPlan(context={}){
    return {
      title:'Ôn tập · evidence-first',
      status:'ready',
      media:{image_url:'',visual_symbol:'',scene:''},
      steps:[
        step('visual_or_scene','Ôn bằng âm thanh, hình/scene và cue Nga trước.'),
        step('russian_definition','Вспомните русскую форму и значение по контексту, не открывая перевод.',{lang:'ru'}),
        step('russian_context','Скажите или напишите короткий пример по-русски.',{lang:'ru'}),
        step('contrast_or_analogy','Сравните с похожим словом, звуком, буквой или ситуацией, где раньше ошибались.',{lang:'ru'}),
        step('optional_meta_help','Dùng hướng dẫn meta để chọn bài sửa yếu; kết quả AI không tự đổi mastery hay lịch SRS.')
      ]
    };
  }

  function customPlan(context={},prompt=''){
    const p=clean(prompt);
    const base=context.vocab&&clean(context.vocab.term)?vocabPlan(context):lessonPlan(context);
    return {
      ...base,
      title:'AI Mentor · câu hỏi theo ngữ cảnh',
      question:p,
      steps:base.steps.map((row,index)=>index===4
        ?step('optional_meta_help',(p?'Câu hỏi của bạn: '+p+'. ':'')+row.text)
        :row)
    };
  }

  function build(mode,context={},prompt=''){
    let plan;
    if(mode==='vocab')plan=vocabPlan(context);
    else if(mode==='dialogue')plan=dialoguePlan(context);
    else if(mode==='writing')plan=writingPlan(context);
    else if(mode==='review')plan=reviewPlan(context);
    else if(mode==='custom')plan=customPlan(context,prompt);
    else plan=lessonPlan(context);
    return Object.freeze({
      schema:SCHEMA,
      mode:clean(mode)||'lesson',
      explanationOrder:Object.freeze([...ORDER]),
      semanticAuthority:'direct_semantic',
      translationSemanticAuthority:false,
      metaLanguageSecondaryOnly:true,
      title:plan.title,
      status:plan.status,
      media:Object.freeze({...plan.media}),
      question:clean(plan.question),
      steps:Object.freeze(plan.steps.map(x=>Object.freeze({...x})))
    });
  }

  root.RussianAIDirectExplanation=Object.freeze({
    schema:SCHEMA,
    explanationOrder:Object.freeze([...ORDER]),
    build
  });
})(typeof window!=='undefined'?window:globalThis);
