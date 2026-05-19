# Logistics Command Center

Personal operations dashboard for the 30-day **Logistics Solutions** agency plan + research (May 2026 - Yasir Bashir).

Turns the 1,269-line `PLAN.md` + 4,000-line research corpus into a daily-driver app: pre-seeded with 30 days of tasks, 25 paste-ready scripts, 15 channels, 29 tools, 6 buyer personas, 20 compliance rules, and 8 dated regulatory warnings.

## Stack

- Next.js 14 (App Router) · TypeScript · Tailwind CSS
- Prisma 6 + SQLite (local file, no server needed)
- @dnd-kit for pipeline kanban
- Lucide icons

## Quick start

```bash
npm install
npx prisma migrate dev          # creates dev.db
npx tsx prisma/seed.ts          # seeds all 10 modules
npm run dev                     # open http://localhost:3000
```

Re-seed any time to reset data: `npx tsx prisma/seed.ts`.

## Modules

| # | Module | Route | What it does |
|---|---|---|---|
| 1 | **Today** | `/today` | Daily command center — current day's tasks, quick-log buttons for daily cadence (emails / dials / connects / DMs), composite score, contextual scripts for today's stage, weekly health-check ratios |
| 2 | **30-Day Plan** | `/plan` | Week 1-4 calendar grid. Click a day → drill into the day's task list with paste-ready scripts |
| 3 | **KPIs** | `/kpis` | Real-time daily / weekly / monthly scoring · 6 health-check ratios (PLAN §15.3) · north-star tracker (booked calls/wk) · revenue rollup |
| 4 | **Pipeline** | `/pipeline` | 8-stage Kanban (New Lead → Audit Sent → Discovery Booked → Completed → Proposal → Won/Lost/Nurture). Drag leads, stale-flag at 14 days |
| 5 | **Scripts** | `/scripts` | 25 paste-ready templates: 3-step cold email sequences (carrier/broker/mover), 4-step LinkedIn DMs, cold-call opener, Loom audit, discovery script, ad scripts, referral asks |
| 6 | **Past Clients** | `/past-clients` | A/B/C segment tracker · status workflow (not-contacted → emailed → replied → booked → closed) · referral logger ($500/$500) |
| 7 | **Channels** | `/channels` | 15 outreach channels with active/paused/hold toggle · benchmarks · rules · primary vs secondary vs avoid |
| 8 | **Tools** | `/tools` | 29 tools · $264/mo M1 stack · status (active/holding/cancelled) · time-sensitive warnings (Sora sunset, HeyReach ban) |
| 9 | **Content** | `/content` | 4 LinkedIn posts/wk cadence · Loom teardown library (12 in 90d target) · case studies · ad creatives |
| 10 | **Brain** | `/brain` | 20 compliance rules · 6 buyer personas + objection handlers · 8 dated regulatory warnings · 18 if/then decision rules |

## Scoring engine

Daily score = (DailyTask points earned + RecurringTask volume hit %) / max possible. Surfaces in the topbar in real-time. Streak = consecutive days hitting ≥80%. North star = booked discovery calls this week (the metric §18 says actually matters).

## Re-seeding

The seed is idempotent — `npx tsx prisma/seed.ts` wipes and rebuilds all tables. Your KPI logs, score snapshots, and lead pipeline are wiped on re-seed, so only do it when you want a clean reset.

To preserve runtime data and just add new content, edit the seed files in `prisma/seed/*.ts` and run targeted updates.

## Editing the plan

Each module's data is in `prisma/seed/*.ts`:
- `plan.ts` — 30 days + tasks
- `recurring.ts` — daily cadence (cold emails / dials / connects)
- `kpis.ts` — 17 KPI definitions
- `scripts.ts` — 25 templates
- `channels.ts` · `tools.ts` · `personas.ts` · `compliance.ts` · `warnings.ts` · `decisions.ts`

Edit the file, re-seed, refresh.

## Files

```
src/
  app/
    layout.tsx              # sidebar + topbar shell
    today/page.tsx
    plan/page.tsx + plan/[day]/page.tsx
    kpis/page.tsx
    pipeline/page.tsx
    scripts/page.tsx
    past-clients/page.tsx
    channels/page.tsx
    tools/page.tsx
    content/page.tsx
    brain/page.tsx
  components/
    sidebar.tsx · topbar.tsx
    task-row.tsx · quick-log.tsx · kpi-log-form.tsx
    pipeline-board.tsx · new-lead-form.tsx
    script-card.tsx
    past-client-row.tsx · new-past-client-form.tsx
    channel-card.tsx
    tool-row.tsx
    content-item-row.tsx · new-content-form.tsx
  lib/
    db.ts          # Prisma singleton
    scoring.ts     # daily / weekly / monthly score · streak · north star · health checks
    actions.ts     # server actions: log KPI, toggle task, move lead, etc.
    dates.ts · utils.ts
prisma/
  schema.prisma   # 19 models covering all 10 modules
  seed.ts         # orchestrator
  seed/*.ts       # 9 seed files
```

## Roadmap

Phase 2 (post-MVP):
- Supabase sync for multi-device
- Real-time GHL pipeline sync
- Smartlead API integration (auto-pull reply rates)
- Meta Ads API (auto-pause underperformers per decision rules)
- CSV import for past-client bulk load
- Score history charts (daily snapshot already stored)
