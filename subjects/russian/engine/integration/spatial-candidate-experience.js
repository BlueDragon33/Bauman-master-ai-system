import {validateSpatialCandidate,evaluateSpatialCandidateAction} from '../world/spatial-candidate-runtime.mjs';
import {createPreviewSpeechGate} from './preview-speech-gate.mjs';
import {applyPreviewSpatialDraft} from '../review/re55-shared-draft-corrections.mjs';

const CATALOG_URL=new URL('../content/fixtures/real-life-spatial.r2-ai-proposal.json',import.meta.url);
const arr=x=>Array.isArray(x)?x:[];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const coord=x=>Number.isFinite(x)?Math.min(100,Math.max(0,x)):0;
const ICON=Object.freeze({
 doorway:'🚪',shelf:'▥',bookcase:'📚',table:'▤',person:'●',entrance:'↪',
 fridge:'▣',counter:'▤',street:'━━',stairs:'⇲',machine:'▣','map-board':'▦',
 platform:'═',lobby:'▤',desk:'▤',corridor:'→','numbered-room':'12','shower-room':'🚿','lecture-room':'12'
});
const LABEL=Object.freeze({
 'point-to-location':'Chọn đúng nơi trên sơ đồ',
 'handover-object':'Tìm đồ vật rồi chuyển tới người nhận',
 'dialogue-intent':'Luyện câu đề nghị lịch sự'
});
const SETTINGS=Object.freeze({room:'Phòng sinh hoạt',shop:'Cửa hàng',metro:'Metro',dorm:'Ký túc xá',university:'Trường đại học'});
// Vietnamese scenario intentions are scaffolding, not verified word-for-word translations.
const INTENT_VI=Object.freeze({
  'rl-01-room':'Người bạn nhờ bạn đưa quả bóng.',
  'rl-02-room':'Người bạn nhờ bạn đưa sách.',
  'rl-03-room':'Cần tìm vị trí chiếc cốc.',
  'rl-04-shop':'Hỏi nhân viên cửa hàng nơi bán bánh mì.',
  'rl-05-shop':'Bạn là khách và muốn mua một chai nước bằng lời đề nghị lịch sự.',
  'rl-06-shop':'Hỏi nhân viên chỗ để sữa.',
  'rl-07-metro':'Hỏi nơi có thể mua vé đi metro.',
  'rl-08-metro':'Tìm sơ đồ các tuyến metro, không phải thẻ đi tàu.',
  'rl-09-metro':'Đang ở ngoài phố, cần tìm lối xuống ga metro.',
  'rl-10-dorm':'Tìm chìa khóa phòng ở ký túc xá.',
  'rl-11-dorm':'Hỏi nơi có phòng số 12, không phải một cánh cửa bất kỳ.',
  'rl-12-dorm':'Hỏi nhân viên vị trí phòng tắm chung.',
  'rl-13-university':'Hỏi tìm phòng học số 12, không phải cả tòa trường.',
  'rl-14-university':'Hỏi tìm vị trí thư viện.',
  'rl-15-university':'Nhờ bạn học chuyển quyển vở.'
});
export function spatialCandidateLocation(locationLike){
  try{
    const url=new URL(locationLike?.href||String(locationLike||''),'https://local.invalid/');
    return {enabled:url.searchParams.get('ruEngine')==='grounded-v1'&&url.searchParams.get('ruWorld')==='spatial-r2-candidate',setting:url.searchParams.get('ruSetting')||'room'};
  }catch(_){return {enabled:false,setting:'room'}}
}

