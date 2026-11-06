/* ══════════ LA PARTIE : l'écran d'aventure partagée ══════════
   Générique — c'est le MOTEUR qui parle ici, pas le pack : le même
   écran ouvrira, rejoindra et lancera TOUTE aventure multijoueur.
   Trois moments : ouvrir/rejoindre (le lobby), la salle d'attente
   (le code, les joueurs, le lancement), puis l'entrée dans le pack —
   qui se fait SEULE, poussée par la Tombe quand le MJ lance. */
/* ══════════ V48 — LE REGISTRE DES PERSONNAGES : la ligne de résumé ══════════
   Un personnage du registre tient dans une ligne, quelle que soit sa forme :
   l'unité 40k parle châssis et code, l'aventurier d100 parle caracs,
   les autres formes parlent leur origine. Générique par forme. */
const resumePerso = (p) => {
  if (!p) return "";
  if (p.chassis) return p.chassis + " · code " + p.code;
  if (p.caracs) return Object.keys(p.caracs).map(k => k + " " + p.caracs[k]).join(" · ");
  return p.origine || p.peuple || "";
};

