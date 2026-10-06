const clean = value => String(value ?? '').trim();
const arr = value => Array.isArray(value) ? value : [];
const copy = value => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export function validateReferenceGraph(graph,{canonicalIndex={},contentIndex={}}={}) {
  const errors=[];
  if(graph?.schemaVersion!=='RUSSIAN_ENGINE_KNOWLEDGE_GRAPH_V1')errors.push('invalid schemaVersion');
  const nodes=arr(graph?.nodes),edges=arr(graph?.edges);
  const ids=new Set();
  for(const node of nodes){
    if(!clean(node?.id))errors.push('node id required');
    else if(ids.has(node.id))errors.push(`duplicate node id: ${node.id}`);
    ids.add(node?.id);
    if(node?.kind==='canonical-ref'){
      const path=clean(node?.canonicalRef?.ownerPath),id=clean(node?.canonicalRef?.id);
      if(!path||!id)errors.push(`${node.id} canonicalRef incomplete`);
      const allowed=canonicalIndex[path];
      if(allowed && !allowed.has(id))errors.push(`${node.id} missing canonical target ${path}#${id}`);
    }
    if(node?.kind==='engine-content-ref'||node?.kind==='level-ref'){
      const path=clean(node?.contentRef?.ownerPath),id=clean(node?.contentRef?.id);
      if(!path||!id)errors.push(`${node.id} contentRef incomplete`);
      const allowed=contentIndex[path];
      if(allowed && !allowed.has(id))errors.push(`${node.id} missing content target ${path}#${id}`);
    }
  }
  for(const edge of edges){
    if(!ids.has(edge?.from))errors.push(`edge missing from node: ${edge?.from}`);
    if(!ids.has(edge?.to))errors.push(`edge missing to node: ${edge?.to}`);
    if(!clean(edge?.relation))errors.push('edge relation required');
  }
  return {ok:errors.length===0,errors,nodeCount:nodes.length,edgeCount:edges.length};
}

export function createReferenceGraph(graph,indexes={}) {
  const validation=validateReferenceGraph(graph,indexes);
  if(!validation.ok)throw new Error(`Russian reference graph invalid: ${validation.errors.join('; ')}`);
  const nodes=graph.nodes.map(copy),edges=graph.edges.map(copy);
  const byId=new Map(nodes.map(node=>[node.id,node]));
  const incoming=new Map(),outgoing=new Map();
  for(const edge of edges){
    if(!outgoing.has(edge.from))outgoing.set(edge.from,[]);
    if(!incoming.has(edge.to))incoming.set(edge.to,[]);
    outgoing.get(edge.from).push(edge);
    incoming.get(edge.to).push(edge);
  }
  function node(id){const value=byId.get(clean(id));return value?copy(value):null;}
  function linksFrom(id,relation=''){return arr(outgoing.get(clean(id))).filter(e=>!relation||e.relation===relation).map(copy);}
  function linksTo(id,relation=''){return arr(incoming.get(clean(id))).filter(e=>!relation||e.relation===relation).map(copy);}
  function sourcesForConcept(conceptId){
    return linksTo(conceptId,'TRAINS').map(edge=>node(edge.from)).filter(Boolean);
  }
  function canonicalDependencies(conceptId){
    return [...linksTo(conceptId,'SUPPORTS'),...linksTo(conceptId,'TRAINS')]
      .map(edge=>node(edge.from))
      .filter(item=>item?.kind==='canonical-ref');
  }
  function experienceSources(conceptId){
    return sourcesForConcept(conceptId)
      .filter(item=>item.kind==='engine-content-ref')
      .map(item=>copy(item.contentRef));
  }
  return Object.freeze({
    schema:graph.schemaVersion,
    nodeCount:nodes.length,
    edgeCount:edges.length,
    node,
    linksFrom,
    linksTo,
    sourcesForConcept,
    canonicalDependencies,
    experienceSources
  });
}
