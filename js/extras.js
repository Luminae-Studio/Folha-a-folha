// v4
// WISHLIST
function openWish(){
  ['w-title','w-author','w-price','w-where'].forEach(function(i){document.getElementById(i).value='';});
  document.getElementById('w-cat').value='#A855F7';
  delete document.getElementById('mod-wish').dataset.editId;
  openModal('mod-wish');
}
function editWish(id){
  var w=S.wishlist.find(function(x){return x.id===id;});if(!w)return;
  document.getElementById('w-title').value=w.title;
  document.getElementById('w-author').value=w.author||'';
  document.getElementById('w-price').value=w.price||'';
  document.getElementById('w-where').value=w.where||'';
  document.getElementById('w-cat').value=w.cat||'#A855F7';
  document.getElementById('mod-wish').dataset.editId=id;
  openModal('mod-wish');
}
function saveWish(){
  var editId=document.getElementById('mod-wish').dataset.editId;
  var data={title:document.getElementById('w-title').value,author:document.getElementById('w-author').value,cat:document.getElementById('w-cat').value,price:document.getElementById('w-price').value,where:document.getElementById('w-where').value};
  if(editId){var idx=S.wishlist.findIndex(function(x){return x.id===parseInt(editId);});if(idx>=0)S.wishlist[idx]=Object.assign({},S.wishlist[idx],data);delete document.getElementById('mod-wish').dataset.editId;}
  else{S.wishlist.push(Object.assign({id:Date.now()},data,{bought:false}));}
  sv('wishlist');closeModal('mod-wish');renderWish();
}
var _WISH_CAT_LABELS={
  '#A855F7':'⭐ Prioridade',
  '#F472B6':'✨ Bruxiles',
  '#34D399':'🎮 Interativo',
  '#FBBF24':'📚 Saga',
  '#38BDF8':'🔖 SeCa'
};
var _wishCatFilter='';
var _wishChipsVisible=false;
function _ensureWishFilterUI(){
  if(document.getElementById('wish-cat-filter'))return;
  var host=document.getElementById('wish-list');
  if(!host)return;
  var wrap=document.createElement('div');
  wrap.id='wish-filter-wrap';
  wrap.style.cssText='margin-bottom:8px;';
  wrap.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">'+
    '<select id="wish-cat-filter" onfocus="_showWishChips()" onchange="_setWishCatFilter(this.value)" style="padding:5px 10px;border:1px solid var(--bord);border-radius:999px;background:var(--surf2);color:var(--txt2);font-size:11px;font-weight:600;-webkit-appearance:none;appearance:none;cursor:pointer;"></select>'+
    '<button type="button" id="wish-cat-clear" onclick="_clearWishCatFilter()" style="display:none;font-size:11px;color:var(--txt3);background:none;border:none;cursor:pointer;padding:0;">✕ Limpar filtro</button>'+
    '</div>'+
    '<div id="wish-cat-chips" style="display:none;gap:6px;flex-wrap:wrap;margin-bottom:8px;"></div>';
  host.parentNode.insertBefore(wrap,host);
}
function _setWishCatFilter(cat){_wishCatFilter=cat;_wishChipsVisible=true;renderWish();}
function _showWishChips(){
  _wishChipsVisible=true;
  var chipsEl=document.getElementById('wish-cat-chips');
  if(chipsEl)chipsEl.style.display='flex';
}
function _clearWishCatFilter(){
  _wishCatFilter='';
  _wishChipsVisible=false;
  renderWish();
}
function renderWish(){
  var el=document.getElementById('wish-list');
  _ensureWishFilterUI();
  var q=(document.getElementById('wish-search')?document.getElementById('wish-search').value:'').toLowerCase().trim();
  var sortEl=document.getElementById('wish-sort');var sort=sortEl?sortEl.value:'recente';

  var totalAll=S.wishlist.length;
  var boughtCount=S.wishlist.filter(function(w){return w.bought;}).length;
  var prices=S.wishlist.filter(function(w){return!w.bought;}).map(function(w){var m=w.price?w.price.replace(/[^\d,\.]/g,'').replace(',','.'):null;return m?parseFloat(m):0;});
  var total=prices.reduce(function(a,b){return a+b;},0);
  document.getElementById('wish-total').textContent=totalAll+(totalAll===1?' livro':' livros')+' · '+boughtCount+(boughtCount===1?' comprado':' comprados')+' · Total estimado: R$ '+total.toFixed(2).replace('.',',');

  var cats={};
  S.wishlist.forEach(function(w){var c=w.cat||'#999';cats[c]=(cats[c]||0)+1;});
  var catKeys=Object.keys(cats);
  var selEl=document.getElementById('wish-cat-filter');
  if(selEl){
    selEl.innerHTML='<option value="">Categoria: Todas ▾</option>'+catKeys.map(function(c){
      var label=_WISH_CAT_LABELS[c]||c;
      return '<option value="'+c+'"'+(_wishCatFilter===c?' selected':'')+'>Categoria: '+label+' ('+cats[c]+') ▾</option>';
    }).join('');
  }
  var chipsEl=document.getElementById('wish-cat-chips');
  if(chipsEl){
    chipsEl.innerHTML=catKeys.map(function(c){
      var label=_WISH_CAT_LABELS[c]||c;
      var active=_wishCatFilter===c;
      return '<span onclick="_setWishCatFilter(\''+(active?'':c)+'\')" style="cursor:pointer;font-size:11px;padding:4px 10px;border-radius:999px;background:'+(active?c:'var(--surf2)')+';color:'+(active?'#fff':'var(--txt2)')+';border:1px solid '+c+';font-weight:600;">'+label+' ('+cats[c]+')</span>';
    }).join('');
    chipsEl.style.display=(_wishChipsVisible||!!q||!!_wishCatFilter)?'flex':'none';
  }
  var clearBtn=document.getElementById('wish-cat-clear');
  if(clearBtn)clearBtn.style.display=_wishCatFilter?'inline-block':'none';

  var items=S.wishlist.slice();
  if(_wishCatFilter)items=items.filter(function(w){return w.cat===_wishCatFilter;});
  if(q)items=items.filter(function(w){return(w.title+' '+(w.author||'')).toLowerCase().indexOf(q)>=0;});
  if(sort==='titulo-az')items.sort(function(a,b){return a.title.localeCompare(b.title,'pt');});
  else if(sort==='titulo-za')items.sort(function(a,b){return b.title.localeCompare(a.title,'pt');});
  else if(sort==='autor-az')items.sort(function(a,b){return(a.author||'').localeCompare(b.author||'','pt');});
  else if(sort==='autor-za')items.sort(function(a,b){return(b.author||'').localeCompare(a.author||'','pt');});
  if(!items.length){el.innerHTML='<div class="empty"><div class="ei">&#x1F6CD;&#xFE0F;</div><p>Lista vazia</p></div>';return;}
  el.innerHTML=items.map(function(w){
    return '<div class="card card-sm mb" style="display:flex;gap:10px;cursor:pointer;'+(w.bought?'opacity:.5':'')+'" onclick="viewWish('+w.id+')">'+
      '<div style="width:12px;height:12px;border-radius:3px;background:'+w.cat+';flex-shrink:0;margin-top:3px;"></div>'+
      '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;'+(w.bought?'text-decoration:line-through':'')+' ;">'+w.title+'</div>'+
      '<div style="font-size:11px;color:var(--txt2);">'+(w.author||'')+(w.price?' &middot; '+w.price:'')+'</div>'+
      (w.where?'<div style="margin-top:2px;">'+`<a href="${w.where}" target="_blank" rel="noopener" style="font-size:11px;color:var(--li);text-decoration:none;" onclick="event.stopPropagation()">🛒 Ver na Amazon</a>`+'</div>':'')+
      '</div>'+
      '<button class="btn bx bg2" onclick="event.stopPropagation();editWish('+w.id+')">&#x270F;&#xFE0F;</button>'+
      '<button class="btn bx bg2" onclick="event.stopPropagation();togWish('+w.id+')">'+(w.bought?'&#x21A9;':'&#x2705;')+'</button>'+
      '<button class="btn bx bd" onclick="event.stopPropagation();delWish('+w.id+')">&#x2715;</button></div>';
  }).join('');
}
function viewWish(id){
  var w=S.wishlist.find(function(x){return x.id===id;});if(!w)return;
  _ensureWishViewModal();
  var label=_WISH_CAT_LABELS[w.cat]||w.cat||'';
  document.getElementById('wv-body').innerHTML=
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">'+
      '<div style="width:14px;height:14px;border-radius:4px;background:'+(w.cat||'#999')+';"></div>'+
      '<div style="font-size:11px;color:var(--txt2);">'+label+'</div>'+
    '</div>'+
    '<div style="font-size:17px;font-weight:700;margin-bottom:4px;">'+w.title+'</div>'+
    '<div style="font-size:13px;color:var(--txt2);margin-bottom:10px;">'+(w.author||'Autor desconhecido')+'</div>'+
    (w.price?'<div style="font-size:13px;margin-bottom:6px;"><strong>Preço:</strong> '+w.price+'</div>':'')+
    '<div style="font-size:13px;margin-bottom:10px;"><strong>Status:</strong> '+(w.bought?'Comprado &#x2705;':'Não comprado')+'</div>'+
    (w.where?`<a href="${w.where}" target="_blank" rel="noopener" class="btn bp bs" style="display:inline-block;text-decoration:none;">🛒 Ver na Amazon</a>`:'');
  openModal('mod-wish-view');
}
function _ensureWishViewModal(){
  if(document.getElementById('mod-wish-view'))return;
  var el=document.createElement('div');
  el.className='mov';
  el.id='mod-wish-view';
  el.innerHTML='<div class="mod"><div class="mh"></div><h3>Detalhes</h3><div id="wv-body"></div>'+
    '<div class="ma"><button class="btn bg2" onclick="closeModal(\'mod-wish-view\')">Fechar</button></div></div>';
  document.body.appendChild(el);
  el.addEventListener('click',function(e){if(e.target===el)el.classList.remove('on');});
}
function togWish(id){
  var w=S.wishlist.find(function(x){return x.id===id;});if(!w)return;
  if(!w.bought){_openBoughtFlow(w);}
  else{w.bought=false;sv('wishlist');renderWish();}
}
var _wishBoughtId=null;
var _wishBoughtFormat='fisico';
function _ensureBoughtModal(){
  if(document.getElementById('mod-wish-bought'))return;
  var el=document.createElement('div');
  el.className='mov';
  el.id='mod-wish-bought';
  el.innerHTML='<div class="mod">'+
    '<div class="mh"></div>'+
    '<h3>Ótimo! Como você vai ler?</h3>'+
    '<div class="fr" style="margin-bottom:10px;">'+
      '<button type="button" class="btn bs" id="wb-fmt-fisico" onclick="_setBoughtFormat(\'fisico\')" style="flex:1;">📗 Físico</button>'+
      '<button type="button" class="btn bs" id="wb-fmt-digital" onclick="_setBoughtFormat(\'digital\')" style="flex:1;">📱 Digital</button>'+
    '</div>'+
    '<div class="fg"><label>Páginas</label><input type="number" id="wb-pages" min="0" placeholder="0"></div>'+
    '<div class="ma" style="flex-direction:column;gap:8px;">'+
      '<button class="btn bp" onclick="_confirmBought(true)" style="width:100%;">Adicionar à estante</button>'+
      '<button class="btn bg2" onclick="_confirmBought(false)" style="width:100%;">Só marcar como comprado</button>'+
    '</div>'+
  '</div>';
  document.body.appendChild(el);
  el.addEventListener('click',function(e){if(e.target===el)el.classList.remove('on');});
}
function _openBoughtFlow(w){
  _ensureBoughtModal();
  _wishBoughtId=w.id;
  document.getElementById('wb-pages').value='';
  _setBoughtFormat('fisico');
  openModal('mod-wish-bought');
}
function _setBoughtFormat(fmt){
  _wishBoughtFormat=fmt;
  var f=document.getElementById('wb-fmt-fisico'),d=document.getElementById('wb-fmt-digital');
  f.className='btn bs '+(fmt==='fisico'?'bp':'bg2');
  d.className='btn bs '+(fmt==='digital'?'bp':'bg2');
}
function _confirmBought(addToShelf){
  var w=S.wishlist.find(function(x){return x.id===_wishBoughtId;});if(!w)return;
  w.bought=true;
  if(addToShelf){
    var pages=parseInt(document.getElementById('wb-pages').value)||0;
    S.books.push({
      id:Date.now(),
      title:w.title,
      author:w.author,
      genre:w.cat,
      pages:pages,
      read:0,
      format:_wishBoughtFormat,
      status:'quero',
      rating:0,
      tags:[],
      review:'',
      cover:'',
      addedAt:new Date().toISOString(),
      startedAt:'',
      finishedAt:'',
      chapter:'',
      year:new Date().getFullYear()
    });
    sv('books');
  }
  sv('wishlist');
  closeModal('mod-wish-bought');
  renderWish();
  if(addToShelf)go('estantes');
}
function delWish(id){S.wishlist=S.wishlist.filter(function(x){return x.id!==id;});sv('wishlist');renderWish();}

