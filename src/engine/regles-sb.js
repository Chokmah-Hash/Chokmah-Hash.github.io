const REGLES_SB = {
  version: "7.0",
  charger(donnees) { DONNEES = donnees; return REGLES_SB; },

  /* — Le dé du livre : « 3D6 », « 1D10 », « 2D4 »… — */
  lancer(expr, r) {
    const jet = (typeof r === "function") ? r : (n, f) => 1 + Math.floor(Math.random() * f);
    const m = /^(\d*)D(\d+)$/.exec(String(expr).trim().toUpperCase());
    if (!m) throw new Error("expression de dé inconnue : " + expr);
    const nb = m[1] ? Number(m[1]) : 1, faces = Number(m[2]);
    let s = 0; for (let i = 0; i < nb; i++) s += jet(nb, faces);
    return s;
  },

  /* ════════ §2.1 CARACTÉRISTIQUES ════════ */

  /* 3D6 pour chacune des 7 ; total ≤ 52 → relance autorisée */
  tirerCaracteristiques(r) {
    const caracs = {};
    for (const k of DONNEES.caracteristiques.liste) caracs[k] = REGLES_SB.lancer("3D6", r);
    const total = Object.values(caracs).reduce((a, b) => a + b, 0);
    return { caracs, total, relanceAutorisee: total <= 52 };
  },

  /* §2.1.8 — PV = CON ± TAI ; plancher = moitié de la CON */
  pointsDeVie(con, tai) {
    const brut = con + (tai > 12 ? tai - 12 : tai < 9 ? tai - 9 : 0);
    return Math.max(brut, Math.floor(con / 2));
  },
  blessureMajeure(pv) { return Math.ceil(pv / 2); },

  /* §2.1.9 — SAN = 5×POU (+ mod. nationalité) ; SFT = SAN/2, immuable */
  santeMentale(pou, modNationalite) {
    const san = 5 * pou + (modNationalite || 0);
    return { san, sft: Math.floor(san / 2) };
  },
  folieTemporaire(pertes, sft, rounds) {
    return { fou: pertes >= sft && rounds <= 50 };
  },

  /* §2.1.3.1 — Tailles humaines */
  tailleHumaine(tai) {
    const l = DONNEES.taillesHumaines.lignes.find(x => x[0] === tai);
    if (!l) return null;
    return { tai: l[0], hauteurCm: l[1], poidsKgLeger: l[2], poidsKgMoyen: l[3], poidsKgLourd: l[4] };
  },

  /* ════════ §2.2 NATIONALITÉS ════════ */

  nationaliteParJet(jet100) {
    const n = DONNEES.nationalites.liste.find(x => {
      const [a, b] = x.plage.split("-").map(Number);
      return jet100 >= a && jet100 <= (b || a);
    });
    return n || null;
  },
  nationaliteParId(id) { return DONNEES.nationalites.liste.find(n => n.id === id) || null; },

  /* Applique les ajustements d'une nationalité aux caracs.
     r = fonction de tirage ; opts = { sexe } (Myrrhyn : CHA femme). */
  appliquerNationalite(caracs, nation, r, opts) {
    const c = Object.assign({}, caracs);
    for (const a of nation.ajustements || []) {
      if (a.siSexe && (!opts || opts.sexe !== a.siSexe)) continue;
      if (a.si && !(c[a.c] >= Number(a.si.replace(">=", "")))) continue;
      const v = a.des ? REGLES_SB.lancer(a.des, r) : a.fixe;
      c[a.c] = c[a.c] + (a.signe === -1 ? -v : v);
    }
    return { caracs: c, sanMod: nation.san || 0 };
  },
  isSorcier(caracs) { return caracs.INT + caracs.POU >= 32; },

  /* ════════ §2.3 CLASSES ET ORIGINE SOCIALE ════════ */

  origineSociale(jet100, jet10) {
    const e = DONNEES.origineSociale.table.find(x => {
      const [a, b] = x.plage.split("-").map(Number);
      return jet100 >= a && jet100 <= (b || a);
    });
    if (!e) return null;
    const res = { classe: e.classe, special: null, modCompetences: 0 };
    if (e.classe === "Guerrier" && jet10 >= 9) res.special = "Assassin";
    if (e.classe === "Marchand") res.special = jet10 >= 8 ? "Négociant" : "Commerçant";
    if (e.classe === "Marin" && jet10 === 9) { res.special = "Second"; res.modCompetences = 5; }
    if (e.classe === "Marin" && jet10 === 10) { res.special = "Capitaine"; res.modCompetences = 10; }
    return res;
  },

  /* §2.3 — l'âge plie les compétences */
  ajustementAge(age) {
    if (age < 25) return { type: "jeune", parAn: -5, max: null };
    if (age <= 40) return { type: "adulte", parAn: Math.min(age - 25, 15), max: 15 };
    return { type: "vieux", parAn: -(age - 40), physiqueSeulement: true, max: null };
  },

  /* Les compétences d'une classe, calculées avec les bonus de famille.
     opts = { modCompetences (Second/Capitaine), de100 (bases 1D100), de6 (Équitation guerrier 60%) }.
     Les armes « attaque_parade » rendent Attaque ET Parade séparément. */
  competencesClasse(idClasse, bonus, opts) {
    const cl = DONNEES.classes.liste[idClasse];
    if (!cl) throw new Error("classe inconnue : " + idClasse);
    const o = opts || {};
    const lignes = [];
    const sources = idClasse === "assassin"
      ? DONNEES.classes.liste.assassin.competences.concat(DONNEES.classes.liste.guerrier.competences)
      : cl.competences;
    for (const s of sources) {
      const b = s.bonus === "attaque_parade" ? null : (bonus[s.bonus] || 0);
      const base = typeof s.base === "number" ? s.base
        : (s.base === "1D100" ? (o.de100 != null ? o.de100 : REGLES_SB.lancer("1D100"))
          : s.base);
      if (s.bonus === "attaque_parade") {
        lignes.push({ nom: s.nom, type: "arme", base, attaque: base + bonus.attaque + (o.modCompetences || 0), parade: base + bonus.parade + (o.modCompetences || 0), note: s.note || "" });
      } else {
        lignes.push({ nom: s.nom, famille: s.bonus, base, bonus: b, total: base + b + (o.modCompetences || 0), note: s.note || "" });
      }
    }
    return lignes;
  },

  /* §2.3.7 — Grand Prêtre : 1D100 ≤ (POU+CHA)/10 */
  grandPretre(pou, cha, jet100) {
    return jet100 <= (pou + cha) / 10;
  },
  religionDuPays(pays) {
    const r = DONNEES.religions.table.find(x => x.pays === pays);
    return r ? r.dieux : null;
  },

  /* §2.3.10.3 — Afflictions du Mendiant */
  nombreAfflictions(jet4) { return jet4; },
  affliction(jet20) {
    const t = DONNEES.afflictions.table;
    return (jet20 >= 1 && jet20 <= t.length) ? t[jet20 - 1] : null;
  },

  /* ════════ §2.4 AUTRES COMPÉTENCES ════════ */

  nombreSupplementaires(jet6) { return jet6 + 2; },
  universelles() { return DONNEES.classes.universelles.competences.slice(); },
  /* Jet inconnu réussi sous le bonus de famille → rudiments acquis au niveau du bonus */
  rudiments(reussi, bonusFamille) { return reussi ? bonusFamille : 0; },

  /* ════════ §2.5 BONUS AUX COMPÉTENCES (formules du livre, §2.5.1-2.5.9) ════════ */

  bonusFamilles(caracs, opts) {
    const o = opts || {};
    const cr = caracs;
    const plus = k => (cr[k] > 12 ? cr[k] - 12 : cr[k] < 9 ? 9 - cr[k] : 0);
    const inv = k => (cr[k] > 12 ? 12 - cr[k] : cr[k] < 9 ? 9 - cr[k] : 0);
    const age = o.age != null ? o.age : 25;
    const taux = o.taux != null ? o.taux
      : (o.classe === "Prêtre" || o.classe === "pretre" ? 3
        : (o.classe === "Noble" || o.classe === "noble" ? 2 : 1));
    return {
      attaque: plus("FOR") + plus("INT") + plus("POU") + plus("DEX"),
      parade: plus("FOR") + plus("POU") + plus("DEX") + inv("TAI"),
      agilite: plus("FOR") + plus("POU") + plus("DEX") + inv("TAI"),
      manipulation: plus("FOR") + plus("INT") + plus("POU") + plus("DEX"),
      perception: plus("INT") + plus("POU"),
      discretion: plus("INT") + plus("DEX") + inv("TAI"),
      connaissance: Math.max(0, cr.INT - 12) * 2 + Math.max(0, age - 25) * taux,
      communication: plus("CHA") + plus("INT") + plus("POU"),
      tauxConnaissance: taux
    };
  },

  /* §2.5.3 — Bonus aux dommages (table FOR+TAI) */
  bonusDommages(forc, tai) {
    const t = forc + tai;
    const l = DONNEES.bonusDommages.table.find(x => {
      if (x.plage.endsWith("+")) return t >= Number(x.plage.replace("+", ""));
      const [a, b] = x.plage.split("-").map(Number);
      return t >= a && t <= b;
    });
    return l ? { total: t, melee: l.melee, tir: l.tir } : null;
  },

  /* ════════ §2.7 AUGMENTATION DES CARACTÉRISTIQUES ════════ */

  /* Jet sauveur réussi → 2D6 : 7 = +1 pt, 2 = −1 pt, sinon rien */
  augmentationCarac(jet2d6) {
    if (jet2d6 === 7) return 1;
    if (jet2d6 === 2) return -1;
    return 0;
  },

  /* ════════ §2.9 PETITE HISTOIRE PERSONNELLE ════════ */

  histoire(jet100) {
    const e = DONNEES.histoirePersonnelle.table.find(x => {
      const [a, b] = x.plage.split("-").map(Number);
      return jet100 >= a && jet100 <= (b || a);
    });
    return e ? e.texte : null;
  },
  /* ════════ §3.1 DÉPLACEMENTS ════════ */

  /* Terrain cumulatif : chaque réduction s'applique au reste, floor à chaque étape.
     Exemple du livre : 95 km à cheval, neige + forêt + montagne → 5 km. */
  deplacementJournalier(baseKm, terrains) {
    let km = baseKm;
    for (const t of (terrains || [])) {
      const f = DONNEES.deplacement.terrain.find(x => x.id === t);
      if (!f) throw new Error("terrain inconnu : " + t);
      const [a, b] = f.reduction.split("/").map(Number);
      km = Math.floor(km * (b - a) / b);
    }
    return km;
  },

  /* Scénario, 5 minutes : 120 m prudent, 300 m normal, 1600 m course ; monture ×2 */
  deplacementScenario(mode, monte) {
    const base = { prudent: 120, normal: 300, course: 1600 }[mode || "normal"];
    if (base == null) throw new Error("mode inconnu : " + mode);
    return monte ? base * 2 : base;
  },

  /* Mêlée, 12 secondes : 60 m en course, 30 m si gêné */
  deplacementMelee(mode) {
    const m = { course: 60, gene: 30 }[mode || "course"];
    if (m == null) throw new Error("mode inconnu : " + mode);
    return m;
  },

  /* Plaques complètes avec FOR < 11 : mouvement /3, −1 DEX par point manquant */
  malusPlaques(forc) {
    if (forc >= 11) return null;
    return { forManquante: 11 - forc, dex: -(11 - forc), mouvement: "1/3" };
  },

  /* ════════ §3.2 ROUND DE MÊLÉE ════════ */

  roundMelee() {
    return { duree: 12, roundsParMinute: 5, sequence: DONNEES.roundDeMelee.sequence.slice() };
  },
  initiative(jetA, dexA, jetB, dexB) {
    const a = jetA + dexA, b = jetB + dexB;
    return a > b ? "A" : b > a ? "B" : "égalité";
  },
  attaquantsActifs(nAttaquants) { return Math.min(nAttaquants, 5); },

  /* ════════ §3.3 COMPÉTENCES AUX ARMES ════════ */

  /* Arme inconnue ramassée : max(5, bonus) — l'exemple de Merak : max(5, 7) = 7 */
  armeInconnue(bonus) { return Math.max(5, bonus); },

  /* Apprendre une arme : 1D100/2 arrondi au supérieur + bonus */
  apprendreArme(jet100, bonus) { return Math.ceil(jet100 / 2) + bonus; },

  /* §3.3.1.1 — progression : 1D100 + mod INT > compétence actuelle → +1D10 */
  experienceArme(jet100, competence, int) {
    const total = jet100 + Math.max(0, (int || 12) - 12);
    const progresse = total > competence;
    return { progresse, gain: progresse ? "1D10" : 0 };
  },

  /* Parades successives : −20% cumulatifs (Merak : 41 → 21 → 1) */
  paradeSeuil(seuil, tentative) { return Math.max(0, seuil - 20 * (tentative - 1)); },

  /* Parade d'un projectile : compétence /2 */
  paradeProjectile(seuil) { return Math.floor(seuil / 2); },

  /* Flèches et frondes : parées uniquement au bouclier */
  paradePossibleContre(projectile, arme) {
    if (projectile === "fleche" || projectile === "fronde") {
      return !!(arme && arme.cat === "bouclier");
    }
    return true;
  },

  /* Ripostes du Maître : chaque attaque du round −20% (Elric : 112 → 92 → 72) */
  attaqueSeuilRound(seuil, rang) { return Math.max(0, seuil - 20 * (rang - 1)); },

  /* Critique : jet ≤ compétence/10, minimum 01 */
  estCritique(jet, seuil) { return jet <= Math.max(1, Math.floor(seuil / 10)); },

  /* Maladresse : 00 toujours ; 99 si compétence < 50% */
  estMaladresse(jet, seuil) { return jet === 100 || (jet === 99 && seuil < 50); },

  maladresseEffets(categorie, jet100) {
    const t = DONNEES.competencesArmes.maladresse.tables[categorie];
    if (!t) throw new Error("catégorie inconnue : " + categorie);
    const e = t.find(x => jet100 >= x.min && jet100 <= x.max);
    return e ? e.effet : null;
  },

  /* Maître d'armes : ≥ 90% en Attaque ET Parade */
  estMaitre(attaque, parade) { return attaque >= 90 && parade >= 90; },
  entrainementMaitre(jet6) { return Math.max(0, jet6 - 2); },

  /* ════════ §3.4 TACTIQUES ════════ */

  surpriseEmbuscade(jet4) { return Math.max(0, jet4 - 1); },
  jetPouImpuissant(jet100, pou) {
    return jet100 > pou ? { tue: true } : { survit: true, alerte: true };
  },
  jetPouSurpris(jet100, pou) {
    return { attaqueDouble: jet100 > pou };
  },

  /* ════════ §3.5.2 TABLE DES ARMES ════════ */

  armeParNom(nom, cat) {
    const cats = cat ? [cat] : ["melee", "boucliers", "jet"];
    for (const c of cats) {
      const a = DONNEES.armes[c].find(x => x.nom === nom);
      if (a) return a;
    }
    return null;
  },
  armeInterdite(nom, classe, premiereArme) {
    if (classe === "chasseur") return DONNEES.armes.restrictions.chasseur.includes(nom);
    if (classe === "voleur" && premiereArme) return DONNEES.armes.restrictions.voleurPremiereArme.includes(nom);
    return false;
  },
  /* FOR insuffisante : compétence à max(5, bonus) + frappe en dernier ;
     DEX insuffisante : dégâts /2 */
  peutUtiliser(arme, caracs) {
    const res = { ok: true, effets: [] };
    if (arme.for != null && caracs.FOR < arme.for) {
      res.ok = false;
      res.effets.push("compétence réduite à max(5, bonus d'Attaque/Parade) et frappe en dernier");
    }
    if (arme.dex != null && caracs.DEX < arme.dex) {
      res.ok = false;
      res.effets.push("dégâts divisés par 2");
    }
    return res;
  },

  /* ════════ §3.7 ARMURES ════════ */

  /* jet = résultat du dé de protection (1D6 cuir, 1D8 barbare/demi-plaques, 1D10 plaques) */
  armureProtection(type, jet, heaume) {
    switch (type) {
      case "cuir": case "barbare": case "demi-plaques":
        return Math.max(0, jet - 1);
      case "plaques":
        return heaume ? jet + 2 : Math.max(0, jet - 1);
      default:
        throw new Error("armure inconnue : " + type);
    }
  },

  /* ════════ §3.9 BLESSURES ════════ */

  /* Mineure < moitié des PV ; majeure ≥ moitié ; mortelle > PV */
  classeBlessure(degats, pv) {
    if (degats > pv) return "mortelle";
    if (degats >= Math.ceil(pv / 2)) return "majeure";
    return "mineure";
  },
  perteDexMineures(pvPerdus) { return Math.floor(pvPerdus / 4); },
  /* Rounds de combat avant l'évanouissement = PV restants */
  roundsAvantEvanouissement(pvRestants) { return pvRestants; },
  /* Aide dans l'heure, sinon 1D20 ≤ CON pour survivre (−1D6 CON + séquelle) */
  jetCONblessureMajeure(jet20, con) {
    return jet20 > con
      ? { survit: false, cause: "mort" }
      : { survit: true, conPermanent: "-1D6", sequelle: "3.9.2.1" };
  },
  blessureMajeureEffets(jet100) {
    const l = DONNEES.blessures.tableSequelles.lignes.find(x => jet100 >= x.min && jet100 <= x.max);
    return l || null;
  },
  /* Chutes : 0-1,5 m 1D4−2 (min 0) ; +1D6 par 3 m au-delà de 6 m ; eau −2D6 ; plaques +1D6 */
  degatsChute(metres, opts) {
    const o = opts || {};
    let des, minimum;
    if (metres <= 1.5) { des = "1D4-2"; minimum = 0; }
    else if (metres <= 3) des = "1D6";
    else if (metres <= 6) des = "2D6";
    else des = (2 + Math.ceil((metres - 6) / 3)) + "D6";
    const res = { des, ajustements: [] };
    if (minimum != null) res.minimum = 0;
    if (o.eau) res.ajustements.push("-2D6");
    if (o.plaque) res.ajustements.push("+1D6");
    return res;
  },
  fractureChute(jet6) {
    return DONNEES.blessures.chute.fractures.find(x => x.jet === jet6) || null;
  },
  /* Feu : jet ≤ 3×POU (plaques : 5×POU) pour ne pas prendre feu */
  feuSauveur(jet100, pou, plaque) { return jet100 <= (plaque ? 5 : 3) * pou; },
  maladieExposition(jet100, con) { return jet100 <= 2 * con; },
  maladieProgression(jet100, pou) { return jet100 <= 2 * pou; },

  /* ════════ §3.10-3.11 CONFLITS DE MASSE ════════ */

  batailleJet(jet100, pou) {
    return jet100 <= 5 * pou
      ? { indemne: true }
      : { degats: "2D10", armureSeule: true };
  },
  totalNaval(navigation, pou) { return navigation + pou; },
  /* 50% + 1% par point d'écart (exemple du livre : 109 vs 106 → 53/47) */
  chancesNavales(t1, t2) {
    return { capitaine1: 50 + (t1 - t2), capitaine2: 50 + (t2 - t1) };
  },
  /* ════════ §4.1 LE CHAPITRE DES COMPÉTENCES ════════ */

  /* §4.1.1 — 1D100/2 arrondi au supérieur + bonus (Lucria : 67/2 → 34 + 16 = 50) */
  determinerCompetence(jet100, bonus) { return Math.ceil(jet100 / 2) + (bonus || 0); },

  /* §4.1.2 — progression : jet (+INT−12 si INT > 12) > compétence → +1D10
     (ou +1 point seulement si déjà ≥ 90 %) ; maximum 100 sauf aide magique */
  progressionCompetence(jet100, competence, int) {
    const total = jet100 + Math.max(0, (int || 12) - 12);
    const progresse = total > competence;
    return { progresse, gain: progresse ? (competence >= 90 ? 1 : "1D10") : 0, maximum: 100 };
  },

  /* §4.11 — la liste récapitulative des compétences */
  competenceParNom(nom) {
    return (DONNEES.competences.liste.entrees || []).find(x => x.nom === nom) || null;
  },
  competencesParType(type) {
    return (DONNEES.competences.liste.entrees || []).filter(x => x.type === type);
  },

  /* ════════ §4.4 DISCRÉTION ════════ */

  /* §4.4.1 — armure barbare ou de plaques : −40 % avant le jet */
  deplacementSilencieuxSeuil(seuil, armure) {
    return (armure === "barbare" || armure === "plaques")
      ? seuil - DONNEES.competences.discretion.deplacementSilencieux.malusArmure
      : seuil;
  },
  /* §4.4.2 — bouger en restant à couvert : jet sous la moitié */
  seCacherEnBougent(seuil) { return Math.floor(seuil / 2); },
  /* §4.4.5 — objets au contact de la peau : jet sous la moitié ;
     cible éveillée : jet sauveur sous sa DEX en plus */
  couperBourseSeuil(seuil, contactPeau) { return contactPeau ? Math.floor(seuil / 2) : seuil; },
  volerObjet(jet100, seuil, contactPeau, cibleEveillee, jetDex, dex) {
    const requis = contactPeau ? Math.floor(seuil / 2) : seuil;
    const sauveurOk = cibleEveillee ? (jetDex != null && jetDex <= dex) : true;
    return { jetRequis: requis, sauveurDexRequis: cibleEveillee ? dex : null, reussi: jet100 <= requis && sauveurOk };
  },

  /* ════════ §4.5 AGILITÉ ════════ */

  /* §4.5.1 — combat à cheval : la plus basse des deux compétences */
  chevaucherCombat(compArme, compChevaucher) { return Math.min(compArme, compChevaucher); },
  /* §4.5.2 — nage : jets 1 et 2 ratés → −1 PV chacun ; 3 ratés → noyade */
  nager(seuil, jets100) {
    const rates = jets100.map(j => j > seuil);
    const pvPerdus = rates.slice(0, 2).filter(Boolean).length;
    const seNoie = rates.length >= 3 && rates.slice(0, 3).every(Boolean);
    return { pvPerdus, seNoie, degatsNoyade: seNoie ? "1D8 par round" : null };
  },
  /* §4.5.3 — 1 jet par tranche de 10 m ; chute ratée : 1D6 par 3 m (fractions ignorées) */
  grimperJets(metres) { return Math.ceil(metres / 10); },
  grimperChute(hauteurM) { return { des: Math.floor(hauteurM / 3) + "D6", minimum: 0 }; },
  /* §4.5.4 — 3× la taille en longueur, 1× en hauteur ; armure −1 m ; FOR > 15 : +30 cm/pt */
  sauter(tailleCm, opts) {
    const o = opts || {};
    let longueur = 3 * tailleCm, hauteur = tailleCm;
    if (o.armure) { longueur -= 100; hauteur -= 100; }
    if (o.for > 15) longueur += 30 * (o.for - 15);
    return { longueurCm: Math.max(0, longueur), hauteurCm: Math.max(0, hauteur) };
  },
  /* §4.5.5 — les attaquants soustraient Culbuter de leur Attaque */
  culbuterContreAttaque(attaque, culbuter) { return Math.max(0, attaque - culbuter); },
  culbuterChutePossible(metres) { return metres <= DONNEES.competences.agilite.culbuter.chuteMax; },
  /* §4.5.6 — série d'objets dans le round : −20 % par objet supplémentaire évité */
  eviterSeuil(seuil, rang) { return Math.max(0, seuil - 20 * (rang - 1)); },

  /* ════════ §4.6 MANIPULATION ════════ */

  /* §4.6.4 — 1 objet + 1 par 10 % ; la moitié de Jongler s'ajoute aux armes de jet */
  jonglerObjets(comp) { return 1 + Math.floor(comp / 10); },
  jonglerArmesDeJet(compJet, jongler) { return compJet + Math.floor(jongler / 2); },

  /* ════════ §4.7 PERCEPTION ════════ */

  /* §4.7.3 — alcool, drogue, feu ou odeur puissante : compétence /2 */
  sentirSeuil(seuil, perturbe) { return perturbe ? Math.floor(seuil / 2) : seuil; },
  /* §4.7.4 — goûter un poison : sauveur 5×CON sinon PV perdus = jet − 5×CON */
  gouterPoison(jet100, con) {
    const seuil = 5 * con;
    return jet100 <= seuil ? { indemne: true } : { indemne: false, pvPerdus: jet100 - seuil };
  },
  gouterMetalSeuil(seuil) { return Math.floor(seuil / 2); },
  /* §4.7.7 — pistage : +20 % si créature blessée ; −20 % par tranche de 24 h
     au-delà de la première journée (Lucria 54 % sur 2,5 jours → 14 %) */
  pisterSeuil(seuil, opts) {
    const o = opts || {};
    let s = seuil;
    if (o.blesse) s += 20;
    if (o.heures > 24) s -= 20 * Math.ceil((o.heures - 24) / 24);
    return Math.max(0, s);
  },

  /* ════════ §4.8 CONNAISSANCE ════════ */

  /* §4.8.3 — erreur de Navigation en haute mer : déviation = jet − compétence (degrés) */
  navigationErreur(jet100, comp) {
    return jet100 <= comp ? { reussi: true, deviationDegres: 0 } : { reussi: false, deviationDegres: jet100 - comp };
  },
  /* §4.8.4 — Artisanat : critique ≤ 1/10 du nécessaire → chef-d'œuvre ;
     raté → défectueux ; maladresse 00 → détruit à la fabrication */
  artisanatResultat(jet100, comp) {
    if (jet100 <= Math.max(1, Math.floor(comp / 10))) return { etat: "chef-d'oeuvre" };
    if (jet100 <= comp) return { etat: "fabriqué" };
    if (jet100 === 100) return { etat: "détruit à la fabrication" };
    return { etat: "défectueux" };
  },
  /* §4.8.5 — Premiers Soins : +1D3 PV ; critique +1D3+3 ;
     maladresse : le patient perd la MOITIÉ des PV déjà perdus */
  premiersSoins(jet100, comp, pvPerdus) {
    if (jet100 <= Math.max(1, Math.floor(comp / 10))) return { etat: "critique", pvRegagnes: "1D3+3" };
    if (jet100 <= comp) return { etat: "réussi", pvRegagnes: "1D3" };
    if (jet100 === 100) return { etat: "maladresse", pvPerdusSupplementaires: Math.floor(pvPerdus / 2) };
    return { etat: "raté" };
  },
  /* §4.8.8 — échange de secrets : chacun jette 1D10−1 et gagne 0 à 9 % */
  echangerSecretsPoisons(jetD10) { return Math.max(0, jetD10 - 1); },
  /* §4.8.8.1 — antidotes : jet sous la MOITIÉ ; classes 4-5 : compétence > 120 % requise */
  antidoteSeuil(compPoisons) { return Math.floor(compPoisons / 2); },
  antidotePossible(compPoisons, classe) {
    return (classe === 4 || classe === 5) ? compPoisons > 120 : true;
  },
  /* §4.8.8.2.1 — la classe d'un poison dépend de la compétence de son créateur */
  classeDePoison(compPoisons) {
    const c = DONNEES.competences.connaissance.poisons.classes.find(x => compPoisons >= x.min && compPoisons <= x.max);
    return c ? c.classe : null;
  },
  effetDePoison(classe, jet100) {
    const c = DONNEES.competences.connaissance.poisons.classes.find(x => x.classe === classe);
    if (!c) throw new Error("classe de poison inconnue : " + classe);
    if (c.effets) {
      const e = c.effets.find(x => jet100 >= x.min && jet100 <= x.max);
      return e ? (e.degats ? { degats: e.degats } : { delai: e.delai }) : null;
    }
    return { texte: c.detail || c.nom };
  },
  /* §4.8.8.3 — immunités naturelles : classes 3-4 uniquement, sauveur 1D100 sous CON */
  immuniteNaturelle(classe, jet100, con) {
    const possible = classe === 3 || classe === 4;
    return { possible, immunise: possible && jet100 <= con };
  },
  /* §4.8.9.1 — les dix niveaux de Connaissance des Plantes */
  planteNiveau(compPlantes) {
    const n = DONNEES.competences.connaissance.plantes.niveaux.find(x => compPlantes >= x.min && compPlantes <= x.max);
    return n ? n.niveau : null;
  },
  /* niveau 3 : confère 10 % en Connaissance des Poisons si absente */
  plantesPoisonsGratuits(compPlantes, compPoisons) {
    return (REGLES_SB.planteNiveau(compPlantes) >= 3 && (compPoisons == null || compPoisons < 10)) ? 10 : null;
  },
  /* §4.8.9.4 — drogues de caractéristiques : 1D6 → FOR/INT/POU/CON/DEX/CHA ;
     1D20 ± pendant 2D6 heures ; max ±19 ; 20 → immunité ;
     FOR/INT/CON/DEX réduites à ≤ 0 → mort ; réduction > 50 % → inconscience */
  drogueCarac(jet6) {
    const caracs = DONNEES.competences.connaissance.plantes.drogues.caracParJet6;
    return caracs[jet6 - 1] || null;
  },
  drogueCaracEffet(jet20, caracKey, valeur, augmenter) {
    if (jet20 === 20) return { immunite: true, nouvelle: valeur };
    const val = Math.min(19, jet20);
    const nouvelle = augmenter ? valeur + val : valeur - val;
    return {
      immunite: false,
      nouvelle,
      mort: !augmenter && nouvelle <= 0 && ["FOR", "INT", "CON", "DEX"].indexOf(caracKey) >= 0,
      inconscience: !augmenter && (valeur - nouvelle) / valeur > 0.5 ? "1D10 tours (5 min)" : false,
      duree: "2D6 heures"
    };
  },
  /* §4.8.10 — 1 instrument par 10 % ; légendes : jet ≤ moitié de la compétence */
  musiqueInstruments(comp) { return Math.floor(comp / 10); },
  legendesFolklore(jet100, comp) { return jet100 <= Math.floor(comp / 2); },

  /* ════════ §4.9 COMMUNICATION ════════ */

  /* §4.9.1 — alignement opposé : −10 % */
  persuaderSeuil(seuil, alignementOppose) { return alignementOppose ? seuil - 10 : seuil; },
  /* §4.9.2 — Crédit à la création : 1D6 de 1-5 → 1D100×5 GB ; 6 → 1D100×10 GB */
  creditInitial(jetReussi, jetD6, jetD100) {
    if (!jetReussi) return 0;
    return jetD6 === 6 ? jetD100 * 10 : jetD100 * 5;
  },
  /* §4.9.4 — Chanter : 1D100 GB ; critique (≤ 1/10) → 1D100×5 GB (Tristelune : 285 GB) */
  chanterGains(jet100, comp, gainsD100) {
    const critique = jet100 <= Math.max(1, Math.floor(comp / 10));
    if (jet100 > comp) return { critique: false, gb: 0 };
    return { critique, gb: critique ? gainsD100 * 5 : gainsD100 };
  }
,
  /* ════════ §5.2-5.3 SORCIERS, GRIMOIRES, INT LIBRE ════════ */

  /* §5.2.1/5.3 — INT ≥ 16 ET INT+POU ≥ 32 requis pour invoquer */
  conditionsMagicien(int, pou) {
    return { intOk: int >= 16, totalOk: int + pou >= 32, magicienPotentiel: int >= 16 && int + pou >= 32 };
  },
  /* §5.2.1.1 — 1 point d'INT libre par tranche de 50 V.C. (arrondi sup) ; élémentaires : 1 */
  intLibreCoutDemon(vc) { return Math.ceil(vc / 50); },
  intLibreCoutElementaire() { return 1; },
  /* §5.2.1.2 — le grimoire d'un auteur plus talentueux confère le score de l'AUTEUR */
  invocationViaGrimoire(invocationSorcier, invocationAuteur) {
    return Math.max(invocationSorcier, invocationAuteur);
  },
  /* §5.3 — compétence Invocation de départ = INT + POU */
  invocationInitiale(int, pou) { return int + pou; },
  /* §5.3.1 — le type détermine jets ET heures de la première invocation */
  jetsInvocation(type) { return type; },
  heuresInvocation(type) { return type; },
  /* §5.3.1 — n-ième échec consécutif en continuant : nD4 points de SAN ; arrêt : 1D4 */
  perteSanEchecInvocation(echecsCumules, arrete) {
    return arrete ? "1D4" : (echecsCumules || 1) + "D4";
  },
  /* §5.3.1.1 — critique → +1D4−1 ; maladresse → −1D6 SAN */
  invocationCritiqueGain(jetD4) { return jetD4 - 1; },
  invocationMaladresseSan() { return "1D6"; },
  /* §5.3.1.1 — initiation : 100 − (INT+POU) mois, 3D6 SAN */
  initiationMois(int, pou) { return 100 - (int + pou); },
  /* §5.3.1.1 — maître (≥ 80 %) : 1D6−1 % par mois d'enseignement complet */
  maitreSeuil() { return 80; },
  maitreGainParMois(jetD6) { return Math.max(0, jetD6 - 1); },
  /* §5.3.1.1 — grimoire : 1 mois par D6 % ; échec du jet d'assimilation → hermétique */
  grimoireMoisEtude(d6) { return d6; },
  /* §5.3.1.1 — Duc du Chaos : SAN perdue = gain + (échec du test SAN → gain encore) */
  ducDuChaosPerteSan(gain, jetSan, san) {
    return gain + (jetSan > san ? gain : 0);
  },

  /* ════════ §5.4-5.5 ÉLÉMENTAIRES ════════ */

  /* §5.4.1 — seuil de lien : 3 × POU */
  seuilLienElementaire(pou) { return 3 * pou; },
  /* §5.4.1 — résultat d'un lien : raté → POU tombe à 1 (récup 1/h) */
  lienElementaire(jet100, pou) {
    const seuil = 3 * pou;
    return { seuil, lie: jet100 <= seuil, critique: jet100 <= Math.max(1, Math.floor(seuil / 10)), pouSiRate: 1 };
  },
  /* §5.4.1.1 — lien critique : 1D4−2 points de POU gagnés ou perdus */
  gainPouLienElementaire(jetD4) { return jetD4 - 2; },
  /* §5.4.1.2 — > 1 élémentaire d'un même type : 2D6 strictement supérieur au nombre lié */
  limiteElementairesMemeType(jet2D6, nombreLies) { return jet2D6 > nombreLies; },
  /* §5.4.3.1 — oppositions : le Feu neutralise l'Air, la Terre neutralise l'Eau (et vice-versa) */
  elementsOpposes(a, b) {
    return DONNEES.sorcellerie.elementaires.effets.oppositions.some(
      p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a)
    );
  },
  /* §5.5.4 — jet de flammes de salamandre : chance 100 % − 10 % par mètre (max 10 m) */
  salamandreFlammeChance(distanceM) {
    return distanceM > 10 ? 0 : 100 - 10 * distanceM;
  },
  salamandreFlammeDegats() { return "2D10"; },
  salamandreTirsParHeure() { return 3; },
  /* §5.5.3 — arme frappant un gnome : 50 % de brisure (superbe : 25 %) */
  gnomeBriserArme(superbe) { return superbe ? 25 : 50; },
  /* §5.5.2 — transport aquatique : TAI ≤ 9 */
  ondinePeutPorter(tai) { return tai <= 9; },

  /* ════════ TABLE DE RÉSISTANCE (page 81) ════════ */

  /* 50 + 5 × écart de POU ; — si ≤ 0 ; plancher 05, plafond 95 */
  tableResistance(pouAttaquant, pouDefenseur) {
    const brut = 50 + 5 * (pouAttaquant - pouDefenseur);
    if (brut <= 0 || brut >= 100) return null;
    return brut;
  },

  /* ════════ §5.6 DÉMONS ════════ */

  /* §5.6.1 — V.C. = somme des caracs du sorcier − POU du démon */
  valeurChaotique(sommeCaracsSorcier, pouDemon) { return sommeCaracsSorcier - pouDemon; },
  /* §5.6.1 — POU variable : par D8 en moins V.C. −25 % / Invocation +25 % (et inversement) */
  valeurChaotiqueVariable(sommeCaracsSorcier, pouDemon, d8) {
    const delta = d8 - 3;
    const vc = Math.round(sommeCaracsSorcier * (1 + 0.25 * delta)) - pouDemon;
    return { vc, modificateurInvocation: -25 * delta };
  },
  /* §5.6.1 — répartition de la V.C. selon le type (2 : MJ total ; 3 : 1/3 ; 4 : 2/3 ; 5 : tout) */
  allocationSorcierVC(type, vc) {
    if (type === 2) return 0;
    if (type === 3) return Math.ceil(vc / 3);
    if (type === 4) return Math.ceil(2 * vc / 3);
    if (type === 5) return vc;
    return null;
  },
  allocationMJVC(type, vc) {
    const s = REGLES_SB.allocationSorcierVC(type, vc);
    return s === null ? null : vc - s;
  },
  /* §5.6 (formes) — perception automatique : 10+1D10 % ; caracs : 1D8 gratuit par carac (jamais POU) */
  demonPerception(jetD10) { return 10 + jetD10; },
  /* §5.6.2 — le démon accepte le marché : 1D100 ≤ 5 × CHA de l'invocateur */
  demonAccepteMarche(jet100, chaInvocateur) { return jet100 <= 5 * chaInvocateur; },
  /* §5.6.2 — marchander sa vie : 1D100 ≤ 2 × carac choisie ; INT ≤ 5 refuse */
  demonMarchandageSauvetage(jet100, caracteristique, demonInt) {
    if (demonInt <= 5) return false;
    return jet100 <= 2 * caracteristique;
  },
  /* §5.6.3 — lutte de POU : 50 % + 5 % par point d'écart */
  seuilLienDemon(pouSorcier, pouDemon) { return 50 + 5 * (pouSorcier - pouDemon); },
  /* §5.6.4 — lien critique avec un démon de POU ≥ au sien : 1D4−1 */
  gainPouLienDemon(jetD4, pouSorcier, pouDemon) {
    return pouDemon >= pouSorcier ? jetD4 - 1 : null;
  },
  /* §5.6.5 — max démons liés = CHA / 2 */
  limiteDemonsLies(cha) { return Math.floor(cha / 2); },
  /* §5.7.1 — recherche de pouvoirs */
  pouvoirParNom(nom) {
    const S = DONNEES.sorcellerie;
    const toutes = [].concat(S.pouvoirsDemoniaques.defenseurs, S.pouvoirsDemoniaques.offensifs, S.pouvoirsDeplacement, S.pouvoirsPerception, S.pouvoirsDivers);
    return toutes.find(p => p.nom === nom) || null;
  },
  pouvoirsParCategorie(categorie) {
    const S = DONNEES.sorcellerie;
    const c = { defensifs: S.pouvoirsDemoniaques.defenseurs, offensifs: S.pouvoirsDemoniaques.offensifs, deplacement: S.pouvoirsDeplacement, perception: S.pouvoirsPerception, divers: S.pouvoirsDivers };
    return c[categorie] || null;
  },
  /* §5.7.1 (Arme) — 15 points par 1D6 supplémentaire : épée large 1D8+1 + 45 points → 1D8+1+3D6 */
  armeDemonDegats(pointsVC, baseDegats) {
    return baseDegats + "+" + Math.floor(pointsVC / 15) + "D6";
  },
  /* §5.7.1 (Pacte de Sauvegarde) — coût par type d'objet */
  pacteSauvegardeCout(nom) {
    const p = REGLES_SB.pouvoirParNom("Pacte de Sauvegarde");
    return (p && p.table && p.table[nom] !== undefined) ? p.table[nom] : null;
  },
  /* §5.7.1 (Téléportation) — erreurs sur 1D10 */
  erreurTeleportation(jet10) {
    const t = DONNEES.sorcellerie.erreursTeleportation;
    return t.find(e => {
      if (typeof e.jet === "number") return e.jet === jet10;
      const b = e.jet.split("-");
      return jet10 >= Number(b[0]) && jet10 <= Number(b[1]);
    }) || null;
  },
  /* §5.7.1 (Gonflement) — malus selon le multiple de la TAI (×5 = mort) */
  gonflementMalus(taiNormale, taiNouvelle) {
    const r = taiNouvelle / taiNormale;
    if (r >= 5) return "mort";
    if (r >= 4) return -75;
    if (r >= 3) return -50;
    if (r >= 2) return -25;
    return 0;
  },
  /* §5.7.1 (Sang Acide) — jet sous POU×3 pour éviter l'aspergement */
  sangAcideAsperge(jet100, pou) { return jet100 > 3 * pou; },
  /* §5.7.1 (Don du Chaos) — SAN perdue = V.C. du pouvoir + POU du démon */
  donDuChaosPerteSan(vcPouvoir, pouDemon) { return vcPouvoir + pouDemon; },
  /* §5.7.1 (Horde) — 1D100/2 démons */
  hordeNombre(jet100) { return Math.floor(jet100 / 2); },
  /* §5.7.1 (Transmutation) — −1 CON par point de TAI transmuté */
  transmutationCoutCon(tai) { return tai; },
  /* §5.8 — exemples de démons et créatures connues */
  demonExempleParNom(nom) {
    return DONNEES.sorcellerie.exemplesDemons.find(d => d.nom === nom) || null;
  },
  creatureConnueVC(nom) {
    const c = DONNEES.sorcellerie.demons.creaturesConnues.find(c => c.nom === nom);
    return c ? c.vc : null;
  },
  /* §5.8.1 — conversion : facteur de rang */
  conversionFacteur(rang) {
    const r = DONNEES.sorcellerie.conversion.rangs.find(r => r.rang === rang);
    return r ? r.facteur : null;
  },
  conversionInvocation(int, pou, rang) {
    return int + pou + REGLES_SB.conversionFacteur(rang);
  },

  /* ════════ §5.9-5.11 LES SEIGNEURS ════════ */

  /* §5.9 — Seigneurs Élémentaires : INT+POU ≥ 40 ; jet ≤ POU+CHA ; persuasion ≤ max(CHA, INT) */
  seigneurElementaireSeuil() { return 40; },
  seigneurElementaireInvocation(jet100, pou, cha) { return jet100 <= pou + cha; },
  seigneurElementairePersuasion(jet100, cha, int) { return jet100 <= Math.max(cha, int); },
  /* §5.10 — Seigneurs des Bêtes : INT+POU ≥ 44 ; Melnibonéen : jet ≤ INT+POU ; autre : jet ≤ POU puis jet ≤ CHA */
  seigneurBeteSeuil() { return 44; },
  seigneurBeteMelniboneen(jet100, int, pou) { return jet100 <= int + pou; },
  seigneurBeteEtrangerInvocation(jet100, pou) { return jet100 <= pou; },
  seigneurBeteAide(jet100, cha) { return jet100 <= cha; },
  /* §5.11.1 — Seigneur de la Loi : INT+POU ≥ 48 ; jet ≤ INT+POU */
  seigneurLoiSeuil() { return 48; },
  seigneurLoiInvocation(jet100, int, pou) { return jet100 <= int + pou; },
  /* §5.11.2 — Seigneur du Chaos : jet ≤ POU + sacrifices humains */
  seigneurChaosInvocation(jet100, pou, sacrifices) { return jet100 <= pou + sacrifices; },
  /* §5.11.2.3 — invocation informelle : jet ≤ INT + CHA */
  seigneurChaosInformel(jet100, int, cha) { return jet100 <= int + cha; },
  /* §5.11 (avatars) — caracs × 10 (TAI libre) */
  avatarCaracs(caracs) {
    const r = {};
    for (const k of Object.keys(caracs)) r[k] = k === "TAI" ? caracs[k] : caracs[k] * 10;
    return r;
  },
  /* §5.11.1 — Donblas : dégâts × 1 à × 10 */
  dieuDegatsPossibles(degatsBase) {
    const r = [];
    for (let m = 1; m <= 10; m++) r.push(degatsBase * m);
    return r;
  },

  /* ════════ §5.12 MARCHANDER AVEC LES DIEUX ════════ */

  /* service mineur : 1D6 points à retirer de CON, POU ou CHA */
  marchanderDieuServiceMineur(jetD6) { return { points: jetD6, caracteristiques: ["CON", "POU", "CHA"] }; },
  /* ════════ §6 CULTES ET PRÊTRES ════════ */

  /* §6.4 — l'Élan : 0 à 100, maximum effectif 99 ; 50 points d'Élan = 1 point de POU, jamais l'inverse */
  elanMax() { return 99; },
  elanVersPou(elan) {
    return { conversions: Math.floor(elan / 50), elanRestant: elan % 50 };
  },
  /* à 100 points ou plus : conversion obligatoire d'au moins 50 points en POU */
  elanApresGain(elan, gain) {
    let e = elan + gain, pou = 0;
    while (e >= 100) { e -= 50; pou += 1; }
    return { elan: Math.min(e, 99), pouGagnes: pou };
  },
  /* §6.4.1 — implorer l'Intervention Divine : 1D100 ≤ Élan ; échec → Élan divisé par deux */
  implorerInterventionDivine(jet100, elan) {
    const reussi = jet100 <= elan;
    return { reussi, elan: reussi ? elan - jet100 : Math.floor(elan / 2) };
  },
  /* §6.5 — devenir Agent : jet 1D100 ≤ CHA + POU sacrifié + bonus MJ (jamais > 30 %) */
  devenirAgentSeuil(cha, pouSacrifie, bonusMJ) {
    return cha + pouSacrifie + Math.min(Math.max(bonusMJ || 0, 0), 30);
  },
  devenirAgent(jet100, cha, pouSacrifie, bonusMJ) {
    return jet100 <= REGLES_SB.devenirAgentSeuil(cha, pouSacrifie, bonusMJ);
  },
  /* le POU ne peut jamais être réduit à moins de 3 */
  sacrificePouValide(pou, sacrifie) { return pou - sacrifie >= 3; },
  pouApresSacrifice(pou, sacrifie) { return pou - sacrifie; },
  /* §6.6.5 / §6.7.6 / §6.8.5 — consultation des tables d'Élan */
  elanElementaires(action, seigneur) {
    const t = DONNEES.cultes.egliseDesQuatreElements.gainElan;
    const dans = (l) => { const e = (l || []).find(x => x.action === action); return e ? e.points : null; };
    const c = dans(t.commun);
    return c !== null ? c : dans(seigneur ? t.parSeigneur[seigneur] : null);
  },
  elanLoi(action) {
    const e = DONNEES.cultes.egliseDeLaLoi.gainElan.table.find(x => x.action === action);
    return e ? e.points : null;
  },
  elanChaos(action, seigneur) {
    const t = DONNEES.cultes.egliseDuChaos.gainElan;
    const dans = (l) => { const e = (l || []).find(x => x.action === action); return e ? e.points : null; };
    const c = dans(t.communs);
    return c !== null ? c : dans(seigneur ? t.parSeigneur[seigneur] : null);
  },
  /* acte particulièrement chaotique au service d'un Seigneur non listé */
  elanChaosActeNonListe() { return "1D10"; },
  /* §6.7.2 — les collèges de la Loi : 10 GB par point (max 10), jet 1D100 ≤ 5×INT, 2 jours d'étude par point */
  loiCollegeCoutParPoint() { return 10; },
  loiCollegeCout(points) { return 10 * Math.min(points, 10); },
  loiCollegeAssimilation(jet100, int) { return jet100 <= 5 * int; },
  loiCollegeDureeJours(points) { return 2 * points; },
  /* §6.7.4.1 — manifestation des Vertus : seuils par rang */
  vertuSeuilRang1(int, premiere) { return premiere ? 5 * int : 2 * int; },
  vertuSeuilRang2(premiere) { return premiere ? 90 : 50; },
  vertuPouBase() { return "4D6"; },
  vertuPou(jets4D6) { return jets4D6.reduce((a, b) => a + b, 0); },
  /* incarnation : lutte d'INT contre le POU de la Vertu sur la table de résistance */
  vertuIncarnationSeuil(int, pouVertu) { return REGLES_SB.tableResistance(int, pouVertu); },
  /* si le POU de la Vertu incarnée ≥ celui de l'invocateur : gain de 1D4−1 points d'INT */
  vertuGainInt(pouVertu, pouInvocateur, jetD4) {
    return pouVertu >= pouInvocateur ? Math.max(0, jetD4 - 1) : 0;
  },
  vertusIncarneesMax(int) { return Math.floor(int / 2); },
  /* §6.7.4.2 — l'animal de la Vertu de Voyage (bois / pierre / métal) */
  vertuAnimalPV(pvNaturels, matiere) {
    return (matiere === "pierre" || matiere === "métal") ? pvNaturels * 2 : pvNaturels;
  },
  vertuAnimalVitesse(vitesse, matiere) {
    return matiere === "pierre" ? vitesse / 2 : (matiere === "métal" ? vitesse * 2 / 3 : vitesse);
  },
  vertuAnimalArmure(matiere) { return matiere === "bois" ? 3 : 0; },
  vertuAnimalPeutVoler(matiere) { return matiere !== "pierre"; },
  /* §6.7.5.1 — Champions de la Loi : l'Élixir de Durabilité double la CON, PV recalculés */
  championLoiCon(con) { return con * 2; },
  championLoiPv(con, tai) { return REGLES_SB.pointsDeVie(con * 2, tai); },
  championLoiInterventionDivine(situation) { return situation === "forces chaotiques"; },
  /* §6.7.7 — l'amulette de la Loi : +1 degré par 10 points de POU chaotiques (rayon 30 m) */
  amuletteLoiTemperature(pouChaos) { return Math.floor(pouChaos / 10); },
  amuletteLoiRayonMetres() { return 30; },
  /* §6.8.4.1 — Agent du Chaos : toujours au moins 50 % à toute lutte de POU contre un démon */
  agentChaosLuttePouSeuil(pouAgent, pouDemon) {
    const t = REGLES_SB.tableResistance(pouAgent, pouDemon);
    return t === null ? 50 : Math.max(50, t);
  },
  /* le démon lié offert par le Grand Prêtre a toujours un POU ≤ 10 */
  agentChaosDemonOffertPouMax() { return 10; },
  /* jamais plus d'un mois de jeu au même endroit */
  agentChaosSejourMaxMois() { return 1; },
  /* §6.10 — le sacrifice de points de caractéristiques est définitif */
  sacrificeCaracteristique(carac, points) { return Math.max(0, carac - points); },

