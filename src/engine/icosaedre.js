/* ══════════ L'Icosaèdre — glyphe D20 retenu : fidèle au modèle de Michael ══════════
   Silhouette hexagonale (pointe en haut) + 6 arêtes droites :
   de chaque sommet du contour, une ligne rejoint le point central. Rien d'autre. */
function Icosaedre({ size = 40, color = "#e8e4d8", fond = "transparent" }) {
  const V = [[50, 6], [88.5, 28.5], [88.5, 71.5], [50, 94], [11.5, 71.5], [11.5, 28.5]];
  const C = [50, 50];
  const P = (p) => p.join(",");
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <rect width="100" height="100" fill={fond} rx="14" />
      <g fill="none" stroke={color} strokeWidth="3.8" strokeLinejoin="round" strokeLinecap="round">
        {/* silhouette hexagonale */}
        <polygon points={V.map(P).join(" ")} />
        {/* 6 arêtes : chaque sommet rejoint le point central */}
        {V.map((v, i) => (
          <polyline key={i} points={P(v) + " " + P(C)} />
        ))}
      </g>
    </svg>
  );
}

