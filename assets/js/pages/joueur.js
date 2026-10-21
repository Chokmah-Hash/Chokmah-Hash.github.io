/* PE_BUILD 2026.10.21-pj6 — Persos : châssis, armes/modules par tailles (T1-T4), dons du MJ (mot10) ; Personnages → fiches, onglet Équipement (mot11) */
var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var SESS=null;
var PERSOS=[],DONNS={},AVS=[],PING_TIMER=null,NOTE_TIMER=null;
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
 loadPersos();
 loadNotes();
 posOpts();
 if(PING_TIMER){clearInterval(PING_TIMER);}
 PING_TIMER=setInterval(function(){pingPresence();pingPosition();},20000);
 setTimeout(pingPresence,1500);
 try{
  var htab=(location.hash||'').replace('#','');
  if(htab==='av'||htab==='pj'||htab==='notes'||htab==='des'){localStorage.setItem('pe_pjtab',htab);}
  var pt=localStorage.getItem('pe_pjtab');if(pt){var pb=document.querySelector('.subnav [data-t="'+pt+'"],.tabs .tab[data-t="'+pt+'"]');if(pb){pb.click();}}
 }catch(e){}
}
/* ——— Onglets ——— */
Array.prototype.forEach.call(document.querySelectorAll('.subnav [data-t],.tabs .tab[data-t]'),function(b){
 b.addEventListener('click',function(){
  Array.prototype.forEach.call(document.querySelectorAll('.subnav [data-t],.tabs .tab[data-t]'),function(x){x.classList.remove('on');x.classList.remove('active');});
  b.classList.add('active');
  var t=b.getAttribute('data-t');
  ['av','pj','notes','des'].forEach(function(k){
   var pane=$('tab-'+k);
   if(pane){pane.classList.toggle('on',k===t);}
  });
  if(t==='av'){loadAventure();}
  if(t==='pj'){loadPersos();}
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
/* ——— Personnages ——— */
(function(){
 var sel=$('p-chassis'),opt='<option value="">— Choisir un châssis —</option>';
 EQ.CHASSIS_DB.forEach(function(c){opt+='<option value="'+esc(c.id)+'">'+esc(c.nom)+'</option>';});
 sel.innerHTML=opt;
 var selc=$('p-code'),optc='<option value="">— Choisir un code —</option>';
 Object.keys(CODES).forEach(function(k){optc+='<option value="'+esc(k)+'">'+esc(k)+'</option>';});
 selc.innerHTML=optc;
 sel.addEventListener('change',function(){
  var c=EQ.chassiDe(sel.value);
  if(!c){$('p-apt').textContent='';$('p-comp').textContent='';return;}
  $('st-m').value=c.st.m;$('st-cc').value=c.st.cc;$('st-ct').value=c.st.ct;$('st-f').value=c.st.f;$('st-e').value=c.st.e;
  $('st-pv').value=c.st.pv;$('st-a').value=c.st.a;$('st-cd').value=c.st.cd;$('st-sv').value=c.st.sv;$('st-rfx').value=c.st.rfx;
  if($('p-pv').value===''){$('p-pv').value=c.st.pv;}
  $('p-apt').textContent='Aptitude : '+c.apt;
  $('p-comp').textContent='Compétences maîtrisées : '+c.comp.join(', ');
 });
 selc.addEventListener('change',function(){
  if(selc.value){$('p-code').setAttribute('title',CODES[selc.value]);}
 });
})();
$('pj-new').addEventListener('click',function(){
 clearPersoForm();
 $('pj-form-sect').scrollIntoView({behavior:'smooth'});
 setTimeout(function(){$('p-nom').focus();},350);
});
/* Migration legacy : texte → équipement structuré */
function normaliserDonnees(d){
 if(!d||typeof d!=='object'||Array.isArray(d)){d={};}
 var mod=d.modules;
 if(!(mod&&mod!==null&&typeof mod==='object'&&Array.isArray(mod.capteurs)&&('coeur' in mod)&&('noyau' in mod)&&('bouclier' in mod))){
  mod={capteurs:[],coeur:null,noyau:null,bouclier:null};
 }
 var ch=null;
 if(d.chassis&&EQ.chassiDe(d.chassis)){ch=EQ.chassiDe(d.chassis);}
 else if(d.chassis&&EQ.chassiParNom(d.chassis)){ch=EQ.chassiParNom(d.chassis);}
 if(!ch){ch=EQ.CHASSIS_DB[0];}
 d.chassis=ch.id;
 var armesNouvelles=[];
 if(Array.isArray(d.armes)){
  d.armes.forEach(function(w){
   if(w&&typeof w==='object'&&w.id&&EQ.armeDe(w.id)){armesNouvelles.push(w.id);}
   else if(typeof w==='string'){
    var a=EQ.armeParNom(w)||EQ.armeDe(w);
    if(a){armesNouvelles.push(a.id);}
    else if(w){d.inventaire=(d.inventaire||[]);d.inventaire.push({uid:EQ.uid(),kind:'objet',nom:w});}
   }
  });
 }
 d.armes=armesNouvelles;
 if(Array.isArray(d.inventaire)){
  d.inventaire=d.inventaire.map(function(x){
   if(x&&typeof x==='object'){return x;}
   if(typeof x==='string'&&x){
    var a=EQ.armeParNom(x);
    if(a){return {uid:EQ.uid(),kind:'arme',id:a.id};}
    var m=EQ.moduleParNom(x);
    if(m){return {uid:EQ.uid(),kind:'module',id:m.id};}
    return {uid:EQ.uid(),kind:'objet',nom:x};
   }
   return null;
  }).filter(Boolean);
 }else{d.inventaire=[];}
 d.modules=mod;
 if(!d.st||typeof d.st!=='object'){d.st=ch.st;}
 return d;
}
function loadPersos(){
 if(!SESS){return;}
 setMsg('pj-status','Chargement de tes personnages…','');
 api(SB+'personnages?select=id,nom,data,maj&compte_id=eq.'+SESS.id+'&order=maj.desc',{headers:hdr()}).then(function(r){
  if(!r.ok){throw new Error('http');}
  return r.json();
 }).then(function(list){
  PERSOS=list||[];
  PERSOS.forEach(function(p){p.data=normaliserDonnees(p.data);});
  return loadDons(PERSOS.map(function(p){return p.id;}));
 }).then(function(){renderPersos();}).catch(function(){PERSOS=[];renderPersos(true);});
}
function loadDons(ids){
 DONNS={};
 if(!SESS||!ids||!ids.length){return Promise.resolve();}
 return api(SB+'equipement_dons?select=id,perso_id,item&perso_id=in.('+ids.join(',')+')',{headers:hdr()}).then(function(r){
  if(!r.ok){throw new Error('http');}
  return r.json();
 }).then(function(rows){
  DONNS={};
  (rows||[]).forEach(function(x){(DONNS[x.perso_id]=DONNS[x.perso_id]||[]).push(x);});
 }).catch(function(){DONNS={};});
}
function pvMax(p){var d=p.data||{};var st=d.st||{};var n=parseInt(st.pv,10);return isNaN(n)?0:n;}
/* — petit bouton texte compact — */
function petitBtn(txt,attrs){
 return '<button type="button" class="btn ghost" style="font-size:.68rem;padding:3px 10px;letter-spacing:.02em" '+attrs+'>'+esc(txt)+'</button>';
}
function badgeT(t){
 var coul=t>=4?'#e2604f':(t===3?'#f0b24a':(t===2?'#2ee6c9':'#7a9187'));
 return '<span class="badge" style="color:'+coul+';border-color:'+coul+'55">'+EQ.T(t)+'</span>';
}
function badgesArme(a){
 return '<span style="display:inline-flex;flex-wrap:wrap;gap:4px;align-items:center">'
  +badgeT(a.taille)
  +'<span class="badge">'+esc(a.portee)+'</span>'
  +'<span class="badge">Att '+esc(a.att)+'</span>'
  +'<span class="badge">F '+esc(a.f)+'</span>'
  +'<span class="badge">PA '+esc(a.pa)+'</span>'
  +'<span class="badge">D '+esc(a.d)+'</span>'
  +'</span>';
}
function cadreInterne(titre,droite,contenu,couleur){
 return '<div style="border:1px solid rgba(46,230,201,.18);border-radius:10px;padding:10px 12px;margin:10px 0">'
  +'<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between">'
  +'<span style="font-size:.66rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:'+(couleur||'#2ee6c9')+'">'+esc(titre)+'</span>'
  +(droite?'<span style="font-size:.68rem;color:var(--muted)">'+droite+'</span>':'')
  +'</div>'+contenu+'</div>';
}
function sousCadre(titre,droite,contenu){
 return '<div style="border:1px solid rgba(46,230,201,.13);border-radius:8px;padding:7px 9px;margin-top:7px">'
  +'<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between">'
  +'<span style="font-size:.62rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">'+esc(titre)+'</span>'
  +'<span style="font-size:.66rem;color:var(--muted)">'+droite+'</span>'
  +'</div>'+contenu+'</div>';
}
function ligneModule(nom,taille,desc,btn){
 return '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between;margin-top:5px">'
  +'<div><span style="color:#c8e9df;font-weight:700;font-size:.85rem">'+esc(nom)+'</span> '+badgeT(taille)
  +(desc?'<div style="font-size:.72rem;color:var(--muted);margin-top:2px">'+esc(desc)+'</div>':'')
  +'</div>'+(btn||'')+'</div>';
}
function cartePerso(p,i){
 var d=p.data||{},st=d.st||{},ch=EQ.chassiDe(d.chassis)||EQ.CHASSIS_DB[0];
 var pvM=pvMax(p),pvA=(typeof d.pv_actuels==='number')?d.pv_actuels:pvM;
 var pct=pvM?Math.max(0,Math.min(100,Math.round(pvA*100/pvM))):0;
 var coulBar=pct>60?'#2ee6c9':(pct>30?'#f0b24a':'#e2604f');
 var out='<div class="card" style="padding-bottom:14px">'
  +'<button type="button" class="del-btn" data-dp="'+i+'" title="Supprimer">✕</button>'
  +'<button type="button" class="edit-btn" data-ep="'+i+'" title="Modifier">✎</button>'
  +'<h3>'+esc(p.nom)+'</h3>'
  +'<span class="badge amber">'+esc(ch.nom)+'</span>'
  +(d.code?' <span class="badge">'+esc(d.code)+'</span>':'')
  +'<div class="pvrow"><button type="button" class="pvbtn dmg" data-hurt="'+i+'">−</button>'
  +'<span class="pvnum">'+pvA+'</span><span style="color:var(--muted)">/ '+pvM+' PV</span>'
  +'<button type="button" class="pvbtn" data-heal="'+i+'">+</button>'
  +'<span style="color:var(--amber);font-family:\'Rajdhani\',sans-serif;font-weight:700;margin-left:8px">'+(d.xp||0)+' XP</span>'
  +'<button type="button" class="xpbtn" data-xp="'+i+'">+</button>'
  +'</div>';
 /* ① Caractéristiques */
 out+='<div class="tscroll"><table class="rt mini"><tr><th>M</th><th>CC</th><th>CT</th><th>F</th><th>E</th><th>PV</th><th>A</th><th>Cd</th><th>Sv</th><th>Rfx</th></tr><tr>'
  +'<td>'+esc(st.m||'—')+'</td><td>'+esc(st.cc||'—')+'</td><td>'+esc(st.ct||'—')+'</td><td>'+esc(st.f||'—')+'</td><td>'+esc(st.e||'—')+'</td>'
  +'<td>'+esc(st.pv||'—')+'</td><td>'+esc(st.a||'—')+'</td><td>'+esc(st.cd||'—')+'</td><td>'+esc(st.sv||'—')+'</td><td>'+esc(st.rfx||'—')+'</td>'
  +'</tr></table></div>'
  +'<div class="pjbar" title="Points de vie"><span style="width:'+pct+'%;background:'+coulBar+'"></span></div>';
 /* ② Châssis */
 var selCh='<select class="fld" data-chg="'+i+'" style="margin-top:8px;font-size:.78rem;padding:4px 8px;width:auto">'
  +EQ.CHASSIS_DB.map(function(c){return '<option value="'+esc(c.id)+'"'+(c.id===ch.id?' selected':'')+'>'+esc(c.nom)+'</option>';}).join('')
  +'</select>';
 var nCap=(d.modules.capteurs||[]).length;
 var contenuCap=(nCap?(d.modules.capteurs||[]).map(function(mid,k){
   var m=EQ.moduleDe(mid);if(!m){return '';}
   return ligneModule(m.nom,m.taille,m.desc,petitBtn('Ranger','data-rqm="'+i+':capteur:'+k+'"'));
  }).join(''):'<div style="font-size:.75rem;color:var(--muted);margin-top:4px">Aucun capteur équipé.</div>');
 var mCo=EQ.moduleDe(d.modules.coeur);
 var contenuCo=(mCo?ligneModule(mCo.nom,mCo.taille,mCo.desc,petitBtn('Ranger','data-rqm="'+i+':coeur:0"')):'<div style="font-size:.75rem;color:var(--muted);margin-top:4px">Aucun cœur équipé.</div>');
 var mNo=EQ.moduleDe(d.modules.noyau);
 var contenuNo=(mNo?ligneModule(mNo.nom,mNo.taille,mNo.desc,petitBtn('Ranger','data-rqm="'+i+':noyau:0"')):'<div style="font-size:.75rem;color:var(--muted);margin-top:4px">Aucun noyau équipé.</div>');
 var mBo=EQ.moduleDe(d.modules.bouclier);
 var contenuBo=(mBo?ligneModule(mBo.nom,mBo.taille,mBo.desc,petitBtn('Ranger','data-rqm="'+i+':bouclier:0"')):'<div style="font-size:.75rem;color:var(--muted);margin-top:4px">Aucun bouclier équipé.</div>');
 var cadresModules=sousCadre('Capteurs ('+nCap+'/'+ch.capteurs.n+' — '+EQ.T(ch.capteurs.t)+' max)','',contenuCap)
  +sousCadre('Cœur énergétique ('+EQ.T(ch.coeur.t)+' max)','',contenuCo)
  +sousCadre('Noyau énergétique ('+EQ.T(ch.noyau.t)+' max)','',contenuNo)
  +sousCadre(ch.bouclier.n?('Bouclier ('+EQ.T(ch.bouclier.t)+' max)'):'Bouclier (aucun emplacement)','',contenuBo);
 out+=cadreInterne('Châssis — emplacements : armes '+EQ.T(ch.armes.t)+' max ×'+ch.armes.n,'',selCh+cadresModules,'#f0b24a');
 /* ③ Armes équipées */
 var armesEq=(d.armes||[]);
 var itemsArmes=armesEq.map(function(wid,k){
   var a=EQ.armeDe(wid);
   if(!a){return '<li>'+esc(wid)+'</li>';}
   return '<li style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between">'
    +'<span><span style="color:#c8e9df;font-weight:700">'+esc(a.nom)+'</span> '+(a.regle&&a.regle!=='—'?'<span style="font-size:.7rem;color:var(--muted)">'+esc(a.regle)+'</span>':'')+'</span>'
    +'<span style="display:inline-flex;gap:6px;align-items:center">'+badgesArme(a)+petitBtn('Ranger','data-rq="'+i+':'+k+'"')+'</span>'
    +'</li>';
  }).join('');
 var contenuArmes=(armesEq.length?'<ul class="armeslist" style="margin-top:5px">'+itemsArmes+'</ul>':'<div style="font-size:.75rem;color:var(--muted);margin-top:4px">Aucune arme équipée — équipe depuis ton inventaire.</div>');
 out+=cadreInterne('Armes équipées ('+armesEq.length+'/'+ch.armes.n+' — '+EQ.T(ch.armes.t)+' max)','',contenuArmes,undefined);
 /* ④ Inventaire */
 var dons=(DONNS[p.id]||[]);
 var inv=(d.inventaire||[]);
 var contenuInv='';
 dons.forEach(function(don){
  var it=don.item||{};
  var nom=EQ.nomItem(it);
  var taille=(it.kind==='arme'&&EQ.armeDe(it.id))?EQ.armeDe(it.id).taille:((it.kind==='module'&&EQ.moduleDe(it.id))?EQ.moduleDe(it.id).taille:null);
  var v=(it.kind==='arme'||it.kind==='module')?EQ.peutEquiper(d,it):{ok:false,raison:'objet simple (pas d\u2019emplacement)'};
  contenuInv+='<li style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between;border:1px dashed rgba(240,178,74,.4);border-radius:8px;padding:6px 8px">'
   +'<span><span style="color:#f0b24a;font-weight:700">'+esc(nom)+'</span> '+(taille?badgeT(taille):'')
   +'<span class="badge amber" style="margin-left:6px">Don du Maître de la Tombe</span></span>'
   +'<span>'
   +(v.ok?petitBtn('Équiper','data-don="'+i+':'+don.id+':eq"'):'')
   +petitBtn('Ranger','data-don="'+i+':'+don.id+':inv"')
   +'</span>'
   +'</li>';
 });
 inv.forEach(function(it){
  if(!it||!it.uid){return;}
  var nom=EQ.nomItem(it);
  var taille=(it.kind==='arme'&&EQ.armeDe(it.id))?EQ.armeDe(it.id).taille:((it.kind==='module'&&EQ.moduleDe(it.id))?EQ.moduleDe(it.id).taille:null);
  var desc=(it.kind==='module'&&EQ.moduleDe(it.id))?EQ.moduleDe(it.id).desc:((it.kind==='arme'&&EQ.armeDe(it.id)&&EQ.armeDe(it.id).regle!=='—')?EQ.armeDe(it.id).regle:null);
  var v=(it.kind==='arme'||it.kind==='module')?EQ.peutEquiper(d,it):{ok:false,raison:'objet simple (pas d\u2019emplacement)'};
  contenuInv+='<li style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between">'
   +'<span><span style="color:#c8e9df;font-weight:700">'+esc(nom)+'</span> '+(taille?badgeT(taille):'')
   +(desc?'<div style="font-size:.72rem;color:var(--muted);margin-top:2px">'+esc(desc)+'</div>':'')+'</span>'
   +'<span>'
   +((it.kind==='arme'||it.kind==='module')?(v.ok?petitBtn('Équiper','data-eq="'+i+':'+it.uid+'"'):('<span style="font-size:.68rem;color:var(--muted)" title="'+esc(v.raison)+'">'+esc(v.raison)+'</span>')):'')
   +petitBtn('Retirer','data-jet="'+i+':'+it.uid+'"')
   +'</span>'
   +'</li>';
 });
 if(!contenuInv){
  contenuInv='<div style="font-size:.75rem;color:var(--muted);margin-top:4px">Inventaire vide. Le Maître de la Tombe peut t\u2019y remettre de l\u2019équipement.</div>';
 }else{
  contenuInv='<ul class="armeslist" style="margin-top:5px;display:grid;gap:6px">'+contenuInv+'</ul>';
 }
 out+=cadreInterne('Inventaire ('+inv.length+(dons.length?' + '+dons.length+' don(s) en attente':'')+')','',contenuInv);
 if(d.notes){out+='<p class="complist" style="font-style:italic">'+esc(d.notes)+'</p>';}
 out+='</div>';
 return out;
}
function renderPersos(err){
 var out='';
 if(err){
  setMsg('pj-status','Base inaccessible — vérifie ta connexion internet.','err');
 }else if(!PERSOS.length){
  setMsg('pj-status','','');
  out='<div class="empty-box">Tu n\u2019as pas encore de personnage — crée le premier avec le bouton « Nouveau personnage ».</div>';
 }else{
  setMsg('pj-status',PERSOS.length+' personnage(s) enregistré(s). Les infos se modifient avec ✎ ; l\u2019équipement se gère directement sur la fiche.','');
  out+='<div class="grid3">';
  PERSOS.forEach(function(p,i){out+=cartePerso(p,i);});
  out+='</div>';
 }
 $('pj-list').innerHTML=out;
}
/* — délégation d'événements sur la liste — */
$('pj-list').addEventListener('click',function(ev){
 var b=ev.target.closest?ev.target.closest('button'):null;
 if(!b||!$('pj-list').contains(b)){return;}
 var m;
 if((m=b.getAttribute('data-ep'))!==null){fillPerso(PERSOS[parseInt(m,10)]);}
 else if((m=b.getAttribute('data-dp'))!==null){delPerso(PERSOS[parseInt(m,10)]);}
 else if((m=b.getAttribute('data-hurt'))!==null){bumpPv(PERSOS[parseInt(m,10)],-1);}
 else if((m=b.getAttribute('data-heal'))!==null){bumpPv(PERSOS[parseInt(m,10)],1);}
 else if((m=b.getAttribute('data-xp'))!==null){bumpXp(PERSOS[parseInt(m,10)]);}
 else if((m=b.getAttribute('data-eq'))!==null&&!b.disabled){equiperItem(PERSOS[parseInt(m.split(':')[0],10)],m.split(':')[1]);}
 else if((m=b.getAttribute('data-rq'))!==null){var pa=m.split(':');rangerArme(PERSOS[parseInt(pa[0],10)],parseInt(pa[1],10));}
 else if((m=b.getAttribute('data-rqm'))!==null){var pb=m.split(':');rangerModule(PERSOS[parseInt(pb[0],10)],pb[1],parseInt(pb[2],10));}
 else if((m=b.getAttribute('data-jet'))!==null){jeterItem(PERSOS[parseInt(m.split(':')[0],10)],m.split(':')[1]);}
 else if((m=b.getAttribute('data-don'))!==null){var pc=m.split(':');prendreDon(PERSOS[parseInt(pc[0],10)],pc[1],pc[2]);}
});
$('pj-list').addEventListener('change',function(ev){
 var sel=ev.target;
 if(sel&&sel.getAttribute&&sel.getAttribute('data-chg')!==null){
  var i=parseInt(sel.getAttribute('data-chg'),10);
  changerChassis(PERSOS[i],sel.value);
 }
});
function apresAction(p,msg,errPerso){
 setMsg('pj-status',msg,'ok');
 patchPerso(p).then(function(){loadPersos();}).catch(function(e){
  if(e&&e.message==='session'){return;}
  setMsg('pj-status',errPerso||'Échec de l\u2019enregistrement — réessaie.','err');
 });
}
function equiperItem(p,u){
 if(!p){return;}
 var d=p.data,inv=d.inventaire||[],it=null,k=-1;
 for(var j=0;j<inv.length;j++){if(inv[j]&&inv[j].uid===u){it=inv[j];k=j;break;}}
 if(!it){return;}
 var v=EQ.peutEquiper(d,it);
 if(!v.ok){setMsg('pj-status','Impossible d\u2019équiper « '+EQ.nomItem(it)+' » : '+v.raison+'.','err');return;}
 inv.splice(k,1);
 if(it.kind==='arme'){d.armes.push(it.id);}
 else{var mo=EQ.moduleDe(it.id);if(mo){if(mo.cat==='capteur'){d.modules.capteurs.push(mo.id);}else{d.modules[mo.cat]=mo.id;}}}
 apresAction(p,'« '+EQ.nomItem(it)+' » équipé.');
}
function rangerArme(p,idx){
 if(!p){return;}
 var d=p.data,wid=(d.armes||[])[idx];
 if(!wid){return;}
 var a=EQ.armeDe(wid);
 d.armes.splice(idx,1);
 (d.inventaire=d.inventaire||[]).push({uid:EQ.uid(),kind:'arme',id:wid});
 apresAction(p,'« '+(a?a.nom:wid)+' » rangé dans l\u2019inventaire.');
}
function rangerModule(p,cat,idx){
 if(!p){return;}
 var d=p.data,mid=null;
 if(cat==='capteur'){mid=(d.modules.capteurs||[])[idx];if(!mid){return;}d.modules.capteurs.splice(idx,1);}
 else{mid=d.modules[cat];if(!mid){return;}d.modules[cat]=null;}
 var m=EQ.moduleDe(mid);
 (d.inventaire=d.inventaire||[]).push({uid:EQ.uid(),kind:'module',id:mid});
 apresAction(p,'« '+(m?m.nom:mid)+' » rangé dans l\u2019inventaire.');
}
function jeterItem(p,u){
 if(!p){return;}
 var d=p.data,inv=d.inventaire||[],nom='?';
 for(var j=0;j<inv.length;j++){
  if(inv[j]&&inv[j].uid===u){nom=EQ.nomItem(inv[j]);inv.splice(j,1);break;}
 }
 apresAction(p,'« '+nom+' » retiré de l\u2019inventaire.');
}
function prendreDon(p,donId,mode){
 if(!p){return;}
 var dons=DONNS[p.id]||[],don=null;
 for(var j=0;j<dons.length;j++){if(dons[j].id===donId){don=dons[j];break;}}
 if(!don||!don.item){return;}
 var it=don.item,d=p.data;
 if(mode==='eq'){
  var v=EQ.peutEquiper(d,it);
  if(!v.ok){setMsg('pj-status','Impossible d\u2019équiper « '+EQ.nomItem(it)+' » : '+v.raison+'.','err');return;}
  if(it.kind==='arme'){d.armes.push(it.id);}
  else{var mo=EQ.moduleDe(it.id);if(mo){if(mo.cat==='capteur'){d.modules.capteurs.push(mo.id);}else{d.modules[mo.cat]=mo.id;}}}
 }else{
  (d.inventaire=d.inventaire||[]).push({uid:EQ.uid(),kind:it.kind||'objet',id:it.id,nom:it.nom});
 }
 setMsg('pj-status','Don du Maître de la Tombe récupéré.','ok');
 patchPerso(p).then(function(){
  return api(SB+'equipement_dons?id=eq.'+donId,{method:'DELETE',headers:hdr()});
 }).then(function(r){
  if(!r.ok){throw new Error('http');}
  loadPersos();
 }).catch(function(e){
  if(e&&e.message==='session'){return;}
  setMsg('pj-status','Don récupéré mais pas encore retiré de la file — réessaie dans un instant.','err');
  loadDons(PERSOS.map(function(pp){return pp.id;})).then(function(){renderPersos();});
 });
}
function changerChassis(p,nouvId){
 if(!p||!nouvId){return;}
 var d=p.data;
 if(d.chassis===nouvId){return;}
 var ranges=EQ.rangerChangement(d,nouvId);
 var ch=EQ.chassiDe(nouvId);
 d.st=ch.st;d.apt=ch.apt;d.comp=ch.comp.slice();
 apresAction(p,'Châssis : '+ch.nom+(ranges.length?' — rangé automatiquement : '+ranges.join(', '):''));
}
function findPerso(id){for(var i=0;i<PERSOS.length;i++){if(PERSOS[i].id===id){return PERSOS[i];}}return null;}
function patchPerso(p){
 return api(SB+'personnages?id=eq.'+p.id,{method:'PATCH',headers:hdr({'Prefer':'return=minimal'}),body:JSON.stringify({nom:p.nom,data:p.data})}).then(function(r){
  if(r.status===401){throw new Error('session');}
  if(!r.ok){throw new Error('http');}
 });
}
function bumpPv(p,delta){
 if(!p){return;}
 var d=p.data||(p.data={});
 var m=pvMax(p);
 var v=(typeof d.pv_actuels==='number')?d.pv_actuels:m;
 v=v+delta;
 if(v<0){v=0;}
 if(m&&v>m){v=m;}
 d.pv_actuels=v;
 patchPerso(p).then(function(){renderPersos();}).catch(function(e){
  if(e&&e.message==='session'){return;}
  setMsg('pj-status','Échec de l\u2019enregistrement — réessaie.','err');
 });
}
function bumpXp(p){
 if(!p){return;}
 var d=p.data||(p.data={});
 d.xp=(typeof d.xp==='number')?d.xp+1:1;
 patchPerso(p).then(function(){renderPersos();}).catch(function(e){
  if(e&&e.message==='session'){return;}
  setMsg('pj-status','Échec de l\u2019enregistrement — réessaie.','err');
 });
}
function fillPerso(p){
 if(!p){return;}
 var d=p.data||{},st=d.st||{},ch=EQ.chassiDe(d.chassis);
 $('p-id').value=p.id;
 $('p-nom').value=p.nom||'';
 $('p-chassis').value=d.chassis||'';
 $('p-code').value=d.code||'';
 $('st-m').value=st.m||'';$('st-cc').value=st.cc||'';$('st-ct').value=st.ct||'';$('st-f').value=st.f||'';$('st-e').value=st.e||'';
 $('st-pv').value=st.pv||'';$('st-a').value=st.a||'';$('st-cd').value=st.cd||'';$('st-sv').value=st.sv||'';$('st-rfx').value=st.rfx||'';
 $('p-pv').value=(typeof d.pv_actuels==='number')?d.pv_actuels:(st.pv||'');
 $('p-xp').value=(typeof d.xp==='number')?d.xp:0;
 $('p-notes').value=d.notes||'';
 $('p-apt').textContent=ch?('Aptitude : '+ch.apt):'';
 $('p-comp').textContent=ch?('Compétences maîtrisées : '+ch.comp.join(', ')):'';
 $('pj-form-title').textContent='✎ Modifier : '+(p.nom||'?');
 $('p-del').style.display='';
 setMsg('pj-msg','« '+(p.nom||'')+' » chargé dans le formulaire. Les armes, modules et l\u2019inventaire restent sur la fiche.','');
 $('pj-form-sect').scrollIntoView({behavior:'smooth'});
}
function clearPersoForm(){
 ['p-id','p-nom','st-m','st-cc','st-ct','st-f','st-e','st-pv','st-a','st-cd','st-sv','st-rfx','p-pv','p-notes'].forEach(function(id){$(id).value='';});
 $('p-chassis').value='';$('p-code').value='';$('p-xp').value='0';
 $('p-apt').textContent='';$('p-comp').textContent='';
 $('pj-form-title').textContent='✚ Nouveau personnage';
 $('p-del').style.display='none';
 setMsg('pj-msg','');
}
function delPerso(p){
 if(!p){return;}
 if(!window.confirm('Supprimer définitivement « '+(p.nom||'')+' » ?')){return;}
 api(SB+'personnages?id=eq.'+p.id,{method:'DELETE',headers:hdr()}).then(function(r){
  if(!r.ok){throw new Error('http');}
  clearPersoForm();
  loadPersos();
 }).catch(function(){setMsg('pj-status','Échec de la suppression — réessaie.','err');});
}
function savePerso(ev){
 ev.preventDefault();
 var nom=$('p-nom').value.trim();
 var chassisId=$('p-chassis').value;
 if(!nom){setMsg('pj-msg','Le nom est obligatoire.','err');return;}
 if(!chassisId){setMsg('pj-msg','Choisis un châssis.','err');return;}
 var ch=EQ.chassiDe(chassisId);
 var id=$('p-id').value;
 var data;
 if(id){
  var p=findPerso(id);
  if(!p){setMsg('pj-msg','Personnage introuvable — recharge la page.','err');return;}
  data=normaliserDonnees(p.data);
  if(data.chassis!==chassisId){EQ.rangerChangement(data,chassisId);}
 }else{
  data={chassis:chassisId,armes:[],modules:{capteurs:[],coeur:null,noyau:null,bouclier:null},inventaire:[]};
 }
 data.st={m:$('st-m').value.trim(),cc:$('st-cc').value.trim(),ct:$('st-ct').value.trim(),f:$('st-f').value.trim(),e:$('st-e').value.trim(),pv:$('st-pv').value.trim(),a:$('st-a').value.trim(),cd:$('st-cd').value.trim(),sv:$('st-sv').value.trim(),rfx:$('st-rfx').value.trim()};
 data.code=$('p-code').value;
 data.apt=ch.apt;
 data.comp=ch.comp.slice();
 data.pv_actuels=($('p-pv').value==='')?(parseInt(ch.st.pv,10)||0):(parseInt($('p-pv').value,10)||0);
 data.xp=($('p-xp').value==='')?0:(parseInt($('p-xp').value,10)||0);
 data.notes=$('p-notes').value;
 setMsg('pj-msg','Enregistrement…','');
 if(id){
  api(SB+'personnages?id=eq.'+id,{method:'PATCH',headers:hdr({'Prefer':'return=minimal'}),body:JSON.stringify({nom:nom,data:data})}).then(function(r){
   if(r.status===401){throw new Error('session');}
   if(!r.ok){throw new Error('http');}
   setMsg('pj-msg','« '+nom+' » mis à jour','ok');
   loadPersos();
  }).catch(function(e){
   if(e&&e.message==='session'){return;}
   setMsg('pj-msg','Échec de l\u2019enregistrement — réessaie.','err');
  });
 }else{
  api(SB+'personnages',{method:'POST',headers:hdr({'Prefer':'return=minimal'}),body:JSON.stringify({compte_id:SESS.id,nom:nom,data:data})}).then(function(r){
   if(r.status===401){throw new Error('session');}
   if(!r.ok){throw new Error('http');}
   setMsg('pj-msg','« '+nom+' » créé','ok');
   clearPersoForm();
   loadPersos();
  }).catch(function(e){
   if(e&&e.message==='session'){return;}
   setMsg('pj-msg','Échec de la création — réessaie.','err');
  });
 }
}
$('pj-form').addEventListener('submit',savePerso);
$('p-clear').addEventListener('click',clearPersoForm);
$('p-del').addEventListener('click',function(){
 var id=$('p-id').value;
 if(!id){return;}
 var p=findPerso(id);
 if(p){delPerso(p);}
});
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
