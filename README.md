# AIOS Dashboard: Observability Extension

[![Synkra AIOS](https://img.shields.io/badge/Synkra-AIOS-blue.svg)](https://github.com/SynkraAI/aios-core)
[![Licença: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Extensão de observabilidade em tempo real para o Synkra AIOS.**

> ⚠️ **Este projeto é uma extensão OPCIONAL.** O [Synkra AIOS](https://github.com/SynkraAI/aios-core) funciona 100% sem ele. O Dashboard existe apenas para **observar** o que acontece na CLI — ele nunca controla.

## Requisito: Projeto com AIOS Instalado

O Dashboard **precisa estar dentro de um projeto com AIOS instalado** porque ele lê e visualiza os documentos do framework (stories, epics, squads, workflows, etc).

```
meu-projeto/                      # ← Você está aqui
├── .aios-core/                   # Core do framework (obrigatório)
│   ├── development/
│   │   ├── agents/               # Definições de agentes
│   │   ├── tasks/                # Workflows de tasks
│   │   └── templates/            # Templates de documentos
│   └── core/
├── docs/
│   ├── stories/                  # Stories que o dashboard visualiza
│   │   ├── active/
│   │   └── completed/
│   └── architecture/
├── squads/                       # Squads que o dashboard visualiza
├── apps/
│   └── dashboard/                # ← Dashboard instalado aqui
│       ├── src/
│       ├── server/
│       └── README.md
├── .claude/
│   └── CLAUDE.md
└── package.json
```

**Sem o AIOS instalado, o dashboard não terá documentos para exibir.**

## Posição na Arquitetura AIOS

O Synkra AIOS segue uma hierarquia arquitetural rígida:

```
CLI First → Observability Second → UI Third
```

| Camada            | Prioridade | O que faz                                                    |
| ----------------- | ---------- | ------------------------------------------------------------ |
| **CLI**           | Máxima     | Onde a inteligência vive. Toda execução e decisões.          |
| **Observability** | Secundária | Observar e monitorar o que acontece no CLI em tempo real.    |
| **UI**            | Terciária  | Gestão pontual e visualizações quando necessário.            |

**Este Dashboard opera na camada de Observability.** Ele captura eventos da CLI via hooks e os exibe em tempo real — mas a CLI continua sendo a fonte da verdade.

### Princípios que este Dashboard respeita

- ✅ **A CLI é a fonte da verdade** — O Dashboard apenas observa, nunca controla
- ✅ **O AIOS funciona 100% sem Dashboard** — Nenhuma funcionalidade depende dele
- ✅ **Observabilidade serve para entender** — Não para modificar comportamento

## O que o Dashboard Visualiza

O Dashboard lê documentos do projeto AIOS e exibe:

| Fonte | O que exibe |
|-------|-------------|
| `docs/stories/` | Stories ativas, progresso, checkboxes |
| `squads/` | Squads instalados, agentes, workflows |
| `.aios-core/development/agents/` | Agentes disponíveis e suas capacidades |
| `hooks` (tempo real) | Eventos do Claude Code (tool use, prompts, etc) |

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Claude Code   │────▶│  Monitor Server │────▶│     Dashboard   │
│   (CLI + Hooks) │     │  (Bun + SQLite) │     │  (Next.js + WS) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       stdin              HTTP POST              WebSocket
         │                                            │
         └────────────────────────────────────────────┘
                    Lê docs/, squads/, .aios-core/
```

**Componentes:**

| Componente | Tecnologia | Função |
|------------|------------|--------|
| **Hooks** | Python | Capturam eventos do Claude Code (PreToolUse, PostToolUse, etc.) |
| **Monitor Server** | Bun + SQLite | Recebe eventos via HTTP, armazena e transmite via WebSocket |
| **Dashboard** | Next.js | Visualiza eventos em tempo real + documentos AIOS |

## Instalação

> **Todos os comandos são executados a partir da raiz do seu projeto (`meu-projeto/`).**

### Pré-requisitos

- Projeto com [Synkra AIOS](https://github.com/SynkraAI/aios-core) instalado
- Node.js >=18.0.0
- Bun (para o server)

### 1. Instale o AIOS no seu projeto (se ainda não tiver)

```bash
# Criar novo projeto com AIOS
npx aios-core init meu-projeto
cd meu-projeto

# Ou instalar em projeto existente
npx aios-core install
```

### 2. Clone o Dashboard

```bash
# A partir da raiz do projeto (meu-projeto/)
mkdir -p apps
git clone https://github.com/SynkraAI/aios-dashboard.git apps/dashboard
```

### 3. Instale as dependências

```bash
# Dashboard (Next.js)
npm install --prefix apps/dashboard

# Server (Bun)
cd apps/dashboard/server && bun install && cd ../../..
```

### 4. Inicie o Server

```bash
# A partir da raiz do projeto
cd apps/dashboard/server && bun run dev
```

Server rodando em `http://localhost:4001`.

> **Dica:** Abra um novo terminal para o próximo passo.

### 5. Inicie o Dashboard

```bash
# A partir da raiz do projeto (novo terminal)
npm run dev --prefix apps/dashboard
```

Dashboard rodando em `http://localhost:3000`.

### 6. Instale os Hooks (Opcional - para eventos em tempo real)

```bash
# A partir da raiz do projeto
apps/dashboard/scripts/install-hooks.sh
```

Isso instala hooks Python em `~/.claude/hooks/` que capturam:

- `PreToolUse` — Antes da execução de ferramentas
- `PostToolUse` — Após execução (com resultados)
- `UserPromptSubmit` — Quando usuário envia prompt
- `Stop` — Quando Claude para
- `SubagentStop` — Quando um subagent (Task) para

## Comandos Rápidos

Execute todos a partir da raiz do projeto (`meu-projeto/`):

```bash
# Instalar dependências
npm install --prefix apps/dashboard
cd apps/dashboard/server && bun install && cd ../../..

# Iniciar server (terminal 1)
cd apps/dashboard/server && bun run dev

# Iniciar dashboard (terminal 2)
npm run dev --prefix apps/dashboard

# Instalar hooks
apps/dashboard/scripts/install-hooks.sh

# Verificar health do server
curl http://localhost:4001/health
```

## Estrutura do Dashboard

```
apps/dashboard/
├── src/                    # Next.js app
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks (useMonitorEvents, etc.)
│   └── lib/                # Utilities
├── server/                 # Bun WebSocket server
│   ├── server.ts           # Main server
│   ├── db.ts               # SQLite database layer
│   └── types.ts            # TypeScript types
├── scripts/
│   └── install-hooks.sh    # Hook installer
└── public/
```

## API do Server

| Endpoint                   | Método    | Descrição                 |
| -------------------------- | --------- | ------------------------- |
| `POST /events`             | POST      | Recebe eventos dos hooks  |
| `GET /events`              | GET       | Query eventos             |
| `GET /events/recent`       | GET       | Eventos recentes          |
| `GET /sessions`            | GET       | Lista sessões             |
| `GET /sessions/:id`        | GET       | Detalhes da sessão        |
| `GET /sessions/:id/events` | GET       | Eventos de uma sessão     |
| `GET /stats`               | GET       | Estatísticas agregadas    |
| `WS /stream`               | WebSocket | Stream de eventos em tempo real |
| `GET /health`              | Health check              |

## Configuração

### Variáveis de Ambiente

Crie `apps/dashboard/.env.local`:

```bash
MONITOR_PORT=4001
MONITOR_DB=~/.aios/monitor/events.db
NEXT_PUBLIC_MONITOR_WS_URL=ws://localhost:4001/stream
```

### Variáveis dos Hooks

| Variável                   | Default                  | Descrição                        |
| -------------------------- | ------------------------ | -------------------------------- |
| `AIOS_MONITOR_URL`         | `http://localhost:4001`  | URL do Monitor Server            |
| `AIOS_MONITOR_TIMEOUT_MS`  | `500`                    | Timeout HTTP para enviar eventos |

## Desenvolvimento

Execute a partir da raiz do projeto:

```bash
# Dashboard com hot reload
npm run dev --prefix apps/dashboard

# Server com watch mode
cd apps/dashboard/server && bun --watch run server.ts

# Testes
npm test --prefix apps/dashboard
```

## Troubleshooting

### Dashboard não mostra stories/squads

Verifique se o AIOS está instalado:

```bash
# A partir da raiz do projeto
ls -la .aios-core/     # deve existir
ls -la docs/stories/   # deve ter stories
```

### Eventos em tempo real não aparecem

```bash
# Hooks instalados?
ls ~/.claude/hooks/

# Server rodando?
curl http://localhost:4001/health
```

### WebSocket não conecta

Verifique se `apps/dashboard/.env.local` existe com:

```
NEXT_PUBLIC_MONITOR_WS_URL=ws://localhost:4001/stream
```

## Licença

MIT

---

<sub>Parte do ecossistema [Synkra AIOS](https://github.com/SynkraAI/aios-core) — CLI First, Observability Second, UI Third</sub>
