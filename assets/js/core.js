/* Les Protocoles Éternels — core.js : lien de nav actif, bouton retour en haut, enregistrement du service worker */
(function(){
function init(){
(function(){var p=location.pathname;document.querySelectorAll('.nav-links a').forEach(function(a){var h=a.getAttribute('href')||'';var n=h.replace(/\.html$/,'');if(n===''||n==='/'){if(p==='/'||p==='/index.html'){a.classList.add('active');}}else if(p===h||p===n||p.indexOf(n)===0){a.classList.add('active');}});})();
(function(){var b=document.getElementById('pe-top');if(!b){return;}window.addEventListener('scroll',function(){if(window.scrollY>300){b.classList.add('show');}else{b.classList.remove('show');}},{passive:true});b.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});})();
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});}
