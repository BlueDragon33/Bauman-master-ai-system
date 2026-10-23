/* Transport boundary consumes only Hub-owned descriptors and existing task
 * contracts. It never loads subject implementation/configuration files. */
(()=>{
'use strict';
let host=null;
function bind(callbacks){host=callbacks}
function subjectUrl(path){try{if(typeof path!=='string'||!path.trim())return null;const url=new URL(path,location.href);return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password?url:null}catch{return null}}
function withTaskQuery(path,task){
 const url=subjectUrl(path);if(!url)return '';
 const raw=task.capabilityRoute,view=String(raw?.view||'').slice(0,32),learnTab=String(raw?.learnTab||'').slice(0,32),lessonId=String(raw?.lessonId||'').slice(0,80);
 const route=view&&lessonId?{view,learnTab,lessonId}:null;
 const fields={host:'main',hostOrigin:location.origin,subjectId:task.subjectId||'',courseId:task.courseId||'',taskId:task.taskId||task.missionId||'',missionId:task.missionId||task.taskId||'',stage:task.stage||'',learningItem:task.learningItem||task.target||'',durationMinutes:task.durationMinutes||'',targetQuestions:task.targetQuestions||100,targetScore:task.targetScore||80,protocol:'planning-v3',...(route?{routeView:route.view,routeTab:route.learnTab,routeLesson:route.lessonId,capabilityBand:task.capabilityBand||''}:{})};
 Object.entries(fields).forEach(([key,value])=>url.searchParams.set(key,String(value)));return url.href;
}
function getDescriptor(id){return window.BAUMAN_HUB_SUBJECT_CONFIG.getDescriptor(id)}
function getLaunchState(id){const descriptor=getDescriptor(id);return {status:descriptor?.launch?'CURRENT':'UNAVAILABLE',subjectId:id,source:'HUB_APPLICATION_CONFIG',reason:descriptor?.launch?null:'Môn học chưa có cấu hình mở hợp lệ.'}}
function launch(id,context,mode){
 const state=getLaunchState(id),descriptor=getDescriptor(id);
 if(state.status!=='CURRENT'||!host){const unavailable={...state,status:'UNAVAILABLE'};host?.notify(unavailable.reason||'Môn học chưa sẵn sàng.');return unavailable}
 const task=host.buildTask(id,context||{}),src=withTaskQuery(descriptor.launch.target,task);
 if(!src){const unavailable={...state,status:'UNAVAILABLE',reason:'Đường dẫn môn học không an toàn hoặc không hợp lệ.'};host.notify(unavailable.reason);return unavailable}
 host.recordLaunch(id,task);
 if(mode==='tab')host.openTab(src);else host.renderInHub(descriptor,src,task);
 return {...state,taskId:task.taskId};
}
window.BAUMAN_HUB_SUBJECT_LAUNCH=Object.freeze({bind,getDescriptor,getLaunchState,subjectUrl,withTaskQuery,launchInHub:(id,context)=>launch(id,context,'hub'),launchInTab:(id,context)=>launch(id,context,'tab')});
})();
