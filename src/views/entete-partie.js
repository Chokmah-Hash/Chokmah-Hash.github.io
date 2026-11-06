/* ════════ V0.49/50 — Entête de partie, V0.67 : LA RÈGLE DES PAGES DE JEU ════════
   L'entête de TOUTE page de jeu (JOUEUR comme MJ, avant de lancer ou
   rejoindre une aventure) porte le TITRE DU JEU seul — glyphe du pack,
   nom, sous-titre du manifeste — avec l'icône du joueur à droite (le
   halo de l'avatar est le rôle : ambre pour le MJ, turquoise pour le
   joueur) ; plus de bandeau « L'ARCHIVISTE » au-dessus. V0.67 : la prop
   onRetour (facultative) pose le bouton ⌂ HUB à droite, devant le
   compte — l'écran de partie l'utilise, les vues de pack vivent sans. */
function EntetePartie({ pack, role, joueur, avatar, compte, onRetour }) {
  const T = pack.theme;
  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <GlyphePack pack={pack} size={40} fond={T.fond} />
        <div>
          <div className="text-2xl font-bold text-white tracking-wide leading-tight">
            {pack.nom}
          </div>
          <div className="text-xs tracking-widest" style={{ color: "#a1a1aa" }}>{pack.sousTitre || ""}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* V0.67 — le retour au hub vit dans l'entête quand la page le veut */}
        {onRetour && (
          <button onClick={onRetour} className="px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: "#a8adb814", color: "#a8adb8", border: "1px solid #27272a", cursor: "pointer" }}>
            ⌂ HUB
          </button>
        )}
        {/* V0.51 — l'icône du joueur, SEULE (le halo dit le rôle) ; le clic
            ouvre le cadre COMPTE — CLOUD, comme dans le hub. */}
        {joueur && avatar && compte ? compte : (
          <GlyphePack pack={pack} size={40} fond={T.fond} />
        )}
      </div>
    </header>
  );
}

