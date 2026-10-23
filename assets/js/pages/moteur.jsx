/* Moteur d'aventure — Espace MJ — Les Protocoles Éternels
   PE_BUILD 2026.10.21-mot10b — JSX compilé côté navigateur par Babel standalone (React/ReactDOM UMD)
   Source de vérité : canvas « simulation-espace-mj » — resync live = recopier le corps React ici
   Sauvegarde : serveur (RPC moteur_sauvegarder / moteur_charger, compte Maître de la Tombe) + copie locale « pe_sim_mj »
   Onglet Équipement : vrais personnages des joueurs (RPC mj_lister_personnages / mj_donner_equipement)
   Navigation Aventures/Équipement/Monde : cadre en HAUT de page (mot10b, l'ancien bas de page est supprimé) */
var PE_BUILD = "2026.10.21-mot10b";
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var SBRPC='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/rpc/moteur_publier_aventure';
var SBSAVE='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/rpc/moteur_sauvegarder';
var SBCHARGE='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/rpc/moteur_charger';
var SBLISTEP='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/rpc/mj_lister_personnages';
var SBDONNER='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/rpc/mj_donner_equipement';
var SBORACLE='https://dnbnkdakmobufqcrqzpq.supabase.co/functions/v1/oracle';
window.PE_BUILD = PE_BUILD;
const { useState, useEffect, useRef } = React;

const DE = "\u{1F3B2}";
const CLE = "pe_sim_mj";

const JOUEURS = [
  { id: "signa3", nom: "Signa-3", role: "Vétéran Solaire", ini: 5, cd: 3, armeId: "baton" },
  { id: "nyx9", nom: "Nyx-9", role: "Artificier", ini: 3, cd: 4, armeId: "gauss" },
  { id: "garde78", nom: "Garde-78", role: "Sentinelle", ini: 2, cd: 3, armeId: "fusion" },
  { id: "athan4", nom: "Athan-4", role: "Garde-lych", ini: 4, cd: 2, armeId: "lame" }
];

const ARMES = {
  baton: { nom: "Bâton de dispersion", min: 6, max: 12 },
  gauss: { nom: "Canon à gauss", min: 8, max: 14 },
  griffes: { nom: "Griffes Canoptek", min: 3, max: 6 },
  lame: { nom: "Lame d'assaut", min: 4, max: 8 },
  fusion: { nom: "Pistolet à fusion", min: 5, max: 9 },
  mains: { nom: "Mains nues", min: 2, max: 5 }
};
const ARMES_IDS = Object.keys(ARMES);

const BESTIAIRE = [
  { id: "ctan", nom: "Fragment de C'tan", pv: 60, cd: 2, armeId: "baton" },
  { id: "hfg", nom: "Homme de fer de guerre", pv: 40, cd: 3, armeId: "gauss" },
  { id: "eco", nom: "Écorché", pv: 25, cd: 4, armeId: "lame" },
  { id: "hf", nom: "Homme de fer", pv: 30, cd: 3, armeId: "fusion" },
  { id: "espions", nom: "Espions Canoptek", pv: 20, cd: 5, armeId: "griffes" },
  { id: "scarabees", nom: "Scarabées Canoptek", pv: 15, cd: 5, armeId: "griffes" }
];

const OBJETS_BASE = {
  carnet: "Carnet de bord",
  reacteur: "Réacteur à fusion MK4",
  coeur: "Cœur de quartz",
  fusil: "Fusil à induction",
  cellule: "Cellule d'énergie",
  cle: "Clé de cryptomère"
};
const OBJETS_IDS = Object.keys(OBJETS_BASE);

const LIEUX = [
  "9-Héra — site minier",
  "Galerie 9",
  "Le CHŒUR",
  "L'Éternité-Patiente",
  "Secteur Θ-7",
  "Nébuleuse du Crâne Sombre",
  "Épave perdue",
  "Nécropole de Zulthekh"
];

const POIS = {
  "9-Héra — site minier": ["Puits d'extraction 12", "Baraquements", "Antenne de contrôle", "Sas de confinement"],
  "Galerie 9": ["Voie de roulage B", "Cul-de-sac effondré", "Chambre des foreuses"],
  "Le CHŒUR": ["Nef centrale", "Autel du C'tan", "Crypte des cantiques"],
  "L'Éternité-Patiente": ["Pont de commandement", "Soutes", "Hangar d'entretien"],
  "Secteur Θ-7": ["Balise thêta", "Champs de débris", "Relais silencieux"],
  "Nébuleuse du Crâne Sombre": ["Nuée sombre", "Station sans nom", "Seuil de saut"],
  "Épave perdue": ["Coque déchirée", "Coursives noyées", "Module de pilotage", "Salle des moteurs"],
  "Nécropole de Zulthekh": ["Porte des sceaux", "Salle des protocoles", "Galerie des dormants"]
};

const VERBES = { communiquer: "Communiquer", attaquer: "Attaquer", sortir: "Sortir", aller: "Aller vers" };

