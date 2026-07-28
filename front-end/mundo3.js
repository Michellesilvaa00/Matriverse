/* ═══════════════════════════════════════════════════════════
   MATRIVERSE · MUNDO 3 · mundo3.js
   Correções aplicadas:
   ✔ Campo de resposta correta: usa "correta" (padrão do backend)
   ✔ Timer exibido em formato M:SS (ex: 4:59)
   ✔ Apenas 4 alternativas renderizadas (A/B/C/D)
   ✔ Fallback local: campo "correta" padronizado
   ✔ Progresso salvo ao finalizar via API
   ✔ Validação offline correta quando sem backend
═══════════════════════════════════════════════════════════ */

const META   = 5;               // perguntas para concluir
const MUNDO  = 3;               // ID do mundo
const RING   = 2 * Math.PI * 24; // circunferência do timer SVG
const MINUTOS = 5;
const TEMPO   = MINUTOS * 60;   // 300 segundos por sessão
const ESTRELAS_POR_QUESTAO = 2; // 2 estrelas por acerto → máx 10

let perguntasRespondidas = 0;
let estrelas = 0;
let fila     = [];
let atual    = null;
let timer    = null;
let tempo    = TEMPO;
let bloq     = false;
let questoes = [];

/* ── Atalhos de DOM ── */
const $ = id => document.getElementById(id);
const elCard  = $('questionCard');
const elText  = $('questionText');
const elAlts  = $('alternatives');
const elIdx   = $('qIndex');
const elStars = $('starCount');
const elProg  = $('progressFill');
const elTxt   = $('timerText');
const elRing  = $('ringFg');
const elWrap  = document.querySelector('.timer-wrap');
const elCerto  = $('feedbackCorrect');
const elErrado = $('feedbackWrong');
const elFinal  = $('finalScreen');

/* ── Embaralha array ── */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ════════════════════════════════════════════════════════
   QUESTÕES FALLBACK (offline) — campo "correta" correto
   Verificadas matematicamente:
   301: A×B = [[4,10],[10,20]]   → índice 0 ✔
   302: A×B linha 1 = [11,20,7] → índice 0 ✔
   303: 2×3 × 3×3 = 2×3         → índice 2 ✔
   304: C₂₃ = (-1)(2)+(3)(1)+(1)(3) = -2+3+3 = 4 → índice 2 ✔
   305: 2A+3B-C = [[4,2],[0,10]] → índice 0 ✔
════════════════════════════════════════════════════════ */
const QUESTOES_FALLBACK = [
  {
    id: 301,
    enunciado: `Qual o resultado da multiplicação das matrizes?\n\nA = [ 1  2 ]\n    [ 3  4 ]\n\nB = [ 2  0 ]\n    [ 1  5 ]`,
    alternativas: [
      "[ 4  10 ] / [ 10  20 ]",
      "[ 4   8 ] / [ 10  20 ]",
      "[ 5  10 ] / [ 10  20 ]",
      "[ 4  10 ] / [  8  20 ]"
    ],
    correta: 0  // ← campo correto para validação offline
  },
  {
    id: 302,
    enunciado: `Multiplique as matrizes:\n\nA = [ 2  1  3 ]\n    [ 0  4  2 ]\n    [ 1  5  1 ]\n\nB = [ 1  2  0 ]\n    [ 3  1  4 ]\n    [ 2  5  1 ]`,
    alternativas: [
      "[ 11  20  7 ] / [ 16  14  18 ] / [ 18  12  21 ]",
      "[ 10  20  7 ] / [ 16  14  18 ] / [ 18  12  21 ]",
      "[ 11  18  7 ] / [ 16  14  18 ] / [ 18  12  21 ]",
      "[ 11  20  9 ] / [ 16  14  18 ] / [ 18  12  21 ]"
    ],
    correta: 0
  },
  {
    id: 303,
    enunciado: `Se A tem dimensão 2×3 e B tem dimensão 3×3,\nqual será a dimensão da matriz resultado A × B?`,
    alternativas: [
      "3×2",
      "2×2",
      "2×3",
      "3×3"
    ],
    correta: 2  // 2×3 × 3×3 = 2×3
  },
  {
    id: 304,
    enunciado: `Calcule o elemento C₂,₃ da multiplicação C = A × B:\n\nA = [  1   0   2 ]\n    [ -1   3   1 ]\n    [  2   1   0 ]\n\nB = [ 3  1  2 ]\n    [ 2  0  1 ]\n    [ 1  4  3 ]`,
    alternativas: [
      "2",
      "3",
      "4",
      "5"
    ],
    correta: 2  // C₂₃ = (-1)(2) + (3)(1) + (1)(3) = -2+3+3 = 4
  },
  {
    id: 305,
    enunciado: `Calcule 2A + 3B − C:\n\nA = [ 1  2 ]    B = [ 2  1 ]    C = [ 4  5 ]\n    [ 3  4 ]        [ 0  3 ]        [ 6  7 ]`,
    alternativas: [
      "[ 4   2 ] / [ 0  10 ]",
      "[ 4   0 ] / [ 0  10 ]",
      "[ 2   2 ] / [ 0  10 ]",
      "[ 4   2 ] / [ 2  10 ]"
    ],
    correta: 0  // 2[1,2;3,4]+3[2,1;0,3]-[4,5;6,7] = [2+6-4, 4+3-5; 6+0-6, 8+9-7] = [4,2;0,10]
  }
];

