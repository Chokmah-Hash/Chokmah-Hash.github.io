(function(){
var TABS=['regles','bestiaire','carte'];
function show(t){
 if(TABS.indexOf(t)===-1){t='regles';}
 TABS.forEach(function(k){
  var s=document.getElementById('pe-tab-'+k);
  if(s){s.hidden=(k!==t);}
  var b=document.getElementById('pe-tbtn-'+k);
  if(b){b.classList.toggle('active',k===t);b.setAttribute('aria-current',k===t?'true':'false');}
 });
 try{localStorage.setItem('pe_datatab',t);}catch(e){}
}
function setHash(t){try{if(history.replaceState){history.replaceState(null,'','#'+t);}}catch(e){}}
function cur(){
 var h=(location.hash||'').replace('#','');
 if(TABS.indexOf(h)!==-1){return h;}
 try{var s=localStorage.getItem('pe_datatab');if(TABS.indexOf(s)!==-1){return s;}}catch(e){}
 return 'regles';
}
TABS.forEach(function(k){
 var b=document.getElementById('pe-tbtn-'+k);
 if(b){b.addEventListener('click',function(ev){ev.preventDefault();show(k);setHash(k);});}
});
window.addEventListener('hashchange',function(){var t=(location.hash||'').replace('#','');if(TABS.indexOf(t)!==-1){show(t);}});
show(cur());
})();
