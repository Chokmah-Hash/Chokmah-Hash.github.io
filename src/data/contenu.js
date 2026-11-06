const CONTENU = {
  "GM-0001": {
    surcharges: SURCHARGES,
    salon: "CANTINA",
    primitive: "resoudreTest(cible, modificateur) — 1D6 ≥ cible",
    perso: SIGNA, adversaire: ORK, armes: ARMES,
    chassis: PE_CHASSIS, codes: PE_CODES, arsenal: PE_ARMES,
    creation: "unite",
    textes: { creer: "⚙ Créer une unité", recreer: "↺ Créer une nouvelle unité" },
    journalCreation: "Éveil de {nom} — {chassis} · code {code} · PV {pvMax} (W×3) · Rfx +{rfx} · {arme}",
    documents: [
      { id: "regles-pe", titre: "Livret des règles (extraits)", sections: [
        { titre: "Les tests", blocs: [
          { type: "para", texte: "Tout test se résout par un jet de 1D6 contre une cible fixe, ajustée par la situation (±1). Un 6 naturel réussit toujours ; un 1 naturel échoue toujours." },
          { type: "liste", items: ["Cible 2+ : trivial", "Cible 3+ : aisé", "Cible 4+ : ordinaire", "Cible 5+ : difficile", "Cible 6+ : héroïque"] }
        ] },
        { titre: "Le combat", blocs: [
          { type: "para", texte: "La séquence du noyau : toucher → blesser (F vs E) → sauvegarde (PA) → dégâts. L'arme porte tout : attaques, Force, PA, dégâts." },
          { type: "table", entetes: ["F vs E", "Cible de blessure"], lignes: [["F ≥ E×2", "2+"], ["F > E", "3+"], ["F = E", "4+"], ["F < E", "5+"], ["F ≤ E/2", "6+"]] },
          { type: "para", texte: "Initiative : 1D6 + Rfx (surcharge du mod). À 0 PV, le Protocole de Secours se déclenche : sur 5+, l'unité se redresse avec 1 PV ; sinon, extraction d'urgence hors scène." }
        ] },
        { titre: "L'éveil — créer une unité", blocs: [
          { type: "para", texte: "Chaque unité naît de l'union d'un châssis (10 profils du manuel joueur) et d'un code de fabrique ; l'arsenal neutre arme le tout." },
          { type: "liste", items: ["Châssis : profil de base, PV (W×3), Rfx, Mémoire/Calcul, aptitude de châssis, compétences offertes", "Codes de fabrique : Éternel, Pragmatique, Sanguinaire, Solaire, Tutélaire, Fondateur", "Arsenal : « A » et « F+1 » se résolvent contre les stats de l'unité"] }
        ] },
        { titre: "Progression (règles maison)", blocs: [
          { type: "para", texte: "Le pack fait la loi des prix : les dépenses se font en fenêtre de progression sanctifiée (HUB) ; le moteur refuse gentiment au-delà du plafond de gains MJ (1 à 3 XP par séance)." },
          { type: "table", entetes: ["Amélioration", "Coût"], lignes: [["+1 PV (max base×2)", "5 XP"], ["CC / CT un cran", "10 XP"], ["+1 Réflexes", "10 XP"], ["Compétence", "8 XP"], ["Aptitude", "12 XP"], ["+1 Attaque", "12 XP"], ["Wargear", "15-25 XP"]] }
        ] }
      ] }
    ]
  },
  "GM-0002": {
    surcharges: ["critique « 01 »/« 00 » (BRP)", "jets sous carac ×multiplicateur (POU×3, CHA×5)", "lutte de POU : 50 % ± 5 %/pt d'écart", "création : 7×3D6, total ≤ 52 · SAN = POU×5"],
    salon: "TAVERNE",
    primitive: "resoudreD100(seuil %, modificateur)",
    critiques: "brp",
    perso: SB_PERSO, demon: SB_DEMON, ordreCaracs: SB_7, totalCaracs: 52,
    mults: [{ carac: "POU", mult: 3, label: "lier un démon" }, { carac: "CHA", mult: 2, label: "marchander" }, { carac: "CHA", mult: 5, label: "marché démoniaque" }],
    lutte: { base: 50, pas: 5 },
    /* V0.62 — LE CATALOGUE COMPLET DU MANUEL (livre v2, §4.11) : la fiche
       montre TOUTES les compétences du livre, même celles à 0. Une compétence
       non apprise mais jouable se tire sur le bonus de sa famille ; les
       « 0 % » exigent un maître. Les gagnées en jeu absentes du livre
       (Chirurgie, Méditation, Multivers…) restent rangées sous leur famille ;
       les compétences non répertoriées passent sous « AUTRES » — jamais cachées. */
    themesCompetences: {
      "ARMES - ARMURES": ["Armes naturelles", "Attaque", "Parade", "Esquive", "Bouclier", "Escrime", "Armes d'hast", "Lancer", "Tir", "Matraquer", "Orgien"],
      "CONNAISSANCE": ["Artisanat", "Cartographie", "Chirurgie", "Connaissance de la musique", "Connaissance des plantes", "Connaissance des poisons", "Connaissance des démons", "Évaluer un trésor", "Méditation", "Méditation relaxante", "Mémoriser", "Multivers", "Naviguer", "Premiers soins"],
      "INVOCATION": ["Invocation", "Sylphe", "Gnome", "Ondine", "Salamandre", "Démon de combat", "Démon de garde", "Démon de possession", "Démon de voyage"],
      "PERCEPTION": ["Chercher", "Écoute", "Écouter", "Goûter", "Sentir", "Équilibre", "Pister", "Voir"],
      "COMMUNICATION": ["Langue commune", "Langage commun", "Bas melnibonéen", "Haut melnibonéen", "Éloquence", "Chanter", "Commandement", "Jouer d'un instrument", "Séduire"],
      "MANIPULATION": ["Crocheter", "Crédit", "Jongler", "Passe-passe", "Persuader", "Faire des nœuds", "Amorcer un piège"],
      "AGILITÉ": ["Élan", "Éviter", "Équitation", "Grimper", "Sauter", "Culbuter", "Danser", "Canotage", "Natation"],
      "DISCRÉTION": ["Se cacher", "Mouvement silencieux", "Dissimuler", "Embuscade", "Couper une bourse", "Se déguiser", "Discrétion", "Filature"]
    },
    /* V0.62 — LE « % DE DÉPART » DE CHAQUE COMPÉTENCE (livre v2, §4.11) :
       « 10+ » tout le monde débute à 10 % + bonus · « bonus » on débute avec
       le seul bonus de famille (un jet à 0 se fait SUR CE BONUS) · « 0 » un
       maître doit l'enseigner avant tout jet · null : alias d'orthographe,
       jamais affiché à 0. */
    departCompetences: {
      "Mouvement silencieux": "10+", "Se cacher": "10+", "Embuscade": "bonus", "Dissimuler": "bonus", "Couper une bourse": "bonus", "Se déguiser": "bonus", "Discrétion": "bonus", "Filature": "bonus",
      "Élan": "bonus", "Éviter": "bonus", "Équitation": "bonus", "Grimper": "10+", "Sauter": "10+", "Culbuter": "bonus", "Danser": "bonus", "Canotage": "bonus", "Natation": "bonus",
      "Crocheter": "bonus", "Crédit": "bonus", "Jongler": "bonus", "Passe-passe": "bonus", "Persuader": "10+", "Faire des nœuds": "bonus", "Amorcer un piège": "bonus",
      "Chercher": "bonus", "Écoute": "10+", "Écouter": null, "Goûter": "bonus", "Sentir": "bonus", "Équilibre": "10+", "Pister": "bonus", "Voir": "10+",
      "Évaluer un trésor": "bonus", "Naviguer": "bonus", "Artisanat": "bonus", "Premiers soins": "bonus", "Cartographie": "bonus", "Mémoriser": "bonus", "Connaissance des poisons": "0", "Connaissance des plantes": "0", "Connaissance de la musique": "0", "Chirurgie": "bonus", "Méditation": "bonus", "Méditation relaxante": "bonus", "Multivers": "bonus", "Connaissance des démons": "bonus",
      "Éloquence": "bonus", "Chanter": "bonus", "Commandement": "bonus", "Jouer d'un instrument": "bonus", "Séduire": "bonus", "Langue commune": "0", "Langage commun": null, "Bas melnibonéen": "0", "Haut melnibonéen": "0"
    },
    /* V0.62 — LA RÈGLE DES BONUS DE FAMILLE DU LIVRE V2 (§2.5) : le noyau
       les calcule depuis les caracs (bonusFamilles dans le moteur). */
    bonusCompetences: "stormbringer-v2",
    aideJet: "« 01 » réussite critique",
    creation: "aventurier",
    textes: { creer: "Créer un aventurier", recreer: "↺ Créer un nouvel aventurier" },
    journalCreation: "Fait naître {nom}, {origine} — 7 caracs 3D6 (total {total}/52) · SAN {sanMax} (POU {pou}×5)",
    documents: [
      { id: "regles-sb", titre: "Livre du Joueur (extraits)", sections: [
        { titre: "Création de l'aventurier", blocs: [
          { type: "para", texte: "Sept caractéristiques (FOR, CON, TAI, INT, POU, DEX, CHA), chacune lancée à 3D6 (3-18). Si le total dépasse 52, le livre permet de tout relancer." },
          { type: "para", texte: "Santé Mentale de départ = POU × 5. Un repos restaure la SAN (squelette alpha)." }
        ] },
        { titre: "Les tests", blocs: [
          { type: "para", texte: "Jet sous le pourcentage : 1D100 ≤ seuil. « 01 » = réussite critique, « 00 » = échec automatique. Les caracs se lancent en brute, ×2, ×3 ou ×5 selon l'action." }
        ] },
        { titre: "Les bonus aux compétences (livre v2, §2.5)", blocs: [
          { type: "para", texte: "Chaque famille gagne un bonus calculé sur les caracs : +1 % par point au-dessus de 12, −1 % par point en dessous de 9 — la TAI s'inverse pour la Parade, l'Agilité et la Discrétion. Une carac qui change, le bonus est recalculé." },
          { type: "liste", items: ["Attaque : FOR + INT + POU + DEX", "Parade : FOR + POU + DEX, moins la TAI", "Agilité : FOR + POU + DEX, moins la TAI", "Manipulation : FOR + INT + POU + DEX", "Perception : INT + POU", "Discrétion : INT + DEX, moins la TAI", "Communication : CHA + INT + POU", "Connaissance : 2 % par point d'INT au-dessus de 12, plus 1 % par année au-delà de 25 ans (Nobles 2 %, Prêtres 3 %)"] },
          { type: "para", texte: "Une compétence non apprise de type « Bonus » se joue sur le bonus de sa famille ; « 10 % + » part de 10 + le bonus ; les compétences « 0 % » (Poisons, Plantes, Musique, langues) exigent un maître avant tout jet." }
        ] },
        { titre: "La lutte de Pouvoir", blocs: [
          { type: "para", texte: "50 % ± 5 % par point d'écart de POU. Les deux réussissent ou échouent : la lutte se prolonge. Défaite : −1D6 SAN." }
        ] },
        { titre: "Les démons", blocs: [
          { type: "para", texte: "Contrôle : CHA/2 démons liés par l'octogone ; le nombre d'anneaux gravés limite la puissance du démon convoqué." }
        ] }
      ] }
    ]
  },
  "GM-0003": {
    surcharges: ["paliers +50/+25/0/−25/−50", "réussite critique unités 0 · échec critique unités 1", "contrôle VO×5 · PV EN×2 · plancher 5 %"],
    salon: "CAMP",
    primitive: "resoudreD100(seuil %, modificateur)",
    critiques: "bloodlust",
    perso: BL_PORTEUR, forge: BL_ARME, tablesForge: BL_TABLES, paliers: PALIERS_BL,
    peuples: BL_PEUPLES, desirsPeuples: BL_DESIRS_PEUPLES, desirsNoms: DESIRS_BL, baseCombat: BL_BASE_COMBAT, baseSecondaires: BL_BASE_SECONDAIRES,
    derivees: [{ label: "PV = EN×2", source: "EN", mult: 2 }, { label: "Contrôle = VO×5", source: "VO", mult: 5, suffixe: " %" }],
    controle: { carac: "VO", mult: 5 },
    aideJet: "critique = unités 0, échec critique = unités 1",
    forgeAide: "Tables officielles p. 96-100 · prix = palier 1 · un même pouvoir une seule fois · exotiques 4 jets max · limitations 2 jets max · « 99-00 » : au choix du joueur",
    horsCombat: { seuil: "5+", pv: 1 }, /* Protocole de Secours — surcharge du mod PÉ */
    creation: "porteur",
    textes: { creer: "🧬 Créer un porteur", recreer: "↺ Créer un nouveau porteur" },
    journalCreation: "Fait naître {nom}, {peuple} — PV {pv} · contrôle {controle} % (l'arme, elle, attend sa forge)",
    documents: [
      { id: "regles-bl", titre: "Livre de règles (extraits)", sections: [
        { titre: "Le porteur", blocs: [
          { type: "para", texte: "Caractéristiques par table raciale du peuple (livre p. 82). PV = EN×2 ; test de contrôle de l'Arme = VO×5." },
          { type: "para", texte: "Cinq désirs notés de 1 à 10 (Prestige, Richesse, Sexe, Violence, Réputation) — un PJ ajuste les valeurs de sa table de ±1 à ±2 par désir. Un désir à 9 ou 10 brûle 🔥." }
        ] },
        { titre: "La forge de l'Arme vivante", blocs: [
          { type: "para", texte: "Règle d'or : après le jet de d%, le joueur CHOISIT l'ordre des deux chiffres. Le prix d'un pouvoir est son palier 1 ; l'arme part de la base de son type (épée longue : 20 pts)." },
          { type: "liste", items: ["Un même pouvoir ne s'acquiert qu'une seule fois", "Exotiques : 4 jets max · Limitations : 2 jets max (elles baissent le budget)", "« 99-00 » : pouvoir au choix du joueur", "Total > 100 points : l'arme s'ÉVEILLE ⚔"] }
        ] },
        { titre: "Les paliers de difficulté", blocs: [
          { type: "table", entetes: ["Palier", "Modificateur"], lignes: [["Très facile", "+50"], ["Facile", "+25"], ["Moyen", "±0"], ["Difficile", "−25"], ["Très difficile", "−50"]] },
          { type: "para", texte: "Plancher de réussite : 5 %. « 00 » = échec automatique. Réussite critique : unités 0 · échec critique : unités 1." }
        ] }
      ] }
    ]
  }
};
/* §FIN:PACKS_DATA§ */

