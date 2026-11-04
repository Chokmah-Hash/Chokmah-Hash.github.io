const fs = require("fs");
let page = fs.readFileSync("index.html", "utf8");
const P = JSON.parse(fs.readFileSync("patch-v055.json", "utf8"));
for (const [a, n, attendu] of P) {
  const nb = page.split(a).length - 1;
  if (nb !== (attendu || 1)) { console.error("ECHEC (" + nb + " occ., attendu " + (attendu || 1) + ") : " + JSON.stringify(a.slice(0, 60))); process.exit(1); }
  page = page.split(a).join(n);
}
const debut = page.indexOf("/*__APP__*/");
const fin = page.indexOf("  </script>", debut);
if (debut < 0 || fin < 0) { console.error("MARQUEURS APP INTROUVABLES"); process.exit(1); }
new Function(page.slice(debut + 12, fin));
if (page.indexOf('const BUILD = "0.55"') < 0) { console.error("BUILD MANQUANT"); process.exit(1); }

/* Les fichiers packs : l'ID est le NOM DE FICHIER — on renomme */
for (const [ancien, gm] of [["protocoles-eternels", "GM-0001"], ["stormbringer", "GM-0002"], ["bloodlust", "GM-0003"]]) {
  const de = "packs/" + ancien + ".json";
  const vers = "packs/" + gm + ".json";
  if (!fs.existsSync(de)) { console.error("PACK INTROUVABLE : " + de); process.exit(1); }
  fs.renameSync(de, vers);
}

fs.writeFileSync("index.html", page);
console.log("V0.55 OK — " + page.length + " caracteres, packs renommes GM-0001/2/3");
