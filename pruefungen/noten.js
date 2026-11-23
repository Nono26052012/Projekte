/* Noten-Rechner für die Prüfungs-App */
(function(){var st=document.createElement('style');st.textContent="\n.nt-btn{all:unset;box-sizing:border-box;height:44px;padding:0 14px;display:grid;place-content:center;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer;font-weight:600;font-size:15px}\n#nt{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}\n#nt[hidden]{display:none}\n#nt .nt-s{background:var(--bg);color:var(--ink);width:100%;max-width:760px;max-height:92vh;overflow:auto;border-radius:20px 20px 0 0;padding:20px 20px calc(24px + env(safe-area-inset-bottom))}\n@media (min-width:1000px){#nt{align-items:center}#nt .nt-s{max-width:min(1000px,88vw);border-radius:20px;max-height:90vh;padding:28px 36px}}\n#nt h2{margin:0;font-size:22px}\n#nt .nt-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}\n#nt .nt-x{all:unset;cursor:pointer;font-size:26px;line-height:1;padding:4px 8px;color:var(--soft)}\n#nt .nt-sum{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:10px}\n#nt .nt-box{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px}\n#nt .nt-box b{display:block;font-size:28px;line-height:1.1}\n#nt .nt-box span{font-size:13px;color:var(--soft)}\n#nt .nt-box.main{border-color:var(--red)}#nt .nt-box.main b{color:var(--red)}\n#nt .nt-hint{font-size:13px;color:var(--soft);margin:6px 0 14px}\n#nt .nt-row{background:var(--card);border:1px solid var(--line);border-radius:14px;margin-bottom:8px}\n#nt .nt-h{display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;user-select:none;-webkit-user-select:none}\n#nt .nt-n{font-weight:600;flex:1;min-width:0}\n#nt .nt-avg{font-weight:700;font-size:18px;min-width:3.2em;text-align:right}\n#nt .nt-cnt{font-size:12px;color:var(--soft)}\n#nt .chip{all:unset;cursor:pointer;font-size:12px;padding:4px 10px;border-radius:999px;border:1px solid var(--line);color:var(--soft);white-space:nowrap}\n#nt .chip.on{background:var(--red);border-color:var(--red);color:#fff}\n#nt .nt-b{padding:0 14px 14px;border-top:1px solid var(--line)}\n#nt .nt-sec{font-size:13px;color:var(--soft);margin:12px 0 6px}\n#nt .nt-gs{display:flex;flex-wrap:wrap;gap:6px}\n#nt .g{display:inline-flex;align-items:center;gap:6px;padding:5px 6px 5px 10px;border-radius:10px;border:1px solid var(--line);font-weight:600}\n#nt .g small{font-weight:400;color:var(--soft);font-size:11px}\n#nt .g button{all:unset;cursor:pointer;color:var(--soft);padding:0 4px;font-size:16px;line-height:1}\n#nt .nt-add{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:12px}\n#nt .seg{display:inline-flex;border:1px solid var(--line);border-radius:10px;overflow:hidden}\n#nt .seg button{all:unset;cursor:pointer;padding:7px 11px;font-size:14px}\n#nt .seg button.on{background:var(--red);color:#fff}\n#nt .nb{all:unset;cursor:pointer;width:40px;height:40px;display:grid;place-content:center;border-radius:10px;border:1px solid var(--line);font-weight:700;font-size:17px}\n#nt .nb:active{background:var(--red);color:#fff}\n#nt input.lbl{font:inherit;font-size:14px;padding:8px 10px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink);min-width:0;flex:1 1 140px}\n#nt .nt-foot{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:14px}\n#nt .nt-foot input{font:inherit;padding:8px 10px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink)}\n#nt .lnk{all:unset;cursor:pointer;color:var(--red);font-size:14px}\n#nt .nt-calc{font-size:12px;color:var(--soft);margin-top:10px}\n";document.head.appendChild(st);
if(!document.getElementById('nt')){var d=document.createElement('div');d.id='nt';d.hidden=true;document.body.appendChild(d);}})();

