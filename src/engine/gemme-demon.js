/* ════════ V0.59 — La Gemme et le démon, ICÔNE DE BLOODLUST ════════
   Validé par Michael (04/11/2026) : le concept même du jeu — le démon
   intérieur, ici une goutte de sang suspendue, enfermé dans la gemme.
   EXACTEMENT aux proportions de la maquette validée (losange plus large
   que haut, goutte au tiers supérieur). SANS MARGE par le CADRAGE :
   le viewBox épouse le dessin (36 26 120 140), pas en gonflant le
   losange jusqu'au carré (V0.58, déformation rejetée par Michael). */
function GemmeDemon({ size = 32, color = "#e8e4d8" }) {
  return (
    <svg width={size} height={size} viewBox="36 26 120 140" style={{ display: "block" }}>
      <polygon points="96,30 152,74 96,162 40,74" fill="none" stroke={color} strokeWidth="8" />
      <path d="M96 62 C 89 78 82 90 82 102 A 14 14 0 0 0 110 102 C 110 90 103 78 96 62 Z" fill={color} />
    </svg>
  );
}

