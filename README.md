# AIOS Dashboard: Observability Extension

[![Synkra AIOS](https://img.shields.io/badge/Synkra-AIOS-blue.svg)](https://github.com/SynkraAI/aios-core)
[![Licença: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Extensão de observabilidade em tempo real para o Synkra AIOS.**

> ⚠️ **Este projeto é uma extensão OPCIONAL.** O [Synkra AIOS](https://github.com/SynkraAI/aios-core) funciona 100% sem ele. O Dashboard existe apenas para **observar** o que acontece na CLI — ele nunca controla.

## Requisito: Projeto com AIOS Instalado

O Dashboard **precisa estar dentro de um projeto com AIOS instalado** porque ele lê e visualiza os documentos do framework (stories, epics, squads, workflows, etc).

```
meu-projeto/                      # Seu projeto com AIOS
├── .aios-core/                   # ← Core do framework (obrigatório)
│   ├── development/
│   │   ├── agents/               # Definições de agentes
│   │   ├── tasks/                # Workflows de tasks
│   │   └── templates/            # Templates de documentos
│   └── core/
├── docs/
│   ├── stories/                  # ← Stories que o dashboard visualiza
│   │   ├── active/
│   │   └── completed/
│   └── architecture/
├── squads/                       # ← Squads que o dashboard visualiza
├── apps/
│   └── dashboard/                # ← INSTALE O DASHBOARD AQUI
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

### Pré-requisitos

- Projeto com [Synkra AIOS](https://github.com/SynkraAI/aios-core) instalado
- Node.js >=18.0.0
- Bun (para o server)

### 1. Instale o AIOS no seu projeto (se ainda não tiver)

```bash
npx aios-core init meu-projeto
# ou em projeto existente:
cd meu-projeto && npx aios-core install
```

### 2. Clone o Dashboard dentro do projeto

```bash
cd meu-projeto
mkdir -p apps
cd apps
git clone https://github.com/SynkraAI/aios-dashboard.git dashboard
```

### 3. Instale as dependências

```bash
cd dashboard

# Dashboard (Next.js)
npm install

# Server (Bun)
cd server && bun install && cd ..
```

### 4. Inicie o Server

```bash
cd server
bun run dev
```

Server rodando em `http://localhost:4001`.

### 5. Inicie o Dashboard

```bash
npm run dev
```

Dashboard rodando em `http://localhost:3000`.

### 6. Instale os Hooks (Opcional - para eventos em tempo real)

```bash
./scripts/install-hooks.sh
```

Isso instala hooks Python em `~/.claude/hooks/` que capturam:

- `PreToolUse` — Antes da execução de ferramentas
- `PostToolUse` — Após execução (com resultados)
- `UserPromptSubmit` — Quando usuário envia prompt
- `Stop` — Quando Claude para
- `SubagentStop` — Quando um subagent (Task) para

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
| `GET /health`              | GET       | Health check              |

## Configuração

### Variáveis de Ambiente

| Variável                     | Default                       | Descrição            |
| ---------------------------- | ----------------------------- | -------------------- |
| `MONITOR_PORT`               | `4001`                        | Porta do server      |
| `MONITOR_DB`                 | `~/.aios/monitor/events.db`   | Path do SQLite       |
| `NEXT_PUBLIC_MONITOR_WS_URL` | `ws://localhost:4001/stream`  | URL do WebSocket     |

### Variáveis dos Hooks

| Variável                   | Default                  | Descrição                        |
| -------------------------- | ------------------------ | -------------------------------- |
| `AIOS_MONITOR_URL`         | `http://localhost:4001`  | URL do Monitor Server            |
| `AIOS_MONITOR_TIMEOUT_MS`  | `500`                    | Timeout HTTP para enviar eventos |

## Desenvolvimento

```bash
# Dashboard com hot reload
npm run dev

# Server com watch mode
cd server && bun --watch run server.ts

# Testes
npm test
```

## Troubleshooting

### Dashboard não mostra stories/squads

Verifique se o AIOS está instalado no projeto pai:

```bash
cd ../..  # voltar para raiz do projeto
ls -la .aios-core/  # deve existir
ls -la docs/stories/  # deve ter stories
```

### Eventos em tempo real não aparecem

1. Verifique se hooks estão instalados:
   ```bash
   ls ~/.claude/hooks/
   ```

2. Verifique se server está rodando:
   ```bash
   curl http://localhost:4001/health
   ```

### WebSocket não conecta

Configure `NEXT_PUBLIC_MONITOR_WS_URL` no `.env`:
```
NEXT_PUBLIC_MONITOR_WS_URL=ws://localhost:4001/stream
```

## Licença

MIT

---

<sub>Parte do ecossistema [Synkra AIOS](https://github.com/SynkraAI/aios-core) — CLI First, Observability Second, UI Third</sub>
