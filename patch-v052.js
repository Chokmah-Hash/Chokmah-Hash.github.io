const fs = require("fs");
const chemin = process.argv[2];
let page = fs.readFileSync(chemin, "utf8");
const P = JSON.parse(fs.readFileSync("patch-v052.json", "utf8"));
for (const [a, n] of P) {
  const nb = page.split(a).length - 1;
  if (nb !== 1) { console.error("ECHEC (" + nb + " occ.) : " + JSON.stringify(a.slice(0, 60))); process.exit(1); }
  page = page.split(a).join(n);
}
const debut = page.indexOf("/*__APP__*/");
const fin = page.indexOf("  </script>", debut);
if (debut < 0 || fin < 0) { console.error("MARQUEURS APP INTROUVABLES"); process.exit(1); }
new Function(page.slice(debut + 12, fin));
if (page.indexOf('const BUILD = "0.52"') < 0) { console.error("BUILD MANQUANT"); process.exit(1); }
fs.writeFileSync(chemin, page);
console.log("V0.52 OK — " + page.length + " caracteres, parse OK, BUILD 0.52");
