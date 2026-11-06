/* ══════════ V48.6 — LE PIED VIBE : « Powered by Vibe · N° 0.XX »
   Le pied du hub vit aussi dans l'espace MJ/Joueur d'un JDR : l'état
   de la base (parametre « version_launcher ») reste la vérité affichée,
   tout écart du code s'affiche entre parenthèses. ── */
function PiedVibe({ versionBase }) {
  return (
    <footer className="mt-auto text-center text-xs" style={{ color: "#52525b", padding: "5px 0" }}>
      Powered by <a href="https://chat.mistral.ai" target="_blank" rel="noopener noreferrer" style={{ color: "#a8adb8" }}>Vibe</a> · N° {versionBase || BUILD}{versionBase && versionBase !== BUILD ? " (code " + BUILD + ")" : ""}
    </footer>
  );
}

