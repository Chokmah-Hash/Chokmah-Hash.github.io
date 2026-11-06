function VueNoyau40k({ pack, onRetour, role, onJournal, table, joueur, avatar, consolePartie, versionBase, onAvatar, onLogout, persoChoisi }) {
  const T = pack.theme;
  const C = pack.contenu; /* le sac de données du pack : fiche, arsenal… */
  /* V0.49 — ORDONNANCE : l'écran en onglets. CANTINA d'abord (console,
     dés, journal), puis SCENARIO (MJ) ou FICHE PERSONNAGE (joueur). */
  const [onglet, setOnglet] = useState("cantina");
  /* V0.51 — le cadre COMPTE — CLOUD s'ouvre depuis l'icône du joueur */
  const [compteOuvert, setCompteOuvert] = useState(false);
  const [journal, setJournal] = useState([]);
  const [pvSigna, setPvSigna] = useState(0);
  const [cibleLibre, setCibleLibre] = useState("4+");
  const [modLibre, setModLibre] = useState(0);
  const [dernierDe, setDernierDe] = useState(null); /* la face du dernier jet, pour le dé en points */
  /* — création d'unité : l'unité éveillée EST la fiche — */
  const [enCreationPE, setEnCreationPE] = useState(false);
  const [persoCree, setPersoCree] = useState(null);
  /* — V43 : l'écran MJ des fiches de la table — */
  const [fichesMjOuvert, setFichesMjOuvert] = useState(false);
  const evId = useRef(1);

  /* V43 — ADOPTION : en partie, ma fiche vit dans la Tombe. Au montage,
     si une fiche m'attendait (créée à une session précédente), elle
     RÉSIDE ici : l'unité renaît, avec ses PV au moment du départ.
     On n'adopte QUE si aucune création locale n'a déjà eu lieu. */
  useEffect(() => {
    if (!table || !table.fiches || persoCree) return;
    const ma = table.fiches.find(f => f.compte_id === table.monCompteId);
    if (ma && ma.contenu && ma.contenu.perso) {
      setPersoCree(ma.contenu.perso);
      setPvSigna(typeof ma.contenu.pv === "number" ? ma.contenu.pv : ma.contenu.perso.pvMax);
    }
  }, [table && table.partieId]); /* eslint-disable-line */

  /* ════════ V0.77 — LE BRANCHEMENT DE LA PORTE 40K ════════
     L'unité PRIS POUR L'AVENTURE entre d'elle-même dans la Tombe
     dès l'arrivée à la porte. La fiche de partie existante PRIME
     (elle porte les blessures en cours) ; une création locale
     aussi ; le choix manuel à la porte reste pour changer d'avis. */
  useEffect(() => {
    if (!table || !table.fiches || persoCree) return;
    const ma = table.fiches.find(f => f.compte_id === table.monCompteId);
    if (ma) return;
    const liste = (table.persos || []).filter(p => p && p.contenu);
    if (!liste.length || !persoChoisi) return;
    const prise = liste.find(p => p.id === persoChoisi);
    if (!prise) return;
    setPersoCree(prise.contenu);
    setPvSigna(prise.contenu.pvMax || C.perso.pvMax);
    logEvent("perso.adoption", `${prise.contenu.nom} entre dans la Tombe — PRIS POUR L'AVENTURE · ${resumePerso(prise.contenu)} · PV au complet`);
  }, [table && table.partieId, persoChoisi]); /* eslint-disable-line */

  /* V43 — GRAVURE LIVE : chaque battement de l'unité part dans la
     Tombe (upsert silencieux — la poussée temps réel l'annonce à la
     table). Le MJ voit les PV de tout le monde en direct. */
  useEffect(() => {
    if (!table || !table.partieId || !table.onFiche || !persoCree) return;
    table.onFiche({ perso: persoCree, pv: pvSigna });
  }, [persoCree, pvSigna]); /* eslint-disable-line */

  const heure = () => new Date().toLocaleTimeString("fr-FR", { hour12: false });
  const logEvent = (type, texte) => {
    setJournal(j => [...j, { id: evId.current++, quand: heure(), type, texte }]);
    onJournal && onJournal(type, texte); /* V3 : chaque événement du moteur se grave aussi dans la Console Globale */
  };

  /* Jet libre (la primitive du noyau, étiquetée) — V0.49 : la face du dé
     reste affichée en points sous le bouton (feedback visuel du CANTINA) */
  const jetLibre = () => {
    const r = resoudreTest(cibleLibre, modLibre, pack.noyau);
    setDernierDe({ v: r.de, reussi: r.reussi, nat: r.nat });
    const modTxt = modLibre === 0 ? "" : modLibre > 0 ? " (+1)" : " (−1)";
    logEvent("libre.jet", `Jet libre — cible ${cibleLibre}${modTxt} → ${r.de}${r.nat ? " · " + r.nat : ""} — ${r.reussi ? "RÉUSSI" : "ÉCHOUÉ"}`);
  };

  /* Écriture compensatoire : on n'efface JAMAIS, on annule par écrit */
  const corrigerDernier = () => {
    const dernier = journal[journal.length - 1];
    if (!dernier) return;
    setJournal(j => [
      ...j.map(e => (e.id === dernier.id ? { ...e, annule: true } : e)),
      { id: evId.current++, quand: heure(), type: "journal.correction",
        texte: `Écriture compensatoire : annule l'événement #${dernier.id} (« ${dernier.texte.slice(0, 60)}${dernier.texte.length > 60 ? "…" : ""} ») — motif : démonstration append-only` }
    ]);
  };

  /* V0.49 — la fiche active : l'unité éveillée, ou RIEN (plus de démo
     Signa-3 : l'onglet FICHE PERSONNAGE montre un état vide sinon) */
  const perso = persoCree || null;

  const validerCreation = (p) => {
    setPersoCree(p);
    setEnCreationPE(false);
    setPvSigna(p.pvMax);
    logEvent("perso.creation", rendreGabarit(C.journalCreation, { ...p, arme: (p.armeDef || {}).nom }));
  };

  /* V48 — ADOPTION DU REGISTRE : l'unité choisie à la porte entre dans la
     Tombe — elle devient la fiche de partie (la gravure live la sème, comme
     pour toute création). PV au complet : les blessures d'une autre
     aventure ne l'ont pas suivie, elles vivent dans la fiche de partie. */
  const adopterDuRegistre = (p) => {
    if (!p || !p.contenu) return;
    setPersoCree(p.contenu);
    setPvSigna(p.contenu.pvMax || C.perso.pvMax);
    logEvent("perso.adoption", `${p.contenu.nom} entre dans la Tombe — ${resumePerso(p.contenu)} · PV au complet`);
  };

  /* V0.49 — le combat d'entraînement (Signa-3 vs Ork Boy) est retiré :
     l'écran ne garde que ce qui fonctionne en partie réelle. */

  const familleCouleur = {
    combat: T.accent, libre: "#7dd3fc", protocole: T.or,
    scene: "#a1a1aa", journal: "#fb7185", perso: T.accent
  };
  const journalInverse = [...journal].reverse();

  /* V0.51 — l'icône du joueur SEULE (le halo dit le rôle) ; le clic
     ouvre le cadre COMPTE — CLOUD, exactement comme dans le hub. */
  const haloRole = role === "mj" ? "#f0b24a" : "#2ee6c9";
  const compte = joueur && avatar ? (
    <CompteJoueur joueur={joueur} avatar={avatar} onAvatar={onAvatar} avatarSeul
      ouvert={compteOuvert} onOuvert={() => setCompteOuvert(o => !o)} onLogout={onLogout}
      halo={haloRole} />
  ) : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.fond, fontFamily: "'Rajdhani','Segoe UI',system-ui,sans-serif" }}>
      <div className="max-w-4xl mx-auto px-5 py-6 w-full">
        {/* V0.49/50 — l'entête : titre à gauche au style du hub (pas de
            vignette rôle : le halo de l'avatar définit le statut) */}
        <EntetePartie pack={pack} role={role} joueur={joueur} avatar={avatar} compte={compte} />

        {/* V0.49 — les onglets : le SALON du pack d'abord, puis SCENARIO
            (MJ) ou FICHE PERSONNAGE (joueur). V0.57 : le libellé du
            salon vient du pack (CANTINA, TAVERNE, CAMP…). */}
        <div className="flex gap-1 mb-5" style={{ borderBottom: "1px solid #27272a" }}>
          {(role === "mj"
            ? [["cantina", C.salon || "CANTINA"], ["scenario", "SCENARIO"]]
            : [["cantina", C.salon || "CANTINA"], ["fiche", "FICHE PERSONNAGE"]]
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

        {onglet === "cantina" && (
          <>
            {/* CONSOLE DE PARTIE — le canal de la table, en cadre console */}
            <div className="rounded-xl mb-4 overflow-hidden" style={{ background: "#14161b", border: "1px solid " + T.accent + "33" }}>
              <div className="px-3 py-2 text-xs font-bold tracking-widest" style={{ borderBottom: "1px solid #27272a", color: T.accent }}>
                💬 CONSOLE DE PARTIE
              </div>
              {consolePartie ? (
                <ConsoleGlobale fil={consolePartie.fil} onEnvoyer={consolePartie.onEnvoyer} joueur={consolePartie.joueur || joueur} enEnvoi={consolePartie.enEnvoi} />
              ) : (
                <div className="text-xs py-4 text-center" style={{ color: "#71717a" }}>
                  Console muette hors partie — lancez ou rejoignez une aventure pour parler à la table.
                </div>
              )}
            </div>

            {/* Jet de Dés — la face du dernier jet s'affiche en points */}
            <div className="rounded-xl p-4 mb-4" style={{ background: "#ffffff08", border: "1px solid " + T.accent + "33" }}>
              <div className="font-bold mb-3" style={{ color: T.accent }}>🎲 Jet de Dés</div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm" style={{ color: "#c8c8ce" }}>
                  Cible{" "}
                  <select value={cibleLibre} onChange={e => setCibleLibre(e.target.value)}
                    className="ml-1 rounded px-2 py-1" style={{ background: "#14161b", color: "#e8e4d8", border: "1px solid #3f3f46" }}>
                    {["2+", "3+", "4+", "5+", "6+"].map(c => <option key={c} value={c}>{c} {c === "2+" ? "(trivial)" : c === "6+" ? "(héroïque)" : ""}</option>)}
                  </select>
                </label>
                <div className="flex rounded overflow-hidden" style={{ border: "1px solid #3f3f46" }}>
                  {[["−1", -1], ["±0", 0], ["+1", 1]].map(([lbl, v]) => (
                    <button key={v} onClick={() => setModLibre(v)}
                      className="px-3 py-1 text-sm"
                      style={{ background: modLibre === v ? T.accent : "#14161b", color: modLibre === v ? "#0a120f" : "#c8c8ce" }}>
                      {lbl}
                    </button>
                  ))}
                </div>
                <button onClick={jetLibre} className="px-4 py-1.5 rounded-lg font-bold text-black" style={{ background: T.or }}>
                  Lancer 1D6
                </button>
                {dernierDe && (
                  <div className="flex items-center gap-2">
                    <DeFace v={dernierDe.v} accent={dernierDe.reussi ? T.accent : "#fb7185"} />
                    <span className="text-xs" style={{ color: dernierDe.reussi ? T.accent : "#fb7185" }}>
                      {dernierDe.reussi ? "RÉUSSI" : "ÉCHOUÉ"}{dernierDe.nat ? " · " + dernierDe.nat : ""}
                    </span>
                  </div>
                )}
                <span className="text-xs" style={{ color: "#71717a" }}>1D6 ≥ cible · 6 naturel réussit toujours · 1 naturel échoue</span>
              </div>
            </div>

            {/* Journal append-only — sous les dés, dans le CANTINA */}
            <div className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid " + T.or + "44" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold" style={{ color: T.or }}>📜 Journal du personnage — append-only</div>
                <button onClick={corrigerDernier}
                  className="text-xs px-3 py-1 rounded font-bold"
                  style={{ border: "1px solid #fb718566", color: "#fb7185" }}
                  disabled={journal.length === 0}>
                  ✎ Annuler le dernier (par écrit)
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto flex flex-col gap-1.5 pr-1">
                {journalInverse.length === 0 && (
                  <div className="text-sm py-3 text-center" style={{ color: "#71717a" }}>Le fil est vide — chaque action s'y gravera, sans retour en arrière.</div>
                )}
                {journalInverse.map(e => {
                  const fam = e.type.split(".")[0];
                  return (
                    <div key={e.id} className="flex items-start gap-2 rounded px-2 py-1.5 text-sm"
                      style={{ background: "#ffffff08", opacity: e.annule ? 0.45 : 1 }}>
                      <span className="text-xs px-1.5 py-0.5 rounded font-bold shrink-0"
                        style={{ background: (familleCouleur[fam] || "#71717a") + "26", color: familleCouleur[fam] || "#a1a1aa" }}>
                        {e.type}
                      </span>
                      <span className="text-xs shrink-0 mt-0.5" style={{ color: "#71717a" }}>{e.quand}</span>
                      <span style={{ color: e.annule ? "#71717a" : "#e8e4d8", textDecoration: e.annule ? "line-through" : "none" }}>
                        {e.texte}{e.annule ? " (annulé par écriture compensatoire)" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs mt-3" style={{ color: "#71717a" }}>
                Surcharges du mod appliquées : {C.surcharges.join(" · ")}
              </div>
            </div>
          </>
        )}

        {/* SCENARIO — l'onglet du MJ : coming soon + les fiches de la table */}
        {onglet === "scenario" && (
          <div className="rounded-xl p-6 text-center" style={{ background: "#ffffff08", border: "1px solid " + T.accent + "33" }}>
            <div className="font-bold mb-2" style={{ color: T.or }}>🗺 SCENARIO</div>
            <div className="text-sm" style={{ color: "#71717a" }}>Coming soon — la campagne s'écrira ici.</div>
            {role === "mj" && table && (
              <button onClick={() => setFichesMjOuvert(true)} className="mt-4 px-4 py-2 rounded-lg text-sm font-bold"
                style={{ background: "#0c0d10", border: "1px solid " + T.accent + "66", color: T.accent }}>
                📜 FICHES DE LA TABLE
              </button>
            )}
          </div>
        )}

        {/* FICHE PERSONNAGE — l'onglet du joueur : l'unité réelle, le
            registre à la porte, la création. Sans unité : état vide. */}
        {onglet === "fiche" && (
          enCreationPE ? (
            <EcranCreationUnite contenu={C} accent={T.accent} onValide={validerCreation} onAnnule={() => setEnCreationPE(false)} />
          ) : (
            <div className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid " + T.accent + "33" }}>
              {perso ? (
                <>
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="font-bold text-lg" style={{ color: T.accent }}>{perso.nom}</div>
                    <div className="text-xs" style={{ color: "#71717a" }}>{perso.chassis} · code {perso.code}</div>
                  </div>
                  <PvBarre pv={pvSigna} pvMax={perso.pvMax} accent={T.accent} />
                  <div className="text-right text-xs mt-1" style={{ color: "#a1a1aa" }}>{pvSigna} / {perso.pvMax} PV</div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
                    {[["CC", perso.st.cc], ["CT", perso.st.ct], ["F", perso.st.f], ["E", perso.st.e], ["Sv", perso.st.sv], ["Cd", perso.st.cd]]
                      .concat(perso.st.a ? [["A", perso.st.a]] : [])
                      .map(([k, v]) => (
                      <div key={k} className="rounded py-1.5" style={{ background: "#ffffff0d", color: "#e8e4d8" }}>
                        <span className="text-xs" style={{ color: "#71717a" }}>{k} </span>{v}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 rounded py-1.5 text-center text-sm" style={{ background: T.or + "22", color: T.or }}>
                    Rfx +{perso.rfx} <span className="text-xs">— surcharge du mod PÉ</span>
                  </div>
                  <div className="mt-3 rounded p-2 text-xs" style={{ background: "#ffffff08", color: "#c8c8ce" }}>
                    <b style={{ color: "#e8e4d8" }}>{perso.armeDef.nom}</b> · {perso.armeDef.tir ? "tir" : "mêlée"} · {perso.armeDef.portee} ·
                    A {perso.armeDef.att} · {perso.armeDef.tir ? "CT " + perso.st.ct : "CC " + perso.st.cc} · F {perso.armeDef.f} ·
                    PA {perso.armeDef.pa} · D {perso.armeDef.d}
                    <span style={{ color: "#71717a" }}> · {perso.armeDef.regle}</span>
                  </div>
                  {perso.apt && (
                    <div className="mt-2 rounded p-2 text-xs" style={{ background: "#ffffff08", color: "#c8c8ce" }}>
                      <b style={{ color: "#e8e4d8" }}>Aptitude de châssis — </b>{perso.apt}
                    </div>
                  )}
                  {perso.comps && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {perso.comps.map(c => (
                        <span key={c} className="text-xs px-1.5 py-0.5 rounded" style={{ background: T.accent + "22", color: T.accent }}>{c}</span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="font-bold mb-2" style={{ color: T.or }}>AUCUNE UNITÉ ÉVEILLÉE</div>
                  <div className="text-sm" style={{ color: "#71717a" }}>Créez une unité, ou laissez-en une entrer par le registre ci-dessous.</div>
                </div>
              )}
              {/* V48 — LE REGISTRE À LA PORTE : en partie, sans fiche ni unité
                  locale, le joueur choisit QUI entre dans la Tombe. */}
              {table && !persoCree && (table.persos || []).length > 0 && (
                <div className="mt-3 rounded-lg p-3" style={{ background: "#0c0d10", border: "1px dashed " + T.accent + "66" }}>
                  <div className="text-xs font-bold tracking-widest mb-2" style={{ color: T.accent }}>QUI ENTRE DANS LA TOMBE ?</div>
                  {table.persos.map(p => (
                    <button key={p.id} onClick={() => adopterDuRegistre(p)}
                      className="w-full text-left rounded-lg px-3 py-2 mb-1.5"
                      style={{ background: "#14161b", border: "1px solid " + (persoChoisi === p.id ? T.or : "#3f3f46"), cursor: "pointer" }}>
                      <span className="font-bold text-sm" style={{ color: persoChoisi === p.id ? T.or : "#e8e4d8" }}>{persoChoisi === p.id ? "● " : ""}{p.nom}</span>
                      <span className="text-xs" style={{ color: "#71717a" }}> — {resumePerso(p.contenu)}</span>
                      {persoChoisi === p.id && <span className="text-xs font-bold" style={{ color: T.or }}> · PRIS POUR L'AVENTURE</span>}
                    </button>
                  ))}
                  <div className="text-xs mt-1" style={{ color: "#71717a" }}>
                    Votre unité entre avec ses PV au complet ; ou créez-en une neuve plus bas.
                  </div>
                </div>
              )}
              <button onClick={() => setEnCreationPE(true)} className="w-full py-2 rounded-lg text-sm font-bold mt-3"
                style={{ background: "#0c0d10", border: "1px solid " + T.accent + "66", color: T.accent }}>
                {persoCree ? C.textes.recreer : C.textes.creer}
              </button>
            </div>
          )
        )}
      </div>

      {/* V0.50 — RÈGLE GÉNÉRALE DU SITE : le pied « Powered by Vibe · N° »
          vit sur TOUS les écrans, collé au bas (flex flex-col + mt-auto),
          exactement comme sur le hub et la porte. */}
      <PiedVibe versionBase={versionBase} />

      {/* V43 — L'ÉCRAN MJ : les fiches de toute la table, poussées en direct */}
      {fichesMjOuvert && table && (
        <EcranMjFiches table={table} theme={T} onFermer={() => setFichesMjOuvert(false)} />
      )}
    </div>
  );
}

