# Project Structure

Monorepo with two independent applications: a React frontend and a Python FastAPI backend.

```
/
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── pages/Index.tsx      # Main dashboard page (single-page app, essentially)
│   │   ├── components/
│   │   │   ├── dashboard/       # Domain components (Header, LiveCall, LiveTranscription, IncidentDetails, MapPanel, DispatchPopup)
│   │   │   └── ui/             # shadcn/ui primitives (do not edit manually, use shadcn CLI)
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/utils.ts        # Tailwind merge utility
│   ├── public/                 # Static assets
│   ├── tailwind.config.ts
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI entry point, single POST /analyze route
│   │   ├── ai_engine.py        # AI integration (Bedrock + mock mode)
│   │   ├── orchestrator.py     # Business logic: maps emergency → capability → best unit
│   │   ├── resources.py        # Reads units.json, filters by availability/capability
│   │   ├── schemas.py          # Pydantic models (TranscriptInput, AIAnalysis, IncidentResponse, FrontendResponse)
│   │   └── telegram_notifier.py # Sends formatted alerts to Telegram
│   └── data/
│       └── units.json          # Static emergency unit database
```

## Conventions

- Frontend uses barrel exports (`index.ts`) for dashboard components
- Backend follows a layered pipeline: API → AI Engine → Orchestrator → Resources → Notifier
- The `ui/` directory is managed by shadcn/ui — add components via CLI, don't hand-edit
- All frontend paths use the `@/` alias (resolves to `src/`)
- Backend has no test suite or dependency lockfile currently
