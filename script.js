/**
 * script.js  –  MatriVerse: Hub de Mundos
 */

/* ESTRELAS DECORATIVAS */
(function criarEstrelas() {
  const container = document.getElementById('starsBg');
  if (!container) return;
  const TOTAL = 40;
  for (let i = 0; i < TOTAL; i++) {
    const dot = document.createElement('span');
    dot.className = 'star-dot';
    const size = Math.random() * 2 + 1.5;
    dot.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      top:    ${Math.random() * 100}%;
      left:   ${Math.random() * 100}%;
      animation-delay: ${(Math.random() * 3).toFixed(2)}s;
      animation-duration: ${(Math.random() * 2 + 2).toFixed(2)}s;
    `;
    container.appendChild(dot);
  }
})();

/* ROTAS */
const ROTAS_MUNDO = {
  1: 'mundo1.html',
  2: 'mundo2.html',
  3: 'mundo3.html',
  4: 'mundo4.html',
};

function handleMundo(id) {
  const rota = ROTAS_MUNDO[id];
  if (!rota) { console.warn(`Rota não definida para o Mundo ${id}.`); return; }
  window.location.href = rota;
}

/* MUNDOS BLOQUEADOS */
const MENSAGENS_BLOQUEIO = {
  3: 'Conclua o Mundo 2 (Operações Básicas) para desbloquear este mundo!',
  4: 'Conclua o Mundo 3 (Desafios Avançados) para desbloquear este mundo!',
};

function handleBloqueado(id) {
  const overlay = document.getElementById('modalOverlay');
  const msgEl   = document.getElementById('modalMsg');
  if (!overlay || !msgEl) return;
  msgEl.textContent = MENSAGENS_BLOQUEIO[id] || 'Complete o mundo anterior para desbloquear este!';
  overlay.removeAttribute('hidden');
  const btn = overlay.querySelector('.modal-btn');
  if (btn) btn.focus();
}

function fecharModal() {
  const overlay = document.getElementById('modalOverlay');
  if (!overlay) return;
  overlay.setAttribute('hidden', '');
}

document.addEventListener('click', function (e) {
  const overlay = document.getElementById('modalOverlay');
  if (!overlay || overlay.hasAttribute('hidden')) return;
  if (e.target === overlay) fecharModal();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') fecharModal();
});

/* SAIR */
function handleSair() {
  const confirmar = window.confirm('Deseja realmente sair da sua conta?');
  if (!confirmar) return;
  window.location.href = 'login.html';
}

/* NAVBAR ATIVA */
(function marcarNavAtiva() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navItems    = document.querySelectorAll('.bottom-nav__item');
  navItems.forEach(function (item) {
    const href = item.getAttribute('href') || '';
    const page = href.split('/').pop();
    item.classList.remove('bottom-nav__item--active');
    item.removeAttribute('aria-current');
    if (page === currentPage) {
      item.classList.add('bottom-nav__item--active');
      item.setAttribute('aria-current', 'page');
    }
  });
})();



/* =====================================================
   MATRIVERSE · script.js
   - Partículas espaciais animadas
   - Menu mobile
   - Modal de login
   - Scroll suave com offset para navbar sticky
   - Scroll spy (destaque ativo) via IntersectionObserver
   ===================================================== */

// ============ PARTÍCULAS ESPACIAIS ============
// Cria partículas que sobem na tela para dar sensação espacial
function criarParticulas() {
  const container = document.getElementById('particles');
  if (!container) return;
  const total = 30;
  const cores = ['#a78bfa', '#38bdf8', '#ec4899', '#ffffff'];

  for (let i = 0; i < total; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    const cor = cores[Math.floor(Math.random() * cores.length)];
    p.style.left = Math.random() * 100 + '%';
    p.style.background = cor;
    p.style.boxShadow = `0 0 8px ${cor}`;
    p.style.animationDuration = (8 + Math.random() * 12) + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
    container.appendChild(p);
  }
}

// ============ MENU MOBILE ============
function toggleMenu() {
  document.querySelector('.nav-links')?.classList.toggle('open');
}

// ============ MODAL LOGIN ============
function openLogin() {
  document.getElementById('loginModal')?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeLogin() {
  document.getElementById('loginModal')?.classList.add('hidden');
  document.body.style.overflow = '';
}
function closeLoginBg(e) {
  if (e.target.id === 'loginModal') closeLogin();
}

// Submissão do formulário (demo)
function handleLogin(e) {
  e.preventDefault();
  const perfil = document.querySelector('input[name="profile"]:checked')?.value;
  alert(`🚀 Bem-vindo ao MATRIVERSE!\nPerfil: ${perfil === 'aluno' ? 'Estudante' : 'Docente'}`);
  closeLogin();
  if (perfil === 'aluno') {
    window.location.href = 'mundo2/index.html';
  }
}

// ============ SCROLL SUAVE COM OFFSET ============
// Altura da navbar para não cobrir o título da seção
const NAVBAR_HEIGHT = 78;

function initSmoothScroll() {
  const links = document.querySelectorAll('.nav-link[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;

      // Fecha menu mobile se estiver aberto
      document.querySelector('.nav-links')?.classList.remove('open');

      const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ============ SCROLL SPY (DESTAQUE ATIVO) ============
// Usa IntersectionObserver para detectar qual seção está visível
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');
  let currentActive = 'hero';

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          currentActive = entry.target.id;
        }
      });

      links.forEach(link => {
        const href = link.getAttribute('href');
        const isActive = href === '#' + currentActive;
        link.classList.toggle('active', isActive);
      });
    },
    {
      rootMargin: `-${NAVBAR_HEIGHT + 20}px 0px -60% 0px`,
      threshold: 0
    }
  );

  sections.forEach(sec => observer.observe(sec));
}

// ============ INIT ============
window.addEventListener('DOMContentLoaded', () => {
  criarParticulas();
  initSmoothScroll();
  initScrollSpy();
});

// ESC fecha modal
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLogin();
});

// Expor funções globais (usadas por onclick no HTML)
window.openLogin = openLogin;
window.closeLogin = closeLogin;
window.closeLoginBg = closeLoginBg;
window.toggleMenu = toggleMenu;
window.handleLogin = handleLogin;
