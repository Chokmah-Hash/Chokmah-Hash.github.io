function resoudreTest(cible, mod = 0, noyau = NOYAU) {
  const de = d6();
  const nat6 = de === noyau.tests.exceptions.reussite_auto;
  const nat1 = de === noyau.tests.exceptions.echec_auto;
  const reussi = nat6 ? true : nat1 ? false : de + mod >= cibleNum(cible);
  return { de, reussi, nat: nat6 ? "6 naturel — réussite auto" : nat1 ? "1 naturel — échec auto" : null };
}