// STUDY
function openStudy(){
  var fields=['st-t','st-a','st-ar','st-n'];
  for(var i=0;i<fields.length;i++){var el=document.getElementById(fields[i]);if(el)el.value='';}
  var ss=document.getElementById('st-s');if(ss)ss.value='estudando';
  var m=document.getElementById('mod-st');if(m)delete m.dataset.editId;
  openModal('mod-st');
}
function editSt(id){
  var s=S.study.find(function(x){return x.id===id;});if(!s)return;
  document.getElementById('st-t').value=s.title;
  document.getElementById('st-a').value=s.author;
  document.getElementById('st-ar').value=s.area||'';
  document.getElementById('st-s').value=s.status;
  document.getElementById('st-n').value=s.notes||'';
  document.getElementById('mod-st').dataset.editId=id;
  openModal('mod-st');
}
function saveStudy(){
  var editId=document.getElementById('mod-st').dataset.editId;
  var data={title:document.getElementById('st-t').value,author:document.getElementById('st-a').value,area:document.getElementById('st-ar').value,status:document.getElementById('st-s').value,notes:document.getElementById('st-n').value};
  if(editId){var idx=S.study.findIndex(function(x){return x.id===parseInt(editId);});if(idx>=0)S.study[idx]=Object.assign({},S.study[idx],data);delete document.getElementById('mod-st').dataset.editId;}
  else{S.study.push(Object.assign({id:Date.now()},data));}
  sv('study');closeModal('mod-st');renderStudy();
}
function renderStudy(){
  var el=document.getElementById('st-list');if(!el)return;
  var searchEl=document.getElementById('study-search');var sortEl=document.getElementById('study-sort');
  var q=searchEl?searchEl.value.toLowerCase().trim():'';var sort=sortEl?sortEl.value:'recente';
  var items=S.study.slice();
  if(q)items=items.filter(function(s){return(s.title+' '+(s.author||'')+' '+(s.area||'')).toLowerCase().indexOf(q)>=0;});
  if(sort==='titulo-az')items.sort(function(a,b){return a.title.localeCompare(b.title,'pt');});
  else if(sort==='titulo-za')items.sort(function(a,b){return b.title.localeCompare(a.title,'pt');});
  else if(sort==='autor-az')items.sort(function(a,b){return(a.author||'').localeCompare(b.author||'','pt');});
  else if(sort==='autor-za')items.sort(function(a,b){return(b.author||'').localeCompare(a.author||'','pt');});
  else if(sort==='status'){var ord={estudando:0,quero:1,concluido:2};items.sort(function(a,b){return(ord[a.status]!==undefined?ord[a.status]:9)-(ord[b.status]!==undefined?ord[b.status]:9);});}
  if(!items.length){el.innerHTML='<div class="empty"><div class="ei">&#x1F393;</div><p>Nenhum livro de estudo</p></div>';return;}
  var sb={estudando:'bv',quero:'bsk',concluido:'bmi'};
  el.innerHTML=items.map(function(s){
    return '<div style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--bord);">'+
      '<div style="font-size:22px;">&#x1F393;</div>'+
      '<div style="flex:1;min-width:0;"><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">'+
      '<span style="font-size:13px;font-weight:600;">'+s.title+'</span>'+
      '<span class="bdg '+(sb[s.status]||'bt2')+'">'+s.status+'</span></div>'+
      '<div style="font-size:11px;color:var(--txt2);">'+(s.author||'')+(s.area?' &middot; '+s.area:'')+'</div>'+
      (s.notes?'<div style="font-size:11px;color:var(--txt3);margin-top:3px;">'+s.notes+'</div>':'')+
      '</div><div style="display:flex;gap:4px;">'+
      '<button class="btn bx bg2" onclick="editSt('+s.id+')">&#x270F;&#xFE0F;</button>'+
      '<button class="btn bx bd" onclick="delSt('+s.id+')">&#x2715;</button>'+
      '</div></div>';
  }).join('');
}
function delSt(id){S.study=S.study.filter(function(x){return x.id!==id;});sv('study');renderStudy();}

