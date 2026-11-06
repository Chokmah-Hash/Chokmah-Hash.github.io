/* ══════════ Le choix de rôle au LANCEMENT d'un pack — Steam-like ══════════
   Le compte est joueur ; le rôle (MJ ou joueur) se choisit pack par pack,
   au moment de LANCER le pack depuis la bibliothèque — pas à l'installation.
   MJ = zone ambre, joueur = zone teal. */
function ChoixRole({ pack, onChoisi, onAnnuler }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#000000b3" }}>
      <div className="rounded-2xl p-6 w-full max-w-md text-center"
        style={{ background: "#14161b", border: "1px solid #f0b24a44", fontFamily: "'Rajdhani','Segoe UI',system-ui,sans-serif" }}>
        <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#71717a" }}>
          LANCER — {pack.nom.toUpperCase()}
        </div>
        <div className="font-bold text-lg mb-1" style={{ color: "#e8e4d8" }}>Simple joueur, ou Maître du Jeu ?</div>
        <div className="text-xs mb-5" style={{ color: "#71717a" }}>
          Tous les comptes sont joueurs — le rôle se choisit ici, à chaque lancement du pack.
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onChoisi("mj")}
            className="rounded-xl p-4 flex flex-col items-center gap-2 transition-transform hover:scale-105"
            style={{ background: "#f0b24a14", border: "1px solid #f0b24a66" }}>
            <div className="text-3xl">🎭</div>
            <div className="font-bold" style={{ color: "#f0b24a" }}>MAÎTRE DU JEU</div>
            <div className="text-xs" style={{ color: "#a1a1aa" }}>dirige la séance — zone MJ (ambre)</div>
          </button>
          <button onClick={() => onChoisi("joueur")}
            className="rounded-xl p-4 flex flex-col items-center gap-2 transition-transform hover:scale-105"
            style={{ background: "#2ee6c914", border: "1px solid #2ee6c955" }}>
            <div className="text-3xl">🛡️</div>
            <div className="font-bold" style={{ color: "#2ee6c9" }}>JOUEUR</div>
            <div className="text-xs" style={{ color: "#a1a1aa" }}>vit l'aventure</div>
          </button>
        </div>
        <button onClick={onAnnuler} className="mt-5 text-xs font-bold" style={{ color: "#71717a" }}>Annuler</button>
      </div>
    </div>
  );
}

