var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var BEASTS=[],FILTER='tous',Q='',GALS=[],WC=null,WC_DONE=false;
function $(id){return document.getElementById(id);}
function hdr(extra){var h={'apikey':SBK,'Authorization':'Bearer '+SBK};if(extra){for(var k in extra){h[k]=extra[k];}}return h;}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function norm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();}
function campLabel(c){if(c==='ennemi'){return 'Ennemi';}if(c==='allie'){return 'Allié';}if(c==='neutre'){return 'Neutre';}return c||'?';}
function campBadge(c){var cls=c==='ennemi'?'enemy':(c==='allie'?'ally':'neutral');return '<span class="badge '+cls+'">'+esc(campLabel(c))+'</span>';}
function setStatus(t,err){var s=$('b-status');s.textContent=t;s.className=err?'err':'';}
function load(){
  setStatus('Chargement du bestiaire…');
  fetch(SB+'bestiaire?select=*&order=nom.asc',{headers:hdr()})
    .then(function(r){if(!r.ok){throw new Error('http '+r.status);}return r.json();})
    .then(function(list){
      BEASTS=list||[];buildFactions();render();renderSightings();
      setStatus(BEASTS.length===0?'Aucune créature recensée pour l\'instant — le MJ les crée depuis la console Bestiaire de sa Zone MJ.':BEASTS.length+' créature(s) dans la base partagée.');
      if(WC&&!WC_DONE){WC_DONE=true;
        var hit=false;BEASTS.forEach(function(b){if(!hit&&norm(b.nom)===norm(WC)){hit=true;}});
        if(hit){$('beasts').scrollIntoView({behavior:'smooth'});}
        else{$('sightings').scrollIntoView({behavior:'smooth'});}
      }
    })
    .catch(function(){BEASTS=[];buildFactions();render();renderSightings();setStatus('Base inaccessible — vérifiez votre connexion internet.',true);});
}
function buildFactions(){
  var box=$('f-subnav');
  var seen={},names=[];
  BEASTS.forEach(function(b){var f=b.faction||'—';if(!seen[f]){seen[f]=1;names.push(f);}});
  names.sort(function(a,b){return a.localeCompare(b);});
  var out='';
  names.forEach(function(f){out+='<button type="button" data-f="'+esc(f)+'"'+(FILTER===f?' class="active"':'')+'>'+esc(f)+'</button>';});
  out+='<a href="#recherche">🔎 Recherche</a>';
  out+='<button type="button" data-f="tous" class="tous"'+(FILTER==='tous'?' active':'')+'>Tous</button>';
  box.innerHTML=out;
  Array.prototype.forEach.call(box.querySelectorAll('button[data-f]'),function(btn){
    btn.addEventListener('click',function(){
      FILTER=btn.getAttribute('data-f');
      Array.prototype.forEach.call(box.querySelectorAll('button'),function(x){x.classList.remove('active');});
      btn.classList.add('active');
      render();
    });
  });
  var rl=box.querySelector('a[href="#recherche"]');
  if(rl){rl.addEventListener('click',function(){setTimeout(function(){var i=$('b-search');if(i){i.focus();}},350);});}
  try{window.dispatchEvent(new Event('resize'));}catch(e){}
}
function loadGals(){
  fetch(SB+'galaxie?select=*&order=nom.asc',{headers:hdr()})
    .then(function(r){if(!r.ok){throw new Error('http '+r.status);}return r.json();})
    .then(function(l){GALS=l||[];renderSightings();})
    .catch(function(){var st=$('s-status');st.textContent='Signalements de la carte indisponibles — vérifiez votre connexion.';st.className='err';});
}
function render(){
  var out='';
  var list=BEASTS.filter(function(b){
    if(FILTER!=='tous'&&b.faction!==FILTER){return false;}
    if(Q){var hay=((b.nom||'')+' '+(b.camp||'')+' '+(b.faction||'')+' '+JSON.stringify(b.data||{})).toLowerCase();if(hay.indexOf(Q)<0){return false;}}
    return true;
  });
  if(list.length===0){
    out='<div class="empty-box">Aucune créature ne correspond'+(Q?' à cette recherche':'')+'.';
    if(BEASTS.length===0){out+=' Le MJ peut en créer depuis la console Bestiaire de sa Zone MJ.';}
    out+='</div>';
  }else{
    out='<div class="grid3">';
    list.forEach(function(b){
      var st=(b.data&&b.data.st)||{};
      var armes=(b.data&&b.data.armes)||[];
      var notes=(b.data&&b.data.notes)||'';
      out+='<div class="card beast-card">'
        +'<h3>'+esc(b.nom)+'</h3>'+campBadge(b.camp)+'<span class="fac">'+esc(b.faction||'')+'</span>'
        +'<div class="tscroll"><table class="rt mini"><tr>'
        +'<th>M</th><th>CC</th><th>CT</th><th>F</th><th>E</th><th>PV</th><th>A</th><th>Cd</th><th>Svg</th><th>Rfx</th></tr><tr>'
        +'<td>'+(esc(st.m)||'—')+'</td><td>'+(esc(st.cc)||'—')+'</td><td>'+(esc(st.ct)||'—')+'</td><td>'+(esc(st.f)||'—')+'</td><td>'+(esc(st.e)||'—')+'</td>'
        +'<td>'+(esc(st.pv)||'—')+'</td><td>'+(esc(st.a)||'—')+'</td><td>'+(esc(st.cd)||'—')+'</td><td>'+(esc(st.sv)||'—')+'</td><td>'+(esc(st.rfx)||'—')+'</td>'
        +'</tr></table></div>';
      if(armes.length){out+='<ul class="armeslist">'+armes.map(function(a){return '<li>'+esc(a)+'</li>';}).join('')+'</ul>';}
      if(notes){out+='<p class="beast-notes">'+esc(notes)+'</p>';}
      out+='</div>';
    });
    out+='</div>';
  }
  $('beasts').innerHTML=out;
}
function renderSightings(){
  var box=$('s-list'),st=$('s-status');
  var byNom={};BEASTS.forEach(function(b){byNom[norm(b.nom)]=b;});
  var out='',count=0,sysn=0;
  GALS.forEach(function(g){
    var cre=((g.data||{}).creatures)||[];
    if(!cre.length){return;}
    sysn++;count+=cre.length;
    out+='<h3 class="syshead">'+esc(g.nom)+'</h3><div class="crea-tags">';
    cre.forEach(function(c){
      var b=byNom[norm(c)];
      var hit=(WC&&norm(c)===norm(WC))?' hit':'';
      if(b){out+='<a class="crea-tag ok'+hit+'" href="#" data-nom="'+esc(b.nom)+'">'+esc(c)+'</a>';}
      else{out+='<span class="crea-tag off'+hit+'" title="Pas encore de fiche — première rencontre à venir">'+esc(c)+'</span>';}
    });
    out+='</div>';
  });
  if(!out){out='<div class="empty-box">Aucune créature signalée sur la carte pour l\'instant. Le MJ les note système par système depuis la console Carte de sa Zone MJ.</div>';st.textContent='';}
  else{st.textContent=count+' signalement'+(count>1?'s':'')+' sur '+sysn+' système'+(sysn>1?'s':'')+' de la carte.';}
  st.className='';
  box.innerHTML=out;
  Array.prototype.forEach.call(box.querySelectorAll('a.crea-tag'),function(a){
    a.addEventListener('click',function(ev){
      ev.preventDefault();
      var nom=a.getAttribute('data-nom');
      Q=nom.toLowerCase();$('b-search').value=nom;render();
      $('beasts').scrollIntoView({behavior:'smooth'});
    });
  });
}
$('b-refresh').addEventListener('click',function(){load();loadGals();});
$('b-search').addEventListener('input',function(){Q=this.value.trim().toLowerCase();render();});
try{WC=new URLSearchParams(location.search).get('c');}catch(e){WC=null;}
if(WC){Q=WC.toLowerCase();$('b-search').value=WC;}
load();loadGals();
