export const DIRECT_SEMANTIC_SCHEMA='RUSSIAN_DIRECT_SEMANTIC_DESCRIPTOR_V1';

const nonEmpty=v=>Array.isArray(v)?v.length>0:(v!==undefined&&v!==null&&String(v).trim()!=='');
const looksRussian=v=>/[А-Яа-яЁё]/.test(String(v??''));

function collect(row,fields,{requireRussian=false}={}){
  const out=[];
  for(const field of fields||[]){
    const value=row?.[field];
    if(!nonEmpty(value))continue;
    if(requireRussian&&!looksRussian(Array.isArray(value)?value.join(' '):value))continue;
    out.push({field,value});
  }
  return out;
}

export function buildDirectSemanticDescriptor(row,contract){
  const fields=contract?.evidenceFields||{};
  const prohibited=new Set(contract?.prohibitedEvidenceFields||[]);
  const used=new Set();
  const evidence={};
  const strategies=[];

  const add=(strategy,items)=>{
    const accepted=(items||[]).filter(x=>!prohibited.has(x.field));
    if(!accepted.length)return;
    strategies.push(strategy);
    evidence[strategy]=accepted.map(x=>({field:x.field,value:x.value}));
    accepted.forEach(x=>used.add(x.field));
  };

  add('visual_scene',collect(row,fields.visual_scene));
  add('gesture',collect(row,fields.gesture,{requireRussian:true}));
  add('contrast',collect(row,fields.contrast,{requireRussian:true}));
  add('category_examples',collect(row,fields.category_examples,{requireRussian:false}));
  add('analogy',collect(row,fields.analogy,{requireRussian:true}));
  add('simple_russian_definition',collect(row,fields.simple_russian_definition,{requireRussian:true}));
  add('audio_context',collect(row,fields.audio_context,{requireRussian:false}));

  const order=contract?.selection?.primaryOrder||[];
  const primary=order.find(x=>strategies.includes(x))||strategies[0]||'';
  const term=String(row?.ru||row?.phrase_ru||row?.front||row?.word||'').trim();

  return Object.freeze({
    schema:DIRECT_SEMANTIC_SCHEMA,
    term_ru:term,
    status:primary?'ready':'missing_direct_semantics',
    primary_strategy:primary,
    strategies:Object.freeze([...strategies]),
    evidence:Object.freeze(evidence),
    source_fields:Object.freeze([...used].sort())
  });
}

export function summarizeDirectSemanticCoverage(rows,contract){
  const descriptors=(Array.isArray(rows)?rows:[]).map(row=>buildDirectSemanticDescriptor(row,contract));
  const byStrategy={};
  for(const strategy of contract?.strategies||[])byStrategy[strategy]=0;
  let ready=0,missing=0;
  for(const d of descriptors){
    if(d.status==='ready')ready++;else missing++;
    for(const strategy of d.strategies)byStrategy[strategy]=(byStrategy[strategy]||0)+1;
  }
  return Object.freeze({
    total:descriptors.length,
    ready,
    missing,
    byStrategy,
    readyPercent:descriptors.length?Math.round(ready*10000/descriptors.length)/100:0
  });
}
