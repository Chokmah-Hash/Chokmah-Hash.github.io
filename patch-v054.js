const fs = require("fs");
let page = fs.readFileSync("index.html", "utf8");
const P = JSON.parse(fs.readFileSync("patch-v054.json", "utf8"));
for (const [a, n, attendu] of P) {
  const nb = page.split(a).length - 1;
  if (nb !== (attendu || 1)) { console.error("ECHEC (" + nb + " occ., attendu " + (attendu || 1) + ") : " + JSON.stringify(a.slice(0, 60))); process.exit(1); }
  page = page.split(a).join(n);
}
const debut = page.indexOf("/*__APP__*/");
const fin = page.indexOf("  </script>", debut);
if (debut < 0 || fin < 0) { console.error("MARQUEURS APP INTROUVABLES"); process.exit(1); }
new Function(page.slice(debut + 12, fin));
if (page.indexOf('const BUILD = "0.54"') < 0) { console.error("BUILD MANQUANT"); process.exit(1); }

fs.writeFileSync("index.html", page);
console.log("V0.54 OK — " + page.length + " caracteres");
