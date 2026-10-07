import {
  GROUNDED_SUPPORT_STEPS,
  evaluateGroundedSelection,
  nextTransferScene,
  shouldEnableGroundedSlice
} from './grounded-browser-model.js';

const copy=value=>{
  if(typeof structuredClone==='function')return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[char]));

const FIXTURE_URL=new URL('../content/fixtures/grounded-scenes.v1.json',import.meta.url);

function ensureStyle(documentLike){
  if(documentLike.querySelector('[data-re-grounded-style="1"]'))return;
  const style=documentLike.createElement('style');
  style.dataset.reGroundedStyle='1';
  style.textContent=`
    .re-grounded-host{width:min(100%,1120px);margin:0 auto}
    .re-grounded{margin:18px 0 28px;padding:22px;border:1px solid color-mix(in srgb,currentColor 12%,transparent);border-radius:24px;background:color-mix(in srgb,Canvas 96%,transparent);box-shadow:0 14px 42px rgba(0,0,0,.07)}
    .re-grounded__top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}
    .re-grounded__eyebrow{font-size:12px;letter-spacing:.14em;font-weight:800;opacity:.62}
    .re-grounded__listen{min-width:112px;min-height:44px;border:0;border-radius:999px;padding:0 18px;font:inherit;font-weight:750;cursor:pointer}
    .re-grounded__scene{display:grid;grid-template-columns:minmax(0,1fr) 170px;gap:18px;align-items:stretch}
    .re-grounded__objects{display:grid;grid-template-columns:repeat(3,minmax(92px,1fr));gap:14px}
    .re-grounded__object{min-height:150px;border:1px solid color-mix(in srgb,currentColor 12%,transparent);border-radius:22px;background:Canvas;font-size:58px;cursor:pointer;transition:transform .16s ease,box-shadow .16s ease}
    .re-grounded__object:hover,.re-grounded__object:focus-visible{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.08);outline:none}
    .re-grounded__object.is-hint{outline:3px solid currentColor;outline-offset:3px}
    .re-grounded__object.is-wrong{animation:reGroundedShake .25s linear 1}
    .re-grounded__receiver{border:1px dashed color-mix(in srgb,currentColor 20%,transparent);border-radius:22px;display:grid;place-items:center;min-height:150px;font-size:54px;position:relative}
    .re-grounded__receiver small{position:absolute;bottom:12px;font-size:12px;opacity:.55}
    .re-grounded__status{min-height:42px;display:flex;align-items:center;gap:10px;margin-top:16px;font-weight:700}
    .re-grounded__status[data-state="success"]{font-size:22px}
    .re-grounded__support{margin-top:8px;font-size:13px;opacity:.72}
    .re-grounded__transcript{margin:14px 0 0;font-size:28px;font-weight:800;text-align:center}
    .re-grounded__next{margin-left:auto;min-height:42px;border-radius:999px;padding:0 18px;border:1px solid currentColor;background:transparent;font:inherit;cursor:pointer}
    @keyframes reGroundedShake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
    @media(max-width:760px){.re-grounded{padding:16px}.re-grounded__scene{grid-template-columns:1fr}.re-grounded__objects{grid-template-columns:repeat(3,1fr)}.re-grounded__object{min-height:112px;font-size:46px}.re-grounded__receiver{min-height:100px}}
  `;
  documentLike.head.appendChild(style);
}

function supportText(level){
  return [
    '',
    '↻',
    '◉',
    '0.7×',
    '☞',
    '↔',
    'RU',
    'RU → RU',
    'АБВ',
    '?',
    'VI'
  ][Math.max(0,Math.min(10,Number(level)||0))];
}

export async function loadGroundedFixture(fetchFn=globalThis.fetch){
  const response=await fetchFn(FIXTURE_URL);
  if(!response?.ok)throw new Error('Unable to load grounded scene fixture');
  const data=await response.json();
  if(!Array.isArray(data?.scenes)||!data.scenes.length)throw new Error('Grounded scene fixture has no scenes');
  return data;
}

