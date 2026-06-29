// ════════════════════════════════════════════════════════
// DB
// ════════════════════════════════════════════════════════
const DB={
  get(k){try{const v=localStorage.getItem('faf3_'+k);return v!==null?JSON.parse(v):null}catch{return null}},
  set(k,v){try{localStorage.setItem('faf3_'+k,JSON.stringify(v))}catch(e){if(e&&e.name==='QuotaExceededError'||e&&e.code===22)alert('Armazenamento cheio — os dados não foram salvos. Tente remover capas de livros para liberar espaço.');else alert('Erro ao salvar dados: '+e);}}
};
function sv(k){DB.set(k,S[k]);}

// ════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════
const now=new Date();
const S={
  profile:  DB.get('profile')  ||{name:'Leitora',reading:'',avatar:''},
  books:    DB.get('books')    ||[],
  wishlist: DB.get('wishlist') ||[],
  study:    DB.get('study')    ||[],
  metas:    DB.get('metas')    ||[],
  sessions: DB.get('sessions') ||[],
  manus:    DB.get('manus')    ||[],
  concursos:DB.get('concursos')||[],
  pubs:     DB.get('pubs')     ||[],
  ideias:   DB.get('ideias')   ||[],
  rotina:   DB.get('rotina')   ||[],
  rotMeta:  DB.get('rotMeta')  ||500,
  frases:   DB.get('frases')   ||[],
  emprest:  DB.get('emprest')  ||[],
  az:       DB.get('az')       ||{},
  dcStreak: DB.get('dcStreak') ||{count:0,last:''},
  dcGenWr:  DB.get('dcGenWr')  ||{},
  rdGenRd:  DB.get('rdGenRd')  ||{},
  dcSubMeta:DB.get('dcSubMeta')||5,
  prompts:  DB.get('prompts')  ||[],
  theme:    DB.get('theme')    ||'light',
  shelf:    'todos',
  wrTab:    'ms',
  timerSec: 0,timerOn:false,timerInt:null,
  calY:     now.getFullYear(),calM:now.getMonth(),
  dcYear:   now.getFullYear(),
  rdYear:   now.getFullYear(),
  stYear:   now.getFullYear(),
  curPage:  'inicio',
};

// Migração: garante que metas antigas sem "year" recebam o ano atual.
// Definida aqui (state.js) para estar disponível antes de supabase.js e app.js.
function migrateMetas(){
  var changed=false;
  var yr=new Date().getFullYear();
  S.metas.forEach(function(m){if(!m.year){m.year=yr;changed=true;}});
  if(changed)sv('metas');
}

// Migração: converte b.genre (string) em b.genres (array) para livros antigos.
function migrateGenres(){
  var changed=false;
  S.books.forEach(function(b){
    if(!b.genres){
      b.genres=b.genre?b.genre.split(',').map(function(g){return g.trim();}).filter(Boolean):[];
      changed=true;
    }
  });
  if(changed)sv('books');
}

// Apply saved theme on load
(function(){
  if(S.theme==='dark'){
    document.documentElement.setAttribute('data-theme','dark');
    const ti=document.getElementById('theme-ico');
    if(ti)ti.textContent='☀️';
    document.getElementById('theme-color-meta').content='#0F0A1A';
  }
})();
