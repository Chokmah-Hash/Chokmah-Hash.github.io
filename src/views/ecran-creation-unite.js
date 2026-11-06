/* ══════════ PÉ : éveil d'une unité (manuel joueur — noms neutres) ══════════
   Données du manuel joueur (10 châssis, 6 codes de fabrique, arsenal neutre).
   L'unité éveillée remplace Signa-3 partout. Modules, wargear et protocoles :
   hors alpha (places Mémoire/Calcul affichées, limites de taille par châssis
   pas encore extraites). */
function EcranCreationUnite({ contenu, accent, onValide, onAnnule }) {
  const [nom, setNom] = useState("");
  const [chNom, setChNom] = useState(null);
  const [code, setCode] = useState(null);
  const [armeId, setArmeId] = useState(contenu.arsenal[0] ? contenu.arsenal[0].id : "");
  const ch = contenu.chassis.find(c => c.n === chNom) || null;
  const arme = contenu.arsenal.find(a => a.id === armeId);
  const peutValider = !!ch && !!code && nom.trim().length > 0;

  const valider = () => onValide({
    id: "cree", nom: nom.trim(),
    chassis: ch.n, code,
    st: { cc: ch.cc, ct: ch.ct, f: parseInt(ch.f, 10), e: parseInt(ch.e, 10), sv: ch.sv, cd: ch.cd, a: parseInt(ch.a, 10) },
    rfx: parseInt(ch.rfx, 10), pvMax: parseInt(ch.pv, 10),
    apt: ch.apt, comps: ch.cp.slice(), arme: arme.id, armeDef: arme
  });

  return (
    <div className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid " + accent + "33" }}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="font-bold text-lg" style={{ color: accent }}>⚙ Créer une unité</div>
        <div className="text-xs" style={{ color: "#71717a" }}>10 châssis · 6 codes de fabrique</div>
      </div>
      <div className="text-xs mb-4" style={{ color: "#a1a1aa" }}>
        Nom → châssis → code de fabrique → arme. PV et Rfx viennent du châssis (PV = W×3).
        Modules, wargear et protocoles : hors alpha — les places Mémoire/Calcul sont gravées pour la suite.
      </div>

      {/* ① Identité */}
      <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Désignation de l'unité…"
        className="w-full rounded-lg px-3 py-2 mb-3 text-sm"
        style={{ background: "#0c0d10", border: "1px solid #3f3f46", color: "#e8e4d8" }} />

      {/* ② Châssis */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {contenu.chassis.map(c => (
          <button key={c.n} onClick={() => setChNom(c.n)} className="rounded-lg p-2.5 text-left"
            style={{ border: "1px solid " + (chNom === c.n ? accent : "#3f3f46"), background: chNom === c.n ? "#ffffff0d" : "#ffffff08" }}>
            <div className="font-bold text-sm" style={{ color: chNom === c.n ? accent : "#e8e4d8" }}>{c.n}</div>
            <div className="text-xs mt-0.5" style={{ color: "#a1a1aa" }}>
              CC {c.cc} · CT {c.ct} · F {c.f} · E {c.e} · PV {c.pv} · A {c.a} · Sv {c.sv} · Rfx {c.rfx}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#71717a" }}>Mémoire {c.mem} · Calcul {c.cal}</div>
          </button>
        ))}
      </div>

      {ch && (<>
        {/* ③ Code de fabrique */}
        <div className="text-xs mt-4 mb-1.5" style={{ color: "#71717a" }}>Code de fabrique de la lignée</div>
        <div className="flex flex-wrap gap-1.5">
          {contenu.codes.map(c => (
            <button key={c} onClick={() => setCode(c)} className="px-2.5 py-1 rounded-lg text-sm font-bold"
              style={{ background: code === c ? accent : "#14161b", color: code === c ? "#0a120f" : "#c8c8ce", border: "1px solid " + (code === c ? accent : "#3f3f46") }}>
              {c}
            </button>
          ))}
        </div>

        {/* ④ Arme de départ */}
        <div className="text-xs mt-4 mb-1.5" style={{ color: "#71717a" }}>Arme de départ — arsenal neutre (choix libre dans l'alpha)</div>
        <select value={armeId} onChange={e => setArmeId(e.target.value)} className="w-full rounded px-2 py-1.5 text-sm"
          style={{ background: "#14161b", color: "#e8e4d8", border: "1px solid #3f3f46" }}>
          {contenu.arsenal.map(a => (
            <option key={a.id} value={a.id}>
              {a.nom} · {a.tir ? "tir" : "mêlée"} · {a.portee} · A {a.att} · F {a.f} · PA {a.pa} · D {a.d} · T{a.taille}
            </option>
          ))}
        </select>
        <div className="text-xs mt-1" style={{ color: "#71717a" }}>{arme.regle}</div>

        {/* ⑤ Aperçu dérivé */}
        <div className="flex gap-2 mt-3 text-center text-xs">
          <div className="flex-1 rounded-lg py-1.5" style={{ background: "#ffffff0d", color: "#e8e4d8" }}>PV <b>{ch.pv}</b></div>
          <div className="flex-1 rounded-lg py-1.5" style={{ background: "#ffffff0d", color: "#e8e4d8" }}>Initiative 1D6 <b>Rfx {ch.rfx}</b></div>
          <div className="flex-1 rounded-lg py-1.5" style={{ background: "#ffffff0d", color: "#e8e4d8" }}>Mémoire <b>{ch.mem}</b> · Calcul <b>{ch.cal}</b></div>
        </div>
        <div className="text-xs mt-2 rounded p-2" style={{ background: "#ffffff08", color: "#c8c8ce" }}>
          <b style={{ color: "#e8e4d8" }}>Aptitude de châssis — </b>{ch.apt}
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {ch.cp.map(c => (
            <span key={c} className="text-xs px-1.5 py-0.5 rounded" style={{ background: accent + "22", color: accent }}>{c}</span>
          ))}
        </div>
      </>)}

      {/* Pied : annuler / éveiller */}
      <div className="flex gap-2 mt-4">
        <button onClick={onAnnule} className="flex-1 py-2 rounded-lg text-sm font-bold"
          style={{ background: "#0c0d10", color: "#a1a1aa", border: "1px solid #3f3f46" }}>✕ Annuler</button>
        <button onClick={valider} disabled={!peutValider}
          className="flex-1 py-2 rounded-lg text-sm font-bold"
          style={{ background: peutValider ? accent : "#27272a", color: peutValider ? "#0a120f" : "#71717a" }}>
          {peutValider ? `⟁ Créer ${nom.trim()}` : "⟁ Châssis, code et nom requis"}
        </button>
      </div>
    </div>
  );
}

