'use strict';
(function(root){
  const SCHEMA='RUSSIAN_ASSET_RELIABILITY_V1';
  const FALLBACK='missing_visual_asset';
  function replaceBrokenImage(img){
    if(!img||img.dataset.ruAssetFailed==='1')return false;
    img.dataset.ruAssetFailed='1';
    const box=document.createElement('div');
    box.className='ru-asset-missing';
    box.dataset.ruAssetFallback='1';
    box.setAttribute('role','status');
    box.textContent=FALLBACK;
    img.replaceWith(box);
    return true;
  }
  document.addEventListener('error',event=>{
    const target=event.target;
    if(target?.tagName==='IMG'&&(target.matches?.('[data-ru-visual-asset]')||target.closest?.('.ai-direct-visual')))replaceBrokenImage(target);
  },true);
  root.RussianAssetReliability=Object.freeze({schema:SCHEMA,fallback:FALLBACK,replaceBrokenImage});
})(window);
