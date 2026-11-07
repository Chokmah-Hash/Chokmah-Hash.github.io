/* L'Archiviste — service worker : network-first avec repli hors ligne.
   L'app s'ouvre même sans connexion (le nuage des comptes reste en ligne, lui). */
var CACHE = "archiviste-a0-v105";
var PRECACHE = [
  "/",
  "/index.html",
  "/app.css",
  "/react.production.min.js",
  "/react-dom.production.min.js",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-192-maskable.png",
  "/icons/icon-512-maskable.png",
  "/packs/noyau-40k.json",
  "/packs/noyau-d100.json",
  "/packs/GM-0001.json",
  "/packs/GM-0002.json",
  "/packs/GM-0003.json",
  "/packs/livre-sb-v2.json"
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
        if (req.mode === "navigate") return caches.match("/");
        return new Response("Hors ligne", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      });
    })
  );
});
