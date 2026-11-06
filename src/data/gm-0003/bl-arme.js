   du chapitre V (livre p. 88-100, PDF p. 89-101, OCR du 29/10/2026).
   Les cinq tables d% de création d'arme sont intégrales ci-dessous : c'est de
   la DONNÉE de pack (manifeste v1.2), la source de vérité pour la forge. */
const BL_PORTEUR = {
  id: "urkhar", nom: "Urkhar", peuple: "Piorad · troupes de guerre",
  caracs: { FO: 14, EN: 12, Ag: 8, RA: 8, PE: 10, VO: 12 }, /* table raciale p. 82 */
  desirs: { "Prestige": 7, "Richesse": 7, "Sexe": 7, "Violence": 7, "Réputation": 7 }, /* Piorads, table p. 88 — un PJ ajuste de ±1 à ±2 par désir */
  competences: { "Att. brutale (FO)": 20, "Att. normale (Ag)": 15, "Att. rapide (RA)": 5, "Feinte (PE)": 5, "Parade (RA)": 20, "Esquive (RA)": 10, "Tir (PE)": 5 } /* % de base p. 87 — un PJ y répartit +40 % (combat) et +80 % (secondaires), multiples de 5, plancher 5 % */
};
const BL_ARME = { nom: "Oraghrh", nature: "longue épée vivante", typeArme: "épée longue", base: 20, budget: 100 }; /* épée longue = 20 pts de base (livre p. 95) */

