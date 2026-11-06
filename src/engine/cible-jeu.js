/* ════════ V0.52 — La Cible aux quatre coupes, ICÔNE DU JEU ════════
   Candidat n° 9 validé par Michael (chantier K-BoT, 26/10/2026) : œil
   plein, deux anneaux fins, et quatre coupes — à 3 h, 4 h 30, 7 h 30
   et 9 h — qui mordent l'anneau extérieur des deux côtés sans jamais
   toucher l'anneau intérieur. Rien à 12 h ni à 6 h. Le glyphe ⟁ reste
   en repli pour les autres packs (données du manifeste inchangées). */
function CibleJeu({ size = 32, color = "#e8e4d8", fond = "#0c0d10" }) {
  return (
    <svg width={size} height={size} viewBox="30 30 132 132" style={{ display: "block" }}>
      <circle cx="96" cy="96" r="31" fill="none" stroke={color} strokeWidth="8" />
      <circle cx="96" cy="96" r="59" fill="none" stroke={color} strokeWidth="8" />
      <circle cx="96" cy="96" r="10" fill={color} />
      <g fill={fond} transform="translate(96,96)">
        <rect x="52" y="-2" width="14" height="4" />
        <rect x="52" y="-2" width="14" height="4" transform="rotate(45)" />
        <rect x="52" y="-2" width="14" height="4" transform="rotate(135)" />
        <rect x="52" y="-2" width="14" height="4" transform="rotate(180)" />
      </g>
    </svg>
  );
}

