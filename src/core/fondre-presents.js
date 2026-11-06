/* ── V48.4 — LA FUSION DE LA RONDE DES PRÉSENTS (pure) ──
   Un diff de présence du protocole Phoenix porte, pour une MÊME clé,
   le neuf (joins : le méta re-pisté) ET le départ de l'ancien méta
   (leaves) quand un joueur CHANGE DE PLACE (hub ↔ pack : l'app
   re-piste sans re-joindre). La sortie ne compte donc que si la clé
   n'est PAS revenue dans le même diff — sinon le delete écrasait le
   join et le joueur s'évanouissait de CONNECTÉS à chaque déplacement.
   Les fantômes sans pseudo (canal de l'institution) restent dehors. */
const fondrePresents = (precedent, diff) => {
  const suivant = { ...(precedent || {}) };
  const d = (diff && typeof diff === "object") ? diff : {};
  const arrives = d.joins || {};
  Object.keys(arrives).forEach(cle => {
    const m = (arrives[cle] && arrives[cle].metas && arrives[cle].metas[0]) || null;
    if (m && m.pseudo) suivant[cle] = m; else delete suivant[cle];
  });
  const partis = d.leaves || {};
  Object.keys(partis).forEach(cle => { if (!(cle in arrives)) delete suivant[cle]; });
  return suivant;
};

