/* PE_BUILD 2026.10.25-conn1 — connexion unifiée : login + reset déménagés sur /connexion.html ; joueur.html redirige si non connecté */
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
/* ——— Session : connexion unifiée sur /connexion.html ——— */
function logout(msg){
 try{localStorage.removeItem('pe_session');}catch(e){}
 SESS=null;
 if(PING_TIMER){clearInterval(PING_TIMER);PING_TIMER=null;}
 try{if(msg){sessionStorage.setItem('pe_flash',msg);}}catch(e){}
 location.replace('/connexion.html');
}
function enterApp(){
 $('app-view').style.display='';
 $('app-subnav').hidden=false;
 $('app-hero').style.display='none';
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
 else{SESS=null;location.replace('/connexion.html');}
})();
