'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER;
  if(!A)return;
  A.ui=A.ui||{};
  // Keep internal protocol/storage identifiers untouched; only normalize user-facing copy.
  A.ui.coreLabel='TIẾNG NGA BAUMAN';
  A.ui.heroBadge='LỘ TRÌNH TIẾNG NGA BAUMAN';
  A.ui.learningSubtitle='Nghe/Nói và Video/Audio là trục chính; Ngữ pháp, đọc, viết và ôn tập được mở theo đúng hoạt động đang học.';
  A.ui.overviewSubtitle='Tiếp tục đúng nơi vừa học, xử lý mục ôn đến hạn rồi đi vào hoạt động mới theo giai đoạn hiện tại.';
  window.RussianUICleanupContract={
    applied:true,
    policy:{hideLegacyVersionLabels:true,preserveInternalStorageAndBridgeIds:true}
  };
})();
