/* ════════ L'ÉVEIL SÉQUENTIEL — six étapes scellées (Michael) : ① la
   naissance (nom + sexe — le sexe pèse sur certains ajustements
   nationaux), ② les dés de naissance (7 × 3D6, la pitié du livre si
   total ≤ 52), ③ la nationalité (1D100 — le Chaos décide), ④ l'origine
   sociale (1D100, sauf classes forcées par la nationalité) et l'âge,
   ⑤ les compétences (classe + universelles + 1D6+2 supplémentaires),
   ⑥ la gravure (dérivés, bénéfices, validation). Chaque étape validée
   verrouille la précédente — l'ordonnance du livre fait loi. */
function EcranCreationAventurier({ contenu, accent, livre, onValide, onAnnule }) {
  const L = livre || {};
  const ORDRE = contenu.ordreCaracs || (L.caracteristiques && L.caracteristiques.liste) || ["FOR", "CON", "TAI", "INT", "POU", "DEX", "CHA"];
  const nations = (L.nationalites && L.nationalites.liste) || [];
  const classesL = (L.classes && L.classes.liste) || {};
  const tableSociale = (L.origineSociale && L.origineSociale.table) || [];
  const universelles = ((L.classes || {}).universelles || {}).competences || [];
  const armesMelee = ((L.armes || {}).melee) || [];
  const armesBoucliers = ((L.armes || {}).boucliers) || [];
  const armesJet = ((L.armes || {}).jet) || [];
  const beneficesDe = id => ((classesL[id] || {}).benefices) || [];
  /* les universelles et leur famille (§2.4 — connues de tous à 10 %) */
  const FAM_UNIV = { "Sauter": "agilite", "Grimper": "agilite", "Éviter": "agilite", "Équilibre": "agilite", "Persuader": "communication", "Écouter": "perception", "Se cacher": "discretion" };
  const TAUX_CLASSE = { pretre: 3, noble: 2 };

  const [etape, setEtape] = useState(1);
  const [nom, setNom] = useState("");
  const [sexe, setSexe] = useState(null);
  const [jets, setJets] = useState(null); /* 7 × [d,d,d] — la matrice brute */
  const [caracs, setCaracs] = useState(null); /* après les ajustements nationaux */
  const [traceAjust, setTraceAjust] = useState(null);
  const [jetNation, setJetNation] = useState(null);
  const [nation, setNation] = useState(null);
  const [jetClasse, setJetClasse] = useState(null);
  const [classe, setClasse] = useState(null); /* { id, nom } */
  const [age, setAge] = useState(25);
  const [nbSupp, setNbSupp] = useState(null); /* le 1D6+2 du Chaos */
  const [suppChoisis, setSuppChoisis] = useState([]); /* [{ nom, famille }] */
  const [armesChoisies, setArmesChoisies] = useState({}); /* slot → arme du livre */

  const caracsNaissance = jets ? Object.fromEntries(ORDRE.map(k => [k, jets[k][0] + jets[k][1] + jets[k][2]])) : null;
  const totalNaissance = caracsNaissance ? ORDRE.reduce((s, k) => s + caracsNaissance[k], 0) : 0;
  const pitie = !!caracsNaissance && totalNaissance <= 52;

  const lancerDesNaissance = () => {
    const j = {};
    ORDRE.forEach(k => { j[k] = [d6(), d6(), d6()]; });
    setJets(j);
  };
  const tirerNation = () => {
    const j = lancerDes("1D100");
    const n = trouverNation(j, nations);
    if (!n) return;
    const fait = appliquerAjustements(caracsNaissance, n.ajustements, sexe);
    setJetNation(j);
    setNation(n);
    setCaracs(fait.caracs);
    setTraceAjust(fait.trace);
  };
  const tirerClasse = () => {
    const forcees = (nation.classesForcees || []).map(nom => ({ id: nom.toLowerCase(), nom }));
    if (forcees.length === 1) { setJetClasse(null); setClasse(forcees[0]); return; }
    if (forcees.length >= 2) {
      /* la nation n'admet que ses classes : le Chaos tranche entre elles */
      const j = lancerDes("1D100");
      setJetClasse(j);
      setClasse(forcees[j <= 50 ? 0 : 1]);
      return;
    }
    const j = lancerDes("1D100");
    const r = trouverClasseSociale(j, tableSociale);
    if (!r) return;
    let id = r.classe.toLowerCase(), nomC = r.classe;
    /* le Guerrier social porte la marque du livre : 1D10, 9-10 → Assassin */
    if (id === "guerrier" && r.special && r.special.includes("Assassin") && lancerDes("1D10") >= 9) { id = "assassin"; nomC = "Assassin"; }
    setJetClasse(j);
    setClasse({ id, nom: nomC });
  };

  /* la classe porte-t-elle des slots d'armes (« 1re arme ou bouclier »,
     « Arme au choix ») — gravés comme objets physiques, pas comme lignes */
  const compsClasse = classe ? (classesL[classe.id].competences || []) : [];
  const estSlotArme = comp => /[Aa]rme/.test(comp.nom);
  const slotsArmes = compsClasse.filter(estSlotArme);
  const optionsArme = slot => (slot.nom.includes("ouclier") ? armesMelee.concat(armesBoucliers) : armesMelee)
    .filter(w => (w.for == null || (caracs.FOR || 0) >= w.for) && (w.dex == null || (caracs.DEX || 0) >= w.dex));
  const chercherArmeLivre = nom => armesMelee.concat(armesBoucliers, armesJet).find(w => w.nom === nom) || null;

  /* le catalogue des supplémentaires : les compétences du ch. 4 portées
     par le pack (leurs noms propres), hors ARMES (2 compétences l'une)
     et hors INVOCATION (famille maison, gravure à part) */
  const nomPris = new Set(compsClasse.map(c => c.nom).concat(universelles));
  const catalogue = [];
  Object.entries(contenu.themesCompetences || {}).forEach(([famille, items]) => {
    if (famille === "ARMES - ARMURES" || famille === "INVOCATION") return;
    (items || []).forEach(k => { if (!nomPris.has(k)) catalogue.push({ nom: k, famille }); });
  });

  const validerEtape = () => {
    if (etape === 1 && nom.trim() && sexe) setEtape(2);
    else if (etape === 2 && jets) setEtape(3);
    else if (etape === 3 && nation) setEtape(4);
    else if (etape === 4 && classe && age >= 14 && age <= 90) setEtape(5);
    else if (etape === 5 && nbSupp != null && suppChoisis.length === nbSupp && slotsArmes.every(s => armesChoisies[s.nom])) setEtape(6);
  };
  const peutValider =
    etape === 1 ? !!(nom.trim() && sexe) :
    etape === 2 ? !!jets :
    etape === 3 ? !!nation :
    etape === 4 ? !!(classe && age >= 14 && age <= 90) :
    etape === 5 ? !!(nbSupp != null && suppChoisis.length === nbSupp && slotsArmes.every(s => armesChoisies[s.nom])) :
    false;

  /* la gravure finale : tout ce que le livre a fait naître devient
     l'aventurier — la fiche complète, prête pour la Tombe */
  const graver = () => {
    const bF = (() => {
      const plus = k => (caracs[k] > 12 ? caracs[k] - 12 : caracs[k] < 9 ? 9 - caracs[k] : 0);
      const inv = k => (caracs[k] > 12 ? 12 - caracs[k] : caracs[k] < 9 ? 9 - caracs[k] : 0);
      return { attaque: plus("FOR") + plus("INT") + plus("POU") + plus("DEX"), parade: plus("FOR") + plus("POU") + plus("DEX") + inv("TAI") };
    })();
    const dom = bonusDommagesDe(caracs.FOR, caracs.TAI);
    const physique = fam => fam === "attaque_parade" || fam === "agilite" || fam === "discretion" || fam === "AGILITÉ" || fam === "DISCRÉTION";
    const compsGravees = {};
    const armesGravees = [];
    const armeGravee = (w, base) => ({
      nom: w.nom,
      seuil: (base + bF.attaque) + "/" + (base + bF.parade),
      degats: (w.degats || "") + (dom && dom.startsWith("−") ? " " + dom : ""),
      bonus: dom && dom.startsWith("+") ? dom.slice(1) : ""
    });
    compsClasse.forEach(comp => {
      const base = typeof comp.base === "number" ? comp.base : (lancerDes(comp.base) || 0);
      if (estSlotArme(comp)) {
        const w = armesChoisies[comp.nom];
        if (w) armesGravees.push(armeGravee(w, base));
        return;
      }
      const fam = comp.bonus || "aucun";
      compsGravees[comp.nom] = Math.max(0, base + modulationAge(age, physique(fam)));
      /* une arme nommée par la classe (Dague, Bâton…) devient aussi un objet physique */
      const w = chercherArmeLivre(comp.nom);
      if (w) armesGravees.push(armeGravee(w, base));
    });
    universelles.forEach(u => {
      const fam = FAM_UNIV[u] || "agilite";
      compsGravees[u] = Math.max(0, 10 + modulationAge(age, physique(fam)));
    });
    suppChoisis.forEach(s => {
      compsGravees[s.nom] = Math.max(0, 10 + Math.ceil((1 + Math.floor(Math.random() * 100)) / 2) + modulationAge(age, physique(s.famille)));
    });
    const pv = pvDepuis(caracs);
    const sanMax = sanDepuis(caracs.POU, nation.san);
    const sorcier = (caracs.INT || 0) + (caracs.POU || 0) >= 32;
    onValide({
      id: "cree", nom: nom.trim(),
      origine: nation.nom + " · " + classe.nom + (sorcier ? " — les dés disent sorcier (INT + POU ≥ 32)" : ""),
      identite: { titre: classe.nom, sexe, age: parseInt(age, 10), yeux: "", cheveux: "", nationalite: nation.nom, culte: "" },
      caracs,
      pv, pvMax: pv, blessureMajeure: Math.floor(pv / 2),
      san: sanMax, sanMax, sft: Math.floor(sanMax / 2),
      bonusConnaissanceAge: TAUX_CLASSE[classe.id] || 1,
      competences: compsGravees,
      armes: armesGravees, armures: [], pouvoirs: [], possessions: []
    });
  };

  const ETAPES = [["NAISSANCE"], ["LES DÉS"], ["NATIONALITÉ"], ["ORIGINE SOCIALE"], ["COMPÉTENCES"], ["GRAVURE"]];
  return (
    <div className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid " + accent + "33" }}>
      <div className="flex items-baseline justify-between mb-1">
        <div className="font-bold text-lg" style={{ color: accent }}>L'ÉVEIL D'UN AVENTURIER</div>
        <div className="text-xs" style={{ color: "#71717a" }}>rituel séquentiel — le livre fait loi</div>
      </div>
      {/* le fil des étapes : chaque pastille scellée derrière, la courante en accent */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {ETAPES.map(([lbl], i) => (
          <div key={lbl} className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"
            style={{ background: etape > i + 1 ? accent + "22" : etape === i + 1 ? accent : "#ffffff0d", color: etape >= i + 1 ? (etape === i + 1 ? "#0c0d10" : accent) : "#52525b" }}>
            {i + 1} · {lbl}
          </div>
        ))}
      </div>

      {/* ① LA NAISSANCE — le nom et le sexe, avant tout : le sexe pèse
          sur certains ajustements nationaux (Myrrhyn : CHA +1D6 si femme) */}
      {etape === 1 && (<div>
        <div className="text-xs mb-3" style={{ color: "#a1a1aa" }}>
          La naissance d'abord : un nom, un sexe — la suite est aux dés (§2.1).
        </div>
        <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom de l'aventurier…"
          className="w-full rounded-lg px-3 py-2 mb-3 text-sm"
          style={{ background: "#0c0d10", border: "1px solid #3f3f46", color: "#e8e4d8" }} />
        <div className="flex gap-2">
          {["Homme", "Femme"].map(s => (
            <button key={s} onClick={() => setSexe(s)} className="flex-1 py-2 rounded-lg text-sm font-bold"
              style={{ background: sexe === s ? accent : "#0c0d10", color: sexe === s ? "#0c0d10" : "#a1a1aa", border: "1px solid " + (sexe === s ? accent : "#3f3f46") }}>
              {s}
            </button>
          ))}
        </div>
      </div>)}

      {/* ② LES DÉS DE NAISSANCE — 7 × 3D6 ; toujours validable ; la
          pitié du livre : total ≤ 52 → tout relancer (jamais un plafond) */}
      {etape === 2 && (<div>
        <div className="text-xs mb-3" style={{ color: "#a1a1aa" }}>
          Les dés de naissance (§2.1) : 3D6 pour chacune des 7 caractéristiques.
        </div>
        {!jets && (
          <button onClick={lancerDesNaissance} className="w-full py-2.5 rounded-lg font-bold text-black mb-3" style={{ background: accent }}>
            LANCER LES DÉS DE NAISSANCE (7 × 3D6)
          </button>
        )}
        {jets && (<div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center mb-2">
            {ORDRE.map(k => (
              <div key={k} className="rounded-lg py-2" style={{ background: "#ffffff0d" }}>
                <div className="text-xs" style={{ color: "#71717a" }}>{k}</div>
                <div className="text-2xl font-bold" style={{ color: "#e8e4d8" }}>{caracsNaissance[k]}</div>
                <div className="text-xs" style={{ color: "#a1a1aa" }}>{jets[k].join(" + ")}</div>
              </div>
            ))}
            <div className="rounded-lg py-2" style={{ background: accent + "22", border: "1px solid " + accent + "44" }}>
              <div className="text-xs" style={{ color: "#71717a" }}>Total</div>
              <div className="text-2xl font-bold" style={{ color: accent }}>{totalNaissance}</div>
              <div className="text-xs" style={{ color: "#a1a1aa" }}>{pitie ? "≤ 52 — pitié" : "— les dés ont parlé"}</div>
            </div>
          </div>
          {pitie && (
            <button onClick={lancerDesNaissance} className="w-full py-2 rounded-lg text-sm font-bold mb-2"
              style={{ background: "#0c0d10", color: accent, border: "1px solid " + accent + "44" }}>
              TOUT RELANCER — la pitié du livre (total ≤ 52)
            </button>
          )}
        </div>)}
      </div>)}

      {/* ③ LA NATIONALITÉ — 1D100 sur la table des Jeunes Royaumes :
          le Chaos décide ; ses ajustements s'appliquent aux dés */}
      {etape === 3 && (<div>
        <div className="text-xs mb-3" style={{ color: "#a1a1aa" }}>
          La nationalité (§2.2) : 1D100 sur la table des Jeunes Royaumes — le Chaos décide.
        </div>
        {!nation && (
          <button onClick={tirerNation} className="w-full py-2.5 rounded-lg font-bold text-black mb-3" style={{ background: accent }}>
            TIRER LA NATIONALITÉ (1D100)
          </button>
        )}
        {nation && (<div className="rounded-lg p-3" style={{ background: "#0c0d10", border: "1px solid " + accent + "44" }}>
          <div className="flex items-baseline justify-between mb-2">
            <div className="font-bold" style={{ color: accent }}>{nation.nom}</div>
            <div className="text-xs" style={{ color: "#71717a" }}>1D100 → {jetNation}</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center mb-2">
            {ORDRE.map(k => (
              <div key={k} className="rounded py-1.5 text-xs" style={{ background: "#ffffff0d", color: "#c8c8ce" }}>
                {k} <b style={{ color: "#e8e4d8" }}>{caracs[k]}</b>
              </div>
            ))}
          </div>
          {traceAjust && traceAjust.length > 0 && (
            <div className="text-xs mb-2" style={{ color: "#a1a1aa" }}>
              {traceAjust.map(t => t.c + " " + t.avant + "→" + t.apres).join(" · ")}
            </div>
          )}
          <div className="text-xs" style={{ color: "#71717a" }}>
            Modificateur de SAN : {nation.san > 0 ? "+" : ""}{nation.san}
            {(nation.classesForcees || []).length > 0 ? " · classes imposées : " + nation.classesForcees.join(", ") : ""}
            {(caracs.INT || 0) + (caracs.POU || 0) >= 32 ? " · INT + POU ≥ 32 : les dés disent sorcier" : ""}
          </div>
        </div>)}
      </div>)}

      {/* ④ L'ORIGINE SOCIALE — la classe (1D100, sauf classes forcées)
          et l'âge (base 25) */}
      {etape === 4 && (<div>
        <div className="text-xs mb-3" style={{ color: "#a1a1aa" }}>
          L'origine sociale (§2.3) : la classe vient de la table — l'âge, de vous (base 25).
        </div>
        {!classe && (
          <button onClick={tirerClasse} className="w-full py-2.5 rounded-lg font-bold text-black mb-3" style={{ background: accent }}>
            TIRER L'ORIGINE SOCIALE (1D100)
          </button>
        )}
        {classe && (<div className="rounded-lg p-3 mb-3" style={{ background: "#0c0d10", border: "1px solid " + accent + "44" }}>
          <div className="flex items-baseline justify-between mb-2">
            <div className="font-bold" style={{ color: accent }}>{classe.nom}</div>
            <div className="text-xs" style={{ color: "#71717a" }}>
              {jetClasse ? "1D100 → " + jetClasse : "imposée par la nationalité"}
            </div>
          </div>
          <div className="text-xs mb-2" style={{ color: "#a1a1aa" }}>
            {compsClasse.map(c => c.nom + " " + (typeof c.base === "number" ? c.base + "%" : c.base)).join(" · ")}
          </div>
          <div className="text-xs" style={{ color: "#71717a" }}>
            {beneficesDe(classe.id).join(" — ")}
          </div>
        </div>)}
        {classe && (<div className="flex items-center gap-3">
          <div className="text-xs" style={{ color: "#a1a1aa" }}>Âge</div>
          <input type="number" min={14} max={90} value={age}
            onChange={e => setAge(Math.max(14, Math.min(90, parseInt(e.target.value, 10) || 25)))}
            className="w-24 rounded px-3 py-1.5 text-sm"
            style={{ background: "#0c0d10", border: "1px solid #3f3f46", color: "#e8e4d8" }} />
          <div className="text-xs" style={{ color: "#71717a" }}>
            {age < 25 ? "jeune : −5 % par année sous 25" : age <= 40 ? "+1 % par année au-delà de 25 (max +15)" : "vieux : −1 % par année aux physiques"}
          </div>
        </div>)}
      </div>)}

      {/* ⑤ LES COMPÉTENCES — de classe (armes = objets physiques),
          universelles, et le compte du Chaos 1D6+2 à choisir */}
      {etape === 5 && (<div>
        <div className="text-xs mb-3" style={{ color: "#a1a1aa" }}>
          Les compétences (§2.4) : celles de la classe, les universelles à 10 % — et {nbSupp == null ? "le Chaos va compter" : nbSupp + " choisies"} par vous.
        </div>
        {nbSupp == null && (
          <button onClick={() => setNbSupp((lancerDes("1D6") || 1) + 2)} className="w-full py-2.5 rounded-lg font-bold text-black mb-3" style={{ background: accent }}>
            LE CHAOS COMPTE (1D6+2)
          </button>
        )}
        {nbSupp != null && (<div>
          {slotsArmes.length > 0 && (<div className="mb-3">
            <div className="text-[10px] mb-1 tracking-widest" style={{ color: "#71717a" }}>LES ARMES DE LA CLASSE (FOR/DEX requises)</div>
            {slotsArmes.map(comp => (
              <div key={comp.nom} className="flex items-center gap-2 mb-1">
                <div className="text-xs flex-1" style={{ color: "#c8c8ce" }}>{comp.nom} · {typeof comp.base === "number" ? comp.base + "%" : comp.base}</div>
                <select value={(armesChoisies[comp.nom] || {}).nom || ""}
                  onChange={e => setArmesChoisies({ ...armesChoisies, [comp.nom]: optionsArme(comp).find(w => w.nom === e.target.value) })}
                  className="rounded px-2 py-1 text-xs" style={{ background: "#14161b", color: "#e8e4d8", border: "1px solid #3f3f46" }}>
                  <option value="">— choisir l'arme —</option>
                  {optionsArme(comp).map(w => (
                    <option key={w.nom} value={w.nom}>{w.nom} · {w.degats}{w.for ? " · FOR " + w.for : ""}{w.dex ? " · DEX " + w.dex : ""}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>)}
          <div className="text-[10px] mb-1 tracking-widest" style={{ color: "#71717a" }}>LES {nbSupp} SUPPLÉMENTAIRES (10 + 1D100/2 à la gravure)</div>
          <div className="grid md:grid-cols-3 gap-1 mb-2">
            {catalogue.map(s => {
              const choisi = suppChoisis.some(x => x.nom === s.nom);
              const complet = suppChoisis.length >= nbSupp;
              return (
                <button key={s.nom} onClick={() => setSuppChoisis(choisi ? suppChoisis.filter(x => x.nom !== s.nom) : (complet ? suppChoisis : suppChoisis.concat([s])))}
                  className="rounded px-2 py-1 text-xs text-left"
                  style={{ background: choisi ? accent + "22" : "#ffffff0d", color: choisi ? accent : "#c8c8ce", border: "1px solid " + (choisi ? accent + "44" : "transparent"), cursor: "pointer" }}>
                  {choisi ? "✓ " : ""}{s.nom}
                </button>
              );
            })}
          </div>
          <div className="text-xs text-center" style={{ color: "#71717a" }}>
            {suppChoisis.length} / {nbSupp} choisies · universelles connues de tous : {universelles.join(", ")}
          </div>
        </div>)}
      </div>)}

      {/* ⑥ LA GRAVURE — les dérivés du livre, les bénéfices, la fiche
          complète : la validation fait naître l'aventurier */}
      {etape === 6 && (() => {
        const pv = pvDepuis(caracs);
        const sanMax = sanDepuis(caracs.POU, nation.san);
        const dom = bonusDommagesDe(caracs.FOR, caracs.TAI);
        return (<div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center mb-3">
            <div className="rounded-lg py-2" style={{ background: "#ffffff0d" }}>
              <div className="text-xs" style={{ color: "#71717a" }}>PV (CON/TAI)</div>
              <div className="text-2xl font-bold" style={{ color: "#e8e4d8" }}>{pv}</div>
              <div className="text-[10px]" style={{ color: "#a1a1aa" }}>majeure à {Math.floor(pv / 2)}</div>
            </div>
            <div className="rounded-lg py-2" style={{ background: "#ffffff0d" }}>
              <div className="text-xs" style={{ color: "#71717a" }}>SAN (5×POU{nation.san ? (nation.san > 0 ? "+" : "") + nation.san : ""})</div>
              <div className="text-2xl font-bold" style={{ color: "#e8e4d8" }}>{sanMax}</div>
              <div className="text-[10px]" style={{ color: "#a1a1aa" }}>SFT {Math.floor(sanMax / 2)}</div>
            </div>
            <div className="rounded-lg py-2" style={{ background: "#ffffff0d" }}>
              <div className="text-xs" style={{ color: "#71717a" }}>Bonus de dommages</div>
              <div className="text-2xl font-bold" style={{ color: "#e8e4d8" }}>{dom || "aucun"}</div>
              <div className="text-[10px]" style={{ color: "#a1a1aa" }}>FOR {caracs.FOR} + TAI {caracs.TAI}</div>
            </div>
            <div className="rounded-lg py-2" style={{ background: "#ffffff0d" }}>
              <div className="text-xs" style={{ color: "#71717a" }}>L'aventurier</div>
              <div className="text-sm font-bold" style={{ color: accent }}>{nom.trim()}</div>
              <div className="text-[10px]" style={{ color: "#a1a1aa" }}>{nation.nom} · {classe.nom} · {age} ans</div>
            </div>
          </div>
          <div className="text-xs mb-2" style={{ color: "#a1a1aa" }}>
            Bénéfices de la classe : {beneficesDe(classe.id).join(" — ") || "aucun gravé"} · Yeux, cheveux, culte et corpulence se complètent librement sur la fiche.
          </div>
        </div>);
      })()}

      {/* le pied : annuler / valider l'étape — la gravure ferme le rituel */}
      <div className="flex gap-2 mt-4">
        <button onClick={onAnnule} className="flex-1 py-2 rounded-lg text-sm font-bold"
          style={{ background: "#0c0d10", color: "#a1a1aa", border: "1px solid #3f3f46" }}>QUITTER LE RITUEL</button>
        {etape < 6 && (
          <button onClick={validerEtape} disabled={!peutValider}
            className="flex-1 py-2 rounded-lg text-sm font-bold"
            style={{ background: peutValider ? accent : "#27272a", color: peutValider ? "#0c0d10" : "#71717a" }}>
            VALIDER — {ETAPES[etape - 1][0]}
          </button>
        )}
        {etape === 6 && (
          <button onClick={graver} className="flex-1 py-2 rounded-lg text-sm font-bold"
            style={{ background: accent, color: "#0c0d10" }}>
            GRAVER {nom.trim() || "L'AVENTURIER"}
          </button>
        )}
      </div>
    </div>
  );
}

