function JournalBloc({ journal, corriger, accent, or, surcharges }) {
  const familleCouleur = {
    combat: accent, libre: "#7dd3fc", protocole: or, scene: "#a1a1aa", journal: "#fb7185",
    pou: accent, forge: or, controle: "#fb7185", san: "#7dd3fc", perso: accent
  };
  const journalInverse = [...journal].reverse();
  return (
    <div className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid " + or + "44" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold" style={{ color: or }}>Journal du personnage — append-only</div>
        <button onClick={corriger}
          className="text-xs px-3 py-1 rounded font-bold"
          style={{ border: "1px solid #fb718566", color: "#fb7185" }}
          disabled={journal.length === 0}>
          Annuler le dernier (par écrit)
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
        Surcharges du mod appliquées : {surcharges}
      </div>
    </div>
  );
}

