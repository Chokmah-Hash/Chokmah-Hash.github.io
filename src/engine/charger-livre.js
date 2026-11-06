   session) et résout les données — ou null si le livre est introuvable
   (le pack reste jouable sans sa mécanique de livre). */
const LIVRES = { "sb-v2": { fichier: "packs/livre-sb-v2.json" } };
const LIVRES_CHARGES = {};
function chargerLivre(idLivre) {
  if (LIVRES_CHARGES[idLivre]) return LIVRES_CHARGES[idLivre];
  const def = LIVRES[idLivre];
  if (!def) return Promise.resolve(null);
  LIVRES_CHARGES[idLivre] = fetch(def.fichier, { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (d && typeof REGLES_SB !== "undefined" && REGLES_SB.charger) REGLES_SB.charger(d);
      return d;
    })
    .catch(function () { return null; });
  return LIVRES_CHARGES[idLivre];
}

