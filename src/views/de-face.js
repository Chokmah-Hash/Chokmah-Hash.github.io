/* ════════ V0.49 — La face de dé en points (pips), pure CSS ════════
   Une grille 3×3 : les points s'allument selon la face tirée — le
   feedback visuel du Jet de Dés du CANTINA. */
function DeFace({ v, accent }) {
  const pips = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] }[v] || [];
  return (
    <div className="rounded-lg grid grid-cols-3 gap-0.5 items-center justify-items-center shrink-0"
      style={{ width: 44, height: 44, padding: 6, background: "#0c0d10", border: "1px solid " + accent + "66" }}>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className="rounded-full"
          style={{ background: pips.includes(i) ? accent : "transparent", width: 6, height: 6 }} />
      ))}
    </div>
  );
}

