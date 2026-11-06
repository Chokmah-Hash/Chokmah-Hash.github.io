/* Le chargeur universel : manifeste → dépendance résolue → noyau + contenu.
   Règle d'or du manifeste : un mod dont une référence ne résout pas est
   refusé avec un message clair — jamais de crash mystérieux.
   Trajectoire pragmatique : les packs peuvent venir de FICHIERS
   (window.LARCHIVISTE_PACKS, posés par le chargeur de la page construite
   avant le boot) — on relit la fenêtre à CHAQUE appel, le repli INLINE
   (canvas) reste la même source de vérité côté simulation. */
function chargerPack(manifeste) {
  const dep = manifeste.depend_de[0];
  const fichiers = (typeof window !== "undefined" && window.LARCHIVISTE_PACKS) || PACKS_CHARGES || {};
  return {
    ...manifeste,
    noyau: dep ? ((fichiers.noyaux && fichiers.noyaux[dep.id]) || NOYAUX[dep.id] || null) : null,
    contenu: (fichiers.packs && fichiers.packs[manifeste.id]) || CONTENU[manifeste.id] || null
  };
}

