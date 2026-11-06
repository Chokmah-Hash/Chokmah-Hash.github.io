/* §SECTION:UI§ — le chrome du launcher : compte, hub, modales, pied */
function EcranCreation({ onCreer, onAnnuler }) {
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [avatarId, setAvatarId] = useState("crane");
  const pret = pseudo.trim() && email.trim().includes("@") && mdp.length >= 4;
  const [enCours, setEnCours] = useState(false);
  const [erreurCreation, setErreurCreation] = useState(null);
  const creer = async () => {
    if (!pret || enCours) return;
    if (!CLOUD) { setErreurCreation("Le nuage est injoignable — rechargez la page."); return; }
    setEnCours(true); setErreurCreation(null);
    try {
      onCreer(await CLOUD.inscription(pseudo.trim(), email.trim().toLowerCase(), mdp, avatarId));
    } catch (e) {
      setErreurCreation(e && e.message ? e.message : "Serveur injoignable — vérifiez votre connexion.");
    }
    setEnCours(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#000000b3" }}>
      <div className="rounded-2xl p-5 w-full max-w-sm"
        style={{ background: "#14161b", border: "1px solid #a8adb844", fontFamily: "'Rajdhani','Segoe UI',system-ui,sans-serif" }}>
        <div className="font-bold text-lg mb-1" style={{ color: "#e8e4d8" }}>＋ Créer un compte</div>
        <div className="text-xs mb-4" style={{ color: "#71717a" }}>
          Un UUID de compte est généré par le serveur à la création — il restera stable pour toujours.
        </div>

        <div className="text-xs font-bold mb-1" style={{ color: "#c8c8ce" }}>Pseudo :</div>
        <input value={pseudo} onChange={e => setPseudo(e.target.value)} placeholder="Ex. : Vétéran de la Tombe"
          className="w-full rounded-lg px-3 py-2 mb-3 text-sm"
          style={{ background: "#0c0d10", border: "1px solid #3f3f46", color: "#e8e4d8", outline: "none" }} />

        <div className="text-xs font-bold mb-1" style={{ color: "#c8c8ce" }}>Email :</div>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.fr" type="email"
          className="w-full rounded-lg px-3 py-2 mb-3 text-sm"
          style={{ background: "#0c0d10", border: "1px solid #3f3f46", color: "#e8e4d8", outline: "none" }} />

        <div className="text-xs font-bold mb-1" style={{ color: "#c8c8ce" }}>Mot de passe :</div>
        <input value={mdp} onChange={e => setMdp(e.target.value)} placeholder="4 caractères minimum" type="password"
          className="w-full rounded-lg px-3 py-2 mb-3 text-sm"
          style={{ background: "#0c0d10", border: "1px solid #3f3f46", color: "#e8e4d8", outline: "none" }} />
        <div className="text-xs mb-3" style={{ color: "#52525b" }}>
          Ce mot de passe part chez Supabase Auth — l'Archiviste ne le garde jamais.
        </div>

        <div className="text-xs font-bold mb-2" style={{ color: "#c8c8ce" }}>Image de compte :</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {AVATARS.map(a => (
            <button key={a.id} onClick={() => setAvatarId(a.id)} title={a.label}
              className="transition-transform" style={{ transform: a.id === avatarId ? "scale(1.12)" : "none" }}>
              <Avatar a={a} size={38} selectionne={a.id === avatarId} />
            </button>
          ))}
        </div>

        <div className="text-xs mb-5" style={{ color: "#71717a" }}>
          Tous les comptes sont joueurs — le rôle MJ se choisit plus tard, au lancement du pack.
        </div>

        <div className="flex gap-2">
          <button onClick={onAnnuler} className="flex-1 py-2 rounded-lg font-bold text-sm"
            style={{ border: "1px solid #3f3f46", color: "#71717a" }}>Annuler</button>
          <button onClick={creer}
            disabled={!pret || enCours}
            className="flex-1 py-2 rounded-lg font-bold text-sm text-black"
            style={{ background: pret && !enCours ? "#a8adb8" : "#52525b" }}>
            {enCours ? "Création…" : "Créer et entrer"}
          </button>
        </div>
        {erreurCreation && (
          <div className="text-xs mt-3 text-center" style={{ color: "#fb7185" }}>{erreurCreation}</div>
        )}
        <div className="text-xs mt-3 text-center" style={{ color: "#52525b" }}>
          {CLOUD
            ? "Le mot de passe part directement chez Supabase Auth — l'Archiviste ne le garde jamais ici."
            : "Simulation : le mot de passe n'est pas vérifié localement — il ne quitte pas ce champ (décor honnête)."}
        </div>
      </div>
    </div>
  );
}

