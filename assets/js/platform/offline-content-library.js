(function(global){
  'use strict';

  const DB_NAME='bauman_offline_content_v1';
  const DB_VERSION=1;
  const FILE_STORE='files';
  const PACK_STORE='packs';
  const MAX_JSON_BYTES=64*1024*1024;

  function supported(){return typeof indexedDB!=='undefined';}
  function cleanPart(value){
    return String(value||'').replace(/\\/g,'/').split('/').filter(Boolean).filter(part=>part!=='.'&&part!=='..').join('/');
  }
  function fileKey(packId,relativePath){return cleanPart(packId)+'::'+cleanPart(relativePath);}
  function now(){return new Date().toISOString();}

  function openDb(){
    if(!supported())return Promise.reject(new Error('IndexedDB is not supported'));
    return new Promise((resolve,reject)=>{
      const request=indexedDB.open(DB_NAME,DB_VERSION);
      request.onupgradeneeded=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains(FILE_STORE)){
          const store=db.createObjectStore(FILE_STORE,{keyPath:'key'});
          store.createIndex('packId','packId',{unique:false});
          store.createIndex('relativePath','relativePath',{unique:false});
        }
        if(!db.objectStoreNames.contains(PACK_STORE)){
          db.createObjectStore(PACK_STORE,{keyPath:'packId'});
        }
      };
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error('Cannot open offline database'));
    });
  }

  async function withStore(storeName,mode,fn){
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(storeName,mode);
      const store=tx.objectStore(storeName);
      let result;
      try{result=fn(store,tx);}catch(error){db.close();reject(error);return;}
      tx.oncomplete=()=>{db.close();resolve(result);};
      tx.onerror=()=>{const err=tx.error||new Error('Offline storage transaction failed');db.close();reject(err);};
      tx.onabort=()=>{const err=tx.error||new Error('Offline storage transaction aborted');db.close();reject(err);};
    });
  }

  async function requestResult(request){
    return new Promise((resolve,reject)=>{
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error('IndexedDB request failed'));
    });
  }

  async function putFile(packId,relativePath,blob,meta={}){
    if(!(blob instanceof Blob))blob=new Blob([blob],{type:meta.mime||'application/octet-stream'});
    const id=cleanPart(packId||'local');
    const rel=cleanPart(relativePath||meta.name||'file');
    if(!id||!rel)throw new Error('packId and relativePath are required');
    const record={
      key:fileKey(id,rel),
      packId:id,
      relativePath:rel,
      name:meta.name||rel.split('/').pop(),
      mime:meta.mime||blob.type||'application/octet-stream',
      bytes:Number(blob.size)||0,
      blob,
      source:meta.source||'offline-pack',
      updatedAt:now()
    };
    await withStore(FILE_STORE,'readwrite',store=>store.put(record));
    return record;
  }

  async function getFile(packId,relativePath){
    const db=await openDb();
    try{
      const tx=db.transaction(FILE_STORE,'readonly');
      return await requestResult(tx.objectStore(FILE_STORE).get(fileKey(packId,relativePath)))||null;
    }finally{db.close();}
  }

  async function getBlob(packId,relativePath){const record=await getFile(packId,relativePath);return record?.blob||null;}
  async function getText(packId,relativePath){const blob=await getBlob(packId,relativePath);return blob?await blob.text():null;}
  async function getJSON(packId,relativePath){
    const record=await getFile(packId,relativePath);
    if(!record)return null;
    if(record.bytes>MAX_JSON_BYTES)throw new Error('JSON offline vượt giới hạn đọc an toàn');
    return JSON.parse(await record.blob.text());
  }

  async function savePack(pack){
    const record={
      packId:cleanPart(pack.packId||''),
      version:String(pack.version||'1'),
      subjectId:String(pack.subjectId||''),
      title:String(pack.title||pack.packId||''),
      bytes:Number(pack.bytes)||0,
      fileCount:Number(pack.fileCount)||0,
      source:String(pack.source||'download'),
      downloadedAt:pack.downloadedAt||now(),
      lastUsedAt:pack.lastUsedAt||now(),
      metadata:pack.metadata&&typeof pack.metadata==='object'?pack.metadata:{}
    };
    if(!record.packId)throw new Error('packId is required');
    await withStore(PACK_STORE,'readwrite',store=>store.put(record));
    return record;
  }

  async function listPacks(){
    const db=await openDb();
    try{
      const tx=db.transaction(PACK_STORE,'readonly');
      const all=await requestResult(tx.objectStore(PACK_STORE).getAll());
      return (all||[]).sort((a,b)=>String(b.lastUsedAt||'').localeCompare(String(a.lastUsedAt||'')));
    }finally{db.close();}
  }

  async function listFiles(packId){
    const db=await openDb();
    try{
      const tx=db.transaction(FILE_STORE,'readonly');
      const index=tx.objectStore(FILE_STORE).index('packId');
      return await requestResult(index.getAll(cleanPart(packId)))||[];
    }finally{db.close();}
  }

  async function removePack(packId){
    const id=cleanPart(packId);
    const files=await listFiles(id);
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction([FILE_STORE,PACK_STORE],'readwrite');
      const fileStore=tx.objectStore(FILE_STORE);
      files.forEach(file=>fileStore.delete(file.key));
      tx.objectStore(PACK_STORE).delete(id);
      tx.oncomplete=()=>{db.close();resolve({packId:id,removedFiles:files.length});};
      tx.onerror=()=>{const err=tx.error||new Error('Cannot remove offline pack');db.close();reject(err);};
    });
  }

  function fileRelativePath(file){return cleanPart(file.webkitRelativePath||file.relativePath||file.name);}

  async function importFiles(files,options={}){
    const list=Array.from(files||[]).filter(Boolean);
    if(!list.length)throw new Error('Không có file để nhập');
    const packId=cleanPart(options.packId||('local-'+Date.now()));
    let bytes=0;
    for(const file of list){
      bytes+=Number(file.size)||0;
      await putFile(packId,fileRelativePath(file),file,{name:file.name,mime:file.type,source:'local-file'});
    }
    await savePack({packId,version:'local',subjectId:options.subjectId||'',title:options.title||'Thư viện máy tính',bytes,fileCount:list.length,source:'local-file'});
    return {packId,fileCount:list.length,bytes};
  }

  async function chooseFiles(options={}){
    if(typeof global.showOpenFilePicker==='function'){
      const handles=await global.showOpenFilePicker({multiple:options.multiple!==false});
      const files=[];
      for(const handle of handles)files.push(await handle.getFile());
      return files;
    }
    return new Promise((resolve,reject)=>{
      const input=document.createElement('input');
      input.type='file';
      input.multiple=options.multiple!==false;
      if(options.accept)input.accept=options.accept;
      input.style.display='none';
      document.body.appendChild(input);
      input.onchange=()=>{const files=Array.from(input.files||[]);input.remove();resolve(files);};
      input.onerror=()=>{input.remove();reject(new Error('Không mở được file picker'));};
      input.click();
    });
  }

  async function chooseDirectory(){
    if(typeof global.showDirectoryPicker==='function'){
      const root=await global.showDirectoryPicker({mode:'read'});
      const files=[];
      async function walk(handle,prefix=''){
        for await(const [name,entry] of handle.entries()){
          const rel=cleanPart(prefix+'/'+name);
          if(entry.kind==='file'){
            const file=await entry.getFile();
            Object.defineProperty(file,'relativePath',{value:rel,configurable:true});
            files.push(file);
          }else if(entry.kind==='directory')await walk(entry,rel);
        }
      }
      await walk(root,'');
      return files;
    }
    return new Promise((resolve,reject)=>{
      const input=document.createElement('input');
      input.type='file';
      input.multiple=true;
      input.setAttribute('webkitdirectory','');
      input.style.display='none';
      document.body.appendChild(input);
      input.onchange=()=>{const files=Array.from(input.files||[]);input.remove();resolve(files);};
      input.onerror=()=>{input.remove();reject(new Error('Không mở được thư mục'));};
      input.click();
    });
  }

  async function importChosenFiles(options={}){return importFiles(await chooseFiles(options),options);}
  async function importChosenDirectory(options={}){return importFiles(await chooseDirectory(),options);}

  async function cacheUrl(packId,url,relativePath,options={}){
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok)throw new Error('HTTP '+response.status+' '+url);
    const blob=await response.blob();
    const record=await putFile(packId,relativePath||new URL(url,location.href).pathname.replace(/^\//,''),blob,{mime:blob.type,source:'network-cache'});
    if(options.updatePack!==false){
      const files=await listFiles(packId);
      await savePack({packId,version:options.version||'1',subjectId:options.subjectId||'',title:options.title||packId,bytes:files.reduce((sum,f)=>sum+Number(f.bytes||0),0),fileCount:files.length,source:'network-cache'});
    }
    return record;
  }

  async function resolveJSON(options={}){
    const packId=options.packId;
    const relativePath=options.relativePath;
    if(packId&&relativePath){
      const local=await getFile(packId,relativePath);
      if(local){
        if(local.bytes>MAX_JSON_BYTES)throw new Error('JSON offline vượt giới hạn đọc an toàn');
        return {data:JSON.parse(await local.blob.text()),source:'offline',record:local};
      }
    }
    if(options.url){
      const response=await fetch(options.url);
      if(!response.ok)throw new Error('HTTP '+response.status+' '+options.url);
      return {data:await response.json(),source:'network',record:null};
    }
    return {data:options.fallback??null,source:'fallback',record:null};
  }

  async function estimate(){
    if(navigator.storage&&navigator.storage.estimate){
      const value=await navigator.storage.estimate();
      return {usage:Number(value.usage)||0,quota:Number(value.quota)||0};
    }
    return {usage:0,quota:0};
  }

  global.BaumanOfflineContentLibrary={
    version:'2026.08.24-v1',
    supported,
    putFile,
    getFile,
    getBlob,
    getText,
    getJSON,
    savePack,
    listPacks,
    listFiles,
    removePack,
    importFiles,
    chooseFiles,
    chooseDirectory,
    importChosenFiles,
    importChosenDirectory,
    cacheUrl,
    resolveJSON,
    estimate,
    selfCheck(){return {ok:supported(),indexedDB:supported(),filePicker:typeof global.showOpenFilePicker==='function',directoryPicker:typeof global.showDirectoryPicker==='function',version:this.version};}
  };
})(window);
