var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var SYS=[],SEL=null,ATLAS=[],AMODE=false,SKIN='necro',CURSEC=null,SECS=[];
var SKP={necro:{arm:'#2ee6c9',armop:'0.09',core:'#7cf5df',seg:'#2ee6c9',lbl:'#e8f5f1',monde:'#2ee6c9',forge:'#f0b24a',cap:'#ffffff',zone:'#93aca1',ano:'#c2454f',star:'#bfe9df'}};
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
  SECS=secItems();SECS.forEach(function(g){
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
    svg+='<g class="sysg" data-id="'+g.id+'"'+(g.proc?' data-si="'+g.si+'"':'')+' id="sys-'+g.id+'">'+shape+'<text x="'+lb[0]+'" y="'+lb[1]+'" text-anchor="middle" fill="#e8f5f1" opacity="'+op+'" font-size="13" font-family="Rajdhani" font-weight="600" style="pointer-events:none">'+esc(lbl)+'</text>';
    svg+='</g>';
  });
  svg+='</svg>';
  $('g-map').innerHTML=svg;
  applyVB();
  Array.prototype.forEach.call(document.querySelectorAll('.sysg'),function(el){
    el.addEventListener('click',function(ev){ev.stopPropagation();var psi=el.getAttribute('data-si');if(psi!==null&&psi!==''){openSys(parseInt(psi,10));}else{select(parseInt(el.getAttribute('data-id'),10));}});
  });
  if(!$('g-map')._tipw){
    $('g-map')._tipw=true;
    var tip2=$('star-tip'),wrap2=$('g-map').parentNode;
    $('g-map').addEventListener('mousemove',function(ev){
      if(DRG){tip2.style.display='none';return;}
      var t=(ev.target.closest?ev.target.closest('[data-si]'):ev.target);
      if(!t||!t.getAttribute||t.getAttribute('data-si')===null){tip2.style.display='none';return;}
      var si=parseInt(t.getAttribute('data-si'),10);
      var s=SFLD&&SFLD[si];
      if(!s){tip2.style.display='none';return;}
      var sg2=sysGen(si);
      tip2.innerHTML='<b>'+s.des+'</b> · classe '+s.cls+(sg2&&sg2.pl.length?'<br>'+sg2.pl.length+' planète'+(sg2.pl.length>1?'s':'')+' · <i>clic pour explorer</i>':'<br><i>aucune planète détectée</i>')+(s.note?'<br><i>'+s.note+'</i>':'');
      tip2.style.display='';
      var wr=wrap2.getBoundingClientRect();
      var l=ev.clientX-wr.left+14,tp2=ev.clientY-wr.top+14;
      tip2.style.left=(l+200>wr.width?l-215:l)+'px';
      tip2.style.top=(tp2+70>wr.height?tp2-85:tp2)+'px';
    });
    $('g-map').addEventListener('mouseleave',function(){tip2.style.display='none';});
  }
  applySearch();
}
function catLabel(c){return c==='vaisseau'?'Vaisseau-tombe':c==='nebuleuse'?'Nébuleuse':c==='inconnu'?'Inexploré':'Système';}
var PLS={},CURPLA=null,POIS=[],CURPOI=null;
function bindImgs(root){Array.prototype.forEach.call((root||document).querySelectorAll('img'),function(im){im.addEventListener('error',function(){if(im.parentNode){im.parentNode.removeChild(im);}});});}
function showGalaxy(){CURPLA=null;CURPOI=null;$('g-crumb').style.display='none';$('g-searchbox').style.display='';$('g-legend').style.display='';$('g-zoom').style.display='';$('g-map').style.display='';$('p-map').style.display='none';renderPanel();}
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
/* Globe procédural fourni par assets/js/moteur-planetaire.js (window.pmSvg). */
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
  $('g-searchbox').style.display='none';$('g-legend').style.display='none';$('g-map').style.display='none';$('g-zoom').style.display='none';
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
  if(!SEL){el.innerHTML='<p style="color:var(--muted);font-size:.95rem">'+(AMODE?'Clique sur un monde, une capitale ou une anomalie de la galaxie pour afficher sa fiche.':'Clique sur un système de la carte pour afficher sa fiche : description, planètes, lieux remarquables et créatures recensées.')+'</p>';return;}
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
/* ===== Atlas : vue galaxie 40K complete ===== */
function wdim(){return AMODE?1400:1000;}
function hdim(){return AMODE?900:700;}
var SFLD=null;
function segGrid(x,y){var c=Math.max(1,Math.min(20,Math.ceil(x/70)));var l=Math.max(1,Math.min(12,Math.ceil(y/75)));return 'C'+c+'-L'+l;}
function segSub(x,y){var ci=Math.max(1,Math.min(20,Math.ceil(x/70))),li=Math.max(1,Math.min(12,Math.ceil(y/75)));var fx=x-(ci-1)*70,fy=y-(li-1)*75;return fy<=37.5?(fx>35?'NE':'NO'):(fx>35?'SE':'SO');}
function segName(x,y){var dx=x-700,dy=y-450;if(dx*dx+dy*dy*1.6<36000){return 'Segmentum Solar';}if(x>=700){if(y>=450&&x<820){return 'Segmentum Tempestus';}return 'Segmentum Ultima';}if(y<430){return 'Segmentum Obscurus';}if(x<500){return 'Segmentum Pacificus';}return 'Segmentum Tempestus';}
function genStars(){
  if(SFLD){return SFLD;}
  var r=prng(987654),st=[],i,ang,dist;
  for(i=0;i<1400;i++){ang=r()*6.2832;dist=(r()+r())*80;st.push({x:700+Math.cos(ang)*dist,y:450+Math.sin(ang)*dist*1.0});}for(i=0;i<1000;i++){ang=r()*6.2832;dist=(r()+r())*170;st.push({x:700+Math.cos(ang)*dist,y:450+Math.sin(ang)*dist*0.3});}
  for(var a2=0;a2<2;a2++){
    for(i=0;i<3500;i++){var t=r();if(r()<t*t*0.5){continue;}var th0=t*(5.1+a2*0.55)+(a2*3.1416);var rad=130+t*(a2?350:375)+((t>0.55)?(t-0.55)*(a2?140:80):0);var spread=20+t*38;
      var sp2=spread*(0.35+r()*1.5);var jx=(r()+r()-1)*sp2,jy=(r()+r()-1)*sp2*0.8;
      if(r()<0.16){jx*=3.1;jy*=3.1;}
      st.push({x:700+Math.cos(th0)*rad*1.06+jx,y:450+Math.sin(th0)*rad+jy});}
  }
  for(i=0;i<1900;i++){ang=r()*6.2832;dist=Math.sqrt(r())*560+(r()+r()-1)*80;st.push({x:700+Math.cos(ang)*dist*1.06,y:450+Math.sin(ang)*dist*1.0});}
  for(i=0;i<700;i++){ang=r()*6.2832;dist=430+r()*230;st.push({x:700+Math.cos(ang)*dist,y:450+Math.sin(ang)*dist*1.0});}

  st.forEach(function(s){var dx=s.x-700,dy=s.y-450;s.x=700+dx*0.766+dy*0.643;s.y=450-dx*0.643+dy*0.766;s.y=450+(s.y-450)*0.66;s.x=Math.max(4,Math.min(1396,s.x));s.y=Math.max(4,Math.min(896,s.y));});
  for(i=0;i<320;i++){st.push({x:4+r()*1392,y:4+r()*892});}
  st.forEach(function(s){var mx=s.x%70,j1=((s.y*1.618)%1)<0.5,j2=0.5+((s.y*2.618)%1)*1.5;if(mx<4){if(j1){s.x+=4-mx+j2-0.5;}else{s.x-=mx+j2-0.5;}}else if(mx>66){if(j1){s.x-=mx-66+j2-0.5;}else{s.x+=(70-mx)+j2-0.5;}}var my=s.y%75,k1=((s.x*1.618)%1)<0.5,k2=0.5+((s.x*2.618)%1)*1.5;if(my<4){if(k1){s.y+=4-my+k2-0.5;}else{s.y-=my+k2-0.5;}}else if(my>71){if(k1){s.y-=my-71+k2-0.5;}else{s.y+=(75-my)+k2-0.5;}}s.x=Math.max(4,Math.min(1396,s.x));s.y=Math.max(4,Math.min(896,s.y));});
  var CL=[['O','#9db8ff',1],['B','#aac4ff',3],['A','#dfe8ff',6],['F','#fff4e0',8],['G','#ffe9b0',12],['K','#ffd28a',20],['M','#ffb46b',50]];
  var NOTES=['Monde agricole recensé','Ruines xenos non identifiées','Signal récurrent capté','Station perdue depuis trois siècles','Ceinture d’astéroïdes métallifère','Tempête électromagnétique en cours','Nébuleuse protostellaire','Navire à la dérive signalé','Balise d’alerte muette','Contrebandiers actifs dans le secteur','Monde-tombe héraldique','Anomalie gravitationnelle légère'];
  var gmap={};st=st.filter(function(sx){var gx=Math.floor(sx.x/3.2),gy=Math.floor(sx.y/3.2);for(var ddx=-1;ddx<=1;ddx++){for(var ddy=-1;ddy<=1;ddy++){if(gmap[(gx+ddx)+'_'+(gy+ddy)]){return false;}}}gmap[gx+'_'+gy]=1;return true;});
  st.forEach(function(s,idx){
    s.si=idx;
    var v=r()*100,acc=0,k,c=CL[6];
    for(k=0;k<7;k++){acc+=CL[k][2];if(v<acc){c=CL[k];break;}}
    s.cls=c[0];s.col=c[1];
    s.r=(0.55+r()*1.9).toFixed(2);
    s.fo=(0.35+r()*0.6).toFixed(2);
    s.des='HD-'+(1000+Math.floor(r()*89000));
    s.seg=segName(s.x,s.y);
    s.note=(r()<0.08)?NOTES[Math.floor(r()*NOTES.length)]:null;
  });
  SFLD=st;
  return st;
}
function aStars(){
  var st=genStars(),byc={},s='<g id="a-col" style="transition:opacity .25s ease-out">';
  st.forEach(function(sx){(byc[sx.cls]=byc[sx.cls]||[]).push(sx);});
  Object.keys(byc).forEach(function(k){
    s+='<g fill="'+byc[k][0].col+'">';
    byc[k].forEach(function(sx){
      s+='<circle cx="'+sx.x.toFixed(1)+'" cy="'+sx.y.toFixed(1)+'" r="'+sx.r+'" fill-opacity="'+sx.fo+'" data-si="'+sx.si+'"/>';
    });
    s+='</g>';
  });
  s+='</g>';
  s+='<g id="a-wov" fill="#ffffff" style="transition:opacity .25s ease-out">';
  st.forEach(function(sx){
    s+='<circle cx="'+sx.x.toFixed(1)+'" cy="'+sx.y.toFixed(1)+'" r="'+sx.r+'" fill-opacity="'+sx.fo+'" data-si="'+sx.si+'"/>';
  });
  return s+'</g>';
}
function aBg(){
  var st=genStars(),p=SKP[SKIN],s='<defs>',n=0;
  st.forEach(function(sx,i){
    if(i%240){return;}
    n++;
    s+='<radialGradient id="ab'+n+'"><stop offset="0%" stop-color="'+p.arm+'" stop-opacity=".12"/><stop offset="100%" stop-color="'+p.arm+'" stop-opacity="0"/></radialGradient>';
  });
  s+='</defs>';
  n=0;
  st.forEach(function(sx,i){
    if(i%240){return;}
    n++;
    var rr=55+(i%7)*11;
    s+='<circle cx="'+sx.x.toFixed(1)+'" cy="'+sx.y.toFixed(1)+'" r="'+rr+'" fill="url(#ab'+n+')"/>';
  });
  return s;
}
function gridSvg(){var s='<g id="a-grid" pointer-events="none" opacity="0.05">';for(var i=1;i<20;i++){s+='<line x1="'+(i*70)+'" y1="0" x2="'+(i*70)+'" y2="900" stroke="#0a120f" stroke-opacity=".85" stroke-width="3" vector-effect="non-scaling-stroke"/>';}for(var j=1;j<12;j++){s+='<line x1="0" y1="'+(j*75)+'" x2="1400" y2="'+(j*75)+'" stroke="#0a120f" stroke-opacity=".85" stroke-width="3" vector-effect="non-scaling-stroke"/>';}for(var i=1;i<20;i++){s+='<line x1="'+(i*70)+'" y1="0" x2="'+(i*70)+'" y2="900" stroke="#2ee6c9" stroke-opacity=".8" vector-effect="non-scaling-stroke"/>';}for(var j=1;j<12;j++){s+='<line x1="0" y1="'+(j*75)+'" x2="1400" y2="'+(j*75)+'" stroke="#2ee6c9" stroke-opacity=".8" vector-effect="non-scaling-stroke"/>';}s+='</g><g id="a-glab" pointer-events="none" opacity="0" font-family="Rajdhani" font-size="22" fill="#2ee6c9">';for(var i2=1;i2<=20;i2++){s+='<rect id="glCb'+i2+'" x="0" y="0" width="10" height="10" fill="#0a120f" fill-opacity=".82" stroke="#2ee6c9" stroke-opacity=".55" stroke-width="1" vector-effect="non-scaling-stroke"/><text id="glC'+i2+'" x="'+(i2*70-35)+'" y="28" text-anchor="middle">C'+i2+'</text>';}for(var j2=1;j2<=12;j2++){s+='<rect id="glLb'+j2+'" x="0" y="0" width="10" height="10" fill="#0a120f" fill-opacity=".82" stroke="#2ee6c9" stroke-opacity=".55" stroke-width="1" vector-effect="non-scaling-stroke"/><text id="gL'+j2+'" x="16" y="'+(j2*75-37.5)+'">L'+j2+'</text>';}s+='</g>';return s;}
function atlasSvg(){
  var p=SKP[SKIN];
  var svg='<svg id="a-svg" viewBox="0 0 1400 900" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Atlas de la galaxie">';
  svg+='<image href="https://res.cloudinary.com/bdxof4sp/image/upload/v1792104807/jdr/galaxie-fond-sharp.jpg" x="0" y="0" width="1400" height="900" preserveAspectRatio="xMidYMid slice" opacity="0.9"/>';
  svg+='<defs><radialGradient id="acore"><stop offset="0%" stop-color="'+p.core+'" stop-opacity=".5"/><stop offset="45%" stop-color="'+p.arm+'" stop-opacity=".14"/><stop offset="100%" stop-color="'+p.arm+'" stop-opacity="0"/></radialGradient></defs>'; svg+=aBg();
  svg+=aStars();svg+=gridSvg();
  svg+='</svg>';
  return svg;
}
function renderAtlas(){
  $('a-map').innerHTML=atlasSvg();
  applyVB();
  Array.prototype.forEach.call(document.querySelectorAll('.aloc'),function(el){
    el.addEventListener('click',function(ev){ev.stopPropagation();
      var id=parseInt(el.getAttribute('data-id'),10);var a=null;ATLAS.forEach(function(s){if(s.id===id){a=s;}});
      if(a){SEL=null;CURPLA=null;CURPOI=null;aPanel(a);}
    });
  });
  if(!$('a-map')._tipw){
    $('a-map')._tipw=true;
    var tip=$('star-tip'),wrap=$('a-map').parentNode;
    $('a-map').addEventListener('mousemove',function(ev){
      if(DRG){tip.style.display='none';var hb=$('sec-btn');if(hb){hb.style.display='none';}return;}
      var spx=svgPt(ev);if(spx){secHover(spx);var lsec=$('leg-sec');if(lsec){lsec.textContent='Secteur : '+segGrid(spx.sx,spx.sy)+' · '+segSub(spx.sx,spx.sy);}}
      var t=ev.target;
      if(!t||!t.getAttribute||t.getAttribute('data-si')===null){tip.style.display='none';return;}
      var si=parseInt(t.getAttribute('data-si'),10);
      var s=SFLD&&SFLD[si];
      if(!s){tip.style.display='none';return;}
      var sg2=sysGen(si);tip.innerHTML='<b>'+s.des+'</b> · classe '+s.cls+' · Secteur '+segGrid(s.x,s.y)+' · '+segSub(s.x,s.y)+(sg2&&sg2.pl.length?'<br>'+sg2.pl.length+' planète'+(sg2.pl.length>1?'s':'')+' · <i>clic pour explorer</i>':'')+(s.note?'<br><i>'+s.note+'</i>':'');
      tip.style.display='';
      var wr=wrap.getBoundingClientRect();
      var l=ev.clientX-wr.left+14,tp2=ev.clientY-wr.top+14;
      tip.style.left=(l+200>wr.width?l-215:l)+'px';
      tip.style.top=(tp2+70>wr.height?tp2-85:tp2)+'px';
    });
    $('a-map').parentNode.addEventListener('mouseleave',function(){tip.style.display='none';var hb=$('sec-btn');if(hb){hb.style.display='none';}});
    var sb=$('sec-btn');
    if(sb){sb.addEventListener('click',function(ev){ev.stopPropagation();if(HOVSEC){CURSEC=HOVSEC;HOVSEC=null;sb.style.display='none';setMode(false);}});}
    $('a-map').addEventListener('click',function(ev){
      if(DRG){return;}
      var t=ev.target;
      if(!t||!t.getAttribute||t.getAttribute('data-si')===null){return;}
      var si2=parseInt(t.getAttribute('data-si'),10);
      var sg3=sysGen(si2);
      if(sg3&&sg3.pl.length){$('star-tip').style.display='none';openSys(si2);}
    });
  }
  applySearch();
}
function aPanel(a){
  var names={monde:'Monde',forgemonde:'Monde-forge',capitale:'Capitale de segmentum',zone:'Zone',anomalie:'Anomalie warp'};
  var el=$('g-panel');
  var out='<h3 style="margin:.1em 0 .3em">'+esc(a.nom)+'</h3><span class="badge'+(a.categorie==='capitale'?' amber':'')+'">'+esc(names[a.categorie]||a.categorie)+'</span>';
  if(a.description){out+='<p class="pv" style="margin-top:10px">'+esc(a.description)+'</p>';}
  el.innerHTML=out;
}
function loadAtlas(){
  fetchJ(SB+'atlas?select=*&order=nom.asc').then(function(list){ATLAS=list||[];if(AMODE){renderAtlas();}}).catch(function(){});
}
var SYSG={},SYSV=null;
function sysGen(si){
  if(SYSG[si]!==undefined){return SYSG[si];}
  var s0=null,st=genStars(),q;
  for(q=0;q<st.length;q++){if(st[q].si===si){s0=st[q];break;}}
  if(!s0){SYSG[si]=null;return null;}
  var r=prng(si*2654435761+911);
  var res={star:s0,pl:[]};
  if(r()<0.52){
    var ROM=['I','II','III','IV','V','VI'];
    var T=[
      ['Tellurique','#b08968','#6e5138','Biosphère résiliente|Croûte tectonique jeune|Plaines balayées par les vents'],
      ['Océanique','#4f86c9','#28527d','Mer mondiale unique|Archipels volcaniques épars|Courants abyssaux violents'],
      ['Glaciaire','#cfe8f2','#7d9db0','Calotte glaciaire perpétuelle|Océan sous-glaciaire probable|Banquise éternellement figée'],
      ['Désertique','#e0b36a','#8f6f3f','Dunes ocres à perte de vue|Canyons cisaillés par les tempêtes|Ruines ensevelies sous le sable'],
      ['Volcanique','#c2454f','#7a2430','Chaînes de volcans actifs|Mers de lave incandescente|Cendres dans la haute atmosphère'],
      ['Géante gazeuse','#d9a86a','#9c7a4a','Bandes d’ammoniac en turbulence|Tempêtes multicentenaires|Cœur de métal liquide'],
      ['Stérile','#9aa3a8','#5c6467','Cratères d’impact séculaires|Aucune atmosphère notable|Silence radio absolu']
    ];
    var n=1+Math.floor(r()*6);
    for(var i=0;i<n;i++){
      var t=T[Math.floor(r()*T.length)];
      var orb=72+i*46+r()*18;
      res.pl.push({nom:s0.des+' '+ROM[i],type:t[0],c1:t[1],c2:t[2],dp:t[3].split('|')[Math.floor(r()*3)],rad:6+r()*7,orb:orb,a:r()*6.2832,om:(0.028+0.05*r())/Math.sqrt(orb/72),rings:(t[0]==='Géante gazeuse'&&r()<0.45),ua:(orb/60).toFixed(1),per:(1.4+i*1.9+r()*1.4).toFixed(1),sel:false});
    }
  }
  SYSG[si]=res;
  return res;
}
/* ===== Moteur planétaire : voir assets/js/moteur-planetaire.js (V3, 9 recettes).
   Les textures sont fournies par window.planetTex (PE.tex) chargé juste après. ===== */
