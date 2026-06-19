// ════════════════════════════════════════════════════════
// ESCRITORA TABS
// ════════════════════════════════════════════════════════
function wrTab(btn,tab){
  document.querySelectorAll('#wr-tabs .tab').forEach(t=>t.classList.remove('on'));
  btn.classList.add('on');
  ['ms','co','pu','id','ro','dc'].forEach(t=>{const e=document.getElementById('wt-'+t);if(e)e.style.display=t===tab?'block':'none';});
  S.wrTab=tab;renderWrTab(tab);
}
function renderWrTab(tab){
  ({ms:renderManus,co:()=>{renderCon();renderCal();},pu:renderPubs,id:renderIdeias,ro:renderRotina,dc:renderDcEscrita}[tab]||function(){})();
}

// ─── MANUSCRITOS ────────────────────────────────────────
function saveManus(){
  S.manus.push({id:Date.now(),title:document.getElementById('ms-t').value,genre:document.getElementById('ms-g').value,status:document.getElementById('ms-s').value,wordGoal:parseInt(document.getElementById('ms-wg').value)||0,words:parseInt(document.getElementById('ms-wc').value)||0,synopsis:document.getElementById('ms-sy').value,createdAt:new Date().toISOString()});
  sv('manus');closeModal('mod-ms');renderManus();
}
function renderManus(){
  const el=document.getElementById('ms-list');
  if(!S.manus.length){el.innerHTML='<div class="empty"><div class="ei">✍️</div><p>Nenhum manuscrito</p></div>';return;}
  const sc={escrevendo:'bv',revisando:'bam',pausado:'bsk',concluido:'bt2',publicado:'bmi'};
  el.innerHTML=S.manus.map(m=>{
    const pct=m.wordGoal?Math.min(100,Math.round(m.words/m.wordGoal*100)):0;
    return`<div class="card mb" style="border-left:4px solid var(--li)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px;">
        <div><div style="font-size:15px;font-weight:700;font-family:var(--font-serif);">${m.title}</div><div style="font-size:11px;color:var(--txt2);">${m.genre}</div></div>
        <div style="display:flex;gap:6px;"><span class="bdg ${sc[m.status]||'bt2'}">${m.status}</span><button class="btn bx bd" onclick="delManus(${m.id})">✕</button></div>
      </div>
      ${m.synopsis?`<div style="font-size:11px;color:var(--txt2);margin-bottom:8px;line-height:1.5;">${m.synopsis}</div>`:''}
      ${m.wordGoal?`<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--txt2);margin-bottom:3px;"><span>${m.words.toLocaleString('pt-BR')} palavras</span><span>${pct}% de ${m.wordGoal.toLocaleString('pt-BR')}</span></div><div class="pw"><div class="pb" style="width:${pct}%;background:var(--li)"></div></div>`
        :`<div style="font-size:11px;color:var(--txt3);">${m.words.toLocaleString('pt-BR')} palavras</div>`}
      <div style="display:flex;gap:6px;margin-top:10px;align-items:center;">
        <input type="number" placeholder="+ palavras" min="0" style="flex:1;padding:6px 10px;border:1.5px solid var(--bord);border-radius:6px;background:var(--surf2);color:var(--txt);font-size:12px;" id="mw-${m.id}">
        <button class="btn bp bx" onclick="addManusWords(${m.id})">Registrar</button>
      </div>
    </div>`;
  }).join('');
}
function delManus(id){S.manus=S.manus.filter(x=>x.id!==id);sv('manus');renderManus();}
function addManusWords(id){
  const m=S.manus.find(x=>x.id===id);if(!m)return;
  const inp=document.getElementById('mw-'+id);
  const w=parseInt(inp?.value)||0;if(!w)return;
  m.words=(m.words||0)+w;sv('manus');renderManus();
  S.rotina.push({id:Date.now(),words:w,proj:m.title,date:new Date().toISOString()});sv('rotina');
}

// ─── CONCURSOS ──────────────────────────────────────────
function openNewCon(){
  ['co-n','co-o','co-w','co-notes'].forEach(i=>document.getElementById(i).value='');
  ['co-d','co-d2','co-d3'].forEach(i=>document.getElementById(i).value='');
  document.getElementById('co-s').value='interesse';
  delete document.getElementById('mod-co').dataset.editId;
  document.getElementById('mod-co-title').textContent='Novo Concurso';
  openModal('mod-co');
}

function editCon(id){
  const c=S.concursos.find(x=>x.id===id);if(!c)return;
  document.getElementById('co-n').value    =c.name    ||'';
  document.getElementById('co-o').value    =c.org     ||'';
  document.getElementById('co-w').value    =c.work    ||'';
  document.getElementById('co-notes').value=c.notes   ||'';
  document.getElementById('co-s').value    =c.status  ||'interesse';
  document.getElementById('co-d').value    =c.deadline ||'';
  document.getElementById('co-d2').value   =c.deadline2||'';
  document.getElementById('co-d3').value   =c.deadline3||'';
  document.getElementById('mod-co').dataset.editId=id;
  document.getElementById('mod-co-title').textContent='Editar Concurso';
  closeModal('mod-co-det');
  openModal('mod-co');
}

function saveCon(){
  const editId=document.getElementById('mod-co').dataset.editId;
  const data={
    name:     document.getElementById('co-n').value,
    org:      document.getElementById('co-o').value,
    deadline: document.getElementById('co-d').value,
    deadline2:document.getElementById('co-d2').value,
    deadline3:document.getElementById('co-d3').value,
    work:     document.getElementById('co-w').value,
    status:   document.getElementById('co-s').value,
    notes:    document.getElementById('co-notes').value,
  };
  if(editId){
    const idx=S.concursos.findIndex(x=>x.id===parseInt(editId));
    if(idx>=0)S.concursos[idx]={...S.concursos[idx],...data};
    delete document.getElementById('mod-co').dataset.editId;
  } else {
    S.concursos.push({id:Date.now(),...data});
  }
  sv('concursos');closeModal('mod-co');renderCon();renderCal();
}

function delCon(id){
  S.concursos=S.concursos.filter(x=>x.id!==id);
  sv('concursos');closeModal('mod-co-det');renderCon();renderCal();
}

function showConDetail(id){
  const c=S.concursos.find(x=>x.id===id);if(!c)return;
  const sb={interesse:'bsk',inscrito:'bt2',aguardando:'bam',selecionado:'bmi','nao-selecionado':'bco'};

  function fmtDate(iso){
    if(!iso)return null;
    return new Date(iso+'T12:00:00').toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'});
  }
  function daysLeft(iso){
    if(!iso)return'';
    const diff=Math.ceil((new Date(iso+'T12:00:00')-new Date())/86400000);
    if(diff<0)return'<span style="color:var(--txt3);"> · encerrado</span>';
    if(diff===0)return'<span style="color:var(--co);font-weight:700;"> · hoje!</span>';
    if(diff<=7)return`<span style="color:var(--co);font-weight:700;"> · ${diff}d</span>`;
    return`<span style="color:var(--txt2);"> · ${diff} dias</span>`;
  }

  const phases=[
    {label:'📅 Prazo de inscrição',date:c.deadline},
    {label:'✏️ Fase de edição',    date:c.deadline2},
    {label:'🏆 Resultado',         date:c.deadline3},
  ].filter(p=>p.date);

  document.getElementById('co-det-content').innerHTML=`
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:12px;">
      <div>
        <div style="font-size:18px;font-weight:700;font-family:var(--font-serif);line-height:1.3;margin-bottom:4px;">${c.name}</div>
        ${c.org?`<div style="font-size:12px;color:var(--txt2);">🏛️ ${c.org}</div>`:''}
      </div>
      <span class="bdg ${sb[c.status]||'bsk'}" style="flex-shrink:0;margin-top:3px;">${c.status}</span>
    </div>

    ${c.work?`
    <div style="background:var(--surf2);border-radius:var(--rs);padding:10px 12px;margin-bottom:12px;">
      <div style="font-size:10px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px;">Obra inscrita</div>
      <div style="font-size:13px;font-weight:600;color:var(--li);">📝 ${c.work}</div>
    </div>`:''}

    ${phases.length?`
    <div style="margin-bottom:12px;">
      <div style="font-size:10px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Datas importantes</div>
      ${phases.map(p=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bord);">
          <span style="font-size:12px;color:var(--txt2);">${p.label}</span>
          <span style="font-size:12px;font-weight:600;">${fmtDate(p.date)}${daysLeft(p.date)}</span>
        </div>`).join('')}
    </div>`:''}

    ${c.notes?`
    <div style="margin-bottom:12px;">
      <div style="font-size:10px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Notas</div>
      <div style="font-size:13px;color:var(--txt);line-height:1.7;background:var(--surf2);border-radius:var(--rs);padding:12px;white-space:pre-wrap;">${c.notes}</div>
    </div>`:'<div style="font-size:12px;color:var(--txt3);text-align:center;padding:8px 0;margin-bottom:12px;">Nenhuma nota ainda.</div>'}
  `;
  document.getElementById('co-det-actions').innerHTML=`
    <button class="btn bg2 bs" onclick="closeModal('mod-co-det')">Fechar</button>
    <button class="btn bp bs" onclick="editCon(${id})">✏️ Editar</button>
    <button class="btn bd bs" onclick="delCon(${id})">🗑️</button>
  `;
  openModal('mod-co-det');
}

