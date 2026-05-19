import type { PrismaClient } from "@prisma/client";

// KPIs from PLAN §15 + RESEARCH benchmarks.
// isHealthCheck = appears in the 6-ratio weekly traffic-light scorecard.

export const kpis = [
  // ─── North Star ───
  { key: "north-star-booked-calls-week", name: "Booked discovery calls (this week)", unit: "calls", category: "north-star", weeklyTarget: 8, monthlyTarget: 25, thresholdMin: 5, thresholdHigher: true, isNorthStar: true, description: "The ONE metric that matters per PLAN §18. Everything else feeds this.", failureMode: "If <5/wk by W4, stop ad spend + pause cold email + focus on past clients + warm pipeline" },

  // ─── 6 Health-Check Ratios (PLAN §15.3) ───
  { key: "cold-email-reply-rate", name: "Cold email reply rate %", unit: "%", category: "health-check", weeklyTarget: 8, monthlyTarget: 8, thresholdMin: 5, thresholdHigher: true, isHealthCheck: true, description: "Personalised cold emails", failureMode: "If <5%: personalise harder, rewrite subject, swap sequence" },
  { key: "cold-call-connect-rate", name: "Cold call connect rate %", unit: "%", category: "health-check", weeklyTarget: 20, monthlyTarget: 20, thresholdMin: 18, thresholdHigher: true, isHealthCheck: true, description: "Verified mobile direct-dial", failureMode: "If <18%: wrong numbers — use FMCSA direct-dial, switch list source" },
  { key: "linkedin-acceptance-rate", name: "LinkedIn acceptance rate %", unit: "%", category: "health-check", weeklyTarget: 40, monthlyTarget: 40, thresholdMin: 30, thresholdHigher: true, isHealthCheck: true, description: "Connection requests accepted", failureMode: "If <30%: soften CR copy, reduce daily volume to <25/day (LinkedIn throttles)" },
  { key: "discovery-show-rate", name: "Discovery show rate %", unit: "%", category: "health-check", weeklyTarget: 75, monthlyTarget: 75, thresholdMin: 70, thresholdHigher: true, isHealthCheck: true, description: "Booked → attended", failureMode: "If <70%: add 1-hour SMS reminder; check timezone misalignment" },
  { key: "discovery-close-rate", name: "Discovery close rate %", unit: "%", category: "health-check", weeklyTarget: 30, monthlyTarget: 30, thresholdMin: 25, thresholdHigher: true, isHealthCheck: true, description: "Attended → closed", failureMode: "If <25%: improve pitch, show case study earlier, refine objection handling" },
  { key: "lp-visitor-to-booked", name: "LP visitor → booked call %", unit: "%", category: "health-check", weeklyTarget: 8, monthlyTarget: 8, thresholdMin: 6, thresholdHigher: true, isHealthCheck: true, description: "Top-quartile for paid traffic", failureMode: "If <6%: test new hero copy variant, check form friction, validate CTA placement" },
  { key: "loom-sla-on-time-pct", name: "Loom delivered <24h %", unit: "%", category: "health-check", weeklyTarget: 100, monthlyTarget: 100, thresholdMin: 90, thresholdHigher: true, isHealthCheck: true, description: "Lead → audit delivered within 24 hours", failureMode: "Block 1 hour/day minimum for Loom recording in daily routine" },

  // ─── Volume KPIs ───
  { key: "total-emails-sent-week", name: "Total cold emails sent (week)", unit: "emails", category: "volume", weeklyTarget: 2000, monthlyTarget: 4800, thresholdMin: 1500, thresholdHigher: true, description: "8 mailboxes × 50/day × 5 days" },
  { key: "total-dials-week", name: "Total cold dials (week)", unit: "dials", category: "volume", weeklyTarget: 250, monthlyTarget: 1000, thresholdMin: 200, thresholdHigher: true },
  { key: "total-connects-week", name: "Total LinkedIn connects sent (week)", unit: "connects", category: "volume", weeklyTarget: 100, monthlyTarget: 400, thresholdMin: 80, thresholdHigher: true },

  // ─── Revenue / Outcome KPIs ───
  { key: "mrr-current", name: "Current MRR ($)", unit: "$", category: "revenue", weeklyTarget: 0, monthlyTarget: 3000, thresholdMin: 1000, thresholdHigher: true, description: "Active retainers × monthly rate" },
  { key: "month-cash-total", name: "Month cash total ($)", unit: "$", category: "revenue", weeklyTarget: 8000, monthlyTarget: 32000, thresholdMin: 20000, thresholdHigher: true, description: "Project + retainer + Fiverr/Upwork baseline" },
  { key: "closed-clients-month", name: "Closed direct clients (month)", unit: "clients", category: "revenue", weeklyTarget: 2, monthlyTarget: 8, thresholdMin: 6, thresholdHigher: true },
  { key: "past-clients-reengaged-month", name: "Past clients re-engaged (month)", unit: "contacts", category: "volume", weeklyTarget: 100, monthlyTarget: 100, thresholdMin: 100, thresholdHigher: true, description: "Plan target: 100+ by Day 30" },

  // ─── Content KPIs ───
  { key: "linkedin-posts-week", name: "LinkedIn posts (week)", unit: "posts", category: "content", weeklyTarget: 4, monthlyTarget: 16, thresholdMin: 3, thresholdHigher: true, description: "Mon carousel / Wed video / Fri text / Sun case study" },
  { key: "loom-teardowns-week", name: "Loom teardowns published (week)", unit: "teardowns", category: "content", weeklyTarget: 1, monthlyTarget: 4, thresholdMin: 1, thresholdHigher: true },
];

export async function seedKpis(db: PrismaClient) {
  for (const k of kpis) {
    await db.kpiDefinition.create({ data: k });
  }
  console.log(`  ✓ Seeded ${kpis.length} KPI definitions`);
}
