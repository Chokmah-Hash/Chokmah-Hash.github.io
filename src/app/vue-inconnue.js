function VueInconnue({ pack, onRetour }) {
  const T = pack.theme || { fond: "#0c0d10", accent: "#a8adb8", or: "#f0b24a" };
  const dep = pack.depend_de && pack.depend_de[0];
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: T.fond, fontFamily: "'Rajdhani','Segoe UI',system-ui,sans-serif" }}>
      <div className="rounded-2xl p-8 max-w-md text-center" style={{ background: "#ffffff08", border: "1px solid " + T.accent + "44" }}>
        <div className="text-3xl mb-3">⚠</div>
        <div className="font-bold text-lg mb-2" style={{ color: "#e8e4d8" }}>{pack.nom} — pack refusé</div>
        <div className="text-sm mb-4" style={{ color: "#c8c8ce" }}>
          {dep
            ? `Le launcher ne connaît pas le noyau « ${dep.id} » ou son contenu (dépendance non résolue) — ${pack.id} v${pack.version}.`
            : "Ce pack ne déclare aucune dépendance de noyau."}
        </div>
        <button onClick={onRetour} className="px-4 py-2 rounded-lg font-bold text-black" style={{ background: T.accent }}>
          ← Retour au magasin
        </button>
      </div>
    </div>
  );
}

