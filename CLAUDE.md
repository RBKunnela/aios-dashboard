# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIOS Dashboard is a real-time observability extension for [Synkra AIOS](https://github.com/SynkraAI/aios-core). It visualizes AIOS project data (stories, squads, agents, workflows) and streams Claude Code events in real-time. The dashboard is read-only — it observes the CLI, never controls it.

The project is in early development (v0.1.0).

## Commands

```bash
# Install dependencies (required before any other command)
npm install                    # Dashboard dependencies
cd server && bun install       # Monitor server dependencies (requires Bun)

# Development
npm run dev                    # Next.js dev server (http://localhost:3000)
npm run build                  # Production build
npm start                      # Start production server

# Code quality
npm run lint                   # ESLint
npm run typecheck              # tsc --noEmit

# Testing
npm test                       # Vitest (single run)
npm run test:watch             # Vitest (watch mode)
npx vitest run src/__tests__/squad-api-utils.test.ts  # Run a single test file

# Monitor server (Bun runtime, separate process)
cd server && bun run dev       # Dev with watch mode (http://localhost:4001)
cd server && bun run start     # Production
```

## Architecture

### Three-Component Pipeline

```
Claude Code (CLI + Hooks) → Monitor Server (Bun + SQLite) → Dashboard (Next.js + WebSocket)
```

1. **Python hooks** in `~/.claude/hooks/` capture Claude Code events (PreToolUse, PostToolUse, etc.) and POST them to the monitor server.
2. **Monitor server** (`server/`) — a Bun WebSocket server with SQLite storage — receives, persists, and broadcasts events.
3. **Dashboard** (`src/`) — a Next.js App Router app — connects via WebSocket for real-time events and reads AIOS project files (stories, squads) from the filesystem via API routes.

### Expected Project Layout

The dashboard is designed to live inside an AIOS project at `apps/dashboard/`. API routes resolve the project root by traversing up from the dashboard directory to find `.aios-core/`. Data sources:

- `docs/stories/` — Story markdown files with YAML frontmatter (parsed by gray-matter)
- `squads/` — Squad directories containing agents, tasks, workflows, checklists, templates
- `.aios-core/development/agents/` — Agent definitions

### Frontend Architecture

**Framework:** Next.js 16 App Router with React 19, Tailwind CSS v4, TypeScript (strict)

**Routing:** App Router with a `(dashboard)` layout group for sidebar navigation. Pages: kanban, agents, bob, terminals, monitor, settings, squads, github.

**State management:** Zustand stores in `src/stores/` — each domain has its own store. Key stores:
- `ui-store` — sidebar state, active view (persisted)
- `story-store` — stories CRUD, kanban column ordering, status change listeners (persisted)
- `monitor-store` — real-time events, sessions, filters, stats
- `squad-store` — squad data, connections, domain index
- `projects-store` — multi-project tab management

**Data fetching:** SWR hooks in `src/hooks/` fetch from Next.js API routes and sync results into Zustand stores. The `use-monitor-events` hook manages WebSocket connection to `ws://localhost:4001/stream` with auto-reconnection and exponential backoff.

**UI components:** shadcn/ui (new-york style) in `src/components/ui/`, domain components organized by feature in `src/components/{feature}/`. Layout components (AppShell, Sidebar, ProjectTabs, StatusBar) in `src/components/layout/`.

### Design System

Dark-mode-first with CSS custom properties in `src/app/globals.css`. Agent-specific semantic colors (dev=green, qa=yellow, architect=purple, pm=blue, po=orange, analyst=cyan, devops=pink). Status colors for success/warning/error/info/idle. Fonts: Geist Sans + Geist Mono.

### API Routes

All under `src/app/api/`. Key patterns:
- **Stories** (`/api/stories`) — reads `docs/stories/` from filesystem, parses YAML frontmatter
- **Squads** (`/api/squads`) — reads `squads/` directory structure, resolves metadata
- **Events** (`/api/events`) — SSE endpoint polling `.aios/dashboard/status.json`
- **Bob** (`/api/bob/`) — orchestration events and status

### Monitor Server (`server/`)

Bun-native server with no external dependencies. SQLite database at `~/.aios/monitor/events.db`. WebSocket broadcast on `/stream`. Automatic cleanup of events older than 24 hours. Port configurable via `MONITOR_PORT` env var (default 4001).

## Key Conventions

- **Path alias:** `@/*` maps to `src/*`
- **Barrel exports:** `src/components/index.ts`, `src/hooks/index.ts`, `src/stores/index.ts` re-export all modules
- **Types:** Centralized in `src/types/index.ts` — all domain types (Story, Agent, Squad, etc.) and enums
- **Utilities:** `cn()` in `src/lib/utils.ts` combines clsx + tailwind-merge
- **Icons:** `src/lib/icons.ts` maps string names to lucide-react components with size constants
- **Path safety:** `src/lib/squad-api-utils.ts` validates path segments before filesystem access in API routes

## Environment Variables

```bash
# .env.local
MONITOR_PORT=4001
MONITOR_DB=~/.aios/monitor/events.db
NEXT_PUBLIC_MONITOR_WS_URL=ws://localhost:4001/stream
```

## Testing

Tests live in `src/__tests__/`. Vitest with jsdom environment. Setup file (`src/__tests__/setup.ts`) mocks EventSource and fetch. Test files follow `*.test.{ts,tsx}` pattern.
