function BarrePct({ valeur, max, accent, label }) {
  const pct = Math.max(0, Math.min(100, Math.round((valeur / max) * 100)));
  return (
    <div>
      {/* V0.71 — fiche-piste/fiche-remplissage : les classes du CSS
          print (entree.css) — les barres gardent leur remplissage
          sur le papier clair. */}
      <div className="barre-piste h-2 rounded-full overflow-hidden" style={{ background: "#ffffff14" }}>
        <div className="barre-remplissage h-full rounded-full transition-all" style={{ width: pct + "%", background: accent }} />
      </div>
      {label && <div className="text-right text-xs mt-0.5" style={{ color: "#a1a1aa" }}>{label}</div>}
    </div>
  );
}

