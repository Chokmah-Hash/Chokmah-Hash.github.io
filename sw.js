/* Les Protocoles Éternels — service worker : stratégie network-first avec repli hors ligne */
var CACHE='pe-v2026-10-22-mot14f';
var PRECACHE=[
 '/', '/index.html', '/regles.html', '/console.html', '/fiches.html', '/bestiaire.html', '/galaxie.html', '/joueur.html', '/mj.html', '/espace-mj/moteur.html', '/404.html',
 '/assets/css/tokens.css', '/assets/css/main.css', '/assets/js/core.js', '/assets/js/vendor/supabase.js',
 '/assets/js/pages/fiches.js', '/assets/js/pages/bestiaire.js', '/assets/js/pages/galaxie.js', '/assets/js/pages/joueur.js', '/assets/js/pages/console.js', '/assets/js/pages/mj.js', '/assets/js/pages/mj-carte.js', '/assets/js/pages/mj-bestiaire.js', '/assets/js/pages/des.js', '/assets/js/pages/auth.js', '/assets/js/pages/images.js', '/assets/js/pages/mj-comptes.js', '/assets/js/pages/moteur.jsx', '/assets/js/moteur-planetaire.js', '/assets/js/moteur-planetaire-rotation.js', '/assets/js/pe-equipement.js',
 '/favicon.svg', '/icons/icon-192.png', '/icons/apple-touch-icon.png', '/manifest.webmanifest'
];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(PRECACHE);}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return k===CACHE?null:caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){
 var req=e.request;
 if(req.method!=='GET'){return;}
 var url=new URL(req.url);
 if(url.origin!==location.origin){
  var cachable=(url.origin==='https://cdn.jsdelivr.net')||(url.origin==='https://cdn.tailwindcss.com')||(url.origin==='https://dnbnkdakmobufqcrqzpq.supabase.co'&&url.pathname.indexOf('/storage/v1/object/public/')===0);
  if(!cachable){return;}
  e.respondWith(
   fetch(req).then(function(res){
    if(res&&res.ok){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy);});}
    return res;
   }).catch(function(){
    return caches.match(req);
   })
  );
  return;
 }
 e.respondWith(
  fetch(req).then(function(res){
    if(res&&res.ok){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy);});}
    return res;
  }).catch(function(){
    return caches.match(req,{ignoreSearch:true}).then(function(r){
    if(r){return r;}
    if(req.mode==='navigate'){return caches.match('/');}
    return new Response('Hors ligne',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
   });
  })
 );
});
/* deploiement v2.3 */