/* ════════════════════════════════════════════════════════
   INICIALIZAÇÃO
════════════════════════════════════════════════════════ */
async function init() {
  // Reset de estado
  estrelas = 0;
  perguntasRespondidas = 0;
  tempo = TEMPO;

  // Atualiza meta na interface
  $('qTotal').textContent  = META;
  $('metaStars').textContent = META * ESTRELAS_POR_QUESTAO;

  // Tenta buscar questões do backend
  try {
    const d = await API.questoes(MUNDO);
    if (Array.isArray(d) && d.length >= META) {
      questoes = d;
    } else {
      throw new Error('Sem questões suficientes');
    }
  } catch {
    // Backend indisponível → usa fallback local
    console.warn('[Mundo 3] Backend indisponível — usando questões locais.');
    questoes = QUESTOES_FALLBACK;
  }

  // Embaralha e prepara fila
  fila = shuffle([...questoes]);

  // Esconde telas de feedback/final, mostra card
  elFinal.classList.add('hidden');
  elCerto.classList.add('hidden');
  elErrado.classList.add('hidden');
  elCard.classList.remove('hidden');

  atualizarUI();
  proxima();
}

/* ════════════════════════════════════════════════════════
   PRÓXIMA QUESTÃO
════════════════════════════════════════════════════════ */
function proxima() {
  bloq = false;

  // Reabastece fila se acabou
  if (!fila.length) fila = shuffle([...questoes]);

  atual = fila.shift();

  // Atualiza interface do card
  elCard.classList.remove('hidden');
  elCerto.classList.add('hidden');
  elErrado.classList.add('hidden');

  elIdx.textContent  = perguntasRespondidas + 1;
  elText.textContent = atual.enunciado;

  // Renderiza exatamente 4 alternativas (A, B, C, D)
  elAlts.innerHTML = '';
  ['A', 'B', 'C', 'D'].forEach((letra, i) => {
    // Garante que a alternativa existe (evita undefined)
    const textoAlt = atual.alternativas[i] ?? '—';

    const btn = document.createElement('button');
    btn.className = 'alt-btn';
    btn.innerHTML = `<span class="alt-letter">${letra}</span><span>${textoAlt}</span>`;
    btn.addEventListener('click', () => responder(i, btn));
    elAlts.appendChild(btn);
  });

  // Reinicia timer da sessão
  startTimer();
}

/* ════════════════════════════════════════════════════════
   TIMER — formato M:SS
════════════════════════════════════════════════════════ */
function startTimer() {
  stopTimer();
  tempo = TEMPO;
  elWrap.classList.remove('warning');
  tick();

  timer = setInterval(() => {
    tempo--;
    tick();
    if (tempo <= 10) elWrap.classList.add('warning');
    if (tempo <= 0)  { stopTimer(); timeout(); }
  }, 1000);
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null; }
}

/* Formata segundos → M:SS e atualiza SVG ring */
function tick() {
  const min  = Math.floor(tempo / 60);
  const secs = String(tempo % 60).padStart(2, '0');
  elTxt.textContent = `${min}:${secs}`;

  // Arco do ring proporcional ao tempo restante
  elRing.style.strokeDashoffset = RING * (1 - tempo / TEMPO);
}

