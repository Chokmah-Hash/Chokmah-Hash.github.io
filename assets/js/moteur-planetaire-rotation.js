/* moteur-planetaire-rotation.js - V1.3 - rotation crantee (glissement rigide)
   Generation partagee avec moteur-planetaire.js (meme seed = meme vignette).
   8 types supportes : Tellurique, Desertique, Oceanique, Toxique, Geante gazeuse,
   Glaciaire, Volcanique, Sterile. */
(function(global){
"use strict";
/* ---- palettes Toxique (mers acides, par seed%3) ---- */
var TOX=[ {oc:[110,150,60],  atmo:"150,190,110"},   /* Miasma  : vert acide */
           {oc:[196,176,84], atmo:"220,205,130"},   /* Soufria : soufre jaune */
           {oc:[128,92,160], atmo:"170,140,210"} ]; /* Vipera  : violet veneneux */
/* ---- palettes Geante gazeuse (par seed%3) ---- */
var GAS=[ {pal:"gold", atmo:"224,196,150"},   /* doree (Saturne) */
           {pal:"rust", atmo:"220,170,120"},   /* rousse (Jupiter) */
           {pal:"ice",  atmo:"120,165,225"} ]; /* bleue (Neptune) */

function cfgFor(typeGal,seed){
  var si=((seed%3)+3)%3;
  switch(typeGal){
    case "Tellurique":      return {type:"terra", vegT:0.30, atmo:"79,140,220"};
    case "D\u00e9sertique":     return {type:"terra", vegT:1.01, atmo:"210,160,110"};
    case "Oc\u00e9anique":      return {type:"ocean", atmo:"90,150,210"};
    case "Toxique":        return {type:"toxic", toxOC:TOX[si].oc, atmo:TOX[si].atmo};
    case "G\u00e9ante gazeuse": return {type:"gas", gasPal:GAS[si].pal, gasBand:1.4,
                                   gasStorms:2+si, atmo:GAS[si].atmo};
    case "Glaciaire":      return {type:"ice", atmo:"170,200,235"};
    case "Volcanique":     return {type:"volcanic", atmo:"230,120,50"};
    case "St\u00e9rile":      return {type:"dead", atmo:"140,140,145"};
    default: return null;
  }
}

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

var SL=null;

function slideInit(seedT,W,H,N,cfg){
  var save={};
  for(var k in (cfg||{})){save[k]=PARAMS[k];PARAMS[k]=cfg[k];}
  try{
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  var rnd=mulberry(seedT);
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
  
    var P=(Math.ceil(W/8)+2)*8, GW=2*P;
    var rimHit=null,pitHit=null,pitAng=null,floorHit=null,lavaHit=null;
    if(isDead){rimHit=new Uint8Array(GW*H);pitHit=new Float32Array(GW*H);pitAng=new Float32Array(GW*H);floorHit=new Uint8Array(GW*H);lavaHit=new Float32Array(GW*H);}
    SL={W:W,H:H,P:P,GW:GW,N:N,step:GW/N,seedT:seedT,cfg:(cfg||{}),
        grid:grid,gw:gw,gh:gh,
        OC:OC,crat:crat,SEA:SEA,storms:(typeof storms!=='undefined')?storms:[],
        isDead:isDead,isIce:isIce,isOcean:isOcean,isVolcanic:isVolcanic,isToxic:isToxic,isGas:isGas,
        rimHit:rimHit,pitHit:pitHit,pitAng:pitAng,floorHit:floorHit,lavaHit:lavaHit,
        E:new Float32Array(GW*H),hMax:0,yDone:0,k:-1,
        Ew:null,colors:null,phase2:false};
    if(isGas){SL.yDone=SL.H;
      for(var sti=0;sti<SL.storms.length;sti++)SL.storms[sti].x=SL.storms[sti].x*(GW/W);
      slideStartKeys();}
  } finally {
    for(var k2 in save){PARAMS[k2]=save[k2];}
  }
}

// fermetures bruit recréées depuis SL (grid torique identique à genMap)
function slClosures(){
  var GS=8,gw=SL.gw,gh=SL.gh,grid=SL.grid;
  function sm(t){return t*t*(3-2*t);}
  function gr(a,b){return grid[((b%gh+gh)%gh)*gw+((a%gw+gw)%gw)];}
  function noise(x,y){
    var gx=x/GS,gy=y/GS,x0=Math.floor(gx),y0=Math.floor(gy),fx=sm(gx-x0),fy=sm(gy-y0);
    var a=gr(x0,y0)+(gr(x0+1,y0)-gr(x0,y0))*fx,b=gr(x0,y0+1)+(gr(x0+1,y0+1)-gr(x0,y0+1))*fx;
    return a+(b-a)*fy;
  }
  function fbm(x,y){var v=0,amp=0.5,f=1;for(var o=0;o<5;o++){v+=amp*noise(x*f,y*f);amp*=0.5;f*=2;}return v;}
  return {noise:noise,fbm:fbm};
}

// Passe 1 géante par bandes de lignes. Retourne true quand terminée.
function slidePass1Band(nRows){
  var cl=slClosures(),noise=cl.noise,fbm=cl.fbm;
  var crat=SL.crat,P=SL.P,isDead=SL.isDead,SEA=SL.SEA;
  var rimHit=SL.rimHit,pitHit=SL.pitHit,pitAng=SL.pitAng,floorHit=SL.floorHit,lavaHit=SL.lavaHit;
  var E=SL.E,H=SL.H;
  var hMax=SL.hMax;
  var y0=SL.yDone,y1=Math.min(H,y0+nRows);
var hMax=0;
  for(var y=y0;y<y1;y++){
    for(var X=0;X<SL.GW;X++){
      var e=fbm(X+13,y+7)*0.55+0.16*fbm(X*0.5+201,y*0.5+99);
      var near=0;
      for(var k=0;k<crat.length;k++){
        var c=crat[k];
        var dx=X-c.x,dy=y-c.y;dx=(dx%P+P)%P;if(dx>=P/2)dx-=P;
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
              if(b>0.92)rimHit[y*SL.GW+X]=Math.round(b*100); // crete memorisee
            } else if(d2<0.42){
              var dd=0.42-d2;                            // 0 crete -> 0.42 fond
              if(dd>0.12)dd=0.12;                        // plafond : fond plat
              e-=dd*c.s*1.6;                             // encaissement paroi+fond
              if(d2>=0.30){
                var wall=(dd/0.12)*c.age;                // profondeur x age : les anciens s'effacent
                if(wall>pitHit[y*SL.GW+X]){pitHit[y*SL.GW+X]=wall;pitAng[y*SL.GW+X]=th;}   // th = angle wrappé (position-monde, rigide)
              } else {
                floorHit[y*SL.GW+X]=Math.round(c.age*100);   // fond plat : intensite selon l'age
                var lava=(0.30-d2)/0.30;               // 0 bord du fond -> 1 centre exact
                var ld=lava*Math.min(1,(c.r-70)/60);    // MER LAVE: seulement Ø>=220, progressif jusqu'à Ø340
                if(ld>lavaHit[y*SL.GW+X])lavaHit[y*SL.GW+X]=ld; // le plus intense gagne
              }
            }
          } else if(w2<1){var a=(1-w2)*(c.s+0.18)-0.18;if(a>0)e+=(a*a)*(edge>0.3?1:edge);}
          if(edge>near)near=edge;                    // distance au craton le plus proche
        }
      }
      // bruit de fond affaibli loin des cratons -> iles en clusters autour
      e=e*(0.15+0.85*near);
      E[y*SL.GW+X]=e;
      var h0=(e-SEA)/0.6;
      if(h0>hMax)hMax=h0;
    }
  }
  
  if(hMax>SL.hMax)SL.hMax=hMax;
  SL.yDone=y1;
  return y1>=H;
}

