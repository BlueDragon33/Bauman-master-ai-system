(()=>{
'use strict';
const TASK_TYPES=new Set(['BAUMAN_ASSIGN_TASK','BAUMAN_PLANNING_MISSION','BAUMAN_TODAY_TASK','BAUMAN_MAIN_TODAY','BAUMAN_TODAY_GOAL','BAUMAN_SCHEDULE_TODAY']);
const params=new URLSearchParams(location.search);
const inferredSubject=(location.pathname.match(/\/subjects\/([^/]+)/)||[])[1]||'';
const subjectId=window.SUBJECT_CONFIG?.id||window.SUBJECT_ADAPTER?.id||window.BAUMAN_SUBJECT_MANIFEST?.id||inferredSubject;
function httpOrigin(value){try{const url=new URL(String(value||''));return ['http:','https:'].includes(url.protocol)?url.origin:''}catch{return ''}}
const referrerOrigin=httpOrigin(document.referrer);
const hostOrigin=httpOrigin(params.get('hostOrigin'))||(window.parent!==window?referrerOrigin:'')||location.origin;
const listeners=new Set();
function numberParam(name){const value=Number(params.get(name));return Number.isFinite(value)?value:undefined}
function queryTask(){if(params.get('host')!=='main')return null;const querySubject=params.get('subjectId')||subjectId;if(subjectId&&querySubject!==subjectId)return null;return {type:'BAUMAN_ASSIGN_TASK',protocol:params.get('protocol')||'planning-v3',subjectId:querySubject,courseId:params.get('courseId')||'',taskId:params.get('taskId')||'',missionId:params.get('missionId')||params.get('taskId')||'',stage:params.get('stage')||'',learningItem:params.get('learningItem')||'',durationMinutes:numberParam('durationMinutes'),targetQuestions:numberParam('targetQuestions'),targetScore:numberParam('targetScore'),source:'bauman-main-query'}}
let latestTask=queryTask();
function validTask(task){return !!task&&typeof task==='object'&&TASK_TYPES.has(task.type)&&(!task.subjectId||!subjectId||task.subjectId===subjectId)}
function publishTask(task){if(!validTask(task))return false;latestTask={...task,subjectId:task.subjectId||subjectId};window.BAUMAN_HOST_TASK=latestTask;listeners.forEach(listener=>{try{listener(latestTask)}catch(error){console.warn('Subject task listener failed',error)}});window.dispatchEvent(new CustomEvent('bauman:host-task',{detail:latestTask}));return true}
function trusted(event){return window.parent!==window&&event.source===window.parent&&event.origin===hostOrigin}
function send(payload){if(window.parent===window||!hostOrigin)return false;try{window.parent.postMessage(payload,hostOrigin);return true}catch(error){console.warn('Subject bridge send failed',error);return false}}
function onTask(listener){if(typeof listener!=='function')return ()=>{};listeners.add(listener);if(latestTask)queueMicrotask(()=>listener(latestTask));return ()=>listeners.delete(listener)}
function ready(extra={}){return send({type:'BAUMAN_SUBJECT_READY',contract:'BAUMAN_SUBJECT_BRIDGE_V1',subjectId,...extra})}
function progress(report={}){return send({type:'BAUMAN_SUBJECT_PROGRESS',contract:'BAUMAN_SUBJECT_BRIDGE_V1',subjectId,...report})}
window.addEventListener('message',event=>{if(trusted(event))publishTask(event.data)});
window.BaumanSubjectHost={subjectId,hostOrigin,onTask,ready,progress,send,trusted,getTask:()=>latestTask};
if(latestTask)window.BAUMAN_HOST_TASK=latestTask;
const announce=()=>ready({queryTask:!!latestTask});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',announce,{once:true});else queueMicrotask(announce);
})();
