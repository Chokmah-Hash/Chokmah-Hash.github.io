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
var nl=h.querySelector('.nav-links'),navTg=null;
if(nl&&hasMain()){
navTg=document.createElement('button');
navTg.type='button';navTg.className='nav-toggle';navTg.setAttribute('aria-expanded','false');navTg.setAttribute('aria-label','Menu');
navTg.innerHTML='<span class="tg-label">Menu</span><span class="ic-bars" aria-hidden="true">☰</span><span class="ic-x" aria-hidden="true">✕</span>';
nl.parentNode.insertBefore(navTg,nl);
navTg.addEventListener('click',function(){var open=h.classList.toggle('open');navTg.setAttribute('aria-expanded',open?'true':'false');});
Array.prototype.forEach.call(nl.querySelectorAll('a'),function(a){a.addEventListener('click',function(){h.classList.remove('open');navTg.setAttribute('aria-expanded','false');});});
}
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
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}
