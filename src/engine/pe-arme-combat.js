/* Résout une arme PÉ en stats de combat : « A »/« A+1 » contre l'Attaque de
   l'unité, « F+1 »/« F+2 » contre sa Force, « D3 » se lance aux dégâts.
   (Code moteur : vit hors de la zone PACKS_DATA pour rester dans la page.) */
function peArmeCombat(def, st) {
  const mF = /^F\+(\d)$/.exec(String(def.f));
  return {
    nom: def.nom, tir: def.tir, portee: def.portee, regle: def.regle,
    bs_ws: def.tir ? st.ct : st.cc,
    attaques: def.att === "A" ? st.a : def.att === "A+1" ? st.a + 1 : parseInt(def.att, 10),
    f: mF ? st.f + Number(mF[1]) : parseInt(def.f, 10),
    pa: -parseInt(String(def.pa).replace("−", ""), 10),
    degats: def.d === "D3" ? () => 1 + Math.floor(Math.random() * 3) : parseInt(def.d, 10)
  };
}

