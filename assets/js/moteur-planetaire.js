/*! Moteur planétaire V3 — Les Protocoles Éternels · 9 recettes (terra/aride, dead, ice, ocean, volcanic, toxic, gas)
    Partagé entre planetes.html et galaxie.html. IIFE : aucun symbole global sauf window.PE. */
(function(){
// ---- MOTEUR V3 (verbatim de la maquette de reference) ----
function prng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// parametres bornes : defaults = valeurs de la maquette. Chaque planete peut overrider.
var PARAMS={
  type:'terra',       // 'terra' | 'dead' | 'ice' | 'ocean' | 'volcanic' | 'toxic' | 'gas' : recette de biome
  nCrat:12,           // nombre de cratons/cratères
  cratR:[35,115],    // rayon des cratons en px
  cratS:[0.5,0.8],   // force d'elevation des cratons
  lob:[0.35,1.45],   // forme des bords (FIGE)
  sea:0.51,          // seuil ocean/terre (FIGE)
  iceT:[0.05,0.12],  // epaisseur calottes en % du rayon (FIGE)
  iceP:0.7,          // probabilite qu'une planete ait des calottes
  vegT:1.01,          // seuil vegetation : >1 = deserte (aucune vegetation)
  cratK:1,            // (obsolete si cratQuotas actif) biais taille cratères morts
  cratQuotas:null,    // QUOTAS par classe : [[diamMin,diamMax,nMin,nMax], ...]
  toxOC:null,         // teinte OCEAN toxique (RGB) — surcharge la palette normale
  gasPal:'gold',      // palette gazeuse : 'gold' (Saturne) | 'rust' (Jupiter) | 'ice' (Neptune)
  gasBand:1,         // densite des bandes gazeuses (1 = normale)
  gasStorms:2,        // nombre de tempetes ovales
  atmo:'79,140,220'   // couleur du halo atmospherique
};
function bt(r,b){return b[0]+r()*(b[1]-b[0]);}   // tirage borne [min,max]
function genMap(seed,W,H){
  W=W||720;H=H||405;
  function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  var rnd=mulberry(seed);
  var GS=8,gw=Math.ceil(W/GS)+2,gh=Math.ceil(H/GS)+2;
  var grid=new Float32Array(gw*gh);
  for(var gi=0;gi<grid.length;gi++)grid[gi]=rnd();
  function sm(t){return t*t*(3-2*t);}
  function gr(a,b){return grid[((b%gh+gh)%gh)*gw+((a%gw+gw)%gw)];}
  function noise(x,y){
    var gx=x/GS,gy=y/GS,x0=Math.floor(gx),y0=Math.floor(gy),fx=sm(gx-x0),fy=sm(gy-y0);
    var a=gr(x0,y0)+(gr(x0+1,y0)-gr(x0,y0))*fx,b=gr(x0,y0+1)+(gr(x0+1,y0+1)-gr(x0,y0+1))*fx;
    return a+(b-a)*fy;
  }
  function fbm(x,y){var v=0,amp=0.5,f=1;for(var o=0;o<5;o++){v+=amp*noise(x*f,y*f);amp*=0.5;f*=2;}return v;}
  // palettes d'ocean varies : le seed en choisit une (teinte + profondeur)
  var OCEANS=[[18,52,70],[12,60,58],[26,46,86],[10,42,52],[40,42,66],[16,58,62]];
  var OC=OCEANS[Math.floor(rnd()*OCEANS.length)];
  if(PARAMS.type==='toxic')OC=PARAMS.toxOC||[110,150,60];   // ocean empoisonne (teinte par monde)
  var isDead=(PARAMS.type==='dead');   // recette Lune/Mercure : cratères en puits, pas d'océan
  var isIce=(PARAMS.type==='ice');     // recette Boule de glace : océan gelé blanc, terres neigeuses
  var isOcean=(PARAMS.type==='ocean'); // recette Océan intégral : mer dominante, pas de continent
  var isVolcanic=(PARAMS.type==='volcanic'); // recette Volcanique : pas de mer, basalte + lave orange
  var isToxic=(PARAMS.type==='toxic');   // recette Toxique : aride + ocean verdit/jauni (acide)
  var isGas=(PARAMS.type==='gas');      // recette Gazeuse : bandes zonales, PAS de surface
  // TEMPETES ovales (gazeuse) : 2 orages places par le seed
  var storms=[];
  if(isGas){
    var nSt=Math.max(0,Math.round(PARAMS.gasStorms==null?2:PARAMS.gasStorms));
    for(var s3=0;s3<nSt;s3++){
      var rx0=W*(0.045+rnd()*0.035);
      storms.push({x:(0.30+rnd()*0.40)*W,y:H*(0.38+rnd()*0.24),rx:rx0,ry:rx0*0.55});
    }
  }
  // SEUIL D'OCEAN EFFECTIF : tres remonte pour l'océan intégral (seuls les
  // sommets de cratons emergent -> archipels, ~p97 de l'elevation), a zero
  // pour le volcanique (elevation min ~0.02 > 0 : terre partout, aucune mer).
  var SEA=PARAMS.sea;
  if(isOcean)SEA=Math.min(1.35,PARAMS.sea+0.60);
  if(isVolcanic)SEA=0;
  if(PARAMS.type==='terra'&&PARAMS.vegT>1)SEA=0;   // TEST ARIDE: pas de mer (monde desertique integral)
  var crat=[];
  if(isDead){
    // impacts DISPERSES sur tout le disque + QUOTAS PAR CLASSE DE TAILLE.
    // cratQuotas = [[diamMin,diamMax,nMin,nMax],...] : pour chaque classe on
    // tire un nombre dans [nMin,nMax], positions restent stratifiees.
    var rd2=Math.min(W,H)/2, cxm=W/2, cym=H/2;
    var quotas=PARAMS.cratQuotas||[[20,39,20,40],[40,74,10,20],[75,124,5,10],[125,239,2,4],[240,320,0,2]];
    var total=0,qi;
    for(qi=0;qi<quotas.length;qi++)total+=quotas[qi][2]+Math.floor(rnd()*(quotas[qi][3]-quotas[qi][2]+1));
    var step=Math.max(16,Math.sqrt(Math.PI*rd2*rd2/Math.max(1,total)));   // ~1 cellule par cratere
    var cells=[];
    for(var gy=(cym-rd2)/step;gy<=(cym+rd2)/step;gy++){
      for(var gx=(cxm-rd2)/step;gx<=(cxm+rd2)/step;gx++){
        var mx=gx*step+step/2, my=gy*step+step/2;   // centre de cellule
        if((mx-cxm)*(mx-cxm)+(my-cym)*(my-cym)<=rd2*rd2)cells.push([mx,my]);
      }
    }
    // melange les cellules (Fisher-Yates par le PRNG du monde)
    for(var si=cells.length-1;si>0;si--){
      var sj=Math.floor(rnd()*(si+1));
      var tmp=cells[si];cells[si]=cells[sj];cells[sj]=tmp;
    }
    var used=0;
    var bigPlaced=[];      // gros cratères déjà posés (pour la distance minimale)
    // test de répulsion pour les gros : assez loin des autres gros ?
    var fitsBig=function(cxy,dia){
      for(var bi=0;bi<bigPlaced.length;bi++){
        var ddx=cxy[0]-bigPlaced[bi][0],ddy=cxy[1]-bigPlaced[bi][1];
        var dd=Math.sqrt(ddx*ddx+ddy*ddy);
        if(dd<bigPlaced[bi][2]*0.65+dia*0.65+step*0.3)return false;
      }
      return true;
    };
    // LES GROS D'ABORD : classes par diamètre décroissant — les plus contraints
    // choisissent leurs cellules en premier, les petits comblent le reste.
    var order=[],oi;
    for(oi=0;oi<quotas.length;oi++)order.push(oi);
    order.sort(function(a,b){return quotas[b][0]-quotas[a][0];});
    for(var oj=0;oj<order.length;oj++){
      qi=order[oj];
      var q=quotas[qi];
      var nC=q[2]+Math.floor(rnd()*(q[3]-q[2]+1));   // nombre tire dans la fourchette
      var isBig=(q[0]>=125);                          // classes larges : répulsion
      for(var ci=0;ci<nC&&used<cells.length;ci++){
        var cc=cells[used],dia=q[0]+rnd()*(q[1]-q[0]),ok=true;
        var jit=isBig?0.15:0.6;                       // gros cratères : jitter reduit
        // ENCADREMENT : le cratere (anneau compris) doit tenir ENTIEREMENT dans
        // la texture, sinon le cadre le coupe d'une ligne droite visible.
        var infX=0.85*dia/2, infY=0.85*dia/2;    // rayon de l'anneau (cercles ronds)
        var fit=function(cxy){
          return cxy[0]-infX>=0&&cxy[0]+infX<=W&&cxy[1]-infY>=0&&cxy[1]+infY<=H;
        };
        if(!fit(cc)){
          // cherche une cellule ou le cratere tient entier (24 essais)
          var ft=1,fFound=-1;
          while(ft<24&&used+ft<cells.length){
            if(fit(cells[used+ft])&&(!isBig||fitsBig(cells[used+ft],dia))){fFound=used+ft;break;}
            ft++;
          }
          if(fFound<0){continue;}                     // pas de place : abandonne ce cratere
          used=fFound;cc=cells[used];
        }
        if(isBig){
          // cherche une cellule assez loin des autres gros (essaie 24 cellules)
          var tries=0,found=-1;
          while(tries<24&&used+tries<cells.length){
            var t=cells[used+tries];
            if(fitsBig(t,dia)){found=used+tries;break;}
            tries++;
          }
          if(found<0){continue;}                      // pas de place : ce cratère ne tombera pas
          used=found;cc=cells[used];
          bigPlaced.push([cc[0],cc[1],dia]);
        }
        // position finale : jitter borné pour rester entier dans la texture
        var fx=cc[0]+(rnd()-0.5)*step*jit, fy=cc[1]+(rnd()-0.5)*step*jit;
        if(fx<infX)fx=infX; if(fx>W-infX)fx=W-infX;
        if(fy<infY)fy=infY; if(fy>H-infY)fy=H-infY;
        // AGE : 70% recents (nets), 30% anciens (erodes, "fondus" dans le terrain)
        var ageR=rnd();
        var age=ageR<0.70?1:0.30+rnd()*0.35;        // 1 = frais, ~0.3-0.65 = erode
        crat.push({x:fx,y:fy,r:dia/2,s:bt(rnd,PARAMS.cratS)*age,ai2:rnd()*400,age:age});
        used++;
      }
    }
  } else if(!isGas) {
    for(var ci2=0;ci2<PARAMS.nCrat;ci2++){crat.push({x:rnd()*W,y:rnd()*H,r:bt(rnd,PARAMS.cratR),s:bt(rnd,PARAMS.cratS),ai2:rnd()*400});}
  }
  var d=new Uint8ClampedArray(W*H*4);
  var rimHit=null;          // marqueur des cretes de bourrelet (0-100)
  var pitHit=null;          // marqueur des parois (0-1 = profondeur le long de la pente)
  var pitAng=null;          // angle pixel->centre (pour l'ombre directionnelle)
  var floorHit=null;        // marqueur des fonds PLATS : age du cratere (0-100)
  var lavaHit=null;         // marqueur MER DE LAVE : assombrissement du centre (0-1)
  if(isDead){rimHit=new Uint8Array(W*H);pitHit=new Float32Array(W*H);pitAng=new Float32Array(W*H);floorHit=new Uint8Array(W*H);lavaHit=new Float32Array(W*H);}
  // PASSE 1 : elevations de chaque pixel + sommet du monde (ligne des neiges relative)
  var E=new Float32Array(W*H);var hMax=0;
  for(var y=0;y<H;y++){
    for(var x=0;x<W;x++){
      var e=fbm(x+13,y+7)*0.55+0.16*fbm(x*0.5+201,y*0.5+99);
      var near=0;
      for(var k=0;k<crat.length;k++){
        var c=crat[k];
        var dx=x-c.x,dy=y-c.y;
        var d2=(dx*dx+dy*dy)/(c.r*c.r);           // impacts RONDS (pas d'aplatissement 1.25)
        if(d2<2.6){                                  // rayon d'influence etendu
          var edge=1-d2/2.6;
          // bord tres anguleux : modulation forte, haute frequence angulaire
          var th=Math.atan2(dy,dx);
          var lob=0.35+1.1*noise(Math.cos(th)*7.5+c.ai2,Math.sin(th)*7.5+c.ai2);
          var w2=d2/(2.6*lob*lob);
          if(isDead){
            // CRATÈRE EN 3 ZONES (structure physique réelle) :
            //  - d2 0.42-0.62 : BOURRELET externe, bosse douce ("ronflement")
            //  - d2 0.30-0.42 : PAROI interne en pente -> ombre directionnelle
            //  - d2   < 0.30  : FOND PLAT, profondeur plafonnée, texture unie
            if(d2>=0.42&&d2<0.62){
              var b=(0.62-d2)/0.2;                       // 0 loin -> 1 a la crete
              e+=b*b*c.s*0.35;                          // bourrelet doux
              if(b>0.92)rimHit[y*W+x]=Math.round(b*100); // crete memorisee
            } else if(d2<0.42){
              var dd=0.42-d2;                            // 0 crete -> 0.42 fond
              if(dd>0.12)dd=0.12;                        // plafond : fond plat
              e-=dd*c.s*1.6;                             // encaissement paroi+fond
              if(d2>=0.30){
                var wall=(dd/0.12)*c.age;                // profondeur x age : les anciens s'effacent
                if(wall>pitHit[y*W+x]){pitHit[y*W+x]=wall;pitAng[y*W+x]=Math.atan2(y-c.y,x-c.x);}
              } else {
                floorHit[y*W+x]=Math.round(c.age*100);   // fond plat : intensite selon l'age
                var lava=(0.30-d2)/0.30;               // 0 bord du fond -> 1 centre exact
                var ld=lava*Math.min(1,(c.r-70)/60);    // MER LAVE: seulement Ø>=220, progressif jusqu'à Ø340
                if(ld>lavaHit[y*W+x])lavaHit[y*W+x]=ld; // le plus intense gagne
              }
            }
          } else if(w2<1){var a=(1-w2)*(c.s+0.18)-0.18;if(a>0)e+=(a*a)*(edge>0.3?1:edge);}
          if(edge>near)near=edge;                    // distance au craton le plus proche
        }
      }
      // bruit de fond affaibli loin des cratons -> iles en clusters autour
      e=e*(0.15+0.85*near);
      E[y*W+x]=e;
      var h0=(e-SEA)/0.6;
      if(h0>hMax)hMax=h0;
    }
  }
  // PASSE 2 : couleurs. Neige au-dessus de 72% de l'altitude du sommet du monde.
  var SNOW0=hMax*0.72;
  for(var y=0;y<H;y++){
    for(var x=0;x<W;x++){
      var e=E[y*W+x];
      var R,G,B;
      if(isGas){
        // ---- GAZ : bandes zonales SYMETRIQUES autour de l'equateur ----
        // (comme les calottes : la teinte depend de la DISTANCE a l'equateur,
        // donc l'hemisphere sud reflete exactement le nord)
        var lat=Math.abs(y/H*2-1);                    // 0 equateur -> 1 pole (miroir)
        var hemi=(y<H*0.5)?0:1;                       // nord=0, sud=1 : bruits distincts
        var wob=(fbm(x*0.045+55+hemi*911,lat*1.8+31)-0.5)*(hemi?0.16:0.08);   // ondulation N/S differente
        var bl=lat+wob*0.35;                         // latitude-miroir perturbee
        var bf=PARAMS.gasBand||1;                    // densite des bandes
        var bn=noise(bl*42*bf,12.3);                 // bandes larges
        var bn2=noise(bl*96*bf,7.7);                 // bandes fines
        var streak=fbm(x*0.10+801+hemi*533,lat*2.6+155);   // filaments, seed par hemisphere
        var grain2=fbm(x*6.5+31+hemi*733,lat*6.5+17);     // grain fin, seed par hemisphere
        var m=bn*0.60+bn2*0.40;
        var base2;
        // PALETTE gazeuse par style : Saturne dorée / Jupiter rousse / Neptune bleue
        if(PARAMS.gasPal==='rust'){
          if(m<0.14)      base2=[234,218,196];         // creme
          else if(m<0.28) base2=[224,190,150];         // sable rote
          else if(m<0.42) base2=[204,160,112];         // caramel
          else if(m<0.56) base2=[186,138,96];          // terracotta
          else if(m<0.70) base2=[168,120,84];          // roux profond
          else if(m<0.84) base2=[142,96,70];          // brun rote
          else            base2=[112,76,58];          // brun sombre
        } else if(PARAMS.gasPal==='ice'){
          if(m<0.14)      base2=[214,230,244];         // blanc bleuté
          else if(m<0.28) base2=[176,204,230];         // bleu clair
          else if(m<0.42) base2=[150,184,220];         // bleu azur
          else if(m<0.56) base2=[128,164,204];        // bleu moyen
          else if(m<0.70) base2=[108,144,188];         // bleu profond
          else if(m<0.84) base2=[92,124,172];          // bleu marine
          else            base2=[70,100,150];         // outremer
        } else {                                        // gold (Saturne)
        if(m<0.14)      base2=[238,222,192];           // creme lumineux
        else if(m<0.28) base2=[226,196,158];           // or pale
        else if(m<0.42) base2=[212,176,138];           // ambre doux
        else if(m<0.56) base2=[204,186,150];           // beige clair
        else if(m<0.70) base2=[196,166,128];           // camel
        else if(m<0.84) base2=[184,150,118];           // terre rosée
        else            base2=[154,126,98];           // brun doux
        }
        var sh2=0.90+(hemi?0.26:0.14)*(streak-0.5)+0.08*(bn2-0.5)+(hemi?0.07:0.04)*(grain2-0.5);  // grain/bruits d'intensite N/S distinctes
        R=base2[0]*sh2;G=base2[1]*sh2;B=base2[2]*sh2;
        var pd=1-0.16*Math.max(0,lat-0.62)/0.38;      // assombrissement polaire leger
        R*=pd;G*=pd;B*=pd;
        for(var si2=0;si2<storms.length;si2++){       // TEMPETES ovales
          var st=storms[si2];
          var dxs=(x-st.x)/st.rx, dys=(y-st.y)/st.ry;
          var q=dxs*dxs+dys*dys;
          if(q<1){
            var tt=1-q;
            var swirl=noise(dxs*4+st.x*0.1,dys*4+st.y*0.1);
            var sm2=tt*(0.75+0.25*swirl);
            // TEMPETE DANS LA MEME FAMILLE CHROMATIQUE que le fond local :
            // variation relative (assombrissement + leger renforcement du canal
            // dominant) — jamais une couleur absolue qui casserait la palette.
            var dk=1-0.42*sm2;                        // densite du nuage orageux
            var dom=Math.max(R,G,B);
            R=R*dk+(dom*0.06)*sm2;G=G*dk;B=B*dk;
          }
        }
        var gi4=(y*W+x)*4;
        d[gi4]=R;d[gi4+1]=G;d[gi4+2]=B;d[gi4+3]=255;
        continue;
      }
      if(!isDead&&e<SEA){   // jamais d'océan sur un monde mort (les puits poussent e<0)
        if(isIce){
          // GLACIER D'OCEAN : banquise blanche, crevasses bleutees par le bruit
          var iceN=fbm(x*1.4+401,y*1.4+23);
          var iceC=fbm(x*5+91,y*5+63);
          R=225+16*iceN+8*iceC;G=231+14*iceN+6*iceC;B=240+10*iceN;
        } else {
        var wat=fbm(x*1.4+401,y*1.4+23);
        var rip=fbm(x*5+91,y*5+63);
        var sh=0.88+0.16*wat+0.05*(rip-0.5);
        R=OC[0]*sh;G=OC[1]*sh;B=OC[2]*sh;
        }
      } else {
        var h=(e-SEA)/0.6;
        var rock=fbm(x*2.2+55,y*2.2+77);
        var grain=fbm(x*6.5+31,y*6.5+17);
        if(isDead){
          // palette lunaire : gris minéraux + mers de basalte sombre + ejecta clairs
          var hD=h<0?0:(h>1?1:h);
          var reg=fbm(x*0.55+901,y*0.55+444);         // grandes plaines basaltiques
          var baseD;
          // INVERSE des telluriques : les puits (h bas) sont SOMBRES, les rebords clairs
          if(hD<0.12)      baseD=[66,64,66];
          else if(hD<0.3)  baseD=[78,76,77];
          else if(hD<0.6)  baseD=[88,86,87];
          else if(hD<0.85) baseD=[118,114,110];
          else            baseD=[158,152,144];          // rebords tres eclairés
          var shD=0.80+0.38*rock+0.12*(grain-0.5);
          R=baseD[0]*shD;G=baseD[1]*shD;B=baseD[2]*shD;
          if(reg>0.55){                                 // MER LUNAIRE : basalte sombre
            var dk=Math.min(1,(reg-0.55)*5);
            R*=1-0.35*dk;G*=1-0.35*dk;B*=1-0.35*dk;
          }
          if(grain>0.68){                               // éjecta : éclaboussures claires
            R+=18;G+=18;B+=16;
          }
          // 3 ZONES : bourrelet (bosse claire via elevation), paroi (ombre
          // directionnelle anti-solaire), fond PLAT (texture unie, pas d'ombre)
          var pit=pitHit[y*W+x];
          if(pit>0){
            var solar=Math.cos(pitAng[y*W+x]-0.75);      // 1 face au soleil, -1 opposee
            var shade=(0.5-0.5*solar)*pit;             // pente + cote ombre
            R*=1-0.80*shade;G*=1-0.80*shade;B*=1-0.78*shade;
          }
          if(floorHit[y*W+x]>0){
            var fAge=floorHit[y*W+x]/100;              // 1 frais -> ~0.3 ancien
            var fD=0.88+0.10*(1-fAge);                 // ancien : teinte presque normale
            var ld=lavaHit[y*W+x];                     // MER DE LAVE sombre au centre des grands
            fD*=1-0.80*ld;                             // geant: coeur -80% de luminosite
            R*=fD;G*=fD;B*=fD+0.02;                    // fond plat : unie, foncee selon l'age
          }
          // (crêtes de bourrelet: pas de liseré artificiel — l'élevation suffit)
        } else {
        var base;
        if(isVolcanic){
          // CONTINENTS CHARBON avec AMPLITUDE : les cratons restent visibles.
          // palette etalee du noir profond (plaine) au gris-brun surcrevi
          // (sommets) — sans cela les continents fusionnaient en un aplat noir.
          var base;
          if(h<0.15)      base=[28,25,24];    // plaines basses : noir profond
          else if(h<0.45) base=[38,33,31];    // piemonts : charbon
          else if(h<0.75) base=[52,46,42];    // massifs : brun brule
          else            base=[74,64,56];    // sommets : gris-brun surcrevi
        } else if(isIce){
          // TERRES GIVREES : neige domine, roches sombres affleurantes par le bruit
          var rn=fbm(x*3.1+157,y*3.1+283);
          if(rn>0.72){                              // escarpements rocheux denudes
            var rk=(rn-0.72)/0.28;
            base=[168-30*rk,162-30*rk,158-32*rk];
          } else {                                  // neige epaisse, grain bleute
            var sg=0.90+0.10*rock;
            base=[228*sg,234*sg,242*sg];
          }
          var sh=0.72+0.55*rock+0.12*(grain-0.5);
          R=base[0]*sh;G=base[1]*sh;B=base[2]*sh;
        } else if(isToxic){
          // MÊME SOL QUE L'ARIDE (sables et rouilles) : la toxicité ne se voit
          // que dans l'océan verdi-jauni et le halo. Simple, credible.
          var base;
          if(h<0.15)      base=[128,116,96];
          else if(h<0.45) base=[120,100,80];
          else if(h<0.75) base=[104,86,74];
          else            base=[138,124,108];
          var sh=0.72+0.55*rock+0.12*(grain-0.5);
          R=base[0]*sh;G=base[1]*sh;B=base[2]*sh;
        } else if(h<0.15)      base=[128,116,96];
        else if(h<0.45) base=[120,100,80];
        else if(h<0.75) base=[104,86,74];
        else            base=[138,124,108];
        var sh=0.72+0.55*rock+0.12*(grain-0.5);
        R=base[0]*sh;G=base[1]*sh;B=base[2]*sh;
        }
        // ---- LAVE CONTINENTALE (volcanique) ----
        // coulées en réseau + failles de braise : sur les continents UNIQUEMENT
        // (h<0.15 reste du noir désolé). PAS de couronnement des sommets
        // (l'effet "neige orange" a été retiré sur demande).
        // appliqué APRÈS l'assignation partagée (sinon R=base*sh l'écraserait).
        if(isVolcanic&&h>=0.15){
          var lv=fbm(x*2.9+808,y*2.9+555);        // reseau de coulees
          var lv2=fbm(x*7.3+311,y*7.3+722);      // failles secondaires
          var sn=0;
          if(lv>0.64)      sn=Math.min(1,(lv-0.64)/0.22)*(0.7+0.3*lv2);
          else if(lv2>0.76)sn=0.4*(lv2-0.76)/0.24;
          if(sn>0.05){
            var lR=232, lG=118, lB=40;            // orange incandescent
            R=R+(lR-R)*sn;G=G+(lG-G)*sn;B=B+(lB-B)*sn;
          }
        }
        // ---- VEGETATION (tellurique seulement) ----
        // masque a grande echelle : des REGIONS vertes, pas un aplat uniforme.
        // verdit les terres ; l'altitude attenue le vert (h clamé : les empilements
        // de cratons poussaient h jusqu'a ~3.9 et tuaient toute vegetation).
        if(PARAMS.vegT<1&&!isIce&&!isVolcanic&&!isToxic){
          var hC=h<1?h:1;                            // altitude utile : 0 cote -> 1 haut plateau
          var vegn=fbm(x*1.2+777,y*1.2+333);         // regions vegetales larges
          var vdet=fbm(x*4.5+801,y*4.5+155);          // detail : taches/mosaique
          var m=(vegn-PARAMS.vegT)/(1-PARAMS.vegT);   // 0 au seuil -> 1 au max
          var vm=0;
          if(m>0)vm=Math.min(1,m*1.6)*(1-hC*0.7)*(0.55+0.45*vdet);
          if(vm>0.04){                              // evite le filtrage pixel
            // vert varie par le bruit existant : prairies -> taiga
            var vgR=52+18*rock, vgG=88+22*rock, vgB=44+10*rock;
            R=R+(vgR-R)*vm;G=G+(vgG-G)*vm;B=B+(vgB-B)*vm;
          }
          // ---- MONTAGNES ENNEIGES : touches de blanc sur les VRAIS sommets ----
          // seuil RELATIF au monde (un seuil absolu noyait les terres hautes),
          // le vert etabli (vm) bloque la neige : concurrence naturelle.
          if(h>SNOW0){
            var sm0=Math.min(1,(h-SNOW0)/(hMax-SNOW0)*1.6)*Math.max(0,1-vm*2.5);
            if(sm0>0){
              var sn=sm0*(0.8+0.2*vegn);              // festons de neige par bruit
              if(sn>0.05){
                var wR=232+10*grain, wG=236+8*grain, wB=244;
                R=R+(wR-R)*sn;G=G+(wG-G)*sn;B=B+(wB-B)*sn;
              }
            }
          }
        }
      }
      var i4=(y*W+x)*4;
      d[i4]=R;d[i4+1]=G;d[i4+2]=B;d[i4+3]=255;
    }
  }
  return {width:W,height:H,data:d};
}
function sample(px,nx,ny,out){
  var W=px.width,H=px.height,d=px.data;
  var x=nx*(W-1),y=ny*(H-1);
  var x0=Math.floor(x),y0=Math.floor(y);
  var x1=Math.min(x0+1,W-1),y1=Math.min(y0+1,H-1);
  var fx=x-x0,fy=y-y0;
  var i00=(y0*W+x0)*4,i01=(y0*W+x1)*4,i10=(y1*W+x0)*4,i11=(y1*W+x1)*4;
  for(var c=0;c<3;c++){
    var a=d[i00+c]+(d[i01+c]-d[i00+c])*fx;
    var b=d[i10+c]+(d[i11+c]-d[i10+c])*fx;
    out[c]=a+(b-a)*fy;
  }
}
var TMP=[0,0,0];
var PLTC={};
// version parametrable : PARAMS global ecrase temporairement le temps du rendu
function renderPlanet(cv,seed,size,cfg){
  var save={};
  for(var k in (cfg||{})){save[k]=PARAMS[k];PARAMS[k]=cfg[k];}
  try{
    var hasIce=true,iceT=0.08;
    if(seed!=null){var r=prng(seed*2654435761+911);
      hasIce=r()<PARAMS.iceP;iceT=bt(r,PARAMS.iceT);}
    // GARDE-FOU CLIMATIQUE : pas de calottes sur les mondes morts (aucune
    // atmosphere -> glace sublimee), arides (vegT>1 : trop chaud), glace
    // (deja gele) ni volcaniques (surface en fusion). Les oceans les gardent.
    if(PARAMS.type==='dead'||PARAMS.type==='ice'||PARAMS.type==='volcanic'||PARAMS.type==='gas'||PARAMS.vegT>1)hasIce=false;
    var TPX=genMap(seed!=null?seed*7919+41:20261017,size,size);
    var ctx=cv.getContext('2d');
    cv.width=size;cv.height=size;
    var img=ctx.createImageData(size,size),d=img.data;
    var rad=size/2;
    var icR=prng((seed!=null?seed:1)*104729+3);
    var ang=[],angS=[]; for(var a=0;a<64;a++){ang.push(icR());angS.push(icR());}
    for(var py=0;py<size;py++){
      var v=(py-rad)/rad;
      var ddy=Math.abs(v);
      var isN=(v<0);
      for(var px2=0;px2<size;px2++){
        var u=(px2-rad)/rad;
        var rr=Math.sqrt(u*u+v*v);
        var i=(py*size+px2)*4;
        if(rr>=1){d[i+3]=0;continue;}
        var nx=(px2/size)*0.9999, ny=(py/size)*0.9999;
        sample(TPX,nx,ny,TMP);
        var R=TMP[0],G=TMP[1],B=TMP[2];
        if(hasIce){
          var ang2=Math.atan2(v,u)/(2*Math.PI)+0.5;
          var tab=isN?ang:angS;
          var f6=ang2*63, ai=Math.floor(f6)%64, bi=(ai+1)%64, af=f6-Math.floor(f6);
          var sm2=af*af*(3-2*af);
          var edge=iceT*(isN?1:1.15)*(0.6+0.8*(tab[ai]*(1-sm2)+tab[bi]*sm2));
          if(ddy>1-edge){
            var dd=(ddy-(1-edge))/edge;
            var al=Math.min(1,dd*1.6+0.45);
            var gx=235+((ai*7)%12), gy2=242-((ai*3)%8), gz=252-((ai*5)%6);
            R=R+(gx-R)*al;G=G+(gy2-G)*al;B=B+(gz-B)*al;
          }
        }
        var light=1-0.45*rr*rr*rr;
        var hi=Math.max(0,0.5-u*0.6-v*0.6)*(1-rr)*0.35;
        d[i]=Math.min(255,R*light+hi*255);d[i+1]=Math.min(255,G*light+hi*255);d[i+2]=Math.min(255,B*light+hi*255);d[i+3]=255;
      }
    }
    ctx.putImageData(img,0,0);
    // liseres
    ctx.strokeStyle='rgba(176,137,104,0.45)';ctx.lineWidth=1.4;
    ctx.beginPath();ctx.arc(rad,rad,rad-0.75,0,7);ctx.stroke();
    // halo atmospherique
    var ATMO=PARAMS.atmo;   // halo atmosphérique par recette (gris pâle pour les mondes morts)
    var g=ctx.createRadialGradient(rad,rad,rad*0.92,rad,rad,rad*1.06);
    g.addColorStop(0,'rgba('+ATMO+',0)');
    g.addColorStop(0.55,'rgba('+ATMO+',0.35)');
    g.addColorStop(0.75,'rgba('+ATMO+',0.22)');
    g.addColorStop(1,'rgba('+ATMO+',0)');
    ctx.fillStyle=g;
    ctx.beginPath();ctx.arc(rad,rad,rad*1.07,0,7);ctx.fill();
    ctx.strokeStyle='rgba('+ATMO+',0.5)';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(rad,rad,rad-0.5,0,7);ctx.stroke();
  } finally {
    for(var k2 in save){PARAMS[k2]=save[k2];}
  }
}
function drawPlanet(cv,seed,size,cfg,cfgId){
  var k=(seed==null?"live":seed)+"_"+size+"_"+(cfgId||"def");
  if(!PLTC[k]){
    var sc=document.createElement("canvas");
    renderPlanet(sc,seed,size,cfg);
    PLTC[k]=sc;
  }
  cv.width=size;cv.height=size;
  cv.getContext("2d").drawImage(PLTC[k],0,0);
}


// ================= API GALAXIE =================
// Mapping des types de la carte (galaxie.js) vers nos recettes V3.
function cfgFor(type,seed){
  var sd=seed||0;
  if(type==='Océanique')  return {type:'ocean',nCrat:14,cratR:[45,80],cratS:[0.6,0.75],iceT:[0.07,0.10],iceP:0.6,vegT:0.35,atmo:'60,150,210'};
  if(type==='Glaciaire')  return {type:'ice',nCrat:12,cratR:[40,70],cratS:[0.5,0.65],iceT:[0.16,0.20],iceP:0,vegT:0.45,atmo:'170,200,235'};
  if(type==='Désertique') return {type:'terra',nCrat:12,cratR:[60,95],cratS:[0.55,0.7],iceT:[0.03,0.04],iceP:0.15,vegT:1.01,atmo:'210,160,90'};
  if(type==='Volcanique')  return {type:'volcanic',nCrat:12,cratR:[55,90],cratS:[0.6,0.75],iceT:[0.05,0.12],iceP:0,vegT:1.01,atmo:'255,120,40'};
  if(type==='Stérile')     return {type:'dead',nCrat:40,cratQuotas:[[20,39,30,50],[40,74,10,20],[75,124,8,16],[125,239,2,4],[240,320,0,2]],cratS:[0.45,0.8],vegT:1.01,iceP:0,atmo:'150,152,158'};
  if(type==='Toxique'){    // 3 mers pastel, tournées par le seed
    var TOX=[[124,166,102,'154,205,150'],[196,186,118,'214,204,140'],[158,132,180,'185,158,205']][sd%3];
    return {type:'toxic',nCrat:12,cratR:[60,95],cratS:[0.55,0.7],iceT:[0.03,0.04],iceP:0.15,vegT:1.01,toxOC:[TOX[0],TOX[1],TOX[2]],atmo:TOX[3]};
  }
  if(type==='Géante gazeuse'){
    var pal=['gold','rust','ice'][sd%3];
    return {type:'gas',gasPal:pal,gasBand:1,gasStorms:2,atmo:pal==='gold'?'216,196,164':pal==='rust'?'214,150,96':'120,160,210'};
  }
  return {type:'terra',nCrat:12,cratR:[50,85],cratS:[0.6,0.75],iceT:[0.07,0.09],iceP:0.7,vegT:0.20,atmo:'79,140,220'};
}
function typeFromText(t){
  var s=String(t||'').toLowerCase();
  if(/gazeuse|géante/.test(s))return 'Géante gazeuse';
  if(/toxique|acide|soufre|empoisonn/.test(s))return 'Toxique';
  if(/glaci|banquise|gel[ée]|neige/.test(s))return 'Glaciaire';
  if(/oc[ée]an|mer mondiale|archipel|mar[ée]e/.test(s))return 'Océanique';
  if(/d[ée]sert|dune|aride|sable|ocre/.test(s))return 'Désertique';
  if(/lave|volcan|eruption|magma/.test(s))return 'Volcanique';
  if(/st[ée]rile|morte?|lune|crat[èe]re|bombard/.test(s))return 'Stérile';
  return 'Tellurique';
}
var TEXC={};
function tex(seed,size,type){
  var k=seed+'_'+size+'_'+type;
  if(TEXC[k]){return TEXC[k];}
  // normalise les clefs a surcharge (drawPlanet ne restaure que ce qu'il override)
  PARAMS.cratQuotas=null;PARAMS.toxOC=null;PARAMS.gasPal='gold';PARAMS.gasBand=1;PARAMS.gasStorms=2;
  var cv=document.createElement('canvas');cv.width=size;cv.height=size;
  drawPlanet(cv,seed,size,cfgFor(type,seed),type);
  TEXC[k]=cv.toDataURL();
  return TEXC[k];
}
function drawType(cv,seed,size,type){
  PARAMS.cratQuotas=null;PARAMS.toxOC=null;PARAMS.gasPal='gold';PARAMS.gasBand=1;PARAMS.gasStorms=2;
  drawPlanet(cv,seed,size,cfgFor(type,seed),type);
}
window.PE={tex:tex,drawType:drawType,cfgFor:cfgFor,typeFromText:typeFromText};

// ================= INTÉGRATION GALAXIE (surcharges post-chargement) =================
if(typeof window!=='undefined'&&typeof document!=='undefined'){
  // 1) Vue système & vue planète (atlas) : notre moteur remplace le v4 intégré.
  window.planetTex=function(seed,size,type){return PE.tex(seed,size,type);};
  // 2) Panneau campagne : vignette procédurale pour les planètes sans image.
  var _oldBind=window.bindImgs;
  window.bindImgs=function(root){
    if(_oldBind){_oldBind(root);}
    try{
      var rows=(root||document).querySelectorAll?((root||document).querySelectorAll('.plrow')):[];
      Array.prototype.forEach.call(rows,function(r){
        if(r.querySelector('.plthumb')){return;}
        var b=r.querySelector('button[data-pl]');if(!b){return;}
        var id=parseInt(b.getAttribute('data-pl'),10)||1;
        var info=r.querySelector('.plinfo');
        var t=PE.typeFromText(info?info.textContent:'');
        var im=document.createElement('img');
        im.className='plthumb';im.alt='';
        im.src=PE.tex(id,96,t);
        r.insertBefore(im,r.firstChild);
      });
    }catch(e){}
  };
  // 3) Exploration planète (campagne) : globe procédural quand la carte est absente.
  var _oldPm=window.pmSvg;
  window.pmSvg=function(seed){
    try{
      var txt=(typeof CURPLA!=='undefined'&&CURPLA)?((CURPLA.nom||'')+' '+(CURPLA.description||'')):'';
      var t=PE.typeFromText(txt);
      return '<svg viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Globe">'
        +'<rect width="1000" height="700" fill="#0a120f"/>'
        +'<image href="'+PE.tex(seed,420,t)+'" x="290" y="140" width="420" height="420" opacity="0.97"/>'
        +'</svg>';
    }catch(e){return _oldPm?_oldPm(seed):'';}
  };
}
})();
