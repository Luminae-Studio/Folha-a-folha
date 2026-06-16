// ════════════════════════════════════════════════════════
// SUPABASE — Auth & Cloud Sync
// ════════════════════════════════════════════════════════

// ⚠️ Substitua pelas suas credenciais do Supabase:
const SUPABASE_URL  = 'https://kwtjulysjkbsokcumnym.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nQ1ms-xEzNRGFvR39yo9Uw_2-jQo_bD';

let _sb   = null; // v2
let _user = null;
let _syncTimer = null;

function getSB() {
  if (!_sb) _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _sb;
}

// ── Telas de login / loading ──────────────────────────────
function _ensureLoginScreen() {
  if (document.getElementById('login-screen')) return;
  const el = document.createElement('div');
  el.id = 'login-screen';
  el.style.display = 'none';
  el.innerHTML = `
    <div class="login-card">
      <div class="login-logo">📚</div>
      <h1 class="login-title serif">Folha a Folha</h1>
      <p class="login-sub">Seu app pessoal de leitura e escrita</p>
      <button class="login-btn-google" onclick="loginGoogle()">
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.706 17.64 9.2z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
        </svg>
        Continuar com Google
      </button>
      <p class="login-note">Seus dados ficam seguros e<br>sincronizados entre dispositivos.</p>
    </div>`;
  document.body.appendChild(el);
}

function _ensureLoadingScreen() {
  if (document.getElementById('loading-screen')) return;
  const el = document.createElement('div');
  el.id = 'loading-screen';
  el.style.display = 'none';
  el.innerHTML = `
    <div style="text-align:center;">
      <div style="font-size:52px;margin-bottom:16px;">📚</div>
      <div style="width:32px;height:32px;border:3px solid var(--bord);border-top-color:var(--li);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 14px;"></div>
      <div style="font-size:13px;color:var(--txt2);">Carregando seus dados…</div>
    </div>`;
  document.body.appendChild(el);
}

function _showScreen(id) {
  ['login-screen','loading-screen'].forEach(sid => {
    const el = document.getElementById(sid);
    if (el) el.style.display = sid === id ? 'flex' : 'none';
  });
}

function _hideScreens() {
  ['login-screen','loading-screen'].forEach(sid => {
    const el = document.getElementById(sid);
    if (el) el.style.display = 'none';
  });
}

// ── Auth ──────────────────────────────────────────────────
async function initAuth() {
  _ensureLoginScreen();
  _ensureLoadingScreen();
  _showScreen('loading-screen');

  const sb = getSB();
  const { data: { session } } = await sb.auth.getSession();

  if (session) {
    await _handleLogin(session.user);
  } else {
    _showScreen('login-screen');
  }

  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session && !_user) {
      await _handleLogin(session.user);
    } else if (event === 'SIGNED_OUT') {
      _user = null;
      _showScreen('login-screen');
    }
  });
}

async function loginGoogle() {
  const btn = document.querySelector('.login-btn-google');
  if (btn) { btn.disabled = true; btn.style.opacity = '.6'; }
  try {
    await getSB().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://luminae-studio.github.io/Folha-a-folha/' }
    });
  } catch(e) {
    console.error('loginGoogle error', e);
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  }
}

async function logout() {
  if (!confirm('Sair da conta?\nSeus dados continuam salvos na nuvem.')) return;
  await getSB().auth.signOut();
  location.reload();
}

// ── Inicialização após login ──────────────────────────────
async function _handleLogin(user) {
  _user = user;
  _showScreen('loading-screen');
  await _loadCloudData();
  if (typeof migrateMetas === 'function') migrateMetas();
  if (typeof syncMetasLivros === 'function') syncMetasLivros();
  _patchDB();
  _hideScreens();
  if (typeof updateProfileUI === 'function') updateProfileUI();
  if (typeof renderInicio    === 'function') renderInicio();
  if (typeof checkAlbum      === 'function') checkAlbum();
  const diEl = document.getElementById('di-d');
  if (diEl) diEl.value = new Date().toISOString().split('T')[0];
}

// ── Chaves sincronizadas ──────────────────────────────────
const _SYNC_KEYS = [
  'profile','books','wishlist','study','metas','sessions','manus',
  'concursos','pubs','ideias','rotina','rotMeta','frases','diario',
  'emprest','az','dcStreak','dcGenWr','rdGenRd','dcSubMeta','prompts','theme'
];

