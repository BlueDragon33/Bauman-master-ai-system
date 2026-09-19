'use strict';
(function(root){
  const SCHEMA='RUSSIAN_CURSIVE_GLYPH_SHAPES_V1';
  const LETTERS='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
  // Explicit single-line teaching shapes. They do not depend on installed fonts.
  // Coordinates use a 100x70 viewBox and are intentionally stroke-oriented.
  const SHAPES=Object.freeze({
    'А':'M10 56 Q22 18 36 50 Q43 64 52 45 Q60 28 70 50 M30 42 Q42 38 55 42',
    'Б':'M18 18 Q42 10 64 16 M20 18 Q18 38 20 56 Q42 62 54 50 Q62 38 48 34 Q35 31 20 38',
    'В':'M22 14 Q18 36 22 58 Q45 60 54 48 Q58 39 44 35 Q58 31 55 21 Q51 12 22 14',
    'Г':'M18 18 Q37 12 59 17 Q43 20 35 30 Q29 41 31 57',
    'Д':'M16 54 Q24 43 31 21 Q39 13 48 23 Q54 39 60 54 M13 54 Q40 60 67 54 Q62 60 64 66',
    'Е':'M58 23 Q43 12 27 22 Q15 31 26 36 Q40 42 55 32 Q47 50 29 54 Q18 57 15 47',
    'Ё':'M58 25 Q43 14 27 24 Q15 33 26 38 Q40 44 55 34 Q47 52 29 56 Q18 59 15 49 M31 11 l1 0 M46 10 l1 0',
    'Ж':'M12 20 Q25 32 34 40 Q23 48 12 58 M35 15 Q35 35 35 58 M58 20 Q46 31 36 40 Q47 48 60 58',
    'З':'M20 20 Q43 8 56 22 Q62 32 42 36 Q60 39 57 51 Q52 64 24 57',
    'И':'M16 22 Q17 47 23 56 Q32 61 39 45 Q46 28 49 21 Q50 45 58 56',
    'Й':'M16 25 Q17 49 23 58 Q32 63 39 47 Q46 30 49 23 Q50 47 58 58 M28 12 Q37 19 45 11',
    'К':'M18 17 Q17 38 19 58 M51 18 Q39 29 24 38 Q42 39 55 58',
    'Л':'M12 56 Q19 46 27 22 Q34 10 42 24 Q48 43 56 57',
    'М':'M12 55 Q18 20 28 45 Q35 60 43 30 Q50 10 56 55',
    'Н':'M16 19 Q17 37 18 58 M50 18 Q42 34 19 40 Q43 40 55 58',
    'О':'M18 37 Q18 17 37 17 Q57 18 57 37 Q57 57 37 58 Q18 57 18 37',
    'П':'M16 57 Q16 25 24 20 Q35 13 41 26 Q47 41 55 57',
    'Р':'M20 66 Q19 43 20 21 Q36 13 49 20 Q59 28 51 39 Q43 48 22 43',
    'С':'M58 24 Q49 14 34 18 Q18 23 17 39 Q17 55 33 58 Q48 59 58 50',
    'Т':'M11 25 Q29 16 48 21 Q59 25 61 35 M28 22 Q27 40 29 58 M46 22 Q45 39 47 58',
    'У':'M15 23 Q18 46 29 51 Q39 56 45 22 M46 22 Q43 51 36 63 Q31 70 22 66',
    'Ф':'M38 10 Q34 35 36 66 M36 24 Q19 16 15 34 Q13 52 36 51 Q59 54 61 35 Q61 17 36 24',
    'Х':'M15 19 Q31 38 56 58 M57 18 Q39 37 18 58',
    'Ц':'M14 22 Q15 47 22 56 Q31 61 38 44 Q43 32 47 22 Q47 48 56 56 Q63 62 67 54 M62 56 Q64 64 61 68',
    'Ч':'M16 22 Q17 44 28 47 Q40 49 49 22 Q48 43 53 58',
    'Ш':'M12 22 Q13 50 20 57 Q28 61 33 42 Q37 27 39 22 Q39 50 46 57 Q53 61 58 22',
    'Щ':'M10 22 Q11 50 18 57 Q26 61 31 42 Q35 27 37 22 Q37 50 44 57 Q51 61 56 22 Q57 49 64 57 M62 56 Q66 64 62 68',
    'Ъ':'M13 20 Q21 18 27 25 Q30 36 28 57 M28 39 Q43 31 54 38 Q63 46 54 56 Q43 64 28 57',
    'Ы':'M14 21 Q15 40 16 58 M16 39 Q30 31 40 39 Q47 48 38 56 Q29 64 16 58 M54 22 Q53 42 56 58',
    'Ь':'M18 20 Q17 41 19 58 M19 39 Q35 31 47 39 Q56 48 47 56 Q36 64 19 58',
    'Э':'M17 25 Q28 13 44 18 Q58 23 57 38 Q56 54 42 58 Q27 62 17 51 M27 38 Q41 34 56 38',
    'Ю':'M13 20 Q13 39 14 58 M15 38 Q25 34 34 38 M34 37 Q34 17 51 17 Q68 18 68 38 Q68 57 51 58 Q34 57 34 37',
    'Я':'M60 18 Q40 12 29 20 Q17 28 25 38 Q34 46 53 40 M52 18 Q51 39 52 58 M50 40 Q37 46 27 58'
  });

  function key(letter){
    const ch=String(letter??'').match(/[А-ЯЁа-яё]/)?.[0]||'';
    return ch.toUpperCase();
  }
  function pathFor(letter){return SHAPES[key(letter)]||'';}
  function render(letter,{variant='lower',label=true}={}){
    const k=key(letter),d=pathFor(k);
    if(!d)return '';
    const transform=variant==='upper'?'translate(0 -2) scale(1 1.06)':'skewX(-7)';
    const aria=label?' aria-label="Mẫu viết tay '+k+'" role="img"':' aria-hidden="true"';
    return '<svg class="ru-cursive-shape ru-cursive-shape-'+variant+'" viewBox="0 0 80 72"'+aria+'>'+
      '<path d="'+d+'" transform="'+transform+'" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>'+
      '</svg>';
  }
  function renderPair(value){
    const chars=String(value??'').match(/[А-ЯЁа-яё]/g)||[];
    const first=chars[0]||'',second=chars[1]||String(first).toLowerCase();
    return '<span class="ru-cursive-shape-pair">'+render(first,{variant:'upper'})+render(second,{variant:'lower'})+'</span>';
  }
  function coverage(){return Object.keys(SHAPES).filter(x=>LETTERS.includes(x)).length;}
  root.RussianCursiveGlyphs=Object.freeze({schema:SCHEMA,letters:LETTERS,coverage,pathFor,render,renderPair});
})(typeof window!=='undefined'?window:globalThis);
