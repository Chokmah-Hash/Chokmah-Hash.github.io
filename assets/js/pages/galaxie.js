
var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var SYS=[],SECRETS={},COMPTES={},MJMODE=false,MJKEY='',SEL=null,PLACING=false,POSTIMER=null,POSDATA=[];
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function msg(id,t,cls){var m=$(id);if(m){m.textContent=t;m.className='gmsg '+(cls||'');}}
function H(extra){var h={'apikey':SBK,'Authorization':'Bearer '+SBK,'Content-Type':'application/json'};if(extra){for(var k in extra){h[k]=extra[k];}}return h;}
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
    svg+='<g class="sysg" data-id="'+g.id+'" id="sys-'+g.id+'">'+shape+'<text x="'+lb[0]+'" y="'+lb[1]+'" text-anchor="middle" fill="#e8f5f1" opacity="'+op+'" font-size="13" font-family="Rajdhani" font-weight="600" style="pointer-events:none">'+esc(lbl)+'</text>';
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
    $('g-place').textContent='Ì†ΩÌ≥ç Placer sur la carte';
    msg('g-msg','Position : '+px+', '+py+' ‚Äî clique sur Enregistrer.','ok');
  });
  applySearch();
}
function catLabel(c){return c==='vaisseau'?'Vaisseau-tombe':c==='nebuleuse'?'N√©buleuse':c==='inconnu'?'Inexplor√©':'Syst√®me';}
function select(id){SEL=id;renderPanel();}
function renderPanel(){
  var el=$('g-panel');
  if(!SEL){el.innerHTML='<p style="color:var(--muted);font-size:.95rem">Clique sur un syst√®me de la carte pour afficher sa fiche : description, plan√®tes, lieux remarquables et cr√©atures recens√©es.</p>';return;}
  var g=null;SYS.forEach(function(s){if(s.id===SEL){g=s;}});
  if(!g){SEL=null;renderPanel();return;}
  var d=g.data||{};
  var out='<h3 style="margin:.1em 0 .3em">'+esc(g.nom)+'</h3><span class="badge'+(g.categorie==='vaisseau'?' amber':'')+'">'+esc(catLabel(g.categorie))+'</span>';
  if(g.description){out+='<p class="pv" style="margin-top:10px">'+esc(g.description)+'</p>';}
  (d.planetes||[]).forEach(function(pl){
    out+='<div class="pl">Ì†æÌ∫ê '+esc(pl.nom)+'</div>';
    if(pl.infos){out+='<p class="pv">'+esc(pl.infos)+'</p>';}
    (pl.lieux||[]).forEach(function(l){out+='<div class="lieu"><b>'+esc(l.nom)+'</b>'+(l.infos?' ‚Äî '+esc(l.infos):'')+'</div>';});
  });
  (d.lieux||[]).forEach(function(l){out+='<div class="lieu"><b>'+esc(l.nom)+'</b>'+(l.infos?' ‚Äî '+esc(l.infos):'')+'</div>';});
  if((d.creatures||[]).length){
    out+='<div class="pl">Cr√©atures recens√©es</div><div class="chips">';
    d.creatures.forEach(function(c){out+='<a href="/bestiaire.html">'+esc(c)+'</a>';});
    out+='</div>';
  }
  if(MJMODE){
    var sec=SECRETS[g.id];
    if(sec){out+='<div class="note-box amber" style="margin-top:12px"><strong>Ì†ΩÌ¥í V√©rit√©s cach√©es :</strong> '+esc(sec)+'</div>';}
    out+='<div class="cta-row" style="justify-content:flex-start;margin-top:10px">'
      +'<button class="btn amber sm" id="g-edit" type="button">‚úé Modifier ce syst√®me</button>'
      +'<button class="btn danger sm" id="g-del2" type="button">Ì†ΩÌ∑ë Supprimer</button></div>';
  }
  el.innerHTML=out;
  var be=$('g-edit');if(be){be.addEventListener('click',function(){fillForm(g);});}
  var bd=$('g-del2');if(bd){bd.addEventListener('click',function(){$('g-id').value=g.id;delSys();});}
}
function loadGalaxie(){
  fetchJ(SB+'galaxie?select=*&order=nom.asc').then(function(list){
    SYS=list||[];$('g-err').style.display='none';renderMap();renderPanel();
  }).catch(function(){
    $('g-err').style.display='';$('g-err').innerHTML='<strong>Carte inaccessible.</strong> V√©rifie ta connexion internet ‚Äî la carte vit dans la base partag√©e du groupe.';
  });
}
function applySearch(){
  var q=($('g-search').value||'').toLowerCase();
  Array.prototype.forEach.call(document.querySelectorAll('.sysg'),function(el){
    var id=parseInt(el.getAttribute('data-id'),10);
    var g=null;SYS.forEach(function(s){if(s.id===id){g=s;}});
    var hay=(g?(g.nom+' '+JSON.stringify(g.data||{})):'').toLowerCase();
    el.style.opacity=(!q||hay.indexOf(q)>=0)?'1':'0.12';
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
  if(!POSDATA.length){out='<tr><td colspan="4" style="color:var(--muted)">Aucun joueur ne s‚Äôest encore localis√©.</td></tr>';}
  POSDATA.forEach(function(p){
    var c=COMPTES[p.compte_id]||{};
    var gname='ailleurs';
    SYS.forEach(function(s){if(s.id===p.galaxie_id){gname=s.nom;}});
    var age=Math.floor((Date.now()-new Date(p.maj).getTime())/1000);
    var st=age<60?'<span class="on">‚óè En ligne</span>':'vu il y a '+Math.max(1,Math.floor(age/60))+' min';
    out+='<tr><td>'+esc(c.nom||c.login||'?')+'</td><td>'+esc(gname)+'</td><td>'+esc(p.lieu||'‚Äî')+'</td><td>'+st+'</td></tr>';
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
  if(!k){msg('mj-msg','Saisis ta cl√© MJ.','err');return;}
  MJKEY=k;
  loadSecrets().then(function(){return loadComptes();}).then(function(){
    return fetchJ(SB+'positions?select=compte_id,galaxie_id,lieu,maj&order=maj.desc',{headers:HM()});
  }).then(function(rows){
    MJMODE=true;POSDATA=rows||[];
    $('mj-tools').style.display='';
    $('mj-key').value='';
    msg('mj-msg','Console MJ ouverte. Les v√©rit√©s cach√©es et les positions sont visibles.','ok');
    renderMap();renderPanel();renderPosTable();
    if(POSTIMER){clearInterval(POSTIMER);}
    POSTIMER=setInterval(loadPositions,15000);
  }).catch(function(){
    MJKEY='';msg('mj-msg','Cl√© refus√©e ou base inaccessible.','err');
  });
});
function fillForm(g){
  $('g-form-title').textContent='Ì†ΩÌª†Ô∏è Modifier : '+g.nom;
  $('g-id').value=g.id;$('g-nom').value=g.nom;$('g-cat').value=g.categorie;
  $('g-x').value=g.x;$('g-y').value=g.y;$('g-desc').value=g.description||'';
  var d=g.data||{},pla=[],lieux=[],crea=[];
  (d.planetes||[]).forEach(function(p){pla.push(p.nom+(p.infos?' | '+p.infos:''));(p.lieux||[]).forEach(function(l){lieux.push(l.nom+(l.infos?' | '+l.infos:''));});});
  (d.lieux||[]).forEach(function(l){lieux.push(l.nom+(l.infos?' | '+l.infos:''));});
  (d.creatures||[]).forEach(function(c){crea.push(c);});
  $('g-pla').value=pla.join('\n');$('g-lieux').value=lieux.join('\n');$('g-crea').value=crea.join('\n');
  $('g-secret').value=SECRETS[g.id]||'';
  $('g-del').style.display='';
  msg('g-msg','Formulaire charg√©. Le bouton ¬´ Placer sur la carte ¬ª permet de repositionner par un clic.','');
}
function clearForm(){
  $('g-form-title').textContent='Ì†ΩÌª†Ô∏è Nouveau syst√®me';
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
$('g-new').addEventListener('click',function(){if(!MJMODE){msg('g-msg','Ouvre d‚Äôabord la console MJ avec ta cl√©.','err');return;}clearForm();});
$('g-place').addEventListener('click',function(){
  if(!MJMODE){msg('g-msg','Ouvre d‚Äôabord la console MJ avec ta cl√©.','err');return;}
  PLACING=true;this.textContent='Clique sur la carte‚Ä¶';
  msg('g-msg','Mode placement : touche la carte √† l‚Äôendroit voulu.','');
});
$('g-del').addEventListener('click',delSys);
function delSys(){
  if(!MJMODE){return;}
  var id=$('g-id').value;
  if(!id){msg('g-msg','Aucun syst√®me s√©lectionn√© dans le formulaire.','err');return;}
  if(!window.confirm('Supprimer d√©finitivement ce syst√®me de la carte ?')){return;}
  fetch(SB+'galaxie?id=eq.'+id,{method:'DELETE',headers:HM()}).then(function(r){
    if(!r.ok){throw new Error('HTTP '+r.status);}
    msg('g-msg','Syst√®me supprim√©.','ok');clearForm();loadGalaxie();
    if(MJMODE){loadSecrets();loadPositions();}
  }).catch(function(){msg('g-msg','Suppression impossible ‚Äî v√©rifie ta cl√©.','err');});
}
$('g-save').addEventListener('click',function(){
  if(!MJMODE){msg('g-msg','Ouvre d‚Äôabord la console MJ avec ta cl√©.','err');return;}
  var nom=$('g-nom').value.trim();
  if(!nom){msg('g-msg','Donne un nom au syst√®me.','err');return;}
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
    msg('g-msg','Syst√®me enregistr√© sur la carte.','ok');
    clearForm();loadGalaxie();
    if(MJMODE){loadSecrets().then(function(){renderPanel();});loadPositions();}
  }).catch(function(e){msg('g-msg','Enregistrement impossible ('+(e.message||'erreur')+') ‚Äî v√©rifie ta cl√©.','err');});
});
$('g-search').addEventListener('input',applySearch);
loadGalaxie();
