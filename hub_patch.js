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
        const maxMap = { 1: 5, 2: 10, 3: 15, 4: 20 };
        starsEl.innerHTML = `<svg viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>${p.estrelas}/${maxMap[p.mundo] || '?'}`;
      }
    });
  }

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
      });
    }
  }

  // Adiciona botão "Entrar em Sala" na navbar
  const navRight = document.querySelector('.navbar-right');
  if (navRight) {
    const btnSala = document.createElement('button');
    btnSala.textContent = '🔑 Entrar em Sala';
    btnSala.style.cssText = 'background:transparent;border:2px solid #38bdf8;border-radius:10px;color:#38bdf8;font-family:"Nunito",sans-serif;font-weight:800;font-size:.85rem;padding:7px 16px;cursor:pointer;transition:.2s';
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