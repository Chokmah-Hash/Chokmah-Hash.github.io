function ConsoleGlobale({ fil, onEnvoyer, joueur, enEnvoi }) {
  const [texte, setTexte] = useState("");
  const envoyer = () => {
    const t = texte.trim();
    if (!t || !joueur) return;
    onEnvoyer(t);
    setTexte("");
  };
  return (
    <div className="rounded-xl flex flex-col" style={{ background: "#14161b", border: "1px solid #27272a" }}>
      <div className="px-3 py-2 overflow-y-auto" style={{ maxHeight: "60vh" }}>
        {fil.length === 0 && (
          <div className="text-xs py-3 text-center" style={{ color: "#52525b" }}>
            Aucun message — la Console attend la première parole.
          </div>
        )}
        {fil.map(e => <LigneConsole key={e.id} e={e} />)}
      </div>
      <div className="flex gap-1 items-center px-2 py-2" style={{ borderTop: "1px solid #27272a" }}>
        {joueur ? (
          <>
            <input value={texte} onChange={(e) => setTexte(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") envoyer(); }}
              className="flex-1 px-2 py-1 rounded text-xs"
              style={{ background: "#0c0d10", border: "1px solid #3f3f46", color: "#e8e4d8", outline: "none" }}
              placeholder="Parler à la Console (280 caractères max)"
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
            Connectez-vous pour parler dans la Console — le fil se lit déjà.
          </div>
        )}
      </div>
      {/* Les dés rapides : un clic, un jet gravé — les commandes /de XdY et /tour X marchent aussi au clavier */}
      {joueur && (
        <div className="flex gap-1 flex-wrap items-center px-2 pb-2" style={{ borderTop: "1px solid #27272a" }}>
          {["d3", "d6", "d20", "d100"].map(d => (
            <button key={d} onClick={() => onEnvoyer("/de " + d)} disabled={enEnvoi}
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: "#a8adb814", color: "#a8adb8", border: "1px solid #27272a", cursor: "pointer" }}
              title={"Lancer un " + d + " — le jet se grave dans le fil"}>
              {d}
            </button>
          ))}
          <span className="text-xs pl-1" style={{ color: "#52525b" }}>commandes : /de 3d6 · /tour Prénom</span>
        </div>
      )}
    </div>
  );
}

