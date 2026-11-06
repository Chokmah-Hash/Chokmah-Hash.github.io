/* ── Le magasin : de la donnée ── */
const PACKS = [
  {
    format: 1, id: "GM-0001", version: "0.1.0-alpha",
    type: "mod", nom: "Protocole Ω",
    sousTitre: "K-BoT", /* V0.64 : le sous-titre de l'entête vient du manifeste */
    multijoueur: true, /* V4 : se lance par LA PARTIE — lobby, code, MJ et joueurs */
    depend_de: [{ id: "noyau-40k", format_min: 1 }],
    statut: "disponible", visibilite: "prive", taille: "18 Mo",
    theme: { nom: "nécroderme", fond: "#0a120f", accent: "#2ee6c9", or: "#f0b24a" },
    resume: "Gardiens royaux amnésiques dans la chair d'une tombe qui murmure. Version light light : fiche, dés, combat, journal.",
    glyphs: "⟁"
  },
  {
    format: 1, id: "GM-0002", version: "0.1.0-alpha",
    type: "mod", nom: "Stormbringer",
    sousTitre: "Cycle d'Elric",
    depend_de: [{ id: "noyau-d100", format_min: 1 }],
    livre: "sb-v2", /* V0.63 : le livre gravé (données v7.0) fetché à l'entrée du pack */
    statut: "disponible", visibilite: "prive", taille: "9 Mo",
    theme: { nom: "des Jeunes Royaumes", fond: "#141021", accent: "#9d86e8", or: "#cbb26b" },
    resume: "L'épée noire, Law et Chaos. Squelette alpha : fiche D100, jets sous carac ×multiplicateur, lutte de POU, Santé Mentale.",
    glyphs: "⚔"
  },
  {
    format: 1, id: "GM-0003", version: "0.1.0-alpha",
    type: "mod", nom: "Bloodlust",
    sousTitre: "Les armes-dieux",
    depend_de: [{ id: "noyau-d100", format_min: 1 }],
    statut: "disponible", visibilite: "prive", taille: "12 Mo",
    theme: { nom: "de Tanæphis", fond: "#190b0e", accent: "#e0524d", or: "#d4a24e" },
    resume: "Les porteurs d'Armes vivantes de Tanæphis. Squelette alpha : désirs, forge de l'arme (budget 100 points), contrôle VO×5, paliers de difficulté.",
    glyphs: "🗡"
  }
];

