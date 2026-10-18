var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var BJKEY='',BJMODE=false,BJ=[];
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function H(extra){var h={'apikey':SBK,'Authorization':'Bearer '+(window.MJBEARER||SBK),'Content-Type':'application/json'};if(extra){for(var k in extra){h[k]=extra[k];}}return h;}
function HB(extra){var h=H(extra);h['x-mj-key']=BJKEY;return h;}
function bmsg(id,t,cls){var m=$(id);if(m){m.textContent=t;m.className='gmsgc '+(cls||'');}}
function campLabelB(c){return c==='ennemi'?'Ennemi':(c==='allie'?'Allié':'Neutre');}
function bjLoad(){
  fetch(SB+'bestiaire?select=*&order=nom.asc',{headers:H()})
    .then(function(r){if(!r.ok){throw new Error('http '+r.status);}return r.json();})
    .then(function(l){BJ=l||[];bjList();bmsg('b-lmsg',BJ.length+' fiche(s) dans la base partagée.','');})
    .catch(function(){bmsg('b-lmsg','Base inaccessible — vérifie ta connexion internet.','err');});
}
function bjList(){
  var box=$('b-list');var out='';
  if(!BJ.length){out='<p class="pv">Aucune fiche pour l\'instant — crée la première ci-dessus.</p>';}
  BJ.forEach(function(b){
    var ar=((b.data&&b.data.armes)||[]).length;
    out+='<div class="plrow"><div class="plinfo"><b>'+esc(b.nom)+'</b><span>'+esc(campLabelB(b.camp))+' · '+esc(b.faction||'—')+' · '+ar+' arme(s)</span></span></div>'
      +'<button class="btn amber sm" data-act="edit" data-nom="'+esc(b.nom)+'" type="button">✎ Modifier</button>'
      +'<button class="btn danger sm" data-act="del" data-nom="'+esc(b.nom)+'" type="button">✕</button></div>';
  });
  box.innerHTML=out;
  Array.prototype.forEach.call(box.querySelectorAll('button'),function(btn){
    btn.addEventListener('click',function(){
      var nom=btn.getAttribute('data-nom');
      if(btn.getAttribute('data-act')==='edit'){bjFill(nom);}
      else{bjDel(nom);}
    });
  });
}
function bjFill(nom){
  var b=null;BJ.forEach(function(x){if(x.nom===nom){b=x;}});
  if(!b){return;}
  var st=(b.data&&b.data.st)||{};
  $('b-old').value=b.nom||'';$('b-nom').value=b.nom||'';$('b-camp').value=b.camp||'ennemi';$('b-faction').value=b.faction||'';
  ['m','cc','ct','f','e','pv','a','cd','sv','rfx'].forEach(function(k){$('b-'+k).value=st[k]||'';});
  $('b-armes').value=((b.data&&b.data.armes)||[]).join('\n');
  $('b-notes').value=(b.data&&b.data.notes)||'';
  $('b-form-title').textContent='Modifier : '+(b.nom||'');
  $('b-del').style.display='';
  bmsg('b-fmsg','« '+(b.nom||'')+' » chargé dans le formulaire — modifie puis enregistre.','');
}
function bjClear(){
  $('b-form-title').textContent='Nouvelle créature';
  $('b-old').value='';$('b-nom').value='';$('b-camp').value='ennemi';$('b-faction').value='';
  ['m','cc','ct','f','e','pv','a','cd','sv','rfx'].forEach(function(k){$('b-'+k).value='';});
  $('b-armes').value='';$('b-notes').value='';
  $('b-del').style.display='none';
  bmsg('b-fmsg','');
}
function bjDel(nom){
  if(!BJMODE){bmsg('b-fmsg','Ouvre d\'abord la console avec ta clé MJ.','err');return;}
  if(!window.confirm('Supprimer « '+nom+' » du bestiaire ?')){return;}
  bmsg('b-fmsg','Suppression en cours…','');
  fetch(SB+'bestiaire?nom=eq.'+encodeURIComponent(nom),{method:'DELETE',headers:HB({'Prefer':'return=representation'})})
    .then(function(r){if(r.status===403){throw new Error('key');}if(!r.ok){throw new Error('http '+r.status);}return r.json();})
    .then(function(rows){
      if(!rows||!rows.length){throw new Error('norf');}
      bmsg('b-fmsg','« '+nom+' » supprimé du bestiaire.','ok');
      if($('b-old').value===nom){bjClear();}
      bjLoad();
    })
    .catch(function(e){
      if(e&&e.message==='key'){bmsg('b-fmsg','Clé MJ incorrecte — la base a refusé la suppression.','err');}
      else if(e&&e.message==='norf'){bmsg('b-fmsg','Suppression refusée — clé incorrecte ou nom introuvable.','err');}
      else{bmsg('b-fmsg','Échec de la suppression (connexion ?). Réessayez.','err');}
    });
}
$('b-open').addEventListener('click',function(){
  var k=$('b-key').value;
  if(!k){bmsg('b-msg','Saisis ta clé MJ.','err');return;}
  BJKEY=k;BJMODE=true;$('b-key').value='';
  $('b-tools').style.display='';
  bmsg('b-msg','Console du bestiaire ouverte — tes écritures seront signées avec la clé.','ok');
  bjClear();bjLoad();
});
$('b-clear').addEventListener('click',bjClear);
$('b-del').addEventListener('click',function(){
  if(!BJMODE){return;}
  var nom=$('b-nom').value.trim();
  if(!nom){bmsg('b-fmsg','Charge d\'abord une créature (liste ci-dessous) ou saisis son nom exact.','err');return;}
  bjDel(nom);
});
$('b-save').addEventListener('click',function(){
  if(!BJMODE){bmsg('b-fmsg','Ouvre d\'abord la console avec ta clé MJ.','err');return;}
  var nom=$('b-nom').value.trim();
  if(!nom){bmsg('b-fmsg','Le nom est obligatoire.','err');return;}
  var armes=$('b-armes').value.split('\n').map(function(l){return l.trim();}).filter(function(l){return l.length>0;});
  var data={
    st:{m:$('b-m').value.trim(),cc:$('b-cc').value.trim(),ct:$('b-ct').value.trim(),f:$('b-f').value.trim(),e:$('b-e').value.trim(),pv:$('b-pv').value.trim(),a:$('b-a').value.trim(),cd:$('b-cd').value.trim(),sv:$('b-sv').value.trim(),rfx:$('b-rfx').value.trim()},
    armes:armes,
    notes:$('b-notes').value.trim()
  };
  var camp=$('b-camp').value;
  var faction=$('b-faction').value.trim()||'Nécrons';
  var old=$('b-old').value.trim();
  var target=old||nom;
  bmsg('b-fmsg','Enregistrement en cours…','');
  fetch(SB+'bestiaire?nom=eq.'+encodeURIComponent(target),{
    method:'PATCH',
    headers:HB({'Prefer':'return=representation'}),
    body:JSON.stringify({nom:nom,camp:camp,faction:faction,data:data})
  }).then(function(r){
    if(r.status===403){throw new Error('key');}
    if(!r.ok){throw new Error('http '+r.status);}
    return r.json();
  }).then(function(rows){
    if(rows&&rows.length){return {created:false};}
    return fetch(SB+'bestiaire',{
      method:'POST',
      headers:HB({'Prefer':'return=minimal'}),
      body:JSON.stringify({nom:nom,camp:camp,faction:faction,data:data})
    }).then(function(r){
      if(r.status===403){throw new Error('key');}
      if(!r.ok){throw new Error('http '+r.status);}
      return {created:true};
    });
  }).then(function(res){
    bmsg('b-fmsg',res.created?('« '+nom+' » ajouté au bestiaire'):('« '+nom+' » mis à jour'),'ok');
    $('b-old').value=nom;
    bjLoad();
  }).catch(function(e){
    if(e&&e.message==='key'){bmsg('b-fmsg','Clé MJ incorrecte — la base a refusé l\'écriture.','err');}
    else{bmsg('b-fmsg','Échec de l\'enregistrement (connexion ?). Réessayez.','err');}
  });
});
