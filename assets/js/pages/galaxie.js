
var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var SYS=[],SEL=null;
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function H(extra){var h={'apikey':SBK,'Authorization':'Bearer '+SBK,'Content-Type':'application/json'};if(extra){for(var k in extra){h[k]=extra[k];}}return h;}
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
    svg+='</g>';
  });
  svg+='</svg>';
  $('g-map').innerHTML=svg;
  Array.prototype.forEach.call(document.querySelectorAll('.sysg'),function(el){
    el.addEventListener('click',function(ev){ev.stopPropagation();select(parseInt(el.getAttribute('data-id'),10));});
  });
  applySearch();
}
function catLabel(c){return c==='vaisseau'?'Vaisseau-tombe':c==='nebuleuse'?'Nébuleuse':c==='inconnu'?'Inexploré':'Système';}
var PLS={},CURPLA=null,POIS=[],CURPOI=null;
function bindImgs(root){Array.prototype.forEach.call((root||document).querySelectorAll('img'),function(im){im.addEventListener('error',function(){if(im.parentNode){im.parentNode.removeChild(im);}});});}
function showGalaxy(){CURPLA=null;CURPOI=null;$('g-crumb').style.display='none';$('g-searchbox').style.display='';$('g-legend').style.display='';$('g-map').style.display='';$('p-map').style.display='none';renderPanel();}
function crumbRender(){
  var g=null;SYS.forEach(function(s){if(s.id===SEL){g=s;}});
  var out='<button type="button" id="crumb-back">← Galaxie</button>';
  if(g){out+='<span class="sep">·</span><span>'+esc(g.nom)+'</span>';}
  if(CURPOI){out+='<span class="sep">·</span><span>'+esc(CURPLA.nom)+'</span><span class="sep">·</span><span class="cur">'+esc(CURPOI.nom)+'</span>';}
  else if(CURPLA){out+='<span class="sep">·</span><span class="cur">'+esc(CURPLA.nom)+'</span>';}
  $('g-crumb').style.display='flex';
  $('g-crumb').innerHTML=out;
  $('crumb-back').addEventListener('click',showGalaxy);
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
function select(id){SEL=id;if(!PLS[id]){PLS[id]=[];}loadPlanetes(id);renderPanel();}
function loadPlanetes(id){
  fetchJ(SB+'planetes?select=*&galaxie_id=eq.'+id+'&order=id.asc').then(function(l){PLS[id]=l||[];if(SEL===id&&!CURPLA){renderPanel();}}).catch(function(){});
}
function explorePlanet(pid){
  var pl=null;(PLS[SEL]||[]).forEach(function(p){if(p.id===pid){pl=p;}});
  if(!pl){return;}
  CURPLA=pl;CURPOI=null;
  fetchJ(SB+'planetes_poi?select=*&planete_id=eq.'+pid+'&order=id.asc').then(function(l){POIS=l||[];renderPlanetView();renderPanel();}).catch(function(){POIS=[];renderPlanetView();renderPanel();});
}
function renderPlanetView(){
  $('g-searchbox').style.display='none';$('g-legend').style.display='none';$('g-map').style.display='none';
  var pm=$('p-map');pm.style.display=CURPOI?'none':'';
  crumbRender();
  var h='<div class="pm">'+(CURPLA.carte?'<img class="pmimg" src="'+esc(CURPLA.carte)+'" alt="Mappemonde">':'')+pmSvg(CURPLA.id);
  POIS.forEach(function(p){
    var lx=Math.max(6,Math.min(94,p.x/10)),ly=Math.max(6,Math.min(93,p.y/7));
    h+='<div class="poid'+(CURPOI&&CURPOI.id===p.id?' on':'')+'" data-id="'+p.id+'" style="left:'+lx+'%;top:'+ly+'%" title="'+esc(p.nom)+'"></div><div class="poidlab" style="left:'+lx+'%;top:'+ly+'%">'+esc(p.nom)+'</div>';
  });
  h+='</div>';
  pm.innerHTML=h;bindImgs(pm);
  Array.prototype.forEach.call(pm.querySelectorAll('.poid'),function(el){
    el.addEventListener('click',function(ev){ev.stopPropagation();
      var id=parseInt(el.getAttribute('data-id'),10);
      POIS.forEach(function(p){if(p.id===id){CURPOI=p;}});
      renderPlanetView();renderPanel();
    });
  });
}
function renderPanel(){
  var el=$('g-panel');
  if(CURPLA){
    var out='<h3 style="margin:.1em 0 .3em">🪐 '+esc(CURPLA.nom)+'</h3>';
    if(CURPOI){
      out+='<div class="pl">📍 '+esc(CURPOI.nom)+'</div>';
      if(CURPOI.image){out+='<img class="poiimg" src="'+esc(CURPOI.image)+'" alt="">';}
      out+='<p class="pv" style="margin-top:10px">'+esc(CURPOI.description||'')+'</p>';
      out+='<div class="cta-row" style="justify-content:flex-start;margin-top:8px"><button class="btn ghost sm" id="poi-back" type="button">← Autres lieux</button></div>';
    }else{
      out+='<p class="pv" style="margin-top:10px">'+esc(CURPLA.description||'')+'</p>';
      out+='<p class="pv">Clique sur un marqueur de la mappemonde pour découvrir un lieu.</p>';
    }
    out+='<div class="cta-row" style="justify-content:flex-start;margin-top:10px"><button class="btn ghost sm" id="pl-back" type="button">← Carte de la galaxie</button></div>';
    el.innerHTML=out;bindImgs(el);
    var pb=$('poi-back');if(pb){pb.addEventListener('click',function(){CURPOI=null;renderPlanetView();renderPanel();});}
    var bk=$('pl-back');if(bk){bk.addEventListener('click',showGalaxy);}
    return;
  }
  if(!SEL){el.innerHTML='<p style="color:var(--muted);font-size:.95rem">Clique sur un système de la carte pour afficher sa fiche : description, planètes, lieux remarquables et créatures recensées.</p>';return;}
  var g=null;SYS.forEach(function(s){if(s.id===SEL){g=s;}});
  if(!g){SEL=null;renderPanel();return;}
  var d=g.data||{};
  var out='<h3 style="margin:.1em 0 .3em">'+esc(g.nom)+'</h3><span class="badge'+(g.categorie==='vaisseau'?' amber':'')+'">'+esc(catLabel(g.categorie))+'</span>';
  if(g.description){out+='<p class="pv" style="margin-top:10px">'+esc(g.description)+'</p>';}
  var pls=PLS[SEL]||[];
  if(pls.length){
    out+='<div class="pl">Planètes</div>';
    pls.forEach(function(pl){
      out+='<div class="plrow">'+(pl.image?'<img class="plthumb" src="'+esc(pl.image)+'" alt="">':'')+'<div class="plinfo"><b>'+esc(pl.nom)+'</b>'+(pl.description?'<span>'+esc(pl.description)+'</span>':'')+'</div><button class="btn primary sm" data-pl="'+pl.id+'" type="button">Explorer</button></div>';
    });
  }
  (d.planetes||[]).forEach(function(pl){
    out+='<div class="pl">🪐 '+esc(pl.nom)+'</div>';
    if(pl.infos){out+='<p class="pv">'+esc(pl.infos)+'</p>';}
    (pl.lieux||[]).forEach(function(l){out+='<div class="lieu"><b>'+esc(l.nom)+'</b>'+(l.infos?' — '+esc(l.infos):'')+'</div>';});
  });
  (d.lieux||[]).forEach(function(l){out+='<div class="lieu"><b>'+esc(l.nom)+'</b>'+(l.infos?' — '+esc(l.infos):'')+'</div>';});
  if((d.creatures||[]).length){
    out+='<div class="pl">Créatures recensées</div><div class="chips">';
    d.creatures.forEach(function(c){out+='<a href="/bestiaire.html?c='+encodeURIComponent(c)+'">'+esc(c)+'</a>';});
    out+='</div>';
  }
  el.innerHTML=out;bindImgs(el);
  Array.prototype.forEach.call(el.querySelectorAll('button[data-pl]'),function(b){
    b.addEventListener('click',function(){explorePlanet(parseInt(b.getAttribute('data-pl'),10));});
  });
}
function loadGalaxie(){
  fetchJ(SB+'galaxie?select=*&order=nom.asc').then(function(list){
    SYS=list||[];$('g-err').style.display='none';renderMap();renderPanel();
  }).catch(function(){
    $('g-err').style.display='';$('g-err').innerHTML='<strong>Carte inaccessible.</strong> Vérifie ta connexion internet — la carte vit dans la base partagée du groupe.';
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
$('g-search').addEventListener('input',applySearch);
$('legend-btn').addEventListener('click',function(){var w=$('g-legend');var on=w.classList.toggle('open');this.setAttribute('aria-expanded',on?'true':'false');});
loadGalaxie();
