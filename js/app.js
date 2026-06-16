// Migração: garante que metas antigas sem "year" recebam o ano atual
(function migrateMetas(){
  var changed=false;
  var yr=new Date().getFullYear();
  S.metas.forEach(function(m){if(!m.year){m.year=yr;changed=true;}});
  if(changed)sv('metas');
})();

// A inicialização agora é feita por _handleLogin() em supabase.js
if (typeof initAuth === 'undefined') {
  updateProfileUI();
  renderInicio();
  checkAlbum();
  document.getElementById('di-d').value = new Date().toISOString().split('T')[0];
}
