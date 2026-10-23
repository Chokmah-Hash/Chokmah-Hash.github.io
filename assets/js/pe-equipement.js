/* Les Protocoles Éternels — base équipement commune (fiches joueur + moteur MJ)
   PE_BUILD 2026.10.23-mot14w — source unique : armes, modules et châssis avec tailles T1-T4, modules système boosters, protocoles de campagne.
   Les stats des modules sont PROVISOIRES (validation en cours dans les règles maison). */
window.PE_EQUIP = (function () {
  "use strict";

  /* ===== Base armes (taille ajoutée) ===== */
  var ARMES_DB = [
    { id: "fusil",       nom: "Fusil magnétique",        taille: 2, portee: "48 m",  att: "1",   f: "5",   pa: "−1", d: "1",  regle: "Perforation", tir: true },
    { id: "canonmag",    nom: "Canon magnétique",        taille: 3, portee: "48 m",  att: "1",   f: "6",   pa: "−1", d: "1",  regle: "Perforation", tir: true },
    { id: "mitrailleur", nom: "Mitrailleur magnétique",  taille: 3, portee: "36 m",  att: "2",   f: "6",   pa: "−2", d: "1",  regle: "Perforation", tir: true },
    { id: "longuee",     nom: "Canon longue-portée",     taille: 4, portee: "72 m",  att: "1",   f: "7",   pa: "−2", d: "2",  regle: "Précis : ignore le couvert", tir: true },
    { id: "carabine",    nom: "Carabine à arcs",         taille: 2, portee: "28 m",  att: "2",   f: "5",   pa: "−1", d: "1",  regle: "Arc : critique = 1 dégât irréversible en plus", tir: true },
    { id: "batonnrj",    nom: "Bâton d'énergie",          taille: 1, portee: "24 m",  att: "1",   f: "5",   pa: "−2", d: "2",  regle: "Aussi utilisable en mêlée", tir: true },
    { id: "sceptretac",  nom: "Sceptre tactique",        taille: 2, portee: "18 m",  att: "1",   f: "6",   pa: "−1", d: "2",  regle: "Relance 1 au toucher, 1×/bataille", tir: true },
    { id: "pistolets",   nom: "Pistolets jumelés ×6",    taille: 1, portee: "12 m",  att: "3",   f: "5",   pa: "−2", d: "1",  regle: "Tir défensif sur un ennemi qui approche", tir: true },
    { id: "batonmel",    nom: "Bâton d'énergie (mêlée)", taille: 1, portee: "Mêlée", att: "A",   f: "F+1", pa: "−2", d: "2",  regle: "—", tir: false },
    { id: "lame",        nom: "Lame désagrégatrice",     taille: 1, portee: "Mêlée", att: "A",   f: "F+1", pa: "−3", d: "2",  regle: "—", tir: false },
    { id: "jumelles",    nom: "Lames jumelles (paire)",   taille: 1, portee: "Mêlée", att: "A+1", f: "F+1", pa: "−2", d: "2",  regle: "+1 A si deux lames", tir: false },
    { id: "faucheuse",   nom: "Faucheuse lourde",        taille: 3, portee: "Mêlée", att: "A",   f: "F+2", pa: "−4", d: "D3", regle: "Lourde : −1 à l'initiative", tir: false },
    { id: "grappins",    nom: "Grappins déchiqueteurs",  taille: 2, portee: "Mêlée", att: "A+1", f: "F+1", pa: "−2", d: "1",  regle: "Terreur : Cd −1 en face", tir: false },
    { id: "sceptreduel", nom: "Sceptre de duel",         taille: 2, portee: "Mêlée", att: "A",   f: "F+2", pa: "−3", d: "2",  regle: "Critique sur 5+ en duel", tir: false }
  ];

  /* ===== Base modules — stats provisoires ===== */
  var MODULES_DB = [
    { id: "chrono",     cat: "capteur",  nom: "Chronomètre",                taille: 1, desc: "+1 initiative et +2 m de déplacement" },
    { id: "opt",        cat: "capteur",  nom: "Optique de visée",           taille: 1, desc: "Relance 1 au toucher à 12 m ou moins" },
    { id: "scanner",    cat: "capteur",  nom: "Scanner de proximité",       taille: 2, desc: "Détecte les signaux à 30 m" },
    { id: "matriced",   cat: "capteur",  nom: "Matrice de détection",       taille: 3, desc: "Perce le furtif à 50 m" },
    { id: "coeurstd",   cat: "coeur",    nom: "Cœur à fusion standard",     taille: 2, desc: "Rendement nominal" },
    { id: "coeursup",   cat: "coeur",    nom: "Cœur à fusion renforcé",     taille: 3, desc: "+1 PV régénéré par protocole" },
    { id: "coeurste",   cat: "coeur",    nom: "Cœur stellaire",             taille: 4, desc: "Alimente une arme T4 sans malus" },
    { id: "noyaustd",   cat: "noyau",    nom: "Noyau de charge standard",    taille: 1, desc: "Autonomie de base" },
    { id: "noyauhaut",  cat: "noyau",    nom: "Noyau haute capacité",       taille: 2, desc: "+1 recharge de pouvoir par bataille" },
    { id: "ecranphase", cat: "bouclier", nom: "Écran de phase",             taille: 1, desc: "Sauvegarde invulnérable 4++" },
    { id: "blindage",   cat: "bouclier", nom: "Blindage entrelacé",         taille: 2, desc: "−1 dégât subi (minimum 1)" },
    { id: "blindagel",  cat: "bouclier", nom: "Blindage entrelacé renforcé", taille: 3, desc: "−2 dégâts subis" },
    /* — modules système (mot14w) : boostent les plafonds de la section Protocoles — */
    { id: "memext",     cat: "systeme",  nom: "Mémoire étendue",            taille: 2, desc: "+1 place mémoire — un protocole installable supplémentaire" },
    { id: "coproc",     cat: "systeme",  nom: "Coprocesseur",               taille: 2, desc: "+1 calcul — un protocole actif supplémentaire en parallèle" }
  ];

  /* ===== Châssis : stats complètes + emplacements (n = nombre, t = taille max) ===== */
  var CHASSIS_DB = [
    { id: "fantassin", nom: "Fantassin programmé",
      st: { m: "10 m", cc: "4+", ct: "4+", f: "4", e: "4", pv: "3", a: "1", cd: "7+", sv: "4+", rfx: "+0" , mem: "1", cal: "1" },
      apt: "Discipline sans faille : relancez 1 test de Commandement raté par scène.",
      comp: ["Athlétisme", "Technologie"],
      armes: { n: 1, t: 2 }, capteurs: { n: 1, t: 1 }, coeur: { t: 2 }, noyau: { t: 1 }, bouclier: { n: 1, t: 1 }, systeme: { n: 1, t: 2 } },
    { id: "veteran", nom: "Vétéran",
      st: { m: "10 m", cc: "3+", ct: "3+", f: "5", e: "5", pv: "3", a: "1", cd: "8+", sv: "3+", rfx: "+1" , mem: "1", cal: "1" },
      apt: "Élite : vos touches critiques (6 naturels) infligent +1 dégât.",
      comp: ["Athlétisme", "Perception"],
      armes: { n: 1, t: 3 }, capteurs: { n: 1, t: 2 }, coeur: { t: 2 }, noyau: { t: 1 }, bouclier: { n: 1, t: 2 }, systeme: { n: 1, t: 2 } },
    { id: "traqueur", nom: "Traqueur",
      st: { m: "10 m", cc: "3+", ct: "3+", f: "5", e: "5", pv: "3", a: "1", cd: "8+", sv: "3+", rfx: "+2" , mem: "2", cal: "1" },
      apt: "Embuscade : 1 fois par scène, apparaissez dans un rayon de 6 m de n'importe quelle position, même derrière l'ennemi (après 1 round de délai).",
      comp: ["Furtivité", "Perception", "Pilotage"],
      armes: { n: 1, t: 3 }, capteurs: { n: 2, t: 2 }, coeur: { t: 2 }, noyau: { t: 1 }, bouclier: { n: 0, t: 0 }, systeme: { n: 1, t: 2 } },
    { id: "ombre", nom: "Ombre",
      st: { m: "10 m", cc: "3+", ct: "6+", f: "5", e: "4", pv: "3", a: "3", cd: "8+", sv: "4+", rfx: "+2" , mem: "2", cal: "1" },
      apt: "Peau d'ombre : vos tests de Furtivité sont à 3+ ; les ennemis qui vous voient subissent −1 à leur Cd.",
      comp: ["Furtivité", "Intimidation"],
      armes: { n: 2, t: 2 }, capteurs: { n: 1, t: 2 }, coeur: { t: 2 }, noyau: { t: 1 }, bouclier: { n: 0, t: 0 }, systeme: { n: 1, t: 2 } },
    { id: "sentinelle", nom: "Sentinelle",
      st: { m: "10 m", cc: "3+", ct: "4+", f: "6", e: "5", pv: "6", a: "2", cd: "8+", sv: "3+", rfx: "+1" , mem: "1", cal: "1" },
      apt: "Écran : 1 fois par round, prenez une frappe destinée à un allié à 2 m ou moins (après sa sauvegarde).",
      comp: ["Athlétisme", "Intimidation"],
      armes: { n: 2, t: 4 }, capteurs: { n: 1, t: 2 }, coeur: { t: 3 }, noyau: { t: 2 }, bouclier: { n: 1, t: 3 }, systeme: { n: 1, t: 2 } },
    { id: "officier", nom: "Officier de garde",
      st: { m: "10 m", cc: "3+", ct: "3+", f: "5", e: "5", pv: "12", a: "3", cd: "8+", sv: "3+", rfx: "+1" , mem: "2", cal: "2" },
      apt: "Ordre de secours : 1 fois par scène, forcez un allié à relancer immédiatement son jet de Protocole de Secours.",
      comp: ["Commandement", "Technologie"],
      armes: { n: 2, t: 3 }, capteurs: { n: 1, t: 2 }, coeur: { t: 3 }, noyau: { t: 2 }, bouclier: { n: 1, t: 2 }, systeme: { n: 1, t: 2 } },
    { id: "artificier", nom: "Artificier",
      st: { m: "10 m", cc: "3+", ct: "3+", f: "4", e: "5", pv: "12", a: "2", cd: "8+", sv: "4+", rfx: "+1" , mem: "3", cal: "2" },
      apt: "Essaim réparateur : 1 fois par scène, soignez D3 PV d'un allié (ou de vous-même) à 6 m.",
      comp: ["Technologie", "Érudition", "Perception"],
      armes: { n: 2, t: 3 }, capteurs: { n: 2, t: 2 }, coeur: { t: 3 }, noyau: { t: 2 }, bouclier: { n: 1, t: 2 }, systeme: { n: 1, t: 2 } },
    { id: "energicien", nom: "Énergicien",
      st: { m: "10 m", cc: "3+", ct: "3+", f: "5", e: "5", pv: "12", a: "3", cd: "8+", sv: "4+", rfx: "+1" , mem: "3", cal: "2" },
      apt: "Décharge : 1 fois par scène, infligez une attaque F7, PA −2, D 2 à tous les ennemis dans un rayon de 3 m.",
      comp: ["Technologie", "Érudition"],
      armes: { n: 2, t: 3 }, capteurs: { n: 1, t: 2 }, coeur: { t: 4 }, noyau: { t: 3 }, bouclier: { n: 1, t: 2 }, systeme: { n: 1, t: 2 } },
    { id: "commandant", nom: "Commandant",
      st: { m: "10 m", cc: "3+", ct: "3+", f: "6", e: "6", pv: "15", a: "4", cd: "9+", sv: "3+", rfx: "+1" , mem: "4", cal: "2" },
      apt: "Aura de commandement : les alliés à 6 m relancent les jets de toucher de 1.",
      comp: ["Commandement", "Intimidation", "Érudition"],
      armes: { n: 2, t: 4 }, capteurs: { n: 2, t: 3 }, coeur: { t: 3 }, noyau: { t: 2 }, bouclier: { n: 1, t: 2 }, systeme: { n: 1, t: 2 } },
    { id: "seigneur", nom: "Seigneur de guerre",
      st: { m: "10 m", cc: "2+", ct: "2+", f: "6", e: "6", pv: "18", a: "5", cd: "10+", sv: "3+", rfx: "+1" , mem: "5", cal: "3" },
      apt: "Volonté inflexible : relancez 1 échec par round (n'importe quel jet).",
      comp: ["Commandement", "Érudition", "Intimidation", "Technologie"],
      armes: { n: 3, t: 4 }, capteurs: { n: 2, t: 3 }, coeur: { t: 4 }, noyau: { t: 3 }, bouclier: { n: 1, t: 3 }, systeme: { n: 1, t: 2 } }
  ];

  /* ===== Base protocoles (savoir du personnage) — le Protocole de Secours est inné, hors liste ===== */
  var PROTOCOLES_DB = [
    { id: "p-analyse",      nom: "Protocole d'Analyse",      desc: "1×/scène : lisez les Caractéristiques et les règles d'une cible à vue (Érudition 4+ si elle résiste)." },
    { id: "p-ciblage",      nom: "Protocole de Ciblage",     desc: "1×/bataille : une attaque à distance touche automatiquement — résolvez les dégâts normalement." },
    { id: "p-reparation",   nom: "Protocole de Réparation",  desc: "1×/scène : regagnez D3 PV." },
    { id: "p-interception", nom: "Protocole d'Interception", desc: "1×/round : un allié à 2 m relance sa sauvegarde ratée." },
    { id: "p-menace",       nom: "Protocole de Menace",      desc: "1×/scène : +1 F à vos attaques de mêlée jusqu'à la fin du round." },
    { id: "p-suppression",  nom: "Protocole de Suppression", desc: "1×/bataille : une attaque ignore la sauvegarde adverse." },
    { id: "p-occultation",  nom: "Protocole d'Occultation",  desc: "Passif : vos tests de Furtivité sont à 3+." },
    { id: "p-deflection",   nom: "Protocole de Déflection",   desc: "1×/scène : annulez une blessure qui vient de vous atteindre." },
    /* — protocoles de campagne (mot14w) : accordés par le MJ, noms neutres pour les joueuses — */
    { id: "p-conscience",    nom: "Protocole de Conscience",     desc: "Passif : personnalité indestructible — immunisée aux protocoles corrompus et aux virus · 1×/séance : communion des machines (Technologie 3+) · les autres machines sentent votre étrangeté." },
    { id: "p-nonsoumission", nom: "Protocole de Non-Soumission", desc: "Passif : aucun ordre ne peut forcer votre volonté — vous pouvez refuser toute directive, même d'une hiérarchie supérieure." }
  ];

  function protocoleDe(id) {
    for (var i = 0; i < PROTOCOLES_DB.length; i++) { if (PROTOCOLES_DB[i].id === id) return PROTOCOLES_DB[i]; }
    return null;
  }

  /* ===== Base spécialisations (vocation du personnage) — aptitude et/ou pouvoir spécifiques, s'additionnent au châssis ===== */
  var SPECIALISATIONS_DB = [
    { id: "s-archeoviste",  nom: "Archéoviste",
      apt: "Archives infinies : 1×/scène, relancez un test d'Érudition ou de Technologie.",
      pouvoir: "Acquisition : 1×/bataille, dupliquez l'arme d'un ennemi vaincu — elle rejoint votre inventaire." },
    { id: "s-chronomancien", nom: "Chronomancien",
      apt: "",
      pouvoir: "Précognition : 1×/scène, forcez un ennemi à relancer une attaque qui venait de réussir." },
    { id: "s-technomancien", nom: "Technomancien",
      apt: "Entretien perpétuel : 1×/scène, soignez D3 PV à un allié à 6 m (ou à vous-même).",
      pouvoir: "" },
    { id: "s-stratege",      nom: "Grand stratège",
      apt: "Regard tactique : les alliés à 6 m gagnent +1 Cd sur leurs tests de volonté.",
      pouvoir: "" },
    { id: "s-artisan",       nom: "Artisan d'élite",
      apt: "Main savante : vous ignorez les malus des armes lourdes ; 1×/scène, réparez D3 PV.",
      pouvoir: "" },
    { id: "s-chasseur",      nom: "Chasseur éternel",
      apt: "Œil de traque : relancez 1 test de Perception raté par scène.",
      pouvoir: "Marque de proie : 1×/bataille, vos attaques contre la cible marquée ignorent sa sauvegarde." },
    { id: "s-orateur",       nom: "Orateur dynastique",
      apt: "Voix de la dynastie : vos tests de Commandement sont à 3+.",
      pouvoir: "" },
    { id: "s-gardien",       nom: "Gardien du seuil",
      apt: "",
      pouvoir: "Verrouillé : 1×/scène, un allié à 2 m relance sa sauvegarde ratée." }
  ];

  function speDe(id) {
    for (var i = 0; i < SPECIALISATIONS_DB.length; i++) { if (SPECIALISATIONS_DB[i].id === id) return SPECIALISATIONS_DB[i]; }
    return null;
  }

  var CATS = {
    arme: "Arme",
    capteur: "Capteur",
    coeur: "Cœur énergétique",
    noyau: "Noyau énergétique",
    bouclier: "Bouclier",
    systeme: "Système logique",
    objet: "Objet"
  };

  function armeDe(id) { for (var i = 0; i < ARMES_DB.length; i++) { if (ARMES_DB[i].id === id) { return ARMES_DB[i]; } } return null; }
  function armeParNom(n) { for (var i = 0; i < ARMES_DB.length; i++) { if (ARMES_DB[i].nom === n) { return ARMES_DB[i]; } } return null; }
  function moduleDe(id) { for (var i = 0; i < MODULES_DB.length; i++) { if (MODULES_DB[i].id === id) { return MODULES_DB[i]; } } return null; }
  function moduleParNom(n) { for (var i = 0; i < MODULES_DB.length; i++) { if (MODULES_DB[i].nom === n) { return MODULES_DB[i]; } } return null; }
  function chassiDe(id) { for (var i = 0; i < CHASSIS_DB.length; i++) { if (CHASSIS_DB[i].id === id) { return CHASSIS_DB[i]; } } return null; }
  function chassiParNom(n) { for (var i = 0; i < CHASSIS_DB.length; i++) { if (CHASSIS_DB[i].nom === n) { return CHASSIS_DB[i]; } } return null; }

  function T(n) { return "T" + n; }

  /* Règle d'équipement validée en simulation — d = données du perso
     { chassis: id, armes: [ids], modules: { capteurs: [ids], coeur: id|null, noyau: id|null, bouclier: id|null } } */
  function peutEquiper(d, it) {
    var ch = chassiDe(d && d.chassis);
    if (!ch) { return { ok: false, raison: "châssis inconnu" }; }
    if (it.kind === "arme") {
      var a = armeDe(it.id);
      if (!a) { return { ok: false, raison: "arme inconnue" }; }
      if ((d.armes || []).length >= ch.armes.n) { return { ok: false, raison: "plus d'emplacement d'arme (" + ch.armes.n + "/" + ch.armes.n + ")" }; }
      if (a.taille > ch.armes.t) { return { ok: false, raison: "taille " + T(a.taille) + " > " + T(ch.armes.t) + " max du châssis" }; }
      return { ok: true };
    }
    if (it.kind === "module") {
      var m = moduleDe(it.id);
      if (!m) { return { ok: false, raison: "module inconnu" }; }
      var mod = d.modules || {};
      if (m.cat === "capteur") {
        if ((mod.capteurs || []).length >= ch.capteurs.n) { return { ok: false, raison: "plus d'emplacement capteur (" + ch.capteurs.n + "/" + ch.capteurs.n + ")" }; }
        if (m.taille > ch.capteurs.t) { return { ok: false, raison: "taille " + T(m.taille) + " > " + T(ch.capteurs.t) + " max" }; }
        return { ok: true };
      }
      if (m.cat === "coeur") {
        if (mod.coeur) { return { ok: false, raison: "cœur déjà équipé — range-le d'abord" }; }
        if (m.taille > ch.coeur.t) { return { ok: false, raison: "taille " + T(m.taille) + " > " + T(ch.coeur.t) + " max" }; }
        return { ok: true };
      }
      if (m.cat === "noyau") {
        if (mod.noyau) { return { ok: false, raison: "noyau déjà équipé — range-le d'abord" }; }
        if (m.taille > ch.noyau.t) { return { ok: false, raison: "taille " + T(m.taille) + " > " + T(ch.noyau.t) + " max" }; }
        return { ok: true };
      }
      if (m.cat === "bouclier") {
        if (ch.bouclier.n === 0) { return { ok: false, raison: "ce châssis n'a pas d'emplacement bouclier" }; }
        if (mod.bouclier) { return { ok: false, raison: "bouclier déjà équipé" }; }
        if (m.taille > ch.bouclier.t) { return { ok: false, raison: "taille " + T(m.taille) + " > " + T(ch.bouclier.t) + " max" }; }
        return { ok: true };
      }
      if (m.cat === "systeme") {
        if (!ch.systeme) { return { ok: false, raison: "ce châssis n'a pas d'emplacement système" }; }
        if (mod.systeme) { return { ok: false, raison: "système logique déjà équipé — range-le d'abord" }; }
        if (m.taille > ch.systeme.t) { return { ok: false, raison: "taille " + T(m.taille) + " > " + T(ch.systeme.t) + " max" }; }
        return { ok: true };
      }
    }
    return { ok: false, raison: "objet simple (pas d'emplacement)" };
  }

  function nomItem(it) {
    if (!it) { return "Objet"; }
    if (it.kind === "arme") { var a = armeDe(it.id); return a ? a.nom : it.id; }
    if (it.kind === "module") { var m = moduleDe(it.id); return m ? m.nom : it.id; }
    return it.nom || "Objet";
  }

  /* Changement de châssis : range automatiquement ce qui ne rentre plus.
     Renvoie la liste des noms rangés (muter d reste à la charge de l'appelant). */
  function rangerChangement(d, nouvId) {
    var rangements = [];
    var ch = chassiDe(nouvId);
    if (!ch) { return rangements; }
    d.inventaire = d.inventaire || [];
    d.chassis = nouvId;
    if (typeof d.pv_actuels === "number" && ch.st) {
      var pvMax = parseInt(ch.st.pv, 10);
      if (!isNaN(pvMax) && d.pv_actuels > pvMax) { d.pv_actuels = pvMax; }
    }
    var armesGardes = [];
    (d.armes || []).forEach(function (w) {
      var a = armeDe(w);
      if (a && a.taille <= ch.armes.t && armesGardes.length < ch.armes.n) { armesGardes.push(w); }
      else { rangements.push(a ? a.nom : w); d.inventaire.push({ uid: nouveauUid(), kind: "arme", id: w }); }
    });
    d.armes = armesGardes;
    var capGardes = [];
    (d.modules.capteurs || []).forEach(function (mid) {
      var m = moduleDe(mid);
      if (m && m.taille <= ch.capteurs.t && ch.capteurs.n > 0 && capGardes.length < ch.capteurs.n) { capGardes.push(mid); }
      else { rangements.push(m ? m.nom : mid); d.inventaire.push({ uid: nouveauUid(), kind: "module", id: mid }); }
    });
    d.modules.capteurs = capGardes;
    ["coeur", "noyau", "bouclier", "systeme"].forEach(function (cat) {
      var mid = d.modules[cat];
      if (!mid) { return; }
      var m = moduleDe(mid);
      var conf = ch[cat];
      if (!m || m.taille > conf.t || (cat === "bouclier" && conf.n === 0)) {
        rangements.push(m ? m.nom : mid);
        d.inventaire.push({ uid: nouveauUid(), kind: "module", id: mid });
        d.modules[cat] = null;
      }
    });
    return rangements;
  }

  var _cpt = 0;
  function nouveauUid() { _cpt++; return "i" + _cpt + "-" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36); }

  return {
    ARMES_DB: ARMES_DB,
    PROTOCOLES_DB: PROTOCOLES_DB,
    SPECIALISATIONS_DB: SPECIALISATIONS_DB,
    MODULES_DB: MODULES_DB,
    CHASSIS_DB: CHASSIS_DB,
    CATS: CATS,
    T: T,
    armeDe: armeDe,
    armeParNom: armeParNom,
    moduleDe: moduleDe,
    moduleParNom: moduleParNom,
    protocoleDe: protocoleDe,
    speDe: speDe,
    chassiDe: chassiDe,
    chassiParNom: chassiParNom,
    peutEquiper: peutEquiper,
    nomItem: nomItem,
    rangerChangement: rangerChangement,
    uid: nouveauUid
  };
})();
