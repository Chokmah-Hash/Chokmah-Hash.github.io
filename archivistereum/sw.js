/* L'Archivisterium — service worker : network-first avec repli hors ligne.
   Portée : /archivistereum/ uniquement. La salle s'ouvre même sans connexion
   (le registre des comptes, lui, vit dans le nuage et reste en ligne). */
var CACHE = "archivistereum-v12";
var PRECACHE = [
  "/archivistereum/",
  "/archivistereum/index.html",
      "/archivistereum/app.css",
  "/archivistereum/react.production.min.js",
  "/archivistereum/react-dom.production.min.js",
  "/archivistereum/manifest.webmanifest",
  "/archivistereum/favicon.svg",
  "/archivistereum/icons/icon-192.png",
  "/archivistereum/icons/icon-512.png",
  "/archivistereum/icons/icon-192-maskable.png",
  "/archivistereum/icons/icon-512-maskable.png",
  "/archivistereum/icons/apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(PRECACHE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) { return Promise.all(ks.map(function (k) { return k === CACHE ? null : caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) {
    /* Les CDN (React, Babel, Tailwind, polices) : cache network-first pour le hors-ligne.
       L'API Supabase : JAMAIS mise en cache (données vivantes des comptes). */
    var cachable = url.origin === "https://unpkg.com" ||
      url.origin === "https://cdn.tailwindcss.com" ||
      url.origin === "https://fonts.googleapis.com" ||
      url.origin === "https://fonts.gstatic.com";
    if (!cachable) return;
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var copie = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copie); });
        }
        return res;
      }).catch(function () { return caches.match(req); })
    );
    return;
  }
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) {
        var copie = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copie); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (r) {
        if (r) return r;
        if (req.mode === "navigate") return caches.match("/archivistereum/");
        return new Response("Hors ligne", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      });
    })
  );
});
