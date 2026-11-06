   la validation d'une étape verrouille la précédente, jamais de retour
   arrière. Les dés parlent : nationalité au 1D100 (le Chaos décide),
   relance de pitié seulement si le total des caracs ≤ 52. La corpulence
   (§2.1.3.2) et l'histoire personnelle (§2.9) vivent HORS rituel, en
   liberté sur la fiche. */
function lancerDes(spec) {
  /* "3D6" ou "1D10" → la somme des dés ; null si la spec n'est pas un jet */
  const m = /^(\d+)D(\d+)$/.exec(String(spec).trim());
  if (!m) return null;
  let s = 0;
  for (let i = 0; i < parseInt(m[1], 10); i++) s += 1 + Math.floor(Math.random() * parseInt(m[2], 10));
  return s;
}
function bornePlage(plage) {
  /* "01-02" → [1,2] ; "100" → [100,100] ; "51+" → [51,Infinity] */
  const m = /^(\d+)(?:-(\d+))?\+?$/.exec(String(plage).trim());
  if (!m) return [0, 0];
  const a = parseInt(m[1], 10);
  return [a, m[2] ? parseInt(m[2], 10) : a];
}
function trouverNation(jet, liste) {
  for (const n of liste || []) {
    const [a, b] = bornePlage(n.plage);
    if (jet >= a && jet <= b) return n;
  }
  return null;
}
function appliquerAjustements(caracs, ajustements, sexe) {
  /* §2.2 : chaque nationalité ajuste les dés de naissance — un dé qui
     s'ajoute (des), une valeur qui se fixe (fixe), parfois seulement
     pour une femme (siSexe). Retourne les caracs finies et la trace
     avant/après pour l'affichage. */
  const sortis = { ...caracs };
  const trace = [];
  for (const adj of ajustements || []) {
    if (adj.siSexe && adj.siSexe !== String(sexe || "").toLowerCase()) continue;
    const avant = sortis[adj.c];
    if (adj.fixe != null) sortis[adj.c] = adj.fixe;
    else if (adj.des) sortis[adj.c] = (sortis[adj.c] || 0) + (lancerDes(adj.des) || 0);
    trace.push({ c: adj.c, avant, apres: sortis[adj.c] });
  }
  return { caracs: sortis, trace };
}
function pvDepuis(caracs) {
  /* §2.1.8 : CON + 1 par point de TAI au-dessus de 12, −1 par point en
     dessous de 9 — jamais sous la moitié de la CON (l'exemple du livre :
     CON 14 TAI 17 → 19 ; CON 4 TAI 3 → 2). */
  const con = caracs.CON || 0, tai = caracs.TAI || 0;
  const brut = con + (tai > 12 ? tai - 12 : 0) - (tai < 9 ? 9 - tai : 0);
  return Math.max(brut, Math.floor(con / 2));
}
function sanDepuis(pou, modif) {
  /* §2.1.9 : SAN = 5 × POU + modificateur de nationalité (Merak : POU 12
     sans modificateur → 60). */
  return (pou || 0) * 5 + (modif || 0);
}
function bonusDommagesDe(forV, tai) {
  /* §2.5.3 : FOR + TAI sur la table — l'exemple du livre (FOR 14 TAI 17)
     tombe en 25-40 → +1D6. */
  const s = (forV || 0) + (tai || 0);
  if (s <= 16) return "−1D6";
  if (s <= 24) return "";
  if (s <= 40) return "+1D6";
  if (s <= 50) return "+2D6";
  return "+3D6";
}
function modulationAge(age, physique) {
  /* §2.3 : moins de 25 ans → −5 % par année retranchée à CHAQUE
     compétence ; 25 à 40 → +1 % par année au-delà de 25 (max +15) ;
     après 40 → le livre dit « les mentales restent » : elles gardent
     le plafond adulte, et les physiques reculent de 1 % par année
     DEPUIS ce plafond (pas de saut à zéro à 41 ans). */
  if (age < 25) return -5 * (25 - age);
  const adulte = Math.min(15, age - 25);
  if (age <= 40) return adulte;
  return physique ? adulte - (age - 40) : adulte;
}
function trouverClasseSociale(jet, table) {
  for (const r of table || []) {
    const [a, b] = bornePlage(r.plage);
    if (jet >= a && jet <= b) return r;
  }
  return null;
}

