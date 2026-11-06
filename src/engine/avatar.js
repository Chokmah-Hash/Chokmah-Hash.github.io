/* ══════════ Le compte joueur : avatar + session réelles (Supabase) ══════════ */
function Avatar({ a, size = 40, selectionne = false, halo = null }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size, height: size, background: a.fond,
        border: (halo ? 2.5 : selectionne ? 2.5 : 1.5) + "px solid " + (halo || (selectionne ? a.bord : "#3f3f46")),
        boxShadow: halo ? "0 0 10px " + halo + "66" : "none",
        fontSize: Math.round(size * 0.5), lineHeight: 1
      }}
    >
      <span>{a.glyph}</span>
    </div>
  );
}

