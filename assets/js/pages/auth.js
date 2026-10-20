/* Compte MJ — Supabase Auth : connexion email/mot de passe (optionnelle, en plus de la clé MJ) */
(function(){
"use strict";
var ROOT='https://dnbnkdakmobufqcrqzpq.supabase.co';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
window.MJBEARER=null;
function $id(x){return document.getElementById(x);}
function msg(t,cls){var m=$id('auth-msg');if(m){m.textContent=t;m.className='gmsgc '+(cls||'');}}
function show(loggedIn){
  var f=$id('auth-form'),u=$id('auth-user');
  if(f){f.style.display=loggedIn?'none':'';}
  if(u){u.style.display=loggedIn?'':'none';}
}
var CLIENT=null;
function applySession(s){
  var ok=!!(s&&s.access_token);
  if(ok){window.MJBEARER=s.access_token;show(true);if(s.user&&s.user.email){$id('auth-who').textContent=s.user.email;}var ac=$id('auth-console');if(ac){ac.style.display='none';}try{document.body.classList.remove('preauth');}catch(e0){}var _tab=null;try{var _hh=location.hash;_tab=((_hh&&_hh.length>1)?_hh.slice(1):'')||localStorage.getItem('pe_mjtab');}catch(e6){}
  if(window.MJSHOW){window.MJSHOW(_tab&&['mj-content','carte-console','best-console','img-console','comptes-console','des-sect'].indexOf(_tab)>=0?_tab:'mj-content');}window.scrollTo(0,0);
  if(CLIENT){CLIENT.rpc('mj_cle').then(function(res){var k=res&&res.data;if(typeof k==='string'&&k.length>0){try{localStorage.setItem('pe_mjkey',k);}catch(e5){}['av-key','mj-key','b-key','img-key'].forEach(function(id2){var el=$id(id2);if(el){el.value=k;}});['av-go','mj-open','b-open','img-open'].forEach(function(id2){var b=$id(id2);if(b){b.click();}});
    ['av-key','mj-key','b-key','img-key'].forEach(function(id2){var el=$id(id2);if(!el){return;}var row=el.closest('.cta-row');if(row){row.style.display='none';}});
    var lb=$id('av-lockbox');if(lb){lb.style.display='none';}
    var mp=$id('mj-pass'),mg=$id('mj-go');if(mp&&mg&&(!mp.value||mp.value!==k)){mp.value=k;mg.click();}}}).catch(function(){});}}
  else{window.MJBEARER=null;show(false);try{document.body.classList.add('preauth');}catch(e0){}
  var c2=$id('mj-content');if(c2){c2.innerHTML='';c2.style.display='none';}
  var lk2=$id('mj-lock');if(lk2){lk2.style.display='';}
  var p2=$id('mj-pass');if(p2){p2.value='';}
  var er2=$id('mj-err');if(er2){er2.style.display='none';}
  var al2=$id('av-lockbox');if(al2){al2.style.display='';}
  var ac2=$id('auth-console');if(ac2){ac2.style.display='';}
  ['mj-key','b-key','img-key','av-key'].forEach(function(id3){var el=$id(id3);if(!el){return;}el.value='';var row=el.closest('.cta-row');if(row){row.style.display='';}});
  ['mj-tools','b-tools','img-tools','av-panel'].forEach(function(id3){var t=$id(id3);if(t){t.style.display='none';}});
  Array.prototype.forEach.call(document.querySelectorAll('.subnav-in a'),function(a2){a2.classList.remove('active');});
  try{localStorage.removeItem('pe_mjpass');localStorage.removeItem('pe_mjtab');localStorage.removeItem('pe_mjkey');}catch(e7){}}
}
function boot(){
  if(typeof supabase==='undefined'||!supabase.createClient){msg('Bibliothèque Supabase introuvable.','err');return;}
  CLIENT=supabase.createClient(ROOT,SBK,{auth:{persistSession:true,storageKey:'pe-mj-auth',autoRefreshToken:true,detectSessionInUrl:false}});
  CLIENT.auth.getSession().then(function(res){applySession(res&&res.data&&res.data.session);}).catch(function(){applySession(null);});
  CLIENT.auth.onAuthStateChange(function(evt,s){applySession(s);});
  $id('auth-go').addEventListener('click',doLogin);
  $id('auth-pass').addEventListener('keydown',function(e){if(e.key==='Enter'){doLogin();}});
  var lo=$id('mj-logout');if(lo){lo.addEventListener('click',function(ev){ev.preventDefault();if(CLIENT){CLIENT.auth.signOut();}applySession(null);msg('Déconnecté.','');});}
  $id('auth-out').addEventListener('click',function(){
    if(CLIENT){CLIENT.auth.signOut();}
    applySession(null);
    msg('Déconnecté.','');
  });
}
function doLogin(){
  var em=$id('auth-email').value.trim(),pw=$id('auth-pass').value;
  if(!em||!pw){msg('Saisis ton e-mail et ton mot de passe.','err');return;}
  msg('Connexion…','');
  CLIENT.auth.signInWithPassword({email:em,password:pw}).then(function(res){
    if(res&&res.error){throw res.error;}
    msg('Connecté ✓ — tes opérations dans les consoles sont signées par ton compte.','ok');
  }).catch(function(e){
    msg('Échec : '+(e&&e.message?e.message:'vérifie l’e-mail et le mot de passe.'),'err');
  });
}
boot();
})();
