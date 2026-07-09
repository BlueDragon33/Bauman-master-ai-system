/* E244 · Lesson-scoped theory artifact registry
 * Registers optional Reference / Full View / Normalization sources.
 * Data registration only: no reader rendering, no UI, no slideshow engine.
 */
(function(){
  'use strict';

  var RELEASE='E244_LESSON_SCOPED_THEORY_ARTIFACT_REGISTRY';
  var GROUP='Bài giảng lý thuyết · Artifact phụ';
  var REGISTRY={
    'MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140':{
      lessonId:'MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140',
      lessonTitle:'§1.4 · Cơ sở, span và tọa độ',
      academicStatus:'accepted',
      reference:{id:'theory_reference_c01_l04',label:'Tham khảo thêm · §1.4',path:'data/theory_reference/theory_reference_c01_l04.json',version:'REFERENCE_C01_L04_V1_APPROVED'},
      fullView:{id:'theory_full_view_c01_l04',label:'Xem đầy đủ · §1.4',path:'data/theory_full_view/theory_full_view_c01_l04.json',version:'FULL_VIEW_C01_L04_V1_APPROVED'},
      normalization:{id:'theory_normalization_c01_l04',label:'Chuẩn hóa ký hiệu · §1.4',path:'data/theory_normalization/theory_normalization_c01_l04.json',version:'NORMALIZATION_C01_L04_V1_APPROVED'}
    },
    'MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140':{
      lessonId:'MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140',
      lessonTitle:'§1.5 · Không gian con và biểu diễn dữ liệu',
      academicStatus:'ACADEMIC_14_OF_14_PASS',
      academicAcceptance:'THEORY_C01_L05_ACADEMIC_ACCEPTANCE.json',
      reference:{id:'theory_reference_c01_l05',label:'Tham khảo thêm · §1.5',path:'data/theory_reference/theory_reference_c01_l05.json',version:'REFERENCE_C01_L05_V1_PASS11'},
      fullView:{id:'theory_full_view_c01_l05',label:'Xem đầy đủ · §1.5',path:'data/theory_full_view/theory_full_view_c01_l05.json',version:'FULL_VIEW_C01_L05_V1_PASS12'},
      normalization:{id:'theory_normalization_c01_l05',label:'Chuẩn hóa ký hiệu · §1.5',path:'data/theory_normalization/theory_normalization_c01_l05.json',version:'NORMALIZATION_C01_L05_V1_PASS12'}
    }
  };

  function clone(value){
    try{return JSON.parse(JSON.stringify(value));}catch(_){return value;}
  }

  function sourceMeta(entry,spec,kind){
    return {
      label:spec.label,
      path:spec.path,
      group:GROUP,
      required:false,
      lazy:true,
      lessonId:entry.lessonId,
      lessonTitle:entry.lessonTitle,
      artifactKind:kind,
      version:spec.version,
      release:RELEASE
    };
  }

  function register(){
    var A=window.SUBJECT_ADAPTER;
    if(!A)return false;
    A.dataSourceMeta=A.dataSourceMeta||{};
    Object.keys(REGISTRY).forEach(function(lessonId){
      var entry=REGISTRY[lessonId];
      ['reference','fullView','normalization'].forEach(function(kind){
        var spec=entry[kind];
        if(!spec||!spec.id)return;
        A.dataSourceMeta[spec.id]=sourceMeta(entry,spec,kind);
      });
    });
    return true;
  }

  function get(lessonId){return REGISTRY[String(lessonId||'')]||null;}
  function list(){return Object.keys(REGISTRY).map(function(id){return clone(REGISTRY[id]);});}
  function selfCheck(){
    var entries=list();
    var sources=[];
    entries.forEach(function(entry){
      ['reference','fullView','normalization'].forEach(function(kind){
        var spec=entry[kind];
        sources.push({lessonId:entry.lessonId,kind:kind,id:spec.id,path:spec.path,version:spec.version});
      });
    });
    var ids=sources.map(function(x){return x.id;});
    return {
      ok:entries.length===2&&sources.length===6&&new Set(ids).size===6,
      release:RELEASE,
      lessonCount:entries.length,
      sourceCount:sources.length,
      duplicateSourceIds:ids.filter(function(id,index){return ids.indexOf(id)!==index;}),
      registered:register(),
      entries:entries,
      sources:sources,
      readerLogicModified:false,
      e235Modified:false
    };
  }

  window.BAUMAN_MATH_THEORY_ARTIFACT_REGISTRY_E244={
    release:RELEASE,
    entries:REGISTRY,
    get:get,
    list:list,
    register:register,
    selfCheck:selfCheck
  };

  if(!register()){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',register,{once:true});
    setTimeout(register,0);
  }
})();
