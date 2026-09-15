import {execFileSync} from 'node:child_process';
import path from 'node:path';

const out=[];
const fail=(kind,file,detail='')=>out.push({kind,file,detail});
const warn=[];
const warnPush=(kind,file,detail='')=>warn.push({kind,file,detail});

const raw=execFileSync('git',['ls-files','-z'],{encoding:'utf8'});
const files=raw.split('\0').filter(Boolean);
const reserved=/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;
const illegal=/[<>:"\\|?*]/;
const caseMap=new Map();

for(const file of files){
  const normalized=file.replaceAll('\\','/');
  const parts=normalized.split('/');
  for(const part of parts){
    if(!part) continue;
    if(reserved.test(part)) fail('windows-reserved-name',file,part);
    if(illegal.test(part)) fail('windows-illegal-character',file,part);
    if(/[ .]$/.test(part)) fail('windows-trailing-dot-or-space',file,part);
  }
  const key=normalized.toLocaleLowerCase('en-US');
  const previous=caseMap.get(key);
  if(previous&&previous!==normalized) fail('case-insensitive-collision',file,previous);
  else caseMap.set(key,normalized);

  // GitHub Desktop enables long path support on modern Git for Windows, but
  // keep a conservative warning threshold so new generated paths stay sane.
  const absolute=path.resolve(normalized);
  if(absolute.length>240) warnPush('long-path-warning',file,`absoluteLength=${absolute.length}`);
}

const report={
  status:out.length?'FAIL':'PASS',
  platform:process.platform,
  files:files.length,
  failures:out,
  warnings:warn,
  policy:{
    windowsReservedNames:true,
    windowsIllegalCharacters:true,
    trailingDotOrSpace:true,
    caseInsensitiveCollisions:true,
    absolutePathWarning:240
  }
};
console.log(JSON.stringify(report,null,2));
if(out.length) process.exit(1);
