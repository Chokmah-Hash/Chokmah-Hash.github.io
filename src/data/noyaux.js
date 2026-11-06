   exotiques : 4 jets max (règles pour une arme de PJ à 100 points). */
const BL_TABLES = [
  { id: "principaux", nom: "Pouvoirs principaux", court: "principal", max: null, prestige: 2, table: T_PRINCIPAUX },
  { id: "secondaires", nom: "Pouvoirs secondaires", court: "secondaire", max: null, prestige: 1, table: T_SECONDAIRES },
  { id: "exotiques", nom: "Pouvoirs exotiques", court: "exotique", max: 4, prestige: 5, table: T_EXOTIQUES },
  { id: "limitations", nom: "Limitations", court: "limitation", max: 2, prestige: 0, table: T_LIMITATIONS }
];
const PALIERS_BL = [
  { label: "Très facile", mod: 50 }, { label: "Facile", mod: 25 },
  { label: "Moyen", mod: 0 }, { label: "Difficile", mod: -25 },
  { label: "Très difficile", mod: -50 }
];
/* ════════ LE SAC DE DONNÉES DE CHAQUE PACK — consolidation du Core ════════
   Contrat (manifeste v1.3) : un pack = des DONNÉES autonomes, jamais du code.
   Chaque entrée de CONTENU assemble les « fichiers » du pack (fiche, arsenal,
   tables, recettes, documents) ; le noyau commandé par depend_de est résolu
   par chargerPack. Les vues du Core ne lisent QUE pack.contenu / pack.noyau :
   plus une seule constante de pack n'est référencée dans le moteur ou les vues.
   Tout ci-dessous est de la DONNÉE pure (JSON-extractible) : les lignes de
   journal sont des gabarits à trous « {champ} » rendus par rendreGabarit,
   les dérivées déclarent source × multiplicateur — jamais du code. */
const NOYAUX = {
  "noyau-40k": NOYAU,
  "noyau-d100": NOYAU_D100
};