function renderCon(){
  const el=document.getElementById('co-list');if(!el)return;
  if(!S.concursos.length){el.innerHTML='<div style="font-size:12px;color:var(--txt3);text-align:center;padding:16px;">Nenhum concurso</div>';return;}
  const sb={interesse:'bsk',inscrito:'bt2',aguardando:'bam',selecionado:'bmi','nao-selecionado':'bco'};
  const dc={interesse:'#38BDF8',inscrito:'#2DD4BF',aguardando:'#FBBF24',selecionado:'#34D399','nao-selecionado':'#F87171'};
  const sorted=[...S.concursos].sort((a,b)=>(a.deadline||'9999')>(b.deadline||'9999')?1:-1);
  el.innerHTML=sorted.map(c=>{
    const days=c.deadline?Math.ceil((new Date(c.deadline+'T12:00:00')-new Date())/86400000):null;
    const urg=days!==null&&days>=0&&days<=7;
    const nextDate=[c.deadline,c.deadline2,c.deadline3].find(d=>d&&Math.ceil((new Date(d+'T12:00:00')-new Date())/86400000)>=0);
    const nextDays=nextDate?Math.ceil((new Date(nextDate+'T12:00:00')-new Date())/86400000):null;
    return`
      <div style="display:flex;gap:10px;padding:12px 0;border-bottom:1px solid var(--bord);cursor:pointer;" onclick="showConDetail(${c.id})">
        <div style="width:8px;height:8px;border-radius:50%;background:${dc[c.status]||'var(--li)'};flex-shrink:0;margin-top:5px;"></div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;">
            <div style="font-size:13px;font-weight:600;${urg?'color:var(--co);':''}">${c.name}</div>
            <span class="bdg ${sb[c.status]||'bsk'}" style="flex-shrink:0;">${c.status}</span>
          </div>
          ${c.org?`<div style="font-size:11px;color:var(--txt2);">${c.org}${c.work?' · '+c.work:''}</div>`:''}
          ${nextDate?`<div style="font-size:11px;margin-top:2px;${urg?'color:var(--co);font-weight:600;':'color:var(--txt3);'}">
            📅 ${new Date(nextDate+'T12:00:00').toLocaleDateString('pt-BR')}
            ${nextDays!==null?(nextDays===0?' (hoje!)':nextDays>0?` (${nextDays}d)`:' (enc.)'):''}
          </div>`:''}
        </div>
        <div style="font-size:18px;color:var(--txt3);align-self:center;">›</div>
      </div>`;
  }).join('');
}

