// ════════════════════════════════════════════════════════
// PROFILE
// ════════════════════════════════════════════════════════
function editProfile(){
  document.getElementById('p-name').value=S.profile.name;
  document.getElementById('p-reading').value=S.profile.reading;
  if(S.profile.avatar){document.getElementById('p-av-prev').src=S.profile.avatar;document.getElementById('p-av-prev').style.display='block';document.getElementById('p-av-hint').style.display='none';}
  openModal('mod-profile');
}
async function saveProfile(){
  const img=await readImg(document.getElementById('p-av-inp'));
  S.profile.name=document.getElementById('p-name').value||S.profile.name;
  S.profile.reading=document.getElementById('p-reading').value;
  if(img)S.profile.avatar=img;
  sv('profile');updateProfileUI();closeModal('mod-profile');
}
function updateProfileUI(){
  document.getElementById('pn').textContent=S.profile.name;
  document.getElementById('pr').textContent=S.profile.reading||'—';
  const av=document.getElementById('av');
  if(S.profile.avatar)av.innerHTML=`<img src="${S.profile.avatar}" onclick="editProfile()" style="width:100%;height:100%;object-fit:cover;">`;
  else{const ph=document.getElementById('av-ph');if(ph)ph.textContent='📚';}
}

// ════════════════════════════════════════════════════════
// BOOKS
// ════════════════════════════════════════════════════════
function fmtE(f){return{fisico:'📗',pdf:'📄',kindle:'📱',wattpad:'🌐'}[f]||'📚';}