/* Noten: pro Fach eintragen, Schnitt nach § 28 GSO (Bayern), Gesamtschnitt mit Haupt-/Nebenfach-Gewichtung */
(function(){
var KEY='noten-v1',D=null;try{D=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){}
var DATA={};try{DATA=JSON.parse(document.getElementById('app-data').textContent);}catch(e){}
var saNum=function(n){return (DATA.exams||[]).filter(function(e){return e.subject===n&&/schulaufgabe/i.test(e.type||'');}).length;};
function defaults(){
  var tt=(DATA.timetable&&DATA.timetable.names)||{},names=[];
  Object.keys(tt).forEach(function(k){var n=tt[k];if(n&&!/übung|uebung|bigband|chor|orchester|intensiv|mod\b|wahl/i.test(n)&&names.indexOf(n)<0)names.push(n);});
  if(names.length<5)names=['Deutsch','Mathematik','Englisch','Latein','Physik','Chemie','Biologie','Informatik','Geschichte','Geographie','Wirtschaft und Recht','Ethik','Musik','Kunst','Sport'];
  (DATA.exams||[]).forEach(function(e){if(names.indexOf(e.subject)<0)names.push(e.subject);});
  /* Religion/Ethik: nur das eigene Fach (Klassen-Version: aus der Einrichtung) */
  var pr=null;try{pr=JSON.parse(localStorage.getItem('klasse-prefs')||'null');}catch(e){}
  var rel=pr&&pr.rel==='rk'?'Kath. Religionslehre':pr&&pr.rel==='ev'?'Ev. Religionslehre':'Ethik';
  names=names.filter(function(n){return !/relig|ethik|^rel$/i.test(n);});names.push(rel);
  return {hw:2,subjects:names.map(function(n){return {n:n,haupt:saNum(n)>0,ratio:'auto',g:[]};})};
}
if(!D||!D.subjects)D=defaults();
var openIx=-1,draft={t:'gross',w:1};
function save(){try{localStorage.setItem(KEY,JSON.stringify(D));}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function f2(x){return x==null?'–':x.toFixed(2).replace('.',',');}
function mean(a){var s=0,w=0;a.forEach(function(g){s+=g.v*(g.w||1);w+=(g.w||1);});return w?s/w:null;}
function calc(s){
  var G=mean(s.g.filter(function(g){return g.t==='gross';})),K=mean(s.g.filter(function(g){return g.t==='klein';}));
  var r=s.ratio==='auto'?(saNum(s.n)>2?2:1):(s.ratio==='2:1'?2:1);
  var avg=G!=null&&K!=null?(r*G+K)/(r+1):(G!=null?G:K);
  return {G:G,K:K,r:r,avg:avg};
}
function totals(){
  var hs=0,hn=0,ns=0,nn=0;
  D.subjects.forEach(function(s){var a=calc(s).avg;if(a==null)return;if(s.haupt){hs+=a;hn++;}else{ns+=a;nn++;}});
  var H=hn?hs/hn:null,N=nn?ns/nn:null,w=+D.hw||1,T=(hn||nn)?(hs*w+ns)/(hn*w+nn):null;
  return {H:H,N:N,T:T,hn:hn,nn:nn};
}
var ov=document.getElementById('nt');
function render(){
  var t=totals(),h='<div class="nt-s" role="dialog" aria-modal="true" aria-label="Noten"><div class="nt-top"><h2>Noten</h2><button class="nt-x" data-a="close" aria-label="Schließen">×</button></div>';
  h+='<div class="nt-sum"><div class="nt-box main"><b>'+f2(t.T)+'</b><span>Gesamtschnitt</span></div><div class="nt-box"><b>'+f2(t.H)+'</b><span>Hauptfächer ('+t.hn+')</span></div><div class="nt-box"><b>'+f2(t.N)+'</b><span>Nebenfächer ('+t.nn+')</span></div></div>';
  h+='<div class="nt-hint">Hauptfächer zählen im Gesamtschnitt <span class="seg">'+[1,2,3].map(function(w){return '<button data-a="hw" data-w="'+w+'" class="'+(+D.hw===w?'on':'')+'">'+w+'×</button>';}).join('')+'</span> so viel wie Nebenfächer. Tippe auf ein Fach, um Noten einzutragen.</div>';
  D.subjects.forEach(function(s,i){
    var c=calc(s),open=i===openIx;
    h+='<div class="nt-row"><div class="nt-h" data-a="tog" data-i="'+i+'"><span class="nt-n">'+esc(s.n)+'</span><span class="nt-cnt">'+(s.g.length?s.g.length+' Note'+(s.g.length>1?'n':''):'')+'</span><button class="chip'+(s.haupt?' on':'')+'" data-a="haupt" data-i="'+i+'">'+(s.haupt?'Hauptfach':'Nebenfach')+'</button><span class="nt-avg">'+f2(c.avg)+'</span></div>';
    if(open){
      var gl=function(t){return s.g.map(function(g,j){return g.t!==t?'':'<span class="g">'+g.v+(g.w>1?' <small>×'+g.w+'</small>':'')+(g.l?' <small>'+esc(g.l)+'</small>':'')+'<button data-a="del" data-i="'+i+'" data-j="'+j+'" aria-label="Note löschen">×</button></span>';}).join('');};
      var gg=gl('gross'),kk=gl('klein');
      h+='<div class="nt-b"><div class="nt-sec">Schulaufgaben · Schnitt '+f2(c.G)+'</div><div class="nt-gs">'+(gg||'<span class="nt-cnt">noch keine</span>')+'</div>';
      h+='<div class="nt-sec">Kleine Leistungsnachweise (Ex, Abfrage, Kurzarbeit, Referat, mündlich) · Schnitt '+f2(c.K)+'</div><div class="nt-gs">'+(kk||'<span class="nt-cnt">noch keine</span>')+'</div>';
      h+='<div class="nt-add"><span class="seg"><button data-a="typ" data-t="gross" class="'+(draft.t==='gross'?'on':'')+'">Schulaufgabe</button><button data-a="typ" data-t="klein" class="'+(draft.t==='klein'?'on':'')+'">Klein</button></span>'+
        (draft.t==='klein'?'<span class="seg"><button data-a="w" data-w="1" class="'+(draft.w===1?'on':'')+'">zählt 1×</button><button data-a="w" data-w="2" class="'+(draft.w===2?'on':'')+'">2×</button></span>':'')+
        '<input class="lbl" id="ntLbl" placeholder="Notiz, z. B. Ex Kapitel 3 (optional)" maxlength="40"></div><div class="nt-add">'+[1,2,3,4,5,6].map(function(v){return '<button class="nb" data-a="add" data-i="'+i+'" data-v="'+v+'">'+v+'</button>';}).join('')+'</div>';
      var sa=saNum(s.n);
      h+='<div class="nt-add"><span class="nt-cnt">Gewichtung Schulaufgaben : Kleine</span><span class="seg">'+['auto','1:1','2:1'].map(function(r){return '<button data-a="ratio" data-i="'+i+'" data-r="'+r+'" class="'+(s.ratio===r?'on':'')+'">'+(r==='auto'?'Automatisch':r)+'</button>';}).join('')+'</span></div>';
      h+='<div class="nt-calc">'+(s.ratio==='auto'?(sa?sa+' Schulaufgabe'+(sa>1?'n':'')+' im Kalender → '+(sa>2?'2:1':'1:1')+'. ':'Keine Schulaufgaben im Kalender → 1:1, falls doch welche eingetragen werden. '):'')+
        'Ohne Schulaufgaben zählt nur der Schnitt der kleinen Leistungsnachweise.</div>';
      h+='<div class="nt-foot"><button class="lnk" data-a="rm" data-i="'+i+'">Fach entfernen</button></div></div>';
    }
    h+='</div>';
  });
  h+='<div class="nt-foot"><input id="ntNew" placeholder="Fach hinzufügen" maxlength="30"><button class="chip on" data-a="newsub">Hinzufügen</button></div>';
  h+='<div class="nt-calc">Rechnung wie in Bayern (§ 28 GSO): Fachnote = Schulaufgaben-Schnitt und Schnitt der kleinen Leistungsnachweise, bei bis zu zwei Schulaufgaben im Jahr 1:1, bei mehr als zwei 2:1. Die Lehrkraft darf im Einzelfall anders gewichten, die Werte hier sind also eine Schätzung. Der Gesamtschnitt ist keine offizielle Zeugnisnote.</div></div>';
  var lbl=document.getElementById('ntLbl'),lv=lbl?lbl.value:'',os=ov.querySelector('.nt-s'),sy=os?os.scrollTop:0;
  ov.innerHTML=h;var l2=document.getElementById('ntLbl');if(l2)l2.value=lv;
  var ns=ov.querySelector('.nt-s');if(ns)ns.scrollTop=sy;
}
function show(){openIx=-1;render();ov.hidden=false;document.body.style.overflow='hidden';}
function hide(){ov.hidden=true;ov.innerHTML='';document.body.style.overflow='';}
ov.addEventListener('click',function(e){
  if(e.target===ov)return hide();
  var b=e.target.closest('[data-a]');if(!b)return;var a=b.dataset.a,i=+b.dataset.i,s=D.subjects[i];
  if(a==='close')return hide();
  if(a==='haupt'){e.stopPropagation();s.haupt=!s.haupt;}
  else if(a==='tog'){openIx=openIx===i?-1:i;}
  else if(a==='hw'){D.hw=+b.dataset.w;}
  else if(a==='typ'){draft.t=b.dataset.t;}
  else if(a==='w'){draft.w=+b.dataset.w;}
  else if(a==='ratio'){s.ratio=b.dataset.r;}
  else if(a==='add'){var l=document.getElementById('ntLbl');s.g.push({v:+b.dataset.v,t:draft.t,w:draft.t==='klein'?draft.w:1,l:l&&l.value.trim()||'',d:new Date().toISOString().slice(0,10)});if(l)l.value='';}
  else if(a==='del'){s.g.splice(+b.dataset.j,1);}
  else if(a==='rm'){if(s.g.length&&!b.dataset.sure){b.dataset.sure='1';b.textContent='Wirklich entfernen? Die Noten gehen verloren. Nochmal tippen';return;}D.subjects.splice(i,1);openIx=-1;}
  else if(a==='newsub'){var n=document.getElementById('ntNew'),v=n&&n.value.trim();if(!v)return;D.subjects.push({n:v,haupt:false,ratio:'auto',g:[]});openIx=D.subjects.length-1;}
  save();render();
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!ov.hidden)hide();});
function addBtn(){var gear=document.getElementById('gear');if(!gear||document.getElementById('ntOpen'))return;
  var b=document.createElement('button');b.type='button';b.id='ntOpen';b.className='nt-btn';b.textContent='Noten';b.addEventListener('click',show);gear.parentNode.insertBefore(b,gear);}
addBtn();new MutationObserver(addBtn).observe(document.body,{childList:true,subtree:true});
})();
