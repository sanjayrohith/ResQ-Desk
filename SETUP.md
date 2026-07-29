# Setup Guide

This document explains how to set up and run ResQ-Desk locally. The project is a
monorepo with two independent applications: a React frontend and a Python FastAPI
backend.

## Prerequisites

- Node.js 18+ (or Bun)
- Python 3.10+
- A modern browser with microphone access for speech recognition
  (Chrome 80+, Firefox 76+, Edge 80+; Safari 14+ has limited Speech API support)

## Frontend

Run these commands from the `frontend/` directory.

```bash
# 1. Install dependencies
npm install

# 2. Start the development server (http://localhost:8080)
npm run dev
```

The dev server proxies `/analyze` to the backend at `http://localhost:8000`.

### Available Scripts

```bash
npm run dev      # Start dev server with HMR (port 8080)
npm run build    # Production build
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

## Backend

Run these commands from the project root.

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install fastapi uvicorn boto3 pydantic requests

# 3. Start the backend (http://localhost:8000)
uvicorn app.main:app --reload
```

## Environment Variables

| Variable       | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| `VITE_API_URL` | Overrides the backend URL used by the frontend.                             |
| `MOCK_MODE`    | Boolean flag in `backend/app/ai_engine.py` to toggle mock AI responses.     |

Telegram credentials are configured in `backend/app/telegram_notifier.py`.

## Verifying the Setup

1. Start the backend, then the frontend.
2. Open http://localhost:8080 in a supported browser.
3. Activate push-to-talk and speak; the transcript should appear live and the
   incident form should auto-fill from the AI analysis.
