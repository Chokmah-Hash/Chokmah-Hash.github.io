export default function App() {
  const [vue, setVue] = useState("hub");
  const [packActif, setPackActif] = useState(null);
  const [livreSb, setLivreSb] = useState(null); /* V0.63 : le livre gravé du pack actif (invisible) */
  const [favoris, setFavoris] = useState([]);
  const [installes, setInstalles] = useState([]);
  const [enInstallation, setEnInstallation] = useState(null);
  const [toast, setToast] = useState(null);
  const [etapes, setEtapes] = useState([]);
  const [totalEtapes, setTotalEtapes] = useState(7);
  const [rolesPacks, setRolesPacks] = useState({}); // packId → rôle du DERNIER lancement ("mj" | "joueur")
  const [persoChoisi, setPersoChoisi] = useState({}); // V0.76 — jeu → id du perso PRIS POUR L'AVENTURE (vit dans le sac du compte)
  const [rolePour, setRolePour] = useState(null);    // pack en attente du choix de rôle, au lancement
  const [modePour, setModePour] = useState(null);    // V46 : pack multijoueur en attente du choix MODE MJ/JOUEUR
  const [modePartie, setModePartie] = useState(null); // V46 : le mode choisi pour l'écran de partie courant
  const [mesAventuresListe, setMesAventuresListe] = useState([]); // V46 : registre MJ — toutes mes aventures, tout statut
  const [mdpsClairs, setMdpsClairs] = useState({}); // V0.39 : le scellé SAUVÉ de chacune de mes aventures (id → mot de passe en clair)

  /* Les comptes — réels : Supabase Auth (le serveur grave l'UUID et le tag).
     Tous les comptes sont joueurs ; le rôle (MJ ou joueur) se choisit pack
     par pack, au lancement. L'Archiviste ne garde jamais les mots de passe. */
  const [session, setSession] = useState(null);

  const seConnecter = (p) => {
    /* La double porte : un compte « en_attente » ne franchit pas le seuil —
       il attend le sceau de l'Archiviste (apposé dans l'Archivisterium,
       ou par le lien email si ce mode est en vigueur). */
    if (CLOUD && p.statut === "en_attente") {
      setSession(p);
      setVue("attente");
      return;
    }
    /* En mode CLOUD, la mémoire arrive DU NUAGE avec le profil (p.memoire). */
    const memo = (CLOUD && p.memoire) || {};
    setInstalles(memo.installes || []);
    setFavoris(memo.favoris || []);
    setRolesPacks(memo.rolesPacks || {});
    setPersoChoisi(memo.persoChoisi || {});
    setSession(p);
    showToast((memo.installes || []).length
      ? `Bienvenue, ${p.pseudo} — bibliothèque restaurée (${memo.installes.length} pack${memo.installes.length > 1 ? "s" : ""})`
      : `Bienvenue, ${p.pseudo} — compte connecté`);
  };

  const seDeconnecter = () => {
    /* La bibliothèque vit DANS LE NUAGE : déjà sauvegardée à chaque changement
       (CLOUD.sauveMemoire). Le launcher repart vierge, mais rien n'est perdu —
       la bibliothèque est restaurée à la reconnexion.
       V48.6 : LE HUB D'ABORD. Un setter fantôme (setMesPartiesCours — vestige
       de l'épure V48.3, jamais déclaré) jetait au milieu du nettoyage :
       session vidée mais vue figée sur « partie » — plus AUCUNE branche ne
       rendait → ÉCRAN NOIR en quittant un JDR. Le retour au hub se fait
       AVANT le nettoyage : un raté futur ne peut plus peindre le vide. */
    if (CLOUD) CLOUD.deconnexion().catch(() => {});
    setVue("hub");
    setSession(null);
    setInstalles([]);
    setFavoris([]);
    setRolesPacks({});
    setEnInstallation(null);
    setRolePour(null);
    setModePour(null);
    setModePartie(null);
    setMesAventuresListe([]);
    setPackActif(null);
    setPartie(null);
    setPartieJoueurs([]);
    setFichesPartie([]);
    setMesPersonnages([]);
    setPartiesOuvertes([]);
    setPackPartie(null);
    showToast("Session fermée — le magasin reste ouvert");
  };

  const creerProfil = (profil) => {
    /* Le profil arrive DU NUAGE — UUID serveur + tag JR-000n attribué par
       la base, via Supabase Auth (inscription). */
    seConnecter(profil);
  };

  const changerAvatar = (id) => {
    setSession(s => (s ? { ...s, avatarId: id } : s));
    if (CLOUD && session) CLOUD.sauveCompte({ avatarId: id }).catch(() => {});
  };

  /* Mode CLOUD — restauration de session au démarrage : si un compte est déjà
     connecté (token gardé par le navigateur), sa bibliothèque est restaurée
     depuis le nuage, comme sur Steam. */
  useEffect(() => {
    if (!CLOUD) return;
    CLOUD.sessionActuelle().then(p => { if (p) seConnecter(p); }).catch(() => {});
  }, []);

  /* V0.63 — le livre gravé du pack actif : fetch + injection dans le
     moteur REGLES_SB. Invisible : aucun panneau ne l'affiche encore —
     la mécanique est prête pour les panneaux du salon. */
  useEffect(() => {
    if (!packActif || !packActif.livre) return;
    let vivant = true;
    chargerLivre(packActif.livre).then(d => { if (vivant && d) setLivreSb(d); });
    return () => { vivant = false; };
  }, [packActif]);

  /* Le pied de page dit l'état de la base (parametre « version_launcher ») :
     même vérité que l'Archivisterium — tout écart entre le code qui tourne
     et l'état de la base s'affiche entre parenthèses. */
  const [versionBase, setVersionBase] = useState(null);
  useEffect(() => {
    if (!CLOUD || !session) return;
    CLOUD.lireParametres().then(ps => {
      const v = (((ps || []).find(x => x.cle === "version_launcher") || {}).valeur) || null;
      setVersionBase(v);
    }).catch(() => {});
  }, [session]);

  /* ── LA PARTIE (V4) : l'aventure partagée du pack courant ──
     La partie vit dans la Tombe : le MJ l'ouvre, les joueurs la
     rejoignent (liste ou code), le MJ la lance — et l'entrée dans le
     pack se fait par la POUSSÉE, le même chemin pour tous. Les refs
     gardent la vérité vivante pour les closures du canal temps réel. */
  const [partie, setPartie] = useState(null);         /* la partie courante (ouverte ou en_cours) */
  const [partieJoueurs, setPartieJoueurs] = useState([]); /* la table, en temps réel */
  const [partiesOuvertes, setPartiesOuvertes] = useState([]); /* le lobby du pack */
  const [presents, setPresents] = useState({});               /* V47 : la ronde des présents (compte_id → {pseudo, jeu}) */
  const [mdpSalle, setMdpSalle] = useState(null);             /* V47 : le mot de passe de la salle qu'on vient d'ouvrir (affiché au MJ) */
  const canalPresenceRef = useRef(null);                      /* V47 : pour re-pister quand on change de pack */
  const [packPartie, setPackPartie] = useState(null);  /* le pack multijoueur en cours de partie */
  const [consolePartieOuverte, setConsolePartieOuverte] = useState(false); /* V0.57 : réservé (le bandeau a quitté la scène) */

  const partieIdRef = useRef(null);
  const packPartieRef = useRef(null);
  const vueRef = useRef("hub");
  const contexteConsoleRef = useRef(null); /* {partieId, packId} — le canal de la console : partie en cours, salon du JDR, ou global */
  const salonJeuIdRef = useRef(null); /* V0.66 : le JDR du pack ouvert — le canal du SALON DU JEU (Taverne du d100) */
  partieIdRef.current = partie ? partie.id : null;
  packPartieRef.current = packPartie;
  vueRef.current = vue;

  /* ── La repeinte du scrolling : le pack qui prend l'écran colore la barre ──
     Doctrine des thèmes : la vitrine est zinc, les packs portent leurs
     teintes. Les vues « chargement / partie / pack » sont les écrans DU
     pack actif — sa barre parle sa couleur, son rail son fond ; les autres
     vues (hub, attente, connexion) rendent le Zinc d'Archiviste. Les trois
     variables sont lues par le style posé en §SECTION:UI (theme-scroll). */
  useEffect(() => {
    const racine = (typeof document !== "undefined" && document.documentElement) || null;
    if (!racine || !racine.style || !racine.style.setProperty) return;
    const t = (vue === "chargement" || vue === "partie" || vue === "pack") && packActif ? packActif.theme : null;
    racine.style.setProperty("--scroll-pouce", t ? t.accent : "#a8adb8");
    racine.style.setProperty("--scroll-glace", t ? t.fond : "#1c1c22");
    racine.style.setProperty("--scroll-or", t ? t.or : "#e8e4d8");
  }, [vue, packActif]);

  /* ── La Console : le fil CONTEXTUEL ──
     Dans le hub et les packs solo : le canal GLOBAL. Dans une partie
     (vue pack avec partie en cours) : le canal PRIVÉ de la partie,
     lu et gravé par ses membres seuls. Le contexte est tenu dans une
     ref : les closures du canal temps réel la lisissent à chaque poussée. */
  const [consoleFil, setConsoleFil] = useState([]);
  const [salonJeuFil, setSalonJeuFil] = useState([]); /* V0.66 : le fil du SALON DU JEU — canal (jeu, null), indépendant de la console de partie */
  /* V0.38 — le canal à DEUX dimensions : la partie en cours UNIQUEMENT
     en vue pack (la table : le lobby n'est JAMAIS détourné, le MJ qui
     tient une aventure voyait son salon muet), sinon LE SALON DU JDR
     quand on vit dans son espace MJ/Joueur, sinon le fil global. Les
     primitives extraites servent de dépendances d'effet — l'objet
     littéral changerait d'identité à chaque rendu. */
  const enCanalPartie = !!(partie && partie.statut === "en_cours" && vue === "pack");
  const contexteConsole = enCanalPartie
    ? { partieId: partie.id, packId: null }
    : (vue === "partie" && packPartie) ? { partieId: null, packId: packPartie.id }
    : { partieId: null, packId: null };
  contexteConsoleRef.current = contexteConsole;
  const salonJeuId = vue === "pack" && packActif ? packActif.id : null; /* V0.66 : le pack OUVERT vit son salon de JDR (la vue partie a déjà le sien via contexteConsole) */
  salonJeuIdRef.current = salonJeuId;
  useEffect(() => {
    if (!CLOUD || !session) { setConsoleFil([]); return; }
    CLOUD.lireConsole(contexteConsole.partieId, contexteConsole.packId).then(f => setConsoleFil(f || [])).catch(() => {});
  }, [session ? session.compteId : null, contexteConsole.partieId, contexteConsole.packId]); /* compteId seul — même garde
      que le canal : jamais « session » nu en dépendance d'effet */
  /* V0.38 — LA RELECTURE DU SALON : l'écran de partie l'appelle en
     arrivant sur l'onglet LOBBY — ceinture et bretelles : même si un
     changement de contexte a manqué son effet, le salon se relit. */
  const relireConsole = () => {
    if (!CLOUD || !session) return;
    const ctx = contexteConsoleRef.current || {};
    CLOUD.lireConsole(ctx.partieId || null, ctx.packId || null).then(f => setConsoleFil(f || [])).catch(() => {});
  };

  /* V0.66 — le fil du SALON DU JEU se lit à l'entrée du pack : le canal
     (jeu, null) de la Tombe, le même que le LOBBY d'EcranPartie. Les
     poussées temps réel le maintiennent vivant. */
  useEffect(() => {
    if (!CLOUD || !session || !salonJeuIdRef.current) { setSalonJeuFil([]); return; }
    CLOUD.lireConsole(null, salonJeuIdRef.current).then(f => setSalonJeuFil(f || [])).catch(() => {});
  }, [session ? session.compteId : null, salonJeuId]);

  /* V0.67 — LE REGISTRE DU PACK OUVERT : la structure commune donne
     l'onglet PERSONNAGES au noyau d100 — le registre du compte pour CE
     jeu se lit à l'entrée du pack (solo ou en partie), comme le salon. */
  useEffect(() => {
    if (vue !== "pack" || !packActif || !session || !CLOUD) return;
    rechargerPersonnages(packActif.id);
  }, [vue, packActif ? packActif.id : null, session ? session.compteId : null]);

  /* Recharger la partie courante et sa table (utilisée au montage et à
     chaque poussée parties/joueurs : la Tombe reste la seule vérité).
     V42b : l'id peut être EXPLICITE — la ref n'est mise à jour qu'au
     rendu SUIVANT ; les joins lisaient une ref encore vide et la table
     restait muette (l'écho temps réel sauvait la mise par chance). */
  const rechargerPartie = (idExplicite) => {
    const id = idExplicite || partieIdRef.current;
    if (!CLOUD || !session || !id) return Promise.resolve();
    return Promise.all([
      CLOUD.lirePartie(id).catch(() => null),
      CLOUD.lirePartieJoueurs(id).catch(() => []),
      CLOUD.lireFichesPartie(id).catch(() => []) /* V43 : les fiches de la table */
    ]).then(([p, js, fs]) => {
      if (p) setPartie(p);
      setPartieJoueurs(js || []);
      setFichesPartie(fs || []);
    });
  };

  /* V0.39 — LES SCELLÉS DU MJ : relire le mot de passe SAUVÉ de chacune
     de ses aventures (la table dédiée ne laisse passer que les siennes).
     Le champ de l'écrou s'en pré-remplit ; la gravure et l'ouverture de
     salle rechargent pour rester vraies. */
  const rechargerScelles = () => {
    if (!CLOUD || !session) return;
    CLOUD.mdpsSalle()
      .then(l => setMdpsClairs((l || []).reduce((m, e) => { m[e.partie_id] = e.mdp_clair; return m; }, {})))
      .catch(() => {});
  };

  /* Recharger le lobby du pack multijoueur courant (aventures ouvertes
     + nos parties en cours) — au montage de l'écran et à chaque poussée. */
  const rechargerListes = () => { /* V0.47 : rend TOUJOURS une promesse — graverMdpSalle enchaîne dessus */
    const pk = packPartieRef.current;
    if (!CLOUD || !session || !pk) return Promise.resolve();
    return Promise.all([
      CLOUD.listerParties(pk.id).then(l => setPartiesOuvertes(l || [])).catch(() => {}),
      CLOUD.mesAventures(pk.id, session.compteId).then(l => setMesAventuresListe(l || [])).catch(() => {}), /* V46 registre MJ */
      CLOUD.listerPersonnages(pk.id).then(l => setMesPersonnages(l || [])).catch(() => {}) /* V48 registre du joueur */
    ]).then(() => rechargerScelles()); /* V0.39 : le scellé de chaque aventure suit le registre */
  };

  /* V43 : LES FICHES DE LA TABLE — le personnage du joueur vit dans la
     Tombe. sauverFiche grave (upsert) l'état de l'unité : création, PV.
     Les rechargements arrivent par la poussée temps réel. */
  const [fichesPartie, setFichesPartie] = useState([]);
  const [mesPersonnages, setMesPersonnages] = useState([]); // V48 : le registre du joueur pour CE pack

  /* V48 — LE REGISTRE DES PERSONNAGES : éveiller depuis l'onglet PERSONNAGES
     grave l'unité dans la Tombe (rattachée au compte ET au pack) ; la
     sentence est douce — le personnage quitte le registre, la Tombe garde
     sa trace. V0.67 : la structure commune donne l'onglet PERSONNAGES au
     noyau d100 AUSSI — le pack n'est plus seulement celui de l'écran de
     partie : chaque vue passe SON pack. Les deux rechargent la liste. */
  const rechargerPersonnages = (packId) => {
    if (!CLOUD || !session || !packId) return Promise.resolve();
    return CLOUD.listerPersonnages(packId).then(l => setMesPersonnages(l || [])).catch(() => {});
  };
  const creerPersonnageRegistre = (packId, p) => {
    if (!CLOUD || !session || !packId || !p) return;
    CLOUD.creerPersonnage(packId, session.compteId, p.nom, p)
      .then(() => {
        showToast("« " + p.nom + " » rejoint le registre — prêt à entrer dans vos aventures.");
        return rechargerListes().then(() => rechargerPersonnages(packId));
      })
      .catch(() => showToast("La Tombe a refusé — le personnage n'a pas rejoint le registre. Réessayez."));
  };
  const supprimerPersonnageRegistre = (packId, p) => {
    if (!CLOUD || !p) return;
    CLOUD.supprimerPersonnage(p.id)
      .then(() => {
        /* V0.77 — le perso PRIS qui quitte le registre rend sa place :
           la sélection se dépose (la fiche retombera sur le premier). */
        if (persoChoisi[packId] === p.id) setPersoChoisi({ ...persoChoisi, [packId]: null });
        showToast("« " + p.nom + " » quitte le registre — la Tombe garde sa trace.");
        return rechargerListes().then(() => rechargerPersonnages(packId));
      })
      .catch(() => showToast("La Tombe a refusé — le personnage reste au registre."));
  };
  /* V0.74 — LA FICHE VIVANTE : la grande fiche ouverte depuis le
     registre grave ses gestes d'équipement (équiper, déséquiper)
     dans la Tombe. L'écran applique déjà le changement (état local
     optimiste) ; la Tombe grave le contenu EN ENTIER et le registre
     se recharge — le perso du sac et celui de la pierre ne divergent
     jamais. */
  const modifierPersonnageRegistre = (packId, p) => {
    if (!CLOUD || !p || !p.id || !p.contenu) return;
    CLOUD.majPersonnage(p.id, p.contenu)
      .then(() => rechargerPersonnages(packId))
      .catch(() => showToast("La Tombe a refusé — le geste d'équipement n'est pas gravé. Réessayez."));
  };
  const sauverFiche = (contenu) => {
    if (!CLOUD || !session || !partieIdRef.current) return;
    CLOUD.sauverFichePartie(partieIdRef.current, session.compteId, contenu).catch(() => {});
  };
  const rechargerFiches = () => {
    const id = partieIdRef.current;
    if (!CLOUD || !id) return;
    CLOUD.lireFichesPartie(id).then(l => setFichesPartie(l || [])).catch(() => {});
  };
  useEffect(() => {
    if (vue !== "partie" || !packPartie) return;
    rechargerListes();
  }, [vue, packPartie, session ? session.compteId : null]);

  /* V0.60b — LE REGISTRE SUIT LE PACK OUVERT, PAS SEULEMENT LE LOBBY :
     listerPersonnages ne passait que par l'écran de partie — en solo
     (pack ouvert, aucun lobby), la liste restait vide et la fiche de la
     Tombe n'était JAMAIS adoptée. On charge le registre du pack à
     CHAQUE ouverture de vue pack. */
  useEffect(() => {
    if (vue !== "pack" || !packActif || !CLOUD || !session) return;
    let vivant = true;
    CLOUD.listerPersonnages(packActif.id).then(l => { if (vivant) setMesPersonnages(l || []); }).catch(() => {});
    return () => { vivant = false; };
  }, [vue, packActif ? packActif.id : null, session ? session.compteId : null]);

  /* Parler dans la Console : le message part à la Tombe (elle le signe et
     le pousse à tous, nous compris), dans le canal du CONTEXTE. */
  const [consoleEnvoi, setConsoleEnvoi] = useState(false);
  const envoyerConsoleMessage = (texte) => {
    if (!CLOUD || !session) return;
    const ctx = contexteConsoleRef.current || {};
    const ev = interpreterConsole(texte); /* /de 3d6 et /tour X deviennent typés */
    if (!ev.contenu && !ev.des) return;
    /* V0.37 : les dés se roulent dans le canal de la PARTIE (la Tombe
       grave p_partie) ou au hub (fil global) — jamais dans le salon
       d'un JDR, qui n'est qu'un canal de paroles. */
    if (ev.des && !ctx.partieId && ctx.packId) {
      showToast("Les dés se roulent à la table — le salon est fait pour parler.");
      return;
    }
    setConsoleEnvoi(true);
    /* V3 : /de part à la Tombe — elle roule et grave elle-même ; V4 :
       dans le canal de la partie quand il y en a une. */
    const envoi = ev.des
      ? CLOUD.lancerDes(ev.des.nb, ev.des.faces, undefined, ctx.partieId || null)
          .catch(() => showToast("La Tombe n'a pas gravé le dé — réessayez."))
      : CLOUD.envoyerConsole(session.compteId, ev.contenu, ev.type, ev.donnees, ctx.partieId || null, ctx.packId || null)
          .catch(() => showToast("La Console n'a pas gravé — réessayez."));
    envoi.then(() => setConsoleEnvoi(false));
  };

  /* V0.66 — PARLER DANS LE SALON DU JEU : la Taverne du d100 est le lobby
     de SON JDR — le canal (jeu, null) reçoit les paroles, jamais les dés
     (ils vivront à la table de l'aventure, sur sa page future). */
  const envoyerSalonJeu = (texte) => {
    if (!CLOUD || !session || !salonJeuIdRef.current) return;
    const ev = interpreterConsole(texte);
    if (!ev.contenu && !ev.des) return;
    if (ev.des) { showToast("Les dés se roulent à la table — le salon est fait pour parler."); return; }
    setConsoleEnvoi(true);
    CLOUD.envoyerConsole(session.compteId, ev.contenu, ev.type, ev.donnees, null, salonJeuIdRef.current)
      .catch(() => showToast("Le salon n'a pas gravé — réessayez."))
      .finally(() => setConsoleEnvoi(false));
  };

  /* V3 : le journal de chaque moteur se grave aussi dans la Console —
     les jets du pack deviennent des événements partagés, vus de tous.
     V4 : dans le canal de la partie quand il y en a une. */
  const journalVersConsole = (type, texte) => {
    if (!CLOUD || !session) return;
    const ctx = contexteConsoleRef.current || {};
    CLOUD.envoyerConsole(session.compteId, texte, "journal", { evenement: type }, ctx.partieId || null, ctx.packId || null).catch(() => {});
  };

  /* ── Les gestes de LA PARTIE : tous génériques, tous pour le moteur ── */
  const creerAventure = (nomAventure) => {
    if (!CLOUD || !session || !packPartie) return Promise.resolve();
    return CLOUD.creerPartie(packPartie.id, (nomAventure || "").trim(), session.compteId)
      .then(p => {
        /* V46b : l'aventure NAIT sans lancer la salle — le MJ reste dans le
           moteur d'aventure, la ligne apparaît dans MES AVENTURES, et le
           lancement se fait depuis la liste (⚙ → OUVRIR LA SALLE). */
        if (p) {
          showToast("Aventure « " + p.nom + " » créée — ouvrez-la quand vous voulez dans AVENTURES (⚙ → OUVRIR LA SALLE).");
          rechargerListes();
        }
      })
      .catch(() => showToast("La Tombe n'a pas ouvert l'aventure — réessayez."));
  };
  const rejoindreAventure = (p) => {
    if (!CLOUD || !session) return Promise.resolve();
    /* V42b : le MJ ne rejoint pas sa propre aventure — il en est déjà le
       MJ ; deux fenêtres du même compte ne peuvent plus s'y dédoubler. */
    if (p.mj_compte_id === session.compteId) {
      showToast("C'est votre aventure — vous en êtes déjà le MJ.");
      setPartie(p);
      return rechargerPartie(p.id);
    }
    return CLOUD.rejoindrePartie(p.id, session.compteId)
      .then(() => { setPartie(p); return rechargerPartie(p.id); })
      .catch(() => showToast("Impossible de rejoindre — la salle est peut-être fermée, privée, ou l'aventure close."));
  };
  /* V47 — OUVRIR LA SALLE : le MJ tranche, publique ou privée. La Tombe
     grave et rend la salle ; le MJ y entre. Le mot de passe reste en
     mémoire de session : il s'affiche à lui seul dans la salle. */
  const ouvrirSalleAventure = (p, visibilite, mdpSaisi) => {
    if (!CLOUD || !session) return Promise.resolve();
    return CLOUD.ouvrirSalle(p.id, visibilite, mdpSaisi)
      .then(ligne => {
        setMdpSalle(visibilite === "privee" ? (mdpSaisi || "").trim() : null);
        showToast("Salle ouverte — " + (visibilite === "publique"
          ? "elle vit dans « AVENTURES OUVERTES » du lobby de tous."
          : "vos joueurs entrent avec le mot de passe que vous avez choisi."));
        setPartie(ligne || p);
        rechargerScelles(); /* V0.39 : le scellé suit — privée le pose, publique l'efface */
        return rechargerPartie(p.id);
      })
      .catch((e) => showToast((e && e.message) || "La Tombe refuse d'ouvrir la salle — réessayez."));
  };
  /* V49 — GRAVER LE MOT DE PASSE DE LA SALLE DEPUIS L'ÉCROU : vide = la
     porte s'ouvre à tous, texte = cadenassée (hash côté Tombe). mdpSalle
     suit pour que la salle d'attente montre au MJ son propre mot de passe. */
  const graverMdpSalle = (p, mdpSaisi) => {
    const cadenas = (mdpSaisi || "").trim().length > 0;
    return CLOUD.majMotDePasseSalle(p.id, mdpSaisi)
      .then((ligne) => {
        showToast(cadenas
          ? "« " + p.nom + " » est cadenassée — son mot de passe sera demandé aux joueurs."
          : "« " + p.nom + " » est ouverte à tous — plus de mot de passe.");
        setMdpSalle(cadenas ? (mdpSaisi || "").trim() : null);
        return rechargerListes().then(() => ligne);
      })
      .catch((e) => showToast((e && e.message) || "La Tombe refuse de graver le scellé — réessayez."));
  };
  const rejoindreAventureMdp = (mdpSaisi) => {
    if (!CLOUD || !session || !packPartie) return Promise.resolve();
    return CLOUD.rejoindrePrivee(packPartie.id, mdpSaisi)
      .then(p => {
        if (!p) { showToast("Aucune salle privée ne porte ce mot de passe."); return; }
        if (p.mj_compte_id === session.compteId) {
          showToast("Ce mot de passe est celui de VOTRE salle — vous en êtes le MJ.");
        } else {
          showToast("Vous rejoignez « " + p.nom + " »");
        }
        setPartie(p);
        return rechargerPartie(p.id);
      })
      .catch((e) => showToast((e && e.message) || "Aucune salle privée ne porte ce mot de passe."));
  };
  const reprendreAventure = (p) => {
    if (!CLOUD || !session) return Promise.resolve();
    /* V47 : le MJ qui REPREND une partie lancée RÉOUVRE la salle — les
       joueurs peuvent le suivre. Le joueur, lui, ne reprend QUE si la
       salle est ouverte (le bouton est grisé sinon — la vue décide). */
    if (p.mj_compte_id === session.compteId && p.statut === "en_cours" && !p.salle_ouverte_le) {
      CLOUD.rouvrirSalle(p.id).then(() => rechargerPartie(p.id)).catch(() => {});
    }
    setPartie(p);
    return rechargerPartie(p.id);
  };
  const lancerAventure = (p) => {
    if (!CLOUD) return;
    /* V0.37 — [▶ LANCER] direct : la porte naît PUBLIQUE, sauf si la
       salle est déjà tenue ou qu'un SCELLÉ PRIVÉ a été gravé par
       l'écrou — LANCER respecte alors le cadenas et ouvre privée. */
    CLOUD.lancerPartie(p.id, !(p.salle_ouverte_le || p.visibilite === "privee")).catch(() => showToast("La Tombe refuse le lancement — réessayez."));
    /* RIEN d'autre ici : l'entrée se fait par la POUSSÉE, le même chemin
       pour le MJ et les joueurs — un seul code, une seule vérité. */
  };
  /* V0.37 — [■ FERMER] : LA SEULE SENTENCE qui referme l'aventure. Les
     joueurs connectés sortent par la poussée temps réel (statut close :
     toast + retour au hub), et plus personne ne peut la rejoindre —
     elle quitte les AVENTURES À REJOINDRE. */
  const fermerAventure = (p) => {
    if (!CLOUD || !p) return;
    CLOUD.fermerPartie(p.id)
      .then(() => showToast("« " + p.nom + " » est close — les joueurs ont rendu la table."))
      .catch(() => showToast("La Tombe refuse de clore — réessayez."));
  };
  /* V46 : EFFACER une aventure — la Tombe la garde en Corbeille ; elle
     disparaît de nos écrans (les listes se rechargent par la poussée
     temps réel, on force une resynchro de sécurité). */
  const supprimerAventure = (p) => {
    if (!CLOUD || !session) return;
    CLOUD.supprimerPartie(p.id).then(() => {
      showToast("Aventure effacée — elle repose en Corbeille, visible de l'institution seule.");
      rechargerListes();
    }).catch(() => showToast("La Tombe a refusé la sentence."));
  };

  const quitterAventure = (p) => {
    if (!CLOUD || !session) return;
    if (p.mj_compte_id === session.compteId) {
      /* V0.37 — QUITTER NE CASSE PLUS RIEN : la salle d'attente seule
         se referme (l'aventure reste dans MES AVENTURES, relançable) ;
         une partie EN COURS survit ENTIÈRE au départ du MJ — joueurs,
         salle, EN LIGNE — il revient par ⚙ → REPRENDRE sans rien casser.
         Seul [■ FERMER] referme l'aventure pour de bon. */
      if (p.statut === "ouverte" && p.salle_ouverte_le) {
        CLOUD.fermerSalle(p.id).catch(() => {});
        showToast("Salle refermée — l'aventure reste dans MES AVENTURES (▶ LANCER).");
      } else {
        showToast("Vous quittez la table — l'aventure reste en ligne dans MES AVENTURES (⚙ → REPRENDRE).");
      }
    } else {
      CLOUD.quitterPartie(p.id, session.compteId).catch(() => {});
      showToast("Vous quittez la table.");
    }
    setPartie(null);
    setPartieJoueurs([]);
    setFichesPartie([]);
  };

  /* L'auto-entrée : quand la partie (dont on est membre) passe en_cours
     et qu'on est sur l'écran partie — on ENTRE dans le pack, le rôle
     dérivé de la table (MJ = le créateur, joueur = le reste). */
  useEffect(() => {
    if (vue !== "partie" || !partie || partie.statut !== "en_cours" || !packPartie || !session) return;
    const estMj = partie.mj_compte_id === session.compteId;
    const estMembre = estMj || partieJoueurs.some(j => j.compte_id === session.compteId);
    if (!estMembre) return; /* spectateur d'une partie close à notre table */
    const role = estMj ? "mj" : "joueur";
    setRolesPacks(r => ({ ...r, [packPartie.id]: role }));
    setPackActif(chargerPack(packPartie)); /* le manifeste devient un pack CHARGÉ */
    setVue("chargement");
    setEtapes([]);
    const liste = etapesChargement(packPartie, role);
    setTotalEtapes(liste.length);
    liste.forEach((t, i) => setTimeout(() => setEtapes(e => [...e, t]), 320 * (i + 1)));
    setTimeout(() => setVue("pack"), 320 * liste.length + 550);
  }, [vue, partie, partieJoueurs, packPartie]);

  /* ════════ V0.76 — LE PERSO POUR L'AVENTURE ════════
     La sélection du registre vit dans le sac du compte (la Tombe) :
     un perso par jeu, le clic sur un perso pris le DÉPOSE. Le bouton
     vit dans « MES PERSONNAGES » (PRENDRE à gauche de l'écrou) ; la
     fiche s'affiche à la prise. */
  const choisirPersoAventure = (jeu, p) => {
    const deja = persoChoisi[jeu] === p.id;
    setPersoChoisi({ ...persoChoisi, [jeu]: deja ? null : p.id });
    showToast(deja ? "« " + p.nom + " » rend sa place au registre." : "« " + p.nom + " » partira à l'aventure.");
  };

  /* Mode CLOUD — le sac du compte (installations, favoris, rôles) part dans le
     nuage dès qu'il change (débouncé) : l'état vit dans le compte, jamais
     dans l'appareil. */
  useEffect(() => {
    if (!CLOUD || !session) return;
    const t = setTimeout(
      () => CLOUD.sauveMemoire(session.compteId, { installes, favoris, rolesPacks, persoChoisi }).catch(() => {}),
      700
    );
    return () => clearTimeout(t);
  }, [session, installes, favoris, rolesPacks, persoChoisi]);

  /* ════════ Le module de Synchronisation (Core) — TEMPS RÉEL ════════
     La Tombe POUSSÉ ses changements (Supabase Realtime, WebSocket) : un
     sceau apposé depuis l'Archivisterium, une suspension, un avatar
     changé d'un autre appareil — tout arrive à l'écran instantanément,
     plus aucune pulsation. Les vérifications n'écrivent RIEN en base
     (horodater: false) — la Tombe ne s'annonce pas à elle-même. En
     coupure de canal, une pulsation de secours (30 s) reprend le
     relais ; à chaque rebranchement et au retour sur l'onglet, la
     vérité repart de la Tombe. */
  const [etatTempsReel, setEtatTempsReel] = useState("coupure");
  const verifierSession = async () => {
    try {
      const p = await CLOUD.sessionActuelle({ horodater: false });
      if (!p) {
        seDeconnecter();
        showToast("Session scellée par la Tombe — reconnexion requise.");
        return;
      }
      if (p.statut === "en_attente") {
        if (session.statut !== "en_attente") {
          setSession(p);
          setVue("attente");
          showToast("Votre compte attend le sceau de l'Archiviste.");
        }
        return;
      }
      if (session.statut === "en_attente") {
        /* Le sceau est apposé pendant l'attente : les archives s'ouvrent. */
        seConnecter(p);
        return;
      }
      setSession(s => (s ? { ...s, pseudo: p.pseudo, tag: p.tag, email: p.email, statut: p.statut } : s));
    } catch (e) { /* la Tombe sommeille — le canal rebranché relancera */ }
  };
  useEffect(() => {
    if (!CLOUD || !session) return;
    let attente = null;
    const relance = () => {
      if (attente) return;
      attente = setTimeout(() => { attente = null; verifierSession(); }, 400);
    };
    const canal = CLOUD.tempsReel({
      presenceKey: session.compteId, /* le pouls : présent tant que la socket vit */
      presenceInfo: () => ({ /* V47 : la ronde dit qui est en ligne et où il se tient */
        compte_id: session.compteId, pseudo: session.pseudo,
        jeu: (packPartieRef.current && packPartieRef.current.id) || null
      }),
      surPresence: (p, ev) => {
        /* V47 : LA RONDE DES PRÉSENTS — l'état initial remplace tout ; les
           diffs ne fondent que les entrées et sorties. Les fantômes sans
           pseudo (sessions d'une autre ère) restent invisibles. */
        if (!p || typeof p !== "object") return;
        if (ev === "presence_state") {
          const liste = {};
          Object.keys(p).forEach(cle => {
            const m = (p[cle] && p[cle].metas && p[cle].metas[0]) || null;
            if (m && m.pseudo) liste[cle] = m;
          });
          setPresents(liste);
          return;
        }
        if (ev === "presence_diff") {
          /* V48.4 : la fusion vit dans fondrePresents — pure, éprouvée au
             harnais contre les VRAIS payloads de la Tombe. */
          setPresents(prev => fondrePresents(prev, p));
        }
      },
      tables: [
        { table: "archiviste_comptes", filtre: "compte_id=eq." + session.compteId },
        { table: "archiviste_memoire", filtre: "compte_id=eq." + session.compteId },
        { table: "archiviste_console" }, /* le fil de tous — aucune surveillance de session là-dessus */
        { table: "archiviste_parties" }, /* le lobby et la partie courante, poussés */
        { table: "archiviste_partie_joueurs" }, /* la table qui vit : arrivées et départs */
        { table: "archiviste_partie_fiches" } /* V43 : les fiches de la table — création, PV */
      ],
      surChangement: (donnee) => {
        const evType = donnee && (donnee.type || donnee.eventType); /* payload réel : « type » (eventType ancien accepté) */
        const ligne = donnee && (donnee.record || donnee.new); /* payload réel : « record » (le « new » de la doc JS n'arrive jamais ici) */
        /* Les messages de la Console arrivent DROIT au fil — gravés en
           base, poussés par la Tombe. On n'ajoute que le canal du
           CONTEXTE (global au hub, la partie dans le pack) : les autres
           canaux ne sont pas les nôtres. */
        if (donnee && donnee.table === "archiviste_console" && evType === "INSERT" && ligne) {
          const ctx = contexteConsoleRef.current || {};
          if ((ligne.partie_id || null) === (ctx.partieId || null) && (ligne.jeu || null) === (ctx.packId || null)) {
            setConsoleFil(f => {
              if (f.some(x => x.id === ligne.id)) return f; /* anti-écho */
              return [ligne, ...f].slice(0, 80); /* V0.43 : le plus récent naît EN TÊTE */
            });
          }
          /* V0.66 — LE SALON DU JEU : la Taverne du d100 vit le canal de
             SON JDR, hors de toute aventure. */
          const sidJeu = salonJeuIdRef.current;
          if (sidJeu && (ligne.partie_id || null) === null && (ligne.jeu || null) === sidJeu) {
            setSalonJeuFil(f => {
              if (f.some(x => x.id === ligne.id)) return f; /* anti-écho */
              return [ligne, ...f].slice(0, 80);
            });
          }
          return;
        }
        /* LA PARTIE : les poussées du lobby et de la table. */
        if (donnee && donnee.table === "archiviste_parties" && ligne) {
          if (evType === "INSERT") { rechargerListes(); return; } /* une aventure s'ouvre */
          if (evType === "UPDATE") {
            if (partieIdRef.current && ligne.id === partieIdRef.current) {
              /* V46 : la partie a été SUPPRIMÉE (par nous ou l'institution) —
                 on quitte la table sans demander pardon. */
              if (ligne.supprime_le) {
                setVue("hub");
                setPartie(null);
                setPartieJoueurs([]);
                setFichesPartie([]);
                setPackPartie(null);
                setModePartie(null);
                showToast("Cette aventure a été effacée.");
                return;
              }
              /* fusion : la ligne poussée est brute (sans mj_pseudo) — on
                 garde le pseudo du MJ déjà connu de la vue lobby */
              /* V47 : la salle est REFERMÉE (le MJ s'en est allé) — les
                 joueurs présents dans la salle d'attente sortent sans
                 demander pardon ; plus personne ne reprend une salle
                 que personne ne tient. */
              if (!ligne.salle_ouverte_le && ligne.statut === "ouverte" && vueRef.current === "partie") {
                setPartie(null);
                setPartieJoueurs([]);
                setFichesPartie([]);
                showToast("La salle est refermée — le MJ ne la tient plus.");
                rechargerListes();
                return;
              }
              setPartie(prev => ({ ...(prev || {}), ...ligne, mj_pseudo: ligne.mj_pseudo || (prev && prev.mj_pseudo) })); /* notre salle suit : ouverte → en_cours, ou close */
              if (ligne.statut === "close") {
                setVue("hub");
                setPartie(null);
                setPartieJoueurs([]);
                setFichesPartie([]);
                showToast("L'aventure est close par le MJ.");
              }
            }
            rechargerListes(); /* V48.9 elle RESTE au lobby — tenue, rejoignable */
          }
          return;
        }
        if (donnee && donnee.table === "archiviste_partie_joueurs") {
          if (partieIdRef.current && ligne && ligne.partie_id === partieIdRef.current) {
            rechargerPartie(); /* la table de NOTRE partie vit */
          }
          return;
        }
        /* V43 — LES FICHES : une création d'unité, une blessure, un PV
           gravé — la table entière le voit. On recharge TOUTES les
           fiches de la partie (la vue lobby porte les pseudos). */
        if (donnee && donnee.table === "archiviste_partie_fiches") {
          if (partieIdRef.current && ligne && ligne.partie_id === partieIdRef.current) {
            rechargerFiches();
          }
          return;
        }
        relance();
      },
      surEtat: (etat) => {
        setEtatTempsReel(etat);
        if (etat === "branche") relance(); /* on a peut-être raté des poussées pendant la coupure */
      }
    });
    canalPresenceRef.current = canal; /* V47 : pour re-pister au changement de pack */
    const auRetour = () => { if (document.visibilityState === "visible") verifierSession(); };
    document.addEventListener("visibilitychange", auRetour);
    return () => {
      canal.fermer();
      canalPresenceRef.current = null;
      document.removeEventListener("visibilitychange", auRetour);
      if (attente) clearTimeout(attente);
    };
  }, [CLOUD, session ? session.compteId : null]); /* ⚠️ compteId SEUL, et JAMAIS
      nu : les deps sont évaluées à CHAQUE rendu, même session null (avant
      connexion) — « session.compteId » nu = écran noir. Avec « session »
      entier en dépendance, l'effet bouclait (fermer → leave → rejoindre →
      track) et le point clignotait rouge/vert au registre. */

  /* V47 : quand on entre dans le pack d'une aventure (ou qu'on le quitte),
     on RE-PISTE — les présents voient notre nouvelle place sans attendre. */
  useEffect(() => {
    if (!CLOUD || !session) return;
    if (canalPresenceRef.current && canalPresenceRef.current.annoncer) {
      canalPresenceRef.current.annoncer({ compte_id: session.compteId, pseudo: session.pseudo, jeu: (packPartie && packPartie.id) || null });
    }
  }, [packPartie ? packPartie.id : null]); /* le pack seul — pas session (bouclerait) */

  /* La pulsation de SECOURS : seulement quand le canal temps réel est coupé. */
  useEffect(() => {
    if (!CLOUD || !session || etatTempsReel === "branche") return;
    const secours = setInterval(() => verifierSession(), 30000);
    return () => clearInterval(secours);
  }, [session, etatTempsReel]);

  /* Le glyphe du launcher : l'Icosaèdre D20 — CHOISI par Michael, point final.
     La Cible aux quatre coupes reste dans la bibliothèque de symboles de
     l'Archivisterium. */
  const [symbole] = useState("d20");

  /* Détection navigateur / mobile : la largeur d'écran réelle du device.
     Sur mobile, le compte n'affiche que l'avatar (comme Steam). */
  const [estMobile, setEstMobile] = useState(false);
  const [ecran, setEcran] = useState("auto"); // auto | desktop | mobile (simulation forcée)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 640px)");
    const maj = () => setEstMobile(mq.matches);
    maj();
    mq.addEventListener("change", maj);
    return () => mq.removeEventListener("change", maj);
  }, []);
  const mobile = ecran === "auto" ? estMobile : ecran === "mobile";

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const basculerFavori = (id) =>
    setFavoris(f => (f.includes(id) ? f.filter(x => x !== id) : [...f, id]));

  /* Installer un pack depuis le magasin : simulation de téléchargement local —
     SANS choix de rôle (tous les comptes sont joueurs, le rôle se choisit au
     lancement). Une fois installé, la vignette du magasin passe en "Déjà
     installé" (grisée), et le pack se lance depuis la Bibliothèque. */
  const installerPack = (p) => {
    setEnInstallation(p.id);
    setTimeout(() => {
      setEnInstallation(null);
      setInstalles(l => (l.includes(p.id) ? l : [...l, p.id]));
      showToast(`${p.nom} installé — lancez-le depuis la Bibliothèque`);
    }, 1500);
  };

  /* V48.3 — L'ÉPURE : la désinstallation retire le pack de la bibliothèque
     locale. Les données du compte (personnages, aventures, fiches) restent
     gravées dans la Tombe — réinstaller retrouve tout. */
  const desinstallerPack = (p) => {
    setInstalles(l => l.filter(id => id !== p.id));
    showToast(`${p.nom} désinstallé — vos personnages et aventures restent dans la Tombe.`);
  };

  /* Lancer un pack : les packs SOLO gardent le choix du rôle au
     lancement ; les packs MULTIJOUEUR passent par LA PARTIE — le lobby,
     le code, le MJ qui lance, et l'entrée poussée (le rôle dérive de
     la table, on ne le choisit plus à la main). */
  const lancerPack = (p) => {
    if (p.multijoueur) {
      if (!session) {
        showToast("Connectez-vous pour ouvrir ou rejoindre une aventure.");
        return;
      }
      setModePour(p); /* V46 : le mode (MJ/joueur) se choisit à chaque lancement */
      return;
    }
    setRolePour(p);
  };

  /* V46 : le mode entre dans l'écran de partie — MJ gère ses aventures,
     joueur garde ses personnages et les règles. Le rôle réel en table
     reste dérivé : le créateur d'une aventure en est le MJ. */
  const choisirModePartie = (mode) => {
    const p = modePour;
    setModePour(null);
    setPartie(null);
    setPartieJoueurs([]);
    setFichesPartie([]);
    setModePartie(mode);
    /* V48.2 — le pack de l'écran de partie doit être CHARGÉ (contenu + noyau),
       pas le manifeste brut : sinon l'onglet PERSONNAGES ne résout pas son
       écran de création (pack.contenu.creation = undefined) ni le livre. */
    setPackPartie(chargerPack(p));
    setVue("partie");
  };

  const choisirRole = (role) => {
    const p = rolePour;
    setRolePour(null);
    setRolesPacks(r => ({ ...r, [p.id]: role }));
    setPackActif(chargerPack(p)); /* le manifeste devient un pack CHARGÉ : noyau résolu + sac de données */
    setVue("chargement");
    setEtapes([]);
    const liste = etapesChargement(p, role);
    setTotalEtapes(liste.length);
    liste.forEach((t, i) => setTimeout(() => setEtapes(e => [...e, t]), 320 * (i + 1)));
    setTimeout(() => setVue("pack"), 320 * liste.length + 550);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0c0d10" }}>
      {vue === "hub" && (
        <Hub key={session ? session.compteId : "anonyme"} packs={PACKS} favoris={favoris} onFavori={basculerFavori} onLancer={lancerPack} onInstaller={installerPack} onDesinstaller={desinstallerPack}
          showToast={showToast}
          joueur={session}
          avatar={session ? (AVATARS.find(a => a.id === session.avatarId) || AVATARS[0]) : null}
          onAvatar={changerAvatar}
          onLogout={seDeconnecter}
          onLogin={seConnecter} onCreer={creerProfil}
          mobile={mobile} ecran={ecran} setEcran={setEcran}
          installes={installes} enInstallation={enInstallation}
          symbole={symbole} versionBase={versionBase} />
      )}

      {vue === "attente" && session && (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0c0d10", fontFamily: "'Rajdhani','Segoe UI',system-ui,sans-serif" }}>
          <div className="rounded-2xl p-8 w-full max-w-md text-center" style={{ background: "#14161b", border: "1px solid #f0b24a33" }}>
            <div className="flex justify-center mb-4"><Icosaedre size={64} color="#f0b24a" /></div>
            <div className="font-bold text-xl mb-2" style={{ color: "#e8e4d8" }}>Votre compte attend le sceau de l'Archiviste.</div>
            <div className="text-sm mb-6" style={{ color: "#71717a" }}>
              Bienvenue, {session.pseudo} — votre inscription est bien gravée dans la Tombe,
              mais l'Archiviste doit apposer sa validation avant que les archives ne s'ouvrent.
              Revenez plus tard.
            </div>
            <button onClick={seDeconnecter} className="px-4 py-2 rounded-lg font-bold text-sm text-black" style={{ background: "#a8adb8" }}>
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      {vue === "chargement" && packActif && (
        <div className="min-h-screen flex items-center justify-center" style={{ background: packActif.theme.fond, fontFamily: "'Rajdhani','Segoe UI',system-ui,sans-serif" }}>
          <div className="rounded-2xl p-8 w-full max-w-md" style={{ background: "#ffffff0a", border: "1px solid " + packActif.theme.accent + "44" }}>
            <div className="flex items-center gap-3 mb-5">
              <Icosaedre size={38} color={packActif.theme.accent} />
              <div>
                <div className="font-bold text-lg" style={{ color: "#e8e4d8" }}>Chargement de {packActif.nom}…</div>
                <div className="text-xs" style={{ color: "#71717a" }}>pack installé — chargement local, aucune connexion requise</div>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              {etapes.map((e, i) => (
                <div key={i} style={{ color: "#c8c8ce" }}>✓ {e}</div>
              ))}
              {etapes.length < totalEtapes && <div className="animate-pulse" style={{ color: packActif.theme.accent }}>⟁ …</div>}
            </div>
          </div>
        </div>
      )}

      {vue === "partie" && packPartie && session && (
        <EcranPartie
          pack={packPartie} session={session} mode={modePartie}
          partie={partie} partieJoueurs={partieJoueurs}
          partiesOuvertes={partiesOuvertes} mesAventures={mesAventuresListe} mdpsClairs={mdpsClairs}
          presents={Object.values(presents)} mdpSalle={mdpSalle}
          mesPersonnages={mesPersonnages} versionBase={versionBase}
          filSalon={consoleFil} onEnvoyerSalon={envoyerConsoleMessage} salonEnvoi={consoleEnvoi} onRelireSalon={relireConsole}
          onCreerPersonnage={(p) => creerPersonnageRegistre(packPartie.id, p)}
          onSupprimerPersonnage={(p) => supprimerPersonnageRegistre(packPartie.id, p)}
          persoChoisi={persoChoisi[packPartie.id]}
          onChoisirPerso={(p) => choisirPersoAventure(packPartie.id, p)}
          onCreer={creerAventure} onRejoindre={rejoindreAventure}
          onRejoindreMdp={rejoindreAventureMdp} onOuvrirSalle={ouvrirSalleAventure} onReprendre={reprendreAventure} onGraverMdp={graverMdpSalle}
          onLancer={lancerAventure} onFermer={fermerAventure} onQuitter={quitterAventure} onSupprimer={supprimerAventure}
          onAvatar={changerAvatar} onLogout={seDeconnecter} mobile={mobile}
          onRetour={() => {
            /* V47 : le MJ qui quitte la salle d'attente la REFERME — plus
               personne ne peut entrer tant qu'il ne l'ouvre pas de nouveau. */
            if (partie && session && partie.mj_compte_id === session.compteId && partie.statut === "ouverte" && partie.salle_ouverte_le) {
              CLOUD.fermerSalle(partie.id).catch(() => {});
              showToast("Salle fermée — elle a quitté le lobby de tous.");
            }
            setPartie(null); setPartieJoueurs([]); setFichesPartie([]); setModePartie(null); setMesAventuresListe([]); setPackPartie(null); setVue("hub");
          }}
        />
      )}

      {vue === "pack" && packActif && (() => {
        const dep = packActif.depend_de[0];
        const Vue = dep && VUES[dep.id] && packActif.noyau && packActif.contenu ? VUES[dep.id] : VueInconnue;
        /* En partie, le rôle ne se choisit plus : il DÉRIVE de la table —
           le créateur est MJ, les autres joueurs. Le reste (solo) garde
           le rôle du dernier lancement. */
        const enPartie = !!(partie && partie.jeu === packActif.id && partie.statut === "en_cours");
        const role = enPartie
          ? (session && partie.mj_compte_id === session.compteId ? "mj" : "joueur")
          : rolesPacks[packActif.id];
        return (
          <>
            {/* V0.57 : la console de partie vit dans le SALON de chaque
                jeu (onglet du pack) — plus de bandeau bas de page. */}
            <div>
              {/* V43 : en partie, la Vue reçoit LA TABLE — l'id de la
                  partie, les fiches vivantes (avec pseudos), les
                  joueurs, mon compte, et la sauvegarde de ma fiche.
                  V0.49 : la Vue reçoit AUSSI le joueur, son avatar, et
                  le canal console de partie (noyau-40k : CANTINA). */ }
              <Vue pack={packActif} role={role} table={enPartie ? { partieId: partie.id, fiches: fichesPartie, joueurs: partieJoueurs, monCompteId: session && session.compteId, onFiche: sauverFiche, persos: mesPersonnages } : null} onRetour={() => { /* V0.37 : le MJ qui quitte la table ne referme PLUS la salle — l'aventure reste EN LIGNE, joueurs dedans, il revient par ⚙ → REPRENDRE sans rien casser. (V47 ne fermait que la salle d'attente, on n'y touche pas : ici on n'est qu'en partie lancée.) */ /* V48.5 : quitter le jeu vide aussi l'état de partie — la ronde re-piste (jeu → null) et le joueur quitte le CONNECTÉS du JDR au lieu d'y rester fantôme. */ setPartie(null); setPartieJoueurs([]); setFichesPartie([]); setModePartie(null); setPackPartie(null); setVue("hub"); }} onJournal={journalVersConsole}
                joueur={session} avatar={session ? (AVATARS.find(a => a.id === session.avatarId) || AVATARS[0]) : null}
                consolePartie={enPartie ? { fil: consoleFil, onEnvoyer: envoyerConsoleMessage, joueur: session, enEnvoi: consoleEnvoi, presents: Object.values(presents).filter(j => j && j.jeu === packActif.id) } : null}
                salonJeu={{ fil: salonJeuFil, onEnvoyer: envoyerSalonJeu, joueur: session, enEnvoi: consoleEnvoi, presents: Object.values(presents).filter(j => j && j.jeu === packActif.id) }}
                versionBase={versionBase}
                livreSb={livreSb}
                persos={mesPersonnages}
                onCreerPersonnage={(p) => creerPersonnageRegistre(packActif.id, p)}
                onSupprimerPersonnage={(p) => supprimerPersonnageRegistre(packActif.id, p)}
                onModifierPersonnage={(p) => modifierPersonnageRegistre(packActif.id, p)}
                persoChoisi={persoChoisi[packActif.id]}
                onChoisirPerso={(p) => choisirPersoAventure(packActif.id, p)}
      onAvatar={changerAvatar} onLogout={seDeconnecter} />
            </div>
          </>
        );
      })()}

      {rolePour && (
        <ChoixRole pack={rolePour} onChoisi={choisirRole} onAnnuler={() => setRolePour(null)} />
      )}

      {modePour && (
        <ChoixModePartie pack={modePour} onChoisi={choisirModePartie} onAnnuler={() => setModePour(null)} />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-sm font-bold text-black shadow-2xl z-50"
          style={{ background: "#a8adb8" }}>
          {toast}
        </div>
      )}
    </div>
  );
}