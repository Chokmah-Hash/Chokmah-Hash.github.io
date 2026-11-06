/* ══════════ La Cible — glyphe du launcher (clin d'œil à la tuile du site) ══════════ */
function Cible({ size = 40, color = "#e8e4d8", fond = "transparent" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <rect width="100" height="100" fill={fond} rx="14" />
      <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="5.5" strokeDasharray="55 11" transform="rotate(11 50 50)" />
      <circle cx="50" cy="50" r="27" fill="none" stroke={color} strokeWidth="5" strokeDasharray="36.6 6" transform="rotate(11 50 50)" />
      <circle cx="50" cy="50" r="8.5" fill={color} />
    </svg>
  );
}

