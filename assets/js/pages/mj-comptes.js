(function(){
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function msg(t,c){var m=$('cj-msg');if(m){m.textContent=t;m.className='gmsgc '+(c||'');}}
function msgL(t,c){var m=$('cj-lmsg');if(m){m.textContent=t;m.className='gmsgc '+(c||'');}}
var CONFIRM={};
function freshToken(){try{if(window.CLIENT&&CLIENT.auth&&CLIENT.auth.getSession){return CLIENT.auth.getSession().then(function(s){return (s&&s.data&&s.data.session&&s.data.session.access_token)||(window.MJBEARER||SBK);},function(){return window.MJBEARER||SBK;});}}catch(e){}return Promise.resolve(window.MJBEARER||SBK);}
function rpc(name,body){return freshToken().then(function(tk){return fetch(SB+'rpc/'+name,{method:'POST',headers:{'apikey':SBK,'Authorization':'Bearer '+tk,'Content-Type':'application/json'},body:JSON.stringify(body||{})}).then(function(r){if(!r.ok){throw new Error('http '+r.status);}return r.json();});});}
function loadList(){
  if(!window.MJBEARER){msgL('Console non ouverte.','err');return;}
  var prev={};
  Array.prototype.forEach.call(document.querySelectorAll('[data-cn]'),function(pi){prev[pi.getAttribute('data-cn')]=pi.value;});
  rpc('mj_liste_joueurs',{}).then(function(rep0){
    if(rep0&&rep0.erreur){msgL(rep0.erreur,'err');return;}
    var arr=Array.isArray(rep0)?rep0:(rep0&&Array.isArray(rep0[0])?rep0[0]:null);
    if(!arr){msgL('Liste impossible — réouvre la console si besoin.','err');return;}
    if(!arr.length){$('cj-list').innerHTML='<p class="gmsgc">Aucun joueur pour l\'instant — crée le premier ci-dessous.</p>';msgL('','');return;}
    var rows='';
    arr.forEach(function(j){
      var d=j.cree?new Date(j.cree):null;
      var dstr=d?d.toLocaleDateString('fr-FR')+' '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}):'—';
      var resetCell='—';
      if(j.reset&&j.reset.id){
        resetCell='<span style="color:var(--amber);font-weight:700">⚠ Demande MDP</span><br><button class="btn amber smallbtn" data-ok="'+esc(j.reset.id)+'">Autoriser</button> <button class="btn ghost smallbtn" data-no="'+esc(j.reset.id)+'">Refuser</button>';
      }
      var conf=CONFIRM[j.id];
      var delCell=conf
        ?'<input class="gf" style="max-width:150px" data-cn="'+esc(j.id)+'" placeholder="Taper le nom" value="'+esc(prev[j.id]||'')+'"><br><button class="btn danger smallbtn" data-del="'+esc(j.id)+'">🗑 Confirmer</button> <button class="btn ghost smallbtn" data-undel="'+esc(j.id)+'">Annuler</button>'
        :'<button class="btn danger smallbtn" data-supp="'+esc(j.id)+'">🗑 Supprimer</button>';
      rows+='<tr><td>'+esc(j.nom)+'</td><td>'+esc(j.login)+'</td><td>'+dstr+'</td><td>'+resetCell+'</td><td>'+delCell+'</td></tr>';
    });
    $('cj-list').innerHTML='<div class="tscroll"><table class="rt amber"><thead><tr><th>Nom</th><th>Pseudo</th><th>Créé le</th><th>MDP oublié</th><th>Actions</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    msgL('','');
  }).catch(function(){msgL('Liste impossible — vérifie ta connexion.','err');});
}
window.MJCOMPTES_REFRESH=loadList;
$('cj-create').addEventListener('click',function(){
  var l=$('cj-login').value.trim(),n=$('cj-nom').value.trim(),p=$('cj-pass').value;
  if(!l||!p){msg('Pseudo et mot de passe obligatoires.','err');return;}
  if(p.length<4){msg('Mot de passe trop court (4 caractères minimum).','err');return;}
  msg('Création du compte…','');
  rpc('mj_creer_joueur',{p_login:l,p_mdp:p,p_nom:n||l}).then(function(rep0){
    var rep=(Array.isArray(rep0)&&rep0.length)?rep0[0]:rep0;
    if(!rep||rep.erreur){msg((rep&&rep.erreur)||'Création impossible.','err');return;}
    msg('✅ Compte créé — transmets au joueur : pseudo '+l+' / mot de passe '+p,'ok');
    $('cj-login').value='';$('cj-nom').value='';$('cj-pass').value='';
    loadList();
  }).catch(function(){msg('Création impossible — vérifie ta connexion.','err');});
});
$('cj-list').addEventListener('click',function(ev){
  var t=ev.target;if(!t||!t.getAttribute){return;}
  var ok=t.getAttribute('data-ok'),no=t.getAttribute('data-no'),supp=t.getAttribute('data-supp'),del=t.getAttribute('data-del'),undel=t.getAttribute('data-undel');
  if(ok){rpc('mj_valider_reset',{p_id:ok}).then(function(r0){var rr=Array.isArray(r0)?r0[0]:r0;if(rr&&rr.erreur){msgL(rr.erreur,'err');}else{msgL('Demande autorisée — le joueur a 5 minutes pour définir son nouveau mot de passe.','ok');}loadList();}).catch(function(){msgL('Action impossible.','err');});}
  if(no){rpc('mj_refuser_reset',{p_id:no}).then(function(r0){var rr=Array.isArray(r0)?r0[0]:r0;if(rr&&rr.erreur){msgL(rr.erreur,'err');}else{msgL('Demande refusée.','ok');}loadList();}).catch(function(){msgL('Action impossible.','err');});}
  if(supp){CONFIRM[supp]=true;loadList();}
  if(undel){delete CONFIRM[undel];loadList();}
  if(del){
    var inp=document.querySelector('[data-cn="'+del+'"]');
    var nom=inp?inp.value.trim():'';
    if(!nom){msgL('Saisis exactement le nom du joueur pour confirmer.','err');return;}
    msgL('Suppression en cours…','');
    rpc('mj_supprimer_joueur',{p_id:del,p_nom_conf:nom}).then(function(rep0){
      var rep=(Array.isArray(rep0)&&rep0.length)?rep0[0]:rep0;
      if(!rep||rep.erreur){msgL((rep&&rep.erreur)||'Suppression impossible.','err');return;}
      delete CONFIRM[del];
      msgL('Joueur supprimé.','ok');
      loadList();
    }).catch(function(){msgL('Suppression impossible — vérifie ta connexion.','err');});
  }
});
setInterval(function(){if(window.MJBEARER&&!document.querySelector('[data-cn]')){loadList();}},30000);
})();