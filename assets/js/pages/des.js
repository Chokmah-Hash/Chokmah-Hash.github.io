/* Jets de dés partagés — Les Protocoles Éternels */
/* PE_BUILD 2026.10.18-des9 — multi-groupes (3D6 + 1D20), type de jet (normal / fantôme local / attaque à venir), 10 derniers jets */
(function(){
var PE_BUILD='2026.10.18-des9';
window.PE_DES_BUILD=PE_BUILD;
var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var box=document.getElementById('des-box');
if(!box){return;}
/* Identite par zone : mj.html => MJ, joueur.html => joueur connecte */
var EST_ZONE_MJ=location.pathname.indexOf('/mj.html')>-1;
function quiLance(){
  if(EST_ZONE_MJ){return 'MJ';}
  try{var s=JSON.parse(localStorage.getItem('pe_session')||'null');if(s&&s.nom){return s.nom;}}catch(e){}
  return 'Joueur';
}
var NB_MAX=10; /* nombre de jets affiches */
var MAX_LIGNES=4; /* groupes de des max par lancer */
var GHOSTS=[]; /* jets fantomes : memoire du navigateur uniquement, jamais envoyes nulle part */
var st=document.createElement('style');
st.textContent='#des-box .d-tools{display:block;margin:12px 0;border:1px solid var(--tealline);border-radius:12px;background:var(--panel);padding:10px 14px}'
+'#des-box .d-lbl{display:block;font-size:.68rem;font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--teal);margin:0 0 4px}'
+'#des-box .d-fld{background:var(--panel2);border:1px solid var(--tealline);border-radius:8px;color:var(--text);font-family:inherit;font-size:.95rem;padding:10px 12px;min-height:46px;box-sizing:border-box}'
+'#des-box .d-fld:focus{outline:none;border-color:var(--teal)}'
+'#des-box .d-row{display:flex;align-items:center;gap:6px;margin:6px 0}'
+'#des-box .d-plus{color:var(--teal);font-family:Rajdhani,sans-serif;font-weight:700}'
+'#des-box .d-x{background:transparent;border:1px solid rgba(226,96,79,.5);color:var(--danger);border-radius:8px;width:38px;height:46px;font-size:.9rem;cursor:pointer}'
+'#des-box .d-x:hover{background:rgba(226,96,79,.1)}'
+'#des-box .d-add{background:transparent;border:1.5px solid var(--tealline);color:var(--teal);cursor:pointer;min-height:46px;padding:10px 22px;border-radius:9px;font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.1em;text-transform:uppercase;font-size:.88rem}'
+'#des-box .d-add:hover{background:var(--tealsoft)}'
+'#des-box .d-acts{display:flex;flex-wrap:wrap;gap:12px;align-items:center}'
+'#des-box .d-status{color:var(--muted);font-size:.88rem;margin:8px 0 4px;min-height:1.3em}'
+'#des-box .d-status.err{color:var(--danger)}'
+'#des-box .d-hint{color:var(--muted);font-size:.85rem;margin:6px 0 0;width:100%;min-height:1.2em}'
+'#des-box .d-setup{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:8px 0 0}'
+'#des-box .d-rowsline{display:flex;flex-wrap:wrap;gap:10px;align-items:center}'
+'#des-box .d-row{display:flex;align-items:center;gap:6px;margin:0}'
+'#des-box .d-add-sq{background:transparent;border:1px solid var(--tealline);color:var(--teal);border-radius:8px;width:38px;height:46px;cursor:pointer;font-size:1.4rem;line-height:1;font-family:Rajdhani,sans-serif;font-weight:700}'
+'#des-box .d-add-sq:hover{background:var(--tealsoft)}'
+'#des-box .d-acts{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:8px 0 0}'
+'#des-box .d-acts .d-drama{flex:1 1 auto;text-align:center;align-self:center}'
+'#des-box .d-drama{font-family:Rajdhani,sans-serif;font-weight:700;font-size:.95rem;letter-spacing:.05em;color:var(--amber);font-style:italic;opacity:0;transition:opacity .3s}'
+'#des-box .d-drama.show{opacity:1}'
+'#des-box .d-drama.result{font-style:normal}'
+'#des-box .d-drama.ghostd{color:var(--muted)}'
+'#des-box #d-list{border:1px solid var(--tealline);border-radius:12px;background:var(--panel);padding:12px 16px;margin-top:12px;max-height:520px;overflow-y:auto}'
+'#des-box .d-roll{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:baseline;padding:8px 12px;border:1px dashed var(--tealline);border-radius:10px;margin:7px 0;background:var(--panel2)}'
+'#des-box .d-roll.rolling{animation:dpulse .9s ease-in-out infinite}'
+'#des-box .d-who{font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.04em;color:var(--teal)}'
+'#des-box .d-type{font-family:Rajdhani,sans-serif;font-weight:700;font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;color:var(--amber)}'
+'#des-box .d-detail{color:var(--muted);font-size:.88rem;overflow-wrap:anywhere}'
+'#des-box .d-total{font-family:Rajdhani,sans-serif;font-weight:700;font-size:1.12rem;color:var(--amber);white-space:nowrap}'
+'#des-box .d-fx,#des-box .d-fx2{font-family:Rajdhani,sans-serif;font-weight:700;color:var(--amber)}'
+'@keyframes dpulse{50%{opacity:.55}}'
+'#des-box .cm-roll{padding:3px 0;line-height:1.45;word-wrap:break-word;font-size:.95rem;border-bottom:1px solid rgba(63,214,192,.08)}'
+'#des-box .cm-roll .cm-who{font-weight:700;font-family:Rajdhani,sans-serif;color:var(--teal)}'
+'#des-box .cm-roll.cm-mj .cm-who{color:var(--amber)}'
+'#des-box .cm-roll .cm-time{color:var(--muted);font-size:.75rem}'
+'#des-box .cm-roll .cm-total{font-weight:700;color:var(--amber)}'
+'#des-box .cm-dghost{opacity:.85;font-style:italic}'
+'#des-box .cm-ghostnote{color:var(--muted);font-size:.75rem;font-style:normal}';
document.head.appendChild(st);
function g(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function setStatus(t,err){var e=g('d-status');if(e){e.textContent=t;e.className='d-status'+(err?' err':'');}}
box.innerHTML='<div class="d-tools">'
+'<div class="d-setup"><select class="d-fld" id="d-type">'
+'<option value="normal">Jet normal (partagé)</option>'
+'<option value="fantome">Jet fantôme (local)</option>'
+'<option value="attaque">⚔️ Jet d\'attaque</option>'
+'</select>'
+'<div class="d-rowsline" id="d-rows"></div>'
+'<button class="d-add-sq" id="d-add" type="button" title="Ajouter un groupe de dés">+</button></div>'
+'<div class="d-acts"><button class="btn primary" id="d-roll-btn" type="button"><span class="pe-star"></span> Lancer</button>'
+'<span class="d-drama" id="d-drama"></span></div>'
+'<p class="d-hint" id="d-hint"></p>'
+'</div>'
+'<p class="d-status" id="d-status"></p>'
+'<div id="d-list"></div>';
/* ————— Lignes de dés ————— */
var ROWS=[{n:1,f:20}];
function nOpts(v){var s='';for(var i=1;i<=12;i++){s+='<option value="'+i+'"'+(i===v?' selected':'')+'>'+i+'</option>';}return s;}
function fOpts(v){var f='';[4,6,8,10,12,20,100].forEach(function(x){f+='<option value="'+x+'"'+(x===v?' selected':'')+'>'+x+'</option>';});return f;}
function renderRows(){
  var h='';
  ROWS.forEach(function(r,i){
    h+='<div class="d-row">'
    +(i>0?'<span class="d-plus">+</span>':'')
    +'<select class="d-fld d-n" data-i="'+i+'">'+nOpts(r.n)+'</select>'
    +'<span class="d-plus">D</span>'
    +'<select class="d-fld d-f" data-i="'+i+'">'+fOpts(r.f)+'</select>'
    +(ROWS.length>1?'<button type="button" class="d-x" data-x="'+i+'" title="Retirer cette ligne">✕</button>':'')
    +'</div>';
  });
  g('d-rows').innerHTML=h;
}
g('d-rows').addEventListener('change',function(ev){
  var t=ev.target,i=parseInt(t.getAttribute('data-i'),10);
  if(isNaN(i)){return;}
  if(t.className.indexOf('d-n')>-1){ROWS[i].n=parseInt(t.value,10)||1;}
  else if(t.className.indexOf('d-f')>-1){ROWS[i].f=parseInt(t.value,10)||20;}
});
g('d-rows').addEventListener('click',function(ev){
  var t=ev.target,i=parseInt(t.getAttribute('data-x'),10);
  if(isNaN(i)){return;}
  ROWS.splice(i,1);renderRows();
});
g('d-add').addEventListener('click',function(){
  if(ROWS.length>=MAX_LIGNES){setStatus(MAX_LIGNES+' groupes de dés maximum par lancer.',true);return;}
  setStatus('');
  ROWS.push({n:1,f:20});renderRows();
});
renderRows();
/* ————— Type de jet ————— */
function hint(){
  var t=g('d-type').value;
  if(t==='fantome'){return '👻 Le jet fantôme reste dans ce navigateur : invisible pour les autres joueurs, absent de la base partagée et de la console — juste pour jouer avec tes dés.';}
  if(t==='attaque'){return '⚔️ Le jet d\'attaque lancera les dés de l\'arme de ton personnage actif (ex. 3D6 + bonus de caractéristique) — règle en préparation, il ne fait encore rien.';}
  return '';
}
g('d-type').addEventListener('change',function(){g('d-hint').textContent=hint();setStatus('');});
function typeLib(j){return j.ghost?'Jet fantôme (local)':'Jet normal';}
var ANIM_MS=3000;
function typeWord(){var t=g('d-type').value;return t==='fantome'?'Jet fantôme (local)':'Jet normal';}
function rollingRow(label,gr){
  var d=document.createElement('div');
  d.className='d-roll rolling';
  d.innerHTML='<span class="d-who">'+esc(quiLance())+'</span>'
  +'<span class="d-type">'+esc(typeWord())+'</span>'
  +'<span class="d-detail">'+esc(label)+' : <span class="d-fx"></span></span>'
  +'<span class="d-total">= <span class="d-fx2">?</span></span>'
  +'<span class="d-when">⬥</span>';
  var list=g('d-list');
  list.insertBefore(d,list.firstChild);
  var f=d.querySelector('.d-fx'),t2=d.querySelector('.d-fx2');
  var iv=setInterval(function(){
    var s=[],tot=0;
    gr.forEach(function(r){for(var k=0;k<r.n;k++){var v=1+Math.floor(Math.random()*r.faces);s.push(v);tot+=v;}});
    f.textContent=s.join(' + ');
    t2.textContent=tot;
  },90);
  return new Promise(function(res){setTimeout(function(){clearInterval(iv);d.remove();res();},ANIM_MS);});
}
function hdr(){return{'apikey':SBK,'Authorization':'Bearer '+SBK};}
function fmtWhen(iso){
  var d=new Date(iso),now=new Date();
  var hh=('0'+d.getHours()).slice(-2),mm=('0'+d.getMinutes()).slice(-2);
  if(d.toDateString()===now.toDateString()){return hh+':'+mm;}
  return d.getDate()+'/'+(d.getMonth()+1)+' '+hh+':'+mm;
}
function render(list){
  var me=quiLance();
  var all=(list||[]).concat(GHOSTS);
  all.sort(function(a,b){return new Date(b.created_at)-new Date(a.created_at);});
  all=all.slice(0,NB_MAX);
  var out='';
  all.forEach(function(j){
    var cls='cm cm-roll'+((!j.ghost&&me&&j.joueur===me)?' cm-mj':'')+(j.ghost?' cm-dghost':'');
    out+='<div class="'+cls+'">'
    +'<span class="cm-time">'+fmtWhen(j.created_at)+'</span> '
    +'<span class="cm-who">'+esc(j.joueur)+'</span> : '
    +esc(typeLib(j))+' — '+esc(j.label||(j.n+'D'+j.faces))+' : '+esc((j.detail||[]).join(' + '))
    +' = <span class="cm-total">'+j.total+'</span>'
    +(j.ghost?' <span class="cm-ghostnote">(fantôme — visible de toi seul)</span>':'')
    +'</div>';
  });
  g('d-list').innerHTML=out||'<p style="color:var(--muted);font-size:.9rem">Aucun jet pour l\'instant — lance le premier !</p>';
}
function refresh(){
  fetch(SB+'rest/v1/jets?select=id,joueur,n,faces,detail,total,created_at&order=id.desc&limit='+NB_MAX,{headers:hdr()})
  .then(function(r){if(!r.ok){throw new Error('http');}return r.json();})
  .then(function(l){render(l||[]);})
  .catch(function(){});
}
/* ————— Publication console : l'identite suit la ZONE, pas les sessions presentes ————— */
function consolePub(label,det,tot){
  try{
    var contenu='⬥ '+label+' : '+(det||[]).join(' + ')+' = '+tot;
    var send=function(h){fetch(SB+'rest/v1/rpc/console_envoyer',{method:'POST',headers:h,body:JSON.stringify({p_contenu:contenu,p_dest:[],p_type:'de'})}).catch(function(){});};
    if(EST_ZONE_MJ){
      if(window.supabase&&window.supabase.createClient){
        var c=window.supabase.createClient(SB,SBK,{auth:{persistSession:true,storageKey:'pe-mj-auth'}});
        c.auth.getSession().then(function(r){
          var t=r&&r.data&&r.data.session&&r.data.session.access_token;
          if(t){send({'apikey':SBK,'Authorization':'Bearer '+t,'Content-Type':'application/json'});}
        }).catch(function(){});
      }
    }else{
      try{
        var s=JSON.parse(localStorage.getItem('pe_session')||'null');
        if(s&&s.token){send({'apikey':SBK,'x-token':s.token,'Content-Type':'application/json'});}
      }catch(e){}
    }
  }catch(e){}
}
/* ————— Lancer ————— */
function groups(){
  return ROWS.map(function(r){return {n:Math.max(1,parseInt(r.n,10)||1),faces:Math.max(2,parseInt(r.f,10)||20)};});
}
var DRAMA=['Vas-tu réussir ton action ?','Le destin hésite…','Les Protocoles scrutent les dés…','Les échos du warp se taisent…','Ta main tremble-t-elle ?','La machine calcule ton sort…','Les étoiles retiennent leur souffle…','Le trépas ou la gloire ?'];
var DRAMA_GHOST=['Personne ne verra ce jet… sauf toi.','Un secret scellé dans le silence…','Les fantômes ne laissent pas de trace…'];
function dramaOn(gh){var pool=gh?DRAMA_GHOST:DRAMA;var el=g('d-drama');if(!el){return;}el.textContent=pool[Math.floor(Math.random()*pool.length)];el.className='d-drama show'+(gh?' ghostd':'');}
function dramaResult(label,det,tot,gh){var el=g('d-drama');if(!el){return;}el.textContent='• '+label+' → '+tot+' ('+(det||[]).join(' + ')+')'+(gh?' — fantôme, visible de toi seul':'');el.className='d-drama show result'+(gh?' ghostd':'');}
function roll(){
  var type=g('d-type').value;
  var nom=quiLance();
  var gr=groups();
  var label=gr.map(function(r){return r.n+'D'+r.faces;}).join(' + ');
  if(type==='attaque'){
    setStatus('⚔️ Jet d\'attaque : les dés de l\'arme du personnage actif arrivent bientôt — pour l\'instant, utilise un jet normal.',true);
    return;
  }
  if(type==='fantome'){
    var det=[],tot=0;
    gr.forEach(function(r){for(var i=0;i<r.n;i++){var v=1+Math.floor(Math.random()*r.faces);det.push(v);tot+=v;}});
    var phg=rollingRow(label,gr);
    dramaOn(true);
    Promise.all([Promise.resolve(),phg]).then(function(){
      GHOSTS.push({joueur:nom,label:label,detail:det,total:tot,created_at:new Date().toISOString(),ghost:true});
      if(GHOSTS.length>30){GHOSTS.shift();}
      dramaResult(label,det,tot,true);
      refresh();
    });
    return;
  }

  dramaOn(false);
  var ph=rollingRow(label,gr);
  var results=[];
  var chain=Promise.resolve();
  gr.forEach(function(r){
    chain=chain.then(function(){
      return fetch(SB+'rest/v1/rpc/lancer_des',{method:'POST',headers:{'apikey':SBK,'Authorization':'Bearer '+SBK,'Content-Type':'application/json'},body:JSON.stringify({n:r.n,faces:r.faces,joueur:nom})})
      .then(function(res){if(!res.ok){throw new Error('http '+res.status);}return res.json();})
      .then(function(j){results.push({r:r,j:j});});
    });
  });
  Promise.all([chain,ph]).then(function(){
    var det=[],tot=0;
    results.forEach(function(x){
      var d=(x.j&&x.j.detail)||[];
      if(Array.isArray(d)&&d.length){d.forEach(function(v){det.push(v);tot+=v;});}
      else{var t=(x.j&&x.j.total)||0;det.push(t);tot+=t;}
    });
    dramaResult(label,det,tot,false);
    refresh();
    consolePub(label,det,tot);
  })
  .catch(function(){setStatus('Lancer impossible — vérifie ta connexion internet.',true);});
}
g('d-roll-btn').addEventListener('click',roll);
var RT=false;
try{
  if(window.supabase&&window.supabase.createClient){
    var cli=window.supabase.createClient(SB,SBK,{auth:{persistSession:false}});
    cli.channel('des-live')
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'jets'},function(){refresh();})
    .subscribe(function(stat){if(stat==='SUBSCRIBED'){RT=true;}});
  }
}catch(e){}
setInterval(function(){if(!RT&&!document.hidden&&box.offsetParent!==null){refresh();}},15000);
refresh();
})();