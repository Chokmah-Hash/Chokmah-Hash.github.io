
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
  var NOTES=['Monde agricole recens\u00e9','Ruines xenos non identifi\u00e9es','Signal r\u00e9current capt\u00e9','Station perdue depuis trois si\u00e8cles','Ceinture d\u2019ast\u00e9ro\u00efdes m\u00e9tallif\u00e8re','Temp\u00eate \u00e9lectromagn\u00e9tique en cours','N\u00e9buleuse protostellaire','Navire \u00e0 la d\u00e9rive signal\u00e9','Balise d\u2019alerte muette','Contrebandiers actifs dans le secteur','Monde-tombe h\u00e9raldique','Anomalie gravitationnelle l\u00e9g\u00e8re'];
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
      var spx=svgPt(ev);if(spx){secHover(spx);var lsec=$('leg-sec');if(lsec){lsec.textContent='Secteur : '+segGrid(spx.sx,spx.sy)+' \u00b7 '+segSub(spx.sx,spx.sy);}}
      var t=ev.target;
      if(!t||!t.getAttribute||t.getAttribute('data-si')===null){tip.style.display='none';return;}
      var si=parseInt(t.getAttribute('data-si'),10);
      var s=SFLD&&SFLD[si];
      if(!s){tip.style.display='none';return;}
      var sg2=sysGen(si);tip.innerHTML='<b>'+s.des+'</b> \u00b7 classe '+s.cls+' \u00b7 Secteur '+segGrid(s.x,s.y)+' \u00b7 '+segSub(s.x,s.y)+(sg2&&sg2.pl.length?'<br>'+sg2.pl.length+' plan\u00e8te'+(sg2.pl.length>1?'s':'')+' \u00b7 <i>clic pour explorer</i>':'')+(s.note?'<br><i>'+s.note+'</i>':'');
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
      ['Tellurique','#b08968','#6e5138','Biosph\u00e8re r\u00e9siliente|Cro\u00fbte tectonique jeune|Plaines balay\u00e9es par les vents'],
      ['Oc\u00e9anique','#4f86c9','#28527d','Mer mondiale unique|Archipels volcaniques \u00e9pars|Courants abyssaux violents'],
      ['Glaciaire','#cfe8f2','#7d9db0','Calotte glaci\u00e8re perp\u00e9tuelle|Oc\u00e9an sous-glaciaire probable|Banquise \u00e9ternellement fig\u00e9e'],
      ['D\u00e9sertique','#e0b36a','#8f6f3f','Dunes ocres \u00e0 perte de vue|Canyons cisaill\u00e9s par les temp\u00eates|Ruines ensevelies sous le sable'],
      ['Volcanique','#c2454f','#7a2430','Cha\u00eenes de volcans actifs|Mers de lave incandescente|Cendres dans la haute atmosph\u00e8re'],
      ['G\u00e9ante gazeuse','#d9a86a','#9c7a4a','Bandes d\u2019ammoniac en turbulence|Temp\u00eates multicentenaires|C\u0153ur de m\u00e9tal liquide'],
      ['St\u00e9rile','#9aa3a8','#5c6467','Crat\u00e8res d\u2019impact s\u00e9culaires|Aucune atmosph\u00e8re notable|Silence radio absolu']
    ];
    var n=1+Math.floor(r()*6);
    for(var i=0;i<n;i++){
      var t=T[Math.floor(r()*T.length)];
      var orb=72+i*46+r()*18;
      res.pl.push({nom:s0.des+' '+ROM[i],type:t[0],c1:t[1],c2:t[2],dp:t[3].split('|')[Math.floor(r()*3)],rad:6+r()*7,orb:orb,a:r()*6.2832,om:(0.028+0.05*r())/Math.sqrt(orb/72),rings:(t[0]==='G\u00e9ante gazeuse'&&r()<0.45),ua:(orb/60).toFixed(1),per:(1.4+i*1.9+r()*1.4).toFixed(1),sel:false});
    }
  }
  SYSG[si]=res;
  return res;
}
/* ===== Moteur procedurale des planetes v4 : rendu deterministe, 0 asset ===== */
var PLTEX={};
function pnoise(seed){
  var r=prng(seed),b=[],p=[],i,j,t;
  for(i=0;i<256;i++){b[i]=i;}
  for(i=255;i>0;i--){j=Math.floor(r()*(i+1));t=b[i];b[i]=b[j];b[j]=t;}
  for(i=0;i<512;i++){p[i]=b[i&255];}
  function gv(ix,iy){return p[(p[ix&255]+(iy&255))&255]/255;}
  return function(x,y){
    var x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0;
    fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
    var a=gv(x0,y0),b2=gv(x0+1,y0),c2=gv(x0,y0+1),d2=gv(x0+1,y0+1);
    return a+(b2-a)*fx+(c2-a)*fy+(a-b2-c2+d2)*fx*fy;
  };
}
function fbmN(seed,oct){
  var ns=[],i;
  for(i=0;i<oct;i++){ns.push(pnoise(seed*7349+i*101+13));}
  return function(x,y){
    var v=0,a=1,t=0,f=1,k;
    for(k=0;k<oct;k++){v+=ns[k](x*f,y*f)*a;t+=a;a*=0.5;f*=2;}
    return v/t;
  };
}
function ptypeCfg(type){
  if(type==='Oc\u00e9anique'){return {sea:0.6,ocn:[[10,44,64],[14,50,58],[8,38,54]],land:[[128,156,104],[92,128,84],[74,106,68],[118,144,96]],ice:0.35,iceK:1.4,crat:0.62,strata:0.22};}
  if(type==='Glaciaire'){return {sea:0.5,ocn:[[24,48,62],[20,42,56],[28,54,68]],land:[[150,168,180],[178,194,204],[204,216,224],[132,152,164]],ice:1,iceK:6,strata:0.18};}
  if(type==='D\u00e9sertique'){return {sea:2,ocn:[[0,0,0]],land:[[216,180,124],[198,154,98],[166,122,74],[228,200,152]],ice:0.15,iceK:0.5,strata:0.45};}
  if(type==='Volcanique'){return {sea:0.3,lava:true,ocn:[[0,0,0]],land:[[64,56,52],[92,82,76],[74,66,60],[108,98,90]],ice:0,iceK:0,strata:0.3};}
  if(type==='St\u00e9rile'){return {sea:2,ocn:[[0,0,0]],land:[[170,172,174],[134,137,140],[104,107,110],[152,154,156]],ice:0.08,iceK:0.4,strata:0.25,grey:true};}
  return {sea:0.51,ocn:[[18,52,70],[12,60,58],[26,46,86],[10,42,52],[40,42,66],[16,58,62]],land:[[188,168,138],[152,104,72],[120,100,88],[172,162,150]],ice:0.7,iceK:1,strata:0.3};
}
function genMap(seed,W,type){
  var cfg=ptypeCfg(type),r=prng(seed*2654435761+1234);
  var q=W/50,ck=cfg.crat||1,i;
  var fbm=fbmN(seed+11,5),fs=fbmN(seed+23,4),fg=fbmN(seed+37,3),fr=fbmN(seed+71,2),fw=fbmN(seed+53,4);
  var lob=pnoise(seed*13+5);
  var cr=[];
  for(i=0;i<12;i++){cr.push({x:r()*W,y:r()*W,rd:(35+r()*80)*(W/400)*ck,s:0.5+r()*0.3,ai:r()*97});}
  var oc=cfg.ocn[Math.floor(r()*cfg.ocn.length)];
  var hasIce=cfg.ice>0&&r()<cfg.ice;
  var iceT=(0.002+0.028*r())*W*(cfg.iceK||1);
  var capv=[],i2;
  for(i2=0;i2<=65;i2++){capv.push(lob(i2*0.37,7.7));}
  var out=new Uint8ClampedArray(W*W*4);
  var sea=cfg.sea,nw=sea>=2,x,y;
  for(y=0;y<W;y++){
    for(x=0;x<W;x++){
      var j=((y*W)+x)*4;
      var bg=fbm(x/q,y/q);
      var cont=0,near=0;
      for(i=0;i<12;i++){
        var c1=cr[i],dx=x-c1.x,dy=y-c1.y,d=Math.sqrt(dx*dx+dy*dy);
        var an=Math.atan2(dy,dx);
        var lb=0.35+1.1*lob(Math.cos(an)*7.5+c1.ai,Math.sin(an)*7.5+c1.ai);
        var v=c1.s*1.5*(1-d/(c1.rd*lb));
        if(v>cont){cont=v;}
        var nd=1-d/(c1.rd*2.2);
        if(nd>near){near=nd;}
      }
      var h=Math.max(cont,bg*(0.15+0.85*near));
      var cr2=0,cg2=0,cb2=0,glow=0;
      if(!nw&&h<=sea){
        if(cfg.lava){
          var dep=Math.max(0,Math.min(1,1-h/sea));
          var lk=0.25+0.75*dep;
          cr2=255*lk+40*(1-lk);cg2=90*lk+8*(1-lk);cb2=30*lk+10*(1-lk);
          glow=dep*0.9;
        }else{
          var dep2=Math.max(0,Math.min(1,(sea-h)/sea));
          var nap=1+0.08*(fw(x/q*1.4,y/q*1.4)-0.5)*2;
          var rid=1+0.05*(fs(x/q*5,y/q*5)-0.5)*2;
          var lum=(1.18-0.5*dep2)*nap*rid;
          cr2=oc[0]*lum;cg2=oc[1]*lum;cb2=oc[2]*lum;
        }
      }else{
        var e=nw?Math.min(1,h*0.95):Math.min(1,(h-sea)/Math.max(0.05,1-sea));
        var st=1+cfg.strata*(fs(x/q*2.2,y/q*2.2)-0.5)*2;
        var gn=1+0.12*(fg(x/(q*0.4),y/(q*0.4))-0.5)*2;
        var P=cfg.land,seg=e*(P.length-1),bi=Math.min(P.length-2,Math.floor(seg)),ft=seg-bi;
        var A=P[bi],B2=P[bi+1];
        var mm=st*gn*(cfg.grey?(0.8+0.4*fr(x/q*1.8,y/q*1.8)):1);
        cr2=(A[0]+(B2[0]-A[0])*ft)*mm;
        cg2=(A[1]+(B2[1]-A[1])*ft)*mm;
        cb2=(A[2]+(B2[2]-A[2])*ft)*mm;
      }
      if(hasIce&&iceT>0){
        var kn=x/W*64,kf=Math.floor(kn),kt=kn-kf;
        kt=kt*kt*(3-2*kt);
        var n01=capv[kf]*(1-kt)+capv[kf+1]*kt;
        var eN=iceT*(1+0.7*(n01-0.5)),eS=iceT*(0.9+0.7*(n01-0.5));
        var tN=(eN*1.3-y)/(eN*0.6),tS=(eS*1.3-(W-1-y))/(eS*0.6);
        var kI=Math.max(Math.min(1,1-tN),Math.min(1,1-tS));
        kI=Math.max(0,kI);
        if(kI>0){
          kI=kI*kI*(3-2*kI);
          cr2=cr2+(228-cr2)*kI;cg2=cg2+(240-cg2)*kI;cb2=cb2+(250-cb2)*kI;
          glow=glow*(1-kI);
        }
      }
      out[j]=Math.max(0,Math.min(255,cr2));
      out[j+1]=Math.max(0,Math.min(255,cg2));
      out[j+2]=Math.max(0,Math.min(255,cb2));
      out[j+3]=glow*255;
    }
  }
  return out;
}
function drawPlanet(cv,seed,size,type){
  var ctx=cv.getContext('2d');
  ctx.clearRect(0,0,size,size);
  var d=genMap(seed,size,type);
  var img=ctx.createImageData(size,size),o=img.data;
  var c=size/2,rad=c-2,x,y;
  for(y=0;y<size;y++){
    var ny=(y-c)/rad;
    for(x=0;x<size;x++){
      var nx=(x-c)/rad,rr=nx*nx+ny*ny,j=((y*size)+x)*4;
      if(rr>1){o[j+3]=0;continue;}
      var l=1-0.45*rr*rr*rr;
      var hi=1+0.24*Math.max(0,(-nx*0.7-ny*0.7))*(1-rr*0.55);
      var g=d[j+3]/255;
      var f=l*hi*(1-g)+(1.1+0.35*g)*g;
      o[j]=Math.min(255,d[j]*f);
      o[j+1]=Math.min(255,d[j+1]*f);
      o[j+2]=Math.min(255,d[j+2]*f);
      o[j+3]=255;
    }
  }
  ctx.putImageData(img,0,0);
  var halo=ctx.createRadialGradient(c,c,rad*0.97,c,c,rad*1.13);
  halo.addColorStop(0,'rgba(110,180,225,0)');
  halo.addColorStop(0.55,'rgba(110,180,225,.16)');
  halo.addColorStop(1,'rgba(110,180,225,0)');
  ctx.fillStyle=halo;
  ctx.beginPath();ctx.arc(c,c,rad*1.13,0,6.2832);ctx.fill();
  ctx.strokeStyle='rgba(190,225,255,.28)';ctx.lineWidth=Math.max(1,size/340);
  ctx.beginPath();ctx.arc(c,c,rad,0,6.2832);ctx.stroke();
}
function planetTex(seed,size,type){
  var k=seed+'_'+size+'_'+type;
  if(PLTEX[k]){return PLTEX[k];}
  var cv=document.createElement('canvas');cv.width=size;cv.height=size;
  drawPlanet(cv,seed,size,type);
  PLTEX[k]=cv.toDataURL();
  return PLTEX[k];
}
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
  +'#sysv .sxpoi{cursor:pointer}';
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
  var h='<div class="svhead"><div><b>'+esc(s.des)+'</b> \u00b7 classe '+s.cls+' \u00b7 '+esc(s.seg)+'<span class="svid">Vue syst\u00e8me</span></div><button type="button" id="sv-close" class="btn ghost sm">\u2190 Atlas</button></div>';
  h+='<div class="svbody"><div class="svmap"><svg id="sv-svg" viewBox="0 0 1000 1000">';
  h+='<defs><radialGradient id="sv-star"><stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="'+s.col+'"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></radialGradient>';
  sg.pl.forEach(function(p,i){h+='<radialGradient id="sv-p'+i+'" cx="35%" cy="30%"><stop offset="0%" stop-color="'+p.c1+'"/><stop offset="100%" stop-color="'+p.c2+'"/></radialGradient>';});
  h+='</defs>';
  h+='<circle cx="500" cy="500" r="36" fill="url(#sv-star)"/>';
  sg.pl.forEach(function(p){h+='<circle cx="500" cy="500" r="'+p.orb.toFixed(0)+'" fill="none" stroke="#2ee6c9" stroke-opacity="0.16"/>';});
  sg.pl.forEach(function(p,i){
    var prd=p.rad.toFixed(1);
    h+='<g class="plg" data-i="'+i+'">';
    if(p.type==='G\u00e9ante gazeuse'){
      h+='<circle class="plc" r="'+prd+'" fill="url(#sv-p'+i+')" stroke="#02060d" stroke-opacity=".5" stroke-width="1"/>';
    }else{
      h+='<image href="'+planetTex(sg.star.si*97+i*31+7,96,p.type)+'" x="'+(-p.rad).toFixed(1)+'" y="'+(-p.rad).toFixed(1)+'" width="'+(p.rad*2).toFixed(1)+'" height="'+(p.rad*2).toFixed(1)+'"/><circle class="plc" r="'+prd+'" fill="none" stroke="#02060d" stroke-opacity=".5" stroke-width="1"/>';
    }
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
  el.innerHTML='<h3>\u2b50 '+esc(s.des)+'</h3><span class="badge">classe '+esc(s.cls)+'</span>'
   +'<p class="pv" style="margin-top:10px">Syst\u00e8me de '+sg.pl.length+' plan\u00e8te'+(sg.pl.length>1?'s':'')+' \u00b7 '+esc(s.seg)+' \u00b7 Secteur '+segGrid(s.x,s.y)+' \u00b7 '+segSub(s.x,s.y)+'</p>'
   +(s.note?'<p class="pv" style="margin-top:6px"><i>'+esc(s.note)+'</i></p>':'')
   +'<div class="pl">Plan\u00e8tes</div>';
  var h2='';
  sg.pl.forEach(function(p,i){
    h2+='<button class="btn ghost sm svstar" data-i="'+i+'" type="button" style="display:flex;align-items:center;justify-content:space-between;width:100%;margin:0 0 6px 0;text-align:left">'
     +'<span style="display:inline-flex;align-items:center"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+p.c1+';margin-right:8px"></span>'
     +esc(p.nom)+' \u00b7 '+esc(p.type)+'</span><span style="opacity:.7">'+p.ua+' UA</span></button>';
  });
  el.innerHTML+=h2+'<p class="pv" style="margin-top:8px">Cliquez une plan\u00e8te pour l\u2019examiner.</p>';
  Array.prototype.forEach.call(el.querySelectorAll('.svstar'),function(b){
    b.addEventListener('click',function(){sysSel(sg,parseInt(b.getAttribute('data-i'),10));});
  });
}
function sysInfo(sg){
  var el=$('g-panel');if(!el){return;}
  var p=null;sg.pl.forEach(function(x){if(x.sel){p=x;}});
  if(!p){sysStar(sg);return;}
  var idx=sg.pl.indexOf(p);
  el.innerHTML='<h3>\uD83E\uDE90 '+esc(p.nom)+'</h3><span class="badge">'+esc(p.type)+'</span>'
   +'<p class="pv" style="margin-top:10px">'+esc(p.dp)+'.</p>'
   +'<div class="pl">Donn\u00e9es orbitales</div>'
   +'<p class="pv">Distance \u00e0 l\u2019\u00e9toile : '+p.ua+' UA \u00b7 P\u00e9riode : '+p.per+' ans</p>'
   +(p.rings?'<p class="pv">Syst\u00e8me d\u2019anneaux \u00e9tendu</p>':'')
   +'<div class="cta-row" style="justify-content:flex-start;margin-top:10px">'
   +'<button class="btn ghost sm" id="sv-back" type="button">\u2190 Syst\u00e8me</button></div>';
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
  el.innerHTML='<h3 style="margin:.1em 0 .3em">\uD83E\uDE90 '+esc(p.nom)+'</h3><span class="badge">'+esc(p.type)+'</span>'
   +'<p class="pv" style="margin-top:10px">'+esc(p.dp)+'.</p>'
   +'<div class="pl">Donn\u00e9es orbitales</div>'
   +'<p class="pv">Distance \u00e0 l\u2019\u00e9toile : '+p.ua+' UA \u00b7 P\u00e9riode : '+p.per+' ans</p>'
   +(p.rings?'<p class="pv">Syst\u00e8me d\u2019anneaux \u00e9tendu</p>':'')
   +'<div class="pl">Points d\u2019int\u00e9r\u00eat</div>';
  if(SYSXPOI){
    el.innerHTML+='<p class="pv"><b>\uD83D\uDCCD '+esc(SYSXPOI.nom)+'</b></p><p class="pv" style="margin-top:6px">'+esc(SYSXPOI.desc)+'</p>';
  }else{
    el.innerHTML+='<p class="pv">Cliquez un rep\u00e8re sur le globe pour l\u2019examiner ('+p.pois.length+' d\u00e9tect\u00e9s).</p>';
  }
  el.innerHTML+='<div class="cta-row" style="justify-content:flex-start;margin-top:10px">'
   +'<button class="btn ghost sm" id="sx-back" type="button">\u2190 Syst\u00e8me</button></div>';
  $('sx-back').addEventListener('click',function(){SYSXP=-1;SYSXPOI=null;sg.pl.forEach(function(x){x.sel=false;});openSys(sg.star.si);});
}
function sysExplore(sg,i){
  if(window._sxRaf){cancelAnimationFrame(window._sxRaf);window._sxRaf=null;}
  SYSXP=i;SYSXPOI=null;
  var p=sg.pl[i];
  if(!p.pois){
    var rp=prng(sg.star.si*97+i*13+5);
    var XN=['Ruines cyclop\u00e9ennes','\u00c9pave d\u2019un vaisseau','Signal intermittent','Anomalie \u00e9nerg\u00e9tique','Crat\u00e8re d\u2019impact','Structure m\u00e9tallique','Balise silencieuse','R\u00e9seau souterrain','Station abandonn\u00e9e','Source thermique'];
    var XD=['Des traces d\u2019une civilisation oubli\u00e9e affleurent sous la poussi\u00e8re.','La coque bris\u00e9e d\u00e9rive ici depuis des si\u00e8cles ; personne n\u2019a jamais os\u00e9 y p\u00e9n\u00e9trer.','Un signal r\u00e9p\u00e9titif bat au rythme des mar\u00e9es magn\u00e9tiques.','Les capteurs saturent \u00e0 l\u2019approche : quelque chose rayonne sous la cro\u00fbte.','Un impact ancien a cristallis\u00e9 le sol en une dentelle noire.','Des angles trop parfaits pour \u00eatre naturels d\u00e9passent du relief.','Elle \u00e9mettait encore il y a peu ; d\u00e9sormais, silence radio.','Des cavit\u00e9s karstiques s\u2019\u00e9tendent sous la surface, id\u00e9al pour se cacher.','Les sas sont scell\u00e9s de l\u2019int\u00e9rieur.','Un panache chaud trahit une activit\u00e9 g\u00e9ologique r\u00e9cente.'];
    var n=3+Math.floor(rp()*4);
    p.pois=[];
    for(var k=0;k<n;k++){
      var an=rp()*6.2832,rr=90+rp()*190;
      p.pois.push({nom:XN[Math.floor(rp()*XN.length)],desc:XD[Math.floor(rp()*XD.length)],x:500+Math.cos(an)*rr,y:500+Math.sin(an)*rr*0.96});
    }
  }
  var ov=$('sysv');
  var h='<div class="svhead"><div><b>'+esc(p.nom)+'</b> \u00b7 '+esc(p.type)+'<span class="svid">Vue plan\u00e8te</span></div><button type="button" id="sv-close" class="btn ghost sm">\u2190 Atlas</button></div>';
  h+='<div class="svbody"><div class="svmap"><svg id="sv-svg" viewBox="0 0 1000 1000">';
  h+='<defs><clipPath id="svx-c"><circle cx="500" cy="500" r="300"/></clipPath>'
   +'<radialGradient id="svx-g" cx="38%" cy="32%"><stop offset="0%" stop-color="'+p.c1+'"/><stop offset="100%" stop-color="'+p.c2+'"/></radialGradient>'
   +'<radialGradient id="svx-s"><stop offset="70%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,.45)"/></radialGradient></defs>';
  h+='<circle cx="500" cy="500" r="300" fill="url(#svx-g)"/>';
  h+='<g id="svx-t" clip-path="url(#svx-c)">';
  var r2=prng(sg.star.si*31+i*7+3);
  if(p.type==='G\u00e9ante gazeuse'){
    for(var b=0;b<7;b++){var by=200+b*80+(r2()*30-15);h+='<rect x="200" y="'+by.toFixed(0)+'" width="600" height="'+(24+r2()*34).toFixed(0)+'" fill="'+(b%2?p.c2:'#b8925f')+'" fill-opacity="'+(0.25+r2()*0.3).toFixed(2)+'"/>';}
  }else{
    h+='<image href="'+planetTex(sg.star.si*97+i*31+7,512,p.type)+'" x="200" y="200" width="600" height="600" preserveAspectRatio="none"/>';
  }
  h+='</g>';
  h+='<g clip-path="url(#svx-c)" stroke="#2ee6c9" stroke-opacity=".14" fill="none">';
  for(var c2=1;c2<6;c2++){h+='<line x1="'+(200+c2*100)+'" y1="200" x2="'+(200+c2*100)+'" y2="800"/><line x1="200" y1="'+(200+c2*100)+'" x2="800" y2="'+(200+c2*100)+'"/>';}
  h+='</g>';
  h+='<circle cx="500" cy="500" r="300" fill="url(#svx-s)"/>';
  h+='<circle cx="500" cy="500" r="300" fill="none" stroke="#2ee6c9" stroke-opacity=".35"/>';
  if(p.rings){h+='<ellipse cx="500" cy="500" rx="440" ry="120" fill="none" stroke="#e8d9b0" stroke-opacity=".4" transform="rotate(-18 500 500)"/>';}
  p.pois.forEach(function(q8,pi){
    h+='<g class="sxpoi" data-i="'+pi+'" data-sg="'+sg.star.si+'"><circle cx="'+q8.x.toFixed(0)+'" cy="'+q8.y.toFixed(0)+'" r="9" fill="#2ee6c9" fill-opacity=".9"/><circle cx="'+q8.x.toFixed(0)+'" cy="'+q8.y.toFixed(0)+'" r="15" fill="none" stroke="#2ee6c9" stroke-opacity=".5"/><title>'+esc(q8.nom)+'</title></g>';
  });
  h+='</svg></div></div>';
  ov.innerHTML=h;
  ov.style.display='';
  $('sv-close').addEventListener('click',closeSys);
  $('sv-close').textContent='← '+(AMODE?'Atlas':'Carte');
  Array.prototype.forEach.call(ov.querySelectorAll('.sxpoi'),function(el){
    el.addEventListener('click',function(ev){ev.stopPropagation();
      var pi2=parseInt(el.getAttribute('data-i'),10);
      SYSXPOI=p.pois[pi2];
      Array.prototype.forEach.call(ov.querySelectorAll('.sxpoi circle'),function(c3){c3.setAttribute('fill','#2ee6c9');});
      var dc=el.querySelector('circle');if(dc){dc.setAttribute('fill','#f0b24a');}
      sysXInfo(sg);
    });
  });
  sysXInfo(sg);
  if(p.type!=='G\u00e9ante gazeuse'){
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
  SYSV=null;SYSXP=-1;SYSXPOI=null;
  var ov=$('sysv');if(ov){ov.style.display='none';ov.innerHTML='';}
  renderPanel();
}

function legRender(){
  var p=SKP[SKIN],d=$('leg-drop');
  if(AMODE){
    d.innerHTML='<span><i style="background:#dfe8ff"></i>Champ stellaire · '+genStars().length+' étoiles</span><span><i style="background:none;border:0"></i>Clic sur une \u00e9toile : syst\u00e8me</span><span id="leg-sec">Secteur : \u2014</span>';
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
  $('g-search').placeholder=AMODE?'🔎 Chercher un monde, une zone, une anomalie...':'\\uD83D\\uD0E Chercher un système, une planète...';
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
