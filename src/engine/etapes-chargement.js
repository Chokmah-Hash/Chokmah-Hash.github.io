/* Les étapes de chargement — génériques, tirées du sac (plus aucun id en dur) */
function etapesChargement(p, role) {
  const roleTxt = `rôle de session : ${role === "mj" ? "MAÎTRE DU JEU — zone ambre" : "JOUEUR — zone teal"}`;
  const C = chargerPack(p).contenu;
  return [
    `installation vérifiée — ${p.nom} présent dans la bibliothèque locale`,
    `manifeste.json lu — ${p.id} v${p.version} (type ${p.type})`,
    `dépendance résolue : ${p.depend_de.map(d => d.id + "@" + d.format_min).join(", ") || "aucune"} — primitive ${C.primitive}`,
    roleTxt,
    `surcharges appliquées : ${C.surcharges.join(" · ")}`,
    `thème « ${p.theme.nom} » appliqué — palette du pack`,
    "pack prêt."
  ];
}

/* ── Les comptes — Supabase Auth (email + mot de passe), réels ──
   Tous les comptes sont JOUEURS — le rôle MJ/joueur se choisit au lancement
   du pack. Le compte_id est un UUID stable gravé à la création par le serveur ;
   l'email est l'identité serveur (unique, jamais affichée publiquement). Le mot
   de passe ne vit JAMAIS ici : vérification déléguée à Supabase Auth
   (l'Archiviste ne garde jamais les mots de passe). */
/* ── Palette « Zinc d'Archiviste » — thème NEUTRE du chrome du launcher ──
   fond #0c0d10 · panneaux #14161b · bordures #27272a · accent zinc #a8adb8.
   Le launcher est une vitrine : les couleurs appartiennent aux packs.
   Teal #2ee6c9 = exclusive du pack PÉ · ambre #f0b24a = rôle MJ + Archivisterium. */

/* ══════════ Le thème du scrolling — la barre parle la couleur de l'écran ══════════
   Doctrine : le launcher est une vitrine. Le chrome défile en Zinc
   d'Archiviste ; dès qu'un pack prend l'écran (chargement, partie, pack),
   la barre se repeint à SA couleur — teal nécroderme, violet des Jeunes
   Royaumes, rouge de Tanæphis — puis rend le zinc au hub. Trois variables
   CSS portent la vérité sur <html>, repeintes par l'effet de App :
   --scroll-pouce (le curseur) · --scroll-glace (le rail) · --scroll-or
   (le curseur survolé, la teinte « or » du pack). Le style se pose UNE
   fois au niveau script : il vit dans le canvas ET la page construite,
   simulation comprise. navigateurs : scrollbar-color (standard,
   Firefox + Chrome récents) + ::-webkit-scrollbar (les autres). */
(function themeScroll() {
  if (typeof document === "undefined" || !document.head || !document.createElement) return;
  if (document.getElementById("theme-scroll")) return; /* la balise existe déjà : on ne double pas la pose */
  var s = document.createElement("style");
  s.id = "theme-scroll";
  s.textContent =
    ":root{--scroll-pouce:#a8adb8;--scroll-glace:#1c1c22;--scroll-or:#e8e4d8}" +
    "html{scrollbar-width:thin;scrollbar-color:var(--scroll-pouce) var(--scroll-glace)}" +
    "::-webkit-scrollbar{width:10px;height:10px}" +
    "::-webkit-scrollbar-track{background:var(--scroll-glace)}" +
    "::-webkit-scrollbar-thumb{background:var(--scroll-pouce);border-radius:5px;border:2px solid var(--scroll-glace)}" +
    "::-webkit-scrollbar-thumb:hover{background:var(--scroll-or)}" +
    "::-webkit-scrollbar-corner{background:var(--scroll-glace)}";
  document.head.appendChild(s);
})();

