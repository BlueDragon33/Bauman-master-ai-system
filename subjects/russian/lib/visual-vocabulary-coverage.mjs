export const VISUAL_COVERAGE_SCHEMA='RUSSIAN_VISUAL_VOCABULARY_COVERAGE_DESCRIPTOR_V1';

const nonEmpty=v=>Array.isArray(v)?v.length>0:(v!==undefined&&v!==null&&String(v).trim()!=='');
const first=(row,keys)=>keys.find(k=>nonEmpty(row?.[k]))||'';

export function classifyVisualVocabulary(row,contract){
  const c=contract?.classification||{};
  const assetField=first(row,c.explicitVisualFields||[]);
  const contextField=first(row,c.russianContextFields||[]);
  const term=String(row?.ru||row?.phrase_ru||row?.front||row?.word||'').trim();

  if(assetField){
    return Object.freeze({
      schema:VISUAL_COVERAGE_SCHEMA,
      term_ru:term,
      semantic_status:'ready',
      coverage_kind:'explicit_visual_asset',
      source_field:assetField,
      has_explicit_visual_asset:true,
      has_russian_context:Boolean(contextField)
    });
  }

  if(contextField){
    return Object.freeze({
      schema:VISUAL_COVERAGE_SCHEMA,
      term_ru:term,
      semantic_status:'partial',
      coverage_kind:'russian_context_only',
      source_field:contextField,
      has_explicit_visual_asset:false,
      has_russian_context:true
    });
  }

  return Object.freeze({
    schema:VISUAL_COVERAGE_SCHEMA,
    term_ru:term,
    semantic_status:'missing_visual_semantics',
    coverage_kind:'missing',
    source_field:'',
    has_explicit_visual_asset:false,
    has_russian_context:false
  });
}

export function summarizeVisualCoverage(rows,contract){
  const descriptors=(Array.isArray(rows)?rows:[]).map(row=>classifyVisualVocabulary(row,contract));
  const count=key=>descriptors.filter(x=>x.coverage_kind===key).length;
  const ready=count('explicit_visual_asset');
  const partial=count('russian_context_only');
  const missing=count('missing');
  return Object.freeze({
    total:descriptors.length,
    ready,
    partial,
    missing,
    classified:ready+partial+missing,
    explicitVisualPercent:descriptors.length?Math.round(ready*10000/descriptors.length)/100:0,
    directEvidencePercent:descriptors.length?Math.round((ready+partial)*10000/descriptors.length)/100:0
  });
}
