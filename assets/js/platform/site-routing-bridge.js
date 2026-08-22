(function(global){
  'use strict';

  const runtime=global.BaumanSiteRuntime;
  const app=global.app;
  const state=global.state;
  const save=global.save;
  const VERSION='2026.08.22-l5.2';

  if(!runtime||!app||!state)return;

  function resolveConfiguredPath(path){
    if(!path)return '';
    return runtime.resolvePath(path,{sameOrigin:true});
  }

  function wrapSubjectPath(methodName,key){
    const original=app[methodName];
    if(typeof original!=='function')return false;
    app[methodName]=function(id){
      const subject=state.subjects&&state.subjects[id];
      if(!subject||!subject[key])return original.apply(app,arguments);
      const originalPath=subject[key];
      const resolvedPath=resolveConfiguredPath(originalPath);
      subject[key]=resolvedPath;
      try{
        return original.apply(app,arguments);
      }finally{
        subject[key]=originalPath;
        if(key==='mainPath'&&state.lastStudy&&state.lastStudy.subjectId===id&&state.lastStudy.path===resolvedPath){
          state.lastStudy.path=originalPath;
          try{if(typeof save==='function')save();}catch(_){ }
        }
      }
    };
    return true;
  }

  const wrapped={
    inPage:wrapSubjectPath('openSubjectInPage','mainPath'),
    newTab:wrapSubjectPath('openSubjectTab','mainPath'),
    editor:wrapSubjectPath('openSubjectEditor','editorPath')
  };

  global.BAUMAN_SITE_ROUTING_BRIDGE={
    version:VERSION,
    wrapped,
    resolveConfiguredPath,
    selfCheck:function(){
      const subjects=Object.values(state.subjects||{});
      const invalid=[];
      subjects.forEach(function(subject){
        ['mainPath','editorPath'].forEach(function(key){
          const raw=subject&&subject[key];
          if(!raw)return;
          try{
            const href=resolveConfiguredPath(raw);
            if(new URL(href).origin!==global.location.origin)invalid.push({id:subject.id||'',key,path:raw,reason:'cross-origin'});
          }catch(error){
            invalid.push({id:subject.id||'',key,path:raw,reason:String(error&&error.message||error)});
          }
        });
      });
      return {ok:Object.values(wrapped).every(Boolean)&&invalid.length===0,version:VERSION,wrapped,subjects:subjects.length,invalid};
    }
  };
})(window);
