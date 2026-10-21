/* PE_BUILD 2026.10.21-pj7 — onglet Équipement supprimé (fusion dans les fiches, mot12) ; Personnages → fiches (mot11) */
var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var SESS=null;
var AVS=[],PING_TIMER=null,NOTE_TIMER=null;
var EQ=window.PE_EQUIP;
var CODES={'Éternel':'Jet de Protocole de Secours à +1','Pragmatique':'Relancez les 1 au jet de toucher à distance','Sanguinaire':'Relancez les 1 au jet de toucher en mêlée','Solaire':'+1 PA sur les armes magnétiques à 12 m ou moins','Tutélaire':'+1 au Cd pour tenir une position','Fondateur':'Les pouvoirs spéciaux se rechargent après 5 minutes de repos au lieu d\u2019une scène'};
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function hdr(extra){var h={'apikey':SBK,'Authorization':'Bearer '+SBK,'Content-Type':'application/json'};if(SESS){h['x-token']=SESS.token;}if(extra){for(var k in extra){h[k]=extra[k];}}return h;}
function setMsg(id,t,cls){var m=$(id);if(m){m.textContent=t;m.className='gmsg '+(cls||'');}}
function nowIso(){return new Date().toISOString();}
function api(url,opt){return fetch(url,opt).then(function(r){
 if(r.status===401&&SESS&&url.indexOf('rpc/')<0){logout('Session expirée — reconnecte-toi.');throw new Error('session');}
 return r;
});}
/* ——— Auth ——— */
function authMsg(t,cls){setMsg('auth-msg',t,cls);}
$('f-login').addEventListener('submit',function(ev){

 ev.preventDefault();
 var u=$('l-user').value.trim(),p=$('l-pass').value;
 if(!u||!p){return;}
 authMsg('Vérification…','');
 api(SB+'rpc/connexion_joueur',{method:'POST',headers:hdr(),body:JSON.stringify({p_login:u,p_mdp:p})}).then(function(r){
  if(!r.ok){throw new Error('http');}
  return r.json();
 }).then(function(rep0){
  var rep=Array.isArray(rep0)?rep0[0]:rep0;
  if(!rep||rep.erreur||!rep.token){authMsg((rep&&rep.erreur)||'Pseudo ou mot de passe incorrect.','err');return;}
  SESS={id:rep.id,login:rep.login||u,nom:rep.nom||u,token:rep.token};
  try{localStorage.setItem('pe_session',JSON.stringify(SESS));}catch(e){}
  enterApp();
 }).catch(function(){authMsg('Connexion impossible — vérifie ta connexion internet.','err');});
});
var RID=null,RTIMER=null;
function rMsg(t,cls){setMsg('r-status',t,cls);}
function stopReset(){RID=null;if(RTIMER){clearInterval(RTIMER);RTIMER=null;}}
$('mdp-oublie').addEventListener('click',function(){
 authMsg('');rMsg('');$('r-form').style.display='none';$('r-ask').style.display='';$('f-reset').style.display='';$('f-login').style.display='none';$('mdp-row').style.display='none';$('r-user').value=$('l-user').value.trim();$('r-user').focus();
});
$('r-ask').addEventListener('submit',function(ev){
 ev.preventDefault();
 var u=$('r-user').value.trim();
 if(!u){rMsg('Saisis ton nom pour envoyer la demande.','err');return;}
 $('r-ask').style.display='none';rMsg('Transmission de la demande au Maître de la Tombe…','');
 api(SB+'rpc/demander_reset',{method:'POST',headers:hdr(),body:JSON.stringify({p_login:u})}).then(function(r){if(!r.ok){throw new Error('http');}return r.json();}).then(function(rep0){
  var rep=Array.isArray(rep0)?rep0[0]:rep0;
  if(!rep||rep.erreur||!rep.id){rMsg((rep&&rep.erreur)||'Demande impossible.','err');$('r-ask').style.display='';return;}
  RID=rep.id;
  rMsg('⏳ Demande transmise au Maître de la Tombe. Garde cette page ouverte : dès qu’il l’autorise, un champ « Nouveau mot de passe » apparaît ici — à utiliser dans les 5 minutes.','');
  if(RTIMER){clearInterval(RTIMER);}
  RTIMER=setInterval(function(){
   api(SB+'rpc/statut_reset',{method:'POST',headers:hdr(),body:JSON.stringify({p_id:RID})}).then(function(r2){if(!r2.ok){throw new Error('http');}return r2.json();}).then(function(s0){
    var s=Array.isArray(s0)?s0[0]:s0;
    if(!s){return;}
    if(s.statut==='valide'){if(RTIMER){clearInterval(RTIMER);RTIMER=null;}$('r-form').style.display='';rMsg('Le Maître de la Tombe a autorisé ta demande — saisis ton nouveau mot de passe (5 minutes).','ok');}
    else if(s.statut==='terminee'){stopReset();rMsg('Demande déjà traitée.','ok');}
    else if(s.statut==='expire'){stopReset();$('r-form').style.display='none';rMsg('⏳ Autorisation expirée — clique à nouveau sur « Mot de passe oublié ? ».','err');}
   }).catch(function(){});
  },8000);
 }).catch(function(){rMsg('Demande impossible — vérifie ta connexion internet.','err');$('r-ask').style.display='';});
});
$('r-cancel').addEventListener('click',function(){stopReset();$('f-reset').style.display='none';$('r-ask').style.display='';$('f-login').style.display='';$('mdp-row').style.display='';rMsg('');});
$('r-form').addEventListener('submit',function(ev){
 ev.preventDefault();
 var u=$('r-user').value.trim(),p=$('r-pass').value,p2=$('r-pass2').value;
 if(p!==p2){rMsg('Les deux mots de passe ne correspondent pas.','err');return;}
 if(p.length<4){rMsg('Mot de passe trop court (4 caractères minimum).','err');return;}
 if(!RID){rMsg('Demande inconnue — relance « Mot de passe oublié ? ».','err');return;}
 rMsg('Enregistrement du nouveau mot de passe…','');
 api(SB+'rpc/completer_reset',{method:'POST',headers:hdr(),body:JSON.stringify({p_id:RID,p_login:u,p_mdp:p})}).then(function(r){if(!r.ok){throw new Error('http');}return r.json();}).then(function(rep0){
  var rep=Array.isArray(rep0)?rep0[0]:rep0;
  if(!rep||rep.erreur||!rep.ok){rMsg((rep&&rep.erreur)||'Echec du reset.','err');return;}
  api(SB+'rpc/connexion_joueur',{method:'POST',headers:hdr(),body:JSON.stringify({p_login:u,p_mdp:p})}).then(function(r2){if(!r2.ok){throw new Error('http');}return r2.json();}).then(function(j0){
   var j=Array.isArray(j0)?j0[0]:j0;
   if(!j||!j.token){throw new Error('sess');}
   SESS={id:j.id,login:u,nom:j.nom||u,token:j.token};
   try{localStorage.setItem('pe_session',JSON.stringify(SESS));}catch(e){}
   stopReset();$('f-reset').style.display='none';$('r-ask').style.display='';$('r-pass').value='';$('r-pass2').value='';rMsg('');
   enterApp();
  }).catch(function(){stopReset();$('f-reset').style.display='none';$('r-ask').style.display='';authMsg('Mot de passe mis à jour — connecte-toi ci-dessus.','ok');});
 }).catch(function(){rMsg('Echec du reset — vérifie ta connexion internet.','err');});
});
function logout(msg){
 try{localStorage.removeItem('pe_session');}catch(e){}
 if(PING_TIMER){clearInterval(PING_TIMER);PING_TIMER=null;}
 SESS=null;
 $('app-view').style.display='none';
 $('auth-view').style.display='';
 $('app-subnav').hidden=true;
 $('app-hero').style.display='';
 $('logout-who').textContent='';
 $('f-login').style.display='';$('mdp-row').style.display='';
 if(msg){authMsg(msg,'');}
}
$('app-logout').addEventListener('click',function(ev){ev.preventDefault();logout('');$('l-user').value='';$('l-pass').value='';});
function enterApp(){
 $('auth-view').style.display='none';
 $('app-view').style.display='';
 $('app-subnav').hidden=false;
 $('app-hero').style.display='none';
 $('logout-who').textContent=' ('+SESS.nom+')';
 loadAventure();
 loadNotes();
 posOpts();
 if(PING_TIMER){clearInterval(PING_TIMER);}
 PING_TIMER=setInterval(function(){pingPresence();pingPosition();},20000);
 setTimeout(pingPresence,1500);
 try{
  var htab=(location.hash||'').replace('#','');
  if(htab==='av'||htab==='notes'||htab==='des'){localStorage.setItem('pe_pjtab',htab);}
  var pt=localStorage.getItem('pe_pjtab');if(pt){var pb=document.querySelector('.subnav [data-t="'+pt+'"],.tabs .tab[data-t="'+pt+'"]');if(pb){pb.click();}}
 }catch(e){}
}
/* ——— Onglets ——— */
Array.prototype.forEach.call(document.querySelectorAll('.subnav [data-t],.tabs .tab[data-t]'),function(b){
 b.addEventListener('click',function(){
  Array.prototype.forEach.call(document.querySelectorAll('.subnav [data-t],.tabs .tab[data-t]'),function(x){x.classList.remove('on');x.classList.remove('active');});
  b.classList.add('active');
  var t=b.getAttribute('data-t');
  ['av','notes','des'].forEach(function(k){
   var pane=$('tab-'+k);
   if(pane){pane.classList.toggle('on',k===t);}
  });
  if(t==='av'){loadAventure();}
  try{localStorage.setItem('pe_pjtab',t);}catch(e){}
 });
});
/* ——— Aventure ——— */
function loadAventure(silence){
 if(!SESS){return;}
 if(!silence){setMsg('av-status','Chargement de l\u2019aventure…','');}
 api(SB+'aventures?select=id,titre,blocs,cree&statut=eq.active&order=cree.desc',{headers:hdr()}).then(function(r){
  if(!r.ok){throw new Error('http');}
  return r.json();
 }).then(function(list){
  AVS=list||[];
  renderAventure();
 }).catch(function(){AVS=[];renderAventure(true);});
}
function renderAventure(err){
 var out='';
 if(err){
  setMsg('av-status','Base inaccessible — vérifie ta connexion internet.','err');
 }else if(!AVS.length){
  setMsg('av-status','','');
  out='<div class="empty-box">Aucune aventure en cours pour le moment.<br>Quand le Maître de la Tombe enclenchera une aventure, elle apparaîtra ici automatiquement.</div>';
  $('av-hint').style.display='none';
 }else{
  setMsg('av-status','','');
  $('av-hint').style.display='';
  out+='<div class="grid3">';
  AVS.forEach(function(a){
   var blocs=(a.blocs)||[];
   out+='<div class="card">'
    +'<span class="ico"><span class="pe-star lg"></span></span>'
    +'<h3>'+esc(a.titre)+'</h3>'
    +'<span class="badge ally active-av">Aventure active</span>';
   if(!blocs.length){
    out+='<p style="color:var(--muted)">Aucun détail publié pour l\u2019instant.</p>';
   }else{
    blocs.forEach(function(b){
     out+='<div class="av-bloc"><h3>'+esc(b.titre||'')+'</h3><div class="btxt">'+esc(b.texte||'')+'</div></div>';
    });
   }
   out+='<span class="presence-ok">✓ Connecté — le MJ te voit dans cette aventure.</span>';
   out+='</div>';
  });
  out+='</div>';
 }
 $('av-list').innerHTML=out;
}
function pingPresence(){
 if($('tab-av')&&$('tab-av').classList.contains('on')){loadAventure(true);}
 if(!SESS||!SESS.id||!AVS.length){return;}
 var t=nowIso();
 AVS.forEach(function(a){
  api(SB+'aventures_joueurs?on_conflict=aventure_id,compte_id',{
   method:'POST',
   headers:hdr({'Prefer':'resolution=merge-duplicates'}),
   body:JSON.stringify({aventure_id:a.id,compte_id:SESS.id,dernier_acces:t,ping:t})
  }).catch(function(){});
 });
}
/* --- Ma position (carte galaxie) --- */
var POS={sys:null,lieu:""};
function posOpts(){
 api(SB+"galaxie?select=id,nom&order=nom.asc",{headers:hdr()}).then(function(r){return r.ok?r.json():[];}).then(function(list){
  var o="<option value=\"\">\u2014 Quelque part ailleurs \u2014</option>";
  (list||[]).forEach(function(g){o+="<option value=\""+g.id+"\">"+esc(g.nom)+"</option>";});
  $("pos-sys").innerHTML=o;
  loadMyPos();
 }).catch(function(){});
}
function loadMyPos(){
 if(!SESS){return;}
 api(SB+"positions?select=compte_id,galaxie_id,lieu&compte_id=eq."+SESS.id,{headers:hdr()}).then(function(r){return r.ok?r.json():[];}).then(function(rows){
  if(rows&&rows.length){
   POS={sys:rows[0].galaxie_id||null,lieu:rows[0].lieu||""};
   $("pos-sys").value=POS.sys||"";
   $("pos-lieu").value=POS.lieu;
   setMsg("pos-status","Position enregistrée \u2014 le MJ te voit sur la carte.","ok");
  }
 }).catch(function(){});
}
function savePos(){
 if(!SESS){return;}
 var v=$("pos-sys").value;
 var sys=v?parseInt(v,10):null;
 var lieu=$("pos-lieu").value.trim();
 api(SB+"positions?on_conflict=compte_id",{method:"POST",headers:hdr({"Prefer":"resolution=merge-duplicates"}),body:JSON.stringify({compte_id:SESS.id,galaxie_id:sys,lieu:lieu,maj:nowIso()})}).then(function(r){
  if(r.ok){POS={sys:sys,lieu:lieu};setMsg("pos-status","\u2713 Position enregistrée \u2014 le MJ te voit sur la carte.","ok");}
  else{setMsg("pos-status","Enregistrement impossible ("+r.status+").","err");}
 }).catch(function(){setMsg("pos-status","Base inaccessible.","err");});
}
function clearPos(){
 if(!SESS){return;}
 api(SB+"positions?compte_id=eq."+SESS.id,{method:"DELETE",headers:hdr()}).then(function(r){
  if(r.ok){POS={sys:null,lieu:""};$("pos-sys").value="";$("pos-lieu").value="";setMsg("pos-status","Position effacée.","");}
  else{setMsg("pos-status","Impossible ("+r.status+").","err");}
 }).catch(function(){setMsg("pos-status","Base inaccessible.","err");});
}
function pingPosition(){
 if(!SESS||(POS.sys===null&&!POS.lieu)){return;}
 api(SB+"positions?on_conflict=compte_id",{method:"POST",headers:hdr({"Prefer":"resolution=merge-duplicates"}),body:JSON.stringify({compte_id:SESS.id,galaxie_id:POS.sys,lieu:POS.lieu,maj:nowIso()})}).catch(function(){});
}
$("pos-save").addEventListener("click",savePos);
$("pos-clear").addEventListener("click",clearPos);
/* ——— Notes ——— */
function loadNotes(){
 if(!SESS){return;}
 var st=$('note-state');
 st.textContent='';st.className='savestate';
 api(SB+'notes?select=contenu&compte_id=eq.'+SESS.id,{headers:hdr()}).then(function(r){
  if(!r.ok){throw new Error('http');}
  return r.json();
 }).then(function(rows){
  $('note-area').value=(rows&&rows.length)?(rows[0].contenu||''):'';
 }).catch(function(){st.textContent='Notes indisponibles (connexion ?).';st.className='savestate err';});
}
function saveNotes(){
 var st=$('note-state');
 st.textContent='Enregistrement…';st.className='savestate';
 api(SB+'notes?on_conflict=compte_id',{
  method:'POST',
  headers:hdr({'Prefer':'resolution=merge-duplicates'}),
  body:JSON.stringify({compte_id:SESS.id,contenu:$('note-area').value})
 }).then(function(r){
  if(r.status===401){throw new Error('session');}
  if(!r.ok){throw new Error('http');}
  st.textContent='Enregistré ✓';st.className='savestate ok';
 }).catch(function(e){
  if(e&&e.message==='session'){return;}
  st.textContent='Échec de l\u2019enregistrement — réessaie.';st.className='savestate err';
 });
}
$('note-area').addEventListener('input',function(){
 if(!SESS){return;}
 if(NOTE_TIMER){clearTimeout(NOTE_TIMER);}
 NOTE_TIMER=setTimeout(saveNotes,900);
});
/* ——— Démarrage ——— */
(function(){
 try{SESS=JSON.parse(localStorage.getItem('pe_session')||'null');}catch(e){SESS=null;}
 if(SESS&&SESS.id&&SESS.token){enterApp();}
 else{SESS=null;}
})();
