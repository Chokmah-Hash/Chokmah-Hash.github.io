/* ══════════ Le pack PÉ chargé (light light) ══════════ */
function PvBarre({ pv, pvMax, accent }) {
  return (
    <div className="flex gap-1">
      {/* V0.71 — pv-case : la classe du CSS print — les cases des
          jauges pointillées restent visibles sur papier clair. */}
      {Array.from({ length: pvMax }).map((_, i) => (
        <div key={i} className={(i < pv ? "pv-case pv-pleine" : "pv-case") + " h-8 flex-1 rounded"} style={{ background: i < pv ? accent : "#5c1f1f", border: "1px solid #ffffff18" }} />
      ))}
    </div>
  );
}

