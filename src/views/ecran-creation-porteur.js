/* ══════════ Bloodlust : création d'un porteur (livre p. 81-88) ══════════ */
function EcranCreationPorteur({ contenu, accent, onValide, onAnnule }) {
  const [peuple, setPeuple] = useState(null);
  const [nom, setNom] = useState("");
  const [ajust, setAjust] = useState({}); /* désir → −2..+2 (un PJ ajuste de ±1 à ±2) */
  const [bonus, setBonus] = useState({}); /* compétence → multiple de 5 */

  const listeCombat = contenu.baseCombat, listeSec = contenu.baseSecondaires;
  const nomsDesirs = contenu.desirsNoms;
  const totalGroupe = (liste) => liste.reduce((s, [k]) => s + (bonus[k] || 0), 0);
  const totCombat = totalGroupe(listeCombat), totSec = totalGroupe(listeSec);
  const majBonus = (liste, plafond, k, delta) => {
    const nv = (bonus[k] || 0) + delta;
    if (nv < 0 || nv > 100 || totalGroupe(liste) + delta > plafond) return;
    setBonus(b => ({ ...b, [k]: nv }));
  };
  const peutValider = peuple && nom.trim().length > 0;

  const valider = () => {
    const competences = {};
    [...listeCombat, ...listeSec].forEach(([k, base]) => { competences[k] = base + (bonus[k] || 0); });
    const desirs = {};
    nomsDesirs.forEach((d, i) => { desirs[d] = contenu.desirsPeuples[peuple.nom][i] + (ajust[d] || 0); });
    onValide({ id: "cree", nom: nom.trim(), peuple: peuple.nom, caracs: peuple.caracs, desirs, competences });
  };

  return (
    <div className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid " + accent + "33" }}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="font-bold text-lg" style={{ color: accent }}>🧬 Créer un porteur</div>
        <div className="text-xs" style={{ color: "#71717a" }}>livre p. 81-88</div>
      </div>
      <div className="text-xs mb-4" style={{ color: "#a1a1aa" }}>
        Peuple → nom → désirs → compétences. PV = EN×2, contrôle = VO×5.
        Modificateurs par valeur de carac (image p. 87-88) ignorés dans l'alpha.
      </div>

      {/* ① Identité + peuple */}
      <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom du porteur…"
        className="w-full rounded-lg px-3 py-2 mb-3 text-sm"
        style={{ background: "#0c0d10", border: "1px solid #3f3f46", color: "#e8e4d8" }} />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {contenu.peuples.map(p => (
          <button key={p.id} onClick={() => setPeuple(p)}
            className="rounded-lg p-2.5 text-left"
            style={{ border: "1px solid " + (peuple && peuple.id === p.id ? accent : "#3f3f46"),
                     background: peuple && peuple.id === p.id ? "#ffffff0d" : "#ffffff08" }}>
            <div className="font-bold text-sm" style={{ color: peuple && peuple.id === p.id ? accent : "#e8e4d8" }}>{p.nom}</div>
            <div className="text-xs mt-0.5" style={{ color: "#a1a1aa" }}>
              FO {p.caracs.FO} · EN {p.caracs.EN} · Ag {p.caracs.Ag} · RA {p.caracs.RA} · PE {p.caracs.PE} · VO {p.caracs.VO}
            </div>
          </button>
        ))}
      </div>

      {peuple && (<>
        {/* ② Désirs du peuple */}
        <div className="text-xs mt-4 mb-1.5" style={{ color: "#71717a" }}>
          Désirs du peuple {peuple.nom} (livre p. 88) — un PJ ajuste chaque désir de ±1 à ±2
        </div>
        {nomsDesirs.map((d, i) => {
          const base = contenu.desirsPeuples[peuple.nom][i];
          return (
            <div key={d} className="flex items-center justify-between rounded-lg px-2.5 py-1.5 mb-1.5" style={{ background: "#ffffff08" }}>
              <span className="text-sm" style={{ color: "#c8c8ce" }}>
                {d} <span style={{ color: "#71717a" }}>peuple : {base}</span>
              </span>
              <span className="flex items-center gap-1">
                {[-2, -1, 0, 1, 2].map(v => (
                  <button key={v} onClick={() => setAjust(a => ({ ...a, [d]: v }))}
                    className="w-7 h-7 rounded text-xs font-bold"
                    style={{ background: (ajust[d] || 0) === v ? accent : "#0c0d10",
                             color: (ajust[d] || 0) === v ? "#0c0d10" : "#c8c8ce", border: "1px solid #3f3f46" }}>
                    {v > 0 ? "+" + v : v}
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold" style={{ color: "#e8e4d8" }}>
                  {base + (ajust[d] || 0)}/10{(base + (ajust[d] || 0)) >= 9 ? " 🔥" : ""}
                </span>
              </span>
            </div>
          );
        })}

        {/* ③ Compétences : budgets PJ (multiples de 5, plancher 5 %) */}
        {[["Compétences de combat — +40 % à répartir", listeCombat, 40, totCombat],
          ["Compétences secondaires — +80 % à répartir", listeSec, 80, totSec]].map(([titre, liste, plafond, tot]) => (
          <div key={titre}>
            <div className="flex justify-between text-xs mt-4 mb-1.5">
              <span style={{ color: "#71717a" }}>{titre}</span>
              <span style={{ color: tot >= plafond ? "#71717a" : accent }}>{tot} / {plafond} %</span>
            </div>
            {liste.map(([k, base]) => (
              <div key={k} className="flex items-center justify-between rounded-lg px-2.5 py-1 mb-1" style={{ background: "#ffffff08" }}>
                <span className="text-sm" style={{ color: "#c8c8ce" }}>
                  {k} <span style={{ color: "#71717a" }}>base {base} %</span>
                </span>
                <span className="flex items-center gap-2">
                  <button onClick={() => majBonus(liste, plafond, k, -5)}
                    className="w-6 h-6 rounded text-xs font-bold" style={{ background: "#0c0d10", color: "#c8c8ce", border: "1px solid #3f3f46" }}>−</button>
                  <span className="text-sm font-bold w-12 text-right" style={{ color: "#e8e4d8" }}>{base + (bonus[k] || 0)} %</span>
                  <button onClick={() => majBonus(liste, plafond, k, 5)}
                    className="w-6 h-6 rounded text-xs font-bold" style={{ background: "#0c0d10", color: "#c8c8ce", border: "1px solid #3f3f46" }}>+</button>
                </span>
              </div>
            ))}
          </div>
        ))}

        {/* ④ Aperçu dérivé */}
        <div className="flex gap-2 mt-4 text-center text-xs">
          <div className="flex-1 rounded-lg py-1.5" style={{ background: "#ffffff0d", color: "#e8e4d8" }}>
            PV = EN×2 <b>{peuple.caracs.EN * 2}</b>
          </div>
          <div className="flex-1 rounded-lg py-1.5" style={{ background: "#ffffff0d", color: "#e8e4d8" }}>
            Contrôle = VO×5 <b>{peuple.caracs.VO * 5} %</b>
          </div>
        </div>
      </>)}

      {/* Pied : annuler / faire naître */}
      <div className="flex gap-2 mt-4">
        <button onClick={onAnnule} className="flex-1 py-2 rounded-lg text-sm font-bold"
          style={{ background: "#0c0d10", color: "#a1a1aa", border: "1px solid #3f3f46" }}>✕ Annuler</button>
        <button onClick={valider} disabled={!peutValider}
          className="flex-1 py-2 rounded-lg text-sm font-bold"
          style={{ background: peutValider ? accent : "#27272a", color: peutValider ? "#0c0d10" : "#71717a" }}>
          {peutValider ? `🧬 Créer ${nom.trim()}` : "🧬 Choisir un peuple et un nom"}
        </button>
      </div>
    </div>
  );
}

