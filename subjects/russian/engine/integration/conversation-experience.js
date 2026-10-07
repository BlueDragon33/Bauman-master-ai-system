import {createBrowserConversationRuntime,buildSpeakingReflexSignal} from '../conversation/browser-conversation-model.js';

const copy=v=>{if(typeof structuredClone==='function')return structuredClone(v);return JSON.parse(JSON.stringify(v));};
const clean=v=>String(v??'').trim();
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const PACK_URL=new URL('../content/fixtures/conversation-worlds.v2.json',import.meta.url);

function ensureStyle(documentLike){
  if(documentLike.querySelector('[data-re-conversation-style="1"]'))return;
  const style=documentLike.createElement('style');
  style.dataset.reConversationStyle='1';
  style.textContent=`
    .re-conv-host{width:min(100%,920px);margin:0 auto}
    .re-conv{margin:18px 0 28px;padding:22px;border:1px solid color-mix(in srgb,currentColor 12%,transparent);border-radius:24px;background:Canvas;box-shadow:0 14px 42px rgba(0,0,0,.07)}
    .re-conv__top{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:18px}
    .re-conv__eyebrow{font-size:12px;letter-spacing:.14em;font-weight:800;opacity:.62}
    .re-conv__setting{font-size:13px;opacity:.65}
    .re-conv__audio{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 18px}
    .re-conv button{font:inherit}
    .re-conv__audio button,.re-conv__repair button,.re-conv__choice{min-height:42px;border-radius:999px;border:1px solid color-mix(in srgb,currentColor 16%,transparent);background:Canvas;color:inherit;padding:0 15px;cursor:pointer}
    .re-conv__partner{min-height:70px;display:grid;place-items:center;border-radius:18px;background:color-mix(in srgb,currentColor 4%,Canvas);font-weight:750;text-align:center;padding:16px}
    .re-conv__transcript{font-size:22px;line-height:1.45}
    .re-conv__hint{font-size:13px;opacity:.62}
    .re-conv__choices{display:grid;gap:10px;margin-top:16px}
    .re-conv__choice{text-align:left;border-radius:16px;padding:12px 16px}
    .re-conv__repair{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
    .re-conv__status{margin-top:14px;min-height:24px;font-weight:700}
    .re-conv__mic{margin-left:auto}
  `;
  documentLike.head.appendChild(style);
}

export async function loadConversationPack(fetchFn=globalThis.fetch){
  const res=await fetchFn(PACK_URL);
  if(!res?.ok)throw new Error('Unable to load conversation pack');
  const data=await res.json();
  if(!Array.isArray(data?.worlds)||!data.worlds.length)throw new Error('Conversation pack has no worlds');
  return data;
}

function chooseWorld(worlds,locationLike){
  let selector='';
  try{
    const url=new URL(locationLike?.href||String(locationLike||''),'https://local.invalid/');
    selector=clean(url.searchParams.get('ruScenario'));
  }catch(_){}
  return worlds.find(x=>x.worldId===selector||x.setting===selector)||worlds[0]||null;
}

