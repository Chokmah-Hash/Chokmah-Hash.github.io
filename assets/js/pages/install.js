/* PE_BUILD 2026.10.26-mot8 — install.html : les trois visages de la porte de distribution */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function face(k){
 ['chrome','ios','done'].forEach(function(id){
  var el=$('ip-'+id);
  if(el){el.style.display=(id===k)?'':'none';}
 });
}
function standalone(){
 try{
  return (window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||(navigator.standalone===true);
 }catch(e){return false;}
}
function iosSafari(){
 var ua=(navigator&&navigator.userAgent)||'';
 return /iPad|iPhone|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
}
function setWait(){
 var b=$('ip-btn'),s=$('ip-st');
 if(!b){return;}
 b.textContent='En attente du navigateur…';
 b.className='btn primary';
 b.disabled=true;
 if(s){s.textContent='Chrome arme le prompt après un clic et trente secondes de présence — le bouton s\u2019allume alors. S\u2019il tarde : menu ⋮ du navigateur, puis « Installer l\u2019application ».';}
}
function setReady(){
 var b=$('ip-btn'),s=$('ip-st');
 if(!b){return;}
 b.textContent='→ Installer l\u2019application';
 b.className='btn primary';
 b.disabled=false;
 if(s){s.textContent='Le clic ouvrira la boîte d\u2019installation du navigateur — le geste du joueur reste obligatoire.';}
}
var DPEVT=null;
window.addEventListener('beforeinstallprompt',function(e){
 e.preventDefault();
 DPEVT=e;
 setReady();
});
window.addEventListener('appinstalled',function(){face('done');});
if(standalone()){face('done');return;}
if(iosSafari()){face('ios');return;}
face('chrome');
setWait();
$('ip-btn').addEventListener('click',function(){
 if(!DPEVT){setWait();return;}
 var ev=DPEVT;DPEVT=null;
 ev.prompt();
 ev.userChoice.then(function(ch){
  if(ch&&ch.outcome==='accepted'){face('done');}
  else{setWait();}
 }).catch(function(){setWait();});
});
})();
