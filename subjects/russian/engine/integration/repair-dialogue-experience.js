import {validateRepairDialogueCandidate,advanceRepairDialogueDraft} from '../conversation/repair-dialogue-candidate.mjs';
import {validateSpatialCandidate} from '../world/spatial-candidate-runtime.mjs';
import {applyPreviewDialogueDraft} from '../review/re55-shared-draft-corrections.mjs';
import {createPreviewSpeechGate} from './preview-speech-gate.mjs';
import {symbolForSpatialType} from './spatial-node-symbols.mjs';

const DIALOGUE_URL=new URL('../content/fixtures/repair-dialogues.r1-ai-proposal.json',import.meta.url);
const WORLD_URL=new URL('../content/fixtures/real-life-spatial.r2-ai-proposal.json',import.meta.url);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=x=>Number.isFinite(x)?Math.min(100,Math.max(0,x)):0;

const PHASE_HINT=Object.freeze({
  greet:'Mở lời lịch sự với người lạ.',
  request:'Hỏi đúng nhu cầu, không dùng mệnh lệnh với người lạ.',
  listen:'Nghe người kia trả lời. Bạn được quyền yêu cầu nhắc lại hoặc nói chậm.',
  repair:'Luyện nói câu nhờ nhắc lại hoặc nói chậm. Đây chỉ là tự luyện.',
  locate:'Chỉ vào nơi người kia đã hướng dẫn trên sơ đồ.',
  thank:'Cảm ơn người vừa giúp bạn.',
  done:'Đã hoàn thành mô phỏng. Không có điểm phát âm chính thức.'
});
export function repairDialogueFlag(locationLike){
  try{
    const u=new URL(locationLike?.href||String(locationLike||''),'https://local.invalid/');
    return u.searchParams.get('ruEngine')==='grounded-v1'
      &&u.searchParams.get('ruWorld')==='spatial-r2-candidate'
      &&u.searchParams.get('ruDialog')==='repair-v1';
  }catch(_){return false}
}
function addStyle(doc){
  if(doc.querySelector('[data-re44-style]'))return;
  const style=doc.createElement('style');
  style.dataset.re44Style='1';
  style.textContent=[
   '.re44-host{width:min(100%,1120px);margin:0 auto}',
   '.re44{padding:19px;margin:16px 0 24px;border:1px solid color-mix(in srgb,currentColor 18%,transparent);border-radius:20px;background:Canvas;color:CanvasText}',
   '.re44 *{box-sizing:border-box}',
   '.re44__head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}',
   '.re44__label{font-size:12px;font-weight:700;opacity:.7;letter-spacing:.03em}',
   '.re44__title{font-size:21px;font-weight:800;margin:9px 0}',
   '.re44__button{min-height:44px;border:1px solid color-mix(in srgb,currentColor 25%,transparent);border-radius:11px;background:transparent;color:inherit;padding:9px 12px;cursor:pointer;font:inherit}',
   '.re44__actions{display:flex;flex-wrap:wrap;gap:9px;margin:14px 0}',
   '.re44__context{line-height:1.55;font-size:14px;margin:10px 0}',
   '.re44__step{font-weight:750;font-size:16px;margin:12px 0}',
   '.re44__map{position:relative;min-height:340px;max-width:820px;aspect-ratio:1.8;border:1px solid color-mix(in srgb,currentColor 20%,transparent);border-radius:15px;overflow:hidden;background:repeating-linear-gradient(0deg,transparent 0 45px,color-mix(in srgb,currentColor 6%,transparent) 45px 46px),repeating-linear-gradient(90deg,transparent 0 45px,color-mix(in srgb,currentColor 6%,transparent) 45px 46px)}',
   '.re44__edges{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}',
   '.re44__node{position:absolute;transform:translate(-50%,-50%);padding:6px;min-height:56px;min-width:72px;max-width:120px;border:1px solid color-mix(in srgb,currentColor 24%,transparent);border-radius:10px;background:Canvas;color:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px}',
   '.re44__node:focus-visible,.re44__node.is-correct{outline:3px solid currentColor;outline-offset:3px}',
   '.re44__symbol{font-size:20px;font-weight:800}',
   '.re44__name{font-size:11px;font-weight:650;text-align:center;line-height:1.15}',
   '.re44__feedback{font-size:14px;font-weight:700;min-height:28px;margin:11px 0}',
   '.re44__script{font-size:20px;font-weight:700;line-height:1.5}',
   '.re44 [hidden]{display:none!important}',
   '@media(max-width:650px){.re44{padding:12px}.re44__map{aspect-ratio:auto;min-height:415px}.re44__node{min-width:62px;max-width:96px}.re44__name{font-size:10px}}'
  ].join('');
  doc.head.appendChild(style);
}
export async function mountRepairDialogueExperience({
  windowLike=globalThis.window,documentLike=globalThis.document,fetchFn=globalThis.fetch,speechProvider=null
}={}){
  if(!repairDialogueFlag(windowLike?.location))return {mounted:false,reason:'repair-flag-off'};
  if(!windowLike||!documentLike)return {mounted:false,reason:'browser-unavailable'};
  if(documentLike.querySelector('[data-re44-experience]'))return {mounted:true,reason:'already-mounted'};
  const [dialogResponse,worldResponse]=await Promise.all([fetchFn(DIALOGUE_URL),fetchFn(WORLD_URL)]);
  if(!dialogResponse?.ok||!worldResponse?.ok)throw new Error('RE44 draft fixtures unavailable');
  const [sourcePack,worldPack]=await Promise.all([dialogResponse.json(),worldResponse.json()]);
  const spatialCheck=validateSpatialCandidate(worldPack);
  const check=validateRepairDialogueCandidate(sourcePack,worldPack);
  if(!spatialCheck.ok||!check.ok)throw new Error('RE44 noncanonical structural preflight failed: '+[...spatialCheck.errors,...check.errors].join('; '));
  const pack=applyPreviewDialogueDraft(sourcePack);
  const view=documentLike.getElementById('view');
  const parent=view?.parentNode||documentLike.querySelector('.ru-main')||documentLike.querySelector('main')||documentLike.body;
  if(!parent)return {mounted:false,reason:'host-missing'};
  const host=documentLike.createElement('div');
  host.className='re44-host';
  host.dataset.russianEngineHost='1';
  if(view?.parentNode===parent)parent.insertBefore(host,view);else parent.prepend(host);
  const section=documentLike.createElement('section');
  section.className='re44';
  section.dataset.re44Experience='1';
  section.dataset.russianEngineGrounded='1';
  section.setAttribute('aria-label','Luyện hội thoại tiếng Nga với người lạ (bản thử nghiệm)');
  host.appendChild(section);
  addStyle(documentLike);
  let sceneIndex=0,state={phase:'greet',repairCount:0,repairMode:null},attempts=0;
  const speechGate=createPreviewSpeechGate({playStimulus:input=>speechProvider?.playStimulus?.(input)});
  const scene=()=>pack.scenes[sceneIndex];
  const world=()=>worldPack.worlds.find(w=>w.worldId===scene().worldId);
  function currentUtterance(){
    if(state.phase==='repair')return pack.repair[state.repairMode];
    if(state.phase==='listen'||state.phase==='locate')return scene().surface.reply;
    if(state.phase==='done')return scene().surface.closing;
    if(state.phase==='thank')return scene().surface.thanks;
    return scene().surface[state.phase]||'';
  }
  function play(rate=1){
    return speechGate.play({audioText:currentUtterance(),rate});
  }
  function feedback(value){
    const el=section.querySelector('[data-re44-feedback]');if(el)el.textContent=value;
  }
  function advance(action,nodeId){
    attempts++;
    speechGate.invalidate();
    const result=advanceRepairDialogueDraft({state,scene:scene(),action,nodeId});
    state=result.state;
    render(result);
  }
  function render(result=null){
    const s=scene(),w=world(),phase=state.phase;
    const nodesById=new Map(w.nodes.map(n=>[n.nodeId,n]));
    const lines=w.edges.map(e=>{
      const a=nodesById.get(e.from),b=nodesById.get(e.to);
      return a&&b?'<line x1="'+clamp(a.x)+'" y1="'+clamp(a.y)+'" x2="'+clamp(b.x)+'" y2="'+clamp(b.y)+'" stroke="currentColor" opacity=".27" stroke-width=".5"/>':'';
    }).join('');
    const nodes=w.nodes.map(n=>'<button type="button" class="re44__node" style="left:'+clamp(n.x)+'%;top:'+clamp(n.y)+'%" data-re44-node="'+esc(n.nodeId)+'" aria-label="Vị trí: '+esc(n.labelVi)+'"><span class="re44__symbol" aria-hidden="true">'+esc(symbolForSpatialType(n.visualType))+'</span><span class="re44__name">'+esc(n.labelVi)+'</span></button>').join('');
    const options=pack.scenes.map((entry,i)=>'<option value="'+i+'"'+(i===sceneIndex?' selected':'')+'>'+esc(entry.vn.setting)+'</option>').join('');
    const hint=phase==='greet'?s.vn.greeting:phase==='request'?s.vn.request:phase==='listen'?s.vn.reply:phase==='locate'?s.vn.replyHint:phase==='thank'?s.vn.thank:phase==='repair'?'Bạn có thể xin người kia nhắc lại hoặc nói chậm.':'Mô phỏng kết thúc.';
    section.innerHTML=[
      '<header class="re44__head"><div><div class="re44__label">RUSSIAN PRE-A0 · HỘI THOẠI THỬ NGHIỆM · CHƯA KIỂM DUYỆT</div>',
      '<div class="re44__title">Nghe → nói theo → xử lý khi không hiểu</div>',
      '<p class="re44__context">'+esc(s.vn.purpose)+'</p></div>',
      '<label class="re44__label">Chọn tình huống <select class="re44__button" data-re44-scene aria-label="Chọn tình huống">'+options+'</select></label></header>',
      '<p class="re44__step" data-re44-phase>Bước: '+esc(PHASE_HINT[phase])+'</p>',
      '<p class="re44__context" data-re44-hint>'+esc(hint)+'</p>',
      '<div class="re44__actions"><button type="button" class="re44__button" data-re44-play>▶ Nghe mẫu máy</button>',
      '<button type="button" class="re44__button" data-re44-slow>▶ Nghe chậm</button>',
      '<button type="button" class="re44__button" data-re44-show-script aria-expanded="false">Xem chữ Nga</button>',
      '<button type="button" class="re44__button" data-re44-shadow '+(!['greet','request','repair','thank'].includes(phase)?'hidden':'')+'>Tôi đã tập nói theo (tự đánh dấu)</button>',
      '<button type="button" class="re44__button" data-re44-repeat '+(phase!=='listen'?'hidden':'')+'>Xin nhắc lại</button>',
      '<button type="button" class="re44__button" data-re44-slower '+(phase!=='listen'?'hidden':'')+'>Xin nói chậm hơn</button>',
      '<button type="button" class="re44__button" data-re44-advance '+(phase!=='listen'?'hidden':'')+'>Tôi đã nghe → chọn vị trí</button>',
      '<button type="button" class="re44__button" data-re44-next '+(phase!=='done'?'hidden':'')+'>Tình huống tiếp theo →</button></div>',
      '<p class="re44__script" data-re44-script lang="ru" hidden>'+esc(currentUtterance())+'</p>',
      '<div class="re44__map" data-re44-map role="group" aria-label="Sơ đồ: '+esc(w.nameVi)+'">',
      '<svg class="re44__edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+lines+'</svg>',nodes,'</div>',
      '<p class="re44__feedback" data-re44-feedback aria-live="polite">',
      result?.wrongTarget?'Chưa đúng vị trí trên sơ đồ. Hãy nghe lại câu chỉ đường.':
        phase==='locate'?'Chọn đúng nơi vừa được chỉ dẫn trên sơ đồ.':
        phase==='done'?'✓ Hoàn thành mô phỏng; không có chấm điểm hay công nhận phát âm.':
        phase==='repair'?'Hãy nghe và tập nói câu nhờ nhắc lại/nói chậm.':
        result?.selfReported?'Bạn vừa tự đánh dấu đã luyện câu. Điều này không phải chấm phát âm.':
        'Bạn có thể nghe lặp lại, nghe chậm và tự luyện theo.',
      '</p><div class="re44__label">Giọng máy AI và câu thoại bản nháp chưa được người Nga kiểm duyệt; không gửi kết quả RU04, không tự phê duyệt RU03.</div>'
    ].join('');
    section.querySelector('[data-re44-scene]').addEventListener('change',event=>{
      const n=Number(event.currentTarget.value);if(!Number.isInteger(n)||n<0||n>=pack.scenes.length)return;
      speechGate.invalidate();sceneIndex=n;state={phase:'greet',repairCount:0,repairMode:null};render();
    });
    section.querySelector('[data-re44-play]').addEventListener('click',()=>{
      void play().then(r=>{if(!r.started&&!['busy','duplicate','stale','disposed'].includes(r.reason))feedback('Âm thanh chưa sẵn sàng. Có thể xem bản nháp chữ Nga khi cần.');});
    });
    section.querySelector('[data-re44-slow]').addEventListener('click',()=>{
      void play(.7).then(r=>{if(!r.started&&!['busy','duplicate','stale','disposed'].includes(r.reason))feedback('Không thể phát âm thanh chậm lúc này.');});
    });
    section.querySelector('[data-re44-show-script]').addEventListener('click',event=>{
      const node=section.querySelector('[data-re44-script]');node.hidden=!node.hidden;
      event.currentTarget.setAttribute('aria-expanded',String(!node.hidden));
    });
    section.querySelector('[data-re44-shadow]').addEventListener('click',()=>advance('shadow'));
    section.querySelector('[data-re44-repeat]').addEventListener('click',()=>advance('repair-repeat'));
    section.querySelector('[data-re44-slower]').addEventListener('click',()=>advance('repair-slower'));
    section.querySelector('[data-re44-advance]').addEventListener('click',()=>advance('advance'));
    section.querySelector('[data-re44-next]').addEventListener('click',()=>{
      speechGate.invalidate();sceneIndex=(sceneIndex+1)%pack.scenes.length;state={phase:'greet',repairCount:0,repairMode:null};render();
    });
    for(const node of section.querySelectorAll('[data-re44-node]'))node.addEventListener('click',()=>{
      if(state.phase==='locate')advance('locate',node.dataset.re44Node);
      else feedback('Hãy nghe và nói theo các lượt thoại trước khi chọn vị trí.');
    });
  }
  render();
  return {
    mounted:true,schema:'RUSSIAN_ENGINE_REPAIR_DIALOGUE_CANDIDATE_PREVIEW_V1',
    status:()=>({sceneId:scene().sceneId,setting:scene().worldId,catalog:'repair-dialogue-ai-draft',phase:state.phase,
      repairCount:state.repairCount,previewOnly:true,evidenceCount:0,masteryMutation:false,canonicalPublicationReady:false,attemptCount:attempts}),
    evidence:()=>[],
    unmount(){speechGate.dispose();section.remove();if(!host.childElementCount)host.remove();return true}
  };
}
