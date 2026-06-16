// ════════════════════════════════════════════════════════
// NAV
// ════════════════════════════════════════════════════════
function go(id){
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.bn').forEach(b=>b.classList.remove('on'));
  document.querySelectorAll('.di').forEach(d=>d.classList.remove('on'));
  const pg=document.getElementById('pg-'+id);
  if(pg)pg.classList.add('on');
  const bn=document.getElementById('bn-'+id);
  if(bn)bn.classList.add('on');
  S.curPage=id;
  document.getElementById('scr').scrollTo({top:0,behavior:'instant'});
  renderPage(id);
}
function renderPage(id){
  ({
    inicio:renderInicio,estantes:renderShelf,lendo:renderLendo,
    comprar:renderWish,estudo:renderStudy,metas:renderMetas,
    stats:renderStats,tempo:renderTempo,escritora:()=>renderWrTab(S.wrTab),
    desafios:renderDesafios,frases:renderFrases,diario:renderDiario,
    emprestimos:renderEmp,sorteio:()=>{}
  }[id]||function(){})();
}

// ════════════════════════════════════════════════════════
// DRAWER
// ════════════════════════════════════════════════════════
function toggleDrawer(){
  const d=document.getElementById('drawer');
  const o=document.getElementById('drawer-ov');
  const on=d.classList.contains('on');
  d.classList.toggle('on',!on);
  o.classList.toggle('on',!on);
}
function closeDrawer(){
  document.getElementById('drawer').classList.remove('on');
  document.getElementById('drawer-ov').classList.remove('on');
}

// ════════════════════════════════════════════════════════
// THEME
// ════════════════════════════════════════════════════════
function toggleTheme(){
  const dark=document.documentElement.getAttribute('data-theme')==='dark';
  const next=dark?'light':'dark';
  document.documentElement.setAttribute('data-theme',next);
  S.theme=next;DB.set('theme',next);
  document.getElementById('theme-ico').textContent=dark?'🌙':'☀️';
  document.getElementById('theme-color-meta').content=dark?'#ffffff':'#0F0A1A';
}

// ════════════════════════════════════════════════════════
// MODAL
// ════════════════════════════════════════════════════════
function openModal(id){document.getElementById(id).classList.add('on');}
function closeModal(id){document.getElementById(id).classList.remove('on');}
document.querySelectorAll('.mov').forEach(m=>{
  m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('on');});
});

// ════════════════════════════════════════════════════════
// IMAGE
// ════════════════════════════════════════════════════════
function prevImg(inp,prevId,hintId){
  const f=inp.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=e=>{
    const img=document.getElementById(prevId);
    img.src=e.target.result;img.style.display='block';
    const h=document.getElementById(hintId);if(h)h.style.display='none';
  };
  r.readAsDataURL(f);
}
async function readImg(inp){
  const f=inp.files[0];if(!f)return'';
  return new Promise(res=>{
    const r=new FileReader();
    r.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const MAX=400;
        const scale=img.width>MAX?MAX/img.width:1;
        const c=document.createElement('canvas');
        c.width=Math.round(img.width*scale);
        c.height=Math.round(img.height*scale);
        c.getContext('2d').drawImage(img,0,0,c.width,c.height);
        res(c.toDataURL('image/jpeg',0.7));
      };
      img.src=e.target.result;
    };
    r.readAsDataURL(f);
  });
}

// ════════════════════════════════════════════════════════
// EXPORT / IMPORT
// ════════════════════════════════════════════════════════
function exportData(){
  const data={};
  ['profile','books','wishlist','study','metas','sessions','manus','concursos','pubs','ideias','rotina','frases','diario','emprest','az','dcStreak','dcGenWr','rdGenRd','dcSubMeta','prompts','unlocked'].forEach(k=>{
    const v=DB.get(k);if(v!==null)data[k]=v;
  });
  data._exportedAt=new Date().toISOString();
  data._version='4';
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='folha-a-folha-backup-'+new Date().toISOString().split('T')[0]+'.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
function importData(inp){
  const f=inp.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=e=>{
    try{
      const data=JSON.parse(e.target.result);
      const keys=['profile','books','wishlist','study','metas','sessions','manus','concursos','pubs','ideias','rotina','frases','diario','emprest','az','dcStreak','dcGenWr','rdGenRd','dcSubMeta','prompts','unlocked'];
      keys.forEach(k=>{if(data[k]!==undefined)DB.set(k,data[k]);});
      keys.forEach(k=>{if(S[k]!==undefined&&data[k]!==undefined)S[k]=data[k];});
      alert('Dados importados com sucesso! ✅');
      renderPage(S.curPage);
      updateProfileUI();
    }catch(err){alert('Erro ao importar: arquivo inválido');}
  };
  r.readAsText(f);
  inp.value='';
}

// ════════════════════════════════════════════════════════
// PWA / SERVICE WORKER
// ════════════════════════════════════════════════════════
if ('serviceWorker' in navigator) {
  window.addEventListener('beforeinstallprompt', e => {
    console.log('beforeinstallprompt disparou', e);
    e.preventDefault();
    window._installPrompt = e;
    showInstallBanner();
  });
  navigator.serviceWorker.register('/Folha-a-folha/sw.js').catch(() => {});
}

function showInstallBanner(){
  // if(localStorage.getItem('faf_install_dismissed'))return;
  const banner=document.createElement('div');
  banner.id='install-banner';
  banner.style.cssText='position:fixed;top:0;left:0;right:0;z-index:9999;background:var(--li);color:#fff;padding:12px 16px;display:flex;align-items:center;gap:12px;font-size:13px;font-weight:500;box-shadow:0 2px 12px rgba(0,0,0,.2);';
  banner.innerHTML=`
    <span style="flex:1;">📲 Adicionar Folha a Folha à tela inicial?</span>
    <button onclick="installApp()" style="background:#fff;color:var(--li);border:none;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer;">Instalar</button>
    <button onclick="dismissInstall()" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;padding:0 4px;">✕</button>
  `;
  document.body.prepend(banner);
}
function installApp(){
  console.log('_installPrompt vale:', window._installPrompt);
  if(window._installPrompt){
    window._installPrompt.prompt();
    window._installPrompt.userChoice.then(()=>{dismissInstall();window._installPrompt=null;});
  }
}
function dismissInstall(){
  const b=document.getElementById('install-banner');
  if(b)b.remove();
  localStorage.setItem('faf_install_dismissed','1');
}