// METAS
function saveMeta(){
  var yr=parseInt(document.getElementById('m-y').value)||new Date().getFullYear();
  S.metas.push({id:Date.now(),desc:document.getElementById('m-d').value,type:document.getElementById('m-t').value,goal:parseInt(document.getElementById('m-g').value)||1,current:parseInt(document.getElementById('m-c').value)||0,year:yr});
  sv('metas');closeModal('mod-meta');renderMetas();
}
function renderMetas(){
  var g=document.getElementById('meta-grid');
  if(!S.metas.length){g.innerHTML='<div class="empty" style="grid-column:1/-1"><div class="ei">&#x1F331;</div><p>Nenhuma meta</p></div>';return;}
  g.innerHTML=S.metas.map(function(m){
    var pct=Math.min(100,Math.round(m.current/m.goal*100));
    var pl=pct<25?'&#x1F331;':pct<50?'&#x1FAB4;':pct<75?'&#x1F33F;':pct<100?'&#x1F333;':'&#x1F33B;';
    return '<div class="card pc"><span class="pe">'+pl+'</span>'+
      '<div style="font-size:12px;font-weight:600;margin-bottom:3px;">'+m.desc+'</div>'+
      '<div style="font-size:10px;color:var(--txt2);margin-bottom:7px;">'+m.current+'/'+m.goal+' '+m.type+'</div>'+
      '<div class="pw" style="margin-bottom:4px;"><div class="pb" style="width:'+pct+'%;background:var(--mi)"></div></div>'+
      '<div style="font-size:10px;color:var(--txt3);margin-bottom:8px;">'+pct+'%</div>'+
      '<div style="display:flex;gap:5px;justify-content:center;">'+
      (m.type!=='livros'?'<button class="btn bp bx" onclick="incMeta('+m.id+')">+1</button>':'')+
      '<button class="btn bd bx" onclick="delMeta('+m.id+')">&#x2715;</button>'+
      '</div></div>';
  }).join('');
}
function incMeta(id){var m=S.metas.find(function(x){return x.id===id;});if(m&&m.current<m.goal){m.current++;sv('metas');renderMetas();}}
function delMeta(id){S.metas=S.metas.filter(function(x){return x.id!==id;});sv('metas');renderMetas();}

