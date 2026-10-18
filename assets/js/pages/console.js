(function(){
var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
var SESS=null, MJSIDE=false, LAST=0, RT=null, BOX=null;
/* ————— /debug : erreurs capturees en memoire ————— */
var ERRS=[];
try{
window.addEventListener('error',function(e){ERRS.push('E:'+(e.message||'?')+' @'+(e.filename||'')+':'+(e.lineno||0));if(ERRS.length>12){ERRS.shift();}});
window.addEventListener('unhandledrejection',function(e){ERRS.push('P:'+String(e.reason).slice(0,180));if(ERRS.length>12){ERRS.shift();}});
}catch(e){}
function hdr(){var h={'apikey':SBK,'Content-Type':'application/json'};if(SESS&&SESS.token){h['x-token']=SESS.token;}return h;}
function authHdr(tk){return {'apikey':SBK,'Authorization':'Bearer '+tk,'Content-Type':'application/json'};}
function api(url,opt){return fetch(url,opt);}
function setStatus(t,c){var m=$('c-status');m.textContent=t;m.className='gmsgc '+(c||'');}
function parseCmd(txt){
  var m=/^\/(\S+)\s+"([^]*)"\s*$/.exec(txt)||/^\/(\S+)\s+"([\s\S]*)"$/.exec(txt);
  if(!m){return null;}
  return {dest:m[1],texte:m[2]};
}
function fmtTime(s){if(!s){return '';}var d=new Date(s.replace(' ','T')+'Z');if(isNaN(d)){return s;}return d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});}
function renderMsgs(arr){
  BOX=BOX||$('c-box');
  var html='';
  arr.forEach(function(m){
    var cls='cm '+(m.mjside?'cm-mj':'');
    var who=esc(m.auteur)+(m.mjside?' 📜':'');
    var tag='';
    if(m.dest&&m.dest.length){
      var names=m.dest.map(function(d){return esc(d.l);}).join(', ');
      tag=' <span class="cm-priv">→ '+names+'</span>';
      cls+=' cm-private';
    }
    var body=esc(m.contenu);
    if(m.type==='de'){cls+=' cm-de';}
    html+='<div class="'+cls+'"><span class="cm-time">'+fmtTime(m.cree)+'</span> <span class="cm-who">'+who+'</span>'+tag+': '+body+'</div>';
  });
  BOX.innerHTML+=html;
  BOX.scrollTop=BOX.scrollHeight;
}
function loadMessages(){
  var tk=SESS&&SESS.token;
  var url=SB+'rpc/console_lire';
  var h={'apikey':SBK,'Content-Type':'application/json'};
  if(tk){h['x-token']=tk;}
  if(MJSIDE){return loadMJ();}
  return api(url,{method:'POST',headers:h,body:JSON.stringify({p_dernier:LAST})}).then(function(r){return r.json();}).then(function(arr){
    if(Array.isArray(arr)){if(arr.length){LAST=arr[arr.length-1].id;renderMsgs(arr);}}
  });
}
function loadMJ(){
  return freshMJToken().then(function(tk){
    return api(SB+'rpc/console_lire',{method:'POST',headers:authHdr(tk),body:JSON.stringify({p_dernier:LAST})});
  }).then(function(r){return r.json();}).then(function(arr){
    if(Array.isArray(arr)){if(arr.length){LAST=arr[arr.length-1].id;renderMsgs(arr);}}
  });
}
function freshMJToken(){
  try{if(window.CLIENT&&CLIENT.auth&&CLIENT.auth.getSession){return CLIENT.auth.getSession().then(function(s){return (s&&s.data&&s.data.session&&s.data.session.access_token)||window.MJBEARER||SBK;},function(){return window.MJBEARER||SBK;});}}catch(e){}
  return Promise.resolve(window.MJBEARER||SBK);
}
/* ————— /debug : collecte + encodage (local uniquement, rien n'est envoye) ————— */
function dbgB64(str){
  try{return btoa(unescape(encodeURIComponent(str)));}catch(e){return 'ENC_ERR';}
}
function dbgSum(str){
  var s=0;
  try{var by=unescape(encodeURIComponent(str));for(var i=0;i<by.length;i++){s=(s+by.charCodeAt(i))&0xffff;}}catch(e){return 0;}
  return s;
}
function dbgHex(n,w){
  var h=n.toString(16);
  while(h.length<w){h='0'+h;}
  return h.toUpperCase();
}
function lsKeys(){
  var k=[];try{for(var i=0;i<localStorage.length;i++){k.push(localStorage.key(i));}}catch(e){}
  return k;
}
function rtState(){
  try{
    if(!RT){return 'aucun';}
    var st=RT.state;
    if(typeof st==='function'){st=st.call(RT);}
    return String(st||'?');
  }catch(e){return 'err';}
}
function collectDebug(){
  var n=navigator, scr=screen, d=document, w=window;
  var cssOk=false;
  try{cssOk=!!(getComputedStyle(d.querySelector('.card')||d.body).borderRadius);}catch(e){}
  var data={
    v:2, t:new Date().toISOString(),
    url:location.href, ref:d.referrer||'',
    ua:n.userAgent, plat:n.platform, lang:n.language, langs:(n.languages||[]).slice(0,4),
    online:n.onLine, cookie:n.cookieEnabled,
    tz:Intl.DateTimeFormat().resolvedOptions().timeZone||'?', tzOff:new Date().getTimezoneOffset(),
    screen:{w:scr.width,h:scr.height,d:scr.depth,dpw:scr.width*(w.devicePixelRatio||1)},
    vp:{w:w.innerWidth,h:w.innerHeight,dpr:w.devicePixelRatio||1,scrollY:w.scrollY},
    sessJoueur:!!SESS, nomJoueur:(SESS&&SESS.nom)||null, mj:MJSIDE,
    last:LAST, msgsAffiches:(BOX?BOX.children.length:0),
    boxH:(BOX?BOX.scrollHeight:0),
    supabaseJs:typeof w.supabase!=='undefined', client:!!w.CLIENT,
    realtime:rtState(),
    lsKeys:lsKeys(),
    sw:('serviceWorker' in n)?(n.serviceWorker.controller?'actif':'non-controle'):'absent',
    cssCharge:cssOk,
    perfMem:(w.performance&&w.performance.memory)?Math.round(w.performance.memory.usedJSHeapSize/1048576)+'Mo':null,
    conn:(n.connection&&n.connection.effectiveType)||null,
    errs:ERRS.slice()
  };
  var json=JSON.stringify(data);
  var b64code=dbgB64(json);
  /* Format PEDBG2 : longueur JSON (hex 4) + somme (hex 4) + base64 — detecte toute troncature */
  return 'PEDBG2-'+dbgHex(json.length,4)+'-'+dbgHex(dbgSum(json),4)+'-'+b64code;
}
function showDebug(){
  var code=collectDebug();
  BOX=BOX||$('c-box');
  var div=document.createElement('div');
  div.className='cm cm-mj cm-private';
  div.innerHTML='<span class="cm-who">🔍 Debug</span> <button class="btn ghost btn sm" style="min-height:26px;font-size:.68rem;padding:2px 10px">📋 Copier</button>'+
    '<div style="margin:6px 0 2px;padding:8px 10px;background:rgba(6,16,13,.9);border:1px dashed var(--tealline);border-radius:6px;font-family:monospace;font-size:.72rem;word-break:break-all;max-height:180px;overflow-y:auto">'+esc(code)+'</div>'+
    '<span class="cm-priv">Code à copier-coller au développeur. Ne contient aucun mot de passe.</span>';
  div.querySelector('button').addEventListener('click',function(){
    var ok=false;
    try{navigator.clipboard.writeText(code).then(function(){setStatus('Code debug copié.','ok');});ok=true;}catch(e){}
    if(!ok){var ta=document.createElement('textarea');ta.value=code;d.body.appendChild(ta);ta.select();try{d.execCommand('copy');setStatus('Code debug copié.','ok');}catch(e){setStatus('Copie impossible — sélectionne le code manuellement.','err');}d.body.removeChild(ta);}
  });
  BOX.appendChild(div);
  BOX.scrollTop=BOX.scrollHeight;
  setStatus('Debug généré — 1 clic sur Copier et le code est en mémoire.','ok');
}
function sendMessage(){
  var inp=$('c-input'), txt=inp.value.trim();
  if(!txt){return;}
  if(txt==='/debug'){
    if(!MJSIDE){setStatus('Commande réservée au Maître de la Tombe.','err');return;}
    inp.value='';showDebug();return;
  }
  var cmd=parseCmd(txt);
  var dest='[]';
  var body=txt;
  if(cmd){
    var logins=cmd.dest.split('+');
    dest=JSON.stringify(logins.map(function(l){return {l:l};}));
    body=cmd.texte;
  }
  if(!SESS&&!MJSIDE){setStatus('Connecte-toi (Zone joueurs) pour écrire.','err');return;}
  var p;
  if(MJSIDE){
    p=freshMJToken().then(function(tk){
      return api(SB+'rpc/console_envoyer',{method:'POST',headers:authHdr(tk),body:JSON.stringify({p_contenu:body,p_dest:JSON.parse(dest),p_type:'msg'})});
    });
  }else{
    p=api(SB+'rpc/console_envoyer',{method:'POST',headers:hdr(),body:JSON.stringify({p_contenu:body,p_dest:JSON.parse(dest),p_type:'msg'})});
  }
  p.then(function(r){return r.json();}).then(function(rep){
    if(rep&&rep.erreur){setStatus(rep.erreur,'err');return;}
    inp.value='';loadMessages();
  }).catch(function(){setStatus('Envoi impossible — vérifie ta connexion.','err');});
}
function initSession(){
  try{var s=localStorage.getItem('pe_session');if(s){SESS=JSON.parse(s);}else{SESS=null;}}catch(e){SESS=null;}
  MJSIDE=false;
  if(window.supabase){
    try{
      var client=supabase.createClient(SB.replace('/rest/v1/',''),SBK,{auth:{persistSession:true,storageKey:'pe-mj-auth'}});
      window.CLIENT=client;
      client.auth.getSession().then(function(s){
        if(s&&s.data&&s.data.session){
          MJSIDE=true;
          setStatus('Vue Maître de la Tombe — tu vois tous les messages. /debug disponible.','');
          loadMessages();
        }else if(!SESS){
          setStatus('Vue anonyme — connecte-toi depuis la Zone joueurs pour écrire.','');
        }else{
          setStatus('Connecté : '+SESS.nom,'');
        }
      });
    }catch(e){}
  }
}
function rtInit(){
  try{
    if(!window.supabase){return;}
    var client=supabase.createClient(SB.replace('/rest/v1/',''),SBK,{auth:{persistSession:false}});
    var ch=client.channel('console-live');
    ch.on('postgres_changes',{event:'*',schema:'public',table:'console_messages'},function(){
      loadMessages();
    }).subscribe();
    RT=ch;
  }catch(e){}
}
initSession();
loadMessages();
rtInit();
$('c-send').addEventListener('click',sendMessage);
$('c-input').addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();sendMessage();}});
})();