/* ════════════════════════════════════════════════════════
   RESPONDER — valida via API ou fallback local
════════════════════════════════════════════════════════ */
async function responder(idx, btn) {
  if (bloq) return;
  bloq = true;
  stopTimer();

  // Desabilita todos os botões imediatamente
  document.querySelectorAll('.alt-btn').forEach(b => b.disabled = true);

  let certo    = false;
  let idxCerto = null;

  try {
    /* ── Tenta validar no backend ── */
    const r = await API.responder(MUNDO, atual.id, idx);

    if (r && typeof r.correta !== 'undefined') {
      certo    = r.correta;           // boolean
      idxCerto = r.resposta_certa;   // índice correto (inteiro)
    } else {
      // Backend retornou algo inesperado → validação local
      throw new Error('Resposta inválida do backend');
    }
  } catch {
    /* ── Fallback: valida localmente com campo "correta" ──
       BUGFIX: o "?? 0" fazia a validação offline assumir a alternativa A
       como certa sempre que o gabarito local não existisse (por exemplo,
       questão vinda do backend, que não inclui o campo "correta" por
       segurança). Isso podia aceitar/recusar respostas de forma
       imprevisível. Agora, sem gabarito confiável, a resposta é tratada
       como errada (nunca aceita indevidamente). */
    const respostaCorreta = atual.correta ?? atual.correct;
    if (typeof respostaCorreta !== 'undefined') {
      certo    = (idx === respostaCorreta);
      idxCerto = respostaCorreta;
    } else {
      certo    = false;
      idxCerto = null;
    }
  }

  // Marca visualmente: verde = certo, vermelho = errado
  const botoes = document.querySelectorAll('.alt-btn');
  if (idxCerto !== null && botoes[idxCerto]) {
    botoes[idxCerto].classList.add('correct');
  }
  if (!certo && botoes[idx]) {
    botoes[idx].classList.add('wrong');
  }

  // Aguarda 700ms para o jogador ver o feedback visual
  setTimeout(() => { certo ? acerto() : erro(); }, 700);
}

/* ════════════════════════════════════════════════════════
   ACERTO
════════════════════════════════════════════════════════ */
function acerto() {
  estrelas += ESTRELAS_POR_QUESTAO;
  perguntasRespondidas++;
  atualizarUI();

  elCard.classList.add('hidden');
  elCerto.classList.remove('hidden');
}

/* ════════════════════════════════════════════════════════
   ERRO / TIMEOUT
════════════════════════════════════════════════════════ */
function erro(motivo = '') {
  const eTempo = (motivo === 'tempo');
  elCard.classList.add('hidden');
  $('wrongTitle').textContent = eTempo ? 'Tempo esgotado!' : 'Resposta incorreta!';
  $('wrongSub').textContent   = eTempo ? 'Pergunta trocada.' : 'Tente novamente.';
  elErrado.classList.remove('hidden');

  // Avança automaticamente após 1.8s
  setTimeout(() => {
    elErrado.classList.add('hidden');
    proxima();
  }, 1800);
}

function timeout() {
  if (bloq) return;
  bloq = true;
  document.querySelectorAll('.alt-btn').forEach(b => b.disabled = true);
  setTimeout(() => erro('tempo'), 600);
}

/* ════════════════════════════════════════════════════════
   ATUALIZA BARRA DE PROGRESSO E ESTRELAS
════════════════════════════════════════════════════════ */
function atualizarUI() {
  elStars.textContent = estrelas;
  // Progresso baseado em perguntas respondidas / meta
  elProg.style.width = (perguntasRespondidas / META * 100) + '%';
}

/* ════════════════════════════════════════════════════════
   FINALIZAR — salva progresso no backend
════════════════════════════════════════════════════════ */
async function finalizar() {
  stopTimer();
  elCard.classList.add('hidden');
  elCerto.classList.add('hidden');
  elErrado.classList.add('hidden');
  elFinal.classList.remove('hidden');

  // Salva no backend (silencia erros de conectividade)
  try {
    await API.salvarProgresso(MUNDO, estrelas, estrelas >= META * ESTRELAS_POR_QUESTAO);
    console.log(`[Mundo 3] Progresso salvo: ${estrelas} estrelas`);
  } catch (e) {
    console.warn('[Mundo 3] Não foi possível salvar o progresso:', e);
  }

  // Também salva no localStorage como backup (compatível com hub_patch.js)
  try {
    const saved = JSON.parse(localStorage.getItem('mv_progresso') || '{}');
    saved[MUNDO] = { estrelas, concluido: estrelas >= META * ESTRELAS_POR_QUESTAO };
    localStorage.setItem('mv_progresso', JSON.stringify(saved));
  } catch { /* ignora */ }
}

/* ════════════════════════════════════════════════════════
   EVENTOS DOS BOTÕES
════════════════════════════════════════════════════════ */
$('nextBtn').addEventListener('click', () => {
  if (perguntasRespondidas >= META) {
    finalizar();
  } else {
    proxima();
  }
});

$('restartBtn').addEventListener('click', init);

/* ── Inicia o jogo ── */
init();
