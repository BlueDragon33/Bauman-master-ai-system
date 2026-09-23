'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER=window.SUBJECT_ADAPTER||{};
  const acute=/\u0301/;
  const cyr=/[А-Яа-яЁё]/;
  const latin=/[A-Za-z]/;
  const clean=v=>String(v??'').trim();
  const arr=v=>Array.isArray(v)?v:[];
  const first=(item,keys)=>{for(const key of keys){const value=item?.[key];if(value!==undefined&&value!==null&&value!==''&&(Array.isArray(value)?value.length:true))return value;}return '';};
  const TERM_KEYS=['ru','phrase_ru','front','word','term'];
  const STRESSED_TERM_KEYS=['stressed_ru','stressed','accented_ru','accented'];
  const PRON_KEYS=['pronunciation','pron','transcription','ipa','phonetic'];
  const AUDIO_KEYS=['audio','audio_url','audioUrl','voice_url','voice'];

  function normalizeVocab(item={}){
    const term=clean(first(item,TERM_KEYS));
    const explicitStressed=clean(first(item,STRESSED_TERM_KEYS));
    const usableStressed=explicitStressed&&cyr.test(explicitStressed)?explicitStressed:'';
    const displayTerm=acute.test(term)?term:(usableStressed||term);
    const hasMarkedStress=acute.test(displayTerm);
    const hasYo=/[Ёё]/.test(displayTerm);
    const transliteration=clean(first(item,PRON_KEYS));
    const audio=clean(first(item,AUDIO_KEYS));
    const meaningVi=clean(item?.meaning_vi||item?.vi_vi||item?.meaning_vietnamese||'');
    const legacyVi=clean(item?.vi||'');
    const legacyViLooksEnglish=legacyVi&&/^[A-Za-z0-9 ,;:'"()!?./\-]+$/.test(legacyVi);
    const english=clean(item?.clue_en||item?.en||(legacyViLooksEnglish?legacyVi:''));
    const meaningRu=clean(item?.meaning_ru||item?.meaning||item?.definition||'');
    const partOfSpeech=clean(item?.part_of_speech||item?.partOfSpeech||item?.pos||item?.word_type||'');
    const forms=item?.forms||item?.inflections||item?.declension||item?.conjugation||null;
    const example=clean(item?.example||item?.voice_text||item?.usage||item?.example_ru||'');
    const stressStatus=hasMarkedStress?'marked':hasYo?'yo_cue':'missing';
    return {
      id:clean(item?.id||item?.source_id||''),
      term,
      displayTerm,
      stressStatus,
      stressSource:hasMarkedStress?'source_mark':hasYo?'orthographic_yo':'missing',
      transliteration,
      pronunciationKind:transliteration&&latin.test(transliteration)?'latin_transliteration':transliteration?'source_transcription':'missing',
      audio,
      audioKind:audio?'source_audio':'app_tts',
      meaningVi,
      english,
      meaningRu,
      partOfSpeech,
      forms,
      example,
      stage:clean(item?.stage||''),
      tags:arr(item?.tags),
      raw:item
    };
  }

  A.contentContract={
    schema:'RUSSIAN_CONTENT_CONTRACT_V1',
    vocabulary:{
      term:'Russian orthography from source data',
      stress:'Only explicit source marks are canonical; never infer stress from Latin transliteration',
      pronunciation:'Current pronunciation field is treated as Latin transliteration unless the source says otherwise',
      audio:'Source audio when present; otherwise app/browser Russian TTS is only a listening aid',
      mastery:'Content metadata must not modify canonical learning mastery'
    }
  };
  A.normalizeVocab=normalizeVocab;
  A.vocabTerm=item=>normalizeVocab(item).displayTerm;
  A.vocabPron=item=>normalizeVocab(item).transliteration;
  A.vocabSearchText=item=>{
    const v=normalizeVocab(item);
    return [v.term,v.displayTerm,v.transliteration,v.meaningVi,v.english,v.meaningRu,v.example,v.partOfSpeech,v.stage,v.tags.join(' ')].filter(Boolean).join(' ');
  };
  A.speech=A.speech||{};
  A.speech.lang='ru-RU';
  A.speech.textForVocab=item=>normalizeVocab(item).term;
  if(A.ui?.vocabLabels)A.ui.vocabLabels.pron='Phiên tự Latin';
  if(A.dataSourceMeta?.curriculum)A.dataSourceMeta.curriculum.plannedCount=6;

  function esc(value){return clean(value).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function stressMessage(term){
    if(acute.test(term))return {tone:'ok',label:'Đã đánh dấu',detail:'Dấu trọng âm có trong dữ liệu nguồn; ưu tiên đọc theo dấu và kiểm tra lại bằng nút Nghe.'};
    if(/[Ёё]/.test(term))return {tone:'partial',label:'Có tín hiệu ё',detail:'Nguồn chưa đánh dấu trọng âm đầy đủ cho cả cụm. Chữ ё là tín hiệu hữu ích; các từ còn lại vẫn cần nghe mẫu.'};
    return {tone:'missing',label:'Chưa có dữ liệu chuẩn',detail:'Nguồn hiện không mã hóa trọng âm. Hệ thống không tự đoán; hãy dùng nút Nghe và không học trọng âm từ phiên tự Latin.'};
  }
  function enhanceVocabCard(){
    const panel=document.querySelector('.vocab-card-panel,.v1310-vocab-main');
    if(!panel||panel.querySelector('[data-ru-content-contract]'))return;
    const term=clean(panel.querySelector('.v1310-vocab-top h3,.term')?.textContent);
    if(!term)return;
    let translit=clean(panel.querySelector('.v1310-pron')?.textContent||panel.querySelector('.v1310-vocab-top small')?.textContent);
    if(/Bấm .*lật nghĩa/i.test(translit))translit='';
    const stress=stressMessage(term);
    const box=document.createElement('section');
    box.className='ru-language-contract';
    box.dataset.ruContentContract='v1';
    box.innerHTML=`<div class="ru-language-contract-row"><span>Chữ viết</span><b lang="ru">${esc(term)}</b></div><div class="ru-language-contract-row stress ${esc(stress.tone)}"><span>Trọng âm</span><b>${esc(stress.label)}</b><small>${esc(stress.detail)}</small></div><div class="ru-language-contract-row"><span>Phiên tự Latin</span><b>${esc(translit||'Chưa có')}</b><small>Chỉ hỗ trợ nhận mặt ban đầu; không dùng thay cho trọng âm hay âm thực tế.</small></div><div class="ru-language-contract-row"><span>Âm thực tế</span><b>Dùng nút 🔊 Nghe</b><small>Nghe trước, nhại lại, rồi đối chiếu chữ viết. Không suy âm chỉ từ phiên tự Latin.</small></div>`;
    const flash=panel.querySelector('.flash,.v1310-flash');
    if(flash?.parentNode)flash.parentNode.insertBefore(box,flash.nextSibling);else panel.appendChild(box);
  }
  function enhance(){
    if((document.body?.dataset?.ruContentContract||'')!=='v1')document.body.dataset.ruContentContract='v1';
    enhanceVocabCard();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
  window.RussianContentContract={normalizeVocab,stressMessage,enhance,schema:'RUSSIAN_CONTENT_CONTRACT_V1'};
})();
