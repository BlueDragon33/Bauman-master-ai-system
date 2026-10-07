# RE18 — EXISTING PLANNER BRIDGE

Canonical owner: RU04 / existing RussianAdaptivePlanner

Mission: let Russian Engine contribute explainable candidate tasks to the current planner without creating a second Today/planner authority.

## Inputs
- due review refs;
- Engine weak-dimension projection;
- transfer gate;
- validated Engine experience refs;
- capability availability;
- current level/stage metadata.

## Output
Planner candidate records with:
- stable candidate ID;
- task type;
- source;
- reason code;
- priority hint;
- competency refs;
- experience ref;
- expiry/revision.

## Authority
Engine does not choose the final daily plan.
RussianAdaptivePlanner remains final current planner owner until an explicit RU04 migration says otherwise.

## Stability
Same unchanged evidence should produce the same candidate identity.
Rendering must not create new plan identity.

## Exit
PASS when Engine can emit deterministic explainable candidates, duplicates collapse, unavailable capabilities fail closed, and final-plan authority remains external.
