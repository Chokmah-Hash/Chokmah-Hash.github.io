/* ── La version de build : sémantique, +0.01 par reconstruction du site.
   Passage en 1.0 quand tout sera en place (décision du Maître de la Tombe).
   V0.23 : LA CRÉATION SANS LANCEMENT — l'aventure naît dans MES AVENTURES,
   la salle s'ouvre depuis la liste (⚙) ; et LE BANDEAU DE L'ARCHIVISTE
   (titre + compte connecté) revient dans l'espace MJ/Joueur et la table.
   V0.24 : LA SALLE VIVANTE — une aventure créée est SALLE FERMÉE ; le MJ
   l'ouvre PUBLIQUE (lobby de tous) ou PRIVÉE (mot de passe, le code à 6
   caractères s'efface) ; REPRENDRE est grisé tant que la salle est fermée,
   le MJ qui s'en va la referme ; et le lobby montre les CONNECTÉS (la
   présence temps réel, qui est prêt à joindre).
   V0.25 : LE REGISTRE DES PERSONNAGES — chaque joueur garde ses unités dans
   la Tombe (tableau + écrou dans l'onglet PERSONNAGES, rattachées au pack),
   et à l'entrée en partie il choisit QUI entre dans la Tombe : une unité
   du registre devient sa fiche de partie.
   V0.26 : TERMINOLOGIE COMMUNE — la mécanique de création parle le même
   langage dans tous les packs (+ CRÉER, « créé le », boutons « Créer … ») ;
   et le pack de l'écran de partie est CHARGÉ (contenu résolu) — sans quoi
   + CRÉER ne résolvait aucun écran de création.
   V0.27 : L'ÉPURE — l'onglet CONSOLE du hub disparaît (la console de partie
   reste), la Bibliothèque sait désinstaller, le lobby se réduit à
   AVENTURES OUVERTES (salles privées comprises, mot de passe dans la
   ligne) puis CONNECTÉS, et l'entête ne dit plus que le nom du JDR, le
   mode, et un discret ⌂ HUB.
   V0.28 : LA RONDE CORRIGÉE — un re-piste (le joueur change de place)
   part en joins ET leaves pour la même clé : la sortie ne compte que si
   la clé n'est pas revenue dans le même diff, sinon le joueur
   s'évanouissait de CONNECTÉS à chaque déplacement ; et le lieu dit
   maintenant « dans ce pack / au hub / dans un autre JDR ».
   V0.29 : LE CONNECTÉS DU JDR — le cadre du lobby d'un JDR ne montre
   que les joueurs qui ont lancé CE JDR (lobby ou table de jeu) ;
   quitter le jeu vide l'état de partie pour que la ronde re-piste,
   et les étiquettes de lieu s'effacent (tout le monde ici est du JDR).
   V0.30 : LA DÉCONNEXION QUI NE PEINT PLUS LE NOIR — le setter
   fantôme setMesPartiesCours (vestige de l'épure) jetait au milieu
   de seDeconnecter : session vidée, vue figée sur « partie », plus
   rien ne rendait → écran noir en quittant un JDR. Le hub se rend
   maintenant AVANT le nettoyage, et le pied « Powered by Vibe · N° »
   vit aussi dans l'espace MJ/Joueur (PiedVibe partagé).
   V0.31 : LE PIED UNIVERSEL — dans la salle d'attente et le lobby
   MJ/Joueur, le PiedVibe vivait DANS le conteneur interne (px-5 pt-8
   pb-10) : le pb-10 le faisait flotter 40 px au-dessus du bas. Il vit
   maintenant à la RACINE de l'écran, après le conteneur, collé au bas
   exactement comme sur le hub et la porte — tout est uniforme.
   V0.32 : LES PARTIES EN COURS VISIBLES — le lobby ne montrait que
   les salles ouvertes : une partie LANCÉE disparaissait d'AVENTURES
   OUVERTES, le joueur ne voyait jamais ce que le MJ venait de lancer.
   listerParties serve maintenant les salles ouvertes PUIS les parties
   en_cours (publiques et privées, les plus fraîches d'abord), et la
   ligne porte le badge « PARTIE EN COURS ».
   V0.33 : LA PORTE S’OUVRE EN PUBLIQUE — une partie lancée sans salle
   ouverte naissait « privee » sans mot de passe (défaut de la Tombe) :
   visible depuis V0.32 mais l’ENTRER refusait pour rien. lancerPartie
   ouvre maintenant la porte en publique quand la salle n’était pas
   tenue — visible ET rejoignable en plein jeu.
   V0.34 : LE SCELLE DE LA SALLE — le joueur voyait « mot de passe de
   la salle » mais le MJ n'avait nulle part le poser sur une aventure
   lancée. L'écrou ouvre maintenant, à droite de REPRENDRE, un champ :
   vide = porte libre (entrée directe), texte = cadenassée — le mot de
   passe est hashé côté Tombe (RPC archiviste_maj_mdp_salle, jamais en
   clair) et demandé au joueur avant d'entrer. Gravable à tout moment,
   même en pleine partie ; vider + graver rouvre à tous.
   V0.35 : LA TRAJECTOIRE PRAGMATIQUE — les sacs de données des packs
   vivent désormais dans packs/<id>.json, chargés par fetch AVANT le
   boot (window.LARCHIVISTE_PACKS) : la page n'embarque plus 44 Ko de
   données qui se re-téléchargent à chaque reconstruction d'un seul
   pack ; le SW v37 les précache pour le hors-ligne.
   V0.36 : LA BARRE QUI PARLE LES COULEURS — le scrolling suit la
   doctrine des thèmes : le chrome défile en Zinc d'Archiviste, chaque
   pack repeint la barre à SA couleur dès qu'il prend l'écran, et
   l'Archivistère garde son ambre d'œil du MJ (voir §SECTION:UI).
   V0.37 : LE SALON ET LA TABLE VIVANTE — chaque JDR a SON salon de
   lobby (canal console jeu, filtre Tous/Messages/Dés/Journal) ;
   le joueur gagne l'onglet AVENTURES ; le MJ gagne RÈGLES à droite
   d'AVENTURES ; MES AVENTURES montre EN LIGNE (lancée + salle
   ouverte) ou HORS LIGNE ; la ligne gagne [▶ LANCER]/[■ FERMER] et
   l'écrou ne garde que scellé + sentence ; le MJ qui quitte une
   partie en cours ne casse RIEN (elle reste en ligne, REPRENDRE la
   rend), FERMER seul referme l'aventure et rend les joueurs à la
   porte.
   V0.38 : LE SALON AFFINÉ — le chat du lobby perd ses filtres (les
   paroles et le journal vivent ensemble, les dés restent à la
   table) et prend la hauteur de la fenêtre (45vh, comme la console
   de partie) ; le canal de partie ne détourne PLUS jamais le lobby
   (canal partie en vue pack seule) et l'arrivée sur l'onglet LOBBY
   relit le salon — le MJ voyait un fil muet ; MES AVENTURES perd sa
   sous-ligne de dates ; [▶ LANCER] revient aussi sur les aventures
   CLOSES (relancer une séance terminée) ; l'écrou devient une modale
   FLOTTANTE et propose le scellé dans TOUTES les situations.
   V0.39 : LE REGISTRE SOUFFLE MIEUX — MES AVENTURES perd sa colonne
   STATUT (le nom teal d'une aventure en ligne suffit) ; le pilotage
   devient deux ICÔNES (▶ vert pour lancer, ■ rouge pour fermer,
   armé en ✕) alignées à droite, côte à côte avec l'écrou, la
   colonne s'élargit et respire ; la modale de l'écrou perd sa
   ligne de radotage (MJ/statut/salle) et son titre devient
   « Mot de passe de l'Aventure » ; LE SCELLÉ SE SOUVIENT — le mot
   de passe vit EN CLAIR avec l'aventure (table archiviste_parties_mdps,
   MJ seul lecteur) et le champ le ré-affiche pré-rempli : vide si la
   porte est libre, sinon le mot de passe sauvegardé ; la gravure
   du scellé marche désormais aussi sur une séance CLOSE (le refus
   silencieux de la RPC est corrigé).
   V0.40 : LA PORTE DU JOUEUR — l'onglet AVENTURES du joueur dit
   « AVENTURES EN LIGNE » ; la carte d'une aventure perd sa sous-
   ligne de radotage (cadenas/joueurs/PARTIE EN COURS) et garde le
   seul nom du MJ, en gris clair lisible ; UN SEUL bouton ENTRER —
   VERT sans cadenas quand la porte est libre (on rejoint aussitôt),
   GRIS avec 🔒 quand elle est scellée (le mot de passe se demande) ;
   côté MJ, les icônes ▶/■ s'élargissent (deux fois l'écrou) et le
   nom d'une aventure en ligne garde son vert SANS soulignement.
   V0.41 : LE SALON ENCRÉ — le salon du LOBBY s'ancre en BAS DE PAGE
   (la scroll bar vit dans son propre cadre, le salon ne saute plus
   de taille) ; le cadre CONNECTÉS quitte le lobby : une petite
   petit bouton sur la ligne du titre, à droite, le fait paraître en
   petit cadre flottant — un clic l'ouvre, un autre le referme.
   V0.42 : LE VRAI SALON ENCRÉ — app.css (Tailwind compilé une
   fois, figé) ne connaît PAS h-screen/overflow-hidden/min-h-0/
   pb-5 : l'ancrage V0.41 était lettre morte, le salon gardait la
   taille de son contenu et le pied flottait sous lui. Toutes les
   contraintes du LOBBY vivent désormais en STYLES INLINE (le
   pattern éprouvé du 45vh inline, autoritaire) : racine height
   100vh + overflow hidden + flex colonne, conteneur et salon
   flex 1 1 0% + min-height 0 — le salon remplit TOUT l'espace
   au-dessus du pied, collé en bas de la fenêtre, et sa scroll
   bar vit DANS son cadre (10 000 messages ne font plus scroller
   la page).
   V0.43 : LE PLUS RÉCENT EN HAUT — règle générale de Michael : TOUTES
   les consoles (canal global du hub, salon de partie) lisent du PLUS
   RÉCENT au plus ancien — la Tombe rend déjà ses 60 messages par
   id desc, on ne les retourne PLUS ; le temps réel grave les
   nouveaux EN TÊTE du fil et la fenêtre glisse (80 lignes) côté
   queue ; le défilement automatique vers le bas meurt — le plus
   récent vit en haut, visible sans toucher à la barre.
   V0.44 : LE HALO DU MODE — la vignette MODE MJ/MODE JOUEUR meurt ;
   le mode se murmure dans l'aura de l'avatar du compte en haut à
   droite : un cercle OR (l'ambre du MJ) encadre l'icône du Maître
   du Jeu, un cercle BLEU (le turquoise du joueur) celle du joueur —
   halo doux (lueur autour du cercle), en salle d'attente comme dans
   l'écran de partie. Le hub reste neutre : pas de mode, pas d'aura.
   V0.45 : LA GRANDE VÉRIFICATION — le moteur passe au peigne fin : les
   refs « pied » orphelines de V0.43 (le défilement auto mort n'a jamais
   été retiré des fils) s'effacent des deux consoles ; le round-trip
   des packs (canvas → forge → packs servis) est passé bit-exact ;
   la crypte est purgée de ses scellés périmés. Aucun changement
   visible : le nettoyage des coulisses.
   V0.46 : LE CADENAS EXPLICITE — le mot de passe d'une salle ne se
   devine plus : une case à cocher dit l'intention, dans l'écrou de
   l'aventure comme dans la modale d'ouverture — cochée, le champ
   s'arme et exige ses 3 caractères ; décochée, il se grise et la
   porte est libre. LA CHASSE AU FANTÔME : fermer la salle n'efface
   plus le mot de passe en laissant l'aventure « privée » sans
   cadenas (l'état qui enfermait les joueurs dehors) — fermer
   réouvre la porte, et la Tombe gagne un garde-fou : privée sans
   mot de passe n'existe pas, elle redevient publique.
   V0.47 : LES DEUX PORTES RÉPARÉES — ① LA PARTIE SANS MOT DE PASSE SE
   REJOINT : la policy de la Tombe n'acceptait l'entrée que dans une
   salle OUVERTE (statut ouverte + salle tenue) ; une partie LANCÉE
   sans salle, ou décadenassée en plein jeu, refusait le joueur qui
   cliquait ENTRER — la policy accepte désormais AUSSI les parties
   en cours publiques (le privé passe toujours par la RPC à mot de
   passe, les closes restent closes). ② OUVRIR À TOUS NE PLANTE
   PLUS : rechargerListes ne rendait RIEN (pas de promesse) alors
   que graverMdpSalle enchaînait dessus → « Cannot read properties
   of undefined (reading 'then') » dès la gravure du scellé ;
   rechargerListes rend désormais TOUJOURS une promesse (Promise.all
   des trois listes + les scellés). Bonus : le correctif V0.46 de
   fermerSalle/fermerPartie (visibilite publique dans le PATCH)
   n'était jamais entré dans le client en clair de la page — la
   greffe le porte enfin. ──
   V0.48 : LE REJOINT EST IDEMPOTENT — un joueur membre d’une partie
   qui clique de nouveau ENTRER (retour au hub sans QUITTER,
   reconnexion) se heurtait à SA PROPRE ligne membre : l’INSERT
   tombait en doublon de clé primaire et le toast disait « Impossible
   de rejoindre » alors que tout allait bien. Le rejoint public porte
   désormais "resolution=ignore-duplicates" : déjà membre = on ENTRE
   sans erreur, comme le fait déjà la RPC privée (on conflict do
   nothing). ──
   V0.49 : ORDONNANCE DE L'ÉCRAN DE PARTIE (Protocoles Éternels) —
   ne garder que ce qui fonctionne : plus de boutons ← Hub / 📖
   Règles, plus de cadres démo Signa-3 / Ork Boy, plus de combat
   d'entraînement. L'écran devient un système d'ONGLETS : CANTINA
   d'abord (Console de partie en cadre console + Jet de Dés avec
   face de dé en points + Journal append-only dessous), puis
   SCENARIO côté MJ (coming soon + fiches de la table) et FICHE
   PERSONNAGE côté joueur (l'unité réelle, registre à la porte,
   création — état vide sinon). L'entête passe à gauche (glyphe +
   titre + badge rôle, sous-titre K-BoT) et l'avatar du joueur
   s'affiche à droite avec le halo de son rôle, comme au Hub. Le
   bandeau CONSOLE DE PARTIE en bas de page disparaît pour ce
   noyau-40k (les autres packs le gardent). ──
   V0.50 : UNIFORMISATION EN-TÊTE/PIED DE L'ÉCRAN DE PARTIE — le titre
   « Les Protocoles Éternels » porte désormais EXACTEMENT le style du
   titre L'ARCHIVISTE du hub (text-2xl blanc tracking-wide, sous-titre
   K-BoT en tracking-widest gris comme CUSTODES MEMORIAE) ; la vignette
   MJ/JOUEUR disparaît de l'entête : le halo de l'avatar EST le statut
   (ambre = MJ, turquoise = joueur). Et le pied « Powered by Vibe ·
   N° 0.XX » devient une RÈGLE GÉNÉRALE : il vit sur TOUS les écrans,
   collé au bas (flex flex-col) — le noyau-40k l'avait oublié. ──
   V0.51 — L'ICÔNE JOUEUR, SEULE ET PARLANTE : plus de texte
   « pseudo · Maître de la Tombe » à gauche de l'icône dans l'entête
   de partie — l'icône seule (son halo dit le rôle), et son clic
   ouvre le cadre COMPTE — CLOUD, exactement comme dans le hub
   (CompteJoueur partagé, nouvelle option avatarSeul). ──
   V0.52 : LA CIBLE AUX QUATRE COUPES, ICÔNE DU JEU — le candidat n° 9
   validé par Michael (chantier K-BoT) devient l'icône des Protocoles
   Éternels partout où le pack s'affiche : tuile du hub, entête de
   l'écran de partie, entête générique des packs, lecteur de documents
   (composants CibleJeu + GlyphePack ; le glyphe texte ⟁ reste en repli
   pour les autres packs — les données du manifeste ne bougent pas). ──
   V0.53 — LA CIBLE AFFIRMÉE : Michael la trouvait un peu menue à
   l'œil (des traits fins pèsent moins qu'un glyphe plein) — anneaux
   épaissis 6 → 8 px, œil 9 → 10, et empreinte agrandie : tuile du
   hub 40 → 46, entête de partie 34 → 40, entête générique et lecteur
   de documents 30 → 34. La géométrie des coupes reste celle du n° 9
   validé (3 h, 4 h 30, 7 h 30, 9 h — morsure 52..66). ──
   V0.54 — LA CIBLE RECADRÉE, UNE SEULE IMAGE : le viewBox de
   CibleJeu épouse désormais le dessin ("30 30 132 132", zéro
   marge interne — le dessin remplissait 132/192 de sa boîte,
   ~15,6 % de vide de chaque côté, contre 6 % pour l'hexagone
   du D20 du bandeau). Calibrage sur l'icône D20 (44 px, dessin
   visible ~38,7 px) : entêtes pack + partie + lecteur à 40 px
   (dessin visible 40 px), tuile du hub 44 px dans son cadre
   56 px (6 px d'air). ──
   V0.55 — GM : LES IDs INTERNES DEVENNENT OPAQUES : les jeux
   passent aux IDs internes GM-0001 (Les Protocoles Éternels),
   GM-0002 (Stormbringer), GM-0003 (Bloodlust) — dans le code,
   les fichiers packs/GM-000X.json et la colonne jeu de la
   Tombe ; l'affichage garde les noms complets du manifeste.
   Les noyaux (noyau-40k, noyau-d100) attendent leur refonte.
   La valeur « critiques: "bloodlust" » (style de critique,
   pas un ID de jeu) reste inchangée. ──
   V0.56 — PROTOCOLE Ω : le jeu GM-0001 change de nom
   d'affichage : « Les Protocoles Éternels » devient
   « Protocole Ω » (façade pure — l'ID interne GM-0001,
   les fichiers packs et la Tombe ne bougent pas). Le
   libellé du glyphe passe à « Glyphe GM-0001 » : les
   textes internes parlent d'IDs, pas de noms. ──
   V0.57 — L'ORDONNANCE UNIVERSELLE : l'écran de partie à onglets
   devient la coquille de TOUS les JDR Multi. Chaque pack déclare
   son salon dans son contenu (GM-0001 CANTINA, GM-0002 TAVERNE,
   GM-0003 CAMP) ; le noyau-d100 gagne la même ordonnance que le
   noyau-40k : entête de partie (icône joueur seule + compte),
   onglets SALON (console de partie + jet 1D100 à face chiffrée
   DeFace100 + journal append-only) puis SCENARIO côté MJ (coming
   soon) ou FICHE PERSONNAGE côté joueur (fiche, création, forge,
   lutte de POU, SAN). Le bandeau bas de console disparaît : chaque
   jeu porte sa console dans son salon, et PackEntete quitte la
   scène (l'entête de partie fait foi). ──
   V0.58 — LES GLYPHES DES TROIS JEUX : chaque pack affiche sa
   propre icône vectorielle, dessinée plein cadre sans marge
   intérieure — les Flèches du Chaos (les huit pointes, symbole
   canonique de Stormbringer : celles des axes touchent les bords,
   celles des diagonales tombent dans les coins) pour GM-0002, la
   Gemme et le démon (le losange inscrit au carré, la goutte de
   sang suspendue au centre) pour GM-0003. La Cible aux quatre
   coupes reste celle de GM-0001 ; le glyphe texte ne survit qu'en
   repli. ──
   V0.59 — GLYPHES FIDÈLES AUX MAQUETTES : la V0.58 avait répondu au
   « sans marge intérieure » en étirant les dessins jusqu'aux bords —
   les proportions des maquettes validées s'en trouvaient déformées.
   Correction : les Flèches du Chaos et la Gemme et le démon reprennent
   EXACTEMENT la géométrie des maquettes, et l'absence de marge vient
   du CADRAGE — le viewBox épouse le dessin (comme la Cible fait déjà),
   pas l'inverse. ──
   V0.60 — LA FICHE RICHE : le noyau d100 adopte le personnage du
   REGISTRE du joueur dès l'entrée (avant : seule une création en
   session remplaçait la fiche démo — la Tombe n'était jamais relue).
   La SAN affichée devient la SAN COURANTE de la fiche (Mad Marthygann
   : 99/175), et la fiche montre ce que la Tombe garde : PV et blessure
   majeure, S.F.T, identité, armes, armures, pouvoirs, possessions.
   Chaque bloc n'existe que si la fiche le porte — les fiches anciennes
   ne changent pas d'un pixel. ──
   V0.61 — LES THÈMES DE LA FICHE : quand le pack déclare ses familles
   de compétences (Stormbringer : ARMES - ARMURES, CONNAISSANCE,
   INVOCATION, PERCEPTION, COMMUNICATION, MANIPULATION, AGILITÉ,
   DISCRÉTION), la fiche range chaque compétence SOUS SON THÈME — le
   MJ dit « Crocheter », le joueur voit MANIPULATION. Les entêtes
   CARACTÉRISTIQUES, ARMES - ARMURES et POSSESSION prennent la couleur
   du pack ; le sélecteur de jets se groupe pareil. Les compétences
   non répertoriées restent visibles sous « AUTRES » — jamais cachées.
   Les packs sans familles gardent la fiche d'avant, au pixel. ──
   V0.62 — LE CATALOGUE ET LES BONUS DU LIVRE V2 : le pack GM-0002 déclare
   la liste COMPLÈTE des compétences du manuel (§4.11) avec leur
   « % de départ » (departCompetences : « 10+ », « bonus », « 0 ») — la
   fiche montre tout, même à 0. Les bonus de famille (livre v2, §2.5)
   sont calculés purs depuis les caracs (bonusCompetences) : +1 %/pt
   au-dessus de 12, −1 %/pt en dessous de 9, TAI inversée, Connaissance
   ×2 + âge. Une compétence « bonus » non apprise se joue SUR le bonus
   de sa famille ; une « 10+ » sur 10 + bonus ; une « 0 » exige un
   maître — jamais au jet. INVOCATION, maison, reste sans bonus. ──
   V0.63 — LE LIVRE GRAVÉ DANS LA MACHINE : le moteur du livre
   Stormbringer v2 (REGLES_SB — fonctions pures §2-§8 : création,
   mouvement, combats, compétences, sorcellerie, cultes, santé
   mentale, créatures) vit dans l'APP ; le pack GM-0002 déclare
   « livre: "sb-v2" » — le livre gravé (données v7.0,
   packs/livre-sb-v2.json) est fetché à l'entrée du pack et injecté
   dans le moteur. Invisible : aucun panneau ne l'affiche encore —
   préparation des panneaux du salon (SAN, folie, invocations). ──
   V0.64 — LA TAVERNE DU JOUEUR, LE TITRE DE CHAQUE JEU : le sous-titre
   de l'entête vient du MANIFESTE (sousTitre : K-BoT pour Protocole Ω,
   « Cycle d'Elric » pour Stormbringer, « Les armes-dieux » pour
   Bloodlust) et le trait de couleur sous le titre disparaît ; le pied
   « Powered by Vibe · N° » vit aussi sur le noyau-d100, collé en bas ;
   la TAVERNE est l'onglet du JOUEUR seul (le MJ garde SCENARIO) : le
   Jet de Dés en haut, la CONSOLE DE PARTIE en cadre COLLÉE EN BAS ; le
   journal append-only déménage dans un nouvel onglet JOURNAL, à droite
   de FICHE PERSONNAGE. Et la règle d'or du jour : AUCUN EMOJI dans
   l'interface (le cadenas seul reste). ──
   V0.65 — LE SALON UNIFIÉ : la TAVERNE est le LOBBY de Stormbringer,
   pour le MJ AUSSI — même cadre, mêmes fonctions que le SALON du LOBBY
   de Protocole Ω (ChatSalon : fil, envoi, connectés), seuls le nom et
   la couleur changent (l'accent du jeu teinte le cadre) ; le Jet de
   Dés quitte la Taverne (il reviendra avec l'intégration visuelle) ;
   l'icône des connectés devient un bouton texte CONNECTÉS (règle
   sans emoji). ──
   V0.66 — LE SALON DU JEU : la TAVERNE n'est PAS la console de partie —
   c'est le salon du JEU Stormbringer, l'endroit où joueurs et MJ se
   réunissent AVANT de lancer une aventure (comme le LOBBY de Protocole
   Ω) : le canal du JDR (jeu, null) de la Tombe, vivant dès l'ouverture
   du jeu, sans attendre une partie — plus de cadre muet. La console
   d'AVENTURE vivra sur la page de l'aventure, quand elle existera. ──
   V0.67 — LA STRUCTURE COMMUNE, POSÉE EN RÈGLE : toute page de jeu
   (JOUEUR ou MJ), avant de lancer/rejoindre une aventure, vit la MÊME
   structure — l'entête porte le TITRE DU JEU seul (plus de bandeau
   « L'ARCHIVISTE » : EcranPartie l'arbore encore au-dessus de son
   titre, il le perd ; EntetePartie, le compte joueur à droite, le
   retour HUB devient sa prop onRetour) ; les onglets sont MJ :
   LOBBY - AVENTURES - RÈGLES, joueur : LOBBY - AVENTURES -
   PERSONNAGES - RÈGLES (le noyau d100 adopte l'ordonnance du 40k ;
   AVENTURES et RÈGLES y sont coming soon, PERSONNAGES porte le
   REGISTRE du compte — extrait en composant partagé
   RegistrePersonnages — puis la fiche ; l'onglet JOURNAL déménage,
   il quitte la barre). Le terme TAVERNE devient le nom du LOBBY DE
   L'AVENTURE (la future page d'aventure). ──
   V0.68 — LA FICHE PERSONNAGE, PREMIÈRE PIERRE : Stormbringer d'abord
   (Michael le Maître de la Tombe) — la fiche ouvre sur la DESCRIPTION
   COMPLÈTE du personnage (PERSONNAGE : Nom, Sexe, Age, Yeux, Cheveux,
   Nationalité, Culte — « — » tant que la fiche ne le porte pas), puis
   LES TROIS JAUGES juste après : Points de Vie, Santé Mentale, S.F.T ;
   le cadre du démon de test (adversaire + lutte de POU) quitte la
   fiche — l'Arme vivante garde sa forge ; les compétences non
   apprises portent leur SCORE (« 0 % »), jamais le seuil calculé, et
   AUCUNE n'est grisée : au jet, tout 0 % se joue à 0 + bonus de
   famille (la règle du « maître d'abord » du livre s'incline devant
   la table — Michael l'a tranché) ; les POUVOIRS du personnage sont
   des pouvoirs d'INVOCATION gagnés (le nécromancien) : ils vivent
   désormais DANS la famille INVOCATION de la fiche. ──
   V0.69 — LES POUVOIRS OFFICIELS DU LIVRE : les pouvoirs
   d'INVOCATION gagnés s'affichent comme les compétences de la
   famille (Sylphe, Gnome...) sauf que leur chance se joue à 3×POU
   (POU 35 → 3×POU · 105 %) — pour l'instant SEULS les pouvoirs
   OFFICIELS du livre gravé s'affichent (pouvoirs démoniaques §5.7.1,
   esprits élémentaires §5.4, Seigneurs §5.9-§5.10) ; les pouvoirs
   maison (gagnés en aventure) attendront leur gravure (Michael) ;
   le bouton « Créer un aventurier » en bas de fiche disparaît —
   l'écran de création est le chantier suivant. ──
   V0.70 — LA FICHE PLEINE LARGEUR + LES OBJETS PHYSIQUES : la fiche
   occupe toute la largeur du cadre (Michael la voyait à moitié page —
   la seconde colonne est vide depuis le départ du démon de test) ;
   ARMES - ARMURES et POSSESSION deviennent des OBJETS PHYSIQUES comme
   dans Protocole Ω — une carte par objet, le nom en gras et ses
   caractéristiques à la suite (l'arme du 40k : « Blaster gauss ·
   tir · 48 m · A 2 · ... »). ──
   V0.71 — LA FICHE CHARSET PAPIER (Michael) : deux bandeaux pleine
   largeur (IDENTITÉ compacte en rangées façon fiche Chaosium, puis
   CARACTÉRISTIQUES + PV/SAN/S.F.T), corps en DEUX COLONNES —
   l'équipement (armes, armures, possession, désirs, NOTES) à
   gauche, les compétences à droite — une colonne sur mobile
   (l'ordre de lecture y redevient compétences puis équipement,
   par order-*). Un bloc NOTES vide se remplit à la main. Le CSS
   print (entree.css) rend la fiche PAPIER CLAIR : fond blanc,
   texte noir, seul le contenu de la fiche s'imprime. ──
   V0.72 — LA FICHE RÉORGANISÉE EN BANDEAUX (Michael) : ARMES -
   ARMURES descend en BANDEAU sous le S.F.T, ses ARMES à gauche
   et ses ARMURES à droite ; POSSESSION et NOTES ferment la
   fiche en BANDEAUX pleine largeur ; tout le reste — les
   familles de compétences, les pouvoirs du repli, les désirs —
   se répartit sur les deux colonnes du milieu ; l'espace entre
   les jauges PV/SAN/S.F.T resserre (Michael trouve la fiche
   trop aérée là). Nationalité/Culte de Mad Marthygann gravés
   dans la Tombe : Eshmirien · élémentaire de l'air. ──
   V0.73 — LA FICHE EN CINQ BLOCS DISTINCTS (Michael) : cinq
   cadres séparés — ① le bandeau IDENTITÉ + CARACTÉRISTIQUES
   EN UNE LIGNE DE LÉGENDES (le nom posé sur la bordure du
   petit cadre, façon fieldset/legend) + les jauges, Points de
   Vie EN CASES (16 PV = 16 cases, la classe pv-pleine garde
   le contraste sur papier) ; ② le bandeau ARMES - ARMURES ;
   ③ le bloc COLONNES ÉQUILIBRÉES des compétences (md:columns-2
   — le flux de l'impression : chaque famille descend la
   première colonne puis remplit la seconde, SANS les vides
   d'alignement des rangées de grille) ; ④ le bandeau
   POSSESSION ; ⑤ le bandeau NOTES. ──
   V0.74 — LA PHYSICALISATION DE L'ÉQUIPEMENT (Michael) : DÉSÉQUIPER
   range l'arme ou l'armure dans le sac (zone « ÉQUIPEMENT RANGÉ » du
   bandeau POSSESSION — l'objet garde ses caractéristiques, son
   drapeau equipe passe à false) ; ÉQUIPER ne se fait que la place
   libre (une arme, une armure). La grande fiche s'OUVRE depuis le
   registre (l'écrou du perso) et grave chaque geste dans la Tombe
   (archiviste_personnages.contenu, PATCH majPersonnage) ; la fiche
   démo et la création fraîche ne vivent qu'à l'écran.
   V0.75 — L'ÉVEIL SÉQUENTIEL (Michael) : la création d'aventurier
   devient un RITUEL EN SIX ÉTAPES SCELLÉES (l'ordonnance du livre
   §2 fait loi — chaque validation verrouille, jamais de retour) :
   ① NAISSANCE (nom + sexe — le sexe pèse sur les ajustements
   nationaux), ② LES DÉS (7×3D6 — toujours validable, la pitié du
   livre offre la relance si total ≤ 52 : JAMAIS un plafond), ③ LA
   NATIONALITÉ (1D100, le Chaos décide — ses ajustements s'appliquent
   aux dés, son modificateur de SAN et ses classes forcées notés),
   ④ L'ORIGINE SOCIALE (1D100 sauf classes forcées, l'âge base 25),
   ⑤ LES COMPÉTENCES (de classe — les armes deviennent objets
   physiques — universelles, et 1D6+2 supplémentaires choisies), ⑥
   LA GRAVURE (PV, SAN, SFT, bonus de dommages, bénéfices — la fiche
   complète naît). La corpulence et l'histoire personnelle vivent
   HORS rituel, en liberté sur la fiche. ──
   V0.76 — LE PERSO POUR L'AVENTURE (Michael) : dans le registre
   « MES PERSONNAGES », un bouton PRENDRE vit À GAUCHE de l'écrou ;
   le personnage pris sera CELUI QUE L'ON CONNECTE à l'aventure.
   La sélection vit dans le sac du compte (la Tombe — un perso par
   jeu, elle survit rechargements et appareils) ; re-cliquer dépose
   le perso (« PRIS POUR L'AVENTURE » redevient PRENDRE). La prise
   AFFICHE LA FICHE : la grande fiche dans le noyau d100, la fiche
   du registre dans le lobby. Le branchement réel à la table (le
   d100 adopte le perso choisi plutôt que le premier) viendra d'un
   protocole futur. ──
   V0.77 — LE BRANCHEMENT À LA TABLE (Michael) : la sélection NE
   MARQUE PLUS, elle AGIT. Le noyau d100 adopte le perso PRIS POUR
   L'AVENTURE (sinon le premier de la liste, comme avant) et la
   fiche SUIT la sélection en direct — changer de prise écrase la
   fiche affichée, même née du rituel de création ; seule une
   création qui ne touche pas la sélection garde sa fiche vivante.
   La porte du 40k se branche aussi : l'unité PRIS entre d'elle-même
   dans la Tombe dès l'arrivée à la porte (la fiche de partie
   existante prime, le choix manuel reste pour changer d'avis, le
   bouton du pris porte l'or et la pastille ●). Le perso PRIS qui
   quitte le registre (suppression) rend sa place : la sélection
   se dépose. ── */
const BUILD = "0.77";

/* ════════════════════════════════════════════════════════════════
   ALPHA ZÉRO — le launcher lit des PACKS (données), il ne code rien.
   Architecture du manifeste v1.2 (canvas jdr-manifeste-pack-v1) :
   manifeste.json → types de packs → socle mécanique → journal.
   ════════════════════════════════════════════════════════════════ */