// TIMER
function startTimer(){if(S.timerOn)return;S.timerOn=true;S.timerInt=setInterval(function(){S.timerSec++;updTimerUI();},1000);}
function stopTimer(){clearInterval(S.timerInt);S.timerOn=false;}
function resetTimer(){stopTimer();S.timerSec=0;updTimerUI();}
function saveSession(){
  if(S.timerSec<10)return;
  S.sessions.push({id:Date.now(),minutes:Math.round(S.timerSec/60),date:new Date().toISOString()});
  sv('sessions');resetTimer();renderTempo();
}
function updTimerUI(){
  var h=Math.floor(S.timerSec/3600).toString().padStart(2,'0');
  var m=Math.floor((S.timerSec%3600)/60).toString().padStart(2,'0');
  var s=(S.timerSec%60).toString().padStart(2,'0');
  var str=h+':'+m+':'+s;
  ['main-tmr','i-tmr'].forEach(function(id){var e=document.getElementById(id);if(e)e.textContent=str;});
}
function renderTempo(){
  var today=new Date().toDateString();
  var weekAgo=Date.now()-7*86400000;var monthAgo=Date.now()-30*86400000;
  var hj=S.sessions.filter(function(s){return new Date(s.date).toDateString()===today;}).reduce(function(a,s){return a+s.minutes;},0);
  var sem=S.sessions.filter(function(s){return new Date(s.date)>weekAgo;}).reduce(function(a,s){return a+s.minutes;},0);
  var mes=S.sessions.filter(function(s){return new Date(s.date)>monthAgo;}).reduce(function(a,s){return a+s.minutes;},0);
  var tot=S.sessions.reduce(function(a,s){return a+s.minutes;},0);
  var ids=['t-hj','t-sem','t-mes','t-tot','i-total'];var vals=[hj,sem,mes,tot,hj];
  for(var i=0;i<ids.length;i++){var e=document.getElementById(ids[i]);if(e)e.textContent=vals[i];}
  var sl=document.getElementById('sess-list');if(!sl)return;
  if(!S.sessions.length){sl.innerHTML='<div style="font-size:12px;color:var(--txt3);text-align:center;padding:10px;">Nenhuma sessao registrada</div>';return;}
  var recent=S.sessions.slice().reverse().slice(0,10);
  sl.innerHTML=recent.map(function(s){
    return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bord);">'+
      '<span style="font-size:12px;">'+new Date(s.date).toLocaleDateString('pt-BR')+'</span>'+
      '<span style="font-weight:600;color:var(--te);">'+s.minutes+' min</span></div>';
  }).join('');
}

