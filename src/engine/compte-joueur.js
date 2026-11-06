function CompteJoueur({ joueur, avatar, onAvatar, mobile, ouvert, onOuvert, onLogout, halo = null, avatarSeul = false }) {
  return (
    <div className="relative">
      {/* En navigateur (PC) : avatar + pseudo, comme sur Steam. En mobile : avatar seul. */}
      <button
        onClick={onOuvert}
        className="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 transition-colors"
        style={{ background: ouvert ? "#ffffff0d" : "transparent" }}
        title="Compte joueur"
      >
        <Avatar a={avatar} size={40} halo={halo} />
        {!mobile && !avatarSeul && (
          <div className="text-left leading-tight">
            <div className="font-bold text-white text-sm">{joueur.pseudo}</div>
            <div className="text-xs flex items-center gap-1" style={{ color: "#a8adb8" }}>
              <span style={{ fontSize: 8 }}>●</span> en ligne
            </div>
          </div>
        )}
      </button>

      {ouvert && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl p-4 z-50 shadow-2xl"
          style={{ background: "#14161b", border: "1px solid #a8adb844" }}>
          <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#71717a" }}>{CLOUD ? "COMPTE — CLOUD" : "COMPTE — SIMULATION"}</div>
          <div className="flex items-center gap-3 mb-4">
            <Avatar a={avatar} size={52} selectionne />
            <div>
              <div className="flex items-center gap-2">
                <div className="font-bold text-white">{joueur.pseudo}</div>
                <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                  style={{ background: "#2ee6c922", color: "#2ee6c9" }}>
                  JOUEUR
                </span>
              </div>
              <div className="text-xs" style={{ color: "#71717a" }}>compte #{joueur.compteId.slice(0, 8)} · {joueur.tag} · compte cloud · en ligne</div>
            </div>
          </div>
          <div className="text-xs font-bold mb-2" style={{ color: "#c8c8ce" }}>Image de compte — choisie dans la liste :</div>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map(a => (
              <button key={a.id} onClick={() => onAvatar(a.id)} title={a.label}
                className="transition-transform"
                style={{ transform: a.id === avatar.id ? "scale(1.12)" : "none" }}>
                <Avatar a={a} size={38} selectionne={a.id === avatar.id} />
              </button>
            ))}
          </div>
          <div className="text-xs mt-4" style={{ color: "#71717a" }}>
            Dans le vrai launcher : le joueur choisit une petite image dans une liste du profil —
            elle s'affiche à côté de son nom sur PC, seule sur mobile.
          </div>
          <button onClick={onLogout} className="w-full mt-4 py-1.5 rounded-lg font-bold text-xs"
            style={{ border: "1px solid #71717a55", color: "#c8c8ce" }}>
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}


/* ══════════ La création de compte — pseudo + email + image, UUID gravé ══════════ */
