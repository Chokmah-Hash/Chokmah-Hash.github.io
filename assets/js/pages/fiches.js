
/* PE_BUILD 2026.10.23-f18 — fiches : section Protocoles (champ Specialisation dans Identite, aptitude et/ou pouvoir de specialisation auto-affiches) (mot14v) */
(function(){
"use strict";
var EQ=window.PE_EQUIP;
/* Accès réservé : sans session joueur (joueur), renvoi vers Mon espace */
try{
  var _sess=JSON.parse(localStorage.getItem("pe_session")||"null");
  if(!_sess||!_sess.id||!_sess.token){location.replace("https://chokmah-hash.github.io/joueur.html");return;}
}catch(e){location.replace("https://chokmah-hash.github.io/joueur.html");return;}
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
  if(!c.modules)c.modules={capteurs:[],coeur:null,noyau:null,bouclier:null};
  if(!c.modules.capteurs)c.modules.capteurs=[];
  ["coeur","noyau","bouclier"].forEach(function(k){if(!c.modules[k])c.modules[k]=null;});
  if(!c.inv)c.inv=[];
  if(c.spe===undefined)c.spe="";
  if(c.speU===undefined)c.speU=false;
  if(!c.protocoles)c.protocoles=[];
  if(c.st&&!c.st.mem){var ccx=chByName(c.ch);c.st.mem=ccx.mem||"1";c.st.cal=ccx.cal||"1";}
  if(c.st&&!c.st.cal){var ccy=chByName(c.ch);c.st.cal=ccy.cal||"1";}
  c.protocoles=(c.protocoles||[]).map(function(p){
    if(p&&p.id){return {id:p.id,actif:!!p.actif};}
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
  return c;
}
function blankChar(chName){
  var c=chByName(chName);
  var p=[];for(var i=0;i<30;i++)p.push(false);
  return {id:uid(),nom:"",ch:c.n,code:"",spe:"",speU:false,
   st:{m:c.m,cc:c.cc,ct:c.ct,f:c.f,e:c.e,pv:c.pv,a:c.a,cd:c.cd,sv:c.sv,inv:"",rfx:c.rfx,mem:c.mem,cal:c.cal},
   pv:p,ech:[false,false],comps:c.cp.slice(0),
   armes:[],modules:{capteurs:[],coeur:null,noyau:null,bouclier:null},inv:[],
   protocoles:[],
   apt:c.apt,aptA:"",p1:{t:"",used:false},p2:{t:"",used:false},
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
    if(navigator.onLine===false){syncStatus("⚠ Hors ligne — fiche enregistrée sur cet appareil uniquement","var(--danger)");return;}
    syncStatus("☁ Synchronisation…");
    fetch(SUPA_URL+"/fiches?on_conflict=id",{
      method:"POST",
      headers:Object.assign({},SUPA_HEADERS,{"Prefer":"resolution=merge-duplicates","x-owner-token":OTOK}),
      body:JSON.stringify({id:ch.id,code_partie:"zulthekh",nom:ch.nom||"Personnage sans nom",data:ch,owner_token:OTOK,maj:ch.maj||new Date().toISOString()})
    }).then(function(r){
      if(r.ok){syncStatus("☁ Synchronisée — visible par toute la table","var(--teal)");}
      else{syncStatus("⚠ Synchronisation refusée (fiche protégée par son propriétaire) — enregistrée localement","var(--danger)");}
    }).catch(function(){syncStatus("⚠ Hors ligne — fiche enregistrée sur cet appareil uniquement","var(--danger)");});
  }catch(e){}
}
function deleteRemote(id){
  try{
    fetch(SUPA_URL+"/fiches?id=eq."+encodeURIComponent(id),{method:"DELETE",headers:Object.assign({},SUPA_HEADERS,{"x-owner-token":OTOK})}).catch(function(){});
  }catch(e){}
}
function pullChars(onDone){
  try{
    if(navigator.onLine===false){syncStatus("⚠ Hors ligne — fiches locales uniquement","var(--danger)");if(onDone)onDone();return;}
    syncStatus("☁ Lecture des fiches de la table…");
    fetch(SUPA_URL+"/fiches?select=id,maj,data&order=maj.desc",{headers:SUPA_HEADERS,cache:"no-store"})
    .then(function(r){return r.ok?r.json():Promise.reject(new Error("http "+r.status));})
    .then(function(rows){
      var changed=false;
      (rows||[]).forEach(function(row){
        var d=row.data;
        if(!d||!d.st){return;}
        norm(d);d.id=row.id;
        var rmaj=(row.maj?new Date(row.maj).getTime():0)||0;
        var found=null;
        for(var i=0;i<state.chars.length;i++){if(state.chars[i].id===row.id){found=i;break;}}
        if(found===null){state.chars.push(d);changed=true;}
        else{
          var lmaj=(state.chars[found].maj?new Date(state.chars[found].maj).getTime():0)||0;
          if(rmaj>lmaj){state.chars[found]=d;changed=true;}
        }
      });
      if(changed){save();}
      syncStatus("☁ Fiches de la table à jour","var(--teal)");
      if(onDone)onDone();
    })
    .catch(function(){syncStatus("⚠ Lecture du nuage impossible — affichage des fiches locales","var(--danger)");if(onDone)onDone();});
  }catch(e){if(onDone)onDone();}
}
/* ===== Interface ===== */
function renderCards(){
  var box=$("cards");box.textContent="";
  if(!state.chars.length){
    var p=document.createElement("p");p.style.color="var(--muted)";
    p.textContent="Aucun personnage enregistré pour l'instant. Créez votre première fiche avec le bouton ci-dessus.";
    box.appendChild(p);return;
  }
  state.chars.forEach(function(ch){
    var card=document.createElement("div");card.className="card";
    var h=document.createElement("h3");h.textContent=ch.nom||"Personnage sans nom";card.appendChild(h);
    var meta=document.createElement("p");meta.textContent=ch.ch+(ch.code?" · Code "+ch.code:"");card.appendChild(meta);
    var pv=document.createElement("p");pv.textContent="PV perdus : "+pvLost(ch)+" / "+(ch.st.pv||"?")+(ch.xp!==""&&ch.xp!==undefined?" · XP : "+ch.xp:"");card.appendChild(pv);
    var row=document.createElement("div");row.className="cardbtns";
    var b1=document.createElement("button");b1.className="btn ghost";b1.textContent="Ouvrir";
    b1.onclick=function(){showEdit(ch.id);};row.appendChild(b1);
    var b2=document.createElement("button");b2.className="btn danger";b2.textContent="Supprimer";
    b2.onclick=function(){if(confirm("Supprimer définitivement cette fiche (pour toute la table) ?")){deleteRemote(ch.id);state.chars=state.chars.filter(function(c){return c.id!==ch.id;});save();renderCards();}};row.appendChild(b2);
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
}
function collect(){
  if(!cur)return;
  var ch=norm(cur);
  ch.nom=$("f-nom").value;ch.ch=$("f-ch").value;ch.code=$("f-code").value;

  ["m","cc","ct","f","e","pv","a","cd","sv","inv","rfx","mem","cal"].forEach(function(k){ch.st[k]=$("st-"+k).value;});
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
  if(ch.bouclier.n){
    lignes+=(cur.modules.bouclier?ligneSlot("Bouclier",EQ.T(ch.bouclier.t)+" max",contenuModule(cur.modules.bouclier),petitBtn("Ranger",'data-mrq="bouclier:0"'))
                                 :ligneSlot("Bouclier",EQ.T(ch.bouclier.t)+" max",VIDE_SLOT,'',true));
  }else{
    lignes+=ligneSlot("Bouclier","","<span style=\"font-size:.75rem;color:var(--muted)\">— aucun emplacement sur ce châssis —</span>",'',true);
  }
  var cardCh='<div style="background:var(--panel2);padding:8px 12px;margin:8px 0 10px">'
   +'<div style="color:#c8e9df;font-weight:700;font-size:.88rem">Châssis « '+esc(ch.nom)+' » — intégrité '+esc(ch.st.pv)+' PV</div>'
   +'<div style="font-size:.75rem;color:var(--muted);margin-top:3px">Emplacements — Armes ×'+ch.armes.n+' ('+EQ.T(ch.armes.t)+' max) · Capteurs ×'+ch.capteurs.n+' ('+EQ.T(ch.capteurs.t)+' max) · Cœur ('+EQ.T(ch.coeur.t)+' max) · Noyau ('+EQ.T(ch.noyau.t)+' max)'
   +(ch.bouclier.n?(' · Bouclier ×'+ch.bouclier.n+' ('+EQ.T(ch.bouclier.t)+' max)'):' · aucun bouclier')+'</div></div>';
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
  var cats={capteur:"Capteurs",coeur:"Cœurs énergétiques",noyau:"Noyaux de charge",bouclier:"Boucliers"};
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
function memCal(ch){return {mem:(parseInt(ch&&ch.st&&ch.st.mem,10)||0),cal:(parseInt(ch&&ch.st&&ch.st.cal,10)||0)};}
function protCompte(ch){var act=0;(ch.protocoles||[]).forEach(function(p){if(p.actif)act++;});return {ins:(ch.protocoles||[]).length,act:act};}
function protDB(){return (EQ&&EQ.PROTOCOLES_DB)||[];}
function protDesc(id){var DB=protDB();for(var i=0;i<DB.length;i++){if(DB[i].id===id){return DB[i];}}return null;}
function renderProtocoles(){
  var pb=$("prot-box");if(!pb||!cur){return;}
  norm(cur);
  var mc=memCal(cur),ct=protCompte(cur),DB=protDB(),rows="";
  var surplus=ct.ins>mc.mem;
  (cur.protocoles||[]).forEach(function(p){
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
  pb.innerHTML='<ul style="padding:0;margin:6px 0 0">'+secours+rows+'</ul>'
   +'<div style="font-size:.75rem;color:var(--muted);margin-top:8px">Places mémoire : <strong>'+ct.ins+'/'+mc.mem+'</strong> installés · Calcul : <strong>'+ct.act+'/'+mc.cal+'</strong> actifs'
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
  if(ct.ins>=mc.mem){protMsg("Plus de place mémoire ("+ct.ins+"/"+mc.mem+") — désinstallez un protocole.","err");return;}
  cur.protocoles.push({id:id,actif:false});
  cur.maj=new Date().toISOString();save();queueSync(cur);renderProtocoles();
  protMsg("Protocole installé en mémoire.");
}
function desinstallerProtocole(id){
  if(!cur){return;}
  cur.protocoles=(cur.protocoles||[]).filter(function(x){return x.id!==id;});
  cur.maj=new Date().toISOString();save();queueSync(cur);renderProtocoles();
  protMsg("Protocole désinstallé de la mémoire.");
}
function activerProtocole(id){
  if(!cur){return;}
  var mc=memCal(cur),ct=protCompte(cur),p=null;
  (cur.protocoles||[]).forEach(function(x){if(x.id===id){p=x;}});
  if(!p){return;}
  if(!p.actif&&ct.act>=mc.cal){protMsg("Capacité de calcul atteinte ("+ct.act+"/"+mc.cal+") — arrêtez d'abord un protocole actif.","err");return;}
  p.actif=!p.actif;
  cur.maj=new Date().toISOString();save();queueSync(cur);renderProtocoles();
  protMsg(p.actif?"Protocole en cours d'exécution.":"Protocole arrêté.");
}
function apresMod(msg){cur.maj=new Date().toISOString();save();queueSync(cur);renderModules();if(msg){modMsg(msg,"ok");}}
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
  ["coeur","noyau","bouclier"].forEach(function(cat){
    var mid=cur.modules[cat];if(!mid){return;}
    var m=EQ.moduleDe(mid),conf=ch[cat];
    if(!m||m.taille>conf.t||(cat==="bouclier"&&conf.n===0)){
      ranges.push(m?m.nom:mid);cur.inv.push({uid:uid(),kind:"module",id:mid});cur.modules[cat]=null;
    }
  });
  return ranges;
}
function showList(){cur=null;$("view-edit").style.display="none";$("view-list").style.display="block";renderCards();}
function showEdit(id){cur=byId(id);if(!cur)return;norm(cur);$("view-list").style.display="none";$("view-edit").style.display="block";$("exp-box").style.display="none";fillForm();window.scrollTo(0,0);}
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
  /* — déconnexion (sous-menu) — */
  $("app-logout").addEventListener("click",function(ev){
    ev.preventDefault();
    try{localStorage.removeItem("pe_session");}catch(e){}
    location.replace("https://chokmah-hash.github.io/joueur.html");
  });
  try{var _sess=JSON.parse(localStorage.getItem("pe_session")||"null");if(_sess&&_sess.nom){$("logout-who").textContent=" ("+_sess.nom+")";}}catch(e){}
  $("f-form").addEventListener("input",collect);
  $("f-form").addEventListener("change",collect);
  $("btn-new").addEventListener("click",function(){var c=blankChar("Fantassin programmé");state.chars.push(c);save();showEdit(c.id);});
  $("btn-back").addEventListener("click",function(){collect();showList();});
  $("btn-del").addEventListener("click",function(){
    if(!cur)return;
    if(confirm("Supprimer définitivement cette fiche (pour toute la table) ?")){deleteRemote(cur.id);state.chars=state.chars.filter(function(c){return c.id!==cur.id;});save();showList();}
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
      norm(obj);obj.id=uid();obj.maj=new Date().toISOString();
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