/* ════════ §7 SANTÉ MENTALE ET FOLIE ════════ */

  /* §7.2 — le jet de SAN : 1D100 ≤ SAN à l'instant du jet ; toute perte est généralement permanente */
  jetSanReussi(jet100, san) { return jet100 <= san; },
  /* SFT = moitié de la SAN, fractions arrondies au chiffre inférieur */
  sft(san) { return Math.floor(san / 2); },
  /* perte ≥ SFT en dix minutes (50 tours de mêlée) → folie temporaire */
  declencheFolieTemporaire(perte, seuilSft) { return perte >= seuilSft; },
  formeDeFolie(jetD6) {
    const e = DONNEES.folie.regles.formes.table.find(x => x.jet === jetD6);
    return e ? e.forme : null;
  },
  dureeDeFolie(jetD8) {
    const e = DONNEES.folie.regles.durees.table.find(x => x.jet === jetD8);
    return e ? e.duree : null;
  },
  /* additionne le jet (déjà lancé) à la constante d'une expression « 1D8 + 1 », « 1D4 − 1 », « 2D10 »… */
  perteDeTable(expr, jet) {
    if (typeof expr === "number") return expr;
    const m = /^(\d*)D(\d+)(\s*\+\s*(\d+))?(\s*[−-]\s*(\d+))?$/.exec(String(expr).trim());
    if (!m) throw new Error("expression de perte inconnue : " + expr);
    return (jet === null || jet === undefined ? 0 : jet) + (m[4] ? Number(m[4]) : 0) - (m[6] ? Number(m[6]) : 0);
  },
  /* §7.3 — récupérer des points de SAN */
  bannirUnDieuSan() { return 30; },
  contrecarrerPlansDivinsSan() { return 20; },
  /* §7.4.1-7.4.3, 7.4.7, 7.4.8 — pertes par situation (données folie.pertes.*) */
  perteSanSituation(nomSituation, reussi, jet) {
    const s = DONNEES.folie.pertes[nomSituation];
    if (!s) throw new Error("situation inconnue : " + nomSituation);
    if (reussi) return typeof s.reussi === "number" ? s.reussi : REGLES_SB.perteDeTable(s.reussi, jet);
    return REGLES_SB.perteDeTable(s.rate, jet);
  },
  /* §7.4.4 — transformations chaotiques : incident secondaire / traumatisme important */
  perteSanTransformationSecondaire(reussi, jetD6) {
    const s = DONNEES.folie.pertes.transformations.secondaires;
    return reussi ? s.reussi : REGLES_SB.perteDeTable(s.rate, jetD6);
  },
  perteSanTraumatisme(reussi, jetD8) {
    const s = DONNEES.folie.pertes.transformations.traumatisme;
    return reussi ? s.reussi : REGLES_SB.perteDeTable(s.rate, jetD8);
  },
  /* cas épouvantable : jet sous le dixième de la SAN courante ; raté → 50 points de SAN */
  casEpouvantableSeuil(san) { return Math.floor(san / 10); },
  perteSanCasEpouvantable(jet100, san) { return jet100 <= Math.floor(san / 10) ? 0 : 50; },
  /* §7.4.6.1 — la table des démons (Combat 1/1D8, Protection 1/1D6, Possession 1/1D8, Désir 0/1D6, Savoir 0/1D4, Voyage 0/1D4) */
  perteSanDemon(type, reussi, jet) {
    const l = DONNEES.folie.pertes.tableDemons.lignes.find(x => x.type === type);
    if (!l) throw new Error("type de démon inconnu : " + type);
    return reussi ? l.reussi : REGLES_SB.perteDeTable(l.rate, jet);
  },
  /* §7.4.9 — les dieux : +10 au jet, un jet à CHAQUE rencontre, colonne Première rencontre jusqu'à réussite */
  jetSanDieu(jet100) { return jet100 + 10; },
  perteSanDieu(categorie, premiere, reussi, jet) {
    const l = DONNEES.folie.pertes.tableDieux.lignes.find(x => x.dieu === categorie);
    if (!l) throw new Error("catégorie de dieu inconnue : " + categorie);
    const expr = premiere ? (reussi ? l.premiereReussi : l.premiereRate) : (reussi ? l.ulterieuresReussi : l.ulterieuresRate);
    return REGLES_SB.perteDeTable(expr, jet);
  },

