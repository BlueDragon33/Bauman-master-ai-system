/* V13.42 · Heavy data lazy policy, persistence-safe
 * vocab/tests/speaking remain required editable sources, but are removed from startup network loading.
 * They are NOT permanently classified as optional because Russian core uses optionalDataFiles
 * as a persistence exclusion list for the legacy _db overlay.
 * Academic JSON files stay byte-for-byte unchanged.
 */
(function(){
  'use strict';
  var RELEASE='RUSSIAN_V13_42_HEAVY_DATA_LAZY_PERSISTENCE_SAFE';
  var A=window.SUBJECT_ADAPTER;
  if(!A)return;
  var heavy=['vocab','tests','speaking'];
  var baseDataFiles=Array.isArray(A.dataFiles)?A.dataFiles.slice():[];
  var nativeOptional=Array.from(new Set(A.optionalDataFiles||[])).filter(function(name){return heavy.indexOf(name)<0;});
  var storageExposurePending=true;

  A.dataFiles=baseDataFiles.filter(function(name){return heavy.indexOf(name)<0;});

  /*
   * Compatibility bridge for the legacy core:
   * - ALL_STORAGE_FILES is created once by spreading OPTIONAL_DATA_FILES during core startup.
   * - cleanDbOverlay/dbForLocalStorage later use Array#includes on that same array.
   * We expose heavy names only to that first iterator pass so Storage/Data Manager keeps listing them,
   * while .includes() continues to return false and therefore never drops heavy legacy overlay data.
   */
  var optionalForCore=nativeOptional.slice();
  var normalIterator=Array.prototype[Symbol.iterator];
  Object.defineProperty(optionalForCore,Symbol.iterator,{
    configurable:true,
    value:function(){
      if(storageExposurePending){
        storageExposurePending=false;
        var snapshot=nativeOptional.concat(heavy);
        return normalIterator.call(snapshot);
      }
      return normalIterator.call(this);
    }
  });
  A.optionalDataFiles=optionalForCore;

  A.lazyDataFiles=Array.from(new Set([].concat(A.lazyDataFiles||[],heavy)));
  A.dataSourceMeta=A.dataSourceMeta||{};
  heavy.forEach(function(name){
    A.dataSourceMeta[name]=Object.assign({},A.dataSourceMeta[name]||{}, {
      required:true,
      lazy:true,
      lazyPolicy:'load-on-feature-entry',
      persistence:'legacy-db-overlay-preserved'
    });
  });

  function sourceForState(state){
    state=state&&typeof state==='object'?state:{};
    if(state.view==='vocab')return 'vocab';
    if(state.view==='learning'&&state.learnTab==='practice')return 'speaking';
    if(state.view==='learning'&&(state.learnTab==='review'||state.learnTab==='exam'||state.learnTab==='tests'))return 'tests';
    if(state.view==='storage'&&heavy.indexOf(state.storageFile)>=0)return state.storageFile;
    return '';
  }

  function requestedSource(target){
    if(!target||!target.dataset)return '';
    if(target.dataset.view==='vocab')return 'vocab';
    if(target.dataset.learn==='practice')return 'speaking';
    if(target.dataset.learn==='review'||target.dataset.learn==='exam')return 'tests';
    if(heavy.indexOf(target.dataset.storage)>=0)return target.dataset.storage;
    if(target.dataset.route){
      try{
        var route=JSON.parse(target.dataset.route||'{}');
        if(route.view==='vocab')return 'vocab';
        if(route.view==='learning'&&route.learnTab==='practice')return 'speaking';
        if(route.view==='learning'&&(route.learnTab==='review'||route.learnTab==='exam'))return 'tests';
      }catch(_){ }
    }
    return '';
  }

  function withTransientOptional(name,fn){
    if(!name||heavy.indexOf(name)<0)return fn();
    var list=A.optionalDataFiles;
    var existed=list.indexOf(name)>=0;
    if(!existed)list.push(name);
    try{return fn();}
    finally{
      if(!existed){
        var index=list.indexOf(name);
        if(index>=0)list.splice(index,1);
      }
    }
  }

  function askCoreToLoad(name){
    if(!name)return;
    setTimeout(function(){
      var button=document.createElement('button');
      button.type='button';
      button.hidden=true;
      button.dataset.loadOptional=name;
      document.body.appendChild(button);
      withTransientOptional(name,function(){button.click();});
      button.remove();
    },0);
  }

  function restoreSavedActiveSource(){
    try{
      var storage=window.BaumanSubjectStorage&&window.BaumanSubjectStorage.forSubject(A.id||'russian');
      var saved=storage&&storage.getJSON?storage.getJSON(A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton',{}):{};
      askCoreToLoad(sourceForState(saved));
    }catch(_){ }
  }

  document.addEventListener('click',function(event){
    var target=event.target&&event.target.closest&&event.target.closest('[data-view],[data-learn],[data-storage],[data-route]');
    askCoreToLoad(requestedSource(target));
  },true);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(restoreSavedActiveSource,0);});
  else setTimeout(restoreSavedActiveSource,0);

  window.BAUMAN_RUSSIAN_V1341_LAZY={
    release:RELEASE,
    heavySources:heavy.slice(),
    sourceForState:sourceForState,
    withTransientOptional:withTransientOptional,
    selfCheck:function(){
      var persistentOptionalSafe=heavy.every(function(name){return A.optionalDataFiles.indexOf(name)<0;});
      var startupSafe=heavy.every(function(name){return A.dataFiles.indexOf(name)<0;});
      var metadataSafe=heavy.every(function(name){
        var meta=A.dataSourceMeta[name]||{};
        return meta.required===true&&meta.lazy===true&&meta.persistence==='legacy-db-overlay-preserved';
      });
      return {
        ok:persistentOptionalSafe&&startupSafe&&metadataSafe&&storageExposurePending===false,
        release:RELEASE,
        dataFiles:A.dataFiles.slice(),
        optionalDataFiles:A.optionalDataFiles.slice(),
        lazyDataFiles:(A.lazyDataFiles||[]).slice(),
        heavy:heavy.slice(),
        persistenceSafe:persistentOptionalSafe,
        startupSafe:startupSafe,
        storageListBridgeConsumed:storageExposurePending===false,
        metadataSafe:metadataSafe
      };
    }
  };
})();
