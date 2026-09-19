'use strict';
(function(root){
  const SCHEMA='RUSSIAN_DIALOGUE_SCAFFOLD_V1';
  const CYR=/[А-Яа-яЁё]/;

  const clean=v=>String(v??'').trim();
  const arr=v=>Array.isArray(v)?v:[];
  const firstRussian=(obj,fields)=>{
    for(const field of fields){
      const value=obj?.[field];
      const text=Array.isArray(value)?value.join(' · '):clean(value);
      if(text&&CYR.test(text))return {field,value:text};
    }
    return {field:'',value:''};
  };
  const russianArray=(obj,fields)=>{
    for(const field of fields){
      const values=arr(obj?.[field]).map(clean).filter(x=>x&&CYR.test(x));
      if(values.length)return {field,values};
    }
    return {field:'',values:[]};
  };
  function sceneIcon(dialogue){
    const ruTags=[
      ...arr(dialogue?.communicative_functions_ru),
      ...arr(dialogue?.az_tags).filter(x=>CYR.test(clean(x)))
    ];
    const hay=clean([
      dialogue?.group_ru,dialogue?.context_title_ru,dialogue?.title_ru,dialogue?.purpose_ru,
      dialogue?.goal_ru,dialogue?.scene_ru,dialogue?.situation_ru,...ruTags
    ].filter(Boolean).join(' ')).toLowerCase();
    if(/общеж|комнат|кампус/.test(hay))return '🏢';
    if(/метро|транспорт|дорог|маршрут|вокзал|автобус|такси/.test(hay))return '🚇';
    if(/еда|столов|кафе|ресторан|обед|завтрак|ужин/.test(hay))return '🍽️';
    if(/аптек|врач|больниц|здоров|лекарств/.test(hay))return '🏥';
    if(/паспорт|регистрац|виз|документ|миграц/.test(hay))return '📄';
    if(/магазин|покуп|цен|рубл|касс/.test(hay))return '🛒';
    if(/универс|бауман|заняти|урок|лекци|семинар|экзамен|учеб/.test(hay))return '🎓';
    return '💬';
  }
  function lineText(line){
    const raw=line?.ru??line?.text_ru??line?.text??(typeof line==='string'?line:'');
    const text=clean(raw);
    return CYR.test(text)?text:'';
  }
  function describe(dialogue,line,index=0,role='all'){
    dialogue=dialogue||{};line=line||{};
    const context=firstRussian(dialogue,['context_title_ru','title_ru','scene_ru','situation_ru']);
    const purpose=firstRussian(dialogue,['purpose_ru','goal_ru']);
    const funcs=russianArray(dialogue,['communicative_functions_ru']);
    const seed=russianArray(dialogue,['vocabulary_seed_ru']);
    const ru=lineText(line);
    const lineRole=index%2?'B':'A';
    const mine=role!=='all'&&role===lineRole;
    const roleCue=role==='all'
      ?'Nghe mẫu rồi nhại/đối đáp câu hiện tại'
      :(mine?'Đến lượt bạn nói':'Nghe vai còn lại và chuẩn bị đáp');
    const status=(context.value||purpose.value||funcs.values.length||seed.values.length)?'ready':'missing_dialogue_context';
    return Object.freeze({
      schema:SCHEMA,
      status,
      scene_icon:sceneIcon(dialogue),
      context_ru:context.value,
      purpose_ru:purpose.value||funcs.values.join(' · '),
      vocabulary_seed_ru:Object.freeze(seed.values.slice(0,8)),
      line_ru:ru,
      line_role:lineRole,
      learner_role:role,
      is_learner_turn:mine,
      role_cue:roleCue,
      source_fields:Object.freeze([context.field,purpose.field,funcs.field,seed.field].filter(Boolean))
    });
  }
  root.RussianDialogueScaffold=Object.freeze({schema:SCHEMA,describe});
})(typeof window!=='undefined'?window:globalThis);
