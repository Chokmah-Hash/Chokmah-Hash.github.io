/* Jets de dés partagés — Les Protocoles Éternels */
(function(){
var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var box=document.getElementById('des-box');
if(!box){return;}
var st=document.createElement('style');
st.textContent='#des-box .d-tools{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin:12px 0}'
+'#des-box .d-lbl{display:block;font-size:.68rem;font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--teal);margin:0 0 4px}'
+'#des-box .d-fld{background:var(--panel);border:1px solid var(--tealline);border-radius:9px;color:var(--text);font-family:inherit;font-size:.95rem;padding:9px 12px}'
+'#des-box .d-fld:focus{outline:none;border-color:var(--teal)}'
+'#des-box .d-status{color:var(--muted);font-size:.88rem;margin:8px 0 4px;min-height:1.3em}'
+'#des-box .d-status.err{color:var(--danger)}'
+'#des-box .d-roll{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:9px 13px;border:1px solid var(--tealline);border-radius:10px;margin:7px 0;background:var(--panel2)}'
+'#des-box .d-roll.mine{border-color:var(--amberline)}'
+'#des-box .d-who{font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.04em;color:var(--teal)}'
+'#des-box .d-detail{color:var(--muted);font-size:.88rem}'
+'#des-box .d-total{font-family:Rajdhani,sans-serif;font-weight:700;font-size:1.12rem;color:var(--amber)}'
+'#des-box .d-when{margin-left:auto;color:var(--muted);font-size:.78rem}';
document.head.appendChild(st);
function g(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function setStatus(t,err){var e=g('d-status');if(e){e.textContent=t;e.className='d-status'+(err?' err':'');}}
function defNom(){
  var n='';
  try{n=localStorage.getItem('pe_des_nom')||'';}catch(e){}
  if(!n){
    try{var s=JSON.parse(localStorage.getItem('pe_session')||'null');if(s&&s.nom){n=s.nom;}}catch(e){}
  }
  return n||'MJ';
}
box.innerHTML='<div class="d-tools">'
+'<div><label class="d-lbl" for="d-nom">Qui lance ?</label><input class="d-fld" id="d-nom" type="text" maxlength="30" style="max-width:170px"></div>'
+'<div><label class="d-lbl" for="d-n">Nombre</label><select class="d-fld" id="d-n"></select></div>'
+'<div><label class="d-lbl" for="d-faces">Dé</label><select class="d-fld" id="d-faces"></select></div>'
+'<div><button class="btn primary" id="d-roll-btn" type="button" style="min-height:42px">🎲 Lancer</button></div>'
+'</div>'
+'<p class="d-status" id="d-status"></p>'
+'<div id="d-list"></div>';
(function(){
  var s='';
  for(var i=1;i<=12;i++){s+='<option value="'+i+'"'+(i===1?' selected':'')+'>'+i+'</option>';}
  g('d-n').innerHTML=s;
  var f='';
  [4,6,8,10,12,20,100].forEach(function(v){f+='<option value="'+v+'"'+(v===20?' selected':'')+'>D'+v+'</option>';});
  g('d-faces').innerHTML=f;
})();
g('d-nom').value=defNom();
g('d-nom').addEventListener('change',function(){
  try{localStorage.setItem('pe_des_nom',g('d-nom').value.trim());}catch(e){}
});
function hdr(){return{'apikey':SBK,'Authorization':'Bearer '+SBK};}
function fmtWhen(iso){
  var d=new Date(iso),now=new Date();
  var hh=('0'+d.getHours()).slice(-2),mm=('0'+d.getMinutes()).slice(-2);
  if(d.toDateString()===now.toDateString()){return hh+':'+mm;}
  return d.getDate()+'/'+(d.getMonth()+1)+' '+hh+':'+mm;
}
function render(list){
  var me=g('d-nom').value.trim();
  var out='';
  (list||[]).forEach(function(j){
    out+='<div class="d-roll'+(me&&j.joueur===me?' mine':'')+'">'
    +'<span class="d-who">'+esc(j.joueur)+'</span>'
    +'<span>'+j.n+'D'+j.faces+' :</span>'
    +'<span class="d-detail">'+(j.detail||[]).join(' + ')+'</span>'
    +'<span class="d-total">= '+j.total+'</span>'
    +'<span class="d-when">'+fmtWhen(j.created_at)+'</span>'
    +'</div>';
  });
  g('d-list').innerHTML=out||'<p style="color:var(--muted);font-size:.9rem">Aucun jet pour l\'instant — lance le premier !</p>';
}
function refresh(){
  fetch(SB+'rest/v1/jets?select=id,joueur,n,faces,detail,total,created_at&order=id.desc&limit=25',{headers:hdr()})
  .then(function(r){if(!r.ok){throw new Error('http');}return r.json();})
  .then(function(l){render(l||[]);})
  .catch(function(){});
}
function roll(){
  var nom=g('d-nom').value.trim()||'Anonyme';
  try{localStorage.setItem('pe_des_nom',nom);}catch(e){}
  var n=parseInt(g('d-n').value,10)||1;
  var faces=parseInt(g('d-faces').value,10)||20;
  setStatus('Les dés roulent…');
  fetch(SB+'rest/v1/rpc/lancer_des',{method:'POST',headers:{'apikey':SBK,'Authorization':'Bearer '+SBK,'Content-Type':'application/json'},body:JSON.stringify({n:n,faces:faces,joueur:nom})})
  .then(function(r){if(!r.ok){throw new Error('http '+r.status);}return r.json();})
  .then(function(j){setStatus('🎲 '+n+'D'+faces+' → total '+(j&&j.total)+' ('+((j&&j.detail)||[]).join(' + ')+')');refresh();})
  .catch(function(){setStatus('Lancer impossible — vérifie ta connexion internet.',true);});
}
g('d-roll-btn').addEventListener('click',roll);
var RT=false;
try{
  if(window.supabase&&window.supabase.createClient){
    var cli=window.supabase.createClient(SB,SBK,{auth:{persistSession:false}});
    cli.channel('des-live')
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'jets'},function(){refresh();})
    .subscribe(function(stat){if(stat==='SUBSCRIBED'){RT=true;}});
  }
}catch(e){}
setInterval(function(){if(!RT&&!document.hidden&&box.offsetParent!==null){refresh();}},15000);
refresh();
})();
