/* L’Archivisterium — service worker : network-first avec repli hors ligne.
   Portée : /archivistereum/ uniquement. La salle s’ouvre même sans connexion
   (le registre des comptes, lui, vit dans le nuage et reste en ligne). */
var CACHE = "archivistereum-v30";