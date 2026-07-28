/* MATRIVERSE · hub_patch.js — injeta dados reais no Hub de Mundos */

(async function () {
  // Redireciona se não logado
  const usuarioStr = sessionStorage.getItem('mv_usuario');
  if (!usuarioStr) { window.location.href = 'login.html'; return; }
  const usuario = JSON.parse(usuarioStr);

  // Preenche nome e estrelas na navbar
  const nomeEl = document.querySelector('.user-info span');
  if (nomeEl) nomeEl.textContent = `Olá, ${usuario.nome.split(' ')[0]}!`;

  // Carrega progresso
  const progresso = await API.getProgresso();
  const totalEstrelas = Array.isArray(progresso)
    ? progresso.reduce((s, p) => s + (p.estrelas || 0), 0) : 0;
  const scoreEl = document.querySelector('.score-value');
  if (scoreEl) scoreEl.textContent = totalEstrelas;

  // Atualiza estrelas nos cards
  if (Array.isArray(progresso)) {
    progresso.forEach(p => {
      const card = document.querySelector(`[data-world="${p.mundo}"]`);
      if (!card) return;
      const starsEl = card.querySelector('.card-stars');
      if (starsEl) {
        const maxMap = { 1: 5, 2: 10, 3: 10, 4: 10 };
        const max = Number(starsEl.dataset.max) || maxMap[p.mundo] || '?';
        starsEl.innerHTML = `<svg viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>${p.estrelas}/${max}`;
        starsEl.setAttribute('aria-label', `${p.estrelas} de ${max} estrelas`);
      }
    });
  }

  // Atualiza aria-label do badge de estrelas total (ficava travado em "120" fixo)
  const scoreBadge = document.querySelector('.score-badge');
  if (scoreBadge) scoreBadge.setAttribute('aria-label', `${totalEstrelas} estrelas acumuladas`);

  // ── DESBLOQUEIO DE MUNDOS ─────────────────────────────────
  // BUGFIX: antes, os 4 cards no index.html eram totalmente estáticos — os
  // rótulos "Concluído"/"Desbloqueado"/"Bloqueado" e os botões (onclick=
  // handleMundo(id) em TODOS eles) nunca liam o progresso real do aluno.
  // Resultado: dava pra pular direto pro Mundo 4 sem terminar os anteriores,
  // e terminar um mundo nunca "desbloqueava" o próximo — o Hub simplesmente
  // não refletia nem contabilizava a progressão de nível.
  // handleBloqueado()/a classe .btn-bloqueado (script.js / style.css) já
  // existiam prontos, só nunca tinham sido conectados a nada. Agora cada
  // card é atualizado de acordo com o progresso real vindo do backend.
  const PRE_REQUISITO = { 2: 1, 3: 2, 4: 3 }; // mundo → mundo que precisa estar concluído antes
  const NOME_MUNDO    = { 1: 'Fundação das Matrizes', 2: 'Operações Básicas', 3: 'Desafios Avançados', 4: 'Matriz Suprema' };

  const mapaProgresso = {};
  if (Array.isArray(progresso)) progresso.forEach(p => { mapaProgresso[p.mundo] = p; });
  const estaConcluido = mundo => !!(mapaProgresso[mundo] && mapaProgresso[mundo].concluido);

  [1, 2, 3, 4].forEach(mundo => {
    const card = document.querySelector(`[data-world="${mundo}"]`);
    if (!card) return;
    const btn = card.querySelector('.btn-world');
    if (!btn) return;

    const preReq       = PRE_REQUISITO[mundo];
    const desbloqueado = !preReq || estaConcluido(preReq);
    const concluido     = estaConcluido(mundo);

    btn.classList.remove('btn-concluido', 'btn-continuar', 'btn-bloqueado', 'btn-bloqueado--orange');
    card.style.opacity = '';
    card.style.filter  = '';

    let status;
    if (!desbloqueado) {
      status = 'Bloqueado';
      btn.classList.add('btn-bloqueado');
      if (card.classList.contains('world-card--orange')) btn.classList.add('btn-bloqueado--orange');
      btn.innerHTML = `<svg class="icon-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>Bloqueado`;
      btn.setAttribute('aria-label', `Mundo ${mundo} bloqueado`);
      // onclick = ... substitui totalmente o onclick="handleMundo(id)" do HTML
      btn.onclick = () => { if (typeof handleBloqueado === 'function') handleBloqueado(mundo); };
      card.style.opacity = '.55';
      card.style.filter  = 'grayscale(.6)';
    } else if (concluido) {
      status = 'Concluído';
      btn.classList.add('btn-concluido');
      btn.textContent = 'Jogar novamente';
      btn.setAttribute('aria-label', `Mundo ${mundo} concluído – jogar novamente`);
      btn.onclick = () => { if (typeof handleMundo === 'function') handleMundo(mundo); };
    } else {
      status = 'Em progresso';
      btn.classList.add('btn-continuar');
      btn.textContent = 'Iniciar';
      btn.setAttribute('aria-label', `Iniciar Mundo ${mundo}`);
      btn.onclick = () => { if (typeof handleMundo === 'function') handleMundo(mundo); };
    }

    card.setAttribute('aria-label', `Mundo ${mundo}: ${NOME_MUNDO[mundo] || ''} – ${status}`);
  });

  // Mostra atalho para o Ranking da Sala (se o aluno já estiver em alguma sala)
  try {
    const matriculas = await API.minhasMatriculas();
    if (Array.isArray(matriculas) && matriculas.length) {
      const container = document.querySelector('.container') || document.querySelector('main') || document.body;
      const banner = document.createElement('a');
      banner.href = 'ranking.html';
      banner.style.cssText = 'display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,rgba(139,92,246,.18),rgba(14,165,233,.18));border:1px solid rgba(167,139,250,.4);border-radius:14px;padding:14px 18px;margin:0 0 20px;color:#fff;text-decoration:none;font-family:"Nunito",sans-serif;font-weight:700';
      banner.innerHTML = `🏆 <span>Você está na sala <b>${matriculas[0].nome}</b> (Prof. ${matriculas[0].docente_nome}). Toque para ver o ranking da turma!</span>`;
      container.insertBefore(banner, container.firstChild);
    }
  } catch { /* silencia — recurso opcional */ }

  // Modal: entrar em sala
  function mostrarModalSala() {
    let modal = document.getElementById('modalSala');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modalSala';
      modal.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px';
      modal.innerHTML = `
        <div style="background:linear-gradient(160deg,rgba(22,19,69,.97),rgba(10,8,48,.97));border:1px solid rgba(167,139,250,.4);border-radius:22px;padding:36px;max-width:380px;width:100%;box-shadow:0 0 40px rgba(167,139,250,.4)">
          <h2 style="font-family:'Orbitron',sans-serif;font-size:1.3rem;margin-bottom:8px">🔑 Entrar em uma Sala</h2>
          <p style="color:#9aa3d4;font-size:.9rem;margin-bottom:20px">Digite o código que seu professor forneceu.</p>
          <div id="erroSalaModal" style="display:none;background:rgba(244,63,94,.15);border:1px solid #f43f5e;border-radius:8px;padding:8px 12px;color:#f43f5e;font-weight:700;font-size:.85rem;margin-bottom:12px"></div>
          <input id="inputCodigo" type="text" maxlength="6" placeholder="Ex: AB12CD" style="width:100%;padding:12px 14px;background:rgba(5,3,26,.6);border:1px solid rgba(167,139,250,.3);border-radius:10px;color:#fff;font-family:'Orbitron',sans-serif;font-size:1.2rem;letter-spacing:4px;text-align:center;text-transform:uppercase;margin-bottom:14px;box-sizing:border-box"/>
          <button id="btnEntrarSala" style="display:block;width:100%;padding:13px;background:linear-gradient(135deg,#8b5cf6,#0ea5e9);color:#fff;border:none;border-radius:10px;font-family:'Orbitron',sans-serif;font-weight:700;font-size:.95rem;letter-spacing:2px;cursor:pointer;margin-bottom:10px">Entrar</button>
          <button onclick="document.getElementById('modalSala').remove()" style="display:block;width:100%;padding:11px;background:transparent;border:2px solid rgba(167,139,250,.4);border-radius:10px;color:#9aa3d4;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer">Cancelar</button>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById('inputCodigo').addEventListener('input', e => {
        e.target.value = e.target.value.toUpperCase();
      });
      document.getElementById('btnEntrarSala').addEventListener('click', async () => {
        const codigo = document.getElementById('inputCodigo').value.trim();
        const err    = document.getElementById('erroSalaModal');
        err.style.display = 'none';
        if (codigo.length < 4) { err.textContent='Código inválido.'; err.style.display='block'; return; }
        const res = await API.entrarSala(codigo);
        if (res.erro) { err.textContent=res.erro; err.style.display='block'; return; }
        modal.remove();
        alert(`✅ Você entrou na sala: ${res.sala.nome}`);
        window.location.reload();
      });
    }
  }

  // Adiciona botão "Entrar em Sala" na navbar
  const navRight = document.querySelector('.navbar-right');
  if (navRight) {
    const btnSala = document.createElement('button');
    btnSala.textContent = window.innerWidth <= 360 ? '🔑' : (window.innerWidth <= 400 ? '🔑 Sala' : '🔑 Entrar em Sala');
    btnSala.className = 'btn-entrar-sala';
    btnSala.style.cssText = 'background:transparent;border:2px solid #38bdf8;border-radius:10px;color:#38bdf8;font-family:"Nunito",sans-serif;font-weight:800;font-size:.85rem;padding:7px 16px;cursor:pointer;transition:.2s;white-space:nowrap;flex-shrink:0';
    btnSala.onmouseenter = () => { btnSala.style.background='#38bdf8'; btnSala.style.color='#fff'; };
    btnSala.onmouseleave = () => { btnSala.style.background='transparent'; btnSala.style.color='#38bdf8'; };
    btnSala.onclick = mostrarModalSala;
    navRight.insertBefore(btnSala, navRight.querySelector('.btn-sair'));
  }

  // Sair
  const btnSair = document.querySelector('.btn-sair');
  if (btnSair) {
    btnSair.addEventListener('click', async () => {
      await API.logout();
      sessionStorage.removeItem('mv_usuario');
      window.location.href = 'landing.html';
    });
  }
})();
