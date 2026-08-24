'use strict';

const fs = require('fs');
const path = 'assets/js/main.js';
let source = fs.readFileSync(path, 'utf8');

const marker = "const STATE_REPOSITORY = window.BaumanMainStateRepository;";
if (source.includes(marker)) {
  console.log('L3 main storage codemod already applied; no changes needed.');
  process.exit(0);
}

function replaceExactlyOnce(before, after, label) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`Missing expected source for ${label}`);
  const second = source.indexOf(before, first + before.length);
  if (second >= 0) throw new Error(`Expected exactly one match for ${label}, found multiple`);
  source = source.slice(0, first) + after + source.slice(first + before.length);
  console.log('PATCH:', label);
}

replaceExactlyOnce(
  "const CURRENT_USER_KEY = 'bauman_current_user_fullcode_v1';",
  "const CURRENT_USER_KEY = 'bauman_current_user_fullcode_v1';\nconst STATE_REPOSITORY = window.BaumanMainStateRepository;\nif(!STATE_REPOSITORY)throw new Error('BaumanMainStateRepository is required before main.js');",
  'repository binding'
);

replaceExactlyOnce(
  "function readUsers(){try{return JSON.parse(localStorage.getItem(USERS_KEY))||defaultUsers()}catch{return defaultUsers()}}",
  "function readUsers(){try{return STATE_REPOSITORY.readUsers(defaultUsers())||defaultUsers()}catch{return defaultUsers()}}",
  'readUsers'
);

replaceExactlyOnce(
  "function saveUsers(users){localStorage.setItem(USERS_KEY,JSON.stringify(users))}",
  "function saveUsers(users){STATE_REPOSITORY.writeUsers(users,{source:'main-legacy-auth'})}",
  'saveUsers'
);

replaceExactlyOnce(
  "function getCurrentUser(){try{return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)||'null')}catch{return null}}",
  "function getCurrentUser(){try{return STATE_REPOSITORY.readCurrentUser(null)}catch{return null}}",
  'getCurrentUser'
);

replaceExactlyOnce(
  "function setCurrentUser(user){localStorage.setItem(CURRENT_USER_KEY,JSON.stringify(user))}",
  "function setCurrentUser(user){STATE_REPOSITORY.writeCurrentUser(user,{source:'main-login'})}",
  'setCurrentUser'
);

replaceExactlyOnce(
  "function readState(){try{return normalizeState(JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{return defaultState()}}",
  "function readState(){try{return normalizeState(STATE_REPOSITORY.readMainState({})||{})}catch{return defaultState()}}",
  'readState'
);

replaceExactlyOnce(
  "function save(){localStorage.setItem(KEY,JSON.stringify(state))}",
  "function save(){STATE_REPOSITORY.writeMainState(state,{source:'main-save'})}",
  'save'
);

replaceExactlyOnce(
  "logout(){localStorage.removeItem(CURRENT_USER_KEY);location.reload()}",
  "logout(){STATE_REPOSITORY.clearCurrentUser({source:'main-logout'});location.reload()}",
  'logout session clear'
);

replaceExactlyOnce(
  "if(data.state){state=normalizeState(data.state);localStorage.setItem(KEY,JSON.stringify(state))}",
  "if(data.state){state=normalizeState(data.state);STATE_REPOSITORY.writeMainState(state,{source:'backup-restore'})}",
  'backup restore main state'
);

const forbidden = [
  'localStorage.getItem(KEY)',
  'localStorage.setItem(KEY',
  'localStorage.getItem(CURRENT_USER_KEY)',
  'localStorage.setItem(CURRENT_USER_KEY',
  'localStorage.removeItem(CURRENT_USER_KEY)'
];
for (const token of forbidden) {
  if (source.includes(token)) throw new Error(`Forbidden legacy direct storage token remains: ${token}`);
}

fs.writeFileSync(path, source);
console.log('L3 main storage codemod applied successfully.');
