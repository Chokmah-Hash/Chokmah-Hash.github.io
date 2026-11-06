/* Le glyphe d'un pack : la Cible aux quatre coupes pour Les Protocoles
   Éternels (V0.52), les Flèches du Chaos pour Stormbringer et la Gemme
   et le démon pour Bloodlust (V0.58) — le glyphe texte en repli. */
function GlyphePack({ pack, size = 32, fond = "#0c0d10" }) {
  const teinte = pack.theme ? pack.theme.or : "#e8e4d8";
  if (pack.id === "GM-0001") {
    return <CibleJeu size={size} color={teinte} fond={fond} />;
  }
  if (pack.id === "GM-0002") {
    return <FlechesChaos size={size} color={teinte} />;
  }
  if (pack.id === "GM-0003") {
    return <GemmeDemon size={size} color={teinte} />;
  }
  return <span className="text-2xl" style={{ color: teinte }}>{pack.glyphs || "⟁"}</span>;
}

