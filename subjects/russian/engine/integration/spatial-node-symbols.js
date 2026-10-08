// RE53: one small owner for the symbols used by BOTH opt-in map previews.
// Symbols are labels/pictograms, NOT photographs or certified scene illustrations.
const TYPE_SYMBOLS=Object.freeze({
  doorway:'🚪',shelf:'▥',bookcase:'📚',table:'▤',person:'●',
  entrance:'🚪',fridge:'▣',counter:'▤',street:'━━',stairs:'⇲',
  machine:'▣','map-board':'🗺',platform:'═',lobby:'▤',
  desk:'▤',corridor:'→','numbered-room':'P.12',
  'shower-room':'P.TẮM','lecture-room':'A.12',library:'📚'
});
const NODE_SYMBOLS=Object.freeze({
  'station-entrance':'Ⓜ',
  'metro-route-map':'SƠ ĐỒ',
  'ticket-machine':'VÉ',
  'room-12':'P.12',
  'shower-room':'P.TẮM',
  'auditorium-12':'A.12',
  'key-desk':'🔑'
});
export function spatialSymbolForNode(node){
  const id=String(node?.nodeId||'');
  const type=String(node?.visualType||'');
  const text=NODE_SYMBOLS[id]||TYPE_SYMBOLS[type]||'▢';
  const isWord=/[A-Za-zÀ-ỹ]{2,}/u.test(text);
  return Object.freeze({text,kind:isWord?'word':'pictogram'});
}