// SORTEIO
var _sortAnimating=false;

function sortear(){
  if(_sortAnimating)return;
  var fmts=[];
  if(document.getElementById('sf-f').checked)fmts.push('fisico');
  if(document.getElementById('sf-p').checked)fmts.push('pdf');
  if(document.getElementById('sf-k').checked)fmts.push('kindle');
  if(document.getElementById('sf-w').checked)fmts.push('wattpad');
  var pool=S.books.filter(function(b){return fmts.indexOf(b.format)>=0&&b.status==='fila';});
  var c=document.getElementById('sort-card');
  if(!pool.length){
    c.innerHTML='<div style="font-size:40px;margin-bottom:10px;">&#x1F605;</div><div style="font-size:15px;font-weight:700;">Nenhum na fila!</div><div style="font-size:12px;color:var(--txt2);margin-top:6px;">Adicione livros com status "Na fila"</div>';
    return;
  }
  var finalBook=pool[Math.floor(Math.random()*pool.length)];
  // Fase rápida: ~18 frames × 80ms = ~1440ms; depois desaceleração
  var fastCount=Math.ceil(1500/80);
  var delays=[];
  for(var i=0;i<fastCount;i++)delays.push(80);
  delays=delays.concat([100,150,200,300,500]);
  _sortAnimating=true;
  _runSortCycle(pool,finalBook,delays,0,c);
}

