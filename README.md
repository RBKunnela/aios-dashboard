# AIOS Dashboard: Observability Extension

[![Synkra AIOS](https://img.shields.io/badge/Synkra-AIOS-blue.svg)](https://github.com/SynkraAI/aios-core)
[![Licença: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Extensão de observabilidade em tempo real para o Synkra AIOS.**

> ⚠️ **Este projeto é uma extensão OPCIONAL.** O [Synkra AIOS](https://github.com/SynkraAI/aios-core) funciona 100% sem ele. O Dashboard existe apenas para **observar** o que acontece na CLI — ele nunca controla.

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

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Claude Code   │────▶│  Monitor Server │────▶│     Dashboard   │
│   (CLI + Hooks) │     │  (Bun + SQLite) │     │  (Next.js + WS) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       stdin              HTTP POST              WebSocket
```

**Componentes:**

| Componente | Tecnologia | Função |
|------------|------------|--------|
| **Hooks** | Python | Capturam eventos do Claude Code (PreToolUse, PostToolUse, etc.) |
| **Monitor Server** | Bun + SQLite | Recebe eventos via HTTP, armazena e transmite via WebSocket |
| **Dashboard** | Next.js | Visualiza eventos em tempo real |

## Quick Start

### Pré-requisitos

- [Synkra AIOS](https://github.com/SynkraAI/aios-core) instalado (`npx aios-core install`)
- Node.js >=18.0.0
- Bun (para o server)

### 1. Clone e instale

```bash
git clone https://github.com/SynkraAI/aios-dashboard.git
cd aios-dashboard

# Dashboard (Next.js)
npm install

# Server (Bun)
cd server && bun install && cd ..
```

### 2. Inicie o Server

```bash
cd server
bun run dev
```

Server rodando em `http://localhost:4001`.

### 3. Inicie o Dashboard

```bash
npm run dev
```

Dashboard rodando em `http://localhost:3000`.

### 4. Instale os Hooks (Opcional)

Para capturar eventos em tempo real do Claude Code:

```bash
./scripts/install-hooks.sh
```

Isso instala hooks Python em `~/.claude/hooks/` que capturam:

- `PreToolUse` — Antes da execução de ferramentas
- `PostToolUse` — Após execução (com resultados)
- `UserPromptSubmit` — Quando usuário envia prompt
- `Stop` — Quando Claude para
- `SubagentStop` — Quando um subagent (Task) para
- `Notification` — Notificações do Claude
- `PreCompact` — Antes da compactação de contexto

## Estrutura

```
aios-dashboard/
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

### Eventos não aparecem

1. Verifique se hooks estão instalados:
   ```bash
   ls ~/.claude/hooks/
   ```

2. Verifique se server está rodando:
   ```bash
   curl http://localhost:4001/health
   ```

3. Verifique logs do server para erros

### WebSocket não conecta

1. Configure `NEXT_PUBLIC_MONITOR_WS_URL` no `.env`:
   ```
   NEXT_PUBLIC_MONITOR_WS_URL=ws://localhost:4001/stream
   ```

2. Verifique console do browser para erros de conexão

## Relacionamento com AIOS Core

Este Dashboard é um **companion project** do [Synkra AIOS](https://github.com/SynkraAI/aios-core). Ele não faz parte do core e não é necessário para usar o AIOS.

**Para usar o AIOS Core:**
```bash
npx aios-core init meu-projeto
```

**Para adicionar observabilidade (este projeto):**
```bash
git clone https://github.com/SynkraAI/aios-dashboard.git
```

## Licença

MIT

---

<sub>Parte do ecossistema [Synkra AIOS](https://github.com/SynkraAI/aios-core) — CLI First, Observability Second, UI Third</sub>