/* ══════════════════ §8 — ANIMAUX, CRÉATURES ET MONSTRES ══════════════════ */

  /* §8.4.3.1 — points de vie d'une créature : CON + TAI - 12, ou CON seule si TAI < 12 */
  pointsDeVieCreature(con, tai) {
    return tai < 12 ? con : con + tai - 12;
  },
  /* §8.4.3.2 — armure aléatoire d'une créature : 1D10 - 1 (0 à 9), maximum 10 (le dragon) */
  armureCreatureAleatoire(jetD10) { return jetD10 - 1; },
  armureCreatureMax() { return 10; },
  /* §8.4.4 — sans idée de la moyenne : 1D10 = nombre de D8 dans la caractéristique */
  nombreDeDesCaracteristique(jetD10) { return jetD10; },
  /* §8.4.5 — compétence de combat et parade d'une créature inventée : 1D100 */
  competenceCombatAleatoire(jetD100) { return jetD100; },
  /* §8.4.5 — l'exemple du livre : chaque épine empoisonnée fait 2D8 + 2, résistée sous 5 × CON */
  resistEpinePoison(jet, con) { return jet <= 5 * con; },
  /* §8.4.6 — nombre de facultés chaotiques : 1D6 divisé par 2, minimum une */
  nombreFacultesChaotiques(jetD6) { return Math.max(1, Math.floor(jetD6 / 2)); },
  /* §8.4.6.1 — la table des vingt facultés chaotiques (1D20) */
  faculteChaotique(jetD20) {
    const l = DONNEES.creatures.creation.facultes.table.lignes.find(x => x.num === jetD20);
    if (!l) throw new Error("faculté inconnue : " + jetD20);
    return l.faculte;
  },
  /* facultés à formule : §8.4.6.1 n°9 hypnose, n°13 flamme, n°14 poison */
  seuilHypnose(jetD100, pouSujet) { return jetD100 - pouSujet; },
  degatsFlammeFaculte(pou) { return Math.floor(pou / 2); },
  degatsPoisonFaculte(pouCreateur, pouVictime) { return pouCreateur - pouVictime; },

  /* §8.2-8.3 — retrouver un bloc de statistiques par son nom (animaux terrestres puis créatures du Chaos) */
  creature(nom) {
    const t = DONNEES.creatures.terrestres.liste.concat(DONNEES.creatures.chaos.liste)
      .find(x => x.nom === nom);
    if (!t) throw new Error("créature inconnue : " + nom);
    return t;
  },
  armureDe(nom) { return REGLES_SB.creature(nom).armure; },
  armeDe(nom, nomArme) {
    const a = REGLES_SB.creature(nom).armes.find(x => x.arme === nomArme);
    if (!a) throw new Error("arme inconnue chez " + nom + " : " + nomArme);
    return a;
  },
  /* §8.3 — la SAN coûte à voir une créature du Chaos : la ligne san du bloc (raté / réussi) */
  perteSanVoirCreature(nom, reussi, jet) {
    const s = REGLES_SB.creature(nom).san;
    if (!s) throw new Error("pas de jet de SAN pour " + nom);
    return reussi
      ? (typeof s.reussi === "number" ? s.reussi : REGLES_SB.perteDeTable(s.reussi, jet))
      : REGLES_SB.perteDeTable(s.rate, jet);
  },
  /* §8.3.1 — le dragon : griffes jamais inférieures à 40 % ; souffle = dégâts égaux au POU */
  griffeDragonPourcentage(jetD100) { return Math.max(40, jetD100); },
  degatsSouffleDragon(pou) { return pou; },
  /* §8.3.3 — l'Oonai : toujours SA chance de toucher, les dégâts de la créature imitée */
  oonaiDegats(nomImitee, nomArme) {
    return REGLES_SB.armeDe(nomImitee, nomArme).degats;
  },
  /* §8.2.10 — les trois jets en Eviter du loup : -1 par blessure mineure, -2 par blessure majeure ; à 0 il est sans défense */
  jetsEviterLoup(blessuresMineures, blessuresMajeures) {
    return Math.max(0, 3 - blessuresMineures - 2 * blessuresMajeures);
  },
  /* §8.2.16.1 — le cheval : -1D6 de DEX par cavalier par round ; DEX 0 → pas d'attaque */
  dexChevalCavaliers(dex, jetsD6) {
    const d = dex - jetsD6.reduce((s, j) => s + j, 0);
    return { dex: Math.max(0, d), peutAttaquer: d > 0 };
  },
  /* §8.2.16.2 — le sexe d'un cheval de guerre : 1-3 étalon, 4-5 jument, 6 hongre */
  sexeChevalDeGuerre(jetD6) {
    return jetD6 <= 3 ? "étalon" : (jetD6 <= 5 ? "jument" : "hongre");
  },
  /* §8.2.16.3 — le poney barbare : sur 5 ou 6, se bat comme un cheval de guerre */
  poneyBarbareCombat(jetD6) { return jetD6 >= 5; },
  /* §8.2.15.1 — le venin du serpent : 1D10 points pendant 1D6 rounds ; soigné avant l'effet → moitié ; immunité partielle → moitié (cumulables) */
  degatsVeninSerpent(jetD10, soigneAvantEffet, immunitePartielle) {
    let d = jetD10;
    if (soigneAvantEffet) d = Math.floor(d / 2);
    if (immunitePartielle) d = Math.floor(d / 2);
    return d;
  },
  /* §8.2.15.1 — porteur d'armure mordu : les crocs atteignent la chair sous 5 × POU */
  crocsAtteignentChair(jet, pou) { return jet <= 5 * pou; },
  /* §8.2.12 — le coup de queue du crocodilien : jet sauveur sous 2 × FOR sinon on tombe (attaque réduite de moitié au sol) */
  chuteCrocodilien(jetSauveur, forVictime) { return jetSauveur <= 2 * forVictime; },
  /* §8.3.6 — l'agonie psychique du géant des brumes : jet sous 3 × INT sinon perte de toute faculté de combattre */
  agonieGeantDesBrumes(jet, int) { return jet <= 3 * int; },
  /* §8.3.4 — le chien chasseur du Dharzi : -1 de DEX par point de dégât infligé, combat au maximum jusqu'à la mort */
  dexDharzi(dex, degatsInfliges) { return Math.max(0, dex - degatsInfliges); },
  /* §8.2-8.3 — la taille des meutes et groupes (le jet du dé correspondant est passé en paramètre) */
  meute(nomMeute, jet) {
    const f = {
      "Loups (rencontre imprévue)": () => jet,                     /* §8.2.10 : 1D20 loups */
      "Loups (meute moyenne)": () => jet + 3,                      /* §8.2.10 : 2D6 + 3 */
      "Chiens": () => jet,                                          /* §8.2.11 : 2D6 chiens */
      "Vautours": () => jet,                                        /* §8.2.9 : 3D6 vautours */
      "Chiens chasseurs du Dharzi": () => jet + 3,                  /* §8.3.4 : 2D10 + 3 */
      "Oonais": () => Math.floor(jet / 2),                         /* §8.3.3 : 1D100/2 */
      "Olabs (groupe)": () => jet + 10,                             /* §8.3.7 : 1D10 + 10 */
      "Olabs (tribu)": () => jet + 100,                             /* §8.3.7 : 1D100 + 100 */
      "Créatures de Matik (invocation)": () => jet                  /* §8.3.5 : 1D8 par charme */
    }[nomMeute];
    if (!f) throw new Error("meute inconnue : " + nomMeute);
    return f();
  },
  /* §8.2.14 — les requins : présence si le second 1D100 est inférieur ou égal au pourcentage de chance ; eau douce : chance divisée par 4 */
  requinsPresents(pourcentageChance, jetD100) { return jetD100 <= pourcentageChance; },
  chanceRequinsEauDouce(jetD100) { return Math.floor(jetD100 / 4); },
  /* §8.5 — l'invocation des habitants d'autres plans : niveau 4, équivaut à un Seigneur des Bêtes, INT + POU ≥ 44 */
  invocationAutresPlans(int, pou) { return int + pou >= 44; }


};

