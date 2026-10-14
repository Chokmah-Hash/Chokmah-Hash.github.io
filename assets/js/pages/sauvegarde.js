
var PAGES=[
 ["index.html","/"],
 ["regles.html","/regles.html"],
 ["fiches.html","/fiches.html"],
 ["mj.html","/mj.html"],
 ["sauvegarde.html","/sauvegarde.html"],
 ["bestiaire.html","/bestiaire.html","https://chokmah-hash.github.io/bestiaire.html"],
 ["mon-espace.html","/mon-espace.html","https://chokmah-hash.github.io/mon-espace.html"],
 ["galaxie.html","/galaxie.html","https://chokmah-hash.github.io/galaxie.html"]
];
var ASSETS=[["assets/css/main.css","/assets/css/main.css"],["favicon.svg","/favicon.svg"],["assets/js/core.js","/assets/js/core.js"],["assets/js/pages/fiches.js","/assets/js/pages/fiches.js"],["assets/js/pages/bestiaire.js","/assets/js/pages/bestiaire.js"],["assets/js/pages/galaxie.js","/assets/js/pages/galaxie.js"],["assets/js/pages/mon-espace.js","/assets/js/pages/mon-espace.js"],["assets/js/pages/mj.js","/assets/js/pages/mj.js"],["assets/js/pages/sauvegarde.js","/assets/js/pages/sauvegarde.js"],["icons/icon-192.png","/icons/icon-192.png"],["icons/apple-touch-icon.png","/icons/apple-touch-icon.png"],["manifest.webmanifest","/manifest.webmanifest"],["sw.js","/sw.js"]];
var ZIPNAME="les-protocoles-eternels-site.zip";
var DESCR={
 "index.html":"page d'accueil",
 "regles.html":"manuel du joueur (version neutre, sans secrets de campagne)",
 "fiches.html":"application de fiches d'unité (navigateur + synchronisation nuage)",
 "mj.html":"zone MJ, contenu brouillé — le mot de passe n'est PAS dans l'archive",
 "sauvegarde.html":"la page qui a généré cette archive",
 "bestiaire.html":"bestiaire partagé (les créatures vivent dans la base en nuage, pas dans l'archive)",
 "mon-espace.html":"espace joueur : aventure, personnages, notes (tout vit dans la base en nuage)",
 "galaxie.html":"carte de la galaxie interactive (les systemes vivent dans la base en nuage, pas dans le code)",
 "assets/css/main.css":"theme commun du site (mise en page des pages)",
 "favicon.svg":"icone du site"
};
function $(id){return document.getElementById(id);}
var CRCT=(function(){var t=[],c,k,n;for(n=0;n<256;n++){c=n;for(k=0;k<8;k++){c=c&1?0xEDB88320^(c>>>1):c>>>1;}t[n]=c>>>0;}return t;})();
function crc32(u8){var c=0^-1;for(var i=0;i<u8.length;i++){c=(c>>>8)^CRCT[(c^u8[i])&0xFF];}return (c^-1)>>>0;}
function bytesOf(str){
  var s=unescape(encodeURIComponent(str));
  var u=new Uint8Array(s.length);
  for(var i=0;i<s.length;i++){u[i]=s.charCodeAt(i)&0xFF;}
  return u;
}
function cleanHtml(t){
  t=t.replace(/<link rel="canonical"[^>]*>\s*/g,"");
  t=t.replace(/<script>!function\(\)\{"use strict";if\("function"!=typeof Node[\s\S]*?<\/script>\s*/g,"");
  t=t.replace(/<script type="text\/javascript">hostname[\s\S]*?<\/script>\s*/g,"");
  t=t.replace(/<!-- WPE-DEBUG[^>]*-->[\s\S]*?loader\.js[\s\S]*?<\/script>\s*/g,"");
  t=t.replace(/<!-- WebsitePublisher\.ai Powered-by Widget -->[\s\S]*?(?=<\/body>)/,"");
  return t;
}
function makeZip(files){
  var d=new Date();
  var dosTime=((d.getHours()&31)<<11)|((d.getMinutes()&63)<<5)|((Math.floor(d.getSeconds()/2))&31);
  var dosDate=(((d.getFullYear()-1980)&127)<<9)|(((d.getMonth()+1)&15)<<5)|(d.getDate()&31);
  var parts=[],central=[],offset=0;
  files.forEach(function(f){
    var name=bytesOf(f.name);
    var crc=crc32(f.data);
    var lh=new Uint8Array(30+name.length);
    var dv=new DataView(lh.buffer);
    dv.setUint32(0,0x04034b50,true);
    dv.setUint16(4,20,true);
    dv.setUint16(6,0x0800,true);
    dv.setUint16(8,0,true);
    dv.setUint16(10,dosTime,true);
    dv.setUint16(12,dosDate,true);
    dv.setUint32(14,crc,true);
    dv.setUint32(18,f.data.length,true);
    dv.setUint32(22,f.data.length,true);
    dv.setUint16(26,name.length,true);
    dv.setUint16(28,0,true);
    lh.set(name,30);
    parts.push(lh);parts.push(f.data);
    var ch=new Uint8Array(46+name.length);
    var cv=new DataView(ch.buffer);
    cv.setUint32(0,0x02014b50,true);
    cv.setUint16(4,20,true);
    cv.setUint16(6,20,true);
    cv.setUint16(8,0x0800,true);
    cv.setUint16(10,0,true);
    cv.setUint16(12,dosTime,true);
    cv.setUint16(14,dosDate,true);
    cv.setUint32(16,crc,true);
    cv.setUint32(20,f.data.length,true);
    cv.setUint32(24,f.data.length,true);
    cv.setUint16(28,name.length,true);
    cv.setUint16(30,0,true);
    cv.setUint16(32,0,true);
    cv.setUint16(34,0,true);
    cv.setUint16(36,0,true);
    cv.setUint32(38,0,true);
    cv.setUint32(42,offset,true);
    ch.set(name,46);
    central.push(ch);
    offset+=lh.length+f.data.length;
  });
  var cdSize=0;central.forEach(function(c){cdSize+=c.length;});
  var eocd=new Uint8Array(22);
  var ev=new DataView(eocd.buffer);
  ev.setUint32(0,0x06054b50,true);
  ev.setUint16(4,0,true);
  ev.setUint16(6,0,true);
  ev.setUint16(8,files.length,true);
  ev.setUint16(10,files.length,true);
  ev.setUint32(12,cdSize,true);
  ev.setUint32(16,offset,true);
  ev.setUint16(20,0,true);
  var all=parts.concat(central);all.push(eocd);
  var total=0;all.forEach(function(p){total+=p.length;});
  var out=new Uint8Array(total);var pos=0;
  all.forEach(function(p){out.set(p,pos);pos+=p.length;});
  return new Blob([out],{type:"application/zip"});
}
function fmt(n){return n>1024?Math.round(n/1024)+" Ko":n+" o";}
function setRow(i,cls,txt){
  var rows=$("zip-status").getElementsByClassName("zip-row");
  var r=rows[i];
  r.className="zip-row "+cls;
  r.getElementsByTagName("span")[1].textContent=r.getElementsByTagName("span")[1].textContent.split(" — ")[0]+" — "+txt;
}
function run(){
  var msg=$("zip-msg");
  msg.style.color="var(--muted)";
  msg.textContent="Téléchargement des pages en cours…";
  var rows=$("zip-status").getElementsByClassName("zip-row");
  for(var q=0;q<rows.length;q++){rows[q].className="zip-row";rows[q].getElementsByClassName("sz")[0].textContent="";}
  var files=[];
  var done=0,fail=0;
  PAGES.forEach(function(p,idx){
    fetch(p[1],{cache:"no-store"}).then(function(r){
      if(!r.ok){throw new Error("http "+r.status);}
      return r.text();
    }).then(function(txt){
      files.push({name:p[0],data:bytesOf(cleanHtml(txt))});
      setRow(idx,"ok","récupérée");
      rows[idx].getElementsByClassName("sz")[0].textContent=fmt(txt.length);
    }).catch(function(){
      if(p[2]){
        return fetch(p[2],{cache:"no-store"}).then(function(r){
          if(!r.ok){throw new Error("http "+r.status);}
          return r.text();
        }).then(function(txt){
          files.push({name:p[0],data:bytesOf(cleanHtml(txt))});
          setRow(idx,"ok","récupérée (miroir GitHub)");
          rows[idx].getElementsByClassName("sz")[0].textContent=fmt(txt.length);
        }).catch(function(){
          fail++;
          setRow(idx,"ko","absente");
        });
      }
      fail++;
      setRow(idx,"ko","inaccessible");
    }).then(function(){
      done++;
      if(done<PAGES.length){return;}
      var finish=function(){
      var d=new Date();
      var readme="LES PROTOCOLES ÉTERNELS — Sauvegarde du site\n"+
        "Archive générée le "+d.toLocaleDateString("fr-FR")+" à "+d.toLocaleTimeString("fr-FR")+"\n"+
        "Source : https://project30149.websitepublisher.ai\n\n"+
        "CONTENU\n"+
        files.map(function(f){return "- "+f.name+" : "+(DESCR[f.name]||"");}).join("\n")+"\n\n"+
        "MODE D'EMPLOI HORS LIGNE\n"+
        "Ouvrez chaque fichier .html dans un navigateur (double-clic). Le site est statique\n"+
        "et autonome : navigation et mise en page incluses. Seules les données en nuage\n"+
        "(fiches partagées, bestiaire, espace joueur) nécessitent une connexion internet.\n\n"+
        "FICHES DE PERSONNAGE\n"+
        "Elles sont stockées dans le navigateur utilisé (stockage local, clé pe_fiches_v1),\n"+
        "pas dans le site : elles ne sont PAS dans cette archive. Pour les conserver ou les\n"+
        "transférer, utilisez les codes d'export de la page Fiches.\n\n"+
        "Usage strictement privé entre amis. Bon jeu ! ⚡";
      files.push({name:"LISEZMOI.txt",data:bytesOf(readme)});
      setRow(9,"ok","g\u00e9n\u00e9r\u00e9");
      var blob=makeZip(files);
      var a=document.createElement("a");
      a.href=URL.createObjectURL(blob);
      a.download=ZIPNAME;
      document.body.appendChild(a);
      a.click();
      setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},4000);
      msg.style.color=fail>0?"var(--amber)":"var(--teal)";
      msg.textContent="Archive prête : "+ZIPNAME+" ("+fmt(blob.size)+") — site 100 % propre (sans scripts ni badge de l'hébergeur). Vérifiez vos téléchargements."+(fail>0?" Attention : "+fail+" page(s) ignorée(s).":"");
      };
      var left=ASSETS.length;
      if(!left){finish();}
      ASSETS.forEach(function(a){
        fetch(a[1],{cache:"no-store"}).then(function(r){
          if(!r.ok){throw new Error("http "+r.status);}
          return r.text();
        }).then(function(txt){
          files.push({name:a[0],data:bytesOf(txt)});
          setRow(8,"ok","récupérés");
        }).catch(function(){
          fail++;
          setRow(8,"ko","absents");
        }).then(function(){
          left--;
          if(!left){finish();}
        });
      });
    });
  });
}
$("btn-zip").addEventListener("click",run);
