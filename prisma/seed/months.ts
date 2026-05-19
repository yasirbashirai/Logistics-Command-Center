import type { PrismaClient } from "@prisma/client";

// Month strategy from PLAN §17 (60-90 day outlook + M4-6).
// Drives extensibility — each new month gets its own theme, target, and budget.

export const months = [
  {
    monthNumber: 1,
    theme: "Foundation + first revenue",
    startDayNumber: 1,
    endDayNumber: 30,
    revenueTarget: 32000,   // mid-case PLAN §15.2: $26-51K
    mrrTarget: 2000,        // 2-4 retainers × $497-1497
    clientsTarget: 8,       // 6-10
    adBudget: 300,
    objectives: "Buy stack · Build LP · GHL live · 100+ past-clients contacted · 4800 cold emails sent · 1000 cold dials · 400 LinkedIn connects · 4 Loom teardowns published · First retainer pitches sent · M2 plan locked",
    retainerMix: "Target 2-4 retainers signed (Care/Growth). Focus: convert delivered clients to retainers Day 29-30.",
    notes: "M1 is validation phase. $300/mo paid likely closes 0-1. Cash from past-client warm + cold email + Fiverr/Upwork baseline.",
  },
  {
    monthNumber: 2,
    theme: "Scale outbound + first paid wins",
    startDayNumber: 31,
    endDayNumber: 60,
    revenueTarget: 50000,
    mrrTarget: 4500,        // 5-8 retainers active
    clientsTarget: 10,
    adBudget: 600,          // double M1 winner
    objectives: "Scale cold email to 10K/mo · Double winning ad creative · Launch Beehiiv newsletter · Pitch 2 podcasts/wk · Add Clay enrichment ($149/mo) · Run 1 quarterly value-drop to all past contacts · 5-8 retainers active",
    retainerMix: "Target 5-8 retainers (mix of Care $497 + Growth $997). MRR target $3K-6K.",
    notes: "Scale what worked M1. Kill losers. Don't expand >20%/48h on ads (reset Learning Phase).",
  },
  {
    monthNumber: 3,
    theme: "AI Dispatcher Agent™ flagship launch",
    startDayNumber: 61,
    endDayNumber: 90,
    revenueTarget: 80000,
    mrrTarget: 6500,        // 8-12 retainers active
    clientsTarget: 14,
    adBudget: 1200,
    objectives: "Launch AI Dispatcher Agent ($9.5K + $1.997K/mo) · First paid client closes (M3 = first clear ad ROI) · Newsletter to 50+ subs · 2 podcast episodes recorded · 6 Loom teardowns library · 8-12 retainers active",
    retainerMix: "8-12 retainers, MRR $5-8K. First Scale tier ($1,997) signed.",
    notes: "First true paid ROI month. Scale winner +20% per 48h. Consider hire #1 if at capacity.",
  },
  {
    monthNumber: 6,
    theme: "$10K MRR · 12-15 retainers · authority moat",
    startDayNumber: 151,
    endDayNumber: 180,
    revenueTarget: 100000,
    mrrTarget: 10000,
    clientsTarget: 18,
    adBudget: 2000,
    objectives: "$10K MRR locked · 12-15 retainer clients · 2-3 AI Dispatcher clients · 8+ public case studies · 200+ newsletter subs · 1+ podcast appearance/mo · Public lead magnet shipped ('2026 Freight Broker Tech Stack Guide')",
    retainerMix: "8 × Care ($497) + 4 × Growth ($997) + 1 × Scale ($1,997) = $9,929 ≈ $10K MRR",
    notes: "Authority phase. Brand is the moat. Pricing power increases. Selectively raise retainer rates.",
  },
];

export async function seedMonths(db: PrismaClient) {
  for (const m of months) {
    await db.month.create({ data: m });
  }
  console.log(`  ✓ Seeded ${months.length} months`);
}
