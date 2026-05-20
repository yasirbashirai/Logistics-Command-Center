# Deploy Logistics Command Center to Vercel

Step-by-step. Total time: ~15 minutes once you have accounts.

## Prerequisites

- GitHub account (for git hosting)
- Vercel account ([vercel.com](https://vercel.com) — free)
- Neon or Vercel Postgres account (free tier fine)
- Optional: Anthropic API key (for AI chatbot)
- Optional: Ayrshare account (for social posting)

## 1. Push to GitHub

```bash
cd "/Users/yasirbashir/Claude code 2026/logistics-command-center"
gh repo create logistics-command-center --private --source=. --remote=origin --push
```

(Or manually: create a repo on github.com, then `git remote add origin <url>` + `git push -u origin main`.)

## 2. Switch DB provider to Postgres

Open `prisma/schema.prisma`. Change line 8:

```diff
 datasource db {
-  provider = "sqlite"
+  provider = "postgresql"
   url      = env("DATABASE_URL")
 }
```

Then either delete the SQLite migrations and create a fresh Postgres one:

```bash
rm -rf prisma/migrations
npx prisma migrate dev --name init_postgres
```

(Or keep your local SQLite migrations and only switch on the prod branch.)

## 3. Provision Postgres

**Option A — Neon (recommended, free tier):**
- Go to [neon.tech](https://neon.tech) → New Project
- Copy the connection string (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)

**Option B — Vercel Postgres:**
- In Vercel project → Storage tab → Create → Postgres → connect to project
- `DATABASE_URL` is auto-set

## 4. Deploy to Vercel

```bash
npx vercel
```

Or via UI:
- vercel.com → New Project → Import your GitHub repo
- Framework preset: Next.js (auto-detected)
- Build command: `prisma generate && next build`
- Click Deploy

## 5. Set environment variables in Vercel

Project → Settings → Environment Variables. Add:

| Variable | Value | Required? |
|---|---|---|
| `DATABASE_URL` | Postgres connection string from step 3 | **YES** |
| `APP_PASSWORD` | Any strong password — gates the dashboard | **YES (prod)** |
| `ANTHROPIC_API_KEY` | From [console.anthropic.com](https://console.anthropic.com) | Optional — enables AI chatbot |
| `AYRSHARE_API_KEY` | From [ayrshare.com](https://www.ayrshare.com) | Optional — enables auto-posting |

Redeploy after setting.

## 6. Initialize the database

After first deploy, run the migration + seed against your Postgres DB:

```bash
# From your local machine, point at production DB temporarily:
DATABASE_URL="postgresql://...neon.tech..." npx prisma migrate deploy
DATABASE_URL="postgresql://...neon.tech..." npx tsx prisma/seed.ts
```

Or set up a `vercel.json` postbuild script (advanced).

## 7. Visit your dashboard

- `https://your-project.vercel.app` → redirected to `/login`
- Enter the `APP_PASSWORD` you set in step 5
- Done.

## Custom domain

Vercel project → Settings → Domains → add `dashboard.yasirbashir.com` (or any subdomain). Vercel gives you the DNS records to add to Cloudflare/your registrar.

## Scheduled-post publishing (cron worker)

Real-time social posting requires a worker that processes `ScheduledPost` rows. Add a Vercel Cron job:

**vercel.json:**
```json
{
  "crons": [
    { "path": "/api/cron/publish-scheduled", "schedule": "0 0 * * *" }
  ]
}
```

**Hobby plan limit:** Vercel Hobby tier only allows daily crons (one run per day). The default schedule is `0 0 * * *` (midnight UTC). For more frequent publishing (every 5 min / every hour), upgrade to Pro and change the schedule string. Manual trigger is always available — visit `https://your-domain.vercel.app/api/cron/publish-scheduled` from a browser to drain the queue on demand.

Implement `/api/cron/publish-scheduled` to:
1. Query `ScheduledPost` where `status = "queued"` AND `scheduledFor <= now()`.
2. For each, call Ayrshare API (or per-platform API) using stored credentials.
3. Update post status to `published` or `failed`.

(Skeleton commented in the codebase — wire up when you've connected at least one social account.)

## Re-seeding production

To wipe + re-seed prod (DESTRUCTIVE — wipes your KPI logs, scores, leads):

```bash
DATABASE_URL="postgresql://...neon.tech..." npx tsx prisma/seed.ts
```

The seed is idempotent — wipes all tables, re-creates from `prisma/seed/*.ts`.

## Backups

Free tier Neon has point-in-time recovery up to 7 days. For longer:

```bash
# Local backup
DATABASE_URL="postgresql://..." pg_dump --no-owner > backup-$(date +%Y%m%d).sql

# Restore
DATABASE_URL="postgresql://..." psql < backup-20260520.sql
```

## Troubleshooting

- **"Module not found: @prisma/client"** → make sure `prisma generate` runs in Vercel build. The build command should be `prisma generate && next build`.
- **Redirect loop on /login** → `APP_PASSWORD` not set in Vercel, or cookie domain mismatch. Set the env var + redeploy.
- **Chatbot says "no_api_key"** → set `ANTHROPIC_API_KEY` in Vercel env.
- **Toast notifications missing** → hard refresh (the sonner CSS is in the build).
