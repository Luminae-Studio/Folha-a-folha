// A inicialização agora é feita por _handleLogin() em supabase.js
if (typeof initAuth === 'undefined') {
  migrateMetas();
  updateProfileUI();
  renderInicio();
  checkAlbum();
  document.getElementById('di-d').value = new Date().toISOString().split('T')[0];
}
