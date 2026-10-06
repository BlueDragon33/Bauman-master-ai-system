const clean=value=>String(value??'').trim();
const copy=value=>{
  if(typeof structuredClone==='function')return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export function createScenarioPort({getScenario, startRun, advanceRun, getRun}={}) {
  for (const [name,fn] of Object.entries({getScenario,startRun,advanceRun,getRun})) {
    if (typeof fn !== 'function') throw new TypeError(`scenario port requires ${name}()`);
  }

  return Object.freeze({
    schema:'RUSSIAN_ENGINE_SCENARIO_PORT_V1',

    async getScenario(id) {
      const scenario=await getScenario(clean(id));
      if (!scenario) return null;
      return copy(scenario);
    },

    async start(input={}) {
      const result=await startRun(copy(input));
      return copy(result);
    },

    async advance(input={}) {
      const result=await advanceRun(copy(input));
      if (result?.masteryGranted===true || result?.authoritative===true) {
        throw new Error('Scenario port cannot grant mastery; RU04/C4 own learning judgment');
      }
      return copy(result);
    },

    async getRun(runId) {
      return copy(await getRun(clean(runId)));
    }
  });
}
