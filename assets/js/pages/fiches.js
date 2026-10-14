
(function(){
"use strict";
/* Accès réservé : sans session joueur (mon-espace), renvoi vers Mon espace */
try{
  var _sess=JSON.parse(localStorage.getItem("pe_session")||"null");
  if(!_sess||!_sess.id||!_sess.token){location.replace("https://chokmah-hash.github.io/mon-espace.html");return;}
}catch(e){location.replace("https://chokmah-hash.github.io/mon-espace.html");return;}
var LSKEY="pe_fiches_v1";
var SUPA_URL="https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1";
var SUPA_KEY="sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov";
var SUPA_HEADERS={"apikey":SUPA_KEY,"Authorization":"Bearer "+SUPA_KEY,"Content-Type":"application/json"};
var OTOK="";
var CH=[
 {n:"Fantassin programmé",m:"10",cc:"4+",ct:"4+",f:"4",e:"4",pv:"3",a:"1",cd:"7+",sv:"4+",rfx:"+0",apt:"Discipline sans faille : relancez 1 test de Commandement raté par scène.",cp:["Athlétisme","Technologie"]},
 {n:"Vétéran",m:"10",cc:"3+",ct:"3+",f:"5",e:"5",pv:"3",a:"1",cd:"8+",sv:"3+",rfx:"+1",apt:"Élite : vos touches critiques infligent +1 dégât.",cp:["Athlétisme","Perception"]},
 {n:"Traqueur",m:"10",cc:"3+",ct:"3+",f:"5",e:"5",pv:"3",a:"1",cd:"8+",sv:"3+",rfx:"+2",apt:"Embuscade : 1×/scène, apparaissez dans un rayon de 6 m (après 1 round de délai).",cp:["Furtivité","Perception","Pilotage"]},
 {n:"Ombre",m:"10",cc:"3+",ct:"6+",f:"5",e:"4",pv:"3",a:"3",cd:"8+",sv:"4+",rfx:"+2",apt:"Peau d'ombre : Furtivité 3+ ; ennemis qui vous voient -1 Cd.",cp:["Furtivité","Intimidation"]},
 {n:"Sentinelle",m:"10",cc:"3+",ct:"4+",f:"6",e:"5",pv:"6",a:"2",cd:"8+",sv:"3+",rfx:"+1",apt:"Écran : 1×/round, prenez une frappe destinée à un allié à 2 m.",cp:["Athlétisme","Intimidation"]},
 {n:"Officier de garde",m:"10",cc:"3+",ct:"3+",f:"5",e:"5",pv:"12",a:"3",cd:"8+",sv:"3+",rfx:"+1",apt:"Ordre de secours : 1×/scène, forcez un allié à relancer son Protocole de Secours.",cp:["Commandement","Technologie"]},
 {n:"Artificier",m:"10",cc:"3+",ct:"3+",f:"4",e:"5",pv:"12",a:"2",cd:"8+",sv:"4+",rfx:"+1",apt:"Essaim réparateur : 1×/scène, soignez D3 PV d'une unité à 6 m.",cp:["Technologie","Érudition","Perception"]},
 {n:"Énergicien",m:"10",cc:"3+",ct:"3+",f:"5",e:"5",pv:"12",a:"3",cd:"8+",sv:"3+",rfx:"+1",apt:"Décharge : 1×/scène, attaque F7 PA -2 D 2 à tous les ennemis à 3 m.",cp:["Technologie","Érudition"]},
 {n:"Commandant",m:"10",cc:"3+",ct:"3+",f:"6",e:"6",pv:"15",a:"4",cd:"9+",sv:"3+",rfx:"+1",apt:"Aura de commandement : les alliés à 6 m relancent les 1 au toucher.",cp:["Commandement","Intimidation","Érudition"]},
 {n:"Seigneur de guerre",m:"10",cc:"2+",ct:"2+",f:"6",e:"6",pv:"18",a:"5",cd:"10+",sv:"3+",rfx:"+1",apt:"Volonté inflexible : relancez 1 échec par round.",cp:["Commandement","Érudition","Intimidation","Technologie"]}
];
var CODES=["Éternel","Pragmatique","Sanguinaire","Solaire","Tutélaire","Fondateur"];
var COMPS=["Perception","Furtivité","Technologie","Érudition","Commandement","Intimidation","Athlétisme","Pilotage"];
var ARMES=[
 ["Fusil magnétique","48 m","1","5","-1","1","Perforation"],
 ["Canon magnétique","48 m","1","6","-1","1","Perforation"],
 ["Mitrailleur magnétique","36 m","2","6","-2","1","Perforation"],
 ["Canon longue-portée","72 m","1","7","-2","2","Précis : ignore le couvert"],
 ["Carabine à arcs","28 m","2","5","-1","1","Arc : critique = 1 dégât irréversible en plus"],
 ["Bâton d'énergie","24 m","1","5","-2","2","Aussi utilisable en mêlée"],
 ["Sceptre tactique","18 m","1","6","-1","2","Relance 1 au toucher, 1×/bataille"],
 ["Pistolets jumelés ×6","12 m","3","5","-2","1","Tir défensif sur un ennemi qui approche"],
 ["Bâton d'énergie (mêlée)","A","F+1","-2","2","—"],
 ["Lame désagrégatrice","A","F+1","-3","2","—"],
 ["Lames jumelles (paire)","A+1","F+1","-2","2","+1 A si deux lames"],
 ["Faucheuse lourde","A","F+2","-4","D3","Lourde : -1 à l'initiative"],
 ["Grappins déchiqueteurs","A+1","F+1","-2","1","Terreur : Cd -1 en face"],
 ["Sceptre de duel","A","F+2","-3","2","Critique sur 5+ en duel"]
];
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
function load(){try{var d=JSON.parse(localStorage.getItem(LSKEY)||"null");if(d&&d.chars){state=d;}}catch(e){}}
function save(){try{localStorage.setItem(LSKEY,JSON.stringify(state));}catch(e){}}
function uid(){return "c"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function byId(id){for(var i=0;i<state.chars.length;i++){if(state.chars[i].id===id)return state.chars[i];}return null;}
function chByName(n){for(var i=0;i<CH.length;i++){if(CH[i].n===n)return CH[i];}return CH[0];}
function norm(c){
  if(!c.arm)c.arm=[{},{},{}];
  while(c.arm.length<3)c.arm.push({});
  if(!c.eq)c.eq=[{},{},{}];
  while(c.eq.length<3)c.eq.push({});
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
  return {id:uid(),nom:"",ch:c.n,code:"",fonction:"",emotion:"",opinion:"",
   st:{m:c.m,cc:c.cc,ct:c.ct,f:c.f,e:c.e,pv:c.pv,a:c.a,cd:c.cd,sv:c.sv,inv:"",rfx:c.rfx},
   pv:p,ech:[false,false],comps:c.cp.slice(0),
   arm:[{},{},{}],eq:[{},{},{}],
   apt:c.apt,aptA:"",p1:{t:"",used:false},p2:{t:"",used:false},
   xp:"",notes:"",maj:new Date().toISOString()};
}
function pvLost(ch){var n=0;for(var i=0;i<ch.pv.length;i++){if(ch.pv[i])n++;}return n;}
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
      body:JSON.stringify({id:ch.id,code_partie:"zulthekh",nom:ch.nom||"Unité sans nom",data:ch,owner_token:OTOK,maj:ch.maj||new Date().toISOString()})
    }).then(function(r){
      if(r.ok){syncStatus("☁ Synchronisée — visible par toute la table","var(--teal)");}
      else{syncStatus("⚠ Synchronisation refusée (fiche protégée par sa créatrice) — enregistrée localement","var(--danger)");}
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
    p.textContent="Aucune unité enregistrée pour l'instant. Créez votre première fiche avec le bouton ci-dessus.";
    box.appendChild(p);return;
  }
  state.chars.forEach(function(ch){
    var card=document.createElement("div");card.className="card";
    var h=document.createElement("h3");h.textContent=ch.nom||"Unité sans nom";card.appendChild(h);
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
function fillForm(){
  var ch=norm(cur);
  $("f-title").textContent="Fiche — "+(ch.nom||"unité sans nom");
  $("f-nom").value=ch.nom;$("f-ch").value=ch.ch;setSelect("f-code",ch.code||"");
  $("f-fonction").value=ch.fonction||"";$("f-emotion").value=ch.emotion||"";$("f-opinion").value=ch.opinion||"";
  var st=ch.st;
  ["m","cc","ct","f","e","pv","a","cd","sv","inv","rfx"].forEach(function(k){$("st-"+k).value=st[k]||"";});
  pvNodes.forEach(function(el,i){el.classList.toggle("on",!!ch.pv[i]);});
  $("ech-0").classList.toggle("on",!!ch.ech[0]);$("ech-1").classList.toggle("on",!!ch.ech[1]);
  compsNodes.forEach(function(o){var on=ch.comps.indexOf(o.name)>=0;o.box.checked=on;o.lab.classList.toggle("on",on);});
  for(var i=0;i<3;i++){
    var a=ch.arm[i]||{};
    setSelect("ar"+i+"-w",a.w||"");
    $("ar"+i+"-po").value=a.po||"";$("ar"+i+"-at").value=a.at||"";$("ar"+i+"-f").value=a.f||"";
    $("ar"+i+"-pa").value=a.pa||"";$("ar"+i+"-d").value=a.d||"";$("ar"+i+"-sp").value=a.sp||"";
    var q=ch.eq[i]||{};
    setSelect("eq"+i+"-w",q.w||"");
    $("eq"+i+"-e").value=q.e||"";$("eq"+i+"-u").checked=!!q.used;
  }
  $("f-apt").value=ch.apt||"";$("f-aptA").value=ch.aptA||"";
  $("f-p1").value=ch.p1.t||"";$("f-p1u").checked=!!ch.p1.used;
  $("f-p2").value=ch.p2.t||"";$("f-p2u").checked=!!ch.p2.used;
  $("f-xp").value=ch.xp||"";$("f-notes").value=ch.notes||"";
}
function collect(){
  if(!cur)return;
  var ch=norm(cur);
  ch.nom=$("f-nom").value;ch.ch=$("f-ch").value;ch.code=$("f-code").value;
  ch.fonction=$("f-fonction").value;ch.emotion=$("f-emotion").value;ch.opinion=$("f-opinion").value;
  ["m","cc","ct","f","e","pv","a","cd","sv","inv","rfx"].forEach(function(k){ch.st[k]=$("st-"+k).value;});
  ch.ech=[$("ech-0").classList.contains("on"),$("ech-1").classList.contains("on")];
  ch.comps=[];compsNodes.forEach(function(o){if(o.box.checked)ch.comps.push(o.name);});
  for(var i=0;i<3;i++){
    ch.arm[i]={w:$("ar"+i+"-w").value,po:$("ar"+i+"-po").value,at:$("ar"+i+"-at").value,f:$("ar"+i+"-f").value,pa:$("ar"+i+"-pa").value,d:$("ar"+i+"-d").value,sp:$("ar"+i+"-sp").value};
    ch.eq[i]={w:$("eq"+i+"-w").value,e:$("eq"+i+"-e").value,used:$("eq"+i+"-u").checked};
  }
  ch.apt=$("f-apt").value;ch.aptA=$("f-aptA").value;
  ch.p1={t:$("f-p1").value,used:$("f-p1u").checked};
  ch.p2={t:$("f-p2").value,used:$("f-p2u").checked};
  ch.xp=$("f-xp").value;ch.notes=$("f-notes").value;
  ch.maj=new Date().toISOString();
  $("f-title").textContent="Fiche — "+(ch.nom||"unité sans nom");
  save();
  queueSync(ch);
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
  for(var i=0;i<3;i++){
    (function(i){
      var sel=$("ar"+i+"-w");
      var o0=document.createElement("option");o0.value="";o0.textContent="— arme personnalisée / vide —";sel.appendChild(o0);
      ARMES.forEach(function(a){var o=document.createElement("option");o.value=a[0];o.textContent=a[0];sel.appendChild(o);});
      sel.addEventListener("change",function(){
        if(sel.value===""){return;}
        ARMES.forEach(function(a){if(a[0]===sel.value){
          $("ar"+i+"-po").value=a[1];$("ar"+i+"-at").value=a[2];$("ar"+i+"-f").value=a[3];$("ar"+i+"-pa").value=a[4];$("ar"+i+"-d").value=a[5];$("ar"+i+"-sp").value=a[6];
        }});
      });
      var eq=$("eq"+i+"-w");
      var e0=document.createElement("option");e0.value="";e0.textContent="— objet personnalisé / vide —";eq.appendChild(e0);
      EQUIP.forEach(function(x){var o=document.createElement("option");o.value=x[0];o.textContent=x[0];eq.appendChild(o);});
      eq.addEventListener("change",function(){
        if(eq.value===""){return;}
        EQUIP.forEach(function(x){if(x[0]===eq.value){$("eq"+i+"-e").value=x[1];}});
      });
    })(i);
  }
  for(var j=0;j<30;j++){
    (function(idx){
      var s=document.createElement("span");s.className="pv";
      s.addEventListener("click",function(){if(!cur)return;cur.pv[idx]=!cur.pv[idx];s.classList.toggle("on",cur.pv[idx]);cur.maj=new Date().toISOString();save();queueSync(cur);});
      $("pv-box").appendChild(s);pvNodes.push(s);
    })(j);
  }
  [0,1].forEach(function(k){
    $("ech-"+k).addEventListener("click",function(){if(!cur)return;cur.ech[k]=!cur.ech[k];this.classList.toggle("on",cur.ech[k]);cur.maj=new Date().toISOString();save();queueSync(cur);});
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
    cur.st={m:c.m,cc:c.cc,ct:c.ct,f:c.f,e:c.e,pv:c.pv,a:c.a,cd:c.cd,sv:c.sv,inv:cur.st.inv||"",rfx:c.rfx};
    cur.apt=c.apt;cur.comps=c.cp.slice(0);
    fillForm();save();
  });
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
      msg.textContent="Fiche importée : "+(obj.nom||"unité sans nom");
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