function _sortBookFrame(b,blurred){
  var fmtColors={fisico:'var(--mi)',pdf:'var(--li)',kindle:'var(--sk)',wattpad:'var(--am)'};
  var blur=blurred?'filter:blur(2px);':'';
  var imgHtml;
  if(b.cover){
    imgHtml='<img src="'+b.cover+'" style="width:100px;aspect-ratio:2/3;object-fit:cover;border-radius:10px;margin:0 auto 12px;display:block;'+blur+'">';
  }else{
    var bg=fmtColors[b.format]||'var(--li)';
    imgHtml='<div style="width:100px;aspect-ratio:2/3;border-radius:10px;margin:0 auto 12px;background:'+bg+';display:flex;align-items:center;justify-content:center;font-size:40px;'+blur+'">'+fmtE(b.format)+'</div>';
  }
  return imgHtml+
    '<div style="font-size:18px;font-weight:700;margin-bottom:4px;'+blur+'">'+escapeHTML(b.title)+'</div>'+
    '<div style="font-size:13px;color:var(--txt2);margin-bottom:10px;'+blur+'">'+escapeHTML(b.author)+'</div>';
}

function _runSortCycle(pool,finalBook,delays,idx,c){
  if(idx>=delays.length){
    _sortAnimating=false;
    c.innerHTML=_sortBookFrame(finalBook,false)+
      '<div style="font-size:11px;color:var(--txt3);">Toque novamente para outro</div>';
    c.classList.add('sort-pulse');
    setTimeout(function(){c.classList.remove('sort-pulse');},700);
    return;
  }
  var isLast=(idx===delays.length-1);
  var book=isLast?finalBook:pool[Math.floor(Math.random()*pool.length)];
  var blurred=delays[idx]<=80;
  c.innerHTML=_sortBookFrame(book,blurred);
  setTimeout(function(){_runSortCycle(pool,finalBook,delays,idx+1,c);},delays[idx]);
}

