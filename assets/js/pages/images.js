/* Console des images MJ — envoi et gestion des illustrations (bucket public « images ») */
(function(){
"use strict";
var ROOT='https://dnbnkdakmobufqcrqzpq.supabase.co';
var SBR='https://dnbnkdakmobufqcrqzpq.supabase.co/rest/v1/';
var SBK='sb_publishable_U_ADFiAlPqWodkQFybynPg_5Mbctjov';
var KEY='',PFX='';
function $id(x){return document.getElementById(x);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function msg(t,cls){var m=$id('img-msg');if(m){m.textContent=t;m.className='gmsgc '+(cls||'');}}
function umsg(t,cls){var m=$id('img-upmsg');if(m){m.textContent=t;m.className='gmsgc '+(cls||'');}}
function lmsg(t,cls){var m=$id('img-lmsg');if(m){m.textContent=t;m.className='gmsgc '+(cls||'');}}
function hdr(){var h={'apikey':SBK,'Authorization':'Bearer '+(window.MJBEARER||SBK),'Content-Type':'application/json'};if(KEY){h['x-mj-key']=KEY;}return h;}
$id('img-open').addEventListener('click',function(){
  KEY=$id('img-key').value;
  if(!KEY){msg('Saisis ta clé MJ.','err');return;}
  msg('Vérification de la clé…','');
  fetch(SBR+'aventures?select=id&limit=1',{headers:hdr()}).then(function(r){
    if(!r.ok){throw new Error('cle');}
    $id('img-tools').style.display='';
    msg('','');
    PFX='';
    refresh();
  }).catch(function(){msg('Clé refusée ou base inaccessible.','err');});
});
$id('img-up').addEventListener('click',function(){
  var inp=$id('img-file');
  var f=inp.files&&inp.files[0];
  if(!f){umsg('Choisis d’abord un fichier.','err');return;}
  if(f.size>5242880){umsg('Fichier trop lourd (5 Mo maximum).','err');return;}
  var dir=$id('img-dir').value.trim().replace(/^\/+|\/+$/g,'');
  var name=f.name.replace(/[\/\\]+/g,'-').replace(/[^a-zA-Z0-9._\-]/g,'-');
  var path=(dir?dir+'/':'')+name;
  umsg('Envoi de '+name+'…','');
  fetch(ROOT+'/storage/v1/object/images/'+path.split('/').map(encodeURIComponent).join('/'),{
    method:'POST',
    headers:{'apikey':SBK,'Authorization':'Bearer '+(window.MJBEARER||SBK),'x-mj-key':KEY,'Content-Type':f.type||'application/octet-stream','x-upsert':'true'},
    body:f
  }).then(function(r){
    if(!r.ok){throw new Error('http'+r.status);}
    umsg('Envoyé ✓ — copie l’adresse publique ci-dessous dans tes consoles.','ok');
    inp.value='';
    PFX=dir;
    refresh();
  }).catch(function(){umsg('Échec de l’envoi — vérifie la clé, le format (png, jpeg, webp, gif, svg) et la taille.','err');});
});
function refresh(){
  lmsg('Lecture du bucket…','');
  fetch(ROOT+'/storage/v1/object/list/images',{method:'POST',headers:hdr(),body:JSON.stringify({limit:300,offset:0,prefix:PFX,sortBy:{column:'name',order:'asc'}})})
  .then(function(r){return r.ok?r.json():Promise.reject(new Error('http'));})
  .then(function(rows){
    var items=rows||[];
    var files=items.filter(function(x){return x.id!==null&&x.id!==undefined;});
    var dirs=items.filter(function(x){return (x.id===null||x.id===undefined)&&x.name;});
    var out='';
    if(PFX){out+='<div class="cta-row" style="justify-content:flex-start;margin:8px 0"><button type="button" class="btn ghost smallbtn" id="img-root">⬆ Dossier racine</button><span class="glab" style="margin:0">'+esc(PFX)+'/</span></div>';}
    out+='<div class="tscroll"><table class="rt amber"><thead><tr><th>Nom</th><th>Taille</th><th>Adresse publique</th><th></th></tr></thead><tbody>';
    dirs.forEach(function(x){
      out+='<tr><td colspan="4"><button type="button" class="btn ghost smallbtn" data-dir="'+esc((PFX?PFX+'/':'')+x.name)+'">📁 '+esc(x.name)+'/</button></td></tr>';
    });
    files.forEach(function(x){
      var full=(PFX?PFX+'/':'')+x.name;
      var pub=ROOT+'/storage/v1/object/public/images/'+full;
      var size=(x.metadata&&x.metadata.size)?Math.round(x.metadata.size/1024)+' Ko':'—';
      out+='<tr><td>'+esc(x.name)+'</td><td>'+size+'</td><td style="word-break:break-all">'+esc(pub)+'</td>'
        +'<td><button type="button" class="btn ghost smallbtn" data-cp="'+esc(pub)+'">Copier</button> <button type="button" class="btn danger smallbtn" data-dl="'+esc(full)+'">Suppr.</button></td></tr>';
    });
    out+='</tbody></table></div>';
    if(!items.length){lmsg('Aucune image ici — envoie la première ci-dessus.','');}
    else{lmsg(files.length+' image(s) affichée(s).','');}
    $id('img-list').innerHTML=out;
    var root=$id('img-root');
    if(root){root.addEventListener('click',function(){PFX='';refresh();});}
    Array.prototype.forEach.call($id('img-list').querySelectorAll('[data-dir]'),function(b){
      b.addEventListener('click',function(){PFX=b.getAttribute('data-dir');refresh();});
    });
    Array.prototype.forEach.call($id('img-list').querySelectorAll('[data-cp]'),function(b){
      b.addEventListener('click',function(){
        var t=b.getAttribute('data-cp');
        try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t);lmsg('Adresse copiée ✓','ok');return;}}catch(e){}
        lmsg(t,'');
      });
    });
    Array.prototype.forEach.call($id('img-list').querySelectorAll('[data-dl]'),function(b){
      b.addEventListener('click',function(){
        var nm=b.getAttribute('data-dl');
        if(!window.confirm('Supprimer « '+nm+' » du bucket ?')){return;}
        fetch(ROOT+'/storage/v1/object/images/'+nm.split('/').map(encodeURIComponent).join('/'),{method:'DELETE',headers:hdr()}).then(function(r){
          if(!r.ok){throw new Error('http');}
          refresh();
        }).catch(function(){lmsg('Suppression impossible.','err');});
      });
    });
  })
  .catch(function(){lmsg('Lecture du bucket impossible.','err');});
}
})();
