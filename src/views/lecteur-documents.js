/* §SECTION:VUES§ — les vues pack-aware (routées par noyau) et leurs écrans */
function LecteurDocuments({ pack, onFermer }) {
  const T = pack.theme;
  const docs = pack.contenu.documents || [];
  const [docIdx, setDocIdx] = useState(0);
  const [secIdx, setSecIdx] = useState(0);
  const doc = docs[docIdx];
  const section = doc && doc.sections[Math.min(secIdx, doc.sections.length - 1)];
  return (
    <div className="min-h-screen" style={{ background: T.fond, fontFamily: "'Rajdhani','Segoe UI',system-ui,sans-serif" }}>
      <div className="max-w-4xl mx-auto px-5 py-6">
        <header className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: "1px solid " + T.or + "44" }}>
          <button onClick={onFermer} className="px-3 py-1.5 rounded-lg text-sm font-bold" style={{ border: "1px solid " + T.accent + "66", color: T.accent }}>
            ← Retour à la table
          </button>
          <div className="text-center">
            <div className="text-xl font-bold" style={{ color: "#e8e4d8" }}>📖 {doc ? doc.titre : "—"}</div>
            <div className="text-xs" style={{ color: "#71717a" }}>couche « documents » du pack — lue par le lecteur universel</div>
          </div>
          <GlyphePack pack={pack} size={40} fond={T.fond} />
        </header>
        <div className="grid md:grid-cols-3 gap-4">
          <nav className="rounded-xl p-3 md:max-h-[70vh] md:overflow-y-auto" style={{ background: "#ffffff08", border: "1px solid " + T.accent + "33" }}>
            {docs.map((d, i) => (
              <div key={d.id} className="mb-3 last:mb-0">
                <div className="text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: "#71717a" }}>{d.titre}</div>
                {d.sections.map((s, j) => (
                  <button key={j} onClick={() => { setDocIdx(i); setSecIdx(j); }}
                    className="w-full text-left text-sm px-2 py-1.5 rounded mb-1"
                    style={{ background: i === docIdx && j === secIdx ? T.accent + "22" : "transparent", color: i === docIdx && j === secIdx ? T.accent : "#c8c8ce" }}>
                    {j + 1}. {s.titre}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="md:col-span-2 rounded-xl p-5" style={{ background: "#ffffff08", border: "1px solid " + T.accent + "33" }}>
            {section ? (
              <>
                <div className="font-bold text-lg mb-4 pb-2" style={{ color: T.accent, borderBottom: "1px solid " + T.accent + "22" }}>{section.titre}</div>
                <div className="flex flex-col gap-4">
                  {section.blocs.map((b, i) => <BlocDoc key={i} bloc={b} T={T} />)}
                </div>
              </>
            ) : (
              <div className="text-sm py-8 text-center" style={{ color: "#71717a" }}>Ce pack n'embarque pas encore de documents.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════ La vue du noyau-40k — générique : elle ne lit QUE pack.contenu ════════ */

