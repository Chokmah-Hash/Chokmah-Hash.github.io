
/* PE_BUILD 2026.10.18-pj3 — hero Mon Espace masque dans l app, deconnexion (nom) dans la sous-nav */
var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var SESS=null;
var PERSOS=[],AVS=[],PING_TIMER=null,NOTE_TIMER=null;
var CHASSIS={
'Fantassin programmé':{st:{m:'10 m',cc:'4+',ct:'4+',f:'4',e:'4',pv:'3',a:'1',cd:'7+',sv:'4+',rfx:'+0'},apt:'Discipline sans faille : relancez 1 test de Commandement raté par scène.',comp:['Athlétisme','Technologie']},
'Vétéran':{st:{m:'10 m',cc:'3+',ct:'3+',f:'5',e:'5',pv:'3',a:'1',cd:'8+',sv:'3+',rfx:'+1'},apt:'Élite : vos touches critiques (6 naturels) infligent +1 dégât.',comp:['Athlétisme','Perception']},
'Traqueur':{st:{m:'10 m',cc:'3+',ct:'3+',f:'5',e:'5',pv:'3',a:'1',cd:'8+',sv:'3+',rfx:'+2'},apt:'Embuscade : 1 fois par scène, apparaissez dans un rayon de 6 m de n\u2019importe quelle position, même derrière l\u2019ennemi (après 1 round de délai).',comp:['Furtivité','Perception','Pilotage']},
'Ombre':{st:{m:'10 m',cc:'3+',ct:'6+',f:'5',e:'4',pv:'3',a:'3',cd:'8+',sv:'4+',rfx:'+2'},apt:'Peau d\u2019ombre : vos tests de Furtivité sont à 3+ ; les ennemis qui vous voient subissent -1 à leur Cd.',comp:['Furtivité','Intimidation']},
'Sentinelle':{st:{m:'10 m',cc:'3+',ct:'4+',f:'6',e:'5',pv:'6',a:'2',cd:'8+',sv:'3+',rfx:'+1'},apt:'Écran : 1 fois par round, prenez une frappe destinée à un allié à 2 m ou moins (après sa sauvegarde).',comp:['Athlétisme','Intimidation']},
'Officier de garde':{st:{m:'10 m',cc:'3+',ct:'3+',f:'5',e:'5',pv:'12',a:'3',cd:'8+',sv:'3+',rfx:'+1'},apt:'Ordre de secours : 1 fois par scène, forcez un allié à relancer immédiatement son jet de Protocole de Secours.',comp:['Commandement','Technologie']},
'Artificier':{st:{m:'10 m',cc:'3+',ct:'3+',f:'4',e:'5',pv:'12',a:'2',cd:'8+',sv:'4+',rfx:'+1'},apt:'Essaim réparateur : 1 fois par scène, soignez D3 PV d\u2019un allié (ou de vous-même) à 6 m.',comp:['Technologie','Érudition','Perception']},
'Énergicien':{st:{m:'10 m',cc:'3+',ct:'3+',f:'5',e:'5',pv:'12',a:'3',cd:'8+',sv:'4+',rfx:'+1'},apt:'Décharge : 1 fois par scène, infligez une attaque F7, PA -2, D 2 à tous les ennemis dans un rayon de 3 m.',comp:['Technologie','Érudition']},
'Commandant':{st:{m:'10 m',cc:'3+',ct:'3+',f:'6',e:'6',pv:'15',a:'4',cd:'9+',sv:'3+',rfx:'+1'},apt:'Aura de commandement : les alliés à 6 m relancent les jets de toucher de 1.',comp:['Commandement','Intimidation','Érudition']},
'Seigneur de guerre':{st:{m:'10 m',cc:'2+',ct:'2+',f:'6',e:'6',pv:'18',a:'5',cd:'10+',sv:'3+',rfx:'+1'},apt:'Volonté inflexible : relancez 1 échec par round (n\u2019importe quel jet).',comp:['Commandement','Érudition','Intimidation','Technologie']}};
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
function sha256hex(s){
  if(!(window.crypto&&crypto.subtle)){return Promise.reject(new Error('crypto'));}
  return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(buf){
    var u=new Uint8Array(buf),out='';
    for(var i=0;i<u.length;i++){out+=('0'+u[i].toString(16)).slice(-2);}
    return out;
  });
}
function newToken(){
  if(window.crypto&&crypto.randomUUID){return crypto.randomUUID().replace(/-/g,'');}
  var s='';for(var i=0;i<2;i++){s+=Math.random().toString(36).slice(2)+Date.now().toString(36);}return s.slice(0,32);
}
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
        if(s.statut==='valide'){if(RTIMER){clearInterval(RTIMER);RTIMER=null;}$('r-form').style.display='';rMsg('✅ Le Maître de la Tombe a autorisé ta demande — saisis ton nouveau mot de passe (5 minutes).','ok');}
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
  try{var pt=localStorage.getItem('pe_pjtab');if(pt){var pb=document.querySelector('.subnav [data-t="'+pt+'"],.tabs .tab[data-t="'+pt+'"]');if(pb){pb.click();}}}catch(e){}
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
function loadAventure(){
  if(!SESS){return;}
  setMsg('av-status','Chargement de l\u2019aventure…','');
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
        +'<span class="ico">⚔️</span>'
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
      setMsg("pos-status","Position enregistr\u00e9e \u2014 le MJ te voit sur la carte.","ok");
    }
  }).catch(function(){});
}
function savePos(){
  if(!SESS){return;}
  var v=$("pos-sys").value;
  var sys=v?parseInt(v,10):null;
  var lieu=$("pos-lieu").value.trim();
  api(SB+"positions?on_conflict=compte_id",{method:"POST",headers:hdr({"Prefer":"resolution=merge-duplicates"}),body:JSON.stringify({compte_id:SESS.id,galaxie_id:sys,lieu:lieu,maj:nowIso()})}).then(function(r){
    if(r.ok){POS={sys:sys,lieu:lieu};setMsg("pos-status","\u2713 Position enregistr\u00e9e \u2014 le MJ te voit sur la carte.","ok");}
    else{setMsg("pos-status","Enregistrement impossible ("+r.status+").","err");}
  }).catch(function(){setMsg("pos-status","Base inaccessible.","err");});
}
function clearPos(){
  if(!SESS){return;}
  api(SB+"positions?compte_id=eq."+SESS.id,{method:"DELETE",headers:hdr()}).then(function(r){
    if(r.ok){POS={sys:null,lieu:""};$("pos-sys").value="";$("pos-lieu").value="";setMsg("pos-status","Position effac\u00e9e.","");}
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
  Object.keys(CHASSIS).forEach(function(k){opt+='<option value="'+esc(k)+'">'+esc(k)+'</option>';});
  sel.innerHTML=opt;
  var selc=$('p-code'),optc='<option value="">— Choisir un code —</option>';
  Object.keys(CODES).forEach(function(k){optc+='<option value="'+esc(k)+'">'+esc(k)+'</option>';});
  selc.innerHTML=optc;
  sel.addEventListener('change',function(){
    var c=CHASSIS[sel.value];
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
function loadPersos(){
  if(!SESS){return;}
  setMsg('pj-status','Chargement de tes personnages…','');
  api(SB+'personnages?select=id,nom,data,maj&compte_id=eq.'+SESS.id+'&order=maj.desc',{headers:hdr()}).then(function(r){
    if(!r.ok){throw new Error('http');}
    return r.json();
  }).then(function(list){
    PERSOS=list||[];
    renderPersos();
  }).catch(function(){PERSOS=[];renderPersos(true);});
}
function pvMax(p){var d=p.data||{};var st=d.st||{};var n=parseInt(st.pv,10);return isNaN(n)?0:n;}
function renderPersos(err){
  var out='';
  if(err){
    setMsg('pj-status','Base inaccessible — vérifie ta connexion internet.','err');
  }else if(!PERSOS.length){
    setMsg('pj-status','','');
    out='<div class="empty-box">Tu n\u2019as pas encore de personnage — crée le premier avec le formulaire ci-dessous ⬇</div>';
  }else{
    setMsg('pj-status',PERSOS.length+' personnage(s) enregistré(s). Clique sur ✎ pour modifier, 🗑 pour supprimer.','');
    out+='<div class="grid3">';
    PERSOS.forEach(function(p,i){
      var d=p.data||{},st=d.st||{};
      var pvA=(typeof d.pv_actuels==='number')?d.pv_actuels:pvMax(p);
      var pvM=pvMax(p);
      var armes=d.armes||[],inv=d.inventaire||[];
      out+='<div class="card" style="padding-bottom:14px">'
        +'<button type="button" class="del-btn" data-dp="'+i+'" title="Supprimer">🗑</button>'
        +'<button type="button" class="edit-btn" data-ep="'+i+'" title="Modifier">✎</button>'
        +'<h3>'+esc(p.nom)+'</h3>'
        +(d.chassis?'<span class="badge">'+esc(d.chassis)+'</span>':'')
        +(d.code?' <span class="badge amber">'+esc(d.code)+'</span>':'')
        +'<div class="pvrow"><button type="button" class="pvbtn dmg" data-hurt="'+i+'">−</button>'
        +'<span class="pvnum">'+pvA+'</span><span style="color:var(--muted)">/ '+pvM+' PV</span>'
        +'<button type="button" class="pvbtn" data-heal="'+i+'">+</button>'
        +'<span style="color:var(--amber);font-family:\'Rajdhani\',sans-serif;font-weight:700;margin-left:8px">'+(d.xp||0)+' XP</span>'
        +'<button type="button" class="xpbtn" data-xp="'+i+'">+</button>'
        +'</div>'
        +'<div class="tscroll"><table class="rt mini"><tr><th>M</th><th>CC</th><th>CT</th><th>F</th><th>E</th><th>PV</th><th>A</th><th>Cd</th><th>Sv</th><th>Rfx</th></tr><tr>'
        +'<td>'+esc(st.m||'—')+'</td><td>'+esc(st.cc||'—')+'</td><td>'+esc(st.ct||'—')+'</td><td>'+esc(st.f||'—')+'</td><td>'+esc(st.e||'—')+'</td>'
        +'<td>'+esc(st.pv||'—')+'</td><td>'+esc(st.a||'—')+'</td><td>'+esc(st.cd||'—')+'</td><td>'+esc(st.sv||'—')+'</td><td>'+esc(st.rfx||'—')+'</td>'
        +'</tr></table></div>';
      if(armes.length){out+='<ul class="armeslist">'+armes.map(function(w){return '<li>'+esc(w)+'</li>';}).join('')+'</ul>';}
      if(inv.length){out+='<ul class="armeslist">'+inv.map(function(w){return '<li>'+esc(w)+'</li>';}).join('')+'</ul>';}
      if(d.notes){out+='<p class="complist" style="font-style:italic">'+esc(d.notes)+'</p>';}
      out+='</div>';
    });
    out+='</div>';
  }
  $('pj-list').innerHTML=out;
  Array.prototype.forEach.call(document.querySelectorAll('[data-ep]'),function(b){b.addEventListener('click',function(){fillPerso(PERSOS[parseInt(b.getAttribute('data-ep'),10)]);});});
  Array.prototype.forEach.call(document.querySelectorAll('[data-dp]'),function(b){b.addEventListener('click',function(){delPerso(PERSOS[parseInt(b.getAttribute('data-dp'),10)]);});});
  Array.prototype.forEach.call(document.querySelectorAll('[data-hurt]'),function(b){b.addEventListener('click',function(){bumpPv(PERSOS[parseInt(b.getAttribute('data-hurt'),10)],-1);});});
  Array.prototype.forEach.call(document.querySelectorAll('[data-heal]'),function(b){b.addEventListener('click',function(){bumpPv(PERSOS[parseInt(b.getAttribute('data-heal'),10)],1);});});
  Array.prototype.forEach.call(document.querySelectorAll('[data-xp]'),function(b){b.addEventListener('click',function(){bumpXp(PERSOS[parseInt(b.getAttribute('data-xp'),10)]);});});
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
  var d=p.data||{},st=d.st||{};
  $('p-id').value=p.id;
  $('p-nom').value=p.nom||'';
  $('p-chassis').value=d.chassis||'';
  $('p-code').value=d.code||'';
  $('st-m').value=st.m||'';$('st-cc').value=st.cc||'';$('st-ct').value=st.ct||'';$('st-f').value=st.f||'';$('st-e').value=st.e||'';
  $('st-pv').value=st.pv||'';$('st-a').value=st.a||'';$('st-cd').value=st.cd||'';$('st-sv').value=st.sv||'';$('st-rfx').value=st.rfx||'';
  $('p-pv').value=(typeof d.pv_actuels==='number')?d.pv_actuels:(st.pv||'');
  $('p-xp').value=(typeof d.xp==='number')?d.xp:0;
  $('p-armes').value=(d.armes||[]).join('\n');
  $('p-inv').value=(d.inventaire||[]).join('\n');
  $('p-notes').value=d.notes||'';
  var c=CHASSIS[d.chassis];
  $('p-apt').textContent=c?('Aptitude : '+c.apt):'';
  $('p-comp').textContent=c?('Compétences maîtrisées : '+c.comp.join(', ')):'';
  $('pj-form-title').textContent='✎ Modifier : '+(p.nom||'?');
  $('p-del').style.display='';
  setMsg('pj-msg','« '+(p.nom||'')+' » chargé dans le formulaire.','');
  $('pj-form-sect').scrollIntoView({behavior:'smooth'});
}
function clearPersoForm(){
  ['p-id','p-nom','st-m','st-cc','st-ct','st-f','st-e','st-pv','st-a','st-cd','st-sv','st-rfx','p-pv','p-armes','p-inv','p-notes'].forEach(function(id){$(id).value='';});
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
  var chassis=$('p-chassis').value;
  if(!nom){setMsg('pj-msg','Le nom est obligatoire.','err');return;}
  if(!chassis){setMsg('pj-msg','Choisis un châssis.','err');return;}
  var lines=function(id){return $(id).value.split('\n').map(function(l){return l.trim();}).filter(function(l){return l.length>0;});};
  var c=CHASSIS[chassis];
  var data={
    chassis:chassis,
    code:$('p-code').value,
    st:{m:$('st-m').value.trim(),cc:$('st-cc').value.trim(),ct:$('st-ct').value.trim(),f:$('st-f').value.trim(),e:$('st-e').value.trim(),pv:$('st-pv').value.trim(),a:$('st-a').value.trim(),cd:$('st-cd').value.trim(),sv:$('st-sv').value.trim(),rfx:$('st-rfx').value.trim()},
    pv_actuels:(($('p-pv').value==='')?null:parseInt($('p-pv').value,10)),
    xp:(($('p-xp').value==='')?0:parseInt($('p-xp').value,10)),
    apt:c.apt,
    comp:c.comp.slice(),
    armes:lines('p-armes'),
    inventaire:lines('p-inv'),
    notes:$('p-notes').value
  };
  if(isNaN(data.pv_actuels)){data.pv_actuels=null;}
  if(data.pv_actuels===null){data.pv_actuels=parseInt(c.st.pv,10)||0;}
  var id=$('p-id').value;
  setMsg('pj-msg','Enregistrement…','');
  if(id){
    api(SB+'personnages?id=eq.'+id,{method:'PATCH',headers:hdr({'Prefer':'return=minimal'}),body:JSON.stringify({nom:nom,data:data})}).then(function(r){
      if(r.status===401){throw new Error('session');}
      if(!r.ok){throw new Error('http');}
      setMsg('pj-msg','« '+nom+' » mis à jour ✅','ok');
      loadPersos();
    }).catch(function(e){
      if(e&&e.message==='session'){return;}
      setMsg('pj-msg','Échec de l\u2019enregistrement — réessaie.','err');
    });
  }else{
    api(SB+'personnages',{method:'POST',headers:hdr({'Prefer':'return=minimal'}),body:JSON.stringify({compte_id:SESS.id,nom:nom,data:data})}).then(function(r){
      if(r.status===401){throw new Error('session');}
      if(!r.ok){throw new Error('http');}
      setMsg('pj-msg','« '+nom+' » créé ✅','ok');
      clearPersoFormKeep();
      loadPersos();
    }).catch(function(e){
      if(e&&e.message==='session'){return;}
      setMsg('pj-msg','Échec de la création — réessaie.','err');
    });
  }
}
function clearPersoFormKeep(){clearPersoForm();}
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
