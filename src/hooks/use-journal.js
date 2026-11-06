/* ══════════ Le journal d100 (append-only, comme le noyau-40k) ══════════ */
function useJournal(onJournal) {
  const [journal, setJournal] = useState([]);
  const evId = useRef(1);
  const heure = () => new Date().toLocaleTimeString("fr-FR", { hour12: false });
  const log = (type, texte) => {
    setJournal(j => [...j, { id: evId.current++, quand: heure(), type, texte }]);
    onJournal && onJournal(type, texte); /* V3 : gravé aussi dans la Console Globale */
  };
  const corrigerDernier = () => {
    setJournal(j => {
      const dernier = j[j.length - 1];
      if (!dernier) return j;
      return [
        ...j.map(e => (e.id === dernier.id ? { ...e, annule: true } : e)),
        { id: evId.current++, quand: heure(), type: "journal.correction",
          texte: `Écriture compensatoire : annule l'événement #${dernier.id} (« ${dernier.texte.slice(0, 60)}${dernier.texte.length > 60 ? "…" : ""} ») — motif : démonstration append-only` }
      ];
    });
  };
  return { journal, log, corrigerDernier };
}

