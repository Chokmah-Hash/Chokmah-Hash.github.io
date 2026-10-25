/* Les Protocoles Éternels — core.js : lien de nav actif, bouton retour en haut, enregistrement du service worker */
(function(){
function init(){
(function(){var p=location.pathname;document.querySelectorAll('.nav-links a').forEach(function(a){var h=(a.getAttribute('href')||'').split('#')[0];var n=h.replace(/\.html$/,'');if(n===''||n==='/'){if(p==='/'||p==='/index.html'){a.classList.add('active');}}else if(p===h||p===n||p.indexOf(n)===0){a.classList.add('active');}});})();
(function(){var a=document.querySelector('.nav-links a.mj');if(!a){return;}if(location.pathname.indexOf('/espace-mj/moteur.html')===0){return;}var z=null;try{z=localStorage.getItem('pe_mjzone');}catch(e){}if(!z){return;}if(z==='aventures'){a.setAttribute('href','/espace-mj/moteur.html');return;}if(['mj-content','carte-console','best-console','img-console','comptes-console','des-sect'].indexOf(z)>=0){a.setAttribute('href','/mj.html#'+z);}})();
(function(){var b=document.getElementById('pe-top');if(!b){return;}window.addEventListener('scroll',function(){if(window.scrollY>300){b.classList.add('show');}else{b.classList.remove('show');}},{passive:true});b.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});})();
}
/* Navigations repliables : hauteur de la barre principale (sticky), hamburger (barre du haut + sous-menu) dès que les liens débordent, lien actif au scroll */
(function(){
var h=document.querySelector('header.nav'),sn=document.querySelector('.subnav');
if(!h){return;}
var setH=function(){document.documentElement.style.setProperty('--nav-h',h.offsetHeight+'px');};
setH();window.addEventListener('resize',setH);window.addEventListener('load',setH);
var hasMain=function(){for(var i=0;i<document.styleSheets.length;i++){var s=document.styleSheets[i];if(s.href&&s.href.indexOf('main.css')!==-1){return true;}}return false;};
/* Burger du menu principal retire : la nav minimale tient toujours en ligne */
var nl=h.querySelector('.nav-links'),navTg=null;
if(nl){Array.prototype.forEach.call(nl.querySelectorAll('a'),function(a){a.addEventListener('click',function(){h.classList.remove('open');});});}
var sni=sn?sn.querySelector('.subnav-in'):null;
var tg=sn?sn.querySelector('.subnav-toggle'):null;
var closeNav=function(){h.classList.remove('open');if(navTg){navTg.setAttribute('aria-expanded','false');}};
var closeSn=function(){if(sn){sn.classList.remove('open');}if(tg){tg.setAttribute('aria-expanded','false');}};
if(tg){tg.addEventListener('click',function(){var open=sn.classList.toggle('open');tg.setAttribute('aria-expanded',open?'true':'false');});}
if(sn){Array.prototype.forEach.call(sn.querySelectorAll('.subnav-in a,.subnav-in button'),function(el){el.addEventListener('click',function(){var hh=el.getAttribute('href')||'';if(hh.length>1&&hh.charAt(0)==='#'){Array.prototype.forEach.call(sn.querySelectorAll('.subnav-in a'),function(o){o.classList.toggle('active',o===el);});}closeSn();});});}
document.addEventListener('click',function(ev){
if(h.classList.contains('open')&&!h.contains(ev.target)){closeNav();}
if(sn&&sn.classList.contains('open')&&!sn.contains(ev.target)){closeSn();}
});
var fit=function(){
if(navTg&&nl&&!h.classList.contains('open')){
if(h.classList.contains('collapse')){h.classList.remove('collapse');}
h.classList.toggle('collapse',nl.scrollWidth>nl.clientWidth+2);
}
if(sn&&sni&&!sn.classList.contains('open')){
if(sn.classList.contains('collapse')){sn.classList.remove('collapse');}
sn.classList.toggle('collapse',sni.scrollWidth>sni.clientWidth+2);
}
};
fit();window.addEventListener('resize',fit);window.addEventListener('load',fit);
if(document.fonts&&document.fonts.ready&&document.fonts.ready.then){document.fonts.ready.then(function(){fit();});}
if(sn){
var links=sn.querySelectorAll('a[href^="#"]');
if(links.length&&('IntersectionObserver' in window)){
var targets=[];
Array.prototype.forEach.call(links,function(a){var t=document.getElementById((a.getAttribute('href')||'').slice(1));if(t){targets.push([a,t]);}});
if(targets.length){
var io=new IntersectionObserver(function(es){
es.forEach(function(e){
if(!e.isIntersecting){return;}
targets.forEach(function(p){p[0].classList.toggle('active',p[1]===e.target);});
});
},{rootMargin:'-40% 0px -50% 0px'});
targets.forEach(function(p){io.observe(p[1]);});
}
}
}
})();
/* Connexion unifiée : la nav reflète l’état (visiteur / joueur / MJ) */
(function(){
var nl=document.querySelector('header.nav .nav-links');
if(!nl){return;}
var pj=null,mj=null;
Array.prototype.forEach.call(nl.querySelectorAll('a'),function(a){var href=(a.getAttribute('href')||'').split('#')[0];if(href==='/joueur.html'){pj=a;}else if(href==='/mj.html'){mj=a;}});
if(!pj||!mj){return;}
var sess=null;
try{sess=JSON.parse(localStorage.getItem('pe_session')||'null');}catch(e){sess=null;}
var mjAuth=false;
try{var t=localStorage.getItem('pe-mj-auth');if(t&&t.indexOf('access_token')>=0){var o=JSON.parse(t);var cs=(o&&o.session&&o.session.access_token?o.session:null)||(o&&o.currentSession&&o.currentSession.access_token?o.currentSession:null)||((o&&o.access_token)?o:null);if(cs){var exp=cs.expires_at||0;if(!exp||exp*1000>Date.now()+30000){mjAuth=true;}}}}catch(e){mjAuth=false;}
var role=null,nom='';
if(sess&&sess.token){role='pj';nom=(sess.nom||sess.login||'');}
else if(mjAuth){role='mj';nom='MJ';}
if(!role){
var c=document.createElement('a');c.setAttribute('href','/connexion.html');c.textContent='Connexion';
if(mj.parentNode){mj.parentNode.replaceChild(c,mj);}
if(pj.parentNode){pj.parentNode.removeChild(pj);}
window.dispatchEvent(new Event('resize'));
return;
}
var zone=role==='pj'?pj:mj;
zone.innerHTML='<span class="pe-star"></span> '+(role==='pj'?'Zone joueur':'Zone MJ');
var other=role==='pj'?mj:pj;
var d=document.createElement('a');d.setAttribute('href','#');d.className='pe-deco';d.title=nom+' - D\u00e9connexion';d.setAttribute('aria-label','D\u00e9connexion');d.innerHTML='<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M8 1.5v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M9.2 3.2 14 8 8 14 2 8 6.8 3.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
d.addEventListener('click',function(ev){ev.preventDefault();try{localStorage.removeItem('pe_session');localStorage.removeItem('pe-mj-auth');localStorage.removeItem('pe_mjkey');localStorage.removeItem('pe_mjpass');}catch(e){}location.replace('/connexion.html');});
if(other.parentNode){other.parentNode.removeChild(other);}
if(zone.parentNode){zone.parentNode.appendChild(d);}
window.dispatchEvent(new Event('resize'));
})();
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}