export async function mountGroundedExperience({
  windowLike=globalThis.window,
  documentLike=globalThis.document,
  fetchFn=globalThis.fetch,
  speechProvider=null
}={}){
  if(!windowLike||!documentLike)return {mounted:false,reason:'browser-unavailable'};
  if(!shouldEnableGroundedSlice(windowLike.location))return {mounted:false,reason:'feature-flag-off'};
  if(documentLike.querySelector('[data-russian-engine-grounded="1"]'))return {mounted:true,reason:'already-mounted'};

  const view=documentLike.getElementById('view');
  const stableParent=view?.parentNode||documentLike.querySelector('.ru-main')||documentLike.querySelector('main')||documentLike.body;
  if(!stableParent)return {mounted:false,reason:'host-missing'};

  let host=documentLike.getElementById('russianEngineExperienceHost');
  if(!host){
    host=documentLike.createElement('div');
    host.id='russianEngineExperienceHost';
    host.className='re-grounded-host';
    host.dataset.russianEngineHost='1';
    if(view&&view.parentNode===stableParent)stableParent.insertBefore(host,view);
    else stableParent.prepend(host);
  }

  ensureStyle(documentLike);
  const fixture=await loadGroundedFixture(fetchFn);
  const scenes=fixture.scenes;
  let scene=scenes[0];
  let supportLevel=0;
  let transferCount=0;
  let attemptSequence=0;
  const evidence=[];

  const section=documentLike.createElement('section');
  section.className='re-grounded';
  section.dataset.russianEngineGrounded='1';
  section.setAttribute('aria-label','Russian Engine grounded listening experience');
  host.prepend(section);

  const play=(rate=1)=>{
    if(!speechProvider?.playStimulus)return {started:false,reason:'speech-provider-unavailable'};
    return speechProvider.playStimulus({
      audioText:scene.stimulus.audioText,
      sourceType:'TTS_FALLBACK',
      rate
    });
  };

  const render=()=>{
    const objects=(scene.world?.objects||[]).map((item,index)=>`
      <button type="button" class="re-grounded__object" data-re-object="${esc(item.id)}" aria-label="Lựa chọn ${index+1}">
        <span aria-hidden="true">${esc(item.visual?.value||'□')}</span>
      </button>
    `).join('');
    section.innerHTML=`
      <div class="re-grounded__top">
        <div><div class="re-grounded__eyebrow">RUSSIAN · LISTEN → UNDERSTAND → ACT</div></div>
        <button type="button" class="re-grounded__listen" data-re-listen aria-label="Nghe câu tiếng Nga">▶ Nghe</button>
      </div>
      <div class="re-grounded__scene">
        <div class="re-grounded__objects">${objects}</div>
        <div class="re-grounded__receiver" data-re-receiver><span aria-hidden="true">🫴</span><small>●</small></div>
      </div>
      <div class="re-grounded__status" data-re-status aria-live="polite"></div>
      <div class="re-grounded__support" data-re-support>${supportLevel?supportText(supportLevel):''}</div>
      ${supportLevel>=8?'<p class="re-grounded__transcript" lang="ru">'+esc(scene.stimulus.audioText)+'</p>':''}
    `;

    section.querySelector('[data-re-listen]')?.addEventListener('click',()=>play(supportLevel>=3?.7:1));
    section.querySelectorAll('[data-re-object]').forEach(button=>button.addEventListener('click',()=>{
      const result=evaluateGroundedSelection({
        scene,
        selectedObjectId:button.dataset.reObject,
        supportLevel,
        attemptId:'RE09S1-'+(++attemptSequence)
      });
      evidence.push(copy(result.evidence));
      const status=section.querySelector('[data-re-status]');
      const receiver=section.querySelector('[data-re-receiver]');
      if(result.success){
        const chosen=(scene.world?.objects||[]).find(item=>item.id===result.expectedObjectId);
        if(receiver)receiver.innerHTML='<span aria-hidden="true">'+esc(chosen?.visual?.value||'✓')+'</span><small>✓</small>';
        if(status){
          status.dataset.state='success';
          status.innerHTML='<span>✓</span>';
          const next=transferCount===0?nextTransferScene(scenes,scene):null;
          if(next)status.insertAdjacentHTML('beforeend','<button type="button" class="re-grounded__next" data-re-next>Tiếp tục →</button>');
          else status.insertAdjacentHTML('beforeend','<span>Готово</span>');
        }
        section.querySelector('[data-re-next]')?.addEventListener('click',()=>{
          const next=transferCount===0?nextTransferScene(scenes,scene):null;
          if(!next)return;
          scene=next;supportLevel=0;transferCount++;render();
        },{once:true});
      }else{
        supportLevel=result.supportLevelAfter;
        button.classList.add('is-wrong');
        const target=section.querySelector('[data-re-object="'+CSS.escape(result.expectedObjectId)+'"]');
        if(supportLevel>=2)target?.classList.add('is-hint');
        if(status){status.dataset.state='retry';status.textContent='↻';}
        const support=section.querySelector('[data-re-support]');
        if(support)support.textContent=supportText(supportLevel);
        if(supportLevel===1||supportLevel===3)play(supportLevel>=3?.7:1);
        if(supportLevel>=8&&!section.querySelector('.re-grounded__transcript')){
          section.insertAdjacentHTML('beforeend','<p class="re-grounded__transcript" lang="ru">'+esc(scene.stimulus.audioText)+'</p>');
        }
      }
    }));
  };

  render();

  return {
    mounted:true,
    schema:'RUSSIAN_ENGINE_GROUNDED_BROWSER_EXPERIENCE_V1',
    status:()=>({
      sceneId:scene.sceneId,
      supportLevel,
      supportStep:GROUNDED_SUPPORT_STEPS[supportLevel],
      transferCount,
      evidenceCount:evidence.length
    }),
    evidence:()=>copy(evidence),
    unmount(){
      section.remove();
      if(host.childElementCount===0)host.remove();
      return true;
    }
  };
}
