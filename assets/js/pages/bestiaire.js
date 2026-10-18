var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var BEASTS=[],FILTER='tous',Q='',GALS=[],WC=null,WC_DONE=false;
var RT_ON=false;
function $(id){return document.getElementById(id);}
function hdr(extra){var h={'apikey':SBK,'Authorization':'Bearer '+SBK};if(extra){for(var k in extra){h[k]=extra[k];}}return h;}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function norm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();}
var FACC={};
function facColor(f){
 if(FACC[f]){return FACC[f];}
 var fixed={'necrons':'#2ee6c9','hommes':'#f0b24a','imperium':'#e2604f','aeldari':'#b18cf0','orks':'#7ec14f','tyranides':'#a83ba8','chaos':'#c2454f'};
 var kk=norm(f);
 if(fixed[kk]){FACC[f]=fixed[kk];return FACC[f];}
 var h=0;for(var i=0;i<kk.length;i++){h=(h*31+kk.charCodeAt(i))%360;}
 FACC[f]='hsl('+h+',65%,62%)';
 return FACC[f];
}
function campLabel(c){if(c==='ennemi'){return 'Ennemi';}if(c==='allie'){return 'Allié';}if(c==='neutre'){return 'Neutre';}return c||'?';}
function campBadge(c){var cls=c==='ennemi'?'enemy':(c==='allie'?'ally':'neutral');return '<span class="badge '+cls+'">'+esc(campLabel(c))+'</span>';}
function setStatus(t,err){var s=$('b-status');s.textContent=t;s.className=err?'err':'';}
function load(){
 setStatus('Chargement du bestiaire…');
 fetch(SB+'bestiaire?select=*&order=nom.asc',{headers:hdr()})
  .then(function(r){if(!r.ok){throw new Error('http '+r.status);}return r.json();})
  .then(function(list){
   BEASTS=list||[];buildFactions();render();
   setStatus(BEASTS.length===0?'Aucune créature recensée pour l\'instant — le MJ les crée depuis la console Bestiaire de sa Zone MJ.':BEASTS.length+' créature(s) dans la base partagée.'+(RT_ON?' \uD83D\uDD02 en direct':''));
   if(WC&&!WC_DONE){WC_DONE=true;
    $('beasts').scrollIntoView({behavior:'smooth'});
   }
  })
  .catch(function(){BEASTS=[];buildFactions();render();setStatus('Base inaccessible — vérifiez votre connexion internet.',true);});
}
function buildFactions(){
 var box=$('f-subnav');
 var seen={},names=[];
 BEASTS.forEach(function(b){var f=b.faction||'—';if(!seen[f]){seen[f]=1;names.push(f);}});
 names.sort(function(a,b){return a.localeCompare(b);});
 var out='';
 names.forEach(function(f){out+='<button type="button" data-f="'+esc(f)+'"'+(FILTER===f?' class="active"':'')+'><span class="fdot" style="background:'+facColor(f)+'"></span>'+esc(f)+'</button>';});
 out+='<button type="button" data-f="tous"'+(FILTER==='tous'?' class="active"':'')+'>Tous</button>';
 out+='<a href="#recherche"><span class="pe-star"></span> Recherche</a>';
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
  .then(function(l){GALS=l||[];render();})
  .catch(function(){GALS=[];});
}
function render(){
 var out='';
 var seen={};
 GALS.forEach(function(g){(((g.data||{}).creatures)||[]).forEach(function(c){var kk=norm(c);(seen[kk]=seen[kk]||[]).push(g.nom);});});
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
  out='<div class="tscroll"><table class="rt mini beasts"><tr>'
   +'<th>Créature</th><th>M</th><th>CC</th><th>CT</th><th>F</th><th>E</th><th>PV</th><th>A</th><th>Cd</th><th>Svg</th><th>Rfx</th></tr>';
  var k=0;
  list.forEach(function(b){
   var st=(b.data&&b.data.st)||{};
   var armes=(b.data&&b.data.armes)||[];
   var notes=(b.data&&b.data.notes)||'';
   var sv=seen[norm(b.nom)]||[];
   k++;
   var cells=['m','cc','ct','f','e','pv','a','cd','sv','rfx'].map(function(kk){return '<td>'+(esc(st[kk])||'\u2014')+'</td>';}).join('');
   var nomHtml=(notes||sv.length)?'<span class="bname" role="button" tabindex="0" data-i="'+k+'" aria-expanded="false"><b>'+esc(b.nom)+'</b><span class="chev" aria-hidden="true">\u25B8</span></span>':'<b>'+esc(b.nom)+'</b>';
   out+='<tr class="brow"><td class="nomcell" style="border-left:3px solid '+facColor(b.faction||'')+'">'+nomHtml+' '+campBadge(b.camp)+'</td>'+cells+'</tr>';
   if(armes.length){
    out+='<tr class="subrow"><td colspan="11"><span class="bsub">'+armes.map(esc).join(' \u00B7 ')+'</span></td></tr>';
   }
   if(notes||sv.length){
    out+='<tr class="descrow" data-i="'+k+'" hidden><td colspan="11"><div class="bdesc">'+(notes?'<div class="bnotes">'+esc(notes)+'</div>':'')+(sv.length?'<div class="bseen">Rep\u00e9r\u00e9e sur la carte : '+sv.map(esc).join(' \u00B7 ')+'</div>':'')+'</div></td></tr>';
   }
  });
  out+='</table></div>';
 }
 $('beasts').innerHTML=out;
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
