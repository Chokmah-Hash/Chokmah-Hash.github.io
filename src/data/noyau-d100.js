/* ══════════ Le noyau-d100 : primitive commune Stormbringer / Bloodlust ══════════
   Même principe que le noyau-40k : le launcher lit de la donnée. Le noyau
   fournit resoudreD100(seuil %, modificateur) + les garde-fous communs
   (plancher 5 % de réussite, « 00 » échec automatique) ; les critiques et les
   tests spéciaux (lutte de POU, paliers de Bloodlust) vivent en surcharge
   de chaque pack — le manifeste v1.2 en action. */
const NOYAU_D100 = {
  id: "noyau-d100", version: "0.1.0",
  tests: {
    de: { nb: 1, faces: 100 }, lecture: "inferieur_ou_egal",
    exceptions: { plancher_reussite: 5, echec_auto: 100 }
  }
};

