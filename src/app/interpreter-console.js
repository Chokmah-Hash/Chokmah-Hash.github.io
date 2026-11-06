/* ── L'interprète de la Console : les commandes deviennent des événements typés ──
   /de XdY : le jet gravé (ex. /de 3d6 → jets + total dans « donnees ») ;
   /tour X : l'annonce du tour, rendue en bandeau ;
   tout le reste : parole libre V1. Depuis la V3, /de ne roule plus ici :
   la demande part à la Tombe (rpc lancer_des) qui roule, signe et grave —
   le client ne choisit plus son jet. */
function interpreterConsole(texte) {
  const t = (texte || "").trim();
  const mDe = t.match(/^\/de\s+(\d{0,2})d(\d{1,3})$/i);
  if (mDe) {
    const n = Math.min(Math.max(parseInt(mDe[1] || "1", 10) || 1, 1), 12);
    const faces = Math.min(Math.max(parseInt(mDe[2], 10) || 6, 2), 100);
    return { des: { nb: n, faces: faces } }; /* V3 : la demande part à la Tombe — elle roule et grave elle-même */
  }
  const mTour = t.match(/^\/tour\s+(.{1,40})$/i);
  if (mTour) return { contenu: mTour[1].trim(), type: "tour", donnees: {} };
  return { contenu: t, type: "message", donnees: {} };
}

