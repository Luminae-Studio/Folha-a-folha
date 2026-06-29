// A inicialização agora é feita por _handleLogin() em supabase.js
if (typeof initAuth === 'undefined') {
  migrateMetas();
  migrateGenres();
  updateProfileUI();
  renderInicio();
  checkAlbum();
}
