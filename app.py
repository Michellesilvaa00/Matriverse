"""
MATRIVERSE · app.py  —  Render-ready
"""
import os
from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
import sqlite3, hashlib, random, string
from datetime import datetime

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "front-end")
app = Flask(__name__)

# ── CONFIG ──────────────────────────────────────────────
IS_PROD = os.environ.get("FLASK_ENV") == "production"

app.secret_key = os.environ.get("SECRET_KEY", "matriverse-dev-secret-2026")
app.config.update(
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=IS_PROD,   # True em produção (HTTPS no Render)
    SESSION_COOKIE_HTTPONLY=True,
)

# CORS: aceita localhost (dev) e qualquer subdomínio .onrender.com (prod)
ALLOWED_ORIGINS = [
    "http://localhost:5000",
    "http://localhost:8080",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:8080",
]

def cors_origin_check(origin):
    if not origin:
        return False
    if origin in ALLOWED_ORIGINS:
        return True
    if origin.endswith(".onrender.com"):
        return True
    return False

CORS(app, supports_credentials=True, origins=cors_origin_check)

# ── BANCO DE DADOS ──────────────────────────────────────
# No Render o filesystem é efêmero — usamos /tmp para persistência
# durante a sessão do container. Para persistência real, use
# o Render Disk ou migre para PostgreSQL.
DB_PATH = os.environ.get("DB_PATH", os.path.join(os.path.dirname(__file__), "matriverse.db"))

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL, perfil TEXT NOT NULL DEFAULT 'aluno',
        criado_em TEXT NOT NULL)""")
    c.execute("""CREATE TABLE IF NOT EXISTS salas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE NOT NULL, nome TEXT NOT NULL,
        docente_id INTEGER NOT NULL, criada_em TEXT NOT NULL,
        FOREIGN KEY(docente_id) REFERENCES usuarios(id))""")
    c.execute("""CREATE TABLE IF NOT EXISTS matriculas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_id INTEGER NOT NULL, sala_id INTEGER NOT NULL,
        entrou_em TEXT NOT NULL,
        UNIQUE(aluno_id, sala_id),
        FOREIGN KEY(aluno_id) REFERENCES usuarios(id),
        FOREIGN KEY(sala_id) REFERENCES salas(id))""")
    c.execute("""CREATE TABLE IF NOT EXISTS progresso (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL, mundo INTEGER NOT NULL,
        estrelas INTEGER NOT NULL DEFAULT 0, tentativas INTEGER NOT NULL DEFAULT 0,
        concluido INTEGER NOT NULL DEFAULT 0, atualizado TEXT NOT NULL,
        UNIQUE(usuario_id, mundo),
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id))""")
    c.execute("""CREATE TABLE IF NOT EXISTS respostas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL, mundo INTEGER NOT NULL,
        questao_id INTEGER NOT NULL, correta INTEGER NOT NULL,
        respondida TEXT NOT NULL,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id))""")
    conn.commit()
    conn.close()

# ── QUESTÕES ────────────────────────────────────────────
QUESTOES = {
    1: [
        {"id":101,"enunciado":"O que é uma matriz?","alternativas":["Uma operação matemática","Uma tabela organizada em linhas e colunas","Um gráfico cartesiano","Um cálculo de divisão"],"correta":1},
        {"id":102,"enunciado":"As linhas de uma matriz são organizadas:","alternativas":["Horizontalmente","Verticalmente","Diagonalmente","Circularmente"],"correta":0},
        {"id":103,"enunciado":"O elemento A(2,3) representa:","alternativas":["Linha 2 e coluna 3","Linha 3 e coluna 2","Coluna 2 e linha 1","A diagonal da matriz"],"correta":0},
        {"id":104,"enunciado":"Uma matriz quadrada possui:","alternativas":["Mais linhas que colunas","Mais colunas que linhas","Mesmo número de linhas e colunas","Apenas uma linha"],"correta":2},
        {"id":105,"enunciado":"Dada a matriz [ 2  3 ] / [ 1  4 ], qual é a soma da 1ª linha?","alternativas":["5","6","7","8"],"correta":0},
    ],
    2: [
        {"id":201,"enunciado":"Qual é a ordem de uma matriz com 3 linhas e 4 colunas?","alternativas":["4x3","3x4","3x3","4x4"],"correta":1},
        {"id":202,"enunciado":"Uma matriz é chamada de QUADRADA quando:","alternativas":["Linhas > colunas","Possui apenas uma linha","Linhas = colunas","Todos os elementos são zero"],"correta":2},
        {"id":203,"enunciado":"Dadas A=[[1,2],[3,4]] e B=[[5,6],[7,8]], qual é A+B?","alternativas":["[[6,8],[10,12]]","[[5,12],[21,32]]","[[4,4],[4,4]]","[[6,7],[9,10]]"],"correta":0},
        {"id":204,"enunciado":"A matriz IDENTIDADE de ordem 3 possui na diagonal principal:","alternativas":["Apenas zeros","Apenas uns","Números aleatórios","Os valores 1, 2, 3"],"correta":1},
        {"id":205,"enunciado":"Na matriz A=[[7,2,9],[4,5,6],[1,8,3]], qual é o elemento a₂₃?","alternativas":["9","6","8","5"],"correta":1},
        {"id":206,"enunciado":"A diagonal principal de [[2,0,0],[0,5,0],[0,0,9]] é formada por:","alternativas":["0, 0, 0","2, 5, 9","2, 0, 9","5, 0, 0"],"correta":1},
        {"id":207,"enunciado":"A transposta de A=[[1,2,3],[4,5,6]] é:","alternativas":["[[1,2,3],[4,5,6]]","[[6,5,4],[3,2,1]]","[[1,4],[2,5],[3,6]]","[[3,2,1],[6,5,4]]"],"correta":2},
        {"id":208,"enunciado":"Multiplicando A=[[1,2],[3,4]] pelo escalar 2:","alternativas":["[[1,2],[3,4]]","[[2,4],[6,8]]","[[3,4],[5,6]]","[[2,2],[4,4]]"],"correta":1},
        {"id":209,"enunciado":"Quantos elementos possui uma matriz de ordem 4x5?","alternativas":["9","16","20","25"],"correta":2},
        {"id":210,"enunciado":"Em aᵢⱼ = i+j, qual é o valor de a₃₂?","alternativas":["5","6","1","9"],"correta":0},
        {"id":211,"enunciado":"Se A=[[2,1],[0,3]] e B=[[1,4],[2,1]], qual é A-B?","alternativas":["[[1,-3],[-2,2]]","[[3,5],[2,4]]","[[1,3],[2,2]]","[[-1,3],[2,-2]]"],"correta":0},
        {"id":212,"enunciado":"Uma matriz LINHA possui:","alternativas":["Apenas uma coluna","Apenas uma linha","Mesmo nº de linhas e colunas","Nenhum elemento"],"correta":1},
    ],
    3: [
        {"id":301,"enunciado":"""Qual o resultado da multiplicação das matrizes:\n\n        A =\n            [ 1  2 ]\n            [ 3  4 ]\n\n        B =\n            [ 2  0 ]\n            [ 1  5 ]""","alternativas":["[[4,10],[10,20]]","[[4,8],[10,20]]","[[5,10],[10,20]]","[[4,10],[8,20]]","[[2,10],[10,20]]"],"correta":0},
        {"id":302,"enunciado":"""Multiplique as matrizes:\n\n        A =\n            [ 2  1  3 ]\n            [ 0  4  2 ]\n            [ 1  5  1 ]\n\n        B =\n            [ 1  2  0 ]\n            [ 3  1  4 ]\n            [ 2  5  1 ]""","alternativas":["[[11,20,7],[16,14,18],[18,12,21]]","[[10,20,7],[16,14,18],[18,12,21]]","[[11,18,7],[16,14,18],[18,12,21]]","[[11,20,9],[16,14,18],[18,12,21]]","[[11,20,7],[14,14,18],[18,12,21]]"],"correta":0},
        {"id":303,"enunciado":"""Levando em consideração:\n\n        A =\n            [ 1  2  3 ]\n            [ 4  5  6 ]\n\n        B =\n            [ 1  0  2 ]\n            [ 3  5  4 ]\n            [ 5  2  6 ]\n        \n    Qual será a dimensão da matriz resultado multiplicada?""","alternativas":["3x2","2x2","2x3","3x3","1x3"],"correta":2},
        {"id":304,"enunciado":"""Calcule o elemento C₂,₃ da multiplicação:\n\n        A =\n            [ 1   0   2 ]\n            [ -1  3   1 ]\n            [ 2   1   0 ]\n\n        B =\n            [ 3  1  2 ]\n            [ 2  0  1 ]\n            [ 1  4  3 ]""","alternativas":["2","3","4","5","6"],"correta":2},
        {"id":305,"enunciado":"""Calcule:\n\n    2A + 3B − C:\n\n        A =\n            [ 1  2 ]\n            [ 3  4 ]\n\n        B =\n            [ 2  1 ]\n            [ 0  3 ]\n\n        C =\n            [ 4  5 ]\n            [ 6  7 ]""","alternativas":["[[4,2],[0,10]]","[[4,0],[0,10]]","[[2,2],[0,10]]","[[4,2],[2,10]]","[[4,2],[0,8]]"],"correta":0},
    ],
    4: [
        {"id":401,"enunciado":"Qual é a solução do sistema?\n\nʃx + y = 7\nʅx - y = 1","alternativas":["3,4","4,3","5,2","2,5"],"correta":1},
        {"id":402,"enunciado":"Resolva o sistema: \n\nʃ2x + y = 8\nʅx + y = 5","alternativas":["3,2","2,3","4,1","1,4"],"correta":0},
        {"id":403,"enunciado":"A solução do sistema abaixo é:\n\nʃ3x + 2y = 12\nʅx + y = 5","alternativas":["2,3","3,2","4,1","1,4"],"correta":0},
        {"id":404,"enunciado":"Determine a solução:\n\nʃ2x - y = 1\nʅx + y = 8","alternativas":["3,5","2,6","4,4","1,7"],"correta":0},
        {"id":405,"enunciado":"O sistema abaixo possui solução?:\n\nʃx + 2y = 10\nʅ2x + 4y = 20","alternativas":["Única solução","Duas soluções","Infinitas soluções","Nenhuma solução"],"correta":2},
        {"id":406,"enunciado":"Resolva o sistema:\n\nʃ4x + y = 13\nʅ2x - y = 5","alternativas":["2,5","3,1","4,-3","1,9"],"correta":1},
        {"id":407,"enunciado":"Qual alternativa representa a solução?:\n\nʃx - 2y = -4\nʅx + y = 5","alternativas":["2,3","3,2","1,4","4,1"],"correta":0},
        {"id":408,"enunciado":"O sistema abaixo é:\n\nʃx + y = 4\nʅx + y = 7","alternativas":["Possível e determinado","Possível e indeterminado","Impossível","Homogêneo"],"correta":2},
        {"id":409,"enunciado":"Resolva o sistema abaixo:\n\nʃ5x - y = 11\nʅx + y = 7","alternativas":["3,4","2,5","4,3","1,6"],"correta":0},
        {"id":410,"enunciado":"Em uma papelaria, 2 cadernos e 3 canetas custam R$21. Já 1 caderno e 2 canetas custam R$13. O preço de um caderno e uma caneta, respectivamente é:","alternativas":["R$ 5 e R$ 4","R$ 3 e R$ 5","R$ 6 e R$ 3,50","R$ 4 e R$ 4,50"],"correta":1},
        {"id":411,"enunciado":"Sobre sistemas lineares, selecione a alternativa correta:","alternativas":["Um sistema linear pode possuir apenas uma solução ou nenhuma solução","Um sistema linear nunca pode ter infinitas soluções","Um sistema linear pode possuir uma única solução, infinitas soluções ou nenhuma solução","Todo sistema linear possui pelo menos uma solução"],"correta":2},
        {"id":412,"enunciado":"Um sistema linear é classificado como Sistema Impossível(SI) quando: ","alternativas":["Possui exatamente uma solução","Possui infinitas soluções","Todas as equações são equivalentes","Não existe nenhum conjunto de valores que satisfaça simultaneamente todas as equações."],"correta":3},
        {"id":413,"enunciado":"Considere o sistema abaixo:\n\nʃ2x + 4y = 8\nʅx + 2y = 4\n\nEsse sistema é classificado como:","alternativas":["Sistema Possível e Determinado(SPD)","Sistema Possível e indeterminado(SPI)","Sistema Impossível(SI)","Sistema Homogêneo"],"correta":1},
    ]
}

# ── HELPERS ─────────────────────────────────────────────
def hash_senha(s): return hashlib.sha256(s.encode()).hexdigest()

def gerar_codigo():
    conn = get_db()
    while True:
        cod = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if not conn.execute("SELECT id FROM salas WHERE codigo=?", (cod,)).fetchone():
            conn.close(); return cod

def usuario_logado():
    uid = session.get("usuario_id") or request.headers.get("X-User-Id")
    if not uid: return None
    conn = get_db()
    row = conn.execute("SELECT * FROM usuarios WHERE id=?", (uid,)).fetchone()
    conn.close()
    return dict(row) if row else None

# ── SERVIR ARQUIVOS ESTÁTICOS (HTML, CSS, JS) ───────────
@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "landing.html")

@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)

# ── HEALTH CHECK ────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "env": "production" if IS_PROD else "development"})

# ── AUTH ────────────────────────────────────────────────
@app.route("/api/cadastro", methods=["POST"])
def cadastro():
    d = request.json or {}
    nome   = (d.get("nome") or "").strip()
    email  = (d.get("email") or "").strip().lower()
    senha  = d.get("senha") or ""
    perfil = d.get("perfil", "aluno")
    if not nome or not email or not senha:
        return jsonify({"erro": "Preencha todos os campos."}), 400
    if perfil not in ("aluno", "docente"):
        return jsonify({"erro": "Perfil inválido."}), 400
    if len(senha) < 6:
        return jsonify({"erro": "Senha deve ter pelo menos 6 caracteres."}), 400
    conn = get_db()
    try:
        conn.execute("INSERT INTO usuarios (nome,email,senha,perfil,criado_em) VALUES (?,?,?,?,?)",
                     (nome, email, hash_senha(senha), perfil, datetime.now().isoformat()))
        conn.commit()
        row = conn.execute("SELECT * FROM usuarios WHERE email=?", (email,)).fetchone()
        session["usuario_id"] = row["id"]
        return jsonify({"ok": True, "usuario": {"id": row["id"], "nome": row["nome"], "perfil": row["perfil"]}})
    except sqlite3.IntegrityError:
        return jsonify({"erro": "E-mail já cadastrado."}), 409
    finally:
        conn.close()

@app.route("/api/login", methods=["POST"])
def login():
    d = request.json or {}
    email = (d.get("email") or "").strip().lower()
    senha = d.get("senha") or ""
    conn  = get_db()
    row   = conn.execute("SELECT * FROM usuarios WHERE email=? AND senha=?",
                         (email, hash_senha(senha))).fetchone()
    conn.close()
    if not row: return jsonify({"erro": "E-mail ou senha incorretos."}), 401
    session["usuario_id"] = row["id"]
    return jsonify({"ok": True, "usuario": {"id": row["id"], "nome": row["nome"], "perfil": row["perfil"]}})

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True})

@app.route("/api/me")
def me():
    u = usuario_logado()
    if not u: return jsonify({"erro": "Não autenticado."}), 401
    return jsonify({"id": u["id"], "nome": u["nome"], "email": u["email"], "perfil": u["perfil"]})

# ── SALAS ────────────────────────────────────────────────
@app.route("/api/salas", methods=["POST"])
def criar_sala():
    u = usuario_logado()
    if not u: return jsonify({"erro": "Não autenticado."}), 401
    if u["perfil"] != "docente": return jsonify({"erro": "Apenas docentes podem criar salas."}), 403
    d = request.json or {}
    nome = (d.get("nome") or "").strip()
    if not nome: return jsonify({"erro": "Informe um nome para a sala."}), 400
    codigo = gerar_codigo()
    conn = get_db()
    conn.execute("INSERT INTO salas (codigo,nome,docente_id,criada_em) VALUES (?,?,?,?)",
                 (codigo, nome, u["id"], datetime.now().isoformat()))
    conn.commit()
    sala = conn.execute("SELECT * FROM salas WHERE codigo=?", (codigo,)).fetchone()
    conn.close()
    return jsonify(dict(sala))

@app.route("/api/salas/minhas")
def minhas_salas():
    u = usuario_logado()
    if not u: return jsonify({"erro": "Não autenticado."}), 401
    if u["perfil"] != "docente": return jsonify({"erro": "Apenas docentes."}), 403
    conn = get_db()
    salas = conn.execute("SELECT * FROM salas WHERE docente_id=? ORDER BY criada_em DESC", (u["id"],)).fetchall()
    result = []
    for s in salas:
        total = conn.execute("SELECT COUNT(*) as c FROM matriculas WHERE sala_id=?", (s["id"],)).fetchone()["c"]
        result.append({**dict(s), "total_alunos": total})
    conn.close()
    return jsonify(result)

@app.route("/api/salas/entrar", methods=["POST"])
def entrar_sala():
    u = usuario_logado()
    if not u: return jsonify({"erro": "Não autenticado."}), 401
    if u["perfil"] != "aluno": return jsonify({"erro": "Apenas alunos podem entrar em salas."}), 403
    codigo = (request.json.get("codigo") or "").strip().upper()
    if not codigo: return jsonify({"erro": "Informe o código da sala."}), 400
    conn = get_db()
    sala = conn.execute("SELECT * FROM salas WHERE codigo=?", (codigo,)).fetchone()
    if not sala: conn.close(); return jsonify({"erro": "Código de sala inválido."}), 404
    try:
        conn.execute("INSERT INTO matriculas (aluno_id,sala_id,entrou_em) VALUES (?,?,?)",
                     (u["id"], sala["id"], datetime.now().isoformat()))
        conn.commit()
    except sqlite3.IntegrityError:
        pass
    conn.close()
    return jsonify({"ok": True, "sala": {"id": sala["id"], "nome": sala["nome"], "codigo": sala["codigo"]}})

@app.route("/api/salas/minhas-matriculas")
def minhas_matriculas():
    u = usuario_logado()
    if not u: return jsonify({"erro": "Não autenticado."}), 401
    conn = get_db()
    rows = conn.execute("""
        SELECT s.id, s.codigo, s.nome, m.entrou_em, u.nome as docente_nome
        FROM matriculas m
        JOIN salas s ON s.id = m.sala_id
        JOIN usuarios u ON u.id = s.docente_id
        WHERE m.aluno_id = ? ORDER BY m.entrou_em DESC
    """, (u["id"],)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/salas/<int:sala_id>/alunos")
def alunos_da_sala(sala_id):
    u = usuario_logado()
    if not u or u["perfil"] != "docente": return jsonify({"erro": "Acesso negado."}), 403
    conn = get_db()
    sala = conn.execute("SELECT * FROM salas WHERE id=? AND docente_id=?", (sala_id, u["id"])).fetchone()
    if not sala: conn.close(); return jsonify({"erro": "Sala não encontrada."}), 404
    alunos = conn.execute("""
        SELECT u.id, u.nome, u.email,
               COALESCE(SUM(p.estrelas),0)  AS total_estrelas,
               COALESCE(MAX(p.mundo),0)     AS mundo_atual,
               COALESCE(SUM(p.tentativas),0) AS tentativas,
               COALESCE(SUM(p.concluido),0) AS mundos_concluidos,
               (SELECT COUNT(*) FROM respostas r WHERE r.usuario_id=u.id) AS total_respostas,
               (SELECT COALESCE(SUM(r.correta),0) FROM respostas r WHERE r.usuario_id=u.id) AS acertos
        FROM matriculas m
        JOIN usuarios u ON u.id = m.aluno_id
        LEFT JOIN progresso p ON p.usuario_id = u.id
        WHERE m.sala_id=? GROUP BY u.id ORDER BY total_estrelas DESC
    """, (sala_id,)).fetchall()
    conn.close()
    return jsonify({"sala": dict(sala), "alunos": [dict(a) for a in alunos]})

@app.route("/api/salas/<int:sala_id>/aluno/<int:aluno_id>")
def detalhe_aluno_sala(sala_id, aluno_id):
    u = usuario_logado()
    if not u or u["perfil"] != "docente": return jsonify({"erro": "Acesso negado."}), 403
    conn = get_db()
    sala = conn.execute("SELECT * FROM salas WHERE id=? AND docente_id=?", (sala_id, u["id"])).fetchone()
    if not sala: conn.close(); return jsonify({"erro": "Sala não encontrada."}), 404
    aluno = conn.execute("SELECT id,nome,email FROM usuarios WHERE id=?", (aluno_id,)).fetchone()
    progresso = conn.execute("SELECT mundo,estrelas,tentativas,concluido FROM progresso WHERE usuario_id=?", (aluno_id,)).fetchall()
    acertos = conn.execute("SELECT mundo,COUNT(*) AS total,SUM(correta) AS certas FROM respostas WHERE usuario_id=? GROUP BY mundo", (aluno_id,)).fetchall()
    conn.close()
    return jsonify({"aluno": dict(aluno), "progresso": [dict(p) for p in progresso], "acertos": [dict(a) for a in acertos]})

# ── QUESTÕES ─────────────────────────────────────────────
@app.route("/api/questoes/<int:mundo>")
def questoes(mundo):
    if mundo not in QUESTOES: return jsonify({"erro": "Mundo não encontrado."}), 404
    return jsonify([{"id": q["id"], "enunciado": q["enunciado"], "alternativas": q["alternativas"]} for q in QUESTOES[mundo]])

@app.route("/api/responder", methods=["POST"])
def responder():
    u = usuario_logado()
    if not u: return jsonify({"erro": "Não autenticado."}), 401
    d = request.json or {}
    mundo = d.get("mundo"); questao_id = d.get("questao_id"); resposta = d.get("resposta")
    if mundo not in QUESTOES: return jsonify({"erro": "Mundo inválido."}), 400
    questao = next((q for q in QUESTOES[mundo] if q["id"] == questao_id), None)
    if not questao: return jsonify({"erro": "Questão não encontrada."}), 404
    correta = int(resposta == questao["correta"])
    conn = get_db()
    conn.execute("INSERT INTO respostas (usuario_id,mundo,questao_id,correta,respondida) VALUES (?,?,?,?,?)",
                 (u["id"], mundo, questao_id, correta, datetime.now().isoformat()))
    conn.commit(); conn.close()
    return jsonify({"correta": bool(correta), "resposta_certa": questao["correta"], "texto_certo": questao["alternativas"][questao["correta"]]})

# ── PROGRESSO ─────────────────────────────────────────────
@app.route("/api/progresso")
def get_progresso():
    u = usuario_logado()
    if not u: return jsonify({"erro": "Não autenticado."}), 401
    conn = get_db()
    rows = conn.execute("SELECT mundo,estrelas,tentativas,concluido FROM progresso WHERE usuario_id=?", (u["id"],)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/progresso", methods=["POST"])
def salvar_progresso():
    u = usuario_logado()
    if not u: return jsonify({"erro": "Não autenticado."}), 401
    d = request.json or {}
    mundo = d.get("mundo"); estrelas = d.get("estrelas", 0); concluido = int(d.get("concluido", False))
    conn = get_db()
    existente = conn.execute("SELECT estrelas FROM progresso WHERE usuario_id=? AND mundo=?", (u["id"], mundo)).fetchone()
    if existente:
        melhor = max(existente["estrelas"], estrelas)
        conn.execute("UPDATE progresso SET estrelas=?,tentativas=tentativas+1,concluido=?,atualizado=? WHERE usuario_id=? AND mundo=?",
                     (melhor, concluido, datetime.now().isoformat(), u["id"], mundo))
    else:
        conn.execute("INSERT INTO progresso (usuario_id,mundo,estrelas,tentativas,concluido,atualizado) VALUES (?,?,?,1,?,?)",
                     (u["id"], mundo, estrelas, concluido, datetime.now().isoformat()))
    conn.commit(); conn.close()
    return jsonify({"ok": True})

# ── RANKING ──────────────────────────────────────────────
@app.route("/api/ranking")
def ranking():
    conn = get_db()
    rows = conn.execute("""
        SELECT u.nome,
               COALESCE(SUM(p.estrelas),0)  AS total_estrelas,
               COALESCE(MAX(p.mundo),0)     AS mundo_atual,
               COALESCE(SUM(p.concluido),0) AS mundos_concluidos
        FROM usuarios u
        LEFT JOIN progresso p ON p.usuario_id=u.id
        WHERE u.perfil='aluno'
        GROUP BY u.id ORDER BY total_estrelas DESC LIMIT 20
    """).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

# ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    print("\n  MATRIVERSE Backend · http://localhost:5000\n")
    app.run(debug=True, port=5000)

# Inicializa o banco ao importar (necessário para gunicorn)
init_db()
