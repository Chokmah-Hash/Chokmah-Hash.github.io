/* ════════ V0.59 — Les Flèches du Chaos, ICÔNE DE STORMBRINGER ════════
   Validé par Michael (04/11/2026) : les huit flèches du Chaos — le
   symbole canonique du jeu, EXACTEMENT aux proportions de la maquette
   validée. SANS MARGE par le CADRAGE : le viewBox épouse le dessin
   (20 20 152 152 — les pointes s'arrêtent à 76 du centre, le cadre
   les suit), pas en étirant les flèches jusqu'aux bords (V0.58,
   déformation rejetée par Michael). */
function FlechesChaos({ size = 32, color = "#e8e4d8" }) {
  return (
    <svg width={size} height={size} viewBox="20 20 152 152" style={{ display: "block" }}>
      <g transform="translate(96,96)" stroke={color} strokeWidth="8" fill={color}>
        <circle cx="0" cy="0" r="14" stroke="none" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
          <g key={a} transform={"rotate(" + a + ")"}>
            <rect x="22" y="-4" width="40" height="8" stroke="none" />
            <polygon points="60,-10 76,0 60,10" stroke="none" />
          </g>
        ))}
      </g>
    </svg>
  );
}