export async function mountConversationExperience({
  windowLike=globalThis.window,
  documentLike=globalThis.document,
  fetchFn=globalThis.fetch,
  speechProvider=null
}={}){
  if(!windowLike||!documentLike)return {mounted:false,reason:'browser-unavailable'};
  let enabled=false;
  try{
    const url=new URL(windowLike.location?.href||'');
    enabled=url.searchParams.get('ruEngine')==='conversation-v1';
  }catch(_){}
  if(!enabled)return {mounted:false,reason:'feature-flag-off'};
  if(documentLike.querySelector('[data-russian-engine-conversation="1"]'))return {mounted:true,reason:'already-mounted'};

  const pack=await loadConversationPack(fetchFn);
  const world=chooseWorld(pack.worlds,windowLike.location);
  if(!world)return {mounted:false,reason:'scenario-missing'};

  const runtime=createBrowserConversationRuntime(world);
  runtime.begin();
  ensureStyle(documentLike);

  const view=documentLike.getElementById('view');
  const parent=view?.parentNode||documentLike.querySelector('.ru-main')||documentLike.querySelector('main')||documentLike.body;
  if(!parent)return {mounted:false,reason:'host-missing'};
  const host=documentLike.createElement('div');
  host.className='re-conv-host';
  host.dataset.russianEngineConversation='1';
  if(view&&view.parentNode===parent)parent.insertBefore(host,view);else parent.prepend(host);

  let transcriptVisible=false;
  let evidenceCount=0;
  let lastTranscript='';
  let recognitionStartedAt=0;

  const play=rate=>{
    const text=runtime.current()?.partnerText;
    if(!text||!speechProvider?.playStimulus)return {started:false};
    return speechProvider.playStimulus({audioText:text,sourceType:'TTS_FALLBACK',rate});
  };

  const submit=(payload,supportLevel=0)=>{
    evidenceCount++;
    const observation={
      evidenceId:'CONV-EV-'+world.worldId+'-'+runtime.snapshot().turn+'-'+evidenceCount,
      attemptId:'CONV-ATT-'+world.worldId+'-'+evidenceCount,
      experienceId:'CONV::'+world.worldId+'::'+runtime.snapshot().turn,
      competencyIds:['COMP-RU-INTERACT'],
      observationType:'conversation-function',
      result:payload,
      supportLevel,
      authoritative:false
    };
    try{windowLike.RussianEngineIntegration?.submitObservation?.(observation,{contentRevision:'conversation-v1',mode:'practice'});}catch(_){}
    return observation;
  };

  const render=()=>{
    const snap=runtime.snapshot();
    const node=runtime.current();
    if(snap.completed){
      host.innerHTML=`<section class="re-conv" data-russian-engine-conversation-card="1">
        <div class="re-conv__eyebrow">RUSSIAN · CONVERSATION WORLD</div>
        <div class="re-conv__partner"><span lang="ru">Готово ✓</span></div>
        <div class="re-conv__status">Цель достигнута</div>
      </section>`;
      return;
    }
    const variants=runtime.listeningVariants();
    const repairs=(node?.repairOptions||[]).map(id=>{
      const label=id==='ask-slower'?'Медленнее, пожалуйста':'Повторите, пожалуйста';
      return `<button type="button" data-re-repair="${esc(id)}" lang="ru">${label}</button>`;
    }).join('');
    const choices=(node?.functions||[]).map(choice=>
      `<button type="button" class="re-conv__choice" data-re-function="${esc(choice.id)}" lang="ru">${esc(choice.learnerText)}</button>`
    ).join('');

    host.innerHTML=`<section class="re-conv" data-russian-engine-conversation-card="1">
      <div class="re-conv__top">
        <div><div class="re-conv__eyebrow">RUSSIAN · CONVERSATION WORLD</div><div class="re-conv__setting">${esc(world.setting)}</div></div>
        <button type="button" class="re-conv__audio re-conv__mic" data-re-mic aria-label="Nói bằng tiếng Nga">🎙</button>
      </div>
      <div class="re-conv__partner">
        ${transcriptVisible?'<div class="re-conv__transcript" lang="ru">'+esc(node.partnerText)+'</div>':'<div class="re-conv__hint">▶ слушай</div>'}
      </div>
      <div class="re-conv__audio">
        ${variants.map(v=>`<button type="button" data-re-rate="${v.rate}">${v.label}</button>`).join('')}
        <button type="button" data-re-transcript>АБВ</button>
      </div>
      <div class="re-conv__choices">${choices}</div>
      <div class="re-conv__repair">${repairs}</div>
      <div class="re-conv__status" data-re-conv-status>${lastTranscript?esc(lastTranscript):''}</div>
    </section>`;

    host.querySelectorAll('[data-re-rate]').forEach(btn=>btn.addEventListener('click',()=>play(Number(btn.dataset.reRate)||1)));
    host.querySelector('[data-re-transcript]')?.addEventListener('click',()=>{transcriptVisible=true;render();});
    host.querySelectorAll('[data-re-function]').forEach(btn=>btn.addEventListener('click',()=>{
      const functionId=btn.dataset.reFunction;
      const result=runtime.respond(functionId);
      submit({success:result.accepted===true,functionId},runtime.snapshot().repairUsed.length);
      transcriptVisible=false;
      render();
    }));
    host.querySelectorAll('[data-re-repair]').forEach(btn=>btn.addEventListener('click',()=>{
      const repair=runtime.repair(btn.dataset.reRepair);
      if(repair.accepted){play(repair.playbackRate);render();}
    }));
    host.querySelector('[data-re-mic]')?.addEventListener('click',()=>{
      if(!speechProvider?.recognize)return;
      recognitionStartedAt=Date.now();
      speechProvider.recognize({
        onSignal(signal){
          const reflex=buildSpeakingReflexSignal({
            worldId:world.worldId,
            turn:runtime.snapshot().turn,
            transcript:signal?.transcript,
            startedAt:recognitionStartedAt,
            endedAt:Date.now()
          });
          lastTranscript=reflex.transcript;
          render();
        },
        onUnavailable(){
          const reflex=buildSpeakingReflexSignal({
            worldId:world.worldId,
            turn:runtime.snapshot().turn,
            startedAt:recognitionStartedAt,
            endedAt:Date.now(),
            providerFailure:true
          });
          submit({success:false,providerFailure:true,signal:reflex},0);
        },
        onError(){
          submit({success:false,providerFailure:true},0);
        }
      });
    });
  };

  render();

  return {
    mounted:true,
    schema:'RUSSIAN_ENGINE_BROWSER_CONVERSATION_EXPERIENCE_V1',
    status:()=>({
      worldId:world.worldId,
      setting:world.setting,
      currentNode:runtime.snapshot().currentNode,
      turn:runtime.snapshot().turn,
      completed:runtime.snapshot().completed,
      repairCount:runtime.snapshot().repairUsed.length,
      evidenceCount,
      lastTranscript
    }),
    unmount(){host.remove();return true;}
  };
}