function renderCal(){
  const y=S.calY,mo=S.calM;
  const months=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  document.getElementById('cal-title').textContent=`${months[mo]} ${y}`;
  const dh=document.getElementById('cal-h2');const dd=document.getElementById('cal-days');
  if(!dh||!dd)return;
  dh.innerHTML=['D','S','T','Q','Q','S','S'].map(d=>`<div class="cal-h">${d}</div>`).join('');
  const evDates={};
  S.concursos.forEach(c=>{
    [c.deadline,c.deadline2,c.deadline3].forEach(dl=>{
      if(!dl)return;
      const d=new Date(dl+'T12:00:00');
      if(d.getFullYear()===y&&d.getMonth()===mo){const k=d.getDate();evDates[k]=(evDates[k]||[]);evDates[k].push(c.name);}
    });
  });
  const first=new Date(y,mo,1).getDay(),dim=new Date(y,mo+1,0).getDate(),dip=new Date(y,mo,0).getDate();
  const today=new Date();let html='';
  for(let i=first-1;i>=0;i--)html+=`<div class="cal-d om">${dip-i}</div>`;
  for(let d=1;d<=dim;d++){
    const isTd=today.getFullYear()===y&&today.getMonth()===mo&&today.getDate()===d;
    html+=`<div class="cal-d${isTd?' today':''}${evDates[d]?' hev':''}" title="${evDates[d]?evDates[d].join(', '):''}">${d}</div>`;
  }
  const rem=(first+dim)%7;const fill=rem?7-rem:0;
  for(let i=1;i<=fill;i++)html+=`<div class="cal-d om">${i}</div>`;
  dd.innerHTML=html;
}
function calPrev(){S.calM--;if(S.calM<0){S.calM=11;S.calY--;}renderCal();}
function calNext(){S.calM++;if(S.calM>11){S.calM=0;S.calY++;}renderCal();}