function openAddBook(status){
  ['b-title','b-author','b-genre','b-read','b-rating','b-tags','b-review'].forEach(i=>document.getElementById(i).value='');
  document.getElementById('b-pages').value='';
  if(status)document.getElementById('b-status').value=status;
  const p=document.getElementById('b-cov-prev');p.src='';p.style.display='none';
  document.getElementById('b-cov-hint').style.display='flex';
  document.getElementById('b-cov-inp').value='';
  const bs=document.getElementById('b-started');if(bs)bs.value='';
  const bf=document.getElementById('b-finished');if(bf)bf.value='';
  openModal('mod-book');
}
async function saveBook(){
  const cov=await readImg(document.getElementById('b-cov-inp'));
  const editId=document.getElementById('mod-book').dataset.editId;
  if(editId){
    const idx=S.books.findIndex(x=>x.id===parseInt(editId));
    if(idx>=0){
      const old=S.books[idx];
      S.books[idx]={
        ...old,
        title:document.getElementById('b-title').value,
        author:document.getElementById('b-author').value,
        genre:document.getElementById('b-genre').value,
        pages:parseInt(document.getElementById('b-pages').value)||old.pages,
        read:parseInt(document.getElementById('b-read').value)||old.read,
        format:document.getElementById('b-fmt').value,
        status:document.getElementById('b-status').value,
        rating:parseFloat(document.getElementById('b-rating').value)||old.rating,
        tags:document.getElementById('b-tags').value.split(',').map(t=>t.trim()).filter(Boolean),
        review:document.getElementById('b-review').value,
        cover:cov||old.cover,
        finishedAt:document.getElementById('b-finished')?.value||(document.getElementById('b-status').value==='lido'?(old.finishedAt||''):''),
        startedAt:document.getElementById('b-started')?.value||old.startedAt||'',
      };
    }
    delete document.getElementById('mod-book').dataset.editId;
  } else {
    const b={
      id:Date.now(),title:document.getElementById('b-title').value,
      author:document.getElementById('b-author').value,genre:document.getElementById('b-genre').value,
      pages:parseInt(document.getElementById('b-pages').value)||0,
      read:parseInt(document.getElementById('b-read').value)||0,
      format:document.getElementById('b-fmt').value,status:document.getElementById('b-status').value,
      rating:parseFloat(document.getElementById('b-rating').value)||0,
      tags:document.getElementById('b-tags').value.split(',').map(t=>t.trim()).filter(Boolean),
      review:document.getElementById('b-review').value,cover:cov,
      addedAt:new Date().toISOString(),
      startedAt:document.getElementById('b-started')?.value||'',
      finishedAt:document.getElementById('b-finished')?.value||'',
      chapter:document.getElementById('b-chapter')?.value||'',
      year:parseInt(document.getElementById('b-finished')?.value?.substring(0,4))||new Date().getFullYear()
    };
    S.books.push(b);
  }
  sv('books');closeModal('mod-book');
  checkAlbum();renderPage(S.curPage);
}
function openProg(id){
  const b=S.books.find(x=>x.id===id);if(!b)return;
  document.getElementById('prog-id').value=id;
  document.getElementById('prog-p').value=b.read;
  document.getElementById('prog-r').value=b.rating;
  document.getElementById('prog-rev').value=b.review;
  const pch=document.getElementById('prog-ch');if(pch)pch.value=b.chapter||'';
  const pst=document.getElementById('prog-st');if(pst)pst.value=b.status||'lendo';
  openModal('mod-prog');
}
function saveProgress(){
  const id=parseInt(document.getElementById('prog-id').value);
  const b=S.books.find(x=>x.id===id);if(!b)return;
  b.read=parseInt(document.getElementById('prog-p').value)||b.read;
  b.rating=parseFloat(document.getElementById('prog-r').value)||b.rating;
  b.review=document.getElementById('prog-rev').value||b.review;
  const pch=document.getElementById('prog-ch');if(pch&&pch.value)b.chapter=pch.value;
  const pst=document.getElementById('prog-st');
  if(pst){
    const newStatus=pst.value;
    if(newStatus==='lido'&&b.status!=='lido'){b.finishedAt=b.finishedAt||new Date().toISOString().split('T')[0];}
    if(newStatus!=='lido')b.finishedAt='';
    b.status=newStatus;
  } else if(b.pages>0&&b.read>=b.pages&&b.status!=='lido'){
    b.status='lido';
    b.finishedAt=b.finishedAt||new Date().toISOString().split('T')[0];
  }
  sv('books');closeModal('mod-prog');closeModal('mod-bdet');checkAlbum();renderPage(S.curPage);
}
function delBook(id){S.books=S.books.filter(x=>x.id!==id);sv('books');closeModal('mod-bdet');renderPage(S.curPage);}
function editBook(id){
  const b=S.books.find(x=>x.id===id);if(!b)return;
  closeModal('mod-bdet');
  document.getElementById('b-title').value=b.title;
  document.getElementById('b-author').value=b.author;
  document.getElementById('b-genre').value=b.genre||'';
  document.getElementById('b-pages').value=b.pages||'';
  document.getElementById('b-read').value=b.read||'';
  document.getElementById('b-fmt').value=b.format;
  document.getElementById('b-status').value=b.status;
  document.getElementById('b-rating').value=b.rating||'';
  document.getElementById('b-tags').value=(b.tags||[]).join(', ');
  document.getElementById('b-review').value=b.review||'';
  const p=document.getElementById('b-cov-prev');
  if(b.cover){p.src=b.cover;p.style.display='block';document.getElementById('b-cov-hint').style.display='none';}
  else{p.src='';p.style.display='none';document.getElementById('b-cov-hint').style.display='flex';}
  document.getElementById('b-cov-inp').value='';
  const bch=document.getElementById('b-chapter');if(bch)bch.value=b.chapter||'';
  const bst=document.getElementById('b-started');if(bst)bst.value=b.startedAt||'';
  const bfn=document.getElementById('b-finished');if(bfn)bfn.value=b.finishedAt?b.finishedAt.substring(0,10):'';
  document.getElementById('mod-book').dataset.editId=id;
  openModal('mod-book');
}
function showBookDetail(id){
  const b=S.books.find(x=>x.id===id);if(!b)return;
  const pct=b.pages?Math.min(100,Math.round(b.read/b.pages*100)):0;
  document.getElementById('bdet-content').innerHTML=`
    <div style="display:flex;gap:12px;margin-bottom:14px;">
      ${b.cover?`<img src="${b.cover}" style="width:72px;aspect-ratio:2/3;object-fit:cover;border-radius:8px;flex-shrink:0;">`
        :`<div style="width:72px;aspect-ratio:2/3;border-radius:8px;background:var(--surf2);display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;">${fmtE(b.format)}</div>`}
      <div style="flex:1;min-width:0;">
        <div style="font-size:17px;font-weight:700;font-family:var(--font-serif);line-height:1.2;margin-bottom:3px;">${b.title}</div>
        <div style="font-size:12px;color:var(--txt2);margin-bottom:6px;">${b.author}</div>
        ${b.genre?`<span class="bdg bv">${b.genre}</span>`:''}
        ${b.rating?`<div style="font-size:14px;color:var(--am);margin-top:6px;">${'⭐'.repeat(Math.round(b.rating))}</div>`:''}
      </div>
    </div>
    ${b.tags&&b.tags.length?`<div style="margin-bottom:10px;">${b.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>`:''}
    ${b.pages?`<div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--txt2);margin-bottom:3px;"><span>${b.read}/${b.pages} pág.</span><span>${pct}%</span></div><div class="pw"><div class="pb" style="width:${pct}%;background:var(--te)"></div></div></div>`:''}
    ${b.chapter?`<div style="font-size:12px;color:var(--li);margin-bottom:8px;font-weight:500;">📌 ${b.chapter}</div>`:''}
    ${b.review?`<div style="font-size:12px;color:var(--txt2);background:var(--surf2);border-radius:var(--rs);padding:10px;line-height:1.6;font-style:italic;">"${b.review}"</div>`:''}
    ${b.startedAt?`<div style="font-size:11px;color:var(--txt3);margin-top:8px;">📅 Iniciado em ${new Date(b.startedAt+'T12:00:00').toLocaleDateString('pt-BR')}</div>`:''}
    ${b.finishedAt?`<div style="font-size:11px;color:var(--txt3);margin-top:4px;">✅ Lido em ${new Date((b.finishedAt+'T12:00:00').substring(0,19)).toLocaleDateString('pt-BR')}</div>`:''}
  `;
  document.getElementById('bdet-actions').innerHTML=`
    <button class="btn bg2 bs" onclick="closeModal('mod-bdet')">Fechar</button>
    <button class="btn bg2 bs" onclick="editBook(${id})">✏️ Editar</button>
    <button class="btn bp" onclick="openProg(${id})">Atualizar</button>
    <button class="btn bd bs" onclick="delBook(${id})">🗑️</button>
  `;
  openModal('mod-bdet');
}

// ─── SHELF ──────────────────────────────────────────────
function switchShelf(btn,shelf){
  document.querySelectorAll('#sh-tabs .tab').forEach(t=>t.classList.remove('on'));
  btn.classList.add('on');S.shelf=shelf;renderShelf();
}
function renderShelf(){
  let books;
  if(S.shelf==='todos')books=[...S.books];
  else if(S.shelf==='nao-lidos')books=S.books.filter(b=>b.status!=='lido');
  else if(S.shelf==='lidos')books=S.books.filter(b=>b.status==='lido');
  else books=S.books.filter(b=>b.format===S.shelf);
  const q=(document.getElementById('sh-search')?.value||'').toLowerCase().trim();
  if(q)books=books.filter(b=>(b.title+' '+b.author).toLowerCase().includes(q));
  const sort=document.getElementById('sh-sort')?.value||'recente';
  if(sort==='titulo-az')books.sort((a,b)=>a.title.localeCompare(b.title,'pt'));
  else if(sort==='titulo-za')books.sort((a,b)=>b.title.localeCompare(a.title,'pt'));
  else if(sort==='autor-az')books.sort((a,b)=>(a.author||'').localeCompare(b.author||'','pt'));
  else if(sort==='autor-za')books.sort((a,b)=>(b.author||'').localeCompare(a.author||'','pt'));
  else if(sort==='avaliacao')books.sort((a,b)=>(b.rating||0)-(a.rating||0));
  else if(sort==='progresso')books.sort((a,b)=>{const pa=a.pages?a.read/a.pages:0;const pb=b.pages?b.read/b.pages:0;return pb-pa;});
  else books.sort((a,b)=>new Date(b.addedAt)-new Date(a.addedAt));
  document.getElementById('sh-count').textContent=`${books.length} livro${books.length!==1?'s':''}`;
  const g=document.getElementById('sh-grid');
  if(!books.length){g.innerHTML='<div class="empty" style="grid-column:1/-1"><div class="ei">📚</div><p style="font-size:12px;">Nenhum livro aqui</p></div>';return;}
  g.innerHTML=books.map(b=>`
    <div class="bc" onclick="showBookDetail(${b.id})">
      <div class="bcw">
        ${b.cover?`<img src="${b.cover}" loading="lazy">`:`<div class="bcf" style="background:var(--li-l)"><div class="be">${fmtE(b.format)}</div><div class="bt">${b.title}</div><div class="ba">${b.author}</div></div>`}
      </div>
      <div class="bci">
        <div class="bn2">${b.title}</div>
        <div class="bs2">${b.author}</div>
        ${b.pages&&b.read?`<div class="bpg"><div class="bpf" style="width:${Math.min(100,Math.round(b.read/b.pages*100))}%;background:var(--te);"></div></div>`:''}
      </div>
    </div>`).join('');
}

// ─── LENDO ──────────────────────────────────────────────
function renderLendo(){
  const lendo=S.books.filter(b=>b.status==='lendo');
  const el=document.getElementById('lendo-list');
  if(!lendo.length){el.innerHTML='<div class="empty"><div class="ei">📖</div><p>Nenhum em andamento</p></div>';return;}
  el.innerHTML=lendo.map(b=>{
    const pct=b.pages?Math.min(100,Math.round(b.read/b.pages*100)):0;
    return`<div class="card mb" style="border-left:4px solid var(--li)">
      <div class="lc">
        <div class="lth">${b.cover?`<img src="${b.cover}">`:`<div style="width:100%;height:100%;background:var(--li-l);display:flex;align-items:center;justify-content:center;font-size:18px;">${fmtE(b.format)}</div>`}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:15px;font-weight:700;margin-bottom:2px;">${b.title}</div>
          <div style="font-size:11px;color:var(--txt2);margin-bottom:8px;">${b.author}</div>
          ${b.pages?`<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--txt2);margin-bottom:3px;"><span>${b.read} / ${b.pages} pág.</span><span>${pct}%</span></div><div class="pw"><div class="pb" style="width:${pct}%;background:var(--te)"></div></div>`:''}
          ${b.chapter?`<div style="font-size:11px;color:var(--li);margin-top:5px;font-weight:500;">📌 ${b.chapter}</div>`:''}
        </div>
      </div>
      <button class="btn bp bs" style="width:100%;justify-content:center;margin-top:10px;" onclick="openProg(${b.id})">Atualizar progresso</button>
    </div>`;
  }).join('');
}

// ─── INÍCIO ─────────────────────────────────────────────
let iniYearN=new Date().getFullYear();
function iniYear(d){iniYearN+=d;renderInicio();}
function renderInicio(){
  updateProfileUI();
  document.getElementById('i-year-n').textContent=iniYearN;
  const todosLidos=S.books.filter(b=>b.status==='lido');
  const lidos=todosLidos.filter(b=>new Date(b.finishedAt||b.addedAt).getFullYear()===iniYearN);
  document.getElementById('i-lidos').textContent=lidos.length;
  document.getElementById('i-pag').textContent=lidos.reduce((a,b)=>a+b.pages,0);
  document.getElementById('i-esc').textContent=S.manus.length;
  const ma=S.metas.find(m=>m.type==='livros');
  document.getElementById('i-meta').textContent=ma?Math.round(ma.current/ma.goal*100)+'%':'—';
  const lendo=S.books.filter(b=>b.status==='lendo');
  const il=document.getElementById('i-lendo');
  il.innerHTML=lendo.length?lendo.map(b=>`
    <div class="lc" style="margin-bottom:8px;">
      <div class="lth">${b.cover?`<img src="${b.cover}">`:`<div style="width:100%;height:100%;background:var(--li-l);display:flex;align-items:center;justify-content:center;font-size:16px;">${fmtE(b.format)}</div>`}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${b.title}</div>
        ${b.pages?`<div class="pw" style="margin-top:4px;"><div class="pb" style="width:${Math.min(100,Math.round(b.read/b.pages*100))}%;background:var(--te)"></div></div><div style="font-size:10px;color:var(--txt3);margin-top:2px;">${Math.round(b.read/b.pages*100)}%</div>`:''}
      </div>
    </div>`).join('')
    :'<div style="font-size:12px;color:var(--txt3);text-align:center;padding:8px;">Nenhum livro em andamento</div>';
  renderTempo();
}
