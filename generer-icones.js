/* ════════════════════════════════════════════════════════════════════
   generer-icones.js — les icônes PWA de L'Archiviste (zéro dépendance).
   Le glyphe : l'Icosaèdre D20 choisi par Michael — silhouette hexagonale
   pointe en haut, 6 arêtes droites vers l'unique point central.
   Tourne en local (node generer-icones.js) et dans GitHub Actions.
   ════════════════════════════════════════════════════════════════════ */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const FOND = [12, 13, 16];      // #0c0d10 — fond d'Archiviste
const ZINC = [168, 173, 184];   // #a8adb8 — le chrome du launcher
const ICO = "icons";

/* ── CRC32 (PNG exige le sien) ── */
const TABLE_CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = TABLE_CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/* ── Morceau PNG ── */
function morceau(type, donnees) {
  const t = Buffer.from(type, "ascii");
  const long = Buffer.alloc(4);
  long.writeUInt32BE(donnees.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, donnees])), 0);
  return Buffer.concat([long, t, donnees, crc]);
}

function ecrirePNG(chemin, taille, pixels) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(taille, 0);
  ihdr.writeUInt32BE(taille, 4);
  ihdr[8] = 8;   // profondeur : 8 bits
  ihdr[9] = 6;   // couleur : RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filtre
  ihdr[12] = 0;  // entrelacement
  /* Scanlines : 1 octet de filtre (0) + RGBA par pixel */
  const brut = Buffer.alloc(taille * (taille * 4 + 1));
  for (let y = 0; y < taille; y++) {
    brut[y * (taille * 4 + 1)] = 0;
    pixels.copy(brut, y * (taille * 4 + 1) + 1, y * taille * 4, (y + 1) * taille * 4);
  }
  const idat = zlib.deflateSync(brut, { level: 9 });
  fs.writeFileSync(chemin, Buffer.concat([signature, morceau("IHDR", ihdr), morceau("IDAT", idat), morceau("IEND", Buffer.alloc(0))]));
}

/* ── Géométrie : l'icosaèdre hexagonal, pointe en haut ──
   Hexagone inscrit dans un cercle de rayon R + 6 rayons (sommet → centre). */
function segmentsIcosaedre(R) {
  const centre = { x: 0, y: 0 };
  const sommets = [];
  for (let k = 0; k < 6; k++) {
    const a = -Math.PI / 2 + k * Math.PI / 3; // pointe en haut
    sommets.push({ x: R * Math.cos(a), y: R * Math.sin(a) });
  }
  const segs = [];
  for (let k = 0; k < 6; k++) segs.push([sommets[k], sommets[(k + 1) % 6]]); // contour
  for (let k = 0; k < 6; k++) segs.push([sommets[k], centre]);               // les 6 arêtes internes
  return segs;
}

/* Distance point ↔ segment */
function distSegment(px, py, s) {
  const a = s[0], b = s[1];
  const vx = b.x - a.x, vy = b.y - a.y;
  const wx = px - a.x, wy = py - a.y;
  const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy)));
  const dx = px - (a.x + t * vx), dy = py - (a.y + t * vy);
  return Math.sqrt(dx * dx + dy * dy);
}

/* ── Rendu anti-aliasé d'une icône ── */
function rendreIcone(taille, rayonRel, demiTraitRel, avecFond) {
  const S = taille;
  const R = rayonRel * S;
  const demi = demiTraitRel * S;
  const segs = segmentsIcosaedre(R);
  const px = Buffer.alloc(S * S * 4);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const gx = x + 0.5 - S / 2, gy = y + 0.5 - S / 2;
      let d = Infinity;
      for (const s of segs) {
        const ds = distSegment(gx, gy, s);
        if (ds < d) d = ds;
      }
      /* alpha lissé sur 1 px de part et d'autre du trait */
      const a = Math.max(0, Math.min(1, demi - d + 0.5));
      const i = (y * S + x) * 4;
      if (avecFond) {
        px[i] = Math.round(FOND[0] * (1 - a) + ZINC[0] * a);
        px[i + 1] = Math.round(FOND[1] * (1 - a) + ZINC[1] * a);
        px[i + 2] = Math.round(FOND[2] * (1 - a) + ZINC[2] * a);
        px[i + 3] = 255;
      } else {
        px[i] = ZINC[0]; px[i + 1] = ZINC[1]; px[i + 2] = ZINC[2];
        px[i + 3] = Math.round(a * 255);
      }
    }
  }
  return px;
}

/* ── Production ── */
const dossier = path.join(__dirname, ICO);
fs.mkdirSync(dossier, { recursive: true });

const gabarits = [
  { nom: "icon-512.png", taille: 512, rayon: 0.38, trait: 0.020, fond: true },
  { nom: "icon-192.png", taille: 192, rayon: 0.38, trait: 0.020, fond: true },
  { nom: "icon-512-maskable.png", taille: 512, rayon: 0.26, trait: 0.016, fond: true },
  { nom: "icon-192-maskable.png", taille: 192, rayon: 0.26, trait: 0.016, fond: true },
  { nom: "apple-touch-icon.png", taille: 180, rayon: 0.38, trait: 0.021, fond: true }
];

for (const g of gabarits) {
  const px = rendreIcone(g.taille, g.rayon, g.trait, g.fond);
  ecrirePNG(path.join(dossier, g.nom), g.taille, px);
  console.log("✓ " + ICO + "/" + g.nom + " (" + g.taille + "×" + g.taille + ")");
}
console.log("Icônes de L'Archiviste gravées — " + gabarits.length + " fichiers.");
