/* ══════════ V0.67 — LE REGISTRE DES PERSONNAGES, COMPOSANT COMMUN ══════════
   La structure commune des pages de jeu donne au JOUEUR l'onglet
   PERSONNAGES ; son cadre est le REGISTRE du compte pour CE jeu — éveil
   par l'écran de création DU PACK (unite, aventurier, porteur…),
   consultation par l'écrou, sentence douce consacrée par écrit. Le même
   composant vit dans l'écran de partie (Protocole Ω) et dans le noyau
   d100 (Stormbringer, Bloodlust) : la Tombe garde chaque personnage
   rattaché au compte ET AU PACK, prêt à entrer dans n'importe quelle
   aventure du jeu. */
function RegistrePersonnages({ pack, persos, onCreer, onSupprimer, onOuvrir, livre, persoChoisi, onChoisir }) {
  const [enCreationPerso, setEnCreationPerso] = useState(false);
  const [detailPerso, setDetailPerso] = useState(null);
  const [enSuppressionPerso, setEnSuppressionPerso] = useState(false);
  const [motSupprPerso, setMotSupprPerso] = useState("");
  const EcranCreationPerso = { unite: EcranCreationUnite, aventurier: EcranCreationAventurier, porteur: EcranCreationPorteur }[(pack.contenu || {}).creation];
  const cDetail = detailPerso && detailPerso.contenu ? detailPerso.contenu : null;
  const stDetail = cDetail && cDetail.st ? cDetail.st : null;
  return (
          <div className="rounded-xl p-5" style={{ background: "#14161b", border: "1px solid #27272a" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold tracking-widest" style={{ color: "#a8adb8" }}>MES PERSONNAGES — {pack.nom.toUpperCase()} ({persos.length})</div>
              <button onClick={() => { setEnCreationPerso(true); setDetailPerso(null); }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-black"
                style={{ background: "#f0b24a", cursor: "pointer" }}>+ CRÉER</button>
            </div>

            {/* L'éveil depuis le registre : l'écran de création DU PACK, la
                Tombe en garde l'issue au lieu de la lancer en scène. */}
            {enCreationPerso && EcranCreationPerso ? (
              <div className="mb-4">
                <EcranCreationPerso contenu={pack.contenu} accent="#f0b24a" livre={livre}
                  onValide={(p) => { setEnCreationPerso(false); onCreer && onCreer(p); }}
                  onAnnule={() => setEnCreationPerso(false)} />
              </div>
            ) : detailPerso ? (
              /* L'écrou : la fiche complète + la sentence */
              <div className="rounded-lg p-4" style={{ background: "#0c0d10", border: "1px solid #3f3f46" }}>
                <div className="flex items-baseline justify-between mb-1">
                  <div className="text-sm font-bold" style={{ color: "#e8e4d8" }}>{detailPerso.nom}</div>
                  <button onClick={() => { setDetailPerso(null); setEnSuppressionPerso(false); setMotSupprPerso(""); }}
                    className="text-xs font-bold" style={{ color: "#71717a", cursor: "pointer" }}>← retour au registre</button>
                </div>
                <div className="text-xs mb-3" style={{ color: "#52525b" }}>
                  créé le {new Date(detailPerso.cree_le).toLocaleDateString("fr-FR")} · {resumePerso(cDetail)}
                </div>

                {/* V0.74 — OUVRIR LA GRANDE FICHE : le perso de la Tombe
                    monte en grande fiche complète — et ses gestes
                    d'équipement (équiper, déséquiper) se gravent dans
                    la Tombe. Le noyau d100 le propose ; l'écrou reste
                    la porte du registre pour tous. */}
                {onOuvrir && (
                  <button onClick={() => onOuvrir(detailPerso)}
                    className="w-full px-4 py-2 rounded-lg text-xs font-bold mb-3"
                    style={{ background: "#f0b24a", color: "#0c0d10", cursor: "pointer" }}>
                    OUVRIR LA GRANDE FICHE
                  </button>
                )}

                {/* La fiche, par forme : l'unité 40k (grille + arme + aptitude)… */}
                {stDetail ? (<>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm mb-2">
                    {[["CC", stDetail.cc], ["CT", stDetail.ct], ["F", stDetail.f], ["E", stDetail.e], ["Sv", stDetail.sv], ["Cd", stDetail.cd]]
                      .concat(stDetail.a ? [["A", stDetail.a]] : [])
                      .map(([k, v]) => (
                        <div key={k} className="rounded py-1.5" style={{ background: "#ffffff0d", color: "#e8e4d8" }}>
                          <span className="text-xs" style={{ color: "#71717a" }}>{k} </span>{v}
                        </div>
                      ))}
                  </div>
                  <div className="text-xs mb-2" style={{ color: "#a1a1aa" }}>
                    PV {cDetail.pvMax} · Rfx +{cDetail.rfx} · {cDetail.armeDef ? cDetail.armeDef.nom : "arme inconnue"}
                  </div>
                  {cDetail.apt && (
                    <div className="text-xs mb-2 rounded p-2" style={{ background: "#ffffff08", color: "#c8c8ce" }}>
                      <b style={{ color: "#e8e4d8" }}>Aptitude de châssis — </b>{cDetail.apt}
                    </div>
                  )}
                  {cDetail.comps && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {cDetail.comps.map(c => (
                        <span key={c} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#f0b24a22", color: "#f0b24a" }}>{c}</span>
                      ))}
                    </div>
                  )}
                </>) : cDetail && cDetail.caracs ? (<>
                  {/* …ou l'aventurier d100 (caracs + SAN) */}
                  <div className="grid grid-cols-3 gap-2 text-center text-sm mb-2">
                    {Object.entries(cDetail.caracs).map(([k, v]) => (
                      <div key={k} className="rounded py-1.5" style={{ background: "#ffffff0d", color: "#e8e4d8" }}>
                        <span className="text-xs" style={{ color: "#71717a" }}>{k} </span>{v}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs mb-2" style={{ color: "#a1a1aa" }}>SAN {cDetail.sanMax || (cDetail.caracs.POU || 0) * 5}</div>
                </>) : (
                  <div className="text-xs mb-2" style={{ color: "#71717a" }}>Fiche de forme inconnue — la Tombe la garde telle quelle.</div>
                )}

                {/* La sentence : douce, consacrée par écrit */}
                {!enSuppressionPerso ? (
                  <button onClick={() => { setEnSuppressionPerso(true); setMotSupprPerso(""); }}
                    className="w-full px-4 py-2 rounded-lg text-xs font-bold"
                    style={{ background: "#fb718510", color: "#fb7185", border: "1px solid #fb718544", cursor: "pointer" }}>
                    ✕ SUPPRIMER CE PERSONNAGE
                  </button>
                ) : (
                  <div className="pt-3" style={{ borderTop: "1px solid #27272a" }}>
                    <div className="text-xs mb-2 leading-relaxed" style={{ color: "#fb7185" }}>
                      « {detailPerso.nom} » quittera le registre. La Tombe garde sa trace —
                      écrivez « suppression » pour consacrer la sentence.
                    </div>
                    <div className="flex gap-2">
                      <input value={motSupprPerso} onChange={(e) => setMotSupprPerso(e.target.value)}
                        placeholder="suppression" type="text" autoComplete="off" maxLength={12}
                        className="flex-1 rounded-lg px-3 py-2 text-sm"
                        style={{ background: "#14161b", border: "1px solid #3f3f46", color: "#e8e4d8", outline: "none" }} />
                      <button onClick={() => { setEnSuppressionPerso(false); setMotSupprPerso(""); }}
                        className="px-4 py-2 rounded-lg text-xs font-bold"
                        style={{ background: "#a8adb814", color: "#a8adb8", border: "1px solid #27272a", cursor: "pointer" }}>ANNULER</button>
                    </div>
                    <button onClick={() => { onSupprimer && onSupprimer(detailPerso); setDetailPerso(null); setEnSuppressionPerso(false); setMotSupprPerso(""); }}
                      disabled={motSupprPerso !== "suppression"}
                      className="w-full px-4 py-2 rounded-lg text-xs font-bold mt-2"
                      style={{ background: motSupprPerso === "suppression" ? "#fb7185" : "#fb718522", color: motSupprPerso === "suppression" ? "#0c0d10" : "#71717a", border: "1px solid #fb718544", cursor: "pointer", opacity: motSupprPerso === "suppression" ? 1 : 0.5 }}>
                      ✕ EFFACER
                    </button>
                  </div>
                )}
              </div>
            ) : persos.length === 0 ? (
              <div className="text-sm" style={{ color: "#a1a1aa" }}>
                Aucun personnage pour {pack.nom}. Créez votre premier personnage avec « + CRÉER » —
                il rejoindra le registre, prêt à entrer dans n'importe quelle aventure du pack.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs" style={{ color: "#71717a" }}>
                    <th className="text-left px-1 py-2">PERSONNAGE</th>
                    <th className="text-right px-1 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {persos.map(p => (
                    <tr key={p.id} style={{ borderTop: "1px solid #ffffff08" }}>
                      <td className="px-1 py-2.5">
                        {/* V0.76 — le perso PRIS porte l'or et sa pastille. */}
                        <div className="text-sm font-bold" style={{ color: persoChoisi === p.id ? "#f0b24a" : "#e8e4d8" }}>{persoChoisi === p.id ? "● " : ""}{p.nom}</div>
                        <div className="text-xs" style={{ color: "#52525b" }}>
                          {resumePerso(p.contenu)} · créé le {new Date(p.cree_le).toLocaleDateString("fr-FR")}
                        </div>
                      </td>
                      <td className="px-1 py-2.5 text-right">
                        {/* V0.76 — LE PERSO POUR L'AVENTURE : PRENDRE à
                            gauche de l'écrou. La prise affiche la fiche
                            (grande fiche dans le noyau d100, fiche du
                            registre au lobby) ; re-cliquer dépose. */}
                        <div className="flex items-center justify-end gap-1.5">
                          {onChoisir && (
                            <button onClick={() => {
                              if (persoChoisi !== p.id) {
                                setDetailPerso(p);
                                setEnCreationPerso(false);
                                setEnSuppressionPerso(false);
                                setMotSupprPerso("");
                                if (onOuvrir) onOuvrir(p);
                              }
                              onChoisir(p);
                            }}
                              className="px-2 py-1 rounded-lg text-xs font-bold"
                              style={persoChoisi === p.id
                                ? { background: "#f0b24a", color: "#0c0d10", cursor: "pointer" }
                                : { background: "#a8adb814", color: "#a8adb8", border: "1px solid #27272a", cursor: "pointer" }}>
                              {persoChoisi === p.id ? "PRIS POUR L'AVENTURE" : "PRENDRE"}
                            </button>
                          )}
                          <button onClick={() => { setDetailPerso(p); setEnCreationPerso(false); setEnSuppressionPerso(false); setMotSupprPerso(""); }}
                            className="px-2 py-1 rounded-lg text-xs font-bold"
                            style={{ background: "#a8adb814", color: "#a8adb8", border: "1px solid #27272a", cursor: "pointer" }}>⚙</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
  );
}