function ensureStyles(doc){
  if(doc.querySelector('[data-re-spatial-style]'))return;
  const style=doc.createElement('style');
  style.dataset.reSpatialStyle='1';
  style.textContent=[
    '.re-spatial-host{width:min(100%,1120px);margin:0 auto}',
    '.re-spatial{margin:16px 0 24px;padding:20px;border:1px solid color-mix(in srgb,currentColor 16%,transparent);border-radius:20px;background:Canvas;color:CanvasText}',
    '.re-spatial *{box-sizing:border-box}',
    '.re-spatial header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}',
    '.re-spatial__label{font-size:12px;letter-spacing:.04em;font-weight:700;opacity:.75}',
    '.re-spatial__title{font-size:20px;font-weight:750;margin:7px 0}',
    '.re-spatial__note{font-size:12px;opacity:.75;line-height:1.5}',
    '.re-spatial__control{font:inherit;color:inherit;border:1px solid color-mix(in srgb,currentColor 24%,transparent);background:transparent;padding:9px 12px;border-radius:10px;min-height:44px;cursor:pointer}',
    '.re-spatial__toolbar{display:flex;gap:9px;flex-wrap:wrap;margin:16px 0 12px}',
    '.re-spatial__help{margin:0 0 12px;font-size:14px;line-height:1.6;border-left:3px solid currentColor;padding:4px 12px;opacity:.9}',
    '.re-spatial__map{position:relative;min-height:350px;max-width:820px;aspect-ratio:1.8;overflow:hidden;border:1px solid color-mix(in srgb,currentColor 24%,transparent);border-radius:15px;background:repeating-linear-gradient(0deg,transparent 0 49px,color-mix(in srgb,currentColor 6%,transparent) 49px 50px),repeating-linear-gradient(90deg,transparent 0 49px,color-mix(in srgb,currentColor 6%,transparent) 49px 50px)}',
    '.re-spatial__edges{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}',
    '.re-spatial__node{position:absolute;transform:translate(-50%,-50%);border:1px solid color-mix(in srgb,currentColor 22%,transparent);border-radius:12px;background:Canvas;color:CanvasText;min-height:58px;min-width:74px;max-width:125px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:5px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.09)}',
    '.re-spatial__node:focus-visible{outline:3px solid currentColor;outline-offset:3px}',
    '.re-spatial__node.is-correct{outline:3px solid currentColor;outline-offset:3px}',
    '.re-spatial__node.is-picked{border-width:3px}',
    '.re-spatial__symbol{font-size:20px;line-height:1.1;font-weight:800}',
    '.re-spatial__place{font-size:11px;line-height:1.25;font-weight:650;text-align:center}',
    '.re-spatial__feedback{min-height:32px;font-weight:700;font-size:14px;margin:13px 0 8px}',
    '.re-spatial__footer{display:flex;flex-wrap:wrap;gap:9px;margin-top:10px}',
    '.re-spatial__script{font-size:20px;font-weight:650;line-height:1.5;margin:12px 0}',
    '[data-re-spatial-help][hidden],[data-re-spatial-script][hidden]{display:none!important}',
    '@media(max-width:650px){.re-spatial{padding:12px}.re-spatial__map{aspect-ratio:auto;min-height:420px}.re-spatial__node{min-width:60px;max-width:94px;min-height:60px}.re-spatial__place{font-size:10px}.re-spatial__symbol{font-size:17px}}'
  ].join('');
  doc.head.appendChild(style);
}

