/* ══════════ L'Archivisterium (miroir) — vitrine du magasin côté launcher ══════════
   L'Archivisterium RÉEL vit dans son app séparée (accès admin) ; ce miroir
   n'est qu'une vitrine en lecture du magasin. */
function RootConsole({ packs, symbole, onFermer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "#000000b3" }} onClick={onFermer}>
      <div className="rounded-2xl p-5 w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ background: "#14161b", border: "1px solid #f0b24a55", fontFamily: "'Rajdhani','Segoe UI',system-ui,sans-serif" }}>
        <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid #27272a" }}>
          <div>
            <div className="font-bold text-lg" style={{ color: "#f0b24a" }}>⚙ L'ARCHIVISTERIUM</div>
            <div className="text-xs" style={{ color: "#71717a" }}>La salle d'administration de l'Archiviste — miroir en lecture</div>
          </div>
          <button onClick={onFermer} className="text-xl px-2" style={{ color: "#71717a" }}>✕</button>
        </div>

        <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#71717a" }}>PACKS DU MAGASIN</div>
        <div className="flex flex-col gap-1.5 mb-4">
          {packs.map(p => (
            <div key={p.id} className="flex items-center justify-between rounded px-2.5 py-1.5 text-sm"
              style={{ background: "#ffffff08" }}>
              <div>
                <span className="font-bold" style={{ color: "#e8e4d8" }}>{p.nom}</span>{" "}
                <span className="text-xs" style={{ color: "#71717a" }}>v{p.version} · {p.type} · {p.taille}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{
                  border: "1px solid " + (p.statut === "disponible" ? "#2ee6c966" : "#52525b"),
                  color: p.statut === "disponible" ? "#2ee6c9" : "#71717a"
                }}>
                {p.statut === "disponible" ? "publié" : "à venir"} · {p.visibilite}
              </span>
            </div>
          ))}
        </div>

        <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#71717a" }}>IMAGES DE COMPTE DISPONIBLES</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {AVATARS.map(a => (
            <div key={a.id} className="flex flex-col items-center gap-1" style={{ width: 68 }}>
              <Avatar a={a} size={38} />
              <div className="text-center text-xs leading-tight" style={{ color: "#71717a" }}>{a.label}</div>
            </div>
          ))}
        </div>

        <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#71717a" }}>SYMBOLES DU LAUNCHER DISPONIBLES</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: "cible", label: "La Cible aux quatre coupes", note: "glyphe officiel",
              el: <Cible size={40} color="#e8e4d8" /> },
            { id: "d20", label: "L'Icosaèdre — silhouette hexagonale", note: "glyphe du hub",
              el: <Icosaedre size={40} color="#e8e4d8" /> },
            { id: "d20s", label: "L'Icosaèdre — vue par le sommet (pentagone)", note: "bibliothèque",
              el: <IcosaedreSommet size={40} color="#e8e4d8" /> },
            { id: "pe", label: "Glyphe GM-0001", note: "vignette pack",
              el: <div className="flex items-center justify-center text-3xl" style={{ width: 40, height: 40, color: "#e8e4d8" }}>⟁</div> },
            { id: "chaos", label: "Les Flèches du Chaos", note: "glyphe officiel",
              el: <FlechesChaos size={40} color="#e8e4d8" /> },
            { id: "gemme", label: "La Gemme et le démon", note: "glyphe officiel",
              el: <GemmeDemon size={40} color="#e8e4d8" /> }
          ].map(s => (
            <div key={s.id} className="flex flex-col items-center gap-1 rounded-xl p-2"
              style={{ width: 104, background: symbole === s.id ? "#a8adb814" : "#ffffff08",
                border: "1px solid " + (symbole === s.id ? "#a8adb844" : "transparent") }}>
              {s.el}
              <div className="text-center text-xs leading-tight" style={{ color: "#c8c8ce" }}>{s.label}</div>
              <div className="text-xs" style={{ color: symbole === s.id ? "#a8adb8" : "#71717a" }}>
                {symbole === s.id ? "● en usage" : s.note}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#71717a" }}>THÈMES DISPONIBLES</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {packs.map(p => (
            <div key={p.id} className="flex items-center gap-2 rounded-full px-3 py-1 text-xs"
              style={{ background: p.theme.fond, border: "1px solid " + p.theme.accent + "44" }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: p.theme.accent }} />
              <span style={{ width: 10, height: 10, borderRadius: 999, background: p.theme.or }} />
              <span style={{ color: "#c8c8ce" }}>thème {p.nom}</span>
            </div>
          ))}
        </div>

        <div className="text-xs pt-3" style={{ color: "#71717a", borderTop: "1px solid #27272a" }}>
          L'Archivisterium est une app séparée, accès admin — elle gère les packs
          publiés au magasin, les images de compte et les thèmes proposés aux packs.
          Ce miroir, dans l'Archiviste, ne fait que lire.
        </div>
      </div>
    </div>
  );
}

