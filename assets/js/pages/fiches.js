
/* PE_BUILD 2026.10.24-f29 — fiches : cloisonnement par joueur — colonne owner (id du compte joueur) sur la table fiches : pull filtré owner=eq.session, push avec owner, purge des copies locales d'autrui, affichage strict owner=session, owner assigné à la création et à l'import — mot16d. Base mot16c : sous-menu de postes du hub. Base mot16b : bugfix Reformatage + Conscience inné + cadre Co. Base mot16a : station Reformatage. Base mot15c : position en blanc + interrupteur HUB_VISIBLE. Base mot15b : Position sans bordure, bouton ghost. Base mot15a : ménage Navigation. Base mot14z : cadre Navigation + champ Position, zéro émoji. Base mot14y : position persistée. Base mot14x : hub vaisseau-tombe. */
(function(){
"use strict";
var EQ=window.PE_EQUIP;
/* Accès réservé : sans session joueur (joueur), renvoi vers Mon espace */
try{
  var _sess=JSON.parse(localStorage.getItem("pe_session")||"null");
  if(!_sess||!_sess.id||!_sess.token){location.replace("https://chokmah-hash.github.io/joueur.html");return;}
}catch(e){location.replace("https://chokmah-hash.github.io/joueur.html");return;}
var S_ID=(_sess&&_sess.id)||"";
var LSKEY="pe_fiches_v1";
var SUPA_URL="https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1";
var SUPA_KEY="sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov";
var SUPA_HEADERS={"apikey":SUPA_KEY,"Authorization":"Bearer "+SUPA_KEY,"Content-Type":"application/json"};
var OTOK="";
var CH=[
 {n:"Fantassin programmé",m:"10",cc:"4+",ct:"4+",f:"4",e:"4",pv:"3",a:"1",cd:"7+",sv:"4+",rfx:"+0",mem:"1",cal:"1",apt:"Discipline sans faille : relancez 1 test de Commandement raté par scène.",cp:["Athlétisme","Technologie"]},
 {n:"Vétéran",m:"10",cc:"3+",ct:"3+",f:"5",e:"5",pv:"3",a:"1",cd:"8+",sv:"3+",rfx:"+1",mem:"1",cal:"1",apt:"Élite : vos touches critiques infligent +1 dégât.",cp:["Athlétisme","Perception"]},
 {n:"Traqueur",m:"10",cc:"3+",ct:"3+",f:"5",e:"5",pv:"3",a:"1",cd:"8+",sv:"3+",rfx:"+2",mem:"2",cal:"1",apt:"Embuscade : 1×/scène, apparaissez dans un rayon de 6 m (après 1 round de délai).",cp:["Furtivité","Perception","Pilotage"]},
 {n:"Ombre",m:"10",cc:"3+",ct:"6+",f:"5",e:"4",pv:"3",a:"3",cd:"8+",sv:"4+",rfx:"+2",mem:"2",cal:"1",apt:"Peau d'ombre : Furtivité 3+ ; ennemis qui vous voient -1 Cd.",cp:["Furtivité","Intimidation"]},
 {n:"Sentinelle",m:"10",cc:"3+",ct:"4+",f:"6",e:"5",pv:"6",a:"2",cd:"8+",sv:"3+",rfx:"+1",mem:"1",cal:"1",apt:"Écran : 1×/round, prenez une frappe destinée à un allié à 2 m.",cp:["Athlétisme","Intimidation"]},
 {n:"Officier de garde",m:"10",cc:"3+",ct:"3+",f:"5",e:"5",pv:"12",a:"3",cd:"8+",sv:"3+",rfx:"+1",mem:"2",cal:"2",apt:"Ordre de secours : 1×/scène, forcez un allié à relancer son Protocole de Secours.",cp:["Commandement","Technologie"]},
 {n:"Artificier",m:"10",cc:"3+",ct:"3+",f:"4",e:"5",pv:"12",a:"2",cd:"8+",sv:"4+",rfx:"+1",mem:"3",cal:"2",apt:"Essaim réparateur : 1×/scène, soignez D3 PV d'une unité à 6 m.",cp:["Technologie","Érudition","Perception"]},
 {n:"Énergicien",m:"10",cc:"3+",ct:"3+",f:"5",e:"5",pv:"12",a:"3",cd:"8+",sv:"3+",rfx:"+1",mem:"3",cal:"2",apt:"Décharge : 1×/scène, attaque F7 PA -2 D 2 à tous les ennemis à 3 m.",cp:["Technologie","Érudition"]},
 {n:"Commandant",m:"10",cc:"3+",ct:"3+",f:"6",e:"6",pv:"15",a:"4",cd:"9+",sv:"3+",rfx:"+1",mem:"4",cal:"2",apt:"Aura de commandement : les alliés à 6 m relancent les 1 au toucher.",cp:["Commandement","Intimidation","Érudition"]},
 {n:"Seigneur de guerre",m:"10",cc:"2+",ct:"2+",f:"6",e:"6",pv:"18",a:"5",cd:"10+",sv:"3+",rfx:"+1",mem:"5",cal:"3",apt:"Volonté inflexible : relancez 1 échec par round.",cp:["Commandement","Érudition","Intimidation","Technologie"]}
];
var CODES=["Éternel","Pragmatique","Sanguinaire","Solaire","Tutélaire","Fondateur"];
var COMPS=["Perception","Furtivité","Technologie","Érudition","Commandement","Intimidation","Athlétisme","Pilotage"];

/* — Hub vaisseau-tombe (mot14x) : slots d'aptitudes compilées selon le châssis, rangs, plafonds de crypte — */
var HUB_SLOTS={"Fantassin programmé":1,"Vétéran":1,"Sentinelle":1,"Traqueur":2,"Ombre":2,"Officier de garde":2,"Artificier":2,"Énergicien":2,"Commandant":3,"Seigneur de guerre":3};
var HUB_RANGS=[{min:0,nom:"Nouvellement réveillé"},{min:10,nom:"Endurci"},{min:25,nom:"Vétéran éternel"},{min:50,nom:"Légende de la dynastie"}];
var HUB_POSTES=["atelier","crypte","memoriel"];
var posteCur="atelier";
var HUB_PLAFONDS=[4,8,12,20];
/* Interrupteur hub (mot15c) : true = bouton Translocation/Retour visible. Passer à false pour CACHER le hub aux joueurs pendant l'aventure 1 (ils ne doivent pas se douter qu'ils sont Nécrons — pas de hub pendant la première aventure) ; remettre true à la fin de l'aventure 1. Actuellement true : Michael en a besoin pour ses tests. */
var HUB_VISIBLE=true;

var EQUIP=[
 ["Noyau de réparation","1×/bataille : un allié à 6 m relance son Protocole de Secours avec +2"],
 ["Écran de phase","Sauvegarde invulnérable 4++"],
 ["Blindage entrelacé","-1 dégât subi (minimum 1)"],
 ["Matrice de translocation","1×/bataille : téléporte le groupe (6 unités max) à 30 m"],
 ["Chronomètre","+1 initiative et +2 m de déplacement"],
 ["Réacteur d'étoile","1×/bataille : D3 dégâts irréversibles à 12 m (Technologie 3+)"]
];
var state={v:1,chars:[]};
var cur=null;
function $(id){return document.getElementById(id);}
var UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function load(){try{var d=JSON.parse(localStorage.getItem(LSKEY)||"null");if(d&&d.chars){var mig=false;for(var i=0;i<d.chars.length;i++){if(!UUID_RE.test(d.chars[i].id||"")){d.chars[i].id=uid();mig=true;}}state=d;if(mig){save();}}}catch(e){}}
function save(){try{localStorage.setItem(LSKEY,JSON.stringify(state));}catch(e){}}
function uid(){if(window.crypto&&crypto.randomUUID){return crypto.randomUUID();}return "c"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function byId(id){for(var i=0;i<state.chars.length;i++){if(state.chars[i].id===id)return state.chars[i];}return null;}
function chByName(n){for(var i=0;i<CH.length;i++){if(CH[i].n===n)return CH[i];}return CH[0];}
function norm(c){
  if(!c.armes)c.armes=[];
  /* — modules (fusion mot12) + migration des anciennes lignes « Équipement » — */
  if(!c.modules)c.modules={capteurs:[],coeur:null,noyau:null,bouclier:null,systeme:null};
  if(!c.modules.capteurs)c.modules.capteurs=[];
  ["coeur","noyau","bouclier","systeme"].forEach(function(k){if(!c.modules[k])c.modules[k]=null;});
  if(!c.inv)c.inv=[];
  if(c.spe===undefined)c.spe="";
  if(c.speU===undefined)c.speU=false;
  if(!c.protocoles)c.protocoles=[];
  if(c.st&&!c.st.mem){var ccx=chByName(c.ch);c.st.mem=ccx.mem||"1";c.st.cal=ccx.cal||"1";}
  if(c.st&&!c.st.cal){var ccy=chByName(c.ch);c.st.cal=ccy.cal||"1";}
  c.protocoles=(c.protocoles||[]).map(function(p){
    if(p&&p.id){return {id:p.id,actif:p.id==="p-conscience"?true:!!p.actif};}
    if(p&&p.nom&&EQ&&EQ.PROTOCOLES_DB){
      for(var i=0;i<EQ.PROTOCOLES_DB.length;i++){var q=EQ.PROTOCOLES_DB[i];
        if(q.nom===String(p.nom).trim()){return {id:q.id,actif:false};}}
    }
    return null;
  }).filter(Boolean);
  if(c.eq&&c.eq.length){
    c.eq.forEach(function(r){
      if(!r||!r.w){return;}
      var m=EQ?EQ.moduleParNom(r.w):null;
      if(m){c.inv.push({uid:uid(),kind:"module",id:m.id});}
      else{
        var eff=r.e||"";
        if(!eff){for(var k=0;k<EQUIP.length;k++){if(EQUIP[k][0]===r.w){eff=EQUIP[k][1];}}}
        c.inv.push({uid:uid(),kind:"libre",nom:r.w,effet:eff,utilise:!!r.used});
      }
    });
    delete c.eq;
  }
  /* — migration des anciennes lignes « Arsenal » vers le système d'armes (mot13) — */
  if(c.arm&&c.arm.length){
    var chx=EQ?EQ.chassiParNom(c.ch||""):null;
    c.arm.forEach(function(r){
      if(!r||!r.w){return;}
      var a=EQ?EQ.armeParNom(r.w):null;
      if(a){
        if(chx&&a.taille<=chx.armes.t&&c.armes.length<chx.armes.n){c.armes.push(a.id);}
        else{c.inv.push({uid:uid(),kind:"arme",id:a.id});}
      }else{
        c.inv.push({uid:uid(),kind:"armelibre",nom:r.w,po:r.po||"",at:r.at||"",f:r.f||"",pa:r.pa||"",d:r.d||"",sp:r.sp||"",taille:1});
      }
    });
    delete c.arm;
  }
  if(!c.pv)c.pv=[];
  while(c.pv.length<30)c.pv.push(false);
  if(c.pv.length>30)c.pv=c.pv.slice(0,30);
  if(!c.ech)c.ech=[false,false];
  if(!c.comps)c.comps=[];
  if(!c.st)c.st={m:"10",cc:"4+",ct:"4+",f:"4",e:"4",pv:"3",a:"1",cd:"7+",sv:"4+",inv:"",rfx:"+0"};
  if(!c.p1)c.p1={t:"",used:false};
  if(!c.p2)c.p2={t:"",used:false};
  if(!c.maj)c.maj="";
  /* — hub vaisseau-tombe (mot14x) + position du joueur (mot14y) + position réelle sur la carte galaxie (mot14z) — */
  if(c.loc!=="hub")c.loc="terrain";
  if(!HUB_VISIBLE){c.loc="terrain";}
  if(!c.pos||typeof c.pos!=="object")c.pos={};
  if(!c.pos.et)c.pos.et="Héra";
  if(!c.pos.pl)c.pos.pl="Basalte";
  if(!c.pos.poi)c.pos.poi="Site minier 9-Héra";
  if(!c.hub)c.hub={dnc:0,crypte:[],eng:[],slots:[]};
  if(!c.hub.crypte)c.hub.crypte=[];
  if(!c.hub.eng)c.hub.eng=[];
  if(!c.hub.slots)c.hub.slots=[];
  c.hub.eng=c.hub.eng.map(function(e){if(e&&typeof e==="object"){if(!e.uid){e.uid=uid();}return e;}return {uid:uid(),nom:String(e||"Engramme"),desc:""};});
  c.hub.crypte=c.hub.crypte.map(function(it){return (it&&typeof it==="object"&&it.uid)?it:Object.assign({uid:uid()},(it&&typeof it==="object")?it:{});});
  c.hub.slots=c.hub.slots.map(function(e){return (e&&typeof e==="object")?e:null;});
  if(typeof c.hub.dnc!=="number"){c.hub.dnc=parseInt(c.hub.dnc,10)||0;}
  var hnb=HUB_SLOTS[c.ch]||1;
  while(c.hub.slots.length<hnb)c.hub.slots.push(null);
  while(c.hub.slots.length>hnb){var dep=c.hub.slots.pop();if(dep)c.hub.eng.push(dep);}
  return c;
}
function blankChar(chName){
  var c=chByName(chName);
  var p=[];for(var i=0;i<30;i++)p.push(false);
  return {id:uid(),nom:"",ch:c.n,code:"",spe:"",speU:false,
   st:{m:c.m,cc:c.cc,ct:c.ct,f:c.f,e:c.e,pv:c.pv,a:c.a,cd:c.cd,sv:c.sv,inv:"",rfx:c.rfx,mem:c.mem,cal:c.cal},
   pv:p,ech:[false,false],comps:c.cp.slice(0),
   armes:[],modules:{capteurs:[],coeur:null,noyau:null,bouclier:null,systeme:null},inv:[],
   protocoles:[],
   apt:c.apt,aptA:"",p1:{t:"",used:false},p2:{t:"",used:false},
   loc:"terrain",
   pos:{et:"Héra",pl:"Basalte",poi:"Site minier 9-Héra"},
   hub:{dnc:0,crypte:[],eng:[],slots:[]},
   xp:"",notes:"",maj:new Date().toISOString()};
}
function pvLost(ch){var n=0;for(var i=0;i<ch.pv.length;i++){if(ch.pv[i])n++;}return n;}
function pvTotalDe(c){var n=parseInt(c&&c.st&&c.st.pv,10);return (isNaN(n)||n<0)?0:n;}
function majPvCount(){var el=$("pv-count");if(!el){return;}if(!cur){el.textContent="";return;}var t=pvTotalDe(cur);el.textContent=t>0?((t-pvLost(cur))+" / "+t+" PV disponibles"):"";}
function buildPvBoxes(n){var box=$("pv-box");if(!box){return;}box.innerHTML="";pvNodes=[];for(var j=0;j<n;j++){(function(idx){var s=document.createElement("span");s.className="pvseg";box.appendChild(s);pvNodes.push(s);})(j);}}
/* ===== Synchronisation nuage (Supabase) ===== */
function ownerToken(){
  try{
    var t=localStorage.getItem("pe_owner_token");
    if(!t){t=uid();localStorage.setItem("pe_owner_token",t);}
    return t;
  }catch(e){return "anonyme";}
}
function syncStatus(txt,color){var el=$("sync-line");if(el){el.textContent=txt;el.style.color=color||"var(--muted)";}}
var syncTimer=null;
function queueSync(ch){
  if(!ch||!ch.id){return;}
  if(syncTimer){clearTimeout(syncTimer);}
  var chId=ch.id;
  syncTimer=setTimeout(function(){
    var live=byId(chId);
    if(live){pushChar(live);}
  },700);
}
function pushChar(ch){
  try{
    if(navigator.onLine===false){syncStatus("Hors ligne — fiche enregistrée sur cet appareil uniquement","var(--danger)");return;}
    syncStatus("Synchronisation…");
    fetch(SUPA_URL+"/fiches?on_conflict=id",{
      method:"POST",
      headers:Object.assign({},SUPA_HEADERS,{"Prefer":"resolution=merge-duplicates","x-owner-token":OTOK}),
      body:JSON.stringify({id:ch.id,code_partie:"zulthekh",nom:ch.nom||"Personnage sans nom",data:ch,owner_token:OTOK,owner:S_ID,maj:ch.maj||new Date().toISOString()})
    }).then(function(r){
      if(r.ok){syncStatus("Fiche synchronisée","var(--teal)");}
      else{syncStatus("Synchronisation refusée (fiche protégée par son propriétaire) — enregistrée localement","var(--danger)");}
    }).catch(function(){syncStatus("Hors ligne — fiche enregistrée sur cet appareil uniquement","var(--danger)");});
  }catch(e){}
}
function deleteRemote(id){
  try{
    fetch(SUPA_URL+"/fiches?id=eq."+encodeURIComponent(id),{method:"DELETE",headers:Object.assign({},SUPA_HEADERS,{"x-owner-token":OTOK})}).catch(function(){});
  }catch(e){}
}
function pullChars(onDone){
  try{
    if(navigator.onLine===false){syncStatus("Hors ligne — fiches locales uniquement","var(--danger)");if(onDone)onDone();return;}
    syncStatus("Lecture de vos fiches…");
    fetch(SUPA_URL+"/fiches?select=id,maj,data,owner&order=maj.desc&owner=eq."+encodeURIComponent(S_ID),{headers:SUPA_HEADERS,cache:"no-store"})
    .then(function(r){return r.ok?r.json():Promise.reject(new Error("http "+r.status));})
    .then(function(rows){
      var changed=false;
      (rows||[]).forEach(function(row){
        var d=row.data;
        if(!d||!d.st){return;}
        norm(d);d.id=row.id;d.owner=row.owner||"";
        var rmaj=(row.maj?new Date(row.maj).getTime():0)||0;
        var found=null;
        for(var i=0;i<state.chars.length;i++){if(state.chars[i].id===row.id){found=i;break;}}
        if(found===null){state.chars.push(d);changed=true;}
        else{
          if(state.chars[found].owner!==d.owner){state.chars[found].owner=d.owner;changed=true;}
          var lmaj=(state.chars[found].maj?new Date(state.chars[found].maj).getTime():0)||0;
          if(rmaj>lmaj){state.chars[found]=d;changed=true;}
        }
      });
      var n0=state.chars.length;
      state.chars=state.chars.filter(function(c){return !(c.owner&&c.owner!==S_ID);});
      if(state.chars.length!==n0){changed=true;}
      if(changed){save();}
      syncStatus("Vos fiches sont à jour","var(--teal)");
      if(onDone)onDone();
    })
    .catch(function(){syncStatus("Lecture du nuage impossible — affichage des fiches locales","var(--danger)");if(onDone)onDone();});
  }catch(e){if(onDone)onDone();}
}
/* ===== Interface ===== */
function renderCards(){
  var box=$("cards");box.textContent="";
  var vis=state.chars.filter(function(c){return c.owner===S_ID;});
  if(!vis.length){
    var p=document.createElement("p");p.style.color="var(--muted)";
    p.textContent="Aucun personnage enregistré pour l'instant. Créez votre première fiche avec le bouton ci-dessus.";
    box.appendChild(p);return;
  }
  vis.forEach(function(ch){
    var card=document.createElement("div");card.className="card";
    var h=document.createElement("h3");h.textContent=ch.nom||"Personnage sans nom";card.appendChild(h);
    var meta=document.createElement("p");meta.textContent=ch.ch+(ch.code?" · Code "+ch.code:"");card.appendChild(meta);
    var pv=document.createElement("p");pv.textContent="PV perdus : "+pvLost(ch)+" / "+(ch.st.pv||"?")+(ch.xp!==""&&ch.xp!==undefined?" · XP : "+ch.xp:"");card.appendChild(pv);
    var row=document.createElement("div");row.className="cardbtns";
    var b1=document.createElement("button");b1.className="btn ghost";b1.textContent="Ouvrir";
    b1.onclick=function(){showEdit(ch.id);};row.appendChild(b1);
    var b2=document.createElement("button");b2.className="btn danger";b2.textContent="Supprimer";
    b2.onclick=function(){if(confirm("Supprimer définitivement cette fiche ?")){deleteRemote(ch.id);state.chars=state.chars.filter(function(c){return c.id!==ch.id;});save();renderCards();}};row.appendChild(b2);
    card.appendChild(row);box.appendChild(card);
  });
}
function setSelect(id,val){var s=$(id);var ok=false;for(var i=0;i<s.options.length;i++){if(s.options[i].value===val){ok=true;break;}}s.value=ok?val:"";}
function majSpe(){
  var s=(cur&&cur.spe&&EQ&&EQ.speDe)?EQ.speDe(cur.spe):null;
  var a=$("f-speA"),pw=$("f-speP"),pu=$("f-spePu");
  if(a){a.value=(s&&s.apt)?s.apt:"";}
  if(pw){pw.value=(s&&s.pouvoir)?s.pouvoir:"";}
  if(pu){pu.checked=!!(cur&&cur.speU);}
}
function fillForm(){
  var ch=norm(cur);
  $("f-title").textContent="Fiche — "+(ch.nom||"personnage sans nom");
  $("f-nom").value=ch.nom;$("f-ch").value=ch.ch;setSelect("f-code",ch.code||"");
  setSelect("f-spe",ch.spe||"");
  majSpe();

  var st=ch.st;
  ["m","cc","ct","f","e","pv","a","cd","sv","inv","rfx","mem","cal"].forEach(function(k){$("st-"+k).value=st[k]||"";});
  majMemCalFields();
  majCoField();
  buildPvBoxes(pvTotalDe(ch));
  pvNodes.forEach(function(el,i){el.classList.toggle("on",!!ch.pv[i]);});
  majPvCount();
  $("ech-0").classList.toggle("on",!!ch.ech[0]);$("ech-1").classList.toggle("on",!!ch.ech[1]);
  compsNodes.forEach(function(o){var on=ch.comps.indexOf(o.name)>=0;o.box.checked=on;o.lab.classList.toggle("on",on);});
  $("f-apt").value=ch.apt||"";$("f-aptA").value=ch.aptA||"";
  $("f-p1").value=ch.p1.t||"";$("f-p1u").checked=!!ch.p1.used;
  $("f-p2").value=ch.p2.t||"";$("f-p2u").checked=!!ch.p2.used;
  $("f-xp").value=ch.xp||"";$("f-notes").value=ch.notes||"";
  renderModules();
  renderProtocoles();
  renderHub();
}
function collect(){
  if(!cur)return;
  var ch=norm(cur);
  ch.nom=$("f-nom").value;ch.ch=$("f-ch").value;ch.code=$("f-code").value;

  ["m","cc","ct","f","e","pv","a","cd","sv","inv","rfx"].forEach(function(k){ch.st[k]=$("st-"+k).value;});
  ch.ech=[$("ech-0").classList.contains("on"),$("ech-1").classList.contains("on")];
  ch.comps=[];compsNodes.forEach(function(o){if(o.box.checked)ch.comps.push(o.name);});
  ch.apt=$("f-apt").value;ch.aptA=$("f-aptA").value;ch.spe=$("f-spe").value;ch.speU=$("f-spePu").checked;
  ch.p1={t:$("f-p1").value,used:$("f-p1u").checked};
  ch.p2={t:$("f-p2").value,used:$("f-p2u").checked};
  ch.xp=$("f-xp").value;ch.notes=$("f-notes").value;
  ch.maj=new Date().toISOString();
  $("f-title").textContent="Fiche — "+(ch.nom||"personnage sans nom");
  save();
  queueSync(ch);
}
/* ===== Modules : cadre Châssis + inventaire (fusion mot12) ===== */
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function chFiche(c){return EQ&&EQ.chassiParNom?EQ.chassiParNom(c.ch||""):null;}
function dAdapte(c){var ch=chFiche(c);return {chassis:ch?ch.id:null,armes:(c.armes||[]),modules:c.modules,inventaire:c.inv};}
function nomArme(w){if(typeof w==="string"){var a=EQ.armeDe(w);return a?a.nom:w;}return (w&&w.nom)||"Arme";}
function statsArmeLibre(w){
  var s=[w.po,w.at,w.f,w.pa,w.d].map(function(x){return (x||"").toString().trim();}).filter(Boolean);
  if(w.sp&&w.sp!=="—"){s.push(w.sp);}
  return s.join(" · ");
}
function peutEquiperItem(c,it){
  var ch=chFiche(c);
  if(!ch){return {ok:false,raison:"châssis inconnu"};}
  if(it.kind==="module"){return EQ.peutEquiper(dAdapte(c),it);}
  if(it.kind==="arme"||it.kind==="armelibre"){
    if((c.armes||[]).length>=ch.armes.n){return {ok:false,raison:"plus d'emplacement d'arme ("+ch.armes.n+"/"+ch.armes.n+")"};}
    var t=(it.kind==="arme")?(EQ.armeDe(it.id)?EQ.armeDe(it.id).taille:0):(parseInt(it.taille,10)||1);
    if(t>ch.armes.t){return {ok:false,raison:"taille "+EQ.T(t)+" > "+EQ.T(ch.armes.t)+" max du châssis"};}
    return {ok:true};
  }
  return {ok:false,raison:"objet sans emplacement"};
}
function modMsg(t,cls){var m=$("mod-status");if(m){m.textContent=t||"";m.className="gmsg "+(cls||"");}}
function badgeT(t){
  var coul=t>=4?"#e2604f":(t===3?"#f0b24a":(t===2?"#2ee6c9":"#7a9187"));
  return '<span class="badge" style="color:'+coul+';border-color:'+coul+'55">'+EQ.T(t)+'</span>';
}
function petitBtn(txt,attrs){
  return '<button type="button" class="btn ghost" style="font-size:.68rem;padding:3px 10px;letter-spacing:.02em" '+attrs+'>'+esc(txt)+'</button>';
}
function videMsg(txt){return '<div style="font-size:.75rem;color:var(--muted);margin-top:4px">'+txt+'</div>';}
function ligneSlot(label,hint,contenu,btn,off){
  return '<fieldset style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between;border:1px solid '+(off?'rgba(46,230,201,.06)':'rgba(46,230,201,.13)')+';border-radius:9px;background:var(--panel2);padding:8px 10px 6px;margin:18px 0 0;list-style:none">'
  +'<legend style="color:var(--muted);font-family:Rajdhani,sans-serif;font-weight:600;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;padding:0 5px;line-height:1">'+esc(label)+(hint?' · '+esc(hint):'')+'</legend>'
  +(contenu?'<div style="flex:1 1 auto">'+contenu+'</div>':'')
  +(btn||'')+'</fieldset>';
}
function contenuArme(w){
  if(typeof w==="string"){
    var a=EQ.armeDe(w);
    var badges=a?('<span class="badge">'+esc(a.portee)+'</span><span class="badge">Att '+esc(a.att)+'</span><span class="badge">F '+esc(a.f)+'</span><span class="badge">PA '+esc(a.pa)+'</span><span class="badge">D '+esc(a.d)+'</span>'):'';
    return '<span style="color:#c8e9df;font-weight:700;font-size:.85rem">'+esc(nomArme(w))+'</span> '+(a?badgeT(a.taille):'')
     +'<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px">'+badges+(a&&a.regle&&a.regle!=="—"?'<span style="font-size:.72rem;color:var(--muted);align-self:center">'+esc(a.regle)+'</span>':'')+'</div>';
  }
  return '<span style="color:#c8e9df;font-weight:700;font-size:.85rem">'+esc(nomArme(w))+'</span> '+badgeT(w.taille||1)
   +(statsArmeLibre(w)?'<div style="font-size:.72rem;color:var(--muted);margin-top:2px">'+esc(statsArmeLibre(w))+'</div>':'');
}
function contenuModule(mid){
  var m=EQ.moduleDe(mid);if(!m){return '<span style="color:#c8e9df;font-weight:700;font-size:.85rem">'+esc(mid)+'</span>';}
  return '<span style="color:#c8e9df;font-weight:700;font-size:.85rem">'+esc(m.nom)+'</span> '+badgeT(m.taille)
   +(m.desc?'<div style="font-size:.72rem;color:var(--muted);margin-top:2px">'+esc(m.desc)+'</div>':'');
}
var VIDE_SLOT='<span style="font-size:.75rem;color:var(--muted)">— vide — équipe depuis l\u2019inventaire ci-dessous.</span>';
function renderModules(){
  var mc=$("mod-chassis"),mi=$("mod-inv");
  if(!mc||!mi){return;}
  if(!cur){mc.textContent="";mi.textContent="";return;}
  norm(cur);
  var ch=chFiche(cur);
  if(!ch){
    mc.innerHTML='<h3 class="sub">Châssis — emplacements</h3><div style="padding:0;margin:6px 0 0">'
     +ligneSlot("Châssis","", '<span style="font-size:.75rem;color:var(--muted)">Châssis « '+esc(cur.ch||"?")+' » hors liste — choisissez-en un dans Identité pour activer les emplacements.</span>','',true)+'</div>';
    mi.textContent="";
    return;
  }
  var k,lignes="";
  for(k=0;k<ch.armes.n;k++){
    var w=(cur.armes||[])[k];
    lignes+=w?ligneSlot("Arme "+(k+1),EQ.T(ch.armes.t)+" max",contenuArme(w),petitBtn("Ranger",'data-wrq="'+k+'"'))
             :ligneSlot("Arme "+(k+1),EQ.T(ch.armes.t)+" max",VIDE_SLOT,'',true);
  }
  for(k=0;k<ch.capteurs.n;k++){
    var mid=(cur.modules.capteurs||[])[k];
    lignes+=mid?ligneSlot("Capteur "+(k+1),EQ.T(ch.capteurs.t)+" max",contenuModule(mid),petitBtn("Ranger",'data-mrq="capteur:'+k+'"'))
               :ligneSlot("Capteur "+(k+1),EQ.T(ch.capteurs.t)+" max",VIDE_SLOT,'',true);
  }
  lignes+=(cur.modules.coeur?ligneSlot("Cœur énergétique",EQ.T(ch.coeur.t)+" max",contenuModule(cur.modules.coeur),petitBtn("Ranger",'data-mrq="coeur:0"'))
                            :ligneSlot("Cœur énergétique",EQ.T(ch.coeur.t)+" max",VIDE_SLOT,'',true));
  lignes+=(cur.modules.noyau?ligneSlot("Noyau énergétique",EQ.T(ch.noyau.t)+" max",contenuModule(cur.modules.noyau),petitBtn("Ranger",'data-mrq="noyau:0"'))
                            :ligneSlot("Noyau énergétique",EQ.T(ch.noyau.t)+" max",VIDE_SLOT,'',true));
  lignes+=(cur.modules.systeme?ligneSlot("Système logique",(ch.systeme?EQ.T(ch.systeme.t):"")+" max",contenuModule(cur.modules.systeme),petitBtn("Ranger",'data-mrq="systeme:0"'))
                            :ligneSlot("Système logique",(ch.systeme?EQ.T(ch.systeme.t):"")+" max",VIDE_SLOT,'',true));
  if(ch.bouclier.n){
    lignes+=(cur.modules.bouclier?ligneSlot("Bouclier",EQ.T(ch.bouclier.t)+" max",contenuModule(cur.modules.bouclier),petitBtn("Ranger",'data-mrq="bouclier:0"'))
                                 :ligneSlot("Bouclier",EQ.T(ch.bouclier.t)+" max",VIDE_SLOT,'',true));
  }else{
    lignes+=ligneSlot("Bouclier","","<span style=\"font-size:.75rem;color:var(--muted)\">— aucun emplacement sur ce châssis —</span>",'',true);
  }
  var cardCh='<div style="background:var(--panel2);padding:8px 12px;margin:8px 0 10px">'
   +'<div style="color:#c8e9df;font-weight:700;font-size:.88rem">Châssis « '+esc(ch.nom)+' » — intégrité '+esc(ch.st.pv)+' PV</div>'
   +'<div style="font-size:.75rem;color:var(--muted);margin-top:3px">Emplacements — Armes ×'+ch.armes.n+' ('+EQ.T(ch.armes.t)+' max) · Capteurs ×'+ch.capteurs.n+' ('+EQ.T(ch.capteurs.t)+' max) · Cœur ('+EQ.T(ch.coeur.t)+' max) · Noyau ('+EQ.T(ch.noyau.t)+' max)'
   +(ch.bouclier.n?(' · Bouclier ×'+ch.bouclier.n+' ('+EQ.T(ch.bouclier.t)+' max)'):' · aucun bouclier')+(ch.systeme?(' · Système logique ('+EQ.T(ch.systeme.t)+' max)'):'')+'</div></div>';
  mc.innerHTML='<h3 class="sub">Châssis — emplacements</h3>'
   +cardCh+'<div style="padding:0;margin:6px 0 0">'+lignes+'</div>';
  var inv=cur.inv||[],items="";
  inv.forEach(function(it){
    var nom,desc="",taille=null;
    if(it.kind==="module"){var m=EQ.moduleDe(it.id);nom=m?m.nom:it.id;desc=m?m.desc:"";taille=m?m.taille:null;}
    else if(it.kind==="arme"){var a=EQ.armeDe(it.id);nom=a?a.nom:it.id;desc=a?((a.regle&&a.regle!=="—"?a.regle+" — ":"")+a.portee+" · Att "+a.att+" · F "+a.f+" · PA "+a.pa+" · D "+a.d):"";taille=a?a.taille:null;}
    else if(it.kind==="armelibre"){nom=it.nom||"Arme";desc=statsArmeLibre(it);taille=parseInt(it.taille,10)||1;}
    else{nom=it.nom||"Objet";desc=it.effet||"";}
    var btns="";
    if(it.kind==="module"||it.kind==="arme"||it.kind==="armelibre"){
      var v=peutEquiperItem(cur,it);
      btns+=v.ok?petitBtn("Équiper",'data-meq="'+it.uid+'"'):('<span style="font-size:.68rem;color:var(--muted)" title="'+esc(v.raison)+'">'+esc(v.raison)+'</span>');
    }
    if(it.kind==="libre"){btns+=petitBtn(it.utilise?"✓ utilisé":"Marquer utilisé",'data-mut="'+it.uid+'"');}
    btns+=petitBtn("Retirer",'data-mjet="'+it.uid+'"');
    items+='<li style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between;border:1px solid rgba(46,230,201,.13);border-radius:8px;padding:6px 8px;margin-top:6px;list-style:none">'
     +'<span><span style="color:#c8e9df;font-weight:700">'+esc(nom)+'</span> '+(taille?badgeT(taille):'')
     +(desc?'<div style="font-size:.72rem;color:var(--muted);margin-top:2px">'+esc(desc)+'</div>':'')+'</span>'
     +'<span style="display:inline-flex;gap:6px;align-items:center">'+btns+'</span></li>';
  });
  var opts='<option value="">— choisir un module —</option>';
  var cats={capteur:"Capteurs",coeur:"Cœurs énergétiques",noyau:"Noyaux de charge",bouclier:"Boucliers",systeme:"Systèmes logiques"};
  Object.keys(cats).forEach(function(cat){
    opts+='<optgroup label="'+cats[cat]+'">';
    EQ.MODULES_DB.forEach(function(mo){if(mo.cat===cat){opts+='<option value="'+mo.id+'">'+esc(mo.nom)+" ("+EQ.T(mo.taille)+")</option>";}});
    opts+="</optgroup>";
  });
  var optsA='<option value="">— choisir une arme —</option>';
  EQ.ARMES_DB.forEach(function(ar){optsA+='<option value="'+ar.id+'">'+esc(ar.nom)+" ("+EQ.T(ar.taille)+")</option>";});
  var optsT=["T1","T2","T3","T4"].map(function(t,k){return '<option value="'+(k+1)+'"'+(k===0?" selected":"")+'>'+t+"</option>";}).join("");
  mi.innerHTML=(inv.length?'<ul style="padding:0;margin:6px 0 0">'+items+"</ul>":videMsg("Inventaire vide — tout ce qui est équipé vit dans le châssis ci-dessus ; ajoute ci-dessous armes, modules et objets."))
   +'<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px">'
   +'<select id="mod-add" style="flex:1;min-width:200px">'+opts+"</select>"
   +petitBtn("＋ Ajouter le module",'data-madd="1"')
   +"</div>"
   +'<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px">'
   +'<select id="w-add" style="flex:1;min-width:200px">'+optsA+"</select>"
   +petitBtn("＋ Ajouter l'arme",'data-wadd="1"')
   +"</div>"
   +'<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px">'
   +'<input id="w-lib-nom" type="text" placeholder="Arme personnalisée — nom (relique…)" style="flex:1;min-width:160px">'
   +'<select id="w-lib-t" title="Taille" style="width:64px">'+optsT+"</select>"
   +'<input id="w-lib-stats" type="text" placeholder="Profil — ex. 24 m · Att 1 · F5 · PA-1 · D2 · règle" style="flex:2;min-width:200px">'
   +petitBtn("＋ Ajouter l'arme perso",'data-wlib="1"')
   +"</div>"
   +'<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px">'
   +'<input id="mod-lib-nom" type="text" placeholder="Objet libre — nom (wargear, relique non-arme…)" style="flex:1;min-width:160px">'
   +'<input id="mod-lib-eff" type="text" placeholder="Effet" style="flex:1;min-width:140px">'
   +petitBtn("＋ Ajouter l'objet",'data-mlib="1"')
   +"</div>";
}
/* ===== Protocoles (le savoir du personnage) — install limité par Mém, exécution limitée par Cal ===== */
function etatSecours(ch){
  var e=(ch.ech[0]?1:0)+(ch.ech[1]?1:0);
  return e===0?'<span style="color:#2ee6c9;font-weight:700">réanimation opérationnelle</span>'
   :(e===1?'<span style="color:#f0b24a;font-weight:700">1 échec consécutif</span>'
   :'<span style="color:#e2604f;font-weight:700">2 échecs — extraction d\u2019urgence déclenchée</span>');
}
function memCal(ch){
  var mem=(parseInt(ch&&ch.st&&ch.st.mem,10)||0),cal=(parseInt(ch&&ch.st&&ch.st.cal,10)||0),mo=ch&&ch.modules?ch.modules:{},bmem=0,bcal=0;
  ((mo.capteurs||[]).concat([mo.coeur,mo.noyau,mo.bouclier,mo.systeme])).forEach(function(mid){
    if(mid==="memext"){bmem+=1;}else if(mid==="coproc"){bcal+=1;}
  });
  return {mem:mem+bmem,cal:cal+bcal,bmem:bmem,bcal:bcal};
}
function majMemCalFields(){var e1=$("st-mem"),e2=$("st-cal");if(!cur||!e1||!e2){return;}var mc=memCal(cur);e1.value=mc.mem;e2.value=mc.cal;}
function protCompte(ch){var act=0,ins=0;(ch.protocoles||[]).forEach(function(p){if(p.id==="p-conscience"){return;}ins++;if(p.actif)act++;});return {ins:ins,act:act};}
function protDB(){return (EQ&&EQ.PROTOCOLES_DB)||[];}
function protDesc(id){var DB=protDB();for(var i=0;i<DB.length;i++){if(DB[i].id===id){return DB[i];}}return null;}
function majCoField(){var e=$("st-co");if(e&&cur){e.value=refConscienceActive(cur)?"5":"—";}}
function renderProtocoles(){
  var pb=$("prot-box");if(!pb||!cur){return;}
  norm(cur);
  majCoField();
  var mc=memCal(cur),ct=protCompte(cur),DB=protDB(),rows="";
  var surplus=ct.ins>mc.mem;
  var aConsc=(cur.protocoles||[]).some(function(x){return x.id==="p-conscience";});
  var dConsc=protDesc("p-conscience");
  (cur.protocoles||[]).forEach(function(p){
    if(p.id==="p-conscience"){return;}
    var d=protDesc(p.id);
    var nom=d?d.nom:(p.id||"Protocole inconnu");
    var desc=d?d.desc:"Protocole absent de la base — désinstallez-le.";
    var tog=p.actif?'<button type="button" class="btn ghost" style="font-size:.68rem;padding:3px 10px;color:#2ee6c9;border-color:rgba(46,230,201,.45)" data-pact="'+esc(p.id)+'" title="Actif — cliquer pour arrêter">● actif</button>'
     :'<button type="button" class="btn ghost" style="font-size:.68rem;padding:3px 10px;color:var(--muted)" data-pact="'+esc(p.id)+'" title="Activer (calcul '+ct.act+'/'+mc.cal+')">○ inactif</button>';
    rows+='<li style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between;border:1px solid rgba(46,230,201,.13);border-radius:8px;padding:6px 8px;margin-top:6px;list-style:none">'
     +'<span><span style="color:#c8e9df;font-weight:700">'+esc(nom)+'</span>'
     +'<div style="font-size:.72rem;color:var(--muted);margin-top:2px">'+esc(desc)+'</div></span>'
     +'<span style="display:inline-flex;gap:6px;align-items:center">'+tog+petitBtn("Désinstaller",'data-pdel="'+esc(p.id)+'"')+'</span></li>';
  });
  var secours='<li style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between;border:1px solid rgba(46,230,201,.13);border-radius:8px;padding:6px 8px;margin-top:6px;list-style:none">'
   +'<span><span style="color:#c8e9df;font-weight:700">Protocole de Secours</span> <span class="badge">inné</span>'
   +'<div style="font-size:.72rem;color:var(--muted);margin-top:2px">À 0 PV : réanimation 5+ au début de chaque round · 2 échecs consécutifs = extraction d\u2019urgence hors scène</div>'
   +'<div style="font-size:.72rem;margin-top:2px">État : '+etatSecours(cur)+' — ne consomme ni place mémoire, ni calcul.</div></span></li>';
  var consc="";
  if(aConsc){
    consc='<li style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between;border:1px solid rgba(46,230,201,.13);border-radius:8px;padding:6px 8px;margin-top:6px;list-style:none">'
     +'<span><span style="color:#c8e9df;font-weight:700">'+esc(dConsc?dConsc.nom:"Protocole de Conscience")+'</span> <span class="badge">inné</span>'
     +'<div style="font-size:.72rem;color:var(--muted);margin-top:2px">'+esc(dConsc?dConsc.desc:"")+'</div>'
     +'<div style="font-size:.75rem;margin-top:2px">Inné — gravé par le Maître de la Tombe · toujours actif · ne consomme ni place mémoire, ni calcul.</div></span></li>';
  }
  var addrow="";
  if(!surplus){
    var opts='<option value="">— choisir un protocole —</option>';
    DB.forEach(function(pr){
      var deja=(cur.protocoles||[]).some(function(x){return x.id===pr.id;});
      if(!deja){opts+='<option value="'+esc(pr.id)+'">'+esc(pr.nom)+'</option>';}
    });
    addrow='<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px">'
     +'<select id="prot-add" style="flex:1;min-width:220px">'+opts+"</select>"
     +petitBtn("＋ Installer le protocole",'data-padd="1"')
     +"</div>";
  }
  pb.innerHTML='<ul style="padding:0;margin:6px 0 0">'+secours+consc+rows+'</ul>'
   +'<div style="font-size:.75rem;color:var(--muted);margin-top:8px">Places mémoire : <strong>'+ct.ins+'/'+mc.mem+'</strong> installés · Calcul : <strong>'+ct.act+'/'+mc.cal+'</strong> actifs'
   +((mc.bmem||mc.bcal)?' · module système : +'+mc.bmem+' place mémoire, +'+mc.bcal+' calcul':'')
   +(surplus?' — <span style="color:var(--danger)">surcharge mémoire : désinstallez '+(ct.ins-mc.mem)+' protocole(s)</span>':'')+'</div>'
   +addrow
   +'<div id="prot-status" style="font-size:.75rem;color:var(--muted);margin-top:4px"></div>';
}
function protMsg(t,cls){var m=$("prot-status");if(m){m.textContent=t||"";m.style.color=(cls==="err")?"var(--danger)":"var(--muted)";}}
function installerProtocole(){
  if(!cur){return;}
  var sl=$("prot-add");if(!sl){return;}
  var id=sl.value;
  if(!id){protMsg("Choisissez un protocole dans la liste.","err");return;}
  var mc=memCal(cur),ct=protCompte(cur);
  var innate=(id==="p-conscience");
  if(!innate&&ct.ins>=mc.mem){protMsg("Plus de place mémoire ("+ct.ins+"/"+mc.mem+") — désinstallez un protocole.","err");return;}
  cur.protocoles.push({id:id,actif:innate});
  cur.maj=new Date().toISOString();save();queueSync(cur);renderProtocoles();
  protMsg(innate?"Protocole de Conscience gravé — inné, toujours actif.":"Protocole installé en mémoire.");
}
function desinstallerProtocole(id){
  if(!cur){return;}
  if(id==="p-conscience"){protMsg("Le Protocole de Conscience est inné — il ne peut pas être désinstallé.","err");return;}
  cur.protocoles=(cur.protocoles||[]).filter(function(x){return x.id!==id;});
  cur.maj=new Date().toISOString();save();queueSync(cur);renderProtocoles();
  protMsg("Protocole désinstallé de la mémoire.");
}
function activerProtocole(id){
  if(!cur){return;}
  var mc=memCal(cur),ct=protCompte(cur),p=null;
  (cur.protocoles||[]).forEach(function(x){if(x.id===id){p=x;}});
  if(!p){return;}
  if(id==="p-conscience"){protMsg("Le Protocole de Conscience est inné — toujours actif.","err");return;}
  if(!p.actif&&ct.act>=mc.cal){protMsg("Capacité de calcul atteinte ("+ct.act+"/"+mc.cal+") — arrêtez d'abord un protocole actif.","err");return;}
  p.actif=!p.actif;
  cur.maj=new Date().toISOString();save();queueSync(cur);renderProtocoles();
  protMsg(p.actif?"Protocole en cours d'exécution.":"Protocole arrêté.");
}
function apresMod(msg){cur.maj=new Date().toISOString();save();queueSync(cur);renderModules();majMemCalFields();renderProtocoles();if(msg){modMsg(msg,"ok");}}
function equiperItem(u){
  var it=null,j;
  for(j=0;j<cur.inv.length;j++){if(cur.inv[j].uid===u){it=cur.inv[j];break;}}
  if(!it){return;}
  var v=peutEquiperItem(cur,it);
  if(!v.ok){modMsg("Impossible d'équiper « "+EQ.nomItem(it)+" » : "+v.raison+".","err");return;}
  cur.inv.splice(j,1);
  if(it.kind==="module"){
    var mo=EQ.moduleDe(it.id);
    if(mo.cat==="capteur"){cur.modules.capteurs.push(mo.id);}else{cur.modules[mo.cat]=mo.id;}
  }else if(it.kind==="arme"){
    cur.armes.push(it.id);
  }else if(it.kind==="armelibre"){
    cur.armes.push({uid:it.uid,libre:true,nom:it.nom,po:it.po,at:it.at,f:it.f,pa:it.pa,d:it.d,sp:it.sp,taille:parseInt(it.taille,10)||1});
  }
  apresMod("« "+EQ.nomItem(it)+" » équipé.");
}
function rangerArme(idx){
  var w=(cur.armes||[])[idx];
  if(w===undefined){return;}
  cur.armes.splice(idx,1);
  if(typeof w==="string"){
    cur.inv.push({uid:uid(),kind:"arme",id:w});
  }else{
    cur.inv.push({uid:w.uid||uid(),kind:"armelibre",nom:w.nom,po:w.po,at:w.at,f:w.f,pa:w.pa,d:w.d,sp:w.sp,taille:w.taille||1});
  }
  apresMod("« "+nomArme(w)+" » rangé dans l'inventaire.");
}
function ajouterArme(){
  var s=$("w-add");
  if(!s||!s.value){modMsg("Choisis d'abord une arme dans la liste.","err");return;}
  var a=EQ.armeDe(s.value);if(!a){return;}
  cur.inv.push({uid:uid(),kind:"arme",id:a.id});
  apresMod("« "+a.nom+" » ajouté à l'inventaire — équipe-le dans le châssis.");
}
function ajouterArmeLibre(){
  var n=$("w-lib-nom"),st=$("w-lib-stats"),t=$("w-lib-t");
  var nom=(n?n.value:"").trim();
  if(!nom){modMsg("Donne un nom à l'arme personnalisée.","err");return;}
  cur.inv.push({uid:uid(),kind:"armelibre",nom:nom,sp:(st?st.value:"").trim(),taille:parseInt(t?t.value:"1",10)||1});
  apresMod("« "+nom+" » ajouté à l'inventaire — équipe-la dans le châssis.");
}
function rangerModule(cat,idx){
  var mid=null;
  if(cat==="capteur"){mid=cur.modules.capteurs[idx];if(!mid){return;}cur.modules.capteurs.splice(idx,1);}
  else{mid=cur.modules[cat];if(!mid){return;}cur.modules[cat]=null;}
  cur.inv.push({uid:uid(),kind:"module",id:mid});
  var m=EQ.moduleDe(mid);
  apresMod("« "+(m?m.nom:mid)+" » rangé.");
}
function retirerItem(u){
  for(var j=0;j<cur.inv.length;j++){
    if(cur.inv[j].uid===u){var nom=EQ.nomItem(cur.inv[j]);cur.inv.splice(j,1);apresMod("« "+nom+" » retiré.");return;}
  }
}
function toggleUtilise(u){
  for(var j=0;j<cur.inv.length;j++){if(cur.inv[j].uid===u){cur.inv[j].utilise=!cur.inv[j].utilise;apresMod("");return;}}
}
function ajouterModule(){
  var s=$("mod-add");
  if(!s||!s.value){modMsg("Choisis d'abord un module dans la liste.","err");return;}
  var mo=EQ.moduleDe(s.value);if(!mo){return;}
  cur.inv.push({uid:uid(),kind:"module",id:mo.id});
  apresMod("« "+mo.nom+" » ajouté — équipe-le dans son emplacement.");
}
function ajouterLibre(){
  var n=$("mod-lib-nom"),e=$("mod-lib-eff");
  var nom=(n?n.value:"").trim();
  if(!nom){modMsg("Donne un nom à l'objet libre.","err");return;}
  cur.inv.push({uid:uid(),kind:"libre",nom:nom,effet:(e?e.value:"").trim(),utilise:false});
  apresMod("« "+nom+" » ajouté.");
}
function rangeModulesSurChangement(nomCh){
  var ch=EQ.chassiParNom(nomCh);if(!ch){return [];}
  var ranges=[],caps=[];
  var armesGardes=[];
  (cur.armes||[]).forEach(function(w){
    var t=(typeof w==="string")?(EQ.armeDe(w)?EQ.armeDe(w).taille:99):(w.taille||1);
    if(t<=ch.armes.t&&armesGardes.length<ch.armes.n){armesGardes.push(w);}
    else{
      ranges.push(nomArme(w));
      if(typeof w==="string"){cur.inv.push({uid:uid(),kind:"arme",id:w});}
      else{cur.inv.push({uid:w.uid||uid(),kind:"armelibre",nom:w.nom,po:w.po,at:w.at,f:w.f,pa:w.pa,d:w.d,sp:w.sp,taille:w.taille||1});}
    }
  });
  cur.armes=armesGardes;
  (cur.modules.capteurs||[]).forEach(function(mid){
    var m=EQ.moduleDe(mid);
    if(m&&m.taille<=ch.capteurs.t&&caps.length<ch.capteurs.n){caps.push(mid);}
    else{ranges.push(m?m.nom:mid);cur.inv.push({uid:uid(),kind:"module",id:mid});}
  });
  cur.modules.capteurs=caps;
  ["coeur","noyau","bouclier","systeme"].forEach(function(cat){
    var mid=cur.modules[cat];if(!mid){return;}
    var m=EQ.moduleDe(mid),conf=ch[cat];
    if(!m||m.taille>conf.t||(cat==="bouclier"&&conf.n===0)){
      ranges.push(m?m.nom:mid);cur.inv.push({uid:uid(),kind:"module",id:mid});cur.modules[cat]=null;
    }
  });
  return ranges;
}
/* ===== Hub vaisseau-tombe « L'Éternité-Patiente » (mot14x) ===== */
var coffreRows=null;
function hubMsg(t,cls){var m=$("hub-status");if(m){m.textContent=t||"";m.className="gmsg "+(cls||"");}}
function hubRangIdx(c){var d=(c&&c.hub)?(parseInt(c.hub.dnc,10)||0):0,r=0;for(var i=0;i<HUB_RANGS.length;i++){if(d>=HUB_RANGS[i].min){r=i;}}return r;}
function hubPlafond(c){return HUB_PLAFONDS[hubRangIdx(c)];}
function hubSlotsN(c){return HUB_SLOTS[(c&&c.ch)||""]||1;}
function nomJoueur(){try{var s=JSON.parse(localStorage.getItem("pe_session")||"null");return (s&&s.nom)||"";}catch(e){return "";}}
/* ===== Navigation fiche↔hub : position persistée + translocation (mot14y) ===== */
function vueDe(){
  return (cur&&cur.loc==="hub")?"hub":"fiche";
}
function showVueSansAnim(){
  var v=vueDe(),vf=$("vue-fiche"),vh=$("view-hub");
  if(vf)vf.style.display=(v==="fiche")?"block":"none";
  if(vh)vh.style.display=(v==="hub")?"block":"none";
  renderNav();
  if(v==="hub"){renderHub();if(coffreRows===null){coffrePull();}}
}
function posTexte(){
  if(!cur||!cur.pos){return "—";}
  var p=[];
  if(cur.pos.et)p.push(cur.pos.et);
  if(cur.pos.pl)p.push(cur.pos.pl);
  if(cur.pos.poi)p.push(cur.pos.poi);
  return p.length?p.join(" — "):"—";
}
function renderNav(){
  var act=$("nav-action"),pv=$("nav-pos-v");
  var v=vueDe();
  if(act){act.style.display=HUB_VISIBLE?"":"none";}
  if(pv){
    if(v==="hub"){pv.textContent="À bord — L'Éternité-Patiente";}
    else{pv.textContent=posTexte();}
  }
  if(act&&HUB_VISIBLE){
    if(v==="hub"){act.textContent="↩︎ Retour au terrain";act.className="btn ghost";act.setAttribute("data-nav","terrain");act.title="Revenir à la fiche du châssis, sur le terrain";}
    else{act.textContent="Translocation";act.className="btn ghost";act.setAttribute("data-nav","hub");act.title="Hors combat uniquement — le Maître de la Tombe peut poser un verrou narratif";}
  }
}
function translocVers(v){
  if(!cur||!HUB_VISIBLE||v===vueDe()){return;}
  var ov=$("transloc-ov");
  if(!ov){cur.loc=(v==="hub")?"hub":"terrain";showVueSansAnim();return;}
  ov.classList.add("on");
  setTimeout(function(){
    cur.loc=(v==="hub")?"hub":"terrain";
    cur.maj=new Date().toISOString();
    save();queueSync(cur);
    showVueSansAnim();
    if(v==="hub"){hubMsg("Translocation réussie — bienvenue à bord.");}
  },900);
  setTimeout(function(){ov.classList.remove("on");},1400);
}
function renderHubHead(){
  var el=$("hub-head");if(!el||!cur){return;}
  var ri=hubRangIdx(cur),rg=HUB_RANGS[ri],pl=hubPlafond(cur),nx=HUB_RANGS[ri+1];
  el.innerHTML='<div class="hub-head">'
   +'<fieldset><legend>Rang de données</legend><div class="hv">'+esc(rg.nom)+'</div></fieldset>'
   +'<fieldset><legend>Données cumulées</legend><input id="hub-dnc" type="number" min="0" value="'+(parseInt(cur.hub.dnc,10)||0)+'"></fieldset>'
   +'<fieldset><legend>Plafond de crypte</legend><div class="hv">'+(cur.hub.crypte.length)+' / '+pl+'</div></fieldset>'
   +'<fieldset><legend>Prochain rang</legend><div class="hv" style="color:var(--muted)">'+(nx?nx.min+" cumulées":"— sommet atteint")+'</div></fieldset>'
   +'</div>'
   +'<p class="hub-note">Données disponibles = champ « XP disponibles » de la fiche. Les données cumulées sont saisies par le Maître de la Tombe (le registre complet arrive avec le système Données).</p>';
  var inp=$("hub-dnc");
  if(inp){inp.addEventListener("change",function(){if(!cur)return;cur.hub.dnc=parseInt(inp.value,10)||0;cur.maj=new Date().toISOString();save();queueSync(cur);renderHubHead();var n=$("hub-crypte-n");if(n){n.textContent="— "+cur.hub.crypte.length+" / "+hubPlafond(cur)+" emplacements (rang : "+HUB_RANGS[hubRangIdx(cur)].nom+")";}});}
}
/* ===== Station Reformatage (mot16a) : identité réécrite à bord ===== */
function refConscienceActive(c){return ((c&&c.protocoles)||[]).some(function(p){return p&&p.id==="p-conscience"&&!!p.actif;});}
function refSyncFiche(){
  if(!cur){return;}
  if($("f-nom")){$("f-nom").value=cur.nom||"";}
  $("f-title").textContent="Fiche — "+(cur.nom||"personnage sans nom");
  setSelect("f-spe",cur.spe||"");
  setSelect("f-code",cur.code||"");
}
function renderReformatage(){
  var el=$("hub-reformatage");if(!el||!cur){return;}
  norm(cur);
  var consc=refConscienceActive(cur);
  var champNom=consc
   ?'<input id="rf-nom" type="text" value="'+esc(cur.nom||"")+'" placeholder="ex. AKH-77 « Verdict »">'
   :'<input id="rf-nom" type="text" value="'+esc(cur.nom||"")+'" readonly title="La Désignation ne peut être réécrite que lorsque le Protocole de Conscience est actif." style="opacity:.55;cursor:not-allowed">';
  var speOpts='<option value="">— aucune —</option>';
  (EQ&&EQ.SPECIALISATIONS_DB?EQ.SPECIALISATIONS_DB:[]).forEach(function(sp){speOpts+='<option value="'+esc(sp.id)+'"'+(cur.spe===sp.id?" selected":"")+'>'+esc(sp.nom)+'</option>';});
  var chOpts="";
  CH.forEach(function(c){chOpts+='<option value="'+esc(c.n)+'"'+(cur.ch===c.n?" selected":"")+'>'+esc(c.n)+'</option>';});
  var codeOpts='<option value="">— aucune —</option>';
  CODES.forEach(function(c){codeOpts+='<option value="'+esc(c)+'"'+((cur.code||"")===c?" selected":"")+'>'+esc(c)+'</option>';});
  el.innerHTML='<div class="hub-head">'
   +'<fieldset><legend>Désignation</legend>'+champNom+'</fieldset>'
   +'<fieldset><legend>Spécialisation</legend><select id="rf-spe">'+speOpts+'</select></fieldset>'
   +'<fieldset><legend>Châssis</legend><select id="rf-ch">'+chOpts+'</select></fieldset>'
   +'<fieldset><legend>Code de fabrique</legend><select id="rf-code">'+codeOpts+'</select></fieldset>'
   +'</div>'
   +'<p class="hub-note">'+(consc
     ?'Protocole de Conscience actif : la Désignation peut être réécrite — le châssis développe une individualité.'
     :'La Désignation ne peut être réécrite que lorsque le Protocole de Conscience est actif (installé à bord par le Maître de la Tombe).')
   +' Changer de châssis recalcule les caractéristiques et range automatiquement armes et modules hors limites.</p>';
  var inp;
  inp=$("rf-nom");
  if(inp){inp.addEventListener("change",function(){
    if(!cur||!refConscienceActive(cur)){renderReformatage();return;}
    var v=(inp.value||"").trim();
    if(v===cur.nom){return;}
    cur.nom=v;cur.maj=new Date().toISOString();save();queueSync(cur);
    refSyncFiche();renderReformatage();
    hubMsg("Reformatage : Désignation réécrite — « "+v+" ».","ok");
  });}
  inp=$("rf-spe");
  if(inp){inp.addEventListener("change",function(){
    if(!cur){return;}
    var v=inp.value;var s=(v&&EQ&&EQ.speDe)?EQ.speDe(v):null;
    cur.spe=v;cur.speU=false;cur.maj=new Date().toISOString();save();queueSync(cur);
    refSyncFiche();majSpe();
    hubMsg("Reformatage : Spécialisation réécrite — "+(s?s.nom:(v||"— aucune —"))+".","ok");
  });}
  inp=$("rf-ch");
  if(inp){inp.addEventListener("change",function(){
    if(!cur){return;}
    var v=inp.value;var c=chByName(v);if(!c){renderReformatage();return;}
    cur.ch=v;
    cur.st={m:c.m,cc:c.cc,ct:c.ct,f:c.f,e:c.e,pv:c.pv,a:c.a,cd:c.cd,sv:c.sv,inv:cur.st.inv||"",rfx:c.rfx,mem:c.mem,cal:c.cal};
    cur.apt=c.apt;cur.comps=c.cp.slice(0);
    var ranges=rangeModulesSurChangement(v);
    fillForm();save();queueSync(cur);
    hubMsg("Reformatage : Châssis réécrit — "+v+"."+(ranges.length?" Rangé automatiquement : "+ranges.join(", ")+".":""),"ok");
  });}
  inp=$("rf-code");
  if(inp){inp.addEventListener("change",function(){
    if(!cur){return;}
    var v=inp.value;
    cur.code=v;cur.maj=new Date().toISOString();save();queueSync(cur);
    refSyncFiche();
    hubMsg("Reformatage : Code de fabrique réécrit — "+(v||"— aucune —")+".","ok");
  });}
}
function ligneHub(nom,desc,btns,off){
  return '<li style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between;border:1px solid '+(off?'rgba(46,230,201,.06)':'rgba(46,230,201,.13)')+';border-radius:8px;padding:6px 8px;margin-top:6px;list-style:none">'
   +'<span style="min-width:0;flex:1 1 160px"><span style="color:#c8e9df;font-weight:700">'+esc(nom)+'</span>'
   +(desc?'<div style="font-size:.72rem;color:var(--muted);margin-top:2px">'+esc(desc)+'</div>':'')+'</span>'
   +'<span style="display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap">'+btns+'</span></li>';
}
function showPoste(v){
  if(HUB_POSTES.indexOf(v)<0){v="atelier";}
  posteCur=v;
  HUB_POSTES.forEach(function(k){var el=$("poste-"+k);if(el){el.style.display=(k===v)?"block":"none";}});
  var nav=$("hub-nav");
  if(nav){var bs=nav.querySelectorAll("button");for(var i=0;i<bs.length;i++){bs[i].classList.toggle("on",bs[i].getAttribute("data-poste")===v);}}
}
function renderHub(){
  if(!cur){return;}
  norm(cur);
  renderHubHead();
  renderReformatage();
  var pl=hubPlafond(cur),i;
  /* — crypte personnelle — */
  var hc=$("hub-crypte"),cn=$("hub-crypte-n");
  if(cn){cn.textContent="— "+cur.hub.crypte.length+" / "+pl+" emplacements (rang : "+HUB_RANGS[hubRangIdx(cur)].nom+")";}
  if(hc){
    var s="";
    cur.hub.crypte.forEach(function(it){
      var nom=(EQ&&EQ.nomItem)?EQ.nomItem(it):(it.nom||"Objet");
      s+=ligneHub(nom,"",petitBtn("Sortir sur le châssis",'data-hsort="'+esc(it.uid)+'"')+petitBtn("Déposer au coffre",'data-hcof="'+esc(it.uid)+'"'));
    });
    hc.innerHTML=(cur.hub.crypte.length?'<ul style="padding:0;margin:6px 0 0">'+s+'</ul>':videMsg("Crypte vide — archivez ici le butin rapporté par votre châssis."));
  }
  /* — sur le châssis : inventaire à archiver — */
  var hi=$("hub-inv");
  if(hi){
    var s2="";
    (cur.inv||[]).forEach(function(it){
      var nom=(EQ&&EQ.nomItem)?EQ.nomItem(it):(it.nom||"Objet");
      s2+=ligneHub(nom,"",petitBtn("Archiver en crypte",'data-harch="'+esc(it.uid)+'"'));
    });
    hi.innerHTML=((cur.inv||[]).length?'<ul style="padding:0;margin:6px 0 0">'+s2+'</ul>':videMsg("Rien de libre dans le châssis — tout est équipé ou déjà archivé."));
  }
  /* — engrammes archivés — */
  var he=$("hub-eng");
  if(he){
    var s3="";
    cur.hub.eng.forEach(function(e){
      s3+=ligneHub(e.nom||"Engramme",e.desc||"",petitBtn("Compiler",'data-hcomp="'+esc(e.uid)+'"')+petitBtn("Supprimer",'data-hsupp="'+esc(e.uid)+'"'));
    });
    s3+='<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px">'
     +'<input id="hub-eng-nom" type="text" placeholder="Engramme — nom (MJ)" style="flex:1;min-width:150px">'
     +'<input id="hub-eng-desc" type="text" placeholder="Effet (MJ)" style="flex:2;min-width:180px">'
     +petitBtn("＋ Graver l'engramme",'data-hgrav="1"')+'</div>';
    he.innerHTML='<ul style="padding:0;margin:6px 0 0">'+s3+'</ul>'
     +'<p class="hub-note">Gravé par le Cryptek (Réécriture d\'engramme, 12 données — le registre complet des Données arrive dans une prochaine version). Un engramme compilé occupe un slot du châssis, à bord uniquement.</p>';
  }
  /* — aptitudes compilées : slots selon le châssis — */
  var hs=$("hub-slots"),sn=$("hub-slots-n");
  var nS=hubSlotsN(cur);
  if(sn){sn.textContent="— "+cur.hub.slots.filter(Boolean).length+" / "+nS+" slots ("+cur.ch+")";}
  if(hs){
    var s4="";
    for(i=0;i<nS;i++){
      var e2=cur.hub.slots[i];
      s4+=e2?ligneSlot("Slot "+(i+1),"compilé",'<span style="color:#f0b24a;font-weight:700;font-size:.85rem">'+esc(e2.nom||"Engramme")+'</span>'+(e2.desc?'<div style="font-size:.72rem;color:var(--muted);margin-top:2px">'+esc(e2.desc)+'</div>':''),petitBtn("Décompiler",'data-hdec="'+i+'"'))
            :ligneSlot("Slot "+(i+1),"vide","<span style=\"font-size:.75rem;color:var(--muted)\">— vide — compilable à bord —</span>","",true);
    }
    hs.innerHTML='<div style="padding:0;margin:6px 0 0">'+s4+'</div>';
  }
  /* — coffre de cour — */
  coffreRender();
  /* — maintenance — */
  var hm=$("hub-maint");
  if(hm){
    hm.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px">'
     +'<button type="button" class="btn ghost" data-hrep="1">Atelier canoptek — réparer le châssis (PV au maximum)</button>'
     +'<button type="button" class="btn ghost" data-hinit="1">Réinitialiser — recharger les pouvoirs et purger les échecs de Secours</button>'
     +'</div>'
     +'<p class="hub-note">Gratuit, mais uniquement à bord du vaisseau-tombe.</p>';
  }
  showPoste(posteCur);
}
function coffreRender(){
  var el=$("hub-coffre");if(!el){return;}
  if(coffreRows===null){
    el.innerHTML=videMsg("Coffre de cour non chargé — utilisez « ↻ Rafraîchir le coffre ».");
    return;
  }
  var s="";
  coffreRows.forEach(function(r){
    var it=(r&&r.item)||{};
    var nom=(EQ&&EQ.nomItem)?EQ.nomItem(it):(it.nom||"Objet");
    var de=(r&&r.de)?"déposé par "+esc(r.de):"";
    s+=ligneHub(nom,de,petitBtn("Prendre",'data-hprend="'+esc(r.id)+'"'));
  });
  el.innerHTML=(coffreRows.length?'<ul style="padding:0;margin:6px 0 0">'+s+'</ul>':videMsg("Coffre vide."));
}
function coffrePull(){
  coffreRows=null;
  fetch(SUPA_URL+"/coffres?select=id,de,item,maj&order=maj.desc",{headers:SUPA_HEADERS})
   .then(function(r){return r.ok?r.json():Promise.reject(new Error("http "+r.status));})
   .then(function(rows){coffreRows=rows||[];coffreRender();})
   .catch(function(){coffreRows=null;coffreRender();hubMsg("Lecture du coffre de cour impossible (hors ligne ou table absente).","err");});
}
function apresHub(msg){cur.maj=new Date().toISOString();save();queueSync(cur);renderHub();if(msg){hubMsg(msg,"ok");}}
function hubArchiver(u){
  if(!cur){return;}
  var pl=hubPlafond(cur);
  if(cur.hub.crypte.length>=pl){hubMsg("Crypte personnelle saturée ("+pl+"/"+pl+" — rang : "+HUB_RANGS[hubRangIdx(cur)].nom+").","err");return;}
  for(var j=0;j<cur.inv.length;j++){
    if(cur.inv[j].uid===u){var nom=(EQ&&EQ.nomItem)?EQ.nomItem(cur.inv[j]):"objet";cur.hub.crypte.push(cur.inv.splice(j,1)[0]);apresHub("« "+nom+" » archivé en crypte personnelle.");return;}
  }
}
function hubSortir(u){
  if(!cur){return;}
  for(var j=0;j<cur.hub.crypte.length;j++){
    if(cur.hub.crypte[j].uid===u){var nom=(EQ&&EQ.nomItem)?EQ.nomItem(cur.hub.crypte[j]):"objet";cur.inv.push(cur.hub.crypte.splice(j,1)[0]);apresHub("« "+nom+" » ressorti du stockage — équipez-le depuis la fiche (Inventaire du personnage).");return;}
  }
}
function coffreDeposer(u){
  if(!cur){return;}
  var it=null;
  for(var j=0;j<cur.hub.crypte.length;j++){if(cur.hub.crypte[j].uid===u){it=cur.hub.crypte[j];break;}}
  if(!it){return;}
  var nom=(EQ&&EQ.nomItem)?EQ.nomItem(it):"objet";
  fetch(SUPA_URL+"/coffres",{method:"POST",headers:SUPA_HEADERS,body:JSON.stringify({de:nomJoueur(),item:it})})
   .then(function(r){return r.ok?r.json():Promise.reject(new Error("http "+r.status));})
   .then(function(){cur.hub.crypte.splice(j,1);apresHub("« "+nom+" » déposé dans le coffre de cour.");coffrePull();})
   .catch(function(){hubMsg("Dépôt impossible (hors ligne ou table absente).","err");});
}
function coffrePrendre(rid){
  if(!cur){return;}
  var pl=hubPlafond(cur);
  if(cur.hub.crypte.length>=pl){hubMsg("Crypte personnelle saturée ("+pl+"/"+pl+").","err");return;}
  var r=null;
  for(var j=0;j<(coffreRows||[]).length;j++){if(String(coffreRows[j].id)===String(rid)){r=coffreRows[j];break;}}
  if(!r){return;}
  fetch(SUPA_URL+"/coffres?id=eq."+encodeURIComponent(rid),{method:"DELETE",headers:SUPA_HEADERS})
   .then(function(resp){return resp.ok?Promise.resolve():Promise.reject(new Error("http "+resp.status));})
   .then(function(){
     var it=JSON.parse(JSON.stringify(r.item||{}));it.uid=uid();
     cur.hub.crypte.push(it);
     coffreRows=(coffreRows||[]).filter(function(x){return String(x.id)!==String(rid);});
     apresHub("Objet retiré du coffre de cour vers votre crypte.");
   })
   .catch(function(){hubMsg("Prise impossible (hors ligne ou table absente).","err");});
}
function hubGraver(){
  if(!cur){return;}
  var n=$("hub-eng-nom"),d=$("hub-eng-desc");
  var nom=(n?n.value:"").trim();
  if(!nom){hubMsg("Donnez un nom à l'engramme.","err");return;}
  cur.hub.eng.push({uid:uid(),nom:nom,desc:(d?d.value:"").trim()});
  apresHub("Engramme « "+nom+" » gravé en crypte (MJ).");
}
function hubSupprimer(u){
  if(!cur){return;}
  cur.hub.eng=cur.hub.eng.filter(function(e){return e.uid!==u;});
  apresHub("Engramme supprimé de la crypte.");
}
function hubCompiler(u){
  if(!cur){return;}
  var libre=-1;
  for(var i=0;i<cur.hub.slots.length;i++){if(!cur.hub.slots[i]){libre=i;break;}}
  if(libre<0){hubMsg("Slots d'aptitudes compilées pleins ("+hubSlotsN(cur)+" selon le châssis) — décompilez d'abord.","err");return;}
  var e=null;
  cur.hub.eng=cur.hub.eng.filter(function(x){if(x.uid===u){e=x;return false;}return true;});
  if(!e){return;}
  cur.hub.slots[libre]=e;
  apresHub("« "+(e.nom||"Engramme")+" » compilé sur le châssis (slot "+(libre+1)+"/"+hubSlotsN(cur)+").");
}
function hubDecompiler(idx){
  if(!cur){return;}
  var e=cur.hub.slots[idx];
  if(!e){return;}
  cur.hub.slots[idx]=null;
  cur.hub.eng.push(e);
  apresHub("« "+(e.nom||"Engramme")+" » décompilé — retour en crypte.");
}
function hubReparer(){
  if(!cur){return;}
  for(var i=0;i<cur.pv.length;i++){cur.pv[i]=false;}
  apresHub("Atelier canoptek : châssis intégralement réparé — "+pvTotalDe(cur)+" / "+pvTotalDe(cur)+" PV.");
  buildPvBoxes(pvTotalDe(cur));
  pvNodes.forEach(function(el){el.classList.remove("on");});
  majPvCount();
}
function hubReinit(){
  if(!cur){return;}
  cur.p1.used=false;cur.p2.used=false;cur.speU=false;
  cur.ech=[false,false];
  $("f-p1u").checked=false;$("f-p2u").checked=false;$("f-spePu").checked=false;
  $("ech-0").classList.remove("on");$("ech-1").classList.remove("on");
  apresHub("Réinitialisation à bord : pouvoirs rechargés, échecs de Protocole de Secours purgés.");
}
function showList(){cur=null;$("view-edit").style.display="none";$("view-list").style.display="block";renderCards();}
function showEdit(id){cur=byId(id);if(!cur)return;norm(cur);$("view-list").style.display="none";$("view-edit").style.display="block";$("exp-box").style.display="none";showVueSansAnim();fillForm();window.scrollTo(0,0);}
var pvNodes=[],compsNodes=[];
function init(){
  OTOK=ownerToken();
  var chSel=$("f-ch");
  CH.forEach(function(c){var o=document.createElement("option");o.value=c.n;o.textContent=c.n;chSel.appendChild(o);});
  var codeSel=$("f-code");
  var oEmpty=document.createElement("option");oEmpty.value="";oEmpty.textContent="— aucune —";codeSel.appendChild(oEmpty);
  CODES.forEach(function(c){var o=document.createElement("option");o.value=c;o.textContent=c;codeSel.appendChild(o);});
  var speSel=$("f-spe");
  if(speSel){
    var so=document.createElement("option");so.value="";so.textContent="— aucune —";speSel.appendChild(so);
    (EQ&&EQ.SPECIALISATIONS_DB?EQ.SPECIALISATIONS_DB:[]).forEach(function(sp){var o=document.createElement("option");o.value=sp.id;o.textContent=sp.nom;speSel.appendChild(o);});
    speSel.addEventListener("change",function(){if(!cur)return;cur.spe=speSel.value;cur.speU=false;cur.maj=new Date().toISOString();save();queueSync(cur);majSpe();});
  }
  [0,1].forEach(function(k){
    $("ech-"+k).addEventListener("click",function(){if(!cur)return;cur.ech[k]=!cur.ech[k];this.classList.toggle("on",cur.ech[k]);cur.maj=new Date().toISOString();save();queueSync(cur);renderProtocoles();});
  });
  COMPS.forEach(function(name){
    var l=document.createElement("label");l.className="cb";
    var cb=document.createElement("input");cb.type="checkbox";
    var t=document.createElement("span");t.textContent=name;
    l.appendChild(cb);l.appendChild(t);$("comps-box").appendChild(l);
    compsNodes.push({name:name,box:cb,lab:l});
    cb.addEventListener("change",function(){l.classList.toggle("on",cb.checked);});
  });
  $("f-ch").addEventListener("change",function(){
    if(!cur)return;
    var c=chByName($("f-ch").value);
    cur.st={m:c.m,cc:c.cc,ct:c.ct,f:c.f,e:c.e,pv:c.pv,a:c.a,cd:c.cd,sv:c.sv,inv:cur.st.inv||"",rfx:c.rfx,mem:c.mem,cal:c.cal};
    cur.apt=c.apt;cur.comps=c.cp.slice(0);
    var ranges=rangeModulesSurChangement($("f-ch").value);
    fillForm();save();queueSync(cur);
    if(ranges.length){modMsg("Changement de châssis — rangé automatiquement : "+ranges.join(", "),"ok");}
  });
  /* — actions modules (délégation sur la vue d'édition) — */
  $("view-edit").addEventListener("click",function(ev){
    var b=ev.target&&ev.target.closest?ev.target.closest("button"):null;
    if(!b||!$("view-edit").contains(b)||!cur){return;}
    var a;
    if((a=b.getAttribute("data-meq"))!==null){equiperItem(a);}
    else if((a=b.getAttribute("data-mrq"))!==null){var pm=a.split(":");rangerModule(pm[0],parseInt(pm[1],10));}
    else if((a=b.getAttribute("data-wrq"))!==null){rangerArme(parseInt(a,10));}
    else if((a=b.getAttribute("data-mjet"))!==null){retirerItem(a);}
    else if((a=b.getAttribute("data-mut"))!==null){toggleUtilise(a);}
    else if(b.getAttribute("data-madd")){ajouterModule();}
    else if(b.getAttribute("data-wadd")){ajouterArme();}
    else if(b.getAttribute("data-wlib")){ajouterArmeLibre();}
    else if(b.getAttribute("data-mlib")){ajouterLibre();}
    else if((a=b.getAttribute("data-pdel"))!==null){desinstallerProtocole(a);}
    else if(b.getAttribute("data-padd")){installerProtocole();}
    else if((a=b.getAttribute("data-pact"))!==null){activerProtocole(a);}
  });
  /* — hub vaisseau-tombe : navigation fiche↔hub (mot14y), actions (mot14x) — */
  var nh=$("nav-hub");
  if(nh){nh.addEventListener("click",function(ev){var b=ev.target&&ev.target.closest?ev.target.closest("button"):null;if(!b||!nh.contains(b)||!cur){return;}var v=b.getAttribute("data-nav");if(v){translocVers(v);}});}
  var bcr=$("btn-coffre-refresh");
  if(bcr){bcr.addEventListener("click",function(){coffrePull();});}
  var hnav=$("hub-nav");
  if(hnav){hnav.addEventListener("click",function(ev){var b=ev.target&&ev.target.closest?ev.target.closest("button"):null;if(!b||!hnav.contains(b)||!cur){return;}var v=b.getAttribute("data-poste");if(v){showPoste(v);}});}
  var hv=$("view-hub");
  if(hv){hv.addEventListener("click",function(ev){
    var b=ev.target&&ev.target.closest?ev.target.closest("button"):null;
    if(!b||!hv.contains(b)||!cur){return;}
    var a;
    if((a=b.getAttribute("data-hsort"))!==null){hubSortir(a);}
    else if((a=b.getAttribute("data-harch"))!==null){hubArchiver(a);}
    else if((a=b.getAttribute("data-hcof"))!==null){coffreDeposer(a);}
    else if((a=b.getAttribute("data-hprend"))!==null){coffrePrendre(a);}
    else if((a=b.getAttribute("data-hcomp"))!==null){hubCompiler(a);}
    else if((a=b.getAttribute("data-hdec"))!==null){hubDecompiler(parseInt(a,10));}
    else if((a=b.getAttribute("data-hsupp"))!==null){hubSupprimer(a);}
    else if(b.getAttribute("data-hgrav")){hubGraver();}
    else if(b.getAttribute("data-hrep")){hubReparer();}
    else if(b.getAttribute("data-hinit")){hubReinit();}
  });}
  /* — déconnexion (sous-menu) — */
  $("app-logout").addEventListener("click",function(ev){
    ev.preventDefault();
    try{localStorage.removeItem("pe_session");}catch(e){}
    location.replace("https://chokmah-hash.github.io/joueur.html");
  });
  try{var _sess=JSON.parse(localStorage.getItem("pe_session")||"null");if(_sess&&_sess.nom){$("logout-who").textContent=" ("+_sess.nom+")";}}catch(e){}
  $("f-form").addEventListener("input",collect);
  $("f-form").addEventListener("change",collect);
  $("btn-new").addEventListener("click",function(){var c=blankChar("Fantassin programmé");c.owner=S_ID;state.chars.push(c);save();showEdit(c.id);});
  $("btn-back").addEventListener("click",function(){collect();showList();});
  $("btn-del").addEventListener("click",function(){
    if(!cur)return;
    if(confirm("Supprimer définitivement cette fiche ?")){deleteRemote(cur.id);state.chars=state.chars.filter(function(c){return c.id!==cur.id;});save();showList();}
  });
  $("btn-print").addEventListener("click",function(){collect();window.print();});
  $("btn-code").addEventListener("click",function(){
    collect();
    $("exp-code").value=btoa(encodeURIComponent(JSON.stringify(cur)));
    $("exp-box").style.display="block";
  });
  $("btn-copy").addEventListener("click",function(){
    var ta=$("exp-code");ta.select();ta.setSelectionRange(0,99999);
    try{document.execCommand("copy");}catch(e){}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(ta.value);}
  });
  $("btn-imp").addEventListener("click",function(){
    var raw=$("imp-code").value.trim();
    var msg=$("imp-msg");
    if(!raw){msg.textContent="";return;}
    try{
      var obj=JSON.parse(decodeURIComponent(atob(raw)));
      if(!obj||!obj.st){throw new Error("bad");}
      norm(obj);obj.id=uid();obj.owner=S_ID;obj.maj=new Date().toISOString();
      state.chars.push(obj);save();renderCards();queueSync(obj);
      msg.textContent="Fiche importée : "+(obj.nom||"personnage sans nom");
      $("imp-code").value="";
    }catch(e){msg.textContent="Code invalide — vérifiez le copier-coller.";}
  });
  $("btn-refresh").addEventListener("click",function(){pullChars(function(){renderCards();});});
  load();
  state.chars.forEach(norm);
  renderCards();
  pullChars(function(){renderCards();});
}
init();
})();
