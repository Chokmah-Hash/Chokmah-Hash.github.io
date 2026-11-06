/* §PACKS_CHARGES§ — en page construite, le chargeur de packs (forge) fetch
   packs/*.json AVANT le boot et pose window.LARCHIVISTE_PACKS ; chargerPack
   relit la fenêtre à CHAQUE appel (le boot n'arrive qu'une fois les packs
   chargés). En canvas, la fenêtre n'a rien posé → les données inline font foi. */
const PACKS_CHARGES = (typeof window !== "undefined" && window.LARCHIVISTE_PACKS) || null;

/* §DEBUT:PACKS_DATA§ */
/* Les DONNÉES pures des packs et des noyaux : la forge extrait ce bloc vers
   packs/<id>.json + packs/noyau-<id>.json et le remplace par des stubs dans
   la page construite ; en canvas, ce bloc EST la vérité. */