function sysCss(){
  if($('sysv-css')){return;}
  var c=document.createElement('style');c.id='sysv-css';
  c.textContent='#sysv{position:absolute;inset:0;background:rgba(3,8,14,.97);border:1px solid #1d3a33;border-radius:10px;display:flex;flex-direction:column;z-index:40;overflow:hidden}'
  +'#sysv .svhead{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #1d3a33;font-size:1.05rem;flex:none}'
  +'#sysv .svhead b{color:#e8f5f1}'
  +'#sysv .svid{margin-left:10px;font-size:.72rem;color:#2ee6c9;text-transform:uppercase;letter-spacing:.08em}'
  +'#sysv .svbody{flex:1;display:flex;min-height:0}'
  +'#sysv .svmap{flex:1.6;min-width:0;padding:10px}'
  +'#sysv .svmap svg{width:100%;height:100%}'
  +'#sysv .svinfo{flex:1;max-width:360px;border-left:1px solid #1d3a33;padding:14px 16px;overflow:auto}'
  +'#sv-svg .plg{cursor:pointer}'
  +'#sv-svg .plc{cursor:pointer}'
  +'#sysv .sxpoi{cursor:pointer}'
  +'#sysv .svmap{position:relative}'
  +'#sysv .sxload{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;z-index:5;background:radial-gradient(circle at 50% 46%,#0a1524 0%,#060d18 70%,#04080f 100%);color:#7cf5df;letter-spacing:.14em;font-size:.8rem;text-align:center;transition:opacity .45s ease}'
  +'#sysv .sxload.sxout{opacity:0;pointer-events:none}'
  +'#sysv .sxbar{width:210px;height:5px;border-radius:3px;background:rgba(46,230,201,.14);overflow:hidden}'
  +'#sysv .sxbar-in{height:100%;width:0%;border-radius:3px;background:linear-gradient(90deg,#1a8f7d,#2ee6c9);box-shadow:0 0 8px rgba(46,230,201,.45);transition:width .25s ease}'
  +'@keyframes sxspin{to{transform:rotate(360deg)}}'
  +'#sysv .sxring{width:46px;height:46px;border:2px solid rgba(46,230,201,.18);border-top-color:#2ee6c9;border-radius:50%;animation:sxspin 1s linear infinite}'
  +'#sysv .sxrot{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);display:flex;align-items:center;gap:10px;z-index:6}'
  +'#sysv .sxmlab{font-size:.72rem;color:#7cf5df;letter-spacing:.1em;text-transform:uppercase;min-width:140px;text-align:center}'
  +'#sysv .sxtip{position:absolute;z-index:8;pointer-events:none;display:none;background:rgba(6,16,13,.97);border:1px solid #2ee6c9;border-radius:8px;padding:9px 13px;max-width:250px;box-shadow:0 0 14px rgba(46,230,201,.35),0 6px 20px rgba(0,0,0,.65);font-size:.95rem;line-height:1.4}'
  +'#sysv .sxtip b{color:#f0b24a;font-family:Rajdhani;font-size:15px;letter-spacing:.02em}'
  +'#sysv .sxtip .sxc{color:#9dd8cc;margin-top:3px}'
  +'#sysv .sxtip .sxd{color:#c9ded7;font-style:italic}';
  document.head.appendChild(c);
}
function openSys(si){
  if(window._sxRaf){cancelAnimationFrame(window._sxRaf);window._sxRaf=null;}
  var sg=sysGen(si);
  if(!sg||!sg.pl.length){return;}
  sysCss();
  SYSV=si;
  var wrap=$('a-map').parentNode;
  var ov=$('sysv');
  if(!ov){ov=document.createElement('div');ov.id='sysv';wrap.appendChild(ov);}
  var s=sg.star;
  var h='<div class="svhead"><div><b>'+esc(s.des)+'</b> · classe '+s.cls+' · '+esc(s.seg)+'<span class="svid">Vue système</span></div><button type="button" id="sv-close" class="btn ghost sm">← Atlas</button></div>';
  h+='<div class="svbody"><div class="svmap"><svg id="sv-svg" viewBox="0 0 1000 1000">';
  h+='<defs><radialGradient id="sv-star"><stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="'+s.col+'"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></radialGradient>';
  sg.pl.forEach(function(p,i){h+='<radialGradient id="sv-p'+i+'" cx="35%" cy="30%"><stop offset="0%" stop-color="'+p.c1+'"/><stop offset="100%" stop-color="'+p.c2+'"/></radialGradient>';});
  h+='</defs>';
  h+='<circle cx="500" cy="500" r="36" fill="url(#sv-star)"/>';
  sg.pl.forEach(function(p){h+='<circle cx="500" cy="500" r="'+p.orb.toFixed(0)+'" fill="none" stroke="#2ee6c9" stroke-opacity="0.16"/>';});
  sg.pl.forEach(function(p,i){
    var prd=p.rad.toFixed(1);
    h+='<g class="plg" data-i="'+i+'">';
    h+='<image href="'+planetTex(sg.star.si*97+i*31+7,96,p.type)+'" x="'+(-p.rad).toFixed(1)+'" y="'+(-p.rad).toFixed(1)+'" width="'+(p.rad*2).toFixed(1)+'" height="'+(p.rad*2).toFixed(1)+'"/><circle class="plc" r="'+prd+'" fill="none" stroke="#02060d" stroke-opacity=".5" stroke-width="1"/>';
    if(p.rings){h+='<ellipse class="plr" rx="'+(p.rad*1.9).toFixed(1)+'" ry="'+(p.rad*0.55).toFixed(1)+'" fill="none" stroke="#e8d9b0" stroke-opacity=".5"/>';}
    h+='</g>';
  });
  h+='</svg></div></div>';
  ov.innerHTML=h;
  ov.style.display='';
  $('sv-close').addEventListener('click',closeSys);
  $('sv-close').textContent='← '+(AMODE?'Atlas':'Carte');
  Array.prototype.forEach.call(ov.querySelectorAll('.plg'),function(el){
    el.addEventListener('click',function(ev){ev.stopPropagation();
      var i=parseInt(el.getAttribute('data-i'),10);
      sg.pl.forEach(function(p,j){p.sel=j===i;});
      sysInfo(sg);sysHl(sg);
    });
  });
  sysInfo(sg);
  sysHl(sg);
  sysAnim(sg);
}
function sysHl(sg){
  Array.prototype.forEach.call(document.querySelectorAll('#sv-svg .plg'),function(el){
    var i=parseInt(el.getAttribute('data-i'),10);
    el.setAttribute('opacity',sg.pl[i].sel?'1':'0.72');
    var c=el.querySelector('.plc');
    c.setAttribute('stroke',sg.pl[i].sel?'#2ee6c9':'#02060d');
  });
}
function sysStar(sg){
  var el=$('g-panel');if(!el){return;}
  var s=sg.star;
  el.innerHTML='<h3>⭐ '+esc(s.des)+'</h3><span class="badge">classe '+esc(s.cls)+'</span>'
   +'<p class="pv" style="margin-top:10px">Système de '+sg.pl.length+' planète'+(sg.pl.length>1?'s':'')+' · '+esc(s.seg)+' · Secteur '+segGrid(s.x,s.y)+' · '+segSub(s.x,s.y)+'</p>'
   +(s.note?'<p class="pv" style="margin-top:6px"><i>'+esc(s.note)+'</i></p>':'')
   +'<div class="pl">Planètes</div>';
  var h2='';
  sg.pl.forEach(function(p,i){
    h2+='<button class="btn ghost sm svstar" data-i="'+i+'" type="button" style="display:flex;align-items:center;justify-content:space-between;width:100%;margin:0 0 6px 0;text-align:left">'
     +'<span style="display:inline-flex;align-items:center"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+p.c1+';margin-right:8px"></span>'
     +esc(p.nom)+' · '+esc(p.type)+'</span><span style="opacity:.7">'+p.ua+' UA</span></button>';
  });
  el.innerHTML+=h2+'<p class="pv" style="margin-top:8px">Cliquez une planète pour l’examiner.</p>';
  Array.prototype.forEach.call(el.querySelectorAll('.svstar'),function(b){
    b.addEventListener('click',function(){sysSel(sg,parseInt(b.getAttribute('data-i'),10));});
  });
}
function sysInfo(sg){
  var el=$('g-panel');if(!el){return;}
  var p=null;sg.pl.forEach(function(x){if(x.sel){p=x;}});
  if(!p){sysStar(sg);return;}
  var idx=sg.pl.indexOf(p);
  el.innerHTML='<h3>🪐 '+esc(p.nom)+'</h3><span class="badge">'+esc(p.type)+'</span>'
   +'<p class="pv" style="margin-top:10px">'+esc(p.dp)+'.</p>'
   +'<div class="pl">Données orbitales</div>'
   +'<p class="pv">Distance à l’étoile : '+p.ua+' UA · Période : '+p.per+' ans</p>'
   +(p.rings?'<p class="pv">Système d’anneaux étendu</p>':'')
   +'<div class="cta-row" style="justify-content:flex-start;margin-top:10px">'
   +'<button class="btn ghost sm" id="sv-back" type="button">← Système</button></div>';
  $('sv-back').addEventListener('click',function(){sg.pl.forEach(function(x){x.sel=false;});sysStar(sg);sysHl(sg);});
}
function sysSel(sg,i){
  if(i<0){i=sg.pl.length-1;}
  if(i>=sg.pl.length){i=0;}
  sg.pl.forEach(function(p,j){p.sel=j===i;});
  sysHl(sg);sysExplore(sg,i);
}
function sysAnim(sg){
  if(window._svRaf){cancelAnimationFrame(window._svRaf);}
  var last=null;
  var step=function(ts){
    if(SYSV===null){window._svRaf=null;return;}
    var svg=$('sv-svg');
    if(!svg){window._svRaf=null;return;}
    if(last===null){last=ts;}
    var dt=Math.min(0.1,(ts-last)/1000);last=ts;
    sg.pl.forEach(function(p,i){
      p.a+=p.om*dt;
      var g=svg.querySelector('.plg[data-i="'+i+'"]');
      if(g){g.setAttribute('transform','translate('+(500+Math.cos(p.a)*p.orb).toFixed(1)+' '+(500+Math.sin(p.a)*p.orb*0.92).toFixed(1)+')');}
    });
    window._svRaf=requestAnimationFrame(step);
  };
  window._svRaf=requestAnimationFrame(step);
}
var SYSXP=-1,SYSXPOI=null;
function sysXInfo(sg){
  var el=$('g-panel');if(!el){return;}
  var p=sg.pl[SYSXP];
  el.innerHTML='<h3 style="margin:.1em 0 .3em">🪐 '+esc(p.nom)+'</h3><span class="badge">'+esc(p.type)+'</span>'
   +'<p class="pv" style="margin-top:10px">'+esc(p.dp)+'.</p>'
   +'<div class="pl">Données orbitales</div>'
   +'<p class="pv">Distance à l’étoile : '+p.ua+' UA · Période : '+p.per+' ans</p>'
   +(p.rings?'<p class="pv">Système d’anneaux étendu</p>':'')
   +'<div class="pl">Points d’intérêt</div>';
  if(SYSXPOI){
    var coord='';
    if(SYSXPOI.world&&window._sxGeo){
      var gg=window._sxGeo;
      var mm=gg.meridianOf(SYSXPOI.X)+1;
      var ll=gg.latOf(SYSXPOI.y);
      coord='<p class="pv" style="margin-top:4px;color:#2ee6c9">Coordonnées : méridien '+mm+' / '+gg.N+' · '+Math.abs(Math.round(ll))+'° '+(ll>=0?'N':'S')+'</p>';
    }
    el.innerHTML+='<p class="pv"><b>📍 '+esc(SYSXPOI.nom)+'</b></p>'+coord+'<p class="pv" style="margin-top:6px">'+esc(SYSXPOI.desc)+'</p>';
  }else{
    el.innerHTML+='<p class="pv">Cliquez un repère sur le globe pour l’examiner ('+p.pois.length+' détectés).</p>';
  }
  el.innerHTML+='<div class="cta-row" style="justify-content:flex-start;margin-top:10px">'
   +'<button class="btn ghost sm" id="sx-back" type="button">← Système</button></div>';
  $('sx-back').addEventListener('click',function(){SYSXP=-1;SYSXPOI=null;sg.pl.forEach(function(x){x.sel=false;});openSys(sg.star.si);});
}
function sysExplore(sg,i){
  if(window._sxRaf){cancelAnimationFrame(window._sxRaf);window._sxRaf=null;}
  if(window._sxKey){window.removeEventListener('keydown',window._sxKey);window._sxKey=null;}
  SYSXP=i;SYSXPOI=null;
  var p=sg.pl[i];
  var inst=null;
  if(window.PER&&PER.supported(p.type)){try{inst=PER.create(p.type,sg.star.si*97+i*31+7,320,16);}catch(e){inst=null;}}
  if(inst&&inst.geo){window._sxGeo=inst.geo;}
  if(!p.pois){
    var rp=prng(sg.star.si*97+i*13+5);
    var XN=['Ruines cyclopéennes','Épave d’un vaisseau','Signal intermittent','Anomalie énergétique','Cratère d’impact','Structure métallique','Balise silencieuse','Réseau souterrain','Station abandonnée','Source thermique'];
    var XD=['Des traces d’une civilisation oubliée affleurent sous la poussière.','La coque brisée dérive ici depuis des siècles ; personne n’a jamais osé y pénétrer.','Un signal répétitif bat au rythme des marées magnétiques.','Les capteurs saturent à l’approche : quelque chose rayonne sous la croûte.','Un impact ancien a cristallisé le sol en une dentelle noire.','Des angles trop parfaits pour être naturels dépassent du relief.','Elle émettait encore il y a peu ; désormais, silence radio.','Des cavités karstiques s’étendent sous la surface, idéal pour se cacher.','Les sas sont scellés de l’intérieur.','Un panache chaud trahit une activité géologique récente.'];
    var n=3+Math.floor(rp()*4);
    p.pois=[];
    // FIX : landPoints exige le relief (SL.E) calcule -> on differe la generation
    // a la fin du chargement de l'instance PER ; avant cela E est vide et
    // isLand repond "ocean partout" -> tous les POI tombaient a l'equateur.
    window._sxMkPois=function(){
      if(p.pois.length){return;}
      if(inst&&inst.geo){
        var pts=inst.geo.landPoints(n,prng(sg.star.si*97+i*13+5));
        for(var k=0;k<n;k++){
          p.pois.push({nom:XN[Math.floor(rp()*XN.length)],desc:XD[Math.floor(rp()*XD.length)],X:pts[k].X,y:pts[k].y,world:true});
        }
      }else{
        for(var k2=0;k2<n;k2++){
          var an=rp()*6.2832,rr=90+rp()*190;
          p.pois.push({nom:XN[Math.floor(rp()*XN.length)],desc:XD[Math.floor(rp()*XD.length)],x:500+Math.cos(an)*rr,y:500+Math.sin(an)*rr*0.96});
        }
      }
    };
    if(!inst){window._sxMkPois();}
  }
  var ov=$('sysv');
  var h='<div class="svhead"><div><b>'+esc(p.nom)+'</b> · '+esc(p.type)+'<span class="svid">Vue planète</span></div><button type="button" id="sv-close" class="btn ghost sm">← Atlas</button></div>';
  h+='<div class="svbody"><div class="svmap"><div id="sx-tip" class="sxtip"></div><svg id="sv-svg" viewBox="0 0 1000 1000">';
  h+='<defs><clipPath id="svx-c"><circle cx="500" cy="500" r="300"/></clipPath>'
   +'<radialGradient id="svx-g" cx="38%" cy="32%"><stop offset="0%" stop-color="'+p.c1+'"/><stop offset="100%" stop-color="'+p.c2+'"/></radialGradient>'
   +'<radialGradient id="svx-s"><stop offset="70%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,.45)"/></radialGradient></defs>';
  h+='<circle cx="500" cy="500" r="300" fill="url(#svx-g)"/>';
  h+='<g id="svx-t" clip-path="url(#svx-c)">';
  h+='<image id="svx-img" href="'+planetTex(sg.star.si*97+i*31+7,512,p.type)+'" x="200" y="200" width="600" height="600" preserveAspectRatio="none"/>';
  h+='</g>';
  h+='<g clip-path="url(#svx-c)" stroke="#2ee6c9" stroke-opacity=".14" fill="none">';
  for(var c2=1;c2<6;c2++){h+='<line x1="'+(200+c2*100)+'" y1="200" x2="'+(200+c2*100)+'" y2="800"/><line x1="200" y1="'+(200+c2*100)+'" x2="800" y2="'+(200+c2*100)+'"/>';}
  h+='</g>';
  h+='<circle cx="500" cy="500" r="300" fill="url(#svx-s)"/>';
  h+='<circle cx="500" cy="500" r="300" fill="none" stroke="#2ee6c9" stroke-opacity=".35"/>';
  if(p.rings){h+='<ellipse cx="500" cy="500" rx="440" ry="120" fill="none" stroke="#e8d9b0" stroke-opacity=".4" transform="rotate(-18 500 500)"/>';}
  h+='<g id="sx-pois"></g>';
  h+='</svg></div></div>';
  if(inst){h+='<div id="sx-load" class="sxload"><div class="sxring"></div><div id="sx-ltxt">CHARGEMENT DU SYSTÈME…</div><div class="sxbar"><div id="sx-bar-in" class="sxbar-in"></div></div></div>'
   +'<div id="sx-rot" class="sxrot" style="display:none"><button type="button" id="sx-prev" class="btn ghost sm">◀</button><span id="sx-mlab" class="sxmlab">MÉRIDIEN — / 16</span><button type="button" id="sx-next" class="btn ghost sm">▶</button></div>';}
  ov.innerHTML=h;
  ov.style.display='';
  $('sv-close').addEventListener('click',closeSys);
  $('sv-close').textContent='← '+(AMODE?'Atlas':'Carte');
  var sxPoiRender=function(){
    var g2=document.getElementById('sx-pois');if(!g2){return;}
    var h2='';
    p.pois.forEach(function(q8,pi){
      var sx,sy,op=1;
      if(q8.world&&inst){
        var u=inst.geo.offsetAt(q8.X,inst.idx);
        if(u==null){return;}
        sx=200+u/inst.geo.W*600;
        sy=200+q8.y/inst.geo.H*600;
        op=Math.max(0,Math.min(1,Math.min(u,inst.geo.W-u)/34));
        var hw=inst.geo.W/2,hh=inst.geo.H/2;
        var lx=(u-hw)/hw,ly=(q8.y-hh)/hh;
        var limb=1-Math.sqrt(lx*lx+ly*ly);
        if(limb<=0.04){return;}
        op=Math.min(op,Math.min(1,limb/0.16));
        if(op<=0.02){return;}
      }else{sx=q8.x;sy=q8.y;}
      var on=SYSXPOI===q8;
      var col2=on?'#f0b24a':'#2ee6c9';
      h2+='<g class="sxpoi" data-i="'+pi+'"><circle cx="'+sx.toFixed(0)+'" cy="'+sy.toFixed(0)+'" r="9" fill="'+col2+'" fill-opacity="'+(0.9*op).toFixed(2)+'"/><circle cx="'+sx.toFixed(0)+'" cy="'+sy.toFixed(0)+'" r="15" fill="none" stroke="'+col2+'" stroke-opacity="'+(0.5*op).toFixed(2)+'"/><title>'+esc(q8.nom)+'</g>';
    });
    g2.innerHTML=h2;
    Array.prototype.forEach.call(g2.querySelectorAll('.sxpoi'),function(el){
      el.addEventListener('click',function(ev){ev.stopPropagation();
        SYSXPOI=p.pois[parseInt(el.getAttribute('data-i'),10)];
        if(window._sxTipFor){window._sxTipFor(SYSXPOI,el);}
        sxPoiRender();
        sysXInfo(sg);
        if(window._sxTipT){clearTimeout(window._sxTipT);}
        window._sxTipT=setTimeout(function(){var t2=$('sx-tip');if(t2){t2.style.display='none';}},2600);
      });
    });
  };
  window._sxPoiR=sxPoiRender;
  sxPoiRender();
  sysXInfo(sg);
  var tip=$('sx-tip');
  var tipFor=function(q8,el){
    if(!tip){return;}
    var html='<b>'+esc(q8.nom)+'</b>';
    if(q8.world&&inst&&inst.geo){
      var mco2=inst.geo.meridianOf(q8.X)+1;
      var lco2=inst.geo.latOf(q8.y);
      html+='<div class="sxc">Méridien '+mco2+' / '+inst.geo.N+' · '+Math.abs(Math.round(lco2))+'° '+(lco2>=0?'N':'S')+'</div>';
    }
    if(q8.desc){html+='<div class="sxc sxd">'+esc(q8.desc)+'</div>';}
    tip.innerHTML=html;
    tip.style.display='block';
    var wr=tip.parentNode.getBoundingClientRect();
    var r2=el.getBoundingClientRect();
    var lx=r2.left-wr.left+r2.width/2;
    tip.style.left=Math.max(4,Math.min(wr.width-244,lx-120))+'px';
    var th=tip.offsetHeight||64;
    tip.style.top=((r2.top-wr.top-th-8>4)?(r2.top-wr.top-th-8):(r2.bottom-wr.top+8))+'px';
  };
  window._sxTipFor=tipFor;
  var svs=$('sv-svg');
  if(svs){
    svs.addEventListener('mousemove',function(ev){
      var t=(ev.target&&ev.target.closest)?ev.target.closest('.sxpoi'):null;
      if(!t){if(tip){tip.style.display='none';}return;}
      tipFor(p.pois[parseInt(t.getAttribute('data-i'),10)],t);
    });
    svs.addEventListener('mouseleave',function(){if(tip){tip.style.display='none';}});
  }
  if(inst){
    var im=$('svx-img');
    var cv=document.createElement('canvas');cv.width=320;cv.height=320;
    var cx2=cv.getContext('2d');
    var load=$('sx-load'),rot=$('sx-rot'),lab=$('sx-mlab');
    inst.attach(cx2);
    var refresh=function(){inst.attach(cx2);im.setAttribute('href',cv.toDataURL());if(window._sxPoiR){window._sxPoiR();}};
    var crank=function(d){
      inst.step(d);refresh();
      if(lab){lab.textContent='MÉRIDIEN '+((inst.idx%inst.count)+1)+' / '+inst.count;}
    };
    $('sx-prev').addEventListener('click',function(ev){ev.stopPropagation();crank(1);});
    $('sx-next').addEventListener('click',function(ev){ev.stopPropagation();crank(-1);});
    window._sxKey=function(ev2){
      if(SYSXP!==i){return;}
      if(ev2.key==='ArrowLeft'){crank(1);ev2.preventDefault();}
      else if(ev2.key==='ArrowRight'){crank(-1);ev2.preventDefault();}
    };
    window.addEventListener('keydown',window._sxKey);
    var t0=Date.now();var MINLOAD=1200;
    var poll=function(){
      if(SYSXP!==i){return;}
      var r=inst.tick(50);
      var lt=$('sx-ltxt');
      if(lt){lt.textContent='CHARGEMENT DU SYSTÈME… '+Math.round(r.pct)+'% · '+(r.phase==='relief'?'ANALYSE DU RELIEF':'SYNTHÈSE DES MÉRIDIENS');}
      var bi=$('sx-bar-in');
      var el=Math.min(MINLOAD,Date.now()-t0);
      if(bi){bi.style.width=Math.round(Math.min(100,r.pct*(el/MINLOAD)))+'%';}
      if(r.ready&&el>=MINLOAD){
        if(window._sxMkPois){window._sxMkPois();window._sxMkPois=null;}
        refresh();
        sysXInfo(sg);
        if(lt){lt.textContent='SYSTÈME EN LIGNE';}
        if(bi){bi.style.width='100%';}
        if(load){load.classList.add('sxout');}
        var fin=function(){if(rot){rot.style.display='';}if(lab){lab.textContent='MÉRIDIEN 1 / '+inst.count;}if(load&&load.parentNode){load.style.display='none';}};
        setTimeout(fin,480);
        return;
      }
      window._sxRaf=requestAnimationFrame(poll);
    };
    window._sxRaf=requestAnimationFrame(poll);
  } else if(p.type!=='Géante gazeuse'){
    var ang=0,lst2=null;
    var step2=function(ts2){
      if(SYSXP<0){window._sxRaf=null;return;}
      var tex=$('svx-t');if(!tex){window._sxRaf=null;return;}
      if(lst2===null){lst2=ts2;}
      var dt2=Math.min(0.1,(ts2-lst2)/1000);lst2=ts2;
      ang=(ang+dt2*0.8)%360;
      tex.setAttribute('transform','rotate('+ang.toFixed(2)+' 500 500)');
      window._sxRaf=requestAnimationFrame(step2);
    };
    window._sxRaf=requestAnimationFrame(step2);
  }
}
function closeSys(){
  if(window._svRaf){cancelAnimationFrame(window._svRaf);window._svRaf=null;}
  if(window._sxRaf){cancelAnimationFrame(window._sxRaf);window._sxRaf=null;}
  if(window._sxKey){window.removeEventListener('keydown',window._sxKey);window._sxKey=null;}
  SYSV=null;SYSXP=-1;SYSXPOI=null;window._sxGeo=null;window._sxPoiR=null;window._sxMkPois=null;window._sxTipFor=null;if(window._sxTipT){clearTimeout(window._sxTipT);}window._sxTipT=null;
  var ov=$('sysv');if(ov){ov.style.display='none';ov.innerHTML='';}
  renderPanel();
}

