/* ════════ V0.57 — La face du d100, chiffrée (1-100), pure CSS ════════
   Même empreinte que DeFace (44 px, bord accent) : le nombre tiré
   s'écrit en clair — le d100 n'a pas de points, il a des chiffres. */
function DeFace100({ v, accent }) {
  return (
    <div className="rounded-lg flex items-center justify-center shrink-0"
      style={{ minWidth: 44, height: 44, padding: "0 12px", background: "#0c0d10", border: "1px solid " + accent + "66" }}>
      <span className="font-bold text-lg" style={{ color: accent }}>{v}</span>
    </div>
  );
}

