/* ════════ Le lecteur de documents — UNIVERSEL (couche « documents » du pack) ════════
   Le livre de règles de chaque jeu est une DONNÉE du pack (manifeste v1.3) :
   documents → sections → blocs (para, liste, table). Le Core affiche, le pack
   raconte — le même lecteur pour tous les packs, présents et à venir. */
function BlocDoc({ bloc, T }) {
  if (bloc.type === "para") return <p className="text-sm leading-relaxed" style={{ color: "#c8c8ce" }}>{bloc.texte}</p>;
  if (bloc.type === "liste") return (
    <ul className="text-sm flex flex-col gap-1.5">
      {bloc.items.map((it, i) => (
        <li key={i} className="flex gap-2" style={{ color: "#c8c8ce" }}><span style={{ color: T.accent }}>▸</span>{it}</li>
      ))}
    </ul>
  );
  if (bloc.type === "table") return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {bloc.entetes.map((h, i) => (
              <th key={i} className="text-left px-3 py-2 rounded" style={{ background: T.accent + "22", color: T.accent }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bloc.lignes.map((l, i) => (
            <tr key={i}>
              {l.map((cel, j) => (
                <td key={j} className="px-3 py-1.5" style={{ color: "#e8e4d8", borderBottom: "1px solid #27272a" }}>{cel}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return null;
}

