/* §SECTION:APP§ — le hub, le chargement du pack, le pack */
/* ══════════ L'app : le hub, le chargement du pack, le pack ══════════ */
/* ════════ Le registre des vues — routage PAR DÉPENDANCE ════════
   Le launcher choisit la vue du pack lancé selon le NOYAU qu'il commande,
   jamais selon son id : un futur pack d100 s'affichera dans VueNoyauD100 sans
   toucher une ligne du Core. Noyau ou sac introuvable → refus clair, pas de
   crash mystérieux (règle d'or du manifeste). */
const VUES = {
  "noyau-40k": VueNoyau40k,
  "noyau-d100": VueNoyauD100
};

