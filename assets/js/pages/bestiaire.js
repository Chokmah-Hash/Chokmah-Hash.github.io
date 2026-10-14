
var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var BEASTS=[],FILTER='tous',Q='';
function $(id){return document.getElementById(id);}
function hdr(key,extra){var h={};h['apikey']=SBK;h['Authorization']='Bearer '+SBK;if(key){h['x-mj-key']=key;}if(extra){for(var k in extra){h[k]=extra[k];}}return h;}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function campLabel(c){if(c==='ennemi'){return 'Ennemi';}if(c==='allie'){return 'Allié';}if(c==='neutre'){return 'Neutre';}return c||'?';}
function campBadge(c){var cls=c==='ennemi'?'enemy':(c==='allie'?'ally':'neutral');return '<span class="badge '+cls+'">'+esc(campLabel(c))+'</span>';}
function setStatus(t,err){var s=$('b-status');s.textContent=t;s.className=err?'err':'';}
function load(){
  setStatus('Chargement du bestiaire…');
  fetch(SB+'bestiaire?select=*&order=nom.asc',{headers:hdr()})
    .then(function(r){if(!r.ok){throw new Error('http '+r.status);}return r.json();})
    .then(function(list){BEASTS=list||[];render();
      setStatus(BEASTS.length===0?'Aucune créature recensée pour l\'instant — le MJ peut en ajouter ci-dessous.':BEASTS.length+' créature(s) dans la base partagée.');})
    .catch(function(){BEASTS=[];render();setStatus('Base inaccessible — vérifiez votre connexion internet.',true);});
}
function render(){
  var out='';
  var list=BEASTS.filter(function(b){
    if(FILTER!=='tous'&&b.camp!==FILTER){return false;}
    if(Q){
      var hay=((b.nom||'')+' '+(b.camp||'')+' '+JSON.stringify(b.data||{})).toLowerCase();
      if(hay.indexOf(Q)<0){return false;}
    }
    return true;
  });
  if(list.length===0){
    out='<div class="empty-box">Aucune créature ne correspond'+(Q?' à cette recherche':'')+'.';
    if(BEASTS.length===0){out+=' Le MJ peut ouvrir la gestion ci-dessous pour créer la première entrée.';}
    out+='</div>';
  }else{
    out='<div class="grid3">';
    list.forEach(function(b){
      var st=(b.data&&b.data.st)||{};
      var armes=(b.data&&b.data.armes)||[];
      var notes=(b.data&&b.data.notes)||'';
      out+='<div class="card beast-card">'
        +'<button type="button" class="edit-btn" data-edit="'+esc(b.nom)+'" title="Charger dans la gestion">✎</button>'
        +'<h3>'+esc(b.nom)+'</h3>'+campBadge(b.camp)
        +'<div class="tscroll"><table class="rt mini"><tr>'
        +'<th>M</th><th>CC</th><th>CT</th><th>F</th><th>E</th><th>PV</th><th>A</th><th>Cd</th><th>Svg</th><th>Rfx</th></tr><tr>'
        +'<td>'+(esc(st.m)||'—')+'</td>'
        +'<td>'+(esc(st.cc)||'—')+'</td>'
        +'<td>'+(esc(st.ct)||'—')+'</td>'
        +'<td>'+(esc(st.f)||'—')+'</td>'
        +'<td>'+(esc(st.e)||'—')+'</td>'
        +'<td>'+(esc(st.pv)||'—')+'</td>'
        +'<td>'+(esc(st.a)||'—')+'</td>'
        +'<td>'+(esc(st.cd)||'—')+'</td>'
        +'<td>'+(esc(st.sv)||'—')+'</td>'
        +'<td>'+(esc(st.rfx)||'—')+'</td>'
        +'</tr></table></div>';
      if(armes.length){
        out+='<ul class="armeslist">'+armes.map(function(a){return '<li>'+esc(a)+'</li>';}).join('')+'</ul>';
      }
      if(notes){out+='<p class="beast-notes">'+esc(notes)+'</p>';}
      out+='</div>';
    });
    out+='</div>';
  }
  $('beasts').innerHTML=out;
  Array.prototype.forEach.call(document.querySelectorAll('[data-edit]'),function(btn){
    btn.addEventListener('click',function(){fillForm(btn.getAttribute('data-edit'));});
  });
}
function fillForm(nom){
  var b=null;
  for(var i=0;i<BEASTS.length;i++){if(BEASTS[i].nom===nom){b=BEASTS[i];break;}}
  if(!b){return;}
  var st=(b.data&&b.data.st)||{};
  $('g-old').value=b.nom||'';
  $('g-nom').value=b.nom||'';
  $('g-camp').value=b.camp||'ennemi';
  $('s-m').value=st.m||'';$('s-cc').value=st.cc||'';$('s-ct').value=st.ct||'';
  $('s-f').value=st.f||'';$('s-e').value=st.e||'';$('s-pv').value=st.pv||'';
  $('s-a').value=st.a||'';$('s-cd').value=st.cd||'';$('s-sv').value=st.sv||'';$('s-rfx').value=st.rfx||'';
  $('g-armes').value=((b.data&&b.data.armes)||[]).join('\n');
  $('g-notes').value=(b.data&&b.data.notes)||'';
  gmsg('« '+nom+' » chargé dans le formulaire — modifiez puis enregistrez.','');
  $('gestion').scrollIntoView({behavior:'smooth'});
}
function gmsg(t,cls){var m=$('g-msg');m.textContent=t;m.className='gmsg '+(cls||'');}
function clearForm(){
  ['g-old','g-nom','s-m','s-cc','s-ct','s-f','s-e','s-pv','s-a','s-cd','s-sv','s-rfx','g-armes','g-notes','g-key'].forEach(function(id){$(id).value='';});
  $('g-camp').value='ennemi';
  gmsg('Formulaire vidé — prêt pour une nouvelle créature.','');
}
function save(ev){
  ev.preventDefault();
  var nom=$('g-nom').value.trim();
  var key=$('g-key').value;
  if(!nom){gmsg('Le nom est obligatoire.','err');return;}
  if(!key){gmsg('La clé MJ est requise pour signer l\'enregistrement.','err');return;}
  var armes=$('g-armes').value.split('\n').map(function(l){return l.trim();}).filter(function(l){return l.length>0;});
  var data={
    st:{m:$('s-m').value.trim(),cc:$('s-cc').value.trim(),ct:$('s-ct').value.trim(),f:$('s-f').value.trim(),e:$('s-e').value.trim(),pv:$('s-pv').value.trim(),a:$('s-a').value.trim(),cd:$('s-cd').value.trim(),sv:$('s-sv').value.trim(),rfx:$('s-rfx').value.trim()},
    armes:armes,
    notes:$('g-notes').value.trim()
  };
  var camp=$('g-camp').value;
  var old=$('g-old').value.trim();
  var target=old||nom;
  gmsg('Enregistrement en cours…','');
  fetch(SB+'bestiaire?nom=eq.'+encodeURIComponent(target),{
    method:'PATCH',
    headers:hdr(key,{'Content-Type':'application/json','Prefer':'return=representation'}),
    body:JSON.stringify({nom:nom,camp:camp,data:data})
  }).then(function(r){
    if(r.status===403){throw new Error('key');}
    if(!r.ok){throw new Error('http '+r.status);}
    return r.json();
  }).then(function(rows){
    if(rows&&rows.length){return {created:false};}
    return fetch(SB+'bestiaire',{
      method:'POST',
      headers:hdr(key,{'Content-Type':'application/json','Prefer':'return=minimal'}),
      body:JSON.stringify({nom:nom,camp:camp,data:data})
    }).then(function(r){
      if(r.status===403){throw new Error('key');}
      if(!r.ok){throw new Error('http '+r.status);}
      return {created:true};
    });
  }).then(function(res){
    gmsg(res.created?('« '+nom+' » ajouté au bestiaire ✅'):('« '+nom+' » mis à jour ✅'),'ok');
    $('g-old').value=nom;
    load();
  }).catch(function(e){
    if(e&&e.message==='key'){gmsg('Clé MJ incorrecte — la base a refusé l\'écriture.','err');}
    else{gmsg('Échec de l\'enregistrement (connexion ?). Réessayez.','err');}
  });
}
function del(){
  var nom=$('g-nom').value.trim();
  var key=$('g-key').value;
  if(!nom){gmsg('Chargez d\'abord une créature (bouton ✎ d\'une carte) ou saisissez son nom exact.','err');return;}
  if(!key){gmsg('La clé MJ est requise.','err');return;}
  if(!window.confirm('Supprimer « '+nom+' » du bestiaire ?')){return;}
  gmsg('Suppression en cours…','');
  fetch(SB+'bestiaire?nom=eq.'+encodeURIComponent(nom),{
    method:'DELETE',
    headers:hdr(key)
  }).then(function(r){
    if(r.status===403){throw new Error('key');}
    if(!r.ok){throw new Error('http '+r.status);}
    gmsg('« '+nom+' » supprimé du bestiaire.','ok');
    clearForm();
    load();
  }).catch(function(e){
    if(e&&e.message==='key'){gmsg('Clé MJ incorrecte — la base a refusé la suppression.','err');}
    else{gmsg('Échec de la suppression (connexion ?). Réessayez.','err');}
  });
}
$('gform').addEventListener('submit',save);
$('g-del').addEventListener('click',del);
$('g-clear').addEventListener('click',clearForm);
$('b-refresh').addEventListener('click',load);
$('b-search').addEventListener('input',function(){Q=this.value.trim().toLowerCase();render();});
Array.prototype.forEach.call(document.querySelectorAll('#filters a'),function(a){
  a.addEventListener('click',function(ev){
    ev.preventDefault();
    FILTER=a.getAttribute('data-f');
    Array.prototype.forEach.call(document.querySelectorAll('#filters a'),function(x){x.classList.remove('on');});
    a.classList.add('on');
    render();
  });
});
load();
