/* ── Le noyau-40k (extraits embarqués pour l'alpha) ── */
const NOYAU = {
  id: "noyau-40k", version: "0.1.0",
  tests: {
    de: { nb: 1, faces: 6 }, lecture: "superieur_ou_egal",
    exceptions: { reussite_auto: 6, echec_auto: 1 }, modificateur_marge: 1
  },
  conversions: { pouce_metres: 2, pv_par_blessure: 3 },
  combat: { sequence: ["toucher", "blesser", "sauvegarde", "degats"] }
};

