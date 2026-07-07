/* E237C formula academic multi-registry bridge. Content-only, no slideshow engine. */
(function(){
  'use strict';
  var RELEASE='E237C_C01_C02_C03_FORMULA_ACADEMIC_BRIDGE';
  var REGISTRY_URLS=[
    'data/theory_formula_academic_c01.json',
    'data/theory_formula_academic_c02.json',
    'data/theory_formula_academic_c03.json'
  ];
  var profiles=[];
  var ready=false;
  var loading=false;
  var scheduled=false;

  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}

  function norm(s){
    return String(s||'')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/đ/g,'d')
      .replace(/ℝ/g,'r')
      .replace(/θ/g,'theta')
      .replace(/α/g,'alpha')
      .replace(/∞/g,'inf')
      .replace(/ᵀ/g,'^t')
      .replace(/₁/g,'_1').replace(/₂/g,'_2').replace(/₃/g,'_3')
      .replace(/ₘ/g,'_m').replace(/ₙ/g,'_n')
      .replace(/\s+/g,' ')
      .trim();
  }

  function loadOne(url){
    return fetch(url,{cache:'no-store'})
      .then(function(r){if(!r.ok)throw new Error(url+' HTTP '+r.status);return r.json();})
      .then(function(data){
        return ((data&&data.profiles)||[]).map(function(profile){
          profile.__registry=url;
          return profile;
        });
      })
      .catch(function(err){
        console.warn('[E237C] academic registry unavailable',err);
        return [];
      });
  }

  function load(){
    if(ready||loading)return;
    loading=true;
    Promise.all(REGISTRY_URLS.map(loadOne))
      .then(function(groups){
        profiles=[];
        groups.forEach(function(group){profiles=profiles.concat(group);});
        profiles.sort(function(a,b){return (b.priority||0)-(a.priority||0);});
        ready=true;
        schedule();
      })
      .finally(function(){loading=false;});
  }

  function rawFormula(modal){
    var strip=document.querySelector('.e211-reader-pro .e202-formula-strip code')||document.querySelector('.e202-formula-strip code');
    if(strip&&text(strip))return strip.textContent||'';
    var nodes=modal?Array.prototype.slice.call(modal.querySelectorAll('.e236-formula-section [data-e226-raw-formula], section [data-e226-raw-formula]')):[];
    return nodes.map(function(n){return n.getAttribute('data-e226-raw-formula')||n.textContent||'';}).filter(Boolean).join('\n');
  }

  function matches(profile,raw){
    var n=norm(raw);
    var all=(profile.matchAll||[]).map(norm);
    var any=(profile.matchAny||[]).map(norm);
    if(all.length&&!all.every(function(k){return n.indexOf(k)>=0;}))return false;
    if(any.length&&!any.some(function(k){return n.indexOf(k)>=0;}))return false;
    return all.length>0||any.length>0;
  }

  function findProfile(raw){
    for(var i=0;i<profiles.length;i++)if(matches(profiles[i],raw))return profiles[i];
    return null;
  }

  function card(item){
    return '<article class="e211-lesson-box e237-academic-box">'
      +'<h4>'+esc(item.title||'')+'</h4>'
      +'<p>'+esc(item.body||'')+'</p>'
      +'</article>';
  }

  function stack(items){
    return '<div class="e211-lesson-stack e237-academic-stack">'+(items||[]).map(card).join('')+'</div>';
  }

  function sectionBy(modal,re){
    var sections=Array.prototype.slice.call(modal.querySelectorAll('section'));
    for(var i=0;i<sections.length;i++){
      var h=text(sections[i].querySelector('h3'));
      if(re.test(h))return sections[i];
    }
    return null;
  }

  function ensureStyle(){
    if(document.getElementById('e237-academic-style'))return;
    var css=''
      +'.e211-formula-modal .e237-academic-stack{display:grid!important;grid-template-columns:1fr!important;gap:10px!important}'
      +'.e211-formula-modal .e237-academic-box{border-left:3px solid rgba(94,234,212,.42)!important}'
      +'.e211-formula-modal .e236-application-section .e237-academic-box{border-left-color:rgba(147,197,253,.46)!important}'
      +'.e211-formula-modal .e237-academic-box h4{font-size:11.5px!important;letter-spacing:.07em!important}'
      +'.e211-formula-modal .e237-academic-box p{font-size:14.5px!important;line-height:1.64!important}'
      +'.e211-formula-modal .e237-code{white-space:pre!important;overflow:auto!important;tab-size:4!important}';
    var style=document.createElement('style');
    style.id='e237-academic-style';
    style.textContent=css;
    document.head.appendChild(style);
  }

  function patch(modal){
    if(!ready||!modal)return;
    var raw=rawFormula(modal);
    if(!raw)return;
    var profile=findProfile(raw);
    if(!profile)return;
    var signature=profile.id+'|'+norm(raw);
    if(modal.getAttribute('data-e237-signature')===signature)return;

    ensureStyle();
    var analysis=sectionBy(modal,/phân tích/i);
    var application=sectionBy(modal,/ứng dụng/i);
    var python=sectionBy(modal,/python/i);

    if(analysis){
      analysis.innerHTML='<h3>Phân tích công thức</h3>'+stack(profile.analysis||[]);
      analysis.setAttribute('data-e237-profile',profile.id);
    }
    if(application){
      application.innerHTML='<h3>Ứng dụng</h3>'+stack(profile.application||[]);
      application.setAttribute('data-e237-profile',profile.id);
    }
    if(python&&profile.python){
      python.innerHTML='<h3>Cách dùng trong code Python</h3><pre class="e237-code">'+esc(profile.python)+'</pre>';
      python.setAttribute('data-e237-profile',profile.id);
    }

    modal.setAttribute('data-e237-signature',signature);
    modal.setAttribute('data-e237-profile',profile.id);
    modal.setAttribute('data-e237-registry',profile.__registry||'');
    modal.setAttribute('data-e237-academic','1');
  }

  function scan(){
    if(!ready){load();return;}
    Array.prototype.slice.call(document.querySelectorAll('.e211-formula-modal')).forEach(patch);
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){scheduled=false;scan();});
  }

  function boot(){
    load();
    scan();
    try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});}catch(_){}
    document.addEventListener('click',function(){setTimeout(schedule,0);},true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E237_ACADEMIC={
    release:RELEASE,
    apply:scan,
    profiles:function(){return profiles.slice();},
    registries:function(){return REGISTRY_URLS.slice();}
  };
})();