function d6() { return 1 + Math.floor(Math.random() * 6); }
function rr(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function uid() {
  try { if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
  return "u" + Date.now() + "-" + Math.floor(Math.random() * 1000000000);
}
function cloner(o) { return JSON.parse(JSON.stringify(o)); }
function coulInteg(p) { return p > 60 ? "text-emerald-400" : (p > 30 ? "text-amber-400" : "text-red-400"); }
function verbeDe(c) {
  const l = (c.libelle && String(c.libelle).length) ? String(c.libelle) : (VERBES[c.type] || "?");
  const i = l.search(/—|:/);
  return i > 0 ? l.slice(0, i).trim() : l.trim();
}
function armeDe(id) { return ARMES[id] || ARMES.mains; }

function normTableau(v, cleId) {
  if (Array.isArray(v)) return v;
  if (v && typeof v === "object") {
    return Object.keys(v).map(k => {
      const el = v[k];
      if (el && typeof el === "object" && !Array.isArray(el)) {
        const c = cloner(el);
        if (cleId && c.id == null) c.id = k;
        return c;
      }
      return el;
    });
  }
  return [];
}

function aventTest() {
  return {
    id: "epave",
    titre: "L'Épave",
    test: true,
    scenes: [
      {
        id: "epave1", titre: "Coque déchirée",
        texte: "L'épave perdue émerge de la Nébuleuse du Crâne Sombre, coque ouverte comme une fleur de métal. Les scanners accrochent une signature d'énergie inconnue venant du module de pilotage. Sur le passage, des Espions Canoptek rôdent autour d'une capsule scellée. Un carnet de bord dépasse d'un coffre éventré.",
        lieu: "Épave perdue", poi: "Coque déchirée",
        pnjs: [{ bestId: "espions", nom: "Espions Canoptek", pv: 20, cd: 5, armeId: "griffes", sac: [{ baseId: "cellule", integrite: 70 }] }],
        objets: [{ baseId: "carnet", integrite: 88 }],
        choices: [{ type: "communiquer" }, { type: "attaquer" }, { type: "aller", cible: "fuite1" }]
      },
      {
        id: "fuite1", titre: "Fuite dans les coursives",
        texte: "Les alarmes de l'épave s'éveillent d'elles-mêmes. Les coursives noyées se referment, l'eau remonte dans les sas. Derrière vous, le métal se souvient encore de sa forme et tente de guérir — il faut courir.",
        lieu: "Épave perdue", poi: "Coursives noyées",
        pnjs: [], objets: [],
        choices: [{ type: "sortir" }, { type: "aller", cible: "pilotage1" }, { type: "aller", cible: "epave1" }]
      },
      {
        id: "pilotage1", titre: "Le module de pilotage",
        texte: "Au cœur du module, un Fragment de C'tan dérive entre les consoles mortes, chantant pour des machines qui n'écoutent plus. Une nuée d'Espions Canoptek veille dans les ombres. Sous une poutre tombée, le Réacteur à fusion MK4 ronronne encore, tiède.",
        lieu: "Épave perdue", poi: "Module de pilotage",
        pnjs: [
          { bestId: "ctan", nom: "Fragment de C'tan", pv: 60, cd: 2, armeId: "baton", sac: [{ baseId: "coeur", integrite: 95 }] },
          { bestId: "espions", nom: "Espions Canoptek", pv: 20, cd: 5, armeId: "griffes", sac: [] }
        ],
        objets: [{ baseId: "reacteur", integrite: 45 }],
        choices: [{ type: "communiquer" }, { type: "attaquer" }, { type: "aller", cible: "fuite1" }]
      }
    ]
  };
}

function defaut() {
  return {
    parties: {
      epave: { sceneId: "epave1", journal: [{ txt: "Début de la simulation — aventure « L'Épave »." }], degats: { signa3: 0, nyx9: 0, garde78: 0, athan4: 0 }, combat: null }
    },
    monde: [],
    inventaires: { signa3: [], nyx9: [], garde78: [], athan4: [] },
    statuts: { epave: "en_cours" },
    aventures: [aventTest()]
  };
}

function charger() {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return defaut();
    return normaliser(JSON.parse(brut));
  } catch (err) { return defaut(); }
}

function normaliser(e) {
  if (!e || !e.aventures) return defaut();
    if (!e.parties) e.parties = {};
    if (!e.monde) e.monde = [];
    if (!e.inventaires) e.inventaires = {};
    if (!e.statuts) e.statuts = {};
    JOUEURS.forEach(j => { e.inventaires[j.id] = normTableau(e.inventaires[j.id]); });
    e.aventures = normTableau(e.aventures, true).filter(a => a && typeof a === "object");
    e.aventures.forEach(a => {
      a.scenes = normTableau(a.scenes, true);
      a.scenes.forEach(s => {
        if (!s || typeof s !== "object") return;
        s.pnjs = normTableau(s.pnjs);
        s.objets = normTableau(s.objets);
        s.choices = normTableau(s.choices);
      });
      a.scenes = a.scenes.filter(s => s && typeof s === "object");
    });
    Object.keys(e.parties || {}).forEach(k => {
      const pp = e.parties[k];
      if (!pp || typeof pp !== "object") { delete e.parties[k]; return; }
      pp.journal = normTableau(pp.journal);
      if (pp.combat && typeof pp.combat === "object") {
        pp.combat.log = normTableau(pp.combat.log);
        pp.combat.ennemis = normTableau(pp.combat.ennemis);
      }
    });
  e.monde = normTableau(e.monde);
  return e;
}

function avecPartie(p, avId) {
  if (!p.parties[avId]) {
    const d = {}; JOUEURS.forEach(j => { d[j.id] = 0; });
    p.parties[avId] = { sceneId: null, journal: [], degats: d, combat: null };
  }
  if (!p.statuts[avId]) p.statuts[avId] = "en_cours";
  return p.parties[avId];
}

function nouveauCombat(pnjs) {
  return {
    phase: "initiative",
    ennemis: (pnjs || []).map(pn => {
      const a = armeDe(pn.armeId);
      return {
        uid: uid(), nom: pn.nom || "Créature",
        pv: (pn.pv == null ? 30 : pn.pv), pvMax: (pn.pv == null ? 30 : pn.pv),
        cd: (pn.cd == null ? 3 : pn.cd),
        armeNom: a.nom, dmin: a.min, dmax: a.max,
        sac: cloner(pn.sac || []), terre: false, armePill: false
      };
    }),
    init: {}, ordre: null, tour: 0, nbTours: 1, cible: null, log: ["Combat engagé."], aAgis: false
  };
}
function combatMenace() {
  return nouveauCombat([{ nom: "Menace", pv: 30, cd: 3, armeId: "mains", sac: [] }]);
}

const FOND = { fontFamily: "'Rajdhani','Exo 2',sans-serif" };
const CADRE = "rounded-xl border border-[#2ee6c9]/25 bg-[#0d1a15] p-4";
const CADRE_MJ = "rounded-xl border border-[#f0b24a]/30 bg-[#161207] p-3";
const BTN = "rounded-lg border border-[#2ee6c9]/40 bg-[#123326] px-3 py-1.5 text-sm text-[#c8e9df] hover:bg-[#1a4a38] transition-colors";
const BTN_MJ = "rounded-lg border border-[#f0b24a]/40 bg-[#2a2010] px-3 py-1.5 text-sm text-[#f0b24a] hover:bg-[#3a2c15] transition-colors";
const BTN_VERBE = "rounded-lg border border-[#2ee6c9]/50 bg-[#123326] px-4 py-2 font-bold text-[#2ee6c9] hover:bg-[#1a4a38] transition-colors";
const BTN_DANGER = "rounded-lg border border-red-500/40 bg-[#2a1210] px-3 py-1.5 text-sm text-red-300 hover:bg-[#3a1815] transition-colors";
const CHAMP = "rounded-lg border border-[#2ee6c9]/20 bg-[#08120e] px-2 py-1.5 text-sm text-[#c8e9df] outline-none focus:border-[#2ee6c9]/60";
const ETIQ = "text-xs uppercase tracking-wider text-[#7a9187] mb-1";

function Entete({ onglet, setOnglet, ouvrirExp, nuageTxt, nuageOk }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const reset = () => {
    try { localStorage.removeItem(CLE); } catch (e) {}
    window.location.reload();
  };
  return (
    <header className="sticky top-0 z-10 border-b border-[#2ee6c9]/25 bg-[#0d1a15]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div>
          <div className="text-lg font-bold tracking-wide text-[#2ee6c9]">ESPACE MJ <span className="text-[#f0b24a]">— Les Protocoles Éternels</span></div>
          <div className="text-xs text-[#7a9187]">Simulation locale · moteur d'aventure · joueurs : Signa-3, Nyx-9, Garde-78, Athan-4</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={"text-[10px] " + (nuageOk === true ? "text-[#2ee6c9]" : nuageOk === false ? "text-[#f0b24a]" : "text-[#7a9187]")}>☁ {nuageTxt || "sauvegarde : locale uniquement"}</span>
          <span className="flex flex-wrap justify-end gap-2">
            <button className={BTN + " text-xs"} onClick={ouvrirExp}>⇅ Export / Import JSON</button>
            {!confirmReset ? (
              <button className={BTN_DANGER + " text-xs"} onClick={() => setConfirmReset(true)}>⟲ Réinitialiser la sauvegarde locale</button>
            ) : (
              <span className="flex gap-2">
                <button className={BTN_DANGER + " text-xs"} onClick={reset}>✅ Réinitialiser définitivement</button>
                <button className={BTN + " text-xs"} onClick={() => setConfirmReset(false)}>Annuler</button>
              </span>
            )}
          </span>
        </div>
      </div>
    </header>
  );
}

function PanneauExport({ etat, importer, fermer }) {
  const [txt, setTxt] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const json = JSON.stringify(etat, null, 2);
  const KO = "Copie automatique indisponible — sélectionnez le texte et copiez-le (Ctrl+C).";
  const copier = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(json);
        setMsg("Sauvegarde copiée dans le presse-papiers.");
      } else { setMsg(KO); }
    } catch (e) { setMsg(KO); }
  };
  const valider = () => {
    setErr(""); setMsg("");
    try {
      const brut = JSON.parse(txt);
      if (!brut || !brut.aventures) throw new Error("format");
      importer(normaliser(brut));
    } catch (e) { setErr("JSON invalide — vérifiez le texte collé."); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4" onClick={fermer}>
      <div className={"mt-6 w-full max-w-3xl " + CADRE} onClick={ev => ev.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#2ee6c9]">⇅ Export / Import de la sauvegarde</h3>
          <button className={BTN + " text-xs"} onClick={fermer}>Fermer</button>
        </div>
        <p className="mb-4 text-xs text-[#7a9187]">La sauvegarde vit sur le serveur (compte Maître de la Tombe), avec une copie locale de secours (localStorage <code>pe_sim_mj</code>). L'export/import JSON ci-dessous sert à migrer manuellement vers un autre navigateur ou une autre origine.</p>
        <div className="mb-2 flex items-center justify-between">
          <span className={ETIQ + " mb-0"}>Exporter — copiez ce JSON</span>
          <button className={BTN + " text-xs"} onClick={copier}>⧉ Copier</button>
        </div>
        <textarea readOnly value={json} onFocus={ev => ev.target.select()}
          className={CHAMP + " h-32 w-full resize-y font-mono text-[11px]"} />
        <div className="mt-4 mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className={ETIQ + " mb-0"}>Importer — collez un JSON (remplace TOUT)</span>
          <button className={BTN_VERBE + " text-sm"} onClick={valider}>⇩ Importer la sauvegarde</button>
        </div>
        <textarea value={txt} onChange={ev => setTxt(ev.target.value)}
          placeholder="Collez ici le JSON exporté depuis l'autre version..."
          className={CHAMP + " h-24 w-full resize-y font-mono text-[11px]"} />
        {err && <div className="mt-2 text-sm font-bold text-red-300">{err}</div>}
        {msg && <div className="mt-2 text-sm text-[#2ee6c9]">{msg}</div>}
      </div>
    </div>
  );
}

function Bibliotheque({ etat, ouvrir, editer, creer, supprEnCours, setSupprEnCours, confirmerSuppr }) {
  const [titreSaisi, setTitreSaisi] = useState("");
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#2ee6c9]">Bibliothèque d'aventures</h2>
        <button className={BTN} onClick={creer}>✚ Nouvelle aventure</button>
      </div>
      <div className="grid gap-2">
        {(etat.aventures || []).map(av => {
          const st = etat.statuts[av.id] || "en_cours";
          const nb = (av.scenes || []).length;
          return (
            <div key={av.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#2ee6c9]/25 bg-[#0d1a15] px-3 py-2 hover:border-[#2ee6c9]/50">
              <button className="text-left" onClick={() => ouvrir(av.id)}>
                <span className="text-sm font-bold text-[#c8e9df] hover:text-[#2ee6c9]">{av.titre || "Aventure sans titre"}</span>
                <span className="ml-2 text-xs text-[#7a9187]">{nb} scène{nb > 1 ? "s" : ""} · {st === "finie" ? "finie" : "en cours"}</span>
              </button>
              <span className="flex shrink-0 flex-wrap items-center gap-2">
                <span className={(st === "finie" ? "bg-[#f0b24a]/15 text-[#f0b24a]" : "bg-[#2ee6c9]/10 text-[#2ee6c9]") + " rounded-full px-2 py-0.5 text-[10px] font-bold"}>
                  {st === "finie" ? "FINIE" : "EN COURS"}
                </span>
                {av.test && <span className="rounded-full bg-[#7a9187]/15 px-2 py-0.5 text-[10px] text-[#7a9187]">TEST</span>}
                <button className={BTN + " text-xs"} onClick={() => ouvrir(av.id)}>Ouvrir</button>
                <button className={BTN_MJ + " text-xs"} onClick={() => editer(av.id)}>✎ Modifier</button>
                {supprEnCours !== av.id ? (
                  <button className={BTN_DANGER + " text-xs"} onClick={() => { setTitreSaisi(""); setSupprEnCours(av.id); }}>✕ Supprimer</button>
                ) : (
                  <span className="flex flex-wrap items-center gap-2">
                    <input className="rounded border border-[#f0b24a]/40 bg-[#0a120f] px-2 py-1 text-xs text-[#c8e9df]" style={{ maxWidth: "150px" }} placeholder="Taper le titre" value={titreSaisi} onChange={ev => setTitreSaisi(ev.target.value)} />
                    <button className={BTN_DANGER + " text-xs " + (titreSaisi.trim() !== (av.titre || "") ? "opacity-40 pointer-events-none" : "")} onClick={() => confirmerSuppr(av.id)}>✕ Confirmer</button>
                    <button className={BTN + " text-xs"} onClick={() => setSupprEnCours(null)}>Annuler</button>
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function blocsPour(e, avId) {
  const av = (e.aventures || []).find(a => a.id === avId);
  const partie = (e.parties || {})[avId] || { sceneId: null, journal: [], degats: {}, combat: null };
  const scene = av ? (av.scenes || []).find(s => s.id === partie.sceneId) : null;
  const st = (e.statuts || {})[avId] || "en_cours";
  const blocs = [
    { titre: "Scène en cours", texte: scene ? (scene.titre || "—") : "—" },
    { titre: "Statut", texte: st === "finie" ? "Aventure terminée" : "Aventure en cours" },
    { titre: "Derniers événements", texte: (partie.journal || []).slice(-8).map(l => String((l && l.txt) || l)).join("\n") || "—" }
  ];
  if (partie.resume) blocs.push({ titre: "Résumé de séance", texte: partie.resume });
  return blocs;
}

function VueAventure({ etat, maj, avId, retour, basculerEdit }) {
  const av = (etat.aventures || []).find(a => a.id === avId);
  const partie = etat.parties[avId] || { sceneId: null, journal: [], degats: {}, combat: null };
  const scene = av ? (av.scenes || []).find(s => s.id === partie.sceneId) : null;
  const st = etat.statuts[avId] || "en_cours";
  const [notesOuvert, setNotesOuvert] = useState(false);
  const [cibles, setCibles] = useState(null);
  const [pickJoueur, setPickJoueur] = useState(JOUEURS[0].id);
  const [noteTxt, setNoteTxt] = useState("");
  const [confirmVider, setConfirmVider] = useState(false);
  const [oracleMsg, setOracleMsg] = useState(null);
  const [oracleAttente, setOracleAttente] = useState(false);
  const [pubMsg, setPubMsg] = useState(null);

  const nbCoches = cibles ? cibles.checks.filter(Boolean).length : 0;

  const choisirIssue = (c) => maj(p => {
    const pp = avecPartie(p, avId);
    const a = p.aventures.find(x => x.id === avId);
    const sc = (a.scenes || []).find(s => s.id === pp.sceneId);
    if (!sc) return;
    if (c.type === "communiquer") {
      pp.journal.push("Les joueurs communiquent — " + sc.titre + ".");
    } else if (c.type === "sortir") {
      pp.journal.push("Les joueurs sortent — " + sc.titre + ".");
    } else if (c.type === "aller" && c.cible) {
      const dest = (a.scenes || []).find(s => s.id === c.cible);
      if (dest && dest.id !== sc.id) {
        pp.sceneId = dest.id;
        pp.journal.push("→ Déplacement : " + dest.titre + ".");
      }
    } else if (c.type === "attaquer") {
      const pnjs = (sc.pnjs) || [];
      if (pnjs.length === 0) {
        pp.combat = combatMenace();
        pp.journal.push("Combat : aucune créature en scène — repli « Menace » (30 PV, Cd 3+).");
      } else if (pnjs.length === 1) {
        pp.combat = nouveauCombat([pnjs[0]]);
        pp.journal.push("Combat engagé contre " + pnjs[0].nom + ".");
      } else {
        pp.journal.push("Choix des cibles du combat…");
      }
    }
  });

  const engagerCombat = () => maj(p => {
    const pp = avecPartie(p, avId);
    const sc = p.aventures.find(x => x.id === avId).scenes.find(s => s.id === pp.sceneId);
    const pnjs = (sc.pnjs || []).filter((pn, i) => cibles && cibles.checks[i]);
    if (pnjs.length === 0) return;
    pp.combat = pnjs.length === 1 ? nouveauCombat([pnjs[0]]) : nouveauCombat(pnjs);
    pp.journal.push("⚔ Combat engagé contre : " + pnjs.map(x => x.nom).join(", ") + ".");
  });

  const ramasser = (idx) => maj(p => {
    const pp = avecPartie(p, avId);
    const sc = p.aventures.find(x => x.id === avId).scenes.find(s => s.id === pp.sceneId);
    if (!sc || !sc.objets || !sc.objets[idx]) return;
    const o = sc.objets[idx];
    const nom = OBJETS_BASE[o.baseId] || o.baseId || "Objet";
    let inst = (p.monde || []).find(m => m.nom === nom && !String(m.localisation || "").startsWith("porté par"));
    if (!inst) {
      inst = { uuid: uid(), nom: nom, integrite: (o.integrite == null ? 100 : o.integrite), localisation: "", origine: "Trouvé en aventure" };
      p.monde.push(inst);
    }
    const j = JOUEURS.find(x => x.id === pickJoueur);
    inst.localisation = "porté par " + j.nom;
    p.inventaires[pickJoueur].push(inst.uuid);
    sc.objets.splice(idx, 1);
    pp.journal.push("Objet ramassé : " + nom + " (" + inst.integrite + "%) → " + j.nom + ".");
  });

  const ajouterNote = () => maj(p => {
    const pp = avecPartie(p, avId);
    if (noteTxt.trim().length) pp.journal.push("⚠ MJ : " + noteTxt.trim());
  });

  const changerStatut = (v) => maj(p => {
    avecPartie(p, avId);
    p.statuts[avId] = v;
    p.parties[avId].journal.push(v === "finie" ? "⚠ MJ : aventure marquée finie." : "⚠ MJ : aventure réactivée.");
  });

  const viderJournal = () => maj(p => {
    const pp = avecPartie(p, avId);
    pp.journal = [];
  });

  const mjBearer = () => window.MJBEARER || null;

  const demanderResume = () => {
    const tok = mjBearer();
    if (!tok) { setOracleMsg("Connecte-toi en haut de page (Maître de la Tombe)."); return; }
    const lignes = (partie.journal || []).slice(-30).map(l => String((l && l.txt) || l).slice(0, 280));
    if (!lignes.length) { setOracleMsg("Le journal est vide — joue un peu d'abord."); return; }
    setOracleAttente(true); setOracleMsg(null);
    fetch(SBORACLE, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tok },
      body: JSON.stringify({
        question: "Journal de la séance de l'aventure « " + (av ? (av.titre || "") : "") + " » :\n- " + lignes.join("\n- "),
        style: "resume"
      })
    }).then(r => r.json()).then(rep => {
      setOracleAttente(false);
      if (rep && rep.ok) {
        maj(p => { const pp = avecPartie(p, avId); pp.resume = rep.reponse; });
      } else {
        setOracleMsg((rep && rep.erreur) || "L'Oracle reste silencieux.");
      }
    }).catch(() => { setOracleAttente(false); setOracleMsg("L'Oracle est injoignable — vérifie ta connexion."); });
  };

  const publierAuxJoueurs = () => {
    const tok = mjBearer();
    if (!tok) { setPubMsg("Connecte-toi en haut de page (Maître de la Tombe)."); return; }
    setPubMsg("Publication en cours…");
    const blocs = [
      { titre: "Scène en cours", texte: scene ? (scene.titre || "—") : "—" },
      { titre: "Statut", texte: st === "finie" ? "Aventure terminée" : "Aventure en cours" },
      { titre: "Derniers événements", texte: (partie.journal || []).slice(-8).map(l => String((l && l.txt) || l)).join("\n") || "—" }
    ];
    if (partie.resume) blocs.push({ titre: "Résumé de séance", texte: partie.resume });
    fetch(SBRPC, {
      method: "POST",
      headers: { "apikey": SBK, "Authorization": "Bearer " + tok, "Content-Type": "application/json" },
      body: JSON.stringify({ p_titre: (av && av.titre) || "Aventure", p_statut: st === "finie" ? "terminee" : "active", p_blocs: blocs })
    }).then(r => {
      if (r.ok) { setPubMsg("✓ Publié — visible dans la Zone joueurs (onglet Aventure)."); }
      else { return r.json().then(e => setPubMsg("Échec : " + ((e && e.message) || "réessaie."))); }
    }).catch(() => setPubMsg("Publication impossible — vérifie ta connexion."));
  };


  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button className={BTN} onClick={retour}>← Bibliothèque</button>
          <h2 className="text-xl font-bold text-[#2ee6c9]">{av ? (av.titre || "Aventure sans titre") : "?"}</h2>
          <span className={(st === "finie" ? "bg-[#f0b24a]/15 text-[#f0b24a]" : "bg-[#2ee6c9]/10 text-[#2ee6c9]") + " rounded-full px-2 py-0.5 text-[10px] font-bold"}>
            {st === "finie" ? "AVENTURE FINIE" : "EN COURS"}
          </span>
        </div>
        <button className={BTN_MJ} onClick={basculerEdit}>✎ Éditeur</button>
      </div>

      <div className={"mb-4 flex flex-wrap gap-x-4 gap-y-1 rounded-lg border border-[#2ee6c9]/15 bg-[#0a1610] px-3 py-2 text-xs " + (partie.combat ? "text-[#f0b24a]" : "text-[#7a9187]")}>
        <span>Scène : <b className="text-[#c8e9df]">{scene ? scene.titre : "—"}</b></span>
        <span>Phase : <b className={partie.combat ? "text-[#f0b24a]" : "text-[#2ee6c9]"}>{partie.combat ? "combat" : "dialogue"}</b></span>
        <span>Lieu : <b className="text-[#c8e9df]">{scene && scene.lieu ? scene.lieu + (scene.poi ? " · " + scene.poi : "") : "—"}</b></span>
      </div>

      {partie.combat ? (
        <Combat avId={avId} maj={maj} partie={partie} />
      ) : !scene ? (
        <div className={CADRE + " text-sm text-[#7a9187]"}>
          Aucune scène active. Créez des scènes dans l'éditeur (✎), puis choisissez la scène de départ.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-4">
            <div className={CADRE}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-[#c8e9df]">{scene.titre || "Scène sans titre"}</h3>
                {scene.lieu && (
                  <span className="rounded-full border border-[#2ee6c9]/30 px-2 py-0.5 text-[10px] text-[#2ee6c9]">{scene.lieu}{scene.poi ? " · " + scene.poi : ""}</span>
                )}
              </div>
              {scene.texte && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#a8bdb3]">{scene.texte}</p>}

              {((scene.pnjs) || []).length > 0 && (
                <div className="mt-4">
                  <div className={ETIQ}>PNJ présents</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {scene.pnjs.map((pn, i) => {
                      const a = armeDe(pn.armeId);
                      return (
                        <div key={i} className="rounded-lg border border-red-500/25 bg-[#150d0c] px-3 py-2 text-sm">
                          <span className="font-bold text-red-300">{pn.nom || "Créature"}</span>
                          <span className="ml-2 text-xs text-[#7a9187]">{pn.pv == null ? 30 : pn.pv} PV · Cd {pn.cd == null ? 3 : pn.cd}+ · {a.nom}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {((scene.objets) || []).length > 0 && (
                <div className="mt-4">
                  <div className={ETIQ}>Objets présents</div>
                  <div className="grid gap-2">
                    {scene.objets.map((o, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-[#2ee6c9]/15 bg-[#08120e] px-3 py-2 text-sm">
                        <span className="text-[#c8e9df]">{OBJETS_BASE[o.baseId] || o.baseId || "Objet"}</span>
                        <span className="flex items-center gap-2">
                          <span className={"font-bold " + coulInteg(o.integrite == null ? 100 : o.integrite)}>{o.integrite == null ? 100 : o.integrite} %</span>
                          <select className={CHAMP + " py-0.5 text-xs"} value={pickJoueur} onChange={e => setPickJoueur(e.target.value)}>
                            {JOUEURS.map(j => <option key={j.id} value={j.id}>{j.nom}</option>)}
                          </select>
                          <button className={BTN + " text-xs"} onClick={() => ramasser(i)}>Prendre</button>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {cibles && (
              <div className={CADRE_MJ}>
                <div className="mb-2 font-bold text-[#f0b24a]">⚔ Cibles du combat</div>
                {((scene.pnjs) || []).map((pn, i) => (
                  <label key={i} className="flex items-center gap-2 py-0.5 text-sm text-[#c8e9df]">
                    <input type="checkbox" checked={cibles.checks[i]} onChange={() => setCibles(cs => ({ checks: cs.checks.map((v, k) => k === i ? !v : v) }))} />
                    {pn.nom || "Créature"} <span className="text-xs text-[#7a9187]">{pn.pv == null ? 30 : pn.pv} PV · Cd {pn.cd == null ? 3 : pn.cd}+</span>
                  </label>
                ))}
                <div className="mt-3 flex gap-2">
                  <button className={BTN_MJ} disabled={nbCoches === 0} onClick={engagerCombat}>⚔ Engager le combat ({nbCoches})</button>
                  <button className={BTN} onClick={() => setCibles(null)}>Annuler</button>
                </div>
              </div>
            )}

            <div>
              <div className={ETIQ}>Issues de la scène</div>
              <div className="flex flex-wrap gap-2">
                {(((scene.choices) || [])).map((c, i) => (
                  <button key={i} className={BTN_VERBE} onClick={() => (c.type === "attaquer" && ((scene.pnjs) || []).length > 1) ? (setCibles({ checks: scene.pnjs.map(() => true) })) : choisirIssue(c)}>
                    {verbeDe(c)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <button className={(notesOuvert ? BTN_MJ : BTN) + " w-full"} onClick={() => setNotesOuvert(o => !o)}>⚙ Notes MJ {notesOuvert ? "▾" : "▸"}</button>
            {notesOuvert && (
              <div className={CADRE_MJ + " mt-3"}>
                <div className={ETIQ + " text-[#f0b24a]"}>Statut de l'aventure (MJ uniquement)</div>
                {st === "finie" ? (
                  <button className={BTN_MJ + " w-full"} onClick={() => changerStatut("en_cours")}>⟲ Aventure en cours (réactiver)</button>
                ) : (
                  <button className={BTN_MJ + " w-full"} onClick={() => changerStatut("finie")}>✅ Aventure finie</button>
                )}
                                <div className={ETIQ + " mt-3 text-[#f0b24a]"}>L'Oracle — résumé de séance</div>
                <button className={BTN_MJ + " w-full"} disabled={oracleAttente} onClick={() => demanderResume()}>{oracleAttente ? "⟁ L'Oracle rédige…" : "⟁ Résumé de séance (l'Oracle)"}</button>
                {oracleMsg && <div className="mt-1 text-xs text-[#f0b24a]">{oracleMsg}</div>}
                {partie.resume && (
                  <div className="mt-2 rounded-lg border border-[#f0b24a]/20 bg-[#0d120a] p-2 text-xs text-[#c8e9df]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#f0b24a]">Compte rendu de séance</span>
                      <span className="flex gap-2">
                        <button className="text-[10px] text-[#c8e9df] underline" onClick={() => { try { navigator.clipboard.writeText(partie.resume || ""); } catch (err) {} }}>⧉ Copier</button>
                        <button className="text-[10px] text-[#7a9187] underline" onClick={() => maj(p => { const pp = avecPartie(p, avId); delete pp.resume; })}>✕ Effacer</button>
                      </span>
                    </div>
                    <div className="mt-1 whitespace-pre-wrap">{partie.resume}</div>
                  </div>
                )}
                <div className={ETIQ + " mt-3 text-[#f0b24a]"}>Publication — Zone joueurs</div>
                <button className={BTN_MJ + " w-full"} onClick={() => publierAuxJoueurs()}>📡 Publier l'aventure aux joueurs</button>
                {pubMsg && <div className="mt-1 text-xs text-[#c8e9df]">{pubMsg}</div>}
<div className={ETIQ + " mt-3 text-[#f0b24a]"}>Dégâts encaissés</div>
                <div className="grid grid-cols-2 gap-1 text-xs text-[#c8e9df]">
                  {JOUEURS.map(j => (
                    <span key={j.id}>{j.nom} : <b className={(partie.degats && partie.degats[j.id]) ? "text-red-300" : "text-[#7a9187]"}>{(partie.degats && partie.degats[j.id]) || 0}</b></span>
                  ))}
                </div>
                <div className={ETIQ + " mt-3 text-[#f0b24a]"}>Note du MJ</div>
                <div className="flex gap-2">
                  <input className={CHAMP + " flex-1"} value={noteTxt} onChange={e => setNoteTxt(e.target.value)} placeholder="Note libre pour le journal…" />
                  <button className={BTN_MJ + " text-xs"} onClick={() => { ajouterNote(); setNoteTxt(""); }}>Ajouter</button>
                </div>
                <div className={ETIQ + " mt-3 text-[#f0b24a]"}>Journal</div>
                <div className="max-h-64 overflow-y-auto rounded-lg border border-[#f0b24a]/20 bg-[#0d120a] p-2">
                  {(partie.journal || []).slice().reverse().map((l, i) => (
                    <div key={i} className="border-b border-[#f0b24a]/10 py-1 text-xs text-[#c8b892] last:border-0">{l.txt || l}</div>
                  ))}
                  {!(partie.journal || []).length && <div className="text-xs text-[#7a9187]">Journal vide.</div>}
                </div>
                <div className="mt-2">
                  {!confirmVider ? (
                    <button className="text-[10px] text-[#7a9187] underline" onClick={() => setConfirmVider(true)}>Vider le journal</button>
                  ) : (
                    <span className="flex gap-2">
                      <button className={BTN_DANGER + " text-[10px] px-2 py-0.5"} onClick={() => { viderJournal(); setConfirmVider(false); }}>✅ Vider</button>
                      <button className={BTN + " text-[10px] px-2 py-0.5"} onClick={() => setConfirmVider(false)}>Annuler</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Combat({ avId, maj, partie }) {
  const c = partie.combat;
  const [pitPick, setPitPick] = useState({});
  const choixPit = (key) => pitPick[key] || JOUEURS[0].id;

  const jetInit = (jId) => maj(p => {
    const cc = avecPartie(p, avId).combat;
    if (!cc || cc.init[jId]) return;
    const j = JOUEURS.find(x => x.id === jId);
    cc.init[jId] = { jet: d6(), ini: j.ini };
    if (JOUEURS.every(x => cc.init[x.id])) {
      cc.ordre = JOUEURS.map(x => x.id).sort((a, b) => ((cc.init[b].jet + cc.init[b].ini) - (cc.init[a].jet + cc.init[a].ini)));
      cc.phase = "tours";
      cc.tour = 0;
      cc.log.push("Ordre du tour : " + cc.ordre.map(id => JOUEURS.find(x => x.id === id).nom + " (" + (cc.init[id].jet + cc.init[id].ini) + ")").join(", ") + ".");
    }
  });

  const attaquer = () => maj(p => {
    const pp = avecPartie(p, avId);
    const cc = pp.combat;
    if (!cc || !cc.cible || cc.aAgis) return;
    const j = JOUEURS.find(x => x.id === cc.ordre[cc.tour]);
    const e = cc.ennemis.find(x => x.uid === cc.cible);
    if (!e || e.terre) return;
    const a = armeDe(j.armeId);
    const de = d6();
    if (de >= j.cd) {
      const deg = rr(a.min, a.max);
      e.pv = Math.max(0, e.pv - deg);
      cc.log.push(j.nom + " : " + de + " vs Cd " + j.cd + "+ — touche — " + deg + " dégâts sur " + e.nom + " (" + e.pv + "/" + e.pvMax + " PV).");
      if (e.pv === 0) {
        e.terre = true;
        cc.log.push("☠ " + e.nom + " est à terre.");
        if (cc.ennemis.every(x => x.terre)) { cc.phase = "pillage"; cc.cible = null; cc.log.push("Tous les ennemis sont à terre — pillage."); }
      }
    } else {
      cc.log.push(j.nom + " : " + de + " vs Cd " + j.cd + "+ — échec.");
    }
    cc.aAgis = true;
  });

  const finTour = () => maj(p => {
    const pp = avecPartie(p, avId);
    const cc = pp.combat;
    if (!cc) return;
    cc.aAgis = false;
    cc.tour = cc.tour + 1;
    if (cc.tour >= cc.ordre.length) {
      cc.ennemis.filter(e => !e.terre).forEach(e => {
        const de = d6();
        const cible = JOUEURS[rr(0, JOUEURS.length - 1)];
        if (de >= e.cd) {
          const deg = rr(e.dmin, e.dmax);
          pp.degats[cible.id] = (pp.degats[cible.id] || 0) + deg;
          cc.log.push("Riposte " + e.nom + " : " + de + " vs Cd " + e.cd + "+ — " + cible.nom + " encaisse " + deg + " dégâts (" + e.armeNom + ").");
        } else {
          cc.log.push("Riposte " + e.nom + " : " + de + " vs Cd " + e.cd + "+ — rate.");
        }
      });
      cc.tour = 0;
      cc.nbTours = cc.nbTours + 1;
      cc.log.push("— Tour " + cc.nbTours + " —");
      if (cc.ennemis.every(x => x.terre)) { cc.phase = "pillage"; cc.cible = null; cc.log.push("Tous les ennemis sont à terre — pillage."); }
    }
  });

  const cibler = (euid) => maj(p => {
    const cc = avecPartie(p, avId).combat;
    if (cc) cc.cible = euid;
  });

  const prendreItem = (euid, kind, idx, jId) => maj(p => {
    const cc = avecPartie(p, avId).combat;
    if (!cc) return;
    const e = cc.ennemis.find(x => x.uid === euid);
    if (!e) return;
    let nom, integ;
    if (kind === "arme") {
      nom = e.armeNom; integ = 100; e.armePill = true;
    } else {
      const it = e.sac[idx];
      if (!it) return;
      nom = OBJETS_BASE[it.baseId] || it.baseId || "Objet";
      integ = (it.integrite == null ? 100 : it.integrite);
      e.sac.splice(idx, 1);
    }
    let inst = (p.monde || []).find(m => m.nom === nom && !String(m.localisation || "").startsWith("porté par"));
    if (!inst) {
      inst = { uuid: uid(), nom: nom, integrite: integ, localisation: "", origine: "Butin de combat" };
      p.monde.push(inst);
    }
    const j = JOUEURS.find(x => x.id === jId);
    inst.localisation = "porté par " + j.nom;
    p.inventaires[jId].push(inst.uuid);
    cc.log.push("Butin : " + nom + " (" + integ + "%) → " + j.nom + ".");
  });

  const retourDialogue = () => maj(p => {
    const pp = avecPartie(p, avId);
    pp.journal.push("Fin du combat — retour au dialogue.");
    pp.combat = null;
  });

  if (!c) return null;
  const cadavres = c.ennemis.filter(e => e.terre);
  const vivantCible = c.ennemis.find(e => e.uid === c.cible);

  return (
    <div className="grid gap-4">
      <div className={"rounded-xl border p-4 " + (c.phase === "pillage" ? "border-[#2ee6c9]/25 bg-[#0d1a15]" : "border-[#f0b24a]/40 bg-[#161207]")}>
        {c.phase === "initiative" && (
          <div>
            <div className="mb-3 font-bold text-[#f0b24a]">⚔ Initiative — D6 + Ini, total décroissant (jets des joueurs)</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {JOUEURS.map(j => (
                <div key={j.id} className="flex items-center justify-between rounded-lg border border-[#f0b24a]/20 bg-[#0d120a] px-3 py-2">
                  <span className="text-sm text-[#c8e9df]">{j.nom} <span className="text-xs text-[#7a9187]">Ini {j.ini}</span></span>
                  {c.init[j.id] ? (
                    <span className="font-bold text-[#f0b24a]">D6 {c.init[j.id].jet} + {j.ini} = {c.init[j.id].jet + j.ini}</span>
                  ) : (
                    <button className={BTN_MJ + " text-xs"} onClick={() => jetInit(j.id)}>{DE} Initiative</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {c.phase === "tours" && (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="font-bold text-[#f0b24a]">⚔ Tour {c.nbTours} — agit : <span className="text-[#c8e9df]">{JOUEURS.find(x => x.id === c.ordre[c.tour]).nom}</span></div>
              <div className="text-xs text-[#7a9187]">{vivantCible ? "Cible : " + vivantCible.nom : "Aucune cible — cliquez « cibler »"}</div>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              <button className={BTN_MJ} disabled={!c.cible || c.aAgis || !vivantCible || vivantCible.terre} onClick={attaquer}>{DE} Attaquer ({armeDe(JOUEURS.find(x => x.id === c.ordre[c.tour]).armeId).nom})</button>
              <button className={BTN} onClick={finTour}>Fin du tour →</button>
            </div>
          </div>
        )}

        {c.phase === "pillage" && (
          <div>
            <div className="mb-3 font-bold text-[#2ee6c9]">☠ Pillage par cadavre — arme + sac</div>
            {cadavres.length === 0 && <div className="text-sm text-[#7a9187]">Aucun cadavre.</div>}
            {cadavres.map(e => {
              const reste = [];
              if (!e.armePill) reste.push({ kind: "arme", idx: 0, nom: "Arme : " + e.armeNom, integ: 100 });
              e.sac.forEach((it, i) => reste.push({ kind: "sac", idx: i, nom: OBJETS_BASE[it.baseId] || it.baseId || "Objet", integ: (it.integrite == null ? 100 : it.integrite) }));
              return (
                <div key={e.uid} className="mb-3 rounded-lg border border-[#2ee6c9]/15 bg-[#08120e] p-3">
                  <div className="text-sm font-bold text-red-300">☠ {e.nom}</div>
                  {reste.length === 0 && <div className="text-xs text-[#7a9187]">Déjà pillé.</div>}
                  {reste.map(it => {
                    const key = e.uid + "-" + it.kind + "-" + it.idx;
                    return (
                      <div key={key} className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="text-[#c8e9df]">{it.nom} <b className={coulInteg(it.integ)}>{it.integ} %</b></span>
                        <span className="flex items-center gap-2">
                          <select className={CHAMP + " py-0.5 text-xs"} value={choixPit(key)} onChange={ev => setPitPick(pp => Object.assign({}, pp, { [key]: ev.target.value }))}>
                            {JOUEURS.map(j => <option key={j.id} value={j.id}>{j.nom}</option>)}
                          </select>
                          <button className={BTN + " text-xs"} onClick={() => prendreItem(e.uid, it.kind, it.idx, choixPit(key))}>Prendre</button>
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <button className={BTN_VERBE} onClick={retourDialogue}>Fin du combat — retour au dialogue</button>
          </div>
        )}

        {c.phase !== "pillage" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.ennemis.map(e => (
              <div key={e.uid} className={"rounded-lg border p-3 " + (e.terre ? "border-red-500/20 bg-[#120c0b] opacity-60" : c.cible === e.uid ? "border-[#f0b24a] bg-[#1a160c]" : "border-red-500/30 bg-[#150d0c]")}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-300">{e.nom}</span>
                  {e.terre && <span className="text-lg">☠</span>}
                </div>
                <div className="mt-1 text-xs text-[#7a9187]">PV {e.pv}/{e.pvMax} · Cd {e.cd}+ · {e.armeNom} ({e.dmin}-{e.dmax})</div>
                <div className="mt-2 h-1.5 rounded bg-[#08120e]">
                  <div className="h-1.5 rounded bg-red-500/70" style={{ width: (e.pvMax ? Math.round(100 * e.pv / e.pvMax) : 0) + "%" }} />
                </div>
                {!e.terre && (
                  <button className={(c.cible === e.uid ? BTN_MJ : BTN) + " mt-2 w-full text-xs"} onClick={() => cibler(e.uid)}>
                    {c.cible === e.uid ? "◎ Ciblé" : "Cibler"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={CADRE_MJ}>
        <div className={ETIQ + " text-[#f0b24a]"}>Journal du combat</div>
        <div className="max-h-48 overflow-y-auto rounded-lg border border-[#f0b24a]/20 bg-[#0d120a] p-2">
          {c.log.slice().reverse().map((l, i) => (
            <div key={i} className="border-b border-[#f0b24a]/10 py-1 text-xs text-[#c8b892] last:border-0">{l}</div>
          ))}
        </div>
        <button className={BTN_DANGER + " mt-2 text-xs"} onClick={retourDialogue}>Fuir le combat (retour au dialogue)</button>
      </div>
    </div>
  );
}

function Editeur({ etat, maj, avId, retour, jouer }) {
  const av = (etat.aventures || []).find(a => a.id === avId);
  const scenes = (av && av.scenes) || [];
  const [sceneId, setSceneId] = useState(scenes.length ? scenes[0].id : null);
  const [br, setBr] = useState(null);
  const [confirmSupprScene, setConfirmSupprScene] = useState(false);
  const [bestAj, setBestAj] = useState(BESTIAIRE[0].id);
  const [objAj, setObjAj] = useState(OBJETS_IDS[0]);
  const [objInt, setObjInt] = useState(100);
  const [sacAj, setSacAj] = useState(OBJETS_IDS[0]);
  const [sacInt, setSacInt] = useState(100);
  const [typeIssue, setTypeIssue] = useState("communiquer");

  useEffect(() => {
    const sc = scenes.find(s => s.id === sceneId);
    setBr(sc ? cloner(sc) : null);
    setConfirmSupprScene(false);
  }, [sceneId, avId]);

  const chTitre = (v) => maj(p => {
    const a = p.aventures.find(x => x.id === avId);
    if (a) a.titre = v;
  });

  const nouvelleScene = () => {
    const id = uid();
    maj(p => {
      const a = p.aventures.find(x => x.id === avId);
      if (!a.scenes) a.scenes = [];
      a.scenes.push({ id: id, titre: "Nouvelle scène", texte: "", lieu: "", poi: "", pnjs: [], objets: [], choices: [] });
      const pp = avecPartie(p, avId);
      if (!pp.sceneId) pp.sceneId = id;
    });
    setSceneId(id);
  };

  const supprimerScene = () => maj(p => {
    const a = p.aventures.find(x => x.id === avId);
    a.scenes = (a.scenes || []).filter(s => s.id !== sceneId);
    const pp = avecPartie(p, avId);
    if (pp.sceneId === sceneId) pp.sceneId = (a.scenes[0] ? a.scenes[0].id : null);
    if (!a.scenes.length) pp.sceneId = null;
  });

  const sauverScene = () => maj(p => {
    const a = p.aventures.find(x => x.id === avId);
    const i = (a.scenes || []).findIndex(s => s.id === br.id);
    if (i >= 0) a.scenes[i] = cloner(br);
  });

  const majBr = (fn) => setBr(b => { if (!b) return b; const n = cloner(b); fn(n); return n; });
  const nb = (v) => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };

  const ajouterPnj = () => majBr(b => {
    const bs = BESTIAIRE.find(x => x.id === bestAj) || BESTIAIRE[0];
    b.pnjs.push({ bestId: bs.id, nom: bs.nom, pv: bs.pv, cd: bs.cd, armeId: bs.armeId, sac: [] });
  });
  const ajouterObjet = () => majBr(b => { b.objets.push({ baseId: objAj, integrite: objInt }); });
  const ajouterSac = (i) => majBr(b => { b.pnjs[i].sac.push({ baseId: sacAj, integrite: sacInt }); });
  const ajouterIssue = () => majBr(b => {
    const autres = scenes.filter(s => s.id !== sceneId);
    b.choices.push({ type: typeIssue, cible: typeIssue === "aller" ? (autres[0] ? autres[0].id : "") : undefined, libelle: "" });
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button className={BTN} onClick={retour}>← Bibliothèque</button>
        <span className={ETIQ + " mb-0"}>Aventure</span>
        <input className={CHAMP + " min-w-[200px] flex-1"} value={av ? (av.titre || "") : ""} onChange={e => chTitre(e.target.value)} />
        <button className={BTN} onClick={jouer}>▶ Jouer</button>
      </div>

      <div className={CADRE + " mb-4"}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={ETIQ + " mb-0"}>Scène</span>
          <select className={CHAMP + " min-w-[220px] flex-1"} value={sceneId || ""} onChange={e => setSceneId(e.target.value)}>
            {!scenes.length && <option value="">— aucune scène —</option>}
            {scenes.map(s => <option key={s.id} value={s.id}>{s.titre || "Scène sans titre"}</option>)}
          </select>
          <button className={BTN} onClick={nouvelleScene}>✚ Nouvelle scène</button>
          {scenes.length > 0 && (confirmSupprScene ? (
            <span className="flex gap-2">
              <button className={BTN_DANGER} onClick={() => { supprimerScene(); setConfirmSupprScene(false); }}>✅ Supprimer définitivement</button>
              <button className={BTN} onClick={() => setConfirmSupprScene(false)}>Annuler</button>
            </span>
          ) : (
            <button className={BTN_DANGER} onClick={() => setConfirmSupprScene(true)}>✕ Supprimer la scène</button>
          ))}
        </div>
      </div>

      {!br ? (
        <div className={CADRE + " text-sm text-[#7a9187]"}>Aucune scène. Cliquez « ✚ Nouvelle scène » pour commencer.</div>
      ) : (
        <div className="grid gap-4">
          <div className={CADRE}>
            <div className={ETIQ}>Titre de la scène</div>
            <input className={CHAMP + " w-full"} value={br.titre || ""} onChange={e => majBr(b => { b.titre = e.target.value; })} />

            <div className={ETIQ + " mt-4"}>Texte</div>
            <textarea className={CHAMP + " min-h-[80px] w-full"} value={br.texte || ""} onChange={e => majBr(b => { b.texte = e.target.value; })} />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <div className={ETIQ}>Lieu (Map)</div>
                <select className={CHAMP + " w-full"} value={br.lieu || ""} onChange={e => majBr(b => { b.lieu = e.target.value; b.poi = ""; })}>
                  <option value="">— choisir un lieu —</option>
                  {LIEUX.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <div className={ETIQ}>Point d'intérêt</div>
                <select className={CHAMP + " w-full"} value={br.poi || ""} disabled={!br.lieu} onChange={e => majBr(b => { b.poi = e.target.value; })}>
                  <option value="">— choisir un POI —</option>
                  {(POIS[br.lieu] || []).map(poi => <option key={poi} value={poi}>{poi}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className={CADRE}>
            <div className={ETIQ}>PNJ présents (Bestiaire)</div>
            {((br.pnjs) || []).length === 0 && <div className="text-xs text-[#7a9187]">Aucun PNJ.</div>}
            {((br.pnjs) || []).map((pn, i) => (
              <div key={i} className="mb-2 rounded-lg border border-red-500/25 bg-[#150d0c] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-red-300">{pn.nom || "Créature"}</span>
                  <span className="flex items-center gap-2 text-xs text-[#7a9187]">
                    PV <input className={CHAMP + " w-16 py-0.5"} type="number" value={pn.pv == null ? 30 : pn.pv} onChange={e => majBr(b => { b.pnjs[i].pv = nb(e.target.value); })} />
                    Cd+ <input className={CHAMP + " w-12 py-0.5"} type="number" min="1" max="6" value={pn.cd == null ? 3 : pn.cd} onChange={e => majBr(b => { b.pnjs[i].cd = nb(e.target.value); })} />
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[#7a9187]">Arme :</span>
                  <select className={CHAMP + " py-0.5"} value={pn.armeId || "mains"} onChange={e => majBr(b => { b.pnjs[i].armeId = e.target.value; })}>
                    {ARMES_IDS.map(id => <option key={id} value={id}>{ARMES[id].nom} ({ARMES[id].min}-{ARMES[id].max})</option>)}
                  </select>
                  <button className={BTN_DANGER + " ml-auto px-2 py-0.5 text-xs"} onClick={() => majBr(b => { b.pnjs.splice(i, 1); })}>✕ Retirer</button>
                </div>
                <div className="mt-2">
                  <span className="text-xs text-[#7a9187]">Sac (lootable à sa mort) :</span>
                  {((pn.sac) || []).map((it, k) => (
                    <span key={k} className="ml-2 inline-flex items-center gap-1 rounded-full border border-[#2ee6c9]/20 px-2 py-0.5 text-xs text-[#c8e9df]">
                      {OBJETS_BASE[it.baseId] || it.baseId || "Objet"} <b className={coulInteg(it.integrite == null ? 100 : it.integrite)}>{it.integrite == null ? 100 : it.integrite} %</b>
                      <button className="text-red-400" onClick={() => majBr(b => { b.pnjs[i].sac.splice(k, 1); })}>✕</button>
                    </span>
                  ))}
                  <span className="mt-1 flex flex-wrap items-center gap-1">
                    <select className={CHAMP + " py-0.5 text-xs"} value={sacAj} onChange={e => setSacAj(e.target.value)}>
                      {OBJETS_IDS.map(id => <option key={id} value={id}>{OBJETS_BASE[id]}</option>)}
                    </select>
                    <input className={CHAMP + " w-16 py-0.5 text-xs"} type="number" min="0" max="100" value={sacInt} onChange={e => setSacInt(nb(e.target.value))} />
                    <button className={BTN + " px-2 py-0.5 text-xs"} onClick={() => ajouterSac(i)}>+ Sac</button>
                  </span>
                </div>
              </div>
            ))}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select className={CHAMP} value={bestAj} onChange={e => setBestAj(e.target.value)}>
                {BESTIAIRE.map(bs => <option key={bs.id} value={bs.id}>{bs.nom} — {bs.pv} PV, Cd {bs.cd}+</option>)}
              </select>
              <button className={BTN} onClick={ajouterPnj}>✚ Ajouter le PNJ</button>
            </div>
          </div>

          <div className={CADRE}>
            <div className={ETIQ}>Objets présents</div>
            {((br.objets) || []).map((o, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-[#2ee6c9]/15 bg-[#08120e] px-3 py-1.5 text-sm">
                <span className="text-[#c8e9df]">{OBJETS_BASE[o.baseId] || o.baseId || "Objet"}</span>
                <span className="flex items-center gap-2">
                  <input className={CHAMP + " w-16 py-0.5 text-xs"} type="number" min="0" max="100" value={o.integrite == null ? 100 : o.integrite} onChange={e => majBr(b => { b.objets[i].integrite = nb(e.target.value); })} />
                  <span className={"font-bold " + coulInteg(o.integrite == null ? 100 : o.integrite)}>%</span>
                  <button className={BTN_DANGER + " px-2 py-0.5 text-xs"} onClick={() => majBr(b => { b.objets.splice(i, 1); })}>✕</button>
                </span>
              </div>
            ))}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select className={CHAMP} value={objAj} onChange={e => setObjAj(e.target.value)}>
                {OBJETS_IDS.map(id => <option key={id} value={id}>{OBJETS_BASE[id]}</option>)}
              </select>
              <input className={CHAMP + " w-16"} type="number" min="0" max="100" value={objInt} onChange={e => setObjInt(nb(e.target.value))} />
              <button className={BTN} onClick={ajouterObjet}>✚ Ajouter l'objet</button>
            </div>
          </div>

          <div className={CADRE}>
            <div className={ETIQ}>Issues</div>
            {(((br.choices) || [])).map((c, i) => (
              <div key={i} className="mb-2 grid gap-2 rounded-lg border border-[#2ee6c9]/15 bg-[#08120e] p-2 sm:grid-cols-[130px_1fr_auto] sm:items-center">
                <select className={CHAMP} value={c.type} onChange={e => majBr(b => { b.choices[i].type = e.target.value; b.choices[i].cible = undefined; })}>
                  {Object.keys(VERBES).map(t => <option key={t} value={t}>{VERBES[t]}</option>)}
                </select>
                <span className="flex flex-wrap items-center gap-2">
                  {c.type === "aller" && (
                    <select className={CHAMP + " min-w-[160px]"} value={c.cible || ""} onChange={e => majBr(b => { b.choices[i].cible = e.target.value; })}>
                      <option value="">— scène cible —</option>
                      {scenes.filter(s => s.id !== sceneId).map(s => <option key={s.id} value={s.id}>{s.titre || "Scène sans titre"}</option>)}
                    </select>
                  )}
                  <input className={CHAMP + " min-w-[140px] flex-1 text-xs"} placeholder="Libellé libre (optionnel)…" value={c.libelle || ""} onChange={e => majBr(b => { b.choices[i].libelle = e.target.value; })} />
                </span>
                <button className={BTN_DANGER + " px-2 py-0.5 text-xs"} onClick={() => majBr(b => { b.choices.splice(i, 1); })}>✕</button>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2">
              <select className={CHAMP} value={typeIssue} onChange={e => setTypeIssue(e.target.value)}>
                {Object.keys(VERBES).map(t => <option key={t} value={t}>{VERBES[t]}</option>)}
              </select>
              <button className={BTN} onClick={ajouterIssue}>✚ Ajouter l'issue</button>
            </div>
          </div>

          <button className={BTN_VERBE + " w-full"} onClick={sauverScene}>✓ Sauver la scène</button>
        </div>
      )}
    </div>
  );
}

function Inventaires() {
  const [persos, setPersos] = useState(null);
  const [errListe, setErrListe] = useState("");
  const [cible, setCible] = useState("");
  const [cat, setCat] = useState("arme");
  const [ref, setRef] = useState({});
  const [libre, setLibre] = useState("");
  const [msg, setMsg] = useState(null);
  const EQ = window.PE_EQUIP;

  const chargerListe = () => {
    const tok = window.MJBEARER;
    if (!tok) { setPersos([]); setErrListe("Connecte-toi en haut de page (Maître de la Tombe)."); return; }
    setErrListe("");
    fetch(SBLISTEP, {
      method: "POST",
      headers: { "apikey": SBK, "Authorization": "Bearer " + tok, "Content-Type": "application/json" },
      body: "{}"
    }).then(r => {
      if (!r.ok) throw new Error("http");
      return r.json();
    }).then(list => {
      const l = Array.isArray(list) ? list : [];
      setPersos(l);
      setCible(c => (l.some(p => p.id === c) ? c : (l[0] ? l[0].id : "")));
    }).catch(() => setErrListe("Liste indisponible — vérifie ta connexion MJ."));
  };
  useEffect(() => { chargerListe(); }, []);

  const catalogue = !EQ ? [] :
    cat === "arme" ? EQ.ARMES_DB.map(a => ({ v: "a:" + a.id, nom: a.nom, taille: a.taille }))
    : cat === "libre" ? []
    : EQ.MODULES_DB.filter(m => m.cat === cat).map(m => ({ v: "m:" + m.id, nom: m.nom, taille: m.taille }));

  const donner = () => {
    const tok = window.MJBEARER;
    if (!tok) { setMsg({ ok: false, txt: "Connecte-toi en haut de page (Maître de la Tombe)." }); return; }
    if (!cible) { setMsg({ ok: false, txt: "Choisis un personnage." }); return; }
    let item = null, label = "";
    if (cat === "libre") {
      const t = libre.trim();
      if (!t) { setMsg({ ok: false, txt: "Saisis le nom de l'objet." }); return; }
      item = { uid: EQ.uid(), kind: "objet", nom: t }; label = t;
    } else {
      const v = ref[cat] || (catalogue[0] && catalogue[0].v);
      if (!v) { setMsg({ ok: false, txt: "Choisis un objet." }); return; }
      if (v.slice(0, 2) === "a:") { const a = EQ.armeDe(v.slice(2)); item = { uid: EQ.uid(), kind: "arme", id: a.id }; label = a.nom; }
      else { const m = EQ.moduleDe(v.slice(2)); item = { uid: EQ.uid(), kind: "module", id: m.id }; label = m.nom; }
    }
    setMsg({ ok: null, txt: "Don en cours…" });
    fetch(SBDONNER, {
      method: "POST",
      headers: { "apikey": SBK, "Authorization": "Bearer " + tok, "Content-Type": "application/json" },
      body: JSON.stringify({ p_perso_id: cible, p_item: item })
    }).then(r => {
      if (!r.ok) return r.json().then(e => { throw new Error((e && e.message) || "http"); });
      return r.json();
    }).then(rep => {
      setMsg({ ok: true, txt: "« " + label + " » remis à " + ((rep && rep.perso) || "son personnage") + " — visible dans son inventaire." });
      setLibre("");
      chargerListe();
    }).catch(e => setMsg({ ok: false, txt: "Échec du don : " + (e.message === "http" ? "réessaie." : e.message) }));
  };

  if (!EQ) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h2 className="mb-4 text-xl font-bold text-[#2ee6c9]">Équipement des joueurs</h2>
        <div className="text-sm text-[#7a9187]">Base d'équipement indisponible — recharge la page.</div>
      </div>
    );
  }

  const nomArmeW = (w) => {
    if (typeof w === "string") { const a = EQ.armeParNom(w) || EQ.armeDe(w); return a ? a.nom : w; }
    const a = EQ.armeDe(w && w.id); return a ? a.nom : "?";
  };
  const nomModuleId = (mid) => { const m = EQ.moduleDe(mid); return m ? m.nom : String(mid); };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-[#2ee6c9]">Équipement des joueurs</h2>
        <button className={BTN} onClick={chargerListe}>Recharger</button>
      </div>
      <div className="mb-4 text-xs text-[#7a9187]">
        Remets une arme, un module ou un objet à un personnage : il apparaît dans son inventaire (Zone joueur, onglet Personnages) et le joueur l'équipe lui-même.
        Chaque châssis impose ses emplacements et sa taille max (T1 à T4).
      </div>

      {errListe && <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{errListe}</div>}

      {/* — Panneau de don — */}
      <div className={CADRE + " mb-4"}>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[#f0b24a]">Remettre un équipement</div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <div className={ETIQ}>Personnage</div>
            <select className={CHAMP + " w-full"} value={cible} onChange={e => setCible(e.target.value)}>
              <option value="">— Choisir —</option>
              {(persos || []).map(p => <option key={p.id} value={p.id}>{p.nom} ({p.joueur})</option>)}
            </select>
          </div>
          <div>
            <div className={ETIQ}>Catégorie</div>
            <select className={CHAMP + " w-full"} value={cat} onChange={e => { setCat(e.target.value); setLibre(""); }}>
              <option value="arme">Arme</option>
              <option value="capteur">Capteur</option>
              <option value="coeur">Cœur énergétique</option>
              <option value="noyau">Noyau énergétique</option>
              <option value="bouclier">Bouclier</option>
              <option value="systeme">Système logique</option>
              <option value="libre">Objet libre</option>
            </select>
          </div>
          <div>
            <div className={ETIQ}>Objet</div>
            {cat === "libre" ? (
              <input className={CHAMP + " w-full"} value={libre} onChange={e => setLibre(e.target.value)} placeholder="Nom de l'objet…" />
            ) : (
              <select className={CHAMP + " w-full"} value={ref[cat] || (catalogue[0] && catalogue[0].v) || ""} onChange={e => setRef(Object.assign({}, ref, { [cat]: e.target.value }))}>
                {catalogue.map(c => <option key={c.v} value={c.v}>{c.nom} ({EQ.T(c.taille)})</option>)}
              </select>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button className={BTN_MJ} onClick={donner}>Donner</button>
          {msg && (
            <span className={"text-xs font-bold " + (msg.ok === true ? "text-[#2ee6c9]" : msg.ok === false ? "text-red-300" : "text-[#7a9187]")}>{msg.txt}</span>
          )}
        </div>
      </div>

      {/* — Fiches réelles — */}
      {persos === null && <div className="text-sm text-[#7a9187]">Chargement des personnages…</div>}
      {persos !== null && persos.length === 0 && (
        <div className="text-sm text-[#7a9187]">Aucun personnage enregistré pour le moment. Les joueurs créent leurs personnages dans la Zone joueur (onglet Personnages).</div>
      )}
      {persos !== null && persos.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {persos.map(p => {
            const d = (p.resume && p.resume.data) || {};
            const ch = EQ.chassiDe(d.chassis) || EQ.chassiParNom(d.chassis) || EQ.CHASSIS_DB[0];
            const st = d.st || ch.st;
            const armes = Array.isArray(d.armes) ? d.armes : [];
            const mod = (d.modules && typeof d.modules === "object") ? d.modules : null;
            const dons = (p.resume && p.resume.dons) || [];
            return (
              <div key={p.id} className={CADRE + (p.id === cible ? " border-[#f0b24a]/50" : "")}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-lg font-bold text-[#c8e9df]">{p.nom}</div>
                  <span className="text-xs text-[#7a9187]">{p.joueur}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span className="rounded-full bg-[#f0b24a]/15 px-2 py-0.5 text-[11px] font-bold text-[#f0b24a]">{ch.nom}</span>
                  <span className="text-[11px] text-[#7a9187]">PV {(typeof d.pv_actuels === "number" ? d.pv_actuels : st.pv)} / {st.pv} · Cd {st.cd} · Sv {st.sv}</span>
                </div>
                <div className="mt-2 text-sm">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#7a9187]">Armes ({armes.length}/{ch.armes.n} — {EQ.T(ch.armes.t)} max)</div>
                  {armes.length ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {armes.map((w, i) => <span key={i} className="rounded-full bg-[#123326] px-2 py-0.5 text-[11px] font-bold text-[#2ee6c9]">{nomArmeW(w)}</span>)}
                    </div>
                  ) : <div className="text-xs text-[#7a9187]">Aucune arme équipée.</div>}
                </div>
                <div className="mt-2 text-sm">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#7a9187]">Modules</div>
                  {mod ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(mod.capteurs || []).map((m, i) => <span key={"c" + i} className="rounded-full bg-[#0a2620] px-2 py-0.5 text-[10px] font-bold text-[#7a9187]">{nomModuleId(m)}</span>)}
                      {mod.coeur ? <span className="rounded-full bg-[#0a2620] px-2 py-0.5 text-[10px] font-bold text-[#2ee6c9]">{nomModuleId(mod.coeur)}</span> : null}
                      {mod.noyau ? <span className="rounded-full bg-[#0a2620] px-2 py-0.5 text-[10px] font-bold text-[#2ee6c9]">{nomModuleId(mod.noyau)}</span> : null}
                      {mod.bouclier ? <span className="rounded-full bg-[#0a2620] px-2 py-0.5 text-[10px] font-bold text-[#2ee6c9]">{nomModuleId(mod.bouclier)}</span> : null}
                      {mod.systeme ? <span className="rounded-full bg-[#0a2620] px-2 py-0.5 text-[10px] font-bold text-[#2ee6c9]">{nomModuleId(mod.systeme)}</span> : null}
                      {!(mod.capteurs || []).length && !mod.coeur && !mod.noyau && !mod.bouclier && !mod.systeme ? <span className="text-xs text-[#7a9187]">Aucun module équipé.</span> : null}
                    </div>
                  ) : <div className="text-xs text-[#7a9187]">Aucun module équipé.</div>}
                </div>
                {dons.length > 0 && (
                  <div className="mt-2 rounded-lg border border-[#f0b24a]/40 bg-[#f0b24a]/5 px-3 py-2 text-xs text-[#f0b24a]">
                    {dons.length} don(s) en attente : le joueur doit les récupérer dans son inventaire.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Monde({ etat }) {
  const liste = etat.monde || [];
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h2 className="mb-4 text-xl font-bold text-[#2ee6c9]">Monde — instances d'objets ({liste.length})</h2>
      <div className="text-xs text-[#7a9187]">Les objets sont persistants d'une aventure à l'autre : une instance garde son intégrité et sa localisation.</div>
      <div className={CADRE + " mt-3"}>
        {liste.length === 0 && <div className="text-sm text-[#7a9187]">Aucune instance dans le monde. Ramassez des objets en aventure ou pillez des cadavres.</div>}
        <div className="grid gap-2">
          {liste.map(it => (
            <div key={it.uuid} className="grid gap-2 rounded-lg border border-[#2ee6c9]/15 bg-[#08120e] px-3 py-2 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <span className="font-bold text-[#c8e9df]">{it.nom}</span>
              <span className="text-xs text-[#7a9187]">intégrité <b className={coulInteg(it.integrite)}>{it.integrite} %</b> · {it.origine}</span>
              <span className="text-xs text-[#2ee6c9]">{it.localisation || "non localisé"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

var MAJ0 = (function(){ try { var b = localStorage.getItem(CLE); return b ? ((JSON.parse(b) || {})._maj || "") : ""; } catch (e) { return ""; } })();

function App() {
  const [etat, setEtat] = useState(charger);
  const [onglet, setOnglet] = useState("aventures");
  const [sel, setSel] = useState(null);
  const [supprEnCours, setSupprEnCours] = useState(null);
  const [panneauExp, setPanneauExp] = useState(false);
  const [nuage, setNuage] = useState({ txt: "sauvegarde : locale uniquement", ok: null });
  const etatRef = useRef(etat);
  const selRef = useRef(sel);
  const saleRef = useRef(false);
  const chargeRef = useRef(false);

  useEffect(() => {
    try { localStorage.setItem(CLE, JSON.stringify(Object.assign({}, etat, { _maj: new Date().toISOString() }))); } catch (e) {}
    etatRef.current = etat;
    saleRef.current = true;
  }, [etat]);

  useEffect(() => { selRef.current = sel; }, [sel]);

  const pousserNuage = () => {
    const tok = window.MJBEARER;
    const e = etatRef.current;
    if (!tok || !e || !e.aventures) return;
    const corps = Object.assign({}, e, { _maj: new Date().toISOString() });
    fetch(SBSAVE, {
      method: "POST",
      headers: { "apikey": SBK, "Authorization": "Bearer " + tok, "Content-Type": "application/json" },
      body: JSON.stringify({ p_etat: corps })
    }).then(r => {
      if (!r.ok) throw new Error("http");
      setNuage({ txt: "sauvegardé sur le serveur", ok: true });
      const s = selRef.current;
      if (s && s.mode === "jeu") {
        const av = (e.aventures || []).find(a => a.id === s.avId);
        const st = (e.statuts || {})[s.avId] || "en_cours";
        return fetch(SBRPC, {
          method: "POST",
          headers: { "apikey": SBK, "Authorization": "Bearer " + tok, "Content-Type": "application/json" },
          body: JSON.stringify({ p_titre: (av && (av.titre || "")) || "Aventure", p_statut: st === "finie" ? "terminee" : "active", p_blocs: blocsPour(e, s.avId) })
        }).then(r2 => { if (!r2.ok) throw new Error("pub"); });
      }
      return null;
    }).catch(() => {
      saleRef.current = true;
      setNuage({ txt: "serveur injoignable — copie locale OK", ok: false });
    });
  };

  useEffect(() => {
    const t = setInterval(() => {
      const tok = window.MJBEARER;
      if (!tok) return;
      if (!chargeRef.current) {
        chargeRef.current = true;
        fetch(SBCHARGE, {
          method: "POST",
          headers: { "apikey": SBK, "Authorization": "Bearer " + tok, "Content-Type": "application/json" },
          body: "{}"
        }).then(r => r.ok ? r.json() : null).then(srv => {
          if (srv && typeof srv === "object" && srv.aventures && (srv._maj || "") > MAJ0) {
            setEtat(normaliser(srv));
            setNuage({ txt: "chargé depuis le serveur", ok: true });
          }
        }).catch(() => { chargeRef.current = false; });
        return;
      }
      if (saleRef.current) { saleRef.current = false; pousserNuage(); }
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const maj = (fn) => setEtat(prev => {
    const n = JSON.parse(JSON.stringify(prev));
    fn(n);
    return n;
  });

  const importer = (e) => { setEtat(e); setSel(null); };
  const ouvrir = (avId) => { maj(p => { avecPartie(p, avId); }); setSel({ avId: avId, mode: "jeu" }); };
  const editer = (avId) => { maj(p => { avecPartie(p, avId); }); setSel({ avId: avId, mode: "edit" }); };
  const creer = () => {
    const id = uid();
    maj(p => {
      p.aventures.push({ id: id, titre: "Nouvelle aventure", scenes: [] });
      avecPartie(p, id);
    });
    setSel({ avId: id, mode: "edit" });
  };
  const confirmerSuppr = (avId) => {
    maj(p => {
      p.aventures = (p.aventures || []).filter(a => a.id !== avId);
      delete p.statuts[avId];
      delete p.parties[avId];
    });
    setSupprEnCours(null);
    if (sel && sel.avId === avId) setSel(null);
  };

  return (
    <div style={FOND} className="min-h-screen bg-[#0a120f] pb-10 text-[#c8d6cf]">
      <Entete onglet={onglet} setOnglet={setOnglet} ouvrirExp={() => setPanneauExp(true)} nuageTxt={nuage.txt} nuageOk={nuage.ok} />
      <div className="mx-auto max-w-5xl px-4 pt-3">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#f0b24a]/30 bg-[#f0b24a]/5 px-3 py-2">
          {[["aventures", "Aventures"], ["inventaires", "Équipement"], ["monde", "Monde"]].map(o => (
            <button key={o[0]} onClick={() => setOnglet(o[0])}
              className={(onglet === o[0] ? "border-[#2ee6c9] bg-[#123326] text-[#2ee6c9]" : "border-[#2ee6c9]/25 text-[#7a9187] hover:text-[#c8e9df]") + " rounded-full border px-3 py-1 text-xs font-bold tracking-wide"}>
              {o[1]}
            </button>
          ))}
        </div>
      </div>
      {onglet === "aventures" && (!sel ? (
        <Bibliotheque
          etat={etat} ouvrir={ouvrir} editer={editer} creer={creer}
          supprEnCours={supprEnCours} setSupprEnCours={setSupprEnCours} confirmerSuppr={confirmerSuppr}
        />
      ) : sel.mode === "edit" ? (
        <Editeur
          etat={etat} maj={maj} avId={sel.avId}
          retour={() => setSel(null)}
          jouer={() => setSel({ avId: sel.avId, mode: "jeu" })}
        />
      ) : (
        <VueAventure
          etat={etat} maj={maj} avId={sel.avId}
          retour={() => setSel(null)}
          basculerEdit={() => setSel({ avId: sel.avId, mode: "edit" })}
        />
      ))}
      {onglet === "inventaires" && <Inventaires />}
      {onglet === "monde" && <Monde etat={etat} />}
      {panneauExp && <PanneauExport etat={etat} importer={importer} fermer={() => setPanneauExp(false)} />}
    </div>
  );
}

/* Montage de l'application dans #pe-moteur-racine (espace-mj/moteur.html) */
(function(){
  var el = document.getElementById("pe-moteur-racine");
  if (!el || !window.React || !window.ReactDOM) { return; }
  if (ReactDOM.createRoot) { ReactDOM.createRoot(el).render(React.createElement(App)); }
  else { ReactDOM.render(React.createElement(App), el); }
})();
