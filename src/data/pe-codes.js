   PE_BUILD 2026.10.24 — noms NEUTRES, les joueurs ne sauront jamais qu'ils
   sont Nécrons). PV déjà convertis (W×3), Rfx maison, Mémoire/Calcul pour
   les protocoles, aptitude de châssis, compétences offertes. ── */
const PE_CHASSIS = [
  { n: "Fantassin programmé", m: "10", cc: "4+", ct: "4+", f: "4", e: "4", pv: "3", a: "1", cd: "7+", sv: "4+", rfx: "+0", mem: "1", cal: "1", apt: "Discipline sans faille : relancez 1 test de Commandement raté par scène.", cp: ["Athlétisme", "Technologie"] },
  { n: "Vétéran", m: "10", cc: "3+", ct: "3+", f: "5", e: "5", pv: "3", a: "1", cd: "8+", sv: "3+", rfx: "+1", mem: "1", cal: "1", apt: "Élite : vos touches critiques infligent +1 dégât.", cp: ["Athlétisme", "Perception"] },
  { n: "Traqueur", m: "10", cc: "3+", ct: "3+", f: "5", e: "5", pv: "3", a: "1", cd: "8+", sv: "3+", rfx: "+2", mem: "2", cal: "1", apt: "Embuscade : 1×/scène, apparaissez dans un rayon de 6 m (après 1 round de délai).", cp: ["Furtivité", "Perception", "Pilotage"] },
  { n: "Ombre", m: "10", cc: "3+", ct: "6+", f: "5", e: "4", pv: "3", a: "3", cd: "8+", sv: "4+", rfx: "+2", mem: "2", cal: "1", apt: "Peau d'ombre : Furtivité 3+ ; ennemis qui vous voient −1 Cd.", cp: ["Furtivité", "Intimidation"] },
  { n: "Sentinelle", m: "10", cc: "3+", ct: "4+", f: "6", e: "5", pv: "6", a: "2", cd: "8+", sv: "3+", rfx: "+1", mem: "1", cal: "1", apt: "Écran : 1×/round, prenez une frappe destinée à un allié à 2 m.", cp: ["Athlétisme", "Intimidation"] },
  { n: "Officier de garde", m: "10", cc: "3+", ct: "3+", f: "5", e: "5", pv: "12", a: "3", cd: "8+", sv: "3+", rfx: "+1", mem: "2", cal: "2", apt: "Ordre de secours : 1×/scène, forcez un allié à relancer son Protocole de Secours.", cp: ["Commandement", "Technologie"] },
  { n: "Artificier", m: "10", cc: "3+", ct: "3+", f: "4", e: "5", pv: "12", a: "2", cd: "8+", sv: "4+", rfx: "+1", mem: "3", cal: "2", apt: "Essaim réparateur : 1×/scène, soignez D3 PV d'une unité à 6 m.", cp: ["Technologie", "Érudition", "Perception"] },
  { n: "Énergicien", m: "10", cc: "3+", ct: "3+", f: "5", e: "5", pv: "12", a: "3", cd: "8+", sv: "3+", rfx: "+1", mem: "3", cal: "2", apt: "Décharge : 1×/scène, attaque F7 PA −2 D 2 à tous les ennemis à 3 m.", cp: ["Technologie", "Érudition"] },
  { n: "Commandant", m: "10", cc: "3+", ct: "3+", f: "6", e: "6", pv: "15", a: "4", cd: "9+", sv: "3+", rfx: "+1", mem: "4", cal: "2", apt: "Aura de commandement : les alliés à 6 m relancent les 1 au toucher.", cp: ["Commandement", "Intimidation", "Érudition"] },
  { n: "Seigneur de guerre", m: "10", cc: "2+", ct: "2+", f: "6", e: "6", pv: "18", a: "5", cd: "10+", sv: "3+", rfx: "+1", mem: "5", cal: "3", apt: "Volonté inflexible : relancez 1 échec par round.", cp: ["Commandement", "Érudition", "Intimidation", "Technologie"] }
];
const PE_CODES = ["Éternel", "Pragmatique", "Sanguinaire", "Solaire", "Tutélaire", "Fondateur"];

