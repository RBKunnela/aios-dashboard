# AIOS Dashboard: Observability Extension

[![Synkra AIOS](https://img.shields.io/badge/Synkra-AIOS-blue.svg)](https://github.com/SynkraAI/aios-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-early%20development-orange.svg)]()
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](https://github.com/SynkraAI/aios-dashboard/issues)

**Real-time observability extension for Synkra AIOS.**

> 🚧 **EARLY DEVELOPMENT PHASE**
>
> This project is under active construction. Features may change, break, or be incomplete.
> **Contributions are very welcome!** Check the [open issues](https://github.com/SynkraAI/aios-dashboard/issues) or open a new one to suggest improvements.

> ⚠️ **This project is an OPTIONAL extension.** [Synkra AIOS](https://github.com/SynkraAI/aios-core) works 100% without it. The Dashboard exists only to **observe** what happens in the CLI — it never controls it.

## Requirement: Project with AIOS Installed

The Dashboard **must be inside a project with AIOS installed** because it reads and visualizes the framework's documents (stories, epics, squads, workflows, etc).

```
my-project/                       # ← You are here
├── .aios-core/                   # Framework core (required)
│   ├── development/
│   │   ├── agents/               # Agent definitions
│   │   ├── tasks/                # Task workflows
│   │   └── templates/            # Document templates
│   └── core/
├── docs/
│   ├── stories/                  # Stories visualized by the dashboard
│   │   ├── active/
│   │   └── completed/
│   └── architecture/
├── squads/                       # Squads visualized by the dashboard
├── apps/
│   └── dashboard/                # ← Dashboard installed here
│       ├── src/
│       ├── server/
│       └── README.md
├── .claude/
│   └── CLAUDE.md
└── package.json
```

**Without AIOS installed, the dashboard will have no documents to display.**

## Position in the AIOS Architecture

Synkra AIOS follows a strict architectural hierarchy:

```
CLI First → Observability Second → UI Third
```

| Layer               | Priority  | What it does                                                  |
| ------------------- | --------- | ------------------------------------------------------------- |
| **CLI**             | Highest   | Where the intelligence lives. All execution and decisions.    |
| **Observability**   | Secondary | Observe and monitor what happens in the CLI in real time.     |
| **UI**              | Tertiary  | Occasional management and visualizations when needed.         |

**This Dashboard operates in the Observability layer.** It captures CLI events via hooks and displays them in real time — but the CLI remains the source of truth.

### Principles this Dashboard respects

- ✅ **The CLI is the source of truth** — The Dashboard only observes, never controls
- ✅ **AIOS works 100% without the Dashboard** — No functionality depends on it
- ✅ **Observability is for understanding** — Not for modifying behavior

## What the Dashboard Visualizes

The Dashboard reads AIOS project documents and displays:

| Source | What it displays |
|--------|------------------|
| `docs/stories/` | Active stories, progress, checkboxes |
| `squads/` | Installed squads, agents, workflows |
| `.aios-core/development/agents/` | Available agents and their capabilities |
| `hooks` (real-time) | Claude Code events (tool use, prompts, etc) |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Claude Code   │────▶│  Monitor Server │────▶│     Dashboard   │
│   (CLI + Hooks) │     │  (Bun + SQLite) │     │  (Next.js + WS) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       stdin              HTTP POST              WebSocket
         │                                            │
         └────────────────────────────────────────────┘
                    Reads docs/, squads/, .aios-core/
```

**Components:**

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Hooks** | Python | Capture Claude Code events (PreToolUse, PostToolUse, etc.) |
| **Monitor Server** | Bun + SQLite | Receives events via HTTP, stores and broadcasts via WebSocket |
| **Dashboard** | Next.js | Visualizes events in real time + AIOS documents |

## Installation

> **All commands are executed from the root of your project (`my-project/`).**

### Prerequisites

- Project with [Synkra AIOS](https://github.com/SynkraAI/aios-core) installed
- Node.js >=18.0.0
- Bun (for the server)

### 1. Install AIOS in your project (if you haven't already)

```bash
# Create new project with AIOS
npx aios-core init my-project
cd my-project

# Or install in an existing project
npx aios-core install
```

### 2. Clone the Dashboard

```bash
# From the project root (my-project/)
mkdir -p apps
git clone https://github.com/SynkraAI/aios-dashboard.git apps/dashboard
```

### 3. Install dependencies

```bash
# Dashboard (Next.js)
npm install --prefix apps/dashboard

# Server (Bun)
cd apps/dashboard/server && bun install && cd ../../..
```

### 4. Start the Server

```bash
# From the project root
cd apps/dashboard/server && bun run dev
```

Server running at `http://localhost:4001`.

> **Tip:** Open a new terminal for the next step.

### 5. Start the Dashboard

```bash
# From the project root (new terminal)
npm run dev --prefix apps/dashboard
```

Dashboard running at `http://localhost:3000`.

### 6. Install Hooks (Optional — for real-time events)

```bash
# From the project root
apps/dashboard/scripts/install-hooks.sh
```

This installs Python hooks in `~/.claude/hooks/` that capture:

- `PreToolUse` — Before tool execution
- `PostToolUse` — After execution (with results)
- `UserPromptSubmit` — When user sends a prompt
- `Stop` — When Claude stops
- `SubagentStop` — When a subagent (Task) stops

## Quick Commands

Run all from the project root (`my-project/`):

```bash
# Install dependencies
npm install --prefix apps/dashboard
cd apps/dashboard/server && bun install && cd ../../..

# Start server (terminal 1)
cd apps/dashboard/server && bun run dev

# Start dashboard (terminal 2)
npm run dev --prefix apps/dashboard

# Install hooks
apps/dashboard/scripts/install-hooks.sh

# Check server health
curl http://localhost:4001/health
```

## Dashboard Structure

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

## Server API

| Endpoint                   | Method    | Description                |
| -------------------------- | --------- | -------------------------- |
| `POST /events`             | POST      | Receive events from hooks  |
| `GET /events`              | GET       | Query events               |
| `GET /events/recent`       | GET       | Recent events              |
| `GET /sessions`            | GET       | List sessions              |
| `GET /sessions/:id`        | GET       | Session details            |
| `GET /sessions/:id/events` | GET       | Events for a session       |
| `GET /stats`               | GET       | Aggregated statistics      |
| `WS /stream`               | WebSocket | Real-time event stream     |
| `GET /health`              | Health check               |

## Configuration

### Environment Variables

Create `apps/dashboard/.env.local`:

```bash
MONITOR_PORT=4001
MONITOR_DB=~/.aios/monitor/events.db
NEXT_PUBLIC_MONITOR_WS_URL=ws://localhost:4001/stream
```

### Hook Variables

| Variable                   | Default                  | Description                         |
| -------------------------- | ------------------------ | ----------------------------------- |
| `AIOS_MONITOR_URL`         | `http://localhost:4001`  | Monitor Server URL                  |
| `AIOS_MONITOR_TIMEOUT_MS`  | `500`                    | HTTP timeout for sending events     |

## Development

Run from the project root:

```bash
# Dashboard with hot reload
npm run dev --prefix apps/dashboard

# Server with watch mode
cd apps/dashboard/server && bun --watch run server.ts

# Tests
npm test --prefix apps/dashboard
```

## Troubleshooting

### Dashboard doesn't show stories/squads

Check that AIOS is installed:

```bash
# From the project root
ls -la .aios-core/     # should exist
ls -la docs/stories/   # should have stories
```

### Real-time events not appearing

```bash
# Hooks installed?
ls ~/.claude/hooks/

# Server running?
curl http://localhost:4001/health
```

### WebSocket not connecting

Check that `apps/dashboard/.env.local` exists with:

```
NEXT_PUBLIC_MONITOR_WS_URL=ws://localhost:4001/stream
```

## License

MIT

---

<sub>Part of the [Synkra AIOS](https://github.com/SynkraAI/aios-core) ecosystem — CLI First, Observability Second, UI Third</sub>