export async function mountSpatialCandidateExperience({
  windowLike=globalThis.window,
  documentLike=globalThis.document,
  fetchFn=globalThis.fetch,
  speechProvider=null
}={}){
  const opts=spatialCandidateLocation(windowLike?.location);
  if(!opts.enabled)return {mounted:false,reason:'preview-flag-off'};
  // RE44 is a third explicit opt-in: no Russian draft dialogue in default learning.
  if(new URL(windowLike.location?.href||'https://local.invalid/').searchParams.get('ruDialog')==='repair-v1'){
    const {mountRepairDialogueExperience}=await import('./repair-dialogue-experience.js');
    return mountRepairDialogueExperience({windowLike,documentLike,fetchFn,speechProvider});
  }
  if(!windowLike||!documentLike)return {mounted:false,reason:'browser-unavailable'};
  if(documentLike.querySelector('[data-re-spatial-candidate]'))return {mounted:true,reason:'already-mounted'};
  const view=documentLike.getElementById('view');
  const target=view?.parentNode||documentLike.querySelector('.ru-main')||documentLike.querySelector('main')||documentLike.body;
  if(!target)return {mounted:false,reason:'host-missing'};
  const response=await fetchFn(CATALOG_URL);
  if(!response?.ok)throw new Error('RE43 candidate proposal unavailable');
  const sourcePack=await response.json();
  const check=validateSpatialCandidate(sourcePack);
  if(!check.ok)throw new Error('RE43 proposal invalid: '+check.errors.join('; '));
  const pack=applyPreviewSpatialDraft(sourcePack);
  const worlds=arr(pack.worlds);
  let setting=worlds.some(w=>w.worldId===opts.setting)?opts.setting:worlds[0].worldId;
  let index=0,attempts=0,completions=0,phase='select',pickedFrom='';
  const speechGate=createPreviewSpeechGate({playStimulus:input=>speechProvider?.playStimulus?.(input)});
  const host=documentLike.createElement('div');
  host.className='re-spatial-host';
  host.dataset.russianEngineHost='1';
  if(view?.parentNode===target)target.insertBefore(host,view);
  else target.prepend(host);
  const section=documentLike.createElement('section');
  section.className='re-spatial';
  section.dataset.reSpatialCandidate='1';
  section.dataset.russianEngineGrounded='1';
  section.setAttribute('aria-label','Thử nghiệm luyện nghe tiếng Nga bằng sơ đồ tình huống');
  host.appendChild(section);
  ensureStyles(documentLike);
  const getScenes=()=>arr(pack.scenes).filter(s=>s.worldId===setting);
  const getScene=()=>getScenes()[index];
  const getWorld=()=>worlds.find(w=>w.worldId===setting);
  const reset=()=>{speechGate.invalidate();phase='select';pickedFrom=''};
  const setFeedback=text=>{const p=section.querySelector('[data-re-spatial-feedback]');if(p)p.textContent=text};
  const mark=(id,cls)=>{for(const e of section.querySelectorAll('[data-re-spatial-node]'))if(e.dataset.reSpatialNode===id)e.classList.add(cls)};
  function play(rate){
    return speechGate.play({audioText:getScene().russianDraft,rate});
  }
  function choose(id){
    const scene=getScene(),action=scene.expectedAction;
    if(action.kind==='dialogue-intent'){
      setFeedback('Bài này luyện nghe và nhại lời đề nghị, chưa kiểm tra giọng nói. Hãy nghe câu mẫu.');
      return;
    }
    if(phase==='done')return;
    attempts++;
    if(action.kind==='handover-object'&&phase==='select'){
      if(id!==action.fromNodeId){
        setFeedback('Chưa phải vị trí đặt đồ vật. Thử lại hoặc mở gợi ý.');return;
      }
      pickedFrom=id;phase='handover';mark(id,'is-picked');
      setFeedback('Đã xác định nơi lấy vật. Bây giờ chọn người nhận.');return;
    }
    const result=action.kind==='point-to-location'
      ?evaluateSpatialCandidateAction({scene,kind:action.kind,targetId:id})
      :evaluateSpatialCandidateAction({scene,kind:action.kind,targetId:action.targetId,fromNodeId:pickedFrom,toNodeId:id});
    if(!result.success){
      setFeedback(action.kind==='point-to-location'?'Chưa đúng vị trí trên sơ đồ. Nghe lại hoặc xem gợi ý.':'Chưa đúng người nhận. Chọn lại trên sơ đồ.');return;
    }
    phase='done';completions++;mark(id,'is-correct');
    setFeedback(action.kind==='point-to-location'
      ?'✓ Đúng vị trí trong sơ đồ mô phỏng. Đây chưa phải kiểm tra khả năng chỉ đường thực tế.'
      :'✓ Đã mô phỏng trao đúng vật cho đúng người. Đây chưa phải chứng nhận tiếng Nga.');
    const next=section.querySelector('[data-re-spatial-next]');if(next)next.hidden=false;
  }
  function render(){
    const scene=getScene(),world=getWorld();
    if(!scene||!world)throw new Error('RE43 scene/world mismatch');
    const byId=new Map(world.nodes.map(n=>[n.nodeId,n]));
    const edges=world.edges.map(e=>{
      const a=byId.get(e.from),b=byId.get(e.to);
      return a&&b?'<line x1="'+coord(a.x)+'" y1="'+coord(a.y)+'" x2="'+coord(b.x)+'" y2="'+coord(b.y)+'" stroke="currentColor" stroke-width=".5" opacity=".3"/>':'';
    }).join('');
    const nodes=world.nodes.map(n=>'<button type="button" class="re-spatial__node" style="left:'+coord(n.x)+'%;top:'+coord(n.y)+'%" data-re-spatial-node="'+esc(n.nodeId)+'" aria-label="Vị trí: '+esc(n.labelVi)+'"><span class="re-spatial__symbol" aria-hidden="true">'+esc(ICON[n.visualType]||'▢')+'</span><span class="re-spatial__place">'+esc(n.labelVi)+'</span></button>').join('');
    const options=worlds.map(w=>'<option value="'+esc(w.worldId)+'"'+(w.worldId===setting?' selected':'')+'>'+esc(SETTINGS[w.worldId]||w.nameVi)+'</option>').join('');
    const isTalk=scene.expectedAction.kind==='dialogue-intent';
    section.innerHTML=[
      '<header><div><div class="re-spatial__label">RUSSIAN A0 · BẢN MẪU THỬ · CHƯA KIỂM DUYỆT TIẾNG NGA</div>',
      '<div class="re-spatial__title">'+esc(LABEL[scene.expectedAction.kind])+'</div>',
      '<div class="re-spatial__note">Bối cảnh: '+esc(world.nameVi)+' · Bài '+(index+1)+'/'+getScenes().length+' · không chấm điểm chính thức</div></div>',
      '<label class="re-spatial__label">Bối cảnh <select class="re-spatial__control" data-re-spatial-setting aria-label="Đổi bối cảnh">'+options+'</select></label></header>',
      '<div class="re-spatial__toolbar"><button type="button" class="re-spatial__control" data-re-spatial-play>▶ Nghe mẫu AI</button>',
      '<button type="button" class="re-spatial__control" data-re-spatial-slow>▶ Nghe chậm</button>',
      '<button type="button" class="re-spatial__control" data-re-spatial-help-toggle aria-expanded="false">Gợi ý (VI)</button>',
      '<button type="button" class="re-spatial__control" data-re-spatial-script-toggle aria-expanded="false">Xem chữ Nga</button></div>',
      '<p class="re-spatial__help" data-re-spatial-help hidden><strong>Mục đích tình huống:</strong> '+esc(INTENT_VI[scene.sceneId]||'Quan sát, nghe và chọn vị trí.')+' Đây là gợi ý tiếng Việt, không phải bản dịch Nga được kiểm định. ',
      isTalk?'Đây là tình huống mua một chai nước: nghe lời yêu cầu rồi tập nhại. Không chấm phát âm.':scene.expectedAction.kind==='handover-object'?'Bước 1: chọn nơi có vật. Bước 2: chọn người nhận.':'Chọn một vị trí trên sơ đồ; không chỉ nhận biết biểu tượng đồ vật.',
      ' Câu nháp và giọng máy chưa được người Nga kiểm duyệt.</p>',
      '<p class="re-spatial__script" data-re-spatial-script hidden lang="ru">'+esc(scene.russianDraft)+'</p>',
      '<div class="re-spatial__map" data-re-spatial-map role="group" aria-label="Sơ đồ: '+esc(world.nameVi)+'">',
      '<svg class="re-spatial__edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+edges+'</svg>',nodes,'</div>',
      '<p class="re-spatial__feedback" data-re-spatial-feedback aria-live="polite">',
      isTalk?'Nghe mẫu và nhại lời nói. Chưa có chấm phát âm.':'Bấm nghe rồi chọn đúng nơi trên sơ đồ. Bạn có thể mở gợi ý tiếng Việt.','</p>',
      '<div class="re-spatial__footer"><button type="button" class="re-spatial__control" data-re-spatial-next '+(isTalk?'':'hidden')+'>Bài tiếp theo →</button>',
      '<span class="re-spatial__note">R2 AI nháp · không gửi điểm RU04 · không phê duyệt RU03</span></div>'
    ].join('');
    const help=section.querySelector('[data-re-spatial-help]');
    const script=section.querySelector('[data-re-spatial-script]');
    section.querySelector('[data-re-spatial-play]').addEventListener('click',()=>{
      void play(1).then(result=>{if(!result.started&&!['busy','duplicate','stale','disposed'].includes(result.reason))setFeedback('Âm thanh máy hiện không sẵn sàng. Có thể mở chữ Nga hoặc thử lại.');});
    });
    section.querySelector('[data-re-spatial-slow]').addEventListener('click',()=>{
      void play(.75).then(result=>{if(!result.started&&!['busy','duplicate','stale','disposed'].includes(result.reason))setFeedback('Không thể phát âm thanh lúc này.');});
    });
    section.querySelector('[data-re-spatial-help-toggle]').addEventListener('click',event=>{
      help.hidden=!help.hidden;event.currentTarget.setAttribute('aria-expanded',String(!help.hidden));
    });
    section.querySelector('[data-re-spatial-script-toggle]').addEventListener('click',event=>{
      script.hidden=!script.hidden;event.currentTarget.setAttribute('aria-expanded',String(!script.hidden));
    });
    section.querySelector('[data-re-spatial-setting]').addEventListener('change',event=>{
      if(!worlds.some(w=>w.worldId===event.currentTarget.value))return;
      setting=event.currentTarget.value;index=0;reset();render();
    });
    for(const node of section.querySelectorAll('[data-re-spatial-node]'))node.addEventListener('click',()=>choose(node.dataset.reSpatialNode));
    section.querySelector('[data-re-spatial-next]').addEventListener('click',()=>{
      index=(index+1)%getScenes().length;reset();render();
    });
  }
  render();
  return {
    mounted:true,
    schema:'RUSSIAN_ENGINE_SPATIAL_CANDIDATE_BROWSER_PREVIEW_V1',
    status:()=>({
      sceneId:getScene()?.sceneId||null,setting,catalog:'spatial-r2-candidate',
      previewOnly:true,canonicalPublicationReady:false,masteryMutation:false,
      evidenceCount:0,attemptCount:attempts,completedPreviewCount:completions
    }),
    evidence:()=>[],
    unmount(){speechGate.dispose();section.remove();if(!host.childElementCount)host.remove();return true}
  };
}
