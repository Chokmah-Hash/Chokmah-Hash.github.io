/* Jets de dés partagés — Les Protocoles Éternels */
/* PE_BUILD 2026.10.18-des5 — multi-groupes (3D6 + 1D20), type de jet (normal / fantôme local / attaque à venir), 10 derniers jets */
(function(){
var PE_BUILD='2026.10.18-des5';
window.PE_DES_BUILD=PE_BUILD;
var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var box=document.getElementById('des-box');
if(!box){return;}
/* Identite par zone : mj.html => MJ, mon-espace.html => joueur connecte */
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
st.textContent='#des-box .d-tools{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin:12px 0}'
+'#des-box .d-lbl{display:block;font-size:.68rem;font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--teal);margin:0 0 4px}'
+'#des-box .d-fld{background:var(--panel);border:1px solid var(--tealline);border-radius:9px;color:var(--text);font-family:inherit;font-size:.95rem;padding:9px 12px}'
+'#des-box .d-fld:focus{outline:none;border-color:var(--teal)}'
+'#des-box .d-row{display:flex;align-items:center;gap:6px;margin:6px 0}'
+'#des-box .d-plus{color:var(--teal);font-family:Rajdhani,sans-serif;font-weight:700}'
+'#des-box .d-x{background:transparent;border:1px solid rgba(226,96,79,.5);color:var(--danger);border-radius:8px;width:32px;height:34px;font-size:.85rem;cursor:pointer}'
+'#des-box .d-x:hover{background:rgba(226,96,79,.1)}'
+'#des-box .d-add{background:transparent;border:1px dashed var(--tealline);color:var(--teal);cursor:pointer;font-size:.82rem;min-height:34px}'
+'#des-box .d-add:hover{background:var(--tealsoft)}'
+'#des-box .d-status{color:var(--muted);font-size:.88rem;margin:8px 0 4px;min-height:1.3em}'
+'#des-box .d-status.err{color:var(--danger)}'
+'#des-box .d-hint{color:var(--muted);font-size:.85rem;margin:6px 0 0;width:100%;min-height:1.2em}'
+'#des-box .d-roll{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:9px 13px;border:1px solid var(--tealline);border-radius:10px;margin:7px 0;background:var(--panel2)}'
+'#des-box .d-roll.mine{border-color:var(--amberline)}'
+'#des-box .d-roll.ghost{border-style:dashed;opacity:.92}'
+'#des-box .d-who{font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.04em;color:var(--teal)}'
+'#des-box .d-detail{color:var(--muted);font-size:.88rem}'
+'#des-box .d-total{font-family:Rajdhani,sans-serif;font-weight:700;font-size:1.12rem;color:var(--amber)}'
+'#des-box .d-ghost-tag{font-size:.72rem;color:var(--muted);font-style:italic}'
+'#des-box .d-when{margin-left:auto;color:var(--muted);font-size:.78rem}';
document.head.appendChild(st);
function g(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function setStatus(t,err){var e=g('d-status');if(e){e.textContent=t;e.className='d-status'+(err?' err':'');}}
box.innerHTML='<div class="d-tools">'
+'<div><label class="d-lbl" for="d-type">Type de jet</label><select class="d-fld" id="d-type">'
+'<option value="normal">🎲 Jet normal (partagé)</option>'
+'<option value="fantome">👻 Jet fantôme (local)</option>'
+'<option value="attaque">⚔️ Jet d\'attaque</option>'
+'</select></div>'
+'<div><span class="d-lbl">Dés — un groupe par ligne</span><div id="d-rows"></div>'
+'<div class="d-row"><button class="d-fld d-add" id="d-add" type="button">+ Ajouter un dé</button></div></div>'
+'<div><button class="btn primary" id="d-roll-btn" type="button" style="min-height:42px">🎲 Lancer</button></div>'
+'<div><span class="d-lbl">Lanceur</span><span class="d-who" id="d-qui"></span></div>'
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
function refreshQui(){g('d-qui').textContent=quiLance();}
refreshQui();
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
    out+='<div class="d-roll'+(j.ghost?' ghost':'')+((!j.ghost&&me&&j.joueur===me)?' mine':'')+'">'
    +'<span class="d-who">'+(j.ghost?'👻 ':'')+esc(j.joueur)+'</span>'
    +'<span>'+esc(j.label||(j.n+'D'+j.faces))+' :</span>'
    +'<span class="d-detail">'+(j.detail||[]).join(' + ')+'</span>'
    +'<span class="d-total">= '+j.total+'</span>'
    +(j.ghost?'<span class="d-ghost-tag">jet fantôme — local</span>':'')
    +'<span class="d-when">'+fmtWhen(j.created_at)+'</span>'
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
    var contenu='🎲 '+label+' : '+(det||[]).join(' + ')+' = '+tot;
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
    GHOSTS.push({joueur:nom,label:label,detail:det,total:tot,created_at:new Date().toISOString(),ghost:true});
    if(GHOSTS.length>30){GHOSTS.shift();}
    setStatus('👻 '+label+' → total '+tot+' ('+det.join(' + ')+') — jet fantôme, visible de toi seul.');
    refresh();
    return;
  }
  setStatus('Les dés roulent…');
  var results=[];
  var chain=Promise.resolve();
  gr.forEach(function(r){
    chain=chain.then(function(){
      return fetch(SB+'rest/v1/rpc/lancer_des',{method:'POST',headers:{'apikey':SBK,'Authorization':'Bearer '+SBK,'Content-Type':'application/json'},body:JSON.stringify({n:r.n,faces:r.faces,joueur:nom})})
      .then(function(res){if(!res.ok){throw new Error('http '+res.status);}return res.json();})
      .then(function(j){results.push({r:r,j:j});});
    });
  });
  chain.then(function(){
    var det=[],tot=0;
    results.forEach(function(x){
      var d=(x.j&&x.j.detail)||[];
      if(Array.isArray(d)&&d.length){d.forEach(function(v){det.push(v);tot+=v;});}
      else{var t=(x.j&&x.j.total)||0;det.push(t);tot+=t;}
    });
    setStatus('🎲 '+label+' → total '+tot+' ('+det.join(' + ')+')');
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