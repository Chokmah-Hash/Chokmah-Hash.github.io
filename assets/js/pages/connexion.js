/* Les Protocoles Éternels — connexion.js : connexion unifiée joueur/MJ, le rôle est déduit des identifiants */
(function(){
"use strict";
var ROOT='https://dnbnkdakmobufqcrqzpq.supabase.co';
var SB=ROOT+'/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
function $(id){return document.getElementById(id);}
function setMsg(id,t,cls){var m=$(id);if(m){m.textContent=t;m.className='gmsg '+(cls||'');}}
function authMsg(t,cls){setMsg('auth-msg',t,cls);}
function rMsg(t,cls){setMsg('r-status',t,cls);}
function hdr(){return {'apikey':SBK,'Authorization':'Bearer '+SBK,'Content-Type':'application/json'};}
function api(url,opt){return fetch(url,opt);}
function sessJoueur(){try{return JSON.parse(localStorage.getItem('pe_session')||'null');}catch(e){return null;}}
function sessMJ(){try{var t=localStorage.getItem('pe-mj-auth');if(!t||t.indexOf('access_token')<0){return null;}var o=JSON.parse(t);var cs=(o&&o.session&&o.session.access_token?o.session:null)||(o&&o.currentSession&&o.currentSession.access_token?o.currentSession:null)||((o&&o.access_token)?o:null);if(!cs){return null;}var exp=cs.expires_at||0;if(exp&&exp*1000<Date.now()+30000){return null;}return true;}catch(e){return null;}}
/* D\u00e9j\u00e0 connect\u00e9 ? direction la zone */
(function(){var sj=sessJoueur();if(sj&&sj.token){location.replace('/joueur.html');return;}if(sessMJ()){location.replace('/mj.html');}})();
/* Message de session expir\u00e9e venant des autres pages */
try{var fl=sessionStorage.getItem('pe_flash');if(fl){sessionStorage.removeItem('pe_flash');authMsg(fl,'');}}catch(e){}
var CLIENT=null;
function clientMJ(){if(!CLIENT){CLIENT=supabase.createClient(ROOT,SBK,{auth:{persistSession:true,storageKey:'pe-mj-auth',autoRefreshToken:true,detectSessionInUrl:false}});}return CLIENT;}
function tryJoueur(u,p){
 return api(SB+'rpc/connexion_joueur',{method:'POST',headers:hdr(),body:JSON.stringify({p_login:u,p_mdp:p})}).then(function(r){if(!r.ok){throw new Error('http');}return r.json();}).then(function(rep0){
  var rep=Array.isArray(rep0)?rep0[0]:rep0;
  if(!rep||rep.erreur||!rep.token){throw new Error('bad');}
  try{localStorage.setItem('pe_session',JSON.stringify({id:rep.id,login:rep.login||u,nom:rep.nom||u,token:rep.token}));}catch(e){}
  authMsg('Bienvenue '+rep.nom+' \u2014 ouverture de la zone joueur\u2026','ok');
  location.replace('/joueur.html');
 });
}
function tryMJ(u,p){
 return clientMJ().auth.signInWithPassword({email:u,password:p}).then(function(res){
  if(res&&res.error){throw res.error;}
  authMsg('Bienvenue, Ma\u00eetre de la Tombe \u2014 ouverture de la zone MJ\u2026','ok');
  location.replace('/mj.html');
 });
}
$('f-login').addEventListener('submit',function(ev){
 ev.preventDefault();
 var u=$('l-user').value.trim(),p=$('l-pass').value;
 if(!u||!p){authMsg('Saisis ton pseudo (ou ton e-mail) et ton mot de passe.','err');return;}
 authMsg('V\u00e9rification\u2026','');
 var pj=tryJoueur(u,p);
 var mm=tryMJ(u,p);
 pj.catch(function(){mm.catch(function(){authMsg('Identifiants incorrects \u2014 v\u00e9rifie ton pseudo/e-mail et ton mot de passe.','err');});});
});
/* \u2014\u2014\u2014 Mot de passe oubli\u00e9 (joueur) \u2014\u2014\u2014 */
var RID=null,RTIMER=null;
function stopReset(){RID=null;if(RTIMER){clearInterval(RTIMER);RTIMER=null;}}
$('mdp-oublie').addEventListener('click',function(){
 authMsg('');rMsg('');$('r-form').style.display='none';$('r-ask').style.display='';$('f-reset').style.display='';$('f-login').style.display='none';$('mdp-row').style.display='none';$('r-user').value=$('l-user').value.trim();$('r-user').focus();
});
$('r-ask').addEventListener('submit',function(ev){
 ev.preventDefault();
 var u=$('r-user').value.trim();
 if(!u){rMsg('Saisis ton nom pour envoyer la demande.','err');return;}
 $('r-ask').style.display='none';rMsg('Transmission de la demande au Ma\u00eetre de la Tombe\u2026','');
 api(SB+'rpc/demander_reset',{method:'POST',headers:hdr(),body:JSON.stringify({p_login:u})}).then(function(r){if(!r.ok){throw new Error('http');}return r.json();}).then(function(rep0){
  var rep=Array.isArray(rep0)?rep0[0]:rep0;
  if(!rep||rep.erreur||!rep.id){rMsg((rep&&rep.erreur)||'Demande impossible.','err');$('r-ask').style.display='';return;}
  RID=rep.id;
  rMsg('Demande transmise au Ma\u00eetre de la Tombe. Garde cette page ouverte : d\u00e8s qu\u2019il l\u2019autorise, un champ \u00ab Nouveau mot de passe \u00bb appara\u00eetra ici \u2014 \u00e0 utiliser dans les 5 minutes.','');
  if(RTIMER){clearInterval(RTIMER);}
  RTIMER=setInterval(function(){
   api(SB+'rpc/statut_reset',{method:'POST',headers:hdr(),body:JSON.stringify({p_id:RID})}).then(function(r2){if(!r2.ok){throw new Error('http');}return r2.json();}).then(function(s0){
    var s=Array.isArray(s0)?s0[0]:s0;
    if(!s){return;}
    if(s.statut==='valide'){if(RTIMER){clearInterval(RTIMER);RTIMER=null;}$('r-form').style.display='';rMsg('Le Ma\u00eetre de la Tombe a autoris\u00e9 ta demande \u2014 saisis ton nouveau mot de passe (5 minutes).','ok');}
    else if(s.statut==='terminee'){stopReset();rMsg('Demande d\u00e9j\u00e0 trait\u00e9e.','ok');}
    else if(s.statut==='expire'){stopReset();$('r-form').style.display='none';rMsg('Autorisation expir\u00e9e \u2014 clique \u00e0 nouveau sur \u00ab Mot de passe oubli\u00e9 ? \u00bb.','err');}
   }).catch(function(){});
  },8000);
 }).catch(function(){rMsg('Demande impossible \u2014 v\u00e9rifie ta connexion internet.','err');$('r-ask').style.display='';});
});
$('r-cancel').addEventListener('click',function(){stopReset();$('f-reset').style.display='none';$('r-ask').style.display='';$('f-login').style.display='';$('mdp-row').style.display='';rMsg('');});
$('r-form').addEventListener('submit',function(ev){
 ev.preventDefault();
 var u=$('r-user').value.trim(),p=$('r-pass').value,p2=$('r-pass2').value;
 if(p!==p2){rMsg('Les deux mots de passe ne correspondent pas.','err');return;}
 if(p.length<4){rMsg('Mot de passe trop court (4 caract\u00e8res minimum).','err');return;}
 if(!RID){rMsg('Demande inconnue \u2014 relance \u00ab Mot de passe oubli\u00e9 ? \u00bb.','err');return;}
 rMsg('Enregistrement du nouveau mot de passe\u2026','');
 api(SB+'rpc/completer_reset',{method:'POST',headers:hdr(),body:JSON.stringify({p_id:RID,p_login:u,p_mdp:p})}).then(function(r){if(!r.ok){throw new Error('http');}return r.json();}).then(function(rep0){
  var rep=Array.isArray(rep0)?rep0[0]:rep0;
  if(!rep||rep.erreur||!rep.ok){rMsg((rep&&rep.erreur)||'Echec du reset.','err');return;}
  api(SB+'rpc/connexion_joueur',{method:'POST',headers:hdr(),body:JSON.stringify({p_login:u,p_mdp:p})}).then(function(r2){if(!r2.ok){throw new Error('http');}return r2.json();}).then(function(j0){
   var j=Array.isArray(j0)?j0[0]:j0;
   if(!j||!j.token){throw new Error('sess');}
   try{localStorage.setItem('pe_session',JSON.stringify({id:j.id,login:u,nom:j.nom||u,token:j.token}));}catch(e){}
   stopReset();
   authMsg('Mot de passe mis \u00e0 jour \u2014 ouverture de la zone joueur\u2026','ok');
   location.replace('/joueur.html');
  }).catch(function(){stopReset();$('f-reset').style.display='none';$('r-ask').style.display='';$('f-login').style.display='';$('mdp-row').style.display='';rMsg('');authMsg('Mot de passe mis \u00e0 jour \u2014 connecte-toi ci-dessus.','ok');});
 }).catch(function(){rMsg('Echec du reset \u2014 v\u00e9rifie ta connexion internet.','err');});
});
})();
