/* ══════════ Connexion — écran réel : email + mot de passe (Supabase Auth) ══════════
   L'Archiviste ne garde jamais les mots de passe — la vérification est
   DÉLÉGUÉE à Supabase Auth. « Mot de passe perdu » = lien magique par email
   (réinitialisation gérée par Supabase). */
function AuthModal({ onLogin, onCreer, onFermer }) {
  const [mode, setMode] = useState("login"); // login | perdu | envoye
  const [enCreation, setEnCreation] = useState(false);
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [erreur, setErreur] = useState(null);
  const [enVerif, setEnVerif] = useState(false);
  const [perduEmail, setPerduEmail] = useState("");
  const champ = { background: "#0c0d10", border: "1px solid #3f3f46", color: "#e8e4d8", outline: "none" };

  const tenter = async () => {
    if (!email.trim() || mdp.length < 4) { setErreur("Email et mot de passe requis (4 caractères min.)"); return; }
    if (!CLOUD) { setErreur("Le nuage est injoignable — rechargez la page."); return; }
    setEnVerif(true); setErreur(null);
    try {
      onLogin(await CLOUD.connexion(email.trim().toLowerCase(), mdp));
    } catch (e) {
      setErreur(e && e.message ? e.message : "Serveur injoignable — vérifiez votre connexion.");
    }
    setEnVerif(false);
  };

  const envoyerLien = async () => {
    if (!perduEmail.trim() || enVerif) return;
    if (CLOUD) {
      setEnVerif(true); setErreur(null);
      try { await CLOUD.perdu(perduEmail.trim().toLowerCase()); }
      catch (e) {
        setErreur(e && e.message ? e.message : "Serveur injoignable — vérifiez votre connexion.");
        setEnVerif(false);
        return;
      }
      setEnVerif(false);
    }
    setMode("envoye");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4" style={{ background: "#000000b3" }}>
      <style>{`@keyframes glisseHaut { from { transform: translateY(-110%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
      <div className="rounded-2xl p-6 w-full max-w-sm mt-10"
        style={{ background: "#14161b", border: "1px solid #a8adb844", animation: "glisseHaut 280ms ease-out", fontFamily: "'Rajdhani','Segoe UI',system-ui,sans-serif" }}>

        {mode === "login" && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="font-bold text-lg" style={{ color: "#e8e4d8" }}>Connexion</div>
              <button onClick={onFermer} className="text-xl px-2" style={{ color: "#71717a" }}>✕</button>
            </div>
            <div className="text-xs mb-4" style={{ color: "#71717a" }}>
              Tous les comptes sont joueurs — le rôle MJ se choisit au lancement d'un pack.
            </div>

            <div className="text-xs font-bold mb-1" style={{ color: "#c8c8ce" }}>Email :</div>
            <input value={email} onChange={e => { setEmail(e.target.value); setErreur(null); }}
              placeholder="vous@exemple.fr" type="email"
              className="w-full rounded-lg px-3 py-2 mb-3 text-sm" style={champ} />

            <div className="text-xs font-bold mb-1" style={{ color: "#c8c8ce" }}>Mot de passe :</div>
            <input value={mdp} onChange={e => { setMdp(e.target.value); setErreur(null); }}
              placeholder="••••••••" type="password"
              className="w-full rounded-lg px-3 py-2 mb-2 text-sm" style={champ} />
            <div className="text-xs mb-3" style={{ color: erreur ? "#fb7185" : "#52525b" }}>
              {erreur || "\u00a0"}
            </div>

            <button onClick={tenter} disabled={enVerif}
              className="w-full py-2.5 rounded-lg font-bold text-sm text-black"
              style={{ background: enVerif ? "#52525b" : "#a8adb8" }}>
              {enVerif ? "Vérification auprès du serveur…" : "Se connecter"}
            </button>

            <div className="flex justify-between mt-3 text-xs font-bold">
              <button onClick={() => { setPerduEmail(email); setErreur(null); setMode("perdu"); }}
                style={{ color: "#71717a" }}>Mot de passe perdu ?</button>
              <button onClick={() => setEnCreation(true)} style={{ color: "#a8adb8" }}>＋ Créer un compte</button>
            </div>

            <div className="text-xs mt-4 text-center" style={{ color: "#52525b" }}>
              Comptes vérifiés par Supabase Auth — l'Archiviste ne garde jamais les mots de passe.
            </div>
          </div>
        )}

        {mode === "perdu" && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="font-bold text-lg" style={{ color: "#e8e4d8" }}>Mot de passe perdu</div>
              <button onClick={() => setMode("login")} className="text-xl px-2" style={{ color: "#71717a" }}>✕</button>
            </div>
            <div className="text-xs mb-4" style={{ color: "#71717a" }}>
              Un lien magique vous est envoyé par email — pas de question secrète sur votre ville natale.
            </div>
            <div className="text-xs font-bold mb-1" style={{ color: "#c8c8ce" }}>Votre email :</div>
            <input value={perduEmail} onChange={e => setPerduEmail(e.target.value)} type="email"
              placeholder="vous@exemple.fr"
              className="w-full rounded-lg px-3 py-2 mb-4 text-sm" style={champ} />
            <button onClick={envoyerLien}
              disabled={!perduEmail.trim() || enVerif}
              className="w-full py-2.5 rounded-lg font-bold text-sm text-black"
              style={{ background: perduEmail.trim() && !enVerif ? "#a8adb8" : "#52525b" }}>
              {enVerif ? "Envoi…" : "Envoyer le lien magique"}
            </button>
            {erreur && (
              <div className="text-xs mt-3 text-center" style={{ color: "#fb7185" }}>{erreur}</div>
            )}
            <button onClick={() => setMode("login")} className="w-full mt-3 text-xs font-bold" style={{ color: "#71717a" }}>
              ← Retour à la connexion
            </button>
          </div>
        )}

        {mode === "envoye" && (
          <div>
            <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#71717a" }}>
              📧 EMAIL ENVOYÉ
            </div>
            <div className="rounded-xl p-4 text-left mb-4" style={{ background: "#ffffff08", border: "1px solid #27272a" }}>
              <div className="text-sm" style={{ color: "#c8c8ce" }}>
                Un lien de réinitialisation part vers <b>{perduEmail}</b> — vérifiez votre boîte (et vos spams),
                puis revenez choisir un nouveau mot de passe.
              </div>
              <button onClick={() => setMode("login")}
                className="mt-3 px-4 py-2 rounded-lg font-bold text-sm text-black" style={{ background: "#f0b24a" }}>
                ← Retour à la connexion
              </button>
            </div>
            <div className="text-xs text-center" style={{ color: "#52525b" }}>
              Lien envoyé et vérifié par Supabase Auth.
            </div>
          </div>
        )}
      </div>

      {enCreation && <EcranCreation onCreer={onCreer} onAnnuler={() => setEnCreation(false)} />}
    </div>
  );
}

