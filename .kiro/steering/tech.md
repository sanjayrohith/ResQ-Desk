# Tech Stack

## Frontend

- React 18 with TypeScript 5.8
- Vite 5.4 (dev server on port 8080, proxies `/analyze` to backend at `localhost:8000`)
- Tailwind CSS 3.4 with `tailwindcss-animate`
- shadcn/ui component library (Radix UI primitives + CVA)
- React Router DOM for routing
- TanStack React Query for server state
- Leaflet + react-leaflet for maps
- react-speech-recognition for browser speech-to-text
- Path alias: `@/` maps to `./src/`

## Backend

- Python 3.10+ with FastAPI
- Pydantic for request/response validation
- AWS Bedrock (Titan Text Express v1) for AI inference
- boto3 for AWS SDK
- Telegram Bot API (via `requests`) for volunteer notifications
- No database — units stored in `data/units.json`
- CORS fully open (dev mode)

## Common Commands

### Frontend (run from `frontend/`)

```bash
npm run dev        # Start dev server (port 8080)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint
```

### Backend (run from project root)

```bash
python -m venv venv && source venv/bin/activate
pip install fastapi uvicorn boto3 pydantic requests
uvicorn app.main:app --reload    # Start backend (port 8000)
```

## Environment Variables

- `VITE_API_URL` — Override backend URL in frontend (defaults to Render deployment URL)
- `MOCK_MODE` — Hardcoded bool in `backend/app/ai_engine.py` (toggle for demo vs real AI)
- Telegram credentials are hardcoded in `backend/app/telegram_notifier.py`
