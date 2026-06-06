/* MATRIVERSE · MUNDO 2 · mundo2.js com API */
const TEMPO=60, META=10, MUNDO=4, RING=2*Math.PI*24;
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
      {id:301,enunciado: "Qual é a solução do sistema?\n\nʃx + y = 7\nʅx - y = 1",alternativas:["3,4","4,3","5,2","2,5"]},

      {id:302,enunciado:"Resolva o sistema: \n\nʃ2x + y = 8\nʅx + y = 5",alternativas:["3,2","2,3","4,1","1,4"]},

      {id:303,enunciado:"A solução do sistema abaixo é:\n\nʃ3x + 2y = 12\nʅx + y = 5",alternativas:["2,3","3,2","4,1","1,4"]},

      {id:304,enunciado:"Determine a solução:\n\nʃ2x - y = 1\nʅx + y = 8",alternativas:["3,5","2,6","4,4","1,7"]},

      {id:305,enunciado:"O sistema abaixo possui solução?:\n\nʃx + 2y = 10\nʅ2x + 4y = 20",alternativas:["Única solução","Duas soluções","Infinitas soluções","Nenhuma solução"]},

      {id:306,enunciado:"Resolva o sistema:\n\nʃ4x + y = 13\nʅ2x - y = 5",alternativas:["2,5","3,1","4,-3","1,9"]},

      {id:307,enunciado:"Qual alternativa representa a solução?:\n\nʃx - 2y = -4\nʅx + y = 5",alternativas:["2,3","3,2","1,4","4,1"]},

      {id:308,enunciado:"O sistema abaixo é:\n\nʃx + y = 4\nʅx + y = 7",alternativas:["Possível e determinado","Possível e indeterminado","Impossível","Homogêneo"]},

      {id:309,enunciado:"Resolva o sistema abaixo:\n\nʃ5x - y = 11\nʅx + y = 7",alternativas:["3,4","2,5","4,3","1,6"]},

      {id:310,enunciado:"Em uma papelaria, 2 cadernos e 3 canetas custam R$21. Já 1 caderno e 2 canetas custam R$13. O preço de um caderno e uma caneta, respectivamente é:",alternativas:["R$ 5 e R$ 4","R$ 3 e R$ 5","R$ 6 e R$ 3,50","R$ 4 e R$ 4,50"]},

      {id:311,enunciado:"Sobre sistemas lineares, selecione a alternativa correta:",alternativas:["Um sistema linear pode possuir apenas uma solução ou nenhuma solução","Um sistema linear nunca pode ter infinitas soluções","Um sistema linear pode possuir uma única solução, infinitas soluções ou nenhuma solução","Todo sistema linear possui pelo menos uma solução"]},

      {id:312,enunciado:"Um sistema linear é classificado como Sistema Impossível(SI) quando: ",alternativas:["Possui exatamente uma solução","Possui infinitas soluções","Todas as equações são equivalentes","Não existe nenhum conjunto de valores que satisfaça simultaneamente todas as equações."]},

      {id:313,enunciado:"Considere o sistema abaixo:\n\nʃ2x + 4y = 8\nʅx + 2y = 4\n\nEsse sistema é classificado como:",alternativas:["Sistema Possível e Determinado(SPD)","Sistema Possível e indeterminado(SPI)","Sistema Impossível(SI)","Sistema Homogêneo"]},
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