// ── Carregar dados da nuvem ───────────────────────────────
async function _loadCloudData() {
  if (!_user) return;
  try {
    const { data, error } = await getSB()
      .from('user_data')
      .select('payload')
      .eq('user_id', _user.id)
      .maybeSingle();

    if (error) { console.warn('loadCloudData:', error.message); return; }
    if (!data?.payload) return;

    const payload = data.payload;
    _SYNC_KEYS.forEach(k => {
      if (payload[k] === undefined) return;
      try {
        localStorage.setItem('faf3_' + k, JSON.stringify(payload[k]));
        // Atualiza S em memória se já foi inicializado
        if (typeof S !== 'undefined' && k in S) S[k] = payload[k];
      } catch {}
    });

    // Re-aplica tema se veio da nuvem
    if (payload.theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      const ti = document.getElementById('theme-ico');
      if (ti) ti.textContent = '☀️';
      const tm = document.getElementById('theme-color-meta');
      if (tm) tm.content = '#0F0A1A';
    }
  } catch(e) { console.warn('loadCloudData error', e); }
}

// ── Salvar dados na nuvem ─────────────────────────────────
async function _saveCloudData() {
  if (!_user || typeof S === 'undefined') return;
  try {
    const payload = {};
    _SYNC_KEYS.forEach(k => { if (k in S) payload[k] = S[k]; });
    const { error } = await getSB()
      .from('user_data')
      .upsert({ user_id: _user.id, payload, updated_at: new Date().toISOString() },
               { onConflict: 'user_id' });
    if (error) console.warn('saveCloudData:', error.message);
  } catch(e) { console.warn('saveCloudData error', e); }
}

function _scheduleSync() {
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(_saveCloudData, 2500);
}

// ── Patch DB.set para disparar sync automático ────────────
function _patchDB() {
  if (typeof DB === 'undefined' || DB._patched) return;
  const origSet = DB.set.bind(DB);
  DB.set = function(k, v) { origSet(k, v); _scheduleSync(); };
  DB._patched = true;
}

// ════════════════════════════════════════════════════════
// CHECK-INS DE LEITURA
// ════════════════════════════════════════════════════════
async function addCheckin(bookId, page, checkinAt, note) {
  try {
    const { error } = await getSB().from('reading_checkins').insert({
      user_id: _user ? _user.id : null,
      book_id: bookId,
      page: page,
      checkin_at: checkinAt,
      note: note || null
    });
    if (error) console.warn('addCheckin:', error.message);
    return !error;
  } catch(e) { console.warn('addCheckin error', e); return false; }
}

async function getCheckins(bookId) {
  try {
    const { data, error } = await getSB()
      .from('reading_checkins')
      .select('*')
      .eq('book_id', bookId)
      .order('checkin_at', { ascending: true });
    if (error) { console.warn('getCheckins:', error.message); return []; }
    return data || [];
  } catch(e) { console.warn('getCheckins error', e); return []; }
}

// ════════════════════════════════════════════════════════
// ACHADOS / PREVISÕES
// ════════════════════════════════════════════════════════
async function addFinding(bookId, page, content) {
  try {
    const { error } = await getSB().from('book_findings').insert({
      user_id: _user ? _user.id : null,
      book_id: bookId,
      parent_id: null,
      page: page,
      content: content
    });
    if (error) console.warn('addFinding:', error.message);
    return !error;
  } catch(e) { console.warn('addFinding error', e); return false; }
}

async function getFindings(bookId) {
  try {
    const { data, error } = await getSB()
      .from('book_findings')
      .select('*')
      .eq('book_id', bookId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });
    if (error) { console.warn('getFindings:', error.message); return []; }
    return data || [];
  } catch(e) { console.warn('getFindings error', e); return []; }
}

async function addFindingReply(parentId, bookId, page, content) {
  try {
    const { error } = await getSB().from('book_findings').insert({
      user_id: _user ? _user.id : null,
      book_id: bookId,
      parent_id: parentId,
      page: page,
      content: content
    });
    if (error) console.warn('addFindingReply:', error.message);
    return !error;
  } catch(e) { console.warn('addFindingReply error', e); return false; }
}

async function getFindingThread(findingId) {
  try {
    const [rootRes, repliesRes] = await Promise.all([
      getSB().from('book_findings').select('*').eq('id', findingId).maybeSingle(),
      getSB().from('book_findings').select('*').eq('parent_id', findingId).order('created_at', { ascending: true })
    ]);
    if (rootRes.error) console.warn('getFindingThread root:', rootRes.error.message);
    if (repliesRes.error) console.warn('getFindingThread replies:', repliesRes.error.message);
    return { root: rootRes.data || null, replies: repliesRes.data || [] };
  } catch(e) { console.warn('getFindingThread error', e); return { root: null, replies: [] }; }
}
