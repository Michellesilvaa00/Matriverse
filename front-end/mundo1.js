/* MATRIVERSE · MUNDO 1 · mundo1.js com API
   BUGFIX: o Mundo 1 antes rodava 100% no navegador (sem api.js, sem
   API.responder/API.salvarProgresso). O aluno concluía o mundo, mas o
   backend nunca ficava sabendo — então o progresso nunca era salvo,
   o Mundo 2 nunca desbloqueava (hub_patch.js lê o progresso real do
   backend) e as estrelas do Mundo 1 nunca entravam no total do ranking
   nem no painel do professor. Agora o Mundo 1 segue o mesmo padrão dos
   Mundos 2, 3 e 4: busca as questões da API (com fallback local caso o
   servidor esteja indisponível), valida cada resposta em /api/responder
   e salva o resultado final em /api/progresso. */

const MUNDO = 1, TOTAL = 5;
let current = 0, stars = 0, questoes = [], shuffled = [];

const $ = id => document.getElementById(id);
const elQuiz   = $('quizView'),   elFinish = $('finishView');
const elQNum   = $('qNum'),       elStar   = $('starDisplay');
const elQText  = $('questionText'), elOpts = $('optionsContainer');

// Fallback local, usado só se a API estiver fora do ar
const FALLBACK = [
  { id: 101, enunciado: "O que é uma matriz?", alternativas: ["Uma operação matemática", "Uma tabela organizada em linhas e colunas", "Um gráfico cartesiano", "Um cálculo de divisão"] },
  { id: 102, enunciado: "As linhas de uma matriz são organizadas:", alternativas: ["Horizontalmente", "Verticalmente", "Diagonalmente", "Circularmente"] },
  { id: 103, enunciado: "O elemento A(2,3) representa:", alternativas: ["Linha 2 e coluna 3", "Linha 3 e coluna 2", "Coluna 2 e linha 1", "A diagonal da matriz"] },
  { id: 104, enunciado: "Uma matriz quadrada possui:", alternativas: ["Mais linhas que colunas", "Mais colunas que linhas", "Mesmo número de linhas e colunas", "Apenas uma linha"] },
  { id: 105, enunciado: "Dada a matriz:\n[ 2  3 ]\n[ 1  4 ]\nQual é o resultado da soma dos elementos da primeira linha?", alternativas: ["5", "6", "7", "8"] },
];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function init() {
  current = 0; stars = 0;
  try {
    const d = await API.questoes(MUNDO);
    questoes = (Array.isArray(d) && d.length) ? d : FALLBACK;
  } catch {
    questoes = FALLBACK;
  }
  shuffled = shuffle([...questoes]);
  elQuiz.style.display = '';
  elFinish.style.display = 'none';
  loadQuestion();
}

function loadQuestion() {
  if (current >= TOTAL) { finalizar(); return; }
  const q = shuffled[current];
  elQNum.textContent = current + 1;
  elStar.textContent = stars;
  elQText.textContent = q.enunciado;
  elOpts.innerHTML = '';
  q.alternativas.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(idx, q);
    elOpts.appendChild(btn);
  });
}

async function handleAnswer(selected, q) {
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
  let certo;
  try {
    const r = await API.responder(MUNDO, q.id, selected);
    certo = (r && typeof r.correta !== 'undefined') ? r.correta : true;
  } catch {
    certo = true; // sem conexão: não trava o aluno, apenas não persiste
  }
  if (certo) {
    stars++;
    current++;
    loadQuestion();
  } else {
    // Embaralha e tenta de novo (mesma mecânica original)
    shuffled = shuffle([...questoes]);
    current = 0;
    loadQuestion();
  }
}

async function finalizar() {
  elQuiz.style.display = 'none';
  elFinish.style.display = 'flex';
  $('finishTitle').textContent = `Você conquistou ${stars}/${TOTAL} estrelas!`;
  $('finishMsg').textContent =
    stars === TOTAL ? 'Perfeito! Você dominou a Fundação das Matrizes!' :
                       'Continue tentando, você chega lá!';
  // BUGFIX principal: salva o progresso no backend para desbloquear o
  // Mundo 2 e contabilizar as estrelas no ranking / painel do professor.
  try { await API.salvarProgresso(MUNDO, stars, stars >= TOTAL); } catch {}
}

init();
