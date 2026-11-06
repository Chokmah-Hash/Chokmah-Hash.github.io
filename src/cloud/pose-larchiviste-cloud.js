   devant le script pipeline de la page construite) */
/* ── La couche CLOUD — EMBARQUÉE ──
   Plus de mode local : le canvas ET la page en ligne parlent à la MÊME
   Tombe Supabase — comptes et sac du compte vivent dans le nuage.
   Sur la page construite, le script pipeline a déjà posé
   window.LARCHIVISTE_CLOUD : l'embarqué s'efface alors devant lui.
   L'Archiviste ne garde jamais les mots de passe — ils partent
   directement chez Supabase Auth. */
const CLE_PUBLIQUE = "sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov";
if (typeof window !== "undefined" && !window.LARCHIVISTE_CLOUD) {
/* ════════════════════════════════════════════════════════════════════
   LARCHIVISTE_CLOUD — le client nuage de L'Archiviste (Alpha Zéro)
   Zéro dépendance : fetch + l'API REST de Supabase.
   Principe cardinal : l'Archiviste ne garde JAMAIS les mots de passe —
   chaque mot de passe part directement chez Supabase Auth, aucun hash
   ne vit dans le code de l'app.
   Il s'assigne lui-même à window.LARCHIVISTE_CLOUD : la page en ligne
   et le canvas parlent à la MÊME Tombe — zéro simulation.
   ════════════════════════════════════════════════════════════════════ */
window.LARCHIVISTE_CLOUD = (function () {
  "use strict";
  var URL = "https://dnbnkdakmobufqcrqzpq.supabase.co";
  var CLE = "larchiviste_session_v1";
  var compteCourant = null; // compte_id de la session en cours

  /* ── Le garde-mième : le navigateur garde le token, jamais un mot de passe ── */
  function lire() {
    try { return JSON.parse(localStorage.getItem(CLE) || "null"); } catch (e) { return null; }
  }
  function ecrire(m) {
    try {
      if (m) localStorage.setItem(CLE, JSON.stringify(m));
      else localStorage.removeItem(CLE);
    } catch (e) { /* mode privé : on vivra sans restauration */ }
  }

  /* ── L'API, avec les messages d'erreur en français de la Tombe ── */
  function api(chemin, opts) {
    opts = opts || {};
    var headers = { apikey: CLE_PUBLIQUE, "Content-Type": "application/json" };
    if (opts.token) headers["Authorization"] = "Bearer " + opts.token;
    if (opts.prefer) headers["Prefer"] = opts.prefer;
    return fetch(URL + chemin, {
      cache: "no-store",
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        if (!res.ok) {
          var code = (data && (data.error_code || data.code)) || "";
          var msgBrut = (data && (data.msg || data.message)) || "";
          var msgs = {
            invalid_credentials: "Email ou mot de passe incorrect.",
            user_already_exists: "Un compte existe déjà sur cet email — connectez-vous.",
            signups_disabled: "Les inscriptions sont fermées sur le serveur — l'administrateur doit les rouvrir.",
            weak_password: "Mot de passe trop faible — 4 caractères minimum.",
            over_email_rate_limit: "Trop d'emails envoyés par le serveur — patientez quelques minutes.",
            email_not_confirmed: "Cet email n'est pas encore confirmé — ouvrez le message reçu, puis revenez.",
            email_address_invalid: "Adresse email invalide — vérifiez son orthographe."
          };
          if (msgBrut.indexOf("inscriptions desactivees") >= 0) {
            code = "signups_disabled";
          }
          var err = new Error(msgs[code] || msgBrut || "Serveur injoignable — vérifiez votre connexion.");
          err.code = code;
          err.statut = res.status;
          throw err;
        }
        return data;
      });
    });
  }

  /* ── Profil de compte tel que le launcher l'attend ── */
  function profilDepuis(user, compte) {
    var meta = (user && user.user_metadata) || {};
    return {
      compteId: user.id,
      pseudo: (compte && compte.pseudo) || meta.pseudo || "Joueur",
      tag: (compte && compte.tag) || "JR-????",
      email: user.email,
      avatarId: (compte && compte.avatar_ref) || meta.avatar_ref || "crane",
      statut: (compte && compte.statut) || "actif",
      memoire: {}
    };
  }

  /* ── Charge la ligne compte (auto-répare si absente) + le sac du compte ── */
  function chargerTout(token, user, opts) {
    var comptes = Promise.resolve(api("/rest/v1/archiviste_comptes?select=*", { token: token }))
      .then(function (lignes) {
        if (lignes && lignes.length) return lignes[0];
        /* Self-heal : la ligne compte manque (signup interrompu ?) → on la recrée */
        var meta = user.user_metadata || {};
        return api("/rest/v1/archiviste_comptes", {
          method: "POST", token: token, prefer: "return=representation",
          body: {
            compte_id: user.id,
            pseudo: meta.pseudo || "Joueur",
            email: user.email,
            avatar_ref: meta.avatar_ref || "crane"
          }
        }).then(function (cree) { return cree && cree[0]; });
      });

    return comptes.then(function (compte) {
      compteCourant = user.id;
      /* Horodatage de dernière connexion (best effort) — SAUF en simple
         vérification (horodater: false) : le temps réel ne doit jamais
         déclencher la Tombe, sinon la Tombe s'annonce à elle-même. */
      if (!opts || opts.horodater !== false) {
        api("/rest/v1/archiviste_comptes?compte_id=eq." + user.id, {
          method: "PATCH", token: token, body: { derniere_connexion: new Date().toISOString() }
        }).catch(function () {});
      }
      var profil = profilDepuis(user, compte);
      return api("/rest/v1/archiviste_memoire?select=contenu&compte_id=eq." + user.id, { token: token })
        .then(function (mem) {
          profil.memoire = (mem && mem[0] && mem[0].contenu) || {};
          return profil;
        });
    });
  }

  /* ══ TEMPS RÉEL — la poussée de la Tombe (Supabase Realtime) ══
     La base PRÉVIENT : plus de pulsation, la vérité arrive en poussée.
     WebSocket zéro dépendance, protocole Phoenix : jointure d'un canal
     postgres_changes (filtre serveur : chaque joueur n'écoute QUE sa
     ligne) + battement de cœur toutes les 25 s. La RLS s'applique AUSSI
     au canal. En coupure, on rebranche seul ; l'app relit alors la
     Tombe pour rattraper ce qui a poussé pendant l'absence. */
  function tempsReel(opts) {
    opts = opts || {};
    var tables = opts.tables || [];
    var surChangement = opts.surChangement || function () {};
    var surEtat = opts.surEtat || function () {};
    var presenceCle = opts.presenceKey || null; /* s'annoncer sur le canal des présents */
    var surPresence = opts.surPresence || null; /* écouter qui entre et qui sort */
    /* V47 : le track porte compte_id + pseudo + jeu — la ronde des présents
       dit QUI est en ligne et OÙ il se tient (null = au hub). */
    var presenceInfo = typeof opts.presenceInfo === "function" ? opts.presenceInfo : null;
    var pister = function (payload) {
      if (!ws || ws.readyState !== 1 || !presenceCle) return;
      ws.send(JSON.stringify({
        topic: "realtime:tombe", event: "presence",
        payload: { type: "presence", event: "track", payload: payload || { compte_id: presenceCle } },
        ref: "piste"
      }));
    };
    if (typeof WebSocket === "undefined") { surEtat("coupure"); return { fermer: function () {} }; }
    var m0 = lire();
    if (!m0 || !m0.access_token) { surEtat("coupure"); return { fermer: function () {} }; }

    var ws = null, coeur = null, ferme = false, essais = 0;

    function brancher() {
      if (ferme) return;
      var jeton = ((lire() || m0) || {}).access_token || "";
      try {
        ws = new WebSocket("wss://dnbnkdakmobufqcrqzpq.supabase.co/realtime/v1/websocket?apikey=" + CLE_PUBLIQUE + "&vsn=1.0.0");
      } catch (e) { retomber(); return; }
      ws.onopen = function () {
        essais = 0;
        if (coeur) clearInterval(coeur);
        coeur = setInterval(function () {
          if (ws && ws.readyState === 1) {
            ws.send(JSON.stringify({ topic: "phoenix", event: "heartbeat", payload: {}, ref: "battement" }));
          }
        }, 25000);
        tables.forEach(function (t) {
          var suivi = { event: "*", schema: "public", table: t.table };
          if (t.filtre) suivi.filter = t.filtre;
          ws.send(JSON.stringify({
            topic: "realtime:public:" + t.table,
            event: "phx_join",
            payload: {
              config: { broadcast: { self: false }, presence: { key: "" }, postgres_changes: [suivi] },
              access_token: jeton
            },
            ref: t.table
          }));
        });
        /* La PRÉSENCE : tant que cette socket vit, le joueur est « en ligne ».
           Fermer la fenêtre ferme la socket — le serveur le remarque seul,
           aucune écriture en base, aucun code à la fermeture (impossible
           de rester vert par accident). */
        if (presenceCle) {
          ws.send(JSON.stringify({
            topic: "realtime:tombe",
            event: "phx_join",
            payload: {
              config: { broadcast: { self: false }, presence: { key: presenceCle }, postgres_changes: [] },
              access_token: jeton
            },
            ref: "presence"
          }));
          /* Le track : joindre ne suffit pas, il faut S'ANNONCER — la ronde
             ne diffuse que les états trackés (protocole Supabase v1 :
             event "presence", payload {type:"presence", event:"track"}).
             Le serveur traite les pushes dans l'ordre : join puis track. */
          pister(presenceInfo ? presenceInfo() : { compte_id: presenceCle });
        }
        surEtat("branche");
      };
      ws.onmessage = function (ev) {
        var msg;
        try { msg = JSON.parse(ev.data); } catch (e) { return; }
        if (msg.event === "postgres_changes" && msg.payload && msg.payload.data) {
          surChangement(msg.payload.data);
        }
        /* La ronde des présents : état initial puis entrées/sorties —
           V47 : l'événement part avec le payload (state ou diff). */
        if (surPresence && (msg.event === "presence_state" || msg.event === "presence_diff")) {
          surPresence(msg.payload || {}, msg.event);
        }
      };
      ws.onclose = retomber;
      ws.onerror = function () { try { ws.close(); } catch (e) {} };
    }
    function retomber() {
      if (coeur) { clearInterval(coeur); coeur = null; }
      if (ferme) return;
      surEtat("coupure");
      setTimeout(brancher, Math.min(5000 + essais * 5000, 30000));
      essais++;
    }
    brancher();
    return {
      fermer: function () {
        ferme = true;
        if (coeur) clearInterval(coeur);
        if (ws) { try { ws.close(); } catch (e) {} }
        ws = null;
      },
      /* V47 : re-pister sans re-joindre — quand on entre dans un pack ou
         qu'on le quitte, les présents voient notre nouvelle place. */
      annoncer: function (payload) { pister(payload); }
    };
  }

  return {
    /* Connexion email + mot de passe → profil + bibliothèque du compte */
    connexion: function (email, mdp) {
      return api("/auth/v1/token?grant_type=password", {
        method: "POST", body: { email: email, password: mdp }
      }).then(function (d) {
        ecrire({ access_token: d.access_token, refresh_token: d.refresh_token });
        return chargerTout(d.access_token, d.user);
      });
    },

    /* Inscription : pseudo part dans user_metadata, le mot de passe chez Auth */
    inscription: function (pseudo, email, mdp, avatarId) {
      return api("/auth/v1/signup", {
        method: "POST",
        body: { email: email, password: mdp, data: { pseudo: pseudo, avatar_ref: avatarId } }
      }).then(function (d) {
        var session = d.session || (d.access_token ? d : null);
        if (session && session.access_token) {
          ecrire({ access_token: session.access_token, refresh_token: session.refresh_token });
          return chargerTout(session.access_token, d.user || session.user);
        }
        /* Compte créé mais email non confirmé → pas de session */
        var err = new Error("Un email de confirmation vous attend — ouvrez-le, puis revenez vous connecter.");
        err.confirmation = true;
        throw err;
      });
    },

    /* Restauration de session au démarrage (token gardé par le navigateur) */
    sessionActuelle: function (opts) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve(null);
      return api("/auth/v1/user", { token: m.access_token })
        .then(function (user) { return chargerTout(m.access_token, user, opts); })
        .catch(function () {
          /* Token expiré → on tente le refresh avant d'abandonner */
          if (!m.refresh_token) { ecrire(null); return null; }
          return api("/auth/v1/token?grant_type=refresh_token", {
            method: "POST", body: { refresh_token: m.refresh_token }
          }).then(function (d) {
            ecrire({ access_token: d.access_token, refresh_token: d.refresh_token });
            return chargerTout(d.access_token, d.user, opts);
          }).catch(function () { ecrire(null); return null; });
        });
    },

    /* Déconnexion serveur + nettoyage du garde-mième */
    deconnexion: function () {
      var m = lire();
      ecrire(null);
      compteCourant = null;
      if (m && m.access_token) {
        return api("/auth/v1/logout", { method: "POST", token: m.access_token }).catch(function () {});
      }
      return Promise.resolve();
    },

    /* Mot de passe perdu : le lien part chez Supabase Auth */
    perdu: function (email) {
      return api("/auth/v1/recover", { method: "POST", body: { email: email } });
    },

    /* Le sac du compte (installations, favoris, rôles) part dans le nuage */
    sauveMemoire: function (compteId, contenu) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve();
      return api("/rest/v1/archiviste_memoire", {
        method: "POST", token: m.access_token,
        prefer: "resolution=merge-duplicates",
        body: { compte_id: compteId, contenu: contenu }
      });
    },

    /* L'état de la base tel que la Tombe l'annonce : le pied de page du
       launcher dit ce qu'il charge (parametre « version_launcher ») —
       même vérité que l'Archivisterium, partout où il tourne. */
    lireParametres: function () {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve(null);
      return api("/rest/v1/parametres?select=cle,valeur", { token: m.access_token })
        .catch(function () { return null; });
    },

    /* Mise à jour du compte (avatar, pseudo à venir…) */
    sauveCompte: function (patch) {
      var m = lire();
      if (!m || !m.access_token || !compteCourant) return Promise.resolve();
      var body = {};
      if (patch && patch.avatarId !== undefined) body.avatar_ref = patch.avatarId;
      return api("/rest/v1/archiviste_comptes?compte_id=eq." + compteCourant, {
        method: "PATCH", token: m.access_token, body: body
      });
    },

    /* La Console Globale : le canal des événements de jeu (MJ et joueurs
       s'y parlent). Chaque message est GRAVÉ dans la Tombe — prémice du
       journal — et pousse en temps réel chez tous. Le serveur signe
       lui-même le pseudo et le rôle (trigger console_verite) : personne
       ne peut se déguiser. V0.37 : le canal à DEUX dimensions — le
       GLOBAL (null/null), le SALON D'UN JDR (jeu, null), et le
       canal privé d'une partie (null, partie_id). */
    envoyerConsole: function (compteId, contenu, type, donnees, partieId, packId) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve();
      return api("/rest/v1/archiviste_console", {
        method: "POST", token: m.access_token,
        body: {
          compte_id: compteId, contenu: contenu, type: type || "message",
          donnees: donnees || {}, partie_id: partieId || null, jeu: packId || null
        }
      });
    },

    /* Le fil de la Console, relu à la connexion : le journal commence
       où l'on arrive — les 60 derniers messages font le bord. Le canal
       est CONTEXTUEL : le Global (null/null), le salon d'un JDR
       (jeu), ou le canal privé d'une partie (membres et MJ seuls
       le lisent). */
    lireConsole: function (partieId, packId) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve([]);
      var filtre = partieId ? "partie_id=eq." + encodeURIComponent(partieId)
        : packId ? "partie_id=is.null&jeu=eq." + encodeURIComponent(packId)
        : "partie_id=is.null&jeu=is.null";
      return api("/rest/v1/archiviste_console?select=id,pseudo,role,contenu,type,donnees,cree_le,partie_id,jeu&"
        + filtre + "&order=id.desc&limit=60", { token: m.access_token })
        .then(function (l) { return (l || []); })
        .catch(function () { return []; });
    },

    /* V3 : le dé roule DANS LA TOMBE (rpc lancer_des) — le serveur seul
       connaît le résultat avant de le graver, le client ne choisit plus
       son jet ; il l'apprend par la poussée, comme les autres. V4 : le
       jet se grave dans le canal de la partie quand il y en a une. */
    lancerDes: function (nb, faces, note, partieId) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve();
      return api("/rest/v1/rpc/lancer_des", {
        method: "POST", token: m.access_token,
        /* le paramètre serveur s'appelle p_partie : jamais ambigu avec la colonne */
        body: { nb: nb, faces: faces, note: note || null, p_partie: partieId || null }
      });
    },

    /* ══ LA PARTIE (moteur générique) : une aventure partagée — un MJ
       (le créateur), un code d'invitation, des joueurs qui se joignent.
       Les mêmes fonctions serviront TOUT pack multijoueur : elles ne
       connaissent que l'id du jeu, jamais son nom. ══ */

    /* Ouvrir une aventure : le créateur en devient le MJ (policy : on ne
       crée que SOI MJ d'une partie OUVERTE). */
    creerPartie: function (jeu, nom, compteId) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve(null);
      return api("/rest/v1/archiviste_parties", {
        method: "POST", token: m.access_token, prefer: "return=representation",
        body: { jeu: jeu, nom: nom || "Aventure sans nom", mj_compte_id: compteId }
      }).then(function (l) { return (l && l[0]) || null; });
    },

    /* Le lobby : les aventures OUVERTES du jeu — via la VUE lobby (le
       pseudo du MJ et le nombre de joueurs sont servis par la Tombe,
       les comptes ne se lisent pas entre eux). V47 : ne montrent que les
       salles que le MJ a OUVERTES — publiques ET privées (V48.3 : les
       privées apparaissent dans AVENTURES OUVERTES, leur mot de passe se
       demande dans la ligne), les fermées n'existent pour personne.
       V48.8 : les parties LANCÉES (en_cours) y vivent AUSSI — le joueur
       voit ce que le MJ vient de lancer, et peut arriver en cours. */
    listerParties: function (jeu) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve([]);
      var qO = api("/rest/v1/archiviste_parties_lobby?select=*"
        + "&jeu=eq." + encodeURIComponent(jeu)
        + "&statut=eq.ouverte&salle_ouverte_le=not.is.null&visibilite=in.(publique,privee)&supprime_le=is.null&order=cree_le.asc", { token: m.access_token })
        .catch(function () { return []; });
      var qC = api("/rest/v1/archiviste_parties_lobby?select=*"
        + "&jeu=eq." + encodeURIComponent(jeu)
        + "&statut=eq.en_cours&visibilite=in.(publique,privee)&supprime_le=is.null&order=lance_le.desc", { token: m.access_token })
        .catch(function () { return []; });
      return Promise.all([qO, qC]).then(function (l) { return (l[0] || []).concat(l[1] || []); });
    },

    /* Mes aventures EN COURS (MJ ou joueur) — pour REPRENDRE après un
       reload : la partie survit à l'appareil, elle vit dans la Tombe.
       V47 : les salles d'attente que le MJ TIENT (ouverte + salle
       ouverte) vivent ici aussi — on reprend la table sans attendre le
       lancement. REPRENDRE reste grisée si la salle est fermée. */
    mesParties: function (jeu, compteId) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve([]);
      var qC = api("/rest/v1/archiviste_parties_lobby?select=*"
        + "&jeu=eq." + encodeURIComponent(jeu) + "&statut=eq.en_cours&supprime_le=is.null&order=lance_le.asc", { token: m.access_token })
        .catch(function () { return []; });
      var qO = api("/rest/v1/archiviste_parties_lobby?select=*"
        + "&jeu=eq." + encodeURIComponent(jeu) + "&statut=eq.ouverte&salle_ouverte_le=not.is.null&supprime_le=is.null&order=salle_ouverte_le.desc", { token: m.access_token })
        .catch(function () { return []; });
      var qJ = api("/rest/v1/archiviste_partie_joueurs?select=partie_id&compte_id=eq." + compteId,
        { token: m.access_token }).catch(function () { return []; });
      return Promise.all([qC, qO, qJ]).then(function (r) {
        var ids = {};
        (r[2] || []).forEach(function (pj) { ids[pj.partie_id] = true; });
        var vus = {}, liste = [];
        (r[0] || []).concat(r[1] || []).forEach(function (p) {
          if (vus[p.id]) return;
          vus[p.id] = true;
          if (p.mj_compte_id === compteId || ids[p.id]) liste.push(p);
        });
        return liste;
      });
    },

    /* Toutes les aventures créées par ce compte (tout statut) — registre MJ */
    mesAventures: function (jeu, compteId) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve([]);
      return api("/rest/v1/archiviste_parties_lobby?select=*"
        + "&jeu=eq." + encodeURIComponent(jeu)
        + "&mj_compte_id=eq." + compteId
        + "&supprime_le=is.null"
        + "&order=cree_le.desc", { token: m.access_token })
        .catch(function () { return []; });
    },

    /* V46 : EFFACER une de SES aventures — soft-delete (la Tombe garde
       tout : la partie part en Corbeille, visible de l'institution seule ;
       elle disparaît des écrans des MJ et joueurs). */
    supprimerPartie: function (id) {
      var m = lire();
      if (!m || !m.access_token) return Promise.reject(new Error("Hors ligne."));
      return api("/rest/v1/rpc/archiviste_supprimer_partie", {
        method: "POST", token: m.access_token, body: { p_id: id }
      });
    },

    /* Lire une partie et ses joueurs (la vue lobby porte mj_pseudo —
       les lignes de table seules ne le portent pas) */
    lirePartie: function (id) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve(null);
      return api("/rest/v1/archiviste_parties_lobby?select=*&id=eq." + id, { token: m.access_token })
        .then(function (l) { return (l && l[0]) || null; })
        .catch(function () { return null; });
    },
    lirePartieJoueurs: function (id) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve([]);
      return api("/rest/v1/archiviste_partie_table?select=*"
        + "&partie_id=eq." + id + "&order=rejoint_le.asc", { token: m.access_token })
        .catch(function () { return []; });
    },

    /* Rejoindre par bouton (id connu — salle publique ouverte) ; V47 :
       par MOT DE PASSE (salle privée) — la Tombe vérifie le sceau
       (hash sha256, jamais le mot de passe en clair), grave la table
       et rend la salle. L'ancien CODE à six caractères s'efface. */
    /* V0.48 : LE REJOINT EST IDEMPOTENT — un membre qui revient (retour au
       hub puis ENTRER, reconnexion) ne doit pas se heurter à sa propre
       ligne : PostgREST "resolution=ignore-duplicates" rend l'INSERT
       silencieux sur doublon — déjà membre = on ENTRE, plus d'erreur. */
    rejoindrePartie: function (partieId, compteId) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve(null);
      return api("/rest/v1/archiviste_partie_joueurs", {
        method: "POST", token: m.access_token, prefer: "return=representation, resolution=ignore-duplicates",
        body: { partie_id: partieId, compte_id: compteId }
      }).then(function (l) { return (l && l[0]) || null; })
        .catch(function (e) { throw e; });
    },
    rejoindrePrivee: function (jeu, mdp) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve(null);
      return api("/rest/v1/rpc/archiviste_rejoindre_privee", {
        method: "POST", token: m.access_token,
        body: { p_jeu: jeu, p_mdp: (mdp || "").trim() }
      });
    },

    /* V47 — LA SALLE VIVANTE : le MJ l'ouvre PUBLIQUE ou PRIVÉE (mot de
       passe ≥ 3 caractères, hashé par la Tombe), la referme en partant,
       la rouvre en reprenant une partie lancée. */
    ouvrirSalle: function (id, visibilite, mdp) {
      var m = lire();
      if (!m || !m.access_token) return Promise.reject(new Error("Hors ligne."));
      return api("/rest/v1/rpc/archiviste_ouvrir_salle", {
        method: "POST", token: m.access_token,
        body: { p_id: id, p_visibilite: visibilite, p_mdp: visibilite === "privee" ? (mdp || "").trim() : null }
      });
    },
    fermerSalle: function (id) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve();
      return api("/rest/v1/archiviste_parties?id=eq." + id, {
        method: "PATCH", token: m.access_token,
        body: { salle_ouverte_le: null, mdp_hash: null, visibilite: "publique" }
      });
    },
    rouvrirSalle: function (id) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve();
      return api("/rest/v1/archiviste_parties?id=eq." + id, {
        method: "PATCH", token: m.access_token,
        body: { salle_ouverte_le: new Date().toISOString() }
      });
    },

    /* V49 — LE SCELLE DE LA SALLE : le MJ cadenasse son aventure QUAND IL
       VEUT, même en pleine partie — champ vide = porte libre (publique),
       texte = la Tombe hash le mot de passe côté serveur (jamais en
       clair) et la salle devient privée. La RPC ne touche NI au statut NI
       à salle_ouverte_le : la partie continue de vivre. */
    majMotDePasseSalle: function (id, mdp) {
      var m = lire();
      if (!m || !m.access_token) return Promise.reject(new Error("Hors ligne."));
      return api("/rest/v1/rpc/archiviste_maj_mdp_salle", {
        method: "POST", token: m.access_token,
        body: { p_id: id, p_mdp: (mdp || "").trim() || null }
      });
    },

    /* V0.39 — LES SCELLÉS DU MJ : le mot de passe de CHACUNE de ses
       aventures, en clair, tel que la Tombe l'a gardé POUR LUI SEUL
       (table dédiée archiviste_parties_mdps — la politique ne laisse
       passer que les lignes des parties dont il est le MJ ; les
       joueurs n'y touchent jamais). Le champ de l'écrou s'en
       pré-remplit : vide = porte libre, sinon le mot de passe
       sauvegardé. */
    mdpsSalle: function () {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve([]);
      return api("/rest/v1/archiviste_parties_mdps?select=partie_id,mdp_clair", { token: m.access_token })
        .catch(function () { return []; });
    },

    /* Sortir d'une aventure (soi-même) ; annuler = le MJ ferme */
    quitterPartie: function (partieId, compteId) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve();
      return api("/rest/v1/archiviste_partie_joueurs?partie_id=eq." + partieId + "&compte_id=eq." + compteId,
        { method: "DELETE", token: m.access_token });
    },

    /* Le MJ pilote : lancer l'aventure (ouverte → en_cours, la salle reste
       tenue) ou la fermer (la salle s'éteint avec elle).
       V48.9 — LA PORTE S'OUVRE EN PUBLIQUE : une partie lancée SANS salle
       ouverte naissait visibilite='privee' + mdp_hash NULL (défaut de la
       Tombe) : visible depuis V0.32 mais l'ENTRER refusait pour rien.
       Lancer sans salle tenue ouvre maintenant la porte en publique —
       rejoignable en plein jeu. (undefined est omis par JSON.stringify.) */
    lancerPartie: function (id, ouvrirPublique) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve();
      return api("/rest/v1/archiviste_parties?id=eq." + id, {
        method: "PATCH", token: m.access_token,
        body: { statut: "en_cours", lance_le: new Date().toISOString(), salle_ouverte_le: new Date().toISOString(),
                visibilite: ouvrirPublique ? "publique" : undefined, mdp_hash: ouvrirPublique ? null : undefined }
      });
    },
    fermerPartie: function (id) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve();
      return api("/rest/v1/archiviste_parties?id=eq." + id, {
        method: "PATCH", token: m.access_token,
        body: { statut: "close", fermee_le: new Date().toISOString(), salle_ouverte_le: null, mdp_hash: null, visibilite: "publique" }
      });
    },

    /* V43 — LA FICHE AU CENTRE DE LA TABLE : le personnage du joueur vit
       dans la Tombe (une fiche par joueur et par partie, contenu libre).
       Upsert sur la pk (partie_id, compte_id) : recréer écrase, la fiche
       suit l'unité. Le MJ lit la vue lobby (contenu + pseudo) pour son
       écran — le joueur ne voit QUE les fiches de sa propre table. */
    sauverFichePartie: function (partieId, compteId, contenu) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve();
      return api("/rest/v1/archiviste_partie_fiches", {
        method: "POST", token: m.access_token, prefer: "resolution=merge-duplicates",
        body: { partie_id: partieId, compte_id: compteId, contenu: contenu, maj_le: new Date().toISOString() }
      });
    },
    lireFichesPartie: function (partieId) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve([]);
      return api("/rest/v1/archiviste_partie_fiches_lobby?select=*&partie_id=eq." + partieId, { token: m.access_token })
        .then(function (l) { return l || []; })
        .catch(function () { return []; });
    },

    /* V48 — LE REGISTRE DES PERSONNAGES : chaque joueur garde ses unités
       dans la Tombe, rattachées à son compte et AU PACK — prêtes à entrer
       dans n'importe quelle aventure. Le contenu est libre (unité 40k,
       aventurier d100…) ; la suppression est DOUCE (supprime_le) — la
       Tombe n'efface jamais par écrit. */
    listerPersonnages: function (jeu) {
      var m = lire();
      if (!m || !m.access_token) return Promise.resolve([]);
      return api("/rest/v1/archiviste_personnages?select=*&jeu=eq." + encodeURIComponent(jeu) + "&supprime_le=is.null&order=cree_le.asc", { token: m.access_token })
        .then(function (l) { return l || []; })
        .catch(function () { return []; });
    },
    creerPersonnage: function (jeu, compteId, nom, contenu) {
      var m = lire();
      if (!m || !m.access_token) return Promise.reject(new Error("hors session"));
      return api("/rest/v1/archiviste_personnages", {
        method: "POST", token: m.access_token, prefer: "return=representation",
        body: { compte_id: compteId, jeu: jeu, nom: nom, contenu: contenu, maj_le: new Date().toISOString() }
      });
    },
    supprimerPersonnage: function (id) {
      var m = lire();
      if (!m || !m.access_token) return Promise.reject(new Error("hors session"));
      return api("/rest/v1/archiviste_personnages?id=eq." + id, {
        method: "PATCH", token: m.access_token,
        body: { supprime_le: new Date().toISOString() }
      });
    },
    /* V0.74 — LA FICHE VIVANTE : la grande fiche OUVERTE depuis le
       registre grave ses changements — la physicalisation de
       l'équipement (équiper, déséquiper) écrit DANS la Tombe, pas
       seulement à l'écran. Le contenu part EN ENTIER : la fiche est
       la seule souveraine du perso, pas de fusion à demi-mot. */
    majPersonnage: function (id, contenu) {
      var m = lire();
      if (!m || !m.access_token) return Promise.reject(new Error("hors session"));
      return api("/rest/v1/archiviste_personnages?id=eq." + id, {
        method: "PATCH", token: m.access_token,
        body: { contenu: contenu, maj_le: new Date().toISOString() }
      });
    },

    /* Le canal temps réel : la Tombe pousse ses changements à l'écran —
       la synchro devient de la poussée, pas du polling. */
    tempsReel: tempsReel
  };
})();
}
