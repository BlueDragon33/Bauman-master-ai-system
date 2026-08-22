/* V13.41 · Heavy data lazy policy
 * Reuses the subject core optional-data loader for vocab, tests and speaking.
 * Academic JSON files stay byte-for-byte unchanged.
 */
(function(){
  'use strict';
  var RELEASE='RUSSIAN_V13_41_HEAVY_DATA_LAZY';
  var A=window.SUBJECT_ADAPTER;
  if(!A)return;
  var heavy=['vocab','tests','speaking'];

  A.dataFiles=Array.isArray(A.dataFiles)?A.dataFiles.filter(function(name){return heavy.indexOf(name)<0;}):[];
  A.optionalDataFiles=Array.from(new Set([].concat(A.optionalDataFiles||[],heavy)));
  A.dataSourceMeta=A.dataSourceMeta||{};
  heavy.forEach(function(name){
    A.dataSourceMeta[name]=Object.assign({},A.dataSourceMeta[name]||{},{required:false,lazy:true,lazyPolicy:'load-on-feature-entry'});
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

  function askCoreToLoad(name){
    if(!name)return;
    setTimeout(function(){
      var button=document.createElement('button');
      button.type='button';
      button.hidden=true;
      button.dataset.loadOptional=name;
      document.body.appendChild(button);
      button.click();
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
    selfCheck:function(){
      return {
        ok:heavy.every(function(name){return A.dataFiles.indexOf(name)<0&&A.optionalDataFiles.indexOf(name)>=0&&A.dataSourceMeta[name]&&A.dataSourceMeta[name].lazy===true;}),
        release:RELEASE,
        dataFiles:A.dataFiles.slice(),
        optionalDataFiles:A.optionalDataFiles.slice(),
        heavy:heavy.slice()
      };
    }
  };
})();
