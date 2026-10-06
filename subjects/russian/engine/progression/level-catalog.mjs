const clean = value => String(value ?? '').trim();
const arr = value => Array.isArray(value) ? value : [];
const copy = value => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export function validateLevelCatalog(catalog, canonicalCompetencyIds=[]) {
  const errors = [];
  if (catalog?.schemaVersion !== 'RUSSIAN_ENGINE_LEVEL_CATALOG_V1') errors.push('invalid schemaVersion');
  if (Number(catalog?.levelCount) !== 100) errors.push('levelCount must be 100');
  if (Number(catalog?.bandCount) !== 10) errors.push('bandCount must be 10');
  const levels = arr(catalog?.levels);
  if (levels.length !== 100) errors.push(`expected 100 levels, got ${levels.length}`);
  const ids = new Set();
  const canonical = new Set(arr(canonicalCompetencyIds));
  levels.forEach((level,index) => {
    const expectedId = `RL${String(index+1).padStart(3,'0')}`;
    if (level?.id !== expectedId) errors.push(`level identity drift at index ${index+1}: ${level?.id}`);
    if (ids.has(level?.id)) errors.push(`duplicate level id: ${level?.id}`);
    ids.add(level?.id);
    const expectedBand = Math.floor(index/10)+1;
    if (Number(level?.band) !== expectedBand) errors.push(`${level?.id} must be band ${expectedBand}`);
    if (!arr(level?.targetCompetencies).length) errors.push(`${level?.id} has no target competencies`);
    for (const id of arr(level?.targetCompetencies)) {
      if (canonical.size && !canonical.has(id)) errors.push(`${level?.id} unknown competency: ${id}`);
    }
    if (level?.promotion?.authority !== 'RU04/C4') errors.push(`${level?.id} promotion authority drift`);
    if (level?.promotion?.clickOrTimeCompletionAccepted !== false) errors.push(`${level?.id} must reject click/time-only completion`);
    if (level?.officialMapping?.certified !== false) errors.push(`${level?.id} must not claim official certification`);
    const milestone = (index+1)%10===0;
    if (!!level?.progression?.transferGate !== milestone) errors.push(`${level?.id} transfer gate mismatch`);
    if (!!level?.progression?.retentionGate !== milestone) errors.push(`${level?.id} retention gate mismatch`);
    if (milestone && !arr(level?.promotion?.requiredEvidence).includes('unseen-transfer')) errors.push(`${level?.id} missing unseen-transfer evidence`);
  });
  return {ok:errors.length===0,errors,count:levels.length};
}

export function createLevelCatalog(catalog, canonicalCompetencyIds=[]) {
  const validation = validateLevelCatalog(catalog, canonicalCompetencyIds);
  if (!validation.ok) throw new Error(`Russian level catalog invalid: ${validation.errors.join('; ')}`);
  const levels = catalog.levels.map(copy);
  const byId = new Map(levels.map(level => [level.id, level]));

  return Object.freeze({
    schema: catalog.schemaVersion,
    count: levels.length,
    getLevel(id) {
      const level = byId.get(clean(id));
      return level ? copy(level) : null;
    },
    levelsForBand(band) {
      const n = Number(band);
      return levels.filter(level => level.band === n).map(copy);
    },
    nextLevel(id) {
      const current = byId.get(clean(id));
      if (!current || current.sequenceIndex >= 100) return null;
      return copy(byId.get(`RL${String(current.sequenceIndex+1).padStart(3,'0')}`) || null);
    },
    milestoneLevels() {
      return levels.filter(level => level.progression?.transferGate === true).map(copy);
    },
    levelsForCompetency(competencyId) {
      const id = clean(competencyId);
      return levels.filter(level => arr(level.targetCompetencies).includes(id)).map(copy);
    }
  });
}
