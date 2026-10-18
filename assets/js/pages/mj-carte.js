
var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var SYS=[],SECRETS={},COMPTES={},MJMODE=false,MJKEY='',SEL=null,PLACING=false,POSTIMER=null,POSDATA=[];
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function msg(id,t,cls){var m=$(id);if(m){m.textContent=t;m.className='gmsgc '+(cls||'');}}
function H(extra){var h={'apikey':SBK,'Authorization':'Bearer '+(window.MJBEARER||SBK),'Content-Type':'application/json'};if(extra){for(var k in extra){h[k]=extra[k];}}return h;}
function HM(extra){var h=H(extra);h['x-mj-key']=MJKEY;return h;}
function fetchJ(url,opt){return fetch(url,opt||{headers:H()}).then(function(r){if(!r.ok){throw new Error('HTTP '+r.status);}return r.json();});}
function prng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function starsSvg(){var r=prng(424242),s='<g>';
for(var i=0;i<110;i++){var x=(r()*1000).toFixed(1),y=(r()*700).toFixed(1),rad=(0.4+r()*1.5).toFixed(1),op=(0.12+r()*0.55).toFixed(2);
s+='<circle cx="'+x+'" cy="'+y+'" r="'+rad+'" fill="#bfe9df" opacity="'+op+'"/>';}
s+='<circle cx="500" cy="350" r="230" fill="none" stroke="#2ee6c9" stroke-opacity="0.05"/>';
s+='<circle cx="500" cy="350" r="420" fill="none" stroke="#2ee6c9" stroke-opacity="0.035"/>';
s+='<circle cx="500" cy="350" r="600" fill="none" stroke="#2ee6c9" stroke-opacity="0.02"/>';
return s+'</g>';}
function sysLabel(g){var x=Math.max(50,Math.min(950,g.x));var y=g.y>560?g.y-30:g.y+30;return String(x)+','+String(y);}
function impTgt(g){
  if(!g.data||!g.data.cible){return '';}
  var x=g.x,y=g.y;
  var s='<g style="pointer-events:none">';
  s+='<circle cx="'+x+'" cy="'+y+'" r="26" fill="none" stroke="#f0b24a" stroke-width="1.6" stroke-opacity=".9"/>';
  s+='<circle cx="'+x+'" cy="'+y+'" r="36" fill="none" stroke="#c2454f" stroke-width="1.2" stroke-dasharray="5 4" stroke-opacity=".85"/>';
  s+='<line x1="'+(x-42)+'" y1="'+y+'" x2="'+(x-27)+'" y2="'+y+'" stroke="#f0b24a" stroke-width="1.6"/>';
  s+='<line x1="'+(x+27)+'" y1="'+y+'" x2="'+(x+42)+'" y2="'+y+'" stroke="#f0b24a" stroke-width="1.6"/>';
  s+='<line x1="'+x+'" y1="'+(y-42)+'" x2="'+x+'" y2="'+(y-27)+'" stroke="#f0b24a" stroke-width="1.6"/>';
  s+='<line x1="'+x+'" y1="'+(y+27)+'" x2="'+x+'" y2="'+(y+42)+'" stroke="#f0b24a" stroke-width="1.6"/>';
  return s+'</g>';
}
function renderMap(){
  var svg='<svg id="g-svg" viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Carte de la galaxie">';
  svg+='<defs><radialGradient id="nebg"><stop offset="0%" stop-color="rgba(46,230,201,.35)"/><stop offset="100%" stop-color="rgba(46,230,201,0)"/></radialGradient></defs>';
  svg+=starsSvg();
  var posIdx={};
  if(MJMODE){POSDATA.forEach(function(p){if(p.galaxie_id){posIdx[p.galaxie_id]=posIdx[p.galaxie_id]||[];posIdx[p.galaxie_id].push(p);}});}
  SYS.forEach(function(g){
    var shape='';
    if(g.categorie==='vaisseau'){
      shape='<circle class="halo" cx="'+g.x+'" cy="'+g.y+'" r="18" fill="#f0b24a" opacity=".10"/><polygon points="'+g.x+','+(g.y-11)+' '+(g.x+11)+','+g.y+' '+g.x+','+(g.y+11)+' '+(g.x-11)+','+g.y+'" fill="#f0b24a"/>';
    }else if(g.categorie==='nebuleuse'){
      shape='<circle cx="'+g.x+'" cy="'+g.y+'" r="46" fill="url(#nebg)"/><circle cx="'+g.x+'" cy="'+g.y+'" r="8" fill="rgba(46,230,201,.6)"/>';
    }else if(g.categorie==='inconnu'){
      shape='<circle cx="'+g.x+'" cy="'+g.y+'" r="7" fill="#0d1713" stroke="#93aca1" stroke-dasharray="3 3"/>';
    }else{
      shape='<circle class="halo" cx="'+g.x+'" cy="'+g.y+'" r="18" fill="#2ee6c9" opacity=".12"/><circle cx="'+g.x+'" cy="'+g.y+'" r="7" fill="#2ee6c9"/>';
    }
    var lbl=(g.categorie==='inconnu')?'?':g.nom;
    var op=(g.categorie==='inconnu')?'0.75':'1';
    var lb=sysLabel(g).split(',');
    svg+='<g class="sysg" data-id="'+g.id+'" id="sys-'+g.id+'">'+impTgt(g)+shape+'<text x="'+lb[0]+'" y="'+lb[1]+'" text-anchor="middle" fill="#e8f5f1" opacity="'+op+'" font-size="13" font-family="Rajdhani" font-weight="600" style="pointer-events:none">'+esc(lbl)+'</text>';
    var ps=posIdx[g.id]||[];
    ps.forEach(function(p,i){
      var py=g.y-22-(i*15),px=g.x;
      svg+='<circle class="posdot" cx="'+px+'" cy="'+(py+4)+'" r="4" fill="#f0b24a" style="pointer-events:none"/>';
      svg+='<text x="'+px+'" y="'+py+'" text-anchor="middle" fill="#f0b24a" font-size="11" font-family="Exo 2" style="pointer-events:none">'+esc((COMPTES[p.compte_id]||{}).nom||p.compte_id)+'</text>';
    });
    svg+='</g>';
  });
  svg+='</svg>';
  $('g-map').innerHTML=svg;
  Array.prototype.forEach.call(document.querySelectorAll('.sysg'),function(el){
    el.addEventListener('click',function(ev){ev.stopPropagation();select(parseInt(el.getAttribute('data-id'),10));});
  });
  var sv=$('g-svg');
  sv.addEventListener('click',function(ev){
    if(!PLACING||!MJMODE){return;}
    var r=sv.getBoundingClientRect();
    var px=Math.round(Math.max(5,Math.min(995,(ev.clientX-r.left)/r.width*1000)));
    var py=Math.round(Math.max(5,Math.min(695,(ev.clientY-r.top)/r.height*700)));
    $('g-x').value=px;$('g-y').value=py;PLACING=false;
    $('g-place').textContent='Placer sur la carte';
    msg('g-msg','Position : '+px+', '+py+' — clique sur Enregistrer.','ok');
  });
}
function catLabel(c){return c==='vaisseau'?'Vaisseau-tombe':c==='nebuleuse'?'Nébuleuse':c==='inconnu'?'Inexploré':'Système';}
function select(id){SEL=id;plaCleanup();renderPanel();loadPlanetes(id);}
function renderPanel(){
  var el=$('g-panel');
  if(!SEL){el.innerHTML='<p style="color:var(--muted);font-size:.95rem">Clique sur un système de la carte pour afficher sa fiche : description, planètes, lieux remarquables et créatures recensées.</p>';return;}
  var g=null;SYS.forEach(function(s){if(s.id===SEL){g=s;}});
  if(!g){SEL=null;renderPanel();return;}
  var d=g.data||{};
  var out='<h3 style="margin:.1em 0 .3em">'+esc(g.nom)+'</h3><span class="badge'+(g.categorie==='vaisseau'?' amber':'')+'">'+esc(catLabel(g.categorie))+'</span>';
  if(g.description){out+='<p class="pv" style="margin-top:10px">'+esc(g.description)+'</p>';}
  (d.planetes||[]).forEach(function(pl){
    out+='<div class="pl">✦ '+esc(pl.nom)+'</div>';
    if(pl.infos){out+='<p class="pv">'+esc(pl.infos)+'</p>';}
    (pl.lieux||[]).forEach(function(l){out+='<div class="lieu"><b>'+esc(l.nom)+'</b>'+(l.infos?' — '+esc(l.infos):'')+'</div>';});
  });
  (d.lieux||[]).forEach(function(l){out+='<div class="lieu"><b>'+esc(l.nom)+'</b>'+(l.infos?' — '+esc(l.infos):'')+'</div>';});
  if((d.creatures||[]).length){
    out+='<div class="pl">Créatures recensées</div><div class="chips">';
    d.creatures.forEach(function(c){out+='<a href="/bestiaire.html?c='+encodeURIComponent(c)+'">'+esc(c)+'</a>';});
    out+='</div>';
  }
  if(MJMODE){
    var sec=SECRETS[g.id];
    if(sec){out+='<div class="note-box amber" style="margin-top:12px"><strong>Vérités cachées :</strong> '+esc(sec)+'</div>';}
    out+='<div class="cta-row" style="justify-content:flex-start;margin-top:10px">'
      +'<button class="btn amber sm" id="g-edit" type="button">✎ Modifier ce système</button>'
      +'<button class="btn danger sm" id="g-del2" type="button">✕ Supprimer</button></div>';
  }
  el.innerHTML=out;
  var be=$('g-edit');if(be){be.addEventListener('click',function(){fillForm(g);});}
  var bd=$('g-del2');if(bd){bd.addEventListener('click',function(){$('g-id').value=g.id;delSys();});}
}
function loadGalaxie(){
  fetchJ(SB+'galaxie?select=*&order=nom.asc').then(function(list){
    SYS=list||[];renderMap();renderPanel();
  }).catch(function(){
    msg('mj-msg','Carte inaccessible — vérifie ta connexion internet.','err');
  });
}
function loadComptes(){return fetchJ(SB+'comptes?select=id,login,nom').then(function(l){COMPTES={};(l||[]).forEach(function(c){COMPTES[c.id]=c;});}).catch(function(){});}
function loadPositions(){
  if(!MJMODE){return;}
  fetchJ(SB+'positions?select=compte_id,galaxie_id,lieu,maj&order=maj.desc',{headers:HM()}).then(function(rows){
    POSDATA=rows||[];renderPosTable();renderMap();
  }).catch(function(){});
}
function renderPosTable(){
  var out='';
  if(!POSDATA.length){out='<tr><td colspan="4" style="color:var(--muted)">Aucun joueur ne s’est encore localisé.</td></tr>';}
  POSDATA.forEach(function(p){
    var c=COMPTES[p.compte_id]||{};
    var gname='ailleurs';
    SYS.forEach(function(s){if(s.id===p.galaxie_id){gname=s.nom;}});
    var age=Math.floor((Date.now()-new Date(p.maj).getTime())/1000);
    var st=age<60?'<span class="on">● En ligne</span>':'vu il y a '+Math.max(1,Math.floor(age/60))+' min';
    out+='<tr><td>'+esc(c.nom||c.login||'?')+'</td><td>'+esc(gname)+'</td><td>'+esc(p.lieu||'—')+'</td><td>'+st+'</td></tr>';
  });
  $('mj-positions').innerHTML=out;
}
function loadSecrets(){
  return fetchJ(SB+'galaxie_secret?select=galaxie_id,contenu',{headers:HM()}).then(function(rows){
    SECRETS={};(rows||[]).forEach(function(r){SECRETS[r.galaxie_id]=r.contenu;});
  }).catch(function(){});
}
$('mj-open').addEventListener('click',function(){
  var k=$('mj-key').value;
  if(!k){msg('mj-msg','Saisis ta clé MJ.','err');return;}
  MJKEY=k;
  loadSecrets().then(function(){return loadComptes();}).then(function(){
    return fetchJ(SB+'positions?select=compte_id,galaxie_id,lieu,maj&order=maj.desc',{headers:HM()});
  }).then(function(rows){
    MJMODE=true;POSDATA=rows||[];
    $('mj-tools').style.display='';
    $('mj-key').value='';
    msg('mj-msg','Console MJ ouverte. Les vérités cachées et les positions sont visibles.','ok');
    renderMap();renderPanel();renderPosTable();if(SEL){loadPlanetes(SEL);}else{renderPlaBox();}
    if(POSTIMER){clearInterval(POSTIMER);}
    POSTIMER=setInterval(loadPositions,15000);
  }).catch(function(){
    MJKEY='';msg('mj-msg','Clé refusée ou base inaccessible.','err');
  });
});
function fillForm(g){
  $('g-form-title').textContent='Modifier : '+g.nom;
  $('g-id').value=g.id;$('g-nom').value=g.nom;$('g-cat').value=g.categorie;
  $('g-x').value=g.x;$('g-y').value=g.y;$('g-desc').value=g.description||'';
  var d=g.data||{},pla=[],lieux=[],crea=[];
  (d.planetes||[]).forEach(function(p){pla.push(p.nom+(p.infos?' | '+p.infos:''));(p.lieux||[]).forEach(function(l){lieux.push(l.nom+(l.infos?' | '+l.infos:''));});});
  (d.lieux||[]).forEach(function(l){lieux.push(l.nom+(l.infos?' | '+l.infos:''));});
  (d.creatures||[]).forEach(function(c){crea.push(c);});
  $('g-pla').value=pla.join('\n');$('g-lieux').value=lieux.join('\n');$('g-crea').value=crea.join('\n');
  $('g-secret').value=SECRETS[g.id]||'';
  $('g-del').style.display='';
  msg('g-msg','Formulaire chargé. Le bouton « Placer sur la carte » permet de repositionner par un clic.','');
}
function clearForm(){
  $('g-form-title').textContent='Nouveau système';
  ['g-id','g-nom','g-desc','g-pla','g-lieux','g-crea','g-secret'].forEach(function(i){$(i).value='';});
  $('g-x').value=500;$('g-y').value=350;$('g-cat').value='systeme';
  $('g-del').style.display='none';msg('g-msg','');
}
function parseLines(t){
  var out=[];
  (t||'').split('\n').forEach(function(l){
    l=l.trim();if(!l){return;}
    var nom=l,infos='';
    if(l.indexOf('|')>0){var i=l.indexOf('|');nom=l.slice(0,i).trim();infos=l.slice(i+1).trim();}
    out.push({nom:nom,infos:infos});
  });
  return out;
}
$('g-new').addEventListener('click',function(){if(!MJMODE){msg('g-msg','Ouvre d’abord la console MJ avec ta clé.','err');return;}clearForm();});
$('g-place').addEventListener('click',function(){
  if(!MJMODE){msg('g-msg','Ouvre d’abord la console MJ avec ta clé.','err');return;}
  PLACING=true;this.textContent='Clique sur la carte…';
  msg('g-msg','Mode placement : touche la carte à l’endroit voulu.','');
});
$('g-del').addEventListener('click',delSys);
function delSys(){
  if(!MJMODE){return;}
  var id=$('g-id').value;
  if(!id){msg('g-msg','Aucun système sélectionné dans le formulaire.','err');return;}
  if(!window.confirm('Supprimer définitivement ce système de la carte ?')){return;}
  fetchJ(SB+'planetes?select=id&galaxie_id=eq.'+id,{headers:HM()}).then(function(pls){
    var chain=Promise.resolve();
    (pls||[]).forEach(function(pl){
      chain=chain.then(function(){return fetch(SB+'planetes_poi?planete_id=eq.'+pl.id,{method:'DELETE',headers:HM()});});
      chain=chain.then(function(){return fetch(SB+'planetes?id=eq.'+pl.id,{method:'DELETE',headers:HM()});});
    });
    return chain;
  }).then(function(){
    return fetch(SB+'galaxie?id=eq.'+id,{method:'DELETE',headers:HM()});
  }).then(function(r){
    if(!r.ok){throw new Error('HTTP '+r.status);}
    msg('g-msg','Système supprimé.','ok');clearForm();loadGalaxie();
    if(MJMODE){loadSecrets();loadPositions();}
  }).catch(function(){msg('g-msg','Suppression impossible — vérifie ta clé.','err');});
}
$('g-save').addEventListener('click',function(){
  if(!MJMODE){msg('g-msg','Ouvre d’abord la console MJ avec ta clé.','err');return;}
  var nom=$('g-nom').value.trim();
  if(!nom){msg('g-msg','Donne un nom au système.','err');return;}
  var data={planetes:parseLines($('g-pla').value),lieux:parseLines($('g-lieux').value),creatures:parseLines($('g-crea').value).map(function(x){return x.nom;})};
  var body={nom:nom,x:parseInt($('g-x').value,10)||0,y:parseInt($('g-y').value,10)||0,categorie:$('g-cat').value,description:$('g-desc').value.trim(),data:data};
  var id=$('g-id').value;
  var req;
  if(id){req=fetch(SB+'galaxie?id=eq.'+id,{method:'PATCH',headers:HM(),body:JSON.stringify(body)});}
  else{req=fetch(SB+'galaxie',{method:'POST',headers:HM(),body:JSON.stringify(body)});}
  req.then(function(r){
    if(!r.ok){throw new Error('HTTP '+r.status);}
    return $('g-secret').value.trim();
  }).then(function(secretTx){
    if(!secretTx||!MJMODE){return;}
    return fetchJ(SB+'galaxie?select=id&nom=eq.'+encodeURIComponent(nom),{headers:HM()}).then(function(rows){
      var gid=(rows&&rows[0])?rows[0].id:null;
      if(!gid){return;}
      return fetch(SB+'galaxie_secret?on_conflict=galaxie_id',{method:'POST',headers:HM({'Prefer':'resolution=merge-duplicates'}),body:JSON.stringify({galaxie_id:gid,contenu:secretTx})});
    });
  }).then(function(){
    msg('g-msg','Système enregistré sur la carte.','ok');
    clearForm();loadGalaxie();if(SEL){loadPlanetes(SEL);}
    if(MJMODE){loadSecrets().then(function(){renderPanel();});loadPositions();}
  }).catch(function(e){msg('g-msg','Enregistrement impossible ('+(e.message||'erreur')+') — vérifie ta clé.','err');});
});
loadGalaxie();

