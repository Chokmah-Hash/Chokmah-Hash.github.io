/* ══════════ L'écran de partie à onglets (MJ / joueur) ══════════ */
function EcranPartie({ pack, session, mode, partie, partieJoueurs, partiesOuvertes, mesAventures, presents, mdpSalle, mdpsClairs, mesPersonnages, versionBase, filSalon, onEnvoyerSalon, salonEnvoi, onRelireSalon, onCreerPersonnage, onSupprimerPersonnage, persoChoisi, onChoisirPerso, onCreer, onRejoindre, onRejoindreMdp, onOuvrirSalle, onReprendre, onGraverMdp, onLancer, onFermer, onQuitter, onSupprimer, onRetour, onAvatar, onLogout, mobile }) {
  const [nom, setNom] = useState("");
  const [mdpTexte, setMdpTexte] = useState("");           // V48.3 : le mot de passe d'une salle privée (demandé DANS la ligne)
  const [mdpPour, setMdpPour] = useState(null);           // V48.3 : la salle privée dont on tape le mot de passe
  const [enCreer, setEnCreer] = useState(false);
  const [enRejoindre, setEnRejoindre] = useState(false);
  const [enMdp, setEnMdp] = useState(false);              // V47 : l'entrée par mot de passe part-elle ?
  const [onglet, setOnglet] = useState("lobby");
  const [enCreation, setEnCreation] = useState(false);
  const [enOuverture, setEnOuverture] = useState(false);  // V47 : la modale OUVRIR LA SALLE
  const [visChoix, setVisChoix] = useState("publique");  // V47 : publique ou privée
  const [mdpChoix, setMdpChoix] = useState("");          // V47 : le mot de passe choisi
  const [detail, setDetail] = useState(null);
  const [enLivre, setEnLivre] = useState(false);
  const [enSuppression, setEnSuppression] = useState(false); // V46 : la sentence se prépare-t-elle ?
  const [motSuppr, setMotSuppr] = useState("");              // V46 : la consécration écrite « suppression »
  const [mdpSaisi, setMdpSaisi] = useState("");              // V49 : le mot de passe gravé via l'écrou, à côté de REPRENDRE
  const [enGravure, setEnGravure] = useState(false);          // V49 : la Tombe grave — le scellé met un instant
  const [cadenasChoix, setCadenasChoix] = useState(false);    // V0.46 : la case du cadenas — cochée, le champ s'arme
  const [compteOuvert, setCompteOuvert] = useState(false);  // V46b : le menu du compte du bandeau
  const [fermerPour, setFermerPour] = useState(null);        // V0.37 : l'aventure dont le FERMER attend sa confirmation
  /* V0.38 — arriver sur l'onglet LOBBY relit le salon du JDR : ceinture
      et bretelles contre un fil muet (échec réseau passager, contexte
      manqué) — le salon se rafraîchit à chaque venue. */
  useEffect(() => {
    if (onglet === "lobby" && onRelireSalon) onRelireSalon();
  }, [onglet]);
  /* V0.39 — LE SCELLÉ SE SOUVIENT : à l'ouverture de la modale de l'écrou
      (et chaque fois que le scellé re-vit), le champ ré-affiche le mot de
      passe SAUVEGARDÉ avec l'aventure — vide si la porte est libre, sinon
      le mot de passe tel que la Tombe l'a gardé pour le MJ. */
  useEffect(() => {
    setMdpSaisi(detail && mdpsClairs && mdpsClairs[detail.id] ? mdpsClairs[detail.id] : "");
    setCadenasChoix(!!(detail && detail.visibilite === "privee")); /* V0.46 : la case dit l'état RÉEL du cadenas */
  }, [detail, mdpsClairs]);
  /* — V0.67 : LE REGISTRE DES PERSONNAGES a déménagé dans le composant
      commun RegistrePersonnages (l'éveil, l'écrou, la sentence y vivent) ;
      l'écran de partie ne garde que la liste. — */
  const persos = mesPersonnages || [];
  /* V49 — GRAVER LE SCELLE : vide = porte libre (publique), texte = cadenassée
     (privée). La ligne lobby revient de la RPC, le cadre se rafraîchit seul.
     V0.39 : le champ ne s'efface plus après gravure — l'effet de souvenir
     ré-affiche le mot de passe tel qu'il vit maintenant avec l'aventure. */
  const graverMotDePasse = () => {
    if (!detail || !onGraverMdp) return;
    setEnGravure(true);
    /* V0.46 : la case dit l'intention — décochée, on grave la porte
       libre (champ ignoré) ; cochée, on grave le mot de passe saisi. */
    onGraverMdp(detail, cadenasChoix ? mdpSaisi : "")
      .then((l) => { if (l) setDetail(l); })
      .catch(() => {})
      .finally(() => setEnGravure(false));
  };
  const estMj = !!(partie && session && partie.mj_compte_id === session.compteId);
  const nbJoueurs = (p) => (typeof p.nb_joueurs === "number" ? p.nb_joueurs : 0);
  const salleOuverte = (p) => !!p.salle_ouverte_le;
  /* V0.44 — LE HALO DU MODE : le mode ne dit plus son nom en vignette,
     il encercle l'avatar du compte — l'or du MJ, le bleu du joueur. */
  const haloMode = mode === "joueur" ? "#2ee6c9" : mode === "mj" ? "#f0b24a" : null;
  /* V0.67 — LA RÈGLE DES PAGES DE JEU : l'entête porte le TITRE DU JEU
      seul (EntetePartie) — le bandeau « L'ARCHIVISTE » quitte l'écran de
      partie ; l'icône du compte vit dans l'entête, le halo du mode
      murmure le rôle (or = MJ, bleu = joueur). */
  const avatarCompte = session ? (AVATARS.find(a => a.id === session.avatarId) || AVATARS[0]) : null;
  const compteEntete = session && avatarCompte ? (
    <CompteJoueur joueur={session} avatar={avatarCompte} onAvatar={onAvatar} avatarSeul
      ouvert={compteOuvert} onOuvert={() => setCompteOuvert(o => !o)} onLogout={onLogout} halo={haloMode} />
  ) : null;

  /* La salle d'attente : on a rejoint (ou créé) — le code s'affiche
     grand, la liste vit au temps réel, le MJ tranche. */
  if (partie) {
    const joueursAvecMj = [
      { compte_id: partie.mj_compte_id, mj: true, pseudo: partie.mj_pseudo || "?" },
      ...(partieJoueurs || []).map(j => ({ compte_id: j.compte_id, mj: false, pseudo: j.pseudo || "?" }))
    ];
    return (
      <div className="min-h-screen flex flex-col text-zinc-200" style={{ background: "#0c0d10", fontFamily: "'Rajdhani','Segoe UI',system-ui,sans-serif" }}>
        <div className="max-w-2xl w-full mx-auto px-5 pt-8 pb-10 flex-1 flex flex-col">
          <div className="mb-6">
            {/* V0.67 — l'entête de la table : le TITRE DU JEU, pas le bandeau */}
            <EntetePartie pack={pack} role={mode} joueur={session} avatar={avatarCompte} compte={compteEntete} />
          </div>
          <div className="rounded-xl p-6" style={{ background: "#14161b", border: "1px solid #27272a" }}>
            <div className="text-xs tracking-widest mb-1" style={{ color: "#71717a" }}>{pack.nom} — aventure multijoueur</div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-2xl font-bold mb-1" style={{ color: "#e8e4d8" }}>{partie.nom}</div>
              {/* V48.3 : le retour au hub vit ici, discret, à droite du titre */}
              <button onClick={onRetour} className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: "#a8adb814", color: "#a8adb8", border: "1px solid #27272a", cursor: "pointer" }}>
                ⌂ HUB
              </button>
            </div>
            <div className="text-xs mb-5" style={{ color: "#52525b" }}>
              ouverte par {estMj ? "vous" : "le MJ"} · {partie.statut === "ouverte" ? "salle d'attente" : partie.statut === "en_cours" ? "en cours" : "close"}{partie.visibilite === "publique" ? " · publique" : " · privée"}
            </div>
            {partie.statut === "ouverte" && (
              <>
                <div className="rounded-lg p-4 mb-5 text-center" style={{ background: "#0c0d10", border: "1px dashed #3f3f46" }}>
                  {partie.visibilite === "publique" ? (
                    <>
                      <div className="text-xs mb-1" style={{ color: "#71717a" }}>SALLE PUBLIQUE — elle vit dans « AVENTURES OUVERTES » du lobby de tous</div>
                      <div className="text-2xl font-bold tracking-widest" style={{ color: "#a8adb8" }}>ouverte à tous</div>
                    </>
                  ) : (
                    <>
                      <div className="text-xs mb-1" style={{ color: "#71717a" }}>SALLE PRIVÉE — vos joueurs entrent avec le mot de passe</div>
                      <div className="text-2xl font-bold tracking-widest" style={{ color: "#a8adb8", fontFamily: "ui-monospace,monospace" }}>
                        {estMj ? (mdpSalle || "votre mot de passe") : "• • • • •"}
                      </div>
                      {!estMj && <div className="text-xs mt-1" style={{ color: "#52525b" }}>vous y êtes — le MJ lance l'aventure quand la table est pleine</div>}
                    </>
                  )}
                </div>
                <div className="mb-2 text-xs font-bold tracking-widest" style={{ color: "#a8adb8" }}>
                  À LA TABLE ({joueursAvecMj.length})
                </div>
                <div className="mb-6 flex flex-col">
                  {joueursAvecMj.map(j => (
                    <div key={j.compte_id} className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid #ffffff08" }}>
                      <span className="text-xs">{j.mj ? "👑" : "⟁"}</span>
                      <span className="text-sm font-bold" style={{ color: j.mj ? "#f0b24a" : "#c8c8ce" }}>{j.pseudo}</span>
                      <span className="text-xs" style={{ color: "#52525b" }}>{j.mj ? "MJ" : "joueur"}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {estMj ? (
                    <button onClick={() => onLancer(partie)} disabled={enCreer}
                      className="px-5 py-2 rounded-lg font-bold text-sm text-black"
                      style={{ background: "#f0b24a", cursor: "pointer" }}>
                      ▶ LANCER L'AVENTURE
                    </button>
                  ) : (
                    <div className="text-xs italic" style={{ color: "#71717a" }}>
                      En attente que le MJ lance l'aventure…
                    </div>
                  )}
                  <button onClick={() => onQuitter(partie)}
                    className="px-4 py-2 rounded-lg font-bold text-sm"
                    style={{ background: "#a8adb814", color: estMj ? "#e0524d" : "#a8adb8", border: "1px solid #27272a", cursor: "pointer" }}>
                    {estMj ? "REFERMER LA SALLE" : "QUITTER"}
                  </button>
                </div>
              </>
            )}
            {partie.statut === "en_cours" && (
              <div className="text-sm" style={{ color: "#71717a" }}>
                L'aventure est lancée — l'entrée se fait d'elle-même…
                {(partie.mj_compte_id !== (session && session.compteId) && !(partieJoueurs || []).some(j => j.compte_id === (session && session.compteId)))
                  ? " (vous n'êtes pas à cette table.)" : ""}
              </div>
            )}
          </div>
        </div>
        {/* V0.31 : le pied vit à la RACINE de l'écran, après le conteneur —
            collé au bas exactement comme sur le hub et la porte. */}
        <PiedVibe versionBase={versionBase} />
      </div>
    );
  }

  /* V46 — l'écran de partie à onglets. Le mode choisi au LANCER ordonne
     l'écran : le MJ gère le registre de ses aventures, le joueur garde
     ses personnages et lit les règles. Le lobby reste la porte commune.
     Le rôle réel en table reste dérivé : le créateur d'une aventure en
     est le Maître du Jeu, quel que soit le mode affiché. */
  const modeU = mode === "joueur" ? "joueur" : mode === "mj" ? "mj" : null;
  /* V0.37 — LES ONGLETS REFICTLÉS : le joueur gagne AVENTURES (les
     salles ouvertes de son JDR, prêtes à rejoindre) entre LOBBY et
     PERSONNAGES ; le MJ gagne RÈGLES juste à droite d'AVENTURES —
     solo comme multi, le MJ lit les règles aussi. */
  const onglets = modeU === "joueur"
    ? [["lobby", "LOBBY"], ["aventures", "AVENTURES"], ["personnages", "PERSONNAGES"], ["regles", "RÈGLES"]]
    : modeU === "mj"
      ? [["lobby", "LOBBY"], ["aventures", "AVENTURES"], ["regles", "RÈGLES"]]
      : [["lobby", "LOBBY"], ["aventures", "AVENTURES"], ["regles", "RÈGLES"], ["personnages", "PERSONNAGES"]];
  const mesAv = mesAventures || [];
  /* V48.5 — LE CONNECTÉS DU JDR : dans le lobby d'un JDR, la ronde ne
     montre que les joueurs qui ont lancé CE JDR (son écran de partie ou
     la table de jeu). Le hub n'y a plus sa place, ni les autres JDR. */
  const duPack = (presents || []).filter(j => j && j.jeu === pack.id);

  /* L'onglet RÈGLES ouvre le manuel en plein écran — le lecteur a son
     propre entête, on lui rend la main quand il se referme. */
  if (onglet === "regles" && enLivre) {
    return <LecteurDocuments pack={pack} onFermer={() => setEnLivre(false)} />;
  }

  return (
    <div className={onglet === "lobby" ? "flex flex-col text-zinc-200" : "min-h-screen flex flex-col text-zinc-200"} style={onglet === "lobby"
      ? { background: "#0c0d10", fontFamily: "'Rajdhani','Segoe UI',system-ui,sans-serif", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }
      : { background: "#0c0d10", fontFamily: "'Rajdhani','Segoe UI',system-ui,sans-serif" }}>
      <div className={onglet === "lobby" ? "max-w-2xl w-full mx-auto px-5 pt-8 flex-1 flex flex-col gap-5" : "max-w-2xl w-full mx-auto px-5 pt-8 pb-10 flex-1 flex flex-col gap-5"}
        style={onglet === "lobby" ? { flex: "1 1 0%", minHeight: 0, paddingBottom: 20 } : undefined}>
        {/* V46b : le bandeau de L'Archiviste — le titre et le compte
            retrouvent leur place dans l'espace MJ/Joueur, comme au hub. */}
        {/* V0.67 — LA RÈGLE DES PAGES DE JEU : l'entête porte le TITRE DU
            JEU seul, le compte à droite (halo du mode : or = MJ, bleu =
            joueur), et le retour HUB posé par l'entête (prop onRetour). */}
        <EntetePartie pack={pack} role={mode} joueur={session} avatar={avatarCompte} compte={compteEntete} onRetour={onRetour} />

        {/* Barre d'onglets — le mode commande les onglets visibles */}
        <div className="flex gap-5" style={{ borderBottom: "1px solid #27272a" }}>
          {onglets.map(o => (
            <button key={o[0]} onClick={() => { setOnglet(o[0]); setDetail(null); }}
              className="pb-2 text-xs font-bold tracking-widest"
              style={{
                color: onglet === o[0] ? "#f0b24a" : "#71717a",
                borderBottom: "2px solid " + (onglet === o[0] ? "#f0b24a" : "transparent"),
                marginBottom: "-1px", background: "none", borderTop: "none", borderLeft: "none", borderRight: "none",
                cursor: "pointer"
              }}>
              {o[1]}
            </button>
          ))}
        </div>

        {/* LOBBY — V0.41 LE SALON ENCRÉ : le salon s'ancre en bas de
            page (sa scroll bar vit dans son propre cadre) et les
            CONNECTÉS déménagent derrière le petit bouton de la
            ligne du titre — voir ChatSalon. (V48.5 : la ronde ne
            montre que les joueurs qui ont lancé CE JDR — lobby de ce
            pack ou table de jeu, rien d'autre.) */}
        {onglet === "lobby" && (
          <ChatSalon titre={"SALON — " + pack.nom} fil={filSalon} onEnvoyer={onEnvoyerSalon} joueur={session} enEnvoi={salonEnvoi} presents={duPack} remplir={true} />
        )}

        {/* AVENTURES (JOUEUR) — V0.37 : les salles ouvertes de CE JDR,
            prêtes à rejoindre — l'ancien cadre du lobby, rendu dans son
            onglet dédié entre LOBBY et PERSONNAGES. */}
        {onglet === "aventures" && modeU === "joueur" && (
          <div className="rounded-xl p-5" style={{ background: "#14161b", border: "1px solid #27272a" }}>
            {/* V0.40 — LA PORTE DU JOUEUR : le cadre s'appelle AVENTURES
                EN LIGNE ; la carte dit juste QUI tient la table (le MJ,
                en clair lisible) ; UN SEUL bouton ENTRER — VERT sans
                cadenas quand la porte est libre (on rejoint aussitôt),
                GRIS avec 🔒 quand elle est scellée. */}
            <div className="text-xs font-bold tracking-widest mb-3" style={{ color: "#a8adb8" }}>AVENTURES EN LIGNE ({partiesOuvertes.length})</div>
              {partiesOuvertes.length === 0 ? (
                <div className="text-xs py-2" style={{ color: "#52525b" }}>Aucune aventure ouverte pour l'instant.</div>
              ) : (
                <div className="flex flex-col">
                  {partiesOuvertes.map(p => {
                    const laMienne = session && p.mj_compte_id === session.compteId;
                    return (
                      <div key={p.id} style={{ borderBottom: "1px solid #ffffff08" }}>
                        <div className="flex items-center gap-3 py-2.5">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold truncate" style={{ color: "#e8e4d8" }}>{p.nom}</div>
                            <div className="text-xs font-semibold" style={{ color: "#a8adb8" }}>
                              {laMienne ? "VOTRE aventure — vous en êtes le MJ" : "MJ " + (p.mj_pseudo || "?")}
                            </div>
                          </div>
                          {laMienne ? (
                            <button onClick={() => onReprendre(p)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold"
                              style={{ background: "#f0b24a22", color: "#f0b24a", border: "1px solid #f0b24a44", cursor: "pointer" }}>
                              OUVRIR
                            </button>
                          ) : p.visibilite === "privee" ? (
                            <button onClick={() => { setMdpTexte(""); setMdpPour(mdpPour === p.id ? null : p.id); }}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold"
                              style={{ background: "#a8adb814", color: "#a8adb8", border: "1px solid #27272a", cursor: "pointer" }}
                              title="Salle privée — le mot de passe se demande">
                              {mdpPour === p.id ? "▲ ANNULER" : "🔒 ENTRER"}
                            </button>
                          ) : (
                            <button onClick={() => { setEnRejoindre(true); onRejoindre(p).finally(() => setEnRejoindre(false)); }}
                              disabled={enRejoindre}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-black"
                              style={{ background: "#4ade80", cursor: "pointer" }}
                              title="Rejoindre l'aventure — la porte est libre">
                              ENTRER
                            </button>
                          )}
                        </div>
                        {/* La salle privée : le mot de passe se demande ici, dans la ligne — plus de cadre dédié */}
                        {mdpPour === p.id && !laMienne && (
                          <div className="flex gap-2 pb-2.5">
                            <input value={mdpTexte} onChange={(e) => setMdpTexte(e.target.value)} maxLength={24} type="password" autoComplete="off"
                              placeholder="MOT DE PASSE DE LA SALLE"
                              className="flex-1 px-3 py-1.5 rounded-lg text-sm"
                              style={{ background: "#0c0d10", border: "1px solid #3f3f46", color: "#e8e4d8", outline: "none", fontFamily: "ui-monospace,monospace" }} />
                            <button onClick={() => { setEnMdp(true); onRejoindreMdp(mdpTexte).finally(() => { setEnMdp(false); setMdpPour(null); }); }}
                              disabled={enMdp || mdpTexte.trim().length < 3}
                              className="px-4 py-1.5 rounded-lg font-bold text-sm text-black"
                              style={{ background: mdpTexte.trim().length >= 3 ? "#f0b24a" : "#27272a", cursor: mdpTexte.trim().length >= 3 ? "pointer" : "default" }}>
                              ENTRER
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {/* AVENTURES (MJ) — le registre des aventures, style registre de comptes */}
        {onglet === "aventures" && modeU !== "joueur" && (
          <div className="rounded-xl p-5" style={{ background: "#14161b", border: "1px solid #27272a" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold tracking-widest" style={{ color: "#a8adb8" }}>MES AVENTURES ({mesAv.length})</div>
              <button onClick={() => { setNom(""); setEnCreation(true); }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-black"
                style={{ background: "#f0b24a", cursor: "pointer" }}>+ CRÉER</button>
            </div>
            {mesAv.length === 0 ? (
              <div className="text-xs py-2" style={{ color: "#52525b" }}>Aucune aventure — créez la première avec « + CRÉER ».</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs" style={{ color: "#71717a" }}>
                    <th className="text-left px-1 py-2">AVENTURE</th>
                    <th className="text-right px-1 py-2">JOUEURS</th>
                    {/* V0.39 — plus de colonne STATUT (le nom teal d'une
                        aventure en ligne suffit) ; la colonne pilotage
                        s'élargit : les icônes respirent à droite. */}
                    <th className="text-right py-2 pl-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {mesAv.map(p => (
                    <tr key={p.id} style={{ borderTop: "1px solid #ffffff08" }}>
                      <td className="px-1 py-2.5">
                        {/* V0.37 — LE NOM EST UNE PORTE : une aventure EN LIGNE
                            se REPREND par son nom — revenir sans rien casser.
                            V0.40 : le vert suffit, le soulignement s'en va. */}
                        {p.statut === "en_cours" && p.salle_ouverte_le ? (
                          <button onClick={() => onReprendre(p)}
                            className="text-sm font-bold text-left"
                            style={{ color: "#2ee6c9", cursor: "pointer", background: "none", border: "none", padding: 0 }}
                            title="Revenir à cette table — l'aventure est en ligne">
                            {p.nom}
                          </button>
                        ) : (
                          <div className="text-sm font-bold truncate" style={{ color: "#e8e4d8" }}>{p.nom}</div>
                        )}
                      </td>
                      <td className="px-1 py-2.5 text-right text-xs" style={{ color: "#a8adb8" }}>{nbJoueurs(p)}</td>
                      {/* V0.39 — LE PILOTAGE EN DEUX ICÔNES : plus de texte —
                          ▶ VERT lance toute aventure non lancée (jamais
                          lancée comme séance close à revivre, porte publique
                          sauf scellé privé déjà gravé) ; ■ ROUGE s'arme au
                          premier clic puis referme l'aventure ; l'écrou
                          reste à droite, sur la même ligne, dans une
                          colonne qui respire. V0.40 : les icônes s'élargissent
                          (environ deux fois l'écrou — la main s'y pose mieux). */}
                      <td className="py-2.5 pl-6 text-right whitespace-nowrap">
                        {p.statut !== "en_cours" ? (
                          <button onClick={() => onLancer(p)}
                            className="px-5 py-1 rounded-lg text-sm font-bold text-black"
                            style={{ background: "#4ade80", cursor: "pointer" }}
                            title={p.statut === "close" ? "Relancer la séance — la porte s'ouvre aux joueurs" : "Lancer l'aventure — la porte s'ouvre aux joueurs"}>
                            ▶
                          </button>
                        ) : (
                          fermerPour === p.id ? (
                            <button onClick={() => { setFermerPour(null); onFermer(p); }}
                              className="px-5 py-1 rounded-lg text-sm font-bold text-black"
                              style={{ background: "#e0524d", cursor: "pointer" }}
                              title="Confirmer : les joueurs connectés sortent et ne peuvent plus rejoindre">
                              ✕
                            </button>
                          ) : (
                            <button onClick={() => { setFermerPour(p.id); setDetail(null); }}
                              className="px-5 py-1 rounded-lg text-sm font-bold"
                              style={{ background: "#e0524d14", color: "#e0524d", border: "1px solid #e0524d44", cursor: "pointer" }}
                              title="Fermer l'aventure — les joueurs connectés seront éconduits">
                              ■
                            </button>
                          )
                        )}
                        {" "}
                        <button onClick={() => { setFermerPour(null); setDetail(detail && detail.id === p.id ? null : p); }}
                          className="px-2 py-1 rounded-lg text-sm font-bold"
                          style={{ background: "#a8adb814", color: "#a8adb8", border: "1px solid #27272a", cursor: "pointer" }}
                          title="Mot de passe de l'aventure et sentence (suppression)">
                          ⚙
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* V0.38 — L'ÉCROU DEVIENT MODALE FLOTTANTE : le scellé et la
                sentence se règlent dans une carte AU-DESSUS de l'écran ; le
                fond sombre clôt, la ✕ aussi. Le SCELLÉ (mot de passe) est
                proposé dans TOUTES les situations — cadenasser une close
                avant de la relancer, ouvrir une privée, tout est là. */}
            {detail && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#000000b3" }}
                onClick={() => { setDetail(null); setEnSuppression(false); setMotSuppr(""); setMdpSaisi(""); }}>
                <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "#14161b", border: "1px solid #f0b24a44" }}
                  onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-bold" style={{ color: "#e8e4d8" }}>{detail.nom}</div>
                    <button onClick={() => { setDetail(null); setEnSuppression(false); setMotSuppr(""); setMdpSaisi(""); }}
                      className="px-2 py-1 rounded-lg text-xs font-bold"
                      style={{ background: "#a8adb814", color: "#a8adb8", border: "1px solid #27272a", cursor: "pointer" }}>✕</button>
                  </div>
                  {/* V0.39 — fini la ligne de radotage (MJ/statut/salle) :
                      la modale va droit au but. */}
                  {/* REPRENDRE / OUVRIR LA SALLE — selon la vie de l'aventure */}
                  {(detail.statut === "en_cours" || salleOuverte(detail)) && (
                    <div className="mb-4">
                      <button onClick={() => onReprendre(detail)}
                        className="px-4 py-2 rounded-lg font-bold text-sm text-black"
                        style={{ background: detail.statut === "en_cours" ? "#f0b24a" : "#a8adb8", cursor: "pointer" }}>
                        {detail.statut === "en_cours" ? "▶ REPRENDRE" : "▶ REPRENDRE LA SALLE"}
                      </button>
                    </div>
                  )}
                  {!salleOuverte(detail) && detail.statut === "ouverte" && (
                    <div className="mb-4">
                      <button onClick={() => { setVisChoix("publique"); setMdpChoix(""); setEnOuverture(true); }}
                        className="px-4 py-2 rounded-lg font-bold text-sm"
                        style={{ background: "#a8adb814", color: "#a8adb8", border: "1px solid #27272a", cursor: "pointer" }}>
                        OUVRIR LA SALLE
                      </button>
                    </div>
                  )}
                  {/* LE SCELLÉ — TOUJOURS, ET IL SE SOUVIENT (V0.39) : le mot
                      de passe vit EN CLAIR avec l'aventure (table dédiée,
                      MJ seul lecteur) et le champ le ré-affiche pré-rempli —
                      vide si la porte est libre, sinon le mot de passe
                      sauvegardé. Champ vide = porte libre, texte = mot de
                      passe (hash côté Tombe pour les joueurs, clair pour le
                      MJ). [▶] de la ligne respecte le cadenas. V49. */}
                  <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#71717a" }}>Mot de passe de l'Aventure</div>
                  {/* V0.46 — LE CADENAS EXPLICITE : la case dit l'intention.
                      Cochée, le champ s'arme (3 caractères minimum) ; décochée,
                      il se grise et le bouton dit la vérité : porte libre. */}
                  <label className="flex items-center gap-2 mb-2 text-sm font-bold" style={{ color: cadenasChoix ? "#f0b24a" : "#a8adb8", cursor: "pointer" }}>
                    <input type="checkbox" checked={cadenasChoix} onChange={(e) => setCadenasChoix(e.target.checked)} disabled={enGravure}
                      style={{ accentColor: "#f0b24a", width: 16, height: 16, cursor: "pointer" }} />
                    Cadenasser — le mot de passe sera demandé aux joueurs
                  </label>
                  <div className="flex gap-2 items-center flex-wrap mb-1">
                    <input value={mdpSaisi} onChange={(e) => setMdpSaisi(e.target.value)}
                      type="password" maxLength={24} autoComplete="off" disabled={enGravure || !cadenasChoix}
                      placeholder={cadenasChoix ? "Mot de passe (3 caractères minimum)" : "Porte libre — cochez pour cadenasser"}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); graverMotDePasse(); } }}
                      className="px-3 py-2 rounded-lg text-sm flex-1"
                      style={{ minWidth: 180, background: "#0c0d10", border: "1px solid #3f3f46", color: "#e8e4d8", outline: "none", opacity: cadenasChoix ? 1 : 0.45 }} />
                    <button onClick={graverMotDePasse}
                      disabled={enGravure || (cadenasChoix && mdpSaisi.trim().length < 3) || (!cadenasChoix && detail.visibilite !== "privee")}
                      title={cadenasChoix ? "Graver ce mot de passe — il sera demandé aux joueurs" : "Déverrouiller : l'aventure s'ouvre à tous, sans mot de passe"}
                      className="px-3 py-2 rounded-lg text-xs font-bold"
                      style={{ background: cadenasChoix ? "#f0b24a" : "#2ee6c9", color: "#0c0d10", border: "1px solid #27272a", cursor: "pointer" }}>
                      {enGravure ? "…" : cadenasChoix ? "✓ GRAVER" : "OUVRIR À TOUS"}
                    </button>
                  </div>
                  {/* ── V46 : la sentence — effacer l'aventure (soft-delete, la
                     Tombe garde tout ; elle disparaît des écrans, part en
                     Corbeille, et seule l'institution peut la rendre ou la
                     purger définitivement) ── */}
                  <div className="pt-3" style={{ borderTop: "1px solid #27272a" }}>
                  {!enSuppression ? (
                    <button onClick={() => { setEnSuppression(true); setMotSuppr(""); }}
                      className="w-full px-4 py-2 rounded-lg text-xs font-bold"
                      style={{ background: "#fb718510", color: "#fb7185", border: "1px solid #fb718544", cursor: "pointer" }}>
                      ✕ SUPPRIMER CETTE AVENTURE
                    </button>
                  ) : (
                    <div>
                      <div className="text-xs mb-2 leading-relaxed" style={{ color: "#fb7185" }}>
                        « {detail.nom} » disparaîtra des écrans — MJ et joueurs ne la verront plus.
                        La Tombe la garde en Corbeille ; seule l'institution peut la rendre.
                        Écrivez « suppression » pour sceller la sentence.
                      </div>
                      <input value={motSuppr} onChange={(e) => setMotSuppr(e.target.value)}
                        placeholder="suppression" type="text" autoComplete="off" maxLength={12}
                        className="w-full px-3 py-2 rounded-lg text-sm mb-2"
                        style={{ background: "#0c0d10", border: "1px solid #3f3f46", color: "#e8e4d8", outline: "none" }} />
                      <div className="flex gap-2">
                        <button onClick={() => { setEnSuppression(false); setMotSuppr(""); setDetail(null); onSupprimer(detail); }}
                          disabled={motSuppr !== "suppression"}
                          className="flex-1 px-4 py-2 rounded-lg font-bold text-sm"
                          style={{ background: "#fb7185", color: "#0c0d10", opacity: motSuppr !== "suppression" ? 0.4 : 1, cursor: motSuppr === "suppression" ? "pointer" : "default" }}>
                          ✕ EFFACER
                        </button>
                        <button onClick={() => { setEnSuppression(false); setMotSuppr(""); }}
                          className="px-4 py-2 rounded-lg text-xs font-bold"
                          style={{ background: "#a8adb814", color: "#a8adb8", border: "1px solid #27272a", cursor: "pointer" }}>
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PERSONNAGES (joueur) — V48 : LE REGISTRE. Les unités du compte,
           rattachées au pack, prêtes à entrer dans n'importe quelle
           aventure — tableau + écrou, comme le registre des aventures. */}
        {onglet === "personnages" && (
          <RegistrePersonnages pack={pack} persos={persos} onCreer={onCreerPersonnage} onSupprimer={onSupprimerPersonnage} persoChoisi={persoChoisi} onChoisir={onChoisirPerso} />
        )}
        )}

        {/* RÈGLES (joueur) — le manuel du pack en plein écran */}
        {onglet === "regles" && (
          <div className="rounded-xl p-5" style={{ background: "#14161b", border: "1px solid #27272a" }}>
            <div className="text-xs font-bold tracking-widest mb-3" style={{ color: "#a8adb8" }}>LES RÈGLES — {pack.nom.toUpperCase()}</div>
            <div className="text-sm mb-4" style={{ color: "#a1a1aa" }}>Le manuel du pack : création de personnage, combat, codes et tables.</div>
            <button onClick={() => setEnLivre(true)}
              className="px-4 py-2 rounded-lg font-bold text-sm text-black"
              style={{ background: "#a8adb8", cursor: "pointer" }}>📖 OUVRIR LE MANUEL</button>
          </div>
        )}

        {/* V47 : l'ouverture de la salle — publique ou privée (mot de passe) */}
        {enOuverture && detail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#000000b3" }}>
            <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "#14161b", border: "1px solid #f0b24a44" }}>
              <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#71717a" }}>OUVRIR LA SALLE — {detail.nom}</div>
              <div className="text-sm mb-4" style={{ color: "#a1a1aa" }}>
                Une salle publique vit dans le lobby de tous ; une salle privée s'ouvre par le mot de passe que vous confierez à vos joueurs.
              </div>
              {/* V0.46 — LE CADENAS EXPLICITE : la case dit l'intention ;
                  le bouton se tait seulement quand la raison s'affiche. */}
              <div className="text-sm font-bold mb-2" style={{ color: visChoix === "privee" ? "#f0b24a" : "#2ee6c9" }}>
                {visChoix === "privee" ? "🔒 Salle privée — vos joueurs entrent avec le mot de passe" : "🚪 Salle publique — elle vit dans « AVENTURES OUVERTES » du lobby de tous"}
              </div>
              <label className="flex items-center gap-2 mb-3 text-sm font-bold" style={{ color: "#f0b24a", cursor: "pointer" }}>
                <input type="checkbox" checked={visChoix === "privee"} onChange={(e) => setVisChoix(e.target.checked ? "privee" : "publique")}
                  style={{ accentColor: "#f0b24a", width: 16, height: 16, cursor: "pointer" }} />
                Cadenasser la salle (mot de passe)
              </label>
              {visChoix === "privee" && (
                <div>
                  <input value={mdpChoix} onChange={(e) => setMdpChoix(e.target.value)} maxLength={24} type="text" autoComplete="off"
                    placeholder="Mot de passe (3 caractères minimum)"
                    className="w-full px-3 py-2 rounded-lg text-sm mb-2"
                    style={{ background: "#0c0d10", border: "1px solid #3f3f46", color: "#e8e4d8", outline: "none" }} />
                  {mdpChoix.trim().length < 3 && (
                    <div className="text-xs mb-2" style={{ color: "#fb7185" }}>Un mot de passe d'au moins 3 caractères est requis pour une salle privée.</div>
                  )}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEnOuverture(false)}
                  className="px-4 py-2 rounded-lg font-bold text-sm"
                  style={{ background: "#a8adb814", color: "#a8adb8", border: "1px solid #27272a", cursor: "pointer" }}>ANNULER</button>
                <button onClick={() => { setEnCreer(true); onOuvrirSalle(detail, visChoix, mdpChoix).finally(() => { setEnCreer(false); setEnOuverture(false); }); }}
                  disabled={enCreer || (visChoix === "privee" && mdpChoix.trim().length < 3)}
                  className="px-4 py-2 rounded-lg font-bold text-sm"
                  style={{ background: "#f0b24a", color: "#0c0d10", opacity: visChoix === "publique" || mdpChoix.trim().length >= 3 ? 1 : 0.4, cursor: visChoix === "publique" || mdpChoix.trim().length >= 3 ? "pointer" : "default" }}>OUVRIR</button>
              </div>
            </div>
          </div>
        )}

        {/* Création d'une aventure (registre MJ) */}
        {enCreation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#000000b3" }}>
            <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "#14161b", border: "1px solid #f0b24a44" }}>
              <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#71717a" }}>NOUVELLE AVENTURE</div>
              <div className="text-sm mb-4" style={{ color: "#a1a1aa" }}>Donnez un nom à l'aventure — vous en serez le Maître du Jeu.</div>
              <input value={nom} onChange={(e) => setNom(e.target.value)} maxLength={60}
                placeholder="Nom de l'aventure (ex : L'Éveil sans Mémoire)"
                className="w-full px-3 py-2 rounded-lg text-sm mb-4"
                style={{ background: "#0c0d10", border: "1px solid #3f3f46", color: "#e8e4d8", outline: "none" }} />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEnCreation(false)}
                  className="px-4 py-2 rounded-lg font-bold text-sm"
                  style={{ background: "#a8adb814", color: "#a8adb8", border: "1px solid #27272a", cursor: "pointer" }}>ANNULER</button>
                <button onClick={() => { setEnCreer(true); onCreer(nom).finally(() => { setEnCreer(false); setEnCreation(false); }); }}
                  disabled={enCreer || !nom.trim()}
                  className="px-4 py-2 rounded-lg font-bold text-sm"
                  style={{ background: "#f0b24a", color: "#0c0d10", opacity: nom.trim() ? 1 : 0.4, cursor: nom.trim() ? "pointer" : "default" }}>CRÉER</button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* V0.31 : le pied vit à la RACINE de l'écran, après le conteneur —
          collé au bas exactement comme sur le hub et la porte. */}
      <PiedVibe versionBase={versionBase} />
    </div>
  );
}

