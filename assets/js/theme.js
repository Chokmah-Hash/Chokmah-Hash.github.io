/* Thème Imperium / Necrons — Les Protocoles Éternels — PE_BUILD 2026.10.18-theme2 */
var PE_BUILD='2026.10.18-theme2';
window.PE_BUILD=PE_BUILD;
(function(){
  var SB='https://dnbnkdakmobufqcrqzpq.supabase.co/';
  var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
  var LS='pe-pack';
  function apply(v){
    if(v!=='imperium'&&v!=='necrons'){v='imperium'}
    if(document.body){document.body.setAttribute('data-pack',v)}
    try{localStorage.setItem(LS,v)}catch(e){}
    var s=document.getElementById('packsel');
    if(s&&s.value!==v){s.value=v}
  }
  function cached(){
    try{return localStorage.getItem(LS)||'imperium'}catch(e){return 'imperium'}
  }
  apply(cached());
  function pull(){
    fetch(SB+'rest/v1/parametres?key=eq.pack&select=valeur',{headers:{apikey:SBK,Authorization:'Bearer '+SBK}}).then(function(r){return r.ok?r.json():[]}).then(function(rows){
      if(rows&&rows[0]&&rows[0].valeur){apply(rows[0].valeur)}
    }).catch(function(){});
  }
  pull();
  window.PE_THEME={
    set:function(v){
      apply(v);
      var k='';
      try{k=localStorage.getItem('pe_mjkey')||''}catch(e){}
      fetch(SB+'rest/v1/parametres',{method:'POST',headers:{apikey:SBK,Authorization:'Bearer '+SBK,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates','x-mj-key':k},body:JSON.stringify({key:'pack',valeur:v,maj_at:new Date().toISOString()})}).catch(function(){});
    }
  };
  document.addEventListener('change',function(ev){
    var t=ev.target;
    if(t&&t.id==='packsel'&&window.PE_THEME){window.PE_THEME.set(t.value)}
  });
  if(window.supabase&&window.supabase.createClient){
    try{
      var cli=window.supabase.createClient(SB,SBK,{auth:{persistSession:false}});
      cli.channel('pe-theme').on('postgres_changes',{event:'*',schema:'public',table:'parametres'},function(){pull()}).subscribe();
      return;
    }catch(e){}
  }
  setInterval(pull,20000);
})();
