/* Bauman Math Learning Model V1
 * Canonical learner-route normalization layer.
 * Authority: theory_lecture_frame + theory_lecture_content.
 * Compatibility paths (E129/E169/E186) are derived outputs only.
 */
(function mathLearningModel(global){
  'use strict';

  const RELEASE='MATH_LEARNING_MODEL_V1';
  const ACTIVITY_TO_STEP={
    theory:'understand',
    exercises:'practice',
    practice:'visualize',
    application:'application',
    review:'summary',
    exam:'check'
  };
  const STEP_TO_ACTIVITY={
    objective:'theory',
    warmup:'theory',
    understand:'theory',
    visualize:'practice',
    example:'theory',
    formula:'theory',
    application:'application',
    practice:'exercises',
    check:'exam',
    summary:'review',
    complete:'review',
    next:'theory'
  };

  const arr=v=>Array.isArray(v)?v:[];
  const str=v=>String(v==null?'':v);
  const api=()=>global.__BAUMAN_CORE_API||{};
  function state(){
    let st=api().state||global.__MATH_STATE;
    if(!st){st={view:'learning',learnTab:'theory',stage:'vn'};global.__MATH_STATE=st;}
    return st;
  }
  function save(){try{api().save&&api().save();}catch(_){}}

  function framePayload(){
    const db=global.DB||{};
    return db.theory_lecture_frame||{};
  }
  function contentPayload(){
    const db=global.DB||{};
    let raw=db.theory_lecture_content||{};
    let rows=extractRows(raw);
    if(rows.length)return raw;
    try{
      const src=global.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE;
      if(src&&typeof src.getPayload==='function')raw=src.getPayload()||{};
    }catch(_){}
    return raw||{};
  }
  function extractRows(raw){
    if(Array.isArray(raw))return raw;
    if(!raw||typeof raw!=='object')return [];
    for(const key of ['records','lessons','items','content']){
      if(Array.isArray(raw[key]))return raw[key];
    }
    return raw.data?extractRows(raw.data):[];
  }

  function stages(){
    return arr(framePayload().stages).map((st,stageIndex)=>{
      const disciplines=arr(st.disciplines).map((d,disciplineIndex)=>{
        const chapters=arr(d.chapters).map((ch,chapterIndex)=>({
          id:str(ch.chapterId||ch.id),
          chapterId:str(ch.chapterId||ch.id),
          no:Number(ch.chapterNo||ch.globalChapterNo||0)||0,
          localNo:Number(ch.localChapterNo||chapterIndex+1)||chapterIndex+1,
          title:str(ch.chapterTitle||ch.title||ch.chapterId),
          stageId:str(ch.stageId||st.stageId||st.id),
          stageTitle:str(ch.stageTitle||st.stageTitle||st.title),
          disciplineId:str(ch.disciplineId||d.disciplineId||d.id),
          disciplineTitle:str(ch.disciplineTitle||d.disciplineTitle||d.title),
          targetOutcome:str(ch.targetOutcome||''),
          bridgeQuestion:str(ch.bridgeQuestion||''),
          suggestedLessonCount:Number(ch.suggestedLessonCount||0)||0,
          contentStatus:str(ch.contentStatus||''),
          locked:!!ch.locked,
          frameworkOnly:!!ch.phdFrameworkOnly||!!ch.notIncludedInLearningGeneration,
          order:chapterIndex
        })).filter(ch=>ch.id);
        return {
          id:str(d.disciplineId||d.id),
          disciplineId:str(d.disciplineId||d.id),
          title:str(d.disciplineTitle||d.title||d.disciplineId),
          stageId:str(st.stageId||st.id),
          order:disciplineIndex,
          chapters
        };
      }).filter(d=>d.id);
      return {
        id:str(st.stageId||st.id),
        stageId:str(st.stageId||st.id),
        title:str(st.stageTitle||st.title||st.stageId),
        order:stageIndex,
        disciplines
      };
    }).filter(st=>st.id);
  }

  function flatChapters(){
    const out=[];
    stages().forEach(st=>st.disciplines.forEach(d=>d.chapters.forEach(ch=>out.push(ch))));
    return out;
  }
  function lessons(chapterId){
    const id=str(chapterId);
    return extractRows(contentPayload()).filter(r=>str(r.chapterId)===id).map((r,index)=>({
      id:str(r.lessonId||r.id),
      lessonId:str(r.lessonId||r.id),
      chapterId:id,
      title:str(r.title||r.lessonTitle||r.lessonId||r.id),
      duration:Number(r.durationMinutes||r.estimatedMinutes||0)||0,
      order:Number(r.order||r.lessonNo||index+1)||index+1,
      record:r
    })).filter(x=>x.id).sort((a,b)=>a.order-b.order);
  }
  function findStage(id){return stages().find(x=>x.id===str(id))||null;}
  function findDiscipline(stageId,id){
    const st=findStage(stageId);return st?st.disciplines.find(x=>x.id===str(id))||null:null;
  }
  function findChapter(id){return flatChapters().find(x=>x.id===str(id))||null;}
  function findLesson(id){
    const lid=str(id);if(!lid)return null;
    const row=extractRows(contentPayload()).find(r=>str(r.lessonId||r.id)===lid);
    if(!row)return null;
    return {id:lid,lessonId:lid,chapterId:str(row.chapterId),title:str(row.title||row.lessonTitle||lid),record:row};
  }
  function chapterFromLessonId(lessonId){
    const hit=findLesson(lessonId);if(hit)return findChapter(hit.chapterId);
    const lid=str(lessonId);
    return flatChapters().find(ch=>lid.startsWith(ch.id+'-')||lid.startsWith(ch.id))||null;
  }

  function routeCandidate(patch){
    const st=state(), current=st.mathRoute||{}, e186=st.e186Path||{}, next=patch||{};
    const has=key=>Object.prototype.hasOwnProperty.call(next,key);
    const lessonId=str(has('lessonId')?next.lessonId:(st.e129LessonId||e186.lessonId||current.lessonId||''));
    const byLesson=chapterFromLessonId(lessonId);
    let chapterId=str(has('chapterId')?next.chapterId:(byLesson?.id||st.e129ChapterId||current.chapterId||''));
    let chapter=findChapter(chapterId)||byLesson;
    if(chapter)chapterId=chapter.id;

    let stageId=str(has('stageId')?next.stageId:(chapter?.stageId||current.stageId||st.stage||''));
    let disciplineId=str(has('disciplineId')?next.disciplineId:(chapter?.disciplineId||current.disciplineId||''));

    const allStages=stages();
    if(allStages.length){
      let stage=findStage(stageId)||allStages.find(x=>x.id===str(st.stage))||allStages[0];
      stageId=stage.id;
      let discipline=findDiscipline(stageId,disciplineId);
      if(chapter&&chapter.stageId===stageId){
        discipline=findDiscipline(stageId,chapter.disciplineId)||discipline;
      }
      discipline=discipline||stage.disciplines[0]||null;
      disciplineId=discipline?.id||disciplineId;

      if(!chapter||chapter.stageId!==stageId||chapter.disciplineId!==disciplineId){
        chapter=discipline?.chapters.find(x=>x.id===chapterId)||discipline?.chapters[0]||null;
        chapterId=chapter?.id||chapterId;
      }
    }

    const available=lessons(chapterId);
    let resolvedLesson=lessonId;
    if(available.length&&!available.some(x=>x.id===resolvedLesson))resolvedLesson=available[0].id;

    const activityId=str(has('activityId')?next.activityId:(st.learnTab||e186.activityId||current.activityId||'theory'))||'theory';
    const stepId=str(has('stepId')?next.stepId:(current.stepId||ACTIVITY_TO_STEP[activityId]||'understand'));

    return {stageId,disciplineId,chapterId,lessonId:resolvedLesson,stepId,activityId};
  }

  function legacyForChapter(chapter){
    const no=Number(chapter?.no||0);
    let moduleId='pure',courseId='pure-algebra';
    if(no>=4&&no<=7)courseId='pure-analysis';
    else if(no>=8&&no<=9)courseId='pure-geometry';
    else if(no>=10&&no<=11)courseId='pure-logic';
    else if(no>=12&&no<=14){moduleId='applied';courseId='applied-probability';}
    else if(no>=15&&no<=17){moduleId='applied';courseId='applied-discrete';}
    else if(no>=18){moduleId='applied';courseId='applied-optimization';}
    return {moduleId,courseId,chapterId:no?('c'+String(no).padStart(2,'0')):'c01'};
  }

  function syncCompatibility(route){
    const st=state(), chapter=findChapter(route.chapterId), legacy=legacyForChapter(chapter);
    if(route.stageId)st.stage=route.stageId;
    if(route.chapterId)st.e129ChapterId=route.chapterId;
    if(route.lessonId)st.e129LessonId=route.lessonId;
    st.learnTab=route.activityId||STEP_TO_ACTIVITY[route.stepId]||'theory';
    st.e186Path=Object.assign({},st.e186Path||{},legacy,{
      lessonId:route.lessonId||'',
      activityId:st.learnTab
    });
    st.e169Path=Object.assign({},st.e169Path||{},st.e186Path,{contentId:route.lessonId||''});
  }

  function getRoute(){
    const route=routeCandidate();
    const st=state();
    st.mathRoute=Object.assign({},st.mathRoute||{},route);
    return Object.assign({},st.mathRoute);
  }
  function setRoute(patch,opts){
    const st=state(), route=routeCandidate(patch||{});
    st.mathRoute=Object.assign({},st.mathRoute||{},route);
    syncCompatibility(st.mathRoute);
    if(opts?.save!==false)save();
    if(opts?.emit!==false){try{global.dispatchEvent(new CustomEvent('bauman-math-route-change',{detail:Object.assign({},st.mathRoute)}));}catch(_){}}
    return Object.assign({},st.mathRoute);
  }

  function getDisciplines(stageId){
    return findStage(stageId)?.disciplines||[];
  }
  function getChapters(stageId,disciplineId){
    return findDiscipline(stageId,disciplineId)?.chapters||[];
  }
  function getLessons(chapterId){return lessons(chapterId);}
  function getCrumbs(route){
    const r=route||getRoute(), st=findStage(r.stageId), d=findDiscipline(r.stageId,r.disciplineId), ch=findChapter(r.chapterId);
    const ls=lessons(r.chapterId), lesson=ls.find(x=>x.id===r.lessonId)||findLesson(r.lessonId);
    return [
      {level:'stage',id:r.stageId,label:st?.title||r.stageId||'Giai đoạn'},
      {level:'discipline',id:r.disciplineId,label:d?.title||r.disciplineId||'Phân môn'},
      {level:'chapter',id:r.chapterId,label:ch?.title||r.chapterId||'Chương'},
      {level:'lesson',id:r.lessonId,label:lesson?.title||r.lessonId||'Bài học'},
      {level:'step',id:r.stepId,label:r.stepId||'Bước học'}
    ];
  }
  function ready(){return stages().length>0;}

  function selfCheck(){
    const ss=stages(), chapters=flatChapters(), route=getRoute(), chapter=findChapter(route.chapterId);
    return {
      release:RELEASE,
      ready:ss.length>0,
      stages:ss.length,
      disciplines:ss.reduce((n,s)=>n+s.disciplines.length,0),
      chapters:chapters.length,
      route,
      routeChapterResolved:!route.chapterId||!!chapter,
      authoritativeFrame:'theory_lecture_frame',
      authoritativeContent:'theory_lecture_content',
      compatibilityWritesOnly:true,
      duplicateAcademicData:false
    };
  }

  global.BAUMAN_MATH_LEARNING_MODEL={
    release:RELEASE,ready,stages,getDisciplines,getChapters,getLessons,
    findStage,findDiscipline,findChapter,findLesson,getRoute,setRoute,getCrumbs,
    activityToStep:id=>ACTIVITY_TO_STEP[id]||'understand',
    stepToActivity:id=>STEP_TO_ACTIVITY[id]||'theory',
    selfCheck
  };
})(window);
