## Deployment guide (Vercel + Railway)

### Frontend on Vercel
- **Build command**: `npm run build`
- **Output**: `dist`
- **Environment variables**:
  - `VITE_API_BASE_URL`: your Railway backend URL (example: `https://careerready-api.up.railway.app`)

Notes:
- The project uses **HashRouter**, so deep links won’t 404 on static hosting.
- PWA is enabled via `vite-plugin-pwa`.

### Backend + Postgres + Redis on Railway

#### Services
Create 3 Railway services:
- **PostgreSQL**
- **Redis**
- **Backend** (this repo, folder `backend/`)

#### Backend environment variables
Set these in Railway backend service:
- `ENV=prod`
- `DATABASE_URL` (use Railway Postgres connection string; must be `postgresql+asyncpg://...`)
- `REDIS_URL` (use Railway Redis connection string)
- `JWT_SECRET` (strong random string, 32+ chars)
- `JWT_ISSUER=careerready-ai-2.0`
- optional `OPENAI_API_KEY`
- `CORS_ORIGINS` (comma-separated): include your Vercel URL

#### Start command
Use:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

#### Migrations
After first deploy, run (Railway shell):

```bash
python -m alembic -c alembic.ini upgrade head
```

---

## Production checklist
- Rotate `JWT_SECRET`
- Set strict `CORS_ORIGINS` to only your Vercel domains
- Add rate limiting (Redis) + request logging policies
- Add S3 (or Railway Volume) if you want to store uploaded resumes long‑term

