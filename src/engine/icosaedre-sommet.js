/* ══════════ L'Icosaèdre vu par le sommet (pentagone) — modèle de Michael, conservé en bibliothèque ROOT ══════════
   Pentagone extérieur (pointe en haut), pentagone interne inversé,
   5 rayons convergents au centre, 10 faces triangulaires visibles — arêtes fines, sans chiffres. */
function IcosaedreSommet({ size = 40, color = "#e8e4d8", fond = "transparent" }) {
  const V = [[50, 6], [93.7, 37.8], [77, 89.2], [23, 89.2], [6.3, 37.8]];
  const A = [[62.2, 35.3], [69.7, 58.4], [50, 72.7], [30.3, 58.4], [37.8, 35.3]];
  const C = [50, 52];
  const P = (p) => p.join(",");
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <rect width="100" height="100" fill={fond} rx="14" />
      <g fill="none" stroke={color} strokeWidth="3.8" strokeLinejoin="round" strokeLinecap="round">
        {/* silhouette : pentagone vu par le sommet */}
        <polygon points={V.map(P).join(" ")} />
        {/* anneau interne inversé (pointe en bas) */}
        <polygon points={A.map(P).join(" ")} />
        {/* 5 rayons : le sommet du dé converge au centre */}
        {A.map((a, i) => <polyline key={"c" + i} points={P(C) + " " + P(a)} />)}
        {/* 10 arêtes : anneau interne vers les sommets du pentagone */}
        {A.map((a, i) => (
          <g key={"v" + i}>
            <polyline points={P(a) + " " + P(V[i])} />
            <polyline points={P(a) + " " + P(V[(i + 1) % 5])} />
          </g>
        ))}
      </g>
    </svg>
  );
}

