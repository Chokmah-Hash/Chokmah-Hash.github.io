var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var BEASTS=[],FILTER='tous',Q='',GALS=[],WC=null,WC_DONE=false;
var RT_ON=false;
function $(id){return document.getElementById(id);}
function hdr(extra){var h={'apikey':SBK,'Authorization':'Bearer '+SBK};if(extra){for(var k in extra){h[k]=extra[k];}}return h;}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function norm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();}
function campLabel(c){if(c==='ennemi'){return 'Ennemi';}if(c==='allie'){return 'AlliÃ©';}if(c==='neutre'){return 'Neutre';}return c||'?';}
function campBadge(c){var cls=c==='ennemi'?'enemy':(c==='allie'?'ally':'neutral');return '<span class="badge '+cls+'">'+esc(campLabel(c))+'</span>';}
function setStatus(t,err){var s=$('b-status');s.textContent=t;s.className=err?'err':'';}
function load(){
  setStatus('Chargement du bestiaireâ¦');
  fetch(SB+'bestiaire?select=*&order=nom.asc',{headers:hdr()})
    .then(function(r){if(!r.ok){throw new Error('http '+r.status);}return r.json();})
    .then(function(list){
      BEASTS=list||[];buildFactions();render();renderSightings();
      setStatus(BEASTS.length===0?'Aucune crÃ©ature recensÃ©e pour l\'instant â le MJ les crÃ©e depuis la console Bestiaire de sa Zone MJ.':BEASTS.length+' crÃ©ature(s) dans la base partagÃ©e.'+(RT_ON?' \uD83D\uDD02 en direct':''));
      if(WC&&!WC_DONE){WC_DONE=true;
        var hit=false;BEASTS.forEach(function(b){if(!hit&&norm(b.nom)===norm(WC)){hit=true;}});
        if(hit){$('beasts').scrollIntoView({behavior:'smooth'});}
        else{$('sightings').scrollIntoView({behavior:'smooth'});}
      }
    })
    .catch(function(){BEASTS=[];buildFactions();render();renderSightings();setStatus('Base inaccessible â vÃ©rifiez votre connexion internet.',true);});
}
function buildFactions(){
  var box=$('f-subnav');
  var seen={},names=[];
  BEASTS.forEach(function(b){var f=b.faction||'â';if(!seen[f]){seen[f]=1;names.push(f);}});
  names.sort(function(a,b){return a.localeCompare(b);});
  var out='';
  names.forEach(function(f){out+='<button type="button" data-f="'+esc(f)+'"'+(FILTER===f?' class="active"':'')+'>'+esc(f)+'</button>';});
  out+='<button type="button" data-f="tous"'+(FILTER==='tous'?' class="active"':'')+'>Tous</button>';
  out+='<a href="#recherche">ð Recherche</a>';
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
    .catch(function(){var st=$('s-status');st.textContent='Signalements de la carte indisponibles â vÃ©rifiez votre connexion.';st.className='err';});
}
function render(){
  var out='';
  var list=BEASTS.filter(function(b){
    if(FILTER!=='tous'&&b.faction!==FILTER){return false;}
    if(Q){var hay=((b.nom||'')+' '+(b.camp||'')+' '+(b.faction||'')+' '+JSON.stringify(b.data||{})).toLowerCase();if(hay.indexOf(Q)<0){return false;}}
    return true;
  });
  if(list.length===0){
    out='<div class="empty-box">Aucune crÃ©ature ne correspond'+(Q?' Ã  cette recherche':'')+'.';
    if(BEASTS.length===0){out+=' Le MJ peut en crÃ©er depuis la console Bestiaire de sa Zone MJ.';}
    out+='</div>';
  }else{
    out='<div class="tscroll"><table class="rt mini beasts"><tr>'
      +'<th>CrÃ©ature</th><th>M</th><th>CC</th><th>CT</th><th>F</th><th>E</th><th>PV</th><th>A</th><th>Cd</th><th>Svg</th><th>Rfx</th></tr>';
    var k=0;
    list.forEach(function(b){
      var st=(b.data&&b.data.st)||{};
      var armes=(b.data&&b.data.armes)||[];
      var notes=(b.data&&b.data.notes)||'';
      k++;
      var cells=['m','cc','ct','f','e','pv','a','cd','sv','rfx'].map(function(kk){return '<td>'+(esc(st[kk])||'\u2014')+'</td>';}).join('');
      var nomHtml=notes?'<span class="bname" role="button" tabindex="0" data-i="'+k+'" aria-expanded="false"><b>'+esc(b.nom)+'</b><span class="chev" aria-hidden="true">\u25B8</span></span>':'<b>'+esc(b.nom)+'</b>';
      out+='<tr class="brow"><td class="nomcell">'+nomHtml+' '+campBadge(b.camp)+' <span class="fac">'+esc(b.faction||'')+'</span></td>'+cells+'</tr>';
      if(armes.length){
        out+='<tr class="subrow"><td colspan="11"><span class="bsub">'+armes.map(esc).join(' \u00B7 ')+'</span></td></tr>';
      }
      if(notes){
        out+='<tr class="descrow" data-i="'+k+'" hidden><td colspan="11"><div class="bdesc">'+esc(notes)+'</div></td></tr>';
      }
    });
    out+='</table></div>';
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
      else{out+='<span class="crea-tag off'+hit+'" title="Pas encore de fiche â premiÃ¨re rencontre Ã  venir">'+esc(c)+'</span>';}
    });
    out+='</div>';
  });
  if(!out){out='<div class="empty-box">Aucune crÃ©ature signalÃ©e sur la carte pour l\'instant. Le MJ les note systÃ¨me par systÃ¨me depuis la console Carte de sa Zone MJ.</div>';st.textContent='';}
  else{st.textContent=count+' signalement'+(count>1?'s':'')+' sur '+sysn+' systÃ¨me'+(sysn>1?'s':'')+' de la carte.';}
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
$('beasts').addEventListener('click',function(ev){
  var el=ev.target;
  while(el&&el!==this&&!el.classList.contains('bname')){el=el.parentElement;}
  if(!el||el===this||!el.classList.contains('bname')){return;}
  var i=el.getAttribute('data-i');
  var d=this.querySelector('tr.descrow[data-i="'+i+'"]');
  if(!d){return;}
  var open=!d.hidden;
  d.hidden=open;
  el.setAttribute('aria-expanded',String(!open));
  if(open){el.classList.remove('open');}else{el.classList.add('open');}
});
$('beasts').addEventListener('keydown',function(ev){
  if(ev.key!=='Enter'&&ev.key!==' '){return;}
  if(!ev.target.classList||!ev.target.classList.contains('bname')){return;}
  ev.preventDefault();ev.target.click();
});
$('b-refresh').addEventListener('click',function(){load();loadGals();});
$('b-search').addEventListener('input',function(){Q=this.value.trim().toLowerCase();render();});
try{WC=new URLSearchParams(location.search).get('c');}catch(e){WC=null;}
if(WC){Q=WC.toLowerCase();$('b-search').value=WC;}
load();loadGals();
var RTD=null;
function rtInit(){
  try{
    if(typeof supabase==="undefined"||!supabase.createClient){return;}
    var rtu=(typeof SB!=="undefined"&&String(SB).indexOf("/rest")>0)?String(SB).slice(0,String(SB).indexOf("/rest")):((typeof SB!=="undefined")?String(SB):"https://dnbnkdakmobufqcrqzpq.supabase.co");
    var rtk=(typeof SBK!=="undefined")?String(SBK).replace("Bearer ",""):"sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov";
    var c=supabase.createClient(rtu,rtk,{realtime:{params:{eventsPerSecond:2}}});
    var ch=c.channel("bestiaire-live");
    ch.on("postgres_changes",{event:"*",schema:"public",table:"bestiaire"},function(){
      clearTimeout(RTD);RTD=setTimeout(function(){load();loadGals();},800);
    });
    ch.subscribe(function(st){
      RT_ON=(st==="SUBSCRIBED");
      setStatus(BEASTS.length===0?"Aucune cr\u00e9ature recens\u00e9e pour l'instant \u2014 le MJ les cr\u00e9e depuis la console Bestiaire de sa Zone MJ.":BEASTS.length+" cr\u00e9ature(s) dans la base partag\u00e9e."+(RT_ON?" \uD83D\uDD02 en direct":""));
    });
  }catch(e){RT_ON=false;}
}
rtInit();
