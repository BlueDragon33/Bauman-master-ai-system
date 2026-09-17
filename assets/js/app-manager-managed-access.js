/* Bauman Hub · App Manager managed access
 *
 * App Manager owns administration. The Hub does not create or request local
 * credentials. Device Gate remains the authoritative runtime access boundary.
 * This layer does not own canonical routes and does not write academic data.
 */
(()=>{
'use strict';

const RELEASE='APP_MANAGER_MANAGED_ACCESS_2026_09';
const USERS_KEY='bauman_main_users_fullcode_v1';
const CURRENT_USER_KEY='bauman_current_user_fullcode_v1';
const ALLOWED_DEVICE_ACCESS=new Set(['authorized','offline-grace']);
const PROFILE=Object.freeze({
  name:'Bauman Master Hub',
  email:'app-manager@bauman.local',
  role:'user',
  managedBy:'app-manager'
});

const q=id=>document.getElementById(id);
let observer=null;

function deviceAccess(){return document.documentElement.dataset.baumanDeviceAccess||'unknown'}
function deviceAllowed(){return ALLOWED_DEVICE_ACCESS.has(deviceAccess())}
function clearCredentialStore(){
  try{localStorage.removeItem(USERS_KEY)}catch{}
}
function persistManagedScope(){
  try{localStorage.setItem(CURRENT_USER_KEY,JSON.stringify(PROFILE))}catch{}
}
function decorateManagedProfile(){
  const role=q('currentUserRole');
  if(role)role.textContent='APP MANAGER';
  const button=q('profileBtn');
  if(button)button.title='Quản trị bởi App Manager';
  const localAdmin=q('adminOpenBtn');
  if(localAdmin)localAdmin.hidden=true;
  const logout=q('logoutBtn');
  if(logout)logout.hidden=true;
}
function keepLocalAdminOutOfFlow(){
  if(typeof state!=='undefined'&&state?.page==='admin'){
    state.page='home';
    try{typeof save==='function'&&save()}catch{}
  }
}
function syncAccess(){
  document.documentElement.dataset.baumanHubAccess='app-manager';
  document.documentElement.dataset.baumanLocalAuth='bypassed';
  clearCredentialStore();
  persistManagedScope();

  if(typeof auth!=='undefined'){
    auth.current={...PROFILE};
    auth.setupMode=false;
  }
  keepLocalAdminOutOfFlow();

  const screen=q('authScreen');
  if(screen){screen.classList.add('hidden');screen.setAttribute('aria-hidden','true')}
  const root=q('appRoot');
  if(root)root.classList.toggle('hidden',!deviceAllowed());

  if(typeof auth!=='undefined'&&deviceAllowed()){
    try{auth.render?.()}catch{}
    decorateManagedProfile();
  }
  return deviceAllowed();
}
function managedInit(){syncAccess()}
function managedLogin(){syncAccess();return Promise.resolve(deviceAllowed())}
function managedLogout(){
  syncAccess();
  try{typeof toast==='function'&&toast('Quyền truy cập được quản trị bởi App Manager.')}catch{}
}
function install(){
  document.documentElement.dataset.baumanHubAccess='app-manager';
  clearCredentialStore();
  persistManagedScope();
  if(typeof auth!=='undefined'){
    auth.init=managedInit;
    auth.login=managedLogin;
    auth.logout=managedLogout;
  }
  if(!observer){
    observer=new MutationObserver(mutations=>{
      if(mutations.some(m=>m.attributeName==='data-bauman-device-access'))syncAccess();
    });
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-bauman-device-access']});
  }
  if(document.readyState!=='loading')syncAccess();
  else document.addEventListener('DOMContentLoaded',syncAccess,{once:true});
}
function selfCheck(){
  const screen=q('authScreen'),root=q('appRoot');
  let credentialStorePresent=false,managedScopeStored=false;
  try{
    credentialStorePresent=Boolean(localStorage.getItem(USERS_KEY));
    const stored=JSON.parse(localStorage.getItem(CURRENT_USER_KEY)||'null');
    managedScopeStored=stored?.managedBy==='app-manager'&&stored?.email===PROFILE.email;
  }catch{}
  return{
    release:RELEASE,
    mode:'app-manager',
    ready:deviceAllowed()&&root?.classList.contains('hidden')===false&&screen?.classList.contains('hidden')===true,
    deviceAccess:deviceAccess(),
    deviceAuthorized:deviceAllowed(),
    localAuthBypassed:document.documentElement.dataset.baumanLocalAuth==='bypassed',
    authScreenHidden:screen?.classList.contains('hidden')===true,
    credentialStorePresent,
    managedScopeStored,
    currentManagedBy:typeof auth!=='undefined'?auth.current?.managedBy||null:null,
    localAdminVisible:q('adminOpenBtn')?.hidden!==true,
    localLogoutVisible:q('logoutBtn')?.hidden!==true,
    routeOwnership:false,
    academicWrites:false
  };
}

window.BAUMAN_APP_MANAGER_ACCESS={release:RELEASE,profile:{...PROFILE},sync:syncAccess,selfCheck};
install();
})();
