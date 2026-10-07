/* Transport boundary consumes only Hub-owned descriptors and existing task
 * contracts. It never loads subject implementation/configuration files. */
(()=>{
'use strict';
let host=null;
function bind(callbacks){host=callbacks}
function getDescriptor(id){return window.BAUMAN_HUB_SUBJECT_CONFIG.getDescriptor(id)}
function getLaunchState(id){const descriptor=getDescriptor(id);return {status:descriptor?.launch?'CURRENT':'UNAVAILABLE',subjectId:id,source:'HUB_APPLICATION_CONFIG',reason:descriptor?.launch?null:'Môn học chưa có cấu hình mở hợp lệ.'}}
function launch(id,context,mode){
 const state=getLaunchState(id),descriptor=getDescriptor(id);
 if(state.status!=='CURRENT'||!host){const unavailable={...state,status:'UNAVAILABLE'};host?.notify(unavailable.reason||'Môn học chưa sẵn sàng.');return unavailable}
 const task=host.buildTask(id,context||{}),src=host.taskURL(descriptor.launch.target,task);
 if(!src){const unavailable={...state,status:'UNAVAILABLE',reason:'Đường dẫn môn học không an toàn hoặc không hợp lệ.'};host.notify(unavailable.reason);return unavailable}
 host.recordLaunch(id,task);
 if(mode==='tab')host.openTab(src);else host.renderInHub(descriptor,src,task);
 return {...state,taskId:task.taskId};
}
window.BAUMAN_HUB_SUBJECT_LAUNCH=Object.freeze({bind,getDescriptor,getLaunchState,launchInHub:(id,context)=>launch(id,context,'hub'),launchInTab:(id,context)=>launch(id,context,'tab')});
})();