// Démarre la phase clés (après passe 1 complète).
function slideStartKeys(){
  SL.Ew=new Float32Array(SL.W*SL.H);
  SL.colors=new Uint8ClampedArray(SL.W*SL.H*4);
  SL.k=0;
}

// Calcule la clé courante SL.k et avance. Retourne true quand le cycle est complet.
function slideKey(){
  var __sv={};for(var pk in SL.cfg){__sv[pk]=PARAMS[pk];PARAMS[pk]=SL.cfg[pk];}
  try{
  var cl=slClosures(),noise=cl.noise,fbm=cl.fbm;
  var W=SL.W,H=SL.H,step=SL.step,k=SL.k,GW=SL.GW,off=k*step;
  var E=SL.E,Ew=SL.Ew,colors=SL.colors;
  var hMax=SL.hMax;
  // fenêtre E de la clé
  for(var y=0;y<H;y++){
    var base=y*GW,wbase=y*W,rem=W,sx=off;
    while(rem>0){
      var n=Math.min(rem,GW-sx);
      Ew.set(E.subarray(base+sx,base+sx+n),wbase+(W-rem));
      rem-=n;sx=0;
    }
  }
  // glissement in-place des couleurs (k>0)
  var fx0=0;
  if(k>0){
    fx0=W-step;
    for(var y2=0;y2<H;y2++){
      var row=y2*W*4;
      for(var x2=0;x2<fx0;x2++){
        var i4=row+x2*4,j4=row+(x2+step)*4;
        colors[i4]=colors[j4];colors[i4+1]=colors[j4+1];colors[i4+2]=colors[j4+2];colors[i4+3]=255;
      }
    }
  }
  var d=colors;
  var OC=SL.OC,SEA=SL.SEA,storms=SL.storms;
  var isDead=SL.isDead,isIce=SL.isIce,isOcean=SL.isOcean,isVolcanic=SL.isVolcanic,isToxic=SL.isToxic,isGas=SL.isGas;
  var rimHit=SL.rimHit,pitHit=SL.pitHit,pitAng=SL.pitAng,floorHit=SL.floorHit,lavaHit=SL.lavaHit;
// PASSE 2 : couleurs. Neige au-dessus de 72% de l'altitude du sommet du monde.
  var SNOW0=SL.hMax*0.72;
  for(var y=0;y<H;y++){
    for(var x=fx0;x<W;x++){
      var X=(x+SL.k*SL.step)%SL.GW;   // wrap monde : les tableaux GW (pitHit…) ne débordent jamais
      var e=Ew[y*W+x];
      var R,G,B;
      if(isGas){
        // ---- GAZ : bandes zonales SYMETRIQUES autour de l'equateur ----
        // (comme les calottes : la teinte depend de la DISTANCE a l'equateur,
        // donc l'hemisphere sud reflete exactement le nord)
        var lat=Math.abs(y/H*2-1);                    // 0 equateur -> 1 pole (miroir)
        var hemi=(y<H*0.5)?0:1;                       // nord=0, sud=1 : bruits distincts
        var wob=(fbm(X*0.5+55+hemi*911,lat*1.8+31)-0.5)*(hemi?0.16:0.08);   // ondulation N/S differente
        var bl=lat+wob*0.35;                         // latitude-miroir perturbee
        var bf=PARAMS.gasBand||1;                    // densite des bandes
        var bn=noise(bl*42*bf,12.3);                 // bandes larges
        var bn2=noise(bl*96*bf,7.7);                 // bandes fines
        var streak=fbm(X*0.5+801+hemi*533,lat*2.6+155);   // filaments, seed par hemisphere
        var grain2=fbm(X*6.5+31+hemi*733,lat*6.5+17);     // grain fin, seed par hemisphere
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
          var sdx=X-st.x; sdx=(sdx%SL.P+SL.P)%SL.P; if(sdx>=SL.P/2)sdx-=SL.P;
          var dxs=sdx/st.rx, dys=(y-st.y)/st.ry;
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
          var iceN=fbm(X*1.5+401,y*1.4+23);
          var iceC=fbm(X*5+91,y*5+63);
          R=225+16*iceN+8*iceC;G=231+14*iceN+6*iceC;B=240+10*iceN;
        } else {
        var wat=fbm((X)*1.5+401,y*1.5+23);
        var rip=fbm((X)*5+91,y*5+63);
        var sh=0.88+0.16*wat+0.05*(rip-0.5);
        R=OC[0]*sh;G=OC[1]*sh;B=OC[2]*sh;
        }
      } else {
        var h=(e-SEA)/0.6;
        var rock=fbm((X)*2+55,y*2+77);
        var grain=fbm((X)*6.5+31,y*6.5+17);
        if(isDead){
          // palette lunaire : gris minéraux + mers de basalte sombre + ejecta clairs
          var hD=h<0?0:(h>1?1:h);
          var reg=fbm(X*0.5+901,y*0.55+444);         // grandes plaines basaltiques
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
          var pit=pitHit[y*SL.GW+X];
          if(pit>0){
            var solar=Math.cos(pitAng[y*SL.GW+X]-0.75);      // 1 face au soleil, -1 opposee
            var shade=(0.5-0.5*solar)*pit;             // pente + cote ombre
            R*=1-0.80*shade;G*=1-0.80*shade;B*=1-0.78*shade;
          }
          if(floorHit[y*SL.GW+X]>0){
            var fAge=floorHit[y*SL.GW+X]/100;              // 1 frais -> ~0.3 ancien
            var fD=0.88+0.10*(1-fAge);                 // ancien : teinte presque normale
            var ld=lavaHit[y*SL.GW+X];                     // MER DE LAVE sombre au centre des grands
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
          var rn=fbm(X*3+157,y*3.1+283);
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
          var lv=fbm(X*3+808,y*2.9+555);        // reseau de coulees
          var lv2=fbm(X*7.5+311,y*7.3+722);      // failles secondaires
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
          var vegn=fbm((X)*1+777,y*1.2+333);         // regions vegetales larges
          var vdet=fbm((X)*4.5+801,y*4.5+155);          // detail : taches/mosaique
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
  
  } finally { for(var pk2 in __sv){PARAMS[pk2]=__sv[pk2];} }
  SL.k++;
  return SL.k>=SL.N;
}

// Texture courante (pour projection)

function slideTexture(){return {width:SL.W,height:SL.H,data:SL.colors};}
// ==== RENDERER RAPIDE À 2 ÉTAGES (rotation) ====
// Étage 1 (une fois) : éclairage radial, alpha, poids bilinéaires, latitude —
// tout ce qui ne dépend pas de la texture ni de la longitude.
// Étage 2 (par frame clé) : genMap glissé + projection disque + CALOTTES :
// la calotte est une caractéristique de SURFACE — son bord ondulé est indexé
// sur la LONGITUDE DE TEXTURE (colonne échantillonnée), donc elle tourne
// rigide avec le globe.

function precomputeDisc(seed,size,cfg){
  var save={};
  for(var k in (cfg||{})){save[k]=PARAMS[k];PARAMS[k]=cfg[k];}
  var out;
  try{
    var hasIce=true,iceT=0.08;
    if(seed!=null){var r=prng(seed*2654435761+911);
      hasIce=r()<PARAMS.iceP;iceT=bt(r,PARAMS.iceT);}
    if(PARAMS.type==='dead'||PARAMS.type==='ice'||PARAMS.type==='volcanic'||PARAMS.type==='gas'||PARAMS.vegT>1)hasIce=false;
    var rad=size/2;
    var icR=prng((seed!=null?seed:1)*104729+3);
    var ang=[],angS=[]; for(var a=0;a<64;a++){ang.push(icR());angS.push(icR());}
    var nPix=size*size;
    var L_X0=new Int32Array(nPix),L_Y0=new Int32Array(nPix),L_X1=new Int32Array(nPix),L_Y1=new Int32Array(nPix);
    var L_FX=new Float32Array(nPix),L_FY=new Float32Array(nPix);
    var L_LIT=new Float32Array(nPix),L_ADD=new Float32Array(nPix);
    var L_DDY=new Float32Array(nPix);        // latitude absolue (fixe : polaire)
    var L_ISN=new Uint8Array(nPix);          // hémisphère nord ?
    var L_INSIDE=new Uint8Array(nPix);
    var W=size;
    for(var py=0;py<size;py++){
      var v=(py-rad)/rad;
      var ddy=Math.abs(v);
      var isN=(v<0);
      for(var px2=0;px2<size;px2++){
        var u=(px2-rad)/rad;
        var rr=Math.sqrt(u*u+v*v);
        var idx=py*size+px2;
        if(rr>=1){L_INSIDE[idx]=0;continue;}
        L_INSIDE[idx]=1;
        var nx=(px2/size)*0.9999, ny=(py/size)*0.9999;
        var x=nx*(W-1), y=ny*(W-1);
        var x0=Math.floor(x), y0=Math.floor(y);
        var x1=Math.min(x0+1,W-1), y1=Math.min(y0+1,W-1);
        L_X0[idx]=x0;L_Y0[idx]=y0;L_X1[idx]=x1;L_Y1[idx]=y1;
        L_FX[idx]=x-x0;L_FY[idx]=y-y0;
        L_DDY[idx]=ddy;L_ISN[idx]=isN?1:0;
        var light=1-0.45*rr*rr*rr;
        L_LIT[idx]=light;
        L_ADD[idx]=Math.max(0,0.5-u*0.6-v*0.6)*(1-rr)*0.35*255;
      }
    }
    out={size:size,seed:seed,cfg:cfg,nPix:nPix,inside:L_INSIDE,
         x0:L_X0,y0:L_Y0,x1:L_X1,y1:L_Y1,fx:L_FX,fy:L_FY,
         lit:L_LIT,add:L_ADD,ddy:L_DDY,isn:L_ISN,
         hasIce:hasIce,iceT:iceT,ang:ang,angS:angS,
         atmo:PARAMS.atmo};
  } finally {
    for(var k2 in save){PARAMS[k2]=save[k2];}
  }
  return out;
}

// Étage 2 : projette une texture genMap sur le disque, calottes incluses.
// dst = Uint8ClampedArray(size*size*4) réutilisable entre frames.
function projectDisc(pc,TPX,dst,koff,capP){
  var W=TPX.width, d=TPX.data, size=pc.size;
  var hasIce=pc.hasIce;
  var iceT=pc.iceT, ang=pc.ang, angS=pc.angS;
  for(var idx=0;idx<pc.nPix;idx++){
    var i4=idx*4;
    if(!pc.inside[idx]){dst[i4+3]=0;continue;}
    var x0=pc.x0[idx],y0=pc.y0[idx],x1=pc.x1[idx],y1=pc.y1[idx];
    var fx=pc.fx[idx],fy=pc.fy[idx];
    var i00=(y0*W+x0)*4,i01=(y0*W+x1)*4,i10=(y1*W+x0)*4,i11=(y1*W+x1)*4;
    for(var c=0;c<3;c++){
      var a2=d[i00+c]+(d[i01+c]-d[i00+c])*fx;
      var b2=d[i10+c]+(d[i11+c]-d[i10+c])*fx;
      dst[i4+c]=a2+(b2-a2)*fy;
    }
    // ---- CALOTTES (tournent avec le globe) ----
    // longitude de texture du pixel = colonne échantillonnée -> le bord
    // ondulé de la calotte est SOLIDAIRE de la surface.
    if(hasIce){
      var ddy=pc.ddy[idx];
      var isN=pc.isn[idx];
      // longitude bilinéaire du point échantillonné (0..1)
      var lon=((x0+fx+(koff||0))%(capP||W))/((capP||W));
      var f6=lon*63, ai=(Math.floor(f6))%64, bi=(ai+1)%64, af=f6-Math.floor(f6);
      var sm2=af*af*(3-2*af);
      var tab=isN?ang:angS;
      var edge=iceT*(isN?1:1.15)*(0.6+0.8*(tab[ai]*(1-sm2)+tab[bi]*sm2));
      if(ddy>1-edge){
        var dd=(ddy-(1-edge))/edge;
        var al=Math.min(1,dd*1.6+0.45);
        var gx=235+((ai*7)%12), gy2=242-((ai*3)%8), gz=252-((ai*5)%6);
        dst[i4]=dst[i4]+(gx-dst[i4])*al;
        dst[i4+1]=dst[i4+1]+(gy2-dst[i4+1])*al;
        dst[i4+2]=dst[i4+2]+(gz-dst[i4+2])*al;
      }
    }
    var lit=pc.lit[idx],add=pc.add[idx];
    dst[i4]=Math.min(255,dst[i4]*lit+add);
    dst[i4+1]=Math.min(255,dst[i4+1]*lit+add);
    dst[i4+2]=Math.min(255,dst[i4+2]*lit+add);
    dst[i4+3]=255;
  }
}
/* ================= API publique : window.PER ================= */
function mkInstance(typeGal,seed,size,N){
  var cfg=cfgFor(typeGal,seed);
  if(!cfg) return null;
  var pc=precomputeDisc(seed,size,cfg);
  slideInit(seed,size,size,N,cfg);
  var frames=[], dst=new Uint8ClampedArray(size*size*4);
  var phase=1, done=false, idx=0, ctx=null;
  function draw(){
    if(!ctx||!frames.length) return;
    ctx.putImageData(new ImageData(new Uint8ClampedArray(frames[idx]),size,size),0,0);
  }
  return {
    tick:function(ms){
      if(done) return {phase:"done",pct:100,ready:true};
      var T=function(){return (typeof performance!=="undefined"&&performance.now)?performance.now():Date.now();};
      var t1=T();
      while(T()-t1<(ms||50)){
        if(phase===1){
          var n=Math.max(8,Math.floor(size/10));
          while(SL.yDone<SL.H&&T()-t1<(ms||50)) slidePass1Band(n);
          if(SL.yDone>=SL.H){ slideStartKeys(); phase=2; }
        } else {
          while(SL.k<N&&T()-t1<(ms||50)){
            slideKey();
            projectDisc(pc,slideTexture(),dst,(SL.k-1)*SL.step,SL.GW);
            frames.push(new Uint8ClampedArray(dst));
          }
          if(SL.k>=N){ done=true; draw(); }
        }
        if(done) break;
      }
      var pct;
      if(phase===1) pct=Math.round(100*SL.yDone/SL.H)*0.55;
      else pct=55+Math.round(100*Math.min(SL.k,N)/N)*0.45;
      return {phase:phase===1?"relief":"meridiens",pct:pct,ready:done};
    },
    attach:function(c){ ctx=c; draw(); },
    step:function(d){
      if(!frames.length) return 0;
      idx=((idx+(d|0))%frames.length+frames.length)%frames.length;
      draw(); return idx;
    },
    get ready(){ return done; },
    get count(){ return frames.length; },
    get idx(){ return idx; }
  };
}
var PER={
  supported:function(typeGal){ return !!cfgFor(typeGal,0); },
  create:function(typeGal,seed,size,N){ try{ return mkInstance(typeGal,seed,size||320,N||16); }catch(e){ return null; } }
};
if(typeof window!=="undefined") window.PER=PER;
else if(typeof global!=="undefined") global.PER=PER;
if(typeof module!=="undefined"&&module.exports) module.exports=PER;
})(typeof window!=="undefined"?window:this);
