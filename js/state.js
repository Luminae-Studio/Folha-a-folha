// ════════════════════════════════════════════════════════
// DB
// ════════════════════════════════════════════════════════
const DB={
  get(k){try{const v=localStorage.getItem('faf3_'+k);return v!==null?JSON.parse(v):null}catch{return null}},
  set(k,v){try{localStorage.setItem('faf3_'+k,JSON.stringify(v))}catch{}}
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
  diario:   DB.get('diario')   ||[],
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

// Apply saved theme on load
(function(){
  if(S.theme==='dark'){
    document.documentElement.setAttribute('data-theme','dark');
    const ti=document.getElementById('theme-ico');
    if(ti)ti.textContent='☀️';
    document.getElementById('theme-color-meta').content='#0F0A1A';
  }
})();
