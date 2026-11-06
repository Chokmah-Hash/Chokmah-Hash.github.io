/* ══════════ V43 — L'écran MJ : les fiches de la table ══════════
   Le MJ ouvre l'archive de toute la table : chaque joueur, sa fiche
   gravée dans la Tombe (l'unité éveillée, ses PV en direct via la
   poussée temps réel). Sans fiche : « pas encore de fiche ». */
function EcranMjFiches({ table, theme, onFermer }) {
  const T = theme;
  const joueurs = table.joueurs || [];
  const fiches = table.fiches || [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#000000cc" }}
      onClick={onFermer}>
      <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-5"
        style={{ background: "#14161b", border: "1px solid " + T.accent + "55" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-lg" style={{ color: T.accent }}>📜 Les fiches de la table</div>
          <button onClick={onFermer} className="px-3 py-1.5 rounded-lg text-sm font-bold"
            style={{ background: "#0c0d10", border: "1px solid #3f3f46", color: "#a1a1aa" }}>✕ Fermer</button>
        </div>
        {joueurs.length === 0 && (
          <div className="text-sm py-6 text-center" style={{ color: "#71717a" }}>Personne à la table — attendez les inscriptions.</div>
        )}
        <div className="flex flex-col gap-3">
          {joueurs.map(j => {
            const f = fiches.find(x => x.compte_id === j.compte_id);
            const p = f && f.contenu && f.contenu.perso;
            const pv = f && f.contenu ? f.contenu.pv : null;
            return (
              <div key={j.compte_id} className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid " + T.accent + "22" }}>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="font-bold" style={{ color: "#e8e4d8" }}>
                    {j.pseudo}{j.role === "mj" ? " · MJ" : ""}
                  </div>
                  <div className="text-xs" style={{ color: "#71717a" }}>{p ? `${p.chassis} · code ${p.code}` : "en attente"}</div>
                </div>
                {p ? (
                  <div>
                    <div className="text-sm font-bold mb-1" style={{ color: T.accent }}>{p.nom}</div>
                    <PvBarre pv={typeof pv === "number" ? pv : p.pvMax} pvMax={p.pvMax} accent={T.accent} />
                    <div className="text-right text-xs mt-1" style={{ color: "#a1a1aa" }}>{typeof pv === "number" ? pv : p.pvMax} / {p.pvMax} PV</div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
                      {[["CC", p.st.cc], ["CT", p.st.ct], ["F", p.st.f], ["E", p.st.e], ["Sv", p.st.sv], ["Cd", p.st.cd]]
                        .concat(p.st.a ? [["A", p.st.a]] : [])
                        .map(([k, v]) => (
                        <div key={k} className="rounded py-1.5" style={{ background: "#ffffff0d", color: "#e8e4d8" }}>
                          <span className="text-xs" style={{ color: "#71717a" }}>{k} </span>{v}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 rounded py-1.5 text-center text-xs" style={{ background: "#ffffff08", color: "#c8c8ce" }}>
                      <b style={{ color: "#e8e4d8" }}>{p.armeDef.nom}</b> · {p.armeDef.tir ? "tir" : "mêlée"} · {p.armeDef.portee} ·
                      A {p.armeDef.att} · F {p.armeDef.f} · PA {p.armeDef.pa} · D {p.armeDef.d}
                    </div>
                    {p.apt && (
                      <div className="mt-2 rounded p-2 text-xs" style={{ background: "#ffffff08", color: "#c8c8ce" }}>
                        <b style={{ color: "#e8e4d8" }}>Aptitude de châssis — </b>{p.apt}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm py-2" style={{ color: "#71717a" }}>Pas encore de fiche — l'unité de {j.pseudo} n'est pas éveillée.</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

