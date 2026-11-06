function Vignette({ pack, favori, onFavori, onInstaller, onLancer, onDesinstaller, showToast, contexte = "magasin", installe = false, enInstallation = false, connecte = true }) {
  const dispo = pack.statut === "disponible";
  return (
    <div
      className="rounded-2xl border overflow-hidden flex flex-col transition-transform duration-200"
      style={{
        borderColor: dispo ? pack.theme.accent + "55" : "#3f3f46",
        background: `linear-gradient(150deg, ${pack.theme.fond} 0%, #14161b 100%)`,
        opacity: dispo ? 1 : 0.72
      }}
    >
      <div className="p-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
            style={{ background: pack.theme.fond, border: `1px solid ${pack.theme.accent}44` }}
          >
            <GlyphePack pack={pack} size={44} fond={pack.theme.fond} />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">{pack.nom}</div>
            <div className="text-xs mt-0.5" style={{ color: "#a1a1aa" }}>
              {pack.type} · dépend de {pack.depend_de.map(d => `${d.id}@${d.format_min}`).join(", ")}
            </div>
          </div>
        </div>
        <button
          onClick={() => { onFavori(pack.id); showToast(favori ? "Retiré des favoris" : "Ajouté à la bibliothèque ★"); }}
          className="text-xl px-1 leading-none hover:scale-110 transition-transform"
          title="Favori"
        >
          {favori ? "★" : "☆"}
        </button>
      </div>
      <div className="px-5 pb-4 text-sm" style={{ color: "#c8c8ce" }}>{pack.resume}</div>
      <div className="mt-auto p-4 flex items-center justify-between" style={{ background: "#ffffff08" }}>
        <div className="text-xs flex items-center gap-1.5" style={{ color: "#71717a" }}>
          <span>v{pack.version}{pack.visibilite === "prive" && " · privé"} · {pack.taille}</span>
        </div>
        {contexte === "bibliotheque" ? (
          /* V48.3 — L'ÉPURE : lancer, ou désinstaller — les données du
             compte (personnages, aventures) restent dans la Tombe. */
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDesinstaller(pack)}
              className="px-3 py-2 rounded-lg font-bold text-xs"
              style={{ background: "transparent", color: "#a1a1aa", border: "1px solid #27272a", cursor: "pointer" }}
              title="Retire le pack de la bibliothèque — vos personnages et aventures restent dans la Tombe"
            >
              ✕ Désinstaller
            </button>
            <button
              onClick={() => onLancer(pack)}
              className="px-4 py-2 rounded-lg font-bold text-sm text-black"
              style={{ background: pack.theme.accent }}
            >
              ▶ Lancer
            </button>
          </div>
        ) : !connecte ? (
          <span className="text-xs font-bold" style={{ color: "#52525b" }} title="Connectez-vous pour installer">
            🔒 connexion requise
          </span>
        ) : dispo ? (
          installe ? (
            <button
              disabled
              className="px-4 py-2 rounded-lg font-bold text-sm border border-zinc-700 text-zinc-500"
              style={{ background: "#ffffff08", cursor: "not-allowed" }}
            >
              ✓ Déjà installé
            </button>
          ) : (
            <button
              onClick={() => onInstaller(pack)}
              disabled={enInstallation}
              className={"px-4 py-2 rounded-lg font-bold text-sm text-black" + (enInstallation ? " animate-pulse" : "")}
              style={{ background: enInstallation ? "#52525b" : pack.theme.accent }}
            >
              {enInstallation ? "Installation…" : "⬇ Installer"}
            </button>
          )
        ) : (
          <button
            onClick={() => showToast(`${pack.nom} — pack non packagé. À venir !`)}
            className="px-4 py-2 rounded-lg font-bold text-sm border border-zinc-600 text-zinc-400"
          >
            À venir
          </button>
        )}
      </div>
    </div>
  );
}
/* ══════════ La Console Globale : le canal des événements de jeu ══════════
   L'idée de Michael : un canal unique où le MJ et les joueurs se parlent.
   V1 : messages libres (les dés et le tour viendront se typer par-dessus,
   on filtrera une fois que le canal fonctionne). Chaque message est GRAVÉ
   dans la Tombe — prémice du journal — et pousse en temps réel chez tous.
   Vit en ONGLET du hub, comme à l'Archivisterium — zinc d'Archiviste,
   l'ambre reste à l'institution et au MJ. */
/* ══════════ V0.37 — LA LIGNE DE CONSOLE : le rendu d'UN message, le
   même partout — bandeau du tour, jet de dés signé 🏛, événement de
   journal, ou simple parole. Le fil de tous et le salon d'un JDR
   parlent ainsi la même langue. ══════════ */
function LigneConsole({ e }) {
  const heure = (iso) => {
    try { return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }
    catch (err) { return ""; }
  };
  if (e.type === "tour") {
    return (
      <div className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid #f0b24a22" }}>
        <span className="text-xs shrink-0" style={{ color: "#52525b" }}>{heure(e.cree_le)}</span>
        <span className="text-xs font-bold flex-1 text-center" style={{ color: "#f0b24a", letterSpacing: "0.06em" }}>
          ▸ AU TOUR DE {e.contenu.toUpperCase()} <span style={{ color: "#71717a" }}>— par {e.pseudo}</span>
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-baseline gap-2 py-1" style={{ borderBottom: "1px solid #ffffff08" }}>
      <span className="text-xs shrink-0" style={{ color: "#52525b" }}>{heure(e.cree_le)}</span>
      <span className="text-xs font-bold shrink-0"
        style={{ color: (e.role === "admin" || e.role === "MJ") ? "#f0b24a" : "#c8c8ce" }}>
        {e.pseudo}{e.role === "admin" || e.role === "MJ" ? " (MJ)" : ""}
      </span>
      {e.type === "de" ? (
        <>
          <span className="text-xs">🎲</span>
          <span className="text-xs font-bold" style={{ color: "#2ee6c9", overflowWrap: "anywhere" }}>{e.contenu}</span>
          {(e.donnees && e.donnees.serveur) && <span className="text-xs shrink-0" style={{ color: "#52525b" }} title="Roulé et signé par la Tombe">🏛</span>}
        </>
      ) : e.type === "journal" ? (
        <>
          <span className="text-xs px-1 rounded font-bold shrink-0" style={{ background: "#a8adb822", color: "#a8adb8" }}>{(e.donnees && e.donnees.evenement) || "journal"}</span>
          <span className="text-xs italic" style={{ color: "#71717a", overflowWrap: "anywhere" }}>{e.contenu}</span>
        </>
      ) : (
        <span className="text-xs" style={{ color: "#a1a1aa", overflowWrap: "anywhere" }}>{e.contenu}</span>
      )}
    </div>
  );
}

