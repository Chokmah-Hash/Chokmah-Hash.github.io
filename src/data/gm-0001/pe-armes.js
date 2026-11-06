/* ── PÉ : l'arsenal NEUTRE du manuel (pe-equipement.js, PE_BUILD 2026.10.23) —
   l'arme porte TOUT (manifeste § 3.5) : A, F, PA, D ; « A »/« F+1 » se
   résolvent contre les stats de l'unité. Toutes les armes T1-T4. ── */
const PE_ARMES = [
  { id: "fusil", nom: "Fusil magnétique", taille: 2, portee: "48 m", att: "1", f: "5", pa: "−1", d: "1", regle: "Perforation", tir: true },
  { id: "canonmag", nom: "Canon magnétique", taille: 3, portee: "48 m", att: "1", f: "6", pa: "−1", d: "1", regle: "Perforation", tir: true },
  { id: "mitrailleur", nom: "Mitrailleur magnétique", taille: 3, portee: "36 m", att: "2", f: "6", pa: "−2", d: "1", regle: "Perforation", tir: true },
  { id: "longuee", nom: "Canon longue-portée", taille: 4, portee: "72 m", att: "1", f: "7", pa: "−2", d: "2", regle: "Précis : ignore le couvert", tir: true },
  { id: "carabine", nom: "Carabine à arcs", taille: 2, portee: "28 m", att: "2", f: "5", pa: "−1", d: "1", regle: "Arc : critique = 1 dégât irréversible en plus", tir: true },
  { id: "batonnrj", nom: "Bâton d'énergie", taille: 1, portee: "24 m", att: "1", f: "5", pa: "−2", d: "2", regle: "Aussi utilisable en mêlée", tir: true },
  { id: "sceptretac", nom: "Sceptre tactique", taille: 2, portee: "18 m", att: "1", f: "6", pa: "−1", d: "2", regle: "Relance 1 au toucher, 1×/bataille", tir: true },
  { id: "pistolets", nom: "Pistolets jumelés ×6", taille: 1, portee: "12 m", att: "3", f: "5", pa: "−2", d: "1", regle: "Tir défensif sur un ennemi qui approche", tir: true },
  { id: "batonmel", nom: "Bâton d'énergie (mêlée)", taille: 1, portee: "Mêlée", att: "A", f: "F+1", pa: "−2", d: "2", regle: "—", tir: false },
  { id: "lame", nom: "Lame désagrégatrice", taille: 1, portee: "Mêlée", att: "A", f: "F+1", pa: "−3", d: "2", regle: "—", tir: false },
  { id: "jumelles", nom: "Lames jumelles (paire)", taille: 1, portee: "Mêlée", att: "A+1", f: "F+1", pa: "−2", d: "2", regle: "+1 A si deux lames", tir: false },
  { id: "faucheuse", nom: "Faucheuse lourde", taille: 3, portee: "Mêlée", att: "A", f: "F+2", pa: "−4", d: "D3", regle: "Lourde : −1 à l'initiative", tir: false },
  { id: "grappins", nom: "Grappins déchiqueteurs", taille: 2, portee: "Mêlée", att: "A+1", f: "F+1", pa: "−2", d: "1", regle: "Terreur : Cd −1 en face", tir: false },
  { id: "sceptreduel", nom: "Sceptre de duel", taille: 2, portee: "Mêlée", att: "A", f: "F+2", pa: "−3", d: "2", regle: "Critique sur 5+ en duel", tir: false }
];

