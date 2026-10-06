const clean=value=>String(value??'').trim();

export function createProfileScope(profileId){
  const id=clean(profileId);
  if(!id)throw new Error('profileId is required');
  return Object.freeze({
    profileId:id,
    key(namespace,localId=''){
      const ns=clean(namespace);
      if(!ns)throw new Error('namespace is required');
      return ['ru-engine',id,ns,clean(localId)].filter(Boolean).join(':');
    },
    owns(record){
      const owner=clean(record?.profileId);
      return owner===id;
    },
    assertOwn(record){
      if(!this.owns(record))throw new Error('profile isolation violation');
      return record;
    }
  });
}

export function validateInternalProfileIdentity(profile){
  const errors=[];
  if(!profile||typeof profile!=='object')errors.push('profile must be an object');
  const id=clean(profile?.profileId);
  if(!id)errors.push('profileId is required');
  if(clean(profile?.providerCustomerId))errors.push('providerCustomerId must not be canonical Engine profile identity');
  if(clean(profile?.paymentCustomerId))errors.push('paymentCustomerId must not be canonical Engine profile identity');
  return {ok:errors.length===0,errors};
}
