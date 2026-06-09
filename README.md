<div align="center">

<img src="https://img.shields.io/badge/MatriVerse-v1.0.0-7C3AED?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNDAgNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTEiIGZpbGw9IiM3QzNBRUQiLz48ZWxsaXBzZSBjeD0iMjAiIGN5PSIyMCIgcng9IjE5IiByeT0iNyIgc3Ryb2tlPSIjQzRCNUZEIiBzdHJva2Utd2lkdGg9IjIuNSIgZmlsbD0ibm9uZSIgdHJhbnNmb3JtPSJyb3RhdGUoLTIwIDIwIDIwKSIvPjwvc3ZnPg==&logoColor=white" alt="MatriVerse"/>

# MATRIVERSE
# Acesse por este link -> https://matriverse.onrender.com

### Plataforma Gamificada de Ensino de Álgebra Linear

*Aprenda matrizes explorando mundos, conquistando estrelas e dominando desafios matemáticos.*

<br/>

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-CSS3-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![License](https://img.shields.io/badge/Licença-MIT-22C55E?style=flat-square)](LICENSE)

<br/>

![Hub de Mundos](https://img.shields.io/badge/Hub_de_Mundos-4_Mundos_Disponíveis-A855F7?style=flat-square)
![Questões](https://img.shields.io/badge/Banco_de_Questões-50+_Questões-38BDF8?style=flat-square)
![Perfis](https://img.shields.io/badge/Perfis-Estudante_/_Docente-F97316?style=flat-square)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Demonstração](#-demonstração)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Estrutura de Arquivos](#-estrutura-de-arquivos)
- [Tecnologias](#-tecnologias)
- [Instalação e Execução](#-instalação-e-execução)
- [API Reference](#-api-reference)
- [Banco de Dados](#-banco-de-dados)
- [Mundos e Conteúdo](#-mundos-e-conteúdo)
- [Perfis de Usuário](#-perfis-de-usuário)
- [Modo Offline](#-modo-offline-fallback)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🚀 Sobre o Projeto

**MatriVerse** é uma plataforma educacional gamificada voltada ao ensino de **Álgebra Linear** para estudantes do Ensino Médio e Superior. Através de uma mecânica inspirada em jogos de progressão por mundos, o aluno avança respondendo questões de múltipla escolha sobre matrizes, acumulando **estrelas** e desbloqueando novos desafios.

O projeto oferece dois perfis distintos:

- **Estudante** — joga, responde questões, acumula estrelas e acompanha sua evolução
- **Docente** — cria salas de aula, compartilha códigos de acesso e monitora o desempenho individual de cada aluno em tempo real

### Motivação

O ensino de matrizes costuma ser abstrato e pouco motivador no modelo tradicional. O MatriVerse transforma esse conteúdo em uma jornada interativa, com feedback imediato, cronômetro por questão e progressão visual — aumentando o engajamento e a retenção do conteúdo.

---

## 🎮 Demonstração

```
Landing Page → Cadastro/Login → Hub de Mundos → Mundo N → Questões → Resultado
                                     ↓
                              Painel Docente (se perfil = docente)
```

### Fluxo do Estudante
1. Acessa a **Landing Page** e cria uma conta (perfil Estudante)
2. Entra no **Hub de Mundos** e vê os 4 mundos temáticos
3. Clica num mundo desbloqueado e responde questões cronometradas
4. A cada acerto ganha ⭐ estrelas; ao atingir a meta, o mundo é concluído
5. Acompanha progresso no **Perfil** e vê posição no **Ranking**

### Fluxo do Docente
1. Cria conta (perfil Docente) e acessa o **Painel Docente**
2. Cria salas de aula e obtém um **código de 6 caracteres**
3. Compartilha o código com os alunos
4. Monitora em tempo real: estrelas por aluno, mundo atual, taxa de acerto

---

## ✨ Funcionalidades

### 🎓 Para Estudantes
- **Hub de Mundos** com 4 mundos temáticos desbloqueáveis progressivamente
- **Quiz cronometrado** com timer circular animado (SVG)
- **Feedback visual imediato** — verde para certo, vermelho para errado
- **Sistema de estrelas** acumuladas por acerto (salvo no banco de dados)
- **Barra de progresso** dinâmica por questão respondida
- **Modo offline** com fallback automático de questões quando sem backend
- **Tela de resultado final** ao concluir cada mundo
- **Ranking global** com pontuação de todos os usuários
- **Perfil pessoal** com histórico de progresso
- **Entrada em salas** pelo código fornecido pelo professor

### 👨‍🏫 Para Docentes
- **Criação de salas** com nome personalizado
- **Código único** de 6 caracteres gerado automaticamente
- **Painel de monitoramento** com tabela de alunos ordenada por desempenho
- **Estatísticas por sala**: total de alunos, estrelas, respostas e taxa de acerto
- **Detalhamento individual**: estrelas, mundo atual, total de respostas e acertos
- **Barra de progresso** visual por aluno

### 🔧 Sistema
- Autenticação com **sessão HTTP** (cookie) + fallback por header `X-User-Id`
- Banco de dados **SQLite** com 5 tabelas relacionadas
- API REST com **CORS** configurado
- Senhas protegidas com **SHA-256**
- Modo offline transparente — jogo funciona sem backend ativo

---

## 🏗 Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                                                             │
│  landing.html ──► cadastro.html ──► login.html             │
│                          │                                  │
│                          ▼                                  │
│              ┌─── index.html (Hub) ───┐                    │
│              │         │             │                      │
│         docente.html   │             │                      │
│              │    mundoN.html   perfil/ranking              │
│              │         │                                    │
│              └─────────┴── api.js (camada de API)          │
│                              │                              │
└──────────────────────────────┼──────────────────────────────┘
                               │ HTTP REST (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND — app.py (Flask)                   │
│                                                             │
│   /api/cadastro    /api/login      /api/logout              │
│   /api/me          /api/questoes   /api/responder           │
│   /api/progresso   /api/ranking                             │
│   /api/salas       /api/salas/entrar                        │
│                          │                                  │
│                    SQLite (matriverse.db)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

```
matriverse/
│
├── 📄 app.py                  # Backend Flask — API REST + banco de dados
│
├── 🌐 Frontend
│   ├── landing.html           # Página inicial pública (apresentação do produto)
│   ├── landing.css            # Estilos da landing page
│   ├── landing.js             # Partículas, scroll spy, modal de login
│   │
│   ├── cadastro.html          # Tela de registro (Estudante ou Docente)
│   ├── cadastro.css           # Estilos compartilhados: cadastro + login
│   ├── login.html             # Tela de autenticação
│   │
│   ├── index.html             # Hub de Mundos — tela principal do estudante
│   ├── style.css              # Estilos do Hub de Mundos
│   ├── script.js              # Lógica do Hub: rotas, modal, estrelas, navbar
│   ├── hub_patch.js           # Integração Hub ↔ API: nome, progresso, sala
│   │
│   ├── mundo1.html            # Mundo 1 — Fundação das Matrizes
│   ├── mundo1.css             # Estilos do Mundo 1
│   │
│   ├── mundo2.html            # Mundo 2 — Operações Básicas
│   ├── mundo2.css             # Estilos do Mundo 2 (compartilhado com 3 e 4)
│   ├── mundo2.js              # Lógica do Mundo 2 (quiz + API)
│   │
│   ├── mundo3.html            # Mundo 3 — Multiplicação de Matrizes
│   ├── mundo3.css             # Estilos do Mundo 3
│   ├── mundo3.js              # Lógica do Mundo 3 (quiz + fallback offline)
│   │
│   ├── mundo4.html            # Mundo 4 — Sistemas Lineares
│   ├── mundo4.css             # Estilos do Mundo 4
│   ├── mundo4.js              # Lógica do Mundo 4 (quiz + API)
│   │
│   ├── docente.html           # Painel do Docente (salas + monitoramento)
│   ├── docente.css            # Estilos do painel docente
│   │
│   └── api.js                 # Camada de comunicação com o backend (fetch)
│
└── 📦 matriverse.db           # Banco SQLite (gerado automaticamente no 1º run)
```

---

## 🛠 Tecnologias

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| **Python** | 3.10+ | Linguagem principal do servidor |
| **Flask** | 3.x | Framework web / servidor REST |
| **Flask-CORS** | 4.x | Controle de CORS para dev local |
| **SQLite3** | 3.x | Banco de dados relacional embutido |
| **hashlib** | stdlib | Hash SHA-256 de senhas |

### Frontend
| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura semântica das páginas |
| **CSS3** | Variáveis CSS, Grid, Flexbox, animações |
| **JavaScript ES2022** | Lógica de quiz, fetch API, localStorage |
| **Google Fonts** | Nunito (corpo) + Orbitron (títulos/logo) |
| **SVG inline** | Timer circular, ilustrações dos mundos, planetas |

---

## ⚙️ Instalação e Execução

### Pré-requisitos

- Python **3.10** ou superior
- pip (gerenciador de pacotes Python)
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Servidor HTTP local (recomendado: Live Server, http.server ou similar)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/matriverse.git
cd matriverse
```

### 2. Crie um ambiente virtual (recomendado)

```bash
python -m venv venv

# Linux / macOS
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Instale as dependências Python

```bash
pip install flask flask-cors
```

### 4. Inicie o backend

```bash
python app.py
```

Saída esperada:
```
  MATRIVERSE Backend · http://localhost:5000
```

O banco de dados `matriverse.db` é criado automaticamente na primeira execução.

### 5. Sirva o frontend

Abra um segundo terminal na pasta do projeto e execute:

```bash
# Python 3 (porta 8080 — já configurada no CORS do backend)
python -m http.server 8080
```

Ou use a extensão **Live Server** do VS Code apontando para a porta 8080.

### 6. Acesse no navegador

```
http://localhost:8080/landing.html
```

> ⚠️ **Importante:** O frontend deve rodar na porta **8080** porque o backend tem CORS configurado para `http://localhost:8080`. Abrir os arquivos diretamente com `file://` pode causar erros de sessão/cookie em alguns navegadores.

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

Todos os endpoints retornam JSON. Autenticação via cookie de sessão (automático) + header `X-User-Id` como fallback.

### Autenticação

| Método | Endpoint | Descrição | Body |
|---|---|---|---|
| `POST` | `/cadastro` | Registra novo usuário | `{ nome, email, senha, perfil }` |
| `POST` | `/login` | Autentica usuário | `{ email, senha }` |
| `POST` | `/logout` | Encerra sessão | — |
| `GET` | `/me` | Retorna usuário logado | — |

### Quiz

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/questoes/:mundo` | Lista questões do mundo (1–4) |
| `POST` | `/responder` | Valida resposta e registra no histórico |

**Body `/responder`:**
```json
{
  "mundo": 2,
  "questao_id": 201,
  "resposta": 1
}
```

**Resposta `/responder`:**
```json
{
  "correta": true,
  "resposta_certa": 1
}
```

### Progresso

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/progresso` | Retorna progresso do usuário em todos os mundos |
| `POST` | `/progresso` | Salva progresso de um mundo específico |

**Body `POST /progresso`:**
```json
{
  "mundo": 2,
  "estrelas": 8,
  "concluido": false
}
```

### Salas (Docente)

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/salas` | Cria nova sala | 
| `GET` | `/salas/minhas` | Lista salas do docente logado |
| `GET` | `/salas/:id/alunos` | Retorna alunos e stats da sala |
| `POST` | `/salas/entrar` | Aluno entra numa sala pelo código |
| `GET` | `/salas/minhas-matriculas` | Salas em que o aluno está matriculado |

### Ranking

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/ranking` | Top usuários por total de estrelas |

---

## 🗄 Banco de Dados

O banco SQLite é inicializado automaticamente com `init_db()` na primeira execução.

### Diagrama ER (simplificado)

```
usuarios (id, nome, email, senha, perfil, criado_em)
    │
    ├──< progresso (usuario_id, mundo, estrelas, tentativas, concluido, atualizado)
    │
    ├──< respostas (usuario_id, mundo, questao_id, correta, respondida)
    │
    ├──< matriculas (aluno_id, sala_id, entrou_em)
    │         │
salas (id, codigo, nome, docente_id, criada_em)
```

### Tabelas

| Tabela | Descrição |
|---|---|
| `usuarios` | Cadastro de estudantes e docentes (senha em SHA-256) |
| `progresso` | Estrelas e status de conclusão por mundo e usuário |
| `respostas` | Histórico completo de todas as respostas dadas |
| `salas` | Salas criadas pelos docentes (com código único) |
| `matriculas` | Relação N:N entre alunos e salas |

---

## 🌍 Mundos e Conteúdo

### Mapa de Progressão

```
[MUNDO 1] ──► [MUNDO 2] ──► [MUNDO 3] ──► [MUNDO 4]
Fundação      Operações      Multiplicação   Sistemas
              Básicas        de Matrizes     Lineares
  5 ⭐ meta    10 ⭐ meta     10 ⭐ meta      10 ⭐ meta
  20s/questão  20s/questão   5min/sessão    60s/questão
```

### Mundo 1 — Fundação das Matrizes
- O que é uma matriz, tipos e notação
- Elemento aᵢⱼ, ordem m×n, matrizes quadradas
- Soma dos elementos, leitura de matrizes simples
- **Meta:** 5 estrelas · **Timer:** 20 segundos por questão

### Mundo 2 — Operações Básicas
- Adição e subtração de matrizes
- Multiplicação por escalar
- Transposta e propriedades
- Identificação de elementos pela notação aᵢⱼ
- **Meta:** 10 estrelas · **Timer:** 20 segundos por questão

### Mundo 3 — Multiplicação de Matrizes
- Multiplicação de matrizes 2×2 e 3×3
- Dimensão resultante de um produto
- Cálculo de elementos específicos (Cᵢⱼ)
- Combinações lineares (2A + 3B − C)
- **Meta:** 10 estrelas (2 por acerto) · **Timer:** 5 minutos por sessão (cronômetro regressivo M:SS)

### Mundo 4 — Sistemas Lineares
- Resolução de sistemas 2×2 pelo método da adição/substituição
- Sistemas possíveis e determinados (SPD), possíveis e indeterminados (SPI), impossíveis (SI)
- Aplicações práticas (problemas contextualizados)
- **Meta:** 10 estrelas · **Timer:** 60 segundos por questão

---

## 👤 Perfis de Usuário

### Estudante (`aluno`)
Após login, é redirecionado para o **Hub de Mundos** (`index.html`).

```
Hub de Mundos
├── 4 cards de mundo com progresso real
├── Barra de estrelas totais na navbar
├── Modal para entrar em sala (código do professor)
└── Navegação inferior: Hub · Missões · Ranking · Perfil · Loja
```

### Docente (`docente`)
Após login, é redirecionado para o **Painel Docente** (`docente.html`).

```
Painel Docente
├── Criar salas de aula com nome personalizado
├── Código único de 6 caracteres por sala
├── Lista de salas criadas
└── Ao selecionar uma sala:
    ├── Total de alunos, estrelas, respostas e % acerto
    └── Tabela com ranking dos alunos da sala
```

---

## 🔌 Modo Offline (Fallback)

O MatriVerse funciona **sem backend ativo**. Quando a API está indisponível:

- As questões são carregadas do banco local embutido em cada `mundoN.js`
- A validação de respostas ocorre localmente pelo campo `correta` de cada questão
- O progresso é salvo no `localStorage` como backup
- Nenhuma mensagem de erro é exibida ao usuário — a troca é transparente

```javascript
// Exemplo de fallback em mundo3.js
try {
  const d = await API.questoes(MUNDO);
  if (Array.isArray(d) && d.length >= META) questoes = d;
  else throw new Error('Sem questões suficientes');
} catch {
  console.warn('[Mundo 3] Backend indisponível — usando questões locais.');
  questoes = QUESTOES_FALLBACK;
}
```

---

## 🔒 Segurança

- Senhas armazenadas como hash **SHA-256** (nunca em texto plano)
- Sessões gerenciadas pelo Flask com `secret_key` configurável
- CORS restrito às origens de desenvolvimento (`localhost:8080`)
- Validação de perfil no frontend e backend antes de acessar recursos restritos
- Parâmetros de sala validados no servidor antes de criar/entrar

> ⚠️ Para produção, altere `app.secret_key`, habilite HTTPS, configure `SESSION_COOKIE_SECURE=True` e substitua SHA-256 por **bcrypt** ou **argon2**.

---

## 🧩 Contribuição

Contribuições são bem-vindas! Siga os passos abaixo:

1. **Fork** o repositório
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. Faça suas alterações e commit:
   ```bash
   git commit -m "feat: adiciona Mundo 5 com determinantes"
   ```
4. Envie para o seu fork:
   ```bash
   git push origin feature/minha-feature
   ```
5. Abra um **Pull Request** descrevendo as mudanças

### Convenção de Commits

| Prefixo | Uso |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Atualização de documentação |
| `style:` | Ajustes visuais/CSS sem mudança de lógica |
| `refactor:` | Refatoração de código |
| `test:` | Adição ou correção de testes |

### Ideias para Contribuição

- [ ] Mundo 5 — Determinantes e Inversas
- [ ] Página de Missões funcional
- [ ] Notificações de conquistas (badges)
- [ ] Exportar relatório de sala em PDF (docente)
- [ ] Substituir SHA-256 por bcrypt nas senhas
- [ ] Testes automatizados com pytest
- [ ] Deploy com Docker Compose

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License — Copyright (c) 2026 MatriVerse
```

---

<div align="center">

Feito com 💜 para tornar o aprendizado de matrizes mais divertido.

**[⬆ Voltar ao topo](#matriverse)**

</div>
