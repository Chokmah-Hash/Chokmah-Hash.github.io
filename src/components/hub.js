/* ══════════ Le hub : le magasin et la bibliothèque ══════════ */
function Hub({ packs, favoris, onFavori, onInstaller, onLancer, onDesinstaller, showToast, joueur, avatar, onAvatar, onLogout, onLogin, onCreer, mobile, ecran, setEcran, installes, enInstallation, symbole, versionBase }) {
  const [onglet, setOnglet] = useState("magasin");
  const [compteOuvert, setCompteOuvert] = useState(false);
  const [rootOuvert, setRootOuvert] = useState(false);
  const [authOuvert, setAuthOuvert] = useState(false);
  const packsInstalles = packs.filter(p => installes.includes(p.id));

  /* V48.3 — L'ÉPURE : l'onglet CONSOLE de test quitte le hub (la console
     DE PARTIE vit toujours repliée dans le pack — le canal reste). */
  const onglets = [
    ["magasin", "MAGASIN", packs.length],
    ["bibliotheque", "BIBLIOTHÈQUE", packsInstalles.length]
  ];

  return (
    <div className="min-h-screen flex flex-col text-zinc-200" style={{ background: "#0c0d10", fontFamily: "'Rajdhani','Segoe UI',system-ui,sans-serif" }}>
      <div className="max-w-4xl w-full mx-auto px-5 pt-8 pb-0 flex-1 flex flex-col">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {/* Le glyphe du hub : l'Icosaèdre D20 — CHOISI par Michael, désormais
               statique. (La Cible reste dans la bibliothèque de symboles de l'Archivisterium.) */}
            <div title="L'Icosaèdre D20 — glyphe de L'Archiviste">
              <Icosaedre size={44} color="#e8e4d8" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-wide leading-tight">
                L'ARCHIVISTE
              </div>
              <div className="text-xs tracking-widest" style={{ color: "#a1a1aa" }}>CUSTODES MEMORIAE</div>
            </div>
          </div>
          {joueur && avatar ? (
            <CompteJoueur
              joueur={joueur} avatar={avatar} onAvatar={onAvatar}
              mobile={mobile} ouvert={compteOuvert} onOuvert={() => setCompteOuvert(o => !o)}
              onLogout={onLogout}
            />
          ) : (
            <button onClick={() => setAuthOuvert(true)}
              className="px-4 py-2 rounded-lg font-bold text-sm text-black"
              style={{ background: "#a8adb8" }}>
              Identification
            </button>
          )}
        </header>

        {/* Onglets Magasin / Bibliothèque */}
        <div className="flex gap-1 mb-6" style={{ borderBottom: "1px solid #27272a" }}>
          {onglets.map(([id, lbl, n]) => (
            <button key={id} onClick={() => { setOnglet(id); setCompteOuvert(false); }}
              className="px-4 py-2 text-sm font-bold tracking-wider"
              style={{
                background: onglet === id ? "#a8adb814" : "transparent",
                color: onglet === id ? "#a8adb8" : "#71717a",
                borderBottom: onglet === id ? "2px solid #a8adb8" : "2px solid transparent",
                marginBottom: -1
              }}>
              {lbl} <span style={{ opacity: 0.7 }}>({n})</span>
            </button>
          ))}
        </div>

        {onglet === "magasin" && (
          <div className="grid md:grid-cols-2 gap-4">
            {packs.map(p => (
              <Vignette
                key={p.id}
                pack={p}
                favori={favoris.includes(p.id)}
                onFavori={onFavori}
                onInstaller={onInstaller}
                showToast={showToast}
                contexte="magasin"
                installe={installes.includes(p.id)}
                enInstallation={enInstallation === p.id}
                connecte={!!joueur}
              />
            ))}
          </div>
        )}

        {onglet === "bibliotheque" && (
          packsInstalles.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 p-4 text-sm" style={{ color: "#71717a" }}>
              Vide — installez un pack depuis le magasin (⬇ Installer), puis lancez-le ici.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {packsInstalles.map(p => (
                <Vignette key={p.id} pack={p} favori={favoris.includes(p.id)} onFavori={onFavori}
                  onLancer={onLancer} onDesinstaller={onDesinstaller} showToast={showToast} contexte="bibliotheque" />
              ))}
            </div>
          )
        )}

        {rootOuvert && <RootConsole packs={packs} symbole={symbole} onFermer={() => setRootOuvert(false)} />}

        {authOuvert && (
          <AuthModal
            onLogin={(p) => { onLogin(p); setAuthOuvert(false); }}
            onCreer={(d) => { onCreer(d); setAuthOuvert(false); }}
            onFermer={() => setAuthOuvert(false)} />
        )}

        <PiedVibe versionBase={versionBase} />
      </div>
    </div>
  );
}

