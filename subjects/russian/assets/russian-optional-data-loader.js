'use strict';
(function(){
  const nativeFetch=window.fetch.bind(window);
  const CHUNKED={
    'dialogue-bauman-az.json':'dialogue-bauman-az',
    'deep-speaking-bauman.json':'deep-speaking-bauman'
  };

  function sourceName(input){
    try{
      const raw=typeof input==='string'?input:input?.url;
      const url=new URL(raw,document.baseURI);
      return decodeURIComponent(url.pathname.split('/').pop()||'');
    }catch(_){return ''}
  }

  function responseLike(url,data){
    return {
      ok:true,
      status:200,
      statusText:'OK',
      url:String(url||''),
      headers:new Headers({'content-type':'application/json; charset=utf-8','x-bauman-chunked-data':'1'}),
      json:async()=>data,
      text:async()=>JSON.stringify(data),
      clone(){return responseLike(url,data)}
    };
  }

  async function directJsonOrNull(input,init){
    try{
      const response=await nativeFetch(input,init);
      const type=String(response.headers?.get?.('content-type')||'').toLowerCase();
      if(response.ok&&!type.includes('text/html'))return response;
    }catch(_){/* deployed runtime can intentionally omit the oversized original */}
    return null;
  }

  async function loadChunked(input,init,dataset){
    const raw=typeof input==='string'?input:input?.url;
    const requested=new URL(raw,document.baseURI);
    const manifestUrl=new URL(`chunks/${dataset}/manifest.json`,requested);
    const manifestResponse=await nativeFetch(manifestUrl.href,init);
    if(!manifestResponse.ok)throw new Error(`Chunk manifest HTTP ${manifestResponse.status}: ${dataset}`);
    const manifest=await manifestResponse.json();
    if(manifest?.format!=='json-array-chunks-v1'||!Array.isArray(manifest.chunks))throw new Error(`Invalid chunk manifest: ${dataset}`);

    const merged=[];
    for(const chunk of manifest.chunks){
      const file=typeof chunk==='string'?chunk:chunk?.file;
      if(!file)throw new Error(`Invalid chunk entry: ${dataset}`);
      const partUrl=new URL(file,manifestUrl.href);
      const partResponse=await nativeFetch(partUrl.href,init);
      if(!partResponse.ok)throw new Error(`Chunk HTTP ${partResponse.status}: ${dataset}/${file}`);
      const part=await partResponse.json();
      if(!Array.isArray(part))throw new Error(`Chunk is not an array: ${dataset}/${file}`);
      merged.push(...part);
    }
    if(Number.isFinite(Number(manifest.count))&&merged.length!==Number(manifest.count)){
      throw new Error(`Chunk count mismatch: ${dataset} expected ${manifest.count}, got ${merged.length}`);
    }
    return responseLike(requested.href,merged);
  }

  window.fetch=async function(input,init){
    const name=sourceName(input);
    const dataset=CHUNKED[name];
    if(!dataset)return nativeFetch(input,init);

    const direct=await directJsonOrNull(input,init);
    if(direct)return direct;
    return loadChunked(input,init,dataset);
  };

  window.RUSSIAN_OPTIONAL_DATA_LOADER={
    protocol:'RUSSIAN_OPTIONAL_CHUNKS_V1',
    datasets:Object.keys(CHUNKED)
  };
})();