/* ————— Planètes & points d'intérêt (phase 2) ————— */
var PLS={},PSEL=null,PSELPLA=null,POIS=[],PPLACING=false;
function plaCleanup(){PSEL=null;PSELPLA=null;POIS=[];PPLACING=false;var pc=$('poi-card');if(pc){pc.style.display='none';}var pf=$('p-form');if(pf){pf.style.display='none';}var pw=$('poi-form');if(pw){pw.style.display='none';}}
function loadPlanetes(id){
  fetchJ(SB+'planetes?select=*&galaxie_id=eq.'+id+'&order=id.asc',{headers:HM()}).then(function(l){PLS[id]=l||[];renderPlaBox();}).catch(function(){});
}
function renderPlaBox(){
  var box=$('g-pla-box');
  if(!box){return;}
  if(!SEL){box.innerHTML='<p class="pv">Clique sur un système de la carte ci-dessus pour gérer ses planètes.</p>';return;}
  var l=PLS[SEL]||[];
  var out='';
  if(!l.length){out='<p class="pv">Aucune planète rattachée à ce système.</p>';}
  l.forEach(function(pl){
    out+='<div class="plrow">'
      +'<div class="plinfo"><b>✦ '+esc(pl.nom)+'</b><span>'+(pl.carte?'Carte : '+esc(pl.carte):'Pas de mappemonde')+'</span></div>'
      +'<button class="btn primary sm" data-act="poi" data-id="'+pl.id+'" type="button">⬥ Lieux</button>'
      +'<button class="btn amber sm" data-act="edit" data-id="'+pl.id+'" type="button">✎ Modifier</button>'
      +'<button class="btn danger sm" data-act="del" data-id="'+pl.id+'" type="button">✕</button>'
      +'</div>';
  });
  out+='<div class="cta-row" style="justify-content:flex-start;margin-top:10px"><button class="btn ghost sm" id="p-new" type="button">✚ Nouvelle planète</button></div>';
  box.innerHTML=out;
  var nb=$('p-new');if(nb){nb.addEventListener('click',function(){plaFormOpen(null);});}
  Array.prototype.forEach.call(box.querySelectorAll('.plrow button'),function(b){
    b.addEventListener('click',function(){
      var act=b.getAttribute('data-act'),pid=parseInt(b.getAttribute('data-id'),10);
      var pl=null;(PLS[SEL]||[]).forEach(function(p){if(p.id===pid){pl=p;}});
      if(!pl){return;}
      if(act==='poi'){poiOpen(pl);}
      else if(act==='edit'){plaFormOpen(pl);}
      else if(act==='del'){delPlanete(pl);}
    });
  });
}
function plaFormOpen(pl){
  $('p-form').style.display='';
  if(pl){$('p-title').textContent='✦ Modifier : '+pl.nom;$('p-id').value=pl.id;$('p-nom').value=pl.nom||'';$('p-desc').value=pl.description||'';$('p-image').value=pl.image||'';$('p-carte').value=pl.carte||'';$('p-type').value=pmType(pl);}
  else{$('p-title').textContent='✦ Nouvelle planète';$('p-id').value='';['p-nom','p-desc','p-image','p-carte'].forEach(function(i){$(i).value='';});}$('p-type').value='Tellurique';
  msg('p-msg','');
}
$('p-cancel').addEventListener('click',function(){$('p-form').style.display='none';});
$('p-save').addEventListener('click',function(){
  if(!MJMODE){msg('p-msg','Ouvre d’abord la console avec ta clé MJ.','err');return;}
  var nom=$('p-nom').value.trim();
  if(!nom){msg('p-msg','Donne un nom à la planète.','err');return;}
  if(!SEL){msg('p-msg','Sélectionne d’abord un système sur la carte.','err');return;}
  var pdata={type:$('p-type').value||'Tellurique'};
  var pidv=$('p-id').value;
  if(pidv){(PLS[SEL]||[]).forEach(function(q){if(String(q.id)===String(pidv)&&q.data){for(var k in q.data){if(k!=='type'){pdata[k]=q.data[k];}}}});}
  var body={galaxie_id:SEL,nom:nom,description:$('p-desc').value.trim(),image:$('p-image').value.trim(),carte:$('p-carte').value.trim(),data:pdata};
  var id=$('p-id').value;
  var req=id?fetch(SB+'planetes?id=eq.'+id,{method:'PATCH',headers:HM(),body:JSON.stringify(body)})
            :fetch(SB+'planetes',{method:'POST',headers:HM(),body:JSON.stringify(body)});
  req.then(function(r){if(!r.ok){throw new Error('HTTP '+r.status);}}).then(function(){
    msg('p-msg','Planète enregistrée.','ok');$('p-form').style.display='none';loadPlanetes(SEL);
  }).catch(function(){msg('p-msg','Enregistrement impossible — vérifie ta clé.','err');});
});
function delPlanete(pl){
  if(!MJMODE){return;}
  if(!window.confirm('Supprimer « '+pl.nom+' » et tous ses points d’intérêt ?')){return;}
  fetch(SB+'planetes_poi?planete_id=eq.'+pl.id,{method:'DELETE',headers:HM()}).then(function(){
    return fetch(SB+'planetes?id=eq.'+pl.id,{method:'DELETE',headers:HM()});
  }).then(function(r){
    if(!r.ok){throw new Error('HTTP '+r.status);}
    msg('p-msg','Planète supprimée.','ok');
    if(PSELPLA&&PSELPLA.id===pl.id){plaCleanup();}
    loadPlanetes(SEL);
  }).catch(function(){msg('p-msg','Suppression impossible — vérifie ta clé.','err');});
}
function poiOpen(pl){
  PSELPLA=pl;PSEL=pl.id;
  $('poi-card').style.display='';
  $('poi-title').textContent='⬥ Lieux — '+pl.nom;
  $('poi-note').textContent="Le globe tourne par crans de méridien (◀ ▶). « Placer sur le globe » arme le pointeur : le clic s'accroche à la terre ferme et lit les coordonnées méridien + latitude.";
  PMG.inst=null;PMG.sel=null;PMG.armed=false;PMG.plid=pl.id;
  $('poi-form').style.display='none';
  loadPois();
}
function loadPois(){
  fetchJ(SB+'planetes_poi?select=*&planete_id=eq.'+PSEL+'&order=id.asc',{headers:HM()}).then(function(l){
    POIS=l||[];if(PMG.inst&&PMG.plid===PSEL){pmPoiRender();renderPoiList();}else{renderPoiMap();renderPoiList();}
  }).catch(function(){POIS=[];if(PMG.inst&&PMG.plid===PSEL){pmPoiRender();renderPoiList();}else{renderPoiMap();renderPoiList();}});
}
function pmSvg(seed){
  var r=prng(seed*7919+13),s='<svg viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Surface">';
  s+='<defs><radialGradient id="pmg'+seed+'" cx="42%" cy="30%"><stop offset="0%" stop-color="#18261d"/><stop offset="100%" stop-color="#0a120f"/></radialGradient></defs>';
  s+='<rect width="1000" height="700" fill="url(#pmg'+seed+')"/>';
  for(var i=0;i<26;i++){var cx=(r()*1000).toFixed(0),cy=(r()*700).toFixed(0),rr=(10+r()*52).toFixed(0);
    s+='<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rr+'" ry="'+(rr*0.62).toFixed(0)+'" fill="none" stroke="#22382c" stroke-opacity="0.65"/>';}
  for(var j=1;j<4;j++){s+='<line x1="0" y1="'+(j*175)+'" x2="1000" y2="'+(j*175)+'" stroke="#2ee6c9" stroke-opacity="0.05"/>';}
  for(var k=1;k<5;k++){s+='<line x1="'+(k*200)+'" y1="0" x2="'+(k*200)+'" y2="700" stroke="#2ee6c9" stroke-opacity="0.04"/>';}
  return s+'</svg>';
}
var PMG={inst:null,plid:0,raf:null,armed:false,sel:null};
var PMTYPES=['Tellurique','Désertique','Océanique','Toxique','Géante gazeuse','Glaciaire','Volcanique','Stérile'];
function pmType(pl){var t=(pl&&pl.data&&pl.data.type)||'Tellurique';return PMTYPES.indexOf(t)>=0?t:'Tellurique';}
function pmCoordStr(p){
  var w=p.data&&p.data.world;
  if(w&&PMG.inst&&PMG.inst.geo){var g=PMG.inst.geo;var m=g.meridianOf(w.X)+1,la=g.latOf(w.y);return "méridien "+m+" / "+g.N+" · "+Math.abs(Math.round(la))+"° "+(la>=0?"N":"S");}
  return w?"coordonnées monde ("+Math.round(w.X)+" ; "+Math.round(w.y)+")":"ancien format ("+p.x+" ; "+p.y+")";
}
function pmCoordRefresh(){
  var el=$('poi-coord');if(!el){return;}
  if(!PMG.sel){el.textContent="— Non définie : « Placer sur le globe » puis touche le globe —";return;}
  if(PMG.inst&&PMG.inst.geo){var g=PMG.inst.geo;var m=g.meridianOf(PMG.sel.X)+1,la=g.latOf(PMG.sel.y);el.textContent="✓ Méridien "+m+" / "+g.N+" · "+Math.abs(Math.round(la))+"° "+(la>=0?"N":"S")+(g.isLand(PMG.sel.X,PMG.sel.y)?" · terre ferme":" · océan");}
  else{el.textContent="✓ Position monde ("+Math.round(PMG.sel.X)+" ; "+Math.round(PMG.sel.y)+")";}
}
function pmPoiRender(){
  var g2=$('pm-pois');if(!g2||!PMG.inst||!PMG.inst.geo){return;}
  var gg=PMG.inst.geo,h2='';
  POIS.forEach(function(p){
    var w=p.data&&p.data.world;if(!w){return;}
    var u=gg.offsetAt(w.X,PMG.inst.idx);if(u==null){return;}
    var sx=200+u/gg.W*600,sy=200+w.y/gg.H*600;
    var op=Math.max(0,Math.min(1,Math.min(u,gg.W-u)/34));
    var hw=gg.W/2,hh=gg.H/2,lx=(u-hw)/hw,ly=(w.y-hh)/hh;
    var limb=1-Math.sqrt(lx*lx+ly*ly);
    if(limb<=0.04){return;}
    op=Math.min(op,Math.min(1,limb/0.16));
    if(op<=0.02){return;}
    h2+='<circle cx="'+sx.toFixed(0)+'" cy="'+sy.toFixed(0)+'" r="9" fill="#f0b24a" fill-opacity="'+(0.9*op).toFixed(2)+'"/><circle cx="'+sx.toFixed(0)+'" cy="'+sy.toFixed(0)+'" r="15" fill="none" stroke="#f0b24a" stroke-opacity="'+(0.5*op).toFixed(2)+'"/>';
  });
  g2.innerHTML=h2;
}
function renderPoiMap(){
  var box=$('p-map');if(!box||!PSELPLA){return;}
  var pl=PSELPLA,ty=pmType(pl);
  PMG.plid=pl.id;PMG.armed=false;
  var h='<div class="pmg">';
  h+='<svg id="pm-svg" viewBox="0 0 1000 1000">';
  h+='<defs><clipPath id="pmx-c"><circle cx="500" cy="500" r="300"/></clipPath>'
   +'<radialGradient id="pmx-g" cx="38%" cy="32%"><stop offset="0%" stop-color="#18261d"/><stop offset="100%" stop-color="#0a120f"/></radialGradient>'
   +'<radialGradient id="pmx-s"><stop offset="70%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,.45)"/></radialGradient></defs>';
  h+='<circle cx="500" cy="500" r="300" fill="url(#pmx-g)"/>';
  h+='<g id="pmx-t" clip-path="url(#pmx-c)"><image id="pm-img" x="200" y="200" width="600" height="600" preserveAspectRatio="none"/></g>';
  h+='<g clip-path="url(#pmx-c)" stroke="#f0b24a" stroke-opacity=".12" fill="none">';
  for(var c2=1;c2<6;c2++){h+='<line x1="'+(200+c2*100)+'" y1="200" x2="'+(200+c2*100)+'" y2="800"/><line x1="200" y1="'+(200+c2*100)+'" x2="800" y2="'+(200+c2*100)+'"/>';}
  h+='</g>';
  h+='<circle cx="500" cy="500" r="300" fill="url(#pmx-s)"/><circle cx="500" cy="500" r="300" fill="none" stroke="#f0b24a" stroke-opacity=".4"/>';
  h+='<g id="pm-pois"></g>';
  h+='<g id="pm-cross" style="display:none"><circle r="11" fill="none" stroke="#f0b24a" stroke-width="2"/><circle r="3" fill="#f0b24a"/></g>';
  h+='</svg>';
  h+='<div id="pm-rot" class="pmrotc"><button type="button" id="pm-prev" class="btn ghost sm">◀</button><span id="pm-mlab" class="pmmlab">MÉRIDIEN — / 16</span><button type="button" id="pm-next" class="btn ghost sm">▶</button></div>';
  h+='<div id="pm-read" class="pmread">Initialisation du globe…</div>';
  h+='<div id="pm-load" class="pmload"><div class="pmring"></div><div id="pm-ltxt">GENÈSE DU GLOBE…</div></div>';
  h+='</div>';
  box.innerHTML=h;
  var inst=null;
  if(window.PER&&PER.supported(ty)){try{inst=PER.create(ty,pl.id*97+13,320,16);}catch(e){inst=null;}}
  PMG.inst=inst;
  var im=$('pm-img');
  var cv=document.createElement('canvas');cv.width=320;cv.height=320;
  var cx=cv.getContext('2d');
  var refresh=function(){if(!inst){return;}inst.attach(cx);im.setAttribute('href',cv.toDataURL());pmPoiRender();pmCoordRefresh();};
  window._pmR=refresh;
  var crank=function(d){if(!inst){return;}inst.step(d);refresh();var lb=$('pm-mlab');if(lb){lb.textContent='MÉRIDIEN '+((inst.idx%inst.count)+1)+' / '+inst.count;}};
  $('pm-prev').addEventListener('click',function(){crank(1);});
  $('pm-next').addEventListener('click',function(){crank(-1);});
  if(!inst){
    var ld0=$('pm-load');if(ld0){ld0.style.display='none';}
    var rd0=$('pm-read');if(rd0){rd0.textContent="Globe indisponible (moteur non chargé).";}
    return;
  }
  inst.attach(cx);
  if(PMG.raf){cancelAnimationFrame(PMG.raf);}
  var poll=function(){
    if(!PSELPLA||PSELPLA.id!==PMG.plid){PMG.raf=null;return;}
    var r=inst.tick(50);
    var lt=$('pm-ltxt');if(lt){lt.textContent='GENÈSE DU GLOBE… '+Math.round(r.pct)+'%';}
    if(r.ready){
      refresh();
      var ld=$('pm-load');if(ld){ld.style.display='none';}
      var rd=$('pm-read');if(rd){rd.textContent='Globe prêt — passe la souris pour lire les coordonnées.';}
      pmCoordRefresh();
      return;
    }
    PMG.raf=requestAnimationFrame(poll);
  };
  PMG.raf=requestAnimationFrame(poll);
  var sv=$('pm-svg');
  var wpt=function(ev){var r2=sv.getBoundingClientRect();return {sx:(ev.clientX-r2.left)/r2.width*1000,sy:(ev.clientY-r2.top)/r2.height*1000};};
  var unproj=function(sx,sy){
    var g=inst.geo;if(!g){return null;}
    var u=(sx-200)/600*g.W,y=(sy-200)/600*g.H;
    if(u<0||u>g.W||y<0||y>g.H){return null;}
    var hw=g.W/2,hh=g.H/2,lx=(u-hw)/hw,ly=(y-hh)/hh;
    if(lx*lx+ly*ly>1){return null;}
    var best=null,bd=1e9;
    for(var X=0;X<g.GW;X++){var o=g.offsetAt(X,inst.idx);if(o==null){continue;}var d=Math.abs(o-u);if(d<bd){bd=d;best=X;}}
    return best==null?null:{X:best,y:Math.max(0,Math.min(g.H-1,Math.round(y)))};
  };
  sv.addEventListener('mousemove',function(ev){
    if(!inst||!inst.geo){return;}
    var cr=$('pm-cross'),rd=$('pm-read');if(!cr||!rd){return;}
    var p2=wpt(ev);var c=unproj(p2.sx,p2.sy);
    if(!c){cr.style.display='none';rd.textContent='— Hors du globe —';return;}
    var land=inst.geo.isLand(c.X,c.y);
    var m=inst.geo.meridianOf(c.X)+1,la=inst.geo.latOf(c.y);
    rd.textContent='Méridien '+m+' / '+inst.geo.N+' · '+Math.abs(Math.round(la))+'° '+(la>=0?'N':'S')+' · '+(land?'terre ferme':'océan')+(PMG.armed?' — clique pour poser le repère':'');
    cr.style.display='';cr.setAttribute('transform','translate('+p2.sx.toFixed(1)+' '+p2.sy.toFixed(1)+')');
  });
  sv.addEventListener('mouseleave',function(){var cr=$('pm-cross');if(cr){cr.style.display='none';}var rd=$('pm-read');if(rd){rd.textContent='Globe prêt.';}});
  sv.addEventListener('click',function(ev){
    if(!PMG.armed||!inst||!inst.geo){return;}
    var p2=wpt(ev);var c=unproj(p2.sx,p2.sy);
    if(!c){msg('poi-msg','Touche la face visible du globe.','err');return;}
    var X=c.X,y=c.y;
    if(inst.geo.snapLand){
      var s=inst.geo.snapLand(c.X,c.y);
      if(s&&s.X!=null&&inst.geo.isLand(s.X,s.y)){X=s.X;y=s.y;}
    }
    PMG.armed=false;
    $('poi-place').textContent='Placer sur le globe';
    $('poi-x').value=Math.round(X);$('poi-y').value=Math.round(y);
    PMG.sel={X:X,y:y};
    pmCoordRefresh();
    var m=inst.geo.meridianOf(X)+1,la=inst.geo.latOf(y);
    msg('poi-msg','Position : méridien '+m+' / '+inst.geo.N+' · '+Math.abs(Math.round(la))+'° '+(la>=0?'N':'S')+(inst.geo.isLand(X,y)?' (terre ferme).':' (océan).'),'ok');
  });
}
function renderPoiList(){
  var box=$('poi-list');
  var out='';
  if(!POIS.length){out='<p class="pv">Aucun point d’intérêt. Ajoute le premier !</p>';}
  POIS.forEach(function(p){
    out+='<div class="plrow"><div class="plinfo"><b>⬥ '+esc(p.nom)+'</b><span>'+esc(pmCoordStr(p))+(p.image?' — '+esc(p.image):'')+'</span></div>'
      +'<button class="btn amber sm" data-id="'+p.id+'" data-act="edit" type="button">✎ Modifier</button>'
      +'<button class="btn danger sm" data-id="'+p.id+'" data-act="del" type="button">✕</button></div>';
  });
  out+='<div class="cta-row" style="justify-content:flex-start;margin-top:10px"><button class="btn ghost sm" id="poi-new" type="button">✚ Nouveau point</button></div>';
  box.innerHTML=out;
  var nb=$('poi-new');if(nb){nb.addEventListener('click',function(){poiFormOpen(null);});}
  Array.prototype.forEach.call(box.querySelectorAll('.plrow button'),function(b){
    b.addEventListener('click',function(){
      var id=parseInt(b.getAttribute('data-id'),10);var p=null;POIS.forEach(function(q){if(q.id===id){p=q;}});
      if(!p){return;}
      if(b.getAttribute('data-act')==='edit'){poiFormOpen(p);}else{delPoi(p);}
    });
  });
}
function poiFormOpen(p){
  $('poi-form').style.display='';
  if(p){$('poi-id').value=p.id;$('poi-nom').value=p.nom||'';$('poi-desc').value=p.description||'';$('poi-image').value=p.image||'';$('poi-del').style.display='';
    PMG.sel=(p.data&&p.data.world)?{X:p.data.world.X,y:p.data.world.y}:null;}
  else{$('poi-id').value='';['poi-nom','poi-desc','poi-image'].forEach(function(i){$(i).value='';});$('poi-del').style.display='none';PMG.sel=null;}
  pmCoordRefresh();
  msg('poi-msg','');
}
$('poi-cancel').addEventListener('click',function(){$('poi-form').style.display='none';});
$('poi-place').addEventListener('click',function(){
  if(!$('poi-form')||$('poi-form').style.display==='none'){msg('poi-msg','Ouvre d’abord un point (nouveau ou modification).','err');return;}
  if(!PMG.inst){msg('poi-msg','Globe pas encore prêt — patiente un instant.','err');return;}
  PMG.armed=true;this.textContent='Clique sur le globe…';
  msg('poi-msg','Mode placement : touche le globe à l’endroit voulu (accroche à la terre ferme).','');
});
$('poi-del').addEventListener('click',function(){
  var id=$('poi-id').value;if(!id){return;}
  if(!window.confirm('Supprimer ce point d’intérêt ?')){return;}
  fetch(SB+'planetes_poi?id=eq.'+id,{method:'DELETE',headers:HM()}).then(function(r){
    if(!r.ok){throw new Error('HTTP '+r.status);}
    $('poi-form').style.display='none';msg('poi-msg','Point supprimé.','ok');loadPois();
  }).catch(function(){msg('poi-msg','Suppression impossible — vérifie ta clé.','err');});
});
$('poi-save').addEventListener('click',function(){
  if(!MJMODE){msg('poi-msg','Ouvre d’abord la console avec ta clé MJ.','err');return;}
  var nom=$('poi-nom').value.trim();
  if(!nom){msg('poi-msg','Donne un nom au lieu.','err');return;}
  if(!PSEL){msg('poi-msg','Aucune planète sélectionnée.','err');return;}
  var wd=null;
  if(PMG.sel){wd={world:{X:Math.round(PMG.sel.X),y:Math.round(PMG.sel.y)}};}
  else{var eid=$('poi-id').value;POIS.forEach(function(q){if(String(q.id)===String(eid)&&q.data&&q.data.world){wd=q.data;}});}
  var body={planete_id:PSEL,nom:nom,description:$('poi-desc').value.trim(),image:$('poi-image').value.trim(),x:parseInt($('poi-x').value,10)||0,y:parseInt($('poi-y').value,10)||0,data:wd};
  var id=$('poi-id').value;
  var req=id?fetch(SB+'planetes_poi?id=eq.'+id,{method:'PATCH',headers:HM(),body:JSON.stringify(body)})
            :fetch(SB+'planetes_poi',{method:'POST',headers:HM(),body:JSON.stringify(body)});
  req.then(function(r){if(!r.ok){throw new Error('HTTP '+r.status);}}).then(function(){
    PMG.sel=null;msg('poi-msg','Point enregistré.','ok');$('poi-form').style.display='none';loadPois();
  }).catch(function(){msg('poi-msg','Enregistrement impossible — vérifie ta clé.','err');});
});