function legRender(){
  var p=SKP[SKIN],d=$('leg-drop');
  if(AMODE){
    d.innerHTML='<span><i style="background:#dfe8ff"></i>Champ stellaire · '+genStars().length+' étoiles</span><span><i style="background:none;border:0"></i>Clic sur une étoile : système</span><span id="leg-sec">Secteur : —</span>';
  }else{
    d.innerHTML='<span><i style="background:#2ee6c9"></i>Système</span><span><i style="background:#f0b24a"></i>Vaisseau</span><span><i style="background:rgba(46,230,201,.35)"></i>Nébuleuse</span><span><i style="background:none;border:1px dashed #93aca1"></i>Inexploré</span><span id="leg-sec">Secteur : '+(CURSEC||'Campagne')+'</span>';
  }
}
var HOVSEC=null,HOVP=null;
function secHover(p){
  HOVP=p;
  var b=$('sec-btn');if(!b){return;}
  if(!AMODE){b.style.display='none';return;}
  var z=(1400-VB.w)/(1400-vbmin());
  if(z<0.25){b.style.display='none';return;}
  var ci=Math.max(1,Math.min(20,Math.ceil(p.sx/70))),cl=Math.max(1,Math.min(12,Math.ceil(p.sy/75)));
  HOVSEC='C'+ci+'-L'+cl;
  var sv=$('a-svg');if(!sv){b.style.display='none';return;}
  var r=sv.getBoundingClientRect(),wr=sv.parentNode.getBoundingClientRect();
  var lx=(ci*70-VB.x)/VB.w*r.width+(r.left-wr.left);
  var ly=((cl-1)*75-VB.y)/VB.h*r.height+(r.top-wr.top);
  b.title='Afficher le secteur '+HOVSEC;
  b.style.display='';
  b.style.left=(lx-24-7)+'px';
  b.style.top=(ly+7)+'px';
}
function secItems(){
  if(!CURSEC){SECS=SYS;return SECS;}
  var own=SYS.filter(function(g){return String(g.secteur||'').toUpperCase()===CURSEC;});
  if(own.length){SECS=own;return SECS;}
  var m=/^C(\d+)-L(\d+)$/.exec(CURSEC);var c0=(parseInt(m[1],10)-1)*70,l0=(parseInt(m[2],10)-1)*75;
  SECS=genStars().filter(function(s){return s.x>=c0&&s.x<c0+70&&s.y>=l0&&s.y<l0+75;}).map(function(s){return {proc:true,si:s.si,id:900000+s.si,nom:s.des,categorie:'systeme',x:Math.round(((s.x-c0)/70)*1000),y:Math.round(((s.y-l0)/75)*700)};});
  return SECS;
}
function setMode(gal){
  AMODE=!!gal;
  $('m-backgal').style.display=AMODE?'none':'';
  $('g-map').style.display=AMODE?'none':'';
  $('a-map').style.display=AMODE?'':'none';
  $('p-map').style.display='none';
  $('g-crumb').style.display='none';
  $('g-searchbox').style.display='';
  $('g-zoom').style.display='';
  $('g-search').value='';
  $('star-tip').style.display='none';
  $('g-search').placeholder=AMODE?'🔎 Chercher un monde, une zone, une anomalie...':'🔎 Chercher un système, une planète...';
  if(AMODE){SEL=null;CURPLA=null;CURPOI=null;if(!ATLAS.length){loadAtlas();}else{renderAtlas();}}
  else{renderMap();}
  renderPanel();
  legRender();
  resetVB();
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
  if(AMODE){
    Array.prototype.forEach.call(document.querySelectorAll('.aloc'),function(el){
      var id=parseInt(el.getAttribute('data-id'),10);var a=null;ATLAS.forEach(function(s){if(s.id===id){a=s;}});
      var hay=(a?(a.nom+' '+(a.description||'')+' '+a.categorie):'').toLowerCase();
      el.style.opacity=(!q||hay.indexOf(q)>=0)?'1':'0.12';
    });
    return;
  }
  Array.prototype.forEach.call(document.querySelectorAll('.sysg'),function(el){
    var id=parseInt(el.getAttribute('data-id'),10);
    var g=null;SECS.forEach(function(s){if(s.id===id){g=s;}});
    var hay=(g?(g.nom+' '+(g.proc?'étoile':JSON.stringify(g.data||{}))):'').toLowerCase();
    el.style.opacity=(!q||hay.indexOf(q)>=0)?'1':'0.12';
  });
}
$('g-search').addEventListener('input',applySearch);
$('legend-btn').addEventListener('click',function(){var w=$('g-legend');var on=w.classList.toggle('open-leg');this.setAttribute('aria-expanded',on?'true':'false');});
$('m-backgal').addEventListener('click',function(){setMode(true);});
/* Pan + zoom sur la carte de la galaxie : glisser pour deplacer, molette / double-clic / boutons pour zoomer */
var VB={x:0,y:0,w:1000,h:700},DRAGGED=false,DRG=null;function vbmin(){return AMODE?240:170;}
function applyVB(){var sv=$(AMODE?'a-svg':'g-svg');if(sv){sv.setAttribute('viewBox',VB.x+' '+VB.y+' '+VB.w+' '+VB.h);}if(AMODE){var z=Math.max(0,Math.min(1,(1400-VB.w)/(1400-vbmin())));var srT=VB.w*(0.001+0.004*z);var sty=$('a-sr');if(!sty){sty=document.createElement('style');sty.id='a-sr';document.head.appendChild(sty);}var gd=$('a-grid'),gl=$('a-glab');if(gd){gd.setAttribute('opacity',(0.12+z*0.33).toFixed(3));}if(gl){gl.setAttribute('opacity',Math.max(0,Math.min(1,(z-0.1)/0.15)).toFixed(3));var fs=22*(VB.w/1400);gl.setAttribute('font-size',fs.toFixed(2));var mg=fs*3;for(var gi=1;gi<=20;gi++){var tC=$('glC'+gi),rb=$('glCb'+gi);var cx=gi*70-35;var vis=cx>=VB.x+mg&&cx<=VB.x+VB.w-mg;if(tC){tC.setAttribute('y',(VB.y+fs*1.195).toFixed(1));tC.setAttribute('display',(vis?'':'none'));}if(rb){var w=fs*(('C'+gi).length*0.62+0.5);rb.setAttribute('x',(cx-w/2).toFixed(1));rb.setAttribute('y',(VB.y+fs*0.12).toFixed(1));rb.setAttribute('width',w.toFixed(1));rb.setAttribute('height',(fs*1.45).toFixed(1));rb.setAttribute('rx',(fs*0.3).toFixed(1));rb.setAttribute('display',(vis?'':'none'));}}for(var gj=1;gj<=12;gj++){var tL=$('gL'+gj),rb2=$('glLb'+gj);var ly=gj*75-37.5;var vis2=ly>=VB.y+mg&&ly<=VB.y+VB.h-mg;if(tL){tL.setAttribute('text-anchor','middle');tL.setAttribute('x',(VB.x+fs*0.1+fs*(('L'+gj).length*0.62+0.5)/2).toFixed(1));tL.setAttribute('y',(ly+fs*0.225).toFixed(1));tL.setAttribute('display',(vis2?'':'none'));}if(rb2){var w2=fs*(('L'+gj).length*0.62+0.5);rb2.setAttribute('x',(VB.x+fs*0.1).toFixed(1));rb2.setAttribute('y',(ly-fs*0.85).toFixed(1));rb2.setAttribute('width',w2.toFixed(1));rb2.setAttribute('height',(fs*1.45).toFixed(1));rb2.setAttribute('rx',(fs*0.3).toFixed(1));rb2.setAttribute('display',(vis2?'':'none'));}}}var col=$('a-col'),wov=$('a-wov');if(col){col.setAttribute('opacity',z.toFixed(3));}if(wov){wov.setAttribute('opacity',(1-z).toFixed(3));}window._srTgt=srT;if(!window._srCur){window._srCur=srT;}var _srA=function(v){sty.textContent='#a-svg circle[data-si]{r:'+v.toFixed(3)+'px;stroke:#02060d;stroke-opacity:.65;stroke-width:'+(v*0.8).toFixed(3)+'px;paint-order:stroke fill}';};if(window._srRaf){cancelAnimationFrame(window._srRaf);}(function(){var step=function(){var c=window._srCur,t=window._srTgt;c=c+(t-c)*0.3;if(Math.abs(t-c)<0.004){c=t;}_srA(c);window._srCur=c;if(c!==t){window._srRaf=requestAnimationFrame(step);}else{window._srRaf=null;}};step();})();if(!DRG&&HOVP){secHover(HOVP);}
var sh=(VB.w<=820);Array.prototype.forEach.call(document.querySelectorAll('.shlbl'),function(t){t.style.display=sh?'':'none';});var sg=(VB.w>420);Array.prototype.forEach.call(document.querySelectorAll('.aseg'),function(t){t.style.display=sg?'':'none';});}}
function clampVB(){var W=wdim(),Hh=hdim();if(VB.w<vbmin()){VB.w=vbmin();}if(VB.w>W){VB.w=W;}VB.h=VB.w*(Hh/W);var mx=W-VB.w,my=Hh-VB.h;if(VB.x<0){VB.x=0;}if(VB.y<0){VB.y=0;}if(VB.x>mx){VB.x=mx;}if(VB.y>my){VB.y=my;}}
function zoomAt(px,py,f){var W=wdim();var nw=Math.max(vbmin(),Math.min(W,VB.w/f));var k=nw/VB.w;VB.x=px-(px-VB.x)*k;VB.y=py-(py-VB.y)*k;VB.w=nw;clampVB();applyVB();}
function resetVB(){VB={x:0,y:0,w:wdim(),h:hdim()};applyVB();}
function svgPt(ev){var sv=$(AMODE?'a-svg':'g-svg');if(!sv){return null;}var r=sv.getBoundingClientRect();if(r.width<2){return null;}return {sx:VB.x+(ev.clientX-r.left)/r.width*VB.w,sy:VB.y+(ev.clientY-r.top)/r.height*VB.h,kx:VB.w/r.width,ky:VB.h/r.height};}
(function(){
  ['g-map','a-map'].forEach(function(mid){
  var gm=$(mid);
  gm.addEventListener('wheel',function(ev){ev.preventDefault();var p=svgPt(ev);if(!p){return;}zoomAt(p.sx,p.sy,ev.deltaY<0?1.25:0.8);},{passive:false});
  gm.addEventListener('dblclick',function(ev){var p=svgPt(ev);if(p){zoomAt(p.sx,p.sy,1.6);}});
  gm.addEventListener('pointerdown',function(ev){DRG={cx:ev.clientX,cy:ev.clientY,vx:VB.x,vy:VB.y};DRAGGED=false;gm.classList.add('drag');});
  gm.addEventListener('click',function(ev){if(DRAGGED){ev.stopPropagation();ev.preventDefault();DRAGGED=false;}},true);
  });
  window.addEventListener('pointermove',function(ev){if(!DRG){return;}var p=svgPt(ev);if(!p){return;}var dx=ev.clientX-DRG.cx,dy=ev.clientY-DRG.cy;if(!DRAGGED&&(dx*dx+dy*dy)>25){DRAGGED=true;}if(DRAGGED){VB.x=DRG.vx-dx*p.kx;VB.y=DRG.vy-dy*p.ky;clampVB();applyVB();}});
  window.addEventListener('pointerup',function(){DRG=null;$('g-map').classList.remove('drag');$('a-map').classList.remove('drag');});
  $('g-zin').addEventListener('click',function(){zoomAt(VB.x+VB.w/2,VB.y+VB.h/2,1.45);});
  $('g-zout').addEventListener('click',function(){zoomAt(VB.x+VB.w/2,VB.y+VB.h/2,0.69);});
  $('g-reset').addEventListener('click',resetVB);
  var cmw=document.querySelector('.gmap-wrap');
  if(cmw){cmw.addEventListener('contextmenu',function(ev){ev.preventDefault();});}
})();
loadGalaxie();
setMode(true);
var RTGD=null;
function rtDeb(fn){return function(){clearTimeout(RTGD);RTGD=setTimeout(fn,700);};}
function rtInit(){
  try{
    if(typeof supabase==="undefined"||!supabase.createClient){return;}
    var rtu=(typeof SB!=="undefined"&&String(SB).indexOf("/rest")>0)?String(SB).slice(0,String(SB).indexOf("/rest")):((typeof SB!=="undefined")?String(SB):"https://dnbnkdakmobufqcrqzpq.supabase.co");
    var rtk=(typeof SBK!=="undefined")?String(SBK).replace("Bearer ",""):"sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov";
    var rtr=rtu+"/rest/v1/";
    var c=supabase.createClient(rtu,rtk,{realtime:{params:{eventsPerSecond:2}}});
    var ch=c.channel("carte-live");
    ch.on("postgres_changes",{event:"*",schema:"public",table:"galaxie"},rtDeb(loadGalaxie));
    ch.on("postgres_changes",{event:"*",schema:"public",table:"atlas"},rtDeb(loadAtlas));
    ch.on("postgres_changes",{event:"*",schema:"public",table:"planetes"},rtDeb(function(){if(SEL){loadPlanetes(SEL);}renderPanel();}));
    ch.on("postgres_changes",{event:"*",schema:"public",table:"planetes_poi"},rtDeb(function(){
      if(CURPLA){fetchJ(SB+"planetes_poi?select=*&planete_id=eq."+CURPLA.id+"&order=id.asc").then(function(l){POIS=l||[];renderPlanetView();renderPanel();}).catch(function(){});}
    }));
    ch.subscribe(function(){});
  }catch(e){}
}
rtInit();
