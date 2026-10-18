(function(){
var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
var SESS=null, MJSIDE=false, LAST=0, RT=null, BOX=null;
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
function sendMessage(){
  var inp=$('c-input'), txt=inp.value.trim();
  if(!txt){return;}
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
  try{
    var raw=localStorage.getItem('pe-mj-auth');
    if(raw&&window.supabase){
      // session MJ persistee -> verifier
    }
  }catch(e){}
  // MJ detection: tenter getSession si supabase charge et cle pe-mj-auth
  if(window.supabase){
    try{
      var client=supabase.createClient(SB.replace('/rest/v1/',''),SBK,{auth:{persistSession:true,storageKey:'pe-mj-auth'}});
      window.CLIENT=client;
      client.auth.getSession().then(function(s){
        if(s&&s.data&&s.data.session){
          MJSIDE=true;
          setStatus('Vue Maître de la Tombe — tu vois tous les messages.','');
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