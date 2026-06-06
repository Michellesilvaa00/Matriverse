/* MATRIVERSE · MUNDO 2 · mundo2.js com API */
const TEMPO=20, META=10, MUNDO=2, RING=2*Math.PI*24;
let estrelas=0, fila=[], atual=null, timer=null, tempo=TEMPO, bloq=false, questoes=[];

const $=id=>document.getElementById(id);
const elCard=$('questionCard'),elText=$('questionText'),elAlts=$('alternatives'),elIdx=$('qIndex');
const elStars=$('starCount'),elProg=$('progressFill'),elTxt=$('timerText'),elRing=$('ringFg');
const elWrap=document.querySelector('.timer-wrap');
const elCerto=$('feedbackCorrect'),elErrado=$('feedbackWrong'),elFinal=$('finalScreen');

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

async function init(){
  estrelas=0;
  try{
    const d=await API.questoes(MUNDO);
    if(Array.isArray(d)&&d.length) questoes=d;
    else throw 0;
  }catch{
    questoes=[
      {id:201,enunciado:"Qual é a ordem de uma matriz com 3 linhas e 4 colunas?",alternativas:["4x3","3x4","3x3","4x4"]},
      {id:202,enunciado:"Uma matriz QUADRADA tem:",alternativas:["Linhas > colunas","Só uma linha","Linhas = colunas","Todos zeros"]},
      {id:203,enunciado:"A = [[1,2],[3,4]], B = [[5,6],[7,8]]. A+B =",alternativas:["[[6,8],[10,12]]","[[5,12],[21,32]]","[[4,4],[4,4]]","[[6,7],[9,10]]"]},
      {id:204,enunciado:"Diagonal principal de I₃:",alternativas:["Zeros","Uns","Aleatórios","1,2,3"]},
      {id:205,enunciado:"A=[[7,2,9],[4,5,6],[1,8,3]], a₂₃=",alternativas:["9","6","8","5"]},
      {id:206,enunciado:"Diagonal de [[2,0,0],[0,5,0],[0,0,9]]:",alternativas:["0,0,0","2,5,9","2,0,9","5,0,0"]},
      {id:207,enunciado:"Transposta de A=[[1,2,3],[4,5,6]]:",alternativas:["[[1,2,3],[4,5,6]]","[[6,5,4],[3,2,1]]","[[1,4],[2,5],[3,6]]","[[3,2,1],[6,5,4]]"]},
      {id:208,enunciado:"A=[[1,2],[3,4]] × escalar 2:",alternativas:["[[1,2],[3,4]]","[[2,4],[6,8]]","[[3,4],[5,6]]","[[2,2],[4,4]]"]},
      {id:209,enunciado:"Quantos elementos tem uma matriz 4×5?",alternativas:["9","16","20","25"]},
      {id:210,enunciado:"aᵢⱼ = i+j → a₃₂ =",alternativas:["5","6","1","9"]},
      {id:211,enunciado:"A=[[2,1],[0,3]], B=[[1,4],[2,1]], A-B=",alternativas:["[[1,-3],[-2,2]]","[[3,5],[2,4]]","[[1,3],[2,2]]","[[-1,3],[2,-2]]"]},
      {id:212,enunciado:"Uma matriz LINHA possui:",alternativas:["Só uma coluna","Só uma linha","Linhas = colunas","Nenhum elemento"]},
    ];
  }
  fila=shuffle([...questoes]);
  atualizarUI();
  elFinal.classList.add('hidden'); elCerto.classList.add('hidden'); elErrado.classList.add('hidden');
  elCard.classList.remove('hidden');
  proxima();
}

function proxima(){
  bloq=false;
  if(!fila.length) fila=shuffle([...questoes]);
  atual=fila.shift();
  elCard.classList.remove('hidden'); elCerto.classList.add('hidden'); elErrado.classList.add('hidden');
  elIdx.textContent=estrelas+1; elText.textContent=atual.enunciado;
  elAlts.innerHTML='';
  ['A','B','C','D'].forEach((l,i)=>{
    const b=document.createElement('button'); b.className='alt-btn';
    b.innerHTML=`<span class="alt-letter">${l}</span><span>${atual.alternativas[i]}</span>`;
    b.addEventListener('click',()=>responder(i,b));
    elAlts.appendChild(b);
  });
  startTimer();
}

function startTimer(){
  stopTimer(); tempo=TEMPO; elWrap.classList.remove('warning'); tick();
  timer=setInterval(()=>{ tempo--; tick();
    if(tempo<=5) elWrap.classList.add('warning');
    if(tempo<=0){ stopTimer(); timeout(); }
  },1000);
}
function stopTimer(){ if(timer){clearInterval(timer);timer=null;} }
function tick(){ elTxt.textContent=tempo; elRing.style.strokeDashoffset=RING*(1-tempo/TEMPO); }

async function responder(idx, btn){
  if(bloq) return; bloq=true; stopTimer();
  document.querySelectorAll('.alt-btn').forEach(b=>b.disabled=true);
  let certo=false, idxCerto=null;
  try{
    const r=await API.responder(MUNDO, atual.id, idx);
    if(r&&typeof r.correta!=='undefined'){ certo=r.correta; idxCerto=r.resposta_certa; }
    else{ certo=true; idxCerto=idx; }
  }catch{ certo=true; idxCerto=idx; }
  if(idxCerto!==null) document.querySelectorAll('.alt-btn')[idxCerto]?.classList.add('correct');
  if(!certo) btn.classList.add('wrong');
  setTimeout(()=>{ certo ? acerto() : erro(); }, 700);
}

function acerto(){ estrelas++; atualizarUI(); elCard.classList.add('hidden'); elCerto.classList.remove('hidden'); }
function erro(m=''){ elCard.classList.add('hidden'); $('wrongTitle').textContent=m==='tempo'?'Tempo esgotado!':'Resposta incorreta!'; $('wrongSub').textContent=m==='tempo'?'Pergunta trocada.':'Tente novamente.'; elErrado.classList.remove('hidden'); setTimeout(()=>{ elErrado.classList.add('hidden'); proxima(); },1800); }
function timeout(){ if(bloq)return; bloq=true; document.querySelectorAll('.alt-btn').forEach(b=>b.disabled=true); setTimeout(()=>erro('tempo'),600); }

function atualizarUI(){ elStars.textContent=estrelas; elProg.style.width=(estrelas/META*100)+'%'; }

async function finalizar(){
  stopTimer(); elCard.classList.add('hidden'); elCerto.classList.add('hidden'); elErrado.classList.add('hidden'); elFinal.classList.remove('hidden');
  try{ await API.salvarProgresso(MUNDO, estrelas, estrelas>=META); }catch{}
}

$('nextBtn').addEventListener('click',()=>{ if(estrelas>=META) finalizar(); else proxima(); });
$('restartBtn').addEventListener('click', init);
init();
