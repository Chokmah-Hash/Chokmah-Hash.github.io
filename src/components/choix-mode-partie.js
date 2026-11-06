/* ══════════ Le choix du MODE DE JEU au lancement d'un pack multijoueur ══════════
   MODE MJ : lobby + registre de ses aventures (créer, lancer, reprendre).
   MODE JOUEUR : lobby + registre de ses personnages + règles du pack.
   Le rôle réel en partie reste dérivé : le créateur d'une aventure en est le MJ. */
function ChoixModePartie({ pack, onChoisi, onAnnuler }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#000000b3" }}>
      <div className="rounded-2xl p-6 w-full max-w-md text-center"
        style={{ background: "#14161b", border: "1px solid #f0b24a44", fontFamily: "'Rajdhani','Segoe UI',system-ui,sans-serif" }}>
        <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#71717a" }}>
          LANCER — {pack.nom.toUpperCase()}
        </div>
        <div className="font-bold text-lg mb-1" style={{ color: "#e8e4d8" }}>Sous quel mode entrer ?</div>
        <div className="text-xs mb-5" style={{ color: "#71717a" }}>
          Le mode organise l'écran de partie — il ne fige rien : le créateur d'une aventure en reste le Maître du Jeu.
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onChoisi("mj")}
            className="rounded-xl p-4 flex flex-col items-center gap-2 transition-transform hover:scale-105"
            style={{ background: "#f0b24a14", border: "1px solid #f0b24a66" }}>
            <div className="text-3xl">🎭</div>
            <div className="font-bold" style={{ color: "#f0b24a" }}>MODE MJ</div>
            <div className="text-xs" style={{ color: "#a1a1aa" }}>Lobby + vos aventures : créez, lancez, dirigez</div>
          </button>
          <button onClick={() => onChoisi("joueur")}
            className="rounded-xl p-4 flex flex-col items-center gap-2 transition-transform hover:scale-105"
            style={{ background: "#2ee6c914", border: "1px solid #2ee6c955" }}>
            <div className="text-3xl">🛡️</div>
            <div className="font-bold" style={{ color: "#2ee6c9" }}>MODE JOUEUR</div>
            <div className="text-xs" style={{ color: "#a1a1aa" }}>Lobby + vos personnages + les règles</div>
          </button>
        </div>
        <button onClick={onAnnuler} className="mt-5 text-xs font-bold" style={{ color: "#71717a" }}>Annuler</button>
      </div>
    </div>
  );
}

