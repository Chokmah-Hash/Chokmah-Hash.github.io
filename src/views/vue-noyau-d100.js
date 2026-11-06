/* ════════ La vue du noyau-d100 — UNIVERSELLE : modules déclarés par le sac ════════
   Une seule vue pour tous les packs d100, présents et à venir. Le sac
   (pack.contenu) déclare ce qui existe — demon+lutte (Stormbringer),
   forge+controle+paliers (Bloodlust)… — et la vue affiche les modules
   déclarés. Plus un seul pack.id dans le moteur : le pack raconte,
   le Core cuisine. */
function VueNoyauD100({ pack, onRetour, role, onJournal, table, joueur, avatar, consolePartie, salonJeu, versionBase, onAvatar, onLogout, persos, onCreerPersonnage, onSupprimerPersonnage, onModifierPersonnage, livreSb, persoChoisi, onChoisirPerso }) {
  const T = pack.theme;
  const C = pack.contenu; /* le sac de données du pack */
  const { journal, log, corrigerDernier } = useJournal(onJournal);
  const [enCreation, setEnCreation] = useState(false);
  /* V0.67 — LA STRUCTURE COMMUNE, la même ordonnance que le noyau-40k :
     entête au TITRE DU JEU, onglets LOBBY - AVENTURES - PERSONNAGES
     (joueur) - RÈGLES. Le terme TAVERNE devient le nom du LOBBY DE
     L'AVENTURE (la future page d'aventure). */
  const [onglet, setOnglet] = useState("lobby"); /* MJ et joueur y atterrissent */
  const [compteOuvert, setCompteOuvert] = useState(false);
  const [dernierDe, setDernierDe] = useState(null); /* la face du dernier d100, en chiffres */
  /* V0.77 — LE BRANCHEMENT À LA TABLE, DÈS LE PREMIER RENDU : la fiche
     NAÎT sur la prise (ou le premier du registre) — le rendu serveur
     montre déjà LE BON perso, et l'effet d'adoption ci-dessous ne garde
     la main que sur les CHANGEMENTS de prise (la fiche vivante garde
     la main sur le reste). Registre vide : null → fiche démo du pack. */
  const [persoCree, setPersoCree] = useState(() => {
    const liste0 = persos || [];
    const pris0 = persoChoisi || null;
    const ligne0 = (pris0 ? liste0.find(q => q.id === pris0) : null) || liste0[0];
    const p0 = ligne0 ? (ligne0.contenu || ligne0) : null;
    return (p0 && p0.caracs) ? p0 : null;
  }); /* perso né de la création ou du registre (remplace la fiche démo) */
  /* V0.74 — LE PERSO OUVERT DE LA TOMBE : quand la grande fiche vient
     du registre, ses gestes se gravent dans la pierre — sinon (fiche
     démo, création fraîche) l'équipement ne vit qu'à l'écran. */
  const [persoOuvert, setPersoOuvert] = useState(null);
  const perso = persoCree || C.perso;
  const c = perso.caracs;

  /* V0.74 — LA PHYSICALISATION DE L'ÉQUIPEMENT (Michael) : le fer et
     la protection sont des OBJETS PHYSIQUES — déséquiper les RANGENT
     dans le sac (le bandeau POSSESSION les montre, zone ÉQUIPEMENT
     RANGÉ, AVEC leurs caractéristiques — rien ne se perd), équiper
     ne se fait que la place libre (une arme, une armure). Le drapeau
     equipe vit sur l'objet ; une armure en chaîne de la Tombe (une
     simple string « Nom — reste ») se convertit en objet au premier
     geste. Le perso OUVERT grave chaque geste dans la Tombe. */
  const armesEquipees = (perso.armes || []).filter(a => a.equipe !== false);
  const armesRangees = (perso.armes || []).filter(a => a.equipe === false);
  const armuresEquipees = (perso.armures || []).filter(a => (typeof a === "object" ? a.equipe !== false : true));
  const armuresRangees = (perso.armures || []).filter(a => typeof a === "object" && a.equipe === false);
  const majPersoAffiche = (changement) => {
    const nouveau = { ...perso, ...changement };
    setPersoCree(nouveau);
    if (persoOuvert && onModifierPersonnage) onModifierPersonnage({ ...persoOuvert, contenu: nouveau });
  };
  const desequiperArme = (a) => majPersoAffiche({ armes: (perso.armes || []).map(x => x === a ? { ...x, equipe: false } : x) });
  const equiperArme = (a) => { if (armesEquipees.length === 0) majPersoAffiche({ armes: (perso.armes || []).map(x => x === a ? { ...x, equipe: true } : x) }); };
  const desequiperArmure = (a) => {
    /* une armure de la Tombe peut être une simple string : au premier
       geste elle devient objet — nom, reste, drapeau. */
    const objet = typeof a === "object" ? a : (function () {
      const sep = String(a).indexOf(" — ");
      return sep > 0 ? { nom: String(a).slice(0, sep), reste: String(a).slice(sep + 3), equipe: false } : { nom: String(a), reste: "", equipe: false };
    })();
    majPersoAffiche({ armures: (perso.armures || []).map(x => x === a ? { ...objet, equipe: false } : x) });
  };
  const equiperArmure = (a) => { if (armuresEquipees.length === 0) majPersoAffiche({ armures: (perso.armures || []).map(x => x === a ? { ...x, equipe: true } : x) }); };
  const ouvrirPersoDuRegistre = (p) => {
    /* la grande fiche prend le perso de la Tombe — et se lie à la
       pierre : chaque geste d'équipement se gravera dedans. */
    setPersoOuvert(p);
    setPersoCree(p.contenu);
    setEnCreation(false);
    if (p.contenu && p.contenu.sanMax) setSan(p.contenu.sanMax);
  };

  /* V0.69 — POUVOIRS D'INVOCATION GAGNÉS : n'afficher que les
     pouvoirs OFFICIELS du livre gravé (Michael : « pour l'instant
     affiche que les officiels »). Le livre connaît les pouvoirs
     démoniaques (§5.7.1), les esprits élémentaires (§5.4, au
     singulier comme au pluriel — Sylphe, Gnome...) et les Seigneurs
     (§5.9, §5.10) ; un pouvoir du personnage qui n'y figure pas a
     été gagné en aventure (maison) et attendra sa gravure. Tant que
     le livre d'un pack qui en déclare un n'est pas chargé, on
     n'affiche rien plutôt que de flasher les pouvoirs maison. */
  const pouvoirsGagnes = (function () {
    const ps = perso.pouvoirs || [];
    if (livreSb && livreSb.sorcellerie) {
      const S = livreSb.sorcellerie;
      const noms = new Set();
      const ajouter = (n) => { if (n) noms.add(String(n).trim().toLowerCase()); };
      [].concat(
        (S.pouvoirsDemoniaques && S.pouvoirsDemoniaques.defenseurs) || [],
        (S.pouvoirsDemoniaques && S.pouvoirsDemoniaques.offensifs) || [],
        S.pouvoirsDeplacement || [], S.pouvoirsPerception || [], S.pouvoirsDivers || []
      ).forEach(function (p) { ajouter(p.nom); });
      Object.values((S.elementaires && S.elementaires.esprits) || {}).forEach(function (e) {
        const pluriel = String(e).toLowerCase();
        noms.add(pluriel); noms.add(pluriel.replace(/s$/, ""));
      });
      ((S.seigneursElementaires && S.seigneursElementaires.seigneurs) || []).forEach(function (s) { ajouter(s.nom); });
      ((S.seigneursDesBetes && S.seigneursDesBetes.table) || []).forEach(function (s) { ajouter(s.nom); });
      return ps.filter(function (p) { return noms.has(String(p).trim().toLowerCase()); });
    }
    return pack && pack.livre ? [] : ps;
  })();

  /* — sources de jets : déclarées par le pack (caracs brutes, multiplicateurs,
     compétences). Un pack à paliers (Bloodlust) joue ses compétences avec
     modificateurs de palier ; un pack à sources joue tout sous %. — */
  /* V0.61 — LES THÈMES DE LA FICHE : quand le pack déclare ses familles
     (Stormbringer : CONNAISSANCE, INVOCATION, PERCEPTION…), chaque compétence
     se range SOUS SON THÈME — fiche et sélecteur de jets parlent le langage
     du manuel. L'ordre des thèmes = l'ordre déclaré ; les compétences non
     répertoriées restent visibles en fin, sous « AUTRES ». */
  const themesComps = C.themesCompetences || null;
  const ordreThemes = themesComps ? Object.keys(themesComps) : [];
  const familleDe = {};
  if (themesComps) ordreThemes.forEach(t => themesComps[t].forEach(k => { familleDe[k] = t; }));
  /* V0.62 — LES BONUS DE FAMILLE DU LIVRE V2 (§2.5) : calculés purs depuis
     les caracs — +1 %/pt au-dessus de 12, −1 %/pt en dessous de 9, la TAI
     s'inverse pour Parade, Agilité et Discrétion. La Connaissance vaut
     double (2 %/pt d'INT au-dessus de 12) et grandit avec l'âge : 1 %/an
     au-delà de 25 ans (Nobles 2, Prêtres 3 — la fiche porte son taux dans
     bonusConnaissanceAge). Si la fiche change, les bonus suivent. */
  const bonusFamilles = (C.bonusCompetences === "stormbringer-v2" && perso.caracs) ? (() => {
    const cr = perso.caracs;
    const plus = k => (cr[k] > 12 ? cr[k] - 12 : cr[k] < 9 ? 9 - cr[k] : 0);
    const inv = k => (cr[k] > 12 ? 12 - cr[k] : cr[k] < 9 ? 9 - cr[k] : 0); /* TAI inversée */
    const age = (perso.identite && perso.identite.age) || 25;
    const tauxAge = perso.bonusConnaissanceAge || 1;
    return {
      "DISCRÉTION": plus("INT") + plus("DEX") + inv("TAI"),
      "AGILITÉ": plus("FOR") + plus("POU") + plus("DEX") + inv("TAI"),
      "MANIPULATION": plus("FOR") + plus("INT") + plus("POU") + plus("DEX"),
      "PERCEPTION": plus("INT") + plus("POU"),
      "CONNAISSANCE": Math.max(0, cr.INT - 12) * 2 + Math.max(0, age - 25) * tauxAge,
      "COMMUNICATION": plus("CHA") + plus("INT") + plus("POU"),
      attaque: plus("FOR") + plus("INT") + plus("POU") + plus("DEX"),
      parade: plus("FOR") + plus("POU") + plus("DEX") + inv("TAI")
    };
  })() : null;
  /* V0.62/V0.68 — LE SEUIL EFFECTIF d'une compétence : son score si elle
     est apprise ; sinon le bonus de sa famille — V0.68, règle de la
     table : TOUT 0 % se joue à 0 + bonus de famille, y compris les
     compétences « à enseigner par un maître d'abord » du livre v2
     (Michael l'a tranché : elles servent). La ligne de fiche, elle,
     porte toujours le SCORE — 0 % non appris, jamais le seuil. */
  const departDe = (themesComps && C.departCompetences) ? C.departCompetences : null;
  const modeComplet = !!(departDe && bonusFamilles);
  const seuilComp = k => {
    const v = (perso.competences || {})[k];
    if (v != null && v > 0) return v;
    /* V0.68 — LA RÈGLE DE LA TABLE : tout 0 % se joue à 0 + bonus de
       famille — même les compétences que le livre disait « à enseigner
       par un maître d'abord » : elles servent, Michael l'a tranché.
       La fiche affiche le SCORE (0 %), le bonus ne se lit pas sur la
       ligne — il vit dans le jet. */
    if (bonusFamilles && familleDe[k] && bonusFamilles[familleDe[k]] != null) {
      return bonusFamilles[familleDe[k]];
    }
    return (v != null && v > 0) ? v : null;
  };
  const compsBruts = Object.keys(perso.competences || {});
  /* V0.62 — LE CATALOGUE ENTRE EN SCÈNE : toutes les compétences du manuel
     non apprises rejoignent la liste — « bonus »/« 10+ » se tirent sur le
     seuil de leur famille et s'affichent discrètement ; les « 0 % »
     restent visibles sur la fiche (« — », l'entraînement d'abord) mais ne
     tirent jamais. */
  const extrasCatalogue = modeComplet
    ? ordreThemes.flatMap(t => themesComps[t]).filter(k => !(k in (perso.competences || {})) && (departDe[k] === "bonus" || departDe[k] === "10+" || departDe[k] === "0"))
    : [];
  const comps = themesComps
    ? [
        ...compsBruts.filter(k => familleDe[k]).sort((a, b) => ordreThemes.indexOf(familleDe[a]) - ordreThemes.indexOf(familleDe[b]) || themesComps[familleDe[a]].indexOf(a) - themesComps[familleDe[b]].indexOf(b)),
        ...compsBruts.filter(k => !familleDe[k]),
        ...extrasCatalogue
      ]
    : compsBruts;
  /* V0.62/V0.68 — au jet, une compétence non apprise se joue sur le
     bonus de sa famille (tout 0 % sert) ; seule une compétence sans
     famille bonusée reste hors sélecteur. Hors catalogue :
     byte-pour-byte la liste d'avant. */
  const compsJet = modeComplet ? comps.filter(k => seuilComp(k) > 0) : comps;
  const sources = [
    ...(C.ordreCaracs || Object.keys(c)).map(k => ({ label: `${k} ${c[k]} — carac brute (${c[k]} %)`, seuil: c[k] })),
    ...(C.mults || []).map(m => ({ label: `${m.carac}×${m.mult} — ${m.label} (${c[m.carac] * m.mult} %)`, seuil: c[m.carac] * m.mult })),
    ...compsJet.map(k => {
      const s = modeComplet ? seuilComp(k) : perso.competences[k];
      return { label: `${k} (${s} %)`, seuil: s };
    })
  ];
  /* L'index dans sources d'une compétence k — pour le sélecteur groupé
     (V0.62 : l'index court sur compsJet, la liste réellement au jet) */
  const srcIdxDe = k => (C.ordreCaracs || Object.keys(c)).length + (C.mults || []).length + compsJet.indexOf(k);
  const [srcIdx, setSrcIdx] = useState(0);
  const [compIdx, setCompIdx] = useState(0);
  const [palierIdx, setPalierIdx] = useState(2);

  /* — Santé Mentale (si le pack en déclare une : SAN = POU×5) —
     V0.60 : si la fiche porte sa SAN COURANTE, c'est ELLE qui s'affiche
     (Mad Marthygann : 99/175), pas le maximum du perso de démo. */
  const [san, setSan] = useState(perso.san != null ? perso.san : (perso.sanMax || 0));
  const [ronde, setRonde] = useState(0);
  const [lutteFinie, setLutteFinie] = useState(null);

  /* ════════ V0.60 — LA FICHE DE LA TOMBE ════════
     Le noyau d100 adopte le personnage du REGISTRE du joueur pour ce
     pack (le premier de la liste) dès l'entrée — la fiche démo du pack
     ne survit que si la Tombe ne connaît personne. Le noyau 40k restaure
     depuis la table de partie ; le d100, lui, adopte son registre :
     solo ou en partie, la fiche de la Tombe est la sienne. */
  /* ════════ V0.77 — LE BRANCHEMENT À LA TABLE (d100) ════════
     Le perso PRIS POUR L'AVENTURE devient la fiche : l'adoption
     suit la sélection (Michael a tranché : changer de prise ÉCRASE
     la fiche affichée, même née du rituel). Un changement qui ne
     touche pas la sélection (le registre s'allonge d'une création)
     n'écrase RIEN — la fiche vivante garde la main. Registre vide :
     la fiche démo ou la création reste. Sans prise : le premier de
     la liste, comme toujours. */
  const dernierPrisRef = useRef(undefined);
  useEffect(() => {
    const liste = persos || [];
    const pris = persoChoisi || null;
    const prisAChange = dernierPrisRef.current !== pris;
    dernierPrisRef.current = pris;
    if (!prisAChange && persoCree) return;
    if (!liste.length) return;
    const ligne = (pris ? liste.find(q => q.id === pris) : null) || liste[0];
    const p = ligne.contenu || ligne;
    if (!p || !p.caracs) return;
    setPersoCree(p);
    setSan(p.san != null ? p.san : (p.sanMax || 0));
  }, [persos && persos.length, persoChoisi]); /* eslint-disable-line */

  /* — la forge de l'Arme vivante (si le pack en déclare une) — */
  const [pts, setPts] = useState(C.forge ? C.forge.base : 0);
  const [acquis, setAcquis] = useState([]);
  const [jetsTable, setJetsTable] = useState({});    /* tableId → jets consommés */
  const [forge, setForge] = useState(null);          /* { a, b, tableId } — chiffres tirés, ordre à choisir */
  const [choixLibre, setChoixLibre] = useState(null);/* { tableId } — « Au choix du joueur » */
  const [armeEveillee, setArmeEveillee] = useState(false);
  const prestige = C.tablesForge
    ? C.tablesForge.reduce((s, tb) => s + tb.prestige * acquis.filter(p => p.tableId === tb.id).length, 0)
    : 0;

  /* La lutte de POU (surcharge déclarée : base ± pas par point d'écart) */
  const lutterPOU = () => {
    const ecart = C.demon.pou - c.POU;
    const pJ = C.lutte.base - C.lutte.pas * ecart, pD = C.lutte.base + C.lutte.pas * ecart;
    const rJ = resoudreD100(pJ, 0, C.critiques, pack.noyau), rD = resoudreD100(pD, 0, C.critiques, pack.noyau);
    log("pou.jet", `Lutte de POU (round ${ronde + 1}) — ${perso.nom} ${pJ} % → ${fmtD100(rJ.de)}${rJ.nat ? " · " + rJ.nat : ""} ; ${C.demon.nom} ${pD} % → ${fmtD100(rD.de)}${rD.nat ? " · " + rD.nat : ""}`);
    if (rJ.reussi && !rD.reussi) {
      setLutteFinie("victoire"); setRonde(0);
      log("pou.victoire", "L'octogone tient — le démon est renvoyé au plan d'où il vient");
    } else if (rD.reussi && !rJ.reussi) {
      const perte = d6();
      const nv = Math.max(0, san - perte);
      setSan(nv); setLutteFinie("defaite"); setRonde(0);
      log("pou.defaite", `Le démon brise la lutte — ${perte} SAN perdus (${nv}/${perso.sanMax})`);
      if (nv === 0) log("san.perdu", `SAN à zéro — l'âme de ${perso.nom} vacille… (un repos la restaurera, squelette alpha)`);
    } else {
      setRonde(r => r + 1);
      log("pou.tension", "Les deux volontés tiennent — la lutte continue");
    }
  };
  const reposerSAN = () => {
    setSan(perso.sanMax);
    log("san.repos", `Repos — Santé Mentale de ${perso.nom} restaurée (squelette alpha)`);
  };

  /* La forge (tables officielles du pack ; total > budget → l'arme s'éveille) */
  const lancerForge = (tableId) => {
    if (armeEveillee) return;
    const t = C.tablesForge.find(x => x.id === tableId);
    if (!t || (t.max !== null && (jetsTable[tableId] || 0) >= t.max)) return;
    const a = Math.floor(Math.random() * 10), b = Math.floor(Math.random() * 10);
    setForge({ a, b, tableId });
    log("forge.des", `Forge d'${C.forge.nom} (${t.nom}) — d% tiré : ${a} et ${b} — le joueur choisit l'ordre des chiffres (la règle d'or du livre :D)`);
  };
  const ajouterPouvoir = (tableId, cle, pouvoir) => {
    if (acquis.some(p => p.tableId === tableId && p.nom === pouvoir.nom)) {
      log("forge.refus", `${pouvoir.nom} — déjà possédé : un même pouvoir ne s'acquiert qu'une fois, relancez`);
      return;
    }
    const t = C.tablesForge.find(x => x.id === tableId);
    const prixN1 = pouvoir.prix[0];
    const nvPts = pts + prixN1;
    const nvAcquis = [...acquis, { cle, tableId, nom: pouvoir.nom, prix: prixN1 }];
    const prestigeNv = C.tablesForge.reduce((s, tb) => s + tb.prestige * nvAcquis.filter(p => p.tableId === tb.id).length, 0);
    setJetsTable(j => ({ ...j, [tableId]: (j[tableId] || 0) + 1 }));
    setAcquis(nvAcquis);
    setPts(nvPts);
    log("forge.achat", `${t.nom} ${fmtD100(cle)} — ${pouvoir.nom} · ${prixN1 > 0 ? "+" : ""}${prixN1} → total ${nvPts}/${C.forge.budget}`);
    if (nvPts > C.forge.budget && !armeEveillee) {
      setArmeEveillee(true);
      log("forge.fin", `Total ${nvPts} > ${C.forge.budget} — ${C.forge.nom} s'ÉVEILLE — l'épée est terminée (prestige de l'arme : ${prestigeNv} pts — nouveaux pouvoirs uniquement en jeu)`);
    }
  };
  const choisirOrdreForge = (premier) => {
    const { a, b, tableId } = forge;
    const t = C.tablesForge.find(x => x.id === tableId);
    setForge(null);
    const n = premier === "a" ? a * 10 + b : b * 10 + a;
    const cle = n === 0 ? 100 : n;
    const trouve = t.table.find(p => cle >= p.de[0] && cle <= p.de[1]);
    if (!trouve) return;
    if (trouve.prix === null) {
      setChoixLibre({ tableId });
      setJetsTable(j => ({ ...j, [tableId]: (j[tableId] || 0) + 1 }));
      log("forge.choix", `d% = ${fmtD100(cle)} — « Au choix du joueur » : le porteur désigne un pouvoir de la table ${t.nom}`);
      return;
    }
    ajouterPouvoir(tableId, cle, trouve);
  };

  /* La validation de création — la ligne de journal est une recette du pack */
  const validerCreation = (p) => {
    setPersoCree(p);
    setEnCreation(false);
    if (p.sanMax) setSan(p.sanMax);
    /* La recette de journal est un GABARIT du pack : l'écran calcule les
       valeurs selon le type de perso (aventurier Stormbringer vs porteur). */
    const vals = p.sanMax
      ? { ...p, total: (C.ordreCaracs || []).reduce((s, k) => s + (p.caracs[k] || 0), 0), pou: p.caracs.POU }
      : { ...p, pv: p.caracs.EN * 2, controle: p.caracs.VO * 5 };
    log("perso.creation", rendreGabarit(C.journalCreation, vals));
  };

  /* Le test de contrôle de l'Arme (carac × mult, déclarés par le pack) */
  const testerControle = () => {
    const seuil = perso.caracs[C.controle.carac] * C.controle.mult;
    const r = resoudreD100(seuil, 0, C.critiques, pack.noyau);
    log("controle.jet", `Test de contrôle — ${C.controle.carac} ${perso.caracs[C.controle.carac]} ×${C.controle.mult} = ${seuil} % → ${fmtD100(r.de)}${r.nat ? " · " + r.nat : ""} — ${r.reussi ? "réussi" : "ÉCHOUÉ"}`);
    if (r.reussi) log("controle.ok", `${perso.nom} garde la main — la lame rumuse, mais elle obéit`);
    else log("controle.perdu", `${C.forge.nom} prend le dessus — ce round, c'est la Violence qui décide 😈`);
  };

  /* Jet libre étiqueté (la primitive du noyau-d100, recette du pack) */
  const jetLibre = () => {
    if (C.paliers) {
      const comp = comps[compIdx];
      const seuil = perso.competences[comp];
      const p = C.paliers[palierIdx];
      const r = resoudreD100(seuil, p.mod, C.critiques, pack.noyau);
      setDernierDe({ de: r.de, reussi: r.reussi, nat: r.nat });
      const modTxt = p.mod > 0 ? "+" + p.mod : p.mod < 0 ? "−" + Math.abs(p.mod) : "±0";
      log("libre.jet", `Jet libre — ${comp} ${seuil} % (${p.label} ${modTxt}) → seuil ${r.sFinal} % → ${fmtD100(r.de)}${r.nat ? " · " + r.nat : ""} — ${r.reussi ? "RÉUSSI" : "ÉCHOUÉ"}`);
    } else {
      const src = sources[srcIdx];
      const r = resoudreD100(src.seuil, 0, C.critiques, pack.noyau);
      setDernierDe({ de: r.de, reussi: r.reussi, nat: r.nat });
      log("libre.jet", `Jet libre — ${src.label} → ${fmtD100(r.de)}${r.nat ? " · " + r.nat : ""} — ${r.reussi ? "RÉUSSI" : "ÉCHOUÉ"}`);
    }
  };

  const nbCaracs = Object.keys(c).length;
  const EcranCreation = { aventurier: EcranCreationAventurier, porteur: EcranCreationPorteur }[C.creation];

  /* V0.51/57 — l'icône du joueur SEULE (le halo dit le rôle) ; le clic
     ouvre le cadre COMPTE — CLOUD, exactement comme dans le hub. */
  const haloRole = role === "mj" ? "#f0b24a" : "#2ee6c9";
  const compte = joueur && avatar ? (
    <CompteJoueur joueur={joueur} avatar={avatar} onAvatar={onAvatar} avatarSeul
      ouvert={compteOuvert} onOuvert={() => setCompteOuvert(o => !o)} onLogout={onLogout}
      halo={haloRole} />
  ) : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.fond, fontFamily: "'Rajdhani','Segoe UI',system-ui,sans-serif" }}>
      <div className="max-w-4xl mx-auto px-5 py-6 w-full flex flex-col flex-1">
        {/* V0.57 — l'entête de partie : le même style que le hub pour
            tous les JDR Multi (icône joueur seule, halo du rôle). */}
        <EntetePartie pack={pack} role={role} joueur={joueur} avatar={avatar} compte={compte} />

        {/* V0.67 — LA STRUCTURE COMMUNE : les onglets des pages de jeu,
            la même ordonnance que le noyau-40k — LOBBY d'abord (le salon
            du JDR), puis AVENTURES, PERSONNAGES (joueur seul : le registre
            du compte puis la fiche), RÈGLES à droite. */}
        <div className="flex gap-1 mb-5" style={{ borderBottom: "1px solid #27272a" }}>
          {(role === "mj"
            ? [["lobby", "LOBBY"], ["aventures", "AVENTURES"], ["regles", "RÈGLES"]]
            : [["lobby", "LOBBY"], ["aventures", "AVENTURES"], ["personnages", "PERSONNAGES"], ["regles", "RÈGLES"]]
          ).map(([id, lbl]) => (
            <button key={id} onClick={() => setOnglet(id)}
              className="px-4 py-2 text-sm font-bold tracking-wider"
              style={{
                background: onglet === id ? "#ffffff0d" : "transparent",
                border: "none", borderBottom: "2px solid " + (onglet === id ? T.accent : "transparent"),
                color: onglet === id ? T.accent : "#71717a", cursor: "pointer"
              }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* V0.66/V0.67 — LE LOBBY : LE SALON DU JEU, l'endroit où joueurs
            et MJ se réunissent AVANT de lancer une aventure (comme le
            LOBBY de Protocole Ω) — le canal du JDR, vivant dès l'ouverture
            du jeu, sans attendre une partie. La console d'AVENTURE vivra
            sur la page de l'aventure, quand elle existera — son lobby
            d'aventure s'appellera « La Taverne ». Le Jet de Dés reviendra
            avec les panneaux de l'intégration visuelle. */}
        {onglet === "lobby" && (
          <ChatSalon titre={"SALON — " + pack.nom} fil={(salonJeu && salonJeu.fil) || []}
            onEnvoyer={(salonJeu && salonJeu.onEnvoyer) || (() => {})} joueur={(salonJeu && salonJeu.joueur) || joueur}
            enEnvoi={salonJeu && salonJeu.enEnvoi} presents={(salonJeu && salonJeu.presents) || []}
            remplir={true} accent={T.accent} />
        )}

        {/* AVENTURES — V0.67 : la structure commune la pose ; le moteur
            d'aventures du d100 viendra avec la page d'aventure. */}
        {onglet === "aventures" && (
          <div className="rounded-xl p-6 text-center" style={{ background: "#ffffff08", border: "1px solid " + T.accent + "33" }}>
            <div className="font-bold mb-2" style={{ color: T.or }}>AVENTURES</div>
            <div className="text-sm" style={{ color: "#71717a" }}>
              Coming soon — les aventures se lanceront ici ; leur lobby d'aventure s'appellera « La Taverne ».
            </div>
          </div>
        )}

        {/* RÈGLES — V0.67 : la structure commune la pose ; le manuel du
            jeu s'ouvrira ici (le lecteur de documents du pack). */}
        {onglet === "regles" && (
          <div className="rounded-xl p-6 text-center" style={{ background: "#ffffff08", border: "1px solid " + T.accent + "33" }}>
            <div className="font-bold mb-2" style={{ color: T.or }}>RÈGLES</div>
            <div className="text-sm" style={{ color: "#71717a" }}>Coming soon — le manuel du jeu s'ouvrira ici.</div>
          </div>
        )}

        {/* PERSONNAGES — V0.67 : l'onglet du joueur de la structure
            commune — le REGISTRE du compte pour ce jeu (composant commun,
            comme l'écran de partie du 40k), puis la fiche : création,
            fiche, modules du pack. L'onglet JOURNAL a déménagé (V0.67). */}
        {onglet === "personnages" && (
        <>
        <div className="mb-5">
          <RegistrePersonnages pack={pack} persos={persos || []} onCreer={onCreerPersonnage} onSupprimer={onSupprimerPersonnage} onOuvrir={ouvrirPersoDuRegistre} livre={livreSb} persoChoisi={persoChoisi} onChoisir={onChoisirPerso} />
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-5">
          {enCreation && EcranCreation ? (
            <div className="md:col-span-2">
              <EcranCreation contenu={C} accent={T.accent} livre={livreSb} onValide={validerCreation} onAnnule={() => setEnCreation(false)} />
            </div>
          ) : (
          <>
            {/* Fiche — générique : caracs, compétences, modules déclarés.
                V0.73 — CINQ BLOCS DISTINCTS (Michael) : la grande carte
                unique devient CINQ cadres séparés — ① identité +
                caractéristiques en légendes + jauges, ② ARMES - ARMURES,
                ③ colonnes des compétences, ④ POSSESSION, ⑤ NOTES.
                « fiche-impression » enveloppe les cinq : la cible du
                CSS print — papier clair, seul le contenu de la fiche
                s'imprime ; space-y-4 respire entre les blocs. */}
            <div className="md:col-span-2 fiche-impression space-y-4">
              {/* ════════ BLOC 1 — IDENTITÉ · CARACTÉRISTIQUES · JAUGES ════════ */}
              <div className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid " + T.accent + "33" }}>
              <div className="flex items-baseline justify-between mb-3">
                <div className="font-bold text-lg" style={{ color: T.accent }}>{perso.nom}</div>
                <div className="text-xs" style={{ color: "#71717a" }}>{perso.origine || perso.peuple}</div>
              </div>

              {/* ════════ V0.71 — BANDEAU 1 : L'IDENTITÉ COMPACTE ════════
                 La disposition de la vraie fiche papier (Michael) :
                 le Nom vit en tête de fiche, les six autres champs
                 en RANGÉES — pas en pile. Les champs que la fiche ne
                 porte pas (encore) se lisent « — » — l'écran de
                 création les demandera dans le chantier suivant. */}
              <div className="text-[11px] font-bold tracking-widest mb-1" style={{ color: T.accent }}>PERSONNAGE</div>
              <div className="grid grid-cols-3 gap-x-4 text-xs mb-3">
                {[
                  ["Sexe", perso.identite ? perso.identite.sexe : null],
                  ["Age", perso.identite && perso.identite.age != null ? perso.identite.age : null],
                  ["Yeux", perso.identite ? perso.identite.yeux : null],
                  ["Cheveux", perso.identite ? perso.identite.cheveux : null],
                  ["Nationalité", perso.nationalite || (perso.identite ? perso.identite.nationalite : null)],
                  ["Culte", perso.culte || (perso.identite ? perso.identite.culte : null)]
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1" style={{ borderBottom: "1px solid #ffffff08" }}>
                    <span style={{ color: "#71717a" }}>{k} :</span>
                    <span style={{ color: "#e8e4d8" }}>{v != null && v !== "" ? v : "—"}</span>
                  </div>
                ))}
              </div>

              {/* ════════ BLOC 1 : CARACTÉRISTIQUES + JAUGES ════════
                 V0.73 — LES CARACTÉRISTIQUES EN UNE SEULE LIGNE DE
                 LÉGENDES (Michael) : chaque caractéristique vit dans
                 un petit cadre qui porte son nom posé SUR le trait —
                 le <legend> natif du <fieldset> interrompt la bordure
                 tout seul, sans bricolage de couleur. PUIS les trois
                 jauges : Points de Vie EN CASES, Santé Mentale en
                 barre, et le S.F.T (Seuil de Folie Temporaire —
                 moitié de la SAN initiale, un seuil et non une jauge :
                 il se lit, il ne se vide pas). */}
              {themesComps && (
                <div className="text-[11px] font-bold tracking-widest mb-1" style={{ color: T.accent }}>CARACTÉRISTIQUES</div>
              )}
              <div className="grid grid-cols-7 gap-1.5">
                {Object.entries(c).map(([k, v]) => (
                  <fieldset key={k} className="rounded text-center" style={{ border: "1px solid " + T.accent + "33", borderRadius: 8, padding: "6px 2px 4px", margin: 0 }}>
                    <legend className="text-[10px] tracking-widest" style={{ color: "#a1a1aa", padding: "0 4px" }}>{k}</legend>
                    <div className="text-sm" style={{ color: "#e8e4d8" }}>{v}</div>
                  </fieldset>
                ))}
              </div>
              {perso.pv != null && (
                /* V0.73 — LES POINTS DE VIE EN CASES (Michael) : 16 PV
                   = 16 cases à rayer — PvBarre les rend déjà ; la classe
                   pv-pleine distingue les pleines sur papier clair. */
                <div className="mt-2">
                  <div className="text-xs mb-1" style={{ color: "#71717a" }}>
                    Points de Vie — {perso.pv} / {perso.pvMax || perso.pv} PV — blessure majeure à {perso.blessureMajeure || Math.floor((perso.pvMax || perso.pv) / 2)}
                  </div>
                  <PvBarre pv={perso.pv} pvMax={perso.pvMax || perso.pv} accent="#e0524d" />
                </div>
              )}
              {perso.sanMax ? (
                <div className="mt-2">
                  <div className="text-xs mb-1" style={{ color: "#71717a" }}>Santé Mentale — POU×5 ({perso.sanMax})</div>
                  <BarrePct valeur={san} max={perso.sanMax} accent={T.accent} label={`${san} / ${perso.sanMax} SAN`} />
                </div>
              ) : null}
              {perso.sft != null && (
                <div className="text-xs mt-1" style={{ color: "#a1a1aa" }}>S.F.T — {perso.sft}</div>
              )}
              {C.derivees && (
                <div className="flex gap-2 mt-2 text-center text-xs">
                  {C.derivees.map(d => (
                    <div key={d.label} className="flex-1 rounded py-1.5" style={{ background: "#ffffff0d", color: "#e8e4d8" }}>
                      {d.label} <b>{c[d.source] * d.mult}{d.suffixe || ""}</b>
                    </div>
                  ))}
                </div>
              )}
              </div>

              {/* ════════ BLOC 2 — ARMES - ARMURES EN DEUX COLONNES (Michael)
                 : les ARMES à gauche, les ARMURES à droite — une carte
                 par objet (V0.70), le nom en gras, ses caractéristiques
                 à la suite ; l'entête porte les bonus d'ATTAQUE et de
                 PARADE de la famille. V0.73 : CADRE SÉPARÉ. */}
              {(perso.armes && perso.armes.length > 0) || (perso.armures && perso.armures.length > 0) ? (
                <div className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid " + T.accent + "33" }}>
                  <div className={"mb-1 " + (themesComps ? "text-[11px] font-bold tracking-widest" : "text-xs")} style={{ color: themesComps ? T.accent : "#71717a" }}>{themesComps ? "ARMES - ARMURES" + (bonusFamilles ? " — ATTAQUE +" + bonusFamilles.attaque + " · PARADE +" + bonusFamilles.parade : "") : "Armes - Armures"}</div>
                  <div className="grid md:grid-cols-2 gap-2">
                    {perso.armes && perso.armes.length > 0 && (
                      <div>
                        <div className="text-[10px] mb-1" style={{ color: "#71717a" }}>ARMES</div>
                        {/* V0.74 — seules les armes ÉQUIPÉES vivent ici ;
                            les rangées sont dans le sac (POSSESSION). */}
                        {armesEquipees.map(a => (
                          <div key={a.nom} className="mt-1 rounded p-2 text-xs flex items-center justify-between gap-2" style={{ background: "#ffffff08", color: "#c8c8ce" }}>
                            <span><b style={{ color: "#e8e4d8" }}>{a.nom}</b> · {a.seuil}{a.degats ? " · " + a.degats : ""}{a.bonus ? " · +" + a.bonus : ""}</span>
                            <button onClick={() => desequiperArme(a)} className="print:hidden px-2 py-1 rounded text-[10px] font-bold shrink-0"
                              style={{ background: "#a8adb814", color: "#a8adb8", border: "1px solid #3f3f46", cursor: "pointer" }}>↓ DÉSÉQUIPER</button>
                          </div>
                        ))}
                        {armesEquipees.length === 0 && (
                          <div className="mt-1 rounded p-2 text-xs" style={{ background: "#ffffff08", color: "#71717a" }}>À mains nues — le fer est rangé dans le sac.</div>
                        )}
                      </div>
                    )}
                    {perso.armures && perso.armures.length > 0 && (
                      <div>
                        <div className="text-[10px] mb-1" style={{ color: "#71717a" }}>ARMURES</div>
                        {/* V0.74 — mêmes lois pour la protection : une
                            armure de la Tombe (string « Nom — reste »)
                            se lit comme l'objet qu'elle deviendra au
                            premier geste. */}
                        {armuresEquipees.map((a, i) => {
                          const sep = String(a).indexOf(" — ");
                          const nom = typeof a === "object" ? a.nom : (sep > 0 ? String(a).slice(0, sep) : String(a));
                          const reste = typeof a === "object" ? (a.reste || "") : (sep > 0 ? String(a).slice(sep + 3) : "");
                          return (
                            <div key={i} className="mt-1 rounded p-2 text-xs flex items-center justify-between gap-2" style={{ background: "#ffffff08", color: "#c8c8ce" }}>
                              <span><b style={{ color: "#e8e4d8" }}>{nom}</b>{reste ? " · " + reste : ""}</span>
                              <button onClick={() => desequiperArmure(a)} className="print:hidden px-2 py-1 rounded text-[10px] font-bold shrink-0"
                                style={{ background: "#a8adb814", color: "#a8adb8", border: "1px solid #3f3f46", cursor: "pointer" }}>↓ DÉSÉQUIPER</button>
                            </div>
                          );
                        })}
                        {armuresEquipees.length === 0 && (
                          <div className="mt-1 rounded p-2 text-xs" style={{ background: "#ffffff08", color: "#71717a" }}>Sans armure — la protection est rangée dans le sac.</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* ════════ BLOC 3 — LE MILIEU DE FICHE (Michael) : tout le
                 reste — les FAMILLES de compétences (une cellule
                 chacune, dans l'ordre du manuel), les pouvoirs du
                 repli, les désirs — vit en COLONNES ÉQUILIBRÉES :
                 le flux de l'impression (md:columns-2), chaque
                 famille descend la première colonne puis remplit la
                 seconde — FINI les vides d'alignement des rangées de
                 grille (INVOCATION ne tire plus COMMUNICATION vers
                 le bas) ; break-inside-avoid garde chaque famille
                 entière, mb-3 respire entre elles. CADRE SÉPARÉ
                 (V0.73) — absent si la fiche n'a rien à y mettre. */}
              {(perso.competences || perso.desirs || (perso.pouvoirs && perso.pouvoirs.length > 0)) ? (
                <div className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid " + T.accent + "33" }}>
              <div className="md:columns-2 print:columns-2 gap-4">
              {perso.competences && themesComps ? (
                /* V0.62 — LE CATALOGUE COMPLET : chaque compétence rangée sous
                   sa famille, dans l'ordre du manuel — les apprises pleines,
                   celles du catalogue non apprises en discret avec leur seuil
                   de jet (le bonus de famille, ou 10 + bonus), les « 0 % »
                   marquées « — » (un maître d'abord). Les non-classées vivent
                   sous « AUTRES » ; l'entête porte le bonus de la famille
                   calculé depuis les caracs (livre v2, §2.5). V0.72 : chaque
                   FAMILLE devient une CELLULE du milieu de fiche (le
                   fragment ne crée pas de DOM — les familles se posent
                   DIRECTEMENT dans la grille). */
                <>
                  {[
                    ...ordreThemes.map(t => ({ theme: t, items: comps.filter(k => familleDe[k] === t).map(k => ({ k, v: perso.competences[k] })) })),
                    ...(comps.filter(k => !familleDe[k]).length ? [{ theme: "AUTRES", items: comps.filter(k => !familleDe[k]).map(k => ({ k, v: perso.competences[k] })) }] : [])
                  ].filter(g => g.items.length > 0).map(g => (
                    <div key={g.theme} className="mb-3 break-inside-avoid">
                      <div className="text-[11px] font-bold tracking-widest mb-1" style={{ color: T.accent }}>
                        {g.theme}{bonusFamilles && g.theme in bonusFamilles ? " — BONUS " + (bonusFamilles[g.theme] >= 0 ? "+" + bonusFamilles[g.theme] : bonusFamilles[g.theme]) : ""}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {g.items.map(it => {
                          /* V0.68 — LA LIGNE PORTE LE SCORE (Michael) : « 0 % »
                             tant que la compétence n'est pas apprise, JAMAIS le
                             seuil calculé — et AUCUNE ligne n'est grisée : les
                             0 % servent, leur jet se joue à 0 + bonus de
                             famille (le bonus vit dans l'entête et le jet). */
                          const v = it.v != null && it.v > 0 ? it.v : 0;
                          return (
                            <div key={it.k} className="flex justify-between rounded px-2 py-1" style={{ background: "#ffffff08", color: "#c8c8ce" }}>
                              <span>{it.k}</span>
                              <span style={{ color: "#e8e4d8" }}>{v} %</span>
                            </div>
                          );
                        })}
                        {g.theme === "INVOCATION" && pouvoirsGagnes.length > 0 && (
                          /* V0.69 — les pouvoirs d'INVOCATION gagnés
                             s'affichent comme les compétences de la
                             famille (Sylphe, Gnome...) sauf que leur
                             chance se joue à 3×POU (Michael) : POU 35
                             → 3×POU · 105 %. Seuls les pouvoirs
                             OFFICIELS du livre s'affichent pour
                             l'instant — les pouvoirs maison (gagnés
                             en aventure) attendront leur gravure. */
                          <div className="col-span-2 mt-1.5">
                            <div className="text-[10px] mb-1 tracking-widest" style={{ color: "#71717a" }}>POUVOIRS D'INVOCATION GAGNÉS</div>
                            <div className="grid grid-cols-1 gap-1">
                              {pouvoirsGagnes.map((p, i) => (
                                <div key={i} className="flex justify-between rounded px-2 py-1" style={{ background: "#ffffff08", color: "#c8c8ce" }}>
                                  <span>{p}</span>
                                  <span style={{ color: "#e8e4d8" }}>3×POU · {3 * (perso.caracs && perso.caracs.POU || 0)} %</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              ) : perso.competences ? (
                <div className="grid grid-cols-2 gap-1.5 text-xs mb-3 break-inside-avoid">
                  {Object.entries(perso.competences).map(([k, v]) => (
                    <div key={k} className="flex justify-between rounded px-2 py-1" style={{ background: "#ffffff08", color: "#c8c8ce" }}>
                      <span>{k}</span><span style={{ color: "#e8e4d8" }}>{v} %</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {perso.pouvoirs && perso.pouvoirs.length > 0 && !(themesComps && themesComps.INVOCATION) && (
                /* V0.68 — repli : si le pack n'a pas de famille INVOCATION,
                   les pouvoirs gardent leur bloc propre — V0.72 : une
                   CELLULE du milieu de fiche, avec les compétences. */
                <div className="mb-3 break-inside-avoid">
                  <div className="text-xs mb-1" style={{ color: "#71717a" }}>Pouvoirs</div>
                  <div className="flex flex-wrap gap-1">
                    {perso.pouvoirs.map((p, i) => (
                      <span key={i} className="text-xs px-1.5 py-0.5 rounded" style={{ background: T.accent + "22", color: T.accent }}>{p}</span>
                    ))}
                  </div>
                </div>
              )}
              {perso.desirs && (
                /* V0.72 — LES DÉSIRS : une CELLULE du milieu de fiche,
                   à côté des familles de compétences (le fragment de
                   la V0.70 devenait DEUX cellules — un div l'englobe). */
                <div className="mb-3 break-inside-avoid">
                  <div className="text-xs mb-1" style={{ color: "#71717a" }}>Désirs du peuple {perso.peuple} (livre p. 88 — un PJ ajuste de ±1 à ±2 par désir)</div>
                  {Object.entries(perso.desirs).map(([k, v]) => (
                    <div key={k} className="mb-1.5">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span style={{ color: "#c8c8ce" }}>{k}</span>
                        <span style={{ color: "#e8e4d8" }}>{v}/10{v >= 9 ? " 🔥" : ""}</span>
                      </div>
                      <PvBarre pv={v} pvMax={10} accent={v >= 8 ? T.accent : "#a8adb8"} />
                    </div>
                  ))}
                </div>
              )}
              </div>
                </div>
              ) : null}

              {/* ════════ BLOC 4 — POSSESSION (Michael) : le sac, pleine
                 largeur — deux colonnes de cartes d'objets physiques
                 (V0.70 : le nom en gras, le détail entre parenthèses
                 passe après le « · »). V0.73 : CADRE SÉPARÉ. V0.74 : le
                 bandeau s'ouvre AUSSI pour le sac seul — et porte la
                 zone ÉQUIPEMENT RANGÉ : les armes et armures
                 déséquipées y vivent avec leurs caractéristiques et
                 leur porte ↑ ÉQUIPER (une place par famille : le fer
                 ne se prend que la main vide). */}
              {(perso.possessions && perso.possessions.length > 0) || armesRangees.length > 0 || armuresRangees.length > 0 ? (
                <div className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid " + T.accent + "33" }}>
                  <div className={"mb-1 " + (themesComps ? "text-[11px] font-bold tracking-widest" : "text-xs")} style={{ color: themesComps ? T.accent : "#71717a" }}>{themesComps ? "POSSESSION" : "Possessions"}</div>
                  {(armesRangees.length > 0 || armuresRangees.length > 0) && (
                    <div className="mb-2">
                      <div className="text-[10px] mb-1" style={{ color: "#71717a" }}>ÉQUIPEMENT RANGÉ — à portée de main</div>
                      <div className="grid md:grid-cols-2 gap-1">
                        {armesRangees.map(a => (
                          <div key={"r-" + a.nom} className="rounded p-2 text-xs flex items-center justify-between gap-2" style={{ background: "#ffffff08", color: "#c8c8ce" }}>
                            <span><b style={{ color: "#e8e4d8" }}>{a.nom}</b> · {a.seuil}{a.degats ? " · " + a.degats : ""}{a.bonus ? " · +" + a.bonus : ""}</span>
                            <button onClick={() => equiperArme(a)} disabled={armesEquipees.length > 0}
                              title={armesEquipees.length > 0 ? "Une arme à la fois — déséquipez la tenue d'abord" : ""}
                              className="print:hidden px-2 py-1 rounded text-[10px] font-bold shrink-0"
                              style={{ background: armesEquipees.length > 0 ? "#a8adb80d" : T.accent + "22", color: armesEquipees.length > 0 ? "#52525b" : T.accent, border: "1px solid " + (armesEquipees.length > 0 ? "#27272a" : T.accent + "44"), cursor: armesEquipees.length > 0 ? "default" : "pointer" }}>↑ ÉQUIPER</button>
                          </div>
                        ))}
                        {armuresRangees.map((a, i) => (
                          <div key={"ra-" + i} className="rounded p-2 text-xs flex items-center justify-between gap-2" style={{ background: "#ffffff08", color: "#c8c8ce" }}>
                            <span><b style={{ color: "#e8e4d8" }}>{a.nom}</b>{a.reste ? " · " + a.reste : ""}</span>
                            <button onClick={() => equiperArmure(a)} disabled={armuresEquipees.length > 0}
                              title={armuresEquipees.length > 0 ? "Une armure à la fois — déséquipez la tenue d'abord" : ""}
                              className="print:hidden px-2 py-1 rounded text-[10px] font-bold shrink-0"
                              style={{ background: armuresEquipees.length > 0 ? "#a8adb80d" : T.accent + "22", color: armuresEquipees.length > 0 ? "#52525b" : T.accent, border: "1px solid " + (armuresEquipees.length > 0 ? "#27272a" : T.accent + "44"), cursor: armuresEquipees.length > 0 ? "default" : "pointer" }}>↑ ÉQUIPER</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {perso.possessions && perso.possessions.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-1">
                    {perso.possessions.map((p, i) => {
                      const po = String(p).indexOf(" (");
                      const nom = po > 0 ? String(p).slice(0, po) : String(p);
                      const detail = po > 0 ? String(p).slice(po + 2, String(p).length - 1) : "";
                      return (
                        <div key={i} className="rounded p-2 text-xs" style={{ background: "#ffffff08", color: "#c8c8ce" }}>
                          <b style={{ color: "#e8e4d8" }}>{nom}</b>{detail ? " · " + detail : ""}
                        </div>
                      );
                    })}
                    </div>
                  )}
                </div>
              ) : null}

              {/* BLOC 5 — NOTES (Michael) : l'espace à remplir à
                  la main une fois la fiche imprimée — six lignes, la
                  classe notes-ligne porte la règle du papier clair.
                  V0.73 : CADRE SÉPARÉ, il ferme les cinq blocs. */}
              <div className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid " + T.accent + "33" }}>
                <div className="text-[11px] font-bold tracking-widest mb-1" style={{ color: T.accent }}>NOTES</div>
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="notes-ligne" style={{ height: "20px", borderBottom: "1px solid #ffffff08" }} />
                ))}
              </div>
              </div>

              {/* V0.69 — LE BOUTON « ↺ CRÉER UN NOUVEL AVENTURIER » A
                 QUITTÉ LA FICHE (Michael) : l'écran de création — qui
                 demandera Sexe, Age, Yeux, Cheveux, Nationalité, Culte —
                 est le chantier suivant ; la création passe par le
                 « + CRÉER » du REGISTRE en haut de l'onglet. */}

            {/* V0.68 — LE CADRE DU DÉMON DE TEST A QUITTÉ LA FICHE
               (Michael) : l'adversaire et sa lutte de POU vivront avec
               les panneaux de l'intégration visuelle ; la forge de
               l'Arme vivante reste, elle. */}

            {/* L'Arme vivante : forge + contrôle (si le pack en déclare une) */}
            {C.forge ? (
              <div className="rounded-xl p-4 md:col-span-2" style={{ background: "#ffffff08", border: "1px solid " + T.or + "44" }}>
                <div className="flex items-baseline justify-between mb-3">
                  <div className="font-bold text-lg" style={{ color: T.or }}>{C.forge.nom}</div>
                  <div className="text-xs" style={{ color: "#71717a" }}>{C.forge.nature} · base {C.forge.base} pts</div>
                </div>
                <div className="mb-3">
                  <BarrePct valeur={Math.min(pts, C.forge.budget)} max={C.forge.budget} accent={T.or}
                    label={armeEveillee
                      ? `${pts} points — l'arme s'éveille · prestige : ${prestige} pts`
                      : `${pts} / ${C.forge.budget} points de forge (base ${C.forge.typeArme || "de l'arme"} : ${C.forge.base})`} />
                </div>
                {acquis.length === 0 ? (
                  <div className="text-xs mb-3 text-center py-2 rounded" style={{ color: "#71717a", background: "#ffffff08" }}>
                    L'âme dort encore dans le métal — tirez le d% sur une table, puis choisissez l'ordre des chiffres
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 mb-3">
                    {acquis.map(p => (
                      <div key={p.tableId + "-" + p.cle} className="flex justify-between items-center rounded px-2 py-1 text-xs" style={{ background: "#ffffff08" }}>
                        <span style={{ color: "#e8e4d8" }}>
                          <span className="px-1 rounded mr-1" style={{ background: T.or + "22", color: T.or }}>
                            {C.tablesForge.find(t => t.id === p.tableId).court}
                          </span>
                          {p.nom}
                        </span>
                        <span style={{ color: p.prix > 0 ? T.or : "#7dd3fc" }}>{p.prix > 0 ? "+" : ""}{p.prix}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {forge ? (
                    <div className="rounded-lg p-3 text-center" style={{ background: "#ffffff0d", border: "1px solid " + T.or + "44" }}>
                      <div className="text-xs mb-2" style={{ color: "#c8c8ce" }}>
                        {C.tablesForge.find(x => x.id === forge.tableId).nom} — chiffres tirés :{" "}
                        <b style={{ color: T.or }}>{forge.a}</b> et <b style={{ color: T.or }}>{forge.b}</b> — quel ordre ?
                      </div>
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => choisirOrdreForge("a")} className="px-5 py-2 rounded-lg font-bold text-black" style={{ background: T.or }}>{forge.a}{forge.b}</button>
                        <button onClick={() => choisirOrdreForge("b")} className="px-5 py-2 rounded-lg font-bold text-black" style={{ background: T.or }}>{forge.b}{forge.a}</button>
                      </div>
                    </div>
                  ) : choixLibre ? (
                    <div className="rounded-lg p-3" style={{ background: "#ffffff0d", border: "1px solid " + T.or + "44" }}>
                      <div className="text-xs mb-2" style={{ color: "#c8c8ce" }}>
                        « Au choix du joueur » — {C.tablesForge.find(x => x.id === choixLibre.tableId).nom} : désignez le pouvoir
                      </div>
                      <select
                        onChange={e => {
                          const t = C.tablesForge.find(x => x.id === choixLibre.tableId);
                          const p = t.table.find(x => String(x.de[0]) === e.target.value);
                          if (!p) return;
                          setChoixLibre(null);
                          ajouterPouvoir(choixLibre.tableId, p.de[0], p);
                        }}
                        className="w-full rounded px-2 py-1.5 text-sm"
                        style={{ background: "#14161b", color: "#e8e4d8", border: "1px solid #3f3f46" }}>
                        <option value="">— choisir un pouvoir —</option>
                        {C.tablesForge.find(x => x.id === choixLibre.tableId).table.filter(p => p.prix !== null).map(p => (
                          <option key={p.de[0]} value={p.de[0]}>
                            {p.de[1] === p.de[0] ? fmtD100(p.de[0]) : fmtD100(p.de[0]) + "-" + fmtD100(p.de[1])} · {p.nom} · {p.prix[0] > 0 ? "+" : ""}{p.prix[0]}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {C.tablesForge.map(t => {
                        const n = jetsTable[t.id] || 0;
                        const bloque = armeEveillee || (t.max !== null && n >= t.max);
                        return (
                          <button key={t.id} onClick={() => lancerForge(t.id)} disabled={bloque}
                            className="py-2 rounded-lg text-sm font-bold"
                            style={{ background: bloque ? "#52525b" : T.or, color: bloque ? "#a1a1aa" : "#0c0d10", cursor: bloque ? "not-allowed" : "pointer" }}>
                            {t.nom.replace("Pouvoirs ", "")}
                            {t.max !== null && <span className="text-xs font-normal ml-1">({n}/{t.max})</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {armeEveillee && (
                    <div className="text-center text-sm py-2 rounded" style={{ background: "#ffffff0d", color: T.or }}>
                      {C.forge.nom} est éveillée — la forge est close (nouveaux pouvoirs en jeu, par l'XP)
                    </div>
                  )}
                  {C.controle ? (
                    <button onClick={testerControle} className="py-2 rounded-lg text-sm font-bold"
                      style={{ border: "1px solid " + T.accent + "66", color: T.accent }}>
                      Test de contrôle — {C.controle.carac}×{C.controle.mult} (test)
                    </button>
                  ) : null}
                  {C.forgeAide && (
                    <div className="text-xs text-center" style={{ color: "#71717a" }}>{C.forgeAide}</div>
                  )}
                </div>
              </div>
            ) : null}
          </>
          )}
        </div>
        </>
        )}
      </div>
      <PiedVibe versionBase={versionBase} />
    </div>
  );
}