// ─── PUBLICAÇÕES ────────────────────────────────────────
function savePub(){
  S.pubs.push({id:Date.now(),title:document.getElementById('pu-t').value,where:document.getElementById('pu-w').value,date:document.getElementById('pu-d').value,type:document.getElementById('pu-ty').value,link:document.getElementById('pu-l').value});
  sv('pubs');closeModal('mod-pu');renderPubs();
}
function renderPubs(){
  const el=document.getElementById('pu-list');if(!el)return;
  if(!S.pubs.length){el.innerHTML='<div class="empty" style="grid-column:1/-1"><div class="ei">📰</div><p>Nenhuma publicação</p></div>';return;}
  const te={conto:'📝',romance:'📖',poesia:'🌸',cronica:'✒️',artigo:'📑',outro:'📄'};
  el.innerHTML=S.pubs.map(p=>`
    <div class="card" style="border-top:3px solid var(--li);">
      <div style="font-size:24px;margin-bottom:6px;">${te[p.type]||'📄'}</div>
      <div style="font-size:13px;font-weight:700;font-family:var(--font-serif);line-height:1.3;margin-bottom:3px;">${p.title}</div>
      <div style="font-size:11px;color:var(--txt2);">📍 ${p.where}</div>
      ${p.date?`<div style="font-size:10px;color:var(--txt3);margin-top:2px;">${new Date(p.date+'T12:00:00').toLocaleDateString('pt-BR')}</div>`:''}
      <div style="display:flex;gap:6px;margin-top:8px;">
        ${p.link?`<a href="${p.link}" target="_blank" class="btn bg2 bx">🔗</a>`:''}
        <button class="btn bd bx" onclick="delPub(${p.id})">✕</button>
      </div>
    </div>`).join('');
}
function delPub(id){S.pubs=S.pubs.filter(x=>x.id!==id);sv('pubs');renderPubs();}

// ─── IDEIAS ─────────────────────────────────────────────
function saveIdeia(){
  S.ideias.push({id:Date.now(),title:document.getElementById('id-t').value,content:document.getElementById('id-c').value,genre:document.getElementById('id-g').value,color:document.getElementById('id-cor').value,createdAt:new Date().toISOString()});
  sv('ideias');closeModal('mod-id');renderIdeias();
}
function renderIdeias(){
  const el=document.getElementById('id-list');if(!el)return;
  if(!S.ideias.length){el.innerHTML='<div class="empty"><div class="ei">💡</div><p>Nenhuma ideia</p></div>';return;}
  el.innerHTML=[...S.ideias].reverse().map(i=>`
    <div style="background:${i.color};border-radius:var(--rs);padding:12px;margin-bottom:8px;border:1px solid transparent;">
      <div style="display:flex;justify-content:space-between;"><div style="font-size:13px;font-weight:700;margin-bottom:5px;">${i.title}</div><button class="btn bx" style="background:rgba(0,0,0,.1);" onclick="delId(${i.id})">✕</button></div>
      <div style="font-size:12px;line-height:1.6;color:var(--txt);">${i.content}</div>
      ${i.genre?`<div style="margin-top:6px;"><span class="tag">${i.genre}</span></div>`:''}
    </div>`).join('');
}
function delId(id){S.ideias=S.ideias.filter(x=>x.id!==id);sv('ideias');renderIdeias();}

