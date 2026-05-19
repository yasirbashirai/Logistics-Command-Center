import type { PrismaClient } from "@prisma/client";

// 20 "do not do" rules from PLAN §16 + RESEARCH §1.
// severity: mandatory (account/legal risk) | recommended (strategic)

export const rules = [
  { rule: "Do NOT say 'AI' to logistics buyers", reason: "Market is in AI disillusionment trough (small-fleet active agentic AI usage dropped to 16.1%, 'not-using' doubled to 38.7%). Translate to outcome language only.", category: "positioning", severity: "mandatory", source: "RESEARCH §1", sortOrder: 1 },
  { rule: "Do NOT use HeyReach (banned by LinkedIn Feb 2025)", reason: "~40% of users restricted Q1 2026. Account loss risk. Use manual + Sales Nav + Dripify <25/day.", category: "platform", severity: "mandatory", source: "RESEARCH §1 + 05-channels", sortOrder: 2 },
  { rule: "Do NOT cold-SMS prospects", reason: "TCPA exposure $500–$1,500 per text without prior express written consent.", category: "legal", severity: "mandatory", source: "RESEARCH §1 + 05-channels", sortOrder: 3 },
  { rule: "Do NOT use Sora 2 (sunset Sept 24 2026)", reason: "API discontinued Sept 24, 2026. Don't build workflow on dying tool. Use Runway + HeyGen.", category: "platform", severity: "mandatory", source: "RESEARCH §1, §8", sortOrder: 4 },
  { rule: "Do NOT say 'Guaranteed' / 'Best' / '#1' / 'Make money' / 'FREE!' in Meta ads", reason: "Meta will ban ad account. B2B services language only.", category: "platform", severity: "mandatory", source: "RESEARCH §1 + 03-meta-tiktok", sortOrder: 5 },
  { rule: "Do NOT post your service in r/Truckers (or any r/logistics subreddit)", reason: "Permaban. Reddit is intel-only.", category: "platform", severity: "mandatory", source: "RESEARCH §1 + 05-channels", sortOrder: 6 },
  { rule: "Do NOT use personal-attributes targeting in Meta ads", reason: "Ads like 'Owner-operator? Read this.' flagged as personal attribute. Reword to 'Run a trucking business under 20 trucks?'", category: "platform", severity: "mandatory", source: "03-meta-tiktok", sortOrder: 7 },
  { rule: "Do NOT buy BuiltWith ($295/mo) in Month 1", reason: "Start with FMCSA + Apollo. Upgrade M2 if needed.", category: "strategic", severity: "recommended", source: "PLAN §4 + RESEARCH §1", sortOrder: 8 },
  { rule: "Do NOT run paid LinkedIn or Google ads in Month 1", reason: "Validate messaging organically first. CPL too high to learn from.", category: "strategic", severity: "recommended", source: "RESEARCH §1", sortOrder: 9 },
  { rule: "Do NOT claim AI without disclosure on platform ads", reason: "Sora 2 / HeyGen avatar undisclosed = ad rejection. Add 'AI-generated' overlay or label.", category: "platform", severity: "mandatory", source: "RESEARCH §1 + 03-meta-tiktok", sortOrder: 10 },
  { rule: "Do NOT exhibit at Manifest / MATS / TIA in Month 1", reason: "$2,295–$3,000 booth costs. Book M3+ after cashflow proven.", category: "strategic", severity: "recommended", source: "RESEARCH §1", sortOrder: 11 },
  { rule: "Do NOT try TikTok + Instagram + Twitter + everything at once", reason: "Pick: LinkedIn + email + phone + ONE content engine (weekly teardown) + ONE warm asset (past clients).", category: "strategic", severity: "recommended", source: "RESEARCH §1", sortOrder: 12 },
  { rule: "Do NOT use Calendly + Zapier — use GHL native scheduler", reason: "Adds failure points. GHL keeps lead data in one system.", category: "strategic", severity: "recommended", source: "PLAN §11 + 04-funnel", sortOrder: 13 },
  { rule: "Do NOT bulk-cold-call (200+ dials/day)", reason: "Quality > quantity. Personal warm intros via past clients beat 100 cold dials.", category: "strategic", severity: "recommended", source: "RESEARCH §1 + 02-buyer", sortOrder: 14 },
  { rule: "Do NOT build community / Skool / Circle in Month 1", reason: "Time sink. Cash now > audience.", category: "strategic", severity: "recommended", source: "PLAN §16", sortOrder: 15 },
  { rule: "Do NOT make long-form YouTube content in Month 1", reason: "Expensive solo. Hold for M4+. Short clips for TikTok/LinkedIn only.", category: "strategic", severity: "recommended", source: "PLAN §16 + RESEARCH §4", sortOrder: 16 },
  { rule: "Do NOT use 3+ CTAs on landing page", reason: "Single-CTA = +30% conversion vs multi-CTA. One primary, one subdued lead-magnet alt.", category: "strategic", severity: "mandatory", source: "PLAN §16 + 04-funnel", sortOrder: 17 },
  { rule: "Do NOT chase metrics that don't matter (followers, impressions)", reason: "Only booked-calls-per-week matters. Everything else is vanity.", category: "strategic", severity: "recommended", source: "PLAN §18", sortOrder: 18 },
  { rule: "Do NOT skip warmup before cold email sending", reason: "Goes to spam without 14-21 day warmup. Burns the domain forever.", category: "strategic", severity: "mandatory", source: "PLAN §4 + 05-channels", sortOrder: 19 },
  { rule: "Do NOT promise what your portfolio can't prove", reason: "Trust filter — 'Can I see other trucking clients?' is the #1 testing question. Have ready answer.", category: "positioning", severity: "mandatory", source: "02-buyer", sortOrder: 20 },
];

export async function seedCompliance(db: PrismaClient) {
  for (const r of rules) {
    await db.complianceRule.create({ data: r });
  }
  console.log(`  ✓ Seeded ${rules.length} compliance rules`);
}
