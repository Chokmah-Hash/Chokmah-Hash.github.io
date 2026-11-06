/* ══════════ V0.41 — LE SALON D'UN JDR : le petit chat du lobby.
   Chaque JDR a SON salon (canal jeu de la Console) — les joueurs
   des Protocoles Éternels y parlent entre eux, sans le brouhaha du
   fil global ni le secret du canal de partie. V0.38 : plus de
   filtre — les paroles et le journal vivent ENSEMBLE (les dés
   restent à la table). V0.41 : LE SALON ENCRÉ — quand le lobby
   l'exige (remplir), le cadre S'ANCRE EN BAS DE PAGE et la scroll
   bar vit dans son propre cadre ; le cadre CONNECTÉS vit
   désormais REPLIÉ derrière le petit bouton de la ligne du
   titre — un clic le fait paraître en flottant, un autre le
   chasse. Le rendu des lignes reste celui de LA Console
   (LigneConsole) — une seule langue pour tous les fils. ══════════ */
function ChatSalon({ titre, fil, onEnvoyer, joueur, enEnvoi, presents, remplir, accent }) {
  const [texte, setTexte] = useState("");
  const [presentsOuverts, setPresentsOuverts] = useState(false);
  const envoyer = () => {
    const t = texte.trim();
    if (!t || !joueur) return;
    onEnvoyer(t);
    setTexte("");
  };
  return (
    <div className={"rounded-xl flex flex-col" + (remplir ? " flex-1" : "")}
      style={remplir
        ? { background: "#14161b", border: "1px solid " + (accent ? accent + "33" : "#27272a"), flex: "1 1 0%", minHeight: 0, display: "flex", flexDirection: "column" }
        : { background: "#14161b", border: "1px solid " + (accent ? accent + "33" : "#27272a") }}>
      <div className="flex items-center gap-2 flex-wrap px-3 pt-3 pb-2 relative">
        <div className="text-xs font-bold tracking-widest" style={{ color: accent || "#a8adb8" }}>{titre || "SALON"}</div>
        {/* V0.41 — LE SIFFLET DES PRÉSENTS : le cadre CONNECTÉS vit
            ici désormais, replié derrière un petit bouton texte — le
            lobby gagne de l'air, la ronde reste à portée de clic. */}
        <button onClick={() => setPresentsOuverts(o => !o)}
          className="ml-auto px-2 py-0.5 rounded text-xs font-bold"
          style={{ background: presentsOuverts ? "#a8adb822" : "#a8adb810", color: "#c8c8ce", border: "1px solid #27272a", cursor: "pointer" }}
          title="Les connectés de ce JDR">
          CONNECTÉS
        </button>
        {presentsOuverts && (
          <div className="rounded-lg p-3"
            style={{ background: "#14161b", border: "1px solid #3f3f46", boxShadow: "0 12px 32px #000000cc", minWidth: 200, position: "absolute", right: 8, top: "100%", marginTop: 4, zIndex: 20 }}>
            <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#a8adb8" }}>CONNECTÉS ({(presents || []).length})</div>
            {(presents || []).length === 0 ? (
              <div className="text-xs py-2" style={{ color: "#52525b" }}>Personne dans ce JDR pour l'instant.</div>
            ) : (
              <div className="flex flex-col gap-1">
                {(presents || []).map(j => (
                  <div key={j.compte_id} className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{ background: "#a8adb810", color: "#c8c8ce" }}>
                    <span className="rounded-full" style={{ width: 6, height: 6, background: "#2ee6c9", display: "inline-block" }} />
                    <span className="text-xs font-bold">{j.pseudo}{j.compte_id === (joueur && joueur.compteId) ? " (vous)" : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="px-3 pb-1 overflow-y-auto" style={remplir ? { flex: "1 1 0%", minHeight: 0, overflowY: "auto" } : { height: "45vh" }}>
        {(fil || []).length === 0 ? (
          <div className="text-xs py-3 text-center" style={{ color: "#52525b" }}>
            Aucun message — le salon attend la première parole.
          </div>
        ) : (
          fil.map(e => <LigneConsole key={e.id} e={e} />)
        )}
      </div>
      <div className="flex gap-1 items-center px-2 py-2" style={{ borderTop: "1px solid #27272a" }}>
        {joueur ? (
          <>
            <input value={texte} onChange={(e) => setTexte(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") envoyer(); }}
              className="flex-1 px-2 py-1 rounded text-xs"
              style={{ background: "#0c0d10", border: "1px solid #3f3f46", color: "#e8e4d8", outline: "none" }}
              placeholder={"Parler dans le salon de " + (titre || "ce JDR") + " (280 caractères max)"}
              maxLength={280} />
            <button onClick={envoyer} disabled={enEnvoi || !texte.trim()}
              className="px-3 py-1 rounded text-xs font-bold"
              style={{
                background: texte.trim() ? "#a8adb8" : "#a8adb822",
                color: texte.trim() ? "#0c0d10" : "#71717a",
                cursor: texte.trim() ? "pointer" : "default"
              }}>
              ↵
            </button>
          </>
        ) : (
          <div className="text-xs py-1" style={{ color: "#52525b" }}>
            Connectez-vous pour parler dans le salon — le fil se lit déjà.
          </div>
        )}
      </div>
    </div>
  );
}