// STATS
var stYearN=new Date().getFullYear();
function stYear(d){stYearN+=d;document.getElementById('st-year-n').textContent=stYearN;renderStats();}
function renderStats(){
  var yr=stYearN;
  var lidos=S.books.filter(function(b){if(b.status!=='lido')return false;var dt=b.finishedAt||b.addedAt;return new Date(dt).getFullYear()===yr;});
  var pages=lidos.reduce(function(a,b){return a+b.pages;},0);
  var totalMin=S.sessions.reduce(function(a,s){return a+s.minutes;},0);
  var rated=lidos.filter(function(b){return b.rating>0;});
  var avg=rated.length?Math.round(rated.reduce(function(a,b){return a+b.rating;},0)/rated.length*10)/10:0;
  document.getElementById('st-l').textContent=lidos.length;
  document.getElementById('st-p').textContent=pages;
  document.getElementById('st-h').textContent=Math.round(totalMin/60)+'h';
  document.getElementById('st-r').textContent=avg||'--';
  var fmts={fisico:0,pdf:0,kindle:0,wattpad:0};
  lidos.forEach(function(b){if(fmts[b.format]!==undefined)fmts[b.format]++;});
  var fc={fisico:'var(--mi)',pdf:'var(--te)',kindle:'var(--sk)',wattpad:'var(--li)'};
  document.getElementById('st-fmt').innerHTML=Object.keys(fmts).map(function(f){
    return '<div class="gr"><div style="width:60px;font-size:10px;color:var(--txt2);">'+fmtE(f)+' '+f+'</div>'+
      '<div class="gb"><div class="gf" style="width:'+(lidos.length?fmts[f]/lidos.length*100:0)+'%;background:'+fc[f]+'"></div></div>'+
      '<div style="font-size:11px;font-weight:600;width:16px;text-align:right;">'+fmts[f]+'</div></div>';
  }).join('');
  var genres={};lidos.forEach(function(b){if(b.genre){var g=b.genre.trim();genres[g]=(genres[g]||0)+1;}});
  var gc=['var(--li)','var(--te)','var(--co)','var(--am)','var(--sk)','var(--mi)','var(--or)'];
  var sg=Object.keys(genres).map(function(g){return[g,genres[g]];}).sort(function(a,b){return b[1]-a[1];});
  var gEl=document.getElementById('st-gen');
  if(sg.length){var mx=sg[0][1];gEl.innerHTML=sg.map(function(item,i){return '<div class="gr"><div style="width:80px;font-size:10px;color:var(--txt2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+item[0]+'</div><div class="gb"><div class="gf" style="width:'+item[1]/mx*100+'%;background:'+gc[i%gc.length]+'"></div></div><div style="font-size:11px;font-weight:600;width:16px;text-align:right;">'+item[1]+'</div></div>';}).join('');}
  else{gEl.innerHTML='<div style="font-size:11px;color:var(--txt3);text-align:center;padding:10px;">Adicione generos aos seus livros</div>';}
  var months=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  var monthly=Array(12).fill(0);
  lidos.forEach(function(b){var d=new Date(b.finishedAt||b.addedAt);if(d.getFullYear()===yr)monthly[d.getMonth()]++;});
  var mxM=Math.max.apply(null,monthly.concat([1]));
  document.getElementById('st-monthly').innerHTML=monthly.map(function(n,i){
    return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">'+
      '<div style="width:100%;border-radius:3px 3px 0 0;min-height:3px;height:'+(Math.round(n/mxM*65)+3)+'px;background:'+(n>0?'var(--li)':'var(--surf2)')+';transition:height .4s;"></div>'+
      '<div style="font-size:8px;color:var(--txt3);">'+months[i]+'</div></div>';
  }).join('');
  var top=lidos.filter(function(b){return b.rating;}).sort(function(a,b){return b.rating-a.rating;}).slice(0,5);
  document.getElementById('st-top').innerHTML=top.length?top.map(function(b,i){
    return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'+
      '<span style="font-size:16px;">'+['&#x1F947;','&#x1F948;','&#x1F949;','4&#xFE0F;&#x20E3;','5&#xFE0F;&#x20E3;'][i]+'</span>'+
      (b.cover?'<img src="'+b.cover+'" style="width:28px;aspect-ratio:2/3;object-fit:cover;border-radius:4px;flex-shrink:0;">':'')+
      '<div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+b.title+'</div>'+
      '<div style="font-size:10px;color:var(--txt2);">'+b.author+'</div></div>'+
      '<span style="font-size:12px;color:var(--am);">'+('&#x2B50;'.repeat(Math.round(b.rating)))+'</span></div>';
  }).join(''):'<div style="font-size:11px;color:var(--txt3);text-align:center;padding:10px;">Avalie livros para ver o ranking</div>';
}

// FRASES
function saveFrase(){
  S.frases.push({id:Date.now(),text:document.getElementById('fr-t').value,book:document.getElementById('fr-b').value,author:document.getElementById('fr-a').value,page:document.getElementById('fr-p').value});
  sv('frases');closeModal('mod-frase');renderFrases();checkAlbum();
}
function renderFrases(){
  var el=document.getElementById('frases-list');
  if(!S.frases.length){el.innerHTML='<div class="empty"><div class="ei">&#x1F4AC;</div><p>Nenhuma frase ainda</p></div>';return;}
  el.innerHTML=S.frases.slice().reverse().map(function(f){
    return '<div class="qcard">'+
      '<div style="font-size:13px;font-style:italic;line-height:1.6;margin-bottom:8px;">"'+f.text+'"</div>'+
      '<div style="font-size:11px;color:var(--txt2);">-- '+(f.author||'?')+(f.book?' &middot; '+f.book:'')+(f.page?' (p.'+f.page+')':'')+'</div>'+
      '<button class="btn bx bd" style="margin-top:8px;" onclick="delFrase('+f.id+')">&#x2715;</button></div>';
  }).join('');
}
function delFrase(id){S.frases=S.frases.filter(function(x){return x.id!==id;});sv('frases');renderFrases();}

// EMPRESTIMOS
function saveEmp(){
  S.emprest.push({id:Date.now(),book:document.getElementById('em-b').value,person:document.getElementById('em-p').value,date:document.getElementById('em-d').value,due:document.getElementById('em-dv').value,returned:false});
  sv('emprest');closeModal('mod-emp');renderEmp();
}
function renderEmp(){
  var el=document.getElementById('emp-list');
  if(!S.emprest.length){el.innerHTML='<div class="empty"><div class="ei">&#x1F91D;</div><p>Nenhum emprestimo</p></div>';return;}
  el.innerHTML=S.emprest.map(function(e){
    var due=e.due?new Date(e.due+'T12:00:00'):null;
    var overdue=due&&!e.returned&&due<new Date();
    return '<div class="emp-row">'+
      '<div style="flex:1;min-width:0;">'+
      '<div style="font-size:13px;font-weight:600;'+(e.returned?'text-decoration:line-through':'')+' ;">'+e.book+'</div>'+
      '<div style="font-size:11px;color:var(--txt2);">Para: '+e.person+'</div>'+
      (e.due?'<div style="font-size:11px;'+(overdue?'color:var(--co);font-weight:600;':'color:var(--txt3);')+'">Devolucao: '+new Date(e.due+'T12:00:00').toLocaleDateString('pt-BR')+(overdue?' &#x26A0;':'')+'</div>':'')+
      '</div>'+
      '<button class="btn bx bg2" onclick="togEmp('+e.id+')">'+(e.returned?'&#x21A9;':'Dev.')+'</button>'+
      '<button class="btn bx bd" onclick="delEmp('+e.id+')">&#x2715;</button></div>';
  }).join('');
}
function togEmp(id){var e=S.emprest.find(function(x){return x.id===id;});if(e){e.returned=!e.returned;sv('emprest');renderEmp();}}
function delEmp(id){S.emprest=S.emprest.filter(function(x){return x.id!==id;});sv('emprest');renderEmp();}