// ─── ROTINA ─────────────────────────────────────────────
function updRotMeta(v){document.getElementById('ro-meta-n').textContent=parseInt(v).toLocaleString('pt-BR');S.rotMeta=parseInt(v);sv('rotMeta');}
function saveRotina(){
  const w=parseInt(document.getElementById('ro-words').value)||0;const p=document.getElementById('ro-proj').value;
  if(!w)return;
  S.rotina.push({id:Date.now(),words:w,proj:p,date:new Date().toISOString()});
  sv('rotina');document.getElementById('ro-words').value='';document.getElementById('ro-proj').value='';renderRotina();
}
function renderRotina(){
  document.getElementById('ro-meta-n').textContent=S.rotMeta.toLocaleString('pt-BR');
  document.getElementById('ro-range').value=S.rotMeta;
  const today=new Date().toDateString();
  const hj=S.rotina.filter(r=>new Date(r.date).toDateString()===today).reduce((a,r)=>a+r.words,0);
  const tot=S.rotina.reduce((a,r)=>a+r.words,0);
  document.getElementById('ro-hj').textContent=hj.toLocaleString('pt-BR');
  document.getElementById('ro-tot').textContent=tot.toLocaleString('pt-BR');
  const ds=['D','S','T','Q','Q','S','S'];const n=new Date();
  const wd=Array.from({length:7},(_,i)=>{const d=new Date(n);d.setDate(n.getDate()-6+i);const s=d.toDateString();return{day:ds[d.getDay()],words:S.rotina.filter(r=>new Date(r.date).toDateString()===s).reduce((a,r)=>a+r.words,0)};});
  const mx=Math.max(...wd.map(d=>d.words),S.rotMeta,100);
  const ch=document.getElementById('ro-chart');
  if(ch)ch.innerHTML=wd.map(d=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;"><div style="width:100%;border-radius:3px 3px 0 0;min-height:3px;height:${Math.round(d.words/mx*60)+4}px;background:${d.words>=S.rotMeta?'var(--mi)':'var(--li)'};"></div><div style="font-size:9px;color:var(--txt3);">${d.day}</div></div>`).join('');
}

// ════════════════════════════════════════════════════════
// DESAFIOS ESCRITURA
// ════════════════════════════════════════════════════════
const GENEROS_ESCRITA=['Romance','Fantasia','Conto','Terror','Crônica','Ficção Científica','Poesia','Thriller','Mistério','Drama','Comédia','Histórico'];
const PROMPTS_POOL=['Escreva uma cena em que dois personagens dizem exatamente o oposto do que sentem.','Uma carta encontrada em um livro velho muda a vida de quem a lê.','Seu personagem acorda num mundo onde as cores têm sons.','Escreva o último dia de um objeto inanimado.','Uma conversa entre duas pessoas que nunca vão se reencontrar.','Descreva uma cidade através dos cheiros.','Escreva sobre uma memória que alguém quer esquecer, mas não consegue.','O momento exato em que alguém decide mudar de vida.','Uma história contada ao contrário.','Escreva sobre uma amizade que o tempo não destruiu.','O objeto mais comum do mundo tem um segredo.','Alguém recebe uma segunda chance que não pediu.','Escreva sobre o silêncio entre duas pessoas.','Uma viagem que começa errada e termina certa.','O último habitante de uma cidade esquecida.','Escreva sobre algo que só existe quando ninguém está olhando.','Uma reunião de família onde todos guardam o mesmo segredo.','O dia em que a gravidade parou por 10 segundos.','Escreva sobre a fronteira entre dois mundos.','Uma história que começa e termina com a mesma frase.','O personagem que sempre aparece nos sonhos de outra pessoa.','Escreva sobre um erro que se tornou a melhor coisa que aconteceu.','Uma biblioteca onde cada livro é uma vida real.','O primeiro e o último encontro de duas almas velhas.','Escreva sobre algo que ninguém sabe que você sabe.','Uma mensagem enviada para o passado.','O dia em que as estrelas piscaram em sequência.','Escreva sobre o peso de uma promessa não cumprida.','Um personagem que existe entre duas versões de si mesmo.','A última vez que alguém viu o mar.','Escreva sobre uma cor que não tem nome.','Um encontro marcado que aconteceu 10 anos depois.','Escreva sobre o que fica quando tudo vai embora.','Uma história onde o vilão tem razão.','O momento em que a música parou.','Escreva sobre uma casa que guarda as histórias de todos que viveram nela.','Alguém que nunca dormiu descobre o que o sono realmente é.','A última palavra dita antes de um grande silêncio.','Escreva sobre encontrar algo que você não sabia que tinha perdido.','Uma história que só pode existir às 3 da manhã.','Escreva sobre o cheiro de chuva numa cidade estranha.','Um personagem que colecionava despedidas.','A primeira neve em cem anos.','Escreva sobre o que os espelhos não mostram.','Uma viagem que nunca chegou ao destino.','O dia em que as sombras trocaram de dono.','Escreva sobre alguém que vive entre dois idiomas.','Uma história dentro de uma história dentro de outra história.','O barulho que o mundo faz quando todo mundo dorme.','Escreva sobre o amor que não tem nome.','Uma estrada que só existe para quem está perdido.','O último segredo de uma cidade antiga.'];
function getWeekNum(){const d=new Date();const s=new Date(d.getFullYear(),0,1);return Math.ceil(((d-s)/86400000+s.getDay()+1)/7);}
function getPromptForWeek(year,week){
  const seed=(year*53+week)*2654435761;
  const idx=Math.abs(seed)%PROMPTS_POOL.length;
  return PROMPTS_POOL[idx];
}
function renderDcEscrita(){
  const yr=S.dcYear;
  document.getElementById('dc-year-n').textContent=yr;
  document.getElementById('dc-streak').textContent=S.dcStreak.count;
  if(!S.dcGenWr[yr])S.dcGenWr[yr]={};
  const dg=document.getElementById('dc-generos-grid');
  if(dg)dg.innerHTML=GENEROS_ESCRITA.map(g=>`
    <div class="dcard${S.dcGenWr[yr][g]?' done':''}" onclick="togDcGen(this,'${g}',${yr})">
      <div style="font-size:12px;font-weight:600;">${g}</div>
      <div style="font-size:11px;color:var(--txt3);margin-top:2px;">${S.dcGenWr[yr][g]?'✅ Escreveu!':'— pendente'}</div>
    </div>`).join('');
  const wk=getWeekNum();
  document.getElementById('dc-week-num').textContent=wk;
  document.getElementById('dc-prompt-text').textContent=getPromptForWeek(yr,wk);
  document.getElementById('mod-prompt-show').textContent=getPromptForWeek(yr,wk);
  const resps=S.prompts.filter(p=>p.year===yr).sort((a,b)=>b.week-a.week);
  const pl=document.getElementById('dc-prompts-list');
  if(pl)pl.innerHTML=resps.length?resps.map(p=>`
    <div style="background:var(--surf2);border-radius:var(--rs);padding:10px;margin-bottom:8px;">
      <div style="font-size:10px;font-weight:600;color:var(--li);margin-bottom:4px;">Semana ${p.week}</div>
      <div style="font-size:12px;color:var(--txt2);margin-bottom:4px;font-style:italic;">"${p.text.substring(0,60)}..."</div>
      ${p.resp?`<div style="font-size:12px;color:var(--txt);line-height:1.5;">${p.resp.substring(0,120)}${p.resp.length>120?'...':''}</div>`:''}
      ${p.titulo?`<div style="font-size:11px;color:var(--li);margin-top:4px;font-weight:600;">"${p.titulo}"</div>`:''}
    </div>`).join(''):'';
  const subCount=S.concursos.filter(c=>['inscrito','aguardando','selecionado','nao-selecionado'].includes(c.status)).length;
  const subMeta=S.dcSubMeta;
  const subPct=Math.min(100,Math.round(subCount/subMeta*100));
  document.getElementById('dc-sub-count').textContent=subCount+' submetidas';
  document.getElementById('dc-sub-pct').textContent=subPct+'%';
  document.getElementById('dc-sub-bar').style.width=subPct+'%';
  document.getElementById('dc-sub-meta').value=subMeta;
}
function dcYear(d){S.dcYear+=d;renderDcEscrita();}
function markToday(){
  const today=new Date().toDateString();
  if(S.dcStreak.last===today)return;
  const yesterday=new Date(Date.now()-86400000).toDateString();
  S.dcStreak.count=S.dcStreak.last===yesterday?S.dcStreak.count+1:1;
  S.dcStreak.last=today;sv('dcStreak');renderDcEscrita();
}
function togDcGen(el,g,yr){
  if(!S.dcGenWr[yr])S.dcGenWr[yr]={};
  S.dcGenWr[yr][g]=!S.dcGenWr[yr][g];sv('dcGenWr');renderDcEscrita();checkAlbum();
}
function saveDcSubMeta(){S.dcSubMeta=parseInt(document.getElementById('dc-sub-meta').value)||5;sv('dcSubMeta');renderDcEscrita();}
function savePromptResp(){
  const wk=getWeekNum();const yr=S.dcYear;
  S.prompts=S.prompts.filter(p=>!(p.week===wk&&p.year===yr));
  S.prompts.push({id:Date.now(),week:wk,year:yr,text:getPromptForWeek(yr,wk),resp:document.getElementById('pr-t').value,titulo:document.getElementById('pr-tit').value});
  sv('prompts');closeModal('mod-prompt');document.getElementById('pr-t').value='';document.getElementById('pr-tit').value='';renderDcEscrita();checkAlbum();
}

// ════════════════════════════════════════════════════════
// DESAFIOS LEITURA
// ════════════════════════════════════════════════════════
const ALPHA='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const GENEROS_LEITURA=['Romance','Fantasia','Terror','Clássico','Ficção Científica','Conto','Biografia','Poesia','Crônica','Histórico','Mistério','Mangá'];
let rdYearN=now.getFullYear();
function rdYear(d){rdYearN+=d;document.getElementById('rd-year-n').textContent=rdYearN;renderDesafios();}
function renderDesafios(){document.getElementById('rd-year-n').textContent=rdYearN;renderAZ();renderAlbum();renderRdGeneros();}
function renderAZ(){
  const yr=rdYearN;if(!S.az[yr])S.az[yr]={};
  const done=ALPHA.filter(l=>S.az[yr][l]).length;
  document.getElementById('az-count').textContent=`${done}/26 letras`;
  document.getElementById('az-pct').textContent=Math.round(done/26*100)+'%';
  document.getElementById('az-bar').style.width=Math.round(done/26*100)+'%';
  document.getElementById('az-grid').innerHTML=ALPHA.map(l=>{
    const title=S.az[yr][l];
    if(!title)return`<div class="az-cell" onclick="openAZModal('${l}',${yr})"><div class="azl">${l}</div></div>`;
    const book=S.books.find(b=>b.title===title);
    const cov=book&&book.cover;
    if(cov)return`<div class="az-cell done has-cov" onclick="openAZModal('${l}',${yr})"><img class="az-cov" src="${escapeHTML(cov)}"><div class="az-cell-ov"><div class="azl">${l}</div><div class="azt">${escapeHTML(title)}</div></div></div>`;
    return`<div class="az-cell done" onclick="openAZModal('${l}',${yr})"><div class="azl">${l}</div><div class="azt">${escapeHTML(title)}</div></div>`;
  }).join('');
}
let azCurLetter='',azCurYear=rdYearN;
const _AZ_ARTICLES=['O ','A ','As ','Os ','The ','El ','La '];
function _stripAzArticle(t){
  for(const p of _AZ_ARTICLES){if(t.toUpperCase().startsWith(p.toUpperCase()))return t.slice(p.length);}
  return t;
}
function _azCovHtml(b,w,h){
  return b.cover
    ?`<img src="${escapeHTML(b.cover)}" style="width:${w}px;height:${h}px;object-fit:cover;border-radius:4px;flex-shrink:0;">`
    :`<div style="width:${w}px;height:${h}px;background:var(--bord);border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:${Math.round(h/3)}px;">📚</div>`;
}
function openAZModal(letter,yr){
  azCurLetter=letter;azCurYear=yr;
  document.getElementById('az-letter-show').textContent=letter;
  document.getElementById('az-book-inp').value=S.az[yr]&&S.az[yr][letter]?S.az[yr][letter]:'';
  const lidos=S.books.filter(b=>
    b.status==='lido'&&
    new Date(b.finishedAt||b.addedAt).getFullYear()===yr&&
    _stripAzArticle(b.title.trim()).toUpperCase().startsWith(letter)
  );
  const listEl=document.getElementById('az-book-list');
  const inpArea=document.getElementById('az-inp-area');
  if(!lidos.length){
    listEl.innerHTML=`<div style="font-size:11px;color:var(--txt3);margin-bottom:6px;">Nenhum livro lido com letra "${letter}" em ${yr}.</div>`;
    inpArea.style.display='';
  } else if(lidos.length===1){
    const b=lidos[0];
    listEl.innerHTML=`
      <div style="font-size:11px;color:var(--txt2);margin-bottom:8px;">Sugestão para ${yr}:</div>
      <div style="display:flex;gap:10px;align-items:center;background:var(--surf2);border-radius:var(--rs);padding:8px;margin-bottom:10px;">
        ${_azCovHtml(b,36,54)}
        <div style="min-width:0;flex:1;">
          <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(b.title)}</div>
          <div style="font-size:11px;color:var(--txt3);">${escapeHTML(b.author||'')}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:10px;">
        <button class="btn bp" style="flex:1;" data-title="${escapeHTML(b.title)}" onclick="_useAZBook(this.dataset.title)">Usar este livro</button>
        <button class="btn bg2" style="flex:1;" onclick="_showAZManual()">Escolher outro</button>
      </div>`;
    inpArea.style.display='none';
  } else {
    listEl.innerHTML=`
      <div style="font-size:11px;color:var(--txt2);margin-bottom:8px;">${lidos.length} livros com "${letter}" em ${yr} — toque para usar:</div>
      ${lidos.map(b=>`
        <div style="display:flex;gap:10px;align-items:center;padding:8px 4px;border-bottom:1px solid var(--bord);cursor:pointer;" data-title="${escapeHTML(b.title)}" onclick="_useAZBook(this.dataset.title)">
          ${_azCovHtml(b,32,48)}
          <div style="min-width:0;flex:1;">
            <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(b.title)}</div>
            <div style="font-size:11px;color:var(--txt3);">${escapeHTML(b.author||'')}</div>
          </div>
        </div>`).join('')}
      <div style="margin-top:10px;text-align:center;">
        <button class="btn bg2 bs" onclick="_showAZManual()" style="font-size:12px;">✏️ Digitar manualmente</button>
      </div>`;
    inpArea.style.display='none';
  }
  openModal('mod-az');
}
function _useAZBook(title){
  document.getElementById('az-book-inp').value=title;
  saveAZ();
}
function _showAZManual(){
  document.getElementById('az-inp-area').style.display='';
  document.getElementById('az-book-inp').focus();
}
function saveAZ(){
  const val=document.getElementById('az-book-inp').value.trim();
  if(!S.az[azCurYear])S.az[azCurYear]={};
  if(val)S.az[azCurYear][azCurLetter]=val;
  else delete S.az[azCurYear][azCurLetter];
  sv('az');closeModal('mod-az');renderAZ();checkAlbum();
}
function renderRdGeneros(){
  const yr=rdYearN;if(!S.rdGenRd[yr])S.rdGenRd[yr]={};
  S.books.filter(b=>b.status==='lido'&&new Date(b.finishedAt||b.addedAt).getFullYear()===yr).forEach(b=>{
    const gs=b.genres&&b.genres.length?b.genres:(b.genre?[b.genre]:[]);
    gs.forEach(g=>{const gn=GENEROS_LEITURA.find(x=>x.toLowerCase()===g.toLowerCase().trim());if(gn&&!S.rdGenRd[yr][gn])S.rdGenRd[yr][gn]=true;});
  });
  const el=document.getElementById('rd-generos-grid');if(!el)return;
  el.innerHTML=GENEROS_LEITURA.map(g=>`
    <div class="dcard${S.rdGenRd[yr][g]?' done':''}" onclick="togRdGen('${g}',${yr})">
      <div style="font-size:12px;font-weight:600;">${g}</div>
      <div style="font-size:11px;color:var(--txt3);margin-top:2px;">${S.rdGenRd[yr][g]?'✅ Leu!':'— pendente'}</div>
    </div>`).join('');
}
function togRdGen(g,yr){
  if(!S.rdGenRd[yr])S.rdGenRd[yr]={};
  S.rdGenRd[yr][g]=!S.rdGenRd[yr][g];sv('rdGenRd');renderRdGeneros();checkAlbum();
}

