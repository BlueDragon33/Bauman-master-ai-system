'use strict';
(function(root){
  const SCHEMA='RUSSIAN_VISUAL_VOCABULARY_RUNTIME_V1';
  const CYR=/[А-Яа-яЁё]/;

  const clean=v=>String(v??'').trim();
  const nonEmpty=v=>Array.isArray(v)?v.length>0:clean(v)!=='';
  const first=(row,fields)=>{for(const field of fields){if(nonEmpty(row?.[field]))return {field,value:row[field]};}return {field:'',value:''};};
  const firstRussian=(row,fields)=>{
    for(const field of fields){
      const value=row?.[field];
      const text=Array.isArray(value)?value.join(' · '):clean(value);
      if(text&&CYR.test(text))return {field,value:text};
    }
    return {field:'',value:''};
  };

  function describe(row){
    row=row||{};
    const term=clean(row.ru||row.phrase_ru||row.front||row.word);
    const pron=clean(row.pronunciation||row.pron||row.transcription);

    const image=first(row,['image','image_url','picture','illustration','illustration_url']);
    const emoji=first(row,['image_emoji','emoji','pictogram','gesture']);
    const scene=first(row,['scene','scene_id']);
    const label=firstRussian(row,['illustration_label_ru','visual_label','semantic_label']);
    const definition=firstRussian(row,['meaning_ru','definition_ru','definition','meaning']);
    const context=firstRussian(row,['example_ru','context_ru','voice_text','example']);
    const audio=first(row,['audio','audio_url','voice','voice_url']);
    const visualReady=Boolean(image.field||emoji.field||scene.field);

    const sourceFields=[image.field,emoji.field,scene.field,label.field,definition.field,context.field,audio.field].filter(Boolean);
    return Object.freeze({
      schema:SCHEMA,
      term_ru:term,
      pronunciation:pron,
      semantic_status:visualReady?'ready':'missing_visual_semantics',
      image_url:image.field?clean(image.value):'',
      visual_symbol:emoji.field?clean(emoji.value):'',
      scene:scene.field?clean(scene.value):'',
      visual_label_ru:label.value,
      definition_ru:definition.value,
      context_ru:context.value,
      audio_url:audio.field?clean(audio.value):'',
      audio_text_ru:context.value||term,
      source_fields:Object.freeze([...sourceFields])
    });
  }

  root.RussianVisualVocabularyRuntime=Object.freeze({
    schema:SCHEMA,
    describe
  });
})(typeof window!=='undefined'?window:globalThis);
