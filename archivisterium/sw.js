/* L'Archivisterium — service worker : network-first avec repli hors ligne.
   Portée : /archivisterium/ uniquement. La salle s'ouvre même sans connexion
   (le registre des comptes, lui, vit dans le nuage et reste en ligne). */
var CACHE = "archivisterium-v4";
var PRECACHE = [
  "/archivisterium/",
  "/archivisterium/index.html",
      "/archivisterium/app.css",
  "/react.production.min.js",
  "/react-dom.production.min.js",
  "/archivisterium/manifest.webmanifest",
  "/archivisterium/favicon.svg",
  "/archivisterium/icons/icon-192.png",
  "/archivisterium/icons/icon-512.png",
  "/archivisterium/icons/icon-192-maskable.png",
  "/archivisterium/icons/icon-512-maskable.png",
  "/archivisterium/icons/apple-touch-icon.png"
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
        if (req.mode === "navigate") return caches.match("/archivisterium/");
        return new Response("Hors ligne", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      });
    })
  );
});
