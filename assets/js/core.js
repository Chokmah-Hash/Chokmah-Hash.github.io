/* Les Protocoles Éternels — core.js : lien de nav actif, bouton retour en haut, enregistrement du service worker */
(function(){
function init(){
(function(){var p=location.pathname;document.querySelectorAll('.nav-links a').forEach(function(a){var h=a.getAttribute('href')||'';var n=h.replace(/\.html$/,'');if(n===''||n==='/'){if(p==='/'||p==='/index.html'){a.classList.add('active');}}else if(p===h||p===n||p.indexOf(n)===0){a.classList.add('active');}});})();
(function(){var b=document.getElementById('pe-top');if(!b){return;}window.addEventListener('scroll',function(){if(window.scrollY>300){b.classList.add('show');}else{b.classList.remove('show');}},{passive:true});b.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});})();
}
/* Sous-menu : hauteur de la barre principale (sticky) + lien actif au scroll */
(function(){
var h=document.querySelector('header.nav'),sn=document.querySelector('.subnav');
if(!h||!sn){return;}
var setH=function(){document.documentElement.style.setProperty('--nav-h',h.offsetHeight+'px');};
setH();window.addEventListener('resize',setH);window.addEventListener('load',setH);
var links=sn.querySelectorAll('a[href^="#"]');
if(!links.length||!('IntersectionObserver' in window)){return;}
var targets=[];
links.forEach(function(a){var t=document.getElementById((a.getAttribute('href')||'').slice(1));if(t){targets.push([a,t]);}});
if(!targets.length){return;}
var io=new IntersectionObserver(function(es){
es.forEach(function(e){
if(!e.isIntersecting){return;}
targets.forEach(function(p){p[0].classList.toggle('active',p[1]===e.target);});
});
},{rootMargin:'-40% 0px -50% 0px'});
targets.forEach(function(p){io.observe(p[1]);});
})();
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});}