// ════════════════════════════════════════════════════════
// ÁLBUM DE CONQUISTAS
// ════════════════════════════════════════════════════════
const CONQUISTAS=[
  {id:'p1',emoji:'🌱',name:'Primeira Página',desc:'Adicionou o primeiro livro',check:()=>S.books.length>=1},
  {id:'p2',emoji:'📖',name:'Leitora Ativa',desc:'Finalizou 5 livros',check:()=>S.books.filter(b=>b.status==='lido').length>=5},
  {id:'p3',emoji:'📚',name:'Devora-Livros',desc:'Finalizou 20 livros',check:()=>S.books.filter(b=>b.status==='lido').length>=20},
  {id:'p4',emoji:'🔤',name:'Alfa-Bet-Riz',desc:'Completou o desafio A-Z',check:()=>{const yr=rdYearN;return S.az[yr]&&ALPHA.every(l=>S.az[yr][l]);}},
  {id:'p5',emoji:'⭐',name:'Crítica Literária',desc:'Avaliou 10 livros',check:()=>S.books.filter(b=>b.rating>0).length>=10},
  {id:'p6',emoji:'✍️',name:'Autora',desc:'Criou o primeiro manuscrito',check:()=>S.manus.length>=1},
  {id:'p7',emoji:'🔥',name:'Maratona',desc:'7 dias de streak de escrita',check:()=>S.dcStreak.count>=7},
  {id:'p8',emoji:'🏆',name:'Concorrente',desc:'Inscreveu em 3 concursos',check:()=>S.concursos.filter(c=>c.status!=='interesse').length>=3},
  {id:'p9',emoji:'💡',name:'Mente Criativa',desc:'10 ideias no banco',check:()=>S.ideias.length>=10},
  {id:'p10',emoji:'🌻',name:'Meta Cumprida',desc:'Atingiu uma meta 100%',check:()=>S.metas.some(m=>m.current>=m.goal)},
  {id:'p11',emoji:'📰',name:'Publicada',desc:'Primeira publicação registrada',check:()=>S.pubs.length>=1},
  {id:'p12',emoji:'💬',name:'Colecionadora',desc:'10 frases marcantes salvas',check:()=>S.frases.length>=10},
  {id:'p13',emoji:'⏱️',name:'Hora Extra',desc:'Registrou 60h de leitura',check:()=>S.sessions.reduce((a,s)=>a+s.minutes,0)>=3600},
  {id:'p14',emoji:'🎭',name:'Multigenre',desc:'Leu 6 gêneros diferentes',check:()=>{const yr=rdYearN;return S.rdGenRd[yr]&&Object.values(S.rdGenRd[yr]).filter(Boolean).length>=6;}},
  {id:'p15',emoji:'✏️',name:'Prompt Fiel',desc:'Respondeu 10 prompts',check:()=>S.prompts.length>=10},
  {id:'p16',emoji:'🌙',name:'Noturna',desc:'Ativou o modo escuro',check:()=>S.theme==='dark'},
];
function checkAlbum(){
  let changed=false;
  const unlocked=DB.get('unlocked')||{};
  CONQUISTAS.forEach(c=>{if(!unlocked[c.id]&&c.check()){unlocked[c.id]=new Date().toISOString();changed=true;}});
  if(changed)DB.set('unlocked',unlocked);
}
function renderAlbum(){
  checkAlbum();
  const unlocked=DB.get('unlocked')||{};
  const uCount=Object.keys(unlocked).length;
  const countEl=document.getElementById('album-count');
  if(countEl)countEl.textContent=uCount+'/'+CONQUISTAS.length+' desbloqueadas';
  document.getElementById('album-grid').innerHTML=CONQUISTAS.map(c=>`
    <div class="fig ${unlocked[c.id]?'desbloqueada':'bloqueada'}">
      <div class="fe">${c.emoji}</div>
      <div class="fn">${c.name}</div>
      <div class="fl">${unlocked[c.id]?('\u2713 '+new Date(unlocked[c.id]).toLocaleDateString('pt-BR')):c.desc}</div>
    </div>`).join('');
}
