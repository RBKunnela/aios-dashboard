# AIOS Dashboard

Real-time monitoring dashboard for Claude Code activity.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Claude Code   │────▶│  Monitor Server │────▶│     Dashboard   │
│   (CLI + Hooks) │     │  (Bun + SQLite) │     │  (Next.js + WS) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       stdin              HTTP POST              WebSocket
```

## Quick Start

### 1. Install Dependencies

```bash
# Dashboard (Next.js)
npm install

# Server (Bun)
cd server && bun install
```

### 2. Start the Server

```bash
cd server
bun run dev
```

Server runs on `http://localhost:4001`.

### 3. Start the Dashboard

```bash
npm run dev
```

Dashboard runs on `http://localhost:3000`.

### 4. Install Claude Code Hooks (Optional)

To capture real-time events from Claude Code:

```bash
./scripts/install-hooks.sh
```

## Structure

```
dashboard/
├── src/                 # Next.js app
├── server/              # Bun WebSocket server
│   ├── server.ts        # Main server
│   ├── db.ts            # SQLite database layer
│   └── types.ts         # TypeScript types
├── scripts/
│   └── install-hooks.sh # Hook installer
└── public/
```

## API Endpoints (Server)

| Endpoint                   | Method    | Description               |
| -------------------------- | --------- | ------------------------- |
| `POST /events`             | POST      | Receive events from hooks |
| `GET /events`              | GET       | Query events              |
| `GET /events/recent`       | GET       | Get recent events         |
| `GET /sessions`            | GET       | List all sessions         |
| `GET /sessions/:id`        | GET       | Get session details       |
| `GET /sessions/:id/events` | GET       | Get events for a session  |
| `GET /stats`               | GET       | Aggregated statistics     |
| `WS /stream`               | WebSocket | Real-time event stream    |
| `GET /health`              | GET       | Health check              |

## Configuration

### Environment Variables

| Variable                    | Default                     | Description          |
| --------------------------- | --------------------------- | -------------------- |
| `MONITOR_PORT`              | `4001`                      | Server port          |
| `MONITOR_DB`                | `~/.aios/monitor/events.db` | SQLite database path |
| `NEXT_PUBLIC_MONITOR_WS_URL`| `ws://localhost:4001/stream`| WebSocket URL        |

## Development

```bash
# Dashboard with hot reload
npm run dev

# Server with watch mode
cd server && bun --watch run server.ts

# Run tests
npm test
```

## License

MIT
