## CareerReady AI 2.0 (Futuristic Career Intelligence Platform)

Full‑stack monorepo:
- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion + Recharts + PWA
- **Backend**: FastAPI + PostgreSQL + JWT auth + Redis + OpenAI (optional)

### Key features implemented (v2 foundation)
- **Auth**: Register/Login/Refresh/Logout (JWT + refresh rotation in Redis), protected routes
- **Resume Analyzer**: PDF/DOCX upload, skill extraction, ATS score + suggestions
- **AI Career Predictor**: Top 5 roles with probability + explanation (OpenAI if configured, heuristic fallback)
- **AI Mock Interview (Text)**: Sessions, question generation, answer evaluation + XP
- **Dashboard + Readiness**: Summary metrics + company readiness (Google/Microsoft/Amazon)
- **Gamification**: XP + leaderboard (badges schema included)

### Project structure
- `backend/`: FastAPI app + Alembic migrations + backend env
- `/pages`, `/components`: React pages/components (Vite entry in `index.tsx`)

---

## Run locally

### 1) Frontend

```bash
npm install
npm run dev
```

Set API base in `.env` (or use defaults):

```bash
VITE_API_BASE_URL=http://localhost:8000
```

### 2) Backend

Create `backend/.env` from `backend/.env.example` and set:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- optional `OPENAI_API_KEY`

Run FastAPI:

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### 3) Database migrations

```bash
cd backend
python -m alembic -c alembic.ini upgrade head
```

---

## Deployment

See `DEPLOYMENT.md` for **Vercel (frontend)** + **Railway (backend + Postgres + Redis)**.
