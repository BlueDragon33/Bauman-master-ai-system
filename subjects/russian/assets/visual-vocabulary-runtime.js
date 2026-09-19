'use strict';
(function(root){
  const SCHEMA='RUSSIAN_VISUAL_VOCABULARY_RUNTIME_V1';
  const COMMONS_ENDPOINT='https://commons.wikimedia.org/w/api.php';
  const CYR=/[А-Яа-яЁё]/;
  const memo=new Map();

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
  const stripHtml=v=>clean(v).replace(/<[^>]*>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;/gi,"'").replace(/\s+/g,' ');
  const norm=v=>stripHtml(v).toLowerCase().replace(/^file:/,'').replace(/[^a-zа-яё0-9]+/gi,' ').replace(/\s+/g,' ').trim();
  const tokens=v=>[...new Set(norm(v).split(' ').filter(x=>x.length>=3))];
  const russianText=v=>CYR.test(clean(v));

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

  function buildImageQuery(row){
    return clean(row?.ru||row?.phrase_ru||row?.front||row?.word);
  }

  function semanticContext(row){
    const values=[
      row?.meaning_ru,row?.definition_ru,row?.definition,
      row?.example_ru,row?.context_ru,row?.example,
      ...(Array.isArray(row?.tags)?row.tags:[])
    ].filter(v=>nonEmpty(v)&&russianText(Array.isArray(v)?v.join(' '):v));
    return values.map(v=>Array.isArray(v)?v.join(' '):clean(v)).join(' ');
  }

  function metadata(info,key){
    return stripHtml(info?.extmetadata?.[key]?.value||'');
  }

  function scoreCommonsPage(page,row){
    const info=page?.imageinfo?.[0];
    if(!info?.thumburl)return Object.freeze({score:-Infinity,relevant:false});
    const term=norm(buildImageQuery(row));
    const termTokens=tokens(term);
    if(!termTokens.length)return Object.freeze({score:-Infinity,relevant:false});
    const contextTokens=tokens(semanticContext(row)).filter(t=>!termTokens.includes(t)).slice(0,12);
    const hay=norm([
      page?.title||'',
      metadata(info,'ObjectName'),
      metadata(info,'ImageDescription'),
      metadata(info,'Categories')
    ].join(' '));
    const hayTokens=new Set(tokens(hay));
    const phraseHit=term.length>=3&&hay.includes(term);
    const termHits=termTokens.reduce((n,t)=>n+(hayTokens.has(t)?1:0),0);
    const minimumHits=termTokens.length===1?1:Math.min(2,termTokens.length);
    const relevant=phraseHit||termHits>=minimumHits;
    if(!relevant)return Object.freeze({score:-Infinity,relevant:false});
    const contextHits=contextTokens.reduce((n,t)=>n+(hayTokens.has(t)?1:0),0);
    let score=(phraseHit?8:0)+(termHits*4)+Math.min(5,contextHits);
    const negative=/\b(?:logo|icon|flag|map|coat of arms|логотип|иконка|флаг|карта|герб)\b/i;
    if(negative.test(hay)&&!negative.test(term))score-=5;
    return Object.freeze({score,relevant:true});
  }

  function rankCommonsPages(pages,row){
    const list=Array.isArray(pages)?pages:Object.values(pages||{});
    return list.map(page=>{
      const quality=scoreCommonsPage(page,row);
      const info=page?.imageinfo?.[0]||{};
      return {
        page,
        score:quality.score,
        relevant:quality.relevant,
        thumb_url:clean(info.thumburl),
        description_url:clean(info.descriptionurl),
        title:stripHtml(page?.title||'').replace(/^File:/i,''),
        license:metadata(info,'LicenseShortName')||'Wikimedia Commons',
        license_url:clean(info?.extmetadata?.LicenseUrl?.value||''),
        artist:metadata(info,'Artist')||metadata(info,'Credit')
      };
    }).filter(x=>x.relevant&&x.thumb_url&&x.score>=8)
      .sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,'ru'));
  }

  async function resolveImage(row,options={}){
    const query=buildImageQuery(row);
    if(!query)return Object.freeze({status:'no_query',provider:'wikimedia_commons'});
    const online=options.online!==undefined?Boolean(options.online):(typeof navigator==='undefined'||navigator.onLine!==false);
    const saveData=options.saveData!==undefined?Boolean(options.saveData):Boolean(typeof navigator!=='undefined'&&navigator.connection?.saveData);
    if(!online)return Object.freeze({status:'offline',provider:'wikimedia_commons',query});
    if(saveData)return Object.freeze({status:'save_data',provider:'wikimedia_commons',query});
    const key=norm(query)+'|'+norm(semanticContext(row));
    if(memo.has(key))return memo.get(key);
    const fetchImpl=options.fetchImpl||root.fetch;
    if(typeof fetchImpl!=='function')return Object.freeze({status:'unsupported',provider:'wikimedia_commons',query});
    try{
      const params=new URLSearchParams({
        origin:'*',
        action:'query',
        format:'json',
        generator:'search',
        gsrsearch:query,
        gsrnamespace:'6',
        gsrlimit:'8',
        prop:'imageinfo',
        iiprop:'url|extmetadata',
        iiurlwidth:'640',
        iiextmetadatalanguage:'ru',
        iiextmetadatafilter:'ImageDescription|ObjectName|Categories|LicenseShortName|LicenseUrl|Artist|Credit'
      });
      const url=COMMONS_ENDPOINT+'?'+params.toString();
      const response=await fetchImpl(url,{credentials:'omit',headers:{Accept:'application/json'}});
      if(!response?.ok)throw new Error('commons_http_'+clean(response?.status||'error'));
      const data=await response.json();
      const ranked=rankCommonsPages(data?.query?.pages,row);
      const best=ranked[0];
      const result=best?Object.freeze({
        status:'resolved',
        provider:'wikimedia_commons',
        query,
        score:best.score,
        thumb_url:best.thumb_url,
        description_url:best.description_url,
        title:best.title,
        license:best.license,
        license_url:best.license_url,
        artist:best.artist
      }):Object.freeze({status:'no_verified_image',provider:'wikimedia_commons',query});
      memo.set(key,result);
      return result;
    }catch(error){
      return Object.freeze({status:'error',provider:'wikimedia_commons',query,error:clean(error?.message||error)});
    }
  }

  function rowFromNode(node){
    let tags=[];
    try{tags=JSON.parse(node?.dataset?.tagsRu||'[]')}catch(_){tags=[]}
    return {
      ru:clean(node?.dataset?.termRu),
      meaning_ru:clean(node?.dataset?.definitionRu),
      example_ru:clean(node?.dataset?.contextRu),
      tags:Array.isArray(tags)?tags:[]
    };
  }

  async function hydrateNode(node){
    if(!node||node.dataset.ruVisualStatus)return false;
    node.dataset.ruVisualStatus='loading';
    const row=rowFromNode(node);
    const result=await resolveImage(row);
    if(!node.isConnected)return false;
    if(result.status!=='resolved'){
      node.dataset.ruVisualStatus=result.status||'fallback';
      return false;
    }
    const img=document.createElement('img');
    img.className='direct-visual-image';
    img.loading='lazy';
    img.decoding='async';
    img.referrerPolicy='no-referrer';
    img.alt=clean(row.ru);
    img.src=result.thumb_url;
    img.dataset.ruVisualAsset='vocab';

    const attribution=document.createElement('a');
    attribution.className='direct-visual-attribution';
    attribution.href=result.description_url||'https://commons.wikimedia.org/';
    attribution.target='_blank';
    attribution.rel='noopener noreferrer';
    attribution.textContent='Wikimedia Commons · '+clean(result.license||'source');

    img.addEventListener('load',()=>{
      if(!node.isConnected)return;
      node.dataset.ruVisualStatus='resolved';
      node.append(attribution);
    },{once:true});
    img.addEventListener('error',()=>{
      node.dataset.ruVisualStatus='image_error';
      img.remove();
    },{once:true});
    node.append(img);
    return true;
  }

  function hydrate(scope){
    if(typeof document==='undefined')return 0;
    const base=scope?.querySelectorAll?scope:document;
    const nodes=[...base.querySelectorAll('[data-ru-visual-lookup="1"]:not([data-ru-visual-status])')];
    nodes.forEach(node=>hydrateNode(node));
    return nodes.length;
  }

  root.RussianVisualVocabularyRuntime=Object.freeze({
    schema:SCHEMA,
    describe,
    buildImageQuery,
    scoreCommonsPage,
    rankCommonsPages,
    resolveImage,
    hydrate
  });
})(typeof window!=='undefined'?window:globalThis);
