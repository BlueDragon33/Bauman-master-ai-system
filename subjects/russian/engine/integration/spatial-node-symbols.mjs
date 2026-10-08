/**
 * Single visual-symbol owner for RE43 + RE44 opt-in spatial worlds.
 * Symbols must represent places as places, not confuse an object with its location.
 * Vietnamese node labels remain the primary accessible semantic identifiers.
 */
export const SPATIAL_SYMBOLS=Object.freeze({
  doorway:'🚪',
  shelf:'▥',
  bookcase:'📚',
  table:'▤',
  person:'●',
  entrance:'Ⓜ',
  fridge:'▣',
  counter:'▤',
  street:'━━',
  stairs:'⇲',
  machine:'▣',
  'map-board':'🗺',
  platform:'═',
  lobby:'▤',
  desk:'▤',
  corridor:'↔',
  'numbered-room':'🚪12',
  'shower-room':'🚪🚿',
  'lecture-room':'🎓12',
  library:'📚'
});
export function symbolForSpatialType(type){
  return SPATIAL_SYMBOLS[String(type??'')]||'▢';
}
