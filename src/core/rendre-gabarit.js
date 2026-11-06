/* Le gabarit de journal : le pack donne un TEXTE à trous « {champ} », jamais
   du code — l'écran qui connaît le perso calcule les valeurs. */
function rendreGabarit(gabarit, vals) {
  return String(gabarit).replace(/\{(\w+)\}/g, (m, k) => (vals && vals[k] !== undefined ? vals[k] : m));
}

/* §SECTION:MOTEUR§ — LE MOTEUR DU LIVRE GRAVÉ (Stormbringer 2ᵉ éd.).
   REGLES_SB : une fonction pure par règle des chapitres 2-8, copie
   mécanique de regles/regles-sb.js de la crypte (sources jumelles —
   tout écart doit être reflété des deux côtés). Les données ne vivent
   PAS ici : le livre gravé (packs/livre-sb-v2.json, v7.0) est fetché
   par chargerLivre à l'entrée d'un pack qui déclare « livre », puis
   injecté via charger(). Adaptations app : le require node est retiré
   (DONNEES = null au boot), l'export module devient window.REGLES_SB.
   V0.63 : invisible — aucun panneau ne l'utilise encore. */
/* ═══════════════════════════════════════════════════════════════════════
   REGLES-SB — LES FONCTIONS DU LIVRE GRAVÉ (Stormbringer 2ᵉ éd., §2-§8)
   ─────────────────────────────────────────────────────────────────────
   Une fonction pure par règle du chapitres 2 (Création du personnage), 3 (Déplacements, combats et dommages) 4 (Compétences), 5 (Sorcellerie), 6 (Cultes et prêtres), 7 (Santé mentale) et 8 (Animaux, créatures et monstres),
   tirée de regles/livre-sb.json (les données) et testée par
   test-regles-sb.js contre les exemples DU LIVRE (Merak Gren §2.6, Minakh Meen §2.3.7.1, les points de vie §2.1.8,
   les parades de Merak §3.3.3, les ripostes d'Elric §3.3.7, la table des armes §3.5.2,
   les blessures §3.9, l'exemple naval §3.11, Lucria §4.1-4.9, Tristelune §4.9.4,
   la liste des compétences §4.11, Goor-Rai-Huuz §5.2.1.2, Elric §5.6.1, Zanat Sarka §5.6, Xonat §5.4, Marlen Malkor §5.7.1.5, la table de résistance §5.7, Donblas §5.11.1.2, Vadin-gor §6.5, les Vertus et Champions de la Loi §6.7.4-6.7.5, Tarz §7.4, le gorille §8.2.1 et Bellbane §8.3.6).

   Convention : les fonctions de CALCUL sont pures (résultats de dés
   passés en paramètre) ; les fonctions de TIRAGE acceptent une
   fonction r(expr) qui lance « 1D6 », « 2D4 »… (par défaut Math.random).
   Les bonus de famille utilisent les MÊMES formules que le moteur du
   launcher V0.62 (bonusFamilles de VueNoyauD100) — sources jumelles.
   ─────────────────────────────────────────────────────────────────────
   Usage node   : const REGLES = require("./regles-sb.js")
   Usage app    : injecter les données puis appeler (module embarquable)
   ═══════════════════════════════════════════════════════════════════════ */

let DONNEES = null;

