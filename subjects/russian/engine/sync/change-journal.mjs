const clean=value=>String(value??'').trim();
const copy=value=>{
  if(typeof structuredClone==='function')return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

function stableRecord(input){
  return {
    journalId:clean(input.journalId),
    profileId:clean(input.profileId),
    entityType:clean(input.entityType),
    entityId:clean(input.entityId),
    operation:clean(input.operation),
    baseVersion:clean(input.baseVersion),
    nextVersion:clean(input.nextVersion),
    payloadHash:clean(input.payloadHash),
    createdAt:clean(input.createdAt),
    syncState:clean(input.syncState)||'PENDING'
  };
}

export function createChangeJournal({profileId}={}){
  const id=clean(profileId);
  if(!id)throw new Error('profileId is required');
  const records=new Map();

  return Object.freeze({
    schema:'RUSSIAN_ENGINE_CHANGE_JOURNAL_V1',
    profileId:id,

    append(input={}){
      const row=stableRecord({...input,profileId:id});
      if(!row.journalId||!row.entityType||!row.entityId||!row.operation)throw new Error('journalId, entityType, entityId and operation are required');
      const existing=records.get(row.journalId);
      if(existing){
        const same=JSON.stringify(existing)===JSON.stringify(row);
        if(!same)throw new Error('journalId conflict');
        return {created:false,record:copy(existing)};
      }
      records.set(row.journalId,row);
      return {created:true,record:copy(row)};
    },

    pending(){
      return [...records.values()].filter(x=>x.syncState==='PENDING').map(copy);
    },

    markSynced(journalId,{remoteVersion=''}={}){
      const key=clean(journalId),row=records.get(key);
      if(!row)return false;
      row.syncState='SYNCED';
      row.remoteVersion=clean(remoteVersion);
      return true;
    },

    markConflict(journalId,{remoteVersion='',reason='version-conflict'}={}){
      const key=clean(journalId),row=records.get(key);
      if(!row)return false;
      row.syncState='CONFLICT';
      row.remoteVersion=clean(remoteVersion);
      row.conflictReason=clean(reason)||'version-conflict';
      return true;
    },

    export(){
      return {
        schemaVersion:'RUSSIAN_ENGINE_CHANGE_JOURNAL_EXPORT_V1',
        profileId:id,
        records:[...records.values()].map(copy)
      };
    }
  });
}

export function validateSyncBoundary(record){
  const errors=[];
  if(!clean(record?.profileId))errors.push('profileId required');
  if(clean(record?.providerUserId))errors.push('providerUserId cannot become canonical learner identity');
  if(clean(record?.billingCustomerId))errors.push('billingCustomerId cannot become canonical learner identity');
  return {ok:errors.length===0,errors};
}
