/* MATRIVERSE · landing.js */
function criarParticulas() {
  const c = document.getElementById('particles'); if(!c) return;
  const cores = ['#a78bfa','#38bdf8','#ec4899','#ffffff'];
  for(let i=0;i<30;i++){
    const p=document.createElement('span'); p.className='particle';
    const cor=cores[Math.floor(Math.random()*cores.length)];
    p.style.left=Math.random()*100+'%'; p.style.background=cor;
    p.style.boxShadow=`0 0 8px ${cor}`; p.style.width=p.style.height=(2+Math.random()*3)+'px';
    p.style.animationDuration=(8+Math.random()*12)+'s'; p.style.animationDelay=Math.random()*10+'s';
    c.appendChild(p);
  }
}
function toggleMenu(){ document.querySelector('.nav-links')?.classList.toggle('open'); }
function openLogin(){
  document.getElementById('loginModal')?.classList.remove('hidden');
  document.body.style.overflow='hidden';
  document.getElementById('loginErro').style.display='none';
}
function closeLogin(){ document.getElementById('loginModal')?.classList.add('hidden'); document.body.style.overflow=''; }
function closeLoginBg(e){ if(e.target.id==='loginModal') closeLogin(); }

async function handleLogin(e){
  e.preventDefault();
  const email  = document.querySelector('.login-form input[type="email"]').value.trim();
  const senha  = document.querySelector('.login-form input[type="password"]').value;
  const btn    = document.querySelector('.login-form .btn-neon');
  const errEl  = document.getElementById('loginErro');
  errEl.style.display='none';
  btn.textContent='Entrando...'; btn.disabled=true;
  const res = await API.login(email, senha);
  btn.textContent='Entrar no MATRIVERSE'; btn.disabled=false;
  if(res.erro){
    errEl.textContent=res.erro;
    errEl.style.cssText='display:block;background:rgba(244,63,94,.15);border:1px solid #f43f5e;border-radius:8px;padding:8px 12px;color:#f43f5e;font-weight:700;font-size:.85rem;margin-bottom:8px';
    return;
  }
  sessionStorage.setItem('mv_usuario', JSON.stringify(res.usuario));
  closeLogin();
  window.location.href = res.usuario.perfil==='docente' ? 'docente.html' : 'index.html';
}

const NAVBAR_HEIGHT=78;
function initSmoothScroll(){
  document.querySelectorAll('.nav-link[href^="#"]').forEach(l=>{
    l.addEventListener('click',(e)=>{
      e.preventDefault();
      const t=document.querySelector(l.getAttribute('href')); if(!t) return;
      document.querySelector('.nav-links')?.classList.remove('open');
      window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-NAVBAR_HEIGHT,behavior:'smooth'});
    });
  });
}
function initScrollSpy(){
  const secs=document.querySelectorAll('section[id]'),links=document.querySelectorAll('.nav-link');
  let cur='hero';
  new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting) cur=en.target.id; });
    links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+cur));
  },{rootMargin:`-${NAVBAR_HEIGHT+20}px 0px -60% 0px`,threshold:0}).observe;
  // fix: observe each
  secs.forEach(s=>new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting) cur=en.target.id; links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+cur)); });
  },{rootMargin:`-${NAVBAR_HEIGHT+20}px 0px -60% 0px`,threshold:0}).observe(s));
}
window.addEventListener('DOMContentLoaded',()=>{ criarParticulas(); initSmoothScroll(); initScrollSpy(); });
window.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeLogin(); });
window.openLogin=openLogin; window.closeLogin=closeLogin; window.closeLoginBg=closeLoginBg;
window.toggleMenu=toggleMenu; window.handleLogin=handleLogin;
