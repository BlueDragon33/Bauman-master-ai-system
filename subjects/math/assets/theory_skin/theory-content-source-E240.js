/* E240 · Shared Theory Content Source Bridge
 * Keeps E129, E202 and E211 on one payload without redesigning Reader Pro.
 * Priority: runtime DB -> E129 overlay -> durable JSON fetch.
 */
(function(){
  'use strict';

  var RELEASE='E240_SHARED_THEORY_CONTENT_SOURCE_BRIDGE';
  var OVERLAY_KEY='bauman_math_e129_theory_content_overlay_v1';
  var nativeFetch=window.fetch.bind(window);
  var wrappedE129=false;
  var servedFrom='durable_json_fallback';
  var durablePayload=null;

  function validPayload(value){
    return !!(value&&typeof value==='object'&&Array.isArray(value.records));
  }

  function overlayPayload(){
    try{
      var raw=localStorage.getItem(OVERLAY_KEY);
      if(!raw)return null;
      var parsed=JSON.parse(raw);
      return validPayload(parsed)?parsed:null;
    }catch(_){return null;}
  }

  function sharedPayload(){
    var dbPayload=window.DB&&window.DB.theory_lecture_content;
    if(validPayload(dbPayload)){
      servedFrom='window.DB.theory_lecture_content';
      return dbPayload;
    }
    var saved=overlayPayload();
    if(saved){
      servedFrom='localStorage E129 overlay';
      if(window.DB)window.DB.theory_lecture_content=saved;
      return saved;
    }
    if(validPayload(durablePayload)){
      servedFrom='durable_json_fallback';
      return durablePayload;
    }
    servedFrom='durable_json_fallback';
    return null;
  }

  function requestUrl(input){
    if(typeof input==='string')return input;
    if(input&&typeof input.url==='string')return input.url;
    return '';
  }

  function isTheoryContentRequest(input){
    var url=requestUrl(input);
    if(!url)return false;
    try{
      var parsed=new URL(url,window.location.href);
      return /\/data\/theory_lecture_content\.json$/.test(parsed.pathname);
    }catch(_){
      return /(?:^|\/)data\/theory_lecture_content\.json(?:[?#].*)?$/.test(url);
    }
  }

  function responseFor(payload){
    return new Response(JSON.stringify(payload),{
      status:200,
      headers:{'Content-Type':'application/json; charset=utf-8','X-Bauman-Theory-Source':servedFrom}
    });
  }

  window.fetch=function(input,init){
    if(isTheoryContentRequest(input)){
      var payload=sharedPayload();
      if(payload)return Promise.resolve(responseFor(payload));
      return nativeFetch(input,init).then(function(response){
        try{
          response.clone().json().then(function(data){
            if(validPayload(data)){
              durablePayload=data;
              servedFrom='durable_json_fallback';
              try{window.dispatchEvent(new CustomEvent('bauman:theory-content-ready',{detail:{source:RELEASE,records:data.records.length}}));}catch(_){ }
            }
          }).catch(function(){});
        }catch(_){ }
        return response;
      });
    }
    return nativeFetch(input,init);
  };

  function syncReload(reason){
    try{window.dispatchEvent(new CustomEvent('bauman:theory-content-updated',{detail:{source:RELEASE,reason:reason||'content_changed'}}));}catch(_){ }
    setTimeout(function(){window.location.reload();},80);
  }

  function wrapE129(){
    var api=window.BAUMAN_MATH_THEORY_E129;
    if(!api||wrappedE129)return false;
    wrappedE129=true;

    if(typeof api.commitContent==='function'&&!api.commitContent.__e240Wrapped){
      var originalCommit=api.commitContent;
      var commit=function(){
        var report=originalCommit.apply(api,arguments);
        if(report&&report.ok)syncReload('content_imported');
        return report;
      };
      commit.__e240Wrapped=true;
      api.commitContent=commit;
    }

    if(typeof api.clearContentOverlay==='function'&&!api.clearContentOverlay.__e240Wrapped){
      var originalClear=api.clearContentOverlay;
      var clear=function(){
        var result=originalClear.apply(api,arguments);
        syncReload('overlay_cleared');
        return result;
      };
      clear.__e240Wrapped=true;
      api.clearContentOverlay=clear;
    }

    if(api.contract){
      api.contract.sharedContentSourceRelease=RELEASE;
      api.contract.contentPriority=['window.DB.theory_lecture_content','localStorage E129 overlay','data/theory_lecture_content.json'];
      api.contract.crossReaderSync='reload_after_same_tab_import_or_clear';
    }
    return true;
  }

  function boot(){
    sharedPayload();
    if(wrapE129())return;
    var attempts=0;
    var timer=setInterval(function(){
      attempts+=1;
      if(wrapE129()||attempts>=40)clearInterval(timer);
    },50);
  }

  window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE={
    release:RELEASE,
    getPayload:sharedPayload,
    source:function(){return servedFrom;},
    isTheoryContentRequest:isTheoryContentRequest,
    selfCheck:function(){
      return {
        ok:true,
        release:RELEASE,
        source:servedFrom,
        dbAvailable:validPayload(window.DB&&window.DB.theory_lecture_content),
        overlayAvailable:validPayload(overlayPayload()),
        durableFallback:true,
        durablePayloadAvailable:validPayload(durablePayload),
        durableRecordCount:validPayload(durablePayload)?durablePayload.records.length:0,
        sameTabImportSync:'reload',
        e129Wrapped:wrappedE129
      };
    }
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
