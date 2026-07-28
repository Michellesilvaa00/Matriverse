/* MATRIVERSE · api.js — inclua em TODAS as páginas */

// Detecta automaticamente a URL base:
// - Em produção (Render), a API fica no mesmo domínio → URL relativa
// - Em desenvolvimento local, aponta para localhost:5000
const API_URL = (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) ? "http://localhost:5000/api" : "/api";

const API = {
  cadastro: (nome, email, senha, perfil) => _post("/cadastro", { nome, email, senha, perfil }),
  login:    (email, senha)               => _post("/login",    { email, senha }),
  logout:   ()                           => _post("/logout",   {}),
  me:       ()                           => _get("/me"),

  questoes:        (mundo)                       => _get(`/questoes/${mundo}`),
  responder:       (mundo, questao_id, resposta) => _post("/responder", { mundo, questao_id, resposta }),

  getProgresso:    ()                            => _get("/progresso"),
  salvarProgresso: (mundo, estrelas, concluido)  => _post("/progresso", { mundo, estrelas, concluido }),

  ranking: () => _get("/ranking"),

  // Salas — docente
  criarSala:    (nome) => _post("/salas",         { nome }),
  minhasSalas:  ()     => _get("/salas/minhas"),
  alunosDaSala: (id)   => _get(`/salas/${id}/alunos`),
  detalheAluno: (salaId, alunoId) => _get(`/salas/${salaId}/aluno/${alunoId}`),
  rankingDaSala: (id)  => _get(`/salas/${id}/ranking`),

  // Salas — aluno
  entrarSala:       (codigo) => _post("/salas/entrar",          { codigo }),
  minhasMatriculas: ()       => _get("/salas/minhas-matriculas"),
};

async function _get(path) {
  try {
    const r = await fetch(API_URL + path, {
      credentials: "include",
      headers: _headers(),
    });
    return await r.json();
  } catch(e) {
    console.error("API GET", path, e);
    return { erro: "Sem conexão com o servidor." };
  }
}

async function _post(path, body) {
  try {
    const r = await fetch(API_URL + path, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ..._headers() },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (data.ok && data.usuario) {
      sessionStorage.setItem("mv_uid", data.usuario.id);
    }
    return data;
  } catch(e) {
    console.error("API POST", path, e);
    return { erro: "Sem conexão com o servidor." };
  }
}

function _headers() {
  const uid = sessionStorage.getItem("mv_uid");
  return uid ? { "X-User-Id": uid } : {};
}

window.API = API;
