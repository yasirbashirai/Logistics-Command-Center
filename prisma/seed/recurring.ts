import type { PrismaClient } from "@prisma/client";

// Daily-cadence tasks from PLAN.md §14 — active Days 8-30 (after warmup).
// Logging an actual count vs target produces points → daily score.

export const recurring = [
  { key: "cold-emails-sent", title: "Cold emails sent", category: "outreach", target: 400, unit: "emails", pointsPerUnit: 0.05, activeFromDay: 10, activeToDay: 365, description: "8 mailboxes × 50/day = 400/day total send volume (Smartlead)", benchmark: "Reply 3–5% baseline, 18% with full personalisation" },
  { key: "cold-calls-dialed", title: "Cold calls dialed", category: "outreach", target: 50, unit: "dials", pointsPerUnit: 0.4, activeFromDay: 9, activeToDay: 365, description: "Verified mobile direct-dial from FMCSA SAFER", benchmark: "Connect 18–22%, dial-to-meeting 2.3–8%" },
  { key: "linkedin-connects-sent", title: "LinkedIn connection requests sent", category: "outreach", target: 20, unit: "connects", pointsPerUnit: 0.75, activeFromDay: 9, activeToDay: 365, description: "Manual via Sales Nav. Stay <25/day to avoid LinkedIn throttle", benchmark: "Acceptance 35–50%, throttle if <30%" },
  { key: "linkedin-dms-sent", title: "LinkedIn DMs sent (post-accept)", category: "outreach", target: 5, unit: "DMs", pointsPerUnit: 2, activeFromDay: 10, activeToDay: 365, description: "4-step sequence: thanks → voice → unprompted Loom → soft CTA", benchmark: "~8% reply rate after accept" },
  { key: "creator-comments", title: "Thoughtful comments on creator posts", category: "outreach", target: 5, unit: "comments", pointsPerUnit: 2, activeFromDay: 9, activeToDay: 365, description: "Logistics creators / brokers / carriers — value-first, no pitch", benchmark: "Compounding inbound 2–3 months out" },
  { key: "discovery-calls-booked", title: "Discovery calls booked TODAY", category: "outreach", target: 1, unit: "calls", pointsPerUnit: 50, activeFromDay: 9, activeToDay: 365, description: "This is the NORTH STAR per PLAN §18. The metric that actually matters.", benchmark: "Target 5/week by Week 4" },
  { key: "discovery-calls-held", title: "Discovery calls held", category: "outreach", target: 1, unit: "calls", pointsPerUnit: 40, activeFromDay: 12, activeToDay: 365, description: "Use 15-min script (6 phases). Record via Fathom.", benchmark: "Show rate ≥70%, close ≥25%" },
  { key: "proposals-sent", title: "Proposals sent", category: "outreach", target: 1, unit: "proposals", pointsPerUnit: 30, activeFromDay: 15, activeToDay: 365, description: "Sent within 10 min of call end. GHL template, 3 tiers.", benchmark: "Close 20%+" },
  { key: "looms-recorded", title: "Loom audits recorded", category: "content", target: 1, unit: "looms", pointsPerUnit: 20, activeFromDay: 7, activeToDay: 365, description: "60–90 sec custom audit. <24h SLA from request.", benchmark: "End-card CTA → call 15–25%" },
  { key: "past-client-replies", title: "Past-client replies received", category: "outreach", target: 0, unit: "replies", pointsPerUnit: 15, activeFromDay: 6, activeToDay: 365, description: "Track inbound. Expect ~15% reply on warm list.", benchmark: "Warm list 15–25% reply" },
];

export async function seedRecurring(db: PrismaClient) {
  for (const r of recurring) {
    await db.recurringTask.create({ data: r });
  }
  console.log(`  ✓ Seeded ${recurring.length} recurring daily-cadence tasks`);
}
