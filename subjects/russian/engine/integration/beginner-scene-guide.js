// Noncanonical A0 guidance: UI orientation, not an approved translation of Russian.
const SETTINGS=Object.freeze({
  room:'Phòng sinh hoạt',
  shop:'Cửa hàng',
  metro:'Tàu điện ngầm',
  dorm:'Ký túc xá',
  university:'Trường đại học'
});
export function describeGroundedSceneForBeginner(scene){
  const setting=String(scene?.setting||'');
  const relation=String(scene?.expectedAction?.semanticRelation||'');
  const kind=String(scene?.expectedAction?.kind||'');
  const awaitingReview=scene?.status==='FIXTURE_NONCANONICAL_PENDING_RU03';
  const locationRecognitionOnly=awaitingReview&&relation==='locate-object'&&kind==='select-object';
  const taskLabel=locationRecognitionOnly?'Nhận diện hình (chưa kiểm tra vị trí)'
    :relation==='request-object'?'Nghe yêu cầu và chọn vật':'Nghe rồi chọn hình phù hợp';
  const explanation=locationRecognitionOnly
    ?'Nghe câu, thử chọn hình phù hợp. Màn này chưa có sơ đồ hay vị trí thực, nên bấm đúng hình KHÔNG có nghĩa là bạn đã tìm được địa điểm hoặc biết chỉ đường.'
    :'Nghe câu nói, quan sát các vật và chọn hình phù hợp. Có thể nghe lại hoặc nghe chậm. Bạn không cần biết chữ Nga trước khi bắt đầu.';
  return Object.freeze({
    settingLabel:SETTINGS[setting]||'Tình huống thường ngày',
    taskLabel,
    explanation,
    awaitingReview,
    locationRecognitionOnly
  });
}
