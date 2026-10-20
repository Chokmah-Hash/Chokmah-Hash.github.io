# THEME.md - Charte graphique du site "Les Protocoles Eternels"

Ce fichier est le catalogue du design du site. Pour demander une modification,
citez l objet de design par son nom. Exemple :

> "Dans le template : cadre-carte -> bordure plus fine, coins plus arrondis."

## Ou vit le design

- **assets/css/tokens.css** : LA charte - palette des 2 packs, polices, geometrie (rayons, largeurs). Charge avant main.css sur toutes les pages.
- **assets/css/main.css** : les composants (cadres, boutons, tableaux, nav...). Ils migrent vers tokens.css au fil des chantiers (phase 2).
- **assets/js/theme.js** : applique le pack choisi (attribut data-pack sur body), synchronise via Supabase (table parametres).
- **images/** : illustrations du site (planetes, POI).

Le pack (Imperium / Necrons) se change depuis la Zone MJ, onglet Configuration,
carte "Apparence du site" - ou directement dans la table parametres (cle "pack").

## Catalogue des objets de design

### Palette et packs
- **pack-imperium** (defaut) : ambre et or. Palette dans tokens.css, bloc :root.
- **pack-necrons** : vert gaussique. Palette dans tokens.css, bloc body[data-pack="necrons"].
- Tokens : --bg (fond), --glow (halo), --panel (cadres), --panel2 (zones internes), --teal (accent principal), --amber (secondaire / zone MJ), --text, --muted, --danger, --navbg (barre de nav).

### Objets de structure
- **page-largeur** : 1000 px (token --largeur-page), contenu centre (.wrap).
- **barre-nav** (.nav) : sticky, fond translucide --navbg + blur, liseret bas --tealline.
- **sous-menu** (.subnav) : barre de sections sous la nav, sticky, burger si debordement.
- **cadre-carte** (.card) : fond --panel, bordure 1px --tealline, rayon 14 px (token --rayon-cadre).
- **cadre-ambre** (.card.amber) : variante reservee a la zone MJ (bordure --amberline).
- **bouton-principal** (.btn.primary) : fond --teal, texte sombre, rayon 9 px, hauteur 46 px.
- **bouton-ambre** (.btn.amber) : contour --amber, transparent - actions zone MJ.
- **badge** : pilule (rayon 99 px), Rajdhani majuscules, bordure --tealline.
- **tableau** (.rt) : bordures fines ; variantes .amber (zone MJ) et .mini (bestiaire).
- **pastille-etoile** (.pe-star) : pastille radale qui remplace les emojis, suit le pack ( MJ : ambre).
- **titre-section** (h2) : Rajdhani, majuscules, espacement .12em, couleur --teal.
- **pied-de-page** (.foot) : bordure haute --tealline, texte --muted.

### Specifique (hors template)
- **fond-galaxie** : image IA Cloudinary - valide par le MJ, ne plus toucher.
- **carte-galaxie** : moteur procedurale (galaxie.js) - etoiles, grille C/L, planetes, POI.
- **page-404** : autonome, ne charge ni main.css ni tokens.css.

## Phases
1. **Phase 1 (2026-10-19)** : creation de tokens.css + THEME.md, branchement des pages, aucune modification visuelle. FAIT.
2. **Phase 2** : migration progressive des composants de main.css vers tokens.css, et ramassage des styles inline (des.js, vue galaxie, consoles MJ) au fil des chantiers.
3. **Phase 3** : charte poussee avec images - bordures illustrees, icones perso. Avec les tokens en place il suffira de dire : "template : cadre-carte -> image de bordure".

## Conventions
- Le pack est un choix du MJ (table parametres, cle "pack"), jamais par joueur.
- Toute nouvelle couleur / marge / coin va dans tokens.css, avec un nom en francais.
- Ne jamais coder une couleur en dur dans une page : toujours var(--...).
- 404.html reste autonome (pas de template).
