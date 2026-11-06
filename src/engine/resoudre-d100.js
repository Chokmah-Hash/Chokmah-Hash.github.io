/* La primitive d100 — seuil %, garde-fous du noyau, critiques par règles du pack */
function resoudreD100(seuil, mod = 0, regles = "brp", noyau = NOYAU_D100) {
  const sFinal = Math.max(noyau.tests.exceptions.plancher_reussite, seuil + mod);
  const de = d100();
  const autoEchec = de === noyau.tests.exceptions.echec_auto;
  const reussi = !autoEchec && de <= sFinal;
  let nat = null;
  if (autoEchec) nat = "« 00 » — échec automatique (garde-fou du noyau)";
  else if (regles === "brp") { if (de === 1) nat = "« 01 » — réussite critique"; }
  else {
    if (reussi && de % 10 === 0) nat = "réussite critique — unités 0";
    if (!reussi && de % 10 === 1) nat = "échec critique — unités 1";
  }
  return { de, sFinal, reussi, nat };
}